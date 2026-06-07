---
title: AMAT — výpočet průměrné doby přístupu
---

# AMAT a výkon paměťové hierarchie

**Průměrná doba přístupu do paměti (Average Memory Access Time, AMAT)** je jediné číslo, které shrnuje, *jak rychle* se průměrný load/store dostane k datům. Tento vzorec pomáhá spočítat *dopad* výpadkovosti cache (cache miss rate) na CPI a předpovědět, kolik výkonu přinese lepší cache nebo prefetching (přednačítání dat dopředu).

## Vzorec AMAT

Pro hierarchii L1 → L2 → DRAM:

$$
\text{AMAT} = \text{HitTime}_{L1} + \text{MissRate}_{L1} \cdot (\text{HitTime}_{L2} + \text{MissRate}_{L2} \cdot \text{MissPenalty}_{L2})
$$

Zobecnění na n úrovní se provede rekurzivně. Pro typickou hierarchii L1+L2+L3+DRAM platí:

$$
\text{AMAT} = t_{L1} + m_{L1}(t_{L2} + m_{L2}(t_{L3} + m_{L3} \cdot t_{\text{DRAM}}))
$$

kde $m_i$ je *lokální* výpadkovost (local miss rate) — tedy výpadkovost počítaná jen z přístupů, které na úroveň $i$ vůbec dorazí.

### Příklad {tier=example}

Předpoklady:

- $t_{L1} = 4$ takty, $m_{L1} = 5\%$.
- $t_{L2} = 12$ taktů, $m_{L2} = 30\%$ (z těch přístupů, které minou L1).
- $t_{L3} = 35$ taktů, $m_{L3} = 10\%$ (z těch přístupů, které minou L2).
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

⇒ Průměrný load trvá 5,43 taktu místo ideálních 4. Hierarchie tedy *funguje* — latence DRAM o velikosti 200 taktů se *amortizuje* na dopad menší než 1,5 taktu.

::: viz amat-cache-calculator "Posuvníky pro hit rate a latenci každé úrovně (nebo přednastavení Skylake / Zen 4 / M1). AMAT i jeho rozklad podle úrovně se aktualizují živě."
:::

## Globální vs. lokální výpadkovost

- **Lokální výpadkovost (local miss rate)** = počet výpadků / (přístupy *na danou úroveň*).
- **Globální výpadkovost (global miss rate)** = počet výpadků této úrovně / *všechny* přístupy (jde o sdruženou pravděpodobnost, že přístup mine všechny předchozí úrovně).

Pro výpočet AMAT je *jednodušší* používat lokální výpadkovost. Globální výpadkovost naopak ukazuje *výsledný* dopad.

V příkladu výše vychází globální výpadkovost pro L3 jako $0{,}05 \cdot 0{,}3 \cdot 0{,}1 = 0{,}15\%$ — počítáno ze všech load instrukcí. Je to velmi málo, ale když taková situace nastane, stojí 200 a více taktů.

## Dopad na CPI

Pokud `LoadFreq` značí četnost load/store instrukcí (na x86 typicky 30–40 %), platí:

$$
\text{CPI}_{\text{total}} = \text{CPI}_{\text{compute}} + \text{LoadFreq} \cdot \text{AMAT}
$$

Dosadíme:

- $\text{CPI}_{\text{compute}} = 1$ (zřetězené CPU, bez pozdržení).
- $\text{LoadFreq} = 0{,}3$.
- $\text{AMAT} = 5{,}43$ (z předchozího příkladu).

$$
\text{CPI}_{\text{total}} = 1 + 0{,}3 \cdot 5{,}43 = 1 + 1{,}63 = 2{,}63
$$

⇒ Dopad paměti zvedne CPI z 1 na 2,63. To znamená, že 60 % času procesoru je *čekáním na paměť*.

Při horší cache ($m_{L1} = 10\%$ místo 5 %):

$$
\text{AMAT}' = 4 + 0{,}1 \cdot 28{,}5 = 6{,}85, \quad \text{CPI}' = 1 + 0{,}3 \cdot 6{,}85 = 3{,}06
$$

Zrychlení (speedup) z horší cache na současnou je tedy 1,16×. Lepší cache s 5 % výpadkovosti místo 10 % je o 16 % rychlejší. Právě proto výrobci procesorů tlačí výpadkovost dolů.

## Paměťová stěna (memory wall)

Podívejme se na trend (1980–2020):

- Frekvence CPU: 1 MHz → 5 GHz (5000×).
- Latence DRAM: 200 ns → 60 ns (3×).

⇒ Propast mezi nimi roste exponenciálně. Tomu se říká *paměťová stěna (memory wall)* — termín z roku 1995 (Wulf, McKee).

