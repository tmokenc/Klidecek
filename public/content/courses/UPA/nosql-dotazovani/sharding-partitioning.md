---
title: Partitioning a sharding — horizontální škálování dat
---

# Partitioning a sharding — horizontální škálování dat

V distribuovaných databázích jsou data fyzicky rozložena na *mnoha uzlech* (často desítkách až stovkách). **Partitioning** je obecný termín pro rozdělení dat; **sharding** je konkrétní strategie horizontálního rozdělení podle klíče. Cílem je *paralelizace* operací a *kapacita* (jeden uzel by data fyzicky nezvládl). Volba *shard key* je kritická — špatná volba způsobí hotspots (jeden uzel je zatížen, ostatní spí) nebo neefektivní cross-shard dotazy. Pochopení strategií sharding je klíčové pro správný návrh schématu v Cassandra, MongoDB, DynamoDB a dalších distribuovaných úložištích.

## Dva směry dělení dat

### Vertikální partitioning

Tabulka se rozdělí podle *sloupců*. Některé sloupce na uzlu A, jiné na uzlu B. Příklad: rozhodnutí mezi tabulkami `Person_Profile` (jméno, věk, email) a `Person_Stats` (last_login, view_count) může být chápáno jako vertikální partitioning.

V NoSQL se vertikální partitioning realizuje implicitně přes *column families* (Cassandra, HBase) — sloupce stejné family se ukládají společně, různé families mohou být na různých discích/uzlech.

### Horizontální partitioning / sharding

Tabulka se rozdělí podle *řádků*. Některé řádky na uzlu A, jiné na uzlu B. Klíč rozdělení = **shard key** nebo **partition key**.

::: svg "Horizontální sharding podle hash partition key: řádky se rozdělí na uzly podle hash hodnoty klíče. Read/write pro daný klíč jde rovnou na příslušný uzel."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="20" y="20" width="160" height="160" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="100" y="40" text-anchor="middle" fill="var(--text)" font-weight="600">Original tabulka</text>
    <g font-size="9.5" font-family="ui-monospace, monospace">
      <text x="35" y="60" fill="var(--text)">user_id=1, Anna</text>
      <text x="35" y="74" fill="var(--text)">user_id=2, Bob</text>
      <text x="35" y="88" fill="var(--text)">user_id=3, Carol</text>
      <text x="35" y="102" fill="var(--text)">user_id=4, Dave</text>
      <text x="35" y="116" fill="var(--text)">user_id=5, Eve</text>
      <text x="35" y="130" fill="var(--text)">user_id=6, Fay</text>
      <text x="35" y="144" fill="var(--text-muted)">…</text>
    </g>
  </g>
  <text x="200" y="105" fill="var(--accent)" font-size="16">→</text>
  <text x="200" y="125" fill="var(--text-muted)" font-size="9.5">hash(user_id)</text>
  <text x="200" y="138" fill="var(--text-muted)" font-size="9.5">mod 3</text>
  <g>
    <rect x="240" y="20" width="90" height="160" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="285" y="40" text-anchor="middle" fill="var(--text)" font-weight="600">Shard 0</text>
    <g font-size="9.5" font-family="ui-monospace, monospace">
      <text x="250" y="62" fill="var(--text)">1, Anna</text>
      <text x="250" y="78" fill="var(--text)">4, Dave</text>
    </g>
  </g>
  <g>
    <rect x="340" y="20" width="90" height="160" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="385" y="40" text-anchor="middle" fill="var(--text)" font-weight="600">Shard 1</text>
    <g font-size="9.5" font-family="ui-monospace, monospace">
      <text x="350" y="62" fill="var(--text)">2, Bob</text>
      <text x="350" y="78" fill="var(--text)">5, Eve</text>
    </g>
  </g>
  <g>
    <rect x="440" y="20" width="90" height="160" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="485" y="40" text-anchor="middle" fill="var(--text)" font-weight="600">Shard 2</text>
    <g font-size="9.5" font-family="ui-monospace, monospace">
      <text x="450" y="62" fill="var(--text)">3, Carol</text>
      <text x="450" y="78" fill="var(--text)">6, Fay</text>
    </g>
  </g>
</svg>
:::

## Strategie sharding

