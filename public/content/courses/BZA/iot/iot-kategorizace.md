---
title: IoT — kategorizace a bezdrátové sítě
---

# IoT — kategorizace a bezdrátové sítě

**Internet of Things (IoT)** je rozšíření internetu na *vestavěná zařízení* — senzory, aktuátory, chytré domácí spotřebiče, průmyslové stroje, vozidla. Definice není ustálená, ale typické znaky: malý výpočetní výkon, omezená paměť, baterie nebo energy harvesting, *bezdrátová* komunikace, *masové* nasazení (miliardy zařízení). Bezpečnostně je IoT *nová doména* — útočná plocha je obrovská, ekonomika výroby tlačí na minimalismus, který koliduje s bezpečnostními požadavky.

## Co je IoT

Tři druhy komunikace:

* **H2H** — Human-to-Human (mobil, e-mail) — klasická.
* **H2M** — Human-to-Machine (banking app, smart home control) — uživatel ovládá zařízení.
* **M2M** — Machine-to-Machine — *zařízení mezi sebou*; specifika IoT. Příklad: chytrá lednice + chytrý termostat + chytrá zásuvka.

Zahrnuje *masivní* počty uzlů — *exponenciální nárůst*. Sběr velkých objemů dat (Big Data), které pak tvoří průmyslové i privacy issues.

## Kategorizace IoT

### Podle druhu připojení

* **Drátové** — Ethernet (industrial), KNX/EIB (smart home), Modbus (PLC), DALI (lighting). Vysoká bezpečnost (fyzická obrana), ale málo flexibilní.
* **Bezdrátové** — dominantní volba. Skryje 95+% IoT instalací.

### Podle použitých technologií

* **S plnou implementací TCP/IP** — chytré televize, kamery, NAS, IP termostaty.
* **S vlastními IoT protokoly** — LoRaWAN, ZigBee, Z-Wave, Thread; nepřímo přes gateway na IP.

### Podle způsobu přístupu

* **Přímo z internetu** — IP adresou (kamery, IoT s public IP). Nejhorší bezpečnost.
* **Skrze přístupový uzel (gateway)** — local LAN s gateway, který je proxy. Standardní pro ZigBee, Z-Wave.
* **Skrze přístupový cloud** — zařízení komunikuje *přímo s cloudem* výrobce (TLS), uživatel pak skrze cloud control (mobile app). LoRaWAN, většina chytré domácnosti (Philips Hue, Tuya).

## Bezdrátové IoT sítě

::: svg "Hierarchie bezdrátových IoT sítí podle dosahu a datové propustnosti: LPWAN globální vs. lokální LR-WPAN."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="30" width="240" height="90" rx="8"/>
    <rect x="280" y="30" width="240" height="90" rx="8"/>
    <rect x="20" y="135" width="240" height="90" rx="8"/>
    <rect x="280" y="135" width="240" height="90" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="140" y="52" font-size="12.5">LPWAN — Low-Power WAN</text>
    <text x="140" y="68" font-size="10.5" fill="var(--text-muted)">regionální / globální pokrytí</text>
    <text x="140" y="86" font-size="10" fill="var(--text-muted)">~ km dosah; ~ kB/s</text>
    <text x="140" y="104" font-size="10" fill="var(--accent)">LoRaWAN, Sigfox, NB-IoT, LTE-M</text>
    <text x="400" y="52" font-size="12.5">WMAN/WLAN</text>
    <text x="400" y="68" font-size="10.5" fill="var(--text-muted)">městský/lokální dosah</text>
    <text x="400" y="86" font-size="10" fill="var(--text-muted)">~ 100 m; Mb/s</text>
    <text x="400" y="104" font-size="10" fill="var(--accent)">Wi-Fi, WiMAX, 5G</text>
    <text x="140" y="157" font-size="12.5">LR-WPAN — Low-Rate WPAN</text>
    <text x="140" y="173" font-size="10.5" fill="var(--text-muted)">místní sítě mesh</text>
    <text x="140" y="191" font-size="10" fill="var(--text-muted)">~ 100 m; ~ 250 kb/s</text>
    <text x="140" y="209" font-size="10" fill="var(--accent)">ZigBee, Z-Wave, Thread</text>
    <text x="400" y="157" font-size="12.5">WPAN — Wireless PAN</text>
    <text x="400" y="173" font-size="10.5" fill="var(--text-muted)">osobní sítě</text>
    <text x="400" y="191" font-size="10" fill="var(--text-muted)">~ 10 m; ~ 1 Mb/s</text>
    <text x="400" y="209" font-size="10" fill="var(--accent)">Bluetooth, BLE, NFC</text>
  </g>
