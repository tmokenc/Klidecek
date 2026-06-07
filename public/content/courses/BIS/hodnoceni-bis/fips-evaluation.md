---
title: FIPS 140-3 — hodnocení kryptografických modulů
---

# FIPS 140-3 — kryptografická validace

**FIPS 140** (Federal Information Processing Standard 140) je americký standard pro *kryptografické moduly*. Aktuální verzí je **FIPS 140-3** (2019), která nahrazuje verzi 140-2 z roku 2001. Standard je *povinný* pro americkou federální vládu a v praxi se stal i průmyslovým standardem pro kryptografické moduly.

## Co je FIPS 140

Standard *nepředepisuje* konkrétní algoritmy ani protokoly. Místo toho předepisuje:

- **Schválené algoritmy (approved algorithms)** — například AES, SHA-2/3, RSA, ECDSA atd.
- **Generátory náhodných čísel (random number generators)** — schválené DRBG.
- **Strukturu modulu (module structure)** — fyzickou i logickou.
- **Vlastní testy (self-tests)** — při startu i na vyžádání.
- **Odolnost proti manipulaci (tamper resistance)** — pro vyšší úrovně.
- **Správu klíčů (key management)** — generování, ukládání i ničení klíčů.

Validace znamená, že *zkušební laboratoř* ověří shodu (compliance) se standardem a program NIST CMVP (Cryptographic Module Validation Program) následně vydá certifikát.

## Čtyři úrovně (Level 1–4)

Úrovně jsou hierarchické — Level 4 zahrnuje všechny požadavky (requirements) Level 3 a tak dále.

### Level 1 — základní

Minimální požadavky:

- Schválené algoritmy.
- Žádná zvláštní fyzická ochrana proti manipulaci (tamper protection).
- Postačuje čistě softwarové řešení (pokud běží na běžném operačním systému).

Příklady: FIPS modul OpenSSL, BoringSSL FIPS.

### Level 2 — viditelná manipulace (tamper-evident)

- Povrchové úpravy odhalující manipulaci (tamper-evident coatings) — pozná se, že se někdo do modulu pokoušel dostat.
- Autentizace (authentication) podle role (operátor, kryptografický důstojník — crypto officer).
- Postačuje vícečipový vestavěný (multi-chip embedded) modul.

Příklady: čipové karty (smart cards), USB tokeny (YubiKey FIPS).

### Level 3 — odolnost proti manipulaci (tamper-resistant)

- Odolnost proti manipulaci — modul *fyzicky* odolává pokusu o otevření.
- Autentizace na základě identity.
- Oddělení kryptografických operací od běžných výpočtů.
- Pevné pouzdro (zalití pryskyřicí, obvody pro detekci manipulace).

Příklady: hardwarové HSM (Thales nShield, Utimaco).

### Level 4 — aktivní reakce na manipulaci (tamper-active)

- *Aktivní* reakce na manipulaci — při detekci útoku modul klíče *vymaže*.
- EFP/EFT — ochrana proti selhání prostředí a její testování (environmental failure protection / testing).
- Vícefaktorová autentizace (multi-factor authentication).
- Plus vše z úrovně L3.

Příklady: špičkové HSM, moduly vojenské třídy.

::: svg "FIPS 140-3 čtyři úrovně"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="40" width="100" height="100" rx="4"/>
    <rect x="140" y="40" width="100" height="100" rx="4"/>
    <rect x="260" y="40" width="100" height="100" rx="4"/>
    <rect x="380" y="40" width="100" height="100" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="70" y="60">Level 1</text>
    <text x="190" y="60">Level 2</text>
    <text x="310" y="60">Level 3</text>
    <text x="430" y="60">Level 4</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="70" y="76">Basic</text>
    <text x="190" y="76">Tamper-evident</text>
    <text x="310" y="76">Tamper-resistant</text>
    <text x="430" y="76">Tamper-active</text>
  </g>
  <g fill="var(--text-faint)" text-anchor="middle" font-size="9">
    <text x="70" y="98">software</text>
    <text x="70" y="112">approved algos</text>
    <text x="190" y="98">smart card</text>
    <text x="190" y="112">role auth</text>
    <text x="310" y="98">HSM</text>
    <text x="310" y="112">strong enclosure</text>
    <text x="430" y="98">military HSM</text>
    <text x="430" y="112">active response</text>
  </g>
  <text x="270" y="170" text-anchor="middle" fill="var(--text-faint)" font-size="10">Cena vyšší. Vyšší úroveň pokrývá více útoků (side-channel, fault injection).</text>
</svg>
:::

## 11 oblastí hodnocení

FIPS 140-3 stanovuje požadavky v 11 oblastech:

1. **Specifikace kryptografického modulu** — hranice modulu, provozní režimy.
2. **Rozhraní kryptografického modulu** — vstup dat, výstup, řízení, stav.
3. **Role, služby a autentizace** — operátor, kryptografický důstojník.
4. **Bezpečnost software/firmware** — kontrola integrity, správa verzí.
5. **Provozní prostředí** — operační systém, hardwarová platforma.
6. **Fyzická bezpečnost** — viditelná manipulace / odolnost proti manipulaci / aktivní reakce.
7. **Neinvazivní bezpečnost** — odolnost proti útokům postranními kanály (side-channel), v 140-3 NOVĚ.
8. **Správa citlivých bezpečnostních parametrů** — generování, ukládání a ničení klíčů.
9. **Vlastní testy (self-tests)** — při startu i podmíněné.
10. **Záruka přes celý životní cyklus** — návrh, testování, dokumentace dodavatele.
11. **Zmírnění dalších útoků** — vstřikování chyb (fault injection), EMI/EMR atd.

