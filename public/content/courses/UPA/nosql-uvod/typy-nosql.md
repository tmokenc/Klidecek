---
title: Typy NoSQL databází
---

# Typy NoSQL databází

NoSQL není jeden typ databáze — je to *kategorie* úložišť bez relačního modelu. Podle způsobu organizace dat dělíme NoSQL na čtyři hlavní typy: **klíč-hodnota**, **dokumentové**, **sloupcové** (wide-column) a **grafové**. Každý typ je optimalizován pro jiný přístupový vzor a má svoje typické nasazení. Pochopení rozdílů je klíčové pro správný výběr — použít MongoDB pro vysoce propojený graf je stejně neoptimální jako použít Neo4j pro time-series telemetrii.

## Klíč-hodnota (key-value)

Nejjednodušší model. Jeden klíč mapuje na jednu hodnotu (BLOB — libovolná data, DB nezná strukturu).

* **Klíč** — jednoduchý nebo složený řetězec/číslo (např. `user:42:profile`). Často součástí klíče je *prefix* pro logické skupinování.
* **Hodnota** — libovolný binární obsah (string, JSON, image, serializovaný objekt). DB s hodnotou nepracuje, jen ji ukládá a vrací.
* **Operace** — `GET`, `PUT`, `DELETE` podle klíče. Žádné dotazy podle hodnoty.
* **Přístup** — *brutálně rychlý* (hash table O(1), v paměti).

::: svg "Klíč-hodnota: jeden klíč → jedna neprůhledná hodnota (BLOB). DB strukturu hodnoty nezná, vrací ji celou."
<svg viewBox="0 0 540 170" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <text x="100" y="30" text-anchor="middle" fill="var(--text)" font-weight="600">Klíč</text>
    <text x="320" y="30" text-anchor="middle" fill="var(--text)" font-weight="600">Hodnota (BLOB)</text>
    <g font-family="ui-monospace, monospace" font-size="10">
      <rect x="40" y="50" width="120" height="22" fill="var(--bg-card)" stroke="var(--accent-line)"/>
      <text x="50" y="65" fill="var(--text)">user:42:profile</text>
      <line x1="160" y1="61" x2="200" y2="61" stroke="var(--accent)" marker-end="url(#kvarr)"/>
      <rect x="200" y="50" width="240" height="22" fill="var(--bg-card)" stroke="var(--line)"/>
      <text x="210" y="65" fill="var(--text-muted)">&#123;"name":"Anna","age":31&#125;</text>
      <rect x="40" y="80" width="120" height="22" fill="var(--bg-card)" stroke="var(--accent-line)"/>
      <text x="50" y="95" fill="var(--text)">cart:42</text>
      <line x1="160" y1="91" x2="200" y2="91" stroke="var(--accent)" marker-end="url(#kvarr)"/>
      <rect x="200" y="80" width="240" height="22" fill="var(--bg-card)" stroke="var(--line)"/>
      <text x="210" y="95" fill="var(--text-muted)">[item-12, item-77, ...]</text>
      <rect x="40" y="110" width="120" height="22" fill="var(--bg-card)" stroke="var(--accent-line)"/>
      <text x="50" y="125" fill="var(--text)">session:abc123</text>
      <line x1="160" y1="121" x2="200" y2="121" stroke="var(--accent)" marker-end="url(#kvarr)"/>
      <rect x="200" y="110" width="240" height="22" fill="var(--bg-card)" stroke="var(--line)"/>
      <text x="210" y="125" fill="var(--text-muted)">&lt;binary blob 4096B&gt;</text>
    </g>
  </g>
  <defs>
    <marker id="kvarr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

**Příklady**: Redis (in-memory + persistence), Amazon DynamoDB (lze i jako document), Riak, Memcached, Oracle NoSQL, etcd, Voldemort.

**Použití**: cache, session storage, lookup tabulky (configurace), počítadla, leaderboardy (Redis sorted sets), distribuované zámky.

**Nevhodné**: dotazy podle částí hodnoty (DB hodnotu nezná), složité vztahy.

## Dokumentové databáze

Hodnotou je *strukturovaný dokument* — typicky JSON/BSON, XML nebo BSON. DB rozumí *vnitřku* dokumentu a může dotazovat jeho polí, indexovat je, agregovat.

* **Dokument** — JSON-like struktura s vnořenými poli, kolekcemi, referencemi. Bez pevného schématu (různé dokumenty v kolekci mohou mít různá pole).
* **Kolekce** — logické seskupení podobných dokumentů (analogie tabulky v RDBMS).
* **Operace** — CRUD + dotazy podle polí (`{"vek": {"$gt": 18}}`), agregační pipeline, full-text index.
* **Identifikátor** — `_id` (typicky ObjectId v MongoDB nebo UUID v CouchDB).

