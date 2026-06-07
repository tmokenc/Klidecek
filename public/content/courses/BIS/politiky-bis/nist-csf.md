---
title: NIST Cybersecurity Framework + SP 800-53
---

# NIST CSF a SP 800-53

**NIST Cybersecurity Framework (CSF)** je framework (rámec) postavený na *funkcích* od organizace National Institute of Standards and Technology (americký federální úřad). Verze 1.0 vyšla v roce 2014, verze 1.1 v roce 2018 a verze 2.0 v roce 2024. Doplňuje jej **NIST SP 800-53** (Security and Privacy Controls), což je konkrétní katalog opatření (controls).

CSF je doplňkem (complement) k normě ISO 27001 ([[iso-27000]]). Na rozdíl od ISO 27001 nenabízí certifikaci (certification), ale je de facto standardem pro americkou federální správu a kritickou infrastrukturu.

## Pět funkcí CSF (jádro)

::: svg "NIST CSF — 5 (later 6) functions"
<svg viewBox="0 0 560 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5">
    <circle cx="100" cy="90" r="50"/>
    <circle cx="200" cy="90" r="50"/>
    <circle cx="300" cy="90" r="50"/>
    <circle cx="400" cy="90" r="50"/>
    <circle cx="500" cy="90" r="50"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="100" y="85">Identify</text>
    <text x="200" y="85">Protect</text>
    <text x="300" y="85">Detect</text>
    <text x="400" y="85">Respond</text>
    <text x="500" y="85">Recover</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="100" y="100">assets, risks</text>
    <text x="200" y="100">controls</text>
    <text x="300" y="100">monitor</text>
    <text x="400" y="100">incident</text>
    <text x="500" y="100">restore</text>
  </g>
  <text x="280" y="165" text-anchor="middle" fill="var(--text-muted)" font-size="10">CSF 2.0 (2024) přidává Govern (cross-cutting)</text>
</svg>
:::

### Identify (Identifikuj)

Cílem je pochopit, *co* organizace má a *co* nejdůležitějšího je potřeba chránit.

Kategorie:

- **Asset Management (správa aktiv)** — inventář (inventory) hardwaru, softwaru a dat.
- **Business Environment (obchodní prostředí)** — poslání organizace a zainteresované strany (stakeholders).
- **Governance (řízení)** — politika a strategie řízení rizik.
- **Risk Assessment (hodnocení rizik)** — zranitelnosti (vulnerabilities) a hrozby (threats).
- **Risk Management Strategy (strategie řízení rizik)**.
- **Supply Chain Risk Management (řízení rizik dodavatelského řetězce)**.

### Protect (Chraň)

Zaveď opatření (controls), která snižují dopad bezpečnostní události.

- **Identity Management + Access Control (správa identit a řízení přístupu)**. Řízení přístupu (access control) určuje, kdo a k čemu smí přistupovat.
- **Awareness + Training (osvěta a školení)**.
- **Data Security (zabezpečení dat)** — šifrování (encryption) a integrita dat.
- **Information Protection Processes (procesy ochrany informací)**.
- **Maintenance (údržba)**.
- **Protective Technology (ochranné technologie)** — firewally, systémy detekce průniku (IDS) a podobně.

### Detect (Detekuj)

Cílem je rozpoznat bezpečnostní událost, která *právě probíhá*.

- **Anomalies + Events (anomálie a události)**.
- **Security Continuous Monitoring (průběžné bezpečnostní monitorování)**.
- **Detection Processes (detekční procesy)**.

### Respond (Reaguj)

Jde o akce, které následují *po* detekci.

- **Response Planning (plánování reakce)** — plán reakce na incidenty (IR plan).
- **Communications (komunikace)** — s interními i externími zainteresovanými stranami.
- **Analysis (analýza)** — zjištění hlavní příčiny (root cause).
- **Mitigation (zmírnění)** — zadržení (contain) a odstranění (eradicate) hrozby.
- **Improvements (zlepšení)** — poučení z incidentu (lessons learned).

### Recover (Obnov)

Cílem je obnovit systémy po incidentu.

- **Recovery Planning (plánování obnovy)**.
- **Improvements (zlepšení)**.
- **Communications (komunikace)**.

