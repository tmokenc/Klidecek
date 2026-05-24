---
title: Relační, objektový a objektově-relační model
---

# Relační, objektový a objektově-relační model

V databázích koexistují tři historicky vzniklé datové modely: **relační** (Codd 1970), **objektový** (OODBS Manifesto 1989) a **objektově-relační** (SQL:1999). Liší se způsobem reprezentace dat, výpočetním modelem (jak se k datům přistupuje) a stupněm standardizace. Pochopení rozdílů je klíčové pro výběr úložiště — relační dominuje pro klasické IS, objektové pro perzistenci OOP objektů, objektově-relační představuje praktický kompromis nabízený většinou hlavních RDBMS.

## Relační model

Codd 1970, SQL standardizováno 1986. Data jsou organizována do **tabulek** (relací) s atomickými typy:

* **Datový model** — kolekce tabulek s atomickými/skalárními datovými typy, vztahy přes **primární** a **cizí klíče**, M:N přes vazební tabulky.
* **Výpočetní model** — operace nad *hodnotami* sloupců, žádné nativní reference ani ukazatele, navigace pomocí kurzoru.
* **Standardizace** — neprocedurální deklarativní jazyk **SQL**.

Hlavní důvody dominance v 80. letech: jednoduchý matematicky podložený model (relační algebra, normalizace), intuitivní modelování (ER diagramy), široká podpora dodavatelů a standardizace.

## Objektový model

Vznikl koncem 80. let z potřeby perzistence objektů OOP jazyků (C++, Smalltalk). **OODBS Manifesto** (Atkinson et al. 1989) definovalo požadavky na objektovou DB.

* **Datový model** — třídy s atributy a operacemi, **jednoznačný OID** pro každý objekt, atributy mohou být složitých typů (ADT, kolekce, vnořené objekty), vztahy přes OID/reference (přímé, neexistuje vazební tabulka), polymorfismus a dědičnost.
* **Výpočetní model** — OID hraje klíčovou roli, navigace přes ukazatele/reference (např. `osoba.zamestnavatel.adresa.mesto`).
* **Standardizace** — nezdařilá. ODMG (Object Data Management Group) navrhla 1991–2001 jazyky **ODL** (Object Definition Language) a **OQL** (Object Query Language), ale standard nepřevládl. Důvod: třídy jsou definovány na úrovni aplikace v programovacím jazyce (C++, Java), proto ODL nepotřeba; dotazy se píší přímo v aplikačním jazyce, proto ani OQL.

## Objektově-relační model

Praktický kompromis hlavních dodavatelů (Oracle, IBM DB2, PostgreSQL). SQL:1999 přidalo objektové rysy do SQL.

* **Datový model** — (vnořené) relační tabulky s objektově-orientovanými rysy: atributy mohou být typu **ADT** (Abstract Data Type — uživatelsky definovaný strukturovaný typ s metodami), tabulky mohou být typu ADT (řádky pak jsou *instance ADT s OID*), vztahy přes OID i přes PK/FK.
* **Výpočetní model** — kombinace kurzorové navigace a navigace přes reference (`REF`).
* **Standardizace** — SQL:1999 a novější (SQL:2003, SQL:2011, SQL:2016, SQL:2023).

## Porovnání modelů

