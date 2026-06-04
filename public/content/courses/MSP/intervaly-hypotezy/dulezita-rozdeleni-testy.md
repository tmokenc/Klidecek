---
title: Důležitá rozdělení pro testy
---

# Důležitá rozdělení pro testy

Klíčová rozdělení pro statistické testy a CI jsou *odvozené* od normálního rozdělení: **chi-kvadrát**, **Studentovo `t`** a **Fisherovo `F`**. Vznikají jako transformace normálních NV a poskytují přesné distribuce testových statistik pro normálně rozdělená data. Aproximačně (díky CLT) se používají i mimo normální rozdělení pro velké vzorky.

## Chi-kvadrát rozdělení `χ²(n)`

**Definice:** Pokud `Z₁, …, Zₙ ∼ N(0, 1)` i.i.d., pak:

::: math
\chi^2 = \sum_{i=1}^{n} Z_i^2 \sim \chi^2(n).
:::

`n` se nazývá *počet stupňů volnosti* (degrees of freedom, df).

### Vlastnosti

* `E[χ²(n)] = n`, `Var(χ²(n)) = 2n`.
* `χ²(n) = Γ(n/2, 2)` (Gamma s shape `n/2`, scale `2`).
* **Aditivita**: pokud `X ∼ χ²(m)` a `Y ∼ χ²(n)` jsou nezávislé, pak `X + Y ∼ χ²(m + n)`.
* Pro `n → ∞`: `(χ²(n) − n)/√(2n) → N(0, 1)` (CLT).

### Aplikace

* **Test rozptylu**: `(n − 1)S²/σ² ∼ χ²(n − 1)`.
* **Test nezávislosti** (chi-square test of independence) — `Σ (O − E)²/E ∼ χ²(df)`.
* **Goodness of fit** ([[goodness-of-fit]]) — porovnání empirické vs. teoretické distribuce.
* **Likelihood ratio test** ([[likelihood-ratio]]) — `−2 log Λ → χ²(k)`.

::: svg "Hustota χ²(n) pro n = 1, 5, 10. S rostoucím n se distribuce posunuje vpravo a stává symetrickou (CLT)."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <line x1="40" y1="150" x2="500" y2="150" stroke="var(--line-strong)"/>
    <line x1="40" y1="20" x2="40" y2="150" stroke="var(--line-strong)"/>
    <text x="40" y="165" text-anchor="middle" fill="var(--text-muted)">0</text>
    <text x="160" y="165" text-anchor="middle" fill="var(--text-muted)">5</text>
    <text x="280" y="165" text-anchor="middle" fill="var(--text-muted)">10</text>
    <text x="400" y="165" text-anchor="middle" fill="var(--text-muted)">15</text>
    <path d="M 40 30 Q 60 100 100 130 Q 150 145 250 148 Q 400 148 500 149" stroke="var(--accent)" stroke-width="2" fill="none"/>
    <text x="60" y="48" fill="var(--accent)">n=1</text>
    <path d="M 40 150 Q 80 100 130 60 Q 180 85 250 120 Q 350 145 500 149" stroke="var(--accent-line)" stroke-width="2" fill="none"/>
    <text x="135" y="50" fill="var(--accent-line)">n=5</text>
    <path d="M 40 150 Q 150 145 230 80 Q 280 60 320 75 Q 400 130 500 148" stroke="var(--text-muted)" stroke-width="2" fill="none"/>
    <text x="270" y="55" fill="var(--text-muted)">n=10</text>
  </g>
</svg>
:::

## Studentovo `t` rozdělení `t(n)`

**Definice:** Pokud `Z ∼ N(0, 1)` a `V ∼ χ²(n)` jsou nezávislé, pak:

::: math
T = \frac{Z}{\sqrt{V / n}} \sim t(n).
:::

### Vlastnosti

