---
title: Bluetooth Low Energy (BLE)
---

# Bluetooth Low Energy (BLE)

**Bluetooth Low Energy (BLE)** je nejrozšířenější WPAN protokol pro mass-market IoT — fitness trackery, smart watches, beacons, hearing aids, smart locks, lékařské pumpy, car key fobs. Specifikováno [Bluetooth SIG](https://www.bluetooth.com/), open standard. V r. 2026 prakticky *každý mobilní telefon* a *většina* IoT zařízení podporuje BLE.

BLE *není* zpětně kompatibilní s Bluetooth Classic — je to *jiný* rádiový protokol postavený nad stejným 2,4 GHz pásmem.

## Architektura

::: svg "BLE topologie: central (telefon, hub) ↔ multiple peripherals (BLE devices). Také mesh (BLE Mesh) pro IoT scenarios."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aBL1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="100" cy="110" r="36"/>
    <circle cx="280" cy="40" r="22"/>
    <circle cx="280" cy="100" r="22"/>
    <circle cx="280" cy="160" r="22"/>
    <circle cx="440" cy="40" r="22"/>
    <circle cx="440" cy="100" r="22"/>
    <circle cx="440" cy="160" r="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="115" font-size="12">Central</text>
    <text x="100" y="135" font-size="10" fill="var(--text-muted)">(telefon)</text>
    <text x="280" y="44" font-size="10">smartwatch</text>
    <text x="280" y="104" font-size="10">earbuds</text>
    <text x="280" y="164" font-size="10">fitness</text>
    <text x="440" y="44" font-size="10">car key</text>
    <text x="440" y="104" font-size="10">smart lock</text>
    <text x="440" y="164" font-size="10">beacon</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aBL1)">
    <path d="M134,96 L260,52"/>
    <path d="M136,110 L260,100"/>
    <path d="M134,128 L260,148"/>
  </g>
  <g stroke="var(--text-muted)" stroke-width="1" fill="none" stroke-dasharray="3 3">
    <path d="M302,40 L420,40"/>
    <path d="M302,100 L420,100"/>
    <path d="M302,160 L420,160"/>
  </g>
</svg>
:::

### Role

* **Central** — typicky telefon nebo hub. *Scanuje* advertisements, *iniciuje* spojení.
* **Peripheral** — typicky IoT zařízení. *Inzeruje* svou přítomnost a služby (advertisement), čeká na spojení.
* **Broadcaster** — vysílá advertisements, ale nepřijímá spojení. Použité v *beacons* (iBeacon, Eddystone).
* **Observer** — scanuje advertisements, ale nespojuje se.

Centrum může mít *více* connection s peripherals současně (typicky 7–10 na moderním mobilu). Peripheral má obvykle 1 connection.

### BLE Mesh

* Od specifikace **Mesh Profile 1.0 (2017)** podporuje *mesh* topology.
* Použito hlavně v *smart lighting* (Casambi, Philips Hue Bridge přechází na Mesh).
* Mesh přidává *managed flood* (zprávy se šíří přes všechny uzly s rate limiting).

## Pairing a bezpečnost

BLE bezpečnost se vyvíjela přes 4 hlavní verze:

### Legacy Pairing (BLE 4.0–4.1, 2010–2013) — SLABÉ

* **Just Works** — žádná autentizace. Klíč sjednán z *0 entropie* TK (Temporary Key) = 0x000000.
* **Passkey Entry** — 6-digit PIN (1 milión kombinací). Pairing protokol odhaluje PIN přes 5 výzev — *brute-forceable za ~5 sekund*.
* **Out of Band (OOB)** — vyžaduje secondary channel (NFC) pro key exchange. Bezpečný, ale málo používaný.

::: viz ble-crackle "Zachyt pairing handshake, spust Crackle brute force 10^6 PIN. LE Secure Connections (BLE 4.2+) s ECDH P-256 utok znemozni."
:::

**Útok č. 1 — Crackle**

