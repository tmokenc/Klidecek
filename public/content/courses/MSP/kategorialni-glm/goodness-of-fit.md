---
title: Goodness-of-fit testy
---

# Goodness-of-fit testy

**Goodness-of-fit** (GoF, „testy shody") ověřují, zda data pocházejí z hypotetického rozdělení — `Normal(μ, σ²)`, `Exp(λ)`, `Po(λ)`, uniformní, … Jsou centrální v validaci modelů (před aplikací parametrického testu, který *předpokládá* dané rozdělení) i v explorativní analýze. Existuje několik standardních přístupů: **χ² GoF**, **Kolmogorov-Smirnov**, **Anderson-Darling**, **Shapiro-Wilk**.

## χ² GoF test

Pro *diskrétní* (nebo binovaná spojitá) data. Stejná struktura jako χ² test nezávislosti, jen s *teoretickými* očekávanými počty.

### Postup

1. Rozděl výběrový prostor na `k` *kategorií* (bins).
2. Spočítej pozorované počty `Oᵢ` v každé kategorii.
3. Pod `H₀`: spočítej *očekávané* počty `Eᵢ = n · pᵢ`, kde `pᵢ = P(X ∈ kategorie i | H₀)`.
4. Spočítej:
   ::: math
   \chi^2 = \sum_{i=1}^{k} \frac{(O_i - E_i)^2}{E_i}.
   :::
5. Pod `H₀`: `χ² ∼ χ²(k − 1 − m)`, kde `m` je počet *odhadnutých* parametrů (pro test bez parametrů, jen `H₀: rozdělení = známé`, `m = 0`).

### Příklad — test férové kostky

Hodů: `n = 600`. Pozorované počty pro 1,…,6: `O = (98, 95, 110, 108, 92, 97)`. Pod `H₀`: férová kostka, `pᵢ = 1/6`, `Eᵢ = 100`.

::: math
\chi^2 = \frac{(98-100)^2}{100} + \frac{(95-100)^2}{100} + \dots = \frac{4 + 25 + 100 + 64 + 64 + 9}{100} = 2{,}66.
:::

`χ²_{0,05, 5} = 11,07`. `2,66 < 11,07` ⇒ *nezamítáme* `H₀`. Kostka se chová férově.

### Příklad — test rozdělení s odhadnutými parametry

Test, zda data jsou `Normal`. Odhadneme `μ̂ = X̄`, `σ̂² = S²` (m = 2 parametry).

* Rozděl `R` na `k` bins.
* `Eᵢ = n · (Φ((bᵢ − μ̂)/σ̂) − Φ((aᵢ − μ̂)/σ̂))`.
* `χ² ∼ χ²(k − 1 − 2) = χ²(k − 3)`.

Pro `k = 10` bins: `df = 7`.

### Omezení

* Vyžaduje `Eᵢ ≥ 5` (heuristika; alespoň pro 80 % bins). Pro malé `Eᵢ` slučujeme sousední bins.
* Volba *bins* je arbitrární — různé bins dávají různé `χ²`. Doporučení: stejně-pravděpodobnostní bins (každé `pᵢ = 1/k`).

## Kolmogorov-Smirnov (K-S) test

Pro *spojité* rozdělení. Místo binování porovnává *empirickou CDF* s *teoretickou*:

::: math
F_n(x) = \frac{1}{n} \sum_{i=1}^{n} \mathbf{1}(X_i \le x).
:::

**K-S statistika**:

::: math
D_n = \sup_x |F_n(x) - F_0(x)|.
:::

Tedy *maximální* vzdálenost mezi empirickou a teoretickou CDF.

### Asymptotická distribuce

Pod `H₀: F = F₀`:

::: math
\sqrt{n} D_n \xrightarrow{d} K,
:::

kde `K` je *Kolmogorovo* rozdělení. Kritické hodnoty jsou tabulkové.

### Výhody

* *Bezparametrické* (nezávisí na konkrétní `F₀`).
* Citlivé na *libovolnou* odchylku, ne jen ve specifickém kvantilu.

### Nevýhody

* Slabší síla pro odchylky ve *chvostech* (kde je `F` blízko 0 nebo 1).
* Když odhadujeme parametry `F₀` z dat (např. `F₀ = N(X̄, S²)`), distribuce `D_n` *se mění* — používáme **Lillieforsovu** korekci.

## Anderson-Darling (A-D) test

Vylepšení K-S — *váží* odchylky více v chvostech:

::: math
A_n^2 = n \int \frac{(F_n(x) - F_0(x))^2}{F_0(x) (1 - F_0(x))} dF_0(x).
:::

Praktický vzorec:

::: math
A_n^2 = -n - \frac{1}{n} \sum_{i=1}^{n} (2i - 1) \left[ \log F_0(X_{(i)}) + \log(1 - F_0(X_{(n+1-i)})) \right],
:::

kde `X_(i)` je `i`-tá order statistic.

A-D je *citlivější* na chvostová porušení normality než K-S. Pro normality test je standardní volba.

## Shapiro-Wilkův test

Specifický pro *normalitu*. Pro vzorek `X₁, …, Xₙ`:

::: math
W = \frac{\left( \sum_{i=1}^{n} a_i X_{(i)} \right)^2}{\sum_{i=1}^{n} (X_i - \bar{X})^2}.
:::

`aᵢ` jsou předpočítané konstanty z očekávaných hodnot order statistics `N(0, 1)`.

* `W ≤ 1`. `W = 1` přesně pro normální data.
* Pod `H₀: normalita`: distribuce `W` je tabulková (Shapiro-Wilk).

### Vlastnosti

* **Nejsilnější** test normality pro `n ≤ 50` (Royston 1992).
* Pro `n > 5000`: numerická nestabilita; použij A-D nebo Q-Q plot.
* Velmi citlivý — pro `n` velká může zamítnout i mírné odchylky bez praktického významu.

## Q-Q plot — vizuální GoF

Pro spojité distribuce: porovnej *kvantily* dat s *teoretickými* kvantily `F₀`. Pokud body leží na *přímce*, data odpovídají `F₀`.

::: svg "Q-Q plot: vlevo data dobře leží na diagonále (normalita OK); vpravo systematické odchylky (heavy-tailed data)."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g transform="translate(20, 20)">
    <text x="100" y="-5" text-anchor="middle" fill="var(--text-muted)">data OK normální</text>
    <line x1="0" y1="140" x2="200" y2="140" stroke="var(--line-strong)"/>
    <line x1="0" y1="0" x2="0" y2="140" stroke="var(--line-strong)"/>
    <line x1="10" y1="130" x2="180" y2="20" stroke="var(--text-muted)" stroke-dasharray="3 3"/>
    <g fill="var(--accent)">
      <circle cx="15" cy="128" r="2"/>
      <circle cx="35" cy="115" r="2"/>
      <circle cx="55" cy="100" r="2"/>
      <circle cx="80" cy="80" r="2"/>
      <circle cx="105" cy="60" r="2"/>
      <circle cx="130" cy="45" r="2"/>
      <circle cx="155" cy="32" r="2"/>
      <circle cx="175" cy="22" r="2"/>
    </g>
  </g>
  <g transform="translate(290, 20)">
    <text x="100" y="-5" text-anchor="middle" fill="var(--text-muted)">heavy tails</text>
    <line x1="0" y1="140" x2="200" y2="140" stroke="var(--line-strong)"/>
    <line x1="0" y1="0" x2="0" y2="140" stroke="var(--line-strong)"/>
    <line x1="10" y1="130" x2="180" y2="20" stroke="var(--text-muted)" stroke-dasharray="3 3"/>
    <g fill="var(--accent-line)">
      <circle cx="10" cy="138" r="2"/>
      <circle cx="30" cy="125" r="2"/>
      <circle cx="55" cy="105" r="2"/>
      <circle cx="80" cy="80" r="2"/>
      <circle cx="105" cy="58" r="2"/>
      <circle cx="130" cy="40" r="2"/>
      <circle cx="155" cy="20" r="2"/>
      <circle cx="180" cy="5" r="2"/>
    </g>
  </g>
</svg>
:::

Q-Q plot je *nejlepším detektorem* — interpretace odchylek dává info, *jak* se data liší (skew, kurtosis, outliers).

## Diskrétní GoF — speciální případy

### Test Bernoulli/Binomial

Pro `n` pozorování s `k` úspěchy: použij **exact binomial test** nebo z-test proporce.

### Test Poisson

`H₀: X ∼ Po(λ̂)`, kde `λ̂ = X̄` (MLE). χ² s `df = k − 1 − 1 = k − 2`. Příklad: počet automobilových nehod za hodinu na křižovatce.

### Test Exponential

`H₀: X ∼ Exp(λ̂)`, `λ̂ = 1/X̄`. Lze použít K-S nebo A-D s odhadnutými parametry (s adjustací distribuce).

## Multiple GoF tests — comparison

| Test | Spojité/diskrétní | Konkrétní rozdělení | Síla pro chvost | Citlivost |
| :--- | :---: | :---: | :---: | :--- |
| χ² | obojí (binované) | libovolné | nízká | obecná |
| K-S | spojité | libovolné `F₀` | nízká | obecná |
| Anderson-Darling | spojité | libovolné `F₀` | **vysoká** | obecná |
| Shapiro-Wilk | spojité | jen normální | vysoká | normality |
| Lillieforsova | spojité | normální s odh. par. | střední | normality |

Pro normality test: **doporučení** Shapiro-Wilk (`n ≤ 5000`), pak Q-Q plot.

## Pitfalls

* **Velký vzorek** ⇒ téměř každý test zamítne (sebemenší odchylka je „statisticky významná" ale ne *prakticky*). Doplň vizualizaci a effect size.
* **Malý vzorek** ⇒ slabá síla; *nezamítnutí* `H₀` neznamená, že data jsou opravdu normální. Použij vizualizaci + odbornou intuici.
* **GoF před parametric test**: dvoukrokový workflow je kontroverzní (Wells, Hintze 2007) — *vyhněte se* automatickému přepínání mezi parametrickým a neparametrickým testem podle GoF.

## Aplikace {tier=practice}

* **Quality control** — kontrola, zda měření vyhovují specifikaci.
* **Risk modeling** — testovat heavy-tailed alternative k normalitě (Student-t, Pareto).
* **Insurance** — testovat fit Poisson modelu na počty nároků.
* **Reliability engineering** — testovat Weibull vs. exponenciální.

::: viz qq-plot-interactive "Vyberte zdrojové rozdělení (heavy / skew / bimodal); sledujte Q-Q plot a K-S test odchylek od N(0,1)."
:::

::: link "Stephens, M. A.: EDF Statistics for Goodness of Fit and Some Comparisons (JASA 1974)" "https://www.tandfonline.com/doi/abs/10.1080/01621459.1974.10480196"
:::

::: link "D'Agostino, R., Stephens, M.: Goodness-of-Fit Techniques (Marcel Dekker 1986)" "https://www.routledge.com/Goodness-of-Fit-Techniques/DAgostino-Stephens/p/book/9780824774875"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=cPeqgx8sx4Y" "SZZ: Vícevýběrové testy, testy o rozdělení" "Tomáš Kocourek"
:::

*Zdroj: MSP přednášky 2025/26, *Goodness-of-Fit Tests* (Hrabec). Externí reference: Anděl, J.: *Základy matematické statistiky* (Matfyzpress 2011); Stephens, M. A.: *EDF Statistics for Goodness of Fit* (JASA 1974); D'Agostino, R., Stephens, M.: *Goodness-of-Fit Techniques* (Marcel Dekker 1986).*
