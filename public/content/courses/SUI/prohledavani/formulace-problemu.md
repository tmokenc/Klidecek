---
title: Formulace problému a typy prohledávání
---

# Formulace problému a typy prohledávání

Prohledávání stavového prostoru je standardní nástroj pro **cílově orientované** agenty v *atomické* reprezentaci stavu (viz [[reprezentace-stavu]]). Předpokladem je *známé* a *jisté* (plně pozorovatelné + deterministické) prostředí.

## Postup řešení

1. **Formulace problému** — vytvoření abstrakce, která je *validní* (postačuje pro řešení), ale *minimalistická* (zbytečné detaily zpomalují). Špatná formulace může úlohu *zbytečně* zkomplikovat.
2. **Spuštění prohledávání** → nalezení sekvence akcí.
3. **Vykonání řešení** — nezávisle na vjemech (deterministické prostředí).

## Formální definice problému

Pět složek:

1. **Počáteční stav** `s₀` — kde agent začíná.
2. **Akce** `ACTIONS(s) = {a₁, ..., aₙ}` — všechny akce použitelné ve stavu `s`.
3. **Přechodový model** `RESULT(s, a) = s'` — jaký je *jediný* stav po vykonání akce `a` v `s`.
4. **Cílový test** `GOAL(s) → {true, false}` — je tento stav cílem?
5. **Cena cesty** — součet `COST(s, a) ∈ R₀⁺` přes kroky. Pouze kladné, jinak by triviálně existovaly nekonečně levné cesty (cyklem).

**Řešení** = sekvence akcí, která vede z `s₀` přes přechodový model do *cílového* stavu. **Optimální řešení** = řešení s nejmenší cenou cesty.

## Příklad — Loydova osmička

8-puzzle (Loyd, 1879). 8 ponumerovaných políček v rámu 3×3, jedno políčko prázdné. Cíl: posunutím sousedních políček do prázdného políčka uspořádat čísla `1..8`.

* `s₀` — startovní pozice 8 čísel + prázdné políčko.
* `ACTIONS(s)` — `{Up, Down, Left, Right}` (které jdou; max 4, min 2 v rozích).
* `RESULT(s, Up)` — prohozí prázdné políčko s políčkem nad ním.
* `GOAL(s)` — `s == final_state`.
* `COST = 1` na každý krok.

Stavový prostor má `9!/2 = 181 440` dosažitelných stavů (polovina je nedosažitelná z dané startovní pozice — *invariant parity*).

## Příklad — 8 dam

Umístit 8 dam na šachovnici tak, aby se neohrožovaly.

**Inkrementální formulace** (přidávat dámy):

* `s₀` — prázdná šachovnice.
* `ACTIONS(s)` — přidat dámu kamkoli, kde *neohrožuje* žádnou stávající.
* `GOAL(s)` — 8 dam na šachovnici.

**Kompletně-stavová formulace** (modifikovat hotovou):

* `s₀` — 8 dam na náhodných místech.
* `ACTIONS(s)` — posunout dámu na jiné políčko.
* `GOAL(s)` — žádné ohrožení.

Druhá formulace umožňuje *lokální prohledávání* ([[lokalni]]) — méně efektivní state-space, ale lépe škáluje s počtem dam (řeší se i pro 1 000 000 dam).

## Tree-search vs. graph-search

::: svg "Tree-search vs. graph-search: tree-search opakovaně rozbaluje stejné stavy, graph-search si je pamatuje."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--text)" text-anchor="middle" font-size="11.5" font-weight="600">
    <text x="140" y="22">tree-search</text>
    <text x="400" y="22">graph-search</text>
  </g>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <circle cx="140" cy="50" r="14"/>
    <circle cx="100" cy="100" r="14"/>
    <circle cx="180" cy="100" r="14"/>
    <circle cx="80" cy="150" r="14"/>
    <circle cx="120" cy="150" r="14"/>
    <circle cx="160" cy="150" r="14"/>
    <circle cx="200" cy="150" r="14"/>
    <circle cx="60" cy="200" r="14"/>
    <circle cx="100" cy="200" r="14"/>
    <circle cx="140" cy="200" r="14"/>
    <circle cx="180" cy="200" r="14"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="140" y="54">A</text>
    <text x="100" y="104">B</text>
    <text x="180" y="104">C</text>
    <text x="80" y="154">A</text>
    <text x="120" y="154">C</text>
    <text x="160" y="154">B</text>
    <text x="200" y="154">D</text>
    <text x="60" y="204">B</text>
    <text x="100" y="204">C</text>
    <text x="140" y="204">A</text>
    <text x="180" y="204">A</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="140" y1="64" x2="100" y2="86"/>
    <line x1="140" y1="64" x2="180" y2="86"/>
    <line x1="100" y1="114" x2="80" y2="136"/>
    <line x1="100" y1="114" x2="120" y2="136"/>
    <line x1="180" y1="114" x2="160" y2="136"/>
    <line x1="180" y1="114" x2="200" y2="136"/>
    <line x1="80" y1="164" x2="60" y2="186"/>
    <line x1="80" y1="164" x2="100" y2="186"/>
    <line x1="120" y1="164" x2="140" y2="186"/>
    <line x1="200" y1="164" x2="180" y2="186"/>
  </g>
  <g fill="var(--bg-card)" stroke="#7fbf6c" stroke-width="1.2">
    <circle cx="400" cy="50" r="14"/>
    <circle cx="360" cy="110" r="14"/>
    <circle cx="440" cy="110" r="14"/>
    <circle cx="400" cy="170" r="14"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="400" y="54">A</text>
    <text x="360" y="114">B</text>
    <text x="440" y="114">C</text>
    <text x="400" y="174">D</text>
  </g>
  <g stroke="#7fbf6c" stroke-width="1.4" fill="none">
    <line x1="400" y1="64" x2="360" y2="96"/>
    <line x1="400" y1="64" x2="440" y2="96"/>
    <line x1="360" y1="124" x2="400" y2="156"/>
    <line x1="440" y1="124" x2="400" y2="156"/>
    <line x1="360" y1="110" x2="440" y2="110" stroke-dasharray="3 3"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="140" y="218">opakované expanze stavů</text>
    <text x="400" y="200">každý stav max. 1×</text>
  </g>
