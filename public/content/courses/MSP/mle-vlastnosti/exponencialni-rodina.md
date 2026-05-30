---
title: Exponenciální rodina
---

# Exponenciální rodina

**Exponenciální rodina** je třída pravděpodobnostních rozdělení s tvarem `f(x; θ) = h(x) · exp(η(θ)ᵀ T(x) − A(θ))`. Obsahuje téměř všechna „klasická" rozdělení — normální, exponenciální, Bernoulli, Poisson, Gamma, Beta, multinomické. Společný matematický tvar dává *společné teorémy*: existenci postačujících statistik, konjugaci s Bayesovskými priors, identifikovatelnost, jednoznačnost MLE, snadné derivace momentů. To je důvod, proč velká část statistické teorie 20. století (Fisher, Neyman, Pitman, Koopman, Darmois, Lehmann) se točí kolem této rodiny.

## Obecná definice

Rodina rozdělení `{f(x; θ) : θ ∈ Θ}` patří do **exponenciální rodiny**, pokud existují funkce `h(x), T(x), η(θ), A(θ)` takové, že:

::: math
f(x; \theta) = h(x) \exp\!\left( \eta(\theta)^\top T(x) - A(\theta) \right).
:::

Komponenty:

* `T(x) = (T₁(x), …, Tₖ(x))` — **postačující statistika** (sufficient statistic).
* `η(θ) = (η₁(θ), …, ηₖ(θ))` — **přirozený parametr** (natural parameter).
* `A(θ)` — **log-partition function**; zajišťuje `∫ f dx = 1`.
* `h(x)` — *base measure*, nezávisí na `θ`.

### Kanonická forma

Pokud `η(θ) = θ` (`η` je identita), rodina je v **kanonické (natural) parametrizaci**. Tedy:

::: math
f(x; \eta) = h(x) \exp(\eta^\top T(x) - A(\eta)).
:::

Pro každou exponenciální rodinu lze najít kanonickou parametrizaci přes reparametrizaci `η = η(θ)`.

## Příklady

### Bernoulli

`X ∈ {0, 1}, P(X = 1) = θ`:

::: math
f(x; \theta) = \theta^x (1-\theta)^{1-x} = \exp\!\left( x \log\frac{\theta}{1-\theta} + \log(1-\theta) \right).
:::

* `T(x) = x`
* `η(θ) = log(θ/(1−θ))` — **logit**!
* `A(θ) = −log(1 − θ) = log(1 + e^η)`
* `h(x) = 1`

Přirozený parametr je *log-odds* — proto **logistická regrese** ([[logisticka-regrese-msp]]) modeluje právě `η = βᵀx`.

### Poisson

`X ∼ Po(λ)`, PMF `f(x; λ) = e^(−λ) λˣ / x!`:

::: math
f(x; \lambda) = \frac{1}{x!} \exp(x \log \lambda - \lambda).
:::

* `T(x) = x`, `η(λ) = log λ`, `A(λ) = λ`, `h(x) = 1/x!`.

### Normální `N(μ, σ²)`, oba parametry

::: math
f(x; \mu, \sigma^2) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp\!\left(-\frac{(x-\mu)^2}{2\sigma^2}\right).
:::

Rozepsání `(x − μ)² = x² − 2μx + μ²`:

::: math
f(x) = \frac{1}{\sqrt{2\pi}} \exp\!\left( \frac{\mu}{\sigma^2} x - \frac{1}{2\sigma^2} x^2 - \frac{\mu^2}{2\sigma^2} - \frac{1}{2}\log\sigma^2 \right).
:::

* `T(x) = (x, x²)`
* `η(μ, σ²) = (μ/σ², −1/(2σ²))`
* `A(μ, σ²) = μ²/(2σ²) + (1/2) log σ²`
* `h(x) = 1/√(2π)`

Dvourozměrná postačující statistika `(Σ Xᵢ, Σ Xᵢ²)` — odpovídá tomu, že potřebujeme dva momenty pro identifikaci `(μ, σ²)`.

### Gamma `Γ(k, θ)`

::: math
f(x; k, \theta) = \frac{1}{\Gamma(k)\theta^k} x^{k-1} e^{-x/\theta}.
:::

Po reparametrizaci `(k, θ) ↦ (η₁, η₂) = (k − 1, −1/θ)`:

* `T(x) = (log x, x)`
* `η = (k − 1, −1/θ)`

### Beta, Multinomial, Exp, Chi-squared, Wishart, Dirichlet

Všechny v exponenciální rodině. Důsledek: `Bayesian` analýza s konjugovaným priorem dá analyticky uzavřené posteriory.

## Vlastnosti exponenciální rodiny

### 1. Postačující statistika je nízkodimenzionální

Pro vzorek `X₁, …, Xₙ` i.i.d. z exponenciální rodiny je `T(X) = Σ T(Xᵢ)` *společně postačující* — *stejné dimenze* jako parametr.

### 2. Konjugované priory existují

