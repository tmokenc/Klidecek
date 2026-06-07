---
title: Paralelní rozdělení a k-tý nejmenší prvek
---

# Paralelní rozdělení (splitting) a paralelní výběr (select)

Předchozí kapitola ([[vyhledavani]]) probrala *vyhledávání jednoho* prvku. Dvě související, ale obecnější úlohy jsou: **rozdělit** posloupnost vůči zadané hodnotě (rozdělení, anglicky splitting) a **najít $k$-tý nejmenší** prvek (výběr, anglicky select). Obě úlohy jsou *stavebními bloky* dalších algoritmů — quicksort, řazení založené na mediánu (median-based sort) a kvantily ve statistice. Klíčové je, že oba algoritmy *kombinují* dříve probrané primitivy — *broadcast* neboli rozeslání pivota, *prefix sum* (prefixový součet) pro výpočet pozic a *reduce* pro sloučení. Tato kapitola je tedy *praktickou aplikací* všech komunikačních operací.

## Paralelní rozdělení (splitting) — rozdělení na L, E, G

**Úloha**: dáno pole $S$ délky $n$ a hodnota $m$. Vytvořit tři posloupnosti:

::: math
L = \{s_i \in S : s_i < m\}, \quad E = \{s_i \in S : s_i = m\}, \quad G = \{s_i \in S : s_i > m\}
:::

Sekvenčně: $O(n)$ jediným průchodem.

### Paralelní algoritmus na $N$ procesorech

```
procedure PARALLEL_SPLITTING(S[1..n], m, N)
  (i)   broadcast m to all N processors             // O(log N)
  (ii)  for i = 1 to N do in parallel
          S_i ← S[(i-1)(n/N)+1 .. i(n/N)]
          rozděl S_i na L_i, E_i, G_i (sekvenčně)   // O(n/N)
  (iii) spočítat offsety:
          a_i ← |L_i|, b_i ← |E_i|, c_i ← |G_i|
          x_i ← prefix_sum(a, i)         // pozice v L
          y_i ← x_N + prefix_sum(b, i)   // pozice v E (za L)
          z_i ← y_N + prefix_sum(c, i)   // pozice v G (za E)
          // všechno O(log N) přes scan
  (iv)  for i = 1 to N do in parallel
          zapsat L_i, E_i, G_i na své pozice  // O(n/N)
```

### Analýza

| Fáze | Čas | Komentář |
| :--- | :---: | :--- |
| (i) broadcast | $O(\log N)$ | stromové rozeslání (tree-distribution) |
| (ii) lokální rozdělení | $O(n/N)$ | sekvenční |
| (iii) prefixové součty | $O(\log N)$ | algoritmus typu scan |
| (iv) lokální zápis | $O(n/N)$ | sekvenční |

**Celkový čas**: $t(n) = O(\log N + n/N)$.

**Cena**: $c(n) = N \cdot t(n) = O(N \log N + n) = O(n)$ pro $N \le n/\log n$.

**Nákladově optimální (cost-optimal)!** Sekvenční verze měla cenu $O(n)$ a paralelní cena je rovněž $O(n)$.

### Příklad — rozdělení posloupnosti $S$ s 15 prvky vůči $m = 8$

$S = [13, 1, 12, 14, 3,\ 6, 8, 10, 2, 15,\ 7, 11, 4, 5, 9]$, $N = 3$, $|S_i| = 5$.

**Lokální rozdělení**:

```
S_1 = [13, 1, 12, 14, 3]     L_1 = [1, 3]         E_1 = []     G_1 = [12, 13, 14]
S_2 = [6, 8, 10, 2, 15]      L_2 = [2, 6]         E_2 = [8]    G_2 = [10, 15]
S_3 = [7, 11, 4, 5, 9]       L_3 = [4, 5, 7]      E_3 = []     G_3 = [9, 11]
```

**Offsety**:

```
a = (2, 2, 3) → prefix x = (0, 2, 4, 7)        // |L| = 7
b = (0, 1, 0) → prefix y = (7, 7, 8, 8)        // |E| = 1, kumul. od 7
c = (3, 2, 2) → prefix z = (8, 11, 13, 15)     // |G| = 7, kumul. od 8
```

