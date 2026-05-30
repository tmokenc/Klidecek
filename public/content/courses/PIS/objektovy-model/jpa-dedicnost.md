---
title: JPA dědičnost — strategie mapování do relační databáze
---

[[dedicnost-modelovani|V teoretickém objektovém modelu]] je dědičnost přirozená — typ B *zahrnuje* všechny vlastnosti svých předků plus diferenci. Při ukládání do **relační databáze** ale narazíme na zásadní mismatch: relační schéma *dědičnost přímo nepodporuje* — máme jen ploché tabulky a cizí klíče.

Existují čtyři způsoby, jak v JPA reprezentovat hierarchii tříd v relační DB. Každý je jiný kompromis mezi *integritou*, *efektivitou dotazů* a *strukturou schématu*. Tato kapitola je projde a porovná.

## Modelová situace

Použijeme klasický příklad z přednášky: hierarchie publikací s autory.

```
Author  ─authors(M:N)─  Publication  ───is───  Book      (+ pages)
                            ▲
                            └──is───  BlogPost  (+ url)
```

Třída `Publication` má id, title, version, publishingDate a vztah k `Author`. Z ní dědí `Book` (přidává `pages`) a `BlogPost` (přidává `url`). Otázka: *jak tyto tři třídy uložit?*

::: viz jpa-inheritance "Klikněte na strategii a sledujte, jak se promítne do relačního schématu."
:::

## Strategie 1 — `@MappedSuperclass` (pouze sdílí pole)

Nejjednodušší případ. Společné vlastnosti dáme do abstraktní třídy s anotací `@MappedSuperclass`, kterou *konkrétní entity rozšiřují*:

```java
@MappedSuperclass
public abstract class Publication {
    @Id
    protected Long id;
    protected String title;
    protected Integer version;
    protected Date publishingDate;
    // …
}

@Entity
public class Book extends Publication {
    private int pages;
    // …
}

@Entity
public class BlogPost extends Publication {
    private String url;
    // …
}
```

Výsledné schéma:

| Tabulka | Sloupce |
|---|---|
| `book` | id (PK), title, version, publishingdate, **pages** |
| `blogpost` | id (PK), title, version, publishingdate, **url** |
| **(žádná `publication`)** | |

**Vlastnosti:**

* `Publication` *není entita* — nemá tabulku, nelze ji dotazovat, nelze definovat **vztah `Publication ↔ Author`** (vztahy se dělají jen mezi entitami).
* Vlastnosti se „zkopírují" do tabulky každého potomka — JPA nepotřebuje žádnou metadata o hierarchii v DB.
* Vhodné, když chcete *jen sdílet kód* (poli, gettery, settery) mezi entitami, ale dědičnost *není doménová* — nepotřebujete polymorfní dotazy.

## Strategie 2 — `TABLE_PER_CLASS` (tabulka pro každou *konkrétní* třídu)

Téměř totéž jako `@MappedSuperclass`, ale **Publication je *entita*** se svojí (volitelnou) tabulkou. Vlastnosti se *kopírují* do tabulek potomků.

```java
@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public abstract class Publication {
    @Id
    protected Long id;
    protected String title;

    @ManyToMany
    @JoinTable(name = "publication_author", …)
    private Set<Author> authors;
    // …
}

@Entity
public class Book extends Publication {
    private int pages;
}

@Entity
public class BlogPost extends Publication {
    private String url;
}
```

Schéma:

| Tabulka | Sloupce |
|---|---|
| `book` | id, title, version, publishingdate, **pages** |
| `blogpost` | id, title, version, publishingdate, **url** |
| `publication_author` | publication_id, author_id |
| `author` | id, firstname, lastname, version |

**Vlastnosti:**

* `Publication` je entita → *lze* definovat vztah `Publication ↔ Author` (jenže pomocná tabulka `publication_author` odkazuje na id, které ovšem fyzicky existuje *jen v `book` nebo v `blogpost`* — to je problém referenční integrity!).
* Dotaz nad `Publication` (`SELECT p FROM Publication p`) se musí přeložit jako **UNION ALL nad `book` a `blogpost`** — *neefektivní*.
* Sekvence ID musí být sdílená (jinak by mohly vzniknout duplicitní `id` napříč potomky).

V praxi se `TABLE_PER_CLASS` *moc nepoužívá* — výhodu mapped-superclass nepřináší a polymorfní dotazy jsou drahé.

## Strategie 3 — `SINGLE_TABLE` (jedna tabulka, diskriminátor)

Všechny entity z hierarchie sdílejí **jednu tabulku**. Sloupec **diskriminátoru** říká, jakého typu daný řádek je.

