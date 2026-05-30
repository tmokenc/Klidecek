---
title: Adversariální prohledávání — minimax a alpha-beta
---

# Adversariální prohledávání — minimax a alpha-beta

**Adversarial search** (adversariální prohledávání, *hraní her*) je prohledávání ve **soutěžním** prostředí, kde *jiný agent* aktivně maximalizuje *svůj užitek*, který je v rozporu s naším.

## Předpoklady kanonického modelu

Standardně se uvažují hry, které jsou:

1. **Dvou hráčů**.
2. **Nulový součet** (zero-sum) — `U_MAX + U_MIN = const`. Můj zisk = soupeřova ztráta.
3. **Tahové** (sequential) — hráči se pravidelně střídají.
4. **Plně pozorovatelné** (perfect information) — oba hráči vidí celý stav.
5. **Deterministické** — žádná náhoda.

Příklady: šachy, Go, dáma, gomoku. *Mimo* tento model: bridge (částečně pozorovatelná), poker (částečně pozorovatelná + stochastická), Settlers of Catan (multiagent + náhoda).

Hráč na tahu se označuje **MAX** (chce maximalizovat užitek). Druhý je **MIN**. Stav má hodnotu `U(s)` z pohledu MAXe; MIN ji vnímá jako `−U(s)` (zero-sum).

## Game tree

Stejně jako prohledávací strom — ale uzly se *střídají*:

* Liché vrstvy: MAX vybírá akci.
* Sudé vrstvy: MIN vybírá akci.
* Listy: koncové stavy s *užitkem* `U(s)`.

::: svg "Game tree: minimax propaguje hodnoty z listů vzhůru — MAX bere max, MIN min."
<svg viewBox="0 0 540 230" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="240" y="20" width="60" height="30" rx="4"/>
    <circle cx="120" cy="100" r="16"/>
    <circle cx="270" cy="100" r="16"/>
    <circle cx="420" cy="100" r="16"/>
    <rect x="40" y="170" width="40" height="30" rx="3"/>
    <rect x="90" y="170" width="40" height="30" rx="3"/>
    <rect x="140" y="170" width="40" height="30" rx="3"/>
    <rect x="190" y="170" width="40" height="30" rx="3"/>
    <rect x="240" y="170" width="40" height="30" rx="3"/>
    <rect x="290" y="170" width="40" height="30" rx="3"/>
    <rect x="340" y="170" width="40" height="30" rx="3"/>
    <rect x="390" y="170" width="40" height="30" rx="3"/>
    <rect x="440" y="170" width="40" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="40" font-weight="600">MAX = 3</text>
    <text x="120" y="105" font-weight="600">3</text>
    <text x="270" y="105" font-weight="600">2</text>
    <text x="420" y="105" font-weight="600">2</text>
    <text x="60" y="190" font-size="10">3</text>
    <text x="110" y="190" font-size="10">12</text>
    <text x="160" y="190" font-size="10">8</text>
    <text x="210" y="190" font-size="10">2</text>
    <text x="260" y="190" font-size="10">4</text>
    <text x="310" y="190" font-size="10">6</text>
    <text x="360" y="190" font-size="10">14</text>
    <text x="410" y="190" font-size="10">5</text>
    <text x="460" y="190" font-size="10">2</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="270" y1="50" x2="120" y2="84"/>
    <line x1="270" y1="50" x2="270" y2="84"/>
    <line x1="270" y1="50" x2="420" y2="84"/>
    <line x1="120" y1="116" x2="60" y2="170"/>
    <line x1="120" y1="116" x2="110" y2="170"/>
    <line x1="120" y1="116" x2="160" y2="170"/>
    <line x1="270" y1="116" x2="210" y2="170"/>
    <line x1="270" y1="116" x2="260" y2="170"/>
    <line x1="270" y1="116" x2="310" y2="170"/>
    <line x1="420" y1="116" x2="360" y2="170"/>
    <line x1="420" y1="116" x2="410" y2="170"/>
    <line x1="420" y1="116" x2="460" y2="170"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="525" y="40">MAX</text>
    <text x="525" y="105">MIN</text>
    <text x="525" y="190">listy</text>
  </g>
</svg>
:::

MIN vybírá z `{3, 12, 8}` = 3. Z `{2, 4, 6}` = 2. Z `{14, 5, 2}` = 2. MAX bere max z `{3, 2, 2}` = 3.

## Minimax algoritmus

