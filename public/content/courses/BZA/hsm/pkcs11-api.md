---
title: PKCS#11 a další HSM API
---

# PKCS#11 a další HSM API

HSM se používá *přes API* z aplikací. Standardní rozhraní **PKCS#11** je *de facto* univerzální (TLS knihovny, banking software, code signing), ale existují i platform-specifické (Microsoft CNG, Java JCE) a vendor-specific APIs. Volba API ovlivňuje portabilitu a útočnou plochu.

## Standardy

* **PKCS#11** — *Cryptographic Token Interface Standard* (OASIS, dříve RSA Labs). Definuje C API pro HSM, smart cards, USB tokens. *Standard de facto*.
* **PKCS#15** — *Cryptographic Token Information Format Standard*. Formát data v tokenu. Superseded ISO/IEC 7816-15.
* **KMIP** — *Key Management Interoperability Protocol* (OASIS). Network protocol pro key lifecycle management. Pro multi-vendor enterprise.
* **JCE / JCA** — *Java Cryptography Extension / Architecture*. Java API; HSM provideři dodávají *JCE provider* knihovny.
* **Microsoft CNG** — *Cryptography API: Next Generation*. Windows native, nahrazuje legacy CryptoAPI.
* **Microsoft CSP** — *Cryptographic Service Provider*. Starší Windows API; stále podporované pro legacy.
* **CCA** — IBM specific (Z-series mainframe).

## PKCS#11 architecture

::: svg "PKCS#11 stack: aplikace → libpkcs11.so (vendor-specific) → HSM přes proprietary protocol."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aP11" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="100" y="20" width="340" height="40" rx="6"/>
    <rect x="100" y="80" width="340" height="40" rx="6"/>
    <rect x="100" y="140" width="340" height="40" rx="6"/>
    <rect x="100" y="195" width="340" height="20" rx="6" fill="var(--bg-inset)" stroke="var(--text-muted)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="44" font-size="12">Aplikace (Apache, OpenSSL, JCE, custom code)</text>
    <text x="270" y="104" font-size="12">PKCS#11 standard API (C_*)</text>
    <text x="270" y="164" font-size="12">Vendor library (libCryptoki.so, eToken.dll, ...)</text>
    <text x="270" y="208" font-size="10" fill="var(--text-muted)">proprietary protocol (PCIe, network, USB) → HSM</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aP11)">
    <path d="M270,60 L270,76"/>
    <path d="M270,120 L270,136"/>
    <path d="M270,180 L270,194"/>
  </g>
</svg>
:::

* **Application** → volá *PKCS#11 functions* (`C_Initialize`, `C_OpenSession`, `C_FindObjects`, `C_Sign`, ...).
* **Vendor library** (.so / .dll) — implementuje PKCS#11 standard; pro každý HSM/token jiná. Distribuovaná vendorem, často placená.
* **Proprietary protocol** — vendor library → HSM přes specifický komunikační kanál (PCIe DMA, USB CCID, network TLS).
* **HSM** — fyzické zařízení.

Standardizace je *na úrovni API*; *implementace* je vendor-specific. To znamená, že aplikace s PKCS#11 *theoretically* portabilní, ale často potřebují drobné úpravy pro každého vendora.

## Funkcionality PKCS#11

Cryptoki standardizuje tyto skupiny funkcí:

### Slot a token management

```c
C_GetSlotList()        // list available slots (HSM partitions)
C_GetSlotInfo()        // info o slotu (description, manufacturer)
C_GetTokenInfo()       // info o tokenu (label, model, firmware version)
C_InitToken()          // reinitialize token (mass erase)
```

### Session management

```c
C_OpenSession()        // open session to slot
C_CloseSession()
C_Login(SO/USER, pin)  // authenticate
C_Logout()
```

PKCS#11 má **dvě role**:

* **SO** (Security Officer) — administrator, může nastavovat user PIN, modifikovat policy.
* **USER** — běžný uživatel, může používat klíče.

### Object management

PKCS#11 modeluje vše jako *objekty* s atributy:

* **CKO_PUBLIC_KEY**, **CKO_PRIVATE_KEY**, **CKO_SECRET_KEY** — kryptografické klíče.
* **CKO_CERTIFICATE** — X.509 certifikát.
* **CKO_DATA** — generická data (configuration, metadata).

```c
C_CreateObject(attrs)  // create new object
C_DestroyObject()
C_FindObjectsInit(template)  // start search
C_FindObjects()        // iterate
C_GetAttributeValue()  // read attributes
C_SetAttributeValue()  // modify attributes
```

Atributy zahrnují:

* **CKA_CLASS** — typ objektu.
* **CKA_KEY_TYPE** — RSA, ECDSA, AES, …
* **CKA_SENSITIVE** — true znamená "klíč nelze získat plaintext".
* **CKA_EXTRACTABLE** — true znamená "klíč lze exportovat (wrapped)".
* **CKA_SIGN, CKA_DECRYPT, CKA_WRAP, ...** — flags pro povolené operace.
* **CKA_TOKEN** — true = persistent storage, false = session-only.

### Cryptographic operations

```c
C_Encrypt() / C_Decrypt()    // šifrování/dešifrování
C_Sign() / C_Verify()        // podpis/ověření
C_Digest()                   // hash
C_GenerateKey() / C_GenerateKeyPair()
C_WrapKey() / C_UnwrapKey()  // export/import wrapped klíče
C_DeriveKey()                // KDF, ECDH
C_GenerateRandom()           // random bytes
```

### Mechanism

Každá operace specifikuje *mechanism* — algoritmus + parametry:

```c
CK_MECHANISM mech;
mech.mechanism = CKM_RSA_PKCS;     // RSA-PKCS#1 v1.5 sign
mech.pParameter = NULL;
mech.ulParameterLen = 0;
C_SignInit(session, &mech, key);
```

Mechanisms:

* `CKM_RSA_PKCS` — RSA-PKCS#1 v1.5.
* `CKM_RSA_PKCS_PSS` — RSA-PSS.
* `CKM_RSA_PKCS_OAEP` — RSA-OAEP padding.
* `CKM_ECDSA` — ECDSA.
* `CKM_AES_CBC` / `CKM_AES_GCM` / `CKM_AES_KEY_WRAP`.
* `CKM_SHA256_HMAC`.

PKCS#11 má **stovky** mechanism — historický sediment.

## Příklad — typický flow

```c
// 1. Initialize
C_Initialize(NULL);

// 2. Find slot, open session
CK_SLOT_ID slot;
C_GetSlotList(CK_TRUE, &slot, &slot_count);
C_OpenSession(slot, CKF_SERIAL_SESSION | CKF_RW_SESSION, NULL, NULL, &hSession);

// 3. Authenticate
C_Login(hSession, CKU_USER, "1234", 4);

// 4. Find existing key by label
CK_ATTRIBUTE search[] = {
    {CKA_CLASS, &class_priv, sizeof(class_priv)},
    {CKA_LABEL, "MyCAKey", 7}
};
C_FindObjectsInit(hSession, search, 2);
C_FindObjects(hSession, &hKey, 1, &count);

// 5. Sign data
CK_MECHANISM mech = {CKM_SHA256_RSA_PKCS, NULL, 0};
C_SignInit(hSession, &mech, hKey);
C_Sign(hSession, data, data_len, signature, &sig_len);

// 6. Cleanup
C_Logout(hSession);
C_CloseSession(hSession);
C_Finalize(NULL);
```

## Široké použití PKCS#11 {tier=practice}

* **TrueCrypt / VeraCrypt** — disk encryption.
* **Mozilla Firefox, Thunderbird** — pro client certs uložené v smart cards / tokens.
* **OpenSSL** — `engine_pkcs11` plugin.
* **OpenVPN** — TLS s HSM private key.
* **Apache mod_ssl** — TLS termination s HSM.
* **OpenSC** — open source PKCS#11 implementation pro common smart cards (PIV, OpenPGP, eID, GIDS).

## Microsoft CNG

