---
title: Determinizace — převod NKA na DKA
---

# Determinizace — od nedeterminismu k deterministickému stroji

NKA může mít *více možných* přechodů z jednoho stavu po jednom symbolu ([[konecne-automaty]]). To je teoreticky pohodlné — návrh NKA je často přímočařejší než návrh DKA — ale ne *implementačně*: hardware ani software běžně neimplementuje "hádej správnou cestu". Tato kapitola dokáže, že **každý NKA lze převést na ekvivalentní DKA**. Cena: až *exponenciální* nárůst počtu stavů.

## Klíčový vhled: stav DKA = množina stavů NKA

Pokud má NKA stavy $Q$, výpočet z $q_0$ na řetězec $w$ může dorazit do *libovolné podmnožiny* $S \subseteq Q$. *Jediná aktuální informace*, kterou si DKA musí pamatovat, je tedy "ve kterých stavech NKA se právě **simulovaně nacházíme**". To je *jeden* stav DKA — odpovídající množina původních stavů.

::: math
\text{DKA stav} \;\stackrel{\mathrm{def.}}{=}\; \{q \in Q_\mathrm{NKA} \mid q \text{ může být dosažen po dosud zpracovaném prefixu}\} \;\subseteq\; Q_\mathrm{NKA}.
:::

Z toho intuitivně vyplývá horní mez $|Q_\mathrm{DKA}| \leq 2^{|Q_\mathrm{NKA}|}$. Tato mez je *těsná* — existují NKA, jejichž minimální ekvivalentní DKA má skutečně exponenciální počet stavů ([[minimalizace]] ukazuje, jak tuto situaci poznat a minimalizovat).

## Algoritmus podmnožinové konstrukce

**Vstup:** NKA $M = (Q, \Sigma, \delta, q_0, F)$.
**Výstup:** DKA $M' = (Q', \Sigma, \delta', q_0', F')$ s $L(M) = L(M')$.

**Konstrukce:**

1. $Q' = 2^Q$ (všechny podmnožiny stavů NKA).
2. $q_0' = \{q_0\}$.
3. $F' = \{S \in 2^Q \mid S \cap F \neq \emptyset\}$ — DKA stav je *koncový*, pokud obsahuje alespoň jeden koncový stav NKA.
4. Pro každý $S \in 2^Q$ a $a \in \Sigma$:

::: math
\delta'(S, a) = \bigcup_{q \in S} \delta(q, a).
:::

V praxi *nevyplníme všechny* $2^Q$ stavů — postupujeme **dosažitelně**: začneme od $\{q_0\}$ a iterativně přidáváme jen ty množiny, k nimž se přes $\delta'$ dostaneme. Velká část $2^Q$ často zůstává nedosažitelná.

## Příklad

Vezměme NKA nad abecedou $\{a, b\}$ pro jazyk slov *obsahujících `ab`* (stavy $q_0, q_1, q_2, q_3$, počáteční $q_0$, koncový $q_3$):

$$
\delta(q_0, a) = \{q_0, q_1\},\ \delta(q_0, b) = \{q_0\},\ \delta(q_1, b) = \{q_2\},\ \delta(q_2, a) = \{q_3\}, \dots
$$

Postupný výpočet DKA stavů:

| Krok | $S$ (DKA stav) | symbol | $\delta'(S, a)$ |
| :-: | :--- | :--- | :--- |
| 1 | $\{q_0\}$ | $a$ | $\{q_0, q_1\}$ — *new* |
| 2 | $\{q_0\}$ | $b$ | $\{q_0\}$ |
| 3 | $\{q_0, q_1\}$ | $a$ | $\{q_0, q_1\}$ |
| 4 | $\{q_0, q_1\}$ | $b$ | $\{q_0, q_2\}$ — *new* |
| 5 | $\{q_0, q_2\}$ | $a$ | $\{q_0, q_1, q_3\}$ — *new* |
| ⋮ | ⋮ | ⋮ | ⋮ |

