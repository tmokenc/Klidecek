---
title: Násobení matic na hyperkrychli — O(log n) algoritmus
---

# Násobení matic na hyperkrychli (cube)

Předchozí kapitola ([[nasobeni-matic-mesh]]) ukázala, že na mřížce $n \times n$ je čas $O(n)$ *nejlepší možný* — kvůli boundary-only I/O. Tato kapitola probírá rychlejší algoritmus na **hyperkrychli** $n^3 = 2^{3q}$ procesorů, který dosahuje **$O(\log n)$** času. Algoritmus *kombinuje* známé komunikační primitivy: *broadcast* (distribuce dat), *paralelní násobení*, a *redukce* (akumulace $n$ součinů na jeden $c_{ij}$). Cena je $O(n^3 \log n)$ — *není* cost-optimal vůči sekvenčnímu $O(n^3)$, ale *neuvěřitelně rychlé*.

## Předpoklady

- Dvě čtvercové matice $A, B$ velikosti $n \times n$, kde $n = 2^q$.
- Hyperkostka s $N = n^3 = 2^{3q}$ procesory $P_0, P_1, \dots, P_{N-1}$.
- Adresování: procesor v pozici $(i, j, k)$ pro $0 \le i, j, k < n$, kde $r = i n^2 + j n + k$.
- Binární reprezentace indexu $r$: prvních $q$ bitů = $i$, prostředních $q$ = $j$, posledních $q$ = $k$.

### Inicializace dat

Vstupní data jsou jen v *řezu* $i = 0$ hyperkrychle:

- $P(0, j, k)$ má $a_{jk}$ a $b_{jk}$ ve svých registrech $A$ a $B$.
- Procesory s $i > 0$ mají *nuly*.

Cílem je, aby na konci procesor $P(i, j, k)$ pro libovolné $i$ obsahoval $c_{jk}$ (kde výsledek je v *jednom* z vrstev pro snadnost čtení).

## Algoritmus — tři fáze

::: math
\boxed{
\begin{array}{l}
\text{Fáze 1 (distribuce):} \quad A(i, j, k) \leftarrow a_{ji}, \quad B(i, j, k) \leftarrow b_{ik} \\[2pt]
\text{Fáze 2 (násobení):} \quad C(i, j, k) \leftarrow A(i, j, k) \cdot B(i, j, k) \\[2pt]
\text{Fáze 3 (redukce):} \quad c_{jk} \leftarrow \sum_{i=0}^{n-1} C(i, j, k)
\end{array}
}
:::

### Fáze 1 — distribuce dat (kroky 1–3)

**Krok 1 (broadcast po $i$-ose)**: data z $P(0, j, k)$ se zkopírují do *všech* procesorů $P(i, j, k)$ pro $i = 0, \dots, n - 1$.

Algoritmus: pro $m = 3q - 1$ down to $2q$ (tj. bity reprezentující $i$): každý procesor s daným bitem 0 zkopíruje svá data na souseda lišící se v bitu $m$ (kteří mají bit 1).

Trvá $q = \log n$ kroků (každý bit $i$).

Po této fázi: $A(i, j, k) = a_{jk}$ a $B(i, j, k) = b_{jk}$ pro všechna $i$.

**Krok 2 (přerozdělení A po $k$-ose)**: chceme, aby $A(i, j, k) = a_{ji}$ (ne $a_{jk}$).

Idea: na pozici $(i, j, k)$ chceme prvek, jehož sloupcový index v $A$ je *právě $i$*. Současně máme $a_{jk}$. Použijeme *swap přes dimenzi*: copy z $(i, j, i)$ do $(i, j, k)$.

Implementačně: pro $m = q - 1$ down to $0$ — bity reprezentující $k$ a *odpovídající* bity z $i$ — se mění tak, aby výsledek vrátil $a_{ji}$.

Trvá $q$ kroků.

**Krok 3 (přerozdělení B po $j$-ose)**: analogicky, chceme $B(i, j, k) = b_{ik}$ (ne $b_{jk}$).

