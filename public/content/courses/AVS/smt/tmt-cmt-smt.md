---
title: TMT, CMT a SMT — taxonomie multithreadingu
---

# TMT, CMT, SMT — taxonomie HW multithreadingu

Existují tři klasické způsoby, jak CPU může poskytovat *hardware support* pro paralelní vlákna. Liší se v *sdílení zdrojů* (které části jádra sdílí vlákna) a *granularitě* přepínání (jak často se vlákno mění).

## Časový multithreading (TMT)

Vlákna se *střídají v čase* na jednom jádře. Dva podtypy:

### Coarse-grained (switch on miss)

Vlákno A běží, dokud nenarazí na *velkou* událost (L2/L3/DRAM miss, page fault). Pak hardware *přepne* na vlákno B.

- **Plus**: skrývá memory latency (latency hiding). 200-cyklová DRAM stagnace se vyplní jiným vláknem.
- **Minus**: pokuta přepnutí ~10 cyklů (flush pipeline, swap PC/regs).
- **Příklad**: IBM Northstar, RS64 III. Sun UltraSPARC T1 (Niagara, 2005).

### Fine-grained (interleaved)

Každý takt jiné vlákno. CPU má *N hardware contexts* a *round-robin* je střídá.

- **Plus**: pipeline *vždy plná*, žádné stagnace per-thread.
- **Minus**: každé vlákno individuálně **slow** (8 vláken → 1/8 fetch rate per thread). 
- **Příklad**: Sun Niagara T1 (8 threads/core), Tera MTA (1990s).

V obou případech: *v jednom okamžiku* jen *jedno* vlákno *vykonává*. Funkční jednotky nesdílené.

## CMT (Chip MultiThreading / Multi-core)

*N* fyzických jader, každé má *1 vlákno*. Sdílí jen LLC + memory controller na vrcholu hierarchie.

- **Plus**: žádné interferenční problémy. Predictable performance. Linear scaling.
- **Minus**: drahé (více tranzistorů). Pokud N jader > workload, idle cores plýtvají.
- **Příklad**: standardní x86, ARM od ~2005. Apple M1 (4+4), AMD Ryzen 9 (16 jader).

CMT je dnes **dominantní paradigma**. Marketing: "more cores".

## SMT (Simultaneous Multi-Threading)

*Jedno* fyzické jádro, *N* vláken **současně**. *Sdílí* ALU, RS, ROB, register file, cache. Při každém taktu *fetch + dispatch* z **kteréhokoli** vlákna's ready instructions.

::: svg "SMT — instruction-level interleaving"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <text x="20" y="22" fill="var(--text)" font-weight="600">Cycle:</text>
  <g fill="var(--text)" font-size="10">
    <text x="80" y="22">1</text>
    <text x="130" y="22">2</text>
    <text x="180" y="22">3</text>
    <text x="230" y="22">4</text>
    <text x="280" y="22">5</text>
    <text x="330" y="22">6</text>
    <text x="380" y="22">7</text>
    <text x="430" y="22">8</text>
    <text x="480" y="22">9</text>
  </g>
  <text x="20" y="50" fill="var(--text)" font-weight="600">Fetch slot 0:</text>
  <g fill="var(--accent)" opacity="0.6" stroke="var(--accent)">
    <rect x="70" y="35" width="40" height="22"/>
    <rect x="170" y="35" width="40" height="22"/>
    <rect x="270" y="35" width="40" height="22"/>
    <rect x="420" y="35" width="40" height="22"/>
  </g>
  <g fill="var(--accent-line)" opacity="0.6" stroke="var(--accent-line)">
    <rect x="120" y="35" width="40" height="22"/>
    <rect x="220" y="35" width="40" height="22"/>
    <rect x="320" y="35" width="40" height="22"/>
    <rect x="370" y="35" width="40" height="22"/>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="470" y="35" width="40" height="22"/>
  </g>
  <text x="20" y="75" fill="var(--text)" font-weight="600">Fetch slot 1:</text>
  <g fill="var(--accent)" opacity="0.6" stroke="var(--accent)">
    <rect x="70" y="60" width="40" height="22"/>
    <rect x="170" y="60" width="40" height="22"/>
    <rect x="370" y="60" width="40" height="22"/>
  </g>
  <g fill="var(--accent-line)" opacity="0.6" stroke="var(--accent-line)">
    <rect x="120" y="60" width="40" height="22"/>
    <rect x="220" y="60" width="40" height="22"/>
    <rect x="270" y="60" width="40" height="22"/>
    <rect x="320" y="60" width="40" height="22"/>
    <rect x="420" y="60" width="40" height="22"/>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="470" y="60" width="40" height="22"/>
  </g>
  <g fill="var(--text-muted)" font-size="9">
    <text x="530" y="55" text-anchor="end">vlákno A (modré) / B (zelené)</text>
    <text x="530" y="80" text-anchor="end">interleaved per cycle, oba slots in dispatch</text>
  </g>
  <text x="20" y="105" fill="var(--text)" font-weight="600">ALU 0:</text>
  <g fill="var(--accent)" opacity="0.6">
    <rect x="70" y="90" width="40" height="22"/>
    <rect x="220" y="90" width="40" height="22"/>
    <rect x="320" y="90" width="40" height="22"/>
  </g>
  <g fill="var(--accent-line)" opacity="0.6">
    <rect x="120" y="90" width="40" height="22"/>
    <rect x="170" y="90" width="40" height="22"/>
    <rect x="270" y="90" width="40" height="22"/>
  </g>
  <text x="20" y="130" fill="var(--text)" font-weight="600">ALU 1:</text>
  <g fill="var(--accent-line)" opacity="0.6">
    <rect x="70" y="115" width="40" height="22"/>
    <rect x="170" y="115" width="40" height="22"/>
  </g>
  <g fill="var(--accent)" opacity="0.6">
    <rect x="120" y="115" width="40" height="22"/>
    <rect x="220" y="115" width="40" height="22"/>
  </g>
  <text x="20" y="160" fill="var(--text)" font-weight="600">L/S:</text>
  <g fill="var(--accent)" opacity="0.6">
    <rect x="270" y="145" width="80" height="22"/>
  </g>
  <text x="310" y="160" text-anchor="middle" fill="white" font-size="9">A cache miss</text>
  <g fill="var(--accent-line)" opacity="0.6">
    <rect x="370" y="145" width="80" height="22"/>
  </g>
  <text x="410" y="160" text-anchor="middle" fill="white" font-size="9">B cache miss</text>
  <text x="270" y="195" fill="var(--text-faint)" font-size="9" text-anchor="middle">Souběžné využití FJ — A i B pracují paralelně, dokud nečekají na cache</text>
