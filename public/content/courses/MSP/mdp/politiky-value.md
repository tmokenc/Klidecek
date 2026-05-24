---
title: Politiky a hodnotová funkce
---

# Politiky a hodnotová funkce

Pro MDP `M = (S, s₀, Act, P)` je *plánovač* (policy) způsob, jak rozhodovat o akcích. **Hodnotová funkce** `V^σ(s)` kvantifikuje, „jak dobré" je být ve stavu `s` při použití politiky `σ`. Cílem analýzy MDP je obvykle najít *optimální* hodnotu `V*(s) = max_σ V^σ(s)` a *optimální* politiku, která jí dosahuje. Tato dvojice — hodnota a politika — je centrální i v reinforcement learningu.

## Plánovače — formálně

Připomínka z [[mdp-definice]]: plánovač přiřazuje cestě rozdělení nad akcemi. Pro analýzu obvykle stačí menší třídy:

* **Memoryless deterministic** (MD): `σ : S → Act` — funkce stav → akce.
* **Memoryless randomized** (MR): `σ : S → Distr(Act)`.
* **History-dependent**: závisí na celé cestě.

Pro mnoho úloh (klasická reachability, diskontovaná odměna) platí: *MD postačuje* — tj. existuje optimální plánovač, který je *deterministický a bezpaměťový*. Důvod: Bellmanův princip optimality.

## Hodnotová funkce

Cíl analýzy je obvykle *kvantifikovat* kvalitu cesty/stavu. Konvenční volby:

### Reachability (pravděpodobnost dosažení)

`V^σ(s) = P^σ(s → T)` — pravděpodobnost dosažení cílové množiny `T` ze stavu `s` při použití plánovače `σ`.

Optimum:

::: math
V^{*}(s) = \max_{\sigma} P^{\sigma}(s \to T).
:::

