---
title: JSON — formát, srovnání s XML
---

# JSON — formát, srovnání s XML

**JSON** (JavaScript Object Notation) je odlehčený textový datový formát odvozený od literálové syntaxe JavaScriptu. Standardizovan v ECMA-404 (2013) a IETF RFC 8259 (2017). JSON je dnes *de facto* standard pro **web API** (REST, GraphQL), konfigurace (npm, tsconfig), datové sklady (parquet metadata) a komunikaci mezi mikroservisy. Ve srovnání s XML je výrazně *kompaktnější*, *snadno parsovatelný* (zejména v JS/Python/Ruby) a *human-readable* — proto vytlačuje XML ze všech webových scénářů.

## Datový model JSON

JSON má šest základních datových typů:

* **`null`** — nulová hodnota.
* **`true` / `false`** — booleovské hodnoty.
* **`number`** — celé nebo desetinné číslo (IEEE 754 double precision, bez explicitních typů int/float).
* **`string`** — Unicode řetězec v uvozovkách (`"text"`), escapování `\"`, `\\`, `\n`, `\t`, `\uXXXX`.
* **`array`** — uspořádaná posloupnost hodnot `[…]`.
* **`object`** — neuspořádaná množina key-value párů `{ "key": value, … }`. Klíče jsou stringy.

Hodnoty se rekurzivně skládají — pole může obsahovat objekty, objekty mohou obsahovat pole, atd.

```json
[
  {
    "name": "Pilsner Urquell",
    "price": 50.0,
    "description": "A pale lager beer brewed in Plzen.",
    "calories": 215,
    "available": true,
    "tags": ["beer", "pale-lager", "Czech"]
  },
  {
    "name": "Becherovka",
    "price": 60.0,
    "description": "A herbal bitter.",
    "calories": null,
    "available": false,
    "tags": []
  }
]
```

## Srovnání JSON vs XML

Pro stejná data uvedme JSON a XML reprezentaci:

```json
{ "name": "Anna", "age": 31, "city": "Brno" }
```

```xml
<person>
  <name>Anna</name>
  <age>31</age>
  <city>Brno</city>
</person>
```

| Aspekt | JSON | XML |
| :--- | :--- | :--- |
| **Velikost** | menší (~40% kratší) | větší (start+end tagy, atributy) |
| **Parsing** | nativní v JS, Python, Ruby (`JSON.parse`) | vyžaduje DOM/SAX parser |
| **Typy** | `string`, `number`, `bool`, `null`, `array`, `object` | jen text; typy přes XSD |
| **Atributy** | žádné (jen klíče v objektech) | `<tag attr="...">` + obsah |
| **Komentáře** | žádné (JSON5 ano) | `<!-- … -->` |
| **Namespace** | žádné | `xmlns:prefix="…"` |
| **Validace** | JSON Schema (méně rozšířené) | XSD, RELAX NG (vyzrálé) |
| **Transformace** | jq, custom | XSLT (standardní) |
| **Dotazování** | JSONPath, jq | XPath, XQuery |
| **Use case** | web API, config, mikroservis | enterprise, dokumenty s markup |

### Kompaktnost — porovnání

```
XML:  <food><name>Pilsner</name><price>50</price></food>
      = 56 bytů

JSON: {"name":"Pilsner","price":50}
      = 28 bytů (50% kratší!)
```

Pro velké datasety je úspora významná — zejména v RESTful API, kde se přenášejí *miliony* zpráv denně.

## Binární formáty — BSON, MessagePack, CBOR

Pro lepší výkon (parsing, velikost) existují *binární* varianty:

* **BSON** (Binary JSON) — používaný MongoDB. Přidává typy `Date`, `ObjectId`, `Binary`, `Decimal128`. Mírně větší než JSON (typové prefixy), ale rychlejší parsing.
* **MessagePack** — *menší* než JSON, rychlejší. Široce podporován (Redis, Fluentd).
* **CBOR** (Concise Binary Object Representation) — IETF standard RFC 8949, podobné MessagePack.
* **Protocol Buffers** (Google) — schema-based, mnohem rychlejší a kompaktnější, ale potřebuje předdefinované `.proto` soubory.