### Range partitioning (rozsah hodnot)

Data se rozdělí na *spojité intervaly*. Příklad: `user_id 1–999 → shard 0, 1000–1999 → shard 1, …`.

Výhody:
* Range queries (`WHERE user_id BETWEEN 500 AND 1500`) jsou efektivní — sahá se jen na 1–2 shardy.
* Dobré pro time-series (přirozeně chronologické).

Nevýhody:
* **Hotspots** — pokud uživatelé s rostoucím ID jsou aktivnější (typický scénář), poslední shard je přetížen.
* Nutnost manuálního rebalance při neúměrném růstu.

### Hash partitioning (rozdělení podle hash)

`shard = hash(key) mod N`. Data se rozprostřou *rovnoměrně*.

Výhody:
* **Rovnoměrné rozložení** — žádné hotspots.
* Snadné automatické určení uzlu z klíče (klient sám si vypočte).

Nevýhody:
* **Range queries jsou neefektivní** — interval `user_id BETWEEN 500 AND 1500` musí kontaktovat *všechny* shardy.
* Reshardining při změně N je drahý (většina dat se musí přesunout).

### Consistent hashing

Vylepšení hash partitioning, které řeší problém při změně počtu uzlů. Místo `hash mod N` se klíče i uzly mapují na *kruh* (typicky 0..2³²-1). Klíč patří *nejbližšímu uzlu po směru hodinových ručiček*.

Při přidání/odebrání uzlu se přesouvá pouze *zlomek* dat (1/N), ne celá databáze. Používá Cassandra, DynamoDB, Riak.

::: svg "Consistent hashing: klíče i uzly mapovány na kruh. Klíč 'user:42' patří nejbližšímu uzlu po směru — Shard B. Přidáním Shardu E se přesouvá pouze úzký výsek."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <circle cx="270" cy="110" r="90" fill="none" stroke="var(--line)" stroke-width="2"/>
  <g font-size="11">
    <circle cx="270" cy="20" r="6" fill="var(--accent)"/>
    <text x="270" y="14" text-anchor="middle" fill="var(--text)">Shard A</text>
    <circle cx="360" cy="110" r="6" fill="var(--accent)"/>
    <text x="370" y="115" fill="var(--text)">Shard B</text>
    <circle cx="270" cy="200" r="6" fill="var(--accent)"/>
    <text x="270" y="216" text-anchor="middle" fill="var(--text)">Shard C</text>
    <circle cx="180" cy="110" r="6" fill="var(--accent)"/>
    <text x="170" y="115" text-anchor="end" fill="var(--text)">Shard D</text>
  </g>
  <g font-size="10">
    <circle cx="320" cy="50" r="5" fill="var(--accent-line)"/>
    <text x="335" y="45" fill="var(--text-muted)">key user:42</text>
    <line x1="320" y1="55" x2="357" y2="105" stroke="var(--accent-line)" stroke-dasharray="3 3"/>
    <circle cx="225" cy="170" r="5" fill="var(--accent-line)"/>
    <text x="215" y="185" text-anchor="end" fill="var(--text-muted)">key cart:7</text>
    <line x1="225" y1="170" x2="265" y2="198" stroke="var(--accent-line)" stroke-dasharray="3 3"/>
  </g>
  <text x="270" y="115" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">hash ring</text>
</svg>
:::

### Geo / zone-based partitioning

Data se rozdělí podle *geografické lokality* uživatele — EU data v EU datacentru, US v US. Cíl: nízká latence (uživatel kontaktuje nejbližší DC) a *legal compliance* (GDPR — osobní data Evropanů nesmí opustit EU).

MongoDB *zone sharding*, Cassandra *NetworkTopologyStrategy*.

### Composite (compound) key sharding

V Cassandře primary key = `(partition_key, clustering_key)`:

* `partition_key` rozhoduje o uzlu (hash).
* `clustering_key` uspořádává řádky v rámci uzlu (B+ strom).

Tím lze dosáhnout range queries *uvnitř* partition: `SELECT * FROM events WHERE device_id = 'X' AND time > '2025-01-01'` — jeden uzel, B+ tree skenování.

## Pros a cons sharding

