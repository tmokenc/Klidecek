---
title: Sémantický web — koncepce a technologický stack
---

# Sémantický web — koncepce a technologický stack

**Sémantický web** (Berners-Lee, Hendler, Lassila, *Scientific American* 2001) je vize *webu dat* (Web of Data) — webu, kde jsou data nejen čitelná lidmi, ale i *strojově srozumitelná*. Klasický web je *Web of Documents* — HTML stránky určené k zobrazení v prohlížeči. Sémantický web doplňuje webové dokumenty o strukturovaná data se *sémantikou* (významem), kterou stroje mohou interpretovat a kombinovat napříč zdroji. I když původní vize nesplnila všechny ambice (univerzální AI agenti), technologie sémantického webu jsou dnes široce nasazené — Google používá schema.org pro rich snippets, knowledge graphs (Wikidata, DBpedia) obsahují miliardy faktů, RDF databáze (Stardog, AllegroGraph) jsou základem enterprise knowledge management.

## Web of Documents vs. Web of Data

* **World Wide Web (web)** — základní jednotkou je *dokument* (HTML stránka). Hypertextové odkazy spojují *dokumenty*. Stroj rozumí struktuře HTML, ale ne *významu* obsahu.
* **Sémantický web (Web of Data, Linked Data)** — základní jednotkou jsou *data* (jednotlivé entity a vztahy). Odkazy spojují *entity*. Stroj rozumí významu — co je *Brno*, kde leží, jak souvisí s *Českou republikou*.

::: svg "Web of Documents (hypertextové odkazy mezi stránkami) vs. Web of Data (RDF trojice mezi entitami)."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <text x="135" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">Web of Documents</text>
    <rect x="40" y="40" width="80" height="40" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="80" y="55" text-anchor="middle" fill="var(--text)" font-size="9">brno.cz</text>
    <text x="80" y="70" text-anchor="middle" fill="var(--text-muted)" font-size="9">HTML</text>
    <rect x="150" y="40" width="80" height="40" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="190" y="55" text-anchor="middle" fill="var(--text)" font-size="9">cr.cz</text>
    <text x="190" y="70" text-anchor="middle" fill="var(--text-muted)" font-size="9">HTML</text>
    <rect x="95" y="120" width="80" height="40" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="135" y="135" text-anchor="middle" fill="var(--text)" font-size="9">vut.cz</text>
    <text x="135" y="150" text-anchor="middle" fill="var(--text-muted)" font-size="9">HTML</text>
    <line x1="120" y1="60" x2="150" y2="60" stroke="var(--accent-line)"/>
    <line x1="80" y1="80" x2="120" y2="120" stroke="var(--accent-line)"/>
    <line x1="190" y1="80" x2="155" y2="120" stroke="var(--accent-line)"/>
    <text x="135" y="180" text-anchor="middle" fill="var(--text-muted)" font-size="9">stránky propojené odkazy</text>
    <text x="135" y="195" text-anchor="middle" fill="var(--text-muted)" font-size="9">stroj nezná význam</text>
  </g>
  <g>
    <text x="405" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">Web of Data (Linked Data)</text>
    <ellipse cx="320" cy="60" rx="40" ry="20" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
    <text x="320" y="58" text-anchor="middle" fill="var(--text)" font-size="9">:Brno</text>
    <text x="320" y="70" text-anchor="middle" fill="var(--text-muted)" font-size="9">type City</text>
    <ellipse cx="460" cy="60" rx="40" ry="20" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
    <text x="460" y="58" text-anchor="middle" fill="var(--text)" font-size="9">:Czechia</text>
    <text x="460" y="70" text-anchor="middle" fill="var(--text-muted)" font-size="9">type Country</text>
    <ellipse cx="390" cy="140" rx="40" ry="20" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
    <text x="390" y="138" text-anchor="middle" fill="var(--text)" font-size="9">:VUT_FIT</text>
    <text x="390" y="150" text-anchor="middle" fill="var(--text-muted)" font-size="9">type Univ.</text>
    <line x1="360" y1="60" x2="420" y2="60" stroke="var(--accent)" marker-end="url(#sw-arr)"/>
    <text x="390" y="52" text-anchor="middle" fill="var(--text-muted)" font-size="8">:locatedIn</text>
    <line x1="350" y1="80" x2="370" y2="120" stroke="var(--accent)" marker-end="url(#sw-arr)"/>
    <text x="335" y="105" fill="var(--text-muted)" font-size="8">:locatedIn</text>
    <text x="405" y="195" text-anchor="middle" fill="var(--text-muted)" font-size="9">entity propojené sémantickými vztahy</text>
  </g>
  <defs>
    <marker id="sw-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Tři pilíře sémantického webu

