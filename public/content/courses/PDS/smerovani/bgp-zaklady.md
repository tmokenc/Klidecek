---
title: BGP — path vector mezi AS
---

# BGP — protokol, který drží internet pohromadě

OSPF a IS-IS ([[link-state]]) řeší routing *uvnitř* jednoho administrativního systému. Když paket cestuje *mezi* ISP — z VUT do Stanfordu — žádný OSPF nestačí, protože VUT a Stanford nemají sdílený router ani sdíleného administrátora. Tady přichází **BGP** (*Border Gateway Protocol*), **jediný** EGP používaný v dnešním internetu. Bez BGP by nebyl internet — všech ~80 000 *Autonomous Systems* by neumělo komunikovat.

## AS — Autonomous System

**Autonomous System (AS)** = množina IP prefixů a routerů pod *jednou* administrativní kontrolou, s *jednotnou* routing policy navenek.

Příklady:

- **AS 2852** — CESNET (CZ academic).
- **AS 5588** — GTS Czech Republic.
- **AS 15169** — Google.
- **AS 32934** — Facebook.
- **AS 16509** — Amazon AWS.

AS dostane *číslo* od RIR. Původně 16-bit (max 65 536). Od 2007 32-bit (4 mld.) — RFC 4893 / 5396. Současný rozsah:

- `0–65535` — legacy 16-bit (většina nasazení).
- `65536–4294967295` — 32-bit, "asplain" notation (`AS 200000`) nebo "asdot" (`AS 3.5`).

V 2026 je v BGP routovacím systému zhruba **80 000** unikátních AS. Cesnet, Vodafone CZ, O2 CZ, GTS, AT&T, Verizon, Google… každý má své číslo.

## IGP vs EGP

| | IGP | EGP |
| :--- | :--- | :--- |
| Doména | uvnitř AS | mezi AS |
| Cíl | nejkratší cesta | *policy-driven* trasy |
| Konvergence | rychlá (sekundy) | pomalá (minuty), ale *stabilní* |
| Škála | tisíce routerů | desetitisíce AS |
| Příklady | OSPF, IS-IS, EIGRP, RIP | **BGP** |

BGP **není o nejkratší cestě**. Je o tom, *kdo s kým chce mluvit a za jakých podmínek*. Když Vodafone musí ze zákona odbíhat traffic v Česku, BGP politiku to vynutí — paket nepoužije *krátkou* cestu přes Slovensko, ale *politicky správnou* přes Brno.

## Path vector

BGP je **path vector protokol**. Místo distance (RIP) nebo cost (OSPF), nese **AS_PATH** — seznam AS, kterými trasa prochází.

Příklad: prefix `147.229.0.0/17` (VUT FIT). BGP record má:

```
Prefix:    147.229.0.0/17
AS_PATH:   ... → 12350 (GTS) → 2852 (CESNET) → 197451 (VUT FIT)
NEXT_HOP:  158.196.224.1
```

**Hodnota path vector přístupu**:

1. **Loop prevention** — když AS_PATH obsahuje moje vlastní AS, *ignoruj* (jinak by se trasa točila zpět).
2. **Policy** — z AS_PATH router pozná, *přes koho* trasa jde, a může rozhodovat ("blokuj všechno přes AS X").
3. **Aggregation** — víc destinací sdílí stejný AS_PATH → mohou se inzerovat jedním prefixem.

## eBGP vs iBGP

BGP má *dvě* nasazovací role:

### eBGP (external BGP) — mezi AS

- Sousedi v *různých* AS.
- TTL = 1 (přímý sosed; přes víc hopů potřebuje `ebgp-multihop`).
- AS_PATH se prependuje *přidávám své AS* před odeslání.

### iBGP (internal BGP) — uvnitř AS

- Sousedi v *stejném* AS — typicky všechny border routery AS.
- AS_PATH se **NEprependuje** (uvnitř AS to dává smysl).
- *Full mesh* nutný — `N · (N−1)/2` sessions pro N iBGP routerů → škáluje špatně.
- Alternativy: **Route Reflectors**, **Confederations**.

