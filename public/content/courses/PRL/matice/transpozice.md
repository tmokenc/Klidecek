---
title: Transpozice matice — mřížka, Perfect Shuffle, EREW
---

# Paralelní transpozice matice

**Transpozice matice** je jedna z nejjednodušších, ale ilustrativně bohatých maticových operací: ze čtvercové matice $A$ s prvky $a_{ij}$ udělat matici $A^T$ s prvky $a_{ji}$. Sekvenčně triviální v $O(n^2)$. Paralelně se ukáže, že **topologie procesorů hraje klíčovou roli** — *mřížka* (zdánlivě „přirozená" pro matice) je *pomalejší* než *Perfect Shuffle* či *sdílená paměť*. Tato kapitola probírá tři přístupy a porovnává jejich cenu.

## Sekvenční transpozice

```
procedure TRANSPOSE(A)
  for i = 2 to n do
    for j = 1 to i - 1 do
      swap(a[i][j], a[j][i])
```

Vyměníme prvky pod diagonálou s prvky nad diagonálou; diagonála zůstane beze změny.

- $T_\text{sekv} = O(n^2)$ — **optimal** (musíme aspoň přečíst všech $\Theta(n^2)$ prvků).

Paralelní algoritmy *nemohou* asymptoticky snížit cenu pod $O(n^2)$.

## Transpozice na mřížce $n \times n$

### Topologie

Procesory $P(i, j)$ uspořádané do mřížky $n \times n$, propojené se sousedy (4 směry). Procesor $P(i, j)$ obsahuje element $a_{ij}$. Po algoritmu má obsahovat $a_{ji}$.

Každý procesor má 3 registry:

- $A(i, j)$ — uchovává element (na začátku $a_{ij}$, na konci $a_{ji}$).
- $B(i, j)$ — buffer pro hodnoty *od pravého nebo horního* souseda.
- $C(i, j)$ — buffer pro hodnoty *od levého nebo dolního* souseda.

### Princip

Diagonální prvky ($a_{ii}$) zůstávají na místě. Prvky *pod* diagonálou se přesouvají na *symetrickou* pozici nad diagonálou (a obráceně). Dráha prvku $a_{ij}$ pod diagonálou: nahoru po sloupci $j$ až k pozici $(j, j)$, pak doprava po řádce $j$ až k pozici $(j, i)$.

::: svg "Transpozice na mřížce — dráhy prvků z dolního trojúhelníku do horního"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6" fill="var(--bg-card)">
    <rect x="40" y="20" width="40" height="40"/>
    <rect x="80" y="20" width="40" height="40"/>
    <rect x="120" y="20" width="40" height="40"/>
    <rect x="160" y="20" width="40" height="40"/>
    <rect x="40" y="60" width="40" height="40"/>
    <rect x="80" y="60" width="40" height="40"/>
    <rect x="120" y="60" width="40" height="40"/>
    <rect x="160" y="60" width="40" height="40"/>
    <rect x="40" y="100" width="40" height="40"/>
    <rect x="80" y="100" width="40" height="40"/>
    <rect x="120" y="100" width="40" height="40"/>
    <rect x="160" y="100" width="40" height="40"/>
    <rect x="40" y="140" width="40" height="40"/>
    <rect x="80" y="140" width="40" height="40"/>
    <rect x="120" y="140" width="40" height="40"/>
    <rect x="160" y="140" width="40" height="40"/>
  </g>
  <g fill="var(--text-faint)" text-anchor="middle" font-size="9">
    <text x="60" y="44">a₁₁</text>
    <text x="100" y="44">a₁₂</text>
    <text x="140" y="44">a₁₃</text>
    <text x="180" y="44">a₁₄</text>
    <text x="60" y="84">a₂₁</text>
    <text x="100" y="84">a₂₂</text>
    <text x="140" y="84">a₂₃</text>
    <text x="180" y="84">a₂₄</text>
    <text x="60" y="124">a₃₁</text>
    <text x="100" y="124">a₃₂</text>
    <text x="140" y="124">a₃₃</text>
    <text x="180" y="124">a₃₄</text>
    <text x="60" y="164">a₄₁</text>
    <text x="100" y="164">a₄₂</text>
    <text x="140" y="164">a₄₃</text>
    <text x="180" y="164">a₄₄</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.6" fill="none" marker-end="url(#mta)">
    <path d="M 60,165 Q 60,90 60,45 Q 60,42 100,42"/>
    <path d="M 60,125 Q 60,80 60,45 Q 60,42 140,42" stroke="var(--accent-line)"/>
  </g>
  <defs>
    <marker id="mta" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--text)" font-size="10">
    <text x="240" y="60">a₄₁: ↑ po sloupci 1 do (1,1), → po řádce 1 do (1,4)</text>
    <text x="240" y="90">a₃₁: ↑ po sloupci 1 do (1,1), → po řádce 1 do (1,3)</text>
    <text x="240" y="120">a_ij (i>j): vždy nahoru pak doprava</text>
    <text x="240" y="150">a_ij (i&lt;j): vždy doleva pak dolů (symetricky)</text>
    <text x="240" y="180" fill="var(--accent)">Nejdelší cesta = 2(n-1) kroků (např. a₄₁)</text>
  </g>
</svg>
:::

### Algoritmus (zkráceně)

```
procedure MESH_TRANSPOSE(A)
  Step 1: každý procesor pod diagonálou pošle (a_ij, j, i) hornímu sousedovi
          každý procesor nad diagonálou pošle levému sousedovi
  Step 2: souběžně:
    (2.1) zprávy směřující do horního trojúhelníku jdou po sloupci nahoru
    (2.2) diagonální procesory přesměrují příchozí zprávu (zprava → dolů, zdola → vpravo)
    (2.3) zprávy v horním trojúhelníku jdou po řádce vpravo (resp. dolním symetricky)
    Při příchodu na cíl: zápis do A
```

### Analýza

- Nejdelší cesta: $2(n - 1)$ kroků (např. $a_{n1}$ jde nahoru o $n-1$ a doprava o $n-1$).
- $t(n) = O(n)$ — *optimal pro mřížku* (limit jejího průměru).
- $p(n) = n^2$ procesorů.
- $c(n) = O(n^3)$ — **NEoptimal** (sekv. $O(n^2)$, faktor $n$ navíc).

## Transpozice na Perfect Shuffle

### Idea

Perfect Shuffle propojení dovoluje *přerozdělení* indexů procesorů cyklickým posunem bitů. Klíčové pozorování: pokud index $k = 2^q(i - 1) + (j - 1)$ procesoru obsahuje $a_{ij}$, pak po $q$ shufflech (kde $n = 2^q$) bude tentýž prvek v procesoru s indexem $2^q(j - 1) + (i - 1)$ — což odpovídá $a_{ji}$.

### Algoritmus

```
procedure SHUFFLE_TRANSPOSE(A)    // n = 2^q
  for i = 1 to q do
    for k = 1 to 2^(2q) - 2 do in parallel
      P_k sends its element to P_{2k mod (2^(2q) - 1)}
```

**Bez konfliktů**: Perfect Shuffle je *permutace*; každý odesilatel je unikátní, každý příjemce taky.

### Analýza

- $t(n) = O(\log n)$ — $q = \log n$ kroků.
- $p(n) = n^2$ procesorů.
- $c(n) = O(n^2 \log n)$ — **NEoptimal**, ale *řádově lepší* než mřížka ($O(n^3)$).

**Překvapivé pozorování**: Perfect Shuffle je *rychlejší* než mřížka pro transpozici — přestože mřížka je *intuitivně* přirozenější topologie pro matice. Topologie s $O(\log n)$ průměrem dovolují celkový pohyb dat v $O(\log n)$ krocích, zatímco mřížka s průměrem $O(\sqrt n) = O(n)$ vyžaduje $O(n)$.

::: svg "Perfect Shuffle vs Mřížka — průměr ovlivňuje čas transpozice"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="40" y="20" width="200" height="160"/>
    <rect x="300" y="20" width="200" height="160"/>
  </g>
  <text x="140" y="45" fill="var(--text)" text-anchor="middle" font-weight="600">Mřížka n × n</text>
  <text x="400" y="45" fill="var(--text)" text-anchor="middle" font-weight="600">Perfect Shuffle</text>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="140" y="70">Průměr: 2(n−1)</text>
    <text x="140" y="90">Procesory: n²</text>
    <text x="140" y="125" fill="var(--accent)">Čas transpozice: O(n)</text>
    <text x="140" y="145">Cena: O(n³)</text>
    <text x="400" y="70">Průměr: log n</text>
    <text x="400" y="90">Procesory: n²</text>
    <text x="400" y="125" fill="var(--accent)">Čas transpozice: O(log n)</text>
    <text x="400" y="145">Cena: O(n² log n)</text>
  </g>
</svg>
:::

## Transpozice na EREW PRAM

Sdílená paměť — *triviální* případ:

```
procedure EREW_TRANSPOSE
  for i = 2 to n do in parallel
    for j = 1 to i - 1 do in parallel
      swap(A[i][j], A[j][i])
```

Každý pár $(i, j)$ se vymění *paralelně*. Žádný konflikt — různé páry pracují s *různými* buňkami.

### Analýza

- $t(n) = O(1)$ — konstantní čas!
- $p(n) = n(n - 1)/2 = O(n^2)$ procesorů.
- $c(n) = O(n^2)$ — **cost-optimal**!

EREW PRAM je *nejrychlejší* model pro transpozici. Reálný hardware to ale nedokáže — fyzicky se *musí* prvky někudy dopravit, což trvá *aspoň* logaritmický čas.

## Souhrnná tabulka

| Model | Čas | Procesory | Cena | Cost-optimal? |
| :--- | :---: | :---: | :---: | :---: |
| Sekvenční | $O(n^2)$ | 1 | $O(n^2)$ | ✓ (referenční) |
| Mřížka $n \times n$ | $O(n)$ | $n^2$ | $O(n^3)$ | ✗ |
| Perfect Shuffle | $O(\log n)$ | $n^2$ | $O(n^2 \log n)$ | ✗ |
| EREW PRAM | $O(1)$ | $O(n^2)$ | $O(n^2)$ | ✓ |

**Praktická aplikace**:

- Mřížka v *systolic arrays* (Cray Y-MP, Connection Machine).
- Perfect Shuffle ve *vektor processorech* (Cray FFT).
- EREW na *moderním multi-core* — `pragma omp parallel for collapse(2)` ji prakticky realizuje.

## Co dál

[[nasobeni-matic-mesh]] aplikuje mřížku na *násobení dvou matic* — klasický systolic-array algoritmus s časem $O(n)$. [[nasobeni-matic-cube]] ukáže rychlejší $O(\log n)$ algoritmus na *cube* (hyperkrychli) s $n^3$ procesory. [[nasobeni-matice-vektor]] pak transpozici aplikuje na nejjednodušší maticovou operaci — násobení matice vektorem.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Akl, S.G.: *The Design and Analysis of Parallel Algorithms* (Prentice Hall 1989), kap. 7.2; Stone, H.S.: „Parallel processing with the perfect shuffle" (IEEE Trans. Computers C-20(2), 1971); Quinn, M.J.: *Parallel Computing: Theory and Practice* (2. vyd., McGraw-Hill 1994); JáJá, J.: *An Introduction to Parallel Algorithms* (Addison-Wesley 1992), kap. 5; Akl, S.G., Lyons, K.A.: *Parallel Computational Geometry* (Prentice Hall 1993) — pro spojené geometrické algoritmy.*
