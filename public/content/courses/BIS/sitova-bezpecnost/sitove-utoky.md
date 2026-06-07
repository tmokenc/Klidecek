---
title: Síťové útoky — scanning, MITM, ARP, DDoS
---

# Síťové útoky — od odposlechu po DDoS

Síť je *exponované* místo informačního systému — je to *sdílené médium*. Útoky na síťovou vrstvu (layer) jsou proto *zásadní*. Tato sekce přináší přehled (overview) jejich hlavních typů.

## Průzkum (reconnaissance) — pasivní

### OSINT

Sběr veřejně dostupných informací — toto téma už je probrané v [[social-engineering]].

### Skenování portů (port scanning)

Cílem je zjistit, které porty jsou na cílovém stroji otevřené.

```
nmap -sS 192.168.1.0/24
```

- **SYN scan** — rychlý a obtížně odhalitelný (nedokončuje navázání spojení).
- **Connect scan** — provede plný TCP handshake (pomalejší, spolehlivější, ale zaznamenává se do logů).
- **UDP scan** — pomalejší a méně spolehlivý.
- **Stealth techniky** — pomalé skenování, náhodné pořadí portů a falešné cíle (decoys), aby se útok skryl.

### Detekce služeb (service detection)

```
nmap -sV target
```

Banner grabbing — odečtení tzv. banneru služby, které prozradí verzi softwaru. Když útočník zná verzi, může si dohledat příslušné zranitelnosti (CVE).

### Identifikace operačního systému (OS fingerprinting)

Drobné zvláštnosti v implementaci TCP/IP zásobníku (stack) prozradí, o jaký operační systém jde:

```
nmap -O target
```

Windows, Linux, macOS i konkrétní distribuce — každý zanechává jemné, ale rozpoznatelné stopy.

## Aktivní útoky

### Odposlech (sniffing)

Jde o pasivní monitorování provozu. Nástroje: tcpdump, Wireshark.

```bash
sudo tcpdump -i eth0 port 80
```

V přepínané (switched) síti by útočník normálně neviděl provoz *ostatních* stanic. Může ovšem využít:

- **Promiscuous mode** — režim, ve kterém síťová karta zachytí všechny pakety na rozhraní (v rámci broadcast domény).
- **Span port** / port mirror — kopii provozu nakonfigurovanou administrátorem.
- **Kompromitovaný switch** — přes nějž lze zrcadlit všechny porty.
- **WiFi monitor mode** — režim pro zachycení všech bezdrátových rámců.

### ARP poisoning (otrávení ARP)

ARP (Address Resolution Protocol) překládá IP adresu na MAC adresu. Protokol *nemá žádnou autentizaci (authentication)*.

Útočník (attacker) pošle *podvrženou* ARP odpověď: „Já jsem 192.168.1.1 a moje MAC je XX:XX:XX:XX:XX:XX.“

Tím se aktualizuje ARP tabulka oběti. Budoucí pakety směřující na 192.168.1.1 pak putují k útočníkovi. Vzniká tak **MITM** (útok typu člověk uprostřed).

```bash
arpspoof -i eth0 -t victim_ip gateway_ip
```

### MAC flooding (zahlcení MAC adresami)

Útočník zasílá switchi velké množství náhodných MAC adres. Tím se zaplní jeho CAM tabulka. Switch poté *přejde do nouzového režimu* a začne *zaplavovat* síť — všechny pakety rozesílá (broadcast) na všechny porty.

Útočník tak může odposlouchávat *veškerý* provoz v dané broadcast doméně.

### DHCP spoofing (podvržení DHCP)

Útočník spustí podvodný (rogue) DHCP server. Klienti od něj dostanou IP adresu jeho brány → vzniká MITM.

### DNS spoofing (podvržení DNS)

Viz samostatná sekce **## Útoky na DNS** níže.

### MITM (Man-In-The-Middle, člověk uprostřed)

Útočník se vloží *mezi* dvě komunikující strany. Provoz čte, upravuje i přehrává (replay).

Tento útok lze ustanovit pomocí ARP poisoningu, DHCP spoofingu, podvodného WiFi přístupového bodu (AP) nebo přímo na úrovni poskytovatele připojení (ISP), což si mohou dovolit státní aktéři.

### Obrana

- **HTTPS / TLS** — šifruje (encryption) data; ověření certifikátu odhalí MITM (pokud útočník neovládá certifikační autoritu, CA).
- **HSTS** (HTTP Strict Transport Security) — prohlížeč odmítne sestoupit zpět na nešifrované HTTP.
- **DNSSEC** — zajišťuje integritu DNS.
- **Zabezpečení switche** — dynamic ARP inspection, DHCP snooping, port security.
- **VPN** — šifrovaný tunel, který lokální MITM obejde.

