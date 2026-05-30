---
title: Riceova věta — nerozhodnutelnost je pravidlo
---

# Riceova věta

[[problem-zastaveni]] dokázal jeden konkrétní nerozhodnutelný problém. [[redukce]] z něj odvodila další. **Riceova věta** (Henry G. Rice, 1953) je *univerzální generalizace*: říká, že *žádná netriviální sémantická vlastnost* programu (resp. RE jazyka) není rozhodnutelná. Tj. *téměř všechno* o chování programu je principiálně nezjistitelné.

## Vlastnost jazyka

**Definice.** *Vlastnost rekurzivně vyčíslitelných množin* nad abecedou $\Sigma$ je zobrazení

$$
P : \{\text{rekurzivně vyčíslitelné podmnožiny } \Sigma^*\} \to \{\bot, \top\},
$$

kde $\top$ = "vlastnost platí", $\bot$ = "vlastnost neplatí".

**Příklady vlastností**:
* "$L = \emptyset$" — jazyk je prázdný.
* "$L$ je konečný" — jazyk obsahuje konečně mnoho slov.
* "$L = \Sigma^*$" — jazyk obsahuje všechna slova.
* "$L$ je regulární".
* "$L$ obsahuje slovo $\varepsilon$".

> **Pozor!** Vlastnost je definována na *jazycích* (množinách), ne na *strojích*. Toto rozlišení je *kritické*:
>
> * **Vlastnosti jazyků** (= vlastnosti pro Riceovu větu): "$L(M) = \emptyset$", "$L(M)$ je regulární", "$L(M)$ obsahuje $\varepsilon$".
> * **Vlastnosti TS** (= NE-vlastnosti jazyků, Riceova věta neplatí): "$M$ má alespoň 2005 stavů", "$M$ zastaví na *všech* vstupech".

Vlastnost TS *není* vlastnost jazyka, pokud existují dva TS $M_1, M_2$ s $L(M_1) = L(M_2)$, ale jeden splňuje vlastnost a druhý ne. Např. "*TS má 5 stavů*" se mění při triviální duplikaci stavu — tedy *jazyková* vlastnost to není.

## Netriviální vlastnost

**Definice.** Vlastnost $P$ je *netriviální*, pokud:

* Existuje aspoň jeden RE jazyk $L_1$ s $P(L_1) = \top$, **a**
* Existuje aspoň jeden RE jazyk $L_2$ s $P(L_2) = \bot$.

Tj. $P$ není vždy pravdivá ani vždy nepravdivá.

> Triviální vlastnosti — "*$L$ je v RE*" (vždy $\top$) nebo "*$L$ není v RE*" (vždy $\bot$) — jsou *konstantami*, tedy *rozhodnutelné* (vrátit konstantu). Riceova věta jen vylučuje *konstantnost*.

## Hlavní věta

**Věta (Rice).** *Každá netriviální vlastnost rekurzivně vyčíslitelných jazyků je **nerozhodnutelná**.*

Formálně, jazyk

$$
L_P = \{\langle M\rangle \mid P(L(M)) = \top\}
$$

není rekurzivní, ať je netriviální $P$ jakákoli.

## Důkaz Riceovy věty

Nechť $P$ je netriviální vlastnost. *Bez újmy na obecnosti* předpokládejme $P(\emptyset) = \bot$ (kdyby $P(\emptyset) = \top$, pracujeme s $\neg P$, která je také netriviální).

Protože $P$ je netriviální, existuje RE jazyk $A$ s $P(A) = \top$. Nechť $K$ je TS přijímající $A$ (tj. $L(K) = A$).

**Redukce $L_\mathrm{HP} \leq L_P$:**

Pro vstup $\langle M\rangle \# \langle w\rangle$ sestrojíme TS $M'$ takto:

$M'$ je 2-páskový TS, který na vstupu $x$:

1. **Uloží** $x$ na 2. pásku (zachovat originální vstup).
2. **Zapíše** $w$ na 1. pásku (slovo $w$ je *zakódováno* v řízení $M'$).
3. **Simuluje** $M$ na 1. pásce s vstupem $w$.
4. Pokud $M$ zastaví na $w$, $M'$ **přepne** na 2. pásku a začne simulovat $K$ na $x$.
5. $M'$ přijme $x$ tehdy a jen tehdy, když $K$ přijme $x$.

::: svg "Konstrukce stroje M' pro Riceovu redukci"
<svg viewBox="0 0 540 250" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="0.9">
    <rect x="40" y="60" width="180" height="30"/>
    <rect x="40" y="100" width="180" height="30"/>
  </g>
  <text x="20" y="80" fill="var(--text-muted)" font-size="10">P₁:</text>
  <text x="20" y="120" fill="var(--text-muted)" font-size="10">P₂:</text>
  <text x="130" y="80" text-anchor="middle" fill="var(--text)" font-size="11">w (z M')</text>
  <text x="130" y="120" text-anchor="middle" fill="var(--text)" font-size="11">x (vstup)</text>
  <g stroke="var(--accent)" stroke-width="1.3" fill="var(--bg-card)">
    <rect x="290" y="40" width="220" height="170" rx="8"/>
  </g>
  <g fill="var(--accent)" font-size="11">
    <text x="400" y="60" text-anchor="middle">M' řízení:</text>
    <text x="300" y="85">1. simuluje M na P₁ s w</text>
    <text x="300" y="105">2. pokud M zastaví →</text>
    <text x="300" y="125">3. simuluje K na P₂ s x</text>
    <text x="300" y="145">4. přijme, pokud K přijme</text>
    <text x="300" y="180" font-size="10.5" fill="var(--text-muted)">L(M') = ?</text>
    <text x="300" y="195" font-size="10.5" fill="var(--text-muted)">  M zastaví na w → L(M') = A</text>
    <text x="300" y="210" font-size="10.5" fill="var(--text-muted)">  M cyklí na w   → L(M') = ∅</text>
  </g>
  <text x="270" y="240" text-anchor="middle" fill="var(--text-muted)" font-size="11">σ(⟨M⟩#⟨w⟩) = ⟨M'⟩</text>
</svg>
:::

**Analýza $L(M')$:**

* Pokud $M$ **zastaví** na $w$: $M'$ se dostane do kroku 4 a dál se chová jako $K$. Tedy $L(M') = L(K) = A$. Tím $P(L(M')) = P(A) = \top$.
* Pokud $M$ **cyklí** na $w$: $M'$ se zasekne v kroku 3 a nikdy nepřijme. Tedy $L(M') = \emptyset$. Tím $P(L(M')) = P(\emptyset) = \bot$.

Definujme redukci $\sigma(\langle M\rangle \# \langle w\rangle) = \langle M'\rangle$.

**Korektnost.** Tato funkce $\sigma$ je *vyčíslitelná totálním TS* — stačí mechanicky sestavit kód $M'$ z $\langle M\rangle$, $\langle w\rangle$ a fixního kódu $K$.

Pak:

$$
\langle M\rangle \# \langle w\rangle \in L_\mathrm{HP} \iff M \text{ zastaví na } w \iff P(L(M')) = \top \iff \langle M'\rangle \in L_P.
$$

Tedy $L_\mathrm{HP} \leq L_P$. Protože $L_\mathrm{HP} \notin \text{R}$, není $L_P \in \text{R}$. ∎

## Aplikace Riceovy věty

Mnoho otázek o programech *okamžitě* dostává status "nerozhodnutelné":

| Otázka | Vlastnost $P(L)$ | Důsledek |
| :--- | :--- | :--- |
| Přijme TS $M$ slovo $\varepsilon$? | "$\varepsilon \in L$" | Nerozhodnutelná |
| Je $L(M)$ konečný? | "$L$ konečný" | Nerozhodnutelná |
| Je $L(M)$ regulární? | "$L$ regulární" | Nerozhodnutelná |
| Je $L(M)$ bezkontextový? | "$L$ bezkontextový" | Nerozhodnutelná |
| Je $L(M)$ kontextový? | "$L$ kontextový" | Nerozhodnutelná |
| Obsahuje $L(M)$ palindrom? | "$L$ obsahuje aspoň jeden palindrom" | Nerozhodnutelná |

Všechny tyto vlastnosti jsou *netriviální* — existují RE jazyky, které je splňují, i takové, které nesplňují. Proto Riceova věta okamžitě říká *nerozhodnutelné*.

## Co Riceova věta NEŘÍKÁ

* **Nerozhodnutelnost vlastností TS (ne jazyků).** Vlastnosti jako "TS má 5 stavů", "TS čte vstup zleva doprava", "TS používá pouze symboly $\{0, 1, \Delta\}$" jsou *vlastnosti stroje*, ne *jazyka*. Tyto vlastnosti **mohou** být rozhodnutelné (a často jsou — stačí zkontrolovat kód).
* **Nerozhodnutelnost o *konkrétních* programech.** Pro daný *konkrétní* $M$ je jeho jazyk *konkrétní* a *konkrétní* otázka ("Je $L(M)$ regulární?") má *konkrétní* odpověď. Riceova věta zakazuje obecný *algoritmus*, ne odpověď v konkrétním případě.

## Druhá část Riceovy věty: monotónní vlastnosti

**Definice.** Vlastnost $P$ je *monotónní*, pokud pro každé dva RE jazyky $A, B$:

$$
A \subseteq B \land P(A) \Rightarrow P(B).
$$

Tj. pokud vlastnost platí pro $A$ a $B$ obsahuje $A$, pak vlastnost platí i pro $B$.

**Příklady monotónních vlastností**:
* "$L$ je nekonečné" — pokud $L$ nekonečné a $L \subseteq L'$, pak $L'$ je taky nekonečné. ✓
* "$L = \Sigma^*$" — pokud $L = \Sigma^*$ a $L \subseteq L'$, pak $L' = \Sigma^*$. ✓ (uvažme $L = L'$)
* "$L$ obsahuje konkrétní slovo $w_0$".

**Příklady NEmonotónních vlastností**:
* "$L$ je konečné" — pokud $L$ konečné a $L \subseteq L'$, $L'$ může být *nekonečné*.
* "$L = \emptyset$" — analogicky.
* "$L$ je regulární" — pokud $L$ regulární a $L \subseteq L'$, $L'$ může být i nerozhodnutelné.

**Věta (Rice — silnější verze).** *Každá netriviální nemonotónní vlastnost RE jazyků není ani parciálně rozhodnutelná.*

Tj. $L_P \notin \text{RE}$ pro netriviální nemonotónní $P$.

**Důkaz** (idea, plně v Kozen 1997). Redukcí $\mathrm{co}\text{-}\mathrm{HP} \leq L_P$. Pro NEmonotónní $P$ existují $A \subset B$ s $P(A) = \top$ a $P(B) = \bot$ (nebo naopak — vybereme tu polovinu). Konstrukce $M'$ pak vrátí buď $A$ nebo $B$ podle toho, zda $M$ na $w$ cyklí (= co-HP).

## Důsledky pro praxi

Riceova věta dává *teoretickou základnu* pro:

* **Nedostupnost obecných verifikátorů**. Nelze obecně rozhodnout, zda program splňuje *libovolnou netriviální* specifikaci.
* **Nemožnost dokonalých statických analyzátorů**. Nástroje jako `cppcheck`, `clang-tidy`, `mypy` jsou *vždy* approximativní — bezpečné podtřídy programů, ne všechny.
* **Nutnost runtime checků**. Některé chyby (např. division by zero, out-of-bounds) lze v obecnosti detekovat jen v *runtimu*.
* **Žádný obecný "perfektní debugger"**.

Z hlediska *limitací výpočtu* je Riceova věta jeden z nejhlubších výsledků — *přírodní zákon* informatiky: ne všechno o softwaru lze algoritmicky zjistit.

## Souvislost s Gödelovou větou

Riceova věta a [[godel-neuplnost]] sdílí podobnou intuici:
* **Rice**: nelze algoritmicky rozhodnout vlastnosti algoritmů.
* **Gödel**: nelze formálně dokázat všechny pravdivosti aritmetiky.

Obě jsou důsledky **diagonalizace** a "fixed-point" konstrukcí (programy / formule, které "mluví o sobě"). Spojení dělají *redukce přes Gödelovo číslování*: matematické věty kódujeme jako čísla, programy taky, a dokazatelnost/zastavení vede k podobným paradoxním konstrukcím.

[[pcp-jazyky]] uvede Postův korespondenční problém jako *další* nerozhodnutelný problém — *kombinatoricky elementární*, ale silný v důkazech (redukce z PCP se používají k důkazům nerozhodnutelnosti v gramatikách).

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Rice, H.G.: *Classes of Recursively Enumerable Sets and Their Decision Problems* (Trans. AMS, 1953); Kozen, D.C.: *Automata and Computability* (Springer 1997), kap. 34; Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), problem 5.28; Soare, R.: *Recursively Enumerable Sets and Degrees* (Springer 1987), kap. III.*