### CSF 2.0 — Govern (nová funkce)

Jde o průřezovou (cross-cutting) funkci — zahrnuje strategii, řízení rizik (risk management), role a dodavatelský řetězec.

CSF 2.0 (únor 2024) klade na řízení (governance) důraz jako na *základní kámen*. Všech ostatních 5 funkcí *pracuje* pod funkcí Govern.

## Implementační úrovně (Implementation Tiers)

CSF definuje 4 úrovně *zralosti* (maturity):

| Úroveň | Zralost |
| :--- | :--- |
| **1: Partial (částečná)** | nahodilá (ad hoc), reaktivní |
| **2: Risk Informed (vědomá rizik)** | povědomí o rizicích, některé procesy |
| **3: Repeatable (opakovatelná)** | formální politika, konzistentní proces |
| **4: Adaptive (adaptivní)** | průběžné zlepšování, podpořené strojovým učením |

Organizace posoudí svou *současnou* úroveň a *cílovou* úroveň pro každou funkci. Analýza mezer (gap analysis) pak ukáže, kam je třeba investovat.

## Profily CSF (CSF Profiles)

Profil je implementace přizpůsobená konkrétnímu obchodnímu kontextu.

- **Current Profile (současný profil)** — co máme nyní.
- **Target Profile (cílový profil)** — kam se chceme dostat.
- **Gap analysis (analýza mezer)** — překlenuje cestu od současného k cílovému stavu.

Profily existují například pro: malé firmy, kritickou infrastrukturu, výrobu, zdravotnictví a další.

## NIST SP 800-53 — bezpečnostní opatření

NIST CSF říká, *které funkce* je třeba pokrýt. **SP 800-53** vyjmenovává *konkrétní opatření* (controls).

Aktuální verze: **Rev 5** (2020), aktualizace z roku 2022.

### Rodiny opatření (20)

| Rodina | Kód | Příklad |
| :--- | :---: | :--- |
| Access Control (řízení přístupu) | AC | princip nejmenších oprávnění (least privilege), MFA |
| Awareness + Training (osvěta a školení) | AT | každoroční školení |
| Audit + Accountability (audit a odpovědnost) | AU | logování, revize logů |
| Assessment (hodnocení) | CA | hodnocení systému |
| Configuration Management (správa konfigurace) | CM | výchozí konfigurace (baseline), řízení změn |
| Contingency Planning (plánování kontinuity) | CP | plán obnovy po havárii (DR plan) |
| Identification + Authentication (identifikace a autentizace) | IA | MFA, ověřování identity |
| Incident Response (reakce na incidenty) | IR | plán reakce na incidenty, školení |
| Maintenance (údržba) | MA | opatření pro údržbu |
| Media Protection (ochrana médií) | MP | šifrování, bezpečné mazání (sanitization) |
| Physical + Environmental (fyzická a fyzikální bezpečnost) | PE | zabezpečení prostor |
| Planning (plánování) | PL | bezpečnostní plán |
| Personnel Security (personální bezpečnost) | PS | prověřování osob (screening) |
| PII Processing + Transparency (zpracování osobních údajů a transparentnost) | PT | v souladu s GDPR (Rev 5) |
| Risk Assessment (hodnocení rizik) | RA | hodnocení rizik |
| System + Services Acquisition (pořizování systémů a služeb) | SA | bezpečný vývoj, dodavatelský řetězec |
| System + Communications Protection (ochrana systémů a komunikace) | SC | šifrování, firewall |
| System + Information Integrity (integrita systémů a informací) | SI | ochrana před malwarem |
| Supply Chain Risk Management (řízení rizik dodavatelského řetězce) | SR | dodavatelský řetězec (Rev 5) |
| Program Management (řízení programu) | PM | celoprogramová opatření (plán bezpečnostního programu, strategie řízení rizik) |

Každá rodina obsahuje více *opatření* (např. AC-1, AC-2, …).

### Struktura opatření

Každé opatření popisuje:

- **Control description (popis opatření)** — co je třeba udělat.
- **Control enhancements (rozšíření opatření)** — volitelná rozšíření.
- **Control discussion (výklad opatření)** — návodné pokyny.
- **Related controls (související opatření)**.

### Výchozí sady opatření (Control baselines)

