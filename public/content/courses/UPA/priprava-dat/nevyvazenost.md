---
title: Nevyváženost dat a SMOTE
---

# Nevyváženost dat a SMOTE

V mnoha klasifikačních úlohách je rozdělení tříd **velmi nevyvážené** — jedna třída zastoupena 99 %, druhá 1 %. Klasifikační algoritmy předpokládají vyváženost a v takovém případě selhávají — naivně predikují vždy majoritní třídu, dosahují vysoké *accuracy*, ale *recall* na minoritní (často zajímavé) třídě je 0. Tato sekce navazuje na [[redukce-dat]] a zaměřuje se hlouběji na *problém nevyváženosti* — důvody, detekci, **SMOTE** algoritmus a další strategie.

## Příklady nevyvážených dat

* **Detekce podvodů** — < 1 % bankovních transakcí podvodné, < 0.1 % na pojišťovnách.
* **Detekce vetřelců** — < 0.01 % síťových paketů škodlivých.
* **Vzácné nemoci** — < 0.1 % populace má danou diagnózu.
* **Defekty v výrobě** — < 0.5 % produktů vadných.
* **Click-through-rate (CTR)** — < 1 % reklam je klikáno.

V těchto případech je **minoritní třída** ta, na které nám záleží.

## Proč naivní algoritmy selhávají

Pokud je `99 %` třída A a `1 %` třída B:

* Trivial klasifikátor "vždy A" má accuracy `99 %` — vypadá výborně.
* Recall na třídě B: 0 % — *žádný* True Positive.
* Confusion matrix:

```
              Predicted A   Predicted B
Actual A         9900            0
Actual B          100            0
```

Loss function (cross-entropy) má *malý gradient* pro minoritní třídu — model jí "nevěnuje pozornost".

## Strategie řešení

### 1. Úprava distribuce dat

Cílem je *uměle* dosáhnout vyváženějšího datasetu *před* trénováním.

#### Undersampling

Náhodný výběr podmnožiny majoritní třídy, aby měla stejný počet jako minoritní.

```
Před:  99000 A  +  1000 B
Po:     1000 A  +  1000 B
```

* **+** Rychlejší trénování (méně dat).
* **+** Vyrovnaný dataset.
* **−** *Ztracena informace* — z 99 % majoritní data jsme vyhodili 99 % majoritní.
* **−** Stochastický výsledek — různé samples → různé modely.

**Heuristické metody** (NearMiss, Tomek links) — vybírají *informativně* — odstraňují majoritní záznamy v okolí hranice (těžké klasifikovat) nebo v okolí minoritních (potenciální confusion).

#### Oversampling

Náhodné duplikování minoritní třídy.

```
Před:  99000 A  +  1000 B
Po:    99000 A  + 99000 B  (každý minoritní bod kopírován 99×)
```

* **+** Nepřichází o data.
* **−** *Overfitting* — model memorizuje duplikovaná data.
* **−** Pomalejší trénování (víc dat).

### 2. SMOTE — Synthetic Minority Over-sampling Technique

**SMOTE** (Chawla et al. 2002) je *chytrý oversampling* — generuje *syntetické* (umělé) body minoritní třídy interpolací mezi existujícími.

#### Algoritmus

```
PRO KAŽDOU instanci c̄ minoritní třídy:
  Najdi K nejbližších sousedů c̄ (taky minoritní třídy)
  Náhodně vyber jednoho z nich, k̄
  Vygeneruj nový bod n̄:
    n̄ = c̄ + (k̄ - c̄) · rand(0, 1)
```

Bod `n̄` leží na *úsečce* mezi `c̄` a `k̄`, v náhodné pozici. Je to "věrohodná" minoritní instance — *interpolace* mezi dvěma skutečnými.

