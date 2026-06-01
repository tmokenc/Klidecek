---
title: Spekulace, precize výjimek a Spectre
---

# Spekulativní vykonávání, precise exceptions a side-channels

Superskalární CPU s ROB ([[renaming-rob]]) spekuluje *daleko* za branch. Bez spekulace by IPC propadlo k 1 — typický základní blok má jen 5-7 instrukcí, mezi skoky není dost ILP. Tato sekce řeší: *jak hluboko* CPU spekuluje, *jak* se vrací po misprediction, a *proč* spekulativní side-effects vedou k útokům typu Spectre/Meltdown.

## Spekulace na branch

Kdykoli CPU narazí na podmíněný/nepřímý skok, dvě možnosti:

1. **Stagnace** — čekat na vyhodnocení podmínky → pipeline bublina.
2. **Spekulace** — predikovat (branch predictor, [[bht-2bit]]) a *spekulativně fetchovat* další instrukce.

Moderní CPU vždy spekuluje. Hloubka spekulace = délka ROB (200-600 instrukcí). To znamená 30-50 *nedořešených* skoků současně.

### Co se musí ROB pamatovat

Pro každou instrukci za skokem:

- Jaký byl *stav* RAT *před* tímto skokem (snapshot).
- Cílovou adresu *predikovanou* + cílovou adresu *skutečnou* (pokud už byla spočtená).
- Zda spekulativní writeback proběhl, na který PRF.

Při misprediction:

1. Vyprázdnit ROB *za* mispredicted skokem.
2. Obnovit RAT ze snapshotu.
3. Uvolnit alokované PRF.
4. Restartovat fetch z *správné* cílové adresy.

Pokuta typicky 10-20 taktů (= mispredict penalty).

## Precise exceptions

Výjimka (page fault, divide-by-zero, illegal instruction) může nastat *kdekoli* v back-endu. Bez precision:

```
i1: store ...           (commitnuto)
i2: load r1, 0(r2)      (page fault!)
i3: add r3, r1, r4      (writeback dokončen, ale nelze commit)
i4: store ...           (writeback dokončen)
```

V tu chvíli `i3` má hodnotu *založenou* na neexistujícím loadu. *Stav* CPU je špatný.

ROB to řeší **in-order commit**:

1. `i1` commit OK.
2. `i2` ROB.status = exception. Při dosažení head ROB se *předkládá* OS.
3. `i3, i4` jsou v ROB s writebackem hotovým, ale **nesplnily commit** — *jejich PRF nesmí přepsat ARF*.

Při exception handling:

1. ROB vyprázdnit za i2 (i3, i4 zrušit, PRF uvolnit).
2. ARF = stav po i1 (commitnuto).
3. PC = i2 (s handler routine přesměrováním).

Handler vidí *jako by* CPU dosáhl i2 *sekvenčně*. Po restart i2 (po fix page fault) se znovu spustí — *transparentně*.

⇒ ROB drží *spekulativní* writebacky stranou od ARF. *In-order commit* zajistí, že ARF se mění jen *v pořadí*.

## Speculative side-effects

Spekulace má skrytý problém: *než* dojde k flush, *spekulativní* instrukce *přístupy do cache* a *jiných side-channels* ponechávají *stopu*.

```c
// "Spectre v1" — bounds check bypass
if (x < array1_size) {
    y = array2[array1[x] * 256];
}
```

1. CPU trénuje branch predictor tak, že `x < array1_size` *predikuje TAKEN* (vícekrát zavoláno s validním x).
2. Útočník zavolá s `x` mimo rozsah (např. ukazuje na *secret*).
3. CPU *spekulativně* fetchne `array1[x]` (přečte secret!) a *použije* ho jako index do array2.
4. `array2[secret * 256]` se *načte do L1 cache* — i když ROB pak vyhodí výsledek.
5. Misprediction detected (x ≥ array1_size). ROB flush, secret se "*nikdy nestane*" architektonicky.
6. Ale **L1 cache** drží line na adrese `array2 + secret * 256`. 
7. Útočník měří dobu přístupu k různým indexům array2 — ten, který je rychlý, *prozradí secret*.

⇒ **Spectre v1** — extrahuje libovolný byte z paměti procesu (kernel memory, jiné procesy v sandboxu).

