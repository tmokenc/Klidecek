---
title: Aplikace a rizika AI
---

# Aplikace a rizika AI

AI dnes proniká do *všech* oblastí života. Tato kapitola shrnuje *praktické* aplikace, *etická* a *společenská* rizika a *regulatorní* rámec (EU AI Act).

## AI ve všedním životě

::: svg "AI dnes: od vyhledávačů po jazykové modely, biometriku, chatboty a autonomní řízení."
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
* **Doporučovací systémy** — YouTube, Amazon, Netflix, TikTok (ovlivňují *obrovskou* část lidských rozhodnutí).
* **Hlasoví asistenti** — Siri, Alexa, Google Assistant.
* **Rozpoznávání řeči** — diktování, titulky, hlasové zprávy.
* **Strojový překlad** — DeepL, Google Translate.
* **Rozpoznávání obličejů** — Face ID, identifikace osob (legální i kontroverzní).
* **Detekce podvodů** — banky, organizované podvodné sítě (fraud rings).
* **Chatboti** — zákaznická podpora.
* **Programovací asistenti (coding assistants)** — GitHub Copilot, Cursor.
* **Autonomní řízení** — Tesla, Waymo, Cruise.
* **Lékařská diagnostika** — radiologie, dermatologie.
* **Materiálová věda** — návrh nových materiálů a léků.

Současné jazykové modely (LLM jako GPT-4, Claude 3, Gemini, LLaMA) jsou *nejširším* nástrojem — *jeden* model řeší celou škálu úloh od překladu po programování.

## Velké jazykové modely (LLM)

* **GPT-4, Claude, Gemini, LLaMA, Mistral, Qwen, DeepSeek** — řádově 10⁹ až 10¹² parametrů.
* Většinou *standardní dekodér architektury Transformer* ([[transformer-bert]]).
* **Tréninková data** — „celý internet" (RedPajama, Common Crawl, Wikipedie, knihy, zdrojový kód).
* **Schopnosti**: generování textu, odpovídání na otázky, programování, matematické uvažování, multimodalita (obrazy, audio).
* **Způsoby použití**: samostatně (chat) nebo jako součást většího systému (s vyhledáváním a voláním nástrojů).

Detail [[llm]].

### Agenti založení na LLM

::: svg "Agent založený na LLM: plánovač + nástroje + paměť + vykonávání akcí."
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

Agent založený na LLM (Auto-GPT, Devin, Claude s nástroji) kombinuje:

* **LLM** jako *plánovač*: rozkládá cíl na podcíle (subgoal decomposition) a reflektuje svůj postup.
* **Nástroje (tools)** — vyhledávač, kalkulačka, kódovací sandbox, vlastní API.
* **Paměť** — RAG (Retrieval Augmented Generation), vektorová databáze embeddingů.
* **Akce** — vyvolává nástroje, čte zpět výsledky a pokračuje.

Detail v [[typy-agentu]] (učící se agent).

## Etická a společenská rizika

### Aktuální problémy

* **Automatizace a ztráta pracovních míst** — kreativní profese (spisovatelé, designéři), znalostní práce (analytici, právní asistenti) i fyzická práce (řízení, výroba).
* **Soukromí (privacy)** — masové rozpoznávání obličejů, sledování chování, behaviorální profilování (behavioural fingerprinting).
* **Důvěryhodnost** — *deepfakes* (DeepFaceLab, FaceSwap, Sora), automatizovaní boti, propaganda generovaná AI.
* **Sociální bubliny** — algoritmus optimalizující *zapojení uživatele (engagement)* přirozeně tlačí na *polarizační* obsah.
* **Algoritmické zkreslení (bias)** — modely *replikují* a *zesilují* zaujatosti z trénovacích dat (COMPAS, náborové algoritmy, rozpoznávání obličejů s nízkou přesností pro osoby s tmavou pletí).
* **Socio-ekonomická nerovnost** — přínos AI se *koncentruje* u korporací (OpenAI, Google) a malého počtu vysokoškolsky vzdělaných lidí.
* **Zbraně** — autonomní zbraňové systémy (LAWS — Lethal Autonomous Weapons Systems).
* **Duševní vlastnictví** — AI trénovaná na dílech autorů bez jejich svolení; obrazy a hudba generované AI.

