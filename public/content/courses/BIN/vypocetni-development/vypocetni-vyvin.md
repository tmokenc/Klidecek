---
title: Výpočetní vývin a sebereplikace
---

# Výpočetní vývin a sebereplikace

**Výpočetní vývin (development)** je souhrnný název pro výpočty inspirované **biologickým developmentem** — ontogenezí, tedy vývojem mnohobuněčného organismu z jediné buňky (zygoty) podle genetické informace. Zahrnuje zobrazení genotyp→fenotyp v evolučních algoritmech, vývojové reprezentace, embryogenezi, morfogenezi a generativní systémy.

## Princip: nepřímé mapování genotyp → fenotyp

**Přímé kódování** (jeden gen = jedna komponenta) naráží na limit **škálovatelnosti**: se zvětšujícím se fenotypem roste délka chromozomu a evoluce selhává. Development zavádí **nepřímé mapování** — malý genotyp (program/předpis) definuje jen **pravidla lokální interakce a růstu** a velký, složitý fenotyp z nich vzniká *emergentně* (analogie: miliardy buněk lidského těla z relativně malého genomu).

Výhody nepřímého kódování:

- velikost řešení **nemusí záviset** na délce chromozomu;
- **modularita** a znovupoužití jednou objevených motivů;
- lepší **evolvabilita** a odolnost vůči poruchám (samoopravné a samosestavovací schopnosti);
- emergentní chování z interakce genů a prostředí.

::: svg "Vývin (development): malý genotyp/předpis přepisováním v krocích vyroste do velkého fenotypu (princip L-systému)."
<svg viewBox="0 0 540 170" font-family="ui-sans-serif, system-ui" font-size="11">
  <rect width="540" height="170" fill="var(--bg-inset)"/>
  <text x="12" y="22" fill="var(--text-muted)" font-size="10">genotyp = axiom A + pravidla {A→AB, B→A} · paralelní přepis</text>
  <g text-anchor="middle">
    <g fill="var(--text)" font-family="var(--font-mono)" font-size="13">
      <text x="60"  y="70">A</text>
      <text x="170" y="70">A B</text>
      <text x="300" y="70">A B A</text>
      <text x="450" y="70">A B A A B</text>
    </g>
    <g fill="var(--text-muted)" font-size="10">
      <text x="60"  y="100">t = 0</text>
      <text x="170" y="100">t = 1</text>
      <text x="300" y="100">t = 2</text>
      <text x="450" y="100">t = 3</text>
    </g>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none">
    <path d="M 86 66 L 138 66"/>
    <path d="M 206 66 L 262 66"/>
    <path d="M 342 66 L 402 66"/>
  </g>
  <g fill="var(--accent)">
    <path d="M 138 66 l -7 -3 l 0 6 z"/>
    <path d="M 262 66 l -7 -3 l 0 6 z"/>
    <path d="M 402 66 l -7 -3 l 0 6 z"/>
  </g>
  <text x="270" y="140" text-anchor="middle" fill="var(--text-muted)" font-size="10">geometrická interpretace (želví grafika) → fenotyp (tvar rostliny, Kochova vločka …)</text>
</svg>
:::

## Modely developmentu

- **Gramatické (přepisovací) modely — L-systémy** (Lindenmayer). Formální gramatika *G = (Σ, ω, P)*: abeceda *Σ*, axiom *ω* (embryo) a produkční pravidla *P*. Na rozdíl od klasických gramatik se **všechny symboly přepisují paralelně a synchronně** v jednom kroku. Z čistě řetězcového výstupu vznikne tvar **geometrickou interpretací** (želví grafika). Varianty: kontextové (podmínkové) a parametrické L-systémy.
- **Celulární modely.** Buňky v diskrétním 1D/2D/3D prostoru se vyvíjejí lokální interakcí se sousedy a s prostředím; mohou produkovat **morfogeny** (virtuální chemické gradienty), na jejichž koncentraci reagují. Realizují se nejčastěji celulárními automaty, případně buněčnými neuronovými sítěmi nebo genetickým programováním určujícím pravidla buňky.

## 2D celulární automaty a pohyblivé struktury

V 2D CA s Mooreovým okolím (Hra života: živá = 1, mrtvá = 0) vznikají **pohybující se struktury** — nejznámější je **glider**, vzor pěti buněk, který se po čtyřech krocích přesune o jednu buňku diagonálně. Právě takové pohyblivé, vzájemně interagující struktury jsou charakteristické pro chování třídy IV ([[celularni-automaty]]) a umožňují v CA realizovat výpočet.

