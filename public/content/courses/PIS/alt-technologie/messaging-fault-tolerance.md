---
title: Asynchronní komunikace — message queues a pub/sub
---

V kapitole [[microprofile|MicroProfile]] jsme probrali *synchronní* komunikaci mikroslužeb (REST + Fault Tolerance), v kapitole [[observabilita|observabilitě]] pak její sledování. Tato uzavírací podkapitola se vrací k druhému způsobu komunikace mezi službami: *asynchronnímu*. Synchronní volání má dva neodstranitelné problémy:

1. **Klientská služba čeká** na odpověď (blokuje vlákno/proces).
2. **Pokud volaná služba není dostupná**, klient čeká nebo selže.

Pro mnoho scénářů (objednávky, notifikace, integrace) je *asynchronní* model — *fire-and-forget* nebo *pub/sub* — výrazně vhodnější. Komunikaci zprostředkuje **message broker**.

## Synchronní vs. asynchronní — kdy co

::: svg "Synchronní (přímé HTTP volání) vs. asynchronní (přes broker) — různé timing a coupling"
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg">
  <text x="135" y="20" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Synchronně</text>
  <rect x="30" y="35" width="60" height="40" rx="4" fill="var(--bg-card)" stroke="oklch(0.55 0.18 22)"/>
  <text x="60" y="60" text-anchor="middle" font-size="11" fill="var(--text)">Klient</text>
  <rect x="180" y="35" width="60" height="40" rx="4" fill="var(--bg-card)" stroke="oklch(0.55 0.18 22)"/>
  <text x="210" y="60" text-anchor="middle" font-size="11" fill="var(--text)">Server</text>
  <path fill="none" d="M 90 50 L 175 50" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aR)"/>
  <text x="132" y="42" text-anchor="middle" font-size="9" fill="var(--text-muted)">požadavek</text>
  <path fill="none" d="M 175 65 L 90 65" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aR)"/>
  <text x="132" y="78" text-anchor="middle" font-size="9" fill="var(--text-muted)">odpověď</text>
  <text x="135" y="100" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-style="italic">Klient blokován do odpovědi.</text>
  <text x="135" y="115" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-style="italic">Pokud server padl → klient selže.</text>

  <text x="405" y="20" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Asynchronně</text>
  <rect x="290" y="35" width="60" height="40" rx="4" fill="var(--bg-card)" stroke="oklch(0.55 0.18 142)"/>
  <text x="320" y="60" text-anchor="middle" font-size="11" fill="var(--text)">Producent</text>
  <rect x="380" y="35" width="60" height="40" rx="4" fill="oklch(0.62 0.14 80 / 0.15)" stroke="oklch(0.55 0.18 80)"/>
  <text x="410" y="60" text-anchor="middle" font-size="11" fill="var(--text)">Broker</text>
  <rect x="470" y="35" width="60" height="40" rx="4" fill="var(--bg-card)" stroke="oklch(0.55 0.18 142)"/>
  <text x="500" y="60" text-anchor="middle" font-size="11" fill="var(--text)">Konzument</text>
  <path fill="none" d="M 350 55 L 375 55" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aR)"/>
  <path fill="none" d="M 440 55 L 465 55" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aR)"/>
  <text x="410" y="100" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-style="italic">Producent jen pošle a jde dál.</text>
  <text x="410" y="115" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-style="italic">Konzument zpracuje, až bude moci.</text>

  <text x="270" y="160" text-anchor="middle" font-size="10" fill="var(--text)" font-weight="600">Synchronně volte když:</text>
  <text x="270" y="175" text-anchor="middle" font-size="9" fill="var(--text-muted)">— uživatel čeká na odpověď</text>
  <text x="270" y="188" text-anchor="middle" font-size="9" fill="var(--text-muted)">— operace musí být dokončena hned</text>

  <text x="270" y="208" text-anchor="middle" font-size="10" fill="var(--text-faint)" font-style="italic">Async: volné svázání, odolnost proti výpadkům, vyšší propustnost; cena: latence, eventual consistency.</text>

  <defs>
    <marker id="aR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.18 22)"/></marker>
  </defs>
</svg>
:::

**Synchronní (REST)** — uživatel klikne na „Zobraz detail objednávky", potřebuje data hned na obrazovku. Synchronně.

**Asynchronní (Messaging)** — uživatel vytvoří objednávku → spuštění background workflow (validace zásob, generování faktury, odeslání emailu, notifikace dopravce). Stačí *eventual consistency*. Asynchronně.

