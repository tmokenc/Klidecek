---
title: Líné vyhodnocování (lazy evaluation)
---

# Líné vyhodnocování (lazy evaluation)

**Líné vyhodnocování (lazy evaluation)** je jedna z definujících vlastností Haskellu. Místo *okamžitého* vyhodnocení argumentů (jako v jazycích C, Python či Java) se výrazy vyhodnocují *teprve tehdy, když jsou skutečně potřeba*. To umožňuje pracovat s *nekonečnými* datovými strukturami a psát *modulární* programy, ale zároveň komplikuje *uvažování o výkonu (performance)* — tedy odhad, kolik výpočtů program nakonec opravdu provede.

## Princip

Ve *striktních* (striktní vyhodnocování, eager) jazycích:

```python
def f(x):
    return x + 1

f(expensive_computation())  # expensive_computation() runs first
```

V *líném* jazyce (Haskell):

```haskell
f :: Int -> Int
f _ = 42

f (expensiveComputation)  -- expensiveComputation runs ONLY if x is needed
```

Konkrétně: `f` se na `x` *nepodívá* dříve, než jeho hodnotu skutečně potřebuje. Protože zde platí `f _ = 42` (tj. `f = const 42`), je výsledek `f (expensiveComputation) = 42` *bez* toho, aby se náročný výpočet vůbec spustil.

## Tři strategie vyhodnocování

### Call-by-value (eager, striktní)

```
(λ x. x) ((λy. y y) (λy. y y))   -- C, Python, Java
                                   -- → infinite loop
```

### Call-by-name (líné bez sdílení)

```
(λ x. x + x) (expensive)
→ expensive + expensive          -- expensive computed TWICE
```

### Call-by-need (líné se sdílením) ← Haskell

```
(λ x. x + x) (expensive)
→ x + x where x = expensive      -- expensive computed ONCE (memoized)
```

Haskell používá *call-by-need* — kombinaci líného vyhodnocování a sdílení (sharing). Sdílení znamená, že jednou vyhodnocený výraz se uloží a při dalším použití se už nepočítá znovu.

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

`naturals` je *nekonečný* seznam, ale `take 10` z něj použije *jen prvních 10 prvků*. Líné vyhodnocování zaručí, že se neprovede žádný zbytečný výpočet.

### Eratosthenovo síto (Sieve of Eratosthenes)

```haskell
primes :: [Int]
primes = sieve [2..]
  where sieve (p:xs) = p : sieve [x | x <- xs, x `mod` p /= 0]
```

Klasický algoritmus zapsaný *přirozeným* způsobem — pracuje s *nekonečným* seznamem prvočísel (primes). Spotřebuje se z něj jen tolik prvků, kolik právě potřebujeme.

::: viz sieve-lazy "Posuňte 'take N primes'; uvidíte, jak se víc čísel 'aktivuje' a která jsou škrtnuta kterým prvočíslem."
:::

### Fibonacciho posloupnost

```haskell
fibs :: [Int]
fibs = 0 : 1 : zipWith (+) fibs (tail fibs)

-- fibs = [0, 1, 1, 2, 3, 5, 8, 13, ...]
```

*Sebereferenční* (self-referential) definice! Líné vyhodnocování zajistí, že se `zipWith (+) fibs (tail fibs)` vyhodnocuje *postupně*, prvek po prvku.

::: viz lazy-thunk-graph "Graf thunků pro fibs; klikněte 'vyhodnoť další thunk' a sledujte sdílení (sharing) — každé fib_k se spočítá nejvýše jednou."
:::

### Podmíněný výpočet

```haskell
mySwitch :: Bool -> Int -> Int -> Int
mySwitch cond a b = if cond then a else b

result = mySwitch True 5 (errorMessage)  -- 5, errorMessage NEVER computed
```

Ve *striktním* jazyce by se `errorMessage` musel vyhodnotit *před* voláním `mySwitch`; v líném jazyce *nemusí*, protože se nikdy nepoužije.

## Klíčové výhody

### 1. Nekonečné datové struktury

* Proudy (streams).
* Líné seznamy (lazy lists).
* Nekonečné stromy.

### 2. Modularita

```haskell
-- Decoupled: producer + consumer
firstFew = take 10 (map expensive (filter pred input))
```

Producent `map expensive` *neproběhne* na celých datech — jen na *prvních 10 prvcích*. Ve *striktním* jazyce by se to muselo explicitně optimalizovat.

### 3. Rovnicové uvažování (equational reasoning)

```haskell
let x = expensive in x + x
-- = expensive + expensive  (call-by-name)
-- = expensive + expensive  (with sharing, same result, less work)
```

Záměna výrazu za jeho hodnotu (substituce) platí *bez ohledu* na pořadí vyhodnocování. To znamená, že o programu můžeme uvažovat jako o soustavě rovnic.

### 4. Specifické algoritmy

* **Memoizace (memoization)** probíhá automaticky.
* **Dynamické programování** lze vyjádřit přirozeně.
* **Grafové algoritmy** využívající sdílení.

## Klíčové nevýhody

### 1. Nepředvídatelný výkon

