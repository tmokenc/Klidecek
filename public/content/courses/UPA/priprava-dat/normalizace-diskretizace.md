---
title: Normalizace, diskretizace a kódování kategorických atributů
---

# Normalizace, diskretizace a kódování kategorických atributů

Mnoho ML algoritmů má specifické *předpoklady o vstupních datech* — neuronové sítě a SVM očekávají *standardizované* numerické atributy v podobném rozsahu; rozhodovací stromy a Naive Bayes preferují *diskrétní* hodnoty; lineární modely vyžadují *number-encoded* kategorické atributy. Tato sekce navazuje na [[cisteni-dat]] a [[redukce-dat]] a zaměřuje se na **transformace hodnot** — normalizaci numerických atributů, diskretizaci spojitých hodnot, kódování kategorických atributů.

## Normalizace (škálování)

**Normalizace** transformuje numerické atributy do *společného rozsahu*. Motivace:

* **Algoritmy citlivé na měřítko** — k-NN, SVM, neural nets, PCA, gradient descent. Bez normalizace atribut s velkým rozsahem (plat 0–100 000) dominuje atribut s malým (věk 0–100).
* **Konvergence trénování** — gradient descent konverguje rychleji u standardizovaných dat.
* **Regularizace** — L1/L2 penalizace váhy stejně bez ohledu na atribut.

### Min-Max normalizace

Lineární škálování do `[new_min, new_max]`:

$$ v' = \frac{v - \min_A}{\max_A - \min_A} \cdot (\text{new\_max}_A - \text{new\_min}_A) + \text{new\_min}_A $$

Pro `[0, 1]`:
$$ v' = \frac{v - \min_A}{\max_A - \min_A} $$

Příklad: plat 12 000 Kč až 98 000 Kč, normalizovat na `[0.0, 1.0]`:
$$ \frac{73600 - 12000}{98000 - 12000} = 0.716 $$

* **+** Garantuje pevný rozsah.
* **−** *Velmi citlivé* na outliery — jediná extrémní hodnota zhušťuje ostatní k nule.

```python
from sklearn.preprocessing import MinMaxScaler

scaler = MinMaxScaler(feature_range=(0, 1))
X_scaled = scaler.fit_transform(X)
```

### Z-score standardizace

Posunutí na nulový průměr a jednotkový rozptyl:

$$ v' = \frac{v - \mu_A}{\sigma_A} $$

Příklad: `μ = 54 000 Kč`, `σ = 16 000 Kč`. Hodnota 73 600 Kč:
$$ \frac{73600 - 54000}{16000} = 1.225 $$

* **+** Méně citlivá na outliery než min-max (ale stále ovlivněna v `μ` a `σ`).
* **+** Vhodná pro Gaussian-like distribuce a pro modely předpokládající *standardní normální* distribuci.
* **−** Nelze garantovat pevný rozsah.

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

### Decimal scaling

Posun desetinné čárky:
$$ v' = v / 10^j \text{, kde } j = \lceil \log_{10}(\max |v|) \rceil $$

Příklad: hodnoty od -986 do 917 → dělit 10³ → rozsah `[-0.986, 0.917]`.

Užitečné pro implementaci v embedded zařízeních (fixed-point arithmetic).

### Robust scaling

Místo `μ` a `σ` použít *medián* a *IQR*:

$$ v' = \frac{v - \text{median}_A}{IQR_A} $$

Odolné vůči outlierům.

```python
from sklearn.preprocessing import RobustScaler

scaler = RobustScaler()
X_scaled = scaler.fit_transform(X)
```

### Kvantilová normalizace

Pokročilá technika z biostatistiky (DNA microarrays). Mapuje empirické kvantily na *referenční rozložení* (uniformní nebo normální).

```python
from sklearn.preprocessing import QuantileTransformer

qt = QuantileTransformer(output_distribution='normal')
X_norm = qt.fit_transform(X)
```

Pro každou hodnotu se najde její *kvantilová pozice*, ta se mapuje na příslušný kvantil cílového rozložení. Eliminuje vliv distribuce — výstup je vždy *normální* (nebo uniformní).

### Log transformace

Pro pravostranně-šikmé distribuce (platy, ceny nemovitostí):

$$ v' = \log(v + 1) $$

`+1` zabrání problému s `log(0)`. Po log transformaci je distribuce typicky více *normální* — vhodné pro lineární modely.

## Které normalizace kdy

| Algoritmus | Doporučení |
| :--- | :--- |
| **k-NN, k-Means** | StandardScaler nebo MinMaxScaler |
| **SVM (RBF kernel)** | StandardScaler |
| **Neural networks** | StandardScaler (s tanh) nebo MinMaxScaler (s sigmoid) |
| **PCA** | StandardScaler (bez něj atributy s velkým rozsahem dominují) |
| **Lineární regrese** | StandardScaler pro interpretaci, ne nutně pro funkci |
| **Tree-based (RF, XGBoost)** | normalizace **nepotřebná** — split podle pořadí hodnot |
| **Naive Bayes** | obvykle netřeba |
| **Pravostranně šikmá** | Log → StandardScaler |