**Cryptography API: Next Generation** — Windows native (Vista+):

* Long-term replacement legacy CryptoAPI.
* Modularní; vendoři poskytují *providers* (Cryptographic Primitives, Key Storage, …).
* API:
  * **Cryptographic Primitives** — symmetric, asymmetric, hash.
  * **Key Storage and Retrieval** — KSP (Key Storage Provider).
  * **Key Import and Export**.
  * **Data Protection API: Next Generation (CNG DPAPI)**.

Pro HSM provider dodává **KSP** (Key Storage Provider) DLL; Windows aplikace volá CNG, KSP přesměruje do HSM.

## Cryptographic Service Providers (CSP)

Generický framework s API pro providery kryptografické funkcionality:

* Konkrétní *implementation* RSA, ECDSA, atd.
* Různé underlying storage (software vs. hardware-based).
* Runtime selection — připojení k cílovému provideru (typicky identifikační string, např. *"Microsoft Base Cryptographic Provider v1.0"*).

**Microsoft CSPs** — vestavěné v Windows (Microsoft Strong, Microsoft Enhanced, etc.). Pro HSM dodává vendor.

**Java CSPs / JCE** — *Java Cryptography Extension*. Each HSM vendor poskytuje JCE Provider JAR file.

## Hraní s HSM bez HSM

Pro *test* a *development* (bez koupě fyzického HSM):

### SoftHSM

* Software-only HSM implementace; PKCS#11 API.
* Klíče v souborovém systému, ne v hardware.
* **Použití:** DNSSEC signing (open-source) — popularizoval ho [OpenDNSSEC project](https://www.opendnssec.org/softhsm/).
* GitHub: [Disig/SoftHSM2-for-Windows](https://github.com/disig/SoftHSM2-for-Windows).

**Nevýhoda:** *žádná* fyzická bezpečnost. Hodí se na test, ne na produkci.

### Utimaco HSM Simulator

* Simulátor fyzického HSM (s PKCS#11, JCE, CryptoServer SDK rozhraním).
* Útok-resistant pro vývoj a CI/CD.
* [hsm.utimaco.com/download/](https://hsm.utimaco.com/download/).

### Custom API — výhody i nevýhody

Některé výrobci HSM dovolují *custom API* (vlastní firmware uvnitř HSM):

**Pro:**

* Návrh API v souladu s use case (např. specifická operace pro banking).
* Focused API, no overhead — menší attack surface.
* Highly efficient implementace.

**Proti:**

* Security holes by design — vlastní API nemá history reviewů.
* High effort — vývoj + audit.
* *Lost certification* — Common Criteria je vázáno na *konkrétní* firmware version. Custom firmware = nová certifikace.

## Chip Authentication Program (CAP)

Příklad konkrétní use-case-specific API:

* **CAP** — od MasterCard (EMV-CAP), Visa Dynamic Passcode Authentication (DPA).
* Použití chip-based banking karty pro *autentizaci uživatele* (online banking, e-commerce).
* Designed pro backward compatibility — existující EMV karty lze použít s CAP readerem.
* Separate on-card applet *preferred*, but not required (může běžet jako sub-application v EMV).

Hardware CAP readers (Vasco DigiPass, dnes OneSpan) měly cca 50M+ deployed reading cards v UK, NL, BE.

---

*Zdroj: BZA přednášky 2025/26, BZA 09 — HSM (Malinka, Švenda). Externí reference: OASIS: *PKCS #11 Cryptographic Token Interface Specification* v3.1 (2023) — [oasis-open.org](https://docs.oasis-open.org/pkcs11/pkcs11-spec/v3.1/pkcs11-spec-v3.1.html); Microsoft Docs: *Cryptography API: Next Generation* — [docs.microsoft.com](https://learn.microsoft.com/en-us/windows/win32/seccng/cng-portal); Mavroudis, V. et al.: *Cryptographic API Misuse: A Case Study in PKCS#11* (USENIX Security 2018); SoftHSM project — [opendnssec.org/softhsm](https://www.opendnssec.org/softhsm/).*