::: svg "SMOTE princip: pro každý minoritní bod (modrý ○) najít K=2 nejbližších sousedů (modré ○), vygenerovat syntetický bod (zelený ●) na úsečce s náhodnou pozicí."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <text x="60" y="25" fill="var(--text)" font-weight="600">Před SMOTE</text>
    <g fill="#c84">
      <circle cx="40" cy="50" r="3"/>
      <circle cx="55" cy="65" r="3"/>
      <circle cx="35" cy="80" r="3"/>
      <circle cx="50" cy="100" r="3"/>
      <circle cx="65" cy="115" r="3"/>
      <circle cx="80" cy="130" r="3"/>
      <circle cx="100" cy="150" r="3"/>
      <circle cx="120" cy="55" r="3"/>
      <circle cx="135" cy="90" r="3"/>
      <circle cx="160" cy="125" r="3"/>
      <circle cx="180" cy="155" r="3"/>
      <circle cx="180" cy="60" r="3"/>
      <circle cx="200" cy="100" r="3"/>
    </g>
    <g fill="#69c">
      <circle cx="100" cy="80" r="4"/>
      <circle cx="130" cy="110" r="4"/>
      <circle cx="155" cy="65" r="4"/>
    </g>
    <text x="60" y="180" fill="var(--text-muted)" font-size="10">13 majoritních + 3 minoritní</text>
  </g>
  <g>
    <text x="380" y="25" fill="var(--text)" font-weight="600">Po SMOTE</text>
    <g fill="#c84">
      <circle cx="350" cy="50" r="3"/>
      <circle cx="365" cy="65" r="3"/>
      <circle cx="345" cy="80" r="3"/>
      <circle cx="360" cy="100" r="3"/>
      <circle cx="375" cy="115" r="3"/>
      <circle cx="390" cy="130" r="3"/>
      <circle cx="410" cy="150" r="3"/>
      <circle cx="430" cy="55" r="3"/>
      <circle cx="445" cy="90" r="3"/>
      <circle cx="470" cy="125" r="3"/>
      <circle cx="490" cy="155" r="3"/>
      <circle cx="490" cy="60" r="3"/>
      <circle cx="510" cy="100" r="3"/>
    </g>
    <g fill="#69c">
      <circle cx="410" cy="80" r="4"/>
      <circle cx="440" cy="110" r="4"/>
      <circle cx="465" cy="65" r="4"/>
    </g>
    <g fill="#3a9">
      <circle cx="420" cy="90" r="3.5"/>
      <circle cx="425" cy="100" r="3.5"/>
      <circle cx="430" cy="85" r="3.5"/>
      <circle cx="435" cy="75" r="3.5"/>
      <circle cx="450" cy="100" r="3.5"/>
      <circle cx="440" cy="75" r="3.5"/>
      <circle cx="455" cy="80" r="3.5"/>
    </g>
    <line x1="410" y1="80" x2="440" y2="110" stroke="var(--text-muted)" stroke-dasharray="2 2" opacity="0.4"/>
    <line x1="410" y1="80" x2="465" y2="65" stroke="var(--text-muted)" stroke-dasharray="2 2" opacity="0.4"/>
    <line x1="440" y1="110" x2="465" y2="65" stroke="var(--text-muted)" stroke-dasharray="2 2" opacity="0.4"/>
    <text x="395" y="180" fill="var(--text-muted)" font-size="10">+ 7 syntetických (zelené)</text>
  </g>
</svg>
:::

#### SMOTE varianty

* **Borderline-SMOTE** — generuje syntetické body jen v *blízkosti hranice* mezi třídami (kde je modelování obtížné).
* **ADASYN** (Adaptive Synthetic) — víc syntetiky pro *obtížné* (mizerně klasifikované) instance.
* **SMOTE-NC** (Nominal-Continuous) — pro směs numerických a kategorických atributů.
* **SVM-SMOTE** — kombinace s SVM pro lepší výběr seed bodů.

```python
from imblearn.over_sampling import SMOTE, BorderlineSMOTE, ADASYN

# Klasický SMOTE
smote = SMOTE(random_state=42, k_neighbors=5)
X_res, y_res = smote.fit_resample(X, y)

# Borderline SMOTE
bsmote = BorderlineSMOTE(random_state=42)
X_res, y_res = bsmote.fit_resample(X, y)

# ADASYN
adasyn = ADASYN(random_state=42)
X_res, y_res = adasyn.fit_resample(X, y)
```

#### Kombinované techniky

* **SMOTE + Tomek Links** — SMOTE oversampling + odstranění Tomek links (páry blízkých bodů různých tříd).
* **SMOTE + ENN** (Edited Nearest Neighbours) — SMOTE + odstranění majoritních bodů, jejichž sousedi jsou většinou minoritní.

### 3. Úpravy klasifikátoru

#### Class weights

V loss function penalizovat chyby na minoritní třídě více:

```python
from sklearn.ensemble import RandomForestClassifier

# Automaticky vypočítané váhy
clf = RandomForestClassifier(class_weight='balanced')

# Manuální
clf = RandomForestClassifier(class_weight={0: 1, 1: 99})
```

`balanced` automatically computes weights inversely proportional to class frequencies.

#### Threshold tuning

Pro binární klasifikaci s pravděpodobnostním výstupem (`predict_proba`):

```python
import numpy as np

probs = clf.predict_proba(X_test)[:, 1]   # pravděpodobnost minoritní

# Default threshold 0.5
pred_default = (probs >= 0.5).astype(int)

# Posun thresholdu pro vyšší recall
pred_low = (probs >= 0.2).astype(int)   # snadnější predikovat minoritní
```

Volba thresholdu závisí na *business cost* — kolik stojí False Positive (alarm na normální transakci) vs. False Negative (propuštěný podvod).

#### Cost-sensitive learning

Definovat *matici nákladů* pro každou kombinaci `(true, predicted)`:

```
              Pred=A    Pred=B
True=A          0        10    (false positive cost)
True=B        1000        0    (false negative cost)
```

Klasifikátor minimalizuje *expected cost*, ne accuracy.

### 4. Sestava klasifikátorů (ensemble)

