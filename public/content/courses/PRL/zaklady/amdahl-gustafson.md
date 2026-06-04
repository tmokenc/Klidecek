---
title: Amdahlův a Gustafsonův zákon
---

# Amdahlův a Gustafsonův zákon — limity paralelizace

Předchozí sekce ([[paralelizace-uvod]]) ukázala, že reálný speedup *neroste lineárně* s počtem procesorů. **Amdahlův** a **Gustafsonův zákon** kvantifikují *proč*. Oba popisují *limit* speedupu, ale za *různých* předpokladů. Pochopení jejich rozdílu je klíčové pro design paralelních algoritmů a *odhad*, kolik procesorů má smysl použít.

## Amdahlův zákon (1967)

[Gene Amdahl](https://doi.org/10.1145/1465482.1465560), IBM. *Fixed-size* problém: úloha má fixní velikost, paralelně se ji snažíme spočítat rychleji.

### Model

Označme:

- $\alpha$ = *podíl* úlohy, který lze paralelizovat ($\alpha \in [0, 1]$).
- $1 - \alpha$ = sekvenční podíl (nelze paralelizovat).
- $T_1$ = sekvenční čas (na 1 procesoru).

Na $N$ procesorech:

- Sekvenční část trvá $(1 - \alpha) T_1$ (nezávislé na $N$).
- Paralelní část trvá $\alpha T_1 / N$.

$$
T_N = (1 - \alpha) T_1 + \frac{\alpha T_1}{N}
$$

Speedup:

$$
\boxed{S(N) = \frac{T_1}{T_N} = \frac{1}{(1 - \alpha) + \frac{\alpha}{N}}}
$$

### Limit pro $N \to \infty$

$$
\lim_{N \to \infty} S(N) = \frac{1}{1 - \alpha}
$$

Důsledek: i s **nekonečně mnoho procesorů** je speedup limitován *sekvenčním podílem*.

Konkrétně:

| $\alpha$ | Max speedup ($N \to \infty$) |
| :---: | :---: |
| 0,50 | 2× |
| 0,80 | 5× |
| 0,90 | 10× |
| 0,95 | 20× |
| 0,99 | 100× |
| 0,999 | 1000× |

Důležitý wake-up call: úloha s 95 % paralelizovatelností *nikdy* nedosáhne víc než 20× speedup, ani na milionu procesorů.

::: viz amdahl-gustafson "Posuv α a N — sleduj, jak Amdahl naráží na asymptotu 1/(1−α), zatímco Gustafson roste lineárně. Karp-Flatt vrátí empirický sériový podíl z měření."
:::

::: svg "Amdahlův zákon — speedup pro různé α"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6">
    <line x1="50" y1="200" x2="510" y2="200"/>
    <line x1="50" y1="20" x2="50" y2="200"/>
  </g>
  <g fill="var(--text-muted)" font-size="10">
    <text x="280" y="215" text-anchor="middle">počet procesorů N (log scale)</text>
    <text x="20" y="110" transform="rotate(-90 20 110)" text-anchor="middle">speedup S(N)</text>
  </g>
  <path d="M50,200 C 100,180 150,170 200,165 C 270,158 350,154 510,150" fill="none" stroke="var(--accent)" stroke-width="1.8"/>
  <text x="495" y="143" fill="var(--accent)" font-size="10" text-anchor="end">α = 0.8 (max 5×)</text>
  <path d="M50,200 C 100,150 150,120 200,108 C 270,95 350,87 510,82" fill="none" stroke="var(--accent-line)" stroke-width="1.8"/>
  <text x="495" y="75" fill="var(--accent-line)" font-size="10" text-anchor="end">α = 0.9 (max 10×)</text>
  <path d="M50,200 C 100,120 150,75 200,52 C 270,32 350,25 510,22" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-dasharray="4 2"/>
  <text x="495" y="35" fill="var(--accent)" font-size="10" text-anchor="end">α = 0.99 (max 100×)</text>
</svg>
:::

### Důsledky pro design

1. **Optimalizujte sekvenční část.** Pokud máte 95 % paralelní + 5 % sekvenční, snížení sekvenčního na 1 % posune limit z 20× na 100×. Klíčové: hledat **inicializaci, agregaci** a další "serial bottlenecks".
2. **Strategická volba algoritmu.** Algoritmus s 90 % paralelizovatelností a horší konstantou může mít *lepší* asymptotic speedup než algoritmus s 80 %.
3. **Hardware limit.** Pro úlohu s $\alpha = 0.99$ a 1000 procesorech je $S = 91$. Přidat *víc procesorů* nepřinese nic — dostatek byl 100.

## Gustafsonův zákon (1988)

[John Gustafson](https://doi.org/10.1145/42411.42415), Sandia Labs. *Scaled* problém: s víc procesory řešíme *větší* problém ve *stejném čase*.

### Motivace

Amdahl předpokládá *fixed problem*. V praxi se ale paralelní systémy nepoužívají *jen* k zrychlení existujícího problému — typicky se *řeší větší problém*. Pokud máte 1000 procesorů, nehrajete víc Tetris; *simulujete větší atmosféru*.

Pozorování: **sekvenční podíl roste pomaleji než celková práce** s velikostí problému. Pro CFD simulaci s 10× jemnější mřížkou v každém rozměru se inicializace zvětší řádově 10×, ale samotný výpočet ~10000× (≈1000× více buněk a navíc kratší časový krok dle CFL) — superlineární scaling. Sekvenční *podíl* klesá.

### Model

Pro scaled problém na $N$ procesorech:

- Měříme čas *paralelního* běhu $T_N$ = $1$ (normalizace).
- Sekvenční podíl $s$ trvá $s \cdot T_N$.
- Paralelní podíl $p = 1 - s$ trvá $(1 - s) \cdot T_N$ *na N procesorech*.

Kdyby běželo *sekvenčně* (ne paralelně), paralelní část by trvala $N \cdot (1 - s)$. Celkový sekvenční čas:

$$
T_1 = s + N (1 - s)
$$

Speedup:

$$
\boxed{S(N) = s + N(1 - s) = N - s(N - 1)}
$$

### Limit pro $N \to \infty$

$$
S(N) \approx N(1 - s)
$$

**Lineární růst** s $N$. Pro $s = 0.05$ na 1000 procesorech: $S \approx 950$.

### Důsledek

Gustafson říká: pokud *zvětšujete problém s počtem procesorů*, dosáhnete *téměř lineárního* speedupu. Reálné HPC systémy se tak používají — 100 000 procesorů řeší *gigantické* simulace, ne původní problém.

## Když platí který zákon

| | Amdahl | Gustafson |
| :--- | :---: | :---: |
| Velikost problému | fixní | škáluje se s N |
| Použití | zrychlení známého úkolu | větší úloha ve stejném čase |
| Limit speedup | $1/(1-\alpha)$ | $\approx N(1-s)$ |
| Příklady | matrix multiplikace fixed n | CFD simulace, ML training |

**Amdahl** je striktnější — *malý problém* na *velkém* clusteru. Klasický příklad: zrychlit kompilaci. Hodně sekvenčního I/O, parsing.

**Gustafson** je optimističtější — *velký problém*, *velký cluster*. ML training (víc dat = víc trénovacích kroků s víc GPU), weather simulation (jemnější mřížka).

V praxi často oba zákony platí *paralelně* — Amdahl pro malé instance, Gustafson pro velké.

## Karp-Flatt metric

V praxi není vždy snadné odhadnout $\alpha$. **Karp-Flatt experimentální metrika** ([Karp, Flatt 1990](https://doi.org/10.1145/79173.79180)):

$$
e = \frac{1/S(N) - 1/N}{1 - 1/N}
$$

Kde $e$ je *empirický* sekvenční podíl (= $1 - \alpha$). Z měřeného speedupu na $N$ procesorech se *odvodí*.

Pokud $e$ s $N$ roste, znamená to, že se objevuje *parallel overhead* (komunikace, synchronizace) — algoritmus se *nedaří* dobře škálovat.

Praktický nástroj pro diagnostiku, *proč* paralelní algoritmus dává podsizový speedup.

## Cost-optimal a work-efficient

Pojem **cost-optimal** ($c(n) = N \cdot t(n) = O(T_\text{sekv})$) zavádí [[paralelizace-uvod]] (§Cena). Zde navazuje *jemnější* pojem.

Algoritmus je **work-efficient**, pokud "*celková práce*" (počet basic operations) je asymptoticky stejná jako sekvenční. Slabší než cost-optimal, ale praktičtější pro PRAM model.

Příklady:

- Sekvenční sumace 1M čísel: $O(n)$ práce.
- Paralelní *tree reduction* s $n/2$ procesory v $O(\log n)$ čase: práce $O(n \log n)$ → **není** work-efficient. Plýtvá!
- *Optimalizovaná* paralelní sumace s $n/\log n$ procesory v $O(\log n)$ čase: práce $O(n)$ → **je** work-efficient.

Klíčová lekce: rychlejší ≠ levnější. Cost-optimální paralelizace je *netriviální* design.

## Praktické důsledky {tier=practice}

1. **Před paralelizací změřte sekvenční podíl.** Profiler řekne, kde program tráví čas.
2. **Strong scaling vs weak scaling.** Strong = fixed problem on more processors (Amdahl). Weak = larger problem with more processors (Gustafson). Reportujte oba.
3. **N nemůže být nekonečno.** Hardware limit, komunikační overhead. Optimální N často mnohem méně, než si myslíte.
4. **Paralelní overhead** (komunikace, synchronizace) *snižuje* efektivní $\alpha$. Amdahl odhad je *horní* mez; reálně méně.

## Co dál

S limity v ruce, [[flynn-klasifikace]] zavádí standardní taxonomii paralelních architektur — *kategorie*, do kterých se hardwarové platformy řadí (SISD, SIMD, MISD, MIMD). [[ne-vn-architektury]] potom prozkoumá *alternativní* výpočetní modely (dataflow, redukční), které paralelizaci dělají jiným způsobem než klasická von Neumann.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Amdahl, G.M.: „Validity of the single processor approach to achieving large scale computing capabilities" (AFIPS 1967, [DOI 10.1145/1465482.1465560](https://doi.org/10.1145/1465482.1465560)); Gustafson, J.L.: „Reevaluating Amdahl's Law" (Comm. ACM 31(5), 1988, [DOI 10.1145/42411.42415](https://doi.org/10.1145/42411.42415)); Karp, A.H., Flatt, H.P.: „Measuring Parallel Processor Performance" (Comm. ACM 33(5), 1990); Hill, M.D., Marty, M.R.: „Amdahl's Law in the Multicore Era" (IEEE Computer 41(7), 2008).*
