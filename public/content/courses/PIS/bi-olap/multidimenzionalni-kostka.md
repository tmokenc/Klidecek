# Multidimenzionální kostka — formální model

Datový sklad ([[datovy-sklad]]) je *fyzické úložiště*; OLAP server nad ním nabízí *abstrakci* — **multidimenzionální kostku**. Pro praktickou intuici stačí představa „tabulka s více než dvěma osami"; pro pochopení OLAP operací ale potřebujeme přesnější formalismus. Tato sekce ho zavede.

## Intuice: 3D kostka

Začneme příkladem. Pekárna sleduje denní prodeje rohlíků a párků v Brně a Praze. Data lze přirozeně uspořádat do **trojrozměrné kostky**:

- *Osa X:* dimenze **čas** — `22.6.`, `23.6.`, ...
- *Osa Y:* dimenze **produkt** — *rohlík*, *párek*.
- *Osa Z:* dimenze **region** — *Brno*, *Praha*.

V každé buňce kostky je **fakt** — měřitelná veličina, typicky *prodaný počet* nebo *tržba*. Například buňka `(22.6., rohlík, Brno) = 19` říká, že 22. června se v Brně prodalo 19 rohlíků.

Pro 2 osy bychom mluvili o *matici*, pro $n \geq 3$ o **kostce** (cube). Pro obecné $n$ se mluví o **hyperkostce**, ale i pro $n = 7$ se v praxi používá termín *cube*.

## Dimenze — formální definice

**Dimenze** je *uspořádaná, hierarchicky organizovaná množina hodnot diskrétního typu*. Tři slova jsou důležitá:

- *Diskrétní typ* — dimenze má konečně mnoho různých hodnot (kalendář dnů, seznam produktů, seznam regionů). Spojité dimenze (např. *teplota*) se obvykle *diskretizují* do binů.
- *Uspořádaná* — hodnoty mají daný řazení (čas chronologicky, produkty abecedně).
- *Hierarchicky* — dimenze mívají úrovně agregace: čas (*den → měsíc → kvartál → rok*), místo (*ulice → město → region → země*), produkt (*kód → kategorie → řada*).

Hierarchie dimenze je *klíčová* pro OLAP operace: roll-up znamená *vystoupat o úroveň výš* (z měsíce na kvartál), drill-down znamená *sestoupit o úroveň níž* (z kvartálu zpět na měsíc). Bez hierarchií by tyto operace neměly smysl.

Příklad hierarchie dimenze **čas**:

```
rok → kvartál → měsíc → den → hodina
```

Příklad hierarchie dimenze **místo**:

```
země → region → město → prodejna
```

## Aktivní a neaktivní dimenze

Datový sklad může mít *desítky* dimenzí ($n$ velké), ale konkrétní dotaz zpravidla pracuje jen s podmnožinou. Z formálního hlediska:

- $\{D_1, D_2, \ldots, D_n\}$ — *všechny* dimenze ve skladu.
- $\{A_1, A_2, \ldots, A_m\} \subseteq \{D_1, \ldots, D_n\}$ — **aktivní** dimenze pro daný pohled, kde $m \leq n$.

*Neaktivní* dimenze jsou ty, **přes které se agreguje** (do součtu se sčítá vše). Aktivní dimenze jsou ty, **podle kterých se rozlišuje**.

Pro $m$ aktivních dimenzí existuje $m!$ různých **pořadí** — což odpovídá $m!$ způsobům, jak prezentovat tu samou kostku (např. otočenou jinou stěnou nahoru — *pivoting*, viz [[olap-operace]]).

## Formální definice kostky

**Multidimenzionální kostka** s $m$ aktivními dimenzemi je *zobrazení*:

```math
g_m : (A_1 \times A_2 \times \ldots \times A_m) \rightarrow F
```

kde:

- $A_i$ je $i$-tá aktivní dimenze (její hodnotová doména).
- $A_1 \times A_2 \times \ldots \times A_m$ je *kartézský součin* — všechny možné kombinace hodnot napříč dimenzemi.
- $F$ je doména **faktů** (tzv. *měr*, *measures*) — typicky $\mathbb{R}$ nebo $\mathbb{N}$.
- $g_m$ je *funkce*, která každé kombinaci přiřadí fakt.

V buňce $g_m(a_1, a_2, \ldots, a_m)$ je *jedna konkrétní hodnota* — typicky agregovaná měra (počet, tržba, průměr).

