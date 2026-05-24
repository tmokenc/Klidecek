---
title: parallel for — scheduling, chunk, dynamic
---

# OpenMP parallel for — distribuce iterací mezi vlákna

`#pragma omp parallel for` je *workhorse* OpenMP — paralelizuje smyčku, automaticky rozdělí iterace mezi tým vláken. Klíčové rozhodnutí: **scheduling policy** — *jak* rozdělit iterace.

## Základní syntax

```c
#pragma omp parallel for
for (int i = 0; i < N; i++)
    a[i] = b[i] + c[i];
```

Compiler vygeneruje:

1. Fork team of T threads.
2. Rozdělí iterace `0..N-1` mezi T vláken.
3. Každé vlákno provede svou *chunk* iterací.
4. Implicit barrier na konci.

## Co potřebuje smyčka

Aby OpenMP mohl paralelizovat:

1. **Canonical form** — `for (i = init; i < limit; i++)` (nebo `+=, -=, *=`). Žádné `while`.
2. **Trip count knowable** — `limit` a `step` deterministické.
3. **Žádné loop-carried dependence** — `a[i]` nesmí záviset na `a[i-1]`.
4. **Žádné early exit** — `break`, `return`, `goto`. *Continue* OK.

Pokud nesplněno, GCC odmítne s warning. Programátor musí *přepsat*.

## Schedule clauses

```c
#pragma omp parallel for schedule(<kind>, <chunk_size>)
```

Pět druhů:

### static

```c
#pragma omp parallel for schedule(static)
```

Iterace rozděleny **rovnoměrně** na začátku. Pro N = 100, T = 4: thread 0 dostane 0-24, thread 1 dostane 25-49, atd.

Pokud `chunk_size` specified: round-robin chunks of that size.

```c
#pragma omp parallel for schedule(static, 16)
// thread 0: 0-15, 64-79, ...
// thread 1: 16-31, 80-95, ...
```

- **Pro**: nulový runtime overhead, predictable.
- **Proti**: pokud iterace mají *nerovnou* dobu, někteří dělníci čekají.
- **Best for**: regular numeric loops (matrix multiply, FFT).

### dynamic

```c
#pragma omp parallel for schedule(dynamic, chunk_size)
```

Iterace přidělovány *runtime* — vlákno *dokončí* chunk a *poprosí* o další. Load balancing.

```c
#pragma omp parallel for schedule(dynamic, 16)
// Each thread fetches chunk of 16 iterations from work queue
// When done, fetch next 16
```

- **Pro**: skvělé load balancing pro irregular work.
- **Proti**: runtime overhead (queue, atomic decrement). Vyšší cache miss (chunks rotují mezi vlákny).
- **Best for**: nerovnoměrná zátěž (sparse matrix, recursive task).

Chunk size matters:

- Příliš malý (1) → overhead dominantní.
- Příliš velký (N/T) → equivalent static.
- Sweet spot 8-64 typically.

### guided

```c
#pragma omp parallel for schedule(guided, chunk_size)
```

*Hybrid*: začne s velkými chunks, snižuje k chunk_size. Iterace dynamicky přidělované.

Algoritmus: zbývajících iterací / (T × constant). Klesá k chunk_size.

- **Pro**: kompromis mezi static a dynamic — méně overhead než dynamic, lepší balance než static.
- **Proti**: nepředvídatelné chování.
- **Best for**: mírně nerovná zátěž.

### auto

```c
#pragma omp parallel for schedule(auto)
```

Runtime rozhodne. Skutečné chování závisí na kompilátoru/runtime.

### runtime

```c
#pragma omp parallel for schedule(runtime)
```

Použij `OMP_SCHEDULE` env var. Praktické pro tuning bez recompile.

## Srovnání

