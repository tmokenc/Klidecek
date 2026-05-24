---
title: CAP teorém — Consistency, Availability, Partition tolerance
---

# CAP teorém — Consistency, Availability, Partition tolerance

**CAP teorém** (Brewer 2000, formálně dokázán Lynch a Gilbert 2002) je fundamentálním omezením distribuovaných systémů. Říká: v distribuovaném úložišti dat lze v daný okamžik garantovat *nejvýše dvě* ze tří vlastností — konzistenci, dostupnost a odolnost proti rozdělení sítě. Vzhledem k tomu, že rozdělení sítě (network partition) v reálném internetu *nastává nevyhnutelně*, je volba prakticky mezi **konzistencí (CP)** a **dostupností (AP)**. Pochopení tohoto trade-off je klíčové pro návrh moderních distribuovaných systémů.

## Tři vlastnosti

* **C**onsistency (konzistence) — všechny uzly *v každém okamžiku* vidí stejná data. Tj. po každé operaci `write(x, v)` všechna následující `read(x)` vrátí `v` (nebo novější hodnotu). Pozn.: toto je *linearizovatelnost*, ne ACID Consistency!
* **A**vailability (dostupnost) — *každý* požadavek na non-failed uzel obdrží odpověď v rozumném čase, ať už úspěšnou nebo neúspěšnou. Žádný request se "nezasekne" čekáním na nedostupnou repliku.
* **P**artition tolerance (odolnost vůči rozdělení) — systém pokračuje v provozu, i když některé zprávy mezi uzly se ztratí nebo zpozdí (síťové rozdělení).

## Teorém: výběr dvou ze tří

::: svg "CAP triangle: tři kategorie systémů — CA (silně konzistentní, dostupné, ale ne odolné na partitions), CP (konzistentní, odolné, ale obětuje dostupnost při split), AP (dostupné, odolné, ale eventuálně konzistentní)."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="12">
  <g>
    <polygon points="270,40 80,180 460,180" fill="none" stroke="var(--line)" stroke-width="1.5"/>
    <text x="270" y="35" text-anchor="middle" fill="var(--accent)" font-weight="700" font-size="14">C</text>
    <text x="68" y="195" text-anchor="middle" fill="var(--accent)" font-weight="700" font-size="14">A</text>
    <text x="472" y="195" text-anchor="middle" fill="var(--accent)" font-weight="700" font-size="14">P</text>
    <text x="270" y="22" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">Consistency</text>
    <text x="58" y="207" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">Availability</text>
    <text x="482" y="207" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">Partition tolerance</text>
  </g>
  <g>
    <ellipse cx="190" cy="118" rx="60" ry="35" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5" opacity="0.7"/>
    <text x="190" y="115" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="11">CA</text>
    <text x="190" y="130" text-anchor="middle" fill="var(--text-muted)" font-size="9">RDBMS clustery</text>
    <text x="190" y="143" text-anchor="middle" fill="var(--text-muted)" font-size="9">LDAP</text>
  </g>
  <g>
    <ellipse cx="350" cy="118" rx="60" ry="35" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5" opacity="0.7"/>
    <text x="350" y="115" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="11">CP</text>
    <text x="350" y="130" text-anchor="middle" fill="var(--text-muted)" font-size="9">HBase, MongoDB</text>
    <text x="350" y="143" text-anchor="middle" fill="var(--text-muted)" font-size="9">Spanner, etcd</text>
  </g>
  <g>
    <ellipse cx="270" cy="165" rx="65" ry="30" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5" opacity="0.7"/>
    <text x="270" y="166" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="11">AP</text>
    <text x="270" y="180" text-anchor="middle" fill="var(--text-muted)" font-size="9">Cassandra, DynamoDB</text>
  </g>
</svg>
:::

Tři možné kategorie systémů:

### CA — Consistency + Availability (bez Partition tolerance)

Systém je konzistentní a dostupný *pokud* nedojde k rozdělení sítě. Pokud rozdělení nastane, systém selhává (žádný uzel nemůže rozhodnout, jak postupovat). Příklady:

* Single-node RDBMS (PostgreSQL, MySQL bez replikace) — *není* opravdu distribuovaný.
* Klasické dvoufázový commit (2PC) na malém clusteru.
* LDAP, xFS file system.

V praxi: v rozsáhlém internetu *rozdělení sítě je nevyhnutelné* (kabel přerušený, router selhal, datacentry oddělené). CA proto v praxi *neexistuje* pro skutečně distribuované systémy — buď je systém centralizovaný (jeden bod selhání), nebo musí zvolit C+P nebo A+P.

### CP — Consistency + Partition tolerance (obětování Availability)

Při rozdělení sítě systém *odmítne* obsloužit požadavky, které by mohly vést k nekonzistenci. Klienti dostávají chyby místo nesprávných dat.

Příklady:
* **HBase / BigTable** — strong consistency přes master node.
* **MongoDB** — od verze 4.0+ s majority writes (předtím spíše AP).
* **Spanner** (Google), **CockroachDB** — globálně silně konzistentní přes Paxos/Raft.
* **etcd**, **ZooKeeper**, **Consul** — coordination services, vyžadují konzistenci pro správnost.

Použití: tam, kde *nekonzistence by ohrozila integritu* — bankovní transakce, distribuovaný zámek, vedoucí volba (leader election).

### AP — Availability + Partition tolerance (obětování Consistency)