## Fakta a měry

**Fakt** (anglicky *measure*) je *agregovatelná numerická hodnota* — to, co se na buňce kostky měří. Příklady:

- *Počet prodaných kusů* (počet) — SUM, COUNT.
- *Tržba v Kč* (peněžní hodnota) — SUM, AVG, MAX, MIN.
- *Průměrná cena* (per-item) — AVG.
- *Doba zpracování objednávky* (čas) — AVG, MEDIAN.

Jedna kostka může mít **více měr současně** — `(prodejny × čas × produkt) → (tržba, počet, marže)`. Formálně pak $F = \mathbb{R}^3$ nebo se kostka rozpadá na *fact constellation* ([[schemata-skladu]]).

## Příklad 3D kostky

Pro pekárnu z úvodu:

- $A_1 =$ **čas** = $\{22.6., 23.6.\}$
- $A_2 =$ **produkt** = $\{rohlík, párek\}$
- $A_3 =$ **region** = $\{Brno, Praha\}$

Kostka $g_3$ má $|A_1| \cdot |A_2| \cdot |A_3| = 2 \cdot 2 \cdot 2 = 8$ potenciálních buněk. Reálně budou některé prázdné (např. v sobotu se neprodávaly párky v Brně) — to vede ke konceptu **řídké matice**, který rozebereme v další sekci ([[podkostky-svaz]]).

:::svg
<svg viewBox="0 0 540 240" xmlns="http://www.w3.org/2000/svg" style="max-width:580px;width:100%;height:auto;font-family:system-ui,sans-serif;">
  <defs>
    <style>
      .ax{stroke:var(--text, #333);stroke-width:1.5;fill:none}
      .lbl{font-size:12px;fill:var(--text, #333)}
      .lbl-axis{font-size:13px;font-weight:600;fill:var(--accent, #1e5a8e)}
      .cube{fill:var(--bg-card, #e8f0f7);stroke:var(--accent, #1e5a8e);stroke-width:1}
      .cell{font-size:11px;fill:var(--text, #333);text-anchor:middle}
    </style>
  </defs>
  <!-- 3D wireframe cube -->
  <g transform="translate(180,54)">
    <!-- back face -->
    <polygon class="cube" points="60,0 180,0 180,80 60,80" opacity="0.4"/>
    <!-- front face -->
    <polygon class="cube" points="0,40 120,40 120,120 0,120" opacity="0.7"/>
    <!-- connectors -->
    <line class="ax" x1="0" y1="40" x2="60" y2="0"/>
    <line class="ax" x1="120" y1="40" x2="180" y2="0"/>
    <line class="ax" x1="120" y1="120" x2="180" y2="80"/>
    <line class="ax" x1="0" y1="120" x2="60" y2="80"/>
    <!-- axes -->
    <line class="ax" x1="0" y1="120" x2="-10" y2="160" marker-end="url(#arr)"/>
    <line class="ax" x1="120" y1="120" x2="170" y2="160" marker-end="url(#arr)"/>
    <line class="ax" x1="60" y1="0" x2="60" y2="-30" marker-end="url(#arr)"/>
    <text class="lbl-axis" x="-50" y="172">čas</text>
    <text class="lbl-axis" x="170" y="178">produkt</text>
    <text class="lbl-axis" x="50" y="-38">region</text>
    <!-- example labels -->
    <text class="cell" x="60" y="86">19</text>
    <text class="cell" x="100" y="86">5</text>
    <text class="cell" x="60" y="106">22</text>
  </g>
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <polygon points="0,0 6,3 0,6" fill="var(--text, #333)"/>
    </marker>
  </defs>
</svg>
:::

## Co dále

Formálně teď víme, *co je kostka*. V další sekci ([[podkostky-svaz]]) si ukážeme, jak **agregace přes vybrané dimenze** vytváří hierarchii *podkostek* (kuboidů), které tvoří matematický **svaz** (*lattice*).

---

*Zdroj: PIS přednáška 8, prof. Ing. Tomáš Hruška, CSc., FIT VUT v Brně. Externí reference: Gray, J. et al.: „Data Cube: A Relational Aggregation Operator Generalizing Group-By, Cross-Tab, and Sub-Totals" (Data Mining and Knowledge Discovery, 1997); Codd, E.F.: *Providing OLAP to User-Analysts: An IT Mandate* (Hyperion 1993) — kanonický článek zavádějící termín OLAP.*
