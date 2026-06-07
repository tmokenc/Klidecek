---
title: Výjimky a chybové stavy
---

# Výjimky a chybové stavy

Haskell nabízí *několik* mechanismů pro ošetření chyb (error handling) — od čistě funkčních (Maybe, Either) až po imperativní (výjimky v IO). Volba mechanismu ovlivňuje *strukturu* programu i jeho *typovou* bezpečnost.

## Strategie ošetření chyb

### 1. Maybe — částečné funkce (partial functions)

Částečná funkce je funkce, která pro některé vstupy nevrací smysluplný výsledek (například dělení nulou). Typ Maybe umožňuje takový „chybějící" výsledek vyjádřit přímo v typu.

```haskell
safeDivide :: Int -> Int -> Maybe Int
safeDivide _ 0 = Nothing
safeDivide a b = Just (a `div` b)

-- Usage
case safeDivide 10 2 of
    Just result -> print result
    Nothing -> putStrLn "Division by zero"
```

* **Čistě funkční** — typový systém vynucuje ošetření chyby.
* **Bez informace o chybě** — víme jen, že výsledek „chybí".
* **Omezení:** nedokáže nést chybovou zprávu.

### 2. Either — chyba s informací

Typ Either umí na rozdíl od Maybe nést i popis chyby: levá hodnota (Left) obsahuje chybu, pravá hodnota (Right) úspěšný výsledek.

```haskell
safeDivide :: Int -> Int -> Either String Int
safeDivide _ 0 = Left "Division by zero"
safeDivide a b = Right (a `div` b)

-- Chain operations
calculate :: Int -> Int -> Int -> Either String Int
calculate a b c = do
    x <- safeDivide a b
    y <- safeDivide x c
    return y
```

* **Čistě funkční**, **typované chyby**.
* **Standardní** volba pro aplikační logiku.

::: viz maybe-either-chain "Sekvence operací s Maybe/Either; vyberte, kde selže — uvidíte zkrácené vyhodnocení (short-circuit) a propagaci chybové zprávy."
:::

### 3. ExceptT — Either + transformátor monád (monad transformer)

Transformátor ExceptT kombinuje chování Either s další monádou (typicky IO). Díky tomu lze v jednom výpočtu spojit vedlejší efekty (například čtení vstupu) s typovaným ošetřením chyb.

```haskell
import Control.Monad.Except

calculate :: ExceptT String IO Int
calculate = do
    a <- liftIO (readLn :: IO Int)
    b <- liftIO (readLn :: IO Int)
    when (b == 0) (throwError "Division by zero")
    return (a `div` b)

-- Run
result <- runExceptT calculate
```

* **Spojuje** Either a IO.
* **Idiomatické** pro aplikační chyby spojené s efekty.

### 4. Výjimky v IO — chyby za běhu (runtime)

```haskell
import Control.Exception

example :: IO Int
example = do
    n <- (readLn :: IO Int)  -- may throw IOException
    return (100 `div` n)      -- may throw ArithException

-- Catch
safeExample :: IO Int
safeExample = catch example handler
  where
    handler :: SomeException -> IO Int
    handler e = do
        putStrLn $ "Caught: " ++ show e
        return 0
```

* **Imperativní styl.**
* Vhodné pro *neobnovitelné* chyby (soubor nenalezen, došla paměť).

## Hierarchie výjimek (exception hierarchy)

```haskell
class Show e => Exception e where
    toException :: e -> SomeException
    fromException :: SomeException -> Maybe e

-- Standard exceptions
SomeException
├── ArithException     -- DivideByZero, Overflow, etc.
├── IOException        -- file not found, network errors
├── ErrorCall          -- error "..." messages
├── ArrayException
├── PatternMatchFail   -- non-exhaustive patterns
└── ... (and more)
```

## Try, catch, handle

