---
title: Observabilita — OpenTelemetry, logy, metriky, traces
---

V monolitu, když něco nefunguje, otevřete `application.log` a najdete to. V *distribuovaném* systému s desítkami mikroslužeb je to nemožné — chyba mohla nastat v libovolné z nich, případně v komunikaci mezi nimi. **Observabilita** (observability) je *schopnost rekonstruovat* z venku, co se uvnitř systému děje.

Klasický rámec: tři pilíře observability — **metriky, logy, traces**.

::: svg "Tři pilíře observability — co měří, kam to ukládat"
<svg viewBox="0 0 540 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="20" width="160" height="130" rx="6" fill="oklch(0.62 0.14 22 / 0.06)" stroke="oklch(0.62 0.14 22)"/>
  <text x="90" y="40" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.18 22)">Metrics</text>
  <text x="90" y="58" text-anchor="middle" font-size="10" fill="var(--text)">hodnoty v čase</text>
  <text x="90" y="74" text-anchor="middle" font-size="9" fill="var(--text-muted)">(counter, gauge, hist.)</text>
  <text x="90" y="100" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Prometheus</text>
  <text x="90" y="115" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">VictoriaMetrics</text>
  <text x="90" y="138" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-style="italic">„kolik a jak dlouho"</text>

  <rect x="190" y="20" width="160" height="130" rx="6" fill="oklch(0.62 0.14 142 / 0.06)" stroke="oklch(0.62 0.14 142)"/>
  <text x="270" y="40" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.18 142)">Logs</text>
  <text x="270" y="58" text-anchor="middle" font-size="10" fill="var(--text)">strukturované záznamy</text>
  <text x="270" y="74" text-anchor="middle" font-size="9" fill="var(--text-muted)">(události + kontext)</text>
  <text x="270" y="100" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Loki</text>
  <text x="270" y="115" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Elasticsearch (ELK)</text>
  <text x="270" y="138" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-style="italic">„co se stalo, kdy a kde"</text>

  <rect x="370" y="20" width="160" height="130" rx="6" fill="oklch(0.62 0.14 264 / 0.06)" stroke="oklch(0.62 0.14 264)"/>
  <text x="450" y="40" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.18 264)">Traces</text>
  <text x="450" y="58" text-anchor="middle" font-size="10" fill="var(--text)">průběh požadavku</text>
  <text x="450" y="74" text-anchor="middle" font-size="9" fill="var(--text-muted)">(přes víc služeb)</text>
  <text x="450" y="100" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Jaeger</text>
  <text x="450" y="115" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Zipkin / Tempo</text>
  <text x="450" y="138" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-style="italic">„kudy šel požadavek"</text>

  <text x="270" y="172" text-anchor="middle" font-size="10" fill="var(--text-faint)" font-style="italic">Korelace přes trace ID propojuje log záznam s konkrétním tracem a metrikami.</text>
</svg>
:::

## Sběr metrik — Prometheus a okolí

Klasický stack pro metriky:

* **[Prometheus](https://prometheus.io/)** — *pull model* sběru metrik. Konfigurovaný `prometheus.yml` říká „každých X sekund vyžádej `/metrics` od služeb A, B, C". Ukládá time-series do vlastní DB.
* **[Grafana](https://grafana.com/)** — *vizualizace* — dashboardy nad Prometheus (a dalšími datovými zdroji).
* **[VictoriaMetrics](https://victoriametrics.com/)** — *výkonnější Prometheus-kompatibilní alternativa* pro velké provozy.
* **OpenTelemetry** — *otevřený standard* pro sběr metrik, logů, traces (viz dále).

```yaml
# prometheus.yml — kus konfigurace
scrape_configs:
  - job_name: 'order-service'
    static_configs:
      - targets: ['order-service:9080']
    metrics_path: '/metrics'
```

## Distribuované logování

Chyby v *distribuovaném* systému často probíhají *přes* několik služeb — uživatel klikne v UI → API gateway → orders service → inventory service → DB. Chyba může vzniknout kdekoli. Procházení logů *po jednom kontejneru* je *neproveditelné*.

Řešením je **centralizovaný sběr logů** — log agent na každé službě posílá logy do centrálního systému, kde se dají *prohledávat napříč službami*.

### Nástroje — ELK stack a alternativy

* **ELK stack** — kanonická volba:
  * **[Elasticsearch](https://www.elastic.co/elasticsearch/)** — ukládání a *fulltext analýza*,
  * **[Logstash](https://www.elastic.co/logstash/)** — agent sběru a transformace logů,
  * **[Kibana](https://www.elastic.co/kibana/)** — vizualizace, dashboardy.
* **[OpenSearch](https://opensearch.org/)** — open-source fork Elasticsearch + Kibana (AWS, po licenční změně Elastic).
* **[Grafana Loki](https://grafana.com/oss/loki/)** — *lehčí* alternativa k ELK. Indexuje jen *metadata logů* (timestamp, labels), ne plný text → výrazně menší úložiště.
* **[Fluent Bit](https://fluentbit.io/) / [Fluentd](https://www.fluentd.org/)** — populární alternativy k Logstash (CNCF projekty), nižší overhead.

### Strukturované logy

Pro efektivní vyhledávání musí logy být **strukturované** — typicky JSON, ne plain text:

```json
{
  "timestamp": "2026-05-21T12:34:56Z",
  "level":     "ERROR",
  "service":   "order-service",
  "trace_id":  "abc-123",
  "span_id":   "def-456",
  "message":   "Failed to charge card",
  "order_id":  "ORD-789",
  "error":     "TimeoutException"
}
```

V Javě konfiguruje *JSON layout* knihovny `log4j2` nebo `logback`. **`trace_id`** je klíčové — propojuje log s konkrétním distribuovaným tracem (viz dále).

## Distribuované sledování (tracing)

**Trace** je *záznam průchodu jednoho požadavku* přes systém. Skládá se ze **span**ů — měření jedné konkrétní operace (HTTP volání, DB dotaz, výpočet). Spans tvoří *strom* — rodičovský span „zpracovat objednávku" má potomky „zkontroluj zásobu", „spočti cenu", „odešli notifikaci".

### Nástroje

* **[Jaeger](https://www.jaegertracing.io/)** — open-source, původně Uber, CNCF projekt. Hlavní UI nástroj.
* **[Zipkin](https://zipkin.io/)** — Twitter, podobná funkcionalita.
* **[Grafana Tempo](https://grafana.com/oss/tempo/)** — *cloud-scale tracing backend*, propojené s Grafana.

### Podpora v aplikaci

Pro instrumentaci je třeba *generovat spans* a *propagovat trace context* mezi službami. Tradiční přístupy:

* **MicroProfile OpenTracing** — anotace `@Traced`, používá *OpenTracing API* (předchůdce OpenTelemetry).
* **Spring Cloud Sleuth** — automatická instrumentace pro Spring Boot.
* **OpenTelemetry** — *moderní sjednocený standard* (viz dále).

## OpenTelemetry — sjednocení tří pilířů

**[OpenTelemetry](https://opentelemetry.io/)** (OTel) je *otevřený standard* pro observabilitu mikroslužeb — **projekt CNCF** (Cloud Native Computing Foundation). Vznikl spojením dvou starších iniciativ (OpenTracing + OpenCensus).

Klíčové vlastnosti:

* **Sjednocuje sběr všech tří pilířů** pod jedno API a SDK.
* **Vendor-neutral** — instrumentace v aplikaci je nezávislá na backendu. Data lze odesílat do Prometheus, Jaeger, Grafana, Datadog, New Relic, … *bez změny kódu aplikace*.

### Architektura

OpenTelemetry se skládá ze tří částí:

* **API** — *rozhraní pro instrumentaci aplikace* (`Tracer`, `Meter`, `Logger`).
* **SDK** — *implementace API* pro konkrétní jazyk (Java, Python, Go, …).
* **Collector** — *samostatný proces*, který přijímá telemetrii, transformuje ji a přeposílá do backendu.

Standardní wire protokol: **OTLP** (OpenTelemetry Protocol) nad gRPC nebo HTTP.

### Pilíře v OTel

| Pilíř | Co měří | Typický backend |
|---|---|---|
| **Metrics** | Hodnoty v čase (counters, gauges, …) | Prometheus, VictoriaMetrics |
| **Logs** | Strukturované záznamy událostí | Loki, Elasticsearch |
| **Traces** | Průběh požadavku přes více služeb | Jaeger, Zipkin |

**Korelace** — *trace ID propojuje log záznamy s konkrétním tracem*. V Grafana UI lze kliknout na log a *otevřít odpovídající trace*, nebo z trace skočit na logy té služby v té chvíli.

Typická kombinace: **OTel Collector → Prometheus + Loki + Jaeger → Grafana** (jednotný dashboard).

## OTel Collector — pipeline

Collector je samostatný proces mezi aplikací a backendy. Funguje jako *router/transformer*:

::: svg "OTel Collector pipeline — receivers → processors → exporters"
<svg viewBox="0 0 540 130" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="30" width="120" height="60" rx="5" fill="oklch(0.62 0.14 22 / 0.10)" stroke="oklch(0.62 0.14 22)"/>
  <text x="80" y="52" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.40 0.18 22)">Receivers</text>
  <text x="80" y="68" text-anchor="middle" font-size="9" fill="var(--text)">OTLP, Prometheus</text>
  <text x="80" y="82" text-anchor="middle" font-size="9" fill="var(--text)">Jaeger, Zipkin, Kafka</text>

  <path d="M 145 60 L 175 60" fill="none" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aP)"/>

  <rect x="180" y="30" width="180" height="60" rx="5" fill="oklch(0.62 0.14 142 / 0.10)" stroke="oklch(0.62 0.14 142)"/>
  <text x="270" y="52" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.40 0.18 142)">Processors</text>
  <text x="270" y="68" text-anchor="middle" font-size="9" fill="var(--text)" font-family="var(--font-mono)">batch · filter · attributes</text>
  <text x="270" y="82" text-anchor="middle" font-size="9" fill="var(--text)" font-family="var(--font-mono)">tail_sampling · transform</text>

  <path d="M 365 60 L 395 60" fill="none" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aP)"/>

  <rect x="400" y="30" width="120" height="60" rx="5" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.62 0.14 264)"/>
  <text x="460" y="52" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.40 0.18 264)">Exporters</text>
  <text x="460" y="68" text-anchor="middle" font-size="9" fill="var(--text)">Prometheus, Loki</text>
  <text x="460" y="82" text-anchor="middle" font-size="9" fill="var(--text)">Jaeger, Datadog</text>

  <text x="270" y="115" text-anchor="middle" font-size="10" fill="var(--text-faint)" font-style="italic">Aplikace mluví jen OTLP; backend lze změnit bez redeploymentu.</text>

  <defs>
    <marker id="aP" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.18 22)"/></marker>
  </defs>
</svg>
:::

* **Receivers** — *přijímají* telemetrii: OTLP (gRPC/HTTP), Prometheus scrape, Jaeger thrift, Zipkin JSON, Kafka, …
* **Processors** — *transformují*: `batch` (sloučí zprávy), `filter` (odfiltrovat senzitivní data), `attributes` (přidat/odebrat metadata), `tail_sampling` (samplovat až po dokončení trace).
* **Exporters** — *odešlou* dál: Prometheus remote write, OTLP → Jaeger/Tempo, Loki, Datadog, …

Výhoda: jeden collector → *více backendů zároveň* (např. metriky do Prometheus + traces do Jaeger současně). A *backend lze změnit bez redeploymentu aplikace*.

## MicroProfile Telemetry — bridge nad OTel Java SDK

MicroProfile **Telemetry 2.0** (od MP 7.0, 2024) je *CDI wrapper nad OTel Java SDK*. Nevytváří nový formát — všechno směřuje do OpenTelemetry.

```java
@Path("/orders")
@ApplicationScoped
public class OrderResource {

    @Inject
    private OpenTelemetry otel;

    private LongCounter ordersCreated;

    @PostConstruct
    void init() {
        Meter meter = otel.getMeter("order-service");
        ordersCreated = meter.counterBuilder("orders_total")
            .setDescription("Total orders")
            .build();
    }

    @POST
    @WithSpan("create-order")            // automatická tvorba spanu
    public Response create(
            @SpanAttribute("customer") String customer,
            OrderDto dto) {
        ordersCreated.add(1);
        ...
    }
}
```

Klíčové anotace:

* **`@WithSpan`** — automaticky vytvoří *span* okolo volání metody.
* **`@SpanAttribute`** — přidá parametr jako *attribut* spanu (vyhledávatelný v UI).
* **Automatická instrumentace JAX-RS** — každé volání REST endpointu je traceováno bez ruční práce.
* **Metrics:** přímo OTel Metrics API (`Counter`, `Histogram`, `Gauge`) — `@Counted`/`@Timed` z MP Metrics jsou **deprecated**.
* **Logs:** strukturované logy přes *OTel Logs Bridge API*.
* **Konfigurace** přes [[microprofile|MicroProfile Config]]:

```properties
otel.service.name=math-service
otel.exporter.otlp.endpoint=http://collector:4317
```

Open Liberty: feature **`mpTelemetry-2.0`**.

## Příklad nasazení — Docker Compose

::: svg "Typické nasazení OpenTelemetry — aplikace → Collector → Prometheus/Jaeger/Loki → Grafana"
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="20" width="130" height="60" rx="5" fill="var(--bg-card)" stroke="oklch(0.55 0.18 142)"/>
  <text x="75" y="40" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">math-service</text>
  <text x="75" y="55" text-anchor="middle" font-size="9" fill="var(--text-muted)">Open Liberty</text>
  <text x="75" y="68" text-anchor="middle" font-size="9" fill="var(--text-muted)">mpTelemetry</text>

  <rect x="10" y="100" width="130" height="60" rx="5" fill="var(--bg-card)" stroke="oklch(0.55 0.18 142)"/>
  <text x="75" y="120" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">order-service</text>
  <text x="75" y="135" text-anchor="middle" font-size="9" fill="var(--text-muted)">Open Liberty</text>
  <text x="75" y="148" text-anchor="middle" font-size="9" fill="var(--text-muted)">mpTelemetry</text>

  <path d="M 145 50 L 195 50" fill="none" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aQ)"/>
  <text x="170" y="42" text-anchor="middle" font-size="9" fill="var(--text-muted)">OTLP</text>
  <path d="M 145 130 L 195 130" fill="none" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aQ)"/>
  <text x="170" y="122" text-anchor="middle" font-size="9" fill="var(--text-muted)">OTLP</text>

  <rect x="200" y="60" width="160" height="70" rx="5" fill="oklch(0.62 0.14 22 / 0.10)" stroke="oklch(0.55 0.18 22)"/>
  <text x="280" y="78" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">OTel Collector</text>
  <text x="280" y="93" text-anchor="middle" font-size="9" fill="var(--text)" font-family="var(--font-mono)">receivers: OTLP</text>
  <text x="280" y="106" text-anchor="middle" font-size="9" fill="var(--text)" font-family="var(--font-mono)">processors: batch</text>
  <text x="280" y="119" text-anchor="middle" font-size="9" fill="var(--text)" font-family="var(--font-mono)">exporters: → →</text>

  <path d="M 365 80 L 405 50" fill="none" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aQ)"/>
  <path d="M 365 95 L 405 95" fill="none" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aQ)"/>
  <path d="M 365 110 L 405 145" fill="none" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aQ)"/>

  <rect x="410" y="30" width="80" height="40" rx="4" fill="var(--bg-card)" stroke="oklch(0.55 0.18 264)"/>
  <text x="450" y="55" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Prometheus</text>
  <rect x="410" y="80" width="80" height="40" rx="4" fill="var(--bg-card)" stroke="oklch(0.55 0.18 264)"/>
  <text x="450" y="105" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Jaeger</text>
  <rect x="410" y="130" width="80" height="40" rx="4" fill="var(--bg-card)" stroke="oklch(0.55 0.18 264)"/>
  <text x="450" y="155" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Loki</text>

  <path d="M 410 200 L 480 200" fill="none" stroke="oklch(0.55 0.18 22)" stroke-width="0.5" stroke-dasharray="2 2"/>
  <rect x="380" y="180" width="120" height="30" rx="4" fill="oklch(0.62 0.14 340 / 0.18)" stroke="oklch(0.55 0.18 340)"/>
  <text x="440" y="200" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Grafana</text>

  <defs>
    <marker id="aQ" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.18 22)"/></marker>
  </defs>
