---
title: Fisherova informace a asymptotika MLE
---

# Fisherova informace a asymptotika MLE

**Fisherova informace** kvantifikuje, *kolik informace o parametru `θ`* obsahuje pozorování (resp. vzorek). Z ní se odvozuje **Cramér-Raova dolní mez** pro variance nestranných odhadů a *asymptotická normalita* MLE. Spolu s exponenciálními rodinami tvoří jádro moderní statistické teorie. Skvělé je, jak konkrétně se „informace" promítá do *přesnosti odhadu*.

## Definice

**Skórová funkce** (score):

::: math
U(\theta) = \frac{\partial \log f(X; \theta)}{\partial \theta} = \frac{f'(X; \theta)}{f(X; \theta)}.
:::

**Fisherova informace** (na *jedno* pozorování) pro skalární `θ`:

::: math
J(\theta) = E_\theta\!\left[ U(\theta)^2 \right] = E_\theta\!\left[ \left( \frac{\partial \log f(X; \theta)}{\partial \theta} \right)^2 \right].
:::

Za regularity ([[regularni-podminky]]) platí *alternativní formy*:

::: math
J(\theta) = \mathrm{Var}_\theta(U(\theta)) = -E_\theta\!\left[ \frac{\partial^2 \log f(X; \theta)}{\partial \theta^2} \right].
:::

(*Druhá derivace s mínusem* je často snadnější spočítat.)

### Pro vzorek `n` i.i.d. pozorování

::: math
J_n(\theta) = n \cdot J(\theta).
:::

Informace *aditivně roste* s velikostí vzorku.

### Vektorový parametr

Pro `θ = (θ₁, …, θₖ)` je `J(θ)` *matice* `k × k`:

::: math
J(\theta)_{ij} = -E_\theta\!\left[ \frac{\partial^2 \log f(X; \theta)}{\partial \theta_i \partial \theta_j} \right].
:::

Toto je *Hessian* log-likelihood, vzato v očekávání.

## Intuice — proč „informace"

`J(θ)` měří *zakřivení* log-likelihood v okolí pravé hodnoty `θ`:

* **Velké `J(θ)`** ⇔ likelihood je *ostrá*, *špičatá* — data silně omezují, kde `θ` může být. Odhad přesný.
* **Malé `J(θ)`** ⇔ likelihood je *plochá* — data nerozlišují různá `θ` dobře. Odhad nepřesný.

::: svg "Vlevo: vysoká Fisherova informace (ostré maximum). Vpravo: nízká informace (ploché maximum). Odhad θ̂ je v prvním případě přesnější."
<svg viewBox="0 0 540 206" font-family="ui-sans-serif, system-ui" font-size="11">
  <g transform="translate(20, 20)">
    <text x="120" y="-5" text-anchor="middle" fill="var(--accent)">vysoká J(θ)</text>
    <line x1="20" y1="160" x2="240" y2="160" stroke="var(--line-strong)"/>
    <line x1="20" y1="0" x2="20" y2="160" stroke="var(--line-strong)"/>
    <path d="M 20 158 Q 80 155 120 30 Q 160 155 240 158" stroke="var(--accent)" stroke-width="2" fill="none"/>
    <text x="120" y="178" text-anchor="middle" fill="var(--text-muted)">θ</text>
    <line x1="120" y1="30" x2="120" y2="160" stroke="var(--accent)" stroke-dasharray="3 3" opacity="0.5"/>
  </g>
  <g transform="translate(290, 20)">
    <text x="120" y="-5" text-anchor="middle" fill="var(--accent-line)">nízká J(θ)</text>
    <line x1="20" y1="160" x2="240" y2="160" stroke="var(--line-strong)"/>
    <line x1="20" y1="0" x2="20" y2="160" stroke="var(--line-strong)"/>
    <path d="M 20 158 Q 80 130 120 80 Q 160 130 240 158" stroke="var(--accent-line)" stroke-width="2" fill="none"/>
    <text x="120" y="178" text-anchor="middle" fill="var(--text-muted)">θ</text>
    <line x1="120" y1="80" x2="120" y2="160" stroke="var(--accent-line)" stroke-dasharray="3 3" opacity="0.5"/>
  </g>
</svg>
:::

## Příklad — `N(μ, σ²)`, `σ²` známé

`log f(x; μ) = −(1/2) log(2πσ²) − (x − μ)²/(2σ²)`. Druhá derivace:

::: math
\frac{\partial^2 \log f}{\partial \mu^2} = -\frac{1}{\sigma^2}.
:::

Fisherova informace:

::: math
J(\mu) = -E\!\left[ -\frac{1}{\sigma^2} \right] = \frac{1}{\sigma^2}.
:::

Pro vzorek: `J_n(μ) = n/σ²`. Tedy `Var(μ̂_MLE) = σ²/n`. Toto je *přesně* CRLB; MLE `X̄` je **efektivní**.

## Příklad — `Exp(λ)`

`log f(x; λ) = log λ − λx`. Druhá derivace:

::: math
\frac{\partial^2 \log f}{\partial \lambda^2} = -\frac{1}{\lambda^2}.
:::

`J(λ) = 1/λ²`. Asymptotický rozptyl MLE `λ̂_MLE = 1/X̄`:

::: math
\mathrm{Var}(\hat{\lambda}_{MLE}) \approx \frac{1}{n J(\lambda)} = \frac{\lambda^2}{n}.
:::

## Cramér-Raova dolní mez (CRLB)

**Věta (Cramér-Rao):** Pro libovolný nestranný odhad `θ̂` v regulárním modelu:

::: math
\mathrm{Var}_\theta(\hat{\theta}) \ge \frac{1}{J_n(\theta)} = \frac{1}{n \cdot J(\theta)}.
:::

Odhad dosahující rovnosti je **efektivní**.

### Vektorová varianta

Pro nestranný odhad `θ̂` parametrického vektoru:

::: math
\mathrm{Cov}_\theta(\hat{\theta}) - J_n(\theta)^{-1} \succeq 0 \text{ (positive semidefinite)}.
:::

CRLB pro každou složku: diagonální prvky `J_n(θ)⁻¹`.

### Důkaz CRLB (skica)

Pro skalární případ: spočítej `cov(θ̂, U(θ))` = 1 (přes derivaci identity `E_θ[θ̂] = θ`). Pak z Cauchy-Schwarzovy nerovnosti:

::: math
1 = \mathrm{cov}(\hat{\theta}, U)^2 \le \mathrm{Var}(\hat{\theta}) \cdot \mathrm{Var}(U) = \mathrm{Var}(\hat{\theta}) \cdot J(\theta).
:::

## Asymptotická normalita MLE

**Věta (asymptotická normalita MLE):** Za regulárních podmínek pro `n → ∞`:

::: math
\sqrt{n}\, (\hat{\theta}_{MLE} - \theta) \xrightarrow{d} N\!\left( 0, J(\theta)^{-1} \right).
:::

Tedy MLE má pro velké vzorky *přibližné* rozdělení:

::: math
\hat{\theta}_{MLE} \stackrel{\text{asy}}{\sim} N\!\left( \theta, \frac{J(\theta)^{-1}}{n} \right).
:::

### Důkaz (skica) — Taylor expanze skóre

Skóre `U_n(θ) = Σ (∂ log f(Xᵢ; θ))/∂θ`. V MLE: `U_n(θ̂) = 0`. Taylor 1. řádu okolo pravé `θ`:

::: math
0 = U_n(\hat{\theta}) \approx U_n(\theta) + U_n'(\theta) (\hat{\theta} - \theta).
:::

⇒

::: math
\sqrt{n}(\hat{\theta} - \theta) \approx -\frac{U_n(\theta) / \sqrt{n}}{U_n'(\theta)/n}.
:::

Čítatel: `U_n(θ)/√n → N(0, J(θ))` z CLT (skóre má `E = 0`, `Var = n J(θ)`).
Jmenovatel: `U_n'(θ)/n → −J(θ)` z LLN.

Spolu: `√n(θ̂ − θ) → N(0, J(θ)⁻¹)`. □

### Asymptotická efektivnost

Asymptotická variance `J(θ)⁻¹` dosahuje *Cramér-Raovy meze* — MLE je **asymptoticky efektivní**. Žádný jiný konzistentní odhad nemá asymptoticky menší rozptyl.

## Pozorovaná vs. očekávaná informace

* **Očekávaná informace** (expected/Fisher): `J(θ) = E[−∂²ℓ/∂θ²]` — počítá se *před* daty.
* **Pozorovaná informace** (observed): `Ĵ(θ̂) = −∂²ℓ(θ)/∂θ²|_{θ=θ̂}` — počítá se *z dat*.

V praxi je *observed* informace lepší aproximace skutečné variance MLE pro daný vzorek (Efron-Hinkley 1978). Standardní statistický software hlásí *standard errors* = `√(Ĵ⁻¹)`.

## Aplikace {tier=practice}

* **Standardní chyby parametrů** — `s.e.(θ̂_MLE) = √(J_n(θ̂)⁻¹)`. Reportováno např. v R `summary(lm)`.
* **CI pro MLE**: `θ̂ ± z_{α/2} · s.e.(θ̂)` (Waldův CI, [[intervaly-spolehlivosti]]).
* **Likelihood ratio test** ([[likelihood-ratio]]) — `2 · (ℓ(θ̂) − ℓ(θ₀)) → χ²(k)`, kde `k` = počet omezení.
* **Score test** (Rao test) — `U(θ₀)² / J_n(θ₀) → χ²(1)`.
* **Wald test** — `(θ̂ − θ₀)² · J_n(θ̂) → χ²(1)`.
* **Information criteria** — AIC = `−2ℓ(θ̂) + 2k`, BIC = `−2ℓ(θ̂) + k log n` pro model selection.

::: viz fisher-info-curvature "Zvyšte n nebo snižte σ; sledujte, jak se ℓ(θ) zužuje a CRLB s.e.(θ̂) = 1/√(n·J) klesá."
:::

::: link "Cox, D. R., Hinkley, D. V.: Theoretical Statistics (Chapman & Hall 1974), kap. 9.3" "https://www.routledge.com/Theoretical-Statistics/Cox-Hinkley/p/book/9780412161605"
:::

::: link "Wasserman, L.: All of Statistics, kap. 9.7 (Asymptotic Properties of the MLE)" "https://www.stat.cmu.edu/~larry/all-of-statistics/"
:::

::: link "Casella, G., Berger, R.: Statistical Inference, kap. 7.3.2 (Cramer-Rao)" "https://www.cengage.com/c/statistical-inference-2e-casella"
:::

---

*Zdroj: MSP přednášky 2025/26, *Fisher Information and Asymptotic MLE* (Hrabec). Externí reference: DeGroot, M., Schervish, M.: *Probability and Statistics* (Pearson 2012), kap. 7.6.4–7.6.5; Casella, G., Berger, R.: *Statistical Inference* (Cengage 2002), kap. 7.3; Cox, D. R., Hinkley, D. V.: *Theoretical Statistics* (Chapman & Hall 1974), kap. 9.*
