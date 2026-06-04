---
title: Statistická inference a likelihood
---

# Statistická inference a likelihood

**Statistická inference** je aparát pro vyvozování závěrů z dat — typicky o *neznámých parametrech* pravděpodobnostního rozdělení. Likelihood (věrohodnost) je centrální pojem celé statistické části: je to *spojení mezi modelem (rozdělení s parametrem) a daty (vzorek)*.

## Statistický model

**Statistický model** je dvojice:

* **Rodina rozdělení** `{f(x; θ) : θ ∈ Θ}` parametrizovaná `θ ∈ Θ ⊂ R^k` (prostor parametrů).
* **Vzorek** — i.i.d. realizace `X = (X₁, …, Xₙ)` z `f(·; θ)`, kde `θ` je *neznámé*.

### Příklad — doba do selhání komponenty

Firma modeluje dobu do selhání komponenty exponenciálním rozdělením `Exp(λ)` (memoryless model). Parametr `λ > 0` (intenzita selhání) není znám. Z pozorování `X₁, …, Xₙ` (doby selhání `n` testovacích kusů) chceme `λ` *odhadnout*.

* Statistický model: `{Exp(λ) : λ > 0}`, `Θ = R₊`.
* Vzorek: `X₁, …, Xₙ ∼ Exp(λ)` i.i.d.
* Otázka: na základě `X` co můžeme říct o `λ`?

### Typy inference

* **Bodový odhad** — najít *jedinou* hodnotu `θ̂(X)` jako náš nejlepší odhad `θ`. (Tato kapitola.)
* **Intervalový odhad** — najít *interval* `[θ̂_L(X), θ̂_U(X)]`, který obsahuje pravý `θ` s pravděpodobností (např.) 95 % ([[intervaly-spolehlivosti]]).
* **Testování hypotéz** — rozhodnout mezi dvěma konkurenčními tvrzeními o `θ` ([[testovani-princip]]).

## Statistika a odhad

**Statistika** je libovolná funkce vzorku: `T = T(X₁, …, Xₙ)`. Statistika je *náhodná veličina* — její rozdělení závisí na `θ`.

**Odhad** (estimator) parametru `θ` (nebo jeho funkce `g(θ)`) je *speciální statistika* `θ̂(X)`, jejíž hodnotu používáme jako náš „nejlepší odhad" `θ`.

Příklady statistik:

* **Výběrový průměr**: `X̄ = (1/n) Σ Xᵢ` — odhad střední hodnoty.
* **Výběrový rozptyl**: `S² = (1/(n−1)) Σ (Xᵢ − X̄)²` — odhad rozptylu.
* **Výběrový medián**, **min**, **max** atd.

## Likelihood (věrohodnost)

Pro fixní vzorek `x = (x₁, …, xₙ)` a parametrickou rodinu `f(x; θ)` definujeme **likelihood funkci**:

::: math
L(\theta \mid x) = f(x_1, x_2, \dots, x_n \mid \theta) = \prod_{i=1}^{n} f(x_i \mid \theta) \quad \text{(předpoklad i.i.d.)}.
:::

Klíčový posun perspektivy:

* `f(x; θ)` jako *funkce `x`* při fixním `θ` = **rozdělení dat**.
* `L(θ | x)` jako *funkce `θ`* při fixním `x` = **likelihood** (věrohodnost). Hodnota `L(θ | x)` *není* pravděpodobnost — je to *věrohodnost* parametru vzhledem k datům.

### Log-likelihood

Z důvodů numerické stability i analytické pohodlnosti (logaritmus mění součin na součet) se obvykle pracuje s **log-likelihood**:

::: math
\ell(\theta \mid x) = \log L(\theta \mid x) = \sum_{i=1}^{n} \log f(x_i \mid \theta).
:::

Maximum `L` a `ℓ` se shodují (`log` je monotónní), ale `ℓ` se snadno derivuje.

### Příklad — Exp(λ)

Pro `Xᵢ ∼ Exp(λ)`:

::: math
f(x; \lambda) = \lambda e^{-\lambda x}, \quad x \ge 0.
:::

Likelihood pro vzorek `x = (x₁, …, xₙ)`:

::: math
L(\lambda) = \prod_{i=1}^{n} \lambda e^{-\lambda x_i} = \lambda^n e^{-\lambda \sum x_i}.
:::

Log-likelihood:

::: math
\ell(\lambda) = n \log \lambda - \lambda \sum_{i=1}^{n} x_i.
:::

Hledání `λ̂` maximalizujícího `ℓ` — viz [[mle]].

## Princip maximální věrohodnosti

**Fisherův princip:** odhadujme `θ` *tou hodnotou*, která činí pozorovaná data *nejpravděpodobnější*:

::: math
\hat{\theta}_{MLE}(x) = \arg\max_{\theta \in \Theta} L(\theta \mid x) = \arg\max_{\theta \in \Theta} \ell(\theta \mid x).
:::

