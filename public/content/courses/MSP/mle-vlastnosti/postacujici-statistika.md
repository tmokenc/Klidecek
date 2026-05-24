---
title: Postačující statistika a faktorizační kritérium
---

# Postačující statistika a faktorizační kritérium

**Postačující statistika** (sufficient statistic) je statistika `T(X)`, která „shrnuje všechny informace" o parametru `θ`, jež jsou ve vzorku obsažené — bez ztráty. Jakmile známe hodnotu `T(X)`, samotné `X` nepřináší žádnou další informaci o `θ`. Tato koncept je klíčový pro Rao-Blackwellovu větu (konstrukce UMVUE), exponenciální rodiny a obecně efektivní inference: místo `n` čísel stačí pracovat s `T(X)`, často nízkodimenzionálním shrnutím.

## Definice

Statistika `T(X)` je **postačující** pro `θ`, pokud podmíněné rozdělení `X` dané `T(X) = t` *nezávisí na `θ`*:

::: math
P(X = x \mid T(X) = t, \theta) = P(X = x \mid T(X) = t) \quad \forall \theta.
:::

Slovně: pokud známe `T(X)`, neznalost `θ` se nemění při znalosti `X`. `T` „vstřebává" parametrickou závislost.

## Příklad — Bernoulli

Pro `X₁, …, Xₙ ∼ Bernoulli(θ)` je statistika `T(X) = Σ Xᵢ` postačující pro `θ`.

**Důkaz**: Pro konkrétní vzorek `(x₁, …, xₙ)` s `t = Σ xᵢ`:

::: math
P(X = x \mid T = t, \theta) = \frac{\theta^t (1-\theta)^{n-t}}{\binom{n}{t} \theta^t (1-\theta)^{n-t}} = \frac{1}{\binom{n}{t}}.
:::

Tedy podmíněné rozdělení je *uniformní* nad všemi `(x₁, …, xₙ)` s `Σ xᵢ = t` — nezávisí na `θ`. ✓

## Faktorizační kritérium (Neyman-Fisher)

**Věta (faktorizační kritérium):** `T(X)` je postačující pro `θ` ⇔ existují funkce `u(x) ≥ 0` (nezávislá na `θ`) a `v(t, θ) ≥ 0` taková, že:

::: math
f(x; \theta) = u(x) \cdot v(T(x), \theta) \quad \forall x, \theta.
:::

To znamená — *PDF/PMF se dá faktorizovat* jako součin části závisející *jen na datech* (`u`) a části závisející na `θ` jen *přes statistiku* `T(x)` (`v`).

### Faktorizace pro vzorek

Pro i.i.d. vzorek `X₁, …, Xₙ`:

::: math
f(x_1, \dots, x_n; \theta) = \prod_{i=1}^{n} f(x_i; \theta) = u(\mathbf{x}) \cdot v(T(\mathbf{x}), \theta).
:::

`u(x)` zachycuje vše, co nezávisí na `θ`; `v` zachycuje parametrickou závislost přes `T`.

## Příklad — `N(μ, σ²)`, σ² známé

Pro vzorek `X = (X₁, …, Xₙ)`:

::: math
f(x; \mu) = \prod_{i=1}^{n} \frac{1}{\sigma\sqrt{2\pi}} \exp\!\left(-\frac{(x_i - \mu)^2}{2\sigma^2}\right) = \frac{1}{(\sigma\sqrt{2\pi})^n} \exp\!\left(-\frac{1}{2\sigma^2} \sum (x_i - \mu)^2\right).
:::

Rozepíšeme:

::: math
\sum (x_i - \mu)^2 = \sum x_i^2 - 2\mu \sum x_i + n\mu^2.
:::

Pak:

::: math
f(x; \mu) = \underbrace{\frac{1}{(\sigma\sqrt{2\pi})^n} \exp\!\left(-\frac{1}{2\sigma^2} \sum x_i^2\right)}_{u(x)} \cdot \underbrace{\exp\!\left(\frac{\mu}{\sigma^2} \sum x_i - \frac{n\mu^2}{2\sigma^2}\right)}_{v(T(x), \mu)},
:::

kde `T(x) = Σ xᵢ`. Tedy `T = Σ Xᵢ` (ekvivalentně `X̄`) je postačující pro `μ`. ✓

## Více parametrů — joint sufficiency

Pro vektor parametrů `θ = (θ₁, …, θₖ)` je vektor statistik `T = (T₁, …, Tₘ)` **společně postačující** (jointly sufficient), pokud podmíněné rozdělení `X | T = t` nezávisí na `θ`.

### Příklad — `N(μ, σ²)`, oba neznámé

`T = (Σ Xᵢ, Σ Xᵢ²)` (nebo ekvivalentně `(X̄, S²)`) je společně postačující pro `(μ, σ²)`. Faktorizace:

::: math
\exp\!\left(\frac{\mu}{\sigma^2} \sum x_i - \frac{n\mu^2}{2\sigma^2} - \frac{1}{2\sigma^2} \sum x_i^2\right).
:::

