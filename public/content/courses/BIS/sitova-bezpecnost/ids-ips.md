---
title: IDS, IPS — detection a prevention
---

# IDS / IPS — Intrusion Detection / Prevention Systems

**IDS** (Intrusion Detection System) *detekuje* podezřelou aktivitu a *upozorní*. **IPS** (Intrusion Prevention System) jde dál — *blokuje*. Doplňují firewall ([[firewall]]) — firewall *filtruje*, IDS/IPS *analyzuje* obsah.

## IDS vs IPS

| | IDS | IPS |
| :--- | :--- | :--- |
| Pozice | passive (out-of-band, span port) | inline (blocks) |
| Action | alert | drop, reset, modify |
| Failure mode | safe (alerts cease) | dangerous (network blocked) |
| Latency | none | adds latency |
| False positive cost | minor | service disruption |

IPS = IDS + active response. Same detection engine, different action.

## Detekce přístupy

### Signature-based

Match traffic against *patterns* of known attacks.

```
alert tcp any any -> $HOME_NET 80 (msg:"SQL Injection"; content:"' OR 1=1"; sid:1001)
```

Pros: low false positives for known threats.

Cons:

- **Zero-day blind** — no signature for unknown.
- **Evasion** — encoding, fragmentation, encryption.

Most commercial IDS use mainly signatures.

### Anomaly-based

Build *baseline* of normal behavior. Alert on deviations.

Examples:

- DNS query volume spike → exfiltration?
- Unusual login time / location → compromised credentials?
- Many SQL queries to one row → scraping?

Pros: detects unknown attacks.

Cons:

- **False positives** — legitimate anomalies (new feature, marketing campaign).
- **Hard to tune**.
- **Adversarial** — attacker mimics normal.

Modern IDS: ML-based, behavioral analytics.

### Stateful protocol analysis

Track protocol state. Alert on protocol violations:

- HTTP request without proper Host header.
- TLS handshake with unusual extensions.
- DNS request for blocked TLDs.

Catches some evasion attempts.

## Architectura nasazení

### Network IDS (NIDS)

Monitor *network traffic*. Span port or tap.

```
                       [Switch]
                       /  |  \
                  [server][server][NIDS - span port]
```

Tools: Snort, Suricata, Zeek (Bro).

### Host IDS (HIDS)

Monitor *single host*. Logs, file integrity, process behavior.

Tools: OSSEC, Wazuh, Tripwire (file integrity).

### Hybrid

Combine NIDS + HIDS. NIDS sees network-level, HIDS sees endpoint-level.

### Distributed IDS

Multiple sensors → central analytics. Modern SIEM ([[siem-monitoring]]) architecture.

## Snort — Network IDS classic

Open-source NIDS by Cisco/Sourcefire.

```
# Detect SSH brute force
alert tcp any any -> $HOME_NET 22 (
    msg:"Possible SSH brute force";
    flow:to_server;
    detection_filter: track by_src, count 10, seconds 60;
    sid:1000001;
)

# Detect Metasploit shellcode
alert ip any any -> any any (
    msg:"Metasploit shellcode";
    content:"|fc e8 89 00 00 00 60|";
    sid:1000002;
)
```

Rules: header (action proto src→dst) + body (options).

Snort 3 (2020+) — modern reactive event detection.

## Suricata

Multi-threaded NIDS (Snort single-threaded historically).

Extension features:

- TLS metadata extraction (SNI, certificate).
- HTTP parsing.
- File extraction (download/upload).
- Lua scripting for complex logic.

```
alert http any any -> $HOME_NET any (
    msg:"Possible RAT in HTTP";
    http.host; content:"malicious.com";
    sid:2000001;
)
```

Used by: OPNsense, pfSense, security distributions.

## Zeek (Bro)

*Network analysis* framework. Not signature-focused.

Generates rich logs:

- `conn.log` — every connection (5-tuple + bytes + duration).
- `dns.log` — every DNS query/response.
- `http.log` — request, response, headers.
- `ssl.log` — certificate, SNI, version.
- `files.log` — extracted files.

Powerful for forensics + threat hunting.

```
event new_connection(c: connection) {
    if (c$id$resp_p == 23/tcp) {
        # Telnet connection in 2024 — suspicious
        print fmt("Telnet to %s:%s", c$id$resp_h, c$id$resp_p);
    }
}
```

