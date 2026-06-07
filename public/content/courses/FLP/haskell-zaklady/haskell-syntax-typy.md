---
title: Haskell — syntaxe a typový systém
---

# Haskell — syntaxe a typový systém

**Haskell** je čistě funkcionální (pure functional) programovací jazyk vyvíjený od roku 1990. Je pojmenován po matematikovi Haskellu Currym. Mezi jeho charakteristické vlastnosti patří: silné statické typování (strong static typing), odvozování typů (type inference), líné vyhodnocování (lazy evaluation) ([[lazy-evaluation]]), neměnnost (immutability), funkce vyššího řádu (higher-order functions) a typové třídy (type classes) ([[type-classes]]). Referenční implementací je **GHC** (Glasgow Haskell Compiler).

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

Aplikace funkce je **levě asociativní** (left-associative) — vyhodnocuje se zleva:

```haskell
f a b c = ((f a) b) c
```

### Lokální vazby (local bindings)

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

Haskell má **silné statické typování** (strong static typing) spolu s **odvozováním typů** (type inference). Typový systém vychází z modelu *Hindley-Milner* doplněného o různá rozšíření.

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

### Typové proměnné (type variables)

```haskell
id :: a -> a
id x = x

-- 'a' is polymorphic — works for any type
result1 = id 5      -- Int -> Int
result2 = id "hi"   -- String -> String
result3 = id True   -- Bool -> Bool
```

### Odvozování typů (type inference)

Překladač (compiler) typ *odvodí* sám — programátor jej nemusí psát explicitně:

```haskell
-- Explicit type
sum :: Int -> Int -> Int
sum x y = x + y

-- Same, inferred
sum x y = x + y  -- compiler figures out :: Num a => a -> a -> a
```

Algoritmus odvozování typů: **Hindley-Milner** (1969, 1978) — je *úplný* (complete), *polymorfní* a poskytuje *principální typy* (principal types), tedy nejobecnější možný typ každého výrazu.

::: viz hindley-milner "Algoritmus W krok po kroku: zavedení typových proměnných, unifikace, substituce σ, finální generalizace."
:::

### Omezení typů (constraints)

```haskell
-- Show typeclass constraint
showIt :: Show a => a -> String
showIt x = show x

-- Multiple constraints
fn :: (Show a, Num a) => a -> String
fn x = show (x + 1)
```

Omezení (constraints) navazují na **typové třídy** (type classes) ([[type-classes]]).

### Složené typy (compound types)

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

### Typy funkcí (function types)

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

## Curryfikované funkce (curried functions)

Klíčovým principem Haskellu je, že *všechny* funkce jsou *unární* — přijímají právě jeden argument.

```haskell
-- Tyto jsou ekvivalentní:
add :: Int -> Int -> Int
add x y = x + y

add :: Int -> (Int -> Int)
add x = \y -> x + y
```

Důsledkem je, že **částečná aplikace** (partial application) je *triviální* — funkci stačí předat jen část argumentů a získáme novou funkci:

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

Standardní knihovna: `Prelude` (importuje se automaticky), `base` (základ), `containers`, `text`, `bytestring`, …

## Interaktivní vývoj — GHCi

GHCi (Glasgow Haskell Interpreter) je interaktivní interpret:

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

Klíčové příkazy:
* `:type expr` — zobrazí odvozený typ.
* `:info name` — zobrazí definici a instance tříd.
* `:load file.hs` — načte zdrojový soubor.
* `:reload` — znovu načte.
* `:quit` — ukončí GHCi.

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

Nástroje pro sestavení (build tools):

* **Cabal** — standardní správce balíčků pro Haskell.
* **Stack** — alternativa zaměřená na reprodukovatelné sestavení.

```bash
$ cabal init        # new project
$ cabal build       # compile
$ cabal run         # run
$ cabal test        # test
$ cabal install hlint  # install package
```

## Klíčové rozdíly oproti imperativním jazykům

| Aspekt | Imperativní (C, Python) | Haskell |
| :--- | :--- | :--- |
| Proměnné | měnitelné | **neměnné** |
| Cykly | `for`, `while` | **rekurze** |
| Efekty | přímé (printf) | **monády** ([[monady-io]]) |
| Typy | dynamické / za běhu | **statické, odvozené** |
| Vyhodnocování | striktní | **líné** ([[lazy-evaluation]]) |
| Vedlejší efekty | všude | **izolované** (IO monáda) |

## Filosofie

> "Lazy evaluation + immutability = mathematics applies."

Haskell je *blízko* matematice:

* Funkce jsou *matematickými funkcemi*.
* Žádné vedlejší efekty → funguje rovnicové uvažování (equational reasoning).
* Z `f x = g x` plyne, že `f x` můžeme nahradit za `g x` *kdekoli*.

## Učební křivka

* **Snadné:** základní syntaxe, odvozování typů.
* **Středně těžké:** algebraické datové typy (ADT), porovnávání vzorů (pattern matching), rekurze.
* **Těžké:** monády, typové třídy, pokročilé typy.
* **Velmi náročné:** typové rodiny (type families), GADT, závislé typy (dependent types).

> "Haskell is the language that's easy to learn but hard to master."

---

### Videa

::: youtube "https://www.youtube.com/watch?v=ELvZpu3NDF8" "SZZ: Haskell - typy v jazyce a líné vyhodnocování" "Tomáš Kocourek"
:::

::: youtube "https://www.youtube.com/watch?v=fCOSrHTsslU" "FLP: Příprava k půlsemestrální zkoušce" "Tomáš Kocourek"
:::

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: O'Sullivan, B., Goerzen, J., Stewart, D.: *Real World Haskell* (O'Reilly 2008) — [book.realworldhaskell.org](http://book.realworldhaskell.org/); Hutton, G.: *Programming in Haskell* (2nd ed., Cambridge 2016); Lipovača, M.: *Learn You a Haskell for Great Good!* — [learnyouahaskell.com](http://learnyouahaskell.com/); GHC documentation — [haskell.org/ghc](https://www.haskell.org/ghc/).*
