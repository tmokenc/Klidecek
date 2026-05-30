# Timeouty a odhad RTT

Sekvenční čísla ([[sekvencni-cisla-detekce]]) říkají *co* bylo přijato. Aby odesílatel věděl, *kdy* prohlásit paket za ztracený a retransmise, potřebuje **timeout** — časový limit pro ACK. Volba správné hodnoty je netriviální: příliš krátký = zbytečné retransmise, příliš dlouhý = pomalé zotavení. Tato sekce ukazuje **EWMA algoritmus** s odchylkou rozptylu (RFC 6298), který TCP používá.

## Volba timeoutu

Možné strategie:

- **Fixní hodnota** — ☹ Nezohledňuje měnící se podmínky sítě. Pro WAN bývá zbytečně dlouhá; pro LAN naopak krátká.
- **Z poslední naměřené RTT** — 😐 Velmi citlivá na výkyvy. Jeden paket s vysokým RTT (např. retransmise) by dramaticky posunul timeout.
- **Klouzavý průměr (EWMA)** — 😊 Zohledňuje *trend*, vyhlazuje výkyvy. Toto používá TCP.

## RTT — Round-trip Time

**RTT** = čas mezi odesláním paketu a přijetím jeho potvrzení.

V TCP se měří *přes každý paket*. Při retransmisi se RTT *neměří* (nemůžeme rozhodnout, zda ACK patří originálu nebo retransmise — to je **Karn's algorithm**, RFC 6298).

## EWMA — Exponential Weighted Moving Average

Vzorec pro *vyhlazený* odhad RTT:

$$srtt_k = (1 - a) \cdot srtt_{k-1} + a \cdot rtt_k$$

$$timeout_k = srtt_k$$

kde:

- $rtt_k$ = naměřená RTT pro $k$-tý paket
- $srtt_k$ = *smoothed* RTT pro $k$-tý paket
- $a$ ∈ ⟨0, 1⟩ — parametr.

Význam parametru $a$:

- $a \to 0$: starý odhad dominuje, *velmi pomalu* reaguje na změny.
- $a \to 1$: nové měření dominuje, *rychle* reaguje, ale výkyvy projdou.

**Doporučená hodnota:** $a = 0{,}125 = 1/8$ (RFC 6298). Tato hodnota dává *dobrý poměr* mezi vyhlazením a citlivostí.

### Konvergence

Vzorec konverguje k *aktuální* hodnotě RTT *exponenciálně*. Při $a = 0{,}125$ je *čas zotavení* z chyby $\sim 8$ vzorků RTT.

## EWMA s odchylkou rozptylu (Karn/Jacobson)

Samotný EWMA nestačí — *nezohledňuje proměnlivost* RTT v čase. Pokud je síť *stabilní*, timeout = srtt funguje. Pokud RTT *kolísá* (typické pro internet), potřebujeme *rezervu nad srtt*.

Zlepšení (Jacobson 1988, RFC 6298) přidává **odchylku rozptylu** (*mean deviation*, RTTVAR):

$$srtt_k = (1 - a) \cdot srtt_{k-1} + a \cdot rtt_k$$
$$e_k = |srtt_{k-1} - rtt_k|$$
$$rttvar_k = (1 - b) \cdot rttvar_{k-1} + b \cdot e_k$$
$$timeout_k = srtt_k + X \cdot rttvar_k$$

kde:

- $e_k$ = rozdíl mezi odhadem a měřením (instantní *deviace*).
- $rttvar_k$ = EWMA odhad deviace.
- $b$ = konstanta variability v ⟨0, 1⟩. **Doporučené $b = 0{,}25$**.
- $X$ = násobitel rozptylu. **Doporučené $X = 4$**.

### Co to znamená

Timeout je $srtt + 4 \cdot rttvar$ — tedy *střední RTT plus čtyřnásobek očekávané odchylky*. Pokud je síť *stabilní*, $rttvar \to 0$ a timeout $\approx srtt$ — dotahuje se rychlým ACK. Pokud je síť *neklidná*, $rttvar$ roste, timeout zvětší — *robustnost* na úkor latence detekce.

### Volba počátečních hodnot

Algoritmus je *citlivý* na inicializaci $srtt_0$ a $rttvar_0$. Doporučení RFC 6298:

- $srtt_0 = $ první RTT měření (po SYN/SYN-ACK).
- $rttvar_0 = \frac{srtt_0}{2}$.
- Před prvním měřením: timeout = 1 s (konzervativní).

Po startu se hodnoty rychle stabilizují.

## Demonstrace

Pro RTT linky $\approx 0{,}185$ s s občasným *peakem* (paket s RTT 0,55 s ve vzorku 5):

| | timeout BEZ deviace | timeout S deviace |
| :--- | :--- | :--- |
| Před peakem | $\approx 0{,}23$ | $\approx 0{,}33$ |
| V peaku | krátce *přestřelí* | bezpečně absorbuje |
| Po peaku | postupně klesá | postupně klesá |

S deviací je timeout konzervativnější a *vyhne se zbytečným retransmisím* během krátkých výkyvů.

## Karn's algorithm — retransmise a RTT

Klíčové pravidlo (RFC 6298):

> Pokud byl paket *retransmitován*, *neměj* RTT z tohoto měření.

Důvod: nelze rozhodnout, zda ACK patří původnímu paketu nebo retransmise. Pokud byste měřili, mohli byste *neúmyslně* zmenšit srtt (pokud retransmise ACK přijde rychle), a tím spirálu retransmisí ještě zhoršit.

Místo toho **zdvojnásob timeout** při každé retransmisi (*exponential backoff*, RFC 6298). To dává síti čas se zotavit a předchází *retransmise storm*.

## Co dále

Známe-li kdy retransmise spustit, otázkou je *co* retransmise — celé okno (Go-Back-N), jen ztracené pakety (Selective Repeat) nebo více strategií. Viz [[arq-okno]].

---

*Zdroj: PDS přednáška 2 (Transportní protokoly), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 6298 — Computing TCP's Retransmission Timer](https://www.rfc-editor.org/rfc/rfc6298) (původní RFC 2988); Jacobson, V.: „Congestion Avoidance and Control" (ACM SIGCOMM 1988, [DOI 10.1145/52324.52356](https://doi.org/10.1145/52324.52356)) — kanonický článek o EWMA RTT.*
