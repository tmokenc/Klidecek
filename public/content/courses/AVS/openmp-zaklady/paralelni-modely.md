---
title: Modely paralelního programování
---

# Tři paralelní programovací modely

Programátor nepracuje přímo s hardware ([[tlp-uvod]]). Pracuje skrz **abstrakci** — *paralelní programovací model* skrytě zacházející s vlákny, paměťovými přístupy a synchronizací. Tři dominantní modely:

1. **Sdílený adresový prostor (SAS, Shared Address Space)** — vlákna sdílí paměť.
2. **Zasílání zpráv (MP, Message Passing)** — procesy si posílají data explicitně.
3. **Datově-paralelní model** — programátor specifikuje *co* paralelní, ne *jak*.

Tato sekce popisuje *charakteristiky*, *výhody*, *nevýhody* a *typické HW substráty* každého.

## Sdílený adresový prostor (SAS)

Vlákna komunikují *čtením/zápisem* sdílených proměnných. Implicit communication.

### Princip

```c
int shared_counter = 0;       // sdíleno

void thread_A() {
    shared_counter += 1;       // vidíme update?
}
void thread_B() {
    shared_counter += 1;       // race s A
}
```

Vlákno 1 a 2 *vidí* stejnou paměť, *vidí* updates druhého. *Synchronizace* je *separátní* problém:

- **Locks** — exclusive access (mutex, critical section).
- **Atomic operations** — fetch-and-add, compare-swap.
- **Barriers** — počkat, až všichni dosáhnou bodu.

### Příklady SAS API

| API | Jazyk | Granularita |
| :--- | :--- | :--- |
| pthread | C | low-level |
| std::thread | C++ | low-level |
| OpenMP | C/C++/Fortran | high-level (loop, sections) |
| Cilk Plus | C/C++ | task-based |
| Intel TBB | C++ | task-based |
| Java threads | Java | low-level |

OpenMP nejvíc abstrakce — direktivy nad existujícím kódem, *inkrementální* paralelizace.

### Výhody

- **Snadné programování** — nemusíte explicitně posílat data, jako v MP.
- **Inkrementální paralelizace** — můžete paralelizovat *jednu* smyčku, zbytek nechte sekvenční.
- **Sdílená data efficient** — žádné kopírování při komunikaci.

### Nevýhody

- **Race conditions** — pokud zapomenete synchronizaci.
- **False sharing** ([[false-sharing-races]]) — cache line ping-pong.
- **Nesquálovatelnost** — SAS funguje *jen* v rámci jednoho uzlu (cache koherence). Distribuované systémy potřebují MP.
- **NUMA aware programming** ([[uma-numa]]) — sdílené data na *vzdáleném* NUMA node = drahá.

### HW substrát

SMP, NUMA, multi-socket s coherent cache. *Limit*: koherenci na 100+ jader náročné (Intel Sapphire Rapids 56 jader, AMD EPYC 96 jader).

Nad ~256 jader: distribuovaný systém, MP.

## Zasílání zpráv (MP)

Procesy mají *oddělenou* paměť. Komunikace přes *explicitní zprávy* (send / receive).

### Princip

```c
// Process 0
int data = 42;
MPI_Send(&data, 1, MPI_INT, 1, tag, MPI_COMM_WORLD);

// Process 1
int data;
MPI_Recv(&data, 1, MPI_INT, 0, tag, MPI_COMM_WORLD, &status);
```

Process 1 *neviděl* `data = 42` v process 0 — musel ho dostat *explicitně*.

### Příklady MP API

| API | Použití |
| :--- | :--- |
| MPI (Message Passing Interface) | HPC standard, supercomputers |
| Sockets, gRPC, HTTP | distributed systems, microservices |
| Apache Spark, Hadoop | data analytics |
| Erlang processes | telecom, distributed |
| Go channels | goroutines |

MPI je *de facto* standard pro HPC. Sotva ho překoná jiný API v scientific computing.

### Výhody

- **Škálovatelnost** — pracuje na *libovolný* počet uzlů. Top500 supercomputers = miliony cores přes MPI.
- **Žádné race conditions** — žádná sdílená paměť, žádné race.
- **NUMA naturally** — každý proces má lokální paměť, žádné remote access.
- **Funguje na clusters** — disjoint memory, jen network.

