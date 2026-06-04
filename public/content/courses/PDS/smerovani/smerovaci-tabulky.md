---
title: Směrovací tabulky — RIB, FIB, longest prefix match
---

# Směrovací tabulky — co rozhoduje pošťák

Centrální struktura každého routeru je **směrovací tabulka**. Tato sekce ji rozebere podrobně — kvalita pochopení této struktury je *zásadní* pro porozumění všem routing protokolům ([[distance-vector]], [[link-state]], [[bgp-zaklady]]). Protokoly se *liší* v tom, *jak* tabulku naplní; *cíl* je stejný — perzistentní mapa `(prefix → kde to leží)`.

## Co potřebuji vědět pro forwarding

Když routeru přijde IP paket, otázka je *jediná*: **na který výstupní interface, k jakému next-hopu** to mám předat?

Minimální záznam:

| Položka | Co znamená |
| :--- | :--- |
| **Prefix** | cílový subnet (`10.1.0.0/16`) |
| **Outgoing interface** | jakým fyzickým rozhraním |
| **Next-hop IP** | komu konkrétně doručit |

Toto je *minimum*. Reálné routery přidávají další pole pro správu, diagnostiku a výběr.

## Plný záznam RIB

::: svg "Záznam směrovací tabulky"
<svg viewBox="0 0 540 130" font-family="ui-sans-serif, system-ui" font-size="10">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="20"  y="30" width="50"  height="36"/>
    <rect x="70"  y="30" width="80"  height="36"/>
    <rect x="150" y="30" width="55"  height="36"/>
    <rect x="205" y="30" width="55"  height="36"/>
    <rect x="260" y="30" width="80"  height="36"/>
    <rect x="340" y="30" width="80"  height="36"/>
    <rect x="420" y="30" width="50"  height="36"/>
    <rect x="470" y="30" width="50"  height="36"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="45"  y="44">Zdroj</text>
    <text x="45"  y="56">(písmeno)</text>
    <text x="110" y="44">Prefix</text>
    <text x="110" y="56">(síť/maska)</text>
    <text x="177" y="44">AD</text>
    <text x="177" y="56">/distance</text>
    <text x="232" y="44">Metric</text>
    <text x="232" y="56">(kosti)</text>
    <text x="300" y="44">Next-hop</text>
    <text x="300" y="56">IP</text>
    <text x="380" y="44">Outgoing</text>
    <text x="380" y="56">interface</text>
    <text x="445" y="44">Timer</text>
    <text x="445" y="56">(uptime)</text>
    <text x="495" y="44">Tag</text>
    <text x="495" y="56">(volit.)</text>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-family="ui-monospace, monospace" font-size="10">
    <text x="45"  y="90">O</text>
    <text x="110" y="90">10.2.0.0/16</text>
    <text x="177" y="90">110</text>
    <text x="232" y="90">2</text>
    <text x="300" y="90">192.168.1.5</text>
    <text x="380" y="90">FastEth0/1</text>
    <text x="445" y="90">00:12:34</text>
    <text x="495" y="90">—</text>
  </g>
  <text x="270" y="120" fill="var(--text-muted)" text-anchor="middle" font-size="10">Příklad: cesta naučená OSPFem (O), AD=110, metric=2 (cost), naživu 12 minut.</text>
</svg>
:::

### Zdroj (source code)

Jedno písmeno označuje, **odkud se trasa do tabulky dostala**:

| Písmeno | Zdroj |
| :--- | :--- |
| `C` | *Connected* — síť přímo přiojená k tomuto routeru |
| `L` | *Local* — IP samotného routeru na rozhraní |
| `S` | *Static* — administrátor ručně přidal |
| `R` | *RIP* |
| `O` | *OSPF* (intra-area) |
| `O IA` | OSPF inter-area |
| `O E1`, `O E2` | OSPF externí (redistribuce) |
| `D` | *EIGRP* |
| `D EX` | EIGRP externí |
| `i` | *IS-IS* |
| `B` | *BGP* |

Notace se mírně liší napříč vendory (Cisco vs Juniper), ale princip je univerzální.

### Administrative Distance (AD)

**Co dělá, když máš dva zdroje stejné trasy?** Příklad: RIP i OSPF tvrdí, že do `10.2.0.0/16` se chodí přes různé next-hops. *Komu věřit?*

