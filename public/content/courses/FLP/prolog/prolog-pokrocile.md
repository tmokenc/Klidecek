---
title: Prolog — pokročilé techniky (legacy)
---

# Prolog — pokročilé techniky (legacy)

> **POZOR — LEGACY MATERIÁL:** Tato problematika *není zařazena* od **akademického roku 2026/27**. Prolog byl nahrazen jazykem **[[rust-ownership|Rust]]**.

Pokročilé techniky Prologu — meta-predikáty, CLP, DCG a knowledge engineering (tvorba báze znalostí). Pokud chcete *opravdu* využít sílu logického programování, *právě tady* je dobré začít.

## Meta-predikáty

### call/N

Volá predikát dynamicky:

```prolog
% Static call
?- foo(a, b).

% Dynamic call via call/N
?- call(foo, a, b).

% Build up call
?- F = foo, call(F, a, b).

% Higher-order
maplist(_, [], []).
maplist(P, [H|T], [NH|NT]) :-
    call(P, H, NH),
    maplist(P, T, NT).

square(X, Y) :- Y is X * X.

?- maplist(square, [1,2,3], R).
R = [1, 4, 9].
```

### apply

```prolog
?- Args = [a, b], apply(foo, Args).
% calls foo(a, b)
```

### Programování vyššího řádu (higher-order programming)

```prolog
% Predicate as data
predicate_in_list([foo, bar, baz]).

?- predicate_in_list(L), member(P, L), call(P, x, Y).
% try each predicate

% Map with closure
?- maplist([X, Y]>>(Y is X * 2), [1,2,3], R).
R = [2, 4, 6].
```

Zápis `[Args]>>(Body)` představuje *lambdu* (anonymní funkci) v knihovně Yall.

## Negace jako selhání (negation as failure)

```prolog
\+ Goal.   % "Goal cannot be proven"

?- \+ member(4, [1,2,3]).
true.

?- \+ member(2, [1,2,3]).
false.
```

### Úskalí

```prolog
?- \+ member(X, [1,2,3]).  % "neexistuje žádné X v [1,2,3]"
% Returns false (member succeeds with X=1), což je správně.
% Problém: NAF na non-ground goalu je UNSOUND — neumí navázat
% X na hodnotu mimo seznam (např. 4), ani vyjádřit "∃X. X∉L".
```

Záleží na pořadí (tzv. floundering): dotaz `\+ p(X), X = 1` může selhat, zatímco `X = 1, \+ p(X)` uspěje. Důvodem je, že `\+` nad nenavázaným `X` se vyhodnotí dřív, než se `X` instancuje na konkrétní hodnotu.

**Pravidlo:** `\+` používejte jen s *ground* cíli, tedy s plně instancovanými (zcela navázanými) cíli.

## Assert / Retract — úprava báze znalostí

```prolog
% Add facts
?- assertz(parent(joe, jane)).
true.

?- parent(joe, jane).
true.

% Remove
?- retract(parent(joe, jane)).
true.

?- parent(joe, jane).
false.

% Modify clauses
?- assertz(counter(0)).
?- retract(counter(X)), X1 is X + 1, assertz(counter(X1)).
?- counter(N).
N = 1.
```

**Špatný styl:** assert/retract narušuje deklarativní sémantiku programu. Používejte je jen pro *opravdu dynamická* data.

::: viz prolog-findall-bagof-setof "Vyberte dotaz; uvidíte syrová (raw) řešení z backtrackingu a to, jak se findall / bagof / setof chovají při prázdném výsledku nebo při duplicitách."
:::

## Definite Clause Grammars (DCG)

Syntaktický cukr (zkrácený zápis) pro syntaktickou analýzu (parsing):

```prolog
% Grammar rule
sentence --> noun_phrase, verb_phrase.
noun_phrase --> [the], noun.
verb_phrase --> verb, noun_phrase.
noun --> [cat].
noun --> [dog].
verb --> [sees].
verb --> [chases].

?- sentence([the, cat, sees, the, dog], []).
true.

?- sentence(S, []).
S = [the, cat, sees, the, cat] ;
S = [the, cat, sees, the, dog] ;
% ... etc.
```

DCG se *přeloží* (compile) na běžný Prolog s argumenty v podobě rozdílových seznamů (difference list). Využití:
* Syntaktická analýza přirozeného jazyka.
* Syntaktická analýza programovacích jazyků.
* Generování vět.

