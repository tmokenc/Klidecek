---
title: Pravděpodobnost a Bayesovo pravidlo
---

# Pravděpodobnost a Bayesovo pravidlo

Pravděpodobnostní pohled je *společný jazyk* většiny strojového učení. Pozorování je *náhodná veličina*, model je *rozdělení*, učení je *odhad parametrů*. Tato sekce shrnuje nezbytný aparát: spojené/marginální/podmíněné rozdělení, pravidlo součtu, součinu a Bayesovo pravidlo.

## Diskrétní příklad — granáty a jablka

Mějme 150 trénovacích pozorování — pro každé známe **třídu** (granát × jablko) a *diskrétní* kategorii **váhy** (např. lightest…heaviest, 7 kategorií). Spočítáme tabulku počtů:

::: svg "Společná tabulka počtů (joint counts) pro 50 granátů a 100 jablek napříč 7 váhovými kategoriemi."
<svg viewBox="0 0 540 170" font-family="ui-sans-serif, system-ui" font-size="11">
  <g font-family="ui-monospace, monospace" font-size="10.5">
    <g fill="var(--text-muted)" text-anchor="middle">
      <text x="100" y="30">lightest</text>
      <text x="155" y="30">lighter</text>
      <text x="210" y="30">light</text>
      <text x="265" y="30">middle</text>
      <text x="320" y="30">heavy</text>
      <text x="375" y="30">heavier</text>
      <text x="430" y="30">heaviest</text>
      <text x="490" y="30" font-weight="600">Σ</text>
    </g>
    <g fill="var(--text)" text-anchor="end">
      <text x="50" y="62" font-weight="600">granát</text>
      <text x="50" y="92" font-weight="600">jablko</text>
      <text x="50" y="118" font-weight="600">Σ</text>
    </g>
    <g fill="var(--text)" text-anchor="middle">
      <text x="100" y="62">1</text>
      <text x="155" y="62">6</text>
      <text x="210" y="62">12</text>
      <text x="265" y="62">15</text>
      <text x="320" y="62" font-weight="600">12</text>
      <text x="375" y="62">2</text>
      <text x="430" y="62">2</text>
      <text x="490" y="62" font-weight="600">50</text>
      <text x="100" y="92">4</text>
      <text x="155" y="92">22</text>
      <text x="210" y="92">50</text>
      <text x="265" y="92">14</text>
      <text x="320" y="92" font-weight="600">6</text>
      <text x="375" y="92">3</text>
      <text x="430" y="92">1</text>
      <text x="490" y="92" font-weight="600">100</text>
      <text x="100" y="118">5</text>
      <text x="155" y="118">28</text>
      <text x="210" y="118">62</text>
      <text x="265" y="118">29</text>
      <text x="320" y="118" font-weight="600">18</text>
      <text x="375" y="118">5</text>
      <text x="430" y="118">3</text>
      <text x="490" y="118" font-weight="600">150</text>
    </g>
  </g>
  <g stroke="var(--line)" stroke-width="0.7" fill="none">
    <line x1="55" y1="40" x2="510" y2="40"/>
    <line x1="55" y1="70" x2="510" y2="70"/>
    <line x1="55" y1="100" x2="510" y2="100"/>
    <line x1="55" y1="128" x2="510" y2="128"/>
    <line x1="465" y1="14" x2="465" y2="128"/>
  </g>
</svg>
:::

Z této tabulky odvodíme všechny zajímavé pravděpodobnosti pomocí *maximum likelihood* odhadu (relativní četnost).

## Tři druhy pravděpodobnosti

**Spojené (joint)** rozdělení `P(X, Y)` — pravděpodobnost, že nastane *obojí*. Z tabulky: jedno políčko ÷ celkový součet.

::: math
P(\text{granát}, \text{heavy}) = \frac{12}{150} = 0{,}08
:::

**Marginální** rozdělení `P(X)` — pravděpodobnost jedné veličiny, „odintegrujeme" druhou. *Pravidlo součtu* (sum rule):

::: math
P(x) = \sum_y P(x, y)
:::

::: math
P(\text{granát}) = \sum_w P(\text{granát}, w) = \frac{50}{150} = \tfrac{1}{3}
:::

**Podmíněné (conditional)** rozdělení `P(X | Y)` — pravděpodobnost `X`, *víme-li*, že nastalo `Y`. *Pravidlo součinu* (product rule):

::: math
P(x, y) = P(x \mid y)\, P(y) = P(y \mid x)\, P(x)
:::

Z tabulky: `P(granát | heavy) = 12 / (12+6) = 12/18 ≈ 0,67` — víme-li, že objekt je těžký, je *dvakrát* pravděpodobnější, že je to granát než jablko, přestože *apriorní* `P(granát) = 1/3`.

## Bayesovo pravidlo

