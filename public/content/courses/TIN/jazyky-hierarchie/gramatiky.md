---
title: Gramatiky a derivace
---

# Gramatika — generativní popis jazyka

Předchozí subtopik [[jazyky-operace]] zavedl jazyk jako *množinu* a operace nad ní. To je *deklarativní* pohled — řekneme přesně, *co* jazyk obsahuje, ale ne *jak* slova vygenerovat. **Gramatika** je opačný, *generativní* nástroj: udává *pravidla*, jejichž opakovanou aplikací z jednoho počátečního symbolu odvodíme všechny řetězce jazyka.

## Definice

**Gramatika** je čtveřice

$$
G = (N, \Sigma, P, S),
$$

kde:

* $N$ je konečná množina **neterminálů** (přepisovatelných symbolů, značíme velkými písmeny $A, B, C, \dots$),
* $\Sigma$ je konečná množina **terminálů** ($N \cap \Sigma = \emptyset$, značíme malými $a, b, c, \dots$ nebo číslicemi $0, 1$),
* $P$ je konečná množina **přepisovacích pravidel** tvaru $\alpha \to \beta$, kde $\alpha \in (N \cup \Sigma)^* N (N \cup \Sigma)^*$ (levá strana obsahuje alespoň jeden neterminál) a $\beta \in (N \cup \Sigma)^*$,
* $S \in N$ je **startovní (počáteční) neterminál**.

Konvence: pravidla se stejnou levou stranou $A \to \alpha_1$, $A \to \alpha_2$, $A \to \alpha_3$ se obvykle zapisují kompaktně:

$$
A \to \alpha_1 \mid \alpha_2 \mid \alpha_3.
$$

::: svg "Gramatika G generující {0ⁿ1ⁿ | n ≥ 1}: tři pravidla, dva symboly"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="12">
  <g stroke="var(--line)" stroke-width="1" fill="none">
    <rect x="20" y="25" width="220" height="125" rx="6"/>
    <rect x="270" y="25" width="270" height="125" rx="6"/>
  </g>
  <g fill="var(--text-muted)" font-size="11">
    <text x="110" y="42" text-anchor="middle">Symboly G</text>
    <text x="380" y="42" text-anchor="middle">Pravidla P</text>
  </g>
  <g fill="var(--text)" font-size="12" font-family="ui-monospace, monospace">
    <text x="40" y="70">N = {S, A}</text>
    <text x="40" y="92">Σ = {0, 1}</text>
    <text x="40" y="114">S — startovní symbol</text>
    <text x="40" y="136" fill="var(--text-muted)" font-size="11">terminály = výstupní abeceda</text>
    <text x="290" y="70">S → 0A1</text>
    <text x="290" y="92">0A → 00A1</text>
    <text x="290" y="114">A → ε</text>
    <text x="290" y="136" fill="var(--text-muted)" font-size="11">levá strana → pravá strana</text>
  </g>
</svg>
:::

## Přímá derivace a derivace

Klíčový mechanismus: na řetězec $\lambda$ aplikujeme pravidlo $\alpha \to \beta$ jako "najdi v $\lambda$ podřetězec $\alpha$ a nahraď ho za $\beta$". Formálně:

::: math
\lambda \Rightarrow_G \mu \quad \stackrel{\mathrm{def.}}{\iff}\quad \exists\, \gamma, \delta \in (N \cup \Sigma)^*\;\exists\,(\alpha \to \beta) \in P : \lambda = \gamma\alpha\delta \ \land\ \mu = \gamma\beta\delta.
:::

Vztah $\Rightarrow_G$ se nazývá **přímá derivace** (jednoduchý přepisovací krok). Když je jasné, o kterou gramatiku jde, píšeme jen $\Rightarrow$.

Z přímé derivace odvodíme:

* **Derivace délky $n$** ($\stackrel{n}{\Rightarrow}$): existuje posloupnost $\lambda = \nu_0 \Rightarrow \nu_1 \Rightarrow \dots \Rightarrow \nu_n = \mu$.
* **Tranzitivní uzávěr** $\stackrel{+}{\Rightarrow}$: alespoň jeden krok přepisu — tj. $\lambda \stackrel{+}{\Rightarrow} \mu$ ozn., že existuje derivace délky $n \geq 1$.
* **Reflexivní tranzitivní uzávěr** $\stackrel{*}{\Rightarrow}$: nula nebo více kroků — připouští $\lambda \stackrel{*}{\Rightarrow} \lambda$.

