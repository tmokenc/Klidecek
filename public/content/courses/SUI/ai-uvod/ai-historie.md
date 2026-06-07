---
title: Historie AI a dvě tradice
---

# Historie AI a dvě tradice

AI má kořeny ve **dvou paralelních tradicích**, které se po desetiletí *střídaly* v převaze. Jejich sbližování v moderním hlubokém učení (deep learning) je hlavním vědeckým příběhem posledních let.

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

* Inteligence = manipulace se **symboly** podle **logických pravidel**.
* Vychází z **logiky** (Aristoteles, Frege, Russell, Gödel) a **počítačů** (Turing, von Neumann).
* Převládala v letech 1950–1980 a v některých podoborech (plánování, formální verifikace) dodnes.

### Konekcionistická / sub-symbolická AI

* Inteligence = **emergentní** (vynořující se) vlastnost sítí jednoduchých prvků (neuronů). Tedy chytré chování nevzniká z jednoho pravidla, ale ze spolupráce mnoha jednoduchých částí.
* Vychází z **neurovědy** (McCulloch-Pitts) a **statistiky** (Bayes, Fisher).
* Převládá od roku 2010 do současnosti (díky velkým datům a výpočetnímu výkonu).

## Linie dějin

### Začátky (1940.–1950. léta)

* **1943** — McCulloch & Pitts: *A Logical Calculus of the Ideas Immanent in Nervous Activity*. **První matematický model neuronu**. Spojení logiky a neuronů.
* **1950** — Alan Turing: *Computing Machinery and Intelligence*. Turingův test.
* **1952** — Arthur Samuel: program pro *dámu*, který se *učí* (algoritmus alfa-beta a heuristické naučené váhy). První program, který se učil sám.
* **1955** — Newell & Simon: *Logic Theorist* — dokazování teorémů z *Principia Mathematica*.

### Dartmouthská konference (1956)

Léto 1956, Dartmouth College, organizováno *Johnem McCarthym* (Dartmouth), *Marvinem Minskym* (MIT), *Claudem Shannonem* (Bell Labs), *Nathanielm Rochesterem* (IBM):

> *Návrh: každý aspekt učení nebo jakékoli jiné rysy inteligence lze tak přesně popsat, že stroj může být zkonstruován tak, aby ho simuloval.*

**Tehdy se objevil termín „umělá inteligence" (artificial intelligence)**. Konference se považuje za *zrod oboru*.

### Optimistická éra (1950.–1960. léta)

* **1957** — Frank Rosenblatt: *Perceptron* — první trénovatelný lineární klasifikátor s perceptronovým pravidlem učení (úprava vah řízená chybou). Síť tedy upravuje své váhy podle toho, jak moc se v predikci spletla.
* **1958** — McCarthy: LISP — programovací jazyk pro AI.
* **1959** — Newell & Simon: *General Problem Solver* (GPS).
* **1966** — Joseph Weizenbaum: *ELIZA* — chatbot (psychoterapeut), který dokázal uživatele zmást.

> **Marvin Minsky (1967):** *„Během deseti let budou problémy umělé inteligence v zásadě vyřešeny."*
> **Herbert Simon (1965):** *„Stroje budou do dvaceti let schopny vykonávat jakoukoli práci, kterou zvládne člověk."*

Tento optimismus byl ale *přehnaný* — nikdo netušil, jak těžké je orientovat se ve světě se *zdravým rozumem*.

### Problémy a první zima AI (AI Winter, konec 60. a 70. léta)

Po zvládnutí hraní her a jednoduchých úloh narazila symbolická AI na **kombinatorickou explozi** (lavinový nárůst počtu možností) a na potřebu *znalostí o reálném světě*:

