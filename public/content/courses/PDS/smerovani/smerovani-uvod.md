---
title: Směrování — koncept a terminologie
---

# Směrování — koncept pošťáka

Předchozí přednáška ([[transport-uvod]]) skončila u **end-to-end** komunikace mezi koncovými zařízeními. Teď opouštíme koncové uzly a jdeme **dovnitř sítě** — k otázce, *jak* síť doručí paket od A do B, když mezi nimi leží stovky směrovačů a tisíce kilometrů kabelů. Tato kapitola je největší v PDS (lekce 3, 170+ slidů) a její struktura je: koncepty → tabulky → algoritmy → konkrétní protokoly (RIP, EIGRP, OSPF, BGP, MPLS).

## Co je směrování — definice

> **Směrování** (routing) je *proces rozhodování*, kterým směrem poslat příchozí PDU na základě nějaké **rozhodovací tabulky**.

Definice úmyslně neříká *kde* — protože routing dělá:

- **Router** — rozhoduje L3 na základě IP adresy → směrovací tabulka.
- **Switch** — rozhoduje L2 na základě MAC adresy → CAM tabulka.
- **Operační systém** — rozhoduje, do kterého procesu doručit segment → tabulka portů.
- **HTTP proxy** — rozhoduje podle `Host:` headeru, kam reverse-proxy předá požadavek (request).
- **NAT box** — rozhoduje podle (IP, port) páru, do které interní adresy přemapovat.

Všechny *jsou pošťáci* — mají vstup, výstup a rozhodovací logiku. PDS se primárně zabývá L3 (sítovou) variantou, ale vzory jsou *obecné*.

## Routing vs forwarding — terminologie

Standardní vendor literatura (Cisco, Juniper) rozlišuje:

| Termín | Význam |
| :--- | :--- |
| **Routing** | *budování* směrovací tabulky — naučení se, kde jsou cíle. Pomalá control-plane operace, často protokol (OSPF, BGP). |
| **Forwarding** | *vlastní přesun* paketu z vstupního na výstupní rozhraní podle existující tabulky. Rychlá data-plane operace, paralelizovaná v ASIC/TCAM. |

Někdy se "routing" používá zastřešujícím způsobem (obě role). V PDS budeme **rozlišovat striktně**:

- Routing = control plane (budování RIB).
- Forwarding = data plane (lookup v FIB).

To rozdělení je *zásadní* pro SDN ([[sdn-uvod]]) — SDN právě odpojuje control od data plane.

## Adresování vs pojmenování

Před samotným směrováním si dejme pozor na rozdíl:

- **Jméno** (name) — *kdo* je entity. Jednoznačný identifikátor v nějakém scope (`google.com`, hostname `pc01.example.com`).
- **Adresa** (address) — *kde* je entity v nějakém prostoru. Lokalizuje uzly v topologii.

V ideálním světě by každý uzel měl *jméno*, jedno na celý život, a *adresu*, která se mění podle topologie. V dnešním internetu jsou *zaměněné*:

- IP adresa **identifikuje rozhraní**, ne uzel (notebook s WiFi + Ethernet = 2 IP).
- Když uzel změní síť, dostane novou IP — *identita se ztratí*.

DNS to řeší půlcestou — jméno → IP překlad, ale ne obráceně dynamicky. Moderní pokusy (HIP, ILNP, LISP) zatím nepronikly.

### Typy adres podle scope komunikace

| Typ | Komunikace | Příklad IPv4 |
| :--- | :--- | :--- |
| **Unicast** | 1 ↔ 1 | `192.168.1.10` |
| **Broadcast** | 1 → všem v subnetu | `192.168.1.255` |
| **Multicast** | 1 → skupině | `224.0.0.0/4` |
| **Anycast** | 1 → *nejbližšímu* z group | typicky `192.0.2.0/24` AS-anycast |

Klasický příklad **anycastu**: DNS root servery. Existuje **13 jmen** (a.root-servers.net … m.root-servers.net), ale **stovky fyzických instalací** po celém světě. Všechny jsou anycast — BGP směruje paket k *topologicky nejbližšímu*. Když Brno-uzel pošle dotaz na `a.root-servers.net`, dostane se to do Frankfurtu, ne do Washingtonu.

### Flat vs hierarchická adresa

**Flat** — adresa *nenese informaci* o poloze.

- **MAC adresa** (48 b): `02:42:ac:11:00:02`. Z adresy poznám jen výrobce (OUI prefix), neuhádnu, kde uzel fyzicky je.
- *Důsledek*: switch musí pro každou MAC adresu znát individuální záznam → CAM tabulka roste lineárně.

**Hierarchická** — adresa *kóduje* polohu v topologii.

- **IPv4/IPv6 prefix**: `192.168.1.0/24` znamená "subnet má 256 adres". Když všechny adresy v dané síti sdílí prefix, router stačí znát *prefix*, ne 256 individuálních adres.
- *Analog*: Manhattan grid (5th Avenue × 53rd Street → jednoznačná lokace). Když znám aktuální polohu, *přímo* odvodím směr.

Hierarchie umožňuje **agregaci** — kritická vlastnost pro škálování internetu. ISP s 65k adresami inzeruje *jediný* prefix `/16`, ne 65k záznamů.

## Adresní hierarchie v internetu

