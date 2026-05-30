---
title: Psaní security policy
---

# Psaní bezpečnostní politiky — struktura a best practices

Bezpečnostní politika (security policy) je *formální dokument*, který definuje, *jak* organizace přistupuje k bezpečnosti. Není to seznam technických opatření — je to *manažerský* dokument s *delegací odpovědnosti*.

## Hierarchie dokumentů

::: svg "Hierarchie security documentation"
<svg viewBox="0 0 580 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <polygon points="270,30 130,180 410,180" fill="none" stroke="var(--accent)" stroke-width="1.5"/>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="200" y="40" width="140" height="30" rx="3"/>
    <rect x="170" y="80" width="200" height="30" rx="3"/>
    <rect x="140" y="120" width="260" height="30" rx="3"/>
    <rect x="110" y="160" width="320" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="270" y="60">Policy</text>
    <text x="270" y="100">Standards</text>
    <text x="270" y="140">Procedures</text>
    <text x="270" y="180">Guidelines</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="start" font-size="9">
    <text x="450" y="60">co dělat (mandatory)</text>
    <text x="450" y="100">jak konkrétně (mandatory)</text>
    <text x="450" y="140">kroky (mandatory)</text>
    <text x="450" y="180">doporučení (advisory)</text>
  </g>
</svg>
:::

### Policy

*Vysoká úroveň* — co a proč.

- "All sensitive data must be encrypted in transit and at rest."
- Schvaluje top management.
- Krátký (1-10 stran).
- Vyžaduje sign-off od CEO/CISO.

### Standard

*Konkrétní* (specific technical requirements).

- "All HTTPS communications must use TLS 1.2 or higher with approved cipher suites."
- Schvaluje CISO / Security Director.
- Středně dlouhý (5-20 stran per topic).
- Mandatory.

### Procedure

*Step-by-step* instructions.

- "To rotate the database encryption key: 1. ... 2. ... 3. ..."
- Operations team.
- Detailed (5-50 stran per procedure).
- Mandatory pro operations.

### Guideline

*Best practices, recommendations*.

- "We recommend monitoring DNS traffic for sinkhole detection."
- Advisory — not mandatory.
- Vendor-specific or contextual.

## Typy policies

### Enterprise policy

Top-level, organization-wide.

- "Information Security Policy" — overall stance.
- "Acceptable Use Policy (AUP)" — what users may/may not do.
- "Privacy Policy" — data handling.

### Issue-specific

For *particular* technology or issue.

- "Email Policy" — usage, retention, monitoring.
- "BYOD Policy" — bring-your-own-device.
- "Remote Work Policy".
- "Password Policy".

### System-specific

For *individual* system.

- "ERP Security Policy".
- "Payment Processing Security Policy".

## Komponenty bezpečnostní politiky

Standard struktura:

### 1. Purpose

*Proč* policy existuje. Jaký business need řeší.

```
The purpose of this policy is to establish requirements for protecting 
organizational information and information systems from threats, both 
internal and external...
```

### 2. Scope

*Kde* + *na koho* se vztahuje.

```
This policy applies to all employees, contractors, vendors, and any 
party with access to organizational information systems.
```

### 3. Policy statement(s)

*Co* je vyžadováno / zakázáno.

```
1. All systems handling sensitive data MUST encrypt data in transit 
   using TLS 1.2 or higher.
2. Authentication credentials MUST NOT be shared between individuals.
3. All security incidents MUST be reported to the Security Operations 
   Center within 4 hours of discovery.
```

Pozn: RFC 2119 keywords (MUST, MUST NOT, SHOULD, MAY) explicitly.

### 4. Roles + Responsibilities

*Kdo* odpovídá za co.

```
CISO is responsible for:
   - Approving security policies
   - Reviewing risk assessments
   - Approving exceptions

System Administrators are responsible for:
   - Implementing technical controls
   - Patch management
   - Monitoring system logs
```

### 5. Compliance + Enforcement

*Co se stane*, pokud někdo nedodrží.

```
Violations may result in disciplinary action up to and including 
termination of employment.
```

### 6. Exceptions

*Process* pro exemptions.

```
Any exception to this policy must be:
   - Documented with business justification
   - Reviewed by CISO
   - Approved by CISO/CEO
   - Time-limited (review annually)
```

### 7. Definitions

Glossary of technical terms.

### 8. References

Related policies, standards, regulations.

### 9. Revision history

Date, author, summary of changes.

