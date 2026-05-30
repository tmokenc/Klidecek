---
title: Inteligentní extrakce — strojové učení, LLM
---

# Inteligentní extrakce — strojové učení, LLM

Klasické scrapingové přístupy ([[knihovny-scraping]], [[browser-automation]]) vyžadují *ruční práci* — psaní regulárních výrazů, CSS selektorů, XPath výrazů pro každou stránku. Pro **dynamický web** s tisíci různými layouty (e-shopy, marketplaces) je tento přístup neudržitelný. **Inteligentní extrakce** automatizuje proces extrakce metodami strojového učení, jazykových modelů (LLM) nebo extrakce řízené modelem. Tyto přístupy reagují na *strukturní podobnost* mezi stránkami nebo *sémantické porozumění* obsahu, místo explicitních pravidel.

## Tři přístupy k inteligentní extrakci

### 1. Strojové učení (wrapper induction)

Trénovaný model se *naučí* extrakční pravidla z anotovaných příkladů. Po natrénování umí extrahovat ze *nových*, neviděných stránek z téhož zdroje.

* **Trénovací množina** — kolekce dokumentů, kde jsou *manuálně anotovaná* pole pro extrakci (např. cena, název produktu).
* **Učení modelu** — algoritmus odvodí pravidla (HLRT wrapper, sequence labeling, tree pattern matching).
* **Aplikace** — nový, neznámý dokument → model extrahuje data.

### 2. Jazykové modely (LLM)

Velký jazykový model (GPT, Claude, Llama) přijme HTML text + instrukci ("najdi cenu produktu") a vrátí strukturovaný JSON. Funguje *zero-shot* (bez tréninku na konkrétní doméně) nebo *few-shot* (s pár příklady v promptu).

### 3. Model-driven extrakce

Aplikace dodá *schéma* (ER diagram, ontologie) a engine v textu hledá entity a vztahy odpovídající schématu. Kombinace pravidel a heuristik.

## Strojové učení — scénář

Trénovací příklady (anotované):

```html
<div class="product">
  <h2>[Pilsner Urquell]<!--PRODUCT_NAME--></h2>
  <span class="price">[50]<!--PRICE--> Kč</span>
</div>
```

Algoritmus odvodí:
* `PRODUCT_NAME` je text uvnitř `<h2>` uvnitř `.product`.
* `PRICE` je text uvnitř `<span class="price">` před " Kč".

Po natrénování model extrahuje ze nového dokumentu *bez označení*.

## Metody strojového učení pro extrakci

### Sekvenční modely (kódování textu jako stream znaků/tokenů)

* **Inference gramatik** (*wrapper induction*) — odvozují FSM/CFG, který odpovídá observed stránkám.
* **Skryté Markovovy modely** (HMM) — pro sekvenční značkování (každý token má skrytý label "pole X" / "pozadí").
* **Conditional Random Fields** (CRF) — moderní sequence labeling, kontextové features.
* **BERT / Transformers** — pretrained na velkých korpusech, fine-tuned na extrakční task.

### Hierarchické modely (využití DOM stromu)

* **Zobecněný DOM** — abstrakce implementačních detailů (whitespace, atributy bez významu).
* **Stromové automaty** — automaty operující nad XML stromem.
* **Tree convolution networks** — neural networks nad stromovou strukturou.

### Vizuální modely (z webu jako z obrazu)

* **Segmentace stránky** — rozdělit visual layout na bloky (header, navigation, content, sidebar).
* **Klasifikace na základě vizuálních rysů** — pozice na stránce, velikost písma, barva. *Cena* bývá vlevo/uprostřed, výrazně, červeně.
* **Computer vision** — YOLOv5 detektor objektů (například produktové karty na e-shopu).

## Model-driven extrakce

Aplikace dodá *předpokládanou strukturu dat* — ER diagram, ontologii, JSON Schema. Extrakční engine v textu hledá entity a vztahy odpovídající schématu.

Vstup: schéma s entitami a atributy.

