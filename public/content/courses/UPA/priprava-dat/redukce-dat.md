---
title: Redukce dat — PCA, výběr atributů, vzorkování
---

# Redukce dat — PCA, výběr atributů, vzorkování

V analytickém projektu často pracujeme s **vysoce-dimenzionálními** a **rozsáhlými** datasety. Redukce dimensionality a velikosti přináší: rychlejší modelování, lepší interpretovatelnost, menší riziko *přetrénování* (curse of dimensionality), menší paměťové nároky. Tři hlavní směry: **redukce dimenzionality** (PCA, SVD, autoencodery), **výběr atributů** (filter, wrapper, embedded methods), **vzorkování** (snížení počtu záznamů — random, stratified, adaptive).

## Curse of dimensionality

S rostoucím počtem dimenzí (atributů) klesá *hustota* dat. V D dimenzích pro `1000` bodů: každý bod "vidí" sousedy mnohem dál než v 2D. Důsledky:

* **k-NN** přestává fungovat (všechny vzdálenosti jsou si podobné).
* **Klasifikátory** přetrénovávají (mnoho parametrů, málo dat).
* **Vizualizace** je obtížná (víc než 3D nelze přímo zobrazit).
* **Výpočet** je drahý.

Tradiční pravidlo: pro k atributů potřebujete *exponenciálně* víc dat než pro k-1. Proto **redukce dimenzionality** je téměř vždy užitečná.

## Principal Component Analysis (PCA)

**PCA** je *lineární* metoda pro redukci dimenzionality. Hledá nové osy (*hlavní komponenty*), které **zachycují co nejvíce rozptylu** dat.

### Princip

1. Vyšetří se *kovariační matice* dat.
2. Spočítají se *vlastní vektory* (eigenvectors) a *vlastní čísla* (eigenvalues).
3. Vlastní vektory jsou *nové osy* (komponenty), seřazené podle vlastních čísel sestupně.
4. *Projekce* dat na prvních `k` komponent dává redukovanou reprezentaci.

### Algoritmus

```
Vstup: matice X (n × d), n objektů s d atributy
Výstup: matice Y (n × k), redukovaná na k dimenzí

1. Vystředit data:  X' = X - mean(X)
2. Spočítat kovarianční matici:  C = (1/(n-1)) X'ᵀ X'
3. Spočítat vlastní vektory a vlastní čísla matice C.
4. Seřadit vlastní vektory sestupně podle vlastních čísel.
5. Vybrat prvních k vlastních vektorů → matice E (d × k).
6. Projektovat:  Y = X' · E
```

::: viz pca-projection "Tahejte body — sledujte, jak se otáčí osy PC1/PC2 podle kovariance. Reziduály (oranžové) ukazují, co se ztratí při projekci na PC1."
:::

### Volba k

* **Explained variance ratio** — kolik % rozptylu zachycují prvních k komponent.
* Často se zvolí `k` tak, aby zachytilo `95 %` rozptylu.
* **Scree plot** — graf vlastních čísel; hledá se "loket" (elbow).

```python
from sklearn.decomposition import PCA
import numpy as np

pca = PCA(n_components=0.95)  -- 95% variance
X_reduced = pca.fit_transform(X)

print(f"Original: {X.shape[1]} dims")
print(f"Reduced:  {X_reduced.shape[1]} dims")
print(f"Variance explained: {pca.explained_variance_ratio_.cumsum()}")
```

### Vlastnosti

* **+** Rychlá, robustní, lineárně-algebraicky elegantní.
* **+** Decorrelace — komponenty jsou *ortogonální*.
* **+** Vhodná pro vizualizaci ve 2D/3D.
* **−** *Lineární* — nezachytí nelineární strukturu.
* **−** Komponenty jsou *lineární kombinace* všech původních atributů — *neinterpretovatelné* (komponenta 1 = 0.3·věk + 0.7·plat - 0.2·BMI).
* **−** Senzitivní na *měřítko* atributů — nutno *standardizovat* (z-score) před PCA.

## Další metody redukce dimenzionality

### SVD (Singular Value Decomposition)

Matematicky souvisí s PCA. Numericky stabilnější implementace.

### LDA (Linear Discriminant Analysis)

*Supervized* alternativa k PCA — využívá *informaci o třídě* k nalezení komponent, které **odlišují třídy**. Pro klasifikaci lepší než PCA.

### ICA (Independent Component Analysis)

Hledá *statisticky nezávislé* komponenty. Použití: blind source separation (oddělit zvuk hlasů, EEG kanály).

### t-SNE, UMAP — nelineární

* **t-SNE** (t-distributed Stochastic Neighbor Embedding) — pro vizualizaci ve 2D/3D. Zachová *lokální strukturu* (sousedi zůstávají sousedy). Pomalá, hyperparametr-citlivá.
* **UMAP** (Uniform Manifold Approximation and Projection) — rychlejší než t-SNE, zachová i globální strukturu. Dnes preferovaná pro vizualizaci high-dim dat.

### Autoencodery (neural networks)

Neural net trénovaný *rekonstruovat* vstup přes *úzkou* hidden vrstvu (bottleneck). Hidden activations = embedded reprezentace. Velmi flexibilní, lze i pro non-numerická data (image, text).

## Výběr atributů (feature selection)

Místo *transformace* (PCA) lze *vybrat podmnožinu* atributů. Výhoda: atributy zůstávají *interpretovatelné* — víme, který je důležitý.

### Cíl

Vybrat **minimální** podmnožinu atributů `S ⊆ A`, takže rozdělení pravděpodobnosti tříd pro dané hodnoty `S` je co nejbližší rozdělení pro *všechny* atributy `A`.

### Důsledky

