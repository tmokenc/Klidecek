---
title: Statická predikce skoků
---

# Statická predikce skoků

Pipelining a OoO ([[ridici-konflikty-skoky]]) potřebují vědět *dopředu*, kam povede skok, aby fetch nestagnoval. **Statická predikce** se rozhoduje *podle vlastností instrukce* (opcode, znaménko offsetu), bez znalosti runtime historie. Funguje jako *záchranná síť*, když dynamická tabulka (BHT, viz [[bht-2bit]]) ještě nemá data.

## Co je třeba predikovat

Při fetch skoku CPU potřebuje dvě věci:

1. **Direction** (jen pro podmíněné skoky) — taken or not-taken?
2. **Target** (pro všechny skoky) — kam to vede?

| Typ skoku | Direction | Target |
| :--- | :---: | :--- |
| Nepodmíněný `j target` | vždy taken | známé z opcode (PC + imm) |
| Podmíněný `bne r1, r2, lbl` | predikovat | známé z opcode |
| Indirect `jr r1` | vždy taken | nutno odhadnout |
| Return `ret` | vždy taken | RAS — return address stack |

Statická predikce má dvě klasické strategie pro direction, ale **target je *vždy* statický** pro PC-relativní skoky — spočítatelný v ID fáze.

## Predikuj NOT TAKEN

Nejlevnější strategie: vždy fetch následující instrukci. Když skok není taken, žádná pokuta. Když je → flush 1-2 takty.

Statisticky: ~50/50 podmíněných skoků reálně taken. ⇒ ~50 % accuracy.

Funguje *nejlépe* pro `if/else` (forward branches typicky cca 50/50). *Špatně* pro smyčky (backward branch ~90 % taken).

## Predikuj TAKEN

Vždy fetch *cílovou adresu*. Pro PC-relativní skoky to znamená spočítat target v ID a fetch z něj.

Pokuta:

- Fetch sekvenční instrukci (1 cyklus) — pak v ID se zjistí target a fetch se přesměruje.
- 1 cyklus stall garantovaný.

Lepší pro smyčky, ale i tak ~50 % overall accuracy.

## Backward Taken, Forward Not-Taken (BTFNT)

Klíčový postřeh: *směr* offsetu signalizuje *typ* skoku.

- **Backward** (target < PC) — typicky **smyčka**. ~85-90 % taken.
- **Forward** (target > PC) — typicky **if/else** nebo `break/continue`. ~50/50.

BTFNT pravidlo:

- Backward → predikuj **TAKEN**.
- Forward → predikuj **NOT TAKEN**.

Empirická accuracy: ~70-75 % na SPECCPU benchmarks. *Velký skok* z 50 % naivní strategie. Klasické CPU (DEC Alpha, MIPS R10000) BTFNT používaly jako fallback.

## Static hint v ISA

Některé ISA nechají *programátora* nebo *kompilátor* nastavit hint:

- **PowerPC** — branch instruction má `BO` field s "branch hint" bity. Lze říct "y" or "n" pro každý branch.
- **Intel x86** (Pentium 4 era) — prefix `2Eh` (CS segment override) = static hint "not taken", `3Eh` (DS override) = "taken". Použité kompilátorem na podle profilu.
- **Sparc V9** — bit v branch instruction.
- **RISC-V** — *žádný* hint; vše dynamic.

Static hint funguje pro *predictable* kód (DSP, embedded). U *unpredictable* (interpret loopu, packet routing) lepší dynamic.

Moderní x86 hint bity *ignorují* (dyn. prediktor lepší). RISC-V se jejich přidání záměrně vyhnul.

## Profile-Guided Optimization (PGO)

Kompilátor zná pravděpodobnost branches z **profilu** — předchozí běh s instrumentací:

```bash
gcc -fprofile-generate -o prog prog.c     # 1. instrumented build
./prog                                     # 2. run, collect data
gcc -fprofile-use -o prog prog.c          # 3. rebuild with data
```

PGO umožní:

1. **Reorder basic blocks** — *hot* path před *cold*, předpokládaný hint NOT-TAKEN správně.
2. **Inlining** decision based on call frequency.
3. **Loop unrolling** podle iteration count.
4. **Static hint** vloží do ISA, kde je podporován.

PGO typicky 10-15 % speedup na C++ programs. Velké projekty (Chrome, Firefox, Linux kernel) PGO standardně používají.

## Cílová adresa: PC-relative vs indirect

### PC-relative

`j target_label` — target = PC + sign_ext(imm). *Spočítáno* v ID fázi z opcode. *Žádný* static guess pro target je třeba — máme jednoznačnou hodnotu.

### Indirect

`jr r1` — target = obsah registru `r1`. Nelze odvodit v ID. Vyžaduje:

- **Branch Target Buffer (BTB)** — cache poslední cílové adresy pro každé PC. Indirect skok lookup PC → posledně viděný target. ~95 % accuracy pro typický kód.
- **Return-Address Stack (RAS)** — pro `call/ret` sekvence. Při `call` push next PC, při `ret` pop. ~99 % accuracy.

Pokud BTB miss → static fallback = sekvenční instrukce → flush, pokud skok byl taken.

## Static prediction v early CPU

| CPU | Strategie |
| :--- | :--- |
| Intel 80486 (1989) | predict not-taken |
| DEC Alpha 21064 (1992) | BTFNT |
| MIPS R4000 (1991) | predict not-taken + delay slot |
| Intel Pentium (1993) | první dynamic BHT (2-bit) |
| Intel Pentium Pro (1995) | 4-bit history, BTB |

Po Pentium éře (1995+) **dynamic prediction je standard**. Static slouží *jen jako fallback*, když BTB/BHT miss.

## Branch instruction frequency

Reálná data (SPECCPU 2017 integer):

- 15-20 % všech instrukcí jsou branches.
- Z toho 75 % podmíněné, 20 % return, 5 % indirect.

⇒ Každá 5.-6. instrukce je branch. **Branch prediction je nejdůležitější optimalizace** v moderním CPU.

## Co dál

[[bht-2bit]] zavádí dynamic predictor (BHT s 2-bit saturated counter) — klasická Pentium-era logika. [[pokrocile-prediktory]] popisuje gshare, perceptron a TAGE — state-of-the-art s 95-99 % accuracy. [[prefetching]] pak rozšíří princip na *data* (prefetch dřív, než instrukce požaduje).

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §3.3 + §3.9; Smith, J.E.: „A Study of Branch Prediction Strategies" (ISCA 1981, [DOI 10.5555/800052.801871](https://doi.org/10.5555/800052.801871)); Ball, T., Larus, J.R.: „Branch Prediction for Free" (PLDI 1993, [DOI 10.1145/155090.155119](https://doi.org/10.1145/155090.155119)); [GCC Profile-Guided Optimization](https://gcc.gnu.org/onlinedocs/gcc/Instrumentation-Options.html).*
