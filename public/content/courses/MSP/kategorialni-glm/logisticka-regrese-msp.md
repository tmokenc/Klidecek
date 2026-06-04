---
title: Logistická regrese
---

# Logistická regrese

**Logistická regrese** modeluje binární odezvu `Y ∈ {0, 1}` jako funkci prediktorů. Je *fundamentální* příklad GLM ([[glm-intro]]) — link funkce je *logit*, distribuce *Bernoulli*. Místo lineární predikce `β₀ + β₁ x` (která by mohla vyjít mimo `[0, 1]`) modeluje *log-odds* lineárně:

::: math
\log \frac{P(Y = 1 \mid \mathbf{x})}{P(Y = 0 \mid \mathbf{x})} = \mathbf{x}^\top \boldsymbol{\beta}.
:::

Logistická regrese je nejdůležitější klasifikační model klasické statistiky a base-line v ML.

## Model

Pro každé pozorování `(xᵢ, Yᵢ)` s `Yᵢ ∈ {0, 1}`:

::: math
P(Y_i = 1 \mid \mathbf{x}_i) = \pi_i = \frac{e^{\mathbf{x}_i^\top \boldsymbol{\beta}}}{1 + e^{\mathbf{x}_i^\top \boldsymbol{\beta}}} = \sigma(\mathbf{x}_i^\top \boldsymbol{\beta}),
:::

kde `σ(z) = 1/(1 + e^(−z))` je **sigmoid** (logistická funkce).

Ekvivalentně:

::: math
\mathrm{logit}(\pi_i) = \log \frac{\pi_i}{1 - \pi_i} = \mathbf{x}_i^\top \boldsymbol{\beta}.
:::

`Yᵢ | xᵢ ∼ Bernoulli(πᵢ)`.

## Likelihood

::: math
L(\boldsymbol{\beta}) = \prod_{i=1}^{n} \pi_i^{Y_i} (1 - \pi_i)^{1 - Y_i}.
:::

Log-likelihood:

::: math
\ell(\boldsymbol{\beta}) = \sum_{i=1}^{n} \left[ Y_i \log \pi_i + (1 - Y_i) \log(1 - \pi_i) \right] = \sum_{i=1}^{n} \left[ Y_i \cdot \mathbf{x}_i^\top \boldsymbol{\beta} - \log(1 + e^{\mathbf{x}_i^\top \boldsymbol{\beta}}) \right].
:::

To je *konvexní* funkce `β` — má **jediné globální maximum** (na rozdíl od neural sítí). MLE `β̂` je *jedinečný*.

## Cross-entropy v ML

V machine learningu se loss `−ℓ(β)` nazývá **cross-entropy loss** nebo **logistic loss**:

::: math
L_{CE} = -\frac{1}{n} \sum_{i=1}^{n} \left[ Y_i \log \pi_i + (1 - Y_i) \log(1 - \pi_i) \right].
:::

Trénování logistické regrese = minimalizace cross-entropy = maximum likelihood (princip jednotnosti).

## Newton-Raphson / IRLS

Likelihood equation `∂ℓ/∂β = 0` *nemá uzavřenou formu*. Numerická řešení:

### IRLS (Iteratively Reweighted Least Squares)

```
β⁰ = 0  (nebo small random)
opakuj:
    π = σ(X β)
    W = diag(πᵢ(1 − πᵢ))    # variance Bernoulli
    z = X β + W⁻¹(Y − π)    # working response
    β ← (XᵀWX)⁻¹ XᵀWz       # vážený OLS
    dokud ||Δβ|| < ε
```

IRLS *konverguje kvadraticky* (Newton-Raphson) a je *default* metoda v R/Python/SAS.

### Newton-Raphson přímo

Skórová funkce:

::: math
U(\boldsymbol{\beta}) = \frac{\partial \ell}{\partial \boldsymbol{\beta}} = \mathbf{X}^\top (\mathbf{Y} - \boldsymbol{\pi}).
:::

Hessian:

::: math
H(\boldsymbol{\beta}) = -\mathbf{X}^\top W \mathbf{X}.
:::

`W = diag(πᵢ(1 − πᵢ))`. Newton step:

::: math
\boldsymbol{\beta}^{k+1} = \boldsymbol{\beta}^k + (\mathbf{X}^\top W \mathbf{X})^{-1} \mathbf{X}^\top (\mathbf{Y} - \boldsymbol{\pi}).
:::

## Interpretace koeficientů

* **Změna log-odds**: jednotková změna `xⱼ` zvýší log-odds o `βⱼ`, *za fixovaných ostatních*.
* **Odds ratio**: `e^βⱼ` = poměr odds.
  * `βⱼ > 0, e^βⱼ > 1` — zvyšuje pravděpodobnost.
  * `βⱼ < 0, e^βⱼ < 1` — snižuje.
  * `βⱼ = 0, e^βⱼ = 1` — žádný efekt.
* **Aproximace**: pro malé `βⱼ` a `π ≈ 0,5`: `βⱼ ≈ relative change v π`.

### Příklad — riziko nemoci

`logit P(nemoc | věk, kouření) = −5 + 0,05 · věk + 0,8 · kouření`.

* Intercept −5: pro nekuřáka, věk 0, `P(nemoc) = σ(−5) ≈ 0,0067` (nereálné — extrapolace).
* `e^0,05 ≈ 1,051`: každý rok věku zvyšuje *odds* o 5,1 %.
* `e^0,8 ≈ 2,23`: kuřáci mají *odds* nemoci 2,23× vyšší než nekuřáci (při stejném věku).

