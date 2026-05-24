---
title: Common Criteria a EAL
---

# Common Criteria — ISO/IEC 15408

**Common Criteria for Information Technology Security Evaluation** (CC, ISO/IEC 15408) je *globální* standard pro hodnocení bezpečnosti IT produktů. Sjednotil TCSEC, ITSEC a CTCPEC ([[tcsec-itsec]]) v 1999. Aktuální verze: **CC 3.1 R5** (2017), nová **CC 2022** v procesu adopce.

## Struktura CC

CC má tři části (každá jako ISO dokument):

1. **Part 1: Introduction and General Model** — terminologie, koncepty.
2. **Part 2: Security Functional Requirements (SFR)** — *co* IS dělá.
3. **Part 3: Security Assurance Requirements (SAR)** — *jak dobře* je ověřeno.

## Klíčové koncepty

### Target of Evaluation (TOE)

*Co se hodnotí*. Může být:

- Konkrétní produkt (Windows Server 2022, Cisco ASA firewall).
- Systém (banking application).
- Modul (kryptografická knihovna, smart card chip).

### Security Target (ST)

*Specifikace bezpečnosti* TOE. Obsahuje:

- TOE description.
- Security objectives.
- Security functional requirements (z Part 2).
- Security assurance requirements (z Part 3).
- TOE summary specification.

ST = "tohle slibuje TOE delat".

### Protection Profile (PP)

*Šablona* ST pro určitý typ produktu. Definuje *minimum* security requirements pro daný kategorii.

Příklady:

- **PP_FIREWALL_V1.0** — pro firewally.
- **PP_OS_V4.2** — pro operating systems.
- **PP_SMARTCARD** — pro smart cards.

PP umožňuje *standardizovat* hodnocení v dané kategorii. Customer může říct "potřebuji produkt vyhovující PP_FIREWALL" → multiple vendors poskytují kompatibilní produkty.

### TOE Security Functions (TSF)

*Implementace* security požadavků v TOE. Software + hardware components, které *prosazují* security policy.

Analogie TCSEC TCB. CC použivá TSF (Target of Evaluation Security Functions).

## SFR — Security Functional Requirements

Part 2 definuje 11 *funkčních tříd*:

| Class | Co pokrývá |
| :--- | :--- |
| FAU | Security Audit |
| FCO | Communication |
| FCS | Cryptographic Support |
| FDP | User Data Protection |
| FIA | Identification and Authentication |
| FMT | Security Management |
| FPR | Privacy |
| FPT | Protection of the TSF |
| FRU | Resource Utilization |
| FTA | TOE Access |
| FTP | Trusted Path/Channels |

Každá třída obsahuje *families* a *components* — hierarchická struktura.

Příklad: `FCS_COP.1` = Cryptographic operation, component 1 (basic crypto algorithm).

ST specifikuje, *které* SFRs TOE implementuje.

## SAR — Security Assurance Requirements

Part 3 definuje 7 *assurance levels* (EAL 1-7):

| EAL | Anglicky | Co znamená |
| :--- | :--- | :--- |
| **EAL 1** | Functionally tested | basic correspondence, žádná hluboká analýza |
| **EAL 2** | Structurally tested | low-level design info, vulnerability assessment |
| **EAL 3** | Methodically tested and checked | architecture, security testing |
| **EAL 4** | Methodically designed, tested, and reviewed | source code review (commercial products typicky) |
| **EAL 5** | Semiformally designed and tested | semi-formal design, hidden channels analysis |
| **EAL 6** | Semiformally verified design and tested | formal model |
| **EAL 7** | Formally verified design and tested | formal verification (top secret) |

EAL 4 = praktický maximum pro mainstream products (Windows, Linux, Cisco). EAL 5+ pro smart cards, military.

