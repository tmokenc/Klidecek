---
title: Multipath TCP (MP-TCP)
---

# Multipath TCP — TCP přes víc cest najednou

SCTP ([[sctp]]) byl *kompletní reset* L4 vrstvy — krásný design, ale nasazení selhalo, protože middleboxy zahazují neznámý protokol. **Multipath TCP** (MP-TCP, [RFC 8684](https://www.rfc-editor.org/rfc/rfc8684), 2020) zvolil opačnou cestu: *vejít se* do TCP. Pro middleboxy vypadá MP-TCP jako standardní TCP; pro koncové stacky umožňuje *rozprostření jednoho aplikačního toku* přes víc fyzických rozhraní (WiFi + LTE, Ethernet + WiFi). Cena: žádné změny v aplikaci ani v síti.

## Motivace

Smartphone se dneska připojuje současně přes:

- **WiFi** — vysoká bandwidth, krátké RTT (doma).
- **LTE/5G** — slabší bandwidth (typicky), ale **dostupné, když WiFi selže**.

Bez MP-TCP: aplikace si vybere jedno rozhraní (typicky WiFi); při selhání musí spojení *zrušit* a *znovu otevřít* na druhém — TCP s tím neumí pracovat.

S MP-TCP:

- **Bandwidth aggregation** — bandwidth obou rozhraní se *sčítá*.
- **Seamless handover** — když WiFi vypadne, traffic pokračuje přes LTE *bez restartu* spojení.
- **Fallback** — pokud protistrana neumí MP-TCP, automaticky používá klasický TCP.

První velký nasazovatel: **Apple**, 2013 — pro Siri (chrání latenci na špatném WiFi). Dnes: **Samsung** (S20+), **Hybrid Access Networks** (Korean Telecom, Deutsche Telekom — agreguje DSL + LTE pro venkov).

## Designové principy

1. **Transparentní pro aplikace** — `socket()` a `connect()` jdou jako u TCP. Aplikace neví, že má MP-TCP.
2. **Transparentní pro síť** — middleboxy vidí *normální* TCP segmenty. Veškerá MP-TCP logika je v **TCP Option 30** ([[tcp-options]]).
3. **Fallback** — pokud protistrana option neumí, spojení degraduje na single-path TCP.
4. **Bezpečné** — handshake nese kryptografické tokeny proti hijacku subflow.

## Architektura

::: svg "MP-TCP — jeden meta-flow přes dvě fyzické cesty"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="20" y="20" width="120" height="36"/>
    <rect x="400" y="20" width="120" height="36"/>
    <rect x="20" y="80" width="120" height="100"/>
    <rect x="400" y="80" width="120" height="100"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="80" y="42" font-weight="600">Application</text>
    <text x="460" y="42" font-weight="600">Application</text>
    <text x="80" y="100">MP-TCP</text>
    <text x="80" y="118" font-size="10" fill="var(--text-muted)">(scheduling, DSN)</text>
    <text x="80" y="155">subflow A | subflow B</text>
    <text x="460" y="100">MP-TCP</text>
    <text x="460" y="118" font-size="10" fill="var(--text-muted)">(scheduling, DSN)</text>
    <text x="460" y="155">subflow A | subflow B</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.6" fill="none">
    <path d="M120,140 C 200,120 340,120 400,140"/>
    <path d="M120,170 C 200,200 340,200 400,170"/>
  </g>
  <g fill="var(--text-muted)" font-size="10" text-anchor="middle">
    <text x="260" y="115">subflow 1 — WiFi path</text>
    <text x="260" y="210">subflow 2 — LTE path</text>
  </g>
</svg>
:::

- **Meta-socket** — to, co vidí aplikace. Jeden socket, jedno `write()`/`read()`.
- **Subflows** — *fyzická* TCP spojení, každé na jedné dvojici `(local_addr, remote_addr)`. Každý má svůj 3WHS, vlastní sekvenční číslo, vlastní `cwnd`.
- **Data Sequence Numbers (DSN)** — *meta*-pořadí byte streamu, *nezávislé* na sekvenčních číslech subflow. DSN sedí v option Kind=30, sub-type DSS.

## Establishment — MP_CAPABLE a MP_JOIN

### První subflow — MP_CAPABLE

Klient v `SYN` zahrne `MP_CAPABLE` option s 64-bit klíčem `Key-A`. Server odpoví `SYN+ACK` se svým `Key-B`. Klient ACK nese oba.

Z `Key-A` a `Key-B` se SHA-256 spočítá **token** identifikující asociaci a **sequence init number** pro meta-flow.

Pokud server *option nezná*, ignoruje ji → spojení pokračuje jako *klasické TCP*.

### Další subflow — MP_JOIN

Klient otevře *druhé* TCP spojení (např. z LTE adresy). V `SYN` nese `MP_JOIN` s:

- **Token** identifikující existující meta-flow (z `Key-B`).
- **HMAC** chráněný hash, který protistrana ověří proti `Key-A`/`Key-B`.

Když serverový MP-TCP token rozpozná, *přilepí* nový subflow k meta-flow. Pokud HMAC nepatří, zamítne.

```
Client                             Server
WiFi:   SYN, MP_CAPABLE(Key-A) ─►
                              ◄─── SYN+ACK, MP_CAPABLE(Key-B)
        ACK, MP_CAPABLE(A, B) ─►
                                       ▶ subflow 1 ESTABLISHED
LTE:    SYN, MP_JOIN(token=hash(B), HMAC) ─►
                              ◄─── SYN+ACK, MP_JOIN(HMAC)
        ACK ──────────────────►
                                       ▶ subflow 2 ESTABLISHED
```

## Data v dvou rovinách

Klíčový mechanismus — **dvojí číslování**:

- **Subflow sequence** — standardní TCP `seq`, *unique within subflow*. Middlebox to vidí jako TCP.
- **Data Sequence Number (DSN)** — *meta-flow* pořadí. Posílá se v DSS option (sub-type 0).

```
Data sequence number space (meta):  ...   12000  12500  13000 ...
                                          /         \      \
Subflow 1 (WiFi):  TCP seq=11200 ▶ 11700 ▶          ▶ 12200 ...
Subflow 2 (LTE):           ─────────────► TCP seq=44500 ─────...
```

Aplikace vidí jen kontinuum DSN — MP-TCP re-asembluje data v pořadí. Pokud LTE subflow má vyšší latenci, jeho data čekají v meta-buffer, než dorazí předchozí DSN přes WiFi.

## Scheduling — kterým subflow co poslat

**Path manager** rozhoduje:

- **Round-robin** — střídavě (jednoduché, špatné při různých RTT).
- **Lowest RTT** — preferuj rychlejší cestu (Linux default).
- **Redundant** — pošli paket *přes oba* (rezistence proti ztrátě, *halvi* throughput).
- **Application-aware** — různé toky na různé cesty (latency-sensitive na WiFi, bulk na LTE).

Volba má velký dopad na vnímaný throughput. Linux kernel `net.mptcp.scheduler` lze přepnout (default `default`).

## Congestion control — coupled

Naivně: každý subflow má vlastní AIMD. Problém — *fairness*. Pokud na sdílené butlenecku běží MP-TCP (2 subflow) + TCP (1 subflow), MP-TCP získá *2× větší podíl* — *nespravedlivé*.

**LIA** (Linked Increase Algorithm, RFC 6356):

$$
\Delta \text{cwnd}_i = \min\left(\frac{\alpha}{\sum_i \text{cwnd}_i}, \frac{1}{\text{cwnd}_i}\right)
$$

kde $\alpha$ je společný parametr. Efektivně: *součet* MP-TCP subflow se chová jako *jedno* TCP spojení. Friendly k TCP.

Alternativy: **OLIA** (Opportunistic LIA), **BALIA** (Balanced LIA). Pro DC: **wVegas** (delay-based).

## Address management

Subflow lze přidávat/odebírat dynamicky:

- **ADD_ADDR** — peer ohlašuje *novou* IP adresu (např. WiFi se připojí později).
- **REMOVE_ADDR** — *odbírám* adresu (WiFi vypadl, LTE jediný).
- **MP_PRIO** — změna priority subflow (např. degraduj LTE, když WiFi back).

## Praktické nasazení {tier=practice}

- **Apple iOS 7+ (2013)** — Siri MP-TCP přes WiFi + LTE. **Mac OS** od 11.0.
- **Linux kernel 5.6+ (2020)** — upstream MP-TCP (předtím out-of-tree fork "MPTCP-Linux").
- **Tessares / Hybrid Access Networks** — ISPs agregující DSL + LTE pro venkov.
- **Korean Telecom Gigapath** — komerční zákazníci, MP-TCP proxy.

Adopce na *internetu* zůstává nízká — ne kvůli technice, ale kvůli **side**:

- Klient musí mít OS, který umí MP-TCP.
- Server musí mít MP-TCP socket (mptcp_enabled = 1).
- Aplikace by mohla benefitovat (Apple Maps, video stream).

V 2026 většina TCP traffic je single-path; MP-TCP je v "long-tail" specifických use-case.

## Srovnání SCTP vs MP-TCP

| | SCTP | MP-TCP |
| :--- | :---: | :---: |
| Mechanismus | nový L4 | TCP option |
| Multi-homing | ✓ | ✓ (přes subflow) |
| Multi-stream | ✓ | ✗ (jeden byte stream) |
| Hranice zpráv | ✓ | ✗ |
| Middlebox-friendly | ✗ | ✓ |
| Aplikační kód | změna | beze změn |
| 4WHS | ✓ | — (standardní 3WHS) |
| Nasazení | nika | rostoucí |

## Co dál

Posledním zástupcem moderního L4 je **QUIC** ([[quic]]) — opět *nad UDP*, ale s vestavěným TLS, multistream, multi-path *a* eliminací RTT pro TLS handshake. Dnes nese >25 % webového provozu (HTTP/3).

---

*Zdroj: PDS přednáška 2 (Transportní protokoly), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 8684 — TCP Extensions for Multipath Operation (current spec)](https://www.rfc-editor.org/rfc/rfc8684); [RFC 6824 — MP-TCP (původní 2013)](https://www.rfc-editor.org/rfc/rfc6824); [RFC 6356 — Coupled Congestion Control for MP-TCP](https://www.rfc-editor.org/rfc/rfc6356); Raiciu, C. et al.: „How Hard Can It Be? Designing and Implementing a Deployable Multipath TCP" (USENIX NSDI '12); Paasch, C., Bonaventure, O.: „Multipath TCP" (ACM Queue 12 (2), 2014, [DOI 10.1145/2578508.2591369](https://doi.org/10.1145/2578508.2591369)); [Linux MPTCP project](https://www.mptcp.dev/).*
