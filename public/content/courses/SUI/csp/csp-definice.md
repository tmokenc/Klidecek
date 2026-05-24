---
title: CSP — definice a typické úlohy
---

# CSP — Constraint Satisfaction Problem

**CSP** je problém, kde *nehledáme sekvenci akcí*, ale *přiřazení hodnot* proměnným tak, aby byla splněna stanovená omezení.

* **Hledané řešení** = úplné konzistentní přiřazení.
* Nezajímá nás *cesta* k řešení.
* **Faktorizovaná reprezentace** stavu (viz [[reprezentace-stavu]]) — proměnné s explicitními doménami.

## Formální definice

CSP je trojice `⟨X, D, C⟩`:

* **`X = {X₁, X₂, ..., Xₙ}`** — *množina proměnných*.
* **`D = {D₁, D₂, ..., Dₙ}`** — *množina domén*, `Dᵢ` je doména pro `Xᵢ`.
* **`C = {C₁, C₂, ..., Cₘ}`** — *množina omezení (constraints)*. Každé omezení `Cⱼ = ⟨scope, rel⟩`:
  - `scope` — tuple proměnných, jichž se omezení týká.
  - `rel` — relace, která určuje povolené kombinace hodnot.

Relaci lze zadat:

* **Výčtem** — `⟨(X₁, X₂), {(0, 0), (1, 4), (2, 8)}⟩`.
* **Rovností / nerovností** — `X₁ < X₂`, `3 X₂ + 1 = X₃`.
* **Globálním omezením** — `Alldiff(X₁, X₂, X₃)` znamená, že proměnné mají *odlišné* hodnoty.

Kompaktní zápis pomocí *Alldiff* nahrazuje `n(n-1)/2` párových `≠`.

### Klasifikace podle arity

* **Unární omezení** — `Cⱼ = ⟨(Xᵢ), R⟩`. Týká se *jedné* proměnné. Příklad: `X₁ ≠ 3`.
* **Binární** — `⟨(Xᵢ, Xⱼ), R⟩`. *Nejdůležitější typ*. Lze vizualizovat *constraint graph* (uzly = proměnné, hrany = omezení).
* **Vyšší arita** — globální omezení (`Alldiff`, `Sum = K`).

Každé omezení vyšší arity lze *přeformulovat* na sadu binárních (zavedení pomocné proměnné), takže binární CSP je *bez újmy obecnosti*.

## Příklad — barvení mapy

Klasický příklad. Mapa Austrálie:

::: svg "Mapa Austrálie a její constraint graph: státy jako proměnné, hrany = sousedské omezení 'různá barva'."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <circle cx="120" cy="60" r="22"/>
    <circle cx="200" cy="120" r="22"/>
    <circle cx="120" cy="180" r="22"/>
    <circle cx="280" cy="60" r="22"/>
    <circle cx="350" cy="180" r="22"/>
    <circle cx="280" cy="200" r="22"/>
    <circle cx="430" cy="120" r="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="120" y="64">WA</text>
    <text x="200" y="124">SA</text>
    <text x="120" y="184">T</text>
    <text x="280" y="64">NT</text>
    <text x="280" y="204">NSW</text>
    <text x="350" y="184">V</text>
    <text x="430" y="124">Q</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.3" fill="none">
    <line x1="142" y1="60" x2="258" y2="60"/>
    <line x1="138" y1="76" x2="182" y2="104"/>
    <line x1="220" y1="120" x2="280" y2="184"/>
    <line x1="220" y1="120" x2="328" y2="170"/>
    <line x1="220" y1="120" x2="410" y2="120"/>
    <line x1="280" y1="82" x2="280" y2="178"/>
    <line x1="280" y1="82" x2="408" y2="120"/>
    <line x1="302" y1="204" x2="330" y2="196"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="270" y="226">Tasmania je *izolovaná* (žádné omezení → libovolná barva).</text>
  </g>
</svg>
:::

* **Proměnné**: `X = {WA, NT, Q, NSW, V, SA, T}` (státy Austrálie).
* **Domény**: `Dᵢ = {red, green, blue}` pro každou.
* **Omezení**: `{(SA, WA, ≠), (SA, NT, ≠), ..., (NSW, V, ≠)}` — sousední státy *různě barevné*.

Constraint graph je *plánek*. Tato úloha má `3³ · 2 · 2 · 2 = 216` možných přiřazení, ale jen *několik* splňuje všechna omezení.

## Příklad — Sudoku

* **Proměnné**: 81 políček `X₁₁, ..., X₉₉`.
* **Domény**: `Dᵢⱼ = {1, 2, ..., 9}` (nebo singleton, je-li políčko *zadané*).
* **Omezení**: 
  - 9× `Alldiff(řádek)`,
  - 9× `Alldiff(sloupec)`,
  - 9× `Alldiff(3×3 blok)`.

