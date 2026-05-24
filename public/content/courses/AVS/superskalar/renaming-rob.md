---
title: Register renaming a Re-Order Buffer
---

# Register renaming a Re-Order Buffer (ROB)

Tomasulo (1967) má **implicit renaming** v RS, ale **imprecise exceptions** — když nastane výjimka, register file je v chaotickém stavu. Patt et al. (1985) přidávají **Re-Order Buffer (ROB)**: spekulativní instrukce *nezapisují* do architectural register file, dokud nejsou *commit*-ready. To umožňuje **precise exceptions** a **branch recovery**.

Moderní x86 a ARM jádra používají variantu **ROB-based renaming** s *physical register file* (PRF) — kombinaci Tomasulových RS + ROB + PRF (zavedeno Intel P6 1995, AMD K7 1999).

## Dvě role registrů

Existují *dva* logické typy registrů:

- **Architectural registers (ARF)** — viditelné ISA. RISC-V má 32 (`x0..x31`), x86-64 16 (`rax, rbx, ...`).
- **Physical registers (PRF)** — *interní*, *fyzické úložiště* hodnot. Moderní CPU má 150-400 PRF.

Tabulka **Register Alias Table (RAT)** mapuje ARF → PRF. Při Issue se *přejmenuje* cíl: dostane nový PRF a RAT[arch] := nový PRF.

```
i1: add rax, rbx, rcx    ; rax → P10 (nová), rbx = P4, rcx = P7
i2: add rdx, rax, rdi    ; rax = P10, rdi = P3, rdx → P11
i3: add rax, rsi, rbp    ; rax → P12 (nová!), rsi = P5, rbp = P6
```

Po Issue všech tří: ARF view: `rax → P12`. Ale `P10` *zůstává živý*, protože `i2` ho ještě potřebuje.

⇒ **WAW eliminován** (i1 a i3 píší do *různých* PRF).

⇒ **WAR eliminován** (jakmile i2 přečte P10 do operandu, P10 může být uvolněn nezávisle na ostatních).

## Re-Order Buffer (ROB)

ROB je **kruhový buffer** položek, jedna *za každou* dosud nedokončenou instrukci. Velikost typicky 192-400 (Intel Skylake: 224, Apple M1: 630).

Každá položka obsahuje:

- **PC** — adresa instrukce.
- **Dst arch register** — cílový ARF.
- **PRF id** — nový PRF, který drží spekulativní hodnotu.
- **Status** — *issued*, *executing*, *complete*.
- **Exception** — pokud nastala při execute.
- **Branch target / mispredict** — pro spekulativní recovery.

Položky se *přidávají* při Issue (in-order) a *odebírají* při Commit (in-order). Mezi tím v ROB čeká.

::: svg "ROB-based renaming — moderní OoO architektura"
<svg viewBox="0 0 540 230" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="20" width="100" height="30" rx="3"/>
    <rect x="140" y="20" width="100" height="30" rx="3"/>
    <rect x="260" y="20" width="100" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="70" y="40">Fetch + Decode</text>
    <text x="190" y="40">Rename (RAT)</text>
    <text x="310" y="40">Dispatch</text>
  </g>
  <text x="190" y="13" text-anchor="middle" font-size="9" fill="var(--text-faint)">in-order, front-end</text>
  <g fill="var(--accent)" opacity="0.15" stroke="var(--accent)">
    <rect x="20" y="70" width="220" height="50" rx="4"/>
  </g>
  <text x="130" y="85" text-anchor="middle" font-weight="600" fill="var(--text)">Reservation Stations</text>
  <text x="130" y="100" text-anchor="middle" font-size="9" fill="var(--text-muted)">(operands + tags) → issue když ready</text>
  <g fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1.5">
    <rect x="260" y="70" width="240" height="50" rx="4"/>
  </g>
  <text x="380" y="85" text-anchor="middle" font-weight="600" fill="var(--text)">Re-Order Buffer (ROB)</text>
  <text x="380" y="100" text-anchor="middle" font-size="9" fill="var(--text-muted)">in-order commit → architectural state</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="140" width="80" height="30" rx="3"/>
    <rect x="110" y="140" width="80" height="30" rx="3"/>
    <rect x="200" y="140" width="80" height="30" rx="3"/>
    <rect x="290" y="140" width="80" height="30" rx="3"/>
    <rect x="380" y="140" width="120" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="60" y="159">ALU 0</text>
    <text x="150" y="159">ALU 1</text>
    <text x="240" y="159">FPU</text>
    <text x="330" y="159">L/S</text>
    <text x="440" y="159">Branch</text>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="185" width="500" height="30" rx="3"/>
  </g>
  <text x="270" y="204" text-anchor="middle" font-weight="600" fill="var(--text)">Physical Register File (PRF) — 150-400 registers</text>
</svg>
:::

## 4 fáze instrukce s ROB

