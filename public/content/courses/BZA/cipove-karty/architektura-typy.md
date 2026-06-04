---
title: Architektura a typy čipových karet
---

# Architektura a typy čipových karet

Čipová karta je nejrozšířenější forma bezpečného hardware ([[realizace-bh|single-chip module]]) na světě. Vyrábí se v miliardách kusů ročně — bankovní karty (EMV), SIM/eSIM, identifikační dokumenty (občanské průkazy, pasy), zdravotní karty, městské karty, věrnostní programy. Pro člověka pracujícího v bezpečnosti je čipová karta *standardní* model pro studium útoků a obran, protože útoky proti ní jsou dobře dokumentované a vybavení k jejich realizaci dostupné.

## Cíle

Čipová karta řeší tři klasické bezpečnostní cíle:

* **Autentizace** — důkaz identity (občanský průkaz, SIM s IMSI, EMV s PAN).
* **Důvěrnost** — zabezpečení dat na kartě (zdravotní záznamy, kryptografické klíče).
* **Integrita** — neměnnost dat (PIN, jízdenkový kredit, certifikát).

Sekundární cíle:

* **Bezpečné uložení klíčů** — soukromý RSA/ECC klíč nikdy neopustí kartu; všechny operace probíhají uvnitř.
* **Kryptografické operace** — podepisování, dešifrování, MAC, key generation; karta je *crypto accelerator* pro hostitelské zařízení.

## Aplikace {tier=practice}

| Sektor | Použití |
| :--- | :--- |
| **Bankovnictví** | EMV chip-and-PIN, kontaktní + bezkontaktní platby |
| **Telekomunikace** | SIM/USIM/ISIM/eSIM, autentizace v GSM/UMTS/LTE/5G |
| **Identifikace** | občanský průkaz (CZ eOP), elektronický pas (ICAO 9303), zaměstnanecká ID |
| **Přístupové systémy** | bezkontaktní karty pro budovy, hotel zámky, MHD jízdenky |
| **Zdravotnictví** | eHealth karty (DE, FR, AT), recept karty |
| **Krypto úložiště** | PIV cards, YubiKey, OpenPGP card, FIDO2/WebAuthn hardware tokens |
| **DRM / placená TV** | konditional access karty (CAS) pro digital TV |

## Klasifikace podle integrovaných obvodů

::: svg "Klasifikace čipových karet: paměťové (straight, protected, stored-value) vs. mikroprocesorové (s OS, krypto, virtual machine)."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="240" height="180" rx="8"/>
    <rect x="280" y="40" width="240" height="180" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="140" y="62" font-size="12.5">Paměťové karty</text>
    <text x="140" y="78" font-size="10.5" fill="var(--text-muted)">"hloupé" — EEPROM + logika</text>
    <text x="400" y="62" font-size="12.5">Mikroprocesorové</text>
    <text x="400" y="78" font-size="10.5" fill="var(--text-muted)">"chytré" — CPU + OS + krypto</text>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10.5">
    <text x="32" y="106">• Straight Memory</text>
    <text x="42" y="120" fill="var(--text-muted)">jen čtení/zápis, žádná logika</text>
    <text x="32" y="142">• Protected Memory</text>
    <text x="42" y="156" fill="var(--text-muted)">PIN, write-protected zóny</text>
    <text x="32" y="178">• Stored Value</text>
    <text x="42" y="192" fill="var(--text-muted)">přeplaceno, decrement only</text>
    <text x="292" y="106">• Operační systém</text>
    <text x="302" y="120" fill="var(--text-muted)">JCOP, MULTOS, Native OS</text>
    <text x="292" y="142">• Krypto funkce</text>
    <text x="302" y="156" fill="var(--text-muted)">RSA, ECC, AES, SHA, RNG</text>
    <text x="292" y="178">• Java Card VM</text>
    <text x="302" y="192" fill="var(--text-muted)">applety, post-issuance loading</text>
  </g>
</svg>
:::

### Paměťové karty (memory cards)

* **Straight Memory Cards** — jen EEPROM s I/O. Žádná logika, žádná ochrana. Typicky předplatní telefonní karty 80. let, jednoduché identifikační tagy.
* **Protected Memory Cards** — paměť s ochranou (PIN, oblast read-only po zapsání, irreversible bit flip). Příklad: **SLE 4404** (Infineon, telefonní karty) — bit *jednotky* lze nastavit na "1" zaplacením, ale ne zpět na "0".
* **Stored Value Memory Cards** — speciální logika pro decrement-only. Dobíjení vyžaduje krypto autentizaci, ale samotné použití nepotřebuje crypto. Riziko: emulátory, mikrojehlové útoky ([[fyzicke-utoky]]).

Paměťové karty jsou *jednoúčelové* a *levné* (USD ~0,10), ale kryptograficky **nezabezpečené**. Skoro všechny *historické* hacky předplatních systémů (DOSPOL telefonní karty 90. let, satelitní TV) cílí na paměťové karty.

### Mikroprocesorové karty (smart cards)

* **CPU jádro** — typicky 8051, ARM SC100, ARM SecurCore, RISC-V s ochranami. 8–32 MHz.
* **Paměti:**
  * **ROM** — operační systém + krypto knihovny; neměnitelný (mask ROM).
  * **EEPROM/Flash** — user data, klíče, applety; ~100–500 kB.
  * **RAM** — pracovní paměť; ~4–16 kB.
* **Krypto koprocesory** — AES, 3DES, RSA-2048, ECC P-256, SHA-2/3 hardware engine. *Klíčové*: implementace odolná proti SPA/DPA ([[spa-dpa]]).
* **RNG** — hardware TRNG (AIS-31 PTG.3, viz [[ais31-tridy]]).
* **Senzory** — teplota, napětí, frekvence, světlo; alarm spustí zeroization.
* **OS** — JCOP (Java Card, NXP), MULTOS, nativní OS (Infineon SLE/SECORA, ST33).

