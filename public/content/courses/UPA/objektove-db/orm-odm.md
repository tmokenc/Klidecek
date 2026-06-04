---
title: Object-Relational a Object-Document Mapping
---

# Object-Relational a Object-Document Mapping

V praxi řeší většina aplikací perzistenci přes **middleware vrstvu**, která mapuje objekty na řádky relační DB (**ORM** — Object-Relational Mapping) nebo na dokumenty NoSQL DB (**ODM** — Object-Document Mapping). Tento přístup je dnes dominantní — pouze úzká nika používá nativní OODBMS ([[oodbms]]). Mezi nejrozšířenější ORM/ODM patří **Hibernate** a **JPA** (Java), **Entity Framework** (.NET), **SQLAlchemy** (Python), **ActiveRecord** (Ruby), **Mongoose** (Node.js + MongoDB), **Spring Data MongoDB**, **Doctrine** (PHP).

## Co řeší ORM/ODM

Hlavní úkol — překlenout impedance mismatch mezi OOP modelem a relačním/dokumentovým úložištěm. Konkrétně:

* **Mapování třídy ↔ tabulky/kolekce** — automatický překlad anotací nebo XML konfigurace na schéma.
* **Mapování typů** — `String` → `VARCHAR`, `BigDecimal` → `DECIMAL`, `LocalDate` → `DATE`, atd.
* **Mapování dědičnosti** — *single-table* (jedna tabulka, diskriminátor sloupec), *joined* (jedna tabulka per třída, propojené JOIN), *concrete* (jedna tabulka per konkrétní třída).
* **Mapování asociací** — 1:1, 1:N, M:N přes FK, vazební tabulky nebo vnořené dokumenty.
* **Identita** — `@Id` určuje PK; ORM přiděluje OID lokálně pro celou *Session* (transakční kontext).
* **Lazy loading** — závislé objekty se načítají *na vyžádání*, ne při načtení rodiče.
* **Caching** — first-level cache (Session), second-level cache (sdílená mezi sessions).
* **Dirty checking** — automatická detekce změn objektů a generování `UPDATE` SQL.
* **Schema migration** — Flyway, Liquibase, Alembic pro řízení verzí schématu.

::: svg "ORM jako middleware: aplikační kód pracuje s objekty (Person, Address), Session překládá na SQL CRUD operace nad relační DB."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="20" y="30" width="160" height="160" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="100" y="50" text-anchor="middle" fill="var(--text)" font-weight="600">Aplikační kód</text>
    <g font-family="ui-monospace, monospace" font-size="9.5">
      <text x="35" y="80" fill="var(--text)">Person p = new Person();</text>
      <text x="35" y="95" fill="var(--text)">p.setName("Anna");</text>
      <text x="35" y="110" fill="var(--text)">session.save(p);</text>
      <text x="35" y="130" fill="var(--text-muted)">// load &amp; modify</text>
      <text x="35" y="145" fill="var(--text)">p = session.get(...);</text>
      <text x="35" y="160" fill="var(--text)">p.setName("Anna B.");</text>
      <text x="35" y="175" fill="var(--text)">session.commit();</text>
    </g>
  </g>
  <g>
    <rect x="200" y="60" width="140" height="100" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2" rx="6"/>
    <text x="270" y="84" text-anchor="middle" fill="var(--text)" font-weight="600">ORM Session</text>
    <text x="270" y="100" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">first-level cache</text>
    <text x="270" y="115" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">dirty checking</text>
    <text x="270" y="130" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">identity map</text>
    <text x="270" y="148" text-anchor="middle" fill="var(--accent)" font-size="10">SQL generator</text>
  </g>
  <g>
    <rect x="360" y="30" width="160" height="160" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="440" y="50" text-anchor="middle" fill="var(--text)" font-weight="600">Relační DB</text>
    <g font-family="ui-monospace, monospace" font-size="9.5">
      <text x="375" y="80" fill="var(--text-muted)">INSERT INTO person</text>
      <text x="375" y="95" fill="var(--text-muted)">  VALUES (1,'Anna');</text>
      <text x="375" y="115" fill="var(--text-muted)">SELECT * FROM person</text>
      <text x="375" y="130" fill="var(--text-muted)">  WHERE id = 1;</text>
      <text x="375" y="150" fill="var(--text-muted)">UPDATE person</text>
      <text x="375" y="165" fill="var(--text-muted)">  SET name = 'Anna B.'</text>
      <text x="375" y="180" fill="var(--text-muted)">  WHERE id = 1;</text>
    </g>
  </g>
  <line x1="180" y1="110" x2="200" y2="110" stroke="var(--accent)" marker-end="url(#arr-orm)"/>
  <line x1="340" y1="110" x2="360" y2="110" stroke="var(--accent)" marker-end="url(#arr-orm)"/>
  <defs>
    <marker id="arr-orm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Příklad — JPA/Hibernate {tier=example}

