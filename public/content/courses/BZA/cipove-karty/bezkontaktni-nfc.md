---
title: Bezkontaktní karty a NFC
---

# Bezkontaktní karty a NFC

Bezkontaktní (RFID) technologie se v posledních 15 letech rozšířila z exotiky na *dominantní* formu interakce — Apple Pay, Google Pay, bezkontaktní bankovní karty, MHD jízdenky, elektronické pasy, autoklíče, IoT sensory. Útoky se liší od klasických *contact* karet ([[fyzicke-utoky]]) — *vzdálenost* je nový parametr, *broadcast* je defaultní stav.

## Standardy

* **ISO/IEC 14443** — *proximity cards*, dosah do **10 cm**, 13,56 MHz.
  * **Typ A** — Mifare, většina EMV.
  * **Typ B** — některé eID, francouzská CB, čínská UnionPay.
* **ISO/IEC 15693** — *vicinity cards*, dosah do **1 m**, 13,56 MHz. Lower data rate (1.65 – 26.48 kb/s).
* **ISO/IEC 18092 + 21481** — NFC (Near Field Communication), 13,56 MHz, 106–424 kb/s, dosah ≤ 10 cm. Card emulation + peer-to-peer + reader mode.
* **EMV Contactless** — extension of EMV pro bezkontaktní platby ("paypass", "paywave").

## Fyzický princip

::: svg "Bezkontaktní karta: čtečka generuje 13,56 MHz pole, karta indukčně napájena, moduluje pole pro odpověď. Žádná baterie v kartě."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aNFC1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="60" width="180" height="120" rx="8"/>
    <rect x="340" y="60" width="180" height="120" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="110" y="90" font-size="12.5">čtečka (reader)</text>
    <text x="110" y="108" font-size="10.5" fill="var(--text-muted)">aktivní, napájena</text>
    <text x="110" y="126" font-size="10.5" fill="var(--text-muted)">cívka L₁</text>
    <text x="430" y="90" font-size="12.5">karta (PICC)</text>
    <text x="430" y="108" font-size="10.5" fill="var(--text-muted)">pasivní</text>
    <text x="430" y="126" font-size="10.5" fill="var(--text-muted)">cívka L₂ + IC</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <path d="M200,90 C260,30 280,30 340,90" marker-end="url(#aNFC1)"/>
    <path d="M340,150 C280,210 260,210 200,150" marker-end="url(#aNFC1)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10.5">
    <text x="270" y="50">13,56 MHz pole, ASK 100% modulation</text>
    <text x="270" y="200">load modulation, ~847 kHz subcarrier</text>
  </g>
</svg>
:::

* **Čtečka** vysílá 13,56 MHz pole; **karta** je v poli indukčně napájena (cca 1–5 mA, 3 V).
* **Reader → Card:** ASK modulace (Amplitude Shift Keying), 100 % depth (typ A) nebo 10 % depth (typ B).
* **Card → Reader:** *load modulation* — karta mění svou impedanci, což čtečka detekuje jako pokles amplitudy svého pole. Subkarrier na 847 kHz (typ A) nebo 819 kHz (typ B).
* **Bit rate:** 106–848 kb/s (typ A), 106 kb/s (typ B), až 424 kb/s pro NFC.

## Antikolizní procedura

Když na čtečku přijde *více* karet současně, je potřeba je rozlišit. ISO 14443-3 procedura:

1. **REQA** (`26`, 7 bitů) — všechny karty v poli odpoví **ATQA** (Answer To Request).
2. **Anti-collision loop** — *binary tree search* podle UID:
   * Čtečka pošle `SEL` (cascade level 1) + počet již známých UID bitů.
   * Karta odpoví zbytkem UID, pokud její prefix odpovídá.
   * Při kolizi (dvě karty s různými bity na stejné pozici) reader vybere jednu (např. tu s `0`) a opakuje.
