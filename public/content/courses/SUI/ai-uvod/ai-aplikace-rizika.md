---
title: Aplikace a rizika AI
---

# Aplikace a rizika AI

AI dnes proniká do *všech* oblastí života. Tato kapitola shrnuje *praktické* aplikace, *etická* a *společenská* rizika a *regulatorní* rámec (EU AI Act).

## AI ve všedním životě

::: svg "AI dnes: od vyhledávačů po jazykové modely, biometriku, chatboty a self-driving."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="20" y="20" width="120" height="60" rx="6"/>
    <rect x="155" y="20" width="120" height="60" rx="6"/>
    <rect x="290" y="20" width="120" height="60" rx="6"/>
    <rect x="425" y="20" width="100" height="60" rx="6"/>
    <rect x="20" y="100" width="120" height="60" rx="6"/>
    <rect x="155" y="100" width="120" height="60" rx="6"/>
    <rect x="290" y="100" width="120" height="60" rx="6"/>
    <rect x="425" y="100" width="100" height="60" rx="6"/>
    <rect x="60" y="180" width="200" height="30" rx="6"/>
    <rect x="280" y="180" width="200" height="30" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10.5">
    <text x="80" y="46">Vyhledávače</text>
    <text x="80" y="62" fill="var(--text-muted)" font-size="9">Google, Bing</text>
    <text x="215" y="46">Spam filtry</text>
    <text x="215" y="62" fill="var(--text-muted)" font-size="9">Gmail, Outlook</text>
    <text x="350" y="46">Doporučení</text>
    <text x="350" y="62" fill="var(--text-muted)" font-size="9">Youtube, Spotify</text>
    <text x="475" y="46">Asistenti</text>
    <text x="475" y="62" fill="var(--text-muted)" font-size="9">Siri, Alexa</text>
    <text x="80" y="126">Rozpozn. řeči</text>
    <text x="80" y="142" fill="var(--text-muted)" font-size="9">titulky, diktování</text>
    <text x="215" y="126">Překlad</text>
    <text x="215" y="142" fill="var(--text-muted)" font-size="9">DeepL, GTrans</text>
    <text x="350" y="126">Biometrie</text>
    <text x="350" y="142" fill="var(--text-muted)" font-size="9">FaceID, otisky</text>
    <text x="475" y="126">Detekce</text>
    <text x="475" y="142" fill="var(--text-muted)" font-size="9">podvodů, IDS</text>
    <text x="160" y="200">Self-driving cars</text>
    <text x="380" y="200">Chatboti, copilot</text>
  </g>
</svg>
:::

* **Vyhledávače** — Google, Bing (BERT a další).
* **Spam filtry** — klasifikace e-mailů.
* **Doporučovací systémy** — YouTube, Amazon, Netflix, TikTok (ovlivňuje *obrovskou* část lidských rozhodnutí).
* **Hlasové asistenty** — Siri, Alexa, Google Assistant.
* **Rozpoznávání řeči** — diktování, titulky, voice messages.
* **Strojový překlad** — DeepL, Google Translate.
* **Rozpoznávání obličejů** — Face ID, identifikace (legální i kontroverzní).
* **Detekce podvodů** — banky, fraud rings.
* **Chatboti** — zákaznický servis, customer support.
* **Coding assistants** — GitHub Copilot, Cursor.
* **Autonomní řízení** — Tesla, Waymo, Cruise.
* **Lékařská diagnostika** — radiologie, dermatologie.
* **Materiálová věda** — návrh nových materiálů, léků.

Současné jazykové modely (LLMs jako GPT-4, Claude 3, Gemini, LLaMA) jsou *nejširším* nástrojem — *jeden* model řeší škálu úloh od překladu po programování.

## Velké jazykové modely (LLMs)

* **GPT-4, Claude, Gemini, LLaMA, Mistral, Qwen, DeepSeek** — řádově 10⁹ až 10¹² parametrů.
* Většinou *standardní Transformer dekodér* ([[transformer-bert]]).
* **Tréninková data** — „celý internet" (RedPajama, Common Crawl, Wikipedia, knihy, code).
* **Schopnosti**: text generation, question answering, programming, math reasoning, multimodality (obrazy, audio).
* **Use cases**: standalone (chat), embedded (components of larger systems with retrieval, tool use).