[Mike Ryan 2013](https://lacklustre.net/projects/crackle/):

* Sniffuje pairing handshake.
* Brute-force 6-digit PIN.
* Z PIN odvodí session keys (LTK).
* Dešifruje *all subsequent communication*.

Tool: **crackle** (open source). Vyžaduje BlueFruit LE Sniffer nebo Ubertooth One ($120).

### Secure Connections (BLE 4.2+, 2014+) — BEZPEČNÉ

* **ECDH key exchange** s **NIST P-256** křivkou.
* **Numeric comparison / Passkey Entry / OOB / Just Works** módy s autentizací.
* **Long Term Key (LTK)** odvozený z ECDH, není přenášen po síti.

**Vlastnost:** Secure Connections je *theoretically* bezpečné proti pasivnímu odposlechu (ECDH s mutual authentication = secure).

### LE Secure Connections + Pairing 2 (BLE 5.0+, 2016+)

* Vylepšení: lepší support pro Mesh, lepší pairing UX.
* Vyžaduje obě strany BLE 4.2+.

## Útoky na BLE

### Útok č. 2 — Eavesdropping

* BLE advertisements jsou *nešifrované* — útočník v dosahu vidí MAC address (random nebo public), advertisement data, capabilities.
* **Tracking** — pokud zařízení používá fixed MAC, lze ho *trackovat* napříč prostředími.
* Mitigace: **Random Resolvable Private Address (RPA)** — MAC se mění každých 15 minut. Telefon, který má vlastněný IRK (Identity Resolving Key), umí dešifrovat back k *static address*.
* **iOS / Android** od ~2017 používají RPA defaultně. Levné BLE beacons často ne → trackable.

### Útok č. 3 — KNOB attack (2019)

[*Key Negotiation Of Bluetooth*](https://knobattack.com/) (Antonioli, Tippenhauer, Rasmussen):

* Bluetooth Classic + BLE 4.0+ negotiate **encryption key length** během pairingu — od 1 do 16 bytes.
* Útočník MITM negocuje 1-byte key → brute force triviální.
* Návrh standard *předpokládal*, že chyba 1-byte konfigurace je *unrealistic* — ale specifikace ji *povoluje*.

Mitigace: Bluetooth 5.1+ vyžaduje min 7-byte klíč. Patches na *všechny* hosts (Linux, macOS, Windows, Android, iOS).

### Útok č. 4 — BIAS (2020)

[*Bluetooth Impersonation AttackS*](https://francozappa.github.io/about-bias/):

* Bluetooth Classic *legacy authentication* (BR/EDR mode) — *jednosměrná* (slave to master).
* Útočník MITM přejde do *master* role, používá uloženou link-key oběti pro autentizaci.
* Funguje na *velmi široké* škále zařízení 2010+.

### Útok č. 5 — BlueBorne (2017)

[*BlueBorne: 8 vulnerabilities*](https://www.armis.com/research/blueborne/) — Armis Labs:

* Z buffer overflows, memory leaks, RCEs v Bluetooth stack (Linux BlueZ, Android Bluedroid, Windows, iOS).
* Útok přes *vzduch*, bez pairingu, bez clicking.
* Affected: Bluetooth Classic + BLE; ~5,3 miliardy zařízení v r. 2017.

Patches za měsíc, ale ne všechna zařízení byla updated. Mass-IoT BLE devices často nikdy nepatchovány.

### Útok č. 6 — BLESA (2020)

[*BLE Spoofing Attacks*](https://www.usenix.org/system/files/woot20-paper-wu.pdf):

* Útok během **reconnection** (ne během initial pairing).
* BLE specifikace nepovinně-vyžaduje autentizaci pro reconnection s known peripheral.
* Útočník po pairingu *resetuje* peripheral identity, předstírá legitimní peripheral. Centrální zařízení akceptuje bez nového handshake.

### Útok č. 7 — Sweyntooth (2020)

* Série vulnerabilities v SoC implementations BLE (Texas Instruments, NXP, Cypress, ...).
* Crash zařízení, deadlock, security bypass.
* Affect: medical devices, fitness trackers, smart locks.

### Útok č. 8 — BLESpoof (Tesla Phone-as-Key, 2022)

[NCC Group 2022](https://www.nccgroup.com/us/research-blog/technical-advisory-tesla-ble-phone-as-a-key-passive-entry-vulnerable-to-relay-attacks/):

* Tesla Phone-as-Key (PaaK) používá BLE pro proximity detection.
* **Relay attack** podobný [[keeloq|KeeLoq autoklíčům]] — útočník 1 relayuje BLE z telefonu, útočník 2 prezentuje signal autu.
* Demonstrace na Tesla Model 3 — auto otevřeno a *odjeto* z 25 m vzdálenosti od telefonu.

Mitigace: Tesla v r. 2023 přidala *UWB ranging* pro proximity detection (přesnější RTT, harder to relay).

## Smart locks — case study

Smart locks (August, Yale, Schlage, Igloohome) typicky používají BLE + cloud:

* **BLE pairing** během instalace, klíč se odvodí přes ECDH.
* **OTP commands** podepsané LTK pro lock/unlock.
* **Cloud backup** — encrypted access logs.

**Útoky:**

* **Relay** (jako u Tesla).
* **Replay** — pokud commands nejsou nonce-bound.
* **DPA** ([[spa-dpa]]) na ECDH na low-cost MCU → recovery LTK.
* **Firmware update bez secure boot** → nahrání malicious firmware.

[*Dan Petro - Smart Locks at DEF CON 24 (2016)*](https://www.youtube.com/watch?v=JNQc9hWxOG0) — demonstroval, že 16 z 16 testovaných smart locks bylo *kompromitovatelných* nějakým způsobem (default passwords, replay, plaintext credentials...).

## BLE Mesh — specifika

* **Network Layer** — flooding-based messaging.
* **Network Key** — sdílený všemi uzly v síti.
* **Application Key** — sdílený jen mezi senderem a receiverem; end-to-end encryption.
* **Device Key** — per-device, používaný při provisioning.

Útoky:
* Default Network Key — pokud nebyl změněn po inicializaci.
* Replay přes mesh — i s frame counter, mesh flooding může zkomplikovat detection.
* Power consumption — mesh flooding stojí energii.

## Pen-testing tools

* **gattacker / btproxy** — MITM frameworky pro BLE.
* **Bettercap** — interactive BLE attack framework.
* **Ubertooth One** ($120) — open source BLE sniffer.
* **nRF52840 dongle** ($10) — flashable jako BLE sniffer s Wireshark plugin.
* **Crackle** — pairing decryption tool.

## Doporučení

* **Vyžaduj BLE 4.2+ Secure Connections** pro nové designy.
* **Numeric comparison nebo OOB** preferovat před Just Works.
* **Random Resolvable Private Address (RPA)** pro privacy.
* **Per-device unique keys** — žádné sdílené factory keys.
* **Secure boot + signed firmware updates**.
* **Pravidelné pairing renewal** — re-key každých N měsíců.
* **Distance bounding** pro proximity-sensitive aplikace (smart locks, car keys) — *protect against relay*.

---

*Zdroj: BZA přednášky 2025/26, BZA 08 — Bezpečnost IoT (Hujňák). Externí reference: Bluetooth SIG: *Bluetooth Core Specification v5.4* (2023) — [bluetooth.com](https://www.bluetooth.com/specifications/specs/); Ryan, M.: *Bluetooth Smart: The Good, the Bad, the Ugly, and the Fix!* (Black Hat 2013) — [PDF](https://lacklustre.net/bluetooth/Ryan_Bluetooth_Smart_BH13_USA.pdf); Antonioli, D., Tippenhauer, N. O., Rasmussen, K.: *KNOB Attack* (USENIX Security 2019) — [project page](https://knobattack.com/); Armis Labs: *BlueBorne: Bluetooth Vulnerability Disclosure* (2017) — [page](https://www.armis.com/research/blueborne/).*
