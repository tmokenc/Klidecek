---
title: Architektura GPU — SM, warp, SIMT
---

# Architektura GPU pro obecné výpočty

CPU je optimalizovaný na latenci (latency-optimized): rychlé jádro provádějící mimo pořadí (OoO) s důrazem na jediné vlákno. GPU je naproti tomu optimalizované na propustnost (throughput-optimized): tisíce *jednoduchých* vláken, která dohromady dávají extrémní propustnost. Tato sekce vysvětluje, *jak* GPU vypadá uvnitř.

## CPU vs. GPU — filozofie návrhu

| | CPU | GPU |
| :--- | :--- | :--- |
| Jádra | 8–64 | 1000–10000 (ALU lanes / CUDA cores) |
| Výkon jednoho vlákna | vysoký (IPC 2–4) | nízký (in-order, jednoduchý) |
| Cache | velká, víceúrovňová | malá (~40 MB L2 celkem) |
| Predikce skoků | sofistikovaná | základní / žádná |
| Provádění mimo pořadí (OoO) | ano | ne (in-order) |
| Propustnost paměti | 50–150 GB/s | 1000–2000 GB/s (HBM) |
| Skrývání latence | OoO + cache | masivní multithreading |
| Příkon na čip | 100–300 W | 250–700 W |
| Vhodné použití | sekvenční, nepravidelné úlohy | datově paralelní, pravidelné úlohy |

GPU má **mnoho** „cores" (CUDA cores, nebo Stream Processors v terminologii AMD), ale nejde o plnohodnotná jádra — jsou to jen výpočetní dráhy ALU (ALU lanes). Skutečnými řídicími jednotkami jsou *SM* (Streaming Multiprocessors, proudové multiprocesory).

## NVIDIA Streaming Multiprocessor (SM)

NVIDIA A100 (Ampere 2020):

- 108 SM.
- Každý SM: 64 jader FP32 CUDA + 32 jader FP64 + 4 Tensor cores.
- Celkem 6912 CUDA cores.
- Sdílená paměť 40 GB HBM2, propustnost 1555 GB/s.

Každý SM má:

- 4 plánovače warpů (warp schedulers).
- 65 tisíc registrů (256 kB na jeden SM).
- 192 kB sdílené paměti + L1 cache.
- až 64 aktivních warpů (2048 vláken).

::: svg "Architektura SM (zjednodušené)"
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

Klíčový model: **warp** = skupina 32 vláken (NVIDIA), případně 64 (u AMD se nazývá wavefront), která sdílejí *jeden* proud instrukcí (instruction stream).

```
Warp instrukce:
T0: r1 = a[0] + b[0]
T1: r1 = a[1] + b[1]
T2: r1 = a[2] + b[2]
...
T31: r1 = a[31] + b[31]
```

Všech 32 vláken vykoná *stejnou* instrukci nad *vlastními* daty. Připomíná to SIMD, ale „thread" (vlákno) je zde *logická* jednotka.

Oproti SIMD na x86, kde jsou *všechny* dráhy (lanes) v ALU paralelní, je v SIMT každé vlákno *logicky* sekvenční, ale *fyzicky* běží všechna v naprostém souladu (lockstep).

## Warpy a plánovač

Plánovač warpů (warp scheduler) rozhoduje, *kterému* warpu přidělit další instrukci:

- Warp je připraven (žádné čekání) → instrukce se vydá.
- Warp je zablokovaný (čeká na paměť, na synchronizaci) → plánovač přepne na jiný warp.

Přepnutí kontextu (context switch) je zde bez režie — *stav registrů* warpu zůstává v register file (přístup za přibližně 1 takt).

Důsledek: tisíce vláken jsou aktivní současně. Když několik z nich čeká na paměť, jiná zatím běží. **Latence paměti je tak skryta** masivní paralelizací.

CPU u provádění mimo pořadí (OoO) čeká pomocí struktur RS/ROB (řádově 200 položek). GPU naproti tomu čeká pomocí 2000+ warpů × 32 vláken = 64000 připravených vláken. Jde o zcela jiný řád velikosti.

## Hierarchie vláken

Struktura, kterou v CUDA vidí programátor:

- **Thread** (vlákno) — základní jednotka.
- **Block** (CUDA) / Workgroup (OpenCL) — skupina vláken.
- **Grid** (mřížka) — kolekce bloků.

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

Každé vlákno si spočítá svůj jedinečný index `i` z `blockIdx` a `threadIdx`. Blok o 256 vláknech = 8 warpů. Mřížka o K blocích → celkem K × 256 vláken.

Pro N = 1 M a blockSize 256 vyjde gridSize = 3907. Celkem se spustí 1 M vláken. GPU pak postupně rozmísťuje bloky na jednotlivé SM.

### Volba velikosti bloku

Maximální velikost bloku je u většiny GPU NVIDIA 1024 vláken (32 warpů). Práce jednoho bloku se musí vejít do *jediného SM*.

Optimální velikost bloku je typicky 128–512 vláken. Jde o kompromis:

- Větší blok → lepší znovupoužití registrů (register reuse), lepší amortizace sdílené paměti.
- Menší blok → více paralelních bloků na jeden SM (lepší skrývání latence).

::: viz memory-coalescing-pattern "Vyber přístupový vzor (consecutive / stride 2 / 8 / 32 / random). 32 vláken → DRAM transakce; consecutive = 1, random = až 32. Efektivita propustnosti s každým z nich klesá."
:::

## Hierarchie paměti

GPU má vlastní paměťovou hierarchii:

| Paměť | Latence | Propustnost | Velikost | Rozsah |
| :--- | :---: | :---: | :---: | :--- |
| Registers | 1 cyklus | obrovská | ~64 na vlákno | vlákno |
| Shared memory | ~30 cyklů | 5 TB/s | 64 kB / SM | blok |
| L1 cache | ~30 | 5 TB/s | 128 kB / SM | SM |
| L2 cache | ~200 | 4 TB/s | 40 MB | globální (v rámci čipu) |
| Global memory (HBM) | ~500 | 1.5 TB/s | 40–80 GB | globální |
| Texture / Const | ~500 | 1.5 TB/s | 64 kB const | globální, cachovaná |

### Sdílená paměť (smem)

Rychlá paměť na úrovni bloku. Programátor ji spravuje ručně.

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

Násobení matic po dlaždicích (tiled matrix multiply): do sdílené paměti se načte dlaždice 16×16, vlákna ji opakovaně využijí → výrazně méně přístupů do globální paměti. Jde o standardní optimalizaci.

### Slučovaný přístup (coalesced access)

Přístup do paměti GPU je *nejefektivnější* tehdy, když po sobě jdoucí vlákna čtou po sobě jdoucí adresy:

```c
// Coalesced — good
__shared__ float a[N];
data[threadIdx.x] = a[threadIdx.x];     // T0 reads a[0], T1 reads a[1], ...

// Uncoalesced — bad (strided)
data[threadIdx.x] = a[threadIdx.x * 32];    // T0 reads a[0], T1 reads a[32], ...
```

Slučovaný přístup (coalesced) = 1 paměťová transakce na warp. Neslučovaný (uncoalesced) = 32 transakcí, tedy **32× pomaleji**.

Důsledek: rozložení dat v paměti je *zásadní*. Často je nutná transformace z AoS (pole struktur) na SoA (struktura polí).

## Compute capability

NVIDIA klasifikuje svá GPU podle úrovně výpočetní schopnosti (compute capability, CC):

- CC 6.x — Pascal (GTX 1080, 2016).
- CC 7.x — Volta/Turing (V100, RTX 20xx, 2017–18).
- CC 8.0 — Ampere (A100, 2020).
- CC 8.9 — Ada Lovelace (RTX 40xx, 2022).
- CC 9.0 — Hopper (H100, 2022).

Vyšší CC znamená novější instrukční sadu (ISA) a více funkcí (Tensor cores, akcelerace řídkých výpočtů). Překlad musí cílit na konkrétní CC.

## Tensor cores

Specializované ALU pro násobení matic s akumulací (matrix multiply-accumulate, MMA):

```
D = A × B + C  (matrix operation, 4×4 or 16×16)
```

V100: 8× MMA v FP16 na jeden Tensor core. A100: navíc INT8 a BF16. H100: navíc FP8.

Pro hluboké učení dávají Tensor cores zrychlení 5–10× oproti běžným CUDA cores. To je pro trénování modelů strojového učení (ML) klíčové.

## Výkonnostní čísla {tier=practice}

NVIDIA A100 vs. Intel Xeon Platinum 8260 (24jádrový):

| | CPU | GPU | Poměr |
| :--- | :---: | :---: | :---: |
| Špičkový FP32 | 3 TFLOPS | 19.5 TFLOPS | 6.5× |
| FP16 (Tensor) | — | 312 TFLOPS | 100× |
| Propustnost paměti | 141 GB/s | 1555 GB/s | 11× |
| Příkon | 165 W | 250 W | 1.5× |

Důsledek: pro vektorizované výpočty omezené výpočetním výkonem (compute-bound, např. násobení matic) GPU dominuje. CPU je naopak lepší pro nepravidelné a sekvenční úlohy.

## Co dál

[[cuda-divergence-occupancy]] popisuje *praktické* problémy programování GPU — divergenci větví (branch divergence), obsazenost (occupancy) a offload výpočtů na GPU pomocí OpenMP target.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=h9Z4oGN89MU" "How do Graphics Cards Work? Exploring GPU Architecture" "Branch Education"
:::

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: NVIDIA: „CUDA C Programming Guide" ([docs.nvidia.com/cuda](https://docs.nvidia.com/cuda/cuda-c-programming-guide/)); NVIDIA: „A100 Whitepaper" ([nvidia.com/A100](https://www.nvidia.com/en-us/data-center/a100/)); Lindholm, E. et al.: „NVIDIA Tesla: A Unified Graphics and Computing Architecture" (IEEE Micro 28(2), 2008); Cheng, J., Grossman, M., McKercher, T.: „Professional CUDA C Programming" (Wrox 2014).*
