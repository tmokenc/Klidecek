---
title: Gradient descent a backpropagation
---

# Gradient descent a backpropagation

Trénování neuronové sítě = **minimalizace** loss funkce `L(θ)` přes parametry `θ = {W_i, b_i}`. *Standardní* nástroj — **gradient descent**.

## Gradient descent — základní krok

::: math
\theta_{t+1} = \theta_t - \alpha \,\nabla_\theta L(\theta_t)
:::

* `θ_t` — aktuální parametry.
* `∇L(θ)` — vektor parciálních derivací loss podle každého parametru.
* `α` (learning rate) — velikost kroku.

Gradient ukazuje **směr nejstrmějšího nárůstu** `L`; *mínus* = sestup. S dostatečně malým `α` se *garantuje* pokles `L` v každém kroku (pro diferencovatelné funkce s nenulovým gradientem; jde o lokální vlastnost). Pro nekonvexní funkce (NN) ale nepředpokládejme globální minimum.

::: svg "Gradient descent: opakované kroky ve směru proti gradientu loss funkce."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.5" fill="none">
    <line x1="40" y1="170" x2="510" y2="170"/>
  </g>
  <path d="M 50 50 C 130 80 200 160 280 168 C 360 175 430 130 510 60" stroke="var(--accent)" stroke-width="2" fill="none"/>
  <g fill="var(--text)">
    <circle cx="100" cy="65" r="4"/>
    <circle cx="135" cy="86" r="4"/>
    <circle cx="170" cy="110" r="4"/>
    <circle cx="210" cy="140" r="4"/>
    <circle cx="250" cy="160" r="4"/>
    <circle cx="280" cy="168" r="5" fill="#e08a3a"/>
  </g>
  <g stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="3 2" fill="none">
    <line x1="100" y1="65" x2="135" y2="86"/>
    <line x1="135" y1="86" x2="170" y2="110"/>
    <line x1="170" y1="110" x2="210" y2="140"/>
    <line x1="210" y1="140" x2="250" y2="160"/>
    <line x1="250" y1="160" x2="280" y2="168"/>
  </g>
  <g fill="var(--text)" font-size="10">
    <text x="100" y="50">θ₀</text>
    <text x="280" y="186">θ*</text>
    <text x="400" y="160">L(θ)</text>
  </g>
</svg>
:::

::: viz gradient-descent-bowl "2D ztrátová plocha (paraboloid / Rosenbrock / sedlo); klikni start → trajektorie GD/Momentum/Adam; α slider."
:::

## Backpropagation — výpočet gradientu

Pro hluboké sítě je `L` *složená* z mnoha vrstev. Gradient `∂L/∂W_i` pro libovolnou vrstvu se počítá *chain rule* (řetězovým pravidlem).

::: math
\frac{\partial L}{\partial W_i} = \frac{\partial L}{\partial h_i} \cdot \frac{\partial h_i}{\partial W_i}
:::

::: math
\frac{\partial L}{\partial h_{i-1}} = \frac{\partial L}{\partial h_i} \cdot \frac{\partial h_i}{\partial h_{i-1}}
:::

**Backpropagation** je *efektivní* algoritmus na výpočet:

1. **Forward pass** — projít síť dopředu, uložit *intermediates* (aktivace každé vrstvy).
2. **Backward pass** — od výstupu zpět, *propagovat* gradienty `∂L/∂h_i`.
3. **Update** — `W_i ← W_i − α · ∂L/∂W_i`.

::: svg "Backprop: gradient se propaguje od loss zpět vrstvami."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="30" y="80" width="80" height="40" rx="4"/>
    <rect x="140" y="80" width="80" height="40" rx="4"/>
    <rect x="250" y="80" width="80" height="40" rx="4"/>
    <rect x="360" y="80" width="80" height="40" rx="4"/>
    <rect x="470" y="80" width="50" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70" y="105">x</text>
    <text x="180" y="105">L₁</text>
    <text x="290" y="105">L₂</text>
    <text x="400" y="105">L₃</text>
    <text x="495" y="105">L</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <line x1="110" y1="100" x2="140" y2="100" marker-end="url(#fwdArr)"/>
    <line x1="220" y1="100" x2="250" y2="100" marker-end="url(#fwdArr)"/>
    <line x1="330" y1="100" x2="360" y2="100" marker-end="url(#fwdArr)"/>
    <line x1="440" y1="100" x2="470" y2="100" marker-end="url(#fwdArr)"/>
  </g>
  <defs>
    <marker id="fwdArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
    <marker id="bwdArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="#cf6660"/>
    </marker>
  </defs>
  <g stroke="#cf6660" stroke-width="1.5" stroke-dasharray="4 3" fill="none">
    <line x1="470" y1="140" x2="440" y2="140" marker-end="url(#bwdArr)"/>
    <line x1="360" y1="140" x2="330" y2="140" marker-end="url(#bwdArr)"/>
    <line x1="250" y1="140" x2="220" y2="140" marker-end="url(#bwdArr)"/>
    <line x1="140" y1="140" x2="110" y2="140" marker-end="url(#bwdArr)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10" font-weight="600">
    <text x="270" y="70">forward pass — aktivace</text>
    <text x="270" y="170" fill="#cf6660">backward pass — gradienty</text>
  </g>
