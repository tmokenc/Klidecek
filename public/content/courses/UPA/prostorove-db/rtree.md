---
title: R-tree a varianty — indexování objektů s prostorovou extenzí
---

# R-tree a varianty — indexování objektů s prostorovou extenzí

**R-tree** (Guttman 1984) je *de facto* standard pro indexování objektů s prostorovou extenzí — *rectangles*, polygons, lines. Na rozdíl od [[indexovani-bodu]] (k-D tree pro body), R-tree umí indexovat libovolné geometrie přes jejich **Minimum Bounding Rectangles (MBR)**. R-tree je *vyvážený* (jako B-tree, ale pro 2D+ data), umožňuje efektivní spatial queries (range, intersection, k-NN). Vznikly četné varianty: **R*-tree** (lepší MBR overlapping), **R+-tree** (žádný overlap), **PR-tree** (priority), **STR-tree** (sort-tile-recursive bulk loading). Pochopení R-tree je *klíčové* pro performance spatial DB.

## Princip — MBR jako proxy

Klíčová myšlenka: indexovat ne původní geometrii (drahá k testování), ale její **Minimum Bounding Rectangle** — nejmenší osově-orientovaný obdélník obklopující objekt.

```
Polygon (motýlek):
  vertices = [(2,3), (8,3), (5,5), (8,7), (2,7), (5,5)]

MBR:
  ((2,3), (8,7))   -- bottom-left, top-right
```

MBR test je *velmi levný* (porovnání 4 čísel). Pro test "intersects" stačí MBR comparison. Pokud MBR nepřekrývá, *objekty určitě* nepřekrývají. Pokud MBR překrývá, *možná* překrývají — refine s exact test.

## Strom — analogie k B-tree

R-tree je **balanced n-ary tree** podobný B-tree:

* **Vnitřní uzel** obsahuje *(MBR, child_pointer)* páry. MBR je *obal MBR všech potomků*.
* **Listový uzel** obsahuje *(MBR, data_pointer)* páry. MBR objektu + pointer na data.
* **Fan-out** — typicky `M = 50–200` (B-tree-like).
* **Minimum entries** per uzel: `m ≤ M/2`.
* Strom je *automaticky balanced* — split/merge operations.

::: svg "R-tree struktura: root node obsahuje 2 MBRs pokrývající children. Vnitřní uzly obsahují MBRs pro subgroupings; listové uzly obsahují MBRs pro skutečné objekty."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="10">
  <g>
    <text x="270" y="20" text-anchor="middle" fill="var(--text)" font-weight="600">R-tree (strom)</text>
    <rect x="240" y="35" width="60" height="25" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="270" y="51" text-anchor="middle" fill="var(--text)" font-size="9">R | MBR1, MBR2</text>
    <line x1="250" y1="60" x2="160" y2="85" stroke="var(--line)"/>
    <line x1="290" y1="60" x2="380" y2="85" stroke="var(--line)"/>
    <rect x="120" y="85" width="80" height="25" fill="var(--bg-card)" stroke="var(--accent-line)"/>
    <text x="160" y="101" text-anchor="middle" fill="var(--text)" font-size="9">MBR1 → r1,r2,r3</text>
    <rect x="340" y="85" width="80" height="25" fill="var(--bg-card)" stroke="var(--accent-line)"/>
    <text x="380" y="101" text-anchor="middle" fill="var(--text)" font-size="9">MBR2 → r4,r5,r6</text>
    <line x1="160" y1="110" x2="100" y2="140" stroke="var(--line)"/>
    <line x1="160" y1="110" x2="160" y2="140" stroke="var(--line)"/>
    <line x1="160" y1="110" x2="220" y2="140" stroke="var(--line)"/>
    <line x1="380" y1="110" x2="320" y2="140" stroke="var(--line)"/>
    <line x1="380" y1="110" x2="380" y2="140" stroke="var(--line)"/>
    <line x1="380" y1="110" x2="440" y2="140" stroke="var(--line)"/>
    <g fill="var(--accent)">
      <rect x="80" y="140" width="40" height="25" fill="var(--bg-card)" stroke="var(--accent)"/>
      <text x="100" y="156" text-anchor="middle" fill="var(--text)" font-size="8">r1: obj</text>
      <rect x="140" y="140" width="40" height="25" fill="var(--bg-card)" stroke="var(--accent)"/>
      <text x="160" y="156" text-anchor="middle" fill="var(--text)" font-size="8">r2: obj</text>
      <rect x="200" y="140" width="40" height="25" fill="var(--bg-card)" stroke="var(--accent)"/>
      <text x="220" y="156" text-anchor="middle" fill="var(--text)" font-size="8">r3: obj</text>
      <rect x="300" y="140" width="40" height="25" fill="var(--bg-card)" stroke="var(--accent)"/>
      <text x="320" y="156" text-anchor="middle" fill="var(--text)" font-size="8">r4: obj</text>
      <rect x="360" y="140" width="40" height="25" fill="var(--bg-card)" stroke="var(--accent)"/>
      <text x="380" y="156" text-anchor="middle" fill="var(--text)" font-size="8">r5: obj</text>
      <rect x="420" y="140" width="40" height="25" fill="var(--bg-card)" stroke="var(--accent)"/>
      <text x="440" y="156" text-anchor="middle" fill="var(--text)" font-size="8">r6: obj</text>
    </g>
  </g>
