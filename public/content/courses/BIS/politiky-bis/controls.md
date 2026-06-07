---
title: Bezpečnostní opatření (controls)
---

# Bezpečnostní opatření (controls) — taxonomie

Bezpečnostní *opatření* (controls) jsou *mechanismy*, které snižují *riziko* — buď snížením *pravděpodobnosti* incidentu, nebo jeho *dopadu*. Tato sekce třídí opatření podle druhu (administrativní / technická / fyzická) a podle funkce (preventivní / detekční / nápravná / …).

## Tři druhy opatření

::: svg "Tři druhy controls — admin, technical, physical"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="30" width="160" height="120" rx="4"/>
    <rect x="190" y="30" width="160" height="120" rx="4"/>
    <rect x="360" y="30" width="160" height="120" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="100" y="50">Administrative</text>
    <text x="270" y="50">Technical</text>
    <text x="440" y="50">Physical</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="100" y="64">soft controls</text>
    <text x="270" y="64">logical controls</text>
    <text x="440" y="64">fyzické bariéry</text>
  </g>
  <g fill="var(--text)" font-size="10">
    <text x="35" y="90">• Policy</text>
    <text x="35" y="105">• Procedures</text>
    <text x="35" y="120">• Training</text>
    <text x="35" y="135">• Screening</text>
    <text x="205" y="90">• Firewall</text>
    <text x="205" y="105">• IDS / IPS</text>
    <text x="205" y="120">• Encryption</text>
    <text x="205" y="135">• Authentication</text>
    <text x="375" y="90">• Locks</text>
    <text x="375" y="105">• Fences</text>
    <text x="375" y="120">• Guards</text>
    <text x="375" y="135">• Surveillance</text>
  </g>
</svg>
:::

### Administrativní opatření („soft controls")

Jsou zaměřena na řízení (management). Souvisejí s *politikou* (policy), *procesy* a *lidmi*.

- **Bezpečnostní politika (security policy)** — formální dokument.
- **Standardy a postupy (standards & procedures)** — popisují, *jak* politiku zavést.
- **Školení a osvěta (training & awareness)** — uživatelé vědí, jak se bezpečně chovat.
- **Prověřování personálu (personnel screening)** — ověření minulosti při náboru.
- **Oddělení pravomocí (separation of duties)** — žádný jednotlivec nemá *vše* ve své moci.
- **Rotace pracovních pozic (job rotation)** — odhaluje podvody (fraud).
- **Povinná dovolená (mandatory vacation)** — odhaluje dlouhodobě skrývané podvody.
- **Etický kodex (code of conduct)** — pravidla správného chování.

### Technická (logická) opatření

Jsou tvořena softwarovými a hardwarovými prvky. Zavádějí politiku *technicky*.

- **Firewally (firewalls)** ([[firewall]]).
- **IDS / IPS** ([[ids-ips]]).
- **Šifrování (encryption)** ([[symetrika-v-is]]).
- **Identifikace a autentizace (authentication)** — hesla, MFA, biometrie.
- **Řízení přístupu (access control)** ([[dac-mac]]).
- **Antivirus / EDR** (Endpoint Detection & Response).
- **VPN / IPsec** ([[vpn-ipsec]]).
- **DLP** (Data Loss Prevention, ochrana před únikem dat).

### Fyzická opatření

Fyzické bariéry.

- **Zámky (locks)** — dveře, racky, zásuvky.
- **Ploty a zábrany (fences & barriers)** — perimetr.
- **Ostraha (security guards)** — lidský dohled.
- **Kamerový dohled (surveillance)** — CCTV, pohybové senzory.
- **Bezpečnostní propusti (mantraps)** — dvojité dveře.
- **Klimatizace a hašení požáru (HVAC + fire suppression)** — ochrana prostředí.
- **Elektromagnetické stínění (EM shielding)** — Faradayova klec proti TEMPEST.

## Šest funkcí opatření

Každé opatření má jednu nebo více *funkcí*:

| Funkce | Co dělá | Příklad |
| :--- | :--- | :--- |
| **Preventivní (preventive)** | předchází | zámky, firewall, šifrování |
| **Detekční (detective)** | detekuje | IDS, auditní log, CCTV |
| **Nápravná (corrective)** | opravuje | obnova obrazu serveru, plán reakce na incident |
| **Odrazující (deterrent)** | odrazuje | ploty, výstražné cedule, auditní politika |
| **Obnovovací (recovery)** | obnovuje | zálohy, zotavení po havárii |
| **Kompenzační (compensating)** | nahrazuje | proxy místo firewallu |

Hloubková obrana (defense in depth) = *všechny* funkce, *ve vrstvách*.

## Mapování opatření → funkce → druh

