---
title: Hat matrix, leverage, influential observations
---

# Hat matrix, leverage, influential observations

**Hat matrix** `H = X(XᵀX)⁻¹Xᵀ` je geometricky *ortogonální projekce* na sloupcový prostor `X`. Diagonální prvky `h_{ii}` se nazývají **leverages** — kvantifikují, *jak moc* pozorování `i` ovlivňuje vlastní predikci. Pozorování s vysokým `h_{ii}` jsou *influential* — můžou samostatně řídit fit modelu. Tato kapitola pokrývá hat matrix, leverages a další metriky vlivu (Cookova vzdálenost, DFBETAS, DFFITS).

## Hat matrix

Definice:

::: math
\mathbf{H} = \mathbf{X}(\mathbf{X}^\top \mathbf{X})^{-1} \mathbf{X}^\top.
:::

Vlastnosti:

* **Symetrická**: `Hᵀ = H`.
* **Idempotentní**: `H² = H` (projekce dvakrát = projekce jednou).
* **Predikce**: `Ŷ = H Y` — proto „hat" matrix („dává Y klobouk").
* **Stopa**: `tr(H) = rank(X) = p + 1` (pro model s interceptem).

## Leverages

**Leverage** pozorování `i`:

::: math
h_{ii} = \mathbf{x}_i^\top (\mathbf{X}^\top \mathbf{X})^{-1} \mathbf{x}_i,
:::

kde `xᵢ` je `i`-tý řádek `X` (vektor prediktorů pro `i`-té pozorování).

Vlastnosti:

* `1/n ≤ h_{ii} ≤ 1` (pro model s interceptem; bez interceptu pouze `0 ≤ h_{ii} ≤ 1`).
* `Σ_i h_{ii} = p + 1`. Průměrný leverage je `(p + 1)/n`.
* `h_{ii} → 0` (teoretická hranice, dosažitelná jen bez interceptu) ⇒ pozorování *nemá vliv* na nic.
* `h_{ii} = 1` ⇒ predikce je *přesně* rovna pozorování (`Ŷᵢ = Yᵢ`), žádné reziduum.

### Geometrická interpretace

Leverage = „vzdálenost" `xᵢ` od centra mraku prediktorů `x̄` v metrice `(XᵀX)⁻¹`. Pozorování s *extrémními* hodnotami prediktorů (outliers v `X`) mají vysoký leverage.

::: svg "Vysoké leverage: pozorování daleko od centra. Mají velký potenciální vliv, ale aktuální vliv závisí i na velikosti rezidua."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <line x1="40" y1="170" x2="500" y2="170" stroke="var(--line-strong)"/>
    <line x1="40" y1="20" x2="40" y2="170" stroke="var(--line-strong)"/>
    <text x="510" y="175" fill="var(--text-muted)">x</text>
    <text x="35" y="20" text-anchor="end" fill="var(--text-muted)">Y</text>
    <line x1="60" y1="155" x2="450" y2="60" stroke="var(--accent)" stroke-width="2"/>
    <g fill="var(--accent-line)">
      <circle cx="120" cy="135" r="3"/>
      <circle cx="160" cy="120" r="3"/>
      <circle cx="200" cy="115" r="3"/>
      <circle cx="240" cy="100" r="3"/>
      <circle cx="280" cy="85" r="3"/>
      <circle cx="320" cy="80" r="3"/>
    </g>
    <circle cx="475" cy="40" r="6" fill="var(--accent)" stroke="var(--text)" stroke-width="1"/>
    <text x="475" y="30" text-anchor="middle" fill="var(--accent)" font-size="10">vysoký leverage</text>
    <line x1="475" y1="46" x2="475" y2="58" stroke="var(--text-muted)" stroke-dasharray="2 2"/>
    <text x="200" y="50" fill="var(--text-muted)" font-size="10">"normální" body — nízký leverage</text>
  </g>
</svg>
:::

## Threshold pro vysoký leverage

Standardní pravidlo:

* `h_{ii} > 2(p + 1)/n` — *vysoký* leverage (dvojnásobek průměru).
* `h_{ii} > 3(p + 1)/n` — *velmi vysoký* (Belsley-Kuh-Welsch 1980).

Tyto thresholds jsou heuristické; v praxi sledujeme „chvosty" distribuce `{h_{ii}}`.

## Vliv = leverage × reziduum

Sám vysoký leverage *není* špatný — pokud má pozorování *malé reziduum*, model ho dobře vystihuje. Problém nastává, když:

> **Vysoký leverage + velké reziduum = influential observation**

Pozorování s tímto kombinováním *řídí* fit modelu — vyřazení by změnilo `β̂` výrazně. To je nebezpečné: jediný outlier rozhoduje o celém závěru.

## Standardizovaná a studentizovaná rezidua

Surová rezidua `ε̂ᵢ = Yᵢ − Ŷᵢ` mají *různé rozptyly*:

::: math
\mathrm{Var}(\hat{\varepsilon}_i) = \sigma^2 (1 - h_{ii}).
:::

Pozorování s vysokým leverage mají *menší* reziduum (přitlačila regresi k sobě). Pro porovnání:

### Standardizovaná rezidua

::: math
r_i = \frac{\hat{\varepsilon}_i}{S_{res} \sqrt{1 - h_{ii}}}.
:::

Pro normální data má `rᵢ` přibližně rozdělení `N(0, 1)`. Hodnoty `|rᵢ| > 2` jsou *podezřelé*, `|rᵢ| > 3` jsou *extrémní*.

### Studentizovaná (externally) rezidua

