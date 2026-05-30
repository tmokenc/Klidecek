---
title: OpenMP tasks — dynamický paralelismus
---

# OpenMP tasks — dynamický paralelismus

`parallel for` a `sections` jsou *statické* — počet iterací / sekcí znám předem. Pro *dynamický* paralelismus (recursive trees, irregular work, producer-consumer) je třeba **task** direktiva. OpenMP 3.0 (2008) ji zavedla; OpenMP 4.0 přidala dependencies; OpenMP 5.0 detaše a affinity.

## task — vytvoření úkolu

```c
#pragma omp task [clauses]
do_work();
```

Vytváří **task** — *odlišitelná* jednotka práce. Tým vláken si tasks bere z **fronty**.

### Příklad — recursive Fibonacci

```c
int fib(int n) {
    if (n < 2) return n;
    int x, y;

    #pragma omp task shared(x)
    x = fib(n - 1);

    #pragma omp task shared(y)
    y = fib(n - 2);

    #pragma omp taskwait     // počkej na oba
    return x + y;
}

int main() {
    int result;
    #pragma omp parallel
    {
        #pragma omp single
        result = fib(30);    // master spawns task tree
    }
}
```

Klíčový pattern:

1. `#pragma omp parallel` vytvoří tým.
2. `#pragma omp single` — jen jedno vlákno (master typicky) *začne* recursion.
3. `#pragma omp task` — *vytvoří* task pro `fib(n-1)`, `fib(n-2)`. Free workers ho *vykonají*.
4. `#pragma omp taskwait` — počkej, dokud všechny "child" tasks nedokončí.

⇒ Recursive parallelism *bez* manuální správa thread pool.

## task lifecycle

::: svg "Task model — fronta a worker threads"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10">
  <text x="20" y="20" fill="var(--text)" font-weight="600">Tým vláken (workers)</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="30" width="100" height="35" rx="3"/>
    <rect x="125" y="30" width="100" height="35" rx="3"/>
    <rect x="230" y="30" width="100" height="35" rx="3"/>
    <rect x="335" y="30" width="100" height="35" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70" y="50">T0</text>
    <text x="175" y="50">T1</text>
    <text x="280" y="50">T2</text>
    <text x="385" y="50">T3</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <path d="M70,65 L70,90" marker-end="url(#task-arrow)"/>
    <path d="M175,65 L175,90" marker-end="url(#task-arrow)"/>
    <path d="M280,65 L280,90" marker-end="url(#task-arrow)"/>
    <path d="M385,65 L385,90" marker-end="url(#task-arrow)"/>
  </g>
  <g fill="var(--accent)" opacity="0.15" stroke="var(--accent)">
    <rect x="20" y="100" width="500" height="60" rx="4"/>
  </g>
  <text x="270" y="120" text-anchor="middle" fill="var(--text)" font-weight="600">Task queue</text>
  <g fill="var(--bg-card)" stroke="var(--accent)">
    <rect x="40" y="125" width="50" height="25" rx="3"/>
    <rect x="100" y="125" width="50" height="25" rx="3"/>
    <rect x="160" y="125" width="50" height="25" rx="3"/>
    <rect x="220" y="125" width="50" height="25" rx="3"/>
    <rect x="280" y="125" width="50" height="25" rx="3"/>
    <rect x="340" y="125" width="50" height="25" rx="3"/>
    <rect x="400" y="125" width="50" height="25" rx="3"/>
    <rect x="460" y="125" width="50" height="25" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="65" y="142">T_1</text>
    <text x="125" y="142">T_2</text>
    <text x="185" y="142">T_3</text>
    <text x="245" y="142">T_4</text>
    <text x="305" y="142">T_5</text>
    <text x="365" y="142">T_6</text>
    <text x="425" y="142">T_7</text>
    <text x="485" y="142">T_8</text>
  </g>
  <text x="270" y="185" text-anchor="middle" fill="var(--text-faint)" font-size="9">Workers berou tasks z queue, jakmile dokončí předchozí. Load balancing automatic.</text>
  <defs>
    <marker id="task-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

Task scheduler je *work-stealing*: pokud worker dokončí svou queue, *ukradne* task od jiného workera. Klasický pattern (Cilk 1995, Blumofe et al.).

## task clauses

### shared / private / firstprivate

Stejné jako u parallel ([[datova-prostredi]]). Pozor: defaultní *task data sharing* je **firstprivate** (snapshot v okamžiku creation), ne shared.

```c
int x = 5;
#pragma omp task                  // x = 5 (firstprivate)
process(x);
x = 10;                            // outer x changed AFTER task creation
// Task still sees x = 5
```