(Pro „bezpečnostní" cíl naopak minimalizujeme — `min_σ P(s → T_bad)`.)

### Očekávaná odměna (expected reward)

Definujme **odměňovací funkci** `r : S × Act → R`. Politika generuje posloupnost `(s₀, a₀, s₁, a₁, …)` a tedy posloupnost odměn `r₀, r₁, r₂, …`. Cíl: maximalizovat *součet odměn*.

Pro **konečný horizont** `H`:

::: math
V^{\sigma}_H(s) = E^{\sigma}\!\left[ \sum_{t=0}^{H-1} r(s_t, a_t) \,\Big|\, s_0 = s \right].
:::

Pro **nekonečný diskontovaný horizont** (`γ ∈ [0, 1)`):

::: math
V^{\sigma}_{\gamma}(s) = E^{\sigma}\!\left[ \sum_{t=0}^{\infty} \gamma^t r(s_t, a_t) \,\Big|\, s_0 = s \right].
:::

Diskontování (`γ < 1`) zajišťuje konvergenci součtu a *exponenciálně* snižuje vliv vzdálené budoucnosti — proč: budoucnost je nejistá; nebo: peníze dnes mají vyšší hodnotu než zítra.

Pro **průměrnou odměnu** (average reward):

::: math
V^{\sigma}_{\text{avg}}(s) = \lim_{N \to \infty} \frac{1}{N} E^{\sigma}\!\left[ \sum_{t=0}^{N-1} r(s_t, a_t) \,\Big|\, s_0 = s \right].
:::

## Bellmanova rovnice — fix policy

Pro *daný* plánovač `σ` (bezpaměťový) platí *rekurzivní* vztah:

::: math
V^{\sigma}(s) = \sum_{a} \sigma(a \mid s) \left[ r(s, a) + \gamma \sum_{s'} P(s, a, s') \cdot V^{\sigma}(s') \right].
:::

V maticové formě: `V^σ = r^σ + γ P^σ V^σ`, řešení `V^σ = (I − γ P^σ)⁻¹ r^σ`. Pro deterministický plánovač `σ(s) = a*`:

::: math
V^{\sigma}(s) = r(s, a^*) + \gamma \sum_{s'} P(s, a^*, s') \cdot V^{\sigma}(s').
:::

## Bellmanova rovnice optimality

Pro *optimální* `V*`:

::: math
V^{*}(s) = \max_{a \in Act(s)} \left[ r(s, a) + \gamma \sum_{s'} P(s, a, s') \cdot V^{*}(s') \right].
:::

Jednoduchá *intuice*: optimální hodnota `s` je nejlepší (max přes akce) okamžitá odměna plus diskontovaná očekávaná hodnota následujícího stavu.

::: svg "Bellmanův backup: V*(s) je max přes akce z (r(s,a) + γ·E[V*(s')])."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <circle cx="80" cy="100" r="26" fill="var(--bg-inset)" stroke="var(--accent)" stroke-width="2"/>
    <text x="80" y="104" text-anchor="middle">s</text>
    <text x="80" y="58" text-anchor="middle" fill="var(--accent)" font-size="10.5">V*(s)</text>

    <text x="160" y="60" fill="var(--text-muted)">max</text>
    <text x="160" y="74" fill="var(--text-muted)" font-size="9">a</text>

    <circle cx="220" cy="60" r="8" fill="var(--accent-line)"/>
    <text x="240" y="58" fill="var(--text-muted)" font-size="10">akce α₁</text>
    <circle cx="220" cy="140" r="8" fill="var(--accent-line)"/>
    <text x="240" y="143" fill="var(--text-muted)" font-size="10">akce α₂</text>

    <path d="M 106 90 L 210 64" stroke="var(--line-strong)" fill="none"/>
    <path d="M 106 110 L 210 138" stroke="var(--line-strong)" fill="none"/>

    <path d="M 228 60 L 350 35" stroke="var(--text-muted)" fill="none" marker-end="url(#arrV)"/>
    <circle cx="380" cy="35" r="20" fill="var(--bg-inset)" stroke="var(--text)"/>
    <text x="380" y="39" text-anchor="middle">s'</text>
    <text x="445" y="32" fill="var(--accent)" font-size="10">V*(s')</text>

    <path d="M 228 140 L 350 165" stroke="var(--text-muted)" fill="none" marker-end="url(#arrV)"/>
    <circle cx="380" cy="170" r="20" fill="var(--bg-inset)" stroke="var(--text)"/>
    <text x="380" y="174" text-anchor="middle">s''</text>
    <text x="445" y="167" fill="var(--accent)" font-size="10">V*(s'')</text>

    <text x="40" y="190" fill="var(--text-muted)" font-size="10.5">V*(s) = max[r(s, α₁) + γΣP(s, α₁, s')V*(s'),  r(s, α₂) + γΣP(s, α₂, s')V*(s')]</text>
  </g>
  <defs><marker id="arrV" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--text-muted)"/></marker></defs>
</svg>
:::

## Optimální politika

Z optimální hodnotové funkce lze přímo odečíst optimální (deterministickou bezpaměťovou) politiku:

::: math
\sigma^{*}(s) = \arg\max_{a \in Act(s)} \left[ r(s, a) + \gamma \sum_{s'} P(s, a, s') \cdot V^{*}(s') \right].
:::

Tedy: *vyber tu akci, která maximalizuje `Q*(s, a) := r(s, a) + γ Σ P(s, a, s') V*(s')`* — *Q-funkci*. To je důvod, proč v RL (Q-learning) se učí přímo Q-funkce — z ní se vybírá akce, není potřeba znát samostatně `r` a `P`.

::: math
Q^{*}(s, a) = r(s, a) + \gamma \sum_{s'} P(s, a, s') \cdot V^{*}(s'), \quad V^{*}(s) = \max_a Q^{*}(s, a).
:::

## Existence optima — Banachova věta o pevném bodě

Bellmanův operátor `T : V ↦ (Tᵥ)(s) := max_a [r(s, a) + γ Σ P(s, a, s') V(s')]` je *γ-kontrahující* v supremové normě (`||T V₁ − T V₂||_∞ ≤ γ ||V₁ − V₂||_∞`) pro `γ < 1`. Banachova věta zaručuje:

1. **jediný pevný bod** — `V*`, splňující `T V* = V*`,
2. **konvergence iterace** — pro libovolný počáteční `V⁰`, `Vᵏ⁺¹ := T Vᵏ` konverguje k `V*` geometricky s rychlostí `γ`.

To je matematický základ [[value-iteration|value iteration]].

## Reachability bez diskontování (γ = 1)

Pro čistou reachability `T` (bez odměn) můžeme nastavit:

* `r(s, a) = 0` pro `s ∉ T`,
* `T` jsou absorpční stavy s `r(t, _) = 1` přiřazeným *jen jednou*,
* `γ = 1`.

Pak `V*(s) = max_σ P^σ(s → T)`. Bellmanův operátor zde *není kontrahující*, ale stále má jediný pevný bod (díky `P · 1 ≤ 1` na stavech mimo `T ∪ S₀`).

## Vztah k DTMC

Když má každý stav `s` jen *jedinou* dostupnou akci (`|Act(s)| = 1`), MDP degeneruje na DTMC. Politika je triviální (nemá co volit). Hodnotová funkce se redukuje na *očekávanou kumulativní odměnu* indukovaného řetězce.

## Aplikace

* **Plánování trajektorie** — odměna `+1` v cíli, `−1` v překážce, `γ = 0,9`.
* **Q-learning** — agent v RL učí `Q^*` přímo z dat bez znalosti `P`.
* **Inventory management** — stav = počet zboží, akce = kolik objednat, odměna = zisk minus skladné.
* **Optimal stopping** — kdy přestat (Secretary problem, finanční opce).

::: viz mdp-gridworld-policy "Bellmanův backup v praxi: vidíte V(s) a π*(s) v každé buňce. Ladťte γ a slip-prob."
:::

::: link "Sutton, R., Barto, A.: Reinforcement Learning, kap. 3 — Finite MDPs" "http://incompleteideas.net/book/the-book-2nd.html"
:::

::: link "Bertsekas, D.: Dynamic Programming and Optimal Control (Athena Scientific 2017)" "http://www.athenasc.com/dpbook.html"
:::

---

*Zdroj: MSP přednášky 2025/26, *MDP — Value Functions and Policies* (Češka). Externí reference: Baier, C., Katoen, J.-P.: *Principles of Model Checking* (MIT Press 2008), kap. 10.6.1–10.6.3; Puterman, M. L.: *Markov Decision Processes* (Wiley 1994), kap. 6; Sutton, R., Barto, A.: *Reinforcement Learning* (MIT Press 2018), kap. 3–4.*
