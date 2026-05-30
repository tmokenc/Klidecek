---
title: Jakarta EE — platforma, vrstvy, profily a aplikační servery
---

**Jakarta EE** (dříve *Java EE* / *J2EE*) je sada specifikací postavená nad Java SE pro tvorbu **podnikových aplikací a informačních systémů**. Nabízí standardní API pro nejčastější úlohy serverové strany (persistence, transakce, REST, messaging, web UI) a definuje *běhové prostředí*, ve kterém aplikace běží.

V roce 2017 Oracle oznámil převod Java EE pod nadaci Eclipse (platforma byla v roce 2018 přejmenována na Jakarta EE). Změna balíčku z `javax.*` na `jakarta.*` však přišla až s vydáním Jakarta EE 9 v prosinci 2020. V současnosti je aktuální **Jakarta EE 11**.

## Java SE jako základ

Předtím, než se začne mluvit o EE, je nutné mít *Java SE* — programovací jazyk (silně typovaný, objektově orientovaný) plus platformu (JVM, knihovny, vývojové nástroje). Pro vývoj se musí instalovat **JDK** (Java Development Kit), pro pouhý běh stačí **JRE** (Runtime Environment). Doporučovaná distribuce: OpenJDK ze systémového repozitáře nebo z [Adoptium](https://adoptium.net/). Pro Jakarta EE 11 je třeba **Java 17+**, lépe Java 21.

## Klíčové specifikace Jakarta EE a vrstvy

Specifikace pokrývají tři vrstvy aplikace — datovou, business a webovou:

::: svg "Mapování klíčových specifikací Jakarta EE na vrstvy aplikace"
<svg viewBox="0 0 540 240" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="500" height="55" rx="6" fill="oklch(0.65 0.16 220 / 0.10)" stroke="oklch(0.65 0.16 220)"/>
  <text x="35" y="40" font-size="11" font-weight="600" fill="oklch(0.35 0.16 220)">Webová vrstva</text>
  <rect x="35" y="48" width="100" height="22" rx="3" fill="oklch(0.65 0.16 220 / 0.30)"/>
  <text x="85" y="63" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">Jakarta Servlet</text>
  <rect x="143" y="48" width="100" height="22" rx="3" fill="oklch(0.65 0.16 220 / 0.30)"/>
  <text x="193" y="63" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">JAX-RS (REST)</text>
  <rect x="251" y="48" width="100" height="22" rx="3" fill="oklch(0.65 0.16 220 / 0.30)"/>
  <text x="301" y="63" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">JSF (Server Faces)</text>
  <rect x="359" y="48" width="100" height="22" rx="3" fill="oklch(0.65 0.16 220 / 0.30)"/>
  <text x="409" y="63" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">WebSocket</text>
  <rect x="20" y="85" width="500" height="80" rx="6" fill="oklch(0.62 0.14 22 / 0.10)" stroke="oklch(0.62 0.14 22)"/>
  <text x="35" y="105" font-size="11" font-weight="600" fill="oklch(0.40 0.14 22)">Business vrstva</text>
  <rect x="35" y="113" width="100" height="22" rx="3" fill="oklch(0.62 0.14 22 / 0.30)"/>
  <text x="85" y="128" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">EJB</text>
  <rect x="143" y="113" width="100" height="22" rx="3" fill="oklch(0.62 0.14 22 / 0.30)"/>
  <text x="193" y="128" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">CDI</text>
  <rect x="251" y="113" width="100" height="22" rx="3" fill="oklch(0.62 0.14 22 / 0.30)"/>
  <text x="301" y="128" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">JTA (transakce)</text>
  <rect x="359" y="113" width="100" height="22" rx="3" fill="oklch(0.62 0.14 22 / 0.30)"/>
  <text x="409" y="128" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">JMS (messaging)</text>
  <rect x="35" y="138" width="208" height="22" rx="3" fill="oklch(0.62 0.14 22 / 0.30)"/>
  <text x="139" y="153" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">Bean Validation</text>
  <rect x="251" y="138" width="208" height="22" rx="3" fill="oklch(0.62 0.14 22 / 0.30)"/>
  <text x="355" y="153" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">Security, Mail, JSON-B/P</text>
  <rect x="20" y="175" width="500" height="50" rx="6" fill="oklch(0.62 0.14 142 / 0.10)" stroke="oklch(0.62 0.14 142)"/>
  <text x="35" y="195" font-size="11" font-weight="600" fill="oklch(0.40 0.14 142)">Datová vrstva</text>
  <rect x="35" y="203" width="200" height="22" rx="3" fill="oklch(0.62 0.14 142 / 0.30)"/>
  <text x="135" y="218" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">JPA (Persistence API)</text>
  <rect x="243" y="203" width="216" height="22" rx="3" fill="oklch(0.62 0.14 142 / 0.30)"/>
  <text x="351" y="218" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text)">JDBC (přímý přístup k SQL)</text>
</svg>
:::

