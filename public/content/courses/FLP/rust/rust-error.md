---
title: Rust — Error handling (Result, Option)
---

# Rust — Error handling (Result, Option)

Rust *nemá* exceptions (jako C++, Java, Python). Místo nich má **type-safe** error handling pomocí `Result<T, E>` a `Option<T>`. Tento přístup *vynucuje* explicitní handling errors — *compile-time* enforcement *neignorování* chyb.

## Option<T>

Pro hodnoty, které *mohou chybět*:

```rust
enum Option<T> {
    Some(T),
    None,
}
```

Analogous to Haskell's `Maybe`.

### Examples

```rust
fn first_word(s: &str) -> Option<&str> {
    s.split_whitespace().next()
}

fn main() {
    match first_word("hello world") {
        Some(word) => println!("First word: {}", word),
        None => println!("Empty string"),
    }
}
```

### Common methods

```rust
let some_val: Option<i32> = Some(5);
let none_val: Option<i32> = None;

// unwrap — extracts or panics
some_val.unwrap();  // 5
// none_val.unwrap();  // PANIC!

// unwrap_or — extracts or default
some_val.unwrap_or(0);   // 5
none_val.unwrap_or(0);   // 0

// unwrap_or_else — lazy default
none_val.unwrap_or_else(|| compute_default());

// map — transform inside
some_val.map(|x| x * 2);  // Some(10)
none_val.map(|x| x * 2);  // None

// and_then — chain (monadic bind)
some_val.and_then(|x| if x > 0 { Some(x) } else { None });

// or, or_else — alternative
none_val.or(Some(0));         // Some(0)
none_val.or_else(|| Some(0)); // Some(0)

// is_some, is_none
some_val.is_some();  // true
none_val.is_none();  // true
```

### Pattern matching

```rust
match some_val {
    Some(x) if x > 10 => println!("Big: {}", x),
    Some(x) => println!("Small: {}", x),
    None => println!("Nothing"),
}

// if let — single pattern
if let Some(x) = some_val {
    println!("Got: {}", x);
}

// while let
while let Some(x) = stack.pop() {
    println!("{}", x);
}
```

## Result<T, E>

Pro operace, které *mohou selhat* s informací o chybě:

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

Analogous to Haskell's `Either`.

### Examples

```rust
fn parse_int(s: &str) -> Result<i32, String> {
    s.parse::<i32>().map_err(|e| format!("Parse error: {}", e))
}

fn main() {
    match parse_int("42") {
        Ok(n) => println!("Got: {}", n),
        Err(e) => println!("Error: {}", e),
    }
}
```

### Common methods

```rust
let ok_val: Result<i32, String> = Ok(5);
let err_val: Result<i32, String> = Err("oops".to_string());

// unwrap
ok_val.unwrap();   // 5
// err_val.unwrap();  // PANIC!

// expect — unwrap with custom message
ok_val.expect("Should be Ok");

// unwrap_or — default for Err
err_val.unwrap_or(0);  // 0

// map — transform Ok
ok_val.map(|x| x * 2);  // Ok(10)
err_val.map(|x| x * 2); // Err("oops")

// map_err — transform Err
err_val.map_err(|e| format!("Error: {}", e));

// and_then — chain
ok_val.and_then(|x| Ok(x + 1));  // Ok(6)

// or_else — recover from error
err_val.or_else(|_| Ok(0));  // Ok(0)
```

### The ? operator

**Question mark (?)** automatically *propagates* errors:

```rust
fn read_and_parse(path: &str) -> Result<i32, std::io::Error> {
    let contents = std::fs::read_to_string(path)?;  // returns Err early if fails
    let n: i32 = contents.trim().parse()
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
    Ok(n)
}
```

`?` is syntactic sugar for:

```rust
match expr {
    Ok(v) => v,
    Err(e) => return Err(e.into()),
}
```

::: viz rust-result-chain "Result chain s ? operátorem; různé scénáře (OK / fail v každém kroku); propagace přes From conversion."
:::

### `?` requires compatible error types

