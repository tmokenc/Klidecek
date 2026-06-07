---
title: Prolog — základy (zastaralý materiál)
---

# Prolog — základy (zastaralý materiál)

> **POZOR — ZASTARALÝ MATERIÁL:** Tato problematika *není zařazena* do kurzu FLP od **akademického roku 2026/27**. Prolog byl ve výuce *nahrazen* jazykem **[[rust-ownership|Rust]]** jako moderní multiparadigmatická alternativa. Materiály zde slouží *pro historický kontext* a studentům *zapsaným do předchozích semestrů*.

**Prolog** (Programming in Logic) je *deklarativní* logický programovací jazyk vyvinutý v r. 1972 (Alain Colmerauer, Robert Kowalski). Místo *popisu, jak* věci dělat (imperativní přístup) Prolog *popisuje, co* hledáme (relace, fakta, pravidla) — vyhodnocovací jádro (engine) odvodí odpověď samo.

## Filosofie

Imperativní jazyk: „Vezmi seznam, projdi ho, najdi prvek X."

Prolog: „Existuje takový X, který je v seznamu?"

Jádro řeší *jak* odpověď najít — používá k tomu **unifikaci** a **backtracking** (návrat se zpětným prohledáváním), viz [[unifikace-backtrack]].

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

**Pravidlo:** `Hlava :- Tělo.` znamená „Hlava je pravdivá, pokud je pravdivé Tělo."

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

Atomy a termy:

```
atom(args).
term ::= atom | variable | number | atom(term1, ..., termN) | [term1, ..., termN]
```

## Termy

### Atomy

* Řetězce začínající *malým písmenem*: `tom`, `bob`, `apple`.
* Řetězce v jednoduchých uvozovkách: `'Hello World'`.
* Čísla: `42`, `3.14`, `-5`.

### Proměnné

* Řetězce začínající *velkým písmenem* nebo `_`: `X`, `Result`, `_Temp`.
* `_` = anonymní proměnná („na hodnotě nezáleží").

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

Pozor: `X = 5` je **unifikace**, nikoli přiřazení! `X is 5` *vyhodnotí* pravou stranu.

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

## Klasické příklady {tier=example}

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

### Práce se seznamy

Standardní predikáty pro seznamy (`append/3` a jeho **reverzibilita**, `reverse/2`, `length/2`, …) jsou definovány a vysvětleny v [[prolog-seznamy]].

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

* **SWI-Prolog** — nejrozšířenější, zdarma, open-source. [swi-prolog.org](https://www.swi-prolog.org/)
* **GNU Prolog** — zdarma, podle normy ISO.
* **YAP Prolog** — rychlý, používaný ve výzkumu.
* **SICStus Prolog** — komerční, zaměřený na výkon (performance).
* **Tau Prolog** — implementace v JavaScriptu.

## Použití

### Klasické

* **Expertní systémy (expert systems)** — lékařská diagnostika (MYCIN), právní usuzování.
* **Zpracování přirozeného jazyka (Natural Language Processing)** — syntaktická analýza (parsing), sémantická analýza.
* **Dokazování vět (theorem proving)** — automatická dedukce.
* **Reprezentace znalostí (knowledge representation)** — sémantický web.
* **Dotazování nad databázemi** — Datalog (podmnožina Prologu).

### Moderní

* **Symbolická umělá inteligence (symbolic AI)** — z doby před hlubokým učením, stále relevantní pro hybridní AI.
* **Programování s omezeními (Constraint Programming)** (Prolog s rozšířeními CLP).
* **Logické hádanky** — Sudoku, problém n dam.
* **Verifikace** — dokazovač vět Bedrock.

## Klady

* **Deklarativnost** — popisujete problém, nikoli jeho řešení.
* **Porovnávání vzorů (pattern matching)** a unifikace jsou přirozenou součástí jazyka.
* **Backtracking** probíhá automaticky — jazyk sám prozkoumává možná řešení.
* **Reverzibilita** — predikáty fungují oběma směry.
* **Kompaktní** kód pro symbolické úlohy.

## Zápory

* **Výkon (performance)** — pro řadu úloh pomalejší než imperativní jazyky.
* **Vedlejší efekty (side effects)** se ošetřují neohrabaně (`assert`, `retract`).
* **Řez (cut, `!`)** narušuje deklarativní sémantiku.
* **Obtížné ladění** — backtracking není při běhu vidět.
* **Okrajové využití** — omezené nasazení v praxi.
* **Strmá křivka učení** — vyžaduje změnu způsobu myšlení.

## Klíčové ponaučení

Prolog představuje *zásadně odlišné* paradigma:

* **Imperativní:** *co dělat, krok za krokem.*
* **Funkcionální:** *jakou hodnotu vypočítat.*
* **Logické:** *jaké relace platí.*

To rozšiřuje *způsob myšlení* o programování — i když nebudete psát Prolog v produkci, jeho znalost obohatí váš celkový rozhled v informatice.

## Proč Rust nahradil Prolog v osnově 2026/27

Důvody změny:

* **Uplatnění v praxi** — Rust roste, Prolog stagnuje.
* **Multiparadigmatičnost** — Rust pokrývá více konceptů funkcionálního programování (FP) než klasické OOP.
* **Paměťová bezpečnost (memory safety)** — jedinečné zaměření jazyka.
* **Výkon** — srovnatelný s jazykem C.
* **Trh práce** — počet pozic pro Rust roste exponenciálně.

Prolog *zůstává* akademicky hodnotný, ale jeho praktické uplatnění v moderní praxi je *omezené*.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=Pp6tEZLkASI" "SZZ: Prolog - Unifikace a vyhodnocování" "Tomáš Kocourek"
:::

*Zdroj: FLP přednášky 2025/26 (legacy materiál, Kolář). Externí reference: Bratko, I.: *Prolog Programming for Artificial Intelligence* (4th ed., Pearson 2011) — kanonická reference; Clocksin, W. F., Mellish, C. S.: *Programming in Prolog* (5th ed., Springer 2003); SWI-Prolog — [swi-prolog.org](https://www.swi-prolog.org/); Sterling, L., Shapiro, E.: *The Art of Prolog* (2nd ed., MIT Press 1994).*