::: svg "Glider v 2D CA (Hra života) se po 4 krocích posune o jedno políčko diagonálně — pohyblivá struktura nesoucí informaci."
<svg viewBox="0 0 540 150" font-family="ui-sans-serif, system-ui" font-size="11">
  <rect width="540" height="150" fill="var(--bg-inset)"/>
  <g stroke="var(--line)" stroke-width="0.5">
    <!-- five 5x5 grids, cell size 18 -->
    <g>
      <rect x="20" y="20" width="90" height="90" fill="none" stroke="var(--line-strong)"/>
      <rect x="56" y="20" width="18" height="18" fill="var(--accent)"/>
      <rect x="74" y="38" width="18" height="18" fill="var(--accent)"/>
      <rect x="38" y="56" width="18" height="18" fill="var(--accent)"/>
      <rect x="56" y="56" width="18" height="18" fill="var(--accent)"/>
      <rect x="74" y="56" width="18" height="18" fill="var(--accent)"/>
      <text x="65" y="128" text-anchor="middle" fill="var(--text-muted)" font-size="10">krok 0</text>
    </g>
    <g>
      <rect x="130" y="20" width="90" height="90" fill="none" stroke="var(--line-strong)"/>
      <rect x="148" y="38" width="18" height="18" fill="var(--accent)"/>
      <rect x="184" y="38" width="18" height="18" fill="var(--accent)"/>
      <rect x="166" y="56" width="18" height="18" fill="var(--accent)"/>
      <rect x="184" y="56" width="18" height="18" fill="var(--accent)"/>
      <rect x="166" y="74" width="18" height="18" fill="var(--accent)"/>
      <text x="175" y="128" text-anchor="middle" fill="var(--text-muted)" font-size="10">krok 1</text>
    </g>
    <g>
      <rect x="240" y="20" width="90" height="90" fill="none" stroke="var(--line-strong)"/>
      <rect x="294" y="38" width="18" height="18" fill="var(--accent)"/>
      <rect x="258" y="56" width="18" height="18" fill="var(--accent)"/>
      <rect x="294" y="56" width="18" height="18" fill="var(--accent)"/>
      <rect x="276" y="74" width="18" height="18" fill="var(--accent)"/>
      <rect x="294" y="74" width="18" height="18" fill="var(--accent)"/>
      <text x="285" y="128" text-anchor="middle" fill="var(--text-muted)" font-size="10">krok 2</text>
    </g>
    <g>
      <rect x="350" y="20" width="90" height="90" fill="none" stroke="var(--line-strong)"/>
      <rect x="404" y="38" width="18" height="18" fill="var(--accent)"/>
      <rect x="422" y="56" width="18" height="18" fill="var(--accent)"/>
      <rect x="386" y="74" width="18" height="18" fill="var(--accent)"/>
      <rect x="404" y="74" width="18" height="18" fill="var(--accent)"/>
      <rect x="422" y="74" width="18" height="18" fill="var(--accent)"/>
      <text x="395" y="128" text-anchor="middle" fill="var(--text-muted)" font-size="10">krok 4 (posun ↘)</text>
    </g>
  </g>
  <path d="M 450 65 L 525 100" stroke="var(--accent-line)" stroke-width="1.2" stroke-dasharray="4 3" fill="none"/>
  <text x="500" y="120" text-anchor="middle" fill="var(--text-faint)" font-size="10">posun o 1 buňku</text>
</svg>
:::

## Sebereplikace v CA

**Sebereplikace** je proces, kdy konfigurace buněk v CA vytvoří v prostoru svou **identickou kopii**, přičemž původní struktura zůstane zachována. Klíčem je oddělení **plánu (popisu/genotypu)** od **konstrukčního mechanismu** — replikátor svůj popis jednak *interpretuje* (postaví podle něj nové tělo), jednak *zkopíruje* (předá kopii potomkovi).

