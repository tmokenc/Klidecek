---
title: HTML modely, DOM, CSS selektory, XPath
---

# HTML modely, DOM, CSS selektory, XPath

Pro extrakci dat ze stránky musíme HTML *parsovat* — převést sekvenci znaků na strukturní reprezentaci, ve které lze efektivně hledat. Existují různé úrovně reprezentace HTML: **řetězec znaků** (regex, sed), **řetězec tokenů** (event-driven parser), **DOM strom** (hierarchická struktura). Pro selekci uzlů v DOM se používají **CSS selektory** nebo **XPath**. Pochopení DOM modelu a obou jazyků selekce je klíčové pro spolehlivý scraping — naivní regex přístup zpravidla selže na jakémkoli netriviálním HTML.

## Tři úrovně modelování HTML

### Řetězec znaků

HTML jako jeden string. Hledání přes **regulární výrazy** (`grep`, `sed`, `re.search`).

* **+** Jednoduchá implementace, rychlé.
* **+** Škálovatelné na obrovské datasety.
* **−** Křehké — drobná změna HTML (mezera, atribut navíc) regex rozbije.
* **−** *Nelze* spolehlivě parsovat libovolné HTML regexem (slavná odpověď na Stack Overflow — HTML není regulární jazyk).

```bash
# Quick & dirty s grep + sed
wget https://www.fit.vut.cz/study/courses/ -O - \
  | grep 'list-links__link' \
  | sed 's/<[^<>]*>/;/g' \
  | sed 's/;;*/;/g'
```

```python
# Stejné v Pythonu
import urllib.request, re

with urllib.request.urlopen('https://www.fit.vut.cz/study/courses/') as f:
    html = f.read().decode('utf-8')

for line in html.split('\n'):
    if 'list-links__link' in line:
        line = re.sub(r'<[^<>]*>', ';', line)
        line = re.sub(r';;*', ';', line)
        print(line)
```

Tento přístup funguje pro *velmi jednoduché* stránky s pravidelnou strukturou. Pro reálné weby je nespolehlivý.

### Řetězec tokenů

**Lexikální analyzátor** rozpozná HTML tokens: `start-tag`, `end-tag`, `attribute`, `text`, `entity`, `comment`. Aplikace dostává *stream událostí*.

Python `html.parser` — událostmi řízený SAX-like parser:

```python
from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def handle_starttag(self, tag, attrs):
        print("Start tag:", tag, attrs)
    def handle_endtag(self, tag):
        print("End tag:", tag)
    def handle_data(self, data):
        print("Data:", data)

parser = MyHTMLParser()
parser.feed("<p>Hello <b>world</b>!</p>")
```

Pro full parser viz `html5lib`, `lxml`.

### Hierarchický model — DOM

**Document Object Model** (W3C) reprezentuje HTML jako *strom objektů*. Kořen je `Document`, jeho potomek je *root element* (`<html>`), dále se větví do `<head>`, `<body>` atd.

* **`Document`** — kořenový uzel.
* **`Element`** — HTML element (`<div>`, `<a>`, `<h1>`, ...). Má atributy a potomky.
* **`Text`** — textový uzel (listový).
* **`Attribute`** — atribut elementu (jako uzel přes `getAttribute`).
* **`Entity`**, **`Comment`** — speciální uzly.

