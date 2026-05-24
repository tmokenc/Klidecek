---
title: Funkce vyšších řádů a currying
---

# Funkce vyšších řádů a currying

**Higher-order functions** (HOF) jsou funkce, které berou *jiné funkce* jako argumenty nebo *vrací* funkce. **Currying** je transformace n-ární funkce na řetězec unárních. Spolu tvoří *jádro* expressivity funkcionálního programování.

## Higher-order functions

### Functions as arguments

```haskell
applyTwice :: (a -> a) -> a -> a
applyTwice f x = f (f x)

result = applyTwice (+3) 10   -- 16
result = applyTwice (++ "!") "hello"  -- "hello!!"
```

### Functions as return values

```haskell
makeAdder :: Int -> (Int -> Int)
makeAdder n = \x -> x + n

add5 = makeAdder 5
add10 = makeAdder 10

result = add5 3   -- 8
result = add10 7  -- 17
```

## Currying

Klíčový princip Haskellu: *všechny* funkce jsou *unární* (1 argument).

```haskell
-- Tyto jsou ekvivalentní:
add :: Int -> Int -> Int
add x y = x + y

add :: Int -> (Int -> Int)
add = \x -> \y -> x + y

-- Function type association is RIGHT
-- Int -> Int -> Int = Int -> (Int -> Int)
```

### Partial application

```haskell
add :: Int -> Int -> Int
add x y = x + y

add5 = add 5      -- partial application
add5 :: Int -> Int
add5 3            -- 8
```

### Operator sections

```haskell
double = (*2)        -- function that doubles
half = (/2)          -- function that halves
addFive = (+5)
greater = (>10)

double 5             -- 10
filter (>10) [5,10,15,20]  -- [15,20]
```

::: viz currying-partial "Vrstvy add3 :: Int -> Int -> Int -> Int; aplikujte 1/2/3 argumenty a vidíte, jak typ a hodnota mění."
:::

### Uncurried form

```haskell
-- Curried (Haskell native)
add :: Int -> Int -> Int
add x y = x + y

-- Uncurried (tuple)
add' :: (Int, Int) -> Int
add' (x, y) = x + y

-- Convert between
curry   :: ((a, b) -> c) -> (a -> b -> c)
uncurry :: (a -> b -> c) -> ((a, b) -> c)
```

## Standard HOFs — list functions

### map

```haskell
map :: (a -> b) -> [a] -> [b]
map _ []     = []
map f (x:xs) = f x : map f xs

map (*2) [1,2,3]      -- [2,4,6]
map show [1,2,3]      -- ["1","2","3"]
map length ["hi","hello","x"]  -- [2,5,1]
```

### filter

```haskell
filter :: (a -> Bool) -> [a] -> [a]
filter _ []     = []
filter p (x:xs)
  | p x       = x : filter p xs
  | otherwise = filter p xs

filter even [1..10]   -- [2,4,6,8,10]
filter (>3) [1..10]   -- [4,5,6,7,8,9,10]
```

### foldr — right fold

```haskell
foldr :: (a -> b -> b) -> b -> [a] -> b
foldr _ z []     = z
foldr f z (x:xs) = f x (foldr f z xs)

-- foldr (+) 0 [1,2,3] = 1 + (2 + (3 + 0)) = 6
-- foldr (-) 0 [1,2,3] = 1 - (2 - (3 - 0)) = 2

sum'     = foldr (+) 0
product' = foldr (*) 1
length'  = foldr (\_ acc -> acc + 1) 0
```

### foldl — left fold

```haskell
foldl :: (b -> a -> b) -> b -> [a] -> b
foldl _ z []     = z
foldl f z (x:xs) = foldl f (f z x) xs

-- foldl (+) 0 [1,2,3] = ((0+1)+2)+3 = 6
-- foldl (-) 0 [1,2,3] = ((0-1)-2)-3 = -6
```

### foldl' — strict left fold

```haskell
import Data.List (foldl')

foldl' :: (b -> a -> b) -> b -> [a] -> b
-- Strict version of foldl
-- Avoids thunk buildup, preferred for accumulation
```

::: viz fold-comparison "foldr vs foldl vs foldl' na stejném seznamu; visible stack depth + thunk buildup."
:::

### Other HOFs

```haskell
zip :: [a] -> [b] -> [(a, b)]
zip [1,2,3] ['a','b','c']  -- [(1,'a'),(2,'b'),(3,'c')]

zipWith :: (a -> b -> c) -> [a] -> [b] -> [c]
zipWith (+) [1,2,3] [10,20,30]  -- [11,22,33]

unzip :: [(a, b)] -> ([a], [b])
unzip [(1,'a'),(2,'b')]  -- ([1,2],"ab")

iterate :: (a -> a) -> a -> [a]
take 5 (iterate (*2) 1)  -- [1,2,4,8,16]

repeat :: a -> [a]
take 3 (repeat 'x')  -- "xxx"

replicate :: Int -> a -> [a]
replicate 4 'y'  -- "yyyy"

takeWhile, dropWhile :: (a -> Bool) -> [a] -> [a]
takeWhile (<5) [1..10]  -- [1,2,3,4]
dropWhile (<5) [1..10]  -- [5,6,7,8,9,10]

span, break :: (a -> Bool) -> [a] -> ([a], [a])
span (<5) [1..10]  -- ([1,2,3,4],[5,6,7,8,9,10])
break (==5) [1..10]  -- ([1,2,3,4],[5,6,7,8,9,10])
```

## Function composition

