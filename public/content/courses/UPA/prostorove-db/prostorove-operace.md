---
title: Prostorové operace, predikáty a metriky
---

# Prostorové operace, predikáty a metriky

Prostorové databáze poskytují **bohatou sadu operací** nad prostorovými typy ([[prostorove-typy]]) — od jednoduchých metrik (vzdálenost, délka) po složité konstrukce (Voronoi diagramy, konvexní obal). Mnoho operací je *netriviálně drahých* — výpočet průniku dvou polygonů je O(n·m) v plné přesnosti. DB optimizéry proto používají **dvoufázové vyhodnocení**: nejprve rychlý filtr přes prostorový index (MBB approximation), pak přesný test. Pochopení této strategie je klíčové pro správný design schématu a indexy.

## Typy operací

### Numerické konstanty / charakteristiky

Vypočtené při uložení nebo *cacheované*:

* `ST_Length(line)` — délka.
* `ST_Area(polygon)` — obsah.
* `ST_Perimeter(polygon)` — obvod.
* `ST_NumPoints(geom)` — počet vrcholů.

Tyto hodnoty se mohou *pre-vypočítat* a uložit jako sloupce (denormalizace) — neopětovně počítat při každém dotazu.

### Prostorové konstanty / charakteristiky

Vypočtené při uložení, vytváří *novou prostorovou hodnotu*:

* `ST_Centroid(geom)` — těžiště.
* `ST_PointOnSurface(geom)` — *libovolný* bod uvnitř geometrie (užitečné pro labelové umístění).
* `ST_Envelope(geom)` — *minimum bounding box* (MBB).
* `ST_ConvexHull(geom)` — konvexní obal.

### Metriky (relační)

Vrátí *číslo*, nelze pre-vypočítat (závisí na dvou objektech):

* `ST_Distance(g1, g2)` — minimální vzdálenost mezi g1 a g2.
* `ST_HausdorffDistance(g1, g2)` — Hausdorffova vzdálenost (max-min).
* `ST_Frechet(g1, g2)` — Fréchetova vzdálenost (pro trajektorie).
* `ST_MaxDistance(g1, g2)` — největší vzdálenost.

### Predikáty (booleovské)

Vrátí `true`/`false`, neutvoří novou geometrii:

* `ST_Equals(g1, g2)` — geometricky shodné.
* `ST_Disjoint(g1, g2)` — žádný společný bod.
* `ST_Intersects(g1, g2)` — sdílí alespoň jeden bod.
* `ST_Touches(g1, g2)` — sdílí jen hranici, ne interier.
* `ST_Crosses(g1, g2)` — pro čáry křížící polygony.
* `ST_Within(g1, g2)` — g1 je *uvnitř* g2.
* `ST_Contains(g1, g2)` — g1 *obsahuje* g2.
* `ST_Overlaps(g1, g2)` — částečný překryv (intersects but neither contains).

### Operace tvoříce nové objekty

Vrátí *novou* geometrii:

* `ST_Intersection(g1, g2)` — průnik.
* `ST_Union(g1, g2)` — sjednocení (může být MultiPolygon).
* `ST_Difference(g1, g2)` — rozdíl.
* `ST_SymDifference(g1, g2)` — symetrický rozdíl.
* `ST_Buffer(geom, dist)` — body do vzdálenosti `dist` od geom.
* `ST_Voronoi(points)` — Voronoiovy buňky pro množinu bodů.

## DE-9IM — formální klasifikace prostorových vztahů

**Dimensionally Extended 9-Intersection Model** (Egenhofer, Herring 1990) je *teoretický framework* pro popis vzájemné polohy dvou geometrií. Každá geometrie má tři části:

* **Interior** (I) — vnitřek.
* **Boundary** (B) — hranice.
* **Exterior** (E) — vnějšek.

Pro dvě geometrie `A` a `B` máme **9 možných průniků**: `I(A) ∩ I(B)`, `I(A) ∩ B(B)`, `I(A) ∩ E(B)`, `B(A) ∩ I(B)`, atd. Každý průnik má *dimensi*:
* `-1` (F) — prázdná množina.
* `0` — body.
* `1` — čáry.
* `2` — plochy.

