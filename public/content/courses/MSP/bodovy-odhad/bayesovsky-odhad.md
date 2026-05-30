---
title: Bayesovský odhad — prior, posterior, MAP
---

# Bayesovský odhad — prior, posterior, MAP

**Bayesovský přístup** k odhadu parametrů se od frekventistického liší filozoficky: `θ` je *náhodná veličina* s **apriorním** rozdělením, ne fixní neznámá. Po pozorování dat updatujeme přes Bayesovu větu na *aposteriorní* rozdělení. Bayesovský pohled je v moderním ML hluboce zakořeněn (regularizace = prior, MAP = penalizovaná MLE, posterior sampling = MCMC, variational inference).

## Bayesian update

Pro vzorek `X = (X₁, …, Xₙ)` z rodiny `f(x; θ)`:

* **Likelihood**: `L(θ | x) = f(x₁, …, xₙ | θ) = Πᵢ f(xᵢ | θ)`.
* **Prior**: `π(θ)` — naše víra v `θ` před pozorováním.
* **Posterior**:

::: math
\pi(\theta \mid x) = \frac{L(\theta \mid x) \cdot \pi(\theta)}{p(x)} \propto L(\theta \mid x) \cdot \pi(\theta),
:::

kde `p(x) = ∫ L(θ | x) π(θ) dθ` je *evidence* (marginální likelihood — normalizační konstanta).

Bayesovský závěr je *celé* posterior rozdělení. Z něj lze odvodit:

* **Posterior mean**: `θ̂_PM = E[θ | x]` — minimalizuje očekávanou `L²` ztrátu.
* **Posterior median**: minimalizuje očekávanou `L¹` ztrátu.
* **Maximum a posteriori (MAP)**: `θ̂_MAP = arg max π(θ | x) = arg max L(θ | x) π(θ)`.
* **Credible interval**: interval s aposteriorní pravděpodobností `1 − α`.

## MAP vs. MLE

MAP maximalizuje `L(θ | x) π(θ)`, MLE maximalizuje `L(θ | x)`. Tedy:

::: math
\hat{\theta}_{MAP} = \arg\max_\theta \left[ \ell(\theta \mid x) + \log \pi(\theta) \right].
:::

Pro **uniformní prior** `π(θ) = konst.` se MAP = MLE.

V *log-space* je MAP přesně **penalizovaná MLE** s penaltou `−log π(θ)`. To je důležité spojení s regularizací v ML:

* **L2 regularization** (`λ ||θ||²`) ⇔ Gaussovský prior `π(θ) = N(0, σ²I)`.
* **L1 regularization** (`λ ||θ||₁`) ⇔ Laplaceův prior `π(θ) = Laplace(0, b)`.
* **Sparse prior** (spike-and-slab) ⇔ exotické regularizace.

## Příklad — `Bernoulli` s `Beta` priorem

Mějme `X₁, …, Xₙ ∼ Bernoulli(θ)` a *konjugovaný* prior `θ ∼ Beta(α, β)`:

::: math
\pi(\theta) = \frac{\theta^{\alpha-1} (1-\theta)^{\beta-1}}{B(\alpha, \beta)}, \quad \theta \in (0, 1).
:::

Pozorujeme `k = Σ Xᵢ` úspěchů. Posterior:

::: math
\pi(\theta \mid x) \propto \theta^k (1-\theta)^{n-k} \cdot \theta^{\alpha-1} (1-\theta)^{\beta-1} = \theta^{k+\alpha-1} (1-\theta)^{n-k+\beta-1}.
:::

To je opět *Beta* rozdělení! Konkrétně `θ | x ∼ Beta(α + k, β + n − k)`.

* **Posterior mean**: `E[θ | x] = (α + k)/(α + β + n)` — vážený průměr prior mean `α/(α+β)` a empirické frekvence `k/n`.
* **MAP**: `θ̂_MAP = (α + k − 1)/(α + β + n − 2)`.
* **MLE**: `θ̂_MLE = k/n` (kryje se s posterior mean pro neinformativní prior `Beta(1, 1) = U(0, 1)`).

::: svg "Bayesovský update — prior Beta(2, 2) + data n=10, k=8 → posterior Beta(10, 4). Posterior je užší a posunutý vůči pravým hodnotám."
<svg viewBox="0 0 540 206" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <line x1="40" y1="170" x2="500" y2="170" stroke="var(--line-strong)"/>
    <line x1="40" y1="20" x2="40" y2="170" stroke="var(--line-strong)"/>
    <text x="40" y="185" text-anchor="middle" fill="var(--text-muted)">0</text>
    <text x="270" y="185" text-anchor="middle" fill="var(--text-muted)">0.5</text>
    <text x="500" y="185" text-anchor="middle" fill="var(--text-muted)">1</text>
    <text x="270" y="200" text-anchor="middle" fill="var(--text-muted)">θ</text>

    <path d="M 40 170 Q 90 160 150 130 Q 270 80 390 130 Q 450 160 500 170" stroke="var(--accent)" stroke-width="2" fill="none"/>
    <text x="270" y="50" text-anchor="middle" fill="var(--accent)">prior Beta(2,2)</text>

    <path d="M 40 170 Q 180 168 290 145 Q 400 90 440 30 Q 470 80 500 170" stroke="var(--accent-line)" stroke-width="2" fill="none"/>
    <text x="430" y="60" text-anchor="middle" fill="var(--accent-line)">posterior Beta(10,4)</text>

    <line x1="408" y1="30" x2="408" y2="170" stroke="var(--accent-line)" stroke-dasharray="3 3"/>
    <text x="408" y="20" text-anchor="middle" fill="var(--accent-line)" font-size="10">k/n=0.8</text>
  </g>
