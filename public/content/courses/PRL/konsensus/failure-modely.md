---
title: Failure modely a FLP impossibility
---

# Failure modely a FLP impossibility

Topic 9 přechází k *nejtěžšímu* problému distribuovaných systémů: **konsensus** — všechny procesy se musí *dohodnout* na *jedné* hodnotě, navzdory poruchám. Před konkrétními algoritmy ([[paxos]], [[byzantium]], [[raft-praxe]]) je nutné pochopit *failure modely* (jak procesy selhávají), *modely systémů* (synchronní vs asynchronní) a *fundamentální omezení* — slavnou **FLP impossibility** větu (Fischer, Lynch, Paterson 1985), která říká, že **konsensus v asynchronním systému s i jen jednou chybou je nemožný**.

## Problém konsensu

**Definice**: $n$ procesů, každý má *vstupní* hodnotu $v_i$. Cílem je, aby se *všechny korektní* procesy *dohodly* na jedné *společné* hodnotě.

**Vlastnosti**:

- **Agreement (shoda)**: žádné dva korektní procesy nesouhlasí s různými hodnotami.
- **Validity (platnost)**: pokud všichni začnou s *touž* hodnotou $v$, rozhodnutí *musí* být $v$.
- **Integrity (integrita)**: žádný proces nerozhodne *víc než jednou*.
- **Termination (ukončení)**: každý korektní proces *nakonec rozhodne*.

První tři jsou **safety** vlastnosti (nic špatného se nemůže stát). Termination je **liveness** (něco dobrého se nakonec stane).

## Modely systémů

### Asynchronní systém

- **Žádná horní mez** $\Delta$ na doručení zprávy.
- Procesy mohou pracovat *libovolně pomalu*.
- *Standardní model* pro internet, cloud, většinu praktických aplikací.
- Zprávy se mohou *předbíhat*, *ztrácet* nebo být *duplikovány*.

### Synchronní systém

- **Existuje horní mez** $\Delta$ na doručení zprávy.
- Hodiny procesů jsou *aproximativně* synchronizované.
- Procesy mají *omezenou* lokální výpočetní rychlost.
- Reálný systém *neexistuje* s těmito vlastnostmi — síť není deterministická.

### Částečně synchronní systém

- *Na počátku* asynchronní, *po čase* se ustálí do synchronního stavu.
- Realistický model pro praktické distribuované systémy (GFS, ZooKeeper).

### Tabulka

| Model | Doručení | Hodiny | Použití |
| :--- | :--- | :--- | :--- |
| Synchronní | $\le \Delta$ | synchronizované | model pro proofs |
| Asynchronní | neomezeně | žádné | matematický limit |
| Částečně synchronní | nakonec $\le \Delta$ | nakonec synchronizované | praktické aplikace |

## Failure modely

### Crash & Stop

Proces selže a **už se nikdy neobnoví**. Po pádu nic nedělá.

- *Nejmírnější* model.
- Snadný k detekci pomocí timeoutů (v synchronním systému).
- Standardní *předpoklad* pro mnoho algoritmů.

### Crash & Recovery

Proces selže, ale *po čase se obnoví* a pokračuje (typicky ze *snapshot* uloženého na disku).

- Realistický pro databáze (PostgreSQL crash recovery).
- Vyžaduje *perzistentní paměť* a *write-ahead log*.

### Byzantine

**Libovolné** chování — proces může:

- Posílat *libovolné* (i lživé) zprávy.
- *Selektivně* lhát různým příjemcům.
- *Spolupracovat* s ostatními Byzantine procesy.

**Nejtěžší** model. Vyžaduje speciální algoritmy ([[byzantium]]).

::: svg "Failure modely — crash-stop, crash-recovery, byzantine"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="20" y="30" width="150" height="130" rx="3"/>
    <rect x="195" y="30" width="150" height="130" rx="3"/>
    <rect x="370" y="30" width="150" height="130" rx="3"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-weight="600">
    <text x="95" y="50">Crash-Stop</text>
    <text x="270" y="50">Crash-Recovery</text>
    <text x="445" y="50">Byzantine</text>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="95" y="80">Selže navždy</text>
    <text x="95" y="100">— nic nedělá</text>
    <text x="95" y="125">Detekce:</text>
    <text x="95" y="140">timeout</text>
    <text x="270" y="80">Selže, pak</text>
    <text x="270" y="100">se obnoví</text>
    <text x="270" y="125">Detekce:</text>
    <text x="270" y="140">stable storage</text>
    <text x="445" y="80">Cokoliv —</text>
    <text x="445" y="100">i lež</text>
    <text x="445" y="125">Detekce:</text>
    <text x="445" y="140">PBFT, 3m+1</text>
  </g>
</svg>
:::

### Failure detection — *fail-silent* vs *fail-noisy*

- **Fail-silent**: při poruše proces *zmlkne*. Ostatní mohou *detekovat* (timeout, heartbeat).
- **Fail-noisy**: při poruše proces může *generovat hluk* (špatné zprávy). Detekce vyžaduje *cross-checking* mezi více procesy.

## FLP impossibility (1985)

### Tvrzení

**Věta (Fischer, Lynch, Paterson 1985)**: V *asynchronním* systému s *čistě* asynchronní zprávou neexistuje *deterministický* algoritmus, který by řešil konsensus s *byť jen jednou* crash-stop chybou.

### Intuice důkazu

V asynchronním systému *nelze rozlišit*:

- Proces *selhal* (a už nic nepošle).
- Proces je *velmi pomalý* (a pošle pozdě).

