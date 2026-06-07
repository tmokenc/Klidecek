---
title: Politiky cache — eviction a write strategy
---

# Politiky cache — eviction a write strategy

Cache musí rozhodnout dvě věci dynamicky: *co vyhodit* při miss (eviction) a *kdy zapisovat* do nižší úrovně (write strategy). Špatná politika může snadno znamenat 2× horší výkon.

## Eviction — co vyhodit

Když dojde k miss a set je plný, jeden blok musí ven. Tři klasické politiky:

### LRU (Least Recently Used)

Vyhoď *nejdéle nepoužitý* blok. Implementace pomocí *pseudo-LRU* (binární strom, ~k-1 bitů metadat pro k-way) nebo *true LRU* (counter na cestu).

**Pro**: nejlepší hit-rate v praxi (pro temporal locality).
**Proti**: drahá implementace pro vysokou asociativitu. Sklouzává *anomalously* na *streaming* zátěž (lineární scan velkého pole vyhodí všechno užitečné).

Reálně: 4-8-way LRU optimální pro L1. 16-way LRU vstoupí do nepraktického HW → pseudo-LRU.

### FIFO (First In, First Out)

Vyhoď *nejstarší přijatý* blok bez ohledu na použití. Implementace: kruhový buffer index.

**Pro**: levné HW (jen pointer per set).
**Proti**: může vyhodit *čerstvě používaný* blok, pokud byl přidán dřív.

Bélády's anomaly: u FIFO se *více* paměti někdy znamená *víc miss*. Patologie známá z OS page replacement.

### Random

Vyhoď náhodný blok. Levné HW (PRNG nebo pseudo-random counter).

**Pro**: nejlevnější. *Překvapivě* dobré v praxi — eviktovat ohrožený blok podle náhody chybí nejhorší pathologie LRU.

Použití: některé velké L3 cache (16-32-way), kde true LRU by stál víc tranzistorů než benefit. ARM Mali GPU používá random.

### NRU, LFU, ARC, ostatní

Variace pro speciální užití (page replacement v OS, databáze). V CPU L1/L2/L3 se standardně používá *pseudo-LRU*.

### Politika replacement srovnání

| Politika | Hit rate | HW cena | Patologie |
| :--- | :---: | :---: | :--- |
| LRU | nejvyšší | vysoká pro k>8 | streaming kill all |
| Pseudo-LRU | -1-2 % | nízká | totéž |
| FIFO | -3-5 % | velmi nízká | Bélády's anomaly |
| Random | -5-10 % | nejnižší | žádná |

V moderním CPU L1/L2: pseudo-LRU. L3: random (nebo dynamic LRU/random adaptive).

::: viz replacement-policy-race "Vyber stopu adres (stream / Bélády / locality / mixed) a porovnej 4 politiky vedle sebe. LRU vs FIFO vs PLRU vs random — počet miss-ů a Bélády anomaly viditelné."
:::

## Write strategy — kdy zapsat dolů

Zápisová operace `sw r1, 0(r2)`: kam data v cache, kam (a kdy) do paměti?

### Write-through (WT)

*Každý zápis* jde **současně do cache i do nižší úrovně**. Cache a paměť *vždy konzistentní*.

```
sw r1, 0(r2)  → L1 + L2 (nebo L1 + DRAM přes write buffer)
```

**Pro**: triviální koherence (cache vždy odpovídá paměti). Vhodné pro write-rare zátěž (instrukce cache).

**Proti**: každý store sat the bandwidth nižší úrovně. Při bursty zápisech vede k *stall*. Potřebuje write buffer.

### Write-back (WB)

Zápis **pouze do cache**, blok se označí *dirty*. Když ho někdo vyhodí (eviction), *teprve* se zapíše dolů.

```
sw r1, 0(r2)  → L1, mark dirty
... později při eviction → write to L2 / DRAM
```

**Pro**: ušetří bandwidth (multi-write do stejné adresy → 1 write dolů). Standard pro L1 D, L2.

