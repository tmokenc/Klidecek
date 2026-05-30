---
title: Monolit, SOA, mikroslužby
---

Třívrstvá architektura odpovídá *monolitické* aplikaci: celá aplikační vrstva běží jako jeden proces nasazovaný jako jeden balík. Při růstu systému tento přístup naráží na své limity a přicházejí *distribuované* architektury — především **service-oriented architecture (SOA)** a **mikroslužby**.

## Monolitická architektura

::: viz pis-mono-vs-micro "Přepněte mezi monolitem a mikroslužbami a všimněte si rozdílů v databázi, deploymentu a sdílení technologií."
:::

* Jedna aplikace, jedna databáze, jednotné webové (aplikační) rozhraní.
* Business moduly (objednávky, sklad, fakturace, …) jsou *uvnitř* téhož procesu, ale logicky oddělené (typicky package/modul).

**Výhody:** jednotná technologie, sdílený popis dat (jeden ORM model), snadné refactorování napříč moduly, rychlé nasazení (jeden balík), snadné transakce přes celou doménu.

**Nevýhody:** s rostoucí velikostí kódu klesá udržovatelnost, dlouhé build/test cykly, **nelze rychle aktualizovat pouze část** — každá změna vede k novému deploy celého celku. Pokud použité technologie zastarají, přepsání monolitu je téměř nemožné (často trvá léta).

## Mikroslužby

::: svg "Schéma aplikace s několika mikroslužbami (příklad: doménová dekompozice e-commerce)"
<svg viewBox="0 0 500 240" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="100" width="55" height="40" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="47" y="125" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text)">Klient</text>
  <line x1="75" y1="120" x2="115" y2="120" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#m)"/>
  <rect x="115" y="100" width="80" height="40" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/>
  <text x="155" y="120" text-anchor="middle" font-size="10" font-weight="600" fill="var(--accent)">API Gateway</text>
  <text x="155" y="133" text-anchor="middle" font-size="9" fill="var(--accent)">routing + auth</text>
  <line x1="195" y1="115" x2="250" y2="55" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#m)"/>
  <line x1="195" y1="120" x2="250" y2="120" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#m)"/>
  <line x1="195" y1="125" x2="250" y2="185" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#m)"/>
  <rect x="250" y="35" width="100" height="42" rx="4" fill="oklch(0.62 0.14 22 / 0.10)" stroke="oklch(0.62 0.14 22)"/>
  <text x="300" y="52" text-anchor="middle" font-size="10" font-weight="600" fill="oklch(0.42 0.14 22)">Katalog</text>
  <ellipse cx="300" cy="68" rx="22" ry="6" fill="oklch(0.62 0.14 22 / 0.18)" stroke="oklch(0.62 0.14 22)" stroke-width="0.7"/>
  <text x="300" y="72" text-anchor="middle" font-size="8" fill="oklch(0.42 0.14 22)" font-family="var(--font-mono)">PostgreSQL</text>
  <rect x="250" y="100" width="100" height="42" rx="4" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.62 0.14 264)"/>
  <text x="300" y="117" text-anchor="middle" font-size="10" font-weight="600" fill="oklch(0.42 0.14 264)">Objednávky</text>
  <ellipse cx="300" cy="133" rx="22" ry="6" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)" stroke-width="0.7"/>
  <text x="300" y="137" text-anchor="middle" font-size="8" fill="oklch(0.42 0.14 264)" font-family="var(--font-mono)">MongoDB</text>
  <rect x="250" y="165" width="100" height="42" rx="4" fill="oklch(0.62 0.14 142 / 0.10)" stroke="oklch(0.62 0.14 142)"/>
  <text x="300" y="182" text-anchor="middle" font-size="10" font-weight="600" fill="oklch(0.42 0.14 142)">Platby</text>
  <ellipse cx="300" cy="198" rx="22" ry="6" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)" stroke-width="0.7"/>
  <text x="300" y="202" text-anchor="middle" font-size="8" fill="oklch(0.42 0.14 142)" font-family="var(--font-mono)">Redis</text>
  <line x1="350" y1="120" x2="395" y2="120" stroke="var(--text-faint)" stroke-width="0.8" stroke-dasharray="3 3" marker-end="url(#m)"/>
  <rect x="395" y="100" width="80" height="40" rx="4" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="435" y="120" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text)">Notifikace</text>
  <text x="435" y="133" text-anchor="middle" font-size="9" fill="var(--text-muted)">externí adapter</text>
  <defs>
    <marker id="m" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

Aplikace se rozdělí na malé samostatné části. Každá mikroslužba obsahuje:

* **vlastní databázi** (nepřístupnou zvenčí),
* **business logiku** pro jednu funkční doménu,
* **aplikační rozhraní** — typicky REST API nad HTTP, alternativně gRPC, GraphQL nebo asynchronní zprávy přes broker (Kafka, Pulsar).

