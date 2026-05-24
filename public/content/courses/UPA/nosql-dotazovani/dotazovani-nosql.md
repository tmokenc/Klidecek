---
title: Dotazování v NoSQL — primární a sekundární indexy
---

# Dotazování v NoSQL — primární a sekundární indexy

NoSQL databáze řeší dotazování *jinak než RDBMS*. Místo univerzálního optimalizátoru SQL přes JOIN a libovolné WHERE klauzule mají NoSQL přístupy *omezenější*, ale díky tomu *předvídatelnější* a *škálovatelné*. Klíčový princip: dotaz musí jít přímo k uzlu s daty — sharding key určuje uzel, a tedy *jaké dotazy budou efektivní*. Pochopení omezení a využití primárních i sekundárních indexů je klíčové pro správné modelování dat v Cassandra, MongoDB, DynamoDB.

## Klíč-hodnota jako základ

NoSQL databáze jsou *především* key-value úložiště, i když se navenek tváří jako document, column-family nebo graph. Klíč rozhoduje o uzlu (sharding key), DB pak na tom uzlu hledá hodnotu — buď přímou hash tabulkou, nebo dalším lokálním indexem.

Konkrétně:

* **Cassandra** — `partition_key` je hash → token ring → uzel; *clustering_key* uspořádává v rámci uzlu (lokální B+ strom).
* **MongoDB** — `_id` field je defaultní index; pro sharding lze nastavit jiný shard key. Lokálně B-tree.
* **Neo4j** — id uzlu/hrany; lokálně index-free adjacency (přímé pointers).
* **InfluxDB** — series key = `(measurement, tag set)` + timestamp.

Operace `GET(key)` má dvě fáze:

1. **Routing** — najít uzel obsahující data pro klíč (directory service nebo DHT — Distributed Hash Table).
2. **Local lookup** — v lokálním souboru/struktuře najít blok s hodnotou (AVL/B/B+ strom, LSM tree, hash table).

## Filtering podle klíče (key-scan / index-scan)

Dotaz *přes partition key* je vždy podporován — je to fundamentální operace key-value DB. Realizace:

* **Point lookup** — `WHERE pk = X` → jeden uzel, jeden disk read.
* **Range scan po clustering key** — `WHERE pk = X AND ck BETWEEN A AND B` → jeden uzel, sekvenční čtení B+ stromu (Cassandra). Toto je *jediný* typ range scanu, který je v Cassandra efektivní.
* **Bulk get** — `WHERE pk IN (X, Y, Z)` → paralelní dotazy na různé uzly, klient složí výsledek.

Pokud aplikace vyžaduje *jiný dotazovací vzor* než předdefinované primární klíče, musí použít buď:

1. **Secondary index** (lokální nebo globální);
2. **Denormalizaci** — uložit data víckrát s různými klíči;
3. **Materialized view** — předpočtenou tabulku pro alternativní dotaz.

## Sekundární indexy

Většina NoSQL umožňuje *sekundární indexy* nad libovolným polem hodnoty. Implementace se však liší.

### Lokální (per-shard) sekundární indexy

Index existuje *na každém shardu*, indexuje jen lokální data. Dotaz přes secondary musí kontaktovat *všechny shardy* a získat výsledky.

Příklad Cassandra:

```sql
CREATE INDEX idx_email ON users (email);
SELECT * FROM users WHERE email = 'anna@ex.com';
   -- ALL uzly v clusteru musí prohledat svůj lokální index
   -- jeden shard najde, ostatní vrátí prázdno
```

Výhody: jednoduché, žádný global state.
Nevýhody: pomalé pro nízkou selektivitu (mnoho match → traffic přes všechny uzly).

### Globální sekundární indexy (DynamoDB GSI)

Index je *sám tabulkou* s vlastním sharding key. DynamoDB Global Secondary Index umožňuje `WHERE GSI_PK = X` efektivně z 1 uzlu.

