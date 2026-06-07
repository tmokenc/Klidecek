---
title: Odd-Even Transposition Sort a Enumeration Sort
---

# Odd-Even Transposition Sort a Enumeration Sort

Předchozí kapitola ([[splitting-select]]) probrala stavební bloky. Nyní se pustíme do konkrétních *řadicích algoritmů*. Tato kapitola probírá dva *fyzicky orientované* algoritmy, které využívají *pevně danou* propojovací topologii: **Odd-Even Transposition Sort** (řazení sudo-lichými výměnami) na *lineárním poli* (řetězec procesorů) a **Enumeration Sort** (řazení výčtem) na *mřížce* nebo na *lineárním poli se sběrnicí*. Oba algoritmy hezky ukazují, *jak* propojovací topologie omezuje (a někdy i obohacuje) algoritmický návrh.

## Odd-Even Transposition Sort

### Topologie

**Lineární pole** $n$ procesorů $P_1, P_2, \dots, P_n$ propojených sousedsky. Každý procesor má jednu hodnotu $y_i$.

```
[y_1] — [y_2] — [y_3] — [y_4] — ... — [y_n]
```

### Princip

V *liché* iteraci si páry $(P_1, P_2), (P_3, P_4), \dots$ porovnají hodnoty a *vymění* je, pokud jsou ve špatném pořadí.

V *sudé* iteraci si páry $(P_2, P_3), (P_4, P_5), \dots$ dělají totéž.

Po nanejvýš $n$ takových iteracích jsou hodnoty *seřazeny vzestupně*.

```
procedure ODD_EVEN_TRANSPOSITION_SORT(y[1..n])
  for k = 1 to n/2 do
    // Liché kroky
    for i = 1, 3, 5, ..., 2·⌊n/2⌋-1 do in parallel
      if y[i] > y[i+1] then swap(y[i], y[i+1])
    endfor
    // Sudé kroky
    for i = 2, 4, 6, ..., 2·⌊(n-1)/2⌋ do in parallel
      if y[i] > y[i+1] then swap(y[i], y[i+1])
    endfor
  endfor
```

### Příklad — řazení $[4, 3, 1, 2]$ {tier=example}

```
počátek:   4   3   1   2
1. liché:  3   4   1   2     (swap P1-P2; P3-P4 OK)
1. sudé:   3   1   4   2     (swap P2-P3; ostatní mimo)
2. liché:  1   3   2   4     (swap P1-P2; swap P3-P4)
2. sudé:   1   2   3   4     (swap P2-P3)
```

::: svg "Odd-Even Transposition Sort — průchod skrz pole"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.8" fill="var(--bg-card)">
    <rect x="60" y="30" width="36" height="22"/>
    <rect x="96" y="30" width="36" height="22"/>
    <rect x="132" y="30" width="36" height="22"/>
    <rect x="168" y="30" width="36" height="22"/>
    <rect x="60" y="65" width="36" height="22"/>
    <rect x="96" y="65" width="36" height="22"/>
    <rect x="132" y="65" width="36" height="22"/>
    <rect x="168" y="65" width="36" height="22"/>
    <rect x="60" y="100" width="36" height="22"/>
    <rect x="96" y="100" width="36" height="22"/>
    <rect x="132" y="100" width="36" height="22"/>
    <rect x="168" y="100" width="36" height="22"/>
    <rect x="60" y="135" width="36" height="22"/>
    <rect x="96" y="135" width="36" height="22"/>
    <rect x="132" y="135" width="36" height="22"/>
    <rect x="168" y="135" width="36" height="22"/>
    <rect x="60" y="170" width="36" height="22"/>
    <rect x="96" y="170" width="36" height="22"/>
    <rect x="132" y="170" width="36" height="22"/>
    <rect x="168" y="170" width="36" height="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="78" y="44">4</text>
    <text x="114" y="44">3</text>
    <text x="150" y="44">1</text>
    <text x="186" y="44">2</text>
    <text x="78" y="79">3</text>
    <text x="114" y="79">4</text>
    <text x="150" y="79">1</text>
    <text x="186" y="79">2</text>
    <text x="78" y="114">3</text>
    <text x="114" y="114">1</text>
    <text x="150" y="114">4</text>
    <text x="186" y="114">2</text>
    <text x="78" y="149">1</text>
    <text x="114" y="149">3</text>
    <text x="150" y="149">2</text>
    <text x="186" y="149">4</text>
    <text x="78" y="184">1</text>
    <text x="114" y="184">2</text>
    <text x="150" y="184">3</text>
    <text x="186" y="184">4</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <rect x="55" y="65" width="78" height="22"/>
    <rect x="91" y="100" width="78" height="22"/>
    <rect x="55" y="135" width="78" height="22"/>
    <rect x="127" y="135" width="78" height="22"/>
    <rect x="91" y="170" width="78" height="22"/>
  </g>
  <g fill="var(--text-muted)" font-size="9">
    <text x="240" y="44">vstup</text>
    <text x="240" y="79">1. liché (1-2)</text>
    <text x="240" y="114">1. sudé (2-3)</text>
    <text x="240" y="149">2. liché (1-2, 3-4)</text>
    <text x="240" y="184">2. sudé (2-3) → seřazeno</text>
  </g>
