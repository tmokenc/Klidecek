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

V *klasické 5-stupňové* in-order pipeline FX WAW a WAR *vzniknout nemohou* — instrukce dokončují v pořadí vydávání. V FP pipeline s vícetaktovým EX a v OoO ([[scoreboard]]) už vznikají.

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

Pokuta: **2 stall cykly na RAW závislost (ALU→ALU bez forwardingu)** ⇒ CPI pro tuto dvojici = 3. To je rychle drahé — RAW závislosti tvoří podstatnou část typického kódu.

## Forwarding (bypass)

Klíčový postřeh: výsledek `add` je *hotový* už na konci EX (takt 3), jen *není zapsaný* do register file. Stačí ho **přímo poslat** z výstupu EX zpět na vstup EX další instrukce.

```
takt:        1   2   3   4   5   6
add r1,...: IF  ID  EX  MA  WB
                    └── r1 ──┐
sub r5,r1:      IF  ID  EX  MA  WB
                        ↑ EX→EX bypass
```

CPI této dvojice = **1** — žádný stall. Hardware: **multiplexor před ALU**, který volí mezi výstupem register file a vstupem z EX/MA registru.

::: svg "Forwarding předá výsledek dopředu v čase — do EX pozdější instrukce (zpět to nejde)"
<svg viewBox="0 0 372 226" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="fwd-flow" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 z" fill="#3ddc97"/>
    </marker>
  </defs>

  <!-- ===== Diagram A: EX → EX (ALU → ALU), 0 stall ===== -->
  <text x="186" y="15" text-anchor="middle" fill="var(--text)" font-weight="600">EX → EX bypass (ALU → ALU): 0 stall cyklů</text>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="8.5">
    <text x="71" y="30">t1</text><text x="113" y="30">t2</text><text x="155" y="30">t3</text><text x="197" y="30">t4</text><text x="239" y="30">t5</text><text x="281" y="30">t6</text>
  </g>
  <text x="6" y="50" fill="var(--text)" font-family="ui-monospace, monospace" font-size="10">add</text>
  <text x="6" y="84" fill="var(--text)" font-family="ui-monospace, monospace" font-size="10">sub</text>
  <g text-anchor="middle" font-weight="700" fill="#fff">
    <!-- add: IF ID EX MA WB (cykly 1-5) -->
    <rect x="52"  y="34" width="38" height="24" rx="3" fill="#5b8def" opacity="0.85"/><text x="71"  y="50">IF</text>
    <rect x="94"  y="34" width="38" height="24" rx="3" fill="#7c5bef" opacity="0.85"/><text x="113" y="50">ID</text>
    <rect x="136" y="34" width="38" height="24" rx="3" fill="#ef5b8d" opacity="0.85"/><text x="155" y="50">EX</text>
    <rect x="178" y="34" width="38" height="24" rx="3" fill="#ef8d5b" opacity="0.85"/><text x="197" y="50">MA</text>
    <rect x="220" y="34" width="38" height="24" rx="3" fill="#5befef" opacity="0.85"/><text x="239" y="50">WB</text>
    <!-- sub: IF ID EX MA WB (cykly 2-6) -->
    <rect x="94"  y="68" width="38" height="24" rx="3" fill="#5b8def" opacity="0.85"/><text x="113" y="84">IF</text>
    <rect x="136" y="68" width="38" height="24" rx="3" fill="#7c5bef" opacity="0.85"/><text x="155" y="84">ID</text>
    <rect x="178" y="68" width="38" height="24" rx="3" fill="#ef5b8d" opacity="0.85"/><text x="197" y="84">EX</text>
    <rect x="220" y="68" width="38" height="24" rx="3" fill="#ef8d5b" opacity="0.85"/><text x="239" y="84">MA</text>
    <rect x="262" y="68" width="38" height="24" rx="3" fill="#5befef" opacity="0.85"/><text x="281" y="84">WB</text>
  </g>
  <!-- forward arrow: add EX (konec t3) → sub EX (t4) -->
  <circle cx="155" cy="58" r="2.4" fill="#3ddc97"/>
  <path d="M155,58 Q176,70 194,68" fill="none" stroke="#3ddc97" stroke-width="1.7" marker-end="url(#fwd-flow)"/>
  <text x="205" y="65" fill="#3ddc97" font-size="9" font-weight="700">r1</text>

  <!-- ===== Diagram B: MA → EX (load → ALU), 1 stall ===== -->
  <text x="186" y="119" text-anchor="middle" fill="var(--text)" font-weight="600">MA → EX bypass (load → ALU): 1 stall cyklus</text>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="8.5">
    <text x="71" y="134">t1</text><text x="113" y="134">t2</text><text x="155" y="134">t3</text><text x="197" y="134">t4</text><text x="239" y="134">t5</text><text x="281" y="134">t6</text><text x="323" y="134">t7</text>
  </g>
  <text x="6" y="158" fill="var(--text)" font-family="ui-monospace, monospace" font-size="10">lw</text>
  <text x="6" y="192" fill="var(--text)" font-family="ui-monospace, monospace" font-size="10">add</text>
  <g text-anchor="middle" font-weight="700" fill="#fff">
    <!-- lw: IF ID EX MA WB (cykly 1-5) -->
    <rect x="52"  y="142" width="38" height="24" rx="3" fill="#5b8def" opacity="0.85"/><text x="71"  y="158">IF</text>
    <rect x="94"  y="142" width="38" height="24" rx="3" fill="#7c5bef" opacity="0.85"/><text x="113" y="158">ID</text>
    <rect x="136" y="142" width="38" height="24" rx="3" fill="#ef5b8d" opacity="0.85"/><text x="155" y="158">EX</text>
    <rect x="178" y="142" width="38" height="24" rx="3" fill="#ef8d5b" opacity="0.85"/><text x="197" y="158">MA</text>
    <rect x="220" y="142" width="38" height="24" rx="3" fill="#5befef" opacity="0.85"/><text x="239" y="158">WB</text>
    <!-- add: IF ID [stall] EX MA WB -->
    <rect x="94"  y="176" width="38" height="24" rx="3" fill="#5b8def" opacity="0.85"/><text x="113" y="192">IF</text>
    <rect x="136" y="176" width="38" height="24" rx="3" fill="#7c5bef" opacity="0.85"/><text x="155" y="192">ID</text>
    <rect x="178" y="176" width="38" height="24" rx="3" fill="var(--bg-inset)" stroke="var(--text-faint)" stroke-dasharray="2 2"/><text x="197" y="192" fill="var(--text-faint)" font-weight="400">—</text>
    <rect x="220" y="176" width="38" height="24" rx="3" fill="#ef5b8d" opacity="0.85"/><text x="239" y="192">EX</text>
    <rect x="262" y="176" width="38" height="24" rx="3" fill="#ef8d5b" opacity="0.85"/><text x="281" y="192">MA</text>
    <rect x="304" y="176" width="38" height="24" rx="3" fill="#5befef" opacity="0.85"/><text x="323" y="192">WB</text>
  </g>
  <!-- forward arrow: lw MA (konec t4) → add EX (t5), až po 1 stallu -->
  <circle cx="197" cy="166" r="2.4" fill="#3ddc97"/>
  <path d="M197,166 Q220,177 236,176" fill="none" stroke="#3ddc97" stroke-width="1.7" marker-end="url(#fwd-flow)"/>
  <text x="247" y="173" fill="#3ddc97" font-size="9" font-weight="700">r4</text>

  <text x="186" y="219" text-anchor="middle" fill="var(--text-muted)" font-size="9">Šipky vedou vždy dopředu v čase (doprava-dolů) — zpět to nejde.</text>
