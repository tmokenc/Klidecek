---
title: Inference a propagace omezení
---

# Inference a propagace omezení

V CSP máme dvě **komplementární** techniky řešení:

1. **Prohledávání** (search) — systematické *zkoušení* hodnot (viz [[csp-prohledavani]]).
2. **Inference** — *odvozování*: zužování domén bez zkoušení, na základě omezení.

V praxi se obě kombinují: inference před a *během* prohledávání drasticky zmenšuje stavový prostor, který musí search projít.

## Hierarchie konzistence

::: svg "K-konzistence: každé K-1 přiřazení lze rozšířit na K. Hierarchie 1 ⊂ 2 ⊂ 3 ⊂ ..."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <rect x="30" y="30" width="140" height="60" rx="6"/>
    <rect x="200" y="30" width="140" height="60" rx="6"/>
    <rect x="370" y="30" width="140" height="60" rx="6"/>
    <rect x="200" y="110" width="140" height="50" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="50" font-weight="600">1-konzistence</text>
    <text x="100" y="68" font-size="10">node consistency</text>
    <text x="100" y="82" font-size="9" fill="var(--text-muted)">unární omezení</text>
    <text x="270" y="50" font-weight="600">2-konzistence</text>
    <text x="270" y="68" font-size="10">arc consistency</text>
    <text x="270" y="82" font-size="9" fill="var(--text-muted)">binární — AC-3</text>
    <text x="440" y="50" font-weight="600">3-konzistence</text>
    <text x="440" y="68" font-size="10">path consistency</text>
    <text x="440" y="82" font-size="9" fill="var(--text-muted)">ternární</text>
    <text x="270" y="128" font-weight="600">K-konzistence</text>
    <text x="270" y="146" font-size="10">obecná, silná K-konzistence pro K, K−1, K−2…</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="170" y1="60" x2="200" y2="60" marker-end="url(#arrUp)"/>
    <line x1="340" y1="60" x2="370" y2="60" marker-end="url(#arrUp)"/>
    <line x1="270" y1="90" x2="270" y2="110" marker-end="url(#arrUp)"/>
  </g>
  <defs>
    <marker id="arrUp" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

* **K-konzistence**: pro každé konzistentní přiřazení `K-1` proměnných existuje *hodnota* pro `K`-tou proměnnou, která rozšiřuje konzistentní přiřazení.
* **Silná K-konzistence**: K-konzistentní *a navíc* `K-1`, `K-2`, …, 1-konzistentní.

## 1-konzistence — Node consistency

**Doména** každé proměnné splňuje *všechna unární omezení*.

Algoritmus: triviální. Pro každé unární omezení odebereme z domény *zakázané* hodnoty.

### Příklad

`X = {X₁, X₂, X₃}`, `Dᵢ = {1, 2, 3, 4, 5}`, omezení `X₁ ≠ 3` a `X₂ = 1`.

Po node consistency:
* `D₁ = {1, 2, 4, 5}` — vyřadili jsme `3`.
* `D₂ = {1}` — zúžili na jednu hodnotu.
* `D₃ = {1, 2, 3, 4, 5}` — bez změny.

Node consistency provedeme *jednou*, na začátku.

## 2-konzistence — Arc consistency

Pro každé *binární omezení* mezi `Xᵢ` a `Xⱼ`:

> Pro každou hodnotu `v ∈ Dᵢ` *existuje* nějaká hodnota `w ∈ Dⱼ`, taková, že `(v, w)` splňuje omezení.

Pokud neexistuje, *odebereme* `v` z `Dᵢ`. Říkáme, že každá hodnota má **support** v sousední doméně.

### Algoritmus AC-3

(Mackworth 1977)

```
queue ← všechna omezení (jako pár (Xᵢ, Xⱼ))
while queue není prázdná:
    (Xᵢ, Xⱼ) = queue.pop()
    if REVISE(Xᵢ, Xⱼ):
        if Dᵢ je prázdná: return INCONSISTENT
        for each Xₖ in neighbors(Xᵢ) \ {Xⱼ}:
            queue.push((Xₖ, Xᵢ))
return CONSISTENT

REVISE(Xᵢ, Xⱼ):
    revised = False
    for each v in Dᵢ:
        if žádná hodnota w in Dⱼ neuspokojuje omezení (v, w):
            Dᵢ.remove(v)
            revised = True
    return revised
```