NIST definuje *výchozí sady* (baselines) podle úrovní dopadu:

- **Low impact (nízký dopad)** — drobný vliv na provoz.
- **Moderate (střední)** — významný vliv.
- **High (vysoký)** — závažný vliv.

Každá výchozí sada určuje, *která* opatření a *která* rozšíření *musí* být zavedena. Federální úřady musí splnit minimálně výchozí sadu *Moderate* (u většiny systémů).

## FedRAMP

**Federal Risk and Authorization Management Program** — využívá opatření z NIST SP 800-53 pro cloudové služby, které slouží federálním úřadům.

Cloudová služba získá certifikaci „FedRAMP Authorized", a federální úřady ji pak mohou používat.

Úrovně: Low, Moderate, High (odpovídají výchozím sadám SP 800-53).

Služby AWS GovCloud, Azure Government i Google Cloud — všechny mají autorizaci FedRAMP.

## NIST SP 800-171

Určeno pro *nefederální* organizace (dodavatele), které pro federální správu nakládají s **kontrolovanými neutajovanými informacemi (Controlled Unclassified Information, CUI)**.

Jde o podmnožinu opatření z 800-53 (zhruba 110 opatření oproti více než 1000 v plné verzi).

Dodavatelé Ministerstva obrany (DoD) musejí splňovat soulad s NIST 800-171 prostřednictvím **CMMC** (Cybersecurity Maturity Model Certification).

## CIS Controls — alternativa

**Center for Internet Security Controls** — 18 opatření seřazených podle *účinnosti*.

Dříve známé jako „SANS Top 20", nyní „CIS Controls v8" (2021):

1. Inventarizace a řízení podnikových aktiv.
2. Inventarizace a řízení softwarových aktiv.
3. Ochrana dat.
4. Bezpečná konfigurace.
5. Správa účtů.
6. Správa řízení přístupu.
7. Průběžná správa zranitelností.
8. Správa auditních logů.
9. Ochrana e-mailu a prohlížeče.
10. Obrana proti malwaru.
11. Obnova dat.
12. Správa síťové infrastruktury.
13. Síťové monitorování a obrana.
14. Osvěta a rozvoj bezpečnostních dovedností.
15. Správa poskytovatelů služeb.
16. Bezpečnost aplikačního softwaru.
17. Správa reakce na incidenty.
18. Penetrační testování.

CIS jsou *pragmatičtější* než NIST 800-53. Menší organizace dávají přednost právě CIS.

## Mapování mezi frameworky

ISO 27001 ↔ NIST CSF ↔ NIST SP 800-53 ↔ CIS Controls ↔ PCI DSS ↔ HIPAA — *všechny* jsou propojené v křížových mapách.

Nástroje:

- NIST CSF Reference Tool.
- CIS Controls Companion Guide.
- SCF (Secure Controls Framework) — meta-framework, který mapuje vše dohromady.

Pokud zavedeš sadu opatření X, *zdarma* tím získáš i soulad se sadami Y a Z — podle příslušného mapování.

## Volba frameworku

| Situace | Doporučený framework |
| :--- | :--- |
| Americká federální správa / dodavatel DoD | NIST SP 800-53 / 800-171 |
| Kritická infrastruktura (USA) | NIST CSF |
| Globální podnik | ISO 27001 |
| Malá a střední firma / rychlé zavedení | CIS Controls |
| Zdravotnictví | HIPAA + NIST |
| Platební karty | PCI DSS |
| Cloudové SaaS | SOC 2 + ISO 27001 |
| Ochrana soukromí v EU | GDPR + ISO 27001 + 27018 |

Často se *kombinují* — například ISO 27001 + CIS Controls + GDPR.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=Ula3TG8QS7g" "Building a Cybersecurity Framework" "IBM Technology"
:::

*Zdroj: BIS přednášky 2025/26, Ing. Kamil Malinka, Ph.D., FIT VUT v Brně. Externí reference: NIST CSF 2.0 (2024) ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf)); NIST SP 800-53 Rev 5 — Security and Privacy Controls; [CIS Controls v8](https://www.cisecurity.org/controls/v8); NIST SP 800-171 Rev 3 — Protecting CUI; [FedRAMP](https://www.fedramp.gov/).*
