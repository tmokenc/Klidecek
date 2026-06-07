---
title: WPA3 — SAE a moderní zabezpečení WiFi
---

# WPA3 — Wi-Fi Protected Access 3

Wi-Fi Alliance v roce 2018 reagovala na slabiny WPA2 (útok KRACK, offline prolamování PSK hrubou silou) novým standardem. WPA3 vylepšuje *všechny* aspekty zabezpečení.

## Vlastnosti WPA3

### SAE — Simultaneous Authentication of Equals

Nahrazuje 4cestné navázání spojení (4-way handshake) s předsdíleným klíčem (PSK) z WPA2. Jádrem je výměna klíčů Dragonfly (RFC 7664).

### Dopředná bezpečnost (forward secrecy)

I když heslo (PSK) unikne *později*, *dříve* proběhlé relace zůstávají v bezpečí. WPA2 tuto vlastnost nemělo. To znamená, že odposlechnutá data ze staré relace nelze zpětně dešifrovat, ani když útočník později získá heslo k síti.

### Chráněné správové rámce (Protected Management Frames, PMF)

Povinné. Brání útokům na odpojení (deauthentication), tedy vynucenému odpojení klientů od sítě.

### Bezpečnostní režim 192 bitů

Určen pro firemní (Enterprise) nasazení. Odpovídá sadě CNSA (Commercial National Security Algorithm).

### Easy Connect (DPP)

Nastavení zařízení internetu věcí (IoT) pomocí QR kódu. Není potřeba žádné heslo.

## SAE — výměna klíčů Dragonfly

Jde o autentizovanou výměnu Diffie-Hellman odvozenou z hesla.

### Protokol

1. Klient i přístupový bod (AP) znají **heslo**.
2. Každá strana vygeneruje náhodné číslo.
3. Odvodí se sdílené tajemství pomocí PAKE (password-authenticated key exchange — výměna klíčů autentizovaná heslem).
4. Obě strany si vzájemně ověří znalost hesla.
5. Odvodí se klíče relace.

Matematicky řečeno:

- Heslo se zobrazí na bod P na eliptické křivce.
- Každá strana zvolí náhodné r_i a odešle závazek commit_i = mask_i * P + r_i * G.
- Strany si závazky vymění a zkombinují je.

(Jde o zjednodušení; skutečné SAE je složitější.)

### Odolnost vůči offline útoku hrubou silou

Útočník může odposlechnout navázání spojení (handshake), ale **nemůže** prolomit heslo offline.

Proč: každý pokus vyžaduje *online* interakci s přístupovým bodem. AP navíc omezuje rychlost pokusů (rate-limiting), takže útočník zvládne jeden pokus za sekundu místo miliardy pokusů za sekundu.

**Offline prolamování hrubou silou je tím odstraněno.** Zásadní zlepšení.

::: viz wpa3-sae-vs-psk-brute "Vyber délku hesla a charset; sleduj čas-do-prolomení pro WPA2 (offline, ~1 MH/s GPU) vs WPA3-SAE (online, 1 attempt/s). Krátká hesla stále zranitelná, ale jen online → infeasible v praxi."
:::

### Odolnost vůči slovníkovému útoku

I slabá hesla se prolamují obtížněji — útočník se totiž musí pro každý pokus k síti připojit.

## Dopředná bezpečnost (forward secrecy)

Každá relace si odvozuje *čerstvé* klíče z výměny Diffie-Hellman.

Pokud párový hlavní klíč (PMK) v budoucnu unikne:

- WPA2 — *všechny* dřívější relace lze dešifrovat (PMK je stále stejný).
- WPA3 — dřívější relace jsou *v bezpečí* (každá relace má vlastní klíče odvozené přes DH).

## Chráněné správové rámce (Protected Management Frames)

WPA2 (volitelný doplněk 802.11w) podepisovalo rámce související s autentizací. WPA3 je *vyžaduje* povinně.

Obrana proti:

- **Záplava odpojovacích rámců (deauthentication flood)** — útočník podvrhne odpojovací rámec a vyhodí klienty ze sítě.
- **Útoky na rozpojení asociace (disassociation attacks)**.
- **Podvržení beaconů (beacon spoofing)**.

Moderní WiFi karty podporují PMF nativně.

## Easy Connect (DPP)

Device Provisioning Protocol (protokol pro zprovoznění zařízení). Nastavení IoT zařízení pomocí QR kódu.

```
1. Read QR code → device's public key.
2. AP encrypts WiFi credentials with device's public key.
3. Device decrypts → joins network.
```

Žádné psaní hesla, žádný PIN pro WPS. Vhodnější pro IoT zařízení bez klávesnice.

## Firemní režim 192 bitů (Enterprise)

WPA3-Enterprise nabízí volitelný 192bitový režim „suite B":

