---
title: Výroková logika — syntaxe a sémantika
---

# Výroková logika

Posuneme se od *teorie výpočtu* k *teorii dokazování*. **Výroková logika** (VL) je nejjednodušší logický systém — pracuje s *atomickými výroky* (proměnnými s pravdivostními hodnotami) a *spojkami* ($\neg, \land, \lor, \to$). VL je *rozhodnutelná*, ale problém splnitelnosti (SAT) je *NP-úplný* ([[cook-levin]]). Tato kapitola zavádí *syntax* a *sémantiku* — tj. *co je formule* a *co znamená*.

## Co je logický systém

**Logický systém** matematicky přesně definuje:

* **Syntaxi** — co je platná formule (gramatická pravidla).
* **Sémantiku** — jaký je význam formule (model, splnění).
* **Dokazovací systém** — jaká je platná logická argumentace ([[dukazove-systemy]]).

Tyto tři komponenty by měly být *propojené* — formálně dokazatelné by mělo splývat se sémanticky pravdivým ([[vlastnosti-pl]]).

## Syntaxe VL

Pro pevnou množinu **výrokových proměnných** $\mathcal{X}$ definujeme jazyk formulí gramatikou:

::: math
\varphi \to X \mid \neg(\varphi) \mid (\varphi \land \varphi) \quad \text{kde } X \in \mathcal{X}.
:::

Z formulí, které generuje toto minimum, lze odvodit *libovolnou* formuli VL. *Další* spojky jsou *syntaktický cukr*:

::: math
\begin{aligned}
\varphi \lor \psi &\equiv \neg(\neg\varphi \land \neg\psi), \\
\varphi \to \psi &\equiv \neg\varphi \lor \psi, \\
\varphi \leftrightarrow \psi &\equiv (\varphi \to \psi) \land (\psi \to \varphi), \\
\varphi \oplus \psi &\equiv \neg(\varphi \leftrightarrow \psi), \\
\varphi\ \mathrm{NAND}\ \psi &\equiv \neg(\varphi \land \psi), \\
0 &\equiv X \land \neg X, \quad 1 \equiv X \lor \neg X.
\end{aligned}
:::

> **Pozn.** Minimální množina spojek $\{\neg, \land\}$ je *funkčně úplná* — můžeme jí vyjádřit *libovolnou* boolovskou funkci. Existují i menší úplné množiny: $\{\mathrm{NAND}\}$ nebo $\{\mathrm{NOR}\}$ jsou *singletonové* funkčně úplné množiny.

## Sémantika VL

**Ohodnocení** (valuation, model, interpretace) je funkce $I : \mathcal{X} \to \{0, 1\}$, která přiřazuje booleovskou hodnotu každé proměnné.

**Relace splnění** $I \models \varphi$ (čteno "$I$ splňuje $\varphi$") je definována induktivně:

::: math
\begin{aligned}
I \models X &\iff I(X) = 1, \\
I \models \neg\varphi &\iff I \not\models \varphi, \\
I \models \varphi \land \psi &\iff I \models \varphi \;\text{a zároveň}\; I \models \psi.
\end{aligned}
:::

Pro odvozené spojky ($\lor, \to, \leftrightarrow$) plynou definice přímočaře z výše uvedeného:

::: math
\begin{aligned}
I \models \varphi \lor \psi &\iff I \models \varphi \;\text{nebo}\; I \models \psi, \\
I \models \varphi \to \psi &\iff I \not\models \varphi \;\text{nebo}\; I \models \psi, \\
I \models \varphi \leftrightarrow \psi &\iff (I \models \varphi) \;\text{a}\; (I \models \psi) \;\text{mají stejnou hodnotu}.
\end{aligned}
:::

## Klíčové pojmy

