---
title: Church encoding — booleans, čísla, struktury
---

# Church encoding — booleans, čísla, struktury

V čistém λ-kalkulu máme **jen** funkce — žádná čísla, booleany, páry. **Church encoding** ukazuje, jak *reprezentovat* běžné datové typy *čistě* pomocí funkcí. Demonstruje, že λ-kalkul je *univerzální* — *nepotřebuje* primitivní typy.

## Booleans

::: math
\begin{aligned}
\text{TRUE}  &= \lambda x\ y.\ x \\
\text{FALSE} &= \lambda x\ y.\ y
\end{aligned}
:::

* **TRUE** vrátí *první* argument.
* **FALSE** vrátí *druhý* argument.

### Operace

```
IF c t e = c t e

(IF TRUE a b)  = (λx y. x) a b = a
(IF FALSE a b) = (λx y. y) a b = b

NOT = λp. p FALSE TRUE
AND = λp q. p q FALSE  -- if p then q else FALSE
OR  = λp q. p TRUE q   -- if p then TRUE else q
```

## Numerals (Church numbers)

::: math
n \equiv \lambda f\ x.\ f^n(x) = \lambda f\ x.\ \underbrace{f\ (f\ \ldots\ (f\ x))}_{n\text{-krát}}
:::

Konkrétně:

```
ZERO  = λ f x. x         -- f applied 0 times
ONE   = λ f x. f x       -- 1 time
TWO   = λ f x. f (f x)   -- 2 times
THREE = λ f x. f (f (f x))
...
```

### Operace

**Successor** ($+1$):

::: math
\text{SUCC} = \lambda n\ f\ x.\ f\ (n\ f\ x)
:::

```
SUCC TWO = (λ n f x. f (n f x)) TWO
        = λ f x. f (TWO f x)
        = λ f x. f ((λ f x. f (f x)) f x)
        = λ f x. f (f (f x))
        = THREE
```

**Sčítání** ($m + n$):

::: math
\text{ADD} = \lambda m\ n\ f\ x.\ m\ f\ (n\ f\ x)
:::

* $m$ aplikuje $f$ $m$-krát na $(n\ f\ x)$, což je už $f^n(x)$.
* Výsledek: $f^{m+n}(x)$.

**Násobení** ($m \cdot n$):

::: math
\text{MUL} = \lambda m\ n\ f.\ m\ (n\ f)
:::

* $n\ f = f^n$ (funkce).
* $m\ (n\ f) = m$ aplikací $f^n$ = $(f^n)^m = f^{m \cdot n}$.

**Mocnina** ($m^n$):

::: math
\text{POW} = \lambda m\ n.\ n\ m
:::

* $n\ m = m^n$ (m applied n times to itself).

**Test na nulu:**

::: math
\text{ISZERO} = \lambda n.\ n\ (\lambda x.\ \text{FALSE})\ \text{TRUE}
:::

::: viz church-numerals "Vyberte n a operaci (SUCC/ADD/MUL/POW/ISZERO); vizualizace n = λf x. f^n(x) + kroky redukce."
:::

* If $n = 0$: returns TRUE.
* Otherwise: applies $(\lambda x.\ FALSE)$ at least once → FALSE.

### Předchůdce (PRED)

Komplikovanější! Trick je z BZA prezentace:

```
PREFN = λ f p. (FST p ? p : (FALSE, f (SND p)))
PRED  = λ x g m. SND (x (PREFN g) (TRUE, m))
```

PRED uses pair (boolean, value) — first time skip, then apply g repeatedly.

**Subtraction** then: $m - n = n\ \text{PRED}\ m$ (apply PRED $n$ times).

## Pairs

```
PAIR = λ a b f. f a b
FST  = λ p. p (λ x y. x)   -- = p TRUE
SND  = λ p. p (λ x y. y)   -- = p FALSE
```

Příklad:

```
PAIR 3 5 = λ f. f 3 5
FST (PAIR 3 5) = (λ p. p (λ x y. x)) (λ f. f 3 5)
              = (λ f. f 3 5) (λ x y. x)
              = (λ x y. x) 3 5
              = 3
```

## Lists

Lists via *cons* + *nil*:

```
NIL  = λ x. TRUE                 -- empty list
CONS = λ h t. λ x. x h t          -- prepend h to t
HEAD = λ l. l (λ h t. h)
TAIL = λ l. l (λ h t. t)
ISNIL = ???                       -- complicated
```

Alternative: **fold encoding**:

```
NIL   = λ f x. x
CONS  = λ h t. λ f x. f h (t f x)
```

Each list is its own *fold* function. Modern Haskell uses this in `foldr`.

## Recursion — Y combinator

Pro rekurzi *vůbec* (factorial, length, map) je třeba Y kombinátor:

```
Y = λ f. (λ x. f (x x)) (λ x. f (x x))
```

Vlastnost: $Y\ g = g\ (Y\ g)$ — fixed point.

### Factorial

```
FACT_TEMPLATE = λ f n. ISZERO n ONE (MUL n (f (PRED n)))
FACT = Y FACT_TEMPLATE
```

Aplikace `FACT THREE`:
1. `Y FACT_TEMPLATE THREE` = `FACT_TEMPLATE FACT THREE`.
2. `ISZERO THREE ONE (MUL THREE (FACT TWO))`.
3. ISZERO THREE = FALSE → vyber `(MUL THREE (FACT TWO))`.
4. Rekurzivně: `FACT TWO` = `MUL TWO (FACT ONE)` = `MUL TWO (MUL ONE (FACT ZERO))`.
5. `FACT ZERO` = `ISZERO ZERO ONE (...)` = `ONE`.
6. Backsubstitution: `MUL ONE ONE = ONE`, `MUL TWO ONE = TWO`, `MUL THREE TWO = SIX`.

## Performance

Church encoding je *theoretical* — *velmi* pomalé v praxi:

* Číslo $n$ je *funkce* aplikující $f$ $n$-krát.
* $1\,000\,000$ jako Church numeral = 1 million applications.
* **OK pro malá čísla** v důkazech, nikoli pro real computation.

## Other encodings

* **Scott encoding** — encodes constructors directly.
* **Parigot encoding** — efficient recursive functions.
* **GHC Core** uses **Data Constructors** (ADTs) directly, not Church encoding.

## Význam

Pochopení Church encoding:

1. **Foundations** — vidíme, že vše lze vyjádřit funkcemi.
2. **Turing-completeness** — λ-kalkul je univerzální.
3. **Insight** — funkční jazyky jsou *velmi* expresivní.
4. **Practical** — některé techniky (CPS, defunctionalization) jsou inspirovány tímto.

## Modern functional programming

V Haskellu používáme:

```haskell
-- Vestavěné typy, NE Church encoding
data Bool = True | False
data Nat = Zero | Succ Nat
data List a = Nil | Cons a (List a)
data Pair a b = Pair a b
```

To je *Algebraic Data Types* (ADTs) — *odlišný* approach, ale dosahuje téhož.

Church encoding zůstává *konceptuálně* důležité — pomáhá pochopit *equivalenci* mezi types a functions.

## Spojení s typovou teorií

* **System F** umožňuje *type abstraction* + *type application* → *parametric polymorphism*.
* **Church encoding v typovaném λ-kalkulu:**
  * Booleans: $\forall A.\ A \to A \to A$.
  * Nat: $\forall A.\ (A \to A) \to A \to A$.
  * Pairs: $\forall A\ B.\ \forall C.\ (A \to B \to C) \to C$.
* Tato čísla mají *type* a *struct* odpovídající Church encoding.

## Praktické příklady v Haskellu {tier=example}

```haskell
-- Church booleans
type ChurchBool = forall a. a -> a -> a
true, false :: ChurchBool
true  x _ = x
false _ y = y

-- Church naturals
type ChurchNat = forall a. (a -> a) -> a -> a
zero, one, two :: ChurchNat
zero  _ x = x
one   f x = f x
two   f x = f (f x)

-- Successor
succ' :: ChurchNat -> ChurchNat
succ' n f x = f (n f x)

-- Convert to Int
toInt :: ChurchNat -> Int
toInt n = n (+1) 0
```

---

### Videa

::: youtube "https://www.youtube.com/watch?v=Eo6FVosifWk" "SZZ: Lambda kalkul - definice pravdivostních hodnot a přirozených čísel" "Tomáš Kocourek"
:::

::: youtube "https://www.youtube.com/watch?v=eis11j_iGMs" "Lambda Calculus - Computerphile" "Computerphile"
:::

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Church, A.: *The Calculi of Lambda Conversion* (Princeton 1941); Barendregt, H. P.: *Lambda Calculi with Types* (Handbook of Logic in CS, 1992); Pierce, B. C.: *Types and Programming Languages* (MIT Press 2002), kap. 5, 23.*
