---
title: Generalizace a regularizace
---

# Generalizace a regularizace

Tréninková loss neměří *to*, co nám záleží. Záleží na **generalizaci** — *jak dobře* model funguje na *neviděných* datech.

## Train / Validation / Test split

::: svg "Standardní rozdělení dat: train (fit), validation (hyperparametr selection), test (final eval)."
<svg viewBox="0 0 540 150" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--accent)" opacity="0.4">
    <rect x="40" y="60" width="280" height="40"/>
  </g>
  <g fill="#e08a3a" opacity="0.5">
    <rect x="320" y="60" width="100" height="40"/>
  </g>
  <g fill="#7fbf6c" opacity="0.5">
    <rect x="420" y="60" width="80" height="40"/>
  </g>
  <g stroke="var(--accent)" fill="none" stroke-width="1.4">
    <rect x="40" y="60" width="460" height="40"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="180" y="84" font-weight="600">Training (~70 %)</text>
    <text x="370" y="84" font-weight="600">Validation (~15 %)</text>
    <text x="460" y="84" font-weight="600">Test (~15 %)</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="180" y="120">fit parametry W, b</text>
    <text x="370" y="120">vyber hyperparametry</text>
    <text x="460" y="120">final evaluation</text>
  </g>
</svg>
:::

* **Training set** (~70 %) — model se na něm *učí parametry* (`W`, `b`) přes SGD.
* **Validation set** (~15 %) — *vybíráme hyperparametry* (learning rate, počet vrstev, regularizační koeficient). Model *neaktualizuje* na něm parametry.
* **Test set** (~15 %) — **jednou** na ni model pustíme, *odhadneme* reálnou výkonnost. Po test setu už *nic* nesmí měnit nic — jinak se overfit*ujeme na test set*.

### Důležité

* **i.i.d. předpoklad** — train / val / test musí být *ze stejné distribuce*. Pokud trénujeme na fotografiích z Wikipedie a testujeme na nemocničních snímcích, generalizace selže.
* **Dataset contamination / leaking** — pozor, aby *informace z testu* nepronikla do tréninku (např. obrázky stejných osob v různých splitech).
* **Cross-validation** — `K`-fold (typicky `K = 5` nebo `10`): trénovací sadu rozdělíme do `K` částí, opakovaně trénujeme na `K-1`, validujeme na zbylé. Užitečné při *malé* datasetu.

## Underfitting vs. overfitting

::: viz biasvar "Bias-variance trade-off: jednoduchý model = high bias, složitý = high variance."
:::

* **Underfitting** (high bias) — model je *moc jednoduchý* na zachycení vzorců. Trénovací loss vysoká, testovací podobná.
* **Optimal fit** — kompromis. Trénovací i testovací loss nízká.
* **Overfitting** (high variance) — model *zapamatoval* trénovací sadu i s šumem. Trénovací loss velmi nízká, testovací výrazně vyšší.

### Bias-variance dekompozice

Pro regresi s MSE loss:

::: math
\mathbb{E}\bigl[(t - \hat{f}(x))^2\bigr] = \underbrace{(\text{Bias}[\hat{f}])^2}_{\text{model error}} + \underbrace{\text{Var}[\hat{f}]}_{\text{noise in fit}} + \underbrace{\sigma^2}_{\text{irreducible}}
:::

* **Bias** — chyba způsobená *nesprávnou strukturou* modelu (např. lineární model pro nelineární funkci).
* **Variance** — citlivost modelu na *konkrétní* trénovací sadu. Vysoká variance = malá změna v datech → velká změna modelu.
* **Irreducible** — šum v datech, který *žádný* model nezvládne.

## Capacity (kapacita modelu)

**Kapacita** = jaké funkce model *umí reprezentovat*.

* **Lineární regrese** — nízká kapacita.
* **Polynomy řádu 100** — vysoká kapacita.
* **Hluboká NN s miliardami parametrů** — *enormní* kapacita.

Vyšší kapacita → *více* overfittingu *pokud* nejsou dostatek dat.

Pro NN se počet parametrů `P` typicky `≫` velikost trénovací sady `N`. Klasická teorie statistiky (`P > N` = catastrophic overfitting) **neplatí** pro moderní NN — tzv. *double descent phenomenon* (Belkin et al., 2019). Empiricky velké NN *generalizují překvapivě dobře*.

