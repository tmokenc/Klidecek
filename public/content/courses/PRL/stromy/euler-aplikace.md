---
title: Aplikace Euler tour — preorder, hloubky, potomci, listy
---

# Aplikace Euler tour techniky

Předchozí kapitola ([[euler-tour]]) zavedla Euler tour reprezentaci stromu jako lineární sekvenci hran, a *list ranking* (suma prefixů) v $O(\log n)$. Tato kapitola ukazuje, *jak* tuto techniku aplikovat na praktické úlohy nad stromy: spočítání **preorder/postorder/inorder čísel**, **úrovně (depth)** každého uzlu, **počtu potomků** podstromu, **pořadí listů**. *Klíčové* pozorování: všechny úlohy se redukují na *jeden* suffix-sum nad Etour vektorem příznaků — jen *váha* vektoru se mění.

## Obecný framework

Standardní recept pro úlohy nad stromem s Etour:

1. **Etour**: spočítej Eulerovskou cestu (jednou pro daný strom).
2. **Inicializace**: pro každou hranu $e$ přiřaď *váhu* `weight(e)` podle úlohy.
3. **Suffix sum**: spočítej `weight(e) ← SuffixSum(Etour, weight)` v $O(\log n)$.
4. **Korekce**: pro každý uzel/hranu odvoď výsledek z `weight` v $O(1)$.

Suffix sum = scan s sčítáním zprava — pro pozici $i$ vrátí součet `weight[i] + weight[i+1] + ... + weight[2n-3]`.

**Celkový čas**: $O(\log n)$ paralelně, $O(n)$ procesorů.

## Úloha 1 — Preorder číslo každého uzlu

**Preorder** = pořadí, ve kterém uzel navštívíme při DFS, *navštívíme rodiče první*, pak rekurzivně potomky.

**Klíčové pozorování**: preorder($v$) = 1 + (počet *dopředných* hran v Etour až *včetně* dopředné hrany vedoucí do $v$).

### Algoritmus

```
1) for each e do in parallel
     if e is forward edge then weight(e) = 1
                          else weight(e) = 0
2) weight = SuffixSums(Etour, weight)
3) for each e = (u, v) do in parallel
     if e is forward edge then
       preorder(v) = n - weight(e) + 1
   preorder(root) = 1
```

### Příklad {tier=example}

Pro strom s 4 uzly (1 = kořen, 2, 3, 4 = děti):

```
Hrany Etour:  e1=(1,2)  e2=(2,1)  e3=(1,3)  e4=(3,1)  e5=(1,4)  e6=(4,1)
Forward?       1          0         1         0         1         0
Weight        [1, 0, 1, 0, 1, 0]
SuffixSum     [3, 2, 2, 1, 1, 0]

preorder(2) = 4 - 3 + 1 = 2   (z hrany e1, weight 3)
preorder(3) = 4 - 2 + 1 = 3   (z hrany e3, weight 2)
preorder(4) = 4 - 1 + 1 = 4   (z hrany e5, weight 1)
preorder(1) = 1               (kořen)
```

**Pořadí**: 1, 2, 3, 4 — odpovídá DFS preorder od kořene.

## Úloha 2 — Počet potomků (descendants)

**Počet potomků** uzlu $v$ = velikost podstromu *s kořenem $v$*, včetně $v$ samotného.

**Klíčové pozorování**: počet dopředných hran v *segmentu Etour* od $(u, v)$ do $(v, u)$ = počet uzlů v podstromu $v$ (každý uzel přidá *právě jednu* dopřednou hranu vedoucí do něj).

### Algoritmus

```
1) for each e do in parallel
     if e is forward edge then weight(e) = 1
                          else weight(e) = 0
2) weight = SuffixSums(Etour, weight)
3) for each e = (u, v) do in parallel
     if e is forward edge then
       desc(v) = weight(u, v) - weight(v, u)
   desc(root) = n
```

### Příklad

Pro stejný strom 4 uzlů:

```
SuffixSum  [3, 2, 2, 1, 1, 0]

desc(2) = weight(e1) - weight(e2) = 3 - 2 = 1   (jen sebe sama, list)
desc(3) = weight(e3) - weight(e4) = 2 - 1 = 1
desc(4) = weight(e5) - weight(e6) = 1 - 0 = 1
desc(1) = 4   (celý strom)
```

## Úloha 3 — Úroveň (depth) uzlu

**Úroveň** uzlu $v$ = počet hran na cestě z kořene do $v$. Kořen má úroveň 0, jeho děti úroveň 1, atd.

**Klíčové pozorování**: na Eulerovské cestě od $(u, v)$ do konce *rozdíl* mezi *zpětnými* a *dopřednými* hranami = úroveň $v$.

### Algoritmus

```
1) for each e do in parallel
     if e is forward edge then weight(e) = -1
                          else weight(e) = +1
2) weight = SuffixSums(Etour, weight)
3) for each e = (u, v) do in parallel
     if e is forward edge then
       level(v) = weight(e) + 1
   level(root) = 0
```

