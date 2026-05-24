---
title: Aktivační a loss funkce
---

# Aktivační a loss funkce

Neuron je `f(W·x + b)` — komponentu `f` zveme **aktivační funkce**, určuje *nelinearitu*. Spolu s **loss funkcí** určují, *co* a *jak rychle* se síť naučí.

## Aktivační funkce

### Vlastnosti, které chceme

* **Nelineární** — abychom vícevrstvý model nebyl jen lineární.
* **Diferencovatelná** (téměř všude) — pro backpropagation.
* **Numericky stabilní** — nevybuchne pro velké vstupy.
* **Levně počitatelná** — provádí se *miliardakrát* za sekundu.

### Klasické varianty

::: svg "Tři klasické aktivační funkce: sigmoid, tanh, ReLU."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.5" fill="none">
    <rect x="20" y="30" width="160" height="140"/>
    <rect x="190" y="30" width="160" height="140"/>
    <rect x="360" y="30" width="160" height="140"/>
    <line x1="20" y1="100" x2="180" y2="100"/>
    <line x1="100" y1="30" x2="100" y2="170"/>
    <line x1="190" y1="100" x2="350" y2="100"/>
    <line x1="270" y1="30" x2="270" y2="170"/>
    <line x1="360" y1="160" x2="520" y2="160"/>
    <line x1="440" y1="30" x2="440" y2="170"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11" font-weight="600">
    <text x="100" y="22">sigmoid σ(z)</text>
    <text x="270" y="22">tanh(z)</text>
    <text x="440" y="22">ReLU max(0,z)</text>
  </g>
  <path d="M 20 162 C 90 162 100 38 180 38" stroke="var(--accent)" stroke-width="2" fill="none"/>
  <path d="M 190 168 C 240 168 270 32 350 32" stroke="var(--accent)" stroke-width="2" fill="none"/>
  <path d="M 360 160 L 440 160 L 520 40" stroke="var(--accent)" stroke-width="2" fill="none"/>
</svg>
:::

#### Sigmoid (logistická)

::: math
\sigma(z) = \frac{1}{1 + e^{-z}}, \quad \sigma'(z) = \sigma(z)(1 - \sigma(z))
:::

* Výstup v `(0, 1)` — *vhodné* pro binární probability.
* **Saturace** pro velká `|z|` → gradient blízko `0` → **vanishing gradient problem** v hlubokých sítích.
* **Output není zero-centered** → suboptimální dynamika SGD.

Dnes se používá *jen* ve výstupní vrstvě pro binární klasifikaci.

#### Hyperbolický tangens

::: math
\tanh(z) = \frac{e^z - e^{-z}}{e^z + e^{-z}}, \quad \tanh'(z) = 1 - \tanh^2(z)
:::

* Výstup v `(−1, 1)` — *zero-centered*. Lepší dynamika než sigmoid.
* **Saturace** pořád problém.

Stále se používá v RNN/LSTM. Pro feed-forward sítě je obvykle dominantní ReLU.

#### ReLU — Rectified Linear Unit

::: math
\text{ReLU}(z) = \max(0, z) = \begin{cases} z & z > 0\\ 0 & z \le 0 \end{cases}
:::

::: math
\text{ReLU}'(z) = \begin{cases} 1 & z > 0\\ 0 & z < 0\\ \text{undef.} & z = 0 \end{cases}
:::

(V `z = 0` se subgradient vybere libovolně, typicky `0`.)

* **Nesaturuje** v pozitivním rozsahu → nesplete vanishing gradient.
* **Velmi rychle počitatelná** — jeden compare + select.
* **Sparse aktivace** — typicky 50 % neuronů je `0`. Implicitně se „regularizuje".
* **Dying ReLU** — pokud neuron uvázne v `z < 0` (negativní bias), jeho gradient je *vždy 0* a neaktualizuje se.

#### Varianty ReLU

* **Leaky ReLU** — `max(0.01·z, z)`. Malý kladný sklon v negativní oblasti.
* **PReLU** (Parametric) — sklon `α` je *naučitelný* parametr.
* **ELU** — `α(e^z − 1)` pro `z < 0`. Zero-centered v limitu.
* **GELU** — `z · Φ(z)`. Smooth varianta. **Standardní v transformerech** (BERT, GPT).
* **Swish / SiLU** — `z · σ(z)`. Mocnější alternativa, používá ji LLaMA.

Empiricky se nejlépe osvědčily **ReLU** (CNN), **GELU/SiLU** (Transformer), **tanh** (LSTM hidden state).

::: viz activation-derivatives "Překryv sigmoid/tanh/ReLU/LeakyReLU/GELU + jejich derivací; hover → hodnoty f a f' v daném z."
:::

## Softmax

Pro **K-class klasifikaci** se použije softmax ve výstupní vrstvě:

::: math
\text{softmax}(z)_k = \frac{e^{z_k}}{\sum_{j=1}^{K} e^{z_j}}
:::

* Výstup je *pravděpodobnostní rozdělení*: `Σ_k softmax(z)_k = 1` a `softmax(z)_k ≥ 0`.
* Generalizace sigmoidu na `K` tříd.
* Pre-aktivace `z_k` se interpretují jako **logits** (log-odds).

**Numerická stabilita**: vždy odečíst `max(z)` před exponencí:

::: math
\text{softmax}(z)_k = \frac{e^{z_k - z_{\max}}}{\sum_j e^{z_j - z_{\max}}}
:::