Po úspěšném dokončení je graf *arc-konzistentní*.

* **Časová složitost**: `O(c · d³)`, kde `c` je počet omezení, `d` velikost domény.
* **Nemusí ale stačit** — i arc-konzistentní problém může nemít řešení.

### Příklad

`X = {X₁, X₂, X₃}`, `Dᵢ = {1, 2, 3, 4, 5}`, omezení:

* `X₂ = 2 X₁`
* `X₃ = X₂ − 1`
* `Alldiff(X₁, X₂, X₃)`

Aplikujeme AC-3:

1. `X₂ = 2 X₁` pro `X₁` ∈ `{1, 2, 3, 4, 5}`: jen `X₁ ∈ {1, 2}` dává `X₂ ∈ D₂`. → `D₁ = {1, 2}`, `D₂ = {2, 4}`.
2. `X₃ = X₂ − 1`: `D₃ = {1, 3}`.
3. `Alldiff`: zkontroluje, ale neredukuje (žádná konkrétní hodnota není *vynucená*).

Konzistentní řešení pak vidíme triviálně: `X₁ = 2, X₂ = 4, X₃ = 3`.

::: viz csp-ac3 "AC-3 na Australia map-coloring; fronta arcs, pruning domén, requeue, fail propagation viditelné."
:::

## 3-konzistence — Path consistency

Slabost arc consistency: ošetří pouze *párové* omezení. **3-konzistence** požaduje:

> Pro každé konzistentní přiřazení dvou proměnných `(Xᵢ, Xⱼ)` existuje hodnota pro libovolnou třetí `Xₖ`, taková, že je celé přiřazení konzistentní.

### Příklad

`X = {X₁, X₂, X₃}`, `Dᵢ = {0, 1}`, omezení:
* `X₁ ≠ X₂`
* `X₁ ≠ X₃`
* `X₂ ≠ X₃`

(Vlastně `Alldiff(X₁, X₂, X₃)` přes binární `≠`.)

Domény mají 2 hodnoty, 3 různé proměnné — *fundamentálně* nelze najít 3 odlišné hodnoty z `{0, 1}`. Ale **arc consistency** *neodhalí* — pro každý pár `(0, 1)` nebo `(1, 0)` splňuje binární omezení. Až path consistency všimne, že žádné konzistentní *trojice* neexistuje → INCONSISTENT.

## Inference pro Alldiff

Globální omezení `Alldiff(X₁, ..., Xₙ)` dovoluje *silnější* inferenci než trivial binární rozklad.

### Hopcroft-Karp / matching algorithm

Konzistentní řešení `Alldiff` = *perfektní matching* v bipartitním grafu (proměnné × hodnoty). Použijeme klasický algoritmus matchingu v polynomiálním čase.

### Naked tuples (pro sudoku)

* **Naked single** — pole má v doméně jedinou hodnotu → tato hodnota se nepoužije *jinde* v řádku/sloupci/bloku.
* **Naked pair** — dvě pole stejného bloku mají stejnou dvojici `{a, b}` v doméně. Nikde jinde v bloku už `a` ani `b` nemohou být.
* **Naked triple** — třípolíčková analogie.

