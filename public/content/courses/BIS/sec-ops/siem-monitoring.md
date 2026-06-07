---
title: SIEM a monitoring
---

# SIEM a bezpečnostní monitoring

**SIEM** (Security Information and Event Management) je *centrální platforma*, která zajišťuje:

- **Sběr (collection)** logů ze všech systémů.
- **Normalizaci (normalization)** do společného formátu.
- **Korelaci (correlation)** událostí napříč zdroji.
- **Detekci (detection)** podezřelých vzorů (pattern).
- **Upozornění (alerting)** a přehledové panely (dashboards).
- **Reporting pro účely shody (compliance)** s předpisy.

SIEM je nervovou soustavou SOC ([[soc-incident-response]]).

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

## Zdroje logů

Komplexní monitoring pokrývá:

### Infrastruktura

- **Firewally** — spojení a zahozené pakety.
- **Routery / switche** — rozhraní a statistiky provozu.
- **IDS / IPS** — bezpečnostní upozornění.
- **DNS server** — dotazy.
- **Proxy** — požadavky (request) HTTP/HTTPS.

### Koncové stanice (endpoints)

- **Operační systém** — události jádra a bezpečnostní audit.
- **EDR** — strom procesů a příkazové řádky.
- **Antivirus** — detekce a karanténa.

### Aplikace

- **Webový server** — přístupové logy (access logs) a chybové logy (error logs).
- **Databáze** — logy dotazů a přihlašovacích událostí.
- **Aplikační logy** — vlastní bezpečnostní události.

### Identita

- **Active Directory** — autentizace (authentication) a změny skupin.
- **VPN brána** — spojení.
- **IAM** — vydávání tokenů a udělování oprávnění.

### Cloud

- **AWS CloudTrail** — volání API.
- **Azure Activity Log**.
- **GCP Cloud Audit Logs**.

Každý typ logu poskytuje *jiný* pohled. Jejich kombinace dává úplný obraz situace.

## Přeposílání logů (log forwarding)

### Syslog

Standardní protokol. Logy odesílá (push) do SIEM přes UDP 514 nebo šifrovaně přes TLS.

### Filebeat / Fluentd / Vector

Agenti čtou logovací soubory a přeposílají je do SIEM.

### Windows Event Forwarding

Nativní mechanismus Windows. Přeposílá události do sběrače (collector).

### Integrace přes API

U cloudových služeb si SIEM data sám stahuje (pull) přes API (AWS, Azure, Office 365).

## Normalizace

Různé zdroje mají různé formáty:

```
# Firewall log:
Aug 18 12:34:56 fw01 deny tcp 192.168.1.5:54321 -> 8.8.8.8:53

# IIS log:
2024-08-18 12:34:56 192.168.1.5 GET /login.php - 80 - 8.8.8.8 Mozilla/5.0 401

# SSH log:
Aug 18 12:34:56 server sshd[1234]: Failed password for alice from 192.168.1.5 port 54321 ssh2
```

SIEM je normalizuje do formátu **CEF** (Common Event Format), **LEEF** nebo do schématu specifického pro daného výrobce:

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

Teprve nyní je možná korelace napříč zdroji.

## Korelace

Korelace propojuje události z různých zdrojů:

```
1. Failed login (Active Directory log) — alice@corp.com
2. Account lockout (AD log) — alice@corp.com
3. Successful login (AD log) — alice@corp.com — from different IP
4. Network access (VPN log) — alice — from outside corp
5. File access (file server log) — alice — sensitive files

= Account takeover incident
```

Jednotlivé události jsou samy o sobě neškodné. Dohromady ale ukazují na kompromitaci.

::: viz siem-correlation-trace "Pusť event-by-event scénář brute force → success → file access. Correlation rule sleduje sliding window (60 s, ≥10 fails); alert vystřelí, jen když celý vzor sedí."
:::

Korelační pravidla:

```
RULE: brute force then success
  IF >= 10 failed logins for user X within 5 min
  AND successful login for user X within next 1 min
  AND login from different IP than previous successful
  THEN ALERT: Possible account takeover
```

## Detekční pravidla

### Signatura

```
RULE: known malware C2
  IF dst_ip IN known_c2_iplist
  THEN ALERT: C2 communication detected
```

### Anomálie

```
RULE: data exfiltration
  IF outbound bytes from host > 2 × historical avg
  AND destination outside corporate
  THEN ALERT: Possible exfiltration
```

### Chování (behavior)

```
RULE: privileged escalation
  IF user X normally has read-only access
  AND user X performed admin action (sudo, RDP to DC)
  THEN ALERT: Privilege escalation
```

## Hlavní výrobci SIEM

