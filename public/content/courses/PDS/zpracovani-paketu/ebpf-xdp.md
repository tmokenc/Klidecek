---
title: eBPF a XDP — programovatelný kernel
---

# eBPF a XDP — programovatelný kernel

DPDK ([[dpdk-pfring]]) je *rychlý*, ale *invazivní* — vyhostí NIC z kernelu. **XDP** (eXpress Data Path) nabízí mezicestu: pakety jsou *stále* v kernelu, ale prochází uživatelsky-napsaným programem *ihned* po NIC driveru. Bez context switche, bez sk_buff overhead, bez netfilter — ale *s* přístupem ke kernel utilities. Klíčová technologie: **eBPF** — bezpečný VM uvnitř kernelu.

## eBPF — extended Berkeley Packet Filter

Historie:

- **BPF** (1992, Berkeley) — bytecode VM v kernelu pro `tcpdump` filtry. Programátor napíše `tcp and port 80`, kompilátor přeloží na BPF bytecode, kernel ho spustí na každý paket.
- **eBPF** (Alexei Starovoitov, 2014) — *generalizace*. Více registrů (11), 64-bit, *více use-case než packet filtering*. Hooky napříč celým kernelem.

### eBPF VM

- *Registers* — 11× 64-bit GP registry, podobné x86_64.
- *Stack* — 512 B.
- *Maps* — sdílené datové struktury mezi BPF programem a user-space (hash maps, arrays, LRU, ring buffers).
- *Helper functions* — kernel-provided utility (lookup map, get timestamp, redirect packet, ...).

### Bezpečnost

eBPF je *bezpečný* běžet v kernelu (privilegovaný kód!) díky **BPF Verifier**:

- Statická analýza CFG.
- Bounds checking — žádné out-of-bounds access.
- Termination guarantee — žádné nekonečné loopy (bounded loops jen).
- Memory access safety — jen do předem alokovaných buffers.

Verifier *odmítne* program, který by mohl crashnout kernel. Vývojář dostane chybový hlášku ("possible NULL dereference at instruction 42"), opraví, re-attempt.

### Use cases

- **Tracing / observability** — BCC, bpftrace, sysdig pro perf monitoring.
- **Security** — Cilium, Falco (runtime security in K8s).
- **Networking** — XDP (níže), tc, socket filters.
- **Profiling** — perf events sampling.

## XDP — eXpress Data Path

