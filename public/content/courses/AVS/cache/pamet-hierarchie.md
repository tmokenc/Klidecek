---
title: Hierarchie paměti, lokalita a virtuální paměť
---

# Hierarchie paměti — lokalita a TLB

Mezi *CPU* a *DRAM* je propast: jádro běží na 3-5 GHz (cyklus 0,3 ns), DRAM má latenci ~80-100 ns. To je *200-300× propast*. Kdyby OoO čekal každý load, IPC by spadl k 0,01. Řešení: **hierarchie paměti** — postupné stupně cache, mezi nimiž se data *přesouvají*.

## Hierarchie

::: svg "Hierarchie paměti — kapacita vs latence"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="60" y="20" width="60" height="30" rx="3"/>
    <rect x="40" y="55" width="100" height="30" rx="3"/>
    <rect x="20" y="90" width="140" height="30" rx="3"/>
    <rect x="0" y="125" width="180" height="30" rx="3"/>
    <rect x="0" y="160" width="540" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" font-weight="600" font-size="10" text-anchor="middle">
    <text x="90" y="40">Reg</text>
    <text x="90" y="75">L1 (32 kB)</text>
    <text x="90" y="110">L2 (256 kB)</text>
    <text x="90" y="145">L3 (8-32 MB)</text>
    <text x="270" y="180">DRAM (16-128 GB)</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="start" font-size="9">
    <text x="200" y="40">~0 cyklů</text>
    <text x="200" y="75">~4 cykly, 1 TB/s</text>
    <text x="200" y="110">~12 cyklů, 300 GB/s</text>
    <text x="200" y="145">~35 cyklů, 100 GB/s</text>
    <text x="350" y="180">~200 cyklů, 30 GB/s (DDR5)</text>
  </g>
  <g fill="var(--text-faint)" text-anchor="start" font-size="9">
    <text x="430" y="40">na čipu jádra</text>
    <text x="430" y="75">na čipu jádra (split I+D)</text>
    <text x="430" y="110">na čipu jádra</text>
    <text x="430" y="145">sdíleno mezi jádry</text>
  </g>
  <g stroke="var(--accent)" fill="none" stroke-width="1" stroke-dasharray="2 2">
    <line x1="195" y1="200" x2="195" y2="20"/>
  </g>
  <g fill="var(--text-faint)" font-size="9">
    <text x="0" y="215">malé, blízko</text>
    <text x="430" y="215">velké, daleko</text>
  </g>
</svg>
:::

| Úroveň | Velikost | Latence | Propustnost | Umístění |
| :--- | :---: | :---: | :---: | :--- |
| Register file | ~256 B | 0 | — | uvnitř datapath |
| L1 cache | 32 kB / split I+D | 3-5 cyklů | 1 TB/s | na jádru |
| L2 cache | 256 kB – 1 MB | 10-15 cyklů | 300 GB/s | na jádru |
| L3 cache (LLC) | 8-64 MB | 30-50 cyklů | 100 GB/s | sdílená mezi jádry |
| DRAM | 16-512 GB | 150-300 cyklů | 30-100 GB/s | mimo CPU |
| NVMe SSD | TB | 50-100 μs | 5-15 GB/s | mimo CPU |

Skok DRAM → SSD je další *propast* (1000×). Aplikace s nedostatkem RAM se *swapuje* na disk → katastrofa pro výkon.

## Princip lokality

Hierarchie funguje jen díky *lokalitě referencí* — předpokladu, že přístupy k paměti *nejsou náhodné*.

### Časová lokalita (temporal)

Stejná adresa se použije *vícekrát blízko v čase*. Příklady: instrukce v loopu, sdílená proměnná, akumulátor.

⇒ **Drž v L1 i po prvním čtení** (write-back, LRU eviction).

### Prostorová lokalita (spatial)

Adresy *blízko sebe* se použijí blízko v čase. Příklady: pole, struktura, instrukce za sebou.

⇒ **Pracuj s cache lines** (64 B na x86, 128 B na M1). Když chceš jeden byte, načti 64 B najednou. Při příštím přístupu na adresu o 4 dál — *hit*.

| Pojem | Reálná opora |
| :--- | :--- |
| Časová lokalita | smyčka iteruje, akumulátor `sum += a[i]` |
| Prostorová lokalita | sekvenční scan `a[i], a[i+1], a[i+2]...` |
| **Není lokalita** | hash table, random access do velkého pole, indirect addressing |

## Cache line a hit/miss

Cache hierarchie pracuje na úrovni **bloků** (cache lines):

- x86, ARM, RISC-V — **64 B** (Intel od Pentium 4, AMD, ARM Cortex).
- Apple M1, M2 — **128 B** (nezvykle větší).

CPU vždy přenese **celou line**, i když chceš 1 byte. To zní jako plýtvání — ale díky *prostorové lokalitě* další přístupy *trefí* tu samou line.

**Hit** — adresa nalezena v cache. Vrátí data po latenci L1/L2/L3.

**Miss** — adresa nenalezena. CPU musí jít *o úroveň níž* (L2, L3, DRAM), což trvá řádově déle. Mezitím OoO drží instrukci v RS/ROB.

## Cache jako čtyři otázky

