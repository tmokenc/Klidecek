---
title: Prostorové datové typy — body, čáry, polygony, regiony
---

# Prostorové datové typy — body, čáry, polygony, regiony

Prostorové databáze ([[prostorova-db-uvod]]) ukládají data ve specifických *prostorových datových typech*. Hierarchie od nejjednodušších po nejsložitější: **bod**, **čára**, **polyline**, **polygon**, **R-cycle**, **R-area**, **regions**. Každý typ má vlastní reprezentaci, operace a indexovací strategii. Pochopení této hierarchie a vztahů mezi typy (např. polygony s dírami — kostka v polygonu znamená *region*) je klíčové pro správné modelování geo dat. Sledujeme abstrakci od idealizovaných matematických objektů ke konkrétním datovým strukturám.

## Body (Points)

Nejjednodušší prostorový typ. Reprezentován **dvojicí** (2D) nebo **trojicí** (3D) souřadnic.

```
Point(x, y) v 2D
Point(x, y, z) v 3D
```

Použití:
* **Geo body** — města, body zájmu (POI), GPS lokace.
* **Vektor v feature space** — embedding slova ve 300D.
* **Atomy** v molekule.
* **Hvězdy, planety** v 3D modelu.

### 1D prostor

Pro 1D (čísla na číselné ose) je *prostorová databáze* zbytečná — stačí běžná DB s B-tree indexem. Real spatial DB začíná od 2D.

### Reprezentace v SQL

```sql
-- PostGIS
CREATE TABLE city (
  name VARCHAR(50),
  location GEOMETRY(POINT, 4326)   -- WGS84 lat/lng
);

INSERT INTO city VALUES ('Brno', ST_GeomFromText('POINT(16.6068 49.1951)', 4326));
```

`4326` je SRID — Spatial Reference Identifier (WGS 84 — standard GPS souřadnic). Jiné: 3857 (Web Mercator), 5514 (S-JTSK pro ČR).

## Čáry a polylines

### Line (úsečka)

Pár bodů `(p1, p2)`. Reprezentuje:
* **Hranu** v grafu.
* **Krátký úsek** silnice/řeky.

### LineString (polyline)

Posloupnost ≥ 2 bodů, mezi nimiž jsou *úsečky*. Lomená čára.

```
LineString[(0,0), (1,2), (3,2), (4,5)]
```

Reprezentuje:
* **Silnice** — celé trasy.
* **Řeky, kanalizace, pipelines**.
* **GPS tracky**.
* **Telekomunikační linky**.

Atributy:
* `ST_Length(line)` — celková délka.
* `ST_NumPoints(line)` — počet vrcholů.
* `ST_StartPoint(line)`, `ST_EndPoint(line)` — koncové body.

### Pozor — *není to oblouk*

Klasické LineString je jen *lomená čára*. Pro skutečné oblouky (silnice s kruhovými oblouky) je třeba `CircularString` (rozšířená OGC specifikace).

```sql
CREATE TABLE road (
  id INT, name VARCHAR(100),
  geometry GEOMETRY(LINESTRING, 4326)
);
```

## Polygony

### Jednoduchý polygon

Uzavřená lomená čára (≥ 3 body), kde *první a poslední bod jsou totožné*. Vnitřek je *jednorámcový* uzavřený region.

```
Polygon[(0,0), (5,0), (5,5), (0,5), (0,0)]   -- čtverec
```

Reprezentuje:
* **Hranice budov, parcel, obcí, krajů, států**.
* **Lesy, jezera, pole** (větší územní celky).
* **Vnitřní oblasti** v CAD modelech.

Atributy:
* `ST_Area(polygon)` — obsah.
* `ST_Perimeter(polygon)` — obvod.
* `ST_Centroid(polygon)` — těžiště.

### Konvexní vs. konkávní

Polygon je **konvexní**, pokud pro libovolné dva body uvnitř leží celá úsečka mezi nimi také uvnitř. **Konkávní** ne (má "zářezy" či výběžky v okraji — reflexní úhly > 180° — ne však *díry uvnitř*).

Hranice kraje je obvykle *konkávní* (nepravidelná). Sídelní bloky bývají konvexní (čtverce, šestiúhelníky).

## R-cycles a R-areas

Standardní polygon má jednoduchou hranici. Reálná data jsou složitější — polygony s **dírami** (lake uvnitř lesa, díra v parcele).

