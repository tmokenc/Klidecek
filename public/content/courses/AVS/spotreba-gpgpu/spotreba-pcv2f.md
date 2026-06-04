---
title: Spotřeba procesoru — P = CV²f
---

# Spotřeba CPU — dynamická vs statická, P = CV²f

Příkon je *druhý* fundamental constraint vedle performance. Moderní CPU je *power-limited*: nelze přidat víc jader nebo zvýšit frekvenci, *aniž* by chip nevyhořel. Power-aware design je *nezbytný* od ~2005 (Dennard scaling stagnace).

## Tři složky příkonu

Celkový ztrátový výkon tranzistoru:

$$
P_{\text{device}} = \frac{1}{2} C V_{DD} V_{\text{swing}} \alpha f + I_{\text{leakage}} V_{DD} + I_{SC} V_{DD}
$$

- **Přepínací (dynamic, switching)**: $P_{\text{sw}} = \frac{1}{2} C V_{DD} V_{\text{swing}} \alpha f$. Dominantní pro starší technologii (>90 nm).
- **Klidový proud (leakage / static)**: $P_{\text{leak}} = I_{\text{leakage}} V_{DD}$. Roste s teplotou, klesající rozměry transistorů.
- **Zkratový proud (short-circuit)**: $P_{SC} = I_{SC} V_{DD}$. Krátký okamžik, kdy *oba* PMOS+NMOS otevřené při přepínání. Méně významné s nižším $V_{DD}$.

Pro typický 7 nm chip: ~60 % switching, 35 % leakage, 5 % short-circuit. Pro 5 nm: leakage roste — některé designs leakage > switching.

## Zjednodušená formule

Často uváděná podoba:

$$
P_{\text{dyn}} = \alpha \cdot C \cdot V^2 \cdot f
$$

- $\alpha$ — *activity factor* (0–1). Kolik bitů přepíná každý cyklus. Idle ALU: 0.05. Hot loop: 0.5.
- $C$ — kapacitance.
- $V$ — napětí.
- $f$ — frekvence.

Klíčové insights:

- **Dvojnásobná frekvence → 2× power.**
- **Dvojnásobné napětí → 4× power.**
- Plus *vyšší* napětí umožňuje *vyšší* frekvenci (rychlejší transistor switching). Combined: ~8× power for ~2× perf. *Špatný trade-off*.

## Power vs Performance

Pro určitou architekturu (fixed IPC):

$$
P \propto f \cdot V^2 \propto f^3
$$

(Vyšší f vyžaduje úměrně vyšší V → kubicky power.)

To je *fundamental power-frequency wall*. Nelze přejít z 3 GHz na 6 GHz, aniž by se power 8× nezvedl. Proto je frekvence v posledních 15 letech *stagnant* — single-core ~3-5 GHz, dál se neposunuje.

## Energy vs Power

- **Power** [W] — *instantaneous* dissipation. Limit: chladicí systém.
- **Energy** [J] — *integral power over time*. Limit: battery, electricity bill.

$$
E = P \cdot t
$$

Pro úlohu trvající $T$ na CPU s avg power $P$: total energy $E = P \cdot T$.

### Race-to-idle

Pokud spustím úlohu na 4 GHz CPU (2× power) místo 2 GHz, *ale* skončí 2× rychleji, total energy *stejná*. Pokud po dokončení CPU může jít do *idle* (~10× nižší power), strávím *víc času* idle.

⇒ **Race-to-idle wins** when idle power << active power.

Apple M1 strategy: *velmi rychle* dokončit task → *velmi rychle* do idle. Per-task energy lepší než competitors.

## Termodynamický limit

Landauerův princip (1961): smazat 1 bit informace = $kT \ln 2 \approx 3 \cdot 10^{-21}$ J při room temperature.

Moderní CPU žravost: 1 nJ per instrukci = $3 \cdot 10^{11} \times$ Landauer bound. Stále *daleko* od fyzikálního limitu.

