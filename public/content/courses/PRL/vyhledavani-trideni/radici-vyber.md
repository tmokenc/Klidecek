---
title: Řazení výběrem — Minimum Extraction Sort a Median Finding and Splitting
---

# Řadicí algoritmy výběrem

Předchozí kapitola ([[merge-radici]]) probrala řazení *slučováním*. Třetí kategorií paralelních řadicích algoritmů jsou algoritmy *výběrové* (selection-based) — opakovaně vyberou (extrahují) jeden *vybraný* prvek (minimum, medián) a postupně z nich sestavují seřazený výstup. Tato kapitola probírá dva z nich: **Minimum Extraction Sort** (jednoduchá konstrukce na stromě, nevyžaduje pivota) a **Median Finding and Splitting** (paralelní quicksort s mediánovým pivotem). Druhý z nich je *cost-optimal* (nákladově optimální — paralelní cena se shoduje s nejlepším sekvenčním algoritmem) a doplňuje tak rodinu cost-optimálních paralelních řadicích algoritmů.

## Minimum Extraction Sort

### Topologie

Procesory jsou uspořádány do **binárního stromu**. **Listy** drží *řazenou posloupnost* (každý list jednu hodnotu, případně skupinu hodnot). **Vnitřní uzly** posouvají minimum směrem nahoru a **kořen** vydává hodnoty na výstup.

### Princip

Každý vnitřní uzel:

- Porovná hodnoty svých dvou synů.
- Menší z nich pošle svému *otci*.

Po $\log n + 1$ krocích se *minimum* dostane do kořene. Každým dalším krokem se získá *další* nejmenší prvek (následník v setříděné posloupnosti).

```
procedure MIN_EXTRACT_SORT
  (1) for all leafs in parallel
        načti jeden prvek
  (2) for i = 1 to 2n + log(n) - 1 do
        for all nonleaf nodes in parallel
          if kořen a má hodnotu: vystoupit hodnotu
          else if má hodnotu: nic (čeká na další cyklus)
          else // prázdný
            if oba synové prázdní: nic
            else if jeden syn prázdný: získat hodnotu od druhého
            else: získat menší ze synů
```

### Příklad — vstup $[8, 7, 6, 5, 4, 3, 2, 1]$ {tier=example}

```
Inicializace listů:    8  7  6  5  4  3  2  1
Krok 1: úroveň 1:        7    5    3    1
Krok 2: úroveň 2:           5         1
Krok 3: kořen:                  1
Krok 4: výstup 1, kořen ← další minimum = 2
        ... (každý další cyklus = 1 prvek)
```

::: viz min-extraction-sort "Krokuj cyklus po cyklu. Sleduj, jak minimum probublává ke kořeni: jakmile tam dorazí, kořen hodnotu vydá na výstup, příslušný list se vyprázdní (∅) a vzhůru putuje další minimum. První prvek získáš po log n+1 krocích, každý další po 2 krocích."
:::

### Analýza

- První prvek se získá po $\log n + 1$ krocích.
- Každý další prvek po **2 krocích** (jeden na porovnání, jeden na uložení/přesun).

::: math
t(n) = 2n + \log n - 1 = O(n)
:::

- $p(n) = 2n - 1$ procesorů.
- $c(n) = O(n^2)$ — algoritmus **není cost-optimal** (sekvenční řazení zvládne $O(n \log n)$).

### Diskuze

- Algoritmus je *jednoduchý* a *názorný* — minimum se postupně *vyplave* na povrch.
- *Plýtvá procesory* — jeho cena je $n^2$.
- V praxi se používá především pro *hardwarové* implementace min-haldy (min-heap) ve frontách s prioritou (priority queue).

## Median Finding and Splitting

### Myšlenka — paralelní quicksort s mediánovým pivotem

Architektura je stejná jako u algoritmu Bucket Sort: strom s $m = \log n$ listy. *Vnitřní uzly* však neslučují — naopak posloupnost *rozdělují* (split) podle mediánu.

```
procedure MEDIAN_FINDING_AND_SPLITTING
  (1) kořen načte řazenou sekvenci S
  (2) for i = 0 to log(m) - 1 do
        for all processors at level i do in parallel
          (2.1) najdi medián M své sekvence (sekvenčně, optimálním Select)
          (2.2) pro každý prvek x:
                if x < M: pošli levému synovi
                else:     pošli pravému synovi
        endfor
      endfor
  (3) for all leaf processors in parallel
        seřaď svou sekvenci sekvenčním algoritmem
        ulož na výstup
```

### Princip — perfektní rozdělení

Klíčový rozdíl oproti sekvenčnímu quicksortu: **každý vnitřní uzel hledá *medián*** své podposloupnosti (nikoli náhodný pivot). Tím je zaručeno, že *obě* podposloupnosti tvoří *přesně* poloviny, a strom je proto *vyvážený*.

::: viz median-splitting "Krokuj jednotlivé fáze: kořen najde medián, rozdělí posloupnost na ≤M (levý syn) a >M (pravý syn) a pošle ji synům. Postup se opakuje až k listům, které svou část seřadí sekvenčně. Mediánový pivot zaručuje dokonalé rozdělení (vždy přesně n/2 a n/2)."
:::

### Analýza

