---
title: Tomasulův algoritmus a rezervační stanice
---

# Tomasulův algoritmus (1967) — přejmenování + rezervační stanice

Robert Tomasulo (IBM 360/91, 1967) přinesl tři klíčové ideje, které dodnes formují každý moderní OoO procesor:

1. **Reservation Stations (RS)** — bufer před každou FJ, kam jdou *čekající* instrukce.
2. **Implicit register renaming** — RS uchovává **hodnotu** operandu, ne *jméno* registru ⇒ WAR + WAW *zaniknou*.
3. **Common Data Bus (CDB)** — sběrnice, po které se *výsledek* zároveň posílá *všem* RS, které ho čekají.

Tato kombinace vyřeší **WAR + WAW** *přejmenováním*, **RAW** *čekáním v RS bez blokování dalších*. [[scoreboard]] uměl jen detekovat — Tomasulo umí *eliminovat*.

## Architektura: tři kameny

::: svg "Tomasulův algoritmus — RS, FJ, CDB"
<svg viewBox="0 0 540 250" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="20" width="120" height="35" rx="3"/>
  </g>
  <text x="80" y="42" text-anchor="middle" fill="var(--text)" font-weight="600">Instruction Queue</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="170" y="20" width="120" height="35" rx="3"/>
  </g>
  <text x="230" y="42" text-anchor="middle" fill="var(--text)" font-weight="600">Register File (RF)</text>
  <g fill="var(--accent)" opacity="0.2" stroke="var(--accent)">
    <rect x="20" y="80" width="140" height="50" rx="4"/>
    <rect x="180" y="80" width="140" height="50" rx="4"/>
    <rect x="340" y="80" width="160" height="50" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600" font-size="10">
    <text x="90" y="100">RS Add</text>
    <text x="250" y="100">RS Mult</text>
    <text x="420" y="100">RS Load/Store</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="8">
    <text x="90" y="115">tagy + hodnoty</text>
    <text x="250" y="115">operandů</text>
    <text x="420" y="115">store buffer</text>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="155" width="140" height="35" rx="3"/>
    <rect x="180" y="155" width="140" height="35" rx="3"/>
    <rect x="340" y="155" width="160" height="35" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="90" y="178">FP Adder</text>
    <text x="250" y="178">FP Multiplier</text>
    <text x="420" y="178">Memory Unit</text>
  </g>
  <g stroke="var(--accent-line)" stroke-width="2" fill="none">
    <line x1="20" y1="225" x2="520" y2="225"/>
  </g>
  <text x="270" y="245" fill="var(--accent-line)" text-anchor="middle" font-weight="600">Common Data Bus (CDB) — broadcast tag + value</text>
  <g stroke="var(--text-faint)" fill="none" stroke-dasharray="2 2">
    <path d="M90,190 L90,225"/>
    <path d="M250,190 L250,225"/>
    <path d="M420,190 L420,225"/>
    <path d="M90,225 L90,130"/>
    <path d="M250,225 L250,130"/>
    <path d="M420,225 L420,130"/>
    <path d="M520,225 L520,40 L290,40"/>
  </g>
</svg>
:::

## Tři fáze instrukce v Tomasulu

| Fáze | Co se děje |
| :--- | :--- |
| **Issue** | z fronty do RS; pokud RS pro daný typ FJ není volná, stagnuj |
| **Execute** | RS čeká, dokud oba operandy nejsou ready, pak pošle do FJ |
| **Write result** | po dokončení FJ pošle výsledek přes CDB |

Pozor — proti scoreboardu je *Read operands* sloučená do *Execute* (operandy se *přicházejí* na CDB během čekání), a *žádná zvláštní fáze* pro WAR check není.

## Issue: přejmenování on-the-fly

Při Issue:

1. Najdi volnou RS pro daný typ FJ (Adder, Mult, L/S, Branch).
2. Pro každý zdrojový operand:
   - Pokud `RegResult[src]` ukazuje na *žádnou pending FJ* → načti **hodnotu** z register file do RS.
   - Pokud ukazuje na FJ_X → ulož **tag** FJ_X do RS (čekej na CDB broadcast s tímto tagem).
3. Pro cílový registr: nastav `RegResult[dst] := tag_RS_této_instrukce`.

⇒ **Cílový registr ukazuje na *novou* RS**, takže *budoucí čtení* uvidí *čerstvou* hodnotu, ne starou. To je **implicit renaming** — žádné jméno registru se nepřeposílá; tagy RS *jsou* nová "jména".

### Příklad: WAW vyřešen automaticky {tier=example}

```asm
i1: fmul f0, f2, f4
i2: fadd f0, f6, f8    ; WAW na f0
```

Po Issue i1: `RegResult[f0] := RS_Mult1`.

Po Issue i2: `RegResult[f0] := RS_Add1`. RS_Mult1 *existuje dál*, ale `RegResult[f0]` ji už neukazuje. Když i1 dokončí, *broadcastne* hodnotu s tagem `RS_Mult1` na CDB, ale `RegResult[f0]` ji **nepřijme** (tag se neshoduje s aktuálním). i2 dokončí později, broadcastne s tagem `RS_Add1`, *to* projde do `f0`.

