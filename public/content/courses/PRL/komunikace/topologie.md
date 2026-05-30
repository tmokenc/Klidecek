---
title: Propojovací sítě a jejich vlastnosti
---

# Propojovací sítě paralelních systémů

PRAM model ([[pram-uvod]]) abstrahuje *propojení* mezi procesory a pamětí — vše je *sdílená* paměť s konstantním přístupem. Reálné stroje mají ale **konkrétní propojovací síť** (interconnection network), jejíž *topologie* zásadně ovlivňuje, jak efektivně se dá implementovat broadcast, redukce, scatter, gather, prefix sum a další **kolektivní komunikační operace**. Tato kapitola zavádí *taxonomii* propojovacích sítí a metriky, podle kterých se porovnávají. Následující kapitoly ([[broadcast-redukce]], [[scatter-gather]], [[prefix-sum-uvod]], [[prefix-sum-algoritmus]]) ukáží, jak se *operace* na různých topologiích chovají.

## Dva základní typy

- **Statické** sítě — uzly jsou *procesory* (s vlastní pamětí), hrany jsou *fyzické kanály*. Topologie je *pevná*. Typické pro distributed-memory architektury: cluster, MPP.
- **Dynamické** sítě — síť obsahuje *přepínače*, propojení mezi uzly se *konfiguruje za běhu*. Typické pro shared-memory: propojení procesorů s paměťovými bankami.

V obou případech *topologie* (graf sítě) určuje, kolik kroků trvá *jediné zaslání zprávy* mezi dvěma uzly a kolik *paralelních toků* může síť unést současně.

## Klíčové metriky

Pro libovolnou síť $G = (V, E)$ se sledují tyto veličiny:

- **Velikost (size)** $|V|$ — počet uzlů (procesorů).
- **Cena (cost)** $|E|$ — počet hran. Měří *hardware náklady*.
- **Průměr (diameter)** $D$ — délka *nejdelší z nejkratších cest* mezi všemi dvojicemi uzlů. Měří *worst-case latency* komunikace.
- **Šířka bisekce (bisection width)** $B$ — minimální počet hran, jejichž odstraněním se síť rozpadne na dvě *přibližně stejně velké* poloviny. Měří *bottleneck* propustnosti — kolik zpráv může najednou téct mezi polovinami.
- **Konektivita (arc connectivity)** $K$ — minimální počet hran, jejichž odstraněním se síť rozpadne. Měří *odolnost* vůči poruchám a *uniformitu* zatížení uzlů.
- **Stupeň uzlu (node degree)** — počet sousedů. Ovlivňuje *konstantní zatížení* každého uzlu.

Pro „dobrou" síť chceme: *malý průměr* (rychlá komunikace), *velkou šířku bisekce* (vysoká agregátní propustnost), *konstantní stupeň* (škálovatelný hardware) a *nízkou cenu*. Tyto cíle jdou proti sobě — neexistuje univerzálně optimální topologie.

## Statické sítě — přehled