</svg>
:::

### Analýza

- $t(n) = O(n)$ — *dolní mez* pro lineární topologii. Kvůli průměru $\Omega(n)$ se hodnota z konce *musí přesunout* přes $n$ uzlů.
- $p(n) = n$ procesorů.
- $c(n) = O(n^2)$ — *není* nákladově optimální (cost-optimal); pro srovnání sekvenční slučovací řazení (merge sort) má $O(n \log n)$.

::: viz transposition-enumeration "Vyber reverzní preset a krokuj — uvidíš, proč nejhorší případ [n, n-1, …, 1] potřebuje přesně n/2 iterací: každá inverze se posune nanejvýš o 1 pozici za pár fází."
:::

### Korektnost — proč $n/2$ iterací stačí

Po jedné liché a jedné sudé iteraci se každá *inverze* (dvojice prvků ve špatném pořadí) může posunout nanejvýš o 1 pozici v dobrém směru. Maximální vzdálenost inverze v $n$-prvkové permutaci je $n - 1$. Postačí tedy $\lceil n/2 \rceil$ iterací, kde každá iterace zahrnuje jeden lichý a jeden sudý krok.

Algoritmus je *paralelní obdobou bublinkového řazení (bubble sort)* — původně jej popsal Habermann roku 1972, znám je i pod názvy *brick sort* nebo *parity sort*. Pro hardwarově orientované řadicí sítě (sorting networks) je *standardem*, protože se snadno implementuje přímo v křemíku.

## Enumeration Sort

### Princip enumerace

Pozice $k$-tého prvku v *seřazeném* výstupu = počet menších prvků + 1.

```
RANK(x_i) = 1 + |{x_j : x_j < x_i, j ≠ i}|
```

Spočítáme-li pořadí $\text{RANK}$ pro každý prvek, můžeme každý prvek *rovnou* umístit na jeho výslednou pozici.

Sekvenčně to vyžaduje $O(n^2)$ operací (porovnání každého s každým). Paralelně lze téhož dosáhnout ve *velmi krátkém* čase, ovšem za cenu *velkého* počtu procesorů.

::: viz enumeration-sort "Vyber mřížku n×n nebo lineární+sběrnici. Sleduj 4 fáze: distribuce, porovnání (RANK_ij), redukce řádků, přesun na cílovou pozici. Klíčová idea: pozice = počet menších + 1."
:::

### Varianta A: Enumeration Sort na 2D mřížce

**Topologie**: mřížka $n \times n$ procesorů $P_{i,j}$, kde jsou *řádky i sloupce* propojeny *binárním stromem* pro rozesílání hodnot (broadcast) a pro redukci.