Detail [[llm]].

### LLM-based agenti

::: svg "LLM agent: planner + tools + paměť + execution."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="190" y="30" width="160" height="50" rx="6"/>
    <rect x="30" y="120" width="140" height="50" rx="6"/>
    <rect x="200" y="120" width="140" height="50" rx="6"/>
    <rect x="370" y="120" width="140" height="50" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="270" y="50">LLM (jádro)</text>
    <text x="270" y="68" fill="var(--text-muted)" font-size="10" font-weight="400">plan, reflect, refine</text>
    <text x="100" y="140">Paměť</text>
    <text x="100" y="158" fill="var(--text-muted)" font-size="10" font-weight="400">vector DB, RAG</text>
    <text x="270" y="140">Nástroje</text>
    <text x="270" y="158" fill="var(--text-muted)" font-size="10" font-weight="400">web, kód, kalkulačka</text>
    <text x="440" y="140">Akce</text>
    <text x="440" y="158" fill="var(--text-muted)" font-size="10" font-weight="400">API calls, output</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="200" y1="80" x2="120" y2="120"/>
    <line x1="270" y1="80" x2="270" y2="120"/>
    <line x1="340" y1="80" x2="420" y2="120"/>
  </g>
</svg>
:::

LLM-založený agent (Auto-GPT, Devin, Claude with tools) kombinuje:

* **LLM** jako *plánovač*: dělí cíl na podcíle (subgoal decomposition), reflektuje.
* **Tools** — vyhledávač, kalkulačka, kódovací sandbox, vlastní API.
* **Paměť** — RAG (Retrieval Augmented Generation), embedding vector DB.
* **Akce** — vyvolává nástroje, čte zpět výsledky, pokračuje.

Detail v [[typy-agentu]] (učící se agent).

## Etická a společenská rizika

### Aktuální problémy

* **Automatizace ztráta pracovních míst** — kreativní (writers, designers), znalostní (analysts, paralegals), fyzické (driving, manufacturing).
* **Privacy** — masové rozpoznávání obličejů, sledování chování, behavioural fingerprinting.
* **Důvěryhodnost** — *deepfakes* (DeepFaceLab, FaceSwap, Sora), automated bots, AI-generated propaganda.
* **Sociální bubliny** — algoritmus optimalizující *engagement* přirozeně tlačí na *polarizační* obsah.
* **Algoritmický bias** — modely *replikují* a *zesilují* zaujatosti z trénovacích dat (COMPAS, hiring algorithms, facial recognition s nízkou přesností pro tmavé pleti).
* **Socio-ekonomická nerovnost** — benefit AI se *koncentruje* u korporací (OpenAI, Google) a malého počtu vysokoškoláků.
* **Zbraně** — autonomní zbraňové systémy (LAWS — Lethal Autonomous Weapons Systems).
* **Intelektuální vlastnictví** — AI trénovaná na děl autorů bez svolení; AI-generated obrazy a hudba.

### Existenční rizika

