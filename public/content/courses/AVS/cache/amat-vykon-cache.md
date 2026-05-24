---
title: AMAT — výpočet průměrné doby přístupu
---

# AMAT a výkon paměťové hierarchie

**Average Memory Access Time (AMAT)** je jediné číslo, které shrnuje, *jak rychle* se průměrný load/store dostane do dat. Formule pomáhá počítat *dopad* cache miss rate na CPI a předvídat, kolik výkonu získá lepší cache nebo prefetching.

## Formule AMAT

Pro hierarchii L1 → L2 → DRAM:

$$
\text{AMAT} = \text{HitTime}_{L1} + \text{MissRate}_{L1} \cdot (\text{HitTime}_{L2} + \text{MissRate}_{L2} \cdot \text{MissPenalty}_{L2})
$$

Generalizace na n úrovní: rekurzivně. Pro typickou L1+L2+L3+DRAM:

$$
\text{AMAT} = t_{L1} + m_{L1}(t_{L2} + m_{L2}(t_{L3} + m_{L3} \cdot t_{\text{DRAM}}))
$$

kde $m_i$ = *local* miss rate (miss rate jen u přístupů, které dorazí na úroveň $i$).

### Příklad

Předpoklady:

- $t_{L1} = 4$ takty, $m_{L1} = 5\%$.
- $t_{L2} = 12$ taktů, $m_{L2} = 30\%$ (z těch, co minou L1).
- $t_{L3} = 35$ taktů, $m_{L3} = 10\%$ (z těch, co minou L2).
- $t_{\text{DRAM}} = 200$ taktů.

$$
\text{AMAT} = 4 + 0{,}05 \cdot (12 + 0{,}3 \cdot (35 + 0{,}1 \cdot 200))
$$

$$
= 4 + 0{,}05 \cdot (12 + 0{,}3 \cdot 55)
$$

$$
= 4 + 0{,}05 \cdot (12 + 16{,}5) = 4 + 0{,}05 \cdot 28{,}5 = 4 + 1{,}425 = 5{,}43 \text{ taktů}
$$

⇒ Průměrný load trvá 5,43 takty místo ideálních 4. Hierarchie *funguje* — DRAM latence 200 se *amortizuje* na <1,5 taktu dopad.

::: viz amat-cache-calculator "Sliders pro hit rate + latency každé úrovně (nebo preset Skylake / Zen 4 / M1). AMAT a rozklad podle úrovně se aktualizují live."
:::

## Global vs local miss rate

- **Local miss rate** = miss / (přístupy *na danou úroveň*).
- **Global miss rate** = miss této úrovně / *všechny* přístupy (kombinovaná pravděpodobnost minout všechny předchozí úrovně).

Pro výpočet AMAT je *jednodušší* používat local. Global ukazuje *konečný* dopad.

V příkladu výše: global miss rate pro L3 = $0{,}05 \cdot 0{,}3 \cdot 0{,}1 = 0{,}15\%$ — z všech load instrukcí. Velmi málo, ale když to nastane, stojí 200+ taktů.

## CPI dopad

Pokud `LoadFreq` = četnost load/store instrukcí (typicky 30-40 % na x86):

$$
\text{CPI}_{\text{total}} = \text{CPI}_{\text{compute}} + \text{LoadFreq} \cdot \text{AMAT}
$$

Pro:

- $\text{CPI}_{\text{compute}} = 1$ (pipelined CPU, no stall).
- $\text{LoadFreq} = 0{,}3$.
- $\text{AMAT} = 5{,}43$ (předchozí příklad).

$$
\text{CPI}_{\text{total}} = 1 + 0{,}3 \cdot 5{,}43 = 1 + 1{,}63 = 2{,}63
$$

⇒ Memory dopad zvedne CPI z 1 na 2,63. 60 % CPU času je *čekání na paměť*.

Při horší cache ($m_{L1} = 10\%$ místo 5):

$$
\text{AMAT}' = 4 + 0{,}1 \cdot 28{,}5 = 6{,}85, \quad \text{CPI}' = 1 + 0{,}3 \cdot 6{,}85 = 3{,}06
$$

Speedup horší cache → současné = 1,16×. Lepší cache 5 % místo 10 % = 16 % rychlejší. To je proč CPU vendoři tlačí miss rate dolů.

## Memory wall

Pohled na trend (1980-2020):

- CPU frekvence: 1 MHz → 5 GHz (5000×).
- DRAM latence: 200 ns → 60 ns (3×).

⇒ Propast roste exponenciálně. To je *memory wall* — termín z 1995 (Wulf, McKee).

Cache je *jediná* obrana. Jenže miss rate má dolní mez (compulsory miss). Při 200 cyklech latence per miss, i 1 % miss rate = 2 cykly per access.

Další obrana:

- **Velký ROB / RS** — překryje miss latence (Apple M1 = 630 ROB!).
- **Prefetching** ([[prefetching]]) — anticipuje, načte dřív.
- **Bandwidth, ne latence** — moderní DRAM tlačí GB/s, abstrahuje latence skrz pipelining přístupů.

## Bandwidth vs latence

Dva ortogonální parametry:

- **Latence** — *jak dlouho* trvá jedna operace (200 cyklů).
- **Bandwidth** — *kolik* operací za sekundu (50 GB/s).

