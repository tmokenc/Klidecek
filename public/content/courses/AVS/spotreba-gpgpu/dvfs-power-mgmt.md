---
title: DVFS, clock/power gating, C-states
---

# DVFS a power management

CPU dynamic adjustment power consumption v reálném čase. Klíčové techniky:

- **DVFS** — Dynamic Voltage and Frequency Scaling. Tune f + V podle zátěže.
- **Clock gating** — disable clock pro idle bloky (immediate, no power saving for leakage).
- **Power gating** — disconnect power supply pro idle bloky (slow but eliminates leakage).
- **C-states** — OS-controlled CPU sleep levels.

## DVFS — frekvence + napětí škálování

Princip: $P \propto V^2 f$. Snížit f → snížit V → cubicky lower power.

Hardware Tabulka *operating points*:

| State | Frequency | Voltage | Power |
| :--- | :---: | :---: | :---: |
| P0 (turbo) | 4.5 GHz | 1.35 V | 100 W |
| P1 | 3.5 GHz | 1.1 V | 50 W |
| P2 | 2.5 GHz | 0.9 V | 25 W |
| P3 | 1.5 GHz | 0.7 V | 10 W |
| C1 (idle) | 0 | 0.6 V | 3 W |
| C6 (deep sleep) | 0 | 0 V | <0.5 W |

OS scheduler decides P-state per core podle utilization. *Lightweight* threads → low P-state. *Hot* compute → P0.

### Time to switch

P-state switch: ~10-100 μs. Není instantaneous.

⇒ Pro *very short* tasks (< 100 μs) DVFS *late* — task finished before frequency reached. Pro long-running, DVFS skvělý.

## Intel Turbo Boost

Intel Nehalem (2008): pokud *jedno* jádro plný load + ostatní idle, lze *zvýšit frekvenci* daného jádra nad nominal.

Mechanismus:

1. Sleep ostatních cores → power headroom.
2. Allocate headroom k aktivnímu core.
3. Boost f + V → up to "max turbo" (typically 1-2 GHz over base).

Limit: thermal, package power budget. CPU automatically backs off pokud temperature too high.

Použití:

- Single-thread latency-sensitive code (gaming, single-thread benchmarks).
- Burst response v server (sudden incoming request).

### AMD Precision Boost

Stejný princip pro AMD. AMD ladí algoritmus *jemněji* — frekvence per-core different, podle zátěže. Intel Boost has 2-3 levels; AMD has continuous.

## Clock gating

Když ALU idle, *clock signál* k registers se *vypne*. Tranzistory *nepřepínají* → no dynamic power.

Implementace: gating cell před clock input. AND gate with enable.

Granularita:

- **Coarse** — celé jádro (gate global clock).
- **Fine** — per FU (ALU, FPU, L/S).
- **Very fine** — per pipeline stage.

Moderní CPU: thousands of clock gates. Save 20-30 % dynamic power.

Cost: hardware overhead. Power savings dramatic.

### Pipeline gating

V *spekulativní* OoO: pokud branch misprediction, *za* mispredicted branch instrukce zbytečné. Hardware *zastaví pipeline* (gating) dokud recovery → no work, no power.

Také **throttling** — pokud temperature high, *záměrně* insert NOPs nebo gate pipeline → reduce power.

## Power gating

*Kompletně* odpojí napájení od neaktivního bloku → no leakage.

Implementace: header switches (PMOS) mezi VDD a block power rail.

Trade-offs:

- **Benefit**: leakage 0 → significant pro long idle.
- **Cost**: 
  - Wake-up latency (~1 μs to restore voltage).
  - State loss (registers reset) → must save state před gate.
  - Voltage transients při wake-up.

Granularita coarse — typically per core, per cache slice. Per-ALU gating *too fine* (latency too high).

Intel "Power gating" v Sandy Bridge+ — idle cores have power 100% gated. AMD same since Athlon X4.

## C-states (CPU sleep levels)

OS controls CPU power-down levels via C-states (Intel terminology, AMD similar):

| State | Frequency | Voltage | Wake latency | Notes |
| :--- | :---: | :---: | :---: | :--- |
| C0 | full | full | 0 | active |
| C1 (HALT) | 0 | full | ~1 μs | clock gating only |
| C1E | 0 | low | ~10 μs | + voltage drop |
| C3 | 0 | low | ~50 μs | flush L1, L2 |
| C6 | 0 | 0 | ~200 μs | flush all, power gate |
| C7 | 0 | 0 | ~500 μs | + LLC gate |
| C8-C10 | 0 | 0 | ~1 ms | + uncore gate |