```json
// Kolekce 'osoby' v MongoDB
{
  "_id": ObjectId("..."),
  "jmeno": "Anna",
  "vek": 31,
  "adresa": { "ulice": "Botanická 12", "mesto": "Brno", "psc": "60200" },
  "tagy": ["frontend", "react"],
  "komentare": [
    { "datum": "2025-03-01", "text": "perfektní vývojářka" },
    { "datum": "2025-03-15", "text": "..." }
  ]
}
```

Schéma je *flexibilní* — některé dokumenty mohou mít pole, která jiné nemají. Mezi dokumenty lze odkazovat (`$lookup` v MongoDB), ale efektivnější je vnoření.

**Příklady**: MongoDB, CouchDB, Couchbase, ArangoDB, RethinkDB, MarkLogic, Elasticsearch (full-text).

**Použití**: webové aplikace s polostrukturovanými daty (e-shopy, blogy, CMS), katalog produktů, mobilní backend, log storage, full-text search.

**Nevhodné**: silně normalizovaná data s mnoha JOIN; multi-document transakce (omezené).

## Sloupcové (wide-column) databáze

Inspirovány Google BigTable. Data jsou organizována do *řádků* (jako v RDBMS), ale každý řádek může mít *jiné sloupce*. Sloupce jsou seskupené do *family* (skupin), které jsou ukládány společně.

* **Řádek** — identifikován *row key* (PK). Obsahuje 1..N sloupců.
* **Sloupec** — má jméno (dynamické, libovolné) a hodnotu. Pro daný řádek mohou existovat tisíce sloupců.
* **Column family** — skupina sloupců s podobným přístupovým vzorem (ukládána na stejném disku/uzlu).
* **Supercolumn / nested** — kolekce sloupců uvnitř sloupce (Cassandra raně, dnes zřídka).

::: svg "Wide-column store: každý řádek má vlastní sloupce, sloupce ve stejné family se ukládají společně. Řídká, mnohorozměrná struktura."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="10.5">
  <g>
    <text x="60" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">Row key</text>
    <text x="225" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">CF: profile</text>
    <text x="395" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">CF: stats</text>
  </g>
  <g>
    <rect x="20" y="40" width="80" height="40" fill="var(--bg-card)" stroke="var(--accent-line)"/>
    <text x="60" y="64" text-anchor="middle" fill="var(--text)">user:42</text>
    <rect x="105" y="40" width="240" height="40" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="115" y="56" fill="var(--text)" font-size="9.5">name=Anna, age=31</text>
    <text x="115" y="72" fill="var(--text)" font-size="9.5">city=Brno, email=a@…</text>
    <rect x="350" y="40" width="170" height="40" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="360" y="56" fill="var(--text)" font-size="9.5">logins=420</text>
    <text x="360" y="72" fill="var(--text)" font-size="9.5">last_seen=2025-03-15</text>
  </g>
  <g>
    <rect x="20" y="85" width="80" height="40" fill="var(--bg-card)" stroke="var(--accent-line)"/>
    <text x="60" y="109" text-anchor="middle" fill="var(--text)">user:77</text>
    <rect x="105" y="85" width="240" height="40" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="115" y="101" fill="var(--text)" font-size="9.5">name=Bob, age=42</text>
    <text x="115" y="117" fill="var(--text)" font-size="9.5">bio=...,  twitter=...</text>
    <rect x="350" y="85" width="170" height="40" fill="var(--bg-inset)" stroke="var(--line)" stroke-dasharray="3 3"/>
    <text x="435" y="105" text-anchor="middle" fill="var(--text-muted)" font-size="9">(řídký řádek —</text>
    <text x="435" y="118" text-anchor="middle" fill="var(--text-muted)" font-size="9">žádné stats)</text>
  </g>
  <g>
    <rect x="20" y="130" width="80" height="40" fill="var(--bg-card)" stroke="var(--accent-line)"/>
    <text x="60" y="154" text-anchor="middle" fill="var(--text)">user:88</text>
    <rect x="105" y="130" width="240" height="40" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="115" y="146" fill="var(--text)" font-size="9.5">name=Carol</text>
    <text x="115" y="161" fill="var(--text)" font-size="9.5">phone=…, addr=…</text>
    <rect x="350" y="130" width="170" height="40" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="360" y="146" fill="var(--text)" font-size="9.5">logins=12</text>
    <text x="360" y="161" fill="var(--text)" font-size="9.5">premium=true</text>
  </g>
</svg>
:::

