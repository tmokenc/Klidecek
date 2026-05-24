---
title: RDF — datový model sémantického webu
---

# RDF — datový model sémantického webu

**RDF** (Resource Description Framework, W3C 2004, aktualizováno 2014) je *datový model* pro reprezentaci faktů na sémantickém webu ([[semanticky-web]]). Jeho klíčová myšlenka: každý *fakt* je vyjádřen jako **trojice (triple) subjekt-predikát-objekt** — analogie k větě v přirozeném jazyce. Trojice se skládají do *orientovaného grafu*, kde uzly jsou *zdroje* (resources), hrany jsou *predikáty* (vlastnosti). Tato jednoduchá, ale výkonná struktura umožňuje skládat libovolně složité znalostní báze a *integrovat* data z různých zdrojů přes sdílené URI.

## Trojice — atomická jednotka

**RDF trojice** = `(subjekt, predikát, objekt)`.

* **Subjekt** — *o čem* mluvíme. Vždy URI (nebo *blank node*, anonymní zdroj).
* **Predikát** — *jaký vztah* nebo *vlastnost*. Vždy URI.
* **Objekt** — *co* je vztah/vlastnost. URI, blank node, nebo *literál* (string, integer, date, …).

Příklady přirozenou řečí:

* "Autorem dokumentu X je pan Y." → `(<dokument-X>, <je-autorem>, <pan-Y>)`
* "Brno se nachází v České republice." → `(<Brno>, <leží-v>, <Česká-republika>)`
* "Anna má věk 31." → `(<Anna>, <vek>, 31)` — objekt je literál integer.

Tato struktura odpovídá *jednoduché větě subjekt-predikát-objekt* v lingvistice — odtud název "trojice" a snadná lidská čitelnost RDF dat.

::: svg "RDF trojice jako hrana v grafu: subjekt → predikát → objekt. Objekt může být URI (jiný zdroj) nebo literál (atomický typ)."
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <ellipse cx="100" cy="60" rx="70" ry="25" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="100" y="58" text-anchor="middle" fill="var(--text)" font-size="10">http://example/dokument-X</text>
    <text x="100" y="72" text-anchor="middle" fill="var(--text-muted)" font-size="8.5">SUBJEKT (URI)</text>
    <ellipse cx="400" cy="60" rx="70" ry="25" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="400" y="58" text-anchor="middle" fill="var(--text)" font-size="10">http://novak.cz/jan</text>
    <text x="400" y="72" text-anchor="middle" fill="var(--text-muted)" font-size="8.5">OBJEKT (URI)</text>
    <line x1="170" y1="60" x2="330" y2="60" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#rdf-arr)"/>
    <text x="250" y="52" text-anchor="middle" fill="var(--text-muted)" font-size="10">http://schema.org/author</text>
    <text x="250" y="78" text-anchor="middle" fill="var(--text-muted)" font-size="8.5">PREDIKÁT (URI)</text>
  </g>
  <g>
    <ellipse cx="100" cy="130" rx="70" ry="20" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="100" y="135" text-anchor="middle" fill="var(--text)" font-size="10">http://example/anna</text>
    <rect x="335" y="115" width="120" height="30" fill="var(--bg-inset)" stroke="var(--accent-line)" stroke-width="1.5"/>
    <text x="395" y="128" text-anchor="middle" fill="var(--text)" font-size="10">31</text>
    <text x="395" y="142" text-anchor="middle" fill="var(--text-muted)" font-size="8.5">LITERÁL (integer)</text>
    <line x1="170" y1="130" x2="335" y2="130" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#rdf-arr)"/>
    <text x="252" y="125" text-anchor="middle" fill="var(--text-muted)" font-size="10">foaf:age</text>
  </g>
  <defs>
    <marker id="rdf-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## RDF graf

Více trojic se skládá do **orientovaného ohodnoceného grafu**:

```
<dokument-X> <author>      <jan-novak> .
<dokument-X> <publishedIn> "2023-05-12" .
<jan-novak>  <name>        "Jan Novák" .
<jan-novak>  <nationality> "Czech" .
<jan-novak>  <livesIn>     <Brno> .
<Brno>       <country>     <Czechia> .
```

