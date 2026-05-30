# Schémata datového skladu — hvězda, sněhová vločka, konstelace

ROLAP a HOLAP servery ([[olap-architektury]]) ukládají data v *relační databázi*. Otázka *jak je strukturována* má tři kanonické odpovědi: **schéma hvězdy**, **schéma sněhové vločky** a **konstelace faktů (galaxy)**.

## Tabulka faktů a tabulky dimenzí

Společným základem všech tří schémat je rozdělení tabulek na *fakta* a *dimenze*.

**Tabulka faktů** (*fact table*):

- *Největší tabulka* v databázi (zpravidla *jediná* faktová) — obsahuje miliony až miliardy řádků.
- Drží **numerické míry** (tržba, počet kusů, cena, marže).
- Drží **cizí klíče** do tabulek dimenzí.
- Roste rychle (každá transakce = řádek).

**Tabulky dimenzí** (*dimension tables*, *číselníky*):

- Logicky nebo hierarchicky uspořádané **popisné údaje**.
- Mnohem **menší** než faktová tabulka (desetitisíce až miliony řádků).
- Mění se *méně často* (změna adresy zákazníka, přidání nového produktu).
- Nejčastější dimenze: **časová, geografická, produktová** (často také zákaznická, dodavatelská).

## Schéma hvězdy (star schema)

Nejjednodušší a nejpoužívanější struktura: **jedna tabulka faktů uprostřed**, k ní *paprskově* připojené tabulky dimenzí.

Charakteristika:

- Tabulky dimenzí *nejsou normalizované* — hierarchie (město → region → země) je uložena v jedné tabulce jako sloupce.
- *Neposkytuje explicitní podporu pro hierarchii* — lze obejít *organizačně* přes pojmenování sloupců.
- *Jednoduché dotazy* — JOIN faktové tabulky s několika dimenzemi.
- *Pomalejší zápis* (redundance v dimenzích), ale *rychlejší čtení*.

:::svg
<svg viewBox="0 0 540 240" xmlns="http://www.w3.org/2000/svg" style="max-width:580px;width:100%;height:auto;font-family:system-ui,sans-serif;">
  <defs>
    <style>
      .fact{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5;rx:6}
      .dim{fill:var(--bg-inset);stroke:var(--line-strong);stroke-width:1.5;rx:6}
      .ln{stroke:var(--line-strong);stroke-width:1;fill:none}
      .ttl{font-size:12px;font-weight:600;text-anchor:middle;fill:var(--text)}
      .col{font-size:10px;text-anchor:middle;fill:var(--text-muted);font-family:monospace}
    </style>
  </defs>
  <!-- center: fact table -->
  <rect class="fact" x="210" y="90" width="120" height="60"/>
  <text class="ttl" x="270" y="110">prodeje (FACT)</text>
  <text class="col" x="270" y="125">tržba, počet</text>
  <text class="col" x="270" y="140">FKs: čas, prod, reg</text>
  <!-- dimensions: 4 arms -->
  <rect class="dim" x="60" y="30" width="100" height="40"/>
  <text class="ttl" x="110" y="48">čas</text>
  <text class="col" x="110" y="62">den, měs, kvart, rok</text>
  <rect class="dim" x="380" y="30" width="100" height="40"/>
  <text class="ttl" x="430" y="48">produkt</text>
  <text class="col" x="430" y="62">kód, kateg, řada</text>
  <rect class="dim" x="60" y="170" width="100" height="40"/>
  <text class="ttl" x="110" y="188">region</text>
  <text class="col" x="110" y="202">město, reg, země</text>
  <rect class="dim" x="380" y="170" width="100" height="40"/>
  <text class="ttl" x="430" y="188">zákazník</text>
  <text class="col" x="430" y="202">jméno, segment</text>
  <!-- lines -->
  <line class="ln" x1="160" y1="60" x2="220" y2="100"/>
  <line class="ln" x1="380" y1="60" x2="320" y2="100"/>
  <line class="ln" x1="160" y1="180" x2="220" y2="140"/>
  <line class="ln" x1="380" y1="180" x2="320" y2="140"/>
