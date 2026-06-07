---
title: Typové třídy (type classes)
---

# Typové třídy (type classes)

**Typové třídy (type classes)** jsou Haskellův mechanismus pro **ad-hoc polymorfismus (ad-hoc polymorphism)** — tedy způsob, jak definovat operace, které pracují pro *více typů*, ale s *různými* implementacemi. Zjednodušeně řečeno: pod jedním názvem (například `==`) se skrývá pro každý typ jiný kód. Jsou obdobou *rozhraní (interface)* v Javě nebo *traitů (trait)* v Rustu, ale jsou mocnější a flexibilnější. Samy inspirovaly traity v Rustu, implicits ve Scale i protokoly ve Swiftu.

## Princip

```haskell
class Eq a where
    (==) :: a -> a -> Bool
    (/=) :: a -> a -> Bool

    -- Default implementation
    x /= y = not (x == y)
```

Tento zápis **definuje** typovou třídu `Eq` s metodami `==` a `/=`.

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

## Standardní typové třídy

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

### Show — převod na řetězec

```haskell
class Show a where
    show :: a -> String
```

### Read — převod z řetězce

```haskell
class Read a where
    read :: String -> a
```

### Num — číselné typy

```haskell
class Num a where
    (+), (-), (*) :: a -> a -> a
    negate :: a -> a
    abs :: a -> a
    signum :: a -> a
    fromInteger :: Integer -> a
```

### Enum — vyjmenovatelné typy

```haskell
class Enum a where
    succ, pred :: a -> a
    toEnum :: Int -> a
    fromEnum :: a -> Int
```

### Bounded — typy s mezemi

```haskell
class Bounded a where
    minBound, maxBound :: a
```

### Functor — typy, nad kterými lze mapovat