## Message queue (point-to-point)

Klasický model **fronty zpráv**: jeden producent zveřejní zprávu, **právě jeden konzument** ji odebere a zpracuje.

::: svg "Message queue — producent → fronta → konzument (1:1 doručení)"
<svg viewBox="0 0 540 130" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="40" width="120" height="50" rx="6" fill="var(--bg-card)" stroke="oklch(0.55 0.18 142)"/>
  <text x="80" y="60" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Producent</text>
  <text x="80" y="78" text-anchor="middle" font-size="9" fill="var(--text-muted)">vytváří zprávy</text>

  <path fill="none" d="M 145 65 L 210 65" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aS)"/>

  <rect x="215" y="35" width="120" height="60" rx="6" fill="oklch(0.62 0.14 80 / 0.10)" stroke="oklch(0.55 0.18 80)"/>
  <text x="275" y="52" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Message broker</text>
  <rect x="232" y="62" width="86" height="20" rx="10" fill="oklch(0.62 0.14 80 / 0.25)" stroke="oklch(0.55 0.18 80)"/>
  <text x="275" y="76" text-anchor="middle" font-size="10" fill="var(--text)">Queue</text>

  <path fill="none" d="M 340 65 L 405 65" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aS)"/>

  <rect x="410" y="40" width="120" height="50" rx="6" fill="var(--bg-card)" stroke="oklch(0.55 0.18 142)"/>
  <text x="470" y="60" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Konzument</text>
  <text x="470" y="78" text-anchor="middle" font-size="9" fill="var(--text-muted)">odebírá zprávy</text>

  <text x="275" y="118" text-anchor="middle" font-size="10" fill="var(--text-faint)" font-style="italic">Každá zpráva je doručena právě jednomu konzumentovi.</text>

  <defs>
    <marker id="aS" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.18 22)"/></marker>
  </defs>
</svg>
:::

Pokud má fronta *více konzumentů*, broker **load-balancuje** — každá zpráva jde *jen jednomu* z nich. Tím se *paralelizuje zpracování*: 100 zpráv ve frontě + 10 konzumentů = každý zpracuje cca 10 zpráv.

### Typické nástroje

* **[RabbitMQ](https://www.rabbitmq.com/)** — open-source, *AMQP protokol*, snadné na pochopení a provoz. Dobrá volba pro střední velikost.
* **[Apache ActiveMQ](https://activemq.apache.org/)** — historický Java broker, podpora *JMS* (Jakarta Messaging).
* **[Amazon SQS](https://aws.amazon.com/sqs/)** — fully-managed cloud queue v AWS.
* **[Azure Service Bus](https://azure.microsoft.com/en-us/products/service-bus)** — analogie SQS v Azure.

### Vzory s frontou

* **Work queue** — paralelní zpracování úkolů konzumenty.
* **Request/Reply** — synchronní volání nad async transportem (rare).
* **Delay queue** — zpráva se doručí *později* (např. připomínka platby za 7 dní).
* **Dead Letter Queue (DLQ)** — pro zprávy, které selhaly N-krát.

## Publish / Subscribe (pub/sub)

Když chceme **jednu událost rozeslat více příjemcům** najednou — pub/sub. Producent publikuje k **tématu** (topic). Konzumenti se k tématu *přihlašují* a každý dostane vlastní kopii každé zprávy.

::: svg "Publish/Subscribe — jedna zpráva, více subscriberů"
<svg viewBox="0 0 540 170" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="62" width="100" height="44" rx="6" fill="var(--bg-card)" stroke="oklch(0.55 0.18 142)"/>
  <text x="70" y="80" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Producent</text>
  <text x="70" y="95" text-anchor="middle" font-size="9" fill="var(--text-muted)">publikuje zprávy</text>

  <path fill="none" d="M 125 84 L 175 84" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aT)"/>

  <rect x="180" y="50" width="130" height="70" rx="6" fill="oklch(0.62 0.14 80 / 0.10)" stroke="oklch(0.55 0.18 80)"/>
  <text x="245" y="68" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Pub/Sub broker</text>
  <rect x="200" y="82" width="90" height="20" rx="10" fill="oklch(0.62 0.14 80 / 0.25)" stroke="oklch(0.55 0.18 80)"/>
  <text x="245" y="96" text-anchor="middle" font-size="10" fill="var(--text)">Topic</text>

  <path d="M 315 84 L 365 30" fill="none" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aT)"/>
  <path d="M 315 84 L 365 84" fill="none" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aT)"/>
  <path d="M 315 84 L 365 138" fill="none" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#aT)"/>

  <rect x="370" y="15" width="120" height="32" rx="5" fill="var(--bg-card)" stroke="oklch(0.55 0.18 142)"/>
  <text x="430" y="35" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Subscriber A</text>
  <rect x="370" y="68" width="120" height="32" rx="5" fill="var(--bg-card)" stroke="oklch(0.55 0.18 142)"/>
  <text x="430" y="88" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Subscriber B</text>
  <rect x="370" y="123" width="120" height="32" rx="5" fill="var(--bg-card)" stroke="oklch(0.55 0.18 142)"/>
  <text x="430" y="143" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Subscriber C</text>

  <text x="270" y="165" text-anchor="middle" font-size="10" fill="var(--text-faint)" font-style="italic">Zpráva je rozeslána všem subscriberům — fan-out.</text>

  <defs>
    <marker id="aT" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.18 22)"/></marker>
  </defs>
