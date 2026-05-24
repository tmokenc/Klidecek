---
title: ILP a superskalární procesory
---

# Instruction-Level Parallelism a superskalární CPU

5-stupňová pipeline dosahuje teoretického **CPI = 1, IPC = 1**. Aby IPC stouplo nad 1, musí jádro **vydávat víc instrukcí za takt** — to je princip superskalárního CPU. Tato sekce nastiňuje, kde se ILP bere, jak ho hardware *najde*, a jaký je teoretický a praktický strop.

## Dvě páky pro vyšší IPC

Doba běhu programu:

$$
T_{\text{prog}} = \text{IC} \cdot \text{CPI} \cdot T_{\text{takt}}
$$

**Cesta 1 — snížit takt** (superpipelining). Víc stupňů, kratší takt, ale vyšší pokuty za hazardy. Praktický limit ~20 stupňů.

**Cesta 2 — snížit CPI pod 1** (superskalár). m-cestný procesor vydává paralelně **až m** instrukcí za takt:

$$
\text{IPC}_{\max} = m, \quad \text{CPI}_{\min} = \frac{1}{m}
$$

Reálně se dosažený IPC drží **podstatně níž** než $m$ — typicky 2-3 i u 6-8-cestného back-endu.

| CPU | Šířka issue | Reálné IPC |
| :--- | :---: | :---: |
| Intel Pentium (1993) | 2 | 1,4 |
| Intel Core 2 (2006) | 4 | 1,8 |
| Intel Skylake (2015) | 6 | 2,5 |
| Apple M1 Firestorm (2020) | 8 | 3,2 |
| AMD Zen 4 (2022) | 6 | 2,7 |

Proč ne plné $m$? Tři limity: **data dependencies**, **control flow**, **memory latency**.

## Kde se ILP bere

ILP je *implicitní paralelismus* v sekvenčním kódu. Sousední instrukce *můžou* běžet paralelně, pokud na sobě **nezávisí**.

Příklad:

```c
a = b + c;   // i1
d = e + f;   // i2 — nezávisí na i1
g = a + d;   // i3 — závisí na i1 i i2
```

Sekvenčně 3 takty (RAW chain). Paralelně 2 takty (i1+i2 současně, pak i3). Speedup **1,5×**.

Reálný kód obsahuje **ILP průměrně 4-8** instrukcí (Wall 1991, infinite-window simulation). Realizovat všech 8 paralelně by chtělo nekonečné OoO okno a 100% predikci skoků. Reálné CPU dosáhne 2-3.

## In-order vs out-of-order

### In-order superskalár

Issue okno = **paket sousedních instrukcí**. Pokud první nemůže vydat (závislost), *zatuhne i druhá* (a třetí, čtvrtá, ...).

```
i1: lw r1, 0(r2)        ┐
i2: add r3, r1, r4      │  paket 2 instrukcí
                        ┘
i3: mul r5, r6, r7      ┐
i4: sub r8, r9, r10     │
                        ┘
```

Pokud `i2` čeká na `i1` (load-use), **také `i3` a `i4` čekají**, i když by mohly běžet. ⇒ In-order plýtvá ILP.

Příklady in-order superskalárů: ARM Cortex-A7, Intel Atom Bonnell. Levné, malý power, ale IPC < 1,5.

### Out-of-order superskalár

OoO udržuje **velké okno** (Reservation Stations, ROB — viz [[tomasulo]], [[renaming-rob]]) instrukcí připravených k vydání. *Hardware* hledá v okně instrukce **bez závislostí** a vydává je *out-of-order*.

```
i1: lw r1, 0(r2)        čeká na D-cache miss
i2: add r3, r1, r4      čeká na i1
i3: mul r5, r6, r7      ★ vydáno paralelně s i4
i4: sub r8, r9, r10     ★ vydáno paralelně s i3
```

`i3, i4` se vydají před `i2`, zatímco `i1` čeká na paměť. ⇒ OoO překrývá memory latence a najde ILP daleko za první závislostí.

