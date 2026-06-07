---
title: Datové konflikty a forwarding
---

# Datové konflikty (RAW, WAR, WAW) a předávání dat (forwarding)

Zřetězené zpracování (pipeline) má ideální CPI (počet taktů na instrukci, cycles per instruction) rovné 1, *pokud* na sebe sousední instrukce nezávisí. V reálném kódu na sebe ale závisí *velmi často*. Datové konflikty (data hazards) zpomalují pipeline o pozastavovací cykly (stall) — tedy takty, kdy pipeline „stojí“ a nic užitečného nedokončí. Předávání dat (forwarding, někdy též bypass) většinu těchto konfliktů odstraní bez jediného stallu — ovšem *za cenu* dalšího hardwaru (multiplexory, propojovací vodiče).

## Tři druhy datových závislostí

Mluvíme o závislosti mezi instrukcí $i$ a pozdější instrukcí $j$:

- **RAW** *(Read After Write, čtení po zápisu)* — *pravá* závislost. Instrukce $j$ čte registr, do kterého $i$ právě zapisuje. Vyžaduje *čekání* nebo *forwarding*. Vyplývá ze skutečného toku dat — nelze ji obejít přejmenováním.
- **WAR** *(Write After Read, zápis po čtení)* — *protisměrná* závislost (anti-dependence). Instrukce $j$ zapisuje do registru, ze kterého $i$ ještě čte. Vzniká jen při změně pořadí instrukcí. Lze ji odstranit **přejmenováním**.
- **WAW** *(Write After Write, zápis po zápisu)* — *výstupní* závislost. Instrukce $j$ zapisuje do stejného registru jako $i$. Při změně pořadí by byl výsledek špatný. Také ji lze odstranit přejmenováním.

| Konflikt | Příčina | Řešení |
| :--- | :--- | :--- |
| RAW | tok dat | forwarding, čekání, překladač (compiler) |
| WAR | konflikt jmen | přejmenování ([[renaming-rob]]) |
| WAW | konflikt jmen | přejmenování |

V *klasické 5stupňové* celočíselné pipeline zpracovávající instrukce v pořadí (in-order) konflikty WAW a WAR *vzniknout nemohou* — instrukce totiž dokončují v pořadí, v jakém byly vydány. V pipeline pro operace v pohyblivé řádové čárce (FP, floating-point) s vícetaktovým stupněm EX a u procesorů zpracovávajících instrukce mimo pořadí (OoO, out-of-order; viz [[scoreboard]]) už ale tyto konflikty vznikají.

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

Proč právě 2 cykly? Instrukce `add` zapíše `r1` *na začátku* fáze WB (takt 5). Instrukce `sub` přitom chce `r1` číst ve fázi ID, což jí nejdříve umožní až takt 5. Pipeline proto musí `sub` ve fázi ID pozastavit o 2 takty.

Cena tohoto čekání: **2 stall cykly na jednu RAW závislost (ALU→ALU bez forwardingu)** ⇒ CPI této dvojice instrukcí je 3. To se velmi rychle prodraží — RAW závislosti tvoří podstatnou část typického kódu.

## Forwarding (bypass)

Klíčový postřeh: výsledek instrukce `add` je *hotový* už na konci fáze EX (takt 3), jen ještě *není zapsaný* do registrového pole (register file). Stačí ho tedy **rovnou poslat** z výstupu EX zpět na vstup EX následující instrukce — tj. obejít zápis do registrů a načtení z nich.

```
takt:        1   2   3   4   5   6
add r1,...: IF  ID  EX  MA  WB
                    └── r1 ──┐
sub r5,r1:      IF  ID  EX  MA  WB
                        ↑ EX→EX bypass
```

