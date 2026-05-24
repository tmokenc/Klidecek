---
title: Nativní objektové databáze (OODBMS)
---

# Nativní objektové databáze (OODBMS)

**Objektová databáze** (OODBMS, *object-oriented database*) ukládá objekty *přímo* — bez převodu na tabulky. Aplikace v OOP jazyce pracuje s perzistentními objekty *stejně* jako s tranzientními; knihovna se postará o uložení do úložiště, načtení a synchronizaci. OODBMS jsou výhodné pro embedded scénáře (mobilní aplikace, IoT) a tam, kde mapování objekt↔relace tvoří významnou část kódu. Příklady moderních OODBMS: **ObjectBox**, **db4o** (zaniklý projekt), **Realm**, **Versant**.

## Aplikační objekty vs. perzistentní objekty

Při běhu aplikace existují **tranzientní objekty** v hlavní paměti — žijí jen po dobu jejich dosažitelnosti z kořenů (garbage collector je uvolní, jakmile na ně nikdo neukazuje). Pro databázi potřebujeme **perzistentní objekty**, které přežijí ukončení aplikace a lze je znovu načíst v jiném běhu (případně z jiné aplikační instance).

Dva objekty se stejným *stavem* (hodnotami atributů) mohou být **ekvivalentní, ale nejsou identické** — mohou patřit do různých scope, mít odlišné životní cykly. Identita objektu se v OODBMS realizuje pomocí **OID** (*Object Identifier*) — globálního unikátního identifikátoru, který je *konstantní* po celou dobu existence objektu (na rozdíl od PK v relační DB, kde lze hodnotu klíče měnit).

::: svg "Tranzientní vs. perzistentní objekty: tranzientní žijí jen v paměti aplikace, perzistentní mají OID a žijí v úložišti i mimo aplikační běh."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="20" y="30" width="220" height="150" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="130" y="50" text-anchor="middle" fill="var(--text)" font-weight="600">Aplikační paměť</text>
    <text x="130" y="64" text-anchor="middle" fill="var(--text-muted)" font-size="10">tranzientní objekty</text>
    <circle cx="70" cy="105" r="18" fill="var(--bg-card)" stroke="var(--accent-line)" stroke-width="1.5"/>
    <text x="70" y="109" text-anchor="middle" fill="var(--text)" font-size="10">o1</text>
    <circle cx="130" cy="105" r="18" fill="var(--bg-card)" stroke="var(--accent-line)" stroke-width="1.5"/>
    <text x="130" y="109" text-anchor="middle" fill="var(--text)" font-size="10">o2</text>
    <circle cx="190" cy="105" r="18" fill="var(--bg-card)" stroke="var(--accent-line)" stroke-width="1.5"/>
    <text x="190" y="109" text-anchor="middle" fill="var(--text)" font-size="10">o3</text>
    <text x="130" y="158" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">GC uvolní, když nedosažitelné</text>
  </g>
  <g>
    <rect x="300" y="30" width="220" height="150" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="410" y="50" text-anchor="middle" fill="var(--text)" font-weight="600">OODBMS úložiště</text>
    <text x="410" y="64" text-anchor="middle" fill="var(--text-muted)" font-size="10">perzistentní objekty</text>
    <circle cx="350" cy="105" r="20" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="350" y="103" text-anchor="middle" fill="var(--text)" font-size="9.5">OID#3</text>
    <text x="350" y="115" text-anchor="middle" fill="var(--text-muted)" font-size="9">Anna</text>
    <circle cx="410" cy="105" r="20" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="410" y="103" text-anchor="middle" fill="var(--text)" font-size="9.5">OID#7</text>
    <text x="410" y="115" text-anchor="middle" fill="var(--text-muted)" font-size="9">Brno</text>
    <circle cx="470" cy="105" r="20" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="470" y="103" text-anchor="middle" fill="var(--text)" font-size="9.5">OID#5</text>
    <text x="470" y="115" text-anchor="middle" fill="var(--text-muted)" font-size="9">Bob</text>
    <line x1="350" y1="125" x2="410" y2="125" stroke="var(--accent-line)" stroke-width="1.5"/>
    <line x1="470" y1="125" x2="410" y2="125" stroke="var(--accent-line)" stroke-width="1.5"/>
    <text x="410" y="158" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">přežívají aplikační běh</text>
  </g>
  <path d="M 240 105 L 300 105" stroke="var(--accent)" stroke-dasharray="3 3" stroke-width="1.5" marker-end="url(#arr-o)"/>
  <text x="270" y="98" text-anchor="middle" fill="var(--text-muted)" font-size="9">commit</text>
  <defs>
    <marker id="arr-o" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Vlastnosti CCSP

Aby objektové úložiště správně fungovalo, musí poskytovat **CCSP** — čtyři vlastnosti perzistentních objektů:

* **C**ontinuity (kontinuita) — dvě instance téhož objektu načtené aplikací z úložiště musí být *opravdu identické*, sdílet stejný stav. Aplikace musí vidět pouze jednu kopii objektu s daným OID, ne dvě nezávislé.
* **C**ohesion (soudržnost) — skupina propojených objektů musí být perzistována *společně* jako soudržný celek. Aplikace může mezi nimi přecházet přes reference bez nutnosti znovu načítat.
* **S**patio-temporal priority (časoprostorová priorita) — dva objekty reprezentující tutéž entitu reálného světa (stejné místo a čas) musí být identické, mít stejný OID. Příklad: dva instance `Customer` se stejným `ID` ze dvou různých modulů aplikace musí být jeden objekt.
* **P**ersistence — schopnost objektu existovat *mimo* běh aplikace, být uložen do permanentní storage a načten zpět.

