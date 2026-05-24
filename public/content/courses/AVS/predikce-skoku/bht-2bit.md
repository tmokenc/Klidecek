---
title: BHT, 2-bit saturated counter a BTB
---

# BHT, 2-bit saturated counter a BTB — dynamic branch prediction

Statická predikce ([[staticka-predikce]]) dosáhne ~70 %. Pro hluboké pipeline a wide OoO je třeba ~95 %. **Dynamický prediktor** sleduje *historii* a předpovídá podle ní. Klasická základní jednotka: **2-bit saturated counter** v **Branch History Table (BHT)**.

## 1-bit predictor

Nejjednodušší: 1 bit per branch říká "naposledy taken / not-taken". Při skoku:

1. Look up bit, predikuj podle něj.
2. Po vyhodnocení skoku: updatuj bit.

Problém: **smyčka s exit** mění bit dvakrát:

```c
for (i = 0; i < 1000; i++) {
    // ...
}
```

Branch `i < 1000`:
- 999× taken (predict T → správně, T → správně, ...)
- Naposledy: **not-taken** (predict T → špatně, set N)
- Při dalším vstupu do smyčky (např. outer loop): **taken**, ale predictor má N → **špatně**.

⇒ **2 mispredict na exit** smyčky. Pro malou smyčku v outer loopu to bolí.

## 2-bit saturated counter (Smith 1981)

Princip: vyžadovat **2 misses za sebou** než změnit predikci. State machine:

::: svg "2-bit saturated counter — state machine"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5">
    <circle cx="80" cy="100" r="35"/>
    <circle cx="220" cy="100" r="35"/>
    <circle cx="360" cy="100" r="35"/>
    <circle cx="500" cy="100" r="35"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="80" y="98">11</text>
    <text x="220" y="98">10</text>
    <text x="360" y="98">01</text>
    <text x="500" y="98">00</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="80" y="112">Strong T</text>
    <text x="220" y="112">Weak T</text>
    <text x="360" y="112">Weak N</text>
    <text x="500" y="112">Strong N</text>
  </g>
  <g stroke="var(--text)" fill="none" stroke-width="1.2">
    <path d="M110,90 Q170,60 195,80" marker-end="url(#tbt-ar1)"/>
    <path d="M250,80 Q310,60 335,90" marker-end="url(#tbt-ar1)"/>
    <path d="M390,90 Q450,60 475,80" marker-end="url(#tbt-ar1)"/>
    <path d="M195,120 Q170,140 110,110" marker-end="url(#tbt-ar1)"/>
    <path d="M335,110 Q310,140 250,120" marker-end="url(#tbt-ar1)"/>
    <path d="M475,120 Q450,140 390,110" marker-end="url(#tbt-ar1)"/>
  </g>
  <g fill="var(--text)" font-size="9" text-anchor="middle">
    <text x="155" y="60">N</text>
    <text x="295" y="60">N</text>
    <text x="435" y="60">N</text>
    <text x="155" y="148">T</text>
    <text x="295" y="148">T</text>
    <text x="435" y="148">T</text>
  </g>
  <g fill="var(--text-faint)" font-size="9">
    <text x="50" y="160">predict T</text>
    <text x="190" y="160">predict T</text>
    <text x="330" y="160">predict N</text>
    <text x="470" y="160">predict N</text>
  </g>
  <g stroke="var(--text)" fill="none" stroke-width="1.2">
    <path d="M62,135 A20 15 0 0 0 62,75" marker-end="url(#tbt-ar1)"/>
    <path d="M518,75 A20 15 0 0 0 518,135" marker-end="url(#tbt-ar1)"/>
  </g>
  <text x="35" y="105" fill="var(--text)" font-size="9">T</text>
  <text x="540" y="105" fill="var(--text)" font-size="9">N</text>
  <defs>
    <marker id="tbt-ar1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--text)"/>
    </marker>
  </defs>
</svg>
:::

Update pravidla:

- Skok **TAKEN** → counter += 1 (saturate at 11).
- Skok **NOT TAKEN** → counter -= 1 (saturate at 00).

Predict:

- 11, 10 (MSB = 1) → predict TAKEN.
- 01, 00 (MSB = 0) → predict NOT TAKEN.

Pro for-loop:

- 999× taken: counter "11" rapidly → stable predict T.
- Exit (1× not-taken): "11" → "10". Predict zůstává T → 1 mispredict.
- Při dalším vstupu (outer loop): taken → "10" → "11" → predict T → correct.

⇒ **1 mispredict** per loop exit (ne 2). Pro tight outer loop velký rozdíl.

Smith 1981 ukázal, že 2-bit accuracy je ~85-90 % na typickém kódu, vs 1-bit ~75 %.

::: viz branch-2bit-counter "Klikni 'TAKEN' / 'NOT' nebo spusť pattern (smyčka, alternating, ZZ). State machine se pohne; přesnost 2-bit vs 1-bit se aktualizuje live."
:::

## Branch History Table (BHT)

BHT je *tabulka 2-bit counterů*. Index = nějaké PC bity (typicky 10-14 LSB).

```
PC = 0xDEADBEEF
index = (PC >> 2) & 0x3FF  ; 10 bity → 1024 entries
counter = BHT[index]
predict = counter[MSB]
```

| Velikost BHT | Konfliktů |
| :---: | :--- |
| 1024 (2 kB) | hodně, ~10 % aliasing |
| 4096 (8 kB) | ~3 % |
| 16384 (32 kB) | <1 % |

