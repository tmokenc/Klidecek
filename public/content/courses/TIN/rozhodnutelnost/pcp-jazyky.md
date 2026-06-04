---
title: Postův korespondenční problém a nerozhodnutelnost v gramatikách
---

# Postův korespondenční problém (PCP)

[[problem-zastaveni]] zavedl HP — historicky první nerozhodnutelný problém. **Postův korespondenční problém** (Emil Post, 1946) je *druhý zásadní nerozhodnutelný problém*, *kombinatoricky elementární* a hlavně **mocný nástroj** pro důkazy nerozhodnutelnosti v gramatikách. Většina nerozhodnutelnosti uvnitř Chomského hierarchie se dokazuje *redukcí z PCP*.

## Definice

**Postův systém** nad abecedou $\Sigma$ je *neprázdný seznam* $S$ dvojic neprázdných řetězců:

$$
S = \langle (\alpha_1, \beta_1), (\alpha_2, \beta_2), \dots, (\alpha_k, \beta_k)\rangle, \quad \alpha_i, \beta_i \in \Sigma^+,\ k \geq 1.
$$

**Řešení** Postova systému je neprázdná posloupnost indexů

$$
I = \langle i_1, i_2, \dots, i_m\rangle, \quad 1 \leq i_j \leq k,\ m \geq 1,
$$

splňující rovnost konkatenací:

::: math
\alpha_{i_1} \alpha_{i_2} \dots \alpha_{i_m} \;=\; \beta_{i_1} \beta_{i_2} \dots \beta_{i_m}.
:::

> **Pozor**: $m$ není omezené, indexy se *mohou opakovat*, neexistuje horní mez na délku řešení.

**Postův problém (PCP)**: dán Postův systém $S$, existuje pro něj řešení?

::: svg "Postův systém jako množina dominových kostek; řešení = seznam použitých kostek, kde horní a dolní řetězec jsou stejné"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="12">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="30" y="30" width="80" height="50" rx="4"/>
    <rect x="120" y="30" width="80" height="50" rx="4"/>
    <rect x="210" y="30" width="80" height="50" rx="4"/>
    <rect x="300" y="30" width="80" height="50" rx="4"/>
    <line x1="30" y1="55" x2="110" y2="55" stroke="var(--line)"/>
    <line x1="120" y1="55" x2="200" y2="55" stroke="var(--line)"/>
    <line x1="210" y1="55" x2="290" y2="55" stroke="var(--line)"/>
    <line x1="300" y1="55" x2="380" y2="55" stroke="var(--line)"/>
  </g>
  <g fill="var(--text)" font-family="ui-monospace, monospace" font-size="11.5" text-anchor="middle">
    <text x="70" y="48">b</text>
    <text x="70" y="74">bbb</text>
    <text x="160" y="48">babbb</text>
    <text x="160" y="74">ba</text>
    <text x="250" y="48">ba</text>
    <text x="250" y="74">a</text>
    <text x="340" y="48">aba</text>
    <text x="340" y="74">aab</text>
  </g>
  <g fill="var(--text-muted)" font-size="10.5" text-anchor="middle">
    <text x="70" y="92">i=1</text>
    <text x="160" y="92">i=2</text>
    <text x="250" y="92">i=3</text>
    <text x="340" y="92">i=4</text>
  </g>
  <text x="60" y="120" fill="var(--text-muted)" font-size="11">Řešení I = ⟨2, 1, 1, 3⟩:</text>
  <text x="60" y="140" fill="var(--text)" font-family="ui-monospace, monospace" font-size="11.5">α: babbb·b·b·ba</text>
  <text x="60" y="158" fill="var(--text)" font-family="ui-monospace, monospace" font-size="11.5">β: ba·bbb·bbb·a</text>
  <text x="60" y="180" fill="var(--accent)" font-size="11">Po sloučení: babbbbbba = babbbbbba ✓</text>
</svg>
:::

## Příklady

### S řešením

$S_1 = \{(b, bbb), (babbb, ba), (ba, a)\}$ nad $\Sigma = \{a, b\}$.

**Řešení** $I = \langle 2, 1, 1, 3\rangle$:

$$
\alpha_2 \alpha_1 \alpha_1 \alpha_3 = \texttt{babbb}\,\texttt{b}\,\texttt{b}\,\texttt{ba} = \texttt{babbbbbba}
$$

$$
\beta_2 \beta_1 \beta_1 \beta_3 = \texttt{ba}\,\texttt{bbb}\,\texttt{bbb}\,\texttt{a} = \texttt{babbbbbba}
$$

