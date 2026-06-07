---
title: WPA, WPA2 — TKIP a CCMP/AES
---

# WPA a WPA2 — od TKIP po AES

WEP ([[wep]]) byl prolomený. Odvětví potřebovalo *rychlé* řešení, zatímco se pracovalo na *pořádně navrženém* WPA2. **WPA** (2003) bylo *dočasné řešení*, **WPA2** (2004) je *skutečné řešení* — postavené na AES-CCMP.

## WPA — dočasné řešení

Cíl: vylepšit WEP *bez* nutnosti pořizovat nový hardware. Využít *stávající* WEP hardware pouze s aktualizací softwaru.

### Součásti

- **TKIP** (Temporal Key Integrity Protocol) — nahrazuje generování keystreamu RC4 z WEP.
- **MIC** (Message Integrity Code), počítaný algoritmem **Michael** — nahrazuje CRC-32 kryptografickým MAC (autentizační kód zprávy).
- Autentizace **802.1X** — podniková autentizace přes RADIUS.
- Režim **PSK** — předsdílený klíč (pre-shared key) pro domácí použití.

### TKIP

Vylepšuje způsob, jakým WEP používá RC4:

1. **Klíč pro každý paket (per-packet keying)** — IV každého paketu se mísí se základním klíčem. Tím se předchází opakovanému použití IV → opakovanému použití keystreamu.
2. **48bitové IV** — navýšení oproti 24bitovému IV ve WEP. Hodnota se nebude opakovat.
3. **Sekvenční čítač (sequence counter)** — brání útoku přehráním (replay).
4. **MIC** místo CRC.

Ale: pod kapotou je stále RC4. Různé útoky na TKIP (Beck-Tews 2008) prolomily MIC.

### Slabina algoritmu Michael (MAC)

MIC je *slabý* — byl navržen tak, aby šel implementovat i na starém hardwaru. Útok Beck-Tews z roku 2008:

- Obnoví klíč algoritmu Michael během minut (technikou podobnou ChopChop).
- Umožní vkládat (injektovat) omezený počet paketů za minutu.

Není to úplné prolomení, ale je to dost zlé.

### Slabina WPA-PSK

Hrubá síla (brute force) proti předsdílenému klíči ze zachyceného čtyřcestného handshaku (4-way handshake):

```bash
aircrack-ng -w wordlist.txt capture.cap
```

Pokud je heslo slabé, dojde k prolomení. Nástroje jsou optimalizované — akcelerace na GPU, velké slovníky.

Moderní zabezpečení: **WPA2** + silná přístupová fráze.

## WPA2 — IEEE 802.11i

Vydáno v roce 2004. Od roku 2006 povinná vlastnost pro certifikaci Wi-Fi Alliance.

### Součásti

- **CCMP** (Counter with CBC-MAC Protocol) — nahrazuje TKIP. Používá AES.
- **AES** — 128bitová bloková šifra ([[3des-aes]]).
- Režim **CCM** — counter mode (čítačový režim) pro šifrování + CBC-MAC pro autentizaci.
- Stejný čtyřcestný handshake jako u WPA pro odvození klíčů.

### Detaily CCMP

- AES v **režimu CTR** pro šifrování.
- **CBC-MAC** pro autentizaci.
- **PN** (Packet Number) — 48bitový čítač proti přehrání (replay).
- **Nonce** = PN + MAC + priorita.
- Šifruje a zároveň autentizuje obsah (payload).

Moderní konstrukce AEAD. Kryptograficky robustní.

### Režimy

**WPA2-Personal (PSK)**: domácí sítě. Všichni klienti sdílejí *předsdílený klíč* (pre-shared key, 8–63 znaků ASCII).

```
PSK = PBKDF2(password, SSID, 4096 iterations, 256 bits)
```

PSK se odvozuje z hesla a názvu sítě. **Stejný** PSK mají všichni klienti téže sítě.

**WPA2-Enterprise (EAP/802.1X)**: firemní prostředí. Autentizace jednotlivých uživatelů přes server RADIUS.

Každý klient má jedinečné přihlašovací údaje. Ověřování certifikátu na straně serveru (PEAP, EAP-TLS).

## Čtyřcestný handshake

Ustavení relačních klíčů (session keys) po autentizaci.

::: svg "Čtyřcestný handshake WPA2"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="30" width="80" height="40" rx="3"/>
    <rect x="430" y="30" width="80" height="40" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="60" y="55">Klient</text>
    <text x="470" y="55">AP</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none">
    <path d="M430,85 L100,85" marker-end="url(#wpa-ar)"/>
    <path d="M100,110 L430,110" marker-end="url(#wpa-ar)"/>
    <path d="M430,135 L100,135" marker-end="url(#wpa-ar)"/>
    <path d="M100,160 L430,160" marker-end="url(#wpa-ar)"/>
  </g>
  <g fill="var(--text)" font-size="9" text-anchor="middle">
    <text x="265" y="80">Zpráva 1: nonce od AP (ANonce)</text>
    <text x="265" y="105">Zpráva 2: nonce klienta (SNonce) + MIC</text>
    <text x="265" y="130">Zpráva 3: GTK + MIC (šifrováno)</text>
    <text x="265" y="155">Zpráva 4: ACK</text>
  </g>
  <text x="265" y="190" text-anchor="middle" fill="var(--text-muted)" font-size="9">Po handshaku: odvozen PTK, relace šifrována pomocí CCMP</text>
  <defs>
    <marker id="wpa-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

