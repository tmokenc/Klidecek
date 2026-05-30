---
title: Webscraping — motivace a architektura
---

# Webscraping — motivace a architektura

**Webscraping** (česky *extrakce dat z webu*) je proces automatického získávání strukturovaných dat z webových stránek. Na webu jsou *miliardy dokumentů* s daty — produktové katalogy, výsledky sportů, jízdní řády, veřejné rejstříky, výsledky vyhledávání. Tato data jsou *určena lidskému uživateli* (HTML, vizuální prezentace), ne počítačovému zpracování. Webscraping je sada technik, jak je extrahovat do strukturované formy (CSV, JSON, relační DB) pro další analýzu. Je to klíčová dovednost pro data engineering, business intelligence, ceník monitoring, vědecký výzkum.

## Motivace — proč scraping

Na webu jsou data, která potřebujeme dále zpracovat:

* **Propojení s vlastními daty** — obohatit interní DB o externí data (např. propojit zákazníky s veřejným rejstříkem firem).
* **Agregace** — sloučit výsledky z různých zdrojů (např. nejlevnější letenka napříč 10 prodejci).
* **Analýza** — statistiky a získávání znalostí (např. monitoring konkurenčních cen, trendů).
* **Archivace** — uložit obsah, který může zmizet (vědecké datasety, historické rejstříky).

Potřebujeme **strukturovaná data** — reprezentovatelná tabulkami relační databáze, nebo aspoň XML/JSON s pevnou strukturou.

## Data na webu — slabě strukturované

Webové stránky **nejsou silně strukturované**. Typicky v HTML:

* **Primárním cílem je vizuální prezentace** — HTML je optimalizováno pro renderování v prohlížeči.
* **Kód je druhotný** — strukturní značky jsou podřízeny vzhledu.
* **Není určen k dalšímu zpracování** — žádná schéma, žádná validace.
* **Často proměnné schéma** — různé produkty na e-shopu mohou mít různě strukturované stránky.

Jsou to **slabě strukturované dokumenty** (semi-structured) — mají *nějaký* tag-based markup, ale ne validace nebo zajištěná konzistence.

Pro počítačové zpracování to znamená:
* Není možné zaručit, že `<div class="price">` obsahuje cenu (může obsahovat slogan, prázdný řetězec, vícenásobné ceny).
* Schéma se mění s každým redesignem stránky.
* Mnoho dat je v *atributech*, *data-* atributech, nebo dynamicky generovaných JavaScriptem.

## Typické zdroje dat pro scraping

* **E-shopy** — produkty, ceny, dostupnost, recenze.
* **Realitní servery** — nemovitosti, ceny, lokality.
* **Letenky a doprava** — let. společnosti, časy, ceny.
* **Sportovní výsledky** — zápasy, statistiky, žebříčky.
* **Sledování konkurence** — ceník, akce, novinky.
* **Vyhledávání** — pozice v Google/Bing (SEO monitoring).
* **Veřejné rejstříky** — obchodní rejstřík, ARES, živnostenský rejstřík.
* **Jízdní řády** — IDOS, regionální dopravci.
* **Statistický úřad, zastupitelstva** — vládní data.
* **Sociální sítě** — veřejné profily (s opatrností na ToS).

## Dílčí problémy

Webscraping má tři fáze:

### 1. Získání zdrojových dat

* **Stáhnout dokumenty z WWW** s potřebným obsahem.
* **Paralelizace** — pro tisíce/miliony stránek nelze sekvenčně.
* **Respektování robots.txt** a rate limits — neddosit server.
* **Cookies, autentizace** — některé stránky vyžadují login.

### 2. Nalezení a extrakce dat (klíčové)

* **Identifikace požadovaných údajů ve stránce** — kde v HTML je cena? název? popis?
* **Tolerance vůči změnám schématu** — robustní selektory.
* **Čištění extrahovaných dat** — odstranit whitespace, převést formáty.

### 3. Uložení výsledků

* **Volba úložiště** — CSV, JSON, relační DB, NoSQL.
* **Schéma** — definovat struktura výstupu.
* **Deduplikace, identifikace záznamů**.

## Základní architektura

::: svg "Základní architektura webscrapingu: HTTP klient stáhne HTML → parser vytvoří model dokumentu → wrapper (extraktor) najde požadovaná data → strukturovaná data na výstupu."
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="20" y="50" width="80" height="60" fill="var(--bg-card)" stroke="var(--line)" rx="6"/>
    <text x="60" y="78" text-anchor="middle" fill="var(--text)" font-weight="600">WWW</text>
    <text x="60" y="94" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">HTTP server</text>
  </g>
  <line x1="100" y1="80" x2="135" y2="80" stroke="var(--accent)" marker-end="url(#ws-arr)"/>
  <g>
    <rect x="135" y="50" width="80" height="60" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="175" y="74" text-anchor="middle" fill="var(--text)" font-weight="600">HTTP</text>
    <text x="175" y="88" text-anchor="middle" fill="var(--text)" font-weight="600">klient</text>
    <text x="175" y="102" text-anchor="middle" fill="var(--text-muted)" font-size="9">wget, curl, ...</text>
  </g>
  <line x1="215" y1="80" x2="250" y2="80" stroke="var(--accent)" marker-end="url(#ws-arr)"/>
  <text x="232" y="72" text-anchor="middle" fill="var(--text-muted)" font-size="8.5">HTML</text>
  <g>
    <rect x="250" y="50" width="80" height="60" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="290" y="78" text-anchor="middle" fill="var(--text)" font-weight="600">Parser</text>
    <text x="290" y="94" text-anchor="middle" fill="var(--text-muted)" font-size="9">DOM, HTMLParser</text>
  </g>
  <line x1="330" y1="80" x2="365" y2="80" stroke="var(--accent)" marker-end="url(#ws-arr)"/>
  <text x="347" y="72" text-anchor="middle" fill="var(--text-muted)" font-size="8.5">model</text>
  <g>
    <rect x="365" y="50" width="80" height="60" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="405" y="74" text-anchor="middle" fill="var(--text)" font-weight="600">Wrapper</text>
    <text x="405" y="88" text-anchor="middle" fill="var(--text)" font-weight="600">(extraktor)</text>
    <text x="405" y="102" text-anchor="middle" fill="var(--text-muted)" font-size="9">XPath, CSS sel.</text>
  </g>
  <line x1="445" y1="80" x2="480" y2="80" stroke="var(--accent)" marker-end="url(#ws-arr)"/>
  <text x="510" y="76" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">struk.</text>
  <text x="510" y="88" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">data</text>
  <defs>
    <marker id="ws-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Omezení a problémy

