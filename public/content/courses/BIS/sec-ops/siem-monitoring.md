---
title: SIEM a monitoring
---

# SIEM a security monitoring

**SIEM** (Security Information and Event Management) je *centrální platforma* pro:

- **Collection** logs from all systems.
- **Normalization** to common format.
- **Correlation** events across sources.
- **Detection** of suspicious patterns.
- **Alerting** + dashboards.
- **Compliance** reporting.

SIEM je nervová soustava SOC ([[soc-incident-response]]).

## Architektura

::: svg "SIEM architecture"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="40" width="80" height="35" rx="3"/>
    <rect x="20" y="85" width="80" height="35" rx="3"/>
    <rect x="20" y="130" width="80" height="35" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="60" y="55">Firewall</text>
    <text x="60" y="68">logs</text>
    <text x="60" y="100">IDS/EDR</text>
    <text x="60" y="113">events</text>
    <text x="60" y="145">App / OS</text>
    <text x="60" y="158">logs</text>
  </g>
  <g fill="var(--accent)" opacity="0.15" stroke="var(--accent)">
    <rect x="170" y="30" width="200" height="140" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="270" y="55">SIEM Platform</text>
  </g>
  <g fill="var(--bg-card)" stroke="var(--line)">
    <rect x="180" y="65" width="80" height="20" rx="2"/>
    <rect x="180" y="90" width="80" height="20" rx="2"/>
    <rect x="180" y="115" width="80" height="20" rx="2"/>
    <rect x="180" y="140" width="80" height="20" rx="2"/>
    <rect x="280" y="65" width="80" height="20" rx="2"/>
    <rect x="280" y="90" width="80" height="20" rx="2"/>
    <rect x="280" y="115" width="80" height="20" rx="2"/>
    <rect x="280" y="140" width="80" height="20" rx="2"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="220" y="78">Collect</text>
    <text x="220" y="103">Normalize</text>
    <text x="220" y="128">Index</text>
    <text x="220" y="153">Retain</text>
    <text x="320" y="78">Correlate</text>
    <text x="320" y="103">Alert</text>
    <text x="320" y="128">Dashboard</text>
    <text x="320" y="153">Report</text>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="430" y="60" width="90" height="30" rx="3"/>
    <rect x="430" y="100" width="90" height="30" rx="3"/>
    <rect x="430" y="140" width="90" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="475" y="78">Analyst</text>
    <text x="475" y="118">Ticket</text>
    <text x="475" y="158">SOAR</text>
  </g>
  <g stroke="var(--accent)" stroke-width="0.8" fill="none">
    <line x1="100" y1="58" x2="170" y2="65"/>
    <line x1="100" y1="102" x2="170" y2="100"/>
    <line x1="100" y1="148" x2="170" y2="140"/>
    <line x1="370" y1="78" x2="430" y2="75"/>
    <line x1="370" y1="103" x2="430" y2="115"/>
    <line x1="370" y1="128" x2="430" y2="155"/>
  </g>
</svg>
:::

## Log sources

Comprehensive monitoring covers:

### Infrastructure

- **Firewalls** — connections, drops.
- **Routers / switches** — interfaces, traffic stats.
- **IDS / IPS** — security alerts.
- **DNS server** — queries.
- **Proxy** — HTTP/HTTPS requests.

### Endpoints

- **Operating system** — kernel events, security audit.
- **EDR** — process tree, command line.
- **Antivirus** — detection, quarantine.

### Application

- **Web server** — access logs, error logs.
- **Database** — query logs, login events.
- **Application logs** — custom security events.

### Identity

- **Active Directory** — auth, group changes.
- **VPN gateway** — connections.
- **IAM** — token issuance, permission grants.

### Cloud

- **AWS CloudTrail** — API calls.
- **Azure Activity Log**.
- **GCP Cloud Audit Logs**.

Each log type provides *different* visibility. Combination → complete picture.

## Log forwarding

### Syslog

Standard protocol. Push logs to SIEM via UDP 514 or TLS-encrypted.

### Filebeat / Fluentd / Vector

Agents read log files, forward to SIEM.

### Windows Event Forwarding

Native Windows. Forwards to collector.

### API integrations

Cloud services — SIEM pulls via API (AWS, Azure, Office 365).

## Normalization

Different sources, different formats:

```
# Firewall log:
Aug 18 12:34:56 fw01 deny tcp 192.168.1.5:54321 -> 8.8.8.8:53

# IIS log:
2024-08-18 12:34:56 192.168.1.5 GET /login.php - 80 - 8.8.8.8 Mozilla/5.0 401

# SSH log:
Aug 18 12:34:56 server sshd[1234]: Failed password for alice from 192.168.1.5 port 54321 ssh2
```

SIEM normalizes to **CEF** (Common Event Format) or **LEEF** or vendor-specific schema:

```json
{
  "timestamp": "2024-08-18T12:34:56Z",
  "src_ip": "192.168.1.5",
  "dst_ip": "8.8.8.8",
  "action": "denied",
  "service": "dns",
  "category": "network.firewall"
}
```

Now correlation possible across sources.

## Correlation