Intuice: pokud jsme pozorovali konkrétní vzorek, věříme tomu `θ`, pro které byl tento vzorek nejlépe vysvětlitelný.

::: svg "Likelihood jako funkce θ: maximum (MLE) hledáme jako bod, kde derivace = 0."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <line x1="40" y1="140" x2="500" y2="140" stroke="var(--line-strong)"/>
    <line x1="40" y1="20" x2="40" y2="140" stroke="var(--line-strong)"/>
    <text x="35" y="146" text-anchor="end" fill="var(--text-muted)">0</text>
    <text x="270" y="160" text-anchor="middle" fill="var(--text-muted)">θ</text>
    <text x="20" y="80" text-anchor="middle" fill="var(--text-muted)" transform="rotate(-90 20 80)">L(θ|x)</text>
    <path d="M 40 140 Q 100 138 200 110 Q 280 35 360 110 Q 440 138 500 140" stroke="var(--accent)" stroke-width="2" fill="none"/>
    <line x1="280" y1="35" x2="280" y2="140" stroke="var(--accent-line)" stroke-dasharray="4 3"/>
    <text x="290" y="40" fill="var(--accent-line)">MLE θ̂</text>
    <circle cx="280" cy="35" r="4" fill="var(--accent)"/>
  </g>
</svg>
:::

## Aposteriorní rozdělení — náhled na bayesovský přístup

Frekventistický přístup (max likelihood) říká: `θ` je *fixní* neznáma, `θ̂` je *náhodná* funkce vzorku.

Bayesovský přístup ([[bayesovsky-odhad]]) říká: `θ` je *náhodná veličina* s **apriorním** rozdělením `π(θ)`. Po pozorování vzorku updatujeme přes Bayesovu větu:

::: math
\pi(\theta \mid x) = \frac{L(\theta \mid x)\, \pi(\theta)}{p(x)} \propto L(\theta \mid x) \cdot \pi(\theta).
:::

Bayes vrací *posteriorní* rozdělení nad `θ`, nikoli jediný bodový odhad. Klasický „bodový" výtah: posteriorní střední hodnota, modus (MAP), medián.

## Statistická chyba a její zdroje

Statistický odhad `θ̂(X)` je *náhodná veličina*. Liší se od pravé hodnoty `θ` ze dvou důvodů:

* **Šum vzorku** (sampling error) — pro malé `n` je `θ̂(X)` daleko od `θ`. Tato chyba *klesá s `n`* (zákon velkých čísel).
* **Bias** — systematická chyba dané *konstrukce* odhadu, `E[θ̂(X)] − θ ≠ 0` (na rozdíl od náhodného šumu vzorku). U mnoha odhadů bias s rostoucím `n` klesá k nule (asymptotická nestrannost) — např. `σ̂²_MLE` má bias `−σ²/n → 0`; jiné odhady mají bias nezávislý na `n`. Viz [[vlastnosti-odhadu]].

Cíl statistiky: zkonstruovat odhady, které jsou *konzistentní* (sampling error → 0 s `n → ∞`) a *nestranné* (bias = 0), pokud to jde.

## Aplikace statistické inference {tier=practice}

* **Engineering reliability** — odhad MTBF, MTTF pro spolehlivost systémů.
* **Medical trials** — odhad účinnosti léku (proporce úspěchů, hazard rates).
* **A/B testing** — která varianta UI je lepší? (= test rozdílů v středních hodnotách).
* **Machine learning** — MLE pro logistickou regresi, MAP pro regularizaci, Bayesovské sítě.
* **Quality control** — Six Sigma, control charts, ANOVA pro detekci variability.

::: viz mle-likelihood-curve "Přetahujte data na strip; sledujte tvar ℓ(θ) a posun θ̂. Více bodů → ostřejší maximum."
:::

::: link "DeGroot, M. H., Schervish, M. J.: Probability and Statistics (4th ed., Pearson 2012), kap. 7" "https://www.pearson.com/en-us/subject-catalog/p/probability-and-statistics/P200000006228"
:::

::: link "Wasserman, L.: All of Statistics, kap. 6–7" "https://www.stat.cmu.edu/~larry/all-of-statistics/"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=jEUhyGfDGmo" "SZZ: Bodové a intervalové odhady, statistické testy" "Tomáš Kocourek"
:::

::: youtube "https://www.youtube.com/watch?v=pYxNSUDSFH4" "In Statistics, Probability is not Likelihood." "StatQuest with Josh Starmer"
:::

*Zdroj: MSP přednášky 2025/26, *Advanced Statistics — Likelihood and likelihood estimators* (Hrabec). Externí reference: DeGroot, M., Schervish, M.: *Probability and Statistics* (4th ed., Pearson 2012), kap. 7.1–7.5; Anděl, J.: *Základy matematické statistiky* (Matfyzpress 2011, 3. vyd.); Casella, G., Berger, R.: *Statistical Inference* (Cengage 2002), kap. 6–7.*
