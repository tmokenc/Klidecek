---
title: Thread-Level Parallelism — motivace a taxonomie
---

# TLP — vláknový paralelismus jako odpověď na ILP wall

ILP ([[ilp-superskalar]]) má praktický strop ~3-4 IPC. *Více* paralelismu z jednoho vlákna pumpovat nelze — řeší to **TLP**, paralelismus *mezi* vlákny. Toto je úvod do TLP, který Topic 7-8 rozvíjí v OpenMP. Topic 6 řeší *hardware support* pro multithreading uvnitř jediného jádra (SMT, Hyper-Threading).

## ILP wall

Wall (Wall 1991) ukázal: na *neomezeném* OoO HW s perfektní branch prediction je *průměrný* ILP **4-8** pro běžné programy. Reálný HW limit ~3 IPC.

Důvody:

- Velikost základního bloku (kód mezi skoky) ~5-7 instrukcí.
- Cache misses zaplní RS/ROB čekajícími.
- Memory ordering omezuje OoO L/S.

⇒ Po ~3-4 IPC další tranzistory v jádře *neudělají rozdíl*. **Větší jádro = víc power, ne víc IPC**.

## TLP jako řešení

Místo *většího* jádra: **více jader** (CMP — Chip Multi-Processor). Místo `N×` rychlejšího singlecore: `N×` jader, každé třeba mírně menší.

Sjednodušený model:

$$
\text{throughput} = N_{\text{cores}} \cdot \text{IPC}_{\text{single}} \cdot f
$$

10 jader × 3 IPC × 4 GHz = **120 GIPS** (giga-instrukcí/s). Vs. mythical 1-core 10 IPC × 4 GHz = 40 GIPS. **3× throughput** za stejný tranzistorový rozpočet.

Cena: programátor musí *najít* paralelní vlákna (TLP), ne dostat zdarma jako ILP.

## Tři druhy multithreadingu (HW)

::: svg "TMT, CMT, SMT — sdílení zdrojů mezi vlákny"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--text)" font-weight="600">
    <text x="20" y="22">TMT (časový MT) — 1 jádro, vlákna se střídají v čase</text>
    <text x="20" y="92">CMT (prostorový MT) — N jader, každé 1 vlákno</text>
    <text x="20" y="162">SMT (simultaneous MT) — 1 jádro, N vláken současně</text>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="30" width="40" height="20" rx="2"/>
    <rect x="65" y="30" width="40" height="20" rx="2"/>
    <rect x="110" y="30" width="40" height="20" rx="2"/>
    <rect x="155" y="30" width="40" height="20" rx="2"/>
    <rect x="200" y="30" width="40" height="20" rx="2"/>
    <rect x="245" y="30" width="40" height="20" rx="2"/>
  </g>
  <g fill="var(--accent)" opacity="0.5">
    <rect x="20" y="30" width="40" height="20"/>
    <rect x="110" y="30" width="40" height="20"/>
    <rect x="200" y="30" width="40" height="20"/>
  </g>
  <g fill="var(--accent-line)" opacity="0.5">
    <rect x="65" y="30" width="40" height="20"/>
    <rect x="155" y="30" width="40" height="20"/>
    <rect x="245" y="30" width="40" height="20"/>
  </g>
  <text x="300" y="44" fill="var(--text-muted)" font-size="9">vlákno A (modrý) / vlákno B (zelený), střídá se</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="100" width="80" height="40" rx="2"/>
    <rect x="110" y="100" width="80" height="40" rx="2"/>
    <rect x="200" y="100" width="80" height="40" rx="2"/>
  </g>
  <g fill="var(--accent)" opacity="0.5">
    <rect x="20" y="100" width="80" height="40"/>
  </g>
  <g fill="var(--accent-line)" opacity="0.5">
    <rect x="110" y="100" width="80" height="40"/>
  </g>
  <g fill="var(--text)" opacity="0.5">
    <rect x="200" y="100" width="80" height="40" fill="var(--accent)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="60" y="124">Core 0</text>
    <text x="150" y="124">Core 1</text>
    <text x="240" y="124">Core 2</text>
  </g>
  <text x="320" y="124" fill="var(--text-muted)" font-size="9">jádra fyzicky oddělená, vlákna paralelně</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="170" width="280" height="35" rx="2"/>
  </g>
  <g fill="var(--accent)" opacity="0.4">
    <rect x="20" y="170" width="140" height="35"/>
  </g>
  <g fill="var(--accent-line)" opacity="0.4">
    <rect x="160" y="170" width="140" height="35"/>
  </g>
  <text x="160" y="192" text-anchor="middle" fill="var(--text)" font-weight="600">jedno jádro, 2 vlákna paralelně</text>
  <text x="320" y="190" fill="var(--text-muted)" font-size="9">sdílení ALU, RS, ROB, cache</text>
</svg>
:::

### TMT (Temporal MT / Coarse-grained / Interleaved MT)

