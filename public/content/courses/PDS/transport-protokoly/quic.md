---
title: QUIC a HTTP/3
---

# QUIC — TCP reinvented over UDP

V roce 2012 Google experimentoval s **gQUIC** — vlastním transportním protokolem nad UDP. Cíl: zrychlit web. Po sedmi letech vývoje IETF protokol formalizovala jako **QUIC** ([RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), 2021). Dnes (2026) nese QUIC ~30 % světového webového provozu — všechen YouTube, Google Search, Facebook, Cloudflare CDN. Aplikační protokol nad ním se jmenuje **HTTP/3**. QUIC vzal *to nejlepší* ze SCTP ([[sctp]]), MP-TCP ([[mptcp]]) a TLS 1.3 a vrazil to do UDP.

## Proč QUIC?

Tři problémy klasického `TCP + TLS + HTTP`:

1. **3 RTT před prvními aplikačními daty.** TCP 3WHS (1 RTT) + TLS handshake (2 RTT v 1.2). Pro CDN edge s ping 100 ms = **300 ms** přípravy než server pošle HTML.
2. **Head-of-line blocking** — ztracený TCP segment blokuje *všechny streamy* (HTTP/2 multiplexing nad TCP je proto klam).
3. **Connection migration je nemožná** — `(IP, port)` je *součást identity* TCP spojení. Když se mobil přepne z WiFi na LTE, IP se změní → spojení zemře → nová HTTP+TLS sezone.

QUIC řeší *všechny tři* + přidává **vestavěné šifrování** všech paketů (kromě nutného minima v hlavičce).

## Architektura

::: svg "Tradiční stack vs QUIC stack"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="20"  y="30" width="220" height="28"/>
    <rect x="20"  y="58" width="220" height="28"/>
    <rect x="20"  y="86" width="220" height="28"/>
    <rect x="20"  y="114" width="220" height="28"/>
    <rect x="20"  y="142" width="220" height="28"/>
    <rect x="300" y="30" width="220" height="28"/>
    <rect x="300" y="58" width="220" height="56"/>
    <rect x="300" y="114" width="220" height="28"/>
    <rect x="300" y="142" width="220" height="28"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="130" y="20" font-weight="600">HTTPS — classic</text>
    <text x="130" y="48">HTTP/2</text>
    <text x="130" y="76">TLS 1.3</text>
    <text x="130" y="104">TCP</text>
    <text x="130" y="132">IP</text>
    <text x="130" y="160">Ethernet</text>
    <text x="410" y="20" font-weight="600">HTTP/3 over QUIC</text>
    <text x="410" y="48">HTTP/3</text>
    <text x="410" y="78">QUIC</text>
    <text x="410" y="98" font-size="10" fill="var(--text-muted)">(streams + TLS 1.3 + CC)</text>
    <text x="410" y="132">UDP</text>
    <text x="410" y="160">IP / Ethernet</text>
  </g>
</svg>
:::

QUIC **konsoliduje** tři vrstvy do jedné: transport, security a stream-multiplexing. To umožňuje optimalizace, které jsou nedosažitelné, když je TLS *navrstvené* nad TCP (musí čekat na TCP handshake, ztráty se trápí dvakrát).

## QUIC — co poskytuje

| Vlastnost | Detail |
| :--- | :--- |
| Reliable | ARQ, fast retransmit, ACK ranges |
| In-order | per-stream (jako SCTP), ne přes streams |
| Streams | multiplexované, žádné HoL blocking mezi |
| Encryption | TLS 1.3 *vestavěné* (handshake i payload) |
| 0-RTT | aplikační data v *prvním* packetu (resumption) |
| Congestion control | default Cubic, lze BBR, NewReno |
| Loss recovery | similar TCP NewReno + RACK |
| Connection ID | identita *není* `(IP, port)` — přežije migraci |
| Authentic. of header | dokonce hlavička je integrity-chráněná |

## Handshake — od 3 RTT k 0 RTT

### Klasický `TCP+TLS 1.2`

```
SYN ──────────►
        ◄────── SYN+ACK                (1 RTT)
ACK ──────────►
ClientHello ──►
        ◄────── ServerHello + Cert
            ... ChangeCipherSpec       (2 RTT)
Finished ─────►
        ◄────── Finished
GET / ────────►                         (3 RTT před prvním requestem)
```

### `TCP + TLS 1.3`

TLS 1.3 zkrátilo z 2 RTT na 1 RTT — celkem **2 RTT před request**.

### QUIC **1-RTT**

```
QUIC Initial + ClientHello + 0-RTT ──►
                                ◄──── QUIC Initial + ServerHello + Cert + ...
GET / ───────────────────────────►   (1 RTT)
```

Jeden round-trip mezi otevřením a první GET. TLS handshake je *paralelizován* s QUIC handshakem.

### QUIC **0-RTT** (resumption)

