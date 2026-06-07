---
title: Řadicí algoritmy slučováním — Bucket, Odd-Even Merge, Pipeline Merge
---

# Řadicí algoritmy slučováním

Předchozí kapitola ([[transposition-enumeration]]) ukázala přístupy *posuvných výměn (swapů)* a *enumerace*, žádný z nich nebyl optimální z hlediska ceny (cost-optimal). Třída *řadicích algoritmů slučováním* (merge-based) je *kanonický* paralelní přístup k řazení — staví na opakovaném *slučování* malých seřazených posloupností do větších. Klíčoví zástupci: **Bucket Sort** (strom procesorů s logaritmicky mnoha listy, cena $O(n \log n)$), **Odd-Even Merge Sort** (Batcher 1968, pevná řadicí síť) a **Pipeline Merge Sort** (lineární řetězec slučovacích jednotek). První a poslední z nich jsou cost-optimal, tedy dosahují stejné celkové ceny jako nejlepší sekvenční řešení.

## Bucket Sort

### Topologie

**Binární strom** procesorů s $m = \log n$ **listy** a celkem $2m - 1$ uzly. Každý list obsahuje $n/m = n/\log n$ prvků.

### Princip

1. **Distribuce**: vstupních $n$ prvků se rovnoměrně rozdělí mezi $m$ listů.
2. **Lokální řazení**: každý list seřadí svou podposloupnost *optimálním sekvenčním* algoritmem.
3. **Slučování stromem**: každý vnitřní uzel slučuje dvě seřazené posloupnosti svých synů (sekvenční slučování (merge) v čase $O(\text{délka})$).
4. **Výstup**: kořen ukládá seřazenou posloupnost na výstup.

```
procedure BUCKET_SORT(x[1..n])
  (1) rovnoměrně distribuuj prvky do m = log n listů
  (2) každý list seřadí svou n/log n prvkovou posloupnost
      pomocí std::sort, mergesort, ... (sekvenčně)
  (3) for j = 1 to log m do
        for processors at level (log m) - j do in parallel
          processor merges sequences of its two children
        endfor
      endfor
  (4) kořen ukládá výslednou posloupnost
```

::: svg "Bucket Sort — slučování stromu od listů ke kořeni"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.9" fill="var(--bg-card)">
    <rect x="80" y="170" width="80" height="22"/>
    <rect x="170" y="170" width="80" height="22"/>
    <rect x="280" y="170" width="80" height="22"/>
    <rect x="370" y="170" width="80" height="22"/>
    <rect x="100" y="120" width="150" height="22"/>
    <rect x="290" y="120" width="150" height="22"/>
    <rect x="160" y="70" width="220" height="22"/>
    <rect x="220" y="20" width="100" height="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="120" y="184">2,5,10,14</text>
    <text x="210" y="184">4,12,13,15</text>
    <text x="320" y="184">1,8,9,11</text>
    <text x="410" y="184">3,6,7,16</text>
    <text x="175" y="134">2,4,5,10,12,13,14,15</text>
    <text x="365" y="134">1,3,6,7,8,9,11,16</text>
    <text x="270" y="84">1,2,3,4,5,...,15,16</text>
    <text x="270" y="34">kořen → výstup</text>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.6">
    <line x1="120" y1="170" x2="175" y2="142"/>
    <line x1="210" y1="170" x2="175" y2="142"/>
    <line x1="320" y1="170" x2="365" y2="142"/>
    <line x1="410" y1="170" x2="365" y2="142"/>
    <line x1="175" y1="120" x2="270" y2="92"/>
    <line x1="365" y1="120" x2="270" y2="92"/>
    <line x1="270" y1="70" x2="270" y2="42"/>
  </g>
  <g fill="var(--text-muted)" font-size="9">
    <text x="490" y="184" text-anchor="end">listy: lokální sort</text>
    <text x="490" y="134" text-anchor="end">úroveň 1: merge</text>
    <text x="490" y="84" text-anchor="end">úroveň 2: merge</text>
    <text x="490" y="34" text-anchor="end">výstup</text>
  </g>
</svg>
:::

### Analýza

1. **Lokální řazení** každého listu: $O(r \log r)$ pro $r = n / \log n$, tedy $O((n/\log n) \cdot \log(n/\log n)) = O(n)$.

2. **Slučování** na úrovni $i$ (počítáno od 0 = listy směrem nahoru): každý ze $2m / 2^i$ procesorů slučuje dvě posloupnosti délky $2^i n / m$. To trvá $k n / 2^i$ kroků. Součet přes všechny úrovně:

::: math
\sum_{i=1}^{\log m - 1} \frac{kn}{2^i} = O(n)
:::

3. **Výstup**: $O(n)$.

**Celkem**:

- $t(n) = O(n)$
- $p(n) = 2 \log n - 1 \approx O(\log n)$ procesorů.
- $c(n) = O(n \log n)$ — **cost-optimal** (sekvenční řazení je rovněž $O(n \log n)$).

### Diskuze

