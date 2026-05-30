---
title: Up-sweep + Down-sweep — paralelní scan
---

# Paralelní algoritmus sumy prefixů

Předchozí kapitola ([[prefix-sum-uvod]]) definovala scan/prescan/reduce a ukázala jejich rozmanité aplikace. Tato kapitola probírá konkrétní *paralelní algoritmus* — **up-sweep** (reduce fáze) a **down-sweep** (distribuce fáze) — který běží v $O(\log n)$ na $O(n)$ procesorech a je *cost-optimal* po Brentově optimalizaci. Je to *standardní* implementace scan operace (Blelloch 1990) v knihovnách jako CUDA Thrust a v hardware AVX.

## Předpoklady

- Vstup $A[0..n-1]$ uložený ve sdílené paměti, $n = 2^d$ je mocnina dvojky (jinak se zaokrouhlí).
- *Asociativní* operátor $\oplus$ s *neutrálním* prvkem $I$ (pro prescan).
- PRAM model — EREW stačí (žádné dvě iterace nečtou nebo nepíšou tutéž buňku).

## Fáze 1 — Up-sweep (reduce na stromě)

První fáze je *přesně* paralelní redukce stromem (viz [[pram-algoritmy]]) s tím *navíc*, že **každý vnitřní uzel si pamatuje mezisoučet**.

```
procedure UP_SWEEP(A[0..n-1])         // EREW PRAM
  for d = 0 to log(n) - 1 do
    for i = 0 to n - 1 step 2^(d+1) do in parallel
      A[i + 2^(d+1) - 1] ← A[i + 2^d - 1] ⊕ A[i + 2^(d+1) - 1]
    endfor
  endfor
```

Po této fázi:

- $A[n-1]$ obsahuje *celkovou redukci* $a_0 \oplus a_1 \oplus \cdots \oplus a_{n-1}$.
- Vnitřní pozice obsahují *parciální* mezisoučty — informace, kterou bude potřeba dolní fáze.

::: svg "Up-sweep pro n = 8 — strom redukcí"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.8" fill="var(--bg-card)">
    <rect x="40" y="170" width="34" height="22"/>
    <rect x="100" y="170" width="34" height="22"/>
    <rect x="160" y="170" width="34" height="22"/>
    <rect x="220" y="170" width="34" height="22"/>
    <rect x="280" y="170" width="34" height="22"/>
    <rect x="340" y="170" width="34" height="22"/>
    <rect x="400" y="170" width="34" height="22"/>
    <rect x="460" y="170" width="34" height="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="57" y="185">3</text>
    <text x="117" y="185">1</text>
    <text x="177" y="185">7</text>
    <text x="237" y="185">0</text>
    <text x="297" y="185">4</text>
    <text x="357" y="185">1</text>
    <text x="417" y="185">6</text>
    <text x="477" y="185">3</text>
  </g>
  <g fill="var(--accent)" font-size="10" text-anchor="middle">
    <text x="117" y="135">4</text>
    <text x="237" y="135">7</text>
    <text x="357" y="135">5</text>
    <text x="477" y="135">9</text>
    <text x="237" y="90">11</text>
    <text x="477" y="90">14</text>
    <text x="477" y="45">25</text>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.5">
    <line x1="57" y1="170" x2="115" y2="138"/>
    <line x1="117" y1="170" x2="117" y2="138"/>
    <line x1="177" y1="170" x2="235" y2="138"/>
    <line x1="237" y1="170" x2="237" y2="138"/>
    <line x1="297" y1="170" x2="355" y2="138"/>
    <line x1="357" y1="170" x2="357" y2="138"/>
    <line x1="417" y1="170" x2="475" y2="138"/>
    <line x1="477" y1="170" x2="477" y2="138"/>
    <line x1="117" y1="135" x2="235" y2="92"/>
    <line x1="237" y1="125" x2="237" y2="92"/>
    <line x1="357" y1="135" x2="475" y2="92"/>
    <line x1="477" y1="125" x2="477" y2="92"/>
    <line x1="237" y1="80" x2="475" y2="48"/>
    <line x1="477" y1="80" x2="477" y2="48"/>
  </g>
  <g fill="var(--text-muted)" font-size="9">
    <text x="510" y="185" text-anchor="end">vstup</text>
    <text x="510" y="135" text-anchor="end">d=0</text>
    <text x="510" y="90" text-anchor="end">d=1</text>
    <text x="510" y="45" text-anchor="end">d=2 (reduce)</text>
  </g>
