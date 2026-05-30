---
title: Link-state — Dijkstra, OSPF, IS-IS
---

# Link-state — router zná celou topologii

Distance vector ([[distance-vector]]) je *minimalistický*: router zná jen sousedy a věří jejich drbům. **Link-state** (LS) je opačná filosofie: *každý router zná celou topologii* a *sám* spustí grafový algoritmus (typicky **Dijkstra**) pro nejkratší cesty. Důsledky: rychlejší konvergence, žádný count-to-infinity, ale větší paměť, CPU a větší update zprávy.

## Princip

Tři kroky:

1. **Discovery sousedů.** Router pošle *Hello* paket, soused odpoví. Vytvoří se **adjacency**.
2. **Flooding topology.** Router pošle *Link-State Advertisement* (LSA) — popis *všech vlastních linek* a jejich nákladů. LSA se rozsýpá *všemi cestami* — každý router v doméně dostane každou LSA. Vytvoří se **Link-State Database** (LSDB).
3. **SPF computation.** Z LSDB router *sestaví graf* sítě a spustí **Dijkstrův algoritmus** s vlastním uzlem jako kořen. Výsledek = **SPT** (Shortest Path Tree); z něj odvodí směrovací tabulku.

Klíčový rozdíl od DV: **každý router má identickou LSDB** (po konvergenci). Každý spočítá *svůj* SPT, ale data jsou *konzistentní*.

## Dijkstrův algoritmus

Pro graf $G = (V, E)$ s nezápornými váhami:

```
INIT:
  for each v in V: d[v] = infinity, parent[v] = none
  d[source] = 0
  Q = priority queue of V, keyed by d

LOOP:
  while Q not empty:
    u = extract-min(Q)
    for each neighbor v of u:
      alt = d[u] + weight(u, v)
      if alt < d[v]:
        d[v] = alt
        parent[v] = u
        decrease-key(Q, v, alt)
```

Komplexita s binární haldou: `O((|V| + |E|) · log |V|)`. Pro Fibonacciovu haldu `O(|E| + |V| log |V|)`. Pro malé sítě (stovky uzlů) bezvýznamné.

Výstup: **SPT** — strom nejkratších cest. Z něho pro každou destinaci `D` se odvodí:

- **distance** = `d[D]`.
- **next-hop** = první router na cestě od source k D (odvozeno z `parent[]`).

::: viz dijkstra "Krok-po-kroku: relaxace hran (oranžově), settling table dole. Klikni na uzel pro změnu zdroje."
:::

## Hello protokol a adjacency

Router pravidelně posílá *Hello* (typicky každých 10 s na ethernetu, 30 s na point-to-point). Hello nese:

- **Router ID** — unikátní identifikátor (často highest loopback IP).
- **Area ID** — segment domény.
- **Authentication** — heslo / MD5 / SHA.
- **Hello/Dead intervals** — timery musí *souhlasit* mezi sousedy.
- **Neighbor list** — seznam routerů, od kterých jsem nedávno dostal Hello.

Když oba routeři vidí *sebe v Neighbor listu* protisousedního Hello = **two-way adjacency**.

Dead timer (typicky 4× Hello) — když Hello přestane chodit, soused je *down* a všechny trasy přes něj se odstraní.

## LSA flooding

Když link změní stav (up/down) nebo bandwidth, router *okamžitě* pošle aktualizovanou LSA. Mechanismus:

1. Originating router pošle LSA všem sousedům.
2. Soused přijme, *uloží* do LSDB (pokud nová verze) a *pošle dál* všem ostatním sousedům.
3. Když dorazí *stará* nebo *duplicitní* LSA, ignoruje se.

Detekce duplikátů: LSA má **sequence number** a **age**. Vyšší sequence = novější. Když age dosáhne MaxAge (1 hodina v OSPF), LSA se vypustí z LSDB.

**Flooding** je rychlý — typicky <1 s na celé doméně. Důsledek: konvergence v sekundách (oproti DV minutám).

## OSPF — Open Shortest Path First

