---
title: Základní PRAM algoritmy — redukce, OR, hledání
---

# Základní PRAM algoritmy

Předchozí kapitoly ([[pram-uvod]], [[pram-varianty]], [[pram-simulace]]) zavedly *model*. Tato kapitola ukazuje, *jak* se v PRAM píší algoritmy a *jak* se analyzují. Probíráme tři kanonické příklady — **paralelní redukci** (suma/min/max), **paralelní OR** a **paralelní hledání v ne-seřazené posloupnosti** — a u každého porovnáme čas a cenu mezi variantami EREW, CREW a CRCW. Tyto algoritmy slouží jako *stavební bloky* pro pokročilejší — třídění, hledání v seřazeném poli (viz topic Paralelní vyhledávání), suma prefixů (viz topic Komunikační operace).

## Redukce stromem — suma, min, max

**Úloha**: pro vstupní posloupnost $A[1..n]$ a *asociativní* binární operaci $\oplus$ (nejčastěji $+$, $\min$, $\max$, $\text{AND}$, $\text{OR}$) spočítat $a_1 \oplus a_2 \oplus \cdots \oplus a_n$.

Sekvenčně: $O(n)$ jednoduchým průchodem.

Paralelně se redukce řeší **binárním stromem** — nejprve se v každé úrovni spárují sousední prvky a aplikuje se $\oplus$, poté se postup opakuje s polovičním vstupem.

::: svg "Paralelní redukce stromem — log n úrovní pro 8 vstupů"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" fill="var(--bg-card)" stroke-width="1">
    <rect x="40" y="170" width="34" height="22"/>
    <rect x="100" y="170" width="34" height="22"/>
    <rect x="160" y="170" width="34" height="22"/>
    <rect x="220" y="170" width="34" height="22"/>
    <rect x="280" y="170" width="34" height="22"/>
    <rect x="340" y="170" width="34" height="22"/>
    <rect x="400" y="170" width="34" height="22"/>
    <rect x="460" y="170" width="34" height="22"/>
    <rect x="70" y="120" width="34" height="22"/>
    <rect x="190" y="120" width="34" height="22"/>
    <rect x="310" y="120" width="34" height="22"/>
    <rect x="430" y="120" width="34" height="22"/>
    <rect x="130" y="70" width="34" height="22"/>
    <rect x="370" y="70" width="34" height="22"/>
    <rect x="250" y="20" width="34" height="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="57" y="185">3</text>
    <text x="117" y="185">1</text>
    <text x="177" y="185">7</text>
    <text x="237" y="185">0</text>
    <text x="297" y="185">4</text>
    <text x="357" y="185">1</text>
    <text x="417" y="185">6</text>
    <text x="477" y="185">3</text>
    <text x="87" y="135">4</text>
    <text x="207" y="135">7</text>
    <text x="327" y="135">5</text>
    <text x="447" y="135">9</text>
    <text x="147" y="85">11</text>
    <text x="387" y="85">14</text>
    <text x="267" y="35">25</text>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.6">
    <line x1="57" y1="170" x2="87" y2="142"/>
    <line x1="117" y1="170" x2="87" y2="142"/>
    <line x1="177" y1="170" x2="207" y2="142"/>
    <line x1="237" y1="170" x2="207" y2="142"/>
    <line x1="297" y1="170" x2="327" y2="142"/>
    <line x1="357" y1="170" x2="327" y2="142"/>
    <line x1="417" y1="170" x2="447" y2="142"/>
    <line x1="477" y1="170" x2="447" y2="142"/>
    <line x1="87" y1="120" x2="147" y2="92"/>
    <line x1="207" y1="120" x2="147" y2="92"/>
    <line x1="327" y1="120" x2="387" y2="92"/>
    <line x1="447" y1="120" x2="387" y2="92"/>
    <line x1="147" y1="70" x2="267" y2="42"/>
    <line x1="387" y1="70" x2="267" y2="42"/>
  </g>
  <text x="525" y="185" fill="var(--text-muted)" font-size="9" text-anchor="end">úroveň 0</text>
  <text x="525" y="135" fill="var(--text-muted)" font-size="9" text-anchor="end">úroveň 1</text>
  <text x="525" y="85" fill="var(--text-muted)" font-size="9" text-anchor="end">úroveň 2</text>
  <text x="525" y="35" fill="var(--text-muted)" font-size="9" text-anchor="end">úroveň 3 = výsledek</text>
</svg>
:::

### Algoritmus (EREW)

```
procedure REDUCE(A[1..n], ⊕)   // n = 2^k
  for ℓ = 1 to log n do
    for i = 1 to n/2^ℓ do in parallel
      A[i] ← A[2i-1] ⊕ A[2i]
    endfor
  endfor
  return A[1]
```

V iteraci $\ell$ je aktivních $n/2^\ell$ procesorů, každý z nich čte *dvě* různé buňky a zapisuje *jednu* — vždy *exclusive* (různí procesoři pracují s různými buňkami). Stačí **EREW**.

