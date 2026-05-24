---
title: Regulární podmínky a MLE invariance
---

# Regulární podmínky a MLE invariance

Asymptotické vlastnosti MLE (konzistence, normalita, efektivnost) platí jen za jistých **regulárních podmínek** na rodinu rozdělení. Tyto podmínky vylučují patologické případy (rozdělení s parametrem v hraničním bodě supportu, nediferenciální PDF) a zajišťují, že likelihood má dostatečně hladké chování. Vedle nich uvádíme i **MLE invariance theorem**, který umožňuje odhadovat transformované parametry.

## Regulární podmínky

Rodina `{f(x; θ) : θ ∈ Θ}` je **regulární**, pokud splňuje:

1. **Parametrický prostor je otevřená množina**: `Θ` je neprázdný otevřený podmnožina `R^k`.
2. **Support nezávisí na `θ`**: množina `M = {x : f(x; θ) > 0}` je stejná pro všechna `θ ∈ Θ`.
3. **Existence derivace**: pro každé `x ∈ M` existuje konečná parciální derivace `f'(x; θ) = ∂f/∂θ`.
4. **Záměna pořadí derivace a integrace**: pro všechna `θ ∈ Θ`:
   ::: math
   \int_M f'(x; \theta)\, dx = 0.
   :::
   To je důsledek záměny derivace a integrálu v `∂/∂θ ∫ f dx = ∂/∂θ 1 = 0`.
