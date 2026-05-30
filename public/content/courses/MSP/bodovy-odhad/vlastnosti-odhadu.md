---
title: Vlastnosti bodových odhadů
---

# Vlastnosti bodových odhadů

Když máme více kandidátů na odhad téhož parametru (MLE, MoM, Bayes-MAP, …), potřebujeme kritéria, podle kterých je porovnat. Tato kapitola definuje tři základní vlastnosti: **nestrannost** (unbiasedness), **konzistence** (consistency) a **efektivnost** (efficiency). Spolu tvoří „dobrotu" odhadu — ne všechny jsou současně dosažitelné, takže běžná praxe je o *kompromis*.

## Bias (vychýlení) a unbiased estimator

**Bias** odhadu `θ̂` parametru `g(θ)`:

::: math
\mathrm{bias}_\theta(\hat{\theta}) = E_\theta[\hat{\theta}(X)] - g(\theta).
:::

Odhad je **nestranný** (unbiased), pokud `bias = 0` pro každé `θ ∈ Θ`:

::: math
E_\theta[\hat{\theta}(X)] = g(\theta) \quad \forall \theta \in \Theta.
:::

### Příklad — výběrový průměr je nestranný odhad `μ`

Pro i.i.d. `Xᵢ` s `E[Xᵢ] = μ`:

::: math
E[\bar{X}] = E\!\left[\frac{1}{n} \sum X_i\right] = \frac{1}{n} \sum E[X_i] = \mu.
:::

Tedy `X̄` je nestranný odhad `μ` *pro libovolné rozdělení* s konečnou střední hodnotou.

### Příklad — MLE rozptylu `N(μ, σ²)` je vychýlený

MLE: `σ̂²_MLE = (1/n) Σ (Xᵢ − X̄)²`. Spočítáme `E[σ̂²_MLE]`:

::: math
E\!\left[\sum (X_i - \bar{X})^2\right] = E\!\left[\sum X_i^2 - n \bar{X}^2\right] = n(\sigma^2 + \mu^2) - n(\sigma^2/n + \mu^2) = (n-1)\sigma^2.
:::

Tedy:

::: math
E[\hat{\sigma}^2_{MLE}] = \frac{n-1}{n} \sigma^2, \quad \mathrm{bias}(\hat{\sigma}^2_{MLE}) = -\frac{\sigma^2}{n} < 0.
:::

MLE *podceňuje* skutečný rozptyl. Korekce: výběrový rozptyl `S² = Σ(Xᵢ − X̄)²/(n−1)` je nestranný:

::: math
S^2 = \frac{1}{n-1} \sum_{i=1}^{n} (X_i - \bar{X})^2, \quad E[S^2] = \sigma^2.
:::

To je důvod, proč `S²` má v jmenovateli `n − 1` (Besselova korekce), ne `n`.

### Bias ≠ špatný odhad

Vychýlený odhad nemusí být horší. Mean squared error rozkládá chybu na bias a variance:

::: math
\mathrm{MSE}(\hat{\theta}) = E[(\hat{\theta} - \theta)^2] = \mathrm{Var}(\hat{\theta}) + \mathrm{bias}(\hat{\theta})^2.
:::

Často je výhodné mít *trochu* vychýlený odhad s *mnohem* menším rozptylem — *bias-variance tradeoff* (ridge regression, smoothed estimators, Bayes posterior mean).

::: viz biasvar "Změna parametrů — pozoruj, jak se mění bias vs. variance."
:::

::: viz bias-variance-mse "Porovnejte MSE čtyř odhadů μ (mean, medián, trim 10%/25%) při kontaminaci outliery — bias² + variance dekompozice."
:::

## Konzistence (consistency)

Odhad `θ̂_n` (jako funkce velikosti vzorku `n`) je **konzistentní**, pokud:

::: math
\hat{\theta}_n \xrightarrow{P} \theta \quad \text{pro } n \to \infty,
:::

tj. pro každé `ε > 0`: `P(|θ̂_n − θ| > ε) → 0`. Konzistence znamená, že s rostoucím vzorkem odhad konverguje k pravdě.

### Sufficient condition

Pokud:

* `lim E[θ̂_n] = θ` (asymptotická nestrannost),
* `lim Var(θ̂_n) = 0` (rozptyl mizí),

pak `θ̂_n` je konzistentní (důsledek Čebyševovy nerovnosti).

### Příklad — konzistence `X̄`

Pro i.i.d. `Xᵢ` s konečným rozptylem `σ²`:

* `E[X̄] = μ` (nestranný, *exaktně*),
* `Var(X̄) = σ²/n → 0`.

⇒ `X̄ → μ`. Toto je *slabý zákon velkých čísel*. *Silný* zákon dává `X̄ → μ` *skoro jistě* (s pravděpodobností 1).

### MoM a MLE jsou konzistentní

Za běžných podmínek (regulární model, identifikovatelnost, integrability) jsou jak MoM, tak MLE konzistentní. To je hlavní pozitivní vlastnost.

