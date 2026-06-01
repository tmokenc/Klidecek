---
title: Řetězené zpracování — fáze IF/ID/EX/MA/WB
---

# Pipelining — fáze klasické linky 5 stupňů

Klasická 5-stupňová pipeline DLX/MIPS rozdělí provedení instrukce na *fáze*, které se *prolnou* mezi sousedními instrukcemi. Cílem je dosáhnout CPI → 1, aniž by takt klesl k době jediné instrukce.

## Sub-skalární CPU jako výchozí stav

Před pipeliningem byl sub-skalární CPU "μ-programovaný": každá instrukce trvala *několik taktů*, různě pro různé typy. Příklad:

| Instrukce | Doba | CPI příspěvek |
| :--- | :---: | :---: |
| `add r1, r2, r3` | 7 taktů | 7 |
| `lw r4, 0(r1)` | 5 taktů | 5 |
| `bne r1, r2, lbl` | 10 taktů | 10 |

3 instrukce, 22 taktů, **CPI = 7,33**. Sub-skalární jednotka *čeká* na dokončení instrukce, než pustí další. Plýtvá tranzistory.

## Klasická pipeline 5 stupňů

Pipelining rozseká provedení na fáze stejné délky a *prolne* je. Klasické fáze MIPS (Hennessy-Patterson):

::: svg "5-stupňová pipeline DLX/MIPS — fáze IF, ID, EX, MA, WB"
<svg viewBox="0 0 540 170" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="30" y="50" width="80" height="50" rx="4"/>
    <rect x="130" y="50" width="80" height="50" rx="4"/>
    <rect x="230" y="50" width="80" height="50" rx="4"/>
    <rect x="330" y="50" width="80" height="50" rx="4"/>
    <rect x="430" y="50" width="80" height="50" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="70" y="73">IF</text>
    <text x="170" y="73">ID</text>
    <text x="270" y="73">EX</text>
    <text x="370" y="73">MA</text>
    <text x="470" y="73">WB</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="70" y="87">Instruction</text>
    <text x="70" y="97">Fetch</text>
    <text x="170" y="87">Instr Decode</text>
    <text x="170" y="97">/ Reg Read</text>
    <text x="270" y="87">Execute</text>
    <text x="270" y="97">(ALU)</text>
    <text x="370" y="87">Mem Access</text>
    <text x="370" y="97">(load/store)</text>
    <text x="470" y="87">Write Back</text>
    <text x="470" y="97">to Reg File</text>
  </g>
  <g stroke="var(--accent)" fill="none" stroke-width="1.4">
    <path d="M110,75 L130,75" marker-end="url(#arrow)"/>
    <path d="M210,75 L230,75" marker-end="url(#arrow)"/>
    <path d="M310,75 L330,75" marker-end="url(#arrow)"/>
    <path d="M410,75 L430,75" marker-end="url(#arrow)"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="120" y="115">IF/ID</text>
    <text x="220" y="115">ID/EX</text>
    <text x="320" y="115">EX/MA</text>
    <text x="420" y="115">MA/WB</text>
  </g>
  <text x="270" y="35" fill="var(--text)" text-anchor="middle" font-weight="600">Oddělovací registry (pipeline registers)</text>
  <text x="270" y="148" fill="var(--text-faint)" text-anchor="middle" font-size="9">každá instrukce projde všemi stupni v daném pořadí</text>
  <defs>
    <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

### IF — Instruction Fetch

Načtení instrukce z I-cache na adrese `PC`. Současně se `PC + 4` zapíše zpět do `PC` (nebo cílová adresa skoku v EX). Výstup: 32-bitové instrukční slovo + nové PC.

### ID — Instruction Decode + Register Read

Dekódování opcode, zdrojů, cíle. *Současně* se *spekulativně* čtou *oba* zdrojové registry z register file. Sign-extend immediate hodnoty. Výstup: dva 32-bitové operandy, dekódované řízení, sign-extended imm.

### EX — Execute (ALU)

Operandy se posílají do ALU. Pro:
- ALU instrukce — sčítání/odčítání/log. operace.
- `lw/sw` — výpočet adresy `base + offset`.
- `beq/bne` — výpočet cílové adresy `PC + sign_ext(imm) << 2` *a* porovnání operandů (často právě v EX, někdy už v ID).

