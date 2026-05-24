---
title: Likelihood ratio test
---

# Likelihood ratio test

**Likelihood ratio test** (LRT) je obecná metoda konstrukce testů hypotéz, použitelná všude, kde umíme spočítat MLE. Místo *speciální* statistiky pro každou hypotézu (`t`, `χ²`, `F`) využije **poměr věrohodností** mezi modelem `H₀` a obecnějším modelem. Wilksova věta dává asymptotické rozdělení (`χ²`), což činí LRT prakticky univerzální. V *exponenciální rodině* a *GLM* je LRT default.

## Definice

Mějme model `{f(x; θ) : θ ∈ Θ}` a hypotézu `H₀: θ ∈ Θ₀ ⊊ Θ`.

**Likelihood ratio**:

::: math
\Lambda(x) = \frac{\sup_{\theta \in \Theta_0} L(\theta \mid x)}{\sup_{\theta \in \Theta} L(\theta \mid x)} = \frac{L(\hat{\theta}_0 \mid x)}{L(\hat{\theta} \mid x)}.
:::

Kde `θ̂₀` = MLE při omezení na `Θ₀`, `θ̂` = obecné MLE. Vždy `0 ≤ Λ ≤ 1`.

**Intuice**: pokud `H₀` dobře popisuje data, `θ̂₀ ≈ θ̂` a `Λ ≈ 1`. Pokud `H₀` špatně, `θ̂₀` je „daleko" od optimálního `θ̂` a `Λ ≈ 0`.

**Rozhodovací pravidlo:** zamítnout `H₀` ⇔ `Λ ≤ k`, kde `k` je voleno tak, aby `P_{H₀}(Λ ≤ k) = α`.

## Wilksova věta

**Věta (Wilks 1938):** Za regulárních podmínek, pokud `H₀: θ ∈ Θ₀` je *nested* v `Θ` (tj. `Θ₀` lze popsat *omezením* na `Θ`) a *dim(Θ) − dim(Θ₀) = k*, pak pod `H₀`:

::: math
-2 \log \Lambda(X) \xrightarrow{d} \chi^2(k) \text{ pro } n \to \infty.
:::

