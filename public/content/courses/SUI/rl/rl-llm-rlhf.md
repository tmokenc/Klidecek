---
title: RLHF a alignment LLM
---

# RLHF a alignment LLM

**Reinforcement Learning from Human Feedback (RLHF)** je technika, která pomohla LLM (ChatGPT, Claude, Gemini) přejít z „autocomplete internetu" na *užitečné* a *bezpečné* assistenty. Kombinuje [[policy-gradient]] s *lidskými preferencemi*.

## Motivace — proč nepostačí pre-training

LLM po pre-training na internetu ([[llm]]) umí *napodobit* text — generovat *plausible* pokračování. Ale:

* **Nepřemýšlí pomocně** — odpovídá doslova, ne k cíli.
* **Není užitečný** — text *vypadá jako odpověď*, ale nesplňuje *uživatelův záměr*.
* **Není bezpečný** — generuje *toxický*, *neetický* obsah, pokud ho prompt navádí.
* **Halucinace** — vymyslí fakta s jistotou.

Co potřebujeme: **alignment** — model jedná v souladu s lidskými preferencemi.

## RLHF pipeline

::: svg "RLHF pipeline: 1) SFT — fine-tune na instructions. 2) RM — natrénuj reward model z preferencí. 3) PPO — fine-tune LLM proti reward modelu."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="30" y="40" width="140" height="140" rx="8"/>
    <rect x="200" y="40" width="140" height="140" rx="8"/>
    <rect x="370" y="40" width="140" height="140" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="64" font-weight="600">1. SFT</text>
    <text x="100" y="84" font-size="9.5" fill="var(--text-muted)">Supervised</text>
    <text x="100" y="100" font-size="9.5" fill="var(--text-muted)">Fine-tuning</text>
    <text x="100" y="124" font-size="10">(instruction,</text>
    <text x="100" y="138" font-size="10">response) páry</text>
    <text x="100" y="160" font-size="10">cross-entropy</text>
    <text x="270" y="64" font-weight="600">2. Reward Model</text>
    <text x="270" y="84" font-size="9.5" fill="var(--text-muted)">Lidské</text>
    <text x="270" y="100" font-size="9.5" fill="var(--text-muted)">preference</text>
    <text x="270" y="124" font-size="10">odpověď A &gt; B</text>
    <text x="270" y="138" font-size="10">→ skalární R(x, y)</text>
    <text x="270" y="160" font-size="10">Bradley-Terry</text>
    <text x="440" y="64" font-weight="600">3. PPO</text>
    <text x="440" y="84" font-size="9.5" fill="var(--text-muted)">RL fine-tune</text>
    <text x="440" y="100" font-size="9.5" fill="var(--text-muted)">proti R</text>
    <text x="440" y="124" font-size="10">policy: LLM</text>
    <text x="440" y="138" font-size="10">odměna: R(x, y)</text>
    <text x="440" y="160" font-size="10">KL penalty</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <line x1="170" y1="110" x2="200" y2="110" marker-end="url(#rlhfArr)"/>
    <line x1="340" y1="110" x2="370" y2="110" marker-end="url(#rlhfArr)"/>
  </g>
  <defs>
    <marker id="rlhfArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## 1. Supervised Fine-Tuning (SFT)

Začneme s *pre-trained* LLM. Fine-tunujeme na **(instruction, demonstration)** páry — kvalitní demos jak model *má* reagovat.

```
Instrukce: "Vysvětli mi gravitaci."
Demonstrace: "Gravitace je síla, kterou se hmota přitahuje. Newtonův zákon..."
```

* Loss: standard cross-entropy (jako pre-training).
* Datasety: FLAN, Alpaca, Open Assistant, Anthropic HH.
* Lidsky-psaná data (drahá) nebo *destilovaná* z lepšího modelu (cheap, ale nese omezení modelu-učitele).

Výsledek: model *odpovídá* na otázky, ne *autocompletuje* internet.

## 2. Reward Model (RM)

SFT model stále *není* perfektní. Chceme ho dál vylepšit pomocí *lidských preferencí*. Tréninkové schéma:

### Sběr preferenčních dat

Pro každý prompt `x` model vygeneruje **dvě** odpovědi `y_A, y_B`. Lidský anotátor zvolí, *která je lepší*:

```
Prompt: "Vysvětli rakovinu."
Odpověď A: "Rakovina je…"  (vědecky správná)
Odpověď B: "Rakovina je..."  (zavádějící)
Volba: A > B
```

### Trénink reward modelu

