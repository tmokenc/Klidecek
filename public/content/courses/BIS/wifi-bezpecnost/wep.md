---
title: WEP — Wired Equivalent Privacy (prolomený)
---

# WEP — Wired Equivalent Privacy

**WEP** byl první bezpečnostní standard pro WiFi (IEEE 802.11, 1997). Název *Wired Equivalent Privacy* sliboval bezpečnost srovnatelnou s kabelovou sítí. *Slibu nedostál* — během několika let byl *zcela prolomen*. Je to klasická lekce z kategorie *nepoužívejte staré kryptografie* a *nevymýšlejte si vlastní kryptografii* (don't roll your own crypto).

## Architektura WEP

WEP staví na:

- proudové šifře (stream cipher) **RC4** ([[proudove-sifry]]);
- sdíleném (shared) 40bitovém nebo 104bitovém klíči (klíč) — často 5 nebo 13 znaků ASCII;
- 24bitovém **IV** (Initialization Vector, inicializační vektor) — pro každý rámec se spojí (zřetězí) s klíčem;
- **CRC-32** pro „integritu" (prolomené — nejde o kryptografický MAC).

```
WEP keystream = RC4(IV || K)
encrypted = (plaintext || CRC32(plaintext)) XOR keystream
WEP frame = IV || encrypted
```

## Autentizace ve WEP

### Open System

Žádná autentizace (authentication). Klient se připojí (asociuje) volně. **WEP zde šifruje pouze data.**

### Shared Key

Princip výzva–odpověď (challenge-response):

1. Klient požádá o autentizaci.
2. AP pošle náhodnou 128bajtovou výzvu (challenge).
3. Klient výzvu zašifruje klíčem WEP a vrátí ji zpět.
4. AP ji dešifruje a ověří shodu.

**Paradoxně je tento režim méně bezpečný** než Open System: útočník (attacker) zachytí výzvu i odpověď (tedy otevřený text plaintext i šifrový text ciphertext), z nich odvodí keystream a poté může zašifrovat libovolná data.

## Zásadní slabiny WEP

### Slabina 1: příliš malý IV

24bitový IV → 2^24 = 16,7 milionu jedinečných hodnot. Na vytížené síti se začnou opakovat už po několika hodinách.

Když nastane *stejný IV + stejný klíč*, vznikne *stejný keystream*. Pro dva šifrové texty se sdíleným keystreamem platí:

$$
C_1 \oplus C_2 = P_1 \oplus P_2
$$

Útočník provede XOR obou šifrových textů a tím odhalí XOR otevřených textů. Statistická analýza pak umožní oba otevřené texty zrekonstruovat.

### Slabina 2: slabé klíče RC4 (útok FMS)

**Fluhrer–Mantin–Shamir** (2001) — slabina RC4: některé vzory IV *prozrazují bajty klíče*.

Útočník pasivně sbírá pakety. Po zhruba 50 tisících až 1 milionu rámců dokáže klíč WEP obnovit.

Nástroje: airodump-ng (zachytávání), aircrack-ng (analýza).

### Slabina 3: CRC-32 není kryptografické

CRC-32 je *lineární* — `CRC(M XOR D) = CRC(M) XOR CRC(D)`.

Útočník proto může:

1. Změnit bity šifrového textu.
2. Odpovídajícím způsobem upravit CRC.
3. Kontrola CRC na straně příjemce projde → modifikace zůstane neodhalena.

**Integrita je prolomená.** Útočník dokáže vkládat pakety, aniž by znal klíč.

### Slabina 4: Kleinův útok (2005)

Vylepšení útoku FMS. Snížil potřebný počet paketů na zhruba 40 tisíc.

### Slabina 5: útok PTW (2007)

Pychkine–Tews–Weinmann. Nástroj aircrack-ptw. Zhruba 40–85 tisíc paketů → obnovení klíče během *několika minut*.

### Slabina 6: útok ChopChop (2004)

Dešifrování paketu *bez* klíče. Útočník iterativně mění poslední bajt a podle odpovědi AP zjišťuje, kdy je hodnota ICV platná.

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

Celková doba: 5–15 minut pro 64bitový WEP. U 128bitového o něco déle.

::: viz wep-fms-cracker "Spusť capture (zapni ARP replay pro 10× rychlost). Bar 'weak IVs' roste; key byty se postupně dopočítají statisticky. ~40k paketů → 104-bit klíč zlámaný."
:::

## ARP injection — zrychlení útoku {tier=example}

Pokud je cílová síť tichá, není co sbírat — chybí provoz. Pomůže **útok ARP replay** (přehrání ARP):

1. Zachyť *jeden* ARP požadavek (request) z cílové sítě.
2. Opakovaně jej přehrávej → AP odpovídá → tím sesbíráš více hodnot IV.

To dělá režim `-3` nástroje aireplay-ng. Jde o *aktivní* útok.

## Proč WEP tak dlouho přežíval {tier=extra}

- **Zpětná kompatibilita** — kvůli starým zařízením.
- **Setrvačnost** — „máme WEP, jsme přece v bezpečí".
- **WPS** — Wi-Fi Protected Setup podpořil přechod na novější (ale rovněž chybné) řešení.
- **Pomalost odvětví** — standard IEEE 802.11i (WPA2) byl schválen už v roce 2004, jeho nasazení ale probíhalo pomalu.

WEP byl označen za zastaralý v roce 2004 (IEEE 802.11i). Z větší části zmizel během let 2010+. Některá starší zařízení IoT a průmyslová technika jej mohou používat dodnes.

## Co si z toho odnést

1. **Používejte ověřené protokoly** — nenavrhujte si vlastní.
2. **Na velikosti IV záleží** — musí být dost velký, aby se nikdy neopakoval.
3. **Opakované použití proudové šifry = katastrofa** — stejný keystream pro různé otevřené texty znamená úplné prolomení.
4. **Pro integritu je nutný kryptografický MAC**, nikoli CRC.
5. **Délka klíče není všechno** — návrh a matematika za ním rozhodují víc.

WEP se stal *odstrašujícím příkladem* ve výuce kryptografie.

## Po WEP

| Rok | Standard | Poznámky |
| :--- | :---: | :--- |
| 1997 | WEP | prolomený |
| 2003 | WPA (TKIP) | provizorní záplata, z větší části prolomená |
| 2004 | WPA2 (CCMP/AES) | rozšířený standard, IEEE 802.11i |
| 2018 | WPA3 (SAE) | aktuálně nejlepší |

Detail v [[wpa-wpa2]], [[wpa3]].

## WEP v praxi dnes

- **Starší průmyslová technika** — staré systémy SCADA, IoT.
- **Některé hotelové routery** — pomalé aktualizace.
- **Staré domácí routery** — mnoho lidí je neaktualizuje.

Pokud na WEP narazíte, počítejte s tím, že jde *obejít během několika minut*. Berte jej jako rovnocenný nešifrovanému provozu.

Moderní WiFi klienti (Windows 10+, macOS, Linux) WEP stále častěji *odmítají*. Apple iOS 14+ na něj upozorňuje varováním.

---

*Zdroj: BIS přednášky 2025/26, Ing. Matej Kačic, FIT VUT v Brně. Externí reference: Fluhrer, S., Mantin, I., Shamir, A.: „Weaknesses in the Key Scheduling Algorithm of RC4" (SAC 2001); Tews, E., Weinmann, R.-P., Pyshkin, A.: „Breaking 104 bit WEP in less than 60 seconds" (WISA 2007, [PDF](https://eprint.iacr.org/2007/120.pdf)); IEEE 802.11i:2004 — Security Enhancements; [aircrack-ng](https://www.aircrack-ng.org/); Anderson, R.: „Security Engineering" (3rd ed., Wiley 2020), §16.*