</svg>
:::

### Typické nástroje

* **[Apache Kafka](https://kafka.apache.org/)** — *high-throughput streaming platform*. Zprávy se ukládají na disk a *zůstávají* po nastavený čas (retention). Konzumenti čtou *podle vlastního offsetu* — můžete *přehrát historii*.
* **[Apache Pulsar](https://pulsar.apache.org/)** — Yahoo, podobné Kafka, ale lepší multi-tenancy a geo-replikace.
* **[Amazon SNS](https://aws.amazon.com/sns/)** — managed pub/sub v AWS (často kombinovaný se SQS).
* **MQTT** — *protokol* (ne broker) pro IoT.

### Kafka — specifika

Kafka *je* technicky pub/sub, ale s několika neobvyklými rysy:

* **Topic je rozdělen do partition** — zprávy v rámci jedné partition jsou *ordered*, mezi partitions ne.
* **Consumer group** — pokud má topic 4 partition a v consumer group jsou 4 instances, broker distribuuje *1 partition na 1 instanci* (work queue uvnitř pub/sub).
* **Retention** — zprávy se nezahazují po doručení; uchovávají se např. 7 dní → *re-play* je možný.
* **Streaming** — Kafka Streams, ksqlDB pro real-time analýzu nad proudem zpráv.

## MicroProfile Reactive Messaging — programátorský pohled

**MicroProfile Reactive Messaging** je standard pro async messaging v Jakarta EE. Podporuje Kafka, RabbitMQ, ActiveMQ, AWS Kinesis, …

```java
@ApplicationScoped
public class OrderProcessor {

    @Outgoing("orders-out")             // posílá do kanálu
    public Order placeOrder(OrderDto dto) {
        return new Order(...);          // automaticky odejde
    }

    @Incoming("orders-out")             // přijímá z kanálu
    public void processOrder(Order order) {
        // zpracování příchozí zprávy
        inventoryService.reserve(order);
        notificationService.send(order.customer(), "Děkujeme!");
    }
}
```

Konfigurace `microprofile-config.properties`:

```properties
# Producent → Kafka
mp.messaging.outgoing.orders-out.connector=smallrye-kafka
mp.messaging.outgoing.orders-out.topic=orders
mp.messaging.outgoing.orders-out.bootstrap.servers=kafka:9092

# Konzument ← Kafka
mp.messaging.incoming.orders-in.connector=smallrye-kafka
mp.messaging.incoming.orders-in.topic=orders
mp.messaging.incoming.orders-in.group.id=order-processor
```

Anotace `@Outgoing("channel")` a `@Incoming("channel")` *abstrahují brokeru* — kód neví, jestli pod tím běží Kafka, RabbitMQ nebo in-memory broker (užitečné pro testy).

## REST Client — typový synchronní klient (rekapitulace)

Pro úplnost — synchronní volání mezi mikroslužbami v MP řeší **REST Client** (viz [[microprofile|MicroProfile]]):

```java
@RegisterRestClient(configKey = "warehouse")
@Path("/inventory")
public interface WarehouseApi {
    @GET @Path("/{sku}")
    StockLevel get(@PathParam("sku") String sku);
}

@Inject @RestClient
WarehouseApi warehouse;
```

URL se konfiguruje v Config jako `warehouse/mp-rest/url=http://...`.

## Fault Tolerance pro async messaging

Async komunikace má vlastní problémy:

* **Duplikace zpráv** — broker může doručit zprávu vícekrát (`at-least-once` doručení). Konzument musí být *idempotentní* — opakované zpracování stejné zprávy nesmí způsobit duplicitu (např. dvojí stažení částky).
* **Order** — zprávy se mohou doručit *v jiném pořadí*. Aplikace musí být na to připravena, nebo používat *partitioning* (zprávy se stejným klíčem jdou na stejnou partition → ordering uvnitř ní).
* **Poison messages** — zpráva, kterou nelze zpracovat (chybný formát). Po N pokusech přesunout do **Dead Letter Queue (DLQ)**.

## Synchronní + asynchronní hybrid — saga pattern

Pro distribuované transakce přes víc mikroslužeb se používá **saga pattern**: sekvence lokálních transakcí, kde každý krok publikuje *událost* a další služba reaguje. Pokud něco selže, postupně se spouštějí *kompenzační transakce*.

```
1. Order service: vytvoř objednávku (lokální TX) → publikuj "OrderCreated"
2. Inventory service: rezervuj zboží (lokální TX) → publikuj "InventoryReserved"
3. Payment service: stáhni peníze (lokální TX) → publikuj "PaymentDone"
4. Order service: označ jako Confirmed
```

Pokud krok 3 selže → publikuje *PaymentFailed* → kompenzace: kroky 2 (uvolni rezervaci), 1 (zruš objednávku).

Saga je *eventually consistent* — během sekvence je systém v *přechodném* stavu (objednávka existuje, ale ještě není zaplacená). To je daň za async přístup.

## Co si odnést

* **Synchronní vs. asynchronní** — synchronně, když uživatel čeká hned; async pro background workflow, integrace, notifikace.
* **Message queue** (RabbitMQ, ActiveMQ) — point-to-point, work distribution.
* **Pub/sub** (Kafka, Pulsar) — fan-out, event-driven architektura, replay historie.
* **MicroProfile Reactive Messaging** abstrahuje brokeru: `@Outgoing`, `@Incoming`.
* **Saga pattern** pro distribuované transakce.
* **Idempotence** je v async světě *povinná* — broker doručuje at-least-once.

::: link "MicroProfile Reactive Messaging — specification" "https://microprofile.io/specifications/microprofile-reactive-messaging/"
:::

::: link "Apache Kafka — documentation" "https://kafka.apache.org/documentation/"
:::

::: link "RabbitMQ tutorials" "https://www.rabbitmq.com/tutorials"
:::

::: link "Open Liberty — Creating reactive Java microservices" "https://openliberty.io/guides/microprofile-reactive-messaging.html"
:::

::: link "Saga pattern (microservices.io)" "https://microservices.io/patterns/data/saga.html"
:::

::: quiz "Když chcete *jednu událost* doručit *více službám současně*, co zvolíte?"
- [x] Publish/subscribe (Kafka, Pulsar, SNS) — broker rozešle kopii zprávy všem subscriberům.
  > Ano. Pub/sub je *fan-out* model.
- [ ] Message queue (RabbitMQ, SQS) — broker doručí zprávu prvnímu volnému konzumentovi.
  > Queue je 1:1 doručení. Pokud byste pro N služeb chtěli queue, museli byste mít N kopií zprávy v N frontách.
- [ ] Synchronní HTTP volání všech služeb sekvenčně.
  > Funguje, ale máte tight coupling a celé selže, když jedna služba není dostupná.
:::

::: quiz "Co znamená, že konzument musí být *idempotentní*?"
- [x] Opakované zpracování stejné zprávy nesmí vést k odlišnému výsledku oproti jednomu zpracování.
  > Ano. Broker doručuje *at-least-once* (raději 2× než 0×), takže duplikace se občas stane. Idempotence je obrana — např. unique key v DB nebo deduplication ID.
- [ ] Konzument musí být stateless.
  > Ne. Idempotence ≠ stateless. Idempotentní konzument může mít stav (např. dedup tabulku).
- [ ] Konzument zpracuje zprávu právě jednou.
  > To je *exactly-once* sémantika — drahá, vzácně garantovaná. Realističtější je *at-least-once + idempotence*.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, prof. T. Hruška, VUT FIT, část „Synchronní a asynchronní komunikace, message queues, pub/sub" v přednášce „Alternativní technologie a architektury" (slidy 127–130).*
