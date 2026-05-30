---
title: HSM — definice, vlastnosti, aplikace
---

# HSM — definice, vlastnosti, aplikace

**Hardware Security Module (HSM)** je dedikované hardwarové zařízení pro **bezpečné generování, ukládání a používání kryptografických klíčů**. HSM je *průmyslový* sourozenec čipové karty ([[architektura-typy]]) — větší, výkonnější, dražší, ale stejný princip: tajemství *nikdy* neopustí zařízení; všechny operace probíhají uvnitř.

## Definice

Z definice [NIST SP 800-57](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-57pt1r5.pdf):

> *A physical computing device that safeguards and manages digital keys for strong authentication and provides cryptoprocessing.*

Charakteristiky:

* **Fyzicky chráněné zařízení** ([[realizace-bh|multi-chip standalone module]]) — typicky 1U–4U server-grade box s vlastním napájením, kovovým krytem, tamper-detect mesh, baterií pro zeroization.
* **Generování klíčů** s plnohodnotným TRNG (AIS-31 PTG.3, viz [[ais31-tridy]]).
* **Bezpečné úložiště klíčů** — klíče zašifrovány master keys, master keys v HW tamper-resistant slotu.
* **Kryptografické operace** — šifrování, dešifrování, podpis, verifikace, MAC, hashování — *uvnitř* zařízení.
* **API** pro hostitelské aplikace — PKCS#11, KMIP, Microsoft CNG, JCE, vlastní libraries.
* **Certifikace** — FIPS 140-2/3, Common Criteria EAL ([[fips-cc]]).
* **Mass throughput** — 10 000+ RSA-2048 signatures/sec u high-end modulů.

## Aplikace

::: svg "Aplikace HSM: PKI/CA, payment processing, code signing, database encryption, blockchain, cloud KMS."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="30" width="160" height="50" rx="6"/>
    <rect x="200" y="30" width="160" height="50" rx="6"/>
    <rect x="380" y="30" width="140" height="50" rx="6"/>
    <rect x="20" y="100" width="160" height="50" rx="6"/>
    <rect x="200" y="100" width="160" height="50" rx="6"/>
    <rect x="380" y="100" width="140" height="50" rx="6"/>
    <rect x="20" y="170" width="160" height="50" rx="6"/>
    <rect x="200" y="170" width="160" height="50" rx="6"/>
    <rect x="380" y="170" width="140" height="50" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="50" font-size="12">PKI / Certifikační autority</text>
    <text x="100" y="68" font-size="10" fill="var(--text-muted)">CA root keys</text>
    <text x="280" y="50" font-size="12">Payment processing</text>
    <text x="280" y="68" font-size="10" fill="var(--text-muted)">EMV, ATM, POS</text>
    <text x="450" y="50" font-size="12">Code signing</text>
    <text x="450" y="68" font-size="10" fill="var(--text-muted)">Microsoft, Apple</text>
    <text x="100" y="120" font-size="12">Database encryption</text>
    <text x="100" y="138" font-size="10" fill="var(--text-muted)">TDE keys, Oracle</text>
    <text x="280" y="120" font-size="12">TLS termination</text>
    <text x="280" y="138" font-size="10" fill="var(--text-muted)">CDN, load balancers</text>
    <text x="450" y="120" font-size="12">Blockchain</text>
    <text x="450" y="138" font-size="10" fill="var(--text-muted)">crypto exchanges</text>
    <text x="100" y="190" font-size="12">Cloud KMS</text>
    <text x="100" y="208" font-size="10" fill="var(--text-muted)">AWS CloudHSM, Azure</text>
    <text x="280" y="190" font-size="12">eIDAS qualified signs</text>
    <text x="280" y="208" font-size="10" fill="var(--text-muted)">remote signing</text>
    <text x="450" y="190" font-size="12">DRM / contents</text>
    <text x="450" y="208" font-size="10" fill="var(--text-muted)">Netflix, Spotify</text>
  </g>
</svg>
:::

