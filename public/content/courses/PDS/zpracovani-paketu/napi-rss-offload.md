---
title: NAPI, RSS, segmentation offload
---

# NAPI, RSS a offload — stock kernel optimalizace

Kernel stack ([[linux-kernel-stack]]) je *univerzální*, ale defaultně *pomalý*. Tato sekce popisuje **standardní optimalizace**, které jsou *zapnuté na běžných serverech* a poskytují *4–10×* lepší packet rate než naivní implementace. Tři klíčové: **NAPI** (interrupt mitigation), **RSS** (multi-queue parallelism), **GSO/GRO** (segmentation offload).

## Problém s klasickými přerušeními

Klasický mechanismus pro RX:

1. NIC dostane paket → DMA do RAM → *přerušení* CPU.
2. CPU obslouží IRQ — uloží registry, skočí do handleru, zpracuje paket, vrátí registry.

Cena obsluhy IRQ: **~1 μs** na moderním CPU. Při 1 Mpps = 1 sekunda CPU za sekundu — *100 % CPU jen na IRQ*, žádný čas na zpracování.

**Interrupt storm**: pod heavy load CPU *jen* obsluhuje IRQ, *nestihne* zpracovat fronty → drops, deadlock.

## NAPI — interrupt mitigation

**New API** (2002, [Salim, Olsson, Kuznetsov](https://lwn.net/Articles/30107/)). Hybrid IRQ + polling.

Algoritmus:

1. NIC dostane paket → IRQ → CPU **disables** další IRQ z této NIC, scheduluje **NAPI poll**.
2. Kernel periodicky volá `napi->poll()` — vyčte *víc* paketů z NIC RX ringu *naráz*.
3. Když ring je prázdný (a žádný nový paket během poll), kernel **re-enables** IRQ.
4. Při dalším paketu znovu od bodu 1.

::: svg "NAPI — od per-paket IRQ k poll-based batch"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="20" y="20" width="240" height="60"/>
    <rect x="280" y="20" width="240" height="60"/>
    <rect x="20" y="100" width="500" height="60" fill="var(--bg-inset)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="140" y="40" font-weight="600">Classic IRQ</text>
    <text x="140" y="60">1 paket = 1 IRQ</text>
    <text x="140" y="73">≈ 1 μs overhead / paket</text>
    <text x="400" y="40" font-weight="600">NAPI poll</text>
    <text x="400" y="60">N paketů = 1 IRQ + N reads</text>
    <text x="400" y="73">≈ 0.1 μs overhead / paket</text>
    <text x="270" y="120" font-weight="600">Pod load: NAPI plus poll mode</text>
    <text x="270" y="138" font-size="10">CPU stojí v poll loop, IRQ vypnuté</text>
    <text x="270" y="151" font-size="10">→ throughput skokem nahoru, latence z 1 μs na 0.1 μs</text>
  </g>
</svg>
:::

Pod low traffic: IRQ-mode (rychlá detekce, nízká latence).
Pod high traffic: poll-mode (velký throughput, IRQ off).

**Adaptive coalescing** — driver dynamicky upravuje, jak dlouho čekat před spuštěním poll. Trade-off: latence vs CPU spotřeba.

Linux: `ethtool -c eth0` zobrazí, `ethtool -C eth0 rx-usecs 100` nastaví coalescing window.

## RSS — Receive Side Scaling

Moderní NIC má **víc RX rings** (queue) — typicky 4, 8, 16, 32, 64. **RSS** rozdělí příchozí pakety do queue podle **hash** L3+L4 hlaviček a mapuje queue na CPU jádro.

::: svg "RSS — multi-queue NIC s per-queue IRQ na různá jádra"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="20" y="20" width="100" height="160"/>
    <rect x="200" y="30" width="100" height="30"/>
    <rect x="200" y="70" width="100" height="30"/>
    <rect x="200" y="110" width="100" height="30"/>
    <rect x="200" y="150" width="100" height="30"/>
    <rect x="380" y="30" width="100" height="30"/>
    <rect x="380" y="70" width="100" height="30"/>
    <rect x="380" y="110" width="100" height="30"/>
    <rect x="380" y="150" width="100" height="30"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="70" y="100" font-weight="600">NIC</text>
    <text x="70" y="115">100 GbE</text>
    <text x="250" y="48">RX queue 0</text>
    <text x="250" y="88">RX queue 1</text>
    <text x="250" y="128">RX queue 2</text>
    <text x="250" y="168">RX queue 3</text>
    <text x="430" y="48">CPU 0</text>
    <text x="430" y="88">CPU 1</text>
    <text x="430" y="128">CPU 2</text>
    <text x="430" y="168">CPU 3</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="125" y1="45" x2="195" y2="45"/>
    <line x1="125" y1="85" x2="195" y2="85"/>
    <line x1="125" y1="125" x2="195" y2="125"/>
    <line x1="125" y1="165" x2="195" y2="165"/>
    <line x1="305" y1="45" x2="375" y2="45"/>
    <line x1="305" y1="85" x2="375" y2="85"/>
    <line x1="305" y1="125" x2="375" y2="125"/>
    <line x1="305" y1="165" x2="375" y2="165"/>
  </g>
</svg>
:::

Hash typically Toeplitz nad `(src_ip, dst_ip, src_port, dst_port)`:

$$
\text{queue} = \text{hash}(\text{5-tuple}) \mod N_\text{queues}
$$

Důsledek: **flow affinity** — všechny pakety jednoho flow jdou na *stejnou* queue → *stejné* CPU jádro. Cache locality, žádná lock contention.

### Limity RSS

- *Statistická distribuce*: pro **málo flows** se nerozhází. Příklad: jeden klient stahuje 10 GB soubor — *jediný* flow → *jedno* jádro → 1 Mpps limit.
- *Tunelovaný traffic*: GRE/IPsec mají *vnější* 5-tuple stejné → vše do jednoho jádra.
- *Single TCP connection*: nelze paralelizovat napříč jádry (přerovnání paketů by porušilo TCP).

Obrana: **RPS** (Receive Packet Steering) — *software* RSS v kernelu pro NICs bez hardwarové podpory. Nebo **RFS** (Receive Flow Steering) — track aktivní socket a posílá pakety na CPU, kde aplikace čte.

V 2026 high-end NIC mají 64+ queue. Kernel může mappovat na 64 CPU cores → teoreticky 64× scaling.

## TSO / GSO — TX side segmentation offload

Klasický TX:

1. Aplikace volá `send(socket, buf, 64 KB)`.
2. Kernel TCP layer rozseká na ~45 paketů (po 1448 B = MSS).
3. Pro každý paket: IP header, checksum, L2 header.
4. ~45× driver TX call.

Cena ~45× per-paket processing.

**TSO** (TCP Segmentation Offload) / **GSO** (Generic Segmentation Offload): kernel *předá NIC* **jeden** big-buffer (až 64 KB) + TCP "template". **NIC sama** segmentuje na 1448 B kusy, aplikuje TCP/IP/checksum.

Důsledek: ~45 paketů = *jeden* kernel call. CPU spotřeba klesá *řádově*. Latence stejná (NIC dělá rychleji).

### GSO vs TSO

- **TSO** — hardware u NIC. Karta musí podporovat.
- **GSO** — *software* fallback v kernelu, *just before* driver. Funguje na všech NIC, *ale* CPU stále musí segmentovat.

Většina moderních NIC podporuje TSO. `ethtool -k eth0` zobrazí features.

### Limity

- *Jen TCP* (GSO pro UDP/QUIC = USO, novější).
- *Bez middlebox modifikace* — pokud router přepíše TCP header (NAT, MSS clamp), TSO selže.
- *Encrypted (IPsec)* — některé NIC neumí TSO přes encrypted tunnel.

## GRO — RX side coalescing

Opposite GSO. NIC nebo kernel *spojí* víc příchozích paketů stejného flow do *jednoho* sk_buffu.

Příklad: 10 TCP segmentů by 1448 B → kernel je *spojí* do jednoho 14 480 B sk_buffu. Stack zpracuje *jednou* (IP routing, TCP layer), aplikace dostane *jednou* `recv(14480)`.

Throughput nárůst: 10× méně paketů zpracovat, 10× méně kernel calls. Latence: drobná (čeká pár μs na následující paket flow).

`ethtool -k eth0 | grep generic-receive-offload`

GRO výhody:

- Standardně zapnutý.
- Funguje s libovolným hardware.

Limitace: stejné jako GSO — break-on-mid-flight middlebox modifikace.

## Checksum offload

NIC umí spočítat IP + TCP/UDP checksum *v hardware*. Klasicky:

```c
ip->check = ip_fast_csum(ip, ip->ihl);
tcp->check = tcp_v4_check(skb->len, sip, dip, csum_partial(tcp, ...));
```

CPU instrukce na každý 32-bit word paketu. Pro 1500 B paket = stovky instrukcí.

S checksum offload: kernel zapíše *placeholder* (nula); NIC spočítá při TX. Při RX: NIC ověří, předá flag "valid" do skb; kernel checksum *nepřepočítává*.

Úspora ~3–5 % CPU. Standardně zapnuté.

## Combined effect

V default Linux server konfiguraci s NAPI + RSS (8 queues) + GRO + TSO + checksum offload:

| | per-core throughput | multi-core 8 |
| :--- | :---: | :---: |
| Naivní | ~200 kpps | ~1.6 Mpps (kontence locks) |
| NAPI alone | ~500 kpps | ~3 Mpps |
| NAPI + RSS | ~1 Mpps | ~8 Mpps |
| NAPI + RSS + GRO | ~1.5 Mpps | ~12 Mpps |

Pro **10 GbE saturation** (14.9 Mpps worst-case) stock Linux *téměř stačí*. Pro 100 GbE potřebujeme **kernel bypass** ([[dpdk-pfring]]) nebo **XDP** ([[ebpf-xdp]]).

## Inspekce a konfigurace

| Příkaz | Účel |
| :--- | :--- |
| `ethtool -l eth0` | zobraz počet queue |
| `ethtool -L eth0 combined 16` | nastav 16 queue |
| `ethtool -k eth0` | zobraz offload features |
| `ethtool -K eth0 gro off` | vypnout GRO |
| `ethtool -c eth0` | coalescing settings |
| `cat /proc/interrupts \| grep eth0` | IRQ distribution na CPU |
| `numactl --hardware` | NUMA topology (důležité pro multi-CPU servers) |

## Co dál

Stock kernel zoptimalizovaný (NAPI, RSS, offload) saturuje 10 GbE. Pro **víc** potřebujeme *obejít* kernel stack úplně — **kernel bypass** ([[dpdk-pfring]]).

---

*Zdroj: PDS přednáška 9 (Zpracování paketů), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: Salim, J.H., Olsson, R., Kuznetsov, A.: „Beyond Softnet" (Linux Symposium 2001); Microsoft: *Receive Side Scaling* whitepaper (2008); [Linux Kernel Documentation — scaling.txt](https://www.kernel.org/doc/Documentation/networking/scaling.txt); [Cloudflare Blog — Receiving 1M packets per second](https://blog.cloudflare.com/how-to-receive-a-million-packets/); [Intel — Generic Segmentation Offload](https://www.kernel.org/doc/html/latest/networking/segmentation-offloads.html).*