::: svg "Model-driven extrakce: vstupem je ER schéma (entity Stop s atributem Name, vztah stops_at, entita Time s atributy Hour, Minute). Engine v textu jízdního řádu najde výskyty entit a sestaví strukturovaná data."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <ellipse cx="350" cy="40" rx="50" ry="20" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="350" y="45" text-anchor="middle" fill="var(--text)">Name</text>
    <rect x="310" y="80" width="80" height="30" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="350" y="100" text-anchor="middle" fill="var(--text)">Stop</text>
    <polygon points="350,130 380,150 350,170 320,150" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="350" y="154" text-anchor="middle" fill="var(--text)" font-size="9.5">stops at</text>
    <rect x="310" y="180" width="80" height="30" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="350" y="200" text-anchor="middle" fill="var(--text)">Time</text>
    <ellipse cx="250" cy="190" rx="35" ry="15" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="250" y="195" text-anchor="middle" fill="var(--text)" font-size="10">Hour</text>
    <ellipse cx="450" cy="190" rx="35" ry="15" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="450" y="195" text-anchor="middle" fill="var(--text)" font-size="10">Minute</text>
    <line x1="350" y1="60" x2="350" y2="80" stroke="var(--line)"/>
    <line x1="350" y1="110" x2="350" y2="130" stroke="var(--line)"/>
    <line x1="350" y1="170" x2="350" y2="180" stroke="var(--line)"/>
    <line x1="310" y1="195" x2="285" y2="190" stroke="var(--line)"/>
    <line x1="390" y1="195" x2="415" y2="190" stroke="var(--line)"/>
  </g>
  <g>
    <rect x="20" y="80" width="240" height="80" fill="var(--bg-inset)" stroke="var(--accent)" rx="6"/>
    <text x="140" y="100" text-anchor="middle" fill="var(--text)" font-weight="600">Vstup: text jízdního řádu</text>
    <text x="35" y="120" fill="var(--text)" font-family="ui-monospace, monospace" font-size="9">Brno hl.n.   8:15  10:30  12:45</text>
    <text x="35" y="135" fill="var(--text)" font-family="ui-monospace, monospace" font-size="9">Praha hl.n.  10:45 12:55  15:15</text>
    <text x="35" y="150" fill="var(--text)" font-family="ui-monospace, monospace" font-size="9">Ostrava h.n. 11:20 13:30  15:50</text>
  </g>
  <text x="140" y="180" text-anchor="middle" fill="var(--accent)" font-size="11">→ engine najde entity podle schématu</text>
</svg>
:::

Engine pak:
* Rozezná *Name* přes regex/NER (Named Entity Recognition).
* Rozezná *Time* (HH:MM pattern).
* Najde *opakující se vzory* — řádek tabulky odpovídá `Stop stops_at Time`.

Klasické přístupy: Roadrunner (Crescenzi et al. 2001) automaticky generuje wrapper z několika příkladů stejně strukturovaných stránek.

## LLM extrakce

Velký jazykový model (Claude, GPT-4, Llama 3) přijme HTML/text a *instrukci*, vrátí strukturovaný JSON. Tři varianty promptů:

### Zero-shot prompt

Pouze instrukce, žádné příklady.

```
ROLE: You are a world-class algorithm for extracting information in structured formats.

TASK: Extract attribute values from the product title in JSON format.
Valid attributes are Brand, Color, Material. If an attribute is not present,
the value should be "n/a".

INPUT: Dr. Brown's Infant-to-Toddler Toothbrush Set, 1.4 Ounce, Blue

OUTPUT:
```

LLM vrátí:
```json
{"Brand": "Dr. Brown's", "Color": "Blue", "Material": "n/a"}
```

### Few-shot prompt

Připojí 1–N příkladů s vstupem a očekávaným výstupem (in-context learning).

```
ROLE: You are a world-class algorithm for extracting information.

TASK: Extract attributes from product titles.

DEMONSTRATION:
Input:  Quip Kids Electric Toothbrush Set - Electric toothbrush with multi-use cover (Green)
Output: {"Brand": "Quip", "Color": "Green", "Material": "n/a"}

TASK:
Input: Dr. Brown's Infant-to-Toddler Toothbrush Set, 1.4 Ounce, Blue
Output:
```

Few-shot prompts mají *výrazně lepší přesnost* než zero-shot — model rozumí přesnému formátu výstupu.

### Schema-based prompt

Specifikuje JSON Schema cíle:

```
You are extracting product attributes. Follow this JSON Schema:

{
  "type": "object",
  "properties": {
    "Brand":    { "type": "string" },
    "Color":    { "type": "string" },
    "Material": { "type": "string" }
  },
  "required": ["Brand", "Color", "Material"]
}

Split product title by whitespace. Unknown values: "n/a".

Input: Dr. Brown's Infant-to-Toddler Toothbrush Set, 1.4 Ounce, Blue
Output (JSON):
```

Moderní LLM (Claude 3+, GPT-4+) přímo *podporují JSON Schema* mode — výstup je *garantovaně* validní JSON odpovídající schématu.

### Citace

* Brinkmann et al. (2024): *ExtractGPT — Exploring the Potential of Large Language Models for Product Attribute Value Extraction.*

