---
title: Seznamy v Prologu (legacy)
---

# Seznamy v Prologu (legacy)

> **POZOR — LEGACY MATERIÁL:** Tato problematika *není zařazena* od **akademického roku 2026/27**. Prolog byl nahrazen jazykem **[[rust-ownership|Rust]]**.

**Seznamy (lists)** jsou základní datová struktura Prologu — *prakticky všechno* lze reprezentovat pomocí seznamů. Pochopení toho, jak se s nimi pracuje, je pro praktické programování v Prologu nezbytné.

## Reprezentace

```prolog
% Empty list
[]

% Non-empty
[1, 2, 3]
[a, b, c]
['hello', 'world']

% Heterogeneous
[1, 'a', foo(bar), [1,2]]

% Head | Tail
[H|T] = [1, 2, 3]     % H = 1, T = [2, 3]
[A, B|T] = [1, 2, 3]  % A = 1, B = 2, T = [3]
```

Vnitřně je `[1, 2, 3]` totéž co `.(1, .(2, .(3, [])))` — jde o reprezentaci pomocí buněk cons (cons-cell representation). To znamená, že každý prvek je dvojice „hlava a zbytek seznamu" a seznam je zakončen prázdným seznamem `[]`.

## Základní operace

### Členství v seznamu (member)

```prolog
% Define
member(X, [X|_]).
member(X, [_|T]) :- member(X, T).

% Usage
?- member(2, [1,2,3]).
true.

?- member(X, [a,b,c]).
X = a ; X = b ; X = c.

?- member(2, []).
false.
```

### Spojení seznamů (append)

```prolog
% Define
append([], L, L).
append([H|T1], L2, [H|T2]) :- append(T1, L2, T2).

% Concatenate
?- append([1,2], [3,4], X).
X = [1,2,3,4].

% Reversibility — works backwards too!
?- append(X, Y, [1,2,3]).
X = [], Y = [1,2,3] ;
X = [1], Y = [2,3] ;
X = [1,2], Y = [3] ;
X = [1,2,3], Y = [].

% Suffix check
?- append(_, [3], [1,2,3]).
true.
```

Predikát `append` je obousměrný (reversible): dokáže nejen seznamy spojovat, ale při dotazu s neznámými argumenty také rozkládá daný seznam na všechny možné dvojice předpony a přípony.

### Délka seznamu (length)

```prolog
length([], 0).
length([_|T], N) :- length(T, M), N is M + 1.

% Modern Prolog has length/2 built-in
?- length([a,b,c], N).
N = 3.

?- length(L, 3).
L = [_,_,_] ;   % creates list of 3 unknowns
```

### Obrácení seznamu (reverse)

```prolog
% Naive (slow, O(n²))
reverse([], []).
reverse([H|T], R) :-
    reverse(T, RT),
    append(RT, [H], R).

% Efficient with accumulator (O(n))
reverse(L, R) :- reverse(L, [], R).
reverse([], Acc, Acc).
reverse([H|T], Acc, R) :- reverse(T, [H|Acc], R).

?- reverse([1,2,3], X).
X = [3,2,1].
```

Naivní verze je pomalá, protože pro každý prvek volá `append` (celkem O(n²)). Efektivní verze používá akumulátor (accumulator), do něhož postupně přesouvá hlavu seznamu, a zvládne obrácení v lineárním čase O(n).

## Poslední prvek (last element)

```prolog
last([X], X).
last([_|T], X) :- last(T, X).

?- last([1,2,3], X).
X = 3.
```

## N-tý prvek (nth element)

```prolog
nth0(0, [H|_], H).
nth0(N, [_|T], X) :- N > 0, N1 is N - 1, nth0(N1, T, X).

?- nth0(1, [a,b,c], X).
X = b.

% Modern Prolog: built-in nth0/3, nth1/3
```

## Filtrování (filter)

```prolog
filter(_, [], []).
filter(P, [H|T], [H|R]) :- call(P, H), !, filter(P, T, R).
filter(P, [_|T], R) :- filter(P, T, R).

is_positive(X) :- X > 0.

?- filter(is_positive, [-1, 2, -3, 4, 5], R).
R = [2, 4, 5].
```

## Transformace prvků (map)

```prolog
map(_, [], []).
map(F, [H|T], [NH|NT]) :-
    call(F, H, NH),
    map(F, T, NT).

double(X, Y) :- Y is X * 2.

?- map(double, [1,2,3], R).
R = [2,4,6].

% Modern Prolog: maplist/2, maplist/3
```

## Skládání hodnot (fold)

```prolog
% Right fold
foldr(_, B, [], B).
foldr(F, B, [H|T], R) :-
    foldr(F, B, T, RT),
    call(F, H, RT, R).

add(X, Y, Z) :- Z is X + Y.

?- foldr(add, 0, [1,2,3,4,5], Sum).
Sum = 15.

% Left fold (tail-recursive)
foldl(_, A, [], A).
foldl(F, A, [H|T], R) :-
    call(F, A, H, NA),
    foldl(F, NA, T, R).
```

Operace fold postupně „složí" celý seznam do jediné hodnoty: na každý prvek zavolá danou funkci společně s dosavadním mezivýsledkem. Varianta `foldr` skládá zprava, `foldl` zleva a je díky koncové rekurzi (tail recursion) úspornější.

## Řazení (sort)

