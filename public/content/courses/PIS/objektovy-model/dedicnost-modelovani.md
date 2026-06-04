---
title: Dědičnost v objektovém modelu — generalizace, specializace, kompatibilita
---

Druhý pilíř objektového modelu (vedle [[vztahy-objekty|vztahů]]) je **dědičnost typů struktur** — vyjadřuje, že některé typy *sdílejí společné rysy* a hodí se jeden popsat *prostřednictvím rozdílu* od druhého. V přednášce se na to dívají *čistě datově* (žádné metody, žádný polymorfismus chování) — jde o **dědičnost struktury**.

## Tři extrémy a celé spektrum mezi nimi

Mějme dva obecně různé typy struktur **A** a **B**. Jejich vlastnosti se mohou:

* **Zcela shodovat** (krajní případ → jsou to totéž).
* **Zcela lišit** (krajní případ → spolu nesouvisejí).
* **Částečně shodovat** — *jména a typy některých vlastností se kryjí, jiných ne*.

Třetí případ je *zajímavý*: pak má smysl vyjádřit B *prostřednictvím rozdílu* od A.

## Diference — tři druhy

Při popisu rozdílu typu B oproti A používáme **diferenci** — tři druhy operací:

* **Přidávání** nové vlastnosti, která v A nebyla,
* **Modifikace** (zúžení/zpřesnění) vlastnosti, která v A je,
* **Zrušení** (vypuštění) vlastnosti, která v A je, ale v B nemá smysl.

::: svg "Tři druhy diferencí: přidání, modifikace, zrušení vlastností"
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="20" width="160" height="150" rx="6" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.62 0.14 264)"/>
  <text x="90" y="40" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.14 264)">Typ A (předek)</text>
  <line x1="20" y1="50" x2="160" y2="50" stroke="oklch(0.62 0.14 264)" stroke-width="0.5"/>
  <text x="22" y="72" font-size="12" fill="var(--text)" font-family="var(--font-mono)">id : long</text>
  <text x="22" y="92" font-size="12" fill="var(--text)" font-family="var(--font-mono)">name : string</text>
  <text x="22" y="112" font-size="12" fill="var(--text)" font-family="var(--font-mono)">age : int</text>
  <text x="22" y="132" font-size="12" fill="var(--text)" font-family="var(--font-mono)">tags : Set&lt;str&gt;</text>
  <rect x="200" y="20" width="330" height="150" rx="6" fill="oklch(0.62 0.14 142 / 0.10)" stroke="oklch(0.62 0.14 142)"/>
  <text x="365" y="40" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.14 142)">Typ B = A + diference</text>
  <line x1="210" y1="50" x2="520" y2="50" stroke="oklch(0.62 0.14 142)" stroke-width="0.5"/>
  <text x="212" y="70" font-size="12" fill="var(--text-muted)" font-family="var(--font-mono)">id : long          (zděděno)</text>
  <text x="212" y="88" font-size="12" fill="var(--text-muted)" font-family="var(--font-mono)">name : string      (zděděno)</text>
  <text x="212" y="106" font-size="12" fill="oklch(0.50 0.14 22)" font-family="var(--font-mono)">age : int (1..150)  ← modifikace</text>
  <text x="212" y="124" font-size="12" fill="oklch(0.45 0.14 142)" font-family="var(--font-mono)">grade : int        + přidání</text>
  <text x="212" y="142" font-size="12" fill="oklch(0.45 0.14 142)" font-family="var(--font-mono)">teacher : Person   + přidání</text>
  <text x="212" y="160" font-size="12" fill="oklch(0.50 0.14 22)" font-family="var(--font-mono)" text-decoration="line-through">tags : Set&lt;str&gt;    − zrušení</text>
  <text x="265" y="192" text-anchor="middle" font-size="11" fill="var(--text-faint)" font-style="italic">Přidání je nejčastější; modifikace a rušení vzácnější.</text>
</svg>
:::

Definici typu B z A pak provedeme **výrokem**:

> Typ B obsahuje všechny vlastnosti typu A, ale jsou do něj **přidány** vlastnosti D, E, F, jsou **modifikovány** vlastnosti G, H, I (specifickým způsobem) a vlastnosti J, K, L **byly zrušeny**.

Tomu se říká **dědění z A do B**. A nazýváme **předkem** a B **následníkem**.

## Předek/následník — přímý vs. obecný (tranzitivní)

Mějme řetězec dědění:

```
EkonSubjekt  ←─  PravOsoba  ←─  Banka
   předek         (přímý násl.       (násl. EkonSubjektu
                  EkonSubjektu)       přes 2 kroky)
```

