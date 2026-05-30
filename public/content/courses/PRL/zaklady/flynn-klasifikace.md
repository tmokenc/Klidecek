---
title: Flynnova klasifikace — SISD, SIMD, MISD, MIMD
---

# Flynnova klasifikace paralelních architektur

Předchozí sekce ([[paralelizace-uvod]], [[amdahl-gustafson]]) probraly *abstraktní* limity paralelizace. Teď se podíváme na **konkrétní hardware**. **Flynnova klasifikace** (Michael Flynn, 1966) je *fundamentální* taxonomie procesorů — rozlišuje, *zda se* každá instrukce vykonává nad jednou nebo více data, a zda běží jedna nebo více instrukcí současně. Čtyři výsledné kategorie pokrývají *všechny* (von Neumann) paralelní architektury.

## Dvě dimenze

Flynn pozoroval, že každá architektura má dva *nezávislé* aspekty:

1. **Instrukční tok** — kolik *instrukcí* se vykonává v jednom okamžiku.
2. **Datový tok** — nad kolika *datovými prvky* každá instrukce pracuje.

Pro každý: **Single (S)** nebo **Multiple (M)**.

Kombinace dává 4 kategorie:

| | Single Data | Multiple Data |
| :---: | :---: | :---: |
| **Single Instruction** | **SISD** | **SIMD** |
| **Multiple Instruction** | **MISD** | **MIMD** |

## SISD — klasický sekvenční počítač

**Single Instruction, Single Data.** Procesor vykonává *jednu* instrukci nad *jedním* datovým prvkem v každém okamžiku.

::: svg "SISD — sekvenční instrukce nad jedním datem"
<svg viewBox="0 0 540 130" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="40" y="40" width="100" height="40"/>
    <rect x="220" y="40" width="100" height="40"/>
    <rect x="400" y="40" width="100" height="40"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="90" y="65">+</text>
    <text x="270" y="65">A + B</text>
    <text x="450" y="65">A B</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="90" y="100">Instrukce</text>
    <text x="270" y="100">Výsledek</text>
    <text x="450" y="100">Data (jeden pár)</text>
  </g>
</svg>
:::

Zástupci:

- Klasický CPU bez SIMD rozšíření.
- Single-core x86, ARM, RISC-V.
- Embedded mikrokontroléry (8051, AVR).

Klíčové vlastnosti:

- Jednoduchá architektura.
- Žádný paralelismus na instrukční úrovni (jen *pipeline* — instrukce postupně).
- *Sekvenční* model výpočtu.

V čistě SISD se dnes nestavějí; každý moderní CPU má aspoň SIMD rozšíření (SSE, AVX, NEON).

## SIMD — Single Instruction, Multiple Data

Jedna instrukce zpracuje *vícenásobné* datové prvky *současně*. Vektorové operace.

::: svg "SIMD — jedna instrukce + (sčítá) nad vektorem dat"
<svg viewBox="0 0 540 150" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="40" y="60" width="60" height="36"/>
    <rect x="180" y="20" width="60" height="36"/>
    <rect x="180" y="60" width="60" height="36"/>
    <rect x="180" y="100" width="60" height="36"/>
    <rect x="320" y="20" width="60" height="36"/>
    <rect x="320" y="60" width="60" height="36"/>
    <rect x="320" y="100" width="60" height="36"/>
    <rect x="460" y="20" width="60" height="36"/>
    <rect x="460" y="60" width="60" height="36"/>
    <rect x="460" y="100" width="60" height="36"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70" y="82">+</text>
    <text x="210" y="42">a₁ + b₁</text>
    <text x="210" y="82">a₂ + b₂</text>
    <text x="210" y="122">a₃ + b₃</text>
    <text x="350" y="42">a₁ b₁</text>
    <text x="350" y="82">a₂ b₂</text>
    <text x="350" y="122">a₃ b₃</text>
    <text x="490" y="42">c₁</text>
    <text x="490" y="82">c₂</text>
    <text x="490" y="122">c₃</text>
  </g>
  <text x="70" y="115" fill="var(--text-muted)" text-anchor="middle" font-size="10">jedna +</text>
  <text x="210" y="148" fill="var(--text-muted)" text-anchor="middle" font-size="10">paralelní +</text>
  <text x="490" y="148" fill="var(--text-muted)" text-anchor="middle" font-size="10">výsledek</text>
