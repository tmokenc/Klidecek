# Adresování L2 — Ethernet a MAC

Vrstva 2 (Data Link) přenáší **rámce** mezi *přímo propojenými uzly*. K identifikaci uzlů v segmentu slouží **MAC adresa**. Tato sekce shrnuje Ethernet jako dominantní L2 technologii, formát MAC adresy a strukturu Ethernet rámce.

## Ethernet — sdílený standard L2

**Ethernet** (IEEE 802.3) je dnes *univerzální* technologie LAN i datacentrových sítí. Klíčové vlastnosti:

- **Rychlosti:** 10 Mbps, 100 Mbps (Fast Ethernet), 1 Gbps, 10 Gbps, 40/100/400 Gbps. *Autonegotiation* — sousední zařízení si vyjednají nejvyšší společnou rychlost.
- **Duplexnost:** *half-duplex* (CSMA/CD na sdíleném médiu) i *full-duplex* (point-to-point se switchem). V moderní síti se používá výhradně full-duplex.
- **Kabelové systémy:** *metalické* (koaxiální — historické, kroucená dvojlinka *twisted pair* — Cat5e/6/6a/7), *optické* (single-mode, multi-mode).
- **Auto-MDIX** — switch sám rozpozná typ kabelu (cross-over vs straight-through).
- **Komunikace** — *unreliable connectionless* — žádné potvrzování na L2.
- **Power over Ethernet (PoE)** — kabel přenáší i napájení (IP telefony, AP, IP kamery).

## CSMA/CD — historický přístup k médiu

V *half-duplex* Ethernetu se na sdílené médium aplikuje **CSMA/CD** (*Carrier Sense Multiple Access with Collision Detection*):

1. **Carrier Sense** — uzel poslouchá, jestli někdo vysílá.
2. **Multiple Access** — pokud je klid, začne vysílat.
3. **Collision Detection** — pokud detekuje současné vysílání jiného uzlu → *backoff* (random čekání), opakuje pokus.

V dnešní switchované síti je každý port samostatná full-duplex doména, takže k *kolizím nedochází* (viz [[prepinac-uvod]]). CSMA/CD je tak dnes prakticky obsoletní. Bezdrátové sítě (WLAN, 802.11) místo detekce kolizí používají **CSMA/CA** — collision *avoidance*, protože detekci kolizí na rádiovém médiu nelze spolehlivě provést.

## MAC adresa — EUI-48

**MAC adresa** je 48bitový identifikátor, *vypálený* (burned-in) do ROM síťové karty (NIC). Formát:

```
00:0a:1e:55:6d:3b
```

- 6 bytů (oktetů), zapsaných v hexadecimálním tvaru s oddělovači `:` nebo `-`.
- Číslování IEEE: každý NIC by měl mít *globálně unikátní* MAC.

Struktura podle IEEE:

```
[ OUI (3 B) ][ NIC Specific (3 B) ]
   |             |
   |             └── Identifikátor v rámci výrobce
   └── Organizationally Unique Identifier (přiděluje IEEE)
```

První tři byty (**OUI**, *Organizationally Unique Identifier*) identifikují **výrobce** (Cisco, Intel, Realtek...). IEEE Registration Authority prodává OUI bloky výrobcům.

První byte MAC adresy má **dva speciální bity**:

| Bit | Význam |
| :---: | :--- |
| **b1 (LSB)** | 0 = unicast / 1 = multicast |
| **b2** | 0 = globally unique (OUI enforced) / 1 = locally administered |

Tedy: `01:00:5e:xx:xx:xx` je *multicast* (b1=1); `02:xx:xx:xx:xx:xx` je *locally administered* (b2=1, např. virtuální stroje).

Užitečné nástroje:

