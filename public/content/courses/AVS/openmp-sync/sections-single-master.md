---
title: sections, single, master — work-sharing direktivy
---

# Work-sharing: sections, single, master

`parallel for` ([[parallel-for-scheduling]]) je nejčastější work-sharing direktiva. Pro *jiné* vzory existují **sections**, **single**, **master** — *funkční* paralelismus, *jedno* vlákno provede sekci, *master* speciální role.

## sections — funkční paralelismus

Když máte *více různých* úkolů, které jdou paralelně:

```c
#pragma omp parallel
{
    #pragma omp sections
    {
        #pragma omp section
        do_task_A();         // 1 thread runs this

        #pragma omp section
        do_task_B();         // another thread

        #pragma omp section
        do_task_C();         // another thread
    }
}
```

Každá `section` je *přiřazena* některému vláknu. Pokud T = 4 a sekcí 3, jedno vlákno bude idle (pokud nedoubluje). Pokud T = 2 a sekcí 3, jedno z vláken bude dělat 2 sekce postupně.

Synchronizace: implicit barrier na konci `sections`. Lze vypnout: `sections nowait`.

### Kdy použít

- **Heterogenní úkoly** — read input, parse, process současně.
- **Pipeline stages** — stage1 vyrobí data, stage2 spotřebuje (s producer-consumer queue).
- **Different algorithms over same data** — checksum + parse, search + sort.

### Limity

- Statický počet sekcí. Pokud chcete *dynamický* počet úkolů → `tasks` ([[tasks-openmp]]).
- Pokud sekce mají *nerovnou* dobu, scheduling špatný (nelze auto-balance).

## single — jediné vlákno

V parallel regionu blok provede *jedno* (libovolné) vlákno:

```c
#pragma omp parallel
{
    #pragma omp single
    {
        printf("Initialization\n");    // pouze 1× v celém parallel region
        allocate_global_buffer();
    }
    // Implicit barrier here — všechna ostatní vlákna čekají

    do_work();    // vykonává každý
}
```

Klíčové aplikace:

- **Initialization** — alokace, file open.
- **Print** statements (debugging).
- **Master writes to shared state** while workers prepare.

Vlákno, které vykoná `single`, je *implementačně určené* (typicky první, kdo dorazí). Ostatní *čekají* na implicit barrier.

### nowait

```c
#pragma omp single nowait
{
    init();
}
```

Bez barrier — ostatní vlákna pokračují, nečekají. Single thread *delayed*. Pak je třeba *manuální* sync, pokud následuje práce s init data.

## master — pouze master thread

```c
#pragma omp parallel
{
    #pragma omp master
    {
        printf("Master only\n");
    }
    // ŽÁDNÝ implicit barrier!

    do_work();
}
```

`master` blok provede *thread 0* (master). Ostatní *přeskočí*, nečekají.

### master vs single

| | master | single |
| :--- | :--- | :--- |
| Který thread | thread 0 | *any* thread (first to arrive) |
| Implicit barrier? | **NE** | **ANO** (lze nowait) |
| Použití | jednoduchý announcement | init that others need |

`master` je *rychlejší* (no barrier), ale méně flexibilní. Lépe pro print/log; horší pro initialization.

## Workshare directives (Fortran-only)

OpenMP Fortran má `workshare` pro array operations:

```fortran
!$omp parallel workshare
A = B + C * 2
WHERE (A > 0) A = A / 2
!$omp end parallel workshare
```

C/C++ ekvivalent: `parallel for` over array. Workshare je *Fortranová* abstrakce nad numpy-like operacemi.

## Combined directives

OpenMP umožňuje *zkratky* — kombinovat `parallel` s work-sharing:

```c
#pragma omp parallel for      // = parallel + for
for (...) { ... }

#pragma omp parallel sections
{
    #pragma omp section
    ...
}
```

Nemusíte vytvořit explicit `parallel` region. Direktiva implicitly forks team a immediately work-shares.

## Příklad: pipeline pattern {tier=example}

```c
#pragma omp parallel sections
{
    #pragma omp section
    {
        // Stage 1: read from input
        while (!eof) {
            data = read();
            queue1.push(data);
        }
        queue1.push(SENTINEL);
    }

    #pragma omp section
    {
        // Stage 2: process
        while ((d = queue1.pop()) != SENTINEL) {
            r = process(d);
            queue2.push(r);
        }
        queue2.push(SENTINEL);
    }

    #pragma omp section
    {
        // Stage 3: write output
        while ((r = queue2.pop()) != SENTINEL) {
            write(r);
        }
    }
}
```

Three independent stages. Queues = synchronizační datová struktura (musí být thread-safe — concurrent queue).

Trade-off: synchronization overhead vs throughput. Pokud queue má lock, lock contention zpomalí. Lock-free queue (Michael-Scott queue) lepší.

## Příklad: orchestrator + workers {tier=example}

```c
#pragma omp parallel
{
    #pragma omp master
    {
        // master generates tasks
        for (int i = 0; i < N; i++) {
            #pragma omp task
            process(i);
        }
    }
    // všichni (včetně master po opuštění tasks) spotřebují tasks
}
```

Master generates, workers (including master after generation) consume via task scheduler. Detaily v [[tasks-openmp]].

## Co dál

[[tasks-openmp]] popisuje **task** direktivu — dynamický paralelismus, idální pro irregular work (tree, recursive algorithms). Pak [[synchronizace-bariery]], [[locks-openmp]], [[false-sharing-races]] dokončí Topic 8.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Chapman, B., Jost, G., van der Pas, R.: „Using OpenMP" (MIT Press 2008), §4; [OpenMP 5.2 Specification](https://www.openmp.org/specifications/), §11 (Work-sharing constructs).*