::: svg "DOM strom HTML dokumentu: Document → html → (head → title → text) + (body → a + h1)."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <g>
    <rect x="220" y="20" width="100" height="30" fill="var(--bg-card)" stroke="var(--accent)" rx="4"/>
    <text x="270" y="40" text-anchor="middle" fill="var(--text)" font-weight="600">Document</text>
    <line x1="270" y1="50" x2="270" y2="70" stroke="var(--line)"/>
    <rect x="220" y="70" width="100" height="30" fill="var(--bg-card)" stroke="var(--accent)" rx="4"/>
    <text x="270" y="90" text-anchor="middle" fill="var(--text)" font-weight="600">&lt;html&gt; root</text>
    <line x1="270" y1="100" x2="180" y2="120" stroke="var(--line)"/>
    <line x1="270" y1="100" x2="360" y2="120" stroke="var(--line)"/>
    <rect x="140" y="120" width="80" height="30" fill="var(--bg-inset)" stroke="var(--line)" rx="4"/>
    <text x="180" y="140" text-anchor="middle" fill="var(--text)">&lt;head&gt;</text>
    <rect x="320" y="120" width="80" height="30" fill="var(--bg-inset)" stroke="var(--line)" rx="4"/>
    <text x="360" y="140" text-anchor="middle" fill="var(--text)">&lt;body&gt;</text>
    <line x1="180" y1="150" x2="180" y2="170" stroke="var(--line)"/>
    <rect x="140" y="170" width="80" height="30" fill="var(--bg-inset)" stroke="var(--line)" rx="4"/>
    <text x="180" y="190" text-anchor="middle" fill="var(--text)">&lt;title&gt;</text>
    <line x1="360" y1="150" x2="320" y2="170" stroke="var(--line)"/>
    <line x1="360" y1="150" x2="400" y2="170" stroke="var(--line)"/>
    <rect x="280" y="170" width="80" height="30" fill="var(--bg-inset)" stroke="var(--line)" rx="4"/>
    <text x="320" y="190" text-anchor="middle" fill="var(--text)">&lt;a&gt; href</text>
    <rect x="380" y="170" width="80" height="30" fill="var(--bg-inset)" stroke="var(--line)" rx="4"/>
    <text x="420" y="190" text-anchor="middle" fill="var(--text)">&lt;h1&gt; "Title"</text>
  </g>
</svg>
:::

DOM API umožňuje *programatický průchod* — `parentNode`, `childNodes`, `firstChild`, `nextSibling`, `getElementById`, `getElementsByTagName`, `textContent`.

Plnohodnotný HTML5 DOM parser je *obtížné najít* — prakticky existuje jen v prohlížečích. V praxi se používají zjednodušené parsery (BeautifulSoup, jsoup, cheerio — viz [[knihovny-scraping]]) s vlastními API.

## Wrappery — HLRT a podobné

Pro extrakci dat z dokumentu se historicky používaly **wrappery** — formální specifikace, jak extrahovat z textu *n* datových polí. Klasická třída wrapperů:

* **LR** (Left-Right) — pro každé pole levý a pravý oddělovač.
* **HLRT** (Head-Left-Right-Tail) — `Head` (před blokem), `Left₁/Right₁` (kolem 1. pole), …, `Left_n/Right_n`, `Tail`.

```
wrapper = (h, t, l₁, r₁, l₂, r₂, …, lₙ, rₙ)
```

Pro stránku `<table><tr><td>Anna</td><td>31</td></tr>…</table>`:
* `h = "<table>"`, `t = "</table>"`,
* `l₁ = "<td>"`, `r₁ = "</td><td>"`, `l₂ = ""`, `r₂ = "</td></tr>"`.

Tento přístup je dnes nahrazen DOM-based extrakcí, ale je *koncepčním základem* automatické indukce wrapperů (machine learning přístup, viz [[inteligentni-extrakce]]).

## Navigace v DOM

Klasické DOM API metody:

* **`getElementById('foo')`** — najít element s daným ID.
* **`getElementsByTagName('div')`** — všechny `<div>` elementy.
* **`getElementsByClassName('price')`** — všechny elementy s class "price".
* **`querySelector('.price')`** — první match CSS selektoru.
* **`querySelectorAll('.price')`** — všechny matche CSS selektoru.
* **`parentNode`**, **`childNodes`**, **`children`**, **`firstChild`**, **`nextSibling`** — průchod stromem.
* **`textContent`** — text uzlu (a všech potomků).
* **`innerHTML`** — HTML zdroj.
* **`attributes`**, **`getAttribute('href')`** — atributy.

Pro scraping jsou nejdůležitější *selektory* — způsob, jak vyjádřit "co chci najít".

## CSS selektory

CSS selektory jsou *kompaktní* a *čitelné*. Známé z CSS, ale použitelné i v JS (`querySelector`) a scraping knihovnách (BeautifulSoup `select`, jsoup `select`).

Syntax:

```css
#main                  /* element s id="main" */
.price                  /* element s class="price" */
div                     /* všechny <div> */
div.price               /* div s class price */
div > p                 /* p přímý potomek div */
div p                   /* p kdekoliv pod div */
ul li:nth-child(2)      /* druhý <li> v <ul> */
a[href^="https"]        /* <a> jehož href začíná https */
a[href*="example"]      /* <a> jehož href obsahuje example */
input[type="text"]      /* input typu text */
li:not(.skip)           /* li bez třídy skip */

#main header .info      /* .info uvnitř header uvnitř #main */
```