**Konečné výstupní pole**:

```
[1, 3, 2, 6, 4, 5, 7, | 8 | 12, 13, 14, 10, 15, 9, 11]
 ─── L (pozice 0–6) ── ─E─  ────── G (pozice 8–14) ─────
```

Rozdělení proběhne v $O(\log N + n/N) = O(n/N)$ pro velké $n$.

## Paralelní výběr (select) — k-tý nejmenší prvek

**Úloha**: najít $k$-tý nejmenší prvek posloupnosti $S$ délky $n$, kde $1 \le k \le n$. Pokud $k = n/2$, jedná se o **medián**.

Sekvenčně to řeší algoritmus *median-of-medians* (medián mediánů; Blum, Floyd, Pratt, Rivest, Tarjan 1973) v *deterministickém* čase $O(n)$. Rychlejší to být ani nemůže — všechny prvky se musí *aspoň* jednou prohlédnout.

### Sekvenční referenční algoritmus

```
procedure SEQ_SELECT(S, k)
  (1) if |S| < Q then sort S and return k-th element
      else rozděl S na |S|/Q skupin po Q prvcích
  (2) for i = 1 to |S|/Q do
        M[i] ← median(S_i)  (sekvenčně Q-prvkový sort, najít prostřední)
  (3) m ← SEQ_SELECT(M, |M|/2)  // medián mediánů
  (4) rozděl S podle m na L, E, G
  (5) if |L| ≥ k then SEQ_SELECT(L, k)
      else if |L| + |E| ≥ k then return m
      else SEQ_SELECT(G, k - |L| - |E|)
```

**Klíčový trik**: medián mediánů $m$ leží *blízko* skutečného mediánu — to zaručuje, že se po dělení podaří vyloučit *aspoň 30 %* prvků. Rekurze pak konverguje *geometricky*.

### Paralelní algoritmus

Analogická struktura, ale s paralelizovanými kroky:

```
procedure PAR_SELECT(S, k, N processors)
  (1) if |S| < 4 then sekv. vyřeš
      else rozděl S na N podposloupností S_i délky n/N
  (2) for i = 1 to N do in parallel
        M[i] ← SEQ_SELECT(S_i, |S_i|/2)  // sekvenční local median, O(n/N)
  (3) m ← PAR_SELECT(M, |M|/2)            // rekurze: medián N mediánů
  (4) PARALLEL_SPLITTING(S, m)              // O(log N + n/N)
  (5) if |L| ≥ k then PAR_SELECT(L, k)
      else if |L| + |E| ≥ k then return m
      else PAR_SELECT(G, k - |L| - |E|)
```

### Analýza

**Klíčové pozorování**: při vhodné volbě pivota $m$ je *aspoň 30 %* prvků *vyřazeno* (leží v $L \cup E$ nebo v $E \cup G$, a tudíž nejsou v rekurzivně prozkoumávané části). Po každé rekurzi tedy zbývá *nanejvýš 70 %* prvků.

Celkovou práci dostaneme jako součet geometrické řady:

::: math
T(n) \le T\!\left(\frac{7n}{10}\right) + O(n/N + \log N)
:::

Pro dostatečně velké $N$ a malý log faktor:

::: math
T(n) = O(n/N + \log N) \cdot \sum_{i=0}^{\infty} \left(\frac{7}{10}\right)^i = O(n/N + \log N) \cdot \frac{1}{1 - 0.7} = O(n/N + \log N)
:::

(Konstanta 1/0,3 ≈ 3,33 je pohlcena do $O$.)

**Cena**: $c(n) = N \cdot t(n) = O(n + N \log N) = O(n)$ pro $N \le n/\log n$. **Nákladově optimální (cost-optimal)!**

### Příklad — najít 8. prvek (medián 15-prvkové posloupnosti) {tier=example}

$S = [13, 1, 12, 14, 3,\ 6, 8, 10, 2, 15,\ 7, 11, 4, 5, 9]$, $N = 3$ procesory, $k = 8$.

