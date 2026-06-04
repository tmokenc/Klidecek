---
title: JPA entita — anotace, EntityManager, životní cyklus
---

V Javě se objektový model dat implementuje skrze **Jakarta Persistence API** (dříve *Java Persistence API*, **JPA**). Specifikace má více implementací — *Hibernate*, *EclipseLink*, *DataNucleus* — a alternativy mimo Jakarta EE (např. **JDO**). V této přednášce se soustředíme na JPA, protože je standardem pro Jakarta EE aplikace.

Konfiguraci persistenční jednotky (`persistence.xml`, JNDI datový zdroj, ovladač DB) jsme řešili v subtopicu [[jpa-persistence]]; zde se zaměříme na *psaní entit a práci s nimi*.

## Z POJO entitu — anotace `@Entity`

Základním stavebním blokem JPA je **Java Bean** — POJO třída s:

* veřejným bezparametrovým konstruktorem,
* privátními fieldy s getter/setter páry,
* (volitelně) `implements Serializable`.

Anotacemi z balíčku `jakarta.persistence` z ní uděláme **JPA entitu**:

```java
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "person")              // explicitní jméno tabulky
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 100)
    private String name;

    private String surname;
    private Date born;

    public Person() {}                // bezparametrový ctor — povinný

    // gettery a settery …
}
```

Význam klíčových anotací:

| Anotace | Význam |
|---|---|
| `@Entity` | Třída je perzistentní entita. |
| `@Table(name="…")` | Explicitní mapování na jméno tabulky. Bez ní by JPA odvodila jméno z názvu třídy. |
| `@Id` | Primární klíč. Každá entita musí mít právě jeden. |
| `@GeneratedValue` | Strategii pro automatické generování klíče. |
| `@Column(…)` | Doladění mapování sloupce (nullable, délka, jiné jméno, unikátnost). |

### Strategie generování `@GeneratedValue`

| Strategie | Co dělá | Kdy použít |
|---|---|---|
| `IDENTITY` | DB sloupec `AUTO_INCREMENT` / `SERIAL`. Klíč zná až **po** INSERT. | MySQL, PostgreSQL — výchozí volba. |
| `SEQUENCE` | Předem definovaná SQL sekvence. Klíč JPA získá **před** INSERT (lépe pro batch). | PostgreSQL, Oracle. |
| `TABLE` | Tabulka emulující sekvenci (přenositelné, ale nejpomalejší). | Pokud DB nemá ani auto-increment, ani sekvence. |
| `AUTO` | Implementace si vybere podle DB dialektu. | Pohodlné, ale neprůhledné. |
| `UUID` (JPA 3.1+) | Generuje UUID v paměti. | Distribuované systémy, kde nechceme centrální zdroj klíčů. |

## EntityManager — vstupní bod do DB

Pro skutečnou práci s entitami slouží objekt **`EntityManager`**. Reprezentuje JPA *persistenční kontext* — sledovanou množinu entit, jejich stav a otevřenou databázovou session. V Jakarta EE prostředí ho dostaneme injekcí:

```java
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Stateless
public class PersonService {

    @PersistenceContext               // kontejner dodá řízený EntityManager
    private EntityManager em;

    public Person findById(long id) { return em.find(Person.class, id); }
}
```

Klíčové operace `EntityManager`:

| Operace | Co dělá |
|---|---|
| `em.persist(obj)` | Zařadí `obj` do persistenčního kontextu *jako nový*. Po commitu vznikne INSERT. |
| `em.merge(obj)` | Zkopíruje stav `obj` (detached) do entity v persistenčním kontextu. Po commitu vznikne UPDATE. |
| `em.remove(obj)` | Označí *managed* entitu ke smazání. Po commitu vznikne DELETE. |
| `em.find(Class, id)` | Načte entitu z DB (nebo z 1st-level cache). |
| `em.refresh(obj)` | Přečte stav z DB a přepíše tím managed entitu. |
| `em.flush()` | Vynutí synchronizaci kontextu s DB (bez commitu transakce). |
| `em.detach(obj)` | Odpojí entitu z kontextu — přestane být sledována. |

## Životní cyklus entity

Každý objekt JPA entity je v jednom ze **čtyř stavů**:

::: viz jpa-lifecycle "Klikni na operaci a sleduj, jak entita přechází mezi stavy a co se vykoná v DB."
:::

::: svg "Čtyři stavy entity v JPA: new, managed, detached, removed"
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="30" width="120" height="48" rx="6" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
  <text x="70" y="52" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">new</text>
  <text x="70" y="68" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">new Person()</text>
  <rect x="190" y="30" width="120" height="48" rx="6" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
  <text x="250" y="52" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">managed</text>
  <text x="250" y="68" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">v kontextu</text>
  <rect x="370" y="30" width="120" height="48" rx="6" fill="oklch(0.62 0.14 22 / 0.18)" stroke="oklch(0.62 0.14 22)"/>
  <text x="430" y="52" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">detached</text>
  <text x="430" y="68" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">mimo kontext</text>
  <rect x="190" y="135" width="120" height="48" rx="6" fill="oklch(0.62 0.14 340 / 0.18)" stroke="oklch(0.62 0.14 340)"/>
  <text x="250" y="157" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">removed</text>
  <text x="250" y="173" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">k smazání</text>
  <path d="M 130 54 L 188 54" stroke="var(--text)" stroke-width="1.3" marker-end="url(#aE)" fill="none"/>
  <text x="159" y="46" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">persist()</text>
  <path d="M 310 50 L 368 50" stroke="var(--text)" stroke-width="1.3" marker-end="url(#aE)" fill="none"/>
  <text x="339" y="42" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">detach()</text>
  <path d="M 370 65 Q 340 88 310 65" stroke="var(--text)" stroke-width="1.3" marker-end="url(#aE)" fill="none"/>
  <text x="340" y="98" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">merge()</text>
  <path d="M 250 78 L 250 130" stroke="var(--text)" stroke-width="1.3" marker-end="url(#aE)" fill="none"/>
  <text x="280" y="108" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">remove()</text>
  <text x="270" y="197" text-anchor="middle" font-size="11" fill="var(--text-faint)" font-style="italic">„removed" se po commitu transakce smaže (nebo zaniká).</text>
  <defs>
    <marker id="aE" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="var(--text)"/></marker>
  </defs>
</svg>
:::

| Stav | Význam |
|---|---|
| **new** (transient) | Objekt jen v paměti, JPA o něm neví. Neexistuje v DB. |
| **managed** | Entita je v persistenčním kontextu, JPA sleduje její změny a po commitu je propíše do DB. |
| **detached** | Entita byla *managed*, ale persistenční kontext skončil (transakce uzavřena, `detach()` volán). Změny už se *nepromítají*. |
| **removed** | `em.remove()` označila *managed* entitu ke smazání. Po commitu se vykoná DELETE. |

### Příklady CRUD operací {tier=example}

**Vytvoření a uložení (INSERT):**

```java
Person p = new Person();             // stav: new
p.setName("Karel");
em.persist(p);                       // stav: managed → po commitu INSERT
// p.getId() je nyní vyplněno (po flushi/commitu)
```

**Změna stavu (UPDATE):**

```java
Person p = em.find(Person.class, 42); // stav: managed
p.setName("Karel Marx");               // změna se *automaticky* propíše,
                                       // protože managed entita je sledována
                                       // — žádné explicitní em.update() neexistuje!
```

Pokud máme entitu *detached* a chceme propsat změny zpět:

```java
person.setName("Karel");
Person managed = em.merge(person);    // vrátí novou managed kopii
// pozor: původní `person` je stále detached
```

**Mazání (DELETE):**

```java
Person p = em.find(Person.class, 42); // stav: managed
em.remove(p);                          // stav: removed → po commitu DELETE
```

### Transakce

Změny `persist` / `merge` / `remove` se do DB *fyzicky zapíší* až při commitu transakce (případně při explicitním `em.flush()`). V Jakarta EE prostředí transakci typicky řídí EJB kontejner deklarativně (`@TransactionAttribute`); v SE prostředí (mimo EE server) ji ovládáme ručně:

```java
em.getTransaction().begin();
em.persist(p);
em.getTransaction().commit();
```

V mikroprofile / lehčí variantě se používá anotace `@Transactional` z Jakarta Transactions API i nad CDI beany — viz [[ejb-cdi|topic o EJB/CDI]].