* **BalancedBaggingClassifier** — bagging, kde každý base classifier trénovaný na *undersampled* bootstrap.
* **EasyEnsemble** — sestava AdaBoost klasifikátorů, každý na jiném undersample.
* **BalancedRandomForestClassifier** — RandomForest s balanced sampling per tree.

```python
from imblearn.ensemble import BalancedRandomForestClassifier

brf = BalancedRandomForestClassifier(n_estimators=100, random_state=42)
brf.fit(X, y)
```

## Hodnocení modelu — co měřit

**Accuracy** je *zavádějící* pro nevyvážená data. Místo ní:

### Confusion matrix

```
              Predicted A   Predicted B
Actual A         TN           FP
Actual B         FN           TP        ← záleží na třídě B (minoritní)
```

### Precision, Recall, F1

* **Precision** = `TP / (TP + FP)` — kolik z predikovaných B je skutečně B.
* **Recall** (Sensitivity) = `TP / (TP + FN)` — kolik skutečných B jsme zachytili.
* **Specificity** = `TN / (TN + FP)` — kolik skutečných A jsme správně označili.
* **F1** = `2 · Prec · Rec / (Prec + Rec)` — harmonický průměr.

### ROC curve a AUC

ROC = Receiver Operating Characteristic. Graf FPR (False Positive Rate) vs. TPR (True Positive Rate) pro různé thresholdy. **AUC** = Area Under ROC Curve. AUC = 1 = perfektní klasifikátor, AUC = 0.5 = náhoda.

### Precision-Recall curve a PR-AUC

Graf Precision vs. Recall. Pro *vysoce nevyvážené* data je PR-AUC informativnější než ROC-AUC.

```python
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.metrics import roc_auc_score, precision_recall_curve

y_pred = clf.predict(X_test)
y_proba = clf.predict_proba(X_test)[:, 1]

print(classification_report(y_test, y_pred))
print(f"ROC AUC: {roc_auc_score(y_test, y_proba):.3f}")
```

### Sample classification report

```
              precision    recall  f1-score   support

           A       0.99      0.99      0.99      9900
           B       0.65      0.45      0.53       100

    accuracy                           0.99     10000
   macro avg       0.82      0.72      0.76     10000
weighted avg       0.98      0.99      0.98     10000
```

Accuracy 99 %, ale F1 na třídě B jen 0.53 — model špatně detekuje minoritní třídu.

::: viz smote-and-threshold-tuning "SMOTE generuje syntetické body interpolací mezi minority instancí a jejím náhodným k-NN. Posuvník threshold ukáže live precision/recall a confusion matrix."
:::

## Praktické tipy {tier=practice}

* **Diagnostikujte první** — zjistěte distribuci tříd před trénováním.
* **Stratifikované splity** — `train_test_split(stratify=y)` zachová class balance.
* **Resampling jen na train** — never na test (zkresluje hodnocení).
* **Test set reflectuje produkční distribuci** — model bude nasazen na nevyvážená data, hodnoťte na nich.
* **Více strategií** — zkombinujte SMOTE + class weights + threshold tuning, neexistuje jeden recept.
* **Doménové znalosti** — co je acceptable false positive rate? Některé domény (medicína) preferují vysoký recall za cenu FP.

## Kdy nevyváženost není problém

* **Pravděpodobnostní výstup** — pokud potřebujete jen probability score (ranking), threshold tuning vyřeší vše.
* **Dostatek dat** — pokud minoritní třída má *desetitisíce* záznamů, model se ji naučí i bez resamplingu.
* **Hluboké NN s vhodnou loss function** — focal loss (Lin et al. 2017) řeší class imbalance přímo v loss.

## Knihovny

* **imbalanced-learn** — Python knihovna kompatibilní s scikit-learn. SMOTE, ADASYN, BalancedRandomForest, ...
* **xgboost** — `scale_pos_weight` parameter pro nevyvážené binární klasifikace.
* **lightgbm** — `is_unbalance` nebo `scale_pos_weight`.

::: link "Chawla, N. V. et al.: SMOTE — Synthetic Minority Over-sampling Technique (JAIR 2002)" "https://www.jair.org/index.php/jair/article/view/10302"
:::

::: link "imbalanced-learn documentation" "https://imbalanced-learn.org/stable/"
:::

::: link "He, H., Garcia, E. A.: Learning from Imbalanced Data (IEEE TKDE 2009)" "https://ieeexplore.ieee.org/document/5128907"
:::

---

*Zdroj: UPA přednáška *Příprava dat* (Burgetová). Externí reference: Chawla, N. V., Bowyer, K. W., Hall, L. O., Kegelmeyer, W. P.: *SMOTE — Synthetic Minority Over-sampling Technique*, JAIR 16, 2002; He, H., Garcia, E. A.: *Learning from Imbalanced Data*, IEEE TKDE 21(9), 2009; Lin, T. Y. et al.: *Focal Loss for Dense Object Detection*, ICCV 2017; Guo, X. et al.: *On the Class Imbalance Problem*, ICNC 2008.*