| Výrobce | Poznámky |
| :--- | :--- |
| **Splunk** | Nejrozšířenější, drahý |
| **IBM QRadar** | Podnikové (enterprise) nasazení, zavedený produkt |
| **Microsoft Sentinel** | Cloud-native, prostředí Azure |
| **Elastic Security** | Otevřené jádro (open-core), dobře škáluje |
| **Sumo Logic** | Primárně cloudový (cloud-first) |
| **LogRhythm** | Pro střední trh (mid-market) |
| **Wazuh** | Open-source, HIDS + SIEM |
| **Graylog** | Open-source |

Volba závisí na: rozpočtu, nasazení v cloudu versus on-premises, ekosystému integrací a požadavcích na dobu uchovávání dat (retention).

## SOAR

**Security Orchestration, Automation, and Response** (orchestrace, automatizace a reakce v bezpečnosti). Sedí jako nadstavba nad SIEM.

### Schopnosti

- **Automatizace playbooků** — provádí kroky reakce.
- **Integrace přes API** — komunikuje s firewally, EDR a systémy pro správu tiketů.
- **Správa případů (case management)** — sleduje průběh vyšetřování.

### Příklad playbooku

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

Nástroje: Splunk Phantom, Palo Alto Cortex XSOAR, Tines, Swimlane.

## Uchovávání logů (retention)

Vychází z potřeb shody (compliance) a vyšetřování:

| Standard | Doba uchovávání |
| :--- | :--- |
| PCI DSS | 1 rok (online), 3 měsíce s okamžitým přístupem |
| HIPAA | 6 let |
| SOX | 7 let |
| GDPR | po nezbytně nutnou dobu, auditní logy obvykle 6 měsíců a více |
| Většinou: | 90 dní v rychlé vrstvě, 1–7 let v archivu |

Hot = rychlý přístup. Cold = pomalejší, ale levnější (S3, archiv).

## Náklady

SIEM je *drahý*. Náklady rostou s těmito faktory:

- **Objem dat** — Splunk licencuje podle GB za den.
- **Výpočetní výkon (compute)** — korelační pravidla jsou náročná na CPU.
- **Úložiště** — dlouhá doba uchovávání znamená hodně diskového prostoru.

Strategie pro snížení nákladů:

- **Filtrování logů** — zahazování šumu už u zdroje.
- **Vrstvené úložiště (tiered storage)** — hot / warm / cold.
- **Redukce dat** — agregace a vzorkování (sampling) dat, která se netýkají bezpečnosti.
- **Open-source** — Elastic a Wazuh mají bezplatné varianty.

Moderní přístup: cloudový SIEM (Sentinel, Sumo Logic) s modelem platby podle skutečného růstu (pay-as-you-grow).

## XDR — sbližování přístupů

**Extended Detection and Response** (rozšířená detekce a reakce) sjednocuje:

- EDR (koncové stanice).
- NDR (síť).
- SIEM (logy).
- Detekci v cloudu.

Jeden výrobce. Jedna konzole. Předpřipravené integrace.

Kompromis: závislost na jednom výrobci (vendor lock-in) výměnou za snadné použití.

Výrobci: Microsoft Defender XDR, CrowdStrike Falcon, Palo Alto Cortex, SentinelOne Singularity.

## Aktivní vyhledávání hrozeb (threat hunting) v SIEM

Nad rámec automatických pravidel jde o *interaktivní* vyhledávání řízené analytikem:

```sql
search index=auth EventCode=4625
| stats count by src_ip
| where count > 50
| join src_ip [search index=geoip]
```

(Příklad v jazyce Splunk SPL. Ostatní SIEM používají obdobné nástroje.)

Hunteři hledají *neobvyklé* vzory na základě hypotéz a indikátorů kompromitace (IoCs).

## Monitoring metrik

Nad rámec bezpečnosti:

- **Dostupnost služeb** — monitoring uptime (Pingdom, Datadog).
- **Výkon (performance)** — APM (New Relic, Datadog, Dynatrace).
- **Kapacita** — trendy využití CPU, paměti a disku.

SIEM může zahrnovat *i* provozní monitoring, ten však bývá obvykle oddělený. Tyto oblasti sjednocují **platformy pro observabilitu** (Datadog, Splunk Observability).

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Gartner Magic Quadrant for SIEM (annual); Splunk documentation ([docs.splunk.com](https://docs.splunk.com/)); Elastic Security Docs ([elastic.co/security](https://www.elastic.co/security)); Bejtlich, R.: „The Practice of Network Security Monitoring" (No Starch 2013); MITRE ATT&CK ([attack.mitre.org](https://attack.mitre.org/)); Sigma — generic signature format ([github.com/SigmaHQ](https://github.com/SigmaHQ/sigma)).*