</svg>
:::

## Search

```
search(T, S):   -- T je kořen, S je hledaný rectangle
  if T not leaf:
    pro každou entry E v T:
      if E.MBR overlapsByś S:
        recursive search v E.subtree
  if T is leaf:
    pro každou entry E v T:
      if E.MBR overlaps S:
        E je qualifying record (return)
```

Časová složitost závisí na **MBR overlap** mezi uzly — v R-tree mohou *sousední uzly mít překrývající MBR*, takže search může jít *více cestami*.

## Insert

```
insert(T, E):
  L = ChooseLeaf(T, E)         -- najít leaf, kde umístit
  pokud má L místo:
    add E to L
  jinak:
    SplitNode(L, E)             -- rozdělit, vrátit L a LL
  AdjustTree(L, LL)              -- propagate change nahoru
  pokud root split:
    create new root with 2 children
```

### ChooseLeaf

```
N = root
while N is not leaf:
  F = entry whose MBR needs least enlargement to include E.MBR
  ties broken by smallest area
  N = F.child
return N
```

Strategie: vyber subtree, *jehož MBR se nejméně zvětší* po insertu. Tím se minimalizuje overlap.

### Split — rozdělení uzlu

Když uzel přeteče (`M+1` entries), nutno rozdělit na 2.

### Quadratic Split

```
PickSeeds:
  for each pair of entries E1, E2:
    compose J = MBR(E1) + MBR(E2)
    d = area(J) - area(E1) - area(E2)
  vybrat pair s největším d (nejvíc "nepříbuzná")

PickNext:
  pro každý non-grouped entry E:
    d1 = area increase pokud do group 1
    d2 = area increase pokud do group 2
  vybrat E s největším |d1 - d2|, přiřadit do menší group
```

Complexity: O(M²).

### Linear Split (rychlejší, ale méně optimální)

```
LinearPickSeeds:
  pro každou dimenzi:
    find entry s nejvyšším low side
    find entry s nejnižším high side
    record separation
  normalize by total extent in each dimension
  vybrat pair s největší normalized separation
```

Complexity: O(M).

## AdjustTree

Po splitu propagovat změny nahoru:

```
N = L (modified leaf)
NN = LL (new sibling pokud split)
while N != root:
  P = parent of N
  EN = entry pro N v P
  tighten EN.MBR around all entries in N
  pokud NN existuje:
    vytvoř ENN pro NN
    add ENN to P
    pokud P overflows:
      SplitNode(P, ENN)
  N = P, NN = PP (pokud split P)
```

## Deletion

Nejsložitější operace:

```
delete(T, E):
  L = FindLeaf(T, E)
  remove E from L
  CondenseTree(L)
  if root has 1 child: replace root with child
```

### CondenseTree

```
N = L (where E removed)
Q = set of eliminated nodes
while N != root:
  P = parent of N
  if N has < m entries:
    delete EN from P
    add N to Q
  else:
    tighten EN.MBR
  N = P
re-insert all entries from Q (na správné úrovně)
```

Při underflow se uzel *odstraní* a jeho entries se *re-insert* na vhodnou úroveň. Toto je drahá operace.

## R*-tree

**R*-tree** (Beckmann et al. 1990) je vyzrálá varianta R-tree, která řeší slabosti původního:

* **Forced reinsert** — místo splitu nejprve re-insert nějaké entries (umístí je do lepších uzlů).
* **Better split heuristic** — minimum overlap, ne jen min area.
* **Squarish rectangles** — preferuj uzly s poměrově balancovanými MBR.

R*-tree poskytuje:
* Lepší search performance (méně překryvů).
* Vyšší fill factor.
* Mírně nákladnější insertion (re-insert overhead).

V praxi *většina implementací* používá R*-tree (PostGIS GiST používá variantu R*-tree).

## R+-tree

**R+-tree** (Sellis, Roussopoulos, Faloutsos 1987) zakazuje *overlap* mezi MBR uzlů.

* **MBR uzlů nesmí překrývat**.
* Pokud objekt přesahuje hranice několika nodů, je *duplikován* v každém.

* **+** Search je rychlejší — jen jedna cesta od kořene.
* **−** Insert je drahá — duplikace objektů.
* **−** Storage overhead.

Použití: read-mostly workload (data warehouse pro spatial data).

## Bulk loading — STR

