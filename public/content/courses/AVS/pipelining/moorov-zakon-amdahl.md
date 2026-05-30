---
title: Moorův zákon a motivace paralelismu v CPU
---

# Moorův zákon, Amdahl a tři druhy paralelismu

Architektury výpočetních systémů se desítky let snaží proměnit přibývající **tranzistory** v reálný **výkon**. Tato úvodní sekce shrnuje *proč* je to obtížné — limity škálování, Amdahlův zákon vztažený na *jeden* procesor, a tři páky, které moderní mikroarchitektury používají: **ILP**, **TLP**, **DLP**.

## Moorův zákon a jeho omezení

[Gordon Moore](https://newsroom.intel.com/wp-content/uploads/sites/11/2018/05/moores-law-electronics.pdf) (Fairchild Semiconductor, 1965; revidováno na ~dva roky v roce 1975): počet tranzistorů na čipu se zdvojnásobuje *každé dva roky* při zachování stejné ceny. Empirické pravidlo, ne fyzikální zákon — a přesto platí dosud, byť za stále vyšší cenu (EUV litografie, 3D stacking).

Co Moorův zákon **nezaručuje**:

- **Frekvence neporoste navždy.** Dennard scaling (1974) říkal, že se snížením rozměrů tranzistoru klesá i napětí a roste frekvence. Kolem roku 2005 se ale dosáhlo *power wall* — při zachování plochy už nelze zvyšovat frekvenci, aniž by chip nevyhořel. Frekvence stagnuje kolem 3-5 GHz.
- **Sekvenční výkon neporoste.** Jeden takt = jedna instrukce je strop. Bez dalších triků zvládá špičkové jádro ~4-8 instrukcí za takt (IPC), ale to vyžaduje silné OoO a spekulaci.

Moorův zákon tedy *dodává tranzistory*, ale architekt musí najít, *jak je využít*.

::: svg "Tři paralelismy v dnešním procesoru — kde mikroarchitektura nasazuje paralelismus"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="30" width="155" height="140" rx="6"/>
    <rect x="195" y="30" width="155" height="140" rx="6"/>
    <rect x="370" y="30" width="150" height="140" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="97" y="50" font-weight="600">ILP</text>
    <text x="272" y="50" font-weight="600">TLP</text>
    <text x="445" y="50" font-weight="600">DLP</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="97" y="68">Instruction-Level</text>
    <text x="97" y="82">Parallelism</text>
    <text x="97" y="104">pipelining</text>
    <text x="97" y="118">superskalár (OoO)</text>
    <text x="97" y="132">VLIW</text>
    <text x="97" y="148">spekulace, ROB</text>
    <text x="272" y="68">Thread-Level</text>
    <text x="272" y="82">Parallelism</text>
    <text x="272" y="104">multi-core</text>
    <text x="272" y="118">SMT (Hyper-Threading)</text>
    <text x="272" y="132">OpenMP, MPI</text>
    <text x="272" y="148">NUMA systémy</text>
    <text x="445" y="68">Data-Level</text>
    <text x="445" y="82">Parallelism</text>
    <text x="445" y="104">SIMD (SSE, AVX)</text>
    <text x="445" y="118">vektorové CPU</text>
    <text x="445" y="132">SIMT (GPU)</text>
    <text x="445" y="148">tensor cores</text>
  </g>
</svg>
:::

## Tři druhy paralelismu

Mikroarchitektura nasazuje tři páky současně. Každá řeší jiný typ závislostí a hodí se na jinou třídu úloh.

### ILP — Instruction-Level Parallelism

*V jednom vláknu* se najde paralelismus mezi sousedními instrukcemi. Pokud `add r1, r2, r3` a `mul r4, r5, r6` nezávisí na sobě, jádro může obě provádět *současně* nebo se *překrýt* v pipeline.

ILP je úkol pro **hardware** (OoO, scoreboarding, spekulace) nebo **kompilátor** (VLIW, software pipelining). Praktický strop je IPC kolem 4–8 — pak narážíme na *omezení paralelismu* v reálném kódu.

### TLP — Thread-Level Parallelism

Více *nezávislých* vláken na různých jádrech (nebo SMT v rámci jednoho jádra). Programátor explicitně používá `pthread`, `std::thread`, OpenMP, MPI. Hardware poskytuje *jádra* + *koherenci cache* + *atomické instrukce*.

Limit pro TLP je [[paralelizace-uvod]] — Amdahl, komunikace, synchronizace.

### DLP — Data-Level Parallelism

Stejná operace se vykonává nad mnoha *datovými elementy*. Toho dosahujeme dvěma způsoby:

- **SIMD** (Single Instruction Multiple Data) — jediná instrukce má vektorový operand, např. `vaddps` zpracuje 8× `float32`. Hardware: vektorové registry, replikované ALU.
- **SIMT** (Single Instruction Multiple Threads) — GPU model. Stovky vláken provádějí stejnou instrukci na vlastních datech. Hardware schedule v *warpu* (skupina ~32 vláken).

DLP je nejlepší škálování, pokud úloha *vůbec* mapuje. Násobení matic, konvoluce, *post-processing* obrazu jsou ideální. Větvení (`if/else`) DLP rozbíjí.

## Amdahlův zákon na úrovni jednoho jádra

Amdahlův zákon ([[amdahl-gustafson]] pokrývá obecnou paralelizaci) má i mikroarchitektonickou interpretaci. Pokud část kódu *nemůže* využít vektorizaci, dosažitelný speedup na SIMD je limitovaný:

$$
S(\text{vec}) = \frac{1}{(1 - f) + \frac{f}{w}}
$$

kde $f$ je *podíl* doby běhu, který lze vektorizovat, a $w$ je *šířka vektoru* (např. 8 pro AVX2 float). Pokud `f = 0.7` a `w = 8`, dostaneme jen $S \approx 2.5×$ — ne 8×.

Klíčový postřeh: **nestačí vektorizovat hot loop**, je třeba vektorizovat *dostatečný podíl* celkového času. Profiler je nejdůležitější kamarád.

| Páka | Kdo to řídí | Typický speedup |
| :--- | :--- | :---: |
| ILP (pipeline + OoO) | hardware | 4–6× nad sub-skalárním CPU |
| DLP (AVX-512) | programátor + kompilátor | 4–16× nad skalárním kódem |
| TLP (více jader) | programátor | $\le$ # jader (Amdahl) |
| GPU (DLP+TLP) | programátor | 10–50× nad CPU pro vhodné úlohy |

## Cesta od skalární CPU dál

Tento první týden řeší **základní řetězené (pipelined) zpracování** — nejjednodušší formu ILP. Následující týdny zpřesní postupně:

- Pipelining ([[pipelining-faze]]) přináší ideální CPI → 1, ale data ([[datove-konflikty-forwarding]]) a control ([[ridici-konflikty-skoky]]) konflikty to kazí.
- **Superskalár a OoO** ([[ilp-superskalar]]) snaží se dostat IPC nad 1.
- **Cache** ([[pamet-hierarchie]]) řeší paměťovou stěnu.
- **SIMD** ([[dlp-vs-ilp-tlp]]) přidává DLP.
- **SMT a OpenMP** ([[tlp-uvod]], [[openmp-uvod]]) dodávají TLP.

Cílem celé AVS je *intuice*, jak se dnešní paralelní HW chová — abyste rozuměli, *proč* je váš kód pomalý, a věděli, kterou páku zatáhnout.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Moore, G.E.: „Cramming more components onto integrated circuits" (Electronics 38(8), 1965); Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §1; Amdahl, G.M.: „Validity of the single processor approach…" (AFIPS 1967, [DOI 10.1145/1465482.1465560](https://doi.org/10.1145/1465482.1465560)); Hill, M.D., Marty, M.R.: „Amdahl's Law in the Multicore Era" (IEEE Computer 41(7), 2008).*
