---
title: Historie AI a dvě tradice
---

# Historie AI a dvě tradice

AI má kořeny ve **dvou paralelních tradicích**, které se po desetiletí *střídaly* v dominanci. Jejich konvergence v moderním deep learningu je hlavní vědecký příběh posledních let.

## Dvě tradice

::: svg "Dvě tradice AI: symbolická (logika, znalosti, prohledávání) a konekcionistická (neurony, statistika, učení)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <rect x="30" y="20" width="220" height="160" rx="8"/>
    <rect x="290" y="20" width="220" height="160" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="12.5" font-weight="600">
    <text x="140" y="46">Symbolická AI (GOFAI)</text>
    <text x="400" y="46">Konekcionistická AI</text>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10.5">
    <text x="40" y="72">• Logika, predikátový kalkul</text>
    <text x="40" y="90">• Diskrétní znalosti, pravidla</text>
    <text x="40" y="108">• Prohledávání stavů</text>
    <text x="40" y="126">• Hry (šachy, dáma)</text>
    <text x="40" y="144">• Expertní systémy</text>
    <text x="40" y="162">• „Top-down" — od logiky</text>
    <text x="300" y="72">• Neurony, gradienty</text>
    <text x="300" y="90">• Distribuovaná reprezentace</text>
    <text x="300" y="108">• Strojové učení z dat</text>
    <text x="300" y="126">• Vidění, řeč, jazyk</text>
    <text x="300" y="144">• Neuronové sítě</text>
    <text x="300" y="162">• „Bottom-up" — od mozku</text>
  </g>
</svg>
:::

### Symbolická AI (GOFAI — *Good Old-Fashioned AI*)

* Inteligence = manipulace **symboly** podle **logických pravidel**.
* Vychází z **logiky** (Aristoteles, Frege, Russell, Gödel) a **počítačů** (Turing, von Neumann).
* Dominantní: 1950s-1980s a v některých subdisciplínách (plánování, formální verifikace) dodnes.

### Konekcionistická / sub-symbolická AI

* Inteligence = **emergentní** vlastnost sítí jednoduchých prvků (neuronů).
* Vychází z **neurovědy** (McCulloch-Pitts) a **statistiky** (Bayes, Fisher).
* Dominantní: 2010s-současnost (díky velkým datům + výpočetnímu výkonu).

## Linie dějin

### Začátky (1940s-1950s)

* **1943** — McCulloch & Pitts: *A Logical Calculus of the Ideas Immanent in Nervous Activity*. **První matematický model neuronu**. Spojení logiky a neuronů.
* **1950** — Alan Turing: *Computing Machinery and Intelligence*. Turingův test.
* **1952** — Arthur Samuel: program pro *dámu*, který se *učí* (alpha-beta + heuristické *learned weights*). První *self-learning* program.
* **1955** — Newell & Simon: *Logic Theorist* — dokazování teorémů z *Principia Mathematica*.

### Dartmouth Conference (1956)

Léto 1956, Dartmouth College, organizováno *Johnem McCarthym* (Stanford), *Marvinem Minskym* (MIT), *Claudem Shannonem* (Bell Labs), *Nathanielm Rochesterem* (IBM):

> *Návrh: každý aspekt učení nebo jakékoli jiné rysy inteligence lze tak přesně popsat, že stroj může být zkonstruován tak, aby ho simuloval.*

**Tehdy se objevil termín „artificial intelligence"**. Konference se považuje za *zrod oboru*.

### Optimistická éra (1950s-1960s)

* **1957** — Frank Rosenblatt: *Perceptron* — první lineární klasifikátor s gradientovým učením.
* **1958** — McCarthy: LISP — programovací jazyk pro AI.
* **1959** — Newell & Simon: *General Problem Solver* (GPS).
* **1966** — Joseph Weizenbaum: *ELIZA* — chatbot (psychoterapeut), zmátl uživatele.

> **Marvin Minsky (1967):** *„Within 10 years the problems of artificial intelligence will be substantially solved."*
> **Herbert Simon (1965):** *„Machines will be capable, within twenty years, of doing any work a man can do."*

Optimismus byl ale *nadhodnocený* — nikdo netušil, jak těžké je *zdravým rozumem* operovat ve světě.

### Problémy a první AI Winter (konec 1960s-70s)