```haskell
foldl (+) 0 [1..10^7]  -- builds up THUNKS, then evaluates
                       -- Stack overflow potential!

foldl' (+) 0 [1..10^7]  -- strict left fold, no thunks
                        -- Fast and safe
```

Existují i **striktní** varianty: `foldl'`, `BangPatterns` (`!x`), `seq`, `deepseq`. Ty výpočet vynutí okamžitě, místo aby ho odkládaly.

### 2. Úniky paměti přes thunky

Dlouho žijící **thunky** (odložené, dosud nevyhodnocené výpočty) spotřebovávají paměť:

```haskell
-- Bad: each `+1` builds a thunk
loop n acc | n == 0 = acc
           | otherwise = loop (n-1) (acc + 1)

-- Good: force evaluation each step
loop n !acc | n == 0 = acc
            | otherwise = loop (n-1) (acc + 1)
```

K vynucení vyhodnocení použijte `seq`, `BangPatterns` nebo pragmu `Strict`.

### 3. Obtížnější ladění

* Výpisy zásobníku (stack traces) mohou klamat (líné vyhodnocování znamená netypické pořadí volání).
* Profilování vyžaduje speciální techniky.

## Vynucení vyhodnocení

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

### Striktní datové položky

```haskell
data Point = Point !Int !Int  -- both fields strict
```

## Kompromis líné vs. striktní

* **Standardně líné** — modularita, nekonečné struktury.
* **Striktní tam, kde je třeba** — výkon, předvídatelná spotřeba paměti.

GHC umí provádět **analýzu striktnosti (strictness analysis)**, která *automaticky* zpřísní vyhodnocování všude, kde je to bezpečné.

## Příklady — programátorské vzory {tier=example}

### Memoizace

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

### Proudy (streams)

```haskell
naturals = [0..]
evens = filter even naturals
firstHundred = take 100 evens
```

### Vyhledávání s ořezáváním

```haskell
findFirst :: (a -> Bool) -> [a] -> Maybe a
findFirst p = listToMaybe . filter p
-- Only evaluates list until first match
```

### Líné vstupy/výstupy (lazy IO) — s výhradami

```haskell
contents <- readFile "huge.txt"  -- lazy: not loaded yet
let lines' = lines contents       -- still lazy
let nonEmpty = filter (not . null) lines'
mapM_ putStrLn nonEmpty           -- forces consumption
```

**Pozor:** líné vstupy/výstupy mohou vést k problémům se zdroji (např. neuzavřené soubory). Moderní Haskell proto dává přednost *striktním* vstupům/výstupům prostřednictvím knihoven jako Conduit, Pipes nebo Streaming.

## Implementace — redukce grafu

Líné vyhodnocování je v Haskellu implementováno pomocí **redukce grafu (graph reduction)**:

* Výraz = *graf* (orientovaný acyklický graf, DAG).
* **Thunk** = dosud nevyhodnocený uzel.
* Redukce = postupná transformace grafu krok za krokem.
* **Sdílení (sharing)** = stejný výraz se vyhodnotí jen jednou a výsledek se *znovu použije*.

GHC k tomu používá **STG stroj** (Spineless Tagless G-machine), který efektivní líné vyhodnocování zajišťuje.

## Limity

### Striktní jazyky umějí líné vyhodnocování napodobit

V Pythonu: `lambda: x` pro thunky; `iter` a generátory pro proudy.

V Javě 8+: `Supplier<T>` pro thunky; `Stream` pro líné kolekce.

Ale: je to *volitelné* (opt-in), ne *výchozí*. Standardní línost Haskellu umožňuje přirozený styl psaní.

### Líné jazyky umějí napodobit striktnost

Haskell má `seq`, `BangPatterns` a striktní varianty běžných funkcí (`foldl'`, `foldr'`).

### Hybridní přístup

* **F#** je *striktní*, ale línost podporuje explicitně.
* **OCaml** je *striktní*, ale má líné moduly.
* **Scala** je *striktní* s konstrukcí `lazy val`.
* **Idris** je *striktní* s explicitní líností.

Současný trend: před výchozí líností se dává přednost *volitelné línosti (opt-in)*.

## Klíčové ponaučení

> Líné vyhodnocování umožňuje *deklarativní* programování — popisujeme *co* místo *jak*. Cena za to je, že někdy musíme *explicitně* vynutit striktnost kvůli výkonu.

V Haskellu *neplatí* zásada "předčasné optimalizace" — standardně se píše líně a optimalizuje se tam, kde to měření ukáže jako potřebné.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=ELvZpu3NDF8" "SZZ: Haskell - typy v jazyce a líné vyhodnocování" "Tomáš Kocourek"
:::

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Hudak, P., Hughes, J., Peyton Jones, S., Wadler, P.: *A History of Haskell: Being Lazy with Class* (HOPL III 2007); Marlow, S.: *Parallel and Concurrent Programming in Haskell* (O'Reilly 2013); Bird, R.: *Thinking Functionally with Haskell* (Cambridge 2014); Hughes, J.: *Why Functional Programming Matters* (Computer Journal 1989).*
