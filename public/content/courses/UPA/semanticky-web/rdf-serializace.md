---
title: Serializace RDF — Turtle, RDF/XML, JSON-LD
---

# Serializace RDF — Turtle, RDF/XML, JSON-LD

RDF graf je *abstraktní matematická struktura*. Pro uložení na disk, přenos po síti, nebo embedding v HTML stránce potřebujeme *konkrétní syntaktickou reprezentaci* — **serializaci**. Stejný graf lze zapsat různými způsoby; všechny serializace jsou ekvivalentní (lze je převést jednu v druhou bez ztráty informace). Pro různé use cases mají různé formáty různé výhody — **Turtle** pro lidskou čitelnost, **JSON-LD** pro web a JavaScript, **RDF/XML** pro legacy enterprise, **N-Triples** pro jednoduché parsing a streaming.

## Turtle — Terse RDF Triple Language

**Turtle** je dnes *nejpoužívanější* serializace RDF, balanc mezi kompaktností a čitelností. Standardizována jako W3C Recommendation 2014.

```turtle
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix ex:   <http://example.com/> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .

ex:anna a foaf:Person ;
        foaf:name      "Anna Nováková" ;
        foaf:age       31 ;
        foaf:nick      "anička", "annie", "ann" ;
        foaf:knows     ex:bob , ex:carol ;
        ex:birthDate   "1993-04-12"^^xsd:date ;
        ex:livesAt     [
          ex:street    "Botanická 12" ;
          ex:city      "Brno"
        ] .

ex:bob a foaf:Person ;
       foaf:name "Bob Smith" .
```

Klíčové prvky syntaxe:
* `@prefix x: <URI> .` — deklarace prefixu.
* `a` — zkratka pro `rdf:type`.
* `;` (středník) — *stejný subjekt*, jiný predikát (úspora opakování subjektu).
* `,` (čárka) — *stejný subjekt a predikát*, jiný objekt (úspora opakování predikátu).
* `[ … ]` — blank node v inline syntaxi.
* `"text"@cs` — string s jazykem.
* `"value"^^datatype` — typovaný literál.
* `.` (tečka) — konec věty (trojice nebo bloku).

Turtle je *flexibilní* — stejnou množinu trojic lze napsat ve více variantách. Konvence: pro lepší čitelnost grupujte trojice se stejným subjektem.

## RDF/XML — historická serializace

RDF/XML (W3C 2004, aktualizováno 2014) byla *původní* serializace RDF. Dnes je verbose a méně oblíbený, ale stále podporovaný — zejména v enterprise integrace.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:foaf="http://xmlns.com/foaf/0.1/"
  xmlns:ex="http://example.com/">

  <foaf:Person rdf:about="http://example.com/anna">
    <foaf:name>Anna Nováková</foaf:name>
    <foaf:age rdf:datatype="http://www.w3.org/2001/XMLSchema#integer">31</foaf:age>
    <foaf:knows rdf:resource="http://example.com/bob"/>
    <foaf:knows rdf:resource="http://example.com/carol"/>
  </foaf:Person>

  <foaf:Person rdf:about="http://example.com/bob">
    <foaf:name>Bob Smith</foaf:name>
  </foaf:Person>

</rdf:RDF>
```

Nevýhody:
* **Verbose** — typicky 3-4× delší než Turtle pro stejná data.
* **Nesnadná lidská editace** — XML značky se opakují, atributy `rdf:about`, `rdf:resource` se snadno zaměňují.
* **Více cest jak vyjádřit totéž** — RDF/XML má několik *abbreviated* forem, což ztěžuje parsing.

Výhody:
* **XML toolchain** — XSD validace, XSLT transformace, XQuery.
* **Legacy podpora** — starší knihovny (Apache Jena) ho stále podporují a běžně s ním v praxi pracují.

## N-Triples / N-Quads — řádek-orientované

**N-Triples** je nejjednodušší serializace — jedna trojice na řádek, žádné prefixy ani zkratky.

```
<http://example.com/anna> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
<http://example.com/anna> <http://xmlns.com/foaf/0.1/name> "Anna Nováková" .
<http://example.com/anna> <http://xmlns.com/foaf/0.1/age> "31"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://example.com/anna> <http://xmlns.com/foaf/0.1/knows> <http://example.com/bob> .
<http://example.com/bob>  <http://xmlns.com/foaf/0.1/name> "Bob Smith" .
```

Použití:
* **Streaming** — parser zpracuje řádek po řádku, žádný stav.
* **Hromadné importy/exporty** — Wikidata dump je v N-Triples.
* **Diff / source control** — řádky se snadno porovnávají.

**N-Quads** je rozšíření o čtvrtý prvek (named graph URI).

## JSON-LD — JSON s Linked Data sémantikou

**JSON-LD** (W3C 2014, 1.1 z 2020) je serializace RDF v JSON formátu. Cíl: snadná integrace s webovými technologiemi (JavaScript, REST API). Dnes preferovaný formát pro embedding sémantiky v HTML stránkách (Google rich snippets).

```json
{
  "@context": {
    "foaf": "http://xmlns.com/foaf/0.1/",
    "ex":   "http://example.com/"
  },
  "@id": "ex:anna",
  "@type": "foaf:Person",
  "foaf:name": "Anna Nováková",
  "foaf:age": 31,
  "foaf:knows": [
    { "@id": "ex:bob",   "foaf:name": "Bob Smith" },
    { "@id": "ex:carol", "foaf:name": "Carol White" }
  ]
}
```

Klíčové prvky:
* `@context` — definuje prefixy a typy. Lze inline nebo externě (`"@context": "https://schema.org"`).
* `@id` — identifikuje uzel (URI).
* `@type` — `rdf:type`.
* `@value`, `@language`, `@type` (vnitřní) — pro literály s typy a jazyky.

JSON-LD v HTML stránce:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "Bramborák",
  "recipeIngredient": ["brambory", "vejce", "mouka", "česnek", "sůl"],
  "cookTime": "PT20M",
  "recipeYield": "4 porce"
}
</script>
```