⇒ Architectural value of `f0` = výsledek `i2`. Správně. WAW zmizel.

## Execute: čekání s ostatními RS odblokovanými

RS *jednotlivě* sleduje připravenost. `i2` v RS_Add1 čeká na `f0` (tag = RS_Mult1). *Mezitím* může `i3` přijít do RS_Mult2 a *normálně se vydat*, protože *nečeká*.

To je klíčový rozdíl proti scoreboardu: **stagnující instrukce neblokuje další** v jiné RS.

## Write result: CDB broadcast

Když FJ dokončí výpočet:

1. Pošle (tag, value) na CDB.
2. *Všechny* RS srovnají tag se svými čekajícími operandy. Match → zkopírují value, označí ready.
3. Také register file: pokud nějaký `RegResult[i] == tag`, zapíše se value do `RF[i]` a `RegResult[i] := none`.
4. RS, ze které data pocházejí, se uvolní.

⇒ Forwarding *bez čekání* na register file. RS dostane data za 1 takt, ne 2-3.

## WAR vyřešen automaticky

```asm
i1: fdiv f0, f2, f4
i2: fadd f6, f0, f8    ; čeká na f0 (RAW)
i3: fsub f8, f10, f14  ; WAR na f8 (i2 čte f8)
```

Po Issue všech tří:

- RS_Div: f2 hodnota, f4 hodnota, dst f0.
- RS_Add: f6 hodnota, čeká na tag RS_Div pro druhý operand, **f8 hodnota** (uložená *při Issue i2*, ne odkaz na *aktuální* f8!).
- RS_Sub: f10 hodnota, f14 hodnota, dst f8.

`i3` *nečeká* na nic, hned execute. `i3` produkuje novou hodnotu f8, zapíše do `RF[f8]` (`RegResult[f8] := none` se aktualizuje). 

`i2` mezitím dál čeká na `f0`. Až dostane f0 přes CDB, vykoná sčítání s *již dříve zachycenou* hodnotou f8 — *před* jejím přepsáním i3. WAR zmizel.

::: viz tomasulo-rs-cdb "Krokuj nebo spusť auto. Instrukce naplní RS, čekají na operandy (tagy), CDB broadcast přepošle hodnotu všem RS najednou. WAR/WAW jsou pryč díky implicit renaming."
:::

## Loop unrolling + Tomasulo = nekonečný issue

Klasická aplikace: vektorová smyčka.

```c
for (i = 0; i < N; i++) {
    y[i] = a * x[i] + y[i];   // AXPY
}
```

In-order pipeline by každou iteraci čekala na load `x[i]`. Tomasulo:

- Iterace 0: Issue, RS naplněna, čeká na load.
- Iterace 1: Issue do dalších RS (jiné jméno cíle po přejmenování), čeká na load.
- ...
- Iterace k: RS jsou plné, *teprve teď* Issue stagnuje.

Mezitím dlouhotrvající loady postupně dokončují, FJ se vytíží. Praktický efekt: **multiple iterations in flight** současně.

## Limity Tomasula

1. **Spekulace ne** — Tomasulo 1967 neuměl spekulovat za skok. Bez prediction by superskalár klepal.
2. **Imprecise exceptions** — když dojde k chybě, *neexistuje* jednotný stav register file. Modul ROB (Patt 1985, [[renaming-rob]]) tento problém řeší.
3. **Jediný CDB** = strukturální bottleneck. Moderní CPU mají *více* CDB nebo result bus.
4. **Memory ordering** — load a store musí pořadí *respektovat* ve výsledku, byť jsou OoO ve výpočtu. Speciální *memory disambiguation* logic.

## Tomasulo dnes

Moderní x86, ARM, RISC-V high-perf CPU používají *Tomasulo + ROB + spekulace*. Konkrétně:

- Intel P6 (1995, Pentium Pro) zavedl *ROB-based renaming* postavený na Tomasulových RS.
- AMD K7 (1999) totéž.
- Apple M1 Firestorm, AMD Zen 4 — RS desítky položek, 300+ ROB, 6-8-issue.

Schéma je víc než *50 let* staré a stále dominuje.

## Co dál

[[renaming-rob]] popisuje *Re-Order Buffer* a *physical register file* — moderní variantu Tomasula s **precise exceptions**. [[spekulace-vyjimky]] pak rozšíří algoritmus o branch speculation a recovery.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Tomasulo, R.M.: „An Efficient Algorithm for Exploiting Multiple Arithmetic Units" (IBM Journal R&D 11(1), 1967, [DOI 10.1147/rd.111.0025](https://doi.org/10.1147/rd.111.0025)); Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §3.5; Patterson, D.A., Hennessy, J.L.: „Computer Organization and Design: RISC-V Edition" (Morgan Kaufmann 2017), §4.10.*