Tedy *27 globálních omezení* — kompaktnější než `≈ 800` binárních `≠`. Hraje to roli při *inference* ([[csp-inference]]).

## Příklad — 8 dam jako CSP

* **Proměnné**: `X₁, ..., X₈` (řádky), kde `Xᵢ` značí *sloupec* dámy v řádku `i`.
* **Domény**: `Dᵢ = {1, ..., 8}`.
* **Omezení**:
  - `Alldiff(X₁, ..., X₈)` — různé sloupce.
  - Pro každé `i < j`: `Xᵢ - Xⱼ ≠ i - j` a `Xᵢ - Xⱼ ≠ j - i` — různé diagonály.

Krásný příklad přechodu *čistého stavového prostoru* na CSP. Při zvolené reprezentaci „1 dáma na řádek" odpadá *neformulace* horizontálních konfliktů (každá dáma má svůj řádek).

## Příklad — kryptaritmetika

`SEND + MORE = MONEY`. Každý písmeno = unikátní cifra 0-9.

```
   S E N D
 + M O R E
 ---------
 M O N E Y
```

* **Proměnné**: `{S, E, N, D, M, O, R, Y}` + carry proměnné `C₁, C₂, C₃, C₄`.
* **Domény**: `Dᵢ = {0..9}`, kromě `S, M ≠ 0` (vedoucí cifry).
* **Omezení**: 
  - `Alldiff(S, E, N, D, M, O, R, Y)`.
  - `D + E = Y + 10 · C₁`, `N + R + C₁ = E + 10 · C₂`, atd.

Konečné řešení: `9 5 6 7 + 1 0 8 5 = 1 0 6 5 2`.

## Typy CSP podle struktury

### Diskrétní CSP

Domény jsou *konečné* (jako naše příklady) nebo *spočetně nekonečné* (`N`). Pro konečné: úplné prohledávání možné, ale exponenciální. Pro spočetně nekonečné: speciální algoritmy.

### Spojité CSP

Domény jsou *intervaly* v `R^D`. Pokud jsou omezení *lineární*, máme **lineární programování** — *polynomiálně* řešitelné.

### Symetrie

Mnohé CSP mají *symetrické* řešení — např. v *barvení mapy* získáme nové řešení záměnou `red ↔ blue`. Není to *fundamentálně* nové řešení.

**Symmetry-breaking constraints** odstraňují tuto redundanci:

* `NT < SA < WA` (lex. omezení) — vybereme jen jednu z `n!` permutací barev.
* `X₁ ≤ X₂ ≤ ... ≤ X_n` pro úlohy s indistinguishable proměnnými.

## Vztah k SAT a Booleovské proměnné

**SAT** (boolean satisfiability) je *speciální* případ CSP s `Dᵢ = {True, False}` a omezeními ve formě klauzulí (disjunkce literálů). Známý *NP-úplný* problém.

Každý CSP s konečnými doménami lze *redukovat* na SAT (zakódování domény bitovou reprezentací). Naopak SAT je *triviální* CSP. **Konkrétní solvers** (Gurobi, MiniSAT) využívají rozšířenou inferenci.

## Globální omezení — Alldiff

Speciální zacházení s *kompaktnějšími* formami:

* `Alldiff(X₁, ..., Xₙ)` — všechny `Xᵢ` mají *různé* hodnoty.
* `Sum(X₁, ..., Xₙ) = K` — součet daných hodnot.
* `Permutation(X₁, ..., Xₙ)` — `Xᵢ` jsou *permutace* `{1, ..., n}`.

Specializované inference (např. *Hopcroft-Karp* pro `Alldiff`) jsou silnější než trivial binární rozklady.

## NP-kompletnost

**Obecné CSP rozhodování je NP-úplné**. Některé podtřídy jsou ale řešitelné polynomiálně:

* **CSP nad stromem** — `O(n · d²)`. Klíč: topologické pořadí proměnných + arc consistency.
* **Boolean 2-SAT** — polynomiálně řešitelný.
* **Horn SAT** — polynomiálně řešitelný.

::: link "AIMA, kap. 6: Constraint Satisfaction Problems" "http://aima.cs.berkeley.edu/"
:::

::: link "Rossi, F., van Beek, P., Walsh, T. (eds.): Handbook of Constraint Programming (Elsevier, 2006)" "https://www.elsevier.com/books/handbook-of-constraint-programming/rossi/978-0-444-52726-4"
:::

---

*Zdroj: SUI přednášky 2025/26, *Úlohy s omezujícími podmínkami* (Šůstek). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 6.1–6.2; Rossi, F., van Beek, P., Walsh, T.: *Handbook of Constraint Programming* (Elsevier 2006); Tsang, E.: *Foundations of Constraint Satisfaction* (Academic Press 1993).*
