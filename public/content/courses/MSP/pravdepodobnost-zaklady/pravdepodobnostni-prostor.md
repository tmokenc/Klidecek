---
title: Pravděpodobnostní prostor
---

# Pravděpodobnostní prostor

Pravděpodobnostní prostor je matematický popis nejisté situace. Bez něj nejsou pojmy „pravděpodobnost události" ani „náhodná veličina" definovány. Tato kapitola pokládá axiomatický základ — vše, co následuje (Markovské řetězce, statistické odhady, testy hypotéz), na něj přímo odkazuje.

## Tři složky pravděpodobnostního prostoru

**Pravděpodobnostní prostor** je trojice `(Ω, A, P)`, kde:

* `Ω` je *neprázdný* základní (výběrový) prostor — množina všech možných výsledků experimentu.
* `A ⊆ 2^Ω` je *σ-algebra* (jevové pole) — množina podmnožin `Ω`, které se interpretují jako **jevy**. Splňuje:
  * `Ω ∈ A`,
  * uzavřenost vůči komplementu (`A ∈ A ⇒ Ω∖A ∈ A`),
  * uzavřenost vůči *spočetné* sjednoceni (`A₁, A₂, … ∈ A ⇒ ⋃ Aᵢ ∈ A`).
* `P : A → [0,1]` je *pravděpodobnostní míra* splňující Kolmogorovovy axiomy:
  * `P(Ω) = 1`,
  * σ-aditivita: pro spočetný systém *po dvou disjunktních* jevů `{Aᵢ}` platí `P(⋃ Aᵢ) = Σ P(Aᵢ)`.

::: math
P : \mathcal{A} \to [0,1], \quad P(\Omega) = 1, \quad P\!\left(\bigcup_{i=1}^{\infty} A_i\right) = \sum_{i=1}^{\infty} P(A_i) \text{ pro disjunktní } A_i.
:::

::: svg "Pravděpodobnostní prostor: experiment → výsledky (Ω) → jevy (A) → míra (P) na [0,1]."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <rect x="20" y="40" width="120" height="120" rx="60" ry="60" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="80" y="36" text-anchor="middle" fill="var(--text-muted)">experiment</text>
  <text x="80" y="105" text-anchor="middle" fill="var(--text)">Ω</text>
  <text x="80" y="122" text-anchor="middle" fill="var(--text-muted)" font-size="10">výsledky ω</text>
  <path d="M 145 100 L 195 100" stroke="var(--line-strong)" fill="none" marker-end="url(#arrA)"/>
  <defs><marker id="arrA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--line-strong)"/></marker></defs>
  <g transform="translate(200,40)">
    <rect width="160" height="120" rx="8" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="80" y="-6" text-anchor="middle" fill="var(--text-muted)">jevové pole A</text>
    <ellipse cx="50" cy="55" rx="32" ry="22" fill="none" stroke="var(--accent)" stroke-width="1.5"/>
    <text x="50" y="58" text-anchor="middle" fill="var(--accent)">A</text>
    <ellipse cx="110" cy="75" rx="34" ry="24" fill="none" stroke="var(--accent-line)" stroke-width="1.5"/>
    <text x="110" y="78" text-anchor="middle" fill="var(--accent-line)">B</text>
  </g>
  <path d="M 365 100 L 415 100" stroke="var(--line-strong)" fill="none" marker-end="url(#arrA)"/>
  <g transform="translate(420,40)">
    <line x1="0" y1="120" x2="100" y2="120" stroke="var(--line-strong)"/>
    <line x1="0" y1="0" x2="0" y2="120" stroke="var(--line-strong)"/>
    <text x="-6" y="6" text-anchor="end" fill="var(--text-muted)">1</text>
    <text x="-6" y="123" text-anchor="end" fill="var(--text-muted)">0</text>
    <line x1="-3" y1="30" x2="3" y2="30" stroke="var(--accent)"/>
    <text x="50" y="33" fill="var(--accent)">P(A)</text>
    <line x1="-3" y1="80" x2="3" y2="80" stroke="var(--accent-line)"/>
    <text x="50" y="83" fill="var(--accent-line)">P(B)</text>
    <text x="50" y="-6" text-anchor="middle" fill="var(--text-muted)">míra P</text>
  </g>
</svg>
:::

### Proč σ-algebra

