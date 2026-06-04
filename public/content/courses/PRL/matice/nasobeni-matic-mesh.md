---
title: Násobení matic na mřížce — systolický algoritmus
---

# Násobení matic na mřížce

Předchozí kapitola ([[transpozice]]) ukázala, jak topologie ovlivňuje *cenu* maticových operací. **Násobení matic** je *nejdůležitější* lineárně-algebraická operace — sloučí v sobě sčítání a násobení v dvojitém cyklu. Tato kapitola probírá *klasický* paralelní algoritmus na mřížce — *systolic-like* pohyb dat, kde matice „protékají" mřížkou procesorů. Algoritmus je *elegantní*, ale **není cost-optimal**; v další kapitole ([[nasobeni-matic-cube]]) ukážeme rychlejší alternativu.

## Definice násobení

Pro matice $A$ velikosti $m \times n$ a $B$ velikosti $n \times k$ je *součin* $C = AB$ velikosti $m \times k$ s prvky:

::: math
c_{ij} = \sum_{s=1}^{n} a_{is} \cdot b_{sj}, \quad 1 \le i \le m,\ 1 \le j \le k
:::

### Sekvenční složitost

Standardní algoritmus (tři vnořené smyčky):

```
for i = 1 to m do
  for j = 1 to k do
    c[i][j] ← 0
    for s = 1 to n do
      c[i][j] ← c[i][j] + a[i][s] * b[s][j]
```

- **Standardní**: $O(n^3)$ pro $m = n = k$.
- **Strassen 1969**: $O(n^{\log_2 7}) \approx O(n^{2.807})$ — rekurzivní rozdělení.
- **Coppersmith-Winograd & následníci**: $O(n^{2.371552})$ — *teoretická* hranice (aktuální rekord, Williams et al. 2024). Konstanty obrovské; v praxi se nepoužívá.
- **Dolní mez**: $\Omega(n^2)$ (musíme přečíst $n^2$ vstupů a zapsat $n^2$ výstupů).

Optimální složitost není známa — gap mezi $n^{2.37}$ a $n^2$ je *otevřený problém*. Pro analýzu paralelních algoritmů se *referenčně* používá $O(n^3)$.

## Mesh multiplication — systolic-like

### Topologie

**Mřížka** $m \times k$ procesorů $P(i, j)$, lokální paměť per procesor. *Hraniční* procesory v 1. sloupci a 1. řádce přijímají vstup; ostatní jen *posílají* dál.

### Princip — datový tok

Řádek $i$ matice $A$ vstupuje do procesoru $P(i, 1)$. Sloupec $j$ matice $B$ vstupuje do procesoru $P(1, j)$. **Skupinky se posouvají v čase** tak, aby:

- $a_{is}$ dorazí do $P(i, j)$ ve stejném čase jako $b_{sj}$.
- $P(i, j)$ je vynásobí, přičte k běžnému $c_{ij}$, a *pošle* $a$ doprava (do $P(i, j+1)$) a $b$ dolů (do $P(i+1, j)$).

Aby se synchronizace zachovala, řádek $i$ matice $A$ *zaostává* o jeden krok za řádkem $i - 1$. Podobně sloupec $j$ matice $B$ zaostává za sloupcem $j - 1$.

