---
title: Konvergence a obrana proti smyčkám
---

# Konvergence a smyčky — souhrn

Předchozí sekce ([[distance-vector]], [[link-state]], [[bgp-zaklady]], [[mpls]]) popsaly *protokoly*. Tato uzavírací sekce shrne **co je společné** — mechanismy konvergence a obrany proti routing smyčkám napříč protokoly. Smyčky jsou *fundamentální patologie* v paketových sítích, jejich obrana je hlavní úkol routing protokolu.

## Co je konvergence

> **Konvergence** = doba, za kterou se *všechny* routery v doméně dohodnou na konzistentní směrovací tabulce po topology změně.

Konvergenční metriky:

- **Time-to-detect** — kolik sekund od pádu linku do detekce (hello loss, BFD).
- **Time-to-flood** — jak dlouho se LSA / update rozšíří doménou.
- **Time-to-compute** — jak dlouho trvá nový SPF / Bellman-Ford.
- **Time-to-install** — jak dlouho trvá update FIB v hardware.

Typické hodnoty:

| Protokol | Detekce | Šíření | Výpočet | Celkem |
| :--- | :---: | :---: | :---: | :---: |
| RIP | 180 s (dead) | 30 s update | <1 s | **~3 min** |
| OSPF | 4× hello (40 s) | <1 s | 5 s | **~50 s** |
| OSPF s BFD | 50 ms | <1 s | 5 s | **~6 s** |
| OSPF s LFA | jako výše | — | — | **<50 ms** (na backup) |
| EIGRP | 15 s | <1 s | <1 s s FS | **~15 s** |
| BGP | 90 s (hold) | hop-by-hop | seconds | **minuty** |

Pro datacenter/cloud workloads (Spark, Kubernetes service mesh) je 50 s nepřípustné — proto se nasazuje **BFD** + **LFA**, případně přechod na **Segment Routing TI-LFA** s konvergencí <50 ms.

## BFD — rychlá detekce

