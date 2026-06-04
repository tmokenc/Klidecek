---
title: Procházení grafů — BFS, DFS, silně souvislé komponenty
---

# Algoritmy nad grafy

Grafy jsou základní strukturou pro modelování *vztahů* — sítě, závislosti, syntaxe. Tato kapitola popisuje *kanonické* algoritmy pro průchod grafy a rozklad na silně souvislé komponenty.

## Reprezentace grafů

**Graf** $G = (V, E)$, kde $V$ je množina *vrcholů* a $E$ je množina *hran*.

* **Neorientovaný graf**: $E = \{\{u, v\} \mid u, v \in V, u \neq v\}$ — neuspořádané dvojice.
* **Orientovaný graf**: $E = \{(u, v) \mid u, v \in V\}$ — uspořádané dvojice.

| Reprezentace | Prostor | Dotaz na hranu | Vrať následníky $u$ |
| :--- | :-: | :-: | :-: |
| Seznam hran | $O(|E|)$ | $O(|E|)$ | $O(|E|)$ |
| Matice sousednosti | $O(|V|^2)$ | $O(1)$ | $O(|V|)$ |
| Seznam následníků | $O(|V| + |E|)$ | $O(\deg(u))$ | $O(\deg(u))$ |
| Množina následníků | $O(|V| + |E|)$ | $O(\log \deg(u))$ nebo $O(1)$ hash | $O(\deg(u))$ |

V praxi se nejčastěji používá *seznam následníků* — kompaktní pro řídké grafy, efektivní pro iteraci.

## Souvislost: naivní vs. optimální

**Problém.** Je daný neorientovaný graf $G$ *souvislý*? Tj. mezi každými dvěma vrcholy existuje cesta?

### Naivní algoritmus — $O(|V| \cdot |E|)$

```
s := randomNode(G)
reach := {s}
new := true
while new:
    new := false
    foreach {u, v} ∈ E:
        if |{u, v} ∩ reach| = 1:
            reach := reach ∪ {u, v}
            new := true
return V = reach
```

Každá iterace `while` projde *všechny hrany*, expanduje `reach` o aspoň jeden vrchol. Maximálně $|V|$ iterací — $O(|V| \cdot |E|)$.

### Asymptoticky optimální — BFS, $O(|V| + |E|)$

```
foreach v ∈ V: v.visited := false
s := randomNode(G)
s.visited := true
reach := {s}
Q.enqueue(s)
while Q.notEmpty():
    v := Q.dequeue()
    foreach u ∈ Adj(v):
        if !u.visited:
            u.visited := true
            reach := reach ∪ {u}
            Q.enqueue(u)
return V = reach
```

Každý vrchol se přidá do fronty *nejvýše jednou*. Pro každý vrchol projdeme *všechny jeho sousední hrany*, celkem $\sum_v \deg(v) = 2|E|$ kroků. Plus inicializace $|V|$ vrcholů. Celkem $O(|V| + |E|)$.

::: viz bfs "BFS z různých zdrojů; sledujte, jak se expanduje vlna od počátku."
:::

> Asymptoticky optimální algoritmus pracuje *lineárně* ve velikosti grafu (vrcholy + hrany). Naivní je *kvadratický* v hranách, což může být pro hustý graf $O(|V|^3)$ — řád horší.

## DFS a klasifikace hran

**Depth-First Search** (DFS) je *rekurzivní* alternativa k BFS:

```
foreach v ∈ V: v.visited := false; v.time := 0
time := 0
foreach v ∈ V:
    if !v.visited:
        DFS-visit(v)

procedure DFS-visit(v):
    v.visited := true
    time := time + 1; v.discoveryTime := time
    foreach u ∈ Adj(v):
        if !u.visited:
            DFS-visit(u)
    time := time + 1; v.finishTime := time
```

DFS *přiřazuje časy objevení a dokončení* každému vrcholu. Pro každý vrchol:
* `v.discoveryTime` — kdy jsme ho poprvé navštívili,
* `v.finishTime` — kdy jsme dokončili zpracování všech jeho potomků.

Časy splňují *nest property*: časový interval $[v.\text{disc}, v.\text{fin}]$ je buď *disjunktní* od intervalu jiného vrcholu, nebo *jeden obsahuje druhý*.

