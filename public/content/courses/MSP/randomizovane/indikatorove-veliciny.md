---
title: Indikátorové veličiny — hiring problem
---

# Indikátorové veličiny — hiring problem

Hlavní analytická technika pro randomizované algoritmy je **rozklad na součet indikátorových veličin** a využití *linearity střední hodnoty*. Pomocí ní lze často získat asymptoticky přesnou očekávanou složitost ve dvou řádcích, bez explicitního počítání pravděpodobnostních rozdělení. Hiring problem je didakticky čistý příklad této techniky.

## Indikátorová veličina

**Indikátorová NV** pro jev `A` je:

::: math
\mathbf{1}_A = \begin{cases} 1 & \text{pokud nastane } A, \\ 0 & \text{jinak.} \end{cases}
:::

Klíčové vlastnosti:

* `E[1_A] = 1 · P(A) + 0 · P(¬A) = P(A)` — *střední hodnota indikátoru je přesně pravděpodobnost jevu*.
* `Var(1_A) = P(A) · (1 − P(A))` — Bernoulli rozptyl.

Indikátory umožňují počítat **očekávaný počet výskytů** jevů pomocí linearity:

::: math
E\!\left[ \sum_{i=1}^{n} \mathbf{1}_{A_i} \right] = \sum_{i=1}^{n} P(A_i).
:::

*Linearita platí i pro závislé jevy* — to je jediný důvod, proč funguje. Stačí, aby každý `E[1_{Aᵢ}]` existoval.

## Hiring problem

**Zadání:** Agentura vám předkládá `n` kandidátů, jeden po druhém. Po každém pohovoru se rozhodněte:

* pokud je *lepší* než aktuálně najatý kandidát → vyhoďte starého a najměte nového (cena `cₕ` za nábor),
* jinak ignorujte.

**Otázka:** kolik *náborů* (`hires`) provedete na n kandidátech?

```
HIRE-ASSISTANT(n):
    best = ∅  (nikdo zatím)
    pro i = 1, ..., n:
        pohovor s kandidátem i  (cena c_i, levné)
        pokud kandidát i je lepší než best:
            najmout i  (cena c_h, drahé)
            best = i
```

**Cena**: `O(c_i n + c_h · #hires)`. Otázka tedy zní: jaká je očekávaná hodnota `#hires`?

### Worst-case (deterministický)

Pokud agentura předkládá kandidáty v *vzestupném* pořadí (každý je lepší), najmete *všech `n`* — cena `O(c_h · n)`. To je *adverzariální* scénář.

### Randomizace

Před pohovory **náhodně permutujeme** seznam kandidátů. Pak každá z `n!` permutací je stejně pravděpodobná.

### Analýza přes indikátory

Definujme indikátor `X_i = 1` ⇔ kandidát `i` byl najat. Pak `#hires = Σ X_i`.

`X_i = 1` přesně tehdy, když je kandidát `i` *nejlepší* z prvních `i` v náhodné permutaci. To je *symetrická* záležitost — z `i` lidí má každý stejnou pravděpodobnost být nejlepší, tedy:

::: math
P(X_i = 1) = \frac{1}{i}.
:::

Z linearity:

::: math
E[\#\text{hires}] = E\!\left[\sum_{i=1}^{n} X_i\right] = \sum_{i=1}^{n} \frac{1}{i} = H_n \approx \ln n + 0{,}577.
:::

`H_n` je `n`-té harmonické číslo. Tedy *očekávaný* počet náborů je *logaritmický*, místo lineárního worst-case. Cena `O(c_i n + c_h ln n)`.

::: svg "H_n roste pomalu — pro n = 1000 je H_n ≈ 7,5; pro n = 10⁶ je H_n ≈ 14,4."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <line x1="40" y1="170" x2="510" y2="170" stroke="var(--line-strong)"/>
    <line x1="40" y1="20" x2="40" y2="170" stroke="var(--line-strong)"/>
    <text x="35" y="170" text-anchor="end" fill="var(--text-muted)">0</text>
    <text x="35" y="125" text-anchor="end" fill="var(--text-muted)">5</text>
    <text x="35" y="80" text-anchor="end" fill="var(--text-muted)">10</text>
    <text x="35" y="35" text-anchor="end" fill="var(--text-muted)">15</text>
    <text x="40" y="185" text-anchor="middle" fill="var(--text-muted)">1</text>
    <text x="170" y="185" text-anchor="middle" fill="var(--text-muted)">10²</text>
    <text x="300" y="185" text-anchor="middle" fill="var(--text-muted)">10⁴</text>
    <text x="430" y="185" text-anchor="middle" fill="var(--text-muted)">10⁶</text>
    <path d="M 40 168 L 100 110 L 170 95 L 235 80 L 300 65 L 365 50 L 430 35 L 500 25"
          stroke="var(--accent-line)" fill="none" stroke-width="2"/>
    <text x="200" y="55" fill="var(--accent-line)">H_n ≈ ln n</text>
    <path d="M 40 168 L 100 165 L 170 145 L 235 100 L 300 25 L 365 10 L 430 5"
          stroke="var(--accent)" fill="none" stroke-width="2"/>
    <text x="430" y="35" fill="var(--accent)">n (lineární)</text>
  </g>
</svg>
:::

## Indikátorová technika obecně

Postup:

1. Identifikuj veličinu zájmu jako *počet jevů*: `X = Σ X_i`, kde `X_i = 1_{A_i}`.
2. Spočítej `P(A_i)` *pro každé `i`* (často symetrickým argumentem).
3. Použij linearitu: `E[X] = Σ P(A_i)`.

### Příklad — kupon collector

**Zadání:** Existuje `n` druhů cuponů. Kupujete jeden po druhém (každý nákup je *uniformně náhodný* z `n` druhů). Kolik nákupů potřebujete pro získání všech `n`?

**Indikátorový rozklad:** Buď `Y_i` = počet nákupů potřebných pro získání `i`-tého nového druhu, jakmile máme `i − 1` druhů. Celkem `X = Σ Y_i`.

Pravděpodobnost, že další nákup přinese nový druh (když už máme `i − 1`): `p = (n − i + 1)/n`. `Y_i ∼ Ge(p)` ⇒ `E[Y_i] = n/(n − i + 1)`.

::: math
E[X] = \sum_{i=1}^{n} \frac{n}{n - i + 1} = n \cdot H_n \approx n \ln n.
:::

### Příklad — random walk návratu

V náhodné procházce na čísle linie (pravděpodobnost `1/2` jít vlevo, `1/2` vpravo), `E[počet návratů do 0 do času n]` se spočítá přes indikátory `1_{S_k = 0}`. Pravděpodobnost `P(S_k = 0)` je nenulová jen pro sudé `k`, a rovna `C(k, k/2) · 2⁻ᵏ ≈ √(2/(πk))` (Stirling). Suma vychází `Θ(√n)`.

## Když indikátory selhávají

Linearita dává *střední hodnotu*. Pokud potřebujeme *rozptyl* nebo *koncentrace* (Chernoff, Hoeffding), musíme znát *závislosti*:

::: math
\mathrm{Var}\!\left(\sum X_i\right) = \sum \mathrm{Var}(X_i) + \sum_{i \neq j} \mathrm{cov}(X_i, X_j).
:::

Pro **nezávislé** `X_i` se kovariance vynulují a součet rozptylů je analogie linearity střední hodnoty. Pro závislé indikátory je třeba kovariance počítat *jednotlivě*.

## Aplikace {tier=practice}

* **Hiring problem** — očekávaný počet náborů `O(log n)` = `H_n`.
* **Quicksort** ([[quicksort-analyza]]) — počet porovnání přes indikátory `1_{X_i compares with X_j}`.
* **Hash collisions** — očekávaný počet kolizí v hash tabulce.
* **Permutations** — očekávaný počet fixních bodů náhodné permutace = 1 (přes `n` indikátorů s `P = 1/n`).

::: viz quicksort-simulation "Aplikace indikátorové techniky: očekávaný počet porovnání = Σ P(zᵢ se porovná s zⱼ) = 2n ln n."
:::

::: link "CLRS, Cormen et al.: Introduction to Algorithms, kap. 5.2 — Indicator Random Variables" "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/"
:::

::: link "Mitzenmacher, M., Upfal, E.: Probability and Computing, kap. 2" "https://www.cs.purdue.edu/homes/spa/courses/pg17/mu-book.pdf"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=zhuOFLxyJdw" "SZZ: Randomizované algoritmy" "Tomáš Kocourek"
:::

*Zdroj: MSP přednášky 2025/26, *Randomized Algorithms — Indicator Variables* (Češka). Externí reference: Cormen, T. H. et al.: *Introduction to Algorithms* (3rd ed., MIT Press 2009), kap. 5.2; Mitzenmacher, M., Upfal, E.: *Probability and Computing* (Cambridge 2017), kap. 2; Motwani, R., Raghavan, P.: *Randomized Algorithms* (Cambridge 1995), kap. 1.*
