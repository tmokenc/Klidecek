---
title: Co je umělá inteligence
---

# Co je umělá inteligence

**Umělá inteligence** (AI) je široký *interdisciplinární obor* zaměřený na systémy, které řeší úlohy *vyžadující inteligenci*. „Inteligenci" lze definovat různě — *žádná* z definic není univerzálně přijímaná. Z praktického hlediska AI rozlišujeme dva *přístupy*:

## Strong AI vs. narrow AI

::: svg "Dva pohledy na AI: silná AI usiluje o obecnou inteligenci, slabá / specifická AI o užitečné nástroje pro konkrétní úlohu."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <rect x="30" y="30" width="220" height="140" rx="8"/>
    <rect x="290" y="30" width="220" height="140" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="140" y="58" font-size="13" font-weight="600">Silná AI (strong, AGI)</text>
    <text x="140" y="80" font-size="11" fill="var(--text-muted)">Jak vytvořit obecnou inteligenci?</text>
    <text x="400" y="58" font-size="13" font-weight="600">Slabá / narrow AI</text>
    <text x="400" y="80" font-size="11" fill="var(--text-muted)">Jak vytvořit užitečné nástroje?</text>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10.5">
    <text x="42" y="106">• Filosofická otázka</text>
    <text x="42" y="124">• Turingův test, AGI</text>
    <text x="42" y="142">• Možná zatím nedosaženo</text>
    <text x="42" y="158">• Vědecký cíl (pomalý pokrok)</text>
    <text x="300" y="106">• Inženýrská otázka</text>
    <text x="300" y="124">• Konkrétní úlohy + metriky</text>
    <text x="300" y="142">• Pragmatický pokrok</text>
    <text x="300" y="158">• Vše kolem nás</text>
  </g>
</svg>
:::

### Slabá / narrow AI

Konstrukce nástrojů pro **konkrétní úlohu**. Žádné nároky na obecnou inteligenci.

* Spam filter, recommendation engine, OCR, speech recognition, ChatGPT pro shrnutí textu.
* **Měřitelná** efektivita: accuracy, precision/recall, BLEU, F1, perplexity.
* **Toto je** to, co dnes ovládá obor — a co bude předmětem dalších kapitol.

### Silná AI (AGI — Artificial General Intelligence)

Umělá *obecná* inteligence, srovnatelná s lidskou napříč mnoha úlohami.

* Otázka: *Co je to vlastně inteligence?*
* Po desetiletí pomalý pokrok; LLM (GPT-4, Claude, Gemini) v 2023-2026 výrazně posunuly hranici toho, co umí jeden model. Diskutuje se, zda jdou *cestou* k AGI.

## Turingův test

**A. M. Turing** (1950) navrhl operativní kritérium *inteligence*:

> *Pokud člověk-soudce nedokáže rozlišit komunikaci s počítačem od komunikace s člověkem, je počítač *inteligentní*.*

**Imitation Game**: soudce komunikuje *psaným textem* se dvěma účastníky (jeden člověk, druhý stroj), neví, kdo je kdo. Pokud po `5` minutách soudce nedokáže určit lépe než s pravděpodobností `> 70 %`, stroj prošel.

::: svg "Turingův test: soudce vs. člověk a stroj přes textový kanál."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <circle cx="80" cy="100" r="30"/>
    <circle cx="270" cy="60" r="22"/>
    <circle cx="270" cy="140" r="22"/>
    <rect x="430" y="60" width="80" height="40" rx="6"/>
    <rect x="430" y="120" width="80" height="40" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="80" y="104" font-weight="600">Soudce</text>
    <text x="80" y="120" font-size="9" fill="var(--text-muted)">člověk</text>
    <text x="270" y="64" font-size="11">?</text>
    <text x="270" y="144" font-size="11">?</text>
    <text x="470" y="84">člověk</text>
    <text x="470" y="144">stroj</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.3" fill="none">
    <path d="M 110 90 L 248 70"/>
    <path d="M 110 110 L 248 132"/>
    <path d="M 292 60 L 430 80"/>
    <path d="M 292 140 L 430 140"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="170" y="60">text</text>
    <text x="170" y="152">text</text>
    <text x="270" y="190">Anonymizovaná komunikace; soudce hádá, kdo je kdo.</text>
  </g>
</svg>
:::

### Kritika Turingova testu

* **Test je *imitací*, ne *myšlením***. Stroj může *předstírat* člověka, aniž skutečně rozumí.
* **Záleží na soudci** — naivní soudce naletí i jednoduchému *chatbotu*. ELIZA (1966, Weizenbaum) zmátla mnoho lidí *jen* rephrazováním otázek.
* **Test má slabou definici inteligence** — co s inteligentními systémy *nepodobnými* člověku?

## Čínský pokoj (Chinese Room)

**John Searle** (1980) — myšlenkový experiment proti silné AI:

> *Představte si místnost s mechanizovaným zpracovatelem. Dovnitř přicházejí *čínské* znaky, on je *podle pravidel* manipuluje a posílá ven odpovědi. Zvenku to vypadá jako rozhovor s rodilým Číňanem. Ale uvnitř *nikdo nerozumí* čínsky — jen mechanicky aplikuje pravidla.*

**Tvrzení**: stejně tak *žádný* program *nerozumí* — jen manipuluje symboly. Tedy *strong AI je nemožná* jen programovým zpracováním.

### Reakce

* **Systems reply** — místnost *jako celek* rozumí, ne jednotlivý exekutor pravidel.
* **Robot reply** — pokud bychom místnost vsadili do robota se senzory, *vznikne* porozumění interakcí se světem.
* **Brain simulator reply** — kdybychom simulovali *každý neuron* v mozku Číňana, vědomí by *muselo* vzniknout. Pak proto, co ne v *jiném* substrátu?

