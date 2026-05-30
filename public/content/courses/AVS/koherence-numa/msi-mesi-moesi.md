---
title: MSI, MESI, MOESI a MESIF protokoly
---

# Protokoly koherence cache — MSI, MESI, MOESI, MESIF

Cache coherence protokoly jsou *konečné automaty* per cache line. Definují *stavy* a *přechody* na události (procesor read/write, bus snoop). Tato sekce popisuje hierarchii: MSI (základ) → MESI (+E) → MOESI (+O) → MESIF (variant).

## MSI — base protocol

3 stavy:

- **M (Modified)** — vlastní jediná kopie, dirty (memory stale).
- **S (Shared)** — read-only, *více* cache může mít kopii. Memory čistá.
- **I (Invalid)** — žádná validní kopie.

### Přechody (read/write at this core)

| State | Action | New state | Bus action |
| :--- | :--- | :--- | :--- |
| I | core read | S | BusRead (load from memory or another cache) |
| I | core write | M | BusReadExclusive (invalidate others) |
| S | core read | S | (nothing — hit) |
| S | core write | M | BusUpgrade (invalidate others' S copies) |
| M | core read | M | (nothing — hit) |
| M | core write | M | (nothing — already exclusive) |

### Přechody (foreign bus action)

| State | Foreign action | New state | This core action |
| :--- | :--- | :--- | :--- |
| M | BusRead | S | flush dirty data, send to memory + requester |
| M | BusReadExclusive | I | flush dirty data, invalidate self |
| S | BusReadExclusive | I | invalidate self |
| S | BusRead | S | (nothing) |
| I | any | I | (nothing) |

### Limit MSI

Pro **clean** read-modify pattern (load + store, no sharing):

```c
// Core 1, no other cores hold A:
load A   → MSI: state I → S (BusRead)
store A  → MSI: state S → M (BusUpgrade — invalidate broadcast)
```

`BusUpgrade` je *zbytečný* — žádný jiný core nemá kopii. Ale MSI ho posílá vždy. Plýtvá bandwidth.

## MESI — přidává E (Exclusive)

4 stavy: MSI + **E (Exclusive)** — read-only, *jediná* kopie, memory čistá (= clean kopie M).

Klíčový moment: pokud při load *nikdo* nemá kopii, jde do E (ne S). Pak silent upgrade na M (no broadcast) pokud zapíše.

### Přechody (read/write at this core)

| State | Action | New state | Bus action |
| :--- | :--- | :--- | :--- |
| I | core read (no sharers) | **E** | BusRead, response "no sharers" |
| I | core read (sharers exist) | S | BusRead, response "shared" |
| I | core write | M | BusReadExclusive |
| **E** | core write | M | **(nothing — silent!)** |
| S | core write | M | BusUpgrade |
| M | any | M | (nothing) |

Klíčová optimalizace: **E → M silent**. Pro typický kód (allocate, init, use) usnadní:

```c
int *a = malloc(N * sizeof(int));    // allocate, no sharers
a[0] = 1;                             // I → E (load) → M (silent store)
a[1] = 2;                             // I → E → M
...
```

MSI by každý write generoval BusUpgrade. MESI nic.

⇒ MESI = standard ve většině moderních CPU. Intel, AMD od Pentium-era používají MESI nebo derivative.

::: svg "MESI state machine (zjednodušený)"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5">
    <circle cx="120" cy="60" r="35"/>
    <circle cx="420" cy="60" r="35"/>
    <circle cx="120" cy="180" r="35"/>
    <circle cx="420" cy="180" r="35"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600" font-size="14">
    <text x="120" y="65">I</text>
    <text x="420" y="65">M</text>
    <text x="120" y="185">S</text>
    <text x="420" y="185">E</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="120" y="78">Invalid</text>
    <text x="420" y="78">Modified</text>
    <text x="120" y="198">Shared</text>
    <text x="420" y="198">Exclusive</text>
  </g>
  <g stroke="var(--text)" fill="none" stroke-width="1">
    <path d="M155,60 L385,60" marker-end="url(#mesi-ar)"/>
    <path d="M120,95 L120,145" marker-end="url(#mesi-ar)"/>
    <path d="M155,180 L385,180" marker-end="url(#mesi-ar)"/>
    <path d="M420,145 L420,95" marker-end="url(#mesi-ar)"/>
    <path d="M155,75 Q270,150 385,165" marker-end="url(#mesi-ar)"/>
    <path d="M155,180 Q270,120 385,80" marker-end="url(#mesi-ar)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="270" y="55">core write (no sharers)</text>
    <text x="100" y="125">load w/ sharers</text>
    <text x="270" y="175">core write</text>
    <text x="445" y="125">core write (silent!)</text>
    <text x="190" y="135">load (none)</text>
    <text x="350" y="135">→ E</text>
  </g>
  <defs>
    <marker id="mesi-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--text)"/>
    </marker>
  </defs>
</svg>
:::

::: viz mesi-state-machine "Vyber protokol (MSI / MESI / MOESI). Klikni 'core 0 read', 'core 0 write' atd. — oba cores přepínají stavy podle pravidel; bus aktivita se zobrazí dole."
:::

## MOESI — přidává O (Owned)

5 stavů: MESI + **O (Owned)** — read-only kopie, která drží *nejaktuálnější* (dirty) data; je odpovědná za zásobování čtenářů a za pozdější write-back. Memory je zastaralá. Pro zápis musí owner nejprve invalidovat S-sharers a přejít do M.

Klíčový usability: pokud P1 má `M`, P2 reads — *bez* MOESI musí P1 flush do memory, P2 reads. **Dva** memory transactions.

S MOESI: P1 dá kopii P2 *přímo* (cache-to-cache transfer), P1 přechází do `O`, P2 do `S`. Memory *nedotčená* — `O` *odpovědný* za eventual write-back.

⇒ MOESI sníží memory traffic pro share-after-modify patterns.

Použití: AMD CPUs (Athlon → Zen). IBM POWER.

## MESIF — Intel variant

Intel Core i7+ používá **MESIF**:

- M, E, S, I jako MESI.
- **F (Forward)** — *jediná* z více S-stavu kopií, která *odpovídá* na BusRead.

Bez F: pokud 5 cache mají S kopii a další chce load, *všechny* by odpověděly současně (race). MESIF: jen F-state odpovídá.

Optimalizace pro *velký* L3 cache + mnoho jader — méně contention na bus.

## Srovnání protokolů

| Protokol | States | Cache-to-cache | Optimalizace pro |
| :--- | :--- | :--- | :--- |
| MSI | 3 | no | basic |
| MESI | 4 | partial | non-shared writes |
| MOESI | 5 | yes | share-after-modify |
| MESIF | 5 | yes (deterministic) | multi-sharer reads |

Volba protokolu závisí na *cache topologii* a *typické sharing pattern* aplikací.

## Příklad: producer-consumer

P0 produkuje, P1 spotřebuje:

```c
shared int buffer[1024];
shared int ready = 0;

// P0:
buffer[0..N-1] = data;
ready = 1;

// P1:
while (!ready);
use(buffer[0..N-1]);
```

S MESI:

1. P0 write `buffer[0]`: I → E → M (silent).
2. P0 writes `buffer[1..N-1]`: M stays.
3. P0 write `ready = 1`: I → E → M.
4. P1 read `ready`: BusRead → P0 flushes ready dirty to memory + P1 gets S, P0 → S. Memory updated.
5. P1 reads `buffer[0..N-1]`: each read causes P0 to flush + share.

Bandwidth efektivita: každý buffer line *jednou* transferred P0 → P1. Memory updated. OK.

S MOESI: P0 dirty cache lines mohou jít *přímo* P1 *bez* memory write. ~30 % bandwidth saving.

## False sharing v protokolu

Připomenutí ([[false-sharing-races]]): 2 cores update *různé* slots *stejné* line.

Z protokolu pohledu:

1. P0 stores `counts[0]`: line → M.
2. P1 stores `counts[1]`: BusReadExclusive → P0 flushes M, P1 gets M.
3. P0 stores `counts[0]` again: BusReadExclusive → P1 flushes M, P0 gets M.
4. ...

Cache line ping-pongs *between* M-states across cores. Each transfer = 100-300 cyklů. *To je* zdroj slowdown.

## Coherence overhead with scale

Snooping (broadcast každé invalidace) škáluje špatně — viz [[snooping-directory]].

⇒ Pro velké systémy (Intel Xeon 56-core, AMD EPYC 96-core): *directory-based* protokoly ([[snooping-directory]]).

## Co dál

[[snooping-directory]] vysvětluje *jak* hardware skutečně implementuje protokoly: snooping (broadcast) vs directory (point-to-point). [[uma-numa]] zobecňuje na *non-uniform* memory topology.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §5.2-5.4; Papamarcos, M.S., Patel, J.H.: „A Low-Overhead Coherence Solution for Multiprocessors with Private Cache Memories" (ISCA 1984, [DOI 10.1145/800015.808204](https://doi.org/10.1145/800015.808204)); Sorin, D.J., Hill, M.D., Wood, D.A.: „A Primer on Memory Consistency and Cache Coherence" (Morgan & Claypool 2011).*
