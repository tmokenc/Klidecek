---
title: Snooping a directory protokoly
---

# Snooping vs Directory — implementace koherence

Protokoly MESI/MOESI ([[msi-mesi-moesi]]) říkají *co* dělat. Hardware musí *najít*, *kdo má* kopii a *broadcastovat* invalidations. Dvě klasické implementace: **snooping** (broadcast) a **directory** (tabulka).

## Snooping (bus snooping)

Princip: *všechny* cache *naslouchají* všem memory requests na sběrnici. Když P0 vyšle BusRead pro adresu A, *všechny* cache zkontrolují, *zda mají* A. Ti, co mají, reagují.

::: svg "Snooping protocol — broadcast on shared bus"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="20" width="80" height="40" rx="3"/>
    <rect x="140" y="20" width="80" height="40" rx="3"/>
    <rect x="260" y="20" width="80" height="40" rx="3"/>
    <rect x="380" y="20" width="80" height="40" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="60" y="40">P0+L1</text>
    <text x="180" y="40">P1+L1</text>
    <text x="300" y="40">P2+L1</text>
    <text x="420" y="40">P3+L1</text>
  </g>
  <g stroke="var(--accent)" stroke-width="2" fill="none">
    <line x1="20" y1="100" x2="520" y2="100"/>
  </g>
  <text x="270" y="120" fill="var(--accent)" text-anchor="middle" font-weight="600">Sdílená sběrnice (snoop bus)</text>
  <g stroke="var(--text-faint)" fill="none" stroke-dasharray="2 2">
    <line x1="60" y1="60" x2="60" y2="100"/>
    <line x1="180" y1="60" x2="180" y2="100"/>
    <line x1="300" y1="60" x2="300" y2="100"/>
    <line x1="420" y1="60" x2="420" y2="100"/>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="180" y="150" width="180" height="40" rx="3"/>
  </g>
  <text x="270" y="172" text-anchor="middle" fill="var(--text)" font-weight="600">Memory + L3</text>
  <line x1="270" y1="100" x2="270" y2="150" stroke="var(--accent)" stroke-width="1" fill="none"/>
</svg>
:::

### Mechanismus pro BusReadExclusive (write)

1. P0 chce write na A. Pokud nemá kopii → BusReadExclusive broadcast.
2. Všechny ostatní cache:
   - Pokud nemají A → tichý NACK / ignore.
   - Pokud mají A v stavu S → invaliduj (S → I).
   - Pokud mají A v stavu M → flush dirty data, *pak* invalidate (M → I).
3. P0 dostane data + exclusive ownership: stav M.

### Pro a proti

**Pro**:

- Jednoduchá implementace.
- Žádná centrální struktura.
- Funguje pro 2-16 jader.

**Proti**:

- *Všechna* požadavek dotazují *všechny* cache.
- Bandwidth roste $O(N)$ per request — celkový traffic $O(N^2)$ pro N cores.
- Bus je *bottleneck* — všechny transakce serializuje.
- Pro N > 32: *prakticky neudržitelné*.

### Snooping varianty

- **Sběrnicový snooping** — single bus, *všichni* slyší. Maximum ~16 jader.
- **Ring snooping** — kruhový tok dat, *každý core* prochází postupně. Intel Sandy Bridge (8 jader L3 ring).
- **Crossbar** — dedikované point-to-point. Sun SPARC T3 (8-16 jader).
- **2D mesh** — Intel Knights Landing, Skylake-SP (mřížka). Snooping rozšířený via mesh routing.

Bus snooping přestal být dominant od cca 2010 — moderní x86 používá mesh + directory pro koherenci.

## Directory protokoly

Princip: *centrální* (nebo distribuovaná) tabulka *sleduje*, *kdo má* kterou cache line.

Pro každou paměťovou line:

- **Bitvektor** — který CPU má kopii (N bits pro N cores).
- **State** — global state (Modified, Shared, Invalid).
- **Owner** — pokud Modified, *kdo*.

### Mechanismus pro BusRead

