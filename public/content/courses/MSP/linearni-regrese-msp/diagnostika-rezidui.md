---
title: Multikolinearita a diagnostika reziduí
---

# Multikolinearita a diagnostika reziduí

Lineární regrese je *postavena na předpokladech*. Bez jejich validace jsou závěry (signifikance, CI, p-hodnoty) potenciálně neplatné. **Multikolinearita** dělá `β̂` nestabilní; **heteroskedasticita** a **autokorelace** ovlivňují standardní chyby; **nenormalita** narušuje *exaktní* inference. Diagnostika reziduí je standardní krok mezi fit a interpretation.

## Multikolinearita

**Multikolinearita** = silná (lineární) korelace mezi *prediktory*. Důsledky:

* **`(XᵀX)⁻¹` numericky nestabilní** — malé změny dat výrazně mění `β̂`.
* **Velké standardní chyby** — koeficienty jsou „rozlité" napříč korelovanými prediktory.
* **Protisměrné koeficienty** — modely najdou kompromisy, které neodpovídají fyzikální intuici.
* **Predikce zůstávají OK** — `Ŷ` je stabilní, jen *interpretace `β̂_j`* trpí.

### Detekce — Variance Inflation Factor (VIF)

Pro `j`-tý prediktor `xⱼ` definujme `R²_j` jako `R²` z regrese `xⱼ` na *ostatní* prediktory. Pak:

::: math
VIF_j = \frac{1}{1 - R^2_j}.
:::

Interpretace: `VIF_j` měří, *kolikrát* je rozptyl `β̂_j` zvýšen kvůli korelovanosti s ostatními prediktory.

Pravidla:

* `VIF > 5` — *podezřelé*.
* `VIF > 10` — *vážná* multikolinearita.
* `VIF > 100` — *téměř singulární*.

### Detekce — condition number

`cond(XᵀX)` = `λ_max / λ_min` (poměr extrémních vlastních čísel). 

* `cond > 30` — vysoká multikolinearita.
* `cond > 1000` — extrémní.

### Řešení

1. **Odstranit redundantní prediktor** — ten s nejmenším domain významem nebo nejvyšším VIF.
2. **PCA / PLS** — transformovat na ortogonální komponenty.
3. **Ridge regression** — penalizace L2 stabilizuje `(XᵀX + λI)⁻¹`.
4. **Lasso** — penalizace L1 *vybírá* prediktory (jeden ze dvou korelovaných).
5. **Centrování/standardizace** — pro polynomiální + interakční členy.

## Heteroskedasticita

**Heteroskedasticita** = nekonstantní rozptyl reziduí `Var(ε_i) ≠ σ²`. Důsledky:

* OLS *zůstává nestranný*.
* OLS *není BLUE* — efektivnější je GLS.
* **Standardní chyby jsou špatně odhadnuty** — typicky podceněny (false positives).

### Detekce

* **Residual plot vs. predicted** — pokud rezidua tvoří „trychtýř" (vějíř), heteroskedasticita.
* **Scale-location plot** — `√|standardized rᵢ|` vs. `Ŷᵢ`. Hladká nakloněná čára indikuje problém.
* **Breusch-Pagan test** — formální test. `H₀: homoskedasticita`.
* **White test** — robustnější verze Breusch-Pagan.

### Řešení

* **Robust SE** (Huber-White, sandwich) — opravuje standardní chyby, ne body odhady.
* **Weighted least squares (WLS)** — váží pozorování `wᵢ = 1/σᵢ²`.
* **Transformace** — `log Y`, `√Y` často stabilizují rozptyl.
* **GLM** — pro response s vlastní mean-variance vazbou (Poisson, Bernoulli).

## Autokorelace

**Autokorelace** = `Cov(ε_i, ε_j) ≠ 0` pro `i ≠ j`. Typické v *časových řadách* (rezidua sousedních časů korelované) nebo *prostorových datech*.

### Detekce

* **Durbin-Watson statistika**:

::: math
DW = \frac{\sum_{i=2}^{n} (\hat{\varepsilon}_i - \hat{\varepsilon}_{i-1})^2}{\sum_{i=1}^{n} \hat{\varepsilon}_i^2}.
:::

`DW ≈ 2` ⇔ žádná autokorelace. `DW < 1,5` nebo `> 2,5` indikuje problém.

* **ACF/PACF plots** — vidění periodicity rezidiuí.
* **Breusch-Godfrey LM test** — pro vícenásobné lagy.

### Řešení

* **GLS** s předpokládanou strukturou `Σ` (AR(1), AR(p)).
* **Cochrane-Orcutt procedure** — iterativně odhadne `ρ` a refittne.
* **Newey-West standard errors** — robustní vůči autokorelaci.

## Normalita reziduí

Není potřeba pro Gauss-Markovův teorém (BLUE), ale je potřeba pro:

* Exaktní t-testy, F-testy.
* Predikční intervaly.
* CI pro koeficienty.

Pro velké `n` díky CLT méně kritická (asymptoticky normální).

### Detekce

* **Q-Q plot reziduí** — body na diagonále = normalita.
* **Histogram reziduí** — symetrický, podobný zvonu.
* **Shapiro-Wilkův test** — formální (silný pro `n ≤ 5000`).
* **Anderson-Darlingův test** — lepší pro chvosty.

### Řešení nenormality

* **Box-Cox transformace** `Y → Y^λ` (nebo `log Y` pro `λ = 0`).
* **Robust regression** — neopírá se o normalitu.
* **Nonparametric methods** — quantile regression, rank-based.

