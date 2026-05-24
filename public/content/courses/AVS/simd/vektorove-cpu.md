---
title: Vektorové procesory — Cray, NEC, RISC-V V
---

# Vektorové CPU — od Cray-1 po RISC-V V-extension

Před SSE/AVX byly **klasické vektorové CPU** dominantní architektura pro vědecké výpočty. Cray-1 (1976) ukázal cestu; NEC SX a moderní RISC-V V-extension ji rozšiřují s *proměnnou délkou* vektoru — koncept lepší než *fixed-width* SIMD na x86.

## Vektorový registr

V SIMD x86 je *šířka vektoru* fixní (128/256/512 bit). Pro pole 1000 prvků musíte rozdělit na 1000/16 = 63 iterací AVX-512.

Vektorové CPU mají **vektorový registr** s konfigurovatelnou délkou:

- Cray-1: 8 vektorových registrů, každý 64 × 64-bit float.
- NEC SX-Aurora: 64 vektorových registrů, 256 elementů × 64-bit.
- RISC-V V: proměnná délka, hardware sets VL (vector length register).

```
vsetvli VL, N, e64       ; nastav VL = min(N, max_VL), element 64-bit
vle.v v1, (a)            ; vector load N elementů
vle.v v2, (b)
vfadd.vv v3, v1, v2      ; v3[0..VL-1] = v1[0..VL-1] + v2[0..VL-1]
vse.v v3, (c)
```

Programátor *nemusí znát* skutečnou šířku hardware! Stejný kód běží na CPU s VL=64 nebo VL=512 — adaptuje se runtime.

## Strip mining (vektorizace dlouhé smyčky)

Pro `N` prvků, ale fyzická VL = 64:

```
loop:
    vsetvli t0, N, e64       ; t0 = min(N, 64), nastav VL
    vle.v v1, (a)
    vle.v v2, (b)
    vfadd.vv v3, v1, v2
    vse.v v3, (c)
    sub N, N, t0
    add a, a, t0 * 8
    ...
    bne N, x0, loop
```

Smyčka iteruje (N + VL - 1) / VL krát. *Poslední* iterace má kratší VL, ale hardware to *zvládne* automaticky.

⇒ **Žádný overhead** za "remainder" loop (jako u AVX, kde po vektorové smyčce následuje scalar cleanup).

## Chaining (vector chaining)

Cray-1 trick: výsledek jedné vektorové instrukce se *předává* další *jak ho vytváří*, bez čekání na dokončení.

```
vload   v1, (a)          ; pomalá DRAM
vfmul   v2, v1, scalar   ; čeká na v1, ale ihned jakmile dostupný element 0
vfadd   v3, v2, v_b      ; čeká na v2 element 0
```

Pipeline: element 0 z `vload` jde do `vfmul` po L cyklech, výstup `vfmul` z elementu 0 jde do `vfadd` ihned, atd. Tří-stage pipeline pro celý chain.

Speedup: 3-4× proti sekvenčnímu provedení.

## Masking — predikované provedení

Vektorová instrukce s mask registrem:

```
vmflt.vf v0, v1, scalar    ; v0[i] = 1 pokud v1[i] < scalar
vfmul.vv v3, v2, v_b, v0.t ; jen pro elementy s v0[i] = 1
```

Umožňuje vektorizovat smyčku s `if`:

```c
for (i = 0; i < N; i++)
    if (a[i] > 0) c[i] = a[i] * b[i];
```

→ predikce maskou. Žádné větvení.

## Stride access

Vektorový load s rozestupem:

```
vlse.v v1, (base), stride    ; v1[i] = mem[base + i * stride]
```

Pro `a[0], a[8], a[16], ...` stride = 8 elementů. Vektorová load adaptuje se *bez* gather (rychlejší než gather/scatter).

## Memory bandwidth-bound

Vektorová CPU jsou typicky **bandwidth-bound**, ne compute-bound. NEC SX-Aurora Tsubasa:

- 6.4 TFLOPS peak FP64.
- 1.2 TB/s HBM2 memory bandwidth.
- Aritmetická intenzita potřebná pro plné využití: 6.4 / 1.2 = 5.3 flop/byte.

Pro AXPY (2 flop / 16 byte = 0.125 flop/byte) → CPU jen 12 % využité.