::: svg "eBGP a iBGP v jedné AS"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1.5" fill="var(--bg-card)">
    <ellipse cx="270" cy="100" rx="160" ry="60"/>
    <circle cx="170" cy="80" r="20"/>
    <circle cx="370" cy="80" r="20"/>
    <circle cx="170" cy="130" r="20"/>
    <circle cx="370" cy="130" r="20"/>
    <circle cx="70" cy="100" r="20"/>
    <circle cx="470" cy="100" r="20"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="170" y="84">R1</text>
    <text x="370" y="84">R2</text>
    <text x="170" y="134">R3</text>
    <text x="370" y="134">R4</text>
    <text x="70" y="104">X</text>
    <text x="470" y="104">Y</text>
    <text x="270" y="30" font-weight="600">AS 65001</text>
    <text x="70" y="135" font-size="9" fill="var(--text-muted)">AS 100</text>
    <text x="470" y="135" font-size="9" fill="var(--text-muted)">AS 200</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <line x1="92" y1="92" x2="150" y2="86"/>
    <line x1="390" y1="86" x2="448" y2="92"/>
  </g>
  <g stroke="var(--text-faint)" stroke-width="1" stroke-dasharray="3 3" fill="none">
    <line x1="190" y1="80" x2="350" y2="80"/>
    <line x1="190" y1="130" x2="350" y2="130"/>
    <line x1="170" y1="100" x2="170" y2="110"/>
    <line x1="370" y1="100" x2="370" y2="110"/>
    <line x1="190" y1="90" x2="350" y2="120"/>
    <line x1="350" y1="90" x2="190" y2="120"/>
  </g>
  <text x="90" y="60" fill="var(--accent)" font-size="10">eBGP</text>
  <text x="450" y="60" fill="var(--accent)" font-size="10">eBGP</text>
  <text x="265" y="65" fill="var(--text-faint)" font-size="10">iBGP full mesh</text>
</svg>
:::

## Atributy BGP rout

Každá BGP cesta nese *seznam atributů*. Klíčové:

| Atribut | Význam | Kategorie |
| :--- | :--- | :--- |
| **AS_PATH** | seznam AS na cestě | well-known mandatory |
| **NEXT_HOP** | IP "kam to teď doručit" | well-known mandatory |
| **ORIGIN** | jak prefix vznikl (IGP / EGP / incomplete) | well-known mandatory |
| **LOCAL_PREF** | preference uvnitř AS (jen iBGP) | well-known discretionary |
| **MED** | hint *sousednímu* AS, kterou cestou ke mně | optional non-transitive |
| **COMMUNITY** | tag/label pro policy | optional transitive |
| **ATOMIC_AGGREGATE** | příznak agregované trasy | well-known discretionary |
| **AGGREGATOR** | kdo agregoval | optional transitive |

### Best path selection — pořadí kritérií

Když BGP má víc cest do stejného prefixu, vybírá podle *seřazeného seznamu* kritérií (Cisco):

1. **Weight** (Cisco-only, lokální) — *vyšší* lepší.
2. **LOCAL_PREF** — *vyšší* lepší (administrátor preferuje).
3. **Origin-locally** — preferuj cesty vznikající *uvnitř* AS.
4. **AS_PATH length** — *kratší* lepší.
5. **ORIGIN** — IGP > EGP > Incomplete.
6. **MED** — *nižší* lepší (jen pro stejnou sousední AS).
7. **eBGP > iBGP**.
8. **IGP cost** k NEXT_HOP — *nižší* lepší.
9. **Oldest path** (tie-break, stabilita).
10. **Lowest Router ID** (final tie-break).

V kontrastu s OSPF (kde *jediné* kritérium je cost), BGP má **deset kritérií**. Proto je *politicky řiditelný*.

## Mechanika spojení

BGP používá **TCP** port 179 — *spolehlivý*, žádné vlastní retransmise (oproti OSPF).