::: viz dcg-parser "DCG parsuje větu krok za krokem; v každém kroku je vidět zbytek (residue) rozdílového seznamu (difference list)."
:::

## Constraint Logic Programming (CLP)

Rozšiřuje Prolog o *omezení (constraints)*:

### CLP(FD) — konečné domény (finite domains)

```prolog
:- use_module(library(clpfd)).

% Constraint variables
?- X #= 2 + 3.
X = 5.

% Range
?- X in 1..10, X #> 5.
X in 6..10.

% Solving puzzles — Sudoku
sudoku(Puzzle) :-
    Puzzle = [_,_,_,_,_,_,_,_,_,
              _,_,_,_,_,_,_,_,_,
              ... % 81 vars
             ],
    Puzzle ins 1..9,
    % constraints for rows, cols, 3x3 boxes
    rows(Puzzle, Rs), maplist(all_distinct, Rs),
    columns(Puzzle, Cs), maplist(all_distinct, Cs),
    blocks(Puzzle, Bs), maplist(all_distinct, Bs),
    label(Puzzle).
```

### CLP(R) — reálná čísla (reals)

```prolog
:- use_module(library(clpr)).

?- {X + Y = 10, X - Y = 2}.
X = 6, Y = 4.

?- {X * X = 4}.
X = 2 ; X = -2.
```

CLP elegantně řeší úlohy splnění omezení (constraint satisfaction).

::: viz clp-nqueens "n dam (n-queens) pomocí CLP(FD); na šachovnici je vidět propagace domén (domain propagation) a průběh backtrackingu."
:::

## Tabelované vyhodnocování (tabled execution)

Memoizace (zapamatování si mezivýsledků) pro Prolog:

```prolog
:- table fib/2.

fib(0, 0).
fib(1, 1).
fib(N, F) :- N > 1, N1 is N-1, N2 is N-2,
             fib(N1, F1), fib(N2, F2),
             F is F1 + F2.

?- fib(50, F).
% Fast even though exponential without tabling
```

Direktiva `table` zapíná automatickou memoizaci.

## Ošetření chyb pomocí výjimek (exception handling)

```prolog
?- catch(throw(my_error), E, (write(caught: E), nl)).
caught: my_error
true.

% Standard exceptions
?- catch(X is 1/0, error(evaluation_error(zero_divisor), _), 
         write('Division by zero!')).
Division by zero!
true.
```

## Moduly

```prolog
% File mymodule.pl
:- module(mymodule, [exported/1, another_exported/2]).

exported(X) :- internal(X).
another_exported(X, Y) :- ...

internal(...) :- ...  % not exported

% Usage in another file
:- use_module(mymodule).
?- mymodule:exported(X).
```

## DSL — doménově specifické jazyky (domain specific languages) {tier=example}

Prolog ve tvorbě DSL *vyniká*:

### Logické hádanky

```prolog
% Zebra puzzle
zebra(WaterDrinker, ZebraOwner) :-
    Houses = [house(_,_,_,_,_),  % 5 houses
              house(_,_,_,_,_),
              house(_,_,_,_,_),
              house(_,_,_,_,_),
              house(_,_,_,_,_)],
    member(house(red, english, _, _, _), Houses),
    member(house(_, spaniard, _, _, dog), Houses),
    member(house(green, _, coffee, _, _), Houses),
    % ... more constraints
    member(house(_, _, water, _, _), Houses),
    Houses = [_, _, house(_, _, _, _, milk), _, _],
    nextto(house(_, _, _, kitkat, _), house(_, _, _, _, fox), Houses),
    member(house(_, WaterDrinker, water, _, _), Houses),
    member(house(_, ZebraOwner, _, _, zebra), Houses).

?- zebra(W, Z).
W = norwegian, Z = japanese.
```

### Dokazování vět (theorem proving)

```prolog
% Simple propositional logic
proof(true).
proof(and(A, B)) :- proof(A), proof(B).
proof(or(A, _)) :- proof(A).
proof(or(_, B)) :- proof(B).
proof(not(false)).
proof(implies(A, B)) :- (proof(A) -> proof(B) ; true).  % A→B: pokud A platí, musí platit B

?- proof(and(true, or(false, not(false)))).
true.
```

### N dam (N-queens)

