---
title: DELETE, INSERT, UPDATE v sloupcových databázích
---

# DELETE, INSERT, UPDATE v sloupcových databázích

Sloupcové databáze jsou *optimalizovány pro čtení* a analytické dotazy — INSERT, UPDATE a zejména DELETE jsou *dražší* než v tradičních row store. Důvod: data téhož řádku jsou *rozprostřena* mezi mnoha sloupcovými souborami; dictionary encoding a komprese komplikují jednoduché operace. Moderní in-memory DB řeší tento problém **architekturou main/delta store** — drahé operace jdou do menšího delta store, který se *periodicky merguje* s velkým, optimalizovaným main store. Pochopení této architektury je klíčové pro nasazení sloupcových DB jako *operational* (ne jen analytical) databáze.

## DELETE — dvě filozofie

### Physical DELETE

Záznam se *skutečně odstraní* z databáze. Po DELETE záznam neexistuje a *nelze* k němu přistupovat.

* **+** Žádná režie pro deleted record.
* **−** Nelze udělat *historic queries* nebo *audit*.

### Logical DELETE

Záznam se označí jako *non-valid* — DB zachová data, ale standardní query je nepřečte. *Historic queries* a *reporting* mohou stále pracovat.

* **+** Plný audit trail.
* **+** Soft delete pro recovery.
* **−** Dodatečná režie (bit flag per row).

Většina enterprise systémů preferuje **logical DELETE** — data jsou *cenná aktiva*, hard delete je riskantní (chyba = ztráta dat).

### DELETE je velmi drahá operace

V column store DELETE musí *najít* záznam (potenciálně skenování všech sloupců) a *označit* ho jako neaktivní. Pro miliony záznamů to může trvat hodiny.

```sql
DELETE FROM users WHERE email = 'anna@example.com';
```

1. Skenování `email` sloupce, nalezení `valueID('anna@example.com')`.
2. Hledání tohoto valueID v attribute vector — najít řádek.
3. Označit příslušný *validity bit* na 0.

Pro batch DELETE (`DELETE … WHERE date < '2020-01-01'`) lze sweep všech řádků v jediném scanu.

## INSERT

V column store je INSERT *dvojaké* — záleží, zda hodnota existuje v dictionary.

### Bez nové dictionary entry

Pokud vkládaná hodnota *již je* v dictionary:

1. **Lookup** v dictionary — najít existující valueID.
2. **Append** valueID na konec attribute vector.

Toto je *levné* — O(log N) lookup + O(1) append.

```sql
INSERT INTO world_population VALUES
  ('Karen', 'Schulze', 'F', 'GER', 'Rostock', '2014-06-20');
```

Pokud `'GER'` už je v `country` dictionary jako valueID 42:
1. Lookup `'GER'` → 42.
2. Append 42 na konec `country` attribute vector.

::: svg "INSERT bez new dictionary entry: lookup → append valueID. Dictionary nezměněn, attribute vector roste."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <text x="100" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">Dictionary (nezměněno)</text>
    <g font-family="ui-monospace, monospace" font-size="10">
      <rect x="40" y="40" width="120" height="18" fill="var(--bg-card)" stroke="var(--accent)"/>
      <text x="50" y="54" fill="var(--text)">42: GER</text>
      <rect x="40" y="58" width="120" height="18" fill="var(--bg-card)" stroke="var(--accent)"/>
      <text x="50" y="72" fill="var(--text)">156: USA</text>
      <rect x="40" y="76" width="120" height="18" fill="var(--bg-card)" stroke="var(--accent)"/>
      <text x="50" y="90" fill="var(--text)">192: CZE</text>
    </g>
  </g>
  <g>
    <text x="350" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">Attribute vector</text>
    <g font-family="ui-monospace, monospace" font-size="10">
      <rect x="280" y="40" width="50" height="18" fill="var(--bg-card)" stroke="var(--accent-line)"/>
      <text x="290" y="54" fill="var(--text)">192</text>
      <rect x="280" y="58" width="50" height="18" fill="var(--bg-card)" stroke="var(--accent-line)"/>
      <text x="290" y="72" fill="var(--text)">42</text>
      <rect x="280" y="76" width="50" height="18" fill="var(--bg-card)" stroke="var(--accent-line)"/>
      <text x="290" y="90" fill="var(--text)">156</text>
      <text x="290" y="110" fill="var(--text-muted)">...</text>
      <rect x="280" y="115" width="50" height="22" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
      <text x="305" y="130" text-anchor="middle" fill="white" font-weight="600">+42</text>
    </g>
    <text x="380" y="130" fill="var(--accent)" font-size="10">← append (nová Karen)</text>
  </g>
