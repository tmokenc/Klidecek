---
title: ILP a superskalární procesory
---

# Paralelismus na úrovni instrukcí (ILP) a superskalární procesory

Pětistupňová pipeline dosahuje teoreticky **CPI = 1, IPC = 1** (CPI je počet taktů na instrukci, IPC počet instrukcí za takt). Aby IPC stouplo nad 1, musí jádro **vydávat víc instrukcí za takt** — to je princip superskalárního procesoru. Tato sekce nastiňuje, kde se paralelismus na úrovni instrukcí (instruction-level parallelism, ILP) bere, jak ho hardware *najde* a jaký je teoretický i praktický strop.

## Dvě páky pro vyšší IPC

Doba běhu programu:

$$
T_{\text{prog}} = \text{IC} \cdot \text{CPI} \cdot T_{\text{takt}}
$$

**Cesta 1 — zkrátit takt** (superpipelining). Více stupňů znamená kratší takt, ale i vyšší pokuty za hazardy. Praktický limit je přibližně 20 stupňů.

**Cesta 2 — snížit CPI pod 1** (superskalár). m-cestný procesor vydává paralelně **až m** instrukcí za takt:

$$
\text{IPC}_{\max} = m, \quad \text{CPI}_{\min} = \frac{1}{m}
$$

Reálně se dosažený IPC drží **podstatně níž** než $m$ — typicky 2-3, a to i u 6-8-cestného back-endu (výkonné části procesoru, která instrukce vykonává).

| CPU | Šířka vydávání (issue) | Reálné IPC |
| :--- | :---: | :---: |
| Intel Pentium (1993) | 2 | 1,4 |
| Intel Core 2 (2006) | 4 | 1,8 |
| Intel Skylake (2015) | 6 | 2,5 |
| Apple M1 Firestorm (2020) | 8 | 3,2 |
| AMD Zen 4 (2022) | 6 | 2,7 |

Proč ne plné $m$? Brání tomu tři limity: **datové závislosti (data dependencies)**, **tok řízení (control flow)** a **latence paměti (memory latency)**.

## Kde se ILP bere

ILP je *implicitní paralelismus* skrytý v sekvenčním kódu. Sousední instrukce *mohou* běžet paralelně, pokud na sobě **nezávisí**.

Příklad:

```c
a = b + c;   // i1
d = e + f;   // i2 — nezávisí na i1
g = a + d;   // i3 — závisí na i1 i i2
```

Sekvenčně to trvá 3 takty (řetězec závislostí RAW). Paralelně stačí 2 takty (i1 a i2 současně, pak i3). Zrychlení (speedup) je **1,5×**.

Reálný kód obsahuje **ILP průměrně 4-8** instrukcí (Wall 1991, simulace s nekonečným oknem). Realizovat všech 8 paralelně by vyžadovalo nekonečné okno pro vykonávání mimo pořadí (out-of-order, OoO) a 100% predikci skoků. Reálné CPU dosáhne 2-3.

## Vykonávání v pořadí (in-order) vs. mimo pořadí (out-of-order)

### Superskalár v pořadí (in-order)

Okno pro vydávání (issue okno) tvoří **paket sousedních instrukcí**. Pokud první instrukce nemůže být vydána (kvůli závislosti), *zatuhne i druhá* (a třetí, čtvrtá, …).

```
i1: lw r1, 0(r2)        ┐
i2: add r3, r1, r4      │  paket 2 instrukcí
                        ┘
i3: mul r5, r6, r7      ┐
i4: sub r8, r9, r10     │
                        ┘
```

Pokud `i2` čeká na `i1` (situace load-use, tedy použití hodnoty hned po jejím načtení), **čekají i `i3` a `i4`**, přestože by mohly běžet. ⇒ Vykonávání v pořadí tedy ILP plýtvá.

Příklady in-order superskalárů: ARM Cortex-A7, Intel Atom Bonnell. Jsou levné a mají malý příkon, ale jejich IPC je menší než 1,5.

### Superskalár mimo pořadí (out-of-order)

OoO udržuje **velké okno** instrukcí připravených k vydání (rezervační stanice — Reservation Stations, a buffer pro přeuspořádání — reorder buffer, ROB; viz [[tomasulo]], [[renaming-rob]]). *Hardware* v tomto okně hledá instrukce **bez závislostí** a vydává je *mimo pořadí (out-of-order)*.

```
i1: lw r1, 0(r2)        čeká na D-cache miss
i2: add r3, r1, r4      čeká na i1
i3: mul r5, r6, r7      ★ vydáno paralelně s i4
i4: sub r8, r9, r10     ★ vydáno paralelně s i3
```

Instrukce `i3` a `i4` se vydají před `i2`, zatímco `i1` čeká na paměť. ⇒ OoO tak překrývá latence paměti a najde ILP i daleko za první závislostí.

Cena je obrovský hardware (rezervační stanice s 50-100 položkami, ROB s 200-400 položkami, dvojnásobný registrový soubor kvůli přejmenování). OoO je ale dnes **standardem** v každém vysoce výkonném CPU.

## Vydávání: front-end + back-end

