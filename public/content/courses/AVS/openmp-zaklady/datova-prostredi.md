---
title: Datová prostředí — private, shared, reduction
---

# Data sharing v OpenMP — private, shared, reduction

V parallel regionu musí *každá* proměnná mít jasnou *sharing semantiku*: je *sdílená* (všechna vlákna vidí stejnou paměť) nebo *privátní* (každé vlákno má vlastní kopii)? Špatný choice = race condition nebo *nesprávný výsledek*.

## Default rules

```c
int a = 1, b = 2, c = 3;
#pragma omp parallel
{
    int local = 0;       // private (declared inside parallel)
    a = a + b;           // a, b: ? shared by default
    local = c;           // local: private, c: shared
}
```

Default `default(shared)`:

- Proměnné *declared inside* parallel = **private**.
- Proměnné *declared outside* a *referenced inside* = **shared**.
- Loop indices `i` v `parallel for` = **private** automaticky.

Programátor *měl* by **explicitně** určit:

```c
#pragma omp parallel default(none) shared(a, b) private(c)
{
    ... 
}
```

`default(none)` force explicit declaration — *bug prevention*. Doporučováno.

## Klauzule

### shared(var)

Variable shared mezi všemi threads. Změny *viditelné* všem.

```c
int sum = 0;
#pragma omp parallel shared(sum)
{
    sum = sum + 1;   // RACE — bez synchronizace
}
```

⚠ Race condition! Musí být *chráněno* atomic/critical, nebo použít `reduction`.

### private(var)

Každé vlákno má *vlastní* kopii. **Uninitialized** at start (pozor — *neimplicit* copy z outer value).

```c
int x = 5;
#pragma omp parallel private(x)
{
    printf("%d\n", x);   // undefined (x is local copy, uninit)
    x = omp_get_thread_num();
    printf("%d\n", x);   // OK
}
printf("%d\n", x);       // 5 (outer x unchanged)
```

### firstprivate(var)

Jako `private`, ale initialized *outer value*.

```c
int x = 5;
#pragma omp parallel firstprivate(x)
{
    printf("%d\n", x);   // 5 (initialized from outer)
    x = 10;
}
printf("%d\n", x);       // 5 (outer unchanged)
```

### lastprivate(var)

Jako `private`, ale po skončení parallel region *outer* dostane hodnotu *posledně iterace* (in serial order).

```c
int last = 0;
#pragma omp parallel for lastprivate(last)
for (int i = 0; i < N; i++) {
    last = compute(i);   // each thread has own last
}
// Now outer 'last' = compute(N-1), even if thread T didn't run it
```

Funguje *jen* s `for` directive.

### reduction(op:var)

Speciální: kombinace `private` + *implicit* reduction operation.

```c
int sum = 0;
#pragma omp parallel for reduction(+:sum)
for (int i = 0; i < N; i++)
    sum += a[i];
// Final sum = sum of all per-thread partial sums
```

Mechanismus:

1. Každé vlákno má `private` kopii `sum`, initialized to **identity** (`0` for `+`, `1` for `*`, `INT_MIN` for `max`, atd.).
2. Vlákno akumuluje do své kopie.
3. Na konci se *kopie spojí* operací `+`.

⇒ Žádný race, žádný critical section. **Best practice for accumulators.**

| Operation | Identity | Příklad |
| :--- | :--- | :--- |
| `+` | 0 | sum |
| `*` | 1 | product |
| `-` | 0 | sum (same as +) |
| `&` | ~0 | bitwise AND |
| `\|` | 0 | bitwise OR |
| `^` | 0 | bitwise XOR |
| `&&` | 1 | logical AND |
| `\|\|` | 0 | logical OR |
| `max` | smallest possible | max element |
| `min` | largest possible | min element |

OpenMP 4.0+ podporuje *user-defined reduction* (UDR) pro vlastní operace.

## Příklad bez vs s reduction

### Špatně: race

```c
int count = 0;
#pragma omp parallel for
for (int i = 0; i < N; i++)
    if (a[i] == 0) count++;        // RACE
```