* Symetrické kolem 0.
* `E[t(n)] = 0` pro `n > 1`, jinak nedefinováno.
* `Var(t(n)) = n/(n − 2)` pro `n > 2`, jinak nekonečné.
* **Heavy tails**: `t(n)` má těžší ocasy než `N(0, 1)`; pro `n = 1` je `t(1) = Cauchy` (bez střední hodnoty a rozptylu).
* Pro `n → ∞`: `t(n) → N(0, 1)`.

### Proč Studentovo „t"

V `t`-testu (viz [[t-test]]) statistika `T = (X̄ − μ)/(S/√n)` má rozdělení `t(n − 1)`. Důvod: `(X̄ − μ)/(σ/√n) ∼ N(0, 1)`, a `(n − 1)S²/σ² ∼ χ²(n − 1)`, *nezávislé* na sobě (důsledek Cochranovy věty). Dělením dostaneme:

::: math
T = \frac{(X̄ − μ)/(σ/√n)}{\sqrt{[(n-1)S²/σ²] / (n - 1)}} = \frac{X̄ − μ}{S/\sqrt{n}} \sim t(n-1).
:::

### Historie {tier=extra}

William Sealy Gosset (Guinness Brewery, 1908) publikoval pod pseudonymem „Student" — Guinness mu nedovolil publikovat pod vlastním jménem. Distribuce řeší problém *malých vzorků* při odhadu pivovarských procesů.

## Fisherovo `F` rozdělení `F(m, n)`

**Definice:** Pokud `U ∼ χ²(m)` a `V ∼ χ²(n)` jsou nezávislé, pak:

::: math
F = \frac{U / m}{V / n} \sim F(m, n).
:::

`m` je *df čítatele* (numerator df), `n` je *df jmenovatele* (denominator df).

### Vlastnosti

* `F` nabývá hodnot `[0, ∞)`, *asymetrické*.
* `E[F(m, n)] = n/(n − 2)` pro `n > 2`.
* **Reciproční vztah**: pokud `X ∼ F(m, n)`, pak `1/X ∼ F(n, m)`. Důsledek: `F_{α, m, n} = 1/F_{1−α, n, m}` (umožňuje hledat jednu tabulku místo dvou).
* Pro `m → ∞`: `m · F(m, n) → χ²(n)` (limita když čítatel jistý).

### Aplikace

* **F-test rovnosti rozptylů** — `S₁²/S₂² ∼ F(n₁ − 1, n₂ − 1)` pro dva nezávislé výběry z normálních rozdělení.
* **ANOVA** ([[one-way-anova]]) — `F = MS_between/MS_within ∼ F(k − 1, n − k)` testuje rovnost středních hodnot.
* **Submodel testing** v lineární regresi ([[f-test-submodel]]) — porovnání nested models.

## Souhrnná tabulka

::: svg "Tři rozdělení a jejich definice přes Z ∼ N(0,1) a χ² rozdělení."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g font-family="ui-monospace, monospace" font-size="10.5">
    <g fill="var(--text-muted)" text-anchor="middle">
      <text x="80" y="20" font-weight="600">distribuce</text>
      <text x="240" y="20" font-weight="600">definice</text>
      <text x="400" y="20" font-weight="600">použití</text>
    </g>
    <g fill="var(--text)">
      <text x="80" y="50" text-anchor="middle">χ²(n)</text>
      <text x="240" y="50" text-anchor="middle">ΣZᵢ², Zᵢ ∼ N(0,1)</text>
      <text x="400" y="50" text-anchor="middle">rozptyl, GoF</text>

      <text x="80" y="80" text-anchor="middle">t(n)</text>
      <text x="240" y="80" text-anchor="middle">Z / √(V/n), V ∼ χ²(n)</text>
      <text x="400" y="80" text-anchor="middle">μ s neznámým σ</text>

      <text x="80" y="110" text-anchor="middle">F(m,n)</text>
      <text x="240" y="110" text-anchor="middle">(U/m) / (V/n)</text>
      <text x="400" y="110" text-anchor="middle">rovnost rozptylů, ANOVA</text>

      <text x="80" y="140" text-anchor="middle">N(0,1)</text>
      <text x="240" y="140" text-anchor="middle">standardní</text>
      <text x="400" y="140" text-anchor="middle">μ se známým σ</text>
    </g>

    <g fill="var(--text-muted)" font-style="italic">
      <text x="60" y="180">vztahy:</text>
      <text x="60" y="196">• t(n) → N(0,1) pro n → ∞</text>
      <text x="60" y="212">• F(1, n) = t(n)²</text>
      <text x="300" y="196">• χ²(n)/n → 1 pro n → ∞ (LLN)</text>
      <text x="300" y="212">• (χ²(n) − n)/√(2n) → N(0,1)</text>
    </g>
  </g>
  <g stroke="var(--line)" stroke-width="0.7" fill="none">
    <line x1="20" y1="28" x2="510" y2="28"/>
    <line x1="20" y1="58" x2="510" y2="58"/>
    <line x1="150" y1="6" x2="150" y2="150"/>
    <line x1="330" y1="6" x2="330" y2="150"/>
  </g>
