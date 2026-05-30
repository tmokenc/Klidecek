---
title: Pořadové (rank-based) neparametrické testy
---

# Pořadové (rank-based) neparametrické testy

**Neparametrické testy** nevyžadují předpoklad normality (ani jiného konkrétního rozdělení). Místo *originálních hodnot* používají jejich *pořadí* (ranks). To dělá testy *robustními* vůči outliers a vhodnými pro ordinální data, jejich síla je obvykle jen mírně nižší než u parametrických analog (asymptoticky `3/π ≈ 95 %` u normálních dat). Hlavní testy: **Wilcoxonův signed-rank** (jednovýběrový / párový), **Mann-Whitney U** (dvouvýběrový), **Kruskal-Wallis** (více skupin).

## Pořadí (ranks)

Pro vzorek `X₁, …, Xₙ`: seřaď vzestupně, přiděl pořadí `R₁, …, Rₙ` od `1` (nejmenší) do `n` (největší). Při shodách: *průměrné pořadí*.

::: math
\text{rank}(X_i) = R_i \in \{1, 2, \dots, n\}.
:::

Pro `Xᵢ` z *libovolného* (spojitého) rozdělení je pořadí *uniformně rozdělené* mezi permutacemi `(1, 2, …, n)`. To je důvod, proč rank-based testy *nezávisí* na konkrétním rozdělení dat.

## Wilcoxonův signed-rank test

**Použití:** jednovýběrový (test `H₀: medián = m₀`) nebo *párový* (test `H₀: medián rozdílů = 0`).

**Předpoklady**:
* Symetrické rozdělení kolem mediánu.
* Spojité (žádné shody, nebo málo shod).
* Nezávislost.

### Postup

1. Spočítej `Dᵢ = Xᵢ − m₀` (resp. `Dᵢ = Yᵢ − Xᵢ` pro párový).
2. Vyřaď `Dᵢ = 0`.
3. Spočítej `|Dᵢ|`, přiřaď pořadí (od 1 do `n'`).
4. **Signed rank** = `sign(Dᵢ) · rank(|Dᵢ|)`.
5. `W = Σ signed ranks` (nebo `W₊ = Σ kladných ranks`).

### Distribuce

Pod `H₀`:

::: math
E[W_+] = \frac{n'(n'+1)}{4}, \quad \mathrm{Var}(W_+) = \frac{n'(n'+1)(2n'+1)}{24}.
:::

Pro `n' ≥ 20` přibližně:

::: math
Z = \frac{W_+ - n'(n'+1)/4}{\sqrt{n'(n'+1)(2n'+1)/24}} \sim N(0, 1).
:::

Pro malá `n'`: exaktní distribuce (tabulky).

### Příklad

Test, zda nový algoritmus je rychlejší než starý (rozdíly `D = T_new − T_old` v ms):

```
D = (-3, +1, -5, +2, -4, -1, -6, +3, -2, -7)
|D| = (3, 1, 5, 2, 4, 1, 6, 3, 2, 7)
ranks = (5.5, 1.5, 8, 3.5, 7, 1.5, 9, 5.5, 3.5, 10)
signed ranks = (-5.5, +1.5, -8, +3.5, -7, -1.5, -9, +5.5, -3.5, -10)
W = -34
W+ = 10,5, W− = 44,5
n' = 10
```

`E[W₊] = 27,5`. `Var(W₊) = 96,25`. `Z = (10,5 − 27,5)/9,81 ≈ −1,73`. p ≈ 0,084 (oboustranné). Nezamítáme na 5 %, ale na 10 %.

## Mann-Whitneyho U test (Wilcoxonův rank-sum)

**Použití:** dvouvýběrový — test, zda dva *nezávislé* vzorky mají stejné rozdělení (nebo, slabší: stejný medián).

**Předpoklady**:
* Spojité rozdělení.
* Nezávislost obou vzorků.
* Stejný tvar rozdělení (pro test mediánů) — jinak detekuje *jakýkoli* rozdíl.

### Postup

1. Sloučí oba vzorky (`n₁ + n₂` hodnot), seřaď, přiděl pořadí.
2. `R₁ = Σ` pořadí prvků z první skupiny.
3. **U-statistika**:
   ::: math
   U_1 = R_1 - \frac{n_1(n_1 + 1)}{2}, \quad U_2 = n_1 n_2 - U_1.
   :::
4. `U = min(U₁, U₂)`.

### Distribuce

Pod `H₀`:

::: math
E[U] = \frac{n_1 n_2}{2}, \quad \mathrm{Var}(U) = \frac{n_1 n_2 (n_1 + n_2 + 1)}{12}.
:::

Pro `n₁, n₂ ≥ 10`: aproximace `N`.

### Intuice

`U₁` = počet *párů* `(i, j)` s `Xᵢ < Yⱼ`. Pokud jsou skupiny stejné, `U₁ ≈ n₁n₂/2`. Pokud `X` systematicky menší, `U₁` je velké.

## Kruskal-Wallisův test

**Použití:** zobecnění Mann-Whitneyho na `k ≥ 2` skupin. Neparametrická obdoba [[one-way-anova|one-way ANOVA]].

**Hypotézy**:
* `H₀`: všechny `k` skupin mají stejné rozdělení.
* `H₁`: alespoň jedna skupina je „posunuta" vůči jiným.

### Postup

1. Sloučit všechny `n = Σ nⱼ` pozorování, přiřadit pořadí.
2. `Rⱼ` = suma pořadí v `j`-té skupině.
3. **Kruskal-Wallis statistika**:
   ::: math
   H = \frac{12}{n(n+1)} \sum_{j=1}^{k} \frac{R_j^2}{n_j} - 3(n+1).
   :::
4. Pod `H₀`: `H ∼ χ²(k − 1)` (asymptoticky).

### Příklad

Test, zda 3 metody měření dávají stejné výsledky (`n₁ = n₂ = n₃ = 5`).

* Metoda 1: 12, 14, 18, 20, 22
* Metoda 2: 15, 17, 19, 23, 25
* Metoda 3: 24, 26, 28, 30, 32

Pořadí v sloučeném vzorku: (1, 2, 5, 7, 8) (M1); (3, 4, 6, 9, 11) (M2); (10, 12, 13, 14, 15) (M3).

`R₁ = 23, R₂ = 33, R₃ = 64`. `n = 15`.

`H = 12/(15·16) · (529/5 + 1089/5 + 4096/5) − 48`
   `= 0,05 · 1142,8 − 48 ≈ 9,14`.

`χ²_{0,05, 2} ≈ 5,99`. `9,14 > 5,99` ⇒ zamítáme. Skupiny se signifikantně liší.

Post-hoc: Dunn-Bonferroni nebo Conover-Iman pro pairwise srovnání.

## Srovnání s parametrickými testy

| Parametrický | Neparametrický | Předpoklady NP |
| :--- | :--- | :--- |
| 1-výběrový t-test | Wilcoxon signed-rank | symetrie, spojité |
| Párový t-test | Wilcoxon signed-rank (na rozdíly) | symetrie rozdílů |
| 2-výběrový t-test | Mann-Whitney U | spojité, stejný tvar |
| One-way ANOVA | Kruskal-Wallis | spojité |
| Two-way ANOVA | Friedmanův test (block design) | pořadové údaje |
| Pearson cor. | Spearmanův ρ, Kendallův τ | monotónní vztah |

## Síla testů

Asymptotická *relativní efektivnost* (ARE) neparametrického testu vůči parametrickému pro normální data:

* Wilcoxon vs. t-test: `3/π ≈ 0,955` (jen 4,5 % síla ztracena).
* Mann-Whitney vs. t-test: `3/π ≈ 0,955`.
* Kruskal-Wallis vs. ANOVA: `3/π`.

Pro *nenormální* data (zejména heavy-tailed) jsou neparametrické *silnější* — viz následující.

### Příklad — Cauchy data

`t`-test má *nulovou sílu* na Cauchy data (rozptyl nekonečný, `X̄` se nestane „lepším" s `n`). Wilcoxon stále funguje (pořadí Cauchy data je *rozumná* statistika).

## Konfidenční intervaly z rank tests

Z **Hodges-Lehmannova estimátoru** (pseudomedian rozdílů) lze sestrojit *robustní* CI pro medián:

::: math
\hat{\theta}_{HL} = \text{median}\{(X_i + X_j)/2 : i \le j\}.
:::

CI: percentily Walshových průměrů.

## Aplikace

* **Likertovy škály** — ordinální data, klasické testy nepoužitelné.
* **Reakce na lék** — robustní vůči outliers.
* **Genomika** — non-normal expression data, Wilcoxon široko používaný.
* **Survey research** — preference, hodnocení.
* **Quality control** — když distribuce není známá.

::: viz rank-test-mechanics "Sloučení vzorků X, Y, přiřazení pořadí, výpočet R₁, R₂ a Mann-Whitney U-statistiky krok za krokem."
:::

::: link "Hollander, M., Wolfe, D.: Nonparametric Statistical Methods (Wiley 2014, 3rd ed.)" "https://onlinelibrary.wiley.com/doi/book/10.1002/9781119196037"
:::

::: link "Conover, W. J.: Practical Nonparametric Statistics (Wiley 1999, 3rd ed.)" "https://www.wiley.com/en-us/Practical+Nonparametric+Statistics%2C+3rd+Edition-p-9780471160687"
:::

::: link "Wilcoxon, F.: Individual Comparisons by Ranking Methods (Biometrics 1945)" "https://www.jstor.org/stable/3001968"
:::

---

*Zdroj: MSP přednášky 2025/26, *Nonparametric Tests* (Hrabec). Externí reference: Anděl, J.: *Základy matematické statistiky* (Matfyzpress 2011); Hollander, M., Wolfe, D., Chicken, E.: *Nonparametric Statistical Methods* (Wiley 2014); Conover, W. J.: *Practical Nonparametric Statistics* (Wiley 1999).*