</svg>
:::

**Čas**: $\log n$ kroků; v iteraci $d$ aktivních $n / 2^{d+1}$ procesorů.

## Fáze 2 — Down-sweep (prescan)

Druhá fáze *projíždí stromem shora dolů* a *distribuuje* parciální součty tak, aby v *listech* zůstal prescan výsledek.

```
procedure DOWN_SWEEP(A[0..n-1])
  A[n-1] ← I                                   // kořen ← neutrální prvek
  for d = log(n) - 1 downto 0 do
    for i = 0 to n - 1 step 2^(d+1) do in parallel
      t ← A[i + 2^d - 1]                       // hodnota levého syna
      A[i + 2^d - 1] ← A[i + 2^(d+1) - 1]      // L-syn = otec
      A[i + 2^(d+1) - 1] ← t ⊕ A[i + 2^(d+1) - 1] // R-syn = otec ⊕ původní L
    endfor
  endfor
```

**Klíčová věta**: po dokončení down-sweep obsahuje *každý list* sumu hodnot *všech listů, jež ho předcházejí* — tedy prescan.

### Důkaz indukcí (po výšce stromu)

*Báze* (kořen): kořen je nastaven na $I$, neutrální prvek. Kořen *nepředchází* žádný list, takže prescan = $I$ — sedí.

*Indukční krok* (vnitřní uzel $V$, jeho synové $L$ a $R$):

- Předpokládáme, že *otec* uzlu $V$ má správnou hodnotu: $V_\text{otec} = \bigoplus_\text{listy předcházející V}$ (induk. hypotéza).
- **L-syn** je předcházen *týmiž listy*, jako samotné $V$ — tedy *otcova* hodnota je správná pro $L$-syna. Algoritmus jí přiřadí.
- **R-syn** je předcházen listy přecházejícími $V$ + listy v podstromě $L$-syna. *Up-sweep* (fáze 1) si v $L$-synovi *uložil* sumu těchto listů. Algoritmus pak: $R \gets V_\text{otec} \oplus L_\text{up-sweep}$ = správná prescan hodnota.

::: svg "Down-sweep — distribuce hodnot otce na L-syna, otce ⊕ L na R-syna"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="270" cy="30" r="14"/>
    <circle cx="170" cy="100" r="13"/>
    <circle cx="370" cy="100" r="13"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="35">V</text>
    <text x="170" y="105">L</text>
    <text x="370" y="105">R</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" marker-end="url(#dsarrow)">
    <line x1="263" y1="42" x2="180" y2="92"/>
  </g>
  <g stroke="var(--accent-line)" stroke-width="1.4" fill="none" marker-end="url(#dsarrow2)">
    <line x1="277" y1="42" x2="360" y2="92"/>
  </g>
  <defs>
    <marker id="dsarrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
    <marker id="dsarrow2" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent-line)"/>
    </marker>
  </defs>
  <text x="195" y="75" fill="var(--accent)" font-size="10">L ← V (otec)</text>
  <text x="350" y="75" fill="var(--accent-line)" font-size="10">R ← V ⊕ L_původní</text>
  <text x="155" y="135" fill="var(--text-muted)" font-size="9">L je předcházen týmiž listy jako V</text>
  <text x="370" y="135" fill="var(--text-muted)" font-size="9">R je předcházen listy V + listy v L</text>
  <text x="270" y="170" fill="var(--text)" text-anchor="middle" font-size="10">L_původní = up-sweep hodnota L-syna = ∑ listů v L-podstromě</text>
</svg>
:::

## Příklad — krok po kroku

Vstup: $A = [3, 1, 7, 0, 4, 1, 6, 3]$.

**Up-sweep** (operátor $+$):

