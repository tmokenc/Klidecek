---
title: Kvalita modelu — R², adjusted R², PRESS
---

# Kvalita modelu — R², adjusted R², PRESS

Po fitování lineární regrese chceme vědět, *jak dobře* model vysvětluje data. **R²** (koeficient determinace) je standardní metrika — podíl variability `Y` vysvětlené modelem. Má ale úskalí: zvyšuje se s každým přidaným prediktorem, i pokud je *zbytečný*. **Adjusted R²** a **PRESS** (cross-validation R²) jsou robustnější alternativy, které penalizují komplexitu nebo měří *prediktivní* schopnost.

## Koeficient determinace R²

Z rozkladu součtu čtverců:

::: math
SST = SS_{Reg} + SS_E,
:::

kde:

* `SST = Σ(Yᵢ − Ȳ)²` — total sum of squares (celková variabilita `Y`),
* `SS_Reg = Σ(Ŷᵢ − Ȳ)²` — regression sum of squares (vysvětlená modelem),
* `SS_E = Σ(Yᵢ − Ŷᵢ)² = RSS` — error sum of squares (nevysvětlená, rezidua).

**R²**:

::: math
R^2 = \frac{SS_{Reg}}{SST} = 1 - \frac{SS_E}{SST}.
:::

Interpretace: `R²` je *podíl variability `Y` vysvětlené modelem*. Hodnoty:

* `R² = 0` — model nevysvětluje nic (ekvivalentní `Ŷ = Ȳ`).
* `R² = 1` — perfektní fit (model prochází všemi body).
* `R² = 0,90` — model vysvětluje 90 % variability `Y`.

### Vztah s korelací

Pro jednoduchou regresi `Y ∼ x`: `R² = r²`, kde `r` je Pearsonův korelační koeficient mezi `x` a `Y`. Tedy `R = ±r` (znaménko podle sklonu).

Pro vícenásobnou regresi: `R = corr(Y, Ŷ)` — *vícenásobný* korelační koeficient.

## Problémy s R²

### 1. Roste s každým prediktorem

Přidáním libovolného prediktoru (i čistě šumu) `R²` se *nikdy nesníží* — vždy zůstává stejné nebo roste. Důvod: model s víc volnostmi (přidaným sloupcem v `X`) může vždy fitovat data alespoň tak dobře.

Důsledek: porovnání modelů různé komplexity *čistě podle `R²`* je *zavádějící*. Komplexnější model vyhraje vždy, i když je *přeparametrizovaný* (overfit).

### 2. Citlivost na outliers

Outlier vzdálený od centra dat *výrazně zvedne* `SS_Reg` (vysoký leverage) a tedy `R²`. Robustní alternativy nejsou tak postižené.

### 3. Není „test"

`R² = 0,75` zní hezky, ale neříká nic o *statistické signifikanci*. Pro malý vzorek může být `R² = 0,75` čistě šum; pro velký vzorek může být `R² = 0,01` *signifikantní*.

## Adjusted R² (R²_adj)

Penalizuje komplexitu — počítá *podíl vysvětlené variability na stupeň volnosti*:

::: math
R^2_{adj} = 1 - \frac{SS_E / (n - p - 1)}{SST / (n - 1)} = 1 - (1 - R^2) \cdot \frac{n - 1}{n - p - 1}.
:::

* Pro `p = 0` (jen intercept): `R²_adj = 0`.
* `R²_adj < R²` vždy.
* `R²_adj` se *může i snižovat* s přidáním zbytečného prediktoru (na rozdíl od `R²`).

### Interpretace

`R²_adj` zhruba odpovídá pravděpodobnosti, že model bude generalizovat — vysvětlí variabilitu *na nových* datech. Není to přesná míra, ale lepší pro porovnání modelů různé komplexity.

### Volba mezi `R²` a `R²_adj`

