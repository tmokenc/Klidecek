---
title: Logické útoky na čipové karty
---

# Logické útoky na čipové karty

*Logické útoky* (logical attacks) využívají *legitimního* rozhraní karty, ale způsobem, který designér nepředvídal. Útočník nemusí čip otevřít, nepotřebuje drahé vybavení — stačí čtečka, počítač a porozumění protokolu. Útoky jsou tiché, opakovatelné, často nezanechávají stopu.

## Klasifikace

* **Protocol abuse** — nestandardní sekvence APDU, využití nepublikovaných příkazů.
* **Race conditions** — výjimečné stavy karty (přerušený zápis, výpadek napájení).
* **Padding oracle** ([[padding-oracle]]) — leak informace přes různé chybové zprávy.
* **Replay** — opakování zachycené komunikace bez nonce.
* **Reflection** — obrácení challenge zpět k vydavateli.
* **EMV-specific** — útoky na specifika platebního protokolu.

## Útok č. 1 — Mondex (1996)

Britský systém elektronické peněženky [Mondex](https://en.wikipedia.org/wiki/Mondex) (1990, NatWest Bank, později MasterCard) byl jeden z prvních *off-line* digitálních peněz. Karty si mezi sebou *přímo* posílaly peníze přes terminal.

Slabiny:

* **Žádný "hot list"** — kompromitovaná karta nemohla být centrálně zablokována.
* **Žádná online autorizace** — transakce probíhaly mezi kartami bez serveru.
* **Testovací pojistka v čipu Hitachi H8/3101** — zkrat přes [microprobing]([[fyzicke-utoky]]) → testovací režim → dump celé paměti, včetně klíčů.
* **Klíče sdíleny mezi kartami** — kompromitace jedné karty dovolila tisknout peníze na ostatní.

NatWest požádal EFF o stažení memoranda popisujícího útoky, hrozil žalobou. Mondex argumentoval *"Fit for purpose"* — ale purpose nebyl definován v bezpečnostní politice. Mondex byl odstaven kolem 2001 po neúspěšných pokusech v USA, Kanadě, Hong Kongu.

Lekce: **off-line elektronická peněženka je zranitelná** — jakýkoli replay nebo klonování přímo vytvoří peníze. Současné systémy (Apple Pay, Google Pay) jsou *online* nebo s *transaction-bound* tokeny.

## Útok č. 2 — Murdoch-Drimer EMV (2010)

[*Chip and PIN is Broken*](https://www.cl.cam.ac.uk/~rja14/Papers/oakland10chipbroken.pdf) (Murdoch, Drimer, Anderson, Bond — Cambridge):

Útok cílí na **offline PIN verification** v EMV — mód, kde karta sama ověřuje PIN bez kontaktu s bankou.

### EMV protocol fáze

1. **Authentikace karty** (SDA/DDA/CDA) — terminál ověří autenticitu karty.
2. **Verifikace identity držitele**:
   * **Online PIN** — PIN šifrován a poslán bance.
   * **Offline PIN** — PIN poslán plaintextem nebo šifrovaný kartě; karta ověří.
   * **Signature** — papírový podpis.
   * **No CVM** — žádné ověření (low-value).
3. **Autorizace transakce** — karta generuje *Application Cryptogram* (AC) pro odeslání bance.

### Útok

V offline PIN módu karta vrátí terminálu jednu z:

* `90 00` — PIN OK.
* `63 CX` — PIN špatně, X pokusů zbývá.

Útočník vloží mezi kartu a terminál **MITM zařízení** (modifikovaná čtečka, "shim"):

1. Terminál pošle `VERIFY PIN <X>`.
2. Útočník **nepustí** příkaz na kartu, nebo dostane `63 CX`.
3. Útočník **odpoví terminálu** falešným `90 00` — PIN OK.
4. Terminál pokračuje a karta generuje AC bez vědomí, že PIN nebyl ověřen.
5. Karta zaznamená v AC, že *žádné* CVM bylo úspěšné, ale terminal myslí, že to byl PIN.

**Banka tento mismatch nedetekovala** v r. 2010 — autorizace transakce byla úspěšná. Demonstrované v BBC Newsnight, otevřená diskuze v UK Parliament.

::: viz emv-shim "Krokuj transakci s shim mezi kartou a terminalem. Sleduj, jak terminal hlasi 'PIN OK' v TVR, ale karta v IAD vraci 'no CVM' — mismatch, ktery banky pred 2013 neoverovaly."
:::

Mitigace (EMV od 2013): **iCVV** + *Combined DDA / AC generation* (CDA) — karta podepisuje hash CVM výsledku spolu s AC; banka může mismatch detekovat.

## Útok č. 3 — Padding oracle (Vaudenay 2002)

Viz samostatný subtopic [[padding-oracle]]. Stručně:

* CBC padding (PKCS#7 nebo RFC2040) musí dešifrovat dlouhou zprávu.
* Karta vrací různé chybové kódy pro:
  * **Bad padding** (formát po dešifrování špatný).
  * **Bad MAC** (formát OK, MAC ověření failed).
* Útočník volí padělané ciphertexty a podle reakce karty rekonstruuje plaintext **bez znalosti klíče**.
* Praktická aplikace na PKCS#11 HSM (Bardou et al. 2012, viz [[utoky-na-api]]) — útok proběhne za **30 minut**.

## Útok č. 4 — Decimalization table attack (Bond-Zielinski 2003)

[*Decimalisation table attacks for PIN cracking*](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-560.pdf) — útok na **HSM funkci pro verifikaci PIN** v bankovním backendu (nikoli na samotnou kartu, ale na HSM, který PIN verifikuje).

### Klasický postup IBM 3624

Banka má v HSM **PIN derivation key** (PDK). PIN se generuje z čísla účtu (PAN):

1. PAN šifruje se PDK pomocí DES.
2. Z výsledku se vezme první 4 hex číslice.
3. **Decimalizační tabulka** (DT) převede hex na decimal — typicky `0123456789ABCDEF → 0123456789012345`.
4. Výsledné 4 decimaly = generovaný PIN (případně + offset, který uživatel volí).

### Útok

Útočník má přístup k HSM API a může volat verifikační funkci s libovolnou DT (parametr funkce). Pokud zadá `DT = 0000000000000000`:

* Decimalizace vždy dá `0000`.
* Pokud uživatelův PIN je `0000`, verifikace projde s libovolným PINem.

Postup pro recover PIN:

1. Volá funkci s `EPB`, `DT = 1000000000000000` (jen `1` → digit 1). Pokud zacelí výsledek, PIN obsahuje 1.
2. Postupně pro všech 10 digits + offsets — odhalí *které* digits obsahuje PIN i kolikrát.
3. **Recover full 4-digit PIN v průměru za ~ 15 volání** HSM funkce (oproti ~5000 u naivního brute-force), s ohraničeným worst case.

Toto byl jeden z prvních útoků, kdy *legitimní API HSM* dovolilo recover PIN bez znalosti klíče. Banky po publikaci útoku přidaly *políčko v request*, který kontroluje DT proti standardní hodnotě; pokud se liší, request je odmítnut.

## Útok č. 5 — 3D-Secure (Verified by Visa / SecureCode), Murdoch-Anderson 2010

[*Verified by Visa and MasterCard SecureCode: Or, How Not to Design Authentication*](https://www.cl.cam.ac.uk/~rja14/Papers/fc10vbvsecurecode.pdf):

3D-Secure (Verified by Visa, MasterCard SecureCode) měla v rané verzi:

* Iframe na merchant page, redirect na bankovní auth server.
* Uživatel zadal *jiné heslo* než ke svému online banking.
* Žádné mutual authentication — phishing iframe na falešné stránce nelze rozpoznat.

Útok:

1. Útočník provozuje fake merchant.
2. Při check-out otevře skutečný 3D-Secure iframe, ale vloží vlastní phishing nadiframe.
3. Uživatel zadá kombinaci, kterou útočník zachytí.

3D-Secure 2.0 (2017+) přidalo *out-of-band* autentizaci (push na mobil, biometrika) a *device fingerprinting*.

## Útok č. 6 — Replay & cloning v MIFARE Ultralight

[Mifare Ultralight](https://www.nxp.com/products/rfid-nfc/mifare-hf/mifare-ultralight:MC_43841) je nejlevnější bezkontaktní karta NXP — bez krypto operací, jen 64 bajtů paměti, 4-bajtové UID, jeden *one-time-programmable* (OTP) counter.

Použití: jednorázové jízdenky, jednodenní festival pass.

Klonování:

1. Útočník přečte celou Ultralight kartu (standardní `READ` APDU).
2. Naprogramuje **Magic Mifare** kartu (~$2) s *přepisovatelným* UID a obsahem.
3. **Klon** je *bit-perfectný* — terminal nerozezná.

Mitigace: server-side database s *transaction history*; pokud se "stejná" karta objeví na dvou různých místech ve stejný okamžik, oba se zablokují. Ale: u jednodenních pass-ů to nepomáhá, jen zabrání masivnímu zneužití.

## Útok č. 7 — Default PIN/Password

Mnoho karet je *issued* s default credentials, které nikdy nikdo nezmění:

* **Mifare Classic default keys** — `FF FF FF FF FF FF`, `A0 A1 A2 A3 A4 A5`, `D3 F7 D3 F7 D3 F7`. Útok `mfoc` jejich pomocí klonuje karty během minuty.
* **EMV default Key A** (testovací cards) — v některých výrobních lotech byly zachovány.
* **PIN 1234, 0000** — bankovní karty stovkám zákazníků.

Tyto nejsou *útoky v užším smyslu*, ale problémy provozu.

## Útok č. 8 — Brute force PIN přes API

Klasické: PIN je 4 decimaly = 10 000 možností. Karta drží *čítač chybných pokusů*; při překročení (typicky 3) se zablokuje.

Útok:

* **Reset Vpp** ([[fyzicke-utoky]]) — odstraní napájení EEPROM před zápisem čítače. Karta verifikuje, zjistí špatný PIN, *ale nezapíše* zvýšení čítače. Útočník může zkoušet do nekonečna.
* **Glitch** ([[glitch-utoky]]) na CLK během zápisu čítače — instrukce přeskočena.
* **Power glitch** těsně po vrácení error code — instrukce inkrementu nevykonána.

Mitigace: zápis čítače **před** verifikací PIN (nezpětně decrement po úspěchu); použití *write-then-verify* paradigm; redundantní storage čítače (3 kopie, majority vote).

## Lekce {tier=extra}

1. **Logické útoky jsou nejlevnější.** Nepotřebují HW lab, vybavení, čas. Pokud nejsou v threat modelu, *padnou jako první*.
2. **API design je security boundary.** Každá funkce, která vrací status code, je potenciální oracle. Konstantní časy odpovědi, sjednocené error messages.
3. **Audit kompletních sekvencí, ne jen jednotlivých commandů.** Murdoch-Drimer EMV byl možný, protože *na úrovni jedné transakce* všechno vypadalo OK; útok byl ve *sekvenci výměn*.
4. **Default credentials = no credentials.** Personalization musí *vždy* vygenerovat unikátní klíče.
5. **Server-side validation** je vždy nutná pro vysokohodnotné transakce. Klientskou kartu lze klonovat; server nemůže.

---

*Zdroj: BZA přednášky 2025/26, BZA 04 — Čipové karty. Externí reference: Murdoch, S. J., Drimer, S., Anderson, R., Bond, M.: *Chip and PIN is Broken* (IEEE S&P 2010) — [PDF](https://www.cl.cam.ac.uk/~rja14/Papers/oakland10chipbroken.pdf); Bond, M., Zielinski, P.: *Decimalisation table attacks for PIN cracking* (UCAM-CL-TR-560, 2003) — [PDF](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-560.pdf); Anderson, R., Bond, M., Murdoch, S.: *Cryptographic Processors — A Survey* (IEEE 2006) — [PDF](https://www.cl.cam.ac.uk/~rja14/Papers/processors.pdf); EMVCo: *Book 3 — Application Specification* (v4.4, 2023).*
