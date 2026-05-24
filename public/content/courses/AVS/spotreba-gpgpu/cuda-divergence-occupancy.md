---
title: CUDA — branch divergence, occupancy, optimization
---

# CUDA programming — divergence, occupancy, optimization

GPU dosáhne peak performance *pokud* kód *respektuje* SIMT model. Divergence, low occupancy, uncoalesced access — vše může snížit výkon o řád. Tato sekce shrnuje hlavní praktické bottlenecks a optimalizace.

## Branch divergence

Vlákna v warpu vykonají *stejnou* instrukci. Co když mají *odlišný* control flow?

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

GPU *postupně* vykonává obě větve:

1. Phase 1: `compute_A()` se vykoná, ale **jen** T16-T31 *zapisují*. T0-T15 jsou *maskované* (no-op).
2. Phase 2: `compute_B()` se vykoná, jen T0-T15 zapisují. T16-T31 maskované.

Total: **2× delší** než kdyby všichni dělali totéž.

### Patologie

```cuda
if (tid % 2 == 0) compute_A();
else              compute_B();
```

50/50 split. *Vždy* 2× pokuta — *žádný* warp není uniformně.

Worst case: nested branches:

```cuda
if (cond1) {
    if (cond2) {
        if (cond3) {
            ...    // 8× slower (3 levels of branch)
        }
    }
}
```

Bez careful design exponenciální slowdown.

### Mitigace

1. **Reorganize data** — group threads s same control flow.
2. **Sort** — pokud branch závisí na hodnotě, sort data před launch.
3. **Replace branches with arithmetic** — `result = cond ? a : b` → `result = cond * a + (1-cond) * b` (no branch).
4. **Branchless algorithms** — known patterns (SAXPY, reduction) without conditionals.

::: viz gpu-warp-divergence "Vyber rozdělení threadů (grouped split slider / alternating / random / uniform). Sleduj 2 fáze (compute_A / compute_B) — uniform = 1 cyklus, divergence = 2."
:::

## Memory coalescing

Připomenutí: consecutive threads in warp should access consecutive memory addresses.

```cuda
// Good: T0 reads a[0], T1 reads a[1], ..., T31 reads a[31]
sum += a[blockIdx.x * blockDim.x + threadIdx.x];

// Bad: T0 reads a[0], T1 reads a[32], ..., T31 reads a[992]
sum += a[threadIdx.x * 32 + blockIdx.x];
```

Uncoalesced = 32 separate transactions per warp instead of 1. 32× more bandwidth used.

### Stride patterns

Common bad pattern: row-major iteration of column-major storage.

```cuda
// Matrix B stored column-major (B[col][row])
// Access pattern: each thread reads B[row][col]
//                Coalesced for row → col_stride access
//                Uncoalesced for col → row_stride access
```

Layout transformation často critical. Use NVIDIA Visual Profiler / Nsight to detect.

## Shared memory bank conflicts

Shared memory rozdělena na 32 *banks*. Each bank serves 1 access per cycle. Pokud více threads in warp access *same bank* (different addresses) → *serialized*.

```cuda
__shared__ float data[32][32];

// No conflict — each thread accesses different bank
float v = data[threadIdx.x][0];

// 32-way bank conflict — all threads access bank 0
float v = data[0][threadIdx.x];     // column 0, bank for data[0][i] depends on i
```

Detection: NVIDIA profiler counters `shared_load_bank_conflict`.

Mitigation: pad shared arrays (`__shared__ float data[32][33]` adds 1 column padding).

::: viz bank-conflict-warp "Vyber přístupový pattern (no conflict / 2-way / 4-way / 32-way / broadcast / padded). Sleduj kolik threadů míří na každý z 32 bank — vícenásobné kolize serializují."
:::

## Occupancy

Occupancy = *kolik* warps active per SM relative to maximum.

NVIDIA A100: max 64 warps active per SM. Pokud kernel uses 32 warps per SM → occupancy 50%.

### Limity occupancy

Per-block resources limit how many blocks fit per SM:

- **Registers per thread** — limited per SM (~65k registers / SM).
- **Shared memory per block** — limited per SM (~96 kB).
- **Threads per block** — limited per SM (~2048).

