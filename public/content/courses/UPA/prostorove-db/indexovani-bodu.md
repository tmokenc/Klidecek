---
title: Indexování bodů — k-D tree, adaptive k-D tree, grid file
---

# Indexování bodů — k-D tree, adaptive k-D tree, grid file

Indexování *bodů* ve více dimenzích je první krok k spatial indexingu. Klasická B-tree *neumí* multi-dimensional data — proto byly vyvinuty specializované struktury: **k-D tree** (multidimensional binary tree), **adaptive k-D tree**, **grid file**, **Quadtree**. Tyto struktury rozdělují prostor pomocí *nadrovin* (axes-parallel) a umožňují efektivní **range queries**, **k-nearest neighbor**, **point lookups**. Indexování objektů s prostorovou extenzí (polygons, rectangles) je předmětem [[rtree]].

## Problém — proč ne B-tree

B-tree (a B+-tree, B*-tree) indexují *1D data* — čísla, řetězce. Pro multi-dimensionální data selže:

* **1D mapping** — lze body v 2D mapovat na 1D (`bit interleaving`, Z-order, Hilbert curve), ale neefektivně. Body blízko v 2D mohou být *daleko* v 1D.
* **Range query** v 1D je `WHERE x BETWEEN a AND b` — jeden interval. V 2D je to *rectangle* — vyžaduje *konjunkci* dvou intervalů. B-tree nepostačuje.

## 1D vs. multi-dim — řazení

V 1D mají body *přirozené uspořádání*:

```
..001 < ..010 < ..011 < ..100 < ..101 < ..110 < ..111 < ..000
   ↑ (cyklicky)
```

V 2D *neexistuje uspořádání*, které by zachovalo lokalitu. Sousední body v 2D mohou mapovat na vzdálené 1D pozice. Proto je třeba *specializovaná* multi-dim struktura.

## k-D tree

**k-D tree** (Bentley 1975) je binární strom rozdělující k-dimensional prostor pomocí *axis-aligned hyperplanes*. Klasicky pro `k=2` (2D body), zobecnitelné na libovolné `k`.

### Princip

* **Každá úroveň** stromu dělí podle *jedné dimenze* (cyklicky: x, y, z, x, y, z, ...).
* **Uzel** ukládá pivot bod; jeho potomci jsou body s *menší/větší* souřadnicí v dané dimenzi.

### Konstrukce (recursive)

```
Vstup: array bodů
Výstup: kořen k-D tree

1. Aktuální dimenze d = 0 (osa X).
2. Pokud vstup prázdný, return null.
3. Seřaď body podle d.
4. Vyber middle bod p (medián).
5. Vytvoř uzel s pivot = p, dimension = d.
6. Pro body menší než p: build subtree s d = (d+1) mod k → left subtree.
   Pro body větší než p: build subtree s d = (d+1) mod k → right subtree.
7. Return uzel.
```

