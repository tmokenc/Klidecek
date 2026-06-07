---
title: Gather, scatter, maskování a nesouvislý přístup
---

# Gather, scatter, maskování — vektorizace bez konstantního kroku

Reálné programy mají často *neuniformní* paměťový přístup: vyhledávání v hashovací tabulce (hash table lookup), řídké matice (sparse matrix) nebo nepřímé indexování (indirect indexing). Bez instrukcí **gather/scatter** (rozesbírání a rozeslání dat) by takový kód nešlo vektorizovat. AVX-512 a SVE mají gather/scatter jako plnohodnotné (first-class) operace; AVX2 má jen gather.

Co to znamená: gather načte do jednoho vektoru hodnoty z míst, která spolu v paměti nesousedí (podle pole indexů), a scatter naopak hodnoty z vektoru na taková rozházená místa zapíše.

## Krok (stride) a gather

### Jednotkový krok (unit stride — nejlepší případ)

```c
for (i = 0; i < N; i++)
    a[i] = b[i] + c[i];
```

`b[0], b[1], b[2], ...` leží v paměti *vedle sebe*. Vektorový load `_mm256_load_ps(&b[i])` odpovídá jedinému čtení cache line. To je **ideální** stav.

### Konstantní krok (constant stride — přijatelný)

```c
for (i = 0; i < N; i++)
    a[i] = matrix[i * row_size];   // every row_size-th element
```

Vektorová CPU (SVE, RISC-V V) mají load s konstantním krokem (`vlse.v`). SIMD na x86 jej nemá — tam *musíte* použít gather.

### Nepřímý přístup (potřeba gather)

```c
for (i = 0; i < N; i++)
    a[i] = b[indices[i]];          // arbitrary indices
```

`b[indices[0]], b[indices[1]], ...` leží *nesouvisle* v paměti. Bez gather: 8 samostatných skalárních loadů. S gather: jediná instrukce, ale paměť se stejně musí číst *N*-krát.

## Gather v AVX2

```c
__m256i indices = _mm256_loadu_si256(&idx[i]);
__m256 result = _mm256_i32gather_ps(b, indices, 4);  // scale = 4 (sizeof float)
// result[j] = b[indices[j]]
```

Gather pracuje nad *jedním* základním polem (base array) a vektorem indexů.

Výkon (performance):

- Nejlepší případ (všechny indexy míří do *téže* cache line): jako jeden load.
- Nejhorší případ (8 různých cache line): minimálně 8 cyklů.
- Typicky: 3-6 cyklů na jeden gather.

Gather v AVX2 je **2-3× pomalejší** než load s konstantním krokem. Gather v AVX-512 je *lepší* díky vyšší paralelitě load/store jednotek — ale stále je drahý.

## Scatter (zápisová strana)

```c
for (i = 0; i < N; i++)
    b[indices[i]] = a[i];          // scatter
```

AVX-512 (nikoli AVX2): `_mm512_i32scatter_ps`. Je pomalý — N zápisů, žádné slučování (merging).

Riziko: pokud se *dva indexy shodují*, vzniká při scatteru souběh (race). Definované chování závisí na konkrétní instrukční sadě (ISA) — AVX-512 zápisy serializuje, což sráží výkon.

## Detekce konfliktů (AVX-512)

Histogram:

```c
for (i = 0; i < N; i++)
    histogram[bin[i]]++;            // RAW if bin[j] == bin[k]
```

Vektorizace by selhala — pokud `bin[0] == bin[1]`, vznikne závislost typu RAW (čtení po zápisu) na téže položce histogramu.

AVX-512 instrukce `_mm512_conflict_epi32`:

```c
__m512i bins = _mm512_loadu_si512(&bin[i]);
__m512i conf = _mm512_conflict_epi32(bins);
// conf[j] = bitmap[k] for k < j with bins[j] == bins[k]
__m512i counts = _mm512_loadu_si512(&histogram[0]);   // gather
// ... process conflicts with masking
```

Hardware sám detekuje duplicity. Software pak konflikty vyřeší bez souběhu (race).

V praxi: zhruba 3-5× zrychlení u histogramů, ale jen na CPU s AVX-512.

## Maskované loady a story (masked loads & stores)

AVX-512 instrukce `_mm512_maskz_loadu_ps(mask, addr)`:

- Pro každou pozici (lane) `i`: pokud `mask[i] = 1`, načte `addr[i]`. Pokud je `0`, vloží nulu (nebo ponechá původní hodnotu — merge).

Použití:

1. **Zpracování konce pole (tail handling)** — poslední, neúplný vektor.
2. **Podmíněný zápis (conditional store)** — `if (cond) a[i] = ...`.
3. **Řídká matice (sparse matrix)** — načtení jen platných položek.

```c
for (int i = 0; i < n; i += 16) {
    int remaining = n - i;
    __mmask16 m = (remaining >= 16) ? 0xFFFF : ((1 << remaining) - 1);
    __m512 v = _mm512_maskz_loadu_ps(m, &a[i]);
    // ... compute
    _mm512_mask_storeu_ps(&b[i], m, v);
}
```