1. **Reprezentace znalostí** — jak strojově *zapsat* data se sémantikou. Klíčový formát: **RDF** (Resource Description Framework).
2. **Sdílená konceptualizace** — *model světa*, který je sdílený mezi systémy. Realizace: **ontologie** (RDFS, OWL).
3. **Agenti** — producenti a konzumenti dat. Aplikace, které čtou data se sémantikou a integrují je z různých zdrojů.

## Semantic Web Stack (Layer Cake)

W3C zobrazuje sémantický web jako vrstvovou architekturu:

::: svg "Semantic Web Stack: postupně se nabaluje od identifikátorů (URI) a kódování (Unicode), přes syntax (XML), data interchange (RDF), taxonomie (RDFS), ontologie (OWL), pravidla (RIF/SWRL), unifying logic, proof, trust — vlevo querying (SPARQL), vpravo kryptografie."
<svg viewBox="0 0 540 280" font-family="ui-sans-serif, system-ui" font-size="10">
  <g>
    <rect x="20" y="240" width="240" height="30" fill="#f3b" stroke="var(--line)" opacity="0.6"/>
    <text x="140" y="259" text-anchor="middle" fill="var(--text)" font-weight="600">Identifiers: URI</text>
    <rect x="260" y="240" width="220" height="30" fill="#f3b" stroke="var(--line)" opacity="0.6"/>
    <text x="370" y="259" text-anchor="middle" fill="var(--text)" font-weight="600">Character Set: UNICODE</text>
    <rect x="20" y="210" width="460" height="30" fill="#ea3" stroke="var(--line)" opacity="0.6"/>
    <text x="250" y="229" text-anchor="middle" fill="var(--text)" font-weight="600">Syntax: XML</text>
    <rect x="20" y="180" width="460" height="30" fill="#ccc" stroke="var(--line)" opacity="0.7"/>
    <text x="250" y="199" text-anchor="middle" fill="var(--text)" font-weight="600">Data interchange: RDF</text>
    <rect x="20" y="150" width="120" height="60" fill="#fe6" stroke="var(--line)" opacity="0.7"/>
    <text x="80" y="170" text-anchor="middle" fill="var(--text)" font-weight="600">Querying:</text>
    <text x="80" y="186" text-anchor="middle" fill="var(--accent)" font-weight="700">SPARQL</text>
    <rect x="140" y="150" width="170" height="30" fill="#ccc" stroke="var(--line)" opacity="0.7"/>
    <text x="225" y="169" text-anchor="middle" fill="var(--text)" font-weight="600">Taxonomies: RDFS</text>
    <rect x="140" y="120" width="170" height="30" fill="#ccc" stroke="var(--line)" opacity="0.7"/>
    <text x="225" y="139" text-anchor="middle" fill="var(--text)" font-weight="600">Ontologies: OWL</text>
    <rect x="310" y="120" width="170" height="30" fill="#ccc" stroke="var(--line)" opacity="0.7"/>
    <text x="395" y="139" text-anchor="middle" fill="var(--text)" font-weight="600">Rules: RIF/SWRL</text>
    <rect x="80" y="90" width="320" height="30" fill="#bd5" stroke="var(--line)" opacity="0.7"/>
    <text x="240" y="109" text-anchor="middle" fill="var(--text)" font-weight="600">Unifying Logic</text>
    <rect x="100" y="60" width="280" height="30" fill="#bd5" stroke="var(--line)" opacity="0.7"/>
    <text x="240" y="79" text-anchor="middle" fill="var(--text)" font-weight="600">Proof</text>
    <rect x="120" y="30" width="240" height="30" fill="#bd5" stroke="var(--line)" opacity="0.7"/>
    <text x="240" y="49" text-anchor="middle" fill="var(--text)" font-weight="600">Trust</text>
    <rect x="20" y="20" width="460" height="10" fill="none" stroke="var(--line)"/>
    <text x="250" y="13" text-anchor="middle" fill="var(--text-muted)">User interface and applications</text>
    <rect x="480" y="30" width="40" height="180" fill="#ea3" stroke="var(--line)" opacity="0.6"/>
    <text x="500" y="125" text-anchor="middle" fill="var(--text)" font-weight="600" transform="rotate(-90,500,125)">Cryptography</text>
  </g>
</svg>
:::