**Algoritmus**:

```
procedure ENUMERATION_SORT_MESH(x[1..n])
  (1) // Distribuce: každý procesor P_{i,j} dostane x_i a x_j
      for i = 1 to n do in parallel
        x_i broadcast po sloupci 1 → P_{i,j} dostane x_i do A
        x_j broadcast po řádce → P_{i,j} dostane x_j do B
      RANK(i, j) ← (B < A) ? 1 : 0
  (2) // Redukce po řádkách: RANK(i, 1) ← součet RANK(i, *)
      pro každou řádku: redukce v O(log n)
      RANK(i, 1) ← RANK(i, 1) + 1
  (3) // Přesun na pozici
      for i = 1 to n do in parallel
        if RANK(i, 1) = j then přesuň x_i z A(i, j) do A(j, 1)
```

### Příklad — řazení $[9, 8, 3, 5, 6]$

**Fáze 1** — distribuce a porovnání. Každá pozice $(i, j)$ má pár $(x_i, x_j)$ a vrátí 1, pokud $x_j < x_i$:

```
A=9  B=9 8 3 5 6   RANK: 0 1 1 1 1     (4 menších než 9)
A=8  B=9 8 3 5 6   RANK: 0 0 1 1 1     (3 menších)
A=3  B=9 8 3 5 6   RANK: 0 0 0 0 0     (0 menších)
A=5  B=9 8 3 5 6   RANK: 0 0 1 0 0     (1 menší)
A=6  B=9 8 3 5 6   RANK: 0 0 1 1 0     (2 menších)
```

**Fáze 2** — redukce po řádkách + 1:

```
RANK(1, 1) = 4 + 1 = 5   (9 jde na pozici 5)
RANK(2, 1) = 3 + 1 = 4   (8 jde na pozici 4)
RANK(3, 1) = 0 + 1 = 1   (3 jde na pozici 1)
RANK(4, 1) = 1 + 1 = 2   (5 jde na pozici 2)
RANK(5, 1) = 2 + 1 = 3   (6 jde na pozici 3)
```

**Fáze 3** — přesun:

```
Pozice: 1   2   3   4   5
Prvek:  3   5   6   8   9
```

### Analýza Enumeration Sort (mřížka)

- **Fáze 1**: distribuce trvá $O(\log n)$ díky propojení binárním stromem.
- **Fáze 2**: redukce po řádcích trvá $O(\log n)$.
- **Fáze 3**: přesun trvá $O(\log n)$ (opět skrz strom).

**Celkem**: $t(n) = O(\log n)$. **Extrémně rychlé.**

- $p(n) = n^2$ procesorů.
- $c(n) = O(n^2 \log n)$ — *velmi neoptimální z hlediska ceny* (sekvenční řešení má $O(n \log n)$).

### Diskuze

- Algoritmus patří mezi *nejrychlejší* paralelní řadicí algoritmy — dosahuje času $O(\log n)$.
- *Žádný* paralelní algoritmus na „rozumném" výpočetním modelu nemůže být asymptoticky rychlejší.
- *Plýtvá procesory* — počet $n^2$ je už na hranici praktické přijatelnosti.
- **Omezení**: vstupní posloupnost *nesmí obsahovat stejné prvky*. Jinak by pro shodné prvky vyšlo stejné pořadí RANK a algoritmus by je chtěl umístit na *tutéž* pozici. Řešení tohoto problému (workaround): použít dvojice *(hodnota, index)* a porovnávat je lexikograficky.

### Varianta B: Enumeration Sort na lineárním poli se sběrnicí

**Topologie**: $n$ lineárně propojených procesorů (každý se svým sousedem) **+ globální sběrnice**.

**Princip**: hodnoty *procházejí* polem ve dvou směrech:

- **Vstupní fáze**: hodnoty postupně vstupují do registru $X$ přes sběrnici a posouvají se zleva doprava po registrech $Y$ skrze lineární propojení. Každý uzel počítá, *kolik menších prvků už viděl* oproti *své* hodnotě, a výsledek ukládá do registru $C$.
- **Výstupní fáze**: po vyčerpání vstupu se každá hodnota přesune sběrnicí na pozici, kterou udává její registr $C$.

```
procedure ENUMERATION_SORT_LINEAR(x[1..n])
  (1) reset všech C registrů na 0
  (2) for k = 1 to 2n do
        if vstup není vyčerpán:
          vstupní prvek x_k jde do X_k (sběrnicí) a do Y_1 (lineárně)
          posun Y registrů doprava
        každý procesor s neprázdnými X a Y porovná, inkrementuje C
        if k > n: P_{k-n} pošle X po sběrnici do P_{C_{k-n}}, ten uloží do Z
  (3) v posledních n krocích posunout Z po sběrnici na výstup
```

### Analýza Enumeration Sort (lineární)

- $t(n) = O(n)$ (krok 2 trvá $2n$ cyklů a krok 3 dalších $n$ cyklů).
- $p(n) = n$ procesorů.
- $c(n) = O(n^2)$ — *nákladově neoptimální*.

**Předpoklady**:

- Sběrnice dokáže přenést hodnotu mezi libovolnými dvěma procesory v *konstantním* čase (jde o idealizaci).
- Vstup nesmí obsahovat stejné hodnoty (totéž omezení jako u mřížky).

## Porovnání

| Algoritmus | Topologie | Čas | Procesory | Cena | Nákladově optimální? |
| :--- | :--- | :---: | :---: | :---: | :---: |
| Sekv. merge sort | — | $O(n \log n)$ | 1 | $O(n \log n)$ | ✓ (referenční) |
| Odd-Even Transposition | lineární | $O(n)$ | $n$ | $O(n^2)$ | ✗ |
| Enumeration (mřížka) | $n \times n$ | $O(\log n)$ | $n^2$ | $O(n^2 \log n)$ | ✗ |
| Enumeration (lineární) | lin. + sběrnice | $O(n)$ | $n$ | $O(n^2)$ | ✗ |

**Závěr**:

- *Žádný* z těchto tří algoritmů není **nákladově optimální (cost-optimal)** — tedy součin počtu procesorů a času u žádného z nich nedosahuje optimálního $O(n \log n)$.
- *Enumeration na mřížce* nabízí *nejrychlejší* čas $O(\log n)$ — ovšem za cenu $n^2$ procesorů.
- *Odd-Even Transposition* se *snadno* implementuje v hardwaru (řadicí sítě).
- Nákladové optimality dosáhneme až s pokročilejšími algoritmy: [[merge-radici]] (Pipeline Merge Sort, Bucket Sort), [[radici-vyber]] (Median Finding and Splitting).

## Co dál

[[merge-radici]] probere řadicí algoritmy *založené na slučování*: **Bucket Sort** (strom s logaritmickým počtem listů, čas $O(n)$, cena $O(n \log n)$ — *nákladově optimální*), **Odd-Even Merge Sort** (Batcherova řadicí síť) a **Pipeline Merge Sort** (lineární řetězec slučovacích jednotek — opět *nákladově optimální*). [[radici-vyber]] probere algoritmy *Minimum Extraction Sort* a *Median Finding and Splitting* (paralelní quicksort).

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Akl, S.G.: *Parallel Sorting Algorithms* (Academic Press 1985); Akl, S.G.: *The Design and Analysis of Parallel Algorithms* (Prentice Hall 1989), kap. 4 (Sorting); Knuth, D.E.: *The Art of Computer Programming, Vol. 3: Sorting and Searching* (2. vyd., Addison-Wesley 1998), §5.3.4 (Networks for sorting); Quinn, M.J.: *Parallel Programming in C with MPI and OpenMP* (2003), kap. 14.*
