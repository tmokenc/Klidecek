---
title: WPA, WPA2 — TKIP a CCMP/AES
---

# WPA a WPA2 — od TKIP po AES

WEP ([[wep]]) byl *broken*. Industry needed *rychlé* řešení while pracovali na *properly designed* WPA2. **WPA** (2003) byl *interim fix*, **WPA2** (2004) je *real solution* — based on AES-CCMP.

## WPA — interim fix

Cíl: zlepšit WEP *bez* nutnosti new hardware. Use *existing* WEP hardware with software upgrade.

### Components

- **TKIP** (Temporal Key Integrity Protocol) — replace WEP RC4 keystream generation.
- **MIC** (Michael Integrity Code) — replace CRC-32 with cryptographic MAC.
- **802.1X** authentication — enterprise auth via RADIUS.
- **PSK** mode — pre-shared key for home.

### TKIP

Improves WEP RC4 usage:

1. **Per-packet keying** — mix per-packet IV with base key. Avoid IV reuse → keystream reuse.
2. **48-bit IV** — increase from WEP's 24-bit. Won't repeat.
3. **Sequence counter** — prevent replay.
4. **MIC** instead of CRC.

But: still RC4 underneath. Various TKIP attacks (Beck-Tews 2008) broke MIC.

### Michael MAC weakness

MIC is *weak* — designed to be implementable on old hardware. Beck-Tews 2008 attack:

- Recover Michael key in minutes (with ChopChop-like technique).
- Inject limited packets per minute.

Not full break but bad enough.

### WPA-PSK weakness

Brute-force pre-shared key via captured 4-way handshake:

```bash
aircrack-ng -w wordlist.txt capture.cap
```

If password weak: cracked. Tools optimized — GPU acceleration, large wordlists.

Modern security: **WPA2** + strong passphrase.

## WPA2 — IEEE 802.11i

Released 2004. Mandatory feature for Wi-Fi Alliance certification 2006+.

### Components

- **CCMP** (Counter with CBC-MAC Protocol) — replaces TKIP. Uses AES.
- **AES** — 128-bit block cipher ([[3des-aes]]).
- **CCM** mode — counter mode for encryption + CBC-MAC for authentication.
- Same 4-way handshake as WPA for key derivation.

### CCMP details

- AES in **CTR mode** for encryption.
- **CBC-MAC** for authentication.
- **PN** (Packet Number) 48-bit replay counter.
- **Nonce** = PN + MAC + priority.
- Encrypts + authenticates payload.

Modern AEAD construction. Cryptographically sound.

### Modes

**WPA2-Personal (PSK)**: home networks. All clients share *pre-shared key* (8-63 ASCII chars).

```
PSK = PBKDF2(password, SSID, 4096 iterations, 256 bits)
```

PSK derived from password + network name. **Same** PSK for all clients of same network.

**WPA2-Enterprise (EAP/802.1X)**: corporate. Per-user authentication via RADIUS server.

Each client unique credentials. Server-side certificate validation (PEAP, EAP-TLS).

## 4-way handshake

Establishment of session keys after authentication.

::: svg "WPA2 4-way handshake"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="30" width="80" height="40" rx="3"/>
    <rect x="430" y="30" width="80" height="40" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="60" y="55">Client</text>
    <text x="470" y="55">AP</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none">
    <path d="M100,85 L430,85" marker-end="url(#wpa-ar)"/>
    <path d="M430,110 L100,110" marker-end="url(#wpa-ar)"/>
    <path d="M100,135 L430,135" marker-end="url(#wpa-ar)"/>
    <path d="M430,160 L100,160" marker-end="url(#wpa-ar)"/>
  </g>
  <g fill="var(--text)" font-size="9" text-anchor="middle">
    <text x="265" y="80">Msg 1: AP's nonce (ANonce)</text>
    <text x="265" y="105">Msg 2: Client nonce (SNonce) + MIC</text>
    <text x="265" y="130">Msg 3: GTK + MIC (encrypted)</text>
    <text x="265" y="155">Msg 4: ACK</text>
  </g>
  <text x="265" y="190" text-anchor="middle" fill="var(--text-muted)" font-size="9">After handshake: PTK derived, session encrypted with CCMP</text>
  <defs>
    <marker id="wpa-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

