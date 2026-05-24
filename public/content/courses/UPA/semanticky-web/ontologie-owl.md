---
title: Ontologie — RDFS, OWL, schema.org
---

# Ontologie — RDFS, OWL, schema.org

**Ontologie** v sémantickém webu je *formální popis konceptů, vztahů a omezení* nějaké domény. Rozšiřuje RDF model ([[rdf]]) o *taxonomii* (hierarchii tříd) a *axiomy* (logická pravidla). RDF samo nedefinuje, co je *třída*, *vlastnost*, nebo jaké jsou jejich vztahy — ontologické jazyky **RDFS** (RDF Schema) a **OWL** (Web Ontology Language) to doplňují. Praktický slovník **schema.org** je dnes nejrozšířenější ontologie — používají ho miliony webů pro SEO markup a Google ho čte pro rich snippets.

## RDFS — RDF Schema

**RDFS** (W3C 2014) je *minimalistická* ontologická vrstva nad RDF. Definuje pár vestavěných tříd a predikátů.

### Třídy a instance

```turtle
@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ex:   <http://example.com/> .

ex:Person     a rdfs:Class .
ex:Employee   a rdfs:Class ;
              rdfs:subClassOf ex:Person .
ex:Manager    a rdfs:Class ;
              rdfs:subClassOf ex:Employee .

ex:anna  a ex:Manager .          -- Anna je Manager
ex:bob   a ex:Employee .         -- Bob je Employee
ex:carol a ex:Person .           -- Carol je Person
```

Z RDFS sémantiky odvodíme:
* `ex:anna a ex:Employee` (Manager → Employee)
* `ex:anna a ex:Person` (Manager → Employee → Person)

Toto je **transitive subclass inference** — implicitní fakty, které lze z explicitních vyvodit.

### Vlastnosti — domain a range

RDFS umožňuje *typovat* predikáty:

```turtle
ex:salary  a rdf:Property ;
           rdfs:domain ex:Employee ;       -- subjekt musí být Employee
           rdfs:range xsd:decimal .         -- objekt musí být xsd:decimal

ex:reports a rdf:Property ;
           rdfs:domain ex:Employee ;
           rdfs:range  ex:Manager ;
           rdfs:subPropertyOf ex:knows .   -- reports je speciální případ knows
```

Použití predikátu *implikuje typ* subjektu a objektu — pokud `ex:carol ex:salary 50000`, pak Carol je implicitně Employee (jinak je toto fakt nekonzistentní).

### Co RDFS *nedefinuje*

RDFS je úmyslně minimalistický. Neumí:
* **Disjointnost tříd** — že žádná entita nemůže být současně Employee a Customer.
* **Kardinalita** — že každý Employee má právě 1 vedoucího.
* **Funkční vlastnosti** — že `ex:hasSSN` je unikátní (žádné dvě osoby nemají stejné SSN).
* **Inverzní vlastnosti** — že `ex:hasParent` a `ex:hasChild` jsou opačné.

Pro tyto pokročilé konstrukty existuje **OWL**.

## OWL — Web Ontology Language

**OWL** (W3C 2004, OWL 2 z 2012) je *expresivní* ontologický jazyk založený na **deskripční logice** (DL). Definuje bohatou škálu konstruktů pro modelování:

* **Class expressions** — pojmenované třídy + operátory `intersectionOf`, `unionOf`, `complementOf`.
* **Property characteristics** — `FunctionalProperty`, `InverseFunctionalProperty`, `TransitiveProperty`, `SymmetricProperty`, `AsymmetricProperty`, `ReflexiveProperty`, `IrreflexiveProperty`.
* **Cardinality restrictions** — `minCardinality`, `maxCardinality`, `exactCardinality`.
* **Value restrictions** — `someValuesFrom`, `allValuesFrom`, `hasValue`.
* **Disjointness** — `disjointWith`, `disjointUnionOf`.
* **Equivalence** — `equivalentClass`, `equivalentProperty`, `sameAs`.