## Větná forma, věta, generovaný jazyk

Mezikroky derivace označujeme jako **větné formy** — řetězce nad $N \cup \Sigma$, do kterých lze startovní symbol přepsat. Když derivace dosáhne stavu, kde už *nezůstávají* neterminály, dostali jsme **větu** jazyka.

::: math
\begin{aligned}
\text{Větná forma:} &\quad \alpha \in (N \cup \Sigma)^* \ \text{taková, že}\ S \stackrel{*}{\Rightarrow} \alpha. \\
\text{Věta:} &\quad w \in \Sigma^* \ \text{taková, že}\ S \stackrel{*}{\Rightarrow} w. \\
\text{Generovaný jazyk:} &\quad L(G) = \{w \in \Sigma^* \mid S \stackrel{*}{\Rightarrow} w\}.
\end{aligned}
:::

Tedy $L(G)$ obsahuje *právě ty* řetězce terminálů, které lze z $S$ odvodit aplikováním libovolného konečného počtu pravidel.

## Příklad: $L = \{0^n 1^n \mid n > 0\}$

Vezměme gramatiku $G_1 = (\{S, A\}, \{0, 1\}, P, S)$ s pravidly

$$
P:\ S \to 0A1,\quad 0A \to 00A1,\quad A \to \varepsilon.
$$

Přímou indukcí ukážeme, že $S \stackrel{*}{\Rightarrow} 0^n 1^n$ pro libovolné $n \geq 1$:

| Krok | Aplikované pravidlo | Aktuální větná forma |
| :-: | :--- | :--- |
| 0 | (start) | $S$ |
| 1 | $S \to 0A1$ | $0A1$ |
| 2 | $0A \to 00A1$ | $00A11$ |
| 3 | $0A \to 00A1$ | $000A111$ |
| ⋮ | ⋮ | ⋮ |
| $n$ | $0A \to 00A1$ | $0^n A 1^n$ |
| $n+1$ | $A \to \varepsilon$ | $0^n 1^n$ |

Tedy $L(G_1) = \{0^n 1^n \mid n \geq 1\}$.

> **Pozor**: jen v krocích 2, 3, …, $n$ je krok *přímou derivací* — najdeme v levém kontextu výskyt podřetězce $0A$ a nahradíme jej za $00A1$. Volba *kterého* výskytu $0A$ přepíšeme určuje různé možné posloupnosti (pravidlo má kontextovou levou stranu, viz [[chomsky-hierarchie]]).

## Příklad: identifikátor

Klasická "pravěká" gramatika pro identifikátor v programovacím jazyce:

$$
\begin{aligned}
G_2 = (\{I, C, P\}, &\{a, x, y, z, 0, 1, \dots, 9\}, P, I), \\
P:\quad &I \to P \mid IC \mid IP, \\
&P \to a \mid x \mid y \mid z, \\
&C \to 0 \mid 1 \mid \dots \mid 9.
\end{aligned}
$$

Příklad derivace řetězce $a1xy$:

$$
I \Rightarrow IP \Rightarrow IPP \Rightarrow ICPP \Rightarrow PCPP \Rightarrow aCPP \Rightarrow a1PP \Rightarrow a1xP \Rightarrow a1xy.
$$

Klasická *bezkontextová* gramatika — každé pravidlo má na levé straně právě jeden neterminál. Bezkontextové gramatiky jsou natolik důležité, že jim věnujeme [[cfg-derivace]] a [[normalni-formy]].

## Pojmy *věta* vs. *věta o*

Krátká poznámka k slovníku, který nás bude provázet:

* **Věta** (slovo, sentence) — řetězec terminálů odvoditelný z $S$.
* **Věta** (theorem) — matematické tvrzení (Cookova věta, Riceova věta, …).

Kontext vždy rozlišuje. V této kapitole používáme *věta* ve smyslu slova; ve [[chomsky-hierarchie]] se objeví obě.

## Jak číst gramatiku

Pohled na gramatiku jako "generativní popis":

