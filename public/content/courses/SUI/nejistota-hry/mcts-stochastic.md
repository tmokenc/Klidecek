---
title: Monte Carlo a stochastické hry
---

# Monte Carlo a stochastické hry

Klasický minimax + alpha-beta ([[adversarial]]) předpokládá *deterministické* hry. Reálné hry však obsahují **náhodu** (kostky, karty, *RNG* prvky). A v *obrovských* hrách (Go) je třeba navíc rezignovat na úplné prohledávání i v deterministickém kontextu — proto **Monte Carlo Tree Search**.

## Stochastické hry — expectiminimax

Hry s *náhodným* prvkem mají kromě MAX a MIN uzlů **chance node** (uzel náhody). Místo `max` / `min` operace agreguje hodnoty *vážený průměr*:

::: math
\text{expectiminimax}(s) = \begin{cases}
\text{eval}(s) & \text{koncový}\\
\max_a \text{expectiminimax}(\text{result}(s, a)) & \text{MAX}\\
\min_a \text{expectiminimax}(\text{result}(s, a)) & \text{MIN}\\
\sum_e P(e) \cdot \text{expectiminimax}(\text{result}(s, e)) & \text{chance}\\
\end{cases}
:::

`P(e)` je pravděpodobnost události `e` (např. `1/6` pro každou stranu kostky).

::: svg "Expectiminimax: chance uzly počítají očekávanou hodnotu z potomků (vážený průměr)."
<svg viewBox="0 0 540 230" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="240" y="20" width="60" height="30" rx="4"/>
    <polygon points="120,80 100,110 140,110" stroke="var(--accent)" fill="var(--bg-card)"/>
    <polygon points="270,80 250,110 290,110" stroke="var(--accent)" fill="var(--bg-card)"/>
    <polygon points="420,80 400,110 440,110" stroke="var(--accent)" fill="var(--bg-card)"/>
    <rect x="60" y="170" width="40" height="30" rx="3"/>
    <rect x="115" y="170" width="40" height="30" rx="3"/>
    <rect x="170" y="170" width="40" height="30" rx="3"/>
    <rect x="225" y="170" width="40" height="30" rx="3"/>
    <rect x="280" y="170" width="40" height="30" rx="3"/>
    <rect x="335" y="170" width="40" height="30" rx="3"/>
    <rect x="390" y="170" width="40" height="30" rx="3"/>
    <rect x="445" y="170" width="40" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="40" font-weight="600">MAX = 8</text>
    <text x="120" y="100" font-size="10" font-weight="600">E=4</text>
    <text x="270" y="100" font-size="10" font-weight="600">E=8</text>
    <text x="420" y="100" font-size="10" font-weight="600">E=3</text>
    <text x="80" y="190" font-size="10">2</text>
    <text x="135" y="190" font-size="10">6</text>
    <text x="190" y="190" font-size="10">4</text>
    <text x="245" y="190" font-size="10">10</text>
    <text x="300" y="190" font-size="10">8</text>
    <text x="355" y="190" font-size="10">6</text>
    <text x="410" y="190" font-size="10">2</text>
    <text x="465" y="190" font-size="10">4</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="270" y1="50" x2="120" y2="80"/>
    <line x1="270" y1="50" x2="270" y2="80"/>
    <line x1="270" y1="50" x2="420" y2="80"/>
    <line x1="120" y1="110" x2="80" y2="170"/>
    <line x1="120" y1="110" x2="135" y2="170"/>
    <line x1="120" y1="110" x2="190" y2="170"/>
    <line x1="270" y1="110" x2="245" y2="170"/>
    <line x1="270" y1="110" x2="300" y2="170"/>
    <line x1="270" y1="110" x2="355" y2="170"/>
    <line x1="420" y1="110" x2="410" y2="170"/>
    <line x1="420" y1="110" x2="465" y2="170"/>
  </g>
  <g fill="var(--text-muted)" font-size="9" text-anchor="middle">
    <text x="525" y="105">chance</text>
    <text x="525" y="190">listy</text>
  </g>
</svg>
:::

::: viz expectiminimax-dice "Hra s chance node (kostka 1..3); vážený průměr potomků; výpočet E[a₁] vs E[a₂] vidíte."
:::

### Důsledky stochastiky

* **Absolutní hodnoty matter** — v deterministickém minimax stačí *relativní pořadí* hodnot, ale po vážených průměrech se s nelineární transformací výsledek mění. **Eval function musí být pozitivní lineární transformací pravděpodobnosti výhry**.
* **Alpha-beta nelze přímo aplikovat** — chance uzel závisí na *všech* potomcích, nelze odříznout (existují vylepšení jako *star-cut pruning*, ale komplikovaná).

## Monte Carlo simulace

Pokud je strom *moc velký* i pro α-β a navíc je *stochastický*, použijme **vzorkování**:

1. Z aktuálního stavu **vzorkuj** dlouhé hry až do konce (často s random / lehkou policy).
2. Sleduj výhry / prohry — relativní frekvence = odhad pravděpodobnosti výhry pro každý počáteční tah.
3. Vyber tah s nejvyšší pravděpodobností.

Toto je **Monte Carlo** — *přesnost roste* s počtem vzorků (∝ 1/√n).

**Náhodný `seed` na začátku** — pokud zachováme stejný *rollout RNG*, „kostka" padne stejně pro různé akce, takže porovnání je *fair*.

## Monte Carlo Tree Search (MCTS)

Klasická Monte Carlo nešetří informace — pro každý tah od kořene vzorkuje nezávisle. **MCTS** (Kocsis & Szepesvári 2006) **buduje** strom postupně:

::: svg "MCTS čtyři fáze: Selection (descend), Expansion (přidej uzel), Simulation (rollout), Backpropagation (update statistik)."
<svg viewBox="0 0 540 230" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--text)" text-anchor="middle" font-weight="600" font-size="11">
    <text x="80" y="22">1. Selection</text>
    <text x="220" y="22">2. Expansion</text>
    <text x="360" y="22">3. Simulation</text>
    <text x="500" y="22">4. Backprop</text>
  </g>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <circle cx="80" cy="50" r="8"/>
    <circle cx="60" cy="90" r="8"/>
    <circle cx="100" cy="90" r="8"/>
    <circle cx="60" cy="130" r="8"/>
    <circle cx="220" cy="50" r="8"/>
    <circle cx="200" cy="90" r="8"/>
    <circle cx="240" cy="90" r="8"/>
    <circle cx="200" cy="130" r="8"/>
    <circle cx="220" cy="130" r="8" stroke-dasharray="3 2"/>
    <circle cx="360" cy="50" r="8"/>
    <circle cx="340" cy="90" r="8"/>
    <circle cx="380" cy="90" r="8"/>
    <circle cx="340" cy="130" r="8"/>
    <circle cx="360" cy="130" r="8" stroke-dasharray="3 2"/>
    <circle cx="500" cy="50" r="8"/>
    <circle cx="480" cy="90" r="8"/>
    <circle cx="520" cy="90" r="8"/>
    <circle cx="480" cy="130" r="8"/>
    <circle cx="500" cy="130" r="8" stroke-dasharray="3 2"/>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none">
    <line x1="80" y1="58" x2="60" y2="82"/>
    <line x1="80" y1="58" x2="100" y2="82"/>
    <line x1="60" y1="98" x2="60" y2="122"/>
    <line x1="220" y1="58" x2="200" y2="82"/>
    <line x1="220" y1="58" x2="240" y2="82"/>
    <line x1="200" y1="98" x2="200" y2="122"/>
    <line x1="200" y1="98" x2="220" y2="122"/>
    <line x1="360" y1="58" x2="340" y2="82"/>
    <line x1="360" y1="58" x2="380" y2="82"/>
    <line x1="340" y1="98" x2="340" y2="122"/>
    <line x1="340" y1="98" x2="360" y2="122"/>
    <line x1="500" y1="58" x2="480" y2="82"/>
    <line x1="500" y1="58" x2="520" y2="82"/>
    <line x1="480" y1="98" x2="480" y2="122"/>
    <line x1="480" y1="98" x2="500" y2="122"/>
  </g>
  <g stroke="#cf6660" stroke-width="2" stroke-dasharray="5 3" fill="none">
    <line x1="360" y1="138" x2="350" y2="170"/>
    <line x1="350" y1="172" x2="365" y2="200"/>
  </g>
  <g fill="#cf6660" text-anchor="middle" font-size="9">
    <text x="370" y="195">rollout</text>
    <text x="370" y="210">→ výsledek</text>
  </g>
  <g stroke="#7fbf6c" stroke-width="2" fill="none">
    <path d="M 500 138 L 480 105 L 500 65" marker-end="url(#mctsArrow)"/>
  </g>
  <defs>
    <marker id="mctsArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="#7fbf6c"/>
    </marker>
  </defs>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="80" y="180">UCT vybírá cestu</text>
    <text x="220" y="180">přidej list uzel</text>
    <text x="360" y="180">náhodná hra</text>
    <text x="500" y="180">update N+W</text>
  </g>
</svg>
:::

### Čtyři fáze iterace

1. **Selection** — od kořene jdi dolů po existujících uzlech podle pravidla `UCT` (Upper Confidence bounds for Trees), dokud nedosáhneš listu (uzel s ne-všemi-rozbalenými potomky).
2. **Expansion** — přidej do stromu *jednoho* neexpandovaného potomka.
3. **Simulation** (rollout) — od nového uzlu *hraj náhodně* (nebo s lehkou policy) do konce hry.
4. **Backpropagation** — výsledek (`1` výhra, `0` prohra) propagiej zpět cestou; každý uzel `n` aktualizuje:
   - `N(n)` — počet navštívení.
   - `W(n)` — kumulativní hodnota (počet výher).