- *Velmi efektivní* využití procesorů — potřebuje jich jen $O(\log n)$.
- *Lineární čas* — pomalejší než enumerace ($O(\log n)$), ale s mnohem menším počtem procesorů.
- Standardní volba pro *vestavěné řadicí jednotky (embedded sorter)* na FPGA/ASIC s logaritmicky mnoha komparátory.

## Odd-Even Merge Sort (Batcher)

### Myšlenka — řadicí síť

**Řadicí síť** = pevně zapojený obvod komparátorů (CE = Comparison Element, porovnávací prvek). Vstupní hodnoty jím *protékají* a vystupují seřazené. Pochází z Batcherových publikací z roku 1968.

**Jednotka Compare-Exchange (CE), tedy porovnej-a-vyměň**:

```
        ┌─────┐
   a ─→ │  L  │ ─→ min(a, b)
        │ CE  │
   b ─→ │  H  │ ─→ max(a, b)
        └─────┘
```

### Sítě $1 \times 1$, $2 \times 2$, ..., $n \times n$

**Síť $1 \times 1$**: jediný prvek CE (seřadí dvě vstupní hodnoty).

**Síť $2 \times 2$**: slučuje dvě seřazené dvojice ($a_1 \le a_2$, $b_1 \le b_2$) do seřazené čtveřice. Vyžaduje 3 prvky CE.

**Síť $n \times n$**: sestaví se rekurzivně ze dvou sítí $n/2 \times n/2$ a dalších $n - 1$ jednotek CE.

### Princip slučování

Vstup: dvě seřazené posloupnosti $\langle a_1, a_2, \dots, a_n\rangle$ a $\langle b_1, b_2, \dots, b_n\rangle$.

1. Liché prvky $\{a_1, a_3, a_5, \dots\}$ a $\{b_1, b_3, b_5, \dots\}$ se sloučí *nezávislou* sítí $n/2 \times n/2$ → posloupnost $\{d_1, d_2, \dots, d_n\}$.
2. Sudé prvky $\{a_2, a_4, \dots\}$ a $\{b_2, b_4, \dots\}$ se sloučí obdobně → $\{e_1, e_2, \dots, e_n\}$.
3. Finální výstup: $c_1 = d_1$, $c_{2j} = \min(d_{j+1}, e_j)$, $c_{2j+1} = \max(d_{j+1}, e_j)$, $c_{2n} = e_n$. Tento závěrečný krok vyžaduje $n - 1$ jednotek CE.