::: svg "k-D tree v 2D: kořen dělí podle X, jeho potomci podle Y, jejich potomci podle X, atd. Body jsou ukládány v uzlech."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <g>
    <rect x="20" y="20" width="200" height="180" fill="var(--bg-inset)" stroke="var(--line)"/>
    <line x1="100" y1="20" x2="100" y2="200" stroke="var(--accent)" stroke-width="2"/>
    <text x="105" y="35" fill="var(--accent)">X=4</text>
    <line x1="20" y1="120" x2="100" y2="120" stroke="var(--accent-line)" stroke-width="1.5"/>
    <text x="40" y="115" fill="var(--accent-line)">Y=6</text>
    <line x1="100" y1="80" x2="220" y2="80" stroke="var(--accent-line)" stroke-width="1.5"/>
    <text x="180" y="75" fill="var(--accent-line)">Y=8</text>
    <line x1="60" y1="120" x2="60" y2="200" stroke="var(--accent)" stroke-width="1.5"/>
    <text x="65" y="180" fill="var(--accent)">X=2</text>
    <line x1="150" y1="80" x2="150" y2="20" stroke="var(--accent)" stroke-width="1.5"/>
    <text x="155" y="35" fill="var(--accent)">X=6</text>
    <g fill="var(--text)">
      <circle cx="100" cy="100" r="3"/>
      <text x="105" y="103" font-size="9">(4,6)</text>
      <circle cx="60" cy="160" r="3"/>
      <text x="50" y="155" font-size="9">(2,3)</text>
      <circle cx="40" cy="100" r="3"/>
      <text x="30" y="95" font-size="9">(1,7)</text>
      <circle cx="150" cy="40" r="3"/>
      <text x="155" y="43" font-size="9">(6,9)</text>
      <circle cx="180" cy="160" r="3"/>
      <text x="180" y="155" font-size="9">(8,3)</text>
    </g>
  </g>
  <g transform="translate(280, 30)">
    <circle cx="100" cy="0" r="14" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="100" y="3" text-anchor="middle" fill="var(--text)" font-size="9">4,6</text>
    <text x="100" y="-20" text-anchor="middle" fill="var(--accent)" font-size="8">X</text>
    <line x1="90" y1="10" x2="60" y2="40" stroke="var(--line)"/>
    <line x1="110" y1="10" x2="140" y2="40" stroke="var(--line)"/>
    <circle cx="50" cy="50" r="14" fill="var(--bg-card)" stroke="var(--accent-line)"/>
    <text x="50" y="53" text-anchor="middle" fill="var(--text)" font-size="9">2,3</text>
    <text x="50" y="30" text-anchor="middle" fill="var(--accent-line)" font-size="8">Y</text>
    <circle cx="150" cy="50" r="14" fill="var(--bg-card)" stroke="var(--accent-line)"/>
    <text x="150" y="53" text-anchor="middle" fill="var(--text)" font-size="9">6,9</text>
    <text x="150" y="30" text-anchor="middle" fill="var(--accent-line)" font-size="8">Y</text>
    <line x1="50" y1="60" x2="20" y2="90" stroke="var(--line)"/>
    <line x1="50" y1="60" x2="80" y2="90" stroke="var(--line)"/>
    <line x1="150" y1="60" x2="180" y2="90" stroke="var(--line)"/>
    <circle cx="15" cy="100" r="14" fill="var(--bg-card)" stroke="var(--accent)"/>
    <text x="15" y="103" text-anchor="middle" fill="var(--text)" font-size="9">1,7</text>
    <text x="15" y="80" text-anchor="middle" fill="var(--accent)" font-size="8">X</text>
    <circle cx="180" cy="100" r="14" fill="var(--bg-card)" stroke="var(--accent)"/>
    <text x="180" y="103" text-anchor="middle" fill="var(--text)" font-size="9">8,3</text>
    <text x="180" y="80" text-anchor="middle" fill="var(--accent)" font-size="8">X</text>
  </g>
</svg>
:::

### Search

```
Vstup: kořen tree, hledaný bod p
Výstup: True/False

1. Aktuální dimenze d = 0.
2. Pokud tree null, return False.
3. Pokud node value = p (porovnání všech dimenzí), return True.
4. Pokud p[d] < node[d], jdi do left subtree, d = (d+1) mod k.
5. Jinak right subtree, d = (d+1) mod k.
6. Continue od 2.
```

Time complexity:
* Balanced tree: O(log N).
* Unbalanced tree: O(N) — degeneruje v lineární seznam.

### Insertion

Recursive:

1. Začni v kořeni, d = 0.
2. Pokud uzel obsahuje bod, který *exactly matches*, return false (duplikát).
3. Jinak rozhodni left/right podle p[d] vs. node[d].
4. Pokud subtree null, vytvoř nový uzel s p.
5. Jinak rekurzivně do subtree.

### Problém — k-D tree není balanced

Klasický k-D tree *neudržuje balance*. Sekvence inserts ve špatném pořadí (např. seřazená sekvence) vytvoří degenerovaný strom (linear list, O(N) operace).

### Deletion

V k-D tree je *non-trivial* — odstranění uzlu vyžaduje *promotion* potomka, ale potomek může mít *jinou dimenzi splitu*. Algoritmus složitý, často se ponechává jako *tombstone* (logické smazání).

## Adaptive k-D tree

**Adaptive k-D tree** zlepšuje klasický k-D tree:

