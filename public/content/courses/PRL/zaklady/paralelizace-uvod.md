---
title: Paralelizace úlohy — sekvenční vs paralelní výpočet
---

# Paralelizace úlohy — co a proč

PRL (Paralelní a distribuované algoritmy) řeší jednu fundamentální otázku: **kdy a jak lze výpočet zrychlit přidáním více procesorů?** Intuitivně se zdá, že 10× víc procesorů = 10× kratší čas. Realita je dramatic složitější — některé úlohy *nelze* paralelizovat, jiné *přinášejí* paralelní overhead, který zrychlení omezí. Tato první sekce zavádí *terminologii* a *fundamentální omezení*; následující kapitoly probírají *konkrétní modely* (PRAM, Flynn taxonomy) a *algoritmy*.

## Sekvenční vs paralelní výpočet

**Sekvenční výpočet**: jeden procesor zpracovává *jednu data sekvenci* za druhou. Klasický model počítače 1945–dneška na úrovni jednoho jádra.

**Paralelní výpočet**: úloha je rozdělena na **podúlohy**, které lze vykonávat *současně* na *více procesorech*. Pokud úloha zabere sekvenčně čas $T_\text{sekv}$, *ideálně* $N$ procesorů ji vykoná za:

$$
T_\text{par} = \frac{T_\text{sekv}}{N}
$$

V praxi to *neplatí* — z důvodů, které tento kurz prozkoumá.

## Proč paralelizovat

Tři pragmatické důvody:

1. **Frekvenční stěna**. CPU clock zastavila růst na ~5 GHz kolem 2005. Single-thread výkon roste pomalu (2–5 % ročně) — díky lepším mikroarchitekturám, ne frekvenci. Paralelismus je *jediná* cesta, jak víc výkonu získat.
2. **Energetická efektivita**. Jeden výkonný procesor spotřebuje exponenciálně víc energie než N pomalejších s ekvivalentním součtem výkonu (proto smartphone mají 8 jader s 2 GHz, ne 1 jádro s 16 GHz).
3. **Inherentně paralelní problémy**. Některé výpočty *jsou* paralelní svou povahou — simulace fyzikálních systémů (každý atom nezávisle), grafika (každý pixel), machine learning (každý vzorek datasetu).

## Klasická omezení

### Sekvenční podíl úlohy

Žádná úloha *není 100 % paralelizovatelná*. Vždy existuje **sekvenční režie**:

- **Inicializace** — alokace paměti, načtení dat.
- **Synchronizace** — výsledky podúloh se musí *sloučit*.
- **Final aggregation** — z parciálních výsledků jeden výsledek.
- **Read-modify-write s sdílenou pamětí** — sériový.

Klíčové pozorování: i kdyby paralelní část trvala 0 sekund, celkový čas nemůže být menší než sekvenční režie.

### Komunikační overhead

Pokud procesory běží **nezávisle** (embarrassingly parallel — image rendering, Monte Carlo), žádná komunikace nepotřebná. Když potřebují **sdílet data** (matrix multiplication, graph algorithms), čas roste s množstvím komunikace.

Komunikace má dva náklady:

- **Latence** — fixní cena za přepravu jedné zprávy (~µs v cluster, ~ns v shared memory).
- **Bandwidth** — kolik bajtů za sekundu lze přenést.

Pro krátké zprávy dominuje latence, pro dlouhé bandwidth.

### Load imbalance

Pokud podúlohy *netrvají stejně dlouho*, rychlejší procesory *čekají* na pomalejší. Speedup limitován nejpomalejší podúlohou.

Příklad: 100 čísel rozdělíme na 4 procesory po 25. Pokud první procesor počítá faktoriály malých čísel a čtvrtý velkých, čtvrtý dokončí *mnohem později*. Speedup pak ne 4× ale třeba 1.5×.

## Granularita

**Granularita** = velikost podúlohy. Trade-off:

- **Jemná granularita** (mnoho malých úloh) — dobrá load balance, ale komunikační režie převáží.
- **Hrubá granularita** (málo velkých úloh) — minimální komunikace, ale load imbalance.

Optimální granularita závisí na **architektuře** a **úloze**. Pro CPU clusters: zhruba milisekunda na úlohu. Pro GPU SIMD: nanosekundy.

## Zrychlení a efektivita — definice

**Zrychlení (speedup)**:

$$
S(N) = \frac{T_\text{sekv}}{T_\text{par}(N)}
$$