* **Přímý předek / přímý následník** — typ, ze kterého se dědilo *v jednom kroku*.
* **(Obecný) předek / následník** — bere se *tranzitivní uzávěr* relace přímého předka: pokud je `Banka` přímý následník `PravOsoba`, a `PravOsoba` přímý následník `EkonSubjekt`, pak je `Banka` (obecný) následník `EkonSubjekt`.

Vždy musí platit, že **graf dědičnosti je acyklický** — typ nesmí být svým vlastním předkem ani následníkem.

## Více přímých předků — vícenásobná dědičnost

Typ může mít *více* přímých předků. Definice pak zní:

> Typ B obsahuje všechny vlastnosti **typů X, Y, Z**, ale jsou do něj přidány nové D, E, F, modifikovány G, H, I, … a J, K, L byly zrušeny.

Zda systém vícenásobnou dědičnost povoluje, je modelové rozhodnutí:

* **Jednoduchá dědičnost** — každý následník má **jen jediného** přímého předka → graf je **strom**.
* **Vícenásobná dědičnost** — počet předků neomezen → graf je **acyklický (DAG)**.

::: svg "Jednoduchá (strom) vs. vícenásobná (DAG) dědičnost"
<svg viewBox="0 0 520 170" xmlns="http://www.w3.org/2000/svg">
  <text x="130" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">Jednoduchá (strom)</text>
  <rect x="100" y="28" width="60" height="35" rx="4" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
  <text x="130" y="51" text-anchor="middle" font-size="14" font-weight="600" fill="var(--text)">A</text>
  <rect x="40" y="98" width="60" height="35" rx="4" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
  <text x="70" y="121" text-anchor="middle" font-size="14" font-weight="600" fill="var(--text)">B</text>
  <rect x="160" y="98" width="60" height="35" rx="4" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
  <text x="190" y="121" text-anchor="middle" font-size="14" font-weight="600" fill="var(--text)">C</text>
  <line x1="70" y1="98" x2="115" y2="63" stroke="var(--text)" stroke-width="1" marker-end="url(#triS)"/>
  <line x1="190" y1="98" x2="145" y2="63" stroke="var(--text)" stroke-width="1" marker-end="url(#triS)"/>
  <text x="130" y="155" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-style="italic">B i C dědí jen z A</text>
  <text x="390" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">Vícenásobná (DAG)</text>
  <rect x="300" y="28" width="60" height="35" rx="4" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
  <text x="330" y="51" text-anchor="middle" font-size="14" font-weight="600" fill="var(--text)">A</text>
  <rect x="420" y="28" width="60" height="35" rx="4" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
  <text x="450" y="51" text-anchor="middle" font-size="14" font-weight="600" fill="var(--text)">B</text>
  <rect x="360" y="98" width="60" height="35" rx="4" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
  <text x="390" y="121" text-anchor="middle" font-size="14" font-weight="600" fill="var(--text)">C</text>
  <line x1="390" y1="98" x2="345" y2="63" stroke="var(--text)" stroke-width="1" marker-end="url(#triM)"/>
  <line x1="390" y1="98" x2="435" y2="63" stroke="var(--text)" stroke-width="1" marker-end="url(#triM)"/>
  <text x="390" y="155" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-style="italic">C dědí z A i z B současně</text>
  <defs>
    <marker id="triS" viewBox="0 0 12 10" refX="11" refY="5" markerWidth="10" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L11,5 L0,10 Z" fill="white" stroke="var(--text)" stroke-width="0.8"/></marker>
    <marker id="triM" viewBox="0 0 12 10" refX="11" refY="5" markerWidth="10" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L11,5 L0,10 Z" fill="white" stroke="var(--text)" stroke-width="0.8"/></marker>
  </defs>
</svg>
:::

V *UML notaci* se dědičnost kreslí jako šipka s **trojúhelníkovým hrotem** vedoucí *od následníka k předkovi* (ve směru generalizace). To si často studenti pletou — šipka *neukazuje* na potomka.

## Generalizace a specializace

Při návrhu hierarchie typů se postupuje dvěma směry:

* **Generalizace** — *odzdola nahoru*: nacházíme společné rysy u existujících typů a *vyzdvihujeme* je do společného nadřízeného typu. (Vidím, že `PravOsoba`, `OsobaVOR` i `FyzickaOsobaPodn` mají IČO, název a sídlo — společný předek je `EkonSubjekt`.)
* **Specializace** — *odshora dolů*: vycházíme z obecného typu a *přidáváme* unikátní vlastnosti pro speciální případy. (Z `EkonSubjekt` vytvořím podtřídu `Banka` s vlastnostmi `kodBanky`, `swift`, `seznamPobocek`.)

