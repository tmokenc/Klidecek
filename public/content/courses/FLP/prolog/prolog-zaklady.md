---
title: Prolog — základy (legacy)
---

# Prolog — základy (legacy)

> **POZOR — LEGACY MATERIÁL:** Tato problematika *není zařazena* do kurzu FLP od **akademického roku 2026/27**. Prolog byl ve výuce *nahrazen* jazykem **[[rust-ownership|Rust]]** jako moderní multi-paradigmové alternativa. Materiály zde slouží *pro historický kontext* a studenty *zapsané do předchozích semestrů*.

**Prolog** (Programming in Logic) je *deklarativní* logický programovací jazyk vyvinutý v r. 1972 (Alain Colmerauer, Robert Kowalski). Místo *popisu jak* věci dělat (imperativní) Prolog *popisuje co* hledáme (relace, fakta, pravidla) — *engine* odvozuje odpověď.

## Filosofie

Imperativní jazyk: "Vezmi seznam, projdi ho, najdi prvek X."

Prolog: "Existuje takový X, který je v seznamu?"

Engine řeší *jak* odpověď najít — používá **unifikaci** + **backtracking** ([[unifikace-backtrack]]).

## Základní stavební prvky

### Fakta

```prolog
% Father relation
father(tom, bob).
father(tom, liz).
father(bob, ann).
father(bob, pat).

% Mother relation
mother(jane, bob).
mother(jane, liz).
mother(sue, ann).
mother(sue, pat).
```

Každý řádek je *fakt* — pravdivý výrok.

### Pravidla

```prolog
% Parent relation derived from father/mother
parent(X, Y) :- father(X, Y).
parent(X, Y) :- mother(X, Y).

% Grandparent
grandparent(X, Z) :- parent(X, Y), parent(Y, Z).

% Sibling
sibling(X, Y) :- parent(P, X), parent(P, Y), X \= Y.

% Aunt
aunt(X, Y) :- female(X), sibling(X, Z), parent(Z, Y).
```

**Pravidlo:** `Hlava :- Tělo.` znamená "Hlava je pravdivá, pokud Tělo je pravdivé."

`,` = AND (konjunkce). `;` = OR (disjunkce).

### Dotazy (queries)

```prolog
?- father(tom, bob).
true.

?- father(tom, X).
X = bob ;
X = liz ;
false.

?- grandparent(tom, X).
X = ann ;
X = pat ;
false.

?- sibling(bob, liz).
true.
```

## Struktura programu

```prolog
program ::= clause+
clause ::= fact | rule
fact ::= predicate(args).
rule ::= head :- body.
head ::= predicate(args)
body ::= goal | goal,body | goal;body
```

Atomy + termy:

```
atom(args).
term ::= atom | variable | number | atom(term1, ..., termN) | [term1, ..., termN]
```

## Termy

### Atomy

* Strings začínající *malým písmenem*: `tom`, `bob`, `apple`.
* Strings v jednoduchých uvozovkách: `'Hello World'`.
* Čísla: `42`, `3.14`, `-5`.

### Proměnné

