---
title: Výjimky a chybové stavy
---

# Výjimky a chybové stavy

Haskell má *několik* mechanismů pro chybovou obsluhu — od *pure* (Maybe, Either) po *imperative* (IO exceptions). Volba ovlivňuje *strukturu* programu a *typovou* bezpečnost.

## Strategie chybové obsluhy

### 1. Maybe — partial functions

```haskell
safeDivide :: Int -> Int -> Maybe Int
safeDivide _ 0 = Nothing
safeDivide a b = Just (a `div` b)

-- Usage
case safeDivide 10 2 of
    Just result -> print result
    Nothing -> putStrLn "Division by zero"
```

* **Pure** — type system enforces handling.
* **No error info** — only "missing".
* **Limit:** can't carry error message.

### 2. Either — error with info

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

* **Pure**, **typed errors**.
* **Standard** for application logic.

::: viz maybe-either-chain "Sequence operací s Maybe/Either; vyberte, kde selže — viz short-circuit a propagace zprávy."
:::

### 3. ExceptT — Either + monad transformer

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

* **Combines** Either + IO.
* **Idiomatic** for application errors with effects.

### 4. IO exceptions — runtime errors

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

* **Imperative-style.**
* For *unrecoverable* errors (file not found, out of memory).

## Exception hierarchy

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

## Module Control.Exception

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
example2 = (1 `div` 0) `finally` putStrLn "cleanup"
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

## Custom exception types

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

## Async exceptions

V GHC mohou být vlákna *přerušena* externě:

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

* **error**: throws ErrorCall.
* **undefined**: throws "Prelude.undefined".
* Both *bottom* (⊥) values.
* Used for *impossible* cases or *incomplete* code.

## Best practices

### 1. Prefer Maybe/Either for expected failures

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

### 2. Use IOException for IO errors

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

### 3. Use ExceptT for stack of effects

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

### 4. Don't catch unless necessary

```haskell
-- Bad: swallows all errors
result <- catch action (\_ -> return defaultValue)

-- Good: catch specific, let unknown propagate
result <- catch action (\(e :: IOException) -> ...)
```

### 5. Use bracket for resources

```haskell
processFile :: FilePath -> IO ()
processFile path = bracket
    (openFile path ReadMode)
    hClose
    (\h -> do
        contents <- hGetContents h
        processContents contents)
```

## Anti-patterns

### Anti-pattern 1: catching all exceptions

```haskell
-- BAD
do
    result <- try someAction :: IO (Either SomeException a)
    case result of
        Left _ -> return defaultValue  -- swallows everything!
        Right v -> return v
```

### Anti-pattern 2: error from library code

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

### Anti-pattern 3: throwing async exceptions from threads

```haskell
-- BAD: caller cannot reliably catch
forkIO $ do
    when condition (throw MyException)
```

## Summary table

| Mechanism | Pure? | Typed? | Use case |
| :--- | :---: | :---: | :--- |
| Maybe | ✓ | partial | Possibly missing value |
| Either | ✓ | ✓ | Recoverable error with info |
| ExceptT | ✓ | ✓ | Stack of effects + errors |
| IOException | ✗ | partial | I/O system errors |
| Custom Exception | ✗ | ✓ | Library-specific runtime errors |
| error / undefined | ✗ | ✗ | Impossible cases (programmer error) |

## Modern alternatives

* **`safe-exceptions`** — better exception handling.
* **`unliftio`** — unified IO interface.
* **`polysemy`, `freer-simple`** — effect systems.
* **`fused-effects`** — efficient effect handling.

These reduce boilerplate and improve composability.

---

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Control.Exception documentation; Marlow, S.: *Parallel and Concurrent Programming in Haskell* (O'Reilly 2013); Peyton Jones, S.: *Tackling the Awkward Squad* (NATO 2001); Snoyman, M.: *safe-exceptions package documentation*.*