::: viz scaler-comparator "Stejná distribuce čtyřmi škálovači (MinMax, Z-score, robust, log+Z). Pravostranný ocas a outlier komprimují MinMax k nule; robust IQR-based je odolný."
:::

## Diskretizace

**Diskretizace** převádí *spojitý* atribut na *kategorický* (intervaly s návěštím). Důvody:

* **Algoritmy vyžadující kategorické vstupy** — Naive Bayes pro kategorické, rozhodovací stromy s diskrétními splity.
* **Redukce dat** — méně unikátních hodnot.
* **Příprava pro asociační analýzu** — `vek = "mladý"` místo přesných čísel.
* **Robustnost vůči šumu** — drobné kolísání hodnot nemění interval.

### Přístupy

* **Bez učitele** — používá jen vstupní hodnoty (equal-width, equal-frequency binning).
* **S učitelem** — využívá *informaci o cílové třídě* (entropy-based, ChiMerge).
* **Shora-dolů** — start s celou doménou, postupně rozdělovat.
* **Zdola-nahoru** — start s jemnými intervaly, postupně slučovat.

### Equal-width binning

Rozdělit `[A, B]` na `N` intervalů stejné šířky:
$$ w = (B - A) / N $$

Jednoduché, ale outliery dominují.

### Equal-frequency (equi-depth) binning

`N` intervalů s ≈ stejným počtem hodnot. Robustnější vůči distribuci.

```python
import pandas as pd

# Equal-width
df['age_bin'] = pd.cut(df['age'], bins=5, labels=['<20', '20-40', '40-60', '60-80', '80+'])

# Equal-frequency
df['salary_bin'] = pd.qcut(df['salary'], q=5, labels=['low', 'mid-low', 'mid', 'mid-high', 'high'])
```

### Entropy-based (supervised)

Pro každou možnou hranici rozdělení vypočítat *information gain*:

$$ IG(A, threshold) = H(class) - H(class | split) $$

Vybrat threshold s maximálním IG. Rekurzivně rozdělovat. Algoritmus: **MDLP** (Fayyad-Irani 1993).

### ChiMerge (bottom-up supervised)

Start s každou unikátní hodnotou jako vlastním intervalem. Iterativně sloučit *sousední* intervaly, pokud χ² test ukáže, že jsou *podobně rozloženy* tříd.

### Cluster-based

Použít k-means nebo hierarchické shlukování na hodnoty atributu. Centroid = hranice intervalů.

### Manuální podle domény

Nejlepší výsledky často přináší *expertní* diskretizace:
* Věk: `0-17 (juvenile), 18-64 (working), 65+ (retired)`.
* BMI: `<18.5 (underweight), 18.5-24.9 (normal), 25-29.9 (overweight), 30+ (obese)`.
* Známky: `A-F`.

## Kódování kategorických atributů

Mnoho algoritmů (SVM, neural nets, KNN) pracuje *jen s čísly*. Kategorické atributy nutno *kódovat*.

### Label encoding (Ordinal encoding)

Mapování string → integer:
```
{"low": 0, "medium": 1, "high": 2}
```

Vhodné jen pro **ordinální** atributy (s přirozeným pořadím). Pro nominální atributy (barvy) zavádí *umělé* pořadí — `"red"=0, "blue"=1, "green"=2` implikuje, že green je 2× dál od red než blue, což není pravda.

```python
from sklearn.preprocessing import OrdinalEncoder

encoder = OrdinalEncoder(categories=[['low', 'medium', 'high']])
X_encoded = encoder.fit_transform(X[['level']])
```

### One-hot encoding (dummy variables)

Pro každou unikátní hodnotu vytvořit *binární sloupec*:

```
Color       red   blue   green
red    →     1     0      0
blue   →     0     1      0
green  →     0     0      1
```

* **+** Žádné umělé pořadí.
* **−** *Nárůst dimenzí* — N kategorií → N sloupců.
* **−** Sparse data — většina sloupců nula.

```python
from sklearn.preprocessing import OneHotEncoder

encoder = OneHotEncoder(sparse_output=False)
X_encoded = encoder.fit_transform(X[['color']])

# pandas
pd.get_dummies(df['color'])
```

**Dummy trap** — pro lineární regresi vyhodit jeden sloupec (kolineární s ostatními, jinak singular matrix). `drop='first'` parameter v sklearn.

### Binary encoding

Místo `N` sloupců použít `log₂(N)`:

```
Color (8 unique) → 3 binary cols
red     → 001
blue    → 010
green   → 011
yellow  → 100
...
```

