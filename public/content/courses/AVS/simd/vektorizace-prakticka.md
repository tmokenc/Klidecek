---
title: Vektorizace v praxi — auto-vec a intrinsika
---

# Vektorizace v praxi — auto-vec, intrinsics, omezení

Vektorizace přináší 4-16× speedup *pokud* kód vyhovuje. Kompilátor zkusí *automaticky* (auto-vectorization); programátor může pomoct (`__restrict`, pragmas) nebo přepsat *ručně* (intrinsics, OpenMP SIMD). Tato sekce popisuje *spektrum*.

## Auto-vectorization

Kompilátor s `-O3` (GCC, Clang, ICC) zkusí vektorizovat každou *innermost* loop. Posloupnost analýz:

1. **Trip count analysis** — kolikrát smyčka iteruje? Konstanta nebo proměnná?
2. **Dependence analysis** — má smyčka loop-carried dependence?
3. **Alias analysis** — překrývají se pointery?
4. **Reduction recognition** — `sum += a[i]` je vektorizovatelná reduction.
5. **Idiom recognition** — `memcpy`-like patterns, `strlen`-like, atd.
6. **Cost model** — je vektorizovaný kód *opravdu* rychlejší?

Pokud všechno OK, GCC vygeneruje SIMD verzi (pro target CPU). `-fopt-info-vec` ukáže, co bylo / nebylo vektorizováno.

### Typický úspěch

```c
void scale(float *a, float *b, float k, int n) {
    for (int i = 0; i < n; i++)
        a[i] = b[i] * k;
}
```

GCC -O3 -mavx2 vygeneruje AVX loop s vfmadd. Kompilátor *vidí*, že `a` a `b` jsou různé pointery (default conservative), a *předpokládá* aliasing... Nebo vygeneruje *dvě verze*:

- **Vectorized** verze + runtime check, zda `a + n*4 <= b` nebo `b + n*4 <= a`.
- **Scalar** fallback při aliasing.

To je *runtime version selection*. ICC to dělá vždy. GCC od 7+.

### Co kompilátor odmítne

```c
for (int i = 1; i < n; i++)
    a[i] = a[i-1] + b[i];          // RAW — sériový
```

Loop-carried. Kompilátor *odmítne*. Pro prefix sum existuje paralelní algoritmus ([[prefix-sum-uvod]]), ale kompilátor ho neumí *odvodit*.

```c
for (int i = 0; i < n; i++)
    a[i] = sqrt(b[i]) + log(c[i]);
```

Pokud `sqrt` a `log` jsou *vektorizované verze* dostupné (libmvec, Intel SVML), tak ano. Jinak ne.

```c
void f(float *a, float *b, int n) {
    for (int i = 0; i < n; i++)
        a[i] = a[i] + b[i];
}
```

Bez `__restrict` kompilátor *neví*, jestli a, b překrývají. Generuje runtime check + fallback.

::: viz auto-vectorization-tracer "Klikni přes 6 mini-smyček (čistá / aliasing / loop-carried / runtime stride / sqrt / redukce) — uvidíš verdict + AVX2 asm + případný fix."
:::

## Pragmas — nápověda kompilátoru

GCC / Clang / ICC:

```c
#pragma GCC ivdep
for (int i = 0; i < n; i++)
    a[idx[i]] = b[i];   // ignore vector dependencies (pokud víme, že OK)

#pragma clang loop vectorize_width(8) interleave_count(4)
for (...) { ... }       // force AVX2 (8 wide)
```

OpenMP SIMD (přenositelný):

```c
#pragma omp simd
for (int i = 0; i < n; i++)
    a[i] = b[i] * c[i];
```

`#pragma omp simd` *přikazuje* kompilátoru vektorizovat (assuming safety). Programátor *garantuje* žádné aliasing, žádné loop-carried.

```c
#pragma omp simd reduction(+:sum)
for (int i = 0; i < n; i++)
    sum += a[i] * b[i];
```

S reduction klauzulí pro skalární výstup. Generuje vektorovou variantu *plus* finální skalární reduction.

## Intrinsics — kdy a jak

Intrinsics jsou C funkce, které kompilátor translatuje na *konkrétní* SIMD instrukci. Použít, když:

1. **Compiler refuses auto-vec** a důvod je *false*-dependency, který kompilátor nemůže vyloučit.
2. **Specific instruction needed** — gather, shuffle, FMA precision, AVX-512 conflict detect.
3. **Performance critical kernel** — BLAS, FFT, codec.
4. **Tail handling complex** — masked AVX-512 lépe než multiple scalar loops.

### Workflow

