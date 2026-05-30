---
title: EREW / CREW / CRCW — varianty PRAM
---

# Varianty PRAM — EREW, CREW, CRCW

Předchozí kapitola ([[pram-uvod]]) definovala PRAM jako synchronní model se sdílenou pamětí. Klíčový **parametr** modelu je míra dovoleného *paralelního přístupu* k téže buňce paměti. Tento parametr významně ovlivňuje *výpočetní sílu* modelu — některé úlohy se na silnější variantě řeší v $O(1)$ kroku, zatímco na slabší variantě vyžadují $\Omega(\log n)$ kroků. Tato kapitola zavádí *standardní hierarchii* PRAM modelů (EREW, CREW, CRCW) a u CRCW další podtypy podle *řešení zápisového konfliktu* (COMMON, ARBITRARY, PRIORITY).

## Dva nezávislé parametry

Pro každý krok PRAM lze nezávisle rozhodnout:

- Je dovoleno **paralelní čtení** (Concurrent Read) téže buňky? — nebo musí číst nejvýš jeden procesor (Exclusive Read)?
- Je dovoleno **paralelní zápis** (Concurrent Write) téže buňky? — nebo musí psát nejvýš jeden procesor (Exclusive Write)?

Čtyři kombinace dávají *teoreticky* čtyři varianty:

| | Exclusive Write | Concurrent Write |
| :---: | :---: | :---: |
| **Exclusive Read** | **EREW** | ERCW |
| **Concurrent Read** | **CREW** | **CRCW** |

Varianta **ERCW** (exclusive read, concurrent write) *nemá praktické opodstatnění* — paralelní zápis je technicky náročnější než paralelní čtení; pokud dovolíme zápis, není důvod zakázat čtení. **Studujeme proto pouze tři**: EREW, CREW a CRCW.

## EREW PRAM — nejslabší varianta

**Exclusive Read, Exclusive Write.** V jednom kroku každou buňku $M_j$ čte nanejvýš *jeden* procesor a zapisuje do ní nanejvýš *jeden* procesor.

EREW odpovídá modelu, kde sdílená paměť je jako *bankovní okýnko* — najednou ho používá jen jeden zákazník.

**Důsledek**: chce-li $N$ procesorů znát hodnotu z jedné buňky, je nutné nejdřív hodnotu *rozšířit* (broadcast) přes pomocné buňky — typicky v $O(\log N)$ krocích (viz [[broadcast-redukce]] resp. [[pram-algoritmy]]).

Implementačně nejjednodušší a *nejrealističtější* — odpovídá většině *bezkonkurenčních* paměťových systémů.

## CREW PRAM — paralelní čtení

**Concurrent Read, Exclusive Write.** V jednom kroku libovolný počet procesorů může číst tutéž buňku, ale zapisuje do ní nejvýš jeden.

CREW je *kompromisní* model — paralelní čtení odpovídá tomu, jak fungují *cache-koherentní* paměťové architektury (každý procesor si může zkopírovat hodnotu z hlavní paměti), zatímco paralelní zápis vyžaduje *atomické* operace (drahé).

V CREW je broadcast triviální — všech $N$ procesorů přečte tutéž buňku v *jednom* kroku.

## CRCW PRAM — plně paralelní

**Concurrent Read, Concurrent Write.** V jednom kroku libovolný počet procesorů může číst *i* zapisovat tutéž buňku.

Paralelní zápis vyvolá *konflikt* — co se *skutečně zapíše*, když několik procesorů chce do téže buňky zapsat *různé* hodnoty? CRCW model musí specifikovat **pravidlo řešení konfliktu**.

### Pravidla řešení konfliktu

Tři standardní varianty (řazené od nejslabší k nejsilnější):

- **COMMON** (Kucera 1982). Všechny zapisované hodnoty *musí být stejné*. Pokud nejsou, výsledek je *nedefinovaný* (nebo: algoritmus je *nesprávný*). Algoritmus musí *zaručit*, že žádný takový konflikt nikdy nenastane.
- **ARBITRARY** (Vishkin 1983). Hodnoty mohou být *různé*. *Libovolná* z nich se zapíše. Algoritmus musí být korektní *bez ohledu na to, která hodnota se zapíše* — typicky se uvažuje *adversarial* volba.
- **PRIORITY** (Goldschlager 1982). Procesory mají *fixní priority* (bez újmy na obecnosti: procesor s *menším* indexem má vyšší prioritu). V konfliktu se zapíše hodnota procesoru *s nejvyšší prioritou*.

