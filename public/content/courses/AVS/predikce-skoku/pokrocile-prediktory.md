---
title: Korelační prediktory, gshare, perceptron, TAGE
---

# Pokročilé prediktory skoků (branch prediktory) — gshare, perceptron, TAGE

Dvoubitový čítač (2-bit counter, [[bht-2bit]]) dosahuje přesnosti zhruba 90 %. Aby ale moderní hluboké pipeline (deep pipeline) fungovaly efektivně, je potřeba přesnost kolem 97-99 %. Klíčové pozorování zní: **skoky (branches) jsou navzájem korelované**. Výsledek jednoho skoku ovlivňuje předpověď jiného — a právě tuto korelaci dynamické prediktory využívají.

## Korelované skoky

Příklad:

```c
if (a == 0) { ... }    // b1
if (b == 0) { ... }    // b2
if (a == 0 && b == 0) { ... }  // b3 — korelovaný!
```

Skok `b3` je vždy proveden (taken), pokud `b1` proveden nebyl (not taken) **a zároveň** `b2` proveden nebyl. Znalost výsledků `b1` a `b2` tedy pomáhá předpovědět `b3`.

Dvoubitový čítač u skoku `b3` ovšem `b1` ani `b2` nevidí — předpovídá *jen* podle vlastní historie. Korelaci s ostatními skoky úplně ignoruje.

## Dvouúrovňový adaptivní prediktor (two-level adaptive, Yeh-Patt 1991)

Základní myšlenka: **posuvný registr (shift register) s historií posledních n skoků** (bity proveden/neproveden) určuje *kontext*. Tabulka skoků (BHT) je nyní indexovaná **hodnotou PC ⊕ historie**.

```
history register = 0011010  (posledních 7 branches: NNTTNTN)
PC                = 0xDEAD
index = (PC XOR history) % BHT_size
counter = BHT[index]
predict by counter MSB
```

Aktualizace po zjištění skutečného výsledku skoku:

1. Posun registru historie: `history = (history << 1) | actual_outcome`.
2. Aktualizace čítače na *původním* indexu.

To znamená, že **stejný PC** může dát *různé* předpovědi podle aktuální historie. Tím se korelace mezi skoky modeluje explicitně.

### Globální vs. lokální historie

