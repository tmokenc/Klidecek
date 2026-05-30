---
title: ISO 7816 a komunikace s čipovou kartou
---

# ISO 7816 a komunikace s čipovou kartou

Pro studium útoků a obran čipových karet je nezbytné rozumět *jak se s kartou mluví*. ISO/IEC 7816 je rodina standardů, která specifikuje fyzické rozhraní, elektrický protokol, formát zpráv (APDU) a file system. Útoky na fault injection ([[glitch-utoky]]), padding oracle ([[padding-oracle]]) i API misuse ([[utoky-na-api]]) všechny pracují s APDU strukturami.

## Fyzické rozhraní

::: svg "Kontakty ISO 7816-2: C1=Vcc, C2=RST, C3=CLK, C5=GND, C6=Vpp (legacy), C7=I/O. C4 a C8 jsou volné nebo USB."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="120" y="20" width="60" height="40" rx="3"/>
    <rect x="200" y="20" width="60" height="40" rx="3"/>
    <rect x="280" y="20" width="60" height="40" rx="3"/>
    <rect x="360" y="20" width="60" height="40" rx="3"/>
    <rect x="120" y="80" width="60" height="40" rx="3"/>
    <rect x="200" y="80" width="60" height="40" rx="3"/>
    <rect x="280" y="80" width="60" height="40" rx="3"/>
    <rect x="360" y="80" width="60" height="40" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="150" y="38" font-size="11">C1</text>
    <text x="230" y="38" font-size="11">C2</text>
    <text x="310" y="38" font-size="11">C3</text>
    <text x="390" y="38" font-size="11">C4</text>
    <text x="150" y="98" font-size="11">C5</text>
    <text x="230" y="98" font-size="11">C6</text>
    <text x="310" y="98" font-size="11">C7</text>
    <text x="390" y="98" font-size="11">C8</text>
    <text x="150" y="52" font-size="10" fill="var(--accent)">Vcc</text>
    <text x="230" y="52" font-size="10" fill="var(--accent)">RST</text>
    <text x="310" y="52" font-size="10" fill="var(--accent)">CLK</text>
    <text x="390" y="52" font-size="10" fill="var(--text-muted)">USB D+</text>
    <text x="150" y="112" font-size="10" fill="var(--accent)">GND</text>
    <text x="230" y="112" font-size="10" fill="var(--text-muted)">Vpp</text>
    <text x="310" y="112" font-size="10" fill="var(--accent)">I/O</text>
    <text x="390" y="112" font-size="10" fill="var(--text-muted)">USB D−</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="270" y="148">3.0 V / 5.0 V napájení; CLK 1–5 MHz</text>
    <text x="270" y="166">I/O — half-duplex obousměrná linka</text>
    <text x="270" y="184">Vpp historicky 21 V pro EEPROM write — útok</text>
  </g>
</svg>
:::

Standardní rozložení 8 kontaktů ISO 7816-2:

* **C1 Vcc** — napájení 3.0 V (Class B) nebo 5.0 V (Class A); dnes 1.8 V Class C.
* **C2 RST** — reset signal.
* **C3 CLK** — hodinový signál (1–5 MHz typicky 3.5712 MHz pro SIM).
* **C4** — USB D+ (volitelné pro USB-CCID karty).
* **C5 GND** — zem.
* **C6 Vpp** — *historicky* 21 V pro EEPROM programming; *dnes nevyužito*, ale ponecháno z důvodu kompatibility. Útok přes Vpp ([[fyzicke-utoky]]) využíval, že odstranění Vpp zabránilo zápisu (např. čítače chyb PIN).
* **C7 I/O** — half-duplex sériová komunikace.
* **C8** — USB D− (volitelné).

Čtečka řídí RST, CLK, I/O; karta je pasivní (reaguje). Karta nemá vlastní hodiny ani napájení — vše dodává čtečka. To dává útočníkovi *kompletní* kontrolu nad fyzickým prostředím a otevírá fault injection útoky ([[glitch-utoky]]).

## Resetování a ATR

Po napájení karty čtečka:

1. Nastaví Vcc, CLK, RST = 0 (low).
2. Čeká ~40 000 hodinových cyklů na *stabilizaci* obvodů.
3. Uvolní RST (low → high).
4. Karta začne vysílat **ATR** (Answer To Reset) na I/O lince do 40 000 cyklů od uvolnění RST.

