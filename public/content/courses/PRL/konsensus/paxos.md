---
title: Paxos — kanonický algoritmus konsensu
---

# Paxos — algoritmus distribuovaného konsensu

**Paxos** (Leslie Lamport, 1990, publikován 1998) je *kanonický* algoritmus pro distribuovaný konsensus v prostředí s **crash-stop** chybami a **částečně asynchronním** systémem. Je *teoreticky elegantní*, ale *prakticky* notoricky obtížný na pochopení. Tato kapitola probírá *základní jednorázový* Paxos (single-decree): jeho dvoufázový protokol, problém **livelocku**, a *leader-based* variantu, která je *de facto* nasazena v produkčních systémech (ZooKeeper, etcd, Spanner).

## Idea

Klíčové intuice za Paxosem:

- **Kvórum** (majority) = libovolných $\lfloor n/2 \rfloor + 1$ procesů. Dvě libovolná kvóra mají *neprázdný průnik*.
- **Unikátní čísla návrhů** (proposal numbers, $\text{tspr}$) — *monotónně rostou*, žádné dvě nejsou stejné.
- Pokud *kvórum* akceptovalo nějakou hodnotu, *žádný budoucí kvórum* nemůže akceptovat *jinou*.

## Role

- **Proposer** (navrhovatel) — navrhuje hodnoty.
- **Acceptor** (akceptor) — hlasuje pro/proti návrhům.
- **Learner** (učící se) — sleduje, který návrh byl přijat majoritou.

V *praktickém* nasazení každý uzel hraje *všechny tři role* současně.

## Dvoufázový protokol

### Fáze 1 — PREPARE (přípravná)

**Proposer**:

1. Zvolí *unikátní* číslo návrhu $n$ (vyšší než jakékoli dosud použité).
2. Pošle `PREPARE(n)` *aspoň majoritě* procesů.

**Acceptor po obdržení `PREPARE(n)`**:

- Pokud už slíbil účast jinému návrhu s *vyšším* číslem $n' > n$: **ignoruje** nebo pošle *NACK*.
- Pokud je $n$ *dostatečně vysoké*: pošle **`PROMISE(n)`** = „slibuji, že neakceptuji žádný návrh s nižším číslem než $n$".
- Pokud už dříve **akceptoval** návrh `(n_acc, v_acc)`, *přiloží* ho k odpovědi: `PROMISE(n, n_acc, v_acc)`.

### Fáze 2 — ACCEPT (akceptační)

**Proposer po obdržení PROMISE od majority**:

1. Pokud aspoň jeden akceptor přiložil dříve akceptovanou hodnotu `(n_acc, v_acc)`:
   - Použij **hodnotu** $v_acc$ s nejvyšším $n_\text{acc}$ — *„respektuj minulost"*.
2. Jinak použij *vlastní* hodnotu $v$.
3. Pošle `ACCEPT(n, v)` všem akceptorům.

**Acceptor po obdržení `ACCEPT(n, v)`**:

- Pokud mezitím *přislíbil* vyššímu návrhu $n' > n$: zahodí.
- Jinak **uloží** $(n, v)$ a potvrdí proposerovi.

Pokud proposer obdržel potvrzení od *majority*, hodnota $v$ je **rozhodnuta**.

::: svg "Paxos — dvoufázový protokol: PREPARE/PROMISE, ACCEPT/ACCEPTED"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6">
    <line x1="80" y1="40" x2="80" y2="220"/>
    <line x1="220" y1="40" x2="220" y2="220"/>
    <line x1="320" y1="40" x2="320" y2="220"/>
    <line x1="420" y1="40" x2="420" y2="220"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="80" y="32">Proposer</text>
    <text x="220" y="32">Acc 1</text>
    <text x="320" y="32">Acc 2</text>
    <text x="420" y="32">Acc 3</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#pxa)">
    <line x1="90" y1="60" x2="210" y2="70"/>
    <line x1="90" y1="60" x2="310" y2="80"/>
    <line x1="90" y1="60" x2="410" y2="90"/>
  </g>
  <text x="155" y="58" fill="var(--accent)" font-size="9">PREPARE(n)</text>
  <g stroke="var(--accent-line)" stroke-width="1.2" fill="none" marker-end="url(#pxa2)">
    <line x1="210" y1="110" x2="90" y2="120"/>
    <line x1="310" y1="115" x2="90" y2="125"/>
    <line x1="410" y1="120" x2="90" y2="130"/>
  </g>
  <defs>
    <marker id="pxa" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
    <marker id="pxa2" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent-line)"/>
    </marker>
  </defs>
  <text x="155" y="125" fill="var(--accent-line)" font-size="9">PROMISE</text>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#pxa)">
    <line x1="90" y1="150" x2="210" y2="160"/>
    <line x1="90" y1="150" x2="310" y2="170"/>
    <line x1="90" y1="150" x2="410" y2="180"/>
  </g>
  <text x="155" y="148" fill="var(--accent)" font-size="9">ACCEPT(n, v)</text>
  <g stroke="var(--accent-line)" stroke-width="1.2" fill="none" marker-end="url(#pxa2)">
    <line x1="210" y1="200" x2="90" y2="210"/>
    <line x1="310" y1="205" x2="90" y2="215"/>
  </g>
  <text x="155" y="215" fill="var(--accent-line)" font-size="9">ACCEPTED</text>
  <text x="270" y="235" fill="var(--text-muted)" text-anchor="middle" font-size="10">Majority potvrdí → hodnota v rozhodnuta</text>
</svg>
:::

## Důkaz shody (sketch)

**Tvrzení**: pokud kvórum $M$ akceptovalo hodnotu $v$ s číslem $n$, *žádné* budoucí kvórum nemůže akceptovat *jinou* hodnotu.

