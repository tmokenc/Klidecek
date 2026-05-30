---
title: ACID vs. BASE — dvě filozofie konzistence
---

# ACID vs. BASE — dvě filozofie konzistence

V rozsáhlých distribuovaných systémech narážíme na zásadní volbu: chceme **silnou konzistenci** (každý uzel vidí stejná data v každém okamžiku) za cenu zhoršené dostupnosti, nebo **vysokou dostupnost** (systém vždy odpoví) za cenu dočasné nekonzistence? Tradiční relační DB volí konzistenci (ACID). NoSQL databáze obvykle volí dostupnost (BASE — *Basically Available, Soft-state, Eventual consistency*). Tato volba není absolutní — moderní systémy ji *odlaďují* na úrovni jednotlivých operací nebo entit.

## BASE — alternativa k ACID

Akronym **BASE** (Brewer 2000) představuje filozoficky opačný přístup než ACID:

* **B**asically **A**vailable — systém *vždy* odpoví. I při výpadku části uzlů jsou některé požadavky obsloužitelné, i kdyby s neaktuálními daty.
* **S**oft state — stav DB se může *měnit i bez aktivního zápisu* uživatele. Replikace, vyrovnávací paměti, asynchronní propagace způsobují, že "okamžitý stav" není dobře definován.
* **E**ventual consistency — pokud po nějakou dobu nepřijdou nové zápisy, *eventuálně* (časem) se všechny repliky sjednotí. Přechodně mohou různí klienti vidět různá data, ale konvergují.

Příklad: na Facebooku napíšete komentář a kamarád ho hned uvidí na svém timeline. Ale když ho ihned smažete a kamarád znovu načte stránku, *může* komentář ještě vidět (jen několik sekund, než se smazání propaguje). Toto je *eventual consistency* — žádný uživatel není blokován, ale data jsou na okamžik nekonzistentní.

::: svg "Eventual consistency: zápis na uzel A se propaguje na uzly B a C asynchronně. Mezi T1 a T3 mohou klienti vidět různé hodnoty."
<svg viewBox="0 0 540 226" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <text x="50" y="30" fill="var(--text)" font-weight="600">T1: Write x=5 na uzel A</text>
    <circle cx="100" cy="60" r="22" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="100" y="64" text-anchor="middle" fill="white" font-size="10">A: x=5</text>
    <circle cx="200" cy="60" r="22" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="200" y="64" text-anchor="middle" fill="var(--text-muted)" font-size="10">B: x=3</text>
    <circle cx="300" cy="60" r="22" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="300" y="64" text-anchor="middle" fill="var(--text-muted)" font-size="10">C: x=3</text>
  </g>
  <g>
    <text x="50" y="100" fill="var(--text)" font-weight="600">T2: Replikace A→B</text>
    <circle cx="100" cy="130" r="22" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="100" y="134" text-anchor="middle" fill="white" font-size="10">A: x=5</text>
    <circle cx="200" cy="130" r="22" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="200" y="134" text-anchor="middle" fill="white" font-size="10">B: x=5</text>
    <circle cx="300" cy="130" r="22" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="300" y="134" text-anchor="middle" fill="var(--text-muted)" font-size="10">C: x=3</text>
    <text x="380" y="135" fill="var(--text-muted)" font-size="9.5">← klient čte C: ještě 3</text>
  </g>
  <g>
    <text x="50" y="170" fill="var(--text)" font-weight="600">T3: Eventual consistency</text>
    <circle cx="100" cy="200" r="22" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="100" y="204" text-anchor="middle" fill="white" font-size="10">A: x=5</text>
    <circle cx="200" cy="200" r="22" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="200" y="204" text-anchor="middle" fill="white" font-size="10">B: x=5</text>
    <circle cx="300" cy="200" r="22" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="300" y="204" text-anchor="middle" fill="white" font-size="10">C: x=5</text>
    <text x="380" y="205" fill="var(--text-muted)" font-size="9.5">← všechny repliky shodné</text>
  </g>
  <line x1="125" y1="80" x2="175" y2="115" stroke="var(--accent-line)" stroke-dasharray="2 2"/>
  <line x1="225" y1="150" x2="280" y2="185" stroke="var(--accent-line)" stroke-dasharray="2 2"/>
</svg>
:::

## Srovnání filozofií

| | ACID | BASE |
| :--- | :--- | :--- |
| Konzistence | silná, okamžitá | slabá, dočasně neaktuální data |
| Dostupnost | sekundární | primární |
| Strategie | konzervativní (pesimistická) | agresivní (optimistická) |
| Transakce | vnořené, plné | omezené nebo bez transakcí |
| Schéma | striktní, evoluce náročná | flexibilní, snadnější evoluce |
| Cíl | bankovní transakce, integrita | webové služby, sociální sítě |
| Reprezentant | Oracle, PostgreSQL, MySQL | Cassandra, DynamoDB, Riak, MongoDB |

## Kompromisy — nuance konzistence

V praxi není volba "ACID vs. BASE" binární. NoSQL databáze nabízejí *odstupňované úrovně*:

### Tunable consistency (Cassandra)

Pro každou operaci lze nastavit, kolik replik musí potvrdit:

* `ONE` — jedna replika; rychlé, ale nekonzistentní.
* `QUORUM` — většina (R+1 ze 2R+1 replik); silnější garance.
* `ALL` — všechny repliky; nejsilnější, ale jeden výpadek znamená neúspěch.

Pro **read R + write W > N** (kde N je počet replik) platí *silná konzistence* (Cassandra konfigurovatelná na úrovni dotazu).

### Read-your-writes consistency

Klient *vždy uvidí svůj* vlastní zápis (i když ostatní klienti nemusí). Realizováno přes session affinity nebo verzování. Použití: po publikování komentáře *autor* okamžitě vidí komentář, ostatní uvidí později.

### Monotonic reads

Klient nikdy nedostane *starší* hodnotu, než předtím viděl. Realizováno přes monotonní timestamp nebo connection pinning. Použití: čtení timeline neukáže "návrat v čase".

### Causal consistency

Pokud událost A ovlivnila událost B (např. komentář B byl reakcí na A), všichni klienti uvidí A před B. Realizováno přes vektor verzování. Použití: konverzace v chatu se zobrazí ve správném pořadí.

## Strategie řešení nekonzistence

Když data divergují, kdy a jak je sjednotit?

* **Read repair** — během čtení detekovat konflikty a opravit. Pasivní, levné, ale opravy přijdou pomalu.
* **Hinted handoff** — zápis pro dočasně nedostupný uzel se uloží jinam s "hintem"; jakmile se uzel vrátí, předá se. Aktivní opravy.
* **Anti-entropy** — periodická synchronizace přes Merkle trees (porovnání hashů podstromů). Cassandra `nodetool repair`.
* **Conflict resolution** — když dva zápisy vytvořily nekonzistentní hodnoty, kdo vyhraje?
  * **Last-write-wins** (LWW) — newest timestamp. Riziko ztráty zápisu.
  * **CRDTs** (Conflict-free Replicated Data Types) — datové typy, jejichž operace komutují (sets, counters, registers). Bez nutnosti řešení konfliktů.
  * **Vector clocks** — verzování + aplikační rozhodnutí (Dynamo, Riak).

## Kdy ACID, kdy BASE

Volba závisí na *business logice*:

* **Bankovnictví, platby, účetnictví** — ACID je nepostradatelný. Jeden chybný bit ohrozí důvěru.
* **Sociální sítě, doporučovací systémy** — BASE je vhodný. Drobná nekonzistence (komentář pozdě) je akceptovatelná.
* **E-commerce checkout** — hybrid: cart může být BASE (rychle, dočasně), ale platba je ACID.
* **Reporting/analytika** — BASE postačuje, často se pracuje se snímkem dat z předchozího dne.
* **IoT telemetrie** — BASE (eventual consistency); důležitější je propustnost než konzistence v reálném čase.

V moderních architekturách (microservices) se ACID a BASE *kombinují*: každá služba má vlastní úložiště, *eventually consistent* prostřednictvím event-driven komunikace (Kafka). To je tzv. **Saga pattern** — distribuovaná transakce přes kompenzace.

::: viz eventual-consistency-timeline "Posuvník času — zápis na uzel A se propaguje asynchronně. Klient čte z A/B/C → různé úrovně (ONE / QUORUM / ALL) dávají různé záruky."
:::

## Volba je business rozhodnutí, ne technické

Pamatovat — *konzistence není zdarma*. Silná konzistence v distribuovaném systému znamená koordinaci uzlů, latenci, zranitelnost vůči síťovým rozdělením. *Slabá konzistence* znamená rychlost a dostupnost, ale aplikace musí zvládat protichůdná data. Volba není technická, ale závisí na ceně chyby (klíčové pro [[cap-teorem]]). Bankovní převod nesmí chybět zlomek halíře; "like" na Instagramu se vejde do tolerance.

::: link "Brewer, E. A.: Towards Robust Distributed Systems (PODC 2000 keynote)" "https://people.eecs.berkeley.edu/~brewer/cs262b-2004/PODC-keynote.pdf"
:::

::: link "Vogels, W.: Eventually Consistent (CACM 2009)" "https://cacm.acm.org/magazines/2009/1/15777-eventually-consistent/fulltext"
:::

::: link "Pritchett, D.: BASE — An ACID Alternative (ACM Queue 2008)" "https://queue.acm.org/detail.cfm?id=1394128"
:::

---

*Zdroj: UPA přednáška *NoSQL databáze* (Rychlý, 23. září 2025). Externí reference: Pritchett, D.: *BASE — An ACID Alternative*, ACM Queue 2008; Vogels, W.: *Eventually Consistent — Revisited*, CACM 2009; Strauch, C.: *NoSQL Databases*, Stuttgart 2011; Bailis, P., Ghodsi, A.: *Eventual Consistency Today — Limitations, Extensions, and Beyond*, CACM 2013.*
