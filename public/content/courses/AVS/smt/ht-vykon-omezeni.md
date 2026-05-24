---
title: Výkon a omezení Hyper-Threading
---

# Kdy HT pomáhá a kdy škodí — kvantitativní analýza

Hyper-Threading není free lunch. Empiricky:

- **+30-40 %** throughput pro mixed/server workloads (web, DB).
- **-10 až +20 %** pro HPC compute-bound (matrix mul, FFT).
- **Občas -5-15 %** single-thread perf (cache contention).

Tato sekce kvantifikuje *proč*.

## Dva sources of speedup

SMT exceluje, když:

1. **Jeden thread často stagnuje** (cache miss, branch miss, dep chain). Druhý vyplní díry.
2. **ALU underutilized** (typický OoO has < 50 % ALU utilization na single-thread).

Druhý je *underappreciated*. Reálné měření: Intel Skylake na SPEC integer dosahuje ~2.5 IPC z teoretických 6. ALU running ~40 % cyclu. HT může vyplnit chybějících 60 %.

## Dva sources of slowdown

SMT trpí, když:

1. **Cache contention** — dva threads eviktují svá data navzájem.
2. **Functional unit contention** — pro compute-bound oba chcou *stejnou* FU.
3. **Pipeline contention** — fetch / dispatch / RS soutěží.
4. **Branch predictor pollution** — A trénuje BHT na patternu, který B *ruší*.

## Důkaz #1: Dvě vlákna v HT počítají déle

Typický srovnávací příklad:

```
Scenario 1: Dva singly-threaded jobs na 1 core × HT.
Scenario 2: Stejné dva jobs na 2 cores, no HT.

Scenario 2 wins by ~20-30 % (lepší cache use, no FU contention).
```

⇒ HT *nikdy* nedosáhne 2× single-thread perf. Hard ceiling.

## Důkaz #2: Cache pressure

Klasické měření: working set just under L1 size.

Single thread: working set ~30 kB fits do 32 kB L1 → 99 % L1 hit rate.

Two threads (HT): 30 + 30 = 60 kB > 32 kB. Threads eviktují navzájem → L1 hit rate **50-70 %**. AMAT vystřelí.

Throughput celkový: 1.4× single (slight win), ale per-thread: 0.7×.

Pro úlohy near cache boundary HT *neefektivní*.

## Důkaz #3: FU contention

Matrix multiply má dominantní FMA throughput requirement. Single thread plně využívá FMA pipeline → ~1.0 FMA / cycle.

Two threads (HT) bojují o stejnou FMA → každý ~0.55 FMA / cycle. Throughput total 1.1 (10% win) vs ideal 2.0.

Pokud thread B *není* FMA-bound (lots of branches, cache misses), HT lépe — A FMA, B nezasahuje. Sweet spot.

## Performance counters

Pro diagnose:

```bash
perf stat -e cpu_clk_unhalted.thread,uops_executed.thread,\
            l1d.replacement,br_misp_retired.all_branches,\
            cycle_activity.stalls_total ...
```

Klíčové metriky:

- **uops_executed.thread / cpu_clk_unhalted.thread** = IPC per thread.
- **l1d.replacement** = L1 evictions. HT zvyšuje.
- **cycle_activity.stalls_total** = stagnace.

Pokud po HT: IPC each = 60-70 % single → HT win. Pokud IPC each = 40-50 % → HT *win marginálně* (sum still > single, ale per-thread suffering).

Pokud po HT: l1d.replacement >> single → cache thrashing.

## Decision tree: turn HT on/off

```
1. Single-thread latency critical? (trading, real-time)
   → OFF

2. Cache-sensitive code? (working set ~L1, B-tree, hash table)
   → Test both, often OFF wins.

3. Compute-bound, fully vectorized? (matmul, FFT, AVX-512 heavy)
   → OFF usually wins (FU contention).

4. Mixed workload? (server, browser, IDE)
   → ON definitely.

5. Memory-bound? (graph BFS, sparse matrix)
   → ON (latency hiding).

6. Container/VM tenant isolation important?
   → Consider OFF for security (post-Foreshadow).
```

## Pinning a affinity

Pokud nechcete HT vypnout, ale potřebujete *predictable* perf:

```bash
taskset -c 0,1,2,3 ./hpc_app    # pin to fyzicky 0-3 (sibling threads 4-7 prázdné)
```

Linux scheduler nedá `taskset` jiných vláken na *sibling threads* prvních 4. Efektivně používáte HT *jen* pro mainstream tasks.

GCC OpenMP:

```bash
OMP_PLACES=cores OMP_PROC_BIND=close ./hpc_app
```

`OMP_PLACES=cores` znamená 1 thread per fyzické jádro (ignoruje siblings).

`OMP_PLACES=threads` = use HT also.

## Hyperthreading + NUMA

V multi-socket systémech kombinace:

- Logical CPU 0-7 na socket 0, core 0-3 (HT).
- Logical CPU 8-15 na socket 0, core 4-7 (HT).
- Logical CPU 16-23 na socket 1, core 0-3 (HT).

Pinning thread na *correct* core (NUMA local) klíčové. HT je jen mírná modifikace tohoto plánu.

Detaily v Topic 9 ([[uma-numa]]).

## ARM big.LITTLE alternativa

ARM (a Apple) řeší TLP přes **big.LITTLE** — 2 typy jader, ne SMT:

- **Big cores** — high-perf OoO, energy-hungry.
- **LITTLE cores** — small in-order, energy-efficient.

OS scheduler rozděluje: latency-sensitive tasks na big, background na LITTLE. Energy gains *velké* (5-10× lepší perf/watt) ve smartphone/laptop scenarios.

Apple M1: 4 P + 4 E. Intel Alder Lake (2021) převzal myšlenku: P + E cores. Po dlouhé éře "all the same" cores teď heterogenní design.

big.LITTLE *nemá* SMT-style sharing v jádře. Cleaner power model.

## SMT4, SMT8 — extrémy

IBM POWER9 = **SMT8** (8 vláken / core). Velikost ROB ~256 → 32 per thread. Sdílení ALU intense.

Use case: server workloads s extreme latency (databáze running indexed queries, banking transactions). Throughput per chip extreme.

Intel Xeon Phi Knights Landing (2016) = SMT4. Důvod: 1.4 GHz, in-order pipeline → SMT skryje latency.

Mainstream desktop: SMT2 (HT) je sweet spot. Vyšší SMT levels zhoršují single-thread bez kompenzace.

## Co dál

Topic 6 končí. Topic 7 ([[paralelni-modely]], [[openmp-uvod]]) přechází k *software*: programovací modely pro TLP — sdílená paměť, message passing, datový paralelismus. OpenMP poskytuje high-level API.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §3.12 + §5.5; Bulpin, J.R., Pratt, I.A.: „Hyper-Threading Aware Process Scheduling Heuristics" (USENIX 2005); Schwartzman, A.: „A Study of HyperThreading Impact on HPC Workloads" (LANL TR LA-UR-15-26516, 2015); Intel® 64 and IA-32 Architectures Optimization Reference Manual.*
