---
title: Role kryptografie v IS
---

# Role kryptografie v IS — přehled

Kryptografie je *fundamentální* nástroj pro zajištění CIA + AAA v IS. Tato sekce shrnuje *roli* kryptografie v kontextu IS — technické detaily algoritmů najdete v navazujících kapitolách o kryptografii.

## Co kryptografie poskytuje

| Cíl bezpečnosti | Kryptografická technika | Technický detail |
| :--- | :--- | :--- |
| **Důvěrnost (confidentiality)** | symetrické + asymetrické šifrování (encryption) | [[blok-vs-proud]], [[principy]] |
| **Integrita (integrity)** | hash funkce, MAC | [[hash-funkce]], [[mac-hmac]] |
| **Autentizace (authentication)** | digitální podpis, MAC, výzva–odpověď (challenge-response) | [[el-podpis]], [[mac-hmac]] |
| **Nepopiratelnost (non-repudiation)** | digitální podpis | [[el-podpis]] |
| **Výměna klíčů (key exchange)** | DH, ECDH, hybridní KEM | [[dh-elgamal]], [[hybridni]] |
| **Generování náhodných čísel (random number generation)** | DRBG, TRNG | viz postranní kanály |

⇒ Kryptografie pokrývá *všechny* cíle CIA + AAA. Bez kryptografie není IT bezpečnost možná.

## Klasifikace algoritmů

| Třída | Princip | Příklady |
| :--- | :--- | :--- |
| **Symetrické** | sdílený klíč (key) | AES, ChaCha20 |
| **Asymetrické** | pár veřejný/soukromý klíč | RSA, ECC, EdDSA |
| **Hash** | bezklíčové, jednosměrné | SHA-256, SHA-3 |
| **MAC** | klíčový hash | HMAC-SHA256, Poly1305 |

Pro detailní taxonomii viz [[terminologie]] a [[klasifikace]].

## Útoky a modely

Kryptoanalýza dělí útoky (attack) podle *informací dostupných* útočníkovi (attacker). Klasické modely (detail v [[utoky-modely]]):

- **COA** (Ciphertext-Only Attack) — útok pouze se znalostí šifrového textu.
- **KPA** (Known Plaintext Attack) — útok se znalostí dvojic otevřený/šifrový text.
- **CPA** (Chosen Plaintext Attack) — útok s možností volby otevřeného textu.
- **CCA** (Chosen Ciphertext Attack) — útok s možností volby šifrového textu.

Moderní bezpečnost vyžaduje odolnost proti *všem* těmto modelům (bezpečnost typu IND-CCA2).

## Kerckhoffův princip

„*Bezpečnost závisí pouze na klíči, ne na utajení algoritmu.*" (Auguste Kerckhoff, 1883)

Důsledek: používejte *veřejně známé* algoritmy (AES, SHA-2/3), které prošly nezávislou recenzí odborníků (peer-reviewed). *Nevyvíjejte* vlastní „tajné" šifry — bezpečnost spoléhající na utajení (security through obscurity) nefunguje.

Detail [[kerckhoff]].

## Shannonovy principy

Claude Shannon (1949) formalizoval dva pojmy:

- **Confusion (zmatení)** — vztah mezi šifrovým textem a klíčem musí být *složitý* (zajišťuje substituce). Jinými slovy: z šifrového textu nesmí jít snadno odvodit klíč.
- **Diffusion (rozptyl)** — *malá* změna v otevřeném textu musí způsobit *velkou* změnu v šifrovém textu (zajišťuje permutace). Tím se vliv jednoho bitu rozptýlí do celého výstupu.

Moderní šifry kombinují confusion (S-boxy) a diffusion (P-boxy) → struktura SPN ([[feistel-spn]]).

## Kryptografie z pohledu IS

Z pohledu IS jde o to, *jak* kryptografii **používat**:

- **Zabezpečení přenosu (transport security)**: TLS ([[tls-aplikace]]), IPsec ([[vpn-ipsec]]).
- **Zabezpečení uložených dat (storage security)**: šifrování celého disku (full-disk encryption) — BitLocker, LUKS, FileVault.
- **Autentizace (authentication)**: hesla (uložená jako hash [[kdf]]), tokeny, certifikáty.
- **PKI**: certifikáty X.509 ([[x509]]), hierarchie certifikačních autorit (CA) ([[pki-uvod]]).
- **Podepisování kódu (code signing)**: digitální podpisy ([[el-podpis]]) pro integritu softwaru.
- **Zabezpečení e-mailu (email security)**: S/MIME, PGP.

Rozsah tohoto pohledu: nepíšeme *implementaci* AES — to spadá do kryptografického základu. Zde *navrhujeme*, kdy AES *použít* (šifrování úložiště), s jakými parametry (256bitový klíč, režim GCM) a *jak* spravovat klíče.

## Krypto-agilita

*Nezávisíme* na *jediné* šifře. Navrhujeme systém tak, aby šlo šifru *vyměnit*, když je prolomena:

- Vyjednávání v TLS (TLS negotiation) — server a klient se *dohodnou* na algoritmu.
- Hlavičky kryptografické sady (crypto suite headers) — identifikátory verze a sady.
- Migrační cesta (migrate path) — pokud je prolomeno SHA-1, *přeschvalte* certifikáty na SHA-256.

Příkladem je vývoj od `RSA-MD5-RC4` (90. léta) → `RSA-SHA1-3DES` (00. léta) → `ECDHE-RSA-SHA256-AES-GCM` (10. léta) → `EdDSA-Kyber-SHA3-ChaCha20-Poly1305` (20. léta a dále).

Přechod na postkvantovou kryptografii (post-quantum migration, [[postkvantova]]) je aktuálně *největší* výzvou pro krypto-agilitu.

## Místo kryptografie v IS architektuře

Kryptografie *není* všelék (silver bullet). Funguje *jako součást* většího systému:

- **Kryptografické primitivy** (AES, SHA, RSA) — *stavební prvky*.
- **Protokoly** (TLS, SSH, Kerberos) — *skládají* dohromady primitivy.
- **Infrastruktura** (PKI, KMS, HSM) — *provoz*.
- **Politika** (rotace klíčů, výběr algoritmu) — *řízení a správa (governance)*.

Mnoho útoků nevychází z prolomení šifry, ale ze *špatného použití*:

- **Špatně nakonfigurované TLS (misconfigured TLS)** — staré protokoly, slabé sady.
- **Natvrdo zapsané klíče (hardcoded keys)** — uložené přímo v binárce, přístupné přes reverzní inženýrství (reverse engineering).
- **Špatná náhodnost (bad random)** — implementační chyby (Debian OpenSSL 2008, Sony PS3 ECDSA).
- **Postranní kanály (side channels)** — časování, cache, elektromagnetické vyzařování (detaily v [[spa-dpa|postranní kanály]]).
- **Provozní chyby (operational mistakes)** — zalogování klíčů, únik přes ladicí výstup.

Obrana: knihovny *bezpečné už ve výchozím nastavení* (secure-by-default) — libsodium, age, BoringSSL, audit kódu a modelování hrozeb (threat modeling).

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Stallings, W.: „Cryptography and Network Security" (8th ed., Pearson 2020); NIST SP 800-175B — Guideline for Using Cryptographic Standards ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-175Br1.pdf)); Schneier, B.: „Applied Cryptography" (2nd ed., Wiley 1996).*
