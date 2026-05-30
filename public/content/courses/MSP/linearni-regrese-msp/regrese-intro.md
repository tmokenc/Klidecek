---
title: Lineární regrese — úvod
---

# Lineární regrese — úvod

**Lineární regrese** je nejzákladnější a nejpoužívanější statistická technika pro modelování vztahu mezi *spojitou* veličinou `Y` a jedním nebo více *prediktory* `x`. Z formálního pohledu je to *lineární model* ([[linearni-model]]) v plné kráse: explicitní formule pro odhad parametrů, jednoduchou interpretaci, ověřitelné předpoklady, statistickou inferenci. Pro pochopení `lm()` v R, `OLS` v Pythonu, nebo `glm` v jakékoli ML knihovně musíme vědět, co regrese *opravdu* dělá.

## Model

Pro jeden prediktor:

::: math
Y = \beta_0 + \beta_1 x + \varepsilon, \quad \varepsilon \sim N(0, \sigma^2).
:::

Pro `n` pozorování `(x₁, Y₁), …, (xₙ, Yₙ)`:

::: math
Y_i = \beta_0 + \beta_1 x_i + \varepsilon_i, \quad i = 1, \dots, n.
:::

**Předpoklady**:

* `E[ε_i] = 0` — žádná systematická chyba.
* `Var(ε_i) = σ²` — *homoskedasticita*.
* `Cov(ε_i, ε_j) = 0` pro `i ≠ j` — nezávislost.
* `ε_i ∼ N` — *normalita* (pro inference, ne pro odhad).

`x` je nenáhodný (fixed); `Y` je náhodný (závisí na `ε`).

## Vícenásobná regrese

Pro `p` prediktorů `x₁, …, x_p`:

::: math
Y_i = \beta_0 + \beta_1 x_{i1} + \beta_2 x_{i2} + \dots + \beta_p x_{ip} + \varepsilon_i.
:::

V *maticovém zápisu*:

::: math
\mathbf{Y} = \mathbf{X} \boldsymbol{\beta} + \boldsymbol{\varepsilon},
:::

kde `X ∈ R^{n × (p+1)}` s prvním sloupcem `1` (pro intercept), `β = (β₀, β₁, …, β_p)ᵀ`.

## OLS odhad

Z [[linearni-model]] víme:

::: math
\hat{\boldsymbol{\beta}} = (\mathbf{X}^\top \mathbf{X})^{-1} \mathbf{X}^\top \mathbf{Y}.
:::

Pro jednoduchou regresi (jediný `x`):

::: math
\hat{\beta}_1 = \frac{\sum (x_i - \bar{x})(Y_i - \bar{Y})}{\sum (x_i - \bar{x})^2} = \frac{S_{xY}}{S_{xx}}, \quad \hat{\beta}_0 = \bar{Y} - \hat{\beta}_1 \bar{x}.
:::

Tedy `β̂₁` je *kovariance děleno rozptyl prediktoru*; `β̂₀` zajistí, že regresní přímka prochází bodem `(x̄, Ȳ)`.

## Interpretace koeficientů

* `β₀` — *intercept*. Hodnota `Y` při `x = 0`. Pozor: pokud `x = 0` je *mimo* range dat (extrapolace), intercept *nemá fyzikální interpretaci*.
* `β_j` — *slope* (sklon). Změna `E[Y]` při zvýšení `x_j` o 1 jednotku, *za předpokladu fixovaných ostatních prediktorů*. Klíčová slova: „at all else held constant" = *ceteris paribus*.

### Multikolinearita zatemňuje interpretaci

Pokud jsou prediktory korelované, *individuální* koeficienty mohou být *protisměrné* nebo *nestabilní*, ačkoli společný model dobře fituje data. Více v [[diagnostika-rezidui]].

## Predikce a residuály