Cena: GSI je *eventual consistent* (asynchronní propagace zápisů z hlavní tabulky). Při strong consistency čtení nedovoluje.

### MongoDB indexy

MongoDB má bohaté indexy:

* **Single field** — `db.users.createIndex({email: 1})`
* **Compound** — `db.users.createIndex({country: 1, age: -1})`
* **Multikey** — index nad polem hodnot (např. `tags: ["a", "b"]`).
* **Text** — fulltext search.
* **Geospatial** — `2dsphere` index pro geo dotazy.
* **Wildcard** — index nad libovolnými poli.

MongoDB lokálně používá B-tree, ve sharded clusteru jsou indexy *per shard* (lokální). Sharded query bez shard key je *broadcast* (`scatter-gather`).

## Optimalizace dotazu — co NoSQL umí

V relačním DB se na optimalizaci dotazu používá *cost-based optimizer*, který přepíše dotaz, vybere indexy, určí pořadí JOIN. V NoSQL je situace jednodušší:

* **Query rewrite** — někde (např. MongoDB pipeline reordering), často omezeno.
* **Index selection** — automaticky podle WHERE.
* **JOIN ordering** — NoSQL obvykle nemá JOIN, neřeší se.
* **Join type selection** — totéž.

Většinu *magie* dělá **manuální indexování** — vývojář předem rozhodne, jaké indexy budou existovat, podle očekávaných přístupových vzorů.

::: svg "Dvouúrovňové dotazování v NoSQL clusteru: routing (najít uzel přes hash) + lokální lookup (B+ tree, LSM). Při dotazu na sekundární index lokální se musí kontaktovat všechny uzly."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="220" y="20" width="120" height="40" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2" rx="6"/>
    <text x="280" y="38" text-anchor="middle" fill="var(--text)" font-weight="600">Klient</text>
    <text x="280" y="52" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">dotaz: pk=X</text>
  </g>
  <line x1="280" y1="60" x2="280" y2="90" stroke="var(--accent)" stroke-dasharray="2 2" marker-end="url(#arr-d)"/>
  <g>
    <rect x="210" y="90" width="140" height="40" fill="var(--bg-card)" stroke="var(--accent-line)" rx="6"/>
    <text x="280" y="108" text-anchor="middle" fill="var(--text)" font-weight="600">Routing</text>
    <text x="280" y="122" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">hash(pk) → token → uzel</text>
  </g>
  <line x1="240" y1="130" x2="100" y2="170" stroke="var(--accent)" stroke-dasharray="2 2" marker-end="url(#arr-d)"/>
  <line x1="280" y1="130" x2="280" y2="170" stroke="var(--accent)" stroke-dasharray="2 2" marker-end="url(#arr-d)"/>
  <line x1="320" y1="130" x2="460" y2="170" stroke="var(--line)" stroke-dasharray="2 2"/>
  <g>
    <rect x="40" y="170" width="120" height="60" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="100" y="188" text-anchor="middle" fill="var(--text)" font-weight="600">Uzel A</text>
    <text x="100" y="202" text-anchor="middle" fill="var(--text-muted)" font-size="9">B+ tree lookup</text>
    <text x="100" y="216" text-anchor="middle" fill="var(--accent)" font-size="9">match!</text>
  </g>
  <g>
    <rect x="220" y="170" width="120" height="60" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="280" y="188" text-anchor="middle" fill="var(--text)" font-weight="600">Uzel B</text>
    <text x="280" y="202" text-anchor="middle" fill="var(--text-muted)" font-size="9">B+ tree lookup</text>
    <text x="280" y="216" text-anchor="middle" fill="var(--text-muted)" font-size="9">no data</text>
  </g>
  <g>
    <rect x="400" y="170" width="120" height="60" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="460" y="188" text-anchor="middle" fill="var(--text)" font-weight="600">Uzel C</text>
    <text x="460" y="202" text-anchor="middle" fill="var(--text-muted)" font-size="9">B+ tree lookup</text>
    <text x="460" y="216" text-anchor="middle" fill="var(--text-muted)" font-size="9">no data</text>
  </g>
  <defs>
    <marker id="arr-d" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Plochá data / denormalizace

