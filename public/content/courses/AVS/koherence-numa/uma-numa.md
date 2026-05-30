---
title: UMA vs NUMA — paměťová topologie
---

# UMA vs NUMA — paměťová topologie a její dopady

UMA (Uniform Memory Access) — všechna jádra přistupují k paměti *stejně rychle*. NUMA (Non-Uniform Memory Access) — *vzdálenost* matter, *lokální* memory rychlá, *vzdálená* drahá.

Moderní multi-socket servery jsou *vždy* NUMA. Single-socket multi-core mohou být UMA (pro ~16 cores) nebo "fake NUMA" (jeden socket s mesh, latence varies).

## UMA — Uniform Memory Access

Všechna jádra mají *stejnou* latenci k *jakékoli* memory location. Implementace:

- **Bus-based** — všichni sdílí sběrnici. Limit ~4-8 jader.
- **Crossbar** — paralelní přenosy mezi N CPUs a M memory banks. Limit ~16 jader.
- **Mesh** — 2D mřížka uvnitř single socketu. Intel Knights Landing, Skylake-SP, Sapphire Rapids. Latence mezi tiles různá, *ale* celkové memory access *přibližně* uniformní díky distribuované LLC.

Termín UMA = single-socket multi-core. *Většina* dnešních CPU od ~16 jader nad je *technically* NUMA-like uvnitř (mesh), ale OS to často hlásí jako UMA.

## NUMA — Non-Uniform Memory Access

Více **NUMA nodes**, každý má:

- Vlastní CPU(s) + cache hierarchii.
- Vlastní *lokální* memory + DRAM controller.
- Inter-node fabric (QPI, UPI, Infinity Fabric) pro cross-node access.

::: svg "Dvou-socket NUMA topology"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="30" width="200" height="120" rx="4"/>
    <rect x="320" y="30" width="200" height="120" rx="4"/>
  </g>
  <g fill="var(--text)" font-weight="600">
    <text x="120" y="50" text-anchor="middle">NUMA Node 0 (Socket 0)</text>
    <text x="420" y="50" text-anchor="middle">NUMA Node 1 (Socket 1)</text>
  </g>
  <g fill="var(--bg-card)" stroke="var(--line)">
    <rect x="40" y="60" width="60" height="30" rx="2"/>
    <rect x="105" y="60" width="60" height="30" rx="2"/>
    <rect x="170" y="60" width="40" height="30" rx="2"/>
    <rect x="340" y="60" width="60" height="30" rx="2"/>
    <rect x="405" y="60" width="60" height="30" rx="2"/>
    <rect x="470" y="60" width="40" height="30" rx="2"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="70" y="78">Core 0-3</text>
    <text x="135" y="78">Core 4-7</text>
    <text x="190" y="78">L3</text>
    <text x="370" y="78">Core 0-3</text>
    <text x="435" y="78">Core 4-7</text>
    <text x="490" y="78">L3</text>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="40" y="100" width="170" height="35" rx="2"/>
    <rect x="340" y="100" width="170" height="35" rx="2"/>
  </g>
  <text x="125" y="122" text-anchor="middle" fill="var(--text)" font-weight="600">Local DRAM (256 GB)</text>
  <text x="425" y="122" text-anchor="middle" fill="var(--text)" font-weight="600">Local DRAM (256 GB)</text>
  <g stroke="var(--accent-line)" stroke-width="2.5" fill="none">
    <line x1="220" y1="90" x2="320" y2="90"/>
  </g>
  <text x="270" y="80" text-anchor="middle" fill="var(--accent-line)" font-weight="600">QPI / UPI / Infinity Fabric</text>
  <text x="270" y="105" text-anchor="middle" fill="var(--text-muted)" font-size="9">~50 GB/s, 100 cyklů latence</text>
  <text x="270" y="180" text-anchor="middle" fill="var(--text-faint)" font-size="9">Local: ~80 cyklů. Remote: ~200 cyklů (2-3× slower).</text>
  <text x="270" y="200" text-anchor="middle" fill="var(--text-faint)" font-size="9">Pinning vláken a alokace dat lokálně je klíčové pro výkon.</text>
</svg>
:::

### Latence

Reálné měření (Intel Xeon Gold dual-socket):

| Access | Latence | Bandwidth |
| :--- | :---: | :---: |
| L1 hit | 4 cyklů | 1 TB/s |
| L2 hit | 12 | 500 GB/s |
| L3 hit (local) | 35 | 200 GB/s |
| Local DRAM | 80-100 cyklů | 100 GB/s |
| L3 hit (remote socket) | 100-150 | 60 GB/s |
| Remote DRAM | 200-300 | 50 GB/s |

⇒ Remote DRAM **2-3× pomalejší** než local. Pro memory-bound zátěž to znamená 2-3× propad výkonu.

::: viz numa-latency-map "Přepni thread/page mezi NUMA 0 a NUMA 1. Lokální = 80 ns, remote (cross UPI) = 200 ns. Bandwidth bar ukazuje propad ~40 %."
:::

