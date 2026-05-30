---
title: Alternativní platformy — Spring, .NET, PHP, Node.js
---

Předchozí podkapitola ([[prezentacni-vrstva]]) ukázala serverovou prezentační vrstvu v *Jakartě EE* — Servlet, JSP, Facelets, JSF. Jakarta EE ale není jediný způsob, jak postavit IS. Klíčové pozorování přednášky: **architektonické vzory (DI, ORM, MVC, REST) jsou portovatelné** napříč platformami. Co se mění je *jazyk* a *konkrétní knihovny*, ne *role* jednotlivých komponent.

::: svg "Mapování architektonických vrstev mezi platformami — stejné role, jiné nástroje"
<svg viewBox="0 0 570 220" xmlns="http://www.w3.org/2000/svg">
  <text x="60" y="22" font-size="11" font-weight="600" fill="var(--text-muted)">Vrstva</text>
  <text x="180" y="22" font-size="11" font-weight="600" fill="oklch(0.40 0.18 22)">Java/JEE</text>
  <text x="270" y="22" font-size="11" font-weight="600" fill="oklch(0.40 0.18 142)">Spring</text>
  <text x="350" y="22" font-size="11" font-weight="600" fill="oklch(0.40 0.18 264)">.NET Core</text>
  <text x="430" y="22" font-size="11" font-weight="600" fill="oklch(0.40 0.18 80)">PHP</text>
  <text x="500" y="22" font-size="11" font-weight="600" fill="oklch(0.40 0.18 340)">Node.js</text>

  <line x1="20" y1="32" x2="562" y2="32" stroke="var(--line)" stroke-width="0.5"/>

  <text x="20" y="55" font-size="11" fill="var(--text)">DB / ORM</text>
  <text x="180" y="55" font-size="10" fill="var(--text)" font-family="var(--font-mono)">JPA/Hibernate</text>
  <text x="270" y="55" font-size="10" fill="var(--text)" font-family="var(--font-mono)">Spring Data</text>
  <text x="350" y="55" font-size="10" fill="var(--text)" font-family="var(--font-mono)">EF Core</text>
  <text x="430" y="55" font-size="10" fill="var(--text)" font-family="var(--font-mono)">Doctrine</text>
  <text x="500" y="55" font-size="10" fill="var(--text)" font-family="var(--font-mono)">Sequelize</text>

  <text x="20" y="80" font-size="11" fill="var(--text)">DI</text>
  <text x="180" y="80" font-size="10" fill="var(--text)" font-family="var(--font-mono)">CDI / EJB</text>
  <text x="270" y="80" font-size="10" fill="var(--text)" font-family="var(--font-mono)">@Autowired</text>
  <text x="350" y="80" font-size="10" fill="var(--text)" font-family="var(--font-mono)">IServiceColl.</text>
  <text x="430" y="80" font-size="10" fill="var(--text)" font-family="var(--font-mono)">framework DI</text>
  <text x="500" y="80" font-size="10" fill="var(--text)" font-family="var(--font-mono)">npm pkg</text>

  <text x="20" y="105" font-size="11" fill="var(--text)">Web / API</text>
  <text x="180" y="105" font-size="10" fill="var(--text)" font-family="var(--font-mono)">JAX-RS / JSF</text>
  <text x="270" y="105" font-size="10" fill="var(--text)" font-family="var(--font-mono)">Spring MVC</text>
  <text x="350" y="105" font-size="10" fill="var(--text)" font-family="var(--font-mono)">ASP.NET Core</text>
  <text x="430" y="105" font-size="10" fill="var(--text)" font-family="var(--font-mono)">Laravel/Symf.</text>
  <text x="500" y="105" font-size="10" fill="var(--text)" font-family="var(--font-mono)">Express</text>

  <text x="20" y="130" font-size="11" fill="var(--text)">Šablony</text>
  <text x="180" y="130" font-size="10" fill="var(--text)" font-family="var(--font-mono)">Facelets</text>
  <text x="270" y="130" font-size="10" fill="var(--text)" font-family="var(--font-mono)">Thymeleaf</text>
  <text x="350" y="130" font-size="10" fill="var(--text)" font-family="var(--font-mono)">Razor</text>
  <text x="430" y="130" font-size="10" fill="var(--text)" font-family="var(--font-mono)">Blade/Twig</text>
  <text x="500" y="130" font-size="10" fill="var(--text)" font-family="var(--font-mono)">Pug/EJS</text>

  <text x="20" y="155" font-size="11" fill="var(--text)">Server</text>
  <text x="180" y="155" font-size="10" fill="var(--text)" font-family="var(--font-mono)">Liberty/WildFly</text>
  <text x="270" y="155" font-size="10" fill="var(--text)" font-family="var(--font-mono)">embedded Tomcat</text>
  <text x="350" y="155" font-size="10" fill="var(--text)" font-family="var(--font-mono)">Kestrel</text>
  <text x="430" y="155" font-size="10" fill="var(--text)" font-family="var(--font-mono)">Apache+modPHP</text>
  <text x="500" y="155" font-size="10" fill="var(--text)" font-family="var(--font-mono)">node proces</text>

  <text x="270" y="195" text-anchor="middle" font-size="10" fill="var(--text-faint)" font-style="italic">Stejné architektonické pojmy — různá pojmenování a jiný runtime.</text>
