---
title: Predikce a výběr modelu
---

# Predikce a výběr modelu

Po validovaném fitu nastává praktická úloha: *predikce* pro nové hodnoty `x₀` a *výběr modelu* z mnoha kandidátů. Predikce vyžaduje rozlišení mezi *konfidenčním* (pro střední hodnotu `E[Y | x₀]`) a *predikčním* (pro individuální `Y(x₀)`) intervalem. Výběr modelu kombinuje information criteria, cross-validation a domain expertise.

## Bodová predikce

Pro nové hodnoty prediktorů `x₀ = (1, x_{0,1}, …, x_{0,p})ᵀ`:

::: math
\hat{Y}(\mathbf{x}_0) = \mathbf{x}_0^\top \hat{\boldsymbol{\beta}} = \hat{\beta}_0 + \hat{\beta}_1 x_{0,1} + \dots + \hat{\beta}_p x_{0,p}.
:::

To je bodová predikce — *jedno číslo*. Bez kvantifikace nejistoty *nemá smysl*.

## Konfidenční interval pro `E[Y | x₀]`

CI pro *střední* hodnotu odezvy v bodě `x₀`:

::: math
\hat{Y}(\mathbf{x}_0) \pm t_{\alpha/2, n-p-1} \cdot S_{res} \sqrt{\mathbf{x}_0^\top (\mathbf{X}^\top \mathbf{X})^{-1} \mathbf{x}_0}.
:::

Označme `d²(x₀) = x₀ᵀ(XᵀX)⁻¹ x₀`. Pak:

::: math
CI(E[Y | x_0]) = \hat{Y}(\mathbf{x}_0) \pm t_{\alpha/2, n-p-1} \cdot S_{res} \cdot d(\mathbf{x}_0).
:::

Interpretace: „při opakování experimentu by ve `(1 − α)·100 %` případů spočítaný CI obsahoval pravou `E[Y | x₀]`".

### Vlastnosti

* CI je *nejužší* v centru dat (`x₀ ≈ x̄`).
* CI se *rozšiřuje* hyperbolicky se vzdáleností `x₀` od `x̄` (half-width `∝ √(1/n + (x₀−x̄)²/S_xx)`, tvar přesýpacích hodin / bowtie).
* Pro `n → ∞`: `d(x₀) → 0`, CI se zužuje (vyšší jistota).

## Predikční interval pro individuální `Y(x₀)`

Predikce *jednotlivé* hodnoty `Y(x₀)` má větší nejistotu — kromě nejistoty v `E[Y | x₀]` (modelové) musíme započítat *individuální* šum `ε(x₀) ∼ N(0, σ²)`:

::: math
PI(Y(\mathbf{x}_0)) = \hat{Y}(\mathbf{x}_0) \pm t_{\alpha/2, n-p-1} \cdot S_{res} \sqrt{1 + d^2(\mathbf{x}_0)}.
:::

`+ 1` zachycuje individuální šum. Predikční interval je *vždy širší* než konfidenční.

::: svg "Konfidenční (pro střední Y) je užší než predikční (pro individuální Y); rozdíl roste se vzdáleností od x̄."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <line x1="40" y1="170" x2="500" y2="170" stroke="var(--line-strong)"/>
    <line x1="40" y1="20" x2="40" y2="170" stroke="var(--line-strong)"/>
    <text x="510" y="175" fill="var(--text-muted)">x</text>
    <text x="270" y="190" text-anchor="middle" fill="var(--text-muted)">x̄</text>
    <line x1="60" y1="140" x2="490" y2="40" stroke="var(--accent)" stroke-width="2"/>
    <path d="M 60 130 Q 270 95 490 50" stroke="var(--accent-line)" fill="none" stroke-width="1.5"/>
    <path d="M 60 150 Q 270 105 490 30" stroke="var(--accent-line)" fill="none" stroke-width="1.5"/>
    <path d="M 60 115 Q 270 90 490 65" stroke="var(--text-muted)" fill="none" stroke-width="1.5" stroke-dasharray="3 2"/>
    <path d="M 60 165 Q 270 110 490 15" stroke="var(--text-muted)" fill="none" stroke-width="1.5" stroke-dasharray="3 2"/>
    <text x="425" y="48" fill="var(--accent-line)" font-size="10">CI</text>
    <text x="455" y="20" fill="var(--text-muted)" font-size="10">PI</text>
  </g>
</svg>
:::

## Extrapolace — pozor!

Vzorec pro CI/PI platí pro `x₀ ∈` *range pozorovaných* prediktorů. *Extrapolace* (`x₀` mimo range) je nebezpečná:

* Lineární model nemusí platit mimo pozorované hodnoty.
* `d(x₀)` nemusí spočítat *fyzikální* nejistotu — jen *statistickou*.
* Nejistota i riziko model-misspecification rostou rychle mimo pozorovaný rozsah; nespoléhejte na statistický interval — ten zachycuje jen rozptyl, ne porušení linearity.

## Výběr modelu — Why & How

S `p` prediktory je `2^p` možných modelů (každý prediktor in/out). Pro `p = 10` to je `1024`. Pro `p = 20` přes milion. *Není možné* fitovat všechny → potřebujeme strategii.

### Cíle výběru

* **Predikce** — minimalizovat predikční chybu na *nových* datech.
* **Interpretace** — najít *parsimonious* model (málo prediktorů, jednoduchý popis).
* **Inference** — najít *kauzální* prediktory.

Volba cíle určuje strategii. Predikční model může mít mnoho korelovaných prediktorů; interpretační vyžaduje *řidký* model.

## Stepwise selection

Klasický (ale kritizovaný) přístup:

### Forward selection

