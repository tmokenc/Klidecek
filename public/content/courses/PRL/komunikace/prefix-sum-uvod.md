---
title: Suma prefixů (scan) — definice a použití
---

# Suma prefixů — fundamentální stavební blok

Předchozí kapitola ([[broadcast-redukce]]) zavedla redukci — agregaci $\bigoplus_{i=1}^{N} a_i$ do *jednoho* výsledku. **Suma prefixů** (anglicky *all-prefix-sums*, *scan*) je *parciální* verze: vrací **každý** mezisoučet $a_1, a_1 \oplus a_2, \dots, a_1 \oplus \cdots \oplus a_N$. Suma prefixů je *jeden z nejdůležitějších paralelních primitivů* — slouží jako stavební blok pro paralelní *radix-sort*, *quicksort*, *lexikální analýzu*, *packing*, *line-of-sight*, *carry-look-ahead sčítačku* a mnoho dalšího. V této kapitole definujeme operaci, ukážeme typické *aplikace*, a porovnáme tři varianty: **scan**, **prescan** a **reduce**.

## Definice

**Vstup**: binární *asociativní* operátor $\oplus$ a uspořádaná posloupnost $\langle a_0, a_1, \dots, a_{n-1}\rangle$.

**Výstup (scan, inclusive)**: posloupnost

::: math
\langle a_0,\ a_0 \oplus a_1,\ a_0 \oplus a_1 \oplus a_2,\ \dots,\ a_0 \oplus a_1 \oplus \cdots \oplus a_{n-1} \rangle
:::

**Příklad** (operátor $\oplus = +$):

| | $a_0$ | $a_1$ | $a_2$ | $a_3$ | $a_4$ | $a_5$ | $a_6$ | $a_7$ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Vstup | 3 | 1 | 7 | 0 | 4 | 1 | 6 | 3 |
| Scan (inclusive) | 3 | 4 | 11 | 11 | 15 | 16 | 22 | 25 |
| Prescan (exclusive) | 0 | 3 | 4 | 11 | 11 | 15 | 16 | 22 |
| Reduce | | | | | | | | 25 |

### Tři varianty

- **Scan** (inclusive scan, *all-prefix-sums*): výstup $i$ obsahuje $a_0 \oplus a_1 \oplus \cdots \oplus a_i$ (zahrnuje sebe).
- **Prescan** (exclusive scan, *exscan*): výstup $i$ obsahuje $a_0 \oplus a_1 \oplus \cdots \oplus a_{i-1}$. Pozice 0 dostane *neutrální prvek* $I$ operátoru $\oplus$ (např. 0 pro $+$, 1 pro $\times$, $\infty$ pro $\min$).
- **Reduce**: výstupem je *poslední* prvek scanu, tj. $a_0 \oplus a_1 \oplus \cdots \oplus a_{n-1}$ — agregace přes celou posloupnost.