> Spectre a Meltdown jsou z bezpečnostního hlediska **útoky postranním kanálem** (cache-timing). Jejich útočný rozbor — i s videem — patří k postranním kanálům: viz [[casova-analyza|Časová analýza (Timing Attack)]].

### Meltdown — slabší než Spectre

Meltdown je *speciálnější*: využívá, že load z *neautorizované* adresy (kernel page tagged user-mode) **se spekulativně vykoná** *před* permission check. Cache pak prozradí kernel byte.

Meltdown postihl jen některé Intel CPU + ARM Cortex-A75. AMD a Apple M1 byly *immune*, protože permission check byl *před* spekulativním loadem.

## Mitigace

Po publikaci (Jan 2018) přišla rychle:

- **Microcode update** — pro každý vznik mispredicted branch *flush* L1 i BTB. Pomalu, ale účinné.
- **Retpoline** — kompilátor nahradí `call reg` za `call <indirect_thunk>` který *záměrně* dělá špatnou predikci a flush. Vede k jistému 5-10 % slowdown.
- **KPTI (Kernel Page Table Isolation)** — kernel se přepíná v jiné stránce, neviditelné pro user mode. Pokuta 5-30 % na syscall-heavy zátěž (Linux 4.15+).
- **SMEP/SMAP** — supervisor mode access prevention (preventivní opatření, ne fix).
- **HW redesign** — Intel Ice Lake (2019) a novější mají *fix in silicon* pro Meltdown; Spectre v1 zůstává otevřený (compiler-level only).

V cloud prostředí: hypervisor používá *kombinaci* opatření, výkonová ztráta typicky 5-15 %.

## Speculative load forwarding (SLF)

OoO CPU musí řešit *memory ordering*:

```
store r1, 0(r2)         (zpoždění před cache)
load r3, 0(r2)          (může číst starou hodnotu?)
```

Spekulativně: load *předjede* store, pokud adresa není známa. *Pokud* se nakonec ukáže, že adresy se shodují → flush. Pokud ne → win.

To je *memory disambiguation*. AMD/Intel jádra mají sofistikované prediktory pro to, kdy SLF je bezpečné.

V Spectre kontextu: speculative loads přečtou cokoli a nechají stopu. Mitigace = *bariéra* (`LFENCE` na x86, `dsb` na ARM) — fence zruší další spekulaci, dokud předchozí store nedokončí.

## Branch target injection (BTI / Spectre v2)

BTB je *adresovaná PC*. Útočník v *jiném* procesu nebo virtual machine může *vytrénovat* BTB tak, aby cíl skoku v *oběti* (kernel, jiný kontejner) ukazoval na *gadget* — sekvenci instrukcí, které prozradí secret cache-side-channelem.

Mitigace: **IBRS** (Indirect Branch Restricted Speculation) — flush BTB při přechodu user→kernel. **IBPB** (Indirect Branch Predictor Barrier) — flush při context switch. *Velký* perf hit (~10-30 % na specific kernel-heavy workloads).

## Co tohle znamená pro design

Side-channel poslední dekády znamenají: **spekulace = nestrukturální risk**. CPU vendor musí počítat s tím, že každý nový spekulativní mechanismus *vytvoří potenciální leak*.

Apple M1, M2 staví na "*selective hardening*" — kernel kód má speciální barrier instrukce, user kód má jiná pravidla pro speculation. Trade-off: trochu IPC za bezpečnost.

⇒ V *post-Spectre* éře už CPU vendoři nesoutěží jen v IPC, ale i v *security characteristics*. To zformovalo trh.

## Co dál

ROB + spekulace + recovery = back-end OoO CPU dokončen. Topic 3 nasaďí *cache* — paměť, ze které OoO bere data. [[pamet-hierarchie]] zavede pojem, [[cache-mapovani]] strukturu, [[ls-jednotka-mshr]] hraje s OoO L/S.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Smith, J.E., Pleszkun, A.R.: „Implementation of Precise Interrupts in Pipelined Processors" (ISCA 1985); Kocher, P. et al.: „Spectre Attacks: Exploiting Speculative Execution" (S&P 2019, [arXiv:1801.01203](https://arxiv.org/abs/1801.01203)); Lipp, M. et al.: „Meltdown: Reading Kernel Memory from User Space" (USENIX Sec 2018, [arXiv:1801.01207](https://arxiv.org/abs/1801.01207)); Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §3.10.*
