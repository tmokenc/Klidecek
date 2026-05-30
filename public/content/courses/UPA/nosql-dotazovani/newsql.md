---
title: NewSQL — ACID nad distribuovaným úložištěm
---

# NewSQL — ACID nad distribuovaným úložištěm

**NewSQL** je třída databází vzniklá kolem 2011, která se snaží *kombinovat* tradiční vlastnosti relačních DB (SQL, ACID, transakce) s výhodami NoSQL (horizontální škálování, vysoká dostupnost). Reprezentanti: **Google Spanner**, **CockroachDB**, **TiDB**, **MemSQL/SingleStore**, **VoltDB**, **NuoDB**, **YugabyteDB**, **FaunaDB**. NewSQL je atraktivní pro aplikace, které potřebují *silnou konzistenci* (bankovnictví, e-commerce checkout, leaderboard) ale zároveň *škálovatelnost* (globální uživatelé, miliardy řádků).

## Motivace — co NewSQL řeší

Klasický RDBMS:
* ACID transakce — ✓
* SQL — ✓
* Horizontální škálování — ✗ (omezené)
* Geografická distribuce — ✗ (jen master-slave repliky)

Klasický NoSQL:
* ACID transakce — ✗ (jen per-partition v Cassandra)
* SQL — ✗ (vlastní DSL)
* Horizontální škálování — ✓ (linearní)
* Geografická distribuce — ✓ (multi-DC, eventual consistency)

NewSQL chce *všechno* — SQL + ACID + horizontální škálování + geo-distribuce. To je možné jen díky pokroku v algoritmech (Paxos, Raft pro konsenzus) a HW (atomic clocks v Spanneru, NVMe SSD pro latenci).

## Klíčové vlastnosti NewSQL

1. **SQL kompatibilita** — typicky podporuje subset ANSI SQL (PostgreSQL wire protocol, MySQL protocol). Klient nemusí měnit aplikační kód.
2. **ACID transakce** — *multi-row, multi-shard, multi-DC* — silná konzistence (linearizovatelnost, serializovatelnost).
3. **Automatic sharding** — DB sama rozdělí data na shardy podle range nebo hash, automaticky rebalanceuje.
4. **Konsenzus protokoly** — Paxos (Spanner), Raft (CockroachDB, TiDB) zajišťují konzistenci napříč replikami.
5. **Vysoká dostupnost** — automatický failover (uvnitř shardu) přes raft leader election.

## Volba: CP nebo PC/EC v CAP

NewSQL obvykle volí **CP** v CAP teorému ([[cap-teorem]]) a **PC/EC** v PACELC. To znamená:
* Při rozdělení sítě (rare events) NewSQL obětuje *dostupnost* aby zachoval konzistenci.
* Bez rozdělení síťě NewSQL drží silnou konzistenci i za cenu vyšší latence (kontrast s Cassandra/Dynamo, které volí latenci).

Tato volba je vhodná pro aplikace, kde *nekonzistence by ohrozila integritu* — finanční převody, sklady, rezervace.

## Synchronní replikace přes Raft / Paxos

NewSQL replikuje data *synchronně* — zápis je *potvrzen klientovi* až po replikaci na *většinu* (quorum) replik. Typicky 3 nebo 5 replik na shard.