- **Globální historie (global history)** — jeden posuvný registr společný pro *všechny* skoky. Zachytí *globální* korelaci (gshare = McFarling 1993, který XORuje PC s registrem globální historie GHR).
- **Lokální historie (local history, Yeh-Patt 1991, PAg/PAp)** — *samostatný* posuvný registr pro každý PC. Zachytí *vzory* konkrétního skoku (např. „tato smyčka má cyklicky 9× provedeno, 1× neprovedeno").
- **Tournament prediktor (Alpha 21264)** — *kombinuje* globální a lokální historii. Meta-prediktor pro každý PC rozhodne, který z přístupů je lepší.

Alpha 21264 (1998) byl prvním tournament prediktorem — dosahoval přesnosti kolem 95 %.

## gshare (McFarling 1993)

Jednoduchý, ale účinný přístup: XOR hodnoty PC s globální historií dá index do tabulky BHT s dvoubitovými čítači.

```
gh = global history shift register, n bits
pc_low = PC LSBs
index = pc_low XOR gh
counter = BHT[index]
```

Velikost tabulky BHT je typicky $2^{12}$ až $2^{14}$ položek (4-16 kB).

Přesnost dosahuje zhruba 96 % na sadě SPECCPU.

Omezení: aliasing — různé dvojice (PC, historie) se zahashují (hash) na stejný index. S rostoucí velikostí BHT se aliasing zmenšuje jen pomalu.

::: viz gshare-correlated-branches "Vyber pattern (perfect correlation / opposite / unrelated). Při korelovaných větvích gshare výrazně překoná bimodal, GHR register se posouvá s každým výsledkem."
:::

## Neuronová predikce skoků (neural branch prediction, Jiménez-Lin 2001)

**Perceptron** je nejjednodušší neuronová síť (neural network) — jeden neuron na každou položku. Vstupem jsou bity globální historie, výstupem je vážený součet.

```
y = w0 + sum(w_i * h_i)    ; h_i ∈ {-1, +1}
predict = (y >= 0) ? TAKEN : NOT_TAKEN
```

Aktualizace:

```
if (predict wrong or |y| <= threshold):
    for each i:
        w_i += outcome * h_i    ; outcome ∈ {-1, +1}
```

Perceptron se naučí *lineárně oddělitelné* korelace. Pro typický kód je to účinné: perceptronovou predikci používají AMD Bobcat (2010), Bulldozer (2011) i Ryzen (2017+).

Přesnost dosahuje zhruba 97 %.

Omezení: perceptron *neumí* vzory typu XOR. Pokročilejší modely (Piecewise-Linear, FNN) to zvládnou, ale za cenu složitějšího hardwaru.

## TAGE (Seznec 2006)

**TAGE = TAgged GEometric history length** — špičkový prediktor současnosti (state-of-the-art).

Používá *více* tabulek s *různě dlouhými* historiemi: $T_0$ (bez historie), $T_1$ (5 bitů), $T_2$ (15), $T_3$ (50), ... délky tvoří geometrickou řadu.

Při každém vyhledání:

1. Prohledá *všechny* tabulky paralelně. Každá tabulka má položky opatřené tagem (tag = hash dvojice (PC, historie)).
2. Najde položku s *nejdelší* historií, jejíž tag se shoduje.
3. Tato položka dává předpověď.
4. Při chybě i správné predikci se položka (a záložní tabulka) aktualizuje.

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

Tento přístup je účinný, protože **každý skok má jinou „optimální" délku historie**:

- Některé skoky lze předvídat z 0 bitů (statisticky — převažuje provedeno).
- Některé potřebují 5 bitů.
- Některé až 50+ bitů (hluboké korelace).

TAGE dosahuje přesnosti zhruba 98-99 % na SPECCPU. Procesory Intel od Sandy Bridge a AMD od Zen 2 používají odvozeniny prediktoru TAGE.

## Soutěž v predikci skoků (branch prediction championship)

CBP (Championship Branch Prediction) je soutěž pořádaná na konferenci ISCA. Špičkový prediktor TAGE-SC-L (TAGE + statistický korektor + prediktor smyček) dosahuje:

- zhruba 3-5 chybných predikcí na 1000 instrukcí na SPECCPU integer,
- chybovosti přibližně 0,3-0,5 %.

V hluboké pipeline (20 stupňů) to odpovídá pokutě CPI kolem 0,06 — *zanedbatelné* ve srovnání s dopadem výpadku z cache L1 (L1 miss).

## Prediktor smyček (loop predictor)

Smyčky mají *konstantní* počet iterací. Detekce: skok s *N×* provedenou posloupností (taken), po níž následuje neprovedení (not-taken). **Prediktor smyček** drží čítač; po N proběhnutích předpoví neprovedení.

První ho měl Intel Pentium 4 (2000). Dnešní Apple M1 i AMD Zen mají prediktor smyček *vedle* TAGE.

Pro detekované smyčky dosahuje přesnosti přes 99 %.

## Predikce nepřímých skoků (indirect branch prediction)

`jr r1` a virtuální volání (virtual calls) — cíl je v registru. BTB si pamatuje *poslední* cíl. Pokud cíl *kolísá* (polymorfismus, polymorphism), nastane výpadek BTB (BTB miss) a tím chybná predikce.

**Prediktor cíle nepřímých skoků (Indirect Target Predictor, ITTAGE)** je obdobou TAGE, ale predikuje *cíl*, nikoli směr skoku. Drží *historii* posledních cílů pro daný PC v kombinaci s globální historií.

Apple M1 a Intel Tiger Lake mají specializovaný ITTAGE.

## Pokuta za chybnou predikci (misprediction)

Pro Intel Skylake (14stupňová pipeline) činí pokuta za chybnou predikci **15-20 cyklů**. Pro Apple M1 (10stupňová) je to **9 cyklů**.

Příspěvek k CPI:

$$
\Delta \text{CPI} = \text{BranchFreq} \cdot \text{MispredRate} \cdot \text{Penalty}
$$

Pro BranchFreq = 0,2, MispredRate = 0,03, Penalty = 15:

$$
\Delta \text{CPI} = 0{,}2 \cdot 0{,}03 \cdot 15 = 0{,}09
$$

To je dopad pouze kolem 9 %. Při chybovosti 1 % místo 3 % klesne na 3 %.

Proto výrobci procesorů tlačí přesnost predikce až k 99 %.

## Spectre a predikce skoků

Prediktor skoků je *spolehlivý*, ale jeho *spekulativní vedlejší efekty* z něj dělají *vektor útoku (attack vector)* (viz [[spekulace-vyjimky]]):

- **Spectre v1** — útočník natrénuje prediktor skoku v oběti.
- **Spectre v2** — útočník natrénuje BTB pro nepřímý skok a přesměruje řízení na svůj gadget.

Obrana: **IBPB** (vyprázdnění BTB při přepnutí kontextu), **IBRS** (omezená spekulace), retpoline. Cena za výkon je 5-15 %.

Po objevení Spectre mají některé procesory *méně agresivní* predikci nepřímých skoků (menší BTB, jeho rozdělení) jako bezpečnostní opatření.

## Co dál

[[prefetching]] aplikuje stejný princip na **data**: hardware odhadne, *která adresa* bude potřeba, a načte ji dřív, než si o ni instrukce řekne. Pak 5. téma přejde k **SIMD** ([[dlp-vs-ilp-tlp]]).

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Yeh, T.-Y., Patt, Y.N.: „Two-Level Adaptive Training Branch Prediction" (MICRO 1991); McFarling, S.: „Combining Branch Predictors" (DEC WRL TN-36, 1993); Jiménez, D.A., Lin, C.: „Dynamic Branch Prediction with Perceptrons" (HPCA 2001, [DOI 10.1109/HPCA.2001.903263](https://doi.org/10.1109/HPCA.2001.903263)); Seznec, A., Michaud, P.: „A Case for (Partially) TAgged GEometric History Length Branch Prediction" (Journal of ILP 8, 2006).*