CPI této dvojice je **1** — žádný stall. Co je k tomu potřeba v hardwaru: **multiplexor před ALU**, který vybírá mezi hodnotou z registrového pole (register file) a hodnotou předanou z mezistupňového registru EX/MA.

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
    <rect x="220" y="34" width="38" height="24" rx="3" fill="#1a8f9e" opacity="0.85"/><text x="239" y="50">WB</text>
    <!-- sub: IF ID EX MA WB (cykly 2-6) -->
    <rect x="94"  y="68" width="38" height="24" rx="3" fill="#5b8def" opacity="0.85"/><text x="113" y="84">IF</text>
    <rect x="136" y="68" width="38" height="24" rx="3" fill="#7c5bef" opacity="0.85"/><text x="155" y="84">ID</text>
    <rect x="178" y="68" width="38" height="24" rx="3" fill="#ef5b8d" opacity="0.85"/><text x="197" y="84">EX</text>
    <rect x="220" y="68" width="38" height="24" rx="3" fill="#ef8d5b" opacity="0.85"/><text x="239" y="84">MA</text>
    <rect x="262" y="68" width="38" height="24" rx="3" fill="#1a8f9e" opacity="0.85"/><text x="281" y="84">WB</text>
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
    <rect x="220" y="142" width="38" height="24" rx="3" fill="#1a8f9e" opacity="0.85"/><text x="239" y="158">WB</text>
    <!-- add: IF ID [stall] EX MA WB -->
    <rect x="94"  y="176" width="38" height="24" rx="3" fill="#5b8def" opacity="0.85"/><text x="113" y="192">IF</text>
    <rect x="136" y="176" width="38" height="24" rx="3" fill="#7c5bef" opacity="0.85"/><text x="155" y="192">ID</text>
    <rect x="178" y="176" width="38" height="24" rx="3" fill="var(--bg-inset)" stroke="var(--text-faint)" stroke-dasharray="2 2"/><text x="197" y="192" fill="var(--text-faint)" font-weight="400">—</text>
    <rect x="220" y="176" width="38" height="24" rx="3" fill="#ef5b8d" opacity="0.85"/><text x="239" y="192">EX</text>
    <rect x="262" y="176" width="38" height="24" rx="3" fill="#ef8d5b" opacity="0.85"/><text x="281" y="192">MA</text>
    <rect x="304" y="176" width="38" height="24" rx="3" fill="#1a8f9e" opacity="0.85"/><text x="323" y="192">WB</text>
  </g>
  <!-- forward arrow: lw MA (konec t4) → add EX (t5), až po 1 stallu -->
  <circle cx="197" cy="166" r="2.4" fill="#3ddc97"/>
  <path d="M197,166 Q220,177 236,176" fill="none" stroke="#3ddc97" stroke-width="1.7" marker-end="url(#fwd-flow)"/>
  <text x="247" y="173" fill="#3ddc97" font-size="9" font-weight="700">r4</text>

  <text x="186" y="219" text-anchor="middle" fill="var(--text-muted)" font-size="9">Šipky vedou vždy dopředu v čase (doprava-dolů) — zpět to nejde.</text>
</svg>
:::

### Typy bypass cest

V 5stupňové pipeline existují tři prakticky používané cesty pro forwarding (bypass cesty):

| Bypass | Z fáze | Do fáze | Použití |
| :--- | :--- | :--- | :--- |
| EX → EX | po ALU | další ALU | `add r1,...` → `sub _, r1, _` (CPI = 1) |
| MA → EX | po MA | další ALU | RAW závislost na vzdálenost 2 (mezi instrukcemi je 1 nezávislá) nebo `lw` po 1 stallu — hodnota čeká v mezistupňovém registru MA/WB |
| MA → MA | po MA | další store (zápis do paměti) | `lw r4,..` → `sw r4,...` (kopírování hodnoty) |

Předat hodnotu *zpět do minulého taktu* **nelze** — bránila by tomu kauzalita (příčina musí předcházet následku). Pokud `lw` načte hodnotu až ve fázi MA, instrukce ALU, která je za ním a byla ve fázi EX už *o takt dříve*, tuto hodnotu prostě dostat nemůže.

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

Hodnota `r4` je k dispozici až *na konci fáze MA* (takt 4). Bypass MA → EX je sice možný, ale `add` musí být ve fázi EX až v *taktu 5*, nikoli už v taktu 4. Z toho plyne **1 stall**.

Tomuto zpoždění se říká **load-use delay** (zdržení při použití právě načtené hodnoty) a v 5stupňové pipeline je *neodstranitelné*. Překladač (compiler) se proto snaží vložit mezi `lw` a instrukci, která načtenou hodnotu používá, nějakou *jinou*, nezávislou instrukci, aby prázdný takt zaplnil užitečnou prací.