* **AI singularity / Technologická singularita** — hypotetický okamžik, kdy *AI exponenciálně překoná* lidskou inteligenci a vývoj se vymkne kontrole. Idea Johna von Neumanna; popularizoval Ray Kurzweil.
* **Misalignment** — AGI s *nesprávným* cílem může způsobit katastrofu (paperclip maximizer, [Bostrom 2014](https://www.fhi.ox.ac.uk/wp-content/uploads/Reframing_Superintelligence_FHI-TR-2019-1.1-1.pdf)).
* **Concentration of power** — kdokoli první vytvoří AGI by mohl získat *neprekonatelnou* výhodu.

> **Elon Musk** (2018): *„A.I. is far more dangerous than nukes."*
> **Stephen Hawking** (2014): *„The development of full artificial intelligence could spell the end of the human race."*

Tyto výroky jsou *kontroverzní* — někteří experti je považují za *přehnané*, jiní za *podceněné*.

## Regulace — EU AI Act

EU AI Act (přijetý 2024) je **první komplexní regulace AI** na světě. Kategorizuje AI systémy podle *rizika*:

### Zakázané praktiky

* **Podvědomé techniky** k zkreslování chování (subliminal manipulation).
* **Exploitace zranitelností** specifických skupin (děti, senioři, postižení).
* **Social scoring** vedoucí k diskriminaci.
* **Real-time biometric identification** ve veřejných prostorách (s omezenými výjimkami).
* **Predictive policing** AI systémy.
* **Biometric categorization** podle citlivých charakteristik (rasa, sexuální orientace).
* **Emotion recognition** v práci, vzdělání, prosazování práva.
* **Indiscriminate scraping** biometrických dat ze sociálních sítí / CCTV.

### Vysoké riziko

Vyžaduje **certifikaci** a **dokumentaci**:

* Biometrická identifikace a kategorizace.
* Kritická infrastruktura (energie, doprava, voda).
* Vzdělávání a profesní školení (s vlivem na přístup ke vzdělání).
* Zaměstnání, řízení pracovníků, samostatná výdělečná činnost.
* Esenciální veřejné a soukromé služby (kreditní hodnocení).
* Vymáhání práva.
* Migrace, asyl, hraniční kontrola.
* Administrativa spravedlnosti a demokratických procesů.

### Požadavky na vendory

* **Risk management system** — průběžné posuzování a snižování rizik.
* **Data governance** — kvalita trénovacích dat, předpojatost, citlivá data.
* **Technical documentation** — publikuje se před uvedením do provozu.
* **Logging** — audit trail pro celý lifecycle.
* **Transparency** — uživatel ví, co systém umí a co ne.
* **Human oversight** — člověk *může zasáhnout*.
* **Accuracy + robustness + cybersecurity** — testovatelné.

### Foundation models / Generative AI

* **Registrace**.
* **Disclosure** že obsah je AI-generovaný.
* **Design proti generování nelegálního obsahu**.
* **Summary** copyrighted dat použitých pro trénink.

### Sankce

Až **€35M nebo 7 % globálního ročního obratu** (vyšší z toho). Srovnatelné s GDPR.

## Co je vlastně AI v praxi

Definice se shoduje na *žádné jediné*. Pragmaticky:

* **Buzzword** ve marketingu — všechno se dnes „AI-powered". Často skrytá *jednoduchá* heuristika.
* **Skupina vědních oborů** snažících se řešit „lidsky obtížné" úlohy.
* **Sada *užitečných* nástrojů a produktů**.
* **Vědecký cíl** — pochopit a vytvořit inteligenci.
* **Možná nebezpečí** pro lidstvo.

Pragmatická volba zde — především **třetí** a *trochu* **druhý** výklad.

::: link "Russell, S.: Human Compatible — AI and the Problem of Control (Viking, 2019)" "https://en.wikipedia.org/wiki/Human_Compatible"
:::

::: link "EU AI Act — oficiální text a vysvětlení" "https://artificialintelligenceact.eu/"
:::

::: link "Bostrom, N.: Superintelligence (Oxford UP, 2014)" "https://en.wikipedia.org/wiki/Superintelligence:_Paths,_Dangers,_Strategies"
:::

::: link "Lilian Weng: LLM Powered Autonomous Agents (2023)" "https://lilianweng.github.io/posts/2023-06-23-agent/"
:::

::: link "Anthropic: Responsible Scaling Policy" "https://www.anthropic.com/news/anthropics-responsible-scaling-policy"
:::

---

*Zdroj: SUI přednášky 2025/26, *Úvod do AI* (Hradiš). Externí reference: Russell, S.: *Human Compatible* (Viking 2019); Bostrom, N.: *Superintelligence — Paths, Dangers, Strategies* (Oxford UP 2014); European Parliament: *EU AI Act* (2024); Crawford, K.: *Atlas of AI* (Yale UP 2021); Weng, L.: *LLM Powered Autonomous Agents* (2023).*
