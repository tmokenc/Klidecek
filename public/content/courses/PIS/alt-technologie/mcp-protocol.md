---
title: Model Context Protocol (MCP) — AI nástrojové API
---

Předchozí dvě podkapitoly ([[soap-webove-sluzby]], [[json-rpc-grpc]]) probraly historickou linii RPC protokolů — SOAP, JSON-RPC, gRPC. Tato podkapitola ukazuje *nejnovější* člena této rodiny, který staví přímo na JSON-RPC: **Model Context Protocol** pro AI aplikace.

**Model Context Protocol** (MCP) je *otevřený standard*, který firma **Anthropic** zveřejnila koncem roku 2024. Cílem MCP je *sjednotit způsob*, jakým AI aplikace (LLM jako Claude, ChatGPT, Cursor, Continue) komunikují s externími nástroji a daty — soubory, databázemi, API, vývojářskými nástroji.

## Proč MCP vznikl?

LLM modely samy o sobě **nemají přístup k aktuálním datům ani k nástrojům**. Modely vědí to, co bylo v trénovacích datech, a žádné API nemohou volat. Aby aplikace nad LLM (chat, IDE asistent, agent) udělala něco užitečného — *přečetla soubor, zjistila stav databáze, zavolala REST API* — musí být **explicitně připojena** k těm zdrojům.

Před MCP si **každá AI aplikace implementovala vlastní rozhraní** k těmto zdrojům. Cursor měl jednu integraci s Gitem, ChatGPT plugins druhou s webem, Claude Desktop třetí s filesystémem. Stejný nástroj se musel programovat *N-krát* pro různé klienty.

**MCP definuje jeden standardní protokol**:

> Napište nástroj jednou — bude fungovat s libovolným MCP klientem (Claude, Cursor, IDE, vlastní agent…).

To řeší stejný problém, který USB řeší pro periferie nebo Language Server Protocol pro IDE.

## Architektura — tři role

::: svg "MCP architektura — host obsahuje klienty, každý klient se spojuje s jedním serverem"
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="280" height="100" rx="6" fill="oklch(0.62 0.14 264 / 0.06)" stroke="oklch(0.62 0.14 264)" stroke-dasharray="3 2"/>
  <text x="160" y="40" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.18 264)">MCP Host</text>
  <text x="160" y="56" text-anchor="middle" font-size="10" fill="var(--text-muted)">Claude Desktop / Cursor / Continue / …</text>

  <rect x="40" y="70" width="100" height="40" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 22)"/>
  <text x="90" y="92" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Client</text>
  <text x="90" y="105" text-anchor="middle" font-size="9" fill="var(--text-muted)">1 spojení</text>

  <rect x="180" y="70" width="100" height="40" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 22)"/>
  <text x="230" y="92" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Client</text>
  <text x="230" y="105" text-anchor="middle" font-size="9" fill="var(--text-muted)">1 spojení</text>

  <path d="M 90 110 L 90 145" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#arrA)"/>
  <text x="125" y="130" font-size="9" fill="var(--text-muted)">MCP protokol</text>
  <text x="125" y="142" font-size="9" fill="var(--text-muted)">(JSON-RPC 2.0)</text>

  <path d="M 230 110 L 230 145" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#arrA)"/>

  <rect x="40" y="145" width="100" height="50" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 142)"/>
  <text x="90" y="166" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Server</text>
  <text x="90" y="180" text-anchor="middle" font-size="9" fill="var(--text-muted)">filesystem</text>

  <rect x="180" y="145" width="100" height="50" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 142)"/>
  <text x="230" y="166" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Server</text>
  <text x="230" y="180" text-anchor="middle" font-size="9" fill="var(--text-muted)">GitHub</text>

  <text x="330" y="50" font-size="11" fill="var(--text)">Host = aplikace s AI modelem</text>
  <text x="330" y="68" font-size="11" fill="var(--text)">Client = část hostu, 1 spojení</text>
  <text x="330" y="86" font-size="11" fill="var(--text)">Server = nástroje a data</text>
  <text x="330" y="115" font-size="10" fill="var(--text-muted)" font-style="italic">1 host ⟷ N klientů ⟷ N serverů</text>

  <defs>
    <marker id="arrA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.18 22)"/></marker>
  </defs>
</svg>
:::

* **Host** — koncová aplikace, která spouští AI model (Claude Desktop, Cursor, IDE, vlastní chat client). Host řídí životní cyklus MCP klientů a zprostředkovává *modelu přístup k serverům*.
* **Client** — *součást hostu*; udržuje **právě jedno spojení** s jedním serverem. Klient přeposílá požadavky modelu na server a vrací výsledky.
* **Server** — samostatný proces poskytující **nástroje, data nebo prompty**. Může přistupovat k souborovému systému, databázi, externímu API, čemukoli.

## Co server poskytuje

Server může vystavovat *tři typy zdrojů*:

* **Tools** — funkce volatelné modelem, analogie REST API endpointu. *Akce*: čtení souboru, spuštění příkazu, dotaz do DB, …
* **Resources** — strukturovaná data k dispozici pro *kontext*. *Údaje*: obsah souboru, výsledek SQL dotazu, webová stránka.
* **Prompts** — předdefinované šablony pro interakci s modelem. Uložené instrukce, šablony promptů, workflow.

Klient se po připojení dozví, co server nabízí (přes `tools/list`, `resources/list`, `prompts/list`).

## Transport — jak protokol běží

MCP definuje dva transportní mechanismy (od specifikace 2025-03-26):

* **stdio** — server běží jako *podproces* hostu, komunikace probíhá přes *stdin/stdout* JSON-RPC zprávami. Vhodné pro lokální nástroje (filesystem, lokální DB, vývojářské utility).
* **Streamable HTTP** — *jeden HTTP endpoint*. Klient posílá požadavky přes `POST`. Server se rozhoduje per-požadavek, zda odpovědět:
  * `Content-Type: application/json` — klasická synchronní odpověď,
  * `text/event-stream` — Server-Sent Events proud (pro streaming, dlouhotrvající operace).
  * Session se udržuje přes hlavičku `MCP-Session-Id`, klient se může *znovupřipojit po výpadku*.

Původní transport **HTTP + SSE** (spec 2024-11-05) vyžadoval dva oddělené endpointy (`/sse` pro server-to-client + samostatné POST URL); je *deprecated* a nahrazen jednodušším Streamable HTTP.

## Životní cyklus spojení

1. **Host spustí server** (`stdio`) nebo se k němu připojí (`HTTP`).
2. **Inicializace** — výměna verze protokolu a *schopností* (`initialize` zpráva).
3. **Host se dozví, jaké nástroje server nabízí** (`tools/list`).
4. **Model požádá o volání nástroje** → host předá serveru (`tools/call`).
5. **Výsledek** se vrátí modelu jako součást *kontextu*.
6. **Ukončení spojení** — bez speciální zprávy; termination signalizuje transport (u stdio uzavření stdin a ukončení podprocesu, u HTTP uzavření spojení).

## Protokol staví na JSON-RPC 2.0

MCP zprávy mají formát [[json-rpc-grpc|JSON-RPC 2.0]]. Příklad:

### Klient se ptá: jaké máš nástroje?

```json
{
    "jsonrpc": "2.0",
    "id":      1,
    "method":  "tools/list",
    "params":  {}
}
```

### Server odpovídá s katalogem

```json
{
    "jsonrpc": "2.0",
    "id":      1,
    "result": {
        "tools": [{
            "name":        "is_prime",
            "description": "Checks whether a number is prime",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "number": { "type": "integer" }
                }
            }
        }]
    }
}
```

`inputSchema` je *JSON Schema*, kterou model použije k formulaci validního volání.

### Klient volá nástroj

```json
{
    "jsonrpc": "2.0",
    "id":      2,
    "method":  "tools/call",
    "params": {
        "name":      "is_prime",
        "arguments": { "number": 1987 }
    }
}
```

### Server vrací výsledek

```json
{
    "jsonrpc": "2.0",
    "id":      2,
    "result": {
        "content": [{
            "type": "text",
            "text": "true"
        }],
        "isError": false
    }
}
```

## Implementace serveru v Pythonu

```python
from mcp.server import Server
from mcp.types import Tool, TextContent
import mcp.server.stdio as stdio

server = Server("math-server")

@server.list_tools()
async def list_tools():
    return [Tool(
        name="is_prime",
        description="Checks whether a number is prime",
        inputSchema={
            "type": "object",
            "properties": { "number": { "type": "integer" } }
        }
    )]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "is_prime":
        n = arguments["number"]
        is_prime = n > 1 and all(
            n % i != 0 for i in range(2, int(n**0.5) + 1))
        return [TextContent(type="text", text=str(is_prime))]

async def main():
    # spuštění serveru přes stdio
    ...
```

## Implementace serveru v Javě (Open Liberty)

Open Liberty od verze 26.x obsahuje **nativní feature `mcpServer-1.0`**. Implementace je *anotační*, podobně jako JAX-RS/JAX-WS:

```xml
<!-- server.xml -->
<featureManager>
    <feature>mcpServer-1.0</feature>
    <feature>cdi-4.0</feature>
    <feature>servlet-6.0</feature>
</featureManager>
<httpEndpoint id="defaultHttpEndpoint" host="*" httpPort="9080"/>
```

```java
import jakarta.enterprise.context.ApplicationScoped;
import io.openliberty.mcp.server.Tool;
import io.openliberty.mcp.server.ToolArg;
import java.util.stream.LongStream;

@ApplicationScoped
public class MathService {

    @Tool(name = "is_prime",
          description = "Checks whether a number is prime")
    public String isPrime(
            @ToolArg(name = "number",
                     description = "Number to check") long n) {
        boolean prime = n > 1 && LongStream
            .rangeClosed(2, (long) Math.sqrt(n))
            .noneMatch(i -> n % i == 0);
        return Boolean.toString(prime);
    }
}
```