Definici viz [Functor a Monad — náhled](#functor-a-monad--náhled) níže.

### Monad — monadické typy

```haskell
class Monad m where
    return :: a -> m a
    (>>=) :: m a -> (a -> m b) -> m b
```

Podrobně viz [[monady-io]].

## Odvozování instancí (deriving)

Mnoho typových tříd lze *automaticky* odvodit:

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

### Novější rozšíření: GeneralizedNewtypeDeriving, DeriveFunctor, DeriveTraversable

```haskell
{-# LANGUAGE GeneralizedNewtypeDeriving #-}
{-# LANGUAGE DeriveFunctor #-}

newtype Age = Age Int deriving (Show, Eq, Ord, Num)
-- Age inherits Num operations from Int

data MyList a = MyNil | MyCons a (MyList a)
    deriving Functor
```

## Omezení (constraints)

### Jednoduché omezení

```haskell
showAndAdd :: (Show a, Num a) => a -> String
showAndAdd x = show (x + 1)
```

### Šíření omezení

```haskell
elem :: Eq a => a -> [a] -> Bool
elem _ []     = False
elem x (y:ys) = x == y || elem x ys

uniqueElems :: Eq a => [a] -> Int
uniqueElems = length . removeDuplicates  -- propagates Eq
```

### Hierarchie číselných typů

```
Num <- (Real, Fractional)
Real <- Integral, RealFrac
Integral <- (Int, Integer)
Fractional <- (Float, Double)
```

## Hierarchie typových tříd

```haskell
class Eq a where ...

class Eq a => Ord a where ...
-- Ord requires Eq superclass

class Show a where ...

class (Show a, Eq a) => Printable a where ...
-- Printable requires both Show and Eq
```

## Druhy polymorfismu

### Parametrický polymorfismus

```haskell
id :: a -> a
id x = x
```

Funguje pro *libovolný* typ `a` *jednotně* — funkce *identity* se o typ vůbec nezajímá.

### Ad-hoc polymorfismus (přes typové třídy)

```haskell
class Num a where
    (+) :: a -> a -> a
```

Operace `(+)` je *jiná* pro `Int`, `Double`, komplexní čísla atd.

### Podtypový polymorfismus (OOP)

Haskell jej *nemá* — místo něj se spoléhá na typové třídy.

## Typová třída — implementace v překladači

GHC implementuje typové třídy pomocí **předávání slovníků (dictionary passing)**:

```haskell
elem :: Eq a => a -> [a] -> Bool
elem x ys = ...

-- Compiled to:
elem :: Dict_Eq_a -> a -> [a] -> Bool
elem dict x ys = ...
```

Slovník obsahuje ukazatele (pointer) na implementace funkcí. Jinými slovy: omezení `Eq a` se při překladu změní na další skrytý argument, kterým je tabulka konkrétních funkcí pro daný typ.

Výkon (performance): režie je malá, a navíc se při znalosti typu volání rozhoduje již **při překladu (compile-time)**, nikoli za běhu (specializace).

::: viz type-class-dispatch "Eq a => ... dictionary-passing po desugaringu; klikněte typ a vidíte, který slovník se použije."
:::

## Functor a Monad — náhled

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

### Zákony functoru

```haskell
fmap id      = id              -- identity
fmap (f . g) = fmap f . fmap g -- composition
```

Každá instance je *musí* splňovat (překladač to nevynucuje, ale očekává se to).

::: viz functor-applicative-monad "Hierarchie Functor ⊂ Applicative ⊂ Monad; přepněte typ (Maybe/List/Either/IO) a vidíte všechny tři operace."
:::

## Rozšíření typových tříd

### Víceparametrové typové třídy (MPTC)

```haskell
{-# LANGUAGE MultiParamTypeClasses #-}

class Convertible a b where
    convert :: a -> b

instance Convertible Int String where
    convert = show

instance Convertible Int Double where
    convert = fromIntegral
```

### Funkcionální závislosti

```haskell
{-# LANGUAGE FunctionalDependencies #-}

class Collection c e | c -> e where
    -- e is determined by c
    empty :: c
    insert :: e -> c -> c
```

### Typové rodiny (type families)

```haskell
{-# LANGUAGE TypeFamilies #-}

class Container c where
    type Element c
    empty :: c
    insert :: Element c -> c -> c
```

Používá se v knihovně `containers`.

### Omezení jako typy (constraint kinds)

```haskell
{-# LANGUAGE ConstraintKinds #-}

type Showable a = (Show a, Eq a)
```

## Typová třída vs. objektové programování

| Hledisko | Typová třída | Třída v OOP |
| :--- | :--- | :--- |
| Definice | oddělená od dat | součást dat |
| Výběr implementace (dispatch) | podle typu argumentu | podle identity objektu (vtable) |
| Přidání metody | nová instance | úprava hierarchie tříd |
| Více parametrů | ano (MPTC) | ne |
| Při překladu (compile-time) | ano | za běhu (runtime), většinou |
| Podtypy (subtyping) | ne | ano |

> „Typové třídy poskytují ad-hoc polymorfismus udělaný správně." — Wadler.

## Příklady {tier=example}

### Instance Functoru pro vlastní typ

```haskell
data Tree a = Leaf | Node (Tree a) a (Tree a)

instance Functor Tree where
    fmap _ Leaf = Leaf
    fmap f (Node l x r) = Node (fmap f l) (f x) (fmap f r)

-- Now we can map over trees
doubled = fmap (*2) myTree
```

### Vlastní Eq

```haskell
data Person = Person { name :: String, age :: Int }

-- Eq based only on name (ignore age)
instance Eq Person where
    p1 == p2 = name p1 == name p2
```

### Instance Show

```haskell
data Vector = Vector Double Double

instance Show Vector where
    show (Vector x y) = "(" ++ show x ++ ", " ++ show y ++ ")"

-- show (Vector 1.5 2.7) = "(1.5, 2.7)"
```

## Časté vzory

### Cyklení přes omezený výčet

```haskell
nextColor :: Color -> Color
nextColor c
  | c == maxBound = minBound
  | otherwise = succ c
```

### Generické algoritmy

```haskell
quicksort :: Ord a => [a] -> [a]
quicksort [] = []
quicksort (x:xs) = quicksort smaller ++ [x] ++ quicksort larger
  where
    smaller = filter (< x) xs
    larger  = filter (>= x) xs
```

`quicksort` funguje pro *libovolný* typ s instancí `Ord`: Int, Double, String i vlastní datové typy.

### Převody (Convertible)

```haskell
parse :: Read a => String -> a
parse = read

formatted :: Show a => a -> String
formatted = show
```

## Limity typových tříd

### Předpoklad otevřeného světa (open world assumption)

* Instance může přidat *kdokoli*.
* Nelze definovat „žádná instance" — *uzavřenou* množinu nelze přímo vyjádřit.
* Řešením jsou phantom typy nebo omezené (restricted) třídy.

### Sirotčí instance (orphan instances)

* Instance je definovaná v *jiném* modulu než data i třída.
* Považuje se to za špatný postup (může způsobit konflikty).
* Překladač na to upozorní varováním.

### Problém diamantu (diamond problem)

* Více cest dědičnosti může vést k nejednoznačnosti.
* Haskell většině problémů předchází pravidlem jedna třída na jednu instanci.

## Trendy

* **Generické programování** (Generic, Data.Generics).
* **Programování na úrovni typů** (DataKinds, typové rodiny).
* **Závislé typy (dependent types)** (inspirováno jazyky Idris a Agda).
* **Systémy efektů** (mtl, transformers, polysemy).

---

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Wadler, P., Blott, S.: *How to make ad-hoc polymorphism less ad hoc* (POPL 1989); Hudak, P., Hughes, J., Peyton Jones, S., Wadler, P.: *A History of Haskell: Being Lazy with Class* (HOPL III 2007); GHC documentation — Type Classes; Hutton, G.: *Programming in Haskell* (Cambridge 2016), kap. 8.*