::: svg "Mesh matrix multiplication — matice tečou do mřížky procesorů"
<svg viewBox="0 0 540 270" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.8" fill="var(--bg-card)">
    <rect x="180" y="80" width="40" height="40"/>
    <rect x="220" y="80" width="40" height="40"/>
    <rect x="260" y="80" width="40" height="40"/>
    <rect x="180" y="120" width="40" height="40"/>
    <rect x="220" y="120" width="40" height="40"/>
    <rect x="260" y="120" width="40" height="40"/>
    <rect x="180" y="160" width="40" height="40"/>
    <rect x="220" y="160" width="40" height="40"/>
    <rect x="260" y="160" width="40" height="40"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="200" y="104">c₁₁</text>
    <text x="240" y="104">c₁₂</text>
    <text x="280" y="104">c₁₃</text>
    <text x="200" y="144">c₂₁</text>
    <text x="240" y="144">c₂₂</text>
    <text x="280" y="144">c₂₃</text>
    <text x="200" y="184">c₃₁</text>
    <text x="240" y="184">c₃₂</text>
    <text x="280" y="184">c₃₃</text>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="10">
    <text x="200" y="50">b₁₁</text>
    <text x="200" y="35">b₁₂</text>
    <text x="200" y="20">b₁₃</text>
    <text x="240" y="65">b₂₁</text>
    <text x="240" y="50">b₂₂</text>
    <text x="240" y="35">b₂₃</text>
    <text x="280" y="80">b₃₁</text>
    <text x="280" y="65">b₃₂</text>
    <text x="280" y="50">b₃₃</text>
  </g>
  <g fill="var(--accent-line)" text-anchor="middle" font-size="10">
    <text x="160" y="104">a₁₃ a₁₂ a₁₁</text>
    <text x="150" y="144">a₂₃ a₂₂ a₂₁</text>
    <text x="140" y="184">a₃₃ a₃₂ a₃₁</text>
  </g>
  <g stroke="var(--accent)" stroke-width="0.8" fill="none" marker-end="url(#mma)">
    <line x1="200" y1="75" x2="200" y2="85"/>
    <line x1="240" y1="75" x2="240" y2="85"/>
    <line x1="280" y1="75" x2="280" y2="85"/>
  </g>
  <g stroke="var(--accent-line)" stroke-width="0.8" fill="none" marker-end="url(#mma)">
    <line x1="170" y1="100" x2="180" y2="100"/>
    <line x1="170" y1="140" x2="180" y2="140"/>
    <line x1="170" y1="180" x2="180" y2="180"/>
  </g>
  <defs>
    <marker id="mma" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="currentColor"/>
    </marker>
  </defs>
  <text x="200" y="240" fill="var(--accent)" text-anchor="middle" font-size="10">B teče shora dolů</text>
  <text x="100" y="220" fill="var(--accent-line)" text-anchor="middle" font-size="10">A teče zleva doprava</text>
  <text x="270" y="260" fill="var(--text-muted)" text-anchor="middle" font-size="10">Sloupec j matice B zaostává o j−1 kroků; řádek i matice A o i−1</text>
</svg>
:::

### Algoritmus

```
procedure MESH_MATRIX_MULTIPLICATION(A, B, C)
  for i = 1 to m do in parallel
    for j = 1 to k do in parallel
      c[i][j] ← 0
      while P(i, j) přijímá vstupy a a b do
        c[i][j] ← c[i][j] + (a * b)
        if j < k then send a to P(i, j+1)
        if i < m then send b to P(i+1, j)
      endwhile
```

Každý procesor:

1. Drží svůj výsledný element $c_{ij}$.
2. V každém kroku přijme $a$ a $b$ (pokud jsou k dispozici).
3. Násobí, přičte k $c_{ij}$.
4. Posílá $a$ dál vpravo, $b$ dál dolů.

### Analýza

**Nejdelší cesta**: prvek $a_{m1}$ začíná u $P(m, 1)$ a musí dorazit až k $P(m, k)$ — to trvá $k - 1$ kroků. Současně $b_{1k}$ jde od $P(1, k)$ k $P(m, k)$ — taky $m - 1$ kroků. Plus $n$ kroků pro suma součinů. Celkem $m + k + n - 2$ kroků.

Pro $m = n = k$:

- $t(n) = O(n)$
- $p(n) = n^2$ procesorů.
- $c(n) = O(n^3)$ — *odpovídá* sekvenčnímu, **není cost-optimal** ve smyslu *Strassen* / *fast matmul*. Vůči $O(n^3)$ sekvenci je $\le O(n^3)$, tj. **nejlepší možné** za předpokladu boundary-only I/O.

### Diskuze

- **Systolic** styl — data „pulsují" mřížkou jako krev srdcem. Klasický příklad od Kunga a Leisersona (1978).
- **Hardware-friendly** — lokální komunikace, žádné globální broadcasty.
- **Implementace v ASIC**: Systolic Array Processor (SAP), Google **TPU** (Tensor Processing Unit) využívá systolic-array architekturu pro matrix multiply v *jádře* deep learning.
- **Praktická omezení**: vyžaduje *boundary-only* I/O — vstup může přicházet jen po obvodu mřížky. To zaručuje, že rychlejší algoritmus na mřížce *neexistuje* (info-teoretická dolní mez $\Omega(n)$ pro boundary I/O).

::: viz nasobeni-matic-mesh "Krokuj čas t = 0, 1, …, 3n−2. V každém okamžiku vidíš, které prvky A a B jsou „in flight\" a které dvojice se aktuálně setkávají v procesorech P(i,j). Staggered timing je klíčový."
:::

## Realistická vs nerealistická PRAM varianta

### Nerealistická PRAM ($n^3$ procesorů, vše paralelně)