::: svg "Vybrané statické topologie — kruh, mřížka 2D, hyperkostka 3D, strom"
<svg viewBox="0 0 540 230" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="40" cy="60" r="6"/>
    <circle cx="75" cy="30" r="6"/>
    <circle cx="110" cy="60" r="6"/>
    <circle cx="110" cy="100" r="6"/>
    <circle cx="75" cy="120" r="6"/>
    <circle cx="40" cy="100" r="6"/>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.8">
    <line x1="40" y1="60" x2="75" y2="30"/>
    <line x1="75" y1="30" x2="110" y2="60"/>
    <line x1="110" y1="60" x2="110" y2="100"/>
    <line x1="110" y1="100" x2="75" y2="120"/>
    <line x1="75" y1="120" x2="40" y2="100"/>
    <line x1="40" y1="100" x2="40" y2="60"/>
  </g>
  <text x="75" y="150" fill="var(--text-muted)" text-anchor="middle" font-size="10">kruh (ring)</text>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="170" cy="30" r="5"/>
    <circle cx="200" cy="30" r="5"/>
    <circle cx="230" cy="30" r="5"/>
    <circle cx="170" cy="60" r="5"/>
    <circle cx="200" cy="60" r="5"/>
    <circle cx="230" cy="60" r="5"/>
    <circle cx="170" cy="90" r="5"/>
    <circle cx="200" cy="90" r="5"/>
    <circle cx="230" cy="90" r="5"/>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.8">
    <line x1="170" y1="30" x2="230" y2="30"/>
    <line x1="170" y1="60" x2="230" y2="60"/>
    <line x1="170" y1="90" x2="230" y2="90"/>
    <line x1="170" y1="30" x2="170" y2="90"/>
    <line x1="200" y1="30" x2="200" y2="90"/>
    <line x1="230" y1="30" x2="230" y2="90"/>
  </g>
  <text x="200" y="150" fill="var(--text-muted)" text-anchor="middle" font-size="10">mřížka 3×3</text>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="280" cy="35" r="5"/>
    <circle cx="320" cy="35" r="5"/>
    <circle cx="280" cy="75" r="5"/>
    <circle cx="320" cy="75" r="5"/>
    <circle cx="300" cy="55" r="5"/>
    <circle cx="340" cy="55" r="5"/>
    <circle cx="300" cy="95" r="5"/>
    <circle cx="340" cy="95" r="5"/>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.8">
    <line x1="280" y1="35" x2="320" y2="35"/>
    <line x1="280" y1="75" x2="320" y2="75"/>
    <line x1="280" y1="35" x2="280" y2="75"/>
    <line x1="320" y1="35" x2="320" y2="75"/>
    <line x1="300" y1="55" x2="340" y2="55"/>
    <line x1="300" y1="95" x2="340" y2="95"/>
    <line x1="300" y1="55" x2="300" y2="95"/>
    <line x1="340" y1="55" x2="340" y2="95"/>
    <line x1="280" y1="35" x2="300" y2="55"/>
    <line x1="320" y1="35" x2="340" y2="55"/>
    <line x1="280" y1="75" x2="300" y2="95"/>
    <line x1="320" y1="75" x2="340" y2="95"/>
  </g>
  <text x="310" y="150" fill="var(--text-muted)" text-anchor="middle" font-size="10">hyperkostka 3D</text>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="450" cy="20" r="6"/>
    <circle cx="410" cy="60" r="5"/>
    <circle cx="490" cy="60" r="5"/>
    <circle cx="390" cy="100" r="5"/>
    <circle cx="430" cy="100" r="5"/>
    <circle cx="470" cy="100" r="5"/>
    <circle cx="510" cy="100" r="5"/>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.8">
    <line x1="450" y1="20" x2="410" y2="60"/>
    <line x1="450" y1="20" x2="490" y2="60"/>
    <line x1="410" y1="60" x2="390" y2="100"/>
    <line x1="410" y1="60" x2="430" y2="100"/>
    <line x1="490" y1="60" x2="470" y2="100"/>
    <line x1="490" y1="60" x2="510" y2="100"/>
  </g>
  <text x="450" y="150" fill="var(--text-muted)" text-anchor="middle" font-size="10">binární strom</text>
  <g fill="var(--text)" font-size="9">
    <text x="20" y="175">průměr O(p)</text>
    <text x="170" y="175">průměr O(√p)</text>
    <text x="290" y="175">průměr O(log p)</text>
    <text x="425" y="175">průměr O(log p)</text>
    <text x="20" y="195">bisekce 2</text>
    <text x="170" y="195">bisekce √p</text>
    <text x="290" y="195">bisekce p/2</text>
    <text x="425" y="195">bisekce 1</text>
    <text x="20" y="215">stupeň 2</text>
    <text x="170" y="215">stupeň 4</text>
    <text x="290" y="215">stupeň log p</text>
    <text x="425" y="215">stupeň ≤ 3</text>
  </g>
</svg>
:::

### Tabulka — porovnání pro $p$ uzlů

| Topologie | Diametr | Šířka bisekce | Konektivita | Stupeň | Cena (hran) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Úplný graf** | 1 | $p^2/4$ | $p-1$ | $p-1$ | $\binom{p}{2}$ |
| **Hvězda** | 2 | $\lceil(p-1)/2\rceil$ | 1 | 1 nebo $p-1$ | $p-1$ |
| **Kruh (ring)** | $\lfloor p/2 \rfloor$ | 2 | 2 | 2 | $p$ |
| **2D mřížka** $\sqrt{p}\times\sqrt{p}$ | $2(\sqrt p - 1)$ | $\sqrt p$ | 2 (rohy)–4 | 4 | $2(p-\sqrt p)$ |
| **2D torus** | $2 \lfloor\sqrt p/2\rfloor$ | $2\sqrt p$ | 4 | 4 | $2p$ |
| **$d$-rozm. hyperkostka** ($p=2^d$) | $\log p$ | $p/2$ | $\log p$ | $\log p$ | $(p \log p)/2$ |
| **Binární strom** (vyvážený) | $2 \log_2 p$ | 1 | 1 | ≤ 3 | $p-1$ |
| **Fat tree** | $O(\log p)$ | $\Theta(p)$ | $O(\log p)$ | ≤ 3 | $O(p \log p)$ |

### Hyperkostka

**$d$-rozměrná hyperkostka** má $p = 2^d$ uzlů adresovaných $d$-bitovými indexy. Dva uzly jsou *sousední* právě když jejich indexy se liší v *právě jednom bitu*. Příklady: $d=1$ je úsečka, $d=2$ čtverec, $d=3$ krychle.

