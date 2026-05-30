---
title: Tranzientní analýza
---

# Tranzientní analýza

**Tranzientní analýza** odpovídá na otázku „jak se systém vyvíjí v čase?". Pro DTMC `(S, P, ι₀)` chceme znát *distribuci po `k` krocích* — pravděpodobnost, že jsme po `k` krocích v každém stavu `s`. Toto je *konečně-časový* pohled (na rozdíl od asymptotické steady-state).

## Tranzientní pravděpodobnost

Definujme:

::: math
t^{(k)}(s) = P\!\left( X^{(k)} = s \mid X^{(0)} \sim \iota_0 \right).
:::

Tedy `t⁽ᵏ⁾(s)` je pravděpodobnost, že po `k` krocích je systém ve stavu `s`. Vektor `t⁽ᵏ⁾ = (t⁽ᵏ⁾(s))_{s ∈ S}` je *řádkový vektor* délky `|S|`. Speciálně `t⁽⁰⁾ = ι₀`.

## Rekurentní formule

Použijeme přímo Markovskou vlastnost — abychom se v kroku `k` ocitli ve stavu `s`, musíme v kroku `k − 1` být v *nějakém* `s'`, a pak přejít do `s`:

::: math
t^{(k)}(s) = \sum_{s' \in S} t^{(k-1)}(s') \cdot P(s', s).
:::

Jinými slovy — *forward propagation* pravděpodobnostní masy podle hran grafu.

::: svg "Forward propagace: hodnota t⁽ᵏ⁾(s) je váženým součtem t⁽ᵏ⁻¹⁾(a)·P(a,s) + t⁽ᵏ⁻¹⁾(b)·P(b,s)."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <circle cx="100" cy="60" r="22" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="100" y="64" text-anchor="middle" fill="var(--text)">a</text>
    <text x="100" y="32" text-anchor="middle" fill="var(--text-muted)" font-size="10">t⁽ᵏ⁻¹⁾(a)</text>
    <circle cx="100" cy="130" r="22" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="100" y="134" text-anchor="middle" fill="var(--text)">b</text>
    <text x="100" y="170" text-anchor="middle" fill="var(--text-muted)" font-size="10">t⁽ᵏ⁻¹⁾(b)</text>
    <circle cx="350" cy="95" r="28" fill="var(--bg-inset)" stroke="var(--accent-line)" stroke-width="2"/>
    <text x="350" y="99" text-anchor="middle" fill="var(--text)">s</text>
    <path d="M 122 60 L 322 90" stroke="var(--line-strong)" fill="none" marker-end="url(#arrT)"/>
    <text x="220" y="65" fill="var(--text-muted)" text-anchor="middle">P(a, s)</text>
    <path d="M 122 130 L 322 100" stroke="var(--line-strong)" fill="none" marker-end="url(#arrT)"/>
    <text x="220" y="128" fill="var(--text-muted)" text-anchor="middle">P(b, s)</text>
    <text x="350" y="40" text-anchor="middle" fill="var(--accent-line)" font-size="10.5">t⁽ᵏ⁾(s) = t⁽ᵏ⁻¹⁾(a)·P(a,s) + t⁽ᵏ⁻¹⁾(b)·P(b,s)</text>
  </g>
  <defs><marker id="arrT" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--line-strong)"/></marker></defs>
</svg>
:::

## Maticová forma

Rekurentní formule odpovídá *součinu řádkového vektoru s maticí*:

::: math
\mathbf{t}^{(k)} = \mathbf{t}^{(k-1)} \cdot P = \mathbf{t}^{(0)} \cdot P^k = \iota_0 \cdot P^k.
:::

Tranzientní analýza tedy redukuje na opakované *vektor-matice* násobení. Pro řídkou `P` to lze provést v `O(k · |E|)`, kde `|E|` je počet hran (nenulových přechodů).

### Chapman-Kolmogorovova rovnice

Pro `k = m + n`:

::: math
P^{m+n}(s, s') = \sum_{s'' \in S} P^m(s, s'') \cdot P^n(s'', s').
:::

To znamená — počet kroků se *skládá* maticovým násobením. Konkrétně `P²(s, s') = Σ P(s, s'') P(s'', s')` = pravděpodobnost cesty `s → s'' → s'` pro libovolné `s''`.

