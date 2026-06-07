---
title: DVFS, hradlování hodin a napájení, C-stavy
---

# DVFS a správa napájení

CPU dynamicky upravuje spotřebu (power consumption) v reálném čase. Klíčové techniky:

- **DVFS** — Dynamic Voltage and Frequency Scaling, tedy dynamické škálování napětí a frekvence. Ladí frekvenci $f$ a napětí $V$ podle zátěže.
- **Hradlování hodin (clock gating)** — vypne hodinový signál pro nečinné (idle) bloky. Účinkuje okamžitě, ale neušetří svodový proud (leakage).
- **Hradlování napájení (power gating)** — zcela odpojí napájení od nečinných bloků. Je pomalejší, ale úplně odstraní i svodový proud.
- **C-stavy (C-states)** — úrovně uspání CPU řízené operačním systémem.

## DVFS — škálování frekvence a napětí

Princip: $P \propto V^2 f$. Snížením frekvence lze snížit i napětí, což sníží příkon kubicky.

Hardware má tabulku tzv. pracovních bodů (operating points):

| Stav | Frekvence | Napětí | Příkon |
| :--- | :---: | :---: | :---: |
| P0 (turbo) | 4,5 GHz | 1,35 V | 100 W |
| P1 | 3,5 GHz | 1,1 V | 50 W |
| P2 | 2,5 GHz | 0,9 V | 25 W |
| P3 | 1,5 GHz | 0,7 V | 10 W |
| C1 (nečinné) | 0 | 0,6 V | 3 W |
| C6 (hluboký spánek) | 0 | 0 V | <0,5 W |

Plánovač (scheduler) operačního systému rozhoduje o P-stavu pro každé jádro podle jeho vytížení. Lehká vlákna (threads) dostanou nízký P-stav, náročný výpočet stav P0.

### Doba přepnutí

Přepnutí P-stavu trvá zhruba 10–100 μs. Není tedy okamžité.

⇒ U velmi krátkých úloh (kratších než 100 μs) přijde DVFS pozdě — úloha skončí dříve, než se cílová frekvence vůbec ustaví. Pro dlouho běžící úlohy je DVFS naopak skvělé.

## Intel Turbo Boost

Intel Nehalem (2008): pokud je jedno jádro plně zatížené a ostatní jsou nečinná, lze frekvenci daného jádra zvýšit nad nominální hodnotu.

Mechanismus:

1. Uspání ostatních jader uvolní rezervu příkonu (power headroom).
2. Tato rezerva se přidělí aktivnímu jádru.
3. Zvýšení $f$ a $V$ až na „maximální turbo" (typicky o 1–2 GHz nad základní frekvenci).

Omezení: teplota a limit příkonu pouzdra (package). CPU automaticky frekvenci sníží, pokud je teplota příliš vysoká.

Použití:

- Jednovláknový kód citlivý na latenci (hry, jednovláknové benchmarky).
- Rychlá odezva na nárazovou zátěž (burst) na serveru (náhle příchozí požadavek).

### AMD Precision Boost

Stejný princip u procesorů AMD. AMD ladí svůj algoritmus jemněji — frekvence se liší jádro od jádra podle zátěže. Intel Boost má 2–3 úrovně, AMD je řídí spojitě.

## Hradlování hodin (clock gating)

Když je jednotka ALU nečinná, hodinový signál do jejích registrů se vypne. Tranzistory se nepřepínají, a tudíž neodebírají žádný dynamický příkon.

Implementace: hradlovací buňka (gating cell) před vstupem hodin — hradlo AND s povolovacím signálem (enable).

Granularita:

- **Hrubá (coarse)** — celé jádro (hradlování globálních hodin).
- **Jemná (fine)** — pro jednotlivé funkční jednotky (ALU, FPU, load/store).
- **Velmi jemná (very fine)** — pro jednotlivé stupně pipeline.

Moderní CPU mají tisíce hradel hodin a ušetří 20–30 % dynamického příkonu.

Cena: dodatečná hardwarová režie. Úspora příkonu je ale dramatická.

### Hradlování pipeline

