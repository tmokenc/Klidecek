---
title: Datová prostředí — private, shared, reduction
---

# Sdílení dat v OpenMP — private, shared, reduction

V paralelní oblasti (parallel region) musí mít *každá* proměnná jasně určenou sémantiku sdílení (sharing): buď je *sdílená* (shared) — všechna vlákna vidí stejnou paměť — nebo je *privátní* (private), tedy každé vlákno má vlastní kopii. Špatná volba znamená souběh (race condition), nebo *nesprávný výsledek*.

## Výchozí pravidla

```c
int a = 1, b = 2, c = 3;
#pragma omp parallel
{
    int local = 0;       // private (declared inside parallel)
    a = a + b;           // a, b: ? shared by default
    local = c;           // local: private, c: shared
}
```

Při výchozím nastavení `default(shared)` platí:

- Proměnné *deklarované uvnitř* paralelní oblasti = **private** (privátní).
- Proměnné *deklarované venku* a *použité uvnitř* = **shared** (sdílené).
- Indexy smyčky `i` v `parallel for` jsou **private** automaticky.

Programátor *by měl* sdílení proměnných určovat **explicitně**:

```c
#pragma omp parallel default(none) shared(a, b) private(c)
{
    ... 
}
```

`default(none)` vynutí explicitní deklaraci u každé proměnné — *předchází chybám*. Tento postup je doporučovaný.

## Klauzule

### shared(var)

Proměnná je sdílená mezi všemi vlákny (threads). Změny jsou *viditelné* všem.

```c
int sum = 0;
#pragma omp parallel shared(sum)
{
    sum = sum + 1;   // RACE — bez synchronizace
}
```

⚠ Vznikne souběh (race condition)! Přístup musí být *chráněn* pomocí `atomic` nebo `critical`, případně použijte `reduction`.

### private(var)

Každé vlákno má *vlastní* kopii. Na začátku je **neinicializovaná** (pozor — *neproběhne* implicitní kopie hodnoty z vnější proměnné).

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

Jako `private`, ale kopie je inicializována *hodnotou z vnější proměnné*.

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

Jako `private`, ale po skončení paralelní oblasti *vnější* proměnná dostane hodnotu *poslední iterace* (v sériovém pořadí).

```c
int last = 0;
#pragma omp parallel for lastprivate(last)
for (int i = 0; i < N; i++) {
    last = compute(i);   // each thread has own last
}
// Now outer 'last' = compute(N-1), even if thread T didn't run it
```

Funguje *jen* s direktivou `for`.

### reduction(op:var)

Zvláštní klauzule: kombinuje `private` s *implicitní* redukční operací.

```c
int sum = 0;
#pragma omp parallel for reduction(+:sum)
for (int i = 0; i < N; i++)
    sum += a[i];
// Final sum = sum of all per-thread partial sums
```

Mechanismus:

1. Každé vlákno má `private` kopii proměnné `sum`, inicializovanou na **neutrální prvek** (identity) dané operace (`0` pro `+`, `1` pro `*`, `INT_MIN` pro `max` atd.).
2. Vlákno akumuluje do své kopie.
3. Na konci se *kopie spojí* operací `+`.

⇒ Žádný souběh, žádná kritická sekce. **Osvědčený postup pro akumulátory.**

| Operace | Neutrální prvek | Příklad |
| :--- | :--- | :--- |
| `+` | 0 | součet |
| `*` | 1 | součin |
| `-` | 0 | součet (stejné jako +) |
| `&` | ~0 | bitové AND |
| `\|` | 0 | bitové OR |
| `^` | 0 | bitové XOR |
| `&&` | 1 | logické AND |
| `\|\|` | 0 | logické OR |
| `max` | nejmenší možná hodnota | maximální prvek |
| `min` | největší možná hodnota | minimální prvek |

OpenMP 4.0+ podporuje *uživatelsky definované redukce* (user-defined reduction, UDR) pro vlastní operace.

## Příklad bez redukce a s redukcí {tier=example}

### Špatně: souběh

```c
int count = 0;
#pragma omp parallel for
for (int i = 0; i < N; i++)
    if (a[i] == 0) count++;        // RACE
```

Výsledek je náhodný a menší, než se očekávalo (ztracené aktualizace, lost updates).

### Špatně: critical (funguje, ale je pomalé)