### 10. Approval signatures

CEO / CISO / Legal etc.

## Psaní — best practices

### Be specific

❌ "All systems should be secure."

✓ "Systems handling Confidential data must be patched within 30 days of security update release."

### Use RFC 2119 keywords

- **MUST** / **MUST NOT** — absolute requirement.
- **SHOULD** / **SHOULD NOT** — strong recommendation.
- **MAY** — optional.

Avoid ambiguous: "important", "as soon as possible", "best efforts".

### Tie to business

Policy *připojena* k business goals. "Why" should be clear.

❌ "Use strong passwords."

✓ "To protect customer data and meet PCI DSS Requirement 8, all user accounts must use passwords meeting [Password Policy] requirements."

### Avoid implementation details

Policy says *what*, not *how* (that's procedure).

❌ "Use ssh -i ~/.ssh/keyfile.pem user@server."

✓ "Remote access to production systems must use cryptographically secure protocols (SSH, VPN) with strong authentication."

### Make it readable

- Plain English. Avoid jargon when possible.
- Short sentences.
- Headers, bullets.
- Examples.

If users *can't read* policy, they *can't follow* it.

### Sustainable

- Review annually.
- Update when tech changes.
- Archive old versions.

Stale policy worse than no policy — gives false security.

## Standards examples

### Password Standard

```
Section 4: Requirements

4.1 Length
    Passwords MUST be at least 12 characters long.

4.2 Complexity
    Passwords MUST contain at least 3 of:
        - Lowercase letter
        - Uppercase letter
        - Number
        - Special character

4.3 Rotation
    Passwords MUST be changed if compromise is suspected.
    Periodic rotation (every X days) is NOT REQUIRED unless 
    risk assessment indicates need.

4.4 History
    The last 5 passwords MUST NOT be reused.

4.5 Multi-Factor Authentication
    All accounts with privileged access MUST use MFA.
```

Pozn: NIST SP 800-63B (2017+) explicitly *recommends against* mandatory periodic rotation — humans pick weaker passwords or write them down.

### Encryption Standard

```
Section 5: Approved Algorithms

5.1 Symmetric encryption
    - MUST use AES with 128-bit key minimum
    - PREFERRED: AES-256-GCM
    - MUST NOT use DES, 3DES, RC4

5.2 Asymmetric encryption
    - MUST use RSA-2048 minimum, RSA-3072 preferred
    - PREFERRED: ECC P-256, P-384
    - MUST NOT use ECDH with insecure curves

5.3 Hash functions
    - MUST use SHA-256, SHA-384, SHA-512, or SHA-3
    - MUST NOT use MD5, SHA-1 (except for non-security purposes)

5.4 Key Management
    - Keys MUST be stored in HSM, KMS, or hardware secure module
    - Keys MUST be rotated annually OR when compromise suspected
```

## Awareness + Training

Policy without *training* = ignored.

- New hire orientation includes security policy.
- Annual refresh training.
- Phishing simulation campaigns.
- Topic-specific (incident response drill, social engineering).

KnowBe4, SANS, Proofpoint — providers of security training content.

## Common mistakes

- **Too long** — nobody reads 100-page policy.
- **Too vague** — "do the right thing".
- **Out of date** — last revised 2010.
- **Conflicts** — multiple policies say different things.
- **No ownership** — nobody knows who maintains.
- **No enforcement** — written but not followed.

Policy je *žijící dokument*. Maintain it.

## Real-world templates

Many organizations *publish* their policies (great learning resource):

- **State of Indiana** — Information Security Framework.
- **NIST** — sample policies in Special Publications.
- **SANS** — policy templates ([sans.org/information-security-policy](https://www.sans.org/information-security-policy/)).
- **ISO 27001** — Annex A controls map to specific policies.

---

*Zdroj: BIS přednášky 2025/26, Ing. Kamil Malinka, Ph.D., FIT VUT v Brně. Externí reference: NIST SP 800-12 Rev 1 — Introduction to Information Security; NIST SP 800-63B — Digital Identity Guidelines (password recommendations) ([pages.nist.gov/800-63-3](https://pages.nist.gov/800-63-3/sp800-63b.html)); SANS Information Security Policy Templates ([sans.org](https://www.sans.org/information-security-policy/)); RFC 2119 — Key words for use in RFCs to Indicate Requirement Levels; Whitman, M.E., Mattord, H.J.: „Management of Information Security" (5th ed., Cengage 2017), §6.*
