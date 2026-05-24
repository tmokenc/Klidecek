---
title: Informované prohledávání a A*
---

# Informované prohledávání a A*

**Informované** prohledávání používá *doménově specifickou* informaci — **heuristiku** `h(n)` — k odhadu, jak daleko je uzel `n` od cíle. Bez heuristiky se redukujeme na UCS ([[neinformovane]]).

## Heuristika `h(n)`

`h: Stavy → R⁺₀` je *odhad* nejmenší zbývající ceny ze stavu `n` do cíle. Praktické vlastnosti:

* `h(goal) = 0` (jsme tam, nic nezbývá).
* `h(n) ≥ 0` pro každý `n`.
* Větší `h(n)` = horší (vzdálenější od cíle); menší = lepší.

**Příklad heuristik pro 8-puzzle:**

* **`h₁` — počet políček mimo cílovou pozici.** Triviálně `h₁ ≤ d*` (potřebujeme posunout aspoň každé špatně umístěné).
* **`h₂` — součet manhattanských vzdáleností** každého políčka k jeho cíli. `h₂ ≥ h₁` — silnější odhad.

Obecná pravidla:

* **Admissible (přípustná)** heuristika `h(n) ≤ h*(n)` (nikdy *nepřekročí* skutečnou cenu). Garance optimálnosti A*.
* **Konzistentní (monotonní)** heuristika splňuje *trojúhelníkovou nerovnost* `h(n) ≤ cost(n, a, n') + h(n')`. Silnější vlastnost — implikuje admissibility a navíc nepotřebujeme „re-expand" uzly.
* **Dominance**: pokud `h_a(n) ≥ h_b(n) ∀ n` *a* `h_a` zůstává admissible, je `h_a` *lepší* (expanduje méně uzlů).

## Greedy best-first search

Frontier = prioritní fronta s klíčem `f(n) = h(n)`. Vybírá *vždy* uzel, který *vypadá* nejblíž cíli.

* **Rychlý** v praxi (efektivní pro mnohé úlohy).
* **Neoptimální** — žene se za heuristikou, ignoruje cenu cesty.
* **Není úplný** v tree-search (může se zacyklit).

Hodí se, když nepotřebujeme optimum, jen *rychlé* řešení.

## A* algoritmus

**Hart, Nilsson, Raphael (1968)**. Kombinuje *cenu cesty* z UCS a *heuristický odhad zbytku*:

::: math
f(n) = g(n) + h(n)
:::

* `g(n)` — *známá* cena cesty z `s₀` do `n`.
* `h(n)` — *odhad* zbývající ceny z `n` do cíle.
* `f(n)` — odhad **celkové ceny cesty** vedoucí přes `n`.

Frontier = prioritní fronta podle `f(n)`. Vybírá uzel s *nejmenším* odhadem celkové ceny.

### Vlastnosti A*

* **Úplný** — pro konečné stavové prostory nebo když existuje konečné řešení.
* **Optimální** — pokud je `h` *admissible* (tree-search) nebo *konzistentní* (graph-search).
* **Optimálně efektivní** — A* expanduje *jen* uzly s `f(n) ≤ f*` (cena optimálního řešení). Žádný jiný algoritmus *se stejnou heuristikou* neudělá lépe.

### Důkaz optimality (klíčová idea)

Předpokládejme `h` admissible. Pak pro každý uzel `n` na optimální cestě platí `f(n) = g(n) + h(n) ≤ g(n) + h*(n) = f*`. A* vybírá uzly v rostoucím `f`, takže žádný uzel s `f > f*` nepředběhne optimální cíl. Když poprvé vytáhneme cílový uzel z fronty, máme optimální cestu.

### Příklad — A* na 8-puzzle

S manhattanskou heuristikou `h₂` expanduje A* řádově `10³` uzlů místo `10¹⁰` u BFS. Praktická paměťová náročnost zůstává exponenciální v *chybě* heuristiky, ale s rozumným `h` je drtivě lepší než neinformované metody.

