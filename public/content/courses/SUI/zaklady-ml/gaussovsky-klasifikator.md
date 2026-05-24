---
title: Gaussovský klasifikátor a směsi
---

# Gaussovský klasifikátor

Pro **generativní** přístup ke klasifikaci spojitých dat (viz [[pravdepodobnost-bayes]]) potřebujeme modelovat hustotu `p(x | c)` pro každou třídu. Nejjednodušší volba — *vícerozměrné Gaussovo (normální) rozdělení*.

## 1D Gaussovo rozdělení

::: math
\mathcal{N}(x; \mu, \sigma^2) = \frac{1}{\sqrt{2\pi}\,\sigma}\exp\!\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)
:::

* `μ` — střední hodnota (peak hustoty).
* `σ²` — rozptyl (šířka).

::: svg "1D Gaussovy hustoty pro různé parametry: posun (μ) a rozpětí (σ)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6" fill="none">
    <line x1="40" y1="170" x2="510" y2="170"/>
    <line x1="40" y1="20" x2="40" y2="170"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="160" y="186">−2</text>
    <text x="280" y="186">0</text>
    <text x="400" y="186">2</text>
    <text x="520" y="186">x</text>
  </g>
  <g fill="none" stroke-width="1.6">
    <path stroke="var(--accent)" d="M 60 170 C 180 170 220 30 280 30 C 340 30 380 170 500 170"/>
    <path stroke="#e08a3a" d="M 60 168 C 200 168 250 80 320 80 C 390 80 440 168 510 168" stroke-dasharray="5 3"/>
    <path stroke="#7fbf6c" d="M 60 168 C 140 168 200 110 240 110 C 280 110 340 168 500 168" stroke-dasharray="2 3"/>
  </g>
  <g fill="var(--text)" font-size="10">
    <text x="290" y="44">μ=0, σ=1</text>
    <text x="350" y="92"><tspan fill="#e08a3a">μ=1, σ=1.4</tspan></text>
    <text x="210" y="122"><tspan fill="#7fbf6c">μ=−1, σ=1.8</tspan></text>
  </g>
</svg>
:::

## Maximum likelihood odhad (ML)

Z `N` nezávislých vzorků `x₁..x_N` ze stejného Gaussovu hledáme parametry `(μ, σ²)`, které dělají data *nejvíc pravděpodobnými*. Funkce *věrohodnosti* (likelihood):

::: math
\mathcal{L}(\mu, \sigma^2) = \prod_{n=1}^{N} \mathcal{N}(x_n; \mu, \sigma^2)
:::

Logaritmováním (log-likelihood je *konkávní* a maximum nalezne se snadno) a derivováním = 0 dostaneme uzavřené řešení:

::: math
\hat{\mu} = \frac{1}{N}\sum_{n=1}^{N} x_n, \qquad \hat{\sigma}^2 = \frac{1}{N}\sum_{n=1}^{N}(x_n - \hat{\mu})^2
:::

Tedy ML odhady jsou prostě výběrový **průměr** a **rozptyl**. (Jde o *biased* odhad rozptylu — nestranný odhad má `1/(N−1)` místo `1/N`; rozdíl mizí pro velké `N`.)

## Vícerozměrné Gaussovo rozdělení

Pro `x ∈ R^D`:

::: math
\mathcal{N}(\mathbf{x}; \boldsymbol{\mu}, \boldsymbol{\Sigma}) = \frac{1}{(2\pi)^{D/2} |\boldsymbol{\Sigma}|^{1/2}}\exp\!\left(-\tfrac{1}{2}(\mathbf{x}-\boldsymbol{\mu})^\top \boldsymbol{\Sigma}^{-1}(\mathbf{x}-\boldsymbol{\mu})\right)
:::

* `μ ∈ R^D` — střední hodnota (centroid).
* `Σ ∈ R^{D×D}` — *kovarianční* matice. Symetrická, pozitivně definitní. Diagonála = rozptyly jednotlivých feature; mimo-diagonální prvky = kovariance.

Hustota má tvar *elipsoidů* s osami danými vlastními vektory `Σ` a poloosami úměrnými `√λᵢ`. Speciální případy:

* `Σ = σ² I` — *kulové* (sférické), všechny osy stejně dlouhé.
* `Σ` diagonální — *osově orientované* elipsoidy.
* `Σ` plné — *šikmé* elipsoidy (kovariance mezi featury).

Maximum likelihood odhady jsou analogické:

::: math
\hat{\boldsymbol{\mu}} = \frac{1}{N}\sum_{n} \mathbf{x}_n, \qquad \hat{\boldsymbol{\Sigma}} = \frac{1}{N}\sum_{n} (\mathbf{x}_n - \hat{\boldsymbol{\mu}})(\mathbf{x}_n - \hat{\boldsymbol{\mu}})^\top
:::

## Gaussovský klasifikátor

Pro každou třídu `c` *odděleně* odhadneme `(μ_c, Σ_c)` z trénovacích vzorků této třídy. Apriorní `P(c)` = relativní četnost. Posterior přes Bayes:

::: math
P(c \mid \mathbf{x}) = \frac{\mathcal{N}(\mathbf{x}; \boldsymbol{\mu}_c, \boldsymbol{\Sigma}_c) \cdot P(c)}{\sum_{c'} \mathcal{N}(\mathbf{x}; \boldsymbol{\mu}_{c'}, \boldsymbol{\Sigma}_{c'}) \cdot P(c')}
:::

