---
title: OpenMP API — direktivy, fork-join
---

# OpenMP — paralelní programování přes direktivy

**OpenMP** (Open Multi-Processing) je API pro shared-memory paralelní programování v C/C++ a Fortranu. První verze 1997 (Fortran), 1998 (C/C++). Aktuální verze **5.2** (2021). Konsorcium **OpenMP ARB** sdružuje výrobce HW + SW (Intel, AMD, IBM, NVIDIA, ARM, kompilátoři).

OpenMP je *abstrakcí nad pthread* — direktivy pro kompilátor + knihovní funkce + proměnné prostředí. Programátor napíše *přibližně* sekvenční kód a *označí* paralelní oblasti.

## Tři součásti OpenMP

### 1. Direktivy pro kompilátor

`#pragma omp <directive> [<clauses>]`

Aplikuje se na *následující* strukturovaný blok (1 příkaz nebo `{ block }`). Příklady:

```c
#pragma omp parallel         // vytvoří tým vláken
{
    do_work();
}

#pragma omp parallel for     // paralelizuj smyčku
for (int i = 0; i < N; i++)
    a[i] = b[i] + c[i];

#pragma omp critical         // exclusive access
{
    update_shared();
}
```

### 2. Knihovní rutiny

`#include <omp.h>`:

| Funkce | Co dělá |
| :--- | :--- |
| `omp_set_num_threads(n)` | nastav počet vláken |
| `omp_get_num_threads()` | kolik vláken v aktuální parallel region |
| `omp_get_thread_num()` | ID aktuálního vlákna (0-based) |
| `omp_get_max_threads()` | max possible (default = #cores) |
| `omp_get_wtime()` | wall-clock time (sekundy) |
| `omp_init_lock(&lk)` | inicializace zámku |
| `omp_set_lock(&lk)`, `omp_unset_lock(&lk)` | acquire/release |

### 3. Proměnné prostředí

| Env var | Funkce |
| :--- | :--- |
| `OMP_NUM_THREADS=8` | default thread count |
| `OMP_SCHEDULE=dynamic,16` | default scheduling pro `parallel for` |
| `OMP_PLACES=cores` | placement (cores / threads / sockets) |
| `OMP_PROC_BIND=close` | binding (close, spread, master, true, false) |
| `OMP_DISPLAY_ENV=true` | print env vars at startup |

`OMP_PLACES` + `OMP_PROC_BIND` jsou kritické pro NUMA performance ([[uma-numa]]).

## Fork-Join model

OpenMP program začíná **jedním** vláknem (master, thread 0). Při dosažení `#pragma omp parallel` se **vytvoří tým** worker threads. Po skončení parallel region se *spojí* zpět (implicitní barrier).

::: svg "Fork-join model OpenMP"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10">
  <g stroke="var(--accent)" stroke-width="2" fill="none">
    <line x1="270" y1="20" x2="270" y2="60"/>
  </g>
  <text x="270" y="15" text-anchor="middle" fill="var(--text)" font-size="9">master thread</text>
  <text x="370" y="40" fill="var(--accent)" font-size="9">sekvenční</text>
  <g stroke="var(--accent)" stroke-width="2" fill="none">
    <line x1="270" y1="60" x2="120" y2="80"/>
    <line x1="270" y1="60" x2="200" y2="80"/>
    <line x1="270" y1="60" x2="340" y2="80"/>
    <line x1="270" y1="60" x2="420" y2="80"/>
    <line x1="120" y1="80" x2="120" y2="130"/>
    <line x1="200" y1="80" x2="200" y2="130"/>
    <line x1="340" y1="80" x2="340" y2="130"/>
    <line x1="420" y1="80" x2="420" y2="130"/>
  </g>
  <g fill="var(--accent)" font-size="9" text-anchor="middle">
    <text x="120" y="73">T0</text>
    <text x="200" y="73">T1</text>
    <text x="340" y="73">T2</text>
    <text x="420" y="73">T3</text>
  </g>
  <text x="20" y="105" fill="var(--text)" font-weight="600" font-size="10">parallel region</text>
  <text x="20" y="118" fill="var(--text-muted)" font-size="9">(implicit barrier at end)</text>
  <g stroke="var(--accent)" stroke-width="2" fill="none">
    <line x1="120" y1="130" x2="270" y2="150"/>
    <line x1="200" y1="130" x2="270" y2="150"/>
    <line x1="340" y1="130" x2="270" y2="150"/>
    <line x1="420" y1="130" x2="270" y2="150"/>
    <line x1="270" y1="150" x2="270" y2="190"/>
  </g>
  <text x="370" y="170" fill="var(--accent)" font-size="9">sekvenční</text>
  <g stroke="var(--text-faint)" stroke-dasharray="2 2" fill="none">
    <line x1="100" y1="130" x2="440" y2="130"/>
  </g>
  <text x="500" y="135" fill="var(--text-faint)" font-size="9" text-anchor="end">barrier</text>
</svg>
:::

Program může mít *více* parallel regions, znovu fork/join každý. *Nested parallelism* (parallel within parallel) je možný, ale default disabled (`omp_set_nested(1)` zapne).

::: viz openmp-fork-join "Pusť auto a sleduj fork → parallel for → barrier → další for → join. Zaškrtni 'nowait' a sleduj jak fast thready vstupují do druhého for early."
:::

## Kompilace

```bash
gcc -fopenmp source.c -o prog        # GCC
clang -fopenmp source.c -o prog      # Clang  
icc  -qopenmp source.c -o prog       # Intel ICC
```

Bez `-fopenmp` jsou `#pragma omp` *ignorovány* — program běží sekvenčně. To je *funkce*: stejný kód funguje paralelně i sekvenčně.

OpenMP-aware kompilátor přeloží pragma na pthread runtime calls. Linker linkuje `libgomp` (GCC) nebo `libiomp` (Intel).

## Hello world

```c
#include <stdio.h>
#include <omp.h>

int main() {
    #pragma omp parallel
    {
        int id = omp_get_thread_num();
        int n  = omp_get_num_threads();
        printf("Hello from thread %d of %d\n", id, n);
    }
    return 0;
}
```

Spuštění s `OMP_NUM_THREADS=4 ./prog`:

```
Hello from thread 1 of 4
Hello from thread 0 of 4
Hello from thread 3 of 4
Hello from thread 2 of 4
```

(Pořadí ne deterministické — vlákna paralelně.)

## Direktiva parallel

```c
#pragma omp parallel [num_threads(N)] [if(condition)] [private(...)] [shared(...)] [reduction(...)]
{
    // executed by each thread in team
}
```

Po pragma: *strukturovaný blok* (1 statement nebo `{ }`). Vykonají *všechna* vlákna týmu.

Klauzule:

- `num_threads(N)` — explicit počet (default = OMP_NUM_THREADS nebo cores).
- `if(cond)` — pokud false, **single-threaded** execution (tým = 1 thread). Pro malé N.
- `private`, `shared`, `default` — data sharing ([[datova-prostredi]]).
- `reduction(+:sum)` — reduction proměnná.

## SPMD pattern

Bez další direktivy, `parallel` region běží **SPMD** (Single Program, Multiple Data) — všechna vlákna vykonají stejný kód. Programátor *manuálně* dělí práci podle ID:

```c
#pragma omp parallel
{
    int id = omp_get_thread_num();
    int n  = omp_get_num_threads();
    int start = id * N / n;
    int end   = (id + 1) * N / n;
    for (int i = start; i < end; i++)
        work(i);
}
```

Tohle je *bare-bones*. Pro typický loop existuje *vyšší abstrakce* — `parallel for` (viz [[parallel-for-scheduling]]).

## Strukturovaný blok

OpenMP direktiva platí *pouze* pro **strukturovaný blok**:

- Single statement nebo `{ ... }`.
- *Jeden* entry top, *jeden* exit bottom.
- `exit()` uvnitř povolen.
- `goto` / `return` / `break` *ven* z bloku **nepovolen**.

```c
#pragma omp parallel
{
    if (cond) return;   // ❌ illegal — exit from middle
}

#pragma omp parallel
{
    if (cond) exit(0);  // ✓ allowed
}
```

Throw exception lze, ale musí být *caught uvnitř* bloku.

## OpenMP a stupně paralelismu

- **Coarse-grained** parallel region — celá funkce paralelní. Vhodné pro distinct tasks.
- **Fine-grained** parallel for — single loop. Většina běžných užití.
- **SIMD** — `#pragma omp simd` pro vector instructions ([[vektorizace-prakticka]]).
- **Target offload** — `#pragma omp target` pro GPU/accelerator.

OpenMP 4.0+ podporuje *všechny* tyto úrovně. Vyšší verze přidávají task-based + target offload.

## Co dál

[[parallel-for-scheduling]] popisuje `parallel for` — workhorse OpenMP, s scheduling politikami (static, dynamic, guided). [[datova-prostredi]] řeší data sharing — private vs shared vs reduction klauzule.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Chandra, R., Dagum, L., Kohr, D. et al.: „Parallel Programming in OpenMP" (Morgan Kaufmann 2001); van der Pas, R., Stotzer, E., Terboven, C.: „Using OpenMP — The Next Step" (MIT Press 2017); [OpenMP 5.2 Specification](https://www.openmp.org/specifications/); [LLNL OpenMP Tutorial](https://computing.llnl.gov/tutorials/openMP/).*