* **PKI / Certifikační autority** — root CA klíče (*nejcitlivější* klíče na světě). DigiCert, Let's Encrypt, Comodo, GeoTrust — všechny mají offline root CA v HSM v tamper-evident safes.
* **Payment processing** — EMV credentials, ATM card issuing, PIN management, ZKA processes. *Payment HSMs* (Thales payShield, Atalla AT1000) jsou specializované varianty.
* **Code signing** — Microsoft Authenticode, Apple Developer ID, Android signing keys. Compromised code signing keys (Stuxnet měl ukradené Realtek + JMicron certs) jsou *katastrofa*.
* **Database encryption** — Oracle TDE, SQL Server TDE, MariaDB. *Master encryption keys* uloženy v HSM.
* **TLS termination** — CDNs (Cloudflare, Akamai), load balancers (F5 BIG-IP) keep TLS private keys v HSM.
* **Blockchain / crypto exchanges** — Coinbase, Binance, Kraken — hot wallet keys v HSM (Ledger Vault, Fireblocks).
* **Cloud KMS** — AWS CloudHSM, Azure Dedicated HSM, Google Cloud HSM. Customer-managed encryption keys ("BYOK — Bring Your Own Key").
* **eIDAS qualified signatures** — EU regulace pro elektronický podpis vyžaduje *Qualified Signature Creation Device* (QSCD) → HSM.
* **DRM** — Netflix, Spotify, Hollywood studios používají HSM pro content protection keys (Widevine, FairPlay, PlayReady).

## Vlastnosti HSM

### Fyzická bezpečnost

* **Tamper-evident** — kryt zalitý epoxidem, plomby, screws s anti-removal coating. Otevření zanechá viditelnou stopu.
* **Tamper-resistant** — odolný materiál, anti-drill kov, ochrana proti X-ray imaging.
* **Tamper-detection** — sensors (mesh, vibrace, světlo, teplota, napětí). Při alarmu **automatic zeroization** v ms.
* **Tamper-response** — zeroization + log + LED alarm. FIPS 140-3 Level 4 vyžaduje aktivní reakci na *všechny* identifikované útoky.

### Logická bezpečnost

* **Role-based access** — Crypto Officer (CO), Crypto User (CU), Audit role. Multi-factor authentication (smart cards + PINs).
* **M-of-N control** — pro citlivé operace (Master Key change, factory reset, role assignment) vyžadováno *M* z *N* officers (např. 3 z 5).
* **Audit log** — všechny operace logged with timestamp, role, parameters. Tamper-evident log (signed).
* **Secure storage** — klíče zašifrovány *master keys* nikdy nevystupují plaintext.

### Performance

| Model | RSA-2048 sign/s | ECDSA P-256 sign/s | AES-256 GCM (MB/s) |
| :--- | :---: | :---: | :---: |
| **Thales nShield Solo XC** | 1 000 | 5 000 | 750 |
| **Thales Luna 7 PCIe** | 10 000 | 30 000 | 1 500 |
| **Utimaco SecurityServer Se** | 8 000 | 25 000 | 1 000 |
| **AWS CloudHSM Classic** | 1 000 | — | 250 |
| **AWS CloudHSM v2** | 5 500 | 7 000 | 850 |

Pro context: *single* modern CPU dělá ~50 000 AES-256 GCM MB/s (s AES-NI). HSM má specializované crypto-cores, ale total throughput je *omezený latency* (PCI roundtrips).

## Historie

* **1972** — IBM 3624 — první commercial *cryptographic facility* pro banking ATM. Specializovaný hardware pro DES PIN translation.
* **1989** — IBM **4753** Network Security Processor — programmable HSM, common ancestor moderních zařízení.
* **1989** — IBM **4755** Cryptographic Adapter — kryptografický adaptér rané éry HSM.
* **1996** — nCipher (UK, později Thales) — *commercial PKI HSMs*.
* **2003** — *Atalla AT1000* (HP) — payment HSM platform standard.
* **2013** — Amazon launched **CloudHSM** — first major cloud-based HSM service.
* **2018** — *Azure Dedicated HSM*, *Google Cloud HSM* launched.
* **2024+** — *Post-Quantum HSMs* (Kyber, Dilithium support).

## Form factory

* **PCIe karta** — vestavná do serveru (Thales Luna PCIe, Utimaco SecurityServer Se). Klasická forma; vyšší throughput, vyžaduje fyzický server.
* **Network HSM** — samostatné zařízení s Ethernet rozhraním (Thales Luna Network, Atos Trustway proteccio). Sdílené více aplikacemi; flexibilní.
* **Smart Card based** (nano-HSM) — YubiKey, Nitrokey HSM, Ledger HSM. Personální použití, do USB. ~10 podpisů/s; pro PKI tokens, code signing.
* **Cloud HSM** — managed service (AWS CloudHSM, Azure Dedicated HSM). Same fyzická HW, but provider operuje. SaaS model.
* **Mobile/embedded HSM** — TPM 2.0, Apple Secure Enclave, Google Titan M chip. Per-device HSM v telefonu / PC.