Pro *static* data (kde se nikdy nemění) lze postavit R-tree *efektivně* "bulk-loading":

**STR** (Sort-Tile-Recursive) algoritmus (Leutenegger, Edgington, Lopez 1997):

1. Seřaď objekty podle X-souřadnice.
2. Rozděl na √(N/M) "slabs" (vertikální pásy).
3. V každém slab seřaď podle Y, rozděl na M-tice (listové uzly).
4. Rekurzivně postup pro vyšší úrovně.

Výsledek: balanced, dobrá lokalita, vysoký fill factor. Mnohem rychlejší než insert-by-insert (10×–100×).

## Indexování bodů pomocí R-tree

R-tree umí indexovat i *body* — bod je *degenerovaný rectangle* s nulovou plochou (`min = max`).

Performance pro body je *konkurenceschopná* k k-D tree pro většinu queries. R-tree má výhodu, že *jedna struktura* zvládne body i polygony.

::: viz rtree-insert-split "Tahem na ploše vytvořte obdélník — ChooseLeaf vybere subtree s nejmenším zvětšením MBR. Při přetečení (M=4) Quadratic Split rozdělí entries. Tahejte oranžový query rect — sledujte počet visited/pruned uzlů."
:::

## R-tree v praxi

* **PostGIS** — GiST index s R-tree algoritmem. `CREATE INDEX ... USING GIST (geom)`.
* **Oracle Spatial** — R-tree index.
* **MongoDB** — 2dsphere a 2d indexy (variant R-tree).
* **Elasticsearch** — používá Bkd tree (block k-D), ne R-tree.
* **SQLite SpatiaLite** — R*-tree extension.

```sql
-- PostGIS
CREATE INDEX idx_buildings_geom ON buildings USING GIST (geom);

-- Query využívající index
SELECT * FROM buildings
WHERE geom && ST_MakeEnvelope(16.55, 49.15, 16.65, 49.25, 4326);
   -- '&&' uses R-tree index pro MBR test
```

## Praktické tipy

* **Vždy indexujte spatial sloupce** — bez indexu jsou queries lineární (O(N)).
* **CLUSTER tabulku** — `CLUSTER buildings USING idx_buildings_geom` — fyzicky seřadí data podle indexu, zvyší cache locality.
* **VACUUM ANALYZE** — pravidelně, optimizer pak má aktuální statistiky.
* **Použijte správný geom typ** — Point pro lokace, Polygon pro hranice, ne univerzální Geometry.
* **MBR queries first** — `geom && bbox` před `ST_Intersects(geom, exact)`.

## Composability — multi-dim R-tree

R-tree pracuje v *libovolné dimenzi*. Pro 3D modely (CAD, GIS s nadmořskou výškou), 4D (3D + čas), nebo high-dim feature vectors (ML).

Pro very high-dim (100+) selhává — *curse of dimensionality*, MBR ztrácí selectivity (mnoho překryvů). Pro velmi vysokou dimensi alternativy: VP-tree, ball tree, LSH (locality-sensitive hashing).

## Alternativy

* **Hilbert R-tree** — uspořádává podle Hilbertovy křivky (better clustering).
* **PR-tree** (Priority R-tree) — guaranteed worst-case complexity.
* **TR-tree** (Time-Parameterized R-tree) — pro moving objects.

## Použití mimo spatial DB

R-tree používán v:
* **GIS** (PostGIS, ArcGIS).
* **CAD** (AutoCAD, SolidWorks) — collision detection.
* **Game engines** — spatial hash for physics.
* **VLSI design** — chip layout.
* **Image processing** — feature matching.
* **Networking** — IP routing (Hi-CUTS).

::: link "Guttman, A.: R-Trees — A Dynamic Index Structure for Spatial Searching (SIGMOD 1984)" "http://www-db.deis.unibo.it/courses/SI-LS/papers/Gut84.pdf"
:::

::: link "Beckmann, N., Kriegel, H.-P., Schneider, R., Seeger, B.: The R*-tree — An Efficient and Robust Access Method for Points and Rectangles (SIGMOD 1990)" "https://dl.acm.org/doi/10.1145/93605.98741"
:::

::: link "Leutenegger, S. T., Edgington, J., Lopez, M. A.: STR — A Simple and Efficient Algorithm for R-Tree Packing (ICDE 1997)" "https://ieeexplore.ieee.org/document/581905"
:::

---

*Zdroj: UPA přednáška *Spatial Databases* (Kolář). Externí reference: Guttman, A.: *R-Trees — A Dynamic Index Structure for Spatial Searching*, SIGMOD 1984; Beckmann, N. et al.: *The R*-tree*, SIGMOD 1990; Sellis, T., Roussopoulos, N., Faloutsos, C.: *The R+-Tree*, VLDB 1987; Samet, H.: *Foundations of Multidimensional and Metric Data Structures*, Morgan Kaufmann 2006.*