* Strings začínající *velkým písmenem* nebo `_`: `X`, `Result`, `_Temp`.
* `_` = anonymous (don't care).

### Složené termy

* `foo(a, b, c)` — predikát foo s argumenty.
* `point(1.0, 2.0)` — struktura.
* `[1, 2, 3]` — seznam.
* `tree(1, leaf, leaf)` — strom.

## Seznamy

```prolog
% Empty list
[]

% Non-empty
[1, 2, 3]
[a, b, c]
[H|T]      % Head | Tail decomposition

% Examples
member(X, [X|_]).
member(X, [_|T]) :- member(X, T).

?- member(2, [1,2,3]).
true.

?- member(X, [a,b,c]).
X = a ;
X = b ;
X = c.
```

## Aritmetika

```prolog
% is — evaluates right side
X is 2 + 3.       % X = 5
Y is X * 2.       % Y = 10
Z is X mod 3.     % Z = 2
W is X / 2.       % W = 2.5

% =:= equality of evaluated
?- 2 + 3 =:= 5.
true.

% =\= inequality
?- 2 + 3 =\= 6.
true.
```

Pozor: `X = 5` je **unification**, ne assignment! `X is 5` je *evaluation*.

## Operátory

```prolog
% Equality
=     % unification
\=    % NOT unifiable
==    % structural equality
\==   % NOT structurally equal
=:=   % arithmetic equality
=\=   % arithmetic inequality
<, >, =<, >=  % arithmetic comparison

% Logical
,     % conjunction
;     % disjunction
\+    % negation as failure
!     % cut (commits to choice)
```

## Klasické příklady

### Faktoriál

```prolog
factorial(0, 1).
factorial(N, F) :-
    N > 0,
    N1 is N - 1,
    factorial(N1, F1),
    F is N * F1.

?- factorial(5, X).
X = 120.
```

### Fibonacci

```prolog
fib(0, 0).
fib(1, 1).
fib(N, F) :-
    N > 1,
    N1 is N - 1,
    N2 is N - 2,
    fib(N1, F1),
    fib(N2, F2),
    F is F1 + F2.

?- fib(10, X).
X = 55.
```

### Seznam append

```prolog
append([], L, L).
append([H|T1], L2, [H|T2]) :- append(T1, L2, T2).

?- append([1,2], [3,4], X).
X = [1,2,3,4].

?- append(X, Y, [1,2,3]).
X = [], Y = [1,2,3] ;
X = [1], Y = [2,3] ;
X = [1,2], Y = [3] ;
X = [1,2,3], Y = [].
```

**Reverzibilita** — funkce funguje *v obou směrech*!

### Reverse list

```prolog
reverse([], []).
reverse([H|T], R) :- reverse(T, RT), append(RT, [H], R).

?- reverse([1,2,3], X).
X = [3,2,1].
```

## Standardní Prolog

```prolog
% Common predicates
length(List, N).
nth0(Index, List, Elem).
sort(List, Sorted).
sum_list(List, Sum).
maplist(Pred, List).
```

## Implementace

* **SWI-Prolog** — most popular, free, open-source. [swi-prolog.org](https://www.swi-prolog.org/)
* **GNU Prolog** — free, ISO standard.
* **YAP Prolog** — fast, used in research.
* **SICStus Prolog** — commercial, performance.
* **Tau Prolog** — JavaScript implementation.

## Použití

### Klasické

* **Expert systems** — medical diagnosis (MYCIN), legal reasoning.
* **Natural Language Processing** — parsing, semantic analysis.
* **Theorem proving** — automated deduction.
* **Knowledge representation** — semantic web.
* **Database querying** — Datalog (subset of Prolog).

### Moderní

* **Symbolic AI** — pre-DL era, still relevant for hybrid AI.
* **Constraint Programming** (Prolog + CLP extensions).
* **Logic puzzles** — Sudoku, n-queens.
* **Verification** — Bedrock theorem prover.

## Klady

* **Declarative** — describe problem, not solution.
* **Pattern matching** + unification natural.
* **Backtracking** automatic — explore solutions.
* **Reversibility** — predicates work both ways.
* **Compact** code for symbolic problems.

## Zápory

* **Performance** — slower than imperative for many tasks.
* **Side effects** awkward (`assert`, `retract`).
* **Cut (!)** breaks declarative semantics.
* **Hard to debug** — backtracking is invisible.
* **Niche** — limited industry adoption.
* **Learning curve** — paradigm shift.

## Klíčové ponaučení

Prolog je *fundamentálně odlišný* paradigma:

* **Imperative:** *what to do, step by step.*
* **Functional:** *what value to compute.*
* **Logic:** *what relations hold.*

Toto rozšiřuje *způsob myšlení* o programování — i pokud nebudete psát Prolog v produkci, *know it* enriches your CS knowledge.

## Proč Rust nahradil Prolog v osnově 2026/27

Důvody change:

* **Industry relevance** — Rust roste, Prolog stagnuje.
* **Multi-paradigm** — Rust pokrývá víc FP konceptů než klasický OOP.
* **Memory safety** — unique focus.
* **Performance** — competitive with C.
* **Job market** — Rust pozice rostou exponenciálně.

Prolog *zůstává* hodnotný akademicky, ale praktická aplikace v moderním industry je *omezena*.

---

*Zdroj: FLP přednášky 2025/26 (legacy materiál, Kolář). Externí reference: Bratko, I.: *Prolog Programming for Artificial Intelligence* (4th ed., Pearson 2011) — kanonická reference; Clocksin, W. F., Mellish, C. S.: *Programming in Prolog* (5th ed., Springer 2003); SWI-Prolog — [swi-prolog.org](https://www.swi-prolog.org/); Sterling, L., Shapiro, E.: *The Art of Prolog* (2nd ed., MIT Press 1994).*