Pro každou exponenciální rodinu existuje *přirozený* konjugovaný prior:

::: math
\pi(\theta \mid \alpha, \beta) \propto \exp(\alpha^\top \eta(\theta) - \beta \cdot A(\theta)).
:::

Pak posterior je opět ve stejné formě s aktualizovanými parametry `(α + Σ T(Xᵢ), β + n)`. Aplikace: [[bayesovsky-odhad|Bayesovský odhad]].

### 3. Momenty z log-partition function

::: math
E[T(X)] = \frac{\partial A}{\partial \eta}, \quad \mathrm{Var}(T(X)) = \frac{\partial^2 A}{\partial \eta^2}.
:::

Tedy *log-partition function* `A(η)` generuje všechny *momenty* postačující statistiky. Tato vlastnost dělá z `A` *moment generating function* v převlečené formě.

### 4. MLE má jednoznačné řešení

Log-likelihood pro `n` pozorování:

::: math
\ell(\eta) = \sum_{i=1}^{n} \log h(X_i) + \eta^\top \sum T(X_i) - n A(\eta).
:::

Derivace podle `η`:

::: math
\frac{\partial \ell}{\partial \eta} = \sum T(X_i) - n \frac{\partial A}{\partial \eta} = \sum T(X_i) - n E[T(X)].
:::

Položení = 0 dává:

::: math
\frac{1}{n} \sum T(X_i) = E[T(X)] = \mu_T.
:::

Tedy MLE *ztotožňuje empirický průměr postačujících statistik s teoretickým*. To je [[metoda-momentu|metoda momentů]] — *MLE = MoM* na exponenciálních rodinách (pro postačující statistiky `T`).

Navíc `A(η)` je **striktně konvexní** ⇒ likelihood má jediné maximum.

### 5. Fisherova informace

::: math
J(\eta) = \frac{\partial^2 A}{\partial \eta \partial \eta^\top} = \mathrm{Var}(T(X)).
:::

Snadný výpočet asymptotické variance MLE.

## Generalized linear models (GLM)

GLM ([[glm-intro]]) zobecňuje lineární regresi a logistickou regresi tak, že `Y | x` má rozdělení z exponenciální rodiny s *přirozeným parametrem* závislým lineárně na `x`:

::: math
\eta(\theta) = \mathbf{x}^\top \boldsymbol{\beta}.
:::

* **Linear regression** — Normal, `η = μ`, *identity link*.
* **Logistic regression** — Bernoulli, `η = logit(p)`, *logit link*.
* **Poisson regression** — Poisson, `η = log λ`, *log link*.

Společný framework — IRLS algoritmus pro MLE, R/Python `glm()` funkce, deviance jako goodness-of-fit.

## Rozdělení mimo exponenciální rodinu

Některá běžná rozdělení *nejsou* v exponenciální rodině:

* `U(0, θ)` — support závisí na `θ`.
* **Cauchy** — heavy tails, nemá MGF.
* **Mixture distributions** — `0,5 N(0, 1) + 0,5 N(5, 1)` není v EF.
* **Student t** — výsledek z Gamma a Normal, není v EF (kromě limity `df → ∞`, kdy → Normal).

Pro tyto rodiny většina hezkých vět neplatí — MLE může mít více lokálních maxim, neexistovat konjugovaný prior, postačující statistika může být celý vzorek `X`.

## Aplikace EF v moderní ML

* **Generalized linear models** — IRLS algoritmus.
* **Boltzmann machines, Markov random fields** — energy-based models = exponenciální rodina.
* **Variational autoencoders** — variational family často EF.
* **Maximum entropy models** — výsledné rozdělení je v EF (Gibbs measure).
* **Conditional random fields** — log-linear models, EF.

::: viz exponential-family-canonical "Vyberte distribuci; zobrazí se rozklad do EF kanonické formy h(x)·exp(η·T(x) − A(η))."
:::

::: link "Brown, L. D.: Fundamentals of Statistical Exponential Families (IMS 1986)" "https://projecteuclid.org/ebooks/institute-of-mathematical-statistics-lecture-notes-monograph-series/fundamentals-of-statistical-exponential-families/toc/10.1214/lnms/1215466757"
:::

::: link "Wainwright, M., Jordan, M.: Graphical Models, Exponential Families, and Variational Inference (FNT 2008)" "https://people.eecs.berkeley.edu/~wainwrig/Papers/WaiJor08_FTML.pdf"
:::

::: link "Murphy, K. P.: Probabilistic Machine Learning, kap. 9 — Exponential families" "https://probml.github.io/pml-book/book1.html"
:::

---

*Zdroj: MSP přednášky 2025/26, *MLE properties — Exponential Family* (Hrabec). Externí reference: Casella, G., Berger, R.: *Statistical Inference* (Cengage 2002), kap. 3.4; Brown, L. D.: *Fundamentals of Statistical Exponential Families* (IMS 1986); Murphy, K. P.: *Probabilistic Machine Learning* (MIT Press 2022), kap. 9.*
