---
title: Row store vs. column store
---

# Row store vs. column store

Tradiční relační DB (Oracle, MySQL, PostgreSQL) ukládají data **po řádcích** (*row store*) — všechny atributy téhož řádku na disku vedle sebe. Moderní analytické DB (SAP HANA, Vertica, ClickHouse, Snowflake, Amazon Redshift) ukládají data **po sloupcích** (*column store*) — všechny hodnoty téhož atributu vedle sebe. Tento drobný design choice má *masivní* dopad na výkon: row store je optimální pro OLTP (drobné transakce), column store pro OLAP (analytické dotazy nad miliony řádků). Pochopení rozdílu je klíčové pro výběr DB pro datový sklad nebo analytickou platformu.

## Motivace — změny v HW

Moderní hardware výrazně změnil hru:

* **Multi-core CPU** — typicky 32 jader/CPU.
* **Multi-CPU boards** — 8 CPU na desku.
* **CPU cache** roste (L1 ~64 KB, L2 ~1 MB, L3 ~50 MB).
* **RAM kapacita** — TB v jednom serveru.
* **RAM rychlost** — DDR5 ~6400 MT/s.
* **NVMe SSD** — desítky GB/s.
* **Nové sběrnice** (QPI, HyperTransport) — bandwidth mezi CPU.

Důsledek: *enormní výpočetní a paměťová kapacita*. Tradiční DB design byl optimalizován pro **rotační HDD** (latence ~10 ms, bandwidth ~100 MB/s) — řádkové uložení minimalizovalo počet seek operací. Dnes je *RAM new disk* a *cache miss* je hlavní bottleneck.

## Latence — co je dnes drahé

```
Operace                       Latence (orientačně)
───────────────────────────────────────────────────
L1 cache hit                   ~1 ns        (3-4 cykly)
L2 cache hit                   ~4 ns
L3 cache hit                   ~10 ns
Main memory access             ~100 ns      (cache miss!)
NVMe SSD read                  ~50 μs       (= 500× memory)
HDD seek + read                ~10 ms       (= 100 000× memory)
Network packet (LAN)           ~500 μs
```

Klíčové pozorování: **memory access je nový bottleneck**, ne disk. CPU stráví 90 % času čekáním na cache miss. *Hustota dat v cache* je klíčová pro výkon.

## Row store layout

Tradiční tabulka s 8 sloupci (200 B per row):

```
Disk/RAM:
┌──────────────────────────────────────┐
│ Row 1: id, fname, lname, gender, city, ... 200 B │
├──────────────────────────────────────┤
│ Row 2: id, fname, lname, gender, city, ... 200 B │
├──────────────────────────────────────┤
│ Row 3: id, fname, lname, gender, city, ... 200 B │
└──────────────────────────────────────┘
```

* **+** Rychlé pro *OLTP* — `SELECT * FROM users WHERE id = 42` — jeden disk read přečte celý řádek.
* **+** Rychlé pro INSERT/UPDATE — celý řádek se zapíše společně.
* **−** Pomalé pro *analytics* — `SELECT AVG(salary) FROM users` musí přečíst *celý řádek* pro každý záznam, jen pro extrakci jednoho atributu.

### Příklad — full table scan

8 miliard záznamů × 200 B = **1.6 TB**. Při 4 MB/ms/jádro = **400 s** s 1 jádrem.

### Stride access — gender

Pro `SELECT COUNT(*) FROM users WHERE gender = 'F'`:
* Pro každý řádek (8 miliard) přečíst 64 B (cache line) = 512 GB.
* Při 4 MB/ms/jádro = **128 s** s 1 jádrem.

I když potřebujeme jen 1 bit z každého řádku, *cache line* (64 B) musíme přečíst kvůli alignementu.

## Column store layout

Stejná tabulka, ale data podle sloupce:

```
Disk/RAM:
Column 'id':       1, 2, 3, ..., 8B values
Column 'fname':    "Anna", "Bob", ..., 8B values
Column 'lname':    "Nováková", "Smith", ..., 8B values
Column 'gender':   F, M, M, F, ..., 8B values
Column 'city':     "Brno", "Praha", ..., 8B values
...
```