Hyperkostka je dlouholetým favoritem pro paralelní algoritmy:

- **logaritmický průměr** $\log p$ — broadcast a redukce v $\log p$ krocích.
- **velká šířka bisekce** $p/2$ — *žádný* bottleneck mezi polovinami.
- **rekurzivní struktura** — $d$-kostka = dvě $(d{-}1)$-kostky.

Nevýhoda: stupeň uzlu $\log p$ *roste* s $p$ — uzel ve velké kostce potřebuje *mnoho* portů. Pro $p = 1024$ uzlů má každý uzel 10 sousedů. Hardware škálovatelnost je tak omezená.

### Mřížka a torus

**$k$-ární $n$-rozměrná kostka** = kartézský součin $n$ lineárních polí s $k$ uzly. Pro $n=2$, $k=\sqrt p$ získáme **2D mřížku**, populární topologii (Intel Paragon, Tilera Tile64, MIT Raw).

**Torus** = mřížka s *cyklickým* zacelením hran (uzly na okraji jsou propojeny s protilehlými). Snižuje průměr, zvyšuje konektivitu.

| | Mřížka 2D | Torus 2D |
| :--- | :---: | :---: |
| Diametr | $2(\sqrt p - 1)$ | $2 \lfloor\sqrt p/2\rfloor$ |
| Bisekce | $\sqrt p$ | $2\sqrt p$ |

Reálná použití: CRAY T3E (3D torus), IBM Blue Gene (5D torus), Fujitsu K Computer (6D torus).

### Strom a fat tree

**Binární strom** ($p$ listů + $p-1$ vnitřních uzlů): logaritmický průměr ($2\log_2 p$), ale *šířka bisekce = 1* — *kořen je bottleneck*. Pro algoritmy s hodně komunikace mezi polovinami strom selhává.

**Fat tree** (Leiserson, 1985) řeší bottleneck — hrany blíže ke kořenu jsou *„tlustší"* (multiplikované). Šířka bisekce roste s počtem listů. Používán v moderních HPC sítích (Connection Machine CM-5, InfiniBand fat-tree, klasický topologie v datacenter networks).

::: svg "Binární strom vs fat tree — bottleneck u kořene"
<svg viewBox="0 0 540 170" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="100" cy="30" r="8"/>
    <circle cx="60" cy="70" r="7"/>
    <circle cx="140" cy="70" r="7"/>
    <circle cx="40" cy="110" r="6"/>
    <circle cx="80" cy="110" r="6"/>
    <circle cx="120" cy="110" r="6"/>
    <circle cx="160" cy="110" r="6"/>
  </g>
  <g stroke="var(--text-faint)" stroke-width="1">
    <line x1="100" y1="38" x2="60" y2="70"/>
    <line x1="100" y1="38" x2="140" y2="70"/>
    <line x1="60" y1="77" x2="40" y2="110"/>
    <line x1="60" y1="77" x2="80" y2="110"/>
    <line x1="140" y1="77" x2="120" y2="110"/>
    <line x1="140" y1="77" x2="160" y2="110"/>
  </g>
  <text x="100" y="145" fill="var(--text-muted)" text-anchor="middle" font-size="10">binární strom — bisekce = 1</text>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="380" cy="30" r="8"/>
    <circle cx="340" cy="70" r="7"/>
    <circle cx="420" cy="70" r="7"/>
    <circle cx="320" cy="110" r="6"/>
    <circle cx="360" cy="110" r="6"/>
    <circle cx="400" cy="110" r="6"/>
    <circle cx="440" cy="110" r="6"/>
  </g>
  <g stroke="var(--accent)" stroke-width="2.4">
    <line x1="380" y1="38" x2="340" y2="70"/>
    <line x1="380" y1="38" x2="420" y2="70"/>
  </g>
  <g stroke="var(--accent-line)" stroke-width="1.6">
    <line x1="340" y1="77" x2="320" y2="110"/>
    <line x1="340" y1="77" x2="360" y2="110"/>
    <line x1="420" y1="77" x2="400" y2="110"/>
    <line x1="420" y1="77" x2="440" y2="110"/>
  </g>
  <text x="380" y="145" fill="var(--text-muted)" text-anchor="middle" font-size="10">fat tree — silnější hrany ke kořeni</text>
</svg>
:::

### Speciální topologie — shuffle, butterfly, omega

**Shuffle and Exchange** (Stone 1971): dvě permutace nad $p$-bitovými adresami.

- **Exchange**: invertuje *poslední* bit — propojuje *bezprostřední* sousedy.
- **Shuffle**: cyklicky posune adresu o jedno místo doleva — sblíží uzly s podobnou adresou.