* **Datová vrstva** — *Jakarta Persistence API (JPA)* pro objektově-relační mapování, alternativně přímé *JDBC*.
* **Business vrstva** — *Enterprise Java Beans (EJB)* nebo lehčí *Contexts and Dependency Injection (CDI)* pro definici business komponent; *Jakarta Transactions (JTA)* pro správu transakcí; *JMS* pro asynchronní zprávy.
* **Webová vrstva** — *Servlet* jako základ HTTP zpracování; nad ním *JAX-RS* pro REST API nebo *Jakarta Server Faces (JSF)* pro server-rendered web UI.

## Struktura aplikace

Jakarta EE aplikace se balí do jednoho z těchto archivů:

| Archiv | Obsah | Použití |
|---|---|---|
| `*.jar` (EJB modul) | Business beans + Java interfaces | Knihovna business logiky |
| `*.war` (web modul) | Web zdroje + servlety + REST endpointy + `WEB-INF/lib/*.jar` | Samostatná webová aplikace |
| `*.ear` (enterprise archive) | Více modulů + `META-INF/application.xml` | Komplexní aplikace s více moduly |

Deskriptory (`web.xml`, `application.xml`) jsou dnes většinou nahrazeny **anotacemi** přímo v kódu — XML zůstává volitelným override mechanismem.

## Kontejnery (běhové prostředí)

Aplikační server poskytuje **kontejnery**, které spravují životní cyklus komponent a poskytují jim infrastrukturní služby (DI, transakce, security, …):

* **Webový kontejner** — vykonává servlety, JSP, JAX-RS endpointy; obsahuje HTTP server.
* **EJB kontejner** — vykonává EJB komponenty, řeší pooling, transakce, vzdálená volání.
* **Jakarta EE kontejner** — kombinuje webový + EJB kontejner; je to označení pro celý server.

## Profily — co všechno musí server umět

Ne každá aplikace potřebuje *všechno*. Proto Jakarta EE definuje **profily** — různé pokrytí specifikací:

* **Jakarta EE Full Profile** — kompletní specifikace, vše (JMS, plné EJB, mailové API, …).
* **Jakarta EE Web Profile** — zaměření na webové aplikace (Servlet, JSF, CDI, JPA, JAX-RS) bez JMS a remote EJB. Dnes nejběžnější volba.
* **Jakarta EE Core Profile** (od Jakarta EE 10) — minimální sada pro mikroslužby (CDI Lite, JAX-RS, JSON-B/P, anotace). Bez perzistence a webového UI.
* **MicroProfile** — *neoficiální* nadstavba nad Core Profile zaměřená na cloud-native mikroslužby. Přidává Config, Health, Metrics, OpenTelemetry, Reactive Messaging, OpenAPI atd. Spravuje ji Eclipse Foundation samostatně.

## Aplikační servery

Implementace Jakarta EE:

| Server | Profil | Poznámka |
|---|---|---|
| **Eclipse GlassFish** | Full | Referenční implementace |
| **Payara** | Full / Micro | Fork GlassFishe, komerčně podporovaný |
| **WildFly** | Full | Red Hat, dříve JBoss AS |
| **Open Liberty** | Full / MicroProfile | IBM, modulární přes `server.xml` |
| **Apache TomEE** | Web / Plus | Tomcat + EE komponenty |

Pouze webový kontejner (bez EJB a další EE infrastruktury) poskytují **Tomcat** a **Jetty** — vhodné pro lehké webové aplikace bez plné EE zátěže.

::: link "Jakarta EE — oficiální stránka" "https://jakarta.ee/"
:::

::: link "MicroProfile — specifikace" "https://microprofile.io/"
:::

::: link "Eclipse — přechod Java EE → Jakarta EE (vysvětlení)" "https://newsroom.eclipse.org/news/announcements/jakarta-ee-working-group-formed-drive-future-cloud-native-java"
:::

::: quiz "Proč existují různé profily Jakarta EE?"
- [x] Aby aplikace nemusela nést infrastrukturu, kterou nepoužívá; mikroslužba si vystačí s Core Profile / MicroProfile.
  > Přesně. Profily snižují velikost runtime, čas startu a paměť — důležité hlavně v cloudu.
- [ ] Aby si výrobci serverů mohli účtovat extra peníze za Full Profile.
  > Ne — všechny profily jsou standardizované; výběr je technický.
- [ ] Aby se navzájem vyloučily a aplikace musela běžet jen na jedné implementaci.
  > Naopak — díky jednotnému API jsou aplikace přenositelné mezi servery téhož profilu.
:::

::: quiz "V čem se liší `*.war` a `*.ear` archiv?"
- [x] WAR balí jednu webovou aplikaci; EAR může obsahovat více modulů (web + EJB + share knihovny) jako jeden balík.
  > Ano. EAR slouží pro komplexní enterprise aplikace; dnes ale často stačí samotný WAR díky integraci EJB lite a CDI do webových kontejnerů.
- [ ] WAR je pro Java SE, EAR pro Jakarta EE.
  > Ne, oba jsou Jakarta EE artefakty.
- [ ] WAR obsahuje zdrojový kód, EAR pouze přeložený bytecode.
  > Ne — oba obsahují přeložené `.class` soubory.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, VUT FIT, část „Jakarta EE".*