Graf:

```
<dokument-X> --author-->     <jan-novak>
            \--publishedIn-> "2023-05-12"
<jan-novak>  --name------>   "Jan Novák"
            --nationality--> "Czech"
            --livesIn---->   <Brno>
<Brno>      --country---->   <Czechia>
```

Grafová struktura umožňuje:

* **Skládání** — trojice z různých zdrojů lze *kombinovat* (pokud sdílejí URI).
* **Traversal** — průchod od libovolného uzlu po hranách (SPARQL graph patterns).
* **Inference** — odvozování implicitních faktů (transitivní vlastnosti, dědičnost tříd).

## URI — globální identifikace

Klíčem k *interoperabilitě* RDF dat napříč zdroji je použití **URI** (Uniform Resource Identifier) místo lokálních ID. URI je globálně jedinečný řetězec (typicky URL formát):

* `<http://dbpedia.org/resource/Brno>` — Brno v DBpedii.
* `<http://www.wikidata.org/entity/Q14960>` — Brno ve Wikidatě.
* `<http://schema.org/Person>` — třída "Person" v schema.org.
* `<http://xmlns.com/foaf/0.1/name>` — vlastnost "name" v FOAF ontologii.

Tytéž entity v různých datasetech mohou mít *různá URI*, ale lze je propojit přes `owl:sameAs`:

```
<dbpedia:Brno>  owl:sameAs  <wikidata:Q14960> .
```

::: viz rdf-graph-browser "Klikněte uzel pro fokus — okolní hrany se zvýrazní, ostatní zešednou. Přepněte mezi prefixovaným tvarem a expandovanými URI."
:::

## Prefixy — kratší zápis URI

URI jsou dlouhé — proto se zavádí **prefixy** (PREFIX deklarace):

```
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix ex:   <http://example.com/> .

ex:jan_novak  foaf:name        "Jan Novák" .
ex:jan_novak  foaf:age         31 .
ex:jan_novak  foaf:knows       ex:anna .
```

`foaf:name` se expanduje na `http://xmlns.com/foaf/0.1/name`. Klasické prefixy:

* `rdf:` — `http://www.w3.org/1999/02/22-rdf-syntax-ns#`
* `rdfs:` — `http://www.w3.org/2000/01/rdf-schema#`
* `owl:` — `http://www.w3.org/2002/07/owl#`
* `xsd:` — `http://www.w3.org/2001/XMLSchema#`
* `foaf:` — `http://xmlns.com/foaf/0.1/`
* `dc:` — `http://purl.org/dc/elements/1.1/` (Dublin Core)
* `schema:` — `http://schema.org/`
* `wd:` — `http://www.wikidata.org/entity/`

## Typové vestavěné predikáty

RDF má pár vestavěných predikátů:

* `rdf:type` — *typuje* zdroj (přiřazuje třídu). Zkratka v Turtle: `a`.
  `ex:anna a foaf:Person .` znamená "Anna je instance třídy Person".
* `rdfs:label` — lidsky čitelné jméno.
* `rdfs:comment` — popis.
* `rdfs:subClassOf` — dědičnost tříd.
* `rdfs:subPropertyOf` — dědičnost vlastností.
* `owl:sameAs` — identifikace dvou URI jako téže entity.
* `owl:differentFrom` — opak `sameAs`.

## Literály — atomické hodnoty

Objekt může být *literál* — string, číslo, datum:

```
ex:anna foaf:age 31 .                          -- typed literal (xsd:integer)
ex:anna foaf:age "31"^^xsd:integer .           -- explicitní typ
ex:anna foaf:name "Anna" .                     -- string
ex:anna foaf:name "Anna"@en .                  -- string s jazykem (English)
ex:anna foaf:name "Anna"@cs .                  -- jiná lokalizace
ex:anna ex:birthDate "1993-04-12"^^xsd:date .  -- date
```

