---
title: Lineární model — definice
---

# Lineární model — definice

**Lineární model** je sjednocující rámec pro lineární regresi, ANOVU, ANCOVU a další klasické statistické metody. Říká: pozorovaná veličina `Y` je *lineární kombinací* nepozorovaných parametrů `β`, plus normálně rozdělený šum. Tato struktura umožňuje vše — bodový odhad, intervaly spolehlivosti, testování hypotéz, predikce — řešit jednotnými maticovými technikami (Gauss-Markov teorém, lineární algebra).

## Definice

**Lineární model** je trojice `(Y, X, β)`, kde:

* `Y = (Y₁, …, Yₙ)ᵀ ∈ R^n` — pozorovaný *vektor odezvy* (response).
* `X ∈ R^{n × k}` — *návrhová matice* (design matrix), nenáhodná, známá.
* `β = (β₁, …, βₖ)ᵀ ∈ R^k` — vektor neznámých parametrů.

Lineární vztah:

::: math
\mathbf{Y} = \mathbf{X} \boldsymbol{\beta} + \boldsymbol{\varepsilon},
:::

kde `ε = (ε₁, …, εₙ)ᵀ` je vektor náhodných chyb (errors) s:

* `E[ε] = 0` (zero mean),
* `Var(ε) = σ² I` (homoskedasticita + nekorelovanost).

Pro inferenci obvykle navíc předpokládáme:

* `ε ∼ N(0, σ² I)` — normalita.

## Maticový tvar

Pro `n` pozorování:

::: math
\begin{pmatrix} Y_1 \\ Y_2 \\ \vdots \\ Y_n \end{pmatrix} = \begin{pmatrix} x_{11} & x_{12} & \cdots & x_{1k} \\ x_{21} & x_{22} & \cdots & x_{2k} \\ \vdots & & & \vdots \\ x_{n1} & x_{n2} & \cdots & x_{nk} \end{pmatrix} \begin{pmatrix} \beta_1 \\ \beta_2 \\ \vdots \\ \beta_k \end{pmatrix} + \begin{pmatrix} \varepsilon_1 \\ \varepsilon_2 \\ \vdots \\ \varepsilon_n \end{pmatrix}.
:::

Každý řádek: `Yᵢ = xᵢ₁ β₁ + xᵢ₂ β₂ + … + xᵢₖ βₖ + εᵢ`.

### Často první sloupec = `1` (intercept)

Pokud má model *intercept* (`β₀ + β₁ x₁ + …`), první sloupec `X` je `(1, 1, …, 1)ᵀ`.

## Příklady lineárních modelů

### Jednoduchá lineární regrese

`Yᵢ = β₀ + β₁ xᵢ + εᵢ`. Návrhová matice:

::: math
\mathbf{X} = \begin{pmatrix} 1 & x_1 \\ 1 & x_2 \\ \vdots & \vdots \\ 1 & x_n \end{pmatrix}, \quad \boldsymbol{\beta} = (\beta_0, \beta_1)^\top.
:::

### Polynomiální regrese

`Yᵢ = β₀ + β₁ xᵢ + β₂ xᵢ² + εᵢ` — *stále* lineární *v parametrech*, i když nelineární v `x`:

::: math
\mathbf{X} = \begin{pmatrix} 1 & x_1 & x_1^2 \\ \vdots & \vdots & \vdots \\ 1 & x_n & x_n^2 \end{pmatrix}.
:::

### Mnohonásobná regrese

`Yᵢ = β₀ + β₁ x_{i1} + β₂ x_{i2} + … + β_{k-1} x_{i,k-1} + εᵢ`. Více prediktorů.

### One-way ANOVA jako lineární model

`k` skupin, `Yᵢⱼ = μ_j + εᵢⱼ`, `j = 1, …, k`. Jako lineární model s dummy proměnnými:

::: math
\mathbf{X} = \begin{pmatrix} 1 & 0 & \cdots & 0 \\ \vdots & \vdots & & \vdots \\ 0 & 1 & \cdots & 0 \\ \vdots & \vdots & & \vdots \end{pmatrix}, \quad \boldsymbol{\beta} = (\mu_1, \mu_2, \dots, \mu_k)^\top.
:::

Stejná matematická struktura, jiná interpretace.

### Indikátorové proměnné

Pro kategoriální prediktor s `k` úrovněmi se použije `k − 1` *indikátorových* (dummy) sloupců (jedna úroveň je *baseline*).

## Odhad parametrů — metoda nejmenších čtverců

Cíl: najít `β̂` minimalizující součet čtverců reziduí:

::: math
S(\boldsymbol{\beta}) = \sum_{i=1}^{n} (Y_i - \mathbf{x}_i^\top \boldsymbol{\beta})^2 = (\mathbf{Y} - \mathbf{X}\boldsymbol{\beta})^\top (\mathbf{Y} - \mathbf{X}\boldsymbol{\beta}) = \|\mathbf{Y} - \mathbf{X}\boldsymbol{\beta}\|^2.
:::

Derivováním podle `β` a položením = 0 dostaneme **normální rovnice**:

::: math
\mathbf{X}^\top \mathbf{X}\, \hat{\boldsymbol{\beta}} = \mathbf{X}^\top \mathbf{Y}.
:::

Pokud `X` má plnou sloupcovou hodnost (`rank(X) = k`), `XᵀX` je invertibilní:

::: math
\hat{\boldsymbol{\beta}} = (\mathbf{X}^\top \mathbf{X})^{-1} \mathbf{X}^\top \mathbf{Y}.
:::

### Geometrická interpretace

`Ŷ = X β̂ = X(XᵀX)⁻¹Xᵀ Y = H Y`, kde `H = X(XᵀX)⁻¹Xᵀ` je **hat matrix** (projekční matice). `Ŷ` je *ortogonální projekce* `Y` na sloupcový prostor `X`. Rezidua `r = Y − Ŷ = (I − H) Y` jsou *kolmá* na sloupcový prostor.

::: svg "OLS estimace: Ŷ je projekce Y na prostor sloupců X. Rezidua r = Y − Ŷ jsou kolmá na X."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <line x1="60" y1="180" x2="430" y2="80" stroke="var(--text-muted)" stroke-dasharray="3 3"/>
    <text x="430" y="68" text-anchor="end" fill="var(--text-muted)">sloupcový prostor X</text>
    <line x1="120" y1="40" x2="330" y2="200" stroke="var(--line-strong)"/>
    <text x="332" y="216" fill="var(--text-muted)">Y</text>
    <line x1="60" y1="180" x2="280" y2="120" stroke="var(--accent)" stroke-width="2"/>
    <text x="290" y="120" fill="var(--accent)">Ŷ = HY</text>
    <line x1="280" y1="120" x2="330" y2="200" stroke="var(--accent-line)" stroke-width="2"/>
    <text x="345" y="170" fill="var(--accent-line)">r = Y − Ŷ</text>
    <circle cx="280" cy="120" r="4" fill="var(--accent)"/>
    <circle cx="330" cy="200" r="4" fill="var(--line-strong)"/>
    <path d="M 290 130 L 295 135 L 300 130" stroke="var(--text)" fill="none"/>
    <text x="290" y="178" fill="var(--text)" font-size="10">⊥</text>
  </g>
</svg>
:::

## Vlastnosti odhadu

Za předpokladů Gauss-Markovových (`E[ε] = 0`, `Var(ε) = σ²I`):

* `E[β̂] = β` — *nestranný*.
* `Var(β̂) = σ² (XᵀX)⁻¹` — explicitní vzorec.

Pokud navíc `ε ∼ N(0, σ²I)`:

* `β̂ ∼ N(β, σ²(XᵀX)⁻¹)` — *přesné* (ne jen asymptotické) normální rozdělení.
* `β̂` je **MLE** parametru `β`.

## Odhad rozptylu reziduí

