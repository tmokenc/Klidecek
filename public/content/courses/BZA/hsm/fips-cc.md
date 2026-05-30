---
title: FIPS 140 a Common Criteria
---

# FIPS 140 a Common Criteria

**FIPS 140** a **Common Criteria** jsou dva hlavní *certifikační rámce* pro kryptografické moduly a bezpečné zařízení. FIPS 140 je americký standard (NIST), zaměřený na konkrétní krypto-moduly. Common Criteria je mezinárodní (ISO/IEC 15408), aplikovatelný na *libovolný* IT produkt. Oba se v praxi *navzájem doplňují* — komerční HSM jsou typicky certifikovány v obou.

## FIPS 140 — Federal Information Processing Standard

### Historie

* **FIPS 140-1** (1994) — první standard pro kryptografické moduly v US federal sektoru.
* **FIPS 140-2** (2001) — major revize; dnes většina deployed HSMs.
* **FIPS 140-3** (2019, transition 2026) — současný standard; based on ISO/IEC 19790:2012. **FIPS 140-2 expired 2026-09-22**, nové certifikace pouze FIPS 140-3.

### Účel

* **Specifikuje bezpečnostní požadavky** pro kryptografické moduly.
* Aplikuje se na *cokoli, co obsahuje kryptografické funkce* — HSM, smart card chip, embedded SSL/TLS library, encrypted storage, ...
* **Povinné** pro US federal government (FISMA), Canadian federal government (ITSG-33), a *de facto* požadováno globálně (DoD, banking, telecom, healthcare).

### Bezpečnostní oblasti

FIPS 140-3 specifies 11 *security areas*:

1. **Cryptographic Module Specification** — co je modul, jeho boundaries.
2. **Cryptographic Module Ports and Interfaces** — definice rozhraní.
3. **Roles, Services, and Authentication** — kdo co může.
4. **Software / Firmware Security**.
5. **Operational Environment** — OS, runtime.
6. **Physical Security**.
7. **Non-invasive Security** (SCA resistance — DPA, TA).
8. **Sensitive Security Parameter Management** — key management, zeroization.
9. **Self-tests** — power-on tests, conditional tests.
10. **Life-cycle Assurance**.
11. **Mitigation of Other Attacks** — fault injection, EM, ...

### Levely

::: svg "FIPS 140-3 Levels 1-4: rostoucí požadavky na fyzickou ochranu, autentizaci, sensors, tamper response."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20"  y="50" width="120" height="130" rx="6"/>
    <rect x="150" y="50" width="120" height="130" rx="6"/>
    <rect x="280" y="50" width="120" height="130" rx="6"/>
    <rect x="410" y="50" width="120" height="130" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="80"  y="72" font-size="13">Level 1</text>
    <text x="210" y="72" font-size="13">Level 2</text>
    <text x="340" y="72" font-size="13">Level 3</text>
    <text x="470" y="72" font-size="13">Level 4</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="80"  y="96">software</text>
    <text x="80"  y="110">FIPS algoritmy</text>
    <text x="80"  y="124">no physical</text>
    <text x="80"  y="138">protection</text>
    <text x="80"  y="158" fill="var(--accent)">$X</text>
    <text x="210" y="96">+ tamper</text>
    <text x="210" y="110">evidence</text>
    <text x="210" y="124">role-based</text>
    <text x="210" y="138">authentication</text>
    <text x="210" y="158" fill="var(--accent)">$$X</text>
    <text x="340" y="96">+ tamper</text>
    <text x="340" y="110">resistance</text>
    <text x="340" y="124">identity-based</text>
    <text x="340" y="138">authentication</text>
    <text x="340" y="158" fill="var(--accent)">$$$X</text>
    <text x="470" y="96">+ tamper</text>
    <text x="470" y="110">response</text>
    <text x="470" y="124">+ environment</text>
    <text x="470" y="138">protection</text>
    <text x="470" y="158" fill="var(--accent)">$$$$X</text>
  </g>
</svg>
:::

**Level 1** — *minimal*:

* Pouze FIPS-approved kryptografické algoritmy.
* **Žádná fyzická ochrana** ani autentizace rolí.
* Software-only moduly (např. *OpenSSL FIPS module*, *Windows BitLocker* engine).
* Typicky $X cost certifikace.

**Level 2** — *commercial-grade* (entry-level HSM):

* **Tamper evidence** — fyzické známky tamper (seals, opaque coating).
* **Role-based authentication** — minimum PIN.
* Specifické OS requirements (Common Criteria EAL2 evaluated OS pro software moduly).
* Typicky $$X cost.

**Level 3** — *enterprise HSM* (Thales nShield Solo, Luna PCIe, Utimaco SecurityServer):

* **Tamper resistance** — fyzická opozice proti útoku.
* **Tamper detection** — *povinně*: sensors (mesh, voltage, ...). Při detekci **zeroization**.
* **Identity-based authentication** — multi-factor.
* **Separace identity dat** — plaintext krypto material *nikdy nesmí* opustit modul.
* **EFP/EFT** — Environmental Failure Protection / Testing — pro hardware moduly.

