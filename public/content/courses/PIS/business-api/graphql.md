---
title: GraphQL — typovaná aplikační rozhraní
---

**GraphQL** je alternativa k REST pro vystavení business vrstvy. Vyvinula ho Facebook (2012, open-source 2015) jako reakci na problémy REST API v mobilních klientech. Hlavní motivace: **klient potřebuje v různých situacích různá data**.

## Motivace — co je špatně s REST

Představte si endpoint `GET /api/persons/{id}` v REST. Server vždy vrátí *stejnou strukturu* — všechny atributy osoby. Problém:

* Na stránce **„seznam osob"** potřebuji *jen jméno a fotku*. Server pošle celý profil včetně všech adres a historie → **redundance dat**.
* Na stránce **„detail osoby"** potřebuji jméno + adresy + posledních 10 transakcí. Server vrátí osobu (jeden požadavek), ale pak musím vyžádat zvlášť adresy (druhý request) a transakce (třetí request) → **více dotazů**, neefektivní, klient má složitou logiku synchronizace.

Pevný tvar odpovědi REST endpointu pak vede k jednomu ze dvou opačných problémů:

* **Over-fetching** — server vrátí víc dat, než klient potřebuje (mrhání bandwidth, zvlášť bolestivé na mobilech).
* **Under-fetching** — klient musí udělat několik dotazů, aby složil to, co potřebuje (latence, složitost).

GraphQL řeší obojí najednou: **klient v dotazu specifikuje *tvar* požadované odpovědi**.

## Princip GraphQL

* **Popis datového modelu API** ve speciálním jazyce **SDL** (*Schema Definition Language*).
* **Dotaz na API specifikuje *požadovaný tvar* odpovědi** — klient si vybírá pole.
* **Předvídatelný výsledek** — server vrátí *přesně* to, co klient požádal, ve stejné struktuře.

::: svg "REST vs. GraphQL — fixní vs. shape-by-query odpověď"
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="20" width="255" height="170" rx="6" fill="oklch(0.62 0.14 22 / 0.08)" stroke="oklch(0.62 0.14 22)"/>
  <text x="137" y="40" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.42 0.14 22)">REST</text>
  <text x="22" y="62" font-size="11.5" fill="var(--text)" font-family="var(--font-mono)">GET /api/persons/42</text>
  <text x="22" y="82" font-size="11" fill="var(--text-muted)">↓ vždy stejná struktura ↓</text>
  <text x="22" y="102" font-size="11" fill="var(--text)" font-family="var(--font-mono)">{ id, name, age, born,</text>
  <text x="22" y="118" font-size="11" fill="var(--text)" font-family="var(--font-mono)">&nbsp;&nbsp;addresses, transactions,</text>
  <text x="22" y="134" font-size="11" fill="var(--text)" font-family="var(--font-mono)">&nbsp;&nbsp;avatar, …, …, … }</text>
  <text x="22" y="158" font-size="11" fill="oklch(0.42 0.14 22)" font-style="italic">over-fetch nebo</text>
  <text x="22" y="174" font-size="11" fill="oklch(0.42 0.14 22)" font-style="italic">několik dotazů</text>
  <rect x="275" y="20" width="255" height="170" rx="6" fill="oklch(0.62 0.14 142 / 0.08)" stroke="oklch(0.62 0.14 142)"/>
  <text x="402" y="40" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.14 142)">GraphQL</text>
  <text x="287" y="62" font-size="11.5" fill="var(--text)" font-family="var(--font-mono)">{ findPerson(id: 42) {</text>
  <text x="287" y="78" font-size="11.5" fill="var(--text)" font-family="var(--font-mono)">&nbsp;&nbsp;name, age,</text>
  <text x="287" y="94" font-size="11.5" fill="var(--text)" font-family="var(--font-mono)">&nbsp;&nbsp;cars { type } } }</text>
  <text x="287" y="118" font-size="11" fill="var(--text-muted)">↓ přesně tvar dotazu ↓</text>
  <text x="287" y="138" font-size="11" fill="var(--text)" font-family="var(--font-mono)">{ "findPerson":</text>
  <text x="287" y="154" font-size="11" fill="var(--text)" font-family="var(--font-mono)">&nbsp;&nbsp;{name, age, cars:[…]}}</text>
  <text x="287" y="178" font-size="11" fill="oklch(0.40 0.14 142)" font-style="italic">přesně co klient potřebuje</text>
