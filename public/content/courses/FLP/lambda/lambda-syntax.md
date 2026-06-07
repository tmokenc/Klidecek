---
title: Lambda kalkul — syntaxe a sémantika
---

# Lambda kalkul — syntaxe a sémantika

**Lambda kalkul** (λ-kalkul) je *formální systém* pro popis výpočtů pomocí *funkcí*. Alonzo Church ho navrhl ve 30. letech 20. století jako základ matematické logiky. V roce 1930 ukázal Haskell Curry jeho ekvivalenci s teorií kombinátorů (Moses Schönfinkel); v roce 1936 Kleene a Church prokázali, že λ-kalkul je *univerzální výpočetní systém* (turingovsky úplný). John McCarthy se λ-kalkulem inspiroval při tvorbě jazyka LISP (v 50. letech). Dnes je λ-kalkul *teoretickým základem* všech funkcionálních jazyků — Haskell, ML, Scala, OCaml, F# — a inspiroval i jazyky hlavního proudu (lambda výrazy v Javě, C++ i Pythonu).

## Syntaxe

Lambda kalkul má **jen tři** druhy výrazů (λ-výrazů):

::: math
E ::= V \mid (E_1\ E_2) \mid (\lambda V.\ E)
:::

* **V** — proměnná (variable), např. $x, y, z, f$.
* **$(E_1\ E_2)$** — *aplikace* (application), aplikuje funkci $E_1$ na argument $E_2$.
* **$(\lambda V.\ E)$** — *abstrakce* (abstraction), definuje funkci s parametrem $V$ a tělem $E$.

### Komponenty abstrakce

Ve výrazu $\lambda x.\ E$:

* **Hlavička** — $\lambda x.$ — *vázaná proměnná* $x$.
* **Tělo** — $E$ — výraz, který může obsahovat $x$.

## Konvence pro zápis

Pro pohodlí se zavedly konvence, které **vynechávají** zbytečné závorky:

* **Levá asociativita aplikace:**

::: math
((\ldots ((E_1\ E_2)\ E_3) \ldots)\ E_n) \equiv E_1\ E_2\ E_3 \ldots E_n
:::

* **Vnořená abstrakce:**

::: math
(\lambda V.\ (E_1\ \ldots\ E_n)) \equiv \lambda V.\ E_1\ \ldots\ E_n
:::

* **Vícenásobná abstrakce:**

::: math
(\lambda V_1.\ (\ldots\ (\lambda V_n.\ E)\ \ldots)) \equiv \lambda V_1\ \ldots\ V_n.\ E
:::

Zápis $\lambda x y z.\ E$ je tedy zkratka pro $\lambda x.\ \lambda y.\ \lambda z.\ E$ — *curryovaná* (curried) funkce se třemi parametry.

## Příklady {tier=example}

### Identita

::: math
I = \lambda x.\ x
:::

Aplikace na něco: $I\ y = (\lambda x.\ x)\ y = y$.

### Konstantní funkce

::: math
K = \lambda x y.\ x
:::

$K\ a\ b = a$ — vrátí první argument, druhý ignoruje.

### Aplikace dvou funkcí

::: math
S = \lambda f g x.\ f\ x\ (g\ x)
:::

$S\ f\ g\ x = (f\ x)\ (g\ x)$.

### Kombinátor SKK = I

Klasický fakt: $S\ K\ K\ x = K\ x\ (K\ x) = x$, takže $S\ K\ K = I$.

::: viz lambda-reducer "Krokování β-redukce; vyberte přednastavený výraz nebo zadejte vlastní; normální pořadí (normal-order) vs. aplikativní (applicative)."
:::

## Volné a vázané proměnné

Ve výrazu $\lambda x.\ E$ je $x$ **vázaná** v $E$. Ostatní proměnné v $E$ jsou *volné*.

### Volné proměnné (free variables, FV)

::: math
\begin{aligned}
FV(x) &= \{x\} \\
FV(E_1\ E_2) &= FV(E_1) \cup FV(E_2) \\
FV(\lambda x.\ E) &= FV(E) \setminus \{x\}
\end{aligned}
:::

### Vázané proměnné (bound variables, BV)

::: math
\begin{aligned}
BV(x) &= \emptyset \\
BV(E_1\ E_2) &= BV(E_1) \cup BV(E_2) \\
BV(\lambda x.\ E) &= BV(E) \cup \{x\}
\end{aligned}
:::

### Příklad

