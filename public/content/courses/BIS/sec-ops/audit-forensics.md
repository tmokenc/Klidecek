---
title: Audit a digital forensics
---

# Audit a digital forensics

**Audit** je *systematic review* security controls implementation. **Digital forensics** je *investigation* incident after it occurred — recover evidence, identify attacker, support legal proceedings.

Obě činnosti odpovídají na otázky "*co se stalo?*" — audit *plánovaně*, forensics *reaktivně*.

## Bezpečnostní audit

### Typy auditu

#### Internal audit

Vlastní zaměstnanci (Internal Audit team). Continuous improvement.

#### External audit

Třetí strana certifikovaná. Required by:

- **ISO 27001** ([[iso-27000]]) certification.
- **SOC 2** report.
- **PCI DSS** for payment processing.
- **SOX** for public US companies.

#### Vulnerability assessment

Identify weaknesses. Tools: Nessus, Qualys, OpenVAS.

#### Penetration test

*Active* simulation of attack. Testers attempt breach.

#### Red Team / Purple Team

Beyond pen test:

- **Red Team** — simulated adversary, multi-week engagement.
- **Blue Team** — defenders.
- **Purple Team** — collaboration, defenders watch red team techniques.

### Audit process

1. **Scoping** — what's in scope.
2. **Planning** — schedule, resources.
3. **Fieldwork** — interviews, document review, technical testing.
4. **Reporting** — findings, recommendations.
5. **Follow-up** — verify remediation.

### Audit standards

- **ISO 19011** — guidelines for auditing.
- **AICPA Trust Services Criteria** — SOC 2.
- **NIST 800-53** controls — federal.
- **ISO 27001 Annex A** — international.

### Common findings

Auditors frequently find:

- **Stale accounts** — terminated users still active.
- **Excessive privileges** — users with admin not needed.
- **Missing patches** — known CVEs.
- **No password rotation** — old shared accounts.
- **No MFA** — for privileged access.
- **No log review** — logs collected but not analyzed.
- **No IR plan** or never tested.
- **Backups untested** — exist but never restored.

Remediation tracked in **CAPA** (Corrective Action / Preventive Action) system.

## Digital Forensics

Investigation after incident. Recover evidence, identify attacker, support legal.

### Phases

#### 1. Identification

What needs investigating? Scope:

- Compromised hosts.
- Affected accounts.
- Time range.
- Data potentially exposed.

#### 2. Preservation

Critical: preserve evidence *without* modification. **Chain of custody**.

```
Disk image (forensic copy) before any analysis.
Memory dump for volatile data.
Network capture preserved.
Log files copied (read-only).
Timestamps documented.
```

Tools: dd, FTK Imager, EnCase, X-Ways. Hash original + copy → prove integrity.

#### 3. Collection

Gather:

- **Volatile data first** — RAM, network connections (lost on shutdown).
- **System artifacts** — registry, event logs, browser history.
- **Disk image** — full bit-by-bit copy.
- **Network logs** — packet captures, NetFlow.
- **Cloud logs** — CloudTrail, similar.

#### 4. Analysis

- **Timeline reconstruction** — what happened when.
- **Malware analysis** — reverse engineering.
- **Network analysis** — Wireshark, Zeek.
- **Filesystem** — recover deleted files, MAC times.
- **Memory analysis** — Volatility framework.

#### 5. Reporting

Document findings. Include:

- Methodology.
- Evidence sources.
- Timeline.
- Conclusions.
- Recommendations.

Court-admissible if needed.

### Chain of custody

Each piece of evidence tracked:

- **Who** collected.
- **When** (timestamp).
- **Where** (location).
- **How** (method, tool).
- **Hash** before + after handoff.

Break chain → evidence may be inadmissible in court.

### Tools

#### Disk imaging

- **dd** (Linux) — `dd if=/dev/sda of=image.dd bs=1M`. Slow but standard.
- **dcfldd** — DoD enhancement. Hash on-the-fly.
- **FTK Imager** — Windows, common in forensics.
- **EnCase** — commercial.

