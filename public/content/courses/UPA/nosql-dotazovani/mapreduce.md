---
title: MapReduce a agregační pipeline
---

# MapReduce a agregační pipeline

Když potřebujeme agregovat data napříč mnoha shardy nebo provést složitější výpočet nad celou kolekcí, máme dvě hlavní paradigma: **MapReduce** (obecný, programovatelný — Hadoop, klasické MongoDB) a **aggregation pipeline** (deklarativní řetězec operátorů — MongoDB, Couchbase). Obě paradigma jsou navržena pro *distribuované* zpracování — výpočet se provede na uzlech s daty, výsledky se posílají dál. Pochopení obou je klíčové pro práci s rozsáhlými datovými sadami v NoSQL.

## Motivace — proč ne JOIN a GROUP BY

V RDBMS bychom napsali:

```sql
SELECT category, AVG(price), COUNT(*)
FROM products
JOIN inventory ON products.id = inventory.product_id
WHERE inventory.quantity > 0
GROUP BY category;
```

DB optimalizátor zvolí strategii (hash join, sort-merge join, nested loop) a paralelní zpracování. Funguje to *na jednom serveru*. V distribuovaném světě by JOIN přes shardy znamenal *shuffle* — všechna data se přeskupí podle join key na uzly, kde se setkají. Drahé.

NoSQL preferuje *jednodušší* skladbu: data jsou předem strukturovaná tak, aby agregace šla *po partition* (Cassandra `GROUP BY` pouze na partition key) nebo přes generický framework MapReduce.

## MapReduce — definice

**MapReduce** (Dean & Ghemawat, Google 2004) je programovací model pro distribuované zpracování velkých dat. Pracuje s kolekcí dvojic `(klíč, hodnota)` a definuje dvě funkce:

* **Map**: `(k₁, v₁) → list of (k₂, v₂)` — pro každý vstupní záznam vyprodukuje 0..N intermediate dvojic.
* **Reduce**: `(k₂, list of v₂) → list of (k₃, v₃)` — intermediate dvojice se *grupují podle k₂*, pro každou skupinu se zavolá Reduce.

Mezi Map a Reduce je *shuffle/sort* — framework rozdělí intermediate data podle k₂ a pošle je na uzly, které spustí Reduce.