* **+** Méně dimenzí než one-hot.
* **−** Ztracená informace (kombinace bitů jsou *překryty*).

### Hashed encoding

`N` kategorií mapovat na `M < N` sloupců přes hash:
$$ col_j = hash(value) \mod M $$

* **+** Pevný počet sloupců nezávisle na |kategorií|.
* **+** Konstantní paměť, vhodné pro streaming.
* **−** *Kolize* — různé hodnoty se mapují na stejný sloupec, ztráta informace.

```python
from sklearn.feature_extraction import FeatureHasher

hasher = FeatureHasher(n_features=20, input_type='string')
X_hashed = hasher.transform([['Brno'], ['Praha'], ['Olomouc']])
```

### Target encoding

Nahradit kategorii *průměrem cílové proměnné* v této kategorii:

```
City     Avg(salary)
Brno     45000
Praha    60000
Olomouc  40000
```

* **+** Žádný nárůst dimenzí.
* **+** Atribut nese informaci o vztahu k cíli.
* **−** *Riziko leakage* — kategorie vidí svůj label. Použít cross-validated target encoding.
* **−** Pro rare categories — vážený průměr s globálním průměrem (smoothing).

```python
from category_encoders import TargetEncoder

encoder = TargetEncoder()
X_encoded = encoder.fit_transform(X['city'], y)
```

### Frequency encoding

Nahradit kategorii *frekvencí* v datasetu:

```
City      Frequency
Brno      0.30   (30 % záznamů)
Praha     0.50
Olomouc   0.20
```

Užitečné pokud frekvence kategorie nese informaci.

### Embeddings (neural networks)

Pro very high-cardinality kategorie (uživatelské ID, slova, produkty) — naučená *vektorová* reprezentace v neuronové síti. Word2Vec, GloVe pro slova, NN embeddings pro libovolné kategorie.

## Redukce počtu kategorií

Pro atributy s desítkami/stovkami kategorií:

* **Top-N + ostatní** — nechat `N` nejčastějších, ostatní sloučit do `"other"`.
* **Generování hierarchií** — specifikace částečného uspořádání:
  * `Adresa: ulice < město < kraj < stát`
  * `Brno → Jihomoravský kraj → Česko`
* **Manuální zařazení** — expert grupuje (`Mac` + `iPhone` → `Apple`).
* **Automatické odvození** — concept hierarchies z datových rozsahů.

## Praktický workflow

```python
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

numeric_features = ['age', 'salary']
categorical_features = ['city', 'department']

numeric_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='constant', fill_value='unknown')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer([
    ('num', numeric_transformer, numeric_features),
    ('cat', categorical_transformer, categorical_features)
])

# Pipeline kombinuje preprocessing s modelem
from sklearn.linear_model import LogisticRegression

pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', LogisticRegression())
])

pipeline.fit(X_train, y_train)
predictions = pipeline.predict(X_test)
```

`Pipeline` zaručuje:
* Stejná transformace na train i test.
* Žádný leakage (parameters fit jen na train).
* Snadná serializace pro deployment.

## Praktické tipy

* **Fit jen na train** — fit_transform na train, transform na test. Bez toho leakage.
* **Pipeline objekty** — kombinujte preprocessing s modelem, snazší údržba a deploy.
* **Custom transformers** — pro doménově-specifické transformace (`scikit-learn` BaseEstimator + TransformerMixin).
* **Dokumentujte volby** — proč StandardScaler vs MinMax? Proč diskretizace? Choice je business + experiment.

## Antipatterns

* **Normalizace přes train+test** — způsobuje leakage; parametry musí být fit jen na train.
* **OneHot encoder bez `handle_unknown`** — selže na neviděné kategorii v produkci.
* **Label encoding pro nominální data** — implies false ordering.
* **Diskretizace bez doménového odůvodnění** — ztráta informace bez zisku.

::: link "scikit-learn — Preprocessing data" "https://scikit-learn.org/stable/modules/preprocessing.html"
:::

::: link "category_encoders library" "https://contrib.scikit-learn.org/category_encoders/"
:::

::: link "Fayyad, U. M., Irani, K. B.: Multi-Interval Discretization of Continuous-Valued Attributes (IJCAI 1993)" "https://www.aaai.org/Papers/IJCAI/1993/IJCAI93-258.pdf"
:::

---

*Zdroj: UPA přednáška *Příprava dat* (Burgetová). Externí reference: Han, J., Kamber, M., Pei, J.: *Data Mining*, 3rd ed., Morgan Kaufmann 2012, kap. 3; Fayyad, U. M., Irani, K. B.: *Multi-Interval Discretization of Continuous-Valued Attributes*, IJCAI 1993; Pyle, D.: *Data Preparation for Data Mining*, Morgan Kaufmann 1999; scikit-learn documentation.*
