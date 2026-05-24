---
title: Vizualizace dat a korelační analýza
---

# Vizualizace dat a korelační analýza

Po výpočtu *popisných charakteristik* ([[popisne-charakteristiky]]) je dalším krokem v EDA *vizualizace* — grafické znázornění dat odhalí struktury, které čísla samotná neukáží. Klasická Anscombe quartet ukazuje: čtyři datasety se shodnými průměry, rozptyly a korelacemi, ale **vizuálně zcela odlišnými** vzory. Vždy vizualizujte. Korelační analýza pak kvantifikuje *vztahy mezi páry atributů* — který atribut s čím souvisí, kde je redundance, kde silná predikce.

## Typy grafů — kdy co

### Histogram

Pro **jeden numerický atribut** — zobrazí *distribuci* hodnot.

* Osa X — intervaly hodnot (binning).
* Osa Y — frekvence (počet pozorování v bin).
* Volba *šířky binů* je kritická — moc úzké = noisy, moc široké = ztracená struktura.

Pravidla pro šířku: Sturges (`k = ⌈log₂(n) + 1⌉`), Freedman-Diaconis (`width = 2·IQR/n^(1/3)`), Scott (`width = 3.5·σ/n^(1/3)`).

### Boxplot (box-and-whisker)

Pro **jeden numerický atribut** nebo **srovnání atributů**.

* Zobrazí *5 čísel*: min, Q₁, medián, Q₃, max.
* Body za "whiskers" = potenciální outliery.
* Pro srovnání: jeden box per kategorii (např. plat per oblast).

::: svg "Boxplot zobrazuje 5-číselný souhrn: kvartily, medián a whiskers. Body za whiskers (1.5×IQR) jsou potenciální outliery."
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="10">
  <g>
    <line x1="40" y1="120" x2="500" y2="120" stroke="var(--line)"/>
    <g>
      <line x1="100" y1="50" x2="100" y2="90" stroke="var(--accent-line)"/>
      <line x1="80" y1="50" x2="120" y2="50" stroke="var(--accent-line)"/>
      <rect x="100" y="50" width="120" height="50" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
      <line x1="170" y1="50" x2="170" y2="100" stroke="var(--accent)" stroke-width="2"/>
      <line x1="220" y1="100" x2="280" y2="100" stroke="var(--accent-line)"/>
      <line x1="280" y1="80" x2="280" y2="120" stroke="var(--accent-line)"/>
      <line x1="260" y1="80" x2="300" y2="80" stroke="var(--accent-line)"/>
      <text x="100" y="135" text-anchor="middle" fill="var(--text-muted)" font-size="9">min</text>
      <text x="120" y="42" text-anchor="middle" fill="var(--text-muted)" font-size="9">Q₁</text>
      <text x="170" y="42" text-anchor="middle" fill="var(--text)" font-size="9" font-weight="600">median</text>
      <text x="220" y="42" text-anchor="middle" fill="var(--text-muted)" font-size="9">Q₃</text>
      <text x="280" y="135" text-anchor="middle" fill="var(--text-muted)" font-size="9">max (whisker)</text>
      <circle cx="380" cy="75" r="4" fill="var(--accent)" />
      <text x="380" y="60" text-anchor="middle" fill="var(--text)" font-size="9">outlier</text>
      <circle cx="450" cy="75" r="4" fill="var(--accent)"/>
    </g>
  </g>
</svg>
:::

### Bar chart

Pro **kategorický atribut** — frekvence (count) každé kategorie.

Použití: rozložení pohlaví, jazyků, krevních skupin.

### Scatter plot (bodový graf)

Pro **dva numerické atributy** — každý bod = jedno pozorování.

* Osa X = atribut A.
* Osa Y = atribut B.
* Vizualizuje **vztah** mezi A a B.

```
y                       y                       y
^                       ^                       ^
|        ●●             |  ●                    | ●● ● ●
|      ●●●●             |     ●●                | ●● ● ●●
|    ●●●●               |       ●●●             | ● ●● ●
|  ●●●●                 |          ●●●          | ●● ●●
|●●                     |             ●●        | ● ●● ●
+──────────→ x         +──────────→ x         +──────────→ x
 pos. korelace          neg. korelace          žádná korelace
```

### Scatter plot matrix (pair plot)

Pro **N atributů** najednou — matice scatter plotů (N×N), na diagonále jsou histogramy.

Užitečné pro rychlý přehled. Pro velké N (10+) je velikost obrazu obtížně čitelná.

### Heatmap

Pro **korelační matici** — barevný gradient od záporné po kladnou korelaci.

```
        a       b       c       d
   a  +1.00   +0.85   -0.32   +0.12
   b  +0.85   +1.00   -0.41   +0.08
   c  -0.32   -0.41   +1.00   -0.67
   d  +0.12   +0.08   -0.67   +1.00
```

