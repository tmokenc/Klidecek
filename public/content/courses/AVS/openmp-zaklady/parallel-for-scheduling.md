---
title: parallel for — plánování, chunk, dynamic
---

# OpenMP parallel for — rozdělení iterací mezi vlákna

`#pragma omp parallel for` je tažný kůň (workhorse) OpenMP — paralelizuje smyčku a automaticky rozdělí iterace mezi tým vláken. Klíčové rozhodnutí je strategie plánování (scheduling policy) — tedy *jak* iterace rozdělit.

## Základní syntaxe

```c
#pragma omp parallel for
for (int i = 0; i < N; i++)
    a[i] = b[i] + c[i];
```

Překladač (compiler) vygeneruje toto chování:

1. Vytvoří (fork) tým T vláken.
2. Rozdělí iterace `0..N-1` mezi T vláken.
3. Každé vlákno provede svůj díl iterací (chunk).
4. Na konci je implicitní bariéra (barrier).

## Co musí smyčka splňovat

Aby ji OpenMP mohl paralelizovat, musí platit:

1. **Kanonická forma (canonical form)** — `for (i = init; i < limit; i++)` (nebo `+=, -=, *=`). Žádné `while`.
2. **Známý počet iterací (trip count)** — `limit` a `step` musí být deterministické.
3. **Žádné závislosti přenášené smyčkou (loop-carried dependence)** — `a[i]` nesmí záviset na `a[i-1]`.
4. **Žádný předčasný odchod (early exit)** — žádné `break`, `return`, `goto`. `continue` je v pořádku.

Kanonickou formu a zákaz předčasného odchodu překladač vynutí (jinak ohlásí chybu při překladu). Závislost přenášenou smyčkou ale překladač NEdetekuje — `#pragma omp parallel for` ji tiše paralelizuje a vznikne souběh (race) nebo nesprávný výsledek. Odpovědnost za nezávislost iterací nese programátor.

## Klauzule schedule

```c
#pragma omp parallel for schedule(<kind>, <chunk_size>)
```

Existuje pět druhů:

### static

```c
#pragma omp parallel for schedule(static)
```

Iterace se rozdělí **rovnoměrně** hned na začátku. Pro N = 100 a T = 4 dostane vlákno 0 iterace 0–24, vlákno 1 iterace 25–49 a tak dál.

Pokud je zadán `chunk_size`, přidělují se chunky dané velikosti metodou round-robin (cyklicky po vláknech):

```c
#pragma omp parallel for schedule(static, 16)
// thread 0: 0-15, 64-79, ...
// thread 1: 16-31, 80-95, ...
```

- **Pro**: nulová režie za běhu (runtime), předvídatelné rozdělení.
- **Proti**: pokud iterace trvají *nestejně* dlouho, část vláken čeká.
- **Nejvhodnější pro**: pravidelné numerické smyčky (násobení matic, FFT).

### dynamic

```c
#pragma omp parallel for schedule(dynamic, chunk_size)
```

Iterace se přidělují *za běhu* (runtime) — vlákno *dokončí* svůj chunk a *požádá* o další. Tím se vyrovnává zátěž (load balancing).

```c
#pragma omp parallel for schedule(dynamic, 16)
// Each thread fetches chunk of 16 iterations from work queue
// When done, fetch next 16
```

- **Pro**: výborné vyvážení zátěže pro nepravidelnou práci.
- **Proti**: režie za běhu (fronta úkolů, atomické dekrementy). Více výpadků cache (chunky se střídají mezi vlákny).
- **Nejvhodnější pro**: nerovnoměrnou zátěž (řídké matice, rekurzivní úlohy).

Na velikosti chunku záleží:

- Příliš malý (1) → převládne režie.
- Příliš velký (N/T) → chová se jako static.
- Optimum (sweet spot) bývá typicky 8–64.

### guided

```c
#pragma omp parallel for schedule(guided, chunk_size)
```

*Hybridní* přístup: začne s velkými chunky a postupně je zmenšuje až k velikosti `chunk_size`. Iterace se přidělují dynamicky.

Algoritmus: velikost chunku se počítá jako počet zbývajících iterací / (T × konstanta). Klesá až k `chunk_size`.

- **Pro**: kompromis mezi static a dynamic — menší režie než dynamic, lepší vyvážení než static.
- **Proti**: hůře předvídatelné chování.
- **Nejvhodnější pro**: mírně nerovnoměrnou zátěž.

### auto

