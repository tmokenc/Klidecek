---
title: Synchronizace — barrier, critical, atomic
---

# OpenMP synchronizace — barrier, critical, atomic, ordered

Synchronizace je *jediný způsob*, jak ve sdílené paměti (shared memory) zajistit konzistentní výsledek. OpenMP poskytuje hierarchii primitiv od *globálních* (barrier) až po *atomární* (jediná instrukce).

## barrier — čekání na všechna vlákna

```c
#pragma omp parallel
{
    phase1();
    #pragma omp barrier        // wait for all threads
    phase2();                  // begins only after all done phase1
}
```

`barrier` je *globální* synchronizace v rámci týmu vláken. Žádné vlákno nepokračuje za tento bod, dokud ho nedosáhnou *všechna* ostatní vlákna.

Implementace: typicky dva atomické čítače (počet vláken, která dorazila, a počet těch, která odešla) plus aktivní čekání (busy-wait). Cena je obvykle řádově 100–1000 cyklů.

### Implicitní bariéry

OpenMP *automaticky* vkládá bariéru:

- Na konci oblasti `parallel`.
- Na konci `for` (lze potlačit klauzulí `nowait`).
- Na konci `sections` (lze potlačit).
- Na konci `single` (lze potlačit).

Konstrukce `master` implicitní bariéru *nemá*.

## critical — výlučný přístup

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

V bloku `critical` smí být v jednu chvíli *pouze jedno* vlákno. Implementuje se pomocí zámku (mutex lock).

Cena: zhruba 100–500 cyklů na jeden pár zamknutí a odemknutí (lock/unlock).

### Pojmenovaná critical

```c
#pragma omp critical (counter_lock)
counter++;

#pragma omp critical (log_lock)
write_log();
```

Pokud mají bloky *různá* jména zámků, používají *různé* mutexy — a tudíž se navzájem *neserializují*. Bez jména naopak *všechny anonymní* bloky `critical` sdílejí *jeden globální mutex* (což je špatně).

## atomic — jediná instrukce

```c
#pragma omp atomic
counter++;
```

Provede se *jediná* atomická hardwarová instrukce — *žádný* mutex, *žádné* přepnutí kontextu (context switch).

Implementace na x86: `LOCK INC [counter]` (s prefixem LOCK). Cena: 10–50 cyklů (přenos řádku cache kvůli jeho invalidaci).

Atomic je pro jednu operaci *vždy lepší* než critical, ale je *omezena* na:

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

Více operací najednou (např. `counter += compute()`) atomic **není** — pro ty je nutné použít `critical`.

### atomic vs critical

| Mechanismus | Omezení | Režie |
| :--- | :--- | :---: |
| atomic | jedna operace LOAD/STORE/RMW | ~30 cyklů |
| critical | libovolný blok | ~200 cyklů |
| reduction | vzor akumulátoru | ~10 cyklů na vlákno (nejlepší) |
| locks | manuální, jemně zrnitý (fine-grained) | ~100 cyklů |

Praktické pravidlo:

- Inkrementace/přičtení jediné proměnné → **atomic**.
- Akumulace přes celý cyklus → **reduction**.
- Složitější blok aktualizací → **critical**.
- Jemně zrnitá ochrana datové struktury → **locks**.

## ordered — sériové pořadí uvnitř paralelního cyklu

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

`ordered` zaručí, že *sériový* blok provedou vlákna v *původním pořadí* iterací. Hodí se pro:

- Tisk výstupu ve správném pořadí.
- Zápis do souboru v pořadí.
- Numerické algoritmy vyžadující sekvenční postup (Gauss-Seidel).

Daň: tato část kódu se *serializuje*. Pokud je blok `ordered` výpočetně náročný, žádné zrychlení (speedup) nezískáte.

## flush — konzistence paměti

```c
#pragma omp flush         // flush all shared variables
#pragma omp flush(x, y)   // flush specific variables
```

Vynutí *globální* viditelnost. Implementuje:

- Paměťovou bariéru (memory barrier, `mfence` na x86), která zajistí pořadí operací load/store a vyprázdní dočasný pohled vlákna do koherentní paměti. Invalidaci řádků cache mezi jádry řeší automaticky hardwarová koherence, nikoli `flush`.

Implicitní flush nastává u: barrier, critical (při vstupu i výstupu), atomic, zámku (při vstupu i výstupu) a vstupu i výstupu z paralelní oblasti.

Ruční `flush` je vzácný — programátor jej obvykle nepíše explicitně. Paměťový model OpenMP je relaxovaný (relaxed), takže synchronizace je většinou skrytá v jiných direktivách.

### Příklad — producent-konzument bez zámků {tier=example}

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

Tento přístup je bez detailní znalosti paměťového modelu *nebezpečný*. Lepší je použít `omp_lock` nebo `critical`.

## Příklady společně {tier=example}

### Histogram — špatně a dobře

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

Akumulátor zvlášť pro každé vlákno a následné sloučení (merge) je klasický vzor. Uvnitř horké smyčky (hot loop) nevzniká *žádný* souběh (race) a slučování je *malé* (256 operací).

### Minimum / maximum

```c
int min_val = INT_MAX;
#pragma omp parallel for reduction(min:min_val)
for (int i = 0; i < N; i++)
    min_val = (a[i] < min_val) ? a[i] : min_val;
```

`reduction(min)` je dostupná od OpenMP 3.1. Hardware efektivně serializuje slučování dílčích výsledků jednotlivých vláken.

## Bariéra v algoritmech

Mnoho paralelních algoritmů má následující strukturu:

```
loop {
    parallel phase 1;
    barrier;
    parallel phase 2;
    barrier;
}
```

Patří sem klasické algoritmy (Gauss-Seidel, BFS po vrstvách, Jacobiho iterace, MapReduce). Náklad: jedna bariéra v každé iteraci.

Pro **N** iterací × cenu bariéry **B**: pokud B = 1 μs a N = 1000, je celková režie 1 ms. Pro velkou práci v jednotlivých fázích je to v pořádku; pro lehké fáze se to ale stane kritickou částí celkového času.

Optimalizace: *asynchronní iterace* (asynchronní Gauss-Seidel) — odstraní bariéru, ale konvergence je pomalejší.

## Co dál

[[locks-openmp]] zavádí *manuální* zámky (locks) — jemně zrnitou alternativu ke critical/atomic. [[false-sharing-races]] popisuje *skryté* souběhy (race conditions) vznikající sdílením řádku cache.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Chapman, B., Jost, G., van der Pas, R.: „Using OpenMP" (MIT Press 2008), §5; [OpenMP 5.2 Specification](https://www.openmp.org/specifications/), §15-16 (Synchronization); Adve, S.V., Gharachorloo, K.: „Shared Memory Consistency Models: A Tutorial" (IEEE Computer 29(12), 1996).*