Tento markup čte Google a zobrazí *rich snippet* (obrázek, doba vaření, hodnocení) ve výsledcích vyhledávání.

::: viz rdf-format-switcher "Stejný RDF graf ve čtyřech serializacích (Turtle, N-Triples, RDF/XML, JSON-LD) + porovnání velikostí. Turtle bývá nejkompaktnější, RDF/XML 2–3× větší."
:::

## Konverze mezi formáty

Všechny serializace jsou ekvivalentní — knihovny umožňují konverzi:

```bash
# Apache Jena CLI tools
riot --output=N-TRIPLES input.ttl > output.nt
riot --output=RDFXML input.ttl > output.rdf
riot --output=JSONLD input.ttl > output.jsonld

# online
curl -X POST -d @input.ttl https://www.easyrdf.org/converter
```

Knihovny:
* **Apache Jena** (Java) — `riot` parser/writer.
* **rdflib** (Python) — multi-format parser.
* **N3.js** (JavaScript) — Turtle/N3 parsing.
* **rdfjs** (JavaScript) — universal RDF API.

## Volba serializace

| Use case | Doporučení |
| :--- | :--- |
| **Editovat ručně** | Turtle |
| **Veřejné publikace, exchange** | Turtle nebo RDF/XML |
| **HTML embedding (SEO)** | JSON-LD |
| **API odpovědi** | JSON-LD |
| **Hromadné dumps** | N-Triples (Gzip) |
| **Streaming, ETL** | N-Triples |
| **Versioning v Gitu** | N-Triples (řádek-orientované) |
| **Legacy enterprise** | RDF/XML |

## Srovnání velikostí

Pro stejných 1000 trojic (typický graf osob):

* Turtle: ~50 KB.
* RDF/XML: ~150 KB.
* JSON-LD: ~80 KB.
* N-Triples: ~120 KB.
* Komprimované (gzip) — všechny ~10-15 KB (komprese odstraňuje opakující se URI prefixy).

## Microformats — alternativní embedding

Mimo JSON-LD existují i další způsoby vkládání sémantiky do HTML:

* **Microformats** (microformats.org) — anotace HTML elementů přes předdefinované hodnoty atributu `class`. Úzká množina formátů (`h-card`, `h-event`).
* **RDFa** (W3C 2015) — atributy `resource`, `property`, `typeof` ve standardním HTML. Bohatší než microformats.
* **Microdata** (HTML5) — atributy `itemscope`, `itemtype`, `itemprop`. Méně oblíbený než JSON-LD.

Dnes Google preferuje **JSON-LD** (snazší údržba, oddělené od presentation), ale RDFa i microdata stále parsuje.

::: link "W3C — RDF 1.1 Turtle" "https://www.w3.org/TR/turtle/"
:::

::: link "W3C — JSON-LD 1.1 Specification" "https://www.w3.org/TR/json-ld11/"
:::

::: link "W3C — RDF/XML Syntax Specification" "https://www.w3.org/TR/rdf-syntax-grammar/"
:::

---

*Zdroj: UPA přednáška *Sémantický web a ontologie* (Burget). Externí reference: Beckett, D., Berners-Lee, T., Prud'hommeaux, E., Carothers, G.: *RDF 1.1 Turtle*, W3C Recommendation 2014; Sporny, M. et al.: *JSON-LD 1.1*, W3C Recommendation 2020; Schema.org documentation; Google Rich Results Test.*