### Stránky s autentizací

Mnoho stránek vyžaduje *login* před zpřístupněním dat (CAS systémy, intranety, prémiové datasety). Řešení:

* Simulovat HTTP login (POST s credentials, uložit cookies).
* Použít session token.
* Browser automation (Puppeteer/Playwright) — projít přihlášení jako uživatel.
* CAPTCHA — obtížně řešitelné, často signál, že nemáte scrapeovat.

### Dynamicky generovaný obsah

Moderní web aplikace často **renderují obsah JavaScriptem** v prohlížeči (SPA — Single Page Application). Klasický HTTP GET vrátí prázdný HTML kostru a JS pak načte data přes XHR/fetch.

Příklad: cyklistický žebříček UCI je *prázdná tabulka* v HTML — data se načítají dynamicky:

Řešení:
* **Browser automation** (Puppeteer, Playwright) — spustí skutečný Chrome, počká na JS, extrahuje renderovaný DOM.
* **API endpoint reverse engineering** — najít XHR call v Network tab DevTools, volat ho přímo (jednodušší, rychlejší).

### Rate limiting a IP blocking

Server může blokovat *příliš mnoho* požadavků z jedné IP:

* **HTTP 429 Too Many Requests** — server explicitně omezuje.
* **CAPTCHA** — Cloudflare, reCAPTCHA.
* **IP ban** — trvalé zablokování.

Řešení:
* Respektovat `robots.txt` a `Retry-After` headers.
* Throttling (1-2 requesty / sekundu).
* Rotace User-Agent.
* Proxy farm (eticky problematické).

### Legal a etical aspekty

* **Terms of Service** — mnoho stránek explicitně zakazuje scraping v ToS. Porušení = riziko žaloby (LinkedIn vs. hiQ Labs, USA).
* **GDPR** — osobní data nesmí být scrapována a uchovávána bez právního důvodu.
* **Copyright** — content je chráněn autorským právem; vědecký výzkum má fair use výjimku, komerční využití nutně licenci.
* **robots.txt** — standardizovaný *signál* o tom, co bot smí stahovat. Není právně závazný, ale konvenčně se respektuje.

V akademickém prostředí (UPA labs) je scraping pro studijní účely OK, *ale* respektujte rate limits a neukládejte osobní data.

## Tři přístupy ke scrapingu

1. **Quick & dirty** — shell scripts s `wget`/`curl` + `grep`/`sed`. Pro jednorázové úlohy. Viz [[dom-parsery]].
2. **Standardní DOM-based** — BeautifulSoup, jsoup, cheerio. Pro stabilní scraping s jasným HTML. Viz [[knihovny-scraping]].
3. **Browser automation** — Puppeteer, Playwright. Pro JS-heavy stránky. Viz [[browser-automation]].
4. **Inteligentní extrakce** — ML, LLM. Pro stránky bez stabilního schématu. Viz [[inteligentni-extrakce]].

## Volba přístupu

```
Jednorázový script, malý objem?      → Quick & dirty
Stránka statická, stabilní HTML?     → BeautifulSoup / jsoup
Stránka renderovaná JavaScriptem?    → Puppeteer / Playwright
Žádné stabilní schéma, vlastní obsah?→ LLM extrakce
Velmi mnoho stránek (mil+)?          → Scrapy framework, distributed
```

V průmyslu se používají *scraping frameworks* (Scrapy v Pythonu, Apify) — kombinují HTTP klient, parser, scheduler, deduplikaci, retry logiku, ukládání. Pro náročné projekty je framework rychlejší než stavět vše od základu.

::: link "Mitchell, R.: Web Scraping with Python (kniha)" "https://www.oreilly.com/library/view/web-scraping-with/9781491985564/"
:::

::: link "Robots Exclusion Protocol (robots.txt)" "https://www.rfc-editor.org/rfc/rfc9309.html"
:::

::: link "Scrapy framework documentation" "https://docs.scrapy.org/"
:::

---

*Zdroj: UPA přednáška *Extrakce dat z webu* (Burget). Externí reference: Mitchell, R.: *Web Scraping with Python*, 2nd ed., O'Reilly 2018; Lawson, R.: *Web Scraping with Python — Collecting Data from the Modern Web*, Packt 2015; RFC 9309 *Robots Exclusion Protocol*; Scrapy documentation.*