[RFC 2328 (OSPFv2)](https://www.rfc-editor.org/rfc/rfc2328), [RFC 5340 (OSPFv3 pro IPv6)](https://www.rfc-editor.org/rfc/rfc5340). De-facto standard pro enterprise a service-provider IGP.

### Charakteristiky

| Vlastnost | Hodnota |
| :--- | :--- |
| Metric | **cost** — typicky $10^8 / \text{bandwidth}$ (bandwidth v bps) |
| Hello interval | 10 s (multi-access), 30 s (NBMA) |
| Dead interval | 4× Hello |
| Transport | IP protokol 89 (vlastní) |
| Multicast | `224.0.0.5` (AllSPFRouters), `224.0.0.6` (AllDRouters) |
| AD (Cisco) | 110 |
| Authentication | plain, MD5, SHA (v3 pro IPv6) |

### Areas — hierarchická OSPF

Velká OSPF doména trpí — full LSDB obsahuje *všechny* linky, SPF *opakovaně* běží na všech routerech. Pro síť s 1000 linkami = velká paměť, CPU spike při změnách.

**Řešení: hierarchie areas.** Doména se dělí na *areas* — uvnitř areа full LSA flooding, mezi areas jen *aggregate* informace.

::: svg "OSPF area struktura — backbone + non-backbone"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <ellipse cx="270" cy="100" rx="100" ry="35"/>
    <ellipse cx="80" cy="60" rx="55" ry="25"/>
    <ellipse cx="80" cy="140" rx="55" ry="25"/>
    <ellipse cx="460" cy="60" rx="55" ry="25"/>
    <ellipse cx="460" cy="140" rx="55" ry="25"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="95" font-weight="600">Area 0</text>
    <text x="270" y="112" font-size="10">(backbone)</text>
    <text x="80" y="65">Area 1</text>
    <text x="80" y="145">Area 2</text>
    <text x="460" y="65">Area 3</text>
    <text x="460" y="145">Area 4</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5">
    <line x1="135" y1="60" x2="180" y2="85"/>
    <line x1="135" y1="140" x2="180" y2="115"/>
    <line x1="360" y1="85" x2="405" y2="60"/>
    <line x1="360" y1="115" x2="405" y2="140"/>
  </g>
  <text x="270" y="180" fill="var(--text-muted)" font-size="10" text-anchor="middle">ABRs (Area Border Routers) propojují non-backbone areas přes Area 0</text>
</svg>
:::

Pravidla:

- Doména má *jednu* **Area 0** (backbone).
- Všechny ostatní areas se *musí* připojit k Area 0 přes **ABR** (Area Border Router).
- **Internal router** — celý uvnitř jedné area, vidí jen vlastní LSDB.
- **ABR** — mostuje dvě areas. Vidí LSDB obou. Inzeruje *aggregate* (summary LSA) protějšku.
- **ASBR** (Autonomous System Boundary Router) — redistribuuje externí trasy (BGP, statické) do OSPF.

Důsledek: routery v Area 1 *neví* o detailech Area 2. Šetří paměť i konvergenční čas.

### LSA typy

| Typ | Jméno | Inzeruje |
| :---: | :--- | :--- |
| 1 | Router LSA | linky routera v area |
| 2 | Network LSA | DR informace o multi-access síti |
| 3 | Summary LSA | aggregát z jiné area (od ABR) |
| 4 | ASBR Summary | umístění ASBR (od ABR) |
| 5 | External LSA | externí trasy (od ASBR) |
| 7 | NSSA External | externí v NSSA area |
| 9–11 | Opaque | rozšíření (Traffic Engineering) |

### Designated Router (DR) — optimalizace pro multiaccess

Na Ethernet segmentu s 5 routery by každý posílal LSA všem 4 sousedům — *kvadratická* overhead. **Řešení:** *zvolit* jednoho DR a jeden BDR (backup); ostatní mluví *jen* s DR. Synchronizace přes DR → lineární počet adjacencies.

DR election: nejvyšší **OSPF priority**, tie-break Router ID. Stabilní (DR se *nepřebírá* dokud nezemře).

## IS-IS — Intermediate System to Intermediate System

[ISO 10589](https://www.iso.org/standard/30932.html), původně OSI protokol z roku 1989. *Adaptován* pro IP přes [RFC 1195](https://www.rfc-editor.org/rfc/rfc1195) — IS-IS umí *natively oba* IP a OSI.

| | OSPF | IS-IS |
| :--- | :---: | :---: |
| Standardizace | IETF | ISO |
| Transport | IP protokol 89 | přímo *nad L2* (žádný IP) |
| Adresování | IPv4/v6 | NSAP (CLNS) addressing pro routery |
| Area model | hierarchie (Area 0 + others) | dvě úrovně (L1 area, L2 backbone) |
| Metric | cost (16-bit nebo 24-bit wide) | 6-bit (default) nebo 32-bit wide |
| TLV | LSA (různé typy) | univerzální TLV (extensible) |
| Flexibilita | moderately rigidní | velmi flexibilní (CLNS dědictví) |

V praxi:

- **Enterprise** → OSPF (jednodušší konfigurace, IP-native).
- **Service Provider / Tier-1 ISP** → **IS-IS** (lépe škáluje, větší areas, TLV se snáz rozšiřují pro nové vlastnosti).

Příklady IS-IS deploymentů: AT&T, Verizon, NTT, Comcast — všichni klíčoví ISP. Důvod: stabilní, vyzkoušené, lépe pracuje s tisíci routery v jedné L2 area.

Modernější IS-IS rozšíření:

- **MT-ISIS** (Multi-Topology) — různé topologie pro IPv4/IPv6/multicast.
- **SR (Segment Routing)** — TLV pro Segment Routing labels (klíčový enabler MPLS-SR).

## SPF computation timing

Naivní implementace: každá LSA → okamžitě spustit SPF. Při flapu linky 5× za minutu = 5 SPF runs.

**SPF dampening**:

- *Wait* po LSA změně (typicky 10 ms).
- Sbírej další LSAs.
- Po quiet period spusť SPF.

Cisco: `spf-delay`, `spf-hold-time`. Default ~5 s, lze snížit pro rychlejší konvergenci.

## Charakteristiky LS protokolů

| Aspekt | LS |
| :--- | :--- |
| Znalost topologie | celá (LSDB) |
| Algoritmus | Dijkstra |
| Konvergence | sekundy |
| Paměť | velká (LSDB ~ velikost sítě) |
| CPU | spike při SPF |
| Škálování | tisíce routerů (s areas) |
| Robustnost | vysoká (žádný count-to-infinity) |
| Bandwidth | jen při změnách (incremental) |

LS je *vhodný* pro:

- Velké enterprise (kampus, datacenter).
- Service Provider IGP (backbone).
- Sítě, kde rychlá konvergence kritická.

## Co dál

OSPF a IS-IS jsou *interior gateway protocols* (IGP) — uvnitř jednoho administrativního systému. Pro routing **mezi systémy** (mezi ISP, mezi enterprise a internetem) potřebujeme **EGP** — a tam je *jediný* zástupce: **BGP** ([[bgp-zaklady]]). Path-vector protokol, *politicky řízený*, páteř internetu.

---

*Zdroj: PDS přednáška 3 (Směrování), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: Dijkstra, E.W.: „A Note on Two Problems in Connexion with Graphs" (Numerische Mathematik 1, 1959, [DOI 10.1007/BF01386390](https://doi.org/10.1007/BF01386390)); [RFC 2328 — OSPFv2](https://www.rfc-editor.org/rfc/rfc2328); [RFC 5340 — OSPFv3](https://www.rfc-editor.org/rfc/rfc5340); [RFC 1195 — IS-IS for IP and OSI](https://www.rfc-editor.org/rfc/rfc1195); Moy, J.: *OSPF: Anatomy of an Internet Routing Protocol* (Addison-Wesley 1998); Doyle, J., Carroll, J.: *Routing TCP/IP, Vol. I* (Cisco Press 2005), kap. 8–10.*
