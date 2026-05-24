---
title: Neuron, vrstvy a výpočetní graf
---

# Neuron, vrstvy a výpočetní graf

**Neuronová síť** (NN) je *flexibilní* (a výpočetně náročný) parametrický model, který umí *aproximovat* širokou třídu funkcí. Naučí se převod vstupu na výstup z trénovacích dat.

## Co je neuron

Inspirace **biologickým** neuronem: vstupy přicházejí přes synapse, jádro je integruje, axon vyšle signál ven. Matematický model (*McCulloch-Pitts*, 1943):

::: math
y = f\!\left(\sum_{i=1}^{D} w_i x_i + b\right) = f(\mathbf{w}^\top \mathbf{x} + b)
:::

* `x = (x₁, ..., x_D)` — vstupy.
* `w = (w₁, ..., w_D)` — váhy (trénovatelné).
* `b` — bias.
* `f` — *aktivační funkce* (nelineární). Detail v [[aktivace-loss]].

::: svg "Neuron: vstupy násobené váhami, suma + bias, aktivační funkce."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <circle cx="50" cy="50" r="14"/>
    <circle cx="50" cy="100" r="14"/>
    <circle cx="50" cy="150" r="14"/>
    <circle cx="280" cy="100" r="24"/>
    <circle cx="450" cy="100" r="18"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="50" y="54" font-size="11">x₁</text>
    <text x="50" y="104" font-size="11">x₂</text>
    <text x="50" y="154" font-size="11">x₃</text>
    <text x="280" y="104" font-size="12">Σ + b</text>
    <text x="450" y="105" font-size="12">f</text>
    <text x="510" y="104" font-size="11" font-weight="600">y</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="64" y1="50" x2="258" y2="92"/>
    <line x1="64" y1="100" x2="256" y2="100"/>
    <line x1="64" y1="150" x2="258" y2="108"/>
    <line x1="304" y1="100" x2="432" y2="100"/>
    <line x1="468" y1="100" x2="500" y2="100"/>
  </g>
  <g fill="var(--text-muted)" font-size="9.5" text-anchor="middle">
    <text x="155" y="62">w₁</text>
    <text x="155" y="98">w₂</text>
    <text x="155" y="142">w₃</text>
    <text x="370" y="93">pre-activation</text>
  </g>
</svg>
:::

### Geometrická interpretace

Lineární kombinace `w^T x + b` je **hyperrovina** v `R^D`. Bod `x` má hodnotu *kladnou* na jedné straně, *zápornou* na druhé, *nulu* přímo na hyperrovině. Neuron je tedy „lineární detektor + nelinearita".

Pokud `f` je sigmoid, dostaneme **logistickou regresi** ([[logisticka-regrese]]). Tedy *jeden neuron* = lineární klasifikátor.

## Proč potřebujeme nelinearitu

Pokud bychom skládali *lineární* operace bez aktivační funkce:

::: math
\mathbf{y} = W_2 (W_1 \mathbf{x} + \mathbf{b}_1) + \mathbf{b}_2 = (W_2 W_1) \mathbf{x} + (W_2 \mathbf{b}_1 + \mathbf{b}_2)
:::

Výsledek je *opět* lineární — žádná výhoda hloubky.

Po vsunutí **nelinearity** `f` (sigmoid, ReLU, ...) může vícevrstvá síť aproximovat *libovolnou* spojitou funkci (Universal Approximation Theorem, Cybenko 1989, Hornik 1991).

## Vrstvy

Místo jednotlivého neuronu řešíme **vrstvu** — *více* neuronů sdílejících vstup.

