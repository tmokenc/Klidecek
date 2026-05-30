---
title: UDP a DCCP — best-effort transport
---

# UDP a DCCP — když nepotřebujete spolehlivost

TCP ([[tcp-spojeni-hlavicka]]) má významnou *cenu*: handshake (1 RTT), čas potvrzování, retransmise a TIME_WAIT. Pro aplikace, kde **na latenci záleží víc než na ztrátách** — VoIP, video, DNS, real-time hry — je TCP špatná volba. Pro ně existuje **UDP** (jednoduchost) a **DCCP** (UDP + congestion control).

## UDP — minimální L4 protokol

[RFC 768](https://www.rfc-editor.org/rfc/rfc768) z roku 1980 — *jedna stránka*. UDP je *nejjednodušší* možný L4 protokol.

### Hlavička — 8 bajtů

::: svg "UDP hlavička — 8 B"
<svg viewBox="0 0 500 120" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="20" y="20" width="220" height="22"/>
    <rect x="240" y="20" width="220" height="22"/>
    <rect x="20" y="42" width="220" height="22"/>
    <rect x="240" y="42" width="220" height="22"/>
    <rect x="20" y="64" width="440" height="40" fill="var(--bg-inset)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="130" y="35">Source Port (16 b)</text>
    <text x="350" y="35">Destination Port (16 b)</text>
    <text x="130" y="57">Length (16 b)</text>
    <text x="350" y="57">Checksum (16 b)</text>
    <text x="240" y="89">Data (payload)</text>
  </g>
</svg>
:::

Pole:

- **Source Port / Destination Port** (16 b) — totéž co u TCP, multiplexing aplikací.
- **Length** (16 b) — délka *celého* UDP paketu (hlavička + data). Max 65 535 B (omezuje payload na ~64 kB minus 8 B hlavička minus IP hlavička).
- **Checksum** (16 b) — over pseudo-header + UDP. Volitelný v IPv4 (nula = nepoužívá), **povinný v IPv6**.

### Co UDP NEnabízí

- **Žádné spojení** — connectionless. Pošlete paket, *nic se neptáte*.
- **Žádné potvrzování** — odesílatel neví, zda paket dorazil.
- **Žádné pořadí** — pakety mohou dorazit *přeházeně*.
- **Žádné retransmise** — ztracený paket je *ztracený*.
- **Žádný flow / congestion control** — odesílatel posílá *tak rychle*, jak chce.

To poslední je *velký problém* — pokud UDP a TCP sdílí linku, **TCP slušně ustupuje** při ztrátách (cwnd→1), zatímco *UDP žere bandwidth bez omezení*. TCP umírá, UDP vítězí. V praxi to znamená, že nezodpovědný UDP traffic (P2P bez regulace) může *zničit* síť pro ostatní.

### Co UDP NABÍZÍ

- **Minimální overhead** — 8 B hlavičky, nic víc.
- **Žádné setup latence** — první paket = první data.
- **Žádné stavové struktury** v OS — méně paměti, méně CPU.
- **Multicast a broadcast** — UDP funguje na 1-N a broadcast adresách (TCP ne).
- **Aplikace si dělá svoji semantiku** — DNS query/response, NTP, SNMP.

### Typické aplikace

| Aplikace | Důvod UDP |
| :--- | :--- |
| **DNS** | krátká query/response, latence > spolehlivost |
| **DHCP** | broadcast, ještě neexistuje IP klienta |
| **NTP / PTP** | čas-sensitive, retransmise by zkreslila |
| **VoIP, RTP** | latence kritická, ztráta paketu < zpoždění |
| **Video streaming** | RTP/UDP, *aplikační* FEC, jitter buffer |
| **Online games** | 60 paketů/s, *uznají* ztrátu |
| **QUIC, WireGuard, VXLAN** | UDP jako *transport pro vyšší abstrakce* |

DNS je *zajímavý* — používá *jak* UDP, *tak* TCP. Default UDP (rychlost), fallback na TCP pro velké odpovědi (DNSSEC, AXFR) a dnes hlavně **DoH** / **DoT** přes TCP+TLS.

## UDP-Lite — částečný checksum

[RFC 3828](https://www.rfc-editor.org/rfc/rfc3828). Modifikace UDP, kde **Length** se interpretuje jako *Checksum Coverage* — kolik prvních bajtů má být zahrnuto do checksumu (zbytek se *ignoruje*).

Užití: **AAC video** přenášený přes WiFi. Pokud se poškodí pár bitů payloadu, dekodér to *zvládne* (FEC, error concealment). Pokud by celý paket *zahodila L2/L4* kvůli "checksumu", to *poznáme jako "drop"* a kvalita videa klesne.

UDP-Lite tedy umožňuje:

- Chránit **hlavičku** (porty, length).
- Nechat *poškozené* payload data dojít k aplikaci.

V praxi malé využití (vyžaduje OS podporu a IP protokol číslo 136, ne 17).

## DCCP — Datagram Congestion Control Protocol

[RFC 4340](https://www.rfc-editor.org/rfc/rfc4340), 2006. Reaguje na *problém*: UDP nemá congestion control, což škodí síti. Ale aplikace, které volí UDP, **chtějí jeho jednoduchost** — nepotřebují spolehlivost ani in-order.

DCCP = **UDP plus congestion control**, *bez* spolehlivosti. Modulární: aplikace si zvolí *který* CC algoritmus (CCID).

### Vlastnosti DCCP

- **Best-effort delivery** — žádná retransmise.
- **Out-of-order** — žádné pořadí.
- **Congestion controlled** — reaguje na ECN ([[rizeni-toku-zahlceni]]) a ztráty.
- **Connection-oriented** — 3WHS na začátku, 4WTHS na konci (kvůli dohodě CCID a stavu).
- **Acknowledgments** — *jsou*, ale slouží *jen* k regulaci, ne k retransmisi.

### CCID — vyměnitelný congestion control

DCCP definuje rámec a pluginy:

- **CCID 2** — TCP-like (AIMD, slow start, fast retransmit). Pro aplikace, které chtějí TCP fairness bez TCP spolehlivosti.
- **CCID 3** — TFRC (TCP-Friendly Rate Control). Smooth rate change, ideální pro video — bez "pily" cwnd.
- **CCID 4** — TFRC-SP (Small Packets). Pro VoIP s malými pakety.

### DCCP zpráva — typy

| Typ | Použití |
| :--- | :--- |
| Request | otevření spojení (jako SYN) |
| Response | odpověď serveru (jako SYN+ACK) |
| Data | aplikační data |
| Ack | potvrzení (pro congestion control) |
| DataAck | data + ack najednou |
| CloseReq | žádost o ukončení |
| Close | poslední strana ukončuje |
| Reset | abort spojení |
| Sync, SyncAck | sequence number resync |

### 3WHS DCCP

```
Client                  Server
  --- DCCP-Request ───►
                        ◄── DCCP-Response
  --- DCCP-Ack ───────►
        (OPEN)
```

V `Request`/`Response` se domluví **service code** (jako port + protokol popis) a **CCID** pro každý směr.

### Praktická situace

DCCP se **nikdy nerozšířilo**. Linux kernel ho má (`CONFIG_IP_DCCP`), ale aplikace nebyla. Důvody:

- **NAT a firewall** — DCCP má vlastní L4 protokol number (33), který middleboxy nepropouštějí. Aplikace přepnula na UDP.
- **Aplikační CC** — RTP nad UDP řeší CC samo (TFRC v knihovnách).
- **QUIC** — Google překročil DCCP tím, že vytvořil *vlastní* protokol nad UDP (viz [[quic]]).

DCCP je *poučný*: ukazuje, že **standardizovat nový L4 protokol je téměř nemožné** — middleboxy ho zabijí. Proto se moderní transport (QUIC, WireGuard) staví *nad UDP*.

## Srovnání

| | UDP | UDP-Lite | DCCP | TCP |
| :--- | :---: | :---: | :---: | :---: |
| Hlavička | 8 B | 8 B | ~12 B | 20+ B |
| Connection | — | — | ✓ | ✓ |
| Spolehlivost | — | — | — | ✓ |
| In-order | — | — | — | ✓ |
| Congestion control | — | — | ✓ | ✓ |
| Multicast | ✓ | ✓ | — | — |
| Encryption | — | — | — | — (DTLS / TLS extra) |
| Rozšíření | univerzální | nízké | nulové | univerzální |

## Co dál

Jiné protokoly, které řeší *jiné* problémy než UDP/TCP: **SCTP** ([[sctp]]) přidává multistream a multi-homing; **MP-TCP** ([[mptcp]]) přidává multi-path do TCP; **QUIC** ([[quic]]) přebírá to nejlepší ze všech do UDP s vestavěným TLS.

---

*Zdroj: PDS přednáška 2 (Transportní protokoly), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 768 — UDP](https://www.rfc-editor.org/rfc/rfc768); [RFC 3828 — UDP-Lite](https://www.rfc-editor.org/rfc/rfc3828); [RFC 4340 — DCCP](https://www.rfc-editor.org/rfc/rfc4340); [RFC 4341 — DCCP CCID 2 (TCP-like)](https://www.rfc-editor.org/rfc/rfc4341); [RFC 4342 — DCCP CCID 3 (TFRC)](https://www.rfc-editor.org/rfc/rfc4342); Handley, M., Floyd, S., Padhye, J., Widmer, J.: „TFRC: Equation-Based Congestion Control for Unicast Applications" (ACM SIGCOMM 2000).*
