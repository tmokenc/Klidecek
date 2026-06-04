---
title: Logistická regrese
---

# Logistická regrese

**Logistická regrese** je *diskriminativní* lineární klasifikátor — modeluje přímo `P(c | x)` bez modelování `P(x | c)`. Přes název *regrese* jde o **klasifikační** algoritmus.

## Motivace — proč ne lineární model přímo?

Lineární model `y(x; w) = wᵀx̃` produkuje hodnoty na `(−∞, +∞)` — nemůžeme to interpretovat jako *pravděpodobnost*. Potřebujeme *„zmáčknout"* výstup do `[0, 1]`. K tomu slouží **sigmoid** (logistická funkce):

::: math
\sigma(z) = \frac{1}{1 + e^{-z}}, \quad \sigma: \mathbb{R} \to (0, 1)
:::

::: svg "Sigmoid σ(z) = 1/(1+e^−z). Monotónní S-křivka přes (0, 0.5)."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6" fill="none">
    <line x1="40" y1="95" x2="510" y2="95"/>
    <line x1="275" y1="20" x2="275" y2="160"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="end" font-size="10">
    <text x="36" y="98">0</text>
    <text x="36" y="32">1</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="100" y="110">−4</text>
    <text x="190" y="110">−2</text>
    <text x="360" y="110">2</text>
    <text x="450" y="110">4</text>
    <text x="520" y="98">z</text>
  </g>
  <line x1="40" y1="30" x2="510" y2="30" stroke="var(--line)" stroke-dasharray="3 3"/>
  <path d="M 40 93 C 200 93 230 33 510 33" stroke="var(--accent)" stroke-width="2" fill="none"/>
  <circle cx="275" cy="62" r="3.5" fill="var(--accent)"/>
  <text x="290" y="58" font-size="10" fill="var(--text)">σ(0) = ½</text>
</svg>
:::

Vlastnosti, které využijeme:

* `σ(z) → 0` pro `z → −∞`, `σ(z) → 1` pro `z → +∞`.
* `σ(0) = ½` — práh klasifikace.
* `σ(−z) = 1 − σ(z)` — symetrie kolem `½`.
* Derivace má hezký tvar: `σ'(z) = σ(z) · (1 − σ(z))`.

## Binární logistická regrese

Model:

::: math
P(c = 1 \mid \mathbf{x}) = \sigma(\mathbf{w}^\top \tilde{\mathbf{x}}) = \frac{1}{1 + \exp(-\mathbf{w}^\top \tilde{\mathbf{x}})}
:::

::: math
P(c = 0 \mid \mathbf{x}) = 1 - P(c = 1 \mid \mathbf{x})
:::

* **Decision boundary** je tam, kde `wᵀx̃ = 0` — vždy **lineární** (hyperplocha).
* Strana hyperroviny určuje třídu; *vzdálenost* od ní = jistotu klasifikace.

::: viz logistic-boundary "2D scatter (2 třídy); heatmap σ(wᵀx̃); manuálně táhnout w₀/w₁/w₂ nebo fitovat; decision boundary live."
:::

## Trénování — cross-entropy loss

Trénovací data: `(x_n, t_n)` s `t_n ∈ {0, 1}`. Likelihood:

::: math
P(\mathbf{t} \mid \mathbf{X}, \mathbf{w}) = \prod_{n=1}^{N} y_n^{t_n}(1 - y_n)^{1 - t_n}, \quad y_n = \sigma(\mathbf{w}^\top \tilde{\mathbf{x}}_n)
:::

(když `t_n = 1`, ponecháme jen `y_n`; když `t_n = 0`, ponecháme `1 − y_n`).

Negativní log-likelihood — **binary cross-entropy loss**:

::: math
E(\mathbf{w}) = -\sum_{n=1}^{N} \bigl[t_n \log y_n + (1 - t_n) \log(1 - y_n)\bigr]
:::

Minimalizace = ML odhad. *Konvexní* funkce — globální minimum existuje a je jediné (na rozdíl od neuronek!), ale **neexistuje** uzavřené řešení (jako u lineární regrese). Trénuje se **iterativně** — gradient descent, Newton-Raphson (zde známo jako *Iteratively Reweighted Least Squares*, IRLS).

Gradient má hezký tvar:

::: math
\nabla_{\mathbf{w}} E = \sum_n (y_n - t_n) \tilde{\mathbf{x}}_n = \mathbf{X}^\top (\mathbf{y} - \mathbf{t})
:::

(podobně jako u lineární regrese, jen `y_n` projde sigmoidem).