| | Výhoda | Nevýhoda |
| :---: | :--- | :--- |
| **+** | větší kapacita (TB → PB) | |
| **+** | větší propustnost (linear scale) | |
| **+** | repliky v rámci shardu (HA) | |
| **−** | | obtížně lze měnit shard key |
| **−** | | drahé cross-shard operace (shuffle, broadcast) |
| **−** | | nemá globální transakce (jen per-partition) |

::: viz consistent-hashing-ring "Klíče i uzly mapovány na hash ring; každý klíč patří prvnímu uzlu po směru hodinových ručiček. Přidání uzlu přesouvá jen ~1/N klíčů (virtual nodes vyhladí zatížení)."
:::

## Antipatterns

### Hotspot keys

Pokud má jedna entita extrémně mnoho operací (např. `userId=0` pro reklamní traffic), všechny operace půjdou na jeden shard.

Řešení: **bucketing** — zavést další pole `bucket = random(0..99)`, klíč = `(userId, bucket)`. Operace se rozloží na 100 partitionů.

### Sequential keys

UUID4 nebo `hash(id)` jsou OK. Ale auto-increment ID (1, 2, 3, …) způsobí, že *nové* zápisy jdou *vždy* na jeden shard (poslední range). Řešení: prefix s hash nebo timestamp shuffle.

### Cross-shard JOIN

NoSQL databáze obecně *nepodporují JOIN přes shardy*. MongoDB `$lookup` má omezení, Cassandra JOIN vůbec nemá. Řešení:

* **Denormalizace** — duplikovat data do více kolekcí.
* **Materialized views** — předpočtené agregáty.
* **Application-side join** — načíst data jednou kolekcí, projít všechny ID, načíst druhou.

### Single-shard transakce vs multi-shard

ACID transakce jsou jednoduché v rámci shardu (lokální locking). Mezi shardy nutno použít *distributed transaction* (2PC, Percolator) — pomalé a křehké. Cassandra úmyslně NEsupportuje, MongoDB od 4.2 podporuje cross-shard transakce s vysokou latencí.

## Příklad — design shard key v Cassandře

Aplikace ukládá IoT data: `(device_id, time, temperature)`. Špatný shard key:

```sql
PRIMARY KEY (time)         -- VŠECHNY zápisy do aktuálního time partition → hotspot
PRIMARY KEY (device_id)    -- jedna partition na zařízení, ale pro 10 let dat → příliš velká
```

Lepší:

```sql
PRIMARY KEY ((device_id, day_bucket), time)
   -- partition = device + den, range query po dni
   -- example: ((dev42, '2025-03-15'), 14:23:51)
```

Tím:
* zápisy rovnoměrné (různé zařízení/dny);
* range query "data zařízení 42 za 15. března" → 1 partition, sekvenční čtení;
* range query "data zařízení 42 za celý měsíc" → 30 partitionů, dále efektivní.

## Sharding v praxi

* **MongoDB** — shard cluster s `mongos` (router), `config servers` (metadata), `mongod` (data nodes). Shard key se nastavuje per kolekci.
* **Cassandra** — automatický sharding přes consistent hashing token ring. Žádný central router.
* **Elasticsearch** — automatický sharding indexů (default 1 primary shard — od Elasticsearch 7.0; dříve 5), replikace per shard.
* **PostgreSQL** — sharding přes Citus (extension) nebo aplikační vrstvu.

Více o roli klíčů v dotazování viz [[dotazovani-nosql]].

::: link "MongoDB sharding documentation" "https://www.mongodb.com/docs/manual/sharding/"
:::

::: link "Karger, D. et al.: Consistent Hashing and Random Trees (STOC 1997)" "https://dl.acm.org/doi/10.1145/258533.258660"
:::

---

*Zdroj: UPA přednáška *NoSQL Databases 2* (Rychlý, 30. září 2025). Externí reference: Karger, D., Lehman, E., Leighton, F., Levine, M., Lewin, D., Panigrahy, R.: *Consistent Hashing and Random Trees*, STOC 1997; DeCandia, G. et al.: *Dynamo — Amazon's Highly Available Key-value Store*, SOSP 2007; Kleppmann, M.: *Designing Data-Intensive Applications*, O'Reilly 2017, kap. 6.*
