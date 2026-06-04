---
title: Automatizace prohlížeče — Puppeteer, Playwright
---

# Automatizace prohlížeče — Puppeteer, Playwright

Moderní webové aplikace často **renderují obsah JavaScriptem** v prohlížeči — klasický HTTP GET vrátí *prázdnou* HTML kostru a JS pak načte data z API (XHR/fetch). Klasické knihovny ([[knihovny-scraping]]) takový obsah nevidí. Řešení: **automatizace skutečného prohlížeče** — spustit Chrome/Firefox/WebKit headlessly, počkat na renderování, extrahovat data z živého DOM. Standard nástroje: **Puppeteer** (Chrome od Google) a **Playwright** (multi-browser, od Microsoft). Tyto nástroje slouží i pro testing UI (E2E testy), automatizaci formulářů a screenshot generování.

## Kdy potřebujeme browser automation

Klasické scrapingové nástroje selhávají, pokud:

1. **JavaScript renderuje obsah** — SPA (React, Vue, Angular). HTML kostra je prázdná.
2. **API endpoint je obfuskovaný** — token, custom headers, encryption. Reverse engineering je drahý.
3. **Stránka vyžaduje uživatelskou interakci** — klik na "Show more", scrollování, hover state.
4. **Anti-bot detekce** — Cloudflare, reCAPTCHA detekují atypické HTTP klienty.
5. **Login s 2FA/OTP** — komplexní auth flow.
6. **Testing UI** — chceme ověřit chování stránky v reálném prohlížeči.

Browser automation spustí *skutečný prohlížeč*, takže pro server je nerozeznatelný od běžného uživatele (až na drobné indikátory `navigator.webdriver`).

## Puppeteer

**Puppeteer** je Node.js knihovna od Google pro řízení Chrome/Chromium přes DevTools Protocol. Vydáno 2017.

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Navigace
  await page.goto('https://www.uci.org/road/rankings', {
    waitUntil: 'networkidle2'
  });

  // Počkat na specifický element (JS-loaded)
  await page.waitForSelector('.ranking-row');

  // Extrahovat data — runtime kód v prohlížeči
  const data = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.ranking-row')).map(row => ({
      rank:   row.querySelector('.rank').textContent.trim(),
      name:   row.querySelector('.name').textContent.trim(),
      points: parseInt(row.querySelector('.points').textContent.trim())
    }));
  });

  console.log(data);

  // Screenshot
  await page.screenshot({ path: 'rankings.png', fullPage: true });

  // PDF
  await page.pdf({ path: 'rankings.pdf', format: 'A4' });

  await browser.close();
})();
```

Klíčové metody:

* `puppeteer.launch(opts)` — spustí Chromium. `headless: 'new'` (žádné okno).
* `browser.newPage()` — nová záložka.
* `page.goto(url, opts)` — navigace. `waitUntil`: `load`, `domcontentloaded`, `networkidle0`, `networkidle2`.
* `page.waitForSelector(css)` — počká na DOM element.
* `page.waitForFunction(fn)` — počká na splnění JS výrazu.
* `page.evaluate(fn)` — vykoná JS v prohlížeči, vrátí výsledek.
* `page.click(css)`, `page.type(css, text)` — uživatelské akce.
* `page.screenshot(opts)`, `page.pdf(opts)` — output.

### Vykonání JS — page.evaluate

`page.evaluate(fn)` je *most* mezi Node.js a prohlížečem. `fn` se *serializuje* a vykoná v kontextu stránky. Návratová hodnota se *serializuje* zpět.

```javascript
// V prohlížeči
const result = await page.evaluate(() => {
  // V prohlížeči! document, window, fetch jsou dostupné.
  return document.title;
});

// S argumenty
const text = await page.evaluate((selector) => {
  return document.querySelector(selector).textContent;
}, '.product-name');
```

Pozor — `fn` *nemůže* vidět proměnné z Node.js scope. Musí se předat parametricky.

## Playwright

**Playwright** je novější (Microsoft 2020), vyvinutý *původním týmem Puppeteer*. Velmi podobné API, ale s několika výhodami:

1. **Multi-browser** — Chromium, Firefox, WebKit (Safari engine). Test cross-browser kompatibility.
2. **Multi-language** — Node.js, Java, Python, .NET, C#. Stejné API.
3. **Auto-wait** — implicit waiting (`page.click()` automaticky čeká, až je element actionable).
4. **Lepší dokumentace** — bohatá, vyhrazené příklady.
5. **Tracing a debugging** — Playwright Inspector, trace viewer.
6. **Network mocking** — `page.route()` pro modifikaci/blokování požadavků.

```python
from playwright.async_api import async_playwright

async def scrape():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto("https://www.uci.org/road/rankings")
        await page.wait_for_selector(".ranking-row")

        data = await page.eval_on_selector_all(
            ".ranking-row",
            """rows => rows.map(row => ({
                rank: row.querySelector('.rank').textContent.trim(),
                name: row.querySelector('.name').textContent.trim()
            }))"""
        )

        print(data)
        await browser.close()

