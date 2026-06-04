---
title: Message passing a GCN
---

# Message passing a graph convolution

Mnoho dat má přirozeně **grafovou strukturu**: objekty (uzly) a vztahy mezi nimi (hrany) — sociální sítě, molekuly, znalostní grafy, silniční sítě. Na rozdíl od obrazu nebo textu graf **nemá pravidelnou mřížku**: každý uzel má jiný počet sousedů, neexistuje pevné uspořádání uzlů a graf může mít libovolný tvar. Proto na něj nelze přímo nasadit klasickou konvoluční síť (CNN), která předpokládá pravidelnou mřížku pixelů.

**Grafová neuronová síť (GNN)** pracuje se dvěma druhy informace najednou: **vlastnostmi uzlů** (každý uzel nese feature vektor — embedding osoby, vlastnosti atomu) a **strukturou propojení** (kdo s kým sousedí). Hrany navíc mohou nést vlastní **edge features** (vzdálenost, typ vztahu, síla spojení).

## Message passing — jedna vrstva GNN

Stavebním principem je **message passing** (předávání zpráv). Každý uzel aktualizuje svůj feature vektor ve třech krocích, které dohromady tvoří **jednu vrstvu** GNN:

1. **Message** — každý soused pošle zprávu (typicky svůj — případně transformovaný — feature vektor).
2. **Aggregate** — uzel přicházející zprávy **agreguje** jednou *permutačně invariantní* operací (suma, průměr, maximum). Invariance je klíčová: výsledek nesmí záviset na pořadí, ve kterém sousedy procházíme.
3. **Update** — agregát se zkombinuje s vlastním předchozím stavem uzlu (např. naučenou funkcí + nelinearitou) na **novou reprezentaci** uzlu.

Obecné pravidlo jedné vrstvy zapíšeme jako:

::: math
h_v^{(k)} = \text{UPDATE}\!\left(h_v^{(k-1)},\ \text{AGGREGATE}\big(\{\, h_u^{(k-1)} : u \in \mathcal{N}(v) \,\}\big)\right)
:::

kde *N(v)* je množina sousedů uzlu *v* a *k* je index vrstvy. Tomuto rámci se obecně říká **MPNN** (Message Passing Neural Network) — message funkce sebere zprávy od sousedů, update funkce je sloučí s aktuálním stavem uzlu. Je to přímá analogie konvoluce: **CNN agreguje sousední pixely, GNN agreguje sousední uzly** — jen nad nepravidelným okolím.

::: viz knn-gnn-mp "Klikni vrchol → jedno kolo message passingu: sousedé pošlou zprávy (vektory), přepni agregaci suma/průměr a sleduj, jak update poskládá nový feature vektor vrcholu."
:::

## Aggregate musí být permutačně invariantní

Sousedé uzlu tvoří **neuspořádanou množinu** — graf nemá kanonické pořadí vrcholů. Agregační funkce proto musí dávat stejný výsledek bez ohledu na pořadí vstupů. To splňuje **suma**, **průměr** i **maximum**, ne ale třeba konkatenace v pevném pořadí.

- **suma** — zachovává „kolik" i „jak silně"; citlivá na velikost okolí,
- **průměr (mean)** — normalizuje na proměnlivý počet sousedů,
- **maximum** — vyzdvihne nejvýraznější rys v okolí.

## GCN — symetricky normalizovaná agregace

**GCN** (Graph Convolutional Network) je nejznámější konkrétní message-passing vrstva. Sousedy agreguje váženou sumou s **symetrickou normalizací** podle stupňů uzlů a přidanými **smyčkami** (self-loops, aby uzel viděl i sám sebe — `Ã = A + I`):

::: math
H^{(l+1)} = \sigma\!\left(\tilde{D}^{-\frac{1}{2}}\,\tilde{A}\,\tilde{D}^{-\frac{1}{2}}\,H^{(l)}\,W^{(l)}\right),\qquad \tilde{A} = A + I
:::

kde *H* je matice feature vektorů všech uzlů, *W* je naučená váhová matice vrstvy, *σ* nelinearita (např. ReLU) a `D̃` je diagonální matice stupňů `Ã`. Normalizace `D̃^{-1/2} Ã D̃^{-1/2}` zabrání tomu, aby uzly s mnoha sousedy „přehlušily" ostatní. Na úrovni jediného uzlu lze GCN vrstvu vyjádřit i pomocí naučených vah `W1` (vlastní rys) a `W2` (sousedé):

::: math
x_i' = W_1 x_i + W_2 \sum_{j \in \mathcal{N}(i)} e_{j,i}\, x_j
:::

## Information diffusion a receptive field

Jedna vrstva šíří informaci **jen mezi přímými sousedy**. Skládáním vrstev se dosah rozšiřuje: 1 vrstva → sousedé, 2 vrstvy → sousedé sousedů, *k* vrstev → *k*-okolí. Roste tak **receptive field** (obdoba u CNN). Pozor — příliš mnoho vrstev vede k **over-smoothing**: reprezentace uzlů konvergují k sobě a přestávají být rozlišitelné.

::: quiz "Proč musí být agregační funkce v message passingu permutačně invariantní?"
- [ ] Aby síť běžela rychleji na GPU
- [x] Protože sousedé tvoří neuspořádanou množinu — výstup nesmí záviset na pořadí vrcholů
  > Graf nemá kanonické uspořádání uzlů; suma/průměr/maximum vrací stejný výsledek pro libovolnou permutaci vstupů, konkatenace v pevném pořadí ne.
- [ ] Aby bylo možné použít edge features
- [ ] Aby se zabránilo over-smoothingu
:::

::: link "Kipf & Welling: Semi-Supervised Classification with Graph Convolutional Networks (ICLR 2017)" "https://arxiv.org/abs/1609.02907"
:::

::: link "Gilmer et al.: Neural Message Passing for Quantum Chemistry (MPNN, ICML 2017)" "https://arxiv.org/abs/1704.01212"
:::

---

*Zdroj: KNN státnicové okruhy NBIO, VUT FIT. Externí reference: Kipf, T.N., Welling, M.: „Semi-Supervised Classification with Graph Convolutional Networks" (ICLR 2017, [arXiv:1609.02907](https://arxiv.org/abs/1609.02907)) — GCN; Gilmer, J. et al.: „Neural Message Passing for Quantum Chemistry" (ICML 2017, [arXiv:1704.01212](https://arxiv.org/abs/1704.01212)) — MPNN rámec; Sanchez-Lengeling, B. et al.: „A Gentle Introduction to Graph Neural Networks" ([Distill 2021](https://distill.pub/2021/gnn-intro/)).*
