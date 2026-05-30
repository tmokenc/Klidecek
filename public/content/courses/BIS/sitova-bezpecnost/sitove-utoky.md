---
title: Síťové útoky — scanning, MITM, ARP, DDoS
---

# Síťové útoky — od sniffing po DDoS

Síť je *zaznamenané* místo IS — *sdílené médium*. Útoky na síťovou vrstvu jsou *fundamentální*. Tato sekce katalogizuje hlavní typy.

## Reconnaissance — passive

### OSINT

Sběr veřejných info — already covered v [[social-engineering]].

### Port scanning

Identifikuj otevřené porty na cíli.

```
nmap -sS 192.168.1.0/24
```

- **SYN scan** — fast, hard to detect (doesn't complete connection).
- **Connect scan** — full TCP handshake (slower, more reliable, logged).
- **UDP scan** — slower, less reliable.
- **Stealth techniques** — slow scans, randomized order, decoys.

### Service detection

```
nmap -sV target
```

Banner grabbing — identify SW version. Knowing version → look up CVEs.

### OS fingerprinting

TCP/IP stack quirks reveal OS:

```
nmap -O target
```

Windows / Linux / macOS / specific distro all leave subtle signatures.

## Active attacks

### Sniffing

Passive monitoring. Tools: tcpdump, Wireshark.

```bash
sudo tcpdump -i eth0 port 80
```

V switched network neviděl by trafik *jiných*. Útočník may use:

- **Promiscuous mode** — capture all packets on interface (broadcast domain).
- **Span port** / port mirror — admin-configured copy of traffic.
- **Compromised switch** — span all ports.
- **WiFi monitor mode** — capture all wireless frames.

### ARP poisoning

ARP = Address Resolution Protocol. Maps IP → MAC. *No authentication*.

Attacker sends *fake* ARP reply: "I am 192.168.1.1, my MAC is XX:XX:XX:XX:XX:XX".

Victim's ARP table updated. Future packets to 192.168.1.1 go to attacker. **MITM**.

```bash
arpspoof -i eth0 -t victim_ip gateway_ip
```

### MAC flooding

Send many random MAC addresses to switch. Switch CAM table fills. Switch *falls back* to *flooding* — broadcasts all packets to all ports.

Attacker can sniff *all* traffic in broadcast domain.

### DHCP spoofing

Run rogue DHCP server. Clients get attacker's gateway IP → MITM.

### DNS spoofing

Viz dedikovaná sekce **## DNS attacks** níže.

### MITM (Man-In-The-Middle)

Attacker *between* two parties. Reads, modifies, replays traffic.

Established via ARP poison, DHCP spoof, rogue WiFi AP, ISP-level (state actors).

### Defense

- **HTTPS / TLS** — encrypts data; certificate validation detects MITM (unless attacker has CA).
- **HSTS** — HTTP Strict Transport Security. Browser refuses to downgrade to HTTP.
- **DNSSEC** — DNS integrity.
- **Switch security** — dynamic ARP inspection, DHCP snooping, port security.
- **VPN** — encrypted tunnel, bypasses local MITM.

::: viz arp-poison-mitm "Klikni 'send fake ARP reply' — victim's ARP table updatuje na attacker MAC. Pošli paket → routing přes attackera. Toggle DAI: switch validuje a blokuje."
:::

## TCP-level attacks

### TCP SYN flood

Attacker sends many SYN packets *without* completing handshake. Server allocates per-connection state. Eventually:

- Server's connection table fills → legitimate connections refused (DoS).

### Defense

- **SYN cookies** — server doesn't allocate state until ACK received. Decode SYN cookie to validate.
- **Rate limiting** — drop SYN above threshold per source.

### TCP reset injection

Attacker injects RST packet with forged sequence number → close legitimate connection.

Used by:

- **Great Firewall of China** — censorship (reset HTTP connections to blocked content).
- **Network operators** — bandwidth shaping (RST P2P connections).

### Defense

- **TLS** — RST forgery requires control of cryptographic state, impossible without keys.
- **IPsec** — authenticated packets.

## Routing attacks

### BGP hijacking

Attacker (ISP or compromised router) announces *routes* to IP space they don't own. Internet routes traffic to them.

Famous:

- **YouTube 2008** — Pakistan accidentally hijacked YouTube globally.
- **Russian Telecom 2017** — hijacked Visa, MasterCard, banks.

### Defense

- **RPKI** (Resource Public Key Infrastructure) — sign route announcements. Mostly deployed (~50 % of routes).
- **Route filtering** — peers validate.
- **Monitoring** — services like BGPmon, NLNOG RING detect anomalies.

### Smurf attack (deprecated)

Send ICMP echo request to *broadcast address* with spoofed source = victim. All hosts respond to victim → DoS.

Modern routers don't forward to broadcast. Eliminated by default config since 2000s.

## DoS / DDoS

**Denial of Service** — make service unavailable.

**Distributed DoS (DDoS)** — many attacker sources (botnet, amplification).

### Volume-based

Flood network with traffic:

- **UDP flood** — random ports.
- **ICMP flood**.
- **Protocol amplification** — small request → big response. NTP, DNS, Memcached used.

Memcached útok 2018: 51 000× amplifikace. GitHub zasažen 1.35 Tbps (28. 2. 2018); o týden později samostatný 1.7 Tbps útok na zákazníka US poskytovatele (NETSCOUT).

### Protocol-based

Exhaust protocol state machines:

- **TCP SYN flood** (above).
- **TCP fragment** flood.
- **Ping of death** (legacy).

### Application layer

Slow / expensive HTTP requests:

- **Slowloris** — many connections, send headers very slowly.
- **HTTP GET flood** — many requests for expensive pages.
- **Application logic** — exploit slow queries.

### Defense

- **Cloud-based DDoS protection** — Cloudflare, AWS Shield, Akamai. Scrub traffic before reaching origin.
- **Rate limiting**.
- **Anycast** — distribute traffic to multiple PoPs.
- **CDN** — absorb static traffic.
- **Black-hole routing** — null-route attack target IP (last resort).

### DDoS examples

- **Mirai 2016** — IoT botnet, 1 Tbps attacks (Dyn DNS — affected Twitter, Netflix).
- **GitHub 2018** — 1.35 Tbps Memcached amplification.
- **AWS 2020** — 2.3 Tbps mitigated.
- **Cloudflare 2022** — 26M req/s HTTPS flood.

Modern attacks: hundreds of Gbps now common, Tbps possible.

::: viz ddos-amplification "Vyber reflector protocol (DNS 28×, NTP 556×, memcached 51000×) + velikost botnetu. Spočte celkový reflected bandwidth + srovná s historickými útoky (Mirai 1 Tbps, GitHub 1.35 Tbps)."
:::

## DNS attacks

### DNS spoofing / poisoning

Insert false records into DNS cache. Used in:

- **MITM** — redirect bank.com to attacker.
- **Censorship** — Great Firewall, ISPs.

### DNS rebinding

Attacker.com resolves to attacker IP initially. Browser loads JS from attacker.com. Later DNS lookup returns *internal IP* (192.168.1.1). JS now talks to internal device with attacker.com origin (same-origin policy bypassed).

### Defense

- **DNSSEC** — cryptographic signatures.
- **DoH/DoT** (DNS over HTTPS/TLS) — encrypted DNS, harder to MITM.
- **DNS rebinding protection** — browsers/router filter private IPs.

## VPN attacks

VPN gateway compromise:

- **Pulse Connect Secure** CVE-2019-11510 — RCE.
- **Cisco ASA** CVE-2018-0101 — VPN feature RCE.
- **Fortinet** multiple.

VPN gateways highly valuable — entry to internal network. Patching critical.

## Wireless attacks

Detail v [[wifi-utoky]]. Quick preview:

- **Evil twin** — fake AP.
- **WEP cracking** — RC4 weakness (aircrack-ng).
- **WPA2 KRACK** — replay attack.
- **WPS PIN brute force**.

## Detekce a obrana

### Network monitoring

- **NetFlow / IPFIX** — traffic accounting from routers.
- **Packet capture** — full pcap or selective.
- **DNS monitoring** — queries, responses.

### IDS / IPS

[[ids-ips]] detailně.

### SIEM

[[siem-monitoring]] correlates from logs across systems.

### Threat intelligence

Subscribe to feeds (commercial + open). Block known-bad IPs, domains.

## Segmentace

Network segmentation = *layer of defense*:

- **DMZ** — public-facing systems in separate zone.
- **VLAN** — Layer 2 separation.
- **Microsegmentation** — *very* granular per-app.
- **Zero Trust** — no implicit trust based on network location.

Compromise of one zone → limited blast radius.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Stallings, W.: „Cryptography and Network Security" (8th ed., Pearson 2020), §15-17; Bejtlich, R.: „The Practice of Network Security Monitoring" (No Starch 2013); [Wireshark Documentation](https://www.wireshark.org/docs/); [NMAP Reference Guide](https://nmap.org/book/man.html); [SANS Reading Room — Network Security](https://www.sans.org/white-papers/category/network-security/).*