Connect events across sources:

```
1. Failed login (Active Directory log) — alice@corp.com
2. Account lockout (AD log) — alice@corp.com
3. Successful login (AD log) — alice@corp.com — from different IP
4. Network access (VPN log) — alice — from outside corp
5. File access (file server log) — alice — sensitive files

= Account takeover incident
```

Single events innocuous. Together: compromise.

::: viz siem-correlation-trace "Pusť event-by-event scénář brute force → success → file access. Correlation rule sleduje sliding window (60 s, ≥10 fails); alert vystřelí, jen když celý vzor sedí."
:::

Correlation rules:

```
RULE: brute force then success
  IF >= 10 failed logins for user X within 5 min
  AND successful login for user X within next 1 min
  AND login from different IP than previous successful
  THEN ALERT: Possible account takeover
```

## Detection rules

### Signature

```
RULE: known malware C2
  IF dst_ip IN known_c2_iplist
  THEN ALERT: C2 communication detected
```

### Anomaly

```
RULE: data exfiltration
  IF outbound bytes from host > 2 × historical avg
  AND destination outside corporate
  THEN ALERT: Possible exfiltration
```

### Behavior

```
RULE: privileged escalation
  IF user X normally has read-only access
  AND user X performed admin action (sudo, RDP to DC)
  THEN ALERT: Privilege escalation
```

## Major SIEM vendors

| Vendor | Notes |
| :--- | :--- |
| **Splunk** | Most popular, expensive |
| **IBM QRadar** | Enterprise, established |
| **Microsoft Sentinel** | Cloud-native, Azure |
| **Elastic Security** | Open-core, scales |
| **Sumo Logic** | Cloud-first |
| **LogRhythm** | Mid-market |
| **Wazuh** | Open-source, HIDS+SIEM |
| **Graylog** | Open-source |

Choice based on: budget, cloud vs on-prem, integration ecosystem, retention requirements.

## SOAR

**Security Orchestration, Automation, and Response**. Sits on top of SIEM.

### Capabilities

- **Playbook automation** — execute response steps.
- **API integration** — talk to firewalls, EDR, ticketing systems.
- **Case management** — track investigations.

### Example playbook

```
TRIGGER: Phishing email reported
1. Extract sender, URL, attachment hash.
2. Query threat intel for IoCs.
3. If malicious:
   a. Block sender domain in mail gateway.
   b. Search for other recipients.
   c. Quarantine inbox copies.
   d. Notify recipients.
4. Create ticket for analyst review.
```

Tools: Splunk Phantom, Palo Alto Cortex XSOAR, Tines, Swimlane.

## Log retention

Compliance + investigation needs:

| Standard | Retention |
| :--- | :--- |
| PCI DSS | 1 year (online), 3 mo immediate access |
| HIPAA | 6 years |
| SOX | 7 years |
| GDPR | minimum necessary, audit logs typically 6 mo+ |
| Most: | 90 days hot, 1-7 years cold |

Hot = fast access. Cold = slower, cheaper (S3, archive).

## Cost considerations

SIEM is *expensive*. Costs scale with:

- **Data volume** — Splunk licenses by GB/day.
- **Compute** — correlation rules CPU-intensive.
- **Storage** — long retention = lots of disk.

Strategies:

- **Log filtering** — drop noise at source.
- **Tiered storage** — hot/warm/cold.
- **Data reduction** — aggregate, sample non-security data.
- **Open-source** — Elastic, Wazuh have free tiers.

Modern: cloud SIEM (Sentinel, Sumo Logic) pay-as-you-grow.

## XDR — convergence

**Extended Detection and Response** unifies:

- EDR (endpoint).
- NDR (network).
- SIEM (logs).
- Cloud detection.

Single vendor. Single console. Pre-built integrations.

Tradeoff: vendor lock-in vs ease of use.

Vendors: Microsoft Defender XDR, CrowdStrike Falcon, Palo Alto Cortex, SentinelOne Singularity.

## Threat hunting v SIEM

Beyond rules, *interactive* analyst-driven search:

```sql
search index=auth EventCode=4625
| stats count by src_ip
| where count > 50
| join src_ip [search index=geoip]
```

(Splunk SPL example. Other SIEM use similar.)

Hunters look for *unusual* patterns based on hypotheses + IoCs.

## Metrics monitoring

Beyond security:

- **Service availability** — uptime monitoring (Pingdom, Datadog).
- **Performance** — APM (New Relic, Datadog, Dynatrace).
- **Capacity** — CPU, memory, disk trends.

SIEM may *also* include operational, but typically separate. **Observability platforms** (Datadog, Splunk Observability) unify.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Gartner Magic Quadrant for SIEM (annual); Splunk documentation ([docs.splunk.com](https://docs.splunk.com/)); Elastic Security Docs ([elastic.co/security](https://www.elastic.co/security)); Bejtlich, R.: „The Practice of Network Security Monitoring" (No Starch 2013); MITRE ATT&CK ([attack.mitre.org](https://attack.mitre.org/)); Sigma — generic signature format ([github.com/SigmaHQ](https://github.com/SigmaHQ/sigma)).*