* **Předpovědi**: `Ŷᵢ = β̂₀ + β̂₁ xᵢ` (resp. maticový tvar `Ŷ = X β̂`).
* **Rezidua**: `ε̂ᵢ = Yᵢ − Ŷᵢ`.
* **Sum of squared residuals (RSS)**: `RSS = Σ ε̂ᵢ²`.
* **Reziduální rozptyl**: `S²_{res} = RSS/(n − p − 1)`. *Nestranný* odhad `σ²`.

## Inference o parametrech

`β̂` je *náhodná veličina*. Za normality `ε ∼ N(0, σ²I)`:

::: math
\hat{\boldsymbol{\beta}} \sim N\!\left(\boldsymbol{\beta}, \sigma^2 (\mathbf{X}^\top \mathbf{X})^{-1}\right).
:::

Standardní chyby (SE):

::: math
s.e.(\hat{\beta}_j) = S_{res} \sqrt{\left[ (\mathbf{X}^\top \mathbf{X})^{-1} \right]_{jj}}.
:::

### t-test pro individuální koeficient

::: math
T_j = \frac{\hat{\beta}_j - \beta_{j,0}}{s.e.(\hat{\beta}_j)} \sim t(n - p - 1).
:::

Pro `H₀: β_j = 0`: zamítnout ⇔ `|T_j| > t_{α/2, n−p−1}`. *Default* hypotéza v `summary(lm)`.

### CI pro `β_j`

::: math
\hat{\beta}_j \pm t_{\alpha/2, n-p-1} \cdot s.e.(\hat{\beta}_j).
:::

### Společný test všech prediktorů (F-test)

`H₀: β₁ = β₂ = … = β_p = 0` (žádný prediktor nemá efekt). F-statistika srovnává plný model s pouhým interceptem ([[f-test-submodel]]):

::: math
F = \frac{(SST - RSS) / p}{RSS / (n - p - 1)} \sim F(p, n - p - 1) \text{ pod } H_0.
:::

## Geometrická interpretace

OLS je *ortogonální projekce* `Y` na sloupcový prostor `X`. Rezidua `ε̂` jsou *kolmá* na všechny prediktory:

::: math
\mathbf{X}^\top \hat{\boldsymbol{\varepsilon}} = \mathbf{0}.
:::

Důsledky:

* Suma reziduí (pokud má model intercept): `Σ ε̂ᵢ = 0`.
* Korelace `cor(xⱼ, ε̂) = 0` pro každý prediktor `j` — *nemůžeme zlepšit model přidáním lineární funkce už zahrnutých prediktorů*.

::: svg "Lineární regrese: minimalizace součtu čtverců reziduí (vertikální vzdálenosti od regresní přímky)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <line x1="40" y1="170" x2="500" y2="170" stroke="var(--line-strong)"/>
    <line x1="40" y1="20" x2="40" y2="170" stroke="var(--line-strong)"/>
    <text x="510" y="175" fill="var(--text-muted)">x</text>
    <text x="35" y="20" text-anchor="end" fill="var(--text-muted)">Y</text>
    <line x1="60" y1="155" x2="490" y2="40" stroke="var(--accent)" stroke-width="2"/>
    <text x="480" y="35" fill="var(--accent)">Ŷ = β̂₀ + β̂₁ x</text>
    <g fill="var(--accent-line)">
      <circle cx="100" cy="130" r="3"/>
      <circle cx="150" cy="120" r="3"/>
      <circle cx="200" cy="115" r="3"/>
      <circle cx="250" cy="98" r="3"/>
      <circle cx="300" cy="80" r="3"/>
      <circle cx="350" cy="78" r="3"/>
      <circle cx="400" cy="60" r="3"/>
      <circle cx="450" cy="42" r="3"/>
    </g>
    <g stroke="var(--accent-line)" stroke-dasharray="2 2" opacity="0.6">
      <line x1="100" y1="130" x2="100" y2="147"/>
      <line x1="200" y1="115" x2="200" y2="123"/>
      <line x1="300" y1="80" x2="300" y2="98"/>
      <line x1="400" y1="60" x2="400" y2="69"/>
    </g>
    <text x="290" y="178" text-anchor="middle" fill="var(--text-muted)" font-size="10">tečkované čáry = rezidua, minimalizujeme Σ ε̂ᵢ²</text>
  </g>