CCSP je netriviální vlastnost — typický **ORM** (Hibernate, JPA) implementuje *Continuity* přes *first-level cache* (Session) a *Cohesion* přes *cascade* anotace a *lazy fetching*.

## Mapování perzistentních objektů — tři přístupy

### 1. Nativní mapování (OODBMS)

Perzistence je realizována *přímo* objektovou databází. K provedení CCSP musí být DB integrována do aplikačního kódu — buď přes knihovny (db4o API), nebo přes anotace zdrojového kódu (ObjectBox `@Entity`).

```java
// ObjectBox příklad
@Entity
public class Person {
    @Id long id;
    String name;
    @Relation Address address;
}

Box<Person> box = store.boxFor(Person.class);
box.put(new Person("Anna"));  // INSERT
Person p = box.get(42);        // SELECT podle OID
```

Výhoda — *přímočaré*, žádný překlad. Nevýhoda — nepřenositelné mezi databázemi, OODBMS jsou méně rozšířené.

### 2. Object-Relational Mapping (ORM)

Aplikace pracuje s objekty, **middleware** (ORM knihovna, např. Hibernate, EF, SQLAlchemy) je překládá na relační operace. Mapování `třída → tabulka`, `objekt → řádek`, `atribut → sloupec`. Konverze datových typů, dědičnost realizována jednou ze strategií (single-table, joined, table-per-class).

### 3. Object-Document Mapping (ODM)

Analogie ORM, ale s **dokumentovou NoSQL** databází (MongoDB, Couchbase). Mapování `třída → kolekce`, `objekt → dokument`, `atribut → pole`. Příklad: Spring Data MongoDB, Mongoose pro Node.js.

Obě varianty (ORM/ODM) přidávají vrstvu komplexnosti — *lazy loading*, *N+1 problem*, *cache invalidation*, *schema migration*. Pro tyto problémy viz [[orm-odm]].

## OQL — Object Query Language

ODMG navrhla **OQL** jako jazyk podobný SQL, ale s navigací přes reference (tečková notace) a podporou kolekcí. Příklad:

```
SELECT e.name, e.managedBy.name
FROM AllEmployees e
WHERE e.name = 'John Smith'
```

V praxi OQL **téměř neexistuje** — aplikace načte objekty *přímo* přes API:

```java
List<Employee> result = box.query()
    .equal(Employee_.name, "John Smith")
    .build()
    .find();
```

Tento přístup je obvykle preferován, protože dotaz je *typově kontrolován* kompilátorem (na rozdíl od SQL stringu).

## ODMG a její neúspěch

**Object Data Management Group** (1991–2001) navrhla standard pro OODBMS: **ODL** (Object Definition Language) pro schéma, **OQL** pro dotazy a vázání na C++/Java/Smalltalk. Standard se *neujal* z těchto důvodů:

1. **Třídy už existují** v aplikačním jazyce → ODL je redundantní (definuje to, co je v Javě).
2. **Dotazy nejsou nutné** — aplikace pracuje s objekty rovnou.
3. **Standardizační proces** se opozdil — relační DB mezitím přidaly objektové rysy (SQL:1999).
4. **Trh OODBMS** zůstal úzký (CAD/CAM, telekomunikace), zatímco RDBMS dominovaly v IS.

Dnes neexistuje jeden zavedený standard pro OODBMS — každý produkt má vlastní API. To je jeden z důvodů, proč se firmy raději drží OR mapování nad standardním SQL backendem.

## Použití OODBMS dnes

OODBMS mají úzký, ale stabilní okruh aplikací:

* **Embedded mobilní DB** — ObjectBox (Android, iOS), Realm. Lokální storage pro aplikace s offline-first přístupem (synchronizace s cloudem).
* **Vědecké aplikace** — CAD/CAM, EDA (electronic design automation), bioinformatické pipelines (uchování grafů objektů).
* **Hraje** — savestate jako graf objektů (perzistence world state).
* **Real-time systémy** — Versant pro telekomunikační a finanční aplikace.

V cloud-native éře jsou OODBMS *menšina* — dominují **dokumentové NoSQL** (MongoDB) a klasické RDBMS s JSON podporou (PostgreSQL). Důvody: lepší ekosystém nástrojů, snazší debugování (SQL je univerzální jazyk), snazší integrace.

::: link "ObjectBox documentation" "https://docs.objectbox.io/"
:::

::: link "Realm Database" "https://www.mongodb.com/products/realm"
:::

::: link "ODMG 3.0 (archived overview)" "https://www.researchgate.net/publication/250893572_The_Object_Data_Standard_ODMG_30"
:::

---

*Zdroj: UPA přednáška *Objects in Databases* (Rychlý, 16. září 2025). Externí reference: Cattell, R. (ed.): *The Object Data Standard: ODMG 3.0*, Morgan Kaufmann 2000; Bernstein, P. A., Newcomer, E.: *Principles of Transaction Processing*, 2nd ed., Morgan Kaufmann 2009; ObjectBox documentation.*
