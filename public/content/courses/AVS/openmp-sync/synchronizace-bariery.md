---
title: Synchronizace — barrier, critical, atomic
---

# OpenMP synchronizace — barrier, critical, atomic, ordered

Synchronizace je *jediný způsob*, jak v shared memory zajistit konzistentní výsledek. OpenMP poskytuje hierarchii primitiv od *globálních* (barrier) po *atomární* (single instruction).

## barrier — wait for all

```c
#pragma omp parallel
{
    phase1();
    #pragma omp barrier        // wait for all threads
    phase2();                  // begins only after all done phase1
}
```

`barrier` = *globální* synchronizace v tým. Žádné vlákno nepokračuje za bod, dokud *všechna* nedosáhnou.

Implementace: typicky 2 atomic counters (entered, left) + busy-wait. Cost ~100-1000 cyklů typicky.

### Implicit barriers

OpenMP *automaticky* vkládá barrier:

- Na konci `parallel` region.
- Na konci `for` (lze potlačit `nowait`).
- Na konci `sections` (lze potlačit).
- Na konci `single` (lze potlačit).

`master` *nemá* implicit barrier.

## critical — exclusive access

```c
shared int counter;
#pragma omp parallel for
for (...) {
    #pragma omp critical
    {
        counter++;       // serializovaný
        update_log();
    }
}
```

Pouze *jedno* vlákno najednou v `critical` bloku. Implementace: mutex lock.

Cost: ~100-500 cyklů per lock/unlock.

### Pojmenovaná critical

```c
#pragma omp critical (counter_lock)
counter++;

#pragma omp critical (log_lock)
write_log();
```

Pokud *různé* lock names, *různé* mutexy — *neserializují se* navzájem. Bez jména: *všechny anonymní* critical sdílí *jeden global mutex* (špatné).

## atomic — single instruction

```c
#pragma omp atomic
counter++;
```

*Jediná* atomická hardware instrukce — *žádný* mutex, *žádná* context switch.

Implementace na x86: `LOCK INC [counter]` (LOCK prefix). Cost: 10-50 cyklů (cache line transfer for invalidation).

Atomic *vždy lepší* než critical pro single-op, ale *omezeno* na:

```c
#pragma omp atomic update
x++;       // ++, --, +=, -=, *=, /=, &=, |=, ^=, <<=, >>=

#pragma omp atomic read
v = x;     // load

#pragma omp atomic write
x = v;     // store

#pragma omp atomic capture
v = x++;   // capture old + update
```

Více operací (např. `counter += compute()`) **není** atomic — musí být `critical`.

### atomic vs critical

| Mechanism | Limit | Overhead |
| :--- | :--- | :---: |
| atomic | jedna LOAD/STORE/RMW op | ~30 cyklů |
| critical | libovolný blok | ~200 cyklů |
| reduction | accumulator pattern | ~10 cyklů per thread (best) |
| locks | manuální, fine-grained | ~100 cyklů |

Rule of thumb:

- Single var inc/add → **atomic**.
- Accumulating across loop → **reduction**.
- Complex update block → **critical**.
- Fine-grained data structure protection → **locks**.

## ordered — sequential within parallel for

```c
#pragma omp parallel for ordered
for (int i = 0; i < N; i++) {
    int r = compute(i);

    #pragma omp ordered
    {
        printf("i=%d r=%d\n", i, r);  // print in sequence order
    }
}
```

`ordered` zaručí, že *sériový* blok provedou vlákna v *originálním pořadí* iterace. Užitečné pro:

- Print output v pořadí.
- Write to file in order.
- Numerical algorithms requiring sequential pattern (Gauss-Seidel).

Pokuta: *serializuje* tu část kódu. Pokud `ordered` blok je drahý → no speedup.

## flush — memory consistency

```c
#pragma omp flush         // flush all shared variables
#pragma omp flush(x, y)   // flush specific variables
```

Vynutí *globální* viditelnost. Implementuje:

- Memory barrier (`mfence` na x86), který zajistí pořadí load/store a vyprázdní dočasný pohled vlákna do koherentní paměti. Invalidaci řádků mezi jádry řeší automaticky HW koherence, ne `flush`.

Implicit flush u: barrier, critical (enter + exit), atomic, lock (enter + exit), parallel region entry/exit.

Manual `flush` rare — programátor nepíše explicit. Memory model OpenMP relaxed → většinou je sync skrytá v jiných direktivách.

### Příklad — producer-consumer bez locks {tier=example}

```c
shared int data;
shared int flag = 0;

// Producer (thread 0)
data = compute();
#pragma omp flush                // ensure data visible
flag = 1;
#pragma omp flush

// Consumer (thread 1)
while (1) {
    #pragma omp flush(flag)
    if (flag) break;
}
#pragma omp flush(data)
use(data);
```

Toto je *dangerous* bez detailní znalosti memory model. Lépe použít `omp_lock` nebo `critical`.

## Příklady společně {tier=example}

### Histogram — bad and good

```c
// BAD: race
int hist[256] = {0};
#pragma omp parallel for
for (int i = 0; i < N; i++)
    hist[a[i]]++;          // race on hist[]

// BAD: critical
#pragma omp parallel for
for (int i = 0; i < N; i++) {
    #pragma omp critical
    hist[a[i]]++;          // serialized, no speedup
}

// BETTER: atomic
#pragma omp parallel for
for (int i = 0; i < N; i++) {
    #pragma omp atomic
    hist[a[i]]++;          // OK, but 256-element atomic still costs
}

// BEST: per-thread + merge
int hist[256] = {0};
#pragma omp parallel
{
    int local[256] = {0};
    #pragma omp for nowait
    for (int i = 0; i < N; i++)
        local[a[i]]++;

    #pragma omp critical
    for (int b = 0; b < 256; b++)
        hist[b] += local[b];
}
```

Per-thread accumulator + final merge = klasický pattern. *Žádný* race uvnitř hot loop, merge je *malý* (256 ops).

### Min / max

```c
int min_val = INT_MAX;
#pragma omp parallel for reduction(min:min_val)
for (int i = 0; i < N; i++)
    min_val = (a[i] < min_val) ? a[i] : min_val;
```

`reduction(min)` od OpenMP 3.1. Hardware sequentializes per-thread merges efficiently.

## Bariéra v algoritmech

Mnoho parallel algorithms má strukturu:

```
loop {
    parallel phase 1;
    barrier;
    parallel phase 2;
    barrier;
}
```

Klasické (Gauss-Seidel, BFS po vrstvách, Jacobi iterace, MapReduce). Náklad: bariéra každou iteraci.

Pro **N** iterací × **B** barrier cost: pokud B = 1 μs, N = 1000, celkem 1 ms režie. Pro velkou phase work to OK; pro lehkou fázi to kritická součást celkového času.

Optimalizace: *async iteration* (Gauss-Seidel async) — eliminuje barrier, ale konvergence pomalejší.

## Co dál

[[locks-openmp]] zavádí *manuální* locks — fine-grained alternativa k critical/atomic. [[false-sharing-races]] popisuje *skryté* race conditions přes cache line sdílení.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Chapman, B., Jost, G., van der Pas, R.: „Using OpenMP" (MIT Press 2008), §5; [OpenMP 5.2 Specification](https://www.openmp.org/specifications/), §15-16 (Synchronization); Adve, S.V., Gharachorloo, K.: „Shared Memory Consistency Models: A Tutorial" (IEEE Computer 29(12), 1996).*
