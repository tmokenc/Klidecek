---
title: Scrapingové knihovny — BeautifulSoup, jsoup, cheerio
---

# Scrapingové knihovny — BeautifulSoup, jsoup, cheerio

V praxi se HTML parsuje přes specializované knihovny, ne přímo přes DOM API. Knihovny řeší tři problémy: **tolerantní parsing** špatně formátovaného HTML (mnoho stránek nemá zavřené tagy, perfektní vnoření), **idiomatické API** s CSS selektory a fluent metodami, **integrace s HTTP klientem** pro stahování. Tři reprezentativní knihovny pro různé jazyky: **BeautifulSoup** (Python), **jsoup** (Java), **cheerio** (JavaScript/Node.js). Konceptuálně si všechny tři velmi podobají, liší se jen syntaxí jazyka.

## BeautifulSoup (Python)

Nejpopulárnější Python scraping knihovna. Spolupracuje s urllib/requests pro stahování.

```python
from bs4 import BeautifulSoup
from urllib.request import urlopen

# Stáhnout
page = urlopen("https://www.fit.vut.cz/study/courses/")
html = page.read().decode("utf-8")

# Parsovat
soup = BeautifulSoup(html, "html.parser")
# Alternativní parsery: "lxml" (rychlejší), "html5lib" (nejsprávnější)

# CSS selektor (preferovaný)
rows = soup.select("#list tr")
for row in rows:
    cells = row.find_all("td")
    out = ";".join(cell.text.strip() for cell in cells)
    print(out)

# Find — alternativní API
title = soup.find("h1", class_="title").text
links = soup.find_all("a", href=True)
for link in links:
    print(link["href"], link.text)

# Navigace
parent = soup.select_one(".price").parent
next_sib = soup.select_one("h1").find_next_sibling("p")
```

Klíčové metody:

* `BeautifulSoup(html, parser)` — parsovat string.
* `select(css)` — všechny match.
* `select_one(css)` — první match.
* `find(tag, **attrs)` — první match podle tagu/atributů.
* `find_all(tag, **attrs)` — všechny matche.
* `.text` — text node + descendants.
* `.get_text(separator=" ", strip=True)` — text s controls.
* `["attr"]`, `.get("attr")` — atribut.
* `.parent`, `.children`, `.descendants`, `.next_sibling`, `.previous_sibling` — navigace.

```python
# Pro JS-heavy stránky kombinace s requests-html nebo Selenium
from requests_html import HTMLSession
session = HTMLSession()
r = session.get("https://www.example.com")
r.html.render()  # spustí Chromium, počká na JS
soup = BeautifulSoup(r.html.html, "html.parser")
```

## jsoup (Java)

Java knihovna s **CSS-like selektory** a *fluent API*. Často používaná pro enterprise Java aplikace.

```java
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class Scraper {
    public static void main(String[] args) throws Exception {
        // Stáhnout a parsovat v jednom kroku
        Document doc = Jsoup.connect("https://en.wikipedia.org/")
            .userAgent("Mozilla/5.0")
            .timeout(10_000)
            .get();

        System.out.println("Title: " + doc.title());

        // CSS selektor
        Elements headlines = doc.select("#mp-itn b a");
        for (Element headline : headlines) {
            System.out.printf("%s\n\t%s%n",
                headline.attr("title"),
                headline.absUrl("href"));
        }

        // DOM navigace
        Element first = doc.selectFirst("h1");
        Elements children = first.children();
        Element parent = first.parent();

        // Modifikace HTML (Builder pattern)
        Element div = doc.createElement("div");
        div.attr("class", "new-block");
        div.appendChild(doc.createElement("h2").text("Heading"));
        doc.body().appendChild(div);
    }
}
```

Klíčové třídy:
* **`Document`** — kořenový dokument.
* **`Element`** — HTML element.
* **`Elements`** — kolekce (s metodami `text()`, `attr()`).

Klíčové metody:
* `Jsoup.connect(url).get()` — stáhne a parsuje.
* `Jsoup.parse(html)` — parsuje string.
* `select(css)` → `Elements` — všechny matche.
* `selectFirst(css)` → `Element` — první match.
* `text()` — text.
* `attr(name)`, `absUrl(name)` — atribut, absolutní URL.
* `html()` — vnořený HTML.
* `outerHtml()` — celý element s tagy.

## cheerio (JavaScript/Node.js)

Server-side implementace **jQuery-like API** pro Node.js. Velmi populární mezi JS vývojáři.

```javascript
const cheerio = require('cheerio');
const axios = require('axios');

async function scrape() {
    const response = await axios.get('https://www.fit.vut.cz/study/courses/');
    const $ = cheerio.load(response.data);

    // jQuery-like syntax
    const titles = [];
    $('#list tr').each((i, tr) => {
        const cells = $(tr).find('td').map((j, td) => $(td).text().trim()).get();
        titles.push(cells.join(';'));
    });

    console.log(titles);

    // Atributy
    $('a').each((i, el) => {
        console.log($(el).attr('href'), $(el).text());
    });

    // Chaining
    const firstParaText = $('article').find('p').first().text();
}

scrape();
```

Klíčové metody (z jQuery):
* `$(selector)` — selekce přes CSS selektor.
* `.each((i, el) => ...)` — iterace.
* `.find(selector)` — selekce v rámci elementu.
* `.text()`, `.html()` — content.
* `.attr(name)` — atribut.
* `.parent()`, `.children()`, `.next()`, `.prev()`, `.siblings()` — navigace.
* `.first()`, `.last()`, `.eq(i)` — pozice.
* `.map((i, el) => ...).get()` — mapování a získání array.