Cena: USD 0,50 – 5 podle generace a certifikace.

## Klasifikace podle rozhraní

* **Kontaktní karty (contact)** — fyzický kontakt s čtečkou přes 8 pin pad (ISO 7816). Příklady: bankovní karty (klasický EMV chip), občanský průkaz, SIM.
* **Bezkontaktní karty (contactless)** — RF rozhraní na 13,56 MHz (ISO 14443 typ A nebo B) nebo 125 kHz (LF, starší přístupové karty). Napájeny indukcí. Příklady: Mifare ([[mifare-crypto1]]), bezkontaktní bankovní karta, MHD karty, elektronické pasy.
* **Hybridní (hybrid)** — dvě nezávislé čipové karty v jednom plastu, kontaktní + bezkontaktní; každá má vlastní funkce a OS.
* **Dual-interface (combi)** — jeden čip s oběma rozhraními. Příklad: většina současných EMV karet.
* **Multi-component** — více čipů spojených sběrnicí; vysokoúčelové aplikace (vládní eID s biometrií).

## Form factory

Standardy podle ISO/IEC 7810 definují fyzické rozměry:

* **ID-1** (85,60 × 53,98 mm) — klasická "bank card" velikost. Platební karty, občanské průkazy, řidičské průkazy.
* **ID-000** (25 × 15 mm) — *mini-SIM*, dlouho standard mobilů.
* **Micro-SIM** (15 × 12 mm) — od r. 2010.
* **Nano-SIM** (12,3 × 8,8 mm) — od r. 2012 (iPhone 5+).
* **eSIM / iSIM** — *embedded* SIM, soldered přímo do PCB telefonu; logicky stejná funkcionalita jako fyzická SIM, fyzicky neuvolnitelná.

## Standardy

### Funkční

* **ISO/IEC 7810** — fyzická charakteristika (rozměry, ohyb, teplota).
* **ISO/IEC 7816-1/2/3** — fyzická charakteristika čipových karet, kontakty (Vcc, GND, RST, CLK, IO), elektrické rozhraní a přenosové protokoly (T=0 bytově orientovaný, T=1 blokově orientovaný).
* **ISO/IEC 7816-4** — APDU command structure, file system, příkazy a bezpečnost ([[iso7816-komunikace]]).
* **ISO/IEC 7816-5/6/7/8/9/15** — různé pokročilé features (PIN management, biometric verification, USB integration, atd.).
* **ISO/IEC 14443-A/B** — bezkontaktní karty proximity (do 10 cm).
* **ISO/IEC 15693** — bezkontaktní *vicinity cards* (do 1 m).
* **ISO/IEC 18092** — Near Field Communication ([[bezkontaktni-nfc]]).

### Bezpečnostní

* **FIPS 140-2/3** — americký standard pro kryptografické moduly ([[fips-cc]]). Levely 1–4.
* **Common Criteria EAL** — mezinárodní rámec (ISO/IEC 15408). Smartcards typicky EAL4+ až EAL6+ (PP-0084 pro IC, PP-0035 pro OS).
* **EMVCo** — standardy pro platební karty (EMV chip, contactless, MPOS).
* **GlobalPlatform** — standardy pro management apletů (Card Manager, secure channel, post-issuance loading).

## Životní cyklus karty

1. **IC manufacturing** — výroba čipu (Infineon, NXP, ST, Samsung Foundry).
2. **OS loading / masking** — instalace operačního systému do ROM (mask ROM) nebo Flash.
3. **Pre-personalization** — naložení certifikátů výrobce, default klíčů, seriového čísla.
4. **Personalization** (Personalization Bureau) — instalace user-specific dat: PIN, jméno, fotka, kryptografické klíče. Často probíhá u třetí strany (Gemalto/Thales, IDEMIA, Giesecke+Devrient).
5. **Issuance** — předání karty uživateli.
6. **Active use** — užívání.
7. **Termination / revocation** — zneplatnění (ztráta, krádež, expirace).

V každé fázi má jiná strana přístup ke kartě a *jiné* riziko útoku. Personalization bureau je *velmi citlivé* místo — kompromitace tam = mass key compromise.

## Útočná plocha čipové karty

Útoky na čipové karty se rozdělují podle [klasifikace útoků]([[klasifikace-utoku]]) na:

* **Fyzické** ([[fyzicke-utoky]]) — microprobing, FIB, decap, laser fault injection.
* **Logické** ([[logicke-utoky]]) — protocol abuse, command sequence, file system bypass.
* **Postranní kanály** ([[spa-dpa]], [[em-kanal]], [[casova-analyza]]) — DPA, EMA, timing.
* **Chybové útoky** ([[glitch-utoky]], [[dfa-princip]]) — glitch, fault injection.
* **API útoky** ([[utoky-na-api]]) — abuse legitimního rozhraní (např. PKCS#11).

Reálná čipová karta čelí *kombinacím* těchto útoků; certifikace EAL5+ vyžaduje resistenci vůči všem.

---

*Zdroj: BZA přednášky 2025/26, BZA 04 — Čipové karty. Externí reference: Rankl, W., Effing, W.: *Smart Card Handbook* (4th ed., Wiley 2010) — kanonická reference; ISO/IEC 7816 a 14443 standards; EMVCo: *EMV Integrated Circuit Card Specifications for Payment Systems Book 1–4* — [emvco.com](https://www.emvco.com/specifications/); Henzl, M.: *BZA — Čipové karty*, FIT VUT (2019).*
