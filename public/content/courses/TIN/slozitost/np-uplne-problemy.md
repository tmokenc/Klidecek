---
title: Klasické NP-úplné problémy
---

# Klasické NP-úplné problémy

[[cook-levin]] dokázal NP-úplnost **SAT** a **3-SAT**. Tato kapitola probírá *paletu klasických NP-úplných problémů* a jejich vzájemné redukce. Jde o praktickou kostru — když se setkáme s úlohou připomínající některý z nich, je dobré *předpokládat* NP-úplnost a hledat redukci.

## CLIQUE — klika v grafu

**Problém.** Daný neorientovaný graf $G = (V, E)$ a číslo $k$. Existuje **$k$-klika** v $G$ — podmnožina $V' \subseteq V$ velikosti $k$ taková, že každé dva vrcholy $V'$ jsou spojené hranou?

$$
L_\mathrm{CLIQUE} = \{\langle G, k\rangle \mid G \text{ obsahuje } k\text{-kliku}\}.
$$

**CLIQUE je v NP**: NTS uhádne $k$ vrcholů, ověří, že každá dvojice je spojená hranou — polynomiálně.

**Věta.** CLIQUE je NP-úplný.

## Redukce 3-SAT $\leq^m_P$ CLIQUE

**Klíčová idea**: ke splnitelné formuli vytvoříme graf, kde *splnitelné přiřazení* odpovídá *klice*.

**Konstrukce.** Mějme 3-SAT formuli $F = C_1 \land C_2 \land \dots \land C_k$, kde $C_i = \ell^1_i \lor \ell^2_i \lor \ell^3_i$.

Sestavíme graf $G_F = (V_F, E_F)$:

* **Vrcholy** $V_F = \{\ell^j_i \mid 1 \leq i \leq k, 1 \leq j \leq 3\}$ — pro každý literál v každé klauzuli jeden vrchol. Tedy $|V_F| = 3k$.
* **Hrany** $E_F = \{\{\ell^j_i, \ell^{j'}_{i'}\} \mid i \neq i' \land \ell^j_i \neq \neg \ell^{j'}_{i'}\}$ — spojíme dva vrcholy, pokud jsou *v různých klauzulích* a *nejsou konfliktní* (jeden není negací druhého).

::: svg "Redukce 3-SAT na CLIQUE: formule (x∨y∨z)∧(¬x∨y∨¬z)∧(x∨¬y∨z) → graf"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="10.5">
  <defs>
    <marker id="aCl" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="100" cy="60" r="14"/>
    <circle cx="160" cy="40" r="14"/>
    <circle cx="220" cy="60" r="14"/>
    <circle cx="100" cy="180" r="14"/>
    <circle cx="160" cy="200" r="14"/>
    <circle cx="220" cy="180" r="14"/>
    <circle cx="380" cy="60" r="14"/>
    <circle cx="440" cy="40" r="14"/>
    <circle cx="500" cy="60" r="14"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="10">
    <text x="100" y="64">x</text>
    <text x="160" y="44">y</text>
    <text x="220" y="64">z</text>
    <text x="100" y="184">¬x</text>
    <text x="160" y="204">y</text>
    <text x="220" y="184">¬z</text>
    <text x="380" y="64">x</text>
    <text x="440" y="44">¬y</text>
    <text x="500" y="64">z</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1" fill="none">
    <line x1="100" y1="74" x2="100" y2="166"/>
    <line x1="160" y1="54" x2="160" y2="186"/>
    <line x1="220" y1="74" x2="220" y2="166"/>
    <line x1="220" y1="60" x2="378" y2="60"/>
    <line x1="160" y1="200" x2="440" y2="54"/>
  </g>
  <text x="50" y="20" fill="var(--text-muted)" font-size="10">C₁: (x ∨ y ∨ z)</text>
  <text x="50" y="225" fill="var(--text-muted)" font-size="10">C₂: (¬x ∨ y ∨ ¬z)</text>
  <text x="380" y="100" fill="var(--text-muted)" font-size="10">C₃: (x ∨ ¬y ∨ z)</text>
  <text x="270" y="15" text-anchor="middle" fill="var(--accent)" font-size="10.5">Hrana = nekonflikt + různé klauzule</text>
</svg>
:::

**Korektnost.**

* (⇒) Pokud je $F$ splnitelná, pro každé $C_i$ existuje *aspoň jeden* splněný literál. Vyberme jeden takový literál na klauzuli, dostaneme $k$ vrcholů, žádné dva navzájem konfliktní (jsou z různých klauzulí a všechny splňují přiřazení). Tvoří *kliku* velikosti $k$.

* (⇐) Pokud existuje $k$-klika, musí mít *právě jeden vrchol z každé klauzule* (uvnitř jedné klauzule jsou vrcholy *nepropojené*). Vybrané literály jsou *všechny současně splnitelné* → splnitelnost $F$.

**Polynomiální čas.** $|V_F| = 3k$, $|E_F| \leq |V_F|^2$. Konstrukce probíhá $O(k^2)$.

::: viz sat-clique "Vyber 3-CNF formuli a uvidíš zkonstruovaný graf (3 vrcholy na klauzuli, hrany mezi nekonflikními literály z různých klauzulí). Viz automaticky najde k-kliku (nebo prokáže její neexistenci) a odvodí přiřazení proměnných."
:::

## Další klasické problémy

Z 3-SAT a CLIQUE se redukcí dokazují další NP-úplné problémy:

### Vertex Cover

**Problém**: má graf $G$ *vrcholové pokrytí* velikosti $k$ — podmnožinu $V' \subseteq V$ velikosti $k$ takovou, že každá hrana má alespoň jeden konec v $V'$?

**Redukce CLIQUE $\leq^m_P$ Vertex Cover**: $G$ má $k$-kliku ⟺ doplňkový graf $\overline{G}$ má $(|V| - k)$-vrcholové pokrytí.

### Independent Set

**Problém**: má graf $G$ *nezávislou množinu* velikosti $k$ — vrcholy bez vzájemných hran?

**Redukce CLIQUE $\leq^m_P$ Independent Set**: $G$ má $k$-kliku ⟺ doplňkový $\overline{G}$ má $k$-nezávislou množinu.

### Hamilton Cycle

**Problém**: má graf $G$ *Hamiltonovský cyklus* — cyklus procházející každým vrcholem právě jednou?

**Důkaz NP-úplnosti**: redukce z 3-SAT pomocí *gadgetů* (Garey-Johnson 1979). Jde o nejnetriviálnější klasickou redukci.

### TSP — Traveling Salesman Problem

**Problém**: dán úplný graf s váhami hran $w : E \to \mathbb{N}$, číslo $K$. Existuje hamiltonovský cyklus s celkovou váhou $\leq K$?

**Redukce Hamilton Cycle $\leq^m_P$ TSP**: hrany v $G$ s váhou 1, ostatní s váhou 2. Hamiltonovský cyklus váhy $\leq |V|$ existuje ⟺ $G$ má hamiltonovský cyklus.

### Subset Sum

**Problém**: dána množina kladných celých čísel $S = \{s_1, \dots, s_n\}$ a cíl $T$. Existuje podmnožina, jejíž součet je *přesně* $T$?

**Redukce 3-SAT $\leq^m_P$ Subset Sum**: kódování proměnných a klauzulí v dekadické soustavě s $n + k$ ciframi.

### Partition

**Problém**: dán $S = \{s_1, \dots, s_n\}$. Lze rozdělit na dvě podmnožiny se *stejným součtem*?

**Redukce Subset Sum $\leq^m_P$ Partition** (triviální): pro Subset Sum s cílem $T$ přidáme prvek $|2T - \text{sum}(S)|$.

### 3-Colorability

**Problém**: lze obarvit vrcholy $G$ třemi barvami tak, aby žádné dva sousední vrcholy neměly stejnou barvu?

**Důkaz**: redukce z 3-SAT pomocí gadgetů (Lovász).

### Set Cover

**Problém**: dány množiny $S_1, S_2, \dots, S_n$ a univerzum $U = \bigcup S_i$, číslo $k$. Existuje $k$ množin pokrývajících $U$?

**Důkaz**: redukce z Vertex Cover.

## Vzájemné redukce — schéma

::: svg "Klasické redukce mezi NP-úplnými problémy (Karp 1972)"
<svg viewBox="0 0 540 260" font-family="ui-sans-serif, system-ui" font-size="10.5">
  <defs>
    <marker id="aRed3" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="220" y="10" width="100" height="32" rx="6"/>
    <rect x="220" y="60" width="100" height="32" rx="6"/>
    <rect x="40" y="120" width="120" height="32" rx="6"/>
    <rect x="220" y="120" width="100" height="32" rx="6"/>
    <rect x="380" y="120" width="100" height="32" rx="6"/>
    <rect x="40" y="180" width="120" height="32" rx="6"/>
    <rect x="220" y="180" width="100" height="32" rx="6"/>
    <rect x="380" y="180" width="100" height="32" rx="6"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="11">
    <text x="270" y="30">SAT</text>
    <text x="270" y="80">3-SAT</text>
    <text x="100" y="140">VERTEX COVER</text>
    <text x="270" y="140">CLIQUE</text>
    <text x="430" y="140">HAM. CYCLE</text>
    <text x="100" y="200">SET COVER</text>
    <text x="270" y="200">INDEP. SET</text>
    <text x="430" y="200">TSP</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aRed3)">
    <line x1="270" y1="42" x2="270" y2="60"/>
    <line x1="270" y1="92" x2="270" y2="120"/>
    <line x1="270" y1="92" x2="430" y2="120"/>
    <line x1="270" y1="140" x2="160" y2="140"/>
    <line x1="270" y1="152" x2="270" y2="180"/>
    <line x1="160" y1="152" x2="100" y2="180"/>
    <line x1="430" y1="152" x2="430" y2="180"/>
  </g>
  <text x="270" y="240" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">Šipka A → B znamená "A se polynomiálně redukuje na B".</text>
