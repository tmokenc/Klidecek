---
title: OpenMP tasks — dynamický paralelismus
---

# OpenMP tasks — dynamický paralelismus

Konstrukce `parallel for` a `sections` jsou *statické* — počet iterací či sekcí znám předem. Pro *dynamický* paralelismus (rekurzivní stromy, nepravidelná práce, schéma producent–konzument) je potřeba direktiva **task**. Zavedl ji OpenMP 3.0 (2008); OpenMP 4.0 přidal závislosti mezi úkoly (dependencies) a OpenMP 5.0 oddělené úkoly (detached tasks) a afinitu.

## task — vytvoření úkolu

```c
#pragma omp task [clauses]
do_work();
```

Vytváří **task** (úkol) — *samostatně rozlišitelnou* jednotku práce. Tým vláken si tyto úkoly bere z **fronty**.

### Příklad — rekurzivní výpočet Fibonacciho čísla

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

Klíčový vzor (pattern):

1. `#pragma omp parallel` vytvoří tým.
2. `#pragma omp single` — jen jedno vlákno (typicky hlavní, master) *zahájí* rekurzi.
3. `#pragma omp task` — *vytvoří* úkol pro `fib(n-1)` a `fib(n-2)`. Volná vlákna (workers) je pak *vykonají*.
4. `#pragma omp taskwait` — počkej, dokud všechny potomkové (child) úkoly nedokončí.

⇒ Rekurzivní paralelismus *bez* ruční správy fondu vláken (thread pool).

## Životní cyklus úkolu (task lifecycle)

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
    <path d="M70,90 L70,65" marker-end="url(#task-arrow)"/>
    <path d="M175,90 L175,65" marker-end="url(#task-arrow)"/>
    <path d="M280,90 L280,65" marker-end="url(#task-arrow)"/>
    <path d="M385,90 L385,65" marker-end="url(#task-arrow)"/>
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

Plánovač úkolů (task scheduler) pracuje na principu *kradení práce* (work-stealing): pokud worker vyprázdní svou frontu, *ukradne* úkol jinému workerovi. Jde o klasický vzor (Cilk 1995, Blumofe et al.).

## Klauzule direktivy task (task clauses)

### shared / private / firstprivate

Fungují stejně jako u direktivy parallel ([[datova-prostredi]]). Pozor: výchozí sdílení dat (data sharing) u úkolu je **firstprivate** (tedy snímek hodnoty v okamžiku vytvoření úkolu), nikoli shared.

```c
int x = 5;
#pragma omp task                  // x = 5 (firstprivate)
process(x);
x = 10;                            // outer x changed AFTER task creation
// Task still sees x = 5
```

Chceme-li sdílení, je nutné explicitně použít `shared(x)`.

### if(condition)

```c
#pragma omp task if(n > 100)
process(n);
```

Pokud platí `n > 100`, vytvoří se úkol. Jinak se kód provede *okamžitě* (bez režie úkolu, task overhead). Jde o optimalizaci pro drobné úkoly.

### depend(in/out/inout : var)

Závislost mezi úkoly (task dependence):

```c
#pragma omp task depend(out: x)
x = compute_a();

#pragma omp task depend(out: y)
y = compute_b();

#pragma omp task depend(in: x, y) depend(out: z)
z = x + y;
```

Třetí úkol *čeká*, dokud nejsou dokončeny `x` i `y`. Tím se buduje orientovaný acyklický graf úkolů (task DAG).

Jde o *datově řízený* (dataflow) paralelismus — závislosti se vyhodnocují automaticky.

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

Čeká pouze na *přímé* potomky (children tasks). Pokud `phase_A` spustila vlastní podúkoly (subtasks), na ně *nečeká* — čeká jen na samotný úkol `phase_A`.

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

Rekurzivní čekání — počká na *všechny* potomky, nejen na ty přímé.

## taskloop

OpenMP 4.5 a novější: kombinace task a parallel for:

```c
#pragma omp taskloop grainsize(64)
for (int i = 0; i < N; i++)
    process(i);
```

Smyčka se rozdělí na úkoly, přičemž každý úkol pokrývá `grainsize` iterací. Workers si úkoly berou dynamicky.

Výhoda oproti `parallel for schedule(dynamic, 64)`:

- Lze ji *kombinovat* s rekurzivními úkoly (smíšená struktura).
- Lze použít `depend` mezi jednotlivými taskloopy.

## final, mergeable

```c
#pragma omp task final(n < 10)
recurse(n);    // při hluboké rekurzi, neslituj task overhead
```

`final` — je-li podmínka pravdivá, úkol se dál *nerozvětvuje* (uvnitř už nevznikají žádné další úkoly). Slouží k omezení hloubky rekurze.

`mergeable` — běhové prostředí (runtime) může úkol *sloučit* s kontextem rodiče (bez samostatného datového prostředí). Jde o optimalizaci.

## Reálná aplikace: quicksort {tier=example}

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

`if(hi - lo > 1000)` — pro malé podpole se *žádný úkol nevytvoří* a provede se prosté přímé (inline) volání. Tato mez (*cutoff*) je klíčovým parametrem.

## Reálná aplikace: průchod stromem {tier=example}

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

Pro vyvážený strom s 1 milionem uzlů vznikne 1 milion úkolů. Fronta workerů je *hluboká* a dochází k velkému soupeření o ni (contention).

Optimalizace: zavést *cutoff* podle hloubky (přestat vytvářet úkoly v hloubce > k) nebo použít *grainsize*.

## Omezení úkolů (limity tasks)

- **Režie na jeden úkol (overhead per task)** — vytvoření úkolu trvá zhruba 100–500 ns. U malých úkolů (práce < 1 μs) tato režie převažuje.
- **Soupeření o frontu (queue contention)** — při milionech úkolů se kradení práce mezi workery může stát úzkým hrdlem (bottleneck).
- **Žádné vnořené sdílení dat** — úkol vnořený v jiném úkolu má *vlastní* datové prostředí. Sdílet lze přes `shared()`, ale pozor na souběhy (races).

Práce na jeden úkol by měla být **více než 10× větší než režie jeho vytvoření** — typicky tedy 1–100 μs.

## Co dál

[[synchronizace-bariery]] popisuje synchronizační primitiva — barrier, critical, atomic. [[locks-openmp]] se věnuje ručním zámkům (locks) pro jemně zrnité řízení (fine-grained control). [[false-sharing-races]] varuje před souběhy na úrovni cache (cache-level race conditions).

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Ayguadé, E. et al.: „The Design of OpenMP Tasks" (IEEE TPDS 20(3), 2009, [DOI 10.1109/TPDS.2008.105](https://doi.org/10.1109/TPDS.2008.105)); Blumofe, R.D., Joerg, C.F., Kuszmaul, B.C. et al.: „Cilk: An Efficient Multithreaded Runtime System" (PPoPP 1995); [OpenMP 5.2 Specification](https://www.openmp.org/specifications/), §12 (Tasking constructs).*