Po překonání hraní her a triviálních úloh narazila symbolická AI na **kombinatorickou explozi** a *real-world knowledge*:

* **Hrubé překladače**: legendární anekdota „*The spirit is willing but the flesh is weak*" → překlad do ruštiny zpět → *„The vodka is good but the meat is rotten"*.
* **Real world**: pravidla nestačí — svět je *nepřesný*, *nejistý*, *implicitní*.
* **Computation**: stroje 60. let měly *kilobyte* paměti.

**1966**: ALPAC report — strojový překlad „nevyhovuje". US government *ukončil financování*. *První AI Winter*.

### Knowledge-based systems (1970s-80s)

Symbolická AI hledá novou cestu — **expertní systémy**. Místo *obecné* inteligence se extrahuje *konkrétní doménová* znalost ve formě **if-then pravidel**:

* **DENDRAL** (Stanford, 1965-): identifikace molekul z hmotnostní spektrometrie.
* **MYCIN** (Stanford, 1972): diagnóza krevních infekcí. Dokázala lépe diagnostikovat než většina lékařů.
* **XCON** (Digital Equipment, 1982): konfigurace VAX/PDP počítačů. Roční úspora `$25M`.

**Komerční úspěch**: 60% Fortune 500 mělo nějaký expertní systém v 1990. **Ale**:

* **Knowledge base** byla *drahá* (expertní rozhovory, pravidlový engineering).
* **Křehkost** mimo zaměřenou oblast.
* **Update** byl *manuální*.

### Druhý AI Winter (konec 80s)

Limity expertních systémů. *Lisp Machines* zkrachovaly. Druhý pokles financování.

### Renesance — strojové učení (90s)

Po prvním AI Winteru se začala formovat *jiná* AI — **statistická / data-driven**:

* **Bayesovské sítě** (Pearl 1985) — pravděpodobnostní modely.
* **SVM** (Vapnik 1995) — kernelové metody pro klasifikaci.
* **Decision trees, random forests** — robustní obecné metody.
* **HMM-GMM** — dominantní v rozpoznávání řeči.

**1997** — *Deep Blue* (IBM) porazil Garryho Kasparova v šachu. Symbolická AI: hluboké prohledávání + databáze + α-β.

### Konekcionistická AI — pomalý pokrok

Mezitím se v *podzemí* vyvíjela neuronová cesta:

* **1969** — Minsky & Papert: *Perceptrons* — kniha ukázala, že lineární perceptron nedokáže řešit XOR. *Zabila* zájem o neuronky na 15 let.
* **1986** — Rumelhart, Hinton, Williams: popularizace **backpropagation** pro tréning vícevrstvých sítí. Začátek *druhé vlny* neuronek.
* **1989** — Yann LeCun: *Handwritten Zip Code Recognition with Multilayer Networks* — první *praktická* CNN.
* **1997** — Hochreiter & Schmidhuber: **LSTM** ([[rnn-lstm]]).
* **2006** — Hinton: *Deep Belief Networks* — pre-training pro hluboké sítě.

### Golden age (2012-současnost)

* **2012** — **AlexNet** (Krizhevsky, Sutskever, Hinton): hluboká CNN výrazně překonala dosavadní state-of-the-art na ImageNet (16% top-5 error vs. 26%). *Začátek deep learning revoluce*.
* **2013** — *Word2Vec* (Mikolov): efficient word embeddings.
* **2013** — DQN (Mnih et al.): hraní *Atari* hry z pixelů přes deep RL.
* **2014** — *Sequence-to-sequence* (Sutskever, Vinyals, Le): translation.
* **2014** — **GAN** (Goodfellow): generativní adversariální sítě.
* **2015** — **ResNet** (He et al.): skip connections, 152 vrstev, ImageNet 3.6% error.
* **2016** — **AlphaGo** (DeepMind): porazil Lee Sedola v Go.
* **2017** — **Transformer** (Vaswani et al.): *Attention Is All You Need*.
* **2017** — **AlphaZero**: jedna síť hraje šachy, shogi, Go bez lidských dat.
* **2018** — **BERT** (Google): masked language modeling, dominantní v NLP.
* **2019** — **GPT-2** (OpenAI): velký jazykový model, autoregresivní.
* **2020** — **GPT-3**: 175 mld parametrů, few-shot learning.
* **2021** — **DALL-E**, **AlphaFold 2** (Nobelova cena 2024 pro chemii).
* **2022** — **ChatGPT** veřejně dostupné, *masivní* společenský dopad.
* **2023+** — **GPT-4**, **Claude**, **Gemini**, **LLaMA** open-source, **agentní LLM**.