</svg>
:::

## Tříděné problémy z různých oblastí {tier=extra}

NP-úplnost se vyskytuje *všude* v informatice:

### Logika

* **SAT, 3-SAT** — splnitelnost CNF.
* **QBF** (kvantifikovaná booleova formule) — *PSPACE-úplný*.

### Teorie grafů

* **CLIQUE, Vertex Cover, Independent Set, Dominating Set**.
* **Hamilton Cycle/Path, TSP**.
* **Coloring, Max Cut**.
* **Steiner Tree**.

### Plánování

* **Job Scheduling** s deadlines.
* **Bin Packing**.
* **Knapsack** — 0/1 batoh, pseudo-polynomiální DP.

### Kombinatorika

* **Subset Sum, Partition, 3-Partition**.
* **Set Cover, Exact Cover (X3C)**.

### Programátorské problémy

* **Compiler register allocation** ≡ graph coloring.
* **VLSI layout problems**.
* **Database query optimization** (specifické verze).
* **Sudoku, Cross-puzzle, Tetris** (generalizované na $n$).

## Co dělat s NP-úplnými problémy v praxi {tier=practice}

Když narazíme na NP-úplný problém *v reálné aplikaci*, máme možnosti:

1. **Spokojit se s aproximací** — *aproximační algoritmy* dávají řešení v garantovaném poměru k optimu. Příklad: Vertex Cover má *2-aproximaci* (greedy: vyber libovolnou hranu, přidej oba konce do pokrytí; opakuj). Některé problémy jsou *PTAS* (libovolně blízko optima), jiné mají *neaproximovatelnost* (např. CLIQUE pod $n^{1-\varepsilon}$ není aproximovatelná, pokud $P \neq NP$).

2. **Pravděpodobnostní algoritmy** — randomizace často dává *průměrný* polynomiální čas i pro NP-těžké problémy (např. simulované žíhání, genetické algoritmy).

3. **Heuristiky** — bez teoretické garance, ale prakticky rychlé (např. branch-and-bound, lokální vyhledávání).

4. **Speciální případy** — pokud má vstup *strukturu* (stromová šířka, planarita, řídkost), často existují polynomiální algoritmy. Příklad: SAT na 2-CNF je v $\mathrm{P}$, na *horn-klausulích* taky.

5. **Parametrizovaná složitost** — fixujeme parametr $k$ a hledáme algoritmy $O(f(k) \cdot n^{O(1)})$ (tzv. FPT — *fixed-parameter tractable*). Vertex Cover je FPT s $k$ jako velikostí pokrytí.

## NP-úplnost vs. NP-těžkost

* **NP-úplný** = je v NP *a* je NP-těžký.
* **NP-těžký** = NP problémy se na něj redukují, ale problém *nemusí být v NP*. Např. *optimization* verze TSP (najdi nejkratší cyklus) je NP-těžká, ale ne v NP — nelze ji formulovat jako rozhodovací problém s krátkým certifikátem.

V důkazu NP-těžkosti **nemusíme** ukazovat členství v NP. Tj. NP-těžkost je *slabší* tvrzení než NP-úplnost.

NP-úplnost slouží jako **standardní důkaz nemožnosti rychlého algoritmu** — pokud problém je NP-úplný, nepokoušíme se najít polynomiální řešení (aniž bychom dokázali $\mathrm{P} = \mathrm{NP}$), ale obracíme se k aproximacím, heuristikám nebo speciálním případům.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=lz4UNeNWM-Q" "Teoretická informatika: Složitost" "Tomáš Kocourek"
:::

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Karp, R.M.: *Reducibility Among Combinatorial Problems* (Plenum, 1972); Garey, M.R., Johnson, D.S.: *Computers and Intractability* (Freeman, 1979); Vazirani, V.: *Approximation Algorithms* (Springer, 2003); Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), §7.5; Arora, S., Barak, B.: *Computational Complexity* (Cambridge 2009), kap. 2.7.*
