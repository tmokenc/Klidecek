---
title: Koherence cache — problém a podmínky
---

# Koherence cache — sdílená paměť mezi více jádry

Pokud více jader (CPU) sdílí jeden paměťový prostor (SAS, [[paralelni-modely]]) a *každé má vlastní cache*, vzniká *problém konzistence kopií*: stejná adresa může být v *různých* cache uložena s *různými* hodnotami. Koherence cache (cache coherence) je *hardwarový* mechanizmus, který zajistí, že programátorovi se celá paměť jeví jako *jediná* sdílená paměť.

Bez koherence by programování nad sdílenou pamětí (SAS) nebylo možné.

## Problém

Předpokládejme 3 jádra a sdílenou proměnnou `u` uloženou v paměti DRAM:

```
Initially: u = 5 in DRAM, none in cache.

T1: P1 reads u   → load u into P1.L1, u = 5.
T2: P3 reads u   → load u into P3.L1, u = 5.
T3: P3 writes u = 7   → P3.L1: u = 7.
T4: P1 reads u   → P1.L1 hit, returns 5 (STALE).
```

Jádro P1 vidí starou hodnotu! Tomuto stavu se říká *nekoherence (zastaralé čtení)* a pro paralelní program je nepřijatelný (✗).

Koherence vyžaduje, aby po kroku `T3` každé další čtení (read) dostalo hodnotu 7.

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

## Definice koherence cache

Cache je *koherentní*, pokud pro každý paměťový blok platí:

1. **Existuje jen jedna *koherentní* (aktuální) verze.**
2. Čtení adresy `A` z *libovolného* jádra P-i vrátí *naposledy zapsanou* hodnotu.
3. Při zápisu nové hodnoty se tato hodnota *šíří* (propagation) ke všem ostatním kopiím.

Musí být splněny tři vlastnosti:

- **Šíření (propagation)** — zápis (write) na adresu A v jádru P1 nakonec dorazí ke všem ostatním jádrům.
- **Serializace (serialization)** — *všechny* procesory vidí zápisy na adresu A v *témže pořadí*.
- **Konzistence (consistency)** — pravidla určující, *kdy* je aktualizace viditelná (závisí na zvoleném konzistenčním modelu).

První dvě dohromady tvoří *koherenci*. Třetí je *konzistence* (téma 6.1 v učebnici Hennessy–Patterson).

## Stavy bloku v cache

Blok se může nacházet v některém z těchto stavů:

- **Invalid (I)** — neplatná, nepoužitelná kopie, kterou je třeba ignorovat.
- **Shared (S)** — kopie pouze pro čtení. Tutéž S kopii může mít více cache najednou.
- **Modified (M)** / **Dirty** — kopie pro čtení i zápis, navíc *jediná* v systému. Hodnota v paměti je *zastaralá*.
- **Exclusive (E)** — kopie pouze pro čtení, ale *jediná* v systému. Hodnota v paměti je *aktuální*. (Optimalizace v protokolu MESI.)
- **Owned (O)** — kopie pouze pro čtení, *jediná* může rozesílat (broadcast) data ostatním. (V protokolu MOESI.)
- **Forward (F)** — kopie pouze pro čtení, která *odpovídá* na požadavky ostatních. (V protokolu MESIF.)

Podrobnosti k jednotlivým protokolům najdeš v [[msi-mesi-moesi]].

## Aktualizace paměti — Write-through vs. Write-back

Cache může zapisovat do nižší úrovně paměti dvěma způsoby ([[cache-politiky]]):

- **WT (Write-through)** — *každý* zápis jde *okamžitě* i do paměti. Cache a paměť tak zůstávají po každém zápisu koherentní.
- **WB (Write-back)** — *zápis* zůstane jen v cache a *paměť* je *zastaralá*. Do paměti se data zapíší až při vyřazení bloku (eviction).

Strategie WB je efektivnější (vyžaduje menší propustnost, bandwidth), ale z hlediska koherence je složitější — systém *musí* sledovat, kdo *má* upravenou (dirty) kopii.

Moderní procesory x86 a ARM používají pro úrovně L1 a L2 standardně **WB**. Strategie WT se používá *jen* ve velmi specifických případech (například v některých vestavěných systémech).

## Aktualizace ostatních cache — Invalidate vs. Update

Když P1 zapíše do `u`, má pro ostatní cache dvě možnosti:

### Write-invalidate

