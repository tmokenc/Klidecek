---
title: CUDA — divergence větvení, occupancy, optimalizace
---

# Programování v CUDA — divergence, occupancy, optimalizace

GPU dosáhne špičkového výkonu (peak performance) *jen tehdy*, když kód *respektuje* model SIMT. Divergence větvení, nízká occupancy (obsazenost) i nesdružené přístupy do paměti (uncoalesced access) — to vše může snížit výkon o celý řád. Tato sekce shrnuje hlavní praktická úzká místa (bottlenecks) a optimalizace.

## Divergence větvení (branch divergence)

Vlákna (threads) v jednom warpu vykonávají *stejnou* instrukci. Co se ale stane, když mají *odlišný* tok řízení (control flow)?

```cuda
__global__ void diverging(int *out) {
    int tid = threadIdx.x;
    if (tid >= 16) {                // 1st half vs 2nd half
        out[tid] = compute_A(tid);   // T16..T31
    } else {
        out[tid] = compute_B(tid);   // T0..T15
    }
}
```

GPU vykoná obě větve *postupně*:

1. Fáze 1: provede se `compute_A()`, ale *zápis* udělají **jen** vlákna T16-T31. Vlákna T0-T15 jsou *maskovaná* (no-op, žádná operace).
2. Fáze 2: provede se `compute_B()`, zapisují jen T0-T15. Vlákna T16-T31 jsou maskovaná.

Celkem to trvá **2× déle**, než kdyby všechna vlákna dělala totéž.

### Patologie

```cuda
if (tid % 2 == 0) compute_A();
else              compute_B();
```

Rozdělení v poměru 50/50. *Vždy* dvojnásobná pokuta — *žádný* warp neběží uniformně (jednotně).

Nejhorší případ jsou vnořené větve:

```cuda
if (cond1) {
    if (cond2) {
        if (cond3) {
            ...    // 8× slower (3 levels of branch)
        }
    }
}
```

Bez pečlivého návrhu (careful design) dostáváme exponenciální zpomalení.

### Zmírnění (mitigace)

1. **Reorganizace dat** — seskup vlákna se stejným tokem řízení.
2. **Třídění (sort)** — pokud větev závisí na hodnotě, setřiď data před spuštěním (launch).
3. **Nahrazení větvení aritmetikou** — `result = cond ? a : b` přepiš na `result = cond * a + (1-cond) * b` (žádná větev).
4. **Algoritmy bez větvení (branchless)** — známé vzory (SAXPY, redukce) bez podmínek.

::: viz gpu-warp-divergence "Vyber rozdělení threadů (grouped split slider / alternating / random / uniform). Sleduj 2 fáze (compute_A / compute_B) — uniform = 1 cyklus, divergence = 2."
:::

## Sdružování přístupů do paměti (memory coalescing)

Připomeňme: po sobě jdoucí vlákna ve warpu by měla přistupovat k po sobě jdoucím adresám v paměti.

```cuda
// Good: T0 reads a[0], T1 reads a[1], ..., T31 reads a[31]
sum += a[blockIdx.x * blockDim.x + threadIdx.x];

// Bad: T0 reads a[0], T1 reads a[32], ..., T31 reads a[992]
sum += a[threadIdx.x * 32 + blockIdx.x];
```

Nesdružený přístup znamená 32 samostatných transakcí na jeden warp místo jediné. Spotřebuje se tak 32× více přenosové kapacity (bandwidth).

### Vzory s krokem (stride patterns)

Častý špatný vzor je procházení po řádcích u dat uložených po sloupcích.

```cuda
// Matrix B stored column-major (B[col][row])
// Access pattern: each thread reads B[row][col]
//                Coalesced for row → col_stride access
//                Uncoalesced for col → row_stride access
```

Změna rozložení dat (layout) je často klíčová. K detekci použij NVIDIA Visual Profiler nebo Nsight.

## Konflikty bank ve sdílené paměti (shared memory bank conflicts)