::: svg "Tři datové modely: relační (tabulky + hodnoty), objektový (třídy + OID + reference), objektově-relační (tabulky + ADT + REF)."
<svg viewBox="0 0 560 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="20" y="20" width="160" height="180" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="100" y="40" text-anchor="middle" fill="var(--text)" font-weight="600">Relační</text>
    <text x="100" y="58" text-anchor="middle" fill="var(--text-muted)" font-size="10">tabulky, atomické typy</text>
    <g font-size="9.5" fill="var(--text)">
      <rect x="40" y="74" width="120" height="50" fill="var(--bg-card)" stroke="var(--line)"/>
      <line x1="40" y1="88" x2="160" y2="88" stroke="var(--line)"/>
      <text x="50" y="86">id</text><text x="100" y="86">jmeno</text>
      <text x="50" y="102">1</text><text x="100" y="102">Anna</text>
      <text x="50" y="116">2</text><text x="100" y="116">Bob</text>
    </g>
    <text x="100" y="146" text-anchor="middle" fill="var(--text-muted)" font-size="10">PK/FK, JOIN, kurzor</text>
    <text x="100" y="180" text-anchor="middle" fill="var(--accent)" font-size="10">Codd 1970, SQL'86</text>
  </g>
  <g>
    <rect x="200" y="20" width="160" height="180" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="280" y="40" text-anchor="middle" fill="var(--text)" font-weight="600">Objektový</text>
    <text x="280" y="58" text-anchor="middle" fill="var(--text-muted)" font-size="10">třídy, OID, reference</text>
    <g>
      <rect x="220" y="74" width="60" height="50" fill="var(--bg-card)" stroke="var(--accent-line)" rx="4"/>
      <text x="250" y="92" text-anchor="middle" fill="var(--text)" font-size="9.5">Person</text>
      <text x="250" y="106" text-anchor="middle" fill="var(--text-muted)" font-size="9">OID #42</text>
      <text x="250" y="118" text-anchor="middle" fill="var(--text)" font-size="9">Anna</text>
      <rect x="295" y="74" width="60" height="50" fill="var(--bg-card)" stroke="var(--accent-line)" rx="4"/>
      <text x="325" y="92" text-anchor="middle" fill="var(--text)" font-size="9.5">Addr</text>
      <text x="325" y="106" text-anchor="middle" fill="var(--text-muted)" font-size="9">OID #18</text>
      <text x="325" y="118" text-anchor="middle" fill="var(--text)" font-size="9">Brno</text>
      <line x1="280" y1="99" x2="295" y2="99" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#arr1)"/>
    </g>
    <text x="280" y="146" text-anchor="middle" fill="var(--text-muted)" font-size="10">OID, navigace ref.</text>
    <text x="280" y="180" text-anchor="middle" fill="var(--accent)" font-size="10">OODBS 1989, ODMG</text>
  </g>
  <g>
    <rect x="380" y="20" width="160" height="180" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="460" y="40" text-anchor="middle" fill="var(--text)" font-weight="600">Obj.-rel.</text>
    <text x="460" y="58" text-anchor="middle" fill="var(--text-muted)" font-size="10">tabulky + ADT + REF</text>
    <g font-size="9.5" fill="var(--text)">
      <rect x="400" y="74" width="120" height="50" fill="var(--bg-card)" stroke="var(--line)"/>
      <line x1="400" y1="88" x2="520" y2="88" stroke="var(--line)"/>
      <text x="410" y="86">id</text><text x="450" y="86">adresa</text><text x="495" y="86">ref</text>
      <text x="410" y="102">1</text><text x="450" y="102">ADT</text><text x="495" y="102">→#18</text>
      <text x="410" y="116">2</text><text x="450" y="116">ADT</text><text x="495" y="116">→#42</text>
    </g>
    <text x="460" y="146" text-anchor="middle" fill="var(--text-muted)" font-size="10">SQL + ADT + metody</text>
    <text x="460" y="180" text-anchor="middle" fill="var(--accent)" font-size="10">SQL:1999+</text>
  </g>
  <defs>
    <marker id="arr1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

Klíčové rozdíly přehledně:

| Aspekt | Relační | Objektový | Objektově-relační |
| :--- | :--- | :--- | :--- |
| **Identita** | hodnotová (PK) | OID | OID i PK |
| **Typy** | atomické | ADT, kolekce, dědičnost | hodnotové i ADT |
| **Vztahy** | PK/FK + JOIN | navigace přes ref. | obojí |
| **Dotaz** | SQL | OQL (málo) / aplikační kód | SQL s ADT/REF |
| **Standardizace** | ANSI/ISO SQL | žádná převažující | SQL:1999+ |
| **Použití** | klasické IS, OLTP/OLAP | perzistence OOP objektů | hybridní (XML, JSON, prostorová data) |

