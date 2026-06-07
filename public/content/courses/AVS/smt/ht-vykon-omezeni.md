---
title: Výkon a omezení Hyper-Threadingu
---

# Kdy HT pomáhá a kdy škodí — kvantitativní analýza

Hyper-Threading není zadarmo. Empiricky platí:

- **+30-40 %** propustnosti (throughput) pro smíšené a serverové zátěže (web, databáze).
- **-10 až +20 %** pro výpočetně vázané (compute-bound) HPC úlohy (násobení matic, FFT).
- **Občas -5-15 %** výkonu jednoho vlákna (single-thread) kvůli soupeření o vyrovnávací paměť (cache contention).

Tato sekce kvantifikuje *proč*.

## Dva zdroje zrychlení

SMT vyniká, když:

1. **Jedno vlákno (thread) často stagnuje** (výpadek cache, chybná predikce skoku, řetězec závislostí). Druhé vlákno vyplní vzniklé mezery.
2. **ALU jsou nevyužité** (typický procesor s přeuspořádáním instrukcí (OoO) má při běhu jednoho vlákna využití ALU pod 50 %).

Druhý důvod bývá podceňovaný. Reálné měření: procesor Intel Skylake dosahuje na SPEC integer kolem 2,5 IPC z teoretických 6. ALU tedy pracují jen asi 40 % cyklů. HT může vyplnit chybějících 60 %.

## Dva zdroje zpomalení

SMT trpí, když:

1. **Soupeření o cache (cache contention)** — dvě vlákna si navzájem vytlačují (eviktují) svá data.
2. **Soupeření o výpočetní jednotky (functional unit contention)** — u výpočetně vázaných úloh chtějí obě vlákna *stejnou* jednotku (FU).
3. **Soupeření o pipeline (pipeline contention)** — natahování instrukcí (fetch), rozdělování (dispatch) a rezervační stanice (RS) si konkurují.
4. **Znečištění prediktoru skoků (branch predictor pollution)** — vlákno A trénuje tabulku BHT na svém vzoru, který vlákno B *narušuje*.

## Důkaz č. 1: Dvě vlákna v HT počítají déle

Typický srovnávací příklad:

```
Scenario 1: Dva singly-threaded jobs na 1 core × HT.
Scenario 2: Stejné dva jobs na 2 cores, no HT.

Scenario 2 wins by ~20-30 % (lepší cache use, no FU contention).
```

⇒ HT *nikdy* nedosáhne dvojnásobku výkonu jednoho vlákna. Jde o tvrdý strop.

## Důkaz č. 2: Tlak na cache

Klasické měření: pracovní množina (working set) jen těsně pod velikostí L1.

Jedno vlákno: pracovní množina ~30 kB se vejde do 32 kB cache L1 → 99% úspěšnost přístupů (hit rate) do L1.

Dvě vlákna (HT): 30 + 30 = 60 kB > 32 kB. Vlákna si navzájem vytlačují data → úspěšnost přístupů do L1 klesá na **50-70 %**. Průměrná doba přístupu do paměti (AMAT) vystřelí nahoru.

Celková propustnost: 1,4× oproti jednomu vláknu (mírné vylepšení), ale na jedno vlákno: 0,7×.

Pro úlohy na hranici velikosti cache je HT *neefektivní*.

## Důkaz č. 3: Soupeření o výpočetní jednotky

Násobení matic má dominantní nárok na propustnost jednotky FMA. Jedno vlákno plně využívá pipeline FMA → ~1,0 operace FMA za cyklus.

Dvě vlákna (HT) bojují o stejnou jednotku FMA → každé jen ~0,55 FMA za cyklus. Celková propustnost je 1,1 (zisk 10 %) oproti ideálním 2,0.

Pokud vlákno B *není* vázané na FMA (hodně skoků, výpadků cache), HT funguje lépe — vlákno A využívá FMA, vlákno B do toho nezasahuje. To je ideální případ (sweet spot).

## Čítače výkonu (performance counters)

Pro diagnostiku:

```bash
perf stat -e cpu_clk_unhalted.thread,uops_executed.thread,\
            l1d.replacement,br_misp_retired.all_branches,\
            cycle_activity.stalls_total ...
```

Klíčové metriky:

- **uops_executed.thread / cpu_clk_unhalted.thread** = IPC na jedno vlákno.
- **l1d.replacement** = počet vytlačení z L1. HT je zvyšuje.
- **cycle_activity.stalls_total** = míra stagnace.

Pokud po zapnutí HT vychází IPC každého vlákna na 60-70 % jednovláknové hodnoty → HT je výhra. Pokud IPC každého vlákna vychází na 40-50 % → HT je výhra *jen okrajově* (součet je stále větší než u jednoho vlákna, ale na jedno vlákno výkon trpí).

