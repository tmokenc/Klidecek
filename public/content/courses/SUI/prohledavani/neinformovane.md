---
title: Neinformované prohledávání
---

# Neinformované prohledávání

**Neinformované** (slepé) prohledávání nemá žádnou *doménově specifickou* informaci o tom, jak daleko jsou stavy od cíle. Pracuje *jen* se strukturou problému: počátečním stavem, akcemi, cílovým testem a cenou kroků (viz [[formulace-problemu]]).

## Přehled algoritmů

| Algoritmus | Frontier | Optimální? | Úplný? | Časová | Prostorová |
| :-- | :--: | :--: | :--: | :--: | :--: |
| BFS | FIFO | Ano (jen pro `cost=1`) | Ano | `O(b^d)` | `O(b^d)` |
| DFS | LIFO | Ne | Ne (∞) / Ano (graph) | `O(b^m)` | `O(b·m)` |
| DLS | LIFO + limit | Ne | Pouze pokud řešení v limitu | `O(b^ℓ)` | `O(b·ℓ)` |
| IDS | LIFO + iter. limit | Ano (jen pro `cost=1`) | Ano | `O(b^d)` | `O(b·d)` |
| UCS | Prio. fronta (g) | **Ano** (i obecná cena) | Ano | `O(b^(1+⌊C*/ε⌋))` | tož samé |
| BS | 2× FIFO | Ano (`cost=1`) | Ano | `O(b^(d/2))` | `O(b^(d/2))` |

`b` = branching factor, `d` = hloubka řešení, `m` = max. hloubka, `ℓ` = limit, `C*` = cena optimálního řešení, `ε` = min. cena kroku.

## BFS — Breadth-first search

::: viz bfs "Klikni na cílový uzel — BFS expanduje od startu po vrstvách, kratší cesta první."
:::

* Frontier = **FIFO fronta**.
* Expanduje uzly v pořadí **rostoucí hloubky**.
* **Úplný** — pokud má frontier konečnou velikost vrstvy, najde řešení.
* **Optimální** pro stejné ceny kroků (`cost = const`). Pro různé ceny použít UCS.
* **Cíl testovat při generování** (ne při expanzi) — šetří jednu vrstvu expanzí.

**Extrémní paměťové nároky** — `O(b^d)`. Pro `b = 10, d = 12` to je `~10¹²` uzlů. Hlavní bottleneck v praxi je *paměť*, ne CPU.

## DFS — Depth-first search

* Frontier = **LIFO zásobník**.
* Expanduje **nejhlubší** uzel první.
* **Není optimální** — najde *jakékoli* řešení, ne nejlevnější.
* **Není úplný** v *nekonečném* stavovém prostoru (může se zaseknout do nekonečné větve).
* Paměť `O(b · m)` — pouze aktuální *cesta* + sourozenci na ní = **lineární** v hloubce. Hlavní výhoda.

**Backtracking search** — varianta DFS, která navíc *neuchovává* všechny následníky uzlu, ale jen provedenou akci. Při backtracku akci vrátí. Šetří paměť o další faktor.

Při tree-search v *nekonečném* prostoru se DFS nesmí použít přímo — potřebuje *kontrolu cyklů* (= graph-search) nebo *limit hloubky* (= DLS).

## DLS — Depth-limited search

* DFS s **horním limitem hloubky** `ℓ`. Uzly v hloubce `ℓ` se *neexpandují*.
* Úplná, pokud řešení leží *v* hloubce `≤ ℓ`. Jinak neúplná.
* Užitečné, když známe *dolní mez* na hloubku řešení (např. ze struktury úlohy).

## IDS — Iterative Deepening Search

Genialita: kombinuje **paměťovou efektivitu DFS** s **úplností a optimálností BFS**.

```
for ℓ = 0, 1, 2, 3, ...:
    výsledek = DLS(s₀, ℓ)
    if výsledek nalezl řešení: return výsledek
```

* Začneme s `ℓ = 0`, postupně zvyšujeme.
* **Optimální** pro stejné ceny kroků (najde řešení v *nejmenší* hloubce).
* **Úplný**.
* Paměť `O(b · d)` — jako DFS.
* Časová složitost `O(b^d)` — *překvapivě stejně* jako BFS, protože poslední vrstva dominuje (geometrická řada).

::: viz iddfs-redundancy "Per-úroveň počet expanzí pro IDDFS vs DFS k hloubce d; overhead +1/(b−1)/d → asymptoticky zanedbatelný."
:::