*Jeden* cyklus pro celé pole, žádné dočišťování konce (tail cleanup).

## Predikované instrukce

AVX-512 přidává maskovanou variantu *všech* aritmetických instrukcí:

```c
__mmask16 m = _mm512_cmp_ps_mask(a, b, _CMP_GT_OQ);
__m512 r = _mm512_mask_add_ps(orig, m, x, y);   // r[i] = m[i] ? x[i]+y[i] : orig[i]
```

`mask_add` provede sčítání `add` jen tam, kde je maska nastavená; jinde ponechá hodnotu `orig`. Ve vektorovém kódu tedy *žádné větvení (skoky)*.

To je *zásadní* výhoda AVX-512 oproti AVX2. AVX2 maskování pouze emuluje pomocí prolínání (blend), což stojí instrukce navíc.

## Srovnávací tabulka

| Operace | SSE | AVX2 | AVX-512 | SVE / RISC-V V |
| :--- | :---: | :---: | :---: | :---: |
| Load s jednotkovým krokem | ✓ | ✓ | ✓ | ✓ |
| Load s konstantním krokem | — | — | — | ✓ (vlse.v) |
| Gather | — | ✓ (pomalý) | ✓ | ✓ |
| Scatter | — | — | ✓ | ✓ |
| Maskování | (blend) | (blend) | ✓ plnohodnotné | ✓ |
| Detekce konfliktů | — | — | ✓ | — (zatím) |
| Redukce (sum, max) | (strom shuffle) | (strom shuffle) | ✓ `_reduce_*` | ✓ |
| Proměnná délka vektoru | — | — | — | ✓ |

⇒ **AVX-512 = AVX2 + maskování + scatter + detekce konfliktů + redukce**. Pro reálný kód (databáze, strojové učení, kodeky) jde o podstatný skok.

## Řídká data: AoS vs SoA

U strukturovaných dat má způsob uložení (layout) dramatický dopad:

### AoS (pole struktur, Array of Structures)

```c
struct Particle { float x, y, z, vx, vy, vz; };
Particle ps[N];

for (i = 0; i < N; i++)
    ps[i].x += ps[i].vx;            // strided/gather access
```

Aktualizace `ps[i].x` pro každé `i` znamená přístup s konstantním krokem (sizeof(struct) = 24 bajtů, krok > 1). Vektorový load tak *nezachytí* sousední hodnoty `x` do jednoho vektoru.

### SoA (struktura polí, Structure of Arrays)

```c
struct ParticleData {
    float x[N], y[N], z[N], vx[N], vy[N], vz[N];
} particles;

for (i = 0; i < N; i++)
    particles.x[i] += particles.vx[i];
```

Hodnoty `x[i]` leží vedle sebe → load s jednotkovým krokem. Vektorizace je **triviální** a *2-4× rychlejší*.

Kompromis: SoA je méně přirozená pro objektový návrh (OOP) a náhodný přístup (random access). Často se proto kombinuje **AoSoA** (Array of Structures of Arrays) — malá struktura s osmiprvkovými poli.

## Násobení řídké matice vektorem (SpMV)

Klasický kritický výpočetní kernel:

```c
for (i = 0; i < n; i++)
    for (j = row_start[i]; j < row_start[i+1]; j++)
        y[i] += value[j] * x[col_idx[j]];          // gather x via col_idx
```

`x[col_idx[j]]` je gather. AVX-512 gather + FMA → vektorizovaná SpMV je zhruba 3× rychlejší než skalární varianta.

Knihovny: Intel MKL, OpenBLAS, SuiteSparse.

## Hashovací spojení (hash join, databáze)

```sql
SELECT * FROM A JOIN B ON A.key = B.key
```

Implementace: z tabulky B se postaví hashovací tabulka, kterou pak tabulka A prochází (probe).

```c
for (i = 0; i < |A|; i++) {
    h = hash(A.key[i]);
    pos = hash_table.lookup(h);     // gather
    if (B.key[pos] == A.key[i])     // compare
        emit(A.row[i], B.row[pos]);
}
```

Gather + podmíněný výstup. Maskovaná varianta v AVX-512 je 2-3× rychlejší než skalární.

Vektorové databáze (DuckDB, ClickHouse, MonetDB) využívají AVX-512 / AVX2 ve velkém.

## Co dál

Tématem 5 končíme. Téma 6 ([[tlp-uvod]]) přechází k **vláknovému paralelismu (thread)** — SMT a Hyper-Threading. Po SIMD je dalším skokem DLP → kombinace s TLP.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §4.3; Intel® 64 and IA-32 Architectures Optimization Reference Manual ([Intel SDM](https://www.intel.com/sdm)); Polychroniou, O. et al.: „Rethinking SIMD Vectorization for In-Memory Databases" (SIGMOD 2015, [DOI 10.1145/2723372.2747645](https://doi.org/10.1145/2723372.2747645)); [Intel AVX-512 Programming Guide](https://www.intel.com/content/www/us/en/architecture-and-technology/avx-512-overview.html).*