```haskell
import Control.Exception

-- catch :: Exception e => IO a -> (e -> IO a) -> IO a
example :: IO Int
example = catch action handler
  where
    action = do
        n <- (readLn :: IO Int)
        return (100 `div` n)
    
    handler :: ArithException -> IO Int
    handler e = do
        putStrLn $ "Arith error: " ++ show e
        return 0

-- handle = flip catch
example2 = handle handler action

-- try :: Exception e => IO a -> IO (Either e a)
example3 :: IO ()
example3 = do
    result <- try action :: IO (Either ArithException Int)
    case result of
        Left e -> putStrLn $ "Error: " ++ show e
        Right v -> print v

-- evaluate — force evaluation of pure expression
example4 :: IO Int
example4 = do
    let x = 1 `div` 0  -- thunk, no error yet
    catch (evaluate x) (\(_ :: ArithException) -> return 0)
```

## throw, throwIO, throwError

```haskell
-- throw — for any context (impure!)
throw :: Exception e => e -> a

-- throwIO — explicit IO version
throwIO :: Exception e => e -> IO a

-- throwError — within ExceptT / Either monad
throwError :: e -> ExceptT e m a

-- Examples
example1 = throw DivideByZero  -- bad: throws from pure code
example2 = throwIO DivideByZero  -- ok: in IO
example3 = throwError "error"  -- ok: in ExceptT
```

## Modul Control.Exception

```haskell
-- Bracket — resource management (acquire, release, use)
bracket :: IO a -> (a -> IO b) -> (a -> IO c) -> IO c

-- Example: open file, ensure close
example :: IO String
example = bracket
    (openFile "data.txt" ReadMode)  -- acquire
    hClose                            -- release
    (\h -> hGetContents h)            -- use

-- finally — always run cleanup
finally :: IO a -> IO b -> IO a

example2 :: IO Int
example2 = evaluate (1 `div` 0) `finally` putStrLn "cleanup"
```

## IOException

```haskell
import System.IO
import System.IO.Error
import Control.Exception

readFileWithCheck :: FilePath -> IO (Maybe String)
readFileWithCheck path = do
    result <- try (readFile path) :: IO (Either IOError String)
    case result of
        Left e
            | isDoesNotExistError e -> do
                putStrLn $ "File not found: " ++ path
                return Nothing
            | otherwise -> do
                putStrLn $ "Other IO error: " ++ show e
                return Nothing
        Right content -> return (Just content)
```

## Vlastní typy výjimek (custom exception types)

```haskell
{-# LANGUAGE DeriveDataTypeable #-}
import Data.Typeable
import Control.Exception

data MyError = ParseError String
             | NetworkError String
             | ValidationError String
             deriving (Show, Typeable)

instance Exception MyError

-- Usage
example :: IO Int
example = do
    result <- try (parseInput "invalid")
    case result of
        Left (ParseError msg) -> do
            putStrLn $ "Parse error: " ++ msg
            return 0
        Right v -> return v

parseInput :: String -> IO Int
parseInput "valid"  = return 42
parseInput _ = throwIO (ParseError "Invalid input")
```

## Asynchronní výjimky (async exceptions)

V GHC mohou být vlákna (thread) *přerušena* zvenčí:

```haskell
import Control.Concurrent
import Control.Exception

-- Spawn thread
example :: IO ()
example = do
    tid <- forkIO $ forever $ do
        putStrLn "Running..."
        threadDelay 1000000
    
    threadDelay 5000000
    killThread tid  -- async exception sent to tid
    putStrLn "Killed"

-- Handle async exceptions
worker :: IO ()
worker = handle handler $ forever $ do
    putStrLn "Working..."
    threadDelay 1000000
  where
    handler :: AsyncException -> IO ()
    handler ThreadKilled = putStrLn "Got killed gracefully"
    handler e = putStrLn $ "Other: " ++ show e
```

## error a undefined

```haskell
error :: String -> a
undefined :: a

-- Pure functions that "throw" (actually crash)
factorial :: Int -> Int
factorial n
    | n < 0 = error "Negative!"
    | n == 0 = 1
    | otherwise = n * factorial (n - 1)

-- undefined for incomplete code
todo :: Int -> Int
todo = undefined  -- placeholder, will crash if called
```

