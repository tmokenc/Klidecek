---
title: Ne-von Neumannovské architektury — dataflow, redukční
---

# Ne-von Neumannovské architektury

Flynnova klasifikace ([[flynn-klasifikace]]) pokrývá *von Neumannovské* architektury — řídící jednotka *postupně* vykonává instrukce z paměti. Existují ale **alternativní výpočetní modely**, které se odpoutávají od sekvenčního programového čítače. Klíčové dvě jsou **dataflow** a **redukční**. Třetí kategorie — **neuronové sítě** — je obrovské vlastní téma a v PRL se spíše zmíní.

## Limitace von Neumann modelu

Standardní procesor má:

- **Program counter (PC)** — kde v programu jsme.
- **Sekvenční fetch–decode–execute** — instrukce za instrukcí.
- **Paměť** — sdílena pro instrukce i data ("von Neumann bottleneck" — paměť je pomalejší než CPU).

Pro paralelní výpočet von Neumann *neškáluje přirozeně*:

- Více procesorů musí *sdílet* paměť → cache coherence, latence.
- *Sekvenční* instrukční stream → synchronizace mezi procesory pomocí explicitních primitiv.

Alternativní modely **nemají PC** — výpočet je řízen *daty* nebo *redukcí výrazu*.

## Dataflow architektura

V dataflow modelu se výpočet *neřídí* programem (sekvencí instrukcí), ale **tokem dat**. Instrukce se *vykoná*, jakmile *jsou k dispozici její vstupy*.

### Princip

Program je *graf* — uzly jsou operace, hrany přenášejí *tokens* (datové prvky). Když uzel přijme tokens na všech vstupech, *spustí se* a produkuje token na výstupu.