### Time series plot

Pro **časová řada** — osa X = čas, osa Y = hodnota.

### Pie chart (koláčový graf)

Pro **kategorický atribut s několika málo kategoriemi** — proporce. **Nepoužívat** pro více než 5 kategorií a pro porovnávání více koláčů — bar chart je lepší.

## Korelační analýza

**Korelace** je míra *lineární* závislosti mezi dvěma numerickými atributy.

### Pearsonův korelační koeficient

$$ r_{xy} = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \sum (y_i - \bar{y})^2}} $$

* Rozsah: `-1 ≤ r ≤ +1`.
* `r = +1` — *perfektní pozitivní* lineární vztah.
* `r = -1` — *perfektní negativní* lineární vztah.
* `r = 0` — *žádný lineární* vztah (ale může být *nelineární*!).

Pearson je vhodný pro **normálně rozdělená** data bez outlierů.

### Spearmanův korelační koeficient

Pearson na *ranks* (pořadích) místo hodnot. Měří *monotónní* závislost.

* Robustní vůči outlierům.
* Pro ordinální data.
* Detekuje monotónní (i nelineární) vztahy.

### Kendallovo τ

Další rank-based korelace. Robustnější než Spearman pro malé samples.

## Korelace ≠ příčinná souvislost

**Korelace neimplikuje kauzalitu!** Klasický příklad:

* Korelace: prodej zmrzliny ↔ utopení v jezerech.
* Příčina obou: léto (horko).
* Snaha zákazu zmrzliny *nezabrání utopení*.

Vždy hledejte *společný confounder* (skrytý faktor).

## Bodový graf — interpretace

::: svg "Tři bodové grafy: pozitivní korelace (r ≈ 0.8), žádná korelace (r ≈ 0), negativní korelace (r ≈ -0.7). Spočtěte Pearson koeficient pro orientaci, ale vždy se podívejte vizuálně."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="10">
  <g>
    <text x="90" y="20" text-anchor="middle" fill="var(--text)" font-weight="600">r ≈ +0.85</text>
    <line x1="30" y1="160" x2="160" y2="160" stroke="var(--line)"/>
    <line x1="30" y1="30" x2="30" y2="160" stroke="var(--line)"/>
    <g fill="var(--accent)">
      <circle cx="40" cy="150" r="2"/>
      <circle cx="50" cy="142" r="2"/>
      <circle cx="60" cy="130" r="2"/>
      <circle cx="70" cy="118" r="2"/>
      <circle cx="80" cy="115" r="2"/>
      <circle cx="90" cy="100" r="2"/>
      <circle cx="100" cy="92" r="2"/>
      <circle cx="110" cy="78" r="2"/>
      <circle cx="120" cy="70" r="2"/>
      <circle cx="130" cy="55" r="2"/>
      <circle cx="140" cy="42" r="2"/>
      <circle cx="150" cy="38" r="2"/>
    </g>
  </g>
  <g>
    <text x="270" y="20" text-anchor="middle" fill="var(--text)" font-weight="600">r ≈ 0</text>
    <line x1="210" y1="160" x2="340" y2="160" stroke="var(--line)"/>
    <line x1="210" y1="30" x2="210" y2="160" stroke="var(--line)"/>
    <g fill="var(--accent)">
      <circle cx="220" cy="80" r="2"/><circle cx="225" cy="120" r="2"/>
      <circle cx="240" cy="60" r="2"/><circle cx="245" cy="140" r="2"/>
      <circle cx="255" cy="90" r="2"/><circle cx="265" cy="50" r="2"/>
      <circle cx="270" cy="110" r="2"/><circle cx="280" cy="140" r="2"/>
      <circle cx="290" cy="70" r="2"/><circle cx="295" cy="120" r="2"/>
      <circle cx="305" cy="100" r="2"/><circle cx="315" cy="50" r="2"/>
      <circle cx="325" cy="130" r="2"/>
    </g>
  </g>
  <g>
    <text x="450" y="20" text-anchor="middle" fill="var(--text)" font-weight="600">r ≈ -0.75</text>
    <line x1="390" y1="160" x2="520" y2="160" stroke="var(--line)"/>
    <line x1="390" y1="30" x2="390" y2="160" stroke="var(--line)"/>
    <g fill="var(--accent)">
      <circle cx="400" cy="40" r="2"/>
      <circle cx="410" cy="55" r="2"/>
      <circle cx="420" cy="70" r="2"/>
      <circle cx="430" cy="85" r="2"/>
      <circle cx="440" cy="95" r="2"/>
      <circle cx="450" cy="110" r="2"/>
      <circle cx="460" cy="115" r="2"/>
      <circle cx="470" cy="125" r="2"/>
      <circle cx="480" cy="130" r="2"/>
      <circle cx="490" cy="140" r="2"/>
      <circle cx="500" cy="150" r="2"/>
      <circle cx="510" cy="148" r="2"/>
    </g>
  </g>