* **+** Rychlé pro *analytics* — `SELECT gender, COUNT(*) FROM users` skenuje jen sloupec `gender` (~ 8 GB), ne celých 1.6 TB.
* **+** Komprese — sloupec má *podobné hodnoty* (typicky `gender` má 2 hodnoty), lze velmi komprimovat.
* **+** SIMD vectorization — sequence stejných typů v paměti, CPU může zpracovat 4–16 hodnot najednou.
* **−** Pomalé pro OLTP — `SELECT * FROM users WHERE id = 42` musí udělat 8 lookupů (pro 8 sloupců).
* **−** INSERT/UPDATE je drahé — řádek je rozprostřen na *více míst*.

### Příklad — full column scan gender

8 miliard × 1 bit (po dictionary encoding) = **1 GB**. Při 4 MB/ms/jádro = **0.25 s** s 1 jádrem.

**400× rychlejší** než stride access v row store, **1600× rychlejší** než full row scan.

::: svg "Row vs Column layout: row store ukládá tuple za tuplem (rychlé pro OLTP), column store ukládá sloupec za sloupcem (rychlé pro analytic queries scanning few columns)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <text x="130" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">Row store</text>
    <g font-family="ui-monospace, monospace" font-size="9">
      <rect x="20" y="40" width="220" height="22" fill="var(--bg-card)" stroke="var(--line)"/>
      <text x="30" y="55" fill="var(--text)">Anna   |31|F|Brno   |...</text>
      <rect x="20" y="62" width="220" height="22" fill="var(--bg-card)" stroke="var(--line)"/>
      <text x="30" y="77" fill="var(--text)">Bob    |42|M|Praha  |...</text>
      <rect x="20" y="84" width="220" height="22" fill="var(--bg-card)" stroke="var(--line)"/>
      <text x="30" y="99" fill="var(--text)">Carol  |28|F|Olomouc|...</text>
      <rect x="20" y="106" width="220" height="22" fill="var(--bg-card)" stroke="var(--line)"/>
      <text x="30" y="121" fill="var(--text)">Dave   |55|M|Ostrava|...</text>
    </g>
    <text x="130" y="150" text-anchor="middle" fill="var(--text-muted)" font-size="10">tuple-wise: dobré pro</text>
    <text x="130" y="165" text-anchor="middle" fill="var(--text-muted)" font-size="10">SELECT * WHERE id=X</text>
    <text x="130" y="180" text-anchor="middle" fill="var(--accent)" font-size="10">→ OLTP</text>
  </g>
  <g>
    <text x="400" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">Column store</text>
    <g font-family="ui-monospace, monospace" font-size="9">
      <rect x="290" y="40" width="50" height="84" fill="var(--bg-card)" stroke="var(--line)"/>
      <text x="295" y="55" fill="var(--text)">Anna</text>
      <text x="295" y="70" fill="var(--text)">Bob</text>
      <text x="295" y="85" fill="var(--text)">Carol</text>
      <text x="295" y="100" fill="var(--text)">Dave</text>
      <rect x="345" y="40" width="50" height="84" fill="var(--bg-card)" stroke="var(--accent)"/>
      <text x="350" y="55" fill="var(--text)">31</text>
      <text x="350" y="70" fill="var(--text)">42</text>
      <text x="350" y="85" fill="var(--text)">28</text>
      <text x="350" y="100" fill="var(--text)">55</text>
      <rect x="400" y="40" width="50" height="84" fill="var(--bg-card)" stroke="var(--line)"/>
      <text x="405" y="55" fill="var(--text)">F</text>
      <text x="405" y="70" fill="var(--text)">M</text>
      <text x="405" y="85" fill="var(--text)">F</text>
      <text x="405" y="100" fill="var(--text)">M</text>
      <rect x="455" y="40" width="60" height="84" fill="var(--bg-card)" stroke="var(--line)"/>
      <text x="460" y="55" fill="var(--text)">Brno</text>
      <text x="460" y="70" fill="var(--text)">Praha</text>
      <text x="460" y="85" fill="var(--text)">Olom.</text>
      <text x="460" y="100" fill="var(--text)">Ostr.</text>
    </g>
    <text x="400" y="150" text-anchor="middle" fill="var(--text-muted)" font-size="10">column-wise: dobré pro</text>
    <text x="400" y="165" text-anchor="middle" fill="var(--text-muted)" font-size="10">SELECT AVG(age)</text>
    <text x="400" y="180" text-anchor="middle" fill="var(--accent)" font-size="10">→ OLAP</text>
  </g>
</svg>
:::

::: viz row-vs-column-scan "Vyberte typ dotazu (1 sloupec / SELECT * / single row) — viz porovnává cache-line scan v row vs. column store, počet přečtených bajtů a odhadovaný čas."
:::

