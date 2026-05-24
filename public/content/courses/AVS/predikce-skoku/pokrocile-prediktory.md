---
title: Korelační prediktory, gshare, perceptron, TAGE
---

# Pokročilé branch prediktory — gshare, perceptron, TAGE

2-bit counter ([[bht-2bit]]) dosáhne ~90 % accuracy. Aby moderní hluboké pipeline fungovaly, je třeba ~97-99 %. Klíčový postřeh: **branches jsou korelované**. Predikce jednoho ovlivňuje predikci druhého — *toho* dynamic predictors exploit.

## Korelační branches

Příklad:

```c
if (a == 0) { ... }    // b1
if (b == 0) { ... }    // b2
if (a == 0 && b == 0) { ... }  // b3 — korelovaný!
```

`b3` vždy taken if (b1 not taken AND b2 not taken). Knowledge *of b1, b2* helps predict b3.

2-bit counter b3 nevidí b1, b2 — predikuje *jen* podle vlastní historie. Ignoruje korelaci.

## Two-level adaptive (Yeh-Patt 1991)

Idea: **shift register s historií posledních n branches** (taken/not-taken bits) říká *kontext*. BHT je teď indexovaná **PC ⊕ history**.

```
history register = 0011010  (posledních 7 branches: NNTTNTN)
PC                = 0xDEAD
index = (PC XOR history) % BHT_size
counter = BHT[index]
predict by counter MSB
```

Update po výsledku skoku:

1. Shift history register: `history = (history << 1) | actual_outcome`.
2. Update counter at *old* index.

⇒ **Stejný PC** může mít *různé* prediction podle aktuální historie. To explicitly modeluje korelaci.

### Global vs local history

- **Global history (gshare, Yeh-Patt 1991)** — jeden shift register pro *všechny* branches. Vidí *globální* korelaci.
- **Local history (Bimode, McFarling 1993)** — *per-PC* shift register. Vidí *patterny* konkrétního branchu (např. "tato smyčka má cyklicky 9× T, 1× N").
- **Tournament (Alpha 21264)** — *kombinuje* global + local. Meta-predictor rozhoduje, který lepší pro daný PC.

Alpha 21264 (1998) byl první tournament — accuracy ~95 %.

## gshare (McFarling 1993)

Jednoduchá ale efektivní: XOR PC s global history → index do BHT s 2-bit countery.

```
gh = global history shift register, n bits
pc_low = PC LSBs
index = pc_low XOR gh
counter = BHT[index]
```

Velikost BHT typicky $2^{12}$ až $2^{14}$ entries (4-16 kB).

Accuracy ~96 % na SPECCPU.

Limity: aliasing — různé (PC, history) pairs hash na stejný index. Zhoršuje při zvyšování BHT velikosti pomalu.

::: viz gshare-correlated-branches "Vyber pattern (perfect correlation / opposite / unrelated). Při korelovaných větvích gshare výrazně překoná bimodal, GHR register se posouvá s každým výsledkem."
:::

## Neural Branch Prediction (Jiménez-Lin 2001)

**Perceptron** = jednoduchá neural network, jeden neuron per entry. Vstup: bits global history. Output: weighted sum.

```
y = w0 + sum(w_i * h_i)    ; h_i ∈ {-1, +1}
predict = (y >= 0) ? TAKEN : NOT_TAKEN
```

Update:

```
if (predict wrong or |y| <= threshold):
    for each i:
        w_i += outcome * h_i    ; outcome ∈ {-1, +1}
```

Perceptron učí *lineárně oddělitelné* korelace. Pro typický kód účinné: AMD Bobcat (2010), Bulldozer (2011), Ryzen (2017+) používají perceptron-based.

Accuracy ~97 %.

Limit: perceptron *nezvládne* XOR-like patterns. Vyšší modely (Piecewise-Linear, FNN) ano, ale složitější HW.

## TAGE (Seznec 2006)

**TAGE = TAgged GEometric history length** — state-of-the-art prediktor.

Použije *více* tabulek s *různě dlouhými* historiemi: $T_0$ (no history), $T_1$ (5 bits), $T_2$ (10), $T_3$ (20), $T_4$ (50), ... geometrická řada.

Pro každý lookup:

1. Lookup *všechny* tabulky paralelně. Každá tabulka má tagged entries (tag = hash of (PC, history)).
2. Najdi entry s *nejdelší* historií, která tag-matches.
3. Tato entry dává prediction.
4. Při miss/correct, update entry (a fallback table).

