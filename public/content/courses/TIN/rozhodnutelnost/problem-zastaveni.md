---
title: Problém zastavení — Halting Problem
---

# Problém zastavení Turingova stroje

Existence univerzálního TS ([[univerzalni-ts]]) říká, že *jeden* abstraktní stroj simuluje libovolný jiný. Nabízí se otázka: nelze ho rozšířit *o jeden krok* a sestavit stroj, který by *předpovídal*, zda libovolný TS zastaví? Negativní odpověď je **Halting Problem**: takový stroj **nemůže existovat**. Tento výsledek (Turing, 1936) je prvním a nejdůležitějším důkazem *nerozhodnutelnosti* v teorii vyčíslitelnosti.

## Formulace problému

**Halting Problem (HP)** se neformálně ptá: *"Daný TS $M$ a vstup $w$ — zastaví $M$ na $w$ v konečném čase?"*

Formálně jako jazyk:

::: math
L_\mathrm{HP} = \{\langle M\rangle \# \langle w\rangle \mid M \text{ zastaví na vstupu } w\}.
:::

kde $\langle M\rangle$ je kódování TS $M$ (viz [[univerzalni-ts]]) a $\langle w\rangle$ je kódování vstupu $w$. Separátor `#` odděluje obě části.

> Otázka **rozhodnutelnosti**: existuje *totální* TS $K$, který pro každý vstup $\langle M\rangle \# \langle w\rangle$ v konečném čase odpoví "ano" (přijme, pokud $M$ zastaví na $w$) nebo "ne" (zamítne abnormálně, pokud $M$ nezastaví)?

## Hlavní věta

**Věta (Turing, 1936).** Problém zastavení TS *není* rozhodnutelný, ale *je* částečně rozhodnutelný.

::: math
L_\mathrm{HP} \in \text{RE} \setminus \text{R}.
:::

Tedy $L_\mathrm{HP}$ patří mezi rekurzivně vyčíslitelné, ale *není* rekurzivní.

## Důkaz částečné rozhodnutelnosti

**Trivální směr.** Modifikujeme univerzální TS $U$ tak, aby pro vstup $\langle M\rangle \# \langle w\rangle$:

1. **Simuloval** $M$ na $w$ pomocí standardní univerzální konstrukce.
2. Pokud $M$ *zastaví* (libovolným způsobem — přijetím nebo abnormálně), $U$ přejde do svého koncového stavu $q_F^U$ a **přijme**.
3. Pokud $M$ cyklí, $U$ taky cyklí (a tedy nepřijme).

Tato modifikace dostane tvar **rozpoznavače** $L_\mathrm{HP}$. Tedy $L_\mathrm{HP} \in \text{RE}$.

> Klíčové: stačí *jediná* modifikace univerzálního TS — namísto rozlišování přijmout/abnormálně zastavit prostě "zaregistruj, že stroj zastavil".

## Důkaz nerozhodnutelnosti (diagonalizace)

Předpokládejme pro spor, že existuje **totální** TS $K$, který *rozhoduje* $L_\mathrm{HP}$:

* $K(\langle M\rangle \# \langle w\rangle)$ přijme, pokud $M$ zastaví na $w$,
* $K(\langle M\rangle \# \langle w\rangle)$ zamítne (abnormálně), pokud $M$ nezastaví na $w$.

**Diagonální konstrukce.** Sestavíme nový TS $N$, který pro vstup $x \in \{0, 1\}^*$:

1. **Interpretuje** $x$ jako kód TS $M_x$ (pokud $x$ je nelegální kód, použije fixní triviální TS).
2. **Zavolá** $K$ na vstupu $\langle M_x\rangle \# x$ — tj. ptá se, zda $M_x$ zastaví, když dostane *svůj vlastní kód* na vstupu.
3. **Otočí výsledek**:
   * Pokud $K$ přijme (= $M_x$ zastaví na $x$): $N$ *přejde do nekonečného cyklu*.
   * Pokud $K$ zamítne (= $M_x$ nezastaví na $x$): $N$ *zastaví normálně* (přijme).

::: svg "Diagonalizace: N otáčí výsledek K na diagonále tabulky [TS × vstup]"
<svg viewBox="0 0 575 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="0.9" fill="var(--bg-card)">
    <rect x="60" y="30" width="50" height="30"/>
    <rect x="110" y="30" width="50" height="30"/>
    <rect x="160" y="30" width="50" height="30"/>
    <rect x="210" y="30" width="50" height="30"/>
    <rect x="60" y="60" width="50" height="30"/>
    <rect x="110" y="60" width="50" height="30"/>
    <rect x="160" y="60" width="50" height="30"/>
    <rect x="210" y="60" width="50" height="30"/>
    <rect x="60" y="90" width="50" height="30"/>
    <rect x="110" y="90" width="50" height="30"/>
    <rect x="160" y="90" width="50" height="30"/>
    <rect x="210" y="90" width="50" height="30"/>
    <rect x="60" y="120" width="50" height="30"/>
    <rect x="110" y="120" width="50" height="30"/>
    <rect x="160" y="120" width="50" height="30"/>
    <rect x="210" y="120" width="50" height="30"/>
  </g>
  <g fill="var(--text-muted)" font-size="10">
    <text x="35" y="45" text-anchor="end">M_0:</text>
    <text x="35" y="75" text-anchor="end">M_1:</text>
    <text x="35" y="105" text-anchor="end">M_2:</text>
    <text x="35" y="135" text-anchor="end">M_3:</text>
    <text x="85" y="22" text-anchor="middle">x=0</text>
    <text x="135" y="22" text-anchor="middle">x=1</text>
    <text x="185" y="22" text-anchor="middle">x=2</text>
    <text x="235" y="22" text-anchor="middle">x=3</text>
  </g>
  <g fill="var(--text)" font-size="10.5" text-anchor="middle">
    <text x="85" y="50">Z</text>
    <text x="135" y="50">C</text>
    <text x="185" y="50">Z</text>
    <text x="235" y="50">Z</text>
    <text x="85" y="80">Z</text>
    <text x="135" y="80">Z</text>
    <text x="185" y="80">C</text>
    <text x="235" y="80">Z</text>
    <text x="85" y="110">C</text>
    <text x="135" y="110">Z</text>
    <text x="185" y="110">Z</text>
    <text x="235" y="110">C</text>
    <text x="85" y="140">Z</text>
    <text x="135" y="140">Z</text>
    <text x="185" y="140">C</text>
    <text x="235" y="140">Z</text>
  </g>
  <g stroke="var(--accent)" stroke-width="2" fill="none">
    <rect x="60" y="30" width="50" height="30"/>
    <rect x="110" y="60" width="50" height="30"/>
    <rect x="160" y="90" width="50" height="30"/>
    <rect x="210" y="120" width="50" height="30"/>
  </g>
  <text x="380" y="50" fill="var(--accent)" font-size="11">N(x): otoč diagonální záznam</text>
  <text x="380" y="75" fill="var(--text-muted)" font-size="10">M_x zastaví na x  →  N(x) cyklí</text>
  <text x="380" y="95" fill="var(--text-muted)" font-size="10">M_x cyklí na x   →  N(x) zastaví</text>
  <text x="380" y="135" fill="var(--text-muted)" font-size="10">N se liší od každého M_x</text>
  <text x="380" y="155" fill="var(--text-muted)" font-size="10">→ N není v posloupnosti</text>
  <text x="380" y="180" fill="var(--accent)" font-size="10.5">SPOR (TS jsou všechny vyjmenované)</text>
  <text x="135" y="185" fill="var(--text-muted)" font-size="10">Z = zastaví,  C = cyklí</text>
</svg>
:::

**Pozorování.** $N$ je sám TS — má svůj kód $\langle N\rangle$. Položme $n = \langle N\rangle$ (kód $N$ jako řetězec). Co se stane, když $N$ pustíme na vstupu $n$?

* Pokud $N(n)$ zastaví: podle definice $N$, $K(\langle M_n\rangle \# n)$ musela přijmout, tedy $M_n$ *zastaví* na $n$. Ale $M_n = N$, tedy $N$ *zastaví* na $n$. **OK, ale**: definice $N$ říká, že $N$ pak měla *cyklit* (vstoupit do cyklu). Spor.
* Pokud $N(n)$ nezastaví (cyklí): podle definice $N$, $K(\langle M_n\rangle \# n)$ musela *zamítnout*, tedy $M_n$ *nezastaví* na $n$. Tedy $N$ *nezastaví* na $n$. Ale podle definice $N$ se tehdy mělo *zastavit normálně*. Spor.

V obou případech **spor**. Z předpokladu existence $K$ plyne nesmyslné chování $N$. Tedy $K$ nemůže existovat. ∎

## Co to znamená

* **Nemůže existovat algoritmus**, který by pro libovolný program a vstup *vždy* určil, zda program zastaví.
* **Existuje algoritmus**, který *pozná, kdy ano* (univerzální TS), ale *nepozná, kdy ne* — pokud program cyklí, simulátor cyklí spolu s ním.
* Tato jednoduchá nemožnost má **dramatické důsledky**: nelze obecně rozhodnout o ekvivalenci dvou programů, o správnosti programu vůči specifikaci, o terminaci kompilace, ...

## Důsledek: co-HP není ani RE

**Věta.** Doplněk problému zastavení $\mathrm{co}\text{-}\mathrm{HP}$ není rekurzivně vyčíslitelný.

::: math
\mathrm{co}\text{-}\mathrm{HP} = \{\langle M\rangle \# \langle w\rangle \mid M \text{ nezastaví na } w\} \notin \text{RE}.
:::

**Důkaz** (z věty z [[rekurzivni-jazyky]]): Pokud by *oba* $L_\mathrm{HP}$ a $\mathrm{co}\text{-}\mathrm{HP}$ byly v RE, pak by $L_\mathrm{HP} \in \text{R}$ (paralelní simulace dvou rozpoznavačů). Ale $L_\mathrm{HP} \notin \text{R}$. Tedy $\mathrm{co}\text{-}\mathrm{HP} \notin \text{RE}$. ∎

**Intuice**: ani *parciálně* nepoznáme, že program "nezastaví" — nemůžeme totiž *čekat nekonečně dlouho*, abychom se ujistili. Žádný TS nemá "trpělivost" zjistit, že simulovaný program cyklí.

## Hierarchie rozhodnutelnosti pro $L$ a $\overline{L}$

Pro libovolný jazyk $L$ a jeho doplněk $\overline{L}$ musí *vždy* nastat *právě jedna* z těchto situací (důsledek tří vět z [[rekurzivni-jazyky]]):

| Stav | $L$ | $\overline{L}$ | Příklad |
| :-: | :-: | :-: | :--- |
| Oba rozhodnutelné | R | R | regulární a kontextové jazyky |
| Žádný není RE | ¬RE | ¬RE | $\{\langle M\rangle \mid L(M) = \Sigma^*\}$ |
| Jeden RE, druhý ne | RE \ R | ¬RE | $L_\mathrm{HP}$ vs. $\mathrm{co}\text{-}\mathrm{HP}$ |

Nikdy nemůže nastat "oba jsou RE, ale jen jeden je R" — to by porušilo tvrzení z [[rekurzivni-jazyky]].

## Historický a praktický kontext

* **Historie.** Turingova práce z 1936 byla *odpovědí* na Hilbertův *Entscheidungsproblem* — otázku, zda existuje algoritmus, který rozhoduje pravdivost libovolné prvořádové formule ([[godelovo-cislovani]], [[godel-neuplnost]]). HP je *překlad* tohoto problému do jazyka výpočtů. Negativní odpověď vyřešila Entscheidungsproblem také záporně.
* **Praktický důsledek.** *Static analysis* (= analýza programu bez jeho spuštění) je *nutně nedokonalá*. Některé chyby nelze odhalit bez spuštění, a spuštění nedává garanci ukončení.
* **"Halting Problem in disguise".** Mnoho realných problémů je *redukcí ekvivalentní* HP:
   * "$L(M) = \emptyset$" — TS přijme nějaký řetězec?
   * "$L(M) = \Sigma^*$" — TS přijme všechny řetězce?
   * "$L(M_1) = L(M_2)$" — dva TS přijímají stejný jazyk?
   * "Daný program nezpůsobí null-pointer dereferenci."
   * "Daný kompilátor terminuje na všech vstupech."

   Všechny tyto problémy jsou nerozhodnutelné — *protože* HP je nerozhodnutelný. Důkazy probereme v [[redukce]] a generalizujeme v [[riceova-veta]].

[[redukce]] formalizuje techniku, kterou jsme intuitivně použili: *redukci jednoho nerozhodnutelného problému na jiný*. Riceova věta ([[riceova-veta]]) pak ukáže, že *všechny* netriviální vlastnosti jazyků jsou nerozhodnutelné — nerozhodnutelnost je *pravidlo, ne výjimka*.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Turing, A.M.: *On Computable Numbers, With an Application to the Entscheidungsproblem* (Proc. London Math. Soc., 1936); Davis, M.: *The Undecidable* (Raven Press, 1965); Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), §4.2; Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), §9.2.*