::: svg "Feed-forward síť: vstupní vektor → 2 skryté vrstvy → výstupní vrstva."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <circle cx="60" cy="50" r="12"/>
    <circle cx="60" cy="100" r="12"/>
    <circle cx="60" cy="150" r="12"/>
    <circle cx="200" cy="40" r="12"/>
    <circle cx="200" cy="90" r="12"/>
    <circle cx="200" cy="140" r="12"/>
    <circle cx="200" cy="190" r="12"/>
    <circle cx="340" cy="70" r="12"/>
    <circle cx="340" cy="130" r="12"/>
    <circle cx="340" cy="190" r="12"/>
    <circle cx="480" cy="100" r="14"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="60" y="14">Input</text>
    <text x="60" y="180">x ∈ R³</text>
    <text x="200" y="14">Hidden L1</text>
    <text x="200" y="216">h₁ = f(W₁x + b₁)</text>
    <text x="340" y="40">Hidden L2</text>
    <text x="340" y="216">h₂ = f(W₂h₁ + b₂)</text>
    <text x="480" y="70">Output</text>
    <text x="480" y="216">y</text>
  </g>
  <g stroke="var(--accent)" stroke-width="0.5" fill="none" opacity="0.6">
    <line x1="72" y1="50" x2="188" y2="40"/>
    <line x1="72" y1="50" x2="188" y2="90"/>
    <line x1="72" y1="50" x2="188" y2="140"/>
    <line x1="72" y1="50" x2="188" y2="190"/>
    <line x1="72" y1="100" x2="188" y2="40"/>
    <line x1="72" y1="100" x2="188" y2="90"/>
    <line x1="72" y1="100" x2="188" y2="140"/>
    <line x1="72" y1="100" x2="188" y2="190"/>
    <line x1="72" y1="150" x2="188" y2="40"/>
    <line x1="72" y1="150" x2="188" y2="90"/>
    <line x1="72" y1="150" x2="188" y2="140"/>
    <line x1="72" y1="150" x2="188" y2="190"/>
    <line x1="212" y1="40" x2="328" y2="70"/>
    <line x1="212" y1="40" x2="328" y2="130"/>
    <line x1="212" y1="40" x2="328" y2="190"/>
    <line x1="212" y1="90" x2="328" y2="70"/>
    <line x1="212" y1="90" x2="328" y2="130"/>
    <line x1="212" y1="90" x2="328" y2="190"/>
    <line x1="212" y1="140" x2="328" y2="70"/>
    <line x1="212" y1="140" x2="328" y2="130"/>
    <line x1="212" y1="140" x2="328" y2="190"/>
    <line x1="212" y1="190" x2="328" y2="70"/>
    <line x1="212" y1="190" x2="328" y2="130"/>
    <line x1="212" y1="190" x2="328" y2="190"/>
    <line x1="352" y1="70" x2="466" y2="100"/>
    <line x1="352" y1="130" x2="466" y2="100"/>
    <line x1="352" y1="190" x2="466" y2="100"/>
  </g>
</svg>
:::

* **Input layer** — vstup `x ∈ R^D`. Nemá parametry, jen *vstupní hodnoty*.
* **Hidden layer(s)** — vnitřní vrstvy. *Skryté* — nevidíme jejich aktivace zvenčí.
* **Output layer** — výstup `y ∈ R^K` (klasifikace: pravděpodobnosti; regrese: hodnoty).

**Plně-propojená (fully-connected, dense) vrstva**: každý neuron vrstvy `L+1` je napojen na *každý* neuron vrstvy `L`.

## Maticová reprezentace

Místo individuálních neuronů se výpočet vrstvy zapíše jako *jedno násobení matic*:

::: math
\mathbf{h} = f(W \mathbf{x} + \mathbf{b})
:::

kde

* `x ∈ R^D` — vstup do vrstvy.
* `W ∈ R^{H × D}` — matice vah; *řádek* `i` = váhy `i`-tého neuronu.
* `b ∈ R^H` — bias vektor.
* `f` — aktivační funkce *elementwise*.
* `h ∈ R^H` — výstup vrstvy.

Toto je **klíčový kompromis efektivity** — místo `H × D` skalárních násobení uděláme *jediné* maticové násobení. *Optimalizované* knihovny (BLAS, cuBLAS) toto zvládají s *blízkostí teoretickému CPU/GPU peaku*.

### Batch processing

Pro `N` vstupů najednou (mini-batch):

::: math
H = f(X W^\top + \mathbf{1} \mathbf{b}^\top), \quad X \in \mathbb{R}^{N \times D},\ H \in \mathbb{R}^{N \times H}
:::

Toto **paralelizuje** zpracování přes `N` vzorků — důležité pro GPU.

## Více vrstev — feed-forward síť

Vrstvy se *skládají*:

::: math
\mathbf{h}_1 = f(W_1 \mathbf{x} + \mathbf{b}_1)
:::

::: math
\mathbf{h}_2 = f(W_2 \mathbf{h}_1 + \mathbf{b}_2)
:::

::: math
\dots
:::

::: math
\mathbf{y} = f(W_L \mathbf{h}_{L-1} + \mathbf{b}_L)
:::

Celá síť je *kompozice* lineárních operací s nelinearitami. Trénovatelné parametry: `{W_i, b_i}` pro každou vrstvu — typické moderní modely mají *miliardy* parametrů.

### Hloubka vs. šířka

* **Široká** síť (jedna velká vrstva) — má dostatek parametrů, ale složitější funkce vyžaduje *exponenciálně* mnoho neuronů.
* **Hluboká** síť (mnoho menších vrstev) — *kompozice* funkcí umožňuje *exponenciálně efektivnější* reprezentaci.

