---
title: Gather, scatter, masking a non-stride access
---

# Gather, scatter, masking — non-stride vektorizace

Reálné kódy mají často *neuniformní* paměťový přístup: hash table lookup, sparse matrix, indirect indexing. Bez **gather/scatter** by takový kód nešel vektorizovat. AVX-512 a SVE mají *first-class* gather/scatter; AVX2 jen gather.

## Stride a gather

### Unit stride (best case)

```c
for (i = 0; i < N; i++)
    a[i] = b[i] + c[i];
```

`b[0], b[1], b[2], ...` jsou *sousední*. Vektorový load `_mm256_load_ps(&b[i])` = jeden cache line read. **Ideal**.

### Constant stride (acceptable)

```c
for (i = 0; i < N; i++)
    a[i] = matrix[i * row_size];   // every row_size-th element
```

Vektorové CPU (SVE, RISC-V V) mají strided load (`vlse.v`). x86 SIMD nemá — *musíte* gather.

### Indirect (gather needed)

```c
for (i = 0; i < N; i++)
    a[i] = b[indices[i]];          // arbitrary indices
```

`b[indices[0]], b[indices[1]], ...` jsou *nekoherentní*. Bez gather: 8 separate scalar loads. S gather: 1 instrukce, ale stále *N* cache accesses.

## AVX2 gather

```c
__m256i indices = _mm256_loadu_si256(&idx[i]);
__m256 result = _mm256_i32gather_ps(b, indices, 4);  // scale = 4 (sizeof float)
// result[j] = b[indices[j]]
```

Gather na *jedno* base array + vector indices.

Performance:

- Best case (indices hit *same line*): jako 1 load.
- Worst case (8 different cache lines): 8 cycles minimum.
- Typical: 3-6 cycles per gather.

AVX2 gather je **2-3× pomalejší** než stride load. AVX-512 gather je *lepší* díky lepší L/S parallelism — ale stále drahá.

## Scatter (write side)

```c
for (i = 0; i < N; i++)
    b[indices[i]] = a[i];          // scatter
```

AVX-512 (no AVX2): `_mm512_i32scatter_ps`. Pomalá — N writes, no merging.

Hazard: pokud *dva indices se shodují*, scatter race. Definované chování závisí na ISA (AVX-512 says serialized — performance hit).

## Conflict detection (AVX-512)

Histogram:

```c
for (i = 0; i < N; i++)
    histogram[bin[i]]++;            // RAW if bin[j] == bin[k]
```

Vektorizace by selhala — pokud `bin[0] == bin[1]`, RAW na histogram entry.

AVX-512 `_mm512_conflict_epi32`:

```c
__m512i bins = _mm512_loadu_si512(&bin[i]);
__m512i conf = _mm512_conflict_epi32(bins);
// conf[j] = bitmap[k] for k < j with bins[j] == bins[k]
__m512i counts = _mm512_loadu_si512(&histogram[0]);   // gather
// ... process conflicts with masking
```

Hardware detekuje duplicates. Software pak resolves bez race.

Reálně: ~3-5× speedup pro histograms, ale jen na AVX-512 CPU.

## Masked loads & stores

AVX-512 `_mm512_maskz_loadu_ps(mask, addr)`:

- Pro každý lane `i`: pokud `mask[i] = 1`, load `addr[i]`. Pokud `0`, zero (nebo merge with original).

Použití:

1. **Tail handling** — last partial vector.
2. **Conditional store** — `if (cond) a[i] = ...`.
3. **Sparse matrix** — load only valid entries.

```c
for (int i = 0; i < n; i += 16) {
    int remaining = n - i;
    __mmask16 m = (remaining >= 16) ? 0xFFFF : ((1 << remaining) - 1);
    __m512 v = _mm512_maskz_loadu_ps(m, &a[i]);
    // ... compute
    _mm512_mask_storeu_ps(&b[i], m, v);
}
```

*Jeden* loop pro celé pole, žádný tail cleanup.

## Predikované instrukce

AVX-512 přidává mask version *všech* arithmetic instrukcí:

```c
__mmask16 m = _mm512_cmp_ps_mask(a, b, _CMP_GT_OQ);
__m512 r = _mm512_mask_add_ps(orig, m, x, y);   // r[i] = m[i] ? x[i]+y[i] : orig[i]
```

`mask_add` provede `add` jen kde maskovaný; jinak ponechá `orig` value. *No branching* in vector code.

To je *fundamentální* výhoda AVX-512 nad AVX2. AVX2 emuluje masking přes blend (extra instrukce).

## Tabulka srovnání

| Operace | SSE | AVX2 | AVX-512 | SVE / RISC-V V |
| :--- | :---: | :---: | :---: | :---: |
| Unit stride load | ✓ | ✓ | ✓ | ✓ |
| Constant stride load | — | — | — | ✓ (vlse.v) |
| Gather | — | ✓ (slow) | ✓ | ✓ |
| Scatter | — | — | ✓ | ✓ |
| Masking | (blend) | (blend) | ✓ first-class | ✓ |
| Conflict detect | — | — | ✓ | — (yet) |
| Reduce (sum, max) | (shuffle tree) | (shuffle tree) | ✓ `_reduce_*` | ✓ |
| Variable VL | — | — | — | ✓ |

⇒ **AVX-512 = AVX2 + masking + scatter + conflict + reductions**. Pro real-world code (databáze, ML, codec) podstatný skok.

## Sparse data: AoS vs SoA

Pro structured data, layout dramatic effect:

### AoS (Array of Structures)

```c
struct Particle { float x, y, z, vx, vy, vz; };
Particle ps[N];

for (i = 0; i < N; i++)
    ps[i].x += ps[i].vx;            // strided/gather access
```

Update `ps[i].x` pro každé `i` znamená přístup *strided* (sizeof(struct) = 24 byte, stride > 1). Vektorové load *nezachytí* sousední `x` values v jednom vektoru.

### SoA (Structure of Arrays)

```c
struct ParticleData {
    float x[N], y[N], z[N], vx[N], vy[N], vz[N];
} particles;

for (i = 0; i < N; i++)
    particles.x[i] += particles.vx[i];
```

`x[i]` jsou sousední → unit stride load. Vektorizace **triviální**, *2-4× rychlejší*.

Trade-off: SoA méně přirozená pro OOP / random access. Často kombinace **AoSoA** (Array of Structures of Arrays) — small struct of 8-element arrays.

## Sparse matrix-vector multiply (SpMV)

Klasický kritický kernel:

```c
for (i = 0; i < n; i++)
    for (j = row_start[i]; j < row_start[i+1]; j++)
        y[i] += value[j] * x[col_idx[j]];          // gather x via col_idx
```

`x[col_idx[j]]` = gather. AVX-512 gather + FMA → vektorizovaná SpMV ~3× rychlejší než scalar.

Knihovny: Intel MKL, OpenBLAS, suiteSparse.

## Hash join (databáze)

```sql
SELECT * FROM A JOIN B ON A.key = B.key
```

Implementace: build hash table from B, probe hash table from A.

```c
for (i = 0; i < |A|; i++) {
    h = hash(A.key[i]);
    pos = hash_table.lookup(h);     // gather
    if (B.key[pos] == A.key[i])     // compare
        emit(A.row[i], B.row[pos]);
}
```

Gather + conditional emit. AVX-512 maskovaná version 2-3× rychlejší než scalar.

Vector DB (DuckDB, ClickHouse, MonetDB) heavy AVX-512 / AVX2 use.

## Co dál

Topic 5 končí. Topic 6 ([[tlp-uvod]]) přechází k **vláknovému paralelismu** — SMT a Hyper-Threading. Po SIMD je další skok DLP → kombinace s TLP.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §4.3; Intel® 64 and IA-32 Architectures Optimization Reference Manual ([Intel SDM](https://www.intel.com/sdm)); Polychroniou, O. et al.: „Rethinking SIMD Vectorization for In-Memory Databases" (SIGMOD 2015, [DOI 10.1145/2723372.2747645](https://doi.org/10.1145/2723372.2747645)); [Intel AVX-512 Programming Guide](https://www.intel.com/content/www/us/en/architecture-and-technology/avx-512-overview.html).*
