---
title: Scan performance a tuple reconstruction
---

# Scan performance a tuple reconstruction

Hlavní motivací sloupcových databází je *rychlé skenování* sloupců pro analytické dotazy. Konkrétní čísla — *kolikrát rychlejší* — překvapí: pro typický agregační dotaz může být column store **400–1600× rychlejší** než row store. V této sekci kvantifikujeme rozdíl konkrétními výpočty, vysvětlíme **tuple reconstruction** (rekonstrukci řádku z více sloupců) a ukážeme, kdy se výhody column store *projeví* a kdy nikoli.

## Příklad: populace 8 miliard

* Tabulka `world_population` s atributy: `first_name`, `last_name`, `gender`, `country`, `city`, `birthday`.
* Velikost na řádek: 200 B (různé délky řetězců, plain encoded).
* Celková velikost: `8 × 10⁹ × 200 B = 1.6 TB`.
* Předpoklad: scan speed 4 MB/ms/jádro = 4 GB/s/jádro.

Otázka: **Kolik mužů a kolik žen je v populaci?**

`SELECT gender, COUNT(*) FROM world_population GROUP BY gender;`

Pro výpočet stačí *jeden* atribut (`gender`). Jak rychle to spočítat?

## Row store — full table scan

Pokud DB musí přečíst celou tabulku:

* 8 miliard × 200 B = **1.6 TB**.
* Scan 4 MB/ms/jádro = **400 s** s 1 jádrem.

Pro multi-core (32 jader) by to bylo `400 / 32 = 12.5 s`. Stále pomalé.

## Row store — stride access "Gender"

Pokud DB ví, kde v každém řádku je `gender` (offset), může přečíst *jen kritickou cache line*:

* 8 miliard cache accesses × 64 B per cache line = **512 GB**.
* Pohyb mezi cache lines není sekvenční (skoky o 200 B per řádek) — *random I/O*.
* Při 4 MB/ms (sekvenční bandwidth, ale random ~ 4×–10× pomalejší v praxi) = **128 s** v ideálním případě.

Stále pomalé.

## Column store — full column scan "Gender"

Sloupec `gender` má jen 1 bit per řádek (po dictionary encoding — 2 hodnoty):

* 8 miliard × 1 bit = **1 GB**.
* Scan 4 MB/ms/jádro = **0.25 s** s 1 jádrem.

::: svg "Scan performance — odhady pro 8B řádků, 200B per row, atribut gender."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="20" y="40" width="160" height="100" fill="var(--bg-card)" stroke="var(--line)" rx="6"/>
    <text x="100" y="62" text-anchor="middle" fill="var(--text)" font-weight="600">Row store</text>
    <text x="100" y="78" text-anchor="middle" fill="var(--text-muted)" font-size="10">full scan</text>
    <text x="100" y="100" text-anchor="middle" fill="#c44" font-weight="600" font-size="14">400 s</text>
    <text x="100" y="118" text-anchor="middle" fill="var(--text-muted)" font-size="9">1.6 TB read</text>
  </g>
  <g>
    <rect x="190" y="40" width="160" height="100" fill="var(--bg-card)" stroke="var(--line)" rx="6"/>
    <text x="270" y="62" text-anchor="middle" fill="var(--text)" font-weight="600">Row store</text>
    <text x="270" y="78" text-anchor="middle" fill="var(--text-muted)" font-size="10">stride access</text>
    <text x="270" y="100" text-anchor="middle" fill="#c84" font-weight="600" font-size="14">128 s</text>
    <text x="270" y="118" text-anchor="middle" fill="var(--text-muted)" font-size="9">512 GB cache reads</text>
  </g>
  <g>
    <rect x="360" y="40" width="160" height="100" fill="var(--bg-card)" stroke="var(--accent)" rx="6" stroke-width="2"/>
    <text x="440" y="62" text-anchor="middle" fill="var(--text)" font-weight="600">Column store</text>
    <text x="440" y="78" text-anchor="middle" fill="var(--text-muted)" font-size="10">column scan</text>
    <text x="440" y="100" text-anchor="middle" fill="#3a6" font-weight="600" font-size="14">0.25 s</text>
    <text x="440" y="118" text-anchor="middle" fill="var(--text-muted)" font-size="9">1 GB read</text>
  </g>
  <text x="270" y="165" text-anchor="middle" fill="var(--text)" font-weight="600">1600× rychlejší než full scan, 500× rychlejší než stride</text>
