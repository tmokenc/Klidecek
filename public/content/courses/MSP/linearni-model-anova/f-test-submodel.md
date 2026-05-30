---
title: F-test submodelu
---

# F-test submodelu

Pro lineární modely se rutinně ptáme: „Je tato podmnožina prediktorů opravdu potřeba?" Formálně testujeme, zda *redukovaný* model (submodel) `M₁` je stejně dobrý jako *plný* model `M`. K tomu slouží **F-test submodelu** — speciální případ likelihood ratio testu pro lineární modely. Z něj odvodíme F-statistiku ANOVA, individuální t-testy pro koeficienty regrese a obecné porovnání nested models.

## Submodelová struktura

Buď `M`: `Y ∼ N(X α, σ² I)` plný model s `X ∈ R^{n × k}`. **Submodel** `M₁`: `Y ∼ N(U β, σ² I)` s `U ∈ R^{n × k₁}`, `k₁ < k`, *vnořený* do `M` v tom smyslu, že každý sloupec `U` je lineární kombinací sloupců `X`. Tedy:

::: math
\mathrm{col}(\mathbf{U}) \subset \mathrm{col}(\mathbf{X}).
:::

Hypotéza:

* `H₀: M₁ platí` (submodel je dostatečný — některé sloupce v `X` jsou redundantní).
* `H₁: M` platí (potřebujeme plný model).

## F-statistika

Buď `a, b` odhady `α, β` (OLS). Definujme:

* **Reziduální součet čtverců plného modelu**:
  ::: math
  S_e = (\mathbf{Y} - \mathbf{X} a)^\top (\mathbf{Y} - \mathbf{X} a) = \|\mathbf{Y} - \hat{\mathbf{Y}}_M\|^2.
  :::
* **Reziduální součet čtverců submodelu**:
  ::: math
  S_e^* = (\mathbf{Y} - \mathbf{U} b)^\top (\mathbf{Y} - \mathbf{U} b) = \|\mathbf{Y} - \hat{\mathbf{Y}}_{M_1}\|^2.
  :::
* **„Zlepšení" plným modelem**:
  ::: math
  S_A = S_e^* - S_e = \|\hat{\mathbf{Y}}_M - \hat{\mathbf{Y}}_{M_1}\|^2.
  :::

**F-statistika**:

::: math
F = \frac{S_A / (k - k_1)}{S_e / (n - k)} = \frac{(S_e^* - S_e) / (k - k_1)}{S_e / (n - k)}.
:::

**Distribuce pod `H₀` (submodel platí)**:

::: math
F \sim F(k - k_1, n - k).
:::

**Rozhodnutí**: zamítnout `H₀` ⇔ `F > F_{α, k − k₁, n − k}`. Tedy zamítáme submodel, pokud je *významně* horší.

## Interpretace

* `S_A` měří, jak moc se zlepšil model „přidáním" sloupců (přechod z `U` do `X`).
* `S_e` měří „zbytkový" šum, který se nedá vysvětlit ani plným modelem.
* Poměr `F` porovnává *vysvětlenou variabilitu* (přes přidané sloupce) s *nevysvětlitelnou variabilitou* (rezidua). Velké `F` ⇒ přidané sloupce signifikantně zlepšují fit.

::: svg "F-test rozkládá variabilitu Y: část vysvětlená submodelem (Ŷ_M1), zlepšení plného modelu (Ŷ_M − Ŷ_M1), rezidua (Y − Ŷ_M)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <text x="40" y="30" fill="var(--text-muted)">Y</text>
    <rect x="60" y="40" width="420" height="30" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="270" y="60" text-anchor="middle" fill="var(--text)">SST = Σ(Yᵢ − Ȳ)²</text>

    <rect x="60" y="90" width="200" height="30" fill="var(--bg-inset)" stroke="var(--accent)" stroke-width="2"/>
    <text x="160" y="110" text-anchor="middle" fill="var(--accent)" font-size="10.5">Ŷ_M1 (submodel)</text>
    <rect x="260" y="90" width="100" height="30" fill="var(--bg-inset)" stroke="var(--accent-line)" stroke-width="2"/>
    <text x="310" y="110" text-anchor="middle" fill="var(--accent-line)" font-size="10.5">+ S_A</text>
    <rect x="360" y="90" width="120" height="30" fill="var(--bg-inset)" stroke="var(--text-muted)" stroke-width="2"/>
    <text x="420" y="110" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">rezidua S_e</text>

    <text x="270" y="160" text-anchor="middle" fill="var(--accent-line)">F = (S_A / (k − k₁)) / (S_e / (n − k))</text>
    <text x="270" y="180" text-anchor="middle" fill="var(--text-muted)" font-size="10">velké F ⇒ submodel nestačí, plný model je signifikantně lepší</text>
  </g>