#### File analysis

- **The Sleuth Kit + Autopsy** — open-source forensics platform.
- **EnCase**.
- **X-Ways Forensics**.

#### Memory analysis

- **Volatility** (Python) — extract running processes, network conns, etc. from memory dump.
- **Rekall** — fork of Volatility.

#### Network forensics

- **Wireshark** — packet capture analysis.
- **NetworkMiner** — extract files from pcap.
- **Zeek** — generates log files for review.

#### Malware analysis

- **IDA Pro** / **Ghidra** — disassemblers.
- **Radare2** — open-source.
- **x64dbg** — debugger.
- **Cuckoo Sandbox** — automated analysis.

### Anti-forensics

Attackers try to *hinder* forensics:

- **Timestomp** — falsify file timestamps.
- **Log deletion / tampering**.
- **Encryption** — disk, memory.
- **Wipe tools** — overwrite deleted data.
- **Steganography** — hide data in images.
- **Volatile-only attacks** — run from memory, never touch disk.

Modern forensics adapt.

### Cloud forensics

Challenges:

- **Multi-tenancy** — neighboring data inaccessible.
- **Volatile** — VMs destroyed, evidence gone.
- **Cross-jurisdiction** — data centers in many countries.
- **Limited access** — provider may not allow disk imaging.

Approach:

- **API logs** — CloudTrail, similar.
- **Snapshot** — preserve before deletion.
- **Cooperation with cloud provider** — formal request.

### Mobile forensics

Specialized tools:

- **Cellebrite UFED** — used by law enforcement, commercial.
- **MOBILedit** — alternative.
- **Magnet AXIOM**.

Extract:

- Call logs, SMS, contacts.
- App data — WhatsApp, Signal (if accessible).
- Location data.
- Photos, videos.
- Browser history.

Phones encrypted → cooperation with vendor may be needed (or exploit).

### Legal considerations

#### Search + seizure

In US: 4th Amendment requires warrant for most searches. Workplace may have *consent* via employee handbook.

EU: GDPR plus national laws.

CZ: Trestní řád § 158 (povinnost součinnosti).

#### Admissibility

Forensic evidence must be:

- **Authentic** — provably from where claimed.
- **Reliable** — process repeatable.
- **Complete** — no exculpatory evidence withheld.
- **Believable** — analyst credible.

Documentation critical.

#### Privacy

Even during investigation, employee privacy considerations apply. Document legal basis for access.

### Famous forensics cases

- **BTK Killer (2005)** — metadata in floppy disk identified.
- **Sony Pictures (2014)** — IPs traced to North Korea.
- **Equifax (2017)** — extensive forensics after breach.
- **SolarWinds (2020)** — forensics took months to scope.

### Forensic readiness

Plan *before* incident:

- **Logs at appropriate detail** — enough for reconstruction.
- **Retention** — sufficient time period.
- **Access controls** — auditors can collect without IT intervention.
- **Tools available** — workstation, software, training.
- **Vendor agreements** — IR retainer with forensics firm.

Without preparation: forensics takes *much* longer + may miss evidence.

## Compliance audit example: GDPR

GDPR ([[gdpr-nukib]]) audit examines:

- Lawful basis for processing.
- Data subject rights mechanisms (access, delete).
- Consent management.
- Breach notification procedures.
- DPO (Data Protection Officer) designation.
- Records of processing activities.
- DPIAs for high-risk processing.

Findings → improvement.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Casey, E.: „Digital Evidence and Computer Crime" (3rd ed., Academic Press 2011); NIST SP 800-86 — Guide to Integrating Forensic Techniques into Incident Response; SANS Forensics Reading Room ([sans.org/white-papers/category/computer-forensics-incident-response/](https://www.sans.org/white-papers/category/computer-forensics-incident-response/)); ACPO Good Practice Guide for Digital Evidence; Volatility Foundation ([volatilityfoundation.org](https://www.volatilityfoundation.org/)).*
