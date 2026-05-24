---
title: Prefetching — HW a SW přednačítání dat
---

# Prefetching — HW a SW přednačítání

Cache hit dává data za 4 cykly, L2 za 12, L3 za 35, DRAM za 200. **Prefetcher** anticipuje, *která adresa* bude potřebná, a posílá load *před* explicit požadavkem. Cíl: do okamžiku, kdy CPU instrukci vydá, je již line v L1.

## Co lze prefetchovat

Dva proudy:

- **Instrukce** — predikce kam *poteče* fetch + branch (large basic block ahead).
- **Data** — predikce kam *bude* L/S přistupovat.

Pro instrukce *většinou stačí* sequential fetch + branch prediction (BTB indikuje target, který se prefetchne). Datový prefetching je *víc úsilí*.

## HW prefetching strategie

### Sequential prefetcher

Nejjednodušší: při miss na adresu A, fetch také **A + 1 line** (next-line prefetch). Funguje pro sekvenční scan polí.

Intel od Pentium III. Cost: 2× bandwidth (zbytečně co half).

### Stride prefetcher

Detekuje *konstantní rozdíl* mezi po sobě jdoucími přístupy z téhož PC instrukce. Drží *Load History Table* (LHT) — pro každý PC posledně viděné adresy + odhad stride:

```
PC=0xA, addr=0x100      → stride = ?
PC=0xA, addr=0x108      → stride = 8 (initial)
PC=0xA, addr=0x110      → stride = 8 (steady)
PC=0xA, addr=0x118      → prefetch 0x120 (extrapolate)
```

::: svg "Stride prefetcher — detekce konstantního rozestupu"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="20" width="80" height="30" rx="3"/>
    <rect x="20" y="60" width="80" height="30" rx="3"/>
    <rect x="20" y="100" width="80" height="30" rx="3"/>
    <rect x="20" y="140" width="80" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="60" y="40">PC=0xA</text>
    <text x="60" y="80">PC=0xA</text>
    <text x="60" y="120">PC=0xA</text>
    <text x="60" y="160">PC=0xA</text>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="120" y="20" width="100" height="30" rx="3"/>
    <rect x="120" y="60" width="100" height="30" rx="3"/>
    <rect x="120" y="100" width="100" height="30" rx="3"/>
    <rect x="120" y="140" width="100" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="170" y="40">addr=0x100</text>
    <text x="170" y="80">addr=0x108</text>
    <text x="170" y="120">addr=0x110</text>
    <text x="170" y="160">addr=0x118</text>
  </g>
  <g fill="var(--text-muted)" font-size="9">
    <text x="240" y="40">— init</text>
    <text x="240" y="80">— transient (stride=8?)</text>
    <text x="240" y="120">— steady (stride=8)</text>
    <text x="240" y="160">— predict 0x120</text>
  </g>
  <g fill="var(--accent)" opacity="0.15" stroke="var(--accent)">
    <rect x="380" y="140" width="140" height="30" rx="3"/>
  </g>
  <text x="450" y="160" text-anchor="middle" fill="var(--text)" font-weight="600">prefetch(0x120)</text>
</svg>
:::

Stride prefetcher má 3 stavy: **init**, **transient** (testuje hypotézu), **steady** (confirms).

Účinný pro vector loop, matrix scan. Intel od Pentium 4, AMD od Athlon. Reálná data: 10-30 % speedup na memory-bound kódu.

### Spatial prefetcher

Při miss na A *prefetchne celou stranu* (např. 4 sousední lines). Užitečné pro hot regions.

### Streaming buffer

Velký buffer mimo cache (32-64 entries), do kterého se streamují sekvenční loads. Hierarchický s L1/L2.

### Pattern prefetcher (Markov, GHB-based)

Pro non-stride patterny (linked list traversal, hash table). Pamatuje *sekvence* miss adres. Pokud A → B → C bylo viděno, predikuje C po B.

Drahé na HW; jen některé CPU (IBM POWER, Apple M1).

::: viz stride-prefetcher-trace "Vyber stream pattern (stride 1 / 32 / random / mixed). Detektor přijme stride po 2 stejných deltách; sleduj, jak miss rate klesá se zapnutým prefetcherem."
:::

## Apple M1 prefetcher

Apple M1 má **8 různých prefetchers** v L1 a L2:

- Streaming (next-line).
- Stride.
- Region (chytí kompletní 2 kB region).
- Spatial (4-line ahead).
- Vyšší úroveň (L2): větší rozhledové okno.

Stejnou hierarchii má Apple A-series mobile chipy. Důvod: M1 RAM je *off-package* (až LPDDR5), latence vyšší než pure CPU.

## SW prefetching

Programátor explicitně vloží instrukci. GCC builtin:

```c
__builtin_prefetch(addr, rw, locality);
```

- `addr` — adresa pro prefetch.
- `rw` — 0 = read, 1 = write (hint pro koherenci).
- `locality` — 0-3, jak dlouho data uchovat (0 = nesnaž se cache, 3 = drž v L1).

Translated na:

- x86: `PREFETCHT0 / T1 / T2 / NTA`.
- ARM: `PRFM PLDL1KEEP / L2KEEP / L3KEEP / STRM`.

### Pattern: scan ahead

```c
for (i = 0; i < N; i++) {
    __builtin_prefetch(&a[i + 8]);     // 8 ahead = 64 B = 1 line
    process(a[i]);
}
```

Distance (8 zde) je *kritická*:

- **Příliš krátká** — line ještě nedoletěla, zbytečné.
- **Příliš dlouhá** — line už byla vyhozena z cache.

Sweet spot závisí na čase mezi loadem a use, latency, frekvenci. Empiricky 10-20 elements ahead pro typický numeric loop.

### Pattern: pointer chasing

Linked list traversal:

```c
while (p) {
    __builtin_prefetch(p->next);   // start fetching next while we work
    process(p->data);
    p = p->next;
}
```

Pro long chain ~30 % speedup. Pro short list zbytečně.

### Pattern: hash table probe

```c
for each key:
    bucket = hash(key) % size;
    __builtin_prefetch(&table[bucket]);
    // ... pokračuj v dalším výpočtu
    val = table[bucket];     // teď již cached
```

Hash table má random access — bez prefetch L1 miss skoro vždy.

## Software pipelining + prefetch

V tight numeric loop: kompilátor prokládá:

```c
for (i = 0; i < N; i += 4) {
    __builtin_prefetch(&a[i + 16]);
    a[i+0] = compute(a[i+0]);
    a[i+1] = compute(a[i+1]);
    a[i+2] = compute(a[i+2]);
    a[i+3] = compute(a[i+3]);
}
```

GCC `-O3` často autoprefetches při tight loop. ICC/clang ještě agresivněji.

## Aggressive vs conservative

Trade-off:

- **Aggressive** prefetch → vyšší accuracy, ale *bandwidth waste* a *cache pollution* (eviktuje něco užitečného kvůli speculative).
- **Conservative** → no waste, ale méně prefetch coverage.

Moderní HW prefetcher *adaptuje* aggressivity podle reálných hit-rate. Pokud prefetcher predicts wrong často → throttle. Intel a AMD mají tuning runtime.

## Limit prefetchingu

Prefetch jen *posune* problém, nezruší ho. Když je L1 miss rate fundamentálně vysoký (random scan velkého pole), prefetch je *cache pollution*, ne win.

Bandwidth limit: prefetch generuje *traffic*. Pokud DRAM bandwidth je už 90 % vytížený, prefetch nepomáhá.

⇒ Prefetch je win, **když je latence dominantní** a bandwidth bere zbytek. Tj. pointer chasing, scan polí v L3/DRAM region.

## Co dál

Topic 4 končí. Topic 5 ([[dlp-vs-ilp-tlp]]) zavádí **DLP a SIMD** — strategii útoku na výkon přes *vektorizaci*, ne přes paralelizaci instrukčního toku.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §2.6; Jouppi, N.P.: „Improving Direct-Mapped Cache Performance by the Addition of a Small Fully-Associative Cache and Prefetch Buffers" (ISCA 1990, [DOI 10.1145/325096.325162](https://doi.org/10.1145/325096.325162)); Mowry, T.C., Lam, M.S., Gupta, A.: „Design and Evaluation of a Compiler Algorithm for Prefetching" (ASPLOS 1992); [GCC `__builtin_prefetch` docs](https://gcc.gnu.org/onlinedocs/gcc/Other-Builtins.html).*
