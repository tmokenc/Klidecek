---
title: Intel UPI, AMD Infinity Fabric a inter-socket interconnect
---

# Inter-socket interconnect — Intel UPI, AMD Infinity Fabric

Multi-socket servery potřebují *fyzickou* sběrnici mezi sockety. Intel: **QPI** (Quick Path Interconnect, 2008) → **UPI** (Ultra Path Interconnect, 2017). AMD: **HyperTransport** (2003) → **Infinity Fabric** (2017).

Klíčové funkce:

- Cross-socket coherence traffic.
- Remote memory access.
- I/O traffic (PCIe roots are typically on one socket).

## Intel QPI (Quick Path Interconnect, 2008)

První Intel point-to-point inter-socket od Nehalem (2008). Nahradila FSB (Front-Side Bus), který byl shared a contended.

Specifications:

- 6.4 GT/s (gigatransfers/s), 20 lanes → 25 GB/s per direction.
- Latence ~50 ns přes 1 hop.
- Coherence protocol: MESIF na linku.

Topology: full mesh do 4 sockets. Pro 8 sockets: hybrid mesh + routing.

## Intel UPI (Ultra Path Interconnect, 2017)

Replaced QPI s Skylake-SP. Vyšší frequency, lower power, better protocol.

Specifications:

- 10.4 GT/s → 41.6 GB/s per direction (link width 20).
- Latence ~60-80 ns.
- Up to 3 UPI links per socket (Platinum), 2 (Gold), 1 (Silver).

Sapphire Rapids (2023): UPI 2.0, 16 GT/s, 64 GB/s.

### Topology

Dvou-socket: 2-3 UPI links full bandwidth.

Čtyř-socket: 2 UPI per socket → form *ring* (4-node), nebo *mesh* (8-node).

::: svg "Intel 4-socket UPI ring + mesh"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="60" y="40" width="80" height="50" rx="4"/>
    <rect x="400" y="40" width="80" height="50" rx="4"/>
    <rect x="60" y="120" width="80" height="50" rx="4"/>
    <rect x="400" y="120" width="80" height="50" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="100" y="62">Socket 0</text>
    <text x="440" y="62">Socket 1</text>
    <text x="100" y="142">Socket 2</text>
    <text x="440" y="142">Socket 3</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="100" y="80">28 cores</text>
    <text x="440" y="80">28 cores</text>
    <text x="100" y="160">28 cores</text>
    <text x="440" y="160">28 cores</text>
  </g>
  <g stroke="var(--accent)" stroke-width="2" fill="none">
    <line x1="140" y1="65" x2="400" y2="65"/>
    <line x1="140" y1="145" x2="400" y2="145"/>
    <line x1="100" y1="90" x2="100" y2="120"/>
    <line x1="440" y1="90" x2="440" y2="120"/>
    <line x1="140" y1="65" x2="400" y2="145"/>
    <line x1="140" y1="145" x2="400" y2="65"/>
  </g>
  <text x="270" y="55" text-anchor="middle" fill="var(--accent)" font-size="9">UPI link (40 GB/s)</text>
  <text x="270" y="195" text-anchor="middle" fill="var(--text-faint)" font-size="9">Full mesh = každý socket spojen se všemi → 1 hop max</text>
</svg>
:::

### Coherence over UPI

UPI implementuje **MESIF** + directory-based:

1. P0 (Socket 0) chce cache line A.
2. Socket 0 home directory: A je na Socket 1 (its NUMA).
3. P0 → UPI message → Socket 1 home.
4. Socket 1 directory: kdo má kopii? Pokud P2 (Socket 2) dirty → forward request přes UPI.
5. P2 sends data → P0 + memory write-back.

Multi-hop: latence sčítá. Cross-socket data ~200 cyklů.

## AMD Infinity Fabric

AMD chiplet-based EPYC (Zen+, Zen 2, Zen 3, Zen 4) používá **Infinity Fabric** pro *vše*:

- Inter-chiplet (uvnitř socket): CCD ↔ IO die.
- Inter-socket: socket ↔ socket (přes IO die).
- Inter-GPU (with AMD Instinct GPUs).