Pokud po zapnutí HT je l1d.replacement výrazně vyšší než u jednoho vlákna → dochází k zahlcení cache (cache thrashing).

## Rozhodovací strom: zapnout, nebo vypnout HT

```
1. Single-thread latency critical? (trading, real-time)
   → OFF

2. Cache-sensitive code? (working set ~L1, B-tree, hash table)
   → Test both, often OFF wins.

3. Compute-bound, fully vectorized? (matmul, FFT, AVX-512 heavy)
   → OFF usually wins (FU contention).

4. Mixed workload? (server, browser, IDE)
   → ON definitely.

5. Memory-bound? (graph BFS, sparse matrix)
   → ON (latency hiding).

6. Container/VM tenant isolation important?
   → Consider OFF for security (post-Foreshadow).
```

## Připínání (pinning) a afinita

Pokud nechcete HT vypínat, ale potřebujete *předvídatelný* výkon:

```bash
taskset -c 0,1,2,3 ./hpc_app    # pin to fyzicky 0-3 (sibling threads 4-7 prázdné)
```

Linuxový plánovač (scheduler) nepřiřadí jiná vlákna na *sourozenecká vlákna* (sibling threads) prvních čtyř jader. Fakticky tak používáte HT *jen* pro běžné úlohy.

OpenMP v překladači GCC:

```bash
OMP_PLACES=cores OMP_PROC_BIND=close ./hpc_app
```

`OMP_PLACES=cores` znamená jedno vlákno na fyzické jádro (ignoruje sourozenecká vlákna).

`OMP_PLACES=threads` znamená využít i HT.

## Hyper-Threading a NUMA

Ve víceprocesorových (multi-socket) systémech vzniká kombinace:

- Logické CPU 0-7 na socketu 0, jádra 0-3 (HT).
- Logické CPU 8-15 na socketu 0, jádra 4-7 (HT).
- Logické CPU 16-23 na socketu 1, jádra 0-3 (HT).

Připnutí vlákna na *správné* jádro (lokální vůči NUMA) je klíčové. HT je jen mírná modifikace tohoto plánu.

Podrobnosti v tématu 9 ([[uma-numa]]).

## Alternativa ARM big.LITTLE

Architektura ARM (a Apple) řeší paralelismus na úrovni vláken (TLP) přes **big.LITTLE** — pomocí dvou typů jader, nikoli pomocí SMT:

- **Velká jádra (big cores)** — vysoce výkonná, s přeuspořádáním instrukcí (OoO), energeticky náročná.
- **Malá jádra (LITTLE cores)** — malá, s pořadovým vykonáváním (in-order), energeticky úsporná.

Plánovač operačního systému úlohy rozděluje: úlohy citlivé na latenci běží na velkých jádrech, úlohy na pozadí na malých. Úspory energie jsou *velké* (5-10× lepší poměr výkon/watt) ve scénářích chytrých telefonů a notebooků.

Apple M1: 4 výkonná (P) + 4 úsporná (E) jádra. Intel Alder Lake (2021) tuto myšlenku převzal: jádra P + E. Po dlouhé éře, kdy byla "všechna jádra stejná", máme nyní heterogenní návrh.

big.LITTLE *nemá* uvnitř jádra sdílení ve stylu SMT. Jde o čistší energetický model.

## SMT4, SMT8 — extrémy

IBM POWER9 = **SMT8** (8 vláken na jádro). Velikost ROB ~256 → 32 na vlákno. Sdílení ALU je intenzivní.

Použití: serverové zátěže s extrémní latencí (databáze provádějící indexované dotazy, bankovní transakce). Propustnost na čip je extrémní.

Intel Xeon Phi Knights Landing (2016) = SMT4. Důvod: 1,4 GHz, úzká dvoucestná pipeline s přeuspořádáním instrukcí (odvozená ze Silvermontu) → SMT skryje latenci.

Běžný stolní počítač: SMT2 (HT) je ideální poměr. Vyšší úrovně SMT zhoršují výkon jednoho vlákna bez náležité kompenzace.

## Co dál

Téma 6 zde končí. Téma 7 ([[paralelni-modely]], [[openmp-uvod]]) přechází k *softwaru*: programovacím modelům pro TLP — sdílená paměť, předávání zpráv (message passing), datový paralelismus. OpenMP poskytuje vysokoúrovňové API.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §3.12 + §5.5; Bulpin, J.R., Pratt, I.A.: „Hyper-Threading Aware Process Scheduling Heuristics" (USENIX 2005); Schwartzman, A.: „A Study of HyperThreading Impact on HPC Workloads" (LANL TR LA-UR-15-26516, 2015); Intel® 64 and IA-32 Architectures Optimization Reference Manual.*