</svg>
:::

### LPWAN — Low-Power Wide Area Network

Infrastrukturní sítě s regionálním až globálním pokrytím. Připojení jako *služba* (subscription model), data putují přes operátora do cloudu.

V IoT konkuruje mobilním datovým sítím.

* **LoRaWAN** — 868 MHz EU, 915 MHz US. *Chirp Spread Spectrum* modulace (patentovaná Semtech). Dosah 5–15 km, 0.3–50 kb/s. Plně otevřená specifikace (LoRa Alliance). Detailně [[lorawan]].
* **Sigfox** — 868 MHz EU, *ultra-narrow-band*. 100 b/s. Centralizovaný (Sigfox jediný operátor). Limit 140 zpráv/den.
* **Narrowband IoT (NB-IoT, LTE Cat NB1/NB2)** — část 5G spektra, využívá LTE infrastrukturu. ~30 kb/s downlink. Dobré in-building pokrytí.
* **LTE-M (LTE Cat M1, eMTC)** — vyšší datová rychlost (~1 Mb/s), vhodný pro mobilní aplikace.

### LR-WPAN — Low-Rate WPAN

Lokální sítě pod správou uživatele. Připojení zprostředkovává *centrální uzel* (hub, koordinator). Topologie hvězda, mesh, ad-hoc.

* **Z-Wave** — 868 MHz EU, mesh, max 232 zařízení, dosah 30 m. Proprietary (Sigma Designs, dnes Silicon Labs).
* **ZigBee** — 2.4 GHz (also 868/915 MHz), nad IEEE 802.15.4. *Mesh* topologie. Vyžaduje gateway. Detailně [[zigbee-802154]].
* **6LoWPAN** — IPv6 over Low-Power Wireless PAN. IPv6 přes IEEE 802.15.4 fyzickou vrstvu.
* **Thread** — IPv6 mesh, postaven na 6LoWPAN. Smart home standard (Google Nest, Apple HomeKit, Eve).
* **IQRF** — proprietary (MICRORISC, Czech) — *industrial* mesh, 868 MHz.

### WPAN — krátké dosahy

* **Bluetooth Classic** — 2.4 GHz, ~1 Mb/s, dosah 10 m (Class 2). Pre-IoT technologie.
* **Bluetooth Low Energy (BLE)** — 2.4 GHz, ~125 kb/s – 2 Mb/s, dosah 10–100 m. *De facto* standard pro wearables, beacons, smart locks. Detailně [[ble-bluetooth]].
* **NFC** — viz [[bezkontaktni-nfc]]. 13.56 MHz, ≤ 10 cm.
* **RFID** — 125 kHz / 134 kHz (LF), 13.56 MHz (HF), 860–960 MHz (UHF).
* **Ultra-Wideband (UWB)** — 3.1–10.6 GHz, *ranging* applikace (Apple AirTag, Tesla Phone-as-Key).

## Specifika IoT z bezpečnostního hlediska

### Velký počet zařízení

* **~30 miliard IoT zařízení v r. 2025** (Statista odhad).
* Každé zařízení je potenciální entry point pro útoky.
* Mass-management klíčů je problém (PSK pro miliony zařízení vyžaduje *bezpečnou distribuci*).
* **Zoo zařízení** — heterogenní HW, různí výrobci, různé OS (Linux, FreeRTOS, Zephyr, žádný OS), různé update mechanismy.

### Omezené zdroje

* **CPU**: 8-bit (AVR, PIC), 32-bit ARM Cortex-M0/M4. Často bez krypto-koprocesoru.
* **RAM**: 1–256 kB. Nemůže running RSA-2048 / TLS handshake bez problémů.
* **Flash**: 16 kB – 4 MB. Omezené update.
* **Baterie**: roky až desetiletí na CR2032 nebo AA. Krypto operace energy-expensive (RSA 2048 → ~5 mWs, AES → ~0.01 mWs).

