---
title: Asymetrická kryptografie v IS
---

# Asymetrická kryptografie v IS — přehled

Asymetrická kryptografie (public-key) řeší problém výměny klíčů (key exchange problem) a poskytuje digitální podpisy (digital signatures). Tato sekce shrnuje použití v informačních systémech. Pro algoritmické detaily viz KRY.

## Princip — viz KRY

Detail: [[principy]] (základy), [[matematika]] (teorie čísel), [[problemy]] (těžké problémy), [[hybridni]] (KEM/DEM).

Stručně: každá strana má **dva** klíče — *veřejný* (lze ho zveřejnit) a *soukromý* (zůstává v tajnosti). Co je zašifrováno *veřejným* klíčem, *dešifruje* jen klíč soukromý. Co je podepsáno *soukromým* klíčem, ověří se klíčem *veřejným*.

## Algoritmy

### RSA ([[rsa]])

Klasický asymetrický algoritmus. Je založen na faktorizaci celých čísel (integer factorization). Dnes je minimem délka klíče 2048 bitů, pro dlouhodobé použití 3072 bitů.

Použití:

- **Šifrování (encryption)** (RSA-OAEP) — pomalé, s omezenou délkou zprávy. Slouží k zabalení (wrap) symetrického klíče.
- **Podepisování (signing)** (RSA-PSS, RSA-PKCS#1 v1.5) — podepisuje se hash zprávy.

Pro hromadné (bulk) operace je pomalý. Jeden podpis u 4096bitového RSA trvá řádově milisekundy.

### ECC — eliptická kryptografie (Elliptic Curve Cryptography) ([[elipticke]])

Moderní volba. Nabízí stejnou bezpečnost při *kratším* klíči:

- ECC-256 ≈ RSA-3072 ≈ 128bitová bezpečnost symetrické šifry.
- ECC-384 ≈ RSA-7680 ≈ 192 bitů.

Křivky:

- **P-256** (NIST) — nejšířeji podporovaná.
- **Curve25519** (Bernstein) — oblíbená v nových aplikacích (Signal, WireGuard, OpenSSH).
- **P-384, P-521** — vyšší bezpečnost.

ECC se používá pro podepisování (ECDSA, EdDSA) i pro výměnu klíčů (ECDH).

### Postkvantová kryptografie (Post-Quantum) ([[postkvantova]])

RSA i ECC jsou *zranitelné* vůči kvantovému počítači (Shorův algoritmus). Migrace na odolné algoritmy právě probíhá:

- **CRYSTALS-Kyber** — KEM (zapouzdření klíče, key encapsulation). Vítěz soutěže NIST PQC z roku 2022.
- **CRYSTALS-Dilithium** — podpis.
- **SPHINCS+** — bezstavový podpis založený na hashích (záložní varianta).
- **FALCON** — podpis založený na mřížkách (lattice-based).

Standardy NIST PQC byly dokončeny v roce 2024. Nasazení v hybridním režimu TLS 1.3 (X25519 + Kyber) je už součástí prohlížeče Chrome a sítě Cloudflare.

## Použití v IS {tier=practice}

### Výměna klíčů (key exchange)

Bob a Alice se *poprvé* setkávají. Nemají žádný sdílený klíč. Jak ho ustavit?

- **Diffie-Hellman** ([[dh-elgamal]]) — původní z roku 1976. Bez autentizace je zranitelný vůči útoku typu man-in-the-middle (MITM).
- **ECDH** — efektivní varianta využívající eliptické křivky.
- **Kyber** — postkvantová varianta.

DH/ECDH/Kyber popisují, *jak* dvě strany ustaví sdílený symetrický klíč. Po DH následuje symetrické šifrování ([[symetrika-v-is]]).

### Digitální podpis (digital signature)

Alice podepíše dokument svým soukromým klíčem. Bob (a kdokoli další) jej ověří klíčem veřejným.

| Algoritmus | Křivka / klíč | Rychlost | Úroveň bezpečnosti |
| :--- | :--- | :--- | :--- |
| RSA-2048 | 2048 bitů | pomalý | 112 bitů |
| RSA-3072 | 3072 bitů | pomalý | 128 bitů |
| ECDSA-P256 | NIST P-256 | střední | 128 bitů |
| EdDSA-Ed25519 | Curve25519 | rychlý | 128 bitů |
| Dilithium-2 | mřížka | střední | 128 bitů, postkvantová |

Detail [[el-podpis]].

Typické použití:

- **Podepisování kódu (code signing)** — Apple notarization, Microsoft Authenticode, podpisy linuxových balíčků.
- **Podepisování dokumentů (document signing)** — kvalifikované podpisy podle eIDAS.
- **Aktualizace softwaru** — ověření integrity i autenticity.
- **Autentizace TLS serveru** — server podepisuje handshake svým soukromým klíčem.
- **Kryptoměny** — transakce v Bitcoinu a Ethereu jsou podpisy ECDSA.

### Autentizace pomocí certifikátů (certificate-based authentication)

Infrastruktura PKI ([[pki-uvod]]) buduje hierarchii důvěry:

- **CA** (certifikační autorita, Certification Authority) podepisuje certifikáty.
- **Certifikát** ([[x509]]) váže veřejný klíč k identitě.
- **TLS handshake** používá certifikát k autentizaci serveru.

Detaily v [[tls-aplikace]].

## Hybridní šifrování (KEM/DEM)

Asymetrické šifrování je na hromadné (bulk) šifrování *pomalé*. Proto se používá hybridní vzor:

1. **Asymetrická část** ustaví *náhodný* symetrický klíč (KEM = mechanismus zapouzdření klíče, Key Encapsulation Mechanism).
2. **Symetrická část** šifruje *vlastní* data (DEM = mechanismus zapouzdření dat, Data Encapsulation Mechanism).

```
Sender:
   K = random AES key
   E_K(data) = ciphertext        ← bulk via symmetric
   E_PK(K) = wrapped key         ← small, via asymmetric

Receiver:
   K = D_SK(wrapped key)         ← decrypt key via asymmetric
   data = D_K(ciphertext)        ← decrypt data via symmetric
```

Hybridní přístup používá každý moderní protokol (TLS, PGP, SSH, Signal). Detaily [[hybridni]].

## Útoky na RSA a chybné konfigurace

RSA má bohatou historii chyb v implementacích:

- **Bleichenbacher** (1998) — padding oracle u PKCS#1 v1.5 ([[rsa-utoky]]).
- **ROBOT** (2017) — oživení Bleichenbacherova útoku.
- **Coppersmith** — malé exponenty (`e=3` bez paddingu).
- **Společný modul (common modulus)** — sdílený modul při různých exponentech.
- **Chybné implementace** — pevně daný nonce u ECDSA v Sony PS3 (2010).

Detail v [[rsa-utoky]] a [[el-podpis]].

Obrana: používejte **RSA-OAEP** (nikoli PKCS#1 v1.5) a pro podepisování **RSA-PSS** (nikoli PKCS#1 v1.5).

## PKI v IS

**Infrastruktura veřejných klíčů (Public Key Infrastructure)** ([[pki-uvod]]) je institucionální rámec (framework) pro vydávání a odvolávání certifikátů.

Hierarchie:

- **Kořenová CA (Root CA)** — nejvyšší úroveň, podepsaná sama sebou.
- **Mezilehlá CA (Intermediate CA)** — podepsaná kořenovou CA, podepisuje koncové (leaf) certifikáty.
- **Koncový certifikát (leaf cert)** — server, osoba, zařízení.

Prohlížeče celosvětově důvěřují zhruba 150 kořenovým CA. Kompromitace kořenové CA způsobí, že všechny jí podepsané certifikáty jsou *podezřelé*.

[[revokace]] popisuje CRL, OCSP a Certificate Transparency.

## Web of Trust

Alternativa k hierarchické PKI: každý podepisuje certifikáty druhých lidí (PGP, OpenPGP). Důvěra vzniká *peer-to-peer*.

V podnikovém prostředí se nepoužívá — dominantní je hierarchická CA. Web of Trust žije v PGP komunitě pro decentralizované podepisování e-mailů.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=GSIDS_lvRv4" "Public Key Cryptography - Computerphile" "Computerphile"
:::

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Diffie, W., Hellman, M.E.: „New Directions in Cryptography" (IEEE Trans. IT 22(6), 1976); Rivest, R.L., Shamir, A., Adleman, L.: „A Method for Obtaining Digital Signatures and Public-Key Cryptosystems" (Comm. ACM 21(2), 1978); NIST PQC Standards 2024 ([csrc.nist.gov/projects/post-quantum-cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)); Bernstein, D.J., Lange, T.: „Post-quantum cryptography" (Nature 549, 2017).*