::: viz arp-poison-mitm "Klikni 'send fake ARP reply' — ARP tabulka oběti se aktualizuje na MAC útočníka. Pošli paket → směruje se přes útočníka. Přepni DAI: switch ověří a zablokuje."
:::

## Útoky na úrovni TCP

### TCP SYN flood (záplava SYN pakety)

Útočník posílá množství SYN paketů, *aniž by* dokončil navazování spojení. Server přitom pro každé spojení vyhrazuje stavové informace. Nakonec nastane:

- Tabulka spojení na serveru se zaplní → legitimní spojení jsou odmítána (DoS, odepření služby).

### Obrana

- **SYN cookies** — server nevyhrazuje stav, dokud nepřijde ACK. Z přijaté SYN cookie pak ověří platnost spojení.
- **Rate limiting** (omezení rychlosti) — zahazování SYN paketů nad stanovenou hranicí z jednoho zdroje.

### TCP reset injection (vstříknutí RST)

Útočník vstříkne RST paket s podvrženým sekvenčním číslem → tím ukončí legitimní spojení.

Tuto techniku používá:

- **Velký čínský firewall (Great Firewall of China)** — k cenzuře (resetuje HTTP spojení na blokovaný obsah).
- **Síťoví operátoři** — k tvarování šířky pásma (resetují P2P spojení).

### Obrana

- **TLS** — podvržení RST by vyžadovalo kontrolu nad kryptografickým stavem, což je bez klíčů (key) nemožné.
- **IPsec** — pakety jsou autentizované.

## Útoky na směrování (routing)

### BGP hijacking (únos BGP)

Útočník (poskytovatel připojení nebo kompromitovaný router) ohlásí *cesty (routes)* k IP rozsahu, který mu nepatří. Internet pak směruje provoz k němu.

Známé případy:

- **YouTube 2008** — Pákistán nedopatřením unesl YouTube v celosvětovém měřítku.
- **Russian Telecom 2017** — únos provozu Visy, MasterCard a bank.

### Obrana

- **RPKI** (Resource Public Key Infrastructure) — podepisování ohlášených cest. Z velké části nasazeno (~50 % cest).
- **Filtrování cest (route filtering)** — sousední uzly (peers) cesty ověřují.
- **Monitorování** — služby jako BGPmon nebo NLNOG RING detekují anomálie.

### Smurf útok (zastaralý)

Útočník pošle ICMP echo request na *broadcast adresu* s podvrženým zdrojem nastaveným na oběť. Všechny stanice pak odpoví oběti → DoS.

Moderní routery už na broadcast nepřeposílají. Útok je ve výchozí konfiguraci eliminován od počátku 21. století.

## DoS / DDoS

**Denial of Service (odepření služby)** — cílem je znepřístupnit službu.

**Distributed DoS (DDoS, distribuované odepření služby)** — útok z mnoha zdrojů útočníka (botnet, amplifikace).

### Objemové útoky (volume-based)

Zaplaví síť provozem:

- **UDP flood** — na náhodné porty.
- **ICMP flood**.
- **Amplifikace protokolu (protocol amplification)** — malý požadavek (request) vyvolá velkou odpověď (response). Zneužívají se protokoly NTP, DNS a Memcached.

Memcached útok 2018: 51 000× amplifikace. GitHub zasažen 1,35 Tb/s (28. 2. 2018); o týden později samostatný 1,7 Tb/s útok na zákazníka US poskytovatele (NETSCOUT).

### Protokolové útoky (protocol-based)

Vyčerpávají stavové automaty protokolů:

- **TCP SYN flood** (viz výše).
- Záplava **TCP fragmenty**.
- **Ping of death** (historický).

### Útoky na aplikační vrstvě

Pomalé nebo náročné HTTP požadavky:

- **Slowloris** — mnoho spojení, přes která se hlavičky posílají velmi pomalu.
- **HTTP GET flood** — mnoho požadavků na výpočetně náročné stránky.
- **Aplikační logika** — zneužití (exploit) pomalých dotazů.

### Obrana