</svg>
:::

## Použití korelační matice

V analytickém projektu korelační matice slouží:

1. **Identifikace redundantních atributů** — pokud `r > 0.95`, atributy nesou téměř stejnou informaci. Můžeme jeden vyřadit (redukce dimenzionality).
2. **Předfiltrace prediktorů** — pro klasifikační úlohu hledáme atributy *silně korelované* s cílem (label).
3. **Multicollinearity check** — lineární regrese je *citlivá* na vzájemně korelované prediktory.
4. **Pochopení domény** — překvapivé korelace prozradí *skryté faktory* nebo *chyby v datech*.

## Anscombe's quartet — proč nevizualizovat data je chyba

Čtyři datasety **se shodnými** popisnými statistikami:

* `mean(x) = 9`, `mean(y) = 7.50`
* `var(x) = 11`, `var(y) = 4.13`
* `cor(x,y) = 0.816`
* Regrese: `y = 0.5x + 3`

Ale **vizuálně zcela odlišné**:

1. *Lineární* vztah s šumem.
2. *Kvadratický* vztah (Pearson nepostihne!).
3. *Lineární* s jedním obrovským outlierem.
4. *Vertikální shluk* + jedna influential bod (changes regression).

::: link "Anscombe's quartet (Wikipedia)" "https://en.wikipedia.org/wiki/Anscombe%27s_quartet"
:::

Závěr: **Vždy si data vizualizujte.** Popisné statistiky bez vizualizace mohou klamat.

::: viz anscombe-and-correlation "Anscombe quartet — všechny čtyři datasety mají r = 0.816 a y = 3 + 0.5x, ale liší se vizuálně. Přetáhněte bod, sledujte Pearson r vs. Spearman ρ."
:::

## Pravidla pro dobrou vizualizaci

* **Klamat barvami** — používejte konzistentní paletu. Pro divergentní data (kladné/záporné) divergent palette (RdBu); pro sekvenční jednu hue (Blues).
* **Vyhněte se 3D grafům** — méně čitelné, perspektiva klame.
* **Použít vhodný typ** — distribuce → histogram/density plot; vztah → scatter; porovnání → bar chart; složení → stacked bar nebo pie (sparingly).
* **Štítky a popisky** — vždy s jednotkami, jasným titulkem.
* **Color blind** — používejte palety odolné vůči barvosleposti (viridis, plasma).

## Nástroje

* **Python**: matplotlib (low-level), seaborn (high-level statistical), plotly (interactive), altair (declarative).
* **R**: ggplot2 (grammar of graphics).
* **JavaScript**: D3.js (low-level), Vega-Lite (declarative), Observable Plot.
* **BI**: Tableau, Power BI, Looker, Metabase.

```python
import seaborn as sns
import matplotlib.pyplot as plt

# Korelační heatmap
correlation = df.corr()
sns.heatmap(correlation, annot=True, cmap='RdBu_r', center=0)

# Pair plot
sns.pairplot(df, hue='category')

# Boxplot per group
sns.boxplot(data=df, x='region', y='salary')

# Distribution
sns.histplot(df['salary'], bins=30, kde=True)

plt.show()
```

## Praktické pravidlo

V EDA dělejte **vždy minimálně**:

1. **`df.describe()`** — popisné statistiky.
2. **`df.info()`** — typy, missing values.
3. **Histogram** každého numerického atributu.
4. **Bar chart** každého kategorického atributu.
5. **Korelační matice** numerických atributů.
6. **Pair plot** klíčových atributů (≤ 6).
7. **Boxplot** numerických atributů po kategoriích.

Toto dá **náhled do dat** za 5 minut. Bez toho je modelování slepé.

::: link "Wilke, C. O.: Fundamentals of Data Visualization (kniha)" "https://clauswilke.com/dataviz/"
:::

::: link "Seaborn — statistical data visualization" "https://seaborn.pydata.org/"
:::

::: link "Anscombe, F. J.: Graphs in Statistical Analysis (1973)" "https://www.jstor.org/stable/2682899"
:::

---

*Zdroj: UPA přednáška *Porozumění datům* (Burgetová). Externí reference: Anscombe, F. J.: *Graphs in Statistical Analysis*, The American Statistician 1973; Wilke, C. O.: *Fundamentals of Data Visualization*, O'Reilly 2019; Cleveland, W. S.: *Visualizing Data*, Hobart Press 1993; Tukey, J. W.: *Exploratory Data Analysis*, Addison-Wesley 1977.*