Pro konečnou nebo spočetnou `Ω` můžeme vzít `A = 2^Ω` (všechny podmnožiny). Pro nespočetnou `Ω` (např. `Ω = [0,1]`) ale *žádná* σ-aditivní míra na `2^Ω` neexistuje (Vitaliho paradox). Volíme proto menší σ-algebru — typicky **Borelovskou** σ-algebru `B(R)` generovanou otevřenými intervaly. Toto omezení je technické: prakticky všechny zajímavé množiny jsou borelovské.

## Základní vlastnosti

Pro každý pravděpodobnostní prostor `(Ω, A, P)` a jevy `A, B ∈ A`:

* `P(∅) = 0`
* `P(Ω∖A) = 1 − P(A)` (komplementární jev)
* `P(A ∪ B) = P(A) + P(B) − P(A ∩ B)` (vzorec o zahrnutí a vyloučení)
* `A ⊆ B ⇒ P(A) ≤ P(B)` (monotonie)
* Boolova nerovnost: `P(⋃ Aᵢ) ≤ Σ P(Aᵢ)` (bez disjunktnosti)

Zkrácený zápis: `P(A, B) := P(A ∩ B)`.

### Příklad — třístranná kostka

`Ω = {1, 2, 3}`, `A = 2^Ω`, `P(A) = |A|/3`. Pak `P({1, 2}) = 2/3`. Lze ale zvolit i *jinou* σ-algebru — např. `A₂ = {∅, {1, 3}, {2}, Ω}` popisuje jen *sudost/lichost* výsledku.

## Podmíněná pravděpodobnost a nezávislost

Pro `P(B) > 0` definujeme **podmíněnou pravděpodobnost**:

::: math
P(A \mid B) = \frac{P(A \cap B)}{P(B)}.
:::

Jevy `A, B` jsou **nezávislé** ⇔ `P(A ∩ B) = P(A) · P(B)`. Ekvivalentně (je-li `P(B) > 0`): `P(A | B) = P(A)` — pozorování `B` nemění naši víru v `A`.

**Příklad.** Hod šestistěnnou kostkou padl na sudé číslo. Pravděpodobnost, že to byla 1, 2 nebo 3:

::: math
P(\{1,2,3\} \mid \{2,4,6\}) = \frac{P(\{2\})}{P(\{2,4,6\})} = \frac{1/6}{1/2} = \frac{1}{3}.
:::

### Bayesova věta

Spojením symetrie `P(A∩B) = P(A|B)P(B) = P(B|A)P(A)` dostaneme:

::: math
P(A \mid B) = \frac{P(B \mid A)\, P(A)}{P(B)}.
:::

Toto je *fundamentální* vzorec celé bayesovské statistiky — viz [[bayesovsky-odhad]].

### Věta o úplné pravděpodobnosti

Tvoří-li `{B₁, …, Bₙ}` *rozklad* `Ω` (po dvou disjunktní s `P(Bᵢ) > 0` a `⋃ Bᵢ = Ω`), pak pro libovolný jev `A`:

::: math
P(A) = \sum_{i=1}^{n} P(A \mid B_i)\, P(B_i).
:::

## Vztah k informatice — proč to potřebujeme

Pravděpodobnost slouží v informatice k:

* **modelování nejistoty** — spolehlivost komponent, neznámé prostředí, šum v datech,
* **randomizaci** — randomizované algoritmy ([[las-vegas-monte-carlo]]), kryptografie, distribuované rozhodování,
* **vyhodnocování výkonu** — průměrné/asymptotické chování algoritmů, fronty,
* **stochastické řízení** — MDP ([[mdp-definice]]),
* **statistické učení** — inference parametrů z dat ([[mle]]).

Bez korektní formalizace prostoru `(Ω, A, P)` jsou všechna tato použití na vodě.

::: viz sample-space-events "Vennův diagram s posuvníky P(A), P(B), P(A∩B); pozorujte P(A∪B), P(A|B), test nezávislosti."
:::

::: link "Tao, T.: An Introduction to Measure Theory (UCLA notes)" "https://terrytao.files.wordpress.com/2011/01/measure-book1.pdf"
:::

::: link "Stanford CS109 — Probability for Computer Scientists" "https://web.stanford.edu/class/cs109/"
:::

---

*Zdroj: MSP přednášky 2025/26, *Probability in Computer Science* (Češka, Andriushchenko). Externí reference: Baier, C., Katoen, J.-P.: *Principles of Model Checking* (MIT Press 2008), kap. 10; Mitzenmacher, M., Upfal, E.: *Probability and Computing* (Cambridge 2017), kap. 1; Ross, S.: *A First Course in Probability* (Pearson, 10th ed., 2019).*