### Příklad — bohatá ontologie

```turtle
@prefix owl: <http://www.w3.org/2002/07/owl#> .

ex:Person    a owl:Class .
ex:Employee  a owl:Class ;
             rdfs:subClassOf ex:Person ;
             owl:disjointWith ex:Customer .

ex:hasManager a owl:ObjectProperty ;
              rdfs:domain ex:Employee ;
              rdfs:range  ex:Manager ;
              owl:inverseOf ex:manages .

ex:hasSalary  a owl:DatatypeProperty ;
              rdfs:domain ex:Employee ;
              rdfs:range  xsd:decimal ;
              a owl:FunctionalProperty .          -- každý Employee má jen 1 plat

[ a owl:Restriction ;                              -- anonymní omezení
  owl:onProperty ex:hasManager ;
  owl:cardinality "1"^^xsd:nonNegativeInteger ;
  rdfs:subClassOf ex:Employee ] .                  -- každý Employee má právě 1 vedoucího
```

### Profily OWL

OWL 2 má tři **profily** pro vyvážení expresivity a výpočetní složitosti:

* **OWL 2 EL** (Existential Logic) — polynomiální dotazování, vhodný pro velké taxonomie (SNOMED CT v medicíně).
* **OWL 2 QL** (Query Language) — efektivní dotazování přes SPARQL, mapování na relační DB.
* **OWL 2 RL** (Rule Language) — implementovatelný přes pravidlové enginy (Datalog).
* **OWL 2 DL** — plné OWL, *decidable* ale exponentiální.
* **OWL Full** — bez omezení, *undecidable* — málo používaný.

::: viz rdfs-inference "Přepněte typy (Manager, Employee, Customer, Person) — derivované fakty (subClassOf transitivity + domain/range + owl:TransitiveProperty) se přepočtou."
:::

## Slovníky / ontologie v praxi

### Schema.org

**Schema.org** (zal. 2011 Google + Bing + Yahoo + Yandex) je *kolaborativní* slovník pro webové entity. Pokrývá:

* **Things** — `Person`, `Organization`, `Place`, `Event`.
* **Creative works** — `Article`, `Recipe`, `Movie`, `Book`, `Course`.
* **Products** — `Product`, `Offer`, `AggregateRating`.
* **Local business** — `Restaurant`, `Store`, `MedicalClinic`.

Embedding v HTML (JSON-LD):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Anna Nováková",
  "jobTitle": "Software Engineer",
  "worksFor": {
    "@type": "Organization",
    "name": "Acme Inc."
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Botanická 12",
    "addressLocality": "Brno",
    "postalCode": "60200",
    "addressCountry": "CZ"
  }
}
</script>
```

Google tento markup čte a může zobrazit *rich snippet* (Knowledge Panel) pro Annu. Pokrytí: 10+ milionů domén, miliarda stránek.

### FOAF — Friend of a Friend

Klasický slovník (zal. 2000) pro popis osob a sociálních vztahů.

```turtle
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:anna a foaf:Person ;
        foaf:name "Anna Nováková" ;
        foaf:nick "annie" ;
        foaf:mbox <mailto:anna@example.com> ;
        foaf:homepage <http://anna.example.com> ;
        foaf:knows ex:bob, ex:carol .
```

FOAF byl populární v early Web 2.0 (decentralized social networks); dnes méně. Schema.org `Person` převzal většinu use cases.

### Dublin Core

Standard pro bibliografická metadata. 15 základních elementů: `dc:title`, `dc:creator`, `dc:subject`, `dc:description`, `dc:publisher`, `dc:contributor`, `dc:date`, `dc:type`, `dc:format`, `dc:identifier`, `dc:source`, `dc:language`, `dc:relation`, `dc:coverage`, `dc:rights`.

### SKOS — Simple Knowledge Organization System

Pro **thesauri**, taxonomie, classification schemes:

```turtle
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .

ex:animals  a skos:Concept ;
            skos:prefLabel "Animals"@en ;
            skos:prefLabel "Zvířata"@cs .

ex:mammals  a skos:Concept ;
            skos:broader ex:animals ;
            skos:prefLabel "Mammals"@en ;
            skos:prefLabel "Savci"@cs .
```

Použití: knihovní klasifikace (LCSH, MeSH), thesauri OECD, EuroVoc.

### Velké ontologie

* **SNOMED CT** — medicínská terminologie, ~ 350 000 konceptů.
* **MeSH** — medicínský thesaurus, ~ 30 000 termínů.
* **WordNet** — lexikální databáze angličtiny, 117 000 synsetů.
* **Cyc** — common-sense knowledge base, ~ 700 000 konceptů.
* **DBpedia** ontology — automaticky extrahovaná z Wikipedie.

## Inference — odvozování implicitních faktů

Klíčová síla ontologie — *inferenční engine* odvodí *implicitní* fakty z explicitních.

Příklad RDFS inference:

```
Explicitní fakty:                Odvozené (inferred) fakty:
ex:anna a ex:Manager           ex:anna a ex:Employee
ex:Manager rdfs:subClassOf ex:Employee  ex:anna a ex:Person
ex:Employee rdfs:subClassOf ex:Person
```

Příklad OWL inference (transitivita):

```
Explicitní:                      Odvozené:
ex:hasAncestor a owl:TransitiveProperty .
ex:anna ex:hasAncestor ex:beata .
ex:beata ex:hasAncestor ex:cecilie .
                                 ex:anna ex:hasAncestor ex:cecilie .
```

Inferenční enginy:
* **Pellet** — OWL DL reasoner.
* **HermiT** — moderní OWL 2 reasoner.
* **FaCT++** — open source.
* **Protégé** — ontology editor s vestavěným reasonerem.

## Použití ontologie

* **Sémantická konzistence** — automaticky detekovat nesoulady (osoba je současně i firma).
* **Integrace dat** — sjednotit data z různých zdrojů přes sdílenou ontologii.
* **Dotazování** — SPARQL dotazy bere v úvahu inferenci ([[sparql]]).
* **Knowledge base** — Wikidata, Google Knowledge Graph používají ontologii pro modelování faktů.
* **Klasifikace** — automatická klasifikace dokumentů, produktů, ...

## Editory ontologií

* **Protégé** (Stanford) — flagship open source editor pro OWL.
* **TopBraid Composer** — komerční, integrace s GraphDB.
* **OntoText GraphDB Workbench** — editor + reasoner.
* **WebVOWL** — vizualizace ontologií.

## Praktická doporučení

* **Reusovat existující slovníky** — schema.org, FOAF, Dublin Core, SKOS. Nevynalézejte vlastní URI.
* **Minimalistická ontologie** — RDFS často stačí; OWL pro komplexní domény.
* **Postupné modelování** — začněte s pár třídami a vlastnostmi, rozšiřujte podle potřeby.
* **Reasoner v testech** — automaticky kontrolujte konzistenci po každé změně.

::: link "W3C — OWL 2 Web Ontology Language Primer" "https://www.w3.org/TR/owl2-primer/"
:::

::: link "Schema.org documentation" "https://schema.org/docs/full.html"
:::

::: link "Linked Open Vocabularies (LOV)" "https://lov.linkeddata.es/"
:::

---

*Zdroj: UPA přednáška *Sémantický web a ontologie* (Burget). Externí reference: W3C OWL Working Group: *OWL 2 Web Ontology Language Primer*, 2nd ed., 2012; Allemang, D., Hendler, J.: *Semantic Web for the Working Ontologist*, 3rd ed., Morgan Kaufmann 2020; Hitzler, P., Krötzsch, M., Rudolph, S.: *Foundations of Semantic Web Technologies*, CRC Press 2009; schema.org.*