Rozešle se broadcast „invaliduj u". Ostatní cache označí *svou* kopii jako Invalid. Při příštím čtení ji musí *znovu* načíst.

Cena: jedna invalidační zpráva na každý zápis.

### Write-update

Rozešle se broadcast „u má novou hodnotu X". Ostatní cache *aktualizují* svou kopii přímo na místě (in-place).

Cena: jedna aktualizační zpráva plus přenos nové hodnoty na každý zápis.

**Kompromis (trade-off)**:

- Pokud po zápisu následuje *čtení* (vzor sdílení, sharing pattern) → výhodnější je update (není nutné data znovu načítat).
- Pokud po zápisu následuje *další zápis* (migrující vzor, migrating pattern) → výhodnější je invalidate (méně režie ze zpráv).

Empiricky převažuje migrující vzor. **Standardem v moderních procesorech je proto write-invalidate.**

## Kombinace strategií

| WT | WB | + | Invalidate | Update |
| :--- | :--- | :--- | :--- | :--- |
| ✓ | | + | ✓ | někdy |
| | ✓ | + | ✓ | zřídka |

Moderní procesory x86 a ARM: **WB + invalidate**.

Pro některé speciální oblasti paměti (UC = uncacheable, necachovatelná) se používá WT.

## Granularita koherence

Cache pracuje na úrovni *cache line* (řádek cache, 64 B), nikoli na úrovni *jednotlivého bajtu*. Koherence se tedy sleduje *po řádcích*:

- Při zápisu na `u` se invaliduje *celý* řádek obsahující `u`.
- Pokud sousední bajt `v` leží na stejném řádku, je *také* invalidován → falešné sdílení (false sharing, [[false-sharing-races]]).

⇒ Režie koherence cache je tedy *na řádek*, ne na bajt. Falešné sdílení je *přímým důsledkem* této granularity.

## Propustnost koherenčního provozu

Pro 32jádrový systém s 1 miliardou aktualizací za sekundu při vzoru sdílení vychází propustnost potřebná pro koherenci přibližně na 1 GB/s na jádro × 32 = 32 GB/s. To už konkuruje propustnosti samotné paměti.

To je jeden z důvodů, proč *nelze* sdílenou paměť snadno škálovat na tisíce jader — koherenční provoz by zničil propustnost.

Řešením pro velké systémy je NUMA spolu s lokalitou dat ([[uma-numa]]).

## Konzistence vs. koherence — v čem se liší

- **Koherence** = jednotnost zápisů na *jednu* adresu.
- **Konzistence** = *pořadí* zápisů na *různé* adresy.

Příklad koherence: P1 zapíše `a = 1`, poté P2 čte `a`. P2 *musí* vidět hodnotu `1`.

Příklad konzistence: P1 zapíše `a = 1`; poté `b = 2`. P2 čte nejprve `a`, pak `b`. Uvidí `a = 1`, `b = 2`? Sekvenční model říká, že ano. *Slabá konzistence (weak consistency)* může vrátit `a = 0, b = 2` (zápisy se totiž mohou stát viditelnými mimo pořadí).

Podrobnosti o konzistenci patří do oblasti *konzistenčního modelu paměti (memory consistency model)* (TSO, weak, release). Procesory x86 používají TSO, procesory ARM slabý (weak) model.

## Implementace koherence cache

Hardwarová vrstva implementuje protokol jako *konečný automat* pro každý řádek cache. Klíčové komponenty jsou:

- **Řadič cache (cache controller)** — sleduje stav řádku (M/E/S/I) a reaguje na události.
- **Bus snooper (odposlech sběrnice)** — naslouchá *cizím* paměťovým požadavkům a zjišťuje, kterých řádků se týkají.
- **Adresář (directory)** — distribuovaná tabulka, která eviduje, *kde* jsou kopie každého řádku (pro velké systémy).

Podrobnosti najdeš v [[snooping-directory]].

## Co dál

[[msi-mesi-moesi]] popisuje konkrétní protokoly se stavovými diagramy. [[snooping-directory]] se věnuje hardwarovým mechanizmům. [[uma-numa]] rozebírá topologie. [[intel-amd-fabric]] ukazuje reálné implementace v moderních procesorech.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §5.2; Culler, D.E., Singh, J.P., Gupta, A.: „Parallel Computer Architecture: A Hardware/Software Approach" (Morgan Kaufmann 1999), §5; Sorin, D.J., Hill, M.D., Wood, D.A.: „A Primer on Memory Consistency and Cache Coherence" (Morgan & Claypool 2011).*