- **Cloudová ochrana proti DDoS** — Cloudflare, AWS Shield, Akamai. Provoz pročistí (scrub) ještě dříve, než dorazí na původní server.
- **Rate limiting** (omezení rychlosti).
- **Anycast** — rozprostře provoz na více přístupových bodů (PoP).
- **CDN** — pohltí statický provoz.
- **Black-hole routing** — odsměrování provozu cílové IP do prázdna (null-route), jako poslední možnost.

### Příklady DDoS

- **Mirai 2016** — IoT botnet, útoky o 1 Tb/s (Dyn DNS — zasáhlo Twitter, Netflix).
- **GitHub 2018** — 1,35 Tb/s, Memcached amplifikace.
- **AWS 2020** — zmírněno 2,3 Tb/s.
- **Cloudflare 2022** — HTTPS záplava o 26 mil. požadavků/s.

Moderní útoky: stovky Gb/s jsou dnes běžné, dosažitelné jsou i Tb/s.

::: viz ddos-amplification "Vyber reflector protocol (DNS 28×, NTP 556×, memcached 51000×) + velikost botnetu. Spočte celkový reflected bandwidth + srovná s historickými útoky (Mirai 1 Tbps, GitHub 1.35 Tbps)."
:::

## Útoky na DNS

### DNS spoofing / poisoning (podvržení / otrávení DNS)

Vložení falešných záznamů do DNS cache. Využívá se při:

- **MITM** — přesměrování bank.com na útočníka.
- **Cenzuře** — Velký čínský firewall, poskytovatelé připojení.

### DNS rebinding

Doména attacker.com se zpočátku přeloží na IP útočníka. Prohlížeč z attacker.com načte JavaScript. Při pozdějším DNS dotazu se ovšem vrátí *interní IP* (192.168.1.1). JavaScript pak komunikuje s interním zařízením, přitom má stále původ (origin) attacker.com — politika stejného původu (same-origin policy) je tím obejita.

### Obrana

- **DNSSEC** — kryptografické podpisy.
- **DoH/DoT** (DNS over HTTPS/TLS) — šifrovaný DNS, který se obtížněji odposlouchává (MITM).
- **Ochrana proti DNS rebindingu** — prohlížeče a routery filtrují privátní IP adresy.

## Útoky na VPN

Kompromitace VPN brány:

- **Pulse Connect Secure** CVE-2019-11510 — vzdálené spuštění kódu (RCE).
- **Cisco ASA** CVE-2018-0101 — RCE ve VPN funkci.
- **Fortinet** — více zranitelností.

VPN brány jsou mimořádně cenné — představují vstup do interní sítě. Jejich záplatování (patching) je proto kritické.

## Útoky na bezdrátové sítě

Podrobně v [[wifi-utoky]]. Stručná ochutnávka:

- **Evil twin** — falešný přístupový bod (AP).
- **Prolomení WEP** — slabina šifry RC4 (aircrack-ng).
- **WPA2 KRACK** — replay útok (přehrání).
- **WPS PIN brute force** — útok hrubou silou na PIN.

## Detekce a obrana {tier=practice}

### Monitorování sítě (network monitoring)

- **NetFlow / IPFIX** — účtování provozu získané z routerů.
- **Packet capture** — kompletní pcap, nebo výběrový odposlech.
- **Monitorování DNS** — dotazů a odpovědí.

### IDS / IPS

Detailně v [[ids-ips]].

### SIEM

[[siem-monitoring]] koreluje informace z logů napříč systémy.

### Threat intelligence

Odebírej zpravodajské zdroje (feeds) — komerční i otevřené. Blokuj známé škodlivé IP adresy a domény.

## Segmentace

Síťová segmentace je *jednou z vrstev obrany*:

- **DMZ** — veřejně přístupné systémy v oddělené zóně.
- **VLAN** — oddělení na úrovni vrstvy 2 (Layer 2).
- **Mikrosegmentace** — *velmi* jemné dělení na úrovni jednotlivých aplikací.
- **Zero Trust** — žádná implicitní důvěra založená jen na umístění v síti.

Kompromitace jedné zóny → omezený dosah škod (blast radius).

---

### Videa

::: youtube "https://www.youtube.com/watch?v=ilhGh9CEIwM" "DDoS Attack Explained" "PowerCert Animated Videos"
:::

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Stallings, W.: „Cryptography and Network Security" (8th ed., Pearson 2020), §15-17; Bejtlich, R.: „The Practice of Network Security Monitoring" (No Starch 2013); [Wireshark Documentation](https://www.wireshark.org/docs/); [NMAP Reference Guide](https://nmap.org/book/man.html); [SANS Reading Room — Network Security](https://www.sans.org/white-papers/category/network-security/).*