::: svg "Superskalární jádro — front-end a back-end"
<svg viewBox="0 0 540 230" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="40" width="100" height="30" rx="3"/>
    <rect x="140" y="40" width="100" height="30" rx="3"/>
    <rect x="260" y="40" width="100" height="30" rx="3"/>
    <rect x="380" y="40" width="100" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="70" y="59">Fetch (IF)</text>
    <text x="190" y="59">Decode</text>
    <text x="310" y="59">Rename</text>
    <text x="430" y="59">Dispatch</text>
  </g>
  <text x="250" y="25" text-anchor="middle" font-weight="600" fill="var(--accent)">Front-end (in-order)</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="100" width="500" height="50" rx="4"/>
  </g>
  <text x="270" y="115" text-anchor="middle" font-weight="600" fill="var(--text)">Reservation Stations + ROB (OoO)</text>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="270" y="135">issue když operandy hotové; result writeback po Common Data Bus</text>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="170" width="80" height="30" rx="3"/>
    <rect x="110" y="170" width="80" height="30" rx="3"/>
    <rect x="200" y="170" width="80" height="30" rx="3"/>
    <rect x="290" y="170" width="80" height="30" rx="3"/>
    <rect x="380" y="170" width="140" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="60" y="190">FX-ALU</text>
    <text x="150" y="190">FX-ALU</text>
    <text x="240" y="190">FP-ALU</text>
    <text x="330" y="190">Load/Store</text>
    <text x="450" y="190">Branch / Retire</text>
  </g>
  <text x="270" y="225" text-anchor="middle" font-weight="600" fill="var(--accent)">Back-end (OoO execute, in-order retire)</text>
</svg>
:::

### Front-end (in-order)

1. **Fetch (načtení)** — z I-cache načte $m$ instrukcí za takt (typicky 4-6). Predikce skoků (branch prediction; [[bht-2bit]]) určuje další PC.
2. **Decode (dekódování)** — rozparsuje instrukce x86/RISC-V na *mikrooperace* (μops). Komplexní instrukce se mohou rozpadnout na 2-4 μops.
3. **Rename (přejmenování)** — přejmenuje architektonické registry na **fyzické registry (physical registers)** ([[renaming-rob]]). Tím odstraní falešné závislosti WAR a WAW.
4. **Dispatch (rozeslání)** — vloží μops do rezervačních stanic a ROB.

### Back-end (OoO)

- **Issue (vydání)** — z rezervačních stanic posílá do funkčních jednotek instrukce, které jsou *připravené* (mají oba operandy hotové).
- **Execute (vykonání)** — funkční jednotky (více ALU, FPU, jednotky load/store, jednotka skoků) provedou μops.
- **Writeback (zápis výsledku)** — výsledky se zapíší zpět do ROB přes sdílenou datovou sběrnici (Common Data Bus).
- **Retire (dokončení)** — když je μop připravena k potvrzení (commit) a nepředchází jí spekulativně načtená, chybně predikovaná μop, zapíše se do architektonického registru/paměti **v původním pořadí**.

Dokončování v pořadí (in-order retire) je klíčové pro **přesné výjimky (precise exceptions)** ([[spekulace-vyjimky]]).

## Limity ILP

### Datové závislosti

Závislosti RAW **nelze obejít** — jde o pravý tok dat. Závislosti WAR a WAW odstraní přejmenování, ale řetězce RAW v kódu jsou *zásadní*. Hledání paralelních instrukcí mezi řetězci RAW je práce pro OoO.

### Chybná predikce skoku (branch misprediction)

Spekulativně načtené μops za skokem se *všechny* zahodí, pokud predikce selže. Při 95% úspěšnosti a hluboké pipeline (~14 stupňů) způsobí přibližně 5 % chyb pokutu přes 10 taktů, což přidá k CPI zhruba 0,5.

### Latence paměti

Zásah do L1 cache (cache hit): 4 takty. L2: 12. L3: 35. DRAM: 200 a více. Při výpadku (miss) se rezervační stanice zaplní čekajícími instrukcemi → IPC propadne. Předběžné načítání (prefetch; [[prefetching]]) a OoO latence **překryjí**, ale nikdy ne úplně.

### Šířka vydávání vs. šířka back-endu

Pokud front-end načte $m$ μops, ale back-end má jen $m/2$ jednotek ALU, IPC je nejvýše $m/2$. Apple M1 má front-end se šířkou vydávání 8 a back-end se 6 ALU a 4 FPU — dlouho šlo o nejširší back-end na trhu.

## Praktický limit ILP

V praktickém kódu (SPECCPU, gcc, perl) je dosažitelné IPC kolem **3-4**, a to i s nekonečným hardwarem. Důvodem je *velikost základního bloku* (kódu mezi skoky), která je v průměru jen 5-7 instrukcí, takže ILP uvnitř bloku je přibližně 2.

Cesta dál tedy musí vést přes:

- **Větší okno** (spekulativní vykonávání přes skoky) — vyžaduje predikci skoků.
- **Vektorizaci** ([[sse-avx]]) — překlopení do paralelismu na úrovni dat (DLP), kde je paralelismus triviální.
- **Vícevláknové zpracování (multi-threading)** ([[hyperthreading]], [[openmp-uvod]]) — překlopení do paralelismu na úrovni vláken (TLP).

Cesta spoléhající jen na ILP narazila na své meze u IBM Power, u architektury VLIW v Intel Itanium (komerčně neúspěšné) i u Pentia 4 (hluboká pipeline). Cesta dál vede přes více jader, SIMD a GPU.

## Co dál

Aby OoO mohlo vydávat instrukce mimo pořadí, musí *sledovat závislosti*. [[scoreboard]] (Thornton 1964) je nejjednodušší schéma — konflikty *blokuje* bez přejmenování. [[tomasulo]] (1967) přidává rezervační stanice a přejmenování pro WAR/WAW. [[renaming-rob]] popisuje moderní podobu těchto myšlenek.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §3.1-3.4 (str. 167-193, 233-247), Appendix C; Wall, D.W.: „Limits of Instruction-Level Parallelism" (ASPLOS 1991, [DOI 10.1145/106972.106991](https://doi.org/10.1145/106972.106991)); Smith, J.E., Sohi, G.S.: „The Microarchitecture of Superscalar Processors" (Proc. IEEE 83(12), 1995).*
