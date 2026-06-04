---
title: Amortizovaná analýza
---

# Amortizovaná analýza

Naivní analýza posloupnosti operací — *součet nejhorších případů* — bývá *přehnaně pesimistická*. Pokud je *drahá* operace *vzácná* a může nastat *jen po levných*, lze její cenu **amortizovat** přes celou posloupnost. **Amortizovaná složitost** dává *přesnou* horní mez celkové ceny *posloupnosti* operací.

## Motivační příklad: zásobník s MULTIPOP

Vezměme zásobník $S$ se třemi operacemi:

* $\mathrm{PUSH}(S, x)$ — vloží $x$, cena 1.
* $\mathrm{POP}(S)$ — odebere vrchol, cena 1 (pokud zásobník není prázdný).
* $\mathrm{MULTIPOP}(S, k)$ — odebere $\min(k, |S|)$ vrcholů.

**Naivní analýza**: $\mathrm{MULTIPOP}$ má nejhorší cenu $O(n)$. Posloupnost $n$ operací má nejhorší cenu $O(n) + O(n) + \dots = O(n \cdot n) = O(n^2)$.

Toto je *překvapivě pesimistické* — $\mathrm{MULTIPOP}$ může odebrat $n$ prvků jen pokud bylo *dříve* $n$ $\mathrm{PUSH}$ů. Tj. *celková* cena $\mathrm{MULTIPOP}$ů je *omezena* celkovým počtem $\mathrm{PUSH}$ů.

> **Cíl amortizované analýzy**: ukázat, že $n$ libovolných operací stojí celkem **$O(n)$**, nikoli $O(n^2)$.

## Tři metody amortizace

### Metoda 1: Seskupování (aggregate method)

Rozdělíme operace do *skupin* a sumujeme cenu skupin.

**Skupina 1**: $\mathrm{PUSH}$ operace. Pokud z $n$ operací je $n_1$ pushů, cena $= n_1$.

**Skupina 2**: $\mathrm{POP}$ a $\mathrm{MULTIPOP}$. *Každý odebraný prvek byl jednou pushnut* — celková cena této skupiny je *nejvýše* $n_1$ (počet pushů).

**Celková cena**: $\leq n_1 + n_1 \leq 2n$.

**Amortizovaná cena na operaci**: $\leq 2n / n = O(1)$.

### Metoda 2: Účetní (banker's method)

Každé operaci přiřadíme *kredit* (= zaplacenou částku, často víc než její *skutečnou* cenu). Rozdíl jde na *účet*. Při drahé operaci *vybíráme z účtu*.

**Pravidla**: kreditů na účtě je vždy *nezáporný* počet, jinak rozpočet "nevyšel".

Pro náš zásobník:

| Operace | Cena | Kredit |
| :--- | :-: | :-: |
| $\mathrm{PUSH}(S, x)$ | 1 | 2 |
| $\mathrm{POP}(S)$ | 1 | 0 |
| $\mathrm{MULTIPOP}(S, k)$ | $\min(k, |S|)$ | 0 |

**Intuice.** Při $\mathrm{PUSH}$ se platí "dvojnásob" — 1 kredit za samotný push, 1 kredit *na budoucí odstranění*.

**Invariant**: počet kreditů na účtě = počet prvků v $S$. Po každém pushi účet roste o 1, po každém popu/multipopu klesá o $k$ (zaplatíme každý odebraný prvek z jeho předplaceného kreditu).

**Celková cena** $n$ operací: $\leq n \cdot \max\{\text{kredit}\} = 2n = O(n)$.

### Metoda 3: Potenciálová funkce

Definujeme *potenciálovou funkci* $\Phi : \text{stavy struktury} \to \mathbb{R}_{\geq 0}$ — "potenciální energie" struktury.

* $\Phi(D_0) = 0$ (počáteční stav).
* $\Phi(D_i) \geq 0$ pro každý stav $D_i$ během běhu.

**Amortizovaná cena $i$-té operace**:

$$
a_i = c_i + \Phi(D_i) - \Phi(D_{i-1}),
$$

kde $c_i$ je skutečná cena.

**Celková amortizovaná cena**:

$$
\sum_{i=1}^n a_i = \sum_{i=1}^n c_i + \Phi(D_n) - \Phi(D_0) \geq \sum_{i=1}^n c_i.
$$

(Protože $\Phi(D_n) \geq 0 = \Phi(D_0)$.)

Tedy *amortizované součty jsou horní mez* skutečných součtů. Pokud najdeme $\Phi$ s ohraničenými $a_i$, máme horní mez celku.

**Pro zásobník**: $\Phi(S) = |S|$.

| Operace | Skutečná cena $c_i$ | $\Delta\Phi$ | Amort. cena $a_i$ |
| :--- | :-: | :-: | :-: |
| PUSH | 1 | $+1$ | 2 |
| POP | 1 | $-1$ | 0 |
| MULTIPOP$(k)$ | $\min(k, |S|)$ | $-\min(k, |S|)$ | 0 |

Amortizovaná cena $\leq 2$ na operaci. Celkem $\leq 2n$.

## Klasická aplikace: dynamicky alokovaná tabulka

**Problém**: implementovat dynamické pole, které:
* podporuje $\mathrm{INSERT}$ a $\mathrm{DELETE}$,
* automaticky *roste*, když je plné, a *zmenšuje se*, když je řídké.

**Nárazová alokace**: při zaplnění ($\alpha = 1$) alokujeme *dvojnásobně* větší pole a *přesuneme* obsah. Cena přesunu = velikost.

