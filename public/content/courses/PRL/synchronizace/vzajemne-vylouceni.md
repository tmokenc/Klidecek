---
title: Distribuované vzájemné vyloučení — Lamport, Ricart-Agrawala, Maekawa, Raymond
---

# Distribuované vzájemné vyloučení

V *jednoprocesorovém* prostředí řešíme vzájemné vyloučení semafory, monitory nebo mutexy. V *distribuovaném* prostředí *není* sdílená paměť — procesy si musí *dohodnout* atomicitu přístupu ke sdílenému zdroji *pouze* zprávami. Tato kapitola probírá čtyři klasické algoritmy: **Lamportův** (postaven na logických hodinách z [[logicky-cas]]), **Ricart-Agrawala** (optimalizace), **Maekawa** (quorum-based, $O(\sqrt n)$), **Raymond** (token-based stromový).

## Požadavky

Distribuovaný mutex musí splňovat:

1. **Vzájemné vyloučení** (mutual exclusion): v kritické sekci je *nejvýše jeden* proces.
2. **Konzistence uspořádání**: pořadí žádostí *odpovídá* nějakému kauzálnímu pořadí.
3. **Bez uváznutí** (deadlock freedom): systém nezablokuje.
4. **Bez vyhladovění** (starvation freedom): každý žádající proces se nakonec dostane do KS.
5. **Férovost** (fairness): procesy získávají přístup *spravedlivým* způsobem.

## Dva druhy algoritmů

- **Time-stamp based**: každá žádost dostane *časové razítko* (z logických hodin). Algoritmy rozhodují na základě *uspořádání* razítek.
  - Lamport, Ricart-Agrawala, Maekawa.
- **Token-based**: existuje *jediný token* — kdo ho drží, je v KS.
  - Suzuki-Kasami, Raymond.

## Lamportův algoritmus (1978)

### Princip

- Každý proces má **frontu žádostí** seřazenou podle Lamportových časových razítek.
- Pro vstup do KS pošle proces `REQUEST(ts, i)` *všem* ostatním.
- Příjemci odpoví `ACK` a *přidají* žádost do své fronty.
- Proces vstoupí do KS, *když* jeho žádost má *nejmenší* časové razítko ve své frontě *a* obdržel `ACK` od všech.
- Po opuštění KS pošle `RELEASE(i)` *všem*, kteří *odstraní* jeho žádost.

### Počet zpráv

- $n - 1$ REQUEST
- $n - 1$ ACK
- $n - 1$ RELEASE

**Celkem**: $3(n - 1)$ zpráv na jeden vstup do KS.

### Příklad

```
P_1 chce KS v čase 2:                P_2 chce KS v čase 1:
  send REQUEST(2, 1) to all            send REQUEST(1, 2) to all
  fronta P_1: [(1,2), (2,1)]           fronta P_2: [(1,2), (2,1)]
  
P_1 obdrží ACK od P_2, P_3
P_2 obdrží ACK od P_1, P_3

P_2 má (1,2) - nejmenší ts → vstupuje do KS
P_1 čeká, dokud P_2 nepošle RELEASE
```

::: svg "Lamportův algoritmus — REQUEST broadcast, fronta podle ts"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="40" y="80" width="80" height="50" rx="3"/>
    <rect x="230" y="80" width="80" height="50" rx="3"/>
    <rect x="420" y="80" width="80" height="50" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="80" y="100">P_1</text>
    <text x="80" y="115" font-size="9">fronta:</text>
    <text x="80" y="127" font-size="9">[(1,2),(2,1)]</text>
    <text x="270" y="100">P_2</text>
    <text x="270" y="115" font-size="9">fronta:</text>
    <text x="270" y="127" font-size="9">[(1,2),(2,1)]</text>
    <text x="460" y="100">P_3</text>
    <text x="460" y="115" font-size="9">fronta:</text>
    <text x="460" y="127" font-size="9">[(1,2),(2,1)]</text>
  </g>
  <g stroke="var(--accent)" stroke-width="0.9" fill="none" marker-end="url(#larr)">
    <line x1="125" y1="100" x2="225" y2="100"/>
    <line x1="225" y1="115" x2="125" y2="115"/>
  </g>
  <defs>
    <marker id="larr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="175" y="95" fill="var(--accent)" text-anchor="middle" font-size="9">REQUEST</text>
  <text x="175" y="125" fill="var(--accent)" text-anchor="middle" font-size="9">ACK</text>
  <text x="270" y="160" fill="var(--accent)" text-anchor="middle" font-size="10">P_2 vidí svou (1,2) na čele → vstupuje do KS</text>
</svg>
:::

## Ricart-Agrawala algoritmus (1981)

### Optimalizace

Klasický Lamportův algoritmus posílá *separátní* ACK a RELEASE zprávy. **Ricart-Agrawala** je *sloučí*:

- Místo *ihned* poslat ACK proces *odloží* odpověď, pokud má *menší* časové razítko než žádost.
- Po opuštění KS pošle **odložené ACK** těm, jimž je dlužen → ti vědí, že KS je volná, a získávají povolení vstoupit.