- **Windows:** `ipconfig /all`
- **Linux:** `ip a` nebo `ifconfig`
- **Wireshark OUI lookup:** [wireshark.org/tools/oui-lookup.html](https://www.wireshark.org/tools/oui-lookup.html)

## Ethernet frame format

Klasický Ethernet rámec (DIX, Ethernet II):

| Pole | Délka (B) | Význam |
| :--- | :---: | :--- |
| Preamble | 7 | synchronizační sekvence `10101010...` |
| SFD | 1 | Start-of-Frame Delimiter `10101011` |
| Destination MAC | 6 | cílová adresa |
| Source MAC | 6 | zdrojová adresa |
| EtherType | 2 | typ horního protokolu (0x0800 = IPv4, 0x86DD = IPv6, 0x0806 = ARP, ...) |
| Payload | 46–1500 | data (IP packet, ARP, ...) |
| FCS | 4 | Frame Check Sequence (CRC-32) |

Pozn.: IEEE 802.3 variant má místo *EtherType* pole *Length* + LLC/SNAP hlavičku. V praxi se používá DIX/Ethernet II — `EtherType ≥ 0x0600` jako rozlišení.

Minimální velikost rámce (bez preamble) je **64 B** (kvůli CSMA/CD detection windows). Pokud je payload menší, je rámec *zarovnán padding bytes*.

## Adresovací třídy MAC

| Typ | MAC adresa | Příklad |
| :--- | :--- | :--- |
| **Unicast** | b1 = 0 | `00:11:22:33:44:55` (libovolný NIC) |
| **Multicast** | b1 = 1 | `01:00:5e:xx:xx:xx` (IPv4 multicast mapping) |
| **Broadcast** | všechny 1 | `FF:FF:FF:FF:FF:FF` |

Broadcast `FF:FF:FF:FF:FF:FF` je speciální případ multicastu (všechny bity 1) — používá se typicky pro ARP request, DHCP discovery.

## Multicast mapping (IP → MAC)

Pro **IPv4 multicast** (`224.0.0.0/4`) existuje speciální mapování na MAC adresy:

- Prefix `01:00:5e` (24 bitů — z toho 1 bit pro multicast příznak).
- Dolních 23 bitů IPv4 multicast adresy se kopíruje do MAC.

Příklad: IPv4 `224.10.10.5` → MAC `01:00:5e:0a:0a:05`.

Pro **IPv6 multicast** (`ff00::/8`) je mapování jiné: prefix `33:33` + dolních 32 bitů IPv6 adresy. Detail viz [[paketovy-prenos]].

## ARP — most mezi L2 a L3

Když uzel chce poslat IP paket na adresu v *téže LAN*, musí znát **MAC** cílového uzlu. K tomu slouží **ARP** (*Address Resolution Protocol*, RFC 826):

1. Uzel pošle *ARP request* (broadcast `FF:FF:FF:FF:FF:FF`): *„kdo má 192.168.1.50?"*
2. Uzel s touto IP odpoví *ARP reply* (unicast): *„já, moje MAC je 00:1a:2b..."*
3. Odesílatel uloží mapování (IP → MAC) do *ARP cache* (typický TTL 1–5 min).

Pro IPv6 plní stejnou funkci **NDP** (*Neighbor Discovery Protocol*, RFC 4861), který používá **ICMPv6 Neighbor Solicitation** zprávy a *solicited-node multicast* adresu — viz [[adresovani-l3]] a [[paketovy-prenos]].

ARP je primárním vektorem **ARP spoofing/poisoning** útoků — viz Lec 8 ([[ids-uvod]]).

## Co dále

L2 adresování umožňuje *hop-by-hop* doručení na lokálním segmentu. Pro doručení **mezi sítěmi** potřebujeme L3 adresy a směrování — viz [[adresovani-l3]].

---

*Zdroj: PDS přednáška 1 (Networker's Handbook, part 1), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [IEEE 802.3 Ethernet standard](https://standards.ieee.org/ieee/802.3/); [RFC 826 — Address Resolution Protocol](https://www.rfc-editor.org/rfc/rfc826); [IEEE OUI Registration Authority](https://standards.ieee.org/products-programs/regauth/).*
