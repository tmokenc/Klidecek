---
title: GPU architektura — SM, warp, SIMT
---

# GPU architektura pro obecné výpočty

CPU je *latency-optimized*: rychlý OoO single-thread. GPU je *throughput-optimized*: tisíce *jednoduchých* vláken, dohromady extreme propustnost. Tato sekce vysvětluje *jak* GPU vypadá uvnitř.

## CPU vs GPU — design philosophy

| | CPU | GPU |
| :--- | :--- | :--- |
| Cores | 8-64 | 1000-10000 (ALU lanes / CUDA cores) |
| Single-thread perf | high (IPC 2-4) | low (in-order, simple) |
| Cache | velký, multi-level | malý (~40 MB L2 total) |
| Branch prediction | sophisticated | basic / none |
| OoO | yes | no (in-order) |
| Memory bandwidth | 50-150 GB/s | 1000-2000 GB/s (HBM) |
| Latency hiding | OoO + cache | massive multithreading |
| Power per chip | 100-300 W | 250-700 W |
| Use case | sekvenční, irregular | datově-paralelní, regulární |

GPU má **mnoho** "cores" (CUDA cores nebo Stream Processors v AMD terminologii), ale tyto nejsou plnohodnotná jádra — jsou to *ALU lanes*. Skutečné kontrolní jednotky jsou *SM* (Streaming Multiprocessors).

## NVIDIA Streaming Multiprocessor (SM)

NVIDIA A100 (Ampere 2020):

- 108 SMs.
- Each SM: 64 FP32 CUDA cores + 32 FP64 + 4 Tensor cores.
- 6912 CUDA cores total.
- Shared 40 GB HBM2 memory, 1555 GB/s bandwidth.

Each SM:

- 4 warp schedulers.
- 65k registers (256 kB per SM).
- 192 kB shared memory + L1 cache.
- Up to 64 warps active (2048 threads).

::: svg "SM architecture (zjednodušené)"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5">
    <rect x="20" y="20" width="500" height="200" rx="6"/>
  </g>
  <text x="270" y="40" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="12">Streaming Multiprocessor (SM)</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="40" y="60" width="100" height="50" rx="3"/>
    <rect x="150" y="60" width="100" height="50" rx="3"/>
    <rect x="260" y="60" width="100" height="50" rx="3"/>
    <rect x="370" y="60" width="130" height="50" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="90" y="80" font-weight="600">Warp Sched 0</text>
    <text x="200" y="80" font-weight="600">Warp Sched 1</text>
    <text x="310" y="80" font-weight="600">Warp Sched 2</text>
    <text x="435" y="80" font-weight="600">Warp Sched 3</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="90" y="98">16 warps</text>
    <text x="200" y="98">16 warps</text>
    <text x="310" y="98">16 warps</text>
    <text x="435" y="98">16 warps</text>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="40" y="120" width="220" height="35" rx="3"/>
    <rect x="270" y="120" width="100" height="35" rx="3"/>
    <rect x="380" y="120" width="120" height="35" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="150" y="142">64× FP32 CUDA cores</text>
    <text x="320" y="142">32× FP64</text>
    <text x="440" y="142">4× Tensor cores</text>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="40" y="165" width="220" height="40" rx="3"/>
    <rect x="270" y="165" width="230" height="40" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="150" y="185">Register file (256 kB)</text>
    <text x="385" y="185">Shared memory / L1 (192 kB)</text>
  </g>
</svg>
:::

## SIMT — Single Instruction Multiple Threads

Klíčový model: **warp** = skupina 32 vláken (NVIDIA), 64 (AMD wavefront), sdílejí *jeden* instruction stream.

```
Warp instrukce:
T0: r1 = a[0] + b[0]
T1: r1 = a[1] + b[1]
T2: r1 = a[2] + b[2]
...
T31: r1 = a[31] + b[31]
```

Všech 32 vláken vykoná *stejnou* instrukci na *vlastních* datech. SIMD-like, ale "thread" je *logická* jednotka.

V kontrastu k SIMD x86: tam *všechny* lanes paralelní v ALU. V SIMT každé vlákno *logicky* sequenční, ale *fyzicky* všechna lockstep.

## Warps a scheduler

Warp scheduler ručí *kterému* warpu dát next instruction:

- Warp ready (no stall): vydat.
- Warp stalled (memory miss, sync): switch to another warp.

Zero-cost context switch — *register state* warpu je v register file (~ 1 takt access).

⇒ Tisíce vláken active simultaneously. Když několik čeká na memory, jiné běží. **Memory latency hidden** by massive parallelism.

CPU OoO čeká pomocí RS/ROB (200 položek). GPU čeká pomocí 2000+ warps × 32 threads = 64000 ready threads. Massive scale.

## Thread hierarchy

CUDA programmer-visible struktura:

- **Thread** — basic unit.
- **Block** (CUDA) / Workgroup (OpenCL) — group of threads.
- **Grid** — collection of blocks.

```c
__global__ void add(float *a, float *b, float *c, int N) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < N)
        c[i] = a[i] + b[i];
}

// Launch:
int blockSize = 256;
int gridSize = (N + blockSize - 1) / blockSize;
add<<<gridSize, blockSize>>>(a, b, c, N);
```

Each thread computes unique `i` from `blockIdx + threadIdx`. Block of 256 threads = 8 warps. Grid of K blocks → K × 256 threads total.

