---
title: Intervaly spolehlivosti
---

# Intervaly spolehlivosti

**Interval spolehlivosti** (confidence interval, CI) je intervalový odhad parametru — místo jednoho čísla `θ̂` udáváme *interval* `[L(X), U(X)]`, který „pokrývá" pravou hodnotu `θ` s předem zvolenou pravděpodobností (typicky 95 %). CI doplňuje bodový odhad o *kvantifikaci nejistoty* — bez ní je `θ̂_MLE = 0,237` jen číslo, s CI `[0,18, 0,29]` víme, jak přesné to číslo je.

## Definice

**Confidence interval** úrovně `1 − α` pro parametr `θ` je dvojice statistik `L(X), U(X)` (`L ≤ U`) splňující:

::: math
P_\theta(L(X) \le \theta \le U(X)) \ge 1 - \alpha \quad \forall \theta \in \Theta.
:::

Levá strana se nazývá **konfidenční koeficient** (confidence level) a obvykle se značí `1 − α ∈ {0,90, 0,95, 0,99}` (`α = 0,10, 0,05, 0,01`).

### Důležitá distinkce

CI je *náhodný* (interval závisí na vzorku `X`); `θ` je *fixní* (i když neznámé). Pravděpodobnost `1 − α` se vztahuje na *opakované vzorky*, ne na konkrétní hodnotu vzorku.

**Špatná interpretace:** „Pravděpodobnost, že `θ ∈ [L, U]` je 95 %." (Pro konkrétní vzorek je `θ` buď v intervalu, nebo není — pravděpodobnost je 0 nebo 1.)

**Správná interpretace:** „Pokud bych opakoval experiment 100×, ve zhruba 95 vzorcích by spočítaný interval obsahoval pravou hodnotu `θ`."

V *Bayesovském* pojetí ([[bayesovsky-odhad]]) se hovoří o **credible interval** — interval `[a, b]` s `P(θ ∈ [a, b] | data) = 1 − α`. Bayesovský interval *má* tu hezkou interpretaci, frekventistický ne.

## Konstrukce CI — pivotická metoda

**Pivot** je funkce `Q(X, θ)`, jejíž rozdělení *nezávisí* na `θ`. Pak:

::: math
P(q_{\alpha/2} \le Q(X, \theta) \le q_{1-\alpha/2}) = 1 - \alpha,
:::

kde `q_p` je `p`-tý kvantil rozdělení `Q`. Přerovnáním rovnosti vůči `θ` získáme `[L(X), U(X)]`.

### Příklad — `N(μ, σ²)`, `σ²` známé

Pivot:

::: math
Q(X, \mu) = \frac{\bar{X} - \mu}{\sigma / \sqrt{n}} \sim N(0, 1).
:::

(Důvod: `X̄ ∼ N(μ, σ²/n)`, takže standardizace dává `N(0, 1)`.)

`P(−z_{α/2} ≤ Q ≤ z_{α/2}) = 1 − α`, kde `z_{α/2}` je horní `α/2` kvantil `N(0, 1)`. Po přerovnání:

::: math
\bar{X} - z_{\alpha/2} \frac{\sigma}{\sqrt{n}} \le \mu \le \bar{X} + z_{\alpha/2} \frac{\sigma}{\sqrt{n}}.
:::

Tedy 95% CI pro `μ`:

::: math
CI_{0{,}95}(\mu) = \bar{X} \pm 1{,}96 \cdot \frac{\sigma}{\sqrt{n}}.
:::

`z_{0,025} = 1,96` je „magická konstanta" pro 95% CI.

::: svg "Sample distribution X̄ ∼ N(μ, σ²/n) — středních 95 % leží v ±1,96·σ/√n."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <line x1="40" y1="140" x2="500" y2="140" stroke="var(--line-strong)"/>
    <path d="M 50 138 Q 130 135 200 120 Q 270 30 340 120 Q 410 135 490 138" stroke="var(--accent-line)" stroke-width="2" fill="none"/>
    <path d="M 170 130 Q 270 30 370 130 Z" fill="var(--accent)" fill-opacity="0.18"/>
    <line x1="270" y1="30" x2="270" y2="155" stroke="var(--accent)" stroke-dasharray="3 3"/>
    <text x="270" y="170" text-anchor="middle" fill="var(--accent)">μ</text>
    <line x1="170" y1="135" x2="170" y2="155" stroke="var(--text-muted)"/>
    <text x="170" y="170" text-anchor="middle" fill="var(--text-muted)">μ−1,96σ/√n</text>
    <line x1="370" y1="135" x2="370" y2="155" stroke="var(--text-muted)"/>
    <text x="370" y="170" text-anchor="middle" fill="var(--text-muted)">μ+1,96σ/√n</text>
    <text x="270" y="80" text-anchor="middle" fill="var(--accent)" font-weight="600">95 %</text>
  </g>
</svg>
:::

### `σ²` neznámé — Studentovo `t`

Pokud `σ²` neznáme, použijeme *výběrový rozptyl* `S² = Σ(Xᵢ − X̄)²/(n − 1)`:

::: math
T = \frac{\bar{X} - \mu}{S / \sqrt{n}} \sim t(n - 1).
:::

(Studentovo `t` rozdělení s `n − 1` stupni volnosti.) CI:

::: math
\bar{X} \pm t_{\alpha/2, n-1} \cdot \frac{S}{\sqrt{n}}.
:::

Pro `n` velké `t_{α/2, n−1} → z_{α/2}` (Studentovo `t` konverguje k `N(0,1)`). Pro `n` malé (< 30) je `t` rozdělení *širší* než normální — kompenzuje, že `S²` má vlastní rozptyl.

