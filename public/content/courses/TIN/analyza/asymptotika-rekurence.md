---
title: Asymptotika a rekurence
---

# Asymptotická analýza a rekurence

[[slozitost-ts]] zavedl *asymptotickou* notaci $O, \Omega, \Theta$. Tato kapitola ji *aplikuje* na analýzu algoritmů — počítání kroků v jednoduchých smyčkách, **rekurentní rovnice** pro rekurzivní algoritmy a **Master teorém** pro standardní *divide-and-conquer* schémata.

## Připomenutí asymptotiky

::: math
\begin{aligned}
O(f) &= \{g \mid \exists c, n_0 \,\forall n \geq n_0: g(n) \leq c \cdot f(n)\} \quad \text{(horní odhad)} \\
\Omega(f) &= \{g \mid \exists c, n_0 \,\forall n \geq n_0: c \cdot f(n) \leq g(n)\} \quad \text{(dolní odhad)} \\
\Theta(f) &= O(f) \cap \Omega(f) \quad \text{(těsný odhad)}
\end{aligned}
:::

Klíčové vlastnosti pro analýzu:

* **Konstanty se zanedbávají**: $5n + 3 \in \Theta(n)$, ne $\Theta(5n + 3)$.
* **Pouze dominantní člen**: $n^2 + n \log n + 100 \in \Theta(n^2)$.
* **Mocniny rostou rychleji než logaritmy**: $\log n \in O(n^\varepsilon)$ pro každé $\varepsilon > 0$.
* **Exponenciála rostou rychleji než polynomy**: $n^k \in O(2^n)$ pro libovolný $k$.

## Hierarchie rostoucích funkcí

::: svg "Pořadí asymptotického růstu od nejpomalejšího k nejrychlejšímu"
<svg viewBox="0 0 540 80" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="20" width="55" height="30" rx="5"/>
    <rect x="80" y="20" width="55" height="30" rx="5"/>
    <rect x="140" y="20" width="55" height="30" rx="5"/>
    <rect x="200" y="20" width="55" height="30" rx="5"/>
    <rect x="260" y="20" width="55" height="30" rx="5"/>
    <rect x="320" y="20" width="55" height="30" rx="5"/>
    <rect x="380" y="20" width="55" height="30" rx="5"/>
    <rect x="440" y="20" width="55" height="30" rx="5"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-family="ui-monospace, monospace">
    <text x="47" y="40">O(1)</text>
    <text x="107" y="40">log n</text>
    <text x="167" y="40">√n</text>
    <text x="227" y="40">n</text>
    <text x="287" y="40">n log n</text>
    <text x="347" y="40">n²</text>
    <text x="407" y="40">2ⁿ</text>
    <text x="467" y="40">n!</text>
  </g>
  <text x="270" y="70" text-anchor="middle" fill="var(--text-muted)" font-size="10">⟵ pomalejší růst                                  rychlejší růst ⟶</text>
</svg>
:::

## Analýza algoritmu krok za krokem

**Příklad — porovnání řetězců.** S uniformním cenovým kritériem (každý řádek = 1 jednotka):

```c
int str_cmp(int n, string a, string b) {
    int i = 0;
    while (i < n) {           // test ukončení
        if (a[i] != b[i]) break;  // tělo cyklu (1)
        i++;                       // tělo cyklu (2)
    }
    return (i == n);          // konec
}
```

* Tělo cyklu (test + 2 příkazy) = 3 kroky, opakuje se *až $n$-krát*.
* Inicializace + návrat = 3 kroky.

Nejhorší případ: $T(n) = 3n + 3 \in \Theta(n)$ (lineární).

**Příklad — insertion sort:**

```c
void insertsort(int n, int a[]) {
    for (int i = 0; i < n; i++) {
        int value = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > value) {
            a[j+1] = a[j];
            j--;
        }
        a[j+1] = value;
    }
}
```

* Vnitřní `while` cyklus má 3 kroky, opakuje se $0, 1, 2, \dots, n-1$ krát. Součet $\sum_{k=0}^{n-1} 3k = \frac{3n(n-1)}{2}$.
* Vnější `for` cyklus má kromě vnitřního 5 kroků, opakuje se $n$-krát, celkem $5n$.
* Jeden krok na ukončení.

Celkem: $T(n) = \frac{3n^2}{2} + \frac{7n}{2} + 1 \in \Theta(n^2)$.

