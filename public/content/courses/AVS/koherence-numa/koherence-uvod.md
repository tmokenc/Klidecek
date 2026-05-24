---
title: Cache koherence — problém a podmínky
---

# Cache koherence — sdílená paměť mezi více jádry

Pokud více jader (CPUs) sdílí paměťový prostor (SAS, [[paralelni-modely]]) a *má vlastní cache*, vzniká *problém konzistence kopií*: stejná adresa může být v *různých* cache s *různými* hodnotami. **Cache coherence** je *hardware* mechanizmus, který zajistí, že programátorovi to vypadá jako *jedna* paměť.

Bez koherence by SAS programování bylo nemožné.

## Problém

Předpokládejme 3 jádra, sdílená proměnná `u` na DRAM:

```
Initially: u = 5 in DRAM, none in cache.

T1: P1 reads u   → load u into P1.L1, u = 5.
T2: P3 reads u   → load u into P3.L1, u = 5.
T3: P3 writes u = 7   → P3.L1: u = 7.
T4: P1 reads u   → P1.L1 hit, returns 5 (STALE).
```

P1 vidí starou hodnotu! Tohle je *neperzistence*. Pro paralelní program ✗.

Koherence říká: po `T3`, jakákoli další **read** musí dostat hodnotu 7.

::: svg "Cache koherence problém"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="20" width="100" height="40" rx="3"/>
    <rect x="220" y="20" width="100" height="40" rx="3"/>
    <rect x="420" y="20" width="100" height="40" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="70" y="40">P1</text>
    <text x="270" y="40">P2</text>
    <text x="470" y="40">P3</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="70" y="56">u = 5</text>
    <text x="270" y="56">u = ?</text>
    <text x="470" y="56">u = 7</text>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="80" width="100" height="30" rx="3"/>
    <rect x="220" y="80" width="100" height="30" rx="3"/>
    <rect x="420" y="80" width="100" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="70" y="100">L1 cache</text>
    <text x="270" y="100">L1 cache</text>
    <text x="470" y="100">L1 cache</text>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="130" width="500" height="40" rx="3"/>
  </g>
  <text x="270" y="155" text-anchor="middle" fill="var(--text)" font-weight="600">Sdílená paměť (DRAM): u = 5 (zastaralé!)</text>
  <text x="270" y="195" text-anchor="middle" fill="var(--text-faint)" font-size="9">Bez koherence: P1 vidí 5, P3 vidí 7. Sdílená paměť ne-pravdivá.</text>
</svg>
:::

## Definice cache koherence

Cache je *koherentní*, pokud pro každý paměťový blok:

1. **Existuje jen jedna *koherentní* (aktuální) verze.**
2. Při čtení adresy `A` *jakékoli* P-i vrátí *poslední zapsanou* hodnotu.
3. Při zápisu nové hodnoty se *šíří* (propagation) všem ostatním kopiím.

Tři vlastnosti, které musí být splněny:

- **Propagation** — write na A v P1 nakonec dorazí všem ostatním cores.
- **Serialization** — writes na A *všichni* CPU vidí v *stejném pořadí*.
- **Consistency** — pravidla, *kdy* update viditelný (závisí na consistency model).

První dvě = *koherence*. Třetí = *konzistence* (Topic 6.1 v Hennessy-Patterson).

## Stavy bloku v cache

Block se nachází v některém ze stavů:

- **Invalid (I)** — nepoužitelná kopie, ignorovat.
- **Shared (S)** — read-only kopie. Více cache může mít S kopii.
- **Modified (M)** / **Dirty** — read-write, *jediná* kopie. Memory je *zastaralá*.
- **Exclusive (E)** — read-only, *jediná* kopie. Memory je *aktuální*. (Optimalizace v MESI.)
- **Owned (O)** — read-only, *jediná* může broadcast. (V MOESI.)
- **Forward (F)** — read-only, *odpovídá* na požadavky. (V MESIF.)

Detaily protokolů v [[msi-mesi-moesi]].

## Aktualizace paměti — Write-through vs Write-back

Cache může psát do nižší úrovně dvěma způsoby ([[cache-politiky]]):