</svg>
:::

### Sdílené zdroje

V SMT vlákna sdílí:

- **Front-end**: I-cache, BTB, BHT, decode, rename.
- **Back-end**: RS, ROB, ALU, FPU, L/S unit.
- **Caches**: L1, L2, L3 (per process address space — no separation).

Per-thread:

- **PC** (program counter) — kde je v kódu.
- **Architectural register state** — copy ARF per thread.
- **TLB entries** (often tagged per thread).

⇒ Po hardware perspektivě SMT je *ekonomický*: ~5 % víc tranzistorů než 1-thread jádro, ale potenciálně 30-50 % víc throughput.

## Tabulka srovnání

| | TMT | CMT | SMT |
| :--- | :---: | :---: | :---: |
| Cores / chip | 1 | N | 1 |
| Threads / core | N | 1 | N |
| ALU sdílené mezi threads | ne (čas) | ne | **ano** |
| Cache sdílené | ano (single core) | jen LLC | L1+L2 (per core) |
| Per-thread context | shared register file | private | **partial** (PC, ARF copy) |
| Vícenásobné instrukce / takt | ne | ano (každé per core) | **ano** |
| Plocha overhead | nízká | velká (per core) | nízká (~5%) |
| Single-thread perf | rovna | vysoká | mírně nižší (~10-15%) |
| Throughput | dobrá pro latency hiding | linear scaling | best per area |

## Reálné implementace

| CPU | Architektura | Typ |
| :--- | :--- | :--- |
| Sun Niagara T1 (2005) | 8 core × 4 thread | TMT (fine-grained) |
| Intel Pentium 4 (2002) | 1 core × 2 thread | SMT (Hyper-Threading) |
| Intel Xeon Phi KNL (2016) | 64-72 cores × 4 thread | SMT (4-way) |
| IBM POWER9 (2017) | 24 cores × 8 thread | SMT8 |
| AMD Zen 4 (2022) | 16 cores × 2 thread | CMT + SMT |
| Apple M1 (2020) | 4 P + 4 E cores × 1 thread | **only CMT, no SMT** |

Apple záměrně nemá SMT — důvod: lepší kontrola nad single-thread latencí + bezpečnost (vyhne se Spectre-like attacks mezi threads).

## Programovatelnost

Z OS pohledu:

- **TMT** — *N hardware threads* per core. OS scheduler vidí stejně jako N jader.
- **CMT** — *N cores*, každé je samostatné.
- **SMT** — *N logical CPUs* per fyzické jádro. OS musí vědět *cache lokalitu* (sibling threads sdílí cache).

Linux: `lscpu` ukáže "Thread(s) per core". `numactl --hardware` ukáže topologie. OS scheduler (CFS) preferuje "spread to physical cores first" — nasadit vlákna na *různá* jádra, jen pokud nutné použít sibling threads.

## Performance counters

Pro debug SMT efektivity:

```bash
perf stat -e cpu_clk_unhalted,uops_executed.x,cycle_activity.stalls_total ...
```

- **uops_executed.thread.x** — kolik mikroinstrukcí thread X provedl.
- **cycle_activity.stalls_total** — kolik cyklů thread čekal.

V *good* SMT scenario: oba sibling threads mají vysoké uops_executed → ALU plně využité.

V *bad* scenario: jeden thread dominantní (eviktuje druhého z cache), druhý čeká.

## Co dál

[[hyperthreading]] popisuje *Intel Hyper-Threading* — konkrétní implementace SMT. [[ht-vykon-omezeni]] kvantifikuje, kdy HT *pomáhá* (latency-hiding zátěž) a kdy *škodí* (compute-bound s cache pressure).

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §3.12; Tullsen, D.M., Eggers, S.J., Levy, H.M.: „Simultaneous Multithreading: Maximizing On-Chip Parallelism" (ISCA 1995); Eggers, S.J. et al.: „Simultaneous Multithreading: A Platform for Next-Generation Processors" (IEEE Micro 17(5), 1997).*
