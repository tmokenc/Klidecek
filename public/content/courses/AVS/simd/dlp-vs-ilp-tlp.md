---
title: DLP, ILP a TLP — datový paralelismus
---

# Datový paralelismus a jeho místo

ILP ([[ilp-superskalar]]) je hardware-driven paralelismus instrukcí. TLP ([[tlp-uvod]]) je software-driven paralelismus vláken. **DLP (Data-Level Parallelism)** je paralelismus *uvnitř* jedné instrukce — *jediná* instrukce pracuje *paralelně* na **mnoha datových elementech**.

DLP zvládne *triviálně* operace nad poli a maticemi, kde *stejný* výpočet probíhá na nezávislých datech. Hardware si může dovolit replikovat ALU, místo aby spěchal scheduler.

## Tři druhy paralelismu — připomenutí

| | ILP | TLP | DLP |
| :--- | :--- | :--- | :--- |
| Jednotka | instrukce | vlákno | element |
| Granularita | jemná (10s instrukcí) | hrubá (1000s instr/vlákno) | velmi jemná |
| Kdo to řídí | HW (OoO) nebo SW (VLIW) | programátor (OpenMP) | kompilátor / programátor (SIMD) |
| Hardware cost | drahé (RS, ROB, renaming) | per-core overhead | levné (replikované ALU) |
| Typický speedup | 2-4× | $\le$ # jader | 4-16× |

## Datový vs funkční paralelismus

**Funkční paralelismus** (ILP): různé instrukce běží *současně*, protože nezávisejí. ALU + multiplier + L/S na různých FJ.

**Datový paralelismus** (DLP): *stejná* instrukce běží na *mnoha* datech současně.

```
Funkční (ILP):
   add r1, r2, r3   |  ALU0
   mul r4, r5, r6   |  ALU1 (paralelně)
   lw  r7, 0(r8)    |  L/S (paralelně)

Datový (DLP):
   vadd v1, v2, v3   ; v_i = v2_i + v3_i pro i = 0..7 paralelně
```

DLP exploit *parallel data* (vector, matrix). ILP exploit *parallel instructions* (decode 1 thread).

## Tři realizace DLP

::: svg "Tři realizace DLP — vektorová CPU, SIMD, SIMT"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--text)" font-weight="600">
    <text x="20" y="30">Vektorová CPU (časový paralelismus)</text>
    <text x="20" y="100">SIMD (prostorový paralelismus)</text>
    <text x="20" y="170">SIMT (GPU, kombinace časový + prostorový)</text>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="38" width="40" height="22" rx="2"/>
    <rect x="65" y="38" width="40" height="22" rx="2"/>
    <rect x="110" y="38" width="40" height="22" rx="2"/>
    <rect x="155" y="38" width="40" height="22" rx="2"/>
    <rect x="200" y="38" width="40" height="22" rx="2"/>
    <rect x="245" y="38" width="40" height="22" rx="2"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="40" y="52">e0</text>
    <text x="85" y="52">e1</text>
    <text x="130" y="52">e2</text>
    <text x="175" y="52">e3</text>
    <text x="220" y="52">e4</text>
    <text x="265" y="52">...</text>
  </g>
  <text x="320" y="52" fill="var(--text-muted)" font-size="9">pipelined: 1 FJ × N taktů</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="108" width="40" height="22" rx="2"/>
    <rect x="65" y="108" width="40" height="22" rx="2"/>
    <rect x="110" y="108" width="40" height="22" rx="2"/>
    <rect x="155" y="108" width="40" height="22" rx="2"/>
    <rect x="200" y="108" width="40" height="22" rx="2"/>
    <rect x="245" y="108" width="40" height="22" rx="2"/>
    <rect x="290" y="108" width="40" height="22" rx="2"/>
    <rect x="335" y="108" width="40" height="22" rx="2"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="40" y="122">e0</text>
    <text x="85" y="122">e1</text>
    <text x="130" y="122">e2</text>
    <text x="175" y="122">e3</text>
    <text x="220" y="122">e4</text>
    <text x="265" y="122">e5</text>
    <text x="310" y="122">e6</text>
    <text x="355" y="122">e7</text>
  </g>
  <text x="400" y="122" fill="var(--text-muted)" font-size="9">8 FJ paralelně, 1 takt</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="180" width="40" height="22" rx="2"/>
    <rect x="65" y="180" width="40" height="22" rx="2"/>
    <rect x="110" y="180" width="40" height="22" rx="2"/>
    <rect x="155" y="180" width="40" height="22" rx="2"/>
    <rect x="20" y="205" width="40" height="22" rx="2"/>
    <rect x="65" y="205" width="40" height="22" rx="2"/>
    <rect x="110" y="205" width="40" height="22" rx="2"/>
    <rect x="155" y="205" width="40" height="22" rx="2"/>
  </g>
  <text x="200" y="200" fill="var(--text-muted)" font-size="9">warp = 32 vláken, mnoho warpů</text>
  <text x="200" y="215" fill="var(--text-muted)" font-size="9">časový + prostorový, latence hidden</text>
</svg>
:::

### Vektorová CPU (časový paralelismus)

První masová DLP architektura — **Cray-1** (1976). Jedna funkční jednotka *pipelined*, vektorový registr (64 elementů). Instrukce `vadd v1, v2, v3` spustí pipeline na 64 cyklů a generuje 1 element/cyklus.