## Multinomiální logistická regrese (softmax)

Pro `K > 2` tříd používáme **softmax**:

::: math
P(c = k \mid \mathbf{x}) = \frac{\exp(\mathbf{w}_k^\top \tilde{\mathbf{x}})}{\sum_{j=1}^{K} \exp(\mathbf{w}_j^\top \tilde{\mathbf{x}})}
:::

* Každá třída má vlastní vektor vah `w_k`.
* Výstup sumuje na `1`, všechny `≥ 0` → korektní rozdělení.
* Pro `K = 2` se redukuje na binární sigmoid.

Loss: **categorical cross-entropy**:

::: math
E(\mathbf{W}) = -\sum_n \sum_k t_{nk} \log P(c = k \mid \mathbf{x}_n)
:::

(`t_n` je *one-hot* vektor s `1` na pozici správné třídy).

## Diskriminativní vs. generativní — srovnání

| | Gaussovský klasifikátor ([[gaussovsky-klasifikator]]) | Logistická regrese |
| :-- | :--: | :--: |
| Modeluje | `p(x \| c)` + `P(c)` | `P(c \| x)` přímo |
| Předpoklady o `x` | Gaussovské rozdělení | Žádné explicitní |
| Počet parametrů (2D, 2 třídy) | 10 (2× μ: 2 + 2× symetrická Σ: 3) + 1 prior | 3 (w₀, w₁, w₂) |
| Decision boundary | Lineární (`Σ₁=Σ₂`) nebo kvadratická | Lineární |
| Robustnost na špatný model | Špatně — chybný model `p(x \| c)` zhorší výsledek | Lépe — modeluje to, co potřebujeme |
| Funguje s chybějícími featury | Ano (integrace přes chybějící) | Hůř |
| Generuje nové vzorky | Ano | Ne |

**V čem se shodují:** s předpokladem, že `p(x|c)` jsou Gaussy se *stejnou* `Σ`, je generativní gaussovský klasifikátor *speciální případ* lineární logistické regrese (Bishop §4.2.2). Diskriminativní přístup má méně předpokladů a v praxi často vyhrává — *pokud máme dost dat*.

## Vztah k neuronovým sítím

Logistická regrese = **neuronová síť bez skryté vrstvy** s 1 výstupním neuronem (sigmoid pro binární, softmax pro multi-class). Cross-entropy je stejná loss funkce. Trénování je gradient descent.

Když přidáme **skryté vrstvy** mezi vstup a sigmoid, máme **multilayer perceptron** ([[neuron-vrstvy]]) — místo lineárních decision boundaries získáme *libovolně složité*.

## Regularizace

Stejně jako u lineární regrese — L2 (Ridge) nebo L1 (Lasso) penalty na váhy:

::: math
E(\mathbf{w}) = -\sum_n \bigl[t_n \log y_n + (1 - t_n) \log(1 - y_n)\bigr] + \frac{\lambda}{2}\|\mathbf{w}\|^2
:::

V scikit-learn je `LogisticRegression` *defaultně* s L2 regularizací — `C = 1/λ`.

## Praktická poznámka — log-odds (logit) {tier=practice}

Inverze sigmoidu je **log-odds**:

::: math
\log \frac{P(c=1 \mid \mathbf{x})}{P(c=0 \mid \mathbf{x})} = \mathbf{w}^\top \tilde{\mathbf{x}}
:::

Tedy logistická regrese modeluje **logaritmus poměru pravděpodobností** jako lineární funkci vstupu. Tato interpretace je zvláště *populární v epidemiologii a medicíně* (odds ratios, ke kterým se snadno dělají intervaly spolehlivosti).

::: link "Stanford CS229: Logistic Regression notes" "https://cs229.stanford.edu/notes2022fall/main_notes.pdf"
:::

::: link "Bishop: PRML, kap. 4.3 — Probabilistic Discriminative Models" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

::: link "scikit-learn — LogisticRegression dokumentace" "https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=yIYKR4sgzI8" "StatQuest: Logistic Regression" "StatQuest with Josh Starmer"
:::

*Zdroj: SUI přednášky 2025/26, *Basics in Machine Learning* (Burget). Externí reference: Bishop, C.: *PRML* (Springer 2006), kap. 4; Hastie, Tibshirani, Friedman: *The Elements of Statistical Learning* (Springer 2009), kap. 4; Ng, A. & Jordan, M.: *On Discriminative vs. Generative classifiers*, NeurIPS 2002 — [PDF](https://ai.stanford.edu/~ang/papers/nips01-discriminativegenerative.pdf).*