Ve spekulativním procesoru s neuspořádaným vykonáváním (OoO): při chybné predikci skoku (branch misprediction) jsou instrukce za špatně predikovaným skokem zbytečné. Hardware proto pipeline zastaví (hradlováním), dokud se neobnoví správný stav — žádná práce, žádný příkon.

Existuje také **omezování výkonu (throttling)** — pokud je teplota vysoká, hardware záměrně vkládá instrukce NOP nebo hradluje pipeline, čímž sníží příkon.

## Hradlování napájení (power gating)

Kompletně odpojí napájení od neaktivního bloku, takže nevzniká žádný svodový proud.

Implementace: hradlovací spínače v napájecí větvi (header switches, tranzistory PMOS) mezi VDD a napájecí kolejnicí bloku.

Kompromisy:

- **Přínos**: nulový svodový proud, což je významné při dlouhé nečinnosti.
- **Cena**: 
  - Latence probuzení (~1 μs na obnovení napětí).
  - Ztráta stavu (registry se vynulují) → stav je nutné před hradlováním uložit.
  - Přechodové jevy napětí při probuzení (voltage transients).

Granularita je hrubá — typicky na úrovni jádra nebo řezu cache. Hradlování po jednotlivých ALU je příliš jemné (latence by byla příliš vysoká).

Intel „Power gating" od architektury Sandy Bridge dále: nečinná jádra mají napájení 100% odpojené. AMD totéž od Athlonu X4.

## C-stavy (úrovně uspání CPU)

Operační systém řídí úrovně uspání CPU pomocí C-stavů (terminologie Intelu, AMD má obdobné):

| Stav | Frekvence | Napětí | Latence probuzení | Poznámky |
| :--- | :---: | :---: | :---: | :--- |
| C0 | plná | plné | 0 | aktivní |
| C1 (HALT) | 0 | plné | ~1 μs | jen hradlování hodin |
| C1E | 0 | nízké | ~10 μs | + pokles napětí |
| C3 | 0 | nízké | ~50 μs | vyprázdnění L1, L2 |
| C6 | 0 | 0 | ~200 μs | vyprázdnění všeho, hradlování napájení |
| C7 | 0 | 0 | ~500 μs | + hradlování LLC |
| C8–C10 | 0 | 0 | ~1 ms | + hradlování uncore |

Operační systém volí C-stav podle předpokládané doby nečinnosti:

- Velmi krátká nečinnost (1 μs) → C1.
- Střední (10 ms) → C3.
- Dlouhá (100 ms a více) → C6 nebo hlubší.

Latence probuzení je důležitá — pokud OS dobu nečinnosti přecení, CPU usne příliš hluboko, a odezva pak bude pomalá.

Ovladač `cpuidle` v Linuxu toto chování ladí — parametrem `intel_idle.max_cstate=3` lze omezit hloubku uspání pro úlohy citlivé na latenci.

## P-stavy vs. C-stavy

- **P-stavy** — CPU je aktivní, jen běží pomaleji (DVFS).
- **C-stavy** — CPU je nečinné a spí v různých hloubkách.

Při příchodu úlohy:

1. Probuzení z C-stavu (návrat do C0).
2. Náběh P-stavu (zvyšování frekvence ze základní na turbo).

Celková doba odezvy = latence probuzení + doba náběhu frekvence.

U systémů reálného času: udržuj nízký C-stav a vysoký P-stav, dosáhneš tak předvídatelné latence.

::: viz dvfs-pstate-cstate-timeline "Vyber strategii (race-to-idle / run-slow / balanced). Sleduj f, V a P křivky během workloadu — integrál P·dt = energie."
:::

## Tepelné omezování výkonu (thermal throttling)

Pokud teplota překročí limit:

1. **Omezení výkonu (throttle)** — vkládání instrukcí NOP do pipeline (sníží aktivitu).
2. **Snížení frekvence** — DVFS přepne na nižší P-stav.
3. **Snížení napětí**.
4. **Zaparkování jader (park cores)** — některá jádra se vypnou.

Operační systém najednou vidí pomalejší výkon. Propustnost (throughput) zátěže klesá.

