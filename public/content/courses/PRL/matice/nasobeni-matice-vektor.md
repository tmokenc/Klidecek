---
title: Násobení matice vektorem — lineární pole a strom
---

# Násobení matice vektorem

Předchozí kapitoly probraly *transpozici* a *plné násobení matic* — obě s kvadratickou až kubickou složitostí. **Násobení matice vektorem** ($M\cdot v$) je *jednodušší* operace s lineární *strukturou* — která dovoluje *cost-optimal* paralelizaci jak na *lineárním poli*, tak na *binárním stromě*. Je to nejčastěji prováděná lineárně-algebraická operace v praxi (každá vrstva neuronové sítě, každý iterativní solver, každá kompresní transformace).

## Definice

Pro matici $A$ velikosti $m \times n$ a vektor $u$ délky $n$:

::: math
v_i = \sum_{s=1}^{n} a_{is} \cdot u_s, \quad 1 \le i \le m
:::

Výsledný vektor $v$ má délku $m$.

### Sekvenční složitost

```
for i = 1 to m do
  v[i] ← 0
  for s = 1 to n do
    v[i] ← v[i] + a[i][s] * u[s]
```

**$T_\text{sekv} = O(m \cdot n)$** — musíme se dotknout *každého* prvku matice. Tato složitost je **optimal** — dolní mez $\Omega(mn)$, neboť máme $mn$ vstupních prvků.

## Lineární pole — systolic-like

### Topologie

**Lineární pole** $m$ procesorů $P_1, P_2, \dots, P_m$. Procesor $P_i$ obsahuje element $v_i$.

Vstup:

- Matice $A$ vstupuje *po řádcích* — řádek $i$ (prvky $a_{i1}, \dots, a_{in}$) je přiváděn do procesoru $P_i$.
- Vektor $u$ jako jediný *protéká* polem — $u_s$ vstupuje do $P_m$ a teče doleva; do $P_i$ dorazí ve stejném kroku jako $a_{is}$.

### Princip

Vektor $u$ a sloupce matice $A$ tečou skrz pole. V kroku, kdy procesor $P_i$ obdrží $a_{is}$ a $u_s$, je vynásobí a přičte k $v_i$.

```
procedure LINEAR_MV_MULT
  for i = 1 to m do in parallel
    v[i] ← 0
    while P_i přijímá a a u do
      v[i] ← v[i] + (a * u)
      if i > 1 then send u to P_{i-1}
    endwhile
```

::: svg "Násobení matice vektorem — vektor u teče lineárním polem procesorů"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.8" fill="var(--bg-card)">
    <rect x="380" y="80" width="50" height="40"/>
    <rect x="430" y="80" width="50" height="40"/>
    <rect x="480" y="80" width="50" height="40"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="405" y="100">P₁</text>
    <text x="405" y="116" font-size="9">v₁</text>
    <text x="455" y="100">P₂</text>
    <text x="455" y="116" font-size="9">v₂</text>
    <text x="505" y="100">P₃</text>
    <text x="505" y="116" font-size="9">v₃</text>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="10">
    <text x="35" y="50">a₁₁ a₁₂ a₁₃ a₁₄</text>
    <text x="35" y="100">a₂₁ a₂₂ a₂₃ a₂₄</text>
    <text x="35" y="150">a₃₁ a₃₂ a₃₃ a₃₄</text>
  </g>
  <g fill="var(--accent-line)" text-anchor="middle" font-size="10">
    <text x="180" y="180">u₁ u₂ u₃ u₄</text>
  </g>
  <g stroke="var(--accent)" stroke-width="0.8" fill="none" marker-end="url(#mva)">
    <line x1="90" y1="50" x2="375" y2="90"/>
    <line x1="90" y1="100" x2="375" y2="100"/>
    <line x1="90" y1="150" x2="375" y2="110"/>
  </g>
  <g stroke="var(--accent-line)" stroke-width="0.8" fill="none" marker-end="url(#mva2)">
    <line x1="220" y1="180" x2="500" y2="125"/>
  </g>
  <defs>
    <marker id="mva" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
    <marker id="mva2" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent-line)"/>
    </marker>
  </defs>
  <text x="180" y="40" fill="var(--accent)" font-size="10">řádky A → každému P_i</text>
  <text x="180" y="194" fill="var(--accent-line)" font-size="10">vektor u teče zprava doleva</text>
</svg>
:::

Vektor $u_s$ vstupuje do *posledního* procesoru $P_m$, ten ho použije a *pošle* dál doleva. Sekvenčně vstoupí každý $u_s$ do $P_m$ v různém kroku, takže každý procesor postupně zpracuje *všechny* sloupce.

### Analýza

- $u_1$ vstoupí v kroku 1 do $P_m$, dorazí do $P_1$ v kroku $m$.
- $u_n$ vstoupí v kroku $n$ do $P_m$, dorazí do $P_1$ v kroku $n + m - 1$.