Závisí na datech jen přes `(Σ xᵢ, Σ xᵢ²)`. ✓

## Minimální postačující statistika

Postačujících statistik je obecně více (např. samo `X` je triviálně postačující). **Minimální postačující** statistika je *nejvíce zhuštěná* — funkce libovolné jiné postačující statistiky.

Formálně: `T` je minimální postačující, pokud pro každou jinou postačující `S` existuje funkce `h` taková, že `T = h(S)`.

### Konstrukce minimální postačující

* V **exponenciální rodině** ([[exponencialni-rodina]]) je `T(x) = (T₁(x), …, Tₖ(x))` z parametrizace přímo minimální postačující.
* Obecně: poměr `f(x; θ)/f(y; θ)` nezávisí na `θ` ⇔ `T(x) = T(y)`.

### Příklad

Pro `N(μ, σ²)` (oba parametry): `T = (X̄, S²)` je minimální postačující 2-dimenzionální. Žádná 1-dimenzionální statistika není postačující (na rozdíl od případu, kdy `σ²` je známé).

## Rao-Blackwellova věta

**Věta (Rao-Blackwell):** Buď `T(X)` postačující statistika a `δ̂(X)` libovolný nestranný odhad `θ`. Definujme:

::: math
\hat{\delta}^*(X) = E[\hat{\delta}(X) \mid T(X)].
:::

Pak `δ̂*` je:

1. **Funkce postačující statistiky** — `δ̂*` závisí jen na `T`,
2. **Nestranný** — `E[δ̂*] = E[E[δ̂ | T]] = E[δ̂] = θ`,
3. **Méně rozptylný** — `Var(δ̂*) ≤ Var(δ̂)`, s rovností ⇔ `δ̂` je už funkcí `T`.

Tedy: *„orahovat" nestranný odhad na postačující statistiku ho zlepší* (nebo ponechá stejný).

## Lehmann-Schefféova věta

**Věta:** Buď `T` *úplná* a *postačující* statistika. Pak každý nestranný odhad, který je funkcí `T`, je **UMVUE** (jedinečný nestranný odhad s nejmenším rozptylem).

**Úplná statistika**: jediná funkce `g(T)` s `E_θ[g(T)] = 0` pro všechna `θ` je `g ≡ 0` a.s.

Pro exponenciální rodiny jsou postačující statistiky obvykle úplné — Lehmann-Schefféova věta poskytne UMVUE.

### Příklad — UMVUE pro `λ` v Poisson

`Xᵢ ∼ Po(λ)`, `T = Σ Xᵢ ∼ Po(nλ)`, úplná a postačující. `X̄ = T/n` je nestranný odhad `λ`. ⇒ **UMVUE** `λ̂ = X̄`.

## Aplikace postačujících statistik

* **Komprese dat** — pro statistickou inference stačí uložit `T(X)`, ne celé `X`. Pro online algoritmy: sufficient statistic je *průběžně updatovatelná*.
* **EM algoritmus** — používá sufficient statistics pro update parametrů v M-stepu.
* **Map-reduce** — průměr, suma čtverců jsou postačující ⇒ snadno paralelizovatelné.
* **Konstrukce UMVUE** — Rao-Blackwell + Lehmann-Scheffé.
* **Bayesian update** — pro konjugované priory ([[bayesovsky-odhad]]) se posterior závisí jen na postačující statistice (Pitman-Koopman-Darmois věta).

## Pitman-Koopman-Darmois věta

**Věta (Pitman-Koopman-Darmois):** Pro hladkou rodinu rozdělení s *fixním* (na θ nezávislým) supportem je *konečně-dimenzionální* postačující statistika (stejná velikost jako `Θ`) pro libovolnou velikost vzorku ⇔ rodina patří do **exponenciální rodiny** ([[exponencialni-rodina]]).

To je *charakterizace* exponenciálních rodin: jsou to *přesně* ty rodiny, kde dokážeme „shrnout" libovolně velký vzorek do několika čísel.

::: viz sufficient-statistic-compress "n bitů Bernoulliho vzorku komprese na T = Σxᵢ — všechny posloupnosti se stejnou sumou jsou stejně pravděpodobné."
:::

::: link "Casella, G., Berger, R.: Statistical Inference, kap. 6.2" "https://www.cengage.com/c/statistical-inference-2e-casella"
:::

::: link "Lehmann, E. L., Casella, G.: Theory of Point Estimation, kap. 1.6" "https://link.springer.com/book/10.1007/b98854"
:::

---

*Zdroj: MSP přednášky 2025/26, *MLE properties — Sufficient Statistics* (Hrabec). Externí reference: DeGroot, M., Schervish, M.: *Probability and Statistics* (4th ed., Pearson 2012), kap. 7.7; Casella, G., Berger, R.: *Statistical Inference* (Cengage 2002), kap. 6.2; Lehmann, E. L., Casella, G.: *Theory of Point Estimation* (Springer 1998), kap. 1.6.*