::: svg "CRCW — tři pravidla řešení konfliktu zápisu"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="20" y="20" width="160" height="170" rx="3"/>
    <rect x="190" y="20" width="160" height="170" rx="3"/>
    <rect x="360" y="20" width="160" height="170" rx="3"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-weight="600">
    <text x="100" y="40">COMMON</text>
    <text x="270" y="40">ARBITRARY</text>
    <text x="440" y="40">PRIORITY</text>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="100" y="65">P₁: 5  P₂: 5  P₃: 5</text>
    <text x="100" y="85">↓ všechny stejné</text>
    <text x="100" y="115" font-size="13">M[k] ← 5</text>
    <text x="100" y="155">nesmí být</text>
    <text x="100" y="170">5, 5, 7</text>
    <text x="270" y="65">P₁: 5  P₂: 7  P₃: 2</text>
    <text x="270" y="85">↓ libovolná</text>
    <text x="270" y="115" font-size="13">M[k] ← 7</text>
    <text x="270" y="155">algoritmus musí</text>
    <text x="270" y="170">být korektní pro</text>
    <text x="440" y="65">P₁: 5  P₂: 7  P₃: 2</text>
    <text x="440" y="85">↓ nejnižší index</text>
    <text x="440" y="115" font-size="13">M[k] ← 5</text>
    <text x="440" y="155">deterministické,</text>
    <text x="440" y="170">vyhrává P₁</text>
  </g>
  <text x="270" y="183" fill="var(--text-faint)" text-anchor="middle" font-size="9">libovolné výsledky adversaria</text>
</svg>
:::

V literatuře se vyskytují i další varianty:

- **REDUCE / FETCH-AND-ADD** — zapíše se *funkce* všech hodnot (například $\sum$, $\max$, $\min$). Hardware podpora v některých skutečných strojích (NYU Ultracomputer, Cray T3E).
- **TOLERANT** — konflikt znamená, že buňka zůstane *nezměněná*.
- **CROW** (concurrent-read owner-write) a **EROW** (exclusive-read owner-write) — každá buňka má jednoho „vlastníka", který do ní jako jediný *smí* zapisovat. Praktická omezení, která pokrývá mnoho známých algoritmů.

## Hierarchie síly

Mezi modely lze definovat **relaci $A \subseteq B$**: každý algoritmus pro $A$ běží beze změn i na $B$. Tedy $B$ je *silnější*, je tolerantnější ke konfliktům.

Standardní vztah:

::: math
\text{PRIORITY} \supseteq \text{ARBITRARY} \supseteq \text{COMMON} \supseteq \text{CREW} \supseteq \text{EREW}
:::

(Někdy se píše opačně — pak se používá $\preceq$. Vždy: silnější model dovolí *víc*.)

**Proč zjevně:**

- COMMON je *speciální případ* ARBITRARY — pokud všechny zapisované hodnoty jsou stejné, libovolná volba dá stejnou hodnotu.
- ARBITRARY je *speciální případ* PRIORITY — algoritmus, který funguje pro libovolnou volbu, funguje i pro deterministickou volbu (procesoru s nejvyšší prioritou).
- CREW je *zákaz* paralelního zápisu — speciální případ COMMON, kde je vždy nejvýš jeden zapisovatel.
- EREW navíc zakazuje paralelní čtení — speciální případ CREW.