**ATR** je 2 – 33 bajtů. Obsahuje:

* **TS** — initial character: definuje convention (přímá nebo inverzní).
* **T0** — formát: počet historických bajtů + indikace, zda následují TA/TB/TC/TD bajty.
* **TA1, TB1, TC1, TD1** — protocol parameters (clock divider, programming voltage, guard time, protocol type T=0/T=1).
* **Historical bytes** — výrobce-specifické (jméno OS, verze, manufacturer code). Pro AID identifikaci karty (např. JCOP, MULTOS).
* **TCK** — XOR checksum (pro T=1 protokol).

Příklad ATR (Mifare DESFire EV3): `3B 81 80 01 80 80 90 00`. Z toho:

* `3B` — direct convention.
* `81` — T0: 1 historical byte, TD1 follows.
* `80 01` — TD1 + TA2: protocol T=1, specific mode.
* `80 80` — TD2: protocol T=15 (global parameters), TA3, TC3.
* `90 00` — historical byte + checksum.

ATR je *fingerprint* karty — útočník z něj vyčte typ čipu, OS, případně i firmware verzi.

## Komunikační protokoly

### T=0 (byte-oriented)

* Asynchronní bajt po bajtu.
* Half-duplex — karta nebo čtečka mluví, nikdy oba současně.
* Po každém přijatém bajtu strana může vrátit *parita error* (NAK), pak se bajt přeposílá.
* Pro každou komunikaci vyžaduje *odděleně* posílat command a *čekat* na response.

Používá se historicky a stále u SIM karet (GSM 11.14, ETSI 102.221).

### T=1 (block-oriented)

* Asynchronní blok bytů.
* Block structure: PROLOGUE (NAD, PCB, LEN) + INFORMATION + EPILOGUE (LRC nebo CRC).
* Lépe zvládá *delší* zprávy (vícebajtové APDU), pipelining, error detection.

Standardní volba pro moderní smart cards (EMV, eID, JavaCard).

### T=USB (USB CCID)

* USB Class for Chip Card Interface Devices.
* Karta připojená přes USB (klasický token, YubiKey, FIDO key) má interně USB CCID.

## APDU — Application Protocol Data Unit

Vlastní jednotka výměny zpráv. Dvě varianty:

### Command APDU (C-APDU) — od čtečky k kartě

::: math
\text{C-APDU} = \text{CLA} \mathbin\Vert \text{INS} \mathbin\Vert \text{P1} \mathbin\Vert \text{P2} \mathbin\Vert [L_c \mathbin\Vert \text{Data}] \mathbin\Vert [L_e]
:::

* **CLA** (1 B) — Class byte: kategorie příkazu (ISO standard, GlobalPlatform, propriety).
* **INS** (1 B) — Instruction: kód operace (SELECT FILE, READ BINARY, GET CHALLENGE, INTERNAL AUTHENTICATE, ...).
* **P1, P2** (2 × 1 B) — parametry instrukce.
* **Lc** (1 nebo 3 B) — délka data.
* **Data** — vstupní data (max 255 B v krátké formě, 65 535 B v rozšířené).
* **Le** (1 nebo 3 B) — *expected length* of response.

Čtyři cases:

* **Case 1** — no data in, no data out (např. SELECT, MANAGE CHANNEL).
* **Case 2** — no data in, data out (např. GET CHALLENGE, READ BINARY).
* **Case 3** — data in, no data out (např. VERIFY PIN, UPDATE BINARY).
* **Case 4** — data in, data out (např. INTERNAL AUTHENTICATE, ECB encrypt).

### Response APDU (R-APDU) — od karty k čtečce

::: math
\text{R-APDU} = [\text{Data}] \mathbin\Vert \text{SW1} \mathbin\Vert \text{SW2}
:::

* **Data** — výstupní data (length až Le z command APDU).
* **SW1 SW2** (2 B) — Status Words. Klíčový **error/success kód**:
  * `90 00` — Success (Normal processing).
  * `61 XX` — Success, XX další bajtů k dispozici (GET RESPONSE).
  * `6X XX` — Various warnings/errors:
    * `63 00` — verification failed (PIN wrong).
    * `63 CX` — PIN tries remaining: X.
    * `69 82` — security status not satisfied (PIN not verified).
    * `69 85` — conditions of use not satisfied.
    * `6A 82` — file not found.
    * `6A 86` — incorrect P1 P2.
    * `6D 00` — instruction not supported.
    * `6E 00` — class not supported.

