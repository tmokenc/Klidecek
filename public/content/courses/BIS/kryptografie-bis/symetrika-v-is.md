---
title: Symetrická kryptografie v IS
---

# Symetrická kryptografie v IS — přehled

Symetrická kryptografie (jeden sdílený klíč) je *workhorse* pro *bulk* encryption. AES je standardní volba. Tato sekce shrnuje *jak* IS používá symetrickou kryptografii. Pro algoritmické detaily viz KRY.

## Princip — viz KRY

Detail: [[blok-vs-proud]] (block vs stream), [[feistel-spn]] (struktury), [[delka-klice]] (key length), [[rezimy]] (CBC/CTR/GCM), [[padding-aead]] (AEAD).

Stručně: Alice + Bob sdílí klíč `K`. Encrypt: `C = E_K(M)`. Decrypt: `M = D_K(C)`.

## Použití v IS

### Storage encryption

Encrypt data na disku.

| Use case | Algorithm | Mode |
| :--- | :--- | :--- |
| Full disk (BitLocker, LUKS) | AES-128/256 | XTS |
| File-level | AES-256 | GCM |
| Database fields | AES-256 | GCM, deterministic |
| Cloud storage | AES-256 | GCM-SIV |

**XTS** (XEX-based Tweaked codebook with ciphertext Stealing) je specifický pro disk sectors — deterministic, no IV per block, but tweak from sector number.

**Klíč management** — klíč není v cloud storage, ale v HSM/TPM/Secure Enclave.

### Transport encryption

TLS, SSH, IPsec — *bulk data* po handshake. Detail v [[tls-aplikace]], [[vpn-ipsec]].

Session keys derived from Diffie-Hellman → AES-GCM nebo ChaCha20-Poly1305 pro data.

| Protokol | Bulk cipher (modern) |
| :--- | :--- |
| TLS 1.3 | AES-128-GCM, AES-256-GCM, ChaCha20-Poly1305 |
| SSH | AES-256-GCM, ChaCha20-Poly1305 |
| IPsec | AES-256-GCM (RFC 4106) |
| WireGuard | ChaCha20-Poly1305 |

### Authentication tokens

JWT (JSON Web Tokens) often used symmetric HMAC for integrity. *Nicméně* asymmetric ([[el-podpis]]) lepší pro multi-party.

Pokud token shared mezi servers in same trust domain → symmetric HMAC-SHA256. Pokud cross-domain → JWS (asymmetric).

### Database encryption

- **Application-level** — encrypt sensitive fields (PII, credit card) před storage.
- **Transparent Data Encryption (TDE)** — DB sám encrypt-decrypt; transparent pro app.
- **Format-Preserving Encryption (FPE)** — encrypted output má *stejný format* (credit card → 16 digits). Useful pro legacy DB schemas. AES-FF1 standard.

### Backup encryption

Encrypted backup tapes/disks. Disconnect from network → physical theft mitigated.

### Tokenization

Replace sensitive value (CC number) by *token*. Mapping in secure DB. Token encrypted nebo not at all — secure DB protects.

PCI DSS compliance often uses tokenization to *avoid* storing actual CC numbers.

## Algoritmy v IS dnes

### Recommended

- **AES** ([[3des-aes]]) — universal, hardware-accelerated (AES-NI, ARM Crypto Extensions).
- **ChaCha20** ([[proudove-sifry]]) — software-friendly, no AES-NI needed. WireGuard, mobile.
- **AES-GCM, ChaCha20-Poly1305** — AEAD (authenticated encryption).

### Deprecated (don't use)

- **DES** — 56-bit key broken in 90s. [[des]].
- **3DES** — 168-bit nominal but ~112-bit security; end of life 2023 per NIST.
- **RC4** — biased output ([[proudove-sifry]]), banned in TLS 1.3.
- **AES-CBC + HMAC** — not AEAD, padding oracle attacks. Use AES-GCM místo.
- **AES-ECB** ([[rezimy]]) — leaks patterns. Visible Tux image classic.

## Symetrické správa klíčů

Symetrické šifrování má *fundamentální problém*: oba *musí* mít *stejný* klíč. Jak ho distribuovat?

- **Pre-shared keys (PSK)** — out-of-band setup. Manuální. Used in WPA2-Personal, VPN PSK.
- **Key derivation** — z password ([[kdf]]) — Argon2, PBKDF2, scrypt.
- **Key Distribution Center** ([[kdc-needham]]) — třetí strana (KDC) generuje session keys.
- **Kerberos** ([[kerberos]]) — KDC-based, distributed authentication. Used in Microsoft AD.
- **Hybrid** — asymmetric DH/RSA exchanges *symmetric* key → bulk symmetric encryption.

Hybrid je *standard* (TLS, SSH, IPsec). Detail v [[hybridni]].

## Délka klíče — postačující

Pro modern threat:

- **AES-128** — minimum for new deployment. ~$10^9 years to brute force.
- **AES-192** — extra margin.
- **AES-256** — for crypto-agility (post-quantum, paranoia). NIST SP 800-131 recommends 256 by 2030.

Pre-quantum: AES-128 safe. Post-quantum: Grover algorithm halves effective security → AES-128 → ~64-bit (broken). AES-256 → 128-bit (still safe).

⇒ Move to **AES-256** pro long-term confidentiality.

Detaily v [[delka-klice]], [[postkvantova]].

## Modes — pick the right one

| Mode | Use | Notes |
| :--- | :--- | :--- |
| ECB | NEVER (textbook only) | leaks patterns |
| CBC | legacy, paired with HMAC | not AEAD, careful with padding |
| CTR | streaming | needs unique IV |
| GCM | **modern default** | authenticated encryption |
| GCM-SIV | nonce-reuse misuse-resistant | new, no AES-NI for GHASH |
| XTS | disk encryption | tweak from sector |

Default: **AES-256-GCM** pro most use cases. **ChaCha20-Poly1305** for software / mobile.

Detail [[rezimy]], [[padding-aead]].

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: NIST FIPS 197 — AES Standard ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf)); NIST SP 800-38D — Recommendation for GCM; RFC 8439 — ChaCha20 and Poly1305; Schneier, B.: „Applied Cryptography" (2nd ed., Wiley 1996), §12.*