| Pojem | Definice |
| :--- | :--- |
| **Tautologie** (platná, *valid*) | $\varphi$ je tautologie ⟺ $I \models \varphi$ pro *každé* $I$. Píšeme $\models \varphi$. |
| **Kontradikce** (nesplnitelná, *unsatisfiable*) | $\varphi$ je kontradikce ⟺ $I \not\models \varphi$ pro *každé* $I$. |
| **Splnitelná** (*satisfiable*) | Existuje $I$ s $I \models \varphi$. |
| **Logicky ekvivalentní** | $\varphi \Leftrightarrow \psi$ ⟺ $\varphi \leftrightarrow \psi$ je tautologie. |
| **Logický důsledek** | $\varphi \Rightarrow \psi$ ⟺ $\varphi \to \psi$ je tautologie. |

**Klíčové vztahy:**

* $\varphi$ je tautologie ⟺ $\neg\varphi$ je kontradikce.
* $\varphi$ je splnitelná ⟺ $\neg\varphi$ není tautologie.

## Příklady

**Tautologie:**
* $\varphi \lor \neg\varphi$ — zákon vyloučeného třetího.
* $\neg(\varphi \land \neg\varphi)$ — zákon sporu.
* $(\varphi \to \psi) \to (\neg\psi \to \neg\varphi)$ — kontrapozice.
* $\varphi \to \varphi$ — identita.

**Kontradikce:**
* $\varphi \land \neg\varphi$.
* $0$.

**Splnitelné, ale ne tautologie:**
* $\varphi \land \psi$.
* $\varphi \to \psi$.

## Pravdivostní tabulka

Pro malé formule lze sémantiku znázornit *pravdivostní tabulkou* — vyčíslíme $\varphi$ pro každou kombinaci hodnot proměnných.

**Příklad**: $\varphi = (A \lor B) \land \neg(A \land B)$ (XOR):

| $A$ | $B$ | $A \lor B$ | $A \land B$ | $\neg(A \land B)$ | $\varphi$ |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 0 | 0 | 0 | 0 | 1 | **0** |
| 0 | 1 | 1 | 0 | 1 | **1** |
| 1 | 0 | 1 | 0 | 1 | **1** |
| 1 | 1 | 1 | 1 | 0 | **0** |

$\varphi$ je *splnitelná* (řádky 2, 3), ale *není tautologie* (řádky 1, 4 jsou 0).

## Normální formy

Pro algoritmické zpracování VL formulí (zejména SAT) se používají *normální* tvary.

**Negation Normal Form (NNF):**
* Pouze spojky $\land, \lor, \neg$.
* Negace pouze před atomickými výroky (literály).
* Převod: odstranit $\to, \leftrightarrow$ podle definic + aplikovat *De Morganovy zákony*:

::: math
\neg(\varphi \land \psi) \equiv \neg\varphi \lor \neg\psi, \quad \neg(\varphi \lor \psi) \equiv \neg\varphi \land \neg\psi, \quad \neg\neg\varphi \equiv \varphi.
:::

**Disjunktivní normální forma (DNF):**

::: math
\varphi \equiv (\ell_{11} \land \ell_{12} \land \dots) \lor (\ell_{21} \land \ell_{22} \land \dots) \lor \dots
:::

Disjunkce *konjunktů literálů*. Každý konjunkt = jedno "vyhovující" přiřazení (resp. jedna vyhovující množina přiřazení).

**Konjunktivní normální forma (CNF):**

::: math
\varphi \equiv (\ell_{11} \lor \ell_{12} \lor \dots) \land (\ell_{21} \lor \ell_{22} \lor \dots) \land \dots
:::

Konjunkce *disjunktů literálů* (klauzulí). Každá klauzule = jedna *podmínka*, kterou musí přiřazení splnit.

> **Vztah CNF/DNF**: $\varphi$ v CNF ⟺ $\neg\varphi$ v DNF (po De Morgan).

**Převod do CNF/DNF:** přes NNF + distributivní zákony:

::: math
\varphi \land (\psi \lor \chi) \equiv (\varphi \land \psi) \lor (\varphi \land \chi).
:::

