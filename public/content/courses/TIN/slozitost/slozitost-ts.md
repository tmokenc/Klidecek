---
title: Časová a prostorová složitost TS
---

# Měření složitosti výpočtu

Po vyřešení otázky **zda** je problém algoritmicky rozhodnutelný (Topic [[problem-zastaveni]] – [[pcp-jazyky]]) přechází kurz k otázce **jak rychle** lze rozhodnutelný problém řešit. **Časová** a **prostorová** složitost kvantifikují *zdroje* potřebné k výpočtu jako funkci délky vstupu.

## Časová a prostorová složitost konkrétního výpočtu

Vezměme konkrétní výpočet TS $M$ na vstupu $w$:

* **Časová složitost výpočtu** = počet kroků (přechodů) od počátku do zastavení.
* **Prostorová složitost výpočtu** = počet *různých buněk pásky*, které TS *navštívil*.

**Příklad.** TS s diagramem:

::: svg "Jednoduchý TS — najde nejlevější x, smaže ho, opakuje"
<svg viewBox="0 0 540 120" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aS1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="100" cy="60" r="22"/>
    <circle cx="270" cy="60" r="22"/>
    <circle cx="440" cy="60" r="22"/>
    <circle cx="440" cy="60" r="17" fill="none"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle">
    <text x="100" y="64">q₀</text>
    <text x="270" y="64">q₁</text>
    <text x="440" y="64">q_F</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aS1)">
    <path d="M122,60 L248,60"/>
    <path d="M292,60 L418,60"/>
    <path d="M85,40 Q72,18 100,18 Q120,18 115,40"/>
    <path d="M250,40 Q240,20 270,20 Q288,20 282,40"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="185" y="53" text-anchor="middle">∆/R</text>
    <text x="355" y="53" text-anchor="middle">∆/∆</text>
    <text x="100" y="12" text-anchor="middle">x/R</text>
    <text x="270" y="12" text-anchor="middle">x/L  ∆/x</text>
  </g>
</svg>
:::

Pro vstup $\Delta x x x \Delta\Delta\dots$:
* **Časová složitost** = 10 (přesný počet kroků do $q_F$).
* **Prostorová složitost** = 5 (políčka 0–4, ostatní zůstávají $\Delta$).

**Lemma 5.1.** Je-li časová složitost výpočtu rovna $n$, pak prostorová složitost není větší než $n + 1$.

*Důvod.* Hlava se v jednom kroku posune nejvýš o 1, takže za $n$ kroků navštíví nejvýš $n + 1$ různých políček.

## Složitost jako funkce délky vstupu

Pro *jediný* vstup je složitost jediné číslo, ne moc užitečné. Definujeme **složitost TS** jako funkci délky vstupu:

**Definice (časová složitost TS).** TS $M$ přijímá jazyk $L$ v čase $T_M : \mathbb{N} \to \mathbb{N}$, jestliže:

* $L = L(M)$, a
* každé $w \in L$ je *přijato* v nanejvýš $T_M(|w|)$ krocích.

**Definice (prostorová složitost TS).** Analogicky, ale počítáme *pásková políčka* místo *kroků*.

Pro **nedeterministický TS** požadujeme, aby *existovala* přijímající posloupnost délky $\leq T_M(|w|)$ — nejhorší přijímající cesta, nejlepší přijímající strategie.

> **Pozn.** Tato definice počítá jen *přijetí*, ne výpočet, který skončí abnormálním zastavením. Pro *totální* TS (rozhodující) se uvažují všechny výpočty.

## Cenová kritéria

Mimo prostředí TS (např. v RAM stroji) ne každá operace stojí stejně:

* **Uniformní cenové kritérium** — každá operace má cenu $O(1)$. Funguje pro algoritmy s malými operandy. Klasický předpoklad v analýze algoritmů ([[asymptotika-rekurence]]).
* **Logaritmické cenové kritérium** — operace nad operandem velikosti $i$ má cenu $\lfloor\log i\rfloor + 1$. Reflektuje růst nákladů s velikostí (binární kódování).

Logaritmické kritérium se uplatní tam, kde lze rychle generovat *obrovská čísla* — např. cyklem $A_{i+1} = A_i^2$ ($A_0 = 2$) získáme $A_n = 2^{2^n}$. Pro TS s omezenou abecedou potřebuje $2^n$ buněk k uložení, takže ani polynomiální čas to nezvládne.

## TS vs. RAM stroj

**Věta.** Při vhodném cenovém kritériu jsou složitosti TS a RAM stroje *polynomiálně vázané*.

* **RAM stroj** = paměť s náhodným přístupem, instrukce $\mathtt{LOAD}, \mathtt{STORE}, \mathtt{ADD}, \mathtt{SUB}, \mathtt{MULT}, \mathtt{DIV}$, I/O, skok.
* Funkce $f_1, f_2$ jsou *polynomiálně vázané*, existují-li polynomy $p_1, p_2$ takové, že $f_1(n) \leq p_1(f_2(n))$ a $f_2(n) \leq p_2(f_1(n))$ pro všechny $n$.