**Administrative Distance** je číslo `0–255`. **Menší = lepší.** Tabulky AD jsou *vendor-specifické* katalogy.

Cisco default:

| Zdroj | AD |
| :--- | :---: |
| Connected | 0 |
| Static | 1 |
| EIGRP summary | 5 |
| eBGP | 20 |
| EIGRP (interní) | 90 |
| IGRP | 100 |
| OSPF | 110 |
| IS-IS | 115 |
| RIP | 120 |
| EIGRP (externí) | 170 |
| iBGP | 200 |
| Neznámý | 255 (= *neinstaluj*) |

Juniper má jiné hodnoty. *Nepamatovat* — vědět, že existuje katalog a *menší vyhrává*.

### Metric

**Cena cesty** v rámci jednoho protokolu. *Menší = lepší.* Metriku používá protokol pro **interní rozhodování**, AD se aplikuje *mezi* protokoly.

Hodnoty *nesrovnatelné* napříč protokoly:

| Protokol | Metric |
| :--- | :--- |
| RIP | hop count (1–15) |
| OSPF | cost (typicky $10^8 / \text{bandwidth}$) |
| EIGRP | composite (bandwidth + delay + load + reliability) |
| IS-IS | metric (0–63 narrow / 0–16M wide) |
| BGP | composite z atributů (path length jen jeden z mnoha) |

RIP s metric 15 = "blízko" v jeho měřítku. EIGRP s metric 3072 — záleží, *co znamená*. Není možné je porovnávat *přímo*; každý protokol má interpretaci své jednotky.

### Next-hop IP a outgoing interface

Při forwardingu router:

1. Najde záznam pro target prefix.
2. Z next-hopu zjistí, *komu na lince* poslat (ARP/ND → MAC adresa).
3. Zabalí paket do L2 framu pro outgoing interface.

Pokud next-hop a outgoing interface jsou nekonzistentní (next-hop nedostupný na daném IF) — *recursive lookup* — router rekurzivně dohledá, jak se k next-hopu dostane.

### Timer (uptime)

Kolik je trasa "naživu". Pro dynamické protokoly se *reseuje* každou aktualizací — pokud protokol nepošle update do timeout, trasa se *expiruje*.

Statické trasy a connected — *bez timeru*, žijí dokud nezmizí konfigurace nebo interface.

## Příklad rozhodování

Příchozí paket na destinaci `10.2.3.4`. Routing table:

```
Source  Prefix          AD    Metric  Next-hop      Iface
C       10.0.0.0/24     0     0       —             eth0
S       10.2.0.0/16     1     0       192.168.1.10  eth1
O       10.2.0.0/16     110   3       192.168.2.5   eth2
B       10.2.0.0/16     200   —       192.168.3.1   eth3
```

Router musí vybrat. Algoritmus:

1. **Longest prefix match** — zúží na záznamy s nejdelším prefixem matchujícím `10.2.3.4`. Tři kandidáti s `/16`, jeden s `/24`. `10.0.0.0/24` ale NEmatchuje `10.2.3.4`. Zůstávají tři.
2. **Lowest AD wins** — z `/16` má static AD=1, OSPF AD=110, iBGP AD=200. *Static vyhrává.*
3. *Pokud by byly dvě cesty se stejným AD i metric* — **load balancing** (ECMP).

Důsledek: do RIB instalován je *jen jeden* záznam (nebo víc při ECMP).

## RIB vs FIB

Velký rozdíl ve moderních routerech:

- **RIB** (Routing Information Base) — *velký, abstraktní*, drží **všechny** kandidátní cesty od všech protokolů. Typicky **software-resident** (CPU + RAM). Update pomalý (sekundy).
- **FIB** (Forwarding Information Base) — *malý, optimalizovaný*, drží **jen vybrané** cesty pro hardware lookup. Typicky **hardware-resident** (TCAM, ASIC). Lookup nanosekundový.

Vztah: routing protokol naplní RIB → "best route" se *kopíruje* do FIB → hardware forwarding rychle dohledává.