3. **SAK** (Select Acknowledge) — finální výběr; vrací informaci o typu karty (UID complete, ne complete = potřeba cascade level 2).
4. Karta v *ACTIVE* stavu komunikuje, ostatní v *HALT*.

UID:
* **Single Size** (4 bytes) — Mifare Classic, starší karty.
* **Double Size** (7 bytes) — současný standard, nezbytné kvůli vyčerpání 4-bajtového prostoru.
* **Triple Size** (10 bytes) — řídké.

UID dnes nesplňuje "anti-cloning" požadavek — *magic Mifare* karty mají *přepisovatelné* UID.

::: viz nfc-anticollision "Reader vysila REQA, vsechny karty odpovi ATQA. Pri kolizi reader vybere bit (0 nebo 1) a karty s opacnym bitem prejdou do HALT. Klikej na 'pokracuj s bitem 0/1' a sleduj, jak se mnozina aktivnich kandidatu zuzuje az na jednu kartu."
:::

## Specifické hrozby bezkontaktního prostředí

### Odposlech (eavesdropping)

* **Dosah komunikace** — 10 cm; ale **dosah odposlechu** může být *podstatně větší* — *aktivní* karta moduluje pole, které lze zachytit do desítek centimetrů (s pokročilou anténou až 1+ m).
* **Mitigace:** šifrování komunikace mezi kartou a čtečkou (secure messaging, [[iso7816-komunikace]]). Bohužel u low-cost karet (Mifare Ultralight, levné jízdenky) chybí.

### Detekce a čtení bez vědomí uživatele (skimming)

* Útočník s **přenosnou čtečkou** (sponza, kabelka s vestavěnou cívkou) projde davem a aktivuje karty v peněženkách.
* Bezkontaktní bankovní karty *odpoví* na standardní APDU `SELECT AID` + `GET PROCESSING OPTIONS` — útočník získá *PAN*, *expiry date*, *cardholder name*.
* **Mitigace:** *Faradayova klec* (RFID-blocking peněženky); *PIN required for transactions > 25 EUR* (default, ale lze obejít split paying).

### Relay útok

Detailně viz [[keeloq]] (klíče k autům — stejný princip):

1. Karta v kapse oběti, čtečka v kavárně 50 m daleko.
2. Útočník 1 stojí blízko oběti s "fake terminal" (modulátor + RF tx).
3. Útočník 2 stojí v kavárně s "fake card" (anténa + RF rx).
4. Forward & backward — všechna data karty se v reálném čase přenášejí.