</svg>
:::

## Konjugované rodiny

Prior `π` je **konjugovaný** k likelihood `L`, pokud posterior `π(θ | x)` leží ve *stejné rodině* jako `π`. Konjugace zaručuje *uzavřenou formu* Bayesovské analýzy.

Klasické konjugované páry:

| Likelihood | Konjugovaný prior | Posterior |
| :--- | :--- | :--- |
| `Bernoulli(θ)` | `Beta(α, β)` | `Beta(α + k, β + n − k)` |
| `Bi(N, θ)` | `Beta(α, β)` | `Beta(α + Σx, β + Σ(N−xᵢ))` |
| `Po(λ)` | `Gamma(α, β)` | `Gamma(α + Σx, β + n)` |
| `Exp(λ)` | `Gamma(α, β)` | `Gamma(α + n, β + Σx)` |
| `N(μ, σ²)` (σ známé) | `N(μ₀, σ₀²)` | `N(...,...)` |
| `Multinomial` | `Dirichlet(α)` | `Dirichlet(α + counts)` |

> Obecně: každá [[exponencialni-rodina|exponenciální rodina]] má konjugovaný prior (a posterior ve stejné rodině).

Pro nenstandardní modely *neexistuje* uzavřená forma — používá se *MCMC* nebo *variational inference*.

## Informativní vs. neinformativní priory

* **Informativní prior** — odráží předchozí znalost (předchozí studie, expertní názor).
* **Neinformativní prior** — vyjadřuje neznalost; měla by data dominovat. Příklady:
  * **Uniformní prior** `π(θ) = konst.` — naivní volba, ale není invariantní vůči reparametrizaci.
  * **Jeffreysův prior** `π(θ) ∝ √J(θ)` — invariantní vůči reparametrizaci, *Jeffreyovo* doporučení.
  * **Reference prior** — moderní rozšíření Jeffreyse, maximalizuje vliv dat.

Improper prior (`∫ π dθ = ∞`) je přijatelný, pokud výsledný posterior je *proper*.

## Bayesovská predikce

Bayesovský přístup nemodeluje jen `θ`, ale i *budoucí* data `X_new`. **Posterior predictive distribution**:

::: math
p(x_{\text{new}} \mid x) = \int p(x_{\text{new}} \mid \theta) \cdot \pi(\theta \mid x)\, d\theta.
:::

Toto je *integrace přes nejistotu v `θ`* — kvalitnější než dosazení bodového `θ̂_MLE` (overconfidence). Aplikace v ML: ensemble learning, dropout jako Bayesovská aproximace, Gaussian processes.

## Frekventistický vs. Bayesovský pohled

| Aspekt | Frekventistický | Bayesovský |
| :--- | :--- | :--- |
| `θ` | fixní neznáma | náhodná veličina |
| Pravděpodobnost | dlouhodobá frekvence | stupeň víry |
| Odhad | `θ̂(X)` (NV) | posterior `π(θ\|x)` |
| Interval | CI: pravděpodobnost přes vzorky | credible: pravděpodobnost `θ` v něm |
| Predikce | `f(x_new; θ̂)` | integrace přes posterior |
| Komplexita | nízká | vyšší (MCMC, VI) |

V praxi se přístupy *míchají*: Bayesovští autoři používají frekventistické vlastnosti pro validaci priorů, frekventisté používají Bayesovský update v sequential analysis.

## Aplikace

* **Spam filter** — Naive Bayes klasifikátor s priors na `P(spam)`.
* **A/B testing** — Bayesovský `Beta-Bernoulli` přístup vs. klasický `t`-test.
* **Reinforcement learning** — Bayesian RL: posterior nad MDP modely.
* **Variational inference** — VAE, Bayesovské neuronové sítě.
* **Bayesian optimization** — Gaussian Process posteriors pro tuning hyperparametrů.

::: viz bayesian-update-beta "Klikejte na úspěch/neúspěch a sledujte živý update prior Beta(α,β) → posterior."
:::

::: link "Gelman, A. et al.: Bayesian Data Analysis (3rd ed., CRC 2013)" "http://www.stat.columbia.edu/~gelman/book/"
:::

::: link "Murphy, K. P.: Probabilistic Machine Learning: An Introduction (MIT 2022)" "https://probml.github.io/pml-book/book1.html"
:::

::: link "Bishop, C.: Pattern Recognition and ML, kap. 2.3, 3.3 — Bayes" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

---

*Zdroj: MSP přednášky 2025/26, *Advanced Statistics — Bayesian Estimation* (Hrabec). Externí reference: DeGroot, M., Schervish, M.: *Probability and Statistics* (4th ed., Pearson 2012), kap. 7.2; Gelman, A. et al.: *Bayesian Data Analysis* (3rd ed., CRC 2013), kap. 1–3; Murphy, K. P.: *Probabilistic Machine Learning* (MIT 2022), kap. 4.6.*