## Srovnání

| | BeautifulSoup | jsoup | cheerio |
| :--- | :--- | :--- | :--- |
| **Jazyk** | Python | Java | Node.js |
| **Parser** | html.parser, lxml, html5lib | vlastní (HTML5 spec) | parse5, htmlparser2 |
| **Selectory** | CSS + find | CSS | CSS |
| **HTTP integration** | externí (requests) | vestavěné (Jsoup.connect) | externí (axios, node-fetch) |
| **Performance** | OK (lxml rychlejší) | velmi rychlé | velmi rychlé |
| **JS execution** | ✗ (lze s Selenium/Pyppeteer) | ✗ | ✗ |
| **Komunita** | obrovská | velká | velká |

## Robustní extrakce — best practices

### Vyhněte se křehkým selektorům

```python
# Špatně — závisí na pořadí
soup.select_one("body > div > div > div:nth-child(3) > span")

# Lépe — sémanticky
soup.select_one('span[itemprop="price"]')
soup.select_one('.product-price[data-currency="CZK"]')
```

Preferujte stabilní atributy: `id`, `data-*`, `itemprop` (Microdata), `property` (RDFa). Tyto jsou pro vývojáře smysluplné a méně se mění.

### Defensivní programování

```python
# Špatně — selhává s NoneType
price = float(soup.select_one('.price').text)

# Lépe — defensivní
price_el = soup.select_one('.price')
if price_el is None:
    return None
try:
    price = float(price_el.text.replace(",", ".").strip())
except ValueError:
    return None
```

### Normalizace dat

```python
# Whitespace, currency symbols, lokalizace
import re

def parse_price(text):
    # "1 234,50 Kč" → 1234.50
    text = re.sub(r"\s", "", text)             # remove all whitespace
    text = re.sub(r"[Kč€$£]", "", text)        # remove currency
    text = text.replace(",", ".")              # comma → dot
    return float(text)
```

### Throttling

```python
import time

URLS = [...]
for url in URLS:
    page = urlopen(url)
    process(page.read())
    time.sleep(1)        # 1 request / second
```

Ještě lépe: použít *asynchronní* knihovnu (`aiohttp` v Pythonu, `axios` s queue v Node) s rate limiter.

### Logging a retry

```python
import requests
from requests.adapters import HTTPAdapter, Retry

session = requests.Session()
retries = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
session.mount('https://', HTTPAdapter(max_retries=retries))

response = session.get(url, timeout=10)
```

Retry s exponential backoff řeší přechodné chyby (502 Bad Gateway, network timeouts).

## Scrapy — kompletní framework

Pro *průmyslové* scraping projekty (miliony stránek) je **Scrapy** (Python) průmyslový standard:

* **Spiders** — třídy definující jaké stránky stahovat a jak extrahovat.
* **Items** — datové struktury výsledků.
* **Pipelines** — postprocessing (validace, deduplikace, ukládání do DB).
* **Settings** — konfigurace (rate limit, retry, user agent).
* **Middleware** — request/response transformace.
* **Scheduler** — fronta URL, deduplikace, prioritizace.

```python
import scrapy

class FitCoursesSpider(scrapy.Spider):
    name = "fit_courses"
    start_urls = ["https://www.fit.vut.cz/study/courses/"]

    def parse(self, response):
        for row in response.css('#list tr'):
            yield {
                'code':   row.css('td:nth-child(1)::text').get(),
                'name':   row.css('td:nth-child(2)::text').get(),
                'credit': row.css('td:nth-child(3)::text').get(),
            }
        # Follow pagination
        next_page = response.css('a.next::attr(href)').get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)
```

Spustit: `scrapy runspider spider.py -o courses.json`.

## Mechanical Soup — automatizace formulářů

**Mechanical Soup** je Python knihovna nad BeautifulSoup pro *automatizaci prohlížeče*:

* "*Klikání na odkazy*" — zjištění cíle z `href`, generování GET požadavku.
* "*Vyplnění formulářů*" — najít `<form>`, vyplnit `<input>`, vyslat POST.
* JavaScript **není podporován** — pro dynamický obsah viz [[browser-automation]].

```python
import mechanicalsoup

browser = mechanicalsoup.StatefulBrowser()
browser.open("https://en.wikipedia.org/")

# Klik na search
browser.follow_link(text="Search")

# Form
browser.select_form('form[id="search"]')
browser["search"] = "Python (programming language)"
response = browser.submit_selected()

soup = response.soup
print(soup.find("h1").text)
```

Pro dnešní web s JavaScriptem ([[browser-automation]]).

## Volba knihovny

```
Python projekt, jednoduché HTML?    → BeautifulSoup
Python projekt, miliony stránek?    → Scrapy
Java enterprise?                    → jsoup
Node.js webová aplikace?            → cheerio
Vyžaduje JavaScript execution?      → Puppeteer/Playwright
Single SPA, kontrola UI?            → Playwright (multi-browser)
```

::: link "BeautifulSoup documentation" "https://www.crummy.com/software/BeautifulSoup/bs4/doc/"
:::

::: link "jsoup documentation" "https://jsoup.org/cookbook/introduction/parsing-a-document"
:::

::: link "cheerio documentation" "https://cheerio.js.org/"
:::

::: link "Scrapy documentation" "https://docs.scrapy.org/"
:::

---

*Zdroj: UPA přednáška *Extrakce dat z webu* (Burget). Externí reference: Mitchell, R.: *Web Scraping with Python*, 2nd ed., O'Reilly 2018; jsoup documentation; cheerio documentation; Scrapy documentation.*
