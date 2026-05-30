---
title: Raft a praktické aplikace konsensu
---

# Raft — srozumitelný konsensus + aplikace v praxi

Předchozí kapitoly probraly **Paxos** ([[paxos]]) a **Byzantine** konsensus ([[byzantium]]) — *teoreticky* základní algoritmy. **Paxos je notoricky obtížný** na pochopení a implementaci. **Raft** (Diego Ongaro, John Ousterhout, USENIX ATC 2014) byl navržen explicitně jako *srozumitelnější* alternativa pro **crash-stop** systémy. Tato kapitola probírá Raft, jeho rozdíly oproti Paxosu, a *praktické aplikace* konsensu — cloud storage, distribuovaný DBMS, blockchain.

## Motivace Raft

> *„Paxos je notoricky obtížný; uspořádali jsme dva roční semináře pro doktorandy v Stanfordu, ale jen málokdo ho úplně pochopil."* — Ongaro, Ousterhout

Raft byl navržen s explicitním cílem **„understandability first"**. Stejně silný jako Paxos (provably ekvivalentní), ale *strukturovaný* tak, aby ho lidé pochopili.

## Tři role v Raftu

V každém okamžiku každý uzel má *přesně jednu* roli:

- **Leader** — jediný uzel, který přijímá *klientské* požadavky a iniciuje *replikaci* logu.
- **Follower** — pasivní uzel, který *přijímá* zprávy od leadera (heartbeats, log entries).
- **Candidate** — uzel, který *kandiduje* na nového leadera.

