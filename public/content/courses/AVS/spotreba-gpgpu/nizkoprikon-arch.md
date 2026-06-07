---
title: VLIW, RISC-V, ARM big.LITTLE
---

# Nízkopříkonové architektury — VLIW, RISC-V, ARM big.LITTLE

Mimořádně vykonávaný (out-of-order, OoO) superskalár x86 ([[ilp-superskalar]]) je energeticky náročný — spotřebuje 50–100 W na jeden čip. Pro mobilní zařízení, vestavěné (embedded) systémy a IoT je to nepřijatelné. Alternativní architektury proto hardware buď *zjednodušují* (VLIW), *modularizují* (RISC-V), nebo *zheterogenňují*, tedy kombinují různé typy jader (big.LITTLE).

## VLIW — Very Long Instruction Word

Princip: *překladač (compiler)* sestaví *paket (bundle)* instrukcí a *všechny* běží paralelně v jediném cyklu. Žádné mimořádné vykonávání (OoO), žádné dynamické plánování (dynamic scheduling) za běhu.

```
VLIW instruction (256 bits = 4 × 64-bit slots):
| slot 0    | slot 1     | slot 2    | slot 3   |
| add r1,r2 | mul r3,r4  | load r5   | store r6 |
```

Procesor jednoduše vykoná všechny čtyři operace paralelně. Hardware je triviální — žádný scoreboard, žádné rezervační stanice.

**Za co je odpovědný překladač**:

- Detekce paralelismu (statický paralelismus na úrovni instrukcí, ILP).
- Plánování (scheduling) — musí zajistit, aby v rámci paketu nevznikla závislost typu RAW (čtení po zápisu).
- Zarovnání (padding) — pokud nenajde čtyři nezávislé instrukce, doplní slot instrukcí NOP.

### Výhody

- **Jednoduchý hardware** — žádná logika pro mimořádné vykonávání. Nižší spotřeba.
- **Předvídatelný výkon** — žádné kolísání za běhu (runtime).
- **Překladač vidí celý program** — může optimalizovat lépe než hardware za běhu, který má jen omezený výhled.

### Nevýhody

- **Překladač musí být vynikající** — pokud najde málo paralelismu, klesne IPC (počet instrukcí na cyklus) pod m.
- **Bobtnání kódu (code bloat)** — instrukce NOP zaplňují sloty paketu.
- **Neflexibilní ISA** — změna počtu funkčních jednotek znamená změnu instrukční sady (ISA).
- **Žádné přizpůsobení za běhu** — výpadek cache (cache miss) rozbije celé naplánování.

### Příklady

- **Itanium (Intel + HP, 2001)** — velký komerční propadák. Překladač nedokázal předvídat výpadky cache.
- **TI C6x DSP** — úspěšný ve zpracování signálu (předvídatelný, bez cache).
- **NVIDIA Tegra DSP**, Qualcomm Hexagon — DSP jádra v mobilních čipech.
- **Transmeta Crusoe** — překlad x86 do VLIW, nízkopříkonový x86 (2000).

Neúspěch Itania pohřbil VLIW jako mainstreamovou architekturu. V DSP a akcelerátorech se ale používá dál.

## RISC-V — otevřená ISA

RISC-V (Berkeley, 2010) je open-source instrukční sada (ISA). Je modulární: skládá se ze základu plus rozšíření.

Základní ISA (RV32I): zhruba 47 instrukcí. Naprosté minimum. (RV64I ji rozšiřuje o *W* instrukce nad slovy a o LD/LWU/SD.)

Rozšíření:

- **M** — násobení a dělení.
- **A** — atomické operace (LR/SC).
- **F, D** — pohyblivá řádová čárka, jednoduchá a dvojitá přesnost.
- **C** — komprimované instrukce (16bitové RVC).
- **V** — vektorové ([[vektorove-cpu]]).
- **B** — bitové manipulace.

