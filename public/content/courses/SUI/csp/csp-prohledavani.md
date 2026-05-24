---
title: Prohledávání v CSP — backtracking a heuristiky
---

# Prohledávání v CSP

Inference ([[csp-inference]]) sama o sobě obvykle CSP nedořeší — domény se zúží, ale úplné přiřazení musí najít *prohledávání*. **Backtracking** s heuristikami je klíčový algoritmus.

## Naivní prohledávání

Triviální přístup: zkus všechna kombinatorická přiřazení.

```
for each (X₁ ∈ D₁):
    for each (X₂ ∈ D₂):
        ...
            for each (Xₙ ∈ Dₙ):
                if konzistentní: return přiřazení
```

* Časová složitost `O(d^n)` — exponenciální.
* **Problém**: zkoušíme i kombinace, které **lze odmítnout dříve**. Pokud `X₁ = 1` poruší omezení `X₁ ≠ X₂`, neměli bychom zkoušet *všechny* hodnoty `X₂` v této větvi.

## Backtracking

Klíčová idea: jakmile parciální přiřazení *poruší* omezení, **přerušíme** a vrátíme se. *Hluboké prohledávání s odřezáváním nekonzistentních větví*.

```python
def backtrack(assignment, csp):
    if assignment is complete: return assignment
    X = vyber_proměnnou(csp, assignment)
    for v in vyber_pořadí_hodnot(X, csp, assignment):
        if konzistentní(assignment + {X: v}, csp):
            assignment[X] = v
            csp = inference(csp, assignment, X)   # volitelné
            result = backtrack(assignment, csp)
            if result != failure: return result
            assignment.remove(X)
            csp.restore()                          # vrátit změny z inference
    return failure
```

Toto je *DFS přes částečné přiřazení* s odřezáváním. Pořád exponenciální, ale výrazně rychlejší než naivní enumeration.

## Heuristiky pro výběr proměnné

> Otázka: *Kterou* proměnnou přiřadit jako další?

### MRV — Minimum Remaining Values

Zvol proměnnou s **nejmenší** doménou. Také známé jako *most constrained variable* nebo *fail-first*.

**Intuice**: 

* Pokud proměnná má jen 1-2 hodnoty, vybereme ji rychle.
* Pokud z těchto hodnot žádná nefunguje, *rychle odhalíme* slepou uličku.

> *Fail fast.* Lepší zjistit neúspěch hned a backtrackovat, než zbytečně zanořovat.

### Degree heuristic

Když je MRV nejednoznačná (více proměnných má stejnou velikost domény), použij **degree heuristic** — vyber proměnnou s největším počtem omezení s *nepřiřazenými* sousedy.

**Intuice**: omezuje nejvíc *budoucích* proměnných.

Často se *kombinuje*: nejdřív MRV, tie-break přes degree.

## Heuristiky pro výběr hodnoty

> Otázka: V *jakém pořadí* zkoušet hodnoty zvolené proměnné?

### LCV — Least Constraining Value

Zvol hodnotu, která **ponechá nejvíc možností** pro sousedy.

**Intuice**: chceme úspěch, ne neúspěch. Hodnota, která *netvoří mnoho* omezení pro sousedy, ponechává hodně místa.

### Pozor — záleží na cíli

* Pokud hledáme *jediné* řešení, LCV pomáhá nalézt ho *rychleji* (méně backtracků).
* Pokud hledáme *všechna* řešení nebo úloha *nemá řešení*, pořadí hodnot je *irelevantní* — stejně projdeme všechny.

## Inference + prohledávání

Hybridní přístupy — inference *během* prohledávání:

### Forward checking

Po přiřazení `X = v` *propaguj* do sousedů: redukuj jejich domény odebráním hodnot, které nepokoří `X = v`.

```python
def forward_check(csp, X, v):
    for each Y in neighbors(X) (nepřiřazené):
        for each w in D_Y:
            if (v, w) porušuje omezení (X, Y):
                D_Y.remove(w)
        if D_Y is empty: return failure
    return success
```

Když nějaká doména klesne na `0`, *okamžitě* víme, že parciální přiřazení nelze rozšířit → backtrack.

### MAC — Maintaining Arc Consistency

Silnější — po každém přiřazení **spustíme AC-3** pro *všechny* hrany (ne jen sousedy přiřazené proměnné). Náročnější, ale silnější redukce.

> **Trade-off**: MAC inference je drahá per-krok, ale řešení může najít *exponenciálně* rychleji než plain backtracking. V praxi je MAC + MRV + LCV osvědčená kombinace.

::: viz csp-backtrack-mrv "Backtrack na Australia map; přepínače MRV / LCV / forward-checking; vidíte, kolik backtracks ubývá."
:::

## Konflikt-driven inteligence

### Backjumping

Při neúspěchu (`failure`) místo backtracku na *poslední* proměnnou skoč na proměnnou *zodpovědnou za konflikt*.

**Conflict set** — pro každou proměnnou udržujeme množinu proměnných, jejichž *přiřazení* způsobilo, že některá hodnota `X` byla vyřazena. Při neúspěchu skočíme na nejhlubší proměnnou z conflict setu.

