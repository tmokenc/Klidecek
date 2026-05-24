---
title: Value iteration a policy iteration
---

# Value iteration a policy iteration

Pro výpočet optimální hodnotové funkce `V*` a optimální politiky `σ*` v MDP existují dva klasické algoritmy: **value iteration** (VI) a **policy iteration** (PI). Oba konvergují k optimu, ale liší se v *typu* iterace (hodnoty vs. politiky) a v praktických trade-offech.

## Value iteration

Idea: opakovaně aplikuj Bellmanův optimální operátor `T` na odhad hodnotové funkce.

```
V⁰(s) = 0 pro každé s                   # nebo jiný start
opakuj:
    pro každé s ∈ S:
        Vᵏ⁺¹(s) ← maxₐ [ r(s, a) + γ · Σₛ' P(s, a, s') · Vᵏ(s') ]
    dokud ||Vᵏ⁺¹ − Vᵏ||∞ < ε
vrať σ*(s) = argmax_a [ r(s, a) + γ · Σ P(s, a, s') · Vᵏ⁺¹(s') ]
```

### Vlastnosti

* **Konvergence**: kontrahující operátor s konstantou `γ < 1` ⇒ `||Vᵏ − V*||∞ ≤ γᵏ ||V⁰ − V*||∞` (geometrická konvergence).
* **Iterační složitost**: 1 iterace = `O(|S|² · |Act|)` (pro každý stav a akci: jeden sumace přes následníky).
* **Počet iterací do `ε`-přesnosti**: `O(log(1/ε) / log(1/γ))`.
* **Zastavovací kritérium**: jakmile `||Vᵏ⁺¹ − Vᵏ||∞ < ε(1 − γ)/(2γ)`, jsme `ε`-přesní v hodnotě.

### Synchronní vs. asynchronní VI

* **Synchronní** — všech `|S|` aktualizací probíhá s *jedním* `Vᵏ`, výsledky se zapisují do `Vᵏ⁺¹` až na konci. Jednoduché, paralelizovatelné.
* **Asynchronní** (Gauss-Seidel) — aktualizace se zapisují *in-place*, takže pozdější stavy v iteraci už používají novější hodnoty. Konverguje *rychleji*, ale není symetricky paralelizovatelné.

### Pro reachability (γ = 1)

Bellmanův operátor není striktně kontrahující, ale konverguje *monotónně* (z dolní inicializace `V⁰ = 0`):

```
V⁰(s) = 0 pro s ∉ T,  V⁰(s) = 1 pro s ∈ T
Vᵏ⁺¹(s) = maxₐ Σ P(s, a, s') · Vᵏ(s')
```

Konvergence není garantovaně v konstantním počtu kroků; v praxi se používá *stopping criterion* na *přesnost* (`Vᵏ⁺¹ − Vᵏ < ε`) nebo *upper-lower bounding* (interval iteration).

## Policy iteration

Idea: střídej *vyhodnocení* (policy evaluation) a *zlepšení* (policy improvement) politiky.

```
σ⁰ libovolná deterministická bezpaměťová politika
opakuj:
    # 1. Policy evaluation — vyřeš (I − γ P^σ) V^σ = r^σ
    spočítej V^{σᵏ}(s) pro každé s
    # 2. Policy improvement — pro každé s zvol nejlepší akci vůči V^{σᵏ}
    σᵏ⁺¹(s) ← argmax_a [ r(s, a) + γ Σ P(s, a, s') V^{σᵏ}(s') ]
    pokud σᵏ⁺¹ = σᵏ: stop, vrať σᵏ
```

### Vlastnosti

* **Konečná konvergence**: pro konečný MDP končí v *nejvýše* `|Act|^|S|` iteracích (počet různých politik je konečný a hodnota se v každé iteraci striktně zlepší, dokud nenastane optimum).
* **V praxi**: PI typicky končí *mnohem rychleji* než VI — typicky `10–50` iterací na úlohy, kde VI potřebuje `1000+`.
* **Nákladnost jedné iterace**: `O(|S|³)` (řešení lineárního systému) + `O(|S|² · |Act|)` (improvement). PI je drahá *uvnitř*, ale levná *zvenčí*.

### Modified policy iteration (MPI)

Kompromis: policy evaluation se *nevyřeší přesně*, ale aproximuje pomocí `m` kroků VI. Pro `m = 1` ⇔ VI; pro `m = ∞` ⇔ klasická PI. V praxi `m = 5–50` dává nejlepší poměr.

## Lineární programování (LP) formulace

Optimální hodnotová funkce je řešením následujícího LP (varianta Dual):

