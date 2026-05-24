---
title: Limity relačních databází a motivace NoSQL
---

# Limity relačních databází a motivace NoSQL

Relační databáze (RDBMS) dominovaly databázovému světu od 80. let pro silnou konzistenci (ACID), zralé nástroje a univerzální SQL. Avšak rozvoj webu, cloudových služeb a IoT v 2000s a 2010s odhalil jejich limity — *vertikální škálování* (silnější HW) má strop a *horizontální škálování* (více uzlů) je v RDBMS netriviální. Vznikly proto **NoSQL** (*Not Only SQL*) databáze — třída specializovaných úložišť bez relačního modelu, navržených pro distribuci, vysoký výkon a flexibilní schémata. Pro klasické informační systémy zůstávají RDBMS nejvhodnější, NoSQL je vhodný pro **specifické případy** (distribuovaná úložiště, velmi velká data, nestrukturované formáty).

## Co poskytuje relační databáze

* **Tabulky** = matematické relace nad doménami sloupců; každý sloupec má pevně daný atomický typ.
* **Cizí klíče** = referenční integrita mezi tabulkami.
* **Normální formy** (1NF–6NF, EKNF, DKNF) — redukují redundanci a anomálie.
* **SQL** — deklarativní jazyk dotazování postavený na relační algebře (SELECT, JOIN, GROUP BY, …).
* **ACID transakce** — Atomicity, Consistency, Isolation, Durability.

ACID poskytuje silné záruky, ale je *náročné* — vyžaduje koordinaci (locking, two-phase commit, write-ahead log) a omezuje paralelismus i dostupnost.

## ACID — čtyři pilíře relační transakce

* **Atomicity** — transakce proběhne celá, nebo vůbec; žádný "polovičatý" stav i v případě HW/SW chyby.
* **Consistency** — DB se přesune z jednoho platného stavu do druhého. Pravidla integrity (PK, FK, CHECK, NOT NULL) jsou dodržena. Pokud nelze, transakce neuspěje.
* **Isolation** — souběžné transakce se neovlivňují. Serializovatelnost (jako by běžely sekvenčně). Pořadí však není zajištěno.
* **Durability** — po úspěšném commitu je transakce **trvale uložena** — odolá pádu HW/SW (write-ahead log + fsync na disk).

::: svg "ACID transakce: atomicita (vše-nebo-nic), konzistence (pravidla dodržena), izolace (paralelní transakce se neovlivní), trvanlivost (po commit odolá pádu)."
<svg viewBox="0 0 540 170" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="20" y="20" width="120" height="130" fill="var(--bg-inset)" stroke="var(--accent)" rx="6"/>
    <text x="80" y="42" text-anchor="middle" fill="var(--accent)" font-weight="700">A</text>
    <text x="80" y="58" text-anchor="middle" fill="var(--text)" font-size="10">Atomicity</text>
    <text x="80" y="78" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">vše nebo nic</text>
    <text x="80" y="98" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">žádný mezistav</text>
    <text x="80" y="124" text-anchor="middle" fill="var(--text)" font-size="9">př. převod peněz:</text>
    <text x="80" y="138" text-anchor="middle" fill="var(--text-muted)" font-size="9">odečteno + přičteno</text>
  </g>
  <g>
    <rect x="150" y="20" width="120" height="130" fill="var(--bg-inset)" stroke="var(--accent)" rx="6"/>
    <text x="210" y="42" text-anchor="middle" fill="var(--accent)" font-weight="700">C</text>
    <text x="210" y="58" text-anchor="middle" fill="var(--text)" font-size="10">Consistency</text>
    <text x="210" y="78" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">pravidla dodržena</text>
    <text x="210" y="98" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">PK, FK, CHECK</text>
    <text x="210" y="124" text-anchor="middle" fill="var(--text)" font-size="9">př. žádný neplatný</text>
    <text x="210" y="138" text-anchor="middle" fill="var(--text-muted)" font-size="9">zůstatek &lt; 0</text>
  </g>
  <g>
    <rect x="280" y="20" width="120" height="130" fill="var(--bg-inset)" stroke="var(--accent)" rx="6"/>
    <text x="340" y="42" text-anchor="middle" fill="var(--accent)" font-weight="700">I</text>
    <text x="340" y="58" text-anchor="middle" fill="var(--text)" font-size="10">Isolation</text>
    <text x="340" y="78" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">paralelní → seriál.</text>
    <text x="340" y="98" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">žádné phantom read</text>
    <text x="340" y="124" text-anchor="middle" fill="var(--text)" font-size="9">úrovně: RU, RC,</text>
    <text x="340" y="138" text-anchor="middle" fill="var(--text-muted)" font-size="9">RR, Serializable</text>
  </g>
  <g>
    <rect x="410" y="20" width="120" height="130" fill="var(--bg-inset)" stroke="var(--accent)" rx="6"/>
    <text x="470" y="42" text-anchor="middle" fill="var(--accent)" font-weight="700">D</text>
    <text x="470" y="58" text-anchor="middle" fill="var(--text)" font-size="10">Durability</text>
    <text x="470" y="78" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">po commit trvá</text>
    <text x="470" y="98" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">odolá pádu HW/SW</text>
    <text x="470" y="124" text-anchor="middle" fill="var(--text)" font-size="9">WAL + fsync</text>
    <text x="470" y="138" text-anchor="middle" fill="var(--text-muted)" font-size="9">na disk</text>
  </g>
