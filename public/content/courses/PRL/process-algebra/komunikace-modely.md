---
title: Modely komunikace — synchronní, asynchronní, rendezvous
---

# Modely komunikace v distribuovaných systémech

Předchozí topic ([[euler-tour]], [[kontrakce-uvod]]) probral *paralelní algoritmy* nad sdílenou pamětí (PRAM). Topic 7 přechází k **distribuovaným systémům** — procesy nemají sdílenou paměť, komunikují **zprávami** přes kanály. Tato kapitola probírá *modely* komunikace (synchronní vs asynchronní), jejich *vzájemnou simulaci*, problém **korunování** (crown) při převodu z asynchronního na synchronní, a klasický **rendezvous** algoritmus (Bagrodia 1989).

## Synchronní vs asynchronní komunikace

### Asynchronní komunikace

**Asynchronní** = `send` *neblokuje*. Odesilatel pošle zprávu do *bufferu* (mailbox, kanál) a *pokračuje*. Příjemce zprávu *kdykoli* později vyzvedne.

**Vlastnosti**:

- Kanál má (potenciálně neomezenou) *kapacitu*.
- Odesilatel se *neblokuje* (rychlejší propustnost).
- *Žádné okamžité* potvrzení doručení.
- Implementačně *jednodušší* z pohledu odesilatele, *složitější* z pohledu systému (buffer management).
- **Příklad**: e-mail, UDP, message queue (RabbitMQ, Kafka).

### Synchronní komunikace

**Synchronní** = `send` *blokuje*, dokud `receive` neproběhne (anebo do nějakého *handshaku*).

**Vlastnosti**:

- Žádný buffer potřebný — *přímý* přenos.
- Odesilatel *čeká* na příjemce — garantuje *současnost* doručení.
- *Slabší* propustnost.
- Implementačně *jednodušší* (žádný buffer), ale *blokuje* odesilatele.
- **Příklad**: Hoareho CSP, OCCAM `?`/`!`, MPI `MPI_Send` v synchronním režimu, RPC.

