---
title: XML v relačních a nativních XML databázích
---

# XML v relačních a nativních XML databázích

Když potřebujeme uložit XML dokumenty do databáze, máme tři hlavní strategie: **BLOB/CLOB** (uložit jako binární/textový řetězec), **shred** (rozložit XML na relační tabulky), nebo **nativní XML typ** (DB chápe vnitřní strukturu). Každá má jiné výhody — výběr závisí na frekvenci čtení/zápisu, nutnosti dotazování uvnitř XML a strukturní stabilitě dokumentů. **Native XML databases** (BaseX, eXist-db, Sedna) jsou specializované systémy, kde je XML *primární* datový model.

## Tři způsoby uložení XML v RDBMS

### 1. Uložení jako CLOB/BLOB

XML je uloženo jako jeden textový (CLOB) nebo binární (BLOB) řetězec. Databáze vnitřek dokumentu nezná.

```sql
CREATE TABLE doc_storage (
  id INTEGER PRIMARY KEY,
  xml_content CLOB
);

INSERT INTO doc_storage VALUES (1, '<menu><item>Pivo</item></menu>');
```

* **+** Rychlé a jednoduché. Žádná parsovací režie při zápisu.
* **+** Striktně zachovává obsah dokumentu (pořadí atributů, formátování, komentáře).
* **−** *Nelze dotazovat* uvnitř XML — DB vidí jen string. Pro dotaz nutno celý dokument načíst do aplikace, parsovat tam.
* **−** *Nelze updatovat částečně* — celý dokument se musí přepsat.

### 2. Shredding — rozložení do relačních tabulek

XML elementy a hodnoty se rozloží do *více tabulek*. Mapování může být manuální nebo přes XSD → DDL generátor.

```sql
-- Dekompozice <menu><item>Pivo</item><item>Víno</item></menu>
CREATE TABLE menu (id INT PRIMARY KEY);
CREATE TABLE item (id INT PRIMARY KEY, menu_id INT REFERENCES menu(id), value VARCHAR(100), seq INT);
```

* **+** Extrahovaná data jsou *relační* a lze nad nimi spouštět běžné SQL dotazy.
* **+** Indexovatelné, optimalizovatelné jako jakákoliv relační data.
* **−** *Ztrácí se původní dokument* (pořadí atributů, formátování) — obtížné rekonstruovat zpět XML.
* **−** Schéma DB svázáno s XML schématem; změna XML znamená migraci DB.

### 3. Nativní XML typ

XML je uloženo jako *objekt-relační* data v SQL typu `XMLType` (Oracle), `XML` (SQL Server, PostgreSQL), `xml` (DB2). DB chápe strukturu, indexuje, dotazuje uvnitř.

```sql
CREATE TABLE resolutions_xml (
  id NUMBER PRIMARY KEY,
  legis_num NUMBER,
  resolution XMLType
);

-- Dotaz uvnitř XML s XPath
SELECT id,
  extract(resolution, '/resolution[@public-private="public"]/action') AS action,
  extractValue(resolution, '/resolution[congress="108"]/official-title') AS title
FROM resolutions_xml
WHERE existsNode(resolution, '/resolution[legis-num="558"]') = 1;
```

* **+** *Best of both worlds* — uchovává původní dokument, lze dotazovat uvnitř.
* **+** Indexovatelné přes XML indexes (Oracle, MS SQL Server).
* **+** Atomické updaty (XQuery Update Facility).
* **−** Komplexní implementace, varianty mezi dodavateli (nepřenositelné mezi Oracle a DB2).
* **−** Vyšší režie pro velmi velké dokumenty (parsing, validace).

