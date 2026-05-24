---
title: GDPR, NIS2 a NÚKIB
---

# GDPR, NIS2 a NÚKIB — regulatory landscape

Bezpečnost IS *není* jen technický + manažerský problém. Je to také **regulatorní** povinnost. Tato sekce popisuje hlavní evropská a česká regulace.

## GDPR — General Data Protection Regulation

EU Regulation 2016/679. V účinnosti od **25. května 2018**. Reguluje zpracování *osobních údajů*.

### Aplikovatelnost

Vztahuje se na *libovolnou* organizaci, která:

- Zpracovává údaje *EU rezidentů*.
- Bez ohledu na *kde* organizace sídlí.

Příklady: US company selling to EU customers → GDPR applies.

### Klíčové principy (čl. 5)

1. **Lawfulness, fairness, transparency**.
2. **Purpose limitation** — data collected for specified purpose; not repurposed.
3. **Data minimization** — collect only necessary.
4. **Accuracy** — keep up to date.
5. **Storage limitation** — retain only as long as needed.
6. **Integrity + confidentiality** — security controls.
7. **Accountability** — controller demonstrates compliance.

### Right of data subjects (čl. 12-23)

Data subjects (people) have rights:

- **Right of access** — get copy of their data.
- **Right to rectification** — correct inaccuracies.
- **Right to erasure** ("right to be forgotten") — delete.
- **Right to restrict processing**.
- **Right to data portability** — get machine-readable copy.
- **Right to object** — to direct marketing, profiling.
- **Right not to be subject** to automated decisions including profiling.

### Lawful basis (čl. 6)

Processing requires *one* of 6 lawful bases:

1. **Consent** — explicit, granular, withdrawable.
2. **Contract** — necessary to fulfill contract.
3. **Legal obligation** — required by law.
4. **Vital interests** — life-threatening.
5. **Public task** — official authority.
6. **Legitimate interests** — balancing test required.

Most companies: combination.

### Special category data (čl. 9)

Higher protection for:

- Race / ethnicity.
- Political opinions.
- Religious / philosophical beliefs.
- Trade union membership.
- Genetic / biometric / health data.
- Sex life / orientation.

Requires explicit consent or specific legal basis.

### Data Protection Impact Assessment (DPIA)

Required for *high-risk* processing:

- Systematic monitoring (CCTV, web tracking).
- Large-scale special category data.
- Public area surveillance.

DPIA documents risks + mitigations *before* processing starts.

### Data Protection Officer (DPO)

Required for:

- Public authorities.
- Large-scale monitoring.
- Large-scale special category processing.

DPO is *independent* — reports to highest management. Contact info public.

### Breach notification

**72 hours** to notify supervisory authority of personal data breach.

If high risk to individuals → notify *individuals* too.

Famous example: British Airways 2018 breach. £20M fine (originally £183M, reduced due to COVID).

### Penalties

Tiered:

- Up to €10M or 2% global annual turnover (technical violations).
- Up to €20M or 4% global annual turnover (principle violations).

Whichever higher.

Major fines:

- Amazon — €746M (2021).
- WhatsApp — €225M (2021).
- Google — €90M (France, 2022).
- Meta — €1.2B (2023).

::: viz gdpr-rights-flow "Vyber typ žádosti (access / rectify / erase / portability / object); step skrz fáze. Vidíš legal grounds, akce, timeline 30+60 dní, grounds for refusal."
:::

### Cross-border transfers

Data leaving EU requires safeguard:

- **Adequacy decision** — EU recognizes destination's protection (US Privacy Framework, UK, Japan, others).
- **Standard Contractual Clauses (SCC)** — vendor contract.
- **Binding Corporate Rules (BCR)** — for intra-group.
- **Code of Conduct, Certification**.

US transfers complicated — Privacy Shield invalidated by Schrems II (2020). New Data Privacy Framework (2023).

## NIS2 — Network and Information Security Directive

EU Directive 2022/2555. Transposition deadline **October 2024**. Replaces NIS (2016).

### Scope

Applies to *essential* and *important* entities:

**Essential** (Annex I):

- Energy.
- Transport.
- Banking.
- Financial market infrastructure.
- Health.
- Drinking water.
- Wastewater.
- Digital infrastructure.
- ICT service management.
- Public administration.
- Space.

**Important** (Annex II):

- Postal services.
- Waste management.
- Manufacture of chemicals.
- Food production.
- Manufacturing — medical devices, machinery, vehicles.
- Digital providers — online marketplaces, search engines, social networks.
- Research.

