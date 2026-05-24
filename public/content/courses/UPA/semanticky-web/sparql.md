---
title: SPARQL — dotazovací jazyk pro RDF
---

# SPARQL — dotazovací jazyk pro RDF

**SPARQL** (SPARQL Protocol and RDF Query Language, W3C 2008, 1.1 z 2013) je standardizovaný dotazovací jazyk pro RDF data ([[rdf]]). Připomíná SQL, ale je založen na **graph pattern matching** — místo tabulek dotazuje *trojice* v RDF grafu. SPARQL je *protokol* (HTTP REST endpoint), *jazyk* (syntax dotazů) a *result format* (XML, JSON, CSV). Veřejné SPARQL endpoints existují pro DBpedia, Wikidata, Europeana, Bioinformatics databáze a tisíce dalších datasetů.

## Základní SELECT — graf pattern

SPARQL dotaz se skládá z **triple patterns** — trojic, kde místo URI nebo literálu může být *proměnná* (`?x`, `$x`). DB pak najde všechny *vázání* (bindings) proměnných, které splňují pattern.

```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?name ?email
WHERE {
  ?person a foaf:Person .
  ?person foaf:name ?name .
  ?person foaf:mbox ?email .
}
```

Význam: "Najdi všechny osoby a jejich jména + e-maily."

DB hledá v grafu trojice:
* `(?person, rdf:type, foaf:Person)` — vázat `?person` na všechny entity typu Person.
* `(?person, foaf:name, ?name)` — pro každý `?person` najít jeho jméno.
* `(?person, foaf:mbox, ?email)` — totéž pro e-mail.

Spojení vázání (analogie JOIN v SQL) — výsledkem je tabulka `(?name, ?email)`.

::: viz sparql-graph-matcher "Pište SPARQL dotaz nad malým RDF grafem — odpovídající hrany se zvýrazní červeně, vazby vypisuje tabulka. Vyzkoušejte FILTER, OPTIONAL, friends-of-friends."
:::

## Klauzule SELECT a modifiers

```sparql
SELECT DISTINCT ?name
WHERE { ?p foaf:name ?name }
ORDER BY ?name
LIMIT 10 OFFSET 20
```

* `DISTINCT` — deduplikace výsledků.
* `ORDER BY` — řazení (`ASC`/`DESC`).
* `LIMIT` — max počet výsledků.
* `OFFSET` — přeskočení prvních N (pro stránkování).

## FILTER — podmínky nad hodnotami

```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dbo:  <http://dbpedia.org/ontology/>

SELECT ?name ?age
WHERE {
  ?p a foaf:Person .
  ?p foaf:name ?name .
  ?p dbo:birthYear ?year .
  BIND ((2025 - ?year) AS ?age)
  FILTER (?age >= 18 && ?age <= 65)
  FILTER (LANG(?name) = "cs" || LANG(?name) = "en")
}
```

`FILTER` aplikuje boolovské výrazy. Operátory: `=`, `!=`, `<`, `>`, `<=`, `>=`, `&&`, `||`, `!`. Funkce: `STR`, `LANG`, `LANGMATCHES`, `DATATYPE`, `REGEX`, `CONTAINS`, `STRSTARTS`, `STRENDS`, `IRI`, `STRDT`.

## OPTIONAL — left outer join

Pokud chceme získat data, *která mohou ale nemusí* být přítomna:

```sparql
SELECT ?name ?nick
WHERE {
  ?p foaf:name ?name .
  OPTIONAL { ?p foaf:nick ?nick }
}
```

Pokud osoba nemá `foaf:nick`, řádek bude obsahovat `?name` ale `?nick` bude *unbound*.

## UNION — alternativní pattern

```sparql
SELECT ?name
WHERE {
  ?p a foaf:Person .
  ?p foaf:name ?name .
  {
    ?p foaf:knows ex:anna
  } UNION {
    ?p foaf:knows ex:bob
  }
}
```

Najde osoby, které znají Annu *nebo* Boba.

## Path expressions — průchod grafem

SPARQL 1.1 zavedl **property paths** — průchod přes vzory hran:

```sparql
?p foaf:knows ?q                -- přímý vztah
?p foaf:knows+ ?q               -- 1..N kroků (transitive)
?p foaf:knows* ?q               -- 0..N kroků
?p foaf:knows/foaf:name ?n      -- zřetězení (přítel a jeho jméno)
?p foaf:knows|foaf:friend ?q    -- alternativa
?p (foaf:knows | ^foaf:knows)+ ?q  -- transitive, oba směry
```

Path expressions umožňují elegantně dotazovat *transitive closure* (předkové, oblasti). V SQL by toto vyžadovalo *recursive CTE*.

## Agregace — COUNT, SUM, GROUP BY

```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?country (COUNT(?p) AS ?count) (AVG(?age) AS ?avgAge)
WHERE {
  ?p a foaf:Person .
  ?p foaf:based_near ?city .
  ?city dbo:country ?country .
  ?p dbo:age ?age .
}
GROUP BY ?country
HAVING (COUNT(?p) > 10)
ORDER BY DESC(?count)
```

Funkce: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `SAMPLE`, `GROUP_CONCAT`.

## CONSTRUCT — vytvoření nového RDF grafu

Místo tabulky výsledků vrátí *nový RDF graf*:

```sparql
PREFIX foaf:   <http://xmlns.com/foaf/0.1/>
PREFIX schema: <http://schema.org/>

CONSTRUCT {
  ?p a schema:Person ;
     schema:name ?name ;
     schema:email ?email .
}
WHERE {
  ?p a foaf:Person ;
     foaf:name ?name ;
     foaf:mbox ?email .
}
```

Použití: *konverze* mezi ontologiemi (FOAF → schema.org), *projekce* podgrafu.

## ASK — testování existence

Vrátí `true` nebo `false` podle toho, zda pattern najde alespoň jeden match:

```sparql
ASK {
  ex:anna foaf:knows ex:bob .
}
```

Užitečné pro permission checks, integrity testy.

## DESCRIBE — všechny fakty o entitě

```sparql
DESCRIBE <http://dbpedia.org/resource/Brno>
```

Vrátí všechny trojice, kde Brno je subjekt (nebo objekt). Implementace závisí na DB — vrací různě bohatá data.

## SPARQL Update — modifikace RDF dat

SPARQL 1.1 přidala *update jazyk* — analogie SQL DML:

```sparql
PREFIX ex: <http://example.com/>

INSERT DATA {
  ex:anna foaf:age 32 ;
          foaf:nick "annie" .
}

DELETE DATA {
  ex:anna foaf:nick "ann" .
}

DELETE { ?p foaf:age ?old }
INSERT { ?p foaf:age ?new }
WHERE  {
  ?p foaf:age ?old .
  BIND ((?old + 1) AS ?new)
}
```

`LOAD <url>` — import RDF souboru.
`CLEAR GRAPH <uri>` — vymazat named graph.
`CREATE GRAPH <uri>` — vytvořit nový graph.

## SPARQL Protocol

SPARQL je nejen jazyk, ale i **HTTP protokol** — RESTful endpoint pro dotazy:

```
GET /sparql?query=SELECT...&output=json HTTP/1.1
Host: dbpedia.org
```

```
POST /sparql HTTP/1.1
Host: dbpedia.org
Content-Type: application/sparql-query

SELECT ?name WHERE { ?p foaf:name ?name } LIMIT 10
```

Veřejné endpoints:
* **DBpedia** — http://dbpedia.org/sparql
* **Wikidata** — https://query.wikidata.org/sparql
* **Europeana** — https://sparql.europeana.eu/
* **BBC Music/Wildlife** — různé endpoints
* **LinkedGeoData** — http://linkedgeodata.org/sparql

## Klient-server odezva

Výstupní formáty:
* **SPARQL Results XML** — W3C standard.
* **SPARQL Results JSON** — častější pro web aplikace.
* **CSV/TSV** — pro tabulkové zpracování.
* **Turtle/JSON-LD** — pro CONSTRUCT/DESCRIBE.

```json
{
  "head": { "vars": ["name", "email"] },
  "results": {
    "bindings": [
      {
        "name":  { "type": "literal", "value": "Anna Nováková" },
        "email": { "type": "uri", "value": "mailto:anna@ex.com" }
      },
      ...
    ]
  }
}
```

## Federated queries — dotaz přes více endpoints

SPARQL 1.1 zavedl **SERVICE** klauzuli pro *federation*:

```sparql
SELECT ?name ?city
WHERE {
  ?p foaf:name ?name .
  SERVICE <http://dbpedia.org/sparql> {
    ?p dbo:birthPlace ?city .
  }
}
```

Lokální endpoint udělá první pattern, vzdálený DBpedia endpoint dodá city. DB sloučí výsledky.

## Praktické tipy

* **PREFIX deklarace** vždy nahoře, šetří psaní.
* **DISTINCT** používejte rozvážně — drahá operace.
* **OPTIONAL** patří *za* povinné patterns (jinak generuje cross-join).
* **FILTER** dejte co nejblíže ke zdroji vázání proměnné — sníží intermediate result.
* **LIMIT** vždy při testování — vrátí prvních N, neudusíte endpoint.
* **DBpedia / Wikidata mají rate limits** — pro produkční použití lokálně nainstalovaný triple store.

## Příklad — komplexní Wikidata dotaz

"Najdi všechny české fyziky narozené v 20. století, s rokem narození a fotografií":

```sparql
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>

SELECT ?personLabel ?birthYear ?image
WHERE {
  ?person wdt:P106 wd:Q169470 .          -- occupation = physicist
  ?person wdt:P27  wd:Q213 .              -- citizenship = Czechia
  ?person wdt:P569 ?birth .
  ?person wdt:P18  ?image .                -- image
  BIND (YEAR(?birth) AS ?birthYear)
  FILTER (?birthYear >= 1900 && ?birthYear < 2000)
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en,cs" .
  }
}
ORDER BY ?birthYear
```

Toto je síla sémantického webu — *strukturovaná otázka*, kterou by v klasickém web vyhledávání nešla zodpovědět.

::: link "W3C — SPARQL 1.1 Query Language" "https://www.w3.org/TR/sparql11-query/"
:::

::: link "Wikidata Query Service" "https://query.wikidata.org/"
:::

::: link "DBpedia SPARQL endpoint" "https://dbpedia.org/sparql"
:::

---

*Zdroj: UPA přednáška *Sémantický web a ontologie* (Burget). Externí reference: Harris, S., Seaborne, A.: *SPARQL 1.1 Query Language*, W3C Recommendation 2013; DuCharme, B.: *Learning SPARQL*, 2nd ed., O'Reilly 2013; Wikidata documentation; DBpedia documentation.*
