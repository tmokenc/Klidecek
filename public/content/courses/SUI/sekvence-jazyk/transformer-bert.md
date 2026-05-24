---
title: Transformer a BERT
---

# Transformer a BERT

**Transformer** (Vaswani et al., 2017) je architektura založená *čistě* na [[attention]] — bez recurrence, bez konvoluce. *Definuje* moderní deep learning v NLP a dále.

## Architektura

::: svg "Transformer block: multi-head self-attention + feed-forward MLP + residual + layer norm."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="180" y="200" width="180" height="30" rx="4"/>
    <rect x="180" y="160" width="180" height="30" rx="4"/>
    <rect x="180" y="100" width="180" height="40" rx="4"/>
    <rect x="180" y="50" width="180" height="30" rx="4"/>
    <rect x="180" y="10" width="180" height="30" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="220" font-size="11">Input embedding + positional</text>
    <text x="270" y="180" font-size="11">Layer Norm</text>
    <text x="270" y="125" font-size="11" font-weight="600">Multi-Head Attention</text>
    <text x="270" y="70" font-size="11">Feed-Forward (MLP)</text>
    <text x="270" y="30" font-size="11" font-weight="600">Output</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="270" y1="200" x2="270" y2="190" marker-end="url(#tfArr)"/>
    <line x1="270" y1="160" x2="270" y2="140" marker-end="url(#tfArr)"/>
    <line x1="270" y1="100" x2="270" y2="80" marker-end="url(#tfArr)"/>
    <line x1="270" y1="50" x2="270" y2="40" marker-end="url(#tfArr)"/>
  </g>
  <g stroke="#e08a3a" stroke-width="1.5" stroke-dasharray="5 3" fill="none">
    <path d="M 380 215 L 460 215 L 460 120 L 360 120"/>
    <path d="M 380 175 L 440 175 L 440 65 L 360 65"/>
  </g>
  <defs>
    <marker id="tfArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="#e08a3a" font-size="9" text-anchor="middle">
    <text x="460" y="170">residual</text>
    <text x="440" y="115">residual</text>
  </g>
</svg>
:::

Transformer **block** (jedna vrstva) má:

1. **Multi-head self-attention** — kontextové míchání informací.
2. **Feed-forward MLP** — 2-vrstvá síť per pozice (sdílená).
3. **Residual connections** (jako v ResNet) — kolem obou subbloků.
4. **Layer normalization** — stabilizace gradientů.

```
x = LayerNorm(x + MultiHeadAttention(x))
x = LayerNorm(x + FFN(x))
```

(Existují dva pořadí norm: *post-norm* — výše, *pre-norm* — preferovaný v moderních modelech.)

### Feed-forward MLP

::: math
\text{FFN}(\mathbf{x}) = \max(0, \mathbf{x} W_1 + \mathbf{b}_1) W_2 + \mathbf{b}_2
:::

* 2 lineární vrstvy s nelinearitou uprostřed (ReLU, GELU, SiLU).
* **Dimensionalita uvnitř** typicky `4 × d_model` (`d_model = 512`, MLP má `2048`).
* **Sdílená** přes všechny pozice. Aplikuje se *per-token* (nezávisle).
* Zdroj *většiny* parametrů modelu.

### Positional encoding

Self-attention je *invariant na pořadí* — bez extra informace by věty `"pes kousl muže"` a `"muž kousl psa"` byly stejné. **Positional encoding** doplňuje *informaci o pozici* do embeddingu.

#### Sinusoidní (původní)

::: math
PE(pos, 2i) = \sin(pos / 10000^{2i/d})
:::

::: math
PE(pos, 2i+1) = \cos(pos / 10000^{2i/d})
:::

* Pevně dané, nemusí se učit.
* Pro `pos = 0, 1, 2, ...` dává *různé* vektory.
* Sinusoidní pattern umožňuje *extrapolaci* za trénovací délku.

#### Learned

Embedding tabulka `P ∈ R^{N_max × d}`, kde `N_max` = maximální délka. Naučí se gradient descentem. Použito v BERT, GPT.

#### Rotary Position Embedding (RoPE)

Modernější varianta — *rotuje* Q a K vektory podle pozice. Použito v LLaMA, GPT-Neo, Llama2.

::: viz transformer-block-flow "7 stage Transformer block: input + PE → LN → Q/K/V → attention → projekce → FFN → output; klikni stage pro detail."
:::

## Encoder vs. Decoder

Vaswani et al. (2017) navrhli Transformer pro *machine translation* — encoder-decoder architekturu:

* **Encoder**: stack 6 Transformer blocks. Self-attention je *full* (vidí všechny pozice).
* **Decoder**: stack 6 Transformer blocks. Má:
  - **Causal self-attention** (vidí jen sebe a předchozí).
  - **Cross-attention** na encoder výstupy.

::: svg "Encoder-decoder Transformer: encoder zpracuje vstup, decoder generuje výstup s cross-attention na encoder."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40" y="40" width="180" height="140" rx="6"/>
    <rect x="320" y="40" width="180" height="140" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="130" y="32" font-weight="600">Encoder</text>
    <text x="410" y="32" font-weight="600">Decoder</text>
    <text x="130" y="80" font-size="10">Self-attention (full)</text>
    <text x="130" y="105" font-size="10">FFN</text>
    <text x="130" y="130" font-size="10">×N blocks</text>
    <text x="410" y="68" font-size="10">Causal self-attn</text>
    <text x="410" y="90" font-size="10">Cross-attn ← encoder</text>
    <text x="410" y="112" font-size="10">FFN</text>
    <text x="410" y="134" font-size="10">×N blocks</text>
    <text x="130" y="200" font-size="11" font-weight="600">vstup (src)</text>
    <text x="410" y="200" font-size="11" font-weight="600">výstup (tgt)</text>
  </g>
  <g stroke="#e08a3a" stroke-width="1.5" stroke-dasharray="4 3" fill="none">
    <path d="M 220 110 L 320 90" marker-end="url(#encDecArr)"/>
  </g>
  <defs>
    <marker id="encDecArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="#e08a3a"/>
    </marker>
  </defs>
</svg>
:::

### Decoder-only

Pro autoregresivní jazykové modelování stačí jen *decoder*. GPT, LLaMA, Claude jsou *decoder-only*.

### Encoder-only

Pro úlohy *porozumění* (klasifikace, NER, sentiment) stačí *encoder*. BERT, RoBERTa, DeBERTa jsou *encoder-only*.

### Encoder-decoder

Pro *seq2seq* (translation, summarization, QA). T5, BART, mT5 jsou encoder-decoder.

## BERT — Bidirectional Encoder

**Devlin et al. (2018)**, *BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding*. Google.

### Pre-training tasks

#### 1. Masked Language Modeling (MLM)

Náhodně zamaskujeme 15 % tokenů ve větě, model je *predikuje*:

```
Vstup:  Praha je [MASK] města Česka.
Cíl:   Praha je hlavní města Česka.
```

* Z 15 %: `80 %` nahrazeno `[MASK]`, `10 %` nahrazeno *náhodným* tokenem, `10 %` ponecháno původně. To brání over-fit na specifický `[MASK]` token.
* **Bidirectional** — model vidí kontext *z obou stran* (na rozdíl od GPT).

#### 2. Next Sentence Prediction (NSP)

Pro dvojici vět rozhodni, zda je `B` *bezprostřední* pokračování `A`. Pomáhá modelovat *dialog*, *coreference*.

Pozdější výzkum ukázal, že NSP *nepomáhá* — RoBERTa (Liu et al., 2019) ho vynechává.

::: viz bert-mlm-fill "Věta s [MASK]; přepínač BERT (bidirectional) vs GPT (left-only); top-5 predikce a viditelnost kontextu."
:::

### Architektura

* **BERT-base**: 12 layers, 768 hidden, 12 heads, 110M params.
* **BERT-large**: 24 layers, 1024 hidden, 16 heads, 340M params.
* Trénováno na BookCorpus + Wikipedia (3.3 mld slov).

### Fine-tuning

Po pre-training se BERT *fine-tunuje* na specifickou úlohu:

* **Classification** — přidat lineární vrstvu nad `[CLS]` token.
* **NER** — lineární vrstva nad každý token, BIO tagging.
* **QA** — predikce start/end indexů odpovědi v textu.
* **Sentence pair** — vlož `A [SEP] B`, klasifikace z `[CLS]`.

Fine-tuning typicky **3-5 epoch**, lr `2e-5 — 5e-5`.

### Důsledky BERT

* **Drasticky** zlepšil výsledky na GLUE, SuperGLUE benchmarcích.
* *Stal se* defaultním baselinem pro NLP.
* Inspiroval *desítky* variant: RoBERTa, ALBERT, DistilBERT, ELECTRA, DeBERTa.

## Praktické knihovny

### Hugging Face Transformers