### Stavový diagram

```
Idle → Connect → OpenSent → OpenConfirm → Established
                                              ↓ (keepalive each 60s)
```

Po **Established** state si peers vymění *full RIB* (Update message), pak jen *inkrementální* aktualizace.

### Update message

| Pole | Význam |
| :--- | :--- |
| **Withdrawn Routes** | prefixy, které *nejsou* nadále reachable |
| **Path Attributes** | atributy (AS_PATH, atd.) |
| **NLRI** (Network Layer Reachability) | prefixy s těmito atributy |

Jeden Update může nést *desítky* prefixů sdílejících stejné atributy → bandwidth-efektivní.

## Konvergence BGP

BGP je **stabilizační, ne nejkratší**:

- Po pádu linky se update *šíří hop-by-hop* — každý router zpracuje, případně přepočítá, pošle dál.
- Plné nasazení změny na celém internetu: **minuty**, někdy desítky minut.
- Internet má v každém okamžiku tisíce *nestandardních* tras (route leaks, hijacks, mis-configurations).

**Path hunting** — analog count-to-infinity:

- Když prefix zmizí, router zkouší *všechny* alternativní cesty z jeho RIB.
- Pokud bylo více cest a všechny mizí, projde *seznam* než dojde k "really unreachable".

Důsledek: krátkodobé *spikes* nestability po výpadku páteřního linku.

## Default-free zone (DFZ)

ISP backbone routery nemají *žádný* default route — musí mít *plnou tabulku internetu*. V 2026 to znamená:

- **~1 000 000** IPv4 prefixů.
- **~200 000** IPv6 prefixů.
- Celková velikost RIB: ~10 GB RAM.

To je důvod, proč ISP routery mají specifické vysoce výkonné CPU + GB RAM jen pro BGP daemon. Routing tabulka roste *exponenciálně* — v 2014 půl milionu, v 2026 přes milion.

## Bezpečnostní rozměr

BGP nemá *vestavěnou autentizaci*. Klasické útoky:

- **Route hijacking** — AS X *neoprávněně inzeruje* prefix patřící AS Y. Traffic letí do X. Příklad: Pakistan blokovalo YouTube 2008 → ohlásilo prefix 208.65.153.0/24 → svět to slyšel → YouTube unreachable globálně 2 h.
- **Route leak** — customer omylem propaguje cesty mezi peers (zákazník se chová jako tranzit).
- **AS spoofing** — fake AS_PATH.

Obrany:

- **RPKI** (Resource Public Key Infrastructure, [RFC 6480](https://www.rfc-editor.org/rfc/rfc6480)) — kryptograficky podepsané "AS X opravdu drží prefix P".
- **BGPsec** ([RFC 8205](https://www.rfc-editor.org/rfc/rfc8205)) — podepsané AS_PATH (zatím malá adopce).
- **MANRS** — Mutually Agreed Norms for Routing Security (best practices).

V 2026 je RPKI v ~50 % prefixů; BGPsec stále marginální. Bezpečnost BGP je *aktivní problém*.

## Co dál

BGP základ je jasný. Skutečná hloubka — **policy** a **traffic engineering** — je tématem [[bgp-policy-te]]. Naučíme se *route maps, communities, MED, LOCAL_PREF* a uvidíme, jak ISP řídí, *kudy* paket teče.

---

*Zdroj: PDS přednáška 3 (Směrování), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 4271 — BGP-4 (current spec)](https://www.rfc-editor.org/rfc/rfc4271); [RFC 4893 — BGP Support for 4-Octet AS](https://www.rfc-editor.org/rfc/rfc4893); [RFC 6480 — Infrastructure for RPKI](https://www.rfc-editor.org/rfc/rfc6480); Stewart, J.W.: *BGP4: Inter-Domain Routing in the Internet* (Addison-Wesley 1998); [BGPmon — Real-time BGP monitoring](https://bgpmon.io/); [CIDR Report — DFZ statistics](https://www.cidr-report.org/).*