Trvá $q$ kroků.

**Celkem fáze 1**: $3q = O(\log n)$ kroků.

### Fáze 2 — paralelní násobení (krok 4)

```
for r = 1 to N do in parallel
  C[r] ← A[r] * B[r]
```

Každý procesor *jediným násobením* vyrobí jeden ze $n^3$ součinů $a_{ji} \cdot b_{ik}$.

**Trvá $O(1)$ kroků**.

### Fáze 3 — redukce po $i$-ose (krok 5)

Sečíst $C(0, j, k) + C(1, j, k) + \dots + C(n-1, j, k) = c_{jk}$.

Klasická redukce stromem podél *prvních $q$ bitů* indexu:

```
for m = 2q to 3q - 1 do
  for r = 1 to N do in parallel
    if bit m of r is 0:
      C[r] ← C[r] + C[r XOR 2^m]
```

V iteraci $m$ procesory v polovině s bitem 0 přičtou hodnotu z partneru (s bitem 1).

**Trvá $q = \log n$ kroků**.

Výsledek: $C(0, j, k) = \sum_i C(i, j, k) = c_{jk}$ pro všechna $j, k$. V rovině $i = 0$ je tedy *kompletní* matice $C = AB$.

### Celková analýza

| Fáze | Kroky | Komentář |
| :--- | :---: | :--- |
| 1. Broadcast po $i$ | $q$ | dimenzionální zdvojnásobení |
| 2. Přerozdělit A po $k$ | $q$ | swap přes diagonálu |
| 3. Přerozdělit B po $j$ | $q$ | analogicky |
| 4. Násobení | 1 | paralelní MUL |
| 5. Redukce po $i$ | $q$ | stromová suma |

**Celkem**: $4q + 1 = O(\log n)$.

- $t(n) = O(\log n)$
- $p(n) = n^3$ procesorů
- $c(n) = O(n^3 \log n)$ — **NEoptimal** (sekv. $O(n^3)$, log faktor navíc).

::: svg "Cube matrix multiplication — 3 fáze distribuce + násobení + redukce"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="1" fill="var(--bg-card)">
    <rect x="40" y="50" width="120" height="120" rx="4"/>
    <rect x="200" y="50" width="120" height="120" rx="4"/>
    <rect x="380" y="50" width="120" height="120" rx="4"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-weight="600">
    <text x="100" y="40">Fáze 1: distribuce</text>
    <text x="260" y="40">Fáze 2: násobení</text>
    <text x="440" y="40">Fáze 3: redukce</text>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="100" y="75">A, B replikovány</text>
    <text x="100" y="92">přes osu i</text>
    <text x="100" y="115">A(i,j,k) ← a_ji</text>
    <text x="100" y="130">B(i,j,k) ← b_ik</text>
    <text x="100" y="160" fill="var(--accent)">O(log n)</text>
    <text x="260" y="100">C(i,j,k) ←</text>
    <text x="260" y="115" font-size="11">A(i,j,k) · B(i,j,k)</text>
    <text x="260" y="135">každý jeden součin</text>
    <text x="260" y="160" fill="var(--accent)">O(1)</text>
    <text x="440" y="100">c_jk ←</text>
    <text x="440" y="115" font-size="11">∑_i C(i,j,k)</text>
    <text x="440" y="135">stromová suma</text>
    <text x="440" y="160" fill="var(--accent)">O(log n)</text>
  </g>
</svg>
:::

## Diskuse

### Síla a slabiny cube algoritmu

| Aspekt | Hodnocení |
| :--- | :--- |
| Čas | **Vynikající** — $O(\log n)$ |
| Procesory | **Velmi mnoho** — $n^3$ (pro $n = 1024$: 1 miliarda) |
| Cena | **Suboptimal** — $O(n^3 \log n)$ |
| Topologie | Hypercube — *šíření* logaritmické, ale stupeň uzlu *roste* |
| Praktická realizace | Cluster s InfiniBand; čistá hyperkrychle fyzicky neexistuje |

