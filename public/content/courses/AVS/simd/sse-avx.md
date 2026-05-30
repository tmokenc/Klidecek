---
title: SSE, AVX a AVX-512 — x86 vektorové ISA
---

# x86 SIMD — SSE, AVX, AVX-512

x86 architektura má **fixed-width SIMD**: každá generace přidala širší registry. Trajektorie: MMX (64) → SSE (128) → AVX (256) → AVX-512 (512). Každé rozšíření *kompatibilně* roste, ale vyžaduje *recompile* nebo runtime dispatch.

## Historie x86 SIMD

| ISA | Rok | Šířka | Elementy (float32) | Použití |
| :--- | :---: | :---: | :---: | :--- |
| MMX | 1996 | 64-bit | — | early multimedia (integer only): 2× int32 / 4× int16 / 8× int8 |
| SSE | 1999 | 128-bit | 4 | první float SIMD |
| SSE2 | 2001 | 128-bit | 4 | + double + integer |
| SSE3, SSSE3 | 2004-06 | 128-bit | 4 | + horizontal ops |
| SSE4.1, SSE4.2 | 2007-08 | 128-bit | 4 | + dot product, blend, CRC |
| AVX | 2011 | 256-bit | 8 | 3-operand instrukce, no destructive |
| AVX2 | 2013 | 256-bit | 8 | + gather, FMA, integer |
| AVX-512 | 2016 | 512-bit | 16 | + masking, conflict detect, 32 reg |
| AMX | 2022 | tile (16×64) | matrix | tile-based, BF16 / INT8 |

Každá generace přinesla **2× šířku** a *navíc* nové instrukce.

## Registry

- **MMX**: `mm0-mm7` (8 × 64-bit, aliased s x87 FP).
- **SSE**: `xmm0-xmm15` (16 × 128-bit ve 64-bit režimu).
- **AVX**: `ymm0-ymm15` (16 × 256-bit; spodních 128 = xmm).
- **AVX-512**: `zmm0-zmm31` (32 × 512-bit; spodních 256 = ymm).

Velký počet registrů (32 v AVX-512) snižuje register pressure → kompilátor lépe alokuje.

## Mapování datových typů

256-bit AVX registr může držet:

- **8× float32** (`__m256`).
- **4× float64** (`__m256d`).
- **32× int8** (`__m256i` byte view).
- **16× int16** (`__m256i` short view).
- **8× int32**.
- **4× int64**.

Vektorové instrukce typed:

- `_mm256_add_ps` — packed single (float32). 8 elementů.
- `_mm256_add_pd` — packed double. 4 elementů.
- `_mm256_add_epi32` — extended packed integer 32-bit (epi32). 8 elementů.

::: viz simd-lane-explorer "Změň datový typ (8× f32 / 4× f64 / 8× i32 / 32× i8 …). Stejný 256-bit registr se rozdělí na jiné šíře lanes; SIMD ADD trvá 1 cyklus, skalární smyčka 8 (nebo 32)."
:::

## Klíčové operace

### Arithmetic

```c
__m256 a = _mm256_load_ps(src1);          // load 8 floats
__m256 b = _mm256_load_ps(src2);
__m256 c = _mm256_add_ps(a, b);           // 8 adds parallel
__m256 d = _mm256_mul_ps(a, b);
__m256 e = _mm256_fmadd_ps(a, b, c);      // FMA: e = a*b + c, single rounding
_mm256_store_ps(dst, c);
```

FMA (Fused Multiply-Add) je *jediná instrukce* s *jediným zaokrouhlením* — vyšší přesnost než separát mul+add. Klíčové pro BLAS, ML.

### Compare a blend

```c
__m256 mask = _mm256_cmp_ps(a, b, _CMP_GT_OQ);    // mask[i] = (a[i] > b[i]) ? 1 : 0
__m256 r = _mm256_blendv_ps(a, b, mask);          // r[i] = mask[i] ? b[i] : a[i]
```

Permits vectorized conditional assignment without branching.

### Shuffle, broadcast

```c
__m256 v = _mm256_broadcast_ss(&scalar);          // [s, s, s, s, s, s, s, s]
__m256 p = _mm256_permute_ps(a, 0b10110100);      // rearrange lanes
```

Permutace umožňují *rearrange* dat *uvnitř* vektoru — drahá ale často nezbytná.

### Reduction

```c
__m256 v;
float sum = 0;
for (int i = 0; i < 8; i++) sum += v[i];          // skalární
// AVX2: shuffle + add tree
__m256 t = _mm256_hadd_ps(v, v);
t = _mm256_hadd_ps(t, t);
// extract a sečíst lower 128
__m128 lo = _mm256_castps256_ps128(t);
__m128 hi = _mm256_extractf128_ps(t, 1);
float r = _mm_cvtss_f32(_mm_add_ps(lo, hi));
```

