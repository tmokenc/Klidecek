---
title: FIPS 140-3 — evaluation kryptografických modulů
---

# FIPS 140-3 — kryptografická validace

**FIPS 140** (Federal Information Processing Standard 140) je americký standard pro *kryptografické moduly*. Aktuální verze **FIPS 140-3** (2019, nahrazuje 140-2 z 2001). Je *povinná* pro americkou federální vládu a praktický průmyslový standard pro krypto moduly.

## Co je FIPS 140

Standard *nepředepisuje* algoritmy ani protokoly. Předepisuje:

- **Approved algorithms** — schválené (AES, SHA-2/3, RSA, ECDSA, ...).
- **Random number generators** — schválené DRBG.
- **Module structure** — fyzická a logická.
- **Self-tests** — startup + on-demand.
- **Tamper resistance** — pro vyšší úrovně.
- **Key management** — generation, storage, destruction.

Validation = *test laboratoře* ověří compliance + NIST CMVP (Cryptographic Module Validation Program) vydá certifikát.

## Čtyři úrovně (Level 1-4)

Hierarchické — Level 4 zahrnuje requirements Level 3, atd.

### Level 1 — basic

Minimal:

- Approved algorithms.
- Žádné fyzické tamper protections specifically.
- Software-only OK (pokud běží na obecném OS).

Příklady: OpenSSL FIPS module, BoringSSL FIPS.

### Level 2 — tamper-evident

- Tamper-evident coatings (uvidíte, pokud někdo zkoušel).
- Role-based authentication (operator, crypto officer).
- Multi-chip embedded OK.

Příklady: smart cards, USB tokens (YubiKey FIPS).

### Level 3 — tamper-resistant

- Tamper-resistant — *fyzicky* odolává proti opening.
- Identity-based authentication.
- Separation of crypto + general purpose computation.
- Strong enclosure (potting, tamper-detection circuits).

Příklady: hardware HSM (Thales nShield, Utimaco).

### Level 4 — tamper-active

- *Aktivní* tamper response — *vymaže* klíče při detekci.
- EFP/EFT — environmental failure protection / testing.
- Multi-factor authentication.
- Plus everything from L3.

Příklady: high-end HSM, military-grade modules.

::: svg "FIPS 140-3 čtyři úrovně"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="40" width="100" height="100" rx="4"/>
    <rect x="140" y="40" width="100" height="100" rx="4"/>
    <rect x="260" y="40" width="100" height="100" rx="4"/>
    <rect x="380" y="40" width="100" height="100" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="70" y="60">Level 1</text>
    <text x="190" y="60">Level 2</text>
    <text x="310" y="60">Level 3</text>
    <text x="430" y="60">Level 4</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="70" y="76">Basic</text>
    <text x="190" y="76">Tamper-evident</text>
    <text x="310" y="76">Tamper-resistant</text>
    <text x="430" y="76">Tamper-active</text>
  </g>
  <g fill="var(--text-faint)" text-anchor="middle" font-size="9">
    <text x="70" y="98">software</text>
    <text x="70" y="112">approved algos</text>
    <text x="190" y="98">smart card</text>
    <text x="190" y="112">role auth</text>
    <text x="310" y="98">HSM</text>
    <text x="310" y="112">strong enclosure</text>
    <text x="430" y="98">military HSM</text>
    <text x="430" y="112">active response</text>
  </g>
  <text x="270" y="170" text-anchor="middle" fill="var(--text-faint)" font-size="10">Cena vyšší. Vyšší úroveň pokrývá více útoků (side-channel, fault injection).</text>
</svg>
:::

## 11 oblastí hodnocení

FIPS 140-3 specifies 11 area requirements:

1. **Cryptographic Module Specification** — boundary, modes.
2. **Cryptographic Module Interfaces** — data input, output, control, status.
3. **Roles, Services, and Authentication** — operator, crypto officer.
4. **Software/Firmware Security** — integrity check, version control.
5. **Operational Environment** — OS, hardware platform.
6. **Physical Security** — tamper-evident / -resistant / -active.
7. **Non-Invasive Security** — side-channel resistance (NEW in 140-3).
8. **Sensitive Security Parameter Management** — key generation, storage, destruction.
9. **Self-Tests** — startup + conditional.
10. **Life-Cycle Assurance** — design, testing, vendor evidence.
11. **Mitigation of Other Attacks** — fault injection, EMI/EMR, etc.