[RFC 5880](https://www.rfc-editor.org/rfc/rfc5880). **Bidirectional Forwarding Detection** — protokol-agnostický link liveness test.

- Pošli BFD hello *každých 50 ms* (vs OSPF hello 10 s).
- Po 3 missed hello (= 150 ms) → link je *down*.
- Notifikuj routing protokol → okamžitý reroute.

BFD sedí *nad* protokoly — OSPF, IS-IS, BGP, EIGRP ho mohou volat. Hardware support (NPU offload) drží overhead nízký.

## Loop-Free Alternate (LFA)

[RFC 5286](https://www.rfc-editor.org/rfc/rfc5286). Předpočítání **backup next-hop** v OSPF/IS-IS, který *nemůže* udělat smyčku.

Pro destinaci `D` přes primary `P`, hledáme **backup B** takový, že:

$$
\text{cost}(B, D) < \text{cost}(B, P) + \text{cost}(P, D)
$$

= B nesměruje paket zpět do P. Když primary umírá, LFA forwarduje na B *bez čekání na SPF*.

Limit: ne každá topologie má LFA pro každou destinaci. **TI-LFA** (Topology-Independent LFA) rozšíření používá Segment Routing — pošle paket s explicit waypoint segment, který *jistě* vyhne primary cestě. Pokrytí ~100 %.

## Smyčky — taxonomie a obrana

### 1. Transient loops během konvergence

*Krátkodobá* smyčka 1–5 s během toho, než se konvergence dokončí. Routery mají různě *staré* tabulky.

Obrana:

- **Ordered FIB update** (PE Cisco — preference) — update routers v *pořadí*, aby downstream byl ready před upstream.
- **TTL** — paket s TTL=0 se zahodí. Limit smyčky: 64–255 hopů, typicky milisekundy.

### 2. Permanent loops (chyba)

*Trvalá* smyčka kvůli nesprávné konfiguraci. Příklad: misconfig static route `R1 → R2 → R1`. Klasický symptom: `traceroute` ukazuje "R1, R2, R1, R2, …" dokud TTL nevyprší.

Obrana **prevencí** — kontrolovat konfigurace, testovat. Není automatický mechanismus.

### 3. Count-to-infinity (DV-specific)

Popsáno v [[distance-vector]]. Obrana:

- **Max metric** (`∞ = 16` v RIP).
- **Split horizon** + **Poison Reverse**.
- **Hold-down timer**.

### 4. Microloops během IGP konvergence

Při OSPF/IS-IS konvergenci po pádu linku se *na chvíli* různé routery rozhodují odlišně:

- R1 už ví o pádu → forwarduje alternativně.
- R2 ještě neví → forwarduje původním směrem (přes R1).
- Paket: R2 → R1 → R2 → …

Trvá nanosekundy až sekundy.

Obrana:

- **Make-before-break** (provedení backup path před stržením primary).
- **OFIB** — ordered FIB update.
- **TI-LFA** — backup path *pre-computed*, instalována *před* primary stržením.

## Split horizon — formálně

> **Pravidlo split horizon**: Nepošli zpět souseda *X* trasu, kterou jsi se *od X* naučil.

Důvod: pokud trasa zpět matriálně letí do *X*, dává to *X* falešný dojem alternativní cesty → potenciálně smyčka.

V topologii:

```
A ─── B ─── C
```

`B` se naučí cestu do `C` od `C`. Split horizon: *neoznámí* tuto cestu zpět `C`. `C` nemá iluzi, že `B` má alternativní cestu k němu.

**Poison reverse** je *agresivnější* variant: pošli zpět, ale s `metric = ∞`. Explicitní zpráva: *"tudy se ke mně nedostaneš"*. Užitečné, když se mění topologie a chcete *rychle* signalizovat ztrátu.

## Hold-down — pojistka

> **Hold-down**: když trasa zmizí (metric → ∞), *neakceptuj* nové trasy pro tento prefix po dobu *hold-down timeru*.

Účel: během konvergence v síti kolují *staré* (nebo "rumour") informace; hold-down je *vyřadí* z hry.

Cena: pomalá obnova legitimního traffic. Pokud link flapne (down/up rychle), hold-down zdrží recovery o 60–180 s.

V RIP je hold-down 180 s. EIGRP a OSPF používají rychlejší mechanismy (Feasibility Condition, SPF) a hold-down nepotřebují.

## Damping (BGP-specifický)

[RFC 2439](https://www.rfc-editor.org/rfc/rfc2439). **Route flap damping** pro BGP. Když prefix flapne (announce/withdraw) opakovaně, BGP daemon to *penalizuje*:

- Každý flap = +1 penalty.
- Penalty *decay* exponenciálně (half-life ~15 min).
- Při penalty > 2000 → *damped* (ignorován ~30 min).

Účel: chránit core proti flapping links downstream. *Side effect*: zdrží recovery legitimního flapu.

V 2020s je damping **considered harmful** — RIPE 580 doporučuje *vypnout*. Modern best practice: monitorovat flapy, *fix root cause*, nepenalizovat.

## ECMP — Equal Cost Multi-Path

Když existuje *víc* tras se stejnou cenou, **load-balance** mezi nimi.

::: svg "ECMP — flow-based load balancing"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1.5">
    <circle cx="80" cy="90" r="22"/>
    <circle cx="250" cy="40" r="22"/>
    <circle cx="250" cy="90" r="22"/>
    <circle cx="250" cy="140" r="22"/>
    <circle cx="430" cy="90" r="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="80" y="95">A</text>
    <text x="250" y="45">P1</text>
    <text x="250" y="95">P2</text>
    <text x="250" y="145">P3</text>
    <text x="430" y="95">B</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5">
    <line x1="100" y1="85" x2="230" y2="48"/>
    <line x1="102" y1="90" x2="228" y2="90"/>
    <line x1="100" y1="95" x2="230" y2="132"/>
    <line x1="272" y1="48" x2="410" y2="85"/>
    <line x1="272" y1="90" x2="408" y2="90"/>
    <line x1="272" y1="132" x2="410" y2="95"/>
  </g>
  <text x="250" y="175" fill="var(--text-muted)" font-size="10" text-anchor="middle">Hash(src-IP, dst-IP, src-port, dst-port) % 3 → path 1/2/3</text>
</svg>
:::

Hash function (typicky `src-IP, dst-IP, L4 ports`) % N → path. Klíčové: *jedna flow* (stejný 5-tuple) jde *vždy stejnou* cestou — TCP nesnese reordering.

V datacenters jsou **Clos topologie** (Spine-Leaf) s 16–64 ECMP cestami — agregace bandwidth desítek terabitů.

## Konvergence v BGP

BGP je *odlišné* od IGP — *politicky* řízené, *spolehlivé* (TCP transport), ale *pomalé*:

| Problém | Řešení |
| :--- | :--- |
| Hold timer 180 s | snížit na 30 s (rizikové!) |
| Path hunting | implementační optimalizace |
| MRAI (Min Route Advertisement Interval) 30 s | snížit na 0 (pro IXP), 5 s (provider) |

**BGP Add-Paths** ([RFC 7911](https://www.rfc-editor.org/rfc/rfc7911)) — peer inzeruje *víc* cest do stejného prefixu (ne jen best). Router má *pre-computed backup*; při primary failure okamžitý reroute, žádný BGP wait.

## Stav v 2026

- **OSPF/IS-IS + BFD + LFA** standard pro enterprise/SP backbone.
- **Segment Routing TI-LFA** — moderní deployments (Telia, Comcast).
- **BGP Add-Paths + PIC** (Prefix-Independent Convergence) — sub-second BGP konvergence.
- **DC fabrics** používají **BGP-in-DC** (RFC 7938) s aggressive timers — konvergence v jednotkách sekund.

## Shrnutí celé kapitoly

Prošli jsme:

1. **Koncepty** ([[smerovani-uvod]]) — routing vs forwarding, jméno vs adresa, hierarchie.
2. **Tabulky** ([[smerovaci-tabulky]]) — RIB, FIB, AD, metric, LPM.
3. **Distance vector** ([[distance-vector]]) — Bellman-Ford, count-to-infinity.
4. **DV protokoly** ([[dv-protokoly]]) — RIP, EIGRP, Babel.
5. **Link-state** ([[link-state]]) — Dijkstra, OSPF, IS-IS.
6. **BGP** ([[bgp-zaklady]]) — path vector, AS, atributy.
7. **BGP policy** ([[bgp-policy-te]]) — communities, traffic engineering.
8. **MPLS** ([[mpls]]) — label switching, LSP.
9. **Konvergence** (tato) — BFD, LFA, smyčky.

Hlavní *vzory*:

- **Rozhodovací tabulka** je univerzální — switch, router, OS, proxy.
- **Loop avoidance** vyžaduje *protokolovou* logiku (acyclicity = matematická vlastnost grafu).
- **Konvergence** je *čas*, ne *cíl*; rychlejší konvergence = kompromis (komplexita, paměť, riziko microloops).
- **Politika trumfne shortest-path** v EGP (BGP).

Příští přednáška ([[prepinac-uvod]]) zoomuje *do routeru* — jak je vnitřně postaven, jak rychle umí switching, a co je *fyzická omezení* hardware směrování.

---

*Zdroj: PDS přednáška 3 (Směrování), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 5880 — BFD](https://www.rfc-editor.org/rfc/rfc5880); [RFC 5286 — LFA](https://www.rfc-editor.org/rfc/rfc5286); [RFC 7916 — Operational Management of LFA](https://www.rfc-editor.org/rfc/rfc7916); [RFC 7911 — BGP Add-Paths](https://www.rfc-editor.org/rfc/rfc7911); [RIPE-580 — BGP Damping Best Practice](https://www.ripe.net/publications/docs/ripe-580); Filsfils, C. et al.: „Topology Independent Fast Reroute Using Segment Routing" (RFC 9855, 2025); Pickett, J., Bates, T.: *Cisco BGP-4 Command and Configuration Handbook* (Cisco Press 2002).*