* **URI** + **Unicode** — základní identifikace zdrojů, znaková sada.
* **XML** (volitelné) — syntax pro serializaci. Dnes alternativy Turtle, JSON-LD.
* **RDF** — datový model — trojice subjekt-predikát-objekt.
* **RDFS** (RDF Schema) — taxonomie, třídy a vlastnosti.
* **OWL** (Web Ontology Language) — bohaté ontologie s logickým odvozováním.
* **SPARQL** — dotazovací jazyk nad RDF.
* **RIF/SWRL** — pravidla (rule interchange format, semantic web rule language).
* **Logic, Proof, Trust** — vrstvy logického odvozování a důvěryhodnosti (méně rozvinuté v praxi).
* **Cryptography** — pro autentizaci a digitální podpisy (Linked Data Signatures).

## Cíle a problémy

### Cíle

* **Reprezentace strukturovaných dat se sémantikou** — strojově srozumitelný popis.
* **Sdílení napříč aplikacemi** — interoperabilita bez ad-hoc API.
* **Integrace dat z heterogenních zdrojů** — DB, web stránky, IoT senzory mají *jednotný* model.

### Problémy běžné reprezentace

V relační DB nebo XML/JSON je *význam* sloupců/polí definován v *kódu aplikace*, ne v datech samotných. Aplikace A může mít `<velikost>2+1</velikost>` (počet pokojů bytu), aplikace B `<velikost>55m2</velikost>` (rozloha). Pokud agent načte data z obou, *nepochopí*, že jsou ve stejném sloupci, ale jiné jednotky.

Data jsou *strojově čitelná* (parser je zvládne), ale *nestrojově srozumitelná* (význam mu uniká).

### Řešení — separace dat a sémantiky

Sémantický web řeší problém:

* **URI namespace** — předchází kolizím v názvech (`<dbpedia:Brno>` vs. `<wikidata:Brno>`).
* **Externí slovník** — XML namespace, ale dosažitelný (lze stáhnout a interpretovat).
* **Formální sémantika** — *byt* je věc s atributy *umístění*, *velikost*, *cena*; *velikost* má jednotku `m²` nebo `dispozice`.

Realizace: **ontologie** — formální popis konceptů domény a vztahů mezi nimi.

## Aplikace sémantického webu dnes

I když původní vize neuspěla na všech frontách (univerzální AI agenti), praktické aplikace existují všude:

* **Google Knowledge Graph** — miliardy entit s vztahy, používá schema.org markup pro rich snippets.
* **Wikidata** — strukturovaná databáze faktů editovatelná komunitou, exportuje RDF.
* **DBpedia** — extrakce strukturovaných dat z Wikipedie do RDF.
* **schema.org** — slovník pro markup webových stránek (produkty, události, recepty). Microformats, RDFa, JSON-LD na milionech webů.
* **FOAF** (Friend of a Friend) — historický slovník pro popis osob a vztahů.
* **Open Data portály** — vlády publikují data v RDF (data.gov, data.europa.eu).
* **Enterprise knowledge graphs** — vnitřní KG firem (Bloomberg, Thomson Reuters).

Více o detailech RDF v [[rdf]] a ontologiích v [[ontologie-owl]]; o dotazování v [[sparql]].

## Web 3.0 a budoucnost

Termín "Web 3.0" se používá pro:

* **Sémantický web** (původní význam Berners-Leeho).
* **Blockchain web** (kryptoměny, DAO, NFT) — nesouvisí s původní vizí.

Termín je dnes obtížně definovatelný. Sémantický web jako technologie pokračuje (Linked Open Data movement, Knowledge Graphs), ale není to "next big thing". Místo toho se sémantika *vkomponovává* do moderních architektur (Wikidata jako training data pro LLM, knowledge graphs v doporučovacích systémech).

::: link "Berners-Lee, T., Hendler, J., Lassila, O.: The Semantic Web (Scientific American 2001)" "https://www.scientificamerican.com/article/the-semantic-web/"
:::

::: link "W3C — Semantic Web at W3C" "https://www.w3.org/standards/semanticweb/"
:::

::: link "Linked Open Data cloud" "https://lod-cloud.net/"
:::

---

*Zdroj: UPA přednáška *Sémantický web a ontologie* (Burget). Externí reference: Berners-Lee, T., Hendler, J., Lassila, O.: *The Semantic Web*, Scientific American 284(5), 2001; Hitzler, P., Krötzsch, M., Rudolph, S.: *Foundations of Semantic Web Technologies*, CRC Press 2009; Allemang, D., Hendler, J.: *Semantic Web for the Working Ontologist*, 3rd ed., Morgan Kaufmann 2020.*