Single unified fabric protocol — žádný separate IO + coherence + GPU bus.

Specifications:

- IF 1 (Zen 1, 2017): 38.4 GB/s per link.
- IF 2 (Zen 2/3, 2019-20): 50 GB/s.
- IF 3 (Zen 4, 2022): 96 GB/s.

### Chiplet architecture

EPYC 9654 (Zen 4, 2022) — 96 cores:

- 12 CCDs (8 cores each).
- 1 I/O die (12 channel DDR5, 128 PCIe Gen5 lanes).
- IF mezi each CCD ↔ IO die.

Topology: každý CCD má fixed bandwidth k IO die. Memory access *vždy* přes IO die (CCD nemá vlastní memory controller).

⇒ AMD design má *jednotnou* memory latency napříč chiplet — bonus pro NUMA programovatelnost.

### NUMA modes

EPYC umožňuje BIOS nastavení (NPS — NUMA Per Socket):

- **NPS1** — 1 NUMA node celý socket. Best for share-everything workloads.
- **NPS2** — 2 NUMA nodes. Local memory each ½.
- **NPS4** — 4 NUMA nodes. Best granularity.

Pro HPC: NPS4 typically. Pro databases (data sharing across cores): NPS1.

## Cross-socket bandwidth limit

Intel Xeon Gold (Skylake-SP, dual-socket): 

- Per-socket DRAM bandwidth: ~100 GB/s.
- UPI cross-socket: 41 GB/s per link, 3 links = 123 GB/s aggregate.

Pro memory-bound apps na 2 sockety: bandwidth scaling 2× *jen* pokud data fits *each socket separately* (NUMA-aware). Pokud data je *velký* a každý CPU sahá *všude* → cross-socket UPI je bottleneck (less than 1.5× scaling).

## Real cluster topology

Datacentrum HPC node:

- 2 sockets × 28 cores = 56 cores total.
- Inside node: UPI / IF mezi sockets.
- Inside socket: mesh / chiplet IF.
- Inter-node: InfiniBand (200 Gbit/s) or RoCE.

Latency hierarchy:

| Hop | Latence |
| :--- | :---: |
| L1 same core | 1 ns |
| L3 same socket | 15 ns |
| L3 remote socket (UPI/IF) | 100 ns |
| RDMA InfiniBand | 1 μs |
| Internet | 10+ ms |

Each layer 10-1000× *slower*. Algoritmy adaptují podle topologie.

## Foreshadow / NUMA security

Cross-socket attacks — *spekulativní side-channel* může leak across socket via cache coherence.

Zlatozraje (Foreshadow-NG 2018) ukazuje, že enclaves SGX mohou být compromised přes coherence traffic.

Mitigation: HW patches + microcode + careful workload partitioning.

## Cluster-on-die a future

Trend: *více small chiplets* propojených fast fabric. AMD EPYC chiplet design je *předchůdce* "disaggregated" CPU.

Intel od Sapphire Rapids (2023) → chiplet-based (XCC dies + I/O dies).

Future (CXL — Compute Express Link 3.0, 2023+): coherent memory přes PCIe-like links. Multi-host shared memory pool. *Coherence napříč* serverem.

## Co dál

Topic 9 končí. Topic 10 ([[spotreba-pcv2f]]) přechází k *spotřebě* — fundamentální constraint pro každý další design. Pak [[gpu-architektura]] uzavře jako *jiná* paradigma — SIMT, mnoho jader, optimalizováno pro throughput.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: [Intel® Ultra Path Interconnect](https://www.intel.com/content/www/us/en/products/docs/processors/xeon/scalable/upi-data-sheet-vol1.html); [AMD Infinity Architecture](https://www.amd.com/en/technologies/infinity-architecture.html); Mukherjee, S.S. et al.: „The Alpha 21364 Network Architecture" (IEEE Micro 22(1), 2002); Singh, A. et al.: „Memory Coherence in CXL" (HotChips 2022).*