* **Reportujte oba** — zákazník/recenzent obvykle ocení obě.
* **Pro decision**: použij `R²_adj` (nebo lépe: AIC, BIC, cross-validation).
* **Pro popisnou** intepretaci („model vysvětluje X % variability"): `R²`.

## PRESS — Prediction Error Sum of Squares

PRESS je *cross-validation* metrika — měří, jak by model fungoval na nových datech. Definice (přes *leave-one-out*):

::: math
PRESS = \sum_{i=1}^{n} \frac{\hat{\varepsilon}_i^2}{(1 - h_{ii})^2},
:::

kde `h_{ii}` je *leverage* (diagonální prvek hat matrix — viz [[hat-matrix-leverage]]). 

### Proč ten zvláštní vzorec

Pokud bych chtěl `PRESS` spočítat „naivně" — refit modelu bez `i`-tého pozorování, predikce na `i`, kvadratická chyba — bylo by to `n × refit`. Drahé pro velké `n`.

Trik: existuje *analytická* formule pro `Ŷᵢ` v modelu bez `i`-tého bodu:

::: math
\hat{Y}_{i,(-i)} = \hat{Y}_i - \frac{\hat{\varepsilon}_i \cdot h_{ii}}{1 - h_{ii}}.
:::

Reziduum *jackknife*: `Yᵢ − Ŷ_{i,(−i)} = ε̂ᵢ/(1 − h_{ii})`. Druhá mocnina:

::: math
PRESS = \sum_{i=1}^{n} \left( \frac{\hat{\varepsilon}_i}{1 - h_{ii}} \right)^2.
:::

Spočítatelné z *jednoho* fit modelu.

### R²_pred (cross-validation R²)

::: math
R^2_{pred} = 1 - \frac{PRESS}{SST}.
:::

* `R²_pred < R²_adj < R²` typicky.
* `R²_pred` přímo měří *prediktivní* schopnost.
* Pokud `R²_pred ≪ R²`, model trpí *overfitting*.

## AIC a BIC — alternativní kritéria

Pro porovnání modelů (nested i ne-nested):

* **AIC** (Akaike): `AIC = −2 log L(θ̂) + 2k = n log(RSS/n) + 2k`. Penalizuje `k` (počet parametrů).
* **BIC** (Bayesian): `BIC = −2 log L(θ̂) + k log n`. Silnější penalty pro velké `n`.

Nižší = lepší. AIC tends k vybrat *více* parametrů než BIC.

### Vlastnosti

| Kritérium | Penalizace | Tendence | Vhodné kdy |
| :--- | :--- | :--- | :--- |
| `R²` | žádná | overfit | popis, ne výběr |
| `R²_adj` | mírná | méně overfit | porovnání modelů |
| `R²_pred` (PRESS) | implicitní (LOOCV) | dobré pro prediction | predikce |
| AIC | `2k` | mírná | asymptotická efektivnost |
| BIC | `k log n` | striktnější | konzistentní výběr |
| Cross-validation | empirická | nejrobustnější | predikce, výpočetně náročné |

## Porovnání modelů — workflow

1. Fitti všechny kandidátní modely (full subset, stepwise, lasso atd.).
2. Pro každý: `R², R²_adj, AIC, BIC, R²_pred`.
3. Reportuj tabulku — neopři rozhodnutí o *jediné* metriku.
4. Pro finální model: *cross-validation* na *holdout* datech.

::: svg "Porovnání R², R²_adj a R²_pred: R² roste monotónně s p, R²_adj má maximum někde uvnitř, R²_pred trestá overfit silněji."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <line x1="50" y1="170" x2="500" y2="170" stroke="var(--line-strong)"/>
    <line x1="50" y1="20" x2="50" y2="170" stroke="var(--line-strong)"/>
    <text x="50" y="185" text-anchor="middle" fill="var(--text-muted)">1</text>
    <text x="280" y="185" text-anchor="middle" fill="var(--text-muted)">počet prediktorů p</text>
    <text x="500" y="185" text-anchor="middle" fill="var(--text-muted)">20</text>
    <text x="35" y="20" text-anchor="end" fill="var(--text-muted)">1.0</text>
    <text x="35" y="172" text-anchor="end" fill="var(--text-muted)">0</text>

    <path d="M 50 130 Q 150 100 250 70 Q 350 45 450 30 Q 480 25 500 22" stroke="var(--accent)" stroke-width="2" fill="none"/>
    <text x="320" y="42" fill="var(--accent)">R²</text>

    <path d="M 50 130 Q 150 105 250 80 Q 280 70 320 75 Q 380 90 500 105" stroke="var(--accent-line)" stroke-width="2" fill="none"/>
    <text x="380" y="100" fill="var(--accent-line)">R²_adj</text>

    <path d="M 50 130 Q 150 115 250 105 Q 290 102 310 110 Q 380 135 500 165" stroke="var(--text-muted)" stroke-width="2" fill="none"/>
    <text x="430" y="140" fill="var(--text-muted)">R²_pred</text>
  </g>
</svg>
:::

## Důležité poznámky

* **Nestandardně vysoké `R²`** (např. `R² = 0,99`) = pravděpodobně *overfitting* nebo *data leakage* (cílová proměnná leak do prediktorů). Vyšetři.
* **Nízké `R²`** *neznamená* špatný model. Pro lidské chování typicky `R² ≈ 0,1–0,3`, a stále může být užitečný.
* **`R²` se zhoršuje při scale change?** Ne — je invariantní vůči lineárním transformacím `Y`.
* **Negative `R²`?** Pro modely *bez interceptu* nebo *out-of-sample* `R²_pred` ano — model je horší než `Ȳ`.

::: viz r2-adjusted-overfit "Přidávejte šumové prediktory; R² monotónně roste, R²_adj plateauje, R²_pred (PRESS) klesá → odhalený overfit."
:::

::: link "Faraway, J.: Linear Models with R, kap. 3" "https://www.routledge.com/Linear-Models-with-R/Faraway/p/book/9781439887332"
:::

::: link "Anscombe, F.: Graphs in Statistical Analysis (Am. Statistician 1973) — Anscombe's quartet" "https://www.tandfonline.com/doi/abs/10.1080/00031305.1973.10478966"
:::

---

*Zdroj: MSP přednášky 2025/26, *Linear Regression — Model Quality* (Hrabec). Externí reference: Zvára, K.: *Regrese* (Matfyzpress 2019); Faraway, J.: *Linear Models with R* (CRC 2014), kap. 3; Hastie, T., Tibshirani, R., Friedman, J.: *Elements of Statistical Learning* (Springer 2009), kap. 7.*