- ECDH s křivkou P-384.
- ECDSA s křivkou P-384.
- AES-256-GCM.
- HMAC-SHA384.

Odpovídá sadě **CNSA** (Commercial National Security Algorithm) — standardu vlády USA pro systémy se stupněm utajení SECRET.

Případ použití: státní správa, armáda, dodavatelé v obranném sektoru.

## Zpětná kompatibilita

**Přechodový režim (transition mode)** — přístupový bod přijímá současně WPA2-PSK i WPA3-SAE.

Umožňuje provoz smíšených sítí během migrace. *Pozor však*: na klientech s WPA2 jsou slabiny WPA2 stále zneužitelné.

Osvědčený postup: nasadit **pouze WPA3 (WPA3-only)**, pokud je to možné.

## Útoky na WPA3 {tier=practice}

### Dragonblood (2019)

Mathy Vanhoef a Eyal Ronen. Několik útoků na rané implementace SAE.

- **Útoky degradací (downgrade attacks)** — vynutí v přechodovém režimu návrat zpět k WPA2.
- **Postranní časové útoky (side-channel timing attacks)** — z časování unikají informace o hesle.
- **Útoky na dostupnost (DoS attacks)** — vyčerpají procesor výpočty Dragonfly.

Záplaty byly nasazeny. Moderní implementace jsou opravené.

### FragAttacks (2021)

Opět Vanhoef. Útoky na fragmentaci a agregaci rámců — návrhové chyby ve fragmentaci a agregaci rámců 802.11, které postihují Wi-Fi zařízení (včetně WPA3).

Jde o konkrétní zranitelnosti v konkrétních implementacích.

### Implementační chyby

*Protokol* WPA3 je sám o sobě v pořádku. Jeho *implementace* však stále trpí chybami (například poškození paměti v žadateli o připojení WPA3 a podobně).

Vanhoefův výzkum ukazuje, že zranitelnosti se i nadále objevují v nástrojích wpa_supplicant a hostapd.

## Rozšíření (adopce)

| Výrobce | Podpora WPA3 |
| :--- | :--- |
| iOS 13+ | Ano |
| Android 10+ | Ano |
| Windows 10 1903+ | Ano |
| Linux (wpa_supplicant 2.7+) | Ano |
| Nové routery (od 2019) | Většinou ano |
| Staré routery | Může přibýt aktualizací firmwaru |

Moderní zařízení WPA3 zvládají. Rozšíření roste. Mnoho sítí ale stále běží na WPA2 ze setrvačnosti.

## Wi-Fi 6 + WPA3

Wi-Fi 6 (802.11ax, 2019) *vyžaduje* WPA3 pro *nová* zařízení. Je to povinné.

Wi-Fi 7 (802.11be, 2024) v tom pokračuje. WPA3 tu zůstane natrvalo.

## Doporučení

### Domácnost / malá firma

- Použijte **WPA3-Personal** (SAE).
- Silné heslo (stále důležité — chrání před zákeřným insiderem i budoucím prolomením).
- Vypněte WPS.
- Zapněte PMF.
- Pravidelně aktualizujte firmware.

### Firemní prostředí

- **WPA3-Enterprise** s EAP-TLS (certifikáty).
- 192bitový režim pro citlivá data.
- RADIUS server s řádnou správou uživatelů.
- Řízení přístupu k síti (network access control, NAC).

### Internet věcí (IoT)

- Pokud to jde, využijte **Easy Connect (DPP)**.
- Vyhrazená *IoT VLAN* — oddělte ji od hlavní sítě.
- Segmentace sítě.

### Starší zařízení (legacy)

- Pokud musíte podporovat stará zařízení, použijte *přechodový režim* WPA2.
- Naplánujte migraci na WPA3.

## Veřejná Wi-Fi

Kavárna, letiště, hotel:

- **OWE** (Opportunistic Wireless Encryption — oportunistické bezdrátové šifrování, 802.11 + WPA3) — šifruje provoz i u otevřených sítí.
- Jinak: počítejte s tím, že provoz je viditelný. Pro citlivé aktivity použijte **VPN** ([[vpn-ipsec]]).

---

*Zdroj: BIS přednášky 2025/26, Ing. Matej Kačic, FIT VUT v Brně. Externí reference: Wi-Fi Alliance: WPA3™ Specification ([wi-fi.org](https://www.wi-fi.org/discover-wi-fi/security)); Harkins, D.: „Dragonfly Key Exchange" (RFC 7664, IETF 2015); Vanhoef, M., Ronen, E.: „Dragonblood: Analyzing the Dragonfly Handshake of WPA3 and EAP-pwd" (S&P 2020, [dragonblood.org](https://wpa3.mathyvanhoef.com/)); IEEE 802.11-2020.*
