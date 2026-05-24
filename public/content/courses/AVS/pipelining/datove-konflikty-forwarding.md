---
title: Datové konflikty a forwarding
---

# Datové konflikty (RAW, WAR, WAW) a předávání dat (forwarding)

Pipeline má ideální CPI = 1, *pokud* sousední instrukce na sebe nezávisí. V reálném kódu závisí *velmi často*. Datové konflikty zpomalují pipeline o **stall** cykly. Forwarding (bypass) většinu z nich neutralizuje bez stall — *za cenu* hardware (multiplexory, drátování).

## Tři druhy datových závislostí

Závislost mezi instrukcí $i$ a pozdější instrukcí $j$:

- **RAW** *(Read After Write)* — *pravá* závislost. $j$ čte registr, který $i$ právě píše. Vyžaduje *čekání* nebo *forwarding*. Vyplývá z toku dat — nelze obejít přejmenováním.
- **WAR** *(Write After Read)* — *protiproud* (anti-dependence). $j$ píše do registru, ze kterého $i$ ještě čte. Vzniká jen při změně pořadí. Odstranitelná **přejmenováním**.
- **WAW** *(Write After Write)* — *výstupní*. $j$ píše do stejného registru jako $i$. Při změně pořadí by výsledek byl špatný. Také odstranitelná přejmenováním.

| Konflikt | Příčina | Řešitelný |
| :--- | :--- | :--- |
| RAW | tok dat | forwarding, čekání, kompilátor |
| WAR | konflikt jmen | přejmenováním ([[renaming-rob]]) |
| WAW | konflikt jmen | přejmenováním |

V *klasické 5-stupňové* in-order pipeline FX WAW a WAR *vzniknout nemohou* — instrukce dokončují v pořadí vydávání. V FP pipeline s víceтактovým EX a v OoO ([[scoreboard]]) už vznikají.

## RAW bez forwardingu — stall

```
add r1, r2, r3
sub r5, r1, r4   ; potřebuje r1
```

Pipeline bez forwardingu:

```
takt:        1   2   3   4   5   6   7   8
add r1,...: IF  ID  EX  MA  WB
sub r5,r1:      IF  ID  ID  ID  EX  MA  WB
                    ^^^ stall 2 cykly ^^^
```

Proč 2 cykly? `add` zapíše `r1` *na začátku* WB (takt 5). `sub` chce `r1` číst v ID — takt 5 nejdřív. Pipeline pozastaví `sub` ve fázi ID 2 takty.

Pokuta: **2 stall cykly na load-use sekvenci** ⇒ CPI pro tuto dvojici = 3. To je rychle drahé — load instrukce tvoří ~25 % typického kódu.

## Forwarding (bypass)

Klíčový postřeh: výsledek `add` je *hotový* už na konci EX (takt 3), jen *není zapsaný* do register file. Stačí ho **přímo poslat** z výstupu EX zpět na vstup EX další instrukce.

```
takt:        1   2   3   4   5
add r1,...: IF  ID  EX  MA  WB
                    └── r1 ──┐
sub r5,r1:      IF  ID  EX  MA  WB
                        ↑ EX→EX bypass
```

CPI této dvojice = **1** — žádný stall. Hardware: **multiplexor před ALU**, který volí mezi výstupem register file a vstupem z EX/MA registru.

::: svg "Forwarding paths v 5-stupňové pipeline"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="70" width="80" height="40" rx="3"/>
    <rect x="120" y="70" width="80" height="40" rx="3"/>
    <rect x="220" y="70" width="80" height="40" rx="3"/>
    <rect x="320" y="70" width="80" height="40" rx="3"/>
    <rect x="420" y="70" width="80" height="40" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="60" y="93">IF</text>
    <text x="160" y="93">ID</text>
    <text x="260" y="93">EX</text>
    <text x="360" y="93">MA</text>
    <text x="460" y="93">WB</text>
  </g>
  <g stroke="var(--accent)" fill="none" stroke-width="1.3">
    <path d="M300,90 Q280,40 240,70" marker-end="url(#fw-arrow)"/>
  </g>
  <text x="270" y="40" fill="var(--accent)" text-anchor="middle" font-size="10" font-weight="600">EX → EX bypass</text>
  <g stroke="var(--accent-line)" fill="none" stroke-width="1.3">
    <path d="M400,110 Q360,160 250,110" marker-end="url(#fw-arrow2)"/>
  </g>
  <text x="320" y="175" fill="var(--accent-line)" text-anchor="middle" font-size="10" font-weight="600">MA → EX bypass (po lw)</text>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="270" y="195">forwarding sníží stall na 0 (EX→EX) nebo 1 (lw + use)</text>
  </g>
  <defs>
    <marker id="fw-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent)"/>
    </marker>
    <marker id="fw-arrow2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent-line)"/>
    </marker>
  </defs>