If kernel uses 64 registers/thread → max 1024 active threads (64k regs ÷ 64). That's 32 warps → 50% occupancy.

### Optimalizace

```cuda
__global__ __launch_bounds__(256, 4)
void mykernel() {
    ...
}
```

`__launch_bounds__(maxThreadsPerBlock, minBlocksPerSM)` tells compiler: optimize for at least 4 blocks per SM. Compiler limits registers per thread accordingly.

Trade-off: fewer registers per thread → less instruction-level reuse → may need more memory access.

### High occupancy not always best

Sometimes *low occupancy + more registers per thread* better. Each thread has more state in registers → less memory access → less latency hiding needed.

Common case: matrix multiply with large tiles. 25% occupancy can outperform 100% if each thread fully utilizes its registers.

Performance tuning is empirical — try different `__launch_bounds__` and measure.

## Latency hiding via TLP

GPU hides DRAM latency (~500 cycles) by switching warps. Need enough *parallel warps* to fill latency.

Required parallelism = latency × throughput / work-per-warp.

For A100: 500 cycles × 64 active warps / (1 instruction per cycle) = 32000 warp-cycles of work to hide one memory access.

⇒ Many active warps essential. Low occupancy = exposed latency = slow.

## OpenMP target offload — alternativa CUDA

OpenMP 4.0+ supports GPU offload via *pragma*:

```c
#pragma omp target teams distribute parallel for
for (int i = 0; i < N; i++)
    a[i] = b[i] * c[i];
```

Compiler (GCC, Clang) generates GPU code from same source.

- **target** — execute on accelerator.
- **teams** — analog of CUDA blocks.
- **distribute parallel for** — analog of `parallel for` but for GPU.

Benefit: portability. Same code on CPU, NVIDIA GPU, AMD GPU, Intel GPU.

Performance: typically 80-90 % of hand-tuned CUDA. Worth it for *portability* vs CUDA lock-in.

## Tensor Core programming

For matrix multiply, NVIDIA provides specialized API:

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

Single `mma_sync` performs **16×16×16 = 4096 FP16 multiply-adds in 1 instruction**. 5-10× speedup over plain CUDA cores for matrix workloads.

Used internally by cuBLAS, cuDNN, PyTorch — programmer typically doesn't write directly.

## Optimization workflow

1. **Profile** — Nsight, NVIDIA Visual Profiler. Identify bottleneck (compute, memory, latency).
2. **Coalesce memory access** — verify with profiler.
3. **Maximize occupancy** — adjust block size, registers.
4. **Use shared memory** for data reuse.
5. **Avoid divergence** — branchless when possible.
6. **Use tensor cores** for matrix workloads.

Modern GPU code achieves **70-90 %** of peak FLOPS with above. CPU-bound code rarely achieves more than 30 % peak.

## When NOT to use GPU

- Sekvenční / irregular control flow (parser, compiler, DB query planner).
- Small data (< 1 MB) — overhead of CPU↔GPU transfer dominates.
- Latency-critical (real-time control) — GPU has high response latency.
- Complex memory access patterns (graph traversal, sparse matrix without structure).

GPU = throughput. CPU = latency. Choose based on problem.

## Závěrečné shrnutí

Architektura výpočetních systémů je *kompromis* mezi pákami:

- **ILP** (pipelining + OoO + superskalár) — implicit, HW-driven.
- **DLP** (SIMD + GPU) — explicit, programátor + compiler.
- **TLP** (multi-core + SMT) — explicit, programátor.
- **Cache** + paměťová hierarchie — kompenzace memory wall.
- **Predikce + spekulace** — překryje neefekty branches a memory.
- **Power management** — DVFS, gating, big.LITTLE — energy-aware design.

Optimalizace programu = identifikace bottlenecku + nasazení odpovídající páky. Profil-driven, iterativní, empirický.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: NVIDIA: „CUDA Best Practices Guide" ([docs.nvidia.com/cuda](https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/)); Kirk, D.B., Hwu, W.W.: „Programming Massively Parallel Processors" (4th ed., Morgan Kaufmann 2022); [OpenMP 5.2 Target Offload](https://www.openmp.org/spec-html/5.0/openmpse23.html); [Nsight Compute Documentation](https://docs.nvidia.com/nsight-compute/).*
