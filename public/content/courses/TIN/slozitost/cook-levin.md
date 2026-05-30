---
title: Cook-Levinova věta — SAT je NP-úplný
---

# Cook-Levinova věta

[[tridy-p-np]] zavedl pojem **NP-úplnosti**: jazyk $L \in \mathrm{NP}$ je NP-úplný, pokud se na něj polynomiálně redukuje *každý* jazyk z $\mathrm{NP}$. *Existence* takového jazyka byla netriviální — kdyby žádný neexistoval, NP-úplnost by byla prázdná abstrakce. **Cookova-Levinova věta** (Cook 1971, Levin 1973 nezávisle) dokazuje, že **problém splnitelnosti booleovských formulí (SAT) je NP-úplný**. Tím založila *celou teorii NP-úplnosti*.

## Problém splnitelnosti

**Definice.** Nechť $V = \{v_1, v_2, \dots, v_m\}$ je konečná množina **booleovských proměnných**.

* **Literál** je proměnná $v_i$ nebo její negace $\bar{v}_i$.
* **Klauzule** je disjunkce literálů: $\ell_1 \lor \ell_2 \lor \dots \lor \ell_k$.
* **Konjunktivní normální forma (KNF, CNF)**: konjunkce klauzulí: $C_1 \land C_2 \land \dots \land C_n$, kde každé $C_i$ je klauzule.

**SAT problém**: dána formule $\Phi$ v KNF nad proměnnými $V$. Existuje *přiřazení* $\sigma : V \to \{0, 1\}$, pro něž $\Phi$ vyhodnotí na $1$?

**Jazyk SAT:**

::: math
L_\mathrm{SAT} = \{\langle\Phi\rangle \mid \Phi \text{ je splnitelná formule v KNF}\}.
:::

**Příklady:**
* $\Phi_1 = (x_1 \lor x_2) \land (\bar{x}_1 \lor x_3)$ — splnitelná: $x_1 = 1, x_2 = 0, x_3 = 1$.
* $\Phi_2 = x_1 \land \bar{x}_1$ — nesplnitelná.
* $\Phi_3 = (x_1 \lor x_2 \lor x_3) \land (\bar{x}_1 \lor \bar{x}_2 \lor x_3) \land (x_1 \lor \bar{x}_2 \lor \bar{x}_3)$ — splnitelná.

## SAT je v NP

**Argument "Guess & Check"**:

```
NTS pro SAT:
  1. Nedeterministicky uhádne přiřazení σ ∈ {0,1}^m.
  2. Deterministicky vyhodnotí Φ pod σ.
  3. Pokud Φ(σ) = 1, přijme; jinak zamítne.
```

Krok 1 je $O(m)$ kroků. Krok 2 je $O(|\Phi|)$ kroků (projde všechny literály). Celkem $O(|\Phi|)$ — *lineární* v délce vstupu.

Tedy $L_\mathrm{SAT} \in \mathrm{NP}$.

> Princip *guess & check* je obecná technika pro důkaz NP-členství: pokud problém má *krátký certifikát* (zde přiřazení), který lze polynomiálně *ověřit*, je v NP.

## Cookova-Levinova věta

**Věta (Cook 1971, Levin 1973).** *Jazyk $L_\mathrm{SAT}$ je NP-úplný*. Tj.:

1. $L_\mathrm{SAT} \in \mathrm{NP}$,
2. Pro každý $L \in \mathrm{NP}$ platí $L \leq^m_P L_\mathrm{SAT}$.

Důkaz bodu 1 jsme provedli výše. Bod 2 je *jádro věty* — pro libovolný $L \in \mathrm{NP}$ sestrojíme polynomiální redukci na SAT.

## Důkaz redukce $L \leq^m_P L_\mathrm{SAT}$

Vezměme libovolný $L \in \mathrm{NP}$. Existuje NTS $M$ s časovou složitostí $p(n)$ (polynom) takový, že $L = L(M)$.

**Cíl.** Pro vstup $w$ sestrojit booleovskou formuli $\Phi_w$ takovou, že:

$$
\Phi_w \text{ je splnitelná} \iff M \text{ přijme } w.
$$