**Level 4** — *highest assurance* (vládní kritické systémy):

* **Tamper response** — *aktivně* reaguje na *všechny* identifikované fyzické útoky.
* **Environmental protection** — odolnost proti extrémním teplotám, napětí, EM impulzům.
* **High-assurance design assurance**.
* Většina komerčních HSMs *není* Level 4 (drahé certifikace, omezený trh). Typicky pouze pro vládní agentury (NSA, GCHQ, BSI).

### Certifikace proces

1. **Vendor** zveřejní *Security Policy* dokument.
2. **CSTL** (Cryptographic and Security Testing Laboratory; akkreditovaná NIST/NIAP) provede testy.
3. **CMVP** (Cryptographic Module Validation Program; NIST + CCCS Kanada) ověří a vydá *certificate*.
4. **Validation** je *bound na konkrétní firmware version* — update vyžaduje *novou* certifikaci.

V praxi: 6–24 měsíců, $50 000 – $500 000 v poplatcích.

### Approved algoritmy (FIPS 140-3)

Pouze tyto:

* **Symmetric:** AES (128/192/256), AES-GCM, AES-CCM, Triple-DES (deprecated po 2024).
* **Hash:** SHA-1 (deprecated for signatures), SHA-2 (224/256/384/512), SHA-3 (224/256/384/512), SHAKE.
* **MAC:** HMAC, KMAC, GMAC.
* **Asymmetric:** RSA (2048+), DSA (deprecated 2024), ECDSA (P-256, P-384, P-521), EdDSA, ECDH, DH (2048+).
* **Random:** SP 800-90A DRBGs (CTR_DRBG, HMAC_DRBG, Hash_DRBG).
* **Post-Quantum:** ML-KEM (Kyber, FIPS 203), ML-DSA (Dilithium, FIPS 204), SLH-DSA (SPHINCS+, FIPS 205) — od r. 2024.

Algoritmy *neschválené* (ChaCha20, BLAKE2, Argon2, ...) mohou být v modulu, ale nemohou být *aktivně použité* pro krypto operace v FIPS mode.

## Common Criteria (ISO/IEC 15408)

### Historie

* **1991** — TCSEC (US, "Orange Book"), ITSEC (Evropa) — předchůdci.
* **1996** — první CC v1.0 (US + Canada + UK + Germany + France + Netherlands).
* **1999** — ISO/IEC 15408.
* **2024** — CC:2022 (aktuální revize) — modernizace, alignment s STO terminologií.

### Účel

* **Mezinárodní rámec** pro hodnocení bezpečnosti IT produktů.
* Aplikuje se na *libovolný* produkt — operační systémy, databáze, firewall, smart cards, HSM, biometric devices.
* **CCRA** (Common Criteria Recognition Arrangement) — vzájemné uznání mezi ~30 zeměmi (vč. CZ, SK).

### Struktura certifikace

Klíčové pojmy:

* **TOE** (Target of Evaluation) — co se certifikuje (konkrétní produkt + verze).
* **PP** (Protection Profile) — *vlastnosti, které TOE musí splňovat*. Definované industry skupinami nebo regulátory.
* **ST** (Security Target) — *deklarace* vendora, jak jeho TOE splňuje PP.
* **EAL** (Evaluation Assurance Level) — *míra důvěry* v hodnocení; nezávislá na CONTENT funkcionality.

### EAL Levely

EAL definuje, *jak důkladně* je TOE hodnocen, ne *jak bezpečný* je. Vyšší EAL = víc důkazů (formal proofs, source code review, penetration testing).

::: svg "EAL 1-7: rostoucí důslednost hodnocení. EAL4 je 'commercial best'; EAL5+ vyžadují formální methods."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1">
    <rect x="20" y="50" width="64" height="50" rx="4"/>
    <rect x="92" y="50" width="64" height="50" rx="4"/>
    <rect x="164" y="50" width="64" height="50" rx="4"/>
    <rect x="236" y="50" width="64" height="50" rx="4"/>
    <rect x="308" y="50" width="64" height="50" rx="4"/>
    <rect x="380" y="50" width="64" height="50" rx="4"/>
    <rect x="452" y="50" width="64" height="50" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="52" y="72">EAL1</text>
    <text x="124" y="72">EAL2</text>
    <text x="196" y="72">EAL3</text>
    <text x="268" y="72">EAL4</text>
    <text x="340" y="72">EAL5</text>
    <text x="412" y="72">EAL6</text>
    <text x="484" y="72">EAL7</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="52" y="88">function.</text>
    <text x="124" y="88">structural.</text>
    <text x="196" y="88">method.</text>
    <text x="268" y="88">design</text>
    <text x="340" y="88">semi-formal</text>
    <text x="412" y="88">+ verified</text>
    <text x="484" y="88">formally</text>
    <text x="52" y="100">tested</text>
    <text x="124" y="100">tested</text>
    <text x="196" y="100">tested</text>
    <text x="268" y="100">tested</text>
    <text x="340" y="100">designed</text>
    <text x="412" y="100">design</text>
    <text x="484" y="100">verified</text>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="9.5">
    <text x="124" y="130">commercial</text>
    <text x="124" y="142">apps, kernels</text>
    <text x="268" y="130">commercial best</text>
    <text x="268" y="142">(most OS, DB)</text>
    <text x="340" y="130">smartcards,</text>
    <text x="340" y="142">HSM, eID</text>
    <text x="484" y="130">military,</text>
    <text x="484" y="142">crypto cores</text>
  </g>
