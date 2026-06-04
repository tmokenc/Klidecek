---
title: Popisné charakteristiky dat — míry polohy a variability
---

# Popisné charakteristiky dat — míry polohy a variability

V *explorační analýze* (Exploratory Data Analysis, EDA) zkoumáme datovou sadu pomocí **popisných statistik** — měr, které shrnují distribuci hodnot atributu jediným číslem. Bez tohoto kroku slepě modelujeme — propást extrémy, asymetrie, *outliery* nebo nedostatečně reprezentovaná data. EDA je nedílnou součástí fáze *pochopení dat* v CRISP-DM ([[crisp-dm]]). Klíčové míry: **míry polohy** (kde leží střed) a **míry variability** (jak jsou data rozptýlena).

## Motivace — proč popisné charakteristiky

Statistický soubor *n pozorování* je *vzorek* (sample) z širší populace. Z měr vzorku odhadujeme *parametry populace* (v omezené míře, viz statistika v MSP).

Cíle EDA:
* Pochopit *rozložení* hodnot — symetrické? asymetrické? bimodální? extrémy?
* Detekovat *anomálie* — outliery, chybějící hodnoty, nekonzistence.
* Porovnat *subpopulace* — liší se klienti z různých regionů?
* Identifikovat *vztahy* — jaké atributy jsou korelované? Viz [[vizualizace-korelace]].

## Kategorie statistických měr

* **Míry polohy** — určují *střed* dat nebo body z hlediska rozložení.
* **Míry variability** — určují *rozptýlenost* kolem středu.
* **Další** — šikmost, špičatost.

Z hlediska *distribuce výpočtu* dělíme:

* **Distributivní** — lze počítat *distribuovaně*, výsledek stejnou operací s mezivýsledky. Příklad: `count`, `sum`. (Pokud máme částečné counts z map jobs, sečteme je v reduce.)
* **Algebraické** — výsledek *algebraickou operací* nad jednou nebo více distributivními. Příklad: `average = sum / count`.
* **Holistické** — *nelze* spočítat distribuovaně, je nutný *celý soubor*. Příklad: `median`, `mode`.

Distributivní a algebraické míry jsou vhodné pro Big Data; holistické vyžadují *aproximace* (např. T-Digest pro percentily).

## Míry polohy

### Aritmetický průměr (mean)

$$ \bar{x} = \frac{1}{n} \sum_{i=1}^{n} x_i \quad \mu = \frac{\sum x}{N} $$

* Symbol vzorku: `x̄`; populace: `μ`.
* Algebraická míra.
* **Citlivost na outliery** — jediná extrémní hodnota výrazně posune průměr (klasický příklad: průměr platů v místnosti s Billem Gatesem).

### Vážený průměr

$$ \bar{x} = \frac{\sum_{i=1}^{n} w_i x_i}{\sum_{i=1}^{n} w_i} $$

Pro hodnoty s různou váhou (např. ceny zboží vážené množstvím).

### Geometrický průměr

$$ x_G = \sqrt[n]{\prod_{i=1}^{n} x_i} $$

Pro *kladné* hodnoty. Vhodný pro:
* **Růstové míry** — průměrný roční růst za víceleté období.
* **Poměry** — average ratio (např. average P/E v portfoliu akcií).

### Medián

*Prostřední* hodnota v seřazeném souboru (50% kvantil).

* Pro lichý počet: středový prvek.
* Pro sudý: aritmetický průměr dvou středových.
* **Robustní vůči outlierům** — odolá extremům.
* Holistická míra — vyžaduje celý soubor.

Použití: charakteristika *typické* hodnoty, když distribuce má dlouhé ocasy (platy, ceny nemovitostí).

### Modus

*Nejčastější* hodnota.

* Pro nominální atributy *jediná* mířa středu.
* Pro spojitá data se používá *mode* z histogramu nebo *kernel density estimator*.
* Distribuce může mít *více modů* (bimodální, multimodální).

### Trimmed mean (upravený průměr)

Průměr po *odstranění extrémních* hodnot (např. dolních a horních 5 %).

* Kompromis mezi mean a median.
* Robustní vůči outlierům, ale stále se počítá jako arithmetic mean.

## Vztahy mezi mírami

