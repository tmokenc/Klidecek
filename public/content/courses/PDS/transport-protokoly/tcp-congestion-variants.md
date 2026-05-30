---
title: TCP congestion control — Tahoe, Reno, Cubic, BBR
---

# TCP congestion control — od Van Jacobsona k BBR

Předchozí kapitola ([[rizeni-toku-zahlceni]]) zavedla *obecné* myšlenky congestion control — repair vs avoid, end-to-end vs network-assisted. Tato sekce probere **konkrétní** varianty implementované v TCP. Historie začíná v roce 1986 a pokračuje aktivně dodnes — congestion control je nejživější oblast výzkumu v transportní vrstvě.

## Historický kontext — congestion collapse 1986

Říjen 1986. ARPANET na *malé* lince mezi LBL a UC Berkeley. Throughput sítě klesá z 32 kbps na **40 bps** — 1000× pokles. Důvod: TCP té doby nemělo žádnou regulaci. Když paket selhal, znovu se ho posílalo — což zhoršovalo zácpu. Síť se zahltila *retransmisemi*.

Van Jacobson (LBL) publikoval v roce 1988 článek *"Congestion Avoidance and Control"* (SIGCOMM '88) s první variantou — později pojmenovanou **TCP Tahoe**. Hlavní myšlenka: TCP musí *samo sebe zpomalit*, pokud detekuje ztráty. Jakobsonovy algoritmy se staly *de facto* standardem a žijí v každém operačním systému dodnes.

## Termíny

- **cwnd** (*congestion window*) — kolik *neporavněných* bajtů má odesílatel "v letu". Mění se podle algoritmu.
- **rwnd** (*receive window*) — kolik je příjemce ochotný přijmout (flow control, [[tcp-spojeni-hlavicka]]).
- *Effective window* = $\min(\text{cwnd}, \text{rwnd})$.
- **ssthresh** (*slow start threshold*) — hranice mezi *slow start* a *congestion avoidance* fází.
- **MSS** — *Maximum Segment Size* ([[tcp-options]]).

## TCP Tahoe (1988) — slow start + congestion avoidance + fast retransmit

První kompletní algoritmus. Tři klíčové ingredience.

### 1. Slow start

Začni s `cwnd = 1 MSS`. Po každém ACK *přidej 1 MSS* → `cwnd` se každé RTT *zdvojnásobí* (exponenciální růst). Cíl: rychle prozkoumat dostupnou kapacitu.

Slow start trvá *dokud `cwnd < ssthresh`*. Initial `ssthresh` = velké číslo (typicky 64 KB).

### 2. Congestion avoidance — AIMD

Po dosažení `ssthresh` přepni do *additive increase*. Každé RTT: `cwnd += 1 MSS` (lineární růst). Pomalý, ale bezpečný — opatrně zkoumáme, kde je nový limit.

### 3. Loss detection — fast retransmit

Detekce ztráty paketu:

- **Timeout (RTO)** — odesílatel nedostane ACK do RTO. *Vážná* situace.
- **3× duplikátní ACK** — pravděpodobně paket vypadl, ale následující dorazily. Méně vážné.

Tahoe reakce na *jakýkoli* loss (timeout i 3× DupACK):

```
ssthresh = cwnd / 2
cwnd     = 1 MSS
→ slow start zase od nuly
```

Výsledek: charakteristická "pila" `cwnd` v čase. Vždy spadne na 1, pak roste.

::: viz aimd "Posuvníky: loss-rate, ssthresh, varianta (Tahoe/Reno/CUBIC). Sleduj sawtooth a vyznačené loss eventy (TO = timeout, 3-dup = three dup-ACK)."
:::

## TCP Reno (1990) — fast recovery

Tahoe je *zbytečně konzervativní* při 3× DupACK. ACKs *přicházejí* → linka *aspoň částečně* funguje. **Reno** ([RFC 5681](https://www.rfc-editor.org/rfc/rfc5681)) přidává **fast recovery**:

- Při 3× DupACK: `ssthresh = cwnd / 2`, `cwnd = ssthresh + 3 MSS`, *pokračuj v congestion avoidance* (NE slow start).
- Při timeout: stejné jako Tahoe (`cwnd = 1`, slow start).

Výsledek: rozhraní pily je *jen poloviční*, ne na 0. Vyšší průměrný throughput.

## TCP NewReno (RFC 6582)

Reno má problém s *více ztrátami v jednom okně*. Po prvním 3× DupACK retransmituje paket, čeká na "partial ACK" (potvrzuje jen *něco*, ne celé okno). Pokud přijde partial ACK = další ztráta, ale Reno opouští fast recovery → další loss event → další půlení cwnd.

**NewReno**: po partial ACK *neopouští* fast recovery, *okamžitě retransmituje* další ztracený paket. Půlení jen jednou za RTT.

## TCP SACK / FACK

[[tcp-options]] popisuje SACK. S SACK odesílatel přesně ví, *které segmenty chybí* — netroškuje, posílá jen ztracené. Algoritmus *FACK* (Forward Acknowledgment) využívá SACK pro detekci ztrát rychleji než 3× DupACK.

V Linuxu se SACK kombinuje s každou variantou (Reno, Cubic, BBR) — *kongesční algoritmus a recovery strategie jsou nezávislé*.

## TCP Vegas (1994) — delay-based

Brakmo & Peterson, University of Arizona. Místo *ztrát* detekuje zahlcení podle **růstu RTT** — pokud RTT roste, fronty se plní *před* dropem.

Vegas srovnává:

- `Expected throughput = cwnd / BaseRTT` (idealní, prázdná síť),
- `Actual throughput = cwnd / RTT` (aktuální).

Pokud `Expected - Actual > β`, fronty se plní → zmenši `cwnd`. Velmi šetrné, ale *trpí v koexistenci s Reno* — Vegas zpomalí dřív, Reno mu vezme bandwidth.

Použití: do produkce se neprosadil, ale ovlivnil **BBR**.

## TCP Cubic (2008) — dnešní default v Linuxu

Ha, Rhee, Xu — *"CUBIC: A New TCP-Friendly High-Speed TCP Variant"*. Default v Linuxu od 2.6.19.

**Problém:** Reno na *high-speed long-haul* lince (10 Gbps, 100 ms RTT) potřebuje *82 000 RTT* na obnovu cwnd po lossi — desítky minut. Pro moderní sítě nepoužitelné.

**Řešení:** `cwnd` jako *kubická funkce času*:

$$W(t) = C \cdot (t - K)^3 + W_\text{max}$$

kde $W_\text{max}$ = cwnd před lossem, $K = \sqrt[3]{W_\text{max} \cdot \beta / C}$, $C, \beta$ konstanty.

Tvar:

- *Hned po lossi*: rychle blíž k $W_\text{max}$ ("concave" část).
- *Kolem $W_\text{max}$*: pomalý sondovací rytmus ("plateau").
- *Po $W_\text{max}$*: rychlé hledání nového limitu ("convex" část).

::: svg "TCP Cubic — průběh cwnd je kubická křivka kolem Wmax"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6">
    <line x1="40" y1="180" x2="510" y2="180"/>
    <line x1="40" y1="20"  x2="40"  y2="180"/>
  </g>
  <text x="20" y="100" fill="var(--text-muted)" transform="rotate(-90 20 100)" text-anchor="middle">cwnd</text>
  <text x="275" y="195" fill="var(--text-muted)" text-anchor="middle">čas</text>
  <line x1="40" y1="70" x2="510" y2="70" stroke="var(--text-faint)" stroke-dasharray="2 2"/>
  <text x="495" y="65" fill="var(--text-faint)" text-anchor="end" font-size="10">W_max</text>
  <path d="M40,160 C 90,100 130,75 200,70 C 280,70 320,70 350,70 C 410,75 460,55 510,30" fill="none" stroke="var(--accent)" stroke-width="2"/>
  <text x="100" y="120" fill="var(--text)" font-size="10">concave</text>
  <text x="275" y="65" fill="var(--text)" font-size="10" text-anchor="middle">plateau</text>
  <text x="450" y="50" fill="var(--text)" font-size="10">convex</text>
</svg>
:::

Výhoda: prozkoumává linku *neagresivně* kolem $W_\text{max}$, ale rychle *poté*, co zjistí, že limit byl posunut. Robustní napříč širokým rozsahem RTT a bandwidth.

## TCP BBR (2016) — Google, model-based

*Bottleneck Bandwidth and Round-trip propagation time*. Yuchung Cheng, Neal Cardwell et al. — Google. Nasazeno produkčně na YouTube, na backbone Google ↔ datacenter.

**Filozofie:** *Loss není známka congestion* (může to být WiFi, buffer-bloat). Místo toho **modelovat linku** — odhadovat:

- $\text{BtlBw}$ = bottleneck bandwidth (max přijímaná rychlost),
- $\text{RTprop}$ = propagation round-trip time (min RTT, bez front).

Optimum: `cwnd = BtlBw · RTprop` (BDP) — naplníme linku, ale *nepřelijeme buffery*.

BBR pravidelně **probes**:

- *ProbeRTT*: když se odhad RTprop (min RTT) neaktualizoval ~10 s, krátce sníží cwnd na ~4 pakety → re-měření *minimálního* RTprop.
- *ProbeBW*: 8fázový pacing-gain cyklus (jedna RTT na fázi), periodicky aplikuje gain 1.25 (pak 0.75) → zda BtlBw vzrostlo.

Výhody:

- *Vyšší throughput* na lossy lincích (WiFi, mobilní).
- *Nižší delay* — neplní buffery (vyhýbá se bufferbloatu, viz [[rizeni-toku-zahlceni]]).

Nevýhody:

- *Agresivnější* k současně běžícímu CUBIC — bere mu bandwidth.
- BBRv2 (2019, ne ještě default) řeší fairness.

## Srovnání

| Algoritmus | Loss signal | Recovery | Růst | Dnes |
| :--- | :--- | :--- | :--- | :--- |
| Tahoe | timeout, 3× DupACK | slow start od 1 | exp / lin | historie |
| Reno | timeout / 3× DupACK | fast recovery | exp / lin | občas |
| NewReno | timeout / 3× DupACK | iterované fast recovery | exp / lin | některé OS |
| SACK | + selektivní info | jen chybějící | (orto) | doplněk |
| Vegas | growing RTT | proportional | proportional | vzácně |
| Cubic | loss | kubický nárůst | poly | **default Linux** |
| BBR | bandwidth × RTT | model-based | model-based | YouTube, Google |

Linux: `sysctl net.ipv4.tcp_congestion_control` → `cubic` (default), lze přepnout na `bbr`, `reno`, `vegas` (modul). Mac/Windows: Cubic od ~2014.

## Co dál

TCP je *typický* L4 protokol. Existují *jiné* — UDP (jednoduchý best-effort), SCTP (multistream), QUIC (UDP + TCP-like funkce + TLS). Pokračování v [[udp-dccp]], [[sctp]], [[mptcp]], [[quic]].

---

*Zdroj: PDS přednáška 2 (Transportní protokoly), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: Jacobson, V.: „Congestion Avoidance and Control" (ACM SIGCOMM 1988, [DOI 10.1145/52324.52356](https://doi.org/10.1145/52324.52356)); [RFC 5681 — TCP Congestion Control](https://www.rfc-editor.org/rfc/rfc5681); [RFC 6582 — NewReno](https://www.rfc-editor.org/rfc/rfc6582); Ha, S., Rhee, I., Xu, L.: „CUBIC: a new TCP-friendly high-speed TCP variant" (ACM SIGOPS 2008); Cardwell, N. et al.: „BBR: Congestion-Based Congestion Control" (ACM Queue 2016, [DOI 10.1145/3012426.3022184](https://doi.org/10.1145/3012426.3022184)); [Linux Kernel — Congestion control documentation](https://www.kernel.org/doc/Documentation/networking/ip-sysctl.txt).*
