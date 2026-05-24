---
title: Intel Hyper-Threading — implementace SMT
---

# Intel Hyper-Threading — konkrétní podoba SMT

**Hyper-Threading (HT)** je Intel název pro **2-way SMT**. První Intel produkt: Pentium 4 Northwood (2002). Od té doby standardní na server CPU a high-end desktop, *vynechávané* v low-end (Celeron, některé Atom). Tato sekce popisuje, *jak* HT funguje uvnitř jádra.

## Logical vs fyzické CPU

Na Intel CPU s HT:

- 1 fyzické jádro = 2 logické CPU.
- Linux: `Core(s) per socket = 4`, `Thread(s) per core = 2`. Tedy CPU 0-7 (8 logical) na 4 fyzických.
- Linux scheduler vidí 8 *runqueues* — efektivně 8 vláken paralelně.

CPUID instrukce vrací informace o **affinity** — který logický CPU sdílí jádro s kterým. OS pak rozumně placuje vlákna.

## Co je sdílené, co private

### Fully sdílené (mezi sibling threads)

- I-cache, D-cache (L1).
- L2 cache.
- TLB (s tagy pro každý thread).
- BTB, BHT, branch predictors.
- Reservation stations.
- ROB (rozdělený na dvě poloviny — half-and-half).
- Functional units (ALU, FPU, L/S).
- Physical register file.
- Decoder.

### Per thread

- PC (program counter).
- Architectural register state (ARF).
- Page table base register (CR3).
- ITLB partition (logical).

⇒ HT přidá *kopii ARF* a *trochu duplicate state*, ale 95 % jádra je sdílené. Plocha overhead ~5 %.

## Fetch + Dispatch

V každém taktu front-end vybírá *odkud fetchnout*:

1. **Both threads ready** → alternate (round-robin) nebo *priority-based*.
2. **Jeden thread čeká** (cache miss, low-priority) → druhý dostane plný fetch bandwidth.
3. **Both stagnate** → no fetch, oba čekají.

V *back-endu* dispatch *jakoukoli* ready instrukci z RS, bez ohledu na thread. ALU vidí "tag" thread + uop, neví, jestli A nebo B (až do retire pro správné per-thread ARF update).

### Resource partitioning

Intel rozhodla *jak rozdělit* sdílené struktury:

- **ROB**: half-and-half (96 / 96 ze 192). Zaručuje *jistou* progress per thread, ale nelze přerozdělit.
- **RS**: dynamicky — first-come-first-served.
- **Cache**: open — kdo dřív, ten *má*.

Trade-off: half-and-half ROB = férové, ale plýtvá, pokud jeden thread idle. Dynamic = vyšší peak per thread.

Recent Intel (Sapphire Rapids, 2023): více *adaptivní* partitioning, sleduje vytížení a re-balance.

## Hit-rate cache se sdílením

Dvě threads na 32 kB L1 = každý *efektivně* ~16 kB (pokud workloady nesdílí data).

Při memory-bound zátěži s velkou working set → *L1 miss rate vystřelí*. Cache contention → SMT slowdown.

Empirický fact: SPECCPU rate (multiple threads) má HT speedup ~20-30 %. Single-thread (SPECspeed) má HT pokutu ~5-10 % (sdílení cache).

## Memory-level parallelism

SMT exceluje při *memory-level parallelism*. Jeden thread čeká na L3 miss (50 cyklů), druhý mezitím vykonává compute-bound část.

Zátěž benefitující z HT:

- **Server requests** (web server, DB query) — různé volby cache, různé patterns.
- **Workstation mixed** — kompilace + IDE + browser, různé profily.
- **Pipeline-bound code** (long dep chains, scoreboard stagnace).

Zátěž *trpící* HT:

- **HPC compute-bound** (matrix multiply, FFT) — oba threads bojují o stejné FPU.
- **Cache-sensitive** (B-tree traversal s pracovní množinou těsně pod L1).
- **Security-sensitive** (Spectre-like attacks možné mezi sibling threads).

## Hyper-Threading speedup

Reálný benchmark (Intel Core i7, SPECrate 2017):

| Test | 4 cores, no HT | 4 cores + HT (8 logical) | Speedup |
| :--- | :---: | :---: | :---: |
| Integer | 100 % | 130 % | 1.30× |
| Floating point | 100 % | 115 % | 1.15× |
| Compile (parallel make) | 100 % | 140 % | 1.40× |
| Matrix multiply | 100 % | 95 % | **0.95×** (zhoršení!) |

⇒ HT obvykle 15-40 % gain. Pro *vysoce compute-bound*, plně vektorizovaný kód může *škodit*.

::: viz smt-pipeline-mixing "Vyber mix (CPU+CPU degrade / CPU+Mem sweet spot / Mem+Mem). Stíny: bubliny v issue width 4 → SMT je vyplní z druhého threadu jen pokud má co dělat."
:::

## Disable HT — kdy

V niche scenarios:

- **HPC clusters s manuální paralelizací** — předvídatelnější performance bez HT.
- **Low-latency trading systems** — vyhnete se HT jitter, garantovaný single-thread peak.
- **Security-hardened** environments — vyhnete se Spectre-like cross-thread attacks (Intel disabled HT na některých macOS, ChromeOS systémech po Foreshadow attack).

Linux: `nosmt` boot parameter nebo `echo off > /sys/devices/system/cpu/smt/control`.

Cloud (AWS, GCP): některé instance typy mají HT *vypnuté* (high-performance compute) — viditelně menší vCPU počet.

## Foreshadow / L1TF (2018)

Side-channel attack: vlákno A na fyzickém jádře může *číst* L1 cache vlákna B (jiný OS process, jiný VM!).

Princip: speculative load v A *neoprávněně* dostane data z L1 → leak via timing side-channel.

Intel rapidně patch: disable HT v cloud + microcode update flushuje L1 mezi context switches. Performance drop ~5-15 % pro affected workloads.

Důsledek: HT ne *vždy* win — *security* faktor.

## HT v AMD

AMD má vlastní SMT (2-way) na Zen+ a novějším. Implementace odlišná:

- **Resource sharing fully dynamic** — bez half-and-half partitioning.
- **Cleaner cross-thread isolation** — proti Spectre lépe izolováno.
- **Speedup podobný Intel HT** — ~15-35 %.

AMD marketing: "SMT". Intel: "Hyper-Threading". Funkčně podobné, implementačně odlišné.

## HT v Apple

Apple M1, M2, M3 **NEMAJÍ SMT**. P-cores jsou single-threaded.

Důvody:

- Single-thread perf prioritizována (laptops/desktops).
- Security — bez HT žádné Spectre-cross-thread risk.
- E-cores (efficient cores) berou "TLP role" — namísto SMT je *4 E-cores + 4 P-cores* lepší design.

Trade-off: méně logical CPU. M1 = 8 cores = 8 vláken vs Intel comparable 8 cores + HT = 16 vláken.

## Co dál

[[ht-vykon-omezeni]] analyzuje *kvantitativně*, kdy HT přidává, kdy škodí — performance counters, profilování, decision tree pro turn-on/off HT.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Marr, D.T. et al.: „Hyper-Threading Technology Architecture and Microarchitecture" (Intel Technology Journal 6(1), 2002); Koufaty, D., Marr, D.T.: „Hyperthreading Technology in the Netburst Microarchitecture" (IEEE Micro 23(2), 2003, [DOI 10.1109/MM.2003.1196115](https://doi.org/10.1109/MM.2003.1196115)); Van Schaik, S. et al.: „RIDL: Rogue In-Flight Data Load" (S&P 2019); Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §3.12.*