</svg>
:::

## Java mimo Jakarta EE: Spring & Spring Boot

**Spring Framework** vznikl v roce 2003 jako reakce na komplikovanost EJB 2.x. Jeho klíčová idea: **POJO** (Plain Old Java Object) bez závislosti na frameworku + *kontainer DI*, který POJO svazuje. Nemusíte rozšiřovat speciální základní třídy, anotace stačí.

### Spring core — Dependency Injection

```java
@Service
public class OrderService {

    private final InventoryRepository inventoryRepo;

    public OrderService(InventoryRepository repo) {
        this.inventoryRepo = repo;     // constructor injection
    }
}

@Configuration
public class AppConfig {
    @Bean
    public InventoryRepository inventoryRepo(DataSource ds) {
        return new InventoryRepository(ds);
    }
}
```

Anotace `@Service`, `@Component`, `@Repository` označí *bean*. Spring kontainer při startu skenuje classpath, najde anotované třídy a sestaví dependency graph.

Spring podporuje stejné tři způsoby injekce jako CDI — *constructor* (preferované), *field*, *setter* — viz [[business-implementace]].

### Spring MVC — webová vrstva

**Spring MVC** je MVC framework podobný JAX-RS:

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    public Order create(@RequestBody OrderDto dto) {
        return service.createOrder(dto);
    }

    @GetMapping("/{id}")
    public Order get(@PathVariable Long id) {
        return service.findById(id);
    }
}
```

Spring MVC pracuje s *Front Controller* (`DispatcherServlet`) — všechny požadavky jdou nejprve sem, ten je *routuje* na odpovídající handler (controller method) na základě anotací `@RequestMapping` / `@GetMapping` / atd.

### Spring Boot — opinionated platforma

Spring sám o sobě je modulární a vyžaduje hodně konfigurace. **Spring Boot** přidává:

* **„Server uvnitř aplikace"** — Tomcat (nebo Jetty/Undertow) jako embedded knihovna, ne externí kontainer. Výsledkem je *thin-WAR* nebo *fat-JAR* s `main()` metodou.
* **Auto-konfigurace** — na základě classpath Spring Boot detekuje, co je k dispozici (JPA driver, security knihovna, …) a *sám konfiguruje* odpovídající beans. Mažete tisíce řádků XML konfigurace.
* **Starter dependencies** — `spring-boot-starter-web`, `-data-jpa`, `-security`, …  Jediný Maven dependency stáhne všechno potřebné.
* **Production-ready features** — `/actuator` endpoints pro health, metrics, env.

```java
@SpringBootApplication
public class MyApp {
    public static void main(String[] args) {
        SpringApplication.run(MyApp.class, args);
    }
}
```

Spring Boot je dnes mainstream pro *Java microservices* a moderní enterprise.

## .NET Core / .NET

Microsoftova platforma **.NET** prošla v posledních letech velkou modernizací. Klíčové stavební bloky:

* **Jazyk** — primárně C#, alternativně F# (funkcionální).
* **ORM** — *Entity Framework Core* (EF Core). Stejné anotace jako JPA: `[Table]`, `[Key]`, `[Required]`, `[StringLength(50)]`. LINQ pro dotazy podobně jako JPQL/Criteria.
* **Business / DI** — *ASP.NET Core* má built-in DI kontainer (`IServiceCollection`), middleware pipeline, hosted services.
* **Web vrstva** — *ASP.NET Core MVC* (controllery + Razor view) nebo *Razor Pages* (MVVM-like two-way binding) nebo *Blazor* (komponenty v C# s renderingem na server/WebAssembly).

```csharp
[Table("Product")]
public class Product
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required, StringLength(50)]
    public string Name { get; set; }

    [Required]
    public int CategoryId { get; set; }
}
```

Síla .NET je v *integraci* — jeden tooling (Visual Studio / VS Code), jedna runtime, jedna package management (NuGet), průmysl orientovaný na Windows a Azure.

## PHP — historicky první volba pro web

**PHP** je rozšířující modul HTTP serveru (Apache `mod_php`, nginx + PHP-FPM). Zásadní rozdíl oproti Javě/Jakartě EE: *není trvale běžící kontainer*. PHP proces vzniká a zaniká *na každý HTTP požadavek* (jednoduchý CGI model), nebo se pre-forkuje (FPM). To má **plusy**:

* Stabilita — paměťová chyba zabije jen jeden požadavek.
* Jednoduché nasazení — `cp *.php /var/www/`.

a **mínusy**:

* Nelze udržovat stav mezi požadavky v paměti (řeší se session, Redis, …).
* Re-bootstrap frameworku při každém požadavku — režie.

### PHP frameworky

Tři populární frameworky:

* **Laravel** ([laravel.com](https://laravel.com/)) — MVC, fluent query builder (`DB::table('users')->where('name','John')->first()`), *Eloquent* ORM (active record), Blade šablony, Artisan CLI.
* **Symfony** ([symfony.com](https://symfony.com/)) — MVC, komponentová architektura, Twig šablony, podpora pro hexagonální architekturu.
* **Nette** ([nette.org](https://nette.org/), český projekt) — MVP, presenter-driven, vlastní robustní DI kontainer, Latte šablony.

### Databázová vrstva — Doctrine

**Doctrine** je nejvyspělejší PHP ORM — *data mapper*, koncepčně blízký JPA:

```php
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: "products")]
class Product {
    #[ORM\Id]
    #[ORM\Column(type: "integer")]
    #[ORM\GeneratedValue]
    protected int $id;