**Cube je teoretický limit** — dosahuje nejlepšího známého času, ale za cenu velkého počtu procesorů. V praxi se preferuje *block matrix multiplication* (cluster nebo GPU) s $O(p)$ procesy, kde $p \le n^2$.

### Block matrix multiplication (praktická varianta)

Místo $n^3$ procesorů máme $p = q^2$ procesorů uspořádaných do *mřížky* $q \times q$. Každý procesor drží blok $n/q \times n/q$ matice. Použijeme **Cannon's algorithm** nebo **Fox's algorithm** — *systolic-like* s blokovou granularitou.

- $t(n) = O(n^3 / p)$ + $O(n^2 / \sqrt p)$ komunikace.
- Cost-optimal pro $p \ll n^2$.

Toto je *standard* v praxi (MPI, PBLAS, ScaLAPACK).

### Fast matrix multiplication algoritmy

**Strassen** ($O(n^{2.807})$) lze paralelizovat — rekurzivně rozdělit matici na 4 čtvrtiny, vykonat 7 (místo 8) podproblémů paralelně. **Strassen na hyperkrychli**: $O(\log^2 n)$ čas, $O(n^{2.807})$ procesorů.

Coppersmith-Winograd a novější algoritmy mají *astronomické* konstanty — *nikdy* nejsou rychlejší pro praktická $n < 10^{20}$. Standardní knihovny používají **Strassen** pro $n > 100$ nebo *plain* $O(n^3)$ pro menší.

## Souhrn všech algoritmů pro matrix multiplication

| Algoritmus | Model | Čas | Procesory | Cena |
| :--- | :--- | :---: | :---: | :---: |
| Sekvenční (standard) | RAM | $O(n^3)$ | 1 | $O(n^3)$ |
| Sekvenční (Strassen) | RAM | $O(n^{2.807})$ | 1 | $O(n^{2.807})$ |
| Mesh multiplication | mřížka $n^2$ | $O(n)$ | $n^2$ | $O(n^3)$ |
| Cube multiplication | hyperkrychle | $O(\log n)$ | $n^3$ | $O(n^3 \log n)$ |
| Cannon's (block) | mřížka $q^2$ | $O(n^3/q^2 + n^2/q)$ | $q^2$ | $\sim O(n^3)$ |
| Strassen na cube | hyperkrychle | $O(\log^2 n)$ | $n^{2.807}$ | $O(n^{2.807} \log^2 n)$ |

**Praktická volba**:

- **Cluster HPC**: Cannon's nebo Fox's — *block matrix* s $\sqrt p \times \sqrt p$ mřížkou.
- **GPU**: cuBLAS / Tensor Cores — *systolic-like* s blokem 4×4 nebo 16×16.
- **Multi-core CPU**: BLAS (Intel MKL, OpenBLAS) — *cache-aware* blocking.
- **FPGA / TPU**: systolic-array (mesh multiplication s blokem).

## Co dál

[[nasobeni-matice-vektor]] probere zjednodušený podproblém — **matice krát vektor** (jen jeden řádek nebo sloupec). Algoritmy: lineární pole (O(m+n) čas, cost-optimal) a stromová struktura (O(m + log n) čas, cost-optimal).

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Akl, S.G.: *The Design and Analysis of Parallel Algorithms* (Prentice Hall 1989), kap. 7.3.2; Dekel, E., Nassimi, D., Sahni, S.: „Parallel matrix and graph algorithms" (SIAM J. Comput. 10(4), 1981); Cannon, L.E.: *A cellular computer to implement the Kalman filter algorithm* (Ph.D. thesis, Montana State U., 1969) — Cannon's algorithm; Fox, G.C. et al.: *Solving Problems on Concurrent Processors* (Prentice Hall 1988); Strassen, V.: „Gaussian elimination is not optimal" (Numer. Math. 13(4), 1969); Grama et al.: *Introduction to Parallel Computing* (2003), kap. 8 (Dense Matrix Algorithms).*
