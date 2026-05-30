---
title: VLIW, RISC-V, ARM big.LITTLE
---

# Nízkopříkonové architektury — VLIW, RISC-V, ARM big.LITTLE

OoO superskalár x86 ([[ilp-superskalar]]) je *power hungry* — 50-100 W per chip. Pro mobile / embedded / IoT to není akceptovatelné. Alternativní architektury *zjednodušují* HW (VLIW), *modularizují* (RISC-V), nebo *heterogenizují* (big.LITTLE).

## VLIW — Very Long Instruction Word

Princip: *kompilátor* sestaví *paket* instrukcí, *všechny* běží paralelně v 1 cyklu. Bez OoO, bez dynamic scheduling.

```
VLIW instruction (256 bits = 4 × 64-bit slots):
| slot 0    | slot 1     | slot 2    | slot 3   |
| add r1,r2 | mul r3,r4  | load r5   | store r6 |
```

CPU prostě vykoná všechny 4 paralelně. Hardware: trivial — žádný scoreboard, žádné rezervační stanice.

**Kompilátor je odpovědný za**:

- Detection paralelismu (statický ILP).
- Scheduling (ensure no RAW within bundle).
- Padding (NOP pokud nemůže najít 4 nezávislé).

### Výhody

- **Jednoduchá HW** — bez OoO logic. Lower power.
- **Predictable performance** — žádný runtime variation.
- **Compiler vidí celý program** — může lépe optimize than runtime HW.

### Nevýhody

- **Compiler must be excellent** — pokud najde málo paralelismu, IPC < m.
- **Code bloat** — NOPs vyplňují bundle slots.
- **ISA inflexibilní** — change FU count = change ISA.
- **No runtime adaptation** — cache miss zhroutí scheduling.

### Příklady

- **Itanium (Intel + HP, 2001)** — major commercial flop. Compiler nezvládl predict cache misses.
- **TI C6x DSP** — successful in signal processing (predictable, no caches).
- **NVIDIA Tegra DSP**, Qualcomm Hexagon — DSP cores in mobile chips.
- **Transmeta Crusoe** — x86 to VLIW translation, low-power x86 (2000).

Itanium failure killed VLIW as mainstream. DSP and accelerators still use it.

## RISC-V — Open ISA

RISC-V (Berkeley, 2010) — open-source ISA. Modular: base + extensions.

Base ISA (RV32I): ~47 instructions. Minimal. (RV64I rozšiřuje o *W word instrukce + LD/LWU/SD.)

Extensions:

- **M** — multiplication, division.
- **A** — atomic (LR/SC).
- **F, D** — floating-point single/double.
- **C** — compressed (16-bit RVC).
- **V** — vector ([[vektorove-cpu]]).
- **B** — bit manipulation.

Profile (RV64GC = I+M+A+F+D+C) = mainstream "Linux RISC-V" chip.

### Výhody

- **No license fees** — open standard, free implementation.
- **Modular** — only include needed extensions. Save area, power.
- **Customizable** — domain-specific extensions (AI, crypto).
- **Verifiable** — formal proofs of correctness possible.

### Nevýhody

- **Fragmented ecosystem** — different chips support different extensions.
- **Tools immature compared to x86/ARM** — better every year.
- **Less optimized commercial cores** — yet.

### Implementations

- **SiFive U7, P670** — high-end multicore, Linux-class.
- **ALI T-Head C910** — server-class.
- **Sophon SG2042** — 64-core RISC-V server CPU (2023).

RISC-V power efficiency *similar to ARM* — both clean RISC ISAs.

## ARM ISA

ARM dominantní v mobile/embedded/server (cloud servers s Graviton/Ampere).

Klíčové vlastnosti:

- **Multiple instruction encodings** — 16-bit Thumb + 32-bit ARM (A32) + 64-bit ARMv8 (A64) ISAs (variable-length encoding for code density).
- **Conditional execution** — every instruction can be conditional (saves branches).
- **Powerful addressing modes** — load/store offset, pre/post-increment.

### big.LITTLE

ARM IP koncept (2011): *heterogeneous* cores na *one* SoC.

- **big** (Cortex-A78, X2) — high-perf OoO, ~5 W per core at peak.
- **LITTLE** (Cortex-A510) — small in-order, ~0.5 W per core.

