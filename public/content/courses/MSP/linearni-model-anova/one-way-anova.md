---
title: One-way ANOVA
---

# One-way ANOVA

**One-way ANOVA** (jednoduché třídění, jednoduché ANOVA) testuje, zda *střední hodnoty* několika skupin jsou stejné. Je to *zobecnění dvouvýběrového t-testu* na `k ≥ 2` skupin. Postavena je na rozkladu *total sum of squares* na *between-groups* a *within-groups* část, jejichž poměr má pod nulovou hypotézou F-rozdělení.

## Model

Mějme `k` skupin (faktor s `k` úrovněmi). V `j`-té skupině `n_j` pozorování:

::: math
Y_{ij} = \mu_j + \varepsilon_{ij}, \quad i = 1, \dots, n_j, \quad j = 1, \dots, k,
:::

s `ε_{ij} ∼ N(0, σ²)` i.i.d. Celkem `n = Σ n_j` pozorování.

Ekvivalentní *effect-form*:

::: math
Y_{ij} = \mu + \alpha_j + \varepsilon_{ij}, \quad \sum_j \alpha_j = 0,
:::

kde `μ` je *grand mean*, `α_j = μ_j − μ` je efekt skupiny.

### Lineární model

Jako maticový lineární model: `Y = X β + ε`, kde `X` je `n × k` matice dummy proměnných (po jednom sloupci pro každou skupinu) a `β = (μ₁, …, μ_k)ᵀ`.

## Hypotézy

* `H₀: μ₁ = μ₂ = … = μ_k` (všechny skupiny mají stejnou střední hodnotu).
* `H₁: ∃ i, j : μᵢ ≠ μⱼ` (alespoň jedna dvojice se liší).

`H₁` je *zobecněný* — neříká *které* skupiny se liší. Pro pinpoint detection slouží *post-hoc* testy ([[two-way-posthoc]]).

## Rozklad součtu čtverců

Označme `Ȳⱼ = (1/n_j) Σ_i Yᵢⱼ` (skupinový průměr) a `Ȳ = (1/n) Σ_{i,j} Yᵢⱼ` (grand mean).

::: math
\underbrace{\sum_{i,j} (Y_{ij} - \bar{Y})^2}_{SST} = \underbrace{\sum_j n_j (\bar{Y}_j - \bar{Y})^2}_{SS_B} + \underbrace{\sum_{i,j} (Y_{ij} - \bar{Y}_j)^2}_{SS_W}.
:::

