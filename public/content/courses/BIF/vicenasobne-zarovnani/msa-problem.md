---
title: Problém vícenásobného zarovnání
---

# Problém vícenásobného zarovnání

**Vícenásobné zarovnání sekvencí** (Multiple Sequence Alignment, MSA) porovnává **tři a více** biologických sekvencí (DNA, RNA, proteiny) **současně** — na rozdíl od párového zarovnání, kde sekvence porovnáváme jen po dvojicích. Společné (konzervované) sloupce odhalují funkční domény či regulační motivy, naopak odlišné pozice ukazují, čím se organismy liší. MSA je vstupem pro konstrukci fylogenetických stromů, predikci struktury i návrh mutací.

Klíčový problém je dvojí: jak **ohodnotit** kvalitu daného zarovnání a jak **efektivně** najít to nejlepší. Druhá část je obtížná — nalezení optimálního MSA podle součtu párů je **NP-úplný problém**, takže exaktní řešení neškáluje.

## Hodnocení: skóre součtu párů (sum-of-pairs)

Triviální metrika počítá jen sloupce, kde se shodují všechny znaky — funguje špatně, jakmile sekvencí přibývá. V praxi se používá **skóre součtu párů (Sum of Pairs, SP)**: skóre sloupce je součet skóre **všech dvojic** znaků v tomto sloupci. Pro sloupec $j$ se znaky $A_1, \dots, A_n$:

::: math
SP(j) = \sum_{i=1}^{n-1} \sum_{k=i+1}^{n} s(A_i, A_k)
:::

kde $s(A_i, A_k)$ je skóre dvojice ze substituční matice (nebo penalizace za mezeru). Celkové skóre zarovnání je součet přes všechny sloupce. Protože každý sloupec obsahuje $\binom{n}{2} = \tfrac{n(n-1)}{2}$ párů, samotné **ohodnocení** roste kvadraticky s počtem sekvencí $n$.

## Vícerozměrné dynamické programování

Dynamické programování (DP) zaručuje **matematicky optimální** zarovnání a jde zobecnit z dvojice na $k$ sekvencí: místo 2D matice se počítá $k$-rozměrná matice. Problém je v počtu **směrů (přechodů)**, které je nutné v každé vnitřní buňce zvážit. Obecně:

::: math
\text{počet směrů} = 2^k - 1
:::

Pro 2 sekvence (2D) jsou to $2^2 - 1 = 3$ směry (zleva, shora, diagonála), pro 3 sekvence (3D) už $2^3 - 1 = 7$ směrů, a s každou další dimenzí počet roste exponenciálně.

