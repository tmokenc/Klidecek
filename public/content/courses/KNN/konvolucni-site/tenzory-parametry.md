---
title: Tvary tenzorů a počet parametrů
---

# Tvary tenzorů a počet parametrů

Aktivace v konvoluční síti tečou jako **4D tenzory** tvaru `N × C × H × W` (dávka × kanály × výška × šířka; v některých frameworcích `N × H × W × C`). Při ladění architektury je klíčové umět z hyperparametrů vrstvy **odvodit tvar výstupu** a spočítat **počet parametrů** — to ukazuje, kde sídlí paměť a výpočet.

## Tvar výstupního tenzoru konvoluce

Pro vstup `H × W × C`, jádro `k`, stride `S`, padding `P` a `F` filtrů má výstup prostorovou velikost danou stejným vzorcem pro obě dimenze a hloubku rovnou počtu filtrů:

::: math
H_{out} = \left\lfloor \frac{H - k + 2P}{S} \right\rfloor + 1, \qquad W_{out} = \left\lfloor \frac{W - k + 2P}{S} \right\rfloor + 1, \qquad C_{out} = F
:::

Hloubka výstupu tedy **nezávisí** na hloubce vstupu — je vždy rovna počtu filtrů `F`. Hloubka vstupu `C` se „spotřebuje" tím, že každý filtr má hloubku `C` a součet probíhá přes všechny kanály.

::: viz knn-tensor-shapes "Posuvníky nastav vstup H×W×C, velikost jádra k, stride, padding a počet filtrů F. Komponenta živě dopočítá tvar výstupního tenzoru a porovná počet parametrů konvoluční vrstvy s plně propojenou vrstvou, která by produkovala stejný výstup (log měřítko sloupců)."
:::

## Počet parametrů konvoluční vrstvy

Každý z `F` filtrů má `k × k × C` vah; navíc každý filtr má jeden bias. Počet parametrů **nezávisí na prostorové velikosti vstupu** — to je přímý důsledek sdílení vah:

::: math
\#\text{params}_{conv} = (k \cdot k \cdot C)\cdot F + F
:::

Příklad: vstup `32×32×3`, jádro `3×3`, `F = 16` filtrů → `(3·3·3)·16 + 16 = 432 + 16 = 448` parametrů. Výstupní tenzor (při `S=1`, `P=1`) je `32×32×16`.

## Srovnání s plně propojenou vrstvou

Plně propojená vrstva, která by ze vstupu `H·W·C` vyrobila stejný výstupní tenzor `H_out·W_out·F`, by potřebovala součin obou velikostí vah:

::: math
\#\text{params}_{FC} = (H\cdot W\cdot C)\cdot(H_{out}\cdot W_{out}\cdot F) + (H_{out}\cdot W_{out}\cdot F)
:::

Pro výše uvedený příklad je to řádově **stovky milionů** vah oproti **448** u konvoluce. Tento propastný rozdíl je hlavní důvod, proč jsou konvoluční vrstvy pro obrazová data tak efektivní: drží málo parametrů a využívají prostorovou strukturu.

::: quiz "Vstup 28×28×1, jádro 5×5, stride 1, padding 0, 6 filtrů. Jaký je tvar výstupu a počet parametrů?"
- [ ] 28×28×6, 156 parametrů.
  > Tvar by platil jen se *same* paddingem. S `P=0` se každá dimenze zmenší: `(28−5)/1 + 1 = 24`.
- [x] 24×24×6, 156 parametrů.
  > Správně. Prostorově `(28−5)+1 = 24`, hloubka = počet filtrů = 6. Parametry `(5·5·1)·6 + 6 = 150 + 6 = 156`.
- [ ] 24×24×6, 150 parametrů.
  > Skoro — zapomněl jsi přičíst `F` biasů (jeden na filtr): `150 + 6 = 156`.
:::

::: link "CS231n — výpočet tvaru a počtu parametrů konvoluce" "https://cs231n.github.io/convolutional-networks/"
:::

---

*Zdroj: KNN státnicové okruhy NBIO, VUT FIT. Externí reference: Stanford CS231n — Convolutional Neural Networks; Goodfellow, Bengio, Courville: *Deep Learning* (MIT Press 2016), kap. 9.*