1. **Zpráva 1**: AP posílá *ANonce* (náhodné číslo od AP).
2. **Zpráva 2**: Klient vygeneruje *SNonce*, spočítá *PTK* (Pairwise Transient Key) = KDF(PMK, ANonce, SNonce, AP_MAC, CLI_MAC). Pošle SNonce + MIC.
3. **Zpráva 3**: AP ověří MIC a pošle *GTK* (Group Transient Key — pro multicast) + MIC.
4. **Zpráva 4**: Klient potvrdí.

**PMK** (Pairwise Master Key) = PSK v režimu personal, v podnikovém režimu se odvozuje z EAP.

Po handshaku: PTK šifruje unicastový provoz, GTK šifruje multicastový provoz.

## Útoky na WPA2

### Offline hrubá síla na PSK

Zachytit čtyřcestný handshake → prolomit PSK hrubou silou offline.

```bash
aircrack-ng -w rockyou.txt capture.cap
# GPU acceleration via hashcat
hashcat -m 22000 hash.hccapx wordlist.txt
```

Obrana: silná přístupová fráze (12+ náhodných znaků). Jinak je prolomitelná.

### KRACK — Key Reinstallation Attack (2017)

Mathy Vanhoef. Kritická zranitelnost (vulnerability) ve čtyřcestném handshaku WPA2.

Útočník (attacker) přehraje zprávu 3 → klient *přeinstaluje* PTK → vynuluje čítač nonce → opakovaně použije stejná nonce → opakuje se keystream → lze dešifrovat provoz.

Zasaženo bylo v podstatě *každé* zařízení s WiFi. Vyžádalo si to obrovské úsilí při záplatování.

Opraveno: aktualizacemi firmwaru klienta i AP.

::: viz wpa2-handshake-krack "Krok za krokem čtyřcestným handshakem (ANonce, SNonce, GTK, ACK). Po instalaci klíče se posílají data → nonce se inkrementuje. Pak ⚠ přehrání zprávy 3 → přeinstalace PTK → reset nonce → opakování keystreamu."
:::

### Evil twin / Rogue AP a WPS

Falešný AP se stejným SSID (evil twin) i útok hrubou silou na WPS PIN (split checking, ~11 000 pokusů, Reaver) — plné zpracování viz [[wifi-utoky]].

## WPA2-Enterprise + EAP

Pro firemní sítě se používá 802.1X s RADIUS:

```
[Client] ←──→ [AP] ←──→ [RADIUS] ←──→ [User DB]
```

Metody EAP:

- **EAP-TLS** — vzájemná autentizace certifikáty. Nejbezpečnější. Vyžaduje PKI ([[pki-uvod]]).
- **PEAP** — certifikát serveru + heslo uživatele (často přes EAP-MSCHAPv2).
- **EAP-TTLS** — obdoba PEAP.
- **EAP-FAST** — alternativa od Cisco.

Každý uživatel má jedinečné přihlašovací údaje. Vše se loguje na RADIUS. Odvolání přístupu je jednoduché.

## Porovnání režimů

| Režim | Autentizace | Použití |
| :--- | :--- | :--- |
| WPA2-Personal (PSK) | sdílené heslo | domácnost, malá firma |
| WPA2-Enterprise | EAP pro každého uživatele | firemní prostředí |
| WPA3-Personal (SAE) | vylepšené heslo | novější domácnosti |
| WPA3-Enterprise | EAP + vylepšení | novější firmy |

## Migrace

- **WPA2 Personal** se silným heslem — současné minimum.
- **WPA3 Personal** — preferované pro nová nasazení.
- **WPA2 Enterprise** — pro firemní prostředí.
- **WPA2 Personal se slabým heslem** — prolomeno během hodin.

Wi-Fi Alliance: WPA2 je stále přijatelné. WPA3 je osvědčený postup pro nová nasazení.

---

*Zdroj: BIS přednášky 2025/26, Ing. Matej Kačic, FIT VUT v Brně. Externí reference: IEEE 802.11i:2004 — Medium Access Control (MAC) Security Enhancements; Vanhoef, M., Piessens, F.: „Key Reinstallation Attacks: Forcing Nonce Reuse in WPA2" (CCS 2017, [PDF](https://papers.mathyvanhoef.com/ccs2017.pdf)); Beck, M., Tews, E.: „Practical Attacks Against WEP and WPA" (WiSec 2009); RFC 3748 — EAP; [Wi-Fi Alliance](https://www.wi-fi.org/).*