1. **První krok** (načtení posloupnosti S kořenem): $O(n)$.
2. **Dělení na úrovni $i$**: procesor zpracovává posloupnost délky $n/2^i$.
   - Nalezení mediánu v $O(n/2^i)$ (sekvenční Select).
   - Rozdělení v $O(n/2^i)$.
   - Součet přes všechny úrovně: $\sum_{i=0}^{\log m - 1} n/2^i = O(n)$.
3. **Řazení v listech**: každý list seřadí $n/\log n$ prvků optimálním sekvenčním algoritmem v $O((n/\log n) \log(n/\log n)) = O(n)$.

**Celkem**:

- $t(n) = O(n)$
- $p(n) = O(\log n)$ procesorů.
- $c(n) = O(n \log n)$ — **cost-optimal**!

### Diskuze

- *Cost-optimal* (nákladově optimální), stejně jako Bucket Sort a Pipeline Merge Sort.
- *Zaručená vyváženost* díky mediánovému pivotu — nehrozí zhoršení v nejhorším případě (worst-case), jako tomu je u quicksortu s náhodným pivotem.
- *Složitější implementace* (hledání mediánu v každém uzlu) — v praxi se proto medián typicky nahrazuje náhodně voleným (randomizovaným) pivotem, který je jednodušší a v průměru má složitost $O(n)$, ale v nejhorším případě (worst-case) až $O(n^2)$.
- Koncepčně jde o *paralelní quicksort* s **deterministickým** pivotem.

## Souhrnná tabulka — všechny paralelní řadicí algoritmy

| Algoritmus | Topologie | Čas | Procesory | Cena | Cost-opt? |
| :--- | :--- | :---: | :---: | :---: | :---: |
| Sekv. merge sort | — | $O(n \log n)$ | 1 | $O(n \log n)$ | ✓ |
| Odd-Even Transposition | lineární | $O(n)$ | $n$ | $O(n^2)$ | ✗ |
| Enumeration (mřížka) | $n \times n$ mesh | $O(\log n)$ | $n^2$ | $O(n^2 \log n)$ | ✗ |
| Enumeration (lineární) | lin. + sběrnice | $O(n)$ | $n$ | $O(n^2)$ | ✗ |
| **Bucket Sort** | strom | $O(n)$ | $O(\log n)$ | $O(n \log n)$ | ✓ |
| Odd-Even Merge Sort | řadicí síť | $O(\log^2 n)$ | $O(n \log^2 n)$ | $O(n \log^4 n)$ | ✗ |
| **Pipeline Merge Sort** | lineární řetězec | $O(n)$ | $O(\log n)$ | $O(n \log n)$ | ✓ |
| Minimum Extraction Sort | strom | $O(n)$ | $2n - 1$ | $O(n^2)$ | ✗ |
| **Median Finding+Splitting** | strom | $O(n)$ | $O(\log n)$ | $O(n \log n)$ | ✓ |

**Cost-optimal trojice** (nákladově optimální algoritmy): **Bucket Sort**, **Pipeline Merge Sort** a **Median Finding and Splitting**. Všechny vystačí s *pouhými* $O(\log n)$ procesory a běží v *lineárním* čase.

## Výběr v praxi {tier=practice}

| Scénář | Doporučený algoritmus |
| :--- | :--- |
| HPC cluster s MPI | Sample sort (varianta Median+Splitting) |
| GPU (CUDA, OpenCL) | Bitonic merge sort, radix sort |
| FPGA / ASIC | Odd-Even Merge Sort (řadicí síť) |
| Streaming dat | Pipeline Merge Sort |
| Embedded multi-core (4–16 jader) | Bucket Sort |
| Algoritmus pro výuku | Odd-Even Transposition (jednoduchý) |

V *teorii* existují řadicí síť *AKS network* (Ajtai, Komlós, Szemerédi 1983) a *Coleovo paralelní řazení slučováním* (Cole's parallel merge sort, 1988) s časem $O(\log n)$ a cenou $O(n \log n)$ — *asymptoticky lepší* než Batcherovy algoritmy. V *praxi* však mají tak velké konstanty, že se nepoužívají. Pro hardwarové řadicí sítě tak zůstává *standardem* Batcher.

## Co dál

Kapitola [[transpozice]] (Paralelní maticové operace) přejde od *řazení* k *lineární algebře* — paralelní výpočty matice-vektor, matice-matice a transpozice — na *PRAM*, *mřížce* a *hyperkrychli*. Kapitola *Kontrakce stromu* dále rozvine paralelní algoritmy na stromech (Eulerův tah, vyhodnocování výrazů).

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Akl, S.G.: *Parallel Sorting Algorithms* (Academic Press 1985); Akl, S.G.: *The Design and Analysis of Parallel Algorithms* (Prentice Hall 1989), kap. 4; Cole, R.: „Parallel merge sort" (SIAM J. Comput. 17(4), 1988, [DOI 10.1137/0217049](https://doi.org/10.1137/0217049)); Ajtai, M., Komlós, J., Szemerédi, E.: „An O(n log n) sorting network" (STOC 1983, [DOI 10.1145/800061.808726](https://doi.org/10.1145/800061.808726)); JáJá, J.: *An Introduction to Parallel Algorithms* (1992), kap. 4; Grama et al.: *Introduction to Parallel Computing* (2003), kap. 9.*
