---
title: Čištění dat — chybějící hodnoty, šum, nekonzistence
---

# Čištění dat — chybějící hodnoty, šum, nekonzistence

**Čištění dat** (data cleaning, data cleansing) je proces přípravy dat k analýze odstraněním nebo úpravou neúplných, nesprávných nebo duplicitních záznamů. Je to *nejpracnější* fáze typického analytického projektu — obvykle tvoří 60–80 % celkového úsilí. Nízká kvalita dat vede k *nízké kvalitě výsledků* (*Garbage In, Garbage Out*). Klíčové úlohy: **ošetření chybějících hodnot**, **identifikace a vyhlazení šumu**, **úprava nekonzistencí**, **deduplikace**.

## Co se počítá jako "nekvalitní data"

* **Přesnost** — vztah k realitě (chybné záznamy, překlepy).
* **Úplnost** — chybějící atributy nebo záznamy.
* **Konzistence** — soulad hodnot napříč zdroji (různé formáty data, jednotek).
* **Aktuálnost** — relevantní pro rozhodování v budoucnosti.
* **Věrohodnost** — důvěra ve zdroj.
* **Přidaná hodnota** — užitečnost pro úlohu.
* **Interpretovatelnost** — pochopitelné kódy intervalů, klasifikační třídy.

Důsledek nízké kvality: nepřesné modely, nesprávné rozhodnutí. Příklady: detekce podvodů s 95 % accuracy znamená nic, pokud podvodné transakce tvoří 1 %; lékařská diagnóza musí být robustní vůči chybám sběru.

## Chybějící hodnoty

### Důvody

* **Volitelnost** — pole nebylo povinné (e-mail u registrace).
* **Nepochopení** — uživatel nepochopil otázku.
* **Nedůležitost v době sběru** — atribut nepovažován za relevantní.
* **Výpadek senzoru** — chybí měření v dané době.
* **Konzistence** — hodnota nepasuje s ostatními a byla vypuštěna.

### Možnosti ošetření

1. **Ignorování záznamu** — odstranit řádky s chybějícími hodnotami (*listwise deletion*).
   * Vhodné: pokud chybí návěští třídy nebo většina atributů.
   * Nevhodné: pokud procento chybějících hodnot kolísá (zkresluje vzorek) nebo by zbylo málo dat.

2. **Doplnění hodnot** (imputation) — automatické nebo ruční.

#### Automatické doplnění (imputation)

**Globální konstantou** — `"neznámá"`, `"třída?"`, `0`, `-1`.

```python
df['oblast'].fillna('neznámá', inplace=True)
df['plat'].fillna(0, inplace=True)  -- často špatně, 0 znamená "skutečně nulový plat"
```

**Hodnotou středu** — průměr (numerické), medián (robustnější), modus (kategorické).

```python
df['vek'].fillna(df['vek'].median(), inplace=True)
df['oblast'].fillna(df['oblast'].mode()[0], inplace=True)
```

* Pro **normální distribuci** — průměr.
* Pro **vychýlenou** — medián (méně citlivý na outliery).
* Pro **kategorickou** — modus.

**Hodnotou středu uvnitř třídy** — průměr/medián jen mezi záznamy téže klasifikační třídy.

```python
df['vek'] = df.groupby('region')['vek'].transform(
    lambda x: x.fillna(x.median())
)
```

**Predikované hodnoty** — nejpravděpodobnější hodnota z bayesovské klasifikace, rozhodovacího stromu, k-NN, regrese.

```python
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer

imputer = IterativeImputer(random_state=0)
df_imputed = imputer.fit_transform(df.select_dtypes(include='number'))
```

**Multiple Imputation** (MICE — Multiple Imputation by Chained Equations) — vícenásobné generování chybějících hodnot s nejistotou, downstream model agreguje.

### Pravidlo: zachovat informaci o chybění

Někdy je *samotná skutečnost chybění* informativní — *chybí, protože uživatel je shy*, *chybí, protože je to zvláštní případ*. Přidat dummy variable `is_X_missing` před imputací.

## Šum (noise)

**Šum** je náhodná chyba nebo odchylka zaznamenaných hodnot. Může se týkat:
* **Hodnot atributu** — odlehlé/rozptýlené hodnoty.
* **Atributu jako celku** — atribut není pro úlohu přínosný.
* **Celého objektu** — řádek odlehlý od ostatních.

### Důvody šumu

* Porucha snímacího zařízení.
* Problémy při vstupu dat (překlepy).
* Problémy přenosu (paketové ztráty, transcoding).
* Nekonzistence formátů, jednotek.

### Metody odstranění šumu — numerické atributy

**Binning (plnění)** — uspořádat data, rozdělit do *košů*, vyhladit hodnoty *v rámci koše*.

* **Equal-width binning** — N intervalů stejné šířky: `w = (B-A)/N`. Jednoduché, ale outliery dominují.
* **Equal-depth binning** — N intervalů s ≈ stejným počtem hodnot. Robustní vůči distribuci.