</svg>
:::

### Typy bypass cest

V 5-stupňové pipeline jsou tři praktické bypass cesty:

| Bypass | Z fáze | Do fáze | Užití |
| :--- | :--- | :--- | :--- |
| EX → EX | po ALU | další ALU | `add r1,...` → `sub _, r1, _` (CPI = 1) |
| MA → EX | po MA | další ALU | RAW na vzdálenost 2 (1 nezávislá mezi nimi) nebo `lw` po 1 stallu — hodnota čeká v latchi MA/WB |
| MA → MA | po MA | další store | `lw r4,..` → `sw r4,...` (kopírování) |

Bypass zpět *do minulého taktu* **nelze** — kauzalita. Pokud `lw` načte v MA, ALU instrukce po něm v EX *minulý takt* nemůže výsledek dostat.

## Load-use stall — jediný stall i s forwardingem

```
lw r4, 0(r1)
add r5, r4, r2   ; potřebuje r4 hned
```

```
takt:        1   2   3   4   5   6   7
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

V FP pipeline s vícetaktovým EX:

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

- V FP pipeline s vícetaktovým EX, kde `fmul` (delší EX latence) dokončí WB až po později vydaném `fadd`.
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

### Videa

::: youtube "https://www.youtube.com/watch?v=6XV3uLfKzog" "15.2.3 Data Hazards" "MIT OpenCourseWare"
:::

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §C.2, str. 147-162; Patterson, D.A., Hennessy, J.L.: „Computer Organization and Design: RISC-V Edition" (Morgan Kaufmann 2017), §4.7.*
