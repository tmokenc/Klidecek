---
title: Klasifikátory (strom, Bayes, NN, regrese)
---

# Klasifikátory a regresní modely

Navazujeme na princip a fáze z [[klasifikace-vs-predikce]]: zde jsou konkrétní modely, kterými se funkce $f(\mathbf{x})$ realizuje. Liší se *tvarem* rozhodovací hranice, interpretovatelností a předpoklady o datech.

## Rozhodovací strom

**Rozhodovací strom** klasifikuje sérií **testů na jeden atribut** ve vnitřních uzlech; každá větev odpovídá výsledku testu a **list** nese predikovanou třídu. Klasifikace nového objektu = průchod od kořene k listu. Strom se staví **shora dolů, hladově, rozděl-a-panuj**: v každém uzlu se vybere atribut a práh, které *nejlépe rozdělí* trénovací data podle třídy.

„Nejlépe" se měří **mírou nečistoty (impurity)**. Dva kanonické výběry atributu:

- **Informační zisk** (ID3 / C4.5) — pokles *entropie* po rozdělení. Pro množinu $D$ s podíly tříd $p_i$:

::: math
H(D) = -\sum_{i} p_i \log_2 p_i, \qquad
\mathrm{Gain}(D,A) = H(D) - \sum_{v} \frac{|D_v|}{|D|}\, H(D_v)
:::

- **Giniho index** (CART) — pravděpodobnost chybného zařazení náhodného prvku:

::: math
\mathrm{Gini}(D) = 1 - \sum_{i} p_i^{2}
:::

Vybere se atribut s **největším ziskem** (resp. největším poklesem Gini). Osově zarovnané řezy postupně dělí prostor příznaků na obdélníkové oblasti; čistá oblast se stává listem. Strom je *interpretovatelný* (čitelná pravidla), ale náchylný k *přeučení* — řeší se *prořezáváním (pruning)*.

::: viz pbi-decision-tree "Krokuj předem danou ukázkovou posloupnost řezů: 'další řez →' přidá osově zarovnané dělení, vlevo se 2D dataset dělí na čisté oblasti, vpravo roste odpovídající strom. Pozor: jde o XOR/šachovnicový dataset, kde žádný jediný kořenový řez nečistotu skoro nesníží — kořen x<4.5 má proto téměř nulový zisk (≈ 0,03 bit), přesto vede k čistým potomkům. To ilustruje *krátkozrakost hladového dělení*: lokálně nepatrný řez může být nutný krok k dokonalému stromu. Oba dětské řezy už jsou lokálně nejlepší (max. zisk ve své polovině). Čtená hodnota ukazuje info. zisk daného řezu."
:::

## Naivní bayesovský klasifikátor

Vychází z **Bayesovy věty** — posteriorní pravděpodobnost třídy $C$ při daných příznacích $\mathbf{x}$:

::: math
P(C \mid \mathbf{x}) = \frac{P(\mathbf{x} \mid C)\, P(C)}{P(\mathbf{x})}
:::

Objekt se zařadí do třídy s **největší posteriorní pravděpodobností** (MAP). „Naivní" je proto, že předpokládá **podmíněnou nezávislost** příznaků v rámci třídy, takže sdružená věrohodnost je *součin* po jednotlivých atributech:

::: math
P(\mathbf{x}\mid C) = \prod_{k} P(x_k \mid C)
:::

Tento předpoklad v praxi téměř nikdy přesně neplatí, přesto klasifikátor funguje překvapivě dobře, je rychlý a zvládá vysokou dimenzi (text, sekvenční data). Nulové četnosti se ošetřují *vyhlazením (Laplace)*.

## Neuronová síť

**Vícevrstvá neuronová síť (MLP)** skládá vrstvy neuronů; každý neuron počítá vážený součet vstupů plus práh a aplikuje **nelineární aktivaci** $\sigma$ (např. ReLU, sigmoid):

::: math
a = \sigma\!\Big(\sum_{j} w_j x_j + b\Big)
:::

Skrytými vrstvami vznikne *nelineární* rozhodovací hranice libovolného tvaru. Váhy se učí **zpětným šířením chyby (backpropagation)** a **gradientním sestupem** — minimalizací ztrátové funkce. Výstupní vrstva se *softmaxem* dává rozdělení pravděpodobnosti přes třídy (klasifikace), případně lineárním výstupem spojitou hodnotu (regrese). Silná na složitá data, ale málo interpretovatelná a náročná na množství dat.

## Lineární a nelineární regrese

Regrese předpovídá *spojitou* hodnotu (viz [[klasifikace-vs-predikce]]).

- **Lineární regrese** prokládá data lineární funkcí $\hat{y} = w_0 + \sum_k w_k x_k$; parametry se odhadují **metodou nejmenších čtverců** (minimalizace součtu kvadrátů reziduí).
- **Nelineární regrese** modeluje *zakřivený* vztah — *polynomiální* ($\hat{y}=w_0+w_1x+w_2x^2+\dots$), exponenciální, logistický apod. Polynomiální regresi lze chápat jako lineární regresi nad rozšířenými příznaky.
- **Logistická regrese** přes sigmoid modeluje *pravděpodobnost třídy* — přes spojitý výstup tedy řeší *klasifikaci*.

Vyšší stupeň / kapacita modelu snižuje *bias*, ale zvyšuje *rozptyl* a riziko přeučení — kompromis řeší regularizace a výběr modelu dle [[hodnoceni]].

::: quiz "Která dvojice míra–algoritmus se používá pro výběr atributu v rozhodovacím stromu?"
- [x] Informační zisk (entropie) v ID3/C4.5 a Giniho index v CART
  > Oba kvantifikují pokles nečistoty po rozdělení; vybere se nejlepší atribut.
- [ ] Eukleidovská vzdálenost a k nejbližších sousedů
  > To je metrika pro k-NN, ne kritérium dělení uzlu stromu.
- [ ] Backpropagation a gradientní sestup
  > To je učení vah neuronové sítě, ne výběr atributu ve stromu.
- [ ] Bayesova věta a podmíněná nezávislost
  > To je princip naivního bayesovského klasifikátoru.
:::

::: link "Han, Kamber, Pei — Data Mining (kap. 8 Decision Tree, Naive Bayes)" "https://eecs.csuohio.edu/~sschung/CIS660/Data%20MiningJHan_Chapter8_Classification.pdf"
:::

::: link "scikit-learn — Decision Trees (kritéria Gini / entropie)" "https://scikit-learn.org/stable/modules/tree.html"
:::

---

*Zdroj: PBI státnicové okruhy NBIO, VUT FIT. Externí reference: J. Han, M. Kamber, J. Pei — Data Mining: Concepts and Techniques, kap. 8–9 (rozhodovací strom, naivní Bayes, klasifikace pomocí neuronových sítí); J. R. Quinlan — C4.5: Programs for Machine Learning; dokumentace scikit-learn (Decision Trees, Naive Bayes).*