**Argument**:

- Předpokládejme, že později kvórum $M'$ akceptuje $(n', v')$ s $n' > n$ a $v' \ne v$.
- $M \cap M' \neq \emptyset$ (průnik kvór). Vyber proces $p \in M \cap M'$.
- $p$ má akceptováno $(n, v)$.
- Když proposer s $n'$ posílal `PREPARE(n')`, $p$ poslal `PROMISE(n', n, v)`.
- Proposer *musel* použít $v$ jako svou hodnotu (z fáze 1 pravidlo).
- Tedy $v' = v$. **Spor**.

**Q.E.D.** — konsensus garantován.

## Livelock — slabina základního Paxosu

Pokud *dva (nebo více) proposeři* opakovaně navrhují, mohou se *navzájem blokovat*:

```
Proposer A: PREPARE(1)        → všichni slíbí
Proposer B: PREPARE(2)        → všichni slíbí (vyšší než 1)
Proposer A: ACCEPT(1, v_A)    → ZAHOZENO (slíbeno 2)
Proposer A: PREPARE(3)        → všichni slíbí
Proposer B: ACCEPT(2, v_B)    → ZAHOZENO
Proposer B: PREPARE(4)        → ...
```

Nikdy nedosáhne konsensu — *liveness* selhává. (FLP impossibility v praxi.)

**Řešení**: ustanovit *jediného* proposera = **leader** (viz dále).

## Paxos s leaderem (Multi-Paxos)

V praxi se používá *leader-based* varianta:

- Detector $\Omega$ (viz [[failure-modely]]) označí jediného **leadera**.
- Pouze leader navrhuje hodnoty.
- Konflikty (mezi více proposery) se *vytrácí*.
- Pokud leader selže, *Omega* nominuje nového.

### Pseudokód

```
upon event <leader_detector, NewLeader | p>:
  if p = self:
    role ← leader
    start proposing
  else:
    role ← follower

upon receive REQUEST(v) from client (jen pokud leader):
  n ← next unique proposal number
  send PREPARE(n) to majority
  on majority PROMISE: 
    decide v' = v_acc with highest n_acc (or v if none)
    send ACCEPT(n, v') to majority
  on majority ACCEPTED:
    decided ← v'
    broadcast DECIDED(v') to all
```

### Vlastnosti

- **Safety zachována** i když mám 2 leadry (split-brain) — kvórum vždy vyhraje.
- **Liveness** obnovena, jakmile $\Omega$ stabilizuje na *jednom* leaderovi.
- *Optimalizace*: leader může *přeskočit* fázi 1 pro další návrhy (Multi-Paxos = posloupnost instancí Basic Paxosu — jedna instance na každou položku logu — se sdíleným leaderem).

## Real-world implementace {tier=practice}

- **Google Chubby** (Burrows 2006) — *lockerová* služba s Paxos backendem, používá ji Bigtable.
- **Apache ZooKeeper** — používá *Zab*, ne přímo Paxos, ale podobný princip.
- **etcd** (CoreOS) — *Raft* místo Paxosu (modernější).
- **Microsoft Azure Storage** — Paxos pro replikaci metadat.
- **Google Spanner** — Multi-Paxos pro globálně distribuované transakce.

### Učení z reálného nasazení {tier=practice}

Lamport's papers byly notoricky obtížné na pochopení. **Diego Ongaro** (Raft, 2014) explicitně designoval Raft jako *pochopitelnější* alternativu k Paxosu (viz [[raft-praxe]]). Většina moderních systémů preferuje Raft.

## Multi-Paxos vs Single-Decree Paxos

| Aspekt | Single-Decree | Multi-Paxos |
| :--- | :--- | :--- |
| Rozhoduje o | jediné hodnotě | sekvenci hodnot (replicated log) |
| Použití | teoretická základna | praktická aplikace |
| Optimalizace | žádné | leader skip phase 1 |
| Fáze 1 frequency | každý návrh | jen při výměně leadera |

## Paxos Made Live {tier=practice}

**Chandra, Griesemer, Redstone (PODC 2007)** napsali slavný článek o *praktických* problémech implementace Paxosu:

- Disk failures během protokolu.
- Master leases.
- Group membership changes.
- Snapshotting.
- Performance optimizations.

Reálná implementace Paxosu je *desítky tisíc řádků kódu*. Toto inspirovalo design Raftu.

## Co dál

[[byzantium]] zobecní problém na **Byzantine** failures — procesy mohou *lhát*. Klasický **Byzantine Generals Problem** (Lamport, Shostak, Pease 1982) ukazuje, že konsensus vyžaduje **$n \ge 3m + 1$** procesů pro tolerování $m$ Byzantine procesů. [[raft-praxe]] probere **Raft** — modernější srozumitelnější alternativu, a praktické aplikace ve cloud computing.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Lamport, L.: „The Part-Time Parliament" (ACM TOCS 16(2), 1998, [DOI 10.1145/279227.279229](https://doi.org/10.1145/279227.279229)) — originální Paxos; Lamport, L.: „Paxos Made Simple" (SIGACT News 32(4), 2001, [PDF](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf)) — přístupnější verze; Chandra, T.D., Griesemer, R., Redstone, J.: „Paxos made live" (PODC 2007, [DOI 10.1145/1281100.1281103](https://doi.org/10.1145/1281100.1281103)); Van Renesse, R., Altinbuken, D.: „Paxos Made Moderately Complex" (ACM Computing Surveys 47(3), 2015); Lynch, N.A.: *Distributed Algorithms* (Morgan Kaufmann 1996), kap. 21; Cachin, C., Guerraoui, R., Rodrigues, L.: *Introduction to Reliable and Secure Distributed Programming* (2. vyd., Springer 2011).*