</svg>
:::

## Aplikace

### 1. ANOVA — test rovnosti skupinových středních

Plný model: `k` skupin s vlastními středními `μⱼ`. Submodel: všechny střední rovné `μ₁ = … = μ_k = μ`.

`F = MS_between / MS_within`. Pokud `F > F_{α, k − 1, n − k}`, zamítneme `H₀` ([[one-way-anova]]).

### 2. Test významnosti všech prediktorů v regresi

Plný model: `Y = β₀ + β₁ x₁ + … + β_{k−1} x_{k−1} + ε`. Submodel: `Y = β₀ + ε` (jen intercept).

`F` testuje `H₀: β₁ = … = β_{k−1} = 0`. Reportováno ve standardním `summary(lm)` v R.

### 3. Test podmnožiny prediktorů

Plný: všech `k` prediktorů. Submodel: vyřadí podmnožinu `q` prediktorů. F-test rozhodne, zda lze `q` prediktorů *společně* odebrat.

### 4. Polynomiální stupeň

`Y = β₀ + β₁ x + β₂ x² + β₃ x³ + ε` vs. `Y = β₀ + β₁ x + ε`. F-test rozhodne, zda kvadratický + kubický člen jsou potřeba.

## Individuální t-test jako speciální případ

Pro jediný koeficient `β_j` ve plném modelu:

* Plný model: všech `k` prediktorů.
* Submodel: bez `j`-tého prediktoru (`k − 1` prediktorů).

F-test má `F ∼ F(1, n − k)`. Lze ukázat:

::: math
F = T_j^2, \quad T_j = \frac{\hat{\beta}_j}{s.e.(\hat{\beta}_j)} \sim t(n - k).
:::

(Statistika `F(1, n − k) = t(n − k)²`.) Tedy *individuální t-test koeficientu* `β_j` je *ekvivalentní* F-testu submodelu bez `j`-tého prediktoru. To je důvod, proč `summary(lm)` zobrazuje *t-statistiku a p-hodnotu* pro každý koeficient.

## Vztah s likelihood ratio testem

F-test je *exaktní* verze [[likelihood-ratio]] testu pro normální lineární modely:

::: math
-2 \log \Lambda = n \log\!\left( \frac{S_e^*}{S_e} \right).
:::

Pro velké `n`: `−2 log Λ = n · log(1 + (k − k₁)·F/(n − k))` → asymptoticky `χ²(k − k₁)`. F-test je *exaktní*, LR je *asymptotický*.

## Sequential F-tests (Type I, II, III SS)

Při více prediktorech záleží na *pořadí* zahrnutí:

* **Type I SS** — sequential. Pořadí v modelu matters. Užitečné pro hierarchické modely.
* **Type II SS** — partial, „each term given all others" *kromě interakcí*.
* **Type III SS** — partial, „each term given all others" *včetně interakcí*. Standard v SAS/SPSS.

R `anova()` defaultně dává Type I, `Anova()` z `car` package dává Type II/III. Pro nevyvážené ANOVA designs jsou volby kritické.

## Software

* **R**: `anova(reduced_model, full_model)` testuje submodel vs. plný.
* **Python statsmodels**: `model.compare_lr_test(reduced_model)` nebo `anova_lm()`.
* **SAS**: `PROC GLM` s `TEST` statementem.

Output: `F`, `df1`, `df2`, p-hodnota.

## Další oblasti použití

* **Variable selection** — stepwise regression, ANOVA tables.
* **GLM** — analogie pro logistickou/Poissonovu regresi přes deviance.
* **Mixed models** — F-test náhodných efektů (s upozorněním: distribuce je smíšenina χ²).
* **Time series** — F-test seasonality, trendu.

::: viz anova-interactive "ANOVA jako F-test submodelu: H₀ je 'všechny μⱼ stejné' (submodel μ₁=μ₂=μ₃=μ). Sledujte SS_B/(k-1) / SS_W/(n-k)."
:::

::: link "Faraway, J.: Linear Models with R, kap. 3 (F-tests)" "https://www.routledge.com/Linear-Models-with-R/Faraway/p/book/9781439887332"
:::

::: link "Zvára, K.: Regrese, kap. 4 (Submodel testing)" "https://www.matfyzpress.cz/cs/kniha/regrese-2-vydani.html"
:::

---

*Zdroj: MSP přednášky 2025/26, *Linear Model — F-test for Submodel* (Hrabec). Externí reference: Zvára, K.: *Regrese* (Matfyzpress 2019); Faraway, J.: *Linear Models with R* (CRC 2014); Searle, S. R.: *Linear Models* (Wiley 1971).*