::: svg "Raft replikace v NewSQL: klient zapíše na leader, ten propaguje zápis na followery, čeká na ACK od většiny, pak potvrdí klientovi."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="20" y="80" width="80" height="40" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="60" y="100" text-anchor="middle" fill="var(--text)" font-weight="600">Klient</text>
    <text x="60" y="115" text-anchor="middle" fill="var(--text-muted)" font-size="9">WRITE x=5</text>
  </g>
  <line x1="100" y1="100" x2="170" y2="100" stroke="var(--accent)" marker-end="url(#ns-arr)"/>
  <text x="135" y="92" text-anchor="middle" fill="var(--text-muted)" font-size="9">1. write</text>
  <g>
    <rect x="170" y="80" width="120" height="40" fill="var(--accent)" stroke="var(--accent)" stroke-width="2" rx="6"/>
    <text x="230" y="100" text-anchor="middle" fill="white" font-weight="600">Leader</text>
    <text x="230" y="115" text-anchor="middle" fill="white" font-size="9">propaguje na qrm</text>
  </g>
  <line x1="290" y1="95" x2="370" y2="50" stroke="var(--accent)" stroke-dasharray="2 2" marker-end="url(#ns-arr)"/>
  <line x1="290" y1="105" x2="370" y2="150" stroke="var(--accent)" stroke-dasharray="2 2" marker-end="url(#ns-arr)"/>
  <text x="330" y="65" text-anchor="middle" fill="var(--text-muted)" font-size="9">2. replicate</text>
  <g>
    <rect x="370" y="30" width="100" height="40" fill="var(--bg-card)" stroke="var(--accent-line)" rx="6"/>
    <text x="420" y="50" text-anchor="middle" fill="var(--text)">Follower 1</text>
    <text x="420" y="64" text-anchor="middle" fill="var(--accent)" font-size="9">ACK ✓</text>
  </g>
  <g>
    <rect x="370" y="130" width="100" height="40" fill="var(--bg-card)" stroke="var(--accent-line)" rx="6"/>
    <text x="420" y="150" text-anchor="middle" fill="var(--text)">Follower 2</text>
    <text x="420" y="164" text-anchor="middle" fill="var(--accent)" font-size="9">ACK ✓</text>
  </g>
  <line x1="170" y1="120" x2="100" y2="120" stroke="var(--accent)" marker-end="url(#ns-arr)"/>
  <text x="135" y="138" text-anchor="middle" fill="var(--text-muted)" font-size="9">3. commit (quorum 2/3)</text>
  <defs>
    <marker id="ns-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

Synchronní replikace zaručí *durability* — i pokud leader spadne, alespoň jeden follower má data a stane se novým leaderem (raft election).

::: viz raft-leader-election "5 uzlů, klikněte „start election" / „× kill leader" — sledujte zvyšování term, hlasování s majoritou (3/5), heartbeats z nového leadera."
:::

## MemSQL / SingleStore — hybrid row & column store

**MemSQL** (přejmenováno na SingleStore 2020) je *in-memory* NewSQL DB s podporou OLTP i OLAP v jednom. Architektura:

* **Aggregators** — front-end uzly přijímající SQL od klientů, parsují, distribuují.
* **Leaves** — backend uzly s daty (in-memory row store nebo column store na disku).
* **Shard key** — určuje, na kterém leaf je řádek (hash partitioning).

### MemSQL Insert / Select

Insert je *přímý* — aggregator vypočte hash shard key, pošle INSERT na příslušný leaf.

```sql
INSERT INTO orders VALUES (12345, ...);
   -- agg vypočte hash(12345) → leaf 3
   -- INSERT do leaf 3 jen
```

Select je *fanout* — agg posílá dotaz na *všechny* leaves, ty zpracují svou část paralelně, vrátí výsledek, agg ho composuje.

```sql
SELECT count(1) FROM orders;
   -- agg posílá leaf1, leaf2, leaf3, leaf4
   -- každý vrátí svůj lokální count
   -- agg sečte
```

### MemSQL MVCC

Každý zápis vytváří *novou verzi* řádku. Staré verze jsou *garbage-collected*. Čtení nikdy neblokují — vidí svůj snapshot. Zápisy mají row-level zámky. Toto umožňuje **online ALTER TABLE** (změna schématu bez downtime).

### MemSQL Durability

Tranzakce má dvě fáze:
1. **In-memory commit** — zápis je zapsán do paměti aggregátoru + leaf. Klient dostane potvrzení.
2. **Group commit** — po určité době (nebo objemu transakcí) se *batch* tranzakcí persistuje na disk.

Cena: drobné riziko ztráty *posledních* tranzakcí v případě pádu HW (kompenzováno replikací). Výhoda: výrazně vyšší propustnost (10×–100× vs. synchronní fsync per transakce).

## CockroachDB

Otevřená NewSQL inspirovaná Spannerem. Klíčové vlastnosti:

* **Multi-region cluster** — repliky napříč datacentry, geo-aware placement.
* **SQL** — PostgreSQL kompatibilní wire protocol.
* **Distribuované transakce** — přes serializable snapshot isolation, two-phase commit + Raft.
* **Time-travel queries** — `SELECT * FROM x AS OF SYSTEM TIME '-10s'` — čtení historie.

```sql
-- vytvoření multi-region tabulky
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email STRING UNIQUE,
  region STRING NOT NULL
) LOCALITY REGIONAL BY ROW AS region;

-- transakce přes 2 řádky v 2 různých regionech
BEGIN;
UPDATE users SET balance = balance - 100 WHERE id = '...';
UPDATE users SET balance = balance + 100 WHERE id = '...';
COMMIT;
   -- distributed transaction přes 2-PC + Raft
```

## Spanner / Cloud Spanner

Google Spanner (2012) je *prototypem* NewSQL. Globálně distribuovaná, silně konzistentní, externí konsistence díky **TrueTime API** (atomic clocks + GPS v každém DC). Cloud Spanner je managed verze na Google Cloud.

Spanner garantuje *externí konsistenci* — pokud transakce T1 commitne před T2, T1 dostane *nižší timestamp* než T2. Toho dosáhne pomocí "commit wait" — čeká, dokud uncertainty interval TrueTime nepřejde.

## Když použít NewSQL

* **Globální aplikace** s ACID — bankovní systémy, e-commerce s rezervacemi přes regiony.
* **Migrace z RDBMS** — kde se nechce přepsat SQL kód, ale potřebuje větší škálování.
* **Mixed OLTP/OLAP** — MemSQL/SingleStore pro real-time analytics nad živou OLTP daty.

## Kdy NewSQL NENÍ vhodný

* **Read-heavy aplikace** — klasický RDBMS s read replikami zvládne.
* **Write-heavy bez ACID** — Cassandra je rychlejší pro telemetrii.
* **Velmi rozsáhlá data** (PB+) — datové sklady (Snowflake, BigQuery) jsou efektivnější pro analytiku.
* **Embedded scénáře** — NewSQL vyžaduje cluster minimálně 3 uzlů.

## Porovnání

| | RDBMS | NoSQL (BASE) | NewSQL |
| :--- | :---: | :---: | :---: |
| SQL | ✓ | ✗ | ✓ |
| ACID | ✓ | omezené | ✓ |
| Horizontální škálování | omezené | ✓ | ✓ |
| Konsenzus | – | – | Raft/Paxos |
| Geo-distribuce | master-slave | ✓ | ✓ |
| Latence | nízká | nízká | vyšší (sync replication) |
| Reprezentant | PostgreSQL | Cassandra | Spanner, CockroachDB |

## Trend

NewSQL je stále *menšinová* kategorie — relační DB s extensions (PostgreSQL + Citus, MySQL + Vitess) a managed cloud services (AWS Aurora, Azure Cosmos DB) řeší většinu use cases. Ale pro *globally distributed mission-critical* systémy je NewSQL standardní volbou — Google používá Spanner pro AdWords, Cloud Spanner roste komerčně, CockroachDB nasazují finanční instituce.

::: link "Corbett, J. C. et al.: Spanner — Google's Globally Distributed Database (OSDI 2012)" "https://research.google/pubs/pub39966/"
:::

::: link "CockroachDB documentation" "https://www.cockroachlabs.com/docs/"
:::

::: link "Stonebraker, M.: New SQL — An Alternative to NoSQL and Old SQL for New OLTP Apps (CACM 2012)" "https://cacm.acm.org/blogs/blog-cacm/109710-new-sql-an-alternative-to-nosql-and-old-sql-for-new-oltp-apps/fulltext"
:::

---

*Zdroj: UPA přednáška *NoSQL Databases 2* (Rychlý, 30. září 2025). Externí reference: Corbett, J. C. et al.: *Spanner — Google's Globally Distributed Database*, OSDI 2012; Pavlo, A., Aslett, M.: *What's Really New with NewSQL?*, SIGMOD Record 2016; Stonebraker, M., Cattell, R.: *10 Rules for Scalable Performance in Simple Operation Datastores*, CACM 2011.*
