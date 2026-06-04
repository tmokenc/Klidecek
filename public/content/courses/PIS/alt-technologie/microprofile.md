---
title: Mikroslužby a Eclipse MicroProfile
---

Předchozí podkapitoly probraly *komunikační protokoly* — SOAP, REST, GraphQL, JSON-RPC, gRPC, MCP. Teď se ptáme, *kdo* tyhle protokoly poskytuje — *který* tým, *který* proces, *jaký* deployment. Odpověď: **mikroslužby**. V přednášce 1 ([[mikrosluzby|principy mikroslužeb]]) jsme probrali *proč* — rozdělit aplikaci, abychom mohli nezávisle vyvíjet, nasazovat a škálovat. V této podkapitole se zaměříme na *jak je implementovat v Javě* — specificky **Eclipse MicroProfile** a doplňující ekosystém.

## Monolit vs. mikroslužby — rekapitulace

::: svg "Monolit (jedna aplikace, jedna DB) vs. mikroslužby (samostatné procesy, vlastní DB)"
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg">
  <text x="135" y="20" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Monolit</text>
  <rect x="40" y="30" width="190" height="120" rx="6" fill="oklch(0.62 0.14 264 / 0.08)" stroke="oklch(0.62 0.14 264)"/>
  <rect x="60" y="50" width="150" height="50" rx="4" fill="var(--bg-card)" stroke="oklch(0.55 0.18 264)"/>
  <text x="135" y="68" text-anchor="middle" font-size="10" fill="var(--text)">Objednávky | Doprava | Sklad</text>
  <text x="135" y="84" text-anchor="middle" font-size="9" fill="var(--text-muted)">jeden balík (WAR/JAR)</text>
  <ellipse cx="135" cy="125" rx="50" ry="16" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.55 0.18 264)"/>
  <text x="135" y="129" text-anchor="middle" font-size="10" fill="var(--text)">jedna DB</text>
  <text x="135" y="172" text-anchor="middle" font-size="9" fill="var(--text-muted)">+ jednoduché nasazení, sdílená data</text>
  <text x="135" y="186" text-anchor="middle" font-size="9" fill="var(--text-muted)">− obtížné rozšířit, jednotná technologie</text>

  <text x="400" y="20" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Mikroslužby</text>
  <rect x="290" y="30" width="65" height="50" rx="4" fill="var(--bg-card)" stroke="oklch(0.55 0.18 142)"/>
  <text x="322" y="55" text-anchor="middle" font-size="10" fill="var(--text)">Objedn.</text>
  <ellipse cx="322" cy="95" rx="22" ry="9" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.55 0.18 142)"/>
  <text x="322" y="98" text-anchor="middle" font-size="9" fill="var(--text)">DB</text>

  <rect x="367" y="30" width="65" height="50" rx="4" fill="var(--bg-card)" stroke="oklch(0.55 0.18 142)"/>
  <text x="400" y="55" text-anchor="middle" font-size="10" fill="var(--text)">Doprava</text>
  <ellipse cx="400" cy="95" rx="22" ry="9" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.55 0.18 142)"/>
  <text x="400" y="98" text-anchor="middle" font-size="9" fill="var(--text)">DB</text>

  <rect x="444" y="30" width="65" height="50" rx="4" fill="var(--bg-card)" stroke="oklch(0.55 0.18 142)"/>
  <text x="477" y="55" text-anchor="middle" font-size="10" fill="var(--text)">Sklad</text>
  <ellipse cx="477" cy="95" rx="22" ry="9" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.55 0.18 142)"/>
  <text x="477" y="98" text-anchor="middle" font-size="9" fill="var(--text)">DB</text>

  <path d="M 355 55 L 365 55" stroke="oklch(0.55 0.18 22)" stroke-width="1"/>
  <path d="M 432 55 L 442 55" stroke="oklch(0.55 0.18 22)" stroke-width="1"/>
  <text x="400" y="125" text-anchor="middle" font-size="9" fill="var(--text-muted)">REST API mezi službami</text>
  <text x="400" y="172" text-anchor="middle" font-size="9" fill="var(--text-muted)">+ tech. nezávislost, kontinuální vývoj</text>
  <text x="400" y="186" text-anchor="middle" font-size="9" fill="var(--text-muted)">− režie komunikace, testování</text>
</svg>
:::