Sdílená paměť je rozdělena na 32 *bank* (paměťových bank). Každá banka obslouží 1 přístup za cyklus. Pokud více vláken ve warpu přistupuje ke *stejné bance* (na různé adresy), přístupy se *serializují* (vykonají se postupně za sebou).

```cuda
__shared__ float data[32][32];

// No conflict — each thread accesses different bank
float v = data[threadIdx.x][0];

// 32-way bank conflict — all threads access bank 0
float v = data[0][threadIdx.x];     // column 0, bank for data[0][i] depends on i
```

Detekce: čítače v NVIDIA profileru `shared_load_bank_conflict`.

Zmírnění: vycpávka (padding) sdílených polí (`__shared__ float data[32][33]` přidá jeden sloupec navíc).

::: viz bank-conflict-warp "Vyber přístupový pattern (no conflict / 2-way / 4-way / 32-way / broadcast / padded). Sleduj kolik threadů míří na každý z 32 bank — vícenásobné kolize serializují."
:::

## Occupancy (obsazenost)

Occupancy udává, *kolik* warpů je aktivních na jednom SM v poměru k maximu.

NVIDIA A100: maximálně 64 aktivních warpů na SM. Pokud kernel využívá 32 warpů na SM, je occupancy 50 %.

### Limity occupancy

Prostředky vázané na blok určují, kolik bloků se na jeden SM vejde:

- **Registry na vlákno (registers per thread)** — omezené na SM (~65 tis. registrů na SM).
- **Sdílená paměť na blok** — omezená na SM (~96 kB).
- **Vlákna na blok** — omezená na SM (~2048).

Pokud kernel používá 64 registrů na vlákno, je maximum 1024 aktivních vláken (64 tis. registrů ÷ 64). To je 32 warpů, tedy 50% occupancy.

### Optimalizace

```cuda
__global__ __launch_bounds__(256, 4)
void mykernel() {
    ...
}
```

`__launch_bounds__(maxThreadsPerBlock, minBlocksPerSM)` říká překladači (compiler): optimalizuj pro alespoň 4 bloky na SM. Překladač podle toho omezí počet registrů na vlákno.

Kompromis: méně registrů na vlákno znamená menší znovupoužití na úrovni instrukcí (instruction-level reuse), což může vyžadovat více přístupů do paměti.

### Vysoká occupancy není vždy nejlepší

Někdy je lepší *nízká occupancy a více registrů na vlákno*. Každé vlákno pak drží v registrech více stavu, takže potřebuje méně přístupů do paměti, a tím i méně skrývání latence (latency hiding).

Typický případ: násobení matic s velkými dlaždicemi (tiles). 25% occupancy může předčit 100%, pokud každé vlákno plně využije své registry.

Ladění výkonu (performance tuning) je empirické — zkoušej různá nastavení `__launch_bounds__` a měř.

## Skrývání latence pomocí TLP

GPU skrývá latenci DRAM (~500 cyklů) tím, že přepíná warpy. Aby latenci zaplnilo, potřebuje dostatek *paralelních warpů*.

Potřebný paralelismus = latence × propustnost / práce na jeden warp.

Pro A100: 500 cyklů × 64 aktivních warpů / (1 instrukce za cyklus) = 32000 warp-cyklů práce na zakrytí jednoho přístupu do paměti.

⇒ Mnoho aktivních warpů je tedy zásadní. Nízká occupancy znamená nezakrytou latenci a tím pomalý běh.

## OpenMP target offload — alternativa k CUDA

OpenMP od verze 4.0 podporuje offload na GPU pomocí *pragma direktiv*:

```c
#pragma omp target teams distribute parallel for
for (int i = 0; i < N; i++)
    a[i] = b[i] * c[i];
```

Překladač (GCC, Clang) vygeneruje kód pro GPU ze stejného zdroje.

- **target** — vykonej na akcelerátoru.
- **teams** — obdoba bloků v CUDA.
- **distribute parallel for** — obdoba `parallel for`, ale pro GPU.