Obě se rovnají. ✓

### Bez řešení (triviální důvod)

$S_2 = \{(ab, abb), (a, ba), (b, bb)\}$ nad $\Sigma = \{a, b\}$.

Pro každou dvojici platí $|\alpha_i| < |\beta_i|$. Pak pro libovolnou posloupnost $\alpha_{i_1} \dots \alpha_{i_m}$ máme $|\alpha_{i_1} \dots \alpha_{i_m}| < |\beta_{i_1} \dots \beta_{i_m}|$ — délky se nemohou shodovat. Žádné řešení neexistuje.

### Bez řešení (netriviální)

$S_3 = \{(001, 0), (01, 011), (01, 101), (10, 001)\}$ — vyžaduje detailní rozbor; není zjevné, že řešení neexistuje, ale lze to dokázat.

## Hlavní věta

**Věta (Post, 1946).** *Postův korespondenční problém je nerozhodnutelný.*

Tj. neexistuje algoritmus, který by pro každý zadaný Postův systém $S$ v konečném čase rozhodl, zda má řešení.

> *Parciálně rozhodnutelný* PCP **je** — můžeme systematicky vyzkoušet všechny posloupnosti $I$ rostoucí délky a kontrolovat shodu. Pokud řešení existuje, jednou je najdeme. Pokud ne, *cyklíme navždy* bez možnosti to detekovat.

## Důkaz nerozhodnutelnosti

Nerozhodnutelnost PCP se dokazuje **redukcí z problému členství TS** ($L_\mathrm{M}$, který víme, že je nerozhodnutelný — viz [[redukce]]).

**Idea redukce.** Pro daný TS $M$ a vstup $w$ sestrojíme Postův systém $S$ tak, že:

$$
S \text{ má řešení} \iff M \text{ přijme } w.
$$

**Konstrukce.** Posloupnost konfigurací TS při přijetí $w$ se zakóduje *jako konkatenace* horních ($\alpha$) a dolních ($\beta$) stran Postova systému. Trik: jedna strana je vždy "o krok napřed" před druhou; v posledním kroku se konkatenace *zarovnají*.

Pravidla:

* **Inicializační**: $(\#, \#\,q_0 \Delta w \Delta\dots\Delta)$ — vloží počáteční konfiguraci na pravou stranu.
* **Kopírovací**: $(z, z)$ pro každý symbol $z$ — zachovává symboly mimo aktuální hlavu.
* **Krok TS**: pro $\delta(q, a) = (q', b)$: $(qa, q'b)$ apod.
* **Závěrečné**: po dosažení $q_F$ se na levou stranu přidají *symboly bez odpovídající pravé* aby se obě strany srovnaly.

Detaily konstrukce jsou *technicky náročné*, ale výsledek je čistý: Postův systém *má řešení* tehdy a jen tehdy, když odpovídající TS *přijme svůj vstup*. Tedy:

$$
L_\mathrm{M} \leq \mathrm{PCP}.
$$

Protože $L_\mathrm{M} \notin \text{R}$, je i $\mathrm{PCP} \notin \text{R}$. ∎

## Aplikace: nerozhodnutelnost v gramatikách

**Hlavní význam PCP**: poskytuje *kombinatorický základ* pro důkazy nerozhodnutelnosti vlastností bezkontextových (a kontextových) gramatik.

### Nerozhodnutelnost prázdnosti průniku CFG

**Věta.** Problém "$L(G_1) \cap L(G_2) = \emptyset$?" pro bezkontextové gramatiky $G_1, G_2$ je *nerozhodnutelný*.

**Důkaz** (idea, redukce z PCP). Dán Postův systém $S = \{(\alpha_i, \beta_i)\}$. Sestrojíme:

$$
L_\alpha = \{\alpha_{i_1} \alpha_{i_2} \dots \alpha_{i_m} \# i_m \dots i_2 i_1 \mid 1 \leq i_j \leq k, m \geq 1\},
$$

$$
L_\beta = \{\beta_{i_1} \beta_{i_2} \dots \beta_{i_m} \# i_m \dots i_2 i_1 \mid 1 \leq i_j \leq k, m \geq 1\}.
$$

Oba jsou *deterministicky bezkontextové* (lze pro ně sestrojit DPDA, který si pamatuje obrácenou posloupnost indexů na zásobníku).

Pak: $L_\alpha \cap L_\beta \neq \emptyset$ *právě když* existuje posloupnost $I$ taková, že $\alpha_{i_1} \dots \alpha_{i_m} = \beta_{i_1} \dots \beta_{i_m}$ — *přesně* řešení PCP.

Tedy $\mathrm{PCP} \leq \{\text{prázdnost průniku CFG}\}$. Druhý problém je tedy také nerozhodnutelný. ∎

### Nerozhodnutelnost ekvivalence CFG

**Věta.** Problém "$L(G_1) = L(G_2)$?" pro CFG je nerozhodnutelný.

Tato věta byla zmíněna v [[vlastnosti-bkj]]; *plný důkaz* používá PCP redukci (skrz prázdnost průniku).

### Další nerozhodnutelné problémy v CFG

* "$L(G) = \Sigma^*$?" (univerzalita)
* "$L(G_1) \subseteq L(G_2)$?" (inkluze)
* "$L(G)$ je regulární?"
* "Je $G$ víceznačná?"
* "$L(G)$ je deterministicky bezkontextový?"

**Všechny** lze dokázat redukcí z PCP (nebo z některé ze dvou předchozích).

### V kontextových (LBA)

Pro **kontextové** jazyky je nerozhodnutelný i další klíčový problém:

* "$L(G) = \emptyset$?" pro kontextovou gramatiku — **není ani parciálně rozhodnutelný**.

**Důkaz** redukcí z $\mathrm{co}\text{-}\mathrm{PCP}$ (komplementu PCP). Pro vstup $S$ (Postův systém) konstruujeme kontextovou gramatiku $G$ generující *právě ty řetězce*, které odpovídají *řešením* $S$. Pak:

$$
S \text{ nemá řešení} \iff L(G) = \emptyset.
$$

Protože $\mathrm{co}\text{-}\mathrm{PCP} \notin \text{RE}$ (kontrapozice toho, že $\mathrm{PCP} \in \text{RE}$, ale $\mathrm{PCP} \notin \text{R}$), je i "prázdnost CSG" mimo RE.

## Tabulka rozhodnutelnosti — souhrn

Z [[redukce]] (pro úplnost):

| Třída | $w \in L$? | $L = \emptyset$? | $L = \Sigma^*$? | $L_1 = L_2$? | $L_1 \cap L_2 = \emptyset$? |
| :--- | :-: | :-: | :-: | :-: | :-: |
| Regulární ($\mathcal{L}_3$) | R | R | R | R | R |
| DCFL | R | R | R | R | N |
| Bezkontextové ($\mathcal{L}_2$) | R | R | N | N | **N (PCP)** |
| Kontextové ($\mathcal{L}_1$) | R | N | N | N | N |
| Rekurzivní (R) | R | N | N | N | N |
| Rekurzivně vyčíslitelné ($\mathcal{L}_0$) | N | N (ne RE) | N | N | N |

> Vrcholy *hranice rozhodnutelnosti* leží mezi DCFL a CFL — určité problémy lze rozhodnout pro deterministické varianty, ale ne pro nedeterministické.

## PCP v praxi {tier=practice}

Postův problém má i *praktické* projevy:

* **Generation matching v překladačích.** Některé syntaktické úlohy lze zakódovat jako PCP — důsledek: některé otázky o syntaxi *nejsou rozhodnutelné*.
* **Kompozice transducerů.** Otázka, zda kompozice dvou *finite-state* transducerů přijímá nějaký vstup, je *nerozhodnutelná* (přes PCP).
* **String unification.** Některé typy unifikace řetězců jsou PCP-úplné.
* **Word problems v polostrukturách.** Otázka, zda dvě slova ve volné polostruktuře jsou rovna, často redukuje na PCP.

## Souvislost s nerozhodnutelností v logice

Stejně jako [[godel-neuplnost]] dokazuje existenci pravdivých neformálně-dokazatelných tvrzení v aritmetice, PCP dokazuje *kombinatorickou* nerozhodnutelnost. Oba výsledky využívají *diagonalizaci přes self-reference* — formule mluvící o sobě (Gödel) nebo TS reagující na svůj kód (HP, PCP).

Klíčové, že **PCP je dostatečně jednoduchý**, aby šel "ručně" *redukovat* z mnoha problémů — proto je *univerzálním zdrojem nerozhodnutelnosti* pro kombinatorické a syntaktické úlohy.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=amrvv9Lgrww" "Teoretická informatika: Nerozhodnutelnost" "Tomáš Kocourek"
:::

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Post, E.: *A Variant of a Recursively Unsolvable Problem* (Bull. AMS, 1946); Davis, M.: *Computability and Unsolvability* (McGraw-Hill, 1958); Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), §9.4–9.5; Kozen, D.C.: *Automata and Computability* (Springer 1997), kap. 33.*