1. P0 chce read A. Pošle *home directory* (typicky LLC slice odpovědný za A).
2. Directory lookup:
   - Pokud line **Modified** v Px → pošli message Px "send data to P0", changes to Shared.
   - Pokud line **Shared** → directory provides data, add P0 to bitvector.
   - Pokud line **Invalid** → fetch from memory.

⇒ Communication: *point-to-point* (P0 → directory → owner → P0), ne *broadcast*. **Scalable**.

### Pro a proti

**Pro**:

- Scalable to 100s of cores.
- Žádný broadcast → lower bandwidth.
- Per-line bitvector minimální overhead pro ~64 cores.

**Proti**:

- Komplexní implementace.
- Vyšší latence (3-hop: requester → directory → owner → requester).
- Storage overhead per line (~N bits pro N cores).

### Distribuované directory

Aby directory *sám* nebyl bottleneck, je *distribuovaný*:

- Each cache line *home* = určitý LLC slice / NUMA node.
- Hash adresy → určuje, *který* slice.
- Requests jdou *primárně* k home slice.

Intel mesh (Skylake-SP, Sapphire Rapids): LLC rozdělená na slices, hash adresy → home tile. Coherence agent v každé tile.

## Hybridní přístupy

### Snoop filter

V mesh-based systému: každý L3 slice má *snoop filter* — bitvektor, *které* L2 mají copy. Při invalidate se *neposílá* broadcast, ale jen těm, kdo skutečně mají copy.

Filtr je *cache* pro bitvector. Pokud miss → fallback na full broadcast.

Intel Broadwell, Skylake: snoop filter +50 % cores na same chip vs. plain snooping.

### Source snoop vs Home snoop

V multi-socket systémech (NUMA):

- **Source snoop** — žadatel broadcastne *všechny* sockets. Rychlé pro cache-to-cache, ale traffic-heavy.
- **Home snoop** — žadatel pošle jen *home* socket (kde data fyzicky leží). Home dělá lookup, rozhoduje, kam dál. Méně traffic, vyšší latence.

Intel: home snoop preferred pro EX, Source pro server with 2-4 sockets.

## Cesta requestu v moderním CPU

Příklad Intel Skylake-SP (24-core mesh):

1. P5 chce load A.
2. L1 miss → L2 miss → L3 slice 7 (hash A → slice 7).
3. Slice 7 *je home* — má directory entry.
4. Directory says: P3 has dirty copy.
5. Slice 7 sends RFO (Request For Ownership) to P3.
6. P3.L1 → M state, flush data → slice 7.
7. Slice 7 forwards data to P5. P5 gets E state.
8. Directory updated: owner = P5.

Total: ~50-100 cyklů (cross-tile traffic ~10 cyklů each hop).

## NUMA + directory

Multi-socket: each socket má *vlastní* directory pro lokální memory. Cross-socket traffic přes inter-socket fabric (QPI / UPI / Infinity Fabric).

Detaily v [[intel-amd-fabric]].

## Performance considerations

### Coherence traffic measurement

```bash
perf stat -e mem_inst_retired.lock_loads,offcore_response.* ...
```

Intel `OFFCORE_RESPONSE` counters ukáží *cross-core* coherence requests.

### Bandwidth

Pro 24-core Skylake-SP: peak coherence bandwidth ~50 GB/s. Memory peak ~150 GB/s. Když workload má high coherence traffic (frequent sharing), coherence může dominovat.

### Optimization

1. **Minimize sharing** — partition data, NUMA-aware allocation.
2. **Padding** — vyhnout false sharing.
3. **Per-thread state** + occasional sync.
4. **Read-mostly data** → use S state efektivně (`const` data).

## Co dál

[[uma-numa]] popisuje *NUMA topology* — fyzické vlivy na coherence traffic. [[intel-amd-fabric]] specifikuje fabric protokoly Intel UPI, AMD Infinity Fabric.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §5.3-5.4; Censier, L.M., Feautrier, P.: „A New Solution to Coherence Problems in Multicache Systems" (IEEE Trans. Computers C-27(12), 1978); Lenoski, D. et al.: „The Stanford DASH Multiprocessor" (IEEE Computer 25(3), 1992).*
