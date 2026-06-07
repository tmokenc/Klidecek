---
title: WiFi útoky — KRACK, FragAttacks, evil twin, deauth
---

# WiFi útoky — KRACK, FragAttacks, evil twin a další

I s WPA3 ([[wpa3]]) zůstávají WiFi sítě *zranitelné*. Útoky kombinují slabiny protokolu (protocol weaknesses), chyby v implementaci (implementation bugs) a sociální inženýrství (social engineering). Tato sekce katalogizuje hlavní moderní útoky (attack).

## KRACK (2017)

Už jsme se o něm zmínili v [[wpa-wpa2]]. Stručné připomenutí:

- Mathy Vanhoef objevil útok přehráním (replay attack) na čtyřcestný handshake (4-way handshake) protokolu WPA2.
- Přehrání zprávy Msg 3 přiměje klienta znovu nainstalovat klíč PTK → opakované použití nonce (nonce reuse) → opakované použití klíčového proudu (keystream reuse) → možnost dešifrování.
- Zasaženi byli prakticky všichni WPA2 klienti.

Záplata (patch) byla nasazena plošně. Moderní zařízení mají problém opravený.

## FragAttacks (2021)

Opět dílo Mathyho Vanhoefa. Jde o **útoky na fragmentaci a agregaci (Fragmentation and Aggregation Attacks)**.

Celkem 3 koncepční nedostatky v návrhu (design flaws) a 9 implementačních chyb (implementation bugs) ve standardu 802.11.

### Koncepční nedostatky v návrhu

- **Skládání fragmentů (fragment reassembly)** — fragmenty zašifrované různými klíči (key) jsou považovány za jeden a tentýž paket.
- **Agregace (aggregation)** — hlavička podrámce A-MSDU není autentizovaná.
- **Otrava cache (cache poisoning)** — fragmenty zůstávají uložené i napříč opakovanými asociacemi (reassociation) klienta k síti.

### Příklad: injektáž A-MSDU

Útočník (attacker) vloží do legitimního fragmentu hlavičku podrámce A-MSDU, čímž paket přesměruje na cíl, který si zvolí. Jinými slovy: zneužije nedostatečné ověření hlavičky k tomu, aby provoz odklonil k sobě.

Zasaženo bylo téměř každé Wi-Fi zařízení. Záplaty byly vydány plošně.

## Deautentizační útoky

Podvržený (spoofing) řídicí rámec (management frame) odpojí klienta od sítě.

```bash
aireplay-ng -0 5 -a TARGET_BSSID -c TARGET_CLIENT wlan0mon
```

Dokud nebyla ochrana řídicích rámců (PMF) povinná až ve WPA3, byly deautentizační útoky *triviální*. Využívají se k:

- **Odepření služby (DoS)** — vyhození uživatelů ze sítě.
- **Vynucení opětovné autentizace (authentication)** — zachycení handshake pro pozdější offline prolomení (crack) hesla.
- **Přípravě phishingu (phishing)** — vyhození klienta z legitimního AP s nadějí, že se připojí k podvrženému evil twin.

Obrana: **802.11w (Protected Management Frames, ochrana řídicích rámců)** — ve WPA3 povinná, ve WPA2 volitelná.

## Evil Twin

Útočník zprovozní podvržený přístupový bod (rogue AP) se stejným SSID jako legitimní síť. Klienti se k němu připojí automaticky, pokud má silnější signál nebo pokud je legitimní AP nedostupné.

### Nástroje

- **Wifiphisher** — automatizovaný evil twin spolu s phishingem.
- **hostapd-wpe** — nepřátelský AP určený k odchytávání přihlašovacích údajů.

### Postup

1. Deautentizace uživatelů z legitimního AP.
2. Spuštění podvrženého AP se stejným SSID, buď jako *otevřené* sítě, nebo s odchycenými přihlašovacími údaji.
3. Uživatelé se připojí k podvrženému AP.
4. Útočník provádí útok muže uprostřed (MITM), sběr přihlašovacích údajů a injektáž malwaru.

### Obrana

- **Ověření klientského certifikátu** (Enterprise EAP-TLS).
- **HSTS** — prohlížeče odmítnou degradaci spojení (downgrade) zpět na HTTP.
- **VPN** — šifruje (encryption) provoz i v podvržené síti.
- **Nepřipojovat se automaticky** k otevřeným sítím.

## Zneužití captive portálu

WiFi v kavárně nebo hotelu: otevřená síť, která přesměruje uživatele na přihlašovací stránku.

Útoky:

- **Sběr přihlašovacích údajů** — falešný portál vypadá jako ten legitimní.
- **Šíření malwaru** — falešná výzva „aktualizujte si software".
- **MITM** — jakmile je klient připojen, útočník odposlouchává provoz.

Obrana: zapnout VPN ještě před zahájením prohlížení.

## Karma útok

Moderní WiFi klienti pravidelně vyhledávají *známé* SSID pomocí rámce „Probe Request".

Útočník tyto požadavky (request) zachytí, a tím zjistí, které sítě klient zná.