Pozorování: **SW1 SW2 nese leak informaci** — `63 C2` (zbývají 2 pokusy) odhalí, kolik mám tries, což může vést k útoku (viz dále).

## Příklad transakce

```
> 00 A4 04 00 07 A0 00 00 00 03 10 10            (SELECT VISA AID)
< 6F 30 84 07 A0 00 00 00 03 10 10 A5 25 50 0B
  56 49 53 41 20 44 45 42 49 54 87 01 01 5F 2D
  02 65 6E 9F 12 0B 56 49 53 41 20 44 45 42 49
  54 90 00                                       (FCI + 90 00)

> 00 20 00 80 08 24 12 34 FF FF FF FF FF         (VERIFY PIN '1234' padded)
< 63 C2                                          (FAILED, 2 tries left)
```

::: viz apdu-builder "Vyber prikaz a sleduj, jak karta odpovi. Try VERIFY PIN s nespravnym PINem (3×) → uvidis '63 C2 → 63 C1 → 63 C0' leak; READ BINARY bez VERIFY vraci '69 82'."
:::

## File system

Klasický smart card OS spravuje hierarchický file system (ISO 7816-4):

* **MF (Master File)** — kořen, file identifier (FID) `3F 00`.
* **DF (Dedicated File)** — directory.
* **EF (Elementary File)** — file s daty:
  * **Transparent EF** — sekvence bajtů (READ BINARY, UPDATE BINARY).
  * **Linear Fixed** — záznamy fixní délky (READ RECORD).
  * **Linear Variable** — záznamy variabilní délky.
  * **Cyclic** — kruhový buffer (například log transakcí).

Každý file má **access conditions** — kdo a po jaké autentizaci ho smí číst/přepsat. *Špatně nastavené* AC jsou základem mnoha logických útoků ([[logicke-utoky]]).

## Secure messaging

Pro citlivé příkazy ISO 7816-4 definuje **secure messaging** (SM):

* APDU se *šifruje* sdíleným klíčem session key.
* Přidává se **MAC** (Message Authentication Code) pro integritu.
* Klíče vygenerovány během EXTERNAL/INTERNAL AUTHENTICATE.

Existují dvě úrovně:

* **SM (MAC only)** — integrita, ne důvěrnost. Lze odposlouchávat APDU, ale ne pozměnit je.
* **SM (full encryption + MAC)** — důvěrnost i integrita.

Eletronické pasy ([[elektronicke-pasy]]) používají BAC nebo PACE, které vytvoří SM kanál.

## Útočná plocha komunikace

* **APDU sniffing** — útočník s vlastní čtečkou nebo *shim* (tenká destička mezi kartu a legitimní čtečku) odposlouchává APDU. Bez SM jsou data plaintext.
* **APDU injection** — útočník vysílá vlastní APDU; pokud karta neimplementuje SM, akceptuje je.
* **Replay** — zachycení APDU a opakování. Mitigace: nonce v challenge.
* **Status word leak** — `63 CX` (zbývající pokusy PIN), `61 XX` (data length) — leak informace o vnitřním stavu.
* **Timing attacks** — různá doba odpovědi pro `90 00` vs. `63 C2` ([[casova-analyza]]).
* **Glitch** během odpovědi — útok na CLK/Vcc během fáze čekání na odpověď může způsobit, že karta odešle neplnohodnotnou data ([[glitch-utoky]]).

---

*Zdroj: BZA přednášky 2025/26, BZA 04 — Čipové karty. Externí reference: ISO/IEC 7816-4:2020 *Identification cards — Integrated circuit cards — Part 4: Organization, security and commands for interchange*; Rankl, W., Effing, W.: *Smart Card Handbook* (4th ed., Wiley 2010), kap. 7–9; GlobalPlatform: *Card Specification v2.3.1* — [globalplatform.org](https://globalplatform.org/specs-library/); ETSI TS 102 221 *Smart Cards; UICC-Terminal interface*.*
