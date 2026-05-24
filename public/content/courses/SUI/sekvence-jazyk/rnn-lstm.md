---
title: Recurrent Neural Networks — RNN, LSTM, GRU
---

# Recurrent Neural Networks

**RNN** zpracovávají *sekvence* — text, řeč, časové řady. Místo zpracování celého vstupu najednou, *iterují* přes prvky sekvence s udržováním vnitřního *stavu*.

## Motivace — proč ne klasická síť

Klasická feed-forward síť má **fixní** velikost vstupu a výstupu. Pro:

* **Variabilní délka** vstupu (věty různé délky).
* **Sekvenční závislosti** — slovo závisí na předcházejícím kontextu.
* **Strukturní výstupy** — překlad, generování.

Potřebujeme architekturu s **pamětí**.

## Vanilla RNN

::: svg "RNN přijímá vstupy v sekvenci, udržuje hidden state h, který se aktualizuje a šíří v čase."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40" y="80" width="60" height="40" rx="4"/>
    <rect x="160" y="80" width="60" height="40" rx="4"/>
    <rect x="280" y="80" width="60" height="40" rx="4"/>
    <rect x="400" y="80" width="60" height="40" rx="4"/>
    <circle cx="70" cy="160" r="14"/>
    <circle cx="190" cy="160" r="14"/>
    <circle cx="310" cy="160" r="14"/>
    <circle cx="430" cy="160" r="14"/>
    <circle cx="70" cy="40" r="14"/>
    <circle cx="190" cy="40" r="14"/>
    <circle cx="310" cy="40" r="14"/>
    <circle cx="430" cy="40" r="14"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70" y="105" font-weight="600">h₁</text>
    <text x="190" y="105" font-weight="600">h₂</text>
    <text x="310" y="105" font-weight="600">h₃</text>
    <text x="430" y="105" font-weight="600">h₄</text>
    <text x="70" y="164" font-size="11">x₁</text>
    <text x="190" y="164" font-size="11">x₂</text>
    <text x="310" y="164" font-size="11">x₃</text>
    <text x="430" y="164" font-size="11">x₄</text>
    <text x="70" y="44" font-size="11">y₁</text>
    <text x="190" y="44" font-size="11">y₂</text>
    <text x="310" y="44" font-size="11">y₃</text>
    <text x="430" y="44" font-size="11">y₄</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="70" y1="146" x2="70" y2="120" marker-end="url(#rnnArr)"/>
    <line x1="190" y1="146" x2="190" y2="120" marker-end="url(#rnnArr)"/>
    <line x1="310" y1="146" x2="310" y2="120" marker-end="url(#rnnArr)"/>
    <line x1="430" y1="146" x2="430" y2="120" marker-end="url(#rnnArr)"/>
    <line x1="70" y1="80" x2="70" y2="54" marker-end="url(#rnnArr)"/>
    <line x1="190" y1="80" x2="190" y2="54" marker-end="url(#rnnArr)"/>
    <line x1="310" y1="80" x2="310" y2="54" marker-end="url(#rnnArr)"/>
    <line x1="430" y1="80" x2="430" y2="54" marker-end="url(#rnnArr)"/>
    <line x1="100" y1="100" x2="160" y2="100" marker-end="url(#rnnArr)"/>
    <line x1="220" y1="100" x2="280" y2="100" marker-end="url(#rnnArr)"/>
    <line x1="340" y1="100" x2="400" y2="100" marker-end="url(#rnnArr)"/>
  </g>
  <defs>
    <marker id="rnnArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="130" y="94">h₁ → h₂</text>
    <text x="250" y="94">h₂ → h₃</text>
    <text x="370" y="94">h₃ → h₄</text>
  </g>
</svg>
:::

Vanilla RNN cell:

::: math
\mathbf{h}_t = \tanh(W_{xh} \mathbf{x}_t + W_{hh} \mathbf{h}_{t-1} + \mathbf{b}_h)
:::

::: math
\mathbf{y}_t = W_{hy} \mathbf{h}_t + \mathbf{b}_y
:::