V monolitu *všechny moduly sdílí jednu DB a jeden proces*. V mikroslužbové architektuře každá služba má **vlastní DB nepřístupnou zvenku** + **vlastní business logiku** + **REST API**. Klíčový pravidlo: *žádná služba nesahá přímo do DB jiné služby*.

## Vlastnosti, které mikroslužba musí mít

Sám REST endpoint pro mikroslužbu nestačí. V distribuovaném prostředí se přidává řada dalších nutností:

* **Vnější API** — dostatečně obecné, *reprezentuje logiku, ne schéma databáze* (DB může být skryta).
* **Externí konfigurace** — připojovací řetězec k DB, URL ostatních služeb, feature flags. Nesmí být zakompilováno.
* **Logování** — strukturované, posílatelné do centralizovaného systému.
* **Telemetrie** — metriky (počty volání, latence, fronty, chyby).
* **Health check** — `/health/live`, `/health/ready` pro orchestrátor (Kubernetes).
* **Trasování** — schopnost rekonstruovat průchod požadavku přes víc služeb.

Tyto vlastnosti se v Javě dají implementovat ručně. Lépe však je použít *framework, který je poskytne přes standardní API*. Pro Jakarta EE tuto roli plní **Eclipse MicroProfile**.

## V čem implementovat mikroslužbu?

Praktická volba pro Javu (a nejen):