```prolog
% Quick sort
qsort([], []).
qsort([H|T], Sorted) :-
    partition(H, T, Less, Greater),
    qsort(Less, SL),
    qsort(Greater, SG),
    append(SL, [H|SG], Sorted).

partition(_, [], [], []).
partition(P, [X|T], [X|Less], Greater) :-
    X =< P, !,
    partition(P, T, Less, Greater).
partition(P, [X|T], Less, [X|Greater]) :-
    partition(P, T, Less, Greater).

?- qsort([3,1,4,1,5,9,2,6,5,3,5], R).
R = [1,1,2,3,3,4,5,5,5,6,9].

% Built-in: sort/2 (with deduplication)
?- sort([3,1,4,1,5], S).
S = [1,3,4,5].

% msort/2 — keep duplicates
?- msort([3,1,4,1,5], S).
S = [1,1,3,4,5].
```

## Obdoba list comprehension

```prolog
% Equivalent to Haskell: [X*X | X <- list, even X]
squares_of_evens(L, R) :-
    findall(Y, (member(X, L), 0 is X mod 2, Y is X * X), R).

?- squares_of_evens([1,2,3,4,5], R).
R = [4, 16].
```

## Pokročilé techniky

### Rozdílové seznamy (difference lists)

Umožňují efektivní spojování seznamů pomocí *otevřených* seznamů (open-ended lists) — tedy seznamů, jejichž konec je ponechán jako nesvázaná proměnná:

```prolog
% List as difference: List - Suffix
% [1,2,3 | T] - T  represents [1,2,3]

% Append in O(1)
append_dl(L1-T1, T1-T2, L1-T2).

% Usage
?- append_dl([1,2,3|T1]-T1, [4,5|T2]-T2, L-[]).
L = [1,2,3,4,5].
```

Tato technika se používá pro efektivní postupné budování seznamů.

### Seznamy seznamů (matice)

```prolog
% 3x3 matrix
matrix([[1,2,3], [4,5,6], [7,8,9]]).

% Get row
?- matrix(M), nth0(1, M, Row).
Row = [4,5,6].

% Transpose
transpose([], []).
transpose([[]|_], []).
transpose(M, [Row|Rest]) :-
    extract_column(M, Row, Rest1),
    transpose(Rest1, Rest).

extract_column([], [], []).
extract_column([[H|T]|Rs], [H|Heads], [T|Tails]) :-
    extract_column(Rs, Heads, Tails).
```

## Časté vzory práce se seznamy

### Kontrola seřazení (check sorted)

```prolog
sorted([]).
sorted([_]).
sorted([X,Y|T]) :- X =< Y, sorted([Y|T]).
```

### Odstranění duplicit (remove duplicates)

```prolog
no_dup([], []).
no_dup([H|T], R) :- member(H, T), !, no_dup(T, R).
no_dup([H|T], [H|R]) :- no_dup(T, R).
```

### Nalezení maxima (find maximum)

```prolog
max_list([X], X).
max_list([H|T], Max) :-
    max_list(T, MT),
    Max is max(H, MT).
```

### Vezmi / Zahoď (take / drop)

```prolog
take(0, _, []) :- !.
take(_, [], []) :- !.
take(N, [H|T], [H|R]) :- N > 0, N1 is N - 1, take(N1, T, R).

drop(0, L, L) :- !.
drop(_, [], []) :- !.
drop(N, [_|T], R) :- N > 0, N1 is N - 1, drop(N1, T, R).

?- take(3, [a,b,c,d,e], R).
R = [a,b,c].

?- drop(2, [a,b,c,d,e], R).
R = [c,d,e].
```

### Rozdělení (split)

```prolog
split(L, N, Front, Back) :-
    take(N, L, Front),
    drop(N, L, Back).

?- split([1,2,3,4,5], 2, F, B).
F = [1,2], B = [3,4,5].
```

## Co ovlivňuje výkon

* **Vzor s akumulátorem (accumulator pattern)** pro koncovou rekurzi.
* **Indexování (indexing)** — k výběru klauzule slouží první argument.
* **Rozdílové seznamy (difference lists)** pro efektivní spojování.
* **Vestavěné predikáty moderního Prologu** (length, append, sort) jsou optimalizované v jazyce C.

## Limity Prologu pro zpracování seznamů

Ve srovnání s Haskellem platí:

* **Žádné líné vyhodnocování (lazy evaluation)** — nelze přirozeně pracovat s nekonečnými seznamy.
* **Žádné vestavěné funkce vyššího řádu (higher-order functions)** — je nutné použít `call/N`.
* **Žádná typová bezpečnost** — běžně vznikají chyby až za běhu (runtime).
* **Porovnávání vzorů (pattern matching)** v hlavě klauzule není tak elegantní.
* **Vedlejší účinky (side effects)** se hůř promýšlejí.

Na druhou stranu:
* **Backtracking** je elegantní pro vyhledávací úlohy.
* **Obousměrnost (reversibility)** je občas užitečná.

## Klíčové ponaučení

* Seznamy jsou *univerzální* datová struktura.
* Vzor `[H|T]` je klíčový.
* Append, member, length a reverse tvoří základ.
* Koncová rekurze (tail recursion) s akumulátorem zajišťuje operace v čase O(n).
* findall, bagof a setof slouží ke sběru řešení do seznamu.

> I přes status legacy materiálu poskytuje zpracování seznamů v Prologu *intuici*, která je užitečná pro funkcionální programování obecně.

---

*Zdroj: FLP přednášky 2025/26 (legacy materiál, Kolář). Externí reference: Bratko, I.: *Prolog Programming for Artificial Intelligence* (4th ed., Pearson 2011), kap. 3; Sterling, L., Shapiro, E.: *The Art of Prolog* (2nd ed., MIT Press 1994); SWI-Prolog list library — [swi-prolog.org/pldoc/](https://www.swi-prolog.org/pldoc/).*