[XDP](https://www.iovisor.org/technology/xdp), [Borkmann, Starovoitov, et al., 2016]. eBPF programy attachované **co nejblíž k NIC driveru** — *před* alokací sk_buff, *před* netfilter.

::: svg "XDP a kernel stack — kde se attachuje"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="20" y="40" width="80" height="120"/>
    <rect x="120" y="40" width="100" height="120"/>
    <rect x="240" y="40" width="100" height="120"/>
    <rect x="360" y="40" width="100" height="120"/>
    <rect x="480" y="40" width="40" height="120" fill="var(--bg-inset)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="60" y="95">NIC</text>
    <text x="60" y="108">driver</text>
    <text x="170" y="95">XDP hook</text>
    <text x="170" y="108" fill="var(--accent)">(eBPF)</text>
    <text x="290" y="95">sk_buff</text>
    <text x="290" y="108">netfilter</text>
    <text x="290" y="121">routing</text>
    <text x="410" y="95">socket</text>
    <text x="410" y="108">stack</text>
    <text x="500" y="100">app</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none" marker-end="url(#arr6)">
    <line x1="105" y1="100" x2="115" y2="100"/>
    <line x1="225" y1="100" x2="235" y2="100"/>
    <line x1="345" y1="100" x2="355" y2="100"/>
    <line x1="465" y1="100" x2="478" y2="100"/>
  </g>
  <defs>
    <marker id="arr6" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="170" y="35" fill="var(--accent-line)" text-anchor="middle" font-size="10">XDP can DROP/PASS/REDIRECT/TX zde</text>
</svg>
:::

### XDP actions

eBPF program vrací jednu z:

| Action | Význam |
| :--- | :--- |
| `XDP_PASS` | předej standardnímu kernel stacku (default) |
| `XDP_DROP` | zahoď paket *okamžitě* (DDoS mitigation) |
| `XDP_TX` | pošli paket zpět *na stejný interface* (load balancer return) |
| `XDP_REDIRECT` | pošli na jiné rozhraní (forwarding, AF_XDP) |
| `XDP_ABORTED` | error (verifier nebo runtime); log + drop |

### Modes

- **XDP native** — driver volá XDP před alokací sk_buff. *Nejrychlejší* (~24 Mpps drop / core), vyžaduje driver support (ixgbe, mlx5, i40e, bnxt, virtio, …).
- **XDP generic** — kernel volá XDP *po* alokaci sk_buff. *Pomalejší* (~5 Mpps), funguje s libovolným NIC.
- **XDP offload** — *NIC sama* spouští eBPF (Netronome smart NIC, Nvidia BlueField). *Nejrychlejší* (line rate). Vzácné.

### Příklad — drop DDoS

```c
SEC("xdp")
int drop_udp(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;

    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end) return XDP_PASS;
    if (eth->h_proto != htons(ETH_P_IP)) return XDP_PASS;

    struct iphdr *ip = (void *)(eth + 1);
    if ((void *)(ip + 1) > data_end) return XDP_PASS;

    if (ip->protocol == IPPROTO_UDP) return XDP_DROP;  // smaž UDP

    return XDP_PASS;
}
```

Kompiluje se přes LLVM clang `-target bpf`, loaduje `bpftool prog load`, attachuje `ip link set dev eth0 xdp obj drop_udp.o`.

Drop *přímo* v NIC driveru — paket nikdy nedosáhne sk_buff alokaci. Cena drop: ~10 CPU cycles. Při DDoS 50 Mpps SYN flood — XDP zvládne s jediným jádrem.

## Reálné use-cases {tier=practice}

### DDoS mitigation — Cloudflare

Cloudflare publikoval [open-source XDP rules](https://github.com/cloudflare/xdpcap) pro DDoS. Když Cloudflare detekuje atypický traffic pattern, *vygeneruje* eBPF program, deployuje XDP-ně do edge routers — *miliony PPS* DDoS provoz se odfiltruje *bez* CPU spotřeby.

### Load balancing — Facebook Katran

[Katran](https://github.com/facebookincubator/katran) — Layer 4 load balancer Facebook produkce. XDP program klasifikuje paket, vybere backend (consistent hashing), přepíše destination (IP-in-IP encap), `XDP_TX` zpět. Vše v 10 μs.

### Kubernetes networking — Cilium

[Cilium](https://cilium.io/) nahrazuje `iptables`-based Kubernetes networking eBPF programy. Per-pod policies, observability, encryption — vše implementováno v eBPF. Performance: 5–10× rychlejší než iptables-based kube-proxy.

### Network observability — Pixie, Grafana Beyla

eBPF programy attachované k socket events extracují HTTP/SQL/gRPC metadata *bez* changes aplikací. Continuous profiling.

## AF_XDP socket

[AF_XDP socket family](https://www.kernel.org/doc/html/latest/networking/af_xdp.html) (Linux 4.18+) — *user-space program* otevře socket `AF_XDP`. XDP program v kernelu `XDP_REDIRECT` paket do user-space ringu. *Zero-copy* mezi NIC, kernel a user space.

Performance: ~20 Mpps / core (blíže DPDK). Výhoda: kernel coexistence — můžete mít *část* trafficu XDP-redirect a *zbytek* normálním kernel stack.

## Comparison

| Technologie | Throughput / core | Flexibilita | Kernel coexistence |
| :--- | :---: | :---: | :---: |
| Stock kernel | 0.5–1 Mpps | high (whole stack) | ✓ |
| Stock + NAPI/RSS | 1–2 Mpps | high | ✓ |
| XDP generic | ~5 Mpps | medium | ✓ |
| XDP native | ~24 Mpps | medium | ✓ |
| AF_XDP zero-copy | ~20 Mpps | medium | ✓ |
| DPDK | 30+ Mpps | low (reimplement) | ✗ |
| Hardware ASIC | line rate | very low | n/a |

## Trend

V 2026 je eBPF *most exciting* oblast Linux kernel development. Nasazování:

- **Datacenter** — Cilium, Calico (BGP-on-eBPF), Hubble (observability).
- **Cloud edge** — Cloudflare, Meta, Netflix vlastní eBPF DDoS / LB.
- **Security** — Falco, Tetragon (Cilium product).
- **Telco** — některé NFV produkty migrují z DPDK na AF_XDP.

DPDK *neumírá* — pro maximální packet rate stále nejrychlejší. Ale **eBPF/XDP** převzala těžiště *general-purpose* fast networking.

## Shrnutí kapitoly

Prošli jsme:

1. **Limity Ethernetu** ([[zpracovani-uvod]]) — packet rate ≠ bit rate, 64 B paketové minimum.
2. **Linux kernel stack** ([[linux-kernel-stack]]) — sk_buff, net_device, netfilter hooky.
3. **Stock optimalizace** ([[napi-rss-offload]]) — NAPI, RSS, GSO/GRO, checksum offload.
4. **Kernel bypass** ([[dpdk-pfring]]) — DPDK, PF_RING; trade speed for functionality.
5. **eBPF / XDP** (tato) — programmable kernel; speed + coexistence.

Klíčová lekce: *jedno řešení neřeší všechno*. Volíte trade-off mezi **rychlostí**, **funkcionalitou** a **integrací s ekosystémem**.

Tím se uzavírá PDS sled o **infrastructure a hardware** routery/switche/SDN. Příští přednášky (a poslední kapitola kurzu) jsou o **SDN a programmable networking** ([[sdn-uvod]]) — kde se to vše propojuje do *centralizované* control-plane filosofie.

---

*Zdroj: PDS přednáška 9 (Zpracování paketů), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [eBPF.io](https://ebpf.io/); Høiland-Jørgensen, T. et al.: „The eXpress data path: fast programmable packet processing in the operating system kernel" (ACM CoNEXT 2018, [DOI 10.1145/3281411.3281443](https://doi.org/10.1145/3281411.3281443)); [Cilium documentation](https://docs.cilium.io/); [Facebook Engineering — Katran](https://engineering.fb.com/2018/05/22/open-source/open-sourcing-katran-a-scalable-network-load-balancer/); McCanne, S., Jacobson, V.: „The BSD packet filter" (USENIX 1993); [LWN — eBPF in-depth articles](https://lwn.net/Kernel/Index/#Berkeley_Packet_Filter).*
