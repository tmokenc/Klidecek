---
title: Scatter, Gather, All-to-all
---

# Scatter, Gather a All-to-all komunikace

Předchozí kapitola ([[broadcast-redukce]]) probrala broadcast (rozeslání *téže* hodnoty všem) a redukci (agregace *všech* do jednoho výsledku). **Scatter** a **gather** jsou jejich přirozená rozšíření — *každý uzel dostane jinou hodnotu*. **All-to-all** je „personalizovaný" broadcast: každý uzel pošle *každému jinému* uzlu *jinou* zprávu. Tyto operace dominují distribuovanému třídění, maticovým transpozicím a re-distribuci dat mezi fázemi algoritmu. Tato kapitola probírá *definice*, *algoritmy* na hyperkrychli a mřížce, a klíčové *MPI* primitivy.

## Scatter — distribuce různých částí

**Scatter** (one-to-many distribuce): zdrojový uzel $s$ má vektor $N$ hodnot $\langle a_0, a_1, \dots, a_{N-1}\rangle$; každému uzlu $P_i$ se doručí hodnota $a_i$.

Liší se od broadcastu tím, že každý uzel dostane *jiný* prvek; broadcast posílá *téhož* každému.

::: svg "Scatter — zdroj rozdělí vektor po jednom prvku ke každému uzlu"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="40" y="20" width="32" height="22"/>
    <rect x="74" y="20" width="32" height="22"/>
    <rect x="108" y="20" width="32" height="22"/>
    <rect x="142" y="20" width="32" height="22"/>
    <rect x="176" y="20" width="32" height="22"/>
    <rect x="210" y="20" width="32" height="22"/>
    <rect x="244" y="20" width="32" height="22"/>
    <rect x="278" y="20" width="32" height="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="56" y="34">a₀</text>
    <text x="90" y="34">a₁</text>
    <text x="124" y="34">a₂</text>
    <text x="158" y="34">a₃</text>
    <text x="192" y="34">a₄</text>
    <text x="226" y="34">a₅</text>
    <text x="260" y="34">a₆</text>
    <text x="294" y="34">a₇</text>
  </g>
  <text x="380" y="35" fill="var(--text-muted)" font-size="10">vstup u P₀ (zdroj)</text>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="56" cy="130" r="14"/>
    <circle cx="90" cy="130" r="14"/>
    <circle cx="124" cy="130" r="14"/>
    <circle cx="158" cy="130" r="14"/>
    <circle cx="192" cy="130" r="14"/>
    <circle cx="226" cy="130" r="14"/>
    <circle cx="260" cy="130" r="14"/>
    <circle cx="294" cy="130" r="14"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-weight="600">
    <text x="56" y="134">a₀</text>
    <text x="90" y="134">a₁</text>
    <text x="124" y="134">a₂</text>
    <text x="158" y="134">a₃</text>
    <text x="192" y="134">a₄</text>
    <text x="226" y="134">a₅</text>
    <text x="260" y="134">a₆</text>
    <text x="294" y="134">a₇</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="56" y="170">P₀</text>
    <text x="90" y="170">P₁</text>
    <text x="124" y="170">P₂</text>
    <text x="158" y="170">P₃</text>
    <text x="192" y="170">P₄</text>
    <text x="226" y="170">P₅</text>
    <text x="260" y="170">P₆</text>
    <text x="294" y="170">P₇</text>
  </g>
  <g stroke="var(--accent)" stroke-width="0.9" fill="none">
    <line x1="56" y1="44" x2="56" y2="115"/>
    <line x1="90" y1="44" x2="90" y2="115"/>
    <line x1="124" y1="44" x2="124" y2="115"/>
    <line x1="158" y1="44" x2="158" y2="115"/>
    <line x1="192" y1="44" x2="192" y2="115"/>
    <line x1="226" y1="44" x2="226" y2="115"/>
    <line x1="260" y1="44" x2="260" y2="115"/>
    <line x1="294" y1="44" x2="294" y2="115"/>
  </g>
  <text x="400" y="130" fill="var(--text-muted)" font-size="10">každý uzel dostane jiný a_i</text>
</svg>
:::

### Implementace na hyperkrychli

**Rekurzivní půlení**: v každém kroku zdroj pošle *polovinu* dat sousedovi v dané dimenzi. Po $\log N$ krocích každý uzel má svou *unikátní* část.

```
procedure SCATTER_HC(vector A[0..N-1], source s)
  for i = 0 to d - 1 do            // d = log N
    for each informed processor p do in parallel
      partner ← p XOR 2^i
      p sends second half of its data to partner
      // each keeps half, sends other half
    endfor
  endfor
```

V iteraci 0: zdroj rozdělí $N$ prvků na 2 části po $N/2$, pošle druhou polovinu sousedovi.
V iteraci 1: oba informovaní uzly rozdělí svou $N/2$ část na 2 části po $N/4$ atd.
Po $\log N$ iterací: každý uzel má 1 prvek.

**Čas**: $O(N/p + \log N)$ — *startup* (latence) je $\log N$, *datová* část je $N/p$ (z bandwidth pohledu — každá hrana přenese maximálně $N/2$ prvků).

