---
title: Ekvivalence PDA a bezkontextových gramatik
---

# Ekvivalence PDA a CFG

[[zasobnikove-automaty]] zavedl zásobníkové automaty jako *akceptační* model; [[cfg-derivace]] zavedl bezkontextové gramatiky jako *generativní* model. Tato kapitola formalizuje, že obě formalismy **popisují totéž**:

::: math
\mathcal{L}_2 \;=\; \mathcal{L}_{\mathrm{PDA}}.
:::

Tj. jazyk je bezkontextový právě tehdy, je-li přijímán nějakým (nedeterministickým) zásobníkovým automatem. Důkaz probíhá konstruktivně v obou směrech.

## Směr ⊆: CFG → PDA (analýza shora dolů)

**Věta.** Pro každou bezkontextovou gramatiku $G = (N, \Sigma, P, S)$ existuje PDA $P$ přijímající *prázdným zásobníkem* takový, že $L(G) = L(P)$.

**Konstrukce.** PDA má *jediný stav* a simuluje *levou derivaci* gramatiky $G$ — modeluje *syntaktickou analýzu shora dolů* (top-down parsing).

$$
P = (\{q\}, \Sigma, N \cup \Sigma, \delta, q, S, \emptyset),
$$

kde $\delta$:

* **Expanze**: pro každé pravidlo $A \to \alpha$ z $P$ má PDA přechod $(q, \alpha) \in \delta(q, \varepsilon, A)$ — bez čtení vstupu nahrazuje vrcholový neterminál $A$ za $\alpha$ (pravá strana pravidla, vrchol vlevo).
* **Match**: pro každý $a \in \Sigma$ má PDA přechod $\delta(q, a, a) = \{(q, \varepsilon)\}$ — když vrchol zásobníku je terminál a vstup začíná stejným terminálem, *odebereme* obojí.

**Idea.** Zásobník drží "to, co ještě musíme odvodit". Začínáme s $S$ na zásobníku. Postupně:

1. Pokud vrcholový symbol je *neterminál* $A$, **expandujeme** ho nedeterministicky podle některého pravidla $A \to \alpha$ (vrchol nahradíme za $\alpha$).
2. Pokud vrcholový symbol je *terminál* $a$ a vstup začíná $a$, **smatchujeme** je (odebereme oba).
3. Pokud zásobník je prázdný a vstup je celý zpracován, *přijímáme*.

**Příklad.** Gramatika $G = (\{S\}, \{0, 1\}, \{S \to 0S1, S \to 01\}, S)$. Odpovídající PDA:

$$
\delta(q, \varepsilon, S) = \{(q, 0S1), (q, 01)\}, \quad \delta(q, 0, 0) = \{(q, \varepsilon)\}, \quad \delta(q, 1, 1) = \{(q, \varepsilon)\}.
$$

**Zpracování slova $000111$**:

$$
\begin{aligned}
&(q, 000111, S) \\
&\vdash (q, 000111, 0S1) \quad (S \to 0S1) \\
&\vdash (q, 00111, S1) \quad (\text{match } 0) \\
&\vdash (q, 00111, 0S11) \quad (S \to 0S1) \\
&\vdash (q, 0111, S11) \quad (\text{match } 0) \\
&\vdash (q, 0111, 0111) \quad (S \to 01) \\
&\vdash (q, 111, 111) \vdash (q, 11, 11) \vdash (q, 1, 1) \vdash (q, \varepsilon, \varepsilon).
\end{aligned}
$$

Slovo je přijato — zásobník i vstup prázdné.

> **Ekvivalence**: $A \stackrel{m}{\Rightarrow} w$ v gramatice právě když $(q, w, A) \vdash^n (q, \varepsilon, \varepsilon)$ v PDA pro nějaké $m, n \geq 1$. Pro $A = S$ to dává $L(G) = L(P)$.

## Směr ⊇: PDA → CFG