Moderní procesory mají funkci tzv. tepelně řízeného boostu (thermal velocity boost) — Intel umožňuje, aby CPU krátce zvýšilo frekvenci i nad teplotu pouzdra $T_{\text{case}}$ (než se vyčerpá tepelná kapacita).

## RAPL — Running Average Power Limit

Intel od architektury Sandy Bridge dále zpřístupňuje čítače příkonu:

```bash
sudo perf stat -e power/energy-pkg/ ./app
```

Změří se přesně, kolik energie pouzdro spotřebovalo. Hodí se to pro:

- Profilování energetické účinnosti.
- Výzkum energeticky uvědomělého plánování (energy-aware scheduling).
- Účtování energie v datovém centru po jednotlivých virtuálních strojích (VM).

AMD má ekvivalent. ARM má čítače *PMU.energy*.

## Race-to-idle vs. run-slow

Dvě krajní strategie:

### Race-to-idle (dorazit do nečinnosti)

Běžet na maximální frekvenci, aby se úloha dokončila co nejdříve, a pak přejít do hlubokého C-stavu.

$$
E = P_{\text{high}} \cdot T_{\text{short}} + P_{\text{idle}} \cdot T_{\text{remaining}}
$$

### Run-slow (běžet pomalu)

Běžet po celou dobu na nižší frekvenci a nikdy nevstoupit do hlubokého spánku.

$$
E = P_{\text{low}} \cdot T_{\text{long}}
$$

Spočítejme, která strategie vyhraje:

Pokud je $P_{\text{idle}}$ mnohem menší než $P_{\text{low}}$ — vyhrává race-to-idle.

Pokud $P_{\text{idle}}$ není výrazně menší (převažuje svodový proud) — vyhrává run-slow.

**U moderních CPU s nízkosvodovou technologií** obvykle vyhrává race-to-idle (Apple M1, mobilní ARM).

**U starších nebo vysokosvodových technologií** může vyhrát run-slow.

## ARM big.LITTLE

Odlišný druh správy napájení — heterogenní jádra:

- **Velká jádra (big)** — rychlá, neuspořádaná (OoO), s vysokým příkonem.
- **Malá jádra (LITTLE)** — malá, uspořádaná (in-order), s nízkým příkonem.

Plánovač operačního systému přesouvá vlákna:

- Lehká práce (procesy na pozadí, spánek) → malá jádra.
- Náročná práce (hra, video) → velká jádra.

Apple M1: 4 výkonná jádra (P-cores, ~5 W každé) + 4 úsporná jádra (E-cores, ~0,5 W každé). Smíšená zátěž využívá obojí.

Intel Alder Lake (2021) přináší totéž na platformu x86: P-jádra a E-jádra.

Detaily v [[nizkoprikon-arch]].

## Energetická uvědomělost datových center

Poskytovatelé cloudu měří energii spotřebovanou jednotlivými úlohami:

- AWS vykazuje spotřebu pro každou instanci EC2.
- Google zveřejňuje hodnotu PUE (Power Usage Effectiveness, účinnost využití energie) pro každé datové centrum.
- Microsoft Azure plánuje s ohledem na uhlíkovou stopu (carbon-aware scheduling) — neurgentní úlohy odkládá na hodiny s nízkou uhlíkovou náročností.

Energeticky uvědomělé plánování se teprve rozvíjí — jde o výběr dvojic úloha–CPU tak, aby se minimalizovala energie. Většinou je to zatím výzkum, někde už i nasazení v praxi (Google Borg).

## Co dál

[[nizkoprikon-arch]] popisuje architektonické volby pro nízký příkon: VLIW (řízené překladačem, jednodušší hardware), RISC-V (rozšiřitelné, vestavěné systémy), ARM big.LITTLE (heterogenní). [[gpu-architektura]] uzavře téma jiným paradigmatem — GPGPU optimalizovaným na propustnost.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §1.5; [Intel® RAPL Specification](https://www.intel.com/content/www/us/en/developer/articles/technical/software-security-guidance/best-practices/running-average-power-limit-energy-reporting.html); [Linux CPU Idle Governor](https://www.kernel.org/doc/html/latest/admin-guide/pm/cpuidle.html); Albers, S.: „Energy-Efficient Algorithms" (Comm. ACM 53(5), 2010).*