```prolog
queens(N, Q) :-
    length(Q, N),
    numlist(1, N, Numbers),
    queens(Q, Numbers).

queens([], _).
queens([Q|Qs], Numbers) :-
    select(Q, Numbers, Rest),
    safe(Q, Qs, 1),
    queens(Qs, Rest).

safe(_, [], _).
safe(Q, [Q1|Qs], D) :-
    Q1 - Q =\= D,
    Q - Q1 =\= D,
    D1 is D + 1,
    safe(Q, Qs, D1).

?- queens(8, Q).
Q = [1, 5, 8, 6, 3, 7, 2, 4] ;
% ... many solutions
```

## Expertní systémy

```prolog
% Animal identification
animal(albatross) :- has_feathers, can_fly, big_size.
animal(penguin) :- has_feathers, \+ can_fly.
animal(eagle) :- has_feathers, can_fly, hunts.

% Rules
has_feathers :- ask(has_feathers).
can_fly :- ask(can_fly).
hunts :- ask(hunts).
big_size :- ask(big_size).

ask(Q) :-
    format("Does the animal ~w? ", [Q]),
    read(A),
    A = yes.

?- animal(X).
% Interactive Q&A
```

## Zpracování přirozeného jazyka (natural language processing)

```prolog
% Simple sentence analysis
:- use_module(library(lists)).

verb(sees, see).
verb(loves, love).
noun(cat).
noun(dog).

analyze(Words, parsing) :-
    Words = [Subj, V|Rest],
    noun(Subj),
    verb(V, _),
    % more analysis...
    true.
```

DCG ([[#dcg]]) je v Prologu standardem pro zpracování přirozeného jazyka (NLP).

## Logické programování v r. 2025

Prolog je *niche* technologie (pro úzce vymezené použití), ale stále se aktivně používá:

### Aktivní využití

* **Pyrolog, Hyperon** — výzkumné interprety.
* **Cyc** — rozsáhlá báze znalostí.
* **Tau Prolog** — Prolog pro web (v JavaScriptu).
* **Datalog** (podmnožina Prologu) v databázích — Datomic.
* **SWI-Prolog** — open-source, aktivní vývoj.

### Moderní integrace

* **Prolog v Pythonu** přes PySwip.
* **Prolog v Javě** přes JPL.
* **Vnořitelný (embeddable)** do větších systémů.

### Hybridní umělá inteligence

* Symbolická + neuronová (neuro-symbolický přístup).
* Prolog poskytuje *vysvětlení*, neuronová síť zajišťuje *vnímání (perception)*.
* Rostoucí výzkumná oblast od roku 2023.

## Proč Prolog uvolnil místo Rustu

* **Posun v průmyslu (industry shift)** — Rust se rychle prosazuje.
* **Relevance v mainstreamu** — Rust se objevuje v moderním technologickém stacku.
* **Vyprávění o paměťové bezpečnosti (memory safety)** — hlavní prodejní argument Rustu.
* **Výkon (performance)** — Rust je konkurenceschopný s C/C++.
* **Moderní vlastnosti** — async, traity a vlastnictví (ownership) inspirují i komunitu strojového učení (ML).

Prolog *zůstává* relevantní ve *specifických* nikách (logické hádanky, dokazování vět, knowledge engineering), ale *není* mainstreamem.

## Klíčové ponaučení

* Prolog *rozšiřuje myšlenkové paradigma* — i když ho v praxi nepoužíváte.
* **Unifikace + backtracking** = silný myšlenkový model.
* CLP ukazuje, jak *deklarativně* řešit úlohy s omezeními (constraints).
* Moderní programování je *multiparadigmatické* — Rust, Haskell, Python i Prolog, každý má své místo.

> „Znalost mnoha jazyků obohacuje programování." — I starší (legacy) jazyky učí cenné koncepty.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=NxhjsWteUSU" "SZZ: Prolog - Změna programu za běhu" "Tomáš Kocourek"
:::

*Zdroj: FLP přednášky 2025/26 (legacy materiál, Kolář). Externí reference: Bratko, I.: *Prolog Programming for Artificial Intelligence* (4th ed., Pearson 2011); Sterling, L., Shapiro, E.: *The Art of Prolog* (2nd ed., MIT Press 1994); SWI-Prolog manual — [swi-prolog.org/pldoc/](https://www.swi-prolog.org/pldoc/); CLP(FD) tutorial — [swi-prolog.org/man/clpfd.html](https://www.swi-prolog.org/man/clpfd.html).*