::: math
\hat{\sigma}^2 = S^2_{res} = \frac{1}{n - k} \sum_{i=1}^{n} (Y_i - \hat{Y}_i)^2 = \frac{\|\mathbf{r}\|^2}{n - k}.
:::

Dělíme `n − k` (ne `n`) — *Besselova korekce* pro vícerozměrný případ. `n − k` je *počet stupňů volnosti reziduí*, protože jsme „odhadli" `k` parametrů z `n` pozorování.

`S²_{res}` je **nestranný** odhad `σ²`: `E[S²_{res}] = σ²`.

## Identifikovatelnost a multikolinearita

`X` musí mít *plnou sloupcovou hodnost* (`rank(X) = k`), jinak `XᵀX` není invertibilní a `β̂` není jednoznačné.

### Praktické problémy

* **Méně pozorování než parametrů** (`n < k`) — model je *underdetermined*.
* **Perfektní kolinearita** — dvě sloupce identické (např. teplota v °C a °F).
* **Téměř kolinearita** ([[diagnostika-rezidui|multikolinearita]]) — `XᵀX` je „téměř singulární"; odhady jsou *nestabilní*.

Řešení: vyřadit redundantní proměnnou, principal components, ridge regression (regularizace).

## Predikce

Pro nové hodnoty prediktorů `x₀`:

::: math
\hat{Y}(\mathbf{x}_0) = \mathbf{x}_0^\top \hat{\boldsymbol{\beta}}.
:::

Variance:

::: math
\mathrm{Var}(\hat{Y}(\mathbf{x}_0)) = \sigma^2 \mathbf{x}_0^\top (\mathbf{X}^\top \mathbf{X})^{-1} \mathbf{x}_0.
:::

CI pro `E[Y | x₀]` (interval spolehlivosti pro střední odezvu):

::: math
\hat{Y}(\mathbf{x}_0) \pm t_{\alpha/2, n-k} \cdot S_{res} \sqrt{\mathbf{x}_0^\top (\mathbf{X}^\top \mathbf{X})^{-1} \mathbf{x}_0}.
:::

Prediction interval pro *individuální* `Y(x₀)` (širší, započítává `σ²` reziduálního šumu):

::: math
\hat{Y}(\mathbf{x}_0) \pm t_{\alpha/2, n-k} \cdot S_{res} \sqrt{1 + \mathbf{x}_0^\top (\mathbf{X}^\top \mathbf{X})^{-1} \mathbf{x}_0}.
:::

## Aplikace lineárních modelů

* **Regrese** ([[regrese-intro|lineární regrese]]) — kontinuální `Y`, kontinuální nebo kategoriální prediktory.
* **ANOVA** ([[one-way-anova]]) — kategoriální prediktor(y), test rovnosti skupinových středních.
* **ANCOVA** — kombinace ANOVA + kontinuální kovariát.
* **GLM** ([[glm-intro]]) — generalizace pro nenormální `Y` (logistická, Poissonova regrese).
* **Mixed models** — random + fixed effects pro hierarchická data.
* **Experimentální design** — DoE, faktoriální experimenty.

::: viz hat-matrix-projection "Geometrická interpretace OLS: Ŷ je ortogonální projekce Y na sloupcový prostor X; rezidua jsou kolmá."
:::

::: link "Zvára, K.: Regrese (Matfyzpress 2019, 2. vyd.)" "https://www.matfyzpress.cz/cs/kniha/regrese-2-vydani.html"
:::

::: link "Faraway, J.: Linear Models with R (CRC 2014, 2nd ed.)" "https://www.routledge.com/Linear-Models-with-R/Faraway/p/book/9781439887332"
:::

---

*Zdroj: MSP přednášky 2025/26, *Linear Model — Definition* (Hrabec). Externí reference: Zvára, K.: *Regrese* (Matfyzpress 2019, 2. vyd.); DeGroot, M., Schervish, M.: *Probability and Statistics* (Pearson 2012), kap. 11; Casella, G., Berger, R.: *Statistical Inference* (Cengage 2002), kap. 12.*
