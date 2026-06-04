---
title: Las Vegas vs. Monte Carlo
---

# Las Vegas vs. Monte Carlo

Randomizované algoritmy používají náhodu jako *součást výpočtu*, ne pouze jako vstup. Vstupní data jsou *deterministická* — náhodnost přidává sám algoritmus. Důvod: pro mnohé úlohy nelze v deterministickém modelu dosáhnout dobrého chování na *všech* vstupech (advisarial input). Randomizace zaručuje dobré chování *průměrně přes vlastní mince*, ne přes vstupy. Klasifikace podle toho, *čím* gamblujeme, vede ke dvěma základním třídám: Las Vegas a Monte Carlo.

## Proč randomizovat

Deterministický kvadratický algoritmus se může vůči adverzářskému vstupu zhoršit (např. *naivní QuickSort* s prvním pivotem na seřazeném poli: `Θ(n²)`). Randomizace omezuje vliv adverzáře:

1. **Randomizovat pořadí vstupů** — před spuštěním permutuj vstupní pole. Adversář pak ztrácí kontrolu.
2. **Randomizovat volby uvnitř** — randomizovaný pivot v QuickSortu, hash funkce.

Obě strategie *posouvají* zdroj náhodnosti — z vstupního rozdělení (které neovládáme) do interní volby (kterou ovládáme).

## Dvě třídy randomizovaných algoritmů

### Las Vegas — gambluje s časem

Las Vegas algoritmus **vždy dává korektní výsledek**, ale jeho doba běhu je *náhodná veličina*. Měříme *očekávanou složitost* `E[T(n)]`.

**Příklad:** Randomizovaný QuickSort — vždy vrátí seřazené pole; očekávaná složitost je `O(n log n)`, *worst-case* `O(n²)` ale s mizivou pravděpodobností.

* **Garance**: korektnost (vždy)
* **Riziko**: čas (s malou pravděpodobností pomalu)

### Monte Carlo — gambluje s korektností

Monte Carlo algoritmus má **garantovaný worst-case čas**, ale s nenulovou pravděpodobností vrátí *nesprávný* výsledek.

**Příklad:** Miller-Rabin test prvočíselnosti — vždy doběhne v `O(k · log³ n)`, ale s pravděpodobností `≤ 4⁻ᵏ` označí složené číslo za prvočíslo.

* **Garance**: čas (vždy)
* **Riziko**: korektnost (s malou pravděpodobností špatně)

### Souhrnná tabulka

::: svg "Las Vegas vs. Monte Carlo: dvě strategie, jak distribuovat riziko."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="40" y="20" width="220" height="140" rx="8" fill="var(--bg-inset)" stroke="var(--accent)" stroke-width="2"/>
    <text x="150" y="42" text-anchor="middle" fill="var(--accent)" font-weight="600">Las Vegas</text>
    <text x="150" y="62" text-anchor="middle" fill="var(--text)" font-size="10.5">korektnost: zaručena</text>
    <text x="150" y="80" text-anchor="middle" fill="var(--text)" font-size="10.5">čas: náhodná veličina</text>
    <text x="150" y="98" text-anchor="middle" fill="var(--text-muted)" font-size="10">měříme E[T(n)]</text>
    <text x="150" y="120" text-anchor="middle" fill="var(--text-muted)" font-size="10">např. randomized QuickSort</text>
    <text x="150" y="138" text-anchor="middle" fill="var(--text-muted)" font-size="10">hiring problem (sec[1])</text>

    <rect x="280" y="20" width="220" height="140" rx="8" fill="var(--bg-inset)" stroke="var(--accent-line)" stroke-width="2"/>
    <text x="390" y="42" text-anchor="middle" fill="var(--accent-line)" font-weight="600">Monte Carlo</text>
    <text x="390" y="62" text-anchor="middle" fill="var(--text)" font-size="10.5">korektnost: pravděpodobnost</text>
    <text x="390" y="80" text-anchor="middle" fill="var(--text)" font-size="10.5">čas: zaručený</text>
    <text x="390" y="98" text-anchor="middle" fill="var(--text-muted)" font-size="10">měříme P[chyba]</text>
    <text x="390" y="120" text-anchor="middle" fill="var(--text-muted)" font-size="10">např. Miller-Rabin</text>
    <text x="390" y="138" text-anchor="middle" fill="var(--text-muted)" font-size="10">Karger Min-Cut (sec[2])</text>
  </g>
</svg>
:::

## Konverze Monte Carlo → Las Vegas

Pokud máme MC algoritmus `A` s pravděpodobností chyby `p_err < 1` a *ověřovač* `V` (deterministický, který v polynomiálním čase ověří, zda je výsledek správný), můžeme z `A` zkonstruovat LV variantu:

```
opakuj:
    výsledek = A(vstup)
    pokud V(vstup, výsledek): return výsledek
```

