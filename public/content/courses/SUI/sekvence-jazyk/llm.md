---
title: Velké jazykové modely (LLM)
---

# Velké jazykové modely (LLM)

**Large Language Models** (LLM) jsou velké *autoregresivní* dekodérové transformery trénované na obrovských textových korpusech. Generují text token po tokenu s předpovědí *dalšího slova*.

## Autoregresivní jazykový model

Cíl: modelovat *pravděpodobnost sekvence* slov.

::: math
P(w_1, w_2, \dots, w_n) = \prod_{i=1}^{n} P(w_i \mid w_1, \dots, w_{i-1})
:::

Tato faktorizace přes řetězové pravidlo *nevyžaduje* žádné aproximace — jen modelujeme `P(w_i | history)` pro každou pozici.

::: svg "Autoregresivní generování: model predikuje další token, ten se přidá k historii, opakuje se."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40" y="40" width="60" height="40" rx="4"/>
    <rect x="110" y="40" width="60" height="40" rx="4"/>
    <rect x="180" y="40" width="60" height="40" rx="4"/>
    <rect x="250" y="40" width="60" height="40" rx="4"/>
    <rect x="320" y="40" width="60" height="40" rx="4"/>
    <rect x="390" y="40" width="60" height="40" rx="4"/>
    <rect x="40" y="120" width="410" height="40" rx="4" fill="var(--accent)" opacity="0.2"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70" y="64" font-size="11">Once</text>
    <text x="140" y="64" font-size="11">upon</text>
    <text x="210" y="64" font-size="11">a</text>
    <text x="280" y="64" font-size="11">time</text>
    <text x="350" y="64" font-size="11" font-weight="600">there</text>
    <text x="420" y="64" font-size="11" font-weight="600">?</text>
    <text x="245" y="144" font-size="11" font-weight="600">Transformer decoder (causal)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="280" y1="80" x2="280" y2="120" marker-end="url(#llmArr)"/>
    <line x1="245" y1="160" x2="350" y2="80" marker-end="url(#llmArr)"/>
  </g>
  <defs>
    <marker id="llmArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="240" y="194" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">P(w_5 | „Once upon a time") = softmax(logits) → sample „there"</text>
</svg>
:::

### Trénink

* Vstup: sekvence tokenů `w_1, ..., w_T`.
* Výstup: pro každou pozici `i` predikce *následujícího* tokenu `w_{i+1}`.
* Loss: cross-entropy přes celý vocabulary.

::: math
\mathcal{L} = -\sum_{i=1}^{T-1} \log P(w_{i+1} \mid w_1, \dots, w_i)
:::

Toto je **next-token prediction** — *teacher forcing*. Trénink je *paralelní* (díky causal attention).

### Inference

Pro generování:

1. Začni s prompt: `[w_1, ..., w_k]`.
2. Spočítej `P(w_{k+1} | w_1, ..., w_k)` přes celý vocabulary.
3. **Vyber** další token (sampling, argmax, beam search, ...).
4. Přidej k historii: `[w_1, ..., w_k, w_{k+1}]`.
5. Opakuj.

### Sampling strategie

* **Greedy** — `w_{k+1} = argmax P(...)`. *Deterministický*, ale generuje *opakující se* text.
* **Beam search** — udržuje `k` nejlepších částečných sekvencí. Použito v překladu, ale *konzervativní* pro otevřené generování.
* **Top-k** — vyber z `k` nejpravděpodobnějších tokenů s pravděpodobností úměrnou jejich logitu.
* **Top-p (nucleus)** — vyber z minimální množiny tokenů, jejichž souhrn pravděpodobností přesáhne `p` (např. `0.95`). Adaptivně se rozšiřuje pro nejisté distribuce.
* **Temperature** — `softmax(logits / T)`. `T < 1` zostří distribuci (deterministický), `T > 1` vyhladí (creative). Typicky `T = 0.7`.

## Tokenizace

LLM nepracují *přímo* se slovy nebo znaky. Používají **subword tokenization** (BPE — Byte Pair Encoding), viz [[embeddings]]:

```
"unhappiness" → ["un", "happiness"]
"chatGPT"     → ["chat", "G", "PT"]
"přednáška"   → ["př", "edn", "áška"]
```

Slovník typicky `30k–100k` tokenů. **Multilingual** modely (mGPT, Bloom) mají větší vocabulary pokrývající mnoho jazyků.

## Architektura

Moderní LLM jsou *decoder-only* transformery ([[transformer-bert]]):

* **Causal self-attention** — každý token vidí jen sebe a předchozí.
* **Stack** mnoha vrstev.
* **Pre-norm** — LayerNorm před self-attention/FFN (stabilnější trénink).
* **RoPE / ALiBi** — moderní positional encoding.
* **SwiGLU / GeGLU** — gated MLP variants.

### Klíčové modely

| Model | Rok | Params | Kontext | Vendor |
| :-- | :--: | :--: | :--: | :--: |
| GPT-2 | 2019 | 1.5 B | 1k | OpenAI |
| GPT-3 | 2020 | 175 B | 2k | OpenAI |
| PaLM | 2022 | 540 B | 2k | Google |
| LLaMA | 2023 | 7-65 B | 2k | Meta |
| GPT-4 | 2023 | ~1.8 T | 8-128k | OpenAI |
| Gemini 1.5 | 2024 | ? | 1M-10M | Google |
| Claude 3 | 2024 | ? | 200k | Anthropic |
| LLaMA 3 | 2024 | 8-405 B | 128k | Meta |

Trend: *exponenciální* růst velikosti, kontextu, kvality.

## Scaling laws

**Kaplan et al. (2020)** + **Chinchilla** (Hoffmann et al., 2022) ukázali, že výkon LLM je *předvídatelnou* funkcí tří faktorů:

* **Model size** `N` (počet parametrů).
* **Dataset size** `D` (počet tokenů).
* **Compute** `C ≈ 6 N D` (FLOP).

::: math
\mathcal{L}(N, D) \approx \frac{A}{N^\alpha} + \frac{B}{D^\beta} + L_\infty
:::

* Loss klesá *power law* s `N` i `D`.
* **Compute-optimal** poměr: ~20 tokenů per parametr (Chinchilla).

Tedy *zvětšení* modelu bez dat *neškáluje*. *Nedostatek dat* je dnes hlavní limit (web je již „vyčerpán" pro malé jazyky).

## Trénink — fáze

Moderní LLM se trénují *vícefázově*:

::: svg "4 fáze LLM tréninku: pre-training → instruction tuning → RLHF → self-training."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="60" width="120" height="80" rx="6"/>
    <rect x="150" y="60" width="120" height="80" rx="6"/>
    <rect x="280" y="60" width="120" height="80" rx="6"/>
    <rect x="410" y="60" width="120" height="80" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="80" y="80" font-weight="600" font-size="11">1. Pre-training</text>
    <text x="80" y="100" font-size="10" fill="var(--text-muted)">internet textů</text>
    <text x="80" y="120" font-size="10" fill="var(--text-muted)">next-token loss</text>
    <text x="210" y="80" font-weight="600" font-size="11">2. SFT</text>
    <text x="210" y="100" font-size="10" fill="var(--text-muted)">instructions</text>
    <text x="210" y="120" font-size="10" fill="var(--text-muted)">supervised</text>
    <text x="340" y="80" font-weight="600" font-size="11">3. RLHF</text>
    <text x="340" y="100" font-size="10" fill="var(--text-muted)">human feedback</text>
    <text x="340" y="120" font-size="10" fill="var(--text-muted)">PPO</text>
    <text x="470" y="80" font-weight="600" font-size="11">4. Self-train</text>
    <text x="470" y="100" font-size="10" fill="var(--text-muted)">auto-evaluation</text>
    <text x="470" y="120" font-size="10" fill="var(--text-muted)">RLAIF</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="140" y1="100" x2="150" y2="100" marker-end="url(#llmTrainArr)"/>
    <line x1="270" y1="100" x2="280" y2="100" marker-end="url(#llmTrainArr)"/>
    <line x1="400" y1="100" x2="410" y2="100" marker-end="url(#llmTrainArr)"/>
  </g>
  <defs>
    <marker id="llmTrainArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

### 1. Pre-training

* Trénink na *celém internetu* (Common Crawl, RedPajama, BUT-LLC pro češtinu).
* **Next-token prediction**. Žádné labely — *self-supervised*.
* Trvá *měsíce* na *tisících* GPU. Náklady **stovky milionů $** pro frontier modely.
* Výsledek: model „umí internet napodobit".

### 2. Supervised Fine-Tuning (SFT) — Instruction tuning

* Trénink na **(instruction, response)** párech.
* Příklady jak má model *reagovat na požadavky*.
* Datasety: FLAN, Alpaca, Vicuna (často generované pomocí GPT-4).
* Cíl: model přejde z „autocomplete internetu" na „assistant odpovídající na otázky".

### 3. RLHF — Reinforcement Learning from Human Feedback

Detail v [[rl-llm-rlhf]]. Krátký přehled:

1. **Reward model** — natrénovat z lidských preferencí mezi odpověďmi.
2. **PPO optimization** — fine-tunovat LLM, aby maximalizoval reward.

Výsledek: model je *užitečnější*, *bezpečnější*, *zarovnanější* s lidskými hodnotami.

### 4. Self-training / RLAIF

* Model si *sám generuje* trénovací data.
* *Auto-evaluation* nebo *Constitutional AI* (Anthropic) — model si sám hodnotí výstupy.
* Levnější než lidský feedback.

## Emergent abilities

Velké modely vykazují **schopnosti, které malé modely nemají** (Wei et al., 2022):

* **Chain-of-thought reasoning** — model „přemýšlí krok za krokem".
* **In-context learning** — uchopí novou úlohu z 2-5 příkladů v promptu.
* **Code generation** — funkční Python, JavaScript, ...
* **Math reasoning** — řeší slovní úlohy.
* **Translation** — bez explicitního tréninku.
* **Multilingual transfer** — naučí se z angličtiny → funguje v jiných jazycích.

Tyto schopnosti se *náhle objeví* při škále — pod určitým parametrickým prahem chybí.

## Použití LLM

### Standalone

* **Chatboty** — ChatGPT, Claude.ai, Gemini, Mistral.
* **Coding assistants** — GitHub Copilot, Cursor, Cody.
* **Search** — Perplexity, Bing Copilot, You.com.

### Jako komponenta

::: svg "LLM jako jádro většího systému: retrieval, tools, chains."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="200" y="80" width="140" height="40" rx="6"/>
    <rect x="30" y="20" width="120" height="30" rx="4"/>
    <rect x="30" y="80" width="120" height="30" rx="4"/>
    <rect x="30" y="140" width="120" height="30" rx="4"/>
    <rect x="390" y="80" width="120" height="40" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="104" font-weight="600">LLM</text>
    <text x="90" y="40" font-size="10">Otázka uživatele</text>
    <text x="90" y="100" font-size="10">Retrieved docs (RAG)</text>
    <text x="90" y="160" font-size="10">Tools, web, API</text>
    <text x="450" y="104" font-weight="600">Odpověď</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="150" y1="35" x2="200" y2="90"/>
    <line x1="150" y1="95" x2="200" y2="100"/>
    <line x1="150" y1="155" x2="200" y2="110"/>
    <line x1="340" y1="100" x2="390" y2="100" marker-end="url(#llmCompArr)"/>
  </g>
  <defs>
    <marker id="llmCompArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

* **RAG** (Retrieval Augmented Generation) — LLM dostane *kontext z databáze* před generací. Klíčové pro produkty s aktuálními daty.
* **Tool use** — LLM volá funkce (kalkulačka, web search, API). Detail v [[typy-agentu]].
* **Multi-step reasoning** — LLM rozdělí úlohu na podcíle.
* **Code execution** — LLM generuje kód, ten se *spustí*, výsledek se vrátí zpět.

## LLM tricks (prompt engineering)

### Zero-shot

```
Q: What is the capital of France?
A:
```

### Few-shot

```
Q: What is 2+2?
A: 4
Q: What is 3+5?
A:
```

### Chain-of-Thought (Wei et al., 2022)

```
Q: Roger has 5 tennis balls. He buys 2 more cans, each with 3 balls. How many?
A: Let's think step by step. Roger starts with 5. Each can has 3 balls. 
   2 cans = 6 balls. 5 + 6 = 11. Answer: 11.
```

Drasticky lepší výsledky na matematických a logických úlohách.

### Self-consistency

* Vygeneruj *více* odpovědí s `T > 0`.
* Vyber *většinovou* odpověď.

### Reflection

```
Step 1: Answer X.
Step 2: Critique answer X.
Step 3: Improved answer Y based on critique.
```

::: viz softmax-temperature "Slider T přes logits; vidíte sharpness distribuce, entropy v bitech; T → 0 = argmax, T → ∞ = uniform."
:::

## Tréninková infrastruktura

Trénink LLM je *enormně* drahý:

* **GPT-3** trénink: 3.14 × 10²³ FLOPs, odhad **$4.6M**.
* **GPT-4** trénink: odhad **$100M+**.
* **Llama-3 405B**: 16 000 NVIDIA H100 GPUs, 54 dní.

Klíčové techniky:

* **Data parallel** — různé GPU zpracují *různé* mini-batche.
* **Model parallel** — model je *rozdělen* napříč GPU (pipeline parallelism, tensor parallelism).
* **ZeRO** (Microsoft DeepSpeed) — distribuovaný optimizer state.
* **Mixed precision** — fp16 / bf16 místo fp32.
* **FlashAttention** — efektivní attention computation.

## Limity LLM

* **Halucinace** — model vymýšlí *plausible-looking, ale nesprávná* fakta.
* **Aktuálnost** — model „zná" jen do *cutoff date* (např. GPT-4 cutoff 2023-04).
* **Math, exact reasoning** — relativně slabé.
* **Long-context coherence** — i s `128k+` kontextem trpí degradací.
* **Bias** — replikuje zaujatosti z trénovacích dat.
* **Energy consumption** — environmentálně náročné.

## Open-source vs. proprietary

**Proprietary**: GPT-4 (OpenAI), Claude (Anthropic), Gemini (Google). Vyšší kvalita, API přístup.

**Open-source**: LLaMA (Meta), Mistral, Qwen, DeepSeek. Lze *spustit lokálně* (s Ollama, llama.cpp). Mohou se *fine-tunovat* na vlastní úlohy.

### Provoz lokálně

```bash
# Ollama — nejjednodušší cesta
ollama pull llama3.1
ollama run llama3.1 "Co je to neuronová síť?"
```

### OpenAI API

```python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "Jsi pomocný asistent v češtině."},
        {"role": "user",   "content": "Vysvětli RNN za pár vět."}
    ]
)
print(response.choices[0].message.content)
```

::: link "Vaswani et al.: Attention Is All You Need (2017)" "https://arxiv.org/abs/1706.03762"
:::

::: link "Radford et al.: Improving Language Understanding (GPT, OpenAI 2018)" "https://openai.com/research/language-unsupervised"
:::

::: link "Brown et al.: Language Models are Few-Shot Learners (GPT-3, NeurIPS 2020)" "https://arxiv.org/abs/2005.14165"
:::

::: link "Hoffmann et al.: Training Compute-Optimal LLMs (Chinchilla, 2022)" "https://arxiv.org/abs/2203.15556"
:::

::: link "Touvron et al.: LLaMA — Open and Efficient Foundation Language Models (2023)" "https://arxiv.org/abs/2302.13971"
:::

::: link "Andrej Karpathy: Intro to LLM (video)" "https://www.youtube.com/watch?v=zjkBMFhNj_g"
:::

---

*Zdroj: SUI přednášky 2025/26, *Language models* (Hradiš). Externí reference: Vaswani, A. et al.: *Attention Is All You Need* (NeurIPS 2017); Radford, A. et al.: *GPT papers* (OpenAI 2018-2023); Brown, T. et al.: *GPT-3* (NeurIPS 2020); Hoffmann, J. et al.: *Chinchilla* (2022); Touvron, H. et al.: *LLaMA* (2023, 2024); Kaplan, J. et al.: *Scaling Laws for Neural Language Models* (2020).*