## CI pro rozptyl normálního rozdělení

::: math
\frac{(n-1) S^2}{\sigma^2} \sim \chi^2(n-1).
:::

Pivot. CI pro `σ²`:

::: math
\left[ \frac{(n-1)S^2}{\chi^2_{1-\alpha/2, n-1}}, \frac{(n-1)S^2}{\chi^2_{\alpha/2, n-1}} \right].
:::

(Pozor: kvantily jsou „překřížené" kvůli inverzi.)

## CI pro proporci — Wald, Wilson, Clopper-Pearson

Pro `Xᵢ ∼ Bernoulli(p)`, `n` velké, `k = Σ Xᵢ`:

### Wald CI

::: math
\hat{p} \pm z_{\alpha/2} \sqrt{\frac{\hat{p}(1 - \hat{p})}{n}}.
:::

Nejjednodušší, ale špatně pro malá `n` nebo extrémní `p̂` (může vyjít mimo `[0,1]`).

### Wilson CI

::: math
\frac{\hat{p} + z^2/(2n) \pm z\sqrt{\hat{p}(1-\hat{p})/n + z^2/(4n^2)}}{1 + z^2/n}.
:::

Lepší pokrytí pro malá `n`. Doporučení Brown-Cai-DasGupta 2001.

### Clopper-Pearson

Použij Beta kvantily (exaktní, ale konzervativní):

::: math
[B_{\alpha/2}(k, n-k+1), B_{1-\alpha/2}(k+1, n-k)].
:::

### Doporučení

* `n p̂ ≥ 5` a `n(1 − p̂) ≥ 5` ⇒ Wald je OK.
* Jinak Wilson nebo Clopper-Pearson.

## Asymptotické CI z MLE

Z [[fisherova-informace|asymptotické normality]] MLE:

::: math
\sqrt{n}(\hat{\theta}_{MLE} - \theta) \approx N(0, J(\theta)^{-1}).
:::

Plug-in CI (Wald):

::: math
\hat{\theta}_{MLE} \pm z_{\alpha/2} \sqrt{\frac{1}{n \cdot \hat{J}(\hat{\theta})}}.
:::

Alternativa: [[likelihood-ratio|likelihood ratio]] CI — invertuje LR test, často přesnější.

## Šířka CI a velikost vzorku

Šířka CI: `2 z_{α/2} σ/√n`. Pro snížení šířky na polovinu potřebujeme *čtyřnásobný vzorek*. Toto je **odmocninový zákon** (n ↦ √n) — důvod, proč jsou *velké studie drahé*.

**Plánování experimentu**: pro požadovanou šířku `w` a úroveň `α`:

::: math
n \ge \left( \frac{2 z_{\alpha/2} \sigma}{w} \right)^2.
:::

## One-sided CI

Pokud zajímá jen jedna strana (např. spolehlivostní mez `μ ≥ ?`):

::: math
\mu \ge \bar{X} - z_{\alpha} \frac{\sigma}{\sqrt{n}}, \quad \text{s pravděpodobností } 1 - \alpha.
:::

Pozor: `z_α`, ne `z_{α/2}` — celá `α` je „jednostranná".

## CI vs. testování hypotéz

CI a *test hypotézy* `H₀: θ = θ₀` jsou *duální*: `H₀` se zamítá na úrovni `α` ⇔ `θ₀ ∉ CI_{1−α}`. Tedy CI obsahuje všechna `θ₀`, pro která bychom `H₀` nezamítli. Toto vidíme detailně v [[testovani-princip]].

## Bootstrap CI

Pro statistiky bez známého rozdělení (medián, IQR, sofistikované odhady) lze CI konstruovat **bootstrapem**:

```
pro b = 1, ..., B:
    X*_b = resample(X, with replacement, size n)
    θ̂*_b = T(X*_b)
spočítej CI z empirické distribuce {θ̂*_b}
```

Jednoduchá varianta — *percentile bootstrap*: CI = `[θ̂*_{α/2}, θ̂*_{1−α/2}]` empirické kvantily. Robustnější — BCa (bias-corrected and accelerated).

::: viz ci-repeated-sampling "80 CI vzorků z N(0,1); ~5% by mělo minout μ (červené). Demonstruje, že „95% pravděpodobnost" se vztahuje k *opakovaným vzorkům*."
:::

::: link "DiCiccio, T. J., Efron, B.: Bootstrap Confidence Intervals (Statistical Science 1996)" "https://projecteuclid.org/journals/statistical-science/volume-11/issue-3/Bootstrap-confidence-intervals/10.1214/ss/1032280214.full"
:::

::: link "Casella, G., Berger, R.: Statistical Inference, kap. 9" "https://www.cengage.com/c/statistical-inference-2e-casella"
:::

::: link "Brown, L., Cai, T., DasGupta, A.: Interval Estimation for a Binomial Proportion (2001)" "https://projecteuclid.org/journals/statistical-science/volume-16/issue-2/Interval-Estimation-for-a-Binomial-Proportion/10.1214/ss/1009213286.full"
:::

---

*Zdroj: MSP přednášky 2025/26, *Confidence Intervals* (Hrabec). Externí reference: DeGroot, M., Schervish, M.: *Probability and Statistics* (Pearson 2012), kap. 8; Casella, G., Berger, R.: *Statistical Inference* (Cengage 2002), kap. 9; Wasserman, L.: *All of Statistics* (Springer 2004), kap. 6.3.*
