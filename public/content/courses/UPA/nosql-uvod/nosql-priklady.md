---
title: Příklady NoSQL databází — Cassandra, MongoDB, Neo4j, InfluxDB
---

# Příklady NoSQL databází — Cassandra, MongoDB, Neo4j, InfluxDB

Přehled čtyř reprezentativních NoSQL databází ukazuje, jak různé filozofie [[typy-nosql]] vypadají v praxi. **Cassandra** zastupuje wide-column store s tunable konzistencí. **MongoDB** je dominantní dokumentová DB pro webové aplikace. **Neo4j** je standard pro grafové databáze. **InfluxDB** ukazuje specializaci pro time-series. Doplňkově zmíníme **Oracle NoSQL** jako enterprise klíč-hodnota a srovnáme s relačními DB.

## Apache Cassandra

Vyvinuto Facebookem 2008 pro inbox search, otevřeno jako Apache projekt. Inspirováno Amazon Dynamo (ring topologie) + Google BigTable (sloupcový model).

* **Datový model** — *wide-column store*: tabulky se sloupci, primary key = partition key + clustering key.
* **Partition key** — rozhoduje, na kterém uzlu jsou data uložena (hash → token ring).
* **Clustering key** — uspořádává data v rámci partition (B+ strom).
* **Time-to-live (TTL)** — zápisy mají expirační čas; po vypršení Cassandra řádek označí a *garbage collector* odstraní (*tombstone*).
* **Konzistence** — laditelná per operace: `ONE`, `QUORUM`, `ALL`, `LOCAL_QUORUM` (multi-DC).
* **Dotazovací jazyk** — **CQL** (Cassandra Query Language) — vypadá jako SQL, ale s omezeními (žádné JOIN, GROUP BY jen na partition key).

```sql
CREATE TABLE IF NOT EXISTS temps (
  building TEXT,
  room TEXT,
  time TIMESTAMP,
  temperature FLOAT,
  PRIMARY KEY ((building, room), time)     -- partition + clustering
);

INSERT INTO temps (building, room, time, temperature)
  VALUES ('FIT_VUT', 'N203', toTimestamp(now()), 23)
  USING TTL 3600;                          -- záznam expiruje za hodinu

SELECT * FROM temps
WHERE building = 'FIT_VUT' AND room = 'N205'
  AND time > '2025-10-23 12:00:00';
```

**Použití**: časové řady (telemetrie senzorů), event logy, write-heavy workloady (sociální feedy), distribuovaný cache.

::: link "Apache Cassandra documentation" "https://cassandra.apache.org/doc/latest/"
:::

## MongoDB

Vyvinuto 10gen / MongoDB Inc. od 2009. Dominantní dokumentová DB pro webové aplikace, často součástí MEAN/MERN stacku (MongoDB + Express + Angular/React + Node.js).

* **Datový model** — *dokumenty* v **BSON** (Binary JSON). Kolekce dokumentů.
* **Identifikátor** — pole `_id` (typicky `ObjectId`, 12 bajtů — timestamp + machine + counter).
* **Indexy** — B-tree indexy nad libovolnými poli, podpora *compound*, *multikey* (pole), *text*, *2dsphere* (geo).
* **Replikace** — *replica set* (primary + secondaries), automatický failover.
* **Sharding** — horizontální dělení dat podle shard key (range, hash, zone).
* **Transakce** — od MongoDB 4.0 podporují multi-document ACID transakce (v replica setu); od 4.2 i napříč shardy.

```javascript
// Insert
db.article.insertOne({
  name: "My Article",
  publish_date: new Date("2025-03-15"),
  tags: ["adventure", "fiction"],
  comments: []
});

// Find
db.article.find({tags: "adventure"}).pretty();

// Atomic update — push comment
db.article.updateOne(
  {_id: ObjectId("...")},
  {$push: {comments: {name: "Alice", text: "Great post!"}}}
);

// Aggregation pipeline
db.article.aggregate([
  {$match: {publish_date: {$gte: ISODate("2025-01-01")}}},
  {$unwind: "$tags"},
  {$group: {_id: "$tags", count: {$sum: 1}}},
  {$sort: {count: -1}}
]);
```

