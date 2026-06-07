---
title: Lineární regrese
---

# Lineární regrese

Klasická **regresní** úloha (sup. learning, viz [[typy-uceni]]): pro vstup `x` chceme predikovat *spojitou* hodnotu `t`. Trénovací data: páry `(x_n, t_n)` pro `n = 1..N`.

## Model

Pro 1D vstup `x` je nejjednodušší model **lineární** v parametrech:

::: math
y(x; \mathbf{w}) = w_0 + w_1 x
:::

Pro D-rozměrný vstup `x ∈ R^D`:

::: math
y(\mathbf{x}; \mathbf{w}) = w_0 + \sum_{d=1}^{D} w_d x_d = \mathbf{w}^\top \tilde{\mathbf{x}}
:::

kde `w̃ = (1, x₁, …, x_D)` je vstup rozšířený o `1` pro intercept (bias). Vždy je možné lineární regresi přepsat do *vektorové* formy `y = wᵀx̃` (s `D+1` parametry).

::: svg "Lineární regrese v 1D: trénovací body (modré) a optimální přímka, červené segmenty jsou rezidua = chyby predikce."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6" fill="none">
    <line x1="40" y1="190" x2="510" y2="190"/>
    <line x1="40" y1="20" x2="40" y2="190"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="end" font-size="10">
    <text x="36" y="194">0</text>
    <text x="36" y="115">5</text>
    <text x="36" y="40">10</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="40" y="206">0</text>
    <text x="280" y="206">5</text>
    <text x="510" y="206">10</text>
  </g>
  <line x1="40" y1="180" x2="510" y2="35" stroke="var(--accent)" stroke-width="2"/>
  <g fill="var(--accent)" stroke="none">
    <circle cx="90" cy="155" r="3.5"/>
    <circle cx="155" cy="160" r="3.5"/>
    <circle cx="200" cy="110" r="3.5"/>
    <circle cx="265" cy="125" r="3.5"/>
    <circle cx="330" cy="80" r="3.5"/>
    <circle cx="400" cy="60" r="3.5"/>
    <circle cx="465" cy="80" r="3.5"/>
  </g>
  <g stroke="#e08a3a" stroke-width="1.2" stroke-dasharray="3 2">
    <line x1="90" y1="155" x2="90" y2="166"/>
    <line x1="155" y1="160" x2="155" y2="148"/>
    <line x1="200" y1="110" x2="200" y2="129"/>
    <line x1="265" y1="125" x2="265" y2="100"/>
    <line x1="330" y1="80" x2="330" y2="80"/>
    <line x1="400" y1="60" x2="400" y2="60"/>
    <line x1="465" y1="80" x2="465" y2="48"/>
  </g>
  <g fill="var(--text)" font-size="10">
    <text x="440" y="20">y = w₀ + w₁ x</text>
  </g>
</svg>
:::

## Trénování — least squares

Loss funkce: **sum-of-squares** chyby = součet čtverců reziduí:

::: math
E(\mathbf{w}) = \frac{1}{2}\sum_{n=1}^{N} \bigl(t_n - y(\mathbf{x}_n; \mathbf{w})\bigr)^2
:::

Hledáme `w*`, které loss *minimalizuje*.

### Proč právě čtverce?

Předpokládejme generativní model: výstup `t = y(x; w) + ε`, kde `ε ~ N(0, σ²)` je Gaussovský šum. Pak likelihood jednotlivého vzorku:

::: math
p(t_n \mid \mathbf{x}_n, \mathbf{w}) = \mathcal{N}(t_n; y(\mathbf{x}_n; \mathbf{w}), \sigma^2)
:::

Log-likelihood přes celý dataset:

::: math
\log p(\mathbf{t} \mid \mathbf{X}, \mathbf{w}) = -\frac{1}{2\sigma^2}\sum_n (t_n - y(\mathbf{x}_n; \mathbf{w}))^2 + \text{konst.}
:::

**Maximalizace log-likelihood** je ekvivalentní **minimalizaci sum-of-squares**. Tedy MSE loss = ML odhad pod předpokladem Gaussovského šumu.

### Uzavřené řešení (normal equations)

V maticovém zápisu: `t ∈ R^N`, `X ∈ R^{N×(D+1)}` (sloupec jedniček + featury). Loss:

::: math
E(\mathbf{w}) = \tfrac{1}{2}\|\mathbf{t} - \mathbf{X}\mathbf{w}\|^2
:::

Derivace podle `w` a `= 0`:

::: math
\mathbf{X}^\top \mathbf{X}\, \mathbf{w}^\star = \mathbf{X}^\top \mathbf{t} \quad \Longrightarrow \quad \mathbf{w}^\star = (\mathbf{X}^\top \mathbf{X})^{-1} \mathbf{X}^\top \mathbf{t}
:::

To jsou **normální rovnice**. `(XᵀX)⁻¹ Xᵀ` se jmenuje **Moore-Penroseova pseudoinverze**. Pro `N >> D` je řešení jediné; pro `N ≈ D` se `XᵀX` stává singulární a potřebujeme *regularizaci*.

Numericky je *lepší* nepoužívat přímo inverzi — místo toho QR rozklad nebo SVD `X` (numericky stabilnější, méně citlivé na špatně podmíněnou matici).

## Polynomiální a nelineární regrese

„Lineární" se vztahuje k *parametrům*, ne k *vstupům*. Můžeme tedy *transformovat* vstup nelineárně a stále řešit lineární regresí:

::: math
y(x; \mathbf{w}) = w_0 + w_1 x + w_2 x^2 + \dots + w_M x^M
:::