::: viz nfa-to-dfa "Klikni Next pro krokování konstrukce DKA z NKA pro jazyk slov obsahujících 'ab' s libovolným zakončením."
:::

Při interaktivní vizualizaci si všimněte, že:

* Nové stavy DKA se zobrazují *postupně*, vždy jako podmnožiny původních stavů NKA.
* Stav DKA je *koncový*, pokud obsahuje aspoň jeden koncový stav NKA — vizuálně to ukazuje vnitřní obvod elipsy.
* Některé podmnožiny $2^Q$ se *nikdy nevyskytnou* — typický jev v praxi (i když ne v tomto konkrétním malém příkladu).

## Důkaz ekvivalence

**Tvrzení.** $L(M) = L(M')$.

**Důkaz** přes induktivně rozšířenou přechodovou funkci. Definujme $\hat\delta : Q \times \Sigma^* \to 2^Q$ pro NKA jako:

$$
\hat\delta(q, \varepsilon) = \{q\}, \qquad \hat\delta(q, wa) = \bigcup_{p \in \hat\delta(q, w)} \delta(p, a).
$$

A podobně $\hat{\delta'} : Q' \times \Sigma^* \to Q'$ pro výsledný DKA.

Indukcí podle $|w|$ ukážeme $\hat\delta(q_0, w) = \hat{\delta'}(\{q_0\}, w)$:

* **Báze**: $|w| = 0$. Pak $\hat\delta(q_0, \varepsilon) = \{q_0\} = \hat{\delta'}(\{q_0\}, \varepsilon)$. ✓
* **Indukční krok**: $w = va$. Pak

  $$
  \hat\delta(q_0, va) = \bigcup_{p \in \hat\delta(q_0, v)} \delta(p, a) \stackrel{\text{def.}\,\delta'}{=} \delta'(\hat\delta(q_0, v), a) \stackrel{\text{IH}}{=} \delta'(\hat{\delta'}(\{q_0\}, v), a) = \hat{\delta'}(\{q_0\}, va). \,\square
  $$

Z toho:

$$
w \in L(M) \iff \hat\delta(q_0, w) \cap F \neq \emptyset \iff \hat{\delta'}(\{q_0\}, w) \cap F \neq \emptyset \iff w \in L(M').
$$

Tedy $L(M) = L(M')$.

## Eliminace $\varepsilon$-přechodů (RKA → NKA)

Pokud máme **rozšířený KA** s $\varepsilon$-přechody ([[konecne-automaty]]), nejprve eliminujeme $\varepsilon$-přechody pomocí *$\varepsilon$-uzávěru*. Pro každý stav $q$:

::: math
\mathrm{ECLOSE}(q) = \big\{q' \mid q \vdash^*_\varepsilon q'\big\}.
:::

Tj. množina stavů dosažitelných z $q$ libovolným počtem $\varepsilon$-přechodů (včetně $q$ samotného).

Transformace RKA → NKA (= ekvivalentní bez $\varepsilon$-přechodů):

* Nové přechody: $\delta_\mathrm{NKA}(q, a) = \mathrm{ECLOSE}\!\left(\bigcup_{q' \in \mathrm{ECLOSE}(q)} \delta_\mathrm{RKA}(q', a)\right)$.
* Nová počáteční konfigurace: $\mathrm{ECLOSE}(q_0)$ se stává *startovacím stavem* (nebo se přiřadí jako množina v podmnožinové konstrukci).
* Koncové stavy: $q \in F_\mathrm{NKA}$ právě když $\mathrm{ECLOSE}(q) \cap F_\mathrm{RKA} \neq \emptyset$.

Po této transformaci aplikujeme podmnožinovou konstrukci výše. V praxi se obě transformace **slévají** do jednoho průchodu nad RKA — algoritmu, který v *jediném kroku* spočte $\varepsilon$-uzávěr i podmnožinovou expanzi.

### Výpočet $\varepsilon$-uzávěru

Pro malé automaty stačí *manuální* BFS po $\varepsilon$-hranách. Pro automatizovanou implementaci jde o klasickou úlohu **tranzitivního uzávěru** orientovaného grafu, na který lze použít:

* Warshallův algoritmus — $O(|Q|^3)$.
* BFS/DFS z každého stavu — $O(|Q| \cdot (|Q| + |\delta|))$.

V kurzu se obvykle používá Warshallova maticová formulace; v praxi (přepsaná na adjacency list) je BFS rychlejší.

## Cena determinizace

| Parametr | NKA | DKA |
| :--- | :-: | :-: |
| Počet stavů | $|Q|$ | až $2^{|Q|}$ |
| Test příslušnosti $w \in L(M)$ (on-line simulace množiny stavů) | $O(|w| \cdot |Q|^2)$ | $O(|w|)$ |

Tj. DKA je *rychlejší pro vyhodnocení*, ale potenciálně *exponenciálně větší*. V praxi (lexery, jednoduché regex) se používají oba přístupy: pro malé jednoduché vzory DKA, pro velké regex enginy (PCRE) varianty NKA simulace.

> Klasický kontrapříklad exponenciálního nárůstu: jazyk "obsahuje $n$-tý symbol od konce roven $0$" má $n+1$ stavů NKA, ale potřebuje $2^n$ stavů DKA (každý stav musí pamatovat "posledních $n$ symbolů").

## Přehled převodů

[[regularni-vyrazy]] zavede třetí ekvivalentní reprezentaci — regulární výrazy — a uzavře následující diagram převodů:

::: svg "Tři ekvivalentní reprezentace regulárních jazyků"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="12">
  <defs>
    <marker id="arrDET" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <rect x="40" y="60" width="100" height="50" rx="6"/>
    <rect x="220" y="60" width="100" height="50" rx="6"/>
    <rect x="400" y="60" width="100" height="50" rx="6"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle">
    <text x="90" y="80">NKA / RKA</text>
    <text x="90" y="100" font-size="11" fill="var(--text-muted)">|Q| stavů</text>
    <text x="270" y="80">DKA</text>
    <text x="270" y="100" font-size="11" fill="var(--text-muted)">až 2^|Q|</text>
    <text x="450" y="80">regulární výraz</text>
    <text x="450" y="100" font-size="11" fill="var(--text-muted)">R = a*(ab+ba)b*</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" marker-end="url(#arrDET)">
    <line x1="140" y1="80" x2="216" y2="80"/>
    <line x1="216" y1="92" x2="140" y2="92"/>
    <line x1="320" y1="80" x2="396" y2="80"/>
    <line x1="396" y1="92" x2="320" y2="92"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="178" y="73" text-anchor="middle">determinizace</text>
    <text x="178" y="105" text-anchor="middle">triviální (DKA je NKA)</text>
    <text x="358" y="73" text-anchor="middle">stavová eliminace</text>
    <text x="358" y="105" text-anchor="middle">Kleene konstrukce</text>
  </g>
  <text x="270" y="155" text-anchor="middle" fill="var(--text-muted)" font-size="11">Všechny tři formalismy popisují právě regulární jazyky ℒ₃.</text>
</svg>
:::

Po determinizaci přijde [[minimalizace]] — algoritmus, který z libovolného DKA vyrobí *minimální* (vzhledem k počtu stavů) ekvivalentní DKA. Pro každý regulární jazyk je tento minimální automat *jednoznačný* až na pojmenování stavů.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Rabin, M.O., Scott, D.: *Finite Automata and Their Decision Problems* (IBM J. Res. Dev., 1959) — původní podmnožinová konstrukce; Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), §2.3; [Cornell CS 4814 — Subset construction](https://courses.cs.cornell.edu/cs4810/2017fa/lectures.html).*
