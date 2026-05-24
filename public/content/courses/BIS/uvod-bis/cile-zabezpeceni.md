---
title: Cíle bezpečnosti — CIA + AAA + non-repudiation
---

# Cíle bezpečnosti — rozšíření CIA o AAA + privacy

CIA triáda ([[terminologie-cia]]) je *základ*, ale moderní IS bezpečnost cílí na *víc* vlastností: **AAA** (authentication, authorization, accounting), **non-repudiation**, **privacy**. Tato sekce shrnuje *celý* katalog cílů, které se BIS pokouší dosáhnout.

## CIA — připomenutí

- **Confidentiality** — důvěrnost, šifrování + access control.
- **Integrity** — integrita, hash + signature.
- **Availability** — dostupnost, redundance + DDoS protection.

## AAA — Authentication, Authorization, Accounting

V síťovém světě (RADIUS, TACACS+, Kerberos) AAA označuje tři postupné kroky při přístupu.

### Authentication (ověření)

*Kdo jsi?* Subjekt prokáže svou identitu.

Faktory:

- **Something you know** — password, PIN, secret answer.
- **Something you have** — smart card, hardware token, mobile.
- **Something you are** — biometrics (fingerprint, face, iris).
- **Somewhere you are** — geo-location, IP range.
- **Something you do** — keystroke dynamics, gait.

**Multi-factor authentication (MFA)** kombinuje 2+ faktory z různých kategorií. Typicky password + SMS/TOTP/U2F.

### Authorization (autorizace)

*Co můžeš dělat?* Po authentication systém rozhodne, *jaké* operace má subjekt povoleny.

Modely:

- **DAC** (Discretionary Access Control) — vlastník objektu nastavuje práva.
- **MAC** (Mandatory Access Control) — systém vynucuje labels.
- **RBAC** (Role-Based Access Control) — práva přes role.
- **ABAC** (Attribute-Based Access Control) — práva přes atributy.

Detaily v [[dac-mac]], [[rbac-abac]].

### Accounting (auditování)

*Co jsi udělal?* Systém *zaznamenává* akce uživatelů — log files, audit trail.

Použití:

- **Forensics** — vyšetřování incidentu.
- **Compliance** — regulatorní požadavky.
- **Billing** — pay-per-use services.
- **Anomaly detection** — neobvyklé chování → potenciální incident.

GDPR vyžaduje accounting pro přístupy k osobním údajům.

## Non-repudiation (nepopiratelnost)

Subjekt *nemůže popřít*, že provedl akci.

Klasický příklad: digitální podpis ([[el-podpis]]). Pokud Alice podepsala dokument svým soukromým klíčem, *nemůže tvrdit*, že to nebyla ona — soukromý klíč zná jen ona.

Bez non-repudiation:

- Bob: "Já jsem ten transfer nedělal!" → bank nemůže prokázat opak.
- Alice: "Nepodepsala jsem tu smlouvu!" → soud nemůže potvrdit.

Non-repudiation je *právní* požadavek pro elektronické dokumenty (eIDAS regulation v EU).

Mechanismy:

- **Digital signature** — RSA, ECDSA, EdDSA.
- **Trusted timestamp** — důkaz, *kdy* podpis vznikl.
- **Notarized log** — třetí strana zaznamená.

## Privacy

Kontrola jednotlivce nad svými osobními údaji.

Confidentiality ≠ Privacy. Confidentiality = data není čteno neoprávněnými. Privacy = *víc* — kontrola, *kdo*, *kdy*, *za jakým účelem* data zpracovává.

Privacy principles (Privacy by Design, Ann Cavoukian 2009):

1. **Proactive not Reactive** — privacy from start, ne add-on.
2. **Privacy as default**.
3. **Privacy embedded into design**.
4. **Full functionality** — privacy + use, ne zero-sum.
5. **End-to-end security**.
6. **Visibility and transparency**.
7. **Respect for user privacy**.

GDPR (EU 2018) reguluje privacy v EU. Klíčové požadavky:

- Lawful basis (consent, contract, legal obligation, ...).
- Data minimization.
- Right to access, rectification, erasure (right to be forgotten).
- Data Protection Impact Assessment.
- Mandatory breach notification (within 72 hours).

Detaily v [[gdpr-nukib]].

## Auditability (kontrolovatelnost)

Schopnost rekonstruovat *co se stalo*. Souvisí s accountability, ale širší — týká se i auditu *bezpečnostních controls* (jsou implementovány?).

Audit hooks:

- **System logs** — kernel events.
- **Application logs** — user actions.
- **Network logs** — flow records.
- **Database logs** — DML/DDL operations.

SIEM (Security Information and Event Management, [[siem-monitoring]]) konsoliduje a koreluje audit data.

## Trust

Velmi rozšířený, ale obtížně definovatelný pojem. Zhruba: *vědomé spoléhání* na entitu.

Zero Trust architecture (NIST SP 800-207, 2020): "never trust, always verify". Odmítá tradiční perimeter security (uvnitř důvěryhodné) — *každý* request verify, bez ohledu na origin.

## Resilience

Schopnost systému *odolat* a *rychle se zotavit* z útoků.

Liší se od confidentiality / integrity / availability — řeší *jak rychle* systém *vrátí* k normal stavu po incidentu.

Souvisí s disaster recovery + business continuity planning.

## Cíle vs Reality — praktické trade-offs

V praxi tyto cíle *konkurují*:

- **Security vs Usability** — silnější bezpečnost = horší user experience. MFA pomáhá, ale obtěžuje.
- **Privacy vs Auditability** — privacy logs anonymizovat? Forensics potřebuje detail.
- **Availability vs Confidentiality** — failover replicates data k jiným serverům → expose surface.
- **Cost vs Risk** — perfect security drahá. Akceptovatelné residual risk.

Manažerské rozhodnutí: kde *přiměřená* úroveň. Nikdy 100 %.

## ITIL a Security

ITIL (IT Infrastructure Library) — best practices pro IT service management. Security je jeden z mnoha procesů.

ISO/IEC 27001 ([[iso-27000]]) — *standard* pro management security. Cílí na *systematic*, *measurable* approach.

NIST CSF ([[nist-csf]]) — pro US gov + privátní sektor. 5 funkcí: Identify, Protect, Detect, Respond, Recover.

## Systematický přístup k bezpečnosti IS

Klíčové činnosti:

- Identifikovat hrozby, vulnerability, aktiva.
- Implementovat controls (administrative, technical, physical).
- Sestavit security policy.
- Detect incidenty + respond.
- Audit + compliance.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., Ing. Kamil Malinka, Ph.D., FIT VUT v Brně. Externí reference: Stallings, W.: „Computer Security: Principles and Practice" (4th ed., Pearson 2018), §1; Anderson, R.: „Security Engineering" (3rd ed., Wiley 2020), §1; NIST SP 800-207 — Zero Trust Architecture; Cavoukian, A.: „Privacy by Design — The 7 Foundational Principles" (2009, [PDF](https://iapp.org/media/pdf/resource_center/pbd_implement_7found_principles.pdf)); [GDPR Official Text](https://gdpr-info.eu/).*