## Impedance mismatch

Hlavním motivem objektových a objektově-relačních DB je tzv. **impedance mismatch** mezi OOP jazyky (objekty s identitou, dědičností, polymorfismem) a relačním modelem (ploché n-tice hodnot). Programátor v Javě/C# řeší:

* **Mapování dědičnosti** — *single-table*, *class-table*, *concrete-table* strategie.
* **Mapování asociací** — 1:1, 1:N, M:N přes vazební tabulky vs. přímé reference.
* **Identita** — `equals()` (hodnotová) vs. `==` (referenční) vs. OID v DB.
* **Lazy loading** — kdy načíst závislé objekty z DB.

Objektové DB tento problém řeší **transparentní perzistencí** (kód pracuje pouze s objekty, knihovna zajistí synchronizaci s úložištěm). Objektově-relační DB jej řeší ve **vrstvě ORM** (Object-Relational Mapping — Hibernate, JPA, EF) na úrovni aplikace.

## Příklad — stejná data ve třech modelech

Relační (klasické tři tabulky s FK):

```sql
CREATE TABLE adresa (id INT PRIMARY KEY, ulice VARCHAR(100), mesto VARCHAR(50));
CREATE TABLE osoba  (id INT PRIMARY KEY, jmeno VARCHAR(50), id_adresa INT REFERENCES adresa(id));
SELECT o.jmeno, a.mesto FROM osoba o JOIN adresa a ON o.id_adresa = a.id;
```

Objektový (ODMG-like):

```
class Adresa { attribute string ulice; attribute string mesto; }
class Osoba  { attribute string jmeno; relationship Adresa bydli inverse Adresa::obyvatele; }
SELECT o.jmeno, o.bydli.mesto FROM AllOsoby o
```

Objektově-relační (SQL:1999):

```sql
CREATE TYPE t_adresa AS (ulice VARCHAR(100), mesto VARCHAR(50));
CREATE TABLE osoba (id INT PRIMARY KEY, jmeno VARCHAR(50), adresa t_adresa);
SELECT o.jmeno, o.adresa.mesto FROM osoba o;
```

Všimněte si: v OR variantě se k `mesto` přistupuje **bez JOIN** — adresa je vnořený ADT v řádku osoby. Cena: ztráta sdílení (pokud více osob bydlí na stejné adrese, hodnota se duplikuje, pokud nepoužijeme `REF`).

## Kdy který model

* **Relační** — klasické IS, OLTP transakce, reporting, integrace přes SQL/JDBC/ODBC.
* **Objektový** — komplexní vědecké aplikace (CAD, GIS), embedded scénáře (ObjectBox), zachování OOP grafu objektů (např. herní engine save state).
* **Objektově-relační** — modernizace stávajících relačních DB pro nestrukturovaná data (XML/JSON/geoprostorová), tam kde je třeba SQL i složitější datové typy. Praktická volba: PostgreSQL, Oracle, IBM DB2, MS SQL Server.

::: link "Atkinson et al.: The Object-Oriented Database System Manifesto (1989)" "https://web.archive.org/web/20060901223111/http://www.cs.cmu.edu/People/clamen/OODBMS/Manifesto/htManifesto/Manifesto.html"
:::

::: link "ISO/IEC 9075 — SQL standard (Wikipedia overview)" "https://en.wikipedia.org/wiki/SQL"
:::

---

*Zdroj: UPA přednáška *Objects in Databases* (Rychlý, 16. září 2025). Externí reference: Codd, E. F.: *A Relational Model of Data for Large Shared Data Banks*, CACM 13(6), 1970; Atkinson, M. et al.: *The Object-Oriented Database System Manifesto*, DOOD 1989; Cattell, R. (ed.): *The Object Data Standard: ODMG 3.0*, Morgan Kaufmann 2000; Melton, J.: *Advanced SQL:1999 — Understanding Object-Relational and Other Advanced Features*, Morgan Kaufmann 2003.*
