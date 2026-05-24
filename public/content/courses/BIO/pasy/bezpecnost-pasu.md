---
title: Bezpečnost biometrického pasu
---

# Bezpečnost biometrického pasu

Bezpečnostní architektura biometrického pasu je *vícevrstvá*. ICAO 9303 specifikuje **PA, BAC, AA, EAC** protokoly, které dohromady zajišťují autenticitu, integritu, anti-skimming, anti-cloning a access control. Pochopení této architektury je nezbytné pro práci s eMRTD.

## Architektura bezpečnosti

::: svg "Vrstvy bezpečnosti: PA (integrity), BAC/PACE (access), AA (anti-cloning), EAC (biometric protection)."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="60" y="40" width="420" height="30" rx="4"/>
    <rect x="60" y="80" width="420" height="30" rx="4"/>
    <rect x="60" y="120" width="420" height="30" rx="4"/>
    <rect x="60" y="160" width="420" height="30" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="60" font-size="12">PA — Passive Authentication (data integrity)</text>
    <text x="270" y="100" font-size="12">BAC / PACE — Access Control (prevent skimming)</text>
    <text x="270" y="140" font-size="12">AA — Active Authentication (anti-cloning)</text>
    <text x="270" y="180" font-size="12">EAC — Extended Access Control (biometric protection)</text>
  </g>
</svg>
:::

## PA — Passive Authentication

**Cíl:** ověřit, že data v pasu jsou *autentická* a *neměněná*.

### Princip

* **PKI hierarchy:**
  * **CSCA** (Country Signing Certificate Authority) — *root* per země.
  * **DSC** (Document Signing Certificate) — *krátkodobý* (3–6 měsíců).
* CSCA podepisuje DSC.
* DSC podepisuje **EF.SOD** (hash list všech DGs).

### Verifikace

1. **Reader read** EF.SOD.
2. Verify DSC signature using DSC public key.
3. Verify DSC certificate using CSCA root (must be in PKD).
4. Compute hash of each DG; compare with EF.SOD.

### ICAO PKD (Public Key Directory)

* Central repository for CSCA certificates.
* Member countries upload their CSCAs.
* Border control terminals download regularly.
* **CRL** (Certificate Revocation List) — updated daily.

### Limity

* **PA nedokáže detekovat klonování** — útočník může zkopírovat všechna data (DG + SOD) do *jiného* čipu a PA projde.
* **Anti-cloning** vyžaduje *AA*.

## BAC — Basic Access Control

**Cíl:** zabránit *naivnímu* skimming.

### Princip

* Reader musí dokázat, že **vidí MRZ** (which is *physically* on passport).
* Hash MRZ derive 2 × 3DES keys: $K_{ENC}$, $K_{MAC}$.
* 3-pass mutual authentication via 3DES.
* Session keys negotiated.
* All chip communication encrypted + MAC'd (Secure Messaging).

### Slabost

* **MRZ entropy:** ~56 bits theoretical (passport number, DOB, expiry, check digits).
* **Practical entropy:** *much lower* (passport numbers sequential, DOB/expiry guessable from age).
* **Offline brute force:** if attacker skims encrypted traffic, can brute-force MRZ.
* **30-40 bits in worst case** — hours on GPU.

### Defenze

* **BAC is legacy** — replaced by PACE in modern e-pasy.
* Still **required** for backwards compatibility (older readers).

## PACE — Password Authenticated Connection Establishment

**Cíl:** modernější náhrada BAC.

### Princip

* **Diffie-Hellman key agreement** with *password* derived from MRZ or CAN.
* **CAN** (Card Access Number) — 6-digit number printed on passport.
* **Brainpool curves** (e.g., brainpoolP256r1) — preferred.
* **AES-128 + AES-CMAC** for Secure Messaging.

### Vlastnosti

* **Forward secrecy** — even if MRZ leaks, past sessions remain secure.
* **Strong key agreement** — DH keys per session.
* **Stronger than BAC** even with low-entropy password.

### Adoption

* **Germany 2009** — first eIDs with PACE.
* **EU mandate 2014** — all new e-pasy support PACE.
* **Backward compatibility** — also supports BAC.

## AA — Active Authentication

**Cíl:** zabránit *klonování* pasu.

### Princip

* In passport: **private key** stored in tamper-resistant chip (never exported).
* In DG15: **corresponding public key**, signed by DSC.
* **Challenge-response:**
  * Reader generates random nonce $r_R$.
  * Passport signs $h(r_R \mathbin\Vert r_P)$ with private key, where $r_P$ is passport's random nonce.
  * Reader verifies signature using DG15 public key.

### Vlastnost

* Klon, který má *kopii dat*, **neudělá podpis** — *nemá soukromý klíč*.
* Klonování vyžaduje fyzickou extrakci klíče z čipu (very difficult).

### Adoption

* **EU mandatory** since 2009 (Schengen 2nd gen).
* **USA does NOT** require AA — relies on PA + visual + immigration database.
* **Czech Republic:** mandatory since 2009.

### Slabost

* **Relay attack** — útočník přeposílá komunikaci between far passport and far reader.
* **Mitigace:** PACE+SM s timing constraints.

## EAC — Extended Access Control

**Cíl:** chránit *citlivá* biometrická data (DG3 fingerprints, DG4 iris).