**Proti**: koherence složitější (musí se vědět, co je v L1 dirty). Při evikci dirty blok = další I/O.

### Write-allocate vs no-write-allocate (při miss)

Pokud `sw` *promáchne* cache (`store miss`), dvě možnosti:

- **Write-allocate** — načti blok do cache (read miss), pak zapiš. Typické pro WB cache.
- **No-write-allocate** (write-around) — *neukládej* do cache, zapiš rovnou dolů. Typické pro WT cache.

| Strategie | Allocate při write miss? | Typický pár |
| :--- | :--- | :--- |
| Write-through | no-write-allocate | WT + write-around |
| Write-back | write-allocate | WB + write-allocate |

Write-allocate je dobrý, pokud po store *čteš* stejnou adresu (typické pro update). No-write-allocate je dobrý pro streaming write (memset velkého pole).

## Praktické konfigurace {tier=practice}

| CPU | L1 D | L2 | L3 |
| :--- | :--- | :--- | :--- |
| Intel Skylake | WB + write-allocate | WB | WB |
| AMD Zen 4 | WB + write-allocate | WB | WB |
| ARM Cortex-A78 | WB + write-allocate | WB | WB |
| Apple M1 | WB | WB | inkluzivní WB |

WB+write-allocate je *standard* pro D-cache. I-cache je obvykle *read-only* (instrukce se nezapisují), takže politika je triviální.

## Inkluze (inclusion)

Jak souvisí obsah L1, L2, L3?

### Strict inclusion

L2 ⊇ L1, L3 ⊇ L2 ⊇ L1. Když eviktuje L1, nic se nestane (kopie zůstává v L2). Když eviktuje L2, musí se *vyhodit* i z L1 (*back-invalidation*).

**Pro**: koherence snadná (sledovat se musí jen LLC). Snooping protokol ([[snooping-directory]]) optimalizovaný pro inkluzi.

**Proti**: L1 + L2 + L3 = redundance. Z velikosti L3 se efektivně používá L3 - L2 - L1.

### Strict exclusion

L1 ∩ L2 = ∅. Když blok jde do L1, *opustí* L2. Když L1 vyhodí, putuje do L2 (a tam musí být místo).

**Pro**: lepší využití cache (L1 + L2 + L3 = celá kapacita).

**Proti**: koherence komplikovanější. Migration mezi úrovněmi je víc traffic.

### Non-inclusive non-exclusive (NINE)

Středka — nic se *negarantuje*. Hardware spravuje dle libosti.

| CPU | Politika |
| :--- | :--- |
| Intel Skylake | NINE (L2 vs L3) |
| AMD Zen 4 | exclusive (L2 vs L3) |
| Intel Sandy Bridge | inclusive L3 |
| Apple M1 | inclusive L2 (sdílená napříč P-cores) |

Trend: **NINE nebo exclusive** pro moderní x86, kvůli vyššímu využití.

## Propustnost a latence cache

Stream benchmark (John McCalpin) měří propustnost paměti čtyřmi operacemi: copy, scale, add, triad. Výsledky:

- Jedno jádro Intel Xeon Platinum 8260 (24 jader): ~12 GB/s.
- Více jader najednou: až ~140 GB/s na socket (NUMA-aware).

⇒ Bandwidth *neškáluje lineárně* s počtem jader — limit propustnost DRAM controllerů.

## Co dál

[[amat-vykon-cache]] zavádí Average Memory Access Time — *kvantifikace* dopadu miss rate a politiky na CPI. [[ls-jednotka-mshr]] pak řeší, jak OoO CPU drží *více miss in flight*.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §2.2 + Appendix B; Smith, A.J.: „Cache Memories" (ACM Computing Surveys 14(3), 1982, [DOI 10.1145/356887.356892](https://doi.org/10.1145/356887.356892)); McCalpin, J.D.: „STREAM Benchmark" ([www.cs.virginia.edu/stream/](https://www.cs.virginia.edu/stream/)).*
