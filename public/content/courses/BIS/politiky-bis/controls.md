---
title: Bezpečnostní opatření (controls)
---

# Bezpečnostní opatření (controls) — taxonomie

Bezpečnostní *opatření* (controls) jsou *mechanismy*, které redukují *riziko* — buď snížením *pravděpodobnosti* incidentu nebo *dopadu*. Tato sekce klasifikuje controls podle druhu (administrative / technical / physical) a funkce (preventive / detective / corrective / ...).

## Tři druhy controls

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

### Administrative ("soft controls")

Management-oriented. Souvisí s *politikou*, *procesy*, *lidmi*.

- **Security policy** — formal document.
- **Standards & procedures** — *jak* implementovat policy.
- **Training & awareness** — uživatelé znají bezpečnost.
- **Personnel screening** — background checks at hire.
- **Separation of duties** — žádný jednotlivec nemá *vše*.
- **Job rotation** — detekuje fraud.
- **Mandatory vacation** — detekuje long-running fraud.
- **Code of conduct** — etical guidelines.

### Technical (logical / "login") controls

Software + hardware components. Implementují policy *technicky*.

- **Firewalls** ([[firewall]]).
- **IDS / IPS** ([[ids-ips]]).
- **Encryption** ([[symetrika-v-is]]).
- **Identification + authentication** — passwords, MFA, biometrics.
- **Access control** ([[dac-mac]]).
- **Antivirus / EDR** (Endpoint Detection & Response).
- **VPN / IPsec** ([[vpn-ipsec]]).
- **DLP** (Data Loss Prevention).

### Physical controls

Fyzické bariéry.

- **Locks** — dveře, racks, drawers.
- **Fences & barriers** — perimeter.
- **Security guards** — lidský dohled.
- **Surveillance** — CCTV, motion sensors.
- **Mantraps** — dvojité dveře.
- **HVAC + fire suppression** — environmental.
- **EM shielding** — Faraday cage proti TEMPEST.

## Šest funkcí controls

Každý control má jednu nebo více *funkcí*:

| Funkce | Co dělá | Příklad |
| :--- | :--- | :--- |
| **Preventive** | předchází | locks, firewall, encryption |
| **Detective** | detekuje | IDS, audit log, CCTV |
| **Corrective** | opravuje | server image restore, IR plan |
| **Deterrent** | odrazuje | fences, warning signs, audit policy |
| **Recovery** | obnovuje | backup, disaster recovery |
| **Compensating** | nahrazuje | proxy místo firewallu |

Defense in depth = *všechny* funkce, *vrstvené*.

## Mapování control → funkce → druh

| Control | Type | Function |
| :--- | :--- | :--- |
| Door lock | Physical | Preventive + Deterrent |
| Firewall | Technical | Preventive |
| IDS | Technical | Detective |
| Audit logs | Admin (policy) + Technical (impl) | Detective + Corrective |
| Backup | Technical | Recovery |
| Security policy doc | Admin | Preventive (sets expectations) |
| Security training | Admin | Preventive (reduces user errors) |
| CCTV camera | Physical | Detective + Deterrent |
| BCP plan | Admin | Recovery |

## Defense in Depth (layered defense)

Princip: *více vrstev* ochrany — útočník musí překonat *všechny*.

| Vrstva | Příklad controls |
| :--- | :--- |
| Perimeter | firewall, DDoS protection, fence |
| Network | segmentation, VLAN, internal FW |
| Endpoint | EDR, antivirus, OS hardening |
| Application | secure coding, WAF, input validation |
| Data | encryption at rest + in transit, DLP |
| Identity | MFA, RBAC, least privilege |
| Audit | logging, SIEM, SOC monitoring |

Žádná jediná vrstva *není* dostatečná. Každá vrstva *delays* nebo *detect* attacker.

## Princip nejmenšího oprávnění (Least Privilege)

Subjekt má *minimum* oprávnění, *jen* co potřebuje pro práci. Žádné nadbytečné práva.

Příklady:

- User accounts (ne admin) pro denní práci.
- Service accounts only do *konkrétních* věcí.
- Database connections s read-only user pro reporting tools.
- Network rules — explicit allow, deny rest.

Detail v [[rbac-abac]].

## Separation of Duties

*Žádný* jednotlivec *nemá* veškerou autoritu pro citlivou operaci.

Klasický příklad: financial transactions.

- Person A: initiates payment.
- Person B: approves payment.

Pokud A *malicious*, A nemůže provést sám. Potřebuje spolupráci B → much harder.

V IT:

- Developer ≠ Sysadmin.
- Developer ≠ Auditor.
- Auditor ≠ Operations.

## Need to Know

Subjekt má přístup k *information*, jen pokud *potřebuje* pro work.

Nestačí mít clearance pro *level*. Musíš mít *legitimate need*.

Vojenský princip — top-secret cleared person doesn't automatically read *all* top-secret docs.

V IT: enterprise-wide repositories filtered by department, project.

## Kompenzační controls

Pokud *ideální* control není feasible (technical / cost / business), zavedeme *náhradu* poskytující *podobnou* ochranu.

Příklady:

- Cannot patch legacy system → put behind WAF.
- Cannot disable password reuse → enforce MFA.
- Cannot encrypt at rest → physical security of facility + access control.

PCI DSS *explicitly* allows compensating controls s documentation.

## Tradeoffs

Implementing controls má *cost*:

- **Money** — license, hardware, staff.
- **Time** — slower workflow.
- **Usability** — friction for users.
- **Productivity** — false positives interrupt.

Vyvážený design: cost(control) < risk reduction(control).

Pokud control costs $1M ale reduces risk by $50k expected loss → not worth it.

Pokud control costs $50k a reduces risk by $1M → obvious win.

Risk analysis ([[risk-analyza]]) kvantifikuje.

---

*Zdroj: BIS přednášky 2025/26, Ing. Kamil Malinka, Ph.D., FIT VUT v Brně. Externí reference: Harris, S., Maymí, F.: „CISSP All-in-One Exam Guide" (8th ed., McGraw-Hill 2018), §2; NIST SP 800-53 Rev 5 — Security and Privacy Controls ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf)); ISO/IEC 27002:2022 — Information Security Controls; Whitman, M.E., Mattord, H.J.: „Management of Information Security" (5th ed., Cengage 2017).*
