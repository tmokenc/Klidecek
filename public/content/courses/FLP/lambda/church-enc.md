---
title: Churchovo kódování — pravdivostní hodnoty, čísla, struktury
---

# Churchovo kódování — pravdivostní hodnoty, čísla, struktury

V čistém λ-kalkulu máme **jen** funkce — žádná čísla, žádné pravdivostní hodnoty (booleany), žádné páry. **Churchovo kódování (Church encoding)** ukazuje, jak *reprezentovat* běžné datové typy *čistě* pomocí funkcí. Tím se dokazuje, že λ-kalkul je *univerzální* — *nepotřebuje* žádné primitivní typy.

## Pravdivostní hodnoty (booleans)

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

## Čísla (Churchova čísla, Church numerals)

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

**Následník (successor)** ($+1$):

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

* $n\ m = m^n$ ($m$ aplikováno $n$-krát na sebe sama).

**Test na nulu:**

::: math
\text{ISZERO} = \lambda n.\ n\ (\lambda x.\ \text{FALSE})\ \text{TRUE}
:::

::: viz church-numerals "Vyberte n a operaci (SUCC/ADD/MUL/POW/ISZERO); vizualizace n = λf x. f^n(x) + kroky redukce."
:::

* Pokud $n = 0$: vrátí TRUE.
* Jinak: aplikuje $(\lambda x.\ FALSE)$ alespoň jednou → FALSE.

### Předchůdce (PRED)

Tohle je složitější! Trik pochází z prezentace předmětu BZA:

```
PREFN = λ f p. (FST p ? p : (FALSE, f (SND p)))
PRED  = λ x g m. SND (x (PREFN g) (TRUE, m))
```

PRED používá pár (boolean, hodnota) — první krok přeskočí, pak opakovaně aplikuje g.

**Odčítání** pak: $m - n = n\ \text{PRED}\ m$ (aplikuj PRED $n$-krát).

## Páry (pairs)

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

## Seznamy (lists)

Seznamy pomocí *cons* + *nil*:

```
NIL  = λ x. TRUE                 -- empty list
CONS = λ h t. λ x. x h t          -- prepend h to t
HEAD = λ l. l (λ h t. h)
TAIL = λ l. l (λ h t. t)
ISNIL = ???                       -- complicated
```

Alternativa: **kódování pomocí foldu (fold encoding)**:

```
NIL   = λ f x. x
CONS  = λ h t. λ f x. f h (t f x)
```

Každý seznam je sám o sobě svou vlastní *fold* funkcí. Moderní Haskell tento princip využívá ve funkci `foldr`.

## Rekurze — kombinátor Y

Pro rekurzi *obecně* (faktoriál, délka seznamu, map) je potřeba kombinátor Y:

```
Y = λ f. (λ x. f (x x)) (λ x. f (x x))
```

Jeho vlastnost: $Y\ g = g\ (Y\ g)$ — jde o pevný bod (fixed point).

### Faktoriál

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
6. Zpětné dosazení: `MUL ONE ONE = ONE`, `MUL TWO ONE = TWO`, `MUL THREE TWO = SIX`.

## Výkon (performance)

Churchovo kódování je *teoretické* — v praxi *velmi* pomalé:

* Číslo $n$ je *funkce*, která aplikuje $f$ $n$-krát.
* $1\,000\,000$ jako Churchovo číslo = milion aplikací.
* **Vhodné pro malá čísla** v důkazech, nikoli pro reálné výpočty.

## Další způsoby kódování

* **Scottovo kódování (Scott encoding)** — kóduje přímo konstruktory.
* **Parigotovo kódování (Parigot encoding)** — efektivní rekurzivní funkce.
* **GHC Core** používá přímo **datové konstruktory** (algebraické datové typy, ADT), nikoli Churchovo kódování.

## Význam

Pochopení Churchova kódování přináší:

1. **Základy (foundations)** — vidíme, že vše lze vyjádřit funkcemi.
2. **Turingovskou úplnost (Turing-completeness)** — λ-kalkul je univerzální.
3. **Vhled (insight)** — funkcionální jazyky jsou *velmi* expresivní.
4. **Praktický přesah (practical)** — některé techniky (CPS, defunkcionalizace) jsou tímto inspirovány.

## Moderní funkcionální programování

V Haskellu používáme:

```haskell
-- Vestavěné typy, NE Church encoding
data Bool = True | False
data Nat = Zero | Succ Nat
data List a = Nil | Cons a (List a)
data Pair a b = Pair a b
```

Tomu se říká algebraické datové typy (Algebraic Data Types, ADT) — je to *odlišný* přístup, ale dosahuje téhož.

Churchovo kódování zůstává *konceptuálně* důležité — pomáhá pochopit *ekvivalenci* mezi typy (types) a funkcemi (functions).

## Spojení s typovou teorií

* **Systém F (System F)** umožňuje *typovou abstrakci* (type abstraction) + *typovou aplikaci* (type application) → *parametrický polymorfismus* (parametric polymorphism).
* **Churchovo kódování v typovaném λ-kalkulu:**
  * Booleany: $\forall A.\ A \to A \to A$.
  * Nat: $\forall A.\ (A \to A) \to A \to A$.
  * Páry: $\forall A\ B.\ \forall C.\ (A \to B \to C) \to C$.
* Tato čísla mají *typ* a *strukturu* odpovídající Churchovu kódování.

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
