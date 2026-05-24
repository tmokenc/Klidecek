---
title: Haskell — syntax a typový systém
---

# Haskell — syntax a typový systém

**Haskell** je *pure functional* programming language vyvinutý od r. 1990. Pojmenován po Haskellu Currym. Charakteristické vlastnosti: *strong static typing*, *type inference*, *lazy evaluation* ([[lazy-evaluation]]), *immutability*, *higher-order functions*, *type classes* ([[type-classes]]). Reference implementation: **GHC** (Glasgow Haskell Compiler).

## Základní syntaxe

### Definice funkce

```haskell
-- One-line function
double x = x * 2

-- Multi-line with pattern matching
factorial :: Int -> Int
factorial 0 = 1
factorial n = n * factorial (n - 1)

-- With guards
classify :: Int -> String
classify n
  | n < 0     = "negative"
  | n == 0    = "zero"
  | otherwise = "positive"
```

### Aplikace funkce

```haskell
result = double 5      -- 10
result = factorial 5   -- 120
result = max 3 7       -- 7
```

Aplikace je **left-associative**:

```haskell
f a b c = ((f a) b) c
```

### Local bindings

```haskell
-- let-in
area r = let pi_val = 3.14159
             radSquared = r * r
         in pi_val * radSquared

-- where
area r = pi_val * radSquared
  where
    pi_val = 3.14159
    radSquared = r * r
```

### Lambda výrazy

```haskell
double = \x -> x * 2
add = \x y -> x + y
applyTwice f x = f (f x)
result = applyTwice (\x -> x + 1) 5  -- 7
```

### Operátory

```haskell
-- Standard
+ - * / div mod ^ **
== /= < > <= >=
&& || not

-- Funkce jako operátor
result = 1 `add` 2  -- backtick syntax

-- Operátor jako funkce
result = (+) 1 2  -- 3
double = (*2)  -- partial application
half = (/2)
```

## Typový systém

Haskell má **strong static typing** s **type inference**. Typový systém je *Hindley-Milner* + rozšíření.

### Základní typy

```haskell
-- Primitives
x :: Int        -- 64-bit integer
y :: Integer    -- arbitrary precision
z :: Double     -- floating point
b :: Bool       -- True / False
c :: Char       -- 'a'
s :: String     -- ['a','b','c'] = "abc"

-- Functions
f :: Int -> Int               -- function
g :: Int -> Int -> Int        -- 2-arg curried function
h :: (Int -> Int) -> Int      -- higher-order
```

### Type variables

```haskell
id :: a -> a
id x = x

-- 'a' is polymorphic — works for any type
result1 = id 5      -- Int -> Int
result2 = id "hi"   -- String -> String
result3 = id True   -- Bool -> Bool
```

### Type inference

Kompilátor *odvodí* typ:

```haskell
-- Explicit type
sum :: Int -> Int -> Int
sum x y = x + y

-- Same, inferred
sum x y = x + y  -- compiler figures out :: Num a => a -> a -> a
```

Inference algorithm: **Hindley-Milner** (1969, 1978) — *complete*, *polymorphic*, *principal types*.

::: viz hindley-milner "Algoritmus W krok po kroku: introduction typových proměnných, unifikace, substituce σ, finální generalizace."
:::

### Constraints

```haskell
-- Show typeclass constraint
showIt :: Show a => a -> String
showIt x = show x

-- Multiple constraints
fn :: (Show a, Num a) => a -> String
fn x = show (x + 1)
```

Constraints navazují na **type classes** ([[type-classes]]).

### Compound types

```haskell
-- Tuples
pair :: (Int, String)
pair = (5, "hello")

-- Lists
nums :: [Int]
nums = [1, 2, 3, 4, 5]

-- Maybe
mb :: Maybe Int
mb = Just 5
mb' :: Maybe Int
mb' = Nothing

-- Either
err :: Either String Int
err = Left "error"
ok :: Either String Int
ok = Right 42
```

### Function types

```haskell
-- Currying — všechny funkce jsou unární!
add :: Int -> Int -> Int  -- = Int -> (Int -> Int)
add x y = x + y

-- Partial application
add5 :: Int -> Int
add5 = add 5

-- Lambdas
square :: Int -> Int
square = \x -> x * x
```

## Curried functions