</svg>
:::

* **EAL1** — *functionally tested*. Min effort. Verifikace specifikace.
* **EAL2** — *structurally tested*. Design review + black-box testing.
* **EAL3** — *methodically tested and checked*. + Configuration management.
* **EAL4** — *methodically designed, tested, and reviewed*. **Commercial "good practices"**. Většina Linux distrib, Windows, Oracle DB.
* **EAL5** — *semi-formally designed and tested*. **Smart cards, HSMs**. Začíná formal modeling.
* **EAL6** — *semi-formally verified design and tested*. High-assurance products.
* **EAL7** — *formally verified design and tested*. Cryptographic cores, military equipment.

V CC:2022 explicitně zdůrazněno, že EAL je orthogonální vůči security požadavkům — *EAL7 nevhodný produkt* může být *méně bezpečný* než EAL4 vhodný produkt. EAL měří *důslednost hodnocení*, ne security.

### Protection Profiles pro HSM/smart card

* **BSI-PP-0084** — Security IC Platform Protection Profile. Pro smart card chips (Infineon SLE 78, NXP P5CD, ST33). Vyžaduje **EAL4+ AVA_VAN.5** (highest level of vulnerability analysis).
* **BSI-PP-0035** — Smart Card OS Protection Profile.
* **BSI-PP-0086** — Cryptographic Service Provider PP.
* **CWA 14169** — pro Qualified Signature Creation Device (QSCD, eIDAS).
* **ICAO PP** — pro elektronické pasy ([[elektronicke-pasy]]).
* **NIAP HSM PP** — US-specific PP pro HSM.

### Augmentations

EAL může být *augmentovaný* — přidání konkrétních *Assurance Components*:

* **AVA_VAN.5** — vulnerability analysis with *highest* attacker resistance (státní úroveň).
* **ALC_FLR.3** — flaw remediation (vendor commits to patches).
* **AVA_VAN.5+** — kombinováno s SCA testing.

Smart card typicky **EAL5+** = EAL5 + AVA_VAN.5 + další.

### Vztah CC ↔ FIPS

* **CC** je *flexibilní rámec* — můžu certifikovat *cokoli*, definuji vlastní PP.
* **FIPS 140** je *konkrétní standard* — předdefinované požadavky, jen "ano/ne".

V praxi:

* **HSM** typicky CC EAL4+ s PP-0086 + FIPS 140-3 Level 3.
* **Smart card chip** CC EAL5+ s PP-0084.
* **TPM** CC EAL4+ s TCG PP + FIPS 140-2/3 Level 2.

## AIS-31 — RNG specifically

Pro **random number generators** v rámci CC certifikace platí:

* **AIS-31** ([[ais31-tridy]]) — BSI dokumentace klasifikující RNG.
* CC certifikace HSM/smart card s vlastním RNG **vyžaduje** AIS-31 hodnocení.
* Typicky **AIS-31 PTG.3** pro high-security tokens, **PTG.2** pro low-cost.

## Limity certifikace

* **Bound to specific firmware** — drobná oprava = nová certifikace = roky.
* **Vendor self-attestation** některých částí (Security Policy).
* **Snapshot v čase** — *neguaranuje* odolnost vůči *budoucím* útokům.
* **Nezachycuje misuse** — *certifikovaný* HSM s špatným uživatelským API nasazením *není bezpečný*.
* **Cost** přenášený na uživatele — drahá certifikace = drahé produkty.

Slavné případy:

* **Minerva** ([[casova-analyza]]) — EAL5+ certified karty leaks ECDSA klíče přes timing.
* **TPM-Fail** — FIPS 140-2 Level 2 TPMs s side-channel vulnerabilities.
* **ROCA** (Infineon RSALib) — *certifikovaná* knihovna generovala slabé RSA klíče (Coppersmith attack).

Lekce: **certifikace ≠ absolutní bezpečnost**. Je *necessary but not sufficient* baseline.

---

*Zdroj: BZA přednášky 2025/26, BZA 09 — HSM (Malinka, Švenda). Externí reference: NIST FIPS 140-3 — *Security Requirements for Cryptographic Modules* (2019) — [PDF](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.140-3.pdf); ISO/IEC 15408-1:2022 *Information security, cybersecurity and privacy protection — Evaluation criteria for IT security*; BSI: *Common Criteria — Protection Profiles for IT-Security Products* — [bsi.bund.de](https://www.bsi.bund.de/EN/Topics/Certification/certification_node.html); CMVP search: [csrc.nist.gov/projects/cryptographic-module-validation-program](https://csrc.nist.gov/projects/cryptographic-module-validation-program); Common Criteria portal: [commoncriteriaportal.org](https://www.commoncriteriaportal.org/).*