::: svg "Odd-Even Merge — sloučení dvou seřazených sítí"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.9" fill="var(--bg-card)">
    <rect x="40" y="30" width="60" height="50" rx="3"/>
    <rect x="40" y="110" width="60" height="50" rx="3"/>
    <rect x="200" y="60" width="80" height="36" rx="3"/>
    <rect x="380" y="60" width="100" height="36" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="70" y="48">liché</text>
    <text x="70" y="62">a₁,a₃</text>
    <text x="70" y="76">b₁,b₃</text>
    <text x="70" y="128">sudé</text>
    <text x="70" y="142">a₂,a₄</text>
    <text x="70" y="156">b₂,b₄</text>
    <text x="240" y="78">sítě n/2×n/2</text>
    <text x="430" y="78">n-1 CE</text>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.6" fill="none" marker-end="url(#mergearrow)">
    <line x1="105" y1="55" x2="195" y2="68"/>
    <line x1="105" y1="135" x2="195" y2="88"/>
    <line x1="285" y1="78" x2="375" y2="78"/>
  </g>
  <defs>
    <marker id="mergearrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--text-faint)"/>
    </marker>
  </defs>
  <text x="500" y="78" fill="var(--accent)" font-size="11" text-anchor="end">→ c₁,...,c₂ₙ</text>
  <text x="270" y="180" fill="var(--text-muted)" text-anchor="middle" font-size="10">Vstup: 2 seřazené n-tice; výstup: 1 seřazená 2n-tice</text>
</svg>
:::

### Struktura kompletního řazení

Pro $n = 2^m$ prvků:

- **Fáze 0**: $n/2$ jednotek CE (sítě $1 \times 1$) → $n/2$ seřazených párů.
- **Fáze 1**: $n/4$ sítí $2 \times 2$ → $n/4$ seřazených čtveřic.
- **Fáze 2**: $n/8$ sítí $4 \times 4$ → ...
- ...
- **Fáze $m - 1$**: 1 síť $n/2 \times n/2$ → seřazená posloupnost délky $n$.

### Analýza

**Počet jednotek CE** v síti $n \times n$: rekurence $p(2n) = 2p(n) + (n-1)$ s řešením $p(n) = 1 + n \log_2 n$.

Součet přes všechny fáze: celkem $O(n \log^2 n)$ jednotek.

**Hloubka sítě (čas)**: sítě $n \times n$ mají hloubku $\Theta(\log^2 n)$ — fáze $i$ má hloubku $i$ a součet $1 + 2 + \dots + \log n = \Theta(\log^2 n)$.

- $t(n) = O(\log^2 n)$ (hloubka sítě)
- $p(n) = O(n \log^2 n)$ (počet jednotek CE = velikost sítě = vykonaná práce)
- $c(n) = O(n \log^2 n)$ — **není cost-optimal** (sekvenční řazení je $O(n \log n)$)

### Význam

I když není cost-optimal, je *velmi rychlý* ($O(\log^2 n)$) a *implementačně přímočarý* v hardwaru. Je standardním řešením pro:

- **Řadicí sítě v FPGA/ASIC**.
- **GPU bitonic merge sort** (varianta od Batchera) — používá se v knihovnách jako CUB nebo Thrust.
- **Síť AKS** (Ajtai, Komlós, Szemerédi 1983) dosahuje času $O(\log n)$, ovšem s tak velkou konstantou, že je v praxi nepoužitelná — Batcherovo řešení je *prakticky lepší*.

::: viz merge-radici "Přepni mezi Bucket Sortem (strom), Batcherovým Odd-Even Merge Sortem (řadicí síť) a Pipeline Merge Sortem (streamingový řetěz procesorů). U Pipeline sleduj cykly a paralelní aktivitu P_1, P_2, P_3."
:::

## Pipeline Merge Sort

### Topologie

**Lineární řetězec** $p = \log n + 1$ procesorů $P_1, P_2, \dots, P_{\log n + 1}$ propojených se svými sousedy.

### Princip

Každý procesor $P_i$ má dvě vstupní fronty a jednu výstupní. Slučuje dvě seřazené posloupnosti délky $2^{i-1}$ do seřazené posloupnosti délky $2^i$, a to postupně, *zřetězeným (pipeline) způsobem*.

### Algoritmus

```
procedure PIPELINE_MERGE_SORT(stream of n elements)
  for each input element x:
    feed x into P_1 input queue (alternating queues)
  P_1: merges length-1 pairs into length-2
  P_2: merges length-2 pairs into length-4
  ...
  P_log_n+1: produces final length-n sorted output
```

Procesor $P_i$ začne pracovat, jakmile má na *jedné* ze vstupních front posloupnost délky $2^{i-1}$ a na druhé alespoň 1 prvek. Tedy začne v cyklu $2^{i-1} + i - 1$.

### Analýza

- $P_{\log n + 1}$ začne v cyklu $2^{\log n} + \log n = n + \log n$.
- $P_{\log n + 1}$ skončí v cyklu $2n + \log n - 1$.

Tedy:

- $t(n) = O(n)$
- $p(n) = O(\log n)$
- $c(n) = O(n \log n)$ — **cost-optimal**!

### Diskuze

- *Velmi malý počet procesorů* — jen $O(\log n)$.
- *Lineární propojení* — snadno realizovatelné.
- *Zřetězení (pipeline)* — vstupní proud (stream) lze zpracovávat *za běhu*, nepředpokládá se, že „celý vstup je k dispozici".
- Konstrukčně podobný **Bucket Sortu** — oba jsou cost-optimal a obě řešení staví na slučování.

## Souhrn

| Algoritmus | Čas | Procesory | Cena | Cost-optimal? | Topologie |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Bucket Sort** | $O(n)$ | $O(\log n)$ | $O(n \log n)$ | ✓ | strom |
| **Odd-Even Merge Sort** | $O(\log^2 n)$ | $O(n \log^2 n)$ | $O(n \log^2 n)$ | ✗ | řadicí síť |
| **Pipeline Merge Sort** | $O(n)$ | $O(\log n)$ | $O(n \log n)$ | ✓ | lineární řetězec |

**Závěry**:

- *Cost-optimal* řešení dosáhneme s $O(\log n)$ procesory uspořádanými do lineárního řetězce nebo do stromu.
- Pro řazení *rychlejší* než $O(n)$ je potřeba *více* procesorů — Odd-Even Merge Sort potřebuje $O(n \log^2 n)$ procesorů pro čas $O(\log^2 n)$.
- *Praktická volba*:
  - **Cluster**: Bucket Sort + sample sort (varianta).
  - **GPU**: bitonic merge (varianta od Batchera).
  - **FPGA**: Odd-Even Merge Sort jako pevná síť.

## Co dál

[[radici-vyber]] dokončí přehled paralelních řadicích algoritmů: **Minimum Extraction Sort** (strom, který iterativně vybírá minimum) a **Median Finding and Splitting** — *paralelní quicksort* postavený na PAR_SELECT + PARALLEL_SPLITTING z [[splitting-select]]. Median Finding and Splitting je rovněž *cost-optimal*.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Batcher, K.E.: „Sorting networks and their applications" (AFIPS 1968, [DOI 10.1145/1468075.1468121](https://doi.org/10.1145/1468075.1468121)); Akl, S.G.: *Parallel Sorting Algorithms* (Academic Press 1985); Akl, S.G.: *The Design and Analysis of Parallel Algorithms* (Prentice Hall 1989), kap. 4; Knuth, D.E.: *TAOCP Vol. 3*, §5.3.4; Cole, R.: „Parallel merge sort" (SIAM J. Comput. 17(4), 1988, [DOI 10.1137/0217049](https://doi.org/10.1137/0217049)) — $O(\log n)$ paralelní merge sort.*