Volba:
* *Lidská čitelnost* → JSON.
* *Rychlost parsing v MongoDB* → BSON.
* *Maximum performance, IoT* → MessagePack, CBOR, Protobuf.

## JSON Schema — validace

**JSON Schema** je analogie XSD pro JSON. Definuje strukturu a omezení.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name":     { "type": "string", "minLength": 1 },
    "age":      { "type": "integer", "minimum": 0, "maximum": 150 },
    "email":    { "type": "string", "format": "email" },
    "tags":     {
      "type": "array",
      "items": { "type": "string" },
      "uniqueItems": true
    }
  },
  "required": ["name", "email"]
}
```

Validátory: `ajv` (JS, nejrychlejší), `jsonschema` (Python), `everit-json-schema` (Java).

JSON Schema je *méně přísné* než XSD — neumí všechny constraint typy a méně se používá pro validaci komunikace.

## JSONPath — dotazy nad JSON

**JSONPath** je analogie XPath pro JSON. Není formálně standardizován (RFC 9535 je *navrhováno* 2024), různé implementace se trochu liší.

Syntax:

```
$                  -- kořen
$.name             -- atribut name
$.items[0]         -- první prvek pole
$.items[*]         -- všechny prvky pole
$.items[?(@.price > 100)]  -- filter expression
$..name            -- recursive descent (všechny name v celém stromě)
```

Příklad:

```json
{
  "store": {
    "books": [
      { "title": "1984", "price": 15 },
      { "title": "Brave New World", "price": 12 }
    ]
  }
}
```

```
$.store.books[*].title              -- ["1984", "Brave New World"]
$.store.books[?(@.price > 13)].title -- ["1984"]
```

## jq — command-line tool pro JSON

`jq` je výkonný CLI nástroj pro transformaci JSON. Připomíná funkcionální shellové programování:

```bash
# extrakce
curl https://api.github.com/repos/torvalds/linux | jq '.full_name'

# filter + map
cat data.json | jq '.items[] | select(.price > 50) | .name'

# agregace
cat data.json | jq '[.items[].price] | add'

# transformace struktury
cat data.json | jq '{ user: .name, balance: .accounts[0].balance }'
```

Pro analýzu JSON v CI/CD pipelines, monitoring, debugging je jq *nepostradatelný*.

## Use cases

| Use case | Doporučení |
| :--- | :--- |
| **Web REST API** | JSON |
| **GraphQL** | JSON |
| **Konfigurace (eslintrc, tsconfig)** | JSON nebo JSONC (JSON with comments) |
| **Logy** | JSON Lines (`.jsonl`, jeden JSON objekt na řádek) |
| **Datové sklady (metadata)** | JSON / JSON Schema |
| **MongoDB úložiště** | BSON |
| **SOAP/EDI** | XML |
| **Markup dokumenty** | XML (DocBook) nebo Markdown |
| **gRPC** | Protocol Buffers (binary) |

## JSON ve veřejných API

* **GitHub API**, **Twitter API**, **Stack Overflow API** — vše JSON.
* **OpenAPI / Swagger** — popis REST API ve formě JSON nebo YAML.
* **JWT (JSON Web Token)** — autentizační tokeny, kódování v JSON.
* **JSON-LD** — Linked Data v JSON formátu (sémantický web alternativa k RDF/XML).

JSON dominuje moderní web ecosystem. XML zůstává v *legacy* enterprise systémech a tam, kde je nutná silná validace.

Více o JSON v databázích viz [[json-v-db]].

::: link "RFC 8259 — The JavaScript Object Notation (JSON) Data Interchange Format" "https://datatracker.ietf.org/doc/html/rfc8259"
:::

::: link "JSON Schema Specification" "https://json-schema.org/specification.html"
:::

::: link "JSONPath specification (RFC 9535)" "https://datatracker.ietf.org/doc/rfc9535/"
:::

---

*Zdroj: UPA přednáška *XML and JSON in Databases* (Rychlý, 25. listopadu 2025). Externí reference: ECMA-404 *The JSON Data Interchange Syntax*, 2nd ed., 2017; Bray, T.: *The JavaScript Object Notation (JSON) Data Interchange Format*, RFC 8259, IETF 2017; Bourne, J.: *Pro Couchbase Server*, 2nd ed., Apress 2017; jq manual.*
