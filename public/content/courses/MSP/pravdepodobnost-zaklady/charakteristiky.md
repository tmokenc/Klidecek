---
title: Charakteristiky náhodných veličin
---

# Charakteristiky náhodných veličin

CDF popisuje rozdělení NV *kompletně*, ale často potřebujeme jednodušší „shrnutí" — *charakteristiky*. Nejdůležitější jsou střední hodnota (kde rozdělení leží) a rozptyl (jak je rozprostřené). Z nich se odvozují další: směrodatná odchylka, kovariance, korelace, momenty.

## Střední hodnota (expectation)

**Střední hodnota** NV `X` je „vážený průměr" jejích hodnot. Pro diskrétní:

::: math
E[X] = \sum_x x \cdot p(x).
:::

Pro spojitou:

::: math
E[X] = \int_{-\infty}^{+\infty} x \cdot f(x)\, dx.
:::

(Pokud integrál/suma diverguje, střední hodnota *neexistuje*; klasický příklad: Cauchyho rozdělení.)

### Vlastnosti

Pro NV `X, Y` a konstanty `a, b ∈ R`:

* **linearita** — `E[aX + b] = a · E[X] + b`
* **aditivita** — `E[X + Y] = E[X] + E[Y]` (*platí vždy*, i pro závislé `X, Y`)
* **monotonie** — `X ≤ Y a.s. ⇒ E[X] ≤ E[Y]`
* `E[X · Y] = E[X] · E[Y]` jen pro **nezávislé** `X, Y`.

### Zákon nevědomého statistika (LOTUS)

Pro funkci NV `Y = g(X)` neexistuje univerzální vzorec pro distribuci `Y`, ale střední hodnotu spočteme přímo:

::: math
E[g(X)] = \sum_x g(x) p(x) \quad \text{resp.} \quad \int g(x) f(x)\, dx.
:::

Příklad — `E[X²]` se počítá jako `Σ x² p(x)`, *nikoli* `(E[X])²` (Jensenova nerovnost):

::: math
E[X^2] \neq (E[X])^2 \text{ obecně.}
:::

## Rozptyl (variance)

**Rozptyl** kvantifikuje rozprostření kolem střední hodnoty:

::: math
\mathrm{Var}(X) = E\!\left[ (X - E[X])^2 \right] = E[X^2] - (E[X])^2.
:::

**Směrodatná odchylka**: `σ(X) = √Var(X)` (má stejnou jednotku jako `X`).

### Vlastnosti

* `Var(X) ≥ 0` a `Var(X) = 0` ⇔ `X = c` a.s. (skoro jistě konstantní)
* `Var(aX + b) = a² · Var(X)` (posun nemá vliv, škála se umocní)
* `Var(X + Y) = Var(X) + Var(Y) + 2 · cov(X, Y)`
* pro **nezávislé** `X, Y`: `Var(X ± Y) = Var(X) + Var(Y)`

## Kovariance a korelace

**Kovariance** měří *lineární* společný pohyb dvou NV:

::: math
\mathrm{cov}(X, Y) = E\!\left[ (X - E[X])(Y - E[Y]) \right] = E[XY] - E[X] E[Y].
:::

**(Pearsonův) korelační koeficient** normalizuje na `[-1, 1]`:

::: math
\rho(X, Y) = \frac{\mathrm{cov}(X, Y)}{\sigma(X)\, \sigma(Y)}.
:::

* `ρ = 1` ⇔ existuje `a > 0, b`: `Y = aX + b` a.s. (perfektní pozitivní lineární vztah)
* `ρ = -1` analogicky pro `a < 0`
* `ρ = 0` ⇔ `X, Y` jsou *nekorelované* — *neimplikuje* nezávislost (kromě normálního rozdělení).

**Příklad nezávislosti ≠ nekorelovanost.** Buď `X ∼ Unif(-1, 1)` a `Y = X²`. Pak `cov(X, Y) = E[X³] − E[X] · E[X²] = 0 − 0 = 0`, ale `Y` je deterministická funkce `X` — silně závislé.

## Momenty

**k-tý moment** NV `X`: `μ_k = E[X^k]`. **k-tý centrální moment**: `μ_k' = E[(X − E[X])^k]`.

* `μ₁ = E[X]` — střední hodnota
* `μ₂' = Var(X)` — rozptyl
* `μ₃' / σ³` — *šikmost* (skewness): asymetrie kolem střední hodnoty
* `μ₄' / σ⁴ − 3` — *špičatost* (excess kurtosis): „tlustost ocasů" vůči normálnímu rozdělení

Momenty se používají v **metodě momentů** pro odhad parametrů — viz [[metoda-momentu]].

## Markovova a Čebyševova nerovnost

Bez znalosti přesného rozdělení lze odhadnout *chvosty* (tails):

**Markovova nerovnost** (pro nezápornou NV `X` a `a > 0`):

::: math
P(X \ge a) \le \frac{E[X]}{a}.
:::

**Čebyševova nerovnost** (pro NV s konečným rozptylem, `k > 0`):

::: math
P\!\left( |X - E[X]| \ge k\sigma \right) \le \frac{1}{k^2}.
:::

Důsledek: nejméně 75 % rozdělení leží v intervalu `μ ± 2σ`, nejméně 89 % v `μ ± 3σ`. (Pro *normální* rozdělení je to ale `95 %` a `99,7 %` — proto je Čebyšev *konzervativní*.)

## Zákon velkých čísel a centrální limitní věta

Pro i.i.d. vzorek `X₁, …, Xₙ` se střední hodnotou `μ` a konečným rozptylem `σ²`:

**Zákon velkých čísel (silný)** — výběrový průměr konverguje k populační střední hodnotě:

::: math
\bar{X}_n = \frac{1}{n} \sum_{i=1}^n X_i \xrightarrow{\text{a.s.}} \mu.
:::

**Centrální limitní věta (CLT)** — standardizovaný výběrový průměr má asymptoticky *normální* rozdělení, bez ohledu na původní rozdělení `Xᵢ` (pokud existuje konečný `σ²`):

::: math
\frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}} \xrightarrow{d} \mathcal{N}(0, 1).
:::

CLT je *zdroj univerzálnosti normálního rozdělení* ve statistice — vysvětluje, proč se s `Z`-testy a `t`-testy ([[t-test]]) potkáme na každém kroku.

::: viz biasvar "Manipulujte se vzorkem: pozorujte vztah mezi rozptylem a šířkou rozdělení."
:::

::: viz law-of-large-numbers "Sledujte X̄_n → μ s rostoucím n. Pro Cauchyho rozdělení LLN selhává (žádné E[X])."
:::

::: viz clt-sampling-converge "Vyberte zdrojové rozdělení, posuvníkem n; histogram X̄_n se blíží N(μ, σ²/n) — CLT v akci."
:::

::: link "Casella, G., Berger, R.: Statistical Inference (Cengage 2002), kap. 2" "https://www.cengage.com/c/statistical-inference-2e-casella"
:::

::: link "Wasserman, L.: All of Statistics — kap. 3 (Expectation)" "https://www.stat.cmu.edu/~larry/all-of-statistics/"
:::

---

*Zdroj: MSP přednášky 2025/26, *Probability in Computer Science* (Češka). Externí reference: Ross, S.: *A First Course in Probability* (Pearson 2019), kap. 7–8; Casella, G., Berger, R.: *Statistical Inference* (Cengage 2002), kap. 2–5; Mitzenmacher, M., Upfal, E.: *Probability and Computing* (Cambridge 2017), kap. 3–4.*