Profil RV64GC (= I+M+A+F+D+C) je mainstreamový čip třídy „Linux RISC-V".

### Výhody

- **Žádné licenční poplatky** — otevřený standard, implementace zdarma.
- **Modularita** — zahrnete jen potřebná rozšíření. Ušetříte plochu čipu i spotřebu.
- **Možnost úprav** — rozšíření na míru dané doméně (umělá inteligence, kryptografie).
- **Ověřitelnost** — jsou možné formální důkazy správnosti.

### Nevýhody

- **Roztříštěný ekosystém** — různé čipy podporují různá rozšíření.
- **Nástroje jsou méně vyzrálé než u x86/ARM** — každým rokem se to ale lepší.
- **Méně optimalizovaná komerční jádra** — zatím.

### Implementace

- **SiFive U7, P670** — výkonná vícejádrová jádra, třída Linuxu.
- **ALI T-Head C910** — serverová třída.
- **Sophon SG2042** — 64jádrový serverový procesor RISC-V (2023).

Energetická efektivita RISC-V je *podobná jako u ARM* — obě jsou čisté RISC instrukční sady.

## ARM ISA

ARM dominuje v mobilních, vestavěných i serverových zařízeních (cloudové servery s Graviton/Ampere).

Klíčové vlastnosti:

- **Více kódování instrukcí** — 16bitový Thumb, 32bitový ARM (A32) a 64bitový ARMv8 (A64). Kódování s proměnnou délkou zajišťuje vyšší hustotu kódu.
- **Podmíněné vykonávání** — každá instrukce může být podmíněná, což šetří skoky (branches).
- **Mocné adresní režimy** — offset u load/store, inkrementace před přístupem i po něm.

### big.LITTLE

Koncept ARM IP (2011): *heterogenní* jádra na *jednom* čipu (SoC).

- **big** (Cortex-A78, X2) — výkonná OoO jádra, ~5 W na jádro ve špičce.
- **LITTLE** (Cortex-A510) — malá jádra vykonávající instrukce v pořadí (in-order), ~0,5 W na jádro.

Plánovač operačního systému:

- *Úlohy na pozadí* → LITTLE.
- *Úlohy citlivé na latenci* (uživatelské rozhraní, spuštění aplikace) → big.

Mobilní čipy (Snapdragon, Mediatek Dimensity): typicky 4 jádra big + 4 jádra LITTLE.

Apple M1: 4 P-jádra + 4 E-jádra (Apple takto označuje princip big.LITTLE).

### Přínos big.LITTLE

Podle měření Applu:

- Výkon malého (LITTLE) jádra: zhruba ⅓ výkonu velkého.
- Spotřeba malého (LITTLE) jádra: zhruba ⅒ spotřeby velkého.

Zátěž na pozadí (oznámení, synchronizace, monitorování) běží na jádrech LITTLE, takže oproti běhu na big ušetří 90 % spotřeby.

Aktivní zátěž (hra, video) zvládnou jádra big. Celý systém přitom zůstává chladný.

⇒ **Výdrž baterie mobilu je 2× lepší** než u návrhu jen s velkými jádry.

## Apple řady M

Apple silicon (M1 → M3, 2020–2023):

- 4–12 P-jader (Firestorm / Avalanche / Everest) + 2–8 E-jader (Icestorm / Blizzard / Sawtooth).
- Sdílená cache poslední úrovně (LLC) — u clusteru P-jader v M1 je to 12 MB.
- Jednotná architektura paměti (CPU, GPU i neurální engine sdílejí jeden fond paměti LPDDR).
- Vestavěný neurální engine, hardwarový enkodér i dekodér videa.

Energetická efektivita: zhruba 3× lepší než u Intel x86 při srovnatelném výkonu. Důvody:

- Výrobní proces TSMC 5 nm (proti 7–10 nm u Intelu).
- big.LITTLE.
- Široký návrh pro jednovláknový výkon — méně potřebných vysokých taktů.
- Vyhrazené čipy (ASIC) pro video a odlehčení strojového učení (ML offload).

