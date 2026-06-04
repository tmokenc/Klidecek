---
title: Generalized linear models (GLM)
---

# Generalized linear models (GLM)

**Generalized linear models** (GLM) je rámec sjednocující lineární regresi, logistickou regresi, Poissonovu regresi, Gamma regresi a další klasické modely pod *jedinou* matematickou strukturou. Nelson a Wedderburn (1972) ukázali, že tyto modely sdílí *systematickou složku* (lineární prediktor), *náhodnou složku* (rozdělení z [[exponencialni-rodina|exponenciální rodiny]]) a *link funkci* (převádí jedno na druhé). GLM je *teoretický backbone* moderní statistiky a klíčový krok ke pochopení moderního ML.

## Struktura GLM

GLM má tři komponenty:

### 1. Náhodná složka

`Y₁, …, Yₙ` jsou nezávislé NV z **exponenciální rodiny**:

::: math
f(y; \theta_i, \phi) = \exp\!\left( \frac{y \theta_i - b(\theta_i)}{a(\phi)} + c(y, \phi) \right).
:::

* `θᵢ` — *canonical parameter*
* `φ` — *dispersion parameter*
* `b(θ)` — *cumulant function*
* `a(φ)`, `c(y, φ)` — pomocné funkce

Speciální případy:

| Rodina | `θ` | `b(θ)` | `a(φ)` | Použití |
| :--- | :--- | :--- | :--- | :--- |
| `N(μ, σ²)` | `μ` | `θ²/2` | `σ²` | spojité, symetrické |
| `Bernoulli(p)` | `logit(p)` | `log(1 + e^θ)` | `1` | binární |
| `Bi(n, p)` | `logit(p)` | `n log(1 + e^θ)` | `1` | proporce |
| `Po(λ)` | `log λ` | `e^θ` | `1` | counts |
| `Exp(λ)` | `−λ` | `−log(−θ)` | `1` | doby |
| `Γ(k, θ)` | `−1/θ` | `−log(−θ)` | `1/k` | spojité positivní |

### 2. Systematická složka

**Lineární prediktor**:

::: math
\eta_i = \mathbf{x}_i^\top \boldsymbol{\beta} = \beta_0 + \beta_1 x_{i1} + \dots + \beta_p x_{ip}.
:::

### 3. Link funkce

**Link funkce** `g(·)` spojuje střední hodnotu `μᵢ = E[Yᵢ]` s lineárním prediktorem:

::: math
g(\mu_i) = \eta_i = \mathbf{x}_i^\top \boldsymbol{\beta}.
:::

Inverzní `μᵢ = g⁻¹(ηᵢ)` je *odpověďová* funkce (response function).

| Distribuce | Canonical link | Name |
| :--- | :--- | :--- |
| Normal | `μ` (identity) | identity link |
| Bernoulli/Binomial | `log(μ/(1−μ))` | logit |
| Poisson | `log μ` | log link |
| Gamma | `1/μ` | inverse link |
| Inverse Gaussian | `1/μ²` | inverse squared |

**Canonical link** = `g = (b')⁻¹` — souvisí s přirozenou parametrizací exponenciální rodiny. Jeho použití má matematické výhody (jednodušší skórová funkce, identifikovatelnost).

## Standardní GLMy

### Lineární regrese — Normal + identity

`Y ∼ N(μ, σ²)`, `μ = xᵀβ`. Identický link, klasický OLS.

### Logistická regrese — Bernoulli + logit

`Y ∼ Bernoulli(p)`, `logit(p) = xᵀβ`. [[logisticka-regrese-msp]].

### Poissonova regrese — Poisson + log

`Y ∼ Po(λ)`, `log λ = xᵀβ`. Pro modelování *counts*:
* Počet hovorů za hodinu jako funkce dne v týdnu.
* Počet defektů za výrobní cyklus jako funkce parametrů procesu.
* Počet pacientů přicházejících na pohotovost.

::: math
\log E[Y \mid \mathbf{x}] = \mathbf{x}^\top \boldsymbol{\beta} \quad \Leftrightarrow \quad E[Y \mid \mathbf{x}] = e^{\mathbf{x}^\top \boldsymbol{\beta}}.
:::