Datové typy jsou XSD: `xsd:string`, `xsd:integer`, `xsd:decimal`, `xsd:boolean`, `xsd:date`, `xsd:dateTime`.

## Blank nodes — anonymní zdroje

Někdy potřebujeme říct "existuje něco, co má vlastnosti X a Y", aniž bychom tomu dali URI. Použijeme **blank node**:

```
ex:anna ex:livesAt _:b1 .
_:b1   ex:street   "Botanická 12" .
_:b1   ex:city     "Brno" .
```

`_:b1` je blank node — lokální identifikátor, mimo dataset bez významu.

## Reifikace — trojice o trojicích

Co když chceme říci *něco o trojici* (kdo ji autorizoval, kdy byla pozorována)? Tradiční trojice toho nejsou schopny. Řešení:

* **Reifikace** (RDF 1.0) — udělat trojici subjektem nové trojice přes `rdf:subject`, `rdf:predicate`, `rdf:object`. Otravné.
* **Named graphs** (RDF 1.1) — celý subgraf má jméno (URI). Atributy o subgrafu jsou trojice s tímto jménem jako subjektem.
* **RDF-star (RDF*)** — moderní rozšíření (W3C 2023) s nativní podporou trojic uvnitř trojic.

## Serializace — jak RDF zapsat

RDF model je *abstraktní* — fyzická serializace má více formátů ([[rdf-serializace]]):

* **Turtle (.ttl)** — *de facto* standard, lidsky čitelný (ukázky výše).
* **N-Triples (.nt)** — extrémně jednoduchý, jedna trojice na řádek.
* **RDF/XML (.rdf)** — původní serializace, dnes méně oblíbený (verbose).
* **JSON-LD (.jsonld)** — JSON s sémantickým markupem.
* **N3 (Notation3)** — rozšíření Turtle s pravidly (méně používaný).
* **TriG** — rozšíření Turtle pro named graphs.

## RDF databáze (triple stores)

Specializovaná úložiště pro RDF data:

* **Apache Jena** + **TDB / Fuseki** — open source, populární v akademii.
* **GraphDB** (Ontotext) — komerční, enterprise.
* **Stardog** — komerční, vyzrálý KG platform.
* **AllegroGraph** — komerční, OWL inference.
* **Virtuoso** — multi-model (RDF + relační + objektový).
* **Blazegraph** — open source, byl použit pro Wikidata.

Tyto DB ukládají miliardy trojic, indexují je (typicky 3–6 permutací) pro rychlé SPARQL dotazy.

## RDF v praxi

Použití RDF dnes:

* **Knowledge graphs** — Wikidata, DBpedia, YAGO obsahují miliardy trojic.
* **Schema.org markup** — webové stránky vkládají JSON-LD pro Google a vyhledávače (rich snippets).
* **Open Government Data** — gov.uk, data.europa.eu publikují vládní data v RDF.
* **Vědecké publikace** — bibliografické databáze (CrossRef, ORCID), proteomické DB (UniProt).
* **Personal data** — Solid (Tim Berners-Lee's project) ukládá osobní data v RDF.

Více o ontologiích a OWL viz [[ontologie-owl]]; o dotazování viz [[sparql]].

::: link "W3C — RDF 1.1 Primer" "https://www.w3.org/TR/rdf11-primer/"
:::

::: link "W3C — RDF 1.1 Concepts and Abstract Syntax" "https://www.w3.org/TR/rdf11-concepts/"
:::

::: link "Linked Data — Tim Berners-Lee's design notes" "https://www.w3.org/DesignIssues/LinkedData.html"
:::

---

*Zdroj: UPA přednáška *Sémantický web a ontologie* (Burget). Externí reference: Klyne, G., Carroll, J. J., McBride, B.: *RDF 1.1 Concepts and Abstract Syntax*, W3C Recommendation 2014; Hitzler, P. et al.: *Foundations of Semantic Web Technologies*, CRC Press 2009; Wood, D., Zaidman, M., Ruth, L.: *Linked Data — Structured Data on the Web*, Manning 2014.*