Při rozdělení sítě systém *vždy odpoví*, i kdyby s neaktuálními daty. Konzistence se obnoví *eventuálně* (eventual consistency), když síť obnoví spojení.

Příklady:
* **Cassandra** — tunable consistency, defaultně AP s konfiguracemi ONE/ANY.
* **DynamoDB** (Amazon) — write paths s LWW resolution.
* **Riak** — distributed KV store s vector clocks.
* **Couchbase**, **Voldemort** — KV stores.

Použití: kde je *dostupnost* prioritou a aplikace tolerují krátkodobou nekonzistenci — sociální sítě, doporučovací systémy, mezipaměti, IoT telemetrie.

## Kdy partition tolerance NENÍ volitelná

Pokud běžíte na *jednom serveru*, můžete dosáhnout CA — protože nemáte síť mezi replikami. Ale jakmile chcete:

* **Redundanci** pro HA (high availability),
* **Geografickou distribuci** pro latenci,
* **Horizontální škálování** pro propustnost,

musíte mít *více uzlů*, mezi nimiž může selhat síť — a tedy *P je nutná*. Volba pak je *jen* mezi C a A.

## PACELC — Daniel Abadi 2010

Klasický CAP popisuje chování *během* rozdělení sítě. Abadi přidal: co se děje *bez* rozdělení? I tehdy je trade-off mezi *latencí* a *konzistencí*. Vznikl **PACELC**:

> *if Partition, then choose Availability or Consistency, **else** choose Latency or Consistency.*

* **PA/EL** — během partition: dostupnost; jinak: nízká latence (Cassandra, DynamoDB).
* **PC/EC** — během partition: konzistence; jinak: konzistence i za cenu latence (HBase, BigTable, Spanner).
* **PA/EC** — partition: A; jinak: C (MongoDB v některých režimech).
* **PC/EL** — partition: C; jinak: L (málo časté, např. PNUTS).

PACELC lépe vystihuje *praktická* rozhodnutí — neboť rozdělení sítě je vzácné, ale klienti vyžadují nízkou latenci *vždy*.

## Praktické důsledky

* **NoSQL databáze** typicky volí AP (Cassandra) nebo CP (HBase, MongoDB), s laděním per-operation.
* **NewSQL databáze** (Spanner, CockroachDB, FaunaDB) — snaha o konzistenci+dostupnost přes geo-replikované Paxos/Raft. Dosažitelné jen díky speciálnímu HW (atomic clocks v Spanneru) nebo akceptování latence (CRDB).
* **Relační databáze** s replikací (PostgreSQL streaming repl., MySQL group replication) jsou typicky CP (master-slave) — primární přijímá zápisy, pokud failover trvá déle než časový limit, systém je nedostupný.

::: viz cap-partition-sim "Spusťte network partition: CP zamítá zápisy na izolovaný uzel (žádné stale data), AP přijímá lokálně (vysoká dostupnost, divergence řešená při heal)."
:::

## CAP je často nepochopen

Tři běžné mýty:

1. *"Můžu si vybrat 2 ze 3 nazávisle"* — nelze. P je v praxi *nezbytná*, takže volba je *binární* (C nebo A).
2. *"AP systémy nemají konzistenci vůbec"* — AP systémy mají *eventual* consistency, ne *žádnou*. Také mohou mít *causal* nebo *read-your-writes* konzistenci.
3. *"NoSQL = BASE = AP"* — někde ano (Cassandra), ale např. HBase a MongoDB jsou CP. Nelze předpokládat.

## Důsledky pro vývojáře

Při návrhu distribuovaného systému je nutné se ptát:

1. **Toleruje aplikace dočasnou nekonzistenci?** Ano → AP. Ne → CP nebo single-server.
2. **Co se stane, když uživatel uvidí dočasně staré data?** Pokud to ohrozí business → CP.
3. **Jakou latenci očekáváme?** Sub-milisekundovou → PA/EL.
4. **Jaká je odhadovaná pravděpodobnost partition v naší infrastruktuře?** Vyšší (multi-region) → musí být robustní řešení obou cest.

Více o specifické filozofii [[acid-base]]; konkrétní implementace v [[nosql-priklady]].

::: link "Brewer, E. A.: CAP twelve years later — How the rules have changed (IEEE 2012)" "https://www.researchgate.net/publication/254008794_CAP_Twelve_Years_Later_How_the_Rules_Have_Changed"
:::

::: link "Gilbert, S., Lynch, N.: Brewer's Conjecture and the Feasibility of CAP (ACM SIGACT News 2002)" "https://dl.acm.org/doi/10.1145/564585.564601"
:::

::: link "Abadi, D.: Consistency Tradeoffs in Modern Distributed Database System Design — CAP is Only Part of the Story" "https://cs-www.cs.yale.edu/homes/dna/papers/abadi-pacelc.pdf"
:::

---

*Zdroj: UPA přednáška *NoSQL databáze* (Rychlý, 23. září 2025). Externí reference: Brewer, E. A.: *Towards Robust Distributed Systems*, PODC 2000; Gilbert, S., Lynch, N.: *Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services*, SIGACT News 2002; Brewer, E. A.: *CAP Twelve Years Later — How the Rules Have Changed*, IEEE Computer 2012; Abadi, D.: *Consistency Tradeoffs in Modern Distributed Database System Design — CAP is Only Part of the Story*, IEEE Computer 2012.*
