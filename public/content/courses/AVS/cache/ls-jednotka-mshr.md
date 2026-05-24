---
title: Load/Store jednotka, MSHR a OoO paměť
---

# Load/Store jednotka, MSHR a out-of-order paměťové operace

OoO CPU má *desítky* in-flight load/store. Klasické "1 load = 1 stall" nestačí — moderní L/S jednotka udržuje **mnoho missů paralelně** přes **MSHR** (Miss-Status Handling Registers) a *spekulativně* mění pořadí přístupů přes **load/store buffers**.

## Architektura L/S jednotky

::: svg "OoO Load/Store jednotka"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="30" width="120" height="35" rx="3"/>
  </g>
  <text x="80" y="50" text-anchor="middle" fill="var(--text)" font-weight="600">RS Load/Store</text>
  <g fill="var(--accent)" opacity="0.15" stroke="var(--accent)">
    <rect x="170" y="20" width="160" height="50" rx="3"/>
  </g>
  <text x="250" y="38" text-anchor="middle" fill="var(--text)" font-weight="600">L/S Unit (LSU)</text>
  <text x="250" y="52" text-anchor="middle" fill="var(--text-muted)" font-size="9">addr generation</text>
  <text x="250" y="65" text-anchor="middle" fill="var(--text-muted)" font-size="9">disambiguation</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="360" y="20" width="80" height="50" rx="3"/>
    <rect x="460" y="20" width="60" height="50" rx="3"/>
  </g>
  <text x="400" y="38" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">Load</text>
  <text x="400" y="52" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">Buffer</text>
  <text x="400" y="65" text-anchor="middle" fill="var(--text-muted)" font-size="9">~64-128</text>
  <text x="490" y="38" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">Store</text>
  <text x="490" y="52" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">Buffer</text>
  <text x="490" y="65" text-anchor="middle" fill="var(--text-muted)" font-size="9">~56-72</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="170" y="100" width="200" height="35" rx="3"/>
  </g>
  <text x="270" y="120" text-anchor="middle" fill="var(--text)" font-weight="600">D-cache L1 (32-128 kB)</text>
  <g fill="var(--accent-line)" opacity="0.15" stroke="var(--accent-line)">
    <rect x="390" y="100" width="130" height="35" rx="3"/>
  </g>
  <text x="455" y="115" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">MSHR</text>
  <text x="455" y="128" text-anchor="middle" fill="var(--text-muted)" font-size="9">in-flight miss tracker</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="170" y="165" width="200" height="30" rx="3"/>
  </g>
  <text x="270" y="184" text-anchor="middle" fill="var(--text)" font-weight="600">L2 → L3 → DRAM</text>
  <g stroke="var(--text-faint)" stroke-dasharray="2 2" fill="none">
    <path d="M140,50 L170,50"/>
    <path d="M330,50 L360,50"/>
    <path d="M330,50 L460,50"/>
    <path d="M270,70 L270,100"/>
    <path d="M455,135 L455,165"/>
    <path d="M270,135 L270,165"/>
  </g>
</svg>
:::

### Address Generation Unit (AGU)

Vstup: `base, offset`. Výstup: virtuální adresa, předaná TLB k překladu na fyzickou. Často 2-3 AGU paralelně (Intel Skylake: 4 AGU).

### Load buffer / Store buffer

In-flight load/store sledování. Položky obsahují:

- Cílový PRF (pro load) nebo data (pro store).
- Adresa (po AGU + TLB).
- Stav: address-ready, data-ready, complete.

### Memory disambiguation

Když OoO chce vydat `load` *před* dřívějším `store` v pořadí, musí ověřit, že *adresy neshodují*. Pokud ano → "store-to-load forwarding". Pokud ne (a load uhodl dopředu) → flush.

Spekulativně CPU často "uhádne" že load je nezávislý — *memory dependence prediction*.

## MSHR — Multiple in-flight misses

Pokud CPU může mít jen *jednu* missující load v progress, OoO ztrácí všechen smysl při memory-bound zátěži. **MSHR** sleduje *více souběžných miss requests*.

Každý MSHR slot drží:

- Adresu missující line.
- Bitmap *kterých* polí v line někdo čeká (load merging — víc loadů na stejnou line = jen 1 request, ale víc cílových registrů).
- Tag pro return path.

### MSHR plnost

Když všechny MSHR sloty obsazené, *nový miss zabrzdí jádro*. Tomu se říká **MSHR stall**.