</svg>
:::

## Datový model GraphQL

GraphQL definuje datový model **API** (nikoli serverové aplikace — model může abstrahovat několik backendů).

### Základní typy

* **Jednoduché**: `Int`, `Float`, `String`, `Boolean`, `ID` (identifikátor), `enum`.
* **Uživatelské typy** (*types*) = struktury s vlastnostmi (jméno, parametry, typ vlastnosti).
* **Kolekce**: `[T]` znamená seznam (pole) prvků typu T.
* **Nullable / non-null**: `T!` znamená, že hodnota *musí* být přítomna.

### Speciální root typy

GraphQL definuje *vstupní body* do API:

* **`Query`** — operace pro **čtení dat**,
* **`Mutation`** — operace pro **změnu dat**,
* **`Subscription`** — operace pro **odebírání změn v reálném čase** (přes WebSocket).

V přednášce se v `concept` notaci ujasní, jak se to liší od OO modelu: `Query` a `Mutation` nejsou *typy* v doménovém smyslu, ale *fasáda nad business operacemi*.

## Příklad — schema

```graphql
type Person {
    id: ID!
    name: String!
    surname: String
    born: String
    age: Int!
    posts: [Post!]!
}

type Car {
    type: String!
    reg: String!
    owner: Person!
}

input PersonInput {
    id: ID
    name: String
    surname: String
    born: String
}

type Query {
    allPersons: [Person!]!
    findPerson(name: String!): Person!
}

type Mutation {
    createPerson(name: String!, age: Int!): Person!
    updatePerson(p: PersonInput): Person!
}
```

* `Person` má povinné `name` a `age`, pole `posts` (povinné, neprázdné).
* `Car` má vztah na `Person` přes `owner`.
* `PersonInput` je vstupní (`input`) typ pro předání dat do mutace.
* Root `Query` vystavuje dvě operace; `Mutation` dvě.

## Dotazy

Klient v dotazu *vybírá*, jaká pole chce. Stejný endpoint pak vrací různé struktury podle dotazu.

### Jednoduchý dotaz

```graphql
{ allPersons { name } }
```

Odpověď:

```json
{
  "data": {
    "allPersons": [
      { "name": "Jan" },
      { "name": "Karolína" },
      { "name": "Alice" }
    ]
  }
}
```

### Dotaz s parametry a vnořením

```graphql
{
  findPerson(name: "James") {
    name
    age
    cars { type }
  }
}
```

Odpověď:

```json
{
  "data": {
    "findPerson": {
      "name": "James",
      "age": 28,
      "cars": [
        { "type": "Fiat" },
        { "type": "Tesla" }
      ]
    }
  }
}
```

Server vrátí přesně to, co klient požádal — žádné nadbytečné atributy, ale i žádný extra dotaz.

## Mutace — změny dat

Mutace mají vlastní speciální root `Mutation`:

```graphql
mutation AddPerson($person: PersonInput) {
    updatePerson(p: $person) {
        id
    }
}
```

s variables:

```json
{
  "person": {
    "born": "1991-06-03T22:00:00Z[UTC]",
    "id": 1154731299,
    "name": "Sylvester",
    "surname": "Stallone"
  }
}
```

Odpověď:

```json
{
  "data": {
    "updatePerson": {
      "id": 1154731299
    }
  }
}
```

Po mutaci klient *opět* specifikuje, jaká pole z výsledku chce zpět — třeba jen `id`.