::: svg "MapReduce: Map() aplikováno na vstupní data → intermediate (k,v) → Group by Key → Reduce() na každou skupinu → výstup."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="10.5">
  <g>
    <text x="30" y="25" fill="var(--text)" font-weight="600">Input</text>
    <rect x="20" y="35" width="80" height="40" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="60" y="50" text-anchor="middle" fill="var(--text)" font-size="9">doc1</text>
    <text x="60" y="65" text-anchor="middle" fill="var(--text)" font-size="9">doc2</text>
    <rect x="20" y="85" width="80" height="40" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="60" y="100" text-anchor="middle" fill="var(--text)" font-size="9">doc3</text>
    <text x="60" y="115" text-anchor="middle" fill="var(--text)" font-size="9">doc4</text>
  </g>
  <g>
    <text x="150" y="25" fill="var(--accent)" font-weight="600">Map</text>
    <circle cx="135" cy="55" r="22" fill="var(--bg-card)" stroke="var(--accent)"/>
    <text x="135" y="59" text-anchor="middle" fill="var(--text)" font-size="9">M</text>
    <circle cx="170" cy="55" r="22" fill="var(--bg-card)" stroke="var(--accent)"/>
    <text x="170" y="59" text-anchor="middle" fill="var(--text)" font-size="9">M</text>
    <circle cx="135" cy="105" r="22" fill="var(--bg-card)" stroke="var(--accent)"/>
    <text x="135" y="109" text-anchor="middle" fill="var(--text)" font-size="9">M</text>
    <circle cx="170" cy="105" r="22" fill="var(--bg-card)" stroke="var(--accent)"/>
    <text x="170" y="109" text-anchor="middle" fill="var(--text)" font-size="9">M</text>
  </g>
  <g>
    <text x="240" y="25" fill="var(--text)" font-weight="600">Shuffle / Group</text>
    <rect x="210" y="40" width="80" height="20" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="250" y="54" text-anchor="middle" fill="var(--text)" font-size="9">k=A: [v,v,v]</text>
    <rect x="210" y="65" width="80" height="20" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="250" y="79" text-anchor="middle" fill="var(--text)" font-size="9">k=B: [v,v]</text>
    <rect x="210" y="90" width="80" height="20" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="250" y="104" text-anchor="middle" fill="var(--text)" font-size="9">k=C: [v,v,v,v]</text>
    <rect x="210" y="115" width="80" height="20" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="250" y="129" text-anchor="middle" fill="var(--text)" font-size="9">k=D: [v]</text>
  </g>
  <g>
    <text x="350" y="25" fill="var(--accent)" font-weight="600">Reduce</text>
    <circle cx="345" cy="55" r="18" fill="var(--bg-card)" stroke="var(--accent)"/>
    <text x="345" y="59" text-anchor="middle" fill="var(--text)" font-size="9">R</text>
    <circle cx="385" cy="55" r="18" fill="var(--bg-card)" stroke="var(--accent)"/>
    <text x="385" y="59" text-anchor="middle" fill="var(--text)" font-size="9">R</text>
    <circle cx="345" cy="105" r="18" fill="var(--bg-card)" stroke="var(--accent)"/>
    <text x="345" y="109" text-anchor="middle" fill="var(--text)" font-size="9">R</text>
    <circle cx="385" cy="105" r="18" fill="var(--bg-card)" stroke="var(--accent)"/>
    <text x="385" y="109" text-anchor="middle" fill="var(--text)" font-size="9">R</text>
  </g>
  <g>
    <text x="450" y="25" fill="var(--text)" font-weight="600">Output</text>
    <rect x="430" y="35" width="100" height="100" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="480" y="55" text-anchor="middle" fill="var(--text)" font-size="9">(A, sum=42)</text>
    <text x="480" y="73" text-anchor="middle" fill="var(--text)" font-size="9">(B, sum=18)</text>
    <text x="480" y="91" text-anchor="middle" fill="var(--text)" font-size="9">(C, sum=77)</text>
    <text x="480" y="109" text-anchor="middle" fill="var(--text)" font-size="9">(D, sum=5)</text>
  </g>
  <line x1="100" y1="55" x2="112" y2="55" stroke="var(--accent)" marker-end="url(#mr-arr)"/>
  <line x1="100" y1="105" x2="112" y2="105" stroke="var(--accent)" marker-end="url(#mr-arr)"/>
  <line x1="195" y1="80" x2="208" y2="80" stroke="var(--accent)" marker-end="url(#mr-arr)"/>
  <line x1="290" y1="80" x2="323" y2="80" stroke="var(--accent)" marker-end="url(#mr-arr)"/>
  <line x1="405" y1="80" x2="428" y2="80" stroke="var(--accent)" marker-end="url(#mr-arr)"/>
  <defs>
    <marker id="mr-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Paralelní MapReduce

Klíčový trik: Map i Reduce jsou *embarassingly parallel*. Map se aplikuje na *každý vstupní záznam nezávisle* — N pracovních uzlů zpracuje N částí dat současně. Reduce se aplikuje *na každý klíč nezávisle* — pokud máme M unikátních klíčů, M reduce úloh běží paralelně.

Schéma:

* **N Map tasks** — každý čte chunk vstupních dat (~64 MB), produkuje intermediate dvojice. Lokálně rozdělí po hash(k₂) do *R partitions*.
* **R Reduce tasks** — každý fetchne svou partition ze všech Map tasks (shuffle), seřadí podle k₂, zavolá Reduce pro každou skupinu.

Tato architektura umožňuje zpracovat data o velikosti TB až PB na clusteru komoditních serverů.

## Klasický příklad — Word count

Spočítat výskyt každého slova v terabajtové kolekci dokumentů.