**Čas**: $t(n) = m + n - 1 = O(m + n)$. Pro $m = n$: $t(n) = O(n)$.

- $p(n) = m$ procesorů.
- $c(n) = m \cdot (m + n - 1) = O(mn)$ pro $m = n$. **Cost-optimal!** Odpovídá sekvenčnímu $O(mn)$.

## Strom — paralelizovaná suma

### Idea

Lineární pole má dráhu $u_s$ skrz celé pole = sekvenční úzké hrdlo. **Stromová** topologie zaměňuje sekvenční tok za *paralelní sumu* — všechny členy $a_{is} u_s$ se spočítají *naráz*, pak se *redukcí stromem* sečtou.

### Topologie

**Binární strom** s $n$ listy a $n - 1$ vnitřních uzlů — celkem $2n - 1$ procesorů.

- Listové procesory $P_1, \dots, P_n$ provádějí **násobení**.
- Vnitřní procesory provádějí **sčítání** (redukci).

### Algoritmus

```
procedure TREE_MV_MULT(A, u, v)
  do steps 1 and 2 in parallel
  (1) for i = 1 to n do in parallel        # listy násobí
        for j = 1 to m do
          send u[i] * a[j][i] to parent
        endfor
      endfor
  (2) for i = n+1 to 2n-1 do in parallel    # vnitřní uzly sčítají
        while P_i receives two inputs do
          compute the sum
          if i < 2n-1 then send result to parent
                      else write result to v[j]
```

Pro každý řádek $j$ vektoru $v$:

- Listy paralelně vynásobí $u_i \cdot a_{ji}$.
- Vnitřní uzly stromem redukují tyto $n$ součinů → $v_j$.

### Analýza

- **Krok 1** (násobení): $O(m)$ pipeline — pro každý ze $m$ řádků jeden cyklus.
- **Krok 2** (redukce): $O(\log n)$ pro hloubku stromu, ale pipeline → $O(m - 1 + \log n)$.

**Čas**: $t(n) = m + \log n - 1 = O(m + \log n)$.

- $p(n) = 2n - 1$ procesorů.
- $c(n) = O((m + \log n)(2n - 1)) = O(mn + n \log n)$.

Pro $m = n$: $c(n) = O(n^2 + n \log n) = O(n^2)$. **Cost-optimal!**

## Porovnání

| Algoritmus | Topologie | Čas | Procesory | Cena | Cost-optimal? |
| :--- | :--- | :---: | :---: | :---: | :---: |
| Sekvenční | RAM | $O(mn)$ | 1 | $O(mn)$ | ✓ (referenční) |
| Lineární pole | $P_1, \dots, P_m$ | $O(m + n)$ | $m$ | $O(mn)$ | ✓ |
| Strom | $2n - 1$ uzlů | $O(m + \log n)$ | $2n - 1$ | $O(mn)$ | ✓ |

**Strom** je *rychlejší* za stejnou cenu — díky logaritmické redukci součinů. Pro velký $n$ je rozdíl podstatný.

## Praktická aplikace

- **Sparse matrix-vector multiplication (SpMV)**: ve vědeckých simulacích, ML, PageRank.
- **Iterativní solvery**: GMRES, Conjugate Gradient — opakované SpMV.
- **GPU CUDA** kernel pro `y = Ax`: každý warp/blok zpracuje jeden řádek; redukce přes warp shuffle.
- **MPI distributed**: matice rozdělena po řádkách mezi procesy; *allgather* vektoru $u$ + lokální SpMV.

V *PRAM* mřížkové analogii by SpMV vypadal podobně — jeden procesor na násobení, redukce stromem na sumu po řádkách. Ve skutečnosti to GPU dělá *přesně* takto.

## BLAS hierarchie

Standardní rozdělení paralelní lineární algebry (BLAS API, používané v cuBLAS, MKL, PBLAS):

- **BLAS Level 1**: vektor-vektor ($n$ flops) — vector ops na $O(n)$ procesorech v $O(\log n)$.
- **BLAS Level 2**: matice-vektor ($mn$ flops) — viz tato kapitola.
- **BLAS Level 3**: matice-matice ($mnk$ flops) — viz [[nasobeni-matic-mesh]], [[nasobeni-matic-cube]].

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Akl, S.G.: *The Design and Analysis of Parallel Algorithms* (Prentice Hall 1989), kap. 7.4; JáJá, J.: *An Introduction to Parallel Algorithms* (Addison-Wesley 1992), kap. 5; Golub, G.H., Van Loan, C.F.: *Matrix Computations* (4. vyd., Johns Hopkins 2013) — sekvenční referenční text; Bell, N., Garland, M.: „Implementing sparse matrix-vector multiplication on throughput-oriented processors" (SC09, [DOI 10.1145/1654059.1654078](https://doi.org/10.1145/1654059.1654078)) — GPU SpMV; Anderson, E. et al.: *LAPACK Users' Guide* (3. vyd., SIAM 1999), §3 (Performance).*