Pro každou oblast existují *konkrétní* požadavky pro každý L1-L4.

## Approved algorithms

FIPS 140-3 schvaluje *jen* určité algoritmy. Aktuálně:

### Symmetric

- **AES** (128, 192, 256-bit) — block cipher.
- **3-key Triple DES** — *deprecated*, end of life 2023.
- AES modes: ECB, CBC, OFB, CFB, CTR, GCM, CCM, KW (key wrap), XTS.

### Hash

- **SHA-2 family** — SHA-224, 256, 384, 512.
- **SHA-3 family** — SHA3-224, 256, 384, 512.
- **SHAKE128, SHAKE256** — extendable output.

### Asymmetric

- **RSA** — encryption (OAEP), signing (PSS, PKCS#1 v1.5).
- **ECDSA** — P-256, P-384, P-521 curves.
- **EdDSA** — Ed25519, Ed448.
- **DH** — Diffie-Hellman key exchange (specific groups).
- **ECDH** — elliptic curve DH.

### MAC

- **HMAC** with approved hash.
- **CMAC** (block cipher MAC).
- **GMAC** (Galois MAC, from GCM).

### DRBG

- **CTR_DRBG** (AES-256 based).
- **HMAC_DRBG**.
- **Hash_DRBG**.

Detaily v [[blok-vs-proud]], [[rezimy]], [[3des-aes]], [[rsa]], [[elipticke]], [[hash-funkce]].

## CMVP — Cryptographic Module Validation Program

NIST + CCCS (Canada) operate CMVP. Process:

1. Vendor sends module + ST + design docs to **CST Lab** (Cryptographic and Security Testing Laboratory).
2. CST Lab tests module against FIPS 140-3.
3. Reports → NIST CMVP.
4. CMVP issues **validation certificate**.
5. Listed in **MIP** (Modules in Process) until certificated, then **Validated Module List**.

Trvání: 6-18 měsíců po submission. Cena: $100k-$500k.

## FIPS 140-2 vs 140-3

| | 140-2 (2001) | 140-3 (2019) |
| :--- | :--- | :--- |
| Standard alignment | NIST-only | ISO/IEC 19790:2012 |
| Non-invasive | not explicit | Section 7 explicit |
| Software in HW environment | strict | flexible |
| OS validation | trusted OS levels | aligned with CC |
| Cert validity | indefinite + transition periods | similar |

140-2 transition deadline: April 2026. Until then, both 140-2 and 140-3 modules valid.

## Vztah ke Common Criteria

| | CC | FIPS 140-3 |
| :--- | :--- | :--- |
| Scope | celý IT product | jen krypto modul |
| Standard | ISO/IEC 15408 | NIST + ISO/IEC 19790 |
| Cena | $100k-$5M | $100k-$500k |
| Trvání | 6-24 m | 6-18 m |
| Mutual recognition | CCRA (mnoho zemí) | NIST + CCCS (US + Canada) |

Často *kombinováno*: Smart card = CC EAL 5+ (whole card) + FIPS 140-3 Level 2 (crypto module inside).

## Co FIPS *negarantuje*

- Že modul je *skutečně bezpečný* — implementace bugs, side-channel attacks neuvedené, novel attacks.
- Že váš systém je bezpečný — FIPS jen pro krypto modul, ne pro vše ostatní.
- Že je *nejnovější best practice* — FIPS pomalý, nepostihuje moderní attacks (Spectre-like).

**FIPS = compliance baseline, not security guarantee.**

## US Federal mandates

US federal agencies (FISMA Act 2002, modernized 2014) *musí* používat FIPS-validated crypto pro:

- Data v transit.
- Data at rest.
- Authentication.

Pokud krypto modul *není* FIPS-validated, federal agency *nesmí* deploy ho.

To je hlavní *commerce driver* pro FIPS — všichni vendoři chtějí federal market → FIPS-validate.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: NIST FIPS 140-3:2019 ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.140-3.pdf)); ISO/IEC 19790:2012 — Security requirements for cryptographic modules; [NIST CMVP](https://csrc.nist.gov/projects/cryptographic-module-validation-program); [Validated Modules List](https://csrc.nist.gov/projects/cryptographic-module-validation-program/validated-modules/search); Schneier, B.: „Applied Cryptography" (2nd ed., Wiley 1996), §24 (standards).*
