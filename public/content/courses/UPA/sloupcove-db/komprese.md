---
title: Kompresní techniky — prefix, RLE, cluster, sparse, indirect
---

# Kompresní techniky — prefix, RLE, cluster, sparse, indirect

Nad **dictionary encoding** ([[dictionary-encoding]]) přidávají sloupcové databáze další **light-weight komprese** specializované na různé distribuce hodnot. Tyto techniky operují *přímo* nad attribute vectorem (sekvencí valueIDs) a často umožňují *operace na komprimovaných datech* — `WHERE` lze vyhodnotit *bez* dekomprese. Klasické metody: **prefix encoding**, **run-length encoding (RLE)**, **cluster encoding**, **sparse encoding**, **indirect encoding**, **delta encoding** pro dictionary. Volba závisí na *sortednes* dat a *distribuci hodnot*.

::: viz column-compression-techniques "Vyberte distribuci (sorted+dominant, clustered, sparse-null, indirect, random) — viz porovná RLE / prefix / cluster / sparse / indirect / delta a vyznačí nejmenší."
:::

## Tabulka — předpoklady

Pro příklady použijeme:
* `country` — 200 zemí = 8 bitů.
* `city` — 1M měst = 20 bitů.
* `2nd_nationality` — 100 hodnot = 7 bitů.
* `first_name` — 5M jmen = 23 bitů.
* Tabulka 8 miliard řádků.

## Prefix encoding

Použití: sloupec **začíná dlouhou sekvencí stejné hodnoty**. Typické pro tabulky *seřazené* podle dominantní hodnoty.

Příklad: `country` v tabulce seřazené podle populace. Začátek tabulky obsahuje miliardy záznamů s `China`, `India`, `USA`, ...

**Princip**: nahradit dlouhý začátek jediným zápisem `(value, count)`. Zbytek je nezměněn.

```
Original:
  China, China, China, ..., (1.4B times), India, India, ..., USA, ...

Prefix-encoded:
  prefix = China, count = 1_400_000_000
  rest = [India, India, ..., USA, ...]
```

Cena: pre-fix část je *uniformní*, ale zbytek může mít vlastní distribuci → další komprese.

## Run-length encoding (RLE)

Použití: sloupec obsahuje **opakující se sekvence**. Typické pro seřazené sloupce s nízkou cardinality.

**Princip**: nahradit posloupnost stejné hodnoty *jednou instancí + počtem*.

Varianty:
* **(value, count)** — `[A, A, A, B, B, A, A] → [(A,3), (B,2), (A,2)]`.
* **(value, start_position)** — `[A, A, A, B, B, A, A] → [(A,0), (B,3), (A,5)]`. Umožňuje *direct access* k libovolné pozici!

Výhoda druhé varianty: pro lookup pozice `i` najít prvkový interval (binary search) a vrátit příslušnou hodnotu. O(log N) namísto skenování.

### Příklad — city column

Sortovaná tabulka podle `country, city`. RLE pro `city`:

```
Praha, Praha, Praha, ..., (millions), Brno, Brno, ..., Olomouc, ...

RLE: [(Praha, 0), (Brno, 12_345_678), (Olomouc, 14_567_890), ...]
```

Místo 8 miliard × 20 bits = 20 GB má RLE jen *1 entry per (city, start)* = 1M entries × 23 bits = 2.9 MB.

## Cluster encoding

Použití: sloupec má *seskupené* podobné hodnoty, ne *seřazené*. Klastry stejných hodnot.

**Princip**:
1. Rozdělit attribute vector na *bloky* fixní velikosti (typicky 1024 elementů).
2. Pokud blok obsahuje *jen jednu unikátní hodnotu*, nahradit ji *jedinou instancí*.
3. **Bit vector** délky N (počet bloků) — bit `1` = "tento blok je redukovaný", `0` = "tento blok je plný".

```
Blocks (1024 each):  [aaaaa...a] [aaaaa...a] [aabaa...a] [bbbbb...b] [cabac...a]
                          ↓             ↓           ↓           ↓         ↓
                       reduced      reduced     full        reduced     full

Storage:  reduced_blocks = [a, a, b]                  (1 hodnota per redukovaný blok)
          full_blocks    = [aabaa...a, cabac...a]    (1024 hodnot per plný blok)
          bit_vector     = [1, 1, 0, 1, 0]
```

