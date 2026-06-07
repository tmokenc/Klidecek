---
title: Common Criteria a EAL
---

# Common Criteria — ISO/IEC 15408

**Common Criteria for Information Technology Security Evaluation** (CC, ISO/IEC 15408) je *globální* standard pro hodnocení bezpečnosti IT produktů. V roce 1999 sjednotil starší standardy TCSEC, ITSEC a CTCPEC ([[tcsec-itsec]]). Aktuální verzí je **CC 3.1 R5** (2017), nová **CC 2022** se postupně zavádí.

## Struktura CC

CC se skládá ze tří částí (každá je samostatným dokumentem ISO):

1. **Part 1: Introduction and General Model** — terminologie a koncepty.
2. **Part 2: Security Functional Requirements (SFR)** — *co* daný systém dělá.
3. **Part 3: Security Assurance Requirements (SAR)** — *jak dobře* je to ověřeno.

## Klíčové koncepty

### Target of Evaluation (TOE)

*Předmět hodnocení* — tedy to, co se hodnotí. Může to být:

- Konkrétní produkt (Windows Server 2022, firewall Cisco ASA).
- Systém (například bankovní aplikace).
- Modul (kryptografická knihovna, čip čipové karty).

### Security Target (ST)

*Specifikace bezpečnosti* daného TOE. Obsahuje:

- Popis TOE (TOE description).
- Bezpečnostní cíle (security objectives).
- Bezpečnostní funkční požadavky (security functional requirements, z Part 2).
- Bezpečnostní požadavky na záruky (security assurance requirements, z Part 3).
- Souhrnnou specifikaci TOE (TOE summary specification).

ST jednoduše říká „tohle TOE slibuje dělat".

### Protection Profile (PP)

*Šablona* dokumentu ST pro určitý typ produktu. Definuje *minimum* bezpečnostních požadavků (security requirements) pro danou kategorii.

Příklady:

- **PP_FIREWALL_V1.0** — pro firewally.
- **PP_OS_V4.2** — pro operační systémy.
- **PP_SMARTCARD** — pro čipové karty.

PP umožňuje *standardizovat* hodnocení v dané kategorii. Zákazník může říct „potřebuji produkt vyhovující PP_FIREWALL" a více dodavatelů (vendors) mu pak nabídne vzájemně kompatibilní produkty.

### TOE Security Functions (TSF)

*Implementace* bezpečnostních požadavků v rámci TOE. Jde o softwarové a hardwarové komponenty, které *prosazují* bezpečnostní politiku (security policy).

Je to obdoba pojmu TCB ze standardu TCSEC. CC pro totéž používá zkratku TSF (Target of Evaluation Security Functions).

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

Každá třída obsahuje *rodiny* (families) a *komponenty* (components) — jde tedy o hierarchickou strukturu.

Příklad: `FCS_COP.1` = Cryptographic operation, komponenta 1 (základní kryptografický algoritmus).

Dokument ST určuje, *které* SFR dané TOE implementuje.

## SAR — Security Assurance Requirements

Part 3 definuje 7 *úrovní záruk* (assurance levels, EAL 1–7):

| EAL | Anglicky | Co znamená |
| :--- | :--- | :--- |
| **EAL 1** | Functionally tested | základní shoda, žádná hluboká analýza |
| **EAL 2** | Structurally tested | informace o návrhu na nízké úrovni, posouzení zranitelností (vulnerability assessment) |
| **EAL 3** | Methodically tested and checked | architektura, bezpečnostní testování |
| **EAL 4** | Methodically designed, tested, and reviewed | revize zdrojového kódu (typicky komerční produkty) |
| **EAL 5** | Semiformally designed and tested | poloformální návrh, analýza skrytých kanálů |
| **EAL 6** | Semiformally verified design and tested | formální model |
| **EAL 7** | Formally verified design and tested | formální verifikace (přísně tajné systémy) |

EAL 4 je praktické maximum pro běžné komerční produkty (Windows, Linux, Cisco). Úroveň EAL 5 a vyšší je určena pro čipové karty a vojenské nasazení.

::: svg "Hierarchie EAL — od základní úrovně po formální verifikaci"
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