::: math
t_i = \frac{\hat{\varepsilon}_i}{S_{res,(-i)} \sqrt{1 - h_{ii}}},
:::

kde `S_{res,(−i)}` je odhad `σ` po vyřazení `i`-tého pozorování. `tᵢ ∼ t(n − p − 2)`.

## Cookova vzdálenost

**Cookova vzdálenost** (Cook 1977) kombinuje leverage a reziduum:

::: math
D_i = \frac{r_i^2}{p + 1} \cdot \frac{h_{ii}}{1 - h_{ii}}.
:::

Interpretace: `Dᵢ` měří, jak by se *změnily všechny predikce*, pokud bych vyřadil `i`-té pozorování.

* `Dᵢ > 0,5` — *podezřelé*.
* `Dᵢ > 1` — *vlivné*, mělo by být zkoumáno.
* Heuristika: `Dᵢ > 4/n`.

## DFBETAS a DFFITS

Detailnější metriky vlivu:

* **DFBETAS_{ij}**: jak se změnil `β̂_j` po vyřazení `i`-tého pozorování. Threshold: `> 2/√n`.
* **DFFITS_i**: jak se změnila predikce `Ŷᵢ` po vyřazení. Threshold: `> 2√((p+1)/n)`.

V R: `influence.measures(model)` vrátí všechny zmíněné metriky.

## Co dělat s influential observations

1. **Zkontrolovat data** — chyba zápisu, jiná měřící jednotka?
2. **Zkoumat kontextu** — je to legitimní extreme value nebo *outlier*?
3. **Reportovat oba modely** — s a bez problematických bodů; rozdíl je informativní.
4. **Robust regression** — least absolute deviations (LAD), M-estimators, RANSAC.
5. **Transformace** — log, Box-Cox může zmírnit problém.

**Neříznout slepě**: jen proto, že je `Dᵢ > 1`, neznamená, že je *špatné*. Může jít o nejdůležitější pozorování v studii.

## Anscombe's quartet

Klasický příklad (Anscombe 1973) — čtyři datasety se *stejnými* `X̄, Ȳ, S_x, S_Y, r, β̂₀, β̂₁` a `R²`, ale *velmi rozdílné* strukturou:

* I — „normální" lineární vztah,
* II — kvadratický vztah (lineární model je špatně),
* III — perfektní vztah, ale jeden outlier táhne fit,
* IV — všechny `x = 8` kromě jednoho s vysokým leverage.

**Důležité ponaučení**: statistiky bez vizualizace mohou *klamat*. Vždy pohled na `scatter plot` a `residual plot`.

::: svg "Anscombe IV: jediný extrémní bod (vysoký leverage) určuje sklon. Bez něj by byl 'tvar dat' jinak."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <line x1="40" y1="150" x2="500" y2="150" stroke="var(--line-strong)"/>
    <line x1="40" y1="20" x2="40" y2="150" stroke="var(--line-strong)"/>
    <line x1="60" y1="140" x2="470" y2="40" stroke="var(--accent)" stroke-width="2"/>
    <g fill="var(--accent-line)">
      <circle cx="120" cy="105" r="3"/>
      <circle cx="120" cy="110" r="3"/>
      <circle cx="120" cy="100" r="3"/>
      <circle cx="120" cy="115" r="3"/>
      <circle cx="120" cy="125" r="3"/>
      <circle cx="120" cy="120" r="3"/>
      <circle cx="120" cy="95" r="3"/>
      <circle cx="120" cy="130" r="3"/>
    </g>
    <circle cx="450" cy="48" r="6" fill="var(--accent)" stroke="var(--text)" stroke-width="1.5"/>
    <text x="450" y="40" text-anchor="middle" fill="var(--accent)">influential point</text>
    <text x="120" y="155" text-anchor="middle" fill="var(--text-muted)" font-size="10">x = 8</text>
    <text x="450" y="65" text-anchor="middle" fill="var(--text-muted)" font-size="10">x = 19</text>
  </g>
</svg>
:::

## Aplikace {tier=practice}

* **Outlier detection** — visualizace `leverage vs. residual plot`.
* **Robust regression** — automatické snižování vlivu influential bodů (`MM-estimator`, `RANSAC`).
* **Sensitivity analysis** — jak stabilní jsou závěry vůči odstranění bodů?
* **Experimental design** — high-leverage designs mají *vysokou* informační hodnotu (pozor: také vysoká bias risk).

::: viz regression-interactive "Přetáhněte krajní bod do extrémní polohy x; sledujte růst h_ii (sloupce dole) a Cookovu vzdálenost."
:::

::: link "Cook, R. D.: Detection of Influential Observations in Linear Regression (Technometrics 1977)" "https://www.tandfonline.com/doi/abs/10.1080/00401706.1977.10489493"
:::

::: link "Belsley, D. A., Kuh, E., Welsch, R. E.: Regression Diagnostics (Wiley 1980)" "https://onlinelibrary.wiley.com/doi/book/10.1002/0471725153"
:::

::: link "Anscombe, F. J.: Graphs in Statistical Analysis (Am. Statistician 1973)" "https://www.tandfonline.com/doi/abs/10.1080/00031305.1973.10478966"
:::

---

*Zdroj: MSP přednášky 2025/26, *Linear Regression — Leverage and Influence* (Hrabec). Externí reference: Zvára, K.: *Regrese* (Matfyzpress 2019); Faraway, J.: *Linear Models with R* (CRC 2014), kap. 6; Belsley, D. A. et al.: *Regression Diagnostics* (Wiley 1980).*
