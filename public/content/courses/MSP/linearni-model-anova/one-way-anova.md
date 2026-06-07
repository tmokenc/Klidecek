---
title: Jednofaktorová ANOVA (one-way ANOVA)
---

# Jednofaktorová ANOVA (one-way ANOVA)

**Jednofaktorová ANOVA (one-way ANOVA)**, česky též jednoduché třídění, testuje, zda jsou *střední hodnoty* několika skupin stejné. Jde o *zobecnění dvouvýběrového t-testu* na `k ≥ 2` skupin. Metoda stojí na rozkladu *celkového součtu čtverců (total sum of squares)* na *mezi­skupinovou (between-groups)* a *vnitro­skupinovou (within-groups)* část. Poměr těchto dvou částí má za platnosti nulové hypotézy F-rozdělení. Jednoduše řečeno: porovnáváme variabilitu *mezi* skupinovými průměry s variabilitou *uvnitř* skupin — pokud je ta první výrazně větší, skupiny se nejspíš liší.

## Model

Mějme `k` skupin (faktor s `k` úrovněmi). V `j`-té skupině je `n_j` pozorování:

::: math
Y_{ij} = \mu_j + \varepsilon_{ij}, \quad i = 1, \dots, n_j, \quad j = 1, \dots, k,
:::

kde `ε_{ij} ∼ N(0, σ²)` jsou nezávislé a stejně rozdělené (i.i.d.). Celkem máme `n = Σ n_j` pozorování.

Ekvivalentní zápis pomocí efektů (*effect-form*):

::: math
Y_{ij} = \mu + \alpha_j + \varepsilon_{ij}, \quad \sum_j \alpha_j = 0,
:::

kde `μ` je celkový průměr (*grand mean*) a `α_j = μ_j − μ` je efekt `j`-té skupiny (o kolik se její střední hodnota odchyluje od celkového průměru).

### Lineární model

Zapsáno jako maticový lineární model: `Y = X β + ε`, kde `X` je matice indikátorových (dummy) proměnných rozměru `n × k` — jeden sloupec pro každou skupinu — a `β = (μ₁, …, μ_k)ᵀ`.

## Hypotézy

* `H₀: μ₁ = μ₂ = … = μ_k` (všechny skupiny mají stejnou střední hodnotu).
* `H₁: ∃ i, j : μᵢ ≠ μⱼ` (alespoň jedna dvojice skupin se liší).

Alternativa `H₁` je *zobecněná* — neříká, *které* skupiny se liší. K přesnému určení odlišných skupin slouží *post-hoc* testy ([[two-way-posthoc]]).

## Rozklad součtu čtverců

Označme `Ȳⱼ = (1/n_j) Σ_i Yᵢⱼ` (skupinový průměr) a `Ȳ = (1/n) Σ_{i,j} Yᵢⱼ` (celkový průměr, *grand mean*).

::: math
\underbrace{\sum_{i,j} (Y_{ij} - \bar{Y})^2}_{SST} = \underbrace{\sum_j n_j (\bar{Y}_j - \bar{Y})^2}_{SS_B} + \underbrace{\sum_{i,j} (Y_{ij} - \bar{Y}_j)^2}_{SS_W}.
:::