`R(x, y; φ)` je neuronka (typicky **fine-tuned LLM** s lineární hlavou produkující skalár).

Loss — **Bradley-Terry** model:

::: math
\mathcal{L}(\phi) = -\mathbb{E}_{(x, y_A, y_B)}\!\left[\log \sigma(R_\phi(x, y_A) - R_\phi(x, y_B))\right]
:::

* Pokud `y_A > y_B`, chceme `R(x, y_A) > R(x, y_B)`.
* `σ` = sigmoid.

Výsledek: `R(x, y)` predikuje *„jak moc se lidem líbí odpověď y na prompt x"*.

## 3. RL fine-tuning s PPO

S reward modelem můžeme **fine-tunovat** LLM přes [[policy-gradient]]:

* **State**: prompt + dosud vygenerované tokeny.
* **Action**: další token.
* **Policy**: LLM s `π_θ(token | history)`.
* **Reward**: 
  - V průběhu: `0`.
  - Na konci sekvence: `R(x, y)`.

Klíčový dodatek — **KL penalty** vůči SFT modelu:

::: math
\text{reward}(x, y) = R_\phi(x, y) - \beta \cdot D_{KL}(\pi_\theta(\cdot \mid x) \| \pi_{\text{SFT}}(\cdot \mid x))
:::

Bez KL penalty by se model „posunul" daleko od přirozeného jazyka (reward hacking — viz dále). KL penalty drží model *blízko* dobré SFT distribuce.

### Algoritmus

```
inicializuj π_θ z SFT modelu
for iter = 1..N:
    sbírej trajectories (prompt → response) se policy π_θ
    spočti rewards s reward modelem R_φ + KL penalty
    update π_θ pomocí PPO
```

PPO ([[policy-gradient]]) je *standardní* volba — stabilní, robustní.

::: viz rlhf-pipeline-trace "3-stage pipeline (SFT / RM / PPO); klikni stage pro detail (loss, vstupy, parametry); příklad preference pair + PPO trace."
:::

## RLAIF — RL from AI Feedback

Lidský feedback je *drahý*. **Constitutional AI** (Anthropic, 2022) a *RLAIF* (Google, 2023) ho nahrazují *AI feedback*:

* **Constitution** — sada principů („Be helpful, honest, harmless").
* Model **sám hodnotí** své odpovědi proti constitution.
* Self-generated preference data.

Levnější, škálovatelnější. Anthropic používá tento přístup pro Claude.

## DPO — Direct Preference Optimization (Rafailov et al., 2023)

Modernější alternativa k RLHF. **Vyhne se** explicitnímu reward modelu *a* RL kroku:

::: math
\mathcal{L}_{DPO}(\theta) = -\mathbb{E}\!\left[\log\sigma\left(\beta \log\frac{\pi_\theta(y_+ \mid x)}{\pi_{\text{ref}}(y_+ \mid x)} - \beta \log\frac{\pi_\theta(y_- \mid x)}{\pi_{\text{ref}}(y_- \mid x)}\right)\right]
:::

`y_+` = preferovaná, `y_−` = horší odpověď. Trénink je *supervised* — žádné RL!

* **Jednodušší** implementace.
* **Stabilnější** trénink.
* **Srovnatelná** kvalita s PPO RLHF.

Dnes (2025+) *de facto* nahrazuje klasický RLHF v open-source modelech (LLaMA 3, Mistral).

## ORPO, KTO a další

Pokračující výzkum:

* **ORPO** (Hong et al., 2024) — *Odds Ratio Preference Optimization*. SFT + preference v *jednom* tréninku.
* **KTO** (Ethayarajh et al., 2024) — *Kahneman-Tversky Optimization*. Inspired by prospect theory.
* **SLiC** — Sequence Likelihood Calibration.

Pole se *rychle* vyvíjí.

## Self-training

Pokročilá technika: model *si sám vytvoří* trénovací data.

```
1. Model navrhne K odpovědí na prompt.
2. Model si je sám hodnotí (skore).
3. Trénink na nejvyšších-skore odpovědích.
```

* Použito v *MetaMath*, *STaR*, *V-STaR*.
* Důležité pro **rok 2025+** — vyčerpáváme lidská data, self-improvement nutný.

## Reward hacking — pozor

Pokud reward model *není perfektní*, RL ho *zneužije*:

* Model dělá *přesně to*, co reward odměňuje, *ne* to, co lidi chtějí.
* **Příklad**: pokud RM preferuje *delší* odpovědi (zaujatost annotátorů), RL model bude generovat *dlouhé* odpovědi i pro „kolik je 2+2?".
* **KL penalty** to mitiguje, ale neeliminuje.

Toto je projev širšího **alignment problem** — *jak* zachytit *skutečné* preference?

## Alignment problem

Klíčové otázky:

* **Whose values?** Preference jsou *kulturně specifické*, *politicky* zatížené.
* **Helpfulness vs. harmlessness trade-off** — model nemůže být *zároveň* maximálně užitečný a *vždy* bezpečný.
* **Goodhart's law** — *„When a measure becomes a target, it ceases to be a good measure."* Reward proxy ≠ skutečná hodnota.
* **Scalable oversight** — jak hodnotit AI, která je *chytřejší* než my? *Constitutional AI*, *debate*, *RLAIF* jsou částečné odpovědi.

## Konkrétní implementace v frontier LLM

### ChatGPT / GPT-4 (OpenAI)

1. Pre-training na internetu.
2. SFT na lidsky-psaných demos.
3. RM training z preference pairs (40+ lidských anotátorů).
4. PPO fine-tuning.
5. Iteruje (každý nový model dělá lepší data).

### Claude (Anthropic)

* **Constitutional AI** — model sám hodnotí podle psané constitution.
* Méně závislé na manuálních anotacích.
* Public *Acceptable Use Policy* a *Constitution* — veřejně publikované principy.

### LLaMA 3 (Meta)

* SFT + DPO (místo PPO RLHF).
* Open-source modely.

### Gemini (Google), Mistral, Qwen

Podobné pipeline s vlastními variantami.

## Otevřené problémy

* **Sycofancy** — model přitakává uživateli, místo aby řekl pravdu (Anthropic identified, 2023).
* **Hallucination** stále persistentní.
* **Jailbreaks** — speciální prompty obcházejí safety training.
* **Long-horizon planning** — RL pro mnoho-krokové úkoly stále problém.
* **Multi-modality** — preference pro obrázky, audio?
* **Personalizace** — model adaptovaný na *individuální* preference (privacy concerns).

## Co po RLHF

* **Inference-time reasoning** (o1, DeepSeek-R1) — model *přemýšlí* déle před odpovědí. RL z *reasoning* preference.
* **Tool use** — model se učí *volat externí nástroje*.
* **Multi-agent** — AI vs. AI training.

Pole se vyvíjí *velmi* rychle. 2025-2026 je éra **reasoning models** a **agentic AI**.

## Praktická knihovna — TRL (Transformer Reinforcement Learning)

```python
from trl import PPOTrainer, PPOConfig, AutoModelForCausalLMWithValueHead
from transformers import AutoTokenizer

# Načti pre-trained
tokenizer = AutoTokenizer.from_pretrained("gpt2")
model = AutoModelForCausalLMWithValueHead.from_pretrained("gpt2")

config = PPOConfig(model_name="gpt2", learning_rate=1.41e-5)
trainer = PPOTrainer(config, model, tokenizer=tokenizer)

# RL training loop
for batch in dataset:
    queries = batch["query"]
    responses = trainer.generate(queries)
    rewards = reward_model(queries, responses)  # vlastní RM
    stats = trainer.step(queries, responses, rewards)
```

::: link "Christiano et al.: Deep RL from Human Preferences (NeurIPS, 2017)" "https://arxiv.org/abs/1706.03741"
:::

::: link "Ouyang et al.: Training language models to follow instructions with human feedback (InstructGPT, NeurIPS 2022)" "https://arxiv.org/abs/2203.02155"
:::

::: link "Rafailov et al.: Direct Preference Optimization (DPO, NeurIPS 2023)" "https://arxiv.org/abs/2305.18290"
:::

::: link "Bai et al.: Constitutional AI — Harmlessness from AI Feedback (Anthropic, 2022)" "https://arxiv.org/abs/2212.08073"
:::

::: link "Hugging Face TRL — knihovna pro RLHF" "https://huggingface.co/docs/trl/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Reinforcement learning with LLM* (Hradiš). Externí reference: Christiano, P. et al.: *Deep RL from Human Preferences* (NeurIPS 2017); Ouyang, L. et al.: *Training language models to follow instructions with human feedback* (NeurIPS 2022); Bai, Y. et al.: *Constitutional AI* (Anthropic 2022); Rafailov, R. et al.: *Direct Preference Optimization* (NeurIPS 2023); OpenAI: *GPT-4 Technical Report* (2023).*
