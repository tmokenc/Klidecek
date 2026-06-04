---
title: WEP — Wired Equivalent Privacy (broken)
---

# WEP — Wired Equivalent Privacy

**WEP** byl první bezpečnostní standard pro WiFi (IEEE 802.11, 1997). *Wired Equivalent Privacy* slibovala bezpečnost srovnatelnou s kabelovou sítí. *Slibu nedostála* — během několika let byla *zcela prolomena*. Klasická lekce v *nepoužívejte staré kryptografie* a *don't roll your own crypto*.

## WEP architecture

WEP staví na:

- **RC4** stream cipher ([[proudove-sifry]]).
- 40-bit nebo 104-bit *shared* klíč (often 5 nebo 13 ASCII characters).
- 24-bit **IV** (Initialization Vector) — concatenated with key for each frame.
- **CRC-32** for "integrity" (broken — not cryptographic MAC).

```
WEP keystream = RC4(IV || K)
encrypted = (plaintext || CRC32(plaintext)) XOR keystream
WEP frame = IV || encrypted
```

## Authentication WEP

### Open System

No authentication. Client associates freely. **WEP encrypts data only**.

### Shared Key

Challenge-response:

1. Client requests authentication.
2. AP sends random 128-byte challenge.
3. Client encrypts challenge with WEP key → returns.
4. AP decrypts, verifies match.

**Ironically less secure** than Open System: attacker captures challenge + response (plaintext + ciphertext) → derive keystream → can encrypt arbitrary data.

## WEP fundamental flaws

### Flaw 1: IV too small

24-bit IV → 2^24 = 16.7M unique values. Reused after ~few hours on busy network.

When *same IV + same key* → *same keystream*. Two ciphertexts with shared keystream:

$$
C_1 \oplus C_2 = P_1 \oplus P_2
$$

Attacker XORs ciphertexts → reveals plaintext XOR. Statistical analysis recovers plaintexts.

### Flaw 2: RC4 weak keys (FMS attack)

**Fluhrer-Mantin-Shamir** (2001) — RC4 weakness: certain IV patterns *leak key bytes*.

Attacker passively collects packets. After ~50k-1M frames, recovers WEP key.

Tools: airodump-ng (capture), aircrack-ng (analyze).

### Flaw 3: CRC-32 not cryptographic

CRC-32 is *linear* — `CRC(M XOR D) = CRC(M) XOR CRC(D)`.

Attacker can:

1. Modify ciphertext bits.
2. Adjust CRC accordingly.
3. Receiver's CRC check passes → undetected modification.

**Integrity broken**. Attacker can inject packets without knowing key.

### Flaw 4: Klein attack (2005)

Improved FMS. Reduced packet count to ~40k.

### Flaw 5: PTW attack (2007)

Pychkine-Tews-Weinmann. Aircrack-ptw. ~40-85k packets → key recovery in *minutes*.

### Flaw 6: ChopChop attack (2004)

Decrypt packet *without* key. Modify last byte iteratively, detect valid ICV via AP response.

## Reálný útok {tier=example}

```bash
# Put wireless card in monitor mode
airmon-ng start wlan0

# Capture traffic from target network
airodump-ng wlan0mon

# Filter to target BSSID
airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF -w capture wlan0mon

# Inject deauth to trigger more traffic
aireplay-ng -0 5 -a AA:BB:CC:DD:EE:FF wlan0mon

# Crack WEP key
aircrack-ng capture-01.cap
```

Total time: 5-15 minutes for 64-bit WEP. 128-bit slightly longer.

::: viz wep-fms-cracker "Spusť capture (zapni ARP replay pro 10× rychlost). Bar 'weak IVs' roste; key byty se postupně dopočítají statisticky. ~40k paketů → 104-bit klíč zlámaný."
:::

## ARP injection — speed up {tier=example}

If target network quiet, no traffic to collect. **ARP replay attack**:

1. Capture *one* ARP request from target.
2. Replay it repeatedly → AP responds → collect more IVs.

aireplay-ng `-3` mode does this. *Active* attack.

## Why WEP took so long to die {tier=extra}

- **Backwards compatibility** — old devices.
- **Inertia** — "we have WEP, we're secure".
- **WPS** — Wi-Fi Protected Setup pushed adoption of newer (but with own flaws).
- **Industry slowness** — IEEE 802.11i (WPA2) standardized 2004, slow adoption.

WEP deprecated 2004 (IEEE 802.11i). Mostly disappeared 2010s. Some legacy IoT, industrial may still use.

## Lessons learned

1. **Use proven protocols** — don't design own.
2. **IV size matters** — must be large enough to never reuse.
3. **Stream cipher reuse = disaster** — same keystream for different plaintexts = total break.
4. **Cryptographic MAC** required for integrity, not CRC.
5. **Key length isn't only thing** — design + math matter more.

WEP became a *cautionary tale* in cryptography education.

## After WEP

| Year | Standard | Notes |
| :--- | :---: | :--- |
| 1997 | WEP | broken |
| 2003 | WPA (TKIP) | interim fix, mostly broken |
| 2004 | WPA2 (CCMP/AES) | mainstream, IEEE 802.11i |
| 2018 | WPA3 (SAE) | current best |

Detail v [[wpa-wpa2]], [[wpa3]].

## WEP in practice today

- **Legacy industrial** — old SCADA, IoT.
- **Some hotel routers** — slow updates.
- **Personal old routers** — many people don't update.

If WEP encountered: *bypass in minutes*. Treat unencrypted equivalent.

Modern WiFi clients (Windows 10+, macOS, Linux) increasingly *refuse* WEP. Apple iOS 14+ warns.

---

*Zdroj: BIS přednášky 2025/26, Ing. Matej Kačic, FIT VUT v Brně. Externí reference: Fluhrer, S., Mantin, I., Shamir, A.: „Weaknesses in the Key Scheduling Algorithm of RC4" (SAC 2001); Tews, E., Weinmann, R.-P., Pyshkin, A.: „Breaking 104 bit WEP in less than 60 seconds" (WISA 2007, [PDF](https://eprint.iacr.org/2007/120.pdf)); IEEE 802.11i:2004 — Security Enhancements; [aircrack-ng](https://www.aircrack-ng.org/); Anderson, R.: „Security Engineering" (3rd ed., Wiley 2020), §16.*
