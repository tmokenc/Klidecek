---
title: Klasifikace stavů DTMC
---

# Klasifikace stavů DTMC

Než se pustíme do analýzy chování řetězce (transient, reachability, steady-state), je nutné rozumět *struktuře* stavového prostoru. Dělení stavů na *přechodné* a *rekurentní*, určení *period* a rozpoznání *ergodicity* určuje, *jakou* analytickou otázku má vůbec smysl klást.

## Dosažitelnost a komunikace

Stav `s'` je **dosažitelný** ze stavu `s` (zápis `s → s'`), pokud existuje `k ≥ 0` takové, že `Pᵏ(s, s') > 0`. Tedy existuje konečná cesta z `s` do `s'`.

Stavy `s, s'` **komunikují** (`s ↔ s'`), pokud `s → s'` a `s' → s`. Komunikace je *ekvivalence* na stavech — rozkládá `S` na **komunikační třídy**.

::: svg "Tři komunikační třídy: {s₀, s₁} je tranzientní, {s₂} a {s₃, s₄} jsou rekurentní (vstupují, ale neopouští)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="40" y="30" width="140" height="140" rx="6" fill="none" stroke="var(--line)" stroke-dasharray="4 3"/>
    <text x="110" y="22" text-anchor="middle" fill="var(--text-muted)">tranzientní</text>
    <circle cx="80" cy="80" r="20" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="80" y="83" text-anchor="middle">s₀</text>
    <circle cx="140" cy="120" r="20" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="140" y="123" text-anchor="middle">s₁</text>
    <path d="M 96 91 L 126 113" stroke="var(--line-strong)" fill="none" marker-end="url(#arrA2)"/>

    <rect x="220" y="40" width="100" height="100" rx="6" fill="none" stroke="var(--line)" stroke-dasharray="4 3"/>
    <text x="270" y="32" text-anchor="middle" fill="var(--text-muted)">rekurentní</text>
    <circle cx="270" cy="90" r="20" fill="var(--bg-inset)" stroke="var(--accent-line)"/>
    <text x="270" y="93" text-anchor="middle">s₂</text>
    <path d="M 290 90 C 320 90, 320 70, 290 78" stroke="var(--line-strong)" fill="none" marker-end="url(#arrA2)"/>

    <rect x="360" y="30" width="160" height="140" rx="6" fill="none" stroke="var(--line)" stroke-dasharray="4 3"/>
    <text x="440" y="22" text-anchor="middle" fill="var(--text-muted)">rekurentní</text>
    <circle cx="400" cy="80" r="20" fill="var(--bg-inset)" stroke="var(--accent-line)"/>
    <text x="400" y="83" text-anchor="middle">s₃</text>
    <circle cx="480" cy="120" r="20" fill="var(--bg-inset)" stroke="var(--accent-line)"/>
    <text x="480" y="123" text-anchor="middle">s₄</text>
    <path d="M 416 91 L 464 113" stroke="var(--line-strong)" fill="none" marker-end="url(#arrA2)"/>
    <path d="M 464 109 L 416 87" stroke="var(--line-strong)" fill="none" marker-end="url(#arrA2)"/>

    <path d="M 156 110 Q 200 90 235 95" stroke="var(--line-strong)" fill="none" marker-end="url(#arrA2)"/>
    <path d="M 156 130 Q 250 165 380 110" stroke="var(--line-strong)" fill="none" marker-end="url(#arrA2)"/>
  </g>
  <defs><marker id="arrA2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--line-strong)"/></marker></defs>
</svg>
:::

DTMC je **ireducibilní**, pokud má *jedinou* komunikační třídu (všechny stavy navzájem komunikují). Většina zajímavých vět ve formě „existuje *jedna* stacionární distribuce" platí jen pro ireducibilní řetězce.

## Tranzientní vs. rekurentní stavy

Stav `s` je:

* **Tranzientní** (přechodný) — existuje nenulová pravděpodobnost, že se do `s` *nikdy* nevrátíme po jeho opuštění. Formálně: `P(τₛ < ∞) < 1`, kde `τₛ = inf{n ≥ 1 | X⁽ⁿ⁾ = s}` je doba prvního návratu.
* **Rekurentní** — návrat je jistý: `P(τₛ < ∞) = 1`. Rekurentní stav navštívíme *nekonečně mnohokrát* s pravděpodobností 1.

V *konečném* DTMC je každá komunikační třída buď tranzientní (lze ji opustit), nebo rekurentní (jakmile do ní vstoupíme, neopustíme ji). Ekvivalentně:

* **Rekurentní třída** = uzavřená podmnožina stavů, mezi nimiž je stavový prostor uzavřený (žádný odchozí přechod ven).
* **Tranzientní třída** = ne-uzavřená — vede z ní hrana ven.

### Pozitivní vs. nulová rekurence

V *nekonečném* DTMC se rekurence ještě rozpadne:

* **Pozitivně rekurentní**: `E[τₛ] < ∞` — průměrná doba návratu je konečná.
* **Nulově rekurentní**: `P(τₛ < ∞) = 1`, ale `E[τₛ] = ∞`.

V konečném DTMC je *každá* rekurence pozitivní (důsledek konečnosti).

## Perioda stavu

**Perioda** stavu `s` je největší společný dělitel:

::: math
d(s) = \gcd\!\left\{ n \ge 1 \mid P^n(s, s) > 0 \right\}.
:::

Stav je **aperiodický**, pokud `d(s) = 1`. Stavy ve stejné komunikační třídě sdílejí periodu (perioda je *třídní invariant*).

**Příklad periody.** V cyklu `s₀ → s₁ → s₂ → s₀` má každý stav periodu `3`. Návrat do `s₀` je možný jen v krocích `3, 6, 9, …` Aperiodicita znamená, že existují *různě dlouhé* cykly návratu — typicky alespoň jedna *smyčka* `P(s, s) > 0`.

::: svg "Periodický řetězec (perioda 3) vs. aperiodický (díky self-loopu na s₀)."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g transform="translate(20, 30)">
    <text x="100" y="-10" text-anchor="middle" fill="var(--text-muted)">perioda d=3</text>
    <circle cx="40" cy="80" r="20" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="40" y="84" text-anchor="middle">s₀</text>
    <circle cx="160" cy="40" r="20" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="160" y="44" text-anchor="middle">s₁</text>
    <circle cx="160" cy="120" r="20" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="160" y="124" text-anchor="middle">s₂</text>
    <path d="M 56 70 Q 100 30 140 40" stroke="var(--line-strong)" fill="none" marker-end="url(#arrA3)"/>
    <path d="M 158 60 L 158 100" stroke="var(--line-strong)" fill="none" marker-end="url(#arrA3)"/>
    <path d="M 140 122 Q 100 130 56 92" stroke="var(--line-strong)" fill="none" marker-end="url(#arrA3)"/>
  </g>
  <g transform="translate(310, 30)">
    <text x="100" y="-10" text-anchor="middle" fill="var(--text-muted)">aperiodický (d=1)</text>
    <circle cx="40" cy="80" r="20" fill="var(--bg-inset)" stroke="var(--accent-line)"/>
    <text x="40" y="84" text-anchor="middle">s₀</text>
    <circle cx="160" cy="40" r="20" fill="var(--bg-inset)" stroke="var(--accent-line)"/>
    <text x="160" y="44" text-anchor="middle">s₁</text>
    <circle cx="160" cy="120" r="20" fill="var(--bg-inset)" stroke="var(--accent-line)"/>
    <text x="160" y="124" text-anchor="middle">s₂</text>
    <path d="M 56 70 Q 100 30 140 40" stroke="var(--line-strong)" fill="none" marker-end="url(#arrA3)"/>
    <path d="M 158 60 L 158 100" stroke="var(--line-strong)" fill="none" marker-end="url(#arrA3)"/>
    <path d="M 140 122 Q 100 130 56 92" stroke="var(--line-strong)" fill="none" marker-end="url(#arrA3)"/>
    <path d="M 20 80 C 0 60, 0 100, 20 88" stroke="var(--line-strong)" fill="none" marker-end="url(#arrA3)"/>
    <text x="0" y="105" fill="var(--text-muted)" font-size="10">self</text>
  </g>
  <defs><marker id="arrA3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--line-strong)"/></marker></defs>