::: svg "Raft role — stavy uzlů a přechody"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <ellipse cx="120" cy="100" rx="60" ry="30"/>
    <ellipse cx="270" cy="100" rx="60" ry="30"/>
    <ellipse cx="420" cy="100" rx="60" ry="30"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="120" y="104">Follower</text>
    <text x="270" y="104">Candidate</text>
    <text x="420" y="104">Leader</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1" fill="none" marker-end="url(#raftar)">
    <line x1="180" y1="92" x2="210" y2="92"/>
    <line x1="330" y1="92" x2="360" y2="92"/>
    <line x1="360" y1="115" x2="180" y2="115"/>
    <line x1="210" y1="120" x2="180" y2="120"/>
  </g>
  <defs>
    <marker id="raftar" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="195" y="88" fill="var(--accent)" font-size="9">timeout</text>
  <text x="345" y="88" fill="var(--accent)" font-size="9">majority votes</text>
  <text x="270" y="135" fill="var(--accent)" text-anchor="middle" font-size="9">new term / fail</text>
  <text x="195" y="135" fill="var(--accent)" font-size="9">higher term</text>
</svg>
:::

## Dva subproblémy

Raft rozdělí konsensus na **dva** nezávislé subproblémy:

1. **Leader Election** — výběr leadera.
2. **Log Replication** — leader replikuje *log* operací na ostatní.

Plus *Safety* vlastnosti — invarianty, které zaručují korektnost.

## Leader Election

### Term — logické období

Každý uzel sleduje **term** — monotónně rostoucí číslo. Term = analog *epochy* z Paxosu (viz [[failure-modely]]).

- Term se zvyšuje při *každém* startu volby.
- Každý term má *nejvýše jednoho* leadera.
- Uzly *odmítají* zprávy s nižším termem.

### Volební protokol

```
Follower čeká na heartbeat od leadera.
Pokud neslyší heartbeat za "election timeout" (random 150-300 ms):
  follower → candidate
  Zvýší svůj term: currentTerm += 1
  Vote pro sebe
  Pošle RequestVote(term, candidateId, lastLogIndex, lastLogTerm) všem ostatním
  Čeká na odpovědi

Příjemce RequestVote(term, ...):
  Pokud term > currentTerm: aktualizuj term, hlasuj pro
  Jinak: zahodí

Candidate získá majoritu hlasů → stává se leaderem
Candidate dostane heartbeat s vyšším termem → stává se followerem
Election timeout znovu → nová volba s vyšším termem
```

### Randomizovaný timeout

Klíčový trik: každý follower má **random** election timeout (150-300 ms). Tím se *zabraní* synchronní *split-vote* (více kandidátů současně). Pravděpodobnost, že proběhne *více* simultánních voleb je *velmi nízká*.

## Log Replication

Leader přijímá *klientské* požadavky (commands) a replikuje je do *logu* všech followerů.

### Log entry

```
Entry: (term, index, command)
```

Index je *pořadí* v logu. Term je term, ve kterém entry byla vytvořena.

### Algoritmus

```
Leader přijme command od klienta:
  1. Append entry (currentTerm, nextIndex, command) do svého logu
  2. Pošle AppendEntries(term, prevLogIndex, prevLogTerm, entries[], leaderCommit) followerům
  3. Pokud majority potvrdí: commit entry (commitIndex += 1)
  4. Aplikuje entry na svůj state machine
  5. Odpoví klientovi

Follower přijme AppendEntries:
  1. Pokud term < currentTerm: zahodí
  2. Pokud prevLogIndex/prevLogTerm nesedí s mým logem: zahodí (Leader retry s nižší prevLogIndex)
  3. Append entries do svého logu (může přepsat konfliktní)
  4. Pokud leaderCommit > my commitIndex: aplikuj nově committed entries
  5. Odpoví ACK leaderu
```

### Vlastnosti

- **Leader append-only**: leader *nikdy* nemění svůj log, jen přidává.
- **Log matching**: pokud dva logy mají entry se stejným (term, index), *všechny* předchozí entries jsou *identické*.
- **Leader completeness**: pokud entry byla *commitnuta* v term $T$, *bude* v logu *všech* budoucích leaderů (v termech $> T$).

::: viz raft-praxe "Vyber scénář (čistá replikace nebo + pád leadera) a krokuj. U každého uzlu vidíš state (F/C/L), term, votedFor, log, commitIndex. Sleduj, co se stane s necommitnutou entry y=2, když leader padne."
:::

## Safety — kritické invarianty

### Election restriction

Když candidate žádá o hlas, follower hlasuje *jen* pokud *candidate's log je aspoň tak nový* jako follower's log. To zaručuje, že *nový* leader má všechny *committed* entries.

**Pravidlo "as up-to-date as"**:

- Pokud `lastLogTerm_candidate > lastLogTerm_follower`: candidate nový.
- Pokud `lastLogTerm_candidate == lastLogTerm_follower AND lastLogIndex_candidate >= lastLogIndex_follower`: candidate nový.
- Jinak: follower nesouhlasí.

### State machine safety

Pokud server *aplikoval* entry s indexem $i$ a hodnotou $v$, *žádný* server nikdy neaplikuje *jinou* hodnotu pro index $i$.

## Cluster membership změny

Raft přidá uzly do clusteru přes **joint consensus**:

1. Leader navrhne *přechodovou konfiguraci* $C_{\text{old},\text{new}}$ (oba členy).
2. Rozhodnutí vyžaduje *majority obou* (old a new).
3. Po commitnutí $C_{\text{old},\text{new}}$ se navrhne $C_{\text{new}}$ (jen nová).

Tím se *bezpečně* přechází bez dvouhlavého clusteru (split-brain).

## Raft vs Paxos

| Aspekt | Paxos | Raft |
| :--- | :--- | :--- |
| Srozumitelnost | obtížný | navržen pro pochopení |
| Leader | volitelný (Multi-Paxos) | povinný |
| Log | implicitní | explicitní s pravidly |
| Volba | flexibilní | pevný protokol |
| Education | desítky článků | jeden článek + diagrams |

V praxi Raft *prudce vytlačil* Paxos — moderní systémy (etcd, Consul, CockroachDB, TiDB) používají Raft.

## Praktické aplikace konsensu

### Cloud storage a koordinace

- **Apache ZooKeeper** (Hadoop) — distribuovaná koordinační služba. Vlastní *Zab* protokol (podobný Raftu).
- **etcd** (Kubernetes) — distribuovaná key-value store. Raft. *Kritické* pro Kubernetes (uloží *všechen* state cluster).
- **Consul** (HashiCorp) — service discovery + KV store. Raft.

### Distribuované databáze

- **Google Spanner** — Multi-Paxos pro replikaci tabletů.
- **CockroachDB** — Raft pro každý "range" (default ~512 MiB range; historicky 64 MiB).
- **TiDB** — Raft (TiKV storage layer).
- **MongoDB replica sets** — Raft-inspirovaný protokol pro election.

### Blockchain a kryptoměny

- **Bitcoin** — *Proof of Work*. Implicitní Byzantine konsensus.
- **Ethereum 2.0** — *Casper FFG* (PBFT-inspired) + chain.
- **Hyperledger Fabric** — pluggable, často **PBFT** nebo **Raft** pro permissioned.
- **Diem** (původně Facebook Libra) — **HotStuff** (linear Byzantine).
- **Algorand, Tendermint** — Byzantine consensus s velkým $n$.

### Replikované databáze (master-slave)

- **PostgreSQL streaming replication** — *eventual* consistency. Failover přes externí Raft (Patroni).
- **MySQL Group Replication** — multi-master s Paxos-like protocol.

## CAP teorém — kompromisy

**Eric Brewer (PODC 2000)**: distribuovaný systém může garantovat jen *2 ze 3*:

- **C**onsistency — všichni vidí stejná data.
- **A**vailability — každý dotaz dostane odpověď (úspěch nebo chyba).
- **P**artition tolerance — systém funguje i při rozdělení sítě.

**Network partitions jsou nevyhnutelné** → musíme volit mezi **C** a **A**:

- **CP systémy** (konsensus-based): Spanner, etcd, ZooKeeper. *Konzistentní*, ale nedostupné při partition.
- **AP systémy**: Cassandra, DynamoDB. *Dostupné*, ale *eventual* consistency.

## Eventual consistency vs strong consistency

- **Strong (linearizable)**: každý read vidí nejnovější write. Vyžaduje konsensus → drahá.
- **Eventual**: replikační konflikty se *eventuálně* resolvují. Levné, ale aplikace musí *řešit* conflicts (CRDTs, last-write-wins).

Většina moderních systémů poskytuje *konfigurovatelný* trade-off (Cassandra: ONE / QUORUM / ALL).

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Ongaro, D., Ousterhout, J.: „In Search of an Understandable Consensus Algorithm" (USENIX ATC 2014, [PDF](https://raft.github.io/raft.pdf)) — Raft paper; Ongaro, D.: *Consensus: Bridging Theory and Practice* (Ph.D. thesis, Stanford 2014, [PDF](https://github.com/ongardie/dissertation)); Brewer, E.A.: „Towards Robust Distributed Systems" (PODC 2000) — CAP teorém; Burrows, M.: „The Chubby lock service for loosely-coupled distributed systems" (OSDI 2006, [DOI 10.5555/1298455.1298487](https://doi.org/10.5555/1298455.1298487)); Junqueira, F.P., Reed, B.C., Serafini, M.: „Zab: High-performance broadcast for primary-backup systems" (DSN 2011) — ZooKeeper; Corbett, J.C. et al.: „Spanner: Google's globally distributed database" (OSDI 2012); CoreOS etcd ([docs](https://etcd.io/docs/)); Kleppmann, M.: *Designing Data-Intensive Applications* (O'Reilly 2017) — pragmatický průvodce.*
