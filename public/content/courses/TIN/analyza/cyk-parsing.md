---
title: CYK algoritmus — parsování bezkontextového jazyka
---

# CYK — Cocke-Younger-Kasami

Po grafových algoritmech přejdeme k **CYK** — klasickému algoritmu pro **test příslušnosti slova k bezkontextovému jazyku**. Algoritmus byl objeven nezávisle třemi autory (Cocke 1970, Younger 1967, Kasami 1965). Klíčová technika: **dynamické programování** nad podslovy.

## Problém

**Vstup**: bezkontextová gramatika $G = (N, \Sigma, P, S)$ v *Chomského normální formě* ([[normalni-formy]]) a slovo $w \in \Sigma^*$.

**Výstup**: `true`, pokud $w \in L(G)$, jinak `false`.

> CYK vyžaduje *CNF* — pravidla pouze typu $A \to BC$ a $A \to a$. Pro obecnou CFG nejdřív aplikujeme převod do CNF ([[normalni-formy]]).

## Naivní řešení

Naivní postup: vyzkoušet všechny derivace. Pro CFG v CNF má derivace slova délky $n$ přesně $2n - 1$ kroků ([[normalni-formy]]). Počet různých derivací roste exponenciálně:

$$
T_\text{naive}(n) = 2^{O(n)}.
$$

Pro $n = 30$ to znamená ~$10^9$ kroků; pro $n = 50$ astronomicky více.

## Idea CYK — DP nad podslovy

**Klíčové pozorování**: pro každý neterminál $X$ a podslovo $w[i..i+j-1]$ (od pozice $i$, délky $j$) chceme určit, **zda lze z $X$ odvodit toto podslovo**:

::: math
T_{i,j} = \{X \in N \mid X \stackrel{*}{\Rightarrow} w_i w_{i+1} \dots w_{i+j-1}\}.
:::

Pak $w \in L(G) \iff S \in T_{1, n}$ (z $S$ lze odvodit celé slovo).

## Rekurence

Pro $j = 1$ (podslovo délky 1):

$$
T_{i, 1} = \{X \mid X \to w_i \in P\}.
$$

Pro $j > 1$: použijeme pravidlo $X \to BC$. Slovo $w_i \dots w_{i+j-1}$ se *rozdělí* na *prefix délky $k$* a *sufix délky $j - k$*:

::: math
T_{i, j} = \big\{X \mid \exists\, k \in \{1, \dots, j-1\}, B \in T_{i, k}, C \in T_{i+k, j-k}: X \to BC \in P\big\}.
:::

Tj. neterminál $X$ může odvodit $w[i..i+j-1]$, pokud existuje pravidlo $X \to BC$ a *bod dělení* $k$, kde $B$ odvodí prefix a $C$ odvodí sufix.

## Algoritmus

```
Vstup: gramatika G v CNF, slovo w = w_1 w_2 ... w_n
Výstup: true, pokud w ∈ L(G)

// Inicializace pro j = 1
for i := 1 to n:
    T[i, 1] := {X | (X → w_i) ∈ P}

// Hlavní cyklus přes rostoucí délky podslov
for j := 2 to n:
    for i := 1 to n - j + 1:
        T[i, j] := ∅
        for k := 1 to j - 1:
            for each (X → BC) ∈ P:
                if B ∈ T[i, k] and C ∈ T[i+k, j-k]:
                    T[i, j] := T[i, j] ∪ {X}

return (S ∈ T[1, n])
```

## Vizualizace tabulky $T_{i,j}$

CYK tabulku obvykle kreslíme jako *trojúhelník*:
* Řádek $j = 1$ obsahuje *jednotlivé symboly* $w_i$.
* Řádek $j = n$ obsahuje *celé slovo* (jediná buňka).
* Buňka $T_{i, j}$ závisí na *dvou předchozích buňkách* na řádcích nižších.