- **Von Neumannův univerzální konstruktor.** První návrh univerzálního sebereplikujícího se stroje ve 2D CA: **29 stavů**, von Neumannovo okolí. Stroj se skládá z **popisu** sebe sama (páska/blueprint), **univerzálního konstruktoru** (umí podle popisu postavit libovolný automat) a **kopírovacího mechanismu** (zkopíruje popis a předá ho potomkovi). Tím von Neumann dokázal, že stroj může vyprodukovat stroj stejné nebo vyšší složitosti bez centrálního řízení — a navíc se může i evolvovat akumulací mutací v popisu.
- **Langtonovy smyčky (Christopher Langton, 1984).** Zjednodušení: Langton vypustil požadavek na univerzální výpočet a zaměřil se čistě na sebereplikaci. Použil **2D CA s 8 stavy** a von Neumannovým okolím; smyčka má jen ~86 buněk. V rameni smyčky obíhá genetická informace (datové signály), která při dosažení konce ramene způsobí jeho **prodloužení a ohnutí**; po uzavření nové smyčky se rameno odpojí a vznikne **identický potomek**. Matka pak replikuje do volného směru, dokud má prostor.

::: svg "Sebereplikace v CA: vlevo schéma von Neumannova konstruktoru (popis + konstruktor + kopírka), vpravo Langtonova smyčka — obíhající informace prodlužuje a ohýbá rameno do nové kopie."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <rect width="540" height="200" fill="var(--bg-inset)"/>
  <!-- von Neumann schematic -->
  <text x="16" y="22" fill="var(--text-muted)" font-size="11">von Neumann (29 stavů): popis + univerzální konstruktor + kopírka</text>
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="20" y="36" width="110" height="30"/>
    <rect x="20" y="80" width="110" height="30"/>
    <rect x="20" y="124" width="110" height="30"/>
    <rect x="190" y="80" width="80" height="30"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="75" y="55">popis (páska)</text>
    <text x="75" y="99">konstruktor</text>
    <text x="75" y="143">kopírka popisu</text>
    <text x="230" y="99">potomek</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none">
    <path d="M 130 95 L 188 95"/>
    <path d="M 130 51 C 160 51 160 88 188 88"/>
    <path d="M 130 139 C 160 139 160 102 188 102"/>
  </g>
  <g fill="var(--accent)">
    <path d="M 188 95 l -7 -3 l 0 6 z"/>
  </g>
  <!-- divider -->
  <line x1="300" y1="30" x2="300" y2="180" stroke="var(--line)" stroke-width="0.8" stroke-dasharray="3 3"/>
  <!-- Langton loop schematic -->
  <text x="318" y="22" fill="var(--text-muted)" font-size="11">Langtonova smyčka (8 stavů, 1984)</text>
  <g stroke="var(--accent)" stroke-width="2" fill="none">
    <rect x="330" y="46" width="70" height="70" rx="6"/>
  </g>
  <g fill="var(--accent)">
    <circle cx="365" cy="46" r="3"/>
    <circle cx="400" cy="70" r="3"/>
  </g>
  <!-- growing arm -->
  <path d="M 400 81 L 470 81 L 470 130" stroke="var(--accent-line)" stroke-width="2" fill="none"/>
  <rect x="446" y="106" width="48" height="48" rx="6" stroke="var(--accent-line)" stroke-width="1.5" fill="none" stroke-dasharray="4 3"/>
  <text x="365" y="86" text-anchor="middle" fill="var(--text)" font-size="10">matka</text>
  <text x="470" y="172" text-anchor="middle" fill="var(--text-muted)" font-size="10">rameno → potomek</text>
  <text x="430" y="74" text-anchor="middle" fill="var(--text-faint)" font-size="9">obíhající signál</text>
</svg>
:::

::: link "Von Neumann universal constructor — Wikipedia (29 stavů, popis + konstruktor + kopírka)" "https://en.wikipedia.org/wiki/Von_Neumann_universal_constructor"
:::

::: link "Langton's loops — Wikipedia (8 stavů, von Neumannovo okolí, 1984)" "https://en.wikipedia.org/wiki/Langton%27s_loops"
:::

::: link "L-system — Wikipedia (paralelní přepisování, želví grafika)" "https://en.wikipedia.org/wiki/L-system"
:::

---

*Zdroj: BIN státnicové okruhy NBIO, VUT FIT. Externí reference: von Neumann, J. & Burks, A.W.: Theory of Self-Reproducing Automata (Univ. of Illinois Press, 1966); Langton, C.G.: Self-reproduction in cellular automata (Physica D 10, 1984); Lindenmayer, A.: Mathematical models for cellular interactions in development (J. Theor. Biology, 1968); Wikipedia — Von Neumann universal constructor, Langton's loops, L-system.*
