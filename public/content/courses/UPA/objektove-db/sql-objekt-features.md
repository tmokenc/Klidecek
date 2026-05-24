---
title: SQL:1999 a objektově-relační rysy
---

# SQL:1999 a objektově-relační rysy

SQL standard z roku 1999 (ISO/IEC 9075:1999) zavedl **objektově-relační rysy**, které mají odstranit nebo zmírnit impedance mismatch mezi OOP a relačními databázemi. Klíčové novinky: **strukturované uživatelské typy (UDT)** se zapouzdřením a metodami, **typované tabulky** s OID, **REF** pro reference, **dědičnost**. Dnes je SQL:1999 a jeho nástupci (SQL:2003, 2011, 2016, 2023) běžně podporován v Oracle, IBM DB2, PostgreSQL a částečně v MS SQL Serveru. MySQL tyto rysy nepodporuje (preferuje JSON přístup).

## Historický kontext: vývoj SQL standardu

| Rok | Verze | Klíčové novinky |
| :---: | :--- | :--- |
| 1986 | SQL/86 | první ANSI/ISO standard z Sequel/System R, IBM DB2 |
| 1989 | SQL/89 | Integrity Addendum (referenční integrita) |
| 1992 | SQL/92 | typy LARGE OBJECT, schema manipulation; varianty Entry/Intermediate/Full |
| 1996 | PSM/96 | stored procedures (PL/SQL-like) |
| **1999** | **SQL:1999** | **OR rysy — UDT, REF, typed tables, recursive queries, triggers** |
| 2003 | SQL:2003 | OLAP funkce (`WINDOW`, `RANK`), XML support, MERGE |
| 2006 | SQL:2006 | rozšíření SQL/XML (XQuery) |
| 2011 | SQL:2011 | temporal data (system-versioned tables) |
| 2016 | SQL:2016 | JSON podpora (typ + funkce), row pattern matching |
| 2019 | SQL:2019 | multi-dimensional arrays |
| 2023 | SQL:2023 | JSON data type, property graphs |

::: link "ISO/IEC 9075 — SQL standards (Wikipedia)" "https://en.wikipedia.org/wiki/SQL"
:::

## Strukturované UDT (ADT)

**Structured User-Defined Type** je obdobou třídy OOP: má atributy, metody, lze dědit, polymorfismus. Definice typu je oddělená od jeho použití.

```sql
CREATE TYPE t_adresa AS (
  ulice    VARCHAR(100),
  mesto    VARCHAR(50),
  psc      CHAR(5)
);

CREATE TYPE t_osoba AS (
  id       INTEGER,
  jmeno    VARCHAR(50),
  adresa   t_adresa            -- vnořený ADT
) INSTANTIABLE NOT FINAL REF (id);
```

Modifikátory:

* **INSTANTIABLE / NOT INSTANTIABLE** — lze vytvořit instance (analogie konkrétní třídy vs. abstraktní třídy v OOP).
* **NOT FINAL / FINAL** — lze dědit (analogie `final` v Javě).
* **REF (id)** — určuje, který atribut tvoří OID (užitečné, pokud chceme stabilní identifikátor).

### Metody na ADT

```sql
CREATE TYPE t_zamestnanec UNDER t_osoba AS (
  plat   REAL,
  pozice VARCHAR(50)
) INSTANTIABLE NOT FINAL
INSTANCE METHOD rocni_plat() RETURNS REAL;

CREATE INSTANCE METHOD rocni_plat()
RETURNS REAL FOR t_zamestnanec
BEGIN
  RETURN SELF.plat * 12;
END;
```

`UNDER t_osoba` označuje dědičnost — `t_zamestnanec` zdědí všechny atributy `t_osoba` (`id`, `jmeno`, `adresa`) a přidá vlastní. `SELF` je analogie `this` v Javě.

## Použití ADT — dva způsoby

### Jako typ sloupce

ADT může být typem *sloupce* tabulky. Hodnoty *nejsou objekty* (nemají OID), jsou jen *strukturami*.

```sql
CREATE TABLE student (
  id       INTEGER PRIMARY KEY,
  jmeno    VARCHAR(50),
  adresa   t_adresa              -- struktura, žádný OID
);

INSERT INTO student VALUES (1, 'Anna', ROW('Botanická 12', 'Brno', '60200'));

SELECT jmeno, adresa.mesto FROM student;        -- tečková notace
SELECT jmeno FROM student WHERE adresa.psc = '60200';
```