> **Důsledek.** Pro klasifikaci problémů jako *polynomiálních* či *exponenciálních* je TS vhodným modelem — žádné běžné výpočetní prostředí nemůže polynomiální problém převést na exponenciální (a naopak).

## Asymptotická notace

**Definice.** Pro funkci $f : \mathbb{N} \to \mathbb{N}$ definujeme tři množiny funkcí:

::: math
\begin{aligned}
O(f(n)) &= \{g \mid \exists c \in \mathbb{R}^+ \exists n_0 \in \mathbb{N}\,\forall n \geq n_0: 0 \leq g(n) \leq c \cdot f(n)\}, \\
\Omega(f(n)) &= \{g \mid \exists c \in \mathbb{R}^+ \exists n_0 \in \mathbb{N}\,\forall n \geq n_0: 0 \leq c \cdot f(n) \leq g(n)\}, \\
\Theta(f(n)) &= O(f(n)) \cap \Omega(f(n)).
\end{aligned}
:::

* $O(f)$ — *horní odhad* (růst $g$ je *nejvýše* tak rychlý jako $f$ až na konstantu).
* $\Omega(f)$ — *dolní odhad* (růst $g$ je *aspoň* tak rychlý).
* $\Theta(f)$ — *těsný odhad* (růst $g$ je *přesně* stejně rychlý jako $f$).

::: svg "Asymptotické odhady"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6" fill="none">
    <line x1="50" y1="180" x2="510" y2="180"/>
    <line x1="50" y1="20" x2="50" y2="180"/>
  </g>
  <g fill="var(--text-muted)" font-size="10">
    <text x="280" y="195" text-anchor="middle">n</text>
    <text x="42" y="100" transform="rotate(-90 42 100)" text-anchor="middle">složitost</text>
  </g>
  <path d="M70,170 Q200,140 350,80 Q420,50 500,30" fill="none" stroke="var(--accent)" stroke-width="2"/>
  <text x="470" y="50" fill="var(--accent)" font-size="11">f(n)</text>
  <path d="M70,178 Q200,160 350,140 Q420,130 500,120" fill="none" stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="470" y="115" fill="var(--text-muted)" font-size="10">g₁ = O(f)  ‹ c₁·f</text>
  <path d="M70,165 Q200,100 350,60 Q420,40 500,25" fill="none" stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="455" y="20" fill="var(--text-muted)" font-size="10">g₂ = Ω(f)  › c₂·f</text>
  <line x1="180" y1="20" x2="180" y2="180" stroke="var(--text-faint)" stroke-dasharray="2 2"/>
  <text x="180" y="195" text-anchor="middle" fill="var(--text-faint)" font-size="10">n₀</text>
</svg>
:::

**Příklady**:
* $5n^2 + 3n + 7 \in \Theta(n^2)$ (kvadratický růst).
* $n \log n \in O(n^2)$, ale $n \log n \notin \Omega(n^2)$ (rychlejší než lineární, pomalejší než kvadratický).
* $2^n \in \Omega(n^k)$ pro každé $k$ (exponenciální je rychlejší než libovolný polynom).

**Rozšířená notace pro exponenciály:**

::: math
2^{O(f(n))} = \{g \mid \exists c \in \mathbb{R}^+ \exists n_0\,\forall n \geq n_0: g(n) \leq 2^{c \cdot f(n)}\}.
:::

To umožňuje psát např. $2^{O(n)}$ pro "exponenciální v $n$" bez nutnosti rozlišovat $2^n, 2^{2n}, 2^{n+1}$, …

## Polynomiální vs. exponenciální čas

Klíčový teoretický předěl mezi *trakovatelnými* (= prakticky řešitelnými) a *netrakovatelnými* problémy:

| $n$ | $n^2$ ($\mu$s) | $2^n$ ($\mu$s) |
| :-: | :-: | :-: |
| 10 | 0.0001 s | 0.001 s |
| 20 | 0.0004 s | ~1 s |
| 30 | 0.0009 s | ~18 min |
| 40 | 0.0016 s | ~13 dní |
| 50 | 0.0025 s | ~36 roků |
| 60 | 0.0036 s | ~365 století |
| 70 | 0.0049 s | ~37 mil. roků |

> Polynomiální algoritmus zvládá $n = 70$ za milisekundu, exponenciální za ~37 milionů let. Tato dramatika ospravedlňuje *teoretickou* hranici mezi $P$ a problémy mimo $P$.

## Tři typy analýzy

Pro daný algoritmus lze složitost analyzovat různě:

| Typ | Co měří |
| :--- | :--- |
| **Nejhorší případ** (worst-case) | Maximum přes všechny vstupy délky $n$ |
| **Nejlepší případ** (best-case) | Minimum přes všechny vstupy délky $n$ |
| **Průměrný případ** (average-case) | Vážený průměr s pravděpodobností výskytu vstupů |
| **Amortizovaná analýza** | Průměr přes *posloupnost operací* — viz [[amortizovana]] |