## Rekurence

Mnoho algoritmů — zejména rekurzivních — má dobu běhu popsanou *rekurentní rovnicí*. Klasické tvary:

### Lineární rekurence

$$
T(n) = T(n - 1) + f(n).
$$

Řešení iterací:

$$
T(n) = T(0) + \sum_{i=1}^{n} f(i).
$$

Příklad: počet rekurzivních volání v algoritmu typu *jednorozměrný DP* — $T(n) = T(n-1) + O(1) \in \Theta(n)$.

### "Půlící" rekurence

$$
T(n) = T(n/2) + O(1).
$$

Řešení iterací: hloubka rekurze $\log_2 n$, každé volání $O(1)$. Tedy $T(n) \in \Theta(\log n)$.

Příklad: *binary search* na seřazeném poli.

### Divide-and-conquer s podproblémy stejné velikosti

$$
T(n) = a \cdot T(n/b) + f(n).
$$

* $a$ — *počet podproblémů*,
* $b$ — *zmenšení velikosti* každého podproblému,
* $f(n)$ — *cena "spojení"* podproblémů.

Toto je *standardní tvar*, který řeší **Master teorém**.

## Master teorém

**Věta (Master, Bentley-Haken-Saxe 1980).** Pro rekurenci $T(n) = a \cdot T(n/b) + f(n)$, kde $a \geq 1$, $b > 1$:

Označme $c^* = \log_b a$. Pak:

| Případ | Podmínka na $f(n)$ | Výsledek |
| :-: | :--- | :--- |
| 1 | $f(n) \in O(n^{c^* - \varepsilon})$ pro $\varepsilon > 0$ | $T(n) \in \Theta(n^{c^*})$ |
| 2 | $f(n) \in \Theta(n^{c^*})$ | $T(n) \in \Theta(n^{c^*} \log n)$ |
| 3 | $f(n) \in \Omega(n^{c^* + \varepsilon})$ pro $\varepsilon > 0$ + regularita | $T(n) \in \Theta(f(n))$ |

**Regularita** pro případ 3: $a \cdot f(n/b) \leq c \cdot f(n)$ pro nějaké $c < 1$ a dostatečně velké $n$. (Většinou triviálně splněno.)

::: svg "Master teorém — rozhodovací strom podle vztahu f(n) a n^(log_b a)"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aMT" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="180" y="20" width="180" height="36" rx="6"/>
    <rect x="20" y="100" width="160" height="36" rx="6"/>
    <rect x="190" y="100" width="160" height="36" rx="6"/>
    <rect x="360" y="100" width="160" height="36" rx="6"/>
    <rect x="20" y="170" width="160" height="32" rx="6"/>
    <rect x="190" y="170" width="160" height="32" rx="6"/>
    <rect x="360" y="170" width="160" height="32" rx="6"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="11">
    <text x="270" y="42">T(n) = a·T(n/b) + f(n)</text>
    <text x="100" y="118">f(n) malé:</text>
    <text x="100" y="132">O(n^(c*−ε))</text>
    <text x="270" y="118">f(n) stejné:</text>
    <text x="270" y="132">Θ(n^c*)</text>
    <text x="440" y="118">f(n) velké:</text>
    <text x="440" y="132">Ω(n^(c*+ε))</text>
    <text x="100" y="188">Θ(n^c*)</text>
    <text x="270" y="188">Θ(n^c* · log n)</text>
    <text x="440" y="188">Θ(f(n))</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aMT)">
    <line x1="240" y1="58" x2="100" y2="96"/>
    <line x1="270" y1="58" x2="270" y2="96"/>
    <line x1="300" y1="58" x2="440" y2="96"/>
    <line x1="100" y1="138" x2="100" y2="168"/>
    <line x1="270" y1="138" x2="270" y2="168"/>
    <line x1="440" y1="138" x2="440" y2="168"/>
  </g>
  <text x="270" y="214" text-anchor="middle" fill="var(--text-muted)" font-size="10">c* = log_b a — exponent "rekurzivního členu".</text>
</svg>
:::

::: viz master-theorem "Posuň slidery a, b a vyber f(n). Viz klasifikuje (případ 1/2/3), vykreslí strom volání s cenou na úrovni a vyplivne Θ. Zkus presety: Merge sort, Strassen, Binary search."
:::