### R-cycle (Region cycle)

**Definice**: R-cycle je polygon uložený v diskrétní reprezentaci. Posloupnost n úseček `s₁, …, sₙ` taková, že:
* Koncový bod úsečky `sᵢ` je shodný s počátečním `s(i+1) mod n` (uzavřené!).
* Žádné dvě úsečky se *nekříží* (mimo společné vrcholy).

Vlastnosti R-cycles vzájemné polohy:

* **Area-nested** (uvnitř) — `i, ii, iii` jsou nest v sobě.
* **Edge-nested** — sdílejí hrany.
* **Vertex-nested** — sdílejí vrcholy.
* **Area-disjointed** — nemají společný bod.
* **Edge-disjointed** — žádné společné hrany.
* **Completely disjointed** — žádné společné vrcholy.

::: svg "R-cycles a vzájemné polohy: nested (jeden uvnitř druhého), disjointed (mimo sebe), edge/vertex shared (sdílejí hrany nebo vrcholy)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <text x="100" y="20" text-anchor="middle" fill="var(--text)" font-weight="600">area-nested</text>
    <polygon points="40,40 160,40 160,140 40,140" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <polygon points="70,70 130,70 130,110 70,110" fill="var(--bg-inset)" stroke="var(--accent-line)" stroke-width="1.5"/>
    <polygon points="85,80 115,80 115,100 85,100" fill="var(--bg-card)" stroke="var(--accent-line)" stroke-width="1"/>
    <text x="100" y="170" text-anchor="middle" fill="var(--text-muted)" font-size="10">i ⊂ ii ⊂ iii</text>
  </g>
  <g>
    <text x="270" y="20" text-anchor="middle" fill="var(--text)" font-weight="600">edge-shared</text>
    <polygon points="210,50 290,50 290,140 210,140" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <polygon points="290,50 330,50 330,140 290,140" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="270" y="170" text-anchor="middle" fill="var(--text-muted)" font-size="10">sdílejí hranu</text>
  </g>
  <g>
    <text x="450" y="20" text-anchor="middle" fill="var(--text)" font-weight="600">disjointed</text>
    <polygon points="370,50 420,50 420,100 370,100" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <polygon points="450,90 510,90 510,140 450,140" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="450" y="170" text-anchor="middle" fill="var(--text-muted)" font-size="10">nemají společný bod</text>
  </g>
</svg>
:::

### R-area

**Definice**: R-area `f` je dvojice `(c, H)`, kde:
* `c` je R-cycle (vnější hranice).
* `H = {h₁, ..., hₘ}` je *množina R-cycles*, které jsou *uvnitř* `c` a *vzájemně disjunktní*.

Tj. polygon s **dírami**. Jezero uvnitř lesa, díra v parcele.

Příklad: `Brno` (R-cycle hranice) `\` `Brněnská přehrada` (díra v territoriu).

Hodnota typu `regions`: *množina vzájemně edge-disjunktních R-areas*. Můžeme mít *více polygonů* (souostroví), z nichž každý může mít díry.

```sql
-- PostGIS — Polygon s 1 dírou
SELECT ST_GeomFromText('POLYGON(
  (0 0, 10 0, 10 10, 0 10, 0 0),     -- vnější
  (3 3, 7 3, 7 7, 3 7, 3 3)           -- díra
)', 4326);

-- MultiPolygon
SELECT ST_GeomFromText('MULTIPOLYGON(
  ((0 0, 5 0, 5 5, 0 5, 0 0)),         -- první polygon
  ((10 10, 15 10, 15 15, 10 15, 10 10)) -- druhý polygon
)', 4326);
```

## Areas a volumes

### 2D area

Polygon nebo region. Obsah `ST_Area`. Reprezentuje obojího (vnitřek + hranice).

### 3D volume

Pro 3D ekvivalent polygonu jsou **polyhedra** (mnohostěny). Reprezentován seznamem polygonálních *stěn*. Použití: 3D modely budov, geologie, lékařské zobrazování.

V SQL/MM: `Solid`, `MultiSolid`.

## Datový typ "Geometry" vs. "Geography"

Většina spatial DB rozlišuje:

### Geometry

Souřadnice v *kartézském* (rovinném) prostoru. Vhodné pro:
* Malé oblasti (kde Zem je *přibližně rovná*).
* CAD modely.
* Místní planar projection (S-JTSK, UTM).

Operace `ST_Distance` vrátí *Euclidean distance* — užitečné pro projected souřadnice.

### Geography

Souřadnice na *sféře* (kulové) — *latitude/longitude* na WGS 84. Vhodné pro:
* Velké geo-distances.
* Globální data.

Operace `ST_Distance` vrátí *great-circle distance* — užitečné pro skutečné vzdálenosti na Zemi.

```sql
-- Vzdálenost Praha → Brno
-- jako Geography (sférická):
SELECT ST_Distance(
  ST_GeographyFromText('POINT(14.4378 50.0755)'),  -- Praha
  ST_GeographyFromText('POINT(16.6068 49.1951)')   -- Brno
);
-- → ~ 184 km

