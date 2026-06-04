---
title: Frekventované množiny a Apriori
---

Vstupem je **transakční databáze**: každá transakce je množina **položek** (items), například zboží v jednom nákupu. *Množina položek* (itemset) o `k` prvcích se nazývá `k`-množina. **Podpora** množiny `X` je podíl transakcí, které `X` obsahují; množina je **frekventovaná**, právě když její podpora dosáhne uživatelského prahu `min-support`.

::: math
\mathrm{supp}(X) = \frac{|\{\, t \in D : X \subseteq t \,\}|}{|D|}
:::

Naivní výpočet by musel projít všech `2^n − 1` neprázdných podmnožin `n` položek — exponenciálně mnoho. Klíč k efektivitě je **apriori vlastnost** (downward closure): je-li množina frekventovaná, jsou frekventované i všechny její podmnožiny. Obměnou: **je-li množina nefrekventovaná, je nefrekventovaná i každá její nadmnožina** — a tu už nemá smysl generovat ani počítat.

::: viz zzn-apriori "Svaz podmnožin nad malou DB. Posuvníkem měň min-support: nefrekventované množiny se proškrtnou a každá nadmnožina nefrekventované se odřízne dřív, než ji vůbec spočítáme."
:::

Algoritmus **Apriori** (Agrawal & Srikant, 1994) využívá tuto vlastnost k prořezávání kandidátů a postupuje po hladinách (level-wise). Frekventované `k`-množiny `L_k` se hledají z frekventovaných `(k−1)`-množin ve dvou krocích — **join** (spoj dvojice `(k−1)`-množin lišících se posledním prvkem) a **prune** (zahoď kandidáta, který má aspoň jednu `(k−1)`-podmnožinu mimo `L_{k−1}`).

```text
L1 = frekventované 1-množiny
k = 2
while L_{k-1} != {}:
    C_k = apriori_gen(L_{k-1})        # join + prune dle apriori vlastnosti
    pro každou transakci t:           # jeden průchod DB
        zvyš počet u kandidátů C_k, které jsou podmnožinou t
    L_k = { c in C_k : supp(c) >= min_support }
    k += 1
vrať sjednocení všech L_k
```

Podpora kandidátů se počítá v jediném průchodu databází na hladinu; kandidáti bývají uloženi v **hašovacím stromě**, kde funkce *subset* rychle najde všechny kandidáty obsažené v transakci. Slabiny Apriori jsou ale principiální: **opakované průchody databází** (jeden na hladinu) a možná **exploze počtu kandidátů** u hustých dat s nízkým prahem.

::: quiz "Množina {A,B} má podporu pod prahem. Co řekne apriori vlastnost o {A,B,C}?"
- [x] {A,B,C} je také nefrekventovaná, takže ji nemusíme generovat ani počítat
  > {A,B} je podmnožina {A,B,C}; nadmnožina nefrekventované množiny nemůže mít vyšší podporu, proto je rovněž nefrekventovaná — toto je prořezávání (prune) v Apriori.
- [ ] {A,B,C} může být frekventovaná, podporu nelze odvodit
  > Naopak — přidáním položky podpora nikdy neroste (monotonie), proto je závěr jednoznačný.
- [ ] {A,B,C} je automaticky frekventovaná
  > To by porušilo monotonii podpory; přidání položky podporu jen snižuje nebo zachová.
:::

::: link "Agrawal & Srikant (1994): Fast Algorithms for Mining Association Rules (Apriori, originální článek)" "https://www.vldb.org/conf/1994/P487.PDF"
:::

*Zdroj: ZZN státnicové okruhy NBIO, VUT FIT. Externí reference: Agrawal & Srikant 1994 (Apriori, VLDB), Wikipedia — Association rule learning.*
