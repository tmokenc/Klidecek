---
title: Líné vyhodnocení (lazy evaluation)
---

# Líné vyhodnocení (lazy evaluation)

**Lazy evaluation** je jedna z definujících vlastností Haskellu. Místo *okamžitého* vyhodnocení argumentů (jako v C, Python, Java) jsou výrazy vyhodnoceny *až když je třeba*. Umožňuje *nekonečné* datové struktury, *modulární* programování, ale komplikuje *performance reasoning*.

## Princip

V *strict* (eager) jazycích:

```python
def f(x):
    return x + 1

f(expensive_computation())  # expensive_computation() runs first
```

V *lazy* jazyce (Haskell):

```haskell
f :: Int -> Int
f _ = 42

f (expensiveComputation)  -- expensiveComputation runs ONLY if x is needed
```

Konkrétně: `f` se *nepodívá* na `x` až dokud nepotřebuje jeho hodnotu. Protože zde `f _ = 42` (tj. `f = const 42`), platí `f (expensiveComputation) = 42` *bez* spuštění computation.

## Tři strategie evaluace

### Call-by-value (eager, strict)

```
(λ x. x) ((λy. y y) (λy. y y))   -- C, Python, Java
                                   -- → infinite loop
```

### Call-by-name (lazy bez sharing)

```
(λ x. x + x) (expensive)
→ expensive + expensive          -- expensive computed TWICE
```

### Call-by-need (lazy with sharing) ← Haskell

```
(λ x. x + x) (expensive)
→ x + x where x = expensive      -- expensive computed ONCE (memoized)
```

Haskell používá *call-by-need* — kombinace laziness + sharing.

## Příklady

### Nekonečné seznamy

```haskell
naturals :: [Int]
naturals = [1..]   -- 1, 2, 3, 4, ...

primes :: [Int]
primes = sieve [2..]
  where sieve (p:xs) = p : sieve [x | x <- xs, x `mod` p /= 0]

-- Take first 10 primes
firstTenPrimes = take 10 primes
-- [2,3,5,7,11,13,17,19,23,29]
```

`naturals` je *nekonečný* seznam, ale `take 10` ho použije *jen po 10*. Lazy evaluation zaručí, že žádná zbytečná computation.

### Sieve of Eratosthenes

```haskell
primes :: [Int]
primes = sieve [2..]
  where sieve (p:xs) = p : sieve [x | x <- xs, x `mod` p /= 0]
```

Klasický algoritmus napsaný *natural* způsobem — *nekonečný* seznam primes. Užívá se jen tolik prvků, kolik potřebujeme.

::: viz sieve-lazy "Posuňte 'take N primes'; uvidíte, jak víc čísel se 'aktivuje' a které jsou škrtnuty kterým prime."
:::

### Fibonacci

```haskell
fibs :: [Int]
fibs = 0 : 1 : zipWith (+) fibs (tail fibs)

-- fibs = [0, 1, 1, 2, 3, 5, 8, 13, ...]
```

*Self-referential* definice! Lazy evaluation zajistí, že `zipWith (+) fibs (tail fibs)` se ohodnotí *postupně*.

::: viz lazy-thunk-graph "Graf thunků pro fibs; klikněte 'vyhodnoť další thunk' a sledujte sharing — každý fib_k spočítán nejvýše jednou."
:::

### Conditional computation

```haskell
mySwitch :: Bool -> Int -> Int -> Int
mySwitch cond a b = if cond then a else b

result = mySwitch True 5 (errorMessage)  -- 5, errorMessage NEVER computed
```

V *strict* jazyce by `errorMessage` musel proběhnout *před* `mySwitch`; v lazy *nemusí*.

## Klíčové výhody

### 1. Nekonečné datové struktury

* Streams.
* Lazy lists.
* Infinite trees.

### 2. Modulárnost

```haskell
-- Decoupled: producer + consumer
firstFew = take 10 (map expensive (filter pred input))
```

Producer `map expensive` *neproběhne* na celých datech — jen na *prvních 10*. V *strict* by se to muselo explicitně optimalizovat.

### 3. Equational reasoning

```haskell
let x = expensive in x + x
-- = expensive + expensive  (call-by-name)
-- = expensive + expensive  (with sharing, same result, less work)
```

Substitution-equivalence platí *bez ohledu* na evaluation order.

### 4. Specifické algoritmy

* **Memoization** is automatic.
* **Dynamic programming** can be expressed naturally.
* **Graph algorithms** with sharing.

## Klíčové nevýhody

### 1. Performance unpredictability

```haskell
foldl (+) 0 [1..10^7]  -- builds up THUNKS, then evaluates
                       -- Stack overflow potential!

foldl' (+) 0 [1..10^7]  -- strict left fold, no thunks
                        -- Fast and safe
```

