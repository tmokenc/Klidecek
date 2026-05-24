---
title: Důležitá rozdělení
---

# Důležitá rozdělení

Pro modelování v informatice si vystačíme s relativně malým inventářem rozdělení. Diskrétní (Bernoulli, binomické, geometrické, Poisson) modelují *počty* a *opakování*; spojitá (uniformní, exponenciální, normální, gamma) modelují *intervaly*, *doby* a *šum*. Znalost jejich PMF/PDF, střední hodnoty a rozptylu je nezbytná pro statistickou inferenci i pro Markovské modely.

## Diskrétní rozdělení

### Bernoulli — `X ∼ A(p)`

Binární výsledek (0/1) s pravděpodobností úspěchu `p`. Také *indikátorová NV* — pro libovolný jev `A` je `1_A ∼ A(P(A))`.

* PMF: `p(1) = p`, `p(0) = 1 − p`
* `E[X] = p`, `Var(X) = p(1 − p)`

**Použití:** hod mincí, jediný bit, zda paket dorazil.

### Binomické — `X ∼ Bi(n, p)`

Počet úspěchů v `n` *nezávislých* Bernoulli pokusech s parametrem `p`. Platí `X = Σ Xᵢ`, `Xᵢ ∼ A(p)`.

::: math
P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}, \quad k = 0, 1, \dots, n.
:::

* `E[X] = np`, `Var(X) = np(1 − p)`

**Použití:** počet vadných komponent ve šarži, počet úspěšných testů, počet doručených paketů.

### Geometrické — `X ∼ Ge(p)`