```
začni s prázdným modelem (jen intercept)
opakuj:
    zkus přidat každý prediktor mimo model
    vybrat ten s nejnižším p-hodnotou (nebo nejvyšším improvement F)
    pokud p < threshold (např. 0,05): přidej
    jinak: stop
```

### Backward elimination

```
začni s plným modelem (všechny prediktory)
opakuj:
    najdi prediktor s nejvyšší p-hodnotou
    pokud p > threshold: odstraň
    jinak: stop
```

### Stepwise (kombinovaný)

Střídá forward a backward — vždy zvážíme oba kroky.

### Kritika

* **Není konsistentní** — různé strategie vedou k různým modelům.
* **Inferenční problém** — p-hodnoty ve finálním modelu nejsou platné (Type I error inflace).
* **Není robustní** vůči multikolinearitě.
* **Nedeterministic** — pořadí může změnit výsledek.

Moderní doporučení (Harrell 2015, Heinze 2018): *vyhněte se stepwise*, použijte LASSO nebo full-model + regularizaci.

## Information criteria

### AIC, BIC, AICc

Pro fit modelu s likelihood `L̂` a `k` parametry:

* **AIC**: `−2 log L̂ + 2k` — Akaike. Asymptoticky efektivní (najde *nejlepší prediktivní* model).
* **BIC**: `−2 log L̂ + k log n` — Bayesian. *Konzistentní* (najde *pravý* model, pokud existuje).
* **AICc**: `AIC + 2k(k+1)/(n − k − 1)` — small-sample korekce AIC.

Pro lineární model:

::: math
AIC = n \log(RSS/n) + 2k.
:::

### Strategie

* `BIC` favorizuje *jednodušší* modely (penalty `log n > 2` pro `n ≥ 8`).
* `AIC` favorizuje *prediktivnější* modely.
* Volba mezi AIC/BIC = volba cíle (prediction vs. truth).

## Cross-validation

**k-fold CV**:

```
rozděl data na k částí (folds)
pro každý fold f:
    fit model na (data minus fold f)
    predikuj fold f
    spočítej chybu
průměrná chyba = odhad out-of-sample chyby
```

Speciální případ: **Leave-one-out CV** (LOOCV) = `k = n`. Pro lineární model existuje *analytická* formule (PRESS z [[kvalita-modelu]]).

### Výhody CV

* Empirický odhad prediktivní chyby — nezávisí na asymptotice.
* Funguje pro libovolné modely (ne jen lineární).
* `k = 5` nebo `10` jsou standard. *Repeated CV* pro stabilitu.

## Regularizace — LASSO, Ridge, Elastic Net

Místo *výběru* prediktorů (in/out), *všechny* prediktory zachovat ale *zmenšit* koeficienty.

### Ridge regression

::: math
\hat{\boldsymbol{\beta}}_{ridge} = \arg\min_{\boldsymbol{\beta}} \left( \|\mathbf{Y} - \mathbf{X} \boldsymbol{\beta}\|^2 + \lambda \|\boldsymbol{\beta}\|_2^2 \right).
:::

* Penalizace `L2`.
* Krčí všechny `β̂_j` *ke nule*, ale *žádný neeliminuje*.
* Stabilizuje multikolinearitu.

### LASSO

::: math
\hat{\boldsymbol{\beta}}_{LASSO} = \arg\min_{\boldsymbol{\beta}} \left( \|\mathbf{Y} - \mathbf{X} \boldsymbol{\beta}\|^2 + \lambda \|\boldsymbol{\beta}\|_1 \right).
:::

* Penalizace `L1`.
* Některé `β̂_j = 0` *přesně* — *automatický výběr proměnných*.
* Best of both: regularizace + sparse model.

### Elastic Net

Kombinace `L1 + L2`. Užitečné pro vysoce korelované prediktory.

Volba `λ` přes *cross-validation*.

## Praktický workflow {tier=practice}

1. **Exploratory** — popisné statistiky, korelace, scatter plots.
2. **Fit kandidátů** — `lm()` s několika konfiguracemi.
3. **Diagnostika** — `plot(model)`, VIF, normalita reziduí.
4. **Porovnání** — AIC, BIC, R²_adj, CV.
5. **Validace** — *holdout* dataset, predikce na nových datech.
6. **Interpretace** — koeficienty + CI + fyzikální význam.

## Aplikace {tier=practice}

* **Engineering** — predikce výkonu, kalibrace senzorů.
* **Economics** — predikce HDP, inflace.
* **Marketing** — return on advertising spend (ROAS).
* **Biology** — quantitative trait loci (QTL), allometrie.
* **Machine learning** — base-line modely před hlubokým učením.

::: viz prediction-vs-confidence-band "Posuňte x₀; sledujte hyperbolicky se rozšiřující CI (pro E[Y|x₀]) vs. PI (pro individuální Y(x₀))."
:::

::: link "Hastie, T., Tibshirani, R., Friedman, J.: Elements of Statistical Learning, kap. 3" "https://hastie.su.domains/ElemStatLearn/"
:::

::: link "Harrell, F.: Regression Modeling Strategies (Springer 2015)" "https://link.springer.com/book/10.1007/978-3-319-19425-7"
:::

::: link "Tibshirani, R.: Regression Shrinkage and Selection via the Lasso (JRSS B 1996)" "https://www.jstor.org/stable/2346178"
:::

---

*Zdroj: MSP přednášky 2025/26, *Linear Regression — Prediction and Model Selection* (Hrabec). Externí reference: Zvára, K.: *Regrese* (Matfyzpress 2019); Hastie, T., Tibshirani, R., Friedman, J.: *Elements of Statistical Learning* (Springer 2009); Harrell, F. E.: *Regression Modeling Strategies* (Springer 2015).*