Cache je *jediná* obrana. Jenže výpadkovost má svou dolní mez (povinné výpadky, compulsory miss). Při latenci 200 taktů na jeden výpadek znamená i 1 % výpadkovosti dva takty na přístup.

Další možnosti obrany:

- **Velký ROB / RS** — překryje latenci výpadku (Apple M1 má ROB o velikosti 630 položek!).
- **Prefetching (přednačítání)** ([[prefetching]]) — anticipuje budoucí přístupy a načte data dříve.
- **Důraz na propustnost, ne na latenci** — moderní DRAM tlačí na GB/s a latenci abstrahuje tím, že přístupy zřetězuje (pipelining).

## Propustnost vs. latence

Jde o dva nezávislé (ortogonální) parametry:

- **Latence** — *jak dlouho* trvá jedna operace (200 taktů).
- **Propustnost (bandwidth)** — *kolik* operací proběhne za sekundu (50 GB/s).

Řadič DRAM umí *paralelně* obsluhovat víc požadavků (request). Jakmile MSHR ([[ls-jednotka-mshr]]) drží dostatek nevyřízených výpadků (outstanding miss), o výkonu rozhoduje *propustnost*, nikoli latence.

```
Little's law:  outstanding_misses = bandwidth × latence / line_size
                50 GB/s × 200 ns = 10 000 B in flight
                10 000 B / 64 B = ~156 outstanding loads
```

⇒ Pro plné využití propustnosti musíme udržovat 100 a více výpadků současně rozpracovaných (in flight). Apple M1 má 192 MSHR — víc než Intel.

## Měření výkonu cache (benchmarking)

Empirické měření AMAT — *skenování s krokem* (stride scan):

```c
for (s = 1; s <= 4096; s *= 2) {
    for (i = 0; i < N; i += s) {
        sum += array[i];
    }
}
```

Změříme-li *čas na element* pro různé hodnoty `s`:

- s = 1: čte se sekvenčně, většinou cache hit → ~1 ns.
- s = 64 (jedna cache line): každý přístup zasáhne novou line → hit v L1 ~1 ns, ale jakmile pole přesáhne velikost L1 → hit v L2 ~4 ns.
- s = 8192 (úroveň TLB): výpadek v TLB → 30 ns navíc.

Jde o klasický experiment (LMbench, Saavedra-Barrera 1992).

::: svg "AMAT pro různé velikosti pracovní sady (working set size)"
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

## Optimalizace s ohledem na AMAT

Programátor může AMAT zlepšovat několika způsoby:

### Blokování (blocking, tiling)

Rozděl smyčku na bloky tak, aby pracovní sada *zůstala v cache*:

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

Blokování (tiling) dokáže násobení matic na velkých N zrychlit **3–10×**.

### Transformace rozložení dat (layout)

Pole struktur (array-of-structures, AoS) vs. struktura polí (structure-of-arrays, SoA):

```c
// AoS — špatná lokalita pro scan jednoho fieldu
struct Particle { float x, y, z, vx, vy, vz, mass; };
Particle ps[N];
for (i = 0; i < N; i++) ps[i].x += ps[i].vx;   // zbytečně načte vy, vz, mass

// SoA — lepší pro AVX vektorizaci a cache
float xs[N], ys[N], zs[N], vxs[N], vys[N], vzs[N], masses[N];
for (i = 0; i < N; i++) xs[i] += vxs[i];        // jen 2 streamy
```

SoA často přinese 2–4× zrychlení u fyzikálních výpočtů a simulací.

### Přednačítání (prefetch)

Explicitní instrukce `__builtin_prefetch(addr)` pošle žádost o načtení *bez čekání* na výsledek. Když jsou pak data potřeba, *už jsou* v L1.

```c
for (i = 0; i < N; i++) {
    __builtin_prefetch(&a[i + 16]);   // prefetch 16 elements ahead
    sum += a[i];
}
```

Funguje pro *předvídatelný* krok (stride); u náhodných přístupů je k ničemu.

## Co dál

[[ls-jednotka-mshr]] zavádí MSHR — hardware, který drží *více současně rozpracovaných výpadků (in-flight misses)*. Díky tomu se z dlouhých latencí stane jen drobnost, protože paměťové přístupy se zřetězují (pipelined memory access).

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §2.4-2.5; Wulf, W.A., McKee, S.A.: „Hitting the Memory Wall: Implications of the Obvious" (ACM SIGARCH Computer Arch. News 23(1), 1995, [DOI 10.1145/216585.216588](https://doi.org/10.1145/216585.216588)); McCalpin, J.D.: „STREAM Benchmark" ([www.cs.virginia.edu/stream/](https://www.cs.virginia.edu/stream/)).*