`k` je počet *nezávislých omezení* (kolik parametrů `H₀` „fixuje").

**Důsledek:** Asymptotický test:

* Spočítej `−2 log Λ`.
* Zamítni `H₀` ⇔ `−2 log Λ > χ²_{1−α, k}`.
* p-hodnota: `P(χ²(k) > −2 log Λ)`.

## Příklad — `N(μ, σ²)`, test `H₀: μ = μ₀`

Pod `H₀`: `θ̂₀ = (μ₀, σ̂²₀)`, kde `σ̂²₀ = (1/n) Σ (Xᵢ − μ₀)²`. Pod plným modelem: `θ̂ = (X̄, σ̂²) = (X̄, (1/n) Σ (Xᵢ − X̄)²)`.

Likelihood:

::: math
L(\mu, \sigma^2) = (2\pi\sigma^2)^{-n/2} \exp\!\left(-\frac{1}{2\sigma^2} \sum (X_i - \mu)^2\right).
:::

Po vyhodnocení v `θ̂₀` resp. `θ̂`:

::: math
\Lambda = \left( \frac{\hat{\sigma}^2}{\hat{\sigma}^2_0} \right)^{n/2} = \left( \frac{\sum (X_i - \bar{X})^2}{\sum (X_i - \mu_0)^2} \right)^{n/2}.
:::

Lze ukázat, že:

::: math
-2 \log \Lambda = n \log\!\left(1 + \frac{T^2}{n-1}\right),
:::

kde `T = (X̄ − μ₀)/(S/√n)` je `t`-statistika. Pro velké `n`: `−2 log Λ ≈ T²`, což je `χ²(1)` pod `H₀`. *LRT je asymptoticky ekvivalentní `t²`-testu*.

## Příklad — logistická regrese

V logistické regresi `P(Y = 1 | x) = σ(βᵀx)` chceme testovat `H₀: β_j = 0` (proměnná `j` nemá vliv).

* Plný model: MLE `β̂`, log-likelihood `ℓ(β̂)`.
* Restriktovaný: MLE `β̂₀` při `β_j = 0`, log-likelihood `ℓ(β̂₀)`.
* LR statistika: `−2(ℓ(β̂₀) − ℓ(β̂))`.
* Pod `H₀`: ∼ `χ²(1)` (jedno omezení).

Tento *individuální* test je v GLM softwaru standard (R `drop1`, Python `statsmodels`).

## Wald test, score test — alternativy

Tři velké třídy testů:

| Test | Idea | Statistika |
| :--- | :--- | :--- |
| **Likelihood ratio** (LR) | hodnotí `−2 log Λ` | `−2(ℓ(θ̂₀) − ℓ(θ̂))` |
| **Wald** | hodnotí vzdálenost `θ̂` od `θ₀` | `(θ̂ − θ₀)² · J_n(θ̂)` |
| **Score (Rao)** | hodnotí strmost likelihood v `θ₀` | `U(θ₀)² / J_n(θ₀)` |

Všechny asymptoticky ∼ `χ²(k)` pod `H₀`.

**Trade-offs:**

* LR: nejlepší small-sample vlastnosti, ale vyžaduje MLE *pod* `H₀` i *plné*.
* Wald: nejlevnější (jen plné MLE), ale citlivý na *reparametrizaci*.
* Score: vyžaduje jen MLE *pod* `H₀` (užitečné, když plné MLE je drahé).

::: svg "Tři testy: LR měří 'hloubku', Wald měří 'šířku', Score měří 'strmost' likelihood."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <line x1="40" y1="160" x2="500" y2="160" stroke="var(--line-strong)"/>
    <line x1="40" y1="20" x2="40" y2="160" stroke="var(--line-strong)"/>
    <path d="M 60 158 Q 130 155 200 100 Q 290 30 380 100 Q 440 155 490 158" stroke="var(--accent)" stroke-width="2" fill="none"/>
    <circle cx="290" cy="30" r="3" fill="var(--accent)"/>
    <text x="290" y="20" text-anchor="middle" fill="var(--accent)">ℓ(θ̂)</text>

    <line x1="200" y1="100" x2="200" y2="160" stroke="var(--accent-line)" stroke-dasharray="3 3"/>
    <text x="200" y="175" text-anchor="middle" fill="var(--accent-line)">θ₀</text>
    <circle cx="200" cy="100" r="3" fill="var(--accent-line)"/>
    <text x="170" y="95" text-anchor="end" fill="var(--accent-line)">ℓ(θ̂₀)</text>

    <line x1="200" y1="100" x2="290" y2="30" stroke="var(--text-muted)" stroke-dasharray="2 2"/>
    <text x="350" y="60" fill="var(--text-muted)" font-size="10">LR: −2 · (ℓ(θ̂₀) − ℓ(θ̂))</text>

    <line x1="200" y1="160" x2="290" y2="160" stroke="var(--text-muted)" stroke-dasharray="4 2"/>
    <text x="245" y="180" text-anchor="middle" fill="var(--text-muted)" font-size="10">Wald: θ̂ − θ₀</text>

    <line x1="178" y1="115" x2="220" y2="85" stroke="var(--text)" stroke-width="2"/>
    <text x="155" y="120" fill="var(--text)" font-size="10">Score: U(θ₀)</text>
  </g>
</svg>
:::

## Generalized LRT — neasymptotický případ

Pro malé vzorky se `−2 log Λ` *nemusí* přesně řídit `χ²`. Lze použít:

* **Permutační test** — empirické rozdělení `Λ` při náhodných permutacích dat. Přesné, ale výpočetně náročné.
* **Bootstrap** — vzorkováním získat distribuci `Λ`.
* **Bartlettova korekce** — analytické zlepšení `−2 log Λ ≈ χ²(k)` přes faktor `(1 + c/n)`.

## Wilksova věta — důkaz (skica)

Taylor expanze `ℓ(θ)` okolo `θ̂`:

::: math
\ell(\theta) \approx \ell(\hat{\theta}) + \frac{1}{2}(\theta - \hat{\theta})^\top \ell''(\hat{\theta})(\theta - \hat{\theta}).
:::

Aplikací v `θ̂₀`:

::: math
-2(\ell(\hat{\theta}_0) - \ell(\hat{\theta})) \approx (\hat{\theta} - \hat{\theta}_0)^\top \cdot [-\ell''(\hat{\theta})] \cdot (\hat{\theta} - \hat{\theta}_0).
:::

`−ℓ''(θ̂) = n J(θ̂)` (observed information). `(θ̂ − θ̂₀)` má za `H₀` asymptoticky normální distribuci s kovarianční maticí inverzní `n J(θ)`. Kvadratická forma normálních veličin je `χ²` s df = počet *omezení*. □

## Aplikace LRT

* **GLM modely** — testování zařazení / vyloučení proměnných (ANOVA tables v R `anova(model1, model2)`).
* **Mixed models** — testování random effects (s warning: na hranici parametrického prostoru je distribuce smíšenina `χ²`).
* **Hidden Markov Models** — porovnání modelů s různým počtem stavů.
* **Mixture models** — počet komponent (Bayesian alternativy lepší).
* **Survival analysis** — Cox model, testy proporcionality.

## Modelová selekce přes LR

LRT se používá pro porovnání **nested models**. Pro **non-nested** modely (např. Normal vs. Gamma pro stejná data) se používají *information criteria*:

* **AIC**: `−2 ℓ(θ̂) + 2k` — Akaike information criterion. Penalizuje komplexitu.
* **BIC**: `−2 ℓ(θ̂) + k log n` — Bayesian information criterion. Více penalizuje.
* **Cross-validation** — out-of-sample likelihood.

AIC/BIC nejsou testy (nedají p-hodnotu), ale *vybírají* nejlepší model z kandidátů.

::: viz lr-wald-score-tests "Posunujte x̄, λ₀, n; sledujte tři statistiky (LR, Wald, Score) geometricky a v tabulce s rozhodnutím."
:::

::: link "Wilks, S.: The Large-Sample Distribution of the Likelihood Ratio for Testing Composite Hypotheses (1938)" "https://projecteuclid.org/euclid.aoms/1177732360"
:::

::: link "Casella, G., Berger, R.: Statistical Inference, kap. 8.2.1" "https://www.cengage.com/c/statistical-inference-2e-casella"
:::

::: link "Lehmann, E. L., Romano, J. P.: Testing Statistical Hypotheses (Springer 2005)" "https://link.springer.com/book/10.1007/0-387-27605-X"
:::

---

*Zdroj: MSP přednášky 2025/26, *Likelihood Ratio Test* (Hrabec). Externí reference: Casella, G., Berger, R.: *Statistical Inference* (Cengage 2002), kap. 8.2.1; Wilks, S.: *The Large-Sample Distribution of the Likelihood Ratio for Testing Composite Hypotheses*, Annals of Mathematical Statistics 9 (1938); Cox, D. R., Hinkley, D. V.: *Theoretical Statistics* (Chapman & Hall 1974), kap. 9.*