Klíčový princip Haskellu: *všechny* funkce jsou *unární* (1 argument).

```haskell
-- Tyto jsou ekvivalentní:
add :: Int -> Int -> Int
add x y = x + y

add :: Int -> (Int -> Int)
add x = \y -> x + y
```

Důsledek: **partial application** je *triviální*:

```haskell
add5 :: Int -> Int
add5 = add 5  -- partial application of add with x=5

result = add5 3  -- 8
```

## Komentáře

```haskell
-- Single-line comment

{- 
   Multi-line comment
   spans multiple lines 
-}

{-# LANGUAGE FlexibleInstances #-}
-- Pragma — compiler directive
```

## Moduly

```haskell
-- Module declaration
module MyModule (publicFunc, MyType(..)) where

import Data.List (sort, nub)
import qualified Data.Map as Map
import qualified Data.Set as Set hiding (insert)

-- Definitions
publicFunc :: Int -> Int
publicFunc x = x + 1

privateFunc :: Int -> Int  -- not exported
privateFunc x = x * 2
```

Standard library: `Prelude` (auto-imported), `base` (basic), `containers`, `text`, `bytestring`, ...

## Interaktivní vývoj — GHCi

GHCi (Glasgow Haskell Interpreter):

```bash
$ ghci
Prelude> 1 + 1
2
Prelude> :type 5
5 :: Num a => a
Prelude> :type "hello"
"hello" :: String
Prelude> :load Main.hs
[1 of 1] Compiling Main             ( Main.hs, interpreted )
Ok, modules loaded: Main.
*Main> main
```

Key commands:
* `:type expr` — show inferred type.
* `:info name` — show definition + class instances.
* `:load file.hs` — load source file.
* `:reload` — reload.
* `:quit` — exit.

## Příklad — kompletní program

```haskell
module Main where

import Data.List (sort)

-- Type alias
type Name = String

-- Algebraic data type
data Person = Person { name :: Name, age :: Int } deriving (Show)

-- Function
makePerson :: String -> Int -> Person
makePerson n a = Person { name = n, age = a }

-- Sort persons by age
sortByAge :: [Person] -> [Person]
sortByAge ps = sort ps  -- needs Ord instance

-- Main
main :: IO ()
main = do
    let people = [Person "Alice" 30, Person "Bob" 25, Person "Charlie" 35]
    mapM_ print (sortByAge people)
```

## Cabal a Stack

Build tools:

* **Cabal** — Haskell standard package manager.
* **Stack** — alternative, focuses on reproducible builds.

```bash
$ cabal init        # new project
$ cabal build       # compile
$ cabal run         # run
$ cabal test        # test
$ cabal install hlint  # install package
```

## Klíčové rozdíly oproti imperativním jazykům

| Aspekt | Imperative (C, Python) | Haskell |
| :--- | :--- | :--- |
| Variables | mutable | **immutable** |
| Loops | `for`, `while` | **rekurze** |
| Effects | direct (printf) | **monády** ([[monady-io]]) |
| Types | dynamic/runtime | **static, inferred** |
| Evaluation | eager | **lazy** ([[lazy-evaluation]]) |
| Side effects | everywhere | **isolated** (IO monad) |

## Filosofie

> "Lazy evaluation + immutability = mathematics applies."

Haskell je *blízko* matematice:

* Functions jsou *math funkce*.
* No side effects → equational reasoning works.
* `f x = g x` → můžeme nahradit `f x` za `g x` *kdekoli*.

## Učební křivka

* **Easy:** basic syntax, type inference.
* **Medium:** ADTs, pattern matching, recursion.
* **Hard:** monads, type classes, advanced types.
* **Hard core:** type families, GADTs, dependent types.

> "Haskell is the language that's easy to learn but hard to master."

---

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: O'Sullivan, B., Goerzen, J., Stewart, D.: *Real World Haskell* (O'Reilly 2008) — [book.realworldhaskell.org](http://book.realworldhaskell.org/); Hutton, G.: *Programming in Haskell* (2nd ed., Cambridge 2016); Lipovača, M.: *Learn You a Haskell for Great Good!* — [learnyouahaskell.com](http://learnyouahaskell.com/); GHC documentation — [haskell.org/ghc](https://www.haskell.org/ghc/).*