```c
#pragma omp parallel for schedule(auto)
```

O rozdělení rozhodne běhové prostředí (runtime). Skutečné chování závisí na konkrétním překladači a běhovém prostředí.

### runtime

```c
#pragma omp parallel for schedule(runtime)
```

Použije se proměnná prostředí `OMP_SCHEDULE`. Praktické pro ladění (tuning) bez nutnosti opětovného překladu.

## Srovnání

::: viz omp-scheduling-comparator "Vyber workload (triangulární / skewed / uniform). Gantt 4 vláken pro 4 schedule strategie — idle čas červeně, % balance vlevo. Dynamic/guided minimalizují čekání."
:::

## Rozhodovací strom

```
Loop work per iteration roughly constant?
├── YES → schedule(static)
└── NO → 
    ├── Variation predictable (e.g. each iteration is O(i)) → schedule(static, large_chunk)
    └── Variation random (e.g. work depends on data) → schedule(dynamic, chunk_size)
        └── chunk_size = 4-64 typically; tune empirically
```

## Nowait

Standardně je na konci `parallel for` implicitní bariéra (barrier). Můžete ji *vypnout*:

```c
#pragma omp parallel
{
    #pragma omp for nowait
    for (int i = 0; i < N; i++) phase1(i);
    
    // bez barrier — vlákna pokračují k phase2 jakmile end of phase1
    
    #pragma omp for
    for (int i = 0; i < N; i++) phase2(i);
}
```

Pokud `phase2` *nezávisí* na výsledcích `phase1`, klauzule `nowait` ušetří bariéru. Pokud je `phase1` nevyvážená (některé vlákno je pomalejší), `nowait` umožní rychlejším vláknům začít `phase2` dříve.

## Collapse

U *vnořených* smyček paralelizuje OpenMP standardně **jen** tu vnější:

```c
#pragma omp parallel for
for (int i = 0; i < N; i++)             // paralelizovaná
    for (int j = 0; j < M; j++)         // sekvenční per thread
        a[i][j] = b[i][j];
```

Pokud je N malé (např. 4) a M velké (1 000 000), získáme paralelismus jen 4×. **Collapse** vnořené smyčky zploští:

```c
#pragma omp parallel for collapse(2)
for (int i = 0; i < N; i++)
    for (int j = 0; j < M; j++)
        a[i][j] = b[i][j];
```

Nyní se iteruje přes `N × M` iterací paralelně. Pro 4×1 000 000 = 4M iterací → rozdělených mezi T vláken.

Omezení `collapse(k)`: vnořené smyčky musí být *pravoúhlé* (rektangulární — meze nesmí záviset na vnějších proměnných) a *bez instrukcí mezi sebou*.

## Transformace smyček

OpenMP 5.0+ přidává direktivy `tile`, `unroll`, `permute`:

```c
#pragma omp tile sizes(4, 8)
for (int i = 0; i < N; i++)
    for (int j = 0; j < M; j++)
        ...

#pragma omp unroll
for (int i = 0; i < 8; i++)
    ...
```

Tile (blokování, blocking) je optimalizace pro cache. Unroll (rozbalení smyčky) zvyšuje paralelismus na úrovni instrukcí (ILP). Před OpenMP 5 šlo o vlastnost překladače (`-funroll-loops`); nyní je tato funkce standardizovaná.

## parallel for s podporou SIMD

```c
#pragma omp parallel for simd
for (int i = 0; i < N; i++)
    a[i] = b[i] * c[i];
```

Kombinace dvou úrovní: paralelizace mezi vlákna **+** vektorizace uvnitř. Pro AXPY na 8 jádrech s AVX2 je teoretický strop 8 jader × 8 lanes (drah) = 64×; reálná AXPY je ale omezená pamětí (memory-bound), takže skutečné zrychlení je výrazně nižší (limit je propustnost paměti).

GCC s `-O3 -fopenmp -march=native` zahrne pragmu SIMD efektivně.

## Co dál

[[datova-prostredi]] popisuje klauzule pro sdílení dat (data sharing): private / shared / reduction. To je kritické pro správnost paralelního kódu (souběhy, false sharing).

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Chapman, B., Jost, G., van der Pas, R.: „Using OpenMP" (MIT Press 2008); [OpenMP 5.2 Specification](https://www.openmp.org/specifications/), §11; Süß, M., Leopold, C.: „Common Mistakes in OpenMP and How to Avoid Them" (IWOMP 2008).*
