---
title: Broadcast a redukce — duální kolektivní operace
---

# Broadcast a redukce

Předchozí kapitola ([[topologie]]) definovala *topologie* propojovacích sítí. **Broadcast** (rozeslání jedné hodnoty *od* jednoho uzlu ke *všem*) a **redukce** (agregace hodnot *od všech* uzlů *do* jednoho) jsou *dvě nejzákladnější* kolektivní operace — sloupují se ve většině paralelních algoritmů (od redukčního součtu po distribuci sdílené konstanty před paralelní fází). Jsou navzájem *duální*: obrácením směrů dat se broadcast stává redukcí a naopak. Tato kapitola probírá oba pohledy a ukazuje algoritmy na *PRAM*, *stromě*, *mřížce* a *hyperkrychli*.

## Definice

**Broadcast** (jednosměrné, *one-to-all*): jeden uzel (zdroj $s$) má hodnotu $D$; cílem je, aby na konci operace měli *všichni* uzlové $D$ ve své lokální paměti.

**Redukce** (*all-to-one reduction*): každý uzel $P_i$ má vstupní hodnotu $a_i$; cílem je, aby jeden cílový uzel ($r$) měl výsledek $\bigoplus_{i=1}^{N} a_i$, kde $\oplus$ je *asociativní* binární operace (typicky $+$, $\min$, $\max$, $\text{AND}$, $\text{OR}$, $\text{XOR}$, vektorová suma).

**Dualita**: pokud broadcast posílá data $s \to \text{všichni}$ v $T$ krocích po stromu, redukce posílá data $\text{všichni} \to r$ v $T$ krocích *opačným směrem*, s tím, že na každé úrovni se hodnoty *aplikují* operátorem $\oplus$. Algoritmy mají stejnou *strukturu*, jen jiný *směr* a jiný *obsah operací*.