::: svg "Hierarchie sily PRAM modelů"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="20" y="30" width="80" height="38" rx="3"/>
    <rect x="125" y="30" width="80" height="38" rx="3"/>
    <rect x="230" y="30" width="80" height="38" rx="3"/>
    <rect x="335" y="30" width="80" height="38" rx="3"/>
    <rect x="440" y="30" width="80" height="38" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="60" y="46">EREW</text>
    <text x="60" y="60" font-size="9" fill="var(--text-muted)">nejslabší</text>
    <text x="165" y="46">CREW</text>
    <text x="270" y="46">COMMON</text>
    <text x="375" y="46">ARBITRARY</text>
    <text x="480" y="46">PRIORITY</text>
    <text x="480" y="60" font-size="9" fill="var(--text-muted)">nejsilnější</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.6" fill="none" marker-end="url(#triarrow)">
    <line x1="100" y1="49" x2="120" y2="49"/>
    <line x1="205" y1="49" x2="225" y2="49"/>
    <line x1="310" y1="49" x2="330" y2="49"/>
    <line x1="415" y1="49" x2="435" y2="49"/>
  </g>
  <defs>
    <marker id="triarrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="270" y="90" text-anchor="middle" fill="var(--text-muted)" font-size="10">síla roste vpravo (víc dovolených operací)</text>
  <g fill="var(--text)" font-size="10">
    <text x="20" y="120">EREW ⊆ CREW:</text>
    <text x="20" y="135" fill="var(--text-muted)">EREW algoritmus nepoužívá paralelní čtení, takže běží i na CREW.</text>
    <text x="20" y="155">CREW ⊆ CRCW:</text>
    <text x="20" y="170" fill="var(--text-muted)">CREW nepoužívá paralelní zápis, takže běží na všech CRCW variantách.</text>
  </g>
</svg>
:::

## Příklad — jak síla modelu mění čas

**Úloha**: spočítat **logický OR** $n$ bitů $a_1, a_2, \dots, a_n \in \{0, 1\}$.

- **EREW**: vyžaduje $\Omega(\log n)$ kroků — důkaz: v jednom kroku se může „šířit" jedna hodnota maximálně na 2 procesory (paralelní čtení zakázáno), takže pro znalost OR všemi je potřeba *binární strom* hloubky $\log n$.
- **COMMON CRCW**: $O(1)$. Každý procesor $P_i$ čte $a_i$; pokud $a_i = 1$, zapíše 1 do buňky $M_{\text{out}}$. Konflikty jsou *COMMON*-kompatibilní (všichni píší stejnou hodnotu 1). Pokud nikdo nezapsal, zůstává tam 0 (inicializovaná).
- **ARBITRARY CRCW**: $O(1)$ stejnou metodou.
- **PRIORITY CRCW**: $O(1)$ stejnou metodou.

Tedy **CRCW může OR v $O(1)$, EREW vyžaduje $\Omega(\log n)$** — *exponenciální separace* mezi modely pro tuto úlohu.

## Příklad — element distinctness

**Úloha**: rozhodnout, zda v poli $A[1..n]$ jsou dva stejné prvky.

- **CRCW PRIORITY**: vyžaduje $\Omega(\sqrt{\log n})$ s $n$ procesory. Není $O(1)$ — známá *netriviální dolní mez*.
- **EREW**: $\Omega(\log n)$, ve skutečnosti $\Theta(\log n)$ se sortováním a porovnáním sousedů.

Element distinctness je *kanonický* příklad úlohy, která rozlišuje modely uvnitř CRCW hierarchie.

## Která varianta odpovídá kterému hardwaru

- **Cluster s message-passing** (MPI) — odpovídá *EREW* (či zhruba CROW), neboť čistě paralelní čtení sdílené buňky neexistuje.
- **Multi-core CPU se sdílenou cache** — *CREW*, neboť čtení je téměř zdarma (skrz cache), ale zápis vyžaduje koherenční protokoly.
- **CRCW** s COMMON resolution — některé *vector* a *SIMD* architektury (Cray T3E, IBM SP2 s fetch-and-or operacemi).
- **PRIORITY CRCW** — teoretický model, *neexistuje* žádný komerční stroj. Slouží primárně k odvozování *dolních mezí*.

## Programovací konvence

Algoritmus se zpravidla *označí*, na jakou variantu je navržen:

```
procedure BROADCAST(D, N, A)   // EREW PRAM
  A[1] = D;
  for i = 0 to (log N - 1) do
    for j = 2^i + 1 to 2^(i+1) do in parallel
      A[j] = A[j - 2^i]
    endfor
  endfor
```

Tento broadcast funguje na EREW (žádné dvě iterace nečtou tutéž buňku) — viz [[pram-algoritmy]] pro detail.

## Co dál

[[pram-simulace]] ukáže *jak* simulovat silnější model slabším — *redukční konstrukce*, která umožňuje algoritmus napsaný v PRIORITY CRCW spouštět na EREW (s logaritmickou cenou). [[pram-algoritmy]] aplikuje výsledky této kapitoly: ukáže klasické PRAM algoritmy (redukce, hledání minima) v různých variantách s analýzou času a ceny.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Akl, S.G.: *The Design and Analysis of Parallel Algorithms* (Prentice Hall 1989), kap. 2.4 a 21; Fortune, S., Wyllie, J.: „Parallelism in random access machines" (STOC 1978, [DOI 10.1145/800133.804339](https://doi.org/10.1145/800133.804339)); Kučera, L.: „Parallel computation and conflicts in memory access" (Inf. Process. Lett. 14(2), 1982); Vishkin, U.: „Implementation of simultaneous memory access in models that forbid it" (J. Algorithms 4, 1983); Goldschlager, L.M.: „A universal interconnection pattern for parallel computers" (J. ACM 29(4), 1982); JáJá, J.: *An Introduction to Parallel Algorithms* (Addison-Wesley 1992), §1.2.*
