---
title: Attention mechanism
---

# Attention mechanism

**Attention** umožňuje neuronové síti *dynamicky* vážit relevanci různých částí vstupu. Vznikla jako rozšíření seq2seq překladu (Bahdanau et al., 2015) — dnes je *základním* prvkem transformerů a všech moderních NLP modelů.

## Motivace — bottleneck v encoder-decoder

Klasická seq2seq architektura ([[rnn-lstm]]):

* **Encoder** RNN: vstupní sekvence `x₁..x_T` → poslední hidden state `h_T`.
* **Decoder** RNN: z `h_T` generuje výstupní sekvenci.

**Problém**: celá vstupní sekvence stísněna do *jednoho* vektoru `h_T`. Pro dlouhé věty informace „zmizí" — výsledná kvalita prudce klesá s délkou.

## Attention — řešení

Místo *jediné* reprezentace celého vstupu, decoder *vidí všechny* encoder hidden states a v každém kroku se zaměří na ty *relevantní*.

::: svg "Attention v seq2seq: decoder hledí na všechny encoder states, váhy se počítají podle relevance."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="30" y="160" width="60" height="40" rx="4"/>
    <rect x="110" y="160" width="60" height="40" rx="4"/>
    <rect x="190" y="160" width="60" height="40" rx="4"/>
    <rect x="270" y="160" width="60" height="40" rx="4"/>
    <rect x="380" y="160" width="60" height="40" rx="4"/>
    <rect x="460" y="160" width="60" height="40" rx="4"/>
    <rect x="100" y="80" width="60" height="40" rx="4"/>
    <circle cx="250" cy="50" r="20"/>
    <rect x="420" y="80" width="60" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="60" y="184" font-size="11">h₁</text>
    <text x="140" y="184" font-size="11">h₂</text>
    <text x="220" y="184" font-size="11">h₃</text>
    <text x="300" y="184" font-size="11">h₄</text>
    <text x="410" y="184" font-size="11">s₁</text>
    <text x="490" y="184" font-size="11">s₂</text>
    <text x="130" y="104" font-size="10">encoder</text>
    <text x="250" y="54" font-weight="600">c_t</text>
    <text x="250" y="68" font-size="9">context</text>
    <text x="450" y="104" font-size="10">decoder</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="60" y="220">x₁</text>
    <text x="140" y="220">x₂</text>
    <text x="220" y="220">x₃</text>
    <text x="300" y="220">x₄</text>
    <text x="410" y="220">y₁</text>
    <text x="490" y="220">y₂</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="60" y1="160" x2="220" y2="65" stroke-width="0.7"/>
    <line x1="140" y1="160" x2="235" y2="65" stroke-width="2.2"/>
    <line x1="220" y1="160" x2="245" y2="65" stroke-width="1.2"/>
    <line x1="300" y1="160" x2="265" y2="65" stroke-width="0.6"/>
    <line x1="270" y1="50" x2="410" y2="120" stroke="#e08a3a" stroke-width="1.4"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="160" y="130">α₂ = 0.7</text>
    <text x="200" y="146">(zaměřeno na h₂)</text>
  </g>
</svg>
:::

V každém kroku decoderu:

1. **Score** — spočítáme *relevanci* každého encoder state vůči aktuálnímu decoder state.
2. **Softmax** — převedeme scores na váhy `α_i ∈ (0, 1)`, `Σ α_i = 1`.
3. **Context vector** — vážený součet encoder states.
4. Context vector se zkombinuje s decoder hidden state → výstup.

## Matematicky

Decoder má aktuální hidden state `s_t`. Pro každý encoder state `h_i`:

### Score function

Několik variant:

* **Dot product**: `score(s_t, h_i) = s_tᵀ h_i`
* **Multiplikativní (Luong)**: `score(s_t, h_i) = s_tᵀ W h_i`
* **Aditivní (Bahdanau)**: `score(s_t, h_i) = vᵀ tanh(W₁ s_t + W₂ h_i)`

### Attention weights

::: math
\alpha_i = \frac{\exp(\text{score}(s_t, h_i))}{\sum_j \exp(\text{score}(s_t, h_j))}
:::

(softmax přes všechny encoder states).

### Context vector

::: math
\mathbf{c}_t = \sum_i \alpha_i \mathbf{h}_i
:::

### Použití v decoderu

::: math
\mathbf{s}_{t+1} = \text{RNN}(\mathbf{s}_t, [\mathbf{c}_t, \mathbf{y}_t])
:::

## Visualizace attention vah

Pro překlad můžeme vidět *attention mapu* — heatmapu `α_{ij}` pro každý pár (vstupní slovo, výstupní slovo). Krásně ukazuje *alignment* mezi jazyky.