```c
int count = 0;
#pragma omp parallel for
for (int i = 0; i < N; i++)
    if (a[i] == 0) {
        #pragma omp critical
        count++;       // serializes all threads
    }
```

Funguje, ale je **serializované** — *žádné* paralelní zrychlení. Kritická sekce se stává úzkým hrdlem (bottleneck).

### Správně: reduction

```c
int count = 0;
#pragma omp parallel for reduction(+:count)
for (int i = 0; i < N; i++)
    if (a[i] == 0) count++;
```

Bez souběhu, plně paralelní. Dílčí počty jednotlivých vláken (per-thread partial counts) jsou sjednoceny *automaticky*.

## threadprivate

Globální proměnná, ale s *trvalostí pro každé vlákno* (persistence napříč paralelními oblastmi):

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

`threadprivate` se používá vzácně — typicky pro stav lokální vůči vláknu (thread-local state), například stav generátoru náhodných čísel.

## Paměťový model

OpenMP poskytuje **uvolněnou konzistenci** (relaxed consistency):

- Zápis `a = 1` ve vlákně T1 *nemusí* být *okamžitě* viditelný vláknu T2.
- Operace **flush** (`#pragma omp flush`) vynutí *synchronizační bod* (synchronization point).
- Implicitní flush nastává u: bariéry, kritické sekce, atomic, zámku (lock) a při vstupu do paralelní oblasti i výstupu z ní.

V praxi: pokud používáte `critical` / `atomic` / `barrier` / redukci, *nemusíte se o nic starat*. Pokud aktualizujete sdílené proměnné přímo, použijte **explicitní flush** nebo `atomic`.

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

Tohle je *vzor producent-konzument* (producer-consumer) bez kritické sekce. Je komplikovaný — obvykle je lepší použít `omp_lock`.

## False sharing

```c
int counts[8];   // T0 updates counts[0], T1 updates counts[1], ...

#pragma omp parallel for
for (int i = 0; i < N; i++) {
    int t = omp_get_thread_num();
    counts[t]++;
}
```

Vypadá to čistě. **Problém**: `counts[0..7]` leží na *jedné* cache line (64 B / 4 B = 16 intů na řádek). Každý prvek inkrementuje jiné vlákno → **přehazování cache line tam a zpět** (cache line ping-pong).

Náprava: zarovnání na velikost cache line (padding):

```c
struct {
    int count;
    char padding[60];        // total 64 B
} counts[8];
```

Nebo použít *akumulátory lokální pro vlákno* (thread-local accumulators) sjednocené redukcí.

Podrobnosti v [[false-sharing-races]] (Téma 8).

## Atomic vs critical vs reduction

| Mechanismus | Granularita | Výkon | Použití |
| :--- | :--- | :--- | :--- |
| atomic | jedna operace | nejlepší (HW instrukce) | inkrementace, sčítání, výměna na jedné proměnné |
| critical | blok | střední (mutex) | složitější sekvence aktualizací |
| reduction | implicitní | nejlepší (akumulace po vláknech) | akumulační vzory |
| locks | blok | ruční řízení | jemně zrnité zamykání (fine-grained locking) |

Rozhodování:

1. **Akumulujete do skaláru nebo pole?** → reduction (nebo dílčí součty a ruční sloučení).
2. **Jediná atomická operace (inkrementace, sčítání)?** → atomic.
3. **Vícekroková aktualizace, která musí zachovat invariant?** → critical (nebo zámek).
4. **Potřebujete logickou hodnotu nebo příznak (flag)?** → atomic (nebo volatile + flush).

## Co dál

Téma 7 zde končí. Téma 8 ([[sections-single-master]]) přechází na *model úloh* (task model), *synchronizační primitiva* a *false sharing* — pokročilé konstrukty OpenMP pro nepravidelnou paralelní práci.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Chapman, B., Jost, G., van der Pas, R.: „Using OpenMP" (MIT Press 2008); [OpenMP 5.2 Specification](https://www.openmp.org/specifications/), §2.21 (data sharing); Süß, M., Leopold, C.: „Common Mistakes in OpenMP" (IWOMP 2008); Mattson, T.G.: „A 'Hands-On' Introduction to OpenMP" ([SC tutorial slides](https://www.openmp.org/wp-content/uploads/Intro_To_OpenMP_Mattson.pdf)).*
