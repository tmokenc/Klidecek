---
title: Integrace dat a ETL
---

# Integrace dat a ETL

**Integrace dat** kombinuje informace z více zdrojů do jednoho úložiště pro analýzu nebo provozní použití. Klasická realizace: **ETL** (Extract-Transform-Load) — pipelína, která periodicky extrahuje data ze zdrojů, transformuje je do cílového schématu a načte do datového skladu. Moderní variantou je **ELT** (Extract-Load-Transform) — data se nejprve načtou jak jsou, transformace probíhá *v cílovém systému* (Snowflake, BigQuery, Databricks). Pochopení integračních problémů — schema mismatch, entity resolution, conflict resolution — je klíčové pro datové projekty kombinující více zdrojů.

## Zdroje konfliktů při integraci

Data z různých systémů typicky obsahují:

### Konflikty na úrovni schématu (metadata)

* **Různé názvy** — `c_zakaznika` v jednom systému, `zakaznikID` v druhém. Stejný význam, jiné jméno.
* **Různé datové typy** — `VARCHAR(20)` vs. `CHAR(10)` vs. `INTEGER`.
* **Různé jednotky** — `cena_v_Kč` vs. `cena_v_USD` vs. `cena_v_haléřích`.
* **Různé domény** — `pohlaví` jako `{M, F}` vs. `{1, 2}` vs. `{male, female}`.

### Konflikty na úrovni dat (entity)

**Problém identifikace entit** — táž entita reálného světa je v různých zdrojích identifikována *různě*.

* **Rodné číslo vs. osobní číslo** — různé klíče pro tutéž osobu.
* **IČO firmy** — kanonický identifikátor v ČR, ale různé verze (s/bez DIČ).
* **E-mail** — fungoval jako *de facto* PK, ale uživatel ho může změnit.

### Konflikty hodnot

Pro tutéž entitu mají různé zdroje *různé* hodnoty atributů:

* **Jméno** — `"Jan Novák"` vs. `"Novák Jan"` (různé pořadí) vs. `"J. Novák"` (zkrácené).
* **Datum** — `15.3.2025` (CZ) vs. `3/15/2025` (US) vs. `2025-03-15` (ISO).
* **Adresa** — různé verze stejné adresy (s/bez čísla popisného, s/bez bytu).

## Strategie integrace

### Schema matching

Mapování atributů jednoho schématu na druhé:

* **Manual mapping** — analytik sestaví mapování (`c_zakaznika ← zakaznikID`).
* **Schema matching tools** — automatická detekce (CUPID, COMA). Heuristiky podle názvů, typů, hodnot.
* **ML-based** — neural net trénovaný na anotovaných mapováních.

### Entity resolution / record linkage

Spojení záznamů, které představují *tutéž entitu*:

1. **Blocking** — předfiltrovat páry kandidátů (jen ti se stejným prvním písmenem příjmení).
2. **Pairwise comparison** — porovnat páry kandidátů (string similarity, numeric difference).
3. **Classification** — match / no-match / human review (active learning).

Knihovny: `dedupe` (Python), `recordlinkage` (Python), `Splink` (PySpark).

### Conflict resolution

Pro tutéž entitu více verzí hodnoty — jakou vzít?

* **Master data** — určit *kanonický* zdroj (CRM > účetnictví pro adresy).
* **Most recent** — newest timestamp.
* **Highest quality** — zdroj s nejvyšší trust score.
* **Consensus** — většinová hodnota.
* **Application-specific** — pravidla dle domény (banka vždy bere přísnější verzi).

## ETL — klasický model

**ETL** (Extract, Transform, Load) je tradiční přístup pro budování datových skladů (data warehouses).