### Příklad — city pro tabulku seřazenou podle country, city

Cluster size 1024 elements:
* Předpoklad: 7.8M bloků (8B / 1024).
* Worst case: 1 *uncompressible block* per city (cities transitions). 1M cities × 1024 × 20 bits = 2 441 MB.
* Compressible blocks: (7.8M − 1M) × 20 bits = 16 MB.
* Bit vector: 7.8M × 1 bit = 1 MB.
* **Total: ≈ 2.4 GB** (vs. 20 GB plain).

**Nevýhoda**: žádný *direct access* — pozice řádku se musí *vypočítat* z bit vectoru (kolik full blocks předcházelo). Drahé pro random access.

## Sparse encoding

Použití: sloupec má *jednu velmi častou* hodnotu a *řídké* ostatní (např. NULL).

**Princip**:
1. Najít hodnotu `v` s největším počtem výskytů.
2. *Odstranit* všechny výskyty `v` ze sloupce.
3. **Bit vector** — bit `1` = pozice, kde byla `v`; bit `0` = pozice se zbývající hodnotou.
4. Zbývající hodnoty uložit v stejném pořadí.

```
Original: [A, A, B, A, C, A, A, A, D, A]
v = A (dominantní)

bit_vector: [1, 1, 0, 1, 0, 1, 1, 1, 0, 1]
remaining:  [B, C, D]
```

Pro recovery: projít bit vector, pro `1` výstup je `A`, pro `0` výstup je další z `remaining`.

### Příklad — 2nd nationality

Velmi mnoho lidí má jen jedno občanství, druhé je NULL. Sparse encoding:
* `bit_vector` označuje *kdo má* druhé občanství (řekněme 10 %).
* `remaining` má jen non-null hodnoty (800M entries × 7 bits = 700 MB).
* `bit_vector` = 8B × 1 bit = 1 GB.
* **Total: 1.7 GB** vs. 7 GB plain.

## Indirect encoding

Použití: blok obsahuje *jen několik* unikátních hodnot, ale ne všechny stejné. Nemůžeme použít cluster encoding, protože není redukovatelný.

**Princip**:
1. Rozdělit attribute vector na bloky (1024).
2. Pro každý blok zjistit, kolik unikátních hodnot obsahuje.
3. Pokud `unique < threshold` (např. 16), vytvořit *lokální dictionary* pro tento blok.
4. Bit-pack valueIDs lokálního dictionary (4 bits pro 16 hodnot, místo 23 bitů globálního).

```
Globální dictionary: 5M jmen, 23 bitů per ID.

Blok 1024 elementů obsahuje jen 8 unikátních jmen:
  Lokální dictionary: 8 entries (pointers do globálního).
  Bit-packed valueIDs: 1024 × 3 bits = 3 KB (vs. 1024 × 23 bits = 24 KB).
  + lokální dictionary: 8 × 23 bits = 23 B.
```

Bit vector indikuje, které bloky používají indirect encoding a které plain.

### Příklad — first name pro tabulku seřazenou podle country

V rámci země je *podobná* distribuce jmen (Karel, Pavel, Jiří v ČR). Lokální dictionary per country.

**Direct access** zachován — známe počet bitů per ID v daném bloku.

## Delta encoding (pro dictionary)

Pro **seřazené řetězce v dictionary** — string komprese.

**Princip**: bloky stringů (typicky 16). První string celý, ostatní jako *delta* od předchozího (společný prefix length + suffix).

```
Original strings:
  "Brno"
  "Brno-Bystrc"
  "Brno-Komín"
  "Brno-střed"

Delta:
  "Brno"           (full)
  4 + "-Bystrc"    (prefix length 4, then suffix)
  6 + "Komín"      (prefix length 6 "Brno-K"... no, 4 + "-K"; details depend on implementation)
  5 + "střed"
```

### Příklad — 1M cities × 49 B average

Bez delta: 47 MB.
S delta encoding: ≈ 16 MB (3× komprese).

## Kombinace technik