De-facto standard. Tisíce pre-trained modelů, jednotné API.

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification

tokenizer = AutoTokenizer.from_pretrained("bert-base-multilingual-cased")
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-multilingual-cased",
    num_labels=2
)

inputs = tokenizer("Tato věta je v češtině.", return_tensors="pt")
outputs = model(**inputs)
logits = outputs.logits
```

### Czech-specific

* **CzeRT**, **RobeCzech**, **SlovakBERT**, **mBERT** — modely předtrénované na češtině.

## Hodnocení

### GLUE benchmark

**General Language Understanding Evaluation** (Wang et al., 2018) — sada 9 NLP úloh:

* CoLA — gramatická správnost.
* SST-2 — sentiment.
* MRPC, QQP, STS-B — sentence similarity.
* MNLI, QNLI, RTE — natural language inference.
* WNLI — Winograd Schema.

BERT a nástupci postupně překonali *lidský* baseline.

### SuperGLUE

Náročnější verze — důraz na *reasoning*, *common sense*.

## Pokročilé varianty

* **RoBERTa** (Liu et al., 2019) — BERT bez NSP, větší dataset, delší trénink. Lepší výkon.
* **ALBERT** (Lan et al., 2019) — *param sharing* mezi vrstvy → menší model, podobný výkon.
* **DistilBERT** (Sanh et al., 2019) — knowledge distillation, 40 % menší, 60 % rychlejší.
* **ELECTRA** (Clark et al., 2020) — *replaced token detection* místo MLM. Efektivnější trénink.
* **DeBERTa** (He et al., 2020) — *disentangled attention*. SOTA na SuperGLUE.
* **Longformer**, **BigBird** — sparse attention pro dlouhé dokumenty.

## DETR — Detection Transformer

**Carion et al. (2020)**. Aplikace Transformerů na *object detection*:

* CNN extrahuje features.
* Transformer encoder zpracuje features.
* Transformer decoder generuje *set* bounding box predikcí.
* **End-to-end** — žádné anchor boxes, žádný NMS.

Symbol toho, že Transformery jsou *univerzální* architektura, ne jen pro NLP.

## Vision Transformer (ViT)

**Dosovitskiy et al. (2020)**. Transformer pro obrázky:

* Rozdělit obrázek na patches `16 × 16`.
* Každý patch → embedding.
* Sekvence patches → Transformer encoder.
* Classification z `[CLS]` tokenu.

Pro velké datasety překonává CNN. Detail v [[cnn-architektury]].

## Multimodal

Transformery snadno *kombinují* různé modality:

* **CLIP** (OpenAI, 2021) — vizuální + textový encoder, kontrastivní pre-training. Zero-shot klasifikace obrázků.
* **LayoutLM** (Microsoft, 2020) — text + bounding box, pro document AI.
* **GPT-4V**, **Gemini**, **Claude 3** — multi-modal LLM (text + image + audio).

## Klíčové vlastnosti

* **Paralelizovatelný** — všechny pozice najednou (na rozdíl od RNN).
* **Dlouhé závislosti** — žádný vanishing gradient přes vzdálenost.
* **Škálovatelný** — výkon roste *spolu* s velikostí modelu a daty (scaling laws, viz [[llm]]).
* **Univerzální** — text, obraz, audio, video, kód, proteiny.

::: link "Vaswani et al.: Attention Is All You Need (NeurIPS, 2017)" "https://arxiv.org/abs/1706.03762"
:::

::: link "Devlin et al.: BERT — Pre-training of Deep Bidirectional Transformers (NAACL, 2019)" "https://arxiv.org/abs/1810.04805"
:::

::: link "Jay Alammar: The Illustrated Transformer + The Illustrated BERT" "https://jalammar.github.io/"
:::

::: link "Hugging Face Transformers — knihovna a model hub" "https://huggingface.co/docs/transformers/"
:::

::: link "Andrej Karpathy: Let's build GPT — from scratch (video)" "https://www.youtube.com/watch?v=kCc8FmEb1nY"
:::

---

*Zdroj: SUI přednášky 2025/26, *Transformers and BERT* (Hradiš). Externí reference: Vaswani, A. et al.: *Attention Is All You Need* (NeurIPS 2017); Devlin, J. et al.: *BERT* (NAACL 2019); Radford, A. et al.: *Improving Language Understanding by Generative Pre-Training* (OpenAI 2018); Liu, Y. et al.: *RoBERTa* (2019); Carion, N. et al.: *DETR* (ECCV 2020).*