```python
def minimax(state, depth, player):
    if game.terminal(state) or depth == 0:
        return evaluate(state)
    if player == MAX:
        v = -∞
        for a in actions(state):
            v = max(v, minimax(result(state, a), depth - 1, MIN))
        return v
    else:  # MIN
        v = +∞
        for a in actions(state):
            v = min(v, minimax(result(state, a), depth - 1, MAX))
        return v
```

* **Časová složitost**: `O(b^d)` — exploruje celý strom.
* **Prostorová složitost**: `O(b · d)` — jen aktuální cesta v zásobníku (DFS).

Hra s `b = 35` (šachy, průměr) a `d = 100` (běžná délka) má `35^100 ≈ 10^154` uzlů. Naprosto neproveditelné — proto následující optimalizace.

## Alpha-beta prořezávání

Klíčové pozorování: pokud víme, že *jedna* odpověď protivníka je dobrá pro něj (špatná pro nás), nemusíme prozkoumávat zbylé možnosti v *jiných* potomcích, které by mohly být *ještě horší* — protihráč na ně stejně nepřejde.

::: svg "Alpha-beta prořezávání: po objevení listu 2 v prostřední větvi víme, že MIN volí ≤ 2, což je horší než MAXovo dosavadní 3 — zbytek lze odříznout (beta ≤ alpha)."
<svg viewBox="0 0 540 230" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="240" y="20" width="60" height="30" rx="4"/>
    <circle cx="140" cy="100" r="16"/>
    <circle cx="280" cy="100" r="16"/>
    <circle cx="420" cy="100" r="16"/>
    <rect x="60" y="170" width="40" height="30" rx="3"/>
    <rect x="110" y="170" width="40" height="30" rx="3"/>
    <rect x="160" y="170" width="40" height="30" rx="3"/>
    <rect x="220" y="170" width="40" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="40" font-weight="600">MAX α=3</text>
    <text x="140" y="105" font-weight="600">3</text>
    <text x="280" y="105" font-weight="600">≤2</text>
    <text x="420" y="105" font-weight="600">?</text>
    <text x="80" y="190" font-size="10">3</text>
    <text x="130" y="190" font-size="10">12</text>
    <text x="180" y="190" font-size="10">8</text>
    <text x="240" y="190" font-size="10">2</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="270" y1="50" x2="140" y2="84"/>
    <line x1="270" y1="50" x2="280" y2="84"/>
    <line x1="270" y1="50" x2="420" y2="84"/>
    <line x1="140" y1="116" x2="80" y2="170"/>
    <line x1="140" y1="116" x2="130" y2="170"/>
    <line x1="140" y1="116" x2="180" y2="170"/>
    <line x1="280" y1="116" x2="240" y2="170"/>
  </g>
  <g stroke="#cf6660" stroke-width="2" stroke-dasharray="6 4" fill="none">
    <line x1="280" y1="116" x2="320" y2="170"/>
    <line x1="280" y1="116" x2="360" y2="170"/>
  </g>
  <g fill="#cf6660" text-anchor="middle">
    <text x="320" y="160" font-size="11" font-weight="600">×</text>
    <text x="360" y="160" font-size="11" font-weight="600">×</text>
  </g>
</svg>
:::

### Algoritmus alpha-beta

```python
def alphabeta(state, depth, α, β, player):
    if game.terminal(state) or depth == 0:
        return evaluate(state)
    if player == MAX:
        v = -∞
        for a in actions(state):
            v = max(v, alphabeta(result(state, a), depth-1, α, β, MIN))
            if v >= β: return v   # beta cutoff — MIN to nevezme
            α = max(α, v)
        return v
    else:  # MIN
        v = +∞
        for a in actions(state):
            v = min(v, alphabeta(result(state, a), depth-1, α, β, MAX))
            if v <= α: return v   # alpha cutoff — MAX to nevezme
            β = min(β, v)
        return v
```

* `α` — nejlepší hodnota nalezená dosud pro MAX (ne klesne).
* `β` — nejlepší hodnota nalezená dosud pro MIN (ne roste).
* Když `α ≥ β` — *prořez*, zbytek zbytečný.

### Časová složitost

* **Nejhorší případ** (špatné pořadí tahů): `O(b^d)` — žádný cutoff.
* **Nejlepší případ** (perfektní pořadí, vždy zkusíme nejlepší tah první): `O(b^(d/2))` — *poloviční hloubka*, exponenciálně rychlejší.
* **Průměrný případ** (rozumné pořadí): `O(b^(3d/4))`.

V šachu: bez α-β prozkoumáme `35^d` uzlů; s α-β `~6^d` (efektivní `b ≈ √35 ≈ 6`). Tedy *při stejné* CPU dosáhneme *2× hloubky*.

