---
title: Typové třídy (type classes)
---

# Typové třídy (type classes)

**Type classes** jsou Haskellův mechanismus pro **ad-hoc polymorphism** — definice operací, které pracují pro *více typů*, ale s *různými* implementacemi. Analogické *interfaces* v Javě nebo *traits* v Rustu, ale mocnější a flexibilnější. Inspirovaly Rust traits, Scala implicits, Swift protocols.

## Princip

```haskell
class Eq a where
    (==) :: a -> a -> Bool
    (/=) :: a -> a -> Bool

    -- Default implementation
    x /= y = not (x == y)
```

**Definuje** type class `Eq` s metodami `==`, `/=`.

### Instance

```haskell
instance Eq Int where
    x == y = primIntEq x y

instance Eq Bool where
    True  == True  = True
    False == False = True
    _     == _     = False

-- Generic
instance Eq a => Eq [a] where
    []     == []     = True
    (x:xs) == (y:ys) = x == y && xs == ys
    _      == _      = False
```

### Použití

```haskell
-- Constraint syntax
nodup :: Eq a => [a] -> [a]
nodup []     = []
nodup (x:xs) = x : nodup (filter (/= x) xs)

-- Works for any type with Eq
nodup [1,2,3,1,2]      -- [1,2,3]
nodup ["a","b","a"]    -- ["a","b"]
```

## Standardní type classes

### Eq — rovnost

```haskell
class Eq a where
    (==) :: a -> a -> Bool
    (/=) :: a -> a -> Bool
```

### Ord — uspořádání

```haskell
class Eq a => Ord a where
    compare :: a -> a -> Ordering
    (<), (<=), (>), (>=) :: a -> a -> Bool
    max, min :: a -> a -> a

data Ordering = LT | EQ | GT
```

### Show — to string

```haskell
class Show a where
    show :: a -> String
```

### Read — from string

```haskell
class Read a where
    read :: String -> a
```

### Num — numerical

```haskell
class Num a where
    (+), (-), (*) :: a -> a -> a
    negate :: a -> a
    abs :: a -> a
    signum :: a -> a
    fromInteger :: Integer -> a
```

### Enum — enumerable

```haskell
class Enum a where
    succ, pred :: a -> a
    toEnum :: Int -> a
    fromEnum :: a -> Int
```

### Bounded — bounded

```haskell
class Bounded a where
    minBound, maxBound :: a
```

### Functor — mappable