```python
def map(doc_id, text):
    for word in text.split():
        emit(word, 1)             # intermediate: (word, 1)

def reduce(word, counts):
    yield (word, sum(counts))     # výstup: (word, total_count)
```

Hadoop spustí MapReduce na clusteru, výstup je seznam `(word, count)` dvojic.

## MapReduce v MongoDB

MongoDB historicky podporovala MapReduce přes JS funkce:

```javascript
db.orders.mapReduce(
  function() { emit(this.cust_id, this.amount); },        // map
  function(key, values) { return Array.sum(values); },    // reduce
  { out: "order_totals" }
);
```

Od MongoDB 5.0 je MapReduce **deprecated** — nahrazen *aggregation pipeline*, který je rychlejší a snazší.

## Aggregation pipeline (MongoDB)

Aggregation pipeline je deklarativní řetězec **stages** — každý stage transformuje stream dokumentů.

### Hlavní stages

| Stage | Funkce |
| :--- | :--- |
| `$match` | filtr — odpovídá `WHERE` v SQL |
| `$project` | výběr/přejmenování polí — analogie `SELECT` |
| `$lookup` | left outer join s jinou kolekcí (jediný JOIN v Mongu) |
| `$group` | agregace podle klíče (`SUM`, `AVG`, `MAX`, …) |
| `$sort` | seřazení |
| `$limit`, `$skip` | omezení počtu / přeskočení |
| `$unwind` | rozbalit pole na samostatné dokumenty |
| `$addFields` / `$set` | přidat vypočtené pole |
| `$facet` | provést více pipeline paralelně |
| `$bucket` | grupovat do předem definovaných intervalů |
| `$graphLookup` | rekurzivní traversal (hierarchie) |

### Příklad — top 5 kategorií podle průměrné ceny {tier=example}

```javascript
db.products.aggregate([
  { $match: { stock: { $gt: 0 } } },               // jen skladem
  { $group: {
      _id: "$category",
      avgPrice: { $avg: "$price" },
      count: { $sum: 1 }
  }},
  { $sort: { avgPrice: -1 }},
  { $limit: 5 }
]);
```

### Příklad — join + agregace {tier=example}

```javascript
db.orders.aggregate([
  { $match: { date: { $gte: ISODate("2025-01-01") }} },
  { $lookup: {
      from: "products",
      localField: "product_id",
      foreignField: "_id",
      as: "product"
  }},
  { $unwind: "$product" },                          // rozbalit pole
  { $group: {
      _id: "$product.category",
      revenue: { $sum: { $multiply: ["$qty", "$product.price"] }}
  }}
]);
```

::: svg "Aggregation pipeline v MongoDB: dokumenty procházejí stages ($match → $project → $lookup → $group). Každý stage zužuje nebo transformuje stream."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="10.5">
  <g>
    <rect x="20" y="60" width="100" height="60" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="70" y="85" text-anchor="middle" fill="var(--text)" font-weight="600">$match</text>
    <text x="70" y="100" text-anchor="middle" fill="var(--text-muted)" font-size="9">filter</text>
    <text x="70" y="135" text-anchor="middle" fill="var(--text-muted)" font-size="9">~1000 docs</text>
  </g>
  <line x1="120" y1="90" x2="140" y2="90" stroke="var(--accent)" marker-end="url(#ap-arr)"/>
  <g>
    <rect x="140" y="60" width="100" height="60" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="190" y="85" text-anchor="middle" fill="var(--text)" font-weight="600">$project</text>
    <text x="190" y="100" text-anchor="middle" fill="var(--text-muted)" font-size="9">vybrat pole</text>
    <text x="190" y="135" text-anchor="middle" fill="var(--text-muted)" font-size="9">~1000 docs</text>
  </g>
  <line x1="240" y1="90" x2="260" y2="90" stroke="var(--accent)" marker-end="url(#ap-arr)"/>
  <g>
    <rect x="260" y="60" width="100" height="60" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="310" y="85" text-anchor="middle" fill="var(--text)" font-weight="600">$lookup</text>
    <text x="310" y="100" text-anchor="middle" fill="var(--text-muted)" font-size="9">join external</text>
    <text x="310" y="135" text-anchor="middle" fill="var(--text-muted)" font-size="9">~1000 enriched</text>
  </g>
  <line x1="360" y1="90" x2="380" y2="90" stroke="var(--accent)" marker-end="url(#ap-arr)"/>
  <g>
    <rect x="380" y="60" width="100" height="60" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="430" y="85" text-anchor="middle" fill="var(--text)" font-weight="600">$group</text>
    <text x="430" y="100" text-anchor="middle" fill="var(--text-muted)" font-size="9">agregace</text>
    <text x="430" y="135" text-anchor="middle" fill="var(--accent)" font-size="9">~10 výsledků</text>
  </g>
  <defs>
    <marker id="ap-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