### MPI ekvivalent

MPI: `MPI_Scatter(sendbuf, sendcount, ..., recvbuf, recvcount, ..., root, comm)`. Root uzel rozdělí `sendbuf` na rovné části a každému (včetně sebe) doručí jednu.

## Gather — inverze scatteru

**Gather**: každý uzel $P_i$ má hodnotu $a_i$; cílový uzel $r$ shromáždí vektor $\langle a_0, a_1, \dots, a_{N-1}\rangle$.

Inverzní pohyb dat vůči scatteru — stejná struktura, opačný směr. Stejný *čas*: $O(N/p + \log N)$ na hyperkrychli.

```
procedure GATHER_HC(my_val, root r)
  for i = log(N) - 1 downto 0 do
    if my index has bit i = 0 then
      receive from partner (= me XOR 2^i)
      append received data to my data
    else
      send my data to partner; halt
    endif
  endfor
```

Půlení proběhne v opačném směru — po každém kroku se aktivní procesory půlí, akumulují data, až jeden zůstane se vším.

MPI: `MPI_Gather(sendbuf, ..., recvbuf, ..., root, comm)`.

**Rozdíl od redukce**: gather *zachovává* všechny hodnoty (vektor délky $N$). Redukce je *agreguje* operátorem do jediné hodnoty. Gather nevyžaduje asociativitu.

## All-gather — gather všem

**All-gather**: každý uzel má $a_i$; cíl je, aby *všichni* měli kompletní vektor $\langle a_0, \dots, a_{N-1}\rangle$.

Naivně: gather na $r$ + broadcast — $O(N/p + \log N) + O(\log N)$ kroků. Optimálnější: *rekurzivní zdvojnásobení*:

```
procedure ALL_GATHER_HC(my_val)
  data ← {my_val}
  for i = 0 to log(N) - 1 do
    partner ← me XOR 2^i
    send data to partner; receive their_data
    data ← data ∪ their_data
  endfor
  return data
```

V iteraci $i$ má každý uzel $2^i$ hodnot a vymění je s partnerem; po $\log N$ krocích má $N$ hodnot. **Čas**: $O(N/p \cdot p + \log N) = O(N + \log N) = O(N)$ (data dominantní). Pro hyperkostku optimal.

MPI: `MPI_Allgather` — *standardní* primitiv pro replikaci stavu.

## All-to-all — personalizovaný

**All-to-all** (osobní výměna): každý uzel $P_i$ má vektor $\langle b_{i,0}, b_{i,1}, \dots, b_{i,N-1}\rangle$. Po operaci má $P_j$ vektor $\langle b_{0,j}, b_{1,j}, \dots, b_{N-1,j}\rangle$.

To je *transpozice* dvourozměrné distribuované matice — řádky se stávají sloupci.