## OS support — first-touch policy

Linux (od ~2.6) používá **first-touch**: stránka alokovaná na *NUMA node thread that first writes to it*.

```c
float *a = malloc(N * sizeof(float));   // virtual mapping only

#pragma omp parallel for num_threads(8)
for (int i = 0; i < N; i++)
    a[i] = 0.0;             // first touch — pages allocated locally
```

OpenMP `parallel for` rozdělí iterace mezi jádra → každé jádro dostane *kus* paměti lokálně. Subsequent access fast.

### Bad pattern: single-thread init

```c
float *a = malloc(N * sizeof(float));
for (int i = 0; i < N; i++) a[i] = 0.0;     // single thread, all pages on local NUMA

#pragma omp parallel for
for (int i = 0; i < N; i++) a[i] = compute(i);   // threads on multiple NUMA, but all data on 1 NUMA
```

Vlákna na NUMA 1 musí *přes fabric* sahat na NUMA 0. *3× pomalejší*.

Fix: paralelní init (jak first example).

## NUMA-aware tools

### numactl

```bash
numactl --hardware              # show NUMA topology
numactl --cpunodebind=0 --membind=0 ./app  # pin to NUMA 0
numactl --interleave=all ./app             # interleave pages across NUMA
```

`--interleave=all` round-robins stránky mezi NUMA nodes. Užitečné pro *jeden* dataset přístupán všemi.

### numastat

```bash
numastat -p <PID>
```

Ukáže *kolik* paměti procesu je na *které* NUMA node. *Numa_hit* = local, *numa_miss* = remote.

Cíl: minimize numa_miss.

### Affinity (OpenMP)

```bash
OMP_PLACES=cores OMP_PROC_BIND=close ./app   # pin threads to cores in NUMA order
```

`OMP_PROC_BIND=close` → vlákna na *sousední* cores. `spread` → *rozprostře* mezi NUMA.

Pro NUMA-aware OpenMP code: `close` typicky lepší (cache lokalita), `spread` pro memory-bound (more bandwidth).

## NUMA balancing

Linux 3.8+: **auto-numa-balancing**. Kernel sleduje, *odkud* běžící vlákno přistupuje k paměti. Pokud large fraction remote → *migrate pages* k local NUMA.

```bash
echo 1 > /proc/sys/kernel/numa_balancing
```

Defaultně zapnuto. Pro most workloads helpful. Pro extreme HPC sometimes turn off pro determinism.

## Cluster on die (Intel)

Intel Skylake-SP nabízí **Sub-NUMA Clustering (SNC)** — single socket *logicky* rozdělit na 2 NUMA nodes (Cluster 0, Cluster 1).

- Pro: lower intra-cluster latence (mesh traversal menší).
- Proti: rozděluje L3 — half capacity per cluster. OS musí být NUMA-aware (uvnitř single sockety).

Pro typical HPC: SNC zapnutý → 5-15 % gain.

## AMD Chiplet topology

AMD EPYC (Zen+ → Zen 4) má **chiplet design**:

- 1 CPU socket = až 12 *chiplets* (CCDs — Core Complex Die).
- Každý chiplet = 8 cores + L3.
- Chiplets propojeny *přes IO die* (Infinity Fabric).

Z OS pohledu: 96-core EPYC 9654 = 12 CCDs (8 cores each); přes BIOS lze socket nastavit jako 1 NUMA (NPS1, UMA mode), 2 NUMA (NPS2), nebo 4 NUMA (NPS4 mode).

Trade-off: NPS4 (4 NUMA) má nejlepší per-chiplet/per-quadrant bandwidth, NPS1 (1 NUMA) nejlepší sdílení napříč chiplety.

## NUMA awareness v aplikacích

| Aplikace | Strategie |
| :--- | :--- |
| HPC (matrix multiply, FFT) | parallel init + close binding |
| Databáze (large in-memory) | interleave + numa migration |
| ML training | per-GPU data shard, NUMA-local |
| Web server | per-thread state, NUMA-local |

Pro low-latency: ne *jen* NUMA local, ale **CPU pinning** k specifickému core. To eliminuje migration jitter.

## Co dál

[[intel-amd-fabric]] popisuje konkrétní fabric implementace — Intel UPI/QPI, AMD Infinity Fabric. Pak Topic 10 přechází k *spotřebě CPU* a *GPGPU*.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §5.4; Lameter, C.: „NUMA (Non-Uniform Memory Access): An Overview" (ACM Queue 11(7), 2013, [DOI 10.1145/2508834.2513149](https://doi.org/10.1145/2508834.2513149)); [Linux NUMA docs](https://www.kernel.org/doc/html/latest/admin-guide/numastat.html); [Intel® Memory Latency Checker](https://www.intel.com/content/www/us/en/developer/articles/tool/intelr-memory-latency-checker.html).*