Tyto 9 dimenzí tvoří **matici 3×3** = "DE-9IM signature" vztahu.

Příklad: `Equals(A, B)` ⇔ `I(A) = I(B), B(A) = B(B), E(A) = E(B)`. Signature: `T*F**FFF*` (T = true, F = false, * = libovolné).

Standardní predikáty (Contains, Touches, ...) jsou *zkratky* nad DE-9IM matricí.

Implementace DE-9IM ve většině spatial DB.

## Operace nad regiony

### Příklad: Brno + Brněnská přehrada

* `Brno` — Polygon (R-cycle), 200 km² obsah.
* `Brnenska_prehrada` — Polygon, 2.5 km² obsah, uvnitř Brna.

```sql
-- Skutečná plocha Brna (země bez vody):
SELECT ST_Area(ST_Difference(brno.geom, prehrada.geom)) AS land_area
FROM cities brno, lakes prehrada
WHERE brno.name = 'Brno' AND prehrada.name = 'Brnenska prehrada';

-- Lake je uvnitř Brna?
SELECT ST_Contains(brno.geom, prehrada.geom) AS lake_inside;   -- true

-- Region (Polygon s dírou) = země Brna - přehrada
-- Skladujeme jako:
SELECT ST_GeomFromText('POLYGON(
  (...brno boundary...),
  (...prehrada boundary...)
)', 4326);
```

## Operace producing more than one object

Některé operace mohou vrátit *množinu* objektů — DB musí to reprezentovat jako `GeometryCollection` nebo `Multi*`:

```sql
-- Průnik dvou polygonů může být disconnect → MultiPolygon
SELECT ST_Intersection(park1.geom, park2.geom) FROM parks;

-- Voronoi diagram vrátí kolekci buněk
SELECT ST_VoronoiPolygons(ST_Collect(point)) FROM cities;
```

## Operace nad sets (kolekcemi)

Mnoho operací produkuje výsledek nad celou *množinou* záznamů:

```sql
-- Plocha všech parků v Brně
SELECT SUM(ST_Area(geom)) FROM parks WHERE city = 'Brno';

-- Total length silnic
SELECT SUM(ST_Length(geom)) FROM roads;

-- Bounding box all features
SELECT ST_Envelope(ST_Collect(geom)) FROM features;

-- Aggregate UNION
SELECT ST_Union(geom) FROM regions WHERE country = 'CZ';
```

## Operace s viewportem

V GIS aplikaci uživatel zobrazuje *mapový výřez* — viewport. Operace s ohledem na viewport:

```sql
-- Vrať features ve viewport (s buffer pro plynulé scroll)
SELECT id, name, geom FROM features
WHERE geom && ST_MakeEnvelope(min_x, min_y, max_x, max_y, 4326);
   -- '&&' = "intersects bounding box" — rychlý filter přes index

-- Compute display label position (centroid)
SELECT ST_Centroid(geom) FROM features WHERE id = 42;

-- Coloring podle aggregace (choropleth map)
SELECT region.geom, COUNT(p.*) AS population
FROM regions region LEFT JOIN people p ON ST_Contains(region.geom, p.location)
GROUP BY region.id;
```

## Spatial JOIN

JOIN tabulek podle prostorového vztahu:

```sql
-- Pro každý zákazník najdi nejbližší pobočku
SELECT c.name, b.name,
       ST_Distance(c.location, b.location) AS distance
FROM customer c, branch b
WHERE ST_DWithin(c.location, b.location, 5000)   -- 5 km
ORDER BY c.id, distance;

-- Pobočky uvnitř Brna
SELECT b.* FROM branches b, cities c
WHERE c.name = 'Brno' AND ST_Contains(c.geom, b.location);

-- Silnice křižující řeku
SELECT r.name, river.name FROM roads r, rivers river
WHERE ST_Crosses(r.geom, river.geom);
```

JOIN přes `ST_Distance` nebo `ST_Contains` může být *velmi drahý* O(N × M) bez prostorového indexu — DB musí porovnat každý zákazník s každou pobočkou.