Toto je *hluboký filosofický* spor — žádná konsenzuální odpověď. **Mnohé** subdisciplíny AI tuto debatu *ignorují* a soustředí se na *funkcionalitu*.

## Co je vlastně inteligence?

Sloučenina mnoha schopností. Tom Mikolov et al. (2016) navrhuje *roadmap*:

* **Vnímání** (perception) — vidění, slyšení, dotyk, čich.
* **Motorická kontrola** — pohyb, manipulace s objekty.
* **Jazyk** — porozumění a produkce přirozeného jazyka.
* **Uvažování** (reasoning) — logické vyvozování, plánování, řešení problémů.
* **Učení** — z příkladu, ze zkušenosti, ze zpětné vazby.
* **Predikce** — odhad budoucího stavu světa.
* **Intuice** — rychlé heuristické rozhodování.
* **Cíle** — pro něco usilovat, pro něco se snažit.
* **Imaginace** — generování scénářů, kontrafaktuál.
* **Emoce** — afektivní reakce (kontroverzní u AI).
* **Sebeuvědomění** — vnímání sama sebe jako agenta.
* **Vědomí** — subjektivní zkušenost (nejhlubší filosofická otázka).

Současné systémy umí *některé* — vnímání, jazyk, uvažování (částečně) — *mnohé jiné* nikoliv (sebeuvědomění, vědomí). Otevřená otázka: musí AGI mít *všechny*, nebo stačí *kompetentní výkon* v širokém spektru úloh?

## Tři vrstvy řešení AI úloh

Stanford CS221 / Russell-Norvig nabízí trojúhelník:

::: svg "Modelování — inference — učení: tři vrstvy řešení libovolné AI úlohy."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <polygon points="270,30 130,200 410,200" stroke="var(--accent)" fill="var(--bg-card)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="12" font-weight="600">
    <text x="270" y="60">Modelování</text>
    <text x="155" y="200">Inference</text>
    <text x="385" y="200">Učení</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="270" y="78">Jak reprezentovat úlohu a svět?</text>
    <text x="270" y="92">Vstupy, výstupy, model?</text>
    <text x="155" y="216">Jak najít odpovědi v modelu?</text>
    <text x="385" y="216">Jak získat model z dat?</text>
  </g>
</svg>
:::

### Modelování

Formulace úlohy jako *matematického modelu*. Co jsou *vstupy*, co *výstupy*, *typ* modelu (klasifikátor, regresor, agent, planner). Návrhové rozhodnutí.

### Inference

V daném modelu *odpovídat na otázky*. Algoritmické zpracování — prohledávání, optimalizace, vzorkování, propagace, ...

### Učení

Získání parametrů modelu z dat. Strojové učení.

**Mantra**: na každou úlohu se ptáme: 1) Jak ji modelujeme? 2) Jak v modelu odvozujeme? 3) Jak se model učí?

## Klíčový princip — generalizace

Centrální nárok ML: model se *naučí* na trénovacích datech a má *zobecnit* na *neviděná* data. Bez generalizace je ML jen *zapamatováním* trénovacího setu — bez praktického využití.

**Bias-variance trade-off**, **regularizace**, **distribuovaný shift**, **out-of-distribution** generalization — všechno řeší tento problém.

## Sub-fields AI

* **Machine Learning** (ML) — učení z dat.
* **Neural Networks** / **Deep Learning** — vícevrstvé sítě.
* **Computer Vision** — zpracování obrazů a videa.
* **Natural Language Processing** (NLP) — text a řeč.
* **Speech Processing** — rozpoznávání a syntéza řeči.
* **Robotics** — fyzické agenty.
* **Knowledge Representation & Reasoning** — symbolická AI.
* **Planning** — sekvenční rozhodování.
* **Expert systems** — pravidla z znalostí.
* **Evolutionary Computation** — genetické algoritmy.

## Multidisciplinární obor

AI čerpá z mnoha věd:

* **Matematika** — pravděpodobnost, statistika, optimalizace, lineární algebra.
* **Statistika** — odhad parametrů, testy hypotéz, regrese.
* **Logika** — predikátový kalkul, automatizované dokazování.
* **Ekonomie** — teorie her, rozhodovací teorie, multi-agent systémy.
* **Lingvistika** — formální gramatiky, sémantika.
* **Neurověda** — inspirace pro neuronové sítě.
* **Filosofie mysli** — povaha vědomí, kvalia, mysl-tělo.
* **Etika** — fairness, bias, accountability, transparency, alignment.

::: link "AIMA, kap. 1 — Introduction, kap. 26 — Philosophical Foundations" "http://aima.cs.berkeley.edu/"
:::

::: link "Turing, A. M.: Computing Machinery and Intelligence (Mind, 1950)" "https://doi.org/10.1093/mind/LIX.236.433"
:::

::: link "Searle, J.: Minds, Brains, and Programs (BBS, 1980)" "https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/minds-brains-and-programs/DC644B47A4299C637C89772FACC2706A"
:::

::: link "Stanford CS221: Artificial Intelligence — kurz" "https://stanford-cs221.github.io/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Úvod do umělé inteligence* (Hradiš). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 1 + 26; Turing, A. M.: *Computing Machinery and Intelligence* (Mind 59, 1950); Searle, J.: *Minds, Brains, and Programs* (BBS 3, 1980); Nilsson, N.: *The Quest for Artificial Intelligence — A History of Ideas and Achievements* (Cambridge UP 2009).*