</svg>
:::

Tvar je *hvězda*: faktová tabulka uprostřed, dimenze kolem.

## Schéma sněhové vločky (snowflake schema)

**Zjemnění hvězdy**: hierarchie dimenzí je **explicitně normalizována** do navázaných tabulek dimenzí.

Příklad: místo jedné dimenze `region` se sloupci `(město, region, země)` existují *tři* tabulky:

- `dim_city` — město + FK do `dim_region`.
- `dim_region` — region + FK do `dim_country`.
- `dim_country` — země.

Charakteristika:

- *Výhodná údržba relací dimenzí* — změna názvu země se promítne jednou.
- *Lepší konzistence dat dimenzí* — bez redundance.
- *Složitější dotazy* — víc JOINů.
- *Pomalejší čtení*, ale úspora místa.

Sněhová vločka je vhodná pro **velké dimenze s hlubokou hierarchií** (typicky geografie, organizační struktura). Pro plochá dimenze se její přidaná hodnota ztrácí.

## Konstelace faktů (fact constellation / galaxy schema)

**Více tabulek faktů** sdílejících tabulky dimenzí.

Příklad: maloobchodní řetězec má:

- `prodeje` (fact) — měří tržbu na pokladně.
- `zásoby` (fact) — měří stav skladu.
- `objednávky` (fact) — měří objednávky od dodavatelů.

Všechny tři faktové tabulky sdílejí dimenzi `produkt`, `region`, `čas`. Není nutné — ani vhodné — je „slévat" do jedné faktové tabulky, mají *různou granularitu* (prodeje per-transakce, zásoby per-den-per-produkt, objednávky per-objednávka).

Konstelace je **přirozená architektura velkých datových skladů**. Když Kimball doporučuje stavět sklad *„bottom-up"* z datových trhů, často vznikne právě fact constellation.

## Srovnání

| Aspekt | Hvězda | Sněhová vločka | Konstelace |
| :--- | :--- | :--- | :--- |
| Tabulek faktů | 1 | 1 | více |
| Tabulek dimenzí | Ploché (denormalizované) | Normalizované (více tabulek) | Sdílené napříč fakty |
| Dotazy | Nejjednodušší | Více JOINů | Středně složité |
| Údržba dimenzí | Redundance | Bez redundance | Bez redundance |
| Místo na disk | Větší | Menší | Větší |
| Výkon čtení | Nejvyšší | Nižší | Vyšší |
| Typický použití | Datový trh | Velká dimenze s hierarchií | Celopodnikový sklad |

## Celkové schéma datového skladu

V praxi se používá *kombinace*:

- *Hvězda* — pro většinu dimenzí.
- *Sněhová vločka* — pro vybrané dimenze s hlubokou hierarchií (geografie, organizace).
- *Konstelace* — na úrovni více faktových tabulek (prodeje, zásoby, objednávky, finance, HR).

Toto hybridní řešení se v knihách (Kimball) označuje jako *galaxy schema* nebo *enterprise data warehouse bus architecture* — sdílené *conformed dimensions* napříč všemi fakty zajišťují konzistentní reporting přes celý podnik.

## Co dále

Schéma dává *strukturu*. Aby uživatel mohl s daty interaktivně pracovat, jsou potřeba **OLAP operace** — roll-up, drill-down, pivoting, slicing & dicing. To je téma poslední sekce ([[olap-operace]]).

---

*Zdroj: PIS přednáška 8, prof. Ing. Tomáš Hruška, CSc., FIT VUT v Brně. Externí reference: Kimball, R., Ross, M.: *The Data Warehouse Toolkit* (3. vyd., Wiley 2013), kap. 1–3; Adamson, C.: *Star Schema: The Complete Reference* (McGraw-Hill 2010).*