::: math
\begin{aligned}
\min_V &\sum_s V(s) \\
\text{s.t. } &V(s) \ge r(s, a) + \gamma \sum_{s'} P(s, a, s') V(s'), \quad \forall s, a.
\end{aligned}
:::

V optimu je každá nerovnost rovností pro alespoň jednu akci (vázanou) — to dává `σ*(s) = a`. LP je *polynomiální*, ale v praxi pomalejší než PI/VI (kvůli velikosti). Hodí se ale pro *MDP s constraints* (CMDP) a další rozšíření.

::: svg "Hierarchie algoritmů: VI a PI se sbíhají k V*; LP přímo formuluje optimum."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <text x="270" y="20" text-anchor="middle" fill="var(--text-muted)">Bellmanova rovnice optimality V*(s) = maxₐ[r(s,a) + γΣP·V*(s')]</text>
    <line x1="100" y1="35" x2="270" y2="70" stroke="var(--line)"/>
    <line x1="270" y1="35" x2="270" y2="70" stroke="var(--line)"/>
    <line x1="440" y1="35" x2="270" y2="70" stroke="var(--line)"/>
    <rect x="40" y="80" width="120" height="60" rx="6" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="100" y="100" text-anchor="middle" fill="var(--accent)" font-weight="600">Value Iteration</text>
    <text x="100" y="118" text-anchor="middle" fill="var(--text-muted)" font-size="10">Vᵏ⁺¹ = T Vᵏ</text>
    <text x="100" y="132" text-anchor="middle" fill="var(--text-muted)" font-size="10">geom. konv. (γ)</text>
    <rect x="210" y="80" width="120" height="60" rx="6" fill="var(--bg-inset)" stroke="var(--accent-line)"/>
    <text x="270" y="100" text-anchor="middle" fill="var(--accent-line)" font-weight="600">Policy Iteration</text>
    <text x="270" y="118" text-anchor="middle" fill="var(--text-muted)" font-size="10">eval + improve</text>
    <text x="270" y="132" text-anchor="middle" fill="var(--text-muted)" font-size="10">konečně iterací</text>
    <rect x="380" y="80" width="120" height="60" rx="6" fill="var(--bg-inset)" stroke="var(--text-muted)"/>
    <text x="440" y="100" text-anchor="middle" fill="var(--text)" font-weight="600">Lineární program</text>
    <text x="440" y="118" text-anchor="middle" fill="var(--text-muted)" font-size="10">min Σ V(s)</text>
    <text x="440" y="132" text-anchor="middle" fill="var(--text-muted)" font-size="10">polynomiální</text>
  </g>
</svg>
:::

## Q-learning — model-free alternativa

V *reinforcement learningu* obvykle *neznáme* `P` ani `r` — místo toho z interakce s prostředím vzorkujeme (`s, a, r, s'`). **Q-learning** aktualizuje Q-funkci přímo z této zkušenosti:

::: math
Q_{k+1}(s, a) \leftarrow (1-\alpha)\, Q_k(s, a) + \alpha \left[ r + \gamma \max_{a'} Q_k(s', a') \right].
:::

Kde `α` je *learning rate*. Konverguje k `Q*` s pravděpodobností 1 *za podmínek* dostatečného navštívení všech `(s, a)` a Robbins-Monro krocích `α` ([[../SUI/rl/value-q-learning]]).

## Praktická poznámka — Bellmanův operátor

Jedna iterace VI synchronně se dá psát čistě maticově. Pro daný plánovač `σ`:

::: math
T_{\sigma} V = r_{\sigma} + \gamma P_{\sigma} V.
:::

Pro optimální Bellman:

::: math
T^{*} V = \max_{\sigma} T_{\sigma} V.
:::

Pro implementaci stačí *na úrovni stavu* vybrat nejlepší akci — žádné drahé hledání v prostoru politik.

## Numerický příklad — 3 stavy

Mějme MDP s `S = {s₁, s₂, s₃}`, `Act = {a, b}`, `γ = 0,9` a:

* `P(s₁, a, s₂) = 1, r(s₁, a) = 5`
* `P(s₁, b, s₃) = 1, r(s₁, b) = 10`
* `P(s₂, a, s₃) = 1, r(s₂, a) = 1`
* `P(s₃, a, s₃) = 1, r(s₃, a) = 0`  (absorpční)

VI:

```
V⁰ = (0, 0, 0)
V¹(s₁) = max(5 + 0,9·0, 10 + 0,9·0) = 10
V¹(s₂) = 1 + 0,9·0 = 1
V¹(s₃) = 0
V² = (10, 1, 0) — žádné změny po dosažení V₁
V*  = (10, 1, 0),  σ*(s₁) = b
```

## Aplikace

* **PRISM, Storm** — používají VI pro probabilistic model checking ([[prism-model-checking]]).
* **AlphaGo / AlphaZero** — Monte Carlo Tree Search + value/policy iteration v hluboké formě.
* **Robot navigation** — value iteration na grid worldu generuje optimální politiku v `O(|S|² log(1/ε))`.

::: viz value-iteration-converge "Numerický příklad 3-state MDP (s₁, s₂, s₃) z textu; krok-za-krokem VI s Q-tabulkou a aktivní šipkou politiky."
:::

::: link "Puterman, M. L.: Markov Decision Processes, kap. 6.3 (Value Iteration), 6.5 (Policy Iteration)" "https://onlinelibrary.wiley.com/doi/book/10.1002/9780470316887"
:::

::: link "Bertsekas, D.: Dynamic Programming and Optimal Control, Vol. II, kap. 1" "http://www.athenasc.com/dpbook.html"
:::

---

*Zdroj: MSP přednášky 2025/26, *MDP — Value & Policy Iteration* (Češka). Externí reference: Puterman, M. L.: *Markov Decision Processes* (Wiley 1994), kap. 6; Sutton, R., Barto, A.: *Reinforcement Learning* (MIT Press 2018), kap. 4; Bertsekas, D.: *Dynamic Programming and Optimal Control* (Athena Scientific 2017).*
