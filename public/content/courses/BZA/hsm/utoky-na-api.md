---
title: Útoky na HSM API
---

# Útoky na HSM API

Fyzicky bezpečný HSM ([[realizace-bh]], [[fips-cc]]) lze stále kompromitovat **logickým útokem na jeho API**. Útočník nepotřebuje extrahovat klíče z čipu — stačí ho přimět, aby *legitimní cestou* poskytl tajné informace. PKCS#11 ([[pkcs11-api]]) má řadu historických problémů, které vedly k mass key compromises ve finančním sektoru. Slavné akademické paper [Bond-Anderson 2001](https://www.cl.cam.ac.uk/~rja14/Papers/keymgt.pdf) ukázalo, že *téměř všechny* tehdejší HSM API byly zranitelné.

## Klíčové principy útoků

* **Útok na klíče a jejich integritu** — recovery, modifikace, substitution.
* **Nedostatečná kontrola funkčních parametrů** — útočník volá funkci s neočekávanými parametry.
* **Nedostatečné vymáhání zásad PKCS#11** — funkční flags (CKA_SENSITIVE, CKA_EXTRACTABLE) nejsou důsledně kontrolovány.
* **Kompozice operací** — žádná jediná operace není problém; útok je *sekvence* operací s konkrétními parametry.

## Útoky proti PKCS#11