Očekávaný počet iterací je `1/(1 − p_err)`. Konverze funguje jen tehdy, když `V` skutečně **potvrdí korektnost** výsledku. Příklad: u *polynomial identity testing* je nalezený nenulový bod *sebe-certifikující* (stačí dosadit a ověřit, že polynom je nenulový). Naopak Karger Min-Cut takový ověřovač **nemá** — spočítáme sice velikost daného řezu v `O(m)`, ale to neověří jeho *minimalitu* (k tomu bychom museli znát ground-truth min-cut, tj. úlohu už vyřešit). Viz [[karger-min-cut]], „Las Vegas verze".

## Amplifikace pravděpodobnosti

Pro MC algoritmus s pravděpodobností úspěchu `q > 0` (chyby `1 − q < 1`):

* **One-sided error**: spusť algoritmus `k`-krát nezávisle, vrať `OR` (resp. `AND`) výsledků. Chyba nastane, jen když selžou *všechna* opakování: `(1 − q)ᵏ → 0`.
* **Two-sided error**: vrať *většinový* výsledek (pro algoritmy s rozhodovacím výstupem); pravděpodobnost chyby klesá *exponenciálně* podle Hoeffdingovy meze níže.

**Příklad — Miller-Rabin**: jedno opakování má `P[chyba] ≤ 1/4`. Po `k` opakováních: `P[chyba] ≤ 4⁻ᵏ`. Pro `k = 40`: `P[chyba] ≤ 10⁻²⁴`.

### Hoeffdingova nerovnost

Pro `k` nezávislých Bernoulliho pokusů s pravděpodobností úspěchu `q`:

::: math
P\!\left( \frac{1}{k} \sum_i X_i \le q - \epsilon \right) \le e^{-2 k \epsilon^2}.
:::

To říká, *jak rychle* většinové hlasování konverguje k pravdě — to je matematický základ amplifikace.

## Klasifikace MC algoritmů — *yes-biased* vs. *no-biased*

* **Yes-biased** (one-sided error) — pokud algoritmus říká *ano*, je to jistě správně; *ne* může být chyba. Příklad: Miller-Rabin (pokud najde svědka složenosti, je definitivně složené; pokud ne, *snad* je prvočíslo).
* **No-biased** — symetricky.
* **Two-sided error** — obě možnosti chybné.

Pro one-sided algoritmy amplifikace funguje *triviálně* — stačí `OR` (yes) nebo `AND` (no) opakování.

## Příklad — najít 1 v poli s polovinou 1

Pole `A[1..n]` (n sudé), polovina prvků je 0, druhá polovina 1. Cíl: najít *index s 1*.

**Deterministicky**: `O(n)` worst-case (adversariální permutace).

**Monte Carlo, `O(1)`**: vyber náhodný index, vrať ho. Pravděpodobnost úspěchu `1/2`. Po `k` opakováních: `P[selhání] = 2⁻ᵏ`.

**Las Vegas, `E[T] = O(1)`**: vyber náhodný index, zkontroluj, opakuj, dokud nevrátíš 1. Počet pokusů `X ∼ Ge(1/2)`, `E[X] = 2`. Vždy korektně.

Důkaz `E[X] = 2`:

::: math
E[X] = \sum_{k=1}^{\infty} k \cdot \tfrac{1}{2^k} = 2.
:::

## Aplikace v praxi {tier=practice}

* **Primality testing** (Miller-Rabin) — `O(k log³ n)`, `P[chyba] ≤ 4⁻ᵏ`.
* **Polynomial identity testing** — Schwartz-Zippel lemma, `P[chyba] ≤ d/|S|`.
* **Hashing** — universal hash families, randomizovaný výběr funkce.
* **Quicksort, Quickselect** — randomizovaný pivot, `E[T] = O(n log n)` resp. `O(n)`.
* **Min-Cut** ([[karger-min-cut]]) — `O(n²)` per try, amplifikace na `O(n⁴ log n)`.
* **MCMC** — Monte Carlo metody pro vzorkování ze složitých distribucí.

::: viz las-vegas-vs-mc "LV vs. MC na úloze „najdi 1 v poli polo-1": LV histogram T (Geom(1/2)), MC úspěšnost 1−(1/2)^k vs. empirie."
:::

::: link "Motwani, R., Raghavan, P.: Randomized Algorithms (Cambridge 1995)" "https://www.cambridge.org/9780521474658"
:::

::: link "Mitzenmacher, M., Upfal, E.: Probability and Computing (Cambridge 2017)" "https://www.cs.purdue.edu/homes/spa/courses/pg17/mu-book.pdf"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=zhuOFLxyJdw" "SZZ: Randomizované algoritmy" "Tomáš Kocourek"
:::

*Zdroj: MSP přednášky 2025/26, *Lecture 3: Randomized Algorithms* (Češka). Externí reference: Cormen, T. H. et al.: *Introduction to Algorithms* (3rd ed., MIT Press 2009), kap. 5; Mitzenmacher, M., Upfal, E.: *Probability and Computing* (Cambridge 2017), kap. 1, 7; Motwani, R., Raghavan, P.: *Randomized Algorithms* (Cambridge 1995).*