| CPU | MSHR per L1 |
| :--- | :---: |
| Intel Pentium 4 | 8 |
| Intel Skylake | 10 |
| AMD Zen 4 | 22 |
| Apple M1 Firestorm | 192 |

M1 má neobvyklé množství MSHR — *záměrná* designerská volba pro paměťově náročné Apple Silicon workloads (ML, video, audio).

### Little's law

Bandwidth $B = \frac{N}{L}$, kde $N$ = počet outstanding requests, $L$ = latence per request.

Pro DRAM bandwidth 50 GB/s, line size 64 B, latence 200 ns:

$$
N = B \cdot L / \text{line} = 50 \cdot 10^9 \cdot 200 \cdot 10^{-9} / 64 = 156
$$

⇒ Plné využití bandwidth = **156 outstanding loads**. To je proč M1 má 192 MSHR.

## Load-Store ordering

CPU musí respektovat *memory consistency model* — pravidla, *jakým způsobem* může OoO měnit pořadí.

| Model | Allowed reorderings | Příklady CPU |
| :--- | :--- | :--- |
| Sequential Consistency (SC) | žádné | učebnice, MIPS R10000 |
| Total Store Order (TSO) | load přes store, store-load relax | x86, SPARC |
| Weak ordering | volnější | ARMv7, POWER |
| Release consistency | acquire/release synchronizace | ARMv8 |

x86 TSO: store buffer drží stores in-order, ale *load* po store-buffer-hit může pokračovat. Nevynucuje to "see other CPUs' stores in same order".

ARM relaxed: bez `dmb` barier *žádný* order garantován. Programátor musí explicitně bariéry vložit.

### Memory fences

- `mfence` (x86) — všechny předchozí loads + stores před, všechny budoucí po.
- `lfence` — load fence (ne barrier proti store).
- `sfence` — store fence.
- ARM `dmb sy` — full barrier.

V single-thread kódu OoO může reordering libovolně, pokud sekvenční sémantika sedí. V multi-thread *bez locks/atomics* nastávají race conditions.

## Spekulativní loads

OoO chce vydat load *před* dřívějším store, ale memory disambiguation může zjistit shodu adres pozdě. Strategie:

### Conservative

Load *čeká* na adresu *všech* dřívějších stores. *Pomalé*, ale bezpečné.

### Aggressive (default)

Load vydá *bez ohledu* na dřívější stores. Pokud se ukáže, že *adresy se shodují*:

- **Store-to-load forwarding** — pošli store hodnotu *přímo* loadu (rychlé).
- **Load replay / flush** — pokud forwarding není možný (různé velikosti, alignment), vyhoď a opakuj.

Intel a AMD používají *memory dependence predictor* — naučí se, *které* loady jsou typicky safe to speculate.

### Memory ordering speculation

V multi-thread kontextu CPU může spekulovat, že *jiné CPU* neudělají store mezi tím. Pokud udělají (přes koherenci cache), flush a replay. Tomu se říká *memory ordering violation*.

Spekulativně-prováděné loady které pak prohrály — *Spectre*-friendly side channel ([[spekulace-vyjimky]]).

## Practical bottlenecks

Co může vypálit L/S výkon:

1. **MSHR plnost** — burst load streams, řešení = víc MSHR nebo prefetch.
2. **Address generation throughput** — 2-4 AGU, žravé loop body.
3. **D-cache port** — Intel L1 = 2 reads + 1 write per cycle. Více = bottleneck.
4. **Store buffer plnost** — frequent stores bez retire = OoO stagnuje.
5. **TLB miss** — page walk přidá 10-30 cyklů (HW walker).

V praxi memory bound kód (matrix multiply, BFS) je často limitován **bandwidth + MSHR**, ne čistě latencí.

## Co dál

Tím končí Topic 3 — cache. Topic 4 ([[staticka-predikce]], [[bht-2bit]]) se vrátí k *control* hazardům a popíše, jak moderní jádra dosahují 95+% branch prediction accuracy. Pak [[prefetching]] uzavře hardware-driven cache optimization.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §2.6 + §3.7; Kroft, D.: „Lockup-free Instruction Fetch/Prefetch Cache Organization" (ISCA 1981, [DOI 10.1145/800052.801868](https://doi.org/10.1145/800052.801868)); Yeager, K.C.: „The MIPS R10000 Superscalar Microprocessor" (IEEE Micro 16(2), 1996); [Real World Tech: Apple M1 LSU Analysis](https://www.realworldtech.com/m1-firestorm/).*
