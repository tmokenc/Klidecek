---
title: Hash, MAC a podpis v IS
---

# Hash, MAC a digitální podpis v IS — přehled

Hash funkce, MAC (Message Authentication Code) a digitální podpis poskytují *integrity* + *authentication* + *non-repudiation*. Tato sekce shrnuje použití v IS. Pro algoritmické detaily viz KRY.

## Hash funkce — viz KRY

Detail: [[hash-funkce]] (SHA-2/3), [[hash-utoky]] (collision, length-extension, birthday).

Stručně: `h = H(M)` — *deterministic*, *one-way*, *fixed-length output*, *collision-resistant*.

### Moderní hash funkce

| Funkce | Output | Status |
| :--- | :---: | :--- |
| MD5 | 128-bit | **broken** (collisions 2004) |
| SHA-1 | 160-bit | **broken** (collisions 2017) |
| SHA-256 | 256-bit | secure, mainstream |
| SHA-384, SHA-512 | 384/512-bit | secure |
| SHA-3 (Keccak) | 224-512-bit | secure, alternative |
| BLAKE2, BLAKE3 | variable | fast, secure |

Use SHA-256 nebo better. Avoid MD5, SHA-1 except for legacy compatibility.

## Použití hashe v IS

### Password storage

**Never** store passwords plain. Always *hash* + *salt* + *slow KDF*.

```
stored = bcrypt(password, salt, work_factor=12)
```

KDF (Key Derivation Functions, [[kdf]]):

- **PBKDF2** — iterated SHA-256 (legacy, OK).
- **bcrypt** — slow by design, 1999.
- **scrypt** — memory-hard.
- **Argon2** — current best, won Password Hashing Competition 2015.

Argon2id default for new applications.

### Data integrity

- **Software downloads** — publish SHA-256 hash; user verifies.
- **Git** — uses SHA-1 for commits (despite collisions in adversarial settings, *practical* git collisions hard).
- **Backup verification** — hash files, compare before/after.
- **Hash chains** — blockchain, append-only log integrity.

### Deduplication

Cloud storage (Dropbox, OneDrive) hashes files. If hash matches existing, store *once* + reference.

Privacy concern: if attacker knows hash of file (publicly available), can prove if user uploaded it.

### Bloom filters

Probabilistic data structure for membership test. Hash functions map elements to bit positions.

Used in: malware detection, DNS, antivirus databases.

## MAC — Message Authentication Code

Hash + *secret key*. Provides *integrity* + *authentication* (sender had key).

Detail [[mac-hmac]].

```
mac = MAC_K(M) = HMAC-SHA256(K, M)
```

Reciever has K → recompute MAC → match. If matches: integrity OK, sender knew K.

### Algoritmy

| MAC | Princip | Use |
| :--- | :--- | :--- |
| HMAC | hash with key (RFC 2104) | TLS, IPsec, JWT |
| Poly1305 | polynomial-based | ChaCha20-Poly1305 |
| CMAC | block cipher MAC | NIST SP 800-38B |
| GMAC | GHASH from GCM | network |

HMAC-SHA256 is *standard* MAC. Library support universal.

### Použití

- **API authentication** — HMAC of request + shared secret → API signature (AWS SigV4, GitHub webhooks).
- **JWT integrity** — JWS uses HMAC for signed-with-secret tokens.
- **Cookie signing** — Django, Rails sign cookie data.
- **IPsec, TLS** — authentication of packets / records.

### MAC vs Signature

| | MAC | Digital Signature |
| :--- | :--- | :--- |
| Keys | symmetric | asymmetric (key pair) |
| Verify | with same key | with public key |
| Non-repudiation | NO | YES |
| Speed | fast | slow |
| Use | inside trust domain | cross-domain |

Pokud Alice a Bob *sdílí* secret → MAC stačí. Pokud chceš důkaz pro *třetí stranu* → signature.

## Digital Signature

*Asymmetric* — Alice signs with private, Bob verifies with public. Detail [[el-podpis]].

```
signature = Sign_SK_Alice(H(M))
verify    = Verify_PK_Alice(M, signature)
```

Hash M *před* podpisem — sign small fingerprint místo whole document.

### Algoritmy

| Algorithm | Key | Speed | Use |
| :--- | :--- | :---: | :--- |
| RSA-PSS | RSA-2048+ | slow | TLS, code signing |
| ECDSA | ECC P-256+ | medium | TLS, Bitcoin |
| EdDSA | Ed25519 | fast | SSH, WireGuard |
| Dilithium | lattice | medium | PQC future |

EdDSA (Ed25519) je *current best* pro new applications — fast, no nonce reuse problem, deterministic.

### Použití

- **Code signing** — Apple notarization, Microsoft Authenticode, Linux RPM/DEB signatures.
- **Document signing** — PDF signatures, eIDAS qualified signatures.
- **TLS server authentication** — server signs handshake.
- **Software updates** — Windows Update, Linux distros sign packages.
- **Cryptocurrency** — Bitcoin, Ethereum transactions.
- **Certificate hierarchy** — root CA signs intermediates, etc.

### Non-repudiation

Klíčový atribut: Alice *nemůže popřít*, že podepsala. Pokud signature *valid* a private key was hers, *prokazatelně* podepsala.

Caveat: pokud private key *unikl* (theft, malware), Alice *může* popřít. Defense: hardware tokens, HSM, secure enclaves.

## Vlastnosti MAC + Signature

Oba poskytují *integrity + authentication*. Použijte podle situation:

| Situation | Choice |
| :--- | :--- |
| Two parties share secret (TLS, VPN session) | MAC |
| Many readers, one writer | Signature |
| Need non-repudiation | Signature |
| Performance critical, low latency | MAC |
| Public-facing, untrusted environment | Signature |

V praxi *kombinujeme*: TLS handshake uses signature (server cert), session data uses MAC.

## Útoky na hash + MAC + signature

| Útok | Cíl | Defense |
| :--- | :--- | :--- |
| Collision | hash | use SHA-256+ |
| Pre-image | hash | use SHA-256+ |
| Birthday | hash | 2^(n/2) work — pick n = 256 |
| Length-extension | Merkle-Damgård (SHA-256) | use HMAC, not raw H(K \|\| M) |
| Nonce reuse | DSA / ECDSA | use deterministic ECDSA (RFC 6979) or EdDSA |
| Bleichenbacher | RSA PKCS#1 v1.5 | use RSA-OAEP / RSA-PSS |

Detaily [[hash-utoky]], [[el-podpis]].

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: NIST FIPS 180-4 — Secure Hash Standard ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf)); NIST FIPS 202 — SHA-3 Standard; RFC 2104 — HMAC; RFC 6979 — Deterministic ECDSA; RFC 8032 — EdDSA; Bernstein, D.J. et al.: „High-speed high-security signatures" (CHES 2011, [DOI 10.1007/978-3-642-23951-9_9](https://doi.org/10.1007/978-3-642-23951-9_9)).*
