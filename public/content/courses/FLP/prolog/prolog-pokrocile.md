---
title: Prolog — pokročilé techniky (legacy)
---

# Prolog — pokročilé techniky (legacy)

> **POZOR — LEGACY MATERIÁL:** Tato problematika *není zařazena* od **akademického roku 2026/27**. Prolog byl nahrazen jazykem **[[rust-ownership|Rust]]**.

Pokročilé Prolog techniky — meta-predikáty, CLP, DCG, knowledge engineering. Pokud chcete *opravdu* využít sílu logického programování, *toto* je *kde* začít.

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

### Higher-order programming

```prolog
% Predicate as data
predicate_in_list([foo, bar, baz]).

?- predicate_in_list(L), member(P, L), call(P, x, Y).
% try each predicate

% Map with closure
?- maplist([X, Y]>>(Y is X * 2), [1,2,3], R).
R = [2, 4, 6].
```

`[Args]>>(Body)` is *lambda* in Yall library.

## Negation as failure

```prolog
\+ Goal.   % "Goal cannot be proven"

?- \+ member(4, [1,2,3]).
true.

?- \+ member(2, [1,2,3]).
false.
```

### Issues

```prolog
% Logical negation: "exists X, not P(X)"
?- \+ member(X, [1,2,3]).  % UNSOUND
% Returns false because Prolog tries member(X, ...) and succeeds
% but logically, there ARE elements not in the list (e.g., 4)
```

**Pravidlo:** Use `\+` only with *ground* (fully instantiated) goals.

## Assert / Retract — KB modification

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

**Bad style:** assert/retract breaks declarative semantics. Use for *truly dynamic* data only.

::: viz prolog-findall-bagof-setof "Vyberte query; uvidíte raw backtrack řešení + jak findall / bagof / setof se chovají při empty / duplicates."
:::

## Definite Clause Grammars (DCG)

Syntactic sugar for parsing:

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

DCG is *compiled* to regular Prolog with difference list arguments. Used for:
* Parsing natural language.
* Parsing programming languages.
* Generating sentences.

::: viz dcg-parser "DCG parsuje větu krok-po-kroku; residue difference list visible v každém kroku."
:::

## Constraint Logic Programming (CLP)

Extends Prolog with *constraints*:

### CLP(FD) — Finite Domains

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

### CLP(R) — Reals

```prolog
:- use_module(library(clpr)).

?- {X + Y = 10, X - Y = 2}.
X = 6, Y = 4.

?- {X * X = 4}.
X = 2 ; X = -2.
```

CLP solves *constraint satisfaction* problems elegantly.

::: viz clp-nqueens "n-queens s CLP(FD); domain propagation, backtrack body viditelné na šachovnici."
:::

## Tabled execution

Memoization for Prolog:

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

`table` directive enables automatic memoization.

## Exception handling

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

## Modules

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

## DSLs — Domain Specific Languages

Prolog *excels* at DSLs:

### Logical puzzles

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

### Theorem proving

```prolog
% Simple propositional logic
proof(true).
proof(and(A, B)) :- proof(A), proof(B).
proof(or(A, _)) :- proof(A).
proof(or(_, B)) :- proof(B).
proof(not(false)).
proof(implies(A, B)) :- proof(A), proof(B).

?- proof(and(true, or(false, not(false)))).
true.
```

### N-queens

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

## Expert systems

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

## Natural Language Processing

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

DCG ([[#dcg]]) je standard pro NLP in Prolog.

## Logic programming v r. 2025

Prolog je *niche* technologie, ale stále aktivně používán:

### Active applications

* **Pyrolog, Hyperon** — research interpreters.
* **Cyc** — large knowledge base.
* **Tau Prolog** — Web Prolog (JavaScript).
* **Datalog** (Prolog subset) v databázích — Datomic.
* **SWI-Prolog** — open-source, active development.

### Modern integrations

* **Prolog in Python** via PySwip.
* **Prolog in Java** via JPL.
* **Embeddable** in larger systems.

### Hybrid AI

* Symbolic + neural (neuro-symbolic).
* Prolog for *explanation*, NN for *perception*.
* Growing research area 2023+.

## Proč Prolog uvolnil místo Rustu

* **Industry shift** — Rust adoption rapid.
* **Mainstream relevance** — Rust appears in modern stack.
* **Memory safety** narrative — Rust selling point.
* **Performance** — Rust competitive with C/C++.
* **Modern features** — async, traits, ownership inspire ML community.

Prolog *zůstává* relevantní v *specifických* nikách (logic puzzles, theorem proving, knowledge engineering), ale *není* mainstream.

## Klíčové ponaučení

* Prolog je *paradigm-broadening* — i pokud nepoužíváte v praxi.
* **Unifikace + backtracking** = silný mental model.
* CLP demonstruje, jak *deklarativně* řešit constraint problémy.
* Modern programming je *multi-paradigm* — Rust, Haskell, Python, Prolog každý má své místo.

> "Knowing many languages enriches programming." — Even legacy languages teach valuable concepts.

---

*Zdroj: FLP přednášky 2025/26 (legacy materiál, Kolář). Externí reference: Bratko, I.: *Prolog Programming for Artificial Intelligence* (4th ed., Pearson 2011); Sterling, L., Shapiro, E.: *The Art of Prolog* (2nd ed., MIT Press 1994); SWI-Prolog manual — [swi-prolog.org/pldoc/](https://www.swi-prolog.org/pldoc/); CLP(FD) tutorial — [swi-prolog.org/man/clpfd.html](https://www.swi-prolog.org/man/clpfd.html).*