Pro shared use `shared(x)` explicit.

### if(condition)

```c
#pragma omp task if(n > 100)
process(n);
```

Pokud `n > 100`, vytvoří task. Jinak *immediately* execute (no task overhead). Optimalizace pro malé úkoly.

### depend(in/out/inout : var)

Task dependence:

```c
#pragma omp task depend(out: x)
x = compute_a();

#pragma omp task depend(out: y)
y = compute_b();

#pragma omp task depend(in: x, y) depend(out: z)
z = x + y;
```

Třetí task *čeká*, dokud `x` i `y` nejsou dokončeny. Builds task DAG.

To je *dataflow* paralelismus — automatic dependency resolution.

## taskwait, taskgroup

### taskwait

```c
#pragma omp task
phase_A();
#pragma omp task
phase_B();
#pragma omp taskwait    // wait for direct children
phase_C();
```

Čeká jen na *přímé* children tasks. Pokud `phase_A` spustila vlastní subtasks, *nečeká* na ně (jen na samu `phase_A` task).

### taskgroup

```c
#pragma omp taskgroup
{
    #pragma omp task
    phase_A();    // spustí sub-tasks
    #pragma omp task
    phase_B();
}
// Po taskgroup: všechny tasks (including grand-children) hotové
```

Recursive wait — *všechny* potomci, ne jen direct.

## taskloop

OpenMP 4.5+: kombinace task + parallel for:

```c
#pragma omp taskloop grainsize(64)
for (int i = 0; i < N; i++)
    process(i);
```

Smyčka rozdělena na tasks, každý task pokrývá `grainsize` iterací. Workers berou tasks dynamicky.

Výhoda nad `parallel for schedule(dynamic, 64)`:

- Lze *kombinovat* s rekursivními tasks (mixed structure).
- Lze použít `depend` mezi taskloopy.

## final, mergeable

```c
#pragma omp task final(n < 10)
recurse(n);    // při hluboké rekurzi, neslituj task overhead
```

`final` — pokud true, task se *neslévá* dál (žádné další task creation uvnitř). Pro recursive limits.

`mergeable` — runtime může task *sloučit* s rodičovským kontextem (no separate data env). Optimizace.

## Reálná aplikace: quicksort

```c
void quicksort(int *a, int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(a, lo, hi);

    #pragma omp task shared(a) if(hi - lo > 1000)
    quicksort(a, lo, p - 1);

    #pragma omp task shared(a) if(hi - lo > 1000)
    quicksort(a, p + 1, hi);

    // no taskwait — both subtasks independent, main task done
}

int main() {
    int a[1000000];
    #pragma omp parallel
    {
        #pragma omp single
        quicksort(a, 0, 999999);
    }
}
```

`if(hi - lo > 1000)` — pro malé subarray, *no task overhead*, just inline call. *Cutoff* je klíčový parametr.

## Reálná aplikace: tree traversal

```c
void traverse(Node *n) {
    if (!n) return;
    process(n);

    #pragma omp task
    traverse(n->left);

    #pragma omp task
    traverse(n->right);

    // siblings běží paralelně
}
```

Pro vyvážený strom 1M uzlů → 1M tasks. Worker queue je *deep*, lots of contention.

Optimization: *cutoff* depth (přestat spawnovat tasks v hloubce > k) nebo *grainsize*.

## Limity tasks

- **Overhead per task** — vytvořit task ~100-500 ns. Pro malé tasks (< 1 μs work) overhead dominantní.
- **Queue contention** — worker stealing může být bottleneck při miliónech tasks.
- **No nested data sharing** — task v task má *vlastní* data env. Sharing přes shared(), ale beware races.

Práce per task by měla být **> 10× task creation overhead** — typicky 1-100 μs.

## Co dál

[[synchronizace-bariery]] popisuje synchronizační primitiva — barrier, critical, atomic. [[locks-openmp]] manuální locks pro fine-grained control. [[false-sharing-races]] varuje před cache-level race conditions.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Ayguadé, E. et al.: „The Design of OpenMP Tasks" (IEEE TPDS 20(3), 2009, [DOI 10.1109/TPDS.2008.105](https://doi.org/10.1109/TPDS.2008.105)); Blumofe, R.D., Joerg, C.F., Kuszmaul, B.C. et al.: „Cilk: An Efficient Multithreaded Runtime System" (PPoPP 1995); [OpenMP 5.2 Specification](https://www.openmp.org/specifications/), §12 (Tasking constructs).*