* **Data v listech** — vnitřní uzly *nemají bod*, jen split value. Body jen v listech.
* **Split position** — uprostřed *rozsahu* hodnot v dané dimenzi, ne na median bodu.
* **Lepší pro statická data** — pre-sortuje vše a vytvoří *balanced* strom.

### Konstrukce

```
Vstup: array bodů
Výstup: balanced tree

1. Aktuální dimenze d = 0.
2. Pokud prázdný, return.
3. Pokud 1 bod, vytvoř leaf node s tímto bodem.
4. Najdi min a max v dimenzi d.
5. Set split = (min + max) / 2, ulož v uzlu.
6. Body s hodnotou ≤ split → left subtree (s d = (d+1) mod k).
   Body > split → right subtree.
7. Return uzel.
```

::: svg "Adaptive k-D tree v 2D: vnitřní uzly mají jen split values (ne body), body jsou jen v listech. Lepší balance."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <text x="270" y="20" text-anchor="middle" fill="var(--text)" font-weight="600">Adaptive k-D tree — vnitřní uzly = split values</text>
  </g>
  <g transform="translate(20, 40)">
    <rect x="240" y="0" width="50" height="20" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="265" y="14" text-anchor="middle" fill="var(--accent)" font-size="10">X = 5</text>
    <line x1="250" y1="20" x2="150" y2="50" stroke="var(--line)"/>
    <line x1="280" y1="20" x2="380" y2="50" stroke="var(--line)"/>
    <rect x="125" y="50" width="50" height="20" fill="var(--bg-inset)" stroke="var(--accent-line)"/>
    <text x="150" y="64" text-anchor="middle" fill="var(--accent-line)" font-size="10">Y = 4</text>
    <rect x="355" y="50" width="50" height="20" fill="var(--bg-inset)" stroke="var(--accent-line)"/>
    <text x="380" y="64" text-anchor="middle" fill="var(--accent-line)" font-size="10">Y = 7</text>
    <line x1="130" y1="70" x2="80" y2="100" stroke="var(--line)"/>
    <line x1="170" y1="70" x2="220" y2="100" stroke="var(--line)"/>
    <line x1="360" y1="70" x2="310" y2="100" stroke="var(--line)"/>
    <line x1="400" y1="70" x2="450" y2="100" stroke="var(--line)"/>
    <circle cx="80" cy="115" r="18" fill="var(--bg-card)" stroke="var(--accent)"/>
    <text x="80" y="113" text-anchor="middle" fill="var(--text)" font-size="9">(2,3)</text>
    <text x="80" y="125" text-anchor="middle" fill="var(--text-muted)" font-size="8">leaf</text>
    <circle cx="220" cy="115" r="18" fill="var(--bg-card)" stroke="var(--accent)"/>
    <text x="220" y="113" text-anchor="middle" fill="var(--text)" font-size="9">(3,7)</text>
    <text x="220" y="125" text-anchor="middle" fill="var(--text-muted)" font-size="8">leaf</text>
    <circle cx="310" cy="115" r="18" fill="var(--bg-card)" stroke="var(--accent)"/>
    <text x="310" y="113" text-anchor="middle" fill="var(--text)" font-size="9">(8,3)</text>
    <text x="310" y="125" text-anchor="middle" fill="var(--text-muted)" font-size="8">leaf</text>
    <circle cx="450" cy="115" r="18" fill="var(--bg-card)" stroke="var(--accent)"/>
    <text x="450" y="113" text-anchor="middle" fill="var(--text)" font-size="9">(7,9)</text>
    <text x="450" y="125" text-anchor="middle" fill="var(--text-muted)" font-size="8">leaf</text>
  </g>
</svg>
:::

### Problémy

* **Pokud body kolineární** (např. všechny na ose X), split podle X *nepomůže*. Nutno hledat dimenzi, kde body mají rozsah > 0.
* **Při všech bodech na stejné dimensi** — leaf s více body.

### Vlastnosti

* **Statické** — preferováno pro read-mostly data.
* **Balanced** — O(log N) operace.
* **Insertions/deletions drahé** — můžou vyžadovat rebuild.

## Range query

`SELECT * FROM points WHERE x BETWEEN 5 AND 10 AND y BETWEEN 3 AND 7`:

```
ranges = ((5,10), (3,7))
recursive_range_search(node, ranges, dimension):
  if leaf: return points within ranges
  d = dimension
  if ranges[d].min < node.split:
    search left subtree, d = (d+1) mod k
  if ranges[d].max >= node.split:
    search right subtree, d = (d+1) mod k
```

O(N^(1-1/k) + R), kde R je počet výsledků. Pro 2D: O(√N + R).

## k-nearest neighbor (k-NN)

"Najdi 5 nejbližších bodů k danému bodu p":

Algorithm "best-first" search:
1. Stack uzlů k procházení.
2. Priority queue výsledků (max-heap velikosti k).
3. Procházet stromem, pro každý uzel:
   * Pokud minimal distance od MBB uzlu > kth nearest, skip.
   * Jinak rekurzivně do potomků.

Čas: O(log N) v průměru, O(N) worst case.

::: viz kd-tree-builder "Klikněte v add mode pro přidání bodu; k-D tree alternuje split x/y. Tahejte rohy oranžového query box — sledujte, které podstromy se prořezají."
:::

## Grid file

**Grid file** (Nievergelt et al. 1984) je *non-hierarchical* index — rozděluje prostor na *grid* (mřížku) buněk fixní velikosti. Každá buňka odkazuje na *data page* obsahující body z této buňky.

### Princip

* Prostor `[A, B]` (např. lat/lng oblast) je rozdělen na intervaly podle *scale vectors* (jeden per dimenze).
* Každá buňka má pointer na data page.
* Buňky mohou *sdílet* stejnou data page (pokud jsou méně husté).

### Adaptivní

Při overflow buňky se *rozdělí* (split scale vector). Nepravidelná struktura adaptuje na hustotu dat.

### Operace

* **Insert** — najít buňku, vložit do její data page. Pokud overflow, split.
* **Search** — najít buňku, prohledat data page.
* **Range query** — najít *všechny* buňky překrývající rectangle, prohledat.

::: svg "Grid file: 2D prostor je rozdělen na grid buněk. Každá buňka obsahuje data page se svými body."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <g>
    <rect x="40" y="30" width="200" height="160" fill="var(--bg-inset)" stroke="var(--line)"/>
    <line x1="100" y1="30" x2="100" y2="190" stroke="var(--line)"/>
    <line x1="160" y1="30" x2="160" y2="190" stroke="var(--line)"/>
    <line x1="40" y1="80" x2="240" y2="80" stroke="var(--line)"/>
    <line x1="40" y1="140" x2="240" y2="140" stroke="var(--line)"/>
    <g fill="var(--accent)">
      <circle cx="60" cy="50" r="3"/>
      <circle cx="80" cy="65" r="3"/>
      <circle cx="120" cy="55" r="3"/>
      <circle cx="180" cy="60" r="3"/>
      <circle cx="55" cy="100" r="3"/>
      <circle cx="120" cy="110" r="3"/>
      <circle cx="200" cy="120" r="3"/>
      <circle cx="65" cy="160" r="3"/>
      <circle cx="180" cy="170" r="3"/>
    </g>
    <text x="140" y="200" text-anchor="middle" fill="var(--text-muted)">Grid s 9 buňkami, body v buňkách</text>
  </g>
  <g>
    <text x="380" y="30" fill="var(--text)" font-weight="600">Data pages</text>
    <rect x="300" y="50" width="100" height="20" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="350" y="64" text-anchor="middle" fill="var(--text)" font-size="9">Cell(0,0) → page A</text>
    <rect x="300" y="75" width="100" height="20" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="350" y="89" text-anchor="middle" fill="var(--text)" font-size="9">Cell(0,1) → page A</text>
    <rect x="300" y="100" width="100" height="20" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="350" y="114" text-anchor="middle" fill="var(--text)" font-size="9">Cell(1,0) → page B</text>
    <rect x="300" y="125" width="100" height="20" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="350" y="139" text-anchor="middle" fill="var(--text)" font-size="9">Cell(2,2) → page C</text>
    <text x="350" y="170" text-anchor="middle" fill="var(--text-muted)" font-size="9">buňky sdílejí page</text>
    <text x="350" y="183" text-anchor="middle" fill="var(--text-muted)" font-size="9">pokud husté shodně</text>
  </g>
