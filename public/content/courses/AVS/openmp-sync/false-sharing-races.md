---
title: False sharing, race conditions a NUMA effects
---

# False sharing — skrytá pokuta paralelního kódu

False sharing je *cache-level* race condition. Vlákna píší do *různých* proměnných, které *náhodou* leží *na stejné cache line*. Hardware koherence cache je zaměnuje za skutečnou kolizi a vyvolává *cache line ping-pong* — line se opakovaně přenáší mezi jádry.

Žádná race condition v *kódu*, ale dramatický slowdown.

## Příklad — counts per thread

```c
int counts[8];   // 8 ints = 32 B, jedna cache line je 64 B

#pragma omp parallel num_threads(8)
{
    int id = omp_get_thread_num();
    for (int i = 0; i < N; i++) {
        counts[id]++;       // each thread updates own slot
    }
}
```

Vypadá *naprosto bezpečně*. Každé vlákno updatuje *vlastní* slot — žádná logická kolize.

Realita: `counts[0..7]` *všechny* na *jedné* cache line. Při T0 update `counts[0]`:

1. Line dirty na core 0's L1.
2. Core 1 chce update `counts[1]` — *musí* dostat line *exclusive*.
3. Cache koherence ([[koherence-uvod]]) *invaliduje* line z core 0, transferuje na core 1.
4. T2 chce `counts[2]` → line jde na core 2.
5. ...

Round-robin: každé update line jezdí mezi jádry. Single update = 50-100 cyklů (cache transfer) místo 1 cyklu (L1 hit).

⇒ Performance **10-100× horší** než sériový kód.

::: svg "False sharing — cache line ping-pong"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="30" width="80" height="50" rx="3"/>
    <rect x="120" y="30" width="80" height="50" rx="3"/>
    <rect x="220" y="30" width="80" height="50" rx="3"/>
    <rect x="320" y="30" width="80" height="50" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="60" y="50">Core 0 L1</text>
    <text x="160" y="50">Core 1 L1</text>
    <text x="260" y="50">Core 2 L1</text>
    <text x="360" y="50">Core 3 L1</text>
  </g>
  <text x="60" y="68" text-anchor="middle" fill="var(--text-muted)" font-size="9">counts[0]</text>
  <text x="160" y="68" text-anchor="middle" fill="var(--text-muted)" font-size="9">counts[1]</text>
  <text x="260" y="68" text-anchor="middle" fill="var(--text-muted)" font-size="9">counts[2]</text>
  <text x="360" y="68" text-anchor="middle" fill="var(--text-muted)" font-size="9">counts[3]</text>
  <g stroke="var(--accent-line)" fill="none" stroke-width="1.5">
    <path d="M100,55 Q160,15 220,55" marker-end="url(#fsh-ar)"/>
    <path d="M200,55 Q260,15 320,55" marker-end="url(#fsh-ar)"/>
    <path d="M300,55 Q360,15 420,55" marker-end="url(#fsh-ar)"/>
  </g>
  <text x="270" y="100" text-anchor="middle" fill="var(--accent-line)" font-size="10">cache line ping-pong (invalidace + transfer)</text>
  <g fill="var(--bg-card)" stroke="var(--accent)">
    <rect x="20" y="130" width="500" height="40" rx="3"/>
  </g>
  <text x="270" y="148" text-anchor="middle" fill="var(--text)" font-weight="600">jediná 64-byte cache line obsahuje counts[0..7]</text>
  <text x="270" y="162" text-anchor="middle" fill="var(--text-muted)" font-size="9">Hardware zaměňuje per-element updates za sdílení celé line</text>
  <text x="270" y="210" text-anchor="middle" fill="var(--text-faint)" font-size="9">Důsledek: 50-100 cyklů per update místo 1 — slowdown řádově</text>
  <defs>
    <marker id="fsh-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent-line)"/>
    </marker>
  </defs>
</svg>
:::

::: viz false-sharing-pingpong "Spusť 4 jádra ťukající na counts[0..3]. Bez paddingu cache line ping-pongne (červené šipky); s paddingem každý core má vlastní line a throughput vyletí."
:::

## Detekce

### Symptomy

- Multi-thread *pomalejší* než single-thread, *bez* explicit lock.
- Cache line transfer rate v perf counters extrémní.
- L1D miss rate vysoký (50+ %), ne kvůli pracovní množině.

### Perf counters

```bash
perf stat -e l1d.replacement,l2_rqsts.all_demand_miss,mem_inst_retired.lock_loads ...
```

`mem_inst_retired.lock_loads` ukazuje atomic operations + cache line invalidations.

Intel VTune ukazuje *exactly* problematic lines via "Memory access pattern" report.

## Řešení

### 1. Padding to cache line