```haskell
(.) :: (b -> c) -> (a -> b) -> (a -> c)
(f . g) x = f (g x)

-- Examples
upperFirst = toUpper . head
sumDoubled = sum . map (*2)
squareSum = sum . map (^2)

-- Point-free style
sumOfSquares :: [Int] -> Int
sumOfSquares = sum . map (^2)

-- Multiple compositions
filterEvenSquared = filter even . map (^2)
```

## Application operator $

```haskell
($) :: (a -> b) -> a -> b
f $ x = f x

-- Allows omitting parens
print (1 + 2)  ==  print $ 1 + 2
sum (filter even [1..10])  ==  sum $ filter even [1..10]
```

Useful for chaining without nested parens.

## Examples — practical

### Sum of squares of evens

```haskell
sumSqEvens :: [Int] -> Int
sumSqEvens = sum . map (^2) . filter even

sumSqEvens [1..10]  -- 4+16+36+64+100 = 220
```

### Word count

```haskell
wordCount :: String -> Int
wordCount = length . words

wordCount "Hello world Haskell programming"  -- 4
```

### Frequency count

```haskell
import Data.List (group, sort)

freq :: Ord a => [a] -> [(a, Int)]
freq = map (\xs -> (head xs, length xs)) . group . sort

freq [1,2,1,3,2,1,4]  -- [(1,3),(2,2),(3,1),(4,1)]
```

### Functional composition pipeline

```haskell
processData :: [Int] -> Int
processData = sum
            . filter (>0)
            . map (*2)
            . take 100
```

::: viz hof-pipeline "sum . map (^2) . filter even . take n; sledujte, kolik prvků skutečně proteče podle consumeru."
:::

## Lambdas

```haskell
-- Anonymous functions
double = \x -> x * 2
add = \x y -> x + y

-- Use case: as HOF argument
result = map (\x -> x*x + 1) [1,2,3]  -- [2,5,10]
result = filter (\x -> x > 5 && x < 10) [1..20]  -- [6,7,8,9]
```

## Point-free style

```haskell
-- Pointed (explicit arguments)
sum' :: [Int] -> Int
sum' xs = foldr (+) 0 xs

-- Point-free (no arguments)
sum'' :: [Int] -> Int
sum'' = foldr (+) 0

-- Both equivalent, point-free more concise
```

Limity: extreme point-free can hurt readability. *Tasteful* use.

## η-conversion

Klíčová idea:

::: math
\lambda x.\ f\ x \equiv_\eta f \quad \text{(if x ∉ FV(f))}
:::

V Haskellu:

```haskell
-- These are equivalent
double = \x -> 2 * x
double = (2*)
```

η-konverze odstraňuje *zbytečný* argument — kořen point-free style.

::: viz eta-pointfree "Krok-po-kroku derivace point-free formy z explicitního lambda; sumSq, pipeline, applyTwice."
:::

## map vs. fmap

```haskell
map :: (a -> b) -> [a] -> [b]
fmap :: Functor f => (a -> b) -> f a -> f b
```

`map` je *specifická* pro listy.
`fmap` je *obecná* pro libovolný Functor.

```haskell
fmap (*2) [1,2,3]            -- [2,4,6]  (works on list, same as map)
fmap (*2) (Just 5)           -- Just 10  (works on Maybe)
fmap (*2) (Right 5)          -- Right 10 (works on Either Left a)
```

## Performance considerations

### Tail recursion vs. fold

```haskell
-- Bad: builds up thunks
sum1 :: [Int] -> Int
sum1 [] = 0
sum1 (x:xs) = x + sum1 xs

-- Good: tail recursive (with accumulator)
sum2 :: [Int] -> Int
sum2 = go 0
  where go acc [] = acc
        go acc (x:xs) = go (acc + x) xs

-- Best: foldl' (strict)
sum3 :: [Int] -> Int
sum3 = foldl' (+) 0
```

### Map vs. list comprehension

```haskell
-- List comprehension
[2 * x | x <- xs]

-- Equivalent map
map (*2) xs
```

Compiler optimizes both well.

## Concurrency via HOFs

```haskell
import Control.Parallel.Strategies

-- Parallel map
parMap :: Strategy b -> (a -> b) -> [a] -> [b]
result = parMap rdeepseq expensiveOperation bigList
```

Parallelism *trivial* with HOFs.

## Functional design patterns

### Builder pattern via composition

```haskell
buildHtml :: String -> String -> String -> String
buildHtml title body footer = 
    "<html>"
  ++ "<head><title>" ++ title ++ "</title></head>"
  ++ "<body>" ++ body ++ "</body>"
  ++ "<footer>" ++ footer ++ "</footer>"
  ++ "</html>"

-- Curried + composed
withHeader = wrap "head" . wrap "title"
withBody   = wrap "body"
fullPage   = withBody . withHeader
```

### Strategy pattern via HOF

```haskell
sortStrategy :: (a -> a -> Ordering) -> [a] -> [a]
sortStrategy cmp = sortBy cmp

-- Different strategies
ascending  = sortStrategy compare
descending = sortStrategy (flip compare)
byLength   = sortStrategy (comparing length)
```

## Klíčové ponaučení

* **HOFs** make code *concise* and *reusable*.
* **Currying** enables *partial application*.
* **Composition** chains operations naturally.
* **Point-free style** highlights data flow.
* **map / filter / fold** cover 80 % of list processing.

> "A higher-order function is just a function that takes or returns another function." — straightforward, but profoundly impactful.

---

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Hutton, G.: *Programming in Haskell* (Cambridge 2016), kap. 7; Bird, R.: *Thinking Functionally with Haskell* (Cambridge 2014), kap. 5; Hughes, J.: *Why Functional Programming Matters* (Computer Journal 1989); Lipovača, M.: *Learn You a Haskell for Great Good!*.*