Kompenzace: **mnoho registrů**, *velký* L2-like buffer. Aurora má 16 MB LLC.

## Vektorové CPU dnes

| Platforma | Vektorová šířka | Použití |
| :--- | :--- | :--- |
| NEC SX-Aurora | 256 × 64-bit (16 kbit!) | HPC, meteorologie |
| RISC-V V (Vector Extension) | variable, 128-2048-bit | embedded, HPC |
| ARM SVE (Scalable Vector Extension) | variable, 128-2048-bit | mobile, server |
| Fujitsu A64FX (Fugaku) | SVE 512-bit | #1 TOP500 2020-2022 |

ARM SVE (Scalable Vector Extension) je *moderní* vektorová architektura (2017). Stejný kód běží na 128, 256, 512, 1024, 2048-bit hardware *bez rekompilace*. Tomu se říká **VL-agnostic code**.

```
vlen-agnostic:
    incp x0, p0.b              ; advance by hardware vector length
    cntb x1                    ; how many bytes per vector
    whilelo p0.b, x0, x_count  ; predicate for remaining elements
    ld1b z0.b, p0/z, [array, x0]
    st1b z0.b, p0, [output, x0]
```

Fugaku (Fujitsu A64FX) byl první mainstream SVE CPU; #1 TOP500 list 2020-2022.

## RISC-V V Extension

Standardizace 2022, k dispozici v Sophon SG2042, ALI T-Head C910 atd.

Features:

- Variable VL (1 instrukce strip-mining).
- 32 vektorové registery, EEW (effective element width) 8/16/32/64-bit.
- Masking.
- Reductions (sum, max, min over vector).
- Permutace (slide, gather, scatter).

Compilery (Clang, GCC) **auto-vectorize** RISC-V V — *stejný* loop ekonomicky vektorizovaný.

## Vektorové CPU vs SIMD x86

| | Vektorové (NEC, RISC-V V, SVE) | SIMD (SSE/AVX) |
| :--- | :--- | :--- |
| Šířka | proměnná, runtime | fixní (128/256/512) |
| Loop overhead | strip-mining v 1 instrukci | manuální remainder loop |
| Memory load | stride, gather, scatter | jen sousední (gather drahý) |
| Masking | first-class | AVX-512 yes, AVX2 emulate |
| Reductions | hw support | shuffle + add |
| Kompilátor | snadnější autovec | obtížnější |

Vektorové CPU jsou **technicky lepší**, ale x86 SIMD je *masovějším* trhem. RISC-V V, ARM SVE začínají vektorové výhody nabízet i v komoditním HW.

## Aritmetická intenzita (AI)

Pro CPU s peak FLOPS $F$ a peak bandwidth $B$ (byte/s):

$$
\text{AI}_{\text{break-even}} = \frac{F}{B} \quad \text{(flops/byte)}
$$

Pokud AI úlohy < AI_break-even → **bandwidth-bound**.

| Úloha | AI |
| :--- | :---: |
| Vector copy (`a[i] = b[i]`) | 0 flop/byte |
| AXPY (`a[i] = b[i] * α + c[i]`) | 2 / 12 = 0.17 |
| Matrix-vector mul | 0.25 |
| Matrix-matrix mul (large) | ~2 flop/byte (cache resident) |
| FFT | 1-5 flop/byte |
| ML inference (matmul-heavy) | 10-100 flop/byte |

Pro Intel Xeon (AI break-even ~10), AXPY: 0.17 / 10 = 1.7 % využití. Matrix mul tiled: 20 %. ML: 80+ %.

⇒ **Algoritmus** (AI) určuje, kolik vektorizační hw získá. Tiled matrix mul vs naive — řád magnitudy.

## Co dál

[[sse-avx]] popisuje *fixní šířkové* x86 SIMD podrobně. [[vektorizace-prakticka]] ukáže, jak compiler vektorizuje a jak programátor vede přes intrinsics. [[gather-scatter]] řeší non-stride access pomocí AVX-512.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §4.2; Russell, R.M.: „The CRAY-1 Computer System" (Comm. ACM 21(1), 1978); [RISC-V V-extension Specification](https://github.com/riscv/riscv-v-spec); [ARM SVE Programming Guide](https://developer.arm.com/architectures/instruction-sets/intrinsics).*