::: svg "CYK tabulka pro slovo abaa v gramatice S → AB | SS | a; A → AA | BC | a; B → AB | b; C → SA | b"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="0.8" fill="var(--bg-card)">
    <rect x="60" y="20" width="60" height="40"/>
    <rect x="120" y="20" width="60" height="40"/>
    <rect x="180" y="20" width="60" height="40"/>
    <rect x="240" y="20" width="60" height="40"/>
    <rect x="60" y="60" width="60" height="40"/>
    <rect x="120" y="60" width="60" height="40"/>
    <rect x="180" y="60" width="60" height="40"/>
    <rect x="60" y="100" width="60" height="40"/>
    <rect x="120" y="100" width="60" height="40"/>
    <rect x="60" y="140" width="60" height="40"/>
  </g>
  <g fill="var(--text-muted)" font-size="10">
    <text x="40" y="42" text-anchor="end">j=1</text>
    <text x="40" y="82" text-anchor="end">j=2</text>
    <text x="40" y="122" text-anchor="end">j=3</text>
    <text x="40" y="162" text-anchor="end">j=4</text>
    <text x="90" y="200" text-anchor="middle">a</text>
    <text x="150" y="200" text-anchor="middle">b</text>
    <text x="210" y="200" text-anchor="middle">a</text>
    <text x="270" y="200" text-anchor="middle">a</text>
    <text x="90" y="215" text-anchor="middle">i=1</text>
    <text x="150" y="215" text-anchor="middle">i=2</text>
    <text x="210" y="215" text-anchor="middle">i=3</text>
    <text x="270" y="215" text-anchor="middle">i=4</text>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10.5" font-family="ui-monospace, monospace">
    <text x="90" y="44">S,A</text>
    <text x="150" y="44">B,C</text>
    <text x="210" y="44">S,A</text>
    <text x="270" y="44">S,A</text>
    <text x="90" y="84">S,B</text>
    <text x="150" y="84">∅</text>
    <text x="210" y="84">S,A,C</text>
    <text x="90" y="124">S,C</text>
    <text x="150" y="124">A</text>
    <text x="90" y="164" font-weight="bold" fill="var(--accent)">S,A,C</text>
  </g>
  <text x="270" y="50" fill="var(--text-muted)" font-size="10">  ← řádek j=1: vlož X pro každé pravidlo X → wᵢ</text>
  <text x="270" y="90" fill="var(--text-muted)" font-size="10">  ← řádek j=2: pro podslova délky 2</text>
  <text x="270" y="130" fill="var(--text-muted)" font-size="10">  ← řádek j=3: kombinace dělení</text>
  <text x="270" y="170" fill="var(--accent)" font-size="10">  ← řádek j=4: celé slovo. S ∈ T[1,4] → přijato</text>
</svg>
:::

V příkladu výše vidíme, že $S \in T_{1, 4}$ — slovo $abaa$ je v jazyce gramatiky.

::: viz cyk-parsing "Krokuj plnění CYK tabulky pro gramatiku v CNF generující {a^n b^n}. Aktivní buňka ukazuje rozklad k a které pravidlo X → BC se aplikuje."
:::

## Analýza složitosti

* **Velikost tabulky**: $T_{i, j}$ má $O(n^2)$ buněk (přesněji $n(n+1)/2$ za trojúhelníkový tvar).
* **Výpočet jedné buňky**: pro každou buňku iterujeme $j - 1$ rozdělení × $|P|$ pravidel. Pro malé $|P|$ je to $O(n)$ na buňku.

**Celková složitost** (s konstantním počtem pravidel):

::: math
T_\text{CYK}(n) = O(n^3).
:::

**Prostorová složitost**: $O(n^2)$ (velikost tabulky).

> Asymptoticky **lepší** algoritmy pro CFG parsing existují — Valiant (1975) ukázal redukci na maticové násobení, $O(n^{\omega})$ kde $\omega \approx 2.37$. Pro praktické účely je CYK *jednoduchý* a dostatečně rychlý.

## Příklad CYK

Vezměme gramatiku v CNF:

$$
\begin{aligned}
S &\to AB \mid SS \mid a, \\
A &\to AA \mid BC \mid a, \\
B &\to AB \mid b, \\
C &\to SA \mid b.
\end{aligned}
$$

A slovo $w = abaa$ ($n = 4$).

**Řádek $j = 1$:**
* $T_{1, 1} = \{S, A\}$ (z $a$).
* $T_{2, 1} = \{B, C\}$ (z $b$).
* $T_{3, 1} = \{S, A\}$ (z $a$).
* $T_{4, 1} = \{S, A\}$ (z $a$).

**Řádek $j = 2$:**

$T_{1, 2}$ pro slovo $w_1 w_2 = ab$, dělení $k = 1$:
* $T_{1, 1} = \{S, A\}$, $T_{2, 1} = \{B, C\}$.
* Hledáme pravidla $X \to YZ$ s $Y \in \{S, A\}$, $Z \in \{B, C\}$:
  * $S \to AB$: $A \in T_{1,1}, B \in T_{2,1}$. ✓
  * $A \to BC$: $B \notin T_{1,1}$. ✗
  * $B \to AB$: $A \in T_{1,1}, B \in T_{2,1}$. ✓
* $T_{1, 2} = \{S, B\}$.

$T_{2, 2}$ pro $w_2 w_3 = ba$, dělení $k = 1$:
* $T_{2, 1} = \{B, C\}$, $T_{3, 1} = \{S, A\}$.
* Hledáme $X \to YZ$, $Y \in \{B, C\}$, $Z \in \{S, A\}$:
  * $A \to BC$: $C \notin \{S, A\}$. ✗
  * $C \to SA$: $S \notin \{B, C\}$. ✗