::: svg "Naked triple v sudoku: 3 pole se stejnou doménou {5,8,9}. Ostatní pole bloku tyto hodnoty mít nesmí."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--line)" stroke-width="0.7">
    <rect x="80" y="20" width="180" height="180" stroke="var(--accent)" stroke-width="1.6"/>
    <line x1="140" y1="20" x2="140" y2="200"/>
    <line x1="200" y1="20" x2="200" y2="200"/>
    <line x1="80" y1="80" x2="260" y2="80"/>
    <line x1="80" y1="140" x2="260" y2="140"/>
  </g>
  <g fill="var(--accent)" opacity="0.2">
    <rect x="80" y="20" width="60" height="60"/>
    <rect x="200" y="80" width="60" height="60"/>
    <rect x="80" y="140" width="60" height="60"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="110" y="55">{5,8,9}</text>
    <text x="170" y="55">2</text>
    <text x="230" y="55">3</text>
    <text x="110" y="115">7</text>
    <text x="170" y="115">1</text>
    <text x="230" y="115">{5,8,9}</text>
    <text x="110" y="175">{5,8,9}</text>
    <text x="170" y="175">6</text>
    <text x="230" y="175">4</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="350" y="80">Tři pole mají všechna doménu {5,8,9}.</text>
    <text x="350" y="100">Žádné jiné pole bloku už nemůže mít</text>
    <text x="350" y="120">5, 8 ani 9 — vyloučíme je z domén ostatních polí.</text>
  </g>
</svg>
:::

### Hidden tuples

* **Hidden single** — v rámci řádku/sloupce/bloku se daná hodnota `v` může objevit jen v jedné pozici → tu pozici označíme `v`.

Tyto strategie jsou pro Sudoku známé. Moderní solvery (a hlavně lidé řešící Sudoku) je používají automaticky.

## Speciální struktura — strom

**Strom-strukturovaný CSP**: constraint graph (přes binární omezení) je *strom* — žádné cykly.

* Lineární čas: `O(n · d²)`, kde `n` = počet proměnných, `d` = velikost domény.
* Algoritmus: 
  1. Topologické pořadí (kořen → listy).
  2. Postupně applikujeme **arc consistency** v opačném pořadí (listy → kořen).
  3. Přiřazení po topologickém pořadí — vždy najdeme konzistentní hodnotu.

Toto je *exponenciálně* lepší než obecné CSP.

### Převod grafu na strom

Mnohé reálné CSP mají *téměř* stromovou strukturu. Dva přístupy:

1. **Cycle cutset** — najdeme malou množinu uzlů, jejichž odebrání udělá graf stromem. Pro každé přiřazení této množiny řešíme zbytek polynomálně. Celkově `O(d^c · (n−c) · d²)` kde `c` = velikost cutsetu.
2. **Tree decomposition** — rozklad na *clustery*, mezi nimi stromová struktura. Řešitelné v `O(n · d^w)` kde `w` = velikost největšího clusteru („treewidth").

## Inference vs. prohledávání

Inference snižuje *velikost* prohledávacího prostoru. Prohledávání řeší zbytek.

| Inference | Náročnost | Co umí |
| :-- | :--: | :--: |
| Node consistency | Triviální | Unární omezení |
| Arc consistency (AC-3) | `O(cd³)` | Binární redukce |
| Path consistency | `O(cd⁴)` | Ternární |
| Globální (Alldiff matching) | `O(n^(2.5))` | Silná pro Alldiff |
| Full lookahead | Exponenciální | Vše |

V praxi se nejvíc používá **AC-3 + globální omezení**. Toto je dobrý kompromis mezi sílou inference a výpočetní cenou.

::: link "AIMA, kap. 6.2: Constraint Propagation" "http://aima.cs.berkeley.edu/"
:::

::: link "Mackworth, A. K.: Consistency in Networks of Relations (AI Journal, 1977) — původní AC algoritmy" "https://www.cs.ubc.ca/~mack/Publications/AIJ77.pdf"
:::

::: link "Régin, J.-C.: A filtering algorithm for constraints of difference in CSPs (AAAI, 1994) — Alldiff matching" "https://www.aaai.org/Papers/AAAI/1994/AAAI94-053.pdf"
:::

---

*Zdroj: SUI přednášky 2025/26, *Úlohy s omezujícími podmínkami* (Šůstek). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 6.2; Mackworth, A. K.: *Consistency in Networks of Relations* (AI Journal 8, 1977); Régin, J.-C.: *A filtering algorithm for constraints of difference in CSPs* (AAAI 1994); Dechter, R.: *Constraint Processing* (Morgan Kaufmann 2003).*