### Analýza vkládání

Posloupnost $n$ INSERT operací:

* Cena $i$-té operace: $c_i = 1$, *kromě* případů, kdy $i - 1$ je *mocnina 2* — pak $c_i = i$ (přesun).

$$
\sum_{i=1}^n c_i \leq n + \sum_{j=0}^{\lfloor\log_2 n\rfloor} 2^j \leq n + 2n = 3n.
$$

**Amortizovaná cena INSERT**: $3n / n = 3 = O(1)$.

### Účetní analýza INSERT

Každý INSERT *předplatí 3 kredity*:
* 1 kredit zaplatí samotný insert.
* 1 kredit zůstane na účtě "pro přesun *tohoto prvku* v budoucí re-alokaci".
* 1 kredit zůstane na účtě "pro přesun *jiného prvku* (který nemá vlastní kredit)".

**Invariant**: po každé re-alokaci na velikost $m$ má účet $m$ kreditů (na pokrytí budoucího přesunu, až se tabulka znovu zaplní).

### S deletion

Pokud po DELETE klesne $\alpha(T) \leq 0.5$, alokujeme *poloviční* tabulku a přesouváme. Naivní analýza dává $\Theta(n^2)$ pro střídavé operace okolo $\alpha = 0.5$.

**Trik**: re-alokace na *zmenšení* jen když $\alpha \leq 0.25$. Pak je nejmenší stará tabulka "půlplná" před zmenšením, a do dalšího zmenšení musí dojít k odebrání aspoň $|S|/2$ prvků. Tato strategie dává $O(1)$ amortizovanou cenu.

## Aplikace v praxi {tier=practice}

* **Dynamické pole** v knihovnách (C++ `std::vector`, Python `list`, Java `ArrayList`): amortizovaný $O(1)$ insert.
* **Disjoint Set Union** (Union-Find): operace `find` a `union` mají amortizovanou cenu $O(\alpha(n))$ (inverzní Ackermann, prakticky konstantní).
* **Splay tree**: amortizovaný $O(\log n)$ na operaci.
* **Fibonacciho halda**: amortizovaný $O(1)$ na decreaseKey, $O(\log n)$ na deleteMin.

## Hlubší příklad: trie s "prune" {tier=example}

Trie reprezentuje *množinu řetězců* nad abecedou $\Sigma$:
* Kořen + vnitřní uzly se symbolem ze $\Sigma$ → potomek.
* Listy reprezentují konce slov.

**Operace `prune(x)`** odstraní z trie všechny prefixy začínající $x$ — *projde* podstrom a smaže ho.

```
operation: insert(s)        cost: |s| + 1
operation: prune(x)         cost: počet odstraněných prvků + 1
```

Naivní analýza: $\mathrm{prune}$ může smazat *velkou* část trie najednou.

**Účetní analýza**: každý $\mathrm{insert}(s)$ předplatí $5 \cdot |s|$ kreditů (každý vkládaný prvek + jeho odstranění + cena testu). Posloupnost $n$ inserts má celkovou cenu $\leq 5 \cdot \sum |s| = O(\text{total size})$.

Pro $\mathrm{prune}$: amortizovaná cena = 1, protože 1 kredit zaplatí test ukončení (smyčka), zatímco každý odstraněný prvek je *předplacen* z kreditu zapsaného při insertu.

## Hierarchie analýz

::: math
\text{nejhorší případ na operaci} \;\geq\; \text{amortizovaná složitost} \;\geq\; \text{průměrná složitost}.
:::

Vlevo: pesimistický pohled per-operation. Vpravo: pravděpodobnostní pohled (potřebuje rozdělení vstupů). Uprostřed: *deterministická garance* na *celý sekvenci*.

> Amortizovaná analýza je *silnější* než průměrný případ — *žádný* worst-case scénář nemůže porušit hranici, ne jen "typický" vstup.

## Co amortizovaná analýza NENÍ

* **Není to průměr přes operace.** Amortizovaná cena je *horní mez* (jakou nikdy nepřesáhneme), ne *typická* cena.
* **Není to randomizace.** Žádná pravděpodobnost.
* **Není to per-call.** Konkrétní operace může být *drahá* (např. realokace), ale *amortizace* zaručuje, že *zaplatíme* za ni levné operace.

## Souvislost s teorií složitosti

Amortizovaná analýza poskytuje *přesnější* horní meze pro algoritmy, které by se podle naivní analýzy zařadily do *vyšší* třídy složitosti. Příklad: union-find by naivně mohl mít $O(\log n)$ per operation, ale s path-compression a union-by-rank má amortizovaný $O(\alpha(n))$ — *prakticky* $O(1)$.

To umožňuje *redukovat* některé algoritmy do třídy P, které by jinak vypadaly jako *quasilineární*.

[[asymptotika-rekurence]], [[grafy-prochazeni]] a [[cyk-parsing]] používaly *jednorázové* analýzy. Amortizovaná je *generalizace* na sekvenci operací.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Tarjan, R.E.: *Amortized Computational Complexity* (SIAM J. Alg. Disc. Methods, 1985); Sleator, D.D., Tarjan, R.E.: *Self-Adjusting Binary Search Trees* (J. ACM, 1985) — Splay trees; Fredman, M.L., Tarjan, R.E.: *Fibonacci Heaps and Their Uses in Improved Network Optimization Algorithms* (J. ACM, 1987); Cormen, T.H. et al.: *Introduction to Algorithms (CLRS)* (3rd ed., MIT Press 2009), kap. 17.*