```java
@Entity
@Table(name = "osoba")
public class Osoba {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String jmeno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_adresa")
    private Adresa adresa;

    @OneToMany(mappedBy = "rodic", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Osoba> deti = new ArrayList<>();
}
```

Anotace mapují třídu `Osoba` na tabulku `osoba`. JPA automaticky vygeneruje SQL `CREATE TABLE` (přes Hibernate `hbm2ddl.auto=update`), nebo migrace přes Flyway. `fetch = LAZY` znamená, že `adresa` se načte až při prvním přístupu k `osoba.getAdresa()`.

## ODM — Object-Document Mapping

Analogický koncept pro **dokumentové NoSQL** (MongoDB, Couchbase). Třída se mapuje na **dokument** (JSON-like struktura), kolekce dokumentů odpovídá kolekci v MongoDB.

### Příklad — Spring Data MongoDB

```java
@Document(collection = "osoby")
public class Osoba {
    @Id
    private String id;

    private String jmeno;

    @Field("adresa")
    private Adresa adresa;       // VNOŘENÝ dokument

    @DBRef(lazy = true)
    private List<Osoba> deti;    // REFERENCE na samostatné dokumenty
}
```

Klíčový rozdíl: dokumentové DB nabízejí **dva způsoby modelování asociací**:

1. **Vnoření (embedding)** — celý objekt je *součástí* rodičovského dokumentu (`@Field("adresa")`). Výhoda: rychlé čtení (jeden disk read), atomické updates. Nevýhoda: duplikace při sdílení, omezená velikost dokumentu (MongoDB max 16 MB).
2. **Reference (linking)** — odkaz na cizí dokument přes `_id` (`@DBRef`). Výhoda: žádná duplikace, libovolně velké asociace. Nevýhoda: vyžaduje druhý disk read (analogie JOIN v RDBMS, ale méně optimalizované).

Volba mezi vnořením a referencí závisí na **přístupových vzorech** — pokud se data čtou vždy společně, vnořit; pokud nezávisle nebo často sdílena, referencovat.

## Časté problémy ORM/ODM

### N+1 problem

Při načtení kolekce N rodičovských objektů a *lazy* přístupu k jejich vztahu se vygeneruje *1 + N* SQL dotazů (jeden pro rodiče, N pro každého potomka). Řešení:

* `JOIN FETCH` v JPQL: `SELECT o FROM Osoba o JOIN FETCH o.adresa WHERE o.mesto = 'Brno'`
* `@BatchSize(size=10)` — Hibernate načte v jednom dotazu více závislých.
* `@EntityGraph` — JPA 2.1, deklarativní specifikace fetch plánu.

### Lazy loading exception

Pokud `Session` skončí (např. po HTTP request) a aplikace přistoupí k `@OneToMany(fetch = LAZY)` mimo aktivní transakci, JPA vyhodí `LazyInitializationException`. Řešení:

* Načíst data *uvnitř* transakce (`@Transactional` na service vrstvě).
* `OpenEntityManagerInViewFilter` — drží Session aktivní po celou dobu HTTP request (kontroverzní).
* DTO mapování — *projektovat* entity na DTO uvnitř service, vrátit DTO ven.

