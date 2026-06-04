---
title: Hodnocení kvality klasifikace
---

# Hodnocení kvality klasifikace

Model natrénovaný v [[klasifikace-vs-predikce]] musíme *kvantitativně* posoudit — a vždy na datech, na kterých se **neučil**. Pro klasifikaci se vychází z **matice záměn (confusion matrix)**, která pro dvě třídy (pozitivní / negativní) sečte čtyři druhy výsledků:

- **TP** (true positive) — pozitivní správně označený jako pozitivní,
- **FP** (false positive) — negativní chybně označený jako pozitivní,
- **FN** (false negative) — pozitivní chybně označený jako negativní,
- **TN** (true negative) — negativní správně označený jako negativní.

## Základní metriky

::: math
\text{accuracy} = \frac{TP+TN}{TP+TN+FP+FN}, \quad
\text{precision} = \frac{TP}{TP+FP}, \quad
\text{recall} = \frac{TP}{TP+FN}
:::

- **Accuracy (přesnost správnosti)** — podíl správně klasifikovaných. Zavádějící u *nevyvážených* tříd: model označující vše jako majoritní třídu má vysokou accuracy, ale je bezcenný.
- **Precision** — kolik z *označených* pozitivních je skutečně pozitivních (cena falešného poplachu).
- **Recall / senzitivita / TPR** — kolik *skutečných* pozitivních model zachytil (cena přehlédnutí).
- **F1** — harmonický průměr precision a recall, jedno číslo pro kompromis: $F_1 = 2\cdot\frac{\text{prec}\cdot\text{rec}}{\text{prec}+\text{rec}}$.

Precision a recall jsou v *protisměru*: klasifikátory typicky vracejí *skóre*, a posunem **prahu** se vyměňuje jedno za druhé.

## ROC křivka

**ROC (receiver operating characteristic)** zobrazí dvojici **TPR** (recall) vs. **FPR** $= \frac{FP}{FP+TN}$ pro *všechny* hodnoty prahu. Body blízko levého horního rohu jsou nejlepší; diagonála = náhodné hádání. Souhrnnou kvalitou nezávislou na prahu je **AUC** (plocha pod křivkou): 1,0 = ideální, 0,5 = náhoda.

::: viz pbi-roc "Posuň práh nad skóre dvou tříd: vlevo živě roste/klesá matice záměn (TP/FP/FN/TN), vpravo se po ROC křivce posouvá pracovní bod. Pod grafem se přepočítává accuracy, precision a recall — sleduj protisměr precision vs. recall."
:::

## Spolehlivý odhad: křížová validace

Jediné rozdělení train/test dává odhad závislý na náhodě dělení. **k-násobná křížová validace (k-fold cross-validation)** data rozdělí na $k$ stejných částí; postupně se vždy *jedna* část použije jako testovací a zbylých $k-1$ jako trénovací. Výsledek je **průměr** $k$ měření — robustnější odhad s menším rozptylem, využije všechna data. Speciální případ $k = n$ je *leave-one-out*. Pro nevyvážené třídy se používá *stratifikovaná* varianta (zachová poměr tříd v každém foldu).

::: quiz "Proč může být accuracy zavádějící metrika?"
- [x] U nevyvážených tříd dosáhne triviální model vysoké accuracy, aniž by zachytil minoritní třídu
  > Proto se přidává precision, recall, F1 a ROC/AUC.
- [ ] Accuracy nelze spočítat z matice záměn
  > Lze: (TP+TN) / (všechny vzorky).
- [ ] Accuracy se měří jen na trénovací sadě
  > Měla by se měřit na oddělené testovací sadě nebo křížovou validací.
- [ ] Accuracy je totéž co recall
  > Recall = TP/(TP+FN); accuracy zahrnuje i TN a všechny vzorky.
:::

::: link "Han, Kamber, Pei — Data Mining (kap. Model Evaluation and Selection)" "https://eecs.csuohio.edu/~sschung/CIS660/Data%20MiningJHan_Chapter8_Classification.pdf"
:::

::: link "Fawcett — An Introduction to ROC Analysis" "https://doi.org/10.1016/j.patrec.2005.10.010"
:::

---

*Zdroj: PBI státnicové okruhy NBIO, VUT FIT. Externí reference: J. Han, M. Kamber, J. Pei — Data Mining: Concepts and Techniques, kap. 8 „Model Evaluation and Selection"; T. Fawcett — „An Introduction to ROC Analysis" (Pattern Recognition Letters, 2006, DOI 10.1016/j.patrec.2005.10.010).*
