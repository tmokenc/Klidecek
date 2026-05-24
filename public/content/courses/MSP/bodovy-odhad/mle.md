---
title: Maximum likelihood estimator (MLE)
---

# Maximum likelihood estimator (MLE)

**Maximum likelihood estimator** je nejpoužívanější metoda bodového odhadu parametrů. Vychází z Fisherova principu: parametr odhadneme tak, aby pozorovaná data byla *nejvíce věrohodná*. MLE je asymptoticky optimální (efektivní, konzistentní, asymptoticky normální) za regulárních podmínek a stojí v základu téměř všeho ostatního — od *logistické regrese* přes *Bayesovskou MAP* po *Hidden Markov Models* a *Variational Autoencoders*.

## Definice

Pro vzorek `X = (X₁, …, Xₙ)` z rodiny rozdělení `{f(x; θ) : θ ∈ Θ}`:

::: math
\hat{\theta}_{MLE}(X) = \arg\max_{\theta \in \Theta} L(\theta \mid X) = \arg\max_{\theta \in \Theta} \prod_{i=1}^{n} f(X_i \mid \theta).
:::

Ekvivalentně přes log-likelihood:

::: math
\hat{\theta}_{MLE}(X) = \arg\max_{\theta \in \Theta} \ell(\theta \mid X) = \arg\max_{\theta \in \Theta} \sum_{i=1}^{n} \log f(X_i \mid \theta).
:::

## Postup výpočtu

Pro hladké likelihood-funkce a otevřený `Θ`:

1. Napiš `L(θ)` nebo `ℓ(θ) = log L(θ)`.
2. Spočítej *skórovou funkci* `U(θ) = ∂ℓ/∂θ`.
3. Vyřeš **likelihood equation** `U(θ) = 0`.
4. Ověř, že nalezený bod je *maximum* (druhá derivace `< 0`, resp. negative definite Hessian).

Pokud `Θ` má hranici, je třeba zkontrolovat i ji.

## Příklad 1 — `Exp(λ)`

Pro `Xᵢ ∼ Exp(λ)` i.i.d., `f(x; λ) = λ e^(−λx)`, `x ≥ 0`:

::: math
\ell(\lambda) = n \log \lambda - \lambda \sum_{i=1}^{n} X_i.
:::

Derivace:

::: math
\frac{d\ell}{d\lambda} = \frac{n}{\lambda} - \sum_{i=1}^{n} X_i = 0 \quad \Longrightarrow \quad \hat{\lambda}_{MLE} = \frac{n}{\sum X_i} = \frac{1}{\bar{X}}.
:::

Tedy MLE intenzity `λ` je *převrácená hodnota výběrového průměru*. To je intuitivní — `E[X] = 1/λ` pro Exp, takže přirozený moment-based odhad `λ̂ = 1/X̄`.

## Příklad 2 — `N(μ, σ²)`, `σ²` známé

Pro `Xᵢ ∼ N(μ, σ²)` se známým `σ²`, log-likelihood:

::: math
\ell(\mu) = -\frac{n}{2} \log(2\pi\sigma^2) - \frac{1}{2\sigma^2} \sum_{i=1}^{n} (X_i - \mu)^2.
:::

Derivace podle `μ`:

::: math
\frac{d\ell}{d\mu} = \frac{1}{\sigma^2} \sum_{i=1}^{n} (X_i - \mu) = 0 \quad \Longrightarrow \quad \hat{\mu}_{MLE} = \bar{X}.
:::

MLE střední hodnoty normálního rozdělení je *výběrový průměr* — nepřekvapivě.

## Příklad 3 — `N(μ, σ²)`, oba parametry

Společný odhad `(μ, σ²)`:

::: math
\ell(\mu, \sigma^2) = -\frac{n}{2} \log(2\pi\sigma^2) - \frac{1}{2\sigma^2} \sum (X_i - \mu)^2.
:::

Z parciálních derivací:

::: math
\hat{\mu}_{MLE} = \bar{X}, \qquad \hat{\sigma}^2_{MLE} = \frac{1}{n} \sum_{i=1}^{n} (X_i - \bar{X})^2.
:::

**Pozor**: MLE rozptylu má `1/n`, ne `1/(n−1)`. Proto je `σ̂²_MLE` *vychýlený* odhad (`bias = −σ²/n`). Pro nestrannost se používá `S² = Σ (Xᵢ − X̄)²/(n−1)` — viz [[vlastnosti-odhadu]].

## Příklad 4 — Bernoulli `A(p)`

`Xᵢ ∈ {0, 1}` i.i.d. s `P(Xᵢ = 1) = p`. PMF: `f(x; p) = p^x (1−p)^{1−x}`. Log-likelihood:

::: math
\ell(p) = \sum X_i \log p + \sum (1 - X_i) \log(1 - p) = k \log p + (n - k) \log(1 - p),
:::

kde `k = Σ Xᵢ` je počet úspěchů. Derivace:

::: math
\frac{d\ell}{dp} = \frac{k}{p} - \frac{n - k}{1 - p} = 0 \quad \Longrightarrow \quad \hat{p}_{MLE} = \frac{k}{n} = \bar{X}.
:::

Frekvence úspěchů ve vzorku — *přirozený* odhad pravděpodobnosti.

## Invariance MLE

**Věta (Invariance):** Buď `ĝ(θ)` MLE parametru `g(θ)`, kde `g : Θ → Γ`. Pak:

::: math
\hat{g}_{MLE}(X) = g(\hat{\theta}_{MLE}(X)).
:::

To se snadno vidí pro injektivní `g` (substituce). Pro nejednoznačné `g` se definuje *induced likelihood* a stejná identita platí.

**Příklad:** MLE odchylky `σ` v `N(μ, σ²)` je `σ̂_MLE = √(σ̂²_MLE)`. MLE směrodatné chyby `s.e. = σ/√n` je `σ̂_MLE/√n`.

## MLE může nebýt jednoznačné nebo neexistovat

* **Více lokálních maxim** — typické pro neidentifikovatelné modely (např. mixture models). Použijeme více náhodných startů + EM algoritmus.
* **MLE na hranici** — pro `X ∼ U(0, θ)` je `θ̂_MLE = max Xᵢ` (na hranici support, derivace nulová neexistuje). Toto je extreme order statistic.
* **MLE neexistuje** — pro některé modely (např. Cauchy + outliers) je likelihood neomezené nebo nedosažitelné.

## Numerické metody

Pokud nelze řešit likelihood equation analyticky:

* **Newton-Raphson** — `θ^{k+1} = θ^k − [H(θ^k)]⁻¹ U(θ^k)`, kde `H` je Hessian. Kvadratická konvergence, ale potřebuje Hessian.
* **Fisher scoring** — místo `H` použij `−Eθ[H] = J(θ)` ([[fisherova-informace|Fisherova informace]]). Stabilnější.
* **EM algoritmus** — pro modely s latentními proměnnými (mixture, HMM). Alternuje E-step (očekávání latentních) a M-step (maximalizace).
* **L-BFGS, gradient descent** — pro vysokodimenzionální problémy (logistická regrese, deep learning).

## Vlastnosti MLE

Za *regulárních podmínek* ([[regularni-podminky]]) má MLE následující asymptotické vlastnosti:

1. **Konzistence**: `θ̂_n → θ` v pravděpodobnosti pro `n → ∞`.
2. **Asymptotická normalita**: `√n(θ̂_n − θ) → N(0, J(θ)⁻¹)` pro `n → ∞`, kde `J(θ)` je Fisherova informace.
3. **Asymptotická efektivnost**: dosahuje *Cramér-Raova dolní meze* asymptoticky — žádný jiný konzistentní odhad nemá menší asymptotický rozptyl.

Tyto vlastnosti dokážeme v [[fisherova-informace]].

## Vztah s `cross-entropy` v ML

V strojovém učení se mluví o *cross-entropy loss*, ale je to *(záporná) log-likelihood*:

::: math
L_{CE} = -\frac{1}{n} \sum_{i=1}^{n} \log p(y_i \mid x_i; \theta) = -\frac{1}{n} \ell(\theta).
:::

Trénování klasifikátoru přes cross-entropy *je* maximum likelihood estimation. To zahrnuje *softmax regression*, *logistic regression*, hluboké neuronové sítě s probabilistickým výstupem.

## Aplikace MLE

* **Logistická regrese** — `p(y = 1 | x) = σ(βᵀx)`, MLE pro `β` (numerický, Newton-Raphson nebo IRLS).
* **Hidden Markov Models** — Baum-Welch (EM-varianta MLE) pro pravděpodobnosti přechodů a emisí.
* **Mixture models** — Gaussian Mixture, K-means jsou aproximace.
* **GLM** ([[glm-intro]]) — generalized linear models, MLE přes IRLS.
* **Deep learning** — softmax + cross-entropy = MLE klasifikace.

::: viz mle-likelihood-curve "Interaktivní likelihood pro Exp/N/Bernoulli; přepínejte modely, přetahujte vzorek."
:::

::: link "DeGroot, M. H., Schervish, M. J.: Probability and Statistics, kap. 7.5–7.6" "https://www.pearson.com/en-us/subject-catalog/p/probability-and-statistics/P200000006228"
:::

::: link "Wasserman, L.: All of Statistics, kap. 9 — MLE" "https://www.stat.cmu.edu/~larry/all-of-statistics/"
:::

---

*Zdroj: MSP přednášky 2025/26, *Advanced Statistics — MLE* (Hrabec). Externí reference: DeGroot, M., Schervish, M.: *Probability and Statistics* (4th ed., Pearson 2012), kap. 7.5–7.6; Casella, G., Berger, R.: *Statistical Inference* (Cengage 2002), kap. 7.2; Cox, D. R., Hinkley, D. V.: *Theoretical Statistics* (Chapman & Hall 1974), kap. 9.*
