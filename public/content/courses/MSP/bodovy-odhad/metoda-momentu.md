---
title: Metoda momentů
---

# Metoda momentů

**Metoda momentů** (Method of Moments, MoM) je nejstarší obecná metoda bodového odhadu. Karl Pearson ji navrhl v roce 1894 — dlouho před MLE. Idea: ztotožni *teoretické momenty* (vyjádřené pomocí parametrů) s *empirickými momenty* (vypočítanými ze vzorku) a vyřeš soustavu. Často dává jednodušší vzorce než MLE, ale ne vždy nejlepší vlastnosti — používá se zejména pro počáteční odhady nebo když MLE je obtížný.

## Princip

Pro rodinu `f(x; θ)` s `k` neznámými parametry `θ = (θ₁, …, θₖ)`:

**Teoretické momenty** (funkce parametrů):

::: math
m_j(\theta) = E_\theta[X^j] = \int x^j f(x; \theta)\, dx, \quad j = 1, 2, \dots, k.
:::

**Empirické (výběrové) momenty**:

::: math
\hat{m}_j = \frac{1}{n} \sum_{i=1}^{n} X_i^j, \quad j = 1, 2, \dots, k.
:::

**Odhad metodou momentů** je řešení soustavy:

::: math
m_1(\theta) = \hat{m}_1, \quad m_2(\theta) = \hat{m}_2, \quad \dots, \quad m_k(\theta) = \hat{m}_k.
:::

`k` rovnic o `k` neznámých — má řešení, pokud rodina je *identifikovatelná* prvními `k` momenty.

## Příklad 1 — `Exp(λ)`

`E[X] = 1/λ`. Ztotožnění s prvním momentem:

::: math
\frac{1}{\lambda} = \bar{X} \quad \Longrightarrow \quad \hat{\lambda}_{MoM} = \frac{1}{\bar{X}}.
:::

*Stejné* jako MLE — pro Exp se moment-based a maximum-likelihood odhady kryjí.

## Příklad 2 — `N(μ, σ²)`

Dva parametry, dva momenty:

* `E[X] = μ` → `μ = X̄`
* `E[X²] = μ² + σ²` → `σ² = (1/n) Σ Xᵢ² − X̄²`

Druhou rovnost přepíšeme:

::: math
\hat{\sigma}^2_{MoM} = \frac{1}{n} \sum (X_i - \bar{X})^2.
:::

*Stejné* jako MLE pro normální rozdělení.

## Příklad 3 — `Bi(N, p)`, `N` známé

Známe počet pokusů `N`, neznáme pravděpodobnost úspěchu `p`. `E[X] = Np`. MoM:

::: math
N \hat{p} = \bar{X} \quad \Longrightarrow \quad \hat{p}_{MoM} = \frac{\bar{X}}{N}.
:::

## Příklad 4 — Gamma `Γ(k, θ)` — kde se MoM liší od MLE

Dva parametry: `k` (shape) a `θ` (scale). Momenty:

* `E[X] = k θ`
* `Var(X) = k θ²`, tedy `E[X²] = k²θ² + kθ² = kθ²(k + 1)`.

Soustava:

::: math
k\theta = \bar{X}, \quad k\theta^2 = \frac{1}{n}\sum (X_i - \bar{X})^2 = s^2.
:::

Z první `k = X̄/θ`. Dosazením:

::: math
\hat{\theta}_{MoM} = \frac{s^2}{\bar{X}}, \quad \hat{k}_{MoM} = \frac{\bar{X}^2}{s^2}.
:::

**Srovnání s MLE**: MLE pro Gamma vyžaduje řešit transcendentní rovnici `log(k) − ψ(k) = log(X̄) − (1/n)Σ log(Xᵢ)`, kde `ψ` je digamma funkce. Není uzavřená forma. MoM dává *jednoduchý* explicitní vzorec — výhodný start pro iterativní MLE.

## Vlastnosti

