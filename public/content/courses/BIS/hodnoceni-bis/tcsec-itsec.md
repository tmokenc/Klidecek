---
title: TCSEC, ITSEC — historická kritéria
---

# Historická kritéria hodnocení bezpečnosti — TCSEC a ITSEC

Před standardizací **Common Criteria** ([[common-criteria]]) existovala *národní* a *regionální* kritéria pro hodnocení bezpečnosti IS — americké **TCSEC** (1985) a evropské **ITSEC** (1990). Obě jsou *dnes neaktivní*, ale jejich klasifikace přežívají v terminologii a obecné struktuře CC.

## TCSEC — Trusted Computer System Evaluation Criteria

*Orange Book* (1985, US DoD). Vznikl pro hodnocení vojenských systémů. Známý jako "Rainbow Series" — sada barevně označených dokumentů.

### Hierarchie tříd

| Třída | Co znamená | Příklady |
| :--- | :--- | :--- |
| **D** | Minimal protection | DOS, žádná ochrana |
| **C1** | Discretionary Security Protection | Unix bez vylepšení |
| **C2** | Controlled Access Protection | Unix se security policy, Windows NT |
| **B1** | Labeled Security Protection | systémy s sensitivity labels |
| **B2** | Structured Protection | trusted path, formal model |
| **B3** | Security Domains | minimal kernel, formal analysis |
| **A1** | Verified Design | formálně verifikovaný design |

Hierarchická — vyšší třída zahrnuje *všechny* požadavky nižších.

### Klíčové koncepty TCSEC

- **TCB** (Trusted Computing Base) — hw + sw + firmware, který *implementuje* policy.
- **Reference monitor** — abstraktní entita, která *vždy* kontroluje access. Musí být:
  - Tamper-proof.
  - Always invoked.
  - Small enough to verify.
- **Discretionary Access Control (DAC)** — vlastník objektu nastavuje práva ([[dac-mac]]).
- **Mandatory Access Control (MAC)** — system enforces labels (Bell-LaPadula [[bell-lapadula]]).

### Limity TCSEC

- **Orientace jen na confidentiality** — žádné požadavky na integrity (Biba), availability.
- **Jen pro single-systems** — netýká se sítí, distribuovaných systémů.
- **Jen pro USA, ne globální**.
- **Statické** — neumí pružně se přizpůsobit.

TCSEC nahrazen Common Criteria v 2000s. Dnes obsolete.

## ITSEC — Information Technology Security Evaluation Criteria

Evropská verze (1990, schválena 1995). Vznikla z TCSEC + národní iniciativy UK, FR, DE, NL.

### Klíčový rozdíl proti TCSEC

ITSEC *odděluje*:

- **Functionality** — *co* systém dělá (F-* classes).
- **Assurance level** — *jak dobře* je to ověřeno (E0-E6).

⇒ Lze kombinovat: vysokou funkcionalitu s nízkou assurance, nebo naopak.

### Functionality classes

10 *příkladových* tříd:

| Třída | Co dělá |
| :--- | :--- |
| F-C1, F-C2, F-B1, F-B2, F-B3 | Odpovídají TCSEC C1-B3 (legacy) |
| F-IN | Integrity-focused |
| F-AV | Availability-focused |
| F-DI | Data integrity in transit |
| F-DC | Data confidentiality |
| F-DX | Data exchange |

Uživatelé *mohou* definovat vlastní třídy (na rozdíl od TCSEC rigid struktury).

### Assurance levels (E0-E6)

| Level | Co znamená |
| :--- | :--- |
| **E0** | Inadequate assurance |
| **E1** | Basic — informal architecture |
| **E2** | Detailed design documented |
| **E3** | Source code + correspondence |
| **E4** | Semi-formal architecture |
| **E5** | Formal description of architecture |
| **E6** | Formal verification |

E0-E6 řeší *vývojový proces*, *prostředí vývoje*, *provozní dokumentaci*, *provozní prostředí*.

### Bezpečnostní funkce podle ITSEC

ITSEC definuje 8 kategorií *bezpečnostních funkcí* (později převzato Common Criteria):

1. **Identifikace a autentizace**.
2. **Řízení přístupu**.
3. **Účtovatelnost** (audit, accountability).
4. **Audit**.
5. **Opakované užití objektů** (object reuse — clean memory before reallocate).
6. **Přesnost** (accuracy).
7. **Spolehlivost a dostupnost služeb**.
8. **Výměna dat** (data exchange — secure communication).

Detail v [[bezpecnostni-funkce]].

## CTCPEC — kanadská verze

Canadian Trusted Computer Product Evaluation Criteria (1993). Zaměřena na **4 cíle**:

- **Confidentiality (WC)** — 4 úrovně.
- **Integrity (WI)** — 4 úrovně.
- **Availability (WA)** — 4 úrovně.
- **Accountability** — 4 úrovně.

Klíčový posun: CIA *plus* accountability jako *rovnocenné* cíle. TCSEC byl jen confidentiality.

CTCPEC sloučil se s TCSEC a ITSEC do Common Criteria v 1999.

## Common Criteria — sjednocení

V roce 1996 vznikl proces sloučení TCSEC + ITSEC + CTCPEC. Výsledek: **ISO/IEC 15408 Common Criteria**, 1999.

CC převzala:

- **Functionality** (z ITSEC) → CC functional requirements (Part 2).
- **Assurance levels** (z ITSEC) → CC EAL 1-7.
- **CIA + accountability** (z CTCPEC) → CC functional classes.
- **Reference monitor, TCB** (z TCSEC) → CC Target of Evaluation (TOE).

Detaily v [[common-criteria]].

## Vztah k modernímu IS

Dnes TCSEC a ITSEC *nepoužívají*. Ale:

- Terminologie přežívá — "TCB", "reference monitor", "MAC", "DAC".
- Common Criteria *je* TCSEC+ITSEC+CTCPEC.
- FIPS 140 ([[fips-evaluation]]) pro kryptografické moduly stále aktivní.

Pro hodnocení modern IS používáme:

- **Common Criteria EAL** pro general-purpose security.
- **FIPS 140-3** pro kryptografické moduly.
- **NIST SP 800-53** pro federal systems.
- **ISO 27001** pro ISMS ([[iso-27000]]).

## Příklad: smart card hodnocení

Smart card s payment functionality:

- CC: EAL 5+ (semi-formal design + formal model).
- FIPS 140-3: Level 4 (highest, tamper-active).
- ISO 14443 / EMV compliance.
- Common Criteria Protection Profile: BSI-CC-PP-0084 (smart card embedded software).

Multiple kritéria *layered* — každé pokrývá jiný aspekt.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně, a Hanáček & Staudek: „Bezpečnost IS — Metodická příručka" (ÚSIS 2000). Externí reference: U.S. DoD: „Trusted Computer System Evaluation Criteria" (DoD 5200.28-STD, 1985); CEC: „Information Technology Security Evaluation Criteria" (ITSEC, 1991); Canada: „Canadian Trusted Computer Product Evaluation Criteria" (CTCPEC v3.0, 1993); Pfleeger, C.P., Pfleeger, S.L., Margulies, J.: „Security in Computing" (5th ed., Prentice Hall 2015), §5.*
