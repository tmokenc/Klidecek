---
title: OpenMP locks — manuální fine-grained synchronizace
---

# OpenMP locks — manuální synchronizace

`critical` a `atomic` jsou *coarse* (block) nebo *very fine* (single instruction). Pro *fine-grained data-structure-level* sync OpenMP poskytuje **omp_lock_t**.

## omp_lock_t — simple lock

```c
#include <omp.h>
omp_lock_t lock;

void init() {
    omp_init_lock(&lock);
}

void use() {
    omp_set_lock(&lock);     // acquire (blocking)
    // critical section
    omp_unset_lock(&lock);   // release
}

void cleanup() {
    omp_destroy_lock(&lock);
}
```

Stejně jako pthread mutex. Lock acquisition je *blocking* — pokud lock obsazen, vlákno čeká.

## omp_nest_lock_t — nested lock

```c
omp_nest_lock_t nlock;
omp_init_nest_lock(&nlock);

void recurse(int n) {
    omp_set_nest_lock(&nlock);    // může se zavolat víckrát stejným threadem
    if (n > 0) recurse(n - 1);
    omp_unset_nest_lock(&nlock);
}
```

Nested = thread, který už lock drží, ho může *znovu* acquire (counter). Užitečné pro recursive functions.

Simple lock by *self-deadlock* při re-entry.

## omp_test_lock — non-blocking try

```c
if (omp_test_lock(&lock)) {
    // got the lock, do work
    omp_unset_lock(&lock);
} else {
    // lock busy, do something else
    do_other_work();
}
```

Vyzkouší acquire, *nečeká* pokud neúspěch. Pro lock-free patterns.

## Locks vs critical

| | omp_lock_t | critical |
| :--- | :--- | :--- |
| Initialization | `omp_init_lock` | implicit |
| Scope | jakákoli — bloky, funkce, struct field | jen #pragma block |
| Multiple locks | yes — fine-grained | jen named critical (limited) |
| try-lock | yes (`omp_test_lock`) | no |
| Nested | nest_lock variant | no |
| Performance | similar (mutex) | similar |

Locks jsou *flexibilnější*, ale *víc kódu*. Pro většinu užití `critical` dostačuje.

## Fine-grained locking

Klasický pattern: lock per data structure element.

```c
typedef struct {
    int value;
    omp_lock_t lock;
} Bucket;

Bucket hashtable[HASH_SIZE];

void init() {
    for (int i = 0; i < HASH_SIZE; i++)
        omp_init_lock(&hashtable[i].lock);
}

void insert(int key, int val) {
    int h = hash(key);
    omp_set_lock(&hashtable[h].lock);   // lock just this bucket
    hashtable[h].value = val;
    omp_unset_lock(&hashtable[h].lock);
}
```

Místo *jednoho* mutex pro celou hash table, lock *per bucket*. Concurrency = počet bucketů.

Single lock vs N locks:

- Single: 1 thread at a time → contention.
- N locks: N threads simultaneously (pokud n různých buckets).

Trade-off: paměť (N × lock state) vs. concurrency.

## Lock contention

Pokud *všechna* vlákna chtějí *stejný* lock → serializace.

Měření: `perf stat -e ...` ukáže *čas* strávený v lock acquisition.

Optimalizace:

1. **Reduce critical section size** — méně práce v locku.
2. **Lock-free data structures** — atomic CAS-based queues (komplexní).
3. **Per-thread accumulators + merge** — místo shared lock.
4. **Read-write locks** — many readers, exclusive writer (pthread_rwlock; OpenMP nemá native).

## Reader-writer locks

OpenMP *přímo* nemá, ale lze emulovat:

```c
omp_lock_t writer_lock;
int readers = 0;
omp_lock_t reader_count_lock;

void read_acquire() {
    omp_set_lock(&reader_count_lock);
    readers++;
    if (readers == 1) omp_set_lock(&writer_lock);
    omp_unset_lock(&reader_count_lock);
}
void read_release() {
    omp_set_lock(&reader_count_lock);
    readers--;
    if (readers == 0) omp_unset_lock(&writer_lock);
    omp_unset_lock(&reader_count_lock);
}
void write_lock()   { omp_set_lock(&writer_lock); }
void write_unlock() { omp_unset_lock(&writer_lock); }
```

První reader acquire `writer_lock` (block writers). Last reader release. Writers acquire normálně.

V praxi: použijte `pthread_rwlock_t` přímo, OpenMP nepoužívejte.

## Lock-free patterns

Pro extreme performance: *žádné* locks, jen *atomic CAS* (compare-and-swap).

```c
// Lock-free counter
shared int counter = 0;

void increment() {
    int old, new;
    do {
        old = counter;
        new = old + 1;
    } while (!__atomic_compare_exchange_n(&counter, &old, new,
                                          false, __ATOMIC_SEQ_CST,
                                          __ATOMIC_SEQ_CST));
}
```

CAS loop: čte starou hodnotu, spočítá novou, *atomicky* updateuje (pokud někdo nezmenil mezitím). Pokud konflikt → retry.

Pro low contention CAS rychlejší než lock. Pro high contention CAS *spinne* a žere CPU. Standard programmer-unfriendly — *raději* použít `omp atomic`.

## Spinlock vs blocking lock

OpenMP `omp_set_lock` default je *blocking* (yield to OS scheduler if contention). Cost: ~1-10 μs context switch.

*Spinlock* = busy-wait. Lépe pro *very short* critical sections (< 1 μs).

```c
// Spinlock pattern (manual)
while (!__atomic_test_and_set(&flag, __ATOMIC_ACQUIRE)) {
    // spin
}
// critical section
__atomic_clear(&flag, __ATOMIC_RELEASE);
```

OpenMP nemá explicit spinlock direktivu. Pro spinlocks použij `pthread_spinlock_t` nebo manuální atomic.

## Deadlock prevention

Klasický problém: 2 locks, 2 threads acquire in opposite order.

```c
// Thread 1:                Thread 2:
omp_set_lock(&A);           omp_set_lock(&B);
omp_set_lock(&B);           omp_set_lock(&A);
// DEADLOCK
```

Pravidla:

1. **Global ordering** — acquire locks vždy v *stejném pořadí* (např. according to address).
2. **try-lock + backoff** — pokud druhý lock fail, release first + retry.
3. **Lock hierarchies** — strict order rules in design.

## Performance tips

1. **Inicializace** — `omp_init_lock` *jednou*, ne v hot path.
2. **Granularita** — fine-grained menší contention, ale víc overhead.
3. **Hold time minimální** — kritická sekce *krátká*.
4. **No I/O v locku** — pokud zavolá `printf` nebo file write, blokuje *dlouho*.
5. **Profile** — `perf record` ukáže, kolik času ve `omp_set_lock`.

## Co dál

[[false-sharing-races]] popisuje *poslední* synchronization-related kategorii: *cache-level* race conditions, které vznikají *bez* explicit shared variables. Pak Topic 9 přejde k *koherenci cache* — HW vrstva, na které OpenMP locks staví.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Chapman, B., Jost, G., van der Pas, R.: „Using OpenMP" (MIT Press 2008), §5; [OpenMP 5.2 Specification](https://www.openmp.org/specifications/), §3.2 (Lock routines); Herlihy, M., Shavit, N.: „The Art of Multiprocessor Programming" (Morgan Kaufmann 2012).*
