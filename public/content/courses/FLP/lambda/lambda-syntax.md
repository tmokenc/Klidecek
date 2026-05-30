---
title: Lambda kalkul — syntaxe a sémantika
---

# Lambda kalkul — syntaxe a sémantika

**Lambda kalkul** (λ-kalkul) je *formální systém* pro popis výpočtů pomocí *funkcí*. Alonzo Church ho navrhl v 30. letech 20. století jako základ matematické logiky. V r. 1930 ukázal Haskell Curry ekvivalenci s teorií kombinátorů (Moses Schönfinkel); v r. 1936 Kleene + Church prokázali, že λ-kalkul je *univerzální výpočetní systém* (Turing-úplný). McCarthy se inspiroval λ-kalkulem při tvorbě jazyka LISP (1950s). Dnes je λ-kalkul *teoretickým základem* všech funkcionálních jazyků — Haskell, ML, Scala, OCaml, F# — a inspirací i pro mainstream jazyky (Java lambdas, C++ lambdas, Python lambdas).

## Syntaxe

Lambda kalkul má **jen tři** druhy výrazů (λ-výrazů):

::: math
E ::= V \mid (E_1\ E_2) \mid (\lambda V.\ E)
:::

* **V** — proměnná (variable), např. $x, y, z, f$.
* **$(E_1\ E_2)$** — *aplikace* (application), aplikuje funkci $E_1$ na argument $E_2$.
* **$(\lambda V.\ E)$** — *abstrakce* (abstraction), definuje funkci s parametrem $V$ a tělem $E$.

### Komponenty abstrakce

V $\lambda x.\ E$:

* **Hlavička** — $\lambda x.$ — *vázaná proměnná* $x$.
* **Tělo** — $E$ — výraz, který může obsahovat $x$.

## Konvence pro zápis

Pro pohodlí se zavedly konvence, které **vynechávají** zbytečné závorky:

* **Left associativita aplikace:**

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

Tedy $\lambda x y z.\ E$ je zkratka pro $\lambda x.\ \lambda y.\ \lambda z.\ E$ — *curried* funkce s třemi parametry.

## Příklady

### Identita

::: math
I = \lambda x.\ x
:::

Aplikace na něco: $I\ y = (\lambda x.\ x)\ y = y$.

### Konstantní funkce

::: math
K = \lambda x y.\ x
:::

$K\ a\ b = a$ — vrátí první argument, ignoruje druhý.

### Aplikace dvou funkcí

::: math
S = \lambda f g x.\ f\ x\ (g\ x)
:::

$S\ f\ g\ x = (f\ x)\ (g\ x)$.

### Kombinátor SKK = I

Klasický fakt: $S\ K\ K\ x = K\ x\ (K\ x) = x$, takže $S\ K\ K = I$.

::: viz lambda-reducer "Step-through β-redukce; vyberte preset nebo zadejte vlastní výraz; normal-order vs applicative."
:::

## Volné a vázané proměnné

V $\lambda x.\ E$ je $x$ **vázaná** v $E$. Ostatní proměnné v $E$ jsou *volné*.

### Free Variables (FV)

::: math
\begin{aligned}
FV(x) &= \{x\} \\
FV(E_1\ E_2) &= FV(E_1) \cup FV(E_2) \\
FV(\lambda x.\ E) &= FV(E) \setminus \{x\}
\end{aligned}
:::

### Bound Variables (BV)

::: math
\begin{aligned}
BV(x) &= \emptyset \\
BV(E_1\ E_2) &= BV(E_1) \cup BV(E_2) \\
BV(\lambda x.\ E) &= BV(E) \cup \{x\}
\end{aligned}
:::

### Příklad

V $\lambda x.\ x\ y$:
* $FV = \{y\}$ (y je volná).
* $BV = \{x\}$ (x je vázaná).

## Alpha-konverze (α-equivalence)

**Přejmenování** vázané proměnné nezmění význam:

::: math
\lambda x.\ E \equiv_\alpha \lambda y.\ E[x \to y]
:::

pokud $y \notin FV(E)$.

**Příklad:** $\lambda x.\ x = \lambda y.\ y = \lambda z.\ z$ — vše je *identita*.

> **Klíčová věc:** vázané proměnné jsou jen *štítky* — jméno *nezáleží*.

## Substituce

$E[V \to E']$ znamená "v $E$ nahraď *volné* výskyty $V$ za $E'$":

::: math
\begin{aligned}
V[V \to E'] &= E' \\
V'[V \to E'] &= V' \quad \text{kde } V \neq V' \\
(E_1\ E_2)[V \to E'] &= (E_1[V \to E'])\ (E_2[V \to E']) \\
(\lambda V.\ E)[V \to E'] &= \lambda V.\ E \quad \text{(žádná free V)} \\
(\lambda V'.\ E)[V \to E'] &= \lambda V'.\ E[V \to E'] \quad \text{kde } V \neq V', V' \notin FV(E')
\end{aligned}
:::

Posledí pravidlo: pokud $V' \in FV(E')$, musíme nejprve α-přejmenovat $V'$ aby nedošlo k *captures* (zachycení) volné proměnné.

## Příklady substituce

* $x[x \to y] = y$.
* $z[x \to y] = z$.
* $(\lambda x.\ x)[x \to y] = \lambda x.\ x$ (x je vázaná, beze změny).
* $(\lambda z.\ x)[x \to y] = \lambda z.\ y$.
* $(\lambda y.\ x)[x \to y]$ → α-rename $\lambda y$ na $\lambda y'$: $\lambda y'.\ y$.

## Význam

Lambda kalkul tvoří **základ** pro:

* **Beta redukci** — *výpočet* aplikací — viz [[lambda-redukce]].
* **Reprezentaci dat** — booleans, čísla, páry — viz [[church-enc]].
* **Rekurzí přes kombinátory** — Y combinator, fixed-point — viz [[lambda-redukce]].
* **Typové systémy** — simply typed λ-calculus (STLC), polymorphic types (System F), dependent types.
* **Sémantika programovacích jazyků** — denotational, operational.

Praktický význam: **každý funkcionální jazyk** je nakonec *překládán* (nebo redukovatelný) na λ-kalkul. Pochopení λ-kalkulu je *fundamentální* pro porozumění FP.

## Historický kontext

* **20. léta:** Alonzo Church studuje *foundations of mathematics*.
* **1932-1936:** Church publishes λ-calculus, Church-Turing thesis.
* **1936:** Kleene + Church prove λ-calculus is universal (Turing equivalence).
* **1958:** McCarthy creates **LISP** (List Processing) inspired by λ-calculus.
* **1985:** **ML** (Meta Language) — typed FP.
* **1990:** **Haskell** standardized — pure functional language.
* **2003:** **Scala** — functional + object-oriented on JVM.
* **2010s:** Mainstream adoption — Java 8 lambdas, C++11 lambdas, Python lambdas, JavaScript arrow functions.

---

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Church, A.: *The Calculi of Lambda Conversion* (Princeton 1941); Barendregt, H. P.: *The Lambda Calculus: Its Syntax and Semantics* (Elsevier 1984) — kanonická reference; Pierce, B. C.: *Types and Programming Languages* (MIT Press 2002); Parkinson, M.: *Foundations of functional programming* (Cambridge Lent 2009).*