## Regularizace

Techniky, které *omezují* kapacitu nebo *zaplňují* místa, aby model lépe generalizoval.

### L2 / weight decay

Přidej `(λ/2) ||W||²` do loss:

::: math
L_{\text{total}} = L_{\text{data}} + \frac{\lambda}{2} \|W\|^2
:::

* Penalizuje *velké* váhy.
* Vede k *plynulejšímu* modelu.
* `λ` se ladí na *validation*.
* Implementačně: `optimizer.step()` přidá `−λ · W` k updatu.

### L1 / sparsity

Přidej `λ · ||W||₁ = λ · Σ |w_i|`. Tendence k *sparse* weights (mnoho `0`) — implicitní feature selection.

V neuronkách méně populární než L2.

::: viz regularization-l1-l2 "2D váhový prostor; loss kontury vs L1/L2 constraint ball; vidíte, proč L1 dává sparse řešení (rohy)."
:::

### Dropout (Srivastava et al., 2014)

Během tréninku **náhodně vynuluj** `p` % neuronů:

::: math
\tilde{h}_i = \begin{cases} h_i / (1-p) & \text{s pravd. } 1-p \\ 0 & \text{s pravd. } p \end{cases}
:::

Při inferenci dropout *vypneš* a používáš všechny neurony.

* **Empirické**: drasticky pomáhá. `p = 0.5` pro fully-connected vrstvy, `p = 0.1-0.2` pro CNN.
* **Interpretace**: trénujeme *ensemble* sítí. Každý forward pass používá *jinou* podsíť.
* **Co-adaptace** neuronů se snižuje — jednotlivé neurony se musí umět rozhodovat *sami*.

### Batch normalization (Ioffe & Szegedy, 2015)

Normalizuje pre-aktivace každé vrstvy přes mini-batch:

::: math
\hat{z}_i = \frac{z_i - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}}, \quad y_i = \gamma \hat{z}_i + \beta
:::

* `μ_B, σ_B` — průměr a směrodatná odchylka batche.
* `γ, β` — *naučitelné* parametry pro flexibilní scale + shift.
* Při inferenci se použijí *kumulativní* statistiky z tréninku.

**Výhody**:

* **Stabilnější** trénink — gradient nesaturuje.
* **Vyšší learning rate** možné.
* **Implicitní regularizace** — šum z mini-batche.
* **Lepší konvergence** s méně epochami.

Pro RNN/Transformer se používá **Layer Normalization** (normalizuje přes features, ne přes batch).

### Data augmentation

Synteticky **rozšíříme** trénovací sadu transformacemi, které *nemění label*:

* **Obrázky** — rotace, flip, crop, color jitter, noise, mixup, cutmix.
* **Text** — synonymum substitution, back-translation, paraphrase.
* **Audio** — pitch shift, time stretch, noise injection.

Nejlevnější a často *nejúčinnější* forma regularizace. Pro CNN: `+5 %` accuracy zdarma s rotaci/flip/crop.

### Early stopping

Sleduj *validation loss*. Když přestane klesat (nebo začne *růst*), zastav trénink.

```python
best_val_loss = inf
patience_counter = 0
for epoch in range(max_epochs):
    train(...)
    val_loss = validate(...)
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        save_model()
        patience_counter = 0
    else:
        patience_counter += 1
        if patience_counter >= patience: break  # 5-10 epochs
```

Jednoduché, *velmi* účinné. Zachrání nás před overfitem.

## Loss ≠ target metric

Loss během tréninku je *proxy* pro skutečnou kvalitu. Pro klasifikaci typicky:

* **Trénujeme** s cross-entropy.
* **Hodnotíme** podle accuracy, F1, ROC-AUC, ...

Loss může klesat, *zatímco* accuracy stagnuje (nebo dokonce klesá). Vždy *sleduj target metric* na validačním setu.

## Velikost modelu

* **Malé** modely (par <10⁶) — rychlé, snadno trénovatelné. Stačí pro jednoduché úlohy s malými daty.
* **Střední** (par 10⁶-10⁸) — moderní CNN, BERT-base.
* **Velké** (par 10⁹-10¹²) — frontier LLMs. Vyžadují cluster GPU.

**Empirický fakt**: výkonnost roste *předvídatelně* s velikostí modelu, daty a výpočtem (Chinchilla scaling laws, Hoffmann et al. 2022).