* **SST** (total sum of squares) — celková variabilita.
* **SS_B** (between-groups) — variabilita mezi skupinovými průměry. Vysvětlená modelem.
* **SS_W** (within-groups) — variabilita uvnitř skupin. Nevysvětlená („šum").

### Identita platí *vždy*

Stačí ortogonalita projekcí v R^n. Identita je *geometrická* — nemá nic společného s `H₀`.

## F-statistika

::: math
F = \frac{MS_B}{MS_W} = \frac{SS_B / (k - 1)}{SS_W / (n - k)}.
:::

* `MS_B` (mean square between) = `SS_B / (k − 1)`, *df* mezi = `k − 1`.
* `MS_W` (mean square within) = `SS_W / (n − k)`, *df* uvnitř = `n − k`.

### Distribuce pod `H₀`

::: math
F \sim F(k - 1, n - k).
:::

Důvod: `SS_B/σ² ∼ χ²(k − 1)` a `SS_W/σ² ∼ χ²(n − k)`, *nezávislé* (Cochranova věta pro normální data).

### Rozhodnutí

Zamítnout `H₀` ⇔ `F > F_{α, k − 1, n − k}`. p-hodnota: `P(F(k − 1, n − k) > F_{obs})`.

## ANOVA tabulka

Standardní výstupní formát:

| Zdroj | df | SS | MS | F | p |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Between groups | `k − 1` | `SS_B` | `MS_B` | `F` | `p` |
| Within groups | `n − k` | `SS_W` | `MS_W` | | |
| Total | `n − 1` | `SST` | | | |

## Numerický příklad

Test, zda 3 metody učení vedou k stejným výsledkům.

```
Metoda 1: 75, 82, 80, 76, 79  (n₁=5, Ȳ₁=78,4)
Metoda 2: 85, 88, 86, 90, 87  (n₂=5, Ȳ₂=87,2)
Metoda 3: 80, 83, 78, 82, 85  (n₃=5, Ȳ₃=81,6)
```

`n = 15`, `Ȳ = 82,4`.

`SS_B = 5·(78,4 − 82,4)² + 5·(87,2 − 82,4)² + 5·(81,6 − 82,4)² = 80 + 115,2 + 3,2 = 198,4`.

`SS_W = Σ (Yᵢⱼ − Ȳⱼ)²` (spočítáme po skupinách): `~78`.

`F = (198,4/2) / (78/12) = 99,2 / 6,5 ≈ 15,3`.

`F_{0,05, 2, 12} ≈ 3,89`. `15,3 > 3,89` ⇒ zamítáme `H₀`. p ≪ 0,001. *Alespoň jedna metoda se liší*.

## Předpoklady ANOVA

1. **Nezávislost** uvnitř i mezi skupinami.
2. **Normalita** reziduí `ε_{ij} ∼ N(0, σ²)`. Pro `n_j ≥ 30` méně kritická (CLT).
3. **Homoskedasticita** — *stejný* rozptyl `σ²` ve všech skupinách.

### Diagnostika

* **Q-Q plot reziduí** — vizuální normalita.
* **Levenův test, Bartlettův test, Brown-Forsythův test** — homogenita rozptylů. Doporučení: Levene/BF (robustnější).
* **Šikmost/špičatost** — popisné statistiky.

### Co když selžou

* **Nenormalita** → **Kruskal-Wallis test** ([[rank-testy]]) — neparametrická obdoba.
* **Heteroskedasticita** → **Welchova ANOVA** (verze pro nestejné rozptyly), Brown-Forsythův F-test.
* **Outliers** → trimmed mean ANOVA, robust ANOVA.

## Effect size

F-statistika sama o sobě je *test*, neudává *velikost efektu*. Doplňkové metriky:

* **η²** (eta-squared): `η² = SS_B / SST`. Podíl vysvětlené variability. `0,01` small, `0,06` medium, `0,14` large (Cohen).
* **ω²** (omega-squared): `ω² = (SS_B − (k − 1) MS_W) / (SST + MS_W)`. Nestranná verze.

## Plánování — velikost vzorku

Pro detekci efektu velikosti `f = √(η²/(1 − η²))` s úrovní `α` a silou `1 − β`:

```r
library(pwr)
pwr.anova.test(k=3, f=0.4, sig.level=0.05, power=0.80)
```

Vrátí `n` per skupinu.

## Aplikace {tier=practice}

* **Lékové studie** — porovnání 3+ skupin (placebo + 2 dávky).
* **A/B/C testing** — porovnání více variant UI.
* **Vzdělávání** — efektivita různých výukových metod.
* **Experiment design** — randomized complete block design (RCBD).
* **Quality control** — porovnání 4 výrobních linek.

## Po F-testu — co dál?

ANOVA říká *zda* se skupiny liší. Pokud ano, *které*?

* **Post-hoc testy** ([[two-way-posthoc]]): Tukey HSD, Bonferroni, Scheffé.
* **Plánované kontrasty** (preplanned contrasts): testují *konkrétní* hypotézy o lineárních kombinacích `μⱼ`.

::: viz anova-interactive "Posuvníky μ₁, μ₂, μ₃, σ; sledujte tabulku ANOVA (SS_B, SS_W, F), p-hodnotu a rozhodnutí."
:::

::: link "Faraway, J.: Linear Models with R, kap. 4 (ANOVA)" "https://www.routledge.com/Linear-Models-with-R/Faraway/p/book/9781439887332"
:::

::: link "DeGroot, M., Schervish, M.: Probability and Statistics, kap. 11.6" "https://www.pearson.com/en-us/subject-catalog/p/probability-and-statistics/P200000006228"
:::

::: link "Fisher, R. A.: Statistical Methods for Research Workers (Oliver & Boyd 1925)" "https://psychclassics.yorku.ca/Fisher/Methods/"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=NF5_btOaCig" "Using Linear Models for t-tests and ANOVA, Clearly Explained!!!" "StatQuest with Josh Starmer"
:::

*Zdroj: MSP přednášky 2025/26, *Linear Model — One-way ANOVA* (Hrabec). Externí reference: Zvára, K.: *Regrese* (Matfyzpress 2019); Faraway, J.: *Linear Models with R* (CRC 2014), kap. 4; Fisher, R. A.: *Statistical Methods for Research Workers* (1925).*
