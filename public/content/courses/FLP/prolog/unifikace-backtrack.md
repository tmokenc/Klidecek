---
title: Unifikace a backtracking (legacy)
---

# Unifikace a backtracking (legacy)

> **POZOR — LEGACY MATERIÁL:** Tato problematika *není zařazena* od **akademického roku 2026/27**. Prolog byl nahrazen jazykem **[[rust-ownership|Rust]]**.

**Unifikace** a **backtracking** jsou *dva* hlavní výpočetní mechanismy Prologu. Unifikace v sobě spojuje přiřazení (assignment), porovnávání vzorů (pattern matching) i ověření rovnosti (equality check). Backtracking automaticky *prohledává* prostor řešení. Společně tvoří výkonné jádro (engine) Prologu.

## Unifikace

**Unifikace** je proces, který zjišťuje, zda lze *dva termy učinit identickými* pomocí substituce proměnných.

### Pravidla

```prolog
% 1. Konstanta s konstantou: stejné jsou rovny
a = a.       % true
1 = 1.       % true
a = b.       % false

% 2. Proměnná s čímkoli: proměnná se nahradí
X = a.       % X = a
X = foo(b).  % X = foo(b)

% 3. Termy: rekurzivně rozložit
foo(X, b) = foo(a, Y).   % X = a, Y = b
foo(X, X) = foo(a, b).   % false (X can't be both a and b)
foo(X, Y) = bar(X, Y).   % false (different functors)
foo(X) = foo(X, Y).      % false (different arities)

% 4. Lists
[H|T] = [1,2,3].    % H = 1, T = [2,3]
[1,X,3] = [Y,2,Z].  % Y = 1, X = 2, Z = 3
```

### Algoritmus

```
unify(X, Y):
    if X == Y: return true
    if X is variable: substitute X = Y, return true
    if Y is variable: substitute Y = X, return true
    if X = f(X1,...,Xn) and Y = f(Y1,...,Yn):
        for i = 1..n:
            unify(Xi, Yi)
        return true
    return false  // different functors/arities
```

### Příklad — rekurzivní unifikace

```prolog
?- foo(X, bar(Y, Z)) = foo(a, bar(b, c)).
X = a, Y = b, Z = c.

?- [H|T] = [1, 2, 3].
H = 1, T = [2, 3].

?- f(g(X, Y), Y) = f(g(a, b), Z).
X = a, Y = b, Z = b.
```

### Kontrola výskytu (occurs check)

Klasický algoritmus *neprovádí* kontrolu výskytu (occurs check) — a to z výkonnostních důvodů. Kontrola výskytu by ověřovala, že se proměnná nevyskytuje uvnitř termu, kterým ji nahrazujeme:

```prolog
?- X = f(X).   % BAD — creates infinite term
```

Některé implementace nabízejí predikát `unify_with_occurs_check/2` pro bezpečnou unifikaci.

::: viz prolog-unify-tree "Krok-po-kroku unifikace dvou termů; vidíte substituci σ, occurs check, různé funktory."
:::

## Backtracking

Když pokus o splnění cíle selže, Prolog se *vrátí* k poslednímu rozhodovacímu bodu (choice point) a zkusí jinou variantu.

### Příklad

```prolog
parent(tom, bob).
parent(tom, liz).
parent(bob, ann).
parent(bob, pat).

?- parent(tom, X).
% First match: X = bob
X = bob ;
% After ';', backtrack to find another
X = liz ;
% No more matches
false.
```

### Mechanismus

```
Goal: parent(tom, X)

1. Try first clause: parent(tom, bob)
   X = bob → success
   
2. User asks for next (;): backtrack
   Try second clause: parent(tom, liz)
   X = liz → success
   
3. User asks for next: backtrack
   No more clauses → failure
```

::: viz prolog-sld-tree "SLD resolution strom s success/fail/redo větvemi; cut (!) viditelně odřízne alternativy."
:::

### Backtracking ve složeném cíli

```prolog
?- parent(tom, X), parent(X, Y).
% Find tom's child X, then X's child Y

% Try: X = bob
%   Try: parent(bob, Y) — Y = ann → success
X = bob, Y = ann ;

%   Backtrack: parent(bob, Y) — Y = pat → success
X = bob, Y = pat ;

% Backtrack: X = liz
%   parent(liz, Y) — no solution

false.
```

## Cut (!)

**Cut** je *speciální* operátor, který se *zaváže* (commit) k aktuálnímu rozhodnutí a *zakáže* další backtracking.

```prolog
member1(X, [X|_]).
member1(X, [_|T]) :- member1(X, T).

% Without cut: finds ALL matches
?- member1(2, [1,2,3,2,5]).
true ;
true ;
false.

% With cut: stops at first
member2(X, [X|_]) :- !.
member2(X, [_|T]) :- member2(X, T).

?- member2(2, [1,2,3,2,5]).
true.  % no second solution!
```

### Použití cut

```prolog
% if-then-else
max(X, Y, X) :- X >= Y, !.
max(_, Y, Y).

?- max(5, 3, M).
M = 5.

?- max(2, 7, M).
M = 7.
```

### Cut komplikuje sémantiku

Cut *porušuje* deklarativní význam programu — najednou začíná záležet na pořadí čtení klauzulí:

```prolog
% Reading order matters
foo(X, Y) :- p(X), !, q(Y).  % commit after p(X)
foo(X, Y) :- r(X, Y).         % only if p(X) fails

% Logical reading: foo iff (p∧q) or r
% But cut prevents trying second clause IF p succeeded
```

V moderním programování v Prologu je tento přístup považován za **špatný styl**.