### Počet zpráv

- $n - 1$ REQUEST
- $n - 1$ ACK (kombinuje povolení a release)

**Celkem**: $2(n - 1)$ zpráv na jeden vstup do KS. Lepší než Lamport.

### Synchronizační zpoždění

Synchronizační zpoždění (latence od chtít vstoupit do vstoupit do KS) je **jedna zpráva** (po nejpomalejším ACK).

## Maekawův algoritmus (1985)

### Idea — kvórum místo všech

Místo požádat *všechny* $n - 1$ procesů Maekawa žádá jen **podmnožinu** = **kvórum** $R_i$ velikosti $K = O(\sqrt n)$.

**Podmínky pro kvóra**:

1. $i \in R_i$ (proces je ve svém kvóru).
2. $R_i \cap R_j \ne \emptyset$ pro každé $i, j$ (každé dvě kvóra mají *společný* element).
3. Všechna kvóra mají stejnou *velikost* $K$.
4. Každý proces je obsažen v $K$ kvórech.

Pro splnění těchto podmínek $K = O(\sqrt n)$ — řekněme $K = 2\sqrt{N} - 1$.

### Konstrukce kvór — biliardová metoda

Procesy uspořádáme do *čtvercové* mřížky ($\sqrt N \times \sqrt N$). Kvórum procesu $i$ = procesy *na řádce a sloupci* z bodu $i$.

::: svg "Biliardová konstrukce kvór — řádek + sloupec dává kvórum"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6" fill="var(--bg-card)">
    <circle cx="100" cy="30" r="10"/>
    <circle cx="160" cy="30" r="10"/>
    <circle cx="220" cy="30" r="10"/>
    <circle cx="280" cy="30" r="10"/>
    <circle cx="100" cy="80" r="10"/>
    <circle cx="160" cy="80" r="10"/>
    <circle cx="220" cy="80" r="10"/>
    <circle cx="280" cy="80" r="10"/>
    <circle cx="100" cy="130" r="10"/>
    <circle cx="160" cy="130" r="10"/>
    <circle cx="220" cy="130" r="10"/>
    <circle cx="280" cy="130" r="10"/>
    <circle cx="100" cy="180" r="10"/>
    <circle cx="160" cy="180" r="10"/>
    <circle cx="220" cy="180" r="10"/>
    <circle cx="280" cy="180" r="10"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="100" y="34">1</text>
    <text x="160" y="34">2</text>
    <text x="220" y="34">3</text>
    <text x="280" y="34">4</text>
    <text x="100" y="84">5</text>
    <text x="160" y="84">6</text>
    <text x="220" y="84">7</text>
    <text x="280" y="84">8</text>
    <text x="100" y="134">9</text>
    <text x="160" y="134">10</text>
    <text x="220" y="134">11</text>
    <text x="280" y="134">12</text>
    <text x="100" y="184">13</text>
    <text x="160" y="184">14</text>
    <text x="220" y="184">15</text>
    <text x="280" y="184">16</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <circle cx="220" cy="80" r="13"/>
  </g>
  <g stroke="var(--accent)" stroke-width="0.9" fill="none">
    <line x1="105" y1="80" x2="285" y2="80"/>
    <line x1="220" y1="35" x2="220" y2="180"/>
  </g>
  <text x="400" y="60" fill="var(--text)" font-size="10">Kvórum procesu 7:</text>
  <text x="400" y="78" fill="var(--accent)" font-size="10">řádka: 5, 6, 7, 8</text>
  <text x="400" y="96" fill="var(--accent)" font-size="10">sloupec: 3, 7, 11, 15</text>
  <text x="400" y="120" fill="var(--text)" font-size="10">R_7 = {3, 5, 6, 7, 8, 11, 15}</text>
  <text x="400" y="145" fill="var(--text-muted)" font-size="9">Velikost K = 2√n − 1</text>
</svg>
:::

### Princip

- Pro vstup do KS proces $i$ pošle `REQUEST` *všem* procesům v $R_i$.
- Příjemce $j$ pošle `GRANT(j)` pokud nepřidělil grant jinému procesu, jinak `FAILED(j)` (zařadí požadavek do fronty).
- Když proces $i$ obdrží `GRANT` od *všech* z $R_i$, vstoupí do KS.
- Po opuštění pošle `RELEASE` všem z $R_i$, kteří pošlou `GRANT` *dalšímu* ve své frontě.

### Počet zpráv

- $K$ REQUEST (~$\sqrt n$)
- $K$ GRANT
- $K$ RELEASE

**Celkem**: $3K = O(\sqrt n)$ zpráv na vstup. **Lepší** než Lamport/Ricart pro velký $n$.

### Problém — deadlock

Naivní Maekawa může *uváznout* — pokud kvóra mají cyklické závislosti. **Řešení**: priority + `INQUIRE`/`YIELD` protokol. Detaily v Maekawa 1985.

## Raymondův algoritmus (1989)

### Token-based + stromová struktura