## Tuple reconstruction

Pro `SELECT *` v column store musíme *rekonstruovat tuple* z více sloupců. Pro řádek 42 přečíst z každého sloupce *jeden* element:

```
6 cache accesses × 64 B = 384 B
At 4 MB/ms/core: ~0.1 μs per row
```

Pro miliony řádků: stovky ms. Stále rychlejší než *full table scan*, ale pomalejší než row store pro single-row lookup.

## Hybrid stores

Některé DB kombinují oba přístupy:

* **PAX** (Partition Attributes Across) — uvnitř page jsou data ve sloupcích, pages jsou v tabulce.
* **Vertica's WOS + ROS** — Write-Optimized Store (row) + Read-Optimized Store (column).
* **SAP HANA Multi-Store** — tabulky lze deklarovat jako row, column, nebo hybrid.
* **Oracle In-Memory Column Store** — column store *v paměti*, row store na disku.
* **MS SQL Server Columnstore Indexes** — sekundární column index nad row tabulkou.

## Kdy row vs. column store

| Use case | Doporučení |
| :--- | :--- |
| **OLTP** — drobné transakce, point queries | Row store |
| **OLAP** — analytické dotazy, range scans | Column store |
| **Mixed (HTAP)** | Hybrid (HANA, Snowflake Unistore) |
| **Operational reporting** | Row store + index, nebo HTAP |
| **Data warehouse** | Column store |
| **Real-time analytics** | Column store in-memory |

## Vendor landscape

### Klasické row store (OLTP)

* Oracle, MySQL, PostgreSQL, SQL Server, DB2.

### Specializované column store (OLAP)

* **Vertica** — original analytical column store (Stonebraker).
* **ClickHouse** — open source, vysoký výkon.
* **Amazon Redshift** — managed cloud DW na PostgreSQL base.
* **Google BigQuery** — Dremel-based serverless DW.
* **Snowflake** — cloud-native DW.
* **Apache Druid** — real-time analytics.

### In-memory column store

* **SAP HANA** — pionýr (2010), široké enterprise nasazení.
* **MemSQL / SingleStore** — hybrid row+column.
* **Oracle TimesTen** — in-memory row.
* **Apache Pinot**, **Apache Druid** — open source real-time.

### Lakehouse (column on object storage)

* **Apache Parquet** — sloupcový formát na S3/HDFS.
* **Apache Iceberg**, **Delta Lake**, **Apache Hudi** — ACID/transactional layer nad Parquet.
* **Databricks**, **Snowflake**, **Trino** — query engines.

## SAP HANA — pionýr in-memory column store

SAP HANA (2010) byla průlomová — kompletně **in-memory** column store pro enterprise OLAP. Klíčové vlastnosti:

* **Column-oriented** s aggressive komprese (dictionary, run-length, prefix).
* **Mostly in-memory** — celá DB v RAM, disk jen pro persistence.
* **Hybrid HTAP** — OLTP i OLAP v jedné DB.
* **Multi-engine** — relační, graph, document, spatial, ML, R/Python integrace.

McLaren F1 case study: 150 senzorů, 3 TB dat per race, HANA umožní *14 000× rychlejší* analýzu — z týdne na pit stop.

Více o dictionary encoding viz [[dictionary-encoding]], o kompresi [[komprese]], o scan výkonu [[scan-performance]].

::: link "Stonebraker, M. et al.: C-Store — A Column-oriented DBMS (VLDB 2005)" "https://www.vldb.org/archives/website/2005/program/paper/thu/p553-stonebraker.pdf"
:::

::: link "Plattner, H., Zeier, A.: In-Memory Data Management — Technology and Applications (Springer 2012)" "https://link.springer.com/book/10.1007/978-3-642-29575-1"
:::

::: link "Abadi, D. J. et al.: Column-Stores vs. Row-Stores — How Different Are They Really? (SIGMOD 2008)" "https://web.stanford.edu/class/cs346/2015/notes/SW2008.pdf"
:::

---

*Zdroj: UPA přednáška *Introduction to In-memory Column-based Databases* (Benek, SAP). Externí reference: Stonebraker, M. et al.: *C-Store — A Column-oriented DBMS*, VLDB 2005; Plattner, H., Zeier, A.: *In-Memory Data Management*, 2nd ed., Springer 2012; Abadi, D. J., Madden, S. R., Hachem, N.: *Column-Stores vs. Row-Stores*, SIGMOD 2008; SAP HANA documentation.*