### Nevýhody

- **Explicit synchronizace** — *kdy* poslat, *kdo* dostane, *koho* čekat. Bug-prone.
- **Latence zpráv** — InfiniBand 1 μs, Ethernet 10 μs, internet 1+ ms.
- **Bandwidth limit** — zprávy jsou drahé. Tunning algoritmu pro communication-to-computation ratio.
- **Větší kód** — víc explicitního správy než SAS.

### HW substrát

Clustery, supercomputers, cloud nodes spojené sítí (InfiniBand, Ethernet). MPI runs even na single multi-core node — ale tam je SAS efficienter.

## Datově-paralelní model

Programátor specifikuje *operace nad poli*. Runtime / compiler rozhodne, *jak* paralelizovat.

### Princip

```python
# NumPy / PyTorch / TensorFlow
a = numpy.array(...)
b = numpy.array(...)
c = a + b * 2          # vectorized, runtime decides parallelism
```

Nebo explicit GPU:

```cuda
__global__ void axpy(float a, float *x, float *y, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) y[i] = a * x[i] + y[i];
}
```

CUDA: thread per element. Tisíce vláken paralelně.

### Příklady

| API | Backend |
| :--- | :--- |
| NumPy | CPU + BLAS (parallelized) |
| PyTorch, TensorFlow | CPU + GPU + TPU |
| CUDA | NVIDIA GPU |
| OpenCL | heterogeneous (CPU + GPU + FPGA) |
| OpenACC, OpenMP target | GPU offload via pragma |

### Výhody

- **Vysoká abstrakce** — programátor nepíše vlákna, jen *operace*.
- **Auto-parallelism** — runtime rozhodne SIMD, multi-core, GPU.
- **Bez race** — semantika *deklarativní*, ne imperativní.

### Nevýhody

- **Omezenost** — pracuje *jen* pro datově-paralelní úlohy. Sériová logika (parser, A* search) ne.
- **Memory layout matters** — pro auto-parallelism musí být data SoA, contiguous.
- **Black box runtime** — debugging výkonu obtížný.

### HW substrát

GPU (SIMT, [[gpu-architektura]]), vector CPU (NEC SX, RISC-V V), specialized accelerators (TPU, FPGA).

## Praktická volba

| Situation | Best model |
| :--- | :--- |
| Single multi-core machine | SAS (OpenMP, std::thread) |
| Cluster, scientific computing | MP (MPI) |
| ML training, image processing | Data parallel (PyTorch, CUDA) |
| Distributed analytics | MP + Data parallel (Spark) |
| Real-time, low-latency | SAS pinned to cores |

Velké systémy *kombinují*: MPI mezi uzly + OpenMP uvnitř + CUDA na GPU. **Hybrid MPI/OpenMP**:

```c
#pragma omp parallel
for (int i = 0; i < N; i++) {
    local_compute(i);
}
MPI_Allreduce(local_sum, global_sum, ...);
```

Komunikace mezi MPI procesy (cluster nodes) + intra-node SAS (OpenMP). Klasický HPC vzorec.

## OpenMP pozice

OpenMP je SAS API — definuje *direktivy* (`#pragma omp ...`), které kompilátor přeloží na threading runtime.

Výhody OpenMP nad pthread:

- **Stručnost** — `#pragma omp parallel for` místo manuální vlákno setup.
- **Inkrementální** — paralelizuj jednu smyčku, ostatní nech sériové.
- **Přenositelnost** — stejný kód na GCC/Clang/ICC/Cray.

Detaily v [[openmp-uvod]].

## Co dál

[[openmp-uvod]] zavádí OpenMP API podrobně — pragma syntaxe, fork-join model. [[parallel-for-scheduling]] popisuje *parallel for* s různými scheduling politikami. [[datova-prostredi]] řeší private/shared/reduction klauzule.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Mattson, T.G., Sanders, B.A., Massingill, B.L.: „Patterns for Parallel Programming" (Addison-Wesley 2004); Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §5.1; [OpenMP 5.2 Specification](https://www.openmp.org/specifications/); [MPI 4.0 Standard](https://www.mpi-forum.org/docs/).*
