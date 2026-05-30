---
title: Scoreboarding (Thorntonův algoritmus)
---

# Scoreboarding — první dynamické plánování (CDC 6600, 1964)

Scoreboarding (James Thornton, 1964, CDC 6600) je *nejstarší* hardware mechanizmus pro out-of-order vydávání. **Sleduje stav** všech rozpracovaných instrukcí v tabulce a vydává je *jen pokud* nehrozí konflikt. Vyřeší **RAW, WAR, WAW** zastavením; nemá *přejmenování*. Předchůdce [[tomasulo]].

## Motivace

V in-order pipeline `i_n` stagnuje, dokud `i_{n-1}` neuvolní funkční jednotku nebo registr. To plýtvá příležitostmi — `i_{n+1}` mohla být dávno hotová, ale nedostala se na řadu.

Thornton: udělat tabulku, která sleduje "kdo dělá co" a vydávat instrukce **out-of-order**, jakmile není konflikt.

## Architektura CDC 6600

CDC 6600 měla:

- **10 funkčních jednotek** (1 branch, 1 boolean, 1 shift, 1 fixed/long add, 1 FP add, 1 FP divide, 2 FP multiply, 2 increment) — paralelní.
- **24 registrů** (8 address + 8 index + 8 floating-point).
- **Scoreboard** — centrální tabulka, která rozhoduje o vydávání.

Cíl: udržet všech 10 FJ vytížených.

## Čtyři fáze instrukce

V scoreboard prochází každá instrukce čtyřmi *fázemi* (žádná z nich není pipeline stupeň — instrukce čeká v každé fázi *libovolnou dobu*):

| Fáze | Podmínka přechodu | Co dělá |
| :--- | :--- | :--- |
| **Issue** | FJ volná + cílový registr nemá pending zápis | rozesle instrukci do FJ |
| **Read operands** | žádná čekající dřívější instrukce nepíše do mých zdrojů | načte operandy z register file |
| **Execute** | (FJ ji provádí, libovolný počet taktů) | spočítá výsledek |
| **Write result** | žádná dřívější instrukce nečte z mého cíle | zapíše do registr file |

Mezifáze čeká, dokud podmínka neplatí. Scoreboard průběžně updatuje stavy.

## Tři tabulky scoreboardu

Scoreboard má tři tabulky, dohromady popisují stav:

### 1. Instruction status

Pro každou rozpracovanou instrukci: kterou fází právě prochází (Issue, Read, Exec, Write).

| Instrukce | Issue | Read | Exec | Write |
| :--- | :---: | :---: | :---: | :---: |
| `fmul f0, f2, f4` | ✓ | ✓ | ✓ | — |
| `fadd f6, f0, f8` | ✓ | — | — | — |

### 2. Functional unit status

Pro každou FJ: zda je *busy*, jakou *operaci* dělá, jakou *cílovou registraci* a jaké *zdroje* (registr + příznak ready).

| FJ | Busy | Op | Dst | Src1 | Src2 | F1 ready? | F2 ready? |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Mult1 | ano | × | f0 | f2 | f4 | ano | ano |
| Add | ano | + | f6 | f0 | f8 | **ne** (Mult1) | ano |

### 3. Register result status

Pro každý registr: která FJ ho píše (pokud nějaká).

| Registr | f0 | f2 | f4 | f6 | f8 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Píše | Mult1 | — | — | Add | — |

## Pravidla scoreboard

### Issue

Instrukce *může* vstoupit do FJ, **pokud**:

1. FJ není busy *(structural hazard)*,
2. Žádná dřívější instrukce nepíše do mého cíle *(prevent WAW)*.

Pokud podmínka selže, *celý front-end stagnuje* (in-order issue).

### Read operands

Instrukce čte operandy, **pokud** žádná dřívější instrukce nepíše do mých zdrojů *(prevent RAW)*.

To je *řešení RAW* — instrukce *čeká*, dokud zdroj nebude *unblocked* (předchozí FJ zapíše a uvolní register result status).

