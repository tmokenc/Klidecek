---
title: Mapování cache — direct, set-assoc, fully-assoc
---

# Mapování bloků do cache

Cache musí rozhodnout: *kde* uložit blok z paměti? Tři klasické strategie tvoří *spektrum*:

- **Direct-mapped** — každý blok má *jedno* místo. Jednoduchá implementace, ale konflikty.
- **Fully-associative** — blok se může uložit *kamkoli*. Žádné konflikty, ale drahá vyhledávací logika.
- **Set-associative** (zlatá střední cesta) — *k* cest, blok do jedné z nich. Praktická volba (8-16 cesta typicky).

## Adresa jako tří části

Fyzická adresa (nebo virtuální v V/V cache) se rozkládá:

```
| Tag (t bitů) | Index (s bitů) | Block offset (b bitů) |
```

- **Block offset** — *který byte* uvnitř bloku. Pro 64 B line: 6 bitů.
- **Index** — *který set* (řádek tabulky). $2^s$ řádků.
- **Tag** — *identifikace* bloku v rámci řádku. Zbylé bity adresy.

Pro 64 kB L1, 64 B line, 4-way set-assoc:

- 64 kB / 64 B = 1024 blocks total.
- 4-way → 256 sets.
- Index = 8 bitů.
- Offset = 6 bitů.
- Tag = 48 - 8 - 6 = 34 bitů (pro 48-bit virtuální adresu).

## Direct-mapped cache

*1 cesta*, $2^s$ řádků. Každý blok z paměti má *jedinou* možnou pozici, danou indexem.

::: svg "Direct-mapped cache — 1 cesta, jediná pozice"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="20" width="100" height="20" rx="2"/>
    <rect x="120" y="20" width="100" height="20" rx="2"/>
    <rect x="220" y="20" width="60" height="20" rx="2"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="70" y="34">Tag (34 b)</text>
    <text x="170" y="34">Index (10 b)</text>
    <text x="250" y="34">Off (6 b)</text>
  </g>
  <text x="20" y="60" fill="var(--text)" font-weight="600">Cache (1024 řádků):</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="70" width="40" height="20" rx="2"/>
    <rect x="60" y="70" width="80" height="20" rx="2"/>
    <rect x="140" y="70" width="320" height="20" rx="2"/>
  </g>
  <text x="40" y="84" fill="var(--text-muted)" text-anchor="middle" font-size="9">V</text>
  <text x="100" y="84" fill="var(--text-muted)" text-anchor="middle" font-size="9">Tag</text>
  <text x="300" y="84" fill="var(--text-muted)" text-anchor="middle" font-size="9">Data (64 B)</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="95" width="40" height="20" rx="2"/>
    <rect x="60" y="95" width="80" height="20" rx="2"/>
    <rect x="140" y="95" width="320" height="20" rx="2"/>
    <rect x="20" y="120" width="40" height="20" rx="2"/>
    <rect x="60" y="120" width="80" height="20" rx="2"/>
    <rect x="140" y="120" width="320" height="20" rx="2"/>
  </g>
  <g fill="var(--accent)" opacity="0.3">
    <rect x="60" y="120" width="80" height="20"/>
    <rect x="140" y="120" width="320" height="20"/>
  </g>
  <text x="520" y="134" fill="var(--accent)" text-anchor="end" font-size="9" font-weight="600">← jediná pozice pro index 2</text>
  <text x="20" y="170" fill="var(--text-faint)" font-size="9">Lookup: index → vyber řádek → srovnat tag → hit/miss</text>
  <text x="20" y="185" fill="var(--text-faint)" font-size="9">Konflikt: 2 bloky s různými tagy ale stejným indexem se střídají</text>
</svg>
:::

**Výhody**: jeden komparátor tagu, rychlý lookup, levný HW.

**Nevýhody**: **konflikt miss** — i když je cache prázdná, dva bloky s *stejným indexem* se střídají v jediném slotu. Pathologic loop:

```c
for (i = 0; i < N; i++) {
    a[i] = b[i] + c[i];   // 3 různé adresy, možná stejný index
}
```

Pokud `a, b, c` jsou *zarovnané* na násobky cache size → každý přístup je miss. Direct-mapped L1 v 1980s byly známé tímto problémem.

## Fully-associative cache

Blok se může uložit *kamkoli*. Index = 0 bitů (jediný "set"), tag = celá horní část adresy.

**Výhody**: žádné konflikt missy. Optimální využití cache.

**Nevýhody**: lookup vyžaduje **paralelní porovnání všech tagů**. Pro 1024 řádků = 1024 komparátorů. Drahé, pomalé.

Použití: jen u *malých* cache. TLB má často 32-64 položek plně asociativně.

## Set-associative cache (SA cache)

Kompromis: cache rozdělená na **sety** (řádky). Každý set má **k cest**. Blok jde do daného setu (podle indexu), v setu *kamkoli* z k cest.

| Asociativita | Cesty | Komparátory | Konflikt-miss |
| :--- | :---: | :---: | :--- |
| Direct-mapped | 1 | 1 | hodně |
| 2-way | 2 | 2 | ~50% méně |
| 4-way | 4 | 4 | málo |
| 8-way | 8 | 8 | velmi málo |
| Fully-assoc | n | n | žádné |

Empirické pravidlo: **8-way ≈ fully-assoc** pro většinu reálných benchmarků. Vyšší asociativita už nepřináší.

::: viz cache-mapping "Posuv stopu adres přes cache. Změň asociativitu — pozoruj, jak konflikt-missy mizí s vyšším k. 0x100 a 0x200 mají stejný index, takže v direct-mapped se vytlačí."
:::

### Lookup v SA cache

::: svg "4-way set-associative cache"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="15" width="90" height="20" rx="2"/>
    <rect x="110" y="15" width="80" height="20" rx="2"/>
    <rect x="190" y="15" width="50" height="20" rx="2"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="65" y="29">Tag</text>
    <text x="150" y="29">Index</text>
    <text x="215" y="29">Off</text>
  </g>
  <text x="120" y="55" fill="var(--text)" font-weight="600" text-anchor="middle">Set vybraný indexem</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="65" width="120" height="35" rx="2"/>
    <rect x="145" y="65" width="120" height="35" rx="2"/>
    <rect x="270" y="65" width="120" height="35" rx="2"/>
    <rect x="395" y="65" width="120" height="35" rx="2"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600" font-size="10">
    <text x="80" y="82">Cesta 0</text>
    <text x="205" y="82">Cesta 1</text>
    <text x="330" y="82">Cesta 2</text>
    <text x="455" y="82">Cesta 3</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="80" y="95">tag + data</text>
    <text x="205" y="95">tag + data</text>
    <text x="330" y="95">tag + data</text>
    <text x="455" y="95">tag + data</text>
  </g>
  <g stroke="var(--accent)" fill="none" stroke-width="1.4">
    <path d="M65,40 L65,65" marker-end="url(#sa-arrow)"/>
  </g>
  <text x="60" y="125" fill="var(--accent)" text-anchor="middle" font-size="9">srovnat tag</text>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5">
    <rect x="60" y="130" width="40" height="22" rx="2"/>
    <rect x="185" y="130" width="40" height="22" rx="2"/>
    <rect x="310" y="130" width="40" height="22" rx="2"/>
    <rect x="435" y="130" width="40" height="22" rx="2"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="80" y="146">=?</text>
    <text x="205" y="146">=?</text>
    <text x="330" y="146">=?</text>
    <text x="455" y="146">=?</text>
  </g>
  <text x="270" y="180" text-anchor="middle" fill="var(--text)" font-weight="600">OR → hit</text>
  <text x="270" y="200" text-anchor="middle" fill="var(--text-faint)" font-size="9">k komparátorů paralelně, multiplex data → výsledek</text>
  <text x="270" y="220" text-anchor="middle" fill="var(--text-faint)" font-size="9">Trade-off: vyšší k = méně konflikt-miss, ale větší latence + plocha</text>
  <defs>
    <marker id="sa-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Tři druhy miss (3C model)