kde $T_\text{sekv}$ je *čas nejlepšího sekvenčního algoritmu* a $T_\text{par}(N)$ je *čas paralelního algoritmu na $N$ procesorech*.

Ideální $S(N) = N$. V praxi $S(N) < N$.

**Efektivita**:

$$
E(N) = \frac{S(N)}{N} = \frac{T_\text{sekv}}{N \cdot T_\text{par}(N)}
$$

Ideální $E = 1$ (= 100 %). Snižování $E$ s $N$ ukazuje, že přidávání procesorů má klesající návratnost.

::: svg "Speedup vs počet procesorů — ideální a reálné"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6">
    <line x1="50" y1="180" x2="510" y2="180"/>
    <line x1="50" y1="20" x2="50" y2="180"/>
  </g>
  <g fill="var(--text-muted)" font-size="10">
    <text x="280" y="195" text-anchor="middle">počet procesorů N</text>
    <text x="20" y="100" transform="rotate(-90 20 100)" text-anchor="middle">speedup S(N)</text>
  </g>
  <line x1="50" y1="180" x2="490" y2="20" stroke="var(--text-faint)" stroke-dasharray="3 3"/>
  <text x="475" y="35" fill="var(--text-faint)" font-size="10" text-anchor="end">ideální S = N</text>
  <path d="M50,180 C 150,130 250,90 350,70 C 410,65 470,80 510,100" fill="none" stroke="var(--accent)" stroke-width="1.8"/>
  <text x="475" y="120" fill="var(--accent)" font-size="10">reálné</text>
  <text x="375" y="170" fill="var(--text-muted)" font-size="9">limit dán sekvenčním podílem</text>
</svg>
:::

Reálný speedup *konverguje* k limitě dané sekvenčním podílem — formálně to popisuje **Amdahlův zákon** ([[amdahl-gustafson]]).

## Cena (cost)

**Cena (cost)** výpočtu:

$$
c(n) = N \cdot t(n)
$$

= celkový "procesor-čas" konzumovaný N procesory za čas $t(n)$. Měří se *celková práce*.

**Optimální algoritmus**: $c(n) = O(T_\text{sekv})$ — paralelní algoritmus *neplýtvá*; spotřebuje *stejně* procesorpráce co sekvenční. To je *ideál*; mnoho paralelních algoritmů má $c(n) > T_\text{sekv}$ (např. redundantní výpočty).

Příklad: paralelní redukce 1 milionu čísel:

- Sekvenční: $T_\text{sekv} = O(n) = 10^6$ operací.
- Paralelní s $N = n$ procesory: $t(n) = O(\log n) = 20$ kroků; $c(n) = n \log n$.
- *Není* cost-optimal — sekvenční je *menší* cost.

Optimalizace: paralelní s $N = n / \log n$ → $t(n) = O(\log n)$, $c(n) = n$ ⇒ *optimal*.

## Stratifikace problémů podle paralelizovatelnosti

| Třída | Charakter | Příklady |
| :--- | :--- | :--- |
| **Embarrassingly parallel** | nezávislé podúlohy, žádná komunikace | rendering, Monte Carlo, brute-force search |
| **Data parallel** | stejná operace nad různými daty | matrix ops, image processing, GPU SIMD |
| **Task parallel** | různé operace, mírná komunikace | pipeline (compiler, network stack) |
| **Tightly coupled** | hojná komunikace mezi podúlohami | PDE solvers, n-body simulace |
| **Inherentně sekvenční** | žádná paralelizace možná | RC4 stream cipher, hash chain |

Klasifikace pomáhá *odhadnout*, co paralelizace přinese, *před* implementací.

## Co dál

[[amdahl-gustafson]] formalizuje *limity* paralelizace přes dva zákony — Amdahlův (fixed-size problém) a Gustafsonův (scaled problém). [[flynn-klasifikace]] zavádí standardní taxonomii paralelních architektur (SISD/SIMD/MISD/MIMD). [[ne-vn-architektury]] ukáže *alternativní* modely výpočtu (dataflow, redukční), které nejsou založeny na von Neumannově architektuře.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Quinn, M.J.: *Parallel Programming in C with MPI and OpenMP* (McGraw-Hill 2003); Akl, S.G.: *The Design and Analysis of Parallel Algorithms* (Prentice Hall 1989); Grama, A. et al.: *Introduction to Parallel Computing* (2. vyd., Addison-Wesley 2003).*
