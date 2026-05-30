---
title: Architektury IS — klient-server, třívrstvá, tier vs layer
---

Architektura informačního systému určuje, jak je systém **fyzicky rozdělen** mezi výpočetní uzly a jak je **logicky organizován** uvnitř jednotlivých částí. Pro pochopení dnešních webových aplikací stačí znát dvě klasická schémata a jeden terminologický rozdíl.

## Dvouvrstvá architektura (klient-server)

Nejjednodušší distribuovaná architektura. Dva typy oddělených výpočetních systémů:

* **Klient** — pracovní stanice / prohlížeč, který komunikuje s uživatelem.
* **Server** — typicky databázový server, který drží data.

::: svg "Klient-server (dvouvrstvá architektura)"
<svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="160" y="20" width="80" height="50" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="200" y="40" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">DB server</text>
  <text x="200" y="56" text-anchor="middle" font-size="9.5" fill="var(--text-muted)" font-family="var(--font-mono)">data + business logika</text>
  <line x1="200" y1="70" x2="60" y2="120" stroke="var(--text-muted)" stroke-width="0.8"/>
  <line x1="200" y1="70" x2="150" y2="120" stroke="var(--text-muted)" stroke-width="0.8"/>
  <line x1="200" y1="70" x2="250" y2="120" stroke="var(--text-muted)" stroke-width="0.8"/>
  <line x1="200" y1="70" x2="340" y2="120" stroke="var(--text-muted)" stroke-width="0.8"/>
  <rect x="25" y="120" width="70" height="40" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <rect x="115" y="120" width="70" height="40" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <rect x="215" y="120" width="70" height="40" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <rect x="305" y="120" width="70" height="40" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="60" y="145" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">klient</text>
  <text x="150" y="145" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">klient</text>
  <text x="250" y="145" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">klient</text>
  <text x="340" y="145" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">klient</text>
</svg>
:::

**Tloušťka klienta** odpovídá jeho „inteligenci" — kolik logiky aplikace nese:

* **Tlustý klient** — desktop aplikace, která sama řeší prezentaci, validace i část business logiky; do DB jen čte/zapisuje. Snadno se programuje, hůře nasazuje (instalace na každý počítač).
* **Tenký klient** — typicky webový prohlížeč, který jen zobrazuje data. Logika je celá na serveru.

Hlavní omezení: business logika splývá s daty (uložené procedury, triggery) — to brzdí škálovatelnost, ztěžuje testování a brání vícenásobnému využití logiky.

## Třívrstvá architektura

Nejrozšířenější schéma pro dnešní enterprise aplikace. Tři fyzické vrstvy:

::: svg "Schéma třívrstvé architektury"
<svg viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="200" y="15" width="100" height="36" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="250" y="38" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Presentation tier</text>
  <text x="370" y="38" font-size="10.5" fill="var(--text-muted)">Web browser</text>
  <line x1="250" y1="51" x2="250" y2="80" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#aa)"/>
  <line x1="250" y1="80" x2="250" y2="51" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#aa)"/>
  <text x="170" y="63" text-anchor="end" font-size="10" fill="var(--accent)" font-family="var(--font-mono)">HTTP</text>
  <rect x="180" y="80" width="140" height="70" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="250" y="118" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Application tier</text>
  <text x="370" y="105" font-size="10.5" fill="var(--text-muted)">Application server</text>
  <text x="370" y="120" font-size="10" fill="var(--text-faint)" font-family="var(--font-mono)">Java / .NET / Node</text>
  <line x1="250" y1="150" x2="250" y2="175" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#aa)"/>
  <line x1="250" y1="175" x2="250" y2="150" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#aa)"/>
  <text x="170" y="167" text-anchor="end" font-size="10" fill="var(--accent)" font-family="var(--font-mono)">SQL / API</text>
  <ellipse cx="250" cy="190" rx="50" ry="14" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="250" y="194" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Data tier</text>
  <text x="370" y="187" font-size="10.5" fill="var(--text-muted)">DB server</text>
  <text x="370" y="201" font-size="10" fill="var(--text-faint)" font-family="var(--font-mono)">MySQL, Postgres, …</text>
  <defs>
    <marker id="aa" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

* **Prezentační vrstva** vizualizuje informace pro uživatele — typicky webové rozhraní v prohlížeči nebo nativní mobilní aplikace. Může kontrolovat zadávané vstupy, ale **neobsahuje business logiku**.
* **Aplikační vrstva** je jádrem systému: business logika, transakce, výpočty, autorizace, integrace s ostatními systémy. Komunikuje s prezentační vrstvou přes HTTP (často REST API) a s datovou vrstvou přes SQL nebo nativní DB protokol.
* **Datová vrstva** je nejčastěji relační databáze, ale může to být i NoSQL úložiště, síťový souborový systém nebo externí webová služba.

