---
title: Identifikace podle hlaviček — porty a EtherType
---

# Identifikace podle hlaviček

Nejjednodušší metoda identifikace provozu — *přečíst* policy-relevant pole z paketové hlavičky. Levná, rychlá, *hardwarově akcelerovaná*. Stále se používá jako *první linie* identifikace na switchích a firewallech. Tato sekce shrne, *co* se z hlaviček dá poznat, a *kde* metoda selhává.

## Informace v paketu po vrstvách

| Vrstva | Pole | Co identifikuje |
| :--- | :--- | :--- |
| L2 Ethernet | **EtherType** | je to IP, ARP, MPLS, IPv6? |
| L2 Ethernet | **VLAN tag (802.1Q)** | virtuální LAN, customer separation |
| L3 IPv4 | **Protocol** | TCP, UDP, ICMP, GRE, ESP… |
| L3 IPv6 | **Next Header** | totéž, IPv6 verze |
| L3 IPv4/v6 | **src/dst** | odkud, kam |
| L4 TCP/UDP | **src/dst port** | aplikace |
| L4 TCP | **flags** | SYN/ACK/FIN (TLS detect via cipher/handshake) |
| L4 TCP | **window**, **MSS** | OS fingerprint |
| Aplikační | různé | viz [[signatury-snort]] |

V *hardware* — TCAM ([[hicuts-tcam]]) — se vyhledává *velice rychle*. Jedno wire-speed rozhodnutí na 10/40/100 Gbps lince.

## Klíčová pole

### EtherType (L2)

Identifikuje payload Ethernet rámce. 16-bit hodnoty, IANA registr:

| Hodnota | Protokol |
| :--- | :--- |
| `0x0800` | IPv4 |
| `0x0806` | ARP |
| `0x8100` | 802.1Q VLAN |
| `0x86DD` | IPv6 |
| `0x8847` | MPLS unicast |
| `0x88E1` | HomePlug AV (PLC) |
| `0x88F7` | PTP (Precision Time) |

Když switch vidí `0x8100`, ví, že následuje VLAN tag a *za ním* další EtherType. Vrstvení tagů (QinQ) = víc VLAN označení.

### IP Protocol / Next Header (L3)

Specifikuje L4 nebo encapsulated protokol:

| Hodnota | Protokol |
| :--- | :--- |
| 1 | ICMP |
| 4 | IPv4-in-IPv4 |
| 6 | TCP |
| 17 | UDP |
| 41 | IPv6-in-IPv4 |
| 47 | GRE |
| 50 | ESP (IPsec) |
| 51 | AH (IPsec) |
| 89 | OSPF |
| 132 | SCTP |
| 136 | UDP-Lite |

Hodnota mimo "obvyklé" (např. proto 47) signalizuje *tunelování*; detail v dalším paketu.

### Porty L4 (well-known)

[IANA Port Registry](https://www.iana.org/assignments/service-names-port-numbers/). Typické:

| Port | Protokol |
| :--- | :--- |
| 22 | SSH |
| 25 | SMTP |
| 53 | DNS |
| 67/68 | DHCP |
| 80 | HTTP |
| 110 | POP3 |
| 123 | NTP |
| 143 | IMAP |
| 161 | SNMP |
| 389 | LDAP |
| 443 | HTTPS / QUIC |
| 465 | SMTPS |
| 587 | SMTP submission |
| 993 | IMAPS |
| 995 | POP3S |
| 1812 | RADIUS |
| 3306 | MySQL |
| 5060 | SIP |
| 6881–6889 | BitTorrent |

Rozsahy:

- **0–1023** — *well-known*. Linux vyžaduje root/CAP_NET_BIND_SERVICE.
- **1024–49151** — *registered*. Aplikace si je oficiálně rezervovaly.
- **49152–65535** — *ephemeral / dynamic*. Source porty klientů, dynamicky přidělené.

## Omezení port-based identifikace

### 1. Vlastní porty

Webserver běžící na portu 8080 je *zcela legální* a běžný. Aplikace v Dockeru/Kubernetes typicky používá `NodePort 30000-32767`. Identifikace "443 = HTTPS" nikdy nebyla pravda; v 2026 ještě méně.

### 2. Šifrované encapsulation

`stunnel` zabalí jakýkoliv TCP do TLS přes port 443 → vypadá jako HTTPS. SSH tunnel přes port 443 stejné.

### 3. Dynamic ports

P2P protokoly *zámerně* nepoužívají fixed porty (anti-blocking). BitTorrent může na **libovolném** portu nad 1024.

### 4. NAT a CGNAT

Klient za NAT překládá svůj port. Pro pozorovatele *za* NATem se 50 různých klientů jeví jako 50 různých portů jednoho IP.

### 5. QUIC nad UDP/443

UDP/443 = QUIC = HTTP/3. Z portu pozná malou věc (něco QUIC-like), pro detail musíte hloubit do payload (a ten je šifrovaný).

## EtherType — co odhalíte

Z `0x86DD` (IPv6) vyplývá: IPv6 podporováno na linku. To je *strukturální* informace o síti, ne typu provozu.

Z `0x8100` (VLAN): probíhá VLAN tagging — pravděpodobně enterprise switch nebo trunk port.

Z `0x8847` (MPLS): provider WAN. Konsumer linky MPLS nepoužívají.

## IP src/dst — geografie a reputace

Z IP adresy lze určit:

- **GeoIP** — fyzická lokace (MaxMind, IP2Location). Užitečné pro fraud detection (loginový request z Severní Korea).
- **AS** — kdo IP vlastní. `whois 8.8.8.8` → Google. Z toho se odvozuje *účel* (CDN, hosting, residential ISP).
- **Reputation** — známé botnet C&C IP, spam zdroje. Threat intelligence feeds (AlienVault OTX, Cisco Talos).

V 2026 hodně organizací používá **TI feeds** pro automatické blokování — IP X je *known bad*, drop bez ohledu na port a payload.

## Reálné použití {tier=practice}

V *enterprise firewallu* (Palo Alto, Fortigate, Cisco FTD) je port + IP klasifikace **úvodní filtr** — *miliony rules* běží wire-speed. Provoz, který projde port-based fází, jde do hlubší analýzy (signatury [[signatury-snort]], DPI).

Limity ho vedou ke skepsi: *modern application identification* musí jít *za* porty — *application-layer fingerprinting* a *flow patterns*.

## Co dál

Hlubší metody: **signatury** (Snort, Suricata) a **fingerprinting** (JA3, JA4) — [[signatury-snort]].

---

*Zdroj: PDS přednáška 8 (IDS), doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: [IANA — Service Names and Transport Protocol Port Numbers](https://www.iana.org/assignments/service-names-port-numbers/); [IANA — IP Protocol Numbers](https://www.iana.org/assignments/protocol-numbers/); [IANA — Ethertype Registry](https://www.iana.org/assignments/ieee-802-numbers/); Palo Alto Networks: *App-ID Technology Brief* (2020).*