::: svg "RIB vs FIB — control plane a data plane"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="40" y="30" width="200" height="60"/>
    <rect x="40" y="120" width="200" height="60"/>
    <rect x="320" y="30" width="180" height="60"/>
    <rect x="320" y="120" width="180" height="60"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="140" y="55" font-weight="600">RIB</text>
    <text x="140" y="74" font-size="10">(Routing Information Base)</text>
    <text x="140" y="145" font-weight="600">FIB</text>
    <text x="140" y="164" font-size="10">(Forwarding Information Base)</text>
    <text x="410" y="55" font-weight="600">Control plane</text>
    <text x="410" y="74" font-size="10">CPU, OSPF/BGP/EIGRP daemons</text>
    <text x="410" y="145" font-weight="600">Data plane</text>
    <text x="410" y="164" font-size="10">ASIC, TCAM, line cards</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.6" fill="none">
    <line x1="140" y1="92" x2="140" y2="118" marker-end="url(#arr)"/>
  </g>
  <defs>
    <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="155" y="108" fill="var(--text-muted)" font-size="10">install best</text>
</svg>
:::

V SDN architekturách ([[sdn-uvod]]) je RIB *centralizovaná* (controller drží all-routes view), FIB *distribuovaná* (na switch ASICu).

## Longest Prefix Match — proč zlatá pravidla

Příklad — *defaultní brána*: prefix `0.0.0.0/0` matchuje *cokoliv*. Mám-li v tabulce:

```
0.0.0.0/0       → ISP
10.0.0.0/8      → internal-core
10.1.0.0/16     → branch-Brno
10.1.5.0/24     → branch-Brno-floor5
```

Paket pro `10.1.5.42` *matchuje všechny čtyři*. Vyhrává **nejdelší** = `/24`. Paket pro `10.1.7.1` matchuje `/16, /8, /0` → vyhrává `/16`. Paket pro `8.8.8.8` matchuje *jen* `/0`.

LPM umožňuje **agregaci**: ISP inzeruje *jediný* `185.10.0.0/16` místo 65536 `/32` záznamů. Routery na páteři internetu drží *zhruba 1 000 000* `/24` či větších prefixů — bez agregace by to bylo *250 milionů* `/32` a hardware by zkolaboval.

## CAM tabulka vs RIB

**Switch** L2 má **CAM** (Content-Addressable Memory) tabulku — minimum:

| MAC adresa | Port |
| :--- | :--- |
| `00:1a:2b:3c:4d:5e` | Gi1/0/4 |
| `02:42:ac:11:00:02` | Gi1/0/7 |

*Žádný* AD, *žádná* metrika, *žádný* next-hop. Switch nedělá agregaci (flat MAC addressing), proto velikost CAM = lineárně s počtem unikátních MAC adres v segmentu (typicky 8–128k záznamů).

Naopak směrovací tabulka má bohatou strukturu — protokoly do ní cpou různě "drahé" trasy a router musí vybírat.

## V praxi: `route print` na Windows {tier=practice}

I notebook má směrovací tabulku — Wifi, Ethernet, VPN, Docker bridge…

```
$ route print
=== IPv4 Route Table ===
Network Dest.    Netmask         Gateway       Interface       Metric
0.0.0.0          0.0.0.0         192.168.1.1   192.168.1.42    25
127.0.0.0        255.0.0.0       127.0.0.1     127.0.0.1       331
192.168.1.0      255.255.255.0   ON-LINK       192.168.1.42    281
192.168.99.0     255.255.255.0   ON-LINK       192.168.99.1    35     ← Docker
```

Default route (`0.0.0.0/0`) přes router doma. Loopback. WiFi subnet (on-link = bez next-hopu, přímo na lince). Docker bridge subnet.

Operační systém **je router** v okamžiku, kdy má víc než jedno rozhraní.

## Co dál

Tabulka je *cíl*; protokoly jsou *prostředek*. Začneme nejjednodušším typem — **distance vector** ([[distance-vector]]) — jak router pomocí Bellman-Fordova algoritmu konverguje k mapě sítě, *aniž by* viděl topologii.

---

*Zdroj: PDS přednáška 3 (Směrování), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: Doyle, J., Carroll, J.: *Routing TCP/IP, Vol. I* (2. vyd., Cisco Press 2005); [RFC 4632 — CIDR](https://www.rfc-editor.org/rfc/rfc4632) (Longest Prefix Match základ); [Cisco — Administrative Distance reference](https://www.cisco.com/c/en/us/support/docs/ip/border-gateway-protocol-bgp/15986-admin-distance.html); [Juniper Route Preference](https://www.juniper.net/documentation/us/en/software/junos/static-routing/topics/concept/routing-protocols-default-route-preferences-values-overview.html).*