### Analýza

- **Počet kroků** $t(n) = O(\log n)$ — výška binárního stromu.
- **Počet procesorů** $p(n) = n/2$ (v první úrovni; v dalších se polovičí).
- **Cena** $c(n) = p(n) \cdot t(n) = (n/2) \log n = O(n \log n)$.

Sekvenční algoritmus má $T_\text{sekv} = O(n)$. Paralelní cena $O(n\log n) > O(n)$ — **algoritmus není cost-optimal**.

### Brentova konstrukce — cost-optimal verze

Použijeme **méně** procesorů: $p = n / \log n$. Každý procesor *sekvenčně* sečte $\log n$ prvků (úsek), poté následuje strom redukce na $p$ částečných výsledků.

- Fáze 1 (lokální suma): $O(\log n)$ kroků sekvenčně na $p$ procesorech.
- Fáze 2 (redukce $p$ částečných součtů stromem): $O(\log p) = O(\log n)$ kroků.

Celkem $t(n) = O(\log n)$, $p(n) = n/\log n$, cena $c(n) = (n/\log n) \cdot \log n = O(n)$. **Cost-optimal.**

Tato dvoufázová konstrukce je *standardní* pattern v PRAM algoritmizaci — *„lokálně sekvenční, globálně paralelní"*.

## Paralelní OR

**Úloha**: pro $n$ bitů $a_1, \dots, a_n$ spočítat $a_1 \vee a_2 \vee \cdots \vee a_n$.

### EREW

Použijeme redukci stromem se $\oplus = \vee$. Čas $O(\log n)$, cena $O(n)$ s Brentovou konstrukcí.

### CRCW (COMMON)

```
procedure OR(A[1..n])    // COMMON CRCW
  R ← 0      // inicializace výsledné buňky
  for i = 1 to n do in parallel
    if A[i] = 1 then R ← 1
  endfor
  return R
```

Všichni, kdo zapisují, zapisují *tutéž hodnotu* 1 — COMMON-kompatibilní konflikt. Čas $O(1)$, počet procesorů $n$, cena $O(n)$.

**Pozorování**: na CRCW dostaneme OR v *konstantním* čase, kdežto EREW vyžaduje $\Omega(\log n)$. Toto je **fundamentální separace** mezi modely (dokazuje se *adversarial* argumentem).

| Model | Čas OR | Cena |
| :--- | :---: | :---: |
| EREW | $O(\log n)$ | $O(n)$ s Brentem |
| CREW | $O(\log n)$ | $O(n)$ |
| CRCW COMMON | $O(1)$ | $O(n)$ |
| CRCW ARBITRARY | $O(1)$ | $O(n)$ |
| CRCW PRIORITY | $O(1)$ | $O(n)$ |

CREW *neumí* OR rychleji než EREW — paralelní zápis chybí. CRCW přidává sílu právě tam, kde je potřeba.

## Paralelní hledání v ne-seřazené posloupnosti

**Úloha**: pro posloupnost $S = (s_1, s_2, \dots, s_n)$ (*neuspořádanou*) a hodnotu $x$ najít index $k$ takový, že $s_k = x$, nebo oznámit, že neexistuje.

Sekvenčně: $O(n)$ lineárním průchodem.

### PRAM algoritmus s $N$ procesory {tier=example}

```
procedure SEARCH(S[1..n], x, N)
  (1) for i = 1 to N do in parallel
        read x
      endfor                          // distribuce hodnoty x
  (2) for i = 1 to N do in parallel
        S_i ← S[(i-1)(n/N)+1 .. i(n/N)]
        SEQUENTIAL_SEARCH(S_i, x, k_i)
      endfor                          // lokální hledání
  (3) for i = 1 to N do in parallel
        if k_i > 0 then k ← k_i
      endfor                          // sloučení výsledků
```

Krok 1 distribuuje hledanou hodnotu mezi všechny procesory. Krok 2 každý procesor prohledá sekvenčně svůj blok $n/N$ prvků. Krok 3 zjistí, jestli některý procesor něco našel, a zapíše výsledek.

### Analýza

| Model | Krok 1 (broadcast) | Krok 2 (lokální) | Krok 3 (slučování) | Celkový čas | Cena |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **EREW** | $O(\log N)$ | $O(n/N)$ | $O(\log N)$ | $O(\log N + n/N)$ | $O(N \log N + n)$ |
| **CREW** | $O(1)$ | $O(n/N)$ | $O(\log N)$ | $O(\log N + n/N)$ | $O(N \log N + n)$ |
| **CRCW** | $O(1)$ | $O(n/N)$ | $O(1)$ | $O(n/N)$ | $O(n)$ |

