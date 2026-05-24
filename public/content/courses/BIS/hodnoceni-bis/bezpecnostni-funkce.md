---
title: Bezpečnostní funkce — taxonomie
---

# Bezpečnostní funkce — taxonomie

Bezpečnostní funkce (security functions) jsou *mechanismy*, které IS implementuje, aby splnil bezpečnostní cíle. ITSEC, později Common Criteria, klasifikovaly 8 hlavních kategorií. Tato sekce je vyjmenovává a vysvětluje, *co každá obsahuje*.

## 1. Identifikace a autentizace (FIA)

*Kdo* přistupuje?

### Identifikace

Subjekt *tvrdí* identitu (username, email, ID).

### Autentizace

Subjekt *prokazuje* identitu. 5 faktorů:

1. **Something you know** — password, PIN.
2. **Something you have** — token, smart card.
3. **Something you are** — biometrika (BIO course).
4. **Somewhere you are** — geolocation.
5. **Something you do** — keystroke dynamics.

**MFA** (Multi-Factor Authentication) = 2+ z různých kategorií. Typicky password + token / SMS / TOTP.

### Mechanismy

- **Password-based** — most common, weak.
- **Token-based** — RSA SecurID, YubiKey, smart card.
- **Certificate-based** — X.509 ([[x509]]).
- **Biometric** — fingerprint, face, iris.
- **Federated** — SAML, OAuth, OpenID Connect.

## 2. Řízení přístupu (FDP)

Po authentication: *co* může subjekt dělat?

Modely (detail viz [[dac-mac]] + [[rbac-abac]]):

- **DAC** (Discretionary) — owner decides ([[dac-mac]]).
- **MAC** (Mandatory) — system enforces labels.
- **RBAC** (Role-Based) — role determine permissions ([[rbac-abac]]).
- **ABAC** (Attribute-Based) — attributes of subject + object + environment.

### Bezpečnostní modely

- **Bell-LaPadula** — confidentiality, *no read up, no write down* ([[bell-lapadula]]).
- **Biba** — integrity, *no read down, no write up* ([[biba-clark-wilson]]).
- **Clark-Wilson** — commercial integrity, well-formed transactions.

## 3. Účtovatelnost (FAU)

*Co se stalo?* Audit logs zaznamenávají akce.

### Co logovat

- **Successful + failed authentication** — detect brute force.
- **Privileged operations** — sudo, admin actions.
- **Data access** — read/modify sensitive data.
- **Configuration changes** — system + security settings.
- **Network connections** — flow records.
- **Process creation** — what runs.

### Vlastnosti logu

- **Integrity** — logs *nesmí* být změnitelné (append-only).
- **Timestamping** — synchronized time (NTP).
- **Retention** — store enough time for forensics + compliance (GDPR 6m, SOX 7y).
- **Privacy** — anonymize PII when possible.

### Tools

- **syslog** / journald — Linux logs.
- **Windows Event Log**.
- **SIEM** ([[siem-monitoring]]) — central collection + correlation.

## 4. Audit

Periodic *review* of:

- **Security controls** — implemented as designed?
- **Compliance** — meeting regulatory requirements?
- **Logs** — anomalies, violations.

Audit je *manažerský* proces — interní audit, externí auditoři, vendor audits.

ISO 19011 standardizuje audit process.

## 5. Opakované užití objektů (Object Reuse)

Pokud objekt (memory, disk block, register) je *deallocated* a re-allocated *jinému* subject, *nesmí* obsahovat zbytky předchozího obsahu.

### Mechanismy

- **Memory clearing** — zero pages před realloc.
- **Disk wipe** — secure delete (multiple overwrites, ATA Secure Erase).
- **Register clearing** — zero registers při context switch.

### Bez object reuse

Útoky: cold boot attack (data v RAM po vypnutí), disk recovery (deleted files), memory dump.

Patří k MAC requirements TCSEC B-level.

## 6. Přesnost (Accuracy)

Data jsou *přesná* — žádné neúmyslné modifikace, no corruption.

### Mechanismy

- **Checksum** — CRC, parity.
- **Error correction codes** — ECC RAM, RAID.
- **Database constraints** — referential integrity, type checks.
- **Application-level validation** — input sanitization.

Integrity ≠ Accuracy: integrity je *neoprávněná modifikace*, accuracy je *neúmyslná modifikace*. V praxi překryv.

## 7. Spolehlivost a dostupnost služeb

*Availability* + *reliability* — služba *funguje*, *kdy* uživatelé potřebují.

### Mechanismy

- **Redundance** — RAID, clustering, hot standby.
- **Load balancing** — distribuce zátěže.
- **Backup + DR** — disaster recovery plans.
- **Capacity planning** — predict + scale.
- **DDoS protection** — rate limiting, anycast, CDN.

### Metriky

- **Uptime %** — 99 / 99.9 / 99.99 / ... „nines".
- **MTBF, MTTR**.
- **RPO, RTO**.

## 8. Výměna dat (Data Exchange)

Bezpečná *komunikace* mezi systémy.

### Mechanismy

- **Confidentiality v transit** — TLS ([[tls-aplikace]]), VPN ([[vpn-ipsec]]).
- **Integrity v transit** — MAC, signature ([[mac-hmac]]).
- **Authentication** — mutual TLS, IPsec, Kerberos ([[kerberos]]).
- **Replay protection** — sequence numbers, timestamps, nonces.

### Standards

- **TLS 1.3** — web, app.
- **IPsec** — VPN, network layer.
- **SSH** — remote shell.
- **S/MIME, PGP** — email.
- **DNSSEC** — DNS integrity.

## Common Criteria SFR mapování

Pro mapování na CC functional classes ([[common-criteria]]):

| BIS funkce | CC class |
| :--- | :--- |
| Identifikace, autentizace | **FIA** — Identification and Authentication |
| Řízení přístupu | **FDP** — User Data Protection |
| Účtovatelnost | **FAU** — Security Audit |
| Audit | **FAU** + **AMA** assurance |
| Opakované užití | **FDP_RIP** — Residual Information Protection |
| Přesnost | **FDP_IFC, FDP_DAU** — Data Authentication |
| Spolehlivost, dostupnost | **FRU** — Resource Utilization, **FPT** — Protection of TSF |
| Výměna dat | **FTP** — Trusted Path/Channels, **FCO** — Communication |

Plus **FCS** (Cryptographic Support) prochází napříč — všechna komunikace, ukládání, autentizace používá kryptografii.

## Závislosti mezi funkcemi

Bezpečnostní funkce *nestojí samostatně* — mají závislosti:

```
Audit needs:
   Timestamp (NTP synchronized)
   Integrity (logs cannot be tampered)
   Reliability (logs always recorded)
Authentication needs:
   Cryptography (password hash, certificate signing)
   Integrity (credentials cannot be tampered)
Access control needs:
   Authentication (must know who)
   Audit (record what was accessed)
```

Bezpečnost = *systém* funkcí. Pokud jedna chybí, ostatní mají snížený efekt.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně, a Hanáček & Staudek: „Bezpečnost IS — Metodická příručka" (ÚSIS 2000), §2.1.2 + §2.3.3. Externí reference: ISO/IEC 15408-2:2008 — Functional Security Requirements; ISO/IEC 27001:2022 — ISMS Requirements; NIST SP 800-53 Rev 5 — Security Controls; Stallings, W., Brown, L.: „Computer Security: Principles and Practice" (4th ed., Pearson 2018), §2.*
