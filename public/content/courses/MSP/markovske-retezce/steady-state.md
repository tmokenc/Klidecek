---
title: Stacionární (steady-state) distribuce
---

# Stacionární (steady-state) distribuce

Pro ergodický DTMC existuje *jediná* distribuce `π`, ke které tranzientní distribuce konverguje, nezávisle na startovacím rozdělení. Tato **stacionární distribuce** je v praxi nejdůležitější asymptotický popis řetězce — odpovídá na otázku „kolik *procent* času systém tráví v jednotlivých stavech"? Vystupuje v PageRanku, ve výkonostní analýze, ve frontových systémech (M/M/1 utilization), v MCMC.

## Definice

Vektor `π ∈ R^|S|` je **stacionární distribuce** DTMC `(S, P)`, pokud:

::: math
\pi \cdot P = \pi, \quad \pi(s) \ge 0, \quad \sum_{s \in S} \pi(s) = 1.
:::

Tedy `π` je řádkový *levý vlastní vektor* matice `P` přiřazený vlastní hodnotě `λ = 1`, normalizovaný na pravděpodobnostní distribuci.

**Stacionární** = neměnná: pokud `t⁽ᵏ⁾ = π`, pak `t⁽ᵏ⁺¹⁾ = π · P = π`. Jakmile do `π` dorazíme, *tam zůstaneme*.

## Existence a jednoznačnost

* **Konečný DTMC** vždy má alespoň jeden vlastní vektor pro `λ = 1` (důsledek toho, že řádky `P` se sčítají na 1 a `1` je vlastní hodnotou).
* **Ireducibilní** konečný DTMC má *právě jednu* stacionární distribuci.
* **Ergodický** (ireducibilní + aperiodický) DTMC navíc splňuje `t⁽ᵏ⁾ → π` pro `k → ∞` *nezávisle na `ι₀`*.
* DTMC s **více rekurentními třídami** má více stacionárních distribucí — jednu pro každou rekurentní třídu, plus libovolné jejich *konvexní kombinace*. (Reducibilní řetězec s jedinou rekurentní třídou má `π` jednoznačnou.)
* **Periodický** ireducibilní DTMC má jedinou `π`, ale `t⁽ᵏ⁾` k ní *nekonverguje* — *osciluje*; konverguje jen *Cesàrův průměr* `(1/n) Σ_{k<n} t⁽ᵏ⁾`.

## Výpočet — soustava lineárních rovnic

`π · P = π` plus `Σ π(s) = 1` dává `|S| + 1` rovnic o `|S|` neznámých. Jedna z rovnic v `π · P = π` je redundantní (lineárně závislá na ostatních + normalizační podmínce). Standardně tedy odstraníme libovolnou rovnici z `π(P − I) = 0` a nahradíme ji normalizací `Σ π(s) = 1`.

### Příklad — dvoustavový řetězec

Mějme `S = {0, 1}` a `P = ((1−a, a), (b, 1−b))`. Pak `π = (π₀, π₁)` splňuje:

* `π₀ (1 − a) + π₁ b = π₀` ⇒ `π₁ b = π₀ a`
* `π₀ + π₁ = 1`

Řešení:

::: math
\pi_0 = \frac{b}{a + b}, \quad \pi_1 = \frac{a}{a + b}.
:::

Intuice: pravděpodobnost být ve stavu je úměrná pravděpodobnosti *přijít do něj* relativně k *odejít z něj*.

## Výpočet — vlastní vektory

Druhá cesta: najdi *levý* vlastní vektor `y` matice `P` přiřazený `λ = 1`:

::: math
y \cdot P = y \quad \Longleftrightarrow \quad P^T y^T = y^T.
:::

Tedy `y^T` je *pravý* vlastní vektor `P^T` pro `λ = 1`. Normalizuj `y` tak, aby `1^T y = 1`. To je výhodné při použití knihovny pro spektrální rozklad (NumPy `np.linalg.eig`, SciPy `scipy.sparse.linalg.eigs`).

### Existence λ = 1