* **Snížení časové náročnosti** — modely trénují rychleji.
* **Redukce počtu atributů** — snazší pochopení.
* **Menší overfitting** — méně parametrů.

### Tři kategorie metod

#### Filter methods

Hodnocení atributů *nezávisle* na modelu. Pre-processing krok.

* **Correlation** — odstranit atributy *vysoce korelované* s jinými (redundance).
* **Chi-squared test** — pro kategorické atributy, testuje nezávislost na cílové třídě.
* **Mutual information** — informační teorie, citlivá na nelineární závislosti.
* **Variance threshold** — vyhodit atributy s téměř nulovým rozptylem.

```python
from sklearn.feature_selection import SelectKBest, chi2, mutual_info_classif

selector = SelectKBest(score_func=chi2, k=20)
X_selected = selector.fit_transform(X, y)
```

#### Wrapper methods

Hodnocení podmnožiny atributů *podle výkonu konkrétního modelu*.

* **Forward selection** — start s prázdnou množinou, postupně přidávat atribut s nejvyšším zlepšením.
* **Backward elimination** — start s všemi, postupně odstraňovat nejméně důležitý.
* **Recursive feature elimination (RFE)** — trénovat model, odstranit nejméně důležitý feature (podle weights/importance), repeat.

Drahé výpočetně (O(N²) modelů), ale často lepší výsledky.

```python
from sklearn.feature_selection import RFE
from sklearn.ensemble import RandomForestClassifier

rfe = RFE(estimator=RandomForestClassifier(), n_features_to_select=20)
X_selected = rfe.fit_transform(X, y)
```

#### Embedded methods

Výběr atributů je *součástí trénování modelu*.

* **LASSO (L1 regularization)** — penalizuje váhy, váhy nepotřebných atributů jdou na 0.
* **Decision trees / Random Forest** — feature importance (Gini, information gain).
* **Tree-based gradient boosting** (XGBoost, LightGBM) — feature importance score.

```python
from sklearn.linear_model import Lasso
import numpy as np

lasso = Lasso(alpha=0.1)
lasso.fit(X, y)
selected = np.where(lasso.coef_ != 0)[0]
print(f"Selected: {len(selected)} of {X.shape[1]} features")
```

## Redukce počtu záznamů — vzorkování

Pro *very large* datasety (TB+) je užitečné trénovat na *vzorku*.

### Jednoduché náhodné vzorkování

Každý záznam s pravděpodobností `p`. Rychlé, ale může selhat při:
* **Nevyváženosti tříd** — minoritní třída se ztratí.
* **Stratifikované struktuře** — malé subpopulace se neproporcionálně reprezentují.

### Stratifikované vzorkování

Vzorkování *odděleně* v každé třídě tak, aby zůstaly proporce zachované.

```python
from sklearn.model_selection import train_test_split

X_train, _, y_train, _ = train_test_split(
    X, y, train_size=10000, stratify=y, random_state=42
)
```

### Cluster sampling

Rozdělit data do shluků (např. podle ZIP code), vybrat náhodně několik shluků a v nich *všechny* záznamy. Vhodné pro geo-distributed data.

### Reservoir sampling

Pro *streaming data* nebo unknown N — udržovat reservoir velikosti k, každý nový záznam má pravděpodobnost `k/n` nahradit existující.

### Adaptive sampling

Méně časté události vzorkujeme s vyšší pravděpodobností. Použití: fraud detection (oversample fraud transactions).

## Problém nevyváženosti dat

Vzorkování často naráží na **nevyvážené třídy** — pokud je minoritní třída pouze 1 %, prosté náhodné vzorkování ji téměř ztratí a klasifikátor naivně predikuje vždy majoritní (99 % accuracy, ale 0 % recall na minoritní). Strategie jako undersampling, oversampling, SMOTE, class weights a vhodné metriky (precision/recall, F1, PR-AUC) lze kombinovat se vzorkováním. Podrobné zpracování viz [[nevyvazenost]].

## Praktické tipy {tier=practice}

* **Vždy škálovat před PCA** — `StandardScaler`. Bez toho je PCA dominován atributy s velkým rozsahem.
* **Train/test split před resamplingem** — jinak leakage (test data jsou součástí trénování).
* **Validate s realistickou distribucí** — test set by měl reflektovat *produkční* class balance, ne uměle vyrovnaný.
* **Začněte jednoduše** — feature selection (filter), pak PCA, pak složitější.

Více o normalizaci a kódování viz [[normalizace-diskretizace]].

::: link "Pearson, K.: On Lines and Planes of Closest Fit to Systems of Points in Space (Philosophical Magazine 1901)" "https://www.tandfonline.com/doi/abs/10.1080/14786440109462720"
:::

::: link "Chawla, N. V. et al.: SMOTE — Synthetic Minority Over-sampling Technique (JAIR 2002)" "https://www.jair.org/index.php/jair/article/view/10302"
:::

::: link "Imbalanced-learn library" "https://imbalanced-learn.org/"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=FgakZw6K1QQ" "StatQuest: Principal Component Analysis (PCA), Step-by-Step" "StatQuest with Josh Starmer"
:::

*Zdroj: UPA přednáška *Příprava dat* (Burgetová). Externí reference: Han, J., Kamber, M., Pei, J.: *Data Mining*, 3rd ed., Morgan Kaufmann 2012, kap. 3; Chawla, N. V., Bowyer, K. W., Hall, L. O., Kegelmeyer, W. P.: *SMOTE — Synthetic Minority Over-sampling Technique*, JAIR 2002; Guo, X. et al.: *On the Class Imbalance Problem*, ICNC 2008; Pearson, K.: *On Lines and Planes of Closest Fit*, Philosophical Magazine 1901.*
