---
title: JPA vztahy — asociace, embedded, weak entity, kaskáda
---

Konceptuální vztahy mezi objekty ([[vztahy-objekty|jak je modelujeme]]) se v JPA realizují **anotacemi nad poli entit**. Tato kapitola pokrývá tři klíčové oblasti:

1. **Asociace** mezi entitami (`@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`),
2. **Vnořené struktury** (`@Embedded`, `@Embeddable`) — kdy entita nestojí samostatně,
3. **Slabé entitní množiny** (`@ElementCollection`) — kolekce přidružené k vlastníkovi bez vlastní identity.

Plus dva průřezové mechanismy: **kaskádu** (propagace operací po vztahu) a **fetch type** (kdy se vztah načítá z DB).

## Kardinalita — čtyři anotace

| Anotace | Kardinalita | Příklad |
|---|---|---|
| `@OneToOne` | 1 : 1 | `Person ↔ PersonProfile` |
| `@OneToMany` | 1 : N (vlastnická strana je „1") | `Person ↔ Cars` |
| `@ManyToOne` | N : 1 (vlastnická strana je „N") | `Car ↔ Owner` |
| `@ManyToMany` | M : N | `Book ↔ Author` |

Sémanticky to odpovídá [[vztahy-objekty|vztahům 1:1 a 1:N]] z teoretické části, jen je tu navíc *M:N* (které se v relačním modelu obvykle realizuje pomocnou „join-table"). M:N v objektovém modelu znamená, že obě strany drží kolekci odkazů na druhou.

## Vztah `@ManyToOne` — N entit ukazuje na jednu

Nejjednodušší a *nejpoužívanější* vztah. Auto patří jedné osobě, ale jedna osoba může mít více aut:

```java
@Entity
public class Car {
    @Id @GeneratedValue
    private Long id;

    private String reg;

    @ManyToOne                                    // N car-ů → 1 owner
    @JoinColumn(name = "owner_id")                // FK sloupec v tabulce car
    private Person owner;

    // getters, setters …
}
```

V SQL to znamená sloupec `owner_id` v tabulce `car`, který je cizí klíč do `person.id`. JPA si vztah načte, kdykoliv saháte na `car.getOwner()`.

## Vztah `@OneToMany` — opačný směr téhož

Z pohledu osoby je seznam jejích aut **kolekce**:

```java
@Entity
public class Person {
    @Id @GeneratedValue
    private Long id;

    private String name;

    @OneToMany(mappedBy = "owner",                // inverzní strana — sloupec drží Car
               cascade = CascadeType.ALL,         // operace se propagují
               fetch = FetchType.LAZY,            // načti až při sahání
               orphanRemoval = true)              // při odebrání z kolekce → smaž z DB
    private List<Car> cars = new ArrayList<>();
}
```

Klíčové detaily:

* **`mappedBy = "owner"`** říká: *„nejsem majitelem vztahu, jen jeho inverzní pohled"*. Vztah je fyzicky uložený v `Car.owner`. Toto je *naprosto kritické* — pokud `mappedBy` nepoužijete, JPA vyrobí *třetí* tabulku jako join-table, což pro 1:N obvykle není to, co chceme.
* **`cascade`** — viz níže.
* **`fetch`** — viz níže.
* **`orphanRemoval`** — *když odeberu auto z `person.cars`, smaž ho úplně z DB* (a ne jen vynech vztah).

V terminologii [[vztahy-objekty|inverzních vztahů]] je `Person.cars` *inverzní strana*, `Car.owner` *vlastnická strana*. JPA si v relační DB neumí samo udržovat *oboustranný* odkaz — vždy ho fyzicky drží *jen jedna strana*.

## `@OneToOne` — někdy chcete jen vnoření

Pokud má `Person` adresu a adresa je samostatnou entitou:

```java
@Entity
public class Person {
    @Id @GeneratedValue
    private Long id;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "address_id")
    private Address address;
}

@Entity
public class Address {
    @Id @GeneratedValue
    private Long id;
    private String street, city, zip;
}
```

V mnoha případech je ale **`@OneToOne` zbytečně režijní** — adresa nikdy nežije samostatně, nemá smysl ji indexovat, dotazovat se na ni mimo Person… *Pak je lepší použít `@Embedded`* (viz níže).

## `@ManyToMany` — M:N

Klasika *kniha–autor*:

```java
@Entity
public class Book {
    @Id @GeneratedValue
    private Long id;

    @ManyToMany
    @JoinTable(name = "book_author",                                  // pomocná tabulka
               joinColumns        = @JoinColumn(name = "book_id"),
               inverseJoinColumns = @JoinColumn(name = "author_id"))
    private Set<Author> authors;
}

@Entity
public class Author {
    @Id @GeneratedValue
    private Long id;

    @ManyToMany(mappedBy = "authors")              // inverzní strana
    private Set<Book> books;
}
```

JPA vyrobí pomocnou tabulku `book_author(book_id, author_id)` s kompozitním PK. Pokud potřebujete na *vztahu* držet i další atributy (rok publikace, role autora), pak `@ManyToMany` přestává stačit — musíte zavést entitu pro samotný vztah (např. `BookAuthorRole`).

## Embedded — vnoření jako jediná tabulka

Pokud chcete, aby sloupce *adresy byly přímo v tabulce Person* (bez vlastní tabulky `address`), použijete `@Embeddable` + `@Embedded`:

```java
@Embeddable                                       // Address NENÍ entita,
public class Address {                            // je to embeddable hodnotový typ
    private String area;
    private String city;
    private String zipcode;
    // getters, setters …
}

@Entity
public class Person {
    @Id
    private String idperson;
    private String name;

    @Embedded
    private Address address;                      // sloupce area/city/zipcode v tabulce person
}
```

Výsledné schéma: tabulka `person` má sloupce `idperson`, `name`, `area`, `city`, `zipcode`. Žádná tabulka `address` neexistuje, žádný JOIN se neděje.

Embedded vs. entitní `@OneToOne`:

| Aspekt | `@Embedded` | `@OneToOne` |
|---|---|---|
| Vlastní tabulka? | Ne | Ano |
| Vlastní PK? | Ne | Ano |
| Lze odkazovat odjinud? | Ne (žije jen jako součást vlastníka) | Ano |
| Lze samostatně dotazovat? | Ne (jen jako součást vlastníka) | Ano |
| Lze sdílet mezi více vlastníky? | Ne (vždy nová instance) | Ano |
| Sémanticky odpovídá | *kompozici* (silná vlastnost) | *asociaci* (vztahu) |

Embedded je v podstatě „JPA prostředek pro [[vztahy-objekty|`Data=Value` vnoření]]" — to, čemu PIS notace říká *prostá struktura uvnitř vlastníka*.

## Slabá entitní množina — `@ElementCollection`

Někdy potřebujete *kolekci hodnotových objektů* uvnitř entity — třeba seznam adres pro jednu osobu, kde adresy *nemají vlastní identitu* a žijí pouze v kontextu osoby. To je **slabá entitní množina**:

```java
@Entity
public class Person {
    @Id
    private String idperson;
    private String name;

    @ElementCollection
    @CollectionTable(
        name       = "ADDRESSES",                 // jméno separátní tabulky
        joinColumns= @JoinColumn(name = "OWNER")) // FK zpět na person
    private List<Address> addresses;
}

@Embeddable
public class Address { … }                       // může být i jednoduchý typ String
```

Výsledné schéma:

* tabulka `person(idperson PK, name)`,
* tabulka `addresses(owner FK → person.idperson, area, city, zipcode)` bez vlastního PK.

Adresy *nemají vlastní identitu* — když person smažu, adresy zaniknou (JPA o to dbá automaticky); když adresu vyhodím ze seznamu, smaže se z `addresses`.

Pro **jednoduché typy** (string, int…) jde to napsat ještě stručněji:

```java
@ElementCollection
@CollectionTable(name = "ADDRESSES",
                 joinColumns = @JoinColumn(name = "OWNER"))
@Column(name = "PHONENUMBER")
private List<String> phones;
```

Vznikne tabulka `addresses(owner, phonenumber)`.

### Pořadí v kolekci — `@OrderColumn` vs `@OrderBy`

Co když chcete, aby `List<Address>` měl *deterministické pořadí*?

* **`@OrderColumn(name = "ORD")`** — JPA přidá *do kolekční tabulky* sloupec `ORD` (typicky integer 0..N-1) a podle něj řadí. Lze i ručně editovat.
* **`@OrderBy(name = "priority ASC")`** — JPA seřadí kolekci podle existující property cílového typu, pomocí `ORDER BY` v SQL. Pole `priority` musí v `Address` reálně být.

```java
@ElementCollection
@CollectionTable(name="ADDRESSES",
                 joinColumns=@JoinColumn(name="OWNER"))
@OrderColumn(name="ORD")                          // explicitní pořadí v tabulce
private List<Address> addresses;
```

```java
@OneToMany(mappedBy = "owner")
@OrderBy("priority ASC")                          // seřadit podle Address.priority
private List<Address> addresses;
```

## Kaskáda — propagace operací

Operace `persist`, `merge`, `remove`, `refresh`, `detach` se **defaultně nepropagují** po vztahu. Aby se to dělo, použijte parametr `cascade`:

```java
@OneToMany(cascade = { CascadeType.ALL },         // všechny operace
           fetch = FetchType.EAGER,
           mappedBy = "owner",
           orphanRemoval = true)
private Collection<Car> cars;
```

Typy kaskády:

| `CascadeType` | Propaguje operaci |
|---|---|
| `PERSIST` | `em.persist(owner)` → uloží i členy kolekce. |
| `MERGE` | `em.merge(owner)` → propagován merge na členy. |
| `REMOVE` | `em.remove(owner)` → smaže i členy. |
| `REFRESH` | `em.refresh(owner)` → refresh i členů. |
| `DETACH` | `em.detach(owner)` → detach i členů. |
| `ALL` | Všechny výše. |

V praxi:

* Pro `@OneToMany` a `@OneToOne`, kde dceřiná entita má smysl jen s rodičem → `CascadeType.ALL`.
* Pro `@ManyToOne` (přívěšek odkazuje na nezávislého rodiče) → **žádná kaskáda** — jinak by smazání auta smazalo i majitele!
* `@ManyToMany` typicky bez `REMOVE` — smazat knihu nesmí smazat autora.

## FetchType — kdy se vztah načte z DB

| `FetchType` | Kdy se vztah načte |
|---|---|
| **`EAGER`** | Hned při načtení vlastníka. JPA udělá JOIN nebo druhý SELECT. |
| **`LAZY`** | Až při prvním sahání na vztah (`person.getCars()`). |

Výchozí hodnoty jsou:

* `@OneToOne`, `@ManyToOne` → **EAGER** (entita zde ukazuje na *jednu věc*),
* `@OneToMany`, `@ManyToMany` → **LAZY** (kolekce může být velká).

**Důsledky:**

* **EAGER může táhnout celý strom dat z DB**. Třeba `Person` má `Address` (EAGER), `Address` má `Country` (EAGER), `Country` má `Continent` (EAGER) → jediné `find(Person)` načte i kontinent. *To není problém, dokud to není problém*.
* **LAZY mimo persistenční kontext způsobí `LazyInitializationException`** (Hibernate). Pokud entitu odešlete do view a tam saháte na `person.cars`, kontext už nemusí existovat. Řešení: 1) načtěte si je explicitně dotazem `JOIN FETCH`, 2) ponechte kontext otevřený („open session in view" — kontroverzní), 3) namapujte na DTO před opuštěním kontextu.

Pro produkční kód obvykle:

* `@ManyToOne` nechte `LAZY` (explicitní default je *EAGER*, ale `LAZY` je *vždy* bezpečnější),
* `@OneToMany` / `@ManyToMany` nechte default `LAZY`,
* potřebné kolekce načítejte v dotazu `JOIN FETCH`.

### N+1 problém — proč LAZY samo o sobě nestačí

::: viz jpa-nplus1 "Přepni mezi LAZY, EAGER a JOIN FETCH a sleduj, kolik SQL dotazů se opravdu vykoná."
:::

Klasický scénář: načteš N zákazníků (1 dotaz), pak v UI procházíš jejich objednávky (`.getOrders()` na každém — to je dalších N dotazů). Z původně 1 dotazu se náhle stane 1+N = `N+1`. Při 1000 zákaznících 1001 dotazů místo 1.

**Řešení**: explicitně vyžádej kolekci v původním dotazu pomocí `JOIN FETCH`:

```jpql
SELECT c FROM Customer c LEFT JOIN FETCH c.orders
```

Jeden SQL s `LEFT JOIN`, vše naráz. EAGER tento problém **neřeší** — jen ho schová: Hibernate při EAGER `@OneToMany` typicky vystřelí N+1 SELECTů ihned po původním dotazu místo lazy proxy, ale stále je to N+1.

## Co si odnést

* Asociace mezi entitami se modelují **čtyřmi anotacemi**: `@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`.
* **`mappedBy`** označuje *inverzní* (ne-vlastnickou) stranu vztahu — vztah je fyzicky uložen na opačné straně. *Bez `mappedBy` JPA vytvoří join-tabulku*.
* **`@Embedded` + `@Embeddable`** = vnoření hodnotového typu do tabulky vlastníka (analogie *Data=Value* z teoretického modelu).
* **`@ElementCollection`** = slabá entitní množina — kolekce závislých hodnot v samostatné tabulce, ale bez vlastní identity.
* **Kaskáda** propaguje operace po vztahu; pro N:1 typicky **bez kaskády**, pro 1:N typicky `ALL` s `orphanRemoval`.
* **FetchType `LAZY` je obvykle správnější volba** — nečekané EAGER fetchy táhnou data, která nemusíte vůbec použít.

::: link "Jakarta Persistence — Relationships (oficiální dokumentace)" "https://jakarta.ee/specifications/persistence/"
:::

::: link "Vlado Mihalcea — The best way to use the OneToMany annotation" "https://vladmihalcea.com/the-best-way-to-map-a-onetomany-association-with-jpa-and-hibernate/"
:::

::: link "Thoughts on Java — When to use FetchType.LAZY vs EAGER" "https://thorben-janssen.com/entity-mappings-introduction-jpa-fetchtypes/"
:::

::: link "Baeldung — @ElementCollection in JPA" "https://www.baeldung.com/jpa-elementcollection"
:::

::: quiz "Máte `Person` s `@OneToMany(mappedBy = \"owner\", …) private List<Car> cars;`. Kde fyzicky leží FK v relační DB?"
- [x] V tabulce `car`, sloupec určený `@JoinColumn` u `Car.owner`. `mappedBy` říká, že `Person.cars` je **inverzní** pohled a vlastníkem vztahu je `Car`.
  > Přesně. JPA udržuje vztah jen jednou — ve sloupci na *vlastnické* straně. Pokud `mappedBy` chybí, JPA vyrobí třetí tabulku (join-table), což pro 1:N obvykle není optimální.
- [ ] V tabulce `person`, sloupec `cars_ids` jako pole.
  > Standardní relační DB nemá typ "pole FK". JPA by takový mapping nevyrobila.
- [ ] V obou tabulkách současně, JPA udržuje obě strany synchronizovaně.
  > Ne — DB drží odkaz jen jednou (jinak by hrozila duplicita / nekonzistence). JPA *v paměti* sice udržuje obousměrný pohled, ale uložení v DB je jednostranné.
:::

::: quiz "Mám `Person` s `@OneToOne private Address address;` a `Address` s polem `id`, `street`, `city`. Kdy raději přepnu na `@Embedded`?"
- [x] Když adresa nikdy nestojí samostatně, nepotřebuje vlastní tabulku, vlastní PK ani být indexována odjinud — pak je `@Embeddable` levnější a srozumitelnější.
  > Ano. `@OneToOne` má smysl, když je `Address` plnohodnotná entita (např. ji sdílí více lidí, dotazujete se na ni samostatně). Jinak `@Embeddable` ušetří tabulku, JOIN i mentální zátěž.
- [ ] Nikdy — `@OneToOne` je vždy správně pro 1:1 vztahy.
  > `@OneToOne` je správné pro *vztah*. `@Embedded` je správné pro *vnoření* (kompozici). Z modelového hlediska se liší a kdo to zaměňuje, dělá schémata zbytečně složitá.
- [ ] Když `Address` nemá `@Id`.
  > Embeddable nemá `@Id`, to je pravda. Ale to není *důvod* přejít na embedded — důvodem je sémantika (kompozice vs. asociace).
:::

::: quiz "Default `FetchType` pro `@ManyToOne` je `EAGER`. Proč to v produkci skoro vždy chcete přepnout na `LAZY`?"
- [x] Protože EAGER táhne celý graf rodičovských entit při každém načtení, i když je třeba vůbec nepotřebujete. To narůstá s hloubkou řetězce vztahů (a při větvení do kolekcí se násobí).
  > Ano. Klasický scénář: 1 dotaz na 100 `Car` najednou udělá 100 dalších SELECTů na `Owner` (N+1 problém). LAZY by je vyžádal jen na vyžádání — ideálně přes `JOIN FETCH` při původním dotazu, pokud je opravdu potřebujete.
- [ ] EAGER je deprecated.
  > Není — je to platná možnost. Jen výchozí hodnota není v produkci obvykle vhodná.
- [ ] LAZY šetří síťovou propustnost mezi DB a aplikací.
  > Šetří, ale to není hlavní důvod. Hlavní je *neztratit kontrolu nad tím, co se z DB načítá*. Skrytý EAGER je velmi častý zdroj výkonových problémů.
:::

---

*Zdroj: přednášky PIS — prof. T. Hruška & doc. R. Burget, VUT FIT, přednáška „Objektový model dat", části „Vztahy mezi entitami", „Kaskáda", „Vložené entity", „Slabá entitní množina", „Pořadí u seznamů" (slidy 54, 64–72). Doplněno o doporučenou praxi pro `FetchType` a `mappedBy`.*