## Tier vs. Layer

Terminologie, na které je vhodné si dát pozor — *tier* a *layer* se v běžné řeči zaměňují, ale technicky znamenají dvě různé věci:

* **Tier** = *fyzická vrstva* (jednotka **nasazení**). Členění systému na samostatně běžící procesy / stroje. Klient, aplikační server a DB server jsou tři *tiers*.
* **Layer** = *logická vrstva* (jednotka **organizace kódu**). Členění uvnitř jedné aplikace. V rámci aplikační tier obvykle rozlišujeme:
  * **Data layer** (data access) — komunikace s databází (DAO, repository),
  * **Business layer** — implementace business logiky,
  * **Presentation layer** — generování odpovědí pro klienta (REST, server-side rendering).

Vícero *layerů* v rámci jedné *tier* je běžné. Týž systém může mít 3 tiers (klient / app / DB) a uvnitř aplikační tier 3 layery (data / business / presentation). Vznikne tak schéma „prolínajících se vrstev":

::: svg "Tří-vrstvá architektura: vztah tier a layer"
<svg viewBox="0 0 480 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="180" y="10" width="100" height="32" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="230" y="30" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Presentation tier</text>
  <line x1="230" y1="42" x2="230" y2="60" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#bb)"/>
  <line x1="230" y1="60" x2="230" y2="42" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#bb)"/>
  <rect x="160" y="60" width="140" height="85" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-dasharray="3 3"/>
  <line x1="160" y1="87" x2="300" y2="87" stroke="var(--line)" stroke-dasharray="2 2"/>
  <line x1="160" y1="115" x2="300" y2="115" stroke="var(--line)" stroke-dasharray="2 2"/>
  <text x="230" y="79" text-anchor="middle" font-size="10.5" fill="var(--text-muted)" font-style="italic">presentation layer</text>
  <text x="230" y="107" text-anchor="middle" font-size="10.5" fill="var(--text-muted)" font-style="italic">business layer</text>
  <text x="230" y="135" text-anchor="middle" font-size="10.5" fill="var(--text-muted)" font-style="italic">data layer</text>
  <text x="320" y="105" font-size="10" fill="var(--text-faint)" font-family="var(--font-mono)">Application tier</text>
  <text x="320" y="120" font-size="9.5" fill="var(--text-faint)" font-family="var(--font-mono)">(Java/.NET/PHP …)</text>
  <line x1="230" y1="145" x2="230" y2="165" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#bb)"/>
  <ellipse cx="230" cy="180" rx="50" ry="12" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="230" y="184" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Data tier</text>
  <defs>
    <marker id="bb" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

## Aplikační platformy

V aplikační vrstvě se používá řada platforem; běžné jsou:

| Platforma | Typické komponenty |
|---|---|
| Java / Jakarta EE | EJB, CDI, JPA, JAX-RS, JSF |
| .NET (Core/Framework) | ASP.NET, Entity Framework |
| PHP | Symfony, Laravel — důraz na webovou vrstvu |
| JavaScript / Node.js | Express, NestJS — důraz na web a mikroslužby |
| Python / Ruby | Django, Flask, Rails |

Principy zůstávají stejné napříč platformami: oddělení vrstev, DI, ORM/persistence, deklarativní transakce. PIS jako referenční platformu používá **Jakarta EE** a **MicroProfile** — tyto specifikace jsou předmětem dalších částí kurzu.

::: link "Eckerson, W. (1995): Three Tier Client/Server Architecture" "https://en.wikipedia.org/wiki/Multitier_architecture"
:::

::: link "Fowler, M.: Patterns of Enterprise Application Architecture (PEAA)" "https://martinfowler.com/eaaCatalog/"
:::

::: link "Wikipedia — Multitier architecture" "https://en.wikipedia.org/wiki/Multitier_architecture"
:::

::: quiz "V čem se liší pojmy tier a layer?"
- [x] Tier je fyzická jednotka nasazení (proces/stroj); layer je logická jednotka organizace kódu.
  > Přesně. Tři tiers obvykle běží samostatně; více layerů sídlí typicky v jednom procesu aplikační tier.
- [ ] Tier a layer znamenají v praxi totéž; rozdíl je jen v angličtině vs. češtině.
  > Ne — rozlišení je technické a důležité při návrhu nasazení.
- [ ] Layer je fyzická a tier je logická vrstva.
  > Opačně — viz definice.
:::

---

*Zdroj: přednášky PIS — prof. T. Hruška a doc. R. Burget, VUT FIT, část „Architektury informačních systémů".*
