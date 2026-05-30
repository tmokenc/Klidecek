---
title: DPDK, PF_RING — kernel bypass
---

# Kernel bypass — DPDK a PF_RING

Stock Linux + NAPI/RSS ([[napi-rss-offload]]) zvládne *10 GbE*. Pro 40/100/400 GbE je *kernel cesta* příliš dlouhá — desítky funkcí, hooky, conntrack, queueing. **Kernel bypass** = NIC dodává pakety *přímo aplikaci*, mimo kernel stack. Cena: ztráta téměř *všech* kernel features (firewall, routing, NAT). Výhoda: 10–100× větší packet rate.

## Idea

::: svg "Standardní cesta vs kernel bypass"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="20" y="20" width="220" height="160"/>
    <rect x="300" y="20" width="220" height="160"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="130" y="40" font-weight="600">Stock kernel</text>
    <text x="130" y="60" font-size="10">NIC → driver → kernel</text>
    <text x="130" y="75" font-size="10">→ netfilter → routing</text>
    <text x="130" y="90" font-size="10">→ socket → app</text>
    <text x="130" y="115" font-size="10" fill="var(--accent)">~1 Mpps / core</text>
    <text x="130" y="150" font-size="10">Pros: rich functionality</text>
    <text x="130" y="165" font-size="10">Cons: latency, overhead</text>
    <text x="410" y="40" font-weight="600">Kernel bypass</text>
    <text x="410" y="60" font-size="10">NIC → DMA → app</text>
    <text x="410" y="75" font-size="10">(zero-copy)</text>
    <text x="410" y="115" font-size="10" fill="var(--accent)">~10-30 Mpps / core</text>
    <text x="410" y="150" font-size="10">Pros: speed</text>
    <text x="410" y="165" font-size="10">Cons: reimplementuj stack</text>
  </g>
</svg>
:::

Klíčové změny:

1. **NIC DMA do user-space memory** — žádné `copy_to_user`. Aplikace mapuje fyzickou paměť, NIC zapisuje přímo tam.
2. **Polling místo IRQ** — aplikace v *busy loop* čeká na nový paket. CPU 100 % vytížené, ale latence nanosekundy.
3. **NIC ovládá user-space driver** — kernel "vyhostí" NIC, aplikace ovládá registers přímo přes `/dev/uioN` nebo `vfio-pci`.

## DPDK — Intel's Data Plane Development Kit