Hrany v orientovaném grafu se klasifikují podle vztahu časů:

| Typ hrany $(u, v)$ | Charakteristika |
| :--- | :--- |
| Stromová (tree) | $u$ je předkem $v$ v DFS-stromu |
| Zpětná (back) | $v$ je předkem $u$ — *cyklus*! |
| Dopředná (forward) | $u$ je předkem $v$, ale ne stromový |
| Křížová (cross) | Mezi různými podstromy |

> Existence *zpětné hrany* je *nutnou a postačující* podmínkou pro *cyklus* v orientovaném grafu.

## Silně souvislé komponenty (SCC)

**Definice.** *Silně souvislá komponenta* orientovaného grafu je maximální podmnožina vrcholů, *mezi kterými existuje cesta v obou směrech*.

**Příklad**: v grafu $a \to b \to c \to a, d \to a, d$ jsou dvě SCC: $\{a, b, c\}$ a $\{d\}$.

### Naivní algoritmus — $O((|V| + |E|) \cdot |V|)$

```
SCCs := ∅
visited := ∅
foreach v ∈ V:
    if v ∉ visited:
        forward := BFS-from(v)        // dosažitelné z v
        backward := BFS-to(v)         // ze kterých lze dojít k v
        scc := forward ∩ backward
        SCCs := SCCs ∪ {scc}
        visited := visited ∪ scc
return SCCs
```

Pro každý vrchol provádíme *dvě BFS* — $O((|V| + |E|))$ na vrchol, celkem $O(|V|(|V| + |E|))$.

### Tarjanův algoritmus — $O(|V| + |E|)$

Robert Tarjan (1972) navrhl *jediný průchod* DFS s pomocnou strukturou:

* `v.low` — *nejnižší disc-time* dosažitelný z $v$ přes stromové hrany a *jednu* zpětnou hranu.
* Zásobník vrcholů, které ještě nejsou v žádné SCC.

```
time := 0; stack := empty; SCCs := ∅
foreach v ∈ V:
    if v.disc = 0:
        Tarjan-visit(v)

procedure Tarjan-visit(v):
    time := time + 1
    v.disc := time; v.low := time
    push v onto stack
    foreach u ∈ Adj(v):
        if u.disc = 0:
            Tarjan-visit(u)
            v.low := min(v.low, u.low)
        else if u ∈ stack:
            v.low := min(v.low, u.disc)
    if v.low = v.disc:
        // v je "kořen" SCC; vyber všechny vrcholy nad ním ze zásobníku
        scc := ∅
        repeat:
            u := pop stack
            scc := scc ∪ {u}
        until u = v
        SCCs := SCCs ∪ {scc}
```

**Korektnost.** `v.low = v.disc` znamená, že žádný předek $v$ v DFS-stromu není dosažitelný z $v$ — tedy $v$ je *kořen své SCC*. Zásobník obsahuje *všechny vrcholy aktuálně rozpracované SCC*.

**Cena.** Každý vrchol je *jednou* pushovaný a *jednou* popovaný ze zásobníku. Každá hrana je *jednou* zkoumaná. Celkem $O(|V| + |E|)$.

