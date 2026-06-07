---
title: Message-Oriented Middleware (MOM)
---

Zatímco sběrnice (viz [[esb-kontejner]]) pracuje na aplikační úrovni s logikou a překlady, samotný nízkoúrovňový přenos dat obstarává **Message-Oriented Middleware (MOM)**. MOM přepravuje data po **diskrétních zprávách** (messages) — samostatných, zarámovaných jednotkách — a ne jako kontinuální datový proud (stream). Komunikace je **asynchronní** a probíhá přes prostředníka, **brokera**.

## Tři roviny dekouplingu

Hlavní hodnotou MOM je úplné rozvolnění vazeb (decoupling) mezi odesílatelem a příjemcem. Tradičně se rozlišují **tři nezávislé roviny**:

| Rovina | Co znamená | Bez MOM (přímé RPC) |
| :--- | :--- | :--- |
| **Prostorová** | Strany se neznají adresou; komunikují přes logickou destinaci u brokera. | Klient musí znát IP/adresu serveru. |
| **Časová** | Strany nemusí být online současně; broker zprávu uchová. | Obě strany musí běžet ve stejný okamžik. |
| **Synchronizační** | Odeslání je neblokující — aplikace pokračuje hned dál. | Volající blokuje a čeká na odpověď. |

* **Prostorový dekoupling** — odesílatel nezná IP ani umístění příjemce; oba znají jen **logickou destinaci** (frontu/téma) spravovanou centrálním brokerem.
* **Časový dekoupling** — odesílatel a příjemce nemusí být online ve stejnou chvíli. MOM funguje jako dočasné úložiště: je-li cíl mimo provoz, broker zprávu **uchová** a doručí ji po jeho návratu.
* **Synchronizační dekoupling** — volání pro odeslání je **neblokující**. Aplikace zprávu jen předá MOM a ihned pokračuje, nečeká na odezvu příjemce.

Tato trojice je kanonická charakteristika asynchronního zasílání zpráv — formuloval ji Eugster a kol. v práci *The Many Faces of Publish/Subscribe* (ACM Computing Surveys, 2003).

## Fronty a spolehlivost doručení

MOM ukládá zprávy do **front (queues)**, u nichž lze nastavit pravidla — typicky pořadí **FIFO** (first-in, first-out). Klíčová volba je **režim perzistence**, který určuje, co se stane se zprávou při pádu brokera:

| | **Persistentní** | **Non-persistentní** |
| :--- | :--- | :--- |
| Uložení | zapsáno **na disk** (durable store) | jen v **operační paměti** |
| Při pádu brokera | zpráva **přežije** | zpráva **se ztratí** |
| Propustnost | nižší (čeká na zápis) | vyšší (bleskové) |
| Garance | „právě jednou" (once-and-only-once) | „nejvýše jednou", riziko ztráty |

* **Persistentní režim** — broker zprávu před potvrzením odesílateli **zapíše na disk**. To zajišťuje doručení **„právě jednou"** (once-and-only-once) i při katastrofálním výpadku — z trvalé fronty nebo trvalého (durable) odběru se zpráva neztratí. Daní je nižší propustnost (čeká se na zápis).
* **Non-persistentní režim** — zpráva žije jen **v paměti** brokera. Dává **maximální propustnost**, ale při pádu brokera (či výpadku napájení) **mizí**. Vhodné jen tam, kde aplikace ztrátu jednotlivé zprávy unese.

V JMS je mimochodem výchozím nastavením `PERSISTENT` — bezpečné chování má přednost před výkonem.

## Dva modely zasílání

MOM definuje dva fundamentální modely doručování. Liší se v jediné, ale zásadní věci: **kolika příjemcům** se jedna zpráva doručí.

::: viz pdi-mom-models "Přepni model a posílej zprávy. V Point-to-Point dostane každou zprávu právě jeden konzument (round-robin = load balancing); v Publish-Subscribe ji dostanou všichni odběratelé tématu (1:N)."
:::