Multiplicativní efekt: `e^β_j` = poměr středních hodnot při zvýšení `x_j` o 1.

### Negative Binomial regrese — overdispersion

Když Poisson selhává (rozptyl > střední hodnota), použijeme **Negative Binomial**:

::: math
\mathrm{Var}(Y) = \mu + \alpha \mu^2.
:::

`α > 0` = overdispersion parameter. Lze fit přes GLM s extrarozšířeným framework.

### Gamma regrese — Gamma + log

Pro spojitá pozitivní data (ceny, doby) s right-skewed distribucí. Modelujeme `log μ = xᵀβ` (multiplicativní efekt).

## MLE odhad pro GLM

Likelihood:

::: math
\ell(\boldsymbol{\beta}, \phi) = \sum_{i=1}^{n} \log f(Y_i; \theta_i(\boldsymbol{\beta}), \phi).
:::

Skórová funkce a Fisher information (pro canonical link):

::: math
U(\boldsymbol{\beta}) = \mathbf{X}^\top (\mathbf{Y} - \boldsymbol{\mu}), \quad J(\boldsymbol{\beta}) = \mathbf{X}^\top W \mathbf{X},
:::

kde `W = diag(∂μᵢ/∂ηᵢ · 1/Var(Yᵢ))`.

### IRLS (Iteratively Reweighted Least Squares)

```
β⁰ = 0  (nebo některý start)
opakuj:
    η = X β
    μ = g⁻¹(η)
    W = diag(weights)
    z = η + (Y − μ) · (∂η/∂μ)
    β ← (XᵀWX)⁻¹ XᵀWz
    dokud konvergence
```

Univerzální algoritmus pro všechny GLM. R `glm()` a Python `statsmodels.GLM` ho implementují.

## Deviance — analogie RSS

Pro lineární model je RSS klíčová metrika fit. Pro GLM používáme **deviance**:

::: math
D = -2 \left[ \ell(\boldsymbol{\beta}, \phi) - \ell_{sat}(\phi) \right],
:::

kde `ℓ_sat` je log-likelihood *saturovaného modelu* (každé pozorování má vlastní parameter — perfect fit).

Vlastnosti:

* `D ≥ 0`.
* Pro nested modely: `D₁ − D₂ ∼ χ²(k₂ − k₁)` (asymptoticky) — likelihood ratio test.
* Pro Normal: `D = RSS/σ²`.

### Pseudo-R² pro GLM

* **Deviance-based**: `R²_dev = 1 − D/D_null`, kde `D_null` je deviance modelu jen s interceptem.
* **McFaddenovo**: `R²_McF = 1 − ℓ_full/ℓ_null`.
* **Cox-Snellovo**: založeno na likelihood ratio.

Tyto metriky *nejsou* přímo srovnatelné s klasickým `R²` z lineární regrese.

## Diagnostika GLM

* **Deviance residuals**:
  ::: math
  d_i = \mathrm{sign}(Y_i - \hat{\mu}_i) \sqrt{d_i^*},
  :::
  kde `dᵢ*` je individuální příspěvek k deviance. Pod správným modelem ∼ `N(0, 1)`.
* **Pearson residuals**:
  ::: math
  r_i = \frac{Y_i - \hat{\mu}_i}{\sqrt{\mathrm{Var}(Y_i)}}.
  :::
* **Working residuals**, **leverage**, **influence measures** — analogie z lineární regrese.

Q-Q plot deviance residuals — analogie diagnostiky linearity, normality.

## Praktické use cases {tier=practice}