* **Node.js + Express + MongoDB** — populární rychlé řešení, oblíbené u startupů.
* **Java + Spring Boot** — Spring Boot je mainstream (viz [[alt-platformy]]).
* **Java + [Eclipse MicroProfile](https://microprofile.io/)** — podmnožina Jakarta EE + specifická rozhraní pro mikroslužby. Běží na **Open Liberty**, **Payara Micro**, **Helidon**, **WildFly**.
* **Java + [Quarkus](https://quarkus.io/)** — modernizovaný Java framework, GraalVM native-image, nízká spotřeba paměti. „Supersonic, subatomic Java."
* **Java + [Helidon](https://helidon.io/)** — Oracle, MicroProfile-kompatibilní.
* **.NET (ASP.NET Core)** — analogie Spring Boot.

## Eclipse MicroProfile — přehled

**Eclipse MicroProfile** je *standard*, který si vzal **podmnožinu Jakarta EE** (CDI, JAX-RS, JSON-B) a doplnil ji o **specifická rozhraní pro mikroslužby**:

| Rozhraní | K čemu |
|---|---|
| **Config** | Externí konfigurace přes `@ConfigProperty` |
| **Health Check** | `/health/live`, `/health/ready` endpoints |
| **Metrics** | Sběr metrik (`@Counted`, `@Timed`, *deprecated v MP 7.0*) |
| **JWT Auth** | Autentizace bearer JWT tokeny |
| **REST Client** | Typovaný klient pro volání jiných služeb |
| **Fault Tolerance** | `@Retry`, `@Timeout`, `@CircuitBreaker`, `@Fallback` |
| **OpenAPI** | Generování OpenAPI dokumentace |
| **Reactive Messaging** | `@Incoming` / `@Outgoing` pro Kafka, RabbitMQ |
| **Telemetry** | Distribuované sledování (od MP 5.0; v 7.0 nahradilo Metrics + Tracing) |

Nejnovější verze MP 7.0 (2024) **sjednocuje observabilitu pod OpenTelemetry** (viz [[observabilita]]).

## Config — externí konfigurace

`MicroProfile Config` injektuje hodnoty z externích zdrojů do beanu:

```java
@ApplicationScoped
public class WeatherService {

    @Inject
    @ConfigProperty(name = "weather.api.key", defaultValue = "demo")
    private String apiKey;

    @Inject
    @ConfigProperty(name = "weather.api.url")
    private String apiUrl;
}
```

Zdroje konfigurace (priorita shora dolů):

1. **System properties** — `-Dweather.api.key=xxx` v `server/jvm.options`,
2. **Environment variables** — `WEATHER_API_KEY=xxx`,
3. **`META-INF/microprofile-config.properties`** v JAR/WAR,
4. **Vlastní zdroje** — Vault, etcd, Kubernetes ConfigMap přes plugin.

Konverze datových typů (String, int, boolean, List, vlastní typy) probíhá automaticky.

## Health Check — sledování živosti

Orchestrační systémy (Kubernetes) potřebují vědět, jestli mají kontainer restartovat. MicroProfile Health definuje dva endpointy:

* **`/health/live`** — *Liveness probe*. „Žije aplikace?" Pokud ne (503), kontainer se restartuje.
* **`/health/ready`** — *Readiness probe*. „Může aplikace správně pracovat?" Např. zda má spojení s DB. Pokud ne, traffic se na ni nesměřuje.

HTTP status:
* `200 OK` — UP,
* `503 Service Unavailable` — DOWN,
* `500 Internal Server Error` — nelze zjistit.

```java
@Liveness
@ApplicationScoped
public class MemoryCheck implements HealthCheck {
    @Override
    public HealthCheckResponse call() {
        long free = Runtime.getRuntime().freeMemory();
        return HealthCheckResponse.named("memory")
            .status(free > 10_000_000)
            .withData("freeBytes", free)
            .build();
    }
}
```

## Metrics — telemetrie aplikace

Tři druhy metrik:

* **Gauge** — *spojitá hodnota* (instantánní): délka fronty, využití paměti.
* **Counter** — *monotonně rostoucí počítadlo*: počet zaregistrovaných uživatelů, počet HTTP volání.
* **Histogram / Timer** — distribuce hodnot, např. latence.

Anotace (v MP do verze 6.x):

```java
@Counted(name = "orders_created_total")
@Timed(name = "orders_create_duration")
public Order create(OrderDto dto) { ... }
```

Data sbírá a vystavuje server na endpointu `/metrics`. Formát je *Prometheus exposition format* — texto-řádkový:

```
# HELP orders_created_total Total number of orders created
# TYPE orders_created_total counter
orders_created_total 42
```

> **Pozn.** Od MicroProfile 7.0 jsou `@Counted` a `@Timed` z MP Metrics **deprecated**. Náhrada: přímo *OpenTelemetry Metrics API* (`Counter`, `Histogram`, `Gauge`) přes MicroProfile Telemetry 2.0 — viz [[observabilita]].

## REST Client — volání jiných služeb typovaně

Mikroslužby spolu komunikují přes REST. MicroProfile REST Client umožní toto volání *typovaně*:

```java
// 1. Anotované rozhraní (sdílené mezi klientem a serverem)
@Path("/inventory")
@RegisterRestClient(configKey = "inventory-api")
public interface InventoryApi {

    @GET
    @Path("/{sku}")
    @Produces(MediaType.APPLICATION_JSON)
    StockLevel getStock(@PathParam("sku") String sku);
}

// 2. Použití v jiné mikroslužbě
@ApplicationScoped
public class OrderService {

    @Inject
    @RestClient
    private InventoryApi inventoryApi;

    public Order placeOrder(OrderDto dto) {
        StockLevel stock = inventoryApi.getStock(dto.sku());   // HTTP volání skryté!
        ...
    }
}
```

URL služby se konfiguruje přes `inventory-api/mp-rest/url` v Config:

```properties
inventory-api/mp-rest/url=http://inventory-service:8080
```

## Fault Tolerance — odolnost proti selhání

V distribuovaném systému *cokoli může selhat*. MicroProfile Fault Tolerance přidává *anotace odolnosti*:

* **`@Retry`** — *automatické opakování* metody při výjimce.
* **`@Timeout`** — *omezení doby trvání* — pokud volání trvá déle, vyhoď výjimku.
* **`@Fallback`** — *záložní metoda* — když všechno selže, zavolej tuhle.
* **`@CircuitBreaker`** — *jistič* — po N po sobě jdoucích selháních *přestaň volat* a vracej rovnou chybu (chrání dolní službu před přetížením).
* **`@Bulkhead`** — *přepážka* — omez paralelnost volání metody.

```java
@ApplicationScoped
public class WeatherService {

    @Inject @RestClient
    private WeatherApi api;

    @Retry(maxRetries = 3, delay = 500)
    @Timeout(value = 2000)
    @Fallback(fallbackMethod = "cachedWeather")
    @CircuitBreaker(requestVolumeThreshold = 4, failureRatio = 0.5)
    public Forecast getForecast(String city) {
        return api.forecast(city);
    }

    public Forecast cachedWeather(String city) {
        return cache.getOrDefault(city, Forecast.UNKNOWN);
    }
}
```

Pořadí vyhodnocování: *@Bulkhead → @Timeout → @CircuitBreaker → @Retry → @Fallback*.

## OpenAPI — formalizovaná dokumentace

`mp-openapi` automaticky **generuje OpenAPI 3.x dokument** z JAX-RS endpointů + anotací. Dostupné na `/openapi`. Lze doplnit detaily přes `@Operation`, `@APIResponse`, `@Parameter` (viz [[rest-design]]).

## JWT Authentication

Bearer JWT tokens jako standardní bezpečnostní mechanismus mezi mikroslužbami. Viz [[rest-autentizace]] a [[identity-java]] (MicroProfile JWT v Open Liberty).

## Synchronní vs. asynchronní komunikace

Mikroslužby mohou komunikovat dvěma způsoby:

* **Synchronně** — REST (nejčastěji), gRPC. Klientská služba *čeká* na odpověď. Pokud volaná služba nedostupná, klient čeká nebo selže.
* **Asynchronně** — *message broker* zprostředkovává zprávy. Producent pošle a nečeká. Detail viz [[messaging-fault-tolerance]].

## Praktický příklad — kompletní MP služba {tier=example}

```xml
<!-- server.xml -->
<featureManager>
    <feature>microProfile-7.0</feature>
    <feature>jakartaee-10.0</feature>
</featureManager>
<httpEndpoint id="defaultHttpEndpoint" host="*" httpPort="9080"/>
```

```java
@Path("/orders")
@ApplicationScoped
public class OrderResource {

    @Inject
    @ConfigProperty(name = "warehouse.url")
    private String warehouseUrl;

    @Inject
    private OrderService service;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Counted(name = "orders_total")
    @Timeout(2000)
    @Retry(maxRetries = 2)
    public Response create(OrderDto dto) {
        Order o = service.create(dto);
        return Response.created(URI.create("/orders/" + o.id())).build();
    }
}
```

Tato služba má:

* REST endpoint (JAX-RS),
* DI z CDI (`@Inject`),
* externí konfiguraci (`@ConfigProperty`),
* metriku počtu volání (`@Counted`),
* automatický timeout a retry (`@Timeout`, `@Retry`),
* `/health/live`, `/health/ready` automaticky od Liberty,
* `/metrics` v Prometheus formátu,
* `/openapi` dokumentaci.

Vše *deklarativně*, bez ručního programování.

::: link "Eclipse MicroProfile — homepage" "https://microprofile.io/"
:::

::: link "Open Liberty MicroProfile guides" "https://openliberty.io/guides/?search=microprofile"
:::

::: link "Quarkus — supersonic Java" "https://quarkus.io/"
:::

::: link "Sample MP service (DIFS Teaching)" "https://github.com/DIFS-Teaching/java-micro-service"
:::

::: link "Payara MicroProfile Examples" "https://github.com/payara/Payara-Examples/tree/master/microprofile"
:::

::: quiz "Jaký je rozdíl mezi `/health/live` a `/health/ready`?"
- [x] Liveness odpovídá na otázku „žije proces?" (jinak restart). Readiness odpovídá „je proces schopen sloužit?" (jinak neposílat traffic).
  > Ano. Jsou to dvě nezávislé kontroly. Aplikace může žít, ale být zatím nepřipravená (např. čeká na DB) — readiness pak vrátí 503, liveness 200.
- [ ] Liveness je periodická, readiness jednorázová.
  > Obě jsou periodické, jen mají různý význam.
- [ ] Liveness je z aplikace, readiness od orchestrátoru.
  > Obě jsou volány orchestrátorem.
:::

::: quiz "Co dělá `@CircuitBreaker` v MicroProfile Fault Tolerance?"
- [x] Po N po sobě jdoucích selháních *přestane volat* dolní službu a vrací rovnou chybu, dokud se služba nezotaví.
  > Ano. Chrání dolní službu před přetížením a zachraňuje vlastní službu před plýtváním zdroji na něco, co stejně selže.
- [ ] Opakuje volání, dokud neuspěje.
  > Ne, to je `@Retry`.
- [ ] Vrací výsledek z cache.
  > Ne, to dělá `@Fallback`.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, prof. T. Hruška, VUT FIT, část „Mikroslužby a Microprofile" v přednášce „Alternativní technologie a architektury" (slidy 103–114, 125–126).*