Reálná in-memory DB *kombinuje* techniky — různé sloupce mají různou strategii podle distribuce:

| Sloupec | Distribuce | Technika |
| :--- | :--- | :--- |
| `country` | sorted, dominant | Prefix |
| `city` | sorted, clustered | RLE nebo Cluster |
| `2nd_nationality` | mostly NULL | Sparse |
| `first_name` | grouped per country | Indirect |
| `email` | unique, random | Plain (no compression possible) |

DB optimizer *měří distribuci* sloupce a *volí nejlepší techniku*. SAP HANA má 5+ technik a sám detekuje, kdy přepnout.

## Operace přímo na komprimovaných datech

Klíčová výhoda light-weight komprese: mnoho operací *nevyžaduje dekompresi*:

* **Count** — pokud RLE má `(value, count)`, count = sum of counts.
* **Distinct** — počet entries v dictionary.
* **Min/Max** — pro sorted dictionary první/poslední entry.
* **Sum** — pro RLE: `sum(value × count)`.
* **Equality test** — porovnání valueID, ne real value.

To je *dvojí výhra* — menší data v cache + jednodušší výpočet.

## Compression vs. heavy compression

Light-weight komprese (RLE, dictionary, prefix) jsou *very fast* — řádově ns per element. Pro analytic DB ideal.

**Heavy** komprese (gzip, zstd, LZMA) dosáhne *vyšších poměrů* (10× vs. 3×), ale *vyžadují* dekompresi před zpracováním. Vhodné jen pro *cold storage* (Parquet files na S3), ne pro hot data v paměti.

Většinou se v in-memory DB používá light-weight encoding *v paměti* a heavy compression *jen pro persistent storage* (logs, backups).

## Důsledky pro tabulkové sorting

Komprese je *citlivá na pořadí*. Tabulka může být seřazena podle *jednoho sloupce* (CLUSTER BY v Vertica, `ORDER BY` v ClickHouse). Pak je:

* Sorting column komprimovaná velmi efektivně (RLE, prefix).
* Korelované sloupce (city je korelováno s country) také dobře komprimované.
* Nekorelované sloupce trpí.

Volba sorting column je jedna z **nejdůležitějších design decisions** v sloupcové DB.

## Kompresní ratio v praxi

| Systém | Typický compression ratio | Dominant techniques |
| :--- | :---: | :--- |
| **Plain row** | 1× | žádná |
| **Plain column** | 1× | žádná |
| **Dict only** | 5-10× | dictionary |
| **Dict + RLE/cluster** | 10-30× | + RLE/cluster |
| **Dict + all techniques** | 20-50× | + sparse, indirect |
| **+ heavy compression (cold)** | 50-100× | + LZ4/Snappy/zstd |

8 TB raw data → 200 GB komprimovaných → 80 GB s heavy compression. Vejde se na one server.

## Limity

Komprese *nezachrání* pokud:
* Sloupec má *vysokou cardinality* a *náhodné* hodnoty (UUID, random IDs).
* Sloupec není *seřazený* a hodnoty *nejsou clusterované*.
* Hodnoty jsou *velmi krátké* (single bool — komprese overhead převáží).

Pro tyto případy je nejlepší *plain* encoding.

::: link "Abadi, D. J. et al.: The Design and Implementation of Modern Column-Oriented Database Systems (FnT 2013)" "https://www.nowpublishers.com/article/Details/DBS-024"
:::

::: link "Apache Parquet — Encodings" "https://parquet.apache.org/docs/file-format/data-pages/encodings/"
:::

::: link "Plattner, H.: A Course in In-Memory Data Management" "https://link.springer.com/book/10.1007/978-3-642-36524-9"
:::

---

*Zdroj: UPA přednáška *Introduction to In-memory Column-based Databases* (Benek, SAP). Externí reference: Abadi, D. J., Boncz, P. A., Harizopoulos, S., Idreos, S., Madden, S.: *The Design and Implementation of Modern Column-Oriented Database Systems*, Foundations and Trends in Databases 5(3), 2013; Plattner, H.: *A Course in In-Memory Data Management*, Springer 2013; Färber, F. et al.: *The SAP HANA Database — An Architecture Overview*, IEEE Data Eng. Bulletin 2012.*