## Statistická inference

Za regulárních podmínek MLE `β̂` má asymptoticky `N(β, J(β̂)⁻¹)`. Tedy:

* **Wald test** pro individuální koeficient: `Z_j = β̂_j / s.e.(β̂_j) ∼ N(0, 1)`.
* **LR test** ([[likelihood-ratio]]): porovnání nested modelů, `−2 log Λ ∼ χ²(k)`.
* **CI**: `β̂_j ± z_{α/2} · s.e.(β̂_j)`.

CI pro odds ratio: `exp(β̂_j ± z_{α/2} · s.e.(β̂_j))`.

## Diagnostika

* **Goodness-of-fit**: Hosmer-Lemeshowův test (binované rezidua).
* **Deviance**: `D = −2(ℓ(β̂) − ℓ_sat)`, kde `ℓ_sat` je saturated likelihood. Aproximuje `χ²(n − p − 1)`.
* **Pseudo-R²**: McFadden `R²_McF = 1 − ℓ(β̂)/ℓ_null`. Pozor: nemá interpretaci „podíl vysvětlené variability" jako klasické `R²`.
* **ROC curve / AUC**: predikční schopnost při různých prahových hodnotách. AUC = 0,5 → náhoda, 1,0 → perfektní.
* **Confusion matrix**: pro daný práh `c`, klasifikujeme `Ŷ = 1 ⇔ π̂ > c`.

## Separace

**Perfektní separace** = existuje lineární kombinace prediktorů, která *dokonale* odděluje třídy. Důsledek: MLE neexistuje (`β̂ → ∞`).

Detekce: některé `β̂` mají *obrovské* odhady a SE. Řešení:

* **Penalizace** (L2 ridge, L1 lasso).
* **Firthovo regularizační** (Firth 1993) — bias-corrected logistic regression.
* **Bayesian logistic** s informativním priorem.

## Multinomická logistická regrese

Pro `Y ∈ {1, 2, …, K}` (K kategorií): zvolíme *baseline* `K`, modelujeme:

::: math
\log \frac{P(Y = k \mid \mathbf{x})}{P(Y = K \mid \mathbf{x})} = \mathbf{x}^\top \boldsymbol{\beta}_k, \quad k = 1, \dots, K - 1.
:::

Ekvivalent: **softmax**:

::: math
P(Y = k \mid \mathbf{x}) = \frac{e^{\mathbf{x}^\top \boldsymbol{\beta}_k}}{\sum_{j=1}^{K} e^{\mathbf{x}^\top \boldsymbol{\beta}_j}}.
:::

(Standardně `β_K = 0` pro identifikovatelnost.)

V deep learningu: poslední vrstva neuronky pro klasifikaci je *softmax* — *logistická regrese na embeddings*.

## Ordinální logistická regrese

Pro `Y ∈ {1, 2, …, K}` *ordinální* (uspořádané kategorie): **proportional odds model**:

::: math
\log \frac{P(Y \le k \mid \mathbf{x})}{P(Y > k \mid \mathbf{x})} = \alpha_k - \mathbf{x}^\top \boldsymbol{\beta}.
:::

`αⱼ` jsou *prahy* (thresholds), `β` je *společné* pro všechna `k` — proto „proportional odds". Test předpokladu: Brantův test.

## Pozor — extrapolace

Logistická regrese predikuje `P(Y = 1 | x) ∈ (0, 1)` pro libovolné `x` (nikdy přesně 0 nebo 1). Ale *extrapolace* mimo range trénovacích dat je *nespolehlivá*. Sigmoid se „lepí" k 0 nebo 1 mimo training data — predikce může být *jistá ale špatná*.

## Aplikace {tier=practice}

* **Medical** — riziko onemocnění, mortality predikce.
* **Banking** — credit scoring, default predikce.
* **Marketing** — churn prediction, click-through rate.
* **Fraud detection** — pravděpodobnost podvodu.
* **Spam filtering** — Naive Bayes alternativa.
* **NLP** — sentiment analysis (binary), text klasifikace.
* **Genomics** — disease-gene associations.

::: viz logistic-boundary "2D scatter s binárními labely + sigmoid heatmap; batch GA fit nebo manuální nastavení vah."
:::

::: link "Hosmer, D., Lemeshow, S., Sturdivant, R.: Applied Logistic Regression (Wiley 2013, 3rd ed.)" "https://onlinelibrary.wiley.com/doi/book/10.1002/9781118548387"
:::

::: link "Agresti, A.: Categorical Data Analysis (Wiley 2013)" "https://onlinelibrary.wiley.com/doi/book/10.1002/9780470594001"
:::

::: link "James, G. et al.: An Introduction to Statistical Learning, kap. 4" "https://www.statlearning.com/"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=yIYKR4sgzI8" "StatQuest: Logistic Regression" "StatQuest with Josh Starmer"
:::

*Zdroj: MSP přednášky 2025/26, *Logistic Regression — GLM intro* (Hrabec). Externí reference: Agresti, A.: *Categorical Data Analysis* (Wiley 2013, 3rd ed.); Hosmer, D., Lemeshow, S., Sturdivant, R.: *Applied Logistic Regression* (Wiley 2013, 3rd ed.); James, G., Witten, D., Hastie, T., Tibshirani, R.: *An Introduction to Statistical Learning* (Springer 2021), kap. 4.*