Pokud algoritmus *čeká* na zprávu od potenciálně selhaného procesu, *nemusí* nikdy dostat odpověď → never terminates.

Pokud algoritmus *nečeká* (timeout je nemožný v asynchronním systému), může se *minout* informaci → wrong decision.

### Důsledky

- **Asynchronní konsensus** je *nemožný* deterministicky.
- **Možné obejít**:
  - **Synchronní předpoklad** — částečně synchronní systém.
  - **Randomizace** (Ben-Or 1983, Rabin 1983) — *šance* na rozhodnutí roste s časem.
  - **Failure detectors** (Chandra, Toueg 1996) — *abstrakce* nad detekcí; algoritmy fungují, pokud detector splňuje vlastnosti.

FLP **neříká**, že konsensus je nemožný v praxi — *neříká*, že *nějaký* algoritmus s *vysokou pravděpodobností* uspěje. Říká jen, že *deterministický* algoritmus, který *vždy* terminuje, neexistuje.

## Failure detectors

**Chandra-Toueg (1996)** zavedli abstrakci **failure detector** $\Omega$. Procesy se ho ptají *„kdo je důvěryhodný leader?"* — detector odpovídá.

### Třídy failure detectorů

- $\diamond P$ (Eventually Perfect): nakonec všichni věrní procesy ukazují *pravdivě* na korektní procesy.
- $\diamond S$ (Eventually Strong): nakonec všichni věrní souhlasí na *aspoň jednom* korektním procesu.
- $\Omega$ (Eventually Leader): nakonec všichni věrní souhlasí na *jednom* leadovi.

**Klíčový výsledek**: $\Omega$ je *nejslabší* failure detector, který dovolí asynchronní konsensus. Tj. *s* nějakou formou částečné synchronie (failure detector) je konsensus *řešitelný*.

### Eventually-strong odhad

V praxi se používá *heartbeat* + *timeout*:

- Každý proces periodicky posílá `HEARTBEAT` všem.
- Pokud nedostane heartbeat od procesu $p$ za čas $T$, *odhadne*, že $p$ selhal.
- Pokud se $p$ ozve později, *adjust* timeout (zvýší).

Toto je $\diamond P$-detector — *nakonec* správně klasifikuje procesy, ale dočasně může mýlit.

## Epocha lídra

V kontextu **leader-based** konsensu (Paxos, Raft) se zavádí **epocha**:

::: math
\text{epocha} = (\text{ts},\ \text{leaderID})
:::

- $\text{ts}$ — časové razítko epochy (monotónně rostoucí).
- $\text{leaderID}$ — identifikátor lídra.

**Pravidla**:

- Vyšší $\text{ts}$ *přebíjí* nižší.
- Pokud detector $\Omega$ nahlásí nového lídra, začne *nová* epocha.
- Procesy *akceptují* novou epochu, pokud má vyšší $\text{ts}$.
- Starý lídr se *degraduje*.

### Algoritmus změny epochy

```
upon event <Omega, trust | p>:
  trusted ← p
  if p = self:
    ts ← ts + N    // N = počet procesů, zaručí unikátní ts
    broadcast NEWEPOCH(ts)

upon receive NEWEPOCH(newts) from led:
  if led = trusted AND newts > lastts:
    lastts ← newts
    trigger StartEpoch(newts, led)
  else:
    send NACK to led

upon receive NACK from p:
  if p = led:
    ts ← ts + N
    broadcast NEWEPOCH(ts)
```

**Vlastnosti**:

- **Monotonie**: nové epochy mají vyšší $\text{ts}$.
- **Konzistence**: stejný $\text{ts}$ → stejný leader.
- **Nakonec leader**: nakonec všichni korektní procesy souhlasí na *jednom* leadeři.

## Praktické dopady FLP {tier=practice}

Reálné distribuované systémy *řeší* konsensus i přes FLP:

- **Paxos, Raft** — fungují *aspoň* v částečně synchronním modelu. Nemůžou garantovat termination v plně asynchronním modelu, ale v praxi *téměř vždy* skončí.
- **Blockchain** — Bitcoin pomocí *Proof of Work* dosahuje **probabilistic** konsensus. Termination je *pravděpodobnostní*.
- **CRDTs** — Conflict-free Replicated Data Types — *vyhýbají* se konsensu úplně. Použitelné pro *eventual consistency*.

## Co dál

[[paxos]] probere **Paxos** — *kanonický* algoritmus konsensu pro crash-stop systémy. Dvoufázový protokol s *kvórem*. [[byzantium]] probere **Byzantine generals** problém a algoritmus OM. [[raft-praxe]] probere **Raft** (modern, srozumitelnější alternativa k Paxosu) a praktické aplikace v cloud computing a blockchainu.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Fischer, M.J., Lynch, N.A., Paterson, M.S.: „Impossibility of distributed consensus with one faulty process" (J. ACM 32(2), 1985, [DOI 10.1145/3149.214121](https://doi.org/10.1145/3149.214121)) — FLP věta; Chandra, T.D., Toueg, S.: „Unreliable failure detectors for reliable distributed systems" (J. ACM 43(2), 1996, [DOI 10.1145/226643.226647](https://doi.org/10.1145/226643.226647)) — failure detectors; Dwork, C., Lynch, N., Stockmeyer, L.: „Consensus in the presence of partial synchrony" (J. ACM 35(2), 1988); Ben-Or, M.: „Another advantage of free choice: Completely asynchronous agreement protocols" (PODC 1983) — randomizovaný konsensus; Lynch, N.A.: *Distributed Algorithms* (Morgan Kaufmann 1996), kap. 5, 17, 21.*