Důsledek: full TLS handshake je *drahý*. Mnoho IoT používá *symmetric pre-shared keys* místo PKI.

### Hledání "zlaté cesty"

Roztříštěnost protokolů → každý ekosystém řeší bezpečnost po svém:

* **Šifrování pouze částí rámců** — třeba payload, ale ne header (kvůli optimalizaci).
* **PSK distribuce** během výroby → kompromitace klíče = compromitace všech zařízení (viz [[keeloq]]).
* **No firmware updates** — mnoho zařízení nikdy nedostane patch po vydání.
* **Default credentials** — admin/admin, root/root — zdroj 90 % útoků na IoT.

### Životní cyklus

* Klasické IoT zařízení: nasazení **5–15 let** (smart meter, industrial sensor).
* Krypto-agilita problém — algoritmus, který je dnes bezpečný, může být za 10 let nebezpečný (post-quantum).
* SW update via OTA (over-the-air) — *vlastní* útočná plocha (signed firmware, secure boot).

### Privacy

Detailně viz [[topologicke-utoky]] a další. Stručně:

* **Big Data tracking** — provozovatelé sbírají velké objemy dat (Big Data — sledování trendů, vzorů).
* **Metadata** — stačí k prozrazení velkého množství informací (kdy je domov prázdný, kdy vstávám).
* **Inference** — odvození nových informací z dat a metadat (kombinace lokace + spánkový pattern → odhad zdravotního stavu).
* **EULA** — uživatel souhlasí s sběrem dat, pak.
* **GDPR (EU)** — částečná ochrana, ale enforcement složitý.

### Bezpečnost ≠ Soukromí

* **Bezpečné zařízení** — zamezuje *zneužití třetí stranou* (útočník nemůže odemknout zámek).
* **Zařízení respektující soukromí** — neposkytne data ani *legitimní* službě, kterou uživatel nepovolil.

Tyto dvě vlastnosti jsou *ortogonální*. Smart lock může být *bezpečný* (neotevře neoprávněné osobě) a *neperspektivní* pro privacy (posílá svému výrobci data o tom, kdy domov je prázdný).

### Typické scénáře úniku informací

* **Smart lock** → nepřímé sledování přítomnosti doma.
* **Domácí asistenti** (Echo, Google Home) → odposlechy. *"Always-listening"* requires aktivační slovo; ale technicky stream je 24/7.
* **Smart TV** → automatic content recognition (ACR) sleduje, co se dívá; data se posílají do cloudu.
* **Smart thermostat** → schedule prozradí pracovní hodiny.
* **Fitness tracker** → krok, srdce → odhad zdraví, lokace cvičení.
* **Smart auto** → routes, navigace, časování.

## Bezpečnost je drahá

Klíčový **business** problém: bezpečné IoT zařízení je *dražší* než nebezpečné:

* **Krypto čip** ($1) vs. ne ($0).
* **Sec. testing** + certifikace ($100k+) vs. ne.
* **OTA update infrastruktura** ($/měsíc/zařízení) vs. ne.
* **Dlouhodobá podpora** (5+ let security patches) vs. ne.

Levné konsumer IoT (Tuya zařízení za $5, USB cameras za $20) *strukturálně* nemá rozpočet na bezpečnost. Volný trh selhává — koncový uživatel netestuje bezpečnost, jen funkčnost a cenu.

**Regulační odpovědi**:

* **EU Cyber Resilience Act (CRA, 2024)** — povinné security requirements pro produkty s digitálními elementy.
* **US Cyber Trust Mark** (2025+) — voluntary labeling.
* **UK PSTI Act 2022** — minimum security for consumer IoT (no default passwords, security update period disclosure).
* **NIST SP 800-213** — guidelines pro IoT manufacturers.

---

*Zdroj: BZA přednášky 2025/26, BZA 08 — Bezpečnost IoT (Hujňák). Externí reference: ENISA: *Baseline Security Recommendations for IoT in the context of Critical Information Infrastructures* (2017) — [PDF](https://www.enisa.europa.eu/publications/baseline-security-recommendations-for-iot); NIST SP 800-213 *IoT Device Cybersecurity Capability Core Baseline* (2021) — [PDF](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-213.pdf); IoT Analytics: *State of IoT 2025*; EU Cyber Resilience Act (Regulation (EU) 2024/2847).*