::: svg "Scan, prescan a reduce — všechny tři odvozené z téhož výpočtu"
<svg viewBox="0 0 540 170" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="50" y="20" width="40" height="22"/>
    <rect x="92" y="20" width="40" height="22"/>
    <rect x="134" y="20" width="40" height="22"/>
    <rect x="176" y="20" width="40" height="22"/>
    <rect x="218" y="20" width="40" height="22"/>
    <rect x="260" y="20" width="40" height="22"/>
    <rect x="302" y="20" width="40" height="22"/>
    <rect x="344" y="20" width="40" height="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="70" y="34">3</text>
    <text x="112" y="34">1</text>
    <text x="154" y="34">7</text>
    <text x="196" y="34">0</text>
    <text x="238" y="34">4</text>
    <text x="280" y="34">1</text>
    <text x="322" y="34">6</text>
    <text x="364" y="34">3</text>
  </g>
  <text x="425" y="34" fill="var(--text-muted)" font-size="9">vstup</text>
  <g stroke="var(--accent)" stroke-width="1" fill="none">
    <rect x="50" y="60" width="40" height="22"/>
    <rect x="92" y="60" width="40" height="22"/>
    <rect x="134" y="60" width="40" height="22"/>
    <rect x="176" y="60" width="40" height="22"/>
    <rect x="218" y="60" width="40" height="22"/>
    <rect x="260" y="60" width="40" height="22"/>
    <rect x="302" y="60" width="40" height="22"/>
    <rect x="344" y="60" width="40" height="22"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="10">
    <text x="70" y="74">3</text>
    <text x="112" y="74">4</text>
    <text x="154" y="74">11</text>
    <text x="196" y="74">11</text>
    <text x="238" y="74">15</text>
    <text x="280" y="74">16</text>
    <text x="322" y="74">22</text>
    <text x="364" y="74">25</text>
  </g>
  <text x="425" y="74" fill="var(--accent)" font-size="9">SCAN</text>
  <g stroke="var(--accent-line)" stroke-width="1" fill="none">
    <rect x="50" y="100" width="40" height="22"/>
    <rect x="92" y="100" width="40" height="22"/>
    <rect x="134" y="100" width="40" height="22"/>
    <rect x="176" y="100" width="40" height="22"/>
    <rect x="218" y="100" width="40" height="22"/>
    <rect x="260" y="100" width="40" height="22"/>
    <rect x="302" y="100" width="40" height="22"/>
    <rect x="344" y="100" width="40" height="22"/>
  </g>
  <g fill="var(--accent-line)" text-anchor="middle" font-size="10">
    <text x="70" y="114">0</text>
    <text x="112" y="114">3</text>
    <text x="154" y="114">4</text>
    <text x="196" y="114">11</text>
    <text x="238" y="114">11</text>
    <text x="280" y="114">15</text>
    <text x="322" y="114">16</text>
    <text x="364" y="114">22</text>
  </g>
  <text x="425" y="114" fill="var(--accent-line)" font-size="9">PRESCAN</text>
  <g stroke="var(--text)" stroke-width="1" fill="var(--bg-card)">
    <rect x="344" y="140" width="40" height="22"/>
  </g>
  <text x="364" y="154" text-anchor="middle" font-weight="600" fill="var(--text)">25</text>
  <text x="425" y="154" fill="var(--text-muted)" font-size="9">REDUCE</text>
</svg>
:::

Vztah: **scan $i$** = **prescan $i$** $\oplus a_i$. Reduce = poslední prvek scanu.

## Asociativita — *jediný* požadavek

Operátor $\oplus$ musí být **asociativní**: $(a \oplus b) \oplus c = a \oplus (b \oplus c)$. *Komutativita není potřeba*.

Asociativita umožňuje *libovolné závorkování* — což je *jediný* důvod, proč paralelní (stromový) výpočet dává stejný výsledek jako sekvenční.

### Praktické asociativní operátory

| Operátor | Neutrální | Vstup |
| :--- | :---: | :--- |
| $+$ (sum) | 0 | celá čísla, reálná, vektory |
| $\times$ (product) | 1 | čísla |
| $\max$ | $-\infty$ | čísla |
| $\min$ | $+\infty$ | čísla |
| $\text{AND}$ | $\text{true}$ | booleany |
| $\text{OR}$ | $\text{false}$ | booleany |
| $\text{XOR}$ | 0 | bity |
| **konkatenace** | $\varepsilon$ | řetězce — *není komutativní*, ale je asociativní |
| **maticové násobení** | $I$ | matice — *není komutativní*, ale je asociativní |

Pro neutrální prvek — *nutný pro prescan*. Pro scan stačí asociativita.

## Sekvenční verze — referenční

```
procedure ALLSUMS(In, Out)
  sum ← In[0]
  Out[0] ← sum
  for i ← 1 to n-1 do
    sum ← sum ⊕ In[i]
    Out[i] ← sum
```

**Sekvenční čas**: $T_\text{sekv} = O(n)$.

Paralelní algoritmus s $O(\log n)$ časem viz [[prefix-sum-algoritmus]].