Jedno jádro, *jedno* vlákno běží v jeden moment. Vlákna se *přepínají* — buď fixed-cycle (interleaved) nebo na *velkou* událost (cache miss).

- **Switch on miss** — vlákno A běží, narazí na L3 miss (200 cyklů). Místo stagnace přepne na vlákno B.
- **Interleaved** — každý takt jiné vlákno (Tera MTA, Sun Niagara T1).

Plus: jednoduchý HW, dobré pro latency hiding.

Minus: žádné *paralelní* využití funkčních jednotek. Single-thread výkon se zhoršuje (čekání v queue).

### CMT (Chip MultiThreading / Multi-core)

Více *fyzických* jader, každé má *1* vlákno. Žádné sdílení uvnitř jádra; sdílení až na úrovni LLC + memory controller.

- Plus: skvělá izolace, žádné side effects mezi vlákny.
- Minus: pokud jedno jádro stagnuje (cache miss), ostatní jádra ho nemůžou pomoct.

Standardní x86, ARM od ~2005. Apple M1 = 4 P-cores + 4 E-cores.

### SMT (Simultaneous MT)

*Jedno* jádro, *víc* vláken **současně** sdílí ALU, RS, ROB, cache. Při každém taktu *dispatcher* vybírá z front *kteréhokoli* vlákna ready instrukce.

Plus: lepší využití existujícího HW. Pokud jedno vlákno čeká na cache, druhé využije ALU.

Minus: sdílení = konkurence o RS, cache, branch predictor. Sometimes jedno vlákno *zpomalí* druhé.

SMT v reálu = **Hyper-Threading** (Intel od Pentium 4, 2002), **SMT2** (IBM POWER), **SMT8** (POWER9).

## Granularita TLP

| Granularita | Velikost práce | Latence synchronizace | Příklad |
| :--- | :--- | :---: | :--- |
| Fine-grained | desítky cyklů | 100 ns | SMT, vector pipelines |
| Medium | μs - ms | 10 μs | OpenMP parallel for |
| Coarse | s - min | 1 ms | MPI, distributed computing |

Pro coarse-grained úloha musí být *dost dlouhá*, aby *amortizovala* synchronizační overhead. Pokud chcete paralelizovat 100 ns sekci, fine-grained TLP nebo SIMD.

## Memory wall a TLP

Memory wall ([[amat-vykon-cache]]) říká: dostupná **bandwidth** roste pomaleji než compute. Více jader na CPU = víc tlaku na memory.

Důsledek: **N×** jader ne vždy znamená **N×** speedup. Při memory-bound zátěži (sparse matrix, BFS) tu bottleneck. Příklad: matrix multiplication na 16 jader → 14× speedup. Vector copy → 4× (memory limited).

⇒ **TLP najde paralelismus, ale fyzicky bandwidth zůstává limit**. Multi-socket NUMA ([[uma-numa]]) přidá víc memory controllers, ale pak je problém *lokality dat*.

## Amdahl pro TLP

Připomenutí [[amdahl-gustafson]]: speedup s N cores limitován *sekvenčním* podílem:

$$
S = \frac{1}{(1 - \alpha) + \alpha / N}
$$

Pro $\alpha = 0.95$ a $N = 64$: $S = 1 / (0.05 + 0.015) = 15{,}4$. **24 % efektivita**.

⇒ S rostoucím počtem jader se *efektivita* snižuje. Reálně 32-64 jader na single program = 30-50 % efektivita typická.

Aplikace s nízkou efektivitou musí *najít* víc paralelismu (lepší algoritmus, větší problém — Gustafson) nebo *přijmout* downgrade.

## Programovací modely pro TLP

| Model | Granularita | Příklad |
| :--- | :--- | :--- |
| Shared address space (SAS) | fine-medium | pthread, OpenMP, C++ std::thread |
| Message passing (MP) | coarse | MPI, Apache Spark |
| Data parallel | fine | OpenMP SIMD, CUDA, OpenCL |
| Task-based | medium | OpenMP task, Cilk, Intel TBB |

Většina dnes: **OpenMP + MPI** pro HPC, **std::thread + atomics** pro user-space. Cloud: ECS / Kubernetes na coarse granularitu.

Detaily v Topic 7-8 ([[paralelni-modely]], [[openmp-uvod]]).

## Co dál

[[tmt-cmt-smt]] popisuje *technické detaily* tří typů HW multithreadingu. [[hyperthreading]] specifikuje Intel HT — single implementation SMT na x86. [[ht-vykon-omezeni]] kvantifikuje, kdy HT pomáhá a kdy *škodí*.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §3.12 + §5; Tullsen, D.M., Eggers, S.J., Levy, H.M.: „Simultaneous Multithreading: Maximizing On-Chip Parallelism" (ISCA 1995, [DOI 10.1145/223982.224449](https://doi.org/10.1145/223982.224449)); Marr, D.T. et al.: „Hyper-Threading Technology Architecture and Microarchitecture" (Intel Technology Journal 6(1), 2002).*