### MA — Memory Access

Jen pro `lw/sw` aktivní:
- `lw` čte z D-cache na adrese spočtené v EX.
- `sw` zapíše operand z register read do D-cache.

Ostatní instrukce stupněm "projedou" beze změny.

### WB — Write Back

Výsledek (z EX nebo z MA) se zapíše do cílového registru v register file.

::: viz pipeline-stage-tracker "Přepni 'zřetězené' / 'sekvenční' a krokuj instrukce 5-stupňovou pipeline. CPI klesá z 5 k 1 jakmile se pipeline plně rozjede."
:::

## Pipeline ve více cyklech

Když se instrukce *prolnou*, každý takt vstupuje *jedna* nová instrukce do IF a *jedna* opouští WB.

```
takt:     1   2   3   4   5   6   7   8
i1:      IF  ID  EX  MA  WB
i2:          IF  ID  EX  MA  WB
i3:              IF  ID  EX  MA  WB
i4:                  IF  ID  EX  MA  WB
```

Ustálený stav: **5 instrukcí současně** v různých fázích. CPI = 1 (jedna instrukce dokončí za takt). Throughput vzrůstá 5× oproti sub-skalárnímu CPU.

## CPI vs IPC

| Metrika | Definice | Skalární CPU ideál |
| :--- | :--- | :---: |
| **CPI** = clocks per instruction | průměrný počet taktů na 1 instrukci | 1,0 |
| **IPC** = instructions per clock | průměrný počet instrukcí za takt | 1,0 |

V superskalárním CPU s `m` cestami je teoretický strop **IPC = m** (např. 4 pro Intel Skylake), v praxi ale 2-3 kvůli závislostem.

Doba běhu programu:

$$
T_{\text{prog}} = \text{IC} \cdot \text{CPI} \cdot T_{\text{takt}}
$$

kde **IC** = počet instrukcí, **T_takt** = perioda hodin. Optimalizace mohou útočit na *kterýkoli* faktor:

- Snížit **IC** — lepší algoritmus, optimalizace kompilátoru.
- Snížit **CPI** — pipelining (→1), superskalár (<1), spekulace.
- Snížit **T_takt** — superpipelining (víc stupňů), lepší proces.

Moderní CPU používají *všechny tři páky současně*.

## Předpoklady pro pipelining

Aby pipeline fungovala, musí platit:

1. **Nepřetržitý přísun instrukcí** — branch prediction ([[bht-2bit]]) zajišťuje, že IF má co fetchovat.
2. **Možnost rozdělit operaci na nezávislé kroky** — fáze nesmí sdílet zdroje (structural hazard).
3. **Přibližně stejně dlouhé fáze** — slabý článek určuje takt.
4. **Žádné závislosti mezi sousedy** — ale to obecně neplatí! Datové ([[datove-konflikty-forwarding]]) a řídicí ([[ridici-konflikty-skoky]]) konflikty kazí ideální průchod.

## Cena pipeliningu

Pipelining není zadarmo:

- **Oddělovací registry** mezi stupni — latence (~1-2 ps) a plocha.
- **Hlubší pipeline → větší pokuta za flush** při špatné predikci skoku. Intel Pentium 4 měl pipeline 31 stupňů → katastrofa.
- **Vyšší příkon** — víc stavových registrů přepíná.

Aktuální x86 jádra (Skylake, Zen) mají ~14-19 stupňů — kompromis mezi taktem a flush penalty.

## Co dál

Pipeline ideálně dosahuje CPI = 1, ale [[datove-konflikty-forwarding]] a [[ridici-konflikty-skoky]] tu hodnotu *snižují*. Forwarding a predikce skoků jsou triky, jak se k ideálu vrátit. Pak [[superpipelining-vykon]] kvantifikuje, *kolik* zrychlení je reálné.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=BSLLDXQTqmM" "Pipeline Architecture" "Computer Science Lessons"
:::

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), Appendix C; Patterson, D.A., Hennessy, J.L.: „Computer Organization and Design: RISC-V Edition" (Morgan Kaufmann 2017), §4; [Berkeley CS61C: Pipelining](https://inst.eecs.berkeley.edu/~cs61c/sp24/).*