- **EREW**: krok 1 vyžaduje *broadcast* (binární strom), $O(\log N)$. Krok 3 *redukce* OR-stromem.
- **CREW**: krok 1 je triviální (všichni čtou současně). Krok 3 stále vyžaduje redukci.
- **CRCW**: krok 3 se redukuje na *jeden zápis* — vítězný procesor zapíše svůj index (PRIORITY: nejnižší vyhrává; COMMON: pokud více najde tu hodnotu, můžou si shodnout).

**CRCW je cost-optimal**: $c = O(n)$. Ostatní modely mají $c = O(N\log N + n)$, což je optimal jen když $N \le n/\log n$.

## Hledání v seřazeném poli — n-ární vyhledávání

Pokud je $S$ *seřazené*, sekvenční binární vyhledávání má $T_\text{sekv} = O(\log n)$. Paralelně lze udělat **$N$-ární vyhledávání** s $N$ procesory.

**Idea**: místo dvou poloviček (sekvenční binární search) prohledáváme $N + 1$ pásem. V každém kroku každý z $N$ procesorů zkoumá *jednu* dělící pozici. Z $N$ porovnání zjistíme, ve které části je hledaná hodnota.

Pro hledání 1 hodnoty v poli velikosti $n$ s $N$ procesory: $g = \lceil \log(n+1)/\log(N+1) \rceil$ kroků.

::: math
t(n) = O\!\left( \log_{N+1}(n+1) \right) \quad,\quad c(n) = O\!\left( N \log_{N+1} n \right)
:::

Vyžaduje **CREW** (všichni procesoři čtou původní pole, ale zápisy si nepřekrývají).

Cena *není optimal* — sekvenční binární search je $O(\log n)$, paralelní *plýtvá* faktorem $N$.

Pro praktické použití má smysl jen když *latence* (čas) je důležitější než *cena* — typicky při real-time hledání.

## Hledání ve stromě

Topologie binárního stromu s $2n - 1$ procesory (vnitřní uzly + listy). Listy obsahují prvky.

```
procedure TREE_SEARCH(x)
  (1) kořen načte x a předá synům                  // O(log n)
  (2) listy porovnají svou hodnotu s x → 0 nebo 1  // O(1)
  (3) každý vnitřní uzel: výsledek = OR(syn1, syn2)
      → předá vzhůru                               // O(log n)
  return kořen                                     // 0 = nenalezeno, 1 = nalezeno
```

Krok (1): $O(\log n)$ pro broadcast od kořene k listům.
Krok (2): $O(1)$.
Krok (3): $O(\log n)$ redukce OR vzhůru.

Celkem $t(n) = O(\log n)$, $p(n) = 2n - 1$, $c(n) = O(n \log n)$. **Není optimal**, ale topologie odpovídá *konkrétnímu hardwaru* (tree-connected machines).

## Praktická pravidla — design PRAM algoritmů {tier=practice}

1. **Začni v silnějším modelu**. Návrh v CRCW je často přímější. Pak ho *simuluj* na EREW, pokud cílový hardware to vyžaduje.
2. **Hledej balanced binární strom**. Většina paralelních algoritmů má kostru *redukce* nebo *broadcastu* — $O(\log n)$ kroků s $O(n)$ procesorů je *jednoduchý* recept.
3. **Cost-optimalita přes Brenta**. Pokud naivně dostaneš $O(n \log n)$ cenu, použij **$n/\log n$** procesorů a *sekvenční* fázi. Cena se sníží na $O(n)$.
4. **Načti vstup do lokální paměti**, kde je to možné — *omezíš* přístupy do sdílené paměti.
5. **Hierarchie síly modelu vs realita**: CRCW konstantní čas pro OR/MAX vyžaduje hardware s atomic-or. Realita: většinou jen CREW s log slow-down.

## Co dál

Topic [[broadcast-redukce]] formálně rozebere *broadcast operaci* — distribuce hodnoty mezi všechny procesory — a *redukce* (inverzní pohyb dat). Topic [[prefix-sum-uvod]] zavádí **sumu prefixů (scan)**, *fundamentální stavební blok* mnoha paralelních algoritmů. Pokročilé třídění (bitonic merge sort, sample sort) a paralelní maticové operace už předpokládají, že tyto základní bloky umíme.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=xLnQet8cIVA" "SZZ: Model PRAM, suma prefixů" "Tomáš Kocourek"
:::

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Akl, S.G.: *The Design and Analysis of Parallel Algorithms* (Prentice Hall 1989), kap. 5 (Searching); JáJá, J.: *An Introduction to Parallel Algorithms* (Addison-Wesley 1992), kap. 2–3; Reif, J.: *Synthesis of Parallel Algorithms* (Morgan Kaufmann 1993); Brent, R.P.: „The Parallel Evaluation of General Arithmetic Expressions" (J. ACM 21(2), 1974, [DOI 10.1145/321812.321815](https://doi.org/10.1145/321812.321815)); cp-algorithms — [Parallel computation primitives](https://cp-algorithms.com/) (referenční implementace).*