* **error**: vyhodí výjimku ErrorCall.
* **undefined**: vyhodí „Prelude.undefined".
* Obě jsou hodnoty typu *bottom* (⊥), tedy „dno" — výpočet, který nikdy nedá smysluplný výsledek.
* Používají se pro *nemožné* případy nebo *nedokončený* kód.

## Osvědčené postupy

### 1. Pro očekávaná selhání dejte přednost Maybe/Either

```haskell
-- Good: expected case
safeHead :: [a] -> Maybe a
safeHead [] = Nothing
safeHead (x:_) = Just x

-- Bad: throws if empty
head' :: [a] -> a
head' [] = error "Empty list!"  -- avoid
head' (x:_) = x
```

### 2. Pro chyby vstupu/výstupu používejte IOException

```haskell
-- File operations naturally throw IOException
readFile :: FilePath -> IO String

-- Handle at appropriate level
main :: IO ()
main = do
    result <- try (readFile "data.txt")
    case result of
        Left e -> handleError e
        Right content -> process content
```

### 3. Pro vrstvu efektů používejte ExceptT

```haskell
data AppError = DbError | ConfigError | ValidationError

runApp :: ExceptT AppError IO Result
runApp = do
    config <- loadConfig
    db <- connectDb config
    validateAndProcess db

main :: IO ()
main = do
    result <- runExceptT runApp
    case result of
        Left err -> handleAppError err
        Right res -> print res
```

### 4. Nezachytávejte výjimky, pokud to není nutné

```haskell
-- Bad: swallows all errors
result <- catch action (\_ -> return defaultValue)

-- Good: catch specific, let unknown propagate
result <- catch action (\(e :: IOException) -> ...)
```

### 5. Pro správu zdrojů používejte bracket

```haskell
processFile :: FilePath -> IO ()
processFile path = bracket
    (openFile path ReadMode)
    hClose
    (\h -> do
        contents <- hGetContents h
        processContents contents)
```

## Antivzory (anti-patterns)

### Antivzor 1: zachytávání všech výjimek

```haskell
-- BAD
do
    result <- try someAction :: IO (Either SomeException a)
    case result of
        Left _ -> return defaultValue  -- swallows everything!
        Right v -> return v
```

### Antivzor 2: error z kódu knihovny

```haskell
-- BAD: library function throws ErrorCall
myLibFunc :: Int -> Int
myLibFunc x
    | x < 0 = error "Negative!"  -- users can't handle this elegantly
    | otherwise = x

-- GOOD: return Either
myLibFunc :: Int -> Either String Int
myLibFunc x
    | x < 0 = Left "Negative!"
    | otherwise = Right x
```

### Antivzor 3: vyhazování asynchronních výjimek z vláken

```haskell
-- BAD: caller cannot reliably catch
forkIO $ do
    when condition (throw MyException)
```

## Souhrnná tabulka

| Mechanismus | Čistě funkční? | Typováno? | Použití |
| :--- | :---: | :---: | :--- |
| Maybe | ✓ | částečně | Možná chybějící hodnota |
| Either | ✓ | ✓ | Obnovitelná chyba s informací |
| ExceptT | ✓ | ✓ | Vrstva efektů + chyby |
| IOException | ✗ | částečně | Systémové chyby vstupu/výstupu |
| Vlastní výjimka | ✗ | ✓ | Chyby za běhu specifické pro knihovnu |
| error / undefined | ✗ | ✗ | Nemožné případy (chyba programátora) |

## Moderní alternativy

* **`safe-exceptions`** — lepší práce s výjimkami.
* **`unliftio`** — jednotné rozhraní pro IO.
* **`polysemy`, `freer-simple`** — systémy efektů (effect systems).
* **`fused-effects`** — efektivní práce s efekty.

Tyto knihovny snižují množství opakujícího se kódu a zlepšují skládatelnost.

---

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Control.Exception documentation; Marlow, S.: *Parallel and Concurrent Programming in Haskell* (O'Reilly 2013); Peyton Jones, S.: *Tackling the Awkward Squad* (NATO 2001); Snoyman, M.: *safe-exceptions package documentation*.*