## Použití suma prefixů

Suma prefixů je *překvapivě univerzální* — řada *nezjevně paralelních* algoritmů se na ni redukuje. Vybrané příklady:

### 1. Packing — odstranění označených prvků

**Úloha**: dán vektor $A[0..n-1]$ a vektor *bitových příznaků* $F[0..n-1]$, kde $F[i] = 1$ znamená *„uchovat"*, $F[i] = 0$ *„odstranit"*. Cílem je vektor $B$ obsahující jen uchované prvky na *prvních* pozicích.

**Algoritmus**:

1. Spočítáme **prescan** vektoru $F$ s operátorem $+$ — výsledek $P[i]$ je *cílová pozice* prvku $i$ ve výstupu (kolik předchozích uchovaných je před ním).
2. Pro každý $i$ s $F[i] = 1$ zapíšeme $A[i]$ na pozici $P[i]$ ve výstupu.

**Čas**: $O(\log n)$ paralelně.

**Hardware podpora**: instrukce **VCOMPRESS** v AVX-512 (Intel) dělá packing 8 nebo 16 prvků v jednom taktu.

### 2. Radix sort — split operace

**Bitový radix sort**: v každém kroku se prvky rozdělí podle 1 bitu — *nulové* vepředu, *jedničkové* vzadu. Klíčová operace **split**:

- Pro prvky s bitem 0: pozice = prescan s $+$ nad *negovaným* vektorem bitů.
- Pro prvky s bitem 1: pozice = $n - \text{scan nad reverzním vektorem}$.

Každý krok split: $O(\log n)$ paralelně. Pro $\log K$ bitů klíčů: celkem $O(\log K \cdot \log n)$. Klasický paralelní *radix sort* (viz topic Paralelní třídění).

### 3. Quicksort — segmentovaný scan

Paralelní quicksort využívá **segmentovaný scan** — scan, kde se vstup *resetuje* na hranicích segmentů (každý segment dělá svůj vlastní scan). Při dělení podle pivota se každý segment dále dělí, vše paralelně v $O(\log n)$ na úroveň.

### 4. Carry-look-ahead binární sčítačka

**Úloha**: sečíst dvě $n$-bitové binární čísla $X = x_{n-1} \dots x_0$ a $Y = y_{n-1} \dots y_0$.

Sekvenčně: $O(n)$ — postupně se generují bity přenosu $c_i$. Paralelně: vyřešit přenos pomocí scanu.

**Idea**: každá bitová pozice $i$ má 3 stavy z hlediska přenosu:

- **Generate** ($g$): $x_i = 1 \land y_i = 1$ — generuje carry bez ohledu na vstup.
- **Stop** ($s$): $x_i = 0 \land y_i = 0$ — pohlcuje carry.
- **Propagate** ($p$): jinak — propaguje vstupní carry.

Definujeme operátor $\diamond$ nad $\{g, s, p\}$ s asociativitou. **Scan** dá všechny carry bity v $O(\log n)$. Sčítání pak v $O(\log n)$ celkem — hardware carry-look-ahead adder v každém moderním CPU.

### 5. Line of sight (viditelnost terénu)

**Úloha**: dán terén (výškopisná mřížka) a pozorovací bod; zjistit, které body podél paprsku jsou *viditelné* (žádný předcházející bod *nemá větší úhel*).

**Algoritmus**:

1. Spočítáme úhel $\alpha_i = \arctan((\text{výška}_i - \text{výška}_0) / i)$ pro každý bod.
2. **Prescan s operátorem $\max$**: $M[i] = \max_{j < i} \alpha_j$ = maximální úhel mezi pozorovatelem a $i$.
3. Bod $i$ je viditelný $\iff \alpha_i > M[i]$.

**Čas**: $O(\log n)$ paralelně místo $O(n)$ sekvenčně.

### 6. Lexikální analýza, parsing