### Stale state / optimistic locking

Pokud dva uživatelé načtou stejný objekt a oba ho modifikují, který `commit` vyhraje? **Optimistické zamykání** přes `@Version`:

```java
@Entity
public class Konto {
    @Id Long id;
    BigDecimal zustatek;
    @Version Long verze;
}
```

JPA při `UPDATE` přidá `WHERE id=? AND verze=?` a inkrementuje verzi. Pokud verze neodpovídá, `UPDATE` neaktualizuje 0 řádků a JPA vyhodí `OptimisticLockException`.

### Cache invalidation

Second-level cache (např. Ehcache, Hazelcast) sdílí entity mezi sessions. Problém: jak invalidovat cache, když změnu provede *jiná aplikační instance* nebo *přímá SQL operace*? Řešení:

* Cluster cache s message bus (Redis pub-sub, Hazelcast).
* TTL — nastavit krátkou expiraci.
* Vypnutí cache pro entity s vysokou frekvencí změn.

## ORM vs. ODM srovnání

| Aspekt | ORM (Hibernate, JPA) | ODM (Mongoose, Spring Data MongoDB) |
| :--- | :--- | :--- |
| **Cíl** | RDBMS (Oracle, PostgreSQL, MySQL) | dokumentová NoSQL (MongoDB, Couchbase) |
| **Mapování** | třída ↔ tabulka, kolekce přes vazební tabulky | třída ↔ kolekce dokumentů; vnoření nebo reference |
| **JOIN** | nativní SQL JOIN | nutná aplikace `$lookup` nebo manuální dereference |
| **Transakce** | ACID (mostly) | omezené (MongoDB 4.0+ podporuje multi-doc transakce, ale s režií) |
| **Schema** | explicitní (DDL, migrace) | implicitní (schema-less, validace volitelná) |
| **Typové bezpečí** | striktní (typy musí odpovídat) | flexibilní (lze přidávat pole bez migrace) |
| **Lazy loading** | nativní podpora (proxy objekty) | méně rozšířená (často eager) |

## Kdy nepoužívat ORM/ODM

* **Bulk operace** — naivní vzor, kdy se přes ORM načtou všechny entity do Session, v cyklu se modifikují (`setStav('X')`) a uloží, je lineárně pomalejší (úměrně počtu řádků) než přímé SQL — kvůli režii na řádek (materializace entit, dirty checking, N samostatných `UPDATE`). Použít `entityManager.createNativeQuery(...).executeUpdate()` nebo přímý JDBC.
* **Reporting/OLAP** — agregační dotazy přes GROUP BY, window funkce. ORM zde nepřináší hodnotu, naopak ztěžuje optimalizaci.
* **Performance-critical** — pro nízkolatentní cesty (high-frequency trading, real-time bidding) je lepší přímý SQL nebo binární protokol.

V moderních architekturách (mikroservis, CQRS) se často **kombinují** přístupy — ORM pro write modely (transakční konzistence), nativní SQL/MongoDB query pro read modely (denormalizace, projekce). Více viz [[datova-sada]] o roli dat v analytickém projektu.

::: link "Hibernate ORM documentation" "https://hibernate.org/orm/documentation/"
:::

::: link "Spring Data MongoDB Reference" "https://docs.spring.io/spring-data/mongodb/docs/current/reference/html/"
:::

::: link "Vlad Mihalcea: High-Performance Java Persistence" "https://vladmihalcea.com/books/high-performance-java-persistence/"
:::

---

*Zdroj: UPA přednáška *Objects in Databases* (Rychlý, 16. září 2025). Externí reference: Bauer, C., King, G., Gregory, G.: *Java Persistence with Hibernate*, 2nd ed., Manning 2015; Banker, K., Garrett, D., Bakkum, P., Verch, S.: *MongoDB in Action*, 2nd ed., Manning 2016; Mihalcea, V.: *High-Performance Java Persistence*, Lulu 2016.*