Současné vektorové CPU: **NEC SX-Aurora**, **RISC-V V-extension**. Vektorové délky proměnné (vector length register VL).

### SIMD (prostorový paralelismus)

*Replikované* funkční jednotky, *všechny* paralelně. Jedna instrukce = N výsledků v 1 cyklu.

Příklady:

- **MMX** (Intel 1996) — 64-bit, 8× int8 nebo 4× int16.
- **SSE** (Intel 1999) — 128-bit, 4× float32.
- **AVX** (Intel 2011) — 256-bit, 8× float32.
- **AVX-512** (Intel 2016) — 512-bit, 16× float32.
- **NEON** (ARM) — 128-bit.
- **SVE** (ARM 2017) — proměnná délka 128-2048-bit.

Detaily SSE/AVX viz [[sse-avx]].

### SIMT (GPU model)

**Single Instruction Multiple Threads** — kombinace. *Logicky* každé "vlákno" má vlastní stav. *Fyzicky* skupina (warp = 32 vláken na NVIDIA) sdílí instruction stream — *jeden* fetch, *všechna* vlákna provedou.

Pokud vlákno *neaktivní* (divergence), je *maskováno*. Detaily v Topic 10 ([[gpu-architektura]], [[cuda-divergence-occupancy]]).

## SIMD instrukční sada

Vektorový registr drží *více* skalárních elementů:

```
v1 = [a0, a1, a2, a3, a4, a5, a6, a7]    ; 8× float32 (256-bit AVX)
v2 = [b0, b1, b2, b3, b4, b5, b6, b7]

vadd v3, v1, v2
v3  = [a0+b0, a1+b1, a2+b2, a3+b3, a4+b4, a5+b5, a6+b6, a7+b7]
```

Multiplikace, FMA (fused multiply-add), porovnání, masking, shuffle — všechny vektorové variants.

Kód vypadá vizuálně podobně skalárnímu, ale ALU *replikované*. AVX-512 CPU má 16× FP32 ALU = 16× compute throughput pro vektorizovatelný kód.

## DLP omezení

### 1. Nejednotkový rozestup (non-unit stride)

Vektorový load `vload v1, &a[0]` funguje, pokud `a[0..7]` jsou *sousední*. Pro `a[0], a[8], a[16], ...` (stride 8) je třeba **gather** instrukce — pomalá ([[gather-scatter]]).

### 2. Nezarovnaná data (unaligned)

Vektor 32 B na *nezarovnanou* adresu nebyl zpočátku podporován. SSE vyžadovala 16-byte alignment. AVX a novější umí unaligned, ale s mírnou pokutou.

### 3. Datové závislosti mezi iteracemi

Loop-carried dependence:

```c
for (i = 1; i < N; i++)
    a[i] = a[i-1] + b[i];     // a[i] závisí na a[i-1] — NELZE vektorizovat
```

Kompilátor *odmítne* vektorizovat. Alternativy: prefix sum algoritmy ([[prefix-sum-uvod]]) které tuto závislost obejdou.

### 4. Pointer aliasing

```c
void scale(float *a, float *b, int N) {
    for (i = 0; i < N; i++)
        a[i] = a[i] * b[i];
}
```

Kompilátor neví, zda `a` a `b` *překrývají*. Pokud ano, vektorizace by mohla *přepsat* dosud nečtená data.

Řešení: `__restrict` keyword v C99 — explicitní slib, že nepřekrývají.

```c
void scale(float *__restrict a, float *__restrict b, int N) { ... }
```

GCC, Clang, MSVC podporují.

### 5. Větvení uvnitř smyčky

```c
for (i = 0; i < N; i++)
    if (a[i] > 0) a[i] = sqrt(a[i]);
```

V SIMD by jen některá lane vektoru měla jít do `sqrt`. **Predikované provedení** (masked SIMD): všechny lane spočítají sqrt, ale pouze ty s predicate = true zapisují. AVX-512 a SVE mají *first-class* masking. SSE/AVX2 emulují skrz blend.

## Speedup DLP

Pro plně vektorizovatelný kód (matrix multiply, image processing):

- SSE (4× float) → 3,5× (overhead). 
- AVX2 (8× float) → 6×.
- AVX-512 (16× float) → 10-13× (frekvence trochu klesne při AVX-512).

Pro *částečně* vektorizovatelný:

$$
S = \frac{1}{(1 - f) + f / w}, \quad w = 4 \text{ (SSE)} / 8 \text{ (AVX2)} / 16 \text{ (AVX-512)}
$$

Pokud f = 0.7, w = 8: $S = 1 / (0.3 + 0.0875) = 2,58$.

⇒ **Vektorizovat hot loop nestačí** — třeba dostat *většinu* runtime do vektorizovaných sekcí.

## Co dál

[[vektorove-cpu]] popisuje klasické vektorové CPU (Cray, NEC) a moderní RISC-V V. [[sse-avx]] detaily x86 SIMD. [[vektorizace-prakticka]] ruční a automatickou vektorizaci. [[gather-scatter]] pro non-stride access.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §4.1-4.3; Flynn, M.J.: „Some Computer Organizations and Their Effectiveness" (IEEE Trans. Computers C-21(9), 1972, [DOI 10.1109/TC.1972.5009071](https://doi.org/10.1109/TC.1972.5009071)); [Intel Intrinsics Guide](https://www.intel.com/content/www/us/en/docs/intrinsics-guide/index.html).*