MCP endpoint je automaticky dostupný na **`/mcp`** v kontextu aplikace. Žádný servlet registrovat ručně nemusíte. Bezpečnost se integruje přes Jakarta Security.

### Bez Liberty — pomocí MCP Java SDK

Pokud nechcete Liberty, oficiální **MCP Java SDK** (`io.modelcontextprotocol.sdk:mcp`) funguje v libovolném Servlet kontaineru (Tomcat, Jetty):

```java
import io.modelcontextprotocol.sdk.*;
import io.modelcontextprotocol.sdk.transport.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;

var transport = new HttpServletSseServerTransportProvider(
    new ObjectMapper(), "/", "/sse");

McpServer.sync(transport)
    .serverInfo("math-server", "1.0.0")
    .capabilities(McpSchema.ServerCapabilities.builder()
        .tools(true).build())
    .tools(new McpServerFeatures.SyncToolRegistration(...))
    .build();
```

Maven:

```xml
<dependency>
    <groupId>io.modelcontextprotocol.sdk</groupId>
    <artifactId>mcp</artifactId>
    <version>1.1.0</version>
</dependency>
<dependency>
    <groupId>jakarta.servlet</groupId>
    <artifactId>jakarta.servlet-api</artifactId>
    ...
</dependency>
```

## Existující MCP servery (registry)

Komunita má **stovky** hotových serverů, registrovaných v [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io). Příklady oficiálních:

* **Filesystem** — čtení a zápis souborů na lokálním disku.
* **GitHub** — přístup k repozitářům, issues, pull requestům.
* **PostgreSQL / SQLite** — dotazy do databáze.
* **Web search** — vyhledávání na internetu (Brave, Google).
* **Puppeteer** — ovládání prohlížeče, web scraping.
* **Slack, Google Drive, Notion** — pracovní integrace.

## MCP v informačních systémech

Praktický potenciál pro IS:

* **AI asistent jako jednotné rozhraní** — místo složitých formulářů a sestav: „Najdi mi všechny objednávky zákazníka Novák za poslední měsíc s neuhrazenou platbou."
* **Přístup k více subsystémům najednou** — ERP, CRM, DMS, skladový systém. *Jeden asistent, více MCP serverů*.
* **Automatizace rutinních procesů** — zakládání objednávek, schvalování požadavků, generování reportů přirozeným jazykem.
* **Navigace a ovládání systému hlasem** nebo textem — alternativa k click-based UI.

## Co si odnést

* MCP je *standardizace integračního rozhraní pro AI* — koncepčně blízké LSP (Language Server Protocol).
* Staví na **JSON-RPC 2.0** — žádný nový wire format.
* Definuje **tři role** (Host, Client, Server) a **tři druhy zdrojů** (Tools, Resources, Prompts).
* Dva transporty: **stdio** (lokální) a **Streamable HTTP** (vzdálené, podpora session).
* Pro Jakarta EE existuje *nativní integrace v Open Liberty* (`mcpServer-1.0`) — anotační, ekvivalent JAX-RS/JAX-WS.

::: link "Model Context Protocol — oficiální dokumentace" "https://modelcontextprotocol.io/"
:::

::: link "MCP specification (latest)" "https://spec.modelcontextprotocol.io/"
:::

::: link "MCP server registry" "https://registry.modelcontextprotocol.io/"
:::

::: link "MCP Java SDK" "https://github.com/modelcontextprotocol/java-sdk"
:::

::: link "Open Liberty mcpServer-1.0 feature" "https://openliberty.io/docs/latest/reference/feature/mcpServer-1.0.html"
:::

::: quiz "Jaký je vztah mezi MCP a JSON-RPC?"
- [x] MCP používá JSON-RPC 2.0 jako svůj wire format — všechny zprávy mají strukturu `jsonrpc`/`method`/`params`/`id`.
  > Ano. MCP nevynalezl nový protokol; nasadil JSON-RPC do role *AI tool API*.
- [ ] MCP je předchůdce JSON-RPC.
  > Ne, JSON-RPC existuje od roku 2005, MCP od listopadu 2024.
- [ ] MCP používá Protocol Buffers jako gRPC.
  > Ne, MCP staví na textovém JSON.
:::

::: quiz "Co je rozdíl mezi MCP *Tool* a MCP *Resource*?"
- [x] Tool je *funkce s vedlejším efektem* (akce — zápis souboru, dotaz, …); Resource je *strukturovaná data* (obsah souboru, výsledek query) sloužící jako kontext.
  > Ano. Tool je „dělej něco", Resource je „mám pro tebe data".
- [ ] Tool je pro lokální stdio, Resource pro vzdálené HTTP.
  > Ne — to je transport, ne typ zdroje.
- [ ] Tool je placený, Resource zdarma.
  > Ne, MCP nedefinuje platební model.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, prof. T. Hruška, VUT FIT, část „Model Context Protocol" v přednášce „Alternativní technologie a architektury" (slidy 82–102).*
