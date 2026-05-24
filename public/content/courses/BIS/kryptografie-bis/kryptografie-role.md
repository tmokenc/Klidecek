---
title: Role kryptografie v IS
---

# Role kryptografie v IS — přehled

Kryptografie je *fundamentální* nástroj pro zajištění CIA + AAA v IS. Tato sekce shrnuje *roli* kryptografie v kontextu IS — technické detaily algoritmů jsou v navazujících kapitolách kryptografie.

## Co kryptografie poskytuje

| Cíl bezpečnosti | Kryptografická technika | Technický detail |
| :--- | :--- | :--- |
| **Confidentiality** | symetrické + asymetrické šifrování | [[blok-vs-proud]], [[principy]] |
| **Integrity** | hash funkce, MAC | [[hash-funkce]], [[mac-hmac]] |
| **Authentication** | digitální podpis, MAC, challenge-response | [[el-podpis]], [[mac-hmac]] |
| **Non-repudiation** | digitální podpis | [[el-podpis]] |
| **Key exchange** | DH, ECDH, hybridní KEM | [[dh-elgamal]], [[hybridni]] |
| **Random number generation** | DRBG, TRNG | viz postranní kanály |

⇒ Kryptografie pokrývá *všechny* CIA + AAA. Bez kryptografie není IT bezpečnost možná.

## Klasifikace algoritmů

| Třída | Princip | Příklady |
| :--- | :--- | :--- |
| **Symetrické** | sdílený klíč | AES, ChaCha20 |
| **Asymetrické** | pár veřejný/soukromý | RSA, ECC, EdDSA |
| **Hash** | bezklíčové, jednosměrné | SHA-256, SHA-3 |
| **MAC** | klíčový hash | HMAC-SHA256, Poly1305 |

Pro detailní taxonomii viz [[terminologie]] a [[klasifikace]].

## Útoky a modely

Kryptoanalýza dělí útoky podle *dostupných informací* útočníka. Klasické modely (detail v [[utoky-modely]]):

- **COA** (Ciphertext-Only Attack).
- **KPA** (Known Plaintext Attack).
- **CPA** (Chosen Plaintext Attack).
- **CCA** (Chosen Ciphertext Attack).

Moderní bezpečnost vyžaduje odolnost proti *všem* (IND-CCA2 security).

## Kerckhoffův princip

"*Bezpečnost závisí pouze na klíči, ne na utajení algoritmu.*" (Auguste Kerckhoff, 1883)

Důsledek: používejte *veřejně známé* algoritmy (AES, SHA-2/3), které byly *peer-reviewed*. *Nevyvíjejte* vlastní "tajné" šifry — security through obscurity nefunguje.

Detail [[kerckhoff]].

## Shannonovy principy

Claude Shannon (1949) formalizoval:

- **Confusion** — vztah mezi ciphertext + key musí být *complex* (substitution).
- **Diffusion** — *malá* změna v plaintext = *velká* změna v ciphertext (permutation).

Moderní šifry kombinují confusion (S-boxes) + diffusion (P-boxes) → SPN ([[feistel-spn]]).

## Kryptografie z pohledu IS

Z pohledu IS jde o *jak* kryptografii **používat**:

- **Transport security**: TLS ([[tls-aplikace]]), IPsec ([[vpn-ipsec]]).
- **Storage security**: full-disk encryption (BitLocker, LUKS, FileVault).
- **Authentication**: passwords (hashed [[kdf]]), tokens, certificates.
- **PKI**: X.509 certificates ([[x509]]), CA hierarchy ([[pki-uvod]]).
- **Code signing**: digital signatures ([[el-podpis]]) for software integrity.
- **Email security**: S/MIME, PGP.

Rozsah pohledu: nepíšeme *implementaci* AES — to spadá do kryptografického základu. Zde *navrhujeme*, kdy AES *použít* (storage encryption), s kterými parametry (256-bit klíč, GCM mode), a *jak* spravovat klíče.

## Krypto-agility

*Nezávisíme* na *jedné* šifře. Designujeme tak, aby šifra šla *vyměnit*, když praskne:

- TLS negotiation — server + client *vyjednají* algorithm.
- Crypto Suite headers — version + suite identifiers.
- Migrate path — pokud SHA-1 prasklý, *přeschvalujte* certifikáty s SHA-256.

Důležité od `RSA-MD5-RC4` (90s) → `RSA-SHA1-3DES` (00s) → `ECDHE-RSA-SHA256-AES-GCM` (10s) → `EdDSA-Kyber-SHA3-ChaCha20-Poly1305` (20s+).

Post-quantum migration ([[postkvantova]]) je aktuální *velký* krypto-agility challenge.

## Místo kryptografie v IS architektuře

Kryptografie *není* silver bullet. Funguje *jako součást* většího systému:

- **Krypto primitives** (AES, SHA, RSA) — *building blocks*.
- **Protokoly** (TLS, SSH, Kerberos) — *composition* primitives.
- **Infrastructure** (PKI, KMS, HSM) — *operations*.
- **Policy** (key rotation, algorithm selection) — *governance*.

Mnoho útoků nevychází z prolomení šifry, ale ze *špatného použití*:

- **Misconfigured TLS** — staré protokoly, slabé suite.
- **Hardcoded keys** — v binárce, accessible přes reverse engineering.
- **Bad random** — implementační chyby (Debian OpenSSL 2008, Sony PS3 ECDSA).
- **Side channels** — timing, cache, EM (detaily v [[spa-dpa|postranní kanály]]).
- **Operational mistakes** — log keys, leak via debug output.

Defense: *secure-by-default* libraries (libsodium, age, BoringSSL), audit code, threat modeling.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Stallings, W.: „Cryptography and Network Security" (8th ed., Pearson 2020); NIST SP 800-175B — Guideline for Using Cryptographic Standards ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-175Br1.pdf)); Schneier, B.: „Applied Cryptography" (2nd ed., Wiley 1996).*