MAP klasifikace: vybereme třídu s nejvyšším čitatelem.

### Tvar decision boundary

* **Stejné Σ pro všechny třídy** (`Σ_c = Σ`) — boundary je **lineární** (hyperplochy). Tato varianta se jmenuje *Linear Discriminant Analysis* (LDA).
* **Různá Σ_c** — boundary je **kvadratická** (paraboly, hyperboly, elipsy). *Quadratic Discriminant Analysis* (QDA).

::: svg "Gaussovský klasifikátor pro 2 třídy: elipsy hustot, decision boundary mezi nimi."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6" fill="none">
    <rect x="40" y="20" width="460" height="180"/>
  </g>
  <g fill="none" stroke-width="1.5">
    <ellipse cx="180" cy="80" rx="58" ry="38" stroke="var(--accent)" transform="rotate(15 180 80)"/>
    <ellipse cx="180" cy="80" rx="38" ry="22" stroke="var(--accent)" transform="rotate(15 180 80)" stroke-dasharray="3 3"/>
    <ellipse cx="380" cy="150" rx="72" ry="40" stroke="#e08a3a" transform="rotate(-20 380 150)"/>
    <ellipse cx="380" cy="150" rx="48" ry="22" stroke="#e08a3a" transform="rotate(-20 380 150)" stroke-dasharray="3 3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <circle cx="180" cy="80" r="3" fill="var(--accent)"/>
    <circle cx="380" cy="150" r="3" fill="#e08a3a"/>
    <text x="180" y="68" font-size="10" font-weight="600">μ₁</text>
    <text x="380" y="138" font-size="10" font-weight="600">μ₂</text>
  </g>
  <g fill="none" stroke="var(--text)" stroke-width="1.7" stroke-dasharray="6 4">
    <path d="M 40 200 C 180 180 240 130 290 110 C 340 90 420 80 500 70"/>
  </g>
  <g fill="var(--text-muted)" font-size="10">
    <text x="100" y="38">třída 1</text>
    <text x="430" y="200">třída 2</text>
    <text x="270" y="100" text-anchor="middle">decision boundary</text>
  </g>
</svg>
:::

## Směs Gaussovských modelů (GMM)

Jediný Gaussov je *unimodální* — chybí flexibilita pro složitější rozdělení. **Gaussian Mixture Model**: vážený součet `K` komponent.

::: math
p(\mathbf{x}) = \sum_{k=1}^{K} \pi_k \,\mathcal{N}(\mathbf{x}; \boldsymbol{\mu}_k, \boldsymbol{\Sigma}_k), \quad \sum_k \pi_k = 1,\ \pi_k \ge 0
:::

* `π_k` — *míchací váhy*.
* `(μ_k, Σ_k)` — parametry k-té komponenty.

Trénování: **EM algoritmus** (Expectation–Maximization). Krok E přiřadí *měkce* každý vzorek k jednotlivým komponentám (`responsibility`); krok M aktualizuje parametry. Iteruje se do konvergence. Detail je nad rámec této kapitoly — viz Bishop kapitola 9.

GMM se používá pro:

* **Rozpoznávání řeči** — modely fonémů jako GMM-HMM (před érou neuronek dominantní paradigma).
* **Density estimation** v nízké dimenzi.
* **Soft clustering** — alternativa k k-means s pravděpodobnostmi.

## Naivní Bayesov klasifikátor

Pokud máme *vysokodimenzionální* `x` a málo dat, plná `Σ ∈ R^{D×D}` má `O(D²)` parametrů, které neumíme spolehlivě odhadnout. **Naivní** Bayesov předpokládá *podmíněnou nezávislost* featur:

::: math
p(\mathbf{x} \mid c) = \prod_{d=1}^{D} p(x_d \mid c)
:::

Každý `p(x_d | c)` má vlastní 1D model — jen `O(D)` parametrů. Naivně, protože korelace mezi featury se ignorují. Přesto v praxi *překvapivě dobře* funguje — např. klasifikace spamu v emailech (každé slovo = feature).

## Limity gaussovského modelu

* Realistická vysokodimenzionální data (obrazy, text) **nejsou** přibližně Gaussovská — moderní neuronové sítě jsou v praxi přesnější.
* Použít gaussovský klasifikátor v *prostoru naučených featur* (např. z předposlední vrstvy CNN) může ale stále dávat smysl pro **out-of-distribution detection** a kalibraci.

::: link "Stanford CS229: GDA — Gaussian Discriminant Analysis (poznámky)" "https://cs229.stanford.edu/notes2022fall/main_notes.pdf"
:::

::: link "Bishop: PRML, kap. 4.1 + 9.2 (GMM a EM)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Basics in Machine Learning* (Burget). Externí reference: Bishop, C.: *PRML* (Springer 2006), kap. 4 + 9; Murphy, K.: *Probabilistic ML: An Introduction*, [Kap. 4 + 11](https://probml.github.io/pml-book/book1.html); Hastie, Tibshirani, Friedman: *The Elements of Statistical Learning* (Springer, 2. vyd. 2009) — [free PDF](https://hastie.su.domains/ElemStatLearn/).*