### Komponenty

#### Terminal Authentication (TA)

* Terminál musí dokázat *autoritu* ke čtení biometrik.
* Terminal má *certifikát* podepsaný **Document Verifier (DV)**.
* DV podepsán *Country Verifying CA (CVCA)*.
* Pas verifies celý chain.

#### Chip Authentication (CA)

* Stronger verze AA + key exchange.
* Pas + reader establish *new* session keys (oddělené od PACE).
* Encrypted communication for DG3, DG4 data.

### Adoption

* **EU mandatory** for biometric data (DG3, DG4).
* **Standard:** BSI TR-03110.
* **Czech Republic:** implements CA + TA for fingerprints.

### Authorization model

* **Each terminal** has specific *authorization* (read DG3 only, read all, etc.).
* **Certificates** specify access rights.
* **Time-limited** — terminal certs typically valid 1 week.

::: viz epassport-handshake "Krok po kroku přes BAC/PACE → PA → AA → EAC; vidíte, kterou DG která vrstva zpřístupní."
:::

::: viz bac-pace-keys "Entropie MRZ a brute-force time pro BAC vs PACE; přepínáte, co útočník zná."
:::

## Útoky na biometrické pasy

### BAC brute force (Laurie 2006)

[Adam Laurie](https://www.dailytech.com/Cracking+the+BAC+Algorithm+Used+to+Secure+ePassports/article14127.htm):

* Demonstroval skim + brute-force MRZ on US pasy.
* Sequential numbering → ~30 bits entropy.
* **Hours on commodity hardware.**

Mitigace: passport numbers should be random; PACE replaces BAC.

### Cloning (Halderman et al. 2008)

* Demonstrated cloning of US pas without AA.
* Just copy all DGs + SOD to new chip.
* PA passes.
* **No AA = no anti-cloning.**

Mitigace: AA implementation (EU since 2009).

### Relay attack

* MITM forwarding between passport and reader.
* Defeats AA (passport signs whatever challenge is forwarded).

Mitigace:
* **Distance bounding** (research).
* **Timing constraints** in PACE.

### Side-channel attacks

* **DPA** on chip during AA (signing operation).
* Demonstrated on some older chip generations.

Mitigace: DPA-resistant cryptography (modern smart cards).

### Faraday cage / RF shielding

* Block reading at distance.
* **RFID-blocking sleeves** for paranoid travelers.
* **Recommended** by some privacy advocates.

## Šifrovací algoritmy v pasu

### Asymmetric

* **RSA-2048** or **RSA-3072** — common.
* **ECDSA P-256, P-384** — increasing.
* **Brainpool curves** — EU preference (P256r1, P384r1).

### Symmetric

* **3DES** (legacy BAC).
* **AES-128, AES-256** (PACE, EAC).

### Hash

* **SHA-1** (legacy).
* **SHA-256** (current standard).
* **SHA-384** (some EAC).

### Post-quantum?

* Currently *no* PQ in pasy.
* Future migration planned (ICAO discussion 2024+).

## eGate process

```
1. Cestující vloží pas.
2. Scanner OCR → MRZ.
3. PACE: derive password z MRZ, DH exchange, session keys.
4. PA: read SOD, verify signature chain, verify DG hashes.
5. AA (if supported): challenge-response, verify chip signature.
6. EAC TA/CA: if reading DG3, authenticate terminal + chip.
7. Read DG1, DG2 (basic biometric data).
8. Capture live face image.
9. Face match: stored DG2 ↔ live capture.
10. Decision: open gate or referee.
```

## Praktická bezpečnost

### Pro travellers

* **Use RFID-blocking sleeve** if concerned about distant skimming.
* **Don't show MRZ** publicly (e.g., posting passport photo online with MRZ visible).
* **Report compromised pas** to issuing authority.

### Pro country issuers

* **Strong CSCA security** — offline root CA, M-of-N control.
* **Regular CRL updates.**
* **PACE + AA + EAC** for new pasy.
* **Modern algorithms** (AES, ECDSA, SHA-256).
* **PQ migration planning.**

### Pro reader manufacturers

* **PKD synchronization** — daily.
* **CRL checking.**
* **PACE + AA + EAC** support.
* **Hardware Security Module** for terminal certificates.

## Limity bezpečnosti

* **Trust in CSCA** — corrupt issuing country = compromised pasy.
* **PKD distribution** — not all countries participate fully.
* **Physical pasy** still primary — chip is *complement*, ne *náhrada*.
* **Human inspection** still critical at border (visual ID).

## Trends 2025

* **Mobile travel credentials** — pas on smartphone.
* **EU EUDI Wallet** — digital identity with biometrics.
* **Quantum-resistant** signatures in future.
* **Cross-border biometric exchange** — Prüm extensions, EES.

---

*Zdroj: BIO přednášky 2025/26, BIO 11 — Biometrické pasy (Goldmann). Externí reference: ICAO Doc 9303 — *Machine Readable Travel Documents*, Part 11 (Security mechanisms); BSI TR-03110 *Advanced Security Mechanisms for Machine Readable Travel Documents*; Laurie, A.: *RFIDIOt — RFID Hacker's Toolkit*; Halderman, J. A. et al.: *Counterfeiting Vulnerabilities in the Machine-Readable Travel Document (MRTD)*.*