## Efektivnost (efficiency)

**Variance** dvou nestranných odhadů `θ̂₁, θ̂₂` lze porovnat. Odhad s menším rozptylem je *efektivnější*. **Relativní efektivnost**:

::: math
\mathrm{eff}(\hat{\theta}_1, \hat{\theta}_2) = \frac{\mathrm{Var}(\hat{\theta}_2)}{\mathrm{Var}(\hat{\theta}_1)}.
:::

### Cramér-Raova mez

**Cramér-Raova nerovnost** (CRLB, Cramér-Rao Lower Bound) — pro nestranný odhad `θ̂(X)` parametru `θ` v *regulárním* modelu ([[regularni-podminky]]):

::: math
\mathrm{Var}_\theta(\hat{\theta}) \ge \frac{1}{J_n(\theta)},
:::

kde `J_n(θ) = n · J(θ)` je Fisherova informace ([[fisherova-informace]]) na základě `n` pozorování. Odhad, který dosahuje rovnosti, je **efektivní**.

### Příklad — efektivnost `X̄`

Pro `N(μ, σ²)` (známé `σ²`) je Fisherova informace `J(μ) = 1/σ²`. CRLB: `Var(μ̂) ≥ σ²/n`. Výběrový průměr má `Var(X̄) = σ²/n` — dosahuje meze ⇒ **efektivní**.

## UMVUE (Uniformly Minimum-Variance Unbiased Estimator)

Pokud existuje odhad, který je *nestranný* a má *minimální rozptyl mezi všemi nestrannými odhady* pro každé `θ`, nazýváme ho **UMVUE** (jednotně minimálně-disperzní nestranný odhad).

**Rao-Blackwellova věta**: Buď `T = T(X)` libovolný nestranný odhad a `S = S(X)` postačující statistika. Pak `g(S) := E[T | S]` je *nestranný*, má `Var(g(S)) ≤ Var(T)` a závisí jen na `S`. Tedy podmiňování postačující statistikou *snižuje* rozptyl.

**Lehmann-Schefféova věta**: pokud `S` je *úplná* postačující statistika a `g(S)` je její funkce, která je nestranným odhadem `θ`, pak `g(S)` je **UMVUE**.

Tyto věty propojují [[postacujici-statistika|postačující statistiky]] s konstrukcí optimálních odhadů.

## Asymptotické vlastnosti

Pro velké `n`:

* **Asymptotická konzistence** — `θ̂_n → θ`.
* **Asymptotická normalita** — `√n (θ̂_n − θ) → N(0, V)` pro nějaké `V`.
* **Asymptotická efektivnost** — `V` se rovná `J(θ)⁻¹` (CRLB).

MLE je *asymptoticky efektivní* — `V_MLE = J(θ)⁻¹`. MoM obecně ne (`V_MoM ≥ J(θ)⁻¹`).

## Souhrn — kdy je odhad „dobrý"

Ideální:

1. Konzistentní (`n → ∞` ⇒ `θ̂ → θ`).
2. Nestranný nebo aspoň asymptoticky nestranný.
3. Efektivní nebo asymptoticky efektivní (dosažení CRLB).
4. Robustní vůči outliers a misspecification (nadrámec klasické teorie — robust statistics).

### Příklad porovnání — `N(μ, σ²)`, odhad `μ`

| Estimator | Bias | Variance | Efficient? | Robust? |
| :--- | :--- | :--- | :--- | :--- |
| `X̄` (mean) | 0 | `σ²/n` | ano | ne (sensitive to outliers) |
| `med X` (medián) | 0 | `≈ π σ²/(2n)` | ne (rel. eff. `2/π ≈ 64 %`) | ano |
| `Hodges-Lehmann` | 0 | `≈ 1,047 · σ²/n` | téměř | ano (signed ranks) |
| `trimmed mean(10 %)` | 0 (sym.) | `≈ 1,05 · σ²/n` | téměř | ano |

Pro „čistá" normální data je `X̄` nejlepší. Při outliers je *medián* nebo *trimmed mean* lepší trade-off.

::: link "DeGroot, M., Schervish, M.: Probability and Statistics, kap. 7.7" "https://www.pearson.com/en-us/subject-catalog/p/probability-and-statistics/P200000006228"
:::

::: link "Casella, G., Berger, R.: Statistical Inference, kap. 7.3" "https://www.cengage.com/c/statistical-inference-2e-casella"
:::

---

*Zdroj: MSP přednášky 2025/26, *Advanced Statistics — Properties of Estimators* (Hrabec). Externí reference: DeGroot, M., Schervish, M.: *Probability and Statistics* (4th ed., Pearson 2012), kap. 7.7–7.9; Casella, G., Berger, R.: *Statistical Inference* (Cengage 2002), kap. 7.3.1; Lehmann, E. L., Casella, G.: *Theory of Point Estimation* (Springer 1998).*