[*An Attack on a Recursive Authentication Protocol*](https://link.springer.com/content/pdf/10.1007%2F978-3-540-45238-6_32.pdf) (Clulow 2003) je seminální paper s katalogem útoků.

### Klíčové slabiny

* **Funkce jsou příliš "nízké úrovně"** — PKCS#11 dovoluje jemnou kontrolu, ale to znamená, že designér aplikace musí *správně* vymáhat policy. V praxi mnozí to neumí.
* **Se citlivými objekty lze manipulovat přímo** — pokud key má `CKA_EXTRACTABLE=true`, útočník ho může vytáhnout.

### Útok č. 1 — Wrap key attack

Útok na **C_WrapKey** funkci (export klíče zaobaleného v jiném klíči):

1. Útočník identifikuje cílový klíč (např. DES key s `CKA_EXTRACTABLE=true`).
2. **Generuje vlastní wrapping key** (`CKA_WRAP=true`).
3. Zavolá `C_WrapKey(wrap_mech, attacker_key, target_key)`. HSM vrátí *target_key* zašifrovaný *attacker_key*.
4. Útočník dešifruje wrapped data svým klíčem → plaintext target_key.

**Předpoklad útoku:** target key má `CKA_EXTRACTABLE=true`. To je *vlastnost klíče*, ale mnoho aplikací ji nastavuje *globálně* (např. všechny user keys mají `EXTRACTABLE=true` aby šlo dělat backup).

**Mitigace:** *strict policy* — kontrola, jaké klíče lze wrap kterým klíčem. PKCS#11 v2.40 přidalo `CKA_WRAP_TEMPLATE` a `CKA_UNWRAP_TEMPLATE`, které omezují wrapping.

::: viz pkcs11-wrap "Toggle CKA_EXTRACTABLE / CKA_SENSITIVE / wrap key type / mechanism. Sleduj, kdy utok prosel a kdy ho strict mode (PKCS#11 v2.40) zablokoval. Wrap key < target → DES brute force."
:::

### Útok č. 2 — Double-length DES key vázání

Klasický [Bond 2001 útok](https://www.cl.cam.ac.uk/~mkb23/research/Survey.pdf):

1. **Cílový klíč** je 3DES double-length (16 bytes, dvě DES-half-keys $K_1, K_2$).
2. Útočník zavolá `C_WrapKey` s **ECB mode** — wrap key in ECB encryption.
3. ECB zašifruje *each block independently* — 8-byte halves $K_1$ a $K_2$ samostatně.
4. Útočník rozdělí output na dvě části: $C_1 = E_{w}(K_1)$ a $C_2 = E_{w}(K_2)$.
5. **Brute force** každou half nezávisle — $2^{56}$ pro DES, *triviální* na moderním HW.
6. Recovery obou halves → kompletní 3DES klíč.

**Mitigace:** Nepoužívat ECB pro wrapping. Použít **CBC s IV** nebo dedicated **CKM_NIST_AES_WRAP** (AES Key Wrap, RFC 3394).

### Útok č. 3 — Chybějící ověření zabaleného klíče

Útočník může vytvořit *vlastní* wrapping key a požádat HSM o export pomocí něj:

1. `C_GenerateKey(attacker_wrap_key)` — vygeneruje vlastní wrap key. `CKA_WRAP=true`.
2. `C_WrapKey(attacker_wrap_key, target_key)`.
3. HSM nezkontroluje, zda *attacker* je oprávněný klíč zabalit; vykoná operaci.
4. Útočník dešifruje.

**Mitigace:** *audit auth* per operaci — kontrola, kdo je session principal a má-li oprávnění *vůči konkrétnímu klíči*.

### Útok č. 4 — Export delších klíčů pod kratšími

[Bond 2001]: 16-bajtový 3DES klíč exportován **8-bajtovým DES klíčem**:

* HSM má 3DES key + DES key.
* Útočník zavolá `C_WrapKey(des_key, 3des_key)`.
* DES klíč je *kratší* než 3DES, but PKCS#11 *historicky* nevynucovalo, že wrap key musí být >= target key length.
* Wrap proběhne — DES zašifruje 3DES klíč po blocích.
* DES klíč má 56-bit security, takže brute force odhalí celý DES *a* tedy i zabalený 3DES klíč.

**Mitigace:** PKCS#11 v2.40 vyžaduje, aby wrap key měl key length ≥ target. Komerční HSMs to vynucují.

### Útok č. 5 — Sensitive attribute bypass

`CKA_SENSITIVE=true` znamená, že hodnota klíče *nesmí* být získána plaintext. Ale:

1. Útočník `C_DeriveKey(target_key, mechanism, attrs)` — derives a *new* key from target.
2. V `attrs` nastavuje `CKA_SENSITIVE=false`, `CKA_EXTRACTABLE=true`.
3. HSM derives klíč; nový klíč *není* sensitive (per útočníkova konfigurace).
4. `C_GetAttributeValue` extrahuje plaintext nového klíče.

Pokud derivation function má *invertibilní* relationship k original klíči (XOR with known constant, simple hash), útočník recovery original.

**Mitigace:** *attribute inheritance* — nový klíč musí *dědit* `CKA_SENSITIVE=true` od parent.

## RSA padding oracle attack v HSM kontextu

[Bardou et al. 2012](https://hal.inria.fr/hal-00691958v2) viz též [[padding-oracle]]:

* HSM dešifruje wrapped klíč pomocí RSA-PKCS#1 v1.5.
* Pokud padding po dešifrování není *valid PKCS#1*, HSM vrátí specific error.
* **Padding oracle attack** — postupně modifikuje ciphertext, sleduje, kdy padding projde.
* **Bleichenbacher attack** rekonstruuje plaintext (encrypted klíč) bez znalosti RSA private key.
* **Výsledek:** recovery wrapped klíče za **30 minut na HSM**.
* Pokud HSM používá pomalejší dešifrování (smart card), může to být *hodiny / dny*.

**Mitigace:** *constant-time* padding check, *uniformly* error code pro padding fail i invalid key data, RSA-OAEP nebo RSA-KEM místo PKCS#1 v1.5.

## Tookan tool

[*Tookan: Token Analyzer*](http://secgroup.dais.unive.it/projects/tookan/) (Bortolozzo, Centenaro, Focardi, Steel 2010):

* **Automated tool** pro testování PKCS#11 implementations.
* Postup:
  1. Otestuje PKCS#11 token voláním více funkcí.
  2. *Automaticky vytváří formální model* tokenu.
  3. Spouští *model checker* a hledá útok.
  4. Pokusí se *provést útok* proti reálnému tokenu.
* Demonstrace: úspěšný útok na **>10 komerčních tokenů** (Aladdin eToken, RSA SecurID, ARX CoSign, ...).

Lessons learned: i komerční HSM od slavných vendorů má slabosti v API použití.

## Generování a ověřování PIN — historicky důležitý vektor

Banking HSM má **PIN management funkce** — generování PINů pro karty, ověřování PINů během transakce. Tyto funkce historicky obsahují bezpečnostní díry.

### IBM 3624 a IBM 3624 Offset

Klasický postup PIN generace:

1. Z **validation data** (typicky Personal Account Number, PAN) se vytvoří 16-byte input.
2. Input je šifrován **PIN Derivation Key** (PDK) v HSM. Pomocí DES.
3. Výstupní 16-byte se *zkracuje* na první 4 nibbles (4 hex digity).
4. **Decimalizace** — pomocí **decimalisation table** (DT) se hex digity převedou na decimal (`0123456789ABCDEF` → typicky `0123456789012345`).
5. Výsledek: 4-digit PIN.

**IBM 3624 Offset** je varianta:

* Zákazník volí *vlastní* PIN.
* HSM spočte generated PIN (IPIN — Intermediate PIN).
* Stored: `offset = customer_PIN − IPIN (mod 10 digit-wise)`.
* Ověření: `entered_PIN ≟ IPIN + offset`.

Offset (4 digity) lze uložit *plaintext* na kartě (není citlivé).

### Funkce pro verifikaci PINu

HSM funkce má parametry:

1. **CPB** — PIN Encryption / Decryption Key.
2. **PDK** — PIN Derivation Key.
3. **PIN block format** — jak je PIN strukturován v ciphertext.
4. **Validation data** — PAN.
5. **Encrypted PIN block (EPB)** — encrypted entered PIN z ATM.
6. **Method** — IBM 3624, IBM 3624 Offset, ANSI X9.8, etc.
7. **Data field** — *včetně decimalizační tabulky, validation data a offset*.

**Klíčové:** Samotný PIN *není* parametrem ověřovací funkce! HSM ho extrahuje z EPB pomocí CPB, derive expected PIN z PDK + PAN, porovná. Vrátí jen `OK` / `WRONG`.

### Útok — Decimalisation Table attack

[Bond-Zielinski 2003](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-560.pdf) viz též [[logicke-utoky]]:

* DT je *parametr* verifikační funkce, ne pevně daný.
* Útočník *modifikuje* DT a sleduje výsledek.

#### S known PIN

1. Útočníkův (atacker) PIN je `0000`. EPB pro `0000` zachytí.
2. **Zero DT** — `DT = 0000 0000 0000 0000`. Generated PIN pro libovolný PAN je `0000`.
3. PIN verifikace s EPB(`0000`) + zero DT → vrací `OK` *vždycky* (pro libovolný PAN).
4. Pro `Dᵢ` — DT s `1` na pozici `i`, jinde `0`:
   * Generated PIN = `1` pokud original PIN obsahoval digit `i`, jinak `0`.
   * Útok: pošle EPB(0000) s `Dᵢ`. Pokud verification fails → digit `i` *není* v PIN. Pokud succeeds → je.
5. Po 10 dotazech: *které digity* PIN obsahuje. Worst case `10⁴ → 6⁴ = 1296` permutací.

#### Bez known PIN (rozšířená varianta)

1. Útočník má EPB *zákazníka* (zachycené z ATM).
2. Pro `Dᵢ` — DT s `i-1` na pozicích, kde `Dorig` má `i` (např. `D₅ = 0123 4467 8901 2344`):
   * Generated PIN je *za 1 nižší*, pokud original PIN obsahoval digit `5`.
3. Pošle stejný EPB s incrementovaným offset (kompenzace).
4. Útočník identifikuje *pozici* každého digitu PIN.

**Komplexita:** *6 volání HSM* pro recover 4-digit PIN s různými digity.

::: viz decimalization-attack "Editj DT (16 hex → digit) nebo klikni 'standardni' / 'nulova' / 'D_i' presety. Sleduj jak nulova DT vraci '0000' pro libovolny hex (wildcard) a D_i tabulky odhalí, ktere digity PIN obsahuje."
:::

### Praktický scenário

* Útočník je *insider* banky s přístupem k HSM API (např. operator).
* Spustí PIN verification funkci se zachyceným EPB legitimního zákazníka + modifikovanou DT.
* Z 6 volání obnoví PIN bez znalosti CPB nebo PDK.
* Vstoupí do banky s vyrobenou kartou (UID legitimního customer) a recovered PIN → vybere prostředky.

### Mitigace

* **Kontrola DT** — HSM odmítne nestandardní DT (`0123456789012345` only allowed).
* **Field tagging** v Data field — DT i offset musí být součástí signed/MAC-protected datablock.
* **Banking HSMs od ~2005** implementují tuto kontrolu jako default.

## EMV-Hard ATR replay attack

Bond-Murdoch 2006 ukázali, že v některých banking HSM lze:

* Zachytit EMV transakční APDU.
* Replay-em obejít sequence number.
* HSM authorize duplicate transakci.

Útok je spíše *proti systému*, ne *proti HSM samotnému*; ale ukazuje, že **systémový design** se musí navrhovat s ohledem na *celou cestu* (HSM ↔ application ↔ network).

## Obrany — best practices pro HSM nasazení

* **Strict policy enforcement** — kontrola atributů per-operation (CKA_SENSITIVE, CKA_EXTRACTABLE, CKA_WRAP_TEMPLATE).
* **Audit logs** — *všechny* operace logged, *signed* pro integrity.
* **Role separation** — Crypto Officer vs. Crypto User. SO nemá přístup k user keys; User nemůže měnit policy.
* **M-of-N control** — pro citlivé operace (key generation, role assignment).
* **Custom firmware** — pokud možno, omezit API jen na *minimum* potřebných operací. Disable wrap/unwrap pokud aplikace nepoužívá.
* **PKCS#11 v3+ s strict mode** — opravy známých útoků.
* **Pravidelný audit** — penetration testing, formal verification (TLA+, Coq pro PIN management policies).

## Conclusion

HSM jsou *strong foundation* pro security infrastruktury, ale **API design + nasazení** je *minimálně tak důležité* jako fyzická bezpečnost. Historie ukázala, že nejhorší útoky jsou často *logické* — nikoli fyzické break-in, ale chytrá kombinace legitimních API calls. *Diverse APIs* (PKCS#11, KMIP, CNG, JCE, custom) zvyšují attack surface; *certification* pomáhá, ale není dostatečné (HSM mohou být FIPS 140-3 Level 4 a stále zranitelné na úrovni API).

---

*Zdroj: BZA přednášky 2025/26, BZA 09 — HSM (Malinka, Švenda). Externí reference: Bond, M., Anderson, R.: *API-Level Attacks on Embedded Systems* (IEEE Computer 2001) — [PDF](https://www.cl.cam.ac.uk/~rja14/Papers/keymgt.pdf); Bond, M., Zielinski, P.: *Decimalisation Table Attacks for PIN Cracking* (Cambridge UCAM-CL-TR-560, 2003) — [PDF](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-560.pdf); Clulow, J.: *On the Security of PKCS #11* (CHES 2003) — [PDF](https://link.springer.com/content/pdf/10.1007%2F978-3-540-45238-6_32.pdf); Bardou, R. et al.: *Efficient Padding Oracle Attacks on Cryptographic Hardware* (CRYPTO 2012) — [PDF](https://hal.inria.fr/hal-00691958v2/document); Tookan project — [secgroup.dais.unive.it/projects/tookan](http://secgroup.dais.unive.it/projects/tookan/).*