Obecněji s *bázovými funkcemi* `φ_j(x)`:

::: math
y(\mathbf{x}; \mathbf{w}) = \sum_{j=0}^{M} w_j \phi_j(\mathbf{x})
:::

Příklady bázových funkcí: polynomy `x^j`, Gaussovy bumpy `exp(-(x-μ_j)² / 2s²)`, sigmoidy, splines. Všechny vedou na *stejné* normální rovnice — jen `X` má sloupce `φ_j(x_n)`.

::: svg "Bias-variance trade-off: pod-fit (M=1, vlevo) vs. ideální (M=3) vs. přeučení (M=9, vpravo)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.5" fill="none">
    <rect x="20" y="30" width="160" height="140"/>
    <rect x="190" y="30" width="160" height="140"/>
    <rect x="360" y="30" width="160" height="140"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10.5">
    <text x="100" y="22">M = 1 (underfit)</text>
    <text x="270" y="22">M = 3 (správně)</text>
    <text x="440" y="22">M = 9 (overfit)</text>
  </g>
  <g fill="var(--accent)">
    <circle cx="40" cy="135" r="2.5"/>
    <circle cx="60" cy="120" r="2.5"/>
    <circle cx="80" cy="80" r="2.5"/>
    <circle cx="110" cy="60" r="2.5"/>
    <circle cx="135" cy="95" r="2.5"/>
    <circle cx="160" cy="130" r="2.5"/>
    <circle cx="210" cy="135" r="2.5"/>
    <circle cx="230" cy="120" r="2.5"/>
    <circle cx="250" cy="80" r="2.5"/>
    <circle cx="280" cy="60" r="2.5"/>
    <circle cx="305" cy="95" r="2.5"/>
    <circle cx="330" cy="130" r="2.5"/>
    <circle cx="380" cy="135" r="2.5"/>
    <circle cx="400" cy="120" r="2.5"/>
    <circle cx="420" cy="80" r="2.5"/>
    <circle cx="450" cy="60" r="2.5"/>
    <circle cx="475" cy="95" r="2.5"/>
    <circle cx="500" cy="130" r="2.5"/>
  </g>
  <g stroke="var(--accent)" stroke-width="1.8" fill="none">
    <line x1="30" y1="130" x2="170" y2="100"/>
    <path d="M 200 145 Q 270 30 340 135"/>
    <path d="M 370 134 L 380 135 Q 388 70 400 120 Q 410 158 420 80 Q 432 30 450 60 Q 462 96 475 95 Q 488 90 500 130 L 510 134"/>
  </g>
</svg>
:::

S rostoucím stupněm `M` polynomu klesá *trénovací* chyba, ale *testovací* chyba má U-tvar (klesá, pak roste — přeučení (overfitting)).

::: viz linear-regression-fit "Táhněte body myší; OLS křivka s reziduy a MSE se přepočítává; slider polynomu 1..9 → overfit při velkém stupni."
:::

## Regularizace — Ridge a Lasso

Při přeučení jsou váhy `w` často *velké* (kompenzují se navzájem). Řešení: penalizujeme velikost vah.

**Ridge regrese** (L2 regularizace):

::: math
E(\mathbf{w}) = \tfrac{1}{2}\|\mathbf{t} - \mathbf{X}\mathbf{w}\|^2 + \tfrac{\lambda}{2}\|\mathbf{w}\|^2
:::

* Uzavřené řešení: `w* = (XᵀX + λI)⁻¹ Xᵀ t`.
* `λ` → 0: žádná regularizace; `λ` → ∞: `w → 0`.
* Stabilizuje numericky `XᵀX` (vždy invertibilní).

**Lasso** (L1 regularizace) — místo `||w||²` máme `Σ|w_j|`:

* Nemá uzavřené řešení (musí se hledat iterativně).
* Tendence dělat váhy *sparse* (přesně `0`) — *automatický* feature selection.

Volba `λ` se ladí na **validační** množině.

## Praktické tipy {tier=practice}

* **Normalizace featur** je důležitá — pokud má jeden feature řád `10⁶` a druhý `10⁻²`, regularizace L2 penalizuje nesymetricky.
* **Korelace featur** zhoršují podmíněnost `XᵀX` — pomáhá PCA před regrese.
* **Robustní varianty** — místo MSE použít *Huber loss* nebo absolute deviation (L1 na rezidua) když jsou v datech *outliers*.

::: link "Hastie, Tibshirani, Friedman: ESL kap. 3 — Linear Methods" "https://hastie.su.domains/ElemStatLearn/"
:::

::: link "Stanford CS229: Linear Regression notes" "https://cs229.stanford.edu/notes2022fall/main_notes.pdf"
:::

::: link "scikit-learn — Linear Models dokumentace" "https://scikit-learn.org/stable/modules/linear_model.html"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=2_U-A9tZhb4" "SZZ: Regresní analýza" "Tomáš Kocourek"
:::

::: youtube "https://www.youtube.com/watch?v=nk2CQITm_eo" "Linear Regression, Clearly Explained!!!" "StatQuest with Josh Starmer"
:::

*Zdroj: SUI přednášky 2025/26, *Basics in Machine Learning* (Burget). Externí reference: Bishop, C.: *PRML* (Springer 2006), kap. 3; Hastie, Tibshirani, Friedman: *The Elements of Statistical Learning* (Springer 2009), kap. 3 — [free PDF](https://hastie.su.domains/ElemStatLearn/); Murphy, K.: *Probabilistic ML* (MIT 2022), kap. 11.*