::: svg "Tři míry polohy — průměr (citlivý na ocasy), medián (robustní), modus (nejčastější hodnota). V symetrické distribuci se shodují; v pravostranně šikmé je průměr > medián > modus."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <text x="135" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">Symetrická</text>
    <path d="M 30 160 Q 130 50 230 160" fill="none" stroke="var(--accent)" stroke-width="2"/>
    <line x1="130" y1="160" x2="130" y2="60" stroke="var(--text-muted)" stroke-dasharray="2 2"/>
    <text x="130" y="178" text-anchor="middle" fill="var(--text)" font-size="10">mean = median</text>
    <text x="130" y="190" text-anchor="middle" fill="var(--text-muted)" font-size="10">= mode</text>
  </g>
  <g>
    <text x="405" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">Pravostranně šikmá</text>
    <path d="M 300 160 Q 350 50 380 100 Q 430 130 500 160" fill="none" stroke="var(--accent)" stroke-width="2"/>
    <line x1="358" y1="160" x2="358" y2="65" stroke="#3a9" stroke-dasharray="2 2"/>
    <text x="358" y="178" text-anchor="middle" fill="#3a9" font-size="10">mode</text>
    <line x1="390" y1="160" x2="390" y2="80" stroke="#69c" stroke-dasharray="2 2"/>
    <text x="390" y="178" text-anchor="middle" fill="#69c" font-size="10">median</text>
    <line x1="425" y1="160" x2="425" y2="115" stroke="#c84" stroke-dasharray="2 2"/>
    <text x="425" y="178" text-anchor="middle" fill="#c84" font-size="10">mean</text>
  </g>
</svg>
:::

V *symetrické* distribuci se mean, median, mode shodují. V *pravostranně šikmé* (pozitivní šikmost) jsou v pořadí `mode < median < mean` — ocas táhne průměr doprava.

## Míry variability

### Rozptyl (variance)

$$ \sigma^2 = \frac{1}{N} \sum_{i=1}^{N} (x_i - \mu)^2 \quad s^2 = \frac{1}{n-1} \sum_{i=1}^{n} (x_i - \bar{x})^2 $$

