---
title: WPA3 — SAE a moderní WiFi bezpečnost
---

# WPA3 — Wi-Fi Protected Access 3

Wi-Fi Alliance (2018) odpověděl na **WPA2 weaknesses** (KRACK, offline PSK brute-force) novým standardem. WPA3 zlepšuje *všechny* aspekty.

## WPA3 features

### SAE — Simultaneous Authentication of Equals

Nahrazuje **PSK 4-way handshake** WPA2. **Dragonfly** key exchange (RFC 7664).

### Forward secrecy

Even if PSK leaked *later*, *past* sessions remain secure. WPA2 didn't have this.

### Protected Management Frames (PMF)

Mandatory. Prevents deauthentication attacks (forced disconnect).

### 192-bit security mode

For Enterprise. Aligns with CNSA Suite (Commercial National Security Algorithm).

### Easy Connect (DPP)

QR code-based setup for IoT devices. No password required.

## SAE — Dragonfly key exchange

Authenticated Diffie-Hellman based on password.

### Protocol

1. Client + AP know **password**.
2. Each generates random.
3. Derive shared secret via PAKE (password-authenticated key exchange).
4. Verify mutual knowledge of password.
5. Derive session keys.

Mathematically:

- Map password → curve point P.
- Each side: random r_i, send commit_i = mask_i * P + r_i * G.
- Exchange and combine.

(Simplified; actual SAE more complex.)

### Resists offline brute-force

Attacker can capture handshake → cannot brute-force password offline.

Why: each attempt requires *online* interaction with AP. AP rate-limits → 1 guess/sec instead of 1 billion/sec.

**Offline brute-force eliminated.** Major win.

::: viz wpa3-sae-vs-psk-brute "Vyber délku hesla a charset; sleduj čas-do-prolomení pro WPA2 (offline, ~1 MH/s GPU) vs WPA3-SAE (online, 1 attempt/s). Krátká hesla stále zranitelná, ale jen online → infeasible v praxi."
:::

### Resists dictionary

Even weak passwords harder to crack — attacker must connect for each guess.

## Forward secrecy

Each session derives *fresh* keys from Diffie-Hellman.

Pokud PMK leaked future:

- WPA2 — *all* past sessions decryptable (PMK same).
- WPA3 — past sessions *safe* (per-session DH-derived keys).

## Protected Management Frames

WPA2 (optional 802.11w) signed authentication-related frames. WPA3 *requires* it.

Defense against:

- **Deauthentication flood** — attacker forges deauth frame → kicks clients off network.
- **Disassociation attacks**.
- **Beacon spoofing**.

Modern WiFi cards support PMF natively.

## Easy Connect (DPP)

Device Provisioning Protocol. IoT setup via QR code.

```
1. Read QR code → device's public key.
2. AP encrypts WiFi credentials with device's public key.
3. Device decrypts → joins network.
```

No password typing, no WPS PIN. Better for IoT devices without keyboards.

## Enterprise 192-bit

WPA3-Enterprise has optional 192-bit "suite B" mode:

- ECDH with P-384.
- ECDSA with P-384.
- AES-256-GCM.
- HMAC-SHA384.

Matches **CNSA** (Commercial National Security Algorithm) Suite — US government standard for SECRET-level systems.

Use case: government, military, defense contractors.

## Backward compatibility

**Transition mode** — AP accepts both WPA2-PSK and WPA3-SAE.

Allows mixed networks during migration. *But*: WPA2 weaknesses still exploitable on those clients.

Best practice: **WPA3-only** when feasible.

## WPA3 attacks

### Dragonblood (2019)

Mathy Vanhoef + Eyal Ronen. Multiple attacks on early SAE implementations.

- **Downgrade attacks** — force fallback to WPA2 in transition mode.
- **Side-channel timing attacks** — leak password info via timing.
- **DoS attacks** — exhaust CPU computing Dragonfly.

Patches deployed. Modern implementations fixed.

### FragAttacks (2021)

Vanhoef again. Fragmentation and aggregation attacks — design flaws in 802.11 frame fragmentation/aggregation affecting Wi-Fi devices (including WPA3).

Specific vulnerabilities in specific implementations.

### Implementation bugs

WPA3 *protocol* sound. *Implementations* still vulnerable to bugs (memory corruption in WPA3 supplicant, etc.).

Vanhoef's research shows ongoing vulnerabilities in wpa_supplicant, hostapd.

## Adoption

| Vendor | WPA3 adoption |
| :--- | :--- |
| iOS 13+ | Yes |
| Android 10+ | Yes |
| Windows 10 1903+ | Yes |
| Linux (wpa_supplicant 2.7+) | Yes |
| New routers (2019+) | Mostly yes |
| Old routers | Firmware update may add |

Modern devices speak WPA3. Adoption growing. Many networks still WPA2 due to inertia.

## Wi-Fi 6 + WPA3

Wi-Fi 6 (802.11ax, 2019) *requires* WPA3 for *new* devices. Mandatory.

Wi-Fi 7 (802.11be, 2024) continues. WPA3 here to stay.

## Recommendations

### Home / small business

- Use **WPA3-Personal** (SAE).
- Strong passphrase (still important — defends against insider, future cracking).
- Disable WPS.
- Enable PMF.
- Update firmware regularly.

### Corporate

- **WPA3-Enterprise** with EAP-TLS (certificates).
- 192-bit mode for sensitive data.
- RADIUS server with proper user management.
- Network access control (NAC).

### IoT

- Use **Easy Connect (DPP)** when possible.
- Dedicated *IoT VLAN* — isolate from main network.
- Network segmentation.

### Legacy

- WPA2 *transition mode* if must support old devices.
- Plan migration to WPA3.

## Public Wi-Fi

Coffee shop, airport, hotel:

- **OWE** (Opportunistic Wireless Encryption, 802.11 + WPA3) — encrypts even open networks.
- Otherwise: assume traffic visible. Use **VPN** ([[vpn-ipsec]]) for sensitive activities.

---

*Zdroj: BIS přednášky 2025/26, Ing. Matej Kačic, FIT VUT v Brně. Externí reference: Wi-Fi Alliance: WPA3™ Specification ([wi-fi.org](https://www.wi-fi.org/discover-wi-fi/security)); Harkins, D.: „Dragonfly Key Exchange" (RFC 7664, IETF 2015); Vanhoef, M., Ronen, E.: „Dragonblood: Analyzing the Dragonfly Handshake of WPA3 and EAP-pwd" (S&P 2020, [dragonblood.org](https://wpa3.mathyvanhoef.com/)); IEEE 802.11-2020.*
