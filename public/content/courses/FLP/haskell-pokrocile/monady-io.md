---
title: Monády a IO
---

# Monády a IO

**Monády** jsou v Haskellu mechanismus pro řetězení (sequencing) výpočtů, které mají vedlejší efekty (stav, výjimky, vstup/výstup, nedeterminismus), a přitom zachovávají čistotu (purity) jazyka. Pověst monád coby „obtížných“ pramení z jejich vysoké míry abstrakce, ale praktické použití je přímočaré — zápis pomocí `do` notace dělá práci s monádami téměř imperativní (tj. připomíná běžný příkazový kód).

## Motivace

V Haskellu jsou funkce **čisté** (pure) — pro stejné vstupy vracejí vždy stejný výsledek a nemají žádné vedlejší efekty.

**Problém:** skutečné programy efekty potřebují — čtení souboru, výpis na obrazovku, práci se sítí nebo generování náhodných čísel.

**Řešení:** efekty se zaobalí do typu (například `IO a`), takže funkce, které s tímto typem pracují, zůstávají čisté. Spojování efektů zajišťuje operátor `>>=` (bind, česky „naváž“).

## Typová třída Monad

```haskell
class Monad m where
    return :: a -> m a
    (>>=)  :: m a -> (a -> m b) -> m b

    -- Alternative bind, ignoring result
    (>>)   :: m a -> m b -> m b
    a >> b = a >>= \_ -> b
```

* **return** — zabalí (wrap) čistou hodnotu do monadického kontextu.
* **(>>=)** (bind, čteno „then“, tedy „potom“) — vytáhne hodnotu a předá ji další monadické operaci.

## Příklady monád

### Maybe — možná chybějící hodnota

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

### Either — chyba, nebo úspěch

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

### List — nedeterminismus

```haskell
instance Monad [] where
    return x = [x]
    xs >>= f = concat (map f xs)

-- All combinations
pairs :: [Int] -> [String] -> [(Int, String)]
pairs ns ss = ns >>= \n -> ss >>= \s -> return (n, s)

pairs [1,2] ["a","b"]  -- [(1,"a"),(1,"b"),(2,"a"),(2,"b")]
```

### IO — vstup a výstup

```haskell
-- Conceptually
data IO a = ...  -- abstract, no user instance

instance Monad IO where
    return = ... -- inject value, no I/O
    io >>= f = ...  -- run io, pass result to f
```

## do notace

Jde o syntaktické zjednodušení (syntactic sugar) pro monadické řetězení:

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

Oba zápisy jsou rovnocenné — výsledný přeložený kód je stejný.

::: viz monad-bind-flow "Přepínejte mezi monádami (Maybe/Either/List/IO) a uvidíte, jak se řetězení pomocí >>= chová v každé z nich — zkratové vyhodnocení (short-circuit) u Maybe, větvení u List."
:::

### Překlad do notace

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

## Monáda IO

### Čtení vstupu

```haskell
getLine :: IO String
getChar :: IO Char
getContents :: IO String

readFile :: FilePath -> IO String
readLn :: Read a => IO a
```

### Zápis výstupu

```haskell
putStr :: String -> IO ()
putStrLn :: String -> IO ()
print :: Show a => a -> IO ()

writeFile :: FilePath -> String -> IO ()
appendFile :: FilePath -> String -> IO ()
```

### Vstupní bod main

```haskell
main :: IO ()
main = do
    putStrLn "Enter your name:"
    name <- getLine
    putStrLn ("Hello, " ++ name)
```

### Řetězení akcí

```haskell
example :: IO ()
example = do
    putStrLn "Step 1"
    putStrLn "Step 2"
    name <- getLine
    putStrLn $ "Step 3 with " ++ name
    return ()  -- IO () not needed but legal
```

### Podmíněné IO

```haskell
example :: IO ()
example = do
    n <- readLn
    if n > 0
        then putStrLn "Positive"
        else putStrLn "Non-positive"
```

### IO ve smyčkách

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

## Zákony monád

Každá instance třídy Monad musí splňovat:

```haskell
-- 1. Left identity
return x >>= f  =  f x

-- 2. Right identity
m >>= return  =  m

-- 3. Associativity
(m >>= f) >>= g  =  m >>= (\x -> f x >>= g)
```

Překladač (compiler) tyto zákony nevynucuje, ale očekává se jejich dodržení — jejich porušení vede ke zrádným chybám.

## Hierarchie Functor + Applicative + Monad

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

* **Functor** — umí aplikovat funkci na hodnotu uvnitř kontextu.
* **Applicative** — umí aplikovat funkci v kontextu na hodnotu v kontextu.
* **Monad** — umí řetězit výpočty, kde každý krok závisí na výsledku předchozího.

Platí Monad ⊇ Applicative ⊇ Functor (každá další třída je striktně mocnější).

### Příklady

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

## Běžné monády

### Maybe

Pro výpočty, které mohou selhat (bez informace o chybě).

### Either

Pro výpočty, které mohou selhat s informací o chybě.

### List

Pro nedeterministické výpočty.

### IO

Pro vstup/výstup a vnější efekty.

### State

Pro výpočty, které s sebou nesou stav.

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

Pro výpočty se sdíleným prostředím určeným jen ke čtení.

```haskell
import Control.Monad.Reader

config :: Reader Config Int
config = do
    cfg <- ask
    return (port cfg + 1)
```

### Writer

Pro výpočty, které produkují záznam (log) či výstup.

```haskell
import Control.Monad.Writer

logger :: Writer [String] Int
logger = do
    tell ["Step 1"]
    tell ["Step 2"]
    return 42
```

## Transformátory monád (monad transformers)

Umožňují zkombinovat efekty více monád dohromady:

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

Standardní sadu transformátorů poskytuje knihovna `mtl`.

## Praktické nasazení {tier=practice}

### Konfigurace

```haskell
data Config = Config { dbUrl :: String, port :: Int }

readConfig :: IO Config
readConfig = do
    url <- getEnv "DATABASE_URL"
    portStr <- getEnv "PORT"
    return $ Config url (read portStr)
```

### Zpracování souboru

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

### HTTP požadavky (pomocí http-client)

```haskell
import Network.HTTP.Simple

fetchData :: IO ByteString
fetchData = do
    response <- httpBS "https://api.example.com/data"
    return $ getResponseBody response
```

### Ošetření chyb (error handling) pomocí Either

```haskell
data Error = ParseError | NetworkError | ValidationError String

processInput :: String -> Either Error Int
processInput input = do
    parsed <- parse input
    validated <- validate parsed
    return validated
```

## Klíčové ponaučení

1. **Monády slouží k řetězení výpočtů s efekty.**
2. **return** vkládá hodnotu do kontextu, **>>=** výpočty zřetězí.
3. **do notace** dává imperativně vypadající (příkazovou) syntaxi.
4. **IO je jen další monáda** — není to žádné kouzlo.
5. **Čisté funkce v kombinaci s monadickým IO** dávají to nejlepší z obou světů.

> „Monáda je monoid v kategorii endofunktorů.“ — přesné, ale k ničemu.
>
> Lépe: „Monáda je způsob, jak skládat výpočty s vedlejšími efekty.“ — Hutton.

## Další zdroje

* **Real World Haskell** — kapitola o monádách.
* **Learn You a Haskell** — vlídný úvod.
* **Huttonova učebnice** — srozumitelný výklad.
* **Wadlerovy články** — původní teorie.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=t1e8gqXLbsU" "What is a Monad? - Computerphile" "Computerphile"
:::

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Wadler, P.: *Monads for Functional Programming* (Marktoberdorf 1995); Hutton, G.: *Programming in Haskell* (Cambridge 2016), kap. 12; Peyton Jones, S.: *Tackling the Awkward Squad: monadic input/output, concurrency, exceptions, and foreign-language calls in Haskell* (NATO 2001); Lipovača, M.: *Learn You a Haskell for Great Good!* — [learnyouahaskell.com](http://learnyouahaskell.com/).*