AVX nemá *native* sum reduction → 4-5 instrukcí. SVE a RISC-V V mají `reducef` v 1 instrukci. To je jedna z výhod variable-length vector ISA.

## AVX-512 — nová generace

512-bit jen krok? Ne — *kvalitativní* změny:

### Masking

Každá instrukce může mít **mask register** `k0-k7` (8 × 64-bit):

```c
__mmask16 m = _mm512_cmp_ps_mask(a, b, _CMP_GT_OQ);
__m512 r = _mm512_mask_add_ps(orig, m, a, b);     // jen kde m[i]=1
```

První-class predikace = clean vectorized conditional. Nejvíc *AVX-512 advantage* nad AVX2.

### 32 registrů

Místo 16 v AVX. Compilery mohou udržet více proměnných v registrech, méně spill/reload.

### Conflict detection

```c
__m512i indices = ...
__m512i conflicts = _mm512_conflict_epi32(indices);
```

Pro histogram / scatter — detect duplicates *před* race. Specializovaná instrukce.

### Permutation flexibility

`_mm512_permutexvar_*` — *libovolný* permutace (gather mask).

## Frekvenční drop

AVX-512 ALU žere *víc proudu*. CPU **sníží frekvenci**, když detekuje AVX-512 instrukce, aby zůstal v power envelope. Drop typicky 5-15 %.

⇒ Pokud kód *občas* (occasionally) používá AVX-512, frekvenční drop sníží *všechen* outstanding skalar kód. Vyplatí se *jen*, pokud je AVX-512 sekce *dlouhá* a *kritická*.

Intel Sapphire Rapids (2023) řeší frekvenční drop lépe — *per-core* power management. AVX-512 ALU má vlastní voltage regulator.

## Auto-vectorization

Kompilátor *zkusí* vektorizovat smyčky. Pravidla:

- Žádné loop-carried dependence.
- Žádné funkční volání uvnitř (inlining first).
- Žádné pointer aliasing (`__restrict` keyword).
- Lineární přístup (stride 1 nejlepší).
- Konstantní iteration count (lepší pro unroll).

GCC:

```bash
gcc -O3 -mavx2 -ftree-vectorize -fopt-info-vec ...
```

Output: které loops byly vektorizované a které ne (s důvodem).

ICC (Intel C++) je tradičně nejagresivnější. Clang dobrý. GCC dobrý od verze 8+.

## Intrinsics — *ruční* vektorizace

Kdy intrinsics:

- Compiler odmítl vektorizovat (nebo špatně).
- Potřebujete specifické instrukce (FMA, shuffle, blend).
- Performance-critical kernel (BLAS, FFT, crypto).

```c
#include <immintrin.h>

void axpy_avx(int n, float alpha, float *x, float *y) {
    __m256 vα = _mm256_set1_ps(alpha);
    for (int i = 0; i < n; i += 8) {
        __m256 vx = _mm256_loadu_ps(&x[i]);
        __m256 vy = _mm256_loadu_ps(&y[i]);
        __m256 vr = _mm256_fmadd_ps(vα, vx, vy);
        _mm256_storeu_ps(&y[i], vr);
    }
}
```

Pozor:

- **Tail handling** — když `n` není násobek 8, posledních N % 8 elementů třeba zpracovat skalárně nebo maskovaně.
- **Alignment** — `_mm256_load_ps` vyžaduje 32-byte align, `_mm256_loadu_ps` allows unaligned (small penalty).

## Runtime dispatch

Programu chcete běžet na CPU s i bez AVX-512. Strategie:

```c
typedef void (*kernel_t)(int, float, float*, float*);
kernel_t kernel;

void init() {
    if (cpu_has_avx512()) kernel = axpy_avx512;
    else if (cpu_has_avx2()) kernel = axpy_avx2;
    else if (cpu_has_sse()) kernel = axpy_sse;
    else kernel = axpy_scalar;
}
```

GCC `__attribute__((target("avx2")))` / `__attribute__((target_clones("default,avx2,avx512f")))` automatizuje.

GLIBC dynamic loader: dispatchuje optimized memcpy/strcmp podle CPU.

## Co dál

[[vektorizace-prakticka]] popíše, *jak* programátor (nebo kompilátor) prakticky vektorizuje. [[gather-scatter]] řeší non-stride access (důležité pro AVX-512 a real-world data).

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Intel® 64 and IA-32 Architectures Software Developer's Manual, Vol. 2 ([Intel SDM](https://www.intel.com/sdm)); Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §4.3; Fog, A.: „Optimizing software in C++" ([agner.org/optimize](https://www.agner.org/optimize/)); [Intel Intrinsics Guide](https://www.intel.com/content/www/us/en/docs/intrinsics-guide/index.html).*