## Smyčky řízené selháním (failure-driven loops)

Prolog *generuje* všechna řešení pomocí backtrackingu:

```prolog
% Print all parents
print_all_parents :-
    parent(X, Y),
    format("~w is parent of ~w~n", [X, Y]),
    fail.
print_all_parents.   % succeeds at end

?- print_all_parents.
tom is parent of bob
tom is parent of liz
bob is parent of ann
bob is parent of pat
true.
```

`fail` vynutí backtracking; poslední klauzule pak na závěr uspěje.

## findall, bagof, setof

Modernější přístup ke sbírání všech řešení do seznamu:

```prolog
% findall — all solutions, can be empty
?- findall(Y, parent(tom, Y), Children).
Children = [bob, liz].

% bagof — requires at least one solution
?- bagof(Y, parent(tom, Y), Children).
Children = [bob, liz].

% setof — sorted, unique, requires at least one
?- setof(Y, parent(tom, Y), Children).
Children = [bob, liz].
```

## Negace jako selhání (negation as failure)

```prolog
\+ Goal.   % "not provable that Goal"
```

```prolog
% "Tom is not bob's parent"?
?- \+ parent(tom, bob).
false.  % HE IS the parent

?- \+ parent(tom, ann).
true.   % cannot prove tom is ann's parent
```

**Důležité:** `\+ G` *není* totéž co „G je nepravdivé". Znamená to „G nelze dokázat ze současné báze znalostí (KB)".

### Předpoklad uzavřeného světa (closed-world assumption)

Prolog předpokládá, že:
* Vše, co *nelze dokázat*, je *nepravdivé*.
* To je přesný opak přístupu *otevřeného světa* (open-world), který používá například sémantický web (RDF).

```prolog
parent(tom, bob).

?- parent(tom, alice).
false.   % not in KB → assumed false
```

Ve skutečném světě přitom Tom Alicin rodič být klidně může — jen to není zaznamenáno v naší bázi znalostí.

## Na pořadí záleží

```prolog
% Define list element membership
member1(X, [X|_]).
member1(X, [_|T]) :- member1(X, T).

% Same logic, different order
member2(X, [_|T]) :- member2(X, T).
member2(X, [X|_]).

% Both work for: ?- member1(2, [1,2,3]).
% But member2 may have different backtracking behavior!
```

Klíčové je, že Prolog je *zároveň* deklarativní *i* procedurální — operační sémantika (operational semantics) má vliv na efektivitu výpočtu.

## Optimalizace koncového volání (tail call optimization)

```prolog
% Bad: builds large stack
length([], 0).
length([_|T], N) :- length(T, M), N is M + 1.

% Good: tail recursive
length(L, N) :- length(L, 0, N).
length([], N, N).
length([_|T], Acc, N) :-
    Acc1 is Acc + 1,
    length(T, Acc1, N).
```

Moderní implementace Prologu koncová volání optimalizují.

## Vedlejší efekty (side effects)

```prolog
% I/O
write(Term).      % print
read(Term).       % input
nl.               % newline
format(Format, Args).

% Assert/retract — modify KB
assertz(parent(joe, jane)).  % add at end
asserta(parent(joe, jane)).  % add at start
retract(parent(joe, jane)).  % remove
```

Vedlejší efekty porušují *referenční transparentnost* — Prolog tedy *není* čistě deklarativní (pure) jazyk.

## Výkonnostní úvahy

* **Indexování (indexing)** — predikáty se obvykle indexují podle prvního argumentu.
* **Pořadí klauzulí** — první klauzule se zkouší jako první; časté případy dávejte dopředu.
* **Cut** — omezuje backtracking (a tím přináší výkonnostní zisk).
* **Koncová rekurze (tail recursion)** — moderní překladače ji optimalizují.

## Ladění (debugging)

```prolog
?- trace.       % enable tracing
?- foo(X).      % see step-by-step execution

% Call ports:
% Call — entering predicate
% Exit — leaving with success
% Fail — leaving with failure
% Redo — backtracking
```

## Klíčové ponaučení

* **Unifikace** = porovnávání vzorů (pattern matching), přiřazení a ověření rovnosti dohromady.
* **Backtracking** = automatické prohledávání prostoru řešení.
* **Cut** = procedurální únikový ventil — používejte ho střídmě.
* **Na pořadí záleží** — i když je jazyk „deklarativní", operační pořadí ovlivňuje správnost i efektivitu.

## Cvičení

### Cvičení 1: Definujte `last/2`

```prolog
last([X], X).
last([_|T], X) :- last(T, X).

?- last([1,2,3], X).
X = 3.
```

### Cvičení 2: Definujte `reverse/2`

```prolog
reverse([], []).
reverse([H|T], R) :- reverse(T, RT), append(RT, [H], R).
```

### Cvičení 3: Definujte `length/2`

```prolog
length([], 0).
length([_|T], N) :- length(T, M), N is M + 1.
```

---

### Videa

::: youtube "https://www.youtube.com/watch?v=Pp6tEZLkASI" "SZZ: Prolog - Unifikace a vyhodnocování" "Tomáš Kocourek"
:::

*Zdroj: FLP přednášky 2025/26 (legacy materiál, Kolář). Externí reference: Bratko, I.: *Prolog Programming for Artificial Intelligence* (4th ed., Pearson 2011), kap. 3; Sterling, L., Shapiro, E.: *The Art of Prolog* (2nd ed., MIT Press 1994); Clocksin, W. F., Mellish, C. S.: *Programming in Prolog* (5th ed., Springer 2003); SWI-Prolog manual — [swi-prolog.org/pldoc/](https://www.swi-prolog.org/pldoc/).*