Výsledek random, less than expected (lost updates).

### Špatně: critical (works but slow)

```c
int count = 0;
#pragma omp parallel for
for (int i = 0; i < N; i++)
    if (a[i] == 0) {
        #pragma omp critical
        count++;       // serializes all threads
    }
```

Funguje, ale **serializovaný** — *žádný* parallel speedup. Critical = bottleneck.

### Správně: reduction

```c
int count = 0;
#pragma omp parallel for reduction(+:count)
for (int i = 0; i < N; i++)
    if (a[i] == 0) count++;
```

Race-free, plně parallel. Per-thread partial counts sjednoceny *automaticky*.

## threadprivate

Globální variable, ale *per-thread* persistence (přes parallel regions):

```c
int counter;
#pragma omp threadprivate(counter)

void f() {
    counter++;       // each thread has own counter
}

#pragma omp parallel
{
    f();
    f();
}
// Each thread's counter = 2
```

`threadprivate` je rare — typicky pro thread-local state, např. random generator state.

## Memory model

OpenMP poskytuje **relaxed consistency**:

- Zápis `a = 1` v thread T1 *nemusí* být *okamžitě* viditelný T2.
- **Flush** operace (`#pragma omp flush`) vynutí *synchronization point*.
- Implicit flush u: barrier, critical, atomic, lock, parallel entry/exit.

V praxi: pokud používáte `critical` / `atomic` / `barrier` / reduction, *nemusíte se starat*. Pokud používáte direct shared variable updates, **explicit flush** nebo `atomic`.

```c
shared int ready = 0;
shared int data;

// Thread T1
data = compute();
#pragma omp flush
ready = 1;
#pragma omp flush

// Thread T2
while (ready == 0) {
    #pragma omp flush
}
#pragma omp flush
use(data);
```

Tohle je *pattern producer-consumer* bez critical. Komplikovaný — typicky lepší použít `omp_lock`.

## False sharing

```c
int counts[8];   // T0 updates counts[0], T1 updates counts[1], ...

#pragma omp parallel for
for (int i = 0; i < N; i++) {
    int t = omp_get_thread_num();
    counts[t]++;
}
```

Vypadá clean. **Problem**: `counts[0..7]` jsou na *jedné* cache line (64 B / 4 B = 16 ints per line). Každé incrementoval různý thread → **cache line ping-pong**.

Fix: padding to cache line:

```c
struct {
    int count;
    char padding[60];        // total 64 B
} counts[8];
```

Nebo *thread-local accumulators* sjednocené reduction.

Detaily v [[false-sharing-races]] (Topic 8).

## Atomic vs critical vs reduction

| Mechanism | Granularity | Performance | Use case |
| :--- | :--- | :--- | :--- |
| atomic | single op | best (HW instr) | inc, add, swap on one var |
| critical | block | moderate (mutex) | complex update sequence |
| reduction | implicit | best (per-thread accum) | accumulation patterns |
| locks | block | manual control | fine-grained locking |

Decision:

1. **Accumulating into scalar/array?** → reduction (or partial sums + manual merge).
2. **Single atomic op (inc, add)?** → atomic.
3. **Multi-step update needs invariant?** → critical (or lock).
4. **Need bool/flag?** → atomic (or volatile + flush).

## Co dál

Topic 7 končí. Topic 8 ([[sections-single-master]]) přechází na *task model*, *synchronization primitives*, a *false sharing* — pokročilé OpenMP konstrukty pro irregular paralelní práci.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Chapman, B., Jost, G., van der Pas, R.: „Using OpenMP" (MIT Press 2008); [OpenMP 5.2 Specification](https://www.openmp.org/specifications/), §2.21 (data sharing); Süß, M., Leopold, C.: „Common Mistakes in OpenMP" (IWOMP 2008); Mattson, T.G.: „A 'Hands-On' Introduction to OpenMP" ([SC tutorial slides](https://www.openmp.org/wp-content/uploads/Intro_To_OpenMP_Mattson.pdf)).*
