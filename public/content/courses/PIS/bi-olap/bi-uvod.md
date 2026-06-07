# Business Intelligence — motivace a definice

Předchozí přednáška ([[process-mining]]) ukázala, jak lze z **event logů** rekonstruovat skutečný průběh procesů. Tato přednáška dělá obdobný krok pro **data**: zatímco operační IS (OLTP) drží *aktuální stav* a každou položku pamatuje jako jeden řádek, **Business Intelligence (BI)** se ptá na *agregované otázky napříč všemi řádky*, často přes roky historie — kolik jsme letos prodali rohlíků v Praze versus loni? Jaké regiony vykazují propad zisku? Tato přednáška se věnuje **infrastruktuře** (datový sklad, OLAP servery), **modelu** (multidimenzionální kostka) a **operacím** (roll-up, drill-down, pivoting, slicing), kterými se taková analýza dělá.

## OLTP — provozní zpracování dat

**OLTP** (*On-Line Transaction Processing*) je svět, který jsme v PIS probírali doposud. Charakteristické rysy:

- *Krátké transakce* — typicky pár vět: INSERT, UPDATE, SELECT podle klíče.
- *Vysoká konkurence* — stovky až tisíce uživatelů paralelně.
- *Aktuální stav* — historie je často omezená (audit log), ale tabulka samotná drží jen *poslední* hodnotu.
- *Normalizace* (3NF) — minimum redundance, optimalizováno pro *zápis*.
- *Provozní rozhodování* — „je tento zákazník v prodlení? Mohu mu vystavit fakturu?"

OLTP odpovídá na *konkrétní otázky o konkrétních záznamech*. Ale nedokáže efektivně odpovídat na otázky typu „jaký je trend prodejů produktu X v regionu Y za posledních 5 let, podle čtvrtletí?". Pro takový dotaz by musel projít miliony řádků faktur — a *pokaždé znovu*, kdykoli někdo zafiltruje jinak.

## Limity OLTP pro analytiku

Konkrétní problém: představte si dotaz *„součet tržeb po měsících za posledních 5 let, rozpadnuté po regionech a produktových řadách"*. Nad operační databází (3NF, normalizovaná, indexovaná pro selektivní hledání):

- SQL plánovač musí joinovat *velké faktové tabulky* s desítkami dimenzí.
- *Žádné předagregované součty* — počítají se na živo přes všechny řádky.
- *Konkurence* — analytický dotaz blokuje OLTP transakce, latence se trhá.

Klasické řešení: **oddělit analytiku do samostatného úložiště** s jinou strukturou, jiným tempem aktualizace a jiným hardware.

## OLAP — analytické zpracování

**OLAP** (*On-Line Analytical Processing*) je protějšek OLTP, designovaný pro analytické dotazy. Charakteristické rysy:

- *Dlouhé read-only dotazy* — typicky desítky sekund nad miliardami řádků.
- *Málo uživatelů* — analytici, manažeři, dashboardy.
- *Historie* — data za roky, často nikdy se nemažou.
- *Denormalizace* — schémata hvězda/sněhová vločka, optimalizováno pro *čtení*.
- *Strategické rozhodování* — „kam expandovat? Které produkty vyřadit?"

## Srovnání OLTP vs OLAP

| Aspekt | OLTP | OLAP |
| :--- | :--- | :--- |
| Účel | Provozní zpracování | Analytické zpracování |
| Dotazy | Krátké, na konkrétní záznamy | Dlouhé, agregované, napříč miliony řádků |
| Schéma | Normalizované (3NF) | Denormalizované (hvězda, sněhová vločka) |
| Aktualizace | Časté zápisy, malé objemy | Periodické dávky (denně/hodinově), velké objemy |
| Historie | Aktuální stav | Roky historie |
| Uživatelé | Stovky–tisíce paralelně | Desítky analytiků |
| Optimalizace | Latence zápisu | Propustnost čtení |

Pozn.: hranice se v posledních letech *rozmazává* — moderní cloud-native enginy jako **Snowflake** nebo **Google BigQuery** zvládají analytické dotazy bez nutnosti vlastního ETL do separátního skladu (*lakehouse* paradigma). Klasické rozdělení OLTP/OLAP ale stále platí jako *koncepční mapa* — a tato přednáška se drží jí.

## Business Intelligence — co to vlastně je

**Business Intelligence** je *zastřešující pojem* pro celou disciplínu:

- *Datový sklad* (data warehouse) — úložiště.
- *ETL* — proces přesunu dat z OLTP do skladu.
- *OLAP* — server, který nad skladem provádí analytické dotazy.
- *Reporting & dashboarding* — vizualizace výstupů.
- *Data mining* — hledání skrytých vzorů (klasifikace, shlukování (clustering), asociace).

> **Definice (Gartner):** Business Intelligence je *strategický nástroj*, který kombinuje aplikace, infrastrukturu a postupy k **přístupu k informacím a analýze dat za účelem zlepšení rozhodování**.

Klíčové slovo je *rozhodování* — BI nemá svou hodnotu v datech samotných, ale v rozhodnutích, která z nich plynou. Když manažer díky drill-down zjistí, že propad zisku přišel z jednoho konkrétního regionu kvůli nové dani, **to je výstup BI**, ne tabulka jako taková.

## Co bude následovat

V dalších sekcích postupně rozebereme:

1. **Datový sklad** ([[datovy-sklad]]) — Inmonova definice, ETL, granularita.
2. **Multidimenzionální kostka** ([[multidimenzionalni-kostka]]) — formální model dat.
3. **Podkostky a svaz** ([[podkostky-svaz]]) — agregační úrovně.
4. **Agregace** ([[agregace]]) — jak se počítají měry.
5. **OLAP architektury** ([[olap-architektury]]) — MOLAP, ROLAP, HOLAP.
6. **Schémata skladu** ([[schemata-skladu]]) — hvězda, sněhová vločka, konstelace.
7. **OLAP operace** ([[olap-operace]]) — roll-up, drill-down, pivoting, slicing.

---

*Zdroj: PIS přednáška 8, prof. Ing. Tomáš Hruška, CSc. a doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: Kimball, R., Ross, M.: *The Data Warehouse Toolkit* (3. vyd., Wiley 2013); Gartner: [Business Intelligence (BI) definice](https://www.gartner.com/en/information-technology/glossary/business-intelligence-bi); Inmon, W.H.: *Building the Data Warehouse* (4. vyd., Wiley 2005).*