**Krok 1**: rozděl na 3 části po 5.

**Krok 2**: každý procesor najde medián své části.

```
M_1 = median(13, 1, 12, 14, 3) = 12
M_2 = median(6, 8, 10, 2, 15) = 8
M_3 = median(7, 11, 4, 5, 9) = 7
M = (12, 8, 7)
```

**Krok 3**: rekurzivně najdi medián 3 mediánů = $m = 8$.

**Krok 4**: paralelní rozdělení (PARALLEL_SPLITTING) s pivotem $m = 8$.

```
|L| = 7, |E| = 1, |G| = 7
```

**Krok 5**: $k = 8$. $|L| = 7 < 8$ a $|L| + |E| = 8 \ge 8$ → vrať $m = 8$.

**Výsledek**: 8. nejmenší prvek je 8 (medián). Hotovo v $O(\log N + n/N) \approx O(n/N)$.

## Využití výběru (select)

- **Medián**: nalezení prostředního prvku — $k = n/2$.
- **Kvantily**: $k$-tý percentil pro statistiku.
- **Volba dělicích prvků v sample sortu**: $p - 1$ kvantilů určí dělicí prvky (splittery), které rozdělí $p$ úseků pro distribuci dat mezi procesy.
- **Top-K v databázích a strojovém učení**: vrátit $K$ nejlepších/nejhorších záznamů.

## Rozdělení (splitting) jako primitivní operace

Samotné rozdělení se používá ve více algoritmech:

- **Paralelní quicksort** — rekurzivní rozdělení podle pivota.
- **Distribuované řazení** — po výběru dělicích prvků provedeme rozdělení, pak lokální řazení (local sort) a nakonec sběr dat (gather) nebo výměnu všech se všemi (all-to-all).
- **Geometrický intervalový dotaz (geometric range query)** ve 2D — rozdělení podle $x$, pak podle $y$.
- **Hranice prohledávání u DFS/BFS (frontier)** — rozdělení podle úrovně.

## Praktické rady {tier=practice}

1. **Pro malé $n$ ($< 1000$) použij sekvenční verzi** — režie paralelního zpracování (overhead) by převážila.
2. **Pro hledání více mediánů** (tj. najít *všechny* kvantily současně) je *sample sort* lepší než opakovaný PAR_SELECT.
3. **Randomizace** (zavedení náhody) zjednodušuje implementaci — náhodně volený pivot funguje *průměrně* v čase $O(n/N)$, a to bez nutnosti počítat medián mediánů.
4. **Knihovní implementace**: `std::nth_element` (sekvenční, varianta intro-select); pro paralelní výpočet na GPU lze použít Boost.Compute.

## Co dál

[[transposition-enumeration]] zavede konkrétní *řadicí* algoritmy: Odd-Even Transposition Sort (na lineární topologii) a Enumeration Sort (na mřížce s lineární sběrnicí). [[merge-radici]] probere algoritmy řazení *slučováním* (Odd-Even Merge, Pipeline Merge, Bucket Sort). [[radici-vyber]] probere algoritmy řazení *výběrem* — Minimum Extraction Sort a *Median Finding and Splitting* (což je *paralelní quicksort* postavený přesně na PAR_SELECT a PARALLEL_SPLITTING z této kapitoly).

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Akl, S.G.: *The Design and Analysis of Parallel Algorithms* (Prentice Hall 1989), kap. 5 (Searching) a kap. 6 (Selection); Blum, M., Floyd, R.W., Pratt, V., Rivest, R.L., Tarjan, R.E.: „Time Bounds for Selection" (J. Comput. Syst. Sci. 7(4), 1973, [DOI 10.1016/S0022-0000(73)80033-9](https://doi.org/10.1016/S0022-0000(73)80033-9)); JáJá, J.: *An Introduction to Parallel Algorithms* (Addison-Wesley 1992), kap. 3; Grama et al.: *Introduction to Parallel Computing* (2003), kap. 9.4–9.5; cp-algorithms — [Order statistic](https://cp-algorithms.com/) (reference).*