Praktický limit: cooling capacity. *Air cooling* ~150 W. *Liquid* ~300 W. *Phase-change* / *immersion* ~500 W. Custom *liquid nitrogen* OC: >1 kW briefly.

Konvenční server CPU: 200-400 W TDP (Thermal Design Power). Datacenter cluster: 50-150 kW per rack.

## Power v moderním CPU

Intel Core i9-13900K (24-core Raptor Lake, 2022):

- Base: 125 W TDP.
- "Maximum Turbo" power: 253 W.
- Energy per instruction: ~3 nJ (200 W / (32 threads × 2 × 10⁹ insts/s)).

AMD Ryzen 9 7950X (16-core Zen 4): 170 W TDP, 230 W peak.

Apple M2 Max (12-core, 2023): 30 W under load. *5× lepší perf/W* než desktop x86.

## Spotřeba per část jádra

V modernu OoO jádře (Intel Skylake, simulační data):

| Komponenta | % power |
| :--- | :---: |
| L1 cache | 15 % |
| L2 cache | 10 % |
| Branch predictor | 7 % |
| Decode + rename | 12 % |
| OoO scheduler + RS + ROB | 15 % |
| Functional units (ALU, FPU) | 18 % |
| Register file | 8 % |
| Memory subsystem (L/S, MSHR) | 10 % |
| Leakage everywhere | 5 % |

OoO scheduler je *přepychový* — RS scan, dispatch, retire logic — žere 15 % power.

**Apple M-cores** šetří power tím, že OoO scheduler je *jednodušší* (in-order back-end pro některé μops) a *víc decode* (8-wide front-end vs Intel 6-wide). Other design trade-offs.

## Power knobs

Hardware může nastavit:

1. **Frekvence** — DVFS (Dynamic Voltage and Frequency Scaling). Lower f → lower P.
2. **Napětí** — vždy spolu s f (lower f umožňuje lower V).
3. **Activity (clock gating)** — turn off clock to idle ALU.
4. **Power gating** — *kompletně* odpojit napájení neaktivních blocks.
5. **C-states** (CPU sleep) — řízeno OS.

Detaily v [[dvfs-power-mgmt]].

## Power-aware programming

Programátor může ovlivnit:

- **Sleep when idle** — `sleep()`, `cv_wait()` lépe než spin-loop.
- **Batch IO** — buffer write/read, fewer expensive transitions.
- **Vector instructions** — *více práce* per instruction → *fewer* instructions → lower power.
- **Cache-friendly access** — fewer DRAM accesses (DRAM 100× power per access vs L1).

⇒ Performance-aware = power-aware. Optimization that reduces time *and* reduces energy.

Anomalie: AVX-512 *žere* power (wider ALU, higher activity). Some CPUs *automatically* reduce frequency when AVX-512 used → less benefit than expected. Sapphire Rapids (2023) mitigates this.

## Reálné cost data {tier=practice}

Single 250 W CPU running 24/7:

- Daily: 250 W × 24 h = 6 kWh
- Annual: 2200 kWh

At average commercial electricity rate $0.10/kWh: **$220 per CPU per year** just for power. *Plus* cooling overhead (~50 % more = $330).

Datacenter with 10,000 servers: $3.3M/year in electricity. Compute costs are *substantial part of TCO*.

## Co dál

[[dvfs-power-mgmt]] popisuje *jak* CPU runtime mění frekvenci a napětí — DVFS, clock gating, C-states. [[nizkoprikon-arch]] popisuje *architektury* designované od nuly pro low power — VLIW, ARM big.LITTLE, RISC-V embedded.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §1.5; Dennard, R.H. et al.: „Design of Ion-Implanted MOSFET's with Very Small Physical Dimensions" (IEEE JSSC SC-9(5), 1974); Esmaeilzadeh, H. et al.: „Dark Silicon and the End of Multicore Scaling" (ISCA 2011, [DOI 10.1145/2024723.2000108](https://doi.org/10.1145/2024723.2000108)).*