### Příklad

```
Forward?      1   0   1   0   1   0
Weight       -1   1  -1   1  -1   1
SuffixSum    [0, 1, 0, 1, 0, 1]

level(2) = weight(e1) + 1 = 0 + 1 = 1
level(3) = weight(e3) + 1 = 0 + 1 = 1
level(4) = weight(e5) + 1 = 0 + 1 = 1
level(1) = 0
```

Všichni potomci jsou v úrovni 1. Sedí.

## Úloha 4 — Pořadí listů

**Pořadí listu** v Etour = preorder pořadí listů, kdy uzly s vyšším preorder číslem jsou pozdější.

### Algoritmus

```
1) for each e do in parallel
     if e is forward edge to a leaf then weight = 1
                                    else weight = 0
2) weight = SuffixSums(Etour, weight)
3) for each e = (u, v) do in parallel
     leafs ← weight((root, w))    // total počet listů
     if e is forward edge and v is leaf then
       leaf(v) = leafs - weight(u, v) + 1
   leaf(root) = 1 (pokud kořen je list, jinak nedefinováno)
```

## Tabulka — různé úlohy, různé váhy

| Úloha | Váha hrany $e$ | Korekce |
| :--- | :--- | :--- |
| Preorder | 1 (forward) / 0 | $n - w(e) + 1$ |
| Postorder | 0 / 1 (backward) | $w(e) - w(e^R)$ |
| Inorder | 1 (forward to left) / 0 | analogicky |
| Počet potomků | 1 (forward) / 0 | $w(e) - w(e^R)$ |
| Úroveň | -1 (fwd) / +1 (back) | $w(e) + 1$ |
| Pořadí listu | 1 (fwd to leaf) / 0 | $\text{leafs} - w(e) + 1$ |

**Pozorování**: jediný *paralelní suffix sum* + vhodná inicializace dává odpověď na *libovolnou* z těchto úloh v $O(\log n)$.

## Pointer jumping vs deterministic coin tossing

V kapitole [[euler-tour]] jsme list ranking implementovali *pointer jumpingem* — $O(\log n)$ čas, $O(n \log n)$ cena.

**Cole & Vishkin 1986** ukázali, jak v *cost-optimal* $O(n)$ ceně. Trik: **3-barvení seznamu** přes *deterministic coin tossing*:

1. Každý uzel má unikátní ID (např. $n$-bitové ID dává $2^n$ možných hodnot).
2. V iteraci $k$: každý uzel spočítá *nejmenší bit*, kde se *jeho* ID liší od následníka. Tento bit + value bitu = jeho *nová* barva (do max $2 \cdot \log m$ barev).
3. Po $\log^* n$ iteracích zbude *6 barev*. Pak finální redukce na *3 barvy* lokálním přepisem.

S 3-barvením lze v $O(\log n)$ provést list ranking *bez* pointer jumping (paralelní reduce). Cena $O(n)$ — cost-optimal!

**$\log^* n$** = *iterovaný logaritmus*: pro $n = 2^{65536}$ je $\log^* n = 5$ (prakticky konstanta).

Detaily jsou složité; pro praktické účely stačí pointer jumping s log overhead.

## Analýza celkového frameworku

| Krok | Čas | Procesory |
| :--- | :---: | :---: |
| 0. Etour | $O(1)$ | $n$ |
| 1. Inicializace váhy | $O(1)$ | $n$ |
| 2. Suffix sum (list ranking) | $O(\log n)$ | $n$ |
| 3. Korekce výsledku | $O(1)$ | $n$ |

**Celkem**: $t(n) = O(\log n)$, $p(n) = O(n)$, $c(n) = O(n \log n)$ (pointer jumping) nebo $O(n)$ (Cole-Vishkin).

## Co dál

[[kontrakce-uvod]] probere úlohy, **které Euler tour neumí** — třeba *vyhodnocení aritmetického výrazu* v binárním stromě. Pro to potřebujeme *strukturální* změnu stromu: **Rake** (odstranění listů) a **Compress** (zkrácení řetězů uzlů s jedním synem). [[expression-eval]] potom aplikuje Rake + Compress přes **SHUNT** operaci.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=4mSQXGi0zSk" "SZZ: Paralelní algoritmy nad seznamy a stromy" "Tomáš Kocourek"
:::

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Tarjan, R.E., Vishkin, U.: „An efficient parallel biconnectivity algorithm" (SIAM J. Comput. 14(4), 1985); JáJá, J.: *An Introduction to Parallel Algorithms* (Addison-Wesley 1992), kap. 3.6 (Tree computations via Euler tour); Reif, J. (ed.): *Synthesis of Parallel Algorithms* (Morgan Kaufmann 1993), kap. 8; Cole, R., Vishkin, U.: „Deterministic coin tossing with applications to optimal parallel list ranking" (Inform. Control 70(1), 1986, [DOI 10.1016/S0019-9958(86)80023-7](https://doi.org/10.1016/S0019-9958(86)80023-7)).*