::: viz mapreduce-shuffle "Word-count animovaný: dokumenty → map tasks emitují (key, 1), shuffle podle hash(k) mod R, reducer agreguje. Pozastavte v každé fázi a sledujte routing klíčů."
:::

## Optimalizace

Aggregation pipeline má interní optimalizátor, který přeuspořádá stages:

* `$match` se posouvá co nejdříve (filtr před drahými operacemi).
* `$project` se kombinuje s `$match`.
* Indexy se používají v `$match`/`$sort` (pokud je první v pipeline).

Doporučení:
* Vždy `$match` filtr brzy — sníží objem dat pro další stages.
* `$lookup` až po `$match` — neenrichovat dokumenty, které se budou vyhazovat.
* `$project` před `$group` — odhodit nepotřebná pole.

## Hadoop a Spark

Mimo NoSQL DB existují **dedicated frameworks** pro MapReduce a podobné výpočty:

* **Apache Hadoop** — clusterový framework s HDFS (Hadoop Distributed File System) + MapReduce engine. Klasický, ale relativně pomalý (disk I/O mezi Map a Reduce).
* **Apache Spark** — moderní engine s in-memory výpočtem, DAG scheduler. 10–100× rychlejší než Hadoop MapReduce pro iterativní algoritmy. RDD, DataFrame, Spark SQL.
* **Apache Flink** — stream processing + batch. Real-time analytics.
* **Beam / Dataflow** — Google ekosystém, unified batch/stream.

Tyto systémy *nahrazují* MapReduce v MongoDB pro skutečně rozsáhlé výpočty (PB+ dat). NoSQL DB je *zdrojem dat*, Spark je *výpočetní vrstvou*.

## Kdy MapReduce vs. aggregation pipeline vs. SQL

* **Aggregation pipeline (MongoDB, Couchbase)** — pro většinu analytických dotazů v NoSQL DB. Deklarativní, optimalizované, rychlé.
* **MapReduce (custom, např. Hadoop)** — pro *custom logiku*, kterou pipeline nezvládne (komplexní algoritmy, ML modely, image processing).
* **SQL (RDBMS, Spark SQL)** — pokud máte data normalizovaná a potřebujete komplexní JOIN/GROUP BY. Spark SQL nad PB daty je dnes běžný *standardně*.

V moderních datových platformách je tendence: **transakční data → NoSQL/RDBMS**; *replikujte do datového jezera (S3, ADLS) → Spark SQL pro analytics*. NoSQL je *operační*, analytika jde mimo.

::: link "Dean, J., Ghemawat, S.: MapReduce — Simplified Data Processing on Large Clusters (OSDI 2004)" "https://research.google/pubs/pub62/"
:::

::: link "MongoDB Aggregation Pipeline reference" "https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/"
:::

---

*Zdroj: UPA přednáška *NoSQL Databases 2* (Rychlý, 30. září 2025). Externí reference: Dean, J., Ghemawat, S.: *MapReduce — Simplified Data Processing on Large Clusters*, OSDI 2004; Zaharia, M. et al.: *Apache Spark — A Unified Engine for Big Data Processing*, CACM 2016; Banker, K. et al.: *MongoDB in Action*, 2nd ed., Manning 2016.*