Scripting language for complex analyses.

## EDR — Endpoint Detection & Response

Modern HIDS+. Beyond simple log monitoring:

- Process tree tracking.
- Behavior detection (e.g., unusual parent/child process).
- Memory inspection.
- Live response (kill process, isolate host).

Vendors: CrowdStrike Falcon, Microsoft Defender ATP, SentinelOne, Carbon Black.

EDR has become *standard* enterprise control. Often replaces traditional AV.

### MITRE ATT&CK alignment

Modern EDR maps detections to MITRE ATT&CK techniques. Defenders see which techniques are detected vs gaps.

## XDR — Extended Detection & Response

EDR + NDR (Network) + cloud + identity. Unified platform.

Trend toward consolidation: vendor-managed XDR replacing siloed tools.

## NGFW + IPS

Modern firewalls *include* IPS engine. Palo Alto, Fortinet, Check Point all bundle IPS.

Performance tradeoff: deep packet inspection slows throughput. Some sites use:

- **NGFW with IPS** for north-south traffic.
- **Inline IDS** for east-west (passive).

## Evasion techniques {tier=practice}

Attackers try to bypass IDS:

### Fragmentation

Split attack across IP fragments. IDS may not reassemble correctly. Linux RFC behavior may differ.

Modern IDS: full reassembly, but slow.

### Encoding

URL encoding, Unicode normalization, MIME encoding, double encoding. Multiple representations of same payload.

```
%27 = '   →   ' OR 1=1
```

IDS must *normalize* before signature match.

### Encryption

TLS hides payload. IDS sees metadata only (SNI, certificate, JA3 fingerprint).

Defense: TLS interception (privacy concerns), behavioral detection from metadata.

### Timing

Slowloris-style attacks send data so slowly that session times out before complete signature visible.

### Polymorphism

Each attack instance differs. Same logic, different bytes. Signatures fail.

ML-based detection more resilient.

## False positive / negative tradeoff

```
                   Reality
                +---------+---------+
                | Attack  | Normal  |
       +--------+---------+---------+
       | Alert  | True+   | False+  |
IDS    +--------+---------+---------+
       | Silent | False-  | True-   |
       +--------+---------+---------+
```

- **False positive (FP)** — alert on normal traffic. Wastes analyst time.
- **False negative (FN)** — miss real attack. Worse for security.

ROC curve trades off. Default: optimize for low FP (analysts overwhelmed otherwise), at cost of some FN.

::: viz ids-roc-tuner "Slidi threshold — sleduj, jak se mění TP/FP/FN/TN, ROC point, a alerts/day. Nízký threshold → alert fatigue; vysoký → propuštěné útoky."
:::

Tuning:

- **Add rule exceptions** — whitelist legit patterns.
- **Tighten rules** — reduce broad matches.
- **Use threat intel** — only alert if matches known IoC.
- **Risk-based prioritization** — high-asset traffic gets more rules.

## Alert fatigue

Too many alerts → analysts ignore. Real incidents missed.

Defense:

- **Tune** rules — fewer FP.
- **Aggregate** — group related alerts.
- **Prioritize** — score by asset value, technique severity.
- **Playbooks** — standard response, reduce decision burden.
- **SOAR** — Security Orchestration, Automation, Response. Auto-handle common alerts.

## Honeypots

Decoy systems pretending to be valuable. Any access = malicious.

- **Honeypot** — single decoy.
- **Honeynet** — network of decoys.
- **Canary tokens** — fake credentials, files. Alert when used.

Tools: Cowrie, Honeyd, Canary by Thinkst.

Pure-detection — no false positives possible (no one *should* touch honeypot).

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Northcutt, S., Novak, J.: „Network Intrusion Detection" (3rd ed., New Riders 2002); NIST SP 800-94 — Guide to Intrusion Detection and Prevention; [Snort Documentation](https://www.snort.org/documents); [Suricata Docs](https://docs.suricata.io/); [Zeek Documentation](https://docs.zeek.org/); [MITRE ATT&CK](https://attack.mitre.org/); Sanders, C., Smith, J.: „Applied Network Security Monitoring" (Syngress 2014).*