Tento jev se nazývá **„hloubka vyhrává"** a je teoreticky studován (depth separation theorems).

## Výpočetní graf

::: svg "Výpočetní graf: každý uzel je operace, hrany jsou tensory. Backprop je propagace gradientů zpět."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="60" cy="60" r="14"/>
    <circle cx="60" cy="140" r="14"/>
    <circle cx="180" cy="100" r="16"/>
    <circle cx="300" cy="100" r="16"/>
    <circle cx="430" cy="100" r="16"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="60" y="64">x</text>
    <text x="60" y="144">W</text>
    <text x="180" y="104">×</text>
    <text x="300" y="104">+b</text>
    <text x="430" y="104">f</text>
    <text x="500" y="104" font-weight="600">y</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="74" y1="60" x2="166" y2="92"/>
    <line x1="74" y1="140" x2="166" y2="108"/>
    <line x1="196" y1="100" x2="284" y2="100"/>
    <line x1="316" y1="100" x2="414" y2="100"/>
    <line x1="446" y1="100" x2="490" y2="100"/>
  </g>
  <g stroke="#cf6660" stroke-width="1.2" stroke-dasharray="4 3" fill="none">
    <line x1="490" y1="115" x2="446" y2="115"/>
    <line x1="414" y1="115" x2="316" y2="115"/>
    <line x1="284" y1="115" x2="196" y2="115"/>
    <line x1="166" y1="123" x2="74" y2="155"/>
    <line x1="166" y1="115" x2="74" y2="75"/>
  </g>
  <g fill="#cf6660" font-size="9" text-anchor="middle">
    <text x="100" y="180">backward pass (gradienty)</text>
  </g>
</svg>
:::

Síť představíme jako **graph** operací — *forward pass* je dopředný směr. **Backward pass** ([[gradient-descent]]) propaguje gradienty *zpět* pro update parametrů.

Frameworky jako **PyTorch**, **TensorFlow**, **JAX** automaticky:

1. **Konstrukce grafu** během forward pass (PyTorch *dynamic*, TF/JAX kombinace dynamic+static).
2. **Automatická diferenciace** — pro každou operaci znají *partial derivatives*; aplikují *chain rule* pro celý graf.
3. **GPU acceleration** — operace jsou implementovány v CUDA kernelech.

## Co dokáže neuronka

* **Klasifikace** — sigmoid (binární), softmax (multi-class) výstup.
* **Regrese** — lineární výstup, MSE loss.
* **Strukturní predikce** — sekvence (RNN/Transformer), grafy (GNN), obrázky (CNN).
* **Reprezentace** — embedding vrstvy bez explicitního výstupu.
* **Generování** — VAE, GAN, diffusion, autoregressivní LLM.
* **Reinforcement learning** — policy a value network.

Detail jednotlivých typů v dalších kapitolách.

## Praktická poznámka — *naivní* implementace

Pythonská reference (bez optimalizace):

```python
class FCLayer:
    def __init__(self, D_in, D_out):
        self.W = np.random.randn(D_out, D_in) * sqrt(2/D_in)   # He init
        self.b = np.zeros(D_out)
    def forward(self, x):
        self.x = x
        return relu(self.W @ x + self.b)
    def backward(self, grad_out):
        grad_pre = grad_out * (self.W @ self.x + self.b > 0)   # ReLU derivative
        grad_W = np.outer(grad_pre, self.x)
        grad_x = self.W.T @ grad_pre
        return grad_x, grad_W, grad_pre  # grad_pre is grad_b
```

Reálná implementace v PyTorch je *kratší a rychlejší*:

```python
import torch.nn as nn
layer = nn.Linear(D_in, D_out)
y = layer(x)
```

::: link "Goodfellow, Bengio, Courville: Deep Learning, kap. 6 — Feedforward Networks" "https://www.deeplearningbook.org/contents/mlp.html"
:::

::: link "Stanford CS231n: Neural Networks Part 1" "https://cs231n.github.io/neural-networks-1/"
:::

::: link "PyTorch tutorial — Neural Networks" "https://pytorch.org/tutorials/beginner/blitz/neural_networks_tutorial.html"
:::

---

*Zdroj: SUI přednášky 2025/26, *Neural networks* (Hradiš). Externí reference: Goodfellow, I., Bengio, Y., Courville, A.: *Deep Learning* (MIT 2016), kap. 6 — [free book](https://www.deeplearningbook.org/); Nielsen, M.: *Neural Networks and Deep Learning* — [free book](http://neuralnetworksanddeeplearning.com/); Stanford CS231n materials.*