### Existenční rizika

* **Singularita AI / technologická singularita** — hypotetický okamžik, kdy *AI exponenciálně překoná* lidskou inteligenci a vývoj se vymkne kontrole. Myšlenka Johna von Neumanna; popularizoval ji Ray Kurzweil.
* **Nesoulad cílů (misalignment)** — AGI s *nesprávným* cílem může způsobit katastrofu (paperclip maximizer, [Bostrom 2014](https://www.fhi.ox.ac.uk/wp-content/uploads/Reframing_Superintelligence_FHI-TR-2019-1.1-1.pdf)).
* **Koncentrace moci (concentration of power)** — kdokoli první vytvoří AGI, mohl by získat *nepřekonatelnou* výhodu.

> **Elon Musk** (2018): *„A.I. is far more dangerous than nukes."*
> **Stephen Hawking** (2014): *„The development of full artificial intelligence could spell the end of the human race."*

Tyto výroky jsou *kontroverzní* — někteří experti je považují za *přehnané*, jiní za *podceněné*.

## Regulace — EU AI Act

EU AI Act (přijatý 2024) je **první komplexní regulace AI** na světě. Kategorizuje systémy AI podle *míry rizika*:

### Zakázané praktiky

* **Podprahové techniky (subliminal manipulation)** zkreslující chování.
* **Zneužívání zranitelností (exploitace)** specifických skupin (děti, senioři, postižení).
* **Sociální skórování (social scoring)** vedoucí k diskriminaci.
* **Biometrická identifikace v reálném čase (real-time biometric identification)** ve veřejných prostorách (s omezenými výjimkami).
* **Prediktivní policejní práce (predictive policing)** založená na AI.
* **Biometrická kategorizace (biometric categorization)** podle citlivých charakteristik (rasa, sexuální orientace).
* **Rozpoznávání emocí (emotion recognition)** v práci, vzdělání a při vymáhání práva.
* **Plošné stahování (indiscriminate scraping)** biometrických dat ze sociálních sítí a kamerových systémů (CCTV).

### Vysoké riziko

Vyžaduje **certifikaci** a **dokumentaci**:

* Biometrická identifikace a kategorizace.
* Kritická infrastruktura (energie, doprava, voda).
* Vzdělávání a profesní školení (s vlivem na přístup ke vzdělání).
* Zaměstnání, řízení pracovníků, samostatná výdělečná činnost.
* Esenciální veřejné a soukromé služby (úvěrové hodnocení).
* Vymáhání práva.
* Migrace, azyl, hraniční kontrola.
* Výkon spravedlnosti a demokratických procesů.

### Požadavky na dodavatele (vendory)

* **Systém řízení rizik (risk management system)** — průběžné posuzování a snižování rizik.
* **Správa dat (data governance)** — kvalita trénovacích dat, předpojatost, citlivá data.
* **Technická dokumentace (technical documentation)** — publikuje se před uvedením do provozu.
* **Logování (logging)** — auditní stopa (audit trail) pro celý životní cyklus.
* **Transparentnost (transparency)** — uživatel ví, co systém umí a co ne.
* **Lidský dohled (human oversight)** — člověk *může zasáhnout*.
* **Přesnost, robustnost a kybernetická bezpečnost** — vše musí být testovatelné.

### Foundation modely / generativní AI

* **Registrace**.
* **Zveřejnění (disclosure)**, že obsah byl vygenerován AI.
* **Návrh bránící generování nelegálního obsahu**.
* **Souhrn (summary)** dat chráněných autorským právem použitých k tréninku.

### Sankce

Až **35 mil. € nebo 7 % globálního ročního obratu** (podle toho, co je vyšší). Srovnatelné s GDPR.

## Co je vlastně AI v praxi

Na *žádné jediné* definici se obor neshoduje. Pragmaticky lze AI chápat jako:

* **Buzzword** v marketingu — dnes je všechno „poháněné AI" (AI-powered). Často se za tím skrývá *jednoduchá* heuristika.
* **Skupina vědních oborů** snažících se řešit „pro člověka obtížné" úlohy.
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
