---
title: XML — jazyk, schéma, XPath, XQuery
---

# XML — jazyk, schéma, XPath, XQuery

**XML** (eXtensible Markup Language, W3C 1998) je textový značkovací jazyk pro reprezentaci strukturovaných dat. Na rozdíl od JSON je XML *plně self-describing* (validace schématem, namespacy, processing instructions, entity, atributy vs. obsah) a má bohaté nástroje pro dotazování (XPath, XQuery, XSLT). XML je dnes preferovaný formát pro *enterprise data exchange* (SOAP, EDI, ebXML), zatímco JSON dominuje *web API*. Většina moderních RDBMS podporuje XML jako *nativní datový typ*.

## Co je XML dokument

XML dokument se skládá z těchto částí:

* **XML deklarace** — `<?xml version="1.0" encoding="UTF-8"?>` na začátku, identifikuje verzi a kódování.
* **Elementy** — logické části s *jménem*, *atributy* a *obsahem* mezi `<tag>` a `</tag>`. Mohou být prázdné (`<br/>`).
* **Atributy** — key-value páry uvnitř start-tagu (`<food id="42" type="soup">`).
* **Text content** — text mezi tagy. Speciální znaky escapovány entitami (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`).
* **CDATA sekce** — `<![CDATA[ text bez escapování ]]>` — pro vložení kódu, formulí, apod.
* **Procesní instrukce** — `<?...?>` (např. CSS/XSLT odkazy).
* **Komentáře** — `<!-- ... -->`.

Korektní XML dokument je:

* **Well-formed** — syntakticky správný. Každý start-tag má end-tag, tagy se neporušeně vnoří, atributy jsou v uvozovkách. Toto je *nutná* podmínka.
* **Valid** — odpovídá specifickému *schématu*. Toto je *volitelné* — XML lze používat i bez schématu.

Příklad — data-centric XML:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/css" href="./menu.css"?>
<breakfastMenu xmlns="http://mypub.com/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://mypub.com/ http://mypub.com/menu.xsd">
  <food>
    <name>Pilsner Urquell</name>
    <price>50.0</price>
    <description>A pale lager beer brewed in Plzen.</description>
    <calories>215</calories>
  </food>
</breakfastMenu>
```

`xmlns="..."` deklaruje výchozí **namespace** — jedinečný identifikátor (URI) pro jména v dokumentu. Předchází kolizím při kombinaci XML z různých zdrojů (např. `<title>` v HTML vs. `<title>` v MathML).

## XML schéma — validace struktury

Validace XML dokumentu proti schématu zajistí, že struktura je *předvídatelná*. Hlavní jazyky pro schéma:

* **DTD** (Document Type Definition) — z SGML, *deprecated* (omezené, žádné typy, nepodporují namespace).
* **W3C XML Schema (XSD)** — de-facto standard. Bohaté typy (xs:integer, xs:date, xs:dateTime), kardinality, omezení.
* **RELAX NG** — silnější jazyk, podpora validace text node.
* **Schematron** — rule-based s XPath výrazy. Hodí se na složitější business pravidla.

XSD příklad odpovídající dokumentu výše:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema elementFormDefault="qualified"
  targetNamespace="http://mypub.com/"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xs:element name="breakfastMenu" type="breakfast-menu-type"/>

  <xs:complexType name="breakfast-menu-type">
    <xs:sequence>
      <xs:element type="food-type" name="food" minOccurs="1" maxOccurs="unbounded"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="food-type">
    <xs:all>
      <xs:element type="xs:string" name="name"/>
      <xs:element type="xs:decimal" name="price"/>
      <xs:element type="xs:string" name="description"/>
      <xs:element type="xs:integer" name="calories"/>
    </xs:all>
  </xs:complexType>
</xs:schema>
```

`xs:sequence` — pevné pořadí; `xs:all` — libovolné pořadí; `xs:choice` — alternativa.

## Data-centric vs. document-centric XML

XML má dva typické use-case s opačnými vlastnostmi:

### Data-centric XML

Reprezentace *strukturovaných dat* (databázové záznamy, konfigurace, EDI).

* Pravidelná struktura, hluboké stromy.
* Pořadí elementů často *nezávislé*.
* Atributy a hodnoty převažují nad volným textem.
* Typický pro import/export mezi RDBMS, SOAP zprávy.

### Document-centric XML

Reprezentace *textových dokumentů* (DocBook, XHTML, TEI).

* Nepravidelná struktura, mělké stromy s volným textem.
* Pořadí elementů *záleží* (text je sekvenční).
* Markup je *vložen* do textu (např. `<em>` uvnitř odstavce).
* Typický pro renderování (CSS, XSLT → HTML/PDF).

```xml
<!-- Document-centric: XHTML -->
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    A break: <br />
    An image: <img src="./happy.gif" alt="Happy face" />
    Nějaký <em>zvýrazněný</em> text.
  </body>
</html>
```

Pro databázové úložiště má smysl ukládat *data-centric* — document-centric je vhodnější pro file-based úložiště (XQuery search engine, např. eXist-db).

## XPath — dotaz na XML

**XPath** je jazyk pro *adresování uzlů* v XML stromě. Používá *context-based location path*, který je posloupností *location steps*.

Syntax:

```
/breakfastMenu/food[price < 100]/name
   -- absolutní cesta od kořene
   -- breakfastMenu → child food → kde price < 100 → child name

//food[starts-with(name, 'P')]
   -- libovolná hloubka (axis descendant-or-self)
   -- food, jehož name začíná na P

string-join(//name/text(), '; ')
   -- spojí všechny text-nody jmen oddělené středníkem
```

XPath axes (osy):

* `child::` (default) — přímé potomky.
* `descendant::` — všechny potomky v podstromě.
* `parent::` — rodič.
* `ancestor::` — všichni předkové.
* `following-sibling::`, `preceding-sibling::` — sourozenci v pořadí.
* `attribute::` (zkratka `@`) — atributy uzlu.
* `self::`, `descendant-or-self::` (zkratka `//`).

Predikáty v `[...]`:

```
//food[price < 100 and calories > 200]
//food[@id = "42"]
//food[position() = 1]                 -- první food
//food[last()]                          -- poslední food
//*[name() = "food"]                    -- nezávisle na namespace
```

XPath je *základem* XQuery, XSLT, Schematronu.

## XQuery — funkcionální dotaz a transformace XML

**XQuery** (W3C 2007) je úplný *programovací* jazyk pro XML — kombinuje SQL-like dotazy s funkcionálními rysy. Klíčová konstrukce: **FLWOR** výraz.

```xquery
for $i in fn:doc("menu.xml")/breakfastMenu/food[name = 'Pilsner Urquell'],
    $j in fn:doc("menu.xml")/breakfastMenu/food[price < $i/price]
let $rebate := $j/price * 0.1
where $j/calories < 300
order by $j/price ascending, $j/name
return
  <cheaper-than-pilsner>
    {$j/name}
    {$j/price}
    <discount>{$rebate}</discount>
  </cheaper-than-pilsner>
```

FLWOR znamená: **F**or — iterace přes sequence; **L**et — pomocná proměnná; **W**here — filtr; **O**rder by — řazení; **R**eturn — výsledek (může konstruovat nový XML strom).

XQuery je *Turing-complete* — lze v něm psát celé aplikace (eXist-db jako application server).

## XSLT — transformace XML

**XSLT** (Extensible Stylesheet Language Transformations) je *jiný* jazyk se stejným cílem (transformovat XML), ale s odlišnou paradigmatem — *template-based* (pravidla "kdy se na uzel narazí, udělej toto"). XSLT je deklarativní, XQuery je funkcionální.

V praxi: XSLT pro XML→HTML/PDF rendering; XQuery pro extrakci a transformaci dat.

## XML vs. JSON

| | XML | JSON |
| :--- | :--- | :--- |
| **Verbose** | hodně značek | méně značek |
| **Typy** | jen `string` v textu (typy přes XSD) | nativní `number`, `bool`, `null`, array, object |
| **Atributy** | `<tag attr="...">` + obsah | neexistují (jen pole) |
| **Namespace** | ✓ | ✗ (jen prefixy v polích) |
| **Validation** | XSD, RELAX NG, Schematron | JSON Schema (méně rozšířené) |
| **Dotazování** | XPath, XQuery, XSLT | JSONPath, jq |
| **Use case** | enterprise (SOAP, EDI), dokumenty | web API (REST, GraphQL), config |
| **Schema** | povinné v enterprise | optional |

V databázích převažuje *trend k JSON* (PostgreSQL JSONB, MongoDB BSON), ale XML zůstává standardem v enterprise (např. eBay, banky pro EDI). Více o JSON v [[json-zaklady]] a o XML v RDBMS v [[xml-v-db]].

::: link "W3C — XML 1.0 Recommendation" "https://www.w3.org/TR/xml/"
:::

::: link "W3C — XML Schema (XSD)" "https://www.w3.org/TR/xmlschema11-1/"
:::

::: link "W3C — XQuery 3.1" "https://www.w3.org/TR/xquery-31/"
:::

---

*Zdroj: UPA přednáška *XML and JSON in Databases* (Rychlý, 25. listopadu 2025). Externí reference: Bray, T. et al.: *Extensible Markup Language (XML) 1.0*, W3C Recommendation, 2008; Walmsley, P.: *XQuery — Search Across a Variety of XML Data*, 2nd ed., O'Reilly 2015; Tidwell, D.: *XSLT — Mastering XML Transformations*, 2nd ed., O'Reilly 2008.*
