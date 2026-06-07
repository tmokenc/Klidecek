---
title: sections, single, master — work-sharing direktivy
---

# Work-sharing: sections, single, master

`parallel for` ([[parallel-for-scheduling]]) je nejčastější work-sharing direktiva. Pro *jiné* vzory existují direktivy **sections**, **single** a **master**. Jde o *funkční* paralelismus: u `sections` běží různé úkoly současně, u `single` provede daný blok *jedno* vlákno (thread) a `master` má speciální roli vyhrazenou hlavnímu vláknu.

## sections — funkční paralelismus

Když máte *více různých* úkolů, které mohou běžet paralelně:

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

Každá `section` je *přiřazena* některému vláknu. Pokud je počet vláken T = 4 a sekce jsou jen 3, jedno vlákno bude nečinné (idle), pokud nezdvojuje práci. Pokud je T = 2 a sekce jsou 3, jedno z vláken vykoná 2 sekce postupně za sebou.

Synchronizace: na konci `sections` je implicitní bariéra (implicit barrier). Lze ji vypnout pomocí `sections nowait`.

### Kdy použít

- **Heterogenní úkoly** — například současně načítat vstup, parsovat a zpracovávat.
- **Fáze kolony (pipeline stages)** — fáze 1 vyrobí data, fáze 2 je spotřebuje (s frontou typu producent-konzument).
- **Různé algoritmy nad stejnými daty** — kontrolní součet (checksum) plus parsování, vyhledávání plus řazení.

### Limity

- Počet sekcí je statický. Pokud chcete *dynamický* počet úkolů, použijte `tasks` ([[tasks-openmp]]).
- Pokud mají sekce *nestejnou* dobu běhu, je rozvrhování (scheduling) nevyvážené — nelze ho automaticky vybalancovat.

## single — jediné vlákno

V paralelní oblasti (parallel region) provede daný blok *jedno* (libovolné) vlákno:

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

Klíčová použití:

- **Inicializace** — alokace paměti, otevření souboru.
- **Výpisy** (`print` při ladění, debuggingu).
- **Hlavní vlákno zapisuje do sdíleného stavu**, zatímco pracovní vlákna se připravují.

Vlákno, které vykoná `single`, je *určeno implementací* (typicky první, které dorazí). Ostatní *čekají* na implicitní bariéře.

### nowait

```c
#pragma omp single nowait
{
    init();
}
```

Bez bariéry — ostatní vlákna pokračují dál a nečekají. Vlákno provádějící `single` se tím zpozdí. Pak je nutná *ruční* synchronizace, pokud následuje práce s inicializačními daty.

## master — pouze hlavní vlákno

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

Blok `master` provede *vlákno 0* (master). Ostatní vlákna ho *přeskočí* a nečekají.

### master vs single

| | master | single |
| :--- | :--- | :--- |
| Které vlákno | vlákno 0 | *libovolné* vlákno (první, které dorazí) |
| Implicitní bariéra? | **NE** | **ANO** (lze vypnout přes nowait) |
| Použití | jednoduché oznámení | inicializace, kterou potřebují ostatní |

`master` je *rychlejší* (bez bariéry), ale méně flexibilní. Hodí se lépe pro výpis/log; hůře pro inicializaci.

## Direktiva workshare (pouze ve Fortranu)

OpenMP ve Fortranu má direktivu `workshare` pro operace nad poli:

```fortran
!$omp parallel workshare
A = B + C * 2
WHERE (A > 0) A = A / 2
!$omp end parallel workshare
```

Ekvivalentem v C/C++ je `parallel for` přes celé pole. `workshare` je *fortranovská* abstrakce nad operacemi ve stylu numpy.

## Kombinované direktivy

OpenMP umožňuje *zkratky* — kombinovat `parallel` s work-sharing direktivou:

```c
#pragma omp parallel for      // = parallel + for
for (...) { ... }

#pragma omp parallel sections
{
    #pragma omp section
    ...
}
```

Nemusíte vytvářet samostatnou explicitní `parallel` oblast. Direktiva implicitně vytvoří (forkne) tým vláken a okamžitě rozdělí práci mezi ně.

## Příklad: vzor kolony (pipeline) {tier=example}

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

Tři nezávislé fáze. Fronty (queues) jsou synchronizační datová struktura — musí být bezpečné pro souběžný přístup z více vláken (thread-safe), tedy souběžná (concurrent) fronta.

Kompromis: režie synchronizace (synchronization overhead) proti propustnosti (throughput). Pokud fronta používá zámek (lock), soupeření o zámek (lock contention) ji zpomalí. Lepší je bezzámková (lock-free) fronta, například Michael-Scottova fronta.

## Příklad: řídicí vlákno a pracovní vlákna {tier=example}

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

Hlavní vlákno (master) generuje úlohy (tasks), pracovní vlákna — včetně hlavního vlákna poté, co je dogeneruje — je spotřebovávají přes plánovač úloh (task scheduler). Podrobnosti najdete v [[tasks-openmp]].

## Co dál

[[tasks-openmp]] popisuje direktivu **task** — dynamický paralelismus, ideální pro nepravidelnou práci (procházení stromů, rekurzivní algoritmy). Pak [[synchronizace-bariery]], [[locks-openmp]] a [[false-sharing-races]] dokončí Téma 8.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Chapman, B., Jost, G., van der Pas, R.: „Using OpenMP" (MIT Press 2008), §4; [OpenMP 5.2 Specification](https://www.openmp.org/specifications/), §11 (Work-sharing constructs).*