- **WT (Write-through)** — *každý* write jde do paměti *okamžitě*. Cache + memory koherentní per write.
- **WB (Write-back)** — *write* zůstane v cache, *paměť* je *stale*. Write back až při eviction.

WB efficient (méně bandwidth), ale pro koherenci komplikovanější — *musí* sledovat, kdo *má* dirty kopii.

Moderní x86, ARM: **WB** standard pro L1, L2. WT *jen* v velmi specifických scenarios (some embedded).

## Aktualizace ostatních cache — Invalidate vs Update

Když P1 zapíše do `u`, dvě možnosti pro ostatní cache:

### Write-invalidate

Pošli broadcast "invaliduj u". Jiné cache označí *jejich* kopii jako Invalid. Při příštím read musí *znovu* nahrát.

Cost: 1 invalidation message per write.

### Write-update

Pošli broadcast "u má novou hodnotu X". Ostatní cache *updatují* svou kopii in-place.

Cost: 1 update message + new value per write.

**Trade-off**:

- Pokud následuje *čtení* (sharing pattern) → update lepší (no re-fetch).
- Pokud následuje *další zápis* (migrating pattern) → invalidate lepší (less message overhead).

Empiricky migrating pattern dominuje. **Write-invalidate je standard** v moderních CPU.

## Combinace strategií

| WT | WB | + | Invalidate | Update |
| :--- | :--- | :--- | :--- | :--- |
| ✓ | | + | ✓ | sometimes |
| | ✓ | + | ✓ | rare |

Moderní x86, ARM: **WB + invalidate**.

Pro některé instrumented memory (UC = uncacheable) WT used.

## Granularita koherence

Cache pracuje na *cache line* (64 B), ne na *individual byte*. Koherence sleduje *line-level*:

- Při write na `u` se invaliduje *celá* line obsahující `u`.
- Pokud `v` (sousední byte) je na stejné line, *také* invalidated → false sharing ([[false-sharing-races]]).

⇒ Cache koherence overhead je *per line*, ne per byte. False sharing je *přímý důsledek*.

## Bandwidth coherence traffic

Pro 32-core systém s 1 GHz updates per second na sharing pattern: bandwidth na koherenci ~1 GB/s per core × 32 = 32 GB/s. Konkurenční s memory bandwidth.

To je jeden z důvodů, proč *nelze* trivially scale na 1000s of cores se sdílenou pamětí — koherenci traffic by zničil propustnost.

Řešení pro velké systémy: NUMA + lokality dat ([[uma-numa]]).

## Konzistence vs koherence — jiné

- **Koherence** = jednotnost zápisů na *jednu* adresu.
- **Konzistence** = *pořadí* zápisů na *různé* adresy.

Příklad koherence: P1 píše `a = 1`, pak P2 čte `a`. P2 *musí* vidět `1`.

Příklad konzistence: P1 píše `a = 1`; `b = 2`. P2 čte `a`, pak `b`. Vidí `a = 1`, `b = 2`? Sekvenční model říká ano. *Weak consistency* může vrátit `a = 0, b = 2` (out-of-order writes visible).

Detaily konzistence patří do *memory consistency model* (TSO, weak, release). x86 = TSO, ARM = weak.

## CC implementace

Hardware vrstva implementuje protokol jako *konečný automat* per cache line. Klíčové komponenty:

- **Cache controller** — sleduje stav line (M/E/S/I), reaguje na události.
- **Bus snooper** — naslouchá *cizí* memory requests, detekuje impacted lines.
- **Directory** — distribuovaná tabulka, *kde* jsou kopie každé line (pro velké systémy).

Detaily v [[snooping-directory]].

## Co dál

[[msi-mesi-moesi]] popisuje konkrétní protokoly se state diagramy. [[snooping-directory]] hardware mechanismy. [[uma-numa]] topologie. [[intel-amd-fabric]] reálné implementace v moderních CPU.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §5.2; Culler, D.E., Singh, J.P., Gupta, A.: „Parallel Computer Architecture: A Hardware/Software Approach" (Morgan Kaufmann 1999), §5; Sorin, D.J., Hill, M.D., Wood, D.A.: „A Primer on Memory Consistency and Cache Coherence" (Morgan & Claypool 2011).*