> **Pozor**: tento naivní převod může mít *exponenciální blowup*. CNF s $n$ klauzulemi může mít DNF s $2^n$ konjunkty.

## SAT — problém splnitelnosti

$\mathrm{SAT}$ = jazyk **splnitelných** formulí VL. Tento problém je *rozhodnutelný* — můžeme jednoduše projít všech $2^{|\mathcal{X}|}$ ohodnocení a zkontrolovat. Avšak složitost:

::: math
\mathrm{SAT} \in \mathrm{NP},\quad \text{a SAT je NP-úplný (Cookova věta — viz [[cook-levin]])}.
:::

V praxi se používají **SAT solvery**:
* Pracují s CNF (viz Tseitynova transformace dále).
* Základ: *backtracking* (DPLL, CDCL).
* Heuristiky pro výběr proměnné, učení klauzulí, restartování.
* Zvládnou stovky tisíc proměnných v reálném čase.

**Aplikace SAT solverů:**
* Plánování a kombinatorická optimalizace.
* Lámání šifer (kryptoanalýza).
* Analýza a verifikace software a hardware.
* Generování testů, modelování.
* Optimalizace překladu, automatické čištění.
* Herní AI, biologie, zdravotnictví.

## Tseitinova transformace

**Problém**: ekvivalentní převod do CNF je *exponenciální*. Můžeme získat *ekvi-splnitelnou* CNF *polynomiálně*?

**Tseitinova transformace** (Tseitin 1968):
1. Pro každou *podformuli* $\varphi$ zaveď novou proměnnou $x_\varphi$.
2. Přidej klauzule $(x_\varphi \leftrightarrow \varphi)$ pro každou.
3. Pro celou formuli $\psi$ přidej klauzuli $x_\psi$.
4. Převeď všechny tyto klauzule do CNF (jednotlivě, jen pomocí lokální distributivity).

**Velikost**: lineární v délce původní formule. *Není* ekvivalentní (přidává nové proměnné), ale je *ekvi-splnitelná* — původní $\psi$ je splnitelná ⟺ tseitinova forma je splnitelná.

## Otázka: efektivní převod do DNF

> *Co by znamenala existence efektivního polynomiálního překladu do DNF?*

* DNF lze v *lineárním čase* zkontrolovat na splnitelnost (stačí najít jeden splnitelný konjunkt — vždy splnitelný, pokud nemá kontradikci uvnitř).
* Pokud máme polynomiální překlad VL → DNF, dostáváme polynomiální algoritmus pro SAT.
* SAT je NP-úplný (Cookova věta).
* Tedy: efektivní VL → DNF by *dokázal* $\mathrm{P} = \mathrm{NP}$.

Neexistence takové transformace tedy plyne z (pravděpodobné) hypotézy $\mathrm{P} \neq \mathrm{NP}$.

## Hilbertovský systém — předmluva

[[dukazove-systemy]] zavede *Hilbertův kalkul* — formální dokazovací systém s axiomatickými schématy a *modus ponens*. Centrální otázka:

* **Co je dokazatelné** ($\vdash \varphi$) vs. **co je platné** ($\models \varphi$)?

Pro VL existuje *věta o úplnosti*: $\vdash \varphi \iff \models \varphi$. Tj. dokazatelnost = platnost. Tento výsledek nemá obdobu pro silnější logiky (např. aritmetiku — viz [[godel-neuplnost]]).

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Boole, G.: *An Investigation of the Laws of Thought* (Walton & Maberly, 1854); Tseitin, G.S.: *On the Complexity of Derivation in Propositional Calculus* (Studies in Constr. Math. and Math. Logic, 1968); Biere, A. et al.: *Handbook of Satisfiability* (IOS Press, 2009); Mendelson, E.: *Introduction to Mathematical Logic* (6th ed., CRC 2015), kap. 1.*
