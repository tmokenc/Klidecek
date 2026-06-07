---
title: Scoreboarding (Thorntonův algoritmus)
---

# Scoreboarding — první dynamické plánování (CDC 6600, 1964)

Scoreboarding (James Thornton, 1964, CDC 6600) je *nejstarší* hardwarový mechanizmus pro vydávání instrukcí mimo pořadí (out-of-order). **Sleduje stav** všech rozpracovaných instrukcí v tabulce a vydává je *jen tehdy*, pokud nehrozí konflikt. Řeší hazardy **RAW, WAR i WAW** zastavením (stagnací); přejmenování registrů ale neumí. Je předchůdcem [[tomasulo]].

## Motivace

Ve zřetězeném zpracování v pořadí (in-order pipeline) instrukce `i_n` stagnuje, dokud `i_{n-1}` neuvolní funkční jednotku nebo registr. Tím se plýtvá příležitostmi — instrukce `i_{n+1}` mohla být dávno hotová, ale nedostala se na řadu.

Thorntonův nápad: vytvořit tabulku, která sleduje, „kdo dělá co", a vydávat instrukce **mimo pořadí (out-of-order)**, jakmile nehrozí konflikt.

## Architektura CDC 6600

Počítač CDC 6600 měl:

- **10 funkčních jednotek** (1 pro skoky, 1 booleovskou, 1 pro posuvy, 1 pro celočíselné sčítání, 1 pro sčítání v plovoucí řádové čárce, 1 pro dělení v plovoucí řádové čárce, 2 pro násobení v plovoucí řádové čárce, 2 pro inkrementaci) pracujících paralelně.
- **24 registrů** (8 adresových + 8 indexových + 8 v plovoucí řádové čárce).
- **Scoreboard** — centrální tabulku, která rozhoduje o vydávání instrukcí.

Cílem bylo udržet všech 10 funkčních jednotek vytížených.

## Čtyři fáze instrukce

Ve scoreboardu prochází každá instrukce čtyřmi *fázemi* (žádná z nich není stupeň zřetězeného zpracování — instrukce může v každé fázi čekat *libovolně dlouho*):

| Fáze | Podmínka přechodu | Co dělá |
| :--- | :--- | :--- |
| **Issue** (vydání) | funkční jednotka je volná a do cílového registru nikdo nečeká se zápisem | rozešle instrukci do funkční jednotky |
| **Read operands** (čtení operandů) | žádná dřívější čekající instrukce nepíše do mých zdrojových registrů | načte operandy z registrového pole (register file) |
| **Execute** (provedení) | (funkční jednotka instrukci provádí, libovolný počet taktů) | spočítá výsledek |
| **Write result** (zápis výsledku) | žádná dřívější instrukce nečte z mého cílového registru | zapíše do registrového pole |

Mezi fázemi instrukce čeká, dokud podmínka neplatí. Scoreboard přitom průběžně aktualizuje stavy.

## Tři tabulky scoreboardu

Scoreboard tvoří tři tabulky, které dohromady popisují stav:

### 1. Stav instrukcí (instruction status)

Pro každou rozpracovanou instrukci udává, kterou fází právě prochází (Issue, Read, Exec, Write).

| Instrukce | Issue | Read | Exec | Write |
| :--- | :---: | :---: | :---: | :---: |
| `fmul f0, f2, f4` | ✓ | ✓ | ✓ | — |
| `fadd f6, f0, f8` | ✓ | — | — | — |

### 2. Stav funkčních jednotek (functional unit status)

Pro každou funkční jednotku udává, zda je *obsazená* (busy), jakou *operaci* provádí, jaký má *cílový registr* a jaké *zdroje* (registr + příznak připravenosti).

| FJ | Busy | Op | Dst | Src1 | Src2 | F1 ready? | F2 ready? |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Mult1 | ano | × | f0 | f2 | f4 | ano | ano |
| Add | ano | + | f6 | f0 | f8 | **ne** (Mult1) | ano |

### 3. Stav výsledku v registrech (register result status)

Pro každý registr udává, která funkční jednotka do něj zapisuje (pokud nějaká).

| Registr | f0 | f2 | f4 | f6 | f8 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Píše | Mult1 | — | — | Add | — |

## Pravidla scoreboardu

### Issue (vydání)

Instrukce *smí* vstoupit do funkční jednotky, **pokud**:

1. funkční jednotka není obsazená *(strukturální hazard)*,
2. žádná dřívější instrukce nepíše do mého cílového registru *(zabránění hazardu WAW)*.

Pokud kterákoli podmínka selže, *stagnuje celý front-end* (vydávání probíhá v pořadí, in-order issue).

### Read operands (čtení operandů)

Instrukce přečte operandy, **pokud** žádná dřívější instrukce nepíše do mých zdrojových registrů *(zabránění hazardu RAW)*.