Podvržený AP pak odpoví na *jakýkoli* požadavek („ano, jsem 'HomeWiFi'") a klient se k němu připojí.

Obrana: nepřipojovat se automaticky ke známým sítím (v moderních operačních systémech je to z velké části ošetřeno).

## Útok hrubou silou na PIN WPS

PIN u WPS má 8 číslic. *Mělo by* tedy existovat 10^8 = 100 milionů kombinací. Jenže *chyba v návrhu* PIN rozdělí na dvě části, takže ho lze prolomit hrubou silou (brute force) už za *11 000* pokusů.

Nástroje: **Reaver, Bully**.

Doba prolomení: hodiny až dny podle konkrétního AP.

Obrana: vypnout WPS. Většina moderních AP jeho vypnutí umožňuje.

## Útoky na Bluetooth

Příbuzná bezdrátová technologie. Stručný přehled:

- **Bluejacking** — odesílání nevyžádaných zpráv.
- **Bluesnarfing** — neoprávněný přístup k datům.
- **KNOB útok** (2019) — snížení síly šifrování Bluetooth na pouhý 1 bajt, což umožní triviální prolomení.
- **BlueBorne** (2017) — vzdálené spuštění kódu (RCE) přes Bluetooth.
- **Odchyt provozu BLE** — odposlech párování BLE.

Moderní Bluetooth (verze 5.x) je proti těmto útokům odolnější.

## Manipulace s beacon rámci

WiFi přístupové body vysílají beacon rámce, které inzerují SSID a schopnosti sítě.

Útočník může:

- **Podvrhnout beacon (spoof beacon)** — vydávat se za jiné AP.
- **Skrýt SSID** — i AP, která skrývají SSID, stále odpovídají na *známé* požadavky.

## Fuzzing WiFi protokolu

Aktuální výzkum: fuzzing protokolového zásobníku (stack) 802.11 vede k pádům ovladačů a vzdálenému spuštění kódu (RCE) v jádře.

- **CVE v ovladači Linux iwlwifi**.
- **CVE v macOS AirPort**.
- **RCE v čipech Broadcom WiFi** (Project Zero, 2017).

Obrana: udržovat ovladače i firmware aktualizované záplatami.

## Souhrn obranných opatření

### Na úrovni sítě

- **WPA3** je upřednostňované. V případě potřeby WPA2 se silným heslem.
- **PMF** povolené.
- **WPS vypnuté**.
- **Silný PSK** (12 a více náhodných znaků).
- **Síť pro hosty** oddělená od hlavní sítě.
- **Aktualizace firmwaru** — nasazovat bez prodlení.

### Pro podnikové prostředí

- **802.1X s EAP-TLS** — autentizace pomocí certifikátu.
- **WIDS** (Wireless IDS, bezdrátový systém detekce průniku) — odhalování podvržených AP a evil twins.
- **WIPS** (Wireless IPS, bezdrátový systém prevence průniku) — automatické odpojování podvržených klientů.
- **Průzkum lokality (site survey)** — identifikace podvržených přístupových bodů.

### Na úrovni klienta

- **VPN** pro citlivý provoz.
- **Nepřipojovat se automaticky** k neznámým sítím.
- **Spravovat uložené sítě** — odebrat staré.
- **Používat HTTPS** — weby s HSTS odolávají některým MITM útokům.
- **Vypnout nepoužívaná rozhraní** — například Bluetooth, když se nevyužívá.

### Monitorování

- **Kismet** — detekce bezdrátových sítí.
- **Airodump-ng** — pasivní monitorování.
- **WiFi Pineapple** — nástroj pro penetrační testování (Hak5).

## Případy z praxe {tier=example}

- **Útok na TJX (2007)** — zneužití (exploit) WEP, odcizeno 45 milionů údajů o platebních kartách.
- **Ashley Madison (2015)** — k úniku dat přispělo kompromitování interní WiFi.
- **Síť v Mar-a-Lago (2019)** — otevřená WiFi a bezpečnostní obavy.
- **Průniky do hotelových WiFi sítí** — postiženo více řetězců.

WiFi zůstává vektorem útoku s *velkým dopadem*. Moderní kryptografie spolu s PMF, EDR a monitorováním riziko snižují, ale neeliminují.

## Budoucnost zabezpečení WiFi

- **Wi-Fi 7** (802.11be, 2024) — WPA3 povinné, technika OFDMA zlepšuje odolnost.
- **Pre-Shared Key 2.0** (PSK2) — směr výzkumu usilující o zvýšení bezpečnosti domácí WiFi nad rámec SAE.
- **OWE** (Opportunistic Wireless Encryption) — šifruje i *otevřené* sítě.

Standardy se vyvíjejí. Implementace za nimi zaostává.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=mYtvjijATa4" "Krack Attacks (WiFi WPA2 Vulnerability) - Computerphile" "Computerphile"
:::

*Zdroj: BIS přednášky 2025/26, Ing. Matej Kačic, FIT VUT v Brně. Externí reference: Vanhoef, M., Piessens, F.: „Key Reinstallation Attacks" (CCS 2017); Vanhoef, M.: „Fragment and Forge: Breaking Wi-Fi Through Frame Aggregation and Fragmentation" (USENIX Security 2021, [fragattacks.com](https://www.fragattacks.com/)); Vanhoef, M., Ronen, E.: „Dragonblood" (S&P 2020); [Aircrack-ng Tutorials](https://www.aircrack-ng.org/doku.php?id=tutorial); [Wireshark Wi-Fi capture](https://wiki.wireshark.org/CaptureSetup/WLAN); Hak5 — WiFi Pineapple documentation.*
