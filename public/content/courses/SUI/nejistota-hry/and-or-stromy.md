---
title: AND-OR stromy a dynamické programování
---

# AND-OR stromy a dynamické programování

V *nedeterministických* prostředích už nestačí najít *sekvenci akcí* — musíme najít **strategii / podmíněný plán** (contingency plan): co dělat *v každé možné situaci*, do které se můžeme dostat. Jinými slovy, plán dopředu počítá s tím, že akce může dopadnout různě, a pro každý možný výsledek říká, jak pokračovat.

## Nedeterministické akce

Změna formální definice problému ([[formulace-problemu]]):

* **Přechodový model**: `RESULT(s, a) = {s₁', s₂', ..., sₙ'}` — *množina* možných nových stavů místo *jediného*. Nevíme dopředu, který se realizuje.
* **Cena akce** může záviset na novém stavu: `COST(s, a, s')`.

### Příklad — modifikovaný vysavač

Standardní vysavač má 2 pole `A, B`, akce `{L, R, Suck}`. Modifikujeme:

1. *Suck na špinavém políčku* někdy vysaje i *vedlejší*.
2. *Suck na čistém políčku* někdy pole *ušpiní*.

To znamená, že po `Suck` máme *více možných nových stavů*. Sekvence „Suck, Suck, …" nemůže garantovat řešení — potřebujeme **podmíněnou strategii**:

```
Plán: [Suck, if State = 5 then [Right, Suck] else []]
```

## AND-OR strom

Reprezentace prostoru *podmíněných* plánů:

* **OR uzly** — agent volí *jednu* akci.
* **AND uzly** — všechny možné výsledky této akce *najednou*. Musíme vyřešit *všechny*.

::: svg "AND-OR strom: OR uzel = volba akce, AND uzel = výsledek nedeterministické akce (musíme řešit pro každý)."
<svg viewBox="0 0 540 250" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <circle cx="270" cy="40" r="18"/>
    <circle cx="180" cy="110" r="14"/>
    <circle cx="360" cy="110" r="14"/>
    <rect x="100" y="170" width="28" height="28"/>
    <rect x="160" y="170" width="28" height="28"/>
    <rect x="220" y="170" width="28" height="28"/>
    <rect x="290" y="170" width="28" height="28"/>
    <rect x="350" y="170" width="28" height="28"/>
    <rect x="410" y="170" width="28" height="28"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="44" font-weight="600">OR</text>
    <text x="180" y="114">a₁</text>
    <text x="360" y="114">a₂</text>
    <text x="114" y="190" font-size="10">s'₁</text>
    <text x="174" y="190" font-size="10">s'₂</text>
    <text x="234" y="190" font-size="10">s'₃</text>
    <text x="304" y="190" font-size="10">s'₁</text>
    <text x="364" y="190" font-size="10">s'₂</text>
    <text x="424" y="190" font-size="10">s'₃</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="270" y1="58" x2="180" y2="96"/>
    <line x1="270" y1="58" x2="360" y2="96"/>
    <line x1="180" y1="124" x2="114" y2="170"/>
    <line x1="180" y1="124" x2="174" y2="170"/>
    <line x1="180" y1="124" x2="234" y2="170"/>
    <line x1="360" y1="124" x2="304" y2="170"/>
    <line x1="360" y1="124" x2="364" y2="170"/>
    <line x1="360" y1="124" x2="424" y2="170"/>
    <path d="M 165 110 A 14 14 0 0 1 195 110" stroke-width="1" fill="none" stroke-dasharray="2 2"/>
    <path d="M 345 110 A 14 14 0 0 1 375 110" stroke-width="1" fill="none" stroke-dasharray="2 2"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="170" y="140">AND</text>
    <text x="350" y="140">AND</text>
    <text x="270" y="225">Plán musí *pokrývat* všechny větve AND uzlu.</text>
  </g>
</svg>
:::

::: viz and-or-tree-plan "AND-OR strom pro nedeterministický vysavač; podmíněný plán s cyklem; AND/OR vrstvy barevně odlišené."
:::

### Vztah k deterministickému prostředí

Když jsou akce **deterministické**, *každý AND uzel má jen jeden potomek* → AND zmizí → klasický OR strom = obyčejné prohledávání.

### Algoritmus

Rekurzivní procházení:

```python
def OR_search(state, problem, path):
    if problem.goal_test(state): return []        # nic víc nedělat
    if state in path: return failure              # cyklus
    for action in problem.actions(state):
        plan = AND_search(problem.results(state, action), problem, [state] + path)
        if plan != failure:
            return [action, plan]
    return failure

def AND_search(states, problem, path):
    sub_plans = {}
    for s in states:
        plan_s = OR_search(s, problem, path)
        if plan_s == failure: return failure       # alespoň jedna větev nedostupná
        sub_plans[s] = plan_s
    return [if state s_i then sub_plans[s_i] for each s_i]
```

Algoritmus vrací **plán** ve formě podmíněné konstrukce `if state = s then [...] else [...]`.

## Dynamické programování — sdílení mezi pod-stromy

V mnoha úlohách se stejné podproblémy *opakují*. **Dynamické programování** (DP, Bellman 1957) je obecná myšlenka *spočítat každý podproblém jednou a uložit*.

### Klasický příklad — Fibonacci

::: math
F(0) = 0, \quad F(1) = 1, \quad F(n) = F(n-1) + F(n-2)
:::

Naivní rekurze:

```python
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)
```

Časová složitost `O(2^n)` — exponenciální, protože `fib(n-2)` se počítá vícekrát.

S **memoizací** (zapamatováním už spočtených výsledků, memoization) — jde o DP shora dolů:

```python
@lru_cache
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)
```

Časová složitost klesne na `O(n)`. Každé `fib(k)` se počítá jen jednou.

### DP v AND-OR

Když narazíme na *již prozkoumaný stav* `s` při AND-OR prohledávání, máme dvě možnosti:

1. **Pozitivně** — `s` už víme, že je řešitelný, *včetně* podstromu. Použijeme dříve spočtený plán pro `s`.
2. **Negativně** — `s` jsme už navštívili *na cestě* k aktuálnímu uzlu → **cyklus**. Můžeme:
   - Skončit s `failure` pro tuto větev (čistý strom).
   - Nebo, pokud opakování akce *může* změnit stav (např. nedeterministická akce), pokračovat — viz dále.

## Plán s cykly

V některých nedeterministických prostředích **musíme** povolit cykly. Příklad: vysavač s *občas selhávajícím pohybem*.

* Akce `Right` se podaří s 50% pravděpodobností; jinak vysavač zůstane stejně.
* Plán „šel jsi vpravo? Skvělé. Nešel? Zkus to znovu" = cyklus, ale s pravděpodobností 1 doběhne (`1 − 0.5^k → 0`).

Plán pak má tvar:

```
L1: Suck; Right; if State = 5 then go to L1 else Suck
```

Podmínku v `if` musí agent umět vyhodnotit *za běhu* (runtime) — k tomu potřebuje *senzory*, aby poznal, v jakém stavu se nachází. Bez senzorů máme prostředí, ve kterém agent „nic nevidí" a nemůže se rozhodovat podle aktuálního stavu (viz [[castecna-pozorovatelnost]]).

### Pravidlo pro nekonečné cykly

Pokud se akce *opakováním* **nikdy** nedostaneme do nového stavu (např. dveře *neotvírají* po 10 pokusech), je problém *nedefinován* — buď je plán nemožný, nebo musíme změnit formulaci (přidat senzory / akce navíc).

## Souvislost s plánováním

AND-OR je *zobecnění* prohledávání pro nedeterminismus. V dalších úrovních narážíme na:

* **MDP** (Markovovy rozhodovací procesy, Markov Decision Processes) — stochastické nedeterministické akce s pravděpodobnostmi. Řešením je *strategie* (policy), tedy pravidlo, které každému stavu přiřadí akci.
* **POMDP** (částečně pozorovatelný MDP, Partially Observable MDP) — agent navíc nevidí přesný stav. Řešením je strategie (policy) nad *belief stavem*, tj. nad rozdělením pravděpodobnosti přes možné stavy.

Tyto formalismy jsou ústřední pro [[rl-framework]] (zpětnovazební učení, reinforcement learning).

::: link "AIMA, kap. 4.3: Search with Nondeterministic Actions" "http://aima.cs.berkeley.edu/"
:::

::: link "Bellman, R.: Dynamic Programming (Princeton UP, 1957)" "https://press.princeton.edu/books/paperback/9780691146683/dynamic-programming"
:::

---

*Zdroj: SUI přednášky 2025/26, *Prohledávání v nejistých prostředích* (Šůstek). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 4.3–4.4; Bellman, R.: *Dynamic Programming* (Princeton 1957); Puterman, M. L.: *Markov Decision Processes* (Wiley 1994); Cormen, Leiserson, Rivest, Stein: *Introduction to Algorithms* (4. vyd., MIT 2022), kap. 14 (DP).*