## Linearita

Někdy je vztah mezi `x` a `Y` *nelineární*, ale použijeme *lineární* model — fit je špatný, rezidua *jsou strukturovaná*.

### Detekce

* **Residual vs. predicted plot** — pokud rezidua tvoří *systematický* trend (U-shape, vlnitost), porušení linearity.
* **Component-residual plot** (partial regression plot) — pro každý prediktor.
* **Lack-of-fit test** — porovnání s nasyceným modelem (vyžaduje replikace).

### Řešení

* Polynomiální termy `x²`, `x³`.
* Spline / GAM — generalized additive models.
* Transformace prediktorů (`log x`, `√x`).
* Interakce.

## Souhrnný diagnostický plot

Standardní `plot(model)` v R generuje 4 plots:

1. **Residuals vs. Fitted** — linearita, homoskedasticita.
2. **Normal Q-Q** — normalita.
3. **Scale-Location** — homoskedasticita.
4. **Residuals vs. Leverage** — Cookova vzdálenost, influential points.

::: svg "Tři diagnostické plots: rezidua proti predikcím (linearity), Q-Q (normality), residuals vs. leverage (influence)."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="10.5">
  <g transform="translate(20, 20)">
    <text x="80" y="-5" text-anchor="middle" fill="var(--text-muted)">res vs. fitted</text>
    <line x1="0" y1="120" x2="160" y2="120" stroke="var(--line-strong)"/>
    <line x1="0" y1="60" x2="160" y2="60" stroke="var(--text-muted)" stroke-dasharray="3 3"/>
    <g fill="var(--accent-line)">
      <circle cx="20" cy="50" r="2"/>
      <circle cx="40" cy="65" r="2"/>
      <circle cx="60" cy="62" r="2"/>
      <circle cx="80" cy="58" r="2"/>
      <circle cx="100" cy="63" r="2"/>
      <circle cx="120" cy="55" r="2"/>
      <circle cx="140" cy="60" r="2"/>
    </g>
  </g>
  <g transform="translate(200, 20)">
    <text x="80" y="-5" text-anchor="middle" fill="var(--text-muted)">Q-Q</text>
    <line x1="0" y1="120" x2="160" y2="120" stroke="var(--line-strong)"/>
    <line x1="0" y1="0" x2="0" y2="120" stroke="var(--line-strong)"/>
    <line x1="0" y1="115" x2="155" y2="10" stroke="var(--text-muted)" stroke-dasharray="3 3"/>
    <g fill="var(--accent-line)">
      <circle cx="10" cy="110" r="2"/>
      <circle cx="30" cy="95" r="2"/>
      <circle cx="50" cy="80" r="2"/>
      <circle cx="80" cy="58" r="2"/>
      <circle cx="110" cy="35" r="2"/>
      <circle cx="130" cy="20" r="2"/>
      <circle cx="150" cy="15" r="2"/>
    </g>
  </g>
  <g transform="translate(380, 20)">
    <text x="80" y="-5" text-anchor="middle" fill="var(--text-muted)">res vs. leverage</text>
    <line x1="0" y1="120" x2="160" y2="120" stroke="var(--line-strong)"/>
    <line x1="0" y1="60" x2="160" y2="60" stroke="var(--text-muted)" stroke-dasharray="3 3"/>
    <g fill="var(--accent-line)">
      <circle cx="20" cy="58" r="2"/>
      <circle cx="30" cy="62" r="2"/>
      <circle cx="40" cy="56" r="2"/>
      <circle cx="55" cy="64" r="2"/>
      <circle cx="70" cy="55" r="2"/>
      <circle cx="85" cy="59" r="2"/>
    </g>
    <circle cx="140" cy="30" r="4" fill="var(--accent)" stroke="var(--text)"/>
    <text x="140" y="20" text-anchor="middle" fill="var(--accent)" font-size="9">influential</text>
  </g>
</svg>
:::

## Souhrnný protokol diagnostiky

1. Fit modelu (`lm`).
2. `plot(model)` — vizuální check 4 plots.
3. `vif(model)` — multikolinearita.
4. `shapiro.test(resid(model))` — normalita.
5. `bptest(model)` (Breusch-Pagan) nebo `ncvTest(model)` — heteroskedasticita.
6. `dwtest(model)` — autokorelace (pro časové řady).
7. `influence.measures(model)` — high-leverage / influential.

Pokud něco selže — řešit (transformace, robust SE, GLS, …) a *iterovat*.

::: viz residual-diagnostics "Vyberte typ porušení (nelinearita / heteroskedasticita / heavy tails / outlier) a sledujte 4 diagnostické ploty."
:::

::: link "Faraway, J.: Linear Models with R, kap. 6 (Diagnostics)" "https://www.routledge.com/Linear-Models-with-R/Faraway/p/book/9781439887332"
:::

::: link "Fox, J.: An R Companion to Applied Regression (Sage 2019)" "https://socialsciences.mcmaster.ca/jfox/Books/Companion/"
:::

---

*Zdroj: MSP přednášky 2025/26, *Linear Regression — Diagnostics* (Hrabec). Externí reference: Zvára, K.: *Regrese* (Matfyzpress 2019); Faraway, J.: *Linear Models with R* (CRC 2014), kap. 6; Belsley, D. A., Kuh, E., Welsch, R. E.: *Regression Diagnostics* (Wiley 1980).*