> **Doporučená neinformovaná metoda.** Když máme dost paměti, BFS bývá rychlejší (necachuje znovu mělčí vrstvy), ale jinak je IDS perfektní kompromis.

## UCS — Uniform-cost search

* Frontier = **prioritní fronta** s klíčem `g(n)` = cena cesty od startu do `n`.
* Expanduje uzel s **nejmenší kumulativní cenou** první.
* Pro stejné ceny kroků se chová jako BFS.
* **Optimální** i **úplný** pro libovolné *kladné* ceny.
* Speciální případ A* s heuristikou `h(n) = 0` — viz [[informovane]].

**Pozor**: cíl testujeme při *expanzi* (vyjmutí z fronty), ne při *generování*. Jinak bychom mohli vrátit suboptimální cestu, která byla *objevena dřív*, ale není nejlevnější. Dijkstra a UCS jsou v podstatě totéž — Dijkstra na grafech, UCS jako varianta pro AI vyhledávání cesty.

::: viz dijkstra "Krokování Dijkstry / UCS: prio fronta postupně rozšiřuje nejlevnější známou cestu."
:::

::: viz uninformed-compare "Stejný graf, BFS / DFS / UCS side-by-side; frontier + pořadí expanze viditelné."
:::

## BS — Bidirectional search

* **Dvě fronty** — z `s₀` dopředu a z cíle pozpátku.
* Setkají se uprostřed → cestu zrekonstruujeme.
* Časová a prostorová složitost `O(b^(d/2))` — *exponenciálně lepší*. Pro `b=10, d=12` to je `10⁶` místo `10¹²`.

**Omezení:**

* Musíme umět *invertovat* přechody (jít z cíle do předchůdců).
* Cíl musí být *jediný stav* (jinak je expanzí zpětně mnoho).
* Implementace složitější — test, kdy se setkají.

## Příklad — 8-puzzle

Branching factor `b ≈ 3` (max 4, ale ne všude). Optimální cesta `d ≈ 22` ve většině startů.

| Algoritmus | Uzly k expanzi | Paměť |
| :-- | :--: | :--: |
| BFS | `~3²² ≈ 3 · 10¹⁰` | `~3 · 10¹⁰` (neuložitelné) |
| DFS bez detekce cyklů | nekonečno | `~b · m` |
| DFS s graph-search | `~10⁵` (díky cache) | `~10⁵` |
| IDS | `~3²²` (jako BFS) | `~b · d ≈ 66` |
| A* (s manhattanskou heuristikou) | `~10³` | malé |

**Bez heuristiky** (informované, [[informovane]]) je 8-puzzle prakticky neřešitelná pro BFS/DFS — paměťový strop je nepřekonatelný.

## Pseudokód — uniformní rámec

Všechny tyto algoritmy lze vyjádřit jako *graph-search* s různou volbou *frontier*:

```python
def graph_search(s0, GOAL, ACTIONS, RESULT, COST):
    explored = set()
    frontier = make_data_structure()  # FIFO / LIFO / PQ
    push(frontier, Node(s0, parent=None, action=None, g=0))
    while frontier:
        n = pop(frontier)
        if GOAL(n.state):
            return reconstruct_path(n)
        if n.state in explored: 
            continue
        explored.add(n.state)
        for a in ACTIONS(n.state):
            s_new = RESULT(n.state, a)
            if s_new not in explored:
                g_new = n.g + COST(n.state, a)
                push(frontier, Node(s_new, parent=n, action=a, g=g_new))
    return fail
```

Volba `make_data_structure`:
* `Queue` → BFS
* `Stack` → DFS
* `PriorityQueue` na `g` → UCS / Dijkstra

Při změně `push` na priority s `f = g + h` dostaneme **A***.

::: link "AIMA, kap. 3.4: Uninformed Search Strategies" "http://aima.cs.berkeley.edu/"
:::

::: link "cp-algorithms — BFS, DFS, Dijkstra (referenční implementace)" "https://cp-algorithms.com/graph/breadth-first-search.html"
:::

---

*Zdroj: SUI přednášky 2025/26, *Řešení problémů prohledáváním* (Šůstek). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 3.4; Korf, R.: *Depth-First Iterative-Deepening: An Optimal Admissible Tree Search* (Artificial Intelligence, 1985); Dijkstra, E. W.: *A note on two problems in connexion with graphs* (Numerische Mathematik, 1959).*