## Vizualizace A*

::: viz astar-explorer "Krok-po-kroku A* na gridu; přepínač heuristik h₀ (=UCS), h₁ Manhattan, h₂ Euclid, h₃ neadmis.; vidíte g/h/f a pořadí expanze."
:::

::: viz dijkstra "Dijkstra/UCS = A* s nulovou heuristikou. Klikni krok, viz pořadí expanze."
:::

(Porovnejte na stejné mapě: UCS expanduje radiálně, A* s `h₂` se žene přímo k cíli.)

## Konstrukce heuristiky

Tři osvědčené strategie:

### Relaxace problému

*Odstraníme* některá omezení a *uzavřeně vyřešíme* zjednodušený problém — jeho cena je *dolní mez* na původní úlohu (= admissible).

* **8-puzzle**: relaxace „políčko se může pohnout *kamkoli*" → `h₁` (počet mimo pozic).
* **8-puzzle**: relaxace „políčka se mohou *překrývat*" → `h₂` (manhattan).
* **Cestování v mapě**: relaxace „létáme rovně" → vzdálenost vzdušnou čarou.

### Maximum z více heuristik

`h(n) = max(h₁(n), h₂(n), ...)` — zachovává admissibilitu, je *aspoň tak silná* jako každá zvlášť.

### Pattern databases

Pre-computujeme vzdálenosti pro *podmnožinu* stavů (např. jen 4 políčka 8-puzzle). Lookup tabulka. Často mocné, ale paměťově náročné.

### Naučené heuristiky

Neuronka trénovaná na `(stav, vzdálenost k cíli)` páry. *Riziko*: ztrátu admissibility (neuronka nemá garance). Použít *lower bound* z naučených hodnot nebo *neptal-jsem-se garance + spousta zkušebních spuštění*.

## A* varianty

* **IDA*** (Iterative Deepening A*) — IDS s `f(n)` limitem místo limit hloubky. Lineární paměť.
* **SMA*** (Simplified Memory-bounded A*) — A* s omezenou pamětí; když plno, *zapomene* nejhorší uzly.
* **Weighted A*** — `f(n) = g(n) + W · h(n)` pro `W > 1`. Rychlejší, ale **suboptimální** (max `W`-násobek optima).
* **D*** a **D* Lite** — *dynamický* A* pro prostředí, kde se *přechody mění* (robotika, online plánování).

## Limity heuristického prohledávání

* **Paměť** — A* drží frontier i explored, paměť roste exponenciálně.
* **Kvalita `h`** — slabá heuristika → A* degraduje na UCS.
* **Doménově specifické** — pro každý problém je třeba *navrhnout* heuristiku (nebo se ji *naučit*).
* **Bezpečnostní kontext** — pokud `h` nesplňuje admissibility, A* může vrátit suboptimální řešení.

V neurónových sítích pro hry (AlphaZero, MuZero) je *naučená evaluation* `V(s)` analogem heuristiky — používá se v MCTS ([[mcts-stochastic]]).

::: link "Hart, Nilsson, Raphael: A Formal Basis for the Heuristic Determination of Minimum Cost Paths (IEEE Transactions, 1968)" "https://ieeexplore.ieee.org/document/4082128"
:::

::: link "AIMA, kap. 3.5: Informed Search Strategies" "http://aima.cs.berkeley.edu/"
:::

::: link "Korf, R.: Linear-Space Best-First Search (IDA*), 1993" "https://www.cs.utexas.edu/~moore/acl2/seminar/2010.06-bird/korf-1993.pdf"
:::

---

*Zdroj: SUI přednášky 2025/26, *Řešení problémů prohledáváním* (Šůstek). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 3.5–3.6; Hart, P. E., Nilsson, N. J., Raphael, B.: *A Formal Basis for the Heuristic Determination of Minimum Cost Paths* (IEEE 1968); Korf, R. E.: *Depth-First Iterative-Deepening* (AI Journal, 1985); Pearl, J.: *Heuristics* (Addison-Wesley, 1984).*
