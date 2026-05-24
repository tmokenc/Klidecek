---
title: t-test — jedno- a dvouvýběrový, párový
---

# t-test — jedno- a dvouvýběrový, párový

`t`-test je *nejpoužívanější* parametrický test ve statistice. Testuje hypotézy o **středních hodnotách** normálně rozdělených dat při neznámém rozptylu. Existují tři varianty: **jednovýběrový** (jeden vzorek vs. konstanta), **párový** (dva spojené vzorky) a **dvouvýběrový** (dva nezávislé vzorky). Všechny mají identický „rámec" — sestrojí statistiku `T` s rozdělením `t(df)` za `H₀` a porovnají s kvantilem.

## Jednovýběrový `t`-test

**Předpoklad:** `X₁, …, Xₙ ∼ N(μ, σ²)` i.i.d., `σ²` neznámé.

**Hypotézy:**
* `H₀: μ = μ₀`
* `H₁: μ ≠ μ₀` (oboustranný) nebo `μ > μ₀`, `μ < μ₀` (jednostranné)

**Testová statistika:**

::: math
T = \frac{\bar{X} - \mu_0}{S / \sqrt{n}}, \quad S^2 = \frac{1}{n-1} \sum (X_i - \bar{X})^2.
:::

**Distribuce pod `H₀`:** `T ∼ t(n − 1)`.

**Rozhodovací pravidlo (oboustranný):** zamítnout `H₀` ⇔ `|T| > t_{α/2, n−1}`.

### Příklad

Test, zda průměrná délka výrobků (`X̄ = 102 mm`, `S = 5 mm`, `n = 25`) se liší od specifikace `μ₀ = 100 mm`:

::: math
T = \frac{102 - 100}{5/\sqrt{25}} = 2.
:::

`t_{0,025, 24} ≈ 2,064`. `|T| = 2 < 2,064` ⇒ *nezamítáme* `H₀` na 5% hladině. p-hodnota: `P(|t(24)| ≥ 2) ≈ 0,057` — *těsně* nezamítnutí.

## Párový `t`-test

**Použití:** Dva *spojené* vzorky (před/po měření, srovnání dvou metod na stejných subjektech).

**Předpoklad:** Páry `(X₁, Y₁), …, (Xₙ, Yₙ)`, rozdíly `Dᵢ = Yᵢ − Xᵢ ∼ N(μ_D, σ²_D)` i.i.d.

**Hypotézy:**
* `H₀: μ_D = 0` (žádný efekt léčby/změna)
* `H₁: μ_D ≠ 0`

**Statistika:**

::: math
T = \frac{\bar{D}}{S_D / \sqrt{n}} \sim t(n - 1),
:::

kde `D̄ = (1/n) Σ Dᵢ`, `S²_D = Σ(Dᵢ − D̄)²/(n − 1)`.

### Proč „párový" a ne dvouvýběrový?

Pokud měříme stejné subjekty před/po, jsou hodnoty *závislé* — sdílí individuální variabilitu. Párový test eliminuje *between-subject variance* (kterou by dvouvýběrový započítal jako šum), čímž má *vyšší sílu*.

### Příklad

Pacienti měřeni před (`X`) a po (`Y`) léčbě, `n = 12`. `D̄ = 4,5 mm Hg` snížení krevního tlaku, `S_D = 6,2 mm Hg`:

::: math
T = \frac{4{,}5}{6{,}2 / \sqrt{12}} = 2{,}51.
:::

`t_{0,025, 11} ≈ 2,201`. `T > 2,201` ⇒ *zamítáme* `H₀` na 5% hladině. p ≈ 0,029.

## Dvouvýběrový `t`-test (nezávislé vzorky)

**Použití:** Dvě *nezávislé* skupiny (control vs. treatment, muži vs. ženy).

**Předpoklady:**
* `X₁, …, X_{n₁} ∼ N(μ₁, σ₁²)` i.i.d.
* `Y₁, …, Y_{n₂} ∼ N(μ₂, σ₂²)` i.i.d.
* Skupiny *nezávislé*.

**Hypotézy:** `H₀: μ₁ = μ₂` vs. `H₁: μ₁ ≠ μ₂` (nebo jednostranné).

### Varianta A — pooled variance (`σ₁² = σ₂² = σ²` známé/předpokládáno)

*Pooled estimate*:

::: math
S_p^2 = \frac{(n_1 - 1) S_1^2 + (n_2 - 1) S_2^2}{n_1 + n_2 - 2}.
:::

Statistika:

::: math
T = \frac{\bar{X} - \bar{Y}}{S_p \sqrt{1/n_1 + 1/n_2}} \sim t(n_1 + n_2 - 2).
:::

### Varianta B — Welchův `t`-test (`σ₁² ≠ σ₂²`)

Bez předpokladu rovnosti rozptylů:

::: math
T = \frac{\bar{X} - \bar{Y}}{\sqrt{S_1^2/n_1 + S_2^2/n_2}}.
:::

Distribuce pod `H₀` je *přibližně* `t(ν)` s **Welch-Satterthwaiteovou** aproximací df:

::: math
\nu = \frac{(S_1^2/n_1 + S_2^2/n_2)^2}{(S_1^2/n_1)^2/(n_1-1) + (S_2^2/n_2)^2/(n_2-1)}.
:::

Welchův test je **default** v R (`t.test()`), Pythonu (`scipy.stats.ttest_ind(equal_var=False)`) — robustní vůči nerovnosti rozptylů s minimálním ztracením síly při rovnosti.

### Příklad

Test, zda nový kompilátor produkuje rychlejší kód než starý:
* Starý: `n₁ = 20, X̄ = 105 ms, S₁ = 8 ms`.
* Nový: `n₂ = 25, Ȳ = 98 ms, S₂ = 7 ms`.

Welchův:

::: math
T = \frac{105 - 98}{\sqrt{64/20 + 49/25}} = \frac{7}{\sqrt{3{,}2 + 1{,}96}} = \frac{7}{\sqrt{5{,}16}} \approx 3{,}08.
:::

Df: `ν ≈ 38,6`. `t_{0,025, 38} ≈ 2,024`. `T > 2,024` ⇒ zamítáme `H₀`. p ≈ 0,004.

## Předpoklady a robustnost

`t`-test předpokládá:

1. **Normalita** — pro každou skupinu. Pro `n ≥ 30` je díky CLT méně kritická.
2. **Nezávislost** uvnitř a mezi skupinami (kromě párového).
3. **Stejné rozptyly** (pooled `t`-test) nebo *libovolné* (Welch).

### Diagnostika

* **Q-Q plot** vůči `N(0, 1)` — vizuální kontrola normality.
* **Shapiro-Wilk test** — formální test normality (citlivý pro `n ≥ 50`).
* **Leveneův test** — homogenita rozptylů (méně citlivý na nenormalitu než F-test).

### Co když předpoklady selhávají?

* **Nenormalita** + malé `n` ⇒ použij neparametrické alternativy:
  * Jedno-výběrový: **Wilcoxonův signed-rank test**.
  * Párový: **Wilcoxonův signed-rank test rozdílů**.
  * Dvouvýběrový: **Mann-Whitney U test** ([[rank-testy]]).
* **Outliers** ⇒ **trimmed t-test** (Yuen), Hodges-Lehmann.
* **Nerovné rozptyly** ⇒ Welch (i pro normální data).

## CI pro rozdíl středních hodnot

Z Welchovy testové statistiky:

::: math
CI_{1-\alpha}(\mu_1 - \mu_2) = (\bar{X} - \bar{Y}) \pm t_{\alpha/2, \nu} \sqrt{S_1^2/n_1 + S_2^2/n_2}.
:::

Vyjadřuje *efektovou velikost* lépe než pouhá p-hodnota.

## Effect size — Cohenovo `d`

::: math
d = \frac{\bar{X} - \bar{Y}}{S_p}.
:::

Konvence: `d = 0,2` small, `0,5` medium, `0,8` large effect. Důležitější pro *praktickou významnost* než p-hodnota.

## Aplikace

* **A/B testing** — porovnání konverzních rates dvou variant.
* **Quality control** — průměrná kvalita produktu před/po procesu.
* **Medical trials** — efekt léku vs. placebo.
* **Performance analysis** — benchmark dvou algoritmů.
* **Education research** — výsledky učení dvou metod.

::: viz t-test-interactive "Přetahujte vzorky X a Y; vyberte jedno-/dvouvýběrový/párový; sledujte T-statistiku, p-hodnotu a kritickou oblast."
:::

::: link "DeGroot, M., Schervish, M.: Probability and Statistics, kap. 9.2, 9.6" "https://www.pearson.com/en-us/subject-catalog/p/probability-and-statistics/P200000006228"
:::

::: link "Casella, G., Berger, R.: Statistical Inference, kap. 8.3" "https://www.cengage.com/c/statistical-inference-2e-casella"
:::

::: link "Lakens, D.: Effect size calculations (Frontiers in Psychology 2013)" "https://www.frontiersin.org/articles/10.3389/fpsyg.2013.00863/full"
:::

---

*Zdroj: MSP přednášky 2025/26, *t-tests* (Hrabec). Externí reference: DeGroot, M., Schervish, M.: *Probability and Statistics* (4th ed., Pearson 2012), kap. 9.2 a 9.6; Casella, G., Berger, R.: *Statistical Inference* (Cengage 2002), kap. 8.3; Welch, B. L.: *The Generalization of "Student's" Problem when Several Different Population Variances are Involved*, Biometrika 34 (1947).*
