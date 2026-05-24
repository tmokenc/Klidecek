---
title: DTMC — definice a matice přechodu
---

# DTMC — definice a matice přechodu

**Diskrétní Markovský řetězec** (DTMC, *discrete-time Markov chain*) je nejjednodušší pravděpodobnostní model dynamického systému: stavy `S` propojené pravděpodobnostními přechody, kde `Markovova vlastnost` říká, že další stav závisí *jen* na aktuálním stavu, ne na historii. Tento bezpaměťový předpoklad činí DTMC analyticky tažným a zároveň dostatečně silným pro modelování protokolů, front, randomizovaných algoritmů a mnoha biologických procesů.

## Markovova vlastnost

Posloupnost NV `X⁽⁰⁾, X⁽¹⁾, X⁽²⁾, …` na konečném/spočetném stavovém prostoru `S` je **Markovský řetězec**, pokud:

::: math
P\!\left( X^{(n+1)} = s \mid X^{(0)}, X^{(1)}, \dots, X^{(n)} \right) = P\!\left( X^{(n+1)} = s \mid X^{(n)} \right).
:::

Slovně: budoucnost závisí jen na *přítomnosti*, ne na minulosti. **Homogenní** Markovský řetězec splňuje navíc, že přechody nezávisí na čase `n` (matice přechodu se v čase nemění).

## Formální definice

DTMC je trojice `M = (S, P, ι₀)`, kde:

* `S` je konečná (nebo spočetná) množina stavů,
* `P : S × S → [0, 1]` je **pravděpodobnostní matice přechodu** — pro každé `s ∈ S` platí `Σ_{s' ∈ S} P(s, s') = 1` (každý řádek se sčítá na 1, *stochastická matice*),
* `ι₀ : S → [0, 1]` je **počáteční rozdělení** — `Σ_s ι₀(s) = 1`.

::: svg "DTMC: tři stavy s pravděpodobnostmi přechodu. Součet odchozích pravděpodobností v každém stavu = 1."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="12">
  <g>
    <circle cx="120" cy="100" r="32" fill="var(--bg-inset)" stroke="var(--accent)" stroke-width="2"/>
    <text x="120" y="104" text-anchor="middle" fill="var(--text)">start</text>
    <circle cx="290" cy="40" r="32" fill="var(--bg-inset)" stroke="var(--accent-line)" stroke-width="2"/>
    <text x="290" y="44" text-anchor="middle" fill="var(--text)">error</text>
    <circle cx="290" cy="160" r="32" fill="var(--bg-inset)" stroke="var(--accent)" stroke-width="2"/>
    <text x="290" y="164" text-anchor="middle" fill="var(--text)">deliv.</text>
    <path d="M 150 88 Q 210 30 260 38" stroke="var(--line-strong)" fill="none" marker-end="url(#arrow-m)"/>
    <text x="195" y="50" fill="var(--text-muted)" text-anchor="middle">0.9</text>
    <path d="M 150 112 Q 210 170 260 158" stroke="var(--line-strong)" fill="none" marker-end="url(#arrow-m)"/>
    <text x="195" y="160" fill="var(--text-muted)" text-anchor="middle">0.1</text>
    <path d="M 290 72 Q 360 100 290 128" stroke="var(--line-strong)" fill="none" marker-end="url(#arrow-m)"/>
    <text x="370" y="103" fill="var(--text-muted)">1.0</text>
    <path d="M 322 160 C 380 170, 380 130, 322 165" stroke="var(--line-strong)" fill="none" marker-end="url(#arrow-m)"/>
    <text x="395" y="165" fill="var(--text-muted)">1.0</text>
    <defs><marker id="arrow-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--line-strong)"/></marker></defs>
  </g>
  <g transform="translate(440, 60)" font-size="10.5" font-family="ui-monospace, monospace">
    <text x="0" y="0" fill="var(--text-muted)">P =</text>
    <text x="0" y="18" fill="var(--text)">[ 0  0.9  0.1 ]</text>
    <text x="0" y="34" fill="var(--text)">[ 0   0    1  ]</text>
    <text x="0" y="50" fill="var(--text)">[ 0   0    1  ]</text>
  </g>
</svg>
:::

## Cesty (paths)

**Cesta** je posloupnost stavů `s₀ s₁ s₂ …` taková, že `P(sᵢ, sᵢ₊₁) > 0` pro každé `i`. Cesta = jedno možné běhové vykonání systému.

**Pravděpodobnost konečné cesty** `s₀ s₁ … sₙ`:

::: math
P(s_0 s_1 \dots s_n) = P(s_0, s_1) \cdot P(s_1, s_2) \cdots P(s_{n-1}, s_n).
:::

Násobit smíme díky bezpaměťovosti (jednotlivé přechody jsou nezávislé).

**Pravděpodobnost nekonečné cesty** je *nenulová* jen v případě, že po konečně mnoha krocích `n` jsou všechny další přechody deterministické (`P(sᵢ, sᵢ₊₁) = 1`). Jinak je pravděpodobnost (každé jednotlivé) nekonečné cesty 0 — pracujeme proto se *zbytky* (cylindrické množiny cest).

### Příklad — protokol s opakováním