Toto je *chytřejší* než plain chronological backtracking — méně zbytečné práce.

### Constraint learning — no-goods

Když narazíme na konflikt, *zapamatujeme si*, že kombinace přiřazení, která ho způsobila, je „no-good". Při dalším prohledávání se *vyhneme* tomuto stavu.

Toto je základ moderních **CDCL** (Conflict-Driven Clause Learning) SAT solverů — kombinace backjumpingu + učení nových klauzulí. *Drasticky* mocné, dnes řeší SAT instance s miliony proměnných.

## Lokální prohledávání pro CSP

Alternativní přístup — místo *parciálního konzistentního* přiřazení pracujeme s *úplným nekonzistentním* a postupně ho zlepšujeme.

### Min-conflicts heuristic

```python
def min_conflicts(csp, max_steps):
    assignment = random_assignment(csp)
    for step in range(max_steps):
        if assignment is solution: return assignment
        X = vyber_konfliktní_proměnnou(assignment, csp)
        v = hodnota minimalizující konflikty(X, assignment, csp)
        assignment[X] = v
    return failure
```

* Připomíná **hill climbing** ([[lokalni]]).
* Pro problém N-dam funguje **úžasně** — řeší 1 000 000 dam (!) v sekundách.

### Vlastnosti

* **Online**: když se omezení *mění* (např. realtime scheduling), lze rychle adaptovat.
* **Nedokáže říct**, že řešení *neexistuje* — lokální search má jen *přibližnou* odpověď.
* **Tabu search** — uložíme `k` poslední navštívené stavy a zabráníme cyklům.
* **Constraint weighting** — omezení mají *váhy*, zvyšujeme váhu omezení, která často porušujeme.

## Strukturní pozorování

### Nezávislé sub-problémy

Pokud constraint graph **má více souvislých komponent**, řešíme každou *zvlášť*. Násobně rychlejší.

Příklad: pokud Tasmania (T) v Australia map coloring nemá žádné sousedy, řešíme zbytek mapy a Tasmanii nezávisle (Tasmania je 3-elementová doména × 1 proměnná = 3 trivials řešení).

### Strom-strukturované CSP

Polynomiálně řešitelné jak je zmíněno v [[csp-inference]]. Pro stromy stačí *jednorázový* AC-3 + topologické přiřazení.

### Cycle cutset

Když graf má *téměř-strom* strukturu, najdeme malou cycle-cutset, přiřadíme ji (`d^c` možností), zbytek řešíme polynomiálně.

## Pseudokód úplného CSP solveru

```python
def solve_csp(csp):
    csp = node_consistency(csp)            # 1) AC-1 (unární)
    csp = arc_consistency(csp)             # 2) AC-3 (binární)
    if some D_i is empty: return failure
    if all D_i singleton: return assignment from D
    return backtrack({}, csp)

def backtrack(assignment, csp):
    if complete(assignment, csp): return assignment
    X = MRV(unassigned(assignment, csp), csp)   # nejmenší doména
    for v in LCV(X, assignment, csp):           # least constraining first
        if consistent(assignment, X, v, csp):
            snapshot = csp.copy()
            assignment[X] = v
            inference_OK = MAC(csp, X)          # propagace
            if inference_OK:
                result = backtrack(assignment, csp)
                if result: return result
            del assignment[X]
            csp.restore(snapshot)
    return failure
```

Toto je *defaultní* moderní CSP solver. Reálné solvery (Choco, Gecode, Google OR-Tools) přidávají *spoustu* dalších optimalizací (specifické inference pro globální omezení, paralelní solving, restarts, RLF heuristiky).

## Klíčové vlastnosti CSP přístupu

* **Faktorizace** úlohy umožňuje *cílenou* propagaci.
* **NP-úplné v obecnosti**, ale s heuristikami často *prakticky řešitelné*.
* **Inference + prohledávání** jsou *komplementární*.
* **Globální omezení** mají *silnější* inference než binární rozklady.

::: link "AIMA, kap. 6.3: Backtracking Search for CSPs" "http://aima.cs.berkeley.edu/"
:::

::: link "AIMA, kap. 6.4: Local Search for CSPs" "http://aima.cs.berkeley.edu/"
:::

::: link "Marriott, K., Stuckey, P.: Programming with Constraints — An Introduction (MIT Press, 1998)" "https://mitpress.mit.edu/9780262133418/programming-with-constraints/"
:::

::: link "Google OR-Tools — moderní CSP solver" "https://developers.google.com/optimization"
:::

---

*Zdroj: SUI přednášky 2025/26, *Úlohy s omezujícími podmínkami* (Šůstek). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 6.3–6.4; Sabin, D. & Freuder, E. C.: *Contradicting Conventional Wisdom in Constraint Satisfaction* (CP 1994) — MAC algorithm; Marriott, K., Stuckey, P.: *Programming with Constraints* (MIT Press 1998); Dechter, R.: *Constraint Processing* (Morgan Kaufmann 2003).*
