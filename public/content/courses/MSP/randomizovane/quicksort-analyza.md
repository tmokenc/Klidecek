---
title: Randomizovaný QuickSort
---

# Randomizovaný QuickSort

QuickSort je *kanonický* příklad randomizovaného Las Vegas algoritmu. Worst-case `Θ(n²)` deterministické varianty na seřazeném vstupu se randomizovaným pivotem rozplyne — *očekávaná* složitost je `Θ(n log n)` pro libovolný (i adversariální) vstup. Analýza je elegantní použití [[indikatorove-veliciny|indikátorových veličin]] a stojí za pochopení jako reprezentativní příklad celé třídy algoritmů (Quickselect, Hoare median, randomized BST).

## Algoritmus

```
RANDOMIZED-QUICKSORT(A, p, r):
    pokud p < r:
        q = RANDOMIZED-PARTITION(A, p, r)
        RANDOMIZED-QUICKSORT(A, p, q − 1)
        RANDOMIZED-QUICKSORT(A, q + 1, r)

RANDOMIZED-PARTITION(A, p, r):
    i = RANDOM(p, r)             # uniformně náhodný pivot
    swap A[r], A[i]
    return PARTITION(A, p, r)    # standardní Lomuto/Hoare
```

Klíčový rozdíl od deterministické verze: pivot vybíráme *náhodně* z aktuálního pole, místo brát první/poslední prvek.

## Korektnost a doba běhu

* **Korektnost**: identická s deterministickou. Partitioning vytváří levou (< pivot) a pravou (> pivot) část, rekurzivně třídí. Vždy vrátí seřazené pole.
* **Worst-case**: stále `O(n²)` — když by se náhodou pivot trefil na minimum/maximum v každé úrovni. Pravděpodobnost je ale *nulová pro velké n*.
* **Best-case**: `O(n log n)` — vždy rozdělíme na poloviny.
* **Average / expected**: `O(n log n)` — to dokážeme dále.

## Analýza očekávané složitosti

**Doba běhu** ≈ celkový počet *porovnání* prvků. Označme `X` = počet porovnání během celé recursion.

### Indikátorový rozklad

Po seřazení mají prvky pořadí `z₁ < z₂ < … < z_n`. Definujme:

::: math
X_{ij} = \mathbf{1}_{z_i \text{ je porovnán s } z_j}.
:::

Pak `X = Σ_{i < j} X_{ij}`. Použijeme linearitu:

::: math
E[X] = \sum_{i < j} P(z_i \text{ a } z_j \text{ jsou porovnány}).
:::

### Klíčové pozorování

`z_i` a `z_j` jsou *porovnány během QuickSortu* přesně tehdy, když **jeden z nich je pivot v okamžiku, kdy oba ještě jsou ve stejné podposloupnosti**. To je *právě tehdy*, když *první* pivot z množiny `{z_i, z_{i+1}, …, z_j}` je `z_i` *nebo* `z_j`.

Důkaz: Dokud je pivot mimo `[z_i, z_j]`, oba prvky zůstávají ve stejné podposloupnosti (oba leží na stejné straně pivotu nebo oba mezi dvěma pivoty). První pivot z této množiny *buď* je extrém (`z_i` nebo `z_j`) — pak se s druhým porovná — *nebo* je uvnitř (`z_k` pro `i < k < j`) — pak se ti dva rozdělí do různých podproblémů a nikdy se neporovnají.

### Pravděpodobnost

Z `j − i + 1` prvků množiny `{z_i, …, z_j}` je každý stejně pravděpodobný být *první* pivotem z této množiny (symetrie). Proto:

::: math
P(z_i \text{ porovnán se } z_j) = \frac{2}{j - i + 1}.
:::

### Suma

Označme `k = j − i + 1`. Pro každé `k = 2, …, n` existuje `n − (k − 1)` dvojic `(i, j)` s `j − i + 1 = k`. Tedy:

::: math
E[X] = \sum_{i=1}^{n-1} \sum_{j=i+1}^{n} \frac{2}{j - i + 1} = \sum_{i=1}^{n-1} \sum_{k=2}^{n - i + 1} \frac{2}{k}.
:::

Horní mez:

::: math
E[X] \le \sum_{i=1}^{n-1} \sum_{k=1}^{n} \frac{2}{k} = 2(n-1) \cdot H_n = O(n \log n).
:::

A přesněji `E[X] = 2n \ln n - O(n)`. Tedy *očekávaný počet porovnání je `2n ln n`*, což odpovídá `O(n log n)`.

