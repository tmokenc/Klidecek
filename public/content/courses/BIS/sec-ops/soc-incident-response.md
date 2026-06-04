---
title: SOC a incident response
---

# SOC a Incident Response

**SOC** (Security Operations Center) je *organizační* + *technická* jednotka, která 24/7 monitoruje bezpečnostní stav. **Incident Response (IR)** je *proces* reagování na incidenty od detekce po obnovu.

## SOC — Security Operations Center

### Funkce

- **Monitoring** — real-time analyzes alerts ([[siem-monitoring]], [[ids-ips]]).
- **Triage** — categorize incidents.
- **Response** — escalate, mitigate.
- **Threat hunting** — proactive search for compromises.
- **Forensics** — post-incident analysis.
- **Reporting** — metrics, executive briefings.

### Levels of analysts

**Tier 1 — Triage**: filter alerts, escalate suspicious.

- Skills: log analysis, ticket management.
- Salary: $40-70k US.

**Tier 2 — Investigation**: deeper analysis, malware analysis, correlation.

- Skills: threat hunting, scripting, IR procedures.
- Salary: $70-120k.

**Tier 3 — Hunting + Response**: lead complex investigations, threat intel.

- Skills: reverse engineering, advanced forensics.
- Salary: $120-200k+.

**SOC Manager**: process, metrics, coordination with other teams.

### Tools

- **SIEM** ([[siem-monitoring]]) — Splunk, QRadar, Sentinel, Elastic.
- **SOAR** — Security Orchestration, Automation, Response. Playbook automation.
- **EDR/XDR** — CrowdStrike, SentinelOne, Microsoft Defender.
- **Threat Intel platforms** — MISP, ThreatConnect.
- **Network monitoring** — Zeek, Suricata.

### Models

- **In-house SOC** — fully staffed, owned.
- **MSSP** (Managed Security Service Provider) — outsourced.
- **Hybrid** — internal + MSSP for off-hours.
- **MDR** (Managed Detection and Response) — vendor watches your tools.

Choice depends on size, regulatory needs, budget.

## Incident Response framework

NIST SP 800-61 — most cited framework.

### IR phases

::: svg "NIST IR — 4 phases"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5">
    <circle cx="90" cy="90" r="60"/>
    <circle cx="230" cy="90" r="60"/>
    <circle cx="370" cy="90" r="60"/>
    <circle cx="490" cy="90" r="40"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="90" y="85">Prepare</text>
    <text x="230" y="78">Detect &</text>
    <text x="230" y="92">Analyze</text>
    <text x="370" y="78">Contain,</text>
    <text x="370" y="92">Eradicate,</text>
    <text x="370" y="106">Recover</text>
    <text x="490" y="85">Post-</text>
    <text x="490" y="99">incident</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="90" y="115">plan, train</text>
    <text x="230" y="120">SOC monitor</text>
    <text x="490" y="115">lessons</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1" fill="none">
    <path d="M150,90 L170,90" marker-end="url(#ir-ar)"/>
    <path d="M290,90 L310,90" marker-end="url(#ir-ar)"/>
    <path d="M430,90 L450,90" marker-end="url(#ir-ar)"/>
  </g>
  <text x="270" y="165" text-anchor="middle" fill="var(--text-faint)" font-size="9">Loop: lessons → improve preparation</text>
  <defs>
    <marker id="ir-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

#### 1. Preparation

Before incident:

- **IR plan** — documented procedures.
- **IR team** — defined roles, contact info.
- **Communication plans** — internal + external.
- **Tools ready** — forensics workstation, backup, network capture.
- **Training** — tabletop exercises, simulations.
- **Threat intelligence** — relevant feeds.

Most important phase. Unprepared org → chaos when incident hits.

#### 2. Detection + Analysis

- Alert from SIEM, IDS, user report, threat intel.
- **Triage** — is it really an incident?
- **Scoping** — what's affected?
- **Classification** — severity (low/med/high/critical).
- **Documentation** — start incident ticket.

#### 3. Containment, Eradication, Recovery

**Containment**:

- **Short-term** — isolate infected hosts. Network segmentation. Disable accounts.
- **Long-term** — patch vulnerable systems while investigation continues.

**Eradication**:

- Remove malware.
- Disable / change compromised accounts.
- Rebuild compromised systems (don't trust cleanup — rebuild).
- Address root cause.

**Recovery**:

- Restore systems from clean backup.
- Verify integrity.
- Monitor for re-infection.
- Restore normal operations.

#### 4. Post-Incident

- **Lessons learned** meeting.
- **Update** IR plan, playbooks, controls.
- **Report** to management, regulators.
- **Threat intel sharing** (ISAC, MISP).

## IR team — typical roles

- **IR Commander** — overall responsibility.
- **Lead Investigator** — technical lead.
- **Forensics analysts** — evidence handling.
- **Malware analysts** — reverse engineering.
- **Communications** — PR, customer comms.
- **Legal** — regulatory, law enforcement.
- **HR** — for insider threats.
- **IT operations** — restore systems.

## Playbooks

Pre-defined procedures for *common* incident types:

- **Malware infection** playbook.
- **Phishing** playbook.
- **Data breach** playbook.
- **DDoS** playbook.
- **Account compromise** playbook.

Each: trigger conditions, steps, escalation criteria.

Modern SOC automate playbooks via **SOAR** platforms (Phantom, Demisto, Tines, Swimlane).

## Severity levels

Typical taxonomy:

| Level | Description | Response |
| :--- | :--- | :--- |
| **Critical** | Active breach, large impact | Immediate all-hands, exec briefing |
| **High** | Suspected breach, moderate impact | IR team activated, hours |
| **Medium** | Suspicious activity | Investigate within day |
| **Low** | Minor anomaly | Investigate within week |

Customer-data breach typically **Critical**.

## Communication

### Internal

- Status updates every X hours.
- Bridge call for active incidents.
- Executive updates.

### External

- **Regulators** — GDPR 72h notification, US state breach laws.
- **Customers** — when notification required.
- **Law enforcement** — FBI, local police.
- **Press** — only via authorized spokesperson.

### Do NOT

- Communicate over compromised channels (assume attacker monitors corporate email).
- Speculate publicly before facts known.
- Promise specifics before complete investigation.

## Lessons learned

Within 1-2 weeks post-incident:

1. **Timeline** of events.
2. **Root cause analysis** (5 whys).
3. **Detection effectiveness** — when did we detect?
4. **Response effectiveness** — were procedures followed?
5. **Improvements** — controls, training, tools.

Output: action items with owners + deadlines. Track to closure.

## Metrics

SOC + IR metrics:

- **Mean Time to Detect (MTTD)** — alert → incident declared.
- **Mean Time to Respond (MTTR)** — incident declared → contained.
- **Mean Time to Recovery** — incident contained → operations normal.
- **False positive rate** — alerts that weren't incidents.
- **Detected via SOC vs. external** — ratio.
- **Incidents by category, severity**.

Modern target: MTTD < 1 hour, MTTR < 24 hours. Many orgs miss.

::: viz ir-timeline-metrics "Slidery posouvají timing fází (detection, contain, eradicate, recover). MTTD / MTTR / damage se přepočítají. Preset 'slow' = no IR; 'fast' = mature SOC."
:::

## Threat hunting

Proactive search for compromises *not* triggered by alerts.

### Hypothesis-driven

"Attackers using Living-off-the-Land techniques (PowerShell, certutil) for evasion. Search for unusual PowerShell + network connection patterns."

### IoC-based

Threat intel publishes IoCs → search environment for matches.

### TTPs

Search by MITRE ATT&CK technique. "How would we detect T1003 (Credential Dumping)?"

Tools: Sigma rules (SIEM-agnostic queries), Atomic Red Team (simulate attacks).

## Tabletop exercises

Simulated incidents — discussion only, no real systems. Test:

- IR plan completeness.
- Team coordination.
- Decision-making under pressure.
- Communication chains.

Examples:

- **Ransomware** scenario.
- **Insider data theft**.
- **DDoS attacking primary service**.
- **CEO email impersonation**.

Run quarterly for IR teams. Identify gaps.

## Major incident examples {tier=example}

- **Target 2013** — POS malware via HVAC vendor. 40M cards stolen.
- **Sony Pictures 2014** — North Korean attack, embarrassing email leak.
- **Equifax 2017** — Apache Struts vuln, 147M consumer records.
- **NotPetya 2017** — Maersk, Mondelez devastated. $10B+ damages globally.
- **SolarWinds 2020** — supply chain attack, 18 000 organizations affected.
- **Colonial Pipeline 2021** — ransomware, US East Coast fuel shortage.
- **Uber 2022** — social engineered MFA fatigue, full internal access.

Each: massive impact + lessons.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: NIST SP 800-61 Rev 2 — Computer Security Incident Handling Guide ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf)); SANS Incident Handler's Handbook; Bejtlich, R.: „The Practice of Network Security Monitoring" (No Starch 2013); [SANS Reading Room — IR](https://www.sans.org/white-papers/category/incident-response/); Verizon Data Breach Investigations Report (annual).*
