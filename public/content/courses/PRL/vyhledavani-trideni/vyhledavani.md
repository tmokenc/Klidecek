---
title: Paralelní vyhledávání — neseřazené, N-ární, stromové
---

# Paralelní vyhledávání

Předchozí topic ([[broadcast-redukce]], [[prefix-sum-uvod]]) dal stavební bloky kolektivní komunikace. Aplikujme je teď na *vyhledávací* úlohu — jednu z nejzákladnějších operací nad daty. Tato kapitola probírá tři varianty: **vyhledávání v neseřazené posloupnosti** (PRAM EREW/CREW/CRCW), **N-ární vyhledávání v seřazené posloupnosti** (CREW), a **vyhledávání na stromě procesorů**. Cílem je porovnat *cenu* (cost) různých modelů a topologií a ukázat, kdy je který přístup *cost-optimal*.

## Úloha vyhledávání

**Vstup**: posloupnost $X = \langle x_1, x_2, \dots, x_n \rangle$ a hodnota $x$.

**Výstup**: index $k$ takový, že $x_k = x$, nebo $0$ pokud $x \notin X$.

**Sekvenční horní meze**:

- $X$ *neseřazené*: $T_\text{sekv} = O(n)$ — lineární průchod.
- $X$ *seřazené*: $T_\text{sekv} = O(\log n)$ — binární vyhledávání.

Sekvenční dolní meze (pro porovnávací model) jsou stejné. Paralelní algoritmy mohou *čas* zlepšit (rychlejší odpověď), ale ne *cenu* lépe než sekvenční (kvůli Brentově teorému).

## Vyhledávání v neseřazené posloupnosti

S $N$ procesory rozdělíme posloupnost na $N$ bloků po $n/N$ prvcích, každý procesor *sekvenčně* prohledá svůj blok, výsledek sloučíme.

```
procedure SEARCH(S[1..n], x, N)
  (1) for i = 1 to N do in parallel
        read x                          // distribuce hodnoty x
  (2) for i = 1 to N do in parallel
        S_i ← S[(i-1)(n/N)+1 .. i(n/N)]
        SEQUENTIAL_SEARCH(S_i, x, k_i)  // lokální hledání
  (3) for i = 1 to N do in parallel
        if k_i > 0 then k ← k_i         // sloučení výsledků
```

### Analýza pro tři PRAM varianty

| Model | Krok 1 (broadcast x) | Krok 2 (lokální) | Krok 3 (slučení) | Celkový čas | Cena |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **EREW** | $O(\log N)$ | $O(n/N)$ | $O(\log N)$ | $O(\log N + n/N)$ | $O(N \log N + n)$ |
| **CREW** | $O(1)$ | $O(n/N)$ | $O(\log N)$ | $O(\log N + n/N)$ | $O(N \log N + n)$ |
| **CRCW** | $O(1)$ | $O(n/N)$ | $O(1)$ | $O(n/N)$ | $O(n)$ |

**Klíčové pozorování**:

- Na **EREW** a **CREW** je výsledek slučován redukcí (logaritmický strom), proto třetí krok $O(\log N)$.
- Na **CRCW** se výsledek slučuje jediným paralelním zápisem (COMMON: každý zapisuje *svůj* index, výsledek je libovolný; PRIORITY: nejmenší index vyhrává) — $O(1)$.
- **CRCW je cost-optimal**: cena $O(n) = T_\text{sekv}$. EREW/CREW *nejsou* — extra faktor $N \log N$.

Pro $N = n/\log n$ procesorů na EREW/CREW: cena $O(n + n) = O(n)$ — cost-optimal také.

## N-ární vyhledávání v seřazené posloupnosti

Pokud je $S$ seřazené, lze paralelizovat *binární* vyhledávání: místo dvou dělení (sekvenční) máme $N + 1$ pásem.

**Princip**: zvolíme $N$ pozic $j_1 < j_2 < \dots < j_N$ rovnoměrně rozložených. Procesor $P_i$ porovná $x$ s $s_{j_i}$. Z $N$ výsledků (každý: „menší" nebo „větší") určíme, ve kterém z $N+1$ pásem se $x$ může nacházet. Opakujeme rekurzivně.

```
procedure N_ARY_SEARCH(S, x, N)
  q ← 1; r ← n
  while q ≤ r do
    g ← number of remaining steps
    for i = 1 to N do in parallel
      j_i ← q - 1 + i · (N+1)^{g-1}
      if s[j_i] = x then return j_i
      c_i ← (s[j_i] < x) ? "right" : "left"
    endfor
    // Sloučit c_i a upravit q, r podle, ve kterém pásmu je x
    (q, r) ← najít nový rozsah dle hranic změny c_i
```

### Analýza

Po každém kroku se rozsah zmenší $(N+1)$-krát. Pro nalezení v $n$-prvkové posloupnosti je tedy potřeba

::: math
g = \left\lceil \frac{\log(n+1)}{\log(N+1)} \right\rceil \quad\text{kroků.}
:::

