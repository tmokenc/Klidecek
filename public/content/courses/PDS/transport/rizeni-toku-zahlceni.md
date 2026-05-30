# Řízení toku a zahlcení

ARQ ([[arq-okno]]) zaručuje *spolehlivost*, ale nezohledňuje **rychlost**. Pokud odesílatel vysílá příliš rychle, dopadne to dvěma způsoby: buď *zahltí příjemce* (jeho buffer přeteče), nebo *zahltí síť* (router shazuje pakety). Tato sekce probere obě formy regulace — **flow control** (mezi end-pointy) a **congestion control** (v síti).

## Dichotomie flow vs congestion

| Aspekt | Flow control | Congestion control |
| :--- | :--- | :--- |
| Co řeší | malou kapacitu *příjemce* | malou kapacitu *sítě* |
| Kdo monitoruje | end-points | router + end-points |
| Reakce | příjemce signalizuje rychlost | router signalizuje (drop / ECN) |
| V TCP | `rwnd` (receive window) | `cwnd` (congestion window) |

Skutečné okno použité při vysílání: $w = \min(rwnd, cwnd)$. Vždy menší z obou.

Analogie:

- *Flow control* = kohoutek, který tlumí, aby se *malé umyvadlo příjemce* nepřelilo.
- *Congestion control* = kohoutek, který tlumí, aby *vodovodní soustava sítě* nepraskla.

## Problémy zahlcení

### Congestion collapse

Když všichni vysílají naplno bez ohledu na síť, *throughput se zhroutí*:

- *Goodput* (užitečný throughput) klesá s rostoucí nabídkou (*offered load*).
- *Delay* exponenciálně roste.

Historicky se to stalo v ARPANETu v *říjnu 1986* (~1000× pokles throughput v Berkeley, z 32 kbps na 40 bps), což přimělo Van Jacobsona navrhnout dnešní congestion control algoritmy (RFC 5681, *TCP Congestion Control*).

### Cíle congestion control

1. **Efektivita** — síť by měla být *využita*, ale ne *zahlcena*.
2. **Spravedlivá alokace** — všechny souběžné flow by měly dostat *přiměřený podíl*. Max-min fairness.
3. **Konvergence** — když se přidá / odebere flow, ostatní flow se rychle *přizpůsobí*.

## Co se dá udělat?

Dva pohledy:

- **Zvýšit kapacitu** sítě (dlouhodobé řešení).
- **Snížit provoz** (krátkodobé / reaktivní řešení).

V praxi: kapacita roste, ale provoz roste rychleji (HD video, IoT, 5G). Congestion control je trvalá nutnost.

## End-to-end vs network-assisted

### End-to-end congestion control

- *Bez explicitní zpětné vazby* ze sítě.
- Detekce zahlcení z **pozorování ztráty paketů** a *delay variation*.
- **Toto je přístup klasického TCP** (TCP Reno, Cubic, BBR).

### Network-assisted congestion control

- Router *aktivně signalizuje* zahlcení end-systémům.
- Mechanismy:
  - **Choke packets** (SNA, ATM, DECbit) — router pošle zpět zprávu "zpomal".
  - **ICMP Source Quench** (deprecated v RFC 6633).
  - **TCP/IP ECN** (*Explicit Congestion Notification*, RFC 3168) — bit v IP/TCP hlavičce. Router označí pakety místo zahodit; receiver to oznámí odesílateli v ACK.
  - **Explicit send rate** — ATM ABR, XCP — router přímo říká *kolik vysílat*.

ECN je *moderní* mechanism, který nahrazuje drop-based detection. Vyžaduje *aktivní podporu* od routerů + TCP stacku — zapnuto např. v Linuxu (`net.ipv4.tcp_ecn = 1`).

## Repair vs avoid

Druhá dichotomie congestion control:

### Repair — reaktivní

- Spustí se *když je zahlcení detekováno*.
- **Explicitní feedback** (router posílá choke z místa zahlcení).
- **Implicitní feedback** (zdroj odhadne zahlcení podle ztrát).
- Metody: drop packets, choke packets, hop-by-hop choke, fair queuing.