* `σ²` pro populaci, `s²` pro vzorek (Bessel's correction — `n-1` místo `n`).
* Jednotky jsou *kvadrát* originálu (Kč² pro plat) — nepraktické.

### Směrodatná odchylka (standard deviation)

$$ \sigma = \sqrt{\sigma^2} \quad s = \sqrt{s^2} $$

* Stejné jednotky jako originální data.
* *Citlivá na outliery* (kvadrát zvětšuje vliv extrémních hodnot).

### Rozsah (range)

`R = max - min` — rozdíl největší a nejmenší hodnoty. Velmi citlivé na outliery.

### Mezikvartilové rozpětí (IQR)

`IQR = Q₃ - Q₁` — kvartily.
* `Q₁` = 25% kvantil (dolní kvartil).
* `Q₃` = 75% kvantil (horní kvartil).
* IQR pokrývá *prostředních 50 %* dat.

**Robustní** vůči outlierům — nezávisí na extrémech.

### Kvantily

`q-tý kvantil` je hodnota, pod kterou leží `q × n` pozorování (0 ≤ q ≤ 1).

* `q = 0.25` — Q₁ (dolní kvartil).
* `q = 0.50` — medián.
* `q = 0.75` — Q₃ (horní kvartil).
* `q = 0.05`, `0.95` — percentily používané pro confidence intervals.

## Boxplot — vizualizace pomocí kvantilů

**Box-and-whisker plot** (J. Tukey, 1977) zobrazuje 5 čísel: min, Q₁, medián, Q₃, max.

```
         ┌──┬──┐
   ──────┤  │  ├──────       ← box = IQR (Q₁–Q₃), svislá čára uvnitř = medián
         └──┴──┘
   min     Q₁ M Q₃     max
```

Body za "whiskers" (typicky 1.5 × IQR od kvartilu) jsou *podezřelé outliery*. Více v [[vizualizace-korelace]].

## Šikmost (skewness)

Míra asymetrie distribuce.

$$ g_1 = \frac{1}{n} \sum_{i=1}^{n} \left( \frac{x_i - \bar{x}}{s} \right)^3 $$

* `g₁ > 0` — *pravostranně* šikmé (dlouhý ocas vpravo; mean > median).
* `g₁ < 0` — levostranně šikmé.
* `g₁ ≈ 0` — symetrická.

## Špičatost (kurtosis)

Míra "vrcholatosti" / "ocasovosti".

$$ g_2 = \frac{1}{n} \sum_{i=1}^{n} \left( \frac{x_i - \bar{x}}{s} \right)^4 - 3 $$

* `g₂ > 0` — *leptokurtická* (ostřejší vrchol, těžší ocasy než normální).
* `g₂ ≈ 0` — *mesokurtická* (jako normální).
* `g₂ < 0` — *platykurtická* (plošší vrchol).

Vysoká kurtosis = více outlierů.

## Pět-číselný souhrn (five-number summary)

Klasický popisný souhrn: `(min, Q₁, median, Q₃, max)`. V pandas:

```python
df['salary'].describe()
# count    1000
# mean    52000
# std     15000
# min     20000
# 25%     40000  ← Q1
# 50%     50000  ← median
# 75%     65000  ← Q3
# max    120000
```

## Robustní vs. nerobustní míry

Robustní (odolné vůči outlierům): median, IQR, MAD (median absolute deviation), trimmed mean.

Nerobustní: mean, variance, standard deviation, range.

**Pro reálná data preferujte robustní míry** — outliery jsou v praxi všudypřítomné (chyby zadání, atypické případy).

## Distribuce — důležitá rozdělení

Některá rozdělení jsou *typická*:

* **Normální** — symetrická "zvonová křivka". Mean = median = mode.
* **Log-normální** — pravostranně šikmá. Typická pro platy, čas trvání úkolů.
* **Exponenciální** — pro doby do události (čekání, mezery mezi událostmi).
* **Power law** (Zipfovo, Paretovo) — extrémně pravostranně šikmá. Frekvence slov, velikost měst, bohatství.

Pro analytiku je *test normality* (Shapiro-Wilk, Q-Q plot) klíčový — mnohé statistické testy (t-test, ANOVA) předpokládají normalitu.

## Příklad — popisné statistiky platů {tier=example}

```
platy = [25, 30, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90, 100, 250]  -- tis. Kč
```

* `count = 14`
* `mean = 68.6` (citlivé na 250 outlier)
* `median = 52.5`
* `mode = 30`
* `range = 250 - 25 = 225`
* `Q₁ = 35`, `Q₃ = 80`, `IQR = 45` (Tukeyho kvartily)
* `std ≈ 55.1` (populační) / `≈ 57.2` (výběrová, `n-1`)
* Distribuce pravostranně šikmá — `mean > median > mode`.

Bez popisných statistik bychom slepě modelovali jako kdyby data byla "rozumně rozložená". Outlier 250 by mohl být chyba zadání nebo skutečný high-paid expert — *rozhodnutí* (vyhodit, ponechat, oddělit) musí udělat doménový expert.

::: viz distribution-explorer "Posuvníky šikmosti a počtu outlierů ukáží, kdy se mean / median / mode rozcházejí a kdy robustní míry (median, IQR) zůstanou v klidu."
:::

## Praktické nástroje {tier=practice}

* **pandas** (`df.describe()`, `df.quantile()`).
* **numpy** (`np.mean`, `np.std`, `np.percentile`).
* **scipy.stats** (`scipy.stats.describe`, `scipy.stats.skew`, `scipy.stats.kurtosis`).
* **R** (`summary()`, `quantile()`).
* **SQL** (`AVG`, `STDDEV`, `PERCENTILE_CONT`).

::: link "Tukey, J. W.: Exploratory Data Analysis (kniha, 1977)" "https://www.amazon.com/Exploratory-Data-Analysis-John-Tukey/dp/0201076160"
:::

::: link "pandas — Descriptive Statistics documentation" "https://pandas.pydata.org/docs/user_guide/basics.html#descriptive-statistics"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=SzZ6GpcfoQY" "Calculating the Mean, Variance and Standard Deviation, Clearly Explained!!!" "StatQuest with Josh Starmer"
:::

*Zdroj: UPA přednáška *Porozumění datům* (Burgetová). Externí reference: Tukey, J. W.: *Exploratory Data Analysis*, Addison-Wesley 1977; Han, J., Kamber, M., Pei, J.: *Data Mining — Concepts and Techniques*, 3rd ed., Morgan Kaufmann 2012, kap. 2; Zendulka, J. et al.: *Získávání znalostí z databází — studijní opora*, FIT VUT 2009.*