</svg>
:::

### Pros / cons

* **+** Velmi rychlé point queries (constant overhead nezávisle na N).
* **+** Range queries efektivní.
* **−** *Hustá* oblast může vytvořit mnoho *split intervals*, pomalé range queries.
* **−** Pro nerovnoměrná data (skewed) horší než tree-based struktury.

## Quadtree

**Quadtree** (Finkel, Bentley 1974) je další klasická struktura pro 2D.

### Princip

* Každý uzel reprezentuje *kvadrant prostoru*.
* Vnitřní uzel má 4 potomky (NW, NE, SW, SE).
* Listový uzel obsahuje body.
* Při overflow se uzel **rozdělí na 4 kvadranty**.

Pro 3D je obdoba **Octree** (8 potomků per uzel).

### Pros / cons

* **+** Intuitivní, snadné na implementaci.
* **+** Adaptivní — rozsah dělíme jen tam, kde jsou data.
* **−** *Unbalanced* pro nerovnoměrná data.
* **−** Hluboké stromy pro malé objekty v jedné oblasti.

Použití: image processing, level-of-detail rendering (game engines), Google Maps tiles.

## Twin Grid File

Pro dynamickou modifikaci dat — dvě grid file struktury:
* **Primary** — pro hustá data.
* **Secondary** — pro rare hodnoty (které by zhoršovaly primary).

Search běží *paralelně* v obou. Insertions optimalizovány podle hustoty.

## Srovnání

| Struktura | Static/Dynamic | Balance | Range queries | k-NN | Implementace |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **k-D tree** | dynamic | ne | dobrá | dobrá | jednoduchá |
| **Adaptive k-D** | static | ano | dobrá | dobrá | středně |
| **Grid file** | dynamic | n/a | velmi dobrá | středně | středně |
| **Quadtree** | dynamic | ne | dobrá | dobrá | jednoduchá |
| **R-tree** | dynamic | ano | velmi dobrá | velmi dobrá | komplexní |

V praxi **R-tree** ([[rtree]]) dominuje pro spatial DB — funguje pro body i rectangles.

## Implementace

* **PostGIS** — GiST (Generalized Search Tree) s R-tree algoritmem (defaultně), SP-GiST pro k-D tree alternative.
* **MongoDB** — 2dsphere index (geo data), 2d index (planar).
* **Elasticsearch** — Bkd tree (block k-D tree) pro multi-dim data.
* **DuckDB** — R-tree spatial extension.
* **scipy** — `KDTree`, `cKDTree` (C implementace) pro in-memory.

```python
from scipy.spatial import KDTree
import numpy as np

points = np.array([[2, 3], [5, 4], [9, 6], [4, 7]])
tree = KDTree(points)

# k-NN
dist, idx = tree.query([4, 5], k=2)
print(f"2 nejbližší: {points[idx]}, vzdálenosti: {dist}")

# Range query
indices = tree.query_ball_point([5, 5], r=3)
print(f"V poloměru 3: {points[indices]}")
```

::: link "Bentley, J. L.: Multidimensional Binary Search Trees Used for Associative Searching (CACM 1975)" "https://dl.acm.org/doi/10.1145/361002.361007"
:::

::: link "Nievergelt, J., Hinterberger, H., Sevcik, K. C.: The Grid File — An Adaptable, Symmetric Multikey File Structure (ACM TODS 1984)" "https://dl.acm.org/doi/10.1145/348.318586"
:::

---

*Zdroj: UPA přednáška *Spatial Databases* (Kolář). Externí reference: Bentley, J. L.: *Multidimensional Binary Search Trees Used for Associative Searching*, CACM 18(9), 1975; Nievergelt, J., Hinterberger, H., Sevcik, K. C.: *The Grid File — An Adaptable, Symmetric Multikey File Structure*, ACM TODS 9(1), 1984; Finkel, R. A., Bentley, J. L.: *Quad Trees — A Data Structure for Retrieval on Composite Keys*, Acta Informatica 1974; Samet, H.: *Foundations of Multidimensional and Metric Data Structures*, Morgan Kaufmann 2006.*