```
procedure UNREALISTIC_PRAM(A, B, C)
  for i = 1 to m do in parallel
    for j = 1 to k do in parallel
      c[i][j] ← 0
      for s = 1 to n do in parallel       ← všechno paralelně, i suma!
        c[i][j] ← c[i][j] + a[i][s] * b[s][j]
```

Vnitřní paralelní cyklus *nevypočítá* správně sumu — *všechny* paralelní zápisy do $c_{ij}$ se *konfliktují*. To by vyžadovalo CRCW s REDUCE operací nebo přidružený scan/redukci.

### Realistická PRAM

```
procedure REALISTIC_PRAM(A, B, C)
  for i = 1 to m do in parallel
    for j = 1 to k do in parallel
      c[i][j] ← 0
      for s = 1 to n do          ← suma sekvenčně, jen výpočet c_ij paralelně
        c[i][j] ← c[i][j] + a[i][s] * b[s][j]
```

- $t(n) = O(n)$ (sekvenční suma uvnitř)
- $p(n) = n^2$
- $c(n) = O(n^3)$

Stejné parametry jako mřížka, ale s *konstantním* dostupem do sdílené paměti — nereálné, ale teoreticky čisté.

## Realistická paralelní varianta s redukcí

Pokud zpracujeme suma redukčním stromem:

- $t(n) = O(\log n)$ (paralelní suma stromem)
- $p(n) = n^3$ (jeden procesor na násobení)
- $c(n) = O(n^3 \log n)$ — *horší* než mřížka, ale **rychlejší**.

To je idea *cube* algoritmu, který detailně rozebere [[nasobeni-matic-cube]].

## Souhrn

| Algoritmus | Čas | Procesory | Cena | Cost vůči $O(n^3)$? |
| :--- | :---: | :---: | :---: | :---: |
| Sekvenční | $O(n^3)$ | 1 | $O(n^3)$ | ✓ |
| Mesh multiplication | $O(n)$ | $n^2$ | $O(n^3)$ | ✓ |
| PRAM (nerealistická) | $O(\log n)$ | $n^3$ | $O(n^3 \log n)$ | ✗ |
| PRAM (realistická) | $O(n)$ | $n^2$ | $O(n^3)$ | ✓ |
| Cube (viz dále) | $O(\log n)$ | $n^3$ | $O(n^3 \log n)$ | ✗ |

**Klíčové pozorování**: paralelní *čas* O(n) je *limit* na mřížce kvůli boundary-only I/O. Pro lepší čas je nutná *jiná* topologie s *globální* komunikací — *cube*, *hypercube*.

## Praktická aplikace — TPU systolic array {tier=practice}

Google **TPU v1** (ISCA 2017) používá systolic-array architekturu:

- 256 × 256 mřížka multiplikačně-akumulačních (MAC) jednotek.
- Matice tečou *přesně* jak v MESH_MATRIX_MULTIPLICATION.
- 8-bit integer násobení s 32-bit akumulací.
- **Throughput**: ~92 TOPS na čip pro INT8.

NVIDIA **Tensor Cores** v Volta/Ampere/Hopper architekturách taky používají variant systolic-array pro 4×4 matrix multiply-accumulate v *jediném* taktu.

Pochopení mesh multiplication je tedy *přímo aplikovatelné* pro pochopení moderního ML hardwaru.

## Co dál

[[nasobeni-matic-cube]] ukáže *rychlejší* algoritmus na *cube/hyperkrychli* — $O(\log n)$ čas s $n^3$ procesory. Konstrukce kombinuje *distribuci* dat, *paralelní násobení*, a *redukci* — využívá komunikační primitivy z topic Komunikační operace ([[broadcast-redukce]], [[scatter-gather]], [[prefix-sum-uvod]]). [[nasobeni-matice-vektor]] potom probere jednodušší podproblém — násobení matice vektorem na *lineárním* poli a *stromě*.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Akl, S.G.: *The Design and Analysis of Parallel Algorithms* (Prentice Hall 1989), kap. 7.3; Kung, H.T., Leiserson, C.E.: „Systolic arrays for VLSI" (Sparse Matrix Proc. 1978); Strassen, V.: „Gaussian elimination is not optimal" (Numer. Math. 13(4), 1969, [DOI 10.1007/BF02165411](https://doi.org/10.1007/BF02165411)); Williams, V.V., Xu, Y., Xu, Z., Zhou, R.: „New bounds for matrix multiplication" (SODA 2024, $\omega < 2.371552$); Google: „In-Datacenter Performance Analysis of a Tensor Processing Unit" (ISCA 2017, [DOI 10.1145/3079856.3080246](https://doi.org/10.1145/3079856.3080246)).*