## HSM v cloudu

Cloudová varianta je dnes dominantní pro nové aplikace:

### AWS CloudHSM

* Cavium Nitrox HSM v AWS datacentru.
* Customer má **dedicated** HSM cluster (ne shared).
* FIPS 140-2 Level 3.
* PKCS#11, JCE, KSP APIs.
* ~$1.50/hodina cena.

### Azure Dedicated HSM

* Thales Luna Network HSM in Azure datacenter.
* FIPS 140-2 Level 3.
* Per-customer dedicated.

### Google Cloud HSM

* Marvell Liquid Security HSM.
* Integrované s Cloud KMS (KMS = software facade, HSM backend pro vysoce citlivé klíče).

### Klíčový architekturní vzor — BYOK

**Bring Your Own Key**:

1. Customer generuje klíč v *vlastním* HSM (on-prem).
2. *Wrapuje* (exportuje encrypted) klíč pomocí public key cloud HSM.
3. *Importuje* do cloud HSM.
4. Cloud HSM používá klíč; *unwrapped plaintext nikdy* neopustí cloud HSM.

To dovoluje customer udržet *control* nad klíčem (audit logs, revocation), zatímco používá cloud služby (latency, scalability).

## Limity HSM

* **Cena** — entry-level HSM je $5 000+, enterprise $50 000+.
* **Operational complexity** — vyžaduje trained CO/CU staff, fyzický audit prostor (safe with HSM).
* **Performance ceiling** — HSM má fixed throughput; pro high-scale operations (CDN, payment processors) může být bottleneck.
* **Lock-in** — některé features jsou vendor-specific (Thales-only, Utimaco-only). Migration mezi HSMs vyžaduje export/import s wrapping keys.
* **API útoky** ([[utoky-na-api]]) — i s perfectní fyzickou ochranou může API design dovolit logical útoky.

## HSM komerční hráči

* **Thales** — největší trh share. Luna (general purpose), payShield (payment), nShield (legacy).
* **Utimaco** — německý výrobce. SecurityServer (general), CryptoServer (banking).
* **IBM** — Z-series mainframe Crypto Express, Power Cryptographic Express.
* **Marvell (formerly Cavium)** — Nitrox; OEM pro AWS, Google.
* **Atalla (HP/Micro Focus)** — payment-specific.
* **Yubico** — YubiHSM (small-form, low-cost).
* **Nitrokey** — open-source HSM (Germany).
* **AWS, Azure, GCP** — cloud HSM offerings.

## HSM v ČR — eIDAS QSCD

EU regulace **eIDAS** vyžaduje pro *Qualified Electronic Signatures* (právně rovnocenné s vlastnoručním podpisem) *Qualified Signature Creation Device* (QSCD):

* **Local QSCD** — fyzický token / smart card (např. eOP, USB token PostSignum).
* **Remote QSCD** — HSM v poskytovateli s remote signing protocol. Uživatel autentizace přes mobile app (např. *I.CA Identita*).

V ČR oba modely v provozu; remote QSCD používá HSM s [Trustworthy Systems Supporting Server Signing (TS3S)](https://www.etsi.org/deliver/etsi_en/319400_319499/31941101/01.02.01_60/en_31941101v010201p.pdf) protokol.

---

*Zdroj: BZA přednášky 2025/26, BZA 09 — HSM (Malinka, Švenda). Externí reference: Anderson, R., Bond, M., Murdoch, S.: *Cryptographic Processors — A Survey* (IEEE 2006) — [PDF](https://www.cl.cam.ac.uk/~rja14/Papers/processors.pdf); NIST FIPS 140-3 — *Security Requirements for Cryptographic Modules*; Švenda, P.: *PV204 Hardware Security Modules* (MUNI FI 2024) — [course slides](https://crocs.fi.muni.cz/public/courses/pv204); Mavroudis, V., Cerulli, A., Svenda, P., Cvrcek, D., Klinec, D., Danezis, G.: *A Touch of Evil: High-Assurance Cryptographic Hardware from Untrusted Components* (CCS 2017).*
