---
title: Word embeddings — Word2Vec, FastText
---

# Word embeddings

Pro zpracování textu neuronovou sítí potřebujeme **numerickou reprezentaci** slov. **Embedding** = mapování slova na *hustý* vektor v `R^D`, kde podobná slova mají *podobné* vektory.

## One-hot encoding — primitivní baseline

Nejjednodušší reprezentace: pro `V`-slovní slovník je každé slovo *jednotkový* vektor v `R^V`.

::: math
w_{\text{cat}} = [0, 0, \dots, 1, \dots, 0]^\top
:::

* Vektor má jedinou `1` na pozici slova, jinak `0`.
* **Problémy**:
  - **Sparse** — drtivá většina prvků je `0`.
  - **High-dimensional** — `V = 30 000+` pro typický slovník.
  - **Žádná podobnost** — `cat` a `dog` jsou stejně *vzdálené* jako `cat` a `airplane`.

## Look-up table — naučitelný embedding

V embedding vrstvě je *naučená* matice `E ∈ R^{V × D}` (typicky `D = 100..1024`). Pro slovo `w` s indexem `i`:

::: math
\mathbf{e}_w = E[i, :]
:::

V kódu: `nn.Embedding(num_embeddings=V, embedding_dim=D)`. Stačí indexovat matici místo one-hot násobení.

::: svg "Embedding layer: slovo (index) → řádek z embedding matice → dense vektor."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="30" y="60" width="80" height="60" rx="6"/>
    <rect x="220" y="20" width="120" height="160" rx="6"/>
    <rect x="430" y="60" width="80" height="60" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70" y="86" font-weight="600">"cat"</text>
    <text x="70" y="106" font-size="10" fill="var(--text-muted)">i = 132</text>
    <text x="280" y="40" font-size="11" font-weight="600">E ∈ R^{V×D}</text>
    <text x="470" y="85" font-weight="600">e_cat</text>
    <text x="470" y="105" font-size="10" fill="var(--text-muted)">[0.2, -0.5, …]</text>
  </g>
  <g stroke="var(--accent)" stroke-width="0.5" fill="none">
    <line x1="220" y1="55" x2="340" y2="55"/>
    <line x1="220" y1="75" x2="340" y2="75"/>
    <line x1="220" y1="95" x2="340" y2="95"/>
    <line x1="220" y1="115" x2="340" y2="115"/>
    <line x1="220" y1="135" x2="340" y2="135"/>
    <line x1="220" y1="155" x2="340" y2="155"/>
  </g>
  <g fill="var(--accent)" opacity="0.3">
    <rect x="220" y="90" width="120" height="15"/>
  </g>
  <g fill="var(--text-muted)" font-size="9" text-anchor="middle">
    <text x="280" y="100" font-weight="600">řádek 132</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="110" y1="90" x2="220" y2="90" marker-end="url(#embArr)"/>
    <line x1="340" y1="90" x2="430" y2="90" marker-end="url(#embArr)"/>
  </g>
  <defs>
    <marker id="embArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

* **Trénovatelné** — embedding se *učí* gradient descentem jako součást celé sítě.
* **Dense** — typicky `D = 100–768`.
* **Sdíleno** napříč použitími slova v různých větách.

## Distribuční hypotéza