Každá stochastická matice `P` má `λ = 1` jako vlastní hodnotu (pravý vlastní vektor je `1 = (1,…,1)ᵀ` — `P · 1 = 1`, protože řádky se sčítají na 1). Podle [Perron-Frobeniovy věty](https://en.wikipedia.org/wiki/Perron%E2%80%93Frobenius_theorem) je pro ireducibilní matici `λ = 1` *jednoduchá*, dominantní vlastní hodnota a odpovídá *pozitivnímu* vlastnímu vektoru.

## Iterativní výpočet — Power iteration

Pro velké stavové prostory (PageRank: web má `> 10¹⁰` stránek) je řešení soustavy příliš drahé. Místo toho: 

```
t = ι₀     # libovolný počáteční vektor
opakuj:
    t' = t · P
    pokud ||t' − t|| < ε: stop
    t = t'
```

Tato *mocninná iterace* konverguje k `π` u ergodického řetězce *geometricky* s rychlostí danou *spektrální mezerou* `|λ₁ − λ₂|`, kde `λ₂` je druhá největší vlastní hodnota v absolutní hodnotě.

::: viz biasvar "Spektrální mezera — čím větší, tím rychleji se distribuce „smíchá" k stacionární."
:::

::: viz stationary-power-iteration "Power iteration na 2-stavovém DTMC; chyba ‖t⁽ᵏ⁾ − π‖ klesá geometricky ∼ λ₂^k. Spektrální mezera 1−|λ₂|."
:::

## Detailní rovnováha (reversibility)

DTMC je **reversibilní**, pokud existuje `π` splňující *detailed balance equations*:

::: math
\pi(s) \cdot P(s, s') = \pi(s') \cdot P(s', s) \quad \forall s, s' \in S.
:::

Slovně: tok pravděpodobnosti mezi každou dvojicí stavů je v obou směrech stejný. Pokud `π` splňuje detailed balance, je *automaticky* stacionární (suma přes `s` dá `π · P = π`).

Reversibilita je *silnější* podmínka než stacionarita. Klíčová pro **MCMC** (Markov Chain Monte Carlo) — Metropolis-Hastings algoritmus konstruuje řetězec se zvolenou `π` přesně přes detailed balance.

## Příklad — řetězec s více rekurentními třídami

Uvažme řetězec, kde z `s₀` lze přejít do *dvou* rekurentních tříd `RC₁, RC₂, RC₃`. Pak limitní distribuce závisí na *pravděpodobnostech pohlcení* `P(s₀ → RCᵢ)`:

::: math
\mathbf{t}^\infty = \sum_i P(s_0 \to RC_i) \cdot \boldsymbol{\pi}_{RC_i},
:::

kde `π_{RCᵢ}` je stacionární distribuce restrikce na třídu `RCᵢ` (rozšířená nulami mimo `RCᵢ`). Tedy *konvexní kombinace* stacionárních distribucí jednotlivých rekurentních tříd, vážená pravděpodobnostmi *vstupu* do nich.

## Aplikace stacionární distribuce {tier=practice}

* **PageRank** — `π` na grafu webu = vážnost stránek. Algoritmus Brina a Page (1998).
* **Queueing theory** — utilization, průměrná délka fronty pro M/M/1: `ρ = λ/μ`, `E[L] = ρ/(1−ρ)`.
* **Performance evaluation** — frakce času v každém z módů systému (`active`, `idle`, `failed`).
* **MCMC** — vzorkování ze složitých distribucí `π` přes konstrukci řetězce, jehož `π` je cílová distribuce.
* **Equilibrium populations** — biologické modely (Wright-Fisher).

::: link "Brin, S., Page, L.: The Anatomy of a Large-Scale Hypertextual Web Search Engine (1998)" "http://infolab.stanford.edu/pub/papers/google.pdf"
:::

::: link "Levin, D., Peres, Y., Wilmer, E.: Markov Chains and Mixing Times (AMS 2017)" "https://pages.uoregon.edu/dlevin/MARKOV/"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=XP3qg7Qv2So" "SZZ: Markovské řetězce a jejich analýza" "Tomáš Kocourek"
:::

*Zdroj: MSP přednášky 2025/26, *Markov Chains — Steady-State Analysis* (Češka). Externí reference: Baier, C., Katoen, J.-P.: *Principles of Model Checking* (MIT Press 2008), kap. 10.1.4; Norris, J. R.: *Markov Chains* (Cambridge 1997), kap. 1.7–1.10; Stewart, W. J.: *Probability, Markov Chains, Queues, and Simulation* (Princeton 2009), kap. 9.*