## Dvoufázové vyhodnocení

Pro výkon prostorové DB používají **2-phase evaluation**:

### Phase 1 — Filter

Rychlý approximate test přes **Minimum Bounding Box (MBB)** — nejmenší obdélník obsahující geometrii.

```
MBB(polygon) = ((min_x, min_y), (max_x, max_y))
```

Pro test "intersects" stačí porovnat MBB:
```
MBB_A intersects MBB_B?
  → A může intersect B (ne nutně)
  → A definitely doesn't intersect B (pokud MBB se nepotkávají)
```

MBB tests jsou *velmi levné* (4 porovnání čísel). Pro R-tree index O(log N).

### Phase 2 — Refine

Pro páry s MBB intersection udělat *přesný* test (drahý).

```
exact_intersects(geometry A, geometry B) — O(n × m) v worst case
```

::: svg "Dvoufázové vyhodnocení: nejprve filter přes Minimum Bounding Box (rychlé, eliminuje 99% non-matches), pak refine přesný test na zbývajících kandidátech."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="20" y="40" width="120" height="120" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="80" y="62" text-anchor="middle" fill="var(--text)" font-weight="600">Phase 1: Filter</text>
    <text x="80" y="80" text-anchor="middle" fill="var(--text-muted)" font-size="10">MBB approximation</text>
    <rect x="40" y="90" width="80" height="50" fill="var(--bg-inset)" stroke="var(--accent-line)" stroke-dasharray="2 2"/>
    <polygon points="50,100 65,95 100,110 90,130 60,130" fill="none" stroke="var(--accent)"/>
    <text x="80" y="155" text-anchor="middle" fill="var(--text-muted)" font-size="9">O(log N) přes R-tree</text>
  </g>
  <text x="160" y="105" fill="var(--accent)" font-size="16">→</text>
  <g>
    <rect x="180" y="40" width="180" height="120" fill="var(--bg-card)" stroke="var(--accent-line)" rx="6"/>
    <text x="270" y="62" text-anchor="middle" fill="var(--text)" font-weight="600">Kandidáti</text>
    <text x="270" y="80" text-anchor="middle" fill="var(--text-muted)" font-size="10">~ 1% z N</text>
    <g font-size="9.5">
      <text x="270" y="110" text-anchor="middle" fill="var(--text-muted)">8M → ~ 80 K kandidátů</text>
      <text x="270" y="125" text-anchor="middle" fill="var(--text-muted)">většina je *true positive*</text>
      <text x="270" y="140" text-anchor="middle" fill="var(--text-muted)">trochu *false positive*</text>
    </g>
  </g>
  <text x="380" y="105" fill="var(--accent)" font-size="16">→</text>
  <g>
    <rect x="400" y="40" width="120" height="120" fill="var(--bg-card)" stroke="var(--accent)" rx="6" stroke-width="2"/>
    <text x="460" y="62" text-anchor="middle" fill="var(--text)" font-weight="600">Phase 2: Refine</text>
    <text x="460" y="80" text-anchor="middle" fill="var(--text-muted)" font-size="10">exact test</text>
    <text x="460" y="100" text-anchor="middle" fill="var(--accent)">≈ 50 K matches</text>
    <text x="460" y="130" text-anchor="middle" fill="var(--text-muted)" font-size="9">O(n × m) per pair,</text>
    <text x="460" y="142" text-anchor="middle" fill="var(--text-muted)" font-size="9">ale jen pro kandidáty</text>
  </g>
</svg>
:::

Pro typický dataset má phase 1 *99 % filter selectivity* — kandidáti pro phase 2 jsou jen pár procent objektů. Celkový speedup vs. naive O(N×M) bývá 100×–10000×.

::: viz mbb-filter-refine "Tahejte dva polygony; Phase 1 testuje MBR překryv (rychlé, R-tree O(log N)), Phase 2 dělá přesný segment-test. Vyberte predikát (Intersects, Contains, Touches, Disjoint)."
:::

## Pre-computed values