[Intel DPDK](https://www.dpdk.org/), open-source. *De facto* standard pro high-performance user-space packet processing.

### Komponenty

- **EAL** (Environment Abstraction Layer) — init hugepages, CPU affinity, NUMA.
- **Mempool / mbuf** — buffer pool pro pakety. Pre-allocated v hugepages (2 MB / 1 GB stránky → méně TLB miss).
- **Drivers** — `igb`, `ixgbe`, `mlx5`, `vfio-pci`. Většina velkých NIC vendor podporuje.
- **Librariek** — `rte_eth_rx_burst()`, `rte_eth_tx_burst()`, `rte_ring`, `rte_hash`, ACL, klassifikace.

### Vzor použití

```c
// init EAL
rte_eal_init(argc, argv);

// allocate mempool
struct rte_mempool *mp = rte_pktmbuf_pool_create("MBUF_POOL",
    8192, 256, 0, RTE_MBUF_DEFAULT_BUF_SIZE, rte_socket_id());

// configure port
rte_eth_dev_configure(port_id, n_rx_queues, n_tx_queues, &port_conf);
rte_eth_rx_queue_setup(port_id, 0, 1024, ..., mp);
rte_eth_tx_queue_setup(port_id, 0, 1024, ...);
rte_eth_dev_start(port_id);

// main packet loop (busy polling)
while (1) {
    struct rte_mbuf *bufs[BURST_SIZE];
    uint16_t nb_rx = rte_eth_rx_burst(port_id, 0, bufs, BURST_SIZE);
    for (int i = 0; i < nb_rx; i++) {
        process_packet(bufs[i]);
    }
    rte_eth_tx_burst(out_port, 0, bufs, nb_rx);
}
```

Klíčové: **busy loop**, žádné syscall, žádné context switch.

### Výkon

Standard benchmark — *L2 forwarding* (přijmi paket, přepiš MAC, pošli zpět). DPDK na 8-core Xeon dělá:

- **30+ Mpps na jádro** (single-threaded).
- **240+ Mpps celkem** přes 8 jader.

Saturuje 100 GbE s 64 B pakety (148 Mpps worst-case) s ~6 jádry.

### Cena

- *Dedikované CPU jádra* — busy poll spotřebovává 100 % core. 4–8 jader server jen na network.
- *Reimplementace stacku* — pokud chcete routing, IP, TCP, musíte si je napsat (nebo použít VPP — viz dále).
- *No kernel features* — žádný iptables, žádné `tcpdump`, žádné `ip` nástroje. Síťová karta *zmizí* z `/sys/class/net/`.
- *Hugepages* — kernel musí mít alokované 2 MB nebo 1 GB stránky.

### Aplikace nad DPDK

- **VPP** ([Vector Packet Processing](https://wiki.fd.io/view/VPP), Cisco/FD.io) — *plný router* nad DPDK. IP routing, OSPF, BGP, IPsec, NAT. Saturuje 100 GbE.
- **OVS-DPDK** — Open vSwitch v DPDK módu. Datacenter virtual switching.
- **Snabb** — Lua-scripted networking platform.
- **Cisco TRex** — traffic generator pro testing.
- **NFV řešení** — Telco vendor produkty (Nokia, Ericsson) běží nad DPDK.

## PF_RING

[ntop PF_RING](https://www.ntop.org/products/packet-capture/pf_ring/), 2004. *Předchůdce* DPDK pro Linux.

Princip:

- Kernel modul vytvoří **ring buffer** v paměti.
- NIC kopíruje pakety do ringu (může být *zero-copy* s `PF_RING ZC` a vendor drivers).
- Aplikace **mmap**uje ring → čte přímo.
- Bypass: žádná netfilter, žádný IP stack.

### PF_RING varianty

- **PF_RING (vanilla)** — funguje s libovolným NIC driverem. Throughput ~5 Mpps.
- **PF_RING ZC** (Zero Copy) — vyžaduje vendor specific drivers (Intel ixgbe, mellanox). Throughput 15–20 Mpps.
- **PF_RING + DNA** — historie, předchůdce ZC.

### Použití

- **n2disk** — full packet capture do disku za 10 Gbps.
- **nProbe** — flow exporter (NetFlow/IPFIX) z high-speed sledování.
- **Suricata IDS** — Suricata může běžet *přes* PF_RING místo libpcap pro vyšší throughput.

PF_RING je *jednodušší* než DPDK (API je téměř pcap-compatible) ale *méně výkonný*. Pro nejvyšší rychlosti se přechází na DPDK.

## Netmap — alternative

[Luigi Rizzo's netmap](https://github.com/luigirizzo/netmap) (FreeBSD originálně, později Linux port). Akademický předchůdce mnoha ideí v DPDK/PF_RING.

V Linux ekosystému dnes méně populární; v FreeBSD/illumos stále standard.

## Co bypass nezvládne

- *Stateful Firewall* — netfilter conntrack je obří. DPDK aplikace by ji musela reimplementovat (lze, je to práce).
- *TCP stack* — pokud potřebujete *server* nad DPDK, musíte vlastní TCP (mTCP, Seastar). Drahá implementace.
- *Standard Linux nástroje* — `ifconfig`, `ip`, `ss`, `tcpdump` nefungují na DPDK-ovládané NIC.

Proto je DPDK use-case **specifický**:

- Edge routery, NAT boxes (specialized appliance).
- Traffic generators, packet capture.
- NFV (Network Function Virtualization) — virtualized routers, firewalls v telco.
- Datacenter east-west switching (OVS-DPDK).

Pro klasický web server / general purpose Linux box — *zůstaňte u stock kernel*.

## Mladší alternativa — io_uring + AF_XDP

Linux 4.18+ má **AF_XDP** — socket family, který *přímo* dodává pakety z XDP ([[ebpf-xdp]]) do user-space. Bez DPDK driver výměny, *koexistuje* s kernel stackem.

Throughput: blíže DPDK (~15 Mpps/core), s výhodou kernel-friendly. Roste adopce.

## Co dál

Bypass je *radikální*. Mírnější přístup — **XDP** ([[ebpf-xdp]]) — drží paket v kernelu, ale spouští *user-defined eBPF program* dřív než kernel stack. Programovatelný, bezpečný, rychlý.

---

*Zdroj: PDS přednáška 9 (Zpracování paketů), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [DPDK official documentation](https://doc.dpdk.org/); [ntop PF_RING](https://www.ntop.org/guides/pf_ring/); Rizzo, L.: „netmap: a novel framework for fast packet I/O" (USENIX ATC 2012); [Cisco VPP](https://wiki.fd.io/view/VPP/What_is_VPP%3F); [Snabb project](https://github.com/snabbco/snabb); Han, S. et al.: „PacketShader: a GPU-accelerated software router" (ACM SIGCOMM 2010).*