## GraphQL přes HTTP

GraphQL **nemá** vlastní transport — jezdí přes HTTP s **jediným endpointem**.

### Odeslání přes GET

```
http://myapi/graphql?query={me{name}}
```

Funguje, ale URL může být dlouhé.

### Odeslání přes POST

* Content-Type **`application/json`**:

  ```json
  { "query": "{me{name}}" }
  ```

  s proměnnými:

  ```json
  { "query": "mutation … ", "variables": { "name": "Jan" } }
  ```

* Content-Type **`application/graphql`** (jen tělo dotazu):

  ```
  {me{name}}
  ```

V praxi se nejčastěji používá POST + JSON.

## Implementace v Javě — MicroProfile GraphQL

Pro Javu existuje [**MicroProfile GraphQL**](https://microprofile.io/specifications/microprofile-graphql/) — standard pro tvorbu GraphQL API s anotacemi (podobně jako JAX-RS pro REST).

### Dependence v `pom.xml`

```xml
<dependency>
    <groupId>org.eclipse.microprofile.graphql</groupId>
    <artifactId>microprofile-graphql-api</artifactId>
    <version>2.0</version>
    <scope>provided</scope>
</dependency>
```

V Open Liberty se navíc povolí feature:

```xml
<feature>mpGraphQL-2.0</feature>
```

### Definice API

```java
@GraphQLApi
@RequestScoped
public class Api {

    @Inject
    private PersonManager personMgr;

    @Query
    @Description("Gets the complete list of people")
    public List<Person> getPeople() {
        return personMgr.findAll();
    }

    @Query
    public Person findPerson(@Name("name") String name) {
        return personMgr.findByName(name);
    }

    @Mutation
    public Person createPerson(@Name("name") String name, @Name("age") int age) {
        return personMgr.create(name, age);
    }
}
```

* `@GraphQLApi` — třída obsahuje GraphQL endpointy.
* `@Query` / `@Mutation` — typ operace.
* `@Name("…")` — pojmenování parametru ve schématu (kdyby se měl lišit od názvu v Javě).
* `@Description("…")` — popis pro generovanou schémovou dokumentaci.

### Datové typy

Datové typy jsou **standardní Java POJO třídy**. MicroProfile GraphQL z nich automaticky odvodí GraphQL types:

```java
public class Person {
    private String name;
    private int age;
    private List<Car> cars;
    // gettery, settery …
}
```

Volitelně lze nastavit mapování:

* **jmen tříd** — `@Type("…")`,
* **vlastností** — `@Name("…")`,
* **popisu** — `@Description("…")`.

## Autentizace v GraphQL

GraphQL používá *stejné* mechanismy autentizace jako REST. Pokud aplikace má povolený MicroProfile JWT, stejné anotace fungují i nad GraphQL:

```java
@GraphQLApi
@LoginConfig(authMethod = "MP-JWT", realmName = "MP-JWT")
@RequestScoped
public class Api {

    @Inject
    private PersonManager personMgr;

    @Query
    @RolesAllowed("admin")                       // jen admin
    @Description("Gets the complete list of people")
    public List<Person> getPeople() {
        return personMgr.findAll();
    }
}
```

Konfigurace JWT je tatáž jako v [[rest-autentizace|REST autentizaci]] — `META-INF/microprofile-config.properties`.

## Implementace — klient a server

### Klientská strana

* **Žádná speciální podpora není nutná** — stačí umět zasílat POST požadavky (nebo GET).
* Existují klientské knihovny (Apollo Client, Relay, Urql v JS) pro caching, optimistic updates atd. — užitečné, ale ne povinné.

### Serverová strana

* **Definice datových struktur a dotazů** (schéma).
* **Zpracování SDL** nebo **generování SDL z kódu** (jak to dělá MicroProfile GraphQL).
* **Mnoho knihoven**: viz [graphql.org/code](https://graphql.org/code/) — Java (Eclipse MicroProfile, graphql-java), Node.js, Python, Go, Rust, ….

### Demo {tier=extra}

Open Liberty Guide: [openliberty.io/guides/microprofile-graphql.html](https://openliberty.io/guides/microprofile-graphql.html).

## GraphQL vs. REST — kdy co

| | REST | GraphQL |
|---|---|---|
| **Vstupní bod** | Mnoho endpointů (jeden na zdroj) | Jeden endpoint (`/graphql`) |
| **Tvar odpovědi** | Fixní (server určuje) | Variabilní (klient určuje) |
| **Caching** | Snadný (HTTP cache nad GET) | Složitější (POST není cachovaný) |
| **Hloubka dotazu** | Klient řetězí požadavky | Server jedním dotazem |
| **Verzování** | URL nebo header (`/v2/`) | Evolutivní schéma (deprecation polí) |
| **Učební křivka** | Mírná | Strmější (SDL, resolvery) |
| **Vhodné pro** | Veřejná API, jednoduché CRUD, server-server | Mobilní klienty, složité UI, dashboardy s heterogenními daty |

Mnohé moderní systémy provozují *obě* — REST pro veřejné a server-server, GraphQL pro vnitřní webové/mobilní klienty (např. GitHub, Shopify).

::: link "GraphQL — oficiální specifikace" "https://graphql.org/"
:::

::: link "MicroProfile GraphQL — specifikace" "https://microprofile.io/specifications/microprofile-graphql/"
:::

::: link "Open Liberty Guide — Optimizing services with MicroProfile GraphQL" "https://openliberty.io/guides/microprofile-graphql.html"
:::

::: link "Apollo Client (JS GraphQL klient)" "https://www.apollographql.com/docs/react/"
:::

::: link "Lee Byron — GraphQL: A data query language (původní článek Facebook, 2015)" "https://engineering.fb.com/2015/09/14/core-infra/graphql-a-data-query-language/"
:::

::: quiz "Klient potřebuje pro mobilní aplikaci načíst seznam 50 osob jen se jménem (kvůli šetření dat). Endpoint REST vrací plný objekt s 30 atributy. Která strategie GraphQL řeší tento problém nejlépe?"
- [x] Dotaz `{ allPersons { name } }` — server vrátí pouze požadované pole `name` pro každou osobu.
  > Ano. To je definující vlastnost GraphQL: klient si bere jen co potřebuje, žádný over-fetching.
- [ ] Vytvořit více endpointů typu `/api/persons-only-names`.
  > To by zacementovalo REST schéma a vytvořilo by „endpoint explosion". GraphQL právě tomuto problému předchází.
- [ ] Pro každou osobu volat `/api/persons/{id}/name` separátně.
  > To je horší — 50 requestů místo jednoho. Klasický under-fetching.
:::

::: quiz "Pro change-data operace v GraphQL používáme …"
- [x] `Mutation` root typ — odlišuje *čtení* od *zápisu*. Klient musí explicitně použít `mutation { … }` před dotazem.
  > Ano. To je sémantický oddělovač, který umožňuje serveru aplikovat různé politiky (např. autorizaci, validaci) na zápisové operace.
- [ ] `Query` root, jenom s argumenty.
  > GraphQL vyžaduje oddělené root typy. Provádět změny přes Query je *technicky* možné, ale porušuje očekávané sémantické záruky (Query musí být side-effect-free).
- [ ] HTTP PUT s GraphQL tělem.
  > GraphQL používá vždy POST (nebo GET pro čtení), ne PUT. Vzpomeňme: GraphQL je nad HTTP, ale neimituje REST sémantiku.
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=eIQh02xuVw4" "GraphQL Explained in 100 Seconds" "Fireship"
:::

*Zdroj: přednášky PIS — doc. R. Burget, VUT FIT, část „GraphQL — typovaná aplikační rozhraní" v přednášce „Business vrstva a API" (slidy 33–44).*