    #[ORM\Column(type: "string", length: 100)]
    protected string $name;
}

// Uložení:
$product = new Product();
$product->setName("Tatranky");
$entityManager->persist($product);
$entityManager->flush();

echo "Created Product with ID " . $product->getId();
```

Doctrine se *integruje do všech tří frameworků* (Symfony výchozí, Laravel/Nette přes balíček).

### Business vrstva v PHP

Typicky služby (POJO třídy) registrované v DI kontaineru frameworku (`services.yaml` v Symfony, `app/Providers/` v Laravel, `config/services.neon` v Nette). Framework při vytváření controlleru **dodá** závislosti — obvykle *constructor injection*.

## Node.js — JavaScript na serveru

**Node.js** je server-side runtime nad V8 (Chrome JS engine), s asynchronním I/O modelem. *Tenký* — zpracování HTTP požadavku se programuje **procedurálně**, podobně jako servlet:

```javascript
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World');
});
server.listen(3000);
```

V praxi se používá framework nad raw HTTP API. **Express.js** je *de facto* standard:

```javascript
const express = require('express');
const app = express();

app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'John' });
});

app.listen(3000);
```

### Node.js databázová vrstva — Sequelize

```javascript
const User = sequelize.define('user', {
  firstName: { type: Sequelize.STRING },
  lastName:  { type: Sequelize.STRING }
});