Pro N = 1M, blockSize 256: gridSize = 3907. Total 1M threads launched. GPU sequentially schedules blocks on SMs.

### Block sizing

Maximum block size: 1024 threads (32 warps) on most NVIDIA GPUs. Práce per block fits in *one SM*.

Optimal block size: 128-512 threads typically. Tradeoff:

- Větší block → lepší register reuse, lepší shared memory amortization.
- Menší block → víc parallel blocks per SM (lepší latency hiding).

::: viz memory-coalescing-pattern "Vyber přístupový pattern (consecutive / stride 2 / 8 / 32 / random). 32 threadů → DRAM transakce; consecutive = 1, random = až 32. Bandwidth efficiency klesá s každou."
:::

## Memory hierarchy

GPU má vlastní hierarchii:

| Memory | Latence | BW | Velikost | Scope |
| :--- | :---: | :---: | :---: | :--- |
| Registers | 1 cyklus | enormous | ~64 per thread | thread |
| Shared memory | ~30 cyklů | 5 TB/s | 64 kB / SM | block |
| L1 cache | ~30 | 5 TB/s | 128 kB / SM | SM |
| L2 cache | ~200 | 4 TB/s | 40 MB | global (chip-wide) |
| Global memory (HBM) | ~500 | 1.5 TB/s | 40-80 GB | global |
| Texture / Const | ~500 | 1.5 TB/s | 64 kB const | global, cached |

### Shared memory (smem)

Per-block fast memory. Programátor manuálně manageuje.

```c
__global__ void matmul_tiled(float *A, float *B, float *C, int N) {
    __shared__ float tileA[16][16];
    __shared__ float tileB[16][16];

    int row = blockIdx.y * 16 + threadIdx.y;
    int col = blockIdx.x * 16 + threadIdx.x;
    float sum = 0;
    for (int k = 0; k < N / 16; k++) {
        // Cooperative load: each thread loads 1 element
        tileA[threadIdx.y][threadIdx.x] = A[row * N + k * 16 + threadIdx.x];
        tileB[threadIdx.y][threadIdx.x] = B[(k * 16 + threadIdx.y) * N + col];
        __syncthreads();              // wait for tile load complete

        // Compute partial product using shared memory
        for (int i = 0; i < 16; i++)
            sum += tileA[threadIdx.y][i] * tileB[i][threadIdx.x];
        __syncthreads();
    }
    C[row * N + col] = sum;
}
```

Tiled matrix multiply: load 16×16 tile to smem, threads reuse → much less global access. Standard optimization.

### Coalesced access

GPU memory access *most efficient* when consecutive threads read consecutive addresses:

```c
// Coalesced — good
__shared__ float a[N];
data[threadIdx.x] = a[threadIdx.x];     // T0 reads a[0], T1 reads a[1], ...

// Uncoalesced — bad (strided)
data[threadIdx.x] = a[threadIdx.x * 32];    // T0 reads a[0], T1 reads a[32], ...
```

Coalesced = 1 memory transaction per warp. Uncoalesced = 32 transactions. **32× pomalejší**.

⇒ Layout dat *critical*. AoS → SoA transformace často nutná.

## Compute capability

NVIDIA classifies GPUs by Compute Capability (CC):

- CC 6.x — Pascal (GTX 1080, 2016).
- CC 7.x — Volta/Turing (V100, RTX 20xx, 2017-18).
- CC 8.0 — Ampere (A100, 2020).
- CC 8.9 — Ada Lovelace (RTX 40xx, 2022).
- CC 9.0 — Hopper (H100, 2022).

Higher CC = newer ISA, more features (Tensor cores, sparse acceleration). Compilation must target specific CC.

## Tensor cores

Specialized ALUs for matrix multiply-accumulate (MMA):

```
D = A × B + C  (matrix operation, 4×4 or 16×16)
```

V100: 8× FP16 MMA per Tensor core. A100: also INT8, BF16. H100: also FP8.

For deep learning, Tensor cores give 5-10× speedup over plain CUDA cores. Critical for ML training.

## Performance numbers {tier=practice}

NVIDIA A100 vs Intel Xeon Platinum 8260 (24-core):

| | CPU | GPU | Ratio |
| :--- | :---: | :---: | :---: |
| FP32 peak | 3 TFLOPS | 19.5 TFLOPS | 6.5× |
| FP16 (Tensor) | — | 312 TFLOPS | 100× |
| Memory bandwidth | 141 GB/s | 1555 GB/s | 11× |
| Power | 165 W | 250 W | 1.5× |

⇒ Pro vektorizovaný compute-bound (matmul), GPU dominantní. CPU lépe pro irregular, sekvenční.

## Co dál

[[cuda-divergence-occupancy]] popisuje *praktické* GPU programovací problémy — branch divergence, occupancy, OpenMP target offload pro GPU.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=h9Z4oGN89MU" "How do Graphics Cards Work? Exploring GPU Architecture" "Branch Education"
:::

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: NVIDIA: „CUDA C Programming Guide" ([docs.nvidia.com/cuda](https://docs.nvidia.com/cuda/cuda-c-programming-guide/)); NVIDIA: „A100 Whitepaper" ([nvidia.com/A100](https://www.nvidia.com/en-us/data-center/a100/)); Lindholm, E. et al.: „NVIDIA Tesla: A Unified Graphics and Computing Architecture" (IEEE Micro 28(2), 2008); Cheng, J., Grossman, M., McKercher, T.: „Professional CUDA C Programming" (Wrox 2014).*