Threshold: medium + large enterprises (>50 employees / >€10M turnover).

### Requirements

- **Risk management measures**.
- **Incident reporting** — early warning 24h, notification 72h, final report 1 month.
- **Cybersecurity policies**.
- **Multi-factor authentication, encryption**.
- **Supply chain security**.
- **Vulnerability disclosure**.

### Sanctions

Up to €10M or 2% annual turnover (essential entities).

Up to €7M or 1.4% (important).

Management *personally liable* for violations.

## NÚKIB — Národní úřad pro kybernetickou a informační bezpečnost

Czech national cybersecurity authority. Established 2017 (split from NBÚ).

### Mandate

- **National cybersecurity strategy**.
- **CSIRT** — Computer Security Incident Response Team.
- **Certification** — IS security products + services.
- **Education** — public awareness.
- **Cooperation** — with EU (ENISA), NATO, other states.

### Czech Cybersecurity Act

**Zákon č. 181/2014 Sb.** o kybernetické bezpečnosti.

Implements NIS Directive (and now NIS2). Defines:

- **Critical infrastructure** — energy, banking, healthcare.
- **Important information systems** — government, finance.
- **Notifying obligation** — incidents to NÚKIB.
- **Security measures** — mandatory controls.

Sanctions: up to 5M CZK ($230k).

### Czech regulations

- **GDPR** transposed via **Zákon č. 110/2019 Sb.** o zpracování osobních údajů.
- **Czech ÚOOÚ** (Úřad pro ochranu osobních údajů) supervises GDPR compliance.
- **NIS2** transposition in progress.

## ENISA

European Union Agency for Cybersecurity. Provides:

- Threat intelligence.
- Best practices guides.
- Capacity building.
- Certification schemes coordination.

## Other major regulations

### US

- **HIPAA** — healthcare data.
- **SOX** — financial controls.
- **GLBA** — financial privacy.
- **CCPA / CPRA** — California consumer privacy.
- **State breach notification laws** — all 50 states.
- **CISA reporting** — federal incident reporting.

### Sectoral

- **PCI DSS** — payment cards (industry, not law but contractually required).
- **CIP (NERC)** — energy grid.
- **CMMC** — DoD contractors.

### Privacy laws globally

- **LGPD** — Brazil.
- **PIPEDA** — Canada.
- **APPI** — Japan.
- **PDPA** — Singapore.
- **POPIA** — South Africa.

## Compliance vs Security

Important distinction:

- **Compliance** — meeting *regulatory* checkboxes.
- **Security** — actually being *secure*.

These overlap but *not equal*:

- Compliant but insecure: meeting minimum requirements while real threats unmitigated.
- Secure but non-compliant: strong security but documentation incomplete.

Goal: *both*. Compliance forces *baseline*. Security drives beyond.

## DPO + CISO

Different roles:

- **DPO** (Data Protection Officer) — privacy, GDPR. Reports independently.
- **CISO** (Chief Information Security Officer) — security. Reports to CEO / CIO.

Many companies have both. Coordination via Privacy/Security committee.

## Compliance technology

- **GRC platforms** — Archer, ServiceNow GRC, OneTrust.
- **Privacy management** — OneTrust, TrustArc, BigID.
- **Audit logging** — SIEM ([[siem-monitoring]]).
- **Data discovery** — find PII across systems.

## Future trends

- **AI Act** (EU 2024) — regulation of AI systems. High-risk AI (biometric ID, hiring) heavily regulated.
- **Cyber Resilience Act** (EU) — connected products security.
- **Digital Services Act** (DSA), Digital Markets Act (DMA) — Big Tech.
- **NIS3** — likely next iteration.
- **Quantum-safe migration** — regulatory pressure.

Compliance landscape continually evolves. Continuous monitoring required.

## Bezpečnost jako systém

Bezpečnost je *systém* — žádný jediný control sufficient. Vrstvená obrana, continuous improvement, accept residual risk.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., Ing. Kamil Malinka, Ph.D., FIT VUT v Brně. Externí reference: EU Regulation 2016/679 (GDPR) ([eur-lex.europa.eu](https://eur-lex.europa.eu/eli/reg/2016/679/oj)); EU Directive 2022/2555 (NIS2) ([eur-lex.europa.eu](https://eur-lex.europa.eu/eli/dir/2022/2555/oj)); Zákon č. 181/2014 Sb. o kybernetické bezpečnosti; [NÚKIB](https://www.nukib.cz/); [ENISA](https://www.enisa.europa.eu/); [ÚOOÚ](https://www.uoou.gov.cz/).*