```java
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "PublicationType")
public abstract class Publication {
    @Id
    protected Long id;
    protected String title;

    @ManyToMany
    @JoinTable(name = "publication_author", …)
    private Set<Author> authors;
}

@Entity
@DiscriminatorValue("Book")
public class Book extends Publication {
    private int pages;
}

@Entity
@DiscriminatorValue("Blog")
public class BlogPost extends Publication {
    private String url;
}
```

Schéma:

| Tabulka | Sloupce |
|---|---|
| `publication` | id, **PublicationType** (diskriminátor), title, version, publishingdate, pages, url |
| `publication_author` | publication_id, author_id |
| `author` | id, firstname, lastname, version |

**Vlastnosti:**

| Aspekt | Hodnocení |
|---|---|
| Dotazování | **Velmi efektivní** — žádné JOINy, žádné UNIONy. Polymorfní `SELECT p FROM Publication p` je obyčejné `SELECT … FROM publication`. Konkrétní typ `SELECT b FROM Book b` jen přidá `WHERE PublicationType = 'Book'`. |
| Vztahy | Snadné — pomocná tabulka odkazuje na *jediné* `publication.id`. |
| Integrita | **Slabší** — vlastnosti specifické pro `Book` (`pages`) nelze udělat `NOT NULL`, protože `BlogPost` je v tabulce má `NULL`. |
| Pamět/disk | Hodnoty nevyužitých sloupců jsou `NULL` — řídké tabulky mohou zabírat víc, než by musely. |

**Toto je defaultní volba JPA**, pokud `@Inheritance` neuvedete. V praxi je to *nejčastěji nejlepší kompromis* — efektivita dotazování bije výhody čistšího schématu.

## Strategie 4 — `JOINED` (tabulka pro každou třídu, společné pole nahoře)

Hierarchie typů se zrcadlí jako **hierarchie tabulek**: jedna tabulka pro `Publication`, jedna pro `Book` (jen `pages` + FK do `publication`), jedna pro `BlogPost` (jen `url` + FK do `publication`).

```java
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Publication {
    @Id
    protected Long id;
    protected String title;

    @ManyToMany
    @JoinTable(name = "publication_author", …)
    private Set<Author> authors;
}

@Entity
public class Book extends Publication {
    private int pages;
}

@Entity
public class BlogPost extends Publication {
    private String url;
}
```

Schéma:

| Tabulka | Sloupce |
|---|---|
| `publication` | id (PK), title, version, publishingdate |
| `book` | id (PK + FK → publication.id), **pages** |
| `blogpost` | id (PK + FK → publication.id), **url** |
| `publication_author` | publication_id, author_id |
| `author` | id, firstname, lastname, version |

**Vlastnosti:**

| Aspekt | Hodnocení |
|---|---|
| Dotazování | **Pomalejší** — všechno potřebuje JOIN. `SELECT b FROM Book b` = JOIN tabulek `book` a `publication`. Polymorfní `SELECT p FROM Publication p` musí JOINnout vše. |
| Vztahy | Snadné — všechny FK mířímí do `publication.id`. |
| Integrita | **Nejlepší** — sloupce specifické pro `Book` (`pages`) mohou být `NOT NULL`, validace per-typ je čistá. |
| Pamět/disk | Žádné null sloupce. |
| Strukturně | Schéma „věrně odráží" hierarchii tříd — pro DBA srozumitelné. |

`JOINED` se vyplatí v doméně, kde **integrita dat je důležitější než výkon dotazů** (finance, zdravotnictví). Pro běžné webové aplikace je obvykle `SINGLE_TABLE` lepší.

## Srovnávací tabulka

| | `@MappedSuperclass` | `TABLE_PER_CLASS` | `SINGLE_TABLE` ⭐ | `JOINED` |
|---|---|---|---|---|
| Předek je entita? | ❌ | ✅ | ✅ | ✅ |
| Tabulek v DB | N (jen pro potomky) | N (jen pro potomky) | **1** | N+1 (i pro předka) |
| Polymorfní dotaz | ❌ není možný | ⚠️ UNION ALL | ✅ jednoduchý SELECT | ⚠️ JOIN přes vše |
| Vztahy přes předka | ❌ | ⚠️ problém s FK | ✅ | ✅ |
| `NOT NULL` na potomky | ✅ (v jejich tabulce) | ✅ | ❌ | ✅ |
| Defaultní strategie | — | — | ✅ | — |
| **Kdy zvolit** | Sdílet kód bez polymorfismu | Málokdy | **Obvyklá volba** | Strict integrita, čisté schéma |

## Pokročilejší poznámky