DRAM controller umí *paralelně* obsluhovat víc requestů. Jakmile MSHR ([[ls-jednotka-mshr]]) drží 10 outstanding misses, *bandwidth* určuje výkon, ne latence.

```
Little's law:  outstanding_misses = bandwidth × latence
                10 = 50 GB/s × 200 ns / 64 B per line
                10 ≈ 10 / 64 ns = ~150 outstanding loads
```

⇒ Pro plné využití bandwidth musíme držet 100+ misses in flight. Apple M1 = 192 MSHR — víc než Intel.

## Cache benchmarking

Empirické měření AMAT — *stride scan*:

```c
for (s = 1; s <= 4096; s *= 2) {
    for (i = 0; i < N; i += s) {
        sum += array[i];
    }
}
```

Měřením *čas/element* pro různá `s`:

- s = 1: čte sekvenčně, cache hit většinou → ~1 ns.
- s = 64 (1 line): každý přístup nová line → L1 hit ~1 ns, ale když pole > L1 → L2 hit ~4 ns.
- s = 8192 (TLB): TLB miss → 30 ns navíc.

Klasický experiment (LMbench, Saavedra-Barrera 1992).

::: svg "AMAT pro různé pracovní sady (working set size)"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <g stroke="var(--line)" stroke-width="0.6">
    <line x1="50" y1="190" x2="510" y2="190"/>
    <line x1="50" y1="20" x2="50" y2="190"/>
  </g>
  <g fill="var(--text-muted)" font-size="9">
    <text x="280" y="208" text-anchor="middle">working set size (log scale)</text>
    <text x="60" y="190" text-anchor="end">1</text>
    <text x="160" y="208" text-anchor="middle">L1 = 32 kB</text>
    <text x="260" y="208" text-anchor="middle">L2 = 256 kB</text>
    <text x="360" y="208" text-anchor="middle">L3 = 8 MB</text>
    <text x="460" y="208" text-anchor="middle">DRAM</text>
  </g>
  <text x="25" y="100" fill="var(--text-muted)" transform="rotate(-90 25 100)" text-anchor="middle">AMAT (cyklů)</text>
  <path d="M50,170 L160,170 L160,140 L260,140 L260,100 L360,100 L360,40 L510,40" fill="none" stroke="var(--accent)" stroke-width="2"/>
  <g fill="var(--text-muted)" font-size="9">
    <text x="105" y="160" text-anchor="middle">~4 (L1 hit)</text>
    <text x="210" y="130" text-anchor="middle">~12 (L2)</text>
    <text x="310" y="92" text-anchor="middle">~35 (L3)</text>
    <text x="430" y="32" text-anchor="middle">~200 (DRAM)</text>
  </g>
  <text x="270" y="13" text-anchor="middle" font-weight="600" fill="var(--text)">Hierarchická step-function — typická pro stride scan</text>
</svg>
:::

## Optimalizace pro AMAT

Programátor může útočit na AMAT různými způsoby:

### Blocking (tiling)

Rozděl loop na bloky tak, aby pracovní sada *zůstala v cache*:

```c
// Naivní násobení matic — velký N → cache miss
for (i = 0; i < N; i++)
  for (j = 0; j < N; j++)
    for (k = 0; k < N; k++)
      C[i][j] += A[i][k] * B[k][j];

// Tiled — bloky B×B se vejdou do L1
for (i0 = 0; i0 < N; i0 += B)
  for (j0 = 0; j0 < N; j0 += B)
    for (k0 = 0; k0 < N; k0 += B)
      for (i = i0; i < i0+B; i++)
        for (j = j0; j < j0+B; j++)
          for (k = k0; k < k0+B; k++)
            C[i][j] += A[i][k] * B[k][j];
```

Tiling může zrychlit matrix multiply **3-10×** na velkých N.

### Layout transformace

Array-of-structures (AoS) vs structure-of-arrays (SoA):

```c
// AoS — špatná lokalita pro scan jednoho fieldu
struct Particle { float x, y, z, vx, vy, vz, mass; };
Particle ps[N];
for (i = 0; i < N; i++) ps[i].x += ps[i].vx;   // zbytečně načte vy, vz, mass

// SoA — lepší pro AVX vektorizaci a cache
float xs[N], ys[N], zs[N], vxs[N], vys[N], vzs[N], masses[N];
for (i = 0; i < N; i++) xs[i] += vxs[i];        // jen 2 streamy
```

SoA často zrychlí 2-4× pro physics/simulation.

### Prefetch

Explicitní instrukce `__builtin_prefetch(addr)` pošle žádost o load *bez čekání*. Když se data potřebují, *už jsou* v L1.

```c
for (i = 0; i < N; i++) {
    __builtin_prefetch(&a[i + 16]);   // prefetch 16 elements ahead
    sum += a[i];
}
```

Funguje pro *predictable* stride; pro random access marně.

## Co dál

[[ls-jednotka-mshr]] zavádí MSHR — hardware, který drží *multiple in-flight misses*. Tím se AMAT z dlouhých latencí stane benigní díky pipelined memory access.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §2.4-2.5; Wulf, W.A., McKee, S.A.: „Hitting the Memory Wall: Implications of the Obvious" (ACM SIGARCH Computer Arch. News 23(1), 1995, [DOI 10.1145/216585.216588](https://doi.org/10.1145/216585.216588)); McCalpin, J.D.: „STREAM Benchmark" ([www.cs.virginia.edu/stream/](https://www.cs.virginia.edu/stream/)).*