* Žádné pravidlo nemá pravou stranu $YZ$ s $Y \in \{B, C\}$ a $Z \in \{S, A\}$, takže $T_{2, 2} = \emptyset$.

$T_{3, 2}$ pro $w_3 w_4 = aa$, dělení $k = 1$:
* $T_{3, 1} = \{S, A\}$, $T_{4, 1} = \{S, A\}$.
* Hledáme $X \to YZ$, $Y \in \{S, A\}$, $Z \in \{S, A\}$:
  * $S \to SS$: $S \in T_{3,1}, S \in T_{4,1}$. ✓
  * $A \to AA$: $A \in T_{3,1}, A \in T_{4,1}$. ✓
  * $C \to SA$: $S \in T_{3,1}, A \in T_{4,1}$. ✓
* $T_{3, 2} = \{S, A, C\}$.

**Řádek $j = 3$:**

$T_{1, 3}$ pro $w_1 w_2 w_3 = aba$: dělení $k = 1$ ($T_{1,1} \times T_{2,2} = \emptyset$) nepřispěje; pro $k = 2$ ($T_{1,2} = \{S, B\}$, $T_{3,1} = \{S, A\}$) přidá $S$ ($S \to SS$) a $C$ ($C \to SA$). Tedy $T_{1, 3} = \{S, C\}$.

$T_{2, 3}$ pro $w_2 w_3 w_4 = baa$: pro $k = 1$ ($T_{2,1} = \{B, C\}$, $T_{3,2} = \{S, A, C\}$) přidá $A$ ($A \to BC$); $k = 2$ ($T_{2,2} = \emptyset$) nepřispěje. Tedy $T_{2, 3} = \{A\}$.

**Řádek $j = 4$:**

$T_{1, 4}$ pro $w_1 w_2 w_3 w_4 = abaa$ kombinuje dělení $k = 1, 2, 3$ a vyjde $T_{1, 4} = \{S, A, C\}$.

**Závěr**: $S \in T_{1, 4}$, slovo $abaa$ je v $L(G)$.

## Praktické použití CYK

* **Parsing přirozeného jazyka** — některé NLP toolkit (Stanford NLP) používají variantu CYK.
* **Verifikace formálních specifikací** — některé property-checking algoritmy redukují na *membership in CFG*.
* **Statická analýza programů** — datové toky lze modelovat jako CFG-reachability.
* **Bioinformatika** — sekundární struktura RNA (s pseudoknotami) je analyzována přes CFG.

## Alternativní algoritmy

Pro **deterministické CFG (LR(k))** existují *lineární* parsovací algoritmy (yacc, bison). Pro **obecnou CFG** zůstávají $O(n^3)$ varianty:

| Algoritmus | Složitost | Charakteristika |
| :--- | :-: | :--- |
| CYK | $O(n^3)$ | DP, vyžaduje CNF |
| Earley | $O(n^3)$ worst, $O(n^2)$ unambiguous, $O(n)$ LR | Adaptivní, žádná CNF |
| Valiant | $O(n^\omega) \approx O(n^{2.37})$ | Asymptoticky nejlepší, prakticky neefektivní |
| GLR (Tomita) | $O(n^3)$ worst | Generalizace LR pro nejednoznačné gramatiky |

## CYK jako důkazový nástroj

CYK formálně dokazuje *rozhodnutelnost* členství v CFG ([[vlastnosti-bkj]]). Algoritmus je *konstruktivní* — z $T_{i, j}$ lze zpětně rekonstruovat *derivační strom*, čímž doplňujeme kromě "ano/ne" i *konkrétní svědek* příslušnosti.

## Z hlediska teorie složitosti

* CFG parsing je v $\mathrm{P}$.
* Rozšířené modely (např. CFG s parametry, gramatiky se zápornými předponami) mohou být NP-úplné nebo PSPACE-úplné.
* **Universalita CFG** ($L(G) = \Sigma^*$) je *nerozhodnutelná* ([[vlastnosti-bkj]]) — opět hranice mezi *konkrétní* otázkou (členství) a *generální* otázkou (universalita).

[[amortizovana]] uzavře topic — *amortizovaná analýza* dává přesnější hranice pro algoritmy se *střídavě dragů* a *levných* operacemi (např. dynamicky alokované struktury).

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Cocke, J., Schwartz, J.T.: *Programming Languages and Their Compilers* (NYU Courant Institute, 1970); Younger, D.H.: *Recognition and Parsing of Context-Free Languages in Time n³* (Inf. and Control, 1967); Kasami, T.: *An Efficient Recognition and Syntax Analysis Algorithm for Context-Free Languages* (AFCRL-65-758, 1965); Valiant, L.G.: *General Context-Free Recognition in Less than Cubic Time* (J. Comput. Sys. Sci., 1975).*