Mark Hill (1989) klasifikoval miss do *tří kategorií*:

### Compulsory (cold start) miss

První přístup na blok — *není* v cache, nemůže být. Nezávislé na velikosti/asociativitě.

Reduce: **prefetching** ([[prefetching]]) — načti dřív, než budeš potřebovat.

### Capacity miss

Cache *plná*, blok vyhozen, později znovu potřebný. Na *plně asociativní* cache stejné velikosti by to nebyl konflikt.

Reduce: **větší cache**, lepší vyřazování ([[cache-politiky]] LRU).

### Conflict miss

V *direct-mapped* nebo *low-associativity*: dva (nebo víc) bloky se *střídají* v jediném slotu, byť celková cache má místo.

Reduce: **vyšší asociativita**. 8-way + LRU má conflict miss ~zanedbatelné.

## Reálné konfigurace

| CPU | L1 D | L1 I | L2 | L3 |
| :--- | :--- | :--- | :--- | :--- |
| Intel Skylake | 32 kB, 8-way | 32 kB, 8-way | 256 kB, 4-way | 8 MB shared, 16-way |
| AMD Zen 4 | 32 kB, 8-way | 32 kB, 8-way | 1 MB, 8-way | 32 MB shared, 16-way |
| Apple M1 (P-core) | 128 kB, 8-way | 192 kB, 6-way | 12 MB shared, 12-way | — |

Trend: **8-way default**, *vyšší* na L3 (16-way nebo víc, sdílené mezi jádry, takže více tlaku).

Apple M1 P-core má **128 kB L1** — neobvyklé. Důvod: 16 kB pages (Apple Silicon) místo 4 kB → V/P index může být větší.

## Adresování — víc detailů

Pro lookup:

1. Vyber index z adresy → určuje *set*.
2. Souběžně načti *k tag položek* + *k data bloků* (paralelní RAM access).
3. Srovnej *k tagů* s tagem z adresy (paralelní komparátory).
4. Pokud match na cestě i → vrať `data[i]`, vybrat byte podle offsetu.
5. Pokud žádný match → **miss**, žádost na L2.

V plně asociativní = stejný princip, jen $k = $ počet bloků (drahé).

## Návrhové kompromisy

- **Větší cache** → vyšší latence (větší decoder, delší word lines). 32 kB L1 → 3 cyklů, 64 kB → 4-5.
- **Vyšší asociativita** → vyšší latence (víc komparátorů + multiplexor). 8-way → 4-5 cyklů, 16-way → 6+.
- **Větší blok** → lepší prostorová lokalita, ale víc *zbytečně* načteného. Sweet spot 64 B.
- **Více úrovní** → L1 malá+rychlá, L2 střední, L3 velká+pomalejší. Pyramid.

Návrh moderní cache hierarchie je *jemně vyladěný kompromis* mezi všemi pákami. Intel a AMD si změny ladí simulátorem na desítkách benchmarků.

## Co dál

[[cache-politiky]] řeší *eviction* (LRU/FIFO/random) a *write strategy* (WB/WT/allocate). [[amat-vykon-cache]] kvantifikuje *průměrnou latenci* cache hierarchie s miss rate.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=V_QS1HzJ8Bc" "Direct Memory Mapping" "Neso Academy"
:::

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), Appendix B + §2.3; Hill, M.D., Smith, A.J.: „Evaluating Associativity in CPU Caches" (IEEE Trans. Computers 38(12), 1989, [DOI 10.1109/12.40842](https://doi.org/10.1109/12.40842)); Bryant, R.E., O'Hallaron, D.R.: „Computer Systems: A Programmer's Perspective" (3rd ed., Pearson 2016), §6.4.*