* `x_t` — vstup v čase `t`.
* `h_t` — hidden state. *Paměť* sítě.
* `y_t` — výstup v čase `t`.
* `W_xh, W_hh, W_hy` — **sdílené** parametry přes všechny časové kroky.

Sdílení vah je klíčové — *jeden* model funguje pro libovolnou délku sekvence.

## Trénink — Backpropagation Through Time (BPTT)

RNN se *rozbalí* do feed-forward grafu přes T časových kroků (unfolding). Pak backprop přes celý rozbalený graf.

* **Sdílení vah** — gradienty pro stejné `W` se *sčítají* přes všechny kroky.
* **Truncated BPTT** — pro velmi dlouhé sekvence se rozbalí jen `k` posledních kroků (omezení paměti).

### Problémy

* **Vanishing gradient** — gradient `∂L/∂h_t` pro brzké kroky `t` se *exponenciálně zmenšuje* (kvůli opakovanému násobení `W_hh` a derivace tanh).
* **Exploding gradient** — opačný problém, pokud spektrální norma `W_hh > 1`. **Gradient clipping** (`||g|| ≤ τ`) jako fix.

Vanilla RNN se prakticky používá *jen* pro krátké sekvence (`< 20 kroků`).

::: viz rnn-unroll-bptt "Unrolled RNN přes T kroků; přepínač režimu (vanishing / stable / exploding) a aktivace (sigmoid/tanh/linear); BPTT gradient vidíte v log-měřítku."
:::

## LSTM — Long Short-Term Memory

**Hochreiter & Schmidhuber (1997)**. Řeší vanishing gradient explicitně přes *bránové mechanismy*.

::: svg "LSTM cell: 3 brány (input, forget, output) řídí flow informace přes cell state c_t."
<svg viewBox="0 0 540 230" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="60" y="40" width="420" height="160" rx="8"/>
    <circle cx="180" cy="100" r="16"/>
    <circle cx="270" cy="100" r="16"/>
    <circle cx="360" cy="100" r="16"/>
    <circle cx="270" cy="170" r="16"/>
    <line x1="60" y1="70" x2="480" y2="70" stroke="#e08a3a" stroke-width="2.5"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="180" y="104">×</text>
    <text x="270" y="104">+</text>
    <text x="360" y="104">×</text>
    <text x="270" y="174">tanh</text>
    <text x="180" y="180" font-size="10">forget gate</text>
    <text x="270" y="146" font-size="10">input gate</text>
    <text x="360" y="180" font-size="10">output gate</text>
  </g>
  <g fill="#e08a3a" font-size="11" text-anchor="middle">
    <text x="40" y="74" font-weight="600">c_{t-1}</text>
    <text x="510" y="74" font-weight="600">c_t</text>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="40" y="200" font-weight="600">h_{t-1}</text>
    <text x="510" y="200" font-weight="600">h_t</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="180" y1="116" x2="180" y2="70"/>
    <line x1="270" y1="116" x2="270" y2="70"/>
    <line x1="360" y1="116" x2="360" y2="70"/>
    <line x1="50" y1="180" x2="240" y2="100" stroke-dasharray="3 2"/>
    <line x1="50" y1="180" x2="270" y2="170" stroke-dasharray="3 2"/>
    <line x1="50" y1="180" x2="360" y2="170" stroke-dasharray="3 2"/>
  </g>
  <text x="270" y="225" text-anchor="middle" font-size="10" fill="var(--text-muted)">Cell state c_t protéká přes 'highway' s gating mechanismem.</text>
</svg>
:::

### Rovnice LSTM

* **Forget gate** — co *zapomenout* z `c_{t-1}`:

::: math
\mathbf{f}_t = \sigma(W_f [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_f)
:::

* **Input gate** — co *přidat* do `c_t`:

::: math
\mathbf{i}_t = \sigma(W_i [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_i)
:::

::: math
\tilde{\mathbf{c}}_t = \tanh(W_c [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_c)
:::

* **Update cell state**:

::: math
\mathbf{c}_t = \mathbf{f}_t \odot \mathbf{c}_{t-1} + \mathbf{i}_t \odot \tilde{\mathbf{c}}_t
:::

* **Output gate** — co *vystoupit*:

::: math
\mathbf{o}_t = \sigma(W_o [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_o)
:::

::: math
\mathbf{h}_t = \mathbf{o}_t \odot \tanh(\mathbf{c}_t)
:::

* `σ` — sigmoid (gating, `(0, 1)`).
* `⊙` — element-wise násobení.
* `[h, x]` — konkatenace.

### Proč LSTM funguje

* **Cell state `c_t`** je *additivně* aktualizován (`c_t = f_t·c_{t-1} + i_t·c̃_t`).
* Pokud `f_t ≈ 1` a `i_t ≈ 0`, `c_t ≈ c_{t-1}` — informace *protéká neporušená*.
* **Gradient nevanishne** přes cell state highway — `∂c_t / ∂c_{t-1} = f_t`, ne kombinace tanh/W.

LSTM dokáže udržet informaci přes *stovky* časových kroků.

## GRU — Gated Recurrent Unit

**Cho et al. (2014)**. Zjednodušená LSTM se 2 bránami místo 3:

::: math
\mathbf{r}_t = \sigma(W_r [\mathbf{h}_{t-1}, \mathbf{x}_t])
:::

::: math
\mathbf{z}_t = \sigma(W_z [\mathbf{h}_{t-1}, \mathbf{x}_t])
:::

::: math
\tilde{\mathbf{h}}_t = \tanh(W_h [\mathbf{r}_t \odot \mathbf{h}_{t-1}, \mathbf{x}_t])
:::

::: math
\mathbf{h}_t = (1 - \mathbf{z}_t) \odot \mathbf{h}_{t-1} + \mathbf{z}_t \odot \tilde{\mathbf{h}}_t
:::

* `r_t` — *reset* gate. Co zapomenout z `h_{t-1}`.
* `z_t` — *update* gate. Kolik nové vs. staré informace v `h_t`.

GRU je **rychlejší** (méně parametrů) a často *srovnatelná* s LSTM v výkonu.

## Bidirectional RNN

Pro úlohy, kde *celá* sekvence je dostupná dopředu (text classification, named entity recognition), můžeme zpracovat sekvenci *oběma směry*:

* **Forward RNN** — `→ h_t` zleva doprava.
* **Backward RNN** — `← h_t` zprava doleva.
* **Combined** — `h_t = [→h_t, ←h_t]`.

::: svg "Bidirectional RNN: dvě RNN procházejí sekvenci opačnými směry, výstupy se kombinují."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40" y="40" width="60" height="30" rx="4"/>
    <rect x="160" y="40" width="60" height="30" rx="4"/>
    <rect x="280" y="40" width="60" height="30" rx="4"/>
    <rect x="400" y="40" width="60" height="30" rx="4"/>
    <rect x="40" y="100" width="60" height="30" rx="4"/>
    <rect x="160" y="100" width="60" height="30" rx="4"/>
    <rect x="280" y="100" width="60" height="30" rx="4"/>
    <rect x="400" y="100" width="60" height="30" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="70" y="60">→h₁</text>
    <text x="190" y="60">→h₂</text>
    <text x="310" y="60">→h₃</text>
    <text x="430" y="60">→h₄</text>
    <text x="70" y="120">←h₁</text>
    <text x="190" y="120">←h₂</text>
    <text x="310" y="120">←h₃</text>
    <text x="430" y="120">←h₄</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="100" y1="55" x2="160" y2="55" marker-end="url(#bidirArr1)"/>
    <line x1="220" y1="55" x2="280" y2="55" marker-end="url(#bidirArr1)"/>
    <line x1="340" y1="55" x2="400" y2="55" marker-end="url(#bidirArr1)"/>
    <line x1="160" y1="115" x2="100" y2="115" marker-end="url(#bidirArr2)"/>
    <line x1="280" y1="115" x2="220" y2="115" marker-end="url(#bidirArr2)"/>
    <line x1="400" y1="115" x2="340" y2="115" marker-end="url(#bidirArr2)"/>
  </g>
  <defs>
    <marker id="bidirArr1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
    <marker id="bidirArr2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="70" y="160">x₁</text>
    <text x="190" y="160">x₂</text>
    <text x="310" y="160">x₃</text>
    <text x="430" y="160">x₄</text>
  </g>
</svg>
:::

**Pozor**: pro úlohy *online* (real-time predikce, generování) **nelze** bidirectional použít — budoucí kontext není k dispozici.

## Stacked / Deep RNN

Stack více RNN vrstev:

```
y_t^(1) = RNN_1(x_t, y_{t-1}^(1))
y_t^(2) = RNN_2(y_t^(1), y_{t-1}^(2))
y_t^(3) = RNN_3(y_t^(2), y_{t-1}^(3))
```

Vyšší vrstvy zachycují *abstraktnější* závislosti, stejně jako u CNN.

## Aplikace RNN

### One-to-many

Vstup je *jediný*, výstup *sekvence*.

* **Image captioning** — z obrázku generuj větu.

### Many-to-one

Vstup *sekvence*, výstup *jediný*.

* **Sentiment analysis** — text → pozitivní/negativní.
* **Speech command** — audio → třída akce.

### Many-to-many (synchronní)

Stejná délka vstupu a výstupu.

* **Word tagging** — pro každé slovo predikuj POS tag, NER tag.

### Many-to-many (asynchronní, seq2seq)

Vstup a výstup mají *různou* délku.

* **Translation** — angl. věta → češ. věta.
* **Speech recognition** — audio sekvence → text.
* **Summarization** — dlouhý text → krátký.

Klasická architektura: **encoder-decoder**:

* *Encoder RNN* — projde vstup, zachytí v posledním `h_T`.
* *Decoder RNN* — z `h_T` generuje výstup token po tokenu, autoregresivně.

Problém: *bottleneck* `h_T` — celý vstup *stísněn* do jednoho vektoru. Pro dlouhé sekvence ztrácí informaci. **Attention** ([[attention]]) řeší.

## Limity RNN

* **Sekvenční výpočet** — nelze paralelizovat přes čas. Trénink pomalý.
* **Dlouhé závislosti** stále problém (LSTM lepší, ale ne perfect).
* **Vanishing/exploding** — částečně řešeno LSTM, ale stále problém pro extrémně dlouhé sekvence.

**Transformer** ([[transformer-bert]]) tyto problémy řeší — paralelizovaný, bez recurrence. Dominantní architektura od 2017.

## Praktický PyTorch příklad

```python
import torch.nn as nn

class LSTMClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True, bidirectional=True)
        self.fc = nn.Linear(2 * hidden_dim, num_classes)   # 2× kvůli bidir

    def forward(self, x):
        x = self.embedding(x)                   # [B, T, embed_dim]
        _, (h, _) = self.lstm(x)                 # h: [2, B, hidden_dim]
        h = torch.cat([h[0], h[1]], dim=-1)      # [B, 2*hidden_dim]
        return self.fc(h)
```

::: link "Hochreiter, S., Schmidhuber, J.: Long Short-Term Memory (Neural Computation, 1997)" "https://www.bioinf.jku.at/publications/older/2604.pdf"
:::

::: link "Cho et al.: Learning Phrase Representations using RNN Encoder-Decoder (EMNLP, 2014)" "https://arxiv.org/abs/1406.1078"
:::

::: link "Chris Olah: Understanding LSTM Networks" "https://colah.github.io/posts/2015-08-Understanding-LSTMs/"
:::

::: link "Andrej Karpathy: The Unreasonable Effectiveness of RNN" "http://karpathy.github.io/2015/05/21/rnn-effectiveness/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Sequences and language* (Hradiš). Externí reference: Hochreiter, S., Schmidhuber, J.: *Long Short-Term Memory* (Neural Computation 9, 1997); Cho, K. et al.: *GRU* (EMNLP 2014); Olah, C.: *Understanding LSTM Networks* (2015); Goodfellow, I. et al.: *Deep Learning*, kap. 10.*