</svg>
:::

## Cena ACID

ACID garance jsou *netriviální* — typicky implementovány přes:

* **Locking** — pesimistické zámky (row, table) brání souběžným modifikacím. Cena: zhoršený paralelismus, deadlock.
* **MVCC** (Multi-Version Concurrency Control) — každý transakce vidí *snapshot* DB. Cena: garbage collection starých verzí.
* **Write-ahead logging (WAL)** — všechny změny jsou nejprve zapsány do logu na disk, pak teprve aplikovány. Cena: latence zápisu.

Tyto mechanismy *ohraničují* propustnost a *snižují dostupnost* během konfliktů. V kontextu rozsáhlých webových služeb (eBay, Facebook, Amazon) jsou pro klíčové scénáře *nepřijatelné* — proto vznikla potřeba *relaxovat* některou z ACID vlastností.

## Požadavky moderních aplikací

Co se v 21. století změnilo:

* **Cloud a distribuované systémy** — data se ukládají *replikovaně* na desítkách až stovkách uzlů (decentralizace pro odolnost proti výpadkům a rychlost).
* **Big data** — terabajty až petabajty dat, **velké množství drobných operací** za sekundu (čtení timeline, like, klik).
* **Problematické datové typy** — klíč-hodnota cache, objekty, dokumenty, RDF grafy, časové řady, geoprostorová data. Násilná normalizace do RDBMS je neefektivní.
* **Iterativní vývoj** — schéma se vyvíjí *během provozu* (přidání nového sloupce nevyžaduje downtime). Často není ani jasné, jaká data budou uložena.
* **Vysoké nároky na škálovatelnost** — mobilní klienti generují *nerovnoměrné* zatížení (špičky a propady), čtení a zápisy z různých geografických oblastí, dotazy s nepředvídatelnými indexy.

Pokus o **modernizaci relačních DB** — *post-relační* DB s podporou XML/JSON, denormalizace, datové sklady, cache, OLAP kostky. Funguje pro některé scénáře, ale pro typické big-data případy je to *kompromis* — DB ztrácí matematickou eleganci relačního modelu a uznává, že data jsou spíše *kolekce/grafy/sítě* než matice řádků a sloupců.

## Tři cesty z relačního omezení

Když relační DB nepostačuje, máme tři reakce:

1. **Vertikálně škálovat** — výkonnější CPU/RAM/SSD pro tentýž server. Strop určen ekonomickou efektivitou (single mainframe = milionů Kč).
2. **Specializované relační/post-relační** — Oracle RAC (clustering), Aurora, Spanner, CockroachDB (NewSQL). Drží ACID, ale rozkládají úložiště na clusteru.
3. **NoSQL** — opustit relační model, použít specializované úložiště pro konkrétní typ dat. Obvykle preferovat *dostupnost* nad konzistencí (BASE místo ACID, viz [[acid-base]]).

Volba mezi nimi není binární — moderní architektury kombinují **polyglot persistence**: relační DB pro transakční data + Redis cache pro session + Elasticsearch pro full-text + S3 pro velké objekty. Každý nástroj na to, co umí nejlépe.

::: link "Stonebraker, M., Hellerstein, J. M.: What goes around comes around (HBR essay)" "https://www.cs.umd.edu/~abadi/papers/whatgoesaround-final.pdf"
:::

::: link "DB-Engines Ranking — top databases per category" "https://db-engines.com/en/ranking"
:::

---

*Zdroj: UPA přednáška *NoSQL databáze* (Rychlý, 23. září 2025). Externí reference: Strauch, C.: *NoSQL Databases*, Stuttgart Media University, 2011; Sadalage, P. J., Fowler, M.: *NoSQL Distilled — A Brief Guide to the Emerging World of Polyglot Persistence*, Addison-Wesley 2012; Pramod J. Sadalage's NoSQL talks; Meier, A., Kaufmann, M.: *SQL & NoSQL Databases*, Springer Vieweg 2019.*