(matematicky stejné, ale `e^{z_k}` nepřeteče).

## Loss funkce

**Loss function** `L(y, t)` měří *neshodu* mezi predikcí `y` a *desired output* `t`. Trénink = *minimalizace* `L` přes parametry sítě.

### Binární klasifikace — Cross-Entropy

Pro `t ∈ {0, 1}`, výstup `y = σ(z) ∈ (0,1)`:

::: math
L_{\text{BCE}}(y, t) = -[t \log y + (1-t) \log(1-y)]
:::

Toto je *negativní log-likelihood* binární distribuce → ML odhad. Detail v [[logisticka-regrese]].

### Multi-class — Categorical Cross-Entropy

Pro `t ∈ {1..K}` (one-hot encoded), výstup `y = softmax(z) ∈ ∆^K`:

::: math
L_{\text{CE}}(y, t) = -\sum_{k=1}^{K} t_k \log y_k = -\log y_{t}
:::

(když `t` je one-hot, jen jeden `t_k` je `1` — bere se jen ten `log y` na pozici skutečné třídy).

Gradient cross-entropy + softmax má elegantní tvar:

::: math
\frac{\partial L}{\partial z_k} = y_k - t_k
:::

Toto je *přesně* stejné jako u logistické regrese — pre-aktivace gradient se redukuje na (predikce − cíl).

### Regrese — Mean Squared Error (MSE)

Pro `y, t ∈ R`, výstup `y = z` (lineární — žádná aktivace):

::: math
L_{\text{MSE}}(y, t) = \frac{1}{2}(y - t)^2
:::

* ML odhad pro Gaussovský šum (viz [[linearni-regrese]]).
* **Citlivý na outliers** — *velké* rezidua mají kvadraticky velký vliv.

### Regrese — Mean Absolute Error (MAE)

::: math
L_{\text{MAE}}(y, t) = |y - t|
:::

* **Robustní** k outliers.
* Gradient je *konstantní* (`±1`) — nepodporuje rychlou konvergenci v blízkosti optima.

### Regrese — Huber Loss

Kompromis mezi MSE a MAE:

::: math
L_\delta(y, t) = \begin{cases}
\tfrac{1}{2}(y - t)^2 & |y - t| \le \delta\\
\delta |y - t| - \tfrac{1}{2}\delta^2 & |y - t| > \delta
\end{cases}
:::

Kvadratický pro malé chyby, lineární pro velké.

### Multi-label klasifikace

Pro **více současně platných** štítků (např. obrázek může mít *kočku* i *psa*) použijeme `K` *binárních* problémů.

* Výstup: `sigmoid` (nezávisle na každém štítku).
* Loss: **binary cross-entropy** *sečtená* přes štítky.

### Special losses

* **Hinge loss** — SVM-style. `max(0, 1 − t · y)`.
* **Focal loss** — váží *hard examples*. Použito v RetinaNet pro detekci objektů.
* **Contrastive / Triplet loss** — pro reprezentační učení.
* **Wasserstein, KL divergence** — pro generativní modely.

## Pairing aktivace + loss

Pro různé úlohy je *kanonická* dvojice:

| Úloha | Output aktivace | Loss | Důvod |
| :-- | :--: | :--: | :--- |
| Binární klasifikace | Sigmoid | BCE | ML pro Bernoulli |
| Multi-class | Softmax | CE | ML pro Categorical |
| Multi-label | K × Sigmoid | K × BCE | Nezávislé Bernoulli |
| Regrese (Gaussovský šum) | Linear | MSE | ML pro Gauss |
| Regrese (s outliers) | Linear | MAE / Huber | Robustní |
| Klasifikace s diskretizací | Softmax (`K` bins) | CE | Můžeme zachytit multimodální výstup |

**Špatná kombinace** = blbé chování:
* Softmax + MSE = pomalá konvergence (sigmoid-jako gradient).
* Sigmoid + MSE = saturace + plochá oblast = vanishing gradient pro velmi vysoké/nízké výstupy.

## Numerická stabilita

V praxi je *jednoletecká rada*: použij **log-softmax + NLL loss** místo separátního `softmax → log → NLL`. PyTorch má pro to `nn.CrossEntropyLoss()`, který *spojí* obojí:

```python
# ❌ Méně stabilní:
y = softmax(z)
loss = -log(y[target])

# ✓ Stabilnější:
loss = log_softmax(z)[target] * -1   # combined
# nebo:
loss = nn.CrossEntropyLoss()(z, target)
```

Důvod: `log(softmax(z))` se dá *zjednodušit* a *zlogaritmovat* tak, aby se zabránilo přetečení / podtečení.

::: link "Goodfellow et al.: Deep Learning, kap. 6.2 — Output Units and Loss" "https://www.deeplearningbook.org/contents/mlp.html"
:::

::: link "Stanford CS231n: Loss Functions" "https://cs231n.github.io/neural-networks-2/"
:::

::: link "PyTorch dokumentace — Loss functions" "https://pytorch.org/docs/stable/nn.html#loss-functions"
:::

---

*Zdroj: SUI přednášky 2025/26, *Neural networks* (Hradiš). Externí reference: Goodfellow, I., Bengio, Y., Courville, A.: *Deep Learning* (MIT 2016), kap. 6.2; Nair, V., Hinton, G.: *Rectified Linear Units Improve Restricted Boltzmann Machines* (ICML 2010) — původní ReLU; Hendrycks, D., Gimpel, K.: *Gaussian Error Linear Units (GELU)* (2016).*
