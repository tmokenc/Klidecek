---
title: Databázové modely — relační, objektový, NoSQL, grafový
---

Strukturované datové typy (struktury, kolekce, objekty) tvoří *abstraktní* aparát pro popis dat. Aby s nimi mohl pracovat reálný **systém řízení báze dat (SŘBD)**, musí být zformulovány v jazyce, kterému SŘBD rozumí — v tzv. **produkčním databázovém modelu**. V definičním jazyce produkčního modelu jsou zapsána *metadata* pro všechny datové struktury uložené v databázi.

## Klasifikace databázových modelů

::: svg "Hlavní rodiny databázových modelů"
<svg viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="180" y="10" width="140" height="32" rx="6" fill="var(--accent-soft)" stroke="var(--accent)"/>
  <text x="250" y="30" text-anchor="middle" font-size="12" font-weight="600" fill="var(--accent)">Databázové modely</text>
  <line x1="220" y1="42" x2="80" y2="75" stroke="var(--text-muted)" stroke-width="1"/>
  <line x1="250" y1="42" x2="250" y2="75" stroke="var(--text-muted)" stroke-width="1"/>
  <line x1="280" y1="42" x2="370" y2="75" stroke="var(--text-muted)" stroke-width="1"/>
  <line x1="300" y1="42" x2="430" y2="75" stroke="var(--text-muted)" stroke-width="1"/>
  <rect x="20" y="75" width="120" height="32" rx="5" fill="oklch(0.62 0.14 200 / 0.12)" stroke="oklch(0.62 0.14 200)"/>
  <text x="80" y="95" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.40 0.14 200)">NoSQL (jednoduché)</text>
  <rect x="195" y="75" width="110" height="32" rx="5" fill="oklch(0.62 0.14 264 / 0.12)" stroke="oklch(0.62 0.14 264)"/>
  <text x="250" y="95" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.40 0.14 264)">Relační</text>
  <rect x="320" y="75" width="100" height="32" rx="5" fill="oklch(0.62 0.14 22 / 0.12)" stroke="oklch(0.62 0.14 22)"/>
  <text x="370" y="95" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.40 0.14 22)">Objektový</text>
  <rect x="370" y="115" width="115" height="32" rx="5" fill="oklch(0.62 0.14 142 / 0.12)" stroke="oklch(0.62 0.14 142)"/>
  <text x="427" y="135" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.40 0.14 142)">Grafový / RDF</text>
  <text x="80" y="125" text-anchor="middle" font-size="10" fill="var(--text-muted)">key-value</text>
  <text x="80" y="140" text-anchor="middle" font-size="10" fill="var(--text-muted)">dokumentové</text>
  <text x="80" y="155" text-anchor="middle" font-size="10" fill="var(--text-muted)">sloupcové</text>
  <text x="80" y="175" text-anchor="middle" font-size="9.5" fill="var(--text-faint)" font-family="var(--font-mono)">Redis, Mongo, HBase</text>
  <text x="250" y="125" text-anchor="middle" font-size="10" fill="var(--text-muted)">tabulky + SQL</text>
  <text x="250" y="140" text-anchor="middle" font-size="10" fill="var(--text-muted)">cizí klíče</text>
  <text x="250" y="175" text-anchor="middle" font-size="9.5" fill="var(--text-faint)" font-family="var(--font-mono)">PostgreSQL, Oracle</text>
  <text x="370" y="125" text-anchor="middle" font-size="10" fill="var(--text-muted)">třídy, OID</text>
  <text x="370" y="140" text-anchor="middle" font-size="10" fill="var(--text-muted)">dědičnost</text>
  <text x="370" y="155" text-anchor="middle" font-size="10" fill="var(--text-muted)">ORM</text>
  <text x="427" y="165" text-anchor="middle" font-size="10" fill="var(--text-muted)">uzly + hrany</text>
  <text x="427" y="180" text-anchor="middle" font-size="9.5" fill="var(--text-faint)" font-family="var(--font-mono)">Neo4j, RDF</text>
</svg>
:::