::: svg "Tři GLM pro různé typy dat: lineární (spojité symetrické), logistická (binární), Poissonova (counts)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10.5">
  <g transform="translate(20, 20)">
    <text x="80" y="-5" text-anchor="middle" fill="var(--accent)">lineární</text>
    <line x1="0" y1="140" x2="160" y2="140" stroke="var(--line-strong)"/>
    <line x1="0" y1="0" x2="0" y2="140" stroke="var(--line-strong)"/>
    <line x1="10" y1="130" x2="150" y2="20" stroke="var(--accent)" stroke-width="2"/>
    <text x="80" y="160" text-anchor="middle" fill="var(--text-muted)" font-size="9">μ = β₀ + β·x</text>
  </g>
  <g transform="translate(200, 20)">
    <text x="80" y="-5" text-anchor="middle" fill="var(--accent)">logistická</text>
    <line x1="0" y1="140" x2="160" y2="140" stroke="var(--line-strong)"/>
    <line x1="0" y1="0" x2="0" y2="140" stroke="var(--line-strong)"/>
    <path d="M 0 138 Q 60 135 80 75 Q 100 18 160 15" stroke="var(--accent)" stroke-width="2" fill="none"/>
    <text x="80" y="160" text-anchor="middle" fill="var(--text-muted)" font-size="9">π = σ(β₀ + β·x)</text>
  </g>
  <g transform="translate(380, 20)">
    <text x="80" y="-5" text-anchor="middle" fill="var(--accent)">Poissonova</text>
    <line x1="0" y1="140" x2="160" y2="140" stroke="var(--line-strong)"/>
    <line x1="0" y1="0" x2="0" y2="140" stroke="var(--line-strong)"/>
    <path d="M 0 138 Q 60 130 100 100 Q 130 60 160 15" stroke="var(--accent)" stroke-width="2" fill="none"/>
    <text x="80" y="160" text-anchor="middle" fill="var(--text-muted)" font-size="9">λ = exp(β₀ + β·x)</text>
  </g>
</svg>
:::

## Rozšíření a moderní GLM

* **Generalized Additive Models (GAM)**: `g(μ) = β₀ + f₁(x₁) + f₂(x₂) + …` — flexibilní non-lineární prediktory přes splines.
* **Mixed-effect GLMM**: GLM + random effects pro hierarchická data.
* **Zero-inflated models**: pro counts s nadbytkem nul.
* **Quasi-likelihood**: použít GLM bez specifikace plné distribuce (jen `E[Y]` a `Var(Y)`).
* **Robust GLM**: Mallows M-estimators, robust quasi-likelihood.

## GLM v moderním ML

GLM je *teoretický most* k modern ML:

* **Softmax regression** = multinomial logistic GLM.
* **Cross-entropy loss** = záporný log-likelihood Bernoulli/Multinomial.
* **Logistic loss in deep nets** = poslední vrstva = GLM.
* **Gradient boosting** s log-likelihood loss = GLM-based boosting (XGBoost s `objective='binary:logistic'`).

## Aplikace

* **Epidemiologie** — riziko onemocnění (logistic).
* **Insurance** — pojistné nároky (Gamma, Tweedie GLM).
* **Marketing** — počty kliků, churn (Poisson, logistic).
* **Manufacturing** — defect counts (Poisson).
* **Genomics** — gene expression count data (Negative Binomial).
* **Ecology** — abundance models.

::: link "Nelder, J. A., Wedderburn, R. W. M.: Generalized Linear Models (JRSS A 1972)" "https://www.jstor.org/stable/2344614"
:::

::: link "McCullagh, P., Nelder, J. A.: Generalized Linear Models (Chapman & Hall 1989, 2nd ed.)" "https://www.routledge.com/Generalized-Linear-Models/McCullagh-Nelder/p/book/9780412317606"
:::

::: link "Faraway, J.: Extending the Linear Model with R (CRC 2016, 2nd ed.)" "https://www.routledge.com/Extending-the-Linear-Model-with-R-Generalized-Linear-Mixed-Effects-and/Faraway/p/book/9781498720960"
:::

---

*Zdroj: MSP přednášky 2025/26, *Generalized Linear Models — Introduction* (Hrabec). Externí reference: Nelder, J. A., Wedderburn, R. W. M.: *Generalized Linear Models*, JRSS A 135 (1972); McCullagh, P., Nelder, J. A.: *Generalized Linear Models* (Chapman & Hall 1989, 2nd ed.); Faraway, J.: *Extending the Linear Model with R* (CRC 2016).*