Návrh cache odpovídá na čtyři otázky (Hennessy-Patterson):

1. **Block placement** — kam se může blok dostat? (Direct-mapped, set-associative, fully-associative — viz [[cache-mapovani]]).
2. **Block identification** — jak najít, zda je tam? (Tag + index + offset).
3. **Block replacement** — co vyhodit při miss? (LRU, FIFO, random — viz [[cache-politiky]]).
4. **Write strategy** — co dělat při write? (Write-through, write-back; write-allocate, no-write-allocate — viz [[cache-politiky]]).

## Virtuální paměť

CPU pracuje s **virtuálními adresami** (VA), DRAM s **fyzickými** (PA). Mezi nimi je *překlad* skrz **page table** (~12 b offset + ~9-10 b page index na úroveň, *vícestupňová* page table).

VA = VPN (virtual page number) + offset
PA = PPN (physical page number) + offset (offset stejný v obou)

Velikost stránky: typicky **4 kB** (12-bit offset). Také **2 MB** (huge page) a **1 GB** (gigantic page) pro velké aplikace (DB, ML).

### TLB

Plný walk page table = ~4 přístupy do paměti = 1000+ cyklů. Nepoužitelné.

**Translation Lookaside Buffer (TLB)** = malá cache *překladů*. Drží 32-512 nedávných (VPN → PPN). 

- **TLB hit** → překlad za 1 cyklus.
- **TLB miss** → page table walk (HW na x86/ARM, SW na MIPS). ~10-30 cyklů typicky.

::: svg "VA → PA překlad přes TLB"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="40" width="100" height="30" rx="3"/>
    <rect x="20" y="80" width="60" height="22" rx="3"/>
    <rect x="80" y="80" width="40" height="22" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70" y="58" font-weight="600">VA</text>
    <text x="50" y="95" font-size="9">VPN (36 b)</text>
    <text x="100" y="95" font-size="9">off (12 b)</text>
  </g>
  <g fill="var(--accent)" opacity="0.2" stroke="var(--accent)">
    <rect x="180" y="40" width="120" height="80" rx="4"/>
  </g>
  <text x="240" y="60" text-anchor="middle" font-weight="600" fill="var(--text)">TLB</text>
  <g fill="var(--text-muted)" font-size="9">
    <text x="240" y="78" text-anchor="middle">VPN → PPN</text>
    <text x="240" y="92" text-anchor="middle">32-512 položek</text>
    <text x="240" y="108" text-anchor="middle">hit: 1 cyklus</text>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="360" y="40" width="100" height="30" rx="3"/>
    <rect x="360" y="80" width="60" height="22" rx="3"/>
    <rect x="420" y="80" width="40" height="22" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="410" y="58" font-weight="600">PA</text>
    <text x="390" y="95" font-size="9">PPN (28 b)</text>
    <text x="440" y="95" font-size="9">off (12 b)</text>
  </g>
  <g stroke="var(--accent)" fill="none" stroke-width="1.4">
    <path d="M120,55 L180,55" marker-end="url(#mem-arrow)"/>
    <path d="M300,55 L360,55" marker-end="url(#mem-arrow)"/>
  </g>
  <text x="270" y="150" text-anchor="middle" font-size="9" fill="var(--text-faint)">offset (12 b) se nepřekládá — jde přímo do PA</text>
  <defs>
    <marker id="mem-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

### V/V vs V/P vs P/P cache

L1 cache může používat různé schéma adresace:

- **P/P** (fyzický index, fyzický tag) — *po překladu*. Latence vyšší (TLB + cache).
- **V/V** (virtuální index, virtuální tag) — *před překladem*. Rychlé, ale homonyma (různé procesy stejný VA → různé PA).
- **V/P** (virtuální index, fyzický tag) — *paralelně*. Virtuální index přístup do cache *zatímco* TLB překládá VPN. Tag check pak srovnává PA.
- P/V — *nepoužívá se*, žádná výhoda.

Moderní x86, ARM L1 jsou **V/P** — kompromis mezi rychlostí (V index) a správností (P tag řeší alias).

V/P cache je omezená velikost (index = max page size). Pro 4 kB pages a 64-byte line: index max 64 položek/cesta. Když chceme větší L1 → musíme zvýšit asociativitu nebo page size.

## Page faults

Pokud page table řekne "nikde, ani ne na disk swap" → **page fault**. OS handler:

1. Pokud platná adresa nealokovaná → zero-fill page.
2. Pokud swap → načti z SSD (50 μs!).
3. Pokud neplatná → SIGSEGV → process killed.

Page fault je *katastrofa* pro výkon — milisekundy stagnace. ML systémy ladí Linux tak, aby *nikdy* neswappovaly.

## Co dál

[[cache-mapovani]] popisuje, *jak* cache rozhoduje, kde uložit blok. [[cache-politiky]] řeší politiky vyřazování a zápisu. [[amat-vykon-cache]] dává výpočtové vzorce.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §2.1-2.3 + Appendix B; Patterson, D.A., Hennessy, J.L.: „Computer Organization and Design: RISC-V Edition" (Morgan Kaufmann 2017), §5; Bryant, R.E., O'Hallaron, D.R.: „Computer Systems: A Programmer's Perspective" (3rd ed., Pearson 2016), §6.*