</svg>
:::

### Typy bypass cest

V 5-stupňové pipeline jsou tři praktické bypass cesty:

| Bypass | Z fáze | Do fáze | Užití |
| :--- | :--- | :--- | :--- |
| EX → EX | po ALU | další ALU | `add r1,...` → `sub _, r1, _` (CPI = 1) |
| MA → EX | po MA | další ALU | starší ALU, ale následuje pomalejší instrukce |
| MA → MA | po MA | další store | `lw r4,..` → `sw r4,...` (kopírování) |

Bypass zpět *do minulého taktu* **nelze** — kauzalita. Pokud `lw` načte v MA, ALU instrukce po něm v EX *minulý takt* nemůže výsledek dostat.

## Load-use stall — jediný stall i s forwardingem

```
lw r4, 0(r1)
add r5, r4, r2   ; potřebuje r4 hned
```

```
takt:        1   2   3   4   5
lw r4,...:  IF  ID  EX  MA  WB
                        └── r4
add r5,r4:      IF  ID  ID  EX  MA  WB
                        ↑ 1 stall, pak MA→EX bypass
```

`r4` je k dispozici až *na konci MA* (takt 4). Bypass MA → EX je možný, ale `add` musí být v *taktu 5* v EX, ne v taktu 4. ⇒ **1 stall**.

Tomuhle se říká **load-use delay** a je *neodstranitelný* na 5-stupňové pipeline. Kompilátor se snaží vložit *jinou* nezávislou instrukci mezi `lw` a `use`.

::: viz pipeline-hazards "Vyber program (bez konfliktů / RAW / load-use) a zapni/vypni forwarding — sleduj, jak stall cykly zvedají CPI."
:::

### Latence FP operací

V FP pipeline s víceтаktovým EX:

| Producent | Konzument | Pauza (cykly) |
| :--- | :--- | :---: |
| FP ALU op | další FP ALU op | 3 |
| FP ALU op | store double | 2 |
| Load double | FP ALU op | 1 |
| Load double | store double | 0 |

V příkladu inkrementace prvků vektoru ve FP s naivním vkládáním NOP jsou výsledné 9 taktů/prvek; po **rozbalení smyčky** (loop unrolling, 4 iterace prolnuté) klesne pauza na 3,5 taktů/prvek — kompilátor *přesměruje* nezávislé instrukce do prázdných slotů.

## WAR a WAW v 5-stupňové pipeline

V klasické MIPS 5-stupňové pipeline *nevznikají*, protože:

- Zápis do registr file je *vždy* v WB (stupeň 5) — pořadí WB respektuje pořadí vydávání.
- Čtení registru je *vždy* v ID — předchází WB pozdější instrukce.

Vznikají *až*:

- V FP pipeline s víceтаktovým EX, kde `fmul` (čeká 4 takty) může být WB pozdější než `fadd` (1 takt).
- V OoO superskaláru, kde instrukce vydávají *out-of-order*.

Řešení v obou případech: **přejmenování registrů** ([[renaming-rob]]).

```
i1: fmul f1, f2, f3    ; pomalý
i2: fadd f1, f4, f5    ; rychlý, WAW na f1
                        ; přejmenování: i2 zapíše do f1' místo f1
```

## Co řeší kompilátor a co hardware

Kompilátor:

- **Reordering** — vloží nezávislou instrukci mezi producent a konzument.
- **Loop unrolling** — rozbalí smyčku, aby měl prostor pro reordering.
- **Software pipelining** — promíchá fáze sousedních iterací.

Hardware (in-order, jednoduchý):

- **Detekce konfliktu** v ID — kontroluje, zda zdrojový registr není cíl předchozí instrukce v EX/MA.
- **Stall** — pozastavení IF + ID, dokud konflikt nezmizí.
- **Forwarding** — multiplexory pro bypass cesty.

Hardware (OoO):

- **Scoreboard** ([[scoreboard]]) — sleduje konflikty pomocí tabulky.
- **Tomasulo** ([[tomasulo]]) — rezervační stanice + přejmenování.

## Co dál

Datové konflikty řeší forwarding (RAW) a přejmenování (WAR/WAW). [[ridici-konflikty-skoky]] řeší *řídicí* konflikty — skoky, které pipeline neumí předpovědět. [[superpipelining-vykon]] shrne, jak stally celkově ovlivňují speedup.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §C.2, str. 147-162; Patterson, D.A., Hennessy, J.L.: „Computer Organization and Design: RISC-V Edition" (Morgan Kaufmann 2017), §4.7.*
