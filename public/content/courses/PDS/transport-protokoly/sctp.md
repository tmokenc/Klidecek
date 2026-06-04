---
title: SCTP — multistream, multi-homing
---

# SCTP — když TCP nestačí

[RFC 3286 (úvod)](https://www.rfc-editor.org/rfc/rfc3286) a [RFC 9260 (specifikace)](https://www.rfc-editor.org/rfc/rfc9260) — **Stream Control Transmission Protocol**. Vznikl koncem 90. let v IETF pracovní skupině *SIGTRAN* pro telefonní signalizaci (SS7 nad IP) a v 2000 byl standardizován jako *obecný* L4 protokol. Cílem bylo odstranit dva největší nedostatky TCP: **head-of-line blocking** a **vázanost na jednu IP adresu**.

## Motivace — co TCP NEdělá

Po 20 letech zkušeností s TCP byly jeho slabiny dobře známé:

1. **Head-of-line blocking** — TCP doručuje *byte stream*; ztráta jednoho segmentu blokuje *všechny následující* — i kdyby patřily k jiné aplikační zprávě.
2. **No application multi-homing** — TCP spojení je vázané na jednu `(IP, port)` dvojici. Notebook s WiFi *i* Ethernetem nemůže TCP spojení rozprostřít přes obě rozhraní.
3. **Žádné hranice zpráv** — `read()` může vrátit jiný počet bajtů než `write()`. Aplikace musí sama framovat.
4. **SYN flood** — 3WHS nutí server alokovat zdroje po prvním SYN.

SCTP řeší *všechny čtyři*.

## SCTP — koncepty

### Asociace, ne spojení

SCTP používá termín **association** místo *connection*. Asociace je `(A, B, n_streams)` — *víc adres na obou stranách*, *víc streamů*.

### Streamy — paralelní fronty zpráv

V jedné asociaci je *N nezávislých streamů* (často 1024, dohoda v INIT). Každý stream:

- Drží **svoje pořadí zpráv** (sekvenční čísla per stream).
- Ztráta na streamu A *neblokuje* stream B.

Aplikace zapíše do streamu 0, 1, 2… SCTP nese paket *libovolným* streamem — head-of-line blocking se *odsouvá* jen do daného streamu.

### Multi-homing

Hostitel může mít *víc IP adres* (WiFi, Ethernet, LTE). V `INIT` se vymění *seznam adres*. SCTP:

- **Primary path** — výchozí adresa pro data.
- **Sekundární paths** — pro retransmise nebo při selhání primary.
- **Heartbeat** — pravidelně testuje sekundární adresy (`HEARTBEAT` chunk).

### Zprávy, ne stream

SCTP zachovává **message boundaries**. `sctp_sendmsg(1500 B)` = příjemce dostane *jednou* `sctp_recvmsg(1500 B)`. Žádné stringy ani sloučení dvou zpráv.

## Struktura SCTP paketu

::: svg "SCTP packet — common header + chunky"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="20" y="20" width="260" height="22"/>
    <rect x="280" y="20" width="220" height="22"/>
    <rect x="20" y="42" width="480" height="22"/>
    <rect x="20" y="64" width="480" height="22"/>
    <rect x="20" y="96" width="480" height="38" fill="var(--bg-inset)"/>
    <rect x="20" y="138" width="480" height="38" fill="var(--bg-inset)"/>
    <rect x="20" y="180" width="480" height="22" fill="var(--bg-inset)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="150" y="35">Source Port (16)</text>
    <text x="390" y="35">Destination Port (16)</text>
    <text x="260" y="57">Verification Tag (32)</text>
    <text x="260" y="79">Checksum CRC-32c (32)</text>
    <text x="260" y="115">Chunk 1: Type | Flags | Length | Value (TLV)</text>
    <text x="260" y="157">Chunk 2: Type | Flags | Length | Value (TLV)</text>
    <text x="260" y="195">… další chunky</text>
  </g>
</svg>
:::

- **Common header** (12 B) — porty, **Verification Tag** (chrání proti starým paketům), **CRC-32c** (silnější než TCP checksum).
- **Chunks** — TLV bloky, *v jednom paketu jich může být víc*. Typy:

| Chunk | Účel |
| :--- | :--- |
| `DATA` | aplikační data — stream ID, SSN, TSN |
| `INIT` / `INIT-ACK` | navázání asociace |
| `COOKIE-ECHO` / `COOKIE-ACK` | dokončení 4WHS |
| `SACK` | selective ACK (vždy v SCTP) |
| `HEARTBEAT` / `HEARTBEAT-ACK` | sondování sekundárních cest |
| `ABORT` | nucené ukončení (jako TCP RST) |
| `SHUTDOWN`, `SHUTDOWN-ACK`, `SHUTDOWN-COMPLETE` | graceful close |

DATA chunk má:

- **TSN** (Transmission Sequence Number) — *paketové* číslo (jako TCP seq, ale paketové).
- **Stream ID** — který stream.
- **SSN** (Stream Sequence Number) — pořadí v rámci streamu.
- **Payload Protocol Identifier (PPID)** — kdo je nad SCTP (HTTP, M3UA, Diameter…).
- **Payload**.

### Bundling

SCTP může do *jednoho* IP datagramu vrazit **víc chunků** — DATA z různých streamů + SACK. Šetří hlavičky, lépe využívá MTU.

## Čtyřcestný handshake

Místo TCP 3WHS používá SCTP **4WHS** s *cookie* mechanismem — odolný proti SYN flood:

```
Client                    Server
  --- INIT ─────────────►
                          ◄── INIT-ACK (with COOKIE)
  --- COOKIE-ECHO ──────►
                          ◄── COOKIE-ACK
        (ESTABLISHED)
```

Klíčový trik:

1. Server přijme `INIT`. *Nealokuje* žádný stav. Místo toho zakóduje *všechny parametry asociace* (IP adresy, čas, MAC) do **cookie** podepsaného serverovým klíčem.
2. Pošle `INIT-ACK` *s cookie*.
3. Klient pošle cookie zpět v `COOKIE-ECHO`. Server ověří MAC → cookie je legitimní, *teprve teď alokuje* asociaci.
4. `COOKIE-ACK` finalizuje.

Důsledek: **SYN flood na SCTP nefunguje** — server nealokuje paměť, dokud nedostane cookie zpět. Pokud útočník neumí zachytávat na cestě, neumí spoofovat cookie.

## Multistreaming v praxi

::: svg "SCTP — tři streamy paralelně, ztráta neblokuje ostatní"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="20" y="30" width="100" height="36"/>
    <rect x="20" y="80" width="100" height="36"/>
    <rect x="20" y="130" width="100" height="36"/>
    <rect x="420" y="30" width="100" height="36"/>
    <rect x="420" y="80" width="100" height="36"/>
    <rect x="420" y="130" width="100" height="36"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70" y="52">Stream 0</text>
    <text x="70" y="102">Stream 1</text>
    <text x="70" y="152">Stream 2</text>
    <text x="470" y="52">Stream 0</text>
    <text x="470" y="102">Stream 1</text>
    <text x="470" y="152">Stream 2</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.6" fill="none">
    <line x1="125" y1="48" x2="415" y2="48"/>
    <line x1="125" y1="148" x2="415" y2="148"/>
  </g>
  <line x1="125" y1="98" x2="270" y2="98" stroke="var(--accent)" stroke-width="1.6"/>
  <line x1="270" y1="98" x2="290" y2="78" stroke="var(--text-faint)" stroke-width="1.5"/>
  <line x1="270" y1="98" x2="290" y2="118" stroke="var(--text-faint)" stroke-width="1.5"/>
  <text x="280" y="95" fill="var(--text-faint)">✗</text>
  <text x="275" y="180" fill="var(--text-muted)" text-anchor="middle">Stream 1 lost — Stream 0 a 2 jedou bez zdržení</text>
</svg>
:::

Aplikace má 3 streamy: text-chat (0), file-transfer (1), control (2). Ztráta na file-transferu **neblokuje chat ani control** — jako by každý stream byl vlastní TCP spojení, ale beze tří handshaků.

## Retransmise a SACK

SACK je *povinná* (ne option). Nese:

- **Cumulative TSN ACK** — kumulativní (jako TCP).
- **Gap ACK blocks** — seznam *přijatých* TSN mimo pořadí.
- **Duplicate TSNs** — duplikáty (pomáhá diagnostikovat retransmise).

Při ztrátě:

- **Fast retransmit** po *4× duplicate SACK* (oproti TCP 3×).
- **Timer-based retransmit** po RTO.
- Retransmise může jít **přes jinou cestu** (multi-homing) — fail-over.

## Congestion control

V základu SCTP používá TCP-like AIMD: `cwnd`, `ssthresh`, slow-start, congestion avoidance. Vzorce pro RTO jsou **identické s TCP** (Jacobson):

$$
\text{SRTT}_n = (1 - \alpha) \cdot \text{SRTT}_{n-1} + \alpha \cdot R_n,\quad \alpha = 1/8
$$

$$
\text{RTTVAR}_n = (1 - \beta) \cdot \text{RTTVAR}_{n-1} + \beta \cdot |\text{SRTT}_{n-1} - R_n|,\quad \beta = 1/4
$$

$$
\text{RTO} = \text{SRTT} + 4 \cdot \text{RTTVAR}
$$

Konstanty $\alpha=1/8, \beta=1/4, k=4$ jsou stejné jako u TCP.

## Praktické nasazení {tier=practice}

SCTP **se prosadilo úzce**, nikoli univerzálně:

- **Telefonní signalizace** (SS7 over IP, Diameter, M3UA) — *jeho domácí biotop*.
- **WebRTC datachannels** — SCTP zapouzdřený do DTLS přes UDP. Aplikační vrstva v prohlížeči.
- **3GPP RAN** — signalizace mezi LTE/5G základnami a core (S1-AP, NGAP).

V *normálním internetu* SCTP **neuvidíte** — z prozaického důvodu: většina NAT/firewall middleboxů ho neznají a zahazují. Proto se WebRTC tváří jako UDP zvenčí, ale je v něm SCTP.

## Srovnání s TCP a UDP

| Vlastnost | UDP | TCP | SCTP |
| :--- | :---: | :---: | :---: |
| Spolehlivost | — | ✓ | ✓ |
| In-order | — | ✓ (byte stream) | ✓ (per-stream) |
| Hranice zpráv | ✓ | — | ✓ |
| Multistream | — | — | ✓ |
| Multi-homing | — | — | ✓ |
| 4WHS (anti-flood) | — | — | ✓ |
| NAT-friendly | ✓ | ✓ | ✗ |
| OS adopce | univerzální | univerzální | částečná |
| Nasazení | univerzální | univerzální | nika (telco, WebRTC) |

## Co dál

SCTP byl *přístup shora* — nový L4 protokol. Alternativa: **rozšířit TCP** o multi-homing a multi-streaming. To dělá **MP-TCP** ([[mptcp]]). A pak je tu radikální cesta — *odejít z L4* úplně a postavit transport *nad UDP* — **QUIC** ([[quic]]).

---

*Zdroj: PDS přednáška 2 (Transportní protokoly), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 9260 — SCTP (current spec)](https://www.rfc-editor.org/rfc/rfc9260); [RFC 3286 — Introduction to SCTP](https://www.rfc-editor.org/rfc/rfc3286); Stewart, R., Xie, Q.: *Stream Control Transmission Protocol* (Addison-Wesley 2001); [WebRTC Data Channels — W3C](https://www.w3.org/TR/webrtc/#peer-to-peer-data-api); Postel, J. (red.): RFC 4960 (předchozí verze SCTP, 2007).*
