---
title: JPA persistence — Java Bean, entity, persistence.xml
---

Pro datovou vrstvu Jakarta EE aplikace poskytuje **Jakarta Persistence API (JPA)** — standardní rozhraní pro objektově-relační mapování (ORM). Místo psaní SQL pracujete s Java objekty; JPA implementace (typicky Hibernate, EclipseLink) zařídí mapování na tabulky a generování dotazů.

Plné téma JPA (vztahy, dědičnost, dotazy) je detailně rozebráno v navazujících přednáškách o objektovém modelu dat — v subtopicech [[jpa-vztahy]] a [[jpa-dedicnost]]; zde se zaměříme na **základy a integraci s Jakarta EE**.

## Java Bean

Stavebním kamenem JPA jsou *Java Beany* — POJO třídy splňující konvence:

* veřejný bezparametrový konstruktor,
* privátní fieldy s getter/setter páry,
* implementace `Serializable` (volitelná, ale obvyklá).

```java
public class Person {
    private long   id;
    private String name;
    private String surname;
    private Date   born;

    public Person() {}                              // bezparametrový ctor

    public String getName()        { return name; }
    public void   setName(String n){ name = n; }

    // další getter/setter páry…
}
```

### Role Java Beanů

Jeden a tentýž tvar třídy (POJO) může v aplikaci hrát **tři různé role**:

::: svg "Tři role Java Beanu v Jakarta EE aplikaci"
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="160" height="160" rx="8" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.62 0.14 264)"/>
  <text x="100" y="42" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.40 0.14 264)">POJO</text>
  <text x="100" y="58" text-anchor="middle" font-size="10" fill="var(--text-muted)">Plain Old Java Object</text>
  <text x="100" y="95" text-anchor="middle" font-size="10" fill="var(--text)">prostá Javová třída</text>
  <text x="100" y="112" text-anchor="middle" font-size="10" fill="var(--text)">bez nadstavby</text>
  <text x="100" y="145" text-anchor="middle" font-size="9.5" fill="var(--text-faint)" font-family="var(--font-mono)">žádné anotace</text>
  <rect x="190" y="20" width="160" height="160" rx="8" fill="oklch(0.62 0.14 22 / 0.10)" stroke="oklch(0.62 0.14 22)"/>
  <text x="270" y="42" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.42 0.14 22)">DTO</text>
  <text x="270" y="58" text-anchor="middle" font-size="10" fill="var(--text-muted)">Data Transfer Object</text>
  <text x="270" y="95" text-anchor="middle" font-size="10" fill="var(--text)">pro přenos přes API</text>
  <text x="270" y="112" text-anchor="middle" font-size="10" fill="var(--text)">JSON / XML</text>
  <text x="270" y="145" text-anchor="middle" font-size="9.5" fill="var(--text-faint)" font-family="var(--font-mono)">serializuje JAX-RS</text>
  <rect x="360" y="20" width="160" height="160" rx="8" fill="oklch(0.62 0.14 142 / 0.10)" stroke="oklch(0.62 0.14 142)"/>
  <text x="440" y="42" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.40 0.14 142)">Entity</text>
  <text x="440" y="58" text-anchor="middle" font-size="10" fill="var(--text-muted)">JPA persistence</text>
  <text x="440" y="95" text-anchor="middle" font-size="10" fill="var(--text)">mapování na DB</text>
  <text x="440" y="112" text-anchor="middle" font-size="10" fill="var(--text)">řízeno JPA</text>
  <text x="440" y="145" text-anchor="middle" font-size="9.5" fill="var(--text-faint)" font-family="var(--font-mono)">@Entity, @Id, @Column</text>
</svg>
:::

Tytéž getter/setter struktury, ale **role je jiná** — a proto je dobré držet je *jako oddělené třídy*, ne sdílet jednu třídu pro persistenci i pro API. Sdílení je *„příliš pohodlné, dokud se nezačne škálovat"*: změna v DB schématu by jinak prosakovala do veřejného API.

## Entita — JPA anotace

Z POJO se *entita* stane přidáním anotací:

```java
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "person")
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 100)
    private String name;

    private String surname;
    private Date   born;

    public Person() {}

    // gettery a settery…
}
```

* `@Entity` — třída je perzistentní.
* `@Table(name = "person")` — explicitní jméno tabulky (jinak by JPA odvodil z názvu třídy).
* `@Id` — primární klíč.
* `@GeneratedValue` — strategii generování klíče (IDENTITY = `AUTO_INCREMENT` v MySQL, SEQUENCE u Postgres apod.).
* `@Column` — drobné úpravy mapování (nullable, délka, jiný název sloupce).

Detaily mapování vztahů (`@ManyToOne`, `@OneToMany`, `@ManyToMany`), dědičnosti (`@Inheritance`) a dotazování (`@NamedQuery`, JPQL, Criteria API) jsou obsahem navazujících přednášek o JPA.

## persistence.xml — definice perzistenční jednotky

JPA potřebuje vědět, ke které databázi se má připojit a jaké entity tam ukládat. To se říká v `META-INF/persistence.xml`:

```xml
<persistence xmlns="https://jakarta.ee/xml/ns/persistence" version="3.0">
  <persistence-unit name="demoPU" transaction-type="JTA">
    <!-- JNDI jméno datového zdroje konfigurovaného na serveru -->
    <jta-data-source>jdbc/demo</jta-data-source>

    <!-- Volitelně: explicitní seznam entit -->
    <class>cz.vutbr.fit.pis.demo.Person</class>

    <properties>
      <!-- Automatické vytvoření schématu při startu (jen ve vývoji!) -->
      <property name="jakarta.persistence.schema-generation.database.action"
                value="drop-and-create"/>
    </properties>
  </persistence-unit>
</persistence>
```

* **`name`** — identifikátor persistenční jednotky; entity manager se získává podle něj.
* **`jta-data-source`** — JNDI jméno datového zdroje (např. `jdbc/demo`), nakonfigurovaného v serveru.
* **`<property>`** — řízení automatického generování schématu, dialect, logování SQL aj.

## Databázová konektivita — JDBC data source

JPA samo o sobě JDBC připojení neotevírá. Předá to **datovému zdroji**, který je nakonfigurovaný v aplikačním serveru a registrovaný pod JNDI jménem. Aplikace na něj odkazuje pouze tímto jménem — *přenositelnost* mezi prostředími (vývoj, test, produkce) je tak triviální: změníte definici zdroje na serveru, aplikace zůstane beze změny.

V definici datového zdroje se uvádí:

* JDBC ovladač (driver class, např. `org.postgresql.Driver`),
* URL serveru (`jdbc:postgresql://localhost:5432/demo`),
* přihlašovací údaje,
* přiřazené JNDI jméno (`jdbc/demo`),
* případně pool nastavení (max connections, timeout).

### Konfigurace — Open Liberty

V `server.xml` (buď v `wlp/usr/servers/<nazev>/` nebo v `src/main/liberty/config/`):

```xml
<library id="postgresLib">
    <fileset dir="${shared.resource.dir}/jdbc" includes="postgresql-*.jar"/>
</library>

<dataSource id="demoDS" jndiName="jdbc/demo">
    <jdbcDriver libraryRef="postgresLib"/>
    <properties.postgresql databaseName="demo"
                           serverName="localhost" portNumber="5432"
                           user="demo" password="${env.DB_PASSWORD}"/>
</dataSource>
```

### Konfigurace — Payara

Lze přidat datový zdroj přes administrátorské rozhraní (`http://localhost:4848`) nebo přibalit `WEB-INF/glassfish-resources.xml`:

```xml
<resources>
  <jdbc-connection-pool name="demoPool"
                        datasource-classname="org.postgresql.ds.PGSimpleDataSource"
                        res-type="javax.sql.DataSource">
    <property name="databaseName" value="demo"/>
    <property name="serverName"   value="localhost"/>
    <property name="portNumber"   value="5432"/>
    <property name="user"         value="demo"/>
    <property name="password"     value="${ENV=DB_PASSWORD}"/>
  </jdbc-connection-pool>
  <jdbc-resource jndi-name="jdbc/demo" pool-name="demoPool"/>
</resources>
```

::: link "Jakarta Persistence (JPA) — specifikace" "https://jakarta.ee/specifications/persistence/"
:::

::: link "Hibernate ORM — uživatelská příručka" "https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html"
:::

::: link "Open Liberty — Relational database connections (data sources)" "https://openliberty.io/docs/latest/relational-database-connections-JDBC.html"
:::

::: quiz "Proč je dobré rozdělit DTO (pro API) a Entity (pro DB) na dvě různé třídy?"
- [x] Aby změna DB schématu nemusela hned znamenat změnu veřejného API a naopak.
  > Přesně. Oddělení izoluje versioning DB od versioning API a umožňuje skrýt nebo přidat pole na jedné straně bez dopadu na druhou.
- [ ] Aby JPA mohla správně mapovat entitu.
  > JPA si umí poradit s libovolnou anotovanou třídou. Důvod je architektonický, ne technický.
- [ ] Aby DTO mohlo mít gettery, zatímco Entity ne.
  > Obě potřebují gettery/settery — to je požadavek serializace i ORM.
:::

::: quiz "Aplikace v `persistence.xml` odkazuje na `jdbc/demo`. Co s tím musí udělat administrátor v produkci?"
- [x] Vytvořit na produkčním serveru datový zdroj se stejným JNDI jménem `jdbc/demo`, ale s produkčními parametry (URL, credentials).
  > Ano — to je celý smysl JNDI nepřímosti. Aplikace zůstává beze změny mezi prostředími.
- [ ] Editovat `persistence.xml` v rozbaleném WARu a změnit hodnotu.
  > To by porušilo přenositelnost a vedlo by k odlišnému artefaktu mezi prostředími.
- [ ] Nic — JNDI jméno je hard-coded mapování na lokální DB.
  > JNDI je right-thru jméno; mapování na konkrétní DB je vždy konfigurace serveru.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, VUT FIT, část „Persistence dat" v přednášce „Backend a platforma Jakarta EE".*