```rust
use std::fs;
use std::num::ParseIntError;

#[derive(Debug)]
enum AppError {
    Io(std::io::Error),
    Parse(ParseIntError),
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self { AppError::Io(e) }
}

impl From<ParseIntError> for AppError {
    fn from(e: ParseIntError) -> Self { AppError::Parse(e) }
}

fn read_number(path: &str) -> Result<i32, AppError> {
    let content = fs::read_to_string(path)?;      // ? converts std::io::Error
    let n: i32 = content.trim().parse()?;         // ? converts ParseIntError
    Ok(n)
}
```

## panic! a unwinding

Pro **unrecoverable** errors:

```rust
fn main() {
    let v = vec![1, 2, 3];
    
    // Bound check, panics if out of range
    let item = v[99];  // PANIC: index out of bounds
}
```

### Explicit panic

```rust
fn divide(a: i32, b: i32) -> i32 {
    if b == 0 {
        panic!("Division by zero!");
    }
    a / b
}
```

### Stack unwinding

Default: stack unwinds, drop runs.

```toml
# Cargo.toml — abort instead
[profile.release]
panic = "abort"
```

`abort` is faster (no unwinding) but no cleanup. Useful for embedded / when no destructors needed.

## Custom error types

### Simple enum

```rust
#[derive(Debug)]
enum CalculatorError {
    DivisionByZero,
    Overflow,
    InvalidInput(String),
}

fn divide(a: i32, b: i32) -> Result<i32, CalculatorError> {
    if b == 0 {
        return Err(CalculatorError::DivisionByZero);
    }
    a.checked_div(b).ok_or(CalculatorError::Overflow)
}
```

### Display + Error trait

```rust
use std::fmt;
use std::error::Error;

impl fmt::Display for CalculatorError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            CalculatorError::DivisionByZero => write!(f, "Division by zero"),
            CalculatorError::Overflow => write!(f, "Arithmetic overflow"),
            CalculatorError::InvalidInput(s) => write!(f, "Invalid: {}", s),
        }
    }
}

impl Error for CalculatorError {}
```

### Using `thiserror` crate

Reduces boilerplate:

```rust
use thiserror::Error;

#[derive(Error, Debug)]
enum AppError {
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Parse error: {0}")]
    Parse(#[from] std::num::ParseIntError),
    
    #[error("Validation failed: {message}")]
    Validation { message: String },
}
```

### Using `anyhow` crate

For applications (not libraries):

```rust
use anyhow::{Context, Result};

fn process_file(path: &str) -> Result<String> {
    let content = std::fs::read_to_string(path)
        .context(format!("Failed to read {}", path))?;
    
    let result = content.trim().parse::<i32>()
        .context("Failed to parse number")?;
    
    Ok(format!("Got: {}", result))
}
```

## Error patterns

### Pattern 1: From conversion + `?`