* **Hrubé překladače**: legendární anekdota — věta „*Duch je odhodlaný, ale tělo je slabé*" (*The spirit is willing but the flesh is weak*) se po překladu do ruštiny a zpět vrátila jako *„Vodka je dobrá, ale maso je zkažené"* (*The vodka is good but the meat is rotten*).
* **Reálný svět**: pravidla nestačí — svět je *nepřesný*, *nejistý* a *nevyřčený* (implicitní).
* **Výpočetní výkon**: stroje 60. let měly jen *kilobajty* paměti.

**1966**: zpráva ALPAC — strojový překlad „nevyhovuje". Vláda USA *ukončila financování*. Přišla *první zima AI*.

### Znalostní systémy (1970.–80. léta)

Symbolická AI hledá novou cestu — **expertní systémy**. Místo *obecné* inteligence se vytěžuje *konkrétní oborová* znalost ve formě pravidel typu **„když–pak" (if-then)**:

* **DENDRAL** (Stanford, od 1965): identifikace molekul z hmotnostní spektrometrie.
* **MYCIN** (Stanford, 1972): diagnostika krevních infekcí. Dokázal diagnostikovat lépe než většina lékařů.
* **XCON** (Digital Equipment, 1982): konfigurace počítačů VAX/PDP. Roční úspora `$25M`.

**Komerční úspěch**: v roce 1990 mělo nějaký expertní systém 60 % firem z žebříčku Fortune 500. **Ale**:

* **Báze znalostí** (knowledge base) byla *drahá* (rozhovory s experty, ruční tvorba pravidel).
* **Křehkost** mimo úzce zaměřenou oblast.
* **Aktualizace** se musela dělat *ručně*.

### Druhá zima AI (konec 80. let)

Projevily se limity expertních systémů. Počítače *Lisp Machines* zkrachovaly. Přišel druhý pokles financování.

### Renesance — strojové učení (90. léta)

Po první zimě AI se začala formovat *jiná* AI — **statistická, řízená daty** (data-driven):

* **Bayesovské sítě** (Pearl 1985) — pravděpodobnostní modely.
* **SVM** (Vapnik 1995) — jádrové (kernelové) metody pro klasifikaci.
* **Rozhodovací stromy, náhodné lesy** (decision trees, random forests) — robustní obecné metody.
* **HMM-GMM** — převládaly v rozpoznávání řeči.

**1997** — *Deep Blue* (IBM) porazil Garryho Kasparova v šachu. Šlo o symbolickou AI: hluboké prohledávání, databáze a algoritmus α-β.

### Konekcionistická AI — pomalý pokrok

Mezitím se *v ústraní* vyvíjela neuronová cesta:

* **1969** — Minsky & Papert: *Perceptrons* — kniha ukázala, že lineární perceptron nedokáže řešit funkci XOR. To *pohřbilo* zájem o neuronové sítě na 15 let.
* **1986** — Rumelhart, Hinton, Williams: popularizace metody zpětného šíření chyby (**backpropagation**) pro trénování vícevrstvých sítí. Začátek *druhé vlny* neuronových sítí.
* **1989** — Yann LeCun: *Handwritten Zip Code Recognition with Multilayer Networks* — první *prakticky použitelná* CNN.
* **1997** — Hochreiter & Schmidhuber: **LSTM** ([[rnn-lstm]]).
* **2006** — Hinton: *Deep Belief Networks* — předtrénování (pre-training) pro hluboké sítě.

### Zlatý věk (2012–současnost)