### Jako typ tabulky (typed table)

Tabulka *je typem ADT*. Každý řádek je instancí ADT s vlastním OID.

```sql
CREATE TABLE osoba OF t_osoba;
CREATE TABLE zamestnanec OF t_zamestnanec UNDER osoba;
                                 -- dědí strukturu typed table

INSERT INTO zamestnanec VALUES (
  1, 'Anna', ROW('Botanická 12', 'Brno', '60200'), 50000, 'Vývojář'
);

SELECT z.jmeno, z.rocni_plat() FROM zamestnanec z;
```

::: svg "Dvě role ADT v SQL:1999 — jako typ sloupce (struktura bez OID) a jako typ tabulky (řádky jsou instance s OID a REF)."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="20" y="20" width="240" height="190" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="140" y="40" text-anchor="middle" fill="var(--text)" font-weight="600">ADT jako typ sloupce</text>
    <text x="140" y="58" text-anchor="middle" fill="var(--text-muted)" font-size="10">struktura, žádný OID</text>
    <g font-size="9.5">
      <rect x="40" y="76" width="200" height="100" fill="var(--bg-card)" stroke="var(--line)"/>
      <line x1="40" y1="92" x2="240" y2="92" stroke="var(--line)"/>
      <line x1="80" y1="76" x2="80" y2="176" stroke="var(--line)"/>
      <line x1="135" y1="76" x2="135" y2="176" stroke="var(--line)"/>
      <text x="60" y="88" text-anchor="middle" fill="var(--text-muted)">id</text>
      <text x="107" y="88" text-anchor="middle" fill="var(--text-muted)">jmeno</text>
      <text x="188" y="88" text-anchor="middle" fill="var(--text-muted)">adresa</text>
      <text x="60" y="106" text-anchor="middle" fill="var(--text)">1</text>
      <text x="107" y="106" text-anchor="middle" fill="var(--text)">Anna</text>
      <text x="188" y="106" text-anchor="middle" fill="var(--accent)" font-size="8.5">ROW('Bot.','Brno')</text>
      <text x="60" y="124" text-anchor="middle" fill="var(--text)">2</text>
      <text x="107" y="124" text-anchor="middle" fill="var(--text)">Bob</text>
      <text x="188" y="124" text-anchor="middle" fill="var(--accent)" font-size="8.5">ROW('Hus.','Praha')</text>
    </g>
    <text x="140" y="200" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">SELECT … WHERE adresa.psc = '60200'</text>
  </g>
  <g>
    <rect x="280" y="20" width="240" height="190" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="400" y="40" text-anchor="middle" fill="var(--text)" font-weight="600">ADT jako typ tabulky</text>
    <text x="400" y="58" text-anchor="middle" fill="var(--text-muted)" font-size="10">řádky jsou instance + OID</text>
    <g font-size="9.5">
      <rect x="300" y="76" width="200" height="100" fill="var(--bg-card)" stroke="var(--accent)"/>
      <line x1="300" y1="92" x2="500" y2="92" stroke="var(--accent-line)"/>
      <line x1="345" y1="76" x2="345" y2="176" stroke="var(--accent-line)"/>
      <line x1="395" y1="76" x2="395" y2="176" stroke="var(--accent-line)"/>
      <text x="322" y="88" text-anchor="middle" fill="var(--text-muted)">OID</text>
      <text x="370" y="88" text-anchor="middle" fill="var(--text-muted)">jmeno</text>
      <text x="447" y="88" text-anchor="middle" fill="var(--text-muted)">…</text>
      <text x="322" y="106" text-anchor="middle" fill="var(--accent)">#42</text>
      <text x="370" y="106" text-anchor="middle" fill="var(--text)">Anna</text>
      <text x="447" y="106" text-anchor="middle" fill="var(--text)">…</text>
      <text x="322" y="124" text-anchor="middle" fill="var(--accent)">#18</text>
      <text x="370" y="124" text-anchor="middle" fill="var(--text)">Bob</text>
      <text x="447" y="124" text-anchor="middle" fill="var(--text)">…</text>
    </g>
    <text x="400" y="200" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">SELECT … ; REF(z) lze uložit jinde</text>
  </g>
</svg>
:::

## REF — reference na objekt

`REF(typ)` je odkaz na instanci ADT v typed table. Slouží k vytváření asociací mezi tabulkami bez nutnosti vazebních tabulek a `JOIN`.