**Mitigace:** *distance bounding protocols* (Brands-Chaum 1993, Hancke-Kuhn 2005) — měření *kratičkých* round-trip times s nanosekundovou přesností; pokud RTT > offsetu kabelu o víc než 1 ns (~30 cm), transakce zamítnuta. **Mastercard PayPass** od 2014 implementuje [Relay Resistance Protocol](https://www.emvco.com/) — vyžaduje TLS-like *handshake* během fáze 1 s timing assertion.

### DoS — Denial of Service

* **Jamming** — kontinuální vysílání na 13,56 MHz; znemožní legitimní komunikaci.
* **Faradayova klec** — pokud útočník fyzicky obklopí kartu, znemožní čtení.
* **Zničení čipu** — silný EM impuls (UV laser, EMP gun) může zničit anténu nebo IC.

### Man-in-the-Middle (MITM)

* *Téměř neproveditelný* pro pasivní karty kvůli časovým ohraničením (FDT — Frame Delay Time je striktně limitován v ISO 14443-3).
* Relay (viz výše) je *MITM-like*, ale bez modifikace dat — jen propagace.

### Přerušení operace

* Útočník vytáhne kartu ze čtečky během transakce → karta je v *inkonzistentním stavu*.
* Pokud OS karty není ACID-compliant, **backup / backtracking** technika obnoví předchozí stav — útočník může udělat operaci a *vrátit* kartu zpět.
* **Mitigace:** atomic transactions (mark+commit), Globální Platform card manager s rollback support.

### Utajené transakce (relay = legitimní bez vědomí)

* Bezkontaktní karta neví, *kdo* ji čte ani *na co*. Tap u registry, tap na turniketu — pro kartu stejné.
* **Mitigace:** *silná obousměrná autentizace*, *interakce uživatele* (PIN pro vysoké částky, biometric on phone), *display+button on card* (Hardware OTP cards).

## NFC — varianty

### NFC reader/writer mode

* NFC zařízení (mobil) emuluje **čtečku** — přečte pasivní tag (NFC tag, ID card).
* Použití: Android Beam (historicky), tap-to-pair Bluetooth, NFC business cards.

### NFC card emulation

* Mobil emuluje **čipovou kartu** — terminal ho vnímá jako bankovní kartu, transit card, atd.
* Platformy:
  * **Apple Pay / Google Pay / Samsung Pay** — využívají *Secure Element* (SE) nebo *Host Card Emulation* (HCE).
  * **Secure Element (SE)** — hardware secure chip v telefonu (Apple) nebo v SIM (některé operátory). Klíče se *nikdy* nedostanou mimo SE.
  * **Host Card Emulation (HCE)** — emulace ve software, klíče v *Secure Storage* (Android KeyStore, iOS Keychain). Token-based (nikoli real PAN; viz tokenizace níže).

### NFC peer-to-peer

* Dva NFC-enabled telefony si přímo vyměňují data. Historicky NDEF přes LLCP. Dnes nahrazeno Wi-Fi Direct, AirDrop.

## NFC platby a tokenizace

Pro mobilní platby (Apple Pay, Google Pay) se nepoužívá *real PAN* (skutečné číslo karty), ale **token**:

* Při setup karta ve walletu se PAN nahradí *device-specific token* (DPAN).
* Při transakci se posílá DPAN + cryptogram, který je vázán na *device + transaction*.
* DPAN je *bezcenný* mimo daný telefon — i kdyby útočník odposlechl celou transakci, nemůže ji použít jinde.
* Banka má v *Token Service Provider* mapping DPAN → real PAN.

**Vícefaktorová autentizace** typická pro mobile pay:

1. *Něco máš* — telefon s SE/HCE.
2. *Něco víš/jsi* — odemčení telefonu (PIN/biometrika).
3. *Něco generuješ* — per-transaction cryptogram.

## Praktické nástroje pro útok i obranu {tier=practice}

* **Proxmark3** ($300+) — software-defined radio pro 125 kHz a 13,56 MHz. Sniffing, replay, emulace, fuzzing.
* **ChameleonMini** ($60) — emulátor karet, plně programovatelný, podporuje Mifare Classic, DESFire, Ultralight, ISO 14443.
* **Flipper Zero** ($170) — populární "hacker swiss army knife"; RFID, NFC, IR, GPIO.
* **NFC Tools** (Android app) — čtení/zápis tagů NFC; vhodné pro pen-test.
* **PN532 modul** (~$5) — Arduino-friendly NFC reader/writer.

Tyto nástroje jsou *legální* k vlastnictví, ale jejich použití na cizích kartách je trestné.

---

*Zdroj: BZA přednášky 2025/26, BZA 04 — Čipové karty. Externí reference: ISO/IEC 14443-1/2/3/4:2018 *Identification cards — Contactless integrated circuit cards — Proximity cards*; Hancke, G., Kuhn, M.: *An RFID Distance Bounding Protocol* (SecureComm 2005) — [PDF](https://www.cl.cam.ac.uk/~mgk25/sc2005-distance.pdf); Drimer, S., Murdoch, S. J.: *Keep Your Enemies Close: Distance Bounding Against Smartcard Relay Attacks* (USENIX Security 2007) — [PDF](https://www.cl.cam.ac.uk/~sd410/papers/sc_relay.pdf); EMVCo: *EMV Contactless Specifications for Payment Systems Book D — EMV Contactless Communication Protocol Specification* (v3.1, 2022).*