### Booleovské proměnné

Vytvoříme proměnné modelující:

* **Stav** v každém čase: $S_{i,q} = 1$ ⟺ "v kroku $i$ je stroj ve stavu $q$".
* **Pozice hlavy** v každém čase: $H_{i,j} = 1$ ⟺ "v kroku $i$ je hlava na buňce $j$".
* **Obsah pásky** v každém čase: $T_{i,j,a} = 1$ ⟺ "v kroku $i$ je v buňce $j$ symbol $a$".

Celkový počet proměnných:

* $S$: $p(n) \cdot |Q|$,
* $H$: $p(n) \cdot p(n) = p(n)^2$ (hlava může být maximálně v $p(n)$ různých pozicích),
* $T$: $p(n)^2 \cdot |\Gamma|$.

Celkem $O(p(n)^2)$ — polynomiální.

### Klauzule formule

Formuli $\Phi_w$ konstruujeme jako konjunkci klauzulí kódujících:

1. **Stav je v každém čase právě jeden:**
   * $\bigvee_{q \in Q} S_{i,q}$ — *aspoň jeden* stav,
   * $\neg S_{i,q} \lor \neg S_{i,q'}$ pro $q \neq q'$ — *nejvýše jeden* stav.

2. **Hlava je v každém čase právě v jedné pozici:**
   * Analogicky.

3. **Obsah každé buňky je v každém čase právě jeden symbol:**
   * Analogicky.

4. **Počáteční konfigurace:** $T_{0, 1, w_1} \land T_{0, 2, w_2} \land \dots \land T_{0, |w|, w_{|w|}} \land T_{0, j, \Delta}$ pro $j > |w|$, $S_{0, q_0} = 1$, $H_{0, 1} = 1$.

5. **Akceptace:** existuje čas $i \leq p(n)$, kdy $S_{i, q_F} = 1$.

6. **Lokálnost přechodů:** pro každý čas $i$ a buňku $j$ — obsah buňky $j$ v čase $i+1$ závisí *jen* na obsahu buněk $j-1, j, j+1$ v čase $i$ a stavu/hlavě. Toto kóduje *konzistenci přechodové funkce* $\delta$.

Klauzule 1, 2, 3 a 6 mají celkem $O(p(n)^2 \cdot |Q| \cdot |\Gamma|)$ klauzulí — polynomiální v $n$.

### Korektnost

Formule $\Phi_w$ je *splnitelná* právě když existuje *konzistentní výpočet* $M$ délky $\leq p(n)$, který dorazí do $q_F$ — tj. $M$ přijme $w$.

Tedy $w \in L \iff M \text{ přijme } w \iff \Phi_w \in L_\mathrm{SAT}$.

### Polynomiální vyčíslitelnost redukce

Konstrukce $\Phi_w$ ze vstupu $w$ probíhá *systematicky* — vyplníme tabulky proměnných, vygenerujeme klauzule po vzoru. Vše v polynomiálním čase.

::: svg "Cook-Levin redukce — schema tabulky stavů, hlavy a obsahu pásky"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10.5">
  <g stroke="var(--line-strong)" stroke-width="0.7" fill="none">
    <rect x="60" y="20" width="400" height="150"/>
    <line x1="60" y1="50" x2="460" y2="50"/>
    <line x1="60" y1="80" x2="460" y2="80"/>
    <line x1="60" y1="110" x2="460" y2="110"/>
    <line x1="60" y1="140" x2="460" y2="140"/>
    <line x1="120" y1="20" x2="120" y2="170"/>
    <line x1="180" y1="20" x2="180" y2="170"/>
    <line x1="240" y1="20" x2="240" y2="170"/>
    <line x1="300" y1="20" x2="300" y2="170"/>
    <line x1="360" y1="20" x2="360" y2="170"/>
    <line x1="420" y1="20" x2="420" y2="170"/>
  </g>
  <g fill="var(--text-muted)" font-size="10">
    <text x="40" y="35" text-anchor="end">i=0</text>
    <text x="40" y="65" text-anchor="end">i=1</text>
    <text x="40" y="95" text-anchor="end">i=2</text>
    <text x="40" y="125" text-anchor="end">⋮</text>
    <text x="40" y="158" text-anchor="end">i=p(n)</text>
    <text x="90" y="13" text-anchor="middle">j=1</text>
    <text x="150" y="13" text-anchor="middle">j=2</text>
    <text x="210" y="13" text-anchor="middle">j=3</text>
    <text x="270" y="13" text-anchor="middle">…</text>
    <text x="330" y="13" text-anchor="middle">j=p(n)</text>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="90" y="38">w₁</text>
    <text x="150" y="38">w₂</text>
    <text x="210" y="38">w₃</text>
    <text x="270" y="38">∆</text>
    <text x="330" y="38">∆</text>
    <text x="90" y="68">?</text>
    <text x="150" y="68">?</text>
    <text x="210" y="68">?</text>
    <text x="270" y="68">?</text>
    <text x="330" y="68">?</text>
  </g>
  <text x="270" y="185" text-anchor="middle" fill="var(--text-muted)" font-size="10">Pro každou buňku (i, j) máme proměnné T_{i,j,a}, S_{i,q}, H_{i,j}.</text>
</svg>
:::

## Důsledky Cookovy-Levinovy věty

* **NP-úplných problémů je nekonečně mnoho.** Z $L_\mathrm{SAT}$ se polynomiálně redukuje na *libovolný* NP problém pomocí dalších redukcí.
* **NP-úplnost zachovává polynomiální čas.** Pokud najdeme *polynomiální algoritmus pro jediný* NP-úplný problém, dostaneme polynomiální algoritmy pro *všechny* NP problémy → $\mathrm{P} = \mathrm{NP}$.
* **Mezi NP-úplnými problémy lze přejít.** Karp ukázal řadu klasických redukcí; dnes je známo tisíce NP-úplných problémů ze všech oblastí informatiky.

## 3-SAT je NP-úplný

**Definice.** *3-SAT* je SAT problém omezený na klauzule s *přesně 3 literály*:

$$
L_{3\text{-SAT}} = \{\langle\Phi\rangle \mid \Phi \in \text{3-CNF a } \Phi \text{ je splnitelná}\}.
$$

**Věta (Karp).** $L_{3\text{-SAT}}$ je NP-úplný.

**Důkaz** redukcí $L_\mathrm{SAT} \leq^m_P L_{3\text{-SAT}}$.

**Idea.** Každou klauzuli v $\Phi$ převedeme na *konjunkci 3-klauzulí* tak, aby zachovala splnitelnost. Pravidla podle počtu literálů $k$:

| Délka $k$ | Klauzule $c$ | Náhrada |
| :-: | :--- | :--- |
| 1 | $\ell_1$ | $\ell_1 \lor \ell_1 \lor \ell_1$ |
| 2 | $\ell_1 \lor \ell_2$ | $\ell_1 \lor \ell_2 \lor \ell_1$ |
| 3 | $\ell_1 \lor \ell_2 \lor \ell_3$ | ponech |
| 4 | $\ell_1 \lor \ell_2 \lor \ell_3 \lor \ell_4$ | $(\ell_1 \lor \ell_2 \lor y) \land (\neg y \lor \ell_3 \lor \ell_4)$, $y$ nová prom. |
| $k > 3$ | $\ell_1 \lor \dots \lor \ell_k$ | viz dále |

**Pro $k > 4$:** rozdělíme klauzuli na řetězec 3-klauzulí pomocí *nových proměnných*:

$$
(\ell_1 \lor \ell_2 \lor y_1) \land (\neg y_1 \lor \ell_3 \lor y_2) \land (\neg y_2 \lor \ell_4 \lor y_3) \land \dots \land (\neg y_{k-3} \lor \ell_{k-1} \lor \ell_k).
$$

**Korektnost.** Lze ukázat indukcí: každá $k$-klauzule je splnitelná *právě když* je splnitelná odpovídající konjunkce 3-klauzulí. (V dopředném směru: triviálně. V zpětném: pokud jsou všechny $\ell_i$ nepravdivé, první klauzule $(\ell_1 \lor \ell_2 \lor y_1)$ vynutí $y_1 = 1$, pak $(\neg y_1 \lor \ell_3 \lor y_2)$ vynutí $y_2 = 1$, …, kaskádou $y_1 = \dots = y_{k-3} = 1$; poslední klauzule $(\neg y_{k-3} \lor \ell_{k-1} \lor \ell_k)$ pak nemá žádný splněný literál → spor.)

**Polynomiální čas.** Pro klauzuli délky $k$ vzniknou $k - 2$ klauzulí délky 3 a $k - 3$ nových proměnných. Celá redukce roste *lineárně* s celkovou délkou formule.

## 2-SAT *není* NP-úplný — je v P

Stejnou redukci pro 2-SAT *nelze* udělat (klauzule s 2 literály nelze rozdělit zachováním splnitelnosti). Naopak: **2-SAT je v $\mathrm{P}$**.

**Algoritmus.** Klauzule $\ell_1 \lor \ell_2$ je *ekvivalentní implikacím* $\neg\ell_1 \to \ell_2$ a $\neg\ell_2 \to \ell_1$. Postavíme **implikační graf**: vrcholy = literály, hrana $a \to b$ pro každou implikaci.

* $\Phi$ je nesplnitelná ⟺ existuje proměnná $v$ taková, že v implikačním grafu vede cesta jak z $v$ do $\neg v$, tak z $\neg v$ do $v$.
* Detekce přes silně souvislé komponenty (Tarjan, [[grafy-prochazeni]]) — $O(V + E)$.

Tato dichotomie *2-SAT $\in \mathrm{P}$* / *3-SAT NP-úplný* je *charakteristická* pro mnoho problémů — *malé změny* v zadání mění složitost dramatocky.

## Další klasické NP-úplné problémy

Z 3-SAT se redukcí dokazují další klasické NP-úplné problémy (Karp 1972):

| Problém | Stručně |
| :--- | :--- |
| **CLIQUE** | Má graf kliku velikosti $k$? |
| **Vertex Cover** | Má graf vrcholové pokrytí velikosti $k$? |
| **Independent Set** | Má graf nezávislou množinu velikosti $k$? |
| **Hamilton Cycle** | Má graf Hamiltonovský cyklus? |
| **TSP** (Traveling Salesman) | Existuje hamiltonovský cyklus s nákladem $\leq k$? |
| **Subset Sum** | Existuje podmnožina čísel s daným součtem? |
| **3-Colorability** | Lze graf obarvit 3 barvami? |
| **Set Cover** | Pokryje $k$ množin celé universum? |

> Klasická referenční sbírka je Garey & Johnson 1979 — *Computers and Intractability*. Obsahuje **stovky** NP-úplných problémů s důkazy (často velmi technickými) redukcí.

## Schema NP-úplnostních důkazů

Pro nový problém $L$ chceme dokázat NP-úplnost. Stačí ukázat:

1. **$L \in \mathrm{NP}$**: konstrukcí *certifikátu* a polynomiálního verifikátoru.
2. **$L_0 \leq^m_P L$** pro nějaký *již dokázaný* NP-úplný problém $L_0$ (typicky SAT, 3-SAT, CLIQUE, …).

Z tranzitivnosti redukce ([[redukce]]) plyne, že *všechny* NP problémy se redukují na $L$, tedy $L$ je NP-úplný.

[[np-uplne-problemy]] probere několik klasických redukcí (3-SAT → CLIQUE, → Vertex Cover) detailně a uvede přehled NP-úplných problémů z různých oblastí informatiky.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Cook, S.A.: *The Complexity of Theorem-Proving Procedures* (Proc. 3rd STOC, 1971) — Cookova věta; Levin, L.A.: *Universal Sequential Search Problems* (Probl. Inf. Trans., 1973) — Levinova věta; Karp, R.M.: *Reducibility Among Combinatorial Problems* (1972) — 21 klasických NP-úplných problémů; Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), §7.4; Garey, M.R., Johnson, D.S.: *Computers and Intractability* (Freeman 1979).*