Pro lepší performance ukládat často-počítané hodnoty:

```sql
CREATE TABLE polygons (
  id INT, geom GEOMETRY(POLYGON),
  area FLOAT GENERATED ALWAYS AS (ST_Area(geom)) STORED,   -- cached
  centroid GEOMETRY(POINT) GENERATED ALWAYS AS (ST_Centroid(geom)) STORED,
  bbox GEOMETRY(POLYGON) GENERATED ALWAYS AS (ST_Envelope(geom)) STORED
);
```

`GENERATED STORED` je PostgreSQL syntax pro computed columns. Vypočte hodnotu při INSERT/UPDATE, uloží.

## Spatial indexy — viz další sekce

Indexování bodů — [[indexovani-bodu]] (k-D tree, adaptive).
Indexování rectangles, polygons — [[rtree]] (R-tree, R*-tree).

## Implementační poznámky

* **OGC Simple Features Access** standardizuje funkce `ST_*` (SQL/MM Spatial).
* **PostGIS** je open source referenční implementace.
* **Oracle Spatial**, **MS SQL Server Spatial** mají vlastní funkce (`SDO_*` v Oracle, `STIntersects()` v SQL Server) i `ST_*` synonyma.
* **GEOS** (Geometry Engine Open Source) — C++ knihovna, kterou PostGIS, QGIS, MapServer interně používají.

## Typický workflow

```sql
-- Setup
CREATE EXTENSION postgis;

-- Tabulka s prostorovým typem
CREATE TABLE parcels (
  id SERIAL PRIMARY KEY,
  owner VARCHAR(100),
  area_sqm FLOAT,
  geom GEOMETRY(POLYGON, 4326)
);

-- Spatial index
CREATE INDEX parcels_geom_idx ON parcels USING GIST (geom);

-- Insert dat
INSERT INTO parcels VALUES (DEFAULT, 'Anna', 500, ST_GeomFromText('POLYGON(...)', 4326));

-- Dotaz — co je v okolí
SELECT * FROM parcels
WHERE ST_DWithin(geom, ST_MakePoint(16.6, 49.2), 0.01);
   -- '0.01 degree' ≈ 1.1 km na lat
```

## Praktické tipy

* **Vždy index** — `CREATE INDEX … USING GIST (geom)`. Bez něj jsou queries lineární.
* **MBB tests first** — `&&` operator místo `ST_Intersects` pokud postačí approximate.
* **SRID konzistentní** — všechny geometrie v jedné tabulce ve stejném SRID, jinak DB musí transformovat.
* **Validate geometries** — `ST_IsValid(geom)` před insertem. Self-intersecting polygons (motýlek) jsou *invalid* a způsobí chyby v operacích.
* **Spatial pivots** — pro velký dataset (milion + záznamů) zvážit *sharding* podle geo region.

## OGC vs. proprietary

Pokud chcete *přenositelnost* mezi DB:
* Použijte SQL/MM standard funkce (`ST_*`).
* Geometry types z OGC (Point, LineString, Polygon).
* SRID z EPSG katalogu (4326, 3857, ...).

Vendor-specific funkce (`SDO_*` v Oracle) jsou rychlejší, ale uzamykají na konkrétní DB.

::: link "PostGIS Spatial Functions" "https://postgis.net/docs/reference.html"
:::

::: link "Egenhofer, M. J., Herring, J. R.: A Mathematical Framework for the Definition of Topological Relationships (1990)" "https://www.spatial.maine.edu/~max/9intersection.pdf"
:::

::: link "OGC SQL/MM Spatial" "https://www.iso.org/standard/60343.html"
:::

---

*Zdroj: UPA přednáška *Spatial Databases* (Kolář). Externí reference: Egenhofer, M. J., Herring, J. R.: *A Mathematical Framework for the Definition of Topological Relationships*, IGU 1990; Rigaux, P., Scholl, M., Voisard, A.: *Spatial Databases*, Morgan Kaufmann 2002; Güting, R. H., Schneider, M.: *Moving Objects Databases*, Morgan Kaufmann 2005; OGC Simple Features Common Architecture.*