</svg>
:::

## Tuple reconstruction — `SELECT *`

Pro analytic dotazy (single column scan) je column store *jasně lepší*. Co když ale potřebujeme *celý řádek*?

### Row store

```
SELECT * FROM users WHERE id = 42;
```

Všechny atributy jsou *vedle sebe*. Cache line (64 B) přečte 200 B řádek pro typický row width → 4 cache accesses × 64 B = 256 B čteno.

* Read 4 MB/ms = `0.256 KB / 4 MB/ms ≈ 0.064 μs` s 1 jádrem.

Velmi rychlé.

### Column store

```
SELECT * FROM users WHERE id = 42;
```

Atributy jsou v *6 samostatných sloupcových souborech*. Pro každý: 1 cache access × 64 B = 64 B.

* 6 cache accesses × 64 B = **384 B**.
* `0.384 KB / 4 MB/ms ≈ 0.096 μs` s 1 jádrem.

Asi *1.5× pomalejší* než row store. Stále rychlé, ale ne tak optimální.

Pro `SELECT *` masivních řádků (`SELECT * FROM users` vrátí miliony záznamů) je column store výrazně horší — musí dělat per-row reconstruction.

## Tuple reconstruction přes virtual record IDs

V column store každý řádek má *implicitní record ID* = pozice v attribute vector. Pro reconstruction:

1. Najít `record_id` (např. přes WHERE klauzuli).
2. Pro každý sloupec: lookup attribute_vector[record_id] → valueID.
3. Lookup dictionary[valueID] → real value.
4. Sestavit tuple z hodnot.

Tato strategie je rychlejší než per-tuple reconstruction při čtení sekvenčně (vectorized — najednou pro tisíce řádků).

## Predikatové vyhodnocení

`SELECT name FROM users WHERE country = 'CZ' AND age > 30`:

1. **Scan country column**: najdi všechny pozice s `valueID(country) == valueID('CZ')`.
2. **Scan age column**: najdi všechny pozice s `value(age) > 30`.
3. **Intersection** — pozice splňující obě podmínky.
4. **Reconstruction** — pro tyto pozice lookup `name` ze `name` sloupce.

Klíčová optimalizace: **predicate pushdown** — vyhodnotit predikáty *před* reconstruction. Pro 8 miliard řádků z toho stejně bude 0.05 % match → 4 miliony reconstructions místo 8 miliard.

## Vectorized execution

Moderní column DB *neexecutují řádek po řádku*, ale **vektorizovaně** — najednou pro tisíce řádků.

```
Pro `WHERE country = 'CZ'`:

Tradiční (tuple-at-a-time):
  FOR i in 1..8B:
    IF attribute_vector[i] == 192:
      output i

Vectorized (SIMD):
  FOR batch of 16 elements:
    Load 16 valueIDs into AVX-512 register
    Compare all 16 with 192 in single instruction
    Bitmask result, push matching positions
```

SIMD = Single Instruction Multiple Data. Modern CPUs (AVX-2, AVX-512) zpracují 8–16 hodnot v *jedné* instrukci. Pro typický column scan **3–10× speedup** přes vektorizaci.

Knihovny: Apache Arrow, DuckDB engine, ClickHouse vectorized blocks.

## Parallelizace

Sloupcový scan je *embarassingly parallel*:

* Rozdělit attribute vector na N kusů (1 per jádro).
* Každé jádro skenuje svou část.
* Aggregace na konci.

Pro 32 jader: 0.25 s / 32 ≈ **8 ms**.

Pro multi-server cluster (32 serverů × 32 jader = 1024 jader): 0.25 s / 1024 ≈ **0.25 ms**.

Toto je důvod, proč moderní DW (Snowflake, BigQuery) zvládnou TB queries za sekundy.

## Push down a column pruning

V analytickém dotazu typicky používáme *jen* několik sloupců z mnoha. Column store *automatically* sažku jen ty, které jsou potřeba:

```sql
SELECT AVG(salary) FROM users WHERE department = 'Eng';
   -- Read only: salary column + department column
   -- Ignore: name, address, email, phone, ... (10+ columns)
```