V praxi se obě cesty střídají iterativně — modeluje se „odshora i odzdola", až vznikne čistá hierarchie.

### Příklad — hierarchie ekonomických subjektů (z přednášky) {tier=example}

::: svg "Hierarchie typů ekonomických subjektů (z přednášky)"
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="200" y="15" width="120" height="36" rx="4" fill="oklch(0.62 0.14 264 / 0.20)" stroke="oklch(0.62 0.14 264)"/>
  <text x="260" y="38" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">EkonSubjekt</text>
  <rect x="400" y="15" width="120" height="36" rx="4" fill="oklch(0.62 0.14 80 / 0.20)" stroke="oklch(0.62 0.14 80)"/>
  <text x="460" y="38" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Obcan</text>
  <rect x="20" y="100" width="120" height="36" rx="4" fill="oklch(0.62 0.14 142 / 0.20)" stroke="oklch(0.62 0.14 142)"/>
  <text x="80" y="123" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">PravOsoba</text>
  <rect x="160" y="100" width="120" height="36" rx="4" fill="oklch(0.62 0.14 142 / 0.20)" stroke="oklch(0.62 0.14 142)"/>
  <text x="220" y="123" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">OsobaVOR</text>
  <rect x="300" y="100" width="160" height="36" rx="4" fill="oklch(0.62 0.14 142 / 0.20)" stroke="oklch(0.62 0.14 142)"/>
  <text x="380" y="123" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">FyzickaOsobaPodn</text>
  <line x1="80" y1="100" x2="230" y2="51" stroke="var(--text)" stroke-width="1" marker-end="url(#triE)"/>
  <line x1="220" y1="100" x2="250" y2="51" stroke="var(--text)" stroke-width="1" marker-end="url(#triE)"/>
  <line x1="380" y1="100" x2="290" y2="51" stroke="var(--text)" stroke-width="1" marker-end="url(#triE)"/>
  <line x1="380" y1="100" x2="460" y2="51" stroke="var(--text)" stroke-width="1" marker-end="url(#triE)"/>
  <rect x="20" y="170" width="120" height="36" rx="4" fill="oklch(0.62 0.14 22 / 0.20)" stroke="oklch(0.62 0.14 22)"/>
  <text x="80" y="193" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Banka</text>
  <line x1="80" y1="170" x2="80" y2="136" stroke="var(--text)" stroke-width="1" marker-end="url(#triE)"/>
  <text x="270" y="205" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-style="italic">Banka je právnická osoba, tedy tranzitivně ekonomický subjekt.</text>
  <defs>
    <marker id="triE" viewBox="0 0 12 10" refX="11" refY="5" markerWidth="10" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L11,5 L0,10 Z" fill="white" stroke="var(--text)" stroke-width="0.8"/></marker>
  </defs>
</svg>
:::

Slovní výklad:

* Každá *právnická osoba* je *ekonomický subjekt*.
* Každá *fyzická osoba podnikatel* je současně *ekonomický subjekt* i *občan* (vícenásobná dědičnost!).
* Každá *banka* je *právnická osoba* (a tedy tranzitivně i *ekonomický subjekt*).

## Typová kompatibilita

Klíčový důsledek dědičnosti: **každá struktura jistého typu je zároveň typu všech svých předků**. Struktura tedy *není jediného typu*, ale je *současně více typů* — svého typu a všech jeho (přímých i nepřímých) předků.

Z toho plyne **typová kompatibilita**:

> Pokud máme strukturu typu B, která je instancí následníka typu A, **může se B vyskytovat všude, kde může být A** — v deklaracích proměnných, hodnotách vlastností, kolekcích, extentech apod. Říkáme: *typ B je kompatibilní s typem A* — **nikoli naopak**.

To je v podstatě tatáž myšlenka, kterou v OO programování formuluje **Liskov Substitution Principle** (Barbara Liskov, 1987): „je-li S podtypem T, pak objekty typu T mohou být nahrazeny objekty typu S bez narušení korektnosti programu". V kontextu dat to říká: *kde lze použít EkonSubjekt, lze použít i Banku, ale ne naopak*.

Z toho také plyne, že:

* **Kolekce `Set<EkonSubjekt>`** může obsahovat *jak* `PravOsoba`, *tak* `Banka`, *tak* `FyzickaOsobaPodn` — všechny tyto typy jsou s `EkonSubjekt` kompatibilní.
* **Extent typu A obsahuje *všechny* objekty typu A i všech jeho následníků** — v extentu `EkonSubjekt` najdeme i banky, právnické osoby i podnikající fyzické osoby.