```c
#include <immintrin.h>

// Skalární baseline
void dot(int n, float *a, float *b, float *result) {
    float s = 0;
    for (int i = 0; i < n; i++) s += a[i] * b[i];
    *result = s;
}

// AVX2 vectorized
void dot_avx2(int n, float *a, float *b, float *result) {
    __m256 vsum = _mm256_setzero_ps();
    int i = 0;
    for (; i + 8 <= n; i += 8) {
        __m256 va = _mm256_loadu_ps(&a[i]);
        __m256 vb = _mm256_loadu_ps(&b[i]);
        vsum = _mm256_fmadd_ps(va, vb, vsum);
    }
    // Reduce 8 → 1
    float tmp[8];
    _mm256_storeu_ps(tmp, vsum);
    float s = tmp[0] + tmp[1] + tmp[2] + tmp[3] +
              tmp[4] + tmp[5] + tmp[6] + tmp[7];
    // Tail
    for (; i < n; i++) s += a[i] * b[i];
    *result = s;
}
```

Pro AVX-512 s mask:

```c
void dot_avx512(int n, float *a, float *b, float *result) {
    __m512 vsum = _mm512_setzero_ps();
    int i = 0;
    for (; i + 16 <= n; i += 16) {
        __m512 va = _mm512_loadu_ps(&a[i]);
        __m512 vb = _mm512_loadu_ps(&b[i]);
        vsum = _mm512_fmadd_ps(va, vb, vsum);
    }
    // Tail s maskem
    if (i < n) {
        __mmask16 m = (1 << (n - i)) - 1;
        __m512 va = _mm512_maskz_loadu_ps(m, &a[i]);
        __m512 vb = _mm512_maskz_loadu_ps(m, &b[i]);
        vsum = _mm512_fmadd_ps(va, vb, vsum);
    }
    *result = _mm512_reduce_add_ps(vsum);
}
```

AVX-512 má `_mm512_reduce_add_ps` — *jediná* intrinsika. Cleaner než AVX2 manual shuffle reduction.

## Restrict keyword

C99 `restrict` (C++ `__restrict__`):

```c
void scale(float * __restrict a, float * __restrict b, int n) {
    for (int i = 0; i < n; i++)
        a[i] = b[i] * 2;
}
```

Compiler dostane slib: pointers neperekrývají *v rámci této funkce*. Vyhne se runtime version selection.

⇒ **Velký** vliv na auto-vec. Snadný a levný způsob, jak vystavit vektorizační příležitosti.

## Alignment

Vektorové load/store *vyžaduje* alignment:

- SSE: 16 B.
- AVX/AVX2: 32 B.
- AVX-512: 64 B.

Nezarovnaná data → exception (s `_mm256_load_ps`) nebo pomalejší (s `_mm256_loadu_ps`).

Alignment v allocation:

```c
float *p = aligned_alloc(64, n * sizeof(float));    // C11
float *p = _mm_malloc(n * sizeof(float), 64);       // Intel
```

V struct:

```c
struct alignas(64) AlignedData {
    float values[1024];
};
```

Cache line alignment (64 B) navíc prevents *false sharing* ([[false-sharing-races]]).

## Tail handling

Smyčka N elementů, vektor šířka W:

- **Padded** — alokuj N rounded up to W, vektorové zpracování, "zbytečné" elementy ignoruj.
- **Mixed** — vektorové loop pro `i = 0..N/W*W`, skalární cleanup `i = N/W*W..N`.
- **Masked** (AVX-512, SVE, RISC-V V) — *jediná* maskovaná instrukce pro tail.

```c
// Mixed approach
int i = 0;
for (; i + 8 <= n; i += 8) { /* vector */ }
for (; i < n; i++) { /* scalar */ }
```

```c
// AVX-512 masked tail
__mmask16 m = (1 << (n - i)) - 1;
__m512 v = _mm512_maskz_loadu_ps(m, &a[i]);
```

AVX-512 masked je *čistší* — eliminuje skalární cleanup loop.

## Profilování

Po vektorizaci ověřit:

1. **Compiler report** (`-fopt-info-vec`) — kontroluj, co je vektorizováno.
2. **Perf counters** — `perf stat -e cpu_clk_unhalted,uops_executed.x` měří vektorové instrukce.
3. **Benchmark** — *vždy* měř před/po. Někdy *vectorized* je *pomalejší* (cache miss, alignment penalty).

VTune / Linux perf umí detailní analýzu — kolik % time je v vektorové ALU vs scalar.

## Co dál

[[gather-scatter]] popisuje, co dělat s *non-stride* přístupy (random hash, indexed read) — jeden z hlavních důvodů, proč auto-vectorization selže na real-world kódu.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §4.3; Allen, R., Kennedy, K.: „Optimizing Compilers for Modern Architectures" (Morgan Kaufmann 2001); Fog, A.: „Optimizing subroutines in assembly language" ([agner.org/optimize](https://www.agner.org/optimize/)); [OpenMP 5.0 SIMD Specification](https://www.openmp.org/spec-html/5.0/openmpsu42.html).*