</svg>
:::

* **Tree-search** — *neuchovává* prozkoumané stavy. Stejný stav může být expandován opakovaně různými cestami → *zbytečná práce* pro grafy s cykly.
* **Graph-search** — udržuje množinu **explored** (= „closed"). Před expanzí kontroluje, jestli už stav nebyl prozkoumán. Šetří čas, plíží paměť. Jediný správný přístup, když máme *cykly* ve stavovém prostoru.

V praxi:

```
explored = ∅
frontier = {s₀}
while frontier neprázdná:
    s = vyber_a_odeber(frontier)
    if GOAL(s): return s
    explored.add(s)
    for s' in expand(s):
        if s' not in explored ∪ frontier:
            frontier.add(s')
return fail
```

## Datová struktura pro frontier

Frontier (= „open list") drží *uzly* k expanzi. Volba datové struktury určuje *strategii*:

| Strategie | Datová struktura | Pořadí expanze |
| :-- | :--: | :--- |
| BFS — Breadth-first | FIFO fronta | nejmělčí uzel první |
| DFS — Depth-first | LIFO zásobník | nejhlubší uzel první |
| UCS — Uniform-cost | Prioritní fronta (klíč = `g(n)`) | nejlevnější cesta první |
| Greedy best-first | Prioritní fronta (klíč = `h(n)`) | nejnadějnější uzel první |
| A* | Prioritní fronta (klíč = `f(n) = g(n) + h(n)`) | optimální mix obou |

## Hodnocení algoritmu prohledávání

Čtyři kritéria:

1. **Úplnost (completeness)** — Pokud řešení existuje, algoritmus ho *najde*.
2. **Optimálnost (optimality)** — Pokud najde řešení, je *optimální* (nejlevnější).
3. **Časová složitost** — `O(?)` operací (zpravidla počtu expanzí).
4. **Prostorová složitost** — `O(?)` paměti (zpravidla velikosti frontier + explored).

V teorii složitosti uvažujeme parametry:
* `b` (branching factor) — průměrný počet následníků uzlu.
* `d` (depth) — hloubka *nejmělčího* řešení.
* `m` (max depth) — maximální hloubka stavového prostoru (může být `∞`).

V *reálných* problémech nás zajímá i **cena samotného prohledávání** (computation time) — někdy se vyplatí horší algoritmus, který stojí míň výpočetní práce na expansi.

## Vztah s plánováním a CSP

Prohledávání stavového prostoru je *univerzální* nástroj — používá se i v:

* **Plánování** (PDDL, STRIPS) — stavy jsou logické formule.
* **CSP** ([[csp-prohledavani]]) — backtracking je DFS přes částečné přiřazení proměnných.
* **Adversarial search** ([[adversarial]]) — minimax přes hru.
* **Hry typu RL** — Monte Carlo Tree Search ([[mcts-stochastic]]) na obrovských stavových prostorech.

::: link "AIMA — kap. 3: Solving Problems by Searching" "http://aima.cs.berkeley.edu/"
:::

::: link "Stanford CS221: Search problems" "https://stanford-cs221.github.io/spring2020/modules/search/overview.pdf"
:::

---

*Zdroj: SUI přednášky 2025/26, *Řešení problémů prohledáváním* (Šůstek). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 3; Pearl, J.: *Heuristics — Intelligent Search Strategies for Computer Problem Solving* (Addison-Wesley, 1984).*