</svg>
:::

## Ergodicita

DTMC je **ergodický**, pokud je *ireducibilní*, *aperiodický* a *pozitivně rekurentní*. Pro takový řetězec platí klíčová věta:

> **Existuje jediná stacionární distribuce `π`** a počáteční rozdělení k ní *konverguje* nezávisle na `ι₀`:
>
> `lim_{k→∞} t⁽ᵏ⁾(s) = π(s)` pro každé `s`.

V konečném prostoru je tato distribuce jednoznačně dána soustavou rovnic `π · P = π`, `Σ π(s) = 1` — viz [[steady-state]].

### Co když řetězec není ergodický?

* **Reducibilní** — existuje více rekurentních tříd; limitní distribuce *závisí* na startu (jaká je pravděpodobnost dosáhnout které rekurentní třídy).
* **Periodický** — `t⁽ᵏ⁾` *osciluje*, ke konvergenci dochází jen pro Cesàrovský průměr `(1/n) Σ_{k<n} t⁽ᵏ⁾`.
* **Nulově rekurentní** (jen nekonečné DTMC) — stacionární distribuce neexistuje.

## Speciální stavy

* **Absorpční stav** `s` — `P(s, s) = 1`. Jakmile vstoupíme, nikdy neopustíme. Triviálně rekurentní; tvoří jednoprvkovou rekurentní třídu.
* **Pohlcující řetězec** (absorbing chain) — všechny rekurentní třídy jsou absorpční. Klíčový pro výpočet *očekávaného počtu kroků* a *pravděpodobnosti pohlcení* — viz [[reachability]].

## Konstrukční algoritmus klasifikace

Pro daný DTMC `(S, P)`:

1. Postav orientovaný graf přechodů (hrana `s → s'` ⇔ `P(s, s') > 0`).
2. Najdi *silně souvislé komponenty* (SCC) — to jsou komunikační třídy.
3. Pro každou SCC zkontroluj, zda z ní existuje hrana ven:
   * **ano** ⇒ tranzientní třída,
   * **ne** ⇒ rekurentní třída (uzavřená).
4. Pro periodu: hledej cykly v SCC; `gcd` jejich délek dá periodu.

Algoritmus na hledání SCC (Tarjan, Kosaraju) běží v `O(|S| + |edges|)`.

::: viz mc-classification "4 příklady DTMC; SCCs jsou automaticky obarveny (zelená rekurentní / oranžová tranzientní), perioda spočtena z cyklů."
:::

::: link "Norris, J. R.: Markov Chains, Cambridge 1997, kap. 1 — communicating classes" "https://www.statslab.cam.ac.uk/~james/Markov/"
:::

::: link "Levin, D., Peres, Y.: Markov Chains and Mixing Times (AMS 2017)" "https://pages.uoregon.edu/dlevin/MARKOV/"
:::

---

*Zdroj: MSP přednášky 2025/26, *Markov Chains* (Češka). Externí reference: Norris, J. R.: *Markov Chains* (Cambridge 1997), kap. 1.4–1.7; Baier, C., Katoen, J.-P.: *Principles of Model Checking* (MIT Press 2008), kap. 10.1; Levin, D., Peres, Y., Wilmer, E.: *Markov Chains and Mixing Times* (AMS 2017), kap. 1.*