OS scheduler:

- *Background tasks* → LITTLE.
- *Latency-sensitive* (UI, app launch) → big.

Mobile chips (Snapdragon, Mediatek Dimensity): 4 big + 4 LITTLE typical.

Apple M1: 4 P-cores + 4 E-cores (Apple's terminology pro big.LITTLE).

### big.LITTLE benefit

Per Apple's measurement:

- LITTLE core perf: ~⅓ of big.
- LITTLE core power: ~⅒ of big.

Background loads (notifications, sync, monitoring) run on LITTLE → save 90 % power vs running on big.

For active workloads (game, video): big handles them. Total system stays cool.

⇒ **Mobile battery life 2× lepší** než pure big-only design.

## Apple M-series

Apple silicon (M1 → M3, 2020-2023):

- 4-12 P-cores (Firestorm / Avalanche / Everest) + 2-8 E-cores (Icestorm / Blizzard / Sawtooth).
- Shared LLC (M1 P-cluster: 12 MB).
- Unified memory architecture (CPU+GPU+NE share LPDDR memory pool).
- Built-in neural engine, video encode/decode.

Power efficiency: ~3× better than Intel x86 at equivalent perf. Reasons:

- TSMC 5 nm process (vs Intel 7-10 nm).
- big.LITTLE.
- Wide single-threaded design — fewer high-frequency clocks.
- Custom ASICs for video, ML offload.

M-series proved that **ARM can replace x86** for laptops/desktops if power-efficiency is priority.

## Intel Alder Lake (P + E cores)

2021: Intel přijal big.LITTLE pattern.

- **P-cores** (Golden Cove) — OoO, AVX-512, 8-wide.
- **E-cores** (Gracemont) — smaller OoO, 4-wide, no AVX-512.

Hybrid scheduling — Intel Thread Director hardware tells OS which thread should go where.

Trade-off: AVX-512 *only* on P-cores. Linux schedulers must avoid AVX-512 threads on E-cores → migration overhead.

## RISC vs CISC v context

Klasický debate (1980s): RISC (simple instructions, fast pipeline) vs CISC (complex instructions, fewer in code).

Real-world: x86 = CISC architecture *with* RISC-like microarchitecture (decode CISC → μops → run RISC-style pipeline). All modern x86 effectively RISC inside.

⇒ ISA matters less than implementation. Power efficiency comes from microarchitecture choices, not RISC vs CISC.

## Dark silicon

Esmaeilzadeh et al. 2011: at 8nm process, only ~50 % of chip can be *powered* simultaneously (TDP limit). Rest must be *dark* (off).

Implications:

- Specialized accelerators (ML, codec, crypto) — turn on *when needed*, off otherwise.
- Heterogeneous cores — only some types on at a time.
- *Cores* are increasingly *fixed-function* (not general-purpose).

Apple Silicon embodies this: NPU (neural engine), GPU, Video codec, Image signal processor — all specialized.

x86 + AVX-512: 1 part of chip for AVX-512, mostly idle.

⇒ Dark silicon drives architectural specialization.

## Pareto frontier

For each architecture, plot (performance, power) — Pareto frontier shows best designs.

Vyobrazení (přibližně):

- **x86 desktop** — high perf, high power.
- **ARM mobile** — moderate perf, low power.
- **RISC-V embedded** — variable, customizable.
- **Apple M-series** — high perf + moderate power (current best).
- **GPGPU** — extreme throughput, but limited to data-parallel workloads.

No single architecture dominates *all* points. Each occupies its niche.

## Co dál

[[gpu-architektura]] popisuje *jinou* paradigma — GPGPU SIMT. Throughput-oriented, ne latency. Bývalý graphics accelerator → general compute platform (ML, HPC). [[cuda-divergence-occupancy]] uzavře praktickou stránku.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §1.5 + §A.4; Asanović, K., Patterson, D.A.: „Instruction Sets Should Be Free: The Case for RISC-V" (UCB/EECS-2014-146); Esmaeilzadeh, H. et al.: „Dark Silicon and the End of Multicore Scaling" (ISCA 2011); [ARM big.LITTLE Whitepaper](https://www.arm.com/why-arm/technologies/big-little).*
