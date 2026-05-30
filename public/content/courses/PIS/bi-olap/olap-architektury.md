# Architektury OLAP serverů

Předchozí sekce ([[agregace]]) popisuje *logiku* výpočtu agregátů. Tato sekce řeší **fyzickou realizaci** — jak konkrétní OLAP server data ukládá a počítá. Tři klasické architektury (MOLAP, ROLAP, HOLAP) plus moderní *specializované SQL servery* tvoří dnešní krajinu.

## MOLAP — Multidimensional OLAP

**MOLAP** ukládá data ve **vlastních multidimenzionálních datových strukturách** — typicky řídké pole, $n$-rozměrné matice, bitmapové indexy.

Klíčové vlastnosti:

- *Předzpracované agregáty* — server materializuje typické podkostky předem (často všech $2^n$ pro malé $n$, nebo *cube selection* pro velké $n$).
- *Rychlé indexování* — vlastní formát optimalizovaný pro multidimenzionální přístup.
- *Maximální výkon* — dotaz se obvykle převede na *lookup* do předpočítaného pole.

Nevýhody:

- **Redundance** — agregáty se ukládají na disku separátně od detailu.
- **Velké prostorové nároky** — pro $n = 10$ a plnou materializaci je $2^{10} = 1024$ kuboidů.
- **Škálování** je obtížnější — vlastní formát neumí distribuovat napříč clusterem stejně snadno jako relační DB.
- **Refresh** je *celý reload* nebo *delta processing* — kompletní rebuild kostky je nákladný.

Typické nasazení: *finanční plánování*, *budgeting*, kde je granularita nízká (čtvrtletí × oddělení × položka rozpočtu) a uživatelé požadují *interaktivní odezvu* při what-if simulacích.

## ROLAP — Relational OLAP

**ROLAP** ukládá data v **klasických relačních tabulkách** (zpravidla schéma hvězda/sněhová vločka, viz [[schemata-skladu]]). Multidimenzionální pohled je *vrstva nad SQL* — uživatel vidí kostku, ale server transformuje její dotazy do SQL.

Klíčové vlastnosti:

- *Žádná redundance* — fakta jsou v jedné tabulce, dimenze v dalších, agregáty se počítají při dotazu nebo z *materialized views*.
- *Velká škálovatelnost* — kterákoli relační DB (Oracle, PostgreSQL, MySQL, …) je úložiště, lze využít její clusteringové schopnosti.
- *Standardní SQL* — lze používat existující dotazové nástroje, BI klienti (Tableau, Power BI) ROLAP nativně podporují.

Nevýhody:

- *Pomalejší* než MOLAP — agregáty se počítají *na živo*, jen pokud nejsou materialized views.
- *Složitější optimalizace* — SQL plánovač musí rozpoznat OLAP-style dotaz a využít vhodné indexy/MV.

ROLAP je dnes **mainstream** přístup, zejména v cloudu — *Snowflake*, *Google BigQuery*, *Amazon Redshift* jsou v podstatě výkonné ROLAP enginy s automatickou škálovatelností.

## HOLAP — Hybrid OLAP

**HOLAP** kombinuje obě světy:

- *Detailní data* v relačních tabulkách (ROLAP styl).
- *Předagregáty* (typické dotazy) v multidimenzionálních strukturách (MOLAP styl).

Logika rozhodnutí: detailní dotaz se zodpovídá *přes SQL* (jako v ROLAP), agregovaný dotaz *přes předpočítanou kostku* (jako v MOLAP). Server volí podle úrovně dotazu.

Příklad: **Microsoft SQL Server Analysis Services (SSAS)** — uživatel může na úrovni *partition* zvolit `MOLAP`, `ROLAP` nebo `HOLAP` podle profilu očekávaných dotazů.

## Specializovaný SQL server

Vedle klasických MOLAP/ROLAP/HOLAP vznikla *čtvrtá* generace — **specializované sloupcové SQL enginy** určené pro analytiku:

- *Sloupcové úložiště* — data jsou uložena po sloupcích, ne po řádcích. Pro agregaci přes jeden sloupec stačí načíst jen ten sloupec.
- *Vektorizované zpracování* — operace se aplikují na celé vektory (SIMD).
- *Komprese* — díky podobnosti hodnot v jednom sloupci dosahují 10×–100× komprese.

Příklady: **Apache Druid**, **DuckDB**, **ClickHouse**.

Nejsou to klasické OLAP servery v Coddově smyslu (nemají vlastní multidimenzionální API), ale **funkčně** plní stejnou roli — rychlá agregace nad miliardami řádků pomocí SQL.

## Příklady produktů

| Architektura | Produkty |
| :--- | :--- |
| **MOLAP** | Oracle Essbase, IBM Planning Analytics (TM1), Jedox |
| **ROLAP** | Mondrian / Pentaho (open-source) |
| **MOLAP — předpočítané kostky na Hadoopu** | Apache Kylin |
| **ROLAP — cloud** | Snowflake, Google BigQuery, Amazon Redshift |
| **HOLAP** | Microsoft SSAS, SAP BW (SAP Business Warehouse) |
| **Specializovaný SQL** | Apache Druid, DuckDB, ClickHouse |

## Které zvolit?

| Situace | Doporučení |
| :--- | :--- |
| Malá kostka (max miliony detailů), interaktivní what-if | **MOLAP** (Essbase, TM1) |
| Velká kostka (miliardy řádků), klasická BI architektura | **ROLAP** (Snowflake, ClickHouse) |
| Mix — část detail, část předagregátů | **HOLAP** (SSAS) |
| Real-time analýza streamovaných dat | **Specializovaný SQL** (Druid, ClickHouse) |
| Lokální analýza, jednotlivec, datasety v GB | **DuckDB** (vestavěný do procesu) |

Trend posledních 10 let: **dominantní postavení ROLAPu** s sloupcovým úložištěm, klasický MOLAP ustupuje. Důvod: cloudové sklady umí ROLAP optimalizovat tak agresivně (kompresí, paralelismem), že MOLAP přínos prakticky zaniká kromě úzkých specializovaných use-case.

## Co dále

Pro ROLAP a HOLAP je klíčová otázka *jak je relační databáze strukturována*. To přivádí ke **schématům datového skladu** — hvězda, sněhová vločka, konstelace faktů (viz [[schemata-skladu]]).

---

*Zdroj: PIS přednáška 8, prof. Ing. Tomáš Hruška, CSc., FIT VUT v Brně. Externí reference: Codd, E.F.: *Providing OLAP to User-Analysts* (Hyperion 1993); [Microsoft SSAS — storage modes](https://learn.microsoft.com/en-us/analysis-services/multidimensional-models/partitions/partition-storage-modes-and-processing); [Snowflake architecture](https://docs.snowflake.com/en/user-guide/intro-key-concepts); [DuckDB documentation](https://duckdb.org/docs/).*