::: svg "Tři strategie uložení XML v RDBMS: CLOB (rychlé, neumí dotazovat uvnitř), shredding (relační, ztrácí formát), nativní XMLType (uchovává + indexuje + dotazuje)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="20" y="30" width="160" height="150" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="100" y="50" text-anchor="middle" fill="var(--text)" font-weight="600">CLOB/BLOB</text>
    <text x="100" y="68" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">jeden řetězec</text>
    <rect x="35" y="80" width="130" height="20" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="100" y="94" text-anchor="middle" fill="var(--text)" font-size="9" font-family="ui-monospace, monospace">"&lt;menu&gt;…&lt;/menu&gt;"</text>
    <text x="100" y="125" text-anchor="middle" fill="var(--accent)" font-size="10">+ rychlé I/O</text>
    <text x="100" y="142" text-anchor="middle" fill="var(--accent)" font-size="10">+ zachovává formát</text>
    <text x="100" y="160" text-anchor="middle" fill="#c84" font-size="10">− nelze dotazovat</text>
  </g>
  <g>
    <rect x="190" y="30" width="160" height="150" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="270" y="50" text-anchor="middle" fill="var(--text)" font-weight="600">Shredding</text>
    <text x="270" y="68" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">→ relační tabulky</text>
    <rect x="200" y="80" width="60" height="20" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="230" y="94" text-anchor="middle" fill="var(--text)" font-size="9" font-family="ui-monospace, monospace">menu</text>
    <rect x="280" y="80" width="60" height="20" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="310" y="94" text-anchor="middle" fill="var(--text)" font-size="9" font-family="ui-monospace, monospace">item</text>
    <text x="270" y="125" text-anchor="middle" fill="var(--accent)" font-size="10">+ SQL dotazy</text>
    <text x="270" y="142" text-anchor="middle" fill="var(--accent)" font-size="10">+ indexovatelné</text>
    <text x="270" y="160" text-anchor="middle" fill="#c84" font-size="10">− ztrácí formát</text>
  </g>
  <g>
    <rect x="360" y="30" width="160" height="150" fill="var(--bg-inset)" stroke="var(--accent)" rx="6" stroke-width="2"/>
    <text x="440" y="50" text-anchor="middle" fill="var(--text)" font-weight="600">XMLType (nativní)</text>
    <text x="440" y="68" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">strukturovaný typ</text>
    <rect x="375" y="80" width="130" height="20" fill="var(--bg-card)" stroke="var(--accent)"/>
    <text x="440" y="94" text-anchor="middle" fill="var(--text)" font-size="9" font-family="ui-monospace, monospace">XMLType {DOM tree}</text>
    <text x="440" y="125" text-anchor="middle" fill="var(--accent)" font-size="10">+ XPath/XQuery</text>
    <text x="440" y="142" text-anchor="middle" fill="var(--accent)" font-size="10">+ indexy + updaty</text>
    <text x="440" y="160" text-anchor="middle" fill="#c84" font-size="10">− vendor-specific</text>
  </g>
</svg>
:::

## SQL/XML standard

SQL:2003 definoval **SQL/XML** — část 14 standardu:

* Datový typ `XML`.
* Funkce pro mapování SQL ↔ XML: `XMLELEMENT`, `XMLATTRIBUTES`, `XMLFOREST`, `XMLAGG`.
* Predikáty: `XMLEXISTS` (testuje XPath), `IS DOCUMENT`, `VALID` (proti XSD).
* Funkce: `XMLQUERY` (extrakce XQuery), `XMLTABLE` (XML → relační tabulka).

```sql
-- XMLQUERY na řádku
SELECT XMLQUERY(
  'for $r in $res/resolution
   let $a := $r/action
   where $a/action-date = "20040311"
   order by $r/legis-num
   return <all-sponsors>{$a/sponsor}{$a/cosponsor}</all-sponsors>'
   PASSING resolution AS "res" RETURNING CONTENT)
FROM resolutions_xml;

-- XMLTABLE — XML jako relační view
SELECT t.*
FROM resolutions_xml r,
     XMLTABLE('/resolution/action' PASSING r.resolution
       COLUMNS
         action_date DATE PATH 'action-date',
         desc        VARCHAR(500) PATH 'action-desc') t;
```

Plná podpora SQL/XML je nerovnoměrná:

* **Oracle 9.2+** — kompletní (XMLType + Oracle XML DB).
* **IBM DB2 11+** — kompletní.
* **PostgreSQL** — částečná (typ `xml`, omezené funkce).
* **MS SQL Server** — silná podpora od 2005 (typ `xml`, XML indexy).
* **MySQL** — minimální (jen ExtractValue, UpdateXML).

## Nativní XML databáze

Specializované DB, kde je XML *primárním* datovým modelem.

* **Datový model** — postaven na DOM nebo XPath data model.
* **Storage** — optimalizováno pro hierarchický průchod, ne pro tabulkové operace.
* **Dotazy** — XQuery (rychlé, nativně), XPath.
* **Updaty** — XQuery Update Facility.

Reprezentanti:

* **eXist-db** (open source, Java) — populární jako application server pro XML aplikace (REST, RESTXQ, OAuth).
* **BaseX** (open source, Java) — vysoký výkon, plná SQL/XML kompatibilita.
* **Sedna** (open source, C/C++) — nativní pointerové uložení XML uzlů, descriptive schema odvozené z dat.
* **MarkLogic** (komerční) — enterprise XML/JSON multi-model DB.

```xquery
(: BaseX příklad — najít všechny knihy v knihovně :)
let $library := doc("library.xml")/library
for $book in $library/book
where $book/year > 2020
order by $book/title
return
  <result>
    {$book/title}
    {$book/author}
  </result>
```

## XML wrappers a middleware

Když chceme přistupovat k XML datům přes *relační* rozhraní (nebo naopak), používáme **wrappery** a **middleware**:

* **XML wrappers** — komponenta v federated DB, která prezentuje externí XML dokumenty jako relační tabulky. DB2 federation, Microsoft Linked Server.
* **XML middleware (ESB)** — Enterprise Service Bus, který doručuje XML zprávy (SOAP) mezi aplikacemi s vlastnostmi VETRO (Validity, Enrichment, Transformations, Routing). Příklady: MuleSoft, Apache Camel, IBM Integration Bus.
* **XML binding (JAXB)** — mapování XML ↔ Java objekty. Anotace `@XmlRootElement`, `@XmlAttribute` definují strukturu.

```java
@XmlRootElement
public class BreakfastMenu {
  @XmlElement private List<Food> food;
}
@XmlRootElement
public class Food {
  @XmlElement private String name;
  @XmlElement private BigDecimal price;
}

JAXBContext ctx = JAXBContext.newInstance(BreakfastMenu.class);
Unmarshaller u = ctx.createUnmarshaller();
BreakfastMenu menu = (BreakfastMenu) u.unmarshal(new File("menu.xml"));
```

## Kdy XML, kdy JSON, kdy relační

* **XML** — výměna s external systémy (SOAP, EDI, ebXML, HL7 v medicíně), dokumenty s formátováním a markup (XHTML, DocBook), kde je nutná *strict validation* (banky, healthcare).
* **JSON** — moderní web/mobile API, konfigurace, mikroservis komunikace. Lehčí, rychlejší.
* **Relační** — jádro transakčních systémů.

V praxi databáze často podporuje *všechny tři* — PostgreSQL má klasické tabulky + `xml` + `jsonb`. Volba per use case.

::: link "Oracle XML DB Developer's Guide" "https://docs.oracle.com/en/database/oracle/oracle-database/19/adxdb/index.html"
:::

::: link "BaseX documentation" "https://docs.basex.org/wiki/Main_Page"
:::

::: link "PostgreSQL XML Type" "https://www.postgresql.org/docs/current/datatype-xml.html"
:::

---

*Zdroj: UPA přednáška *XML and JSON in Databases* (Rychlý, 25. listopadu 2025). Externí reference: Melton, J., Buxton, S.: *Querying XML — XQuery, XPath, and SQL/XML in Context*, Morgan Kaufmann 2006; Bourret, R.: *XML and Databases (overview)*, 2005, archived; Oracle XML DB Developer's Guide; ISO/IEC 9075-14 SQL/XML.*