```
úroveň 0:  [3, 1, 7, 0, 4, 1, 6, 3]              (původní)
úroveň 1:  [3, 4, 7, 7, 4, 5, 6, 9]              (páry: 3+1, 7+0, 4+1, 6+3)
úroveň 2:  [3, 4, 7,11, 4, 5, 6,14]              (dvojice úrovně 1)
úroveň 3:  [3, 4, 7,11, 4, 5, 6,25]              (kořen = 25)
```

**Down-sweep**:

```
Init:      [3, 4, 7,11, 4, 5, 6, 0]              (kořen ← 0)
d=2:       [3, 4, 7, 0, 4, 5, 6,11]              (L=0, R=0+11=11)
d=1:       [3, 0, 7, 4, 4,11, 6,16]              (vnitřní)
d=0:       [0, 3, 4,11,11,15,16,22]              (listy = prescan)
```

Konečný výsledek **prescan**: $[0, 3, 4, 11, 11, 15, 16, 22]$.

Scan = prescan posunut o jedna doleva + reduce na konci: $[3, 4, 11, 11, 15, 16, 22, 25]$.

::: viz prefix-sum-algoritmus "Krokuj up-sweep (paralelní redukce) a down-sweep (distribuce přes strom). V down-sweep sleduj swap-with-modification: L-syn ← otec, R-syn ← otec ⊕ původní-L."
:::

## Analýza — čas, počet procesorů, cena

| Fáze | Čas | Aktivní procesory |
| :--- | :---: | :---: |
| Up-sweep | $\log n$ | $n/2$ v 1. úrovni; klesá |
| Down-sweep | $\log n$ | $1$ v 1. úrovni; roste |

**Celkem**: $t(n) = O(\log n)$.

**Počet procesorů**: $p = n/2$ stačí (peak při první úrovni).

**Cena**: $c(n) = p \cdot t(n) = (n/2) \log n = O(n \log n)$. **Není** cost-optimal.

### Brentova optimalizace — cost-optimal

Pro $N < n$ procesorů, *každý procesor* sekvenčně počítá scan svého úseku délky $n/N$:

```
procedure SCAN_OPTIMAL(A[0..n-1], N processors)
  for each processor i ∈ {0, ..., N-1} do in parallel
    // Fáze 1: lokální reduce
    sum[i] ← A[i·(n/N)]
    for j = 1 to n/N - 1 do
      sum[i] ← sum[i] ⊕ A[i·(n/N) + j]
  
  // Fáze 2: parciální prescan na N částečných sum
  prefix[0..N-1] ← PRESCAN(sum[0..N-1])
  
  for each processor i in parallel
    // Fáze 3: lokální scan s prefixem jako počáteční hodnotou
    running ← prefix[i]
    for j = 0 to n/N - 1 do
      running ← running ⊕ A[i·(n/N) + j]
      Out[i·(n/N) + j] ← running
```

**Analýza**:

- Fáze 1 (lokální reduce): $O(n/N)$ sekvenčně.
- Fáze 2 (prescan na $N$ prvcích): $O(\log N)$.
- Fáze 3 (lokální scan s offsetem): $O(n/N)$ sekvenčně.

**Čas**: $t(n) = O(n/N + \log N)$.

**Cena**: $c(n) = N \cdot t(n) = N \cdot (n/N + \log N) = O(n + N \log N)$.

Pro $N = n / \log n$: $c(n) = O(n)$. **Cost-optimal**!

## Scan na různých topologiích

### PRAM

Up-sweep + Down-sweep, $O(\log n)$. Viz výše.

### Strom

Stejný algoritmus, *fyzicky* na binárním stromě procesorů. $O(\log n)$. Topologie přímo odpovídá algoritmu — nejjednodušší realizace.

### Hyperkrychle

$n = 2^d$ uzlů, každý drží $a_i$. Velmi podobně jako *all-reduce* na hyperkrychli, ale s *směrovanou* výměnou.

```
procedure SCAN_HC(my_val)
  total ← my_val
  my_prefix ← I                   // prescan: neutrální prvek (pro inclusive scan: my_val)
  for i = 0 to d - 1 do
    partner ← me XOR 2^i
    send total to partner; receive their_total
    total ← total ⊕ their_total   // reduce roste vždy
    if partner < me then          // soused je „přede mnou"
      my_prefix ← my_prefix ⊕ their_total   // přidává k mému prescan
```