</svg>
:::

## Kvantily — co potřebujeme prakticky

V tabulkách (nebo `qchisq, qt, qf` v R, `scipy.stats` v Pythonu) najdeme:

* `z_α` — horní `α` kvantil `N(0, 1)`. `z_{0,025} = 1,96, z_{0,005} = 2,576`.
* `t_{α, n}` — horní `α` kvantil `t(n)`. `t_{0,025, 10} ≈ 2,23`, `t_{0,025, ∞} = 1,96`.
* `χ²_{α, n}` — horní `α` kvantil `χ²(n)`. `χ²_{0,025, 10} ≈ 20,48`.
* `F_{α, m, n}` — horní `α` kvantil `F(m, n)`.

### Kvantil vs. p-hodnota

* **Kvantil** `q_α` — *vrácí hodnotu*: `P(X ≥ q_α) = α`.
* **p-hodnota** — *vrácí pravděpodobnost*: `p = P(X ≥ x_obs)`.

Pro test: zamítáme `H₀` na úrovni `α` ⇔ `x_obs ≥ q_α` ⇔ `p ≤ α`.

## Robustnost vůči nenormálnosti

Klasické testy předpokládají *normalitu* dat. Co se stane, pokud data nejsou normální?

* **t-test** je *robustní* pro mírné odchylky díky CLT (`X̄` je téměř normální pro `n ≥ 30`).
* **F-test rovnosti rozptylů** je *citlivý* na nenormalitu — Bartletův test selhává při kurtózi ≠ 0; doporučuje se *Leveneův* nebo *Brown-Forsythův* test.
* **χ²-testy goodness-of-fit** jsou *asymptotické*; pro malá očekávaná čísla (< 5) jsou nepřesné, použij **Fisherův exaktní test**.

Pro extrémní odchylky od normality použij [[rank-testy|neparametrické testy]] (Wilcoxon, Mann-Whitney, Kruskal-Wallis).

::: viz chisq-t-f-gallery "Posuvníky df pro χ²(k), t(ν), F(d₁, d₂); kvantil 0.95 a vyznačení horního chvostu α=0.05."
:::

::: link "DeGroot, M., Schervish, M.: Probability and Statistics, kap. 5.7" "https://www.pearson.com/en-us/subject-catalog/p/probability-and-statistics/P200000006228"
:::

::: link "Casella, G., Berger, R.: Statistical Inference, kap. 5.4" "https://www.cengage.com/c/statistical-inference-2e-casella"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=cPeqgx8sx4Y" "SZZ: Vícevýběrové testy, testy o rozdělení" "Tomáš Kocourek"
:::

*Zdroj: MSP přednášky 2025/26, *Important Distributions for Testing* (Hrabec). Externí reference: DeGroot, M., Schervish, M.: *Probability and Statistics* (Pearson 2012), kap. 5.7; Casella, G., Berger, R.: *Statistical Inference* (Cengage 2002), kap. 5.4; Anděl, J.: *Základy matematické statistiky* (Matfyzpress 2011), kap. 3.*