::: svg "2D DP pro dvě sekvence (3 směry, buněk je délka²) vs. 3D DP pro tři sekvence (7 směrů, krychle buněk) — stavový prostor roste exponenciálně s počtem sekvencí."
<svg viewBox="0 0 540 210" font-family="ui-sans-serif, system-ui" font-size="11">
  <rect width="540" height="210" fill="var(--bg-inset)"/>

  <!-- 2D mřížka vlevo -->
  <text x="20" y="22" fill="var(--text)" font-weight="600">2 sekvence — 2D matice</text>
  <g stroke="var(--line)" stroke-width="0.8" fill="var(--bg-card)">
    <rect x="40" y="40" width="34" height="34"/>
    <rect x="74" y="40" width="34" height="34"/>
    <rect x="108" y="40" width="34" height="34"/>
    <rect x="40" y="74" width="34" height="34"/>
    <rect x="74" y="74" width="34" height="34"/>
    <rect x="108" y="74" width="34" height="34"/>
    <rect x="40" y="108" width="34" height="34"/>
    <rect x="74" y="108" width="34" height="34"/>
    <rect x="108" y="108" width="34" height="34"/>
  </g>
  <!-- zvýrazněná buňka a 3 příchozí směry -->
  <rect x="108" y="108" width="34" height="34" fill="color-mix(in oklch, var(--accent) 22%, var(--bg-card))" stroke="var(--accent)" stroke-width="1.5"/>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" marker-end="url(#a2)">
    <line x1="91"  y1="91"  x2="118" y2="118"/>
    <line x1="125" y1="91"  x2="125" y2="116"/>
    <line x1="91"  y1="125" x2="116" y2="125"/>
  </g>
  <text x="40" y="166" fill="var(--text-muted)" font-size="10">3 směry = 2² − 1</text>
  <text x="40" y="182" fill="var(--text-muted)" font-size="10">buněk: n²</text>

  <!-- oddělovač -->
  <line x1="240" y1="34" x2="240" y2="190" stroke="var(--line)" stroke-width="0.6"/>

  <!-- 3D krychle vpravo -->
  <text x="270" y="22" fill="var(--text)" font-weight="600">3 sekvence — 3D matice</text>
  <!-- přední čtverec -->
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)" fill-opacity="0.85">
    <rect x="300" y="80" width="70" height="70"/>
  </g>
  <!-- zadní čtverec (posunutý) -->
  <g stroke="var(--line)" stroke-width="0.9" fill="var(--bg-card)" fill-opacity="0.4">
    <rect x="340" y="50" width="70" height="70"/>
  </g>
  <!-- spojnice hran krychle -->
  <g stroke="var(--line-strong)" stroke-width="0.9">
    <line x1="300" y1="80"  x2="340" y2="50"/>
    <line x1="370" y1="80"  x2="410" y2="50"/>
    <line x1="300" y1="150" x2="340" y2="120"/>
    <line x1="370" y1="150" x2="410" y2="120"/>
  </g>
  <!-- cílová buňka (přední dolní pravý roh) + 7 směrů schematicky -->
  <circle cx="370" cy="150" r="4" fill="var(--accent)"/>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none">
    <line x1="370" y1="150" x2="340" y2="150"/>
    <line x1="370" y1="150" x2="370" y2="120"/>
    <line x1="370" y1="150" x2="340" y2="120"/>
    <line x1="370" y1="150" x2="410" y2="120"/>
    <line x1="370" y1="150" x2="380" y2="110"/>
    <line x1="370" y1="150" x2="345" y2="95"/>
    <line x1="370" y1="150" x2="408" y2="92"/>
  </g>
  <text x="300" y="178" fill="var(--text-muted)" font-size="10">7 směrů = 2³ − 1</text>
  <text x="300" y="194" fill="var(--text-muted)" font-size="10">buněk: n³</text>

  <defs>
    <marker id="a2" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

Časová složitost exaktního DP roste exponenciálně přibližně jako $\mathcal{O}(2^k\, n^k)$, kde $n$ je délka sekvence a $k$ počet sekvencí (přesněji $\mathcal{O}(k^2\, 2^k\, n^k)$ s ohledem na SP skóre v každé buňce). I paměť roste jako $n^k$. Proto je plně optimální přístup v praxi neřešitelný — zvládne nanejvýš několik krátkých sekvencí.

Z tohoto důvodu se reálná data zarovnávají **heuristickými (progresivními)** metodami, které obětují záruku optima za polynomiální čas.

::: quiz "Kolik směrů (přechodů) musí DP zvážit pro jednu vnitřní buňku při zarovnání 4 sekvencí?"
- [ ] 7
  > To je hodnota pro 3 sekvence: 2³ − 1 = 7.
- [x] 15
  > Pro k sekvencí je počet směrů 2^k − 1; pro k = 4 tedy 2⁴ − 1 = 15.
- [ ] 16
  > 2⁴ = 16 je počet rohů hyperkrychle; směr „setrvání" (0,0,0,0) se ale neuvažuje, takže 2⁴ − 1 = 15.
- [ ] 8
  > To by odpovídalo 2·k; počet směrů ale roste exponenciálně (2^k − 1), ne lineárně.
:::

::: link "Wikipedia — Multiple sequence alignment (DP, NP-úplnost, exponenciální stavový prostor)" "https://en.wikipedia.org/wiki/Multiple_sequence_alignment"
:::

::: link "EMBL-EBI Training — What is multiple sequence alignment?" "https://www.ebi.ac.uk/training/online/courses/protein-classification-intro-ebi-resources/what-is-protein-sequence-analysis/multiple-sequence-alignment/"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: Wikipedia „Multiple sequence alignment"; EMBL-EBI Training „Multiple Sequence Alignment"; Wang, L., Jiang, T.: „On the complexity of multiple sequence alignment" (J. Comput. Biol. 1994).*