::: svg "Static vs dynamic scheduling — load balance"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <text x="20" y="20" fill="var(--text)" font-weight="600">static — uniform partition, but load imbalanced</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="30" width="120" height="22" rx="2"/>
    <rect x="145" y="30" width="120" height="22" rx="2"/>
    <rect x="270" y="30" width="120" height="22" rx="2"/>
    <rect x="395" y="30" width="120" height="22" rx="2"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="80" y="45">T0: 25 iter</text>
    <text x="205" y="45">T1: 25 iter</text>
    <text x="330" y="45">T2: 25 iter</text>
    <text x="455" y="45">T3: 25 iter</text>
  </g>
  <g fill="var(--accent)" opacity="0.4">
    <rect x="20" y="30" width="40" height="22"/>
    <rect x="145" y="30" width="120" height="22"/>
    <rect x="270" y="30" width="50" height="22"/>
    <rect x="395" y="30" width="80" height="22"/>
  </g>
  <text x="270" y="68" text-anchor="middle" fill="var(--text-muted)" font-size="9">work time: T1 = full, T0 = ¼, T2 = ¼, T3 = ⅔ → wasted parallelism</text>
  <text x="20" y="100" fill="var(--text)" font-weight="600">dynamic, chunk=8 — load balanced</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="110" width="120" height="22" rx="2"/>
    <rect x="145" y="110" width="120" height="22" rx="2"/>
    <rect x="270" y="110" width="120" height="22" rx="2"/>
    <rect x="395" y="110" width="120" height="22" rx="2"/>
  </g>
  <g fill="var(--accent)" opacity="0.4">
    <rect x="20" y="110" width="100" height="22"/>
    <rect x="145" y="110" width="100" height="22"/>
    <rect x="270" y="110" width="100" height="22"/>
    <rect x="395" y="110" width="100" height="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="80" y="125">T0: dynamic</text>
    <text x="205" y="125">T1: dynamic</text>
    <text x="330" y="125">T2: dynamic</text>
    <text x="455" y="125">T3: dynamic</text>
  </g>
  <text x="270" y="148" text-anchor="middle" fill="var(--text-muted)" font-size="9">work time: ~stejný pro všechny, ale runtime queue overhead</text>
  <text x="20" y="195" fill="var(--text-faint)" font-size="9">Sweet spot: chunk dostatečně velký, aby amortizoval overhead, dost malý pro balance</text>
</svg>
:::

::: viz omp-scheduling-comparator "Vyber workload (triangulární / skewed / uniform). Gantt 4 vláken pro 4 schedule strategie — idle čas červeně, % balance vlevo. Dynamic/guided minimalizují čekání."
:::

## Decision tree

```
Loop work per iteration roughly constant?
├── YES → schedule(static)
└── NO → 
    ├── Variation predictable (e.g. each iteration is O(i)) → schedule(static, large_chunk)
    └── Variation random (e.g. work depends on data) → schedule(dynamic, chunk_size)
        └── chunk_size = 4-64 typically; tune empirically
```

## Nowait

Default: implicit barrier na konci `parallel for`. Můžete *vypnout*:

```c
#pragma omp parallel
{
    #pragma omp for nowait
    for (int i = 0; i < N; i++) phase1(i);
    
    // bez barrier — vlákna pokračují k phase2 jakmile end of phase1
    
    #pragma omp for
    for (int i = 0; i < N; i++) phase2(i);
}
```

Pokud `phase2` *nezávisí* na `phase1` výsledcích, `nowait` ušetří barrier. Při skewed phase1 (some thread slower), `nowait` umožní fast threads start phase2 dřív.

## Collapse

Pro *vnořené* smyčky, OpenMP defaultně paralelizuje **jen** vnější:

```c
#pragma omp parallel for
for (int i = 0; i < N; i++)             // paralelizovaná
    for (int j = 0; j < M; j++)         // sekvenční per thread
        a[i][j] = b[i][j];
```

Pokud N malé (např. 4) a M velké (1000000), parallelism jen ×4. **Collapse** zploští:

```c
#pragma omp parallel for collapse(2)
for (int i = 0; i < N; i++)
    for (int j = 0; j < M; j++)
        a[i][j] = b[i][j];
```

Teď iteruje přes `N × M` iterací paralelně. Pro 4×1000000 = 4M iterací → distribuovaných mezi T vláken.

Limit `collapse(k)`: vnořené smyčky musí být *rektangulární* (limity nezávislé na vnějších proměnných) a *bez instrukcí mezi*.

## Loop transformations

OpenMP 5.0+ direktivy `tile`, `unroll`, `permute`:

```c
#pragma omp tile sizes(4, 8)
for (int i = 0; i < N; i++)
    for (int j = 0; j < M; j++)
        ...

#pragma omp unroll
for (int i = 0; i < 8; i++)
    ...
```

Tile (blocking) optimization for cache. Unroll for ILP. Před OpenMP 5 to bylo kompilátorové property (`-funroll-loops`); teď je standardizováno.

## SIMD-aware parallel for

```c
#pragma omp parallel for simd
for (int i = 0; i < N; i++)
    a[i] = b[i] * c[i];
```

Kombinace: paralelizace mezi vlákna **+** vektorizace uvnitř. Pro AXPY na 8 jader + AVX2: speedup ~64×.

GCC s `-O3 -fopenmp -march=native` zahrnuje SIMD pragma efektivně.

## Co dál

[[datova-prostredi]] popisuje *data sharing* klauzule: private / shared / reduction. To je kritické pro správnost paralelního kódu (race conditions, false sharing).

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Chapman, B., Jost, G., van der Pas, R.: „Using OpenMP" (MIT Press 2008); [OpenMP 5.2 Specification](https://www.openmp.org/specifications/), §11; Süß, M., Leopold, C.: „Common Mistakes in OpenMP and How to Avoid Them" (IWOMP 2008).*