### Execute

Probíhá. FJ může trvat 1-40 taktů (FP divide trvá nejdéle).

### Write result

Instrukce *zapíše* do registr file, **pokud** žádná dřívější instrukce nečte z mého cíle *(prevent WAR)*.

Toto je *řešení WAR*. Pokud `i2` zapisuje do `f8`, ale `i1` (vydaná dřív) ještě nepřečetla `f8` ve fázi Read operands, `i2` čeká *před* Write result.

## Příklad

```asm
i1: fdiv f0, f2, f4        ; pomalé (40 cyklů)
i2: fadd f6, f0, f8        ; čeká na f0 (RAW)
i3: fsub f8, f10, f14      ; WAR na f8 (i2 čte f8)
```

Průběh:

- **Takt 1**: i1 Issue (FJ Divide). 
- **Takt 2**: i1 Read operands (f2, f4 ready). i2 Issue (FJ Add).
- **Takt 3**: i1 Execute (poběží 40 taktů). i2 stagnuje v Read (čeká na f0). i3 Issue (FJ FX).
- **Takt 4**: i3 Read operands (f10, f14 ready). 
- **Takt 5**: i3 Execute. i3 *dokončí*, ale **nemůže Write** — i2 ještě nečetla f8 → WAR. i3 čeká před WB.
- **Takt 42**: i1 Write result (f0 hotová). 
- **Takt 43**: i2 Read operands (f0, f8 ready) → WAR na f8 zmizí.
- **Takt 44**: i3 Write result (*povoleno*, i2 už přečetla f8). i2 Execute.
- **Takt 50**: i2 Write result.

i3 dokončí výpočet už v taktu 5, ale kvůli WAR na f8 musí čekat ve frontě před Write result, dokud i2 nepřečte f8 (takt 43) — tedy **~38 taktů promarněných stagnací**.

::: viz scoreboard-trace "Krokuj 6-instrukční FP program přes Issue / Read / Execute / Write fáze. Stalls (STR / WAW / WAR) se zvýrazní u dotčené instrukce."
:::

## Limity scoreboardu

1. **Žádné přejmenování** — WAR a WAW se *řeší stagnací*, ne *eliminací*. Dlouhé chainy zpomalí jádro.
2. **Centrální tabulka** — scale-up obtížné. CDC 6600 měla 10 FJ, dnešní CPU 20-30.
3. **Bez forwardingu** — výsledek se musí *zapsat* do registr file, *pak* další instrukce čte. Zbytečné WB→Read→Exec čekání. Tomasulo to vyřeší **Common Data Bus**.
4. **No speculation** — scoreboard *neumí* spekulovat za skok.
5. **Issue in-order** — pokud první instrukce ve frontě nemůže Issue, *celá fronta čeká*.

## Význam dnes

Scoreboard byl *první* hardware OoO. Dnes je nahrazen Tomasulem (1967) ve všech high-perf CPU. Ale **přístup tabulkou + fázemi** je živý — i moderní OoO ROB je jeho potomek.

Některé in-order CPU s víceтаktovými FJ (ARM Cortex-A7, low-power IoT chipy) používají *zjednodušený* scoreboard pro detekci konfliktů FP, aby umožnily out-of-completion (instrukce končí v jiném pořadí, než byly vydány). To je *kompromis* mezi in-order a OoO.

## Co dál

[[tomasulo]] (1967) řeší WAR/WAW *přejmenováním* místo stagnací — kvalitativní skok. Pak [[renaming-rob]] popisuje moderní syntézu Tomasula + ROB (Patt et al. 1985), která je *standard* od Intel P6 a AMD K7.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Thornton, J.E.: „Design of a Computer: The Control Data 6600" (Scott, Foresman 1970), §1; Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §C.7; [Sebestyen, ScoreBoarding tutorial](http://users.utcluj.ro/~sebestyen/_Word_docs/Cursuri/SSC_course_5_Scoreboard_ex.pdf).*
