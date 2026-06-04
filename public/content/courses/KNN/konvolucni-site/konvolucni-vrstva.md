---
title: Konvoluční vrstva
---

# Konvoluční vrstva

**Konvoluční vrstva** je základním stavebním prvkem konvolučních sítí. Místo aby každý neuron viděl celý vstup (jako u plně propojené vrstvy), pracuje jen s malou **lokální oblastí** — tzv. **receptivním polem**. Přes celý vstup posouvá malé **jádro** (filtr) vah a v každé pozici počítá skalární součin vah s odpovídajícím oknem vstupu. Výsledkem je **mapa příznaků** (feature map).

Vrstva stojí na dvou myšlenkách, které ji odlišují od husté (plně propojené) vrstvy:

- **Lokální konektivita** — výstupní hodnota závisí jen na malém okně vstupu (např. 3×3), ne na celém obrazu. Blízké pixely spolu souvisí víc než vzdálené.
- **Sdílení vah** (weight sharing) — *stejné* jádro se aplikuje na *všech* pozicích. Pokud je hrana užitečná v levém horním rohu, je užitečná i jinde. Díky tomu má vrstva málo parametrů a je **ekvivariantní vůči posunu** (posune-li se vzor ve vstupu, posune se i odezva ve výstupu).

::: viz knn-conv "Posouvej jádro přes vstupní mřížku tlačítky ◀ ▶. Přerušovaný rámeček je receptivní pole, jasná buňka vpravo je jedna vypočtená hodnota mapy příznaků = součet (okno · váhy). Posuvníky mění velikost jádra a stride; všimni si, že na každé pozici působí stejné váhy (sdílení vah)."
:::

## Výpočet jedné mapy příznaků

Pro 2D vstup `I` a jádro `K` o velikosti `k×k` je hodnota výstupu na pozici `(i,j)` váženým součtem okna vstupu (s volitelným biasem `b`). V knihovnách jde technicky o **křížovou korelaci** (jádro se neobrací), ale termín *konvoluce* se používá běžně.

::: math
S(i,j) = b + \sum_{m=0}^{k-1}\sum_{n=0}^{k-1} I(i\cdot s + m,\; j\cdot s + n)\; K(m,n)
:::

Zde `s` je **stride** (krok posunu). Jeden filtr produkuje jednu 2D mapu příznaků; vrstva jich má obvykle více (`F` filtrů), takže výstupem je 3D tenzor o hloubce `F`. Každý filtr má hloubku shodnou s počtem vstupních kanálů `C`, takže jádro je ve skutečnosti `k×k×C` a součet probíhá i přes kanály.

## Hyperparametry vrstvy

- **Velikost jádra `k`** — strana receptivního pole (typicky 3×3, 5×5).
- **Stride `s`** — o kolik pozic se jádro posune; větší stride zmenšuje výstup.
- **Padding `P`** — kolik nul se přidá kolem vstupu; `P = (k−1)/2` při stride 1 zachová prostorovou velikost (*same* padding).
- **Počet filtrů `F`** — určuje hloubku výstupního tenzoru (= počet map příznaků).

Po lineární konvoluci obvykle následuje nelinearita (typicky **ReLU**), bez níž by stoh konvolucí kolaboval na jedinou lineární operaci.

::: quiz "Proč má konvoluční vrstva řádově méně parametrů než plně propojená pro stejný vstup?"
- [x] Jádro se sdílí přes všechny pozice, takže počet vah nezávisí na velikosti vstupu, jen na `k`, `C` a `F`.
  > Přesně tak. Sdílení vah znamená, že počet parametrů je `(k·k·C)·F + F` bez ohledu na to, jak velký je obraz — to je podstata úspory.
- [ ] Konvoluce používá menší čísla, takže se vejde méga parametrů.
  > Ne — velikost hodnot s počtem parametrů nesouvisí. Úspora plyne ze sdílení jednoho jádra napříč pozicemi a z lokální konektivity.
- [ ] Plně propojená vrstva nemůže zpracovat obraz.
  > Může (po „rozbalení" na vektor), ale potřebuje obrovské množství vah a ztrácí prostorovou strukturu — proto se v raných vrstvách nepoužívá.
:::

::: link "CS231n — Convolutional Networks (lokální konektivita, sdílení vah)" "https://cs231n.github.io/convolutional-networks/"
:::

---

*Zdroj: KNN státnicové okruhy NBIO, VUT FIT. Externí reference: Stanford CS231n — Convolutional Neural Networks; Goodfellow, Bengio, Courville: *Deep Learning* (MIT Press 2016), kap. 9 (Convolutional Networks).*