Po binning lze:
* **Vyhladit průměrem koše** — všechny hodnoty v koši nahradit průměrem.
* **Vyhladit mediánem koše** — robustnější.
* **Vyhladit hraničními hodnotami** — hodnotu nahradit bližší hranicí koše.

```
Hodnoty: 4, 9, 15, 21, 24, 24, 24, 26, 27, 28, 29, 34
Equal-depth do 3 košů (po 4 hodnotách):
  Koš 1: 4, 9, 15, 21
  Koš 2: 24, 24, 24, 26
  Koš 3: 27, 28, 29, 34
Vyhlazení průměrem:
  Koš 1: 12.25, 12.25, 12.25, 12.25  -- průměr (4+9+15+21)/4 = 12.25
  Koš 2: 24.5, 24.5, 24.5, 24.5      -- průměr 98/4 = 24.5
  Koš 3: 29.5, 29.5, 29.5, 29.5      -- průměr 118/4 = 29.5
Vyhlazení hraničními hodnotami:
  Koš 1: 4, 4, 21, 21    -- bližší 4 nebo 21
  Koš 2: 24, 24, 24, 26
  Koš 3: 27, 27, 27, 34
```

**Regrese** — vyhlazení vyrovnáním dat podle regresní funkce (lineární, polynomiální).

**Analýza odlehlých hodnot shlukováním** — body, které nepatří k žádnému shluku, jsou kandidáti na šum.

### Metody pro kategorické atributy

* **Oprava textových hodnot** — oproti známému oboru (rejstříky, slovníky).
* **Odstranění málo četných hodnot** — kategorie s frekvencí pod prahem → nahradit "ostatní".
* **Smoothing** — kombinace s priors (Naive Bayes).

## Detekce outlierů

### Statistické metody

* **Z-score** — body s `|z| > 3` jsou outliery. Předpokládá normalitu.
* **IQR rule** — body za `Q₁ - 1.5·IQR` nebo `Q₃ + 1.5·IQR` jsou suspektní.
* **Modified Z-score** — robustní variace s mediánem a MAD.

### ML metody

* **Isolation Forest** — strom, který se snaží *izolovat* každý bod; outliery jsou izolovány rychle.
* **Local Outlier Factor (LOF)** — měří hustotu kolem bodu vs. jeho sousedů.
* **One-Class SVM** — model normálních dat, ostatní = outlier.
* **DBSCAN** — body bez dostatečně hustého okolí.

### Vícerozměrné outliers

Bod může být *normální v každém atributu samostatně*, ale *outlierem v kombinaci*. Detekce přes Mahalanobis distance, PCA + reconstruction error, hluboké ML modely (autoencodery).

## Nekonzistence

### Druhé formy

Rozdíly ve formátu:

* **Datum** — `"15.3.2025"` vs. `"2025-03-15"` vs. `"3/15/2025"` (UK vs US!) vs. `1742000000` (Unix timestamp).
* **Telefon** — `"+420 123 456 789"` vs. `"123 456 789"` vs. `"123456789"`.
* **Adresa** — `"Botanická 12"` vs. `"Botanicka 12"` (diakritika) vs. `"Botanická ulice 12"`.
* **Jméno** — `"Anna Nováková"` vs. `"Nováková Anna"` vs. `"A. Nováková"`.

### Sémantické rozdíly

* **Pohlaví** — `"M"` vs. `"male"` vs. `"man"` vs. `"1"`.
* **Boolean** — `"true"` vs. `"yes"` vs. `"1"` vs. `"X"`.
* **Měny** — `"50 Kč"` vs. `"50"` (bez jednotky) vs. `"50 €"` (jiná měna).

### Strategie

* **Normalizace** — pevný formát pro všechny záznamy. Datum vždy ISO 8601, čísla vždy s tečkou.
* **Slovník** (lookup table) — mapování variant na kanonickou formu.
* **Regex / parsery** — pro semi-strukturované hodnoty.
* **String matching** — Levenshtein distance, Jaro-Winkler, fuzzywuzzy.

### Redundance

* **Duplicitní záznamy** — stejná entita pod různými ID.
* **Funkční závislosti** — atribut A je odvozený z B (PSČ → město), zachovat oba i přes redundanci.
* **Po integraci dat** — dva zdroje mají *stejné záznamy o stejné entitě* (zákazník v CRM i ve fakturačním systému).

Deduplikace přes **record linkage** / **entity resolution**:
* **Blocking** — předfiltrovat páry kandidátů (jen ti s podobným prefixem jména).
* **Comparison** — porovnat páry (string similarity, numeric difference).
* **Classification** — match / no-match / human review.

Knihovny: `dedupe` (Python), `recordlinkage`.

## Čištění dat jako proces