::: svg "Tarjanův algoritmus: stromové hrany pevně, zpětné hrany se updatují v.low"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aTar" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="100" cy="60" r="18"/>
    <circle cx="220" cy="60" r="18"/>
    <circle cx="340" cy="60" r="18"/>
    <circle cx="100" cy="160" r="18"/>
    <circle cx="220" cy="160" r="18"/>
    <circle cx="340" cy="160" r="18"/>
    <circle cx="460" cy="100" r="18"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle">
    <text x="100" y="64">A</text>
    <text x="220" y="64">B</text>
    <text x="340" y="64">C</text>
    <text x="100" y="164">D</text>
    <text x="220" y="164">E</text>
    <text x="340" y="164">F</text>
    <text x="460" y="104">G</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" marker-end="url(#aTar)">
    <line x1="118" y1="60" x2="202" y2="60"/>
    <line x1="238" y1="60" x2="322" y2="60"/>
    <line x1="100" y1="78" x2="100" y2="142"/>
    <line x1="220" y1="78" x2="220" y2="142"/>
    <line x1="118" y1="160" x2="202" y2="160"/>
    <line x1="238" y1="160" x2="322" y2="160"/>
    <line x1="356" y1="74" x2="448" y2="92"/>
    <line x1="356" y1="152" x2="444" y2="108"/>
    <line x1="442" y1="103" x2="118" y2="157"/>
  </g>
  <g stroke="var(--text-muted)" stroke-width="0.8" stroke-dasharray="3 3" fill="none" marker-end="url(#aTar)">
    <line x1="320" y1="60" x2="120" y2="60"/>
  </g>
  <text x="220" y="40" fill="var(--text-muted)" font-size="10">zpětná hrana C → A</text>
  <text x="430" y="180" fill="var(--accent)" font-size="10">SCC{A,B,C}</text>
  <text x="430" y="195" fill="var(--accent)" font-size="10">SCC{D,E,F,G}</text>
</svg>
:::

## Dosažitelnost a kondenzace

Z SCC vytvoříme **kondenzační graf** $G' = (V', E')$:
* $V' = $ množina SCC.
* $E' = \{(S, S') \mid \exists u \in S, v \in S': (u, v) \in E\}$.

**Lemma.** Kondenzační graf je *acyklický* (DAG).

Z toho plyne, že každý orientovaný graf lze rozložit na *strukturu SCC propojených v DAG*. To umožňuje:
* **Topologické řazení** SCC (= "úrovně" závislostí).
* **Reachability**: $u$ dosažitelný z $v$ ⟺ SCC obsahující $u$ je dosažitelná ze SCC obsahující $v$ v DAG.

## Aplikace {tier=practice}

| Algoritmus | Aplikace |
| :--- | :--- |
| BFS | Nejkratší cesta v *neváženém* grafu, krokování zdroje signálu |
| DFS | Topologické řazení, detekce cyklu, klasifikace hran |
| Tarjan SCC | Detekce *kruhových závislostí* (compiler, build system), 2-SAT |
| **Dijkstra** | Nejkratší cesta v *váženém* grafu s nezápornými váhami |
| **Bellman-Ford** | Nejkratší cesta i se zápornými váhami |
| **Floyd-Warshall** | Všechny páry nejkratších cest, $O(|V|^3)$ |

## 2-SAT přes SCC

Klasická aplikace Tarjanova algoritmu: rozhodování **2-SAT** v lineárním čase.

Z formule v 2-CNF $\Phi$ sestavíme **implikační graf** $G_\Phi$:
* Vrcholy: literály $x$ a $\neg x$ pro každou proměnnou.
* Hrana $a \to b$ pro každou klauzuli $\neg a \lor b$.

**Lemma.** $\Phi$ je nesplnitelná ⟺ existuje proměnná $x$ taková, že $x$ a $\neg x$ jsou *v téže SCC*.

Pomocí Tarjana spočítáme SCC v $O(V + E)$ a ověříme kritérium.

> Klasický příklad: bezkontextová úloha (3-SAT je NP-úplný — [[cook-levin]]) a "snazší" verze (2-SAT je v P) se liší *jen jedním literálem* v klauzulích — ale jejich složitosti jsou v *opačných koncích* spektra.

[[cyk-parsing]] aplikuje techniky dynamického programování na úlohu testování členství v bezkontextovém jazyce.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=VMQghxb5aSk" "SZZ: Prohledávání grafů do hloubky a jeho aplikace" "Tomáš Kocourek"
:::

::: youtube "https://www.youtube.com/watch?v=i9xUB0qRs2U" "SZZ: Grafy a jejich prohledávání do šířky" "Tomáš Kocourek"
:::

::: youtube "https://www.youtube.com/watch?v=oDqjPvD54Ss" "Breadth First Search Algorithm | Shortest Path | Graph Theory" "WilliamFiset"
:::

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Tarjan, R.E.: *Depth-First Search and Linear Graph Algorithms* (SIAM J. Comput., 1972); Cormen, T.H. et al.: *Introduction to Algorithms (CLRS)* (3rd ed., MIT Press 2009), kap. 22; Aspvall, B., Plass, M.F., Tarjan, R.E.: *A Linear-Time Algorithm for Testing the Truth of Certain Quantified Boolean Formulas* (IPL, 1979) — 2-SAT přes SCC.*