* **Jednoduché modely (NoSQL).** Vznikly jako odpověď na omezení relačních databází ve scénářích vysoké škálovatelnosti a webových aplikací. Patří sem:
  * **Key-value** úložiště (Redis, dříve MUMPS) — adresují hodnotu (libovolný objekt) jediným klíčem; ideální pro cache a session storage.
  * **Dokumentová** úložiště (MongoDB, CouchDB) — hodnota je strukturovaný dokument (typicky JSON/BSON); schéma je flexibilní.
  * **Wide-column / sloupcová** úložiště (Apache HBase, Cassandra) — řádky sdružené do skupin sloupců (column families), adresované řádkovým klíčem; optimalizováno pro masivní zápisy a horizontální škálování nad obrovskými tabulkami, nikoli primárně pro analytické agregace.
* **Relační datový model** (Codd, 1970). Dosud nejrozšířenější model produkčních databází. Existuje řada implementací (PostgreSQL, Oracle, MySQL/MariaDB, MS SQL Server, SQLite, …).
* **Objektový datový model.** Reprezentuje data přímo jako objekty s OID, vlastnostmi, dědičností a referencemi. V čisté podobě (ObjectStore, db4o, ObjectDB) je méně rozšířený; v hybridní podobě prochází přes **objektově-relační mapování (ORM)** — JPA/Hibernate, Entity Framework, …
* **Grafový model.** Data jsou uzly a hrany libovolného typu. Vhodné pro silně propojené domény (sociální sítě, doporučovací systémy, znalostní grafy). Implementace: Neo4j, OrientDB; pro sémantický web pak RDF úložiště (Apache Jena, Virtuoso).

## Konceptuální modely

Pro **komunikaci mezi návrháři a se zákazníkem** se používají **konceptuální modely** — formálně přesné, ale grafické a vyšší úrovně abstrakce, *převoditelné* na produkční modely. Tři nejběžnější:

* **UML — Class diagram.** Třídy, atributy, asociace, dědičnost. Vychází z objektově orientovaného návrhu.
* **E-R diagram** (Entity-Relationship, Chen 1976). Entity, vztahy a kardinality. Klasický nástroj pro návrh relačních databází.
* **CDL** (Conceptual Definition Language). Formálnější zápis konceptuálního modelu, viz historie přístupu na FIT.

Transformace konceptuálního modelu na produkční je tím obtížnější, čím *sémanticky vzdálenější* oba modely jsou. Nejčastěji se řeší **transformace E-R diagramu na relační model** (entita → tabulka, atribut → sloupec, vztah → cizí klíč nebo vazební tabulka).

## Vztahy v relačním vs. objektovém modelu

V *relačním* modelu **vztah není přímou součástí dat** — vytváří se *až v okamžiku dotazování* operací JOIN podle hodnot klíčů. Pozor: referenční integrita (FOREIGN KEY) je *omezení*, nikoliv samotný vztah!

V *objektovém* modelu se vztah vytvoří přímo *odkazem* (referencí) — vlastnost objektu typu *OID* identifikuje cílový objekt. Při návrhu odpadá nutnost transformace asociace na cizí klíče. Toto je hlavní praktická výhoda objektového modelu i důvod existence ORM.

::: link "Codd, E. F. (1970): A Relational Model of Data for Large Shared Data Banks" "https://dl.acm.org/doi/10.1145/362384.362685"
:::

::: link "Chen, P. P. (1976): The Entity-Relationship Model" "https://dl.acm.org/doi/10.1145/320434.320440"
:::

::: link "DB-Engines: ranking databází podle modelu" "https://db-engines.com/en/ranking_categories"
:::

::: link "Neo4j — grafová databáze (dokumentace)" "https://neo4j.com/docs/"
:::

::: quiz "V relační databázi máme objednávky a zákazníky propojené sloupcem `customer_id`. Vztah mezi řádky vzniká:"
- [x] Až v okamžiku dotazování (např. SQL JOIN podle hodnoty klíče).
  > Přesně. Relační model vztah neukládá; FOREIGN KEY je pouze integritní omezení. Vztah se materializuje při dotazu.
- [ ] Při vložení řádku — vytvoří se přímý ukazatel.
  > To by platilo pro objektový model s OID, nikoli pro relační model.
- [ ] Pouze pomocí explicitní vazební tabulky.
  > Vazební tabulka řeší M:N kardinalitu, ale samotný princip JOIN funguje i pro 1:N přímo přes cizí klíč v podřízené tabulce.
:::

---

*Zdroj: přednášky PIS — prof. T. Hruška a doc. R. Burget, VUT FIT, část „Datové modelování".*