::: viz pipeline-hazards "Vyber program (bez konfliktů / RAW / load-use) a zapni/vypni forwarding — sleduj, jak stall cykly zvedají CPI."
:::

### Latence FP operací

V FP pipeline (operace v pohyblivé řádové čárce) s vícetaktovým stupněm EX platí tyto nutné pauzy mezi instrukcí, která hodnotu vyrábí (producent), a instrukcí, která ji spotřebovává (konzument):

| Producent | Konzument | Pauza (cykly) |
| :--- | :--- | :---: |
| FP ALU op | další FP ALU op | 3 |
| FP ALU op | store double (zápis do paměti) | 2 |
| Load double (načtení z paměti) | FP ALU op | 1 |
| Load double | store double | 0 |

V příkladu, kdy ve FP inkrementujeme prvky vektoru a pauzy zaplňujeme naivně instrukcemi NOP (prázdná operace), vychází 9 taktů na prvek. Po **rozbalení smyčky** (loop unrolling — kdy se tělo smyčky rozkopíruje, zde 4 iterace prolnuté dohromady) klesne pauza na 3,5 taktu na prvek, protože překladač (compiler) má prostor *přesunout* nezávislé instrukce do prázdných slotů.

## WAR a WAW v 5stupňové pipeline

V klasické 5stupňové pipeline MIPS tyto konflikty *nevznikají*, a to protože:

- Zápis do registrového pole (register file) probíhá *vždy* ve fázi WB (stupeň 5) — pořadí zápisů WB tedy přesně kopíruje pořadí, v jakém byly instrukce vydány.
- Čtení registru probíhá *vždy* ve fázi ID, která předchází fázi WB jakékoli pozdější instrukce.

Vznikají *až*:

- V FP pipeline s vícetaktovým stupněm EX, kde instrukce `fmul` (delší latence ve fázi EX) dokončí svůj zápis WB až po později vydané instrukci `fadd`.
- V superskalárním procesoru zpracovávajícím instrukce mimo pořadí (OoO), kde se instrukce vydávají *out-of-order*.

Řešení je v obou případech stejné: **přejmenování registrů** ([[renaming-rob]]).

```
i1: fmul f1, f2, f3    ; pomalý
i2: fadd f1, f4, f5    ; rychlý, WAW na f1
                        ; přejmenování: i2 zapíše do f1' místo f1
```

## Co řeší překladač a co hardware

Překladač (compiler):

- **Přeskupení instrukcí** (reordering) — vloží mezi producenta a konzumenta nějakou nezávislou instrukci.
- **Rozbalení smyčky** (loop unrolling) — rozkopíruje tělo smyčky, aby získal prostor pro přeskupování instrukcí.
- **Softwarové zřetězení** (software pipelining) — promíchá fáze sousedních iterací smyčky.

Hardware (jednoduchý, zpracovávající instrukce v pořadí, in-order):

- **Detekce konfliktu** ve fázi ID — kontroluje, zda zdrojový registr není zároveň cílem předchozí instrukce nacházející se ve fázi EX nebo MA.
- **Stall** — pozastavení fází IF a ID, dokud konflikt nepomine.
- **Forwarding** — multiplexory tvořící bypass cesty.

Hardware (zpracovávající instrukce mimo pořadí, OoO):

- **Scoreboard** ([[scoreboard]]) — sleduje konflikty pomocí tabulky.
- **Tomasulův algoritmus** ([[tomasulo]]) — rezervační stanice společně s přejmenováním registrů.

## Co dál

Datové konflikty řeší forwarding (u RAW) a přejmenování registrů (u WAR a WAW). Stránka [[ridici-konflikty-skoky]] se věnuje *řídicím* konfliktům — tedy skokům, jejichž cíl pipeline neumí předem předpovědět. Stránka [[superpipelining-vykon]] pak shrnuje, jak stally celkově ovlivňují zrychlení (speedup).

---

### Videa

::: youtube "https://www.youtube.com/watch?v=6XV3uLfKzog" "15.2.3 Data Hazards" "MIT OpenCourseWare"
:::

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §C.2, str. 147-162; Patterson, D.A., Hennessy, J.L.: „Computer Organization and Design: RISC-V Edition" (Morgan Kaufmann 2017), §4.7.*