CSS pseudo-classes: `:hover`, `:first-child`, `:last-child`, `:nth-child(n)`, `:nth-of-type(n)`, `:contains("text")` (jen některé knihovny), `:has(...)`.

## XPath

**XPath** (W3C; 1.0 z 1999, 2.0 z 2007) je jazyk pro adresování uzlů v XML stromě. Funguje i nad HTML (přes lxml, jsoup). Bohatší než CSS — umí navigovat *více směry* a má bohatší výrazy.

Syntax:

```
//div                          /* všechny <div> kdekoli */
//div[@id="main"]              /* div s id="main" */
//div[@class="price"]          /* div s class="price" (přesné!) */
//div[contains(@class, "price")]  /* class obsahuje "price" */
//a[starts-with(@href, "https")] /* href začíná https */
//ul/li[2]                     /* druhý li v ul */
//div[@id="main"]//table/tr[position() > 3]
                                /* tr za prvními 3 v tabulce uvnitř #main */
//h1/text()                    /* text node, ne element */
//img/@src                     /* hodnota atributu src */
//div[count(p) > 5]            /* div mající více než 5 p potomků */
```

XPath axes (osy průchodu):
* `child::` (default) — přímý potomek.
* `descendant::` (`//`) — libovolný potomek.
* `parent::` (`..`) — rodič.
* `ancestor::` — všichni předkové.
* `following-sibling::` — sourozenec po něm.
* `preceding-sibling::` — sourozenec před ním.
* `attribute::` (`@`) — atribut.

XPath je *silnější* než CSS — umožňuje:
* Navigace nahoru (`parent`, `ancestor`).
* Booleanské/aritmetické výrazy.
* Funkce nad uzly (`count`, `string-length`, `contains`, `not`).
* Predikáty kombinované AND/OR.

## CSS vs. XPath — kdy co

| Use case | CSS | XPath |
| :--- | :---: | :---: |
| **Selekce podle ID/class/tag** | ✓ (kratší) | ✓ |
| **Navigace nahoru (k rodiči)** | ✗ | ✓ |
| **Text-based filtering** | omezené (`:contains`) | ✓ (`text()`, `contains`) |
| **Boolean/aritmetické výrazy** | ✗ | ✓ |
| **Pozice (n-tý prvek)** | `:nth-child(n)` | `[n]` |
| **Čitelnost** | lepší | obtížnější |
| **Standardizace** | CSS3 selektor module | XPath 1.0/2.0/3.0 |

V praxi: použijte CSS pro jednoduché případy, XPath pro složitější (s navigací směrem nahoru, complex predicates).

## Příklad — extrakce ceny produktu

HTML:
```html
<div class="product">
  <h2>Pilsner Urquell</h2>
  <div class="price"><span class="value">50</span> Kč</div>
  <p class="description">Pale lager beer.</p>
</div>
```

CSS:
```
.product .price .value  →  "50"
```

XPath:
```
//div[@class="product"]//div[@class="price"]/span[@class="value"]/text()  →  "50"
```

V knihovně (BeautifulSoup):
```python
price = soup.select_one('.product .price .value').text
```

::: viz css-xpath-playground "DOM strom s CSS a XPath inputy. Vyzkoušejte `.product .price` (CSS) vs `//span[@class="price"]` (XPath). Matched uzly se zvýrazní."
:::

## Praktická pravidla

* **Vyhněte se regex pro HTML** — náchylné k chybám, neudržovatelné.
* **Začněte CSS selektory** — pokud nestačí, přejděte na XPath.
* **Robustní selektory** — preferujte stabilní atributy (`id`, `data-*`) před křehkými (pořadí, hloubka).
* **Test against several pages** — zajistěte, že selektor funguje pro různé varianty.
* **Sledujte změny** — webové stránky se mění, scraper musí být udržován.

Knihovny pro praktický scraping v [[knihovny-scraping]].

::: link "MDN — XPath documentation" "https://developer.mozilla.org/en-US/docs/Web/XPath"
:::

::: link "W3C — CSS Selectors Level 4" "https://www.w3.org/TR/selectors-4/"
:::

::: link "Stack Overflow — Why can't you parse HTML with regex?" "https://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags/1732454#1732454"
:::

---

*Zdroj: UPA přednáška *Extrakce dat z webu* (Burget). Externí reference: W3C *Document Object Model (DOM) Level 3 Core*; W3C *CSS Selectors Level 4*; W3C *XML Path Language (XPath) 3.1*; MDN Web Docs XPath/DOM.*