Ve výrazu $\lambda x.\ x\ y$:
* $FV = \{y\}$ (y je volná).
* $BV = \{x\}$ (x je vázaná).

## Alfa-konverze (α-ekvivalence)

**Přejmenování** vázané proměnné nezmění význam:

::: math
\lambda x.\ E \equiv_\alpha \lambda y.\ E[x \to y]
:::

pokud $y \notin FV(E)$.

**Příklad:** $\lambda x.\ x = \lambda y.\ y = \lambda z.\ z$ — vše je *identita*.

> **Klíčová věc:** vázané proměnné jsou jen *štítky* — na jejich jménu *nezáleží*.

## Substituce

Zápis $E[V \to E']$ znamená „v $E$ nahraď *volné* výskyty $V$ za $E'$":

::: math
\begin{aligned}
V[V \to E'] &= E' \\
V'[V \to E'] &= V' \quad \text{kde } V \neq V' \\
(E_1\ E_2)[V \to E'] &= (E_1[V \to E'])\ (E_2[V \to E']) \\
(\lambda V.\ E)[V \to E'] &= \lambda V.\ E \quad \text{(žádné volné V)} \\
(\lambda V'.\ E)[V \to E'] &= \lambda V'.\ E[V \to E'] \quad \text{kde } V \neq V', V' \notin FV(E')
\end{aligned}
:::

Poslední pravidlo: pokud $V' \in FV(E')$, musíme nejprve provést α-přejmenování $V'$, aby nedošlo k zachycení (capture) volné proměnné.

## Příklady substituce

* $x[x \to y] = y$.
* $z[x \to y] = z$.
* $(\lambda x.\ x)[x \to y] = \lambda x.\ x$ (x je vázaná, beze změny).
* $(\lambda z.\ x)[x \to y] = \lambda z.\ y$.
* $(\lambda y.\ x)[x \to y]$ → α-přejmenování $\lambda y$ na $\lambda y'$: $\lambda y'.\ y$.

## Význam

Lambda kalkul tvoří **základ** pro:

* **Beta redukci** — *výpočet* aplikací — viz [[lambda-redukce]].
* **Reprezentaci dat** — pravdivostní hodnoty (booleans), čísla, páry — viz [[church-enc]].
* **Rekurzi přes kombinátory** — Y kombinátor, pevný bod (fixed-point) — viz [[lambda-redukce]].
* **Typové systémy** — jednoduše typovaný λ-kalkul (simply typed λ-calculus, STLC), polymorfní typy (System F), závislé typy (dependent types).
* **Sémantiku programovacích jazyků** — denotační, operační.

Praktický význam: **každý funkcionální jazyk** je nakonec *přeložen* (nebo redukovatelný) na λ-kalkul. Pochopení λ-kalkulu je *fundamentální* pro porozumění funkcionálnímu programování.

## Historický kontext

* **20. léta:** Alonzo Church studuje *základy matematiky*.
* **1932–1936:** Church publikuje λ-kalkul, vzniká Church-Turingova teze.
* **1936:** Kleene a Church dokazují, že λ-kalkul je univerzální (ekvivalentní Turingovu stroji).
* **1958:** McCarthy vytváří **LISP** (List Processing) inspirovaný λ-kalkulem.
* **1985:** **ML** (Meta Language) — typované funkcionální programování.
* **1990:** standardizace jazyka **Haskell** — čistě funkcionální jazyk.
* **2003:** **Scala** — funkcionální a objektové programování na JVM.
* **2010. léta:** rozšíření do hlavního proudu — lambda výrazy v Javě 8, lambda výrazy v C++11, lambda výrazy v Pythonu, šipkové funkce (arrow functions) v JavaScriptu.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=8Z_sosW2dgU" "SZZ : Lambda kalkul - úvod" "Tomáš Kocourek"
:::

::: youtube "https://www.youtube.com/watch?v=Eo6FVosifWk" "SZZ: Lambda kalkul - definice pravdivostních hodnot a přirozených čísel" "Tomáš Kocourek"
:::

::: youtube "https://www.youtube.com/watch?v=eis11j_iGMs" "Lambda Calculus - Computerphile" "Computerphile"
:::

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Church, A.: *The Calculi of Lambda Conversion* (Princeton 1941); Barendregt, H. P.: *The Lambda Calculus: Its Syntax and Semantics* (Elsevier 1984) — kanonická reference; Pierce, B. C.: *Types and Programming Languages* (MIT Press 2002); Parkinson, M.: *Foundations of functional programming* (Cambridge Lent 2009).*