::: svg "Attention map pro překlad EN → FR: 'European Economic Area' ↔ 'zone économique européenne'. Pořadí slov se obrátí."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6" fill="none">
    <rect x="100" y="40" width="360" height="160" stroke="var(--accent)" stroke-width="1.2"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="160" y="32">European</text>
    <text x="220" y="32">Economic</text>
    <text x="280" y="32">Area</text>
    <text x="340" y="32">was</text>
    <text x="400" y="32">signed</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="end" font-size="10">
    <text x="96" y="74">zone</text>
    <text x="96" y="104">économique</text>
    <text x="96" y="134">européenne</text>
    <text x="96" y="164">a été</text>
    <text x="96" y="194">signée</text>
  </g>
  <g fill="var(--accent)">
    <rect x="270" y="58" width="20" height="20" opacity="0.8"/>
    <rect x="210" y="88" width="20" height="20" opacity="0.8"/>
    <rect x="150" y="118" width="20" height="20" opacity="0.8"/>
    <rect x="330" y="148" width="20" height="20" opacity="0.8"/>
    <rect x="390" y="178" width="20" height="20" opacity="0.8"/>
    <rect x="210" y="58" width="20" height="20" opacity="0.2"/>
    <rect x="150" y="58" width="20" height="20" opacity="0.1"/>
  </g>
  <text x="280" y="225" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">Obrácení pořadí: 'European Economic Area' ↔ 'zone économique européenne'.</text>
</svg>
:::

::: viz attention-heatmap "Heatmap (cíl × zdroj); přepínač scénářů (překlad / self-attention) + 4 heads + kauzální maska."
:::

## Self-attention

Attention nemusí být *mezi* encoderem a decoderem — můžeme jí použít *v rámci jediné sekvence*. **Self-attention** počítá *vážený součet* všech pozic ve stejné sekvenci.

::: math
\mathbf{y}_i = \sum_j \alpha_{ij} \mathbf{v}_j
:::

Kde:

* `v_j` — *value* vektor pro pozici `j`.
* `α_{ij}` — attention weight z pozice `i` na pozici `j`.

### Query-Key-Value framework

Standardizovaný **Scaled Dot-Product Attention** (Vaswani et al., 2017):

* **Query** `Q = X W_Q` — co hledám?
* **Key** `K = X W_K` — co každá pozice nabízí?
* **Value** `V = X W_V` — co každá pozice obsahuje?

::: math
\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{Q K^\top}{\sqrt{d_k}}\right) V
:::

Kroky:

1. `Q K^T` — score matice `[N × N]`. Element `(i, j)` = relevance pozice `j` pro `i`.
2. **Scaling** `/ √d_k` — pro numerickou stabilitu. Bez scaling jsou logits velké → softmax saturuje → vanishing gradient.
3. **Softmax** přes řádky — attention weights, sumují na `1`.
4. **Násobení V** — vážený součet hodnot.

::: svg "Q-K-V attention: dot product Q·K^T → softmax → násobení V → výstup pro každou pozici."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="30" y="80" width="80" height="40" rx="4"/>
    <rect x="160" y="40" width="80" height="40" rx="4"/>
    <rect x="160" y="120" width="80" height="40" rx="4"/>
    <rect x="290" y="80" width="80" height="40" rx="4"/>
    <rect x="420" y="80" width="80" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70" y="104" font-weight="600">Q</text>
    <text x="200" y="64" font-weight="600">K</text>
    <text x="200" y="144" font-weight="600">V</text>
    <text x="330" y="104">softmax(QK^T/√d)</text>
    <text x="460" y="104" font-weight="600">Output</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="110" y1="100" x2="290" y2="100" marker-end="url(#qkvArr)"/>
    <line x1="200" y1="80" x2="200" y2="120"/>
    <line x1="240" y1="80" x2="290" y2="100"/>
    <line x1="370" y1="100" x2="420" y2="100" marker-end="url(#qkvArr)"/>
    <line x1="240" y1="140" x2="430" y2="120"/>
  </g>
  <defs>
    <marker id="qkvArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Multi-head attention

Místo *jedné* attention provádíme *více* paralelních „head" attention s různými projekcemi:

::: math
\text{head}_i = \text{Attention}(Q W_i^Q, K W_i^K, V W_i^V)
:::

::: math
\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, \dots, \text{head}_h) W^O
:::

* `h` typicky `8-16`.
* Každá head se může soustředit na *jiný aspekt* — syntax, sémantika, koreference.
* **Paralelní** — všechny heads se počítají najednou.

## Causal attention (masked)

Pro **autoregresivní** generování (text generování zleva doprava) **nesmíme** vidět budoucnost. Aplikujeme **causal mask**:

::: svg "Causal mask: attention z pozice i může vidět jen pozice 1..i (dolní trojúhelník)."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.5" fill="none">
    <rect x="160" y="30" width="200" height="160" stroke="var(--accent)" stroke-width="1.2"/>
  </g>
  <g fill="var(--accent)" opacity="0.6">
    <rect x="160" y="30" width="40" height="40"/>
    <rect x="160" y="70" width="80" height="40"/>
    <rect x="160" y="110" width="120" height="40"/>
    <rect x="160" y="150" width="160" height="40"/>
    <rect x="320" y="150" width="40" height="40"/>
  </g>
  <g fill="#cf6660" opacity="0.3">
    <rect x="200" y="30" width="160" height="40"/>
    <rect x="240" y="70" width="120" height="40"/>
    <rect x="280" y="110" width="80" height="40"/>
    <rect x="320" y="150" width="40" height="40"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="180" y="55">✓</text>
    <text x="220" y="55">✗</text>
    <text x="260" y="55">✗</text>
    <text x="300" y="55">✗</text>
    <text x="340" y="55">✗</text>
    <text x="180" y="95">✓</text>
    <text x="220" y="95">✓</text>
    <text x="260" y="95">✗</text>
    <text x="300" y="95">✗</text>
    <text x="340" y="95">✗</text>
    <text x="180" y="135">✓</text>
    <text x="220" y="135">✓</text>
    <text x="260" y="135">✓</text>
    <text x="300" y="135">✗</text>
    <text x="340" y="135">✗</text>
    <text x="180" y="175">✓</text>
    <text x="220" y="175">✓</text>
    <text x="260" y="175">✓</text>
    <text x="300" y="175">✓</text>
    <text x="340" y="175">✗</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="260" y="205">key →</text>
    <text x="135" y="110" transform="rotate(-90 135 110)">query →</text>
  </g>
</svg>
:::

Implementace: před softmaxem se „budoucí" pozice nastaví na `-∞`, takže `softmax(-∞) = 0`.

* **Encoder** (BERT) — *full* attention (každá pozice vidí všechny).
* **Decoder** (GPT) — *causal* attention (každá pozice vidí jen sebe a předchozí).

## Cross-attention

V encoder-decoder modelech (T5, BART) má decoder *dvě* attention vrstvy:

* **Self-attention** (causal) — uvnitř výstupu.
* **Cross-attention** — `Q` z decoderu, `K, V` z encoderu. Klasický „decoder se dívá na encoder".

## Výpočetní složitost

Self-attention má **kvadratickou** složitost v délce sekvence: `O(N²)` operací, `O(N²)` paměti pro attention matici.

Pro `N = 4096` (typická délka kontextu) to je `16.7M` operací na head per layer. **Limituje** maximální délku kontextu LLM.

### Efficient attention

Aktivní výzkum řeší kvadratickou složitost:

* **Sparse attention** — Longformer, BigBird. Každá pozice vidí jen *omezený* okruh.
* **Linear attention** — Performer, Linformer. Aproximace `softmax(QK^T)V` v lineárním čase.
* **Flash Attention** (Dao et al., 2022) — *exact* attention v lineární *paměti* díky chytré GPU implementaci. Standard v moderních LLM.
* **Mixture-of-Experts** — různé tokeny posílány do různých sub-sítí.

## Klíčová pozorování

* **Attention** je *generalizace* dot-product matching.
* **Self-attention** umožňuje libovolnou *dlouhou závislost* (každá pozice s každou) — žádný vanishing gradient kvůli vzdálenosti.
* **Paralelní** — narozdíl od RNN se počítá *najednou* pro všechny pozice.
* **Interpretovatelná** — attention weights ukazují, co model „pozoruje".

::: link "Vaswani et al.: Attention Is All You Need (NeurIPS, 2017)" "https://arxiv.org/abs/1706.03762"
:::

::: link "Bahdanau et al.: Neural Machine Translation by Jointly Learning to Align and Translate (ICLR, 2015)" "https://arxiv.org/abs/1409.0473"
:::

::: link "Jay Alammar: The Illustrated Transformer" "https://jalammar.github.io/illustrated-transformer/"
:::

::: link "Distill — Attention and Augmented Recurrent Neural Networks (Olah, Carter)" "https://distill.pub/2016/augmented-rnns/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Attention mechanism* (Hradiš). Externí reference: Vaswani, A. et al.: *Attention Is All You Need* (NeurIPS 2017); Bahdanau, D. et al.: *Neural Machine Translation by Jointly Learning to Align and Translate* (ICLR 2015); Luong, M. T. et al.: *Effective Approaches to Attention-based NMT* (EMNLP 2015); Dao, T. et al.: *FlashAttention* (NeurIPS 2022).*