Klasický relační návrh by normalizoval *Person → Adresa → Město → Stát* do 4 tabulek. V NoSQL preferujeme **denormalizaci**:

* Vnořit adresu do dokumentu (MongoDB `address: { street, city, state }`).
* Duplikovat název města v každém záznamu osoby.

Cena: redundance (jeden název Brno se opakuje milionkrát) + složitější updaty (při změně názvu města je nutno aktualizovat všechny dokumenty). Výhoda: rychlé čtení (žádný JOIN, vše v jednom dokumentu / partition).

Optimalizace zápisu — **eventual consistency** zaručí, že update se propagovati nepředvídatelně, často přes background job.

## Materialized views

Pro alternativní dotazy se používají **materializované pohledy** — předpočtené tabulky s jiným klíčem.

Cassandra příklad:

```sql
-- Hlavní tabulka — partition po uživateli
CREATE TABLE users_by_id (id INT PRIMARY KEY, email TEXT, name TEXT);

-- Pohled — partition po e-mailu (pro lookup podle e-mailu)
CREATE MATERIALIZED VIEW users_by_email AS
  SELECT * FROM users_by_id
  WHERE email IS NOT NULL
  PRIMARY KEY (email, id);
```

Cassandra automaticky udržuje *users_by_email* synchronní s *users_by_id*. Nevýhoda: zápisová amplifikace (každý zápis ovlivní více tabulek).

## Iterativní zpracování složitých dotazů

Když dotaz nelze řešit jedním krokem (cross-shard agregace, multi-collection lookup), aplikace musí *iterativně* zpracovat data:

1. Načíst první kolekci (např. uživatele z určitého města).
2. Pro každý získaný ID načíst druhou kolekci (jeho objednávky).
3. Agregovat výsledky v aplikaci.

Toto je *opačné* od relačního přístupu, kde by jeden SQL JOIN udělal vše v DB. Cena: latence (více roundtripů). Výhoda: predikable load, snadná paralelizace.

## Praktické tipy

* **Modelovat na základě dotazů, ne entit.** V RDBMS modelujete entity (Person, Order, Product) a pak píšete SQL. V NoSQL nejprve identifikujte *jaké dotazy* budete dělat, a model schémat tak, aby šly dělat efektivně přes primary key nebo materialized view.
* **Identifikujte hot reads.** Pro 80 % dotazů musí existovat optimální cesta (1 partition, 1 uzel).
* **Akceptujte denormalizaci.** Duplikace dat je *žádoucí* — udržujte konzistenci přes background jobs / change streams.
* **Pro complex queries** — použijte externí systém. Reporting/analytics nepatří do operačního NoSQL — synchronizujte data do Snowflake / BigQuery / Spark.

Více o **agregaci** dat v NoSQL viz [[mapreduce]].

::: link "MongoDB Aggregation Pipeline documentation" "https://www.mongodb.com/docs/manual/aggregation/"
:::

::: link "Cassandra Data Modeling — DataStax" "https://www.datastax.com/learn/data-modeling-by-example"
:::

---

*Zdroj: UPA přednáška *NoSQL Databases 2* (Rychlý, 30. září 2025). Externí reference: Carpenter, J., Hewitt, E.: *Cassandra — The Definitive Guide*, 3rd ed., O'Reilly 2020; Banker, K. et al.: *MongoDB in Action*, 2nd ed., Manning 2016; DeCandia, G. et al.: *Dynamo*, SOSP 2007; Kleppmann, M.: *Designing Data-Intensive Applications*, O'Reilly 2017.*