* **Hluboká hierarchie** (3+ úrovně) zvyšuje cenu *jakékoliv* strategie. `SINGLE_TABLE` má hodně sloupců, `JOINED` má hodně JOINů, `TABLE_PER_CLASS` má hodně UNIONů. Pokud to lze, snižte hloubku.
* **Multiple inheritance**: Java ji nepodporuje, JPA tedy taky ne. Hierarchie tříd musí být *strom*. (Můžete simulovat `interface` s default methods, ale data tečou jen v jedné linii.)
* **Mezi-strategie** v rámci jedné hierarchie (`@Inheritance(strategy=…)` pouze u kořene): JPA *jako standard* nepovoluje míchání. Některé implementace (Hibernate) ano, ale je to spíše past než feature.
* **`@DiscriminatorValue("…")`** je u `SINGLE_TABLE` *volitelná*. Pokud ji neuvedete, provider doplní defaultní hodnotu — typicky *jednoduchý (nekvalifikovaný) název entity*. JPA spec toto chování negarantuje napříč implementacemi, proto se doporučuje hodnotu uvádět explicitně kvůli přenositelnosti.

## Co si odnést

* JPA nabízí **4 strategie mapování dědičnosti**: `@MappedSuperclass`, `TABLE_PER_CLASS`, `SINGLE_TABLE` (default), `JOINED`.
* **`SINGLE_TABLE`** je defaultní a pro většinu aplikací nejlepší volba — *efektivní dotazy*, snadné vztahy.
* **`JOINED`** volte, když potřebujete striktní integritu a *čisté schéma odpovídající hierarchii*.
* **`@MappedSuperclass`** = pouze sdílení polí, žádná entita-rodič, žádné polymorfní dotazy.
* **`TABLE_PER_CLASS`** většinou nepoužívejte — výhody jiných strategií nepřináší.

::: link "Thoughts on Java — Complete Guide to Inheritance Strategies in JPA & Hibernate" "https://thoughts-on-java.org/complete-guide-inheritance-strategies-jpa-hibernate/"
:::

::: link "Jakarta Persistence — Inheritance Mapping (oficiální spec)" "https://jakarta.ee/specifications/persistence/"
:::

::: link "Baeldung — Hibernate Inheritance Mapping" "https://www.baeldung.com/hibernate-inheritance"
:::

::: link "Vlado Mihalcea — The best way to map a `@DiscriminatorColumn` with JPA and Hibernate" "https://vladmihalcea.com/inheritance-discriminator-formula-jpa-hibernate/"
:::

::: quiz "Hierarchie `Publication ← Book, BlogPost`. Aplikace často dotazuje `SELECT p FROM Publication p WHERE p.title LIKE ?` (napříč všemi typy). Která strategie je nejlepší?"
- [x] `SINGLE_TABLE` — všechny záznamy jsou v jedné tabulce, dotaz je triviální `SELECT … FROM publication WHERE title LIKE ?`. Žádné JOINy, žádné UNIONy.
  > Ano. Polymorfní dotazy jsou srdce této hierarchie a `SINGLE_TABLE` je dělá nejlevněji.
- [ ] `TABLE_PER_CLASS` — vyhne se NULL sloupcům.
  > Vyhne, ale za cenu UNION ALL — který je u větších datových objemů řádově dražší než filtr nad jednou tabulkou.
- [ ] `@MappedSuperclass` — protože je nejjednodušší.
  > S `@MappedSuperclass` nemůžete dotazovat `Publication` jako celek — není to entita. Tato strategie by neumožnila *právě ten dotaz*, který popsala otázka.
:::

::: quiz "Vaše doménová pravidla říkají, že `Book.pages` MUSÍ být NOT NULL. Která strategie to umožní?"
- [x] `JOINED` — `pages` je ve své vlastní tabulce `book`, takže `NOT NULL` constraint je naprosto v pořádku.
  > Ano. To je hlavní výhoda `JOINED` — integritní omezení per-podtřídu zůstávají platná.
- [ ] `SINGLE_TABLE` — stačí přidat `@Column(nullable = false)` na `pages`.
  > To nepůjde. Tabulka `publication` má `pages` i pro řádky reprezentující `BlogPost`, kde `pages` nemá smysl a je `NULL`. `NOT NULL` by zabránilo BlogPosty vůbec uložit.
- [ ] `TABLE_PER_CLASS` — taky to umožní, ale potřebujete `@MappedSuperclass`.
  > `TABLE_PER_CLASS` má `pages` skutečně jen v tabulce `book` a NOT NULL by tam fungoval. Otázka má více správných odpovědí, ale `JOINED` je čistší a u dotazování polymorfních vztahů lepší.
:::

---

*Zdroj: přednášky PIS — prof. T. Hruška & doc. R. Burget, VUT FIT, přednáška „Objektový model dat", části „Mapped Superclass", „Tabulka pro každou třídu", „Jediná tabulka", „Joined" (slidy 73–82). Hloubkové doporučené čtení: Thorben Janssen — Complete Guide to Inheritance Strategies in JPA & Hibernate.*