Po dřívějším spojení server klientovi vydal **session ticket** (jako TLS resumption). Klient si pamatuje master secret. Při dalším spojení:

```
QUIC Initial + 0-RTT-ClientHello + GET / ──►
                                       ◄──── HTTP odpověď
```

**Nulové RTT** — aplikační request je *uvnitř* prvního paketu. Server odpoví okamžitě.

Cena 0-RTT: data v 0-RTT jsou náchylná k **replay attacks** — útočník odchytí 0-RTT paket a pošle ho podruhé; server ho zpracuje. Aplikace musí být *idempotentní* (jen GET, ne POST).

## Streams — HoL bez bolesti

QUIC stream ≈ TCP byte stream, ale spojení jich může mít *tisíce paralelně*. Každý stream:

- Vlastní pořadí dat.
- Vlastní flow control (`stream credits`).
- Ztráta v stream A *neblokuje* stream B (na rozdíl od HTTP/2-over-TCP).

::: svg "QUIC streams — paralelní toky bez HoL"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="20" y="20" width="60" height="30"/>
    <rect x="20" y="60" width="60" height="30"/>
    <rect x="20" y="100" width="60" height="30"/>
    <rect x="460" y="20" width="60" height="30"/>
    <rect x="460" y="60" width="60" height="30"/>
    <rect x="460" y="100" width="60" height="30"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="50" y="40">HTML</text>
    <text x="50" y="80">CSS</text>
    <text x="50" y="120">image</text>
    <text x="490" y="40">HTML</text>
    <text x="490" y="80">CSS</text>
    <text x="490" y="120">image</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.6" fill="none">
    <line x1="85" y1="35" x2="455" y2="35"/>
    <line x1="85" y1="75" x2="220" y2="75"/>
    <line x1="240" y1="75" x2="455" y2="75"/>
    <line x1="85" y1="115" x2="455" y2="115"/>
  </g>
  <g fill="var(--text-faint)" font-size="10">
    <text x="230" y="73" text-anchor="middle">✗</text>
  </g>
  <text x="270" y="155" fill="var(--text-muted)" text-anchor="middle" font-size="10">CSS packet lost — HTML a image pokračují</text>
</svg>
:::

HTTP/3 mapuje jeden HTTP request/response na *jeden QUIC stream*. 50 requestů paralelně = 50 streams. Když jeden balíček padne, ostatní 49 jdou dál.

## Paket a frame

QUIC paket = UDP payload obsahující **header** (částečně šifrovaný, částečně plaintextový) + **frames** (šifrované).

Frame typy:

| Frame | Účel |
| :--- | :--- |
| `STREAM` | aplikační data (stream ID, offset, payload) |
| `ACK` | rozsahy potvrzení (jako TCP SACK, ale bohatší) |
| `RESET_STREAM` | abort jednoho streamu (ostatní pokračují) |
| `STOP_SENDING` | "přestaň posílat tento stream" |
| `MAX_DATA` / `MAX_STREAM_DATA` | flow control |
| `CRYPTO` | TLS handshake zprávy |
| `NEW_CONNECTION_ID` / `RETIRE_CONNECTION_ID` | rotation pro migration / privacy |
| `PATH_CHALLENGE` / `PATH_RESPONSE` | validace migrace |
| `CONNECTION_CLOSE` | terminace |

Jeden UDP paket nese *víc* frame různých typů — bundling jako u SCTP, ale s kryptem.

## Connection ID — migrace bez bolesti

Klíčový rozdíl od TCP: **identita spojení není `(IP, port)`** — je to **Connection ID** (1–20 B, vyjednává se v handshaku).

Když mobil přepne z WiFi (IP 192.168.1.5) na LTE (IP 10.32.99.7):

- TCP: spojení **umírá** — IP se změnila.
- QUIC: klient pokračuje *se stejným CID*; server vidí pakety z nové IP, **zvaliduje cestu** (PATH_CHALLENGE/RESPONSE) a *pokračuje*.

Konec dropped Zoom calls při ztrátě WiFi 👏.

CID se může **rotovat** (NEW_CONNECTION_ID frame) pro privacy — třetí strana nemůže korelovat traffic dlouhodobě (chrání před tracking).

## Loss recovery a congestion control

QUIC loss recovery je vlastní algoritmus, ale **inspirovaný TCP** ([[tcp-congestion-variants]]):

- **Čísla paketů se nikdy znovu nepoužívají** — narozdíl od TCP, kde retransmise má *stejné* `seq`, QUIC retransmise nese *vyšší* packet number. Lehčí odhad RTT (Karn problem zmizí).
- **ACK ranges** — jako SACK, ale bez omezení 4 bloků.
- **PTO** (Probe Timeout) místo RTO — agresivnější detekce ztrát.
- **Loss detection** — *kombinace* time-based (RACK-like) a packet-threshold (3× ACK).

