---
title: Monády a IO
---

# Monády a IO

**Monády** jsou Haskellův mechanismus pro *sequence* výpočtů s *vedlejšími efekty* (state, exceptions, I/O, nedeterminismus) zachovávajíc *čistotu* (purity). Reputace monád jako "obtížných" plyne ze *vysoké abstrakce*, ale praktické použití je *přímé* — `do` notation činí monády *téměř* imperativními.

## Motivace

V Haskellu jsou funkce **čisté** — vždy dávají stejný výsledek pro stejné vstupy, žádné vedlejší efekty.

**Problém:** real programs *potřebují* efekty — čtení souboru, println, network, random.

**Řešení:** efekty jsou *zaobaleny* v *type* (např. `IO a`), funkce nad ním jsou stále čisté. Spojování efektů = `>>=` (bind).

## Monad type class

```haskell
class Monad m where
    return :: a -> m a
    (>>=)  :: m a -> (a -> m b) -> m b

    -- Alternative bind, ignoring result
    (>>)   :: m a -> m b -> m b
    a >> b = a >>= \_ -> b
```

* **return** — wrap pure value into monadic context.
* **(>>=)** (bind, "then") — extract value, pass to next monadic operation.

## Příklady monád

### Maybe — possibly missing

```haskell
data Maybe a = Nothing | Just a

instance Monad Maybe where
    return = Just
    Nothing  >>= _ = Nothing
    Just x   >>= f = f x

-- Chain operations that may fail
lookupAge :: String -> Maybe Int
lookupAge "Alice" = Just 30
lookupAge "Bob"   = Just 25
lookupAge _       = Nothing

doubleAge :: String -> Maybe Int
doubleAge name = lookupAge name >>= \age -> return (age * 2)

doubleAge "Alice"  -- Just 60
doubleAge "Eve"    -- Nothing (propagates)
```

### Either — error or success

```haskell
data Either a b = Left a | Right b

instance Monad (Either e) where
    return = Right
    Left e  >>= _ = Left e
    Right x >>= f = f x

-- Use Right for success, Left for error
parseInt :: String -> Either String Int
parseInt s = case reads s of
    [(n, "")] -> Right n
    _         -> Left ("Cannot parse: " ++ s)

addParsed :: String -> String -> Either String Int
addParsed a b = parseInt a >>= \x -> parseInt b >>= \y -> return (x + y)

addParsed "5" "10"   -- Right 15
addParsed "5" "abc"  -- Left "Cannot parse: abc"
```

### List — non-determinism

```haskell
instance Monad [] where
    return x = [x]
    xs >>= f = concat (map f xs)

-- All combinations
pairs :: [Int] -> [String] -> [(Int, String)]
pairs ns ss = ns >>= \n -> ss >>= \s -> return (n, s)

pairs [1,2] ["a","b"]  -- [(1,"a"),(1,"b"),(2,"a"),(2,"b")]
```

### IO — input/output

```haskell
-- Conceptually
data IO a = ...  -- abstract, no user instance

instance Monad IO where
    return = ... -- inject value, no I/O
    io >>= f = ...  -- run io, pass result to f
```

## do notation

Syntactic sugar for monadic sequencing:

```haskell
-- Explicit bind
example1 :: IO ()
example1 = getLine >>= \name -> 
           putStrLn ("Hello " ++ name)

-- With do notation
example2 :: IO ()
example2 = do
    name <- getLine
    putStrLn ("Hello " ++ name)
```

Both are *equivalent* — same compiled code.

::: viz monad-bind-flow "Přepněte monad (Maybe/Either/List/IO) a uvidíte, jak >>= chaning se per-monad chová — short-circuit u Maybe, branching u List."
:::

### Translation

```haskell
do x <- ma
   y <- mb
   return (f x y)

-- Translates to:
ma >>= \x -> mb >>= \y -> return (f x y)
```

```haskell
do ma
   mb

-- Translates to:
ma >> mb
```

```haskell
do let x = pureExpr
   ma

-- Translates to:
let x = pureExpr in ma
```

## IO monad

### Reading input

```haskell
getLine :: IO String
getChar :: IO Char
getContents :: IO String

readFile :: FilePath -> IO String
readLn :: Read a => IO a
```

### Writing output

```haskell
putStr :: String -> IO ()
putStrLn :: String -> IO ()
print :: Show a => a -> IO ()

writeFile :: FilePath -> String -> IO ()
appendFile :: FilePath -> String -> IO ()
```

### main entry point

```haskell
main :: IO ()
main = do
    putStrLn "Enter your name:"
    name <- getLine
    putStrLn ("Hello, " ++ name)
```

### Sequencing actions

```haskell
example :: IO ()
example = do
    putStrLn "Step 1"
    putStrLn "Step 2"
    name <- getLine
    putStrLn $ "Step 3 with " ++ name
    return ()  -- IO () not needed but legal
```

### Conditional IO

```haskell
example :: IO ()
example = do
    n <- readLn
    if n > 0
        then putStrLn "Positive"
        else putStrLn "Non-positive"
```