Na každou mikroslužbu typicky pracuje **malý tým vývojářů** — neformální *„two-pizza rule"* z Amazonu říká, že velikost týmu má být taková, aby ho nasytily dvě pizzy (~6–8 lidí).

**Výhody:**

* *Technologická nezávislost* — každá služba si volí jazyk, framework, databázi sama.
* *Nezávislý deployment* — aktualizace jedné služby nevyžaduje restart zbytku.
* *Škálování po komponentách* — replikujeme jen tu část, která je úzkým hrdlem.
* *Odolnost vůči zastarání* — staré služby lze postupně přepsat bez velkého třesku.

**Nevýhody a rizika:**

* *Testovatelnost* je obtížnější — služba závisí na dalších službách, je nutné používat mocky a integrační testy.
* *Režie komunikace* — síť není lokální volání, mění se sémantika chyb (timeout, retry, exactly-once).
* *Riziko nekompatibility* — verze API se musí pečlivě řídit.
* *Řetězové selhání* (cascade failure) — výpadek jedné služby může přetížit ostatní; nutné použít vzorce jako *circuit breaker* a *bulkhead*.
* *Datová konzistence* — bez sdílené DB se musí řešit *eventual consistency*, distribuované transakce (sagy).

## Vlastnosti dobré mikroslužby

* **Vnější API** dostatečně obecné — reprezentuje business logiku, ne schéma databáze (které je skryté).
* **Externí konfigurace** — žádné natvrdo zadané hodnoty, vše přes proměnné prostředí nebo konfigurační službu (12-factor princip).
* **Logování** — strukturované, do centrálního úložiště (ELK, Loki).
* **Vzdálené sledování (observability):**
  * *Telemetrie* — počty volání, latence, výjimky (Prometheus + Grafana).
  * *Health check* — endpoint hlásící živost (`/health`, *liveness* + *readiness* probes pro Kubernetes).
  * *Distribuovaný tracing* — OpenTelemetry, Jaeger.

## Implementace mikroslužeb

V principu lze použít libovolnou technologii — jediným kontaktním bodem je API. V praxi se osvědčily:

* **Node.js** (Express, NestJS) + MongoDB — populární rychlé řešení pro web.
* **Java**:
  * **Spring Boot** — nejrozšířenější v enterprise světě.
  * **MicroProfile** (Open Liberty, Quarkus, Helidon) — standard pro Jakarta EE-kompatibilní mikroslužby.
  * Ultralehké rámce jako [Spark](https://github.com/perwendel/spark).
* **Go**, **.NET (ASP.NET Core)**, **Python (FastAPI)** — všechny mají v ekosystému dobrou podporu pro REST API, observability a kontejnerizaci.

::: link "Lewis, J. & Fowler, M. — Microservices (2014)" "https://martinfowler.com/articles/microservices.html"
:::

::: link "Newman, S. — Building Microservices (kniha)" "https://samnewman.io/books/building_microservices/"
:::

::: link "The Twelve-Factor App" "https://12factor.net/"
:::

::: link "MicroProfile — specifikace pro Java mikroslužby" "https://microprofile.io/"
:::

::: quiz "Která vlastnost je *nezbytná* pro správně navrženou mikroslužbu?"
- [x] Vlastní (privátní) databáze, do které jiné služby nesahají přímo.
  > Ano. Sdílená databáze je antipattern — porušuje izolaci a vrací nás k monolitu se všemi jeho problémy.
- [ ] Implementace ve stejném jazyce jako ostatní mikroslužby.
  > Naopak — technologická nezávislost je jedna z hlavních výhod.
- [ ] Společný build pipeline, který nasadí všechny služby najednou.
  > Nezávislý deployment je klíčová vlastnost. Společný build = monolit v převleku.
:::

::: quiz "Kdy *nemá* smysl jít cestou mikroslužeb?"
- [x] Při malém týmu a malém systému, kde monolit zvládne všechny požadavky.
  > Přesně. Mikroslužby přinášejí distribuovanou složitost, která je investicí; u malého projektu se nevrátí. Začněte monolitem (Fowler: „Monolith First").
- [ ] Když potřebujeme aktualizovat různé části systému různě často.
  > To je *důvod* pro mikroslužby, ne proti nim.
- [ ] Když chceme experimentovat s různými databázovými technologiemi.
  > To je opět argument *pro* mikroslužby (polyglot persistence).
:::

---

*Zdroj: přednášky PIS — prof. T. Hruška a doc. R. Burget, VUT FIT, část „Distribuované architektury — mikroslužby". Pro hlubší studium doporučuji článek Lewis & Fowler a knihu Sama Newmana.*
