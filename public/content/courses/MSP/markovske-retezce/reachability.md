---
title: Reachability — pravděpodobnost dosažení cíle
---

# Reachability — pravděpodobnost dosažení cíle

**Reachability** (dosažitelnost) je nejčastější analytická otázka pro DTMC: pro množinu *cílových* stavů `T ⊆ S` chceme spočítat `x(s) := P(s → T)` — pravděpodobnost, že systém startovaný ze stavu `s` dříve nebo později vstoupí do `T`. Tato kvantita stojí za bezpečnostními garancemi protokolů („pravděpodobnost selhání je nejvýše `10⁻⁶`"), spolehlivostními modely (MTBF), i analýzou randomizovaných algoritmů.

## Formulace

Pro `T ⊆ S` definujme:

::: math
x(s) = P\!\left( \exists k \ge 0 : X^{(k)} \in T \mid X^{(0)} = s \right).
:::

Tedy `x(s)` je pravděpodobnost *eventuálního* zasažení `T` ze stavu `s`.

Triviální případ: `x(s) = 1` pro `s ∈ T`.

## Lineární systém

Pro `s ∉ T` použijeme jednokrokovou analýzu — buď přejdeme rovnou do `T`, nebo do dalšího stavu `s'`, odkud dosáhneme `T` s pravděpodobností `x(s')`:

::: math
x(s) = \sum_{s' \in S} P(s, s') \cdot x(s'), \quad s \notin T.
:::

Spolu s okrajovou podmínkou `x(s) = 1` pro `s ∈ T` máme systém `|S|` lineárních rovnic o `|S|` neznámých.

::: svg "Pravděpodobnost dosažení s' z s je vážený součet x(a)·P(s,a) + x(b)·P(s,b)."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <circle cx="80" cy="95" r="22" fill="var(--bg-inset)" stroke="var(--accent)" stroke-width="2"/>
    <text x="80" y="99" text-anchor="middle" fill="var(--text)">s</text>
    <text x="80" y="68" text-anchor="middle" fill="var(--accent)" font-size="10.5">x(s) = ?</text>
    <circle cx="280" cy="50" r="22" fill="var(--bg-inset)" stroke="var(--text-muted)"/>
    <text x="280" y="54" text-anchor="middle" fill="var(--text)">a</text>
    <text x="280" y="25" text-anchor="middle" fill="var(--text-muted)" font-size="10">x(a)</text>
    <circle cx="280" cy="140" r="22" fill="var(--bg-inset)" stroke="var(--text-muted)"/>
    <text x="280" y="144" text-anchor="middle" fill="var(--text)">b</text>
    <text x="280" y="170" text-anchor="middle" fill="var(--text-muted)" font-size="10">x(b)</text>
    <path d="M 100 85 L 258 55" stroke="var(--line-strong)" fill="none" marker-end="url(#arrR)"/>
    <text x="170" y="60" text-anchor="middle" fill="var(--text-muted)">P(s, a)</text>
    <path d="M 100 110 L 258 138" stroke="var(--line-strong)" fill="none" marker-end="url(#arrR)"/>
    <text x="170" y="135" text-anchor="middle" fill="var(--text-muted)">P(s, b)</text>
    <rect x="420" y="60" width="100" height="80" rx="4" fill="var(--bg-inset)" stroke="var(--accent-line)" stroke-width="2"/>
    <text x="470" y="105" text-anchor="middle" fill="var(--accent-line)" font-weight="600">T</text>
    <text x="470" y="50" text-anchor="middle" fill="var(--accent-line)" font-size="10">x(t)=1</text>
  </g>
  <defs><marker id="arrR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--line-strong)"/></marker></defs>
</svg>
:::

### Problém jednoznačnosti

Naivní systém *nemusí* mít jednoznačné řešení. Příklad: nech `T = {error}`,

```
start → 0.9 → error
start → 0.1 → delivered
delivered → 1 → delivered  (absorpční)
```

Pak:

* `x(error) = 1`
* `x(start) = 0,9 · 1 + 0,1 · x(delivered)`
* `x(delivered) = 1 · x(delivered)` ⇒ identita, *libovolné* řešení!

Řešením je celá rodina `(0,9 + 0,1p, 1, p)` pro `p ∈ [0, 1]`. Aby byla unikátní pravděpodobnost dosažení `T`, musíme „rozhodnout", co se děje, když se zaseknu mimo `T`.

## Standardní přístup — přidání `S₀`

Definujeme:

::: math
S_0 = \{ s \in S \mid T \text{ není dosažitelný z } s \}.
:::

Tedy stavy, *ze kterých se `T` *vůbec* nedá dosáhnout*. Z těchto stavů triviálně `x(s) = 0`. `S₀` lze najít backward reachability v grafu: počáteček = `T`, jdi proti hranám, najdi vše dosažitelné. Doplněk (mimo nalezenou množinu) je `S₀`.

Systém je pak:

::: math
\begin{aligned}
x(s) &= 1, & s \in T, \\
x(s) &= 0, & s \in S_0, \\
x(s) &= \sum_{s' \in S} P(s, s') \cdot x(s'), & s \notin T \cup S_0.
\end{aligned}
:::

S touto úpravou má systém **jednoznačné** řešení (Banachova věta o pevném bodě — matice na zbývajících stavech je *substochastická*, normy `< 1`).

## Algoritmus

1. **Backward reachability** od `T` (procházej hrany pozpátku z `T`): označ stavy, ze kterých lze `T` dosáhnout. Komplement = `S₀`.
2. Vyřeš lineární systém na `S∖(T ∪ S₀)`. Maticová forma: `(I − P̃) x̃ = b`, kde `P̃` je restrikce `P` na zbylé stavy a `b(s) = Σ_{s' ∈ T} P(s, s')`.
3. Pro velké stavové prostory: *value iteration* — opakuj `x ← P · x` (s zachováním okrajů) až do konvergence. Zaručeně konverguje v `O(log(1/ε) / (1 − γ))` iteracích, kde `γ < 1` je *spektrální poloměr* substochastické části.

### Numerický příklad

Mějme stavy `s₀, s₁, s₂, s₃, T = {t}`, kde `s₂` je „uvíznutí". Z `s₀`:

* `s₀ → s₁` s pravděpodobností `1/2`, `s₀ → s₂` s `1/2`.
* `s₁ → s₃` s `1/2`, `s₁ → s₂` s `1/2`.
* `s₃ → t` s `1/2`, `s₃ → s₁` s `1/2`.
* `s₂ → s₂` (absorpční).

Pak `S₀ = {s₂}` (z `s₂` nelze do `t`), a soustava na `{s₀, s₁, s₃}`:

::: math
\begin{aligned}
x(s_0) &= \tfrac{1}{2} x(s_1) \\
x(s_1) &= \tfrac{1}{2} x(s_3) \\
x(s_3) &= \tfrac{1}{2} \cdot 1 + \tfrac{1}{2} x(s_1)
\end{aligned}
:::

Dosazení: `x(s₃) = 1/2 + 1/2 · 1/2 · x(s₃) = 1/2 + 1/4 x(s₃)` ⇒ `x(s₃) = 2/3`. Pak `x(s₁) = 1/3`, `x(s₀) = 1/6`.

## Související otázky

Z reachability se odvozují další analytické otázky:

* **Almost-sure reachability**: existují algoritmy v `O(|S| + |E|)`, které najdou množinu stavů, kde `x(s) = 1`, bez řešení soustavy (jen *graf* analýza).
* **Reachability ve stanoveném počtu kroků** — výpočet `t⁽ᵏ⁾(T) = Σ_{s ∈ T} t⁽ᵏ⁾(s)` přes [[transient-analyza|tranzientní analýzu]].
* **Očekávaný čas do dosažení** (expected hitting time) — soustava `h(s) = 1 + Σ P(s, s') h(s')` pro `s ∉ T`, `h(s) = 0` pro `s ∈ T`. Klíčové pro analýzu randomizovaných algoritmů.
* **Pravděpodobnost s konstantou** — `P(s → T) ⋈ p` pro `⋈ ∈ {<, ≤, =, ≥, >}` — toto je *PCTL* formule v stochastic model checking ([[prism-model-checking]]).

## Aplikace

* **Bezpečnostní protokoly** — `T` = množina stavů „attacker uspěl"; cíl: `x(start) ≤ 10⁻⁶`.
* **Spolehlivost** — `T` = stav „systém selhal"; výpočet MTBF přes očekávanou dobu do `T`.
* **Randomizované algoritmy** — `T` = stav „nalezeno řešení"; analýza Karger Min-Cut ([[karger-min-cut]]).
* **Bioinformatika** — pravděpodobnost dosažení absorpční sekvence v evolučních modelech.

::: viz reachability-fixpoint "Iterativní výpočet x(s) = P(s → T) na příkladu z textu; sledujte konvergenci k exaktnímu řešení (x(s₀)=1/6, x(s₃)=2/3)."
:::

::: link "Kwiatkowska, M., Norman, G., Parker, D.: Stochastic Model Checking (LNCS 2007)" "https://www.prismmodelchecker.org/papers/sfm07.pdf"
:::

::: link "Baier, C., Katoen, J.-P.: PoMC, kap. 10.1.3 — Reachability Probabilities" "https://mitpress.mit.edu/9780262026499/principles-of-model-checking/"
:::

---

*Zdroj: MSP přednášky 2025/26, *Markov Chains — Reachability* (Češka). Externí reference: Baier, C., Katoen, J.-P.: *Principles of Model Checking* (MIT Press 2008), kap. 10.1.3; Kwiatkowska, M., Norman, G., Parker, D.: *Stochastic Model Checking*, LNCS 4486 (2007); Norris, J. R.: *Markov Chains* (Cambridge 1997), kap. 1.3.*