**Strict** versions exist: `foldl'`, `BangPatterns` (`!x`), `seq`, `deepseq`.

### 2. Memory leaks via thunks

Long-lived **thunks** (suspended computations) eat memory:

```haskell
-- Bad: each `+1` builds a thunk
loop n acc | n == 0 = acc
           | otherwise = loop (n-1) (acc + 1)

-- Good: force evaluation each step
loop n !acc | n == 0 = acc
            | otherwise = loop (n-1) (acc + 1)
```

Use `seq`, `BangPatterns`, `Strict` pragma to force evaluation.

### 3. Debug obtížnější

* Stack traces deceptive (lazy evaluation = unusual call order).
* Profiling needs special techniques.

## Forcing evaluation

### seq

```haskell
seq :: a -> b -> b
-- seq a b: evaluate a, return b
```

```haskell
sum' :: Num a => [a] -> a
sum' xs = go 0 xs
  where
    go !acc []     = acc
    go !acc (x:xs) = let !acc' = acc + x in go acc' xs
```

### BangPatterns

```haskell
{-# LANGUAGE BangPatterns #-}

strictFunction :: Int -> Int -> Int
strictFunction !x y = x + y  -- x is forced
```

### deepseq

```haskell
import Control.DeepSeq (deepseq, ($!!))

-- Force entire data structure
force :: NFData a => a -> a
force x = x `deepseq` x
```

### Strict data fields

```haskell
data Point = Point !Int !Int  -- both fields strict
```

## Lazy vs. Strict tradeoff

* **Default lazy** — moduality, infinite structures.
* **Strict when needed** — performance, predictable memory.

GHC has **strictness analysis** that *automatically* makes things strict when safe.

## Examples — programming patterns

### Memoization

```haskell
fib :: Int -> Int
fib = (map fib' [0..] !!)
  where
    fib' 0 = 0
    fib' 1 = 1
    fib' n = fib (n-1) + fib (n-2)

-- Each fib(n) computed ONCE, stored in lazy list
-- Subsequent calls reuse the value
```

### Streams

```haskell
naturals = [0..]
evens = filter even naturals
firstHundred = take 100 evens
```

### Search with pruning

```haskell
findFirst :: (a -> Bool) -> [a] -> Maybe a
findFirst p = listToMaybe . filter p
-- Only evaluates list until first match
```

### Lazy IO (with caveats)

```haskell
contents <- readFile "huge.txt"  -- lazy: not loaded yet
let lines' = lines contents       -- still lazy
let nonEmpty = filter (not . null) lines'
mapM_ putStrLn nonEmpty           -- forces consumption
```

**Warning:** lazy IO can lead to resource issues. Modern Haskell prefers *strict* IO via Conduit, Pipes, or Streaming libraries.

## Implementation — graph reduction

Lazy evaluation v Haskellu implementováno via **graph reduction**:

* Expression = *graph* (DAG).
* **Thunk** = unevaluated node.
* Reduction = transform graph step by step.
* **Sharing** = same expression evaluated once, result *reused*.

GHC implements **STG machine** (Spineless Tagless G-machine) — efficient lazy evaluation.

## Limity

### Strict languages can simulate laziness

In Python: `lambda: x` for thunks; `iter`, generators for streams.

In Java 8+: `Supplier<T>` for thunks; `Stream` for lazy collections.

But: it's *opt-in*, not *default*. Haskell's default-lazy enables natural style.

### Lazy languages can simulate strictness

Haskell has `seq`, `BangPatterns`, strict variants of common functions (`foldl'`, `foldr'`).

### Hybrid

* **F#** is *strict* but supports lazy explicitly.
* **OCaml** is *strict* but has lazy modules.
* **Scala** is *strict* with `lazy val`.
* **Idris** is *strict* with explicit laziness.

Recent trend: *opt-in laziness* preferred over default-lazy.

## Klíčové ponaučení

> Lazy evaluation umožňuje *deklarativní* programování — *co* místo *jak*. Cena: někdy nutné *explicitně* vynutit strictness pro performance.

V Haskellu *není* "premature optimization" — defaultně psát líně, optimalizovat where measured.

---

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Hudak, P., Hughes, J., Peyton Jones, S., Wadler, P.: *A History of Haskell: Being Lazy with Class* (HOPL III 2007); Marlow, S.: *Parallel and Concurrent Programming in Haskell* (O'Reilly 2013); Bird, R.: *Thinking Functionally with Haskell* (Cambridge 2014); Hughes, J.: *Why Functional Programming Matters* (Computer Journal 1989).*