::: svg "ETL pipeline: Extract → Transform → Load. Z mnoha zdrojů (DB, soubory, API) data putují přes transformační vrstvu (čištění, normalizace, agregace) do datového skladu."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="20" y="30" width="100" height="30" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="70" y="50" text-anchor="middle" fill="var(--text)" font-size="10">DB systém 1</text>
    <rect x="20" y="70" width="100" height="30" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="70" y="90" text-anchor="middle" fill="var(--text)" font-size="10">DB systém 2</text>
    <rect x="20" y="110" width="100" height="30" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="70" y="130" text-anchor="middle" fill="var(--text)" font-size="10">CSV soubory</text>
    <rect x="20" y="150" width="100" height="30" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="70" y="170" text-anchor="middle" fill="var(--text)" font-size="10">REST API</text>
  </g>
  <line x1="120" y1="105" x2="170" y2="105" stroke="var(--accent)" marker-end="url(#etl-arr)"/>
  <text x="145" y="98" text-anchor="middle" fill="var(--text-muted)" font-size="9">Extract</text>
  <g>
    <rect x="170" y="50" width="140" height="120" fill="var(--bg-card)" stroke="var(--accent)" rx="6" stroke-width="2"/>
    <text x="240" y="74" text-anchor="middle" fill="var(--text)" font-weight="600">Transform</text>
    <text x="240" y="94" text-anchor="middle" fill="var(--text-muted)" font-size="10">• validation</text>
    <text x="240" y="110" text-anchor="middle" fill="var(--text-muted)" font-size="10">• deduplication</text>
    <text x="240" y="126" text-anchor="middle" fill="var(--text-muted)" font-size="10">• schema mapping</text>
    <text x="240" y="142" text-anchor="middle" fill="var(--text-muted)" font-size="10">• aggregation</text>
    <text x="240" y="158" text-anchor="middle" fill="var(--text-muted)" font-size="10">• enrichment</text>
  </g>
  <line x1="310" y1="105" x2="360" y2="105" stroke="var(--accent)" marker-end="url(#etl-arr)"/>
  <text x="335" y="98" text-anchor="middle" fill="var(--text-muted)" font-size="9">Load</text>
  <g>
    <rect x="360" y="70" width="140" height="80" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="430" y="94" text-anchor="middle" fill="var(--text)" font-weight="600">Data warehouse</text>
    <text x="430" y="112" text-anchor="middle" fill="var(--text-muted)" font-size="10">denormalized,</text>
    <text x="430" y="126" text-anchor="middle" fill="var(--text-muted)" font-size="10">columnar storage,</text>
    <text x="430" y="140" text-anchor="middle" fill="var(--text-muted)" font-size="10">historical</text>
  </g>
  <defs>
    <marker id="etl-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

### Extract

Stahovat data ze zdrojů. Typy:
* **Full extract** — celá tabulka pokaždé. Jednoduché, drahé pro velké tabulky.
* **Incremental extract** — jen změny od posledního běhu. Vyžaduje *change detection* (timestamp, CDC).
* **Streaming** — kontinuální zápis (Kafka Connect, Debezium).

### Transform

Aplikovat business logiku, čistit data, normalizovat:
* **Cleansing** — formáty, missing values, šum ([[cisteni-dat]]).
* **Standardization** — jednotky, lokalizace, slovníky.
* **Deduplication** — entity resolution.
* **Aggregation** — pre-vypočtené agregáty (denní obrat, měsíční průměry).
* **Enrichment** — doplnění z dalších zdrojů (geo-lookup, ceník v různých měnách).
* **Derivation** — odvozené atributy (např. age z birthdate).

### Load

Načtení do cílového úložiště:
* **Full load** — drop & insert. Pro malá data.
* **Incremental load** — `INSERT` nových řádků, `UPDATE` změněných.
* **Slowly Changing Dimensions** (SCD Type 1/2/3) — strategie pro evoluci dimenzionálních tabulek.

## ELT — moderní paradigma

**ELT** (Extract, Load, Transform) převrací pořadí: data se nejprve načtou *raw* do data lake / warehouse, transformace probíhá *v* cílovém systému přes SQL.

Důvody pro ELT:
* **Cloud warehouses** (Snowflake, BigQuery, Redshift) mají *obrovský* výkon pro transformace — využijme je.
* **Schema-on-read** — flexibilita pro pozdější změny.
* **Data lineage** — raw data zůstává k dispozici, lze re-process s novou logikou.
* **dbt** (data build tool) — populární framework pro SQL-based transformace v ELT pipeline.

## Datový sklad — denormalizovaný model

Datové sklady obvykle používají *dimensional modeling* (Kimball):

* **Fact table** — měření (sales, clicks, transactions). Velká tabulka s denními/hodinovými agregacemi.
* **Dimension tables** — kontext (customers, products, time). Menší, denormalizované.
* **Star schema** — fakt v centru, dimenze kolem.
* **Snowflake schema** — dimenze jsou normalizované (s dalšími sub-dimenzemi).