::: svg "All-to-all — každý posílá každému jinou zprávu (transpozice)"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="40" y="40" width="120" height="80"/>
    <rect x="380" y="40" width="120" height="80"/>
  </g>
  <g fill="var(--text)" font-size="10" text-anchor="middle">
    <text x="70" y="58">b₀₀</text>
    <text x="100" y="58">b₀₁</text>
    <text x="130" y="58">b₀₂</text>
    <text x="70" y="78">b₁₀</text>
    <text x="100" y="78">b₁₁</text>
    <text x="130" y="78">b₁₂</text>
    <text x="70" y="98">b₂₀</text>
    <text x="100" y="98">b₂₁</text>
    <text x="130" y="98">b₂₂</text>
    <text x="410" y="58">b₀₀</text>
    <text x="440" y="58">b₁₀</text>
    <text x="470" y="58">b₂₀</text>
    <text x="410" y="78">b₀₁</text>
    <text x="440" y="78">b₁₁</text>
    <text x="470" y="78">b₂₁</text>
    <text x="410" y="98">b₀₂</text>
    <text x="440" y="98">b₁₂</text>
    <text x="470" y="98">b₂₂</text>
  </g>
  <g fill="var(--text-muted)" font-size="9">
    <text x="22" y="60">P₀</text>
    <text x="22" y="80">P₁</text>
    <text x="22" y="100">P₂</text>
    <text x="350" y="60">P₀</text>
    <text x="350" y="80">P₁</text>
    <text x="350" y="100">P₂</text>
  </g>
  <text x="100" y="155" fill="var(--text-muted)" text-anchor="middle" font-size="10">před: P_i má řádku i</text>
  <text x="440" y="155" fill="var(--text-muted)" text-anchor="middle" font-size="10">po: P_j má sloupec j</text>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" marker-end="url(#a2aarrow)">
    <line x1="170" y1="80" x2="370" y2="80"/>
  </g>
  <defs>
    <marker id="a2aarrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="270" y="75" fill="var(--accent)" text-anchor="middle" font-size="10">all-to-all</text>
  <text x="270" y="92" fill="var(--text-muted)" text-anchor="middle" font-size="9">= transpozice</text>
  <text x="270" y="190" fill="var(--text-muted)" text-anchor="middle" font-size="10">Celkový datový pohyb: O(N²/p) na uzel; O(N²) celkem</text>
</svg>
:::

### Algoritmy

- **Naivní** (1-port hyperkrychle): v každém z $\log N$ kroků každý uzel posílá *polovinu* svých dat svému partnerovi v dimenzi $i$. Po každém kroku se data *přerozdělí* tak, aby každý měl správnou polovinu. **Čas**: $O((N \log N)/p)$ — *není* asymptoticky optimal (1-faktor $\log$ navíc).
- **Optimalizovaný (Bruck 1997)**: $\log N$ kroků s rotací indexů, žádný extra log faktor. **Čas**: $O(N/p)$ + $\log N$ startup.
- **Direct (1-step)** na crossbar nebo full-duplex hyperkrychli: $N - 1$ paralelních párových výměn — *jeden* round pro každou dvojici. Bandwidth-optimal: $O(N)$ kroků.

MPI: `MPI_Alltoall` — *jeden z nejdražších* kolektivů. Sortování (např. *Radix sort distributed*) je dominantně ohraničeno all-to-all.

## Souhrn — collective operations

| Operace | Vstup | Výstup | Čas (hyperkrychle, $N$ uzlů, $m$ slov na uzel) |
| :--- | :--- | :--- | :---: |
| **Broadcast** | 1 uzel má $m$ slov | všichni mají $m$ slov | $O(m + \log N)$ |
| **Scatter** | 1 uzel má $Nm$ slov | každý má $m$ slov | $O(m + \log N)$ |
| **Gather** | každý má $m$ slov | 1 uzel má $Nm$ slov | $O(m + \log N)$ |
| **All-gather** | každý má $m$ slov | všichni mají $Nm$ slov | $O(Nm + \log N)$ |
| **Reduce** | každý má $m$ slov | 1 uzel má $m$ slov (agregace) | $O(m + \log N)$ |
| **All-reduce** | každý má $m$ slov | všichni mají $m$ slov (agregace) | $O(m + \log N)$ |
| **All-to-all** | každý má $Nm$ slov | každý má $Nm$ slov (přepermutováno) | $O(Nm + \log N)$ |

Konstanty se liší podle topologie a podle toho, zda 1-port nebo multi-port hardware.

## Reálné aplikace {tier=practice}

- **FFT distribuovaná**: přechod mezi $N$ frekvenčními pásmy ↔ $N$ uzly = **all-to-all**.
- **Distribuovaná maticová transpozice**: $A \to A^T$ s blokovou distribucí = **all-to-all**.
- **MPI distribuovaný sort** (sample sort, radix sort): re-distribuce dat po určení splitterů = **all-to-all**.
- **Deep learning, distributed gradient descent**: synchronizace gradientů = **all-reduce**.
- **Distribuované embedding tables**: lookup distribuovaný do partitionů = **scatter** + **gather**.

## Praktické rady pro MPI {tier=practice}

1. **Použij `MPI_Allreduce` místo `MPI_Reduce` + `MPI_Bcast`** — knihovna ho zkombinuje optimálněji.
2. **Vyhněte se `MPI_Alltoall` pokud možno** — *nejdražší* kolektiv. Re-design algoritmu často sníží nebo nahradí jinými operacemi.
3. **Velké zprávy: pipelinovat** — rozdělit na bloky a překrýt komunikaci s výpočtem (`MPI_Iallgather`, `MPI_Iallreduce` v MPI-3 nonblocking).
4. **Topology-aware mapping** — MPI implementace často odhadne reálnou topologii cluster a optimalizuje kolektivy.

## Co dál

[[prefix-sum-uvod]] zavádí **sumu prefixů (scan)** — *parciální* verzi redukce, kde každý uzel dostává *redukci svého prefixu* (kumulativní součet). Je to *fundamentální* stavební blok dalších algoritmů: paralelní *radix sort*, paralelní *quicksort*, paralelní *lex. analýza*, *packing problem*, *line-of-sight*. [[prefix-sum-algoritmus]] potom probírá up-sweep + down-sweep konstrukci.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Grama et al.: *Introduction to Parallel Computing* (2. vyd. 2003), kap. 4.5–4.9; Quinn, M.J.: *Parallel Programming in C with MPI and OpenMP* (McGraw-Hill 2003), §4 a §11; MPI Forum: *MPI Standard 4.0* §5.5–5.9 ([oficiální dokumentace](https://www.mpi-forum.org/docs/)); Bruck, J., Ho, C.-T., Kipnis, S., Upfal, E., Weathersby, D.: „Efficient algorithms for all-to-all communications in multiport message-passing systems" (IEEE Trans. Parallel Distrib. Syst. 8(11), 1997, [DOI 10.1109/71.642949](https://doi.org/10.1109/71.642949)); Thakur, R., Rabenseifner, R., Gropp, W.: „Optimization of collective communication operations in MPICH" (Int. J. High Perf. Comput. Appl. 19(1), 2005, [DOI 10.1177/1094342005051521](https://doi.org/10.1177/1094342005051521)).*