- V systému je *jediný token* — kdo ho drží, je v KS.
- Procesy jsou uspořádány do **logického stromu**.
- Každý proces má pointer **HOLDER** ukazující na rodiče (nebo na sebe, pokud token drží).
- Žádosti tečou *směrem k* držiteli tokenu po stromě.

### Algoritmus

```
Stav každého uzlu:
  HOLDER — kdo (nejbližší soused) má token / cestu k němu
  REQUEST-Q — fronta žádostí o token
  ASKED — flag, zda jsem už požádal Holdera
  USING — jsem v KS?

Pro vstup do KS:
  pokud HOLDER ≠ self: enqueue(self) do REQUEST-Q
  pošli REQUEST sousedovi (HOLDER), pokud ASKED je false → set ASKED = true

Po obdržení REQUEST od souseda:
  pokud HOLDER = self a not USING: pošli TOKEN sousedovi, HOLDER = soused
  pokud HOLDER ≠ self: enqueue do REQUEST-Q, pošli REQUEST k HOLDER (pokud not ASKED)

Po obdržení TOKEN:
  HOLDER = self
  pokud REQUEST-Q nepustá: dequeue, HOLDER = první v frontě, pošli TOKEN
  pokud HOLDER = self: USING = true, vstup do KS
```

### Analýza

- **Počet zpráv** na vstup do KS: $O(\log n)$ (hloubka vyváženého stromu) + $O(1)$ pro token.
- *Hrubě*: $O(\log n)$ — **lepší** než všechny ostatní.
- *Worst case*: lineární strom (nevyvážený) → $O(n)$.

## Suzuki-Kasami broadcast algoritmus

Alternativní *token-based* algoritmus *broadcastovým* stylem:

- Token obsahuje **frontu** žádostí + **vektor čítačů** (kolikrát každý proces vstoupil).
- Pro KS proces broadcast `REQUEST` všem.
- Držitel tokenu kontroluje *vektor čítačů*: pokud někdo má *víc* žádostí než přidělení, pošle mu token.

**Počet zpráv**: $O(n)$ na vstup (kvůli broadcastu).

## Souhrnná tabulka

| Algoritmus | Typ | Zprávy / vstup | Synchron. zpoždění | Komentář |
| :--- | :--- | :---: | :---: | :--- |
| Lamport | timestamp | $3(n-1)$ | $T$ | klasický |
| Ricart-Agrawala | timestamp | $2(n-1)$ | $T$ | optimalizace |
| Maekawa | quorum | $O(\sqrt n)$ | $2T$ | škálovatelný |
| Raymond | token (tree) | $O(\log n)$ | $T \cdot \log n$ | malé zprávy |
| Suzuki-Kasami | token (broadcast) | $n$ | $T$ | jednoduchý token |

$T$ = jedno round-trip délka zprávy.

## Praktické aplikace

- **Distribuované databáze** (PostgreSQL multi-master) používají *2-phase locking* nad Lamport-like protokolem.
- **Apache ZooKeeper** — zápisy do *znode* fungují přes *Zab* protokol s leader-based mutex.
- **Mutex v Hadoop** — token-based pro HDFS NameNode.
- **Modern blockchain** — Bitcoin mining = vlastně distribuovaný mutex přes *proof of work*.

## Praktické rady

1. **Pro malé $n$ (< 10)**: Ricart-Agrawala stačí, jednoduchý.
2. **Pro střední $n$ (10–1000)**: Maekawa nebo Raymond.
3. **Pro velký $n$ (> 1000)**: token-based je *nezbytný*, případně *leader-based* protokol (Paxos, Raft).
4. **Pro Byzantine prostředí**: výše uvedené *nestačí*. Použij PBFT, HotStuff.

## Co dál

Topic 8 (Synchronizace) je teď kompletní. Topic 9 (Konsensus) přejde k *nejtěžšímu* problému distribuovaných systémů: **konsensus** — všechny procesy se musí *dohodnout* na *jedné* hodnotě, navzdory selháním. Klasické výsledky: **FLP impossibility** (Fischer, Lynch, Paterson 1985), **Paxos** (Lamport 1998), **Raft** (Ongaro 2014), **Byzantine consensus** (Lamport 1982).

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Lamport, L.: „Time, clocks, and the ordering of events in a distributed system" (CACM 21(7), 1978); Ricart, G., Agrawala, A.K.: „An optimal algorithm for mutual exclusion in computer networks" (CACM 24(1), 1981, [DOI 10.1145/358527.358537](https://doi.org/10.1145/358527.358537)); Maekawa, M.: „A √N algorithm for mutual exclusion in decentralized systems" (ACM TOCS 3(2), 1985, [DOI 10.1145/214438.214445](https://doi.org/10.1145/214438.214445)); Raymond, K.: „A tree-based algorithm for distributed mutual exclusion" (ACM TOCS 7(1), 1989, [DOI 10.1145/58564.59295](https://doi.org/10.1145/58564.59295)); Suzuki, I., Kasami, T.: „A distributed mutual exclusion algorithm" (ACM TOCS 3(4), 1985); Lynch, N.A.: *Distributed Algorithms* (Morgan Kaufmann 1996), kap. 10.*