::: svg "TAGE — multiple history lengths, longest match wins"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="20" width="100" height="35" rx="3"/>
  </g>
  <text x="70" y="38" text-anchor="middle" fill="var(--text)" font-weight="600">PC + global hist</text>
  <text x="70" y="50" text-anchor="middle" fill="var(--text-muted)" font-size="9">(unlimited length)</text>
  <g fill="var(--accent)" opacity="0.1" stroke="var(--accent)">
    <rect x="160" y="20" width="80" height="35" rx="3"/>
  </g>
  <text x="200" y="38" text-anchor="middle" fill="var(--text)" font-weight="600">T0 (bimodal)</text>
  <text x="200" y="50" text-anchor="middle" fill="var(--text-muted)" font-size="9">0 bits hist</text>
  <g fill="var(--accent)" opacity="0.15" stroke="var(--accent)">
    <rect x="160" y="70" width="80" height="35" rx="3"/>
  </g>
  <text x="200" y="88" text-anchor="middle" fill="var(--text)" font-weight="600">T1</text>
  <text x="200" y="100" text-anchor="middle" fill="var(--text-muted)" font-size="9">5 bits hist</text>
  <g fill="var(--accent)" opacity="0.2" stroke="var(--accent)">
    <rect x="160" y="120" width="80" height="35" rx="3"/>
  </g>
  <text x="200" y="138" text-anchor="middle" fill="var(--text)" font-weight="600">T2</text>
  <text x="200" y="150" text-anchor="middle" fill="var(--text-muted)" font-size="9">15 bits hist</text>
  <g fill="var(--accent)" opacity="0.3" stroke="var(--accent)">
    <rect x="160" y="170" width="80" height="35" rx="3"/>
  </g>
  <text x="200" y="188" text-anchor="middle" fill="var(--text)" font-weight="600">T3</text>
  <text x="200" y="200" text-anchor="middle" fill="var(--text-muted)" font-size="9">50 bits hist</text>
  <g fill="var(--bg-card)" stroke="var(--accent-line)" stroke-width="1.5">
    <rect x="290" y="100" width="120" height="35" rx="3"/>
  </g>
  <text x="350" y="118" text-anchor="middle" fill="var(--text)" font-weight="600">Longest match</text>
  <text x="350" y="130" text-anchor="middle" fill="var(--text-muted)" font-size="9">wins (Tag check)</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="440" y="100" width="80" height="35" rx="3"/>
  </g>
  <text x="480" y="120" text-anchor="middle" fill="var(--text)" font-weight="600">Predict</text>
  <g stroke="var(--text-faint)" fill="none" stroke-dasharray="2 2">
    <path d="M120,38 L160,38"/>
    <path d="M120,38 L160,88"/>
    <path d="M120,38 L160,138"/>
    <path d="M120,38 L160,188"/>
    <path d="M240,38 L290,118"/>
    <path d="M240,88 L290,118"/>
    <path d="M240,138 L290,118"/>
    <path d="M240,188 L290,118"/>
    <path d="M410,118 L440,118"/>
  </g>
</svg>
:::

Účinné, protože **každá branch má jinou "optimum" history length**:

- Některé branches lze předvídat z 0 bits (statistika — predominantly T).
- Některé potřebují 5 bits.
- Některé až 50+ (deep correlations).

TAGE accuracy ~98-99 % na SPECCPU. Intel Sandy Bridge+ a AMD Zen 2+ používají TAGE-derivative.

## Branch prediction championship

CBP (Championship Branch Prediction) — soutěž v ISCA conference. State-of-the-art TAGE-SC-L (TAGE + Statistical Corrector + Loop predictor) dosahuje:

- ~3-5 mispredict per 1000 instrukcí na SPECCPU integer.
- ~0.3-0.5 % miss rate.

V hluboké pipeline (20 stupňů) = pokuta CPI ~0.06 — *zanedbatelné* proti L1 miss dopadu.

## Loop predictor

Smyčky mají *konstantní* iteration count. Detect: branch s *N×* TAKEN sequence, pak NOT-TAKEN. **Loop predictor** drží counter; po N taken predict NOT-TAKEN.

Intel Pentium 4 první (2000). Apple M1, AMD Zen současné mají loop predictor *vedle* TAGE.

Accuracy 99 %+ pro detekované smyčky.

## Indirect branch prediction

`jr r1`, virtual calls — target je registr. BTB pamatuje *poslední* target. Pokud target *kolísá* (polymorphism), BTB miss → mispredict.

**Indirect Target Predictor (ITTAGE)** — TAGE-like, ale predikuje *target*, ne direction. Drží *historii* posledních targets pro daný PC + global history.

Apple M1 a Intel Tiger Lake mají specialized ITTAGE.

## Pokuta misprediction

Pro Intel Skylake (14-stupňová pipeline): **15-20 cyklů** pokuta per mispredict. Pro Apple M1 (10-stupňová): **9 cyklů**.

CPI příspěvek:

$$
\Delta \text{CPI} = \text{BranchFreq} \cdot \text{MispredRate} \cdot \text{Penalty}
$$

Pro: BranchFreq = 0.2, MispredRate = 0.03, Penalty = 15:

$$
\Delta \text{CPI} = 0{,}2 \cdot 0{,}03 \cdot 15 = 0{,}09
$$

⇒ Pouze ~9 % dopad. S MispredRate 1 % místo 3 %: 3 % dopad.

To je proč CPU vendoři tlačí accuracy do 99 %.

## Spectre a branch prediction

Branch predictor je *spolehlivý*, ale *spekulativní side-effects* ho dělají *attack vector* (viz [[spekulace-vyjimky]]):

- **Spectre v1** — train predictor of victim branch.
- **Spectre v2** — train BTB pro indirect jump, redirect to gadget.

Mitigace: **IBPB** (flush BTB at context switch), **IBRS** (restricted speculation), retpoline. Perf cost 5-15 %.

Po Spectre některé CPU mají *less aggressive* indirect prediction (smaller BTB, partitioning) jako bezpečnostní opatření.

## Co dál

[[prefetching]] aplikuje stejný princip na **data**: HW odhadne, *která adresa* bude potřeba, a načte ji dřív, než instrukce požádá. Pak Topic 5 přejde k **SIMD** ([[dlp-vs-ilp-tlp]]).

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Yeh, T.-Y., Patt, Y.N.: „Two-Level Adaptive Training Branch Prediction" (MICRO 1991); McFarling, S.: „Combining Branch Predictors" (DEC WRL TN-36, 1993); Jiménez, D.A., Lin, C.: „Dynamic Branch Prediction with Perceptrons" (HPCA 2001, [DOI 10.1109/HPCA.2001.903263](https://doi.org/10.1109/HPCA.2001.903263)); Seznec, A., Michaud, P.: „A Case for (Partially) TAgged GEometric History Length Branch Prediction" (Journal of ILP 8, 2006).*