* **Point-to-Point (PTP)** — zpráva jde přes **frontu** od producenta k **jedinému** konzumentovi. Naslouchá-li frontě více příjemců, zprávu dostane **právě jeden** z nich. Tím vzniká přirozené **rozkládání zátěže (load balancing)** mezi pracovní instance — ideální pro asynchronní spouštění úkolů, kde každý úkol smí proběhnout jen jednou.
* **Publish-Subscribe (Pub/Sub)** — producent vystaví událost na **téma (topic)** a zpráva se doručí **všem** konzumentům, kteří se k tématu přihlásili (model **1:N**). Používá se pro plošné upozorňování na události a rozesílání notifikací nezávislým podsystémům.

Stejná zpráva tedy v PTP „zmizí" do jednoho workeru, kdežto v Pub/Sub se rozkopíruje všem odběratelům — proto je výběr modelu rozhodnutím o *sémantice doručení*, ne jen o výkonu.

## Přenosové protokoly

Pro fyzický transport zpráv mezi klienty a brokerem se na této vrstvě používají standardizované protokoly. Tři nejčastější:

| Protokol | Charakter | Výchozí port | Typické nasazení |
| :--- | :--- | :--- | :--- |
| **AMQP** | binární, bohatý (fronty, směrování, transakce, ACK) | 5672 | spolehlivá backendová integrace |
| **MQTT** | binární, ultra-lehký pub/sub (5 metod) | 1883 | IoT, senzory, omezená zařízení |
| **STOMP** | textový, jednoduchý (à la HTTP, `SEND`/`SUBSCRIBE` na destinaci) | 61613 | snadná implementace, skriptování |

**AMQP** (Advanced Message Queuing Protocol) je plnohodnotný brokerovaný protokol s frontami, flexibilním směrováním, transakcemi a potvrzováním — vhodný pro páteřní integraci. **MQTT** (Message Queuing Telemetry Transport) je naopak minimalistický pub/sub navržený pro **omezená zařízení** (IoT, senzory) s nízkou režií. **STOMP** (Simple/Streaming Text Oriented Messaging Protocol) je jediný **textový** z této trojice; nepracuje přímo s frontami/tématy, ale posílá na pojmenovanou *destinaci*, kterou si broker namapuje interně.

::: quiz "Objednávku má zpracovat právě jedna ze tří identických pracovních instancí. Jaký model a režim zvolit?"
- [x] Point-to-Point (fronta) v persistentním režimu — zprávu dostane jeden worker (load balancing) a přežije i pád brokera.
  > Správně. PTP zaručí doručení právě jednomu konzumentovi (úkol se neprovede vícekrát) a persistence chrání objednávku před ztrátou při výpadku.
- [ ] Publish-Subscribe (téma) — všichni tři workeři objednávku zpracují paralelně.
  > Ne. V Pub/Sub by objednávku zpracovaly všechny tři instance (1:N) → trojí zaúčtování. To je přesně to, čemu se chceme vyhnout.
- [ ] Point-to-Point v non-persistentním režimu kvůli rychlosti.
  > Model je správný, ale non-persistence riskuje ztrátu objednávky při pádu brokera — pro platební/objednávkový tok nepřijatelné.
:::

::: link "The Many Faces of Publish/Subscribe — Eugster et al., ACM Computing Surveys 2003 (dekoupling space/time/sync)" "http://www.cs.ru.nl/~marko/onderwijs/oss/eugster-al_publish-subscribe.pdf"
:::

::: link "Jakarta Messaging (JMS) — specifikace (delivery mode, PTP vs Pub/Sub, durable subscription)" "https://jakarta.ee/specifications/messaging/"
:::

::: link "RabbitMQ — Which protocols does RabbitMQ support? (AMQP, MQTT, STOMP)" "https://www.rabbitmq.com/docs/protocols"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=W4_aGb_MOls" "What is a Message Queue and When should you use Messaging Queue Systems Like RabbitMQ and Kafka" "Hussein Nasser"
:::

*Zdroj: SZZ NADE — předmět Prostředí distribuovaných aplikací, VUT FIT. Externí reference: Eugster, P. et al.: The Many Faces of Publish/Subscribe (ACM Computing Surveys, 2003); Jakarta Messaging (JMS) specifikace; RabbitMQ dokumentace (AMQP/MQTT/STOMP); OASIS AMQP 1.0, MQTT 3.1.1/5.0.*