## Pre-training a fine-tuning

::: svg "Pre-training na velkém obecném datasetu → fine-tuning na specifické úloze."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="30" y="50" width="200" height="100" rx="6"/>
    <rect x="310" y="50" width="200" height="100" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11" font-weight="600">
    <text x="130" y="76">1. Pre-training</text>
    <text x="130" y="96" fill="var(--text-muted)" font-size="10" font-weight="400">velký obecný dataset</text>
    <text x="130" y="116" fill="var(--text-muted)" font-size="10" font-weight="400">ImageNet, Wikipedia, web</text>
    <text x="130" y="136" fill="var(--text-muted)" font-size="10" font-weight="400">self-supervised</text>
    <text x="410" y="76">2. Fine-tuning</text>
    <text x="410" y="96" fill="var(--text-muted)" font-size="10" font-weight="400">specifická úloha</text>
    <text x="410" y="116" fill="var(--text-muted)" font-size="10" font-weight="400">malá labelovaná sada</text>
    <text x="410" y="136" fill="var(--text-muted)" font-size="10" font-weight="400">supervised</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <line x1="230" y1="100" x2="310" y2="100" marker-end="url(#ftArr)"/>
  </g>
  <defs>
    <marker id="ftArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="270" y="92" fill="var(--text-muted)" text-anchor="middle" font-size="9">váhy</text>
</svg>
:::

Moderní pipeline:

1. **Pre-trénuj** velký model na *obrovském* obecném datasetu (self-supervised — předpovídání maskovaných tokens, contrastive learning).
2. **Fine-tune** poslední vrstvy (nebo celý model s malým `α`) na *specifické* malé labelované úloze.

Toto je *dominantní* paradigma v 2020s — BERT, GPT, CLIP. Detail v [[transfer-learning]] (CNN) a [[transformer-bert]] (NLP).

## „Weird learning" varianty

* **Semi-supervised** — labelovaná + nelabelovaná data.
* **Self-supervised** — labels *generovány automaticky* z dat (masked language modeling).
* **Active learning** — vybíráme, *která* data labelovat na základě nejistoty modelu.
* **Transfer learning** — síť jednoho úkolu fine-tunujeme na *jiný*.
* **Knowledge distillation** — velký „učitel" generuje pseudo-labely pro malého „studenta".
* **Domain adaptation** — úloha stejná, ale datová distribuce se mění (den/noc).
* **Self-training** — model generuje labely, učí se z nich (semi-supervised).
* **Federated learning** — distribuované učení na privátních datech.

## Příčiny špatné generalizace

Kontrolní seznam *„co se kde mohlo pokazit"*:

* **Underfitting** — model malý nebo nedostatek epoch.
* **Overfitting** — model velký nebo data málo.
* **Data leakage** — train/val nejsou nezávislé.
* **Distribuční shift** — train data ≠ deployment data.
* **Špatně labelovaná data** — model se naučí *šum*.
* **Imbalanced dataset** — málo příkladů menšinové třídy → low recall pro ni.
* **Špatná loss** — měříme něco jiného než target metric.

::: link "Goodfellow et al.: Deep Learning, kap. 5 (ML basics), kap. 7 (Regularization)" "https://www.deeplearningbook.org/contents/regularization.html"
:::

::: link "Srivastava et al.: Dropout — A Simple Way to Prevent Neural Networks from Overfitting (JMLR, 2014)" "https://jmlr.org/papers/v15/srivastava14a.html"
:::

::: link "Ioffe, S., Szegedy, C.: Batch Normalization (ICML 2015)" "https://arxiv.org/abs/1502.03167"
:::

::: link "Hoffmann et al.: Training Compute-Optimal Large Language Models (Chinchilla, 2022)" "https://arxiv.org/abs/2203.15556"
:::

---

*Zdroj: SUI přednášky 2025/26, *Neural networks* (Hradiš). Externí reference: Goodfellow, I., Bengio, Y., Courville, A.: *Deep Learning* (MIT 2016), kap. 5 + 7; Srivastava, N. et al.: *Dropout* (JMLR 15, 2014); Ioffe, S., Szegedy, C.: *Batch Normalization* (ICML 2015); Belkin, M. et al.: *Reconciling modern machine-learning practice and the classical bias–variance trade-off* (PNAS 2019).*