import asyncio
asyncio.run(scrape())
```

## Puppeteer pros & cons

### Výhody

* **+** Možnost navigace (clicking, scrolling, formuláře).
* **+** Pohodlná extrakce dat (DOM, CSS selektory, XPath, libovolný JavaScript).
* **+** Realistická simulace (User-Agent, viewport, network conditions).
* **+** Multi-tab, multi-session přes kontexty.

### Nevýhody

* **−** *Časově i paměťově náročné* — spouští se celý Chrome (typicky 50–200 MB / instance).
* **−** *Obtížnější ošetření vnějších podmínek* — časové souběhy, regionální verze stránek.
* **−** *Obtížnější ladění* — kód běží částečně v Node.js, částečně v prohlížeči (různá prostředí).
* **−** *Drahé infrastruktura* — pro miliony stránek je nutný cluster (Browserless, Apify, vlastní deployment).

## Alternativy

* **Selenium** — historický standard pro browser automation (od ~2004). Multi-language. Pomalejší než Puppeteer/Playwright, ale stále se používá.
* **Playwright Codegen** — `playwright codegen <url>` zaznamenává uživatelské akce a generuje kód.
* **Mechanical Soup** — pro statické formuláře bez JS (Python). Viz [[knihovny-scraping]].
* **Apify** — cloud platform pro scraping (open-source SDK `Crawlee` pro Node/Python).

## Praktické tipy {tier=practice}

### Čekání na obsah

```javascript
// Špatně — fixed delay (může selhat)
await page.goto(url);
await new Promise(r => setTimeout(r, 3000));   // hope for best

// Lépe — conditional
await page.goto(url, { waitUntil: 'networkidle0' });
await page.waitForSelector('.product');

// Nejlepší — explicit condition
await page.waitForFunction(
  () => document.querySelectorAll('.product').length >= 10
);
```

### Headless detection

Některé weby detekují headless prohlížeče přes:
* `navigator.webdriver === true`
* Chybějící WebGL, canvas fingerprint.
* User-Agent obsahuje "HeadlessChrome".

Řešení — `puppeteer-extra` plugin `puppeteer-extra-plugin-stealth` skryje typické indikátory. Etika použití závisí na případu (testing OK, anti-bot bypass může porušovat ToS).

### Rate limiting a paralelismus

```javascript
const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 5,            // 5 paralelních záložek
    puppeteer: puppeteer,
});

await cluster.task(async ({ page, data: url }) => {
    await page.goto(url);
    // extract data
});

for (const url of URLS) {
    cluster.queue(url);
}
```

`puppeteer-cluster` umožňuje *paralelní* scraping v limitovaném počtu kontextů (každý kontext je samostatná session — cookies, localStorage).

### Network interception

Místo plného renderování často stačí zachytit *XHR/fetch* požadavky API, které stránka volá. To je *rychlejší* a *robustnější* než parsovat HTML.

```javascript
page.on('response', async response => {
    if (response.url().includes('/api/data')) {
        const data = await response.json();
        console.log(data);
    }
});

await page.goto(url);
```

### Použití API endpoint místo scraping

Pokud stránka načítá data přes API (XHR), často je *jednodušší* volat API přímo:

1. Otevřít DevTools → Network tab.
2. Najít XHR call (`fetch` nebo `XMLHttpRequest`).
3. Kopírovat jako cURL → ukázka volání.
4. Volat API přímo v scraping skriptu.

Výhody: výrazně rychlejší (žádný browser overhead), JSON je *strukturovaný* (žádné parsování HTML).

Nevýhody: API může vyžadovat *autorizační token* (často získaný z initial HTML loadu nebo cookies), API se může změnit bez upozornění.

## Volba — kdy automation a kdy ne

| Scenario | Doporučení |
| :--- | :--- |
| **Statické HTML, žádný JS** | BeautifulSoup / jsoup |
| **API endpoint dostupný** | volat API přímo |
| **Dynamický obsah, jednoduchý** | Puppeteer / Playwright |
| **Heavy SPA, login flow** | Playwright (lepší auto-wait) |
| **Multi-browser testing** | Playwright |
| **Pre-existing Selenium codebase** | zůstat u Selenium |
| **Cluster, scale-out** | Browserless, Apify |

## Více alternativ pro extrakci

Mimo HTML scraping existují další cesty získat data:

1. **Veřejná API** — RSS, GraphQL, REST endpoints. Vždy preferovat, pokud jsou dostupné.
2. **Open Data portály** — data.gov, data.europa.eu poskytují strukturovaná data v RDF/CSV/JSON.
3. **Microformats, RDFa, JSON-LD** — sémantické anotace v HTML stránkách, snazší na parsing než klasický scraping.
4. **Inteligentní extrakce** — LLM, ML modely (viz [[inteligentni-extrakce]]).

::: link "Puppeteer documentation" "https://pptr.dev/"
:::

::: link "Playwright documentation" "https://playwright.dev/"
:::

::: link "Crawlee — modern scraping library" "https://crawlee.dev/"
:::

---

*Zdroj: UPA přednáška *Extrakce dat z webu* (Burget). Externí reference: Puppeteer documentation; Playwright documentation; Mitchell, R.: *Web Scraping with Python*, 2nd ed., O'Reilly 2018; Crawlee documentation.*