::: viz minimax-alphabeta "Game tree s přepínačem minimax / α-β; vidíte oříznuté podstromy + jak pořadí listů ovlivňuje pruning."
:::

## Heuristická evaluation function

Pro hluboké hry (šachy) **neprozkoumáme celý strom**. Použijeme **cutoff** v konečné hloubce a aplikujeme **heuristickou evaluation function** `eval(s)`.

```
def alphabeta(state, depth, α, β, player):
    if game.terminal(state) or cutoff_test(state, depth):
        return eval(state)
    ...
```

### Konstrukce eval

Pro šachy (klasika):

* **Materiální** — součet hodnot figurek (pěšec=1, jezdec/střelec=3, věž=5, dáma=9).
* **Strukturální** — král v bezpečí, kontrola středu, pohyblivost figurek.

::: math
\text{eval}(s) = w_1 \cdot \text{materiál}(s) + w_2 \cdot \text{kontrola středu}(s) + \dots
:::

Lepší `eval` = lepší šachový program. Před érou neuronek byly *eval* funkce ručně laděné. Po roce 2018 ([NNUE](https://en.wikipedia.org/wiki/Efficiently_updatable_neural_network) v Stockfish, AlphaZero) se `eval` *naučí*.

### Cutoff test

* **Konstantní hloubka** — nejjednodušší, ale problém s **horizon effect**.
* **Quiescent search** — aplikuj `eval` jen na *klidné* pozice (žádná nevyřízená výměna). V „napjaté" pozici jdi *hlouběji*.
* **Iterative deepening** — postupné prohlubování, vždy známe alespoň jedno řešení (důležité pro hra na čas).

## Praktické vylepšení

### Move ordering

α-β prořezává *víc*, když probíhá *nejlepší* tah první. **Dynamic move ordering**:

* Naposledy úspěšný tah z minulé iterace (Iterative Deepening).
* Killer moves (tah, který přerušil expanzi v sourozenci).
* History heuristic (často úspěšné tahy v podobných pozicích).

### Transposition table

**Hashová tabulka** uložených hodnot stavů. Šachové pozice se dají dosáhnout *různými permutacemi tahů* — uložené hodnoty drasticky zrychlují.

### Singular extensions

Když najdeme *jasně lepší* tah, zanoříme se *hlouběji*. Zmírňuje horizon effect.

### Forward pruning

V každém kroku uvažujeme jen `k` nejlepších tahů (beam search). **Riskantní** — můžeme oříznout *nejlepší* tah.

### Endgame lookup tables

Pro koncovky (KP vs. K v šachu) je *zpětně* prozkoumán celý strom a uložen v paměti. Stockfish používá *Syzygy tablebases* až do 7 figurek.

### Opening books

Sbírka zahájení (z databáze her grandmistrů) — žádné prohledávání, jen lookup.

## Více hráčů

`n ≥ 3` hráčů — minimax se zobecní na *vektor* užitků `(U_A, U_B, U_C, ...)`. Každý hráč maximalizuje svou složku.

* **Aliance** mohou vzniknout *racionálně* (společný zájem proti třetímu).
* **Iracionální aliance** je problém — co když hráč C *nemyslí strategicky*?

Multi-player není zero-sum (`Σ U` *nemusí být* konstanta) — z toho plynou nuance, které čisté minimax neřeší.

## Limity klasického minimax

* **Hluboké hry** (Go: `b ≈ 250`, `d ≈ 150`) — minimax + α-β nestačí. Řešení: **MCTS + neuronka** ([[mcts-stochastic]], AlphaGo).
* **Stochastické hry** (Backgammon) — minimax → **expectiminimax**.
* **Imperfect information** (poker) — minimax → *counterfactual regret minimization* (CFR), *Libratus*.

::: link "AIMA, kap. 5: Adversarial Search and Games" "http://aima.cs.berkeley.edu/"
:::

::: link "Knuth, D., Moore, R.: An Analysis of Alpha-Beta Pruning (Artificial Intelligence, 1975)" "https://www.sciencedirect.com/science/article/abs/pii/0004370275900192"
:::

::: link "Chess Programming Wiki — kompletní referencе k šachovým algoritmům" "https://www.chessprogramming.org/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Adversarial search* (Šůstek). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 5; Knuth, D. & Moore, R.: *An Analysis of Alpha-Beta Pruning* (AI Journal 6, 1975); Stockfish team: *NNUE — Efficiently Updatable Neural Network* (2018).*
