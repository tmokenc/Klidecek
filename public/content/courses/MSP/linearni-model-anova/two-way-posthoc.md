---
title: Two-way ANOVA a post-hoc testy
---

# Two-way ANOVA a post-hoc testy

**Two-way ANOVA** rozšiřuje [[one-way-anova|one-way ANOVA]] na *dva* faktory — testuje *hlavní efekty* obou faktorů a jejich *interakci*. **Post-hoc testy** zjišťují, *které* skupiny se vlastně liší, pokud ANOVA odmítla globální `H₀` o rovnosti středních hodnot. Tato kapitola pokrývá obě úzce spojené techniky.

## Two-way ANOVA — model

Dva faktory: `A` s `a` úrovněmi, `B` s `b` úrovněmi. V buňce `(i, j)` `n` pozorování (vyvážený design):

::: math
Y_{ijk} = \mu + \alpha_i + \beta_j + (\alpha\beta)_{ij} + \varepsilon_{ijk},
:::

kde:

* `μ` — grand mean
* `α_i` — efekt úrovně `i` faktoru `A` (`Σ α_i = 0`)
* `β_j` — efekt úrovně `j` faktoru `B` (`Σ β_j = 0`)
* `(αβ)_{ij}` — interakce (`Σ_i (αβ)_{ij} = 0`, `Σ_j (αβ)_{ij} = 0`)
* `ε_{ijk} ∼ N(0, σ²)` — šum

## Rozklad součtu čtverců

::: math
SST = SS_A + SS_B + SS_{AB} + SS_E,
:::

kde:

* `SS_A` — variabilita kvůli faktoru `A`,
* `SS_B` — variabilita kvůli faktoru `B`,
* `SS_{AB}` — interakční variabilita,
* `SS_E` — reziduální (within-cells).

## ANOVA tabulka

| Zdroj | df | SS | MS | F | H₀ |
| :--- | :---: | :---: | :---: | :---: | :--- |
| A | `a − 1` | `SS_A` | `MS_A` | `MS_A/MS_E` | `α_i = 0 ∀i` |
| B | `b − 1` | `SS_B` | `MS_B` | `MS_B/MS_E` | `β_j = 0 ∀j` |
| A × B | `(a−1)(b−1)` | `SS_{AB}` | `MS_{AB}` | `MS_{AB}/MS_E` | `(αβ)_{ij} = 0 ∀i,j` |
| Error | `ab(n−1)` | `SS_E` | `MS_E` | | |
| Total | `abn − 1` | `SST` | | | |

## Interakce — proč jsou důležité

**Interakce** znamená, že *efekt jednoho faktoru závisí na úrovni druhého faktoru*. Příklad:

* Bez interakce: lék `A` zlepšuje výsledek o 5 bodů, lék `B` o 3 body. Kombinace: 5 + 3 = 8 (aditivní).
* S interakcí: lék `A` o 5 bodů, lék `B` o 3 body, ale kombinace `A + B` o 12 bodů (synergický efekt).

::: svg "Interakce: linie nejsou paralelní. Vlevo: bez interakce (paralelní). Vpravo: s interakcí (kříží se nebo divergují)."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g transform="translate(20, 20)">
    <text x="100" y="-5" text-anchor="middle" fill="var(--text-muted)">bez interakce</text>
    <line x1="0" y1="140" x2="220" y2="140" stroke="var(--line-strong)"/>
    <line x1="0" y1="0" x2="0" y2="140" stroke="var(--line-strong)"/>
    <text x="40" y="155" text-anchor="middle" fill="var(--text-muted)">B₁</text>
    <text x="180" y="155" text-anchor="middle" fill="var(--text-muted)">B₂</text>
    <line x1="40" y1="100" x2="180" y2="60" stroke="var(--accent)" stroke-width="2"/>
    <circle cx="40" cy="100" r="3" fill="var(--accent)"/>
    <circle cx="180" cy="60" r="3" fill="var(--accent)"/>
    <text x="195" y="55" fill="var(--accent)" font-size="10">A₁</text>
    <line x1="40" y1="40" x2="180" y2="0" stroke="var(--accent-line)" stroke-width="2"/>
    <circle cx="40" cy="40" r="3" fill="var(--accent-line)"/>
    <circle cx="180" cy="0" r="3" fill="var(--accent-line)"/>
    <text x="195" y="5" fill="var(--accent-line)" font-size="10">A₂</text>
  </g>
  <g transform="translate(300, 20)">
    <text x="100" y="-5" text-anchor="middle" fill="var(--text-muted)">s interakcí</text>
    <line x1="0" y1="140" x2="220" y2="140" stroke="var(--line-strong)"/>
    <line x1="0" y1="0" x2="0" y2="140" stroke="var(--line-strong)"/>
    <text x="40" y="155" text-anchor="middle" fill="var(--text-muted)">B₁</text>
    <text x="180" y="155" text-anchor="middle" fill="var(--text-muted)">B₂</text>
    <line x1="40" y1="40" x2="180" y2="100" stroke="var(--accent)" stroke-width="2"/>
    <circle cx="40" cy="40" r="3" fill="var(--accent)"/>
    <circle cx="180" cy="100" r="3" fill="var(--accent)"/>
    <text x="195" y="100" fill="var(--accent)" font-size="10">A₁</text>
    <line x1="40" y1="90" x2="180" y2="10" stroke="var(--accent-line)" stroke-width="2"/>
    <circle cx="40" cy="90" r="3" fill="var(--accent-line)"/>
    <circle cx="180" cy="10" r="3" fill="var(--accent-line)"/>
    <text x="195" y="15" fill="var(--accent-line)" font-size="10">A₂</text>
  </g>
</svg>
:::