## Cena LLM extrakce

LLM použití je *finančně drahé*:

* **Per-token billing** — např. modely třídy Sonnet řádově ~$3/M vstupních a ~$15/M výstupních tokenů (ceny se liší podle modelu a v čase klesají). Pro stránku 5K tokenů × 1M stránek = $15 000.
* **Latency** — typicky 1–10 sekund per request. Pro real-time scraping pomalé.
* **Rate limits** — API limity (tokens/min, requests/min).
* **Local deployment** — open-source modely (Llama 3, Mistral) lze provozovat lokálně, ale potřebují GPU.

Pro masové scraping (e-shopy s milionem produktů) je *kombinace* nejúčinnější:
1. **Rule-based** rychlý first-pass extraktor pro většinu standardních polí.
2. **LLM** pro ambiguous/missing pole, kde rules selžou.

## AI agenti

LLM už není jen *analyzátor vstupu* — také *řídí nástroje*. AI agent:

1. **Popíšeme schopnosti a API** dostupných nástrojů textově (např. "k dispozici je `web.fetch(url)`, `web.click(selector)`, `extract(html, schema)`").
2. **Dáme instrukci** ("najdi nejnižší cenu produktu X napříč e-shopy").
3. **LLM generuje sekvenci příkazů** pro nástroje a analyzuje výstup.

Příklad — LangChain integrace s Playwright:

```python
from langchain.agents import create_openai_tools_agent
from langchain_community.agent_toolkits import PlayWrightBrowserToolkit
from langchain_community.tools.playwright.utils import create_sync_playwright_browser

browser = create_sync_playwright_browser()
toolkit = PlayWrightBrowserToolkit.from_browser(sync_browser=browser)
tools = toolkit.get_tools()

agent = create_openai_tools_agent(llm, tools, prompt)
result = agent.invoke({
    "input": "Find the price of MacBook Pro 14\" on Apple.cz"
})
```

Agent autonomně:
1. Naviguje na apple.cz.
2. Hledá produkt.
3. Klikne na položku, načte cenu.
4. Vrátí výsledek.

Toto je nasazení AI agentů v praxi — Claude.ai computer use, Browser-use, AutoGen multi-agent frameworks.

## Současný stav webscrapingu

Web extrakce se pohybuje na škále:

* **Manufaktura** — ručně psané scrapery, drahá údržba. Stále dominantní pro stabilní zdroje.
* **Platforms** — Apify, Diffbot, ScraperAPI nabízejí scraping jako službu. Integrace ručních scraperů + AI.
* **AI agenti** — autonomní extrakce, dynamická adaptace na změny.

Trend: posun z *manufaktury* k *inteligentním systémům*. LLM extrakce je čím dál levnější (každoroční pokles cen 10×), open-source modely (Llama 3, Mistral 7B) jsou dostatečně přesné pro většinu use cases.

## Praktické tipy

* **Začněte jednoduše** — rule-based scraper většinou funguje. LLM až když selže.
* **Hybrid přístup** — rules pro stable fields, LLM pro ambiguous.
* **Caching** — uložte LLM výsledky, neopakujte stejný dotaz.
* **Validation** — vždy validate výstup proti schématu. LLM může halucinovat.
* **Monitoring** — sledujte přesnost na ověřovacích datech, alert na drift.

## Co přijde příště

* **Multimodal LLM** — porozumění *celé stránce* (HTML + screenshot + DOM). GPT-4V, Claude 3 vision již existují.
* **Self-improving agents** — agent se učí ze svých chyb (reinforcement learning).
* **Universal scrapers** — modely trénované na *milionech webů*, generalizovatelné na nové domény bez fine-tuningu.

::: link "Brinkmann et al.: ExtractGPT — Exploring the Potential of LLMs for Product Attribute Value Extraction (2024)" "https://arxiv.org/abs/2310.12537"
:::

::: link "LangChain Playwright Browser Toolkit" "https://python.langchain.com/docs/integrations/tools/playwright/"
:::

::: link "Diffbot — AI-powered web scraping" "https://www.diffbot.com/"
:::

---

*Zdroj: UPA přednáška *Extrakce dat z webu* (Burget). Externí reference: Crescenzi, V., Mecca, G., Merialdo, P.: *RoadRunner — Towards Automatic Data Extraction from Large Web Sites*, VLDB 2001; Brinkmann, A. et al.: *ExtractGPT — Exploring the Potential of LLMs for Product Attribute Value Extraction*, arXiv 2024; Lafferty, J., McCallum, A., Pereira, F.: *Conditional Random Fields*, ICML 2001.*