Přínos: přenositelnost. Stejný kód běží na CPU, GPU NVIDIA, GPU AMD i GPU Intel.

Výkon: typicky 80-90 % ručně laděné CUDA. Vyplatí se kvůli *přenositelnosti* oproti uzamčení na CUDA (CUDA lock-in).

## Programování Tensor Core

Pro násobení matic poskytuje NVIDIA specializované API:

```cuda
#include <mma.h>
using namespace nvcuda::wmma;

fragment<matrix_a, 16, 16, 16, half, row_major> a_frag;
fragment<matrix_b, 16, 16, 16, half, col_major> b_frag;
fragment<accumulator, 16, 16, 16, float> c_frag;

load_matrix_sync(a_frag, A_smem, 16);
load_matrix_sync(b_frag, B_smem, 16);
fill_fragment(c_frag, 0.0f);

mma_sync(c_frag, a_frag, b_frag, c_frag);

store_matrix_sync(C_smem, c_frag, 16, mem_row_major);
```

Jediná instrukce `mma_sync` provede **16×16×16 = 4096 operací násobení a sčítání (multiply-add) ve formátu FP16 v rámci jediné instrukce**. To je 5-10× zrychlení oproti běžným CUDA jádrům u maticových úloh.

Interně to využívají knihovny cuBLAS, cuDNN i PyTorch — programátor toto API typicky nepíše přímo.

## Pracovní postup optimalizace

1. **Profiluj** — Nsight, NVIDIA Visual Profiler. Najdi úzké místo (výpočet, paměť, latence).
2. **Sdruž přístupy do paměti (coalesce)** — ověř profilerem.
3. **Maximalizuj occupancy** — uprav velikost bloku a počet registrů.
4. **Využij sdílenou paměť** pro znovupoužití dat.
5. **Vyhni se divergenci** — kde to jde, programuj bez větvení (branchless).
6. **Použij tensor cores** pro maticové úlohy.

Moderní kód pro GPU s výše uvedeným dosahuje **70-90 %** špičkového výkonu (peak FLOPS). Kód vázaný na CPU (CPU-bound) zřídka překročí 30 % špičky.

## Kdy GPU NEpoužívat

- Sekvenční nebo nepravidelný tok řízení (parser, překladač, plánovač dotazů databáze).
- Malá data (< 1 MB) — převáží režie přenosu mezi CPU a GPU.
- Úlohy kritické na latenci (řízení v reálném čase) — GPU má vysokou latenci odezvy.
- Složité vzory přístupu do paměti (procházení grafů, řídké matice bez struktury).

GPU = propustnost (throughput). CPU = latence. Volbu dělej podle problému.

## Závěrečné shrnutí

Architektura výpočetních systémů je *kompromis* mezi několika pákami:

- **ILP** (pipelining + OoO + superskalár) — implicitní, řízený hardwarem.
- **DLP** (SIMD + GPU) — explicitní, řeší programátor a překladač (compiler).
- **TLP** (multi-core + SMT) — explicitní, řeší programátor.
- **Cache** a paměťová hierarchie — kompenzace paměťové stěny (memory wall).
- **Predikce a spekulace** — překryjí neefektivity větvení (branches) a paměti.
- **Správa spotřeby (power management)** — DVFS, gating, big.LITTLE — návrh ohlížející se na energii.

Optimalizace programu = identifikace úzkého místa (bottleneck) a nasazení odpovídající páky. Postup řízený profilem, iterativní a empirický.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: NVIDIA: „CUDA Best Practices Guide" ([docs.nvidia.com/cuda](https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/)); Kirk, D.B., Hwu, W.W.: „Programming Massively Parallel Processors" (4th ed., Morgan Kaufmann 2022); [OpenMP 5.0 Target Offload](https://www.openmp.org/spec-html/5.0/openmpse23.html); [Nsight Compute Documentation](https://docs.nvidia.com/nsight-compute/).*
