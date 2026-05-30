---
title: Pattern matching a algebraické datové typy
---

# Pattern matching a algebraické datové typy

**Algebraic Data Types** (ADTs) jsou *fundamental* feature funkcionálních jazyků. Umožňují *konstruktivní* definice typů (sum + product types) a *dekonstruktivní* manipulaci via **pattern matching**. Spolu tvoří *signature* expressivity FP.

## Definice ADT

### Sum types (alternatives)

```haskell
-- Klasické sum types
data Bool = True | False
data Color = Red | Green | Blue

-- Maybe — value present or not
data Maybe a = Nothing | Just a

-- Either — left or right value
data Either a b = Left a | Right b
```

### Product types (records)

```haskell
-- Tuple-like (positional)
data Point = Point Double Double

-- Record syntax (named)
data Person = Person {
    name :: String,
    age :: Int,
    email :: String
}
```

### Recursive types

```haskell
-- Linked list
data List a = Nil | Cons a (List a)

-- Binary tree
data Tree a = Leaf | Node a (Tree a) (Tree a)

-- Expression tree (parser)
data Expr = Num Int
          | Add Expr Expr
          | Mul Expr Expr
          | If Expr Expr Expr
```

### Generic / polymorphic

```haskell
data Pair a b = Pair a b
data Triple a b c = Triple a b c
```

## Pattern matching

Klíčový dekonstrukce ADTs:

### Function definitions

```haskell
-- Single argument
not :: Bool -> Bool
not True  = False
not False = True

-- Multiple cases
fact :: Int -> Int
fact 0 = 1
fact n = n * fact (n-1)

-- Pattern destructuring
first :: (a, b) -> a
first (x, _) = x

-- Recursive
length :: [a] -> Int
length []     = 0
length (_:xs) = 1 + length xs

-- Multiple arguments
zipWith :: (a -> b -> c) -> [a] -> [b] -> [c]
zipWith _ []     _      = []
zipWith _ _      []     = []
zipWith f (a:as) (b:bs) = f a b : zipWith f as bs
```

### case expressions

```haskell
classify :: Int -> String
classify n = case n of
    0 -> "zero"
    1 -> "one"
    _ -> "many"

describe :: Maybe Int -> String
describe x = case x of
    Nothing -> "no value"
    Just n  -> "value is " ++ show n
```

### Guards

```haskell
absolute :: Int -> Int
absolute n
  | n >= 0    = n
  | otherwise = -n

bmiCheck :: Double -> String
bmiCheck bmi
  | bmi < 18.5 = "underweight"
  | bmi < 25.0 = "normal"
  | bmi < 30.0 = "overweight"
  | otherwise  = "obese"
```

## Pattern types

### Wildcards

```haskell
ignoreSecond :: (a, b) -> a
ignoreSecond (x, _) = x  -- _ matches anything, ignores
```

### As-patterns

```haskell
firstTwo :: [a] -> ([a], a)
firstTwo all@(x:_) = (all, x)
-- 'all' refers to whole list, 'x' to first element
```

### Nested patterns

```haskell
swap :: (a, (b, c)) -> ((c, b), a)
swap (x, (y, z)) = ((z, y), x)
```

### Constructor patterns

```haskell
case lst of
    []     -> "empty"
    [_]    -> "one element"
    [_, _] -> "two elements"
    _:_:_  -> "many"
```

### Numeric patterns

```haskell
isZero :: Int -> Bool
isZero 0 = True
isZero _ = False
```

### String patterns (specifically [Char])

```haskell
greet :: String -> String
greet "Alice" = "Hi Alice!"
greet "Bob"   = "Hi Bob!"
greet n       = "Hello " ++ n
```

## Exhaustiveness

GHC kontroluje, zda jsou *všechny* případy pokryty:

```haskell
{-# OPTIONS_GHC -Wall #-}

dangerous :: Bool -> String
dangerous True = "yes"
-- WARNING: Non-exhaustive patterns!
```

Compile-time warning prevents runtime errors.

::: viz adt-pattern-match "Vyberte ADT, zaškrtejte které konstruktory pokrýváte; checker hlásí non-exhaustive patterns."
:::

## Algebraic operations

**Sum types** = "OR" — value is *one of* the alternatives.
**Product types** = "AND" — value contains *all* fields.

Mathematical algebra applies:

```
| Bool | = | True | + | False | = 1 + 1 = 2
| (Bool, Bool) | = | Bool | × | Bool | = 4
| Maybe Bool | = 1 + | Bool | = 3
| Either Bool Color | = 2 + 3 = 5
```

This is why "algebraic" types — they obey laws of high school algebra!

## Deriving

GHC automatically derives common typeclass instances:

```haskell
data Point = Point Double Double
  deriving (Show, Eq, Ord, Read)

-- Now:
-- show :: Point -> String
-- (==) :: Point -> Point -> Bool
-- compare :: Point -> Point -> Ordering
-- read :: String -> Point
```

Available: `Show`, `Eq`, `Ord`, `Read`, `Enum`, `Bounded`, `Functor`, `Foldable`, `Traversable` (with `DeriveFunctor` extension), etc.

## Record syntax

```haskell
data Person = Person {
    name :: String,
    age :: Int,
    email :: String
} deriving (Show)

-- Automatic accessor functions:
-- name :: Person -> String
-- age :: Person -> Int

alice :: Person
alice = Person { name = "Alice", age = 30, email = "alice@example.com" }

-- Update syntax
alicePlusOne :: Person
alicePlusOne = alice { age = age alice + 1 }
```

## Examples

### Linked list

```haskell
data List a = Nil | Cons a (List a)

-- Length
listLength :: List a -> Int
listLength Nil          = 0
listLength (Cons _ rest) = 1 + listLength rest

-- Append
listAppend :: List a -> List a -> List a
listAppend Nil ys           = ys
listAppend (Cons x xs) ys   = Cons x (listAppend xs ys)

-- Map
listMap :: (a -> b) -> List a -> List b
listMap _ Nil          = Nil
listMap f (Cons x xs)  = Cons (f x) (listMap f xs)
```

### Binary tree

```haskell
data Tree a = Leaf | Node (Tree a) a (Tree a)

-- Insert (BST)
insert :: Ord a => a -> Tree a -> Tree a
insert x Leaf = Node Leaf x Leaf
insert x t@(Node left val right)
  | x < val   = Node (insert x left) val right
  | x > val   = Node left val (insert x right)
  | otherwise = t  -- already present

-- In-order traversal
inorder :: Tree a -> [a]
inorder Leaf = []
inorder (Node left val right) = inorder left ++ [val] ++ inorder right
```

### Expression evaluator

```haskell
data Expr = Num Int
          | Add Expr Expr
          | Mul Expr Expr
          | Neg Expr
          deriving Show

eval :: Expr -> Int
eval (Num n)   = n
eval (Add l r) = eval l + eval r
eval (Mul l r) = eval l * eval r
eval (Neg e)   = -(eval e)

-- example:
example = Add (Mul (Num 2) (Num 3)) (Num 4)  -- 2*3 + 4
result = eval example  -- 10
```

### JSON

```haskell
data JsonValue = JsonNull
               | JsonBool Bool
               | JsonNumber Double
               | JsonString String
               | JsonArray [JsonValue]
               | JsonObject [(String, JsonValue)]
               deriving (Show, Eq)
```

## GADT — Generalized Algebraic Data Types

Pokročilejší extension:

```haskell
{-# LANGUAGE GADTs #-}

data Expr a where
    NumE  :: Int -> Expr Int
    BoolE :: Bool -> Expr Bool
    Add   :: Expr Int -> Expr Int -> Expr Int
    If    :: Expr Bool -> Expr a -> Expr a -> Expr a

-- Type-safe evaluator
eval :: Expr a -> a
eval (NumE n)    = n
eval (BoolE b)   = b
eval (Add l r)   = eval l + eval r
eval (If c t e) = if eval c then eval t else eval e
```

GADTs allow types to be *refined* by constructors.

## Týden v praxi

Pattern matching + ADTs jsou *fundamental*:

* **Parsers** — define grammar via ADT, recursively descend.
* **Compilers** — AST as ADT, traversal via pattern matching.
* **State machines** — sum type for states, transitions via pattern.
* **Domain modeling** — represent business logic precisely.

> "Make impossible states impossible." — Yaron Minsky.

Pomocí ADT lze *type system* využít k vyloučení neplatných stavů — compile-time safety.

## Srovnání s OOP

| Aspect | OOP (Java/C++) | FP (Haskell) |
| :--- | :--- | :--- |
| Data definition | classes + inheritance | ADTs |
| Dispatch | virtual methods | pattern matching |
| Adding type | new subclass | new constructor (changes all matches) |
| Adding op | virtual method | new function (no class changes) |

**Expression problem:** OOP makes type extension easy, op extension hard; FP opposite.

Modern languages (Scala, Kotlin, Rust, Swift) provide *both* — ADTs (sealed classes) + classes.

---

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Pierce, B. C.: *Types and Programming Languages* (MIT Press 2002), kap. 11–12; Hutton, G.: *Programming in Haskell* (Cambridge 2016); Bird, R.: *Thinking Functionally with Haskell* (Cambridge 2014); GHC GADTs documentation — [hackage.haskell.org](https://hackage.haskell.org/).*
