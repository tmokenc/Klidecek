---
title: TCSEC a ITSEC — historická kritéria
---

# Historická kritéria hodnocení bezpečnosti — TCSEC a ITSEC

Před standardizací **Common Criteria** ([[common-criteria]]) existovala *národní* a *regionální* kritéria pro hodnocení bezpečnosti IS — americké **TCSEC** (1985) a evropské **ITSEC** (1990). Obě jsou *dnes neaktivní*, ale jejich klasifikace přežívají v terminologii a v obecné struktuře CC.

## TCSEC — Trusted Computer System Evaluation Criteria

*Orange Book* (1985, US DoD). Vznikl pro hodnocení vojenských systémů. Je známý jako „Rainbow Series" — sada barevně označených dokumentů.

### Hierarchie tříd

| Třída | Co znamená | Příklady |
| :--- | :--- | :--- |
| **D** | minimální ochrana (minimal protection) | DOS, žádná ochrana |
| **C1** | volitelná ochrana přístupu (discretionary security protection) | Unix bez vylepšení |
| **C2** | řízená ochrana přístupu (controlled access protection) | Unix s bezpečnostní politikou (security policy), Windows NT |
| **B1** | ochrana s bezpečnostními značkami (labeled security protection) | systémy s citlivostními značkami (sensitivity labels) |
| **B2** | strukturovaná ochrana (structured protection) | důvěryhodná cesta (trusted path), formální model |
| **B3** | bezpečnostní domény (security domains) | minimální jádro, formální analýza |
| **A1** | ověřený návrh (verified design) | formálně verifikovaný návrh |

Hierarchie je inkluzivní — vyšší třída zahrnuje *všechny* požadavky tříd nižších.

### Klíčové koncepty TCSEC

- **TCB** (Trusted Computing Base) — hardware, software a firmware, který *implementuje* bezpečnostní politiku.
- **Referenční monitor (reference monitor)** — abstraktní entita, která *vždy* kontroluje přístup. Musí být:
  - odolný proti narušení (tamper-proof),
  - vždy zapojen do každého přístupu (always invoked),
  - dostatečně malý, aby šel ověřit (small enough to verify).
- **Volitelné řízení přístupu (Discretionary Access Control, DAC)** — práva nastavuje vlastník objektu ([[dac-mac]]).
- **Povinné řízení přístupu (Mandatory Access Control, MAC)** — značky vynucuje samotný systém (Bell-LaPadula [[bell-lapadula]]).

### Limity TCSEC

- **Orientace pouze na důvěrnost (confidentiality)** — chybí požadavky na integritu (Biba) a dostupnost (availability).
- **Pouze pro samostatné systémy (single systems)** — netýká se sítí ani distribuovaných systémů.
- **Pouze pro USA, nikoli globálně.**
- **Statická** — neumí se pružně přizpůsobit.

TCSEC byl v letech 2000–2010 nahrazen standardem Common Criteria. Dnes je již zastaralý (obsolete).

## ITSEC — Information Technology Security Evaluation Criteria

Evropská verze, harmonizovaná verze 1.2 byla vydána v roce 1991. Vznikla z TCSEC doplněného o národní iniciativy Velké Británie, Francie, Německa a Nizozemska.

### Klíčový rozdíl proti TCSEC

ITSEC *odděluje* dvě dimenze:

- **Funkcionalitu (functionality)** — *co* systém dělá (třídy F-*).
- **Úroveň záruky (assurance level)** — *jak dobře* je to ověřeno (E0–E6).

⇒ Lze je libovolně kombinovat: vysokou funkcionalitu s nízkou zárukou, nebo naopak.

### Třídy funkcionality (functionality classes)

Existuje 10 *příkladových* tříd:

| Třída | Co dělá |
| :--- | :--- |
| F-C1, F-C2, F-B1, F-B2, F-B3 | odpovídají třídám TCSEC C1–B3 (převzaté, legacy) |
| F-IN | zaměřená na integritu (integrity) |
| F-AV | zaměřená na dostupnost (availability) |
| F-DI | integrita dat při přenosu (data integrity in transit) |
| F-DC | důvěrnost dat (data confidentiality) |
| F-DX | výměna dat (data exchange) |

Uživatelé si *mohou* definovat vlastní třídy (na rozdíl od rigidní struktury TCSEC).

### Úrovně záruky (assurance levels) E0–E6