::: svg "Linie pokroku AI: opakované cykly nadějí, zklamání (AI winter) a průlomů."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6" fill="none">
    <line x1="30" y1="170" x2="520" y2="170"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="60" y="186">1956</text>
    <text x="160" y="186">1980</text>
    <text x="260" y="186">2000</text>
    <text x="360" y="186">2012</text>
    <text x="460" y="186">2025</text>
  </g>
  <path d="M 30 130 C 80 100 130 90 180 110 C 230 130 280 125 330 95 C 380 65 430 30 510 20" 
        stroke="var(--accent)" stroke-width="2" fill="none"/>
  <g fill="var(--text)" font-size="10">
    <text x="80" y="80">Optimismus, GPS</text>
    <text x="160" y="155">AI Winter #1</text>
    <text x="240" y="80">Expert sys.</text>
    <text x="300" y="135">AI Winter #2</text>
    <text x="370" y="55">Deep Learning</text>
    <text x="450" y="30">LLM</text>
  </g>
  <g fill="var(--accent)">
    <circle cx="60" cy="125" r="3"/>
    <circle cx="120" cy="108" r="3"/>
    <circle cx="200" cy="115" r="3"/>
    <circle cx="290" cy="100" r="3"/>
    <circle cx="360" cy="65" r="3"/>
    <circle cx="450" cy="35" r="3"/>
  </g>
</svg>
:::

## AI je *interdisciplinární* — výpůjčky odjinud

AI nepracuje izolovaně. Konkrétní *užitečné nápady*:

* **Bayesovo pravidlo** (Bayes, 1763) — z pravděpodobnosti.
* **Least squares** (Gauss, 1795) — z astronomie.
* **Predikátová logika** (Frege, 1893) — z logiky.
* **Maximum likelihood** (Fisher, 1922) — ze statistiky.
* **Neuronové sítě** (McCulloch, Pitts, 1943) — z neurovědy.
* **Minimax** (von Neumann, 1944) — z ekonomie / teorie her.
* **Stochastic gradient descent** (Robbins, Monro, 1951) — z optimalizace.
* **Uniform-cost / Dijkstra** (Dijkstra, 1956) — z algoritmů.
* **Value iteration** (Bellman, 1957) — z teorie řízení.
* **Attention** (Bahdanau, 2014) — z neuronek + psychologie.

AI je *konečnou* aplikací myšlenek, které se dlouho rodily v jiných oborech.

## Současný stav — kde stojíme

* **Narrow AI** — *dramaticky úspěšná*. Vidění, řeč, překlad, hra, doporučení.
* **Široké AI / foundation models** — LLM jako *univerzální* nástroje. Občas překvapivě dobré, občas selhávají na základní logice (*hallucination*).
* **AGI** — *otevřená otázka*. Někteří experti tvrdí, že LLM jsou cestou; jiní, že potřebujeme radikálně jiné techniky (symbolické integrace, world models, embodiment).

::: link "Russell & Norvig: AIMA, kap. 1 — A Brief History of AI" "http://aima.cs.berkeley.edu/"
:::

::: link "Nilsson, N.: The Quest for Artificial Intelligence (Cambridge UP, 2009)" "https://ai.stanford.edu/~nilsson/QAI/qai.pdf"
:::

::: link "Goodfellow, Bengio, Courville: Deep Learning — historický kontext v kap. 1.2" "https://www.deeplearningbook.org/contents/intro.html"
:::

---

*Zdroj: SUI přednášky 2025/26, *Úvod do AI* (Hradiš). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 1; Nilsson, N.: *The Quest for AI — A History of Ideas and Achievements* (Cambridge UP 2009) — [free PDF](https://ai.stanford.edu/~nilsson/QAI/qai.pdf); Goodfellow, I., Bengio, Y., Courville, A.: *Deep Learning* (MIT 2016), kap. 1.2; Crevier, D.: *AI — The Tumultuous History of the Search for Artificial Intelligence* (Basic Books 1993).*