| Fáze | Co se děje |
| :--- | :--- |
| **Issue** | rename (alok. PRF), alokace ROB položky, do RS |
| **Execute** | RS čeká, pak FJ |
| **Writeback** | hodnota do PRF, ROB.status = complete |
| **Commit** | v pořadí: ARF ← PRF; ROB položka uvolněna |

Klíč: **Writeback ≠ Commit**. Writeback je spekulativní (může se *zrušit*), Commit je *finální*.

## Spekulace a recovery

Předpokládejme branch po několika instrukcích:

```
i1: add r1, r2, r3       (vydáno)
i2: bne r1, r4, target   (vydáno, predikce: NOT TAKEN)
i3: load r5, 0(r6)       (spekulativně vydáno za predikcí)
i4: mul r7, r5, r8       (spekulativně vydáno)
```

Pokud `i2` Execute vrátí *taken* (predikce selhala):

1. **Flush ROB** za i2 (zrušit i3, i4, ...).
2. **Roll back RAT** na stav před i3, i4 — přejmenování se *vrátí* (každý PRF byl alokován s "back-pointerem" na předchozí PRF stejného ARF).
3. **Uvolnit PRF** alokované pro zrušené instrukce.
4. **Restartovat fetch** na cílové adrese.

Pokuta: ~10-20 taktů (hloubka pipeline + rollback). Recovery z ROB je rychlá, protože nikdy nedošlo k *commit* spekulativních instrukcí.

::: viz rob-precise-exceptions "Zaškrtni 'mispredict i1' nebo 'page fault i2'. Sleduj ROB jak alokuje, čeká na commit, a squashne za událostí. Architectural state = jen retired."
:::

## Precise exceptions

Pokud `i3` při Execute vyhodí výjimku (např. divide-by-zero):

1. ROB.status[i3] = *exception*.
2. Instrukce v ROB *před* i3 (i1, i2) commituje normálně.
3. Když i3 dosáhne *head of ROB*, *teprve* se výjimka *předkládá* — celý stav ARF v tu chvíli je *konzistentní* (i1, i2 dokončené, nic za i3 ne).

⇒ Handler vidí stav, **jako kdyby** instrukce běžely sekvenčně do i3 — *precise exception*. Kontext lze uložit, handler spustit, pak restartovat z i3.

Bez ROB by stav byl *imprecise* (některé pozdější instrukce by mohly už zapsat do ARF), handler by nevěděl, co je co.

## RAT — Register Alias Table

Tabulka *2 sloupce, n řádků* (n = počet ARF):

| ARF | PRF current |
| :--- | :--- |
| `x0` | P0 |
| `x1` | P12 |
| `x2` | P7 |
| `x3` | P34 |

Při rename:

```
add x1, x2, x3
```

1. Najdi volný PRF (free list). Řekněme P55.
2. RS dostane: `Pdst = P55`, `Psrc1 = P7` (x2), `Psrc2 = P34` (x3).
3. RAT[x1] := P55.
4. ROB položka pamatuje: *předchozí* PRF pro x1 byl P12 (pro recovery).

Free list je *circular* — uvolněné PRF (po commit) jdou zpět. Pokud free list dochází, *front-end stagnuje*.

## Velikost ROB a issue width

| CPU | Issue width | ROB | RS | PRF int / fp |
| :--- | :---: | :---: | :---: | :---: |
| Intel Pentium III (1999) | 3 | 40 | 20 | 40/40 |
| Intel Skylake (2015) | 4 | 224 | 97 | 180/168 |
| Apple M1 Firestorm (2020) | 8 | 630 | 354 | 354/384 |
| AMD Zen 4 (2022) | 6 | 320 | 110 | 224/192 |

Trend: **velký ROB, široký issue, hodně PRF**. M1 je extrém — 8-issue + 630 ROB je vyšší než Intel/AMD.

Velký ROB *kryje memory latency*. Při L3 miss (~150 takta) potřebuje ROB ~600 položek, aby *udržel front-end vytížený*, dokud DRAM odpovídá. Proto M1 a Apple chipy chytře dělají low-power velké okno.

## Co dál

ROB + renaming řeší WAW/WAR + precise exceptions. Branch speculation a *jak se vrátit po misprediction* podrobně řeší [[spekulace-vyjimky]]. Pak Topic 3 přechází k *paměti* — odkud OoO dostává operandy ([[pamet-hierarchie]], [[cache-mapovani]]).

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Patt, Y.N., Hwu, W.W., Shebanow, M.: „HPS, a New Microarchitecture: Rationale and Introduction" (MICRO 1985, [DOI 10.1145/18927.18935](https://doi.org/10.1145/18927.18935)); Smith, J.E., Pleszkun, A.R.: „Implementation of Precise Interrupts in Pipelined Processors" (ISCA 1985); Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §3.6; [Real World Tech: Apple M1 Firestorm](https://www.realworldtech.com/m1-firestorm/).*