### Rozšíření EAL (augmentation)

Zápis `EAL N+` znamená EAL N *plus* rozšířené záruky (augmented assurance) — tedy více, než je pro danou úroveň minimum. Například `EAL 4+` často znamená „EAL 4 plus AVA_VAN.5 (penetrační testování s vysokým potenciálem útoku)".

::: viz cc-eal-explorer "Posouvej EAL 1→7. Vidíš požadované důkazy (informal → semiformal → formal), cenu, dobu a typický produkt. EAL 4 je komerční maximum, EAL 7 vyžaduje formální matematický důkaz návrhu."
:::

## Průběh hodnocení

1. **Příprava na straně dodavatele (vendor)**: napsat ST, implementovat TOE a připravit důkazy (evidence).
2. **Výběr certifikačního orgánu (CB, Certification Body)**: BSI (Německo), NIAP (USA), ANSSI (Francie), JCMVP (Japonsko), MoD (Velká Británie).
3. **Hodnocení provádí CCEF (Common Criteria Evaluation Facility)**: hodnotitel kontroluje předložené důkazy.
4. **Certifikační orgán vydává Certification Report**.
5. **Vydán je certifikát CC** a produkt se zařadí do seznamu.

Doba trvání: 6–24 měsíců. Cena: 100 tisíc až 5 milionů dolarů podle úrovně EAL.

## CCRA — Common Criteria Recognition Arrangement

Mezivládní dohoda — certifikát z jednoho státu je uznáván v ostatních.

- **Authorising Members** (vydávají certifikáty): USA, Kanada, Francie, Německo, Japonsko, ...
- **Consuming Members** (uznávají certifikáty): další státy.

Z toho plyne, že certifikát z Německa je uznán i v USA. Tím se snižují regulační bariéry.

CCRA platí do úrovně EAL 4 (nad EAL 4 si certifikaci posuzují jednotlivé státy samostatně).

## Limity CC

- **Drahá** — náklady 100 tisíc až 5 milionů dolarů znamenají, že si ji můžou dovolit jen velké produkty.
- **Pomalá** — trvá 1–2 roky, mezitím se produkt už dál vyvinul.
- **Snímek stavu (snapshot)** — certifikuje se *konkrétní verze*. Záplata (patch) certifikaci ruší.
- **Málo pružná** — neumí pružně reagovat na nové hrozby (threats).
- **Nezaručuje bezpečnost** — i formálně verifikovaný produkt může obsahovat chyby v implementaci.

Kritika zní, že certifikace je v některých případech jen „*compliance theater*" — odškrtnutí kolonky bez skutečné jistoty.

I přes tyto limity zůstává CC standardem pro nákupy ve veřejné správě a v kritické infrastruktuře.

## Reálné certifikáty CC

| Produkt | EAL | Použití |
| :--- | :---: | :--- |
| Windows Server 2019 | EAL 4+ | enterprise |
| Red Hat Enterprise Linux 9 | EAL 4+ | enterprise |
| Cisco ASA Firewall | EAL 4+ | síťová bezpečnost |
| MUSCLE smart card | EAL 5+ | čipová karta |
| seL4 microkernel | formálně verifikován (záruky nad rámec CC EAL 7; není to certifikát CC EAL) | vestavěné systémy s vysokými zárukami |
| Některý vojenský OS | EAL 7 | utajované nasazení |

## Vztah k FIPS 140

FIPS 140-3 ([[fips-evaluation]]) cílí jen na *kryptografické moduly* — je tedy užší než CC. Pro kryptografický modul je FIPS 140-3 *průmyslovým standardem*, zatímco CC EAL je doplňkem.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: ISO/IEC 15408-1:2009 — Common Criteria, Part 1 (Introduction); ISO/IEC 15408-2 — Functional Components; ISO/IEC 15408-3 — Assurance Components; [Common Criteria Portal](https://www.commoncriteriaportal.org/); [BSI Common Criteria](https://www.bsi.bund.de/EN/Topics/Certification/CommonCriteria/commoncriteria_node.html); Pfleeger, C.P., Pfleeger, S.L., Margulies, J.: „Security in Computing" (5th ed., Prentice Hall 2015), §5.*
