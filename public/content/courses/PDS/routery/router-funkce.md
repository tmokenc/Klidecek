# Funkce směrovače — routing vs forwarding

Přednáška o přepínačích ([[prepinac-uvod]]) ukázala, *jak vnitřně funguje L2 switch*. Tato přednáška dělá totéž pro **router** — L3 zařízení, které navíc musí *rozhodovat o cestě* napříč sítěmi. Klíčový rozdíl je v *separaci řízení od datového toku*: směrování (*routing*) běží *pomalu* v control plane, přepínání (*packet forwarding*) běží *rychle* v data plane.

## Dvě fundamentální operace

Router dělá *dvě věci*:

- **Směrování (routing)** — *vypočítává* routovací tabulku (RIB) ze stavů sousedů a směrovacích protokolů.
- **Přepínání paketů (packet forwarding)** — *pro každý paket* vyhledá výstupní rozhraní a přepošle.

```
┌────────────────── Route Processor ──────────────────┐
│                                                     │
│   ┌──────────────┐    Route updates                 │
│   │ Routing      │ ←─────────────────→ neighbors    │
│   │ Process      │    (BGP, OSPF, RIP, ISIS)        │
│   └──────┬───────┘                                  │
│          ↓                                          │
│   ┌──────────────┐                                  │
│   │ Routing      │  ← Master tabulka cest           │
│   │ Table (RIB)  │                                  │
│   └──────┬───────┘                                  │
│          ↓ optimalizováno                           │
│   ┌──────────────┐                                  │
│   │ Forwarding   │  ← Lookup tabulka                │
│   │ Table (FIB)  │                                  │
│   └──────┬───────┘                                  │
└──────────┼──────────────────────────────────────────┘
           ↓
┌──────────────────── Packet Forwarding ──────────────┐
│                                                     │
│  incoming → [lookup dst IP → FIB → next-hop + iface]│
│  → outgoing                                         │
└─────────────────────────────────────────────────────┘
```

## RIB vs FIB

Dvě tabulky s *odlišnými cíli*:

| | **RIB** (Routing Information Base) | **FIB** (Forwarding Information Base) |
| :--- | :--- | :--- |
| Co obsahuje | IP prefix → next-hop | IP prefix → (output interface, L2 adresa) |
| Pro koho | Routing process | Forwarding engine |
| Optimalizováno na | dynamické změny v topologii | rychlé vyhledávání cíle |
| Aktualizace | každá změna topologie | derivován z RIB |
| Velikost | full Internet ~1M prefixů | typicky stejně, ale cache může být menší |

Příklad RIB:

| IP prefix | Next hop |
| :--- | :--- |
| 10.5.0.0/16 | 192.168.2.254 |
| 10.15.0.0/16 | 104.17.2.1 |
| 88.0.0.0/8 | 129.1.1.1 |

Příklad FIB:

| IP prefix | Interface | Dst MAC | Src MAC |
| :--- | :--- | :--- | :--- |
| 10.5.0.0/16 | eth0 | 00:0F:1F:CC:F3:06 | B6:6B:2B:EA:FC:20 |
| 10.15.0.0/16 | eth1 | 01:12:11:A0:17:A0 | 00:16:17:E1:28:5F |
| 88.0.0.0/8 | eth2 | 01:3F:04:10:03:15 | 00:16:64:8B:DB:1A |

FIB obsahuje *přímo L2 adresy* — to šetří ARP lookup při každém paketu. L2 adresy se získávají z **ARP cache** (resp. **adjacency table** v CEF).

## Klíčové otázky

- *Jak vzniká směrovací tabulka?* — z routovacích protokolů (OSPF, BGP) nebo staticky.
- *Jak se vytváří přepínací tabulka?* — z RIB + ARP cache; derivace každého záznamu.
- *Co označují MAC adresy v tabulce?* — dst MAC = next-hop MAC; src MAC = MAC výstupního rozhraní *routeru*.
- *Co se stane při aktualizaci RIB?* — FIB se *přepočte* (cely nebo inkrementálně).
- *Co se stane při expiraci ARP Cache?* — záznam ve FIB se *zneplatní*; pro další paket je třeba znovu ARP.

## Zpracování IP datagramu

Detailní algoritmus zpracování IP paketu ve směrovači (RFC 1812, RFC 7084):

### Základní operace

1. **Validace hlavičky L3** — verze, délka, kontrolní součet.
2. **Kontrola TTL a její dekrementace** — TTL = 0 → drop + ICMP `Time Exceeded`.
3. **Přepočítání kontrolního součtu** — TTL se změnil, checksum se musí změnit.
4. **Zpracování rozšířených voleb IP** — `timestamp`, `record route`, `strict source route` (zřídka).
5. **Vyhledání cesty (next-hop)** podle adresy — lokální doručení / unicast / multicast.
6. **Fragmentace IP datagramů** — pokud délka paketu > `MTU_out` (velikost výstupního rozhraní) a paket nemá nastaven `DF` bit; jinak (`DF`=1) se paket zahodí a router pošle ICMP `Destination Unreachable / Fragmentation Needed` (code 4). Reassembly (defragmentaci) provádí *cílový host*, nikoli tranzitní router (ten skládá jen datagramy adresované sám sobě).
7. **Zpracování zpráv ICMP a IGMP** — error reporting, multicast management.

### Pokročilé operace

- **Dynamické směrování** — implementace OSPF, BGP, RIP, EIGRP, ISIS, MP-BGP. Udržování *sousedství* (hello, keep-alive). Aktualizace RIB/FIB.
- **Filtrování paketů (ACL)** — access control lists, firewall.
- **Překlad NAT** — přepisování polí v hlavičce, udržování *connection state table*.
- **Tunelování provozu** — GRE, IPSec, IPv6 over IPv4 (6in4, 6to4), MPLS.
- **Klasifikace dat, prioritizace** — QoS, DSCP marking, packet scheduling.
- **Správa zařízení** — DHCP, TFTP, SSH, SNMP, Syslog, NetFlow.

Tyto operace mají *velmi různou náročnost*. Validace hlavičky L3 je ~10 ns. Lookup ve FIB je ~50 ns. Defragmentace nebo NAT s velkým state table je ~µs. Proto rozdělujeme **fast path** (rychlá cesta, hardware) a **slow path** (pomalá cesta, software). Viz dále ([[prepinani-paketu]]).

## Co dále

Než se ponoříme do implementace zpracování, podíváme se na **kategorie směrovačů** — core, edge, enterprise, SOHO ([[router-kategorie]]). Každá má jiné požadavky na výkon, redundanci a cenu.

---

*Zdroj: PDS přednáška 5 (Architektura směrovačů), doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: [RFC 1812 — Requirements for IPv4 Routers](https://www.rfc-editor.org/rfc/rfc1812); [RFC 7084 — IPv6 Customer Edge Routers](https://www.rfc-editor.org/rfc/rfc7084); Medhi, D., Ramasamy, K.: *Network Routing* (Elsevier 2007).*
