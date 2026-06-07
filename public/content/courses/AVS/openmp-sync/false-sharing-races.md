---
title: False sharing, souběhy (race conditions) a NUMA efekty
---

# False sharing — skrytá pokuta paralelního kódu

False sharing je souběh (race condition) na úrovni cache. Vlákna (thread) zapisují do *různých* proměnných, které ovšem *náhodou* leží *na stejné cache line*. Hardwarová koherence cache (cache koherence) je zamění za skutečnou kolizi a vyvolá *ping-pong cache line* — tatáž line se opakovaně přenáší mezi jádry.

V *kódu* přitom žádný souběh není, a přesto dojde k dramatickému zpomalení.

## Příklad — počítadla na vlákno

```c
int counts[8];   // 8 ints = 32 B, jedna cache line je 64 B

#pragma omp parallel num_threads(8)
{
    int id = omp_get_thread_num();
    for (int i = 0; i < N; i++) {
        counts[id]++;       // each thread updates own slot
    }
}
```

Kód vypadá *naprosto bezpečně*. Každé vlákno aktualizuje svůj *vlastní* slot — žádná logická kolize tu není.

Realita je ale taková, že `counts[0..7]` leží *všechna* na *jedné* cache line. Když vlákno T0 aktualizuje `counts[0]`, stane se následující:

1. Line je „dirty" (změněná) v L1 jádra 0.
2. Jádro 1 chce aktualizovat `counts[1]` — *musí* získat line ve výhradním (exclusive) režimu.
3. Koherence cache ([[koherence-uvod]]) *invaliduje* line v jádru 0 a přenese ji na jádro 1.
4. Vlákno T2 chce `counts[2]` → line putuje na jádro 2.
5. ...

Vzniká kolotoč (round-robin): při každé aktualizaci line jezdí mezi jádry. Jediná aktualizace pak stojí 50–100 cyklů (přenos cache line) místo 1 cyklu (zásah v L1, tedy L1 hit).

⇒ Výkon (performance) je **10–100× horší** než u sériového kódu.

::: svg "False sharing — cache line ping-pong"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="30" width="80" height="50" rx="3"/>
    <rect x="120" y="30" width="80" height="50" rx="3"/>
    <rect x="220" y="30" width="80" height="50" rx="3"/>
    <rect x="320" y="30" width="80" height="50" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="60" y="50">Core 0 L1</text>
    <text x="160" y="50">Core 1 L1</text>
    <text x="260" y="50">Core 2 L1</text>
    <text x="360" y="50">Core 3 L1</text>
  </g>
  <text x="60" y="68" text-anchor="middle" fill="var(--text-muted)" font-size="9">counts[0]</text>
  <text x="160" y="68" text-anchor="middle" fill="var(--text-muted)" font-size="9">counts[1]</text>
  <text x="260" y="68" text-anchor="middle" fill="var(--text-muted)" font-size="9">counts[2]</text>
  <text x="360" y="68" text-anchor="middle" fill="var(--text-muted)" font-size="9">counts[3]</text>
  <g stroke="var(--accent-line)" fill="none" stroke-width="1.5">
    <path d="M100,55 Q110,38 120,55" marker-end="url(#fsh-ar)"/>
    <path d="M200,55 Q210,38 220,55" marker-end="url(#fsh-ar)"/>
    <path d="M300,55 Q310,38 320,55" marker-end="url(#fsh-ar)"/>
  </g>
  <text x="270" y="100" text-anchor="middle" fill="var(--accent-line)" font-size="10">cache line ping-pong (invalidace + transfer)</text>
  <g fill="var(--bg-card)" stroke="var(--accent)">
    <rect x="20" y="130" width="500" height="40" rx="3"/>
  </g>
  <text x="270" y="148" text-anchor="middle" fill="var(--text)" font-weight="600">jediná 64-byte cache line obsahuje counts[0..7]</text>
  <text x="270" y="162" text-anchor="middle" fill="var(--text-muted)" font-size="9">Hardware zaměňuje per-element updates za sdílení celé line</text>
  <text x="270" y="210" text-anchor="middle" fill="var(--text-faint)" font-size="9">Důsledek: 50-100 cyklů per update místo 1 — slowdown řádově</text>
  <defs>
    <marker id="fsh-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent-line)"/>
    </marker>
  </defs>
</svg>
:::

::: viz false-sharing-pingpong "Spusť 4 jádra ťukající na counts[0..3]. Bez paddingu cache line ping-pongne (červené šipky); s paddingem má každé jádro vlastní line a propustnost vyletí."
:::

## Detekce

### Příznaky

- Vícevláknový běh je *pomalejší* než jednovláknový, a to *bez* explicitního zámku (lock).
- Mimořádně vysoká četnost přenosů cache line ve výkonnostních čítačích (perf counters).
- Vysoká míra výpadků v L1D (50+ %), která ovšem není způsobena velikostí pracovní množiny.

### Výkonnostní čítače (perf counters)

```bash
perf stat -e l1d.replacement,l2_rqsts.all_demand_miss,mem_inst_retired.lock_loads ...
```

Čítač `mem_inst_retired.lock_loads` ukazuje atomické operace (atomic) a invalidace cache line.

Intel VTune dokáže přes report „Memory access pattern" ukázat *přesně* ty problematické line.

## Řešení

### 1. Padding na velikost cache line

```c
struct {
    int count;
    char padding[60];        // total 64 B
} counts[8] __attribute__((aligned(64)));
```

Každý `count` teď leží na vlastní line. False sharing zmizí.

Cena je v paměti (8× 64 B = 512 B místo 32 B). Pro malá pole (array) je to ale zanedbatelné.

### 2. Lokální akumulátor a sloučení