Tokenizace a *table-driven lex* analyzéry lze vyjádřit pomocí scanu, kde operátor je *maticové násobení* přechodových matic stavového automatu. To umožňuje paralelní lexikální analýzu textových souborů na GPU.

### 7. Označování komponent v obrázku

**Connected components labeling** ve 2D obrázku: pro každý pixel přiřadit *unikátní identifikátor* spojité oblasti. Paralelní algoritmus využívá scan nad indexy řádek; v $O(\log n)$ se sloučí labely sousedních pixelů.

::: viz prefix-sum-uvod "Vyber aplikaci: základ (scan / prescan / reduce), packing (komprese podle flagů), nebo line-of-sight (viditelnost terénu pomocí prescan-max)."
:::

## Segmentovaný scan

**Segmentovaný scan** je scan, kde *vstupní vektor je rozdělen do segmentů* značkami (flag vektor $F$). Operace probíhá *nezávisle v každém segmentu*.

**Vstup**:

- Vektor hodnot $a = [a_0, a_1, \dots, a_{n-1}]$.
- Vektor značek $f = [f_0, f_1, \dots, f_{n-1}]$ kde $f_i = 1$ označuje *začátek* nového segmentu.

**Výstup**: $s = [s_0, s_1, \dots, s_{n-1}]$, kde $s_i$ = scan svého segmentu od posledního restartu.

**Příklad** ($\oplus = +$):

```
a = [5  1  3  4  3  9  2  6]
f = [1  0  1  0  0  0  1  0]    (segmenty: {5,1}, {3,4,3,9}, {2,6})
s = [5  6  3  7 10 19  2  8]    (každý segment scanován zvlášť)
```

S operátorem $\max$:

```
s = [5  5  3  4  4  9  2  6]
```

Implementace: standardní up-sweep/down-sweep algoritmus s *modifikovaným operátorem* — pokud druhý operand začíná segmentem, *resetuje*. Čas $O(\log n)$.

Segmentovaný scan je *klíčový* pro paralelní quicksort, BFS, sparse matrix operations.

## Použití v knihovnách

- **MPI**: `MPI_Scan(sendbuf, recvbuf, count, datatype, op, comm)` — inclusive scan napříč MPI procesy. `MPI_Exscan` exclusive.
- **CUDA Thrust**: `thrust::inclusive_scan`, `thrust::exclusive_scan`.
- **MATLAB**: `cumsum(x)` = inclusive scan s $+$; `cummax`, `cummin` analogicky.
- **NumPy**: `np.cumsum`, `np.cumprod`.
- **C++ STL**: `std::inclusive_scan`, `std::exclusive_scan` (C++17).
- **Haskell**: `scanl1`, `scanr` (a `foldl1` pro reduce).

## Co dál

[[prefix-sum-algoritmus]] probere konkrétní *paralelní algoritmus* — **up-sweep + down-sweep** (Blelloch 1990) s časem $O(\log n)$ a cenou $O(n)$ (cost-optimal). Ukáže také *segmentovanou* variantu a varianty na *mřížce* ($\sqrt n$ kroků) a *hyperkrychli* ($\log n$ kroků).

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Blelloch, G.E.: „Prefix Sums and Their Applications" in *Synthesis of Parallel Algorithms* (Morgan Kaufmann 1993, Reif ed.), kap. 1 ([online verze CMU](https://www.cs.cmu.edu/~guyb/papers/Ble93.pdf)); Blelloch, G.E.: *Vector Models for Data-Parallel Computing* (MIT Press 1990); Sengupta, S., Harris, M., Garland, M.: „Efficient parallel scan algorithms for GPUs" (NVIDIA Tech. Report NVR-2008-003, 2008); Hillis, W.D., Steele, G.L.: „Data parallel algorithms" (Comm. ACM 29(12), 1986, [DOI 10.1145/7902.7903](https://doi.org/10.1145/7902.7903)); Wikipedia: [Prefix sum](https://en.wikipedia.org/wiki/Prefix_sum) (reference s odkazy na hardware podporu AVX).*