Cena: enormní hardware (RS 50-100 položek, ROB 200-400 položek, register file dvojnásobný kvůli přejmenování). Ale OoO je dnes **standard** v každém high-performance CPU.

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

1. **Fetch** — z I-cache načte $m$ instrukcí za takt (typicky 4-6). Branch prediction ([[bht-2bit]]) určuje další PC.
2. **Decode** — rozparsuje x86/RISC-V instrukce na *mikrooperace* (μops). Komplexní instrukce mohou expandovat na 2-4 μops.
3. **Rename** — přejmenuje architektonické registry na **physical registers** ([[renaming-rob]]). Odstraní WAR + WAW.
4. **Dispatch** — vloží μops do RS a ROB.

### Back-end (OoO)

- **Issue** — z RS posílá instrukce *připravené* (oba operandy ready) do funkčních jednotek.
- **Execute** — funkční jednotky (multiple ALUs, FPUs, L/S, branch) provedou μops.
- **Writeback** — výsledky se zapíší zpět do ROB přes Common Data Bus.
- **Retire** — když je μop *commit*-ready (a nepředchází jí spekulativně načtená nesprávně predikovaná μop), zapíše se do architektonického registru/paměti **v původním pořadí**.

In-order retire je klíčové pro **precise exceptions** ([[spekulace-vyjimky]]).

## Limity ILP

### Data dependencies

RAW závislosti **nelze obejít** — pravý tok dat. WAR a WAW odstraní přejmenování, ale RAW chains v kódu jsou *fundamentální*. Hledání paralelních instrukcí mezi RAW chains = job for OoO.

### Branch misprediction

Spekulativně načtené μops po skoku se *všechny* vyhodí, pokud predikce selže. S 95% accuracy a hlubokým pipeline ~14 stupňů je ~5 % pokuta nad 10 taktů → CPI příspěvek 0,5.

### Memory latency

L1 cache hit: 4 takty. L2: 12. L3: 35. DRAM: 200+. Při miss kompletní RS se zaplní čekajícími instrukcemi → IPC propadne. Prefetch ([[prefetching]]) a OoO **překryjí** latence, ale nikdy ne plně.

### Issue-width vs back-end-width

Pokud front-end fetchne $m$ μops, ale back-end má jen $m/2$ ALU jednotek, IPC je $\le m/2$. Apple M1 má 8-issue front-end + 6 ALU + 4 FPU — dlouho byl nejširší back-end na trhu.

## Praktický limit ILP

V praktickém kódu (SPECCPU, gcc, perl) je dosažitelný IPC kolem **3-4** i s nekonečným hardwarem. Důvod: *velikost základního bloku* (kód mezi skoky) je v průměru jen 5-7 instrukcí, ILP uvnitř bloku ~2.

Dál cestou musí být:

- **Větší okno** (spekulativní vykonávání přes skoky) — vyžaduje branch prediction.
- **Vektorizace** ([[sse-avx]]) — překlopit do DLP, kde paralelismus je triviální.
- **Multi-threading** ([[hyperthreading]], [[openmp-uvod]]) — překlopit do TLP.

ILP-only cesta narazila u IBM Power, Intel Itanium VLIW (selhalo komerčně), Pentium 4 (hluboká pipeline). Cesta dál vede vícejádry + SIMD + GPU.

## Co dál

Aby OoO vydával instrukce mimo pořadí, musí *sledovat závislosti*. [[scoreboard]] (Thornton 1964) je nejjednodušší schéma — *blokuje* konflikty bez přejmenování. [[tomasulo]] (1967) přidává rezervační stanice + přejmenování pro WAR/WAW. [[renaming-rob]] popisuje moderní podobu těchto myšlenek.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §3.1-3.4 (str. 167-193, 233-247), Appendix C; Wall, D.W.: „Limits of Instruction-Level Parallelism" (ASPLOS 1991, [DOI 10.1145/106972.106991](https://doi.org/10.1145/106972.106991)); Smith, J.E., Sohi, G.S.: „The Microarchitecture of Superscalar Processors" (Proc. IEEE 83(12), 1995).*
