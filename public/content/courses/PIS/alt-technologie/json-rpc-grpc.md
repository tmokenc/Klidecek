---
title: JSON-RPC a gRPC — moderní RPC nad HTTP
---

REST je *resource-oriented* — operace odpovídají HTTP metodám nad URI. To se hodí pro CRUD, ale **ne pro všechno**. Když potřebujete „zavolat funkci s parametry a dostat výsledek" — typický pojem *Remote Procedure Call* — REST je trochu nepřirozený (kam dát parametry? jakou metodu použít? co s asymetrickými operacemi?).

Moderní RPC technologie tento problém řeší přímo: protokol je **explicitně RPC-orientovaný**, ale jednodušší/výkonnější než historický SOAP.

## JSON-RPC

**JSON-RPC** ([specifikace 2.0, 2010](https://www.jsonrpc.org/specification)) je *minimalistický* RPC protokol. Filozoficky to je „SOAP, ale v JSON a bez ceremoniálu":

* JSON místo XML — menší, čitelnější.
* Transportně nezávislý — typicky HTTP nebo WebSocket.
* Verze 1.0 (2005) a 2.0 (2010).
* **Žádný formální popis rozhraní** (na rozdíl od WSDL/OpenAPI) — dokumentace je věcí poskytovatele.

### Požadavek

```http
POST /api HTTP/1.1
Content-Type: application/json

{
    "jsonrpc": "2.0",
    "method":  "math.isPrime",
    "params":  { "number": 1987 },
    "id":      1
}
```

Pole:

| Pole | Význam |
|---|---|
| `jsonrpc` | Verze protokolu (vždy `"2.0"`). |
| `method` | Název metody (může obsahovat tečku pro namespacing). |
| `params` | Argumenty — pole (poziční) **nebo** objekt (pojmenované). |
| `id` | Identifikátor požadavku — odpověď ho obsahuje. Chybí u *notifikací* (server neodpovídá). |

### Odpověď — úspěch

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "jsonrpc": "2.0",
    "result":  true,
    "id":      1
}
```

### Chybová odpověď

```json
{
    "jsonrpc": "2.0",
    "error": {
        "code":    -32602,
        "message": "Invalid params",
        "data":    "Parameter 'number' must be a positive integer"
    },
    "id": 1
}
```

Předdefinované chybové kódy (`-32700` parse error, `-32600` invalid request, `-32601` method not found, `-32602` invalid params, `-32603` internal error) + rozsah `-32099` až `-32000` je vyhrazen pro implementačně definované serverové chyby. Vlastní (aplikační) kódy musí ležet mimo vyhrazený rozsah `-32768` až `-32000`.

### Dávkové volání

JSON-RPC povoluje **více volání v jedné HTTP zprávě** — pole požadavků:

```json
[
    { "jsonrpc": "2.0", "method": "math.isPrime", "params": {"number": 7},  "id": 1 },
    { "jsonrpc": "2.0", "method": "math.isPrime", "params": {"number": 10}, "id": 2 }
]
```

Server vrátí pole odpovědí (v libovolném pořadí — `id` slouží k spárování).

### Kde JSON-RPC potkáte

* **Bitcoin/Ethereum nodes** — `bitcoind`, `geth` mají JSON-RPC API.
* **Cardano**, **Solana** — blockchain RPC.
* **Microsoft Language Server Protocol (LSP)** — komunikace mezi IDE a language server.
* **Model Context Protocol (MCP)** — Anthropic AI protokol staví na JSON-RPC 2.0 (viz [[mcp-protocol]]).

JSON-RPC je dobrá volba pro *malé interní RPC* — ne pro veřejné HTTP API (tam výhry REST/OpenAPI).

## gRPC — vysokovýkonné RPC od Googlu

**gRPC** ([2016, Google → CNCF](https://grpc.io/)) je *moderní inkarnace* myšlenky SOAP, ale s několika klíčovými změnami:

| Aspekt | SOAP | gRPC |
|---|---|---|
| **Přenos** | HTTP/1.1, textový XML | HTTP/2, binární Protocol Buffers |
| **Popis rozhraní** | WSDL (XML, ~stovky řádků) | `.proto` (DSL, ~desítky řádků) |
| **Generování kódu** | ano (verbose proxy) | ano (čistý kód) |
| **Streamování** | ne | ano (server, client, obousměrné) |
| **Velikost zprávy** | velká (XML envelope) | malá (binární) |
| **Typický scénář** | enterprise B2B integrace | komunikace mezi mikroslužbami |

### Protocol Buffers — schema language

**Protocol Buffers** (Protobuf) je binární serializační formát + IDL (Interface Description Language). Schema definujete v `.proto`:

```protobuf
syntax = "proto3";
package math;

service MathService {
  rpc IsPrime (PrimeRequest) returns (PrimeResponse);
}

message PrimeRequest {
  int64 number = 1;       // tag 1
}

message PrimeResponse {
  bool result = 1;
}
```

Číselné *tagy* (`= 1`) identifikují pole *v binárním přenosu*. Při změně názvu pole nedojde k breaking change — *číselný tag* je kontrakt.

Z `.proto` souboru generátor (`protoc` plugin) vytvoří *zdrojový kód pro libovolný jazyk*: Java, Python, Go, C++, C#, Ruby, JavaScript, PHP, …

### Typy komunikace

gRPC podporuje *čtyři vzory* (díky HTTP/2 multiplexing/streaming):

* **Unary RPC** — `rpc Method (Req) returns (Resp)` — klasické: 1 požadavek, 1 odpověď.
* **Server streaming** — `rpc Method (Req) returns (stream Resp)` — klient pošle 1 zprávu, server vrací *proud* odpovědí (např. live tail logů).
* **Client streaming** — `rpc Method (stream Req) returns (Resp)` — klient streamuje data, server vrátí jeden výsledek na konci (např. upload velkého souboru po kouscích).
* **Bidirectional streaming** — `rpc Method (stream Req) returns (stream Resp)` — *full-duplex* (chat, multiplayer hra, real-time analytics).

### Klient — Python

```python
import grpc
import math_pb2, math_pb2_grpc

channel = grpc.insecure_channel('localhost:50051')
stub = math_pb2_grpc.MathServiceStub(channel)

request = math_pb2.PrimeRequest(number=1987)
response = stub.IsPrime(request)

print(response.result)     # True
```

### Server — Python

```python
import grpc
from concurrent import futures
import math_pb2_grpc, math_pb2

class MathServicer(math_pb2_grpc.MathServiceServicer):
    def IsPrime(self, request, context):
        n = request.number
        is_prime = n > 1 and all(
            n % i != 0 for i in range(2, int(n**0.5) + 1))
        return math_pb2.PrimeResponse(result=is_prime)

server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
math_pb2_grpc.add_MathServiceServicer_to_server(MathServicer(), server)
server.add_insecure_port('[::]:50051')
server.start()
server.wait_for_termination()
```

### Server — Java + Open Liberty

**Open Liberty** (referenční Jakarta EE server) podporuje gRPC od verze 22 přes feature `grpc-1.0`. Service je *CDI bean* rozšiřující vygenerovanou `ImplBase`:

```xml
<!-- server.xml -->
<featureManager>
    <feature>grpc-1.0</feature>
    <feature>grpcClient-1.0</feature>
    <feature>cdi-4.0</feature>
</featureManager>

<!-- gRPC sdílí port s HTTP/2; volitelná konfigurace pro všechny služby -->
<grpc target="*" maxInboundMessageSize="1048576"/>

<httpEndpoint id="defaultHttpEndpoint"
              httpPort="9080"
              httpsPort="9443"/>
```

Klíčové vlastnosti integrace:

* gRPC běží na **stejném portu** jako HTTP/2 — žádný samostatný port není potřeba.
* Všechny CDI beany rozšiřující `ImplBase` jsou automaticky nalezeny a zaregistrovány.

### Klient — Java

```java
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

ManagedChannel channel = ManagedChannelBuilder
    .forAddress("localhost", 9080)
    .usePlaintext()
    .build();

MathServiceGrpc.MathServiceBlockingStub stub =
    MathServiceGrpc.newBlockingStub(channel);

PrimeRequest request = PrimeRequest.newBuilder()
    .setNumber(1987)
    .build();
PrimeResponse response = stub.isPrime(request);
System.out.println(response.getResult());
```

### Maven závislosti pro gRPC Java

```xml
<dependencies>
    <dependency>
        <groupId>io.grpc</groupId>
        <artifactId>grpc-stub</artifactId>
        <version>1.63.0</version>
    </dependency>
    <dependency>
        <groupId>io.grpc</groupId>
        <artifactId>grpc-protobuf</artifactId>
        <version>1.63.0</version>
    </dependency>
</dependencies>
```

Kód se generuje z `.proto` pluginem `protobuf-maven-plugin`. Open Liberty poskytuje *runtime* — není třeba server-side závislosti.

## Srovnání všech API stylů

::: svg "Srovnání REST / JSON-RPC / gRPC / GraphQL / SOAP"
<svg viewBox="0 0 540 260" xmlns="http://www.w3.org/2000/svg">
  <text x="120" y="18" font-size="11" font-weight="600" fill="var(--text)">Aspekt</text>
  <text x="220" y="18" font-size="11" font-weight="600" fill="oklch(0.40 0.18 142)">REST</text>
  <text x="285" y="18" font-size="11" font-weight="600" fill="oklch(0.40 0.18 80)">JSON-RPC</text>
  <text x="360" y="18" font-size="11" font-weight="600" fill="oklch(0.40 0.18 22)">gRPC</text>
  <text x="420" y="18" font-size="11" font-weight="600" fill="oklch(0.40 0.18 340)">GraphQL</text>
  <text x="490" y="18" font-size="11" font-weight="600" fill="oklch(0.40 0.18 264)">SOAP</text>
  <line x1="20" y1="26" x2="540" y2="26" stroke="var(--line)"/>

  <text x="20" y="48" font-size="11" fill="var(--text)">Přenos</text>
  <text x="220" y="48" font-size="10" fill="var(--text)">HTTP/1.1</text>
  <text x="285" y="48" font-size="10" fill="var(--text)">libovolný</text>
  <text x="360" y="48" font-size="10" fill="var(--text)">HTTP/2</text>
  <text x="420" y="48" font-size="10" fill="var(--text)">HTTP/1.1</text>
  <text x="490" y="48" font-size="10" fill="var(--text)">HTTP+</text>

  <text x="20" y="70" font-size="11" fill="var(--text)">Formát</text>
  <text x="220" y="70" font-size="10" fill="var(--text)">JSON/XML</text>
  <text x="285" y="70" font-size="10" fill="var(--text)">JSON</text>
  <text x="360" y="70" font-size="10" fill="var(--text)">Protobuf</text>
  <text x="420" y="70" font-size="10" fill="var(--text)">JSON</text>
  <text x="490" y="70" font-size="10" fill="var(--text)">XML</text>

  <text x="20" y="92" font-size="11" fill="var(--text)">Popis API</text>
  <text x="220" y="92" font-size="10" fill="var(--text)">OpenAPI</text>
  <text x="285" y="92" font-size="10" fill="var(--text)">—</text>
  <text x="360" y="92" font-size="10" fill="var(--text)">.proto</text>
  <text x="420" y="92" font-size="10" fill="var(--text)">SDL schema</text>
  <text x="490" y="92" font-size="10" fill="var(--text)">WSDL</text>

  <text x="20" y="114" font-size="11" fill="var(--text)">Gen. kódu</text>
  <text x="220" y="114" font-size="10" fill="var(--text)">volitelně</text>
  <text x="285" y="114" font-size="10" fill="var(--text)">—</text>
  <text x="360" y="114" font-size="10" fill="var(--text)">ano</text>
  <text x="420" y="114" font-size="10" fill="var(--text)">volitelně</text>
  <text x="490" y="114" font-size="10" fill="var(--text)">ano</text>

  <text x="20" y="136" font-size="11" fill="var(--text)">Streaming</text>
  <text x="220" y="136" font-size="10" fill="var(--text)">omezené</text>
  <text x="285" y="136" font-size="10" fill="var(--text)">ne</text>
  <text x="360" y="136" font-size="10" fill="var(--text)">ano (4 typy)</text>
  <text x="420" y="136" font-size="10" fill="var(--text)">Subscriptions</text>
  <text x="490" y="136" font-size="10" fill="var(--text)">ne</text>

  <text x="20" y="158" font-size="11" fill="var(--text)">Čitelnost</text>
  <text x="220" y="158" font-size="10" fill="var(--text)">vysoká</text>
  <text x="285" y="158" font-size="10" fill="var(--text)">vysoká</text>
  <text x="360" y="158" font-size="10" fill="var(--text)">nízká (bin.)</text>
  <text x="420" y="158" font-size="10" fill="var(--text)">vysoká</text>
  <text x="490" y="158" font-size="10" fill="var(--text)">střední</text>

  <text x="20" y="180" font-size="11" fill="var(--text)">Hlavní cíl</text>
  <text x="220" y="180" font-size="10" fill="var(--text)">public web API</text>
  <text x="285" y="180" font-size="10" fill="var(--text)">jednoduché RPC</text>
  <text x="360" y="180" font-size="10" fill="var(--text)">mikroslužby</text>
  <text x="420" y="180" font-size="10" fill="var(--text)">flexible UI</text>
  <text x="490" y="180" font-size="10" fill="var(--text)">enterprise</text>

  <text x="270" y="220" text-anchor="middle" font-size="10" fill="var(--text-faint)" font-style="italic">Není jeden vítěz — každý styl má svou doménu, kde je nejvhodnější.</text>
</svg>
:::

## Kdy zvolit který protokol

Praktický doporučovací strom:

* **Public REST API** → REST + OpenAPI.
* **Komplexní UI s flexibilními požadavky** → GraphQL.
* **Komunikace mikroslužeb v jednom datovém centru** → gRPC (binární výkon, streaming, code-gen).
* **Jednoduché interní RPC, dva systémy** → JSON-RPC nebo prostě REST.
* **Integrace s legacy nebo veřejnou správou** → SOAP (pokud to ta strana vyžaduje).
* **AI nástrojové rozhraní** → MCP (JSON-RPC nad stdio/HTTP, viz [[mcp-protocol]]).

::: link "JSON-RPC 2.0 specification" "https://www.jsonrpc.org/specification"
:::

::: link "gRPC documentation" "https://grpc.io/docs/"
:::

::: link "Protocol Buffers — language guide (proto3)" "https://protobuf.dev/programming-guides/proto3/"
:::

::: link "Open Liberty — gRPC guide" "https://openliberty.io/guides/grpc-intro.html"
:::

::: quiz "Co je hlavní výhoda gRPC oproti REST/JSON pro komunikaci mezi mikroslužbami?"
- [x] Binární Protobuf je menší a rychlejší než JSON, HTTP/2 multiplexuje více volání na jednom spojení, code generation eliminuje boilerplate.
  > Ano. To je triáda výhod — kompaktnost + multiplexing + auto-gen klient/server.
- [ ] gRPC podporuje SQL dotazy.
  > Ne, gRPC je obecný RPC, neřeší persistenci.
- [ ] gRPC je čitelnější v curl.
  > Naopak — Protobuf je binární, špatně se ladí bez tooling. Z toho důvodu se v UI/public API stále preferuje JSON.
:::

::: quiz "Proč JSON-RPC neudává žádný popis rozhraní (na rozdíl od WSDL)?"
- [x] Filozoficky — JSON-RPC je *minimalistický* protokol; popis API je věcí poskytovatele (dokumentace, OpenAPI-like spec).
  > Ano. Cena: žádný auto-code-gen klient. Výhoda: nulová ceremonie.
- [ ] JSON-RPC bylo navrženo před XML Schema.
  > Ne, JSON-RPC vznikl v roce 2005, XML Schema dávno existoval. Šlo o vědomé zjednodušení.
- [ ] Popis API JSON-RPC obsahuje, ale je v binárním formátu.
  > Ne. Specifikace 2.0 vůbec popis nezmiňuje.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, prof. T. Hruška, VUT FIT, část „JSON-RPC a gRPC" v přednášce „Alternativní technologie a architektury" (slidy 64–81).*