::: svg "Hierarchie přidělování IP adres"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="200" y="20" width="140" height="28"/>
    <rect x="60" y="70" width="120" height="28"/>
    <rect x="360" y="70" width="120" height="28"/>
    <rect x="20" y="120" width="100" height="28"/>
    <rect x="120" y="120" width="100" height="28"/>
    <rect x="320" y="120" width="100" height="28"/>
    <rect x="420" y="120" width="100" height="28"/>
    <rect x="60" y="170" width="100" height="22"/>
    <rect x="360" y="170" width="100" height="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="38" font-weight="600">IANA</text>
    <text x="120" y="88">RIPE NCC (EU)</text>
    <text x="420" y="88">ARIN (NA)</text>
    <text x="70" y="138">CESNET</text>
    <text x="170" y="138">Vodafone CZ</text>
    <text x="370" y="138">Verizon</text>
    <text x="470" y="138">Comcast</text>
    <text x="110" y="185">VUT FIT</text>
    <text x="410" y="185">enterprise</text>
  </g>
  <g stroke="var(--text-faint)" stroke-width="1">
    <line x1="270" y1="48"  x2="120" y2="70"/>
    <line x1="270" y1="48"  x2="420" y2="70"/>
    <line x1="120" y1="98"  x2="70"  y2="120"/>
    <line x1="120" y1="98"  x2="170" y2="120"/>
    <line x1="420" y1="98"  x2="370" y2="120"/>
    <line x1="420" y1="98"  x2="470" y2="120"/>
    <line x1="70"  y1="148" x2="110" y2="170"/>
    <line x1="370" y1="148" x2="410" y2="170"/>
  </g>
</svg>
:::

- **IANA** přiděluje bloky **RIR**ům (RIPE NCC = Evropa, ARIN = Severní Amerika, APNIC = Asie, AFRINIC = Afrika, LACNIC = Lat. Amerika).
- **RIR** přiděluje bloky **LIR**ům (poskytovatelé Cesnet, Vodafone, Verizon).
- **LIR** dál přiděluje koncovým zákazníkům.

Pro Evropu **RIPE NCC** v Amsterdamu, model **subscription** — roční poplatek (~1500 € za /22 v 2025). Bloky **nejsou vlastnictví**, jsou v pronájmu — neplatíš, ztrácíš. V USA **ARIN** historicky dělal jednorázové prodeje — proto MIT, Stanford, DoD, HP mají /8 bloky (16,7 mil. adres). Reverzní převod (např. HP koupilo Compaq 2002 hlavně kvůli /8) se občas děje.

V IPv6 svět vidíme **patchwork mapy** — IANA postupně rozdávala bloky podle žádostí; výsledek je nesouvislé štěpení.

## Co nás čeká

Plán této kapitoly:

1. **Směrovací tabulky** ([[smerovaci-tabulky]]) — co je *uvnitř* RIB; AD, metrika, FIB vs RIB; longest prefix match.
2. **Distance vector** ([[distance-vector]]) — Bellman-Ford, count-to-infinity, split horizon.
3. **DV protokoly** ([[dv-protokoly]]) — RIP, RIPng, EIGRP, Babel.
4. **Link-state** ([[link-state]]) — Dijkstra, OSPF, IS-IS, LSDB.
5. **BGP základy** ([[bgp-zaklady]]) — path vector, AS, eBGP/iBGP, atributy.
6. **BGP policy a TE** ([[bgp-policy-te]]) — komunity, traffic engineering, peering.
7. **MPLS** ([[mpls]]) — label switching, LSP, LDP, RSVP-TE.
8. **Konvergence a smyčky** ([[konvergence-smycky]]) — split horizon, poison reverse, hold-down.

Každá z těchto sekcí dále propojí *vzory* (např. "metric") napříč protokoly. Lekce končí *žhavým* tématem — SDN přesune routing z jednotlivých routerů do centralizovaného controlleru ([[sdn-uvod]]).

## Proč existují směrovací protokoly?

Tři důvody:

1. **Automatizace** — manuální správa statických tras *nešká*luje. Síť s 100 routery a 50 prefixy = 5 000 záznamů, které musí být všude konzistentní.
2. **Adaptace na změny** — link selže, router padne, kabel se zlomil. Protokol *detekuje* a *přepočítá* trasy během sekund.
3. **Beze smyček** — ručně se snadno udělá `R1 → R2 → R1` smyčka. Protokoly mají algoritmy garantující *acyklicitu* (split horizon, SPF strom).

Naivní reakce na smyčku v IP síti: paket cestuje, dokud `TTL → 0` (8-bit pole v IPv4, 64–255 implicitních hopů). Smyčka jen *spálí bandwidth* — pakety nikdy nedoručené, jen krouží jako "h*** pod splavem". Nechceme.

## Co dál

Jdeme prozkoumat *to nejcennější* — **co je uvnitř směrovací tabulky**. Většina složitosti protokolů spočívá v tom, jak naplňují *právě tu jednu strukturu*.

---

*Zdroj: PDS přednáška 3 (Směrování), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: Doyle, J., Carroll, J.: *Routing TCP/IP, Vol. I* (2. vyd., Cisco Press 2005); Tanenbaum, A.S., Wetherall, D.J.: *Computer Networks* (5. vyd., Pearson 2010), kap. 5; [RFC 1812 — Requirements for IP Version 4 Routers](https://www.rfc-editor.org/rfc/rfc1812); [IANA — IPv4 Address Space Registry](https://www.iana.org/assignments/ipv4-address-space/).*
