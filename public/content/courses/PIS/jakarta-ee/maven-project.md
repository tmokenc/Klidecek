---
title: Maven projekt, IDE a struktura WAR
---

Pro praktický vývoj Jakarta EE aplikací potřebujete tři věci: **JDK**, **Maven** (build a správa závislostí) a **IDE**. K tomu **databázový server** s JDBC ovladačem a **aplikační server** podle vybraného profilu.

## Předpoklady

| Komponenta | Doporučená verze | Poznámka |
|---|---|---|
| Java | 17 nebo 21 (LTS) | Musí být **JDK** (ne pouze JRE); v Linuxu z distribuce nebo z [Adoptium](https://adoptium.net) |
| Maven | 3.9+ | Z distribuce nebo z [maven.apache.org](https://maven.apache.org) |
| Git | jakákoliv | Volitelné, doporučené pro týmovou práci |
| Aplikační server | Open Liberty / Payara | Stahuje se buď ručně, nebo přes Maven plugin |
| Databáze | H2 / Derby (embedded), nebo PostgreSQL/MySQL | H2 je nejjednodušší pro vývoj |
| IDE | Eclipse IDE for Enterprise Java and Web Developers; alternativně IntelliJ IDEA, VS Code | Kurz PIS pracuje primárně s Eclipsem |

V Eclipse navíc přes **Eclipse Marketplace** doinstalujte podporu vybraného serveru:

* **Liberty Tools** pro Open Liberty,
* **Payara Tools** pro Payara,
* server pak definujte přes `Window → Servers → New`.

## Maven projekt — varianty vytvoření

Existují tři běžné způsoby, jak rozjet nový Jakarta EE projekt:

1. **Použít existující šablonový projekt.** Nejsnazší — naklonujte hotový skeleton:
   * [Jakarta EE Starter](https://start.jakarta.ee/) — konfigurátor pro Full / Web / Core profile s volbou serveru.
   * [Open Liberty Starter](https://openliberty.io/start/) — pro Liberty + MicroProfile.
   * [MicroProfile Starter](https://start.microprofile.io/) — pro pure MicroProfile.
2. **Generátory.** Stejné jako šablony, ale jako CLI/web nástroj produkující kompletní `pom.xml` + minimální zdrojový kód.
3. **Maven archetypes.** Klasický mechanismus Mavenu (`mvn archetype:generate`), např. `jakartaee-essentials-archetype` nebo `wildfly-getting-started-archetype`. Méně pohodlné než starter, ale plně automatizovatelné.

## Maven konfigurace projektu

Klíčové nastavení v `pom.xml`:

```xml
<project>
  <modelVersion>4.0.0</modelVersion>

  <!-- Project coordinates: identifikace projektu -->
  <groupId>cz.vutbr.fit.pis</groupId>
  <artifactId>demo</artifactId>
  <version>1.0.0-SNAPSHOT</version>

  <!-- Výsledný balík je WAR -->
  <packaging>war</packaging>

  <properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
  </properties>

  <dependencies>
    <!-- API poskytované serverem — proto scope=provided -->
    <dependency>
      <groupId>jakarta.platform</groupId>
      <artifactId>jakarta.jakartaee-web-api</artifactId>
      <version>10.0.0</version>
      <scope>provided</scope>
    </dependency>
  </dependencies>
</project>
```

* **Project coordinates** `groupId` + `artifactId` + `version` jednoznačně identifikují projekt v Maven Central.
* **Packaging `war`** říká, že výsledkem buildu má být `*.war` archiv.
* **Závislosti se `scope=provided`** — kontejner už knihovny obsahuje (full profile), proto je nesmíme znovu balit do WARu, jinak dojde k duplikaci tříd a klasickým `ClassCastException` problémům.

Build a balení proběhne přes `mvn clean package`. Výsledný `target/demo-1.0.0-SNAPSHOT.war` je archiv připravený k nasazení.

V Eclipse stačí projekt importovat jako *Existing Maven Project*; po případné úpravě `pom.xml` aktualizovat metadata přes **Alt-F5** (Maven → Update Project).

## Struktura WAR archivu

`.war` je v podstatě ZIP s pevně danou strukturou:

::: svg "Struktura WAR archivu"
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="500" height="180" rx="8" fill="oklch(0.62 0.14 22 / 0.08)" stroke="oklch(0.62 0.14 22)"/>
  <text x="35" y="40" font-size="11" font-weight="600" fill="oklch(0.40 0.14 22)" font-family="var(--font-mono)">demo.war  (= kořenový adresář /webu)</text>
  <rect x="40" y="55" width="460" height="32" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="55" y="73" font-size="11" font-weight="500" fill="var(--text)" font-family="var(--font-mono)">/index.html, /pages/*, /css/*, /js/*</text>
  <text x="490" y="73" text-anchor="end" font-size="9.5" fill="var(--text-muted)" font-style="italic">veřejně přístupné</text>
  <rect x="40" y="92" width="460" height="32" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="55" y="110" font-size="11" font-weight="500" fill="var(--text)" font-family="var(--font-mono)">META-INF/</text>
  <text x="490" y="110" text-anchor="end" font-size="9.5" fill="var(--text-muted)" font-style="italic">manifest, info o archivu</text>
  <rect x="40" y="129" width="460" height="32" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="55" y="147" font-size="11" font-weight="500" fill="var(--text)" font-family="var(--font-mono)">WEB-INF/lib/*.jar</text>
  <text x="490" y="147" text-anchor="end" font-size="9.5" fill="var(--text-muted)" font-style="italic">přibalené knihovny</text>
  <rect x="40" y="166" width="460" height="28" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="55" y="183" font-size="11" font-weight="500" fill="var(--text)" font-family="var(--font-mono)">WEB-INF/classes/**/*.class</text>
  <text x="490" y="183" text-anchor="end" font-size="9.5" fill="var(--text-muted)" font-style="italic">přeložený kód aplikace</text>
</svg>
:::

* Vše ve **WEB-INF** je *nepřístupné* z webu (HTTP requests mířící do `/WEB-INF/...` dostanou 404).
* **WEB-INF/classes/** odpovídá `src/main/java/` po překladu — sem patří třídy aplikace.
* **WEB-INF/lib/** je classpath; sem se ukládají závislosti, které nemá poskytnout server.
* `META-INF/MANIFEST.MF` nese metadata archivu (Maven sem doplní `Build-Jdk`, `Implementation-Version` aj.).

## Java Servlet — nejnižší stavební prvek

Servlet je Javová třída, která zpracovává HTTP požadavky. Implementuje rozhraní `jakarta.servlet.http.HttpServlet` a v moderním Jakarta EE se mapuje na URL anotací `@WebServlet`:

```java
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        res.setContentType("text/plain;charset=UTF-8");
        res.getWriter().write("Ahoj, " + req.getParameter("name") + "!");
    }
}
```

V praxi se *přímo* servletů dotýkáme málokdy — JAX-RS (REST) a JSF generují servletové zpracování pod kapotou. Vědět ale, že to *všechno* je nakonec servlet zpracovávaný webovým kontejnerem, pomáhá při debugování (filtry, listenery, multipart upload, async response).

::: link "Apache Maven — Getting Started" "https://maven.apache.org/guides/getting-started/"
:::

::: link "Jakarta Servlet 6.0 — Specifikace" "https://jakarta.ee/specifications/servlet/6.0/"
:::

::: link "Eclipse IDE for Enterprise Java Developers" "https://www.eclipse.org/downloads/packages/release/latest/r/eclipse-ide-enterprise-java-and-web-developers"
:::

::: quiz "Proč je u většiny Jakarta EE závislostí v pom.xml uveden `<scope>provided</scope>`?"
- [x] Aplikační server tyto knihovny už obsahuje, takže je nesmíme znovu balit do WARu.
  > Přesně. Duplicitní třídy vedou k `LinkageError` nebo `ClassCastException` mezi instancemi téhož typu načtenými různými classloadery.
- [ ] Maven by se jinak pokusil knihovny stáhnout a build by selhal.
  > Stáhne je tak jako tak (kvůli překladu); `provided` ovlivňuje pouze, *zda* se přibalí do výsledného WARu.
- [ ] Je to požadavek na licenci EE knihoven.
  > Licenci to neřeší.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, VUT FIT, část „Praktický vývoj v Jakarta EE".*