Pro každou oblast existují *konkrétní* požadavky pro každou z úrovní L1–L4.

## Schválené algoritmy (approved algorithms)

FIPS 140-3 schvaluje *jen* určité algoritmy. Aktuálně:

### Symetrické (symmetric)

- **AES** (128, 192, 256bitový) — bloková šifra.
- **3-key Triple DES** — *zastaralý (deprecated)*, konec životnosti v roce 2023.
- Režimy AES: ECB, CBC, OFB, CFB, CTR, GCM, CCM, KW (key wrap), XTS.

### Hash

- **Rodina SHA-2** — SHA-224, 256, 384, 512.
- **Rodina SHA-3** — SHA3-224, 256, 384, 512.
- **SHAKE128, SHAKE256** — s rozšiřitelným výstupem (extendable output).

### Asymetrické (asymmetric)

- **RSA** — šifrování (OAEP), podepisování (PSS, PKCS#1 v1.5).
- **ECDSA** — křivky P-256, P-384, P-521.
- **EdDSA** — Ed25519, Ed448.
- **DH** — výměna klíčů Diffie-Hellman (vybrané grupy).
- **ECDH** — eliptická varianta DH.

### MAC

- **HMAC** se schváleným hashem.
- **CMAC** (MAC založený na blokové šifře).
- **GMAC** (Galois MAC, odvozený z GCM).

### DRBG

- **CTR_DRBG** (založený na AES-256).
- **HMAC_DRBG**.
- **Hash_DRBG**.

Podrobnosti najdete v [[blok-vs-proud]], [[rezimy]], [[3des-aes]], [[rsa]], [[elipticke]], [[hash-funkce]].

## CMVP — Cryptographic Module Validation Program

Program CMVP provozují NIST a CCCS (Kanada). Postup je následující:

1. Dodavatel zašle modul, bezpečnostní specifikaci (ST) a návrhovou dokumentaci do **laboratoře CST** (Cryptographic and Security Testing Laboratory).
2. Laboratoř CST modul otestuje proti standardu FIPS 140-3.
3. Zprávy putují k NIST CMVP.
4. CMVP vydá **validační certifikát**.
5. Modul je veden v seznamu **MIP** (Modules in Process), dokud není certifikován, poté přejde do **seznamu validovaných modulů**.

Doba trvání: 6–18 měsíců po podání žádosti. Cena: 100 000–500 000 USD.

## FIPS 140-2 vs. 140-3

| | 140-2 (2001) | 140-3 (2019) |
| :--- | :--- | :--- |
| Návaznost na standardy | pouze NIST | ISO/IEC 19790:2012 |
| Neinvazivní bezpečnost | neuvedena explicitně | sekce 7 explicitně |
| Software v hardwarovém prostředí | striktní | flexibilní |
| Validace OS | úrovně důvěryhodného OS | sladěno s CC |
| Platnost certifikátu | neomezená + přechodná období | obdobně |

Konec přechodného období pro 140-2: 21. září 2026 — k tomuto datu se všechny validace FIPS 140-2 přesunou do historického seznamu CMVP. Do té doby zůstávají platné moduly 140-2 i 140-3. (Nové žádosti podle FIPS 140-2 přitom přestaly být přijímány již 1. dubna 2022.)

## Vztah ke Common Criteria

| | CC | FIPS 140-3 |
| :--- | :--- | :--- |
| Rozsah | celý IT produkt | jen kryptografický modul |
| Standard | ISO/IEC 15408 | NIST + ISO/IEC 19790 |
| Cena | 100 tis.–5 mil. USD | 100–500 tis. USD |
| Doba trvání | 6–24 měsíců | 6–18 měsíců |
| Vzájemné uznávání | CCRA (mnoho zemí) | NIST + CCCS (USA + Kanada) |

Často se obojí *kombinuje*: čipová karta = CC EAL 5+ (celá karta) + FIPS 140-3 Level 2 (kryptografický modul uvnitř).

## Co FIPS *negarantuje*

- Že je modul *skutečně bezpečný* — mohou v něm být chyby v implementaci, neuvedené útoky postranními kanály (side-channel) i zcela nové útoky.
- Že je bezpečný váš systém — FIPS se týká jen kryptografického modulu, nikoli všeho ostatního.
- Že jde o *nejnovější osvědčené postupy* — FIPS je pomalý a nepokrývá moderní útoky (typu Spectre).

**FIPS = základní úroveň shody (compliance baseline), nikoli záruka bezpečnosti.**

## Americké federální nařízení (US Federal mandates)

Americké federální úřady (zákon FISMA z roku 2002, novelizovaný v roce 2014) *musí* pro tyto účely používat FIPS-validovanou kryptografii:

- Data při přenosu.
- Data v klidu (uložená).
- Autentizace.

Pokud kryptografický modul *není* FIPS-validovaný, federální úřad jej *nesmí* nasadit.

To je hlavní *obchodní motivace* pro FIPS — všichni dodavatelé chtějí na federální trh, a proto si moduly nechávají FIPS-validovat.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: NIST FIPS 140-3:2019 ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.140-3.pdf)); ISO/IEC 19790:2012 — Security requirements for cryptographic modules; [NIST CMVP](https://csrc.nist.gov/projects/cryptographic-module-validation-program); [Validated Modules List](https://csrc.nist.gov/projects/cryptographic-module-validation-program/validated-modules/search); Schneier, B.: „Applied Cryptography" (2nd ed., Wiley 1996), §24 (standards).*
