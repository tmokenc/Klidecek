# Adresování L3 — IPv4 a IPv6

L2 ([[adresovani-l2]]) adresuje *na lokálním segmentu*. Pro doručení **mezi sítěmi** potřebujeme L3 adresování. Tato sekce zopakuje **IPv4** (klasické 32bit adresy, classful → classless → CIDR), **IPv6** (128bit nástupce) a speciální adresy obou rodin.

## IPv4 — základ

**IPv4** (RFC 791, 1981) — *connectionless*, *unreliable*, *best-effort delivery*. Bez QoS — to bylo přidáno až později (IntServ, DiffServ).

### IPv4 hlavička

Hlavička má 20 B (minimum) až 60 B (s options):

| Pole | Délka | Význam |
| :--- | :---: | :--- |
| Version | 4 bit | `4` |
| IHL | 4 bit | Internet Header Length (v 32bit slovech) |
| TOS / DSCP | 1 B | Type of Service / Differentiated Services |
| Total Length | 2 B | celková délka datagramu |
| Identification | 2 B | ID pro fragmentaci |
| Flags | 3 bit | reserved, DF (Don't Fragment), MF (More Fragments) |
| Fragment Offset | 13 bit | offset fragmentu (×8 B) |
| TTL | 1 B | Time To Live (dekrement na každém routeru) |
| Protocol | 1 B | typ payloadu (1=ICMP, 6=TCP, 17=UDP, ...) |
| Header Checksum | 2 B | checksum hlavičky (musí router přepočítat) |
| Source Address | 4 B | zdrojová IPv4 |
| Destination Address | 4 B | cílová IPv4 |
| Options + Padding | 0–40 B | volitelné rozšíření |

Dvě věci k zapamatování:

- **TTL** se dekrementuje na každém routeru. Při TTL = 0 router paket *zahodí* a pošle ICMP `Time Exceeded`. Slouží to jako ochrana proti smyčkám.
- **Header checksum** musí router přepočítat při každém průchodu (kvůli změně TTL). To je důvod, proč ho IPv6 *zrušilo*.

### IPv4 adresa — formát

IPv4 adresa je **32 bitů** = 4 B, zapsaná v *tečkové desítkové* notaci:

```
172.16.254.1   ⇄   10101100 . 00010000 . 11111110 . 00000001
```

Celkem $2^{32} - 2 \approx 4.3 \cdot 10^9$ adres (vyhrazené `0.0.0.0` a `255.255.255.255`). V roce 2024 byl pool IANA *prakticky vyčerpán* — proto migrace na IPv6.

### Network ID a Host ID

Adresa se logicky dělí na **NetId** (síťová část) a **HostId** (hostitelská část):

```
IPv4 = [ NetId | HostId ]
```

Otázka *kde je hranice* mezi NetId a HostId je klíčová — dvě historické odpovědi:

- **Classful** (RFC 791, 1981) — pevné hranice podle třídy.
- **Classless** (RFC 950+, 1985+) — *variabilní* hranice podle *subnet mask*.

### Classful — historický přístup

| Třída | První bity | Range | Síť/Host | Použití |
| :--- | :--- | :--- | :--- | :--- |
| **A** | 0 | 1.0.0.0–127.255.255.255 | 8 / 24 | velké sítě (málo, ale obří) |
| **B** | 10 | 128.0.0.0–191.255.255.255 | 16 / 16 | střední |
| **C** | 110 | 192.0.0.0–223.255.255.255 | 24 / 8 | malé |
| **D** | 1110 | 224.0.0.0–239.255.255.255 | — | multicast |
| **E** | 1111 | 240.0.0.0–255.255.255.255 | — | reserved (research) |

Problém: třída A měla 16M hostů, třída C jen 254. Org. s 1000 hosty si musela vzít celou B (65k adres → plýtvání). Tomu se říkalo *„class B sickness"* — koncem 80. let to vedlo k rychlému vyčerpání IPv4 prostoru.

### Classless — moderní přístup (CIDR)

**CIDR** (*Classless Interdomain Routing*, RFC 1518/1519, 1993) zrušilo třídy a zavedlo **subnet mask** = 32bit posloupnost jedniček (NetId) a nul (HostId):

```
IP:    192.168.48.247
Mask:  255.255.255.0    = /24
NetId: 192.168.48
HostId: 247
```

Notace: `/24` znamená *24 bitů NetId, 8 bitů HostId*. Tato hodnota se zapisuje za adresou: `192.168.48.247/24`.

CIDR má dvě výhody:

- **Subnetting** — velkou síť (např. `/16`) lze rozdělit na menší (`/24`, `/26`). RFC 917, 950.
- **Supernetting / aggregation** — naopak slučit více `/24` do jedné `/22` pro úsporu routing tabulky. **VLSM** (Variable Length Subnet Mask, RFC 1009) umožňuje různé velikosti subnetů.

Praktická tabulka (mask → block size):

| Prefix | Mask | Block size (hosts) |
| :--- | :--- | :---: |
| /8 | 255.0.0.0 | 16 777 214 |
| /16 | 255.255.0.0 | 65 534 |
| /24 | 255.255.255.0 | 254 |
| /28 | 255.255.255.240 | 14 |
| /30 | 255.255.255.252 | 2 |

(Block size = $2^{\text{host bits}} - 2$, protože síťová a broadcast adresa nejsou použitelné.)

### Speciální IPv4 adresy

| Adresa | Význam |
| :--- | :--- |
| `{NetId, all 0s}` | **Network address** (např. `192.168.1.0`) — adresa sítě, nelze přiřadit hostu |
| `{NetId, all 1s}` | **(Directed) Broadcast** (např. `192.168.1.255`) — všem v dané síti |
| `255.255.255.255` | **Limited broadcast** — jen v lokální síti (router nepřeposílá) |
| `127.0.0.0/8` | **Loopback** (typicky `127.0.0.1`) |
| `0.0.0.0` | nepřiřazená / default route |
| `169.254.0.0/16` | **Link-local** (APIPA) — autoconf při selhání DHCP |
| `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` | **Privátní** (RFC 1918) — nemohou se objevit v internetu |
| `100.64.0.0/10` | **CGNAT shared** (RFC 6598) — pro ISP carrier-grade NAT |

### IPv4 fragmentace

Pokud paket překračuje MTU následující linky, router ho rozdělí:

```
Original packet (Total Length=1500)
   ↓ fragmentace (MTU=666)
Fragment 1 (offset=0, MF=1, Length=660)
Fragment 2 (offset=80, MF=1, Length=660)
Fragment 3 (offset=160, MF=0, Length=220)
```

Hlavička každého fragmentu nese `Identification` (společný pro všechny fragmenty), `Fragment Offset` (×8 B) a flag `MF` (More Fragments — 0 jen u posledního).

Reassembly dělá *destination* — pokud chybí fragment, ICMP `Time Exceeded — Reassembly`.

## IPv6 — moderní L3

**IPv6** (RFC 8200, původně RFC 2460) řeší vyčerpání IPv4 a opravuje historické bolesti:

- **128bit adresy** — $3.4 \cdot 10^{38}$ možných — *„5 × 10²⁸ adres na osobu na Zemi"*.
- **Fixní 40 B hlavička** — bez `IHL`, bez checksumu (rychlejší zpracování).
- **Extension headers** — rozšíření přes řetězec dalších hlaviček (Fragment, Routing, AH, ESP, ...).
- **Bez fragmentace na routerech** — jen end-points fragmentují; PMTUD je *povinné*.
- **Bez broadcast** — nahrazen *multicastem*.

### IPv6 hlavička (40 B fixed)

| Pole | Délka | Význam |
| :--- | :---: | :--- |
| Version | 4 bit | `6` |
| Traffic Class | 1 B | QoS (DSCP) |
| Flow Label | 20 bit | identifikace flow (load balancing) |
| Payload Length | 2 B | délka payloadu (ne celého paketu) |
| Next Header | 1 B | typ následujícího headeru (0=Hop-by-hop, 6=TCP, 17=UDP, 43=Routing, 44=Fragment, 50=ESP, 51=AH, 58=ICMPv6, 60=Destination Options, 89=OSPF, 59=None) |
| Hop Limit | 1 B | obdoba TTL |
| Source Address | 16 B | zdroj |
| Destination Address | 16 B | cíl |

### Extension headers

IPv6 *nemá* options přímo v hlavičce. Místo toho se zřetězují **extension headers** mezi základní hlavičkou a payloadem:

```
[ IPv6 hdr (NextHdr=43) ][ Routing EH (NextHdr=44) ][ Fragment EH (NextHdr=6) ][ TCP segment ]
```

Každý EH má vlastní `Next Header` ukazující na další. Konečný header je *upper-layer* protokol (TCP, UDP, ICMPv6).

### IPv6 adresa — formát

128 bitů zapsaných jako 8 skupin 4 hexadecimálních číslic oddělených dvojtečkou:

```
2031:0000:130f:0000:0000:09c0:876a:130b
```

Zkrácení podle RFC 5952:

- *Vedoucí nuly* lze vypustit: `2031:0:130f:0:0:9c0:876a:130b`.
- *Jednu* posloupnost nul lze nahradit `::`: `2031:0:130f::9c0:876a:130b`.

Příklady:

| Zkrácený | Plný |
| :--- | :--- |
| `::1` | loopback `0:0:0:0:0:0:0:1` |
| `::` | nespecifikovaná |
| `ff02::1` | All-nodes multicast |

### Struktura IPv6 unicast adresy

```
[ Global Routing Prefix | Subnet ID | Interface ID ]
       n bits              m bits    (128-n-m) bits
```

Doporučení (RFC 4291):

- **/48 prefix** je standardně přidělen organizaci.
- **/64 subnet** — typická velikost LAN segmentu.
- **/128 host** — jednotlivá adresa.

### Speciální IPv6 adresy

| Adresa | Význam |
| :--- | :--- |
| `::/128` | unspecified (nepřiřazená) |
| `::/0` | default route |
| `::1/128` | **loopback** |
| `ff00::/8` | **multicast** |
| `fe80::/10` | **link-local unicast** — povinná, jen pro lokální segment |
| `fc00::/7` | **unique local unicast** (RFC 4193, obdoba privátních IPv4) |
| `::A.B.C.D` | IPv4-compatible (nedoporučeno) |
| `::ffff:A.B.C.D` | IPv4-mapped (např. v sockech) |
| zbytek | **global unicast** |

### Link-local adresa (fe80::/10)

Každé rozhraní s IPv6 *má* link-local adresu. Formát:

```
fe80:0000:0000:0000:[ 64-bit Interface ID ]
```

Interface ID se generuje typicky pomocí **EUI-64** z MAC adresy:

1. Vezme se 48bit MAC.
2. Vloží se `FF:FE` mezi OUI a NIC-specific část → 64 bit.
3. Invertuje se bit *Universal/Local* v prvním oktetu.

Příklad: MAC `00:08:0c:a0:c2:71` → OUI `00:08:0c` + NIC `a0:c2:71`, vložení `ff:fe` → `00:08:0c:ff:fe:a0:c2:71`, inverze U/L bitu (`00`→`02`) → Interface ID `02:08:0c:ff:fe:a0:c2:71`.

Alternativy generování Interface ID:

- **Privacy Extension** (RFC 4941) — random Interface ID kvůli ochraně soukromí.
- **CGA** (Cryptographically Generated Addresses, RFC 3972) — kryptograficky odvozená.
- **SLAAC** (StateLess Address AutoConfiguration) — kombinace router advertisement + EUI-64 nebo random.

### IPv6 multicast

Multicast nahrazuje broadcast. Formát:

```
ff[flag][scope]::group_id
```

- `flag = 0` permanentní, `1` temporary.
- `scope`: 1=interface-local, 2=link-local, 4=admin-local, 5=site-local, 8=org-local, e=global.

Známé multicast adresy:

| Adresa | Význam |
| :--- | :--- |
| `ff02::1` | All-nodes (link-local) |
| `ff02::2` | All-routers |
| `ff02::5` | OSPFv3 routers |
| `ff02::9` | RIP routers |
| `ff02::1:ffXX:XXXX` | **solicited-node** (pro NDP) |

### Solicited-node multicast

Adresa `ff02::1:ffXX:XXXX` se konstruuje z **dolních 24 bitů** unicast/anycast adresy uzlu. Používá ji **NDP** (Neighbor Discovery, IPv6 obdoba ARP) — místo broadcastu ARPu pošle ICMPv6 *Neighbor Solicitation* na solicited-node adresu daného hosta. Jen *velmi málo* hostů ji poslouchá, takže šum oproti broadcastu je minimální.

## Anycast

**Anycast** = stejná adresa přiřazená *více uzlům*. Routing doručí na *nejbližší* (podle metriky BGP/IGP).

- *IPv4* — implementuje se shodným unicast adresováním + BGP announcement z více míst (DNS root servery, CDN).
- *IPv6* — formálně podporovaný typ; adresa má stejný formát jako global unicast.

Anycast je *zázrak* moderní infrastruktury — Google DNS `8.8.8.8` je *anycast adresa* odpovídající z desítek lokací. Uživatel v Brně dostane odpověď z Frankfurtu, uživatel v Tokiu z Tokia — bez znalosti DNS klienta.

## Co dále

S IP adresami v ruce ukážeme **konkrétní průchod paketu sítí** — od aplikace přes ARP/NDP, výběr next-hopu a L2 přepsání hlavičky, až po cíl. Viz [[paketovy-prenos]].

---

*Zdroj: PDS přednáška 1 (Networker's Handbook, part 1), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 791 — IPv4](https://www.rfc-editor.org/rfc/rfc791); [RFC 8200 — IPv6](https://www.rfc-editor.org/rfc/rfc8200); [RFC 4291 — IPv6 Addressing Architecture](https://www.rfc-editor.org/rfc/rfc4291); [RFC 1918 — Private Address Space](https://www.rfc-editor.org/rfc/rfc1918); [RFC 5952 — IPv6 Address Text Representation](https://www.rfc-editor.org/rfc/rfc5952).*