::: svg "Asynchronní vs Synchronní komunikace"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="20" y="20" width="240" height="160" rx="3"/>
    <rect x="280" y="20" width="240" height="160" rx="3"/>
  </g>
  <text x="140" y="45" fill="var(--text)" text-anchor="middle" font-weight="600">Asynchronní</text>
  <text x="400" y="45" fill="var(--text)" text-anchor="middle" font-weight="600">Synchronní</text>
  <g stroke="var(--accent)" stroke-width="1" fill="none" marker-end="url(#commarr)">
    <line x1="50" y1="80" x2="120" y2="80"/>
    <line x1="50" y1="120" x2="120" y2="120"/>
    <line x1="170" y1="110" x2="230" y2="110"/>
  </g>
  <defs>
    <marker id="commarr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="120" y="70" width="50" height="60"/>
  </g>
  <text x="145" y="105" text-anchor="middle" fill="var(--text)" font-size="10">buffer</text>
  <text x="50" y="75" fill="var(--text-muted)" font-size="9">Send</text>
  <text x="230" y="105" fill="var(--text-muted)" font-size="9">Receive</text>
  <text x="140" y="160" fill="var(--text-muted)" text-anchor="middle" font-size="9">Send neblokuje; buffer odděluje</text>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" marker-end="url(#commarr2)">
    <line x1="320" y1="85" x2="470" y2="85"/>
  </g>
  <defs>
    <marker id="commarr2" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="320" y="80" fill="var(--text-muted)" font-size="9">Send</text>
  <text x="470" y="80" fill="var(--text-muted)" font-size="9">Receive</text>
  <text x="395" y="110" fill="var(--accent)" text-anchor="middle" font-size="10">handshake</text>
  <g stroke="var(--accent)" stroke-width="1" fill="none" marker-end="url(#commarr2)">
    <line x1="470" y1="130" x2="320" y2="130"/>
  </g>
  <text x="395" y="150" fill="var(--text-muted)" text-anchor="middle" font-size="9">ack zpět</text>
  <text x="400" y="170" fill="var(--text-muted)" text-anchor="middle" font-size="9">Send blokuje do doručení</text>
</svg>
:::

### Formální vlastnosti synchronní komunikace

Pro synchronní komunikaci platí:

- **Platnost (Validity)**: pokud proces $p_1$ synchronně *obdrží* zprávu od $p_2$, pak ji $p_2$ synchronně *odeslal*.
- **Integrita (Integrity)**: žádný proces synchronně neobdrží zprávu *víc než jednou*.
- **Synchronnost**: pokud $e_1 \to_e e_2$ (kauzální vztah), pak $D(e_1) < D(e_2)$. A speciálně $D(\text{send}(m)) = D(\text{receive}(m))$ (současný okamžik).
- **Ukončení (Termination)**: každá synchronně odeslaná zpráva bude synchronně doručena.

## Simulace synchronního přes asynchronní

Z asynchronního kanálu lze *simulovat* synchronní kanál pomocí dvojice asynchronních kanálů (a *handshake* protokolu):

### Nulová kapacita

```
send(ch, msg)  ⇒  send(ch1, msg)
                  receive(ch2, dummy)     // wait for ACK

receive(ch, msg) ⇒ receive(ch1, msg)
                   send(ch2, "ack")        // confirm
```

Send-receive pár proběhne *společně* — odesilatel čeká na ACK, příjemce ho pošle hned po přijetí.

### Nenulová kapacita $n$

Stejný protokol, ale buffer je inicializován s $n$ ACK tokeny:

```
init(ch) ⇒ n_times { send(ch2, "ack") }
```

Odesilatel tak může poslat $n$ zpráv *bez čekání* (každá konzumuje token); ale $n+1$. zpráva už musí čekat na ACK od příjemce.

## Crown problem — kdy *není* asynchronní program proveditelný synchronně?

**Otázka**: pokud máme distribuovaný program *navržený* pro *asynchronní* komunikaci, dá se *automaticky* spustit v *synchronním* prostředí?

**Odpověď**: ne vždy! Bránou je tzv. **korun** (crown).

### Definice koruny

**Koruna velikosti $k$** je posloupnost odeslání-přijetí:

::: math
\begin{aligned}
&\text{send}(m_1) \to_e \text{receive}(m_2) \\
&\text{send}(m_2) \to_e \text{receive}(m_3) \\
&\dots \\
&\text{send}(m_{k-1}) \to_e \text{receive}(m_k) \\
&\text{send}(m_k) \to_e \text{receive}(m_1)
\end{aligned}
:::

Tedy: $\text{send}$ zprávy $m_i$ kauzálně předchází $\text{receive}$ zprávy $m_{i+1}$, *cyklicky*.

::: svg "Koruna velikosti 2 a 3 — cyklické závislosti send→receive"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="40" y="30" width="180" height="160" rx="3"/>
    <rect x="320" y="30" width="180" height="160" rx="3"/>
  </g>
  <text x="130" y="55" fill="var(--text)" text-anchor="middle" font-weight="600">Koruna velikosti 2</text>
  <text x="410" y="55" fill="var(--text)" text-anchor="middle" font-weight="600">Koruna velikosti 3</text>
  <g stroke="var(--accent)" stroke-width="0.9" fill="none" marker-end="url(#crownarr)">
    <path d="M 60,90 Q 130,80 200,100"/>
    <path d="M 200,140 Q 130,150 60,130"/>
  </g>
  <defs>
    <marker id="crownarr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="130" y="80" fill="var(--text-muted)" text-anchor="middle" font-size="9">m₁</text>
  <text x="130" y="155" fill="var(--text-muted)" text-anchor="middle" font-size="9">m₂</text>
  <text x="130" y="180" fill="var(--text-muted)" text-anchor="middle" font-size="9">send(m₁)→recv(m₂), send(m₂)→recv(m₁)</text>
  <g stroke="var(--accent)" stroke-width="0.9" fill="none" marker-end="url(#crownarr)">
    <path d="M 350,90 Q 380,80 410,100"/>
    <path d="M 410,140 Q 440,130 470,90"/>
    <path d="M 470,110 Q 440,160 350,130"/>
  </g>
  <text x="410" y="160" fill="var(--text-muted)" text-anchor="middle" font-size="9">3 procesy, 3 cyklické závislosti</text>
  <text x="410" y="180" fill="var(--text-muted)" text-anchor="middle" font-size="9">send(m₁)→recv(m₂), send(m₂)→recv(m₃), send(m₃)→recv(m₁)</text>
</svg>
:::

### Teorém

**Program pro asynchronní systém je proveditelný v synchronním systému** (RSC — *realizable with synchronous communication*) **právě tehdy, když neobsahuje korunu.**

*Důkaz*: pokud existuje koruna, kauzální graf zpráv obsahuje cyklus → synchronní vykonání by vyžadovalo, aby všechny zúčastněné procesy *čekaly* navzájem → deadlock.

*Důkaz obrácený*: pokud koruna *neexistuje*, kauzální graf je acyklický → existuje topologické uspořádání → synchronní vykonání je možné v tomto pořadí.

## Klient-server přes synchronní komunikaci

Praktická aplikace synchronní komunikace v *Server* a *Klient* architektuře:

```
Klient i odesílá:                        Server přijímá:
  buffer ← m                               wait(may_read[i])
  signal(j, may_read[i])                   x ← obtain(i)
  wait(end_rdv_i)                          may_read[i] ← false
  end_rdv ← false                          signal(i, end_rdv)
```

Klient signalizuje, že je *připraven psát*; server čeká, *přečte*, signalizuje *konec rendezvous*. Klient pak ví, že komunikace proběhla.

### Deterministický vs nedeterministický rendezvous

```
DETERMINISTICKÝ:                     NEDETERMINISTICKÝ:
  wait(may_read[i])                    wait(may_read[i] OR may_write[l]
  ...                                       OR may_read[j] OR may_write[j])
  wait(may_write[l])                   if (may_read[i]) ...
  ...                                  else if (may_write[l]) ...
  wait(may_read[j])                    else if (may_read[j]) ...
  ...                                  else if (may_write[j]) ...
```

**Deterministický**: vykonává operace v *pevném pořadí*. Snadno predikovatelný.

**Nedeterministický**: čeká, dokud *libovolný* z očekávaných eventů nenastane, pak ho obslouží. *Flexibilnější*, ale složitější resoning.

## Bagrodiův algoritmus — synchronizace rendezvous procesů

**Problém**: jak v distribuovaném systému *zaručit*, že rendezvous mezi dvěma procesy proběhne *atomicky*, *bez koruny*?

**Bagrodia 1989** představil **token-based** algoritmus:

### Princip

- Mezi každou dvojicí procesů $(i, j)$ existuje **token** $\text{TOKEN}(\{i, j\}, k)$ pro nějaké $k \in \{i, j\}$ — token "patří" procesu $k$.
- Procesy mají **prioritu** podle indexu: menší index = vyšší priorita.
- Stav procesu:
  - **OUT**: mimo rendezvous kontext.
  - **INTERESTED**: chce komunikovat.
  - **ENGAGED**: aktivně komunikuje.
- Pokud proces čeká na nabídku interakce a *jiný* (s vyšší prioritou) má zájem, *zaznamená* jeho zájem a odpoví *až po* dokončení vlastní očekávané interakce.

### Důležité záruky

- *Žádná koruna* nemůže vzniknout (priorita brzy zavře cykly).
- *Žádné starvation* (proces s vyšší prioritou vždy dostane šanci).
- *Atomicita rendezvous* (oba procesy buď interagují, nebo ne).

Algoritmus se v praxi používá v jazyce **Ada** pro mechanism *Ada rendezvous* (active messages).

## Kolektivní komunikace v distribuovaném systému

Mimo dvojici send-receive existují *kolektivní* operace, popsané v topic Komunikační operace ([[broadcast-redukce]], [[scatter-gather]]):

- **Broadcast** — odeslání jedné zprávy *všem*.
- **Reduce** — sběr zpráv *od všech* + agregace.
- **Scatter, Gather, All-gather, All-to-all**.

V distribuovaném systému jsou tyto operace *standardizované* (MPI, OpenMP) a optimalizované pro topologii sítě.

## Failure modely

V distribuovaných systémech se procesy mohou *poruchovat*. Tři standardní modely:

- **Crash & Stop**: po poruše proces *nic* nedělá (zastaví se).
- **Crash & Recovery**: po nějaké době se může *obnovit* a pokračovat.
- **Byzantine**: chování po poruše *není definováno* — proces může posílat *libovolné* (i lživé) zprávy.

Spolehlivá komunikace (reliable broadcast, consensus) musí být *robustní* vůči zvolenému failure modelu. Viz topic Konsensus pro detaily.

## Co dál

[[csp-occam]] zavádí konkrétní *jazyky* pro popis distribuovaných systémů: **CSP** (Hoare 1978) a **OCCAM** (jazyk navržený pro hardware transputerů). Tyto jazyky používají *synchronní* komunikaci po pojmenovaných kanálech. [[pi-calculus]] zobecní na **π-kalkul** (Milner 1992) — formalismus pro *mobilní* procesy, kde lze předávat *jména kanálů* jako data. [[simulace-bisimulace]] potom probere *teorii* ekvivalence procesů — *bisimulace*, slabé/silné/barbed varianty.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Charron-Bost, B., Mattern, F., Tel, G.: „Synchronous, asynchronous, and causally ordered communication" (Distributed Computing 9(4), 1996, [DOI 10.1007/s004460050018](https://doi.org/10.1007/s004460050018)); Bagrodia, R.: „Process synchronization: design and performance evaluation of distributed algorithms" (IEEE Trans. Softw. Eng. 15(9), 1989, [DOI 10.1109/32.31361](https://doi.org/10.1109/32.31361)); Tel, G.: *Introduction to Distributed Algorithms* (2. vyd., Cambridge UP 2000); Lynch, N.A.: *Distributed Algorithms* (Morgan Kaufmann 1996), kap. 5–7; Coulouris, G., Dollimore, J., Kindberg, T., Blair, G.: *Distributed Systems: Concepts and Design* (5. vyd., Addison-Wesley 2011).*