Po `T` iteracích vyber tah z kořene s **nejvíc navštěvami** (robustní k šumu).

### UCT formula

```
UCT(n) = W(n) / N(n)  +  c · √(ln N(parent) / N(n))
```

* První člen — **exploitation** (kolik vítězí).
* Druhý člen — **exploration** (méně navštěvovaný uzel má bonus).
* `c` — explorační konstanta (typicky `c = √2`).

Toto vyvažuje *prozkoumávání* nových tahů a *využití* slibných.

::: viz mcts-4phase "Animace čtyř fází (select via UCB1 / expand / simulate / backprop) na malém stromě; budget slider."
:::

### Výhody MCTS

* **Asymptoticky optimální** — s neomezeným časem konverguje k minimax.
* **Anytime** — kdykoli ukončíme, máme rozumné rozhodnutí.
* **Doménově nezávislé** — nepotřebuje *eval function*. Stačí simulátor pro rollouty.
* **Snadno paralelizovatelné** — rollouts jsou *nezávislé*.

### MCTS + neuronka — AlphaGo, AlphaZero

[AlphaGo](https://deepmind.com/research/case-studies/alphago-the-story-so-far) (Silver et al., 2016) nahrazuje:

* **Selection policy** — neuronka *policy network* `π(a | s)` (zkušená lidská hra + self-play).
* **Rollout** — neuronka *value network* `V(s)` odhaduje výsledek a kombinuje se s rychlým náhodným rolloutem (mísicí parametr λ, nejlepší výsledky kolem λ≈0,5). Úplné vypuštění rolloutů (list hodnotí jen value network) přináší až AlphaGo Zero / AlphaZero.

[AlphaZero](https://deepmind.com/blog/article/alphazero-shedding-new-light-grand-games-chess-shogi-and-go) (2017) jde dál — *jediná* neuronka výstupuje `(π, V)`. Trénink čistě **self-play**, žádné lidské hry. Funguje pro šachy, shogi, Go.

Vzorec pro `UCT` v AlphaZero:

```
PUCT(s, a) = Q(s, a) + c · π(a | s) · √N(s) / (1 + N(s, a))
```

Place větve s vysokou prior `π(a | s)` se navštíví víc.

## Imperfect information

Pro hry s *neúplnou* informací (poker, bridge):

* **Averaging over clairvoyance** — náhodně zvol „co soupeř má", spočti minimax, opakuj a průměr. Často *suboptimální* (předpokládá perfektní informaci, kterou agent ve skutečnosti nemá).
* **Counterfactual Regret Minimization (CFR)** — *self-play* algoritmus pro Nashovo rovnováhu. Použito v *Libratus* (poker), *Pluribus* (multiplayer poker).
* **Blafování** — racionální *náhodnost* tahů, aby agent zmátl soupeře. Optimální strategie poker = smíšená strategie.

## Klíčové vlastnosti her

* **Pořadí tahů (move ordering)** je důležité — α-β prořezává *víc* s dobrým pořadím.
* **Quiescent search** — vyhodnocuj jen *klidné* pozice, aby ses vyhnul *horizon effectu*.
* **Transposition table** — hash uložení známých pozic (různé permutace tahů → stejná pozice).
* **Endgame tablebases** — pro koncovky šachu lookup tabulky (Syzygy do 7 figurek).

::: link "AIMA, kap. 5.4–5.5: Monte Carlo Tree Search, Stochastic Games" "http://aima.cs.berkeley.edu/"
:::

::: link "Kocsis, L., Szepesvári, C.: Bandit based Monte-Carlo Planning (ECML, 2006)" "https://link.springer.com/chapter/10.1007/11871842_29"
:::

::: link "Silver, D. et al.: Mastering the game of Go with deep neural networks and tree search (Nature, 2016)" "https://www.nature.com/articles/nature16961"
:::

::: link "Silver, D. et al.: A general reinforcement learning algorithm that masters chess, shogi, and Go through self-play (Science, 2018) — AlphaZero" "https://www.science.org/doi/10.1126/science.aar6404"
:::

---

*Zdroj: SUI přednášky 2025/26, *Adversarial search — pokračování* (Šůstek). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 5.4–5.5; Kocsis, L. & Szepesvári, C.: *Bandit based Monte-Carlo Planning* (ECML 2006); Silver, D. et al.: *Mastering the game of Go with deep neural networks and tree search* (Nature 529, 2016); Silver, D. et al.: *AlphaZero* (Science 362, 2018); Browne, C. et al.: *A Survey of Monte Carlo Tree Search Methods* (IEEE TCIAIG 4(1), 2012).*