## Příklady aplikace Master teorému

### Merge sort

$$
T(n) = 2 T(n/2) + O(n).
$$

$a = 2$, $b = 2$, $c^* = \log_2 2 = 1$, $f(n) = O(n) = O(n^{c^*})$. **Případ 2.**

$$
T(n) \in \Theta(n \log n).
$$

### Binary search

$$
T(n) = T(n/2) + O(1).
$$

$a = 1$, $b = 2$, $c^* = 0$, $f(n) = O(1) = O(n^0)$. **Případ 2.**

$$
T(n) \in \Theta(\log n).
$$

### Strassenovo násobení matic

$$
T(n) = 7 T(n/2) + O(n^2).
$$

$a = 7$, $b = 2$, $c^* = \log_2 7 \approx 2.807$. $f(n) = O(n^2)$, což je $O(n^{c^* - \varepsilon})$ pro $\varepsilon = 0.5$. **Případ 1.**

$$
T(n) \in \Theta(n^{\log_2 7}) \approx \Theta(n^{2.807}).
$$

Standardní násobení by mělo $T(n) \in \Theta(n^3)$. Strassen zlepšil exponent pomocí rekurzivní dekompozice.

### Quicksort (nejlepší případ)

Při *perfektně vyváženém* rozdělení (pivot vždy uprostřed) dostáváme:

$$
T(n) = T(n/2) + T(n/2) + O(n) = 2 T(n/2) + O(n).
$$

$a = 2$, $b = 2$, $c^* = 1$. **Případ 2.**

$$
T(n) \in \Theta(n \log n).
$$

V *průměrném* případě je rekurence ve skutečnosti $T(n) = \frac{1}{n}\sum_{k=0}^{n-1}\bigl(T(k) + T(n-1-k)\bigr) + \Theta(n)$ (průměrování přes všechny polohy pivotu). Tu Master teorém *neřeší* přímo; výsledek $\Theta(n \log n)$ plyne ze samostatné pravděpodobnostní analýzy očekávané ceny.

V *nejhorším* případě (např. už seřazené pole s naivním výběrem pivotu) je rekurence $T(n) = T(n-1) + O(n) \in \Theta(n^2)$ — Master teorém *neaplikujeme*, používáme přímou iteraci.

### Algoritmus, kde f(n) je velká

$$
T(n) = 2 T(n/2) + O(n^2).
$$

$c^* = 1$, $f(n) = O(n^2) = \Omega(n^{1 + \varepsilon})$ pro $\varepsilon = 1$. **Případ 3** (regularita splněna).

$$
T(n) \in \Theta(n^2).
$$

## Případy mimo Master teorém

Některé rekurence Master teorém *neřeší*:

* **Nesymetrické rozdělení**: $T(n) = T(n/3) + T(2n/3) + O(n)$. Řeší se *rekurzivními stromy*.
* **$f(n)$ "mezi" případy**: např. $f(n) = n \log n$ pro $c^* = 1$. Existuje *zobecněný* Master teorém pro tyto případy.
* **Subtraktivní rekurence**: $T(n) = T(n - 1) + n$, $T(n) = T(\sqrt{n}) + 1$ — řeší se substitucí proměnné.

### Metoda rekurzivního stromu

Pro rekurenci $T(n) = a T(n/b) + f(n)$ kreslíme strom volání:

* Kořen má cenu $f(n)$.
* $a$ potomků s cenou $f(n/b)$ každý.
* Listy v hloubce $\log_b n$ s cenou $T(1)$.

Celková cena = součet cen v každé úrovni × počet úrovní.

### Substituční metoda

Pro $T(n) = T(\sqrt{n}) + 1$: substituce $m = \log_2 n$, pak $T(2^m) = T(2^{m/2}) + 1$, což je *půlící rekurence* — řešení $\Theta(\log m) = \Theta(\log \log n)$.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Cormen, T.H., Leiserson, C.E., Rivest, R.L., Stein, C.: *Introduction to Algorithms (CLRS)* (3rd ed., MIT Press 2009), kap. 4; Bentley, J.L., Haken, D., Saxe, J.B.: *A General Method for Solving Divide-and-Conquer Recurrences* (SIGACT News, 1980); Sedgewick, R., Flajolet, P.: *An Introduction to the Analysis of Algorithms* (2nd ed., Addison-Wesley 2013).*