</svg>
:::

## Příklad — náklady na vyhřívání

```
x  (venkovní teplota °C):  -5, 0, 5, 10, 15, 20
Y  (denní spotřeba kWh):   45, 38, 30, 22, 16, 10
```

Spočítáme: `x̄ = 7,5, Ȳ = 26,83, S_xx = 437,5, S_xY = −622,5`.

`β̂₁ = −622,5/437,5 = −1,42`. `β̂₀ = 26,83 − (−1,42) · 7,5 = 37,50`.

Model: `Ŷ = 37,50 − 1,42 · x`. Interpretace: každý 1 °C nárůst teploty snižuje spotřebu o `1,42 kWh`. Při `0 °C` je spotřeba `37,50 kWh`.

## Vícenásobná regrese — interpretace v matici

Pro `Y = X β + ε` je `j`-tý koeficient `β_j` *parciální efekt* prediktoru `xⱼ` při fixovaných ostatních. Formálně:

::: math
\hat{\beta}_j = \frac{\sum (x_{ij}^{\perp})(Y_i)}{\sum (x_{ij}^{\perp})^2},
:::

kde `x_{ij}^⊥` = rezidua z regrese `xⱼ` na ostatní prediktory. Tedy: vyčistím `xⱼ` od ostatních proměnných, pak teprve regresuji.

To je *Frisch-Waugh-Lovell teorém* — proč u korelovaných prediktorů koeficienty „protnou" si.

## Standardní výstup software

`summary(lm(Y ~ x, data))` v R typicky zobrazí:

```
Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept) 37.5048     0.4787   78.35  < 2e-16 ***
x           -1.4229     0.0421  -33.78  < 2e-16 ***

Residual standard error: 0.881 on 4 degrees of freedom
Multiple R-squared:  0.9965
F-statistic: 1141 on 1 and 4 DF,  p-value: < 2.2e-16
```

Klíčové komponenty:

* **Estimate** — `β̂_j`.
* **Std. Error** — `s.e.(β̂_j)`.
* **t value** — `T_j` pro `H₀: β_j = 0`.
* **Pr(>|t|)** — p-hodnota.
* **R-squared** — viz [[kvalita-modelu]].
* **F-statistic** — společný test.

## Aplikace

* **Engineering** — kalibrace, predikce výkonu.
* **Economics** — modelování poptávky, cen.
* **Biology** — dose-response, allometrické vztahy.
* **Marketing** — efekt reklamy na prodeje.
* **Machine learning** — base-line model před komplexními algoritmy.

::: viz regression-interactive "Přetahujte body; sledujte živý β̂₀, β̂₁, R², t-test, residuální plot a Cookovu vzdálenost. Outlier dolů → vlivný bod."
:::

::: link "Faraway, J.: Linear Models with R" "https://www.routledge.com/Linear-Models-with-R/Faraway/p/book/9781439887332"
:::

::: link "Hastie, T., Tibshirani, R., Friedman, J.: Elements of Statistical Learning, kap. 3" "https://hastie.su.domains/ElemStatLearn/"
:::

::: link "Zvára, K.: Regrese (Matfyzpress 2019)" "https://www.matfyzpress.cz/cs/kniha/regrese-2-vydani.html"
:::

---

*Zdroj: MSP přednášky 2025/26, *Linear Regression — Introduction* (Hrabec). Externí reference: Zvára, K.: *Regrese* (Matfyzpress 2019, 2. vyd.); Faraway, J.: *Linear Models with R* (CRC 2014); Hastie, T., Tibshirani, R., Friedman, J.: *Elements of Statistical Learning* (Springer 2009), kap. 3.*