## Příklad — protokol s opakováním

Z předchozí kapitoly: tři stavy `start, error, delivered` s maticí

::: math
P = \begin{pmatrix} 0 & 0.9 & 0.1 \\ 0.5 & 0.5 & 0 \\ 0 & 0 & 1 \end{pmatrix}.
:::

(Verze, kde `error` se s pravděpodobností `0,5` vrací do `start` a s `0,5` zůstane.)

Počáteční rozdělení `t⁽⁰⁾ = (1, 0, 0)`:

```
t⁽⁰⁾ = (1.000, 0.000, 0.000)
t⁽¹⁾ = (0.000, 0.900, 0.100)
t⁽²⁾ = (0.450, 0.450, 0.100)
t⁽³⁾ = (0.225, 0.630, 0.145)
t⁽⁴⁾ = (0.315, 0.518, 0.168)
t⁽⁵⁾ = (0.259, 0.542, 0.199)
…
```

Pravděpodobnost být ve stavu `delivered` *monotónně roste* (`delivered` je absorpční); pravděpodobnosti `start` a `error` se postupně „přelévají" do `delivered`.

## Asymptotické chování

Co se stane, když `k → ∞`?

* **Ergodický řetězec** — `t⁽ᵏ⁾ → π` (stacionární distribuce), nezávisle na `ι₀`. Konvergence je *geometrická* s rychlostí danou druhým největším vlastním číslem matice `P` v absolutní hodnotě.
* **Periodický řetězec s periodou `d > 1`** — `t⁽ᵏ⁾` osciluje. Konverguje *Cesàro-průměr* `(1/n) Σ_{k<n} t⁽ᵏ⁾`.
* **Více rekurentních tříd** — limita existuje a je *kombinací* stacionárních distribucí jednotlivých rekurentních tříd vážených pravděpodobnostmi pohlcení ([[reachability]]).

## Praktický výpočet

Pro malá `|S|` (do tisíců stavů) lze tranzientní distribuci po `k` krocích spočítat třemi způsoby:

1. **Iterativně** — `k` násobení `t · P`. Časová složitost `O(k · |E|)`, prostorová `O(|S|)`.
2. **Mocnina matice** — `Pᵏ` opakovaným čtvercováním v `O(|S|³ · log k)`. Vhodné pro velké `k` na hustých maticích.
3. **Spektrální rozklad** — diagonalizace `P = Q · Λ · Q⁻¹` ⇒ `Pᵏ = Q · Λᵏ · Q⁻¹`. Levné po jednorázové faktorizaci. Vyžaduje, aby `P` byla diagonalizovatelná (běžně ano u stochastických matic).

Pro velké stavové prostory (`> 10⁶`) se používá *Krylovovy podprostory* nebo *aproximace nízkou hodností*.

## Tranzientní vs. steady-state

| Aspekt | Tranzientní analýza | [[steady-state\|Steady-state analýza]] |
| :--- | :--- | :--- |
| Čas | konkrétní `k` (konečné) | `k → ∞` |
| Závislost na `ι₀` | ano | ne (pro ergodický řetězec) |
| Výpočet | iterace `t · P` | řešení `π · P = π` |
| Otázka | „kde jsme po N krocích?" | „kde jsme dlouhodobě?" |

::: viz dtmc-simulator "Krok-za-krokem evoluce t⁽ᵏ⁾ — vyberte preset a sledujte sloupcovou distribuci po každém kroku."
:::

::: link "Stewart, W. J.: Probability, Markov Chains, Queues, and Simulation (Princeton 2009)" "https://press.princeton.edu/books/hardcover/9780691140629/"
:::

::: link "Stanford EE 178 — Probabilistic Systems Analysis, lecture 9" "https://web.stanford.edu/class/ee178/"
:::

---

*Zdroj: MSP přednášky 2025/26, *Markov Chains — Transient Analysis* (Češka). Externí reference: Baier, C., Katoen, J.-P.: *Principles of Model Checking* (MIT Press 2008), kap. 10.1.2; Stewart, W. J.: *Probability, Markov Chains, Queues, and Simulation* (Princeton 2009), kap. 9; Norris, J. R.: *Markov Chains* (Cambridge 1997), kap. 1.7.*