**Aliasing**: dvě různá PC se stejným hash kódem sdílí counter. Při disjoint branch behavior to nemá vliv (konvergují). Při *correlated* branches: může se navzájem rušit.

Moderní CPU mají BHT desítky kB s velmi nízkým aliasingem.

## Branch Target Buffer (BTB)

BHT řeší jen *direction*. Cílovou adresu pro PC-relativní lze spočítat z opcode. Ale pro **indirect jumps** (`jr r1`, `ret`, virtual calls) target není v opcode.

**BTB** je cache (PC → target) — *malá set-associative tabulka* uchovávající:

- PC (key/tag).
- Last seen target address.
- Direction prediction (sometimes co-located with BTB, sometimes BHT separate).

Lookup paralelně s fetch:

```
fetch_pc = current PC
btb_entry = BTB[fetch_pc % BTB_size]
if (btb_entry.tag == fetch_pc) {
    predicted_target = btb_entry.target
    predicted_direction = btb_entry.direction
}
```

Velikost: 256-4096 entries typicky. Apple M1 má 4096.

::: svg "BHT + BTB v B1 stupni fetch"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="80" width="60" height="40" rx="3"/>
  </g>
  <text x="50" y="105" text-anchor="middle" fill="var(--text)" font-weight="600">PC</text>
  <g fill="var(--accent)" opacity="0.15" stroke="var(--accent)">
    <rect x="120" y="40" width="140" height="50" rx="3"/>
    <rect x="120" y="105" width="140" height="50" rx="3"/>
  </g>
  <text x="190" y="60" text-anchor="middle" fill="var(--text)" font-weight="600">BHT</text>
  <text x="190" y="76" text-anchor="middle" fill="var(--text-muted)" font-size="9">2-bit counter table</text>
  <text x="190" y="125" text-anchor="middle" fill="var(--text)" font-weight="600">BTB</text>
  <text x="190" y="141" text-anchor="middle" fill="var(--text-muted)" font-size="9">PC → target cache</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="320" y="80" width="120" height="40" rx="3"/>
  </g>
  <text x="380" y="100" text-anchor="middle" fill="var(--text)" font-weight="600">Next PC mux</text>
  <text x="380" y="113" text-anchor="middle" fill="var(--text-muted)" font-size="9">PC+4 / target</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="465" y="80" width="60" height="40" rx="3"/>
  </g>
  <text x="495" y="105" text-anchor="middle" fill="var(--text)" font-weight="600">I-cache</text>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <path d="M80,100 L120,65" marker-end="url(#br-ar1)"/>
    <path d="M80,100 L120,130" marker-end="url(#br-ar1)"/>
    <path d="M260,65 L320,90" marker-end="url(#br-ar1)"/>
    <path d="M260,130 L320,110" marker-end="url(#br-ar1)"/>
    <path d="M440,100 L465,100" marker-end="url(#br-ar1)"/>
  </g>
  <text x="270" y="178" text-anchor="middle" fill="var(--text-faint)" font-size="9">Paralelně: BHT predict direction, BTB lookup target. Pak mux → next PC → fetch.</text>
  <defs>
    <marker id="br-ar1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Return Address Stack (RAS)

`call / ret` páry mají strukturovaný pattern. **RAS** je malý LIFO stack:

- `call` instruction → push next PC.
- `ret` instruction → pop top of stack, predikuj target.

Velikost 16-32 entries (= max call depth simultaneously without stale).

Accuracy: ~99 % pro normální kód. Selhání:

- **Recursion deeper than RAS** — stack přejede.
- **Tail call** (`jmp` instead of `call`) — RAS by potřeboval *nepushovat*. Modern compilers někdy *vyhýbají* tail call optimization, aby nezhoršili RAS.
- **setjmp/longjmp** — non-local jumps RAS překvapí.

::: viz btb-ras-traversal "Vyber scénář (normální call/ret, hluboká rekurze přes RAS=8, tail-call, longjmp) a krokuj. Sleduj stack push/pop a počet mispredictů."
:::

## Hit-rate moderních CPU

| Workload | Branch direction accuracy |
| :--- | :---: |
| SPECCPU integer | 92-96 % |
| Crypto, DSP | 99 %+ (predictable) |
| Interpreter loop, JIT'd JavaScript | 80-90 % |
| Network packet routing | 70-85 % |
| Database B-tree traversal | 75-85 % |

Pro nejhorší zátěž (interpreter dispatcher) je accuracy *kritická* — Python, V8, JVM mají sofistikované techniky (computed goto, threaded code) *právě proto*, aby zlepšily branch prediction.

## Trénink: cold-start

Při startu programu BHT/BTB *prázdné* → first 1000+ branches řízeny static fallback. Cold-start CPI je vyšší než steady-state.

OS pri context switch: některá CPU *flushují* BTB (kvůli Spectre v2 mitigace), což znamená cold-start *po každém scheduling tick*. Pokuta často 10-20 % v cloud workloads.

## Co dál

2-bit counter je *base*. [[pokrocile-prediktory]] popisuje korelační prediktory (gshare), neural network-based (perceptron), a TAGE — *state-of-the-art* s 97-99 % accuracy. [[prefetching]] rozšíří dynamiku na *data*.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Smith, J.E.: „A Study of Branch Prediction Strategies" (ISCA 1981); Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §3.3; Yeh, T.-Y., Patt, Y.N.: „Two-Level Adaptive Training Branch Prediction" (MICRO 1991, [DOI 10.1145/123465.123475](https://doi.org/10.1145/123465.123475)).*
