---
title: Kategoriální data — χ² testy
---

# Kategoriální data — χ² testy

**Kategoriální data** jsou hodnoty patřící do *konečně mnoha kategorií* (kvalitativní/nominální nebo ordinální). Klasické statistické metody pro spojitá data zde selhávají — místo `t`-testu na střední hodnotu testujeme *proporce*. **χ² testy** jsou základní nástroj pro analýzu *binárních*, *vícekategoriálních*, *kontingenčních tabulek* a *goodness-of-fit* otázek.

## Typy kategoriálních dat

### Binární data (nominální, 2 kategorie)

Bernoulli `X ∈ {0, 1}`. Typicky:

* úspěch/neúspěch,
* spam/není-spam,
* pacient přežil/zemřel,
* shopper koupil/nekoupil.

Statistický model: `X ∼ Bernoulli(p)`. Parametr `p ∈ [0, 1]` (proporce úspěchů).

### Vícekategoriální (nominální, `k` kategorií)

`X ∈ {1, 2, …, k}`. Typicky:

* typ poruchy v provozu,
* odpověď v dotazníku (A/B/C/D),
* klasifikace obrázku.

Model: `(X₁, …, X_k) ∼ Multinomial(n, p₁, …, p_k)` pro `n` pozorování.

### Ordinální (uspořádané kategorie)