V kurzu se obvykle pracuje s **nejhorším případem** — dává *garanci* (algoritmus *nikdy* nebude pomalejší). Průměrný případ vyžaduje předpoklad o rozdělení vstupů, který nemusí v praxi platit.

**Příklad analýzy nejhoršího případu**:

```c
int str_cmp(int n, string a, string b) {
    int i = 0;
    while (i < n) {
        if (a[i] != b[i]) break;
        i++;
    }
    return (i == n);
}
```

S uniformním cenovým kritériem (každý řádek 1 jednotka):

* Nejhorší případ: $a = b$ — projdeme celý cyklus, $T(n) = 3n + 5 \in O(n)$.
* Nejlepší případ: $a[0] \neq b[0]$ — break v prvním kroku, $T(n) = 6 \in O(1)$.

## Třídy složitosti

Pro klasifikaci *problémů* (jazyků) podle složitosti zavádíme **třídy** — množiny jazyků přijatelných v daných limitech.

**Definice.** Pro funkce $t, s : \mathbb{N} \to \mathbb{N}$:

::: math
\begin{array}{l}
\mathrm{DTIME}(t(n)) = \{L \mid \exists\ k\text{-páskový DTS } M : L(M) = L \land T_M \in O(t(n))\}, \\[3pt]
\mathrm{NTIME}(t(n)) = \{L \mid \exists\ k\text{-páskový NTS } M : L(M) = L \land T_M \in O(t(n))\}, \\[3pt]
\mathrm{DSPACE}(s(n)) = \{L \mid \exists\ k\text{-páskový DTS } M : L(M) = L \land S_M \in O(s(n))\}, \\[3pt]
\mathrm{NSPACE}(s(n)) = \{L \mid \exists\ k\text{-páskový NTS } M : L(M) = L \land S_M \in O(s(n))\}.
\end{array}
:::

## Nejdůležitější třídy

::: math
\begin{array}{ll}
\mathrm{P} = \bigcup_{k \geq 0} \mathrm{DTIME}(n^k) & \text{deterministický polynomiální čas} \\[3pt]
\mathrm{NP} = \bigcup_{k \geq 0} \mathrm{NTIME}(n^k) & \text{nedeterministický polynomiální čas} \\[3pt]
\mathrm{PSPACE} = \bigcup_{k \geq 0} \mathrm{DSPACE}(n^k) & \text{deterministický polynomiální prostor} \\[3pt]
\mathrm{NPSPACE} = \bigcup_{k \geq 0} \mathrm{NSPACE}(n^k) & \text{nedeterministický polynomiální prostor} \\[3pt]
\mathrm{EXP} = \bigcup_{k \geq 0} \mathrm{DTIME}(2^{n^k}) & \text{deterministický exponenciální čas} \\[3pt]
\mathrm{L} = \mathrm{DSPACE}(\log n) & \text{deterministický logaritmický prostor} \\[3pt]
\mathrm{NL} = \mathrm{NSPACE}(\log n) & \text{nedeterministický logaritmický prostor} \\
\end{array}
:::

## Časově/prostorově zkonstruovatelné funkce

Pro "rozumnou" hierarchii tříd potřebujeme, aby ohraničující funkce $t, s$ byly samy vyčíslitelné v patřičných limitech.

**Definice.** Funkce $t : \mathbb{N} \to \mathbb{N}$ je **časově zkonstruovatelná**, jestliže existuje vícepáskový TS, který pro libovolný vstup $w$ zastaví *po přesně $t(|w|)$ krocích*.

**Definice.** Funkce $s : \mathbb{N} \to \mathbb{N}$ je **prostorově zkonstruovatelná**, jestliže existuje vícepáskový TS, který pro libovolný vstup $w$ zastaví s využitím *přesně $s(|w|)$ buněk*.

Všechny "běžné" polynomiální, logaritmické, exponenciální funkce jsou zkonstruovatelné. Patologické funkce (např. $f(n) = n$ pro liché $n$, $f(n) = 2^n$ pro sudé) mohou být ne-zkonstruovatelné a kazí teorii.

> Pokud je jazyk přijímán strojem v čase/prostoru omezeném zkonstruovatelnou funkcí, pak je *vždy přijímán totálním strojem* (předem si počítáme limit a kontrolujeme, zda nepřekročíme).

[[tridy-p-np]] a [[savitch-prostor]] zkoumají vztahy mezi těmito třídami, vrcholené otázkou **$P \stackrel{?}{=} NP$**.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Hartmanis, J., Stearns, R.E.: *On the Computational Complexity of Algorithms* (Trans. AMS, 1965); Cobham, A.: *The Intrinsic Computational Difficulty of Functions* (Proc. 1964 Cong. Logic, Methodology, and Philosophy of Science); Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), §7.1; Arora, S., Barak, B.: *Computational Complexity — A Modern Approach* (Cambridge 2009), kap. 1.*
