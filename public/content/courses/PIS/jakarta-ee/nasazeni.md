---
title: Nasazení Jakarta EE aplikací — plný server, odlehčený, mikroslužba
---

Stejnou aplikaci lze nasadit v několika různých modelech podle toho, **kde leží runtime knihovny** Jakarta EE a **jaký je vztah serveru a aplikace**. Volba ovlivňuje čas startu, paměťovou stopu, izolaci aplikací a způsob konfigurace.

## Plný server

Tradiční Jakarta EE model. Server běží jako samostatný proces a aplikace (`*.war` nebo `*.ear`) se do něj **nasazují za běhu** — typicky kopírováním do adresáře `deploy/` nebo přes administrátorské API. Jeden server může hostovat více aplikací; runtime knihovny jsou jen jednou v serveru.

::: svg "Plný server — aplikace se nasazují za běhu, knihovny jsou v runtime serveru"
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="160" y="20" width="220" height="100" rx="8" fill="oklch(0.62 0.14 142 / 0.15)" stroke="oklch(0.62 0.14 142)"/>
  <text x="270" y="38" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.40 0.14 142)">Application server</text>
  <rect x="180" y="55" width="180" height="40" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 142)" stroke-width="0.8"/>
  <text x="270" y="78" text-anchor="middle" font-size="11" font-weight="500" fill="var(--text)">Jakarta EE runtime (full)</text>
  <rect x="305" y="32" width="60" height="18" rx="3" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="335" y="44" text-anchor="middle" font-size="9" fill="var(--text-muted)">Configuration</text>
  <line x1="20" y1="70" x2="158" y2="70" stroke="var(--text-muted)" stroke-width="1.2" marker-end="url(#na)"/>
  <text x="90" y="62" text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)">HTTP</text>
  <line x1="382" y1="70" x2="500" y2="70" stroke="var(--text-muted)" stroke-width="1.2" marker-end="url(#na)"/>
  <line x1="500" y1="80" x2="382" y2="80" stroke="var(--text-muted)" stroke-width="1.2" marker-end="url(#na)"/>
  <ellipse cx="510" cy="78" rx="15" ry="22" fill="oklch(0.62 0.14 200 / 0.30)" stroke="oklch(0.62 0.14 200)" stroke-width="0.8"/>
  <text x="510" y="120" text-anchor="middle" font-size="10" fill="var(--text-muted)">DB</text>
  <rect x="180" y="145" width="60" height="45" rx="4" fill="oklch(0.65 0.18 22 / 0.30)" stroke="oklch(0.65 0.18 22)"/>
  <text x="210" y="172" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">app1.war</text>
  <rect x="250" y="145" width="60" height="45" rx="4" fill="oklch(0.65 0.18 22 / 0.30)" stroke="oklch(0.65 0.18 22)"/>
  <text x="280" y="172" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">app2.war</text>
  <rect x="320" y="145" width="60" height="45" rx="4" fill="oklch(0.65 0.18 22 / 0.30)" stroke="oklch(0.65 0.18 22)"/>
  <text x="350" y="172" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">app3.war</text>
  <line x1="210" y1="145" x2="210" y2="120" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#na)"/>
  <line x1="280" y1="145" x2="280" y2="120" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#na)"/>
  <line x1="350" y1="145" x2="350" y2="120" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#na)"/>
  <text x="190" y="138" font-size="10" fill="var(--text-muted)" font-family="var(--font-mono)">deploy</text>
  <defs>
    <marker id="na" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

* **Výhoda:** sdílené knihovny šetří paměť a disk; centrální administrace celého serveru.
* **Nevýhoda:** aplikace sdílejí JVM (chyba jedné může ovlivnit druhé); update verze runtime se týká všech.

## Odlehčený („lightweight") server

Server se spouští **společně s aplikací**. Aplikace nese pouze část konfigurace; chybějící knihovny dotáhne z WAR (`WEB-INF/lib/`). Web profile nebo MicroProfile jsou zde běžné.