## Persistenční kontext jako 1st-level cache

`EntityManager` interně udržuje **1st-level cache** — pokud volám `em.find(Person.class, 42)` opakovaně v rámci téže transakce, *vrátí se mi totožný objekt* (referenčně), aniž by se znovu četla DB. To má praktické důsledky:

* Změna `p.setName(…)` se okamžitě „vidí" všem, kdo mají referenci na *managed* entitu.
* `em.find(…)` neudělá SQL, pokud je entita už v kontextu.
* Při dlouhé transakci a velkém grafu objektů může 1st-level cache spotřebovat paměť — proto občas `em.clear()` nebo `em.detach()` pomáhají.

## Doporučená praxe — DAO

Operace s `EntityManager` se obvykle nezapouzdřují *přímo* do business logiky, ale do **DAO** (*Data Access Object*) — vrstvy mezi business a datovou:

```java
@Stateless
public class PersonDao {

    @PersistenceContext
    private EntityManager em;

    public Person findById(long id)         { return em.find(Person.class, id); }
    public void   save(Person p)            { em.persist(p); }
    public void   update(Person p)          { em.merge(p); }
    public void   delete(Person p)          { em.remove(em.contains(p) ? p : em.merge(p)); }
    public List<Person> findAll()           {
        return em.createQuery("SELECT p FROM Person p", Person.class)
                 .getResultList();
    }
}
```

DAO chrání business logiku od **přímé závislosti na JPA** — v testech se nahradí mockem, v jiném prostředí jinou implementací (např. nad MongoDB).

::: link "Jakarta Persistence (JPA) — aktuální specifikace" "https://jakarta.ee/specifications/persistence/"
:::

::: link "Hibernate ORM — průvodce uživatele (komplexní reference)" "https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html"
:::

::: link "Vlado Mihalcea — High-Performance Java Persistence (kniha, doporučovaná pro produkční nasazení)" "https://vladmihalcea.com/books/high-performance-java-persistence/"
:::

::: link "Demo z přednášky — DIFS-Teaching/jakartaee-basic" "https://github.com/DIFS-Teaching/jakartaee-basic"
:::

::: quiz "Mám detached entitu `person` (vrácenou z DAO, používanou ve formuláři). Změním jí jméno a chci to uložit. Jaký kód použiji?"
- [x] `Person managed = em.merge(person);` — `merge` zkopíruje stav detached entity do managed kopie, kterou pak JPA propíše do DB.
  > Ano. `persist()` na detached entitu by selhal (entita s tím ID už existuje), explicitní `update()` v JPA neexistuje.
- [ ] `em.persist(person);` — vždy funguje pro uložení.
  > Ne. `persist` je *jen pro nové entity*. Na entitě s vyplněným ID, která už v DB existuje, vyhodí výjimku.
- [ ] `em.update(person);` — standardní volání pro UPDATE.
  > Žádná metoda `update()` v `EntityManager` API neexistuje. Změny managed entity jsou tracked automaticky; pro detached použijeme `merge`.
:::

::: quiz "V čem se liší výchozí strategie generování primárního klíče `IDENTITY` od `SEQUENCE`?"
- [x] `IDENTITY` čeká až na INSERT a hodnotu vrátí DB; `SEQUENCE` si vyžádá další číslo *před* INSERT, takže ID je v Javě dříve.
  > Ano. To má dopad na batching — `IDENTITY` neumí batch INSERT efektivně, `SEQUENCE` ano (Hibernate může z jednoho volání sekvence získat blok ID a pak je rozdat více entitám).
- [ ] `IDENTITY` je rychlejší ve všech ohledech.
  > Ne — pro vysoké INSERT rate je `SEQUENCE` typicky lepší, právě kvůli batchingu.
- [ ] `SEQUENCE` se používá jen v Oracle.
  > Také v PostgreSQL (`SERIAL` ≈ `SEQUENCE`), DB2, H2 a dalších. MySQL historicky sekvence neměla, dnes je má MariaDB.
:::

---

*Zdroj: přednášky PIS — prof. T. Hruška & doc. R. Burget, VUT FIT, přednáška „Objektový model dat", část „Objektový DB model v Javě" (slidy 49–58). Doplněno o životní cyklus entity a praxi DAO.*