### Avoid — preventivní

- Spustí se *před* zahlcením.
- Countermeasures iniciuje *odesílatel nebo příjemce*.
- Metody: **leaky bucket**, **token bucket**, isarithmic congestion control, *reservation*.

## Repair: Packet dropping

**Princip:** každý intermediate system testuje *frontu* a *shazuje příchozí pakety*, pokud frontu nelze bufferovat.

### Tail drop

Klasická strategie: pokud je fronta plná, *zahoď příchozí*. Nevýhody:

- *TCP global synchronization* — všechny flow přijdou o paket současně, všechny zpomalí současně, pak se všechny zase zrychlí — síť kmitá.
- *Bursty traffic* je systematicky penalizován.

### RED (Random Early Detection)

Lepší strategie: *začni zahazovat dřív*, než se fronta plně zaplní. Pravděpodobnost zahození roste lineárně s velikostí fronty mezi *min* a *max*.

### WRED (Weighted RED)

RED s *různými drop profily* pro různé třídy provozu (DSCP) — AF13, AF12, AF11. Důležitý provoz je penalizován méně.

Modernější varianty: **CoDel** (Controlled Delay, RFC 8290), **PIE** (Proportional Integral controller Enhanced) — *měří delay*, ne queue length.

## Repair: Choke packet

**Princip:** v případě zahlcení router pošle *zpět zprávu* "zpomal".

Varianty:

- **Plain Choke packets** — *jediný choke* odesílá se odesílateli. Odesílatel zpomalí.
- **Hop-by-hop Choke packets** — *každý router* na cestě postupně přijme choke a zpomalí. Reakce je *rychlejší* (nemusí čekat až na zdroj).

## Avoid: Leaky Bucket

**Princip:** vstupní provoz se "tlumí" přes *kbelík s děrou*. Bez ohledu na vstup, výstupní rate je *konstantní*.

```
[burst input] →  [bucket with hole]  → [smooth output at rate r]
```

Účinky:

- Burst provoz se *vyhlazuje*.
- Pokud je bucket plný, příchozí pakety se *zahodí*.

Použití: *traffic shaping* v ISP, *rate limiting* v API gateways.

## Avoid: Token Bucket

**Princip:** bucket *plní se tokeny* konstantní rychlostí. Paket lze odeslat *jen* pokud je dostatek tokenů.

```
[token generator at rate r]  →  [bucket of size b]
                                       ↓
[input packet] → potřebuje 1 token → [output]
```

Výhody oproti Leaky Bucket:

- *Umožňuje burst* — pokud máme tokeny v zásobě, můžeme vyslat víc najednou.
- Lépe modeluje *reálné aplikace* (web traffic je burst).

Token bucket je *standardní* algoritmus v moderních QoS systémech (Linux `tc`, Cisco CAR).

## Shrnutí

Klíčová dichotomie:

```
                ┌── flow control (end-to-end, rwnd)
regulace L4 ────┤
                └── congestion control ──┬── repair (TCP loss-based)
                                         └── avoid (token bucket, ECN)
```

V TCP jsou všechny tyto mechanismy *přítomny*. V dalších sekcích si je budeme aplikovat na konkrétní variant — **TCP Reno**, **TCP Cubic**, **TCP BBR** — a uvidíme, jak se vyvíjely algoritmy congestion control od 1986 do dneška.

## Co dále

Tato sekce uzavírá *abstraktní* část přednášky o transportu. V dalších sekcích se podíváme na **konkrétní L4 protokoly** — TCP a jeho variace, UDP, QUIC, SCTP. Tyto jsou samostatným tématem (slidy 61–135) a budou pokryty v navazujících sekcích PDS.

---

*Zdroj: PDS přednáška 2 (Transportní protokoly), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: Jacobson, V.: „Congestion Avoidance and Control" (ACM SIGCOMM 1988); [RFC 5681 — TCP Congestion Control](https://www.rfc-editor.org/rfc/rfc5681); [RFC 3168 — ECN](https://www.rfc-editor.org/rfc/rfc3168); [RFC 8290 — CoDel](https://www.rfc-editor.org/rfc/rfc8290).*