</svg>
:::

## Co si odnést

* **Tři pilíře** — metriky (hodnoty v čase), logy (události), traces (průběh požadavku). Korelace je přes trace ID.
* **Distribuované logování** vyžaduje *centralizovaný sběr* — ELK, Loki, OpenSearch.
* **Tracing** zviditelňuje *cestu požadavku přes víc služeb* — Jaeger, Zipkin.
* **OpenTelemetry** je *otevřený standard*, který sjednocuje sběr všech tří pilířů a oddělí aplikaci od konkrétního backendu.
* **OTel Collector** je flexibilní router/processor mezi aplikací a backendy.
* V Jakarta EE: **`mpTelemetry-2.0`** (Open Liberty) — anotace `@WithSpan`, `@SpanAttribute`, OTel Metrics/Logs Bridge API.

::: link "OpenTelemetry — homepage" "https://opentelemetry.io/"
:::

::: link "OpenTelemetry Java SDK" "https://opentelemetry.io/docs/languages/java/"
:::

::: link "MicroProfile Telemetry 2.0 specification" "https://microprofile.io/specifications/microprofile-telemetry/"
:::

::: link "Grafana Loki — log aggregation" "https://grafana.com/oss/loki/"
:::

::: link "Jaeger tracing" "https://www.jaegertracing.io/"
:::