-- jako Geometry (planární — chybné!):
SELECT ST_Distance(
  ST_GeomFromText('POINT(14.4378 50.0755)', 4326),
  ST_GeomFromText('POINT(16.6068 49.1951)', 4326)
);
-- → ~ 2.39 (degrees, ne metry)
```

Pro analytics s vzdálenostmi *vždy* používat Geography nebo projected Geometry. Lat/lng v Geometry je chyba.

## Komplexní typy — kolekce

* **GeometryCollection** — heterogenní kolekce (mix points, lines, polygons).
* **MultiPoint** — kolekce bodů.
* **MultiLineString** — kolekce čar.
* **MultiPolygon** — kolekce polygonů (s možnými dírami).

Použití: město jako MultiPolygon (více "ostrovů"), řeka jako MultiLineString (pokud rozdělená).

## Atributy entit — uniform typ

Pravidlo: **tabulka by měla obsahovat uniformní geometric type**.

```
-- Špatně — různé typy v jedné tabulce
CREATE TABLE features (
  id INT, geom GEOMETRY     -- může být cokoliv
);

-- Lépe — uniform
CREATE TABLE cities (id INT, geom GEOMETRY(POINT));
CREATE TABLE roads  (id INT, geom GEOMETRY(LINESTRING));
CREATE TABLE parks  (id INT, geom GEOMETRY(POLYGON));
```

Uniform typ umožní:
* Validaci při insertu.
* Efektivní indexování.
* Type-specific queries.

## Indexy pro prostorové typy

Klasické B-tree *neumí* indexovat multi-dimensional data. Pro prostorové indexy potřebujeme specializované struktury:

* **R-tree** ([[rtree]]) — pro objekty s prostorovou extenzí (rectangles, polygons, lines).
* **k-D tree** ([[indexovani-bodu]]) — pro body.
* **Quadtree** — rekurzivní decomposition 2D prostoru.
* **GeoHash** — string-based indexing převoditelný na B-tree.

PostGIS používá *GiST* (Generalized Search Tree) framework s R-tree algoritmem.

## SQL/MM a OGC Simple Features

Standard definuje:
* **Geometry hierarchii** — Point → LineString → Polygon → MultiPolygon ...
* **Funkce** — ST_* prefix (ST = Spatial Type).
* **Predikáty** — odvozené z modelu DE-9IM (Dimensionally Extended 9-Intersection Model).

DE-9IM je matice 3×3 = 9 průniků interior/boundary/exterior dvou geometrií (ne devět predikátů). Osm pojmenovaných topologických predikátů:
* Equals, Disjoint, Intersects, Touches, Crosses, Within, Contains, Overlaps.
* `Relate(matice)` je obecná funkce, která testuje libovolný vzor DE-9IM.

Více v [[prostorove-operace]].

::: link "OGC Simple Features — Common Architecture" "https://www.ogc.org/standards/sfa"
:::

::: link "PostGIS Geometry Types" "https://postgis.net/docs/using_postgis_dbmanagement.html#PostGIS_Geometry"
:::

::: link "DE-9IM (Dimensionally Extended 9-Intersection Model)" "https://en.wikipedia.org/wiki/DE-9IM"
:::

---

*Zdroj: UPA přednáška *Spatial Databases* (Kolář). Externí reference: Rigaux, P., Scholl, M., Voisard, A.: *Spatial Databases — With Application to GIS*, Morgan Kaufmann 2002; Shekhar, S., Chawla, S.: *Spatial Databases — A Tour*, Prentice Hall 2003; OGC Simple Features Access — Part 1 Common Architecture, OGC 06-103r4, 2011.*