```sql
CREATE TABLE fakultni_zamestnanec (
  id_fakulta INTEGER PRIMARY KEY,
  zamestnanec t_zamestnanec,                    -- vnořený ADT
  dept       CHAR(3) REFERENCES dept(kod),      -- klasický FK
  nadrizeny  REF(t_zamestnanec)                 -- reference přes OID
);

SELECT fe.id_fakulta,
       fe.zamestnanec.jmeno,
       fe.zamestnanec.rocni_plat(),
       fe.nadrizeny -> jmeno                    -- dereference přes ->
FROM fakultni_zamestnanec fe
WHERE fe.dept = 'CSD' AND fe.zamestnanec.plat > 20000;
```

Operátor `->` (dereference) v SQL je analogií tečky v C/C++: `fe.nadrizeny` je `REF`, `fe.nadrizeny->jmeno` načte atribut `jmeno` referencovaného objektu. Některé DB (Oracle) používají `DEREF(fe.nadrizeny).jmeno`.

## Manipulace s objekty

DML pracuje s typed tabulkami stejně jako s běžnými, navíc lze používat:

```sql
-- Klasický UPDATE
UPDATE zamestnanec SET plat = plat * 1.1 WHERE pozice = 'Vývojář';

-- ONLY — neaktualizovat dědící řádky
UPDATE ONLY (osoba) o SET o.jmeno = 'Jane Doe' WHERE o.jmeno = 'John Smith';
   -- aktualizuje pouze řádky tabulky 'osoba', NE 'zamestnanec' (UNDER osoba)
```

Modifikátor `ONLY` je klíčový pro práci s typovou dědičností — bez něj operace ovlivní i dědící podtabulky (`zamestnanec` UNDER `osoba`).

## Podpora v současných RDBMS

| RDBMS | SQL:1999 OR rysy | Poznámky |
| :--- | :---: | :--- |
| **Oracle 12c+** | plná | `CREATE TYPE`, typed tables, `REF`, hluboce integrované; OR komponenta `Oracle XML DB` |
| **IBM DB2 11+** | plná | UDT, typed tables, dědičnost |
| **PostgreSQL** | částečná | `CREATE TYPE … AS`, dědičnost tabulek (vlastní syntax); `REF` chybí |
| **MS SQL Server** | minimální | CLR UDT (volání .NET kódu), žádné typed tables |
| **MySQL/MariaDB** | žádná | preferují JSON přístup |
| **Teradata** | částečná | strukturované UDT |

V praxi se OR rysy používají *uměřeně* — programátoři často preferují čistě relační schéma + ORM (Hibernate, JPA), které zapouzdří mapování. Důvod: OR rysy svazují kód s konkrétním RDBMS (Oracle UDT není kompatibilní s PostgreSQL UDT).

## Kdy použít OR rysy

* **Nestrukturovaná data v jednom sloupci** — XML/JSON dokumenty, geoprostorová data (PostGIS používá `geometry` UDT).
* **Vícehodnotové atributy** — pole, kolekce v jednom řádku (např. `ARRAY` v PostgreSQL).
* **Hluboce propojené modely** — typed tables s `REF` mohou nahradit klasické vazební tabulky.
* **Polymorfní entity** — dědičnost typed tables řeší přímo bez "single table inheritance" anti-patternu.

V opačném případě (běžné CRUD aplikace) jsou OR rysy *zbytečnou komplexitou* — ORM nad relačním schématem je jednodušší pro většinu týmů.

::: link "Oracle Database — Object-Relational Developer's Guide" "https://docs.oracle.com/en/database/oracle/oracle-database/19/adobj/index.html"
:::

::: link "PostgreSQL — User-Defined Types" "https://www.postgresql.org/docs/current/sql-createtype.html"
:::

::: link "Melton, J.: Advanced SQL:1999 (book review)" "https://dl.acm.org/doi/book/10.5555/553218"
:::

---

*Zdroj: UPA přednáška *Objects in Databases* (Rychlý, 16. září 2025). Externí reference: Melton, J.: *Advanced SQL:1999 — Understanding Object-Relational and Other Advanced Features*, Morgan Kaufmann 2003; Türker, C., Saake, G.: *Object-Relational Databases — A Hands-on Tutorial*, Springer 2006; ISO/IEC 9075-2:1999 *SQL/Foundation*; Oracle Object-Relational Developer's Guide.*