::: svg "EAL hierarchie — od basic po formal verification"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="60" width="60" height="40" rx="3"/>
    <rect x="85" y="60" width="60" height="40" rx="3"/>
    <rect x="150" y="60" width="60" height="40" rx="3"/>
    <rect x="215" y="60" width="60" height="40" rx="3"/>
    <rect x="280" y="60" width="60" height="40" rx="3"/>
    <rect x="345" y="60" width="60" height="40" rx="3"/>
    <rect x="410" y="60" width="60" height="40" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="50" y="82">EAL 1</text>
    <text x="115" y="82">EAL 2</text>
    <text x="180" y="82">EAL 3</text>
    <text x="245" y="82">EAL 4</text>
    <text x="310" y="82">EAL 5</text>
    <text x="375" y="82">EAL 6</text>
    <text x="440" y="82">EAL 7</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="50" y="95">basic</text>
    <text x="115" y="95">structural</text>
    <text x="180" y="95">methodical</text>
    <text x="245" y="95">designed</text>
    <text x="310" y="95">semiformal</text>
    <text x="375" y="95">semiformal+</text>
    <text x="440" y="95">formal</text>
  </g>
  <g fill="var(--accent)" opacity="0.15">
    <rect x="20" y="55" width="195" height="55"/>
  </g>
  <text x="120" y="50" text-anchor="middle" fill="var(--accent)" font-size="9">commercial low-risk</text>
  <g fill="var(--accent-line)" opacity="0.15">
    <rect x="215" y="55" width="130" height="55"/>
  </g>
  <text x="280" y="50" text-anchor="middle" fill="var(--accent-line)" font-size="9">commercial high-end (EAL 4-5)</text>
  <g fill="var(--text)" opacity="0.15">
    <rect x="345" y="55" width="125" height="55" fill="var(--accent)"/>
  </g>
  <text x="408" y="50" text-anchor="middle" fill="var(--accent)" font-size="9">military / smart card</text>
  <text x="270" y="140" text-anchor="middle" fill="var(--text-faint)" font-size="9">Vyšší EAL = víc důkazů, víc reviewers, drahá certifikace ($100k - $5M).</text>
</svg>
:::

### EAL augmentation

`EAL N+` znamená EAL N *plus* augmented assurance (více než minimum pro tu úroveň). Např. `EAL 4+` často znamená "EAL 4 plus AVA_VAN.5 (penetration testing s high attack potential)".

::: viz cc-eal-explorer "Posouvej EAL 1→7. Vidíš požadovanou evidence (informal → semiformal → formal), cost, dobu, typický produkt. EAL 4 je commercial maximum, EAL 7 vyžaduje formální matematický důkaz designu."
:::

## Evaluation process

1. **Vendor přípravy**: napsat ST, implementovat TOE, prepare evidence.
2. **CB (Certification Body) selekce**: BSI (Germany), NIAP (USA), ANSSI (France), JCMVP (Japan), MoD (UK).
3. **CCEF (Common Criteria Evaluation Facility) provádí evaluation**: hodnotitel kontroluje evidence.
4. **CB vydává Certification Report**.
5. **CC certifikát** vydán → produkt v list.

Trvání: 6-24 měsíců. Cena: $100k-$5M podle EAL.

## CCRA — Common Criteria Recognition Arrangement

Mezivládní dohoda — certifikát z jednoho státu uznán v jiných.

- **Authorising Members** (vydávají certifikáty): US, Canada, France, Germany, Japan, ...
- **Consuming Members** (uznávají): další státy.

⇒ Certifikát z Německa = uznán v USA. Snižuje regulatorní bariéry.

CCRA do EAL 4 (over EAL 4 jednotlivé státy specifically posuzují).

## Limity CC

- **Drahá** — $100k-$5M znamená, že jen velké produkty si můžou dovolit.
- **Pomalá** — 1-2 roky, mezitím produkt evolvoval.
- **Snapshot** — certifikuje *konkrétní verzi*. Patch breaks certification.
- **Méně responsive** — neumí pružně reagovat na nové hrozby.
- **Doesn't guarantee security** — formálně verifikovaný produkt může mít implementation bugs.

Kritika: certifikace je "*compliance theater*" v některých případech — checkbox bez reálné jistoty.

Despite limits, CC zůstává standardem pro government a critical infrastructure procurement.

## Reálné CC certifikáty

| Produkt | EAL | Použití |
| :--- | :---: | :--- |
| Windows Server 2019 | EAL 4+ | enterprise |
| Red Hat Enterprise Linux 9 | EAL 4+ | enterprise |
| Cisco ASA Firewall | EAL 4+ | network security |
| MUSCLE smart card | EAL 5+ | smart card |
| seL4 microkernel | EAL 6+ (formal proof) | high-assurance embedded |
| Some military OS | EAL 7 | classified |

## Vztah k FIPS 140

FIPS 140-3 ([[fips-evaluation]]) cílí jen na *kryptografické moduly* — užší než CC. Pro krypto module je FIPS 140-3 *průmyslový standard*, CC EAL doplněk.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: ISO/IEC 15408-1:2009 — Common Criteria, Part 1 (Introduction); ISO/IEC 15408-2 — Functional Components; ISO/IEC 15408-3 — Assurance Components; [Common Criteria Portal](https://www.commoncriteriaportal.org/); [BSI Common Criteria](https://www.bsi.bund.de/EN/Topics/Certification/CommonCriteria/commoncriteria_node.html); Pfleeger, C.P., Pfleeger, S.L., Margulies, J.: „Security in Computing" (5th ed., Prentice Hall 2015), §5.*