::: link "Prometheus — monitoring" "https://prometheus.io/docs/introduction/overview/"
:::

::: quiz "Proč je OpenTelemetry preferován nad starší MicroProfile Metrics + OpenTracing?"
- [x] OTel sjednocuje sběr metrik, logů a traces pod jedno API a SDK, a je vendor-neutral — aplikace neví, jestli běh jde do Prometheus, Jaeger nebo Datadog.
  > Ano. Jeden tooling, vendor-neutrální backend, navíc projekt CNCF s velkou komunitou.
- [ ] OTel je rychlejší než MP Metrics.
  > Ne, výkon je srovnatelný. Klíčové je *sjednocení a otevřenost*.
- [ ] OTel je výhradně pro Javu.
  > Naopak, OTel má SDK pro Javu, Python, Go, JS, C#, Rust, … — je jazykově nezávislý.
:::

::: quiz "Co umožňuje *korelace* mezi logy a tracem?"
- [x] Sdílený `trace_id` v JSON struktuře logu odkazuje na konkrétní distribuovaný trace.
  > Ano. V Grafana UI lze proklikat z logu rovnou na odpovídající trace — extrémně užitečné při debugu.
- [ ] Synchronizace časů přes NTP.
  > NTP pomáhá řadit události, ale nepropojuje log s konkrétním tracem.
- [ ] Sdílený logovací framework.
  > Sdílený framework může pomoci konzistentně formátovat, ale klíčové je *trace ID propagované přes všechny služby*.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, prof. T. Hruška, VUT FIT, část „Sběr metrik, distribuované logování, OpenTelemetry" v přednášce „Alternativní technologie a architektury" (slidy 115–124).*