**Pravidlo interpretace**: pokud je interakce signifikantní, neinterpretujeme hlavní efekty *izolovaně* — efekt `A` *závisí* na `B`.

## Předpoklady — testování

Same jako one-way ANOVA:

* Normalita reziduí
* Homoskedasticita
* Nezávislost

Plus *vyvážený* design (rovné velikosti buněk) zjednodušuje analýzu. Pro nevyvážený: Type II/III SS ([[f-test-submodel]]).

## Post-hoc testy

Pokud ANOVA odmítla `H₀`, *které* skupiny se liší? Naivně provést `(k 2)` t-testů — ale *multiplicita* (viz [[testovani-princip]]) ⇒ FWER roste lineárně s počtem testů. Post-hoc testy kontrolují FWER.

### Tukey HSD (Honestly Significant Difference)

Pro vyvážený design (`n_j = n`):

::: math
HSD = q_{\alpha, k, n - k} \cdot \sqrt{\frac{MS_W}{n}},
:::

kde `q_{α, k, n−k}` je **studentized range** kvantil. Dvojice `(i, j)` je signifikantně různá ⇔ `|Ȳ_i − Ȳ_j| > HSD`.

Tukey HSD je *přesný* pro vyvážený design, *asymptoticky* pro nevyvážený. *Default* v R `TukeyHSD()`.

### Bonferroniho korekce

Pro `m = (k 2)` testů použij `α/m` na každý:

::: math
\text{zamítnout } H_0^{(i,j)} \text{ pokud } p_{ij} \le \alpha / m.
:::

* **Výhoda**: jednoduché, valid pro libovolné testy.
* **Nevýhoda**: konzervativní (vysoká `m` ⇒ silně snižuje sílu).

### Scheffého test

Nejkonservativnější, ale platí pro *libovolné* lineární kontrasty (ne jen párové). Doporučení: pokud zkoumáte mnoho kontrastů, použijte Scheffé.

### Holm-Bonferroniho

Sekvenční varianta — uspořádej p-hodnoty vzestupně `p_(1) ≤ p_(2) ≤ … ≤ p_(m)`. Zamítni `H_(i)` pokud `p_(i) ≤ α / (m − i + 1)`. Méně konzervativní než Bonferroni, stále kontroluje FWER.

### Benjamini-Hochberg (BH) — kontrola FDR

Místo FWER kontroluje *false discovery rate* (FDR) — *očekávaný podíl* false positives mezi *všemi zamítnutími*. Vhodné pro mnoho testů.

```
1. Seřaď p-hodnoty p_(1) ≤ ... ≤ p_(m)
2. Najdi největší k, pro které p_(k) ≤ (k/m) · α
3. Zamítni H_(1), ..., H_(k)
```

## Plánované vs. post-hoc kontrasty

* **Plánované (a priori)**: před experimentem se rozhodneš testovat konkrétní hypotézy (např. `μ₁ = (μ₂ + μ₃)/2`). Lze testovat na hladině `α` *bez korekce*, pokud jsou *ortogonální*.
* **Post-hoc**: zkoumáš všechny dvojice *po* zobrazení dat. Vyžaduje korekci na multiplicitu.

## Kontroly homoskedasticity

### Bartlettův test

`H₀: σ₁² = σ₂² = … = σ_k²`. Statistika přibližně `χ²(k − 1)`. *Citlivý na nenormalitu*.

### Leveneův test

Aplikuje ANOVA na *absolutní odchylky* `|Y_{ij} − Ȳ_j|`. Robustnější vůči nenormalitě.

### Brown-Forsythův test

Variant Levene s *mediány* místo průměrů. Ještě robustnější.

**Doporučení**: Levene/Brown-Forsyth jako default; Bartlett jen u silně normálních dat.

## Kontroly normality

* **Q-Q plot reziduí** — vizuální, robustní.
* **Shapiro-Wilkův test** — formální, pro `n ≤ 5000`.
* **Kolmogorov-Smirnov, Anderson-Darling** — také testy.
* **Histogram reziduí** — kontroluje skew, kurtosis.

## Co když selžou předpoklady?

* **Nenormalita** → log/Box-Cox transformace `Y`; **Kruskal-Wallis** ([[rank-testy]]).
* **Heteroskedasticita** → Welchova ANOVA (jednoduchá), GLS, robust SE.
* **Hierarchická data** → mixed models (`lme4::lmer` v R).

## Aplikace

* **Klinické studie** — efekt léku × dávka.
* **Marketing** — efekt slevy × kanálu.
* **Manufacturing** — porovnání materiálů × strojů.
* **A/B/C/D testing** — multivariate experiments.
* **Education** — vyučovací metoda × demografie studentů.

::: viz anova-interaction-plot "Posuvníky efektů α, β a interakce γ; sledujte, jak interakce zakřivuje paralelní linie."
:::

::: link "Faraway, J.: Linear Models with R, kap. 14–15" "https://www.routledge.com/Linear-Models-with-R/Faraway/p/book/9781439887332"
:::

::: link "Tukey, J.: Quick and Dirty Methods in Statistics — Tukey HSD test" "https://www.itl.nist.gov/div898/handbook/prc/section4/prc471.htm"
:::

::: link "Benjamini, Y., Hochberg, Y.: Controlling the False Discovery Rate (JRSS B 1995)" "https://www.jstor.org/stable/2346101"
:::

---

*Zdroj: MSP přednášky 2025/26, *Two-way ANOVA and Post-hoc Tests* (Hrabec). Externí reference: Zvára, K.: *Regrese* (Matfyzpress 2019); Faraway, J.: *Linear Models with R* (CRC 2014); Hsu, J. C.: *Multiple Comparisons: Theory and Methods* (Chapman & Hall 1996).*