`X ∈ {1, 2, 3, 4, 5}` jako Likert škála („velmi nesouhlasím … velmi souhlasím"). Pořadí *má smysl*, ale rozdíly mezi úrovněmi nejsou nutně stejné.

Pro ordinální data jsou efektivnější *trend* testy (Cochran-Armitage, Jonckheere-Terpstra) než standardní χ².

## Test proporce — jednovýběrový

**Hypotézy:** `H₀: p = p₀` vs. `H₁: p ≠ p₀`.

Pro `n` pozorování s `k` úspěchy, výběrový proporce `p̂ = k/n`. Pod `H₀`:

::: math
Z = \frac{\hat{p} - p_0}{\sqrt{p_0(1 - p_0)/n}} \xrightarrow{d} N(0, 1).
:::

Pro velké `n` (typicky `n p₀ ≥ 5` a `n(1 − p₀) ≥ 5`). Pro malá `n` použij **exact binomial test** založený na `Bi(n, p₀)`.

### Příklad

Test, zda mince je férová. Hodů: `n = 100`, líců: `60`. `H₀: p = 0,5`.

::: math
Z = \frac{0{,}6 - 0{,}5}{\sqrt{0{,}5 \cdot 0{,}5 / 100}} = \frac{0{,}1}{0{,}05} = 2{,}0.
:::

p-hodnota (dvoustranná): `2 · P(Z ≥ 2) ≈ 0,046`. Zamítáme `H₀` na 5% hladině.

## Test rozdílu dvou proporcí

**Hypotézy:** `H₀: p₁ = p₂` (dvě skupiny mají stejnou proporci úspěchů) vs. `H₁: p₁ ≠ p₂`.

* Skupina 1: `n₁` pozorování, `k₁` úspěchů, `p̂₁ = k₁/n₁`.
* Skupina 2: `n₂` pozorování, `k₂` úspěchů, `p̂₂ = k₂/n₂`.

*Pooled* odhad pod `H₀`: `p̂ = (k₁ + k₂)/(n₁ + n₂)`. Testová statistika:

::: math
Z = \frac{\hat{p}_1 - \hat{p}_2}{\sqrt{\hat{p}(1 - \hat{p}) \cdot (1/n_1 + 1/n_2)}} \sim N(0, 1).
:::

Ekvivalentně: `χ² = Z² ∼ χ²(1)` — speciální případ obecného χ² testu nezávislosti.

## Kontingenční tabulka — `χ²` test nezávislosti

Pro dva kategoriální faktory `A` (`r` úrovní) a `B` (`c` úrovní) sledujeme společné frekvence `O_{ij}`:

::: svg "Kontingenční tabulka r × c: O_ij = pozorované, E_ij = očekávané pod nezávislostí."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g font-family="ui-monospace, monospace" font-size="10.5">
    <g fill="var(--text-muted)" text-anchor="middle">
      <text x="120" y="20">B₁</text>
      <text x="200" y="20">B₂</text>
      <text x="280" y="20">…</text>
      <text x="360" y="20">B_c</text>
      <text x="450" y="20" font-weight="600">Σ</text>
    </g>
    <g fill="var(--text-muted)" text-anchor="end">
      <text x="60" y="55">A₁</text>
      <text x="60" y="85">A₂</text>
      <text x="60" y="115">⋮</text>
      <text x="60" y="145">A_r</text>
    </g>
    <g fill="var(--text)" text-anchor="middle">
      <text x="120" y="55">O₁₁</text>
      <text x="200" y="55">O₁₂</text>
      <text x="360" y="55">O₁_c</text>
      <text x="450" y="55" font-weight="600">n₁·</text>

      <text x="120" y="85">O₂₁</text>
      <text x="200" y="85">O₂₂</text>
      <text x="360" y="85">O₂_c</text>
      <text x="450" y="85" font-weight="600">n₂·</text>

      <text x="120" y="145">O_r1</text>
      <text x="200" y="145">O_r2</text>
      <text x="360" y="145">O_rc</text>
      <text x="450" y="145" font-weight="600">n_r·</text>

      <text x="120" y="175" font-weight="600">n·₁</text>
      <text x="200" y="175" font-weight="600">n·₂</text>
      <text x="360" y="175" font-weight="600">n·_c</text>
      <text x="450" y="175" font-weight="600">n</text>
    </g>
  </g>
  <g stroke="var(--line)" stroke-width="0.7" fill="none">
    <line x1="80" y1="30" x2="490" y2="30"/>
    <line x1="80" y1="155" x2="490" y2="155"/>
    <line x1="80" y1="10" x2="80" y2="180"/>
    <line x1="430" y1="10" x2="430" y2="180"/>
  </g>
</svg>
:::

### Hypotézy

* `H₀`: faktory `A` a `B` jsou *nezávislé* — `P(A = i, B = j) = P(A = i) · P(B = j)`.
* `H₁`: závislé.

### Očekávané frekvence pod `H₀`

::: math
E_{ij} = \frac{n_{i\cdot} \cdot n_{\cdot j}}{n}.
:::

### χ² statistika

::: math
\chi^2 = \sum_{i=1}^{r} \sum_{j=1}^{c} \frac{(O_{ij} - E_{ij})^2}{E_{ij}}.
:::

Pod `H₀` (a pro velká `E_{ij}`):

::: math
\chi^2 \xrightarrow{d} \chi^2((r-1)(c-1)).
:::

Df `(r − 1)(c − 1)` plyne z toho, že známe-li `r + c − 1` marginálních počtů a celkové `n`, zbývá `(r − 1)(c − 1)` volných buněk.

### Předpoklady

* Velká `E_{ij}` — pravidlo: `E_{ij} ≥ 5` pro alespoň 80 % buněk; všechna `E_{ij} ≥ 1`.
* Pro malé `E_{ij}` použij **Fisherův exaktní test** (přesný pro 2×2, zobecnitelný).

### Příklad — kuřáctví a rakovina plic

| | rakovina | bez | Σ |
| :--- | :---: | :---: | :---: |
| kuřák | 80 | 120 | 200 |
| nekuřák | 20 | 280 | 300 |
| Σ | 100 | 400 | 500 |

`E₁₁ = 200·100/500 = 40`, `E₁₂ = 200·400/500 = 160`, atd.

`χ² = (80−40)²/40 + (120−160)²/160 + (20−60)²/60 + (280−240)²/240`
   `= 1600/40 + 1600/160 + 1600/60 + 1600/240 = 40 + 10 + 26,67 + 6,67 ≈ 83,3`.

`χ²_{0,05, 1} ≈ 3,84`. `83,3 ≫ 3,84` ⇒ silně zamítáme nezávislost. Kuřáctví je signifikantně asociované s rakovinou.

## Fisherův exaktní test

Pro 2×2 tabulky s malými očekávanými frekvencemi. Místo asymptotické `χ²` distribuce počítá *přesnou* pravděpodobnost pozorovat danou (nebo extrémnější) tabulku za `H₀`:

::: math
P(\text{tabulka}) = \frac{\binom{n_{1\cdot}}{O_{11}} \binom{n_{2\cdot}}{O_{21}}}{\binom{n}{n_{\cdot 1}}}.
:::

Marginály jsou *fixní* (kondicionálnost). Exaktní p-hodnota = suma pravděpodobností tabulek alespoň tak extrémních jako pozorovaná.

## Cochran-Armitageův trend test

Pro `2 × k` tabulky s *ordinální* expozicí (např. dávka 0, 1, 2, 3, 4):

::: math
T = \sum_j w_j (O_{1j} - E_{1j}),
:::

kde `w_j` jsou váhy odrážející *uspořádání* (typicky `w_j = j` lineárně). T-statistika je *citlivější* na *monotónní trend* než χ², který detekuje libovolnou závislost.

## Cramérovo `V` — effect size

χ² je *test*, ne *míra* asociace. **Cramérovo V**:

::: math
V = \sqrt{\frac{\chi^2}{n \cdot \min(r-1, c-1)}}.
:::

`V ∈ [0, 1]`. `V = 0` nezávislost, `V = 1` perfektní asociace. Konvence: `V = 0,1, 0,3, 0,5` jsou small, medium, large.

## McNemarův test — párovaná data

Pro 2×2 tabulku se *párovými* daty (např. před/po):

| | Po: ano | Po: ne | Σ |
| :--- | :---: | :---: | :---: |
| Před: ano | a | b | a + b |
| Před: ne | c | d | c + d |

McNemar:

::: math
\chi^2_M = \frac{(b - c)^2}{b + c} \sim \chi^2(1).
:::

Testuje *symetrii* — pravděpodobnost změny v jednom směru = pravděpodobnost změny v druhém.

## Aplikace

* **Epidemiologie** — testy asociace expozice-onemocnění.
* **Marketing** — efektivita kampaní (konverzní rates).
* **Quality control** — defect rates v různých liniích.
* **A/B testing** — porovnání 2+ variant UI.
* **Survey analysis** — Likert škály, demografické rozdíly.
* **Machine learning** — confusion matrix, χ² feature selection.

::: viz contingency-chisq "Editujte buňky kontingenční tabulky; sledujte živý χ², p-hodnotu a Cramérovo V."
:::

::: link "Agresti, A.: Categorical Data Analysis (Wiley 2013, 3rd ed.)" "https://onlinelibrary.wiley.com/doi/book/10.1002/9780470594001"
:::

::: link "Pearson, K.: On the Criterion that a Given System of Deviations from the Probable... (Philosophical Magazine 1900)" "https://www.tandfonline.com/doi/abs/10.1080/14786440009463897"
:::

---

*Zdroj: MSP přednášky 2025/26, *Categorical Data — Chi-Square Tests* (Hrabec). Externí reference: Agresti, A.: *Categorical Data Analysis* (Wiley 2013, 3rd ed.); DeGroot, M., Schervish, M.: *Probability and Statistics* (Pearson 2012), kap. 10; Anděl, J.: *Základy matematické statistiky* (Matfyzpress 2011).*