Typický OLAP dotaz čte 2–5 sloupců z tabulky s 50 sloupci → **10–25×** úspora I/O.

## SAP HANA benchmark

SAP HANA demonstrational queries:

| Tabulka | Store | Rows | Velikost | Time |
| :--- | :---: | :---: | :---: | :---: |
| ACDOCA_C (compressed) | Column | 110 M | 5 GB | 1.8 s |
| ACDOCA_R (uncompressed) | Row | 110 M | 240 GB | 22.5 s |
| ACDOCA (big) | Column | 19.5 B | 1.3 TB | 139 s |

Column store je **12.5× rychlejší** + **48× menší** než row store na stejných datech.

McLaren F1 use case: telemetrie z F1 vozů.
* 150 senzorů, 2 GB dat per kolo, **3 TB per race**.
* "SAP HANA enables existing systems to process this data **14 000× faster** than before."
* "Analysis that previously took almost a week can be completed in a span of a pit stop."

## Kdy column store *není* rychlejší

* **SELECT * z mnoha sloupců** — tuple reconstruction je drahá.
* **Random single-row lookups** — `SELECT * WHERE id = X` se opakují → row store + index je rychlejší.
* **High-cardinality unique sloupce** — UUID, kde dictionary encoding nepřináší benefit.
* **Frequent updates** — main/delta merge je drahá.

Pro tyto případy jsou tradiční row store, in-memory row engine (Hekaton, SingleStore row), nebo HTAP hybrid optimální.

## Hardware optimalizace

Column store dnes maximálně využívá moderní HW:

* **Cache hierarchy** — komprese drží data v L2/L3.
* **NUMA** — data lokálně k CPU.
* **SIMD/AVX** — vectorized scans.
* **GPU** — pro některé queries (Heavy.AI, OmniSciDB).
* **NVMe** — pro persistent storage.
* **RDMA** — pro cluster shuffle.

## Praktické dopady {tier=practice}

Pro datový sklad nebo analytickou platformu:

* **Volba** — column store (Snowflake, ClickHouse, BigQuery, Vertica).
* **Modelování** — denormalizovat (star schema), facts table by columns.
* **Sorting** — vybrat *primary sort key* podle nejčastějšího filter (typicky čas).
* **Indexes** — méně potřebné než v RDBMS (column store je *implicitně indexed* všemi sloupci).
* **Hardware** — RAM bohatá, SSD/NVMe, multi-core.

## Mýty o column store

* *"Column store je vždy rychlejší."* — Ne, jen pro analytical workload.
* *"Column store nahradí RDBMS."* — Doplňují se. OLTP RDBMS + OLAP column store + ETL pipeline.
* *"Komprese stojí výkon."* — Light-weight komprese často *zvýší* výkon (méně cache miss, vectorization).
* *"Updaty jsou nemožné."* — Modern column DB (HANA, ClickHouse, Snowflake) UPDATE podporují, jen pomaleji než row store.

::: link "Stonebraker, M. et al.: C-Store — A Column-oriented DBMS (VLDB 2005)" "https://www.vldb.org/archives/website/2005/program/paper/thu/p553-stonebraker.pdf"
:::

::: link "Plattner, H., Zeier, A.: In-Memory Data Management" "https://link.springer.com/book/10.1007/978-3-642-29575-1"
:::

::: link "Boncz, P. A., Zukowski, M., Nes, N.: MonetDB/X100 — Hyper-Pipelining Query Execution (CIDR 2005)" "http://cidrdb.org/cidr2005/papers/P19.pdf"
:::

---

*Zdroj: UPA přednáška *Introduction to In-memory Column-based Databases* (Benek, SAP). Externí reference: Stonebraker, M. et al.: *C-Store — A Column-oriented DBMS*, VLDB 2005; Plattner, H., Zeier, A.: *In-Memory Data Management*, 2nd ed., Springer 2012; Boncz, P. A., Zukowski, M., Nes, N.: *MonetDB/X100 — Hyper-Pipelining Query Execution*, CIDR 2005; Abadi, D. J., Boncz, P. A., Harizopoulos, S., Idreos, S., Madden, S.: *The Design and Implementation of Modern Column-Oriented Database Systems*, FnT Databases 2013.*
