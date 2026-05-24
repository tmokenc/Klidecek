---
title: Gauss-Markov teorém a BLUE
---

# Gauss-Markov teorém a BLUE

**Gauss-Markovův teorém** je centrální výsledek teorie lineárních modelů: za jistých „minimálních" předpokladů (nulová střední hodnota a homoskedasticita reziduí) je odhad metodou nejmenších čtverců `β̂_OLS` **nejlepší lineární nestranný odhad** (Best Linear Unbiased Estimator, **BLUE**). Důležité je: *normalita* reziduí nepotřebujeme — Gauss-Markov platí i pro libovolnou distribuci reziduí, dokud má správnou střední hodnotu a kovariační strukturu.

## Předpoklady Gauss-Markova

Lineární model `Y = X β + ε` s následujícími předpoklady o reziduích:

1. **GM1: Linearita** — `Y = X β + ε` (vztah je opravdu lineární).
2. **GM2: Nezávislost designu** — `X` je nenáhodná (deterministická matice). Pokud je náhodná, předpokládáme `E[ε | X] = 0`.
3. **GM3: Nulová střední hodnota reziduí** — `E[ε] = 0`. Důsledek: `E[Y] = X β`.
4. **GM4: Homoskedasticita + nekorelovanost** — `Var(ε) = σ² I`. Konstantní rozptyl, nezávislé chyby.

**Nezavádíme** normalitu — GM platí pro *libovolné* rozdělení reziduí splňující GM3+GM4.

## Gauss-Markovův teorém

**Věta (Gauss-Markov 1809/1821):** Za předpokladů GM1–GM4 platí pro každou *lineární kombinaci parametrů* `cᵀ β` (kde `c ∈ R^k`):

> Mezi všemi *lineárními nestrannými odhady* `cᵀ β` má `cᵀ β̂_OLS` *nejmenší rozptyl*.

Tedy `β̂_OLS = (XᵀX)⁻¹XᵀY` je **BLUE**:

* **Best** — minimální variance,
* **Linear** — lineární funkce `Y` (`β̂ = MY` pro nějakou matici `M`),
* **Unbiased** — `E[β̂] = β`,
* **Estimator** — odhad parametru `β`.

### Co teorém neslibuje

* **Optimum mezi *nelineárními* odhady?** Ne. Pro nenormální data může nelineární odhad (medián, M-estimator) mít *menší* MSE.
* **Optimum vychýlených odhadů?** Ne. *Ridge regression* (vychýlený) může mít menší MSE než OLS při multikolinearitě (bias-variance tradeoff).
* **Normalitu?** Ne. Pro testování hypotéz potřebujeme navíc normalitu (nebo CLT pro velké `n`).

## Důkaz (skica)

Buď `β̂* = MY` libovolný lineární nestranný odhad `β`. Z nestrannosti `E[β̂*] = M(Xβ) = β` plyne `MX = I_k`.

Variance:

::: math
\mathrm{Var}(\hat{\boldsymbol{\beta}}^*) = M \cdot \mathrm{Var}(\mathbf{Y}) \cdot M^\top = \sigma^2 M M^\top.
:::

Pro OLS: `M_OLS = (XᵀX)⁻¹Xᵀ`, `Var(β̂_OLS) = σ²(XᵀX)⁻¹`.

Definujeme `D = M − M_OLS`. Pak `DX = MX − M_OLS X = I − I = 0`. Spočítáme:

::: math
M M^\top = (M_{OLS} + D)(M_{OLS} + D)^\top = M_{OLS} M_{OLS}^\top + D M_{OLS}^\top + M_{OLS} D^\top + D D^\top.
:::

Křížové termy: `D M_{OLS}^\top = D X (X^\top X)^{-1} = 0` (z `DX = 0`). Tedy:

::: math
M M^\top = M_{OLS} M_{OLS}^\top + D D^\top \succeq M_{OLS} M_{OLS}^\top.
:::

(`DDᵀ` je positive semidefinite.) Variance OLS je *minimální*. □

## Vlastnosti `β̂_OLS` shrnutě

Za GM1–GM4:

* `E[β̂_OLS] = β` — nestranný.
* `Var(β̂_OLS) = σ²(XᵀX)⁻¹` — explicitní formule.
* `Cov(β̂_OLS, ε̂) = 0` — odhad a rezidua jsou nekorelované.

Za normality `ε ∼ N(0, σ²I)` navíc:

* `β̂_OLS ∼ N(β, σ²(XᵀX)⁻¹)` — přesné rozdělení.
* `β̂_OLS = β̂_MLE` — OLS se kryje s MLE.
* `(n − k) S²_{res}/σ² ∼ χ²(n − k)`, nezávisle na `β̂`.
* `β̂_OLS` je **UMVUE** (mezi *všemi* nestranným odhady, ne jen lineárními) — Lehmann-Scheffé pro exponenciální rodinu.

## Rozšíření — Gauss-Markov pro známou kovariační matici

Pokud `Var(ε) = Σ` (obecná positive definite matice, ne `σ²I`):

* **Heteroskedasticita** — diagonální `Σ` s různými rozptyly.
* **Autokorelace** — nediagonální `Σ` (např. AR(1) proces v časových řadách).

V tom případě je BLUE **vážený odhad nejmenších čtverců** (Weighted Least Squares, WLS):

::: math
\hat{\boldsymbol{\beta}}_{WLS} = (\mathbf{X}^\top \Sigma^{-1} \mathbf{X})^{-1} \mathbf{X}^\top \Sigma^{-1} \mathbf{Y}.
:::

V praxi se `Σ` neznámá, ale lze ji odhadnout (Feasible GLS). Pro homoskedasticitu se `Σ = σ²I` a vzorec se redukuje na OLS.

## Aitkenův teorém

**Aitkenova zobecnění Gauss-Markova:** Pro `Var(ε) = Σ` (libovolnou positive definite), je `β̂_GLS` BLUE.

Stejná logika, ale OLS *není* optimal při heteroskedasticitě/autokorelaci. To se v praxi často přehlíží — proto je důležité testovat tyto předpoklady ([[diagnostika-rezidui]]).

## Co když selžou předpoklady?

* **GM3 (nulová střední hodnota)** — `E[ε] ≠ 0` ⇒ odhad je *vychýlený*. Často signalizuje *chybějící prediktor* nebo *nelinearitu*.
* **GM4 (heteroskedasticita)** — OLS *zůstává nestranný*, ale není BLUE. Standardní chyby jsou *špatně odhadnuty* — používáme **robust SE** (White, Huber-White, Newey-West).
* **GM4 (autokorelace)** — podobně, OLS nestranný ale neefektivní. SE špatně. *Newey-West* nebo *GLS*.
* **Normalita** (pro inference, ne pro Gauss-Markov) — pro velké `n` díky CLT méně kritická. Pro malé `n` použít *bootstrap* nebo *permutační testy*.

## Aplikace

* **Lineární regrese** — OLS je BLUE; používá se v ekonometrii, biomedicínském výzkumu, marketingu.
* **ANOVA** — OLS na maticových dummy proměnných.
* **Časové řady** — Box-Jenkins ARIMA: použít *GLS* pro autokorelované chyby.
* **Spatial statistics** — `Σ` zachycuje prostorovou autokorelaci.
* **Mixed models** — random effects mění strukturu `Σ`.

## Praktická poznámka — software

Standardní statistické softwary (`R: lm()`, `Python: statsmodels.OLS`, `SAS: PROC REG`) počítají `β̂_OLS = (XᵀX)⁻¹XᵀY`. Numericky se ale často používá **QR dekompozice** `X = QR`:

::: math
\hat{\boldsymbol{\beta}} = R^{-1} Q^\top \mathbf{Y}.
:::

QR má lepší stabilitu než přímá inverze `XᵀX`. Pro velmi velké úlohy: *stochastic gradient descent*, *L-BFGS*.

::: viz gauss-markov-blue-demo "Empirický rozptyl tří lineárních nestranných odhadů β̂₁: OLS má nejmenší (BLUE)."
:::

::: link "Gauss, C. F.: Theoria motus corporum coelestium (1809)" "https://archive.org/details/bub_gb_ORUOAAAAQAAJ"
:::

::: link "Casella, G., Berger, R.: Statistical Inference, kap. 11.3 (Gauss-Markov)" "https://www.cengage.com/c/statistical-inference-2e-casella"
:::

::: link "Faraway, J.: Linear Models with R, kap. 2" "https://www.routledge.com/Linear-Models-with-R/Faraway/p/book/9781439887332"
:::

---

*Zdroj: MSP přednášky 2025/26, *Linear Model — Gauss-Markov Theorem* (Hrabec). Externí reference: Zvára, K.: *Regrese* (Matfyzpress 2019); Casella, G., Berger, R.: *Statistical Inference* (Cengage 2002), kap. 11.3; Aitken, A. C.: *On Least Squares and Linear Combinations of Observations*, Proc. R. Soc. Edinburgh 55 (1935).*