Tím se *řeší hazard RAW* — instrukce *čeká*, dokud se zdroj neuvolní (až předchozí funkční jednotka zapíše výsledek a uvolní stav výsledku v registrech).

### Execute (provedení)

Probíhá výpočet. Funkční jednotce může trvat 1 až 40 taktů (nejdéle dělení v plovoucí řádové čárce).

### Write result (zápis výsledku)

Instrukce *zapíše* do registrového pole, **pokud** žádná dřívější instrukce nečte z mého cílového registru *(zabránění hazardu WAR)*.

Tím se *řeší hazard WAR*. Pokud `i2` zapisuje do `f8`, ale `i1` (vydaná dříve) ještě nepřečetla `f8` ve fázi Read operands, musí `i2` počkat *před* fází Write result.

## Příklad {tier=example}

```asm
i1: fdiv f0, f2, f4        ; pomalé (40 cyklů)
i2: fadd f6, f0, f8        ; čeká na f0 (RAW)
i3: fsub f8, f10, f14      ; WAR na f8 (i2 čte f8)
```

Průběh:

- **Takt 1**: i1 Issue (funkční jednotka Divide).
- **Takt 2**: i1 Read operands (f2, f4 připravené). i2 Issue (funkční jednotka Add).
- **Takt 3**: i1 Execute (poběží 40 taktů). i2 stagnuje v Read (čeká na f0). i3 Issue (funkční jednotka FX).
- **Takt 4**: i3 Read operands (f10, f14 připravené).
- **Takt 5**: i3 Execute. i3 *dokončí výpočet*, ale **nemůže zapsat výsledek** — i2 ještě nepřečetla f8 → hazard WAR. i3 čeká před zápisem (WB).
- **Takt 42**: i1 Write result (f0 hotová).
- **Takt 43**: i2 Read operands (f0, f8 připravené) → hazard WAR na f8 mizí.
- **Takt 44**: i3 Write result (*nyní povoleno*, i2 už přečetla f8). i2 Execute.
- **Takt 50**: i2 Write result.

Instrukce i3 dokončí výpočet už v taktu 5, ale kvůli hazardu WAR na f8 musí čekat ve frontě před zápisem výsledku, dokud i2 nepřečte f8 (takt 43) — tedy **~38 taktů promarněných stagnací**.

::: viz scoreboard-trace "Krokuj 6-instrukční FP program přes fáze Issue / Read / Execute / Write. Stagnace (STR / WAW / WAR) se zvýrazní u dotčené instrukce."
:::

## Limity scoreboardu

1. **Žádné přejmenování registrů** — hazardy WAR a WAW se *řeší stagnací*, nikoli *odstraněním*. Dlouhé řetězce závislostí jádro zpomalí.
2. **Centrální tabulka** — obtížně se škáluje nahoru. CDC 6600 měla 10 funkčních jednotek, dnešní procesory 20 až 30.
3. **Bez přeposílání (forwarding)** — výsledek se musí nejdřív *zapsat* do registrového pole a *teprve potom* ho další instrukce přečte. Vzniká zbytečné čekání WB → Read → Exec. Tomasulův algoritmus to vyřeší společnou datovou sběrnicí (Common Data Bus).
4. **Žádná spekulace** — scoreboard *neumí* spekulovat za skok (predikovat jeho výsledek dopředu).
5. **Vydávání v pořadí** — pokud první instrukce ve frontě nemůže být vydána (Issue), *čeká celá fronta*.

## Význam dnes

Scoreboard byl *první* hardwarový mechanizmus pro zpracování mimo pořadí (OoO). Dnes ho ve všech vysoce výkonných procesorech nahradil Tomasulův algoritmus (1967). Přesto je **přístup s tabulkou a fázemi** stále živý — i moderní přeskupovací buffer (ROB) v OoO procesorech je jeho potomkem.

Některé procesory zpracovávající v pořadí (in-order) s vícetaktovými funkčními jednotkami (ARM Cortex-A7, nízkopříkonové IoT čipy) používají *zjednodušený* scoreboard k detekci konfliktů v plovoucí řádové čárce, aby umožnily dokončování mimo pořadí (out-of-completion) — tedy aby instrukce mohly skončit v jiném pořadí, než byly vydány. Je to *kompromis* mezi zpracováním v pořadí a mimo pořadí.

## Co dál

[[tomasulo]] (1967) řeší hazardy WAR i WAW *přejmenováním registrů* místo stagnací — jde o kvalitativní skok. Poté [[renaming-rob]] popisuje moderní syntézu Tomasulova algoritmu a přeskupovacího bufferu ROB (Patt et al. 1985), která je *standardem* od architektury Intel P6 a AMD K7.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Thornton, J.E.: „Design of a Computer: The Control Data 6600" (Scott, Foresman 1970), §1; Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §C.7; [Sebestyen, ScoreBoarding tutorial](http://users.utcluj.ro/~sebestyen/_Word_docs/Cursuri/SSC_course_5_Scoreboard_ex.pdf).*