| Úroveň | Co znamená |
| :--- | :--- |
| **E0** | nedostatečná záruka (inadequate assurance) |
| **E1** | základní — neformální architektura |
| **E2** | zdokumentovaný podrobný návrh |
| **E3** | zdrojový kód a doložení shody s návrhem |
| **E4** | poloformální architektura |
| **E5** | formální popis architektury |
| **E6** | formální verifikace |

Úrovně E0–E6 hodnotí *vývojový proces*, *prostředí vývoje*, *provozní dokumentaci* a *provozní prostředí*.

### Bezpečnostní funkce podle ITSEC

ITSEC definuje 8 kategorií *bezpečnostních funkcí* (později je převzala Common Criteria):

1. **Identifikace a autentizace** (identification, authentication).
2. **Řízení přístupu (access control)**.
3. **Účtovatelnost** (audit, accountability).
4. **Audit**.
5. **Opakované užití objektů** (object reuse — vymazat paměť před jejím novým přidělením).
6. **Přesnost** (accuracy).
7. **Spolehlivost a dostupnost služeb**.
8. **Výměna dat** (data exchange — zabezpečená komunikace).

Detaily viz [[bezpecnostni-funkce]].

## CTCPEC — kanadská verze

Canadian Trusted Computer Product Evaluation Criteria (1993). Zaměřena na **4 cíle**:

- **Důvěrnost (confidentiality, WC)** — 4 úrovně.
- **Integrita (integrity, WI)** — 4 úrovně.
- **Dostupnost (availability, WA)** — 4 úrovně.
- **Účtovatelnost (accountability)** — 4 úrovně.

Klíčový posun: triáda CIA *plus* účtovatelnost jako *rovnocenné* cíle. TCSEC se zaměřoval pouze na důvěrnost.

CTCPEC se v roce 1999 sloučila s TCSEC a ITSEC do standardu Common Criteria.

## Common Criteria — sjednocení

V roce 1996 vznikl proces sloučení TCSEC, ITSEC a CTCPEC. Výsledkem je **ISO/IEC 15408 Common Criteria** z roku 1999.

CC převzala:

- **Funkcionalitu** (z ITSEC) → funkční požadavky CC (Part 2).
- **Úrovně záruky** (z ITSEC) → CC EAL 1–7.
- **CIA a účtovatelnost** (z CTCPEC) → funkční třídy CC.
- **Referenční monitor a TCB** (z TCSEC) → CC Target of Evaluation (TOE), tedy předmět hodnocení.

Detaily viz [[common-criteria]].

## Vztah k modernímu IS

Dnes se TCSEC a ITSEC *nepoužívají*. Přesto však:

- terminologie přežívá — „TCB", „referenční monitor", „MAC", „DAC";
- Common Criteria *jsou* spojením TCSEC, ITSEC a CTCPEC;
- FIPS 140 ([[fips-evaluation]]) pro kryptografické moduly je stále aktivní.

Pro hodnocení moderních IS používáme:

- **Common Criteria EAL** pro obecnou bezpečnost (general-purpose security).
- **FIPS 140-3** pro kryptografické moduly.
- **NIST SP 800-53** pro federální (federal) systémy.
- **ISO 27001** pro ISMS ([[iso-27000]]).

## Příklad: hodnocení čipové karty {tier=example}

Čipová karta (smart card) s platební funkcí:

- CC: EAL 5+ (poloformální návrh a formální model).
- FIPS 140-3: Level 4 (nejvyšší, aktivní ochrana proti narušení, tamper-active).
- Shoda s normami ISO 14443 / EMV.
- Common Criteria Protection Profile: BSI-CC-PP-0084 (vestavěný software čipové karty).

Více kritérií je zde *navrstveno (layered)* — každé pokrývá jiný aspekt.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně, a Hanáček & Staudek: „Bezpečnost IS — Metodická příručka" (ÚSIS 2000). Externí reference: U.S. DoD: „Trusted Computer System Evaluation Criteria" (DoD 5200.28-STD, 1985); CEC: „Information Technology Security Evaluation Criteria" (ITSEC, 1991); Canada: „Canadian Trusted Computer Product Evaluation Criteria" (CTCPEC v3.0, 1993); Pfleeger, C.P., Pfleeger, S.L., Margulies, J.: „Security in Computing" (5th ed., Prentice Hall 2015), §5.*