::: svg "Odlehčený server — server běží s aplikacemi, část knihoven nese aplikace"
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="160" y="20" width="220" height="80" rx="8" fill="oklch(0.62 0.14 142 / 0.15)" stroke="oklch(0.62 0.14 142)"/>
  <text x="270" y="38" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.40 0.14 142)">Application server</text>
  <rect x="180" y="48" width="180" height="40" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 142)" stroke-width="0.8"/>
  <text x="270" y="72" text-anchor="middle" font-size="10.5" font-weight="500" fill="var(--text)">Jakarta EE runtime (web profile)</text>
  <line x1="20" y1="60" x2="158" y2="60" stroke="var(--text-muted)" stroke-width="1.2" marker-end="url(#nb)"/>
  <text x="90" y="52" text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)">HTTP</text>
  <line x1="382" y1="60" x2="500" y2="60" stroke="var(--text-muted)" stroke-width="1.2" marker-end="url(#nb)"/>
  <ellipse cx="510" cy="60" rx="15" ry="18" fill="oklch(0.62 0.14 200 / 0.30)" stroke="oklch(0.62 0.14 200)" stroke-width="0.8"/>
  <text x="510" y="100" text-anchor="middle" font-size="10" fill="var(--text-muted)">DB</text>
  <rect x="200" y="135" width="65" height="55" rx="4" fill="oklch(0.65 0.18 22 / 0.30)" stroke="oklch(0.65 0.18 22)"/>
  <text x="232" y="153" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">app1.war</text>
  <rect x="206" y="158" width="53" height="14" fill="oklch(0.62 0.14 22 / 0.35)"/>
  <text x="232" y="168" text-anchor="middle" font-size="9" fill="var(--text)">Libraries</text>
  <rect x="206" y="172" width="53" height="14" fill="var(--bg-card)" stroke="var(--line)" stroke-width="0.5"/>
  <text x="232" y="182" text-anchor="middle" font-size="8" fill="var(--text-muted)">Config</text>
  <rect x="285" y="135" width="65" height="55" rx="4" fill="oklch(0.65 0.18 22 / 0.30)" stroke="oklch(0.65 0.18 22)"/>
  <text x="317" y="153" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">app2.war</text>
  <rect x="291" y="158" width="53" height="14" fill="oklch(0.62 0.14 22 / 0.35)"/>
  <text x="317" y="168" text-anchor="middle" font-size="9" fill="var(--text)">Libraries</text>
  <rect x="291" y="172" width="53" height="14" fill="var(--bg-card)" stroke="var(--line)" stroke-width="0.5"/>
  <text x="317" y="182" text-anchor="middle" font-size="8" fill="var(--text-muted)">Config</text>
  <line x1="232" y1="135" x2="232" y2="100" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#nb)"/>
  <line x1="317" y1="135" x2="317" y2="100" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#nb)"/>
  <defs>
    <marker id="nb" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

* **Výhoda:** menší stopa než plný server; aplikace je portovatelnější (přibalené knihovny verzově jisté).
* **Nevýhoda:** přibalené knihovny duplikují obsah napříč aplikacemi.

## Mikroslužba (embedded all-in-one)

Aplikace, runtime knihovny a konfigurace tvoří **jeden spustitelný balík** (typicky executable JAR). Není potřeba externí server — JAR se spustí přímo přes `java -jar` a okamžitě poslouchá na portu.