</svg>
:::

Zástupci:

- **Vektorové procesory** — Cray-1 (1976), NEC SX, Fujitsu VPP — historie.
- **CPU SIMD rozšíření** — Intel SSE (128 b), AVX (256 b), AVX-512 (512 b). ARM NEON. RISC-V V-extension.
- **GPU** — Nvidia CUDA cores, AMD compute units. Pracují *primárně* v SIMD módu (warp = 32 threads).
- **MSIMD** (Multiple SIMD) — N SIMD jednotek paralelně.

Příklad AVX-512: jedna instrukce `vaddps zmm0, zmm1, zmm2` sčítá *16 floats* (32 b) najednou. 16× rychlejší než sekvenční smyčka, pokud kompilátor vektorizuje.

Aplikace:

- Image/video processing (každý pixel stejná operace).
- Signal processing (FFT).
- Linear algebra (BLAS, matrix multiplikace).
- Machine learning (tensor ops na GPU).
- Cryptography (AES-NI).

## MISD — Multiple Instruction, Single Data

Více instrukcí pracuje nad *jedním* datovým prvkem. *Kontroverzní* kategorie — některé zdroje tvrdí, že MISD *prakticky neexistuje*. Možné interpretace:

- **Systolic arrays** — datový prvek "teče" sítí, každý uzel aplikuje jinou operaci.
- **Pipelined processors** — fáze (fetch, decode, execute) zpracovávají *různé instrukce* nad *jedním data flow*.
- **Fault-tolerant systems** — Space Shuttle had 4 redundant computers vykonávajících *stejný* program, výsledky se *vote-d* (toto je obecně považováno *za* MISD).

V mainstream HW se MISD *nevyskytuje* jako pure category — typicky se shovává pod jiný název.

## MIMD — Multiple Instruction, Multiple Data

Vícero procesorů, *každý vykonává vlastní instrukce* nad *vlastními daty*. **Naprostá většina dnešních paralelních systémů.**

::: svg "MIMD — N nezávislých procesorů s vlastními instrukcemi"
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="40" y="30" width="100" height="60"/>
    <rect x="200" y="30" width="100" height="60"/>
    <rect x="360" y="30" width="100" height="60"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="90" y="50">CPU₁</text>
    <text x="90" y="67" font-size="10">add</text>
    <text x="90" y="80" font-size="10">x ← x+y</text>
    <text x="250" y="50">CPU₂</text>
    <text x="250" y="67" font-size="10">mul</text>
    <text x="250" y="80" font-size="10">z ← a*b</text>
    <text x="410" y="50">CPU₃</text>
    <text x="410" y="67" font-size="10">load</text>
    <text x="410" y="80" font-size="10">u ← M[k]</text>
  </g>
  <text x="270" y="140" fill="var(--text-muted)" text-anchor="middle" font-size="10">Sdílená paměť nebo distribuovaná paměť přes síť</text>
</svg>
:::

### MIMD subkategorie podle paměti

#### Shared memory MIMD (SMP, multi-core)

Všechny procesory přistupují ke *stejné fyzické paměti*.

- **UMA** (Uniform Memory Access) — všechny CPU vidí paměť stejně rychle. Single-socket multi-core CPU.
- **NUMA** (Non-Uniform Memory Access) — víc paměťových bank; lokální CPU rychle, vzdálené pomaleji. Multi-socket servery.

Programovací modely:

- **Threads** (POSIX pthreads, C++ std::thread).
- **OpenMP** — `#pragma omp parallel for`.
- **Cilk, TBB** — task-based.

Klíčový problém: **cache coherence**. Když CPU₁ změní hodnotu, *všechny* CPU musí *vidět změnu*. Hardware protokoly (MESI, MOESI) to řeší, ale s cenou.

#### Distributed memory MIMD (cluster, HPC)

Každý procesor má *vlastní* paměť. Komunikace přes *zprávy* (message passing) přes síť (Ethernet, InfiniBand).

Programovací modely:

- **MPI** (Message Passing Interface) — *de facto* standard pro HPC.
- **PVM** — historický, nahrazen MPI.

