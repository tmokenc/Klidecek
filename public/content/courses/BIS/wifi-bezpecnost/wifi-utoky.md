---
title: WiFi útoky — KRACK, FragAttacks, evil twin, deauth
---

# WiFi útoky — KRACK, FragAttacks, evil twin a další

I s WPA3 ([[wpa3]]) WiFi sítě *zranitelné*. Útoky kombinují *protocol weaknesses*, *implementation bugs*, a *social engineering*. Tato sekce katalogizuje hlavní moderní útoky.

## KRACK (2017)

Already mentioned [[wpa-wpa2]]. Recap:

- Mathy Vanhoef discovered WPA2 4-way handshake replay attack.
- Replay Msg 3 → client reinstalls PTK → nonce reuse → keystream reuse → decrypt.
- Affected basically every WPA2 client.

Patched widely. Modern devices fixed.

## FragAttacks (2021)

Mathy Vanhoef again. **Fragmentation and Aggregation Attacks**.

3 design flaws + 9 implementation bugs in 802.11 standard.

### Design flaws

- **Fragment reassembly** — fragments from different keys treated as same packet.
- **Aggregation** — A-MSDU subframe header not authenticated.
- **Cache poisoning** — fragments persist across (re)associations.

### Example: A-MSDU injection

Attacker injects A-MSDU subframe header into legitimate fragment → packet routed to attacker's destination.

Affected most Wi-Fi devices. Patched widely.

## Deauthentication attacks

Forged management frame disconnects client.

```bash
aireplay-ng -0 5 -a TARGET_BSSID -c TARGET_CLIENT wlan0mon
```

Until WPA3 mandatory PMF, deauth attacks *trivial*. Used in:

- **DoS** — kick users off.
- **Force re-authentication** — capture handshake for offline crack.
- **Phishing setup** — kick from legit AP, hope to reconnect to evil twin.

Defense: **802.11w (Protected Management Frames)** — required in WPA3, optional in WPA2.

## Evil Twin

Attacker sets up rogue AP with same SSID as legit network. Clients auto-connect if signal stronger or legit AP unavailable.

### Tools

- **Wifiphisher** — automated evil twin + phishing.
- **hostapd-wpe** — hostile AP for capturing credentials.

### Process

1. Deauth users from legit AP.
2. Run rogue AP with same SSID, *open* or with captured creds.
3. Users reconnect to rogue.
4. Attacker: MITM, credentials harvest, malware injection.

### Defense

- **Client certificate** validation (Enterprise EAP-TLS).
- **HSTS** — browsers refuse downgrade to HTTP.
- **VPN** — encrypts even on rogue network.
- **Don't auto-connect** to open networks.

## Captive Portal abuse

Coffee shop / hotel WiFi: open network, redirect to login page.

Attacks:

- **Cred harvest** — fake portal looks like legit.
- **Malware push** — fake "update your software".
- **MITM** — once connected, attacker sniffs.

Defense: VPN before browsing.

## Karma attack

Modern WiFi clients periodically probe for *known* SSIDs ("Probe Request" frame).

Attacker captures probe requests → sees networks client knows.

Rogue AP responds to *any* probe ("yes, I'm 'HomeWiFi'"). Client connects.

Defense: don't auto-connect to known networks (mostly mitigated in modern OS).

## WPS PIN brute force

WPS PIN = 8 digits. *Should* be 10^8 = 100M combinations. *Design flaw* splits PIN — brute force in *11 000* attempts.

Tool: **Reaver, Bully**.

Time: hours to days depending on AP.

Defense: disable WPS. Most modern APs allow disabling.

## Bluetooth attacks

Related wireless tech. Brief overview:

- **Bluejacking** — send unsolicited messages.
- **Bluesnarfing** — unauthorized access to data.
- **KNOB attack** (2019) — reduce Bluetooth encryption strength to 1 byte → trivial crack.
- **BlueBorne** (2017) — RCE via Bluetooth.
- **BLE traffic capture** — sniff BLE pairing.

Modern Bluetooth (5.x) hardened.

## Beacon manipulation

WiFi APs broadcast Beacon frames advertising SSID, capabilities.

Attacker can:

- **Spoof beacon** — claim to be different AP.
- **Hide SSID** — APs that hide SSID still respond to *known* probes.

## WiFi protocol fuzzing

Recent research: fuzzing 802.11 protocol stack → crash drivers, RCE in kernel.

- **Linux iwlwifi** CVEs.
- **macOS AirPort** CVEs.
- **Broadcom WiFi** chip RCEs (Project Zero 2017).

Defense: keep drivers + firmware patched.

## Defense summary

### Network-level

- **WPA3** preferred. WPA2 with strong password if needed.
- **PMF** enabled.
- **Disable WPS**.
- **Strong PSK** (12+ random chars).
- **Guest network** separate from main.
- **Firmware updates** — apply promptly.

### Enterprise

- **802.1X with EAP-TLS** — certificate authentication.
- **WIDS** (Wireless IDS) — detect rogue APs, evil twins.
- **WIPS** (Wireless IPS) — auto-disconnect rogue clients.
- **Site survey** — identify rogue access points.

### Client-level

- **VPN** for sensitive traffic.
- **Don't auto-connect** to unknown networks.
- **Manage saved networks** — remove old.
- **Use HTTPS** — HSTS-enabled sites resist some MITM.
- **Disable unused interfaces** — Bluetooth when not used.

### Monitoring

- **Kismet** — wireless detection.
- **Airodump-ng** — passive monitoring.
- **WiFi Pineapple** — pen test tool (Hak5).

## Real-world incidents

- **2007 TJX hack** — WEP exploited, 45M credit cards stolen.
- **2015 Ashley Madison** — internal WiFi compromise contributed to leak.
- **2019 Mar-a-Lago network** — open WiFi, security concerns.
- **Hotel WiFi network** breaches — multiple chains.

WiFi remains *high-impact* attack vector. Modern crypto + PMF + EDR + monitoring reduces but doesn't eliminate.

## Future of WiFi security

- **Wi-Fi 7** (802.11be, 2024) — WPA3 mandatory, OFDMA improves robustness.
- **Pre-Shared Key 2.0** (PSK2) — research direction, improve home WiFi security beyond SAE.
- **OWE** — Opportunistic Wireless Encryption — encrypts even *open* networks.

Standards evolve. Implementation lags.

---

*Zdroj: BIS přednášky 2025/26, Ing. Matej Kačic, FIT VUT v Brně. Externí reference: Vanhoef, M., Piessens, F.: „Key Reinstallation Attacks" (CCS 2017); Vanhoef, M.: „Fragment and Forge: Breaking Wi-Fi Through Frame Aggregation and Fragmentation" (USENIX Security 2021, [fragattacks.com](https://www.fragattacks.com/)); Vanhoef, M., Ronen, E.: „Dragonblood" (S&P 2020); [Aircrack-ng Tutorials](https://www.aircrack-ng.org/doku.php?id=tutorial); [Wireshark Wi-Fi capture](https://wiki.wireshark.org/CaptureSetup/WLAN); Hak5 — WiFi Pineapple documentation.*