Řada M dokázala, že **ARM dokáže nahradit x86** v noteboocích i stolních počítačích, pokud je prioritou energetická efektivita.

## Intel Alder Lake (jádra P + E)

V roce 2021 přijal Intel princip big.LITTLE.

- **P-jádra** (Golden Cove) — OoO, AVX-512, šířka 8.
- **E-jádra** (Gracemont) — menší OoO, šířka 4, bez AVX-512.

Hybridní plánování — hardware Intel Thread Director říká operačnímu systému, kam má které vlákno (thread) zařadit.

Kompromis: AVX-512 je *jen* na P-jádrech. Linuxové plánovače proto musí zabránit tomu, aby se vlákna s AVX-512 dostala na E-jádra → vzniká režie na přesouvání (migration overhead).

## RISC vs. CISC v kontextu

Klasická debata (80. léta): RISC (jednoduché instrukce, rychlý zřetězený běh) proti CISC (složité instrukce, kterých je v kódu méně).

V praxi: x86 je architektura CISC *s* mikroarchitekturou ve stylu RISC (dekóduje CISC → mikrooperace μops → běží na zřetězené lince ve stylu RISC). Všechny moderní x86 jsou uvnitř fakticky RISC.

⇒ Na samotné ISA záleží méně než na implementaci. Energetická efektivita pramení z rozhodnutí o mikroarchitektuře, ne z volby RISC vs. CISC.

## Dark silicon

Esmaeilzadeh a kol., 2011: u výrobního procesu 8 nm lze současně *napájet* jen zhruba 50 % čipu (limit TDP). Zbytek musí zůstat *temný (dark)*, tedy vypnutý.

Důsledky:

- Specializované akcelerátory (ML, kodek, kryptografie) — zapnou se *jen když je potřeba*, jinak jsou vypnuté.
- Heterogenní jádra — vždy je zapnuto jen několik jejich typů.
- *Jádra* mají stále častěji *pevně danou funkci* (nejsou univerzální).

Apple silicon je toho ztělesněním: NPU (neurální engine), GPU, videokodek, obrazový signálový procesor (ISP) — vše specializované.

x86 + AVX-512: jedna část čipu slouží pro AVX-512 a většinou zahálí.

⇒ Dark silicon žene vývoj k architektonické specializaci.

## Paretova hranice

Pro každou architekturu vynesme dvojici (výkon, spotřeba) — Paretova hranice (Pareto frontier) ukazuje nejlepší návrhy.

Znázornění (přibližně):

- **x86 pro stolní počítače** — vysoký výkon, vysoká spotřeba.
- **ARM pro mobily** — střední výkon, nízká spotřeba.
- **RISC-V pro vestavěné systémy** — proměnlivé, přizpůsobitelné.
- **Apple řady M** — vysoký výkon a střední spotřeba (aktuálně nejlepší).
- **GPGPU** — extrémní propustnost, ale omezená na datově paralelní úlohy.

Žádná jediná architektura nedominuje *všem* bodům. Každá obsazuje svou niku.

## Co dál

[[gpu-architektura]] popisuje *jiné* paradigma — GPGPU model SIMT. Je orientované na propustnost (throughput), ne na latenci. Z někdejšího grafického akcelerátoru se stala univerzální výpočetní platforma (ML, HPC). [[cuda-divergence-occupancy]] uzavře praktickou stránku.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §1.5 + §A.4; Asanović, K., Patterson, D.A.: „Instruction Sets Should Be Free: The Case for RISC-V" (UCB/EECS-2014-146); Esmaeilzadeh, H. et al.: „Dark Silicon and the End of Multicore Scaling" (ISCA 2011); [ARM big.LITTLE Whitepaper](https://www.arm.com/why-arm/technologies/big-little).*