::: svg "Strom rekurze: očekávaná hloubka je O(log n), na každé úrovni se zpracuje n prvků, celkem n log n práce."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10.5">
  <g>
    <rect x="200" y="20" width="140" height="22" rx="3" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="270" y="35" text-anchor="middle" fill="var(--text)">n prvků</text>

    <rect x="110" y="60" width="80" height="22" rx="3" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="150" y="75" text-anchor="middle" fill="var(--text)">≈ n/3</text>
    <rect x="350" y="60" width="80" height="22" rx="3" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="390" y="75" text-anchor="middle" fill="var(--text)">≈ 2n/3</text>

    <line x1="240" y1="42" x2="170" y2="60" stroke="var(--line)"/>
    <line x1="300" y1="42" x2="370" y2="60" stroke="var(--line)"/>

    <rect x="40" y="100" width="60" height="22" rx="3" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="70" y="115" text-anchor="middle" fill="var(--text)">~n/9</text>
    <rect x="120" y="100" width="60" height="22" rx="3" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="150" y="115" text-anchor="middle" fill="var(--text)">~2n/9</text>
    <rect x="290" y="100" width="60" height="22" rx="3" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="320" y="115" text-anchor="middle" fill="var(--text)">~2n/9</text>
    <rect x="370" y="100" width="60" height="22" rx="3" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="400" y="115" text-anchor="middle" fill="var(--text)">~4n/9</text>

    <line x1="130" y1="82" x2="70" y2="100" stroke="var(--line)"/>
    <line x1="170" y1="82" x2="150" y2="100" stroke="var(--line)"/>
    <line x1="370" y1="82" x2="320" y2="100" stroke="var(--line)"/>
    <line x1="410" y1="82" x2="400" y2="100" stroke="var(--line)"/>

    <text x="40" y="140" fill="var(--text-muted)" font-size="10">⋮</text>
    <text x="480" y="140" fill="var(--text-muted)" font-size="10">⋮</text>

    <text x="270" y="178" text-anchor="middle" fill="var(--accent-line)">Očekávaná hloubka O(log n), práce na úrovni O(n)</text>
    <text x="270" y="194" text-anchor="middle" fill="var(--accent-line)">⇒ celková očekávaná složitost O(n log n)</text>
  </g>
</svg>
:::

## Koncentrace — odchylky od průměru

Očekávaná složitost je `O(n log n)`, ale jak často se *skutečně* odchýlí daleko? Důkaz pomocí *Chernoffových* nerovností nebo *Markovovy* dává:

::: math
P[T \ge c \cdot n \ln n] \le n^{-\Omega(c)}.
:::

V praxi: pravděpodobnost, že QuickSort poběží *více než dvakrát* pomaleji než očekávaně, je *polynomiálně malá* v `n` (high probability). Implementace v knihovnách (GNU std::sort, .NET, Java) používají variantu *introsort* — QuickSort + přepnutí na HeapSort při hloubce > `c log n` — což garantuje *worst-case* `O(n log n)`.

## QuickSelect — nalezení k-tého nejmenšího

Modifikace QuickSortu, která vrací `k`-tý nejmenší prvek v `O(n)` *očekávaně*:

```
RANDOMIZED-SELECT(A, p, r, k):
    pokud p == r: return A[p]
    q = RANDOMIZED-PARTITION(A, p, r)
    i = q - p + 1
    pokud k == i: return A[q]
    jinak pokud k < i: return RANDOMIZED-SELECT(A, p, q-1, k)
    jinak: return RANDOMIZED-SELECT(A, q+1, r, k-i)
```

Důkaz: opět přes indikátory, `E[T(n)] = O(n)`. Existuje i deterministická varianta (*Median of medians* Blum-Floyd-Pratt-Rivest-Tarjan 1973), ale s vyšším konstantním faktorem.

## Praktické poznámky

* **Pivot strategy**:
  * *First element* — bad on sorted input.
  * *Random pivot* — robust, but RNG overhead.
  * *Median of three* — robust without RNG.
  * *Median of medians* — `O(n)` deterministic, but expensive.
* **Cache efficiency** — QuickSort má dobré chování v cache díky lokálnímu přístupu k poli; lépe než MergeSort, který vyžaduje pomocné pole.
* **Tail recursion** — eliminuj jednu rekurzivní volání (pole má `O(log n)` paměti při průměrně vyvážených podproblémech).
* **Hybrid** — knihovny používají QuickSort pro velká pole, InsertionSort pro malá (< 16 prvků).

## Srovnání

| Algoritmus | Worst-case | Average | In-place | Stabilní |
| :--- | :--- | :--- | :--- | :--- |
| MergeSort | `O(n log n)` | `O(n log n)` | ne (`O(n)` extra) | ano |
| HeapSort | `O(n log n)` | `O(n log n)` | ano | ne |
| QuickSort (det.) | `O(n²)` | `O(n log n)` | ano | ne |
| QuickSort (rand.) | `O(n²)` (s prav. → 0) | `O(n log n)` | ano | ne |
| Introsort | `O(n log n)` | `O(n log n)` | ano | ne |

::: viz quicksort-simulation "Distribuce počtu porovnání randomizovaného QuickSortu přes 500 běhů; teoretický průměr 2n ln n vyznačen."
:::

::: link "Cormen, T. H. et al.: Introduction to Algorithms, kap. 7.4 (Analysis of Quicksort)" "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/"
:::

::: link "Sedgewick, R., Wayne, K.: Algorithms (4th ed., Addison-Wesley 2011), kap. 2.3" "https://algs4.cs.princeton.edu/23quicksort/"
:::

---

*Zdroj: MSP přednášky 2025/26, *Randomized Algorithms — QuickSort* (Češka). Externí reference: Cormen, T. H. et al.: *Introduction to Algorithms* (3rd ed., MIT Press 2009), kap. 5.4, 7.4; Sedgewick, R., Wayne, K.: *Algorithms* (4th ed., Addison-Wesley 2011), kap. 2.3; Motwani, R., Raghavan, P.: *Randomized Algorithms* (Cambridge 1995), kap. 1.*