```c
int total_counts[8] = {0};

#pragma omp parallel
{
    int local = 0;
    #pragma omp for nowait
    for (int i = 0; i < N; i++) {
        if (a[i] == 0) local++;
    }
    int id = omp_get_thread_num();
    #pragma omp atomic
    total_counts[id] += local;
}
```

Proměnná `local` je u každého vlákna na jeho zásobníku (stack), takže nic sdíleného nevzniká. Sloučení proběhne jen jednou na konci — pole `total_counts[]` má sice stejné rozložení jako původní `counts[]`, ale každé vlákno se ho dotkne *jen jednou* mimo horkou smyčku (hot loop), takže ping-pong je zanedbatelný.

### 3. Redukce (reduction)

```c
int count = 0;
#pragma omp parallel for reduction(+:count)
for (int i = 0; i < N; i++)
    if (a[i] == 0) count++;
```

Nejvhodnější pro skalární akumulátor. Per-vláknové akumulátory generuje *překladač (compiler)* sám, takže k žádnému false sharingu nedochází.

### 4. Přepracování datové struktury

Pokud máte strukturu (struct) s položkami, k nimž se přistupuje *souběžně*:

```c
// Bad:
struct Stats {
    int reads, writes, errors;    // 12 B, 1 cache line
};

// Better:
struct Stats {
    int reads;
    char pad1[60];
    int writes;
    char pad2[60];
    int errors;
};

// Or split:
struct ReadStats { int reads; };       // 1 cache line each
struct WriteStats { int writes; };
struct ErrorStats { int errors; };
```

## Souběhy (race conditions) — klasické

False sharing je souběh na úrovni *výkonu*. *Klasický* souběh je naproti tomu souběh na úrovni *správnosti*:

```c
int counter = 0;
#pragma omp parallel for
for (int i = 0; i < N; i++)
    counter++;        // RACE — lost updates
```

Bez direktivy `atomic` nebo `reduction` vyjde výsledek **menší než N** — některé aktualizace se ztratí (lost updates).

### Souběh vs. false sharing

| | Souběh (race) | False sharing |
| :--- | :--- | :--- |
| Ovlivňuje | správnost | výkon |
| Pozná se podle | chybného výstupu | profilování |
| Náprava | atomic / zámek (lock) | padding / rozdělení |
| Synonyma | datový souběh (data race), lost update | soupeření o cache line (cache line contention) |

Souběh může nastat *bez* false sharingu (jediná atomická proměnná). A naopak false sharing může nastat *bez* souběhu (každé vlákno má vlastní slot).

## NUMA efekty

V systému NUMA ([[uma-numa]]) závisí cena přístupu do paměti na *fyzickém umístění* dat:

- Lokální uzel NUMA (local NUMA node): 80 cyklů.
- Vzdálený uzel NUMA (remote NUMA node): 200–300 cyklů.

Pokud vlákno T0 alokuje data na uzlu NUMA 0, ale vlákno T1 z uzlu NUMA 1 je *čte/zapisuje*, je přístup až 3× pomalejší. Tomu se říká pokuta za NUMA (NUMA penalty).

### Politika first-touch

Linux standardně používá politiku **first-touch**: stránka se alokuje na tom *uzlu NUMA, jehož vlákno se jí dotkne jako první*.

```c
float *a = malloc(N * sizeof(float));
// Page NOT yet allocated — just virtual mapping

#pragma omp parallel for
for (int i = 0; i < N; i++)
    a[i] = 0.0;          // first touch — page allocated on local NUMA
```

Pokud `parallel for` rozdělí iterace mezi uzly NUMA, *každá stránka* se alokuje na uzlu NUMA lokálním pro *své* vlákno. Následné přístupy jsou pak rychlé.

**Špatný vzor**: alokace a inicializace *v jednom vlákně*, teprve poté paralelní použití → vše skončí na 1 uzlu NUMA → vzniká úzké hrdlo (bottleneck).

### Alokace s ohledem na NUMA

```bash
numactl --cpunodebind=0 --membind=0 ./prog
```

Vynutí alokaci i běh na uzlu NUMA 0. Tím se vyhnete provozu napříč uzly NUMA (cross-NUMA traffic).

Programově lze použít `numa_alloc_local()` nebo `numa_alloc_onnode(size, node)`.

V OpenMP 5.0+ lze přes klauzuli `affinity` v úlohách (task) ladit lokalitu vůči NUMA.

## Cena atomických instrukcí

Direktiva `#pragma omp atomic` vyžaduje cache line ve výhradním (exclusive) režimu — koherenční protokol ji musí invalidovat z ostatních jader.

Cena na typickém hardwaru:

- L1 hit a žádní další sdílející: 5–10 cyklů.
- Line sdílená se sousedy: 100–300 cyklů (rozeslání invalidace, invalidation broadcast).
- Napříč NUMA (cross-NUMA): 500+ cyklů.

⇒ Atomická operace v horké smyčce (hot loop) *nad sdílenou proměnnou* znamená úzké hrdlo. Per-vláknový akumulátor se závěrečným sloučením je řádově lepší.

## Co dál

Téma 8 zde končí. Téma 9 ([[koherence-uvod]]) přechází ke *koherenci cache* na úrovni *hardwaru* — protokoly MESI/MOESI, snooping vs. directory. Poté [[uma-numa]] podrobně popíše topologie NUMA.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Drepper, U.: „What Every Programmer Should Know About Memory" (Red Hat 2007, [PDF](https://www.akkadia.org/drepper/cpumemory.pdf)); Bolosky, W.J., Scott, M.L.: „False Sharing and Its Effect on Shared Memory Performance" (Sedms IV 1993); Chapman, B., Jost, G., van der Pas, R.: „Using OpenMP" (MIT Press 2008), §7 (Performance).*
