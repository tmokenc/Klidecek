---
title: Co je prostorová databáze
---

# Co je prostorová databáze

**Prostorová databáze** (spatial database) je specializovaný systém pro ukládání, dotazování a manipulaci s **prostorovými daty** — body, čárami, polygony, objemy v 2D, 3D nebo n-dimenzionálním prostoru. Klíčový rozdíl od běžné DB: prostorová databáze **rozumí** prostorové struktuře dat a poskytuje *prostorové operace* (vzdálenost, průnik, obsah, blízkost). Aplikace: GIS (geografické informační systémy), CAD/CAM, ochrana sítí, navigace, dopravní plánování, vědecké simulace, computer vision. Hlavní výzva: efektivní indexování dat ve více dimenzích, kde tradiční B-trees selhávají.

## Co je prostorové data

Reálná data s prostorovou interpretací:

* **Geo data** — města, ulice, lesy, řeky, pozemky, hranice států (2D, povrch Země).
* **3D data** — budovy, podzemní stavby, atmosférické modely.
* **Chemické struktury** — atomy v molekule (3D), jejich vazby.
* **VLSI obvody** — komponenty na chipu (2D/3D).
* **Astronomická data** — planety, hvězdy, galaxie (3D).
* **Trasy a sítě** — pipelines, elektrické vedení, datové linky (2D/3D).

Virtuální (abstraktní) prostorová data:

* **Vektory rysů** v ML — slovník 1000 slov tvoří 1000-rozměrný prostor.
* **Vektory atributů** — věk, plat, BMI → 3D prostor pro shlukování.
* **Embeddings** — word2vec (300D), CLIP (512D).

V obou případech používáme stejné koncepty (k-NN, range queries, similarity search), i když interpretace je odlišná.

## Co odlišuje prostorovou DB od běžné

### Klasická DB s mapovými daty

Můžeme do běžné DB uložit:

```sql
CREATE TABLE city (
  name VARCHAR(50),
  latitude FLOAT,
  longitude FLOAT
);
```

Můžeme dotazovat:
```sql
-- Brno
SELECT * FROM city WHERE name = 'Brno';
```

To **není** prostorová DB. Souřadnice jsou jen atributy — DB nerozumí, co znamenají.

### Skutečná prostorová DB poskytuje *prostorové operace*

```sql
-- Najít města do 50 km od Brna
SELECT name FROM city
WHERE ST_Distance(location, (SELECT location FROM city WHERE name='Brno')) < 50000;

-- Najít obce uvnitř Jihomoravského kraje
SELECT name FROM obec o, kraj k
WHERE k.name = 'Jihomoravský' AND ST_Contains(k.geometry, o.location);

-- Najít cykloturistické trasy blízko řeky
SELECT t.name FROM trail t, river r
WHERE ST_DWithin(t.path, r.path, 500);   -- do 500 m
```

DB **rozumí**, že `location` je 2D bod, `geometry` je polygon, `path` je linestring. Operace jako `ST_Distance`, `ST_Contains`, `ST_DWithin` jsou *součástí* DB.

## Spatial structures vs. spatial information

Klíčový pojem: **data, která obsahují souřadnice, ne nutně nesou *prostorovou informaci***.

* **Tabulka s lat/lng** — souřadnice jsou jen čísla. DB to nezná jako prostor.
* **Tabulka s tiles dlažbou** ortofot — vidí kódy souborů, ne lokality.
* **Tabulka s vektory features** — i zde data mají prostorové vlastnosti.

**Spatial database management system** *rozpoznává* prostorová data jako *speciální* typ a poskytuje *operace* nad nimi.

### Aplikace nad ne-spatial DB

Pokud aplikace dělá prostorové výpočty (vzdálenosti, průniky) *sama*, ne v DB — je to *anti-pattern*:

* Aplikace musí **stáhnout všechna data** a filtrovat lokálně.
* Bez prostorového indexu je **brute-force** O(N) per query.
* Nelze využít optimalizace specifické pro prostorová data.

### Aplikace nad spatial DB

Aplikace deleguje výpočty na DB:

* DB má **prostorové indexy** (R-tree) pro rychlé filtrování O(log N).
* DB má **optimizér**, který volí přístupový plán.
* Aplikace vrací jen *relevantní* data po síti.

## Operace nad prostorovými daty

Typické operace, které spatial DB podporuje:

### Konstanty / charakteristiky

Vypočtené *během uložení* (cached pro performance):
* `ST_Length(line)` — délka.
* `ST_Area(polygon)` — obsah.
* `ST_Perimeter(polygon)` — obvod.
* `ST_Centroid(geom)` — těžiště.
* `ST_NumPoints(geom)` — počet vrcholů.

### Metriky

Číselné výsledky, *nelze* pre-vypočítat (pár-závislé):
* `ST_Distance(g1, g2)` — vzdálenost.
* `ST_HausdorffDistance(g1, g2)` — Hausdorffova vzdálenost (geometrie).
* `ST_Frechet(g1, g2)` — Fréchetova (trajektorie).