Sloupce jsou dynamické — `user:42` a `user:88` mohou mít *různé sloupce* v `profile` family.

**Příklady**: Apache Cassandra (Facebook), Google BigTable, Apache HBase, ScyllaDB, Amazon SimpleDB.

**Použití**: time-series data (telemetrie senzorů), event logy, write-heavy aplikace (sociální feedy, IoT), wide datasety s mnoha řídce vyplněnými atributy.

**Nevhodné**: úloha vyžadující JOIN nebo silnou konzistenci napříč řádky.

## Grafové databáze

Data jako **graf** — uzly s vlastnostmi + orientované/neorientované hrany s vlastnostmi.

* **Uzel (node, vertex)** — entita (osoba, firma, místo). Má *label* (typ uzlu) a *vlastnosti* (key-value).
* **Hrana (edge, relationship)** — propojení mezi uzly. Má *typ* (např. `FRIEND_OF`, `WORKS_AT`) a vlastnosti (např. `since: 2020`).
* **Dotazování** — průchod grafem; např. *"přátelé přátel uživatele 42, kteří pracují v Praze"*.

Grafové DB jsou optimalizované pro *graph traversal* — průchod hran je O(1) (index-free adjacency), ne O(log N) jako v relačním JOIN.

```cypher
// Cypher (jazyk Neo4j)
MATCH (a:Person {name: "Anna"})-[:FRIEND_OF]->(f)-[:FRIEND_OF]->(ff)
WHERE ff.city = "Praha" AND a <> ff
RETURN ff.name
```

**Příklady**: Neo4j (nejrozšířenější), AllegroGraph (RDF), JanusGraph, ArangoDB (multi-model), Amazon Neptune (graf + RDF), TigerGraph.

**RDF databáze** (Resource Description Framework) jsou speciální podkategorie grafových — uchovávají *trojice* `(subjekt, predikát, objekt)`, dotazují se v **SPARQL**. Více v [[rdf]].

**Použití**: sociální sítě (kdo zná koho), doporučovací systémy, fraud detection (vzory podvodných transakcí), knowledge graphs (Wikidata, schema.org), routing v dopravních sítích.

**Nevhodné**: hromadné agregace nad miliardami záznamů; data bez vztahů (klíč-hodnota tam stačí).

## Porovnání čtyř typů

| Typ | Klíč | Hodnota | Dotazování | Use case |
| :--- | :--- | :--- | :--- | :--- |
| **Key-value** | jednoduchý | neprůhledný blob | jen `get(key)` | cache, sessions, counters |
| **Document** | `_id` | strukturovaný JSON/BSON | dotazy podle polí, agregace | webové aplikace, katalogy |
| **Wide-column** | row key | dynamické sloupce v families | dotazy s předdefinovaným indexem | time-series, IoT, logging |
| **Graph** | id uzlu/hrany | atributy entity | traversal, vzory | sociální sítě, knowledge graphs |

## Volba typu NoSQL

Pomocné otázky:

1. **Potřebuju dotazovat podle obsahu hodnoty?** Ne → KV. Ano → ostatní.
2. **Jsou data hierarchická (vnoření)?** Ano → document.
3. **Mám hodně rozsáhlé, řídké atributy?** Ano → wide-column.
4. **Jsou data primárně o vztazích?** Ano → graph.
5. **Potřebuju ACID transakce?** Většinou ne v NoSQL (kromě MongoDB 4.0+ multi-doc, RDBMS).
6. **Jaký je objem dat a zatížení?** Velmi velké/distribuovaná → wide-column.

V moderních architekturách se kombinuje (*polyglot persistence*): PostgreSQL pro transakce + Redis cache + MongoDB pro produktový katalog + Neo4j pro doporučení + Elasticsearch pro fulltext. Volba per use case, ne *one-size-fits-all*.

Konkrétní příklady nasazení v [[nosql-priklady]].

::: link "Sadalage, P. J., Fowler, M.: NoSQL Distilled (kniha)" "https://martinfowler.com/books/nosql.html"
:::

::: link "DB-Engines: NoSQL DBMS comparison" "https://db-engines.com/en/ranking"
:::

---

*Zdroj: UPA přednáška *NoSQL databáze* (Rychlý, 23. září 2025). Externí reference: Sadalage, P. J., Fowler, M.: *NoSQL Distilled*, Addison-Wesley 2012; Cattell, R.: *Scalable SQL and NoSQL Data Stores*, ACM SIGMOD Record 2010; Bradberry, R., Lubow, E.: *Practical Cassandra*, Addison-Wesley 2014; Robinson, I., Webber, J., Eifrem, E.: *Graph Databases*, 2nd ed., O'Reilly 2015.*