Počet pokusů do *prvního* úspěchu (varianta „počet *neúspěchů* před úspěchem" se taky používá — pozor na konvenci).

::: math
P(X = k) = (1-p)^{k-1} p, \quad k = 1, 2, \dots
:::

* `E[X] = 1/p`, `Var(X) = (1−p)/p²`
* **bezpaměťovost**: `P(X > m + n | X > m) = P(X > n)` — jediné diskrétní rozdělení s touto vlastností.

**Použití:** počet pokusů do navázání spojení, počet hashů do kolize.

### Poissonovo — `X ∼ Po(λ)`

Počet *vzácných nezávislých* událostí za jednotku času/objemu, kde `λ > 0` je očekávaný počet.

::: math
P(X = k) = \frac{\lambda^k e^{-\lambda}}{k!}, \quad k = 0, 1, 2, \dots
:::

* `E[X] = λ`, `Var(X) = λ` (charakteristické: střední hodnota = rozptyl)
* **Aproximace binomického**: `Bi(n, p) ≈ Po(np)` pro velké `n` a malé `p`, kde `np = λ` zůstává konstantní.

**Použití:** počet požadavků za vteřinu, počet HW chyb za den, počet emailů za hodinu.

### Multinomické — `(X₁, …, Xₖ) ∼ Mu(n, p₁, …, pₖ)`

Zobecnění binomického na `k` výsledků. Po `n` nezávislých pokusech, kdy každý má `k` možností s pravděpodobnostmi `p₁, …, pₖ` (`Σ pᵢ = 1`), je `Xᵢ` počet pozorování `i`-tého výsledku.

::: math
P(X_1 = n_1, \dots, X_k = n_k) = \frac{n!}{n_1! \cdots n_k!} \prod_{i=1}^{k} p_i^{n_i}, \quad \sum n_i = n.
:::

* `E[Xᵢ] = n pᵢ`, `Var(Xᵢ) = n pᵢ(1 − pᵢ)`

**Použití:** počet kategorií na výstupu klasifikátoru ([[kategorialni-data]]), počet hlasů ve volbách.

## Spojitá rozdělení

### Uniformní — `X ∼ U(a, b)`

Spojitá rovnoměrná distribuce na intervalu `[a, b]`:

::: math
f(x) = \frac{1}{b - a} \text{ pro } x \in [a, b], \text{ jinak } 0.
:::

* `E[X] = (a + b)/2`, `Var(X) = (b − a)²/12`

**Použití:** generátory náhodných čísel (po inverzi CDF), Las Vegas algoritmy.

### Exponenciální — `X ∼ Exp(λ)`

Doba do *první* události Poissonova procesu s intenzitou `λ > 0`. Spojitá obdoba geometrického.

::: math
f(x) = \lambda e^{-\lambda x} \text{ pro } x \ge 0, \quad F(x) = 1 - e^{-\lambda x}.
:::

* `E[X] = 1/λ`, `Var(X) = 1/λ²`
* **bezpaměťovost**: `P(X > s + t | X > s) = P(X > t)` — jediné spojité rozdělení s touto vlastností.

**Použití:** doba mezi pakety, doba do selhání HW (memoryless model), MTBF.

### Normální (Gaussovo) — `X ∼ N(μ, σ²)`

Nejdůležitější spojité rozdělení v celé statistice — díky [[charakteristiky|centrální limitní větě]].

::: math
f(x) = \frac{1}{\sigma \sqrt{2\pi}} \exp\!\left( -\frac{(x - \mu)^2}{2\sigma^2} \right).
:::

* `E[X] = μ`, `Var(X) = σ²`
* **standardizace**: `Z = (X − μ)/σ ∼ N(0, 1)`
* **stabilita součtu**: pro nezávislé `Xᵢ ∼ N(μᵢ, σᵢ²)` je `Σ Xᵢ ∼ N(Σμᵢ, Σσᵢ²)`
* **pravidlo 68-95-99,7**: `P(|X − μ| < kσ) ≈ {68%, 95%, 99,7%}` pro `k = 1, 2, 3`.

**Použití:** šum v měření, výška/IQ populace, residuály v lineární regresi ([[linearni-model]]).

::: svg "Hustota N(μ, σ²) pro tři volby σ. Větší σ ⇒ širší a plošší hustota."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g transform="translate(30, 20)">
    <line x1="0" y1="160" x2="480" y2="160" stroke="var(--line-strong)"/>
    <line x1="0" y1="0" x2="0" y2="160" stroke="var(--line-strong)"/>
    <text x="240" y="175" text-anchor="middle" fill="var(--text-muted)">μ</text>
    <line x1="240" y1="158" x2="240" y2="162" stroke="var(--line-strong)"/>
    <path d="M 0 158 Q 100 155 180 100 Q 240 20 300 100 Q 380 155 480 158" stroke="var(--accent)" stroke-width="2" fill="none"/>
    <path d="M 0 156 Q 120 150 180 130 Q 240 60 300 130 Q 360 150 480 156" stroke="var(--accent-line)" stroke-width="2" fill="none" opacity="0.8"/>
    <path d="M 0 153 Q 120 148 200 145 Q 240 95 280 145 Q 360 148 480 153" stroke="var(--text-muted)" stroke-width="2" fill="none" opacity="0.7"/>
    <text x="320" y="22" fill="var(--accent)">σ=0.6</text>
    <text x="320" y="44" fill="var(--accent-line)">σ=1.0</text>
    <text x="320" y="66" fill="var(--text-muted)">σ=1.8</text>
  </g>
</svg>
:::

### Gamma — `X ∼ Γ(k, θ)`

Zobecnění exponenciálního — doba do `k`-té události Poissonova procesu (`k` je *shape*, `θ = 1/λ` je *scale*):

::: math
f(x) = \frac{1}{\Gamma(k)\, \theta^k} x^{k-1} e^{-x/\theta}, \quad x > 0.
:::

* `E[X] = kθ`, `Var(X) = kθ²`
* `Γ(1, θ) = Exp(1/θ)` (speciální případ)
* **Erlangovo** rozdělení = Gamma s celočíselným `k`.

**Použití:** doba do `k`-tého selhání, modelování doby zpracování v frontách.

### Chí-kvadrát, t, F — odvozená rozdělení

Klíčová pro testování hypotéz a CI ([[dulezita-rozdeleni-testy]]):

* **χ²(n)** = `Σᵢ Zᵢ²`, kde `Zᵢ ∼ N(0,1)` i.i.d. (Gamma s `k = n/2`, `θ = 2`).
* **Studentovo t(n)** = `Z / √(V/n)`, kde `Z ∼ N(0,1)`, `V ∼ χ²(n)`, nezávislé.
* **Fisherovo F(n, m)** = `(U/n) / (V/m)`, kde `U ∼ χ²(n)`, `V ∼ χ²(m)`, nezávislé.

## Shrnutí — tabulka

::: svg "Souhrnná tabulka: PMF/PDF, E[X], Var(X) pro nejčastější rozdělení."
<svg viewBox="0 0 540 250" font-family="ui-sans-serif, system-ui" font-size="10.5">
  <g font-family="ui-monospace, monospace">
    <g fill="var(--text-muted)" text-anchor="middle">
      <text x="80" y="20" font-weight="600">rozdělení</text>
      <text x="220" y="20" font-weight="600">parametry</text>
      <text x="350" y="20" font-weight="600">E[X]</text>
      <text x="450" y="20" font-weight="600">Var(X)</text>
    </g>
    <g fill="var(--text)">
      <text x="80" y="50" text-anchor="middle">A(p)</text>
      <text x="220" y="50" text-anchor="middle">p ∈ [0,1]</text>
      <text x="350" y="50" text-anchor="middle">p</text>
      <text x="450" y="50" text-anchor="middle">p(1−p)</text>

      <text x="80" y="74" text-anchor="middle">Bi(n,p)</text>
      <text x="220" y="74" text-anchor="middle">n ∈ N, p ∈ [0,1]</text>
      <text x="350" y="74" text-anchor="middle">np</text>
      <text x="450" y="74" text-anchor="middle">np(1−p)</text>

      <text x="80" y="98" text-anchor="middle">Ge(p)</text>
      <text x="220" y="98" text-anchor="middle">p ∈ (0,1]</text>
      <text x="350" y="98" text-anchor="middle">1/p</text>
      <text x="450" y="98" text-anchor="middle">(1−p)/p²</text>

      <text x="80" y="122" text-anchor="middle">Po(λ)</text>
      <text x="220" y="122" text-anchor="middle">λ &gt; 0</text>
      <text x="350" y="122" text-anchor="middle">λ</text>
      <text x="450" y="122" text-anchor="middle">λ</text>

      <text x="80" y="146" text-anchor="middle">U(a,b)</text>
      <text x="220" y="146" text-anchor="middle">a &lt; b</text>
      <text x="350" y="146" text-anchor="middle">(a+b)/2</text>
      <text x="450" y="146" text-anchor="middle">(b−a)²/12</text>

      <text x="80" y="170" text-anchor="middle">Exp(λ)</text>
      <text x="220" y="170" text-anchor="middle">λ &gt; 0</text>
      <text x="350" y="170" text-anchor="middle">1/λ</text>
      <text x="450" y="170" text-anchor="middle">1/λ²</text>

      <text x="80" y="194" text-anchor="middle">N(μ,σ²)</text>
      <text x="220" y="194" text-anchor="middle">μ ∈ R, σ &gt; 0</text>
      <text x="350" y="194" text-anchor="middle">μ</text>
      <text x="450" y="194" text-anchor="middle">σ²</text>

      <text x="80" y="218" text-anchor="middle">Γ(k,θ)</text>
      <text x="220" y="218" text-anchor="middle">k, θ &gt; 0</text>
      <text x="350" y="218" text-anchor="middle">kθ</text>
      <text x="450" y="218" text-anchor="middle">kθ²</text>
    </g>
  </g>
  <g stroke="var(--line)" stroke-width="0.7" fill="none">
    <line x1="20" y1="28" x2="510" y2="28"/>
    <line x1="20" y1="56" x2="510" y2="56"/>
    <line x1="150" y1="6" x2="150" y2="232"/>
    <line x1="290" y1="6" x2="290" y2="232"/>
    <line x1="400" y1="6" x2="400" y2="232"/>
  </g>
</svg>
:::

::: viz distribution-gallery "Vyberte rozdělení, ladťte parametry; sledujte změnu PDF/PMF, E[X], Var(X) a vztahy mezi rodinami."
:::

::: link "Wikipedia: List of probability distributions" "https://en.wikipedia.org/wiki/List_of_probability_distributions"
:::

::: link "Forbes, Evans, Hastings, Peacock: Statistical Distributions (4th ed., Wiley 2010)" "https://onlinelibrary.wiley.com/doi/book/10.1002/9780470627242"
:::

---

*Zdroj: MSP přednášky 2025/26, *Probability in Computer Science* (Češka). Externí reference: Ross, S.: *A First Course in Probability* (Pearson 2019), kap. 4–6; Mitzenmacher, M., Upfal, E.: *Probability and Computing* (Cambridge 2017), kap. 1–4; Casella, G., Berger, R.: *Statistical Inference* (Cengage 2002), kap. 3.*