**Věta.** Pro každý PDA $P = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, \emptyset)$ přijímající prázdným zásobníkem existuje gramatika $G = (N, \Sigma, P', S)$ taková, že $L(P) = L(G)$.

**Konstrukce.** Neterminály gramatiky jsou *trojice stavů a zásobníkového symbolu*: $[q Z r]$ pro $q, r \in Q$, $Z \in \Gamma$, plus startovní symbol $S$.

**Intuice neterminálu $[qZr]$**: bude odvozovat *právě ta slova* $w$, pro něž z konfigurace $(q, w, Z)$ v PDA dojdeme do $(r, \varepsilon, \varepsilon)$ — tj. z $q$ s vrcholovým $Z$ skončíme v $r$ s prázdným zásobníkem po zpracování $w$.

**Pravidla.** Pro každý přechod $(r, X_1 X_2 \dots X_k) \in \delta(q, a, Z)$ (kde $a \in \Sigma \cup \{\varepsilon\}$ a $k \geq 1$) přidáme do $P'$:

$$
[qZs_k] \to a [rX_1 s_1][s_1 X_2 s_2] \dots [s_{k-1} X_k s_k]
$$

pro *každou* posloupnost stavů $s_1, s_2, \dots, s_k \in Q$.

Pro každý přechod $(r, \varepsilon) \in \delta(q, a, Z)$ (zde $k = 0$) přidáme:

$$
[qZr] \to a.
$$

A pro každý stav $q \in Q$ přidáme startovací pravidlo:

$$
S \to [q_0 Z_0 q].
$$

**Velikost gramatiky.** $|N| = O(|Q|^2 \cdot |\Gamma|)$, počet pravidel $O(|\delta| \cdot |Q|^k)$ — *exponenciální* v délce pravých stran $\delta$. V praxi obvykle používáme malé $k$ (1–2), takže gramatika zůstane *polynomiální*.

> **Korektnost.** Indukcí lze dokázat: $[qZr] \stackrel{*}{\Rightarrow} w$ právě když $(q, w, Z) \vdash^* (r, \varepsilon, \varepsilon)$. Z toho pro $q = q_0$, $Z = Z_0$: $S \Rightarrow [q_0 Z_0 q] \stackrel{*}{\Rightarrow} w$ právě když $w \in L(P)$.

## Determinismus: DPDA vs PDA

**Definice.** *Deterministický PDA* (DPDA) je PDA, ve kterém pro každou trojici $(q, a, Z)$ platí $|\delta(q, a, Z)| \leq 1$, a navíc pokud existuje $\varepsilon$-přechod $\delta(q, \varepsilon, Z) \neq \emptyset$, pak $\delta(q, a, Z) = \emptyset$ pro všechna $a \in \Sigma$ (žádné konflikty mezi $\varepsilon$-přechodem a "normálním").

**Klíčový poznatek.** Pro KA platí $\mathcal{L}_{\mathrm{NKA}} = \mathcal{L}_{\mathrm{DKA}}$ ([[determinizace]]). Pro PDA tato rovnost **neplatí**:

::: math
\mathcal{L}_{\mathrm{DPDA}} \subsetneq \mathcal{L}_{\mathrm{NPDA}} = \mathcal{L}_2.
:::

**Příklad neostrosti.** Jazyk palindromů $L = \{w w^R \mid w \in \{a, b\}^*\}$ je bezkontextový (NPDA "hádá střed" slova), ale **není** přijímán žádným DPDA — bez vědomí o středu nelze deterministicky rozhodnout, kdy přejít z fáze "ukládat na zásobník" do fáze "porovnávat s vrcholem".

Třída jazyků přijímaných DPDA se nazývá **deterministické bezkontextové jazyky** (DCFL). DCFL je *uzavřená* na doplněk (vyžaduje pečlivou konstrukci úplného DPDA), ne ale na sjednocení ani průnik.

::: svg "Vztah hlavních tříd jazyků uvnitř L₂"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="none" stroke-width="1.2">
    <ellipse cx="270" cy="100" rx="240" ry="80" stroke="var(--accent)"/>
    <ellipse cx="270" cy="105" rx="170" ry="55" stroke="var(--accent)"/>
    <ellipse cx="270" cy="115" rx="80" ry="30" stroke="var(--accent)"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle">
    <text x="270" y="35">L₂ = ℒ_NPDA (bezkontextové jazyky)</text>
    <text x="270" y="75">DCFL = ℒ_DPDA (deterministické)</text>
    <text x="270" y="120">LR(k)</text>
    <text x="270" y="138" font-size="10.5" fill="var(--text-muted)">prakticky důležité parsery</text>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="20" y="35">{wwᴿ}</text>
    <text x="20" y="50">{aⁱbʲcᵏ | i=j ∨ j=k}</text>
    <text x="520" y="35" text-anchor="end">syntaxe pro. jazyků</text>
    <text x="520" y="50" text-anchor="end">JSON, XML, expr.</text>
  </g>
  <text x="270" y="195" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">LR(1) přesně odpovídá DCFL přijatým s end-marker.</text>
</svg>
:::

## LL a LR parsování

Pro deterministické podtřídy CFG existují *efektivní* parsery — algoritmy, které ve většině případů zpracují vstup v lineárním čase:

* **LL(k) parsery** simulují PDA z konstrukce CFG → PDA *deterministicky*: musí se rozhodnout, *které pravidlo expandovat*, na základě prvních $k$ symbolů vstupu. Třída jazyků: LL(k). Vyžaduje gramatiku bez levé rekurze ([[normalni-formy]]).
* **LR(k) parsery** pracují *zdola nahoru*: PDA hromadí symboly na zásobníku, pak je *redukuje* podle pravidla (reverzní směr derivace). Třída jazyků: LR(k) ⊆ DCFL.
* Pro $k = 1$ (jeden symbol lookahead) jsou tyto třídy nejvíc používané: většina programovacích jazyků je *LR(1)* nebo *LALR(1)* a parsuje se nástroji jako `yacc`, `bison`, `ANTLR`.

> **Pozn.** Důkladnější probrání LL/LR teorie je v kurzech *IFJ* a *VYP* — v TIN se ekvivalence omezí na *nedeterministickou* CFG ↔ NPDA.

## Důsledky ekvivalence

* **Algoritmické**: bezkontextové jazyky lze ekvivalentně reprezentovat **gramatikou** (pro syntézu a generování) i **automatem** (pro testování členství a parsování). Praktické nástroje volí formalismus podle úlohy.
* **Teoretické**: některé výsledky jsou snazší pro CFG (uzávěr na sjednocení, konkatenaci, Kleene-iteraci), jiné pro PDA (uzávěr na inverzní homomorfismus, průnik s regulárním jazykem).
* **Negativní výsledky**: některé úlohy jsou nerozhodnutelné na *obou* stranách — např. ekvivalence dvou CFG, prázdnost průniku dvou CFG ([[pcp-jazyky]]).

[[vlastnosti-bkj]] zformalizuje pumping lemma pro bezkontextové jazyky a probere *uzávěrové vlastnosti* — kde se třída $\mathcal{L}_2$ chová "regulárně" (uzavřená na sjednocení, konkatenaci, Kleene-iteraci, substituci) a kde *ne* (na průnik, doplněk).

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Chomsky, N.: *Context-Free Grammars and Pushdown Storage* (MIT QPR 65, 1962); Schützenberger, M.-P.: *On Context-Free Languages and Push-Down Automata* (Inf. and Control, 1963); Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), §6.3.*
