---
title: Zpracování paketů — limity Ethernetu a packet rate
---

# Zpracování paketů — proč packet rate, ne bit rate

Předchozí přednášky ([[prepinac-uvod]], [[router-architektura]]) ukázaly, jaké *funkce* musí router/switch vykonávat. Tato kapitola se ptá *jak rychle*: jak software (Linux kernel) zpracovává pakety v praxi, kde jsou *bottlenecky* a jak je obejít. Zaměříme se na **Linux** — open source kód, široce nasazený, učebnicový pro pochopení principů.

## Klíčový vzorec: packet rate ≠ bit rate

> Při vysokorychlostních linkách *není* limitující bit rate, ale **packet rate** — počet paketů za sekundu.

Proč? Procesor *zpracovává paket* (klasifikace, lookup, queue, ACL match). Cena za paket je *kvazi-konstantní* — sotva závisí na velikosti payload. Tisíc malých 64 B paketů stojí *tisíckrát* víc CPU než jeden 64 kB segment.

### Worst-case packet rate

Ethernet minimální frame = 64 B (uvnitř L2) + preambule 7 B + start frame delimiter 1 B + inter-frame gap 12 B = **84 B na drátě**.

Při 100 Gbps linkové rychlosti:

$$
\text{paket rate}_{\max} = \frac{100 \cdot 10^9\ \text{b/s}}{84 \cdot 8\ \text{b}} \approx 148\ \text{Mpps}
$$

= **148 milionů paketů za sekundu**. Software na CPU zvládá *typicky* 1 Mpps na jádro v defaultním Linux stacku. Aby 100 GbE link byl saturován malými pakety, je potřeba *desítky jader* — nebo *hardware acceleration*.

| Linka | Max packet rate (64 B) | Single-core CPU stačí? |
| :--- | :---: | :---: |
| 100 Mbps | 0.15 Mpps | ✓ |
| 1 Gbps | 1.5 Mpps | ✓ snadno |
| 10 Gbps | 14.9 Mpps | ✗ default stack, ✓ DPDK |
| 100 Gbps | 148 Mpps | ✗ ani DPDK; nutno multi-core + offload |
| 400 Gbps | 595 Mpps | ✗ jen ASIC |

### Realistický packet rate

V *reálném* trafficu nejsou všechny pakety 64 B. Statistika z **AMS-IX** (Amsterdam Internet Exchange):

| Velikost paketu | Podíl |
| :---: | :---: |
| 64–127 B | ~30 % |
| 128–255 B | ~5 % |
| 256–511 B | ~5 % |
| 512–1023 B | ~10 % |
| 1024–1499 B | ~5 % |
| **1500 B (MTU)** | ~45 % |

Bimodální distribuce — malé pakety (TCP ACKs) + velké (data). Average ~850 B → packet rate při 100 Gbps reálně ~14 Mpps. *Stále* hodně, ale 10× méně než worst-case.

## Architektonický pohled — vrstvy zpracování

Pro paket je *cesta* z drátu do aplikace dlouhá:

::: svg "Cesta paketu Linux kernelem"
<svg viewBox="0 0 540 230" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="40" y="20" width="180" height="26"/>
    <rect x="40" y="46" width="180" height="26"/>
    <rect x="40" y="72" width="180" height="26"/>
    <rect x="40" y="98" width="180" height="26"/>
    <rect x="40" y="124" width="180" height="26"/>
    <rect x="40" y="150" width="180" height="26"/>
    <rect x="40" y="176" width="180" height="26"/>
    <rect x="320" y="20" width="180" height="182" fill="var(--bg-inset)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="130" y="36">NIC hardware</text>
    <text x="130" y="62">Driver IRQ</text>
    <text x="130" y="88">NAPI poll</text>
    <text x="130" y="114">Netfilter pre-route</text>
    <text x="130" y="140">IP routing decision</text>
    <text x="130" y="166">Netfilter local-in</text>
    <text x="130" y="192">TCP/UDP layer</text>
    <text x="410" y="95">Application</text>
    <text x="410" y="112" fill="var(--text-muted)">(socket, syscall)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none" marker-end="url(#arr4)">
    <line x1="225" y1="190" x2="315" y2="190"/>
  </g>
  <defs>
    <marker id="arr4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

Každá vrstva přidává **drobnou** režii — sčítání = velká pomalost. Optimalizace mohou *vynechat* některé vrstvy ([[dpdk-pfring]], [[ebpf-xdp]]) nebo *agregovat* zpracování ([[napi-rss-offload]]).

## Memory latency — druhý velký bottleneck

Procesor je rychlý (5 GHz = 0.2 ns/cycle), paměť pomalá (~80 ns DRAM access). Při 148 Mpps má CPU **~7 ns na paket** — *méně* než jeden L3 cache miss.

Důsledek: paket *musí* zůstat v *cache*. Bezpečnostně lze rozmazat o memory copies — *zero-copy* design v DPDK, XDP.

Linux kernel používá **sk_buff** strukturu pro paket. Klíčový trick: ukazatele se *posouvají* mezi vrstvami, *data se nekopírují*. Když L2 driver "odstraní" Ethernet hlavičku, posune `data` pointer o 14 B. Když L3 "přidá" IP hlavičku, ukazatel se posune zpět. Žádné kopírování bajtů.

## Ethernet zpětná kompatibilita

Ethernet *nezměnil framing* od 1980. 64 B minimum (CSMA/CD pravidlo z 10 Mbps doby), 1500 B MTU, 14 B header. Z toho:

- *Výhoda*: nová 100 GbE karta umí mluvit se starou 10 Mbps. Zařízení z 2000 funguje s zařízením z 2026.
- *Nevýhoda*: zase ta 64 B / 84 B minimum. Při 400 GbE worst-case = 595 Mpps. Pro úsporu se zavedly **jumbo frames** (9000 B MTU), ale podpora *není* všude — interoperabilita problém.

Jumbo frames standardní pro:

- **Storage networks** (iSCSI, NFS) — DC interní.
- **Datacenter east-west** — Top-of-rack switches umí.
- *Ne* na internet páteři — middleboxes by mohli zahodit.

## Plán kapitoly

1. [[linux-kernel-stack]] — sk_buff, NetDevice, netfilter hooks; vrstvy uvnitř kernelu.
2. [[napi-rss-offload]] — Interrupt mitigation (NAPI), multi-queue (RSS), segmentation offload (GSO/GRO), checksum offload.
3. [[dpdk-pfring]] — Kernel bypass: PF_RING, DPDK; *odpojení* od kernel stacku pro maximální rychlost.
4. [[ebpf-xdp]] — eBPF, XDP — moderní in-kernel programmability; *flexibilita* + *rychlost*.

Klíčový pattern: každá technika *něco vyhandlovává jinde* — IRQ batching, queue parallelism, kernel bypass, BPF VM v kernelu. Žádná z nich není silver bullet; volba závisí na *aplikaci*.

---

*Zdroj: PDS přednáška 9 (Zpracování paketů), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: Foong, A.P. et al.: „TCP Performance Re-Visited" (IEEE ISPASS 2003); [Cloudflare Blog — Linux network performance](https://blog.cloudflare.com/how-to-receive-a-million-packets/); [LWN — A JIT for packets](https://lwn.net/Articles/437981/); [AMS-IX frame size statistics](https://www.ams-ix.net/ams/documentation/total-stats); Postel, J., Reynolds, J.: *Assigned Numbers* (RFC 990, 1986).*