// Vytvoření tabulky a vložení záznamu:
await User.sync({ force: true });
const u = await User.create({ firstName: 'John', lastName: 'Hancock' });

// Dotaz:
const users = await User.findAll();
console.log(users);
```

Sequelize podporuje MySQL, PostgreSQL, SQLite, MSSQL. Alternativy: **Prisma** (typesafe ORM s vlastním schema language), **TypeORM** (TypeScript-first, dekorátory podobné JPA).

### Business vrstva v Node.js

V Node.js *žádný standardní DI mechanismus neexistuje* — řeší se buď modularizací přes `import`/`require`, nebo lehkými knihovnami (`tsyringe`, `awilix`, `node-dependency-injection`) nebo prostě konstruktor-injekcí ručně. Některé full-stack frameworky (NestJS, [Meteor](https://www.meteor.com/)) přinášejí jasnější strukturu.

## Co si odnést

Co všechny platformy sdílejí:

1. **MVC / vrstvený model** — UI ↔ kontroler ↔ logika ↔ data.
2. **ORM** s anotacemi nebo schématem.
3. **Dependency Injection** v té či oné formě.
4. **Šablonové enginy** pro server-side rendering nebo REST + JS klient.
5. **Routing** založený na URL patterns.

Co dělá rozdíl je **runtime model** (trvalý JVM/CLR proces vs. PHP per-request vs. Node event loop), **správa paměti**, **typový systém** a **ekosystém knihoven**. Žádná platforma není „lepší" — jsou jiné v jiných nuancích.

::: link "Spring Framework — reference docs" "https://docs.spring.io/spring-framework/reference/"
:::

::: link "ASP.NET Core fundamentals" "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/"
:::

::: link "Laravel docs" "https://laravel.com/docs"
:::

::: link "Doctrine ORM" "https://www.doctrine-project.org/projects/orm.html"
:::

::: link "Sequelize docs" "https://sequelize.org/"
:::

::: quiz "Co je hlavní filozofický rozdíl mezi Spring Boot a klasickou Jakarta EE?"
- [x] Spring Boot zabaluje server uvnitř aplikace (embedded Tomcat); Jakarta EE deployuje aplikaci do externího kontaineru.
  > Ano. „Server umí vše" (thin-WAR/fat-JAR) vs. „Aplikace umí vše" (kontainer poskytuje runtime služby).
- [ ] Spring používá CDI, JEE nepoužívá.
  > Spring má vlastní DI mechanismus, Jakarta EE má CDI — funkčně podobné.
- [ ] Spring podporuje pouze REST, JEE pouze JSF.
  > Obě platformy podporují obě modely.
:::

::: quiz "Proč v PHP nelze tak snadno držet stav v paměti aplikace jako v Javě?"
- [x] PHP proces typicky končí po každém HTTP požadavku — paměť aplikace se uvolní.
  > Ano. Per-request model je daň za stabilitu. Stav drží buď session (cookies + serializace), nebo externí store (Redis, DB).
- [ ] PHP nemá objektový model, nemůže držet objekty.
  > PHP plně podporuje OOP od verze 5.
- [ ] PHP runtime je single-threaded.
  > Ne, lze běžet multi-process (FPM) nebo asynchronně (Swoole). Klíčové je „per-request lifetime".
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, prof. T. Hruška, VUT FIT, část „Jiné platformy" v přednášce „Alternativní technologie a architektury" (slidy 18–41).*