```
        ┌──────────────┐
        │  Dim_Time    │
        └──────┬───────┘
               │
┌──────────────┴───────┐         ┌──────────────┐
│  Fact_Sales          │─────────│ Dim_Product  │
│  (rows ≈ miliony)    │         └──────────────┘
└──────────────┬───────┘
               │
        ┌──────┴───────┐
        │ Dim_Customer │
        └──────────────┘
```

Star schema je optimalizováno pro *OLAP* dotazy (group by, agregace).

## Slowly Changing Dimensions (SCD)

Dimenze se mění s časem — jak to modelovat?

* **SCD Type 1** — *overwrite*. Stará hodnota se ztrácí. Pro nedůležité atributy.
* **SCD Type 2** — *insert*. Nový řádek s novou validitou, starý zůstává. Plná historie.
* **SCD Type 3** — *přidat sloupec* `previous_value`. Jen poslední změna se zachová.
* **SCD Type 4** — *historie tabulka* — current + history.

```
SCD Type 2 příklad:
customer_id  name      city    valid_from   valid_to    is_current
1            Anna      Praha   2020-01-01   2023-05-30  false
1            Anna      Brno    2023-06-01   9999-12-31  true
```

Joinem na valid_from/valid_to lze rekonstruovat historický pohled.

## ETL nástroje

### Tradiční

* **Informatica PowerCenter** — enterprise ETL standard.
* **IBM DataStage** — IBM ekosystém.
* **Microsoft SSIS** — pro MS SQL Server.
* **Oracle Data Integrator (ODI)** — pro Oracle.
* **Talend Open Studio** — open source.

### Moderní cloud-native

* **Fivetran**, **Stitch**, **Airbyte** — managed ELT (connectors → warehouse).
* **dbt** — SQL-based transformations v warehouse.
* **Apache Airflow** — workflow orchestrator (DAGs, scheduling).
* **Prefect**, **Dagster** — moderní alternativy k Airflow.
* **AWS Glue**, **GCP Dataflow** — cloud-native managed ETL.

### Streaming

* **Apache Kafka** + Kafka Connect — log-based ingest.
* **Apache Flink** — stream processing.
* **Apache Spark Structured Streaming** — micro-batch streaming.

## Data lake vs. data warehouse vs. lakehouse

| | Data Lake | Data Warehouse | Lakehouse |
| :--- | :--- | :--- | :--- |
| **Schema** | on-read | on-write | both |
| **Data** | raw, unstructured | curated, structured | both |
| **Storage** | S3, ADLS, GCS | RDBMS columnar | S3 + Delta/Iceberg |
| **Query** | Spark, Athena | SQL | SQL via Spark/Databricks |
| **Cost** | nízká | vyšší | střední |
| **Examples** | AWS S3 + Athena | Snowflake, Redshift | Databricks Delta, Apache Iceberg |

**Lakehouse** (Databricks, Snowflake Unistore) kombinuje výhody obou — flexibilita lake + výkon warehouse.

## Praktické tipy

* **Idempotent transformations** — re-běh musí dát stejný výsledek.
* **Audit columns** — `created_at`, `updated_at`, `source_system` v každém řádku.
* **Data lineage** — sledovat, odkud kam data putují (OpenLineage, Marquez).
* **Data quality monitoring** — Great Expectations, Monte Carlo, Datafold.
* **Documentation** — dbt umožňuje *přímé* docs.dbt.io z YAML konfigurace.

## Pravidlo: data před business logikou

Datová pipeline je **business-critical** — chybný transformace ovlivní všechny downstream reporty a modely. Aplikujte software engineering best practices: version control, code review, tests, CI/CD, monitoring.

Více o redukci a transformaci viz [[redukce-dat]], [[normalizace-diskretizace]].

::: link "Kimball, R., Ross, M.: The Data Warehouse Toolkit (kniha)" "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/data-warehouse-dw-toolkit/"
:::

::: link "dbt — data build tool documentation" "https://docs.getdbt.com/"
:::

::: link "Apache Airflow documentation" "https://airflow.apache.org/docs/"
:::

---

*Zdroj: UPA přednáška *Příprava dat* (Burgetová). Externí reference: Kimball, R., Ross, M.: *The Data Warehouse Toolkit*, 3rd ed., Wiley 2013; Inmon, W. H.: *Building the Data Warehouse*, 4th ed., Wiley 2005; Christensen, P. et al.: *Data Integration — The Current Status and the Way Forward*, IEEE 2018; dbt documentation.*