::: svg "MongoDB schema design: relační schéma (4 tabulky, JOIN) vs. dokumentové schéma (1 dokument s vnořenými poli a polem komentářů)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10">
  <g>
    <text x="100" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">Relační — 4 tabulky</text>
    <rect x="20" y="40" width="70" height="40" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="55" y="56" text-anchor="middle" fill="var(--text)">User</text>
    <text x="55" y="70" text-anchor="middle" fill="var(--text-muted)" font-size="9">name, email</text>
    <rect x="115" y="40" width="70" height="40" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="150" y="56" text-anchor="middle" fill="var(--text)">Article</text>
    <text x="150" y="70" text-anchor="middle" fill="var(--text-muted)" font-size="9">name, date</text>
    <rect x="115" y="120" width="70" height="40" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="150" y="136" text-anchor="middle" fill="var(--text)">Comment</text>
    <text x="150" y="150" text-anchor="middle" fill="var(--text-muted)" font-size="9">date, text</text>
    <rect x="20" y="120" width="70" height="40" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="55" y="136" text-anchor="middle" fill="var(--text)">Tag</text>
    <text x="55" y="150" text-anchor="middle" fill="var(--text-muted)" font-size="9">value</text>
    <line x1="90" y1="60" x2="115" y2="60" stroke="var(--line)"/>
    <line x1="150" y1="80" x2="150" y2="120" stroke="var(--line)"/>
    <line x1="115" y1="135" x2="90" y2="135" stroke="var(--line)"/>
  </g>
  <text x="270" y="100" text-anchor="middle" fill="var(--accent)" font-size="14">⇒</text>
  <g>
    <text x="430" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">Dokumentové — 1 dokument</text>
    <rect x="300" y="40" width="220" height="140" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2" rx="4"/>
    <g font-family="ui-monospace, monospace" font-size="9">
      <text x="310" y="58" fill="var(--text)">Article {</text>
      <text x="320" y="72" fill="var(--text)">name: "...",</text>
      <text x="320" y="86" fill="var(--text)">publish_date: ISODate(...),</text>
      <text x="320" y="100" fill="var(--text)">author: { name: "Anna",</text>
      <text x="330" y="112" fill="var(--text)">email: "..." },</text>
      <text x="320" y="126" fill="var(--text)">tags: ["adv", "fiction"],</text>
      <text x="320" y="140" fill="var(--text)">comments: [</text>
      <text x="330" y="152" fill="var(--text)">{ date: ..., text: "..." },</text>
      <text x="330" y="164" fill="var(--text)">{ date: ..., text: "..." }</text>
      <text x="320" y="176" fill="var(--text)">]</text>
    </g>
  </g>
</svg>
:::

**Použití**: webové aplikace, mobile backend, IoT data, real-time analytics, katalog produktů.

::: link "MongoDB documentation" "https://www.mongodb.com/docs/"
:::

## Neo4j

Vyvinuto Neo Technology (dnes Neo4j Inc.) od 2007. Nejrozšířenější *labeled property graph* databáze.

* **Datový model** — *uzly* s labelem + vlastnostmi, *hrany* s typem + vlastnostmi.
* **Dotazovací jazyk** — **Cypher** (ASCII art-like syntaxe, dnes částečně standardizovaná jako GQL).
* **Storage engine** — *index-free adjacency*: každý uzel uchovává seznam svých hran přímo (O(1) traversal).
* **Konzistence** — single-master cluster (Causal Cluster), ACID transakce.
* **Replikace** — read replicas pro analytické dotazy.

```cypher
// Načtení filmu
MATCH (m:Movie) WHERE m.title = "The Matrix" RETURN m;

// Najít herce a filmy
MATCH (m:Movie)<-[:ACTED_IN]-(a:Person)
WHERE lower(m.title) CONTAINS "matrix"
RETURN m.title AS movie, collect(a.name) AS cast;

// Najít herce, kteří hráli ve více filmech
MATCH (m1:Movie)-[r1:ACTED_IN]-(p1:Person),
      (p2:Person)-[r2:ACTED_IN]-(m2:Movie)
WHERE p1 = p2
  AND m1.title = "The Matrix"
  AND m2.released > m1.released
RETURN p1.name AS p, m2.title AS m;
```

**Použití**: sociální sítě (LinkedIn graph), doporučovací systémy, fraud detection, knowledge graphs (Wikidata-like), routing v dopravních sítích, IT infrastructure dependency mapping.

::: link "Neo4j documentation" "https://neo4j.com/docs/"
:::

## InfluxDB

Vyvinuto InfluxData od 2013, specializovaná *time-series database*. Optimalizovaná pro vysoké zápisové zatížení s časovými razítky (telemetrie, monitoring, finance).

* **Datový model** — *measurements* (analogie tabulky) obsahují *points* (řádky). Každý point má:
  * `timestamp` (nanosec přesnost)
  * `tags` (indexované řetězce — typicky low-cardinality dimenze: hostname, region)
  * `fields` (měřené hodnoty — float, int, bool, string)
* **Line protocol** — kompaktní textový formát pro vstup:
  `temperature,host=server01,region=us-west value=72.0 1572467998000000000`
* **Retention policies** — automatická expirace starých dat (např. detail data 7 dní, aggregát 5 let).
* **Continuous queries** — periodická downsample (z 1-sec do 1-min).
* **Dotazovací jazyk** — InfluxQL (SQL-like, starší) nebo **Flux** (functional pipeline, novější).

```sql
SELECT * FROM h2o_feet ORDER BY time DESC LIMIT 1;

SELECT MEAN("water_level"), MAX("water_level")
  FROM "h2o_feet"
  WHERE time > now() - 1h
  GROUP BY "location";

SELECT COUNT("water_level") FROM "h2o_feet"
  WHERE "location"='coyote_creek'
    AND time >= '2015-08-18T00:00:00Z'
    AND time <= '2015-08-18T00:30:00Z'
  GROUP BY time(12m);
```

**Použití**: monitoring (Prometheus alternative), IoT (industrial sensors), DevOps observability, financial tick data, real-time analytics.

::: link "InfluxDB documentation" "https://docs.influxdata.com/influxdb/"
:::

## Oracle NoSQL

Enterprise klíč-hodnota databáze od Oracle, využívá Berkeley DB Java Edition jako storage engine. Komerční (Enterprise) nebo Community Edition (AGPL).

* **Datový model** — KV s *dvousložkovým klíčem*: `major key` (rozhoduje o uzlu) + `minor key` (uspořádává v rámci uzlu).
* **ACID** — podporováno *pouze* pro záznamy se stejným major klíčem (na stejném uzlu). Mezi major klíči žádná konzistence — důsledek CAP teorému.
* **Integrace** s Oracle ekosystémem (Oracle DB, Hadoop, Fusion Middleware).

```java
// Insert
Key key = Key.createKey("Katana");
String valString = "sword";
store.putIfAbsent(key, Value.createValue(valString.getBytes()));

// Update
ValueVersion retVal = store.get(key);
String newRing = "Really nice sword";
Value newval = Value.createValue(newRing.getBytes());
store.putIfVersion(key, newval, retVal.getVersion());

// Iterator
Iterator<KeyValueVersion> iter = store.storeIterator(Direction.UNORDERED, 100);
while (iter.hasNext()) { /* ... */ }
```

::: link "Oracle NoSQL Database documentation" "https://www.oracle.com/database/technologies/related/nosql.html"
:::

## Volba mezi NoSQL a relační DB

NoSQL nenahrazuje relační DB — *doplňuje* ji. Pro klasické IS (e-shopy, ERP, bankovnictví) jsou relační DB stále vhodnější:

* SQL je *univerzální* — programátoři, BI nástroje, reporting frameworks ho znají.
* ACID je *bezpečný* — bankovní transakce, audit log.
* JOIN je *flexibilní* — ad-hoc dotazy přes několik tabulek.

NoSQL je vhodné pro:

* **Velmi velká data** — distribuovaná úložiště, kde RDBMS nestačí.
* **Specifické struktury** — grafy, dokumenty, time-series, KV.
* **High write throughput** — Cassandra/HBase pro milióny vstupů/sec.
* **Flexibilní schémata** — agile vývoj s častou změnou modelu.

V moderních architekturách často **kombinace**: PostgreSQL pro core transakce + Redis cache + Elasticsearch pro search + InfluxDB pro metriky + MongoDB pro user-generated obsah. *Polyglot persistence* — každá databáze pro to, co umí nejlépe. Viz [[orm-odm]] pro role mapování objektů.

---

*Zdroj: UPA přednáška *NoSQL databáze* (Rychlý, 23. září 2025). Externí reference: Lakshman, A., Malik, P.: *Cassandra — A Decentralized Structured Storage System*, ACM SIGOPS 2010; Banker, K. et al.: *MongoDB in Action*, 2nd ed., Manning 2016; Robinson, I., Webber, J., Eifrem, E.: *Graph Databases*, 2nd ed., O'Reilly 2015; Naqvi, S. N. Z. et al.: *Time Series Databases and InfluxDB*, ULB Brussels 2017.*