::: svg "Dataflow graf — výpočet (x+y) * (x-y)"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1.5">
    <circle cx="100" cy="50" r="22"/>
    <circle cx="100" cy="150" r="22"/>
    <circle cx="270" cy="50" r="22"/>
    <circle cx="270" cy="150" r="22"/>
    <circle cx="430" cy="100" r="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="54">x</text>
    <text x="100" y="154">y</text>
    <text x="270" y="54">+</text>
    <text x="270" y="154">−</text>
    <text x="430" y="104">*</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none" marker-end="url(#arr7)">
    <line x1="122" y1="50" x2="248" y2="50"/>
    <line x1="122" y1="55" x2="248" y2="145"/>
    <line x1="122" y1="150" x2="248" y2="50"/>
    <line x1="122" y1="150" x2="248" y2="150"/>
    <line x1="290" y1="60" x2="412" y2="92"/>
    <line x1="290" y1="140" x2="412" y2="108"/>
  </g>
  <defs>
    <marker id="arr7" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="270" y="195" fill="var(--text-muted)" text-anchor="middle" font-size="10">Když x i y dorazí, + a − se spustí paralelně; * čeká na oba výsledky</text>
</svg>
:::

### Vlastnosti

- **Implicit parallelism** — všechny nezávislé operace běží *paralelně*, bez explicitního schedulingu.
- **No PC, no shared memory** — žádný globální stav.
- **Tokens** nesou data + tag (instance identifier).
- **Functional semantics** — bez side-effects, bez mutable state.

### Variants

#### Static dataflow

Každý uzel má *fixní* paměť na tokens (= 1). Klade omezení: jen jeden výpočet "in flight" v rámci jednoho uzlu. Jednodušší hardware, ale méně paralelismu.

#### Dynamic dataflow

Více "instancí" výpočtu sdílí *stejné* uzly (rozlišené tagem). Plně využívá paralelismus, ale složitější (token matching engine).

**Monsoon processor** (MIT, ISCA 1990) — kanonický dynamic dataflow počítač.

### Aplikace {tier=practice}

Dataflow je *koncepčně krásný*, ale prakticky se *nepoužívá* jako hlavní hardware. Důvody:

- Komplexita token matching (tagged memory).
- Overhead na malé úlohy.
- Trh tvořený softwarem psaným pro von Neumann.

Ale *idea* dataflow přežívá v moderním HW:

- **Out-of-order execution** — moderní CPU (Intel, AMD, ARM) interně přepořádá instrukce *podle dependence*. To je *dynamic dataflow* uvnitř pipeline.
- **Tensor flow graphs** — TensorFlow, PyTorch reprezentují ML model jako dataflow graf. *Compile* na CPU/GPU.
- **Reactive frameworks** — RxJS, Akka Streams. Programmer abstraction.

## Redukční počítač

Princip *funkcionálního programování* na hardware. Místo modifikace stavu, *redukujeme* výraz na jeho hodnotu.

### Princip

Výraz $f(x_1, x_2, \ldots)$ se *vyhodnotí redukcí*:

1. Najdi *redukovatelný* sub-výraz (redex) — kandidát pro výpočet.
2. *Nahraď* ho jeho hodnotou.
3. Opakuj, dokud zbude jen jedna hodnota.

Příklad v LISP-like notaci: `(+ (* 3 2) (- 3 2))` → `(+ 6 1)` → `7`.

Žádný PC, žádná paměť stavů. Jen *redukce* podle redukčních pravidel.

### Architektura

- **Stromová** — výraz reprezentován jako *strom*. Procesory na uzlech, redukce postupuje *zdola nahoru*.
- **Paralelismus** — *nezávislé* sub-výrazy redukují *současně*.
- **Žádný side-effect** — výsledek nezáleží na *pořadí* redukcí.

### Historický kontext {tier=extra}

- **SKI combinator machines** — abstrakce funcionálního programování ve hardware.
- **Symbolics Lisp Machine** (1980s) — komerční pokus, neuspěl ekonomicky.
- **Reduceron** (academic, 2007) — moderní FPGA pokus.

Nedosáhly mainstream — kompilátory funkcionálních jazyků (Haskell GHC, OCaml) běží na klasickém von Neumann velmi efektivně.

### Vliv {tier=practice}

Redukční idea ovlivnila:

- **MapReduce** (Google, 2004) — distribuovaný framework. Funkcionální *Map* a *Reduce*.
- **Lazy evaluation** v Haskellu — výraz se redukuje *jen* když je potřeba.
- **Memoization** — cache mezi výsledky redukce; aplikováno v dynamic programming, ML.

## Neuronové sítě

*Třetí* ne-VN model — výpočet jako šíření signálu sítí umělých neuronů. Inspirace biologickými neuronovými sítěmi.

V PRL se zmiňuje *jen okrajově*; vlastní disciplína (SUI v magisterském studiu).

Klíčové architektury:

- **Klasický feedforward** — fully connected layers.
- **Konvoluční sítě** — pro obraz/zvuk.
- **Rekurentní sítě** (LSTM, GRU) — pro sekvenční data.
- **Transformery** — Attention is All You Need (2017). Pohání moderní LLM.

Implementace:

- *Software* na GPU (CUDA, ROCm).
- *Dedikovaný HW* — Google TPU, NVidia Tensor Cores, Apple Neural Engine.
- *Neuromorphic chips* — Intel Loihi, IBM TrueNorth. Inspirované biology, *spiking neurons*. Niche.

## Quantum computing (mimo PRL) {tier=extra}

Pro úplnost: **kvantové počítače** používají *kvantové bity* (qubits), využívají *superpozici* a *entanglement* pro *exponenciální* paralelismus. Pro úzký set úloh (Shor's algorithm, Grover) překonávají klasické počítače.

V 2026 je quantum *raných stadií* — IBM, Google, IonQ mají systémy s ~1000 qubits. Praktická aplikace omezena, ale aktivní výzkum.

## Shrnutí

| Model | Princip | Paralelismus | Praktické nasazení |
| :--- | :--- | :--- | :--- |
| **von Neumann SISD** | sekvenční PC | žádný | embedded |
| **von Neumann SIMD** | vektor | data-paralelní | CPU, GPU |
| **von Neumann MIMD** | multi-thread | task-paralelní | servery, cluster |
| **Dataflow** | token-driven | implicit | OoO CPU, TensorFlow |
| **Redukční** | funkcionální | implicit | MapReduce |
| **Neuronové** | signál šíření | masivní | ML, AI |
| **Kvantové** | qubit superpozice | exponenciální | research |

Pro většinu PRL kurzu se zaměříme na **MIMD** (shared a distribuovanou paměť) a **PRAM model** (abstrakce SIMD-MIMD pro algoritmickou analýzu).

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Backus, J.: „Can Programming Be Liberated from the von Neumann Style?" (Comm. ACM 21(8), 1978); Arvind, Culler, D.E.: „Dataflow Architectures" (Annual Review of Computer Science 1(1), 1986); Treleaven, P.C., Brownbridge, D.R., Hopkins, R.P.: „Data-driven and demand-driven computer architecture" (ACM Computing Surveys 14(1), 1982); Hwu, W., Patel, S., Patt, Y.: „Comparing Software and Hardware Schemes for Reducing the Cost of Branches" (ISCA 1989).*