</svg>
:::

### Příklad — 2-vrstvá síť

Síť: `y = f₂(W₂ · f₁(W₁ x))`. Loss `L = ½(y − t)²`.

Forward:
* `h₁ = f₁(W₁ x)`
* `y = f₂(W₂ h₁)`
* `L = ½(y − t)²`

Backward:
* `∂L/∂y = y − t`
* `∂L/∂W₂ = (∂L/∂y) · f₂'(z₂) · h₁ᵀ`   (kde `z₂ = W₂ h₁`)
* `∂L/∂h₁ = W₂ᵀ · (∂L/∂y) · f₂'(z₂)`
* `∂L/∂W₁ = (∂L/∂h₁) · f₁'(z₁) · xᵀ`   (kde `z₁ = W₁ x`)

Detail v Goodfellow Kap. 6.5 (Backprop) a Stanford CS231n.

### Computational complexity

* **Forward pass**: `O(P)` operací, kde `P` = počet parametrů.
* **Backward pass**: také `O(P)` — pro každý forward step máme *jeden* backward step.

Tedy gradient celé loss vůči *všem* `P` parametrům trvá `2× P` operací — řádově. Bez backpropu by *naivní* numerická derivace stála `O(P²)`. **To je důvod, proč můžeme trénovat sítě s miliardami parametrů**.

::: viz backprop-chain "Malá MLP 2-2-1; krok-po-kroku řetězové pravidlo zpětně; gradient na hraně se odhalí postupně."
:::

::: viz vanishing-gradient-depth "Deep MLP; gradient na vstupní vrstvě v log-měřítku; sigmoid → mizí, ReLU → projde, +BN stabilizuje."
:::

## Automatická diferenciace

Backprop se *neimplementuje ručně*. Frameworky (PyTorch, TF, JAX) dělají **automatic differentiation** (autograd):

1. Pro každou operaci znají *symbolic* nebo *forward-mode* derivaci.
2. Po forward pass mají *computational graph*.
3. Backward pass je traversace tohoto grafu *opačným směrem* s aplikací chain rule.

```python
import torch
x = torch.tensor([1.0, 2.0], requires_grad=True)
y = (x ** 2).sum()
y.backward()             # gradient yi/dx_i = 2*x_i
print(x.grad)            # → tensor([2., 4.])
```

## Mini-batch stochastic gradient descent (SGD)

Tréninková sada má typicky `N = 10⁵−10⁸` vzorků. Spočítat *přesný* gradient `∇L = (1/N) Σ ∇L_i` je *nákladné*.

**Stochastic gradient descent**: na každém kroku použijeme `B` (mini-batch) vzorků:

::: math
\theta_{t+1} = \theta_t - \alpha \cdot \frac{1}{B}\sum_{i \in \text{batch}} \nabla L_i(\theta_t)
:::

* **Šum v gradientu** je *užitečný* — pomáhá vystoupit z lokálního minima.
* **Velikost batche** `B` — typicky `32, 64, 128, 256`. Větší = stabilnější gradient, ale méně updates per epocha.
* **Epocha** — průchod celého trénovacího setu.

Toto je *de facto* standard pro trénink NN. Plain GD (`B = N`) se používá *jen* pro malé datasety nebo teoretické úvahy.

## Learning rate — kritický hyperparametr

::: svg "Vliv learning rate: moc velký diverguje, moc malý je pomalý, dobře nastavený konverguje."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.5" fill="none">
    <rect x="20" y="20" width="160" height="140"/>
    <rect x="190" y="20" width="160" height="140"/>
    <rect x="360" y="20" width="160" height="140"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600" font-size="11">
    <text x="100" y="14">α moc malé</text>
    <text x="270" y="14">α dobře</text>
    <text x="440" y="14">α moc velké</text>
  </g>
  <g stroke="var(--accent)" stroke-width="2" fill="none">
    <path d="M 25 130 C 70 125 100 110 175 95"/>
    <path d="M 195 130 C 215 130 250 70 345 35"/>
    <path d="M 365 130 L 380 60 L 395 130 L 410 50 L 425 130 L 440 30 L 455 130 L 470 20"/>
  </g>
  <g fill="var(--text-muted)" font-size="9" text-anchor="middle">
    <text x="100" y="172">pomalá konvergence</text>
    <text x="270" y="172">rychlá konvergence</text>
    <text x="440" y="172">divergence</text>
  </g>