Kombinací *exchange + shuffle* lze v $\log p$ krocích doručit zprávu mezi libovolnými dvěma uzly.

**Butterfly / Omega / Benes** — multistage indirect networks: $\log p$ úrovní × $p/2$ přepínačů. Standardně používané jako *dynamické* propojovací sítě v shared-memory strojích a v switch-based clusterech.

## Dynamické sítě

### Sběrnice (bus)

Nejjednodušší propojení: *jedna* sdílená sběrnice, všechny uzly se sériově střídají. Cena $\Theta(p)$, propustnost $\Theta(1)$, průměr 1. *Nepropustný bottleneck* — víc procesorů znamená *víc bojů* o sběrnici. Použitelné jen pro málo procesorů (≤ 4–8).

Cache zlepší situaci: pokud 50 % požadavků hit z lokální cache, propustnost roste, ale pro velké $p$ stále $\Theta(p)$ provoz na sběrnici.

### Křížový přepínač (crossbar)

$p$ procesorů × $m$ paměťových modulů přes mřížku přepínačů $p \times m$.

- Cena $\Omega(p \cdot m)$ — *kvadratická*, proto neškáluje pro velké $p$.
- Diameter 1, **neblokující** — libovolná dvě uzly lze propojit současně.
- Propustnost $O(p)$ paralelních propojení.

Použití: výstupní stupeň některých switch-fabric architektur, *malé* shared-memory systémy (vector supercomputery, server interconnect).

### Multistage networks (Omega, Butterfly, Benes)

$\Theta(p \log p)$ přepínačů uspořádaných do $\log p$ úrovní, každá s $p/2$ přepínači.

- Cena řádově $p \log p$ — kompromis mezi sběrnicí a crossbarem.
- **Blokující** — i když všechny zdroje míří na různé cíle, na vnitřních přepínačích můžou vznikat konflikty.

**Omega network** (Lawrie 1975): perfect-shuffle permutace mezi úrovněmi, *self-routing* — cílová adresa $b_1 b_2 \dots b_{\log p}$ řídí přepínače přímo (bit $b_i$ na úrovni $i$).

**Benes network**: dvě polovinky Butterfly back-to-back — *přenastavitelná, neblokující* pro permutace. Cena $2 p \log p$.

::: viz omega-network "Vyber zdroj P_i a cíl M_j, pak krokuj. V každém stupni se konzumuje jeden bit cíle (zvýrazněn binárně nahoře) — určuje nastavení switche (přímý/křížení). Mezi stupni perfect-shuffle propojuje výstupy s vstupy."
:::

## Volba topologie pro algoritmus

Žádná topologie není „nejlepší" — volba závisí na *vzoru komunikace* algoritmu:

- **Nearest-neighbor** (stencil výpočty, PDE, image processing) — *mřížka* ideální, $\sqrt p$ kroků pro průchod.
- **Tree-reduce / broadcast** ($\log p$ kroků nezávislé na topologii) — *strom* nebo *hyperkostka*.
- **Permutační vzory** (FFT, sort) — *butterfly / shuffle* nebo *hyperkostka*.
- **All-to-all** komunikace — *fat tree* nebo *crossbar*.

Praktický kompromis pro HPC: **fat tree** (InfiniBand) nebo **3D torus** (BlueGene) — *univerzální* topologie s rozumnými vlastnostmi pro většinu vzorů.

## Co dál

[[broadcast-redukce]] aplikuje topologie na *one-to-all broadcast* (distribuce hodnoty od jednoho ke všem) a *all-to-one reduction* (sběr a agregace). Tyto dvě jsou *duální* operace s týmiž $\log p$ kroky na hyperkostce a stromě. [[scatter-gather]] rozšiřuje na *odlišné* hodnoty pro každý uzel.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Grama, A., Karypis, G., Kumar, V., Gupta, A.: *Introduction to Parallel Computing* (2. vyd., Addison-Wesley 2003), kap. 2; Quinn, M.J.: *Parallel Programming in C with MPI and OpenMP* (McGraw-Hill 2003), kap. 2; Leiserson, C.E.: „Fat-Trees: Universal Networks for Hardware-Efficient Supercomputing" (IEEE Trans. Computers C-34(10), 1985, [DOI 10.1109/TC.1985.6312192](https://doi.org/10.1109/TC.1985.6312192)); Stone, H.S.: „Parallel processing with the perfect shuffle" (IEEE Trans. Computers C-20(2), 1971); Lawrie, D.H.: „Access and alignment of data in an array processor" (IEEE Trans. Computers C-24(12), 1975); Hennessy & Patterson: *Computer Architecture* (6. vyd., Morgan Kaufmann 2017), Appendix F (Interconnection Networks).*