**Čas**: $\log n = d$ kroků. **Asymptoticky optimal** pro hyperkrychli (limit její průměru).

### 2D mřížka $\sqrt n \times \sqrt n$

Dvoufázový algoritmus:

1. **Scan po řádcích** (lokálně, sekvenčně): $O(\sqrt n)$ kroků.
2. **Scan posledních sloupců** ($\sqrt n$ hodnot, $\sqrt n$ procesorů, sekvenčně): $O(\sqrt n)$ kroků.
3. **Přidání offsetu** do každé řádky: $O(1)$.

**Čas**: $O(\sqrt n)$. Bandwidth-optimal pro mřížku (limit její průměru).

### AVX SIMD (8–16 lanes)

Hardware podpora: instrukce **VPERMD**, **VCOMPRESSPS**. Scan 8 elementů ve 3 krocích log-shuffle:

1. Posun o 1, sečíst.
2. Posun o 2, sečíst.
3. Posun o 4, sečíst.

V x86 AVX-512 explicitně `_mm512_scan_*` nepatří mezi přímé instrukce, ale GCC `__builtin_ia32_*` shuffles to umožňují. NVIDIA CUB knihovna implementuje warp-scan v $\log_2(32) = 5$ krocích `__shfl_up_sync()`.

## Segmentovaný scan — modifikace algoritmu

Při segmentovaném scanu (viz [[prefix-sum-uvod]]) je `f[i] = 1` znak *začátku* segmentu — operátor se *resetuje*.

Idea: použít *párový* operátor nad páry $(hodnota, flag)$:

::: math
(a_1, f_1) \,\boxplus\, (a_2, f_2) =
\begin{cases}
(a_1 \oplus a_2,\ f_1) & \text{pokud } f_2 = 0 \\
(a_2,\ f_2 \vee f_1) & \text{pokud } f_2 = 1
\end{cases}
:::

Operátor $\boxplus$ je *asociativní* (lze ověřit), takže standardní up-sweep + down-sweep funguje. Výsledek — projekce na první složku — je segmentovaný scan.

**Čas**: $O(\log n)$ stejně jako neoznačený scan.

## Praktické rady

1. **Použij existující knihovní implementaci** — Thrust, CUB, std::scan v C++17 implementují vše. Vlastní implementace zřídka vyhraje.
2. **Pro malé $n$ použij sekvenční** — paralelní overhead pro $n < 100$ převáží zisk.
3. **Velký $n$ na GPU**: dvě fáze — blockwise scan v sdílené paměti, pak scan blockových součtů a finalizace. CUB tak dělá.
4. **Segmentovaný scan** se hodí pro sparse matrix operations, BFS, paralelní quicksort. Ne triviální, ale standardní.
5. **Carry-look-ahead adder** je živý důkaz, že scan není jen teoretický — je *v každém CPU*.

## Co dál

Sumu prefixů jsme teď ovládli — slouží jako *stavební blok* pro většinu paralelních algoritmů, které následují. Topic **Paralelní vyhledávání a třídění** ukáže, jak scan + segmentovaný scan dávají paralelní *quicksort*, *radix sort*, *split*, *parallel splitting*. Topic **Paralelní maticové operace** používá scan pro accumulation v matrix-vector multiplication. Topic **Kontrakce stromu** používá scan implicitně přes Euler tour.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Blelloch, G.E.: „Prefix Sums and Their Applications" v Reif (ed.) *Synthesis of Parallel Algorithms* (Morgan Kaufmann 1993, [CMU PDF](https://www.cs.cmu.edu/~guyb/papers/Ble93.pdf)); Blelloch, G.E.: *Vector Models for Data-Parallel Computing* (MIT Press 1990); Hillis, W.D., Steele, G.L.: „Data parallel algorithms" (Comm. ACM 29(12), 1986); Sengupta, S., Harris, M., Garland, M.: „Efficient parallel scan algorithms for GPUs" (NVIDIA Technical Report NVR-2008-003, 2008); NVIDIA CUB knihovna ([dokumentace](https://nvlabs.github.io/cub/)); Wikipedia: [Prefix sum](https://en.wikipedia.org/wiki/Prefix_sum) (sekce „Parallel algorithms").*
