---
title: Asymetrická kryptografie v IS
---

# Asymetrická kryptografie v IS — přehled

Asymetrická (public-key) kryptografie řeší *key exchange problem* a poskytuje *digital signatures*. Tato sekce shrnuje použití v IS. Pro algoritmické detaily viz KRY.

## Princip — viz KRY

Detail: [[principy]] (basics), [[matematika]] (number theory), [[problemy]] (hard problems), [[hybridni]] (KEM/DEM).

Stručně: každá strana má **dva** klíče — *veřejný* (publishable) + *soukromý* (secret). Co je šifrováno *veřejným*, *dešifruje* jen soukromý. Co je podepsáno *soukromým*, ověří se *veřejným*.

## Algoritmy

### RSA ([[rsa]])

Klasický asymetrický algoritmus. Založen na *integer factorization*. 2048-bit minimum dnes, 3072-bit pro long-term.

Použití:

- **Encryption** (RSA-OAEP) — pomalá, omezená délka. Wrappuje *symmetric* klíč.
- **Signing** (RSA-PSS, RSA-PKCS#1 v1.5) — signing hash.

Pomalá pro bulk operace. Pro 4096-bit RSA single sign ~ms.

### ECC — Elliptic Curve Cryptography ([[elipticke]])

Modern preference. Stejná bezpečnost s *kratším* klíčem:

- ECC-256 ≈ RSA-3072 ≈ 128-bit symmetric security.
- ECC-384 ≈ RSA-7680 ≈ 192-bit.

Curves:

- **P-256** (NIST) — most widely supported.
- **Curve25519** (Bernstein) — popular for new applications (Signal, WireGuard, OpenSSH).
- **P-384, P-521** — extra security.

ECC pro signing (ECDSA, EdDSA) i key exchange (ECDH).

### Post-Quantum ([[postkvantova]])

RSA + ECC *zranitelné* k quantum computer (Shor algoritmus). Migration v progress:

- **CRYSTALS-Kyber** — KEM (key encapsulation). NIST PQC winner 2022.
- **CRYSTALS-Dilithium** — signature.
- **SPHINCS+** — stateless hash-based signature (backup).
- **FALCON** — lattice-based signature.

NIST PQC Standards finalized 2024. Adoption in TLS 1.3 hybrid mode (X25519 + Kyber) already in Chrome, Cloudflare.

## Použití v IS

### Key exchange

Bob a Alice se *poprvé* setkávají. Nemají sdílený klíč. Jak ho ustavit?

- **Diffie-Hellman** ([[dh-elgamal]]) — original 1976. Vulnerable to MITM bez authentication.
- **ECDH** — efficient version using elliptic curves.
- **Kyber** — post-quantum.

DH/ECDH/Kyber říkají *jak* dva ustaví sdílený symmetric key. Po DH následuje symetrické šifrování ([[symetrika-v-is]]).

### Digital signature

Alice podepíše dokument svým privát klíčem. Bob (a kdokoli) ověří veřejným.

| Algorithm | Curve / Key | Speed | Security level |
| :--- | :--- | :--- | :--- |
| RSA-2048 | 2048-bit | slow | 112-bit |
| RSA-3072 | 3072-bit | slow | 128-bit |
| ECDSA-P256 | NIST P-256 | medium | 128-bit |
| EdDSA-Ed25519 | Curve25519 | fast | 128-bit |
| Dilithium-2 | lattice | medium | 128-bit post-quantum |

Detail [[el-podpis]].

Use case:

- **Code signing** — Apple notarization, Microsoft Authenticode, Linux package signatures.
- **Document signing** — eIDAS qualified signatures.
- **Software updates** — verify integrity + authenticity.
- **TLS server authentication** — server signs handshake with private key.
- **Cryptocurrency** — Bitcoin, Ethereum transactions = ECDSA signatures.

### Certificate-based authentication

PKI ([[pki-uvod]]) infrastructure builds trust hierarchy:

- **CA** (Certification Authority) signs certificates.
- **Certificate** ([[x509]]) binds public key to identity.
- **TLS handshake** uses certificate to authenticate server.

Detaily v [[tls-aplikace]].

## Hybridní šifrování (KEM/DEM)

Asymmetric je *pomalá* na bulk encryption. Hybrid pattern:

1. **Asymmetric** ustaví *random* symmetric key (KEM = Key Encapsulation Mechanism).
2. **Symmetric** šifruje *vlastní* data (DEM = Data Encapsulation Mechanism).

```
Sender:
   K = random AES key
   E_K(data) = ciphertext        ← bulk via symmetric
   E_PK(K) = wrapped key         ← small, via asymmetric

Receiver:
   K = D_SK(wrapped key)         ← decrypt key via asymmetric
   data = D_K(ciphertext)        ← decrypt data via symmetric
```

Every modern protocol (TLS, PGP, SSH, Signal) uses hybrid. Detaily [[hybridni]].

## RSA útoky a misconfigurace

RSA má historii implementation bugs:

- **Bleichenbacher** (1998) — PKCS#1 v1.5 padding oracle ([[rsa-utoky]]).
- **ROBOT** (2017) — Bleichenbacher revival.
- **Coppersmith** — small exponents (`e=3` bez padding).
- **Common modulus** — share modulus, different exponents.
- **Faulty implementations** — Sony PS3 ECDSA fixed nonce (2010).

Detail v [[rsa-utoky]] + [[el-podpis]].

Defense: use **RSA-OAEP** (not PKCS#1 v1.5), **RSA-PSS** for signing (not PKCS#1 v1.5).

## PKI v IS

**Public Key Infrastructure** ([[pki-uvod]]) je institutional framework pro publishing + revoking certificates.

Hierarchie:

- **Root CA** — top-level, self-signed.
- **Intermediate CA** — signed by root, signs leaf certs.
- **Leaf cert** — server, person, device.

Browser-trusted root CAs ~150 globálně. Compromised root → all signed certificates *suspicious*.

[[revokace]] popisuje CRL, OCSP, Certificate Transparency.

## Web of Trust

Alternativa hierarchické PKI: každý sign certificates jiných lidí (PGP, OpenPGP). Trust *peer-to-peer*.

Nepoužívá se v enterprise — hierarchická CA dominantní. Web of Trust v PGP community pro decentralized email signing.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Diffie, W., Hellman, M.E.: „New Directions in Cryptography" (IEEE Trans. IT 22(6), 1976); Rivest, R.L., Shamir, A., Adleman, L.: „A Method for Obtaining Digital Signatures and Public-Key Cryptosystems" (Comm. ACM 21(2), 1978); NIST PQC Standards 2024 ([csrc.nist.gov/projects/post-quantum-cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)); Bernstein, D.J., Lange, T.: „Post-quantum cryptography" (Nature 549, 2017).*