> *„Slova v podobných kontextech mají podobné významy."*  
> *(Zellig Harris, 1954; John Firth: „You shall know a word by the company it keeps.")*

Tedy *vektory* podobných slov v *naučeném* embedding prostoru by měly být *blízko* sebe.

## Word2Vec (Mikolov et al., 2013)

První **specializovaný** algoritmus na učení embeddingů ze surového textu. Dvě varianty:

### CBOW — Continuous Bag-of-Words

* **Vstup**: kontext (sousední slova).
* **Cíl**: predikuj *centrální* slovo.

```
[The cat sat ___ the mat]   → "on"
```

### Skip-gram

* **Vstup**: centrální slovo.
* **Cíl**: predikuj *sousední* slova.

```
"on" → predikuj okolí [the, cat, sat, the, mat]
```

::: svg "Skip-gram: ze středového slova predikuje sousední slova v okně."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="220" y="80" width="100" height="40" rx="4"/>
    <rect x="40" y="20" width="60" height="30" rx="3"/>
    <rect x="40" y="60" width="60" height="30" rx="3"/>
    <rect x="40" y="110" width="60" height="30" rx="3"/>
    <rect x="40" y="150" width="60" height="30" rx="3"/>
    <rect x="440" y="20" width="60" height="30" rx="3"/>
    <rect x="440" y="60" width="60" height="30" rx="3"/>
    <rect x="440" y="110" width="60" height="30" rx="3"/>
    <rect x="440" y="150" width="60" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="270" y="104" font-weight="600">"on"</text>
    <text x="70" y="40">P(the)</text>
    <text x="70" y="80">P(cat)</text>
    <text x="70" y="130">P(sat)</text>
    <text x="70" y="170">P(mat)</text>
    <text x="470" y="40">the</text>
    <text x="470" y="80">cat</text>
    <text x="470" y="130">sat</text>
    <text x="470" y="170">mat</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.3" fill="none">
    <path d="M 220 95 L 100 35"/>
    <path d="M 220 100 L 100 75"/>
    <path d="M 220 105 L 100 125"/>
    <path d="M 220 110 L 100 165"/>
    <path d="M 320 95 L 440 35"/>
    <path d="M 320 100 L 440 75"/>
    <path d="M 320 105 L 440 125"/>
    <path d="M 320 110 L 440 165"/>
  </g>
</svg>
:::

### Trénink

Negative sampling — pro každý pozitivní pár (slovo, kontextové slovo) náhodně vybereme `k` negativních párů (slovo, *náhodné* slovo). Trénujeme binární klasifikátor:

::: math
J = -\log\sigma(\mathbf{e}_w^\top \mathbf{e}_c) - \sum_{i=1}^{k} \log\sigma(-\mathbf{e}_w^\top \mathbf{e}_{n_i})
:::

`e_w` = embedding centrálního slova, `e_c` = embedding skutečného kontextového, `e_{n_i}` = embeddingy negativních samples.

Po tréninku jsou embedding matrice `E` (input) a `E'` (output) — typicky používáme `E`.

::: viz word2vec-skipgram "Pohyb okénka přes korpus; center + context window viditelné; 2D embedding projekce vyznačí podobnost a analogii king−man+woman ≈ queen."
:::

## Vlastnosti naučených embeddingů

### Sémantická podobnost

Slova s podobným významem mají *podobné* vektory:

* `king ≈ monarch ≈ ruler`
* `cat ≈ dog ≈ kitten`
* `car ≈ vehicle ≈ automobile`

Měříme **cosine similarity**:

::: math
\text{sim}(w_1, w_2) = \frac{\mathbf{e}_{w_1}^\top \mathbf{e}_{w_2}}{\|\mathbf{e}_{w_1}\| \cdot \|\mathbf{e}_{w_2}\|}
:::

### Word algebra

Slavná vlastnost Word2Vec:

::: math
\mathbf{e}_{\text{king}} - \mathbf{e}_{\text{man}} + \mathbf{e}_{\text{woman}} \approx \mathbf{e}_{\text{queen}}
:::

Embeddings *zachytí relace*:
* `paris - france + germany ≈ berlin` (země-hlavní město).
* `walking - walk + swim ≈ swimming` (slovesná konjugace).
* `bigger - big + small ≈ smaller` (komparativ).

Tato „linearita" relací byla *překvapivá* a způsobila velkou pozornost o Word2Vec.

::: svg "Word algebra: vektor king - man + woman je blízko vektoru queen."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <line x1="80" y1="160" x2="200" y2="100" marker-end="url(#vecArr)"/>
    <line x1="80" y1="160" x2="120" y2="80" marker-end="url(#vecArr)"/>
    <line x1="320" y1="160" x2="440" y2="100" marker-end="url(#vecArr)"/>
    <line x1="320" y1="160" x2="360" y2="80" marker-end="url(#vecArr)"/>
  </g>
  <defs>
    <marker id="vecArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--accent)">
    <circle cx="80" cy="160" r="3"/>
    <circle cx="200" cy="100" r="3"/>
    <circle cx="120" cy="80" r="3"/>
    <circle cx="320" cy="160" r="3"/>
    <circle cx="440" cy="100" r="3"/>
    <circle cx="360" cy="80" r="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="80" y="180" font-weight="600">man</text>
    <text x="200" y="118" font-weight="600">king</text>
    <text x="120" y="68" font-weight="600">woman</text>
    <text x="320" y="180" font-weight="600">man</text>
    <text x="440" y="118" font-weight="600">king</text>
    <text x="360" y="68" font-weight="600">queen</text>
  </g>
  <g stroke="#e08a3a" stroke-width="1.5" stroke-dasharray="4 3" fill="none">
    <line x1="120" y1="80" x2="240" y2="20" marker-end="url(#vecArr)"/>
  </g>
  <text x="200" y="34" fill="#e08a3a" font-size="10">≈ queen</text>
</svg>
:::

## FastText (Bojanowski et al., 2017)

Vylepšení Word2Vec — embedding *není* per-slovo, ale součet *embeddingů character n-gramů*.

```
"reading" = "<re", "rea", "ead", "adi", "din", "ing", "ng>"
e_reading = sum_n e_{n-gram}
```

* **Out-of-vocabulary** — pro neznámé slovo *poskládáme* embedding z n-gramů. Word2Vec vrátí `<unk>`.
* **Morfologicky bohaté jazyky** (čeština, finština) — slovní tvary `dům`, `domu`, `domem`, `dome` sdílejí n-gramy → vektory blízko sebe. Word2Vec by je viděl jako *nesouvislé*.
* **Velikost slovníku** se *zmenší* (slovník n-gramů + tabulka).

FastText (Facebook AI) poskytuje *pre-trained* vektory pro 157 jazyků, **včetně češtiny**.

## GloVe — Global Vectors (Pennington et al., 2014)

Alternativa k Word2Vec. Místo lokálního window-based učení používá **globální** statistiky:

* Matrix `X_{ij}` = počet, kolikrát se `i` a `j` objeví v okně.
* Cíl: `e_iᵀ e_j ≈ log(X_{ij})`.

Trénink je *deterministický*, prediktor lepší pro některé úlohy.

## Kontextová embeddings

Word2Vec, FastText, GloVe dávají *jediný* vektor pro slovo *bez ohledu na kontext*. Ale slovo `bank` má jiný význam v *„river bank"* vs. *„investment bank"*.

**Kontextová embeddings** dávají *různé* vektory podle kontextu:

* **ELMo** (Peters et al., 2018) — bidirectional LSTM jazykový model.
* **BERT** (Devlin et al., 2018) — transformer encoder, *masked language modeling*.
* **GPT** — transformer decoder, *autoregressive*.

V moderním NLP jsou kontextová embeddings *standardem*. Detail v [[transformer-bert]] a [[llm]].

## Word-piece a subword tokenization

Pro velké slovníky (multilingual modely) se *slova* nahrazují **subword units**:

* **BPE — Byte Pair Encoding** — postupně mergne nejčastější páry znaků/subwordu. Použito v GPT, RoBERTa.
* **WordPiece** (Wu et al., 2016) — varianta BPE. Použito v BERT.
* **SentencePiece** — agnostický k jazyku, nepotřebuje pre-tokenization. Použito v T5, mBERT.

Slovník typicky `30k–50k` subword tokenů — pokrývá *všechny jazyky* a *všechny tvary*.

```
"unhappiness" → ["un", "happiness"]   nebo  ["un", "hap", "pi", "ness"]
"chatGPT"     → ["chat", "G", "PT"]
```

Toto je *de facto* standard pro moderní LLM. Detail v [[llm]].

## Praktické použití

```python
import torch.nn as nn

# Pre-trained FastText vektory
import fasttext
ft = fasttext.load_model('cc.cs.300.bin')   # češtinské vektory
e = ft.get_word_vector('inteligence')   # 300-dim

# V PyTorch — vlastní embedding (trénovatelný)
embedding = nn.Embedding(vocab_size=30000, embedding_dim=300)
e = embedding(torch.tensor([word_idx]))

# Inicializace z pre-trained
embedding.weight.data.copy_(torch.from_numpy(pretrained_matrix))
```

## Bias v embeddingech

Embeddings *zachytí* zaujatosti z trénovacího korpusu:

* `man : doctor :: woman : nurse` (gender stereotyping)
* `homeless : person :: minority : person` (rasové asociace)

Toto je *etický problém*. **Debiasing** technik existuje, ale problém je *systémový*. Pro produkční systémy: *zvážit* bias audity.

::: link "Mikolov et al.: Efficient Estimation of Word Representations in Vector Space (ICLR, 2013)" "https://arxiv.org/abs/1301.3781"
:::

::: link "Pennington et al.: GloVe — Global Vectors for Word Representation (EMNLP, 2014)" "https://nlp.stanford.edu/pubs/glove.pdf"
:::

::: link "Bojanowski et al.: FastText — Enriching Word Vectors with Subword Information (TACL, 2017)" "https://arxiv.org/abs/1607.04606"
:::

::: link "fasttext.cc — Pre-trained vectors for 157 languages" "https://fasttext.cc/docs/en/crawl-vectors.html"
:::

::: link "Piotr Migdał: King - Man + Woman = Queen (vizualizace)" "https://p.migdal.pl/2017/01/06/king-man-woman-queen-why.html"
:::

---

*Zdroj: SUI přednášky 2025/26, *Sequences and language* (Hradiš). Externí reference: Mikolov, T. et al.: *Word2Vec* (ICLR 2013); Pennington, J. et al.: *GloVe* (EMNLP 2014); Bojanowski, P. et al.: *FastText* (TACL 2017); Bolukbasi, T. et al.: *Man is to Computer Programmer as Woman is to Homemaker?* (NeurIPS 2016) — bias paper.*