Define a custom error enum with a `From` impl per source error, then let `?` convert each error automatically — see the `AppError` example above under [`?` requires compatible error types](#-requires-compatible-error-types) (`enum { Io, Parse }` + two `From` impls + a read-file/parse function).

### Pattern 2: Combinators

```rust
fn process(input: &str) -> Result<i32, String> {
    input.parse::<i32>()
        .map_err(|e| format!("Parse: {}", e))
        .and_then(|n| if n > 0 { Ok(n) } else { Err("Non-positive".to_string()) })
        .map(|n| n * 2)
}
```

### Pattern 3: Early return

```rust
fn process(input: &str) -> Result<i32, MyError> {
    let n: i32 = input.parse()?;
    if n < 0 {
        return Err(MyError::Validation("Negative".to_string()));
    }
    Ok(n * 2)
}
```

## Best practices

### 1. Use Result, not panic

```rust
// BAD — panics
fn divide(a: i32, b: i32) -> i32 {
    a / b  // panics if b == 0
}

// GOOD — returns Result
fn divide(a: i32, b: i32) -> Result<i32, String> {
    a.checked_div(b).ok_or_else(|| "Division by zero".to_string())
}
```

### 2. Use ? operator

```rust
// BAD — verbose
fn process() -> Result<i32, MyError> {
    let content = match std::fs::read_to_string("data") {
        Ok(c) => c,
        Err(e) => return Err(MyError::Io(e)),
    };
    let n = match content.trim().parse::<i32>() {
        Ok(n) => n,
        Err(e) => return Err(MyError::Parse(e)),
    };
    Ok(n)
}

// GOOD — concise with ?
fn process() -> Result<i32, MyError> {
    let content = std::fs::read_to_string("data")?;
    let n: i32 = content.trim().parse()?;
    Ok(n)
}
```

### 3. Library vs. application errors

* **Library:** define typed errors (`thiserror`).
* **Application:** use generic errors (`anyhow`).

### 4. Don't panic in libraries

```rust
// BAD — library function panics
pub fn parse(input: &str) -> i32 {
    input.parse().unwrap()  // bad UX for users
}

// GOOD — return Result
pub fn parse(input: &str) -> Result<i32, ParseError> {
    input.parse().map_err(|_| ParseError::Invalid)
}
```

### 5. Use expect with informative messages

```rust
let port: u16 = env::var("PORT")
    .expect("PORT environment variable must be set")
    .parse()
    .expect("PORT must be a valid number");
```

## Anti-patterns

### Anti-pattern 1: unwrap everywhere

```rust
// BAD — crashes on any error
fn main() {
    let content = std::fs::read_to_string("data.txt").unwrap();
    let n: i32 = content.parse().unwrap();
    println!("{}", n);
}
```

### Anti-pattern 2: Boxing all errors

```rust
// AVOID — loses type information
fn process() -> Result<i32, Box<dyn Error>> {
    // ... but use this for binaries / quick scripts
}
```

### Anti-pattern 3: String errors

```rust
// AVOID — no structure
fn divide(a: i32, b: i32) -> Result<i32, String> {
    if b == 0 {
        Err("Division by zero".to_string())  // can't pattern match
    } else {
        Ok(a / b)
    }
}

// BETTER
enum MathError {
    DivisionByZero,
    Overflow,
}
```

## Result chain example {tier=example}

```rust
use std::fs;

#[derive(Debug)]
enum ConfigError {
    Io(std::io::Error),
    Parse(serde_json::Error),
    Validation(String),
}

impl From<std::io::Error> for ConfigError {
    fn from(e: std::io::Error) -> Self { ConfigError::Io(e) }
}

impl From<serde_json::Error> for ConfigError {
    fn from(e: serde_json::Error) -> Self { ConfigError::Parse(e) }
}

#[derive(serde::Deserialize)]
struct Config {
    port: u16,
    host: String,
}

fn load_config(path: &str) -> Result<Config, ConfigError> {
    let content = fs::read_to_string(path)?;
    let config: Config = serde_json::from_str(&content)?;
    
    if config.port == 0 {
        return Err(ConfigError::Validation("Port cannot be 0".to_string()));
    }
    
    Ok(config)
}

fn main() {
    match load_config("config.json") {
        Ok(cfg) => println!("Loaded: {}:{}", cfg.host, cfg.port),
        Err(ConfigError::Io(e)) => eprintln!("File error: {}", e),
        Err(ConfigError::Parse(e)) => eprintln!("JSON error: {}", e),
        Err(ConfigError::Validation(msg)) => eprintln!("Invalid: {}", msg),
    }
}
```

## Srovnání s Haskell

| Aspect | Haskell | Rust |
| :--- | :--- | :--- |
| Optional value | `Maybe a` | `Option<T>` |
| Error type | `Either e a` | `Result<T, E>` |
| Propagation | monad bind (`>>=`) | `?` operator |
| Exception | `throwIO` (IO only) | `panic!` (unrecoverable) |
| Recovery | `catch` | `Result::or_else`, custom |
| Custom errors | data type + class | enum + From + Display |

Oba jazyky preferují *type-encoded* errors before exceptions.

---

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Klabnik, S., Nichols, C.: *The Rust Programming Language* (2nd ed., No Starch Press 2023), kap. 9 — [doc.rust-lang.org/book/ch09-00-error-handling.html](https://doc.rust-lang.org/book/ch09-00-error-handling.html); Rust by example — Error handling; `thiserror` crate — [crates.io/crates/thiserror](https://crates.io/crates/thiserror); `anyhow` crate — [crates.io/crates/anyhow](https://crates.io/crates/anyhow).*