Spojením dvou tvarů pravidla součinu dostaneme **Bayesovu větu**:

::: math
P(y \mid x) = \frac{P(x \mid y)\, P(y)}{P(x)}
:::

Slovník:

* `P(y)` — **prior** (apriorní pravděpodobnost). Co si myslíme předtím, než vidíme data.
* `P(x | y)` — **likelihood** (věrohodnost). Jak pravděpodobné je vidět `x`, kdyby platilo `y`.
* `P(x)` — **evidence** (důkaz, marginální pravděpodobnost). Normalizační konstanta, často počítaná z `P(x) = Σ_y P(x | y) P(y)`.
* `P(y | x)` — **posterior** (aposteriorní pravděpodobnost). Co si myslíme po pozorování `x`.

V klasifikaci je `y` třída a `x` pozorování. **Maximum a-posteriori (MAP)** klasifikátor zvolí třídu maximalizující posterior:

::: math
\hat{c} = \arg\max_c P(c \mid \mathbf{x}) = \arg\max_c P(\mathbf{x} \mid c)\, P(c)
:::

(jmenovatel `P(x)` nezávisí na `c`, takže při argmaxu *odpadá*).

::: viz bayes-from-joint "Interaktivní tabulka granát/jablko; pick observation → uvidíte prior · likelihood / evidence = posterior krok po kroku; Laplace toggle."
:::

## Generativní vs. diskriminativní

Bayesova věta nabízí dvě cesty:

* **Generativní přístup** — odhadneme `P(x | c)` (model dat pro každou třídu) a `P(c)` (apriori). Klasifikujeme přes Bayes. Vidíme [[gaussovsky-klasifikator]].
* **Diskriminativní přístup** — odhadneme přímo `P(c | x)`, bez modelování `P(x | c)`. Méně předpokladů, ale „nepoznáme", jak data vypadají. Vidíme [[logisticka-regrese]].

## Spojitý případ — pravděpodobnostní hustota

Když jsou data spojitá, místo *pravděpodobnostní hmoty* `P(x)` pracujeme s *hustotou* `p(x)`. `P(a < x < b) = ∫_a^b p(x) dx`. Sum rule se mění na integrál:

::: math
p(x) = \int p(x, y)\, dy
:::

Bayes funguje stejně, jen `P` → `p`:

::: math
p(c \mid \mathbf{x}) = \frac{p(\mathbf{x} \mid c)\, P(c)}{p(\mathbf{x})}
:::

(třída je diskrétní → velké `P`; pozorování spojité → malé `p`).

## Klasický příklad — lékařský test

Test na vzácnou nemoc (prevalence `P(N) = 0,1 %`) má `99 %` *citlivost* (`P(+ | N) = 0,99`) a `99 %` *specificitu* (`P(− | ¬N) = 0,99`, tedy `P(+ | ¬N) = 0,01`).

Pozitivní výsledek — jaká je pravděpodobnost, že jsem nemocný?

::: math
P(N \mid +) = \frac{P(+ \mid N) P(N)}{P(+ \mid N) P(N) + P(+ \mid \neg N) P(\neg N)} = \frac{0{,}99 \cdot 0{,}001}{0{,}99 \cdot 0{,}001 + 0{,}01 \cdot 0{,}999} \approx 0{,}09
:::

Jen **9 %** — překvapivě málo. Důvod: falešně pozitivních (z 99,9 % zdravých) je víc než pravdivě pozitivních (z 0,1 % nemocných). Toto **base-rate fallacy** je klasický pedagogický příklad, proč intuice o pravděpodobnosti zrazuje.

## Nezávislost

Dvě veličiny jsou **nezávislé**, právě když:

::: math
P(x, y) = P(x)\, P(y) \quad \Longleftrightarrow \quad P(x \mid y) = P(x)
:::

V ML je důležitější **podmíněná nezávislost** — `X ⊥ Y | Z` znamená, že při daném `Z` jsou `X` a `Y` nezávislé. Toto je základ **Bayesovských sítí** a *naivního Bayesova klasifikátoru* (předpoklad, že featury jsou nezávislé v rámci třídy — naivní, ale často překvapivě funkční).

::: link "Stanford CS228: Probabilistic Graphical Models" "https://ermongroup.github.io/cs228-notes/"
:::

::: link "Bishop: Pattern Recognition and ML, Kapitola 1 — Probability theory" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Basics in Machine Learning* (Burget). Externí reference: Bishop, C.: *Pattern Recognition and Machine Learning* (Springer 2006), kap. 1.2; Murphy, K. P.: *Probabilistic Machine Learning: An Introduction* (MIT Press 2022) — [free PDF](https://probml.github.io/pml-book/book1.html); Tipping, M.: *Bayesian Inference: An Introduction to Principles and Practice in Machine Learning* (2003).*