::: svg "Mikroslužba — server, aplikace a knihovny v jednom spustitelném JARu"
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="160" y="20" width="240" height="170" rx="8" fill="oklch(0.62 0.14 142 / 0.15)" stroke="oklch(0.62 0.14 142)"/>
  <text x="280" y="38" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.40 0.14 142)">Microservice (executable JAR)</text>
  <rect x="180" y="50" width="200" height="22" rx="3" fill="var(--bg-card)" stroke="oklch(0.62 0.14 142)" stroke-width="0.8"/>
  <text x="280" y="65" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">Jakarta EE runtime (MicroProfile)</text>
  <rect x="180" y="78" width="200" height="38" rx="3" fill="oklch(0.65 0.18 22 / 0.30)" stroke="oklch(0.65 0.18 22)"/>
  <text x="280" y="101" text-anchor="middle" font-size="11" font-weight="500" fill="var(--text)">application</text>
  <rect x="180" y="120" width="200" height="22" rx="3" fill="oklch(0.62 0.14 22 / 0.30)" stroke="oklch(0.62 0.14 22)" stroke-width="0.5"/>
  <text x="280" y="135" text-anchor="middle" font-size="10" fill="var(--text)">Libraries</text>
  <rect x="180" y="150" width="200" height="24" rx="3" fill="var(--bg-card)" stroke="var(--line)" stroke-width="0.5"/>
  <text x="280" y="165" text-anchor="middle" font-size="10" fill="var(--text-muted)">externí Configuration (env)</text>
  <line x1="20" y1="80" x2="158" y2="80" stroke="var(--text-muted)" stroke-width="1.2" marker-end="url(#nc)"/>
  <text x="90" y="72" text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)">API</text>
  <line x1="20" y1="125" x2="158" y2="125" stroke="var(--text-muted)" stroke-width="1.2" marker-end="url(#nc)"/>
  <text x="90" y="118" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-family="var(--font-mono)">Telemetry, Health</text>
  <rect x="420" y="95" width="100" height="30" rx="4" fill="oklch(0.62 0.14 200 / 0.20)" stroke="oklch(0.62 0.14 200)" stroke-width="0.8"/>
  <text x="470" y="115" text-anchor="middle" font-size="10" fill="var(--text-muted)">Storage (vlastní)</text>
  <line x1="382" y1="110" x2="418" y2="110" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#nc)"/>
  <defs>
    <marker id="nc" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

* **Výhoda:** ideální pro kontejnerizaci (jeden Docker image = jedna služba); rychlý start, snadné škálování.
* **Nevýhoda:** každá služba nese vlastní kopii runtime knihoven (větší paměťová stopa v součtu).

## Konfigurace běhu — Open Liberty

[Open Liberty](https://openliberty.io/) konfiguruje modulárně přes XML soubor:

```xml
<!-- server.xml -->
<server description="demo">
  <featureManager>
    <feature>jakartaee-10.0</feature>
    <feature>microProfile-6.0</feature>
  </featureManager>

  <httpEndpoint id="defaultHttpEndpoint"
                host="*" httpPort="9080" httpsPort="9443"/>

  <webApplication location="myapp.war" contextRoot="/"/>
</server>
```

Pro velký server žije `server.xml` v `wlp/usr/servers/<nazev>/`; pro aplikaci ho lze přibalit do `src/main/liberty/config/`. Maven plugin (`liberty-maven-plugin`) umí během buildu spustit lokální vývojový server (`mvn liberty:dev`).

## Konfigurace běhu — Payara

[Payara](https://www.payara.fish/) existuje ve dvou variantách:

* **Payara Server** (full / web profile) — klasický server s administrátorským rozhraním na `http://localhost:4848`. Konfigurace přes `domain.xml`, datové zdroje v `WEB-INF/glassfish-resources.xml`.
* **Payara Micro** — jeden spustitelný JAR (`payara-micro.jar`). Při spuštění mu předáme WAR archiv: `java -jar payara-micro.jar --deploy myapp.war`. Maven plugin (`payara-micro-maven-plugin`) vytvoří kombinovaný spustitelný JAR z aplikace.

::: link "Open Liberty — quick start" "https://openliberty.io/guides/getting-started.html"
:::

::: link "Payara Micro — dokumentace" "https://docs.payara.fish/community/docs/Technical%20Documentation/Payara%20Micro%20Documentation/Payara%20Micro.html"
:::

::: link "12-Factor App — Config (Factor 3)" "https://12factor.net/config"
:::

::: quiz "Pro projekt v PIS budete typicky volit:"
- [x] Payara Micro nebo Open Liberty (lehký server s vlastní WAR aplikací), s konfigurací přibalenou v projektu.
  > Ano. Tento setup je rychlý na start, snadno se ladí v Eclipse/IntelliJ a odpovídá moderní praxi.
- [ ] Plný Payara/GlassFish server s manuálním nasazením WAR přes admin konzoli.
  > Funguje, ale pro výuku a malé projekty je to zbytečně těžké.
- [ ] Pouze Tomcat bez Jakarta EE.
  > Tomcat je jen webový kontejner; pro EJB, CDI, JPA nestačí. PIS očekává plnou Jakarta EE / MicroProfile.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, VUT FIT, část „Nasazení a konfigurace Jakarta EE".*
