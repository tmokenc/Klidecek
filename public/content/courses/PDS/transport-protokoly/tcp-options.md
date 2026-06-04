---
title: TCP options — MSS, WS, SACK, Timestamps
---

# TCP options — kde žije moderní funkcionalita

Fixní 20 B hlavička TCP ([[tcp-spojeni-hlavicka]]) byla navržená v roce 1981 — bez schopnosti přizpůsobit se rychlému internetu (10 GbE), velkým RTT (geostacionární linky) nebo selektivnímu potvrzování. Designerům zachránila zadní vrátka v podobě **TCP Options** — 0–40 B přívěšek, do kterého se *postupně přidávaly* všechny novější schopnosti, *aniž by se měnila* základní hlavička. Tato sekce probere ty nejdůležitější.

## Formát option

Každá option má **TLV** kódování:

- **Kind** (1 B) — typ option (registr v [IANA](https://www.iana.org/assignments/tcp-parameters/)).
- **Length** (1 B, pokud Kind > 1) — celková délka v bajtech (včetně Kind a Length).
- **Data** (variabilní) — payload.

Tři "no-data" speciály:

- `Kind = 0` (EOL — End of Options).
- `Kind = 1` (NOP — No-Op, pad). Slouží k zarovnání následující option na 4-byte hranici.
- Délka 0 dovolena jen u EOL/NOP.

Maximum **40 B** option celkem (omezeno 4-bit polem Data Offset).

## MSS — Maximum Segment Size

**Kind = 2, Length = 4.** Nejstarší a *povinná* option, vyměňuje se v `SYN` a `SYN+ACK`.

Sděluje protistraně, *kolik bajtů payloadu* je ochotný přijmout v jediném segmentu (bez IP a TCP hlaviček). Default = 536 B (RFC 1122). Typicky na Ethernetu:

$$\text{MSS} = \text{MTU} - 20\ (\text{IPv4}) - 20\ (\text{TCP}) = 1500 - 40 = 1460\ \text{B}$$

S IPv6 a/nebo IPSec headers se MSS snižuje. Příliš velké MSS vede k IP fragmentaci po cestě — což je *katastrofa* pro výkon (každý fragment musí dorazit), a navíc pro PMTU-blackhole, kde router fragment zahodí.

Moderní stacky používají **PMTUD** — klasická varianta ([RFC 1191](https://www.rfc-editor.org/rfc/rfc1191)) dynamicky probuje větší/menší MSS podle ICMP zpětné vazby; pro cesty s ICMP-blackhole slouží jako fallback **PLPMTUD** ([RFC 4821 — Packetization Layer Path MTU Discovery](https://www.rfc-editor.org/rfc/rfc4821)), která MTU zjišťuje pomocí probe paketů a ACK na úrovni packetization layer, *bez závislosti na ICMP*.

## Window Scaling — pro rychlé linky

**Kind = 3, Length = 3.** Vyměňuje se *jen v `SYN`* (jinak ignorováno). RFC 7323.

**Problém:** `Window` v hlavičce má 16 b → max 65 535 B. Pro 10 Gbps linku s RTT 100 ms je *bandwidth-delay product*:

$$\text{BDP} = 10^{10}\ \text{b/s} \cdot 0{,}1\ \text{s} / 8 = 125\ \text{MB}$$

Bez WS by `rwnd` saturoval na 64 kB — propustnost limitovaná na 640 kB/s, *1700× pomaleji* než linka.

**Řešení:** option nese `shift_count` (0–14). Skutečné okno = `Window << shift_count`. Při `shift = 14` je max okno $2^{16} \cdot 2^{14} = 2^{30} = 1\ \text{GB}$.

Důsledek: každá strana má nezávislý `shift_count` (dohodne se v 3WHS). Pokud jedna strana option *neumí*, **obě** zůstanou na 16-bitech (kompatibilita).

## SACK — Selective Acknowledgment

**Kind = 4 (SACK Permitted), 5 (SACK Block).** RFC 2018, 1996.

**Problém:** kumulativní `ack` v hlavičce hlásí *poslední bajt přijatý v pořadí*. Pokud chybí jeden segment, odesílatel musí *uhádnout*, co dál dorazilo. Ve špatném případě posílá vše znovu od chybějícího místa — *go-back-N* chování.

**Řešení:** option `SACK Block` obsahuje seznam (až 4) bloků `[left edge, right edge)`, které příjemce drží v *out-of-order* bufferu.

Sekvence při ztrátě paketu 92:

```
seq=92,  100 B  ────►  X (ztracen)
seq=192, 100 B  ────►  OK
seq=292, 100 B  ────►  OK
                       ◄── ack=92, SACK [192-292) [292-392)
```

Odesílatel vidí: kumulativní ack je 92 (musíme znovu poslat 92), ale 192–392 jsou v bufferu — *neposílat je*. Šetří bandwidth.

Negociace přes `SACK Permitted` (Kind=4) v `SYN`. Bloky se posílají v `ACK` segmentech (Kind=5, Length = 8N + 2 pro N bloků).

## Timestamps — RTTM a PAWS

**Kind = 8, Length = 10.** RFC 7323.

Dvě 32-bit pole: **TSval** (timestamp odesílatele), **TSecr** (echo nejnovějšího TSval od protistrany).

### RTTM — Round-Trip Time Measurement

Standardní RTT odhad ([[timeouty-rtt]]) musí *vyloučit retransmise* (Karnův algoritmus). S timestampy lze měřit RTT z *libovolného* ACK — TSecr nese původní TSval daného segmentu, $\text{RTT} = \text{now} - \text{TSecr}$. Lepší vzorek RTT → přesnější RTO.

### PAWS — Protection Against Wrapped Sequences

Pro 10 Gbps linku trvá 32-bit sekvenční prostor naplnit *~3,5 s*. Pokud paket zpožděný > 3,5 s dorazí, sekvenční čísla se mohou "wrap around" a paket vypadá jako *platný nový segment* z budoucnosti. Důsledek: korupce dat.

PAWS: porovnává **TSval** nového segmentu s posledním přijatým. Pokud `new_TSval < last_TSval`, zahodí — protože časovače běží vpřed, starý duplikát má menší timestamp.

## TFO — TCP Fast Open

**Kind = 34, Length variabilní.** RFC 7413.

Zkracuje handshake o jeden RTT pro *opakovaná* spojení na stejný server. Po prvním plném 3WHS server vydá *TFO cookie*. Při dalším spojení klient pošle data **už v `SYN`** spolu s cookie — server je předá aplikaci ještě před dokončením handshaku.

Reálně používá Chrome (Linux 3.7+), velký bonus pro mobilní sítě s vysokým RTT.

## MP-TCP option

**Kind = 30.** RFC 8684. Sub-types pro `MP_CAPABLE`, `MP_JOIN`, `DSS` (Data Sequence Signal), `ADD_ADDR`, `REMOVE_ADDR` atd.

Magie multipath TCP ([[mptcp]]) je celá v této option — uvnitř standardního TCP segmentu se "skrytě" přidávají data o paralelních subflow. Servery, které option neznají, vidí *normální TCP*; servery, které option znají, se přepnou do MP-TCP režimu.

## Ostatní

Stručně, kvůli úplnosti:

| Kind | Option | Účel |
| :---: | :--- | :--- |
| 0 | EOL | konec options |
| 1 | NOP | padding |
| 2 | MSS | dohoda velikosti segmentu |
| 3 | Window Scale | škálování okna |
| 4 | SACK Permitted | negociace SACK |
| 5 | SACK Block | seznam přijatých rozsahů |
| 8 | Timestamps | RTTM, PAWS |
| 19 | MD5 Signature | autentizace (BGP, RFC 2385) |
| 29 | TCP-AO | náhrada MD5 (RFC 5925) |
| 30 | Multipath TCP | viz [[mptcp]] |
| 34 | TCP Fast Open | data v `SYN` |
| 254 | EXP_FastOpen | dříve experimentální TFO (sdílená exp. option, ExID 0xF989) |

## Praktické zachycení {tier=practice}

Wireshark zobrazí options v expandovaném pohledu TCP segmentu. Příkazem `tshark -O tcp -V tcp.flags.syn==1 -c 1` vypíšete options při handshaku:

```
Transmission Control Protocol
  Source Port: 54200
  Destination Port: 443
  Flags: 0x002 (SYN)
  Window: 65535
  Options: (40 bytes)
    Maximum segment size: 1460 bytes
    No-Operation (NOP)
    Window scale: 7 (multiply by 128)
    SACK permitted
    Timestamps: TSval 4012345678, TSecr 0
    No-Operation (NOP)
    No-Operation (NOP)
```

## Co dál

Hlavička a její options jsou *mechanika* TCP. Skutečná dynamika protokolu — *jak rychle posílat* — je předmětem dalšího tématu: **TCP congestion control** ([[tcp-congestion-variants]]).

---

*Zdroj: PDS přednáška 2 (Transportní protokoly), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 9293 — TCP](https://www.rfc-editor.org/rfc/rfc9293); [RFC 7323 — TCP Extensions for High Performance](https://www.rfc-editor.org/rfc/rfc7323) (Window Scaling, Timestamps, PAWS); [RFC 2018 — TCP Selective Acknowledgment](https://www.rfc-editor.org/rfc/rfc2018); [RFC 7413 — TCP Fast Open](https://www.rfc-editor.org/rfc/rfc7413); [RFC 4821 — Packetization Layer PMTUD](https://www.rfc-editor.org/rfc/rfc4821); [IANA — TCP Parameters](https://www.iana.org/assignments/tcp-parameters/).*