</svg>
:::

### S novou dictionary entry

Pokud hodnota *neexistuje* v dictionary:

1. **Lookup** — neúspěch.
2. **Append nové entry** do dictionary, dostane nový valueID.
3. *Pokud dictionary je sorted* — *reorganizace* + **přepis všech existujících valueIDs**!
4. **Append** valueID na konec attribute vector.

Krok 3 je *velmi drahý* — pro miliardový sloupec znamená přepis miliard valueIDs.

```sql
INSERT INTO world_population VALUES
  ('Karen', 'Schulze', 'F', 'VAT', ...);
   -- 'VAT' (Vatican) neexistuje v dictionary
```

V *sorted* dictionary se nová hodnota *vloží* na správnou pozici a všechny pozice za ní se posunou o 1 → všechny příslušné valueIDs v attribute vector +1.

## UPDATE

UPDATE je v column store *kombinace* DELETE + INSERT.

```sql
UPDATE users SET email = 'new@ex.com' WHERE id = 42;
```

1. Najít řádek 42 (skenováním `id` sloupce).
2. *Logicky odstranit* starou hodnotu (validity bit = 0 pro stávající řádek).
3. *Vložit nový řádek* s aktualizovanou hodnotou.

Místo "in-place modification" je to "delete + insert" — *append-only* pattern.

Důsledek: po mnoha UPDATE může být tabulka *fragmentovaná* — mnoho deleted řádků. Pravidelně je nutné *compaction* (kompakce).

## Main/Delta store architektura

Pro řešení INSERT/UPDATE/DELETE efektivity používají moderní column DB **dvojstavovou architekturu**:

::: svg "Main + Delta store: main store je read-optimized (komprimovaný, sorted dictionary). Inserty/updates jdou do delta store (lehčí komprese, append-only). Periodicky delta merguje s main."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="20" y="30" width="160" height="100" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2" rx="6"/>
    <text x="100" y="50" text-anchor="middle" fill="var(--text)" font-weight="600">Main store</text>
    <text x="100" y="68" text-anchor="middle" fill="var(--text-muted)" font-size="10">read-optimized</text>
    <text x="100" y="84" text-anchor="middle" fill="var(--text-muted)" font-size="10">sorted dictionary</text>
    <text x="100" y="98" text-anchor="middle" fill="var(--text-muted)" font-size="10">heavy compression</text>
    <text x="100" y="115" text-anchor="middle" fill="var(--accent)" font-size="10">large, stable</text>
  </g>
  <g>
    <rect x="220" y="30" width="160" height="100" fill="var(--bg-card)" stroke="var(--accent-line)" rx="6"/>
    <text x="300" y="50" text-anchor="middle" fill="var(--text)" font-weight="600">Delta store</text>
    <text x="300" y="68" text-anchor="middle" fill="var(--text-muted)" font-size="10">write-optimized</text>
    <text x="300" y="84" text-anchor="middle" fill="var(--text-muted)" font-size="10">unsorted dictionary</text>
    <text x="300" y="98" text-anchor="middle" fill="var(--text-muted)" font-size="10">append-only</text>
    <text x="300" y="115" text-anchor="middle" fill="var(--accent)" font-size="10">small, growing</text>
  </g>
  <g>
    <rect x="420" y="30" width="100" height="100" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="470" y="58" text-anchor="middle" fill="var(--text)" font-weight="600">Klient</text>
    <text x="470" y="78" text-anchor="middle" fill="var(--text-muted)" font-size="10">INSERT</text>
    <text x="470" y="92" text-anchor="middle" fill="var(--text-muted)" font-size="10">UPDATE</text>
    <text x="470" y="106" text-anchor="middle" fill="var(--text-muted)" font-size="10">DELETE</text>
  </g>
  <line x1="420" y1="80" x2="380" y2="80" stroke="var(--accent)" marker-end="url(#md-arr)"/>
  <text x="180" y="80" text-anchor="end" fill="var(--text-muted)" font-size="9">SELECT skenuje obě</text>
  <line x1="180" y1="70" x2="220" y2="70" stroke="var(--accent-line)" stroke-dasharray="2 2"/>
  <line x1="220" y1="90" x2="180" y2="90" stroke="var(--accent-line)" stroke-dasharray="2 2" marker-end="url(#md-arr)"/>
  <text x="200" y="65" text-anchor="middle" fill="var(--text-muted)" font-size="9">SELECT</text>
  <text x="200" y="100" text-anchor="middle" fill="var(--text-muted)" font-size="9">merge</text>
  <text x="270" y="160" text-anchor="middle" fill="var(--text-muted)" font-size="10">Periodicky: delta merge → main (kompakce, resort)</text>
  <defs>
    <marker id="md-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

### Hlavní store (main)

* **Sorted dictionary** — fast lookup, range queries.
* **Heavy compression** — RLE, cluster, sparse.
* **Stable** — write je drahý, ale read je velmi rychlý.
* **Optimized pro analytics**.

### Delta store

* **Unsorted dictionary** — append-only, fast inserts.
* **Light compression** — dictionary only.
* **Small** — typicky < 10 % main store velikosti.
* **Optimized pro writes**.

### Operace

* **INSERT/UPDATE/DELETE** — jde do *delta store*. Rychlé (append-only).
* **SELECT** — *kombinuje* main a delta store. Trochu pomalejší než jen main, ale stále rychlé.
* **Periodic merge** — delta se *mergne* s main, resort, recompress. Provede se na pozadí (online).

### Konkrétní implementace

* **SAP HANA** — main/delta architektura. `MERGE DELTA` příkaz nebo automatické sloučení.
* **Vertica** — WOS (Write-Optimized Store) + ROS (Read-Optimized Store). Tuple Mover.
* **ClickHouse** — MergeTree storage engine — data se zapisují do *parts*, periodicky se mergují.
* **Apache Druid** — segments (real-time + historical).

::: viz main-delta-merge-timeline "INSERT plní delta store (rychlé append-only). SELECT skenuje main + delta. Když delta překročí ~20 %, spusťte MERGE — slije se s main, který je sorted + komprimovaný."
:::

## Online MERGE

Tradiční ALTER TABLE v RDBMS *blokuje* (zámek). V column store s MVCC (multi-versioned concurrency control) lze merge provést *online*:

* Nový main store se buduje na pozadí.
* Žádné concurrent reads nejsou blokovány — čtou old main + delta.
* Po dokončení nového main se *atomically switch*.
* Old main + delta jsou garbage-collected.

## Modifikace schématu

Standardní `ALTER TABLE ADD COLUMN` v column store je *velmi rychlý* — stačí přidat nový (prázdný) sloupcový soubor.

`DROP COLUMN` — také rychlý (smaže jeden sloupcový soubor).

`ALTER COLUMN TYPE` — vyžaduje rebuild dictionary a attribute vector. Drahá operace.

## Příklad — INSERT s MVCC

Při INSERT v multi-versioned DB:

```
Verze 1: row_id=42, name=Anna, salary=50000   (visible from T1 onwards)
Verze 2: row_id=42, name=Anna, salary=55000   (after UPDATE at T2)
```

Reads tranzakce s timestamp T < T2 vidí Verze 1; reads s T ≥ T2 vidí Verze 2. Stará verze je *garbage-collected*, jakmile žádná aktivní tranzakce ji nemůže potřebovat.

V MemSQL/SingleStore:
* **Reads nejsou blokovány** zápisem.
* **Row-level zámky** pro zápis.
* **Online ALTER TABLE** — schéma změna bez downtime.

## Durability — log + group commit

Klasická ACID DB *fsynkuje* každou tranzakci na disk před commit. Drahé (~ms).

In-memory column store používá **group commit**:
1. Tranzakce zapíše do in-memory log buffer.
2. Vrátí klientovi *commit OK* (riziko ztráty < 1ms data).
3. Periodicky (~10ms) buffer flushne na disk (write-ahead log).

* **+** 100×–1000× vyšší propustnost než per-transakce fsync.
* **−** *Malé okno* (~ms) pro ztrátu commitnutých tranzakcí v případě pádu HW.
* Pro většinu byznysu akceptovatelné. Pro safety-critical (banking) lze nastavit synchronous fsync (s nižší propustností).

## Praktické důsledky

### Když je sloupcový DB nevhodný

* **High-throughput OLTP** — milion INSERT/sec.
* **Frequent random updates** of small subset of data.
* **Single-row reads** — `SELECT * FROM users WHERE id = X` se opakují miliony × per second.

### Kdy je ideální

* **OLAP** — aggregational queries nad miliony řádků.
* **Read-mostly** — load data, then query many times.
* **Append-only** — log data, time series, telemetry.
* **HTAP** s rozumným write throughput — typicky < 10 K writes/sec.

## Combined OLTP + OLAP (HTAP)

Klasická architektura: OLTP DB → ETL → Analytical DW. Latence několik hodin.

Moderní *HTAP* (Hybrid Transactional/Analytical Processing): jedna DB pro obě úlohy.

* SAP HANA — designed pro HTAP.
* MemSQL/SingleStore — row + column engine.
* Snowflake Unistore — Hybrid Tables (preview).
* TiDB — multi-region SQL s HTAP.

Cena: kompromis (write OLAP slower than dedicated row, analytics slower than dedicated columnar).

## Praktické tipy

* **Bulk insert** — pro velké imports použít BULK INSERT (CSV import) místo jednotlivých INSERT — DB to optimalizuje (single delta merge).
* **Batch UPDATE/DELETE** — pro spousty změn nejprve `BEGIN`, mass changes, `COMMIT`. Snižuje overhead per row.
* **Schedule MERGE off-peak** — manuálně spustit `MERGE DELTA` v noci, kdy je load nízký.
* **Monitor delta size** — pokud delta překročí 20 % main, performance trpí. Force merge.

Více o výkonu skenování viz [[scan-performance]].

::: link "Plattner, H., Zeier, A.: In-Memory Data Management — Technology and Applications (kniha)" "https://link.springer.com/book/10.1007/978-3-642-29575-1"
:::

::: link "Diaconu, C. et al.: Hekaton — SQL Server's Memory-Optimized OLTP Engine (SIGMOD 2013)" "https://www.microsoft.com/en-us/research/publication/hekaton-sql-servers-memory-optimized-oltp-engine/"
:::

---

*Zdroj: UPA přednáška *Introduction to In-memory Column-based Databases* (Benek, SAP). Externí reference: Plattner, H., Zeier, A.: *In-Memory Data Management*, 2nd ed., Springer 2012; Färber, F. et al.: *SAP HANA Database — Data Management for Modern Business Applications*, SIGMOD Record 2011; Krueger, J. et al.: *Fast Updates on Read-Optimized Databases Using Multi-Core CPUs*, VLDB 2012.*