```c
struct {
    int count;
    char padding[60];        // total 64 B
} counts[8] __attribute__((aligned(64)));
```

Každý `count` na vlastní line. False sharing zmizí.

Cost: paměť (8× 64 B = 512 B místo 32 B). Pro malé arrays trivial.

### 2. Local accumulator + merge

```c
int total_counts[8] = {0};

#pragma omp parallel
{
    int local = 0;
    #pragma omp for nowait
    for (int i = 0; i < N; i++) {
        if (a[i] == 0) local++;
    }
    int id = omp_get_thread_num();
    #pragma omp atomic
    total_counts[id] += local;
}
```

Per-thread `local` (stack) → žádná shared. Merge once na konci.

### 3. Reduction

```c
int count = 0;
#pragma omp parallel for reduction(+:count)
for (int i = 0; i < N; i++)
    if (a[i] == 0) count++;
```

Best for scalar accumulator. *Compiler-generated* per-thread accumulators, no false sharing.

### 4. Re-design data structure

Pokud máte struct s *concurrently accessed* fields:

```c
// Bad:
struct Stats {
    int reads, writes, errors;    // 12 B, 1 cache line
};

// Better:
struct Stats {
    int reads;
    char pad1[60];
    int writes;
    char pad2[60];
    int errors;
};

// Or split:
struct ReadStats { int reads; };       // 1 cache line each
struct WriteStats { int writes; };
struct ErrorStats { int errors; };
```

## Race conditions — classical

False sharing je *performance* race. *Classical* race = *correctness* race:

```c
int counter = 0;
#pragma omp parallel for
for (int i = 0; i < N; i++)
    counter++;        // RACE — lost updates
```

Without `atomic` or `reduction`, výsledek **less than N** (lost updates).

### Race vs. false sharing

| | Race | False sharing |
| :--- | :--- | :--- |
| Affects | correctness | performance |
| Detected by | wrong output | profiling |
| Fix | atomic / lock | padding / split |
| Synonyms | data race, lost update | cache line contention |

Race může nastat *bez* false sharing (atomic single variable). False sharing může nastat *bez* race (each thread own slot).

## NUMA effects

V NUMA systému ([[uma-numa]]) memory access cost závisí na *fyzickém umístění*:

- Local NUMA node: 80 cyklů.
- Remote NUMA node: 200-300 cyklů.

Pokud data alokovaná thread T0 na NUMA 0, ale T1 na NUMA 1 ji *čte/zapisuje* → 3× pomalejší. To je *NUMA penalty*.

### First-touch policy

Linux defaultně používá **first-touch**: stránka alokovaná na *NUMA node thread that first touches it*.

```c
float *a = malloc(N * sizeof(float));
// Page NOT yet allocated — just virtual mapping

#pragma omp parallel for
for (int i = 0; i < N; i++)
    a[i] = 0.0;          // first touch — page allocated on local NUMA
```

Pokud `parallel for` rozdělí iterace mezi NUMA nodes, *každá stránka* je alokovaná na NUMA local k *jejímu* thread. Subsequent access fast.

**Bad pattern**: alokace + init *single-threaded*, then parallel use → vše na 1 NUMA → bottleneck.

### NUMA-aware allocation

```bash
numactl --cpunodebind=0 --membind=0 ./prog
```

Force allocation + execution na NUMA 0. Vyhne se cross-NUMA traffic.

Pro programmable: `numa_alloc_local()`, `numa_alloc_onnode(size, node)`.

OpenMP 5.0+: `affinity` clause v tasks lze tunit pro NUMA locality.

## Atomic instructions cost

`#pragma omp atomic` vyžaduje cache line *exclusive* — koherence protocol musí line invalidovat z jiných cores.

Cost na typickém hardware:

- L1 hit + no other sharers: 5-10 cyklů.
- Line shared with neighbors: 100-300 cyklů (invalidation broadcast).
- Cross-NUMA: 500+ cyklů.

⇒ Atomic v hot loop *na shared variable* = bottleneck. Per-thread accumulator + merge je řád lepší.

## Co dál

Topic 8 končí. Topic 9 ([[koherence-uvod]]) přechází k *cache koherence* na *hardware* level — protokoly MESI/MOESI, snooping vs directory. Pak [[uma-numa]] popíše NUMA topologie v detailu.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Drepper, U.: „What Every Programmer Should Know About Memory" (Red Hat 2007, [PDF](https://www.akkadia.org/drepper/cpumemory.pdf)); Bolosky, W.J., Scott, M.L.: „False Sharing and Its Effect on Shared Memory Performance" (Sedms IV 1993); Chapman, B., Jost, G., van der Pas, R.: „Using OpenMP" (MIT Press 2008), §7 (Performance).*