Congestion control je **vyměnitelný** — implementace volí default. Google QUIC: BBR. Mozilla NSS: NewReno. ms-quic: Cubic. RFC 9002 popisuje *referenční* loss recovery a CC.

## Šifrování *celého* paketu

QUIC šifruje:

- **Payload** — STREAM, ACK, atd.
- **Packet number** — chrání proti analýze RTT z odpozorovaných packet numbers.
- **Většinu header** — Long Header / Short Header. Pole jako "Reserved", "Spin Bit" jsou plaintext (slouží middleboxům pro pomocné statistiky).

Aplikace tedy *nemůže fungovat* nad QUIC bez TLS — krypt je inherentní část protokolu.

## Forward Error Correction — opuštěn

gQUIC měl experimentální **FEC** — k payloadu se přilepily paritní bity; ztracený paket lze rekonstruovat bez retransmise. Snižuje RTT ztráty.

V praxi FEC v gQUIC nepřinesl významný benefit (overhead ~10 %, gains pro 1% loss rate). IETF QUIC ho **vynechal**. Možná návrat ve formě "datagram" extensi pro real-time aplikace.

## HTTP/3

[RFC 9114](https://www.rfc-editor.org/rfc/rfc9114). HTTP nad QUIC. Hlavní rozdíly oproti HTTP/2:

- **Hlavičky** komprimovány **QPACK** místo HPACK (HoL-safe varianta HPACK).
- **Stream framing** = QUIC stream (žádný *vlastní* HTTP frame layer pro stream).
- **Server push** — *ponechán*, ale málo používaný; HTTP/2 push experimentem nedopadl.
- **Alt-Svc** — server v HTTP/1.1/2 hlavičce sdělí, že podporuje HTTP/3; klient přepne pro další requesty.

První request stále jde přes HTTPS/TCP (kvůli DNS+TLS); až server pošle `Alt-Svc: h3=":443"`, klient přepne. Hadnoty se cache-ují → další návštěva začíná hned v HTTP/3.

## Praktické dopady

- **YouTube** — všechno HTTP/3 od 2021.
- **Cloudflare** — HTTP/3 default pro všechny hostované weby.
- **TCP zůstává** pro non-web aplikace, legacy a SSH/email.
- **Middlebox-friendly** — QUIC je *zase* UDP, takže NAT projde.
- **DDoS amplification** — UDP-based, ale QUIC chrání proti reflection (Initial paket musí mít aspoň 1200 B, server odpoví menším paketem než klient — žádný amplification ratio).

## Co to znamená pro PDS

QUIC je *kulminace* všeho probraného:

- Sekvenční čísla, RTT odhad ([[timeouty-rtt]]).
- ARQ a SACK ([[arq-okno]]).
- Congestion control ([[rizeni-toku-zahlceni]], [[tcp-congestion-variants]]).
- Multistreaming ([[sctp]]).
- TLS handshake optimization.

Plus jedna *nová* hodnota: **encryption-by-default**. Internet od ~2020 míří k stavu, kde *plaintext L4 protokol* je archaická záležitost.

## Shrnutí celé kapitoly

V této přednášce jsme prošli evoluci transportní vrstvy:

| | Rok | Klíčový krok |
| :--- | :---: | :--- |
| TCP | 1981 | reliable byte stream |
| UDP | 1980 | best-effort, minimum |
| Tahoe | 1988 | congestion control |
| Reno → NewReno | 1990–1996 | fast recovery |
| SACK | 1996 | selektivní potvrzování |
| SCTP | 2000 | multistream, multi-home (nika) |
| Cubic | 2008 | high-speed CC default |
| MP-TCP | 2013 | multi-path do TCP |
| BBR | 2016 | model-based CC |
| QUIC | 2021 | UDP+TLS+stream+migration |

Příští přednáška ([[smerovani-uvod]]) opouští end-system a věnuje se **směrování** — co dělají *routery uvnitř sítě*, mezi end-pointy.

---

*Zdroj: PDS přednáška 2 (Transportní protokoly), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 9000 — QUIC Transport](https://www.rfc-editor.org/rfc/rfc9000); [RFC 9001 — Using TLS to Secure QUIC](https://www.rfc-editor.org/rfc/rfc9001); [RFC 9002 — QUIC Loss Detection and Congestion Control](https://www.rfc-editor.org/rfc/rfc9002); [RFC 9114 — HTTP/3](https://www.rfc-editor.org/rfc/rfc9114); Langley, A. et al.: „The QUIC Transport Protocol: Design and Internet-Scale Deployment" (ACM SIGCOMM 2017, [DOI 10.1145/3098822.3098842](https://doi.org/10.1145/3098822.3098842)); [Cloudflare Blog — HTTP/3 explained](https://blog.cloudflare.com/http3-the-past-present-and-future/); [IETF QUIC Working Group](https://datatracker.ietf.org/wg/quic/).*