* **Pravidlo $A \to \alpha$** říká: kdekoli v aktuálním řetězci vidíš neterminál $A$, můžeš ho zaměnit za řetězec $\alpha$.
* **Derivace** je posloupnost záměn, počínaje $S$.
* **Jazyk gramatiky** = množina všech řetězců, ke kterým dorazíme, když všechny neterminály eliminujeme.

::: svg "Derivační strom pro slovo 0011 v gramatice S → 0A1, A → 0A1 | ε"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="12">
  <g stroke="var(--line)" stroke-width="1" fill="none">
    <!-- edges -->
    <line x1="270" y1="40" x2="220" y2="80"/>
    <line x1="270" y1="40" x2="270" y2="80"/>
    <line x1="270" y1="40" x2="320" y2="80"/>
    <line x1="270" y1="100" x2="220" y2="140"/>
    <line x1="270" y1="100" x2="270" y2="140"/>
    <line x1="270" y1="100" x2="320" y2="140"/>
    <line x1="270" y1="160" x2="270" y2="200"/>
  </g>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <circle cx="270" cy="30" r="14"/>
    <circle cx="270" cy="90" r="14"/>
    <circle cx="270" cy="150" r="14"/>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line-strong)" stroke-width="0.9">
    <circle cx="220" cy="90" r="11"/>
    <circle cx="320" cy="90" r="11"/>
    <circle cx="220" cy="150" r="11"/>
    <circle cx="320" cy="150" r="11"/>
    <circle cx="270" cy="208" r="11"/>
  </g>
  <g fill="var(--accent)" font-size="12" text-anchor="middle">
    <text x="270" y="34">S</text>
    <text x="270" y="94">A</text>
    <text x="270" y="154">A</text>
  </g>
  <g fill="var(--text)" font-size="11" text-anchor="middle">
    <text x="220" y="94">0</text>
    <text x="320" y="94">1</text>
    <text x="220" y="154">0</text>
    <text x="320" y="154">1</text>
    <text x="270" y="212">ε</text>
  </g>
  <g fill="var(--text-muted)" font-size="11">
    <text x="20" y="35">S</text>
    <text x="20" y="95">0 A 1</text>
    <text x="20" y="155">0 0 A 1 1</text>
    <text x="20" y="212">0 0  1 1   (po A → ε)</text>
  </g>
</svg>
:::

Derivační stromy jsou definovány jen pro *bezkontextové* gramatiky, proto strom výše ilustruje ekvivalentní bezkontextovou gramatiku $G_3 = (\{S, A\}, \{0, 1\}, \{S \to 0A1,\ A \to 0A1 \mid \varepsilon\}, S)$ generující týž jazyk $\{0^n 1^n\}$, nikoli kontextovou $G_1$ s pravidlem $0A \to 00A1$.

Posloupnost větných forem na levé straně obrázku odpovídá jednotlivým úrovním derivačního stromu. **Derivační strom** je grafická reprezentace derivace — vrcholy jsou symboly, hrany propojují přepisovaný neterminál s pravou stranou pravidla. Pro bezkontextové gramatiky abstrahuje strom od pořadí aplikace pravidel — různé derivace lišící se jen pořadím (např. levá vs. pravá derivace) odpovídají témuž stromu; strom je dán tím, *která* pravidla se aplikují na *které* neterminály. Tvoří hlavní nástroj v [[cfg-derivace]].

## Co určuje gramatika

* Tvar pravidel určuje *generativní sílu* — kolik různých jazyků dokáže gramatika popsat.
* Pravidla typu $A \to xB$ generují jen velmi omezenou třídu (*regulární* jazyky — [[konecne-automaty]]).
* Pravidla $A \to \alpha$ s libovolným $\alpha$ generují *bezkontextové* jazyky.
* Pravidla $\alpha A \beta \to \alpha \gamma \beta$ (kde se $A$ přepisuje *jen v daném kontextu*) generují *kontextové* jazyky.
* Pravidla bez omezení dávají *rekurzivně vyčíslitelné* (a tedy "vše, co lze v principu spočítat") jazyky.

Tuto čtyřúrovňovou stratifikaci představuje [[chomsky-hierarchie]] a její paralelu s automaty pak [[jazyky-automaty]].

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), kap. 5; Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), kap. 2; [Stanford CS154 lecture notes — Grammars](https://web.stanford.edu/class/cs154/).*