::: svg "Broadcast vs redukce — duální pohyb dat"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="120" cy="30" r="13"/>
    <circle cx="80" cy="80" r="11"/>
    <circle cx="160" cy="80" r="11"/>
    <circle cx="55" cy="130" r="10"/>
    <circle cx="105" cy="130" r="10"/>
    <circle cx="135" cy="130" r="10"/>
    <circle cx="185" cy="130" r="10"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="120" y="34">D</text>
    <text x="80" y="84">D</text>
    <text x="160" y="84">D</text>
    <text x="55" y="134">D</text>
    <text x="105" y="134">D</text>
    <text x="135" y="134">D</text>
    <text x="185" y="134">D</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" marker-end="url(#bcastarrow)">
    <line x1="115" y1="42" x2="84" y2="68"/>
    <line x1="125" y1="42" x2="156" y2="68"/>
    <line x1="75" y1="91" x2="58" y2="118"/>
    <line x1="85" y1="91" x2="102" y2="118"/>
    <line x1="155" y1="91" x2="138" y2="118"/>
    <line x1="165" y1="91" x2="182" y2="118"/>
  </g>
  <defs>
    <marker id="bcastarrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
    <marker id="redarrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent-line)"/>
    </marker>
  </defs>
  <text x="120" y="175" fill="var(--accent)" text-anchor="middle" font-size="11" font-weight="600">Broadcast</text>
  <text x="120" y="195" fill="var(--text-muted)" text-anchor="middle" font-size="10">jedna hodnota → všem</text>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="420" cy="30" r="13"/>
    <circle cx="380" cy="80" r="11"/>
    <circle cx="460" cy="80" r="11"/>
    <circle cx="355" cy="130" r="10"/>
    <circle cx="405" cy="130" r="10"/>
    <circle cx="435" cy="130" r="10"/>
    <circle cx="485" cy="130" r="10"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="420" y="34" font-weight="600">∑</text>
    <text x="380" y="84">+</text>
    <text x="460" y="84">+</text>
    <text x="355" y="134" font-size="9">a₁</text>
    <text x="405" y="134" font-size="9">a₂</text>
    <text x="435" y="134" font-size="9">a₃</text>
    <text x="485" y="134" font-size="9">a₄</text>
  </g>
  <g stroke="var(--accent-line)" stroke-width="1.4" fill="none" marker-end="url(#redarrow)">
    <line x1="58" y1="118" x2="0" y2="0" stroke="none"/>
    <line x1="358" y1="123" x2="378" y2="91"/>
    <line x1="402" y1="123" x2="382" y2="91"/>
    <line x1="438" y1="123" x2="458" y2="91"/>
    <line x1="482" y1="123" x2="462" y2="91"/>
    <line x1="383" y1="69" x2="416" y2="43"/>
    <line x1="457" y1="69" x2="424" y2="43"/>
  </g>
  <text x="420" y="175" fill="var(--accent-line)" text-anchor="middle" font-size="11" font-weight="600">Reduce (s + )</text>
  <text x="420" y="195" fill="var(--text-muted)" text-anchor="middle" font-size="10">všichni → jeden agregát</text>
</svg>
:::

::: viz broadcast-redukce "Vyber topologii (hyperkrychle / mřížka / strom / kruh) a operaci (broadcast / reduce / all-reduce). Krokuj — sleduj, jak se v hyperkrychli počet informovaných zdvojnásobuje v každém kroku."
:::

## Broadcast na PRAM

### CRCW a CREW — triviální

Pokud máme CRCW (nebo CREW) PRAM, broadcast je *triviální*:

```
procedure BROADCAST_CREW(D)
  M[s] ← D            // zdroj zapíše D
  for i = 1 to N do in parallel
    local_D[i] ← M[s]    // všichni paralelně přečtou
```

Čas $O(1)$ — paralelní čtení dovoluje, aby všech $N$ procesorů přečetlo tutéž buňku v jednom kroku.

### EREW — stromová distribuce

Na EREW *paralelní čtení zakázáno*. Broadcast probíhá *binárním stromem*: po každém kroku se počet *informovaných* procesorů zdvojnásobí.

```
procedure BROADCAST_EREW(D, N, A)
  A[1] ← D
  for i = 0 to log(N) - 1 do
    for j = 2^i + 1 to 2^(i+1) do in parallel
      A[j] ← A[j - 2^i]      // procesor j kopíruje z j - 2^i
    endfor
  endfor
```

V iteraci $i$ procesory $1, 2, \dots, 2^i$ už mají hodnotu, dalších $2^i$ procesorů ji čte (každý z *jiné* buňky). Po $\log N$ iteracích mají všichni.

::: svg "EREW broadcast — zdvojnásobování v každém kroku"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.9" fill="var(--bg-card)">
    <rect x="40" y="30" width="34" height="22"/>
    <rect x="80" y="30" width="34" height="22"/>
    <rect x="120" y="30" width="34" height="22"/>
    <rect x="160" y="30" width="34" height="22"/>
    <rect x="200" y="30" width="34" height="22"/>
    <rect x="240" y="30" width="34" height="22"/>
    <rect x="280" y="30" width="34" height="22"/>
    <rect x="320" y="30" width="34" height="22"/>
    <rect x="40" y="68" width="34" height="22"/>
    <rect x="80" y="68" width="34" height="22"/>
    <rect x="120" y="68" width="34" height="22"/>
    <rect x="160" y="68" width="34" height="22"/>
    <rect x="200" y="68" width="34" height="22"/>
    <rect x="240" y="68" width="34" height="22"/>
    <rect x="280" y="68" width="34" height="22"/>
    <rect x="320" y="68" width="34" height="22"/>
    <rect x="40" y="106" width="34" height="22"/>
    <rect x="80" y="106" width="34" height="22"/>
    <rect x="120" y="106" width="34" height="22"/>
    <rect x="160" y="106" width="34" height="22"/>
    <rect x="200" y="106" width="34" height="22"/>
    <rect x="240" y="106" width="34" height="22"/>
    <rect x="280" y="106" width="34" height="22"/>
    <rect x="320" y="106" width="34" height="22"/>
    <rect x="40" y="144" width="34" height="22"/>
    <rect x="80" y="144" width="34" height="22"/>
    <rect x="120" y="144" width="34" height="22"/>
    <rect x="160" y="144" width="34" height="22"/>
    <rect x="200" y="144" width="34" height="22"/>
    <rect x="240" y="144" width="34" height="22"/>
    <rect x="280" y="144" width="34" height="22"/>
    <rect x="320" y="144" width="34" height="22"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-weight="600">
    <text x="57" y="45">D</text>
    <text x="57" y="83">D</text>
    <text x="97" y="83">D</text>
    <text x="57" y="121">D</text>
    <text x="97" y="121">D</text>
    <text x="137" y="121">D</text>
    <text x="177" y="121">D</text>
    <text x="57" y="159">D</text>
    <text x="97" y="159">D</text>
    <text x="137" y="159">D</text>
    <text x="177" y="159">D</text>
    <text x="217" y="159">D</text>
    <text x="257" y="159">D</text>
    <text x="297" y="159">D</text>
    <text x="337" y="159">D</text>
  </g>
  <g fill="var(--text-muted)" font-size="9">
    <text x="370" y="44">krok 0 (init)</text>
    <text x="370" y="82">krok 1: 2 informovaní</text>
    <text x="370" y="120">krok 2: 4 informovaní</text>
    <text x="370" y="158">krok 3: 8 informovaní</text>
  </g>
  <text x="180" y="190" text-anchor="middle" fill="var(--accent)" font-size="11">⌈log N⌉ kroků</text>
</svg>
:::

### Analýza

| Model | Čas | Procesory | Cena |
| :--- | :---: | :---: | :---: |
| Sekvenční | $O(N)$ | 1 | $O(N)$ |
| EREW | $O(\log N)$ | $N$ | $O(N \log N)$ |
| CREW | $O(1)$ | $N$ | $O(N)$ |
| CRCW | $O(1)$ | $N$ | $O(N)$ |

**EREW** je *cost-suboptimal* — broadcast „plýtvá" o $\log N$ faktor. *CREW a CRCW jsou cost-optimal*. V praxi (cluster ≈ EREW) tedy broadcast trvá $\log N$ kroků.

## Redukce na PRAM

Inverzní pohyb dat: hodnoty *tečou* od listů k *kořeni* a na každé úrovni se *párují* operátorem $\oplus$.

```
procedure REDUCE(A[1..N], ⊕)
  for i = 1 to log(N) do
    for j = 1 to N/2^i do in parallel
      A[j] ← A[2j-1] ⊕ A[2j]
    endfor
  endfor
  return A[1]
```

Čas $O(\log N)$, $p = N/2$ procesorů, cena $O(N \log N)$. **EREW** stačí — žádné dvě iterace nečtou nebo nepíšou tutéž buňku.

Cost-optimal varianta: $p = N/\log N$ procesorů s *lokální sumací* (Brentova konstrukce z [[pram-algoritmy]]).

## Broadcast a redukce na stromě

Stromová topologie přímo odráží algoritmus — *uzly* stromu jsou procesory.

**Broadcast:** kořen pošle hodnotu *oběma synům*; ti rekurzivně pokračují. Hloubka stromu = $\log N$ kroků.

**Redukce:** listy mají vstupy; každý vnitřní uzel přečte hodnoty od dvou synů, aplikuje $\oplus$ a předá výsledek otci. Po $\log N$ krocích kořen má výsledek.

Tato strategie se používá *přímo* v *tree-connected* strojích a *konceptuálně* na všech topologiích (každý algoritmus si „postaví" virtuální binární strom).

## Broadcast na mřížce $\sqrt N \times \sqrt N$

V *2D mřížce* lze broadcast udělat ve **dvou fázích**:

1. **Fáze řádky**: zdroj rozešle hodnotu po své *řádce* — $\sqrt N - 1$ kroků nebo s rekurzivním zdvojením $\log \sqrt N = \tfrac12 \log N$ kroků.
2. **Fáze sloupce**: každý uzel v původní řádce rozesílá *vertikálně* po svém sloupci — totéž.

**Čas**: $O(\sqrt N)$ pro single-port mřížku, $O(\log N)$ s rekurzivním zdvojením a dostatečnou propustností hran.

Stejná strategie funguje pro $d$-rozměrnou mřížku: $d$ fází, každá $O(N^{1/d})$ kroků.

## Broadcast na hyperkrychli

Hyperkrychle $d$-rozměrná ($N = 2^d$ uzlů) umožní broadcast v **přesně $d = \log N$ krocích**.

**Algoritmus** (od zdroje na uzlu adresa 0):

```
for i = 0 to d - 1 do
  for each informed processor p do in parallel
    p sends D to its neighbor across dimension i
  endfor
endfor
```

V iteraci $i$ je *2^i* informovaných uzlů; každý posílá svému sousedovi ve směru bitu $i$, zdvojnásobí počet informovaných.

::: svg "Broadcast na 3D hyperkrychli — 3 kroky"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.8" fill="var(--bg-card)">
    <circle cx="80" cy="90" r="10"/>
    <circle cx="140" cy="90" r="10"/>
    <circle cx="80" cy="150" r="10"/>
    <circle cx="140" cy="150" r="10"/>
    <circle cx="105" cy="65" r="10"/>
    <circle cx="165" cy="65" r="10"/>
    <circle cx="105" cy="125" r="10"/>
    <circle cx="165" cy="125" r="10"/>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.6">
    <line x1="80" y1="90" x2="140" y2="90"/>
    <line x1="80" y1="150" x2="140" y2="150"/>
    <line x1="80" y1="90" x2="80" y2="150"/>
    <line x1="140" y1="90" x2="140" y2="150"/>
    <line x1="105" y1="65" x2="165" y2="65"/>
    <line x1="105" y1="125" x2="165" y2="125"/>
    <line x1="105" y1="65" x2="105" y2="125"/>
    <line x1="165" y1="65" x2="165" y2="125"/>
    <line x1="80" y1="90" x2="105" y2="65"/>
    <line x1="140" y1="90" x2="165" y2="65"/>
    <line x1="80" y1="150" x2="105" y2="125"/>
    <line x1="140" y1="150" x2="165" y2="125"/>
  </g>
  <circle cx="80" cy="150" r="10" fill="var(--accent)" stroke="var(--accent)"/>
  <text x="80" y="154" text-anchor="middle" fill="white" font-size="11" font-weight="600">s</text>
  <g stroke="var(--accent)" stroke-width="2" fill="none" marker-end="url(#hcarrow)">
    <line x1="83" y1="143" x2="135" y2="92"/>
  </g>
  <defs>
    <marker id="hcarrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--text)" font-size="10">
    <text x="240" y="65">Krok 1 (dim 0):</text>
    <text x="240" y="80" fill="var(--text-muted)">s → soused přes bit 0 (1 → 2 inf.)</text>
    <text x="240" y="105">Krok 2 (dim 1):</text>
    <text x="240" y="120" fill="var(--text-muted)">2 → 4 informovaných</text>
    <text x="240" y="145">Krok 3 (dim 2):</text>
    <text x="240" y="160" fill="var(--text-muted)">4 → 8 informovaných (vše)</text>
    <text x="240" y="185" fill="var(--accent)">Celkem: log N = 3 kroky</text>
  </g>
</svg>
:::

**Čas**: $O(\log N) = O(d)$, *optimal* pro hyperkrychli (odpovídá průměru).

## Redukce na hyperkrychli

Inverzní procedura — *dimenze projíždíme od posledního po prvního*; v iteraci $i$ páry uzlů lišící se bitem $i$ si vymění hodnoty a *redukují* je. Po $d = \log N$ krocích má jeden vyhrazený uzel (typicky adresa 0) celkovou redukci.

Tabulka časů na různých topologiích:

| Topologie | Broadcast | Redukce |
| :--- | :---: | :---: |
| Hyperkrychle | $\log N$ | $\log N$ |
| Mřížka 2D | $\sqrt N$ (nearest-neighbor) | $\sqrt N$ |
| Strom | $\log N$ | $\log N$ |
| Kruh | $N/2$ | $N/2$ |
| Bus | $N$ (sekvenčně) | $N$ |
| Crossbar | 1 (s vícenásobným fanoutem) | $\log N$ (binární strom) |

## All-reduce — redukce + broadcast v jedné operaci

Často potřebujeme, aby *všechny* uzly měly *výsledek redukce* (např. global gradient v distributed ML training). Naivně: redukce $O(\log N)$ + broadcast $O(\log N)$ = $O(\log N)$.

**Optimalizovaný all-reduce na hyperkrychli** (Bruck, Ho 1997): $\log N$ kroků, v každém kroku každý uzel vymění s aktuálním partnerem hodnotu a oba aplikují $\oplus$. Po $\log N$ krocích mají *všichni* tutéž redukci.

```
procedure ALL_REDUCE_HC(my_val)
  for i = 0 to log(N) - 1 do
    partner ← me XOR 2^i
    send my_val to partner; receive their_val from partner
    my_val ← my_val ⊕ their_val
  endfor
  return my_val
```

**Čas**: $\log N$ — stejně jako jednoduchý broadcast. **MPI standardní operace `MPI_Allreduce`** ji implementuje *přesně* takto pro mocniny dvou, jinak rekurzivním půlením (recursive halving) s předzpracováním přebývajících procesů do nejbližší mocniny dvou (Rabenseifnerův algoritmus).

## Praktické důsledky {tier=practice}

1. **Broadcast je „zdarma" v CRCW** — pro algoritmy nad sdílenou cache (multi-core) lze považovat za $O(1)$.
2. **Na clusteru je broadcast** $O(\log N)$ — *dominantní* fáze mnoha distribuovaných výpočtů. Optimalizace = pipelining (rozdělit zprávu na bloky a začít posílat dále *předtím*, než přijde celá).
3. **Redukce a all-reduce dominantní v distributed ML** — synchronizace gradientů. NVIDIA NCCL implementuje ring-allreduce s $\Theta(p)$ kroky (tedy $\Theta(p)$ latencí pro malé zprávy), ale bandwidth-optimálně $\Theta(m)$; pro malé zprávy se proto používá rekurzivní zdvojení / stromový allreduce s $\Theta(\log p)$ latencí.
4. **Mřížka je nejhorší** pro velký počet uzlů — broadcast $O(\sqrt N)$ vs $O(\log N)$ na hyperkrychli.

## Co dál

[[scatter-gather]] zobecní broadcast a redukci: **scatter** rozdělí $N$ *různých* hodnot mezi $N$ uzlů, **gather** je zase shromáždí. **All-to-all** je *„personalizovaný"* broadcast — každý uzel pošle *každému* jiný kus. Tyto operace dominantní v sortování a maticových transposicích. [[prefix-sum-uvod]] potom probere *parciální* redukci — výsledek redukce *pro každý prefix vstupu* — fundamentální stavební blok mnoha algoritmů.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Grama et al.: *Introduction to Parallel Computing* (2. vyd. 2003), kap. 4 (Basic Communication Operations); Quinn, M.J.: *Parallel Programming in C with MPI and OpenMP* (McGraw-Hill 2003), kap. 4; MPI Forum: *MPI Standard 4.0* (2021, [oficiální dokumentace](https://www.mpi-forum.org/docs/)), §5 (Collective Communication); Bruck, J., Ho, C.-T.: „Efficient algorithms for all-to-all communications in multi-port message-passing systems" (IEEE Trans. Parallel Distrib. Syst. 8(11), 1997); Patarasuk, P., Yuan, X.: „Bandwidth optimal all-reduce algorithms for clusters of workstations" (J. Parallel Distrib. Comput. 69(2), 2009).*