Definice viz [Functor a Monad — preview](#functor-a-monad--preview) níže.

### Monad — monadic

```haskell
class Monad m where
    return :: a -> m a
    (>>=) :: m a -> (a -> m b) -> m b
```

Detailně [[monady-io]].

## Deriving

Mnoho typeclass lze *automaticky* odvodit:

```haskell
data Color = Red | Green | Blue
    deriving (Show, Eq, Ord, Enum, Bounded, Read)

-- Automatically:
-- Red == Red       :: True
-- show Red         :: "Red"
-- compare Red Blue :: LT
-- succ Red         :: Green
-- maxBound :: Color :: Blue
```

### Newer: GeneralizedNewtypeDeriving, DeriveFunctor, DeriveTraversable

```haskell
{-# LANGUAGE GeneralizedNewtypeDeriving #-}
{-# LANGUAGE DeriveFunctor #-}

newtype Age = Age Int deriving (Show, Eq, Ord, Num)
-- Age inherits Num operations from Int

data MyList a = MyNil | MyCons a (MyList a)
    deriving Functor
```

## Constraints

### Single constraint

```haskell
showAndAdd :: (Show a, Num a) => a -> String
showAndAdd x = show (x + 1)
```

### Constraint propagation

```haskell
elem :: Eq a => a -> [a] -> Bool
elem _ []     = False
elem x (y:ys) = x == y || elem x ys

uniqueElems :: Eq a => [a] -> Int
uniqueElems = length . removeDuplicates  -- propagates Eq
```

### Numeric hierarchy

```
Num <- (Real, Fractional)
Real <- Integral, RealFrac
Integral <- (Int, Integer)
Fractional <- (Float, Double)
```

## Type class hierarchy

```haskell
class Eq a where ...

class Eq a => Ord a where ...
-- Ord requires Eq superclass

class Show a where ...

class (Show a, Eq a) => Printable a where ...
-- Printable requires both Show and Eq
```

## Polymorphism types

### Parametric polymorphism

```haskell
id :: a -> a
id x = x
```

Works for *any* type `a` *uniformly* — *identity* function doesn't care about type.

### Ad-hoc polymorphism (via type classes)

```haskell
class Num a where
    (+) :: a -> a -> a
```

`(+)` is *different* for `Int`, `Double`, complex numbers, etc.

### Subtype polymorphism (OOP)

Haskell *doesn't have* — relies on type classes instead.

## Type class — class implementation

GHC implementuje type classes via **dictionary passing**:

```haskell
elem :: Eq a => a -> [a] -> Bool
elem x ys = ...

-- Compiled to:
elem :: Dict_Eq_a -> a -> [a] -> Bool
elem dict x ys = ...
```

Dictionary obsahuje pointers na functions implementations.

Performance: small overhead but **compile-time** dispatch when type is known (specialization).

::: viz type-class-dispatch "Eq a => ... dictionary-passing po desugaringu; klikněte typ a vidíte, který slovník se použije."
:::

## Functor a Monad — preview

### Functor

```haskell
class Functor f where
    fmap :: (a -> b) -> f a -> f b

instance Functor Maybe where
    fmap _ Nothing  = Nothing
    fmap f (Just x) = Just (f x)

instance Functor [] where
    fmap = map  -- standard map function

instance Functor IO where
    -- IO is a functor too!
```

### Functor laws

```haskell
fmap id      = id              -- identity
fmap (f . g) = fmap f . fmap g -- composition
```

Each instance *must* satisfy these (not enforced by compiler, but expected).

::: viz functor-applicative-monad "Hierarchie Functor ⊂ Applicative ⊂ Monad; přepněte typ (Maybe/List/Either/IO) a vidíte všechny tři operace."
:::

## Type class extensions

### Multi-parameter type classes (MPTC)

```haskell
{-# LANGUAGE MultiParamTypeClasses #-}

class Convertible a b where
    convert :: a -> b

instance Convertible Int String where
    convert = show

instance Convertible Int Double where
    convert = fromIntegral
```

### Functional dependencies

```haskell
{-# LANGUAGE FunctionalDependencies #-}

class Collection c e | c -> e where
    -- e is determined by c
    empty :: c
    insert :: e -> c -> c
```

### Type families

```haskell
{-# LANGUAGE TypeFamilies #-}

class Container c where
    type Element c
    empty :: c
    insert :: Element c -> c -> c
```

Used in `containers` library.

### Constraint kinds

```haskell
{-# LANGUAGE ConstraintKinds #-}

type Showable a = (Show a, Eq a)
```

## Type class vs. Object-oriented

| Aspect | Type class | OOP class |
| :--- | :--- | :--- |
| Definition | separate from data | same as data |
| Dispatch | type of arg | object identity (vtable) |
| Method addition | new instance | modify class hierarchy |
| Multi-parameter | yes (MPTC) | no |
| Compile-time | yes | runtime (mostly) |
| Subtyping | no | yes |

> "Type classes provide ad-hoc polymorphism done right." — Wadler.

## Examples

### Functor instance for own type

```haskell
data Tree a = Leaf | Node (Tree a) a (Tree a)

instance Functor Tree where
    fmap _ Leaf = Leaf
    fmap f (Node l x r) = Node (fmap f l) (f x) (fmap f r)

-- Now we can map over trees
doubled = fmap (*2) myTree
```

### Custom Eq

```haskell
data Person = Person { name :: String, age :: Int }

-- Eq based only on name (ignore age)
instance Eq Person where
    p1 == p2 = name p1 == name p2
```

### Show instance

```haskell
data Vector = Vector Double Double

instance Show Vector where
    show (Vector x y) = "(" ++ show x ++ ", " ++ show y ++ ")"

-- show (Vector 1.5 2.7) = "(1.5, 2.7)"
```

## Common patterns

### Bounded enum cycle

```haskell
nextColor :: Color -> Color
nextColor c
  | c == maxBound = minBound
  | otherwise = succ c
```

### Generic algorithms

```haskell
quicksort :: Ord a => [a] -> [a]
quicksort [] = []
quicksort (x:xs) = quicksort smaller ++ [x] ++ quicksort larger
  where
    smaller = filter (< x) xs
    larger  = filter (>= x) xs
```

`quicksort` works for *any* `Ord` type: Int, Double, String, custom data.

### Convertible

```haskell
parse :: Read a => String -> a
parse = read

formatted :: Show a => a -> String
formatted = show
```

## Limity type classes

### Open world assumption

* Instances can be added by *anyone*.
* Cannot define "no instance" — *closed* set isn't directly expressible.
* Solution: phantom types, restricted classes.

### Orphan instances

* Instance defined in *different* module than data + class.
* Considered bad practice (can cause conflicts).
* Compiler warning.

### Diamond problem

* Multiple inheritance paths can cause ambiguity.
* Haskell prevents most issues via single-class-per-instance rule.

## Trends

* **Generic programming** (Generic, Data.Generics).
* **Type-level programming** (DataKinds, type families).
* **Dependent types** (Idris, Agda inspired).
* **Effects systems** (mtl, transformers, polysemy).

---

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Wadler, P., Blott, S.: *How to make ad-hoc polymorphism less ad hoc* (POPL 1989); Hudak, P., Hughes, J., Peyton Jones, S., Wadler, P.: *A History of Haskell: Being Lazy with Class* (HOPL III 2007); GHC documentation — Type Classes; Hutton, G.: *Programming in Haskell* (Cambridge 2016), kap. 8.*