5. **Fisherova informace je konečná a kladná**:
   ::: math
   J_n(\theta) = \int_M \left( \frac{f'(x; \theta)}{f(x; \theta)} \right)^2 f(x; \theta)\, dx \in (0, \infty).
   :::

Tyto podmínky zaručují platnost klíčových vět: Cramér-Rao, asymptotická normalita MLE, likelihood ratio test.

## Příklady regulárních a neregulárních modelů

### Regulární

* `N(μ, σ²)` — `Θ = R × R₊`, support `R` nezávisí na `θ`, vše hladké.
* `Exp(λ)` — `Θ = R₊`, support `[0, ∞)` nezávisí na `λ`.
* `Bi(n, p)` — `Θ = (0, 1)` *otevřený* (krajní `p ∈ {0, 1}` vylučuje degeneraci).
* `Po(λ)` — `Θ = R₊`.

### Neregulární

* `U(0, θ)` — support závisí na `θ`! Pro `x > θ` je `f(x; θ) = 0`. MLE je `θ̂ = max Xᵢ`, ale *neexistuje* derivace v hraničním bodě. Asymptotická distribuce není normální (konverguje rychleji, exponenciálně).
* `f(x; θ) = (1 + θx)/(2(1 + θ/2))` na `[0, 1]` — Fisherova informace je nulová v některých bodech.
* **Mixture modely** — nejsou identifikovatelné (`Mix(π₁, π₂)` má více reprezentací).

## MLE invariance

**Věta (Invariance MLE).** Buď `θ̂_MLE` MLE parametru `θ` a `g : Θ → Γ` libovolná měřitelná funkce. Pak:

::: math
\hat{g(\theta)}_{MLE} = g(\hat{\theta}_{MLE}).
:::

### Důkaz pro injektivní `g`

Nech `g` je injektivní. Označme `γ = g(θ)` a `θ = g⁻¹(γ)`. Likelihood jako funkce `γ`:

::: math
L^*(\gamma \mid x) = L(g^{-1}(\gamma) \mid x).
:::

Maximum `L*` nastává v `γ̂ = g(θ̂)`, protože `g` je injektivní (a tedy bijektivní na obraz).

### Pro neinjektivní `g`

Definujme *induced likelihood*:

::: math
L^*(\gamma \mid x) = \sup_{\theta : g(\theta) = \gamma} L(\theta \mid x).
:::

Pak `γ̂_MLE = g(θ̂_MLE)` opět platí, protože supremum přes „vrstvu" obsahuje `θ̂`.

### Praktický příklad

Pro `Xᵢ ∼ N(μ, σ²)` je MLE `(μ̂, σ̂²) = (X̄, (1/n)Σ(Xᵢ − X̄)²)`. MLE směrodatné odchylky:

::: math
\hat{\sigma}_{MLE} = \sqrt{\hat{\sigma}^2_{MLE}} = \sqrt{\frac{1}{n} \sum (X_i - \bar{X})^2}.
:::

MLE standardní chyby průměru `s.e. = σ/√n`:

::: math
\widehat{s.e.}_{MLE} = \frac{\hat{\sigma}_{MLE}}{\sqrt{n}}.
:::

Nemusíme znovu řešit likelihood pro `s.e.` — stačí transformovat MLE pro `σ`.

### Bias se zachová *jen pro lineární* `g`

**Upozornění**: MLE invariance se týká *bodového odhadu*, ne nestrannosti. Pokud `θ̂` je nestranný (`E[θ̂] = θ`), pak `g(θ̂)` *není* obecně nestranný odhad `g(θ)`. Důvod: Jensen nerovnost — pro konvexní `g`:

::: math
E[g(\hat{\theta})] \ge g(E[\hat{\theta}]) = g(\theta).
:::

Příklad: `X̄` je nestranný odhad `μ`. Ale `1/X̄` *není* nestranný odhad `1/μ` — má kladný bias (Jensen pro konvexní `1/x`). Pro Exp distribuci je `λ̂_MLE = 1/X̄` *mírně přeceňuje* `λ`.

## Kontrola regularity v praxi

Při použití standardní statistické softwarové procedury (`glm`, `lm`, `optim`) automaticky předpokládáme regularitu. Známé pasti:

* **Mixture models** — neidentifikovatelnost ⇒ posteriory mají *multimodal* rozdělení.
* **Hraniční odhady** — MLE leží *na hranici* `Θ` (např. `p̂ = 0` při `k = 0`). Standardní asymptotika selhává.
* **Neidentifikovatelné modely** — různé `θ` dávají stejnou rodinu rozdělení. Detekce: singulární Fisherova matice.
* **Boundary problems** — MLE „odplave" do nekonečna (např. `σ → 0` při degenerate dat).

Diagnostika přes likelihood-profile plots a *bootstrap* dává robustní obraz, ne pouze asymptotický.

## Asymptotická normalita — v regulárním modelu

Za regularity platí (důkaz v [[fisherova-informace]]):

::: math
\sqrt{n}\, (\hat{\theta}_{MLE} - \theta) \xrightarrow{d} N\!\left(0, J(\theta)^{-1}\right),
:::

kde `J(θ)` je Fisherova informace na *jedno pozorování*. Tedy:

::: math
\hat{\theta}_{MLE} \approx N\!\left(\theta, \frac{J(\theta)^{-1}}{n}\right) \text{ pro velké } n.
:::

Toto je *centrální výsledek* asymptotické statistiky — a explicitní formule pro `Var(θ̂_MLE) ≈ J(θ)⁻¹/n`. Pro konstrukci CI a testů viz [[intervaly-spolehlivosti]], [[testovani-princip]].

## Delta metoda

Pro asymptotiku `g(θ̂_MLE)` použij **delta metodu**:

::: math
\sqrt{n}\, (g(\hat{\theta}_{MLE}) - g(\theta)) \xrightarrow{d} N\!\left(0, g'(\theta)^2 \cdot J(\theta)^{-1}\right).
:::

To kombinuje MLE invariance s lineární aproximací `g` v okolí pravé hodnoty. Vyžaduje `g` diferencovatelné v `θ`.

## Aplikace

* **GLM** — regularita ⇒ standardní statistická inference (Wald test, LR test).
* **Survival analysis** — exponenciální rodina, regulární; censored data komplikují, ale Cox model zachovává.
* **Time series** — ARMA modely regulární po identifikovatelnosti omezení.
* **ML modely** — *deep learning* obvykle *není* regulární (mnoho lokálních maxim, neidentifikovatelnost přes permutace neuronů), takže klasická asymptotika tam neplatí.

::: link "Lehmann, E. L., Casella, G.: Theory of Point Estimation (Springer 1998), kap. 1.4, 6.3" "https://link.springer.com/book/10.1007/b98854"
:::

::: link "Casella, G., Berger, R.: Statistical Inference, kap. 7.2.2" "https://www.cengage.com/c/statistical-inference-2e-casella"
:::

---

*Zdroj: MSP přednášky 2025/26, *MLE properties — Regularity Conditions* (Hrabec). Externí reference: DeGroot, M., Schervish, M.: *Probability and Statistics* (Pearson 2012), kap. 7.5.6; Cox, D. R., Hinkley, D. V.: *Theoretical Statistics* (Chapman & Hall 1974), kap. 9; Lehmann, E. L., Casella, G.: *Theory of Point Estimation* (Springer 1998).*