Mějme tři stavy: `start`, `error`, `delivered`. Z `start` přejdeme s `0,9` do `error` a s `0,1` do `delivered`. Z `error` jdeme jistě (s `1`) zpět do `start`. Stav `delivered` je absorpční.

* Pravděpodobnost doručení do 3 kroků:
  `P(start → delivered) + P(start → error → start → delivered) = 0,1 + 0,9 · 1 · 0,1 = 0,19`.
* Pravděpodobnost *eventuálního* doručení (geometrická řada):
  `Σ_{n≥0} (0,9 · 1)ⁿ · 0,1 = 0,1 / (1 − 0,9) = 1` ⇒ doručení je *jisté*.

## Reprezentace přechodů

### Maticová forma

Stavy očíslujeme `s₀, …, sₙ₋₁`. Pak `P` je matice `n × n`, kde `P[i,j] = P(sᵢ, sⱼ)`. Stav po `k` krocích z počátečního `ι₀` (řádkový vektor `1×n`) je:

::: math
\mathbf{t}^{(k)} = \mathbf{\iota}_0 \cdot P^k.
:::

Mocnina `Pᵏ` má v `(i, j)` přesně pravděpodobnost přesunu z `sᵢ` do `sⱼ` za přesně `k` kroků — Chapman-Kolmogorovova rovnost.

### Grafická forma

Orientovaný *labelovaný* graf: vrcholy = stavy, hrany = nenulové přechody, štítky = pravděpodobnosti.

## Souvislost s pravděpodobnostními procesy

Stav `X⁽ᵏ⁾` je *náhodná veličina* — DTMC je tedy *pravděpodobnostní proces* `{X⁽ᵏ⁾}_{k≥0}` na diskrétním čase. Klasifikace:

::: svg "Klasifikace pravděpodobnostních procesů: diskrétní/spojitý čas × plně pravděpodobnostní/nedeterministický."
<svg viewBox="0 0 540 170" font-family="ui-sans-serif, system-ui" font-size="11">
  <g font-size="10.5">
    <g fill="var(--text-muted)" text-anchor="middle">
      <text x="190" y="20">plně pravděpodobnostní</text>
      <text x="380" y="20">nedeterministický</text>
    </g>
    <g fill="var(--text-muted)" text-anchor="end">
      <text x="80" y="65">diskrétní čas</text>
      <text x="80" y="120">spojitý čas</text>
    </g>
    <g fill="var(--text)" text-anchor="middle">
      <text x="190" y="62" font-weight="600">DTMC</text>
      <text x="190" y="80" font-size="9.5">discrete-time Markov chain</text>
      <text x="380" y="62" font-weight="600">MDP</text>
      <text x="380" y="80" font-size="9.5">Markov decision process</text>
      <text x="190" y="117" font-weight="600">CTMC</text>
      <text x="190" y="135" font-size="9.5">continuous-time Markov chain</text>
      <text x="380" y="117" font-weight="600">CTMDP / IMC / PTA</text>
      <text x="380" y="135" font-size="9.5">probabilistic timed automata</text>
    </g>
  </g>
  <g stroke="var(--line)" stroke-width="0.7" fill="none">
    <line x1="100" y1="30" x2="480" y2="30"/>
    <line x1="100" y1="90" x2="480" y2="90"/>
    <line x1="100" y1="150" x2="480" y2="150"/>
    <line x1="100" y1="30" x2="100" y2="150"/>
    <line x1="285" y1="30" x2="285" y2="150"/>
    <line x1="480" y1="30" x2="480" y2="150"/>
  </g>
</svg>
:::

DTMC pokrývá *fully observable, discrete time* — viz [[mdp-definice]] pro generalizaci s nedeterminismem.

## Použití DTMC v informatice

* **Síťové protokoly** — pravděpodobnost úspěšného doručení, retry-modely.
* **Randomizované algoritmy** — analýza hiring problem, Quick Sort ([[quicksort-analyza]]).
* **PageRank** — Google's algoritmus počítá *steady-state* distribuci náhodné procházky.
* **Genetika a sekvenování** — modely mutací, hidden Markov models pro alignment.
* **Probabilistic model checking** — nástroje PRISM, Storm ([[prism-model-checking]]).

::: viz dtmc-simulator "Vyberte preset (protokol / periodický / ergodický / 2 rekurentní třídy); spusťte simulaci, sledujte t⁽ᵏ⁾."
:::

::: link "Baier, C., Katoen, J.-P.: Principles of Model Checking, kap. 10" "https://mitpress.mit.edu/9780262026499/principles-of-model-checking/"
:::

::: link "Setosa.io — Markov chains visual explainer" "https://setosa.io/ev/markov-chains/"
:::

---

*Zdroj: MSP přednášky 2025/26, *Probability in Computer Science — Lecture 1: Markov Chains* (Češka). Externí reference: Baier, C., Katoen, J.-P.: *Principles of Model Checking* (MIT Press 2008), kap. 10.1; Kwiatkowska, M., Norman, G., Parker, D.: *Stochastic Model Checking* (LNCS 2007); Norris, J. R.: *Markov Chains* (Cambridge 1997), kap. 1.*