* **Konzistence**: MoM odhady jsou *vždy konzistentní* (`θ̂ → θ` v pravděpodobnosti), pokud `m_j(·)` jsou spojité v okolí pravého `θ`. Důvod: výběrové momenty jsou konzistentní pro teoretické (LLN), a spojité funkce konzistentních odhadů jsou konzistentní.
* **Asymptotická normalita**: ano, ale variance obecně *větší* než MLE.
* **Asymptotická efektivnost**: MoM *není* efektivní (až na výjimky, kde se kryje s MLE). Cramér-Rao mez se obvykle nedosahuje.

## Generalized Method of Moments (GMM)

Lars Hansen (Nobelova cena 2013) zobecnil MoM: místo přesně `k` rovnic použij `m > k` rovnic typu `E_θ[g(X, θ)] = 0` (overdetermined system) a minimalizuj kvadratickou formu `(g̃ − 0)ᵀ W (g̃ − 0)`, kde `W` je vážená matice.

GMM se ukazuje *asymptoticky efektivní* (dosahuje Cramér-Raovy meze) pro správně zvolenou `W = Cov(g)⁻¹`. Používá se v ekonometrii (Hansen-Sargan testy, instrumentální proměnné).

## Robustnost vs. efektivnost

* **MLE** — efektivní, ale citlivý na *misspecification* (špatně zvolená rodina) a outliers.
* **MoM** — méně efektivní, ale často *robustnější* k odchylkám od modelu. Důvod: závisí jen na *momentech*, ne na detailní formě hustoty.

V praxi je MoM užitečný:

* **Quick & dirty** odhad — když chceme rychlou intuici.
* **Starting point** pro Newton-Raphson MLE.
* **Robust statistics** — robustní varianty (M-estimators, trimmed mean) generalizují MoM.

## Příklad — exponenciální rodina

Pro [[exponencialni-rodina|exponenciální rodinu]] `f(x; θ) = h(x) exp(η(θ)ᵀ T(x) − A(θ))`:

* MoM s `T(x)` (sufficient statistic) místo `xʲ` dává stejné odhady jako MLE.
* To je důvod, proč pro standardní rodiny (Bernoulli, Normal, Exp) jsou MoM a MLE *identické*.

Pro nestandardní rodiny (Gamma s neznámým shape, Beta) se metody rozcházejí.

## Použití pomocných statistik

Místo přímého `E[Xʲ]` lze ztotožnit *libovolné funkce momentů* — třeba `E[log X]`, `E[1/X]`, `E[|X − med|]` (mean absolute deviation). Pokud `k` rovnic dává jedinečné řešení, jde o validní moment-based odhad.

Robustnější příklad: pro `N(μ, σ²)` lze `σ` odhadnout přes *interquartile range* `IQR = X₀,₇₅ − X₀,₂₅ ≈ 1{,}349 σ`, místo přes `s² = Σ(Xᵢ − X̄)²`. To je odolné proti outliers.

## Shrnutí — srovnání MoM a MLE

| Aspekt | MoM | MLE |
| :--- | :--- | :--- |
| Princip | shoda momentů | maximalizace věrohodnosti |
| Forma řešení | obvykle explicitní | často iterativní |
| Konzistence | ano | ano |
| Efektivnost | ne (obecně) | ano (asymptoticky) |
| Robustnost | spíše ano | spíše ne |
| Komplexnost | nízká | střední/vysoká |

::: viz mom-vs-mle-gamma "Generujte data z Γ(k, θ); porovnejte MoM (uzavřená forma) a MLE (Newton iterace) odhady."
:::

::: link "Hall, A. R.: Generalized Method of Moments (Oxford 2005)" "https://global.oup.com/academic/product/generalized-method-of-moments-9780198775225"
:::

::: link "Casella, G., Berger, R.: Statistical Inference, kap. 7.2.1 (Method of Moments)" "https://www.cengage.com/c/statistical-inference-2e-casella"
:::

---

*Zdroj: MSP přednášky 2025/26, *Advanced Statistics — Method of Moments* (Hrabec). Externí reference: DeGroot, M., Schervish, M.: *Probability and Statistics* (4th ed., Pearson 2012), kap. 7.6.3; Casella, G., Berger, R.: *Statistical Inference* (Cengage 2002), kap. 7.2.1; Hansen, L.: *Large Sample Properties of Generalized Method of Moments Estimators*, Econometrica 50 (1982).*