| Opatření | Druh | Funkce |
| :--- | :--- | :--- |
| Zámek na dveřích | Fyzické | Preventivní + odrazující |
| Firewall | Technické | Preventivní |
| IDS | Technické | Detekční |
| Auditní logy | Administrativní (politika) + technické (implementace) | Detekční + nápravné |
| Záloha | Technické | Obnovovací |
| Dokument bezpečnostní politiky | Administrativní | Preventivní (stanovuje očekávání) |
| Bezpečnostní školení | Administrativní | Preventivní (snižuje chyby uživatelů) |
| Kamera CCTV | Fyzické | Detekční + odrazující |
| Plán kontinuity provozu (BCP) | Administrativní | Obnovovací |

## Hloubková obrana (defense in depth, vrstvená obrana)

Princip: *více vrstev* ochrany — útočník (attacker) musí překonat *všechny*.

| Vrstva | Příklad opatření |
| :--- | :--- |
| Perimetr | firewall, ochrana proti DDoS, plot |
| Síť | segmentace, VLAN, interní firewall |
| Koncový bod (endpoint) | EDR, antivirus, zpevnění operačního systému (OS hardening) |
| Aplikace | bezpečné programování, WAF, validace vstupů |
| Data | šifrování v klidu i při přenosu, DLP |
| Identita | MFA, RBAC, princip nejmenšího oprávnění |
| Audit | logování, SIEM, dohled v SOC |

Žádná jediná vrstva *není* dostatečná. Každá vrstva útočníka *zdrží*, nebo jej *odhalí*.

## Princip nejmenšího oprávnění (least privilege)

Subjekt má *minimum* oprávnění — *jen* tolik, kolik potřebuje pro svou práci. Žádná nadbytečná práva.

Příklady:

- Pro každodenní práci běžné uživatelské účty (ne administrátorské).
- Servisní účty (service accounts) jen pro *konkrétní* úkony.
- Databázová spojení s účtem pouze pro čtení (read-only) pro reportovací nástroje.
- Síťová pravidla — explicitně povolit, zbytek zakázat.

Podrobnosti v [[rbac-abac]].

## Oddělení pravomocí (separation of duties)

*Žádný* jednotlivec *nemá* veškerou pravomoc pro citlivou operaci.

Klasický příklad: finanční transakce.

- Osoba A: zahájí platbu.
- Osoba B: platbu schválí.

Pokud má A *zlý úmysl* (malicious), nemůže ji provést sám. Potřebuje součinnost osoby B → mnohem obtížnější.

V IT:

- Vývojář ≠ správce systému (sysadmin).
- Vývojář ≠ auditor.
- Auditor ≠ provoz (operations).

## Potřeba vědět (need to know)

Subjekt má přístup k *informaci* jen tehdy, pokud ji *potřebuje* pro svou práci.

Nestačí mít prověrku (clearance) na danou *úroveň*. Musíš mít *legitimní potřebu* danou informaci znát.

Vojenský princip — osoba prověřená na stupeň „přísně tajné" automaticky nečte *všechny* přísně tajné dokumenty.

V IT: celopodniková úložiště filtrovaná podle oddělení a projektu.

## Kompenzační opatření (compensating controls)

Pokud *ideální* opatření není proveditelné (technicky, nákladově nebo z hlediska provozu), zavedeme *náhradu* poskytující *podobnou* ochranu.

Příklady:

- Nelze záplatovat zastaralý systém → umístíme jej za WAF.
- Nelze zakázat opětovné použití hesel → vynutíme MFA.
- Nelze šifrovat data v klidu → fyzické zabezpečení objektu a řízení přístupu.

Norma PCI DSS kompenzační opatření *výslovně* připouští, pokud jsou zdokumentována.

## Kompromisy (tradeoffs)

Zavedení opatření má svou *cenu*:

- **Peníze** — licence, hardware, personál.
- **Čas** — pomalejší pracovní postup.
- **Použitelnost** — překážky pro uživatele.
- **Produktivita** — falešné poplachy (false positives) přerušují práci.

Vyvážený návrh: cena(opatření) < snížení rizika(opatření).

Pokud opatření stojí 1 M $, ale sníží riziko o očekávanou ztrátu 50 tis. $ → nevyplatí se.

Pokud opatření stojí 50 tis. $ a sníží riziko o 1 M $ → jednoznačná výhra.

Analýza rizik ([[risk-analyza]]) toto kvantifikuje.

---

*Zdroj: BIS přednášky 2025/26, Ing. Kamil Malinka, Ph.D., FIT VUT v Brně. Externí reference: Harris, S., Maymí, F.: „CISSP All-in-One Exam Guide" (8th ed., McGraw-Hill 2018), §2; NIST SP 800-53 Rev 5 — Security and Privacy Controls ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf)); ISO/IEC 27002:2022 — Information Security Controls; Whitman, M.E., Mattord, H.J.: „Management of Information Security" (5th ed., Cengage 2017).*