* **SST** (celkový součet čtverců, total sum of squares) — celková variabilita.
* **SS_B** (mezi­skupinový, between-groups) — variabilita mezi skupinovými průměry. Tu vysvětluje model.
* **SS_W** (vnitro­skupinový, within-groups) — variabilita uvnitř skupin. Tu model nevysvětluje (jde o „šum").

### Identita platí *vždy*

K jejímu důkazu stačí ortogonalita projekcí v R^n. Tato identita je *geometrická* — s nulovou hypotézou `H₀` nemá nic společného a platí bez ohledu na ni.

## F-statistika

::: math
F = \frac{MS_B}{MS_W} = \frac{SS_B / (k - 1)}{SS_W / (n - k)}.
:::

* `MS_B` (průměrný čtverec mezi skupinami, mean square between) = `SS_B / (k − 1)`, počet stupňů volnosti (*df*) mezi skupinami = `k − 1`.
* `MS_W` (průměrný čtverec uvnitř skupin, mean square within) = `SS_W / (n − k)`, počet stupňů volnosti uvnitř skupin = `n − k`.

### Rozdělení za platnosti `H₀`

::: math
F \sim F(k - 1, n - k).
:::

Důvod: `SS_B/σ² ∼ χ²(k − 1)` a `SS_W/σ² ∼ χ²(n − k)` jsou *nezávislé* (plyne z Cochranovy věty pro normální data).

### Rozhodnutí

`H₀` zamítáme právě tehdy, když `F > F_{α, k − 1, n − k}`. p-hodnota je `P(F(k − 1, n − k) > F_{obs})`.

## Tabulka ANOVA

Standardní formát výstupu:

| Zdroj | df | SS | MS | F | p |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Mezi skupinami | `k − 1` | `SS_B` | `MS_B` | `F` | `p` |
| Uvnitř skupin | `n − k` | `SS_W` | `MS_W` | | |
| Celkem | `n − 1` | `SST` | | | |

## Numerický příklad

Otestujme, zda 3 metody učení vedou ke stejným výsledkům.

```
Metoda 1: 75, 82, 80, 76, 79  (n₁=5, Ȳ₁=78,4)
Metoda 2: 85, 88, 86, 90, 87  (n₂=5, Ȳ₂=87,2)
Metoda 3: 80, 83, 78, 82, 85  (n₃=5, Ȳ₃=81,6)
```

`n = 15`, `Ȳ = 82,4`.

`SS_B = 5·(78,4 − 82,4)² + 5·(87,2 − 82,4)² + 5·(81,6 − 82,4)² = 80 + 115,2 + 3,2 = 198,4`.

`SS_W = Σ (Yᵢⱼ − Ȳⱼ)²` (počítáme po skupinách): `~78`.

`F = (198,4/2) / (78/12) = 99,2 / 6,5 ≈ 15,3`.

`F_{0,05, 2, 12} ≈ 3,89`. Protože `15,3 > 3,89`, hypotézu `H₀` zamítáme. p ≪ 0,001. *Alespoň jedna metoda se liší*.

## Předpoklady ANOVA

1. **Nezávislost** uvnitř i mezi skupinami.
2. **Normalita** reziduí `ε_{ij} ∼ N(0, σ²)`. Pro `n_j ≥ 30` je tento předpoklad méně kritický (díky centrální limitní větě, CLT).
3. **Homoskedasticita** — *stejný* rozptyl `σ²` ve všech skupinách.

### Diagnostika

* **Q-Q graf reziduí** — vizuální posouzení normality.
* **Leveneův test, Bartlettův test, Brownův-Forsytheův test** — homogenita rozptylů. Doporučení: Leveneův/BF test (jsou robustnější).
* **Šikmost/špičatost** — popisné statistiky.

### Co dělat, když předpoklady selžou

* **Nenormalita** → **Kruskalův-Wallisův test** ([[rank-testy]]) — neparametrická obdoba.
* **Heteroskedasticita** (nestejné rozptyly) → **Welchova ANOVA** (verze pro nestejné rozptyly), Brownův-Forsytheův F-test.
* **Odlehlá pozorování (outliers)** → ANOVA s oříznutým průměrem (trimmed mean ANOVA), robustní ANOVA.

## Velikost efektu (effect size)

F-statistika je sama o sobě *test*, neudává *velikost efektu*. K tomu slouží doplňkové metriky:

* **η²** (eta-kvadrát, eta-squared): `η² = SS_B / SST`. Podíl vysvětlené variability. Orientačně `0,01` malý, `0,06` střední, `0,14` velký efekt (Cohen).
* **ω²** (omega-kvadrát, omega-squared): `ω² = (SS_B − (k − 1) MS_W) / (SST + MS_W)`. Nestranná (nevychýlená) verze.

## Plánování — velikost vzorku

Pro detekci efektu velikosti `f = √(η²/(1 − η²))` při hladině významnosti `α` a síle testu `1 − β`:

```r
library(pwr)
pwr.anova.test(k=3, f=0.4, sig.level=0.05, power=0.80)
```

Funkce vrátí potřebné `n` na jednu skupinu.

## Aplikace {tier=practice}

* **Lékové studie** — porovnání 3 a více skupin (placebo + 2 dávky).
* **A/B/C testování** — porovnání více variant uživatelského rozhraní.
* **Vzdělávání** — efektivita různých výukových metod.
* **Návrh experimentu** — randomizovaný úplný blokový návrh (randomized complete block design, RCBD).
* **Řízení kvality (quality control)** — porovnání 4 výrobních linek.

## Po F-testu — co dál?

ANOVA říká, *zda* se skupiny liší. Pokud ano, je třeba zjistit, *které*.

* **Post-hoc testy** ([[two-way-posthoc]]): Tukeyho HSD, Bonferroniho korekce, Schefféova metoda.
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
