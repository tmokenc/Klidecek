---
title: k-means a k-medoids
---

# Rozdělující metody: k-means a k-medoids

**Rozdělující (partitioning) metody** vytvoří z databáze $D$ o $n$ objektech rozklad do $k$ tříd, kde $k \le n$. Platí, že každá třída obsahuje alespoň jeden objekt a každý objekt patří právě do jedné třídy (tvrdé, navzájem disjunktní shluky). **Počet shluků $k$ se zadává předem.** Najít *globálně* optimální rozklad by vyžadovalo prozkoumat všechna možná rozdělení — to je výpočetně nezvládnutelné (problém je NP-těžký), proto se používají **iterativní heuristiky**, které konvergují k *lokálnímu* optimu.

## k-means — Lloydův algoritmus

k-means reprezentuje každý shluk jeho **centroidem** — *fiktivním* středovým bodem, který je **průměrem** všech objektů ve shluku. Cílem je minimalizovat **vnitroshlukový součet čtverců** (WCSS, within-cluster sum of squares):

::: math
J = \sum_{j=1}^{k} \sum_{\mathbf{x} \in C_j} \lVert \mathbf{x} - \boldsymbol{\mu}_j \rVert^2
:::

kde $\boldsymbol{\mu}_j$ je centroid shluku $C_j$. Algoritmus (Lloyd) střídá dva kroky:

1. **Inicializace** — náhodně se zvolí $k$ počátečních center.
2. **Přiřazovací krok** — každý objekt se přiřadí k *nejbližšímu* centru.
3. **Aktualizační krok** — každé centrum se přepočítá jako průměr přiřazených objektů.
4. **Ukončení** — opakuj 2–3, dokud se přiřazení (nebo centra) nemění.

Protože každý z obou kroků hodnotu $J$ nikdy nezvýší, posloupnost $J$ **monotónně klesá** a algoritmus vždy **konverguje** — ale obecně jen do **lokálního minima**. Výsledek proto závisí na inicializaci; v praxi se algoritmus spouští vícekrát nebo se použije chytrá inicializace **k-means++**.

::: viz zzn-kmeans "Krokuj iterace: přiřaď body k nejbližšímu centru → přepočítej centra; sleduj konvergenci. Přepínač přepne na k-medoids — středem se stane skutečný datový bod (čtverec) místo fiktivního průměru (kosočtverec)."
:::

**Vlastnosti k-means:** funguje dobře pro *kompaktní, dobře oddělené, zhruba kulovité* shluky. Slabiny — je **citlivý na šum a odlehlé hodnoty** (jediný extrém vychýlí průměr), neumí odhalit shluky velmi *různé velikosti* ani *nekonvexního* tvaru a vyžaduje předem zadané $k$. Iterace je rychlá: $O(n \cdot k \cdot d)$ na průchod, kde $d$ je dimenze.

## k-medoids — středem je skutečný objekt

k-medoids odstraňuje hlavní slabinu k-means: místo fiktivního průměru reprezentuje každý shluk **medoidem** — *skutečným objektem* z databáze, který má nejmenší součet vzdáleností k ostatním členům shluku. Minimalizuje se **součet vzdáleností** (ne *čtverců*):

::: math
J = \sum_{j=1}^{k} \sum_{\mathbf{x} \in C_j} d(\mathbf{x}, m_j), \qquad m_j \in D
:::

Klasická realizace je algoritmus **PAM (Partitioning Around Medoids)**: vybere $k$ medoidů a poté zkouší **záměny** (swap) medoidu za nemedoid; záměnu provede, pokud sníží celkovou cenu.

**Výhody oproti k-means:**

- **Robustnost vůči odlehlým hodnotám.** Cílová funkce sčítá vzdálenosti, ne jejich čtverce, takže extrémy nedominují; navíc medoid je skutečný bod, který odlehlá hodnota nemůže „přetáhnout".
- Pracuje s **libovolnou** mírou nepodobnosti (i tam, kde průměr nedává smysl — kategoriální data, předpočítaná matice vzdáleností).

**Nevýhoda:** je **výpočetně náročnější** — PAM vyhodnocuje $O(k(n-k)^2)$ záměn na iteraci, proto je vhodný spíše pro **menší množiny dat** (pro velká data existují vzorkující varianty jako CLARA).

::: quiz "Čím se medoid liší od centroidu a co tím k-medoids získává?"
- [x] Medoid je skutečný objekt z dat (centroid je fiktivní průměr), díky čemuž je k-medoids robustnější vůči odlehlým hodnotám
- [ ] Medoid je vždy přesný geometrický střed shluku
- [ ] k-medoids nepotřebuje zadat počet shluků k
- [ ] k-medoids je rychlejší než k-means
> Centroid je průměr — odlehlá hodnota ho vychýlí. Medoid je vybraný *existující* bod minimalizující součet vzdáleností, takže extrémy mají menší vliv. Cenou je vyšší výpočetní složitost a stále je nutné zadat k.
:::

::: link "Wikipedia: k-means clustering (Lloyd, WCSS, konvergence)" "https://en.wikipedia.org/wiki/K-means_clustering"
:::

::: link "Datanovia: K-Medoids / PAM — robustní alternativa ke k-means" "https://www.datanovia.com/en/lessons/k-medoids-in-r-algorithm-and-practical-examples/"
:::

*Zdroj: ZZN státnicové okruhy NBIO, VUT FIT. Externí reference: Wikipedia [k-means clustering](https://en.wikipedia.org/wiki/K-means_clustering); Kaufman, L., Rousseeuw, P.J.: *Finding Groups in Data* (Wiley 1990) — algoritmus PAM; Datanovia [K-Medoids/PAM](https://www.datanovia.com/en/lessons/k-medoids-in-r-algorithm-and-practical-examples/).*