Při vzniku objektu se objekt zařadí *jak do extentu* svého konkrétního typu, *tak do extentů všech předků*. Musí platit, že **pro každý objekt existuje alespoň jeden deklarovaný extent**, ale deklarovat extent pro každou úroveň dědičnosti je drahé (zpomaluje vznik/zánik objektů).

## Abstraktní vs. konkrétní typy

Při tvorbě hierarchie některé typy *slouží jen jako stavební kámen* — sjednocují společné vlastnosti, ale samy o sobě nemají smysl jako instance. Tyto typy nazýváme **abstraktní**. Ty, které mají instance, jsou **konkrétní**.

| Vlastnost | Abstraktní typ | Konkrétní typ |
|---|---|---|
| Lze vytvořit přímou instanci? | **Ne** — systém to znemožní. | Ano. |
| Může mít extent? | **Ano** — obsahuje instance jeho konkrétních následníků. | Ano. |
| K čemu slouží? | Jednotné zacházení s množinou následníků (sdílí společné vlastnosti). | Skutečné nositele dat. |
| Pravidlo | Žádný objekt nesmí mít *všechny* své typy abstraktní. | — |

V příkladu výše: `EkonSubjekt` se hodí deklarovat jako *abstraktní* — sama o sobě „obecný ekonomický subjekt" neexistuje, vždy je to konkrétně *banka*, *právnická osoba* apod. Ale pohled „spočti DPH všech ekonomických subjektů" je platný — extent `EkonSubjekt` použijeme.

## Co si odnést

* Dědičnost vyjadřuje **rozdíl** (diferenci) následníka oproti předkovi — *přidání*, *modifikace*, *zrušení* vlastností.
* **Strom** = jednoduchá dědičnost (1 přímý předek), **DAG** = vícenásobná. Cykly nikdy.
* **Generalizace** (vyzdvihnutí společného nahoru) a **specializace** (přidání unikátního dolů) jsou dva směry návrhu.
* **Typová kompatibilita**: následník lze použít všude, kde lze předka (Liskov).
* **Extent předka obsahuje všechny instance všech následníků** — proto je *jeden extent na hierarchii* obvykle dostatečný.
* **Abstraktní typ** nelze instancovat, ale může mít extent (obsahuje instance konkrétních potomků).

::: link "Barbara Liskov & Jeannette Wing — A Behavioral Notion of Subtyping (1994), klasický článek o LSP" "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf"
:::

::: link "Wikipedia: Liskov substitution principle" "https://en.wikipedia.org/wiki/Liskov_substitution_principle"
:::

::: link "Wikipedia: Multiple inheritance (vícenásobná dědičnost — historie, diamond problem)" "https://en.wikipedia.org/wiki/Multiple_inheritance"
:::

::: quiz "Mám kolekci `Set<EkonSubjekt>` a chci do ní přidat objekt typu `Banka`. `Banka` je následník `PravOsoba`, která je následník `EkonSubjekt`. Půjde to?"
- [x] Ano — `Banka` je tranzitivně typu `EkonSubjekt`, takže je s ním typově kompatibilní.
  > Přesně. To je Liskov substitution: kde lze použít `EkonSubjekt`, lze použít kteréhokoli jeho (tranzitivního) následníka.
- [ ] Ne — kolekce přijímá jen objekty deklarovaného typu, ne potomků.
  > To by neumožňovalo využít dědičnosti vůbec. Hierarchie typů je tu právě proto, aby se v kolekci nadtřídy objevily i instance podtříd.
- [ ] Jen pokud `Banka` přepíše všechny zděděné vlastnosti.
  > Není potřeba nic přepisovat — typová kompatibilita platí automaticky.
:::

::: quiz "Proč se vyplatí deklarovat typ `EkonSubjekt` jako abstraktní?"
- [x] Sám o sobě „obecný ekonomický subjekt" neexistuje — vždy je to konkrétní banka, právnická osoba, OSVČ atd. Abstraktnost zabrání tomu, aby někdo omylem vytvořil instanci, která nemá v doméně smysl.
  > Ano. Abstraktnost slouží jako *modelová záruka*, že stromem dědičnosti nepoteče prázdná instance.
- [ ] Abstraktní typy mají menší paměťovou stopu.
  > Ne — abstraktnost je věc modelová, ne paměťová. Konkrétní instance je vždy plně specifikovaná.
- [ ] Abstraktní typy nemohou mít extent.
  > Naopak — *mohou* mít extent, který obsahuje instance jejich konkrétních následníků.
:::

---

*Zdroj: přednášky PIS — prof. T. Hruška & doc. R. Burget, VUT FIT, přednáška „Objektový model dat", část „Generalizace a specializace (dědičnost)" (slidy 24–47). Doplněno o klasickou formulaci LSP (Liskov & Wing, 1994).*