OS picks C-state based on *predicted* idle time:

- Very short idle (1 μs) → C1.
- Medium (10 ms) → C3.
- Long (100 ms+) → C6 or deeper.

Wake latency matters — pokud OS *over-predikuje* idle → CPU goes too deep → *slow* response.

Linux `cpuidle` driver tunes — `intel_idle.max_cstate=3` může omezit pro latency-critical workloads.

## P-states vs C-states

- **P-states** — CPU is *active*, just slower (DVFS).
- **C-states** — CPU is *idle*, sleeping at various depths.

Při task arrival:

1. C-state wake-up (return to C0).
2. P-state ramp (frequency increase from base to turbo).

Total response time = wake-up latency + frequency ramp.

For real-time systems: keep C-state low + P-state high → predictable latency.

::: viz dvfs-pstate-cstate-timeline "Vyber strategii (race-to-idle / run-slow / balanced). Sleduj f, V a P křivky během workloadu — integrál P·dt = energie."
:::

## Thermal throttling

If temperature exceeds limit:

1. **Throttle** — insert NOPs in pipeline (reduce activity).
2. **Reduce frequency** — DVFS to lower P-state.
3. **Reduce voltage**.
4. **Park cores** — disable some.

OS sees suddenly slower performance. Workload throughput drops.

Modern CPUs have *thermal velocity boost* — Intel exposes that CPU can boost beyond Tcase briefly (until thermal capacity saturates).

## RAPL — Running Average Power Limit

Intel Sandy Bridge+ exposes power counters:

```bash
sudo perf stat -e power/energy-pkg/ ./app
```

Measure *exactly* how much energy package consumed. Useful for:

- Power-efficiency profiling.
- Energy-aware scheduling research.
- Datacenter billing per-VM energy.

AMD has equivalent. ARM has *PMU.energy* counters.

## Race-to-idle vs run-slow

Two extreme strategies:

### Race-to-idle

Run at *max* frequency to finish task ASAP → then deep C-state.

$$
E = P_{\text{high}} \cdot T_{\text{short}} + P_{\text{idle}} \cdot T_{\text{remaining}}
$$

### Run-slow

Run at *lower* frequency throughout → never enter deep sleep.

$$
E = P_{\text{low}} \cdot T_{\text{long}}
$$

Math: which wins?

Pokud $P_{\text{idle}}$ much smaller than $P_{\text{low}}$ — race-to-idle wins.

Pokud $P_{\text{idle}}$ není dramatically smaller (leakage dominates) — run-slow wins.

**For modern CPU with low-leakage process**: race-to-idle generally wins (Apple M1, mobile ARM).

**For older or high-leakage process**: run-slow may win.

## ARM big.LITTLE

Different *type* of power management — heterogeneous cores:

- **Big cores** — fast OoO, high power.
- **LITTLE cores** — small in-order, low power.

OS scheduler migrates threads:

- Light work (background, sleep) → LITTLE.
- Heavy work (game, video) → big.

Apple M1: 4 P-cores (~5 W each) + 4 E-cores (~0.5 W each). Mixed workload uses both.

Intel Alder Lake (2021) brings same to x86: P-cores + E-cores.

Detaily v [[nizkoprikon-arch]].

## Datacenter power awareness

Cloud providers measure energy per workload:

- AWS spotreba per EC2 instance reported.
- Google publishes per-DC PUE (Power Usage Effectiveness).
- Microsoft Azure carbon-aware scheduling — defer non-urgent jobs to low-carbon hours.

Energy-aware scheduling is *emerging* — picking workload-CPU pairings to minimize energy. Mostly research, some production (Google Borg).

## Co dál

[[nizkoprikon-arch]] popisuje *architectural* choices for low power: VLIW (compiler-driven, simpler HW), RISC-V (extensible, embedded), ARM big.LITTLE (heterogeneous). [[gpu-architektura]] uzavře *jinou* paradigma — throughput-optimized GPGPU.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §1.5; [Intel® RAPL Specification](https://www.intel.com/content/www/us/en/developer/articles/technical/software-security-guidance/best-practices/running-average-power-limit-energy-reporting.html); [Linux CPU Idle Governor](https://www.kernel.org/doc/html/latest/admin-guide/pm/cpuidle.html); Albers, S.: „Energy-Efficient Algorithms" (Comm. ACM 53(5), 2010).*
