---
title: NIST Cybersecurity Framework + SP 800-53
---

# NIST CSF a SP 800-53

**NIST Cybersecurity Framework (CSF)** je *function-based* framework od National Institute of Standards and Technology (US Federal). Verze 1.0 (2014), 1.1 (2018), 2.0 (2024). Doplněn **NIST SP 800-53** (Security and Privacy Controls) — concrete control catalog.

CSF je *complement* k ISO 27001 ([[iso-27000]]). Nemá *certification* (na rozdíl od 27001), ale je *de facto* standard pro US federal + critical infrastructure.

## Pět funkcí CSF (Core)

::: svg "NIST CSF — 5 (later 6) functions"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
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
  <text x="270" y="165" text-anchor="middle" fill="var(--text-muted)" font-size="10">CSF 2.0 (2024) přidává Govern (cross-cutting)</text>
</svg>
:::

### Identify

Pochopit *co* organizace má a *co* nejdůležitějšího je třeba chránit.

Categories:

- **Asset Management** — inventory of HW/SW/data.
- **Business Environment** — mission, stakeholders.
- **Governance** — policy, risk strategy.
- **Risk Assessment** — vulnerabilities, threats.
- **Risk Management Strategy**.
- **Supply Chain Risk Management**.

### Protect

Implement controls reducing impact of cybersecurity event.

- **Identity Management + Access Control**.
- **Awareness + Training**.
- **Data Security** — encryption, integrity.
- **Information Protection Processes**.
- **Maintenance**.
- **Protective Technology** — firewalls, IDS, etc.

### Detect

Identify cybersecurity event *occurring*.

- **Anomalies + Events**.
- **Security Continuous Monitoring**.
- **Detection Processes**.

### Respond

Take action *po* detection.

- **Response Planning** — IR plan.
- **Communications** — internal + external stakeholders.
- **Analysis** — root cause.
- **Mitigation** — contain + eradicate.
- **Improvements** — lessons learned.

### Recover

Restore systems after incident.

- **Recovery Planning**.
- **Improvements**.
- **Communications**.

### CSF 2.0 — Govern (NEW)

Cross-cutting function — strategie + risk management + role + supply chain.

CSF 2.0 (Feb 2024) emphasizes governance as *foundational*. All other 5 functions *operate* under Govern.

## Implementation Tiers

CSF defines 4 tiers of *maturity*:

| Tier | Maturity |
| :--- | :--- |
| **1: Partial** | ad-hoc, reactive |
| **2: Risk Informed** | aware of risks, some processes |
| **3: Repeatable** | formal policy, consistent process |
| **4: Adaptive** | continuous improvement, machine-learning informed |

Organization assesses *current* tier and *target* tier per function. Gap analysis identifies investments.

## CSF Profiles

Profile = customized implementation for specific business context.

- **Current Profile** — what we have now.
- **Target Profile** — what we want.
- **Gap analysis** — bridges current → target.

Profiles for: small business, critical infrastructure, manufacturing, healthcare, etc.

## NIST SP 800-53 — Security Controls

NIST CSF says *what functions*. **SP 800-53** lists *concrete controls*.

Aktuální: **Rev 5** (2020), update 2022.

### Control families (20)

| Family | Code | Příklad |
| :--- | :---: | :--- |
| Access Control | AC | least privilege, MFA |
| Awareness + Training | AT | annual training |
| Audit + Accountability | AU | logging, log review |
| Assessment | CA | system assessment |
| Configuration Management | CM | baseline, change control |
| Contingency Planning | CP | DR plan |
| Identification + Authentication | IA | MFA, identity proofing |
| Incident Response | IR | IR plan, training |
| Maintenance | MA | maintenance controls |
| Media Protection | MP | encryption, sanitization |
| Physical + Environmental | PE | facility security |
| Planning | PL | security plan |
| Personnel Security | PS | screening |
| PII Processing + Transparency | PT | GDPR-aligned (Rev 5) |
| Risk Assessment | RA | risk assessment |
| System + Services Acquisition | SA | secure dev, supply chain |
| System + Communications Protection | SC | encryption, FW |
| System + Information Integrity | SI | malware protection |
| Supply Chain Risk Management | SR | supply chain (Rev 5) |
| Awareness Training | AT | security awareness |

Each family has multiple *controls* (e.g., AC-1, AC-2, ...).

### Control structure

Each control specifies:

- **Control description** — what to do.
- **Control enhancements** — optional extensions.
- **Control discussion** — guidance.
- **Related controls**.

### Control baselines

NIST defines *baselines* for impact levels:

- **Low impact** — minor effect on operations.
- **Moderate** — significant effect.
- **High** — severe effect.

Each baseline specifies *which* controls + *which* enhancements *must* be implemented. Federal agencies must meet *Moderate* baseline minimum (most systems).

## FedRAMP

**Federal Risk and Authorization Management Program** — uses NIST SP 800-53 controls for cloud services serving federal agencies.

Cloud services certify "FedRAMP Authorized" → federal agencies can use.

Levels: Low, Moderate, High (matching SP 800-53 baselines).

AWS GovCloud, Azure Government, Google Cloud — all FedRAMP authorized.

## NIST SP 800-171

For *non-federal* organizations handling **Controlled Unclassified Information (CUI)** for federal government (contractors).

Subset of 800-53 controls (~110 controls vs full 1000+).

DoD contractors required NIST 800-171 compliance via **CMMC** (Cybersecurity Maturity Model Certification).

## CIS Controls — alternative

**Center for Internet Security Controls** — 18 controls prioritized by *effectiveness*.

Older "SANS Top 20", now "CIS Controls v8" (2021):

1. Inventory + control of enterprise assets.
2. Inventory + control of software assets.
3. Data protection.
4. Secure configuration.
5. Account management.
6. Access control management.
7. Continuous vulnerability management.
8. Audit log management.
9. Email + browser protections.
10. Malware defenses.
11. Data recovery.
12. Network infrastructure management.
13. Network monitoring + defense.
14. Security awareness + skills training.
15. Service provider management.
16. Application software security.
17. Incident response management.
18. Penetration testing.

More *pragmatic* than NIST 800-53. Small orgs prefer CIS.

## Mapping mezi frameworks

ISO 27001 ↔ NIST CSF ↔ NIST SP 800-53 ↔ CIS Controls ↔ PCI DSS ↔ HIPAA — *všechny* propojené v krížových mapách.

Tools:

- NIST CSF Reference Tool.
- CIS Controls Companion Guide.
- SCF (Secure Controls Framework) — meta-framework mapping vše.

Pokud implementuješ control set X, *get free* compliance with Y, Z subject to mapping.

## Choosing framework

| Situation | Recommended framework |
| :--- | :--- |
| US federal / DoD contractor | NIST SP 800-53 / 800-171 |
| Critical infrastructure (US) | NIST CSF |
| Global enterprise | ISO 27001 |
| SMB / fast adoption | CIS Controls |
| Healthcare | HIPAA + NIST |
| Payment cards | PCI DSS |
| Cloud SaaS | SOC 2 + ISO 27001 |
| EU privacy | GDPR + ISO 27001 + 27018 |

Often *combined* — ISO 27001 + CIS Controls + GDPR.

---

*Zdroj: BIS přednášky 2025/26, Ing. Kamil Malinka, Ph.D., FIT VUT v Brně. Externí reference: NIST CSF 2.0 (2024) ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf)); NIST SP 800-53 Rev 5 — Security and Privacy Controls; [CIS Controls v8](https://www.cisecurity.org/controls/v8); NIST SP 800-171 Rev 3 — Protecting CUI; [FedRAMP](https://www.fedramp.gov/).*