</svg>
:::

* **Moc velké `α`** — diverguje, loss roste.
* **Moc malé `α`** — pomalá konvergence, plýtvání času.
* **Optimální `α`** — empirické. Začněte s `1e-3` (Adam), `1e-2` (SGD), pak ladit logaritmicky.

### Learning rate schedule

Místo konstantního `α` se obvykle s časem *snižuje*:

* **Step decay** — `α ← α / 10` po každých `K` epochách.
* **Cosine annealing** — `α` klesá podle kosinu od `α_max` do `α_min`.
* **Warmup** — na začátku se `α` *zvyšuje* po několik kroků (důležité u Adam + Transformer).

## Adaptive optimizers

SGD má *všem parametrům* stejné `α`. Reálné gradienty mají *různou velikost*:

### Momentum

::: math
v_t = \beta v_{t-1} + \nabla L(\theta_t), \quad \theta_{t+1} = \theta_t - \alpha v_t
:::

* *Setrvačnost* — kumulativní gradient.
* Pomáhá *projet* lokální plochy.
* `β = 0.9` typicky.

### Adam (Adaptive Moment Estimation, Kingma & Ba 2014)

Nejpoužívanější optimizer dnes.

::: math
m_t = \beta_1 m_{t-1} + (1-\beta_1)\nabla L
:::

::: math
v_t = \beta_2 v_{t-1} + (1-\beta_2)(\nabla L)^2
:::

::: math
\hat{m}_t = m_t / (1-\beta_1^t), \quad \hat{v}_t = v_t / (1-\beta_2^t)
:::

::: math
\theta_{t+1} = \theta_t - \alpha \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon}
:::

* `m`, `v` — exponenciálně-vážené průměry gradientu a *kvadrátu* gradientu.
* `β₁ = 0.9, β₂ = 0.999, ε = 10⁻⁸` — defaultní.
* **Per-parameter learning rate** — parametry s velkými gradienty dostanou *menší* effective `α`.

### Další optimizery

* **AdaGrad** — akumulace `g²` (problém: rate klesá k 0).
* **RMSprop** — exp. average `g²`.
* **AdamW** — Adam + decoupled weight decay.
* **LAMB, LARS** — pro velmi velké batche (pre-training LLM).

## Praktický workflow

```python
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
for epoch in range(num_epochs):
    for batch_x, batch_y in train_loader:
        optimizer.zero_grad()                    # vynuluj akumulované gradienty
        y_pred = model(batch_x)                  # forward
        loss = criterion(y_pred, batch_y)        # loss
        loss.backward()                          # backward = autograd
        optimizer.step()                         # update parameters
```

Pět řádků pokrývá *všechno* podstatné. Reálné `train` smyčky mají navíc *validation*, *logging*, *checkpointing*, *LR scheduling*.

## Klíčové problémy

* **Vanishing gradient** — v hlubokých sítích se gradienty saturujícími aktivacemi (sigmoid, tanh) zmenšují *exponenciálně* s hloubkou. ReLU a *batch normalization* to mitigují.
* **Exploding gradient** — opačný problém, hlavně v RNN. **Gradient clipping** (`||g|| ≤ τ`) jako řešení.
* **Plateau** — gradient malý, ale nejsme v minimu. Adaptive optimizers (Adam) pomáhají.
* **Saddle points** — vysokodimenzionální landscape má mnoho sedlových bodů. Random šum SGD + momentum je překonává.

::: link "Goodfellow et al.: Deep Learning, kap. 6.5 (Backprop), kap. 8 (Optimization)" "https://www.deeplearningbook.org/contents/optimization.html"
:::

::: link "Kingma, D., Ba, J.: Adam — A Method for Stochastic Optimization (ICLR 2015)" "https://arxiv.org/abs/1412.6980"
:::

::: link "Rumelhart, Hinton, Williams: Learning representations by back-propagating errors (Nature, 1986)" "https://www.nature.com/articles/323533a0"
:::

::: link "Sebastian Ruder: An overview of gradient descent optimization algorithms" "https://www.ruder.io/optimizing-gradient-descent/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Neural networks* (Hradiš). Externí reference: Goodfellow, I., Bengio, Y., Courville, A.: *Deep Learning* (MIT 2016), kap. 6.5 + 8; Rumelhart, D., Hinton, G., Williams, R.: *Learning representations by back-propagating errors* (Nature 323, 1986); Kingma, D. & Ba, J.: *Adam — A Method for Stochastic Optimization* (ICLR 2015); Bottou, L.: *Stochastic Gradient Descent Tricks* (2012).*
