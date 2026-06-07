---
title: Intel UPI, AMD Infinity Fabric a propojení mezi sockety
---

# Propojení mezi sockety (inter-socket interconnect) — Intel UPI, AMD Infinity Fabric

Víceprocesorové (multi-socket) servery potřebují *fyzickou* sběrnici mezi jednotlivými sockety. U Intelu vedla cesta od **QPI** (Quick Path Interconnect, 2008) k **UPI** (Ultra Path Interconnect, 2017). U AMD od **HyperTransportu** (2003) k **Infinity Fabricu** (2017).

Klíčové funkce tohoto propojení:

- Provoz spojený s koherencí mezi sockety (cross-socket coherence traffic).
- Přístup do vzdálené paměti (remote memory access).
- Vstupně-výstupní provoz (I/O traffic) — kořeny PCIe (PCIe roots) bývají typicky umístěny jen na jednom socketu.

## Intel QPI (Quick Path Interconnect, 2008)

První propojení Intelu typu bod-bod (point-to-point) mezi sockety, použité od architektury Nehalem (2008). Nahradilo sběrnici FSB (Front-Side Bus), která byla sdílená a tím pádem trpěla soupeřením o přístup (contention).

Specifikace:

- 6,4 GT/s (gigatransferů za sekundu), 20 linek → ~25,6 GB/s obousměrně (~12,8 GB/s v jednom směru).
- Latence ~50 ns přes 1 skok (hop).
- Protokol koherence: MESIF na lince.

Topologie: úplná mřížka (full mesh) až do 4 socketů. Pro 8 socketů: hybridní mřížka s routováním.

## Intel UPI (Ultra Path Interconnect, 2017)

Nahradilo QPI s architekturou Skylake-SP. Přineslo vyšší frekvenci, nižší spotřebu a lepší protokol.

Specifikace:

- 10,4 GT/s → ~41,6 GB/s obousměrně (~20,8 GB/s v jednom směru, šířka linky 20).
- Latence ~60–80 ns.
- Až 3 UPI linky na socket (Platinum), 2 (Gold), 1 (Silver).

Sapphire Rapids (2023): UPI 2.0, 16 GT/s, 64 GB/s.

### Topologie

Dvousocketová sestava: 2–3 UPI linky na plné šířce pásma.

Čtyřsocketová sestava: *úplná mřížka* (full mesh, 3 UPI na socket u řady Platinum) → každý socket je jeden skok od ostatních; levnější varianty (SKU) se 2 UPI na socket tvoří *kruh* (ring), takže protilehlé sockety dělí 2 skoky. Pro 8 socketů: hybridní mřížka s routováním.

::: svg "Intel 4-socket UPI full mesh"
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

### Koherence přes UPI

UPI implementuje protokol **MESIF** v kombinaci s adresářovým přístupem (directory-based). Příklad postupu:

1. P0 (Socket 0) chce cache line A.
2. Domovský adresář (home directory) pro Socket 0 zjistí, že A leží na Socketu 1 (jeho NUMA uzel).
3. P0 → zpráva po UPI → domovský uzel Socketu 1.
4. Adresář Socketu 1 zjišťuje, kdo má kopii. Pokud ji má P2 (Socket 2) ve stavu dirty (znečištěná, tj. změněná) → požadavek je přeposlán (forward) přes UPI.
5. P2 pošle data → P0 a zároveň proběhne zpětný zápis do paměti (write-back).

U více skoků se latence sčítá. Data přes sockety stojí ~200 cyklů.

## AMD Infinity Fabric

Procesory AMD EPYC postavené z chipletů (Zen+, Zen 2, Zen 3, Zen 4) používají **Infinity Fabric** pro *vše*:

- Mezi chiplety (uvnitř socketu): CCD ↔ IO die.
- Mezi sockety: socket ↔ socket (přes IO die).
- Mezi GPU (u akcelerátorů AMD Instinct).

Jde o jeden sjednocený protokol sběrnice — neexistuje tedy oddělená sběrnice zvlášť pro I/O, zvlášť pro koherenci a zvlášť pro GPU.

Specifikace:

- IF 1 (Zen 1, 2017): 38,4 GB/s na linku.
- IF 2 (Zen 2/3, 2019–20): 50 GB/s.
- IF 3 (Zen 4, 2022): 96 GB/s.

### Architektura chipletů

EPYC 9654 (Zen 4, 2022) — 96 jader:

- 12 CCD (po 8 jádrech).
- 1 I/O die (12 kanálů DDR5, 128 linek PCIe Gen5).
- Infinity Fabric mezi každým CCD ↔ IO die.

Topologie: každý CCD má pevně danou šířku pásma k IO die. Přístup do paměti vede *vždy* přes IO die (samotný CCD nemá vlastní paměťový řadič, memory controller).

⇒ Návrh AMD má díky tomu *jednotnou* latenci přístupu do paměti napříč chiplety — což je výhoda pro programovatelnost vzhledem k NUMA.

### Režimy NUMA

EPYC umožňuje nastavení v BIOSu (NPS — NUMA Per Socket):

- **NPS1** — 1 NUMA uzel pro celý socket. Vhodné pro úlohy, kde všechna jádra sdílejí vše (share-everything).
- **NPS2** — 2 NUMA uzly. Lokální paměť tvoří každému polovinu.
- **NPS4** — 4 NUMA uzly. Nejjemnější granularita.

Pro HPC se typicky volí NPS4. Pro databáze (kde se data sdílejí napříč jádry) spíše NPS1.

## Omezení šířky pásma mezi sockety

Intel Xeon Gold (Skylake-SP, dvousocketový):

- Šířka pásma DRAM na jeden socket: ~100 GB/s.
- UPI mezi sockety: 41 GB/s na linku, 3 linky = 123 GB/s souhrnně.

U aplikací omezených pamětí (memory-bound) na 2 socketech platí 2× škálování šířky pásma *jen tehdy*, když se data vejdou *do každého socketu samostatně* (tedy při NUMA-aware přístupu). Pokud jsou data *velká* a každý procesor sahá *všude* → propojení UPI mezi sockety se stane úzkým hrdlem (bottleneck) a škálování klesne pod 1,5×.

## Topologie reálného clusteru

HPC uzel v datacentru:

- 2 sockety × 28 jader = celkem 56 jader.
- Uvnitř uzlu: UPI / IF mezi sockety.
- Uvnitř socketu: mřížka (mesh) / chipletové IF.
- Mezi uzly: InfiniBand (200 Gbit/s) nebo RoCE.

Hierarchie latencí:

| Skok | Latence |
| :--- | :---: |
| L1, totéž jádro | 1 ns |
| L3, tentýž socket | 15 ns |
| L3, vzdálený socket (UPI/IF) | 100 ns |
| RDMA InfiniBand | 1 μs |
| Internet | 10+ ms |

Každá vrstva je 10–1000× *pomalejší*. Algoritmy se proto přizpůsobují topologii.

## Foreshadow a bezpečnost NUMA

Útoky napříč sockety — *spekulativní postranní kanál* (speculative side-channel) může unést data napříč sockety prostřednictvím provozu pro koherenci cache.

Foreshadow-NG (2018) ukazuje, že enklávy SGX (SGX enclaves) lze kompromitovat právě přes provoz pro koherenci.

Obrana (mitigation): hardwarové záplaty (patches) + mikrokód (microcode) + pečlivé rozdělení úloh (workload partitioning).

## Cluster-on-die a budoucnost

Trend směřuje k *většímu počtu malých chipletů* propojených rychlou fabric. Chipletový návrh AMD EPYC je *předchůdcem* takzvaně rozloženého (disaggregated) procesoru.

Intel od Sapphire Rapids (2023) → návrh založený na chipletech (XCC dies + I/O dies).

Budoucnost (CXL — Compute Express Link 3.0, 2023+): koherentní paměť přes linky podobné PCIe. Sdílený paměťový fond (memory pool) napříč více hostiteli. *Koherence napříč* celým serverem.

## Co dál

Okruh 9 končí. Okruh 10 ([[spotreba-pcv2f]]) přechází ke *spotřebě* — což je zásadní omezení pro každý další návrh. Poté [[gpu-architektura]] uzavře téma jako *jiné* paradigma — SIMT, mnoho jader, optimalizováno pro propustnost (throughput).

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: [Intel® Ultra Path Interconnect](https://www.intel.com/content/www/us/en/products/docs/processors/xeon/scalable/upi-data-sheet-vol1.html); [AMD Infinity Architecture](https://www.amd.com/en/technologies/infinity-architecture.html); Mukherjee, S.S. et al.: „The Alpha 21364 Network Architecture" (IEEE Micro 22(1), 2002); Singh, A. et al.: „Memory Coherence in CXL" (HotChips 2022).*