1. **Msg 1**: AP sends *ANonce* (AP random).
2. **Msg 2**: Client generates *SNonce*, computes *PTK* (Pairwise Transient Key) = KDF(PMK, ANonce, SNonce, AP_MAC, CLI_MAC). Sends SNonce + MIC.
3. **Msg 3**: AP verifies MIC, sends *GTK* (Group Transient Key — for multicast) + MIC.
4. **Msg 4**: Client confirms.

**PMK** (Pairwise Master Key) = PSK in personal mode, derived from EAP in enterprise.

After handshake: PTK encrypts unicast, GTK encrypts multicast.

## WPA2 attacks

### Offline PSK brute force

Capture 4-way handshake → offline brute force.

```bash
aircrack-ng -w rockyou.txt capture.cap
# GPU acceleration via hashcat
hashcat -m 22000 hash.hccapx wordlist.txt
```

Defense: strong passphrase (12+ random chars). Otherwise crackable.

### KRACK — Key Reinstallation Attack (2017)

Mathy Vanhoef. Critical vulnerability in WPA2 4-way handshake.

Attacker replays Msg 3 → client *reinstalls* PTK → resets nonce counter → reuses nonces → keystream reuse → decrypt traffic.

Affected basically *every* WiFi device. Massive patch effort.

Patched: client + AP firmware updates.

::: viz wpa2-handshake-krack "Step skrz 4-way handshake (ANonce, SNonce, GTK, ACK). Po install klíče poslyj data → nonce inkrementuje. Pak ⚠ Replay Msg 3 → PTK reinstall → nonce reset → keystream reuse."
:::

### Evil twin / Rogue AP

Create fake AP with same SSID. Clients auto-connect (especially open networks or weak setups).

Defense: 802.11w (Protected Management Frames), client certificate validation.

### WPS — Wi-Fi Protected Setup

PIN-based "easy setup". 8-digit PIN, but *split* checking. Brute-force in <10 000 attempts (Reaver tool 2011).

Most APs disable WPS in newer firmware. Still found on some old devices.

## WPA2-Enterprise + EAP

For corporate networks, use 802.1X with RADIUS:

```
[Client] ←──→ [AP] ←──→ [RADIUS] ←──→ [User DB]
```

EAP methods:

- **EAP-TLS** — mutual cert auth. Most secure. Needs PKI ([[pki-uvod]]).
- **PEAP** — server cert + user password (often via EAP-MSCHAPv2).
- **EAP-TTLS** — similar to PEAP.
- **EAP-FAST** — Cisco alternative.

Each user has unique credentials. Logged at RADIUS. Revocation simple.

## Mode comparison

| Mode | Auth | Use Case |
| :--- | :--- | :--- |
| WPA2-Personal (PSK) | shared password | home, small business |
| WPA2-Enterprise | per-user EAP | corporate |
| WPA3-Personal (SAE) | improved password | newer home |
| WPA3-Enterprise | EAP + improvements | newer corp |

## Migration

- **WPA2 Personal** with strong password — current minimum.
- **WPA3 Personal** — preferred for new deployments.
- **WPA2 Enterprise** — for corporate.
- **WPA2 Personal with weak password** — broken in hours.

Wi-Fi Alliance: WPA2 still acceptable. WPA3 best practice for new.

---

*Zdroj: BIS přednášky 2025/26, Ing. Matej Kačic, FIT VUT v Brně. Externí reference: IEEE 802.11i:2004 — Medium Access Control (MAC) Security Enhancements; Vanhoef, M., Piessens, F.: „Key Reinstallation Attacks: Forcing Nonce Reuse in WPA2" (CCS 2017, [PDF](https://papers.mathyvanhoef.com/ccs2017.pdf)); Beck, M., Tews, E.: „Practical Attacks Against WEP and WPA" (WiSec 2009); RFC 3748 — EAP; [Wi-Fi Alliance](https://www.wi-fi.org/).*