* **2012** — **AlexNet** (Krizhevsky, Sutskever, Hinton): hluboká CNN výrazně překonala dosavadní špičku (state-of-the-art) na datové sadě ImageNet (16% chyba top-5 oproti 26%). *Začátek revoluce hlubokého učení*.
* **2013** — *Word2Vec* (Mikolov): efektivní vektorové reprezentace slov (word embeddings).
* **2013** — DQN (Mnih et al.): hraní her *Atari* přímo z obrazových pixelů pomocí hlubokého zpětnovazebního učení (deep RL).
* **2014** — *Sequence-to-sequence* (Sutskever, Vinyals, Le): strojový překlad.
* **2014** — **GAN** (Goodfellow): generativní soupeřící (adversariální) sítě.
* **2015** — **ResNet** (He et al.): přeskakující spoje (skip connections), 152 vrstev, na ImageNetu chyba 3,6 %.
* **2016** — **AlphaGo** (DeepMind): porazil Lee Sedola ve hře go.
* **2017** — **Transformer** (Vaswani et al.): *Attention Is All You Need*.
* **2017** — **AlphaZero**: jedna síť hraje šachy, shogi i go bez lidských dat.
* **2018** — **BERT** (Google): maskované jazykové modelování (masked language modeling), převládalo v NLP.
* **2019** — **GPT-2** (OpenAI): velký jazykový model, autoregresivní.
* **2020** — **GPT-3**: 175 miliard parametrů, učení z mála příkladů (few-shot learning).
* **2021** — **DALL-E**, **AlphaFold 2** (Nobelova cena za chemii 2024).
* **2022** — **ChatGPT** veřejně dostupný, *masivní* společenský dopad.
* **2023+** — **GPT-4**, **Claude**, **Gemini**, **LLaMA** jako open-source, **agentní LLM**.

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
* **Metoda nejmenších čtverců** (least squares; Gauss, 1795) — z astronomie.
* **Predikátová logika** (Frege, 1893) — z logiky.
* **Metoda maximální věrohodnosti** (maximum likelihood; Fisher, 1922) — ze statistiky.
* **Neuronové sítě** (McCulloch, Pitts, 1943) — z neurovědy.
* **Minimax** (von Neumann, 1944) — z ekonomie a teorie her.
* **Stochastický gradientní sestup** (stochastic gradient descent; Robbins, Monro, 1951) — z optimalizace.
* **Prohledávání podle ceny / Dijkstra** (uniform-cost; Dijkstra, 1956) — z algoritmů.
* **Iterace hodnot** (value iteration; Bellman, 1957) — z teorie řízení.
* **Pozornost** (attention; Bahdanau, 2014) — z neuronových sítí a psychologie.

AI je *výsledným* uplatněním myšlenek, které se dlouho rodily v jiných oborech.

## Současný stav — kde stojíme

* **Úzká AI** (narrow AI) — *dramaticky úspěšná*. Vidění, řeč, překlad, hraní her, doporučování.
* **Široká AI / základové modely** (foundation models) — LLM jako *univerzální* nástroje. Občas překvapivě dobré, občas selhávají na základní logice (*halucinace*).
* **AGI** (obecná umělá inteligence) — *otevřená otázka*. Někteří experti tvrdí, že LLM jsou tou správnou cestou; jiní, že potřebujeme radikálně jiné techniky (integrace se symbolickými přístupy, modely světa, ukotvení v těle a prostředí — embodiment).

::: link "Russell & Norvig: AIMA, kap. 1 — A Brief History of AI" "http://aima.cs.berkeley.edu/"
:::

::: link "Nilsson, N.: The Quest for Artificial Intelligence (Cambridge UP, 2009)" "https://ai.stanford.edu/~nilsson/QAI/qai.pdf"
:::

::: link "Goodfellow, Bengio, Courville: Deep Learning — historický kontext v kap. 1.2" "https://www.deeplearningbook.org/contents/intro.html"
:::

---

*Zdroj: SUI přednášky 2025/26, *Úvod do AI* (Hradiš). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 1; Nilsson, N.: *The Quest for AI — A History of Ideas and Achievements* (Cambridge UP 2009) — [free PDF](https://ai.stanford.edu/~nilsson/QAI/qai.pdf); Goodfellow, I., Bengio, Y., Courville, A.: *Deep Learning* (MIT 2016), kap. 1.2; Crevier, D.: *AI — The Tumultuous History of the Search for Artificial Intelligence* (Basic Books 1993).*