### IO in loops

```haskell
import Control.Monad (replicateM_, forM_)

-- Repeat N times
example1 :: IO ()
example1 = replicateM_ 3 (putStrLn "Hello!")

-- ForEach
example2 :: IO ()
example2 = forM_ [1..5] (\i -> 
    putStrLn ("Iteration " ++ show i))
```

## Monad laws

Every Monad instance *must* satisfy:

```haskell
-- 1. Left identity
return x >>= f  =  f x

-- 2. Right identity
m >>= return  =  m

-- 3. Associativity
(m >>= f) >>= g  =  m >>= (\x -> f x >>= g)
```

Not enforced by compiler, but *expected* — violations cause subtle bugs.

## Functor + Applicative + Monad hierarchy

```haskell
class Functor f where
    fmap :: (a -> b) -> f a -> f b

class Functor f => Applicative f where
    pure :: a -> f a
    (<*>) :: f (a -> b) -> f a -> f b

class Applicative m => Monad m where
    return :: a -> m a
    (>>=) :: m a -> (a -> m b) -> m b
```

* **Functor** — map a function inside a context.
* **Applicative** — apply a function-in-context to a value-in-context.
* **Monad** — chain computations where each step depends on previous result.

Monad ⊇ Applicative ⊇ Functor (strictly more powerful).

### Examples

```haskell
-- Functor
fmap (*2) (Just 5)        -- Just 10
fmap (+1) [1,2,3]         -- [2,3,4]

-- Applicative
(+) <$> Just 3 <*> Just 5    -- Just 8
[(+1), (*2)] <*> [10, 20]    -- [11,21,20,40]

-- Monad
do
    x <- Just 5
    y <- Just 3
    return (x + y)        -- Just 8
```

## Common monads

### Maybe

For computations that may fail (no error info).

### Either

For computations that may fail with error.

### List

For non-deterministic computations.

### IO

For input/output and external effects.

### State

For computations carrying state.

```haskell
import Control.Monad.State

counter :: State Int ()
counter = do
    n <- get
    put (n + 1)

runCounter :: Int -> Int
runCounter init = execState counter init
```

### Reader

For computations with shared read-only environment.

```haskell
import Control.Monad.Reader

config :: Reader Config Int
config = do
    cfg <- ask
    return (port cfg + 1)
```

### Writer

For computations that produce log/output.

```haskell
import Control.Monad.Writer

logger :: Writer [String] Int
logger = do
    tell ["Step 1"]
    tell ["Step 2"]
    return 42
```

## Monad transformers

Combine multiple monad effects:

```haskell
import Control.Monad.Trans.State
import Control.Monad.Trans.Class (lift)

-- State + IO
example :: StateT Int IO ()
example = do
    n <- get
    lift $ putStrLn ("Current: " ++ show n)
    put (n + 1)
```

`mtl` library provides standard transformers.

## Praktické nasazení

### Configuration

```haskell
data Config = Config { dbUrl :: String, port :: Int }

readConfig :: IO Config
readConfig = do
    url <- getEnv "DATABASE_URL"
    portStr <- getEnv "PORT"
    return $ Config url (read portStr)
```

### File processing

```haskell
processFile :: FilePath -> IO Int
processFile path = do
    contents <- readFile path
    let lineCount = length (lines contents)
    return lineCount

main :: IO ()
main = do
    count <- processFile "data.txt"
    putStrLn $ "Lines: " ++ show count
```

### HTTP requests (with http-client)

```haskell
import Network.HTTP.Simple

fetchData :: IO ByteString
fetchData = do
    response <- httpBS "https://api.example.com/data"
    return $ getResponseBody response
```

### Error handling with Either

```haskell
data Error = ParseError | NetworkError | ValidationError String

processInput :: String -> Either Error Int
processInput input = do
    parsed <- parse input
    validated <- validate parsed
    return validated
```

## Klíčové ponaučení

1. **Monads = sequencing with effects.**
2. **return** = inject value, **>>=** = chain.
3. **do notation** = imperative-like syntax.
4. **IO is just a monad** — *not* magic.
5. **Pure functions + monadic IO** = best of both worlds.

> "A monad is a monoid in the category of endofunctors." — accurate but unhelpful.
>
> Better: "A monad is a way to combine effectful computations." — Hutton.

## Resources

* **Real World Haskell** — chapter on monads.
* **Learn You a Haskell** — gentle intro.
* **Hutton's textbook** — clear treatment.
* **Wadler's papers** — original theory.

---

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Wadler, P.: *Monads for Functional Programming* (Marktoberdorf 1995); Hutton, G.: *Programming in Haskell* (Cambridge 2016), kap. 12; Peyton Jones, S.: *Tackling the Awkward Squad: monadic input/output, concurrency, exceptions, and foreign-language calls in Haskell* (NATO 2001); Lipovača, M.: *Learn You a Haskell for Great Good!* — [learnyouahaskell.com](http://learnyouahaskell.com/).*