Žádná cache coherence (každý CPU má vlastní cache nezávislou); explicitní synchronizace přes zprávy.

#### Hybridní (cluster of SMPs)

Klasický moderní HPC: tisíce *uzlů*, každý je *multi-core SMP*. Programuje se *hybridně* — MPI mezi uzly, OpenMP/threads uvnitř uzlu.

## MIMD vs SIMD trade-off

| | SIMD | MIMD |
| :--- | :---: | :---: |
| Flexibilita | nízká (stejná op) | vysoká (různé op) |
| Programování | jednoduché (vektor smyčka) | složitější (synchronizace) |
| Efektivita | vysoká pro stejná data | univerzální |
| Memory | tightly coupled | shared/distributed |
| Aplikace | dat-paralelní | task-paralelní |

Moderní systémy *kombinují* obě: CPU s SIMD instrukcemi + multi-core MIMD; GPU s tisíci SIMD core organizovaných do MIMD bloků.

## Hierarchie paralelních architektur

::: svg "Klasifikace paralelních architektur — Flynn + paměťový model"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="220" y="20" width="100" height="30"/>
    <rect x="70" y="70" width="100" height="30"/>
    <rect x="200" y="70" width="100" height="30"/>
    <rect x="330" y="70" width="100" height="30"/>
    <rect x="450" y="70" width="80" height="30"/>
    <rect x="100" y="130" width="80" height="30"/>
    <rect x="200" y="130" width="80" height="30"/>
    <rect x="330" y="130" width="80" height="30"/>
    <rect x="430" y="130" width="80" height="30"/>
    <rect x="120" y="180" width="120" height="30"/>
    <rect x="330" y="180" width="180" height="30"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="270" y="40">Paralelní</text>
    <text x="120" y="90">SISD</text>
    <text x="250" y="90">MISD</text>
    <text x="380" y="90">MIMD</text>
    <text x="490" y="90">SIMD</text>
    <text x="140" y="150">skalární CPU</text>
    <text x="240" y="150">pipeline</text>
    <text x="370" y="150">SMP</text>
    <text x="470" y="150">cluster</text>
    <text x="180" y="200">vektorové</text>
    <text x="420" y="200">MSIMD, GPU</text>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.8">
    <line x1="270" y1="50" x2="120" y2="70"/>
    <line x1="270" y1="50" x2="250" y2="70"/>
    <line x1="270" y1="50" x2="380" y2="70"/>
    <line x1="270" y1="50" x2="490" y2="70"/>
    <line x1="120" y1="100" x2="140" y2="130"/>
    <line x1="250" y1="100" x2="240" y2="130"/>
    <line x1="380" y1="100" x2="370" y2="130"/>
    <line x1="380" y1="100" x2="470" y2="130"/>
    <line x1="490" y1="100" x2="180" y2="180"/>
    <line x1="490" y1="100" x2="420" y2="180"/>
  </g>
</svg>
:::

## Praktické důsledky

1. **CPU jsou MIMD** (multi-core) **+ SIMD** (vektor extensions). Programátor využívá *obě*.
2. **GPU jsou SIMD-dominantní**. Pro nepoužitelnou vektorizovatelnou úlohu (mnoho větvení) — GPU underperformuje.
3. **Cluster MIMD** — *standard* pro HPC. Programovaný přes MPI.
4. **SIMD vyžaduje regularity** — nepravidelné větvení (data-dependent branching) snižuje efektivitu.

## Co dál

[[ne-vn-architektury]] prozkoumá *alternativní* modely výpočtu — **dataflow** (řízené tokem dat, ne sekvenčně) a **redukční** (funkcionální programování, redukce výrazů). Tyto modely *neaplikují Flynnovu* klasifikaci — jsou *post-von-Neumann*.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Flynn, M.J.: „Some Computer Organizations and Their Effectiveness" (IEEE Trans. Computers C-21(9), 1972, [DOI 10.1109/TC.1972.5009071](https://doi.org/10.1109/TC.1972.5009071)); Hennessy, J.L., Patterson, D.A.: *Computer Architecture: A Quantitative Approach* (6. vyd., Morgan Kaufmann 2017), kap. 4–5; Hwang, K.: *Advanced Computer Architecture* (McGraw-Hill 1993).*