### Predikáty (booleovské)

* `ST_Equals(g1, g2)` — geometricky shodné.
* `ST_Contains(g1, g2)` — g1 obsahuje g2.
* `ST_Within(g1, g2)` — opak Contains.
* `ST_Intersects(g1, g2)` — mají společný bod.
* `ST_Disjoint(g1, g2)` — nesdílí žádný bod.
* `ST_Touches(g1, g2)` — sdílí hranici, ne interier.
* `ST_Crosses(g1, g2)` — pro křížení čar přes polygony.

### Operace produkující nový tvar

* `ST_Intersection(g1, g2)` — průnik.
* `ST_Union(g1, g2)` — sjednocení.
* `ST_Difference(g1, g2)` — rozdíl.
* `ST_ConvexHull(geom)` — konvexní obal.
* `ST_Buffer(geom, dist)` — body do vzdálenosti dist.
* `ST_Voronoi(points)` — Voronoiovy buňky.

## Příklad — tiling Země

Naivní postup s ortofoty:

1. Vyfotit ortofoty celé ČR, rozdělit na dlaždice 1km × 1km.
2. Uložit dlaždice do DB s `(x, y, image_blob)`.
3. Aplikace zobrazuje dlaždice na mapě.

**Toto není prostorová DB** — DB ukládá jen obrázky s id. Pro dotaz "vrať všechny dlaždice ve viewport" musí aplikace sama vypočítat které.

Vylepšení:

1. Z ortofot extrahovat *vektorové prvky*: silnice (lines), budovy (polygony), řeky (lines), lesy (polygony).
2. Uložit do DB s prostorovými typy (`Geometry`, `Polygon`, `LineString`).
3. **Adaptovat aplikaci** — zobrazení features s prostorovými dotazy ("co je ve viewport?", "kde je nejbližší benzínka?").

**Toto už je prostorová DB** — DB rozumí geometrii, dělá spatial queries.

## Abstrakce — ztráta informace, rekonstrukce

Při ukládání prostor *decomponujeme* na *jednoduché prvky*: body, čáry, polygony. Tato abstrakce *ztrácí informaci*:

* **Sousedi** — kdo s kým sousedí, je třeba *spočítat* z geometrie.
* **Vztahy** — který polygon obsahuje kterou cestu.
* **Topologie** — graf cest, sítí.

Klíčová schopnost spatial DB: **rekonstrukce ztracené informace přes prostorové operace**. Příklad:

```sql
-- Najít sousední obce
SELECT o1.name, o2.name FROM obec o1, obec o2
WHERE o1.id != o2.id AND ST_Touches(o1.geometry, o2.geometry);
```

DB *spočítá* sousedství z geometrie — informace, která v `tabulka_obcí` *přímo* není uložena.

## Diskrétní vs. spojitý prostor

Reálný prostor je *spojitý* (real numbers). Počítačová reprezentace je *diskrétní* (finite precision floating point) — což přináší problémy s přesností.

* `2 × 0.1 = 0.2` v reálných číslech, ale `0.30000000000000004` v IEEE 754 double.
* Tři kolineární body v plovoucí čárce se mohou ukázat jako *trochu mimo* — predikát "leží na čáře" vrátí false.

Řešení: **fine-grained grid** (snap to grid), *exact arithmetic* (rational numbers), *interval arithmetic* (matematicky náročné, ale přesné). Detail v dalších sekcích.

## Implementace

Většina moderních RDBMS má *prostorovou extension*:

* **PostGIS** (PostgreSQL) — open source standard pro spatial.
* **Oracle Spatial** — komerční, vyzrálé.
* **MS SQL Server Geometry/Geography** — od 2008.
* **MySQL Spatial** — základní podpora.
* **SQLite SpatiaLite** — embedded.
* **MongoDB GeoJSON** — pro mobile apps.

Specializované GIS databáze:
* **ArcGIS** — komerční, Esri.
* **QGIS** + PostGIS — open source GIS pipeline.

Standardy:
* **OGC Simple Features** — geometry types (Point, LineString, Polygon, MultiPolygon).
* **SQL/MM Spatial** (SQL standard) — funkce ST_*.

::: link "OGC Simple Features Access Specification" "https://www.ogc.org/standards/sfa"
:::

::: link "PostGIS — Spatial and Geographic Objects for PostgreSQL" "https://postgis.net/"
:::

::: link "Rigaux, P., Scholl, M., Voisard, A.: Spatial Databases — With Application to GIS (kniha)" "https://www.elsevier.com/books/spatial-databases/rigaux/978-1-55860-588-6"
:::

---

*Zdroj: UPA přednáška *Spatial Databases* (Kolář). Externí reference: Rigaux, P., Scholl, M., Voisard, A.: *Spatial Databases — With Application to GIS*, Morgan Kaufmann 2002; Shekhar, S., Chawla, S.: *Spatial Databases — A Tour*, Prentice Hall 2003; OGC Simple Features Access Specification, OGC 06-103r4, 2011.*
