---
title: Dictionary encoding
---

# Dictionary encoding

**Dictionary encoding** (slovníkové kódování) je základní kompresní technika v sloupcových databázích. Místo ukládání původních hodnot (řetězců, datumů, dlouhých čísel) se ukládají *short integer ID* — *valueIDs*. Mapování ID ↔ hodnota je v *dictionary* — samostatné struktuře (typicky seřazené pole nebo hash mapa). Výsledek: výrazná **redukce velikosti** (zejména pro řetězce a kategorické atributy) a **rychlejší skenování** (porovnání int je rychlejší než porovnání řetězců). Dictionary encoding je *foundation* pro další kompresní techniky ([[komprese]]).

## Motivace

Příklad — populace 8 miliard lidí, atribut `country`:

* **Plain text** — 200 jednotlivých zemí, průměrná délka názvu 47 znaků. Celkem `8 · 10⁹ × 47 B = 376 GB`.
* **Dictionary encoded** — 200 zemí jako entry v dictionary, každá s int ID. Sloupec uchovává jen ID. Pro 200 hodnot stačí 8 bitů.

```
Dictionary (200 entries):
  0 → "Afghanistan"
  1 → "Albania"
  2 → "Algeria"
  ...
  199 → "Zimbabwe"

Sloupec country:
  Row 1: 192   (= Czech Republic)
  Row 2: 156   (= USA)
  Row 3: 192   (= Czech Republic)
  ...
```

Sloupec `country` má teď velikost `8 · 10⁹ × 1 B = 8 GB`. Dictionary je `200 × ~50 B = 9.4 KB`. **47× redukce**.

## Princip

1. **Sloupec je rozdělen na dictionary a attribute vector**.
2. **Dictionary** ukládá všechny distinct hodnoty, každá implicitní valueID (index).
3. **Attribute vector** ukládá valueID pro každý záznam.
4. **Bit-encoded fixed-length** — všechny valueIDs mají stejný počet bitů (např. 23 bits pro 5M unikátních hodnot), což umožňuje *přesné offset výpočty*.

::: viz dictionary-encoding-builder "Upravte sloupec — sledujte dictionary, bit-packed attribute vector a kompresní poměr. Sorted dict umožní range queries, append-only umožní rychlé INSERT."
:::

## Vyhledání hodnoty

`SELECT * FROM users WHERE fname = 'Anna'`:

1. **Dictionary lookup**: najít valueID pro `"Anna"`.
   * Pokud je dictionary *sorted*, binary search: O(log N).
   * Pokud *unsorted*, lineární scan: O(N).
   * Hash table: O(1).
2. **Attribute vector scan**: hledej řádky s `valueID = X`.
   * Lineární scan all entries.
   * Vektorovaný (SIMD) — porovnat 16 entries najednou (AVX-512).
3. **Reconstruction** — pro nalezené řádky vrátit *originální hodnoty* (lookup dictionary).

## Sorted vs. unsorted dictionary

### Sorted dictionary

* **+** Binary search O(log N) — pro velké slovníky výhodné.
* **+** Range queries — `WHERE age > 30` lze přeložit na *range of valueIDs* (od indexu, kde začíná 31, do konce).
* **−** Updates — INSERT nové hodnoty může vyžadovat *reseřazení* dictionary a **přepsání všech valueIDs** v attribute vector (drahé!).

### Unsorted (append-only) dictionary

* **+** INSERT levné — přidat hodnotu na konec, attribute vector nemusí být přepsán.
* **−** Lookup O(N) — nebo udržovat side hash index.
* **−** Range queries — musí být přeloženy přes lookup více hodnot.

Praktický kompromis: **dvojstavový dictionary**:
* **Main store** — sorted, stabilní.
* **Delta store** — unsorted append-only pro recent inserts.
* Periodically **merge** delta into main (resort celé struktury).

## Bit-packing

Pokud dictionary má `N` unikátních hodnot, valueIDs potřebují `⌈log₂(N)⌉` bitů. Bit-packed attribute vector:

```
N = 200 → 8 bitů per ID
N = 5M  → 23 bitů per ID
N = 8B  → 33 bitů per ID
```

Místo padding na 32/64 bitů se používá *bit-packed* uložení — N hodnot v `N × ⌈log₂(N)⌉ / 8` bajtech.

Cena: rozparsování bitů při čtení (bit shifty, masky). Moderní CPU mají *bit manipulation instructions* (BMI2) pro rychlou extrakci.

## Příklady — kolik se ušetří

Tabulka populace 8 miliard:

| Sloupec | Cardi-nality | Bits/ID | Plain size | Dict + Column | Compression |
| :--- | :---: | :---: | :---: | :---: | :---: |
| First names | 5M | 23 | 400 GB | 250 MB + 23 GB | 17× |
| Last names | 8M | 23 | 400 GB | 400 MB + 23 GB | 17× |
| Gender | 2 | 1 | 8 GB | 2 B + 1 GB | 8× |
| City | 1M | 20 | 400 GB | 50 MB + 20 GB | 20× |
| Country | 200 | 8 | 376 GB | 9.4 KB + 8 GB | **47×** |
| Birthday | 40 000 | 16 | 16 GB | 80 KB + 16 GB | ≈1× |
| **Total** | | | **1.6 TB** | **≈ 92 GB** | **17×** |

Z 1.6 TB původních dat → 92 GB komprimovaných. Toto je *jen* dictionary encoding; další komprese ([[komprese]]) dosáhne dalších 2–4× redukce.

## Operace přímo na zakódovaných datech

Klíčový benefit: mnoho operací lze provést *na valueIDs*, ne na původních hodnotách. Příklady:

* **Equality check**: `gender = 'F'` → `valueID(gender) = 0`. Porovnání int je rychlejší než string.
* **GROUP BY** — agregace podle valueID (int hash), ne podle string.
* **DISTINCT** — počet unikátních valueIDs v vector.
* **COUNT(*) WHERE country = X** — vector scan + count.
* **JOIN** — porovnání valueIDs napříč tabulkami (pokud sdílejí dictionary).

Pro range queries musí být dictionary *sorted*. Pro arithmetic operations potřebujeme původní hodnoty (`SUM(age)` musí dereference valueID → real age).

## Cena dictionary encoding

* **Random insert** je *drahý*:
  1. Lookup dictionary (zda hodnota existuje).
  2. Pokud ne, append do dictionary.
  3. Pokud sorted dictionary, reorganize + update all attribute vector entries.
  4. Append valueID do attribute vector.
* **Update** je obdoba insert + delete.
* **Delete** je *logické* — označit záznam jako neaktivní, periodicky garbage collect.

Pro tyto důvody jsou column stores nesvědčí pro *high-throughput OLTP*. Více v [[operace-imdb]] o tradeoffs INSERT/UPDATE/DELETE v sloupcových DB.

## Dictionary v různých systémech

* **SAP HANA** — sorted dictionary, dual-store (main + delta).
* **Vertica** — sorted, persistent.
* **Apache Parquet** — dictionary encoding optional per page; falls back to plain encoding pokud cardinality > threshold.
* **Apache ORC** — sorted with bloom filter.
* **ClickHouse** — `LowCardinality` data type — explicit opt-in pro dictionary.
* **Snowflake** — automatický, transparent.

## Praktické tipy {tier=practice}

* **Vyhněte se high-cardinality dictionaries** — pokud sloupec má skoro unikátní hodnoty (UUID, primary keys), dictionary nepřináší žádnou kompresi, jen overhead.
* **Pre-sort dictionary** — pro hot lookups je sorted lepší.
* **Bloom filtery** — pro rychlé "exists?" test bez dictionary lookup.
* **Materialized views** — pre-aggregated podle valueID, eliminuje run-time work.

## Limity

Dictionary encoding *nezachrání* sloupce s:
* **Velmi vysokou cardinality** — UUID, hash hodnoty.
* **Náhodnými unikátními hodnotami** — primary keys.
* **Velmi krátkými hodnotami** — single char tag.

Pro tyto sloupce je *plain* encoding optimální.

::: link "Plattner, H.: A Common Database Approach for OLTP and OLAP using an In-Memory Column Database (SIGMOD 2009)" "https://dl.acm.org/doi/10.1145/1559845.1559846"
:::

::: link "SAP HANA — Database Persistence Layer" "https://help.sap.com/docs/SAP_HANA_PLATFORM/6b94445c94ae495c83a19646e7c3fd56/15e16ed0-6c5e-1014-8b4b-cc63dafffd11.html"
:::

---

*Zdroj: UPA přednáška *Introduction to In-memory Column-based Databases* (Benek, SAP). Externí reference: Plattner, H., Zeier, A.: *In-Memory Data Management*, 2nd ed., Springer 2012; Färber, F. et al.: *SAP HANA Database — Data Management for Modern Business Applications*, SIGMOD Record 2011; Abadi, D. J., Boncz, P. A., Harizopoulos, S., Idreos, S., Madden, S.: *The Design and Implementation of Modern Column-Oriented Database Systems*, Foundations and Trends in Databases 2013.*