1. **Detekce nesrovnalostí** — explorační analýza, metadata (doména, rozsah, závislosti, rozdělení), automatická kontrola integritních omezení (PRIMARY KEY, UNIQUE, NULL, foreign keys, PSČ, RČ, IČO).
2. **Odstranění nesrovnalostí** — aplikace strategií výše. Typicky vyžaduje *více iterací* s interakcí uživatele.
3. **Validace** — re-run integrity tests, sample manual review.
4. **Dokumentace** — log změn, *audit trail*. Co bylo upraveno a proč.

::: svg "Iterativní proces čištění dat: detekce nesrovnalostí → analýza → odstranění → validace → re-iterace."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="20" y="60" width="100" height="50" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="70" y="82" text-anchor="middle" fill="var(--text)" font-weight="600">Detekce</text>
    <text x="70" y="98" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">profilování</text>
    <line x1="120" y1="85" x2="155" y2="85" stroke="var(--accent)" marker-end="url(#cl-arr)"/>
    <rect x="155" y="60" width="100" height="50" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="205" y="82" text-anchor="middle" fill="var(--text)" font-weight="600">Analýza</text>
    <text x="205" y="98" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">root cause</text>
    <line x1="255" y1="85" x2="290" y2="85" stroke="var(--accent)" marker-end="url(#cl-arr)"/>
    <rect x="290" y="60" width="100" height="50" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="340" y="82" text-anchor="middle" fill="var(--text)" font-weight="600">Odstranění</text>
    <text x="340" y="98" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">imputace, fix</text>
    <line x1="390" y1="85" x2="425" y2="85" stroke="var(--accent)" marker-end="url(#cl-arr)"/>
    <rect x="425" y="60" width="100" height="50" fill="var(--bg-card)" stroke="var(--accent)" rx="6"/>
    <text x="475" y="82" text-anchor="middle" fill="var(--text)" font-weight="600">Validace</text>
    <text x="475" y="98" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">re-test</text>
    <path d="M 475 110 Q 475 140 70 140 Q 70 120 70 110" stroke="var(--accent-line)" fill="none" stroke-dasharray="3 3" marker-end="url(#cl-arr)"/>
    <text x="270" y="155" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">iterativní: další problémy se objevují</text>
  </g>
  <defs>
    <marker id="cl-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

::: viz binning-and-outlier-rules "Binning (equal-width vs equal-depth), vyhlazení (mean / median / boundary) a outlierová pravidla (z-score, IQR, MAD). Outlier 250 ovlivňuje jen jednu strategii."
:::

## Nástroje

* **pandas** — `df.dropna()`, `df.fillna()`, `df.isna()`, `df.drop_duplicates()`.
* **scikit-learn** — `SimpleImputer`, `KNNImputer`, `IterativeImputer`.
* **OpenRefine** (Google) — GUI pro čištění tabulkových dat (clustering values, transformations).
* **Trifacta / Dataprep by Google** — komerční ETL s GUI.
* **Great Expectations** — framework pro testování kvality dat.

Příklad pandas pipeline:

```python
import pandas as pd
from sklearn.impute import KNNImputer

# Načtení
df = pd.read_csv('raw_data.csv')

# Detekce
print(df.info())
print(df.describe())
print(df.isna().sum())

# Odstranění úplných duplicit
df = df.drop_duplicates()

# Normalizace formátu
df['phone'] = df['phone'].str.replace(r'\D', '', regex=True)
df['date'] = pd.to_datetime(df['date'], errors='coerce')

# Imputace numerických
imputer = KNNImputer(n_neighbors=5)
df[['age', 'income']] = imputer.fit_transform(df[['age', 'income']])

# Imputace kategorických
df['region'] = df['region'].fillna(df['region'].mode()[0])

# Validace
assert df['age'].between(0, 120).all()
assert df.isna().sum().sum() == 0
```

## Praktické tipy {tier=practice}

* **Audit trail** — uchovejte původní `raw_data.csv` + log změn. Reprodukovatelnost je klíčová.
* **Pipeline as code** — čištění jako Python script/dbt model/Spark job, ne ad-hoc Excel manipulace.
* **Versioning** — DVC, Delta Lake pro datasety.
* **Doménový expert** v okruhu — co je outlier vs. zajímavý případ?
* **Test on small sample first** — pipeline musí být *idempotentní*.

Více o integraci a redukci dat viz [[integrace-etl]] a [[redukce-dat]].

::: link "Han, J., Kamber, M., Pei, J.: Data Mining — Chapter 3 (Data Preprocessing)" "https://hanj.cs.illinois.edu/bk3/"
:::

::: link "Great Expectations — data quality framework" "https://greatexpectations.io/"
:::

---

*Zdroj: UPA přednáška *Příprava dat* (Burgetová). Externí reference: Han, J., Kamber, M., Pei, J.: *Data Mining — Concepts and Techniques*, 3rd ed., Morgan Kaufmann 2012, kap. 3; Zendulka, J. et al.: *Získávání znalostí z databází — studijní opora*, FIT VUT 2009; Pyle, D.: *Data Preparation for Data Mining*, Morgan Kaufmann 1999; van der Loo, M., de Jonge, E.: *Statistical Data Cleaning with Applications in R*, Wiley 2018.*