- **Čas**: $t(n) = O\!\left(\log_{N+1} n\right) = O\!\left(\dfrac{\log n}{\log N}\right)$.
- **Cena**: $c(n) = N \cdot t(n) = O\!\left(N \log_{N+1} n\right) = O\!\left(\dfrac{N \log n}{\log N}\right)$.

Pro $N = 2$ ($(N+1)$-ární = ternární): $t = O(\log_3 n)$ — *jen mírně* lepší než binární $O(\log_2 n)$.

Pro $N = n^{1/2}$: $t = O(\log_{\sqrt n} n) = O(2)$ — *konstantní* počet kroků, ale s $\sqrt n$ procesory.

**Cena není cost-optimal** — sekvenční $O(\log n)$ vs paralelní $O(N \log_{N+1} n)$ s extra faktorem $N / \log N$.

### Příklad — hledání 45 v $S$ s 15 prvky, $N = 3$ procesory

$g = \lceil \log_4 16 \rceil = 2$ kroky.

```
S = [1, 4, 6, 9, 10, 11, 13, 14, 15, 18, 20, 23, 32, 45, 51]
hledáme x = 45

Krok 1: q = 1, r = 15, g = 2; pozice j_i = i · 4 = 4, 8, 12
  S[4]=9, S[8]=14, S[12]=23 — všichni < 45 → x je za pozicí 12
  Nový rozsah: q = 13, r = 15

Krok 2: g = 1; pozice j_i = 12 + i = 13, 14, 15
  S[13]=32 < 45, S[14]=45 = x → nalezeno! Index 14.
```

Použití **CREW PRAM** — všichni čtou *téhož* $x$ a *různé* $S[j_i]$.

## Vyhledávání na stromě procesorů

**Topologie**: binární strom s $2n - 1$ procesory. Listy obsahují prvky pole, vnitřní uzly slouží jako *broadcast/redukce*.

```
procedure TREE_SEARCH(x)
  (1) kořen načte hledanou hodnotu x a předá ji synům
      (každý vnitřní uzel propaguje k synům)        // broadcast: O(log n)
  (2) každý list porovná svou hodnotu s x → 0 nebo 1  // O(1)
  (3) každý vnitřní uzel spočte OR dvou synů a předá výš
      kořen obdrží: 0 = nenalezeno, 1 = nalezeno   // redukce: O(log n)
```

### Analýza

- $t(n) = O(\log n)$ (sečteno: $\log n + 1 + \log n$).
- $p(n) = 2n - 1$ (počet uzlů stromu).
- $c(n) = O(n \log n)$ — *není* cost-optimal (extra faktor $\log n$ nad sekvenční $O(n)$).

**Použitelnost**: typicky když je strom *fyzicky* k dispozici (tree-connected machines) nebo když chceme *velmi malý čas* za cenu plýtvání procesory.

Pokud chceme i *pozici* nalezeného prvku, nikoli jen *existenci*: každý list vrátí *svůj index* nebo $0$; vnitřní uzly přepošlou *nenulový* index nahoru.

## Souhrnná tabulka

| Vyhledávání | Model / Topologie | Čas | Procesory | Cena | Cost-optimal? |
| :--- | :--- | :---: | :---: | :---: | :---: |
| Sekvenční (neseřaz.) | — | $O(n)$ | 1 | $O(n)$ | ✓ |
| Sekvenční (seřaz.) | — | $O(\log n)$ | 1 | $O(\log n)$ | ✓ |
| Neseřaz. paral. | EREW/CREW | $O(\log N + n/N)$ | $N$ | $O(N \log N + n)$ | jen pro $N \le n/\log n$ |
| Neseřaz. paral. | CRCW | $O(n/N)$ | $N$ | $O(n)$ | ✓ |
| N-ární seřaz. | CREW PRAM | $O(\log_{N+1} n)$ | $N$ | $O(N \log_{N+1} n)$ | ✗ |
| Tree search | binární strom | $O(\log n)$ | $2n-1$ | $O(n \log n)$ | ✗ |

**Volba podle scénáře**:

- Velký $n$, *vícenásobné* hledání → CRCW broadcast + lokální sekv.
- Real-time (latency-critical) → $N$-ární CREW s velkým $N$, nebo tree search.
- Standardní cluster (≈ EREW) → broadcast + lokální + redukce.

## Co dál

[[splitting-select]] zobecní vyhledávání na **paralelní rozdělení** (splitting) — rozdělit posloupnost na 3 části vůči pivotu — a **k-tý nejmenší prvek / medián** (parallel select). Tyto operace jsou *stavební bloky* pro paralelní *quicksort* a *median-based sort*. [[transposition-enumeration]], [[merge-radici]] a [[radici-vyber]] potom probrají *konkrétní* paralelní řadicí algoritmy.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Akl, S.G.: *The Design and Analysis of Parallel Algorithms* (Prentice Hall 1989), kap. 5 (Searching); JáJá, J.: *An Introduction to Parallel Algorithms* (Addison-Wesley 1992), kap. 3.2; Grama et al.: *Introduction to Parallel Computing* (2. vyd. 2003), kap. 9.4; Quinn, M.J.: *Parallel Programming in C with MPI and OpenMP* (2003), kap. 14.*
