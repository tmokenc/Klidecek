---
title: Rust — Ownership a borrowing
---

# Rust — Ownership a borrowing

**Rust** je *moderní systémový jazyk* (Mozilla 2010+, Rust Foundation 2021+) s *unikátním* memory management modelem — **ownership** + **borrowing**. Žádný garbage collector, žádná manuální správa, ale **memory safety** zaručená *compile-time*. Od akademického roku **2026/27** zařazen do osnovy jako moderní alternativa k *čistě* funkcionálnímu Haskellu.

## Proč Rust ve výuce FP

Aktuální osnova (2026/27) představuje *více paradigmat*:

* **Lambda kalkul** — teoretický základ.
* **Haskell** — pure functional programming.
* **Rust** — *systémový jazyk s funkcionálními rysy* — ownership inspired by linear types, iterators, closures, pattern matching, ADTs (enum), traits (jako type classes).

Rust *spojuje* funkcionální koncepty s *imperativním* + *systémovým* programováním. Studenti se učí, že FP principy *nejsou* omezeny na čisté FP jazyky.

## Ownership

**Klíčový princip:** každá hodnota má *právě jednoho* vlastníka. Když vlastník opustí scope, hodnota je *automaticky* uvolněna.

### Příklady

```rust
fn main() {
    let s = String::from("hello");  // s owns "hello"
    // s je platná do konce scope
} // s opustí scope, "hello" je dropped (uvolněno)
```

### Move semantika

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1;  // s1 MOVED to s2
    
    // println!("{}", s1);  // ERROR: s1 was moved
    println!("{}", s2);   // OK
}
```

Po `let s2 = s1` přestává `s1` být platné. Toto je *fundamental difference* oproti C++ (copy by default) nebo Java/Python (reference semantics).

### Copy types

Pro malé typy (Int, Bool, Char) je *implicitní copy*:

```rust
fn main() {
    let x = 5;
    let y = x;  // COPY (Int implements Copy)
    
    println!("x = {}, y = {}", x, y);  // both OK
}
```

Typy s `Copy` trait: `i32`, `f64`, `bool`, `char`, tuples of Copy types, fixed arrays.

Typy *bez* `Copy`: `String`, `Vec<T>`, `Box<T>`, `Rc<T>`, user types (unless derived `Copy`).

### Předávání funkci

```rust
fn take_ownership(s: String) {  // s moves in
    println!("{}", s);
}  // s dropped here

fn main() {
    let s = String::from("hello");
    take_ownership(s);
    // println!("{}", s);  // ERROR: s was moved
}
```

### Návrat z funkce

```rust
fn create_string() -> String {
    let s = String::from("created");
    s  // s moves out, ownership transferred to caller
}

fn main() {
    let s = create_string();  // s now owns the value
    println!("{}", s);
}
```

## Borrowing

**Problém:** ownership má issue — předáním do funkce *ztratíme* hodnotu. **Řešení:** *borrowing* — předat *referenci* místo vlastnictví.

### Immutable references (&T)

```rust
fn calculate_length(s: &String) -> usize {  // borrow
    s.len()
}  // s opustí scope, but referenced value NOT dropped

fn main() {
    let s = String::from("hello");
    let len = calculate_length(&s);  // pass reference
    println!("len = {}", len);
    println!("s = {}", s);  // OK, s still valid
}
```

### Mutable references (&mut T)

```rust
fn change(s: &mut String) {
    s.push_str(", world");
}

fn main() {
    let mut s = String::from("hello");
    change(&mut s);
    println!("{}", s);  // "hello, world"
}
```

### Borrowing rules

**Klíčová pravidla** (compile-time enforced):

1. **Either** *one* mutable reference, **or** *any number* of immutable references — but **not both**.
2. References must **always be valid** (no dangling pointers).

::: viz ownership-flow "Krok-po-kroku scénáře move / copy / borrow / drop; vidíte stav obou bindingů + borrow checker chybu."
:::

```rust
// OK
let s = String::from("hi");
let r1 = &s;
let r2 = &s;
let r3 = &s;  // many readers OK
println!("{} {} {}", r1, r2, r3);

// OK
let mut s = String::from("hi");
let r1 = &mut s;
// let r2 = &mut s;  // ERROR: cannot have two mutable
r1.push_str("!");
println!("{}", r1);

// ERROR
let mut s = String::from("hi");
let r1 = &s;
let r2 = &mut s;  // ERROR: cannot have mutable when immutable exists
println!("{} {}", r1, r2);
```

### Lifetime — preview

Borrows mají *lifetime*:

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

Detailněji v [[rust-lifetimes]].

## String vs. &str

Dva základní string typy:

```rust
// String — owned, heap-allocated
let s: String = String::from("hello");
let s: String = "hello".to_string();

// &str — borrowed, slice
let s: &str = "hello";  // string literal, static
let s: &str = &String::from("hello");  // borrow of String
```

* `String` je *owned* — má lifetime, modifikovatelná.
* `&str` je *borrowed* — read-only, lifetime musí být validní.

Pravidlo: **functions take `&str` parameter**, pokud nepotřebujete ownership:

```rust
fn greet(name: &str) {  // accepts &str AND &String (auto-coerced)
    println!("Hello, {}!", name);
}

fn main() {
    greet("Alice");  // string literal
    let s = String::from("Bob");
    greet(&s);  // borrow String
}
```

## Slices

Reference na *část* hodnoty:

```rust
let s = String::from("hello world");
let hello = &s[0..5];   // "hello"
let world = &s[6..11];  // "world"

let nums = vec![1, 2, 3, 4, 5];
let first_two: &[i32] = &nums[0..2];  // [1, 2]
```

Slices jsou *fat pointers* — pointer + length.

## Cleanup

### Drop trait

Když ownership opouští scope, `drop` se volá automaticky:

```rust
struct Resource {
    name: String,
}

impl Drop for Resource {
    fn drop(&mut self) {
        println!("Dropping {}", self.name);
    }
}

fn main() {
    let r = Resource { name: String::from("resource1") };
    println!("Created");
}  // "Dropping resource1" printed here
```

### RAII

**Resource Acquisition Is Initialization** — Rust ho vynucuje:

* File handles, network connections, mutex locks — *vše* používá RAII.
* No `try-finally`, no explicit `close()`.
* Resource je *guaranteed* uvolněn, even on panic.

## Smart pointers

### Box<T>

Heap allocation:

```rust
let b = Box::new(42);  // i32 on heap
println!("{}", *b);  // dereference: 42
```

### Rc<T> — reference counting

```rust
use std::rc::Rc;

let a = Rc::new(String::from("shared"));
let b = Rc::clone(&a);
let c = Rc::clone(&a);
// reference count = 3
// String dropped when last Rc dropped
```

Used for *shared ownership*, single-threaded.

### Arc<T> — atomic reference counting

```rust
use std::sync::Arc;

let a = Arc::new(String::from("shared"));
// Like Rc but thread-safe (atomic ops)
```

### RefCell<T> — interior mutability

```rust
use std::cell::RefCell;

let data = RefCell::new(5);
*data.borrow_mut() += 10;  // mutate through &
println!("{}", *data.borrow());  // 15
```

Allows mutation through `&` reference; *runtime* check (not compile-time).

::: viz smart-pointer-graph "Box / Rc / Arc / RefCell + Rc<RefCell<T>> jako grafy s refcounty; vyberte typ scénáře."
:::

## Move closures

```rust
fn main() {
    let s = String::from("hello");
    
    // Move s into closure
    let f = move || println!("{}", s);
    
    // s is no longer accessible here
    // println!("{}", s);  // ERROR
    
    f();
}
```

`move` keyword *forces* capture by move.

## Common patterns

### Builder pattern

```rust
let config = ConfigBuilder::new()
    .port(8080)
    .host("localhost".to_string())
    .build();
```

### Newtype wrapper

```rust
struct UserId(u64);

let id = UserId(42);
let n = id.0;  // access inner
```

### Type alias

```rust
type Name = String;
type Result<T> = std::result::Result<T, MyError>;
```

## Memory safety

Rust *eliminuje* většinu memory bugs *compile-time*:

* **Use after free** — impossible (lifetime checking).
* **Double free** — impossible (single owner).
* **Dangling pointer** — impossible (lifetime checks).
* **Iterator invalidation** — impossible (borrowing rules).
* **Data race** — impossible (Send/Sync traits).

Bez performance overhead — všechno je *compile-time*.

## Trade-offs

### Pros

* **Memory safe** without GC.
* **Fast** (no runtime overhead).
* **Concurrent** (compile-time race prevention).
* **Modern features** — pattern matching, ADTs, traits.
* **Growing ecosystem** — cargo, crates.io.

### Cons

* **Steep learning curve** — ownership/lifetimes.
* **Compile times** — slower than C/Go.
* **Verbose** in some scenarios.
* **No "easy" mode** — must understand ownership.

## Srovnání s Haskell

| Aspect | Haskell | Rust |
| :--- | :--- | :--- |
| Paradigm | pure FP | multi-paradigm |
| Memory | GC | ownership |
| Types | static, inferred | static, inferred |
| Effects | monads | direct (with discipline) |
| Performance | good | excellent (~C) |
| Learning curve | steep (laziness, monads) | steep (ownership) |
| Use case | research, finance, compilers | systems, performance, infra |

Oba jazyky používají *type system* jako *primary* tool, ale s *odlišnými* prioritami.

## Příklad — kompletní program

```rust
use std::io::{self, BufRead};

fn main() {
    println!("Enter numbers (one per line, empty to finish):");
    
    let stdin = io::stdin();
    let mut numbers: Vec<i32> = Vec::new();
    
    for line in stdin.lock().lines() {
        let line = line.expect("Failed to read line");
        if line.is_empty() {
            break;
        }
        match line.parse::<i32>() {
            Ok(n) => numbers.push(n),
            Err(_) => eprintln!("Invalid number: {}", line),
        }
    }
    
    let sum: i32 = numbers.iter().sum();
    let avg = if numbers.is_empty() {
        0.0
    } else {
        sum as f64 / numbers.len() as f64
    };
    
    println!("Sum: {}", sum);
    println!("Average: {:.2}", avg);
}
```

## Trends 2025+

* **Rust 2024 edition** released.
* **Linux kernel** accepts Rust modules (2022+).
* **Windows, Android** integrating Rust.
* **WebAssembly** primary target.
* **Embedded** growing (RISC-V, ARM).
* **Async/await** for concurrency.

---

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Klabnik, S., Nichols, C.: *The Rust Programming Language* (2nd ed., No Starch Press 2023) — [doc.rust-lang.org/book/](https://doc.rust-lang.org/book/); Blandy, J., Orendorff, J., Tindall, L. F. S.: *Programming Rust* (2nd ed., O'Reilly 2021); Rust reference — [doc.rust-lang.org/reference/](https://doc.rust-lang.org/reference/); Rust by example — [doc.rust-lang.org/rust-by-example/](https://doc.rust-lang.org/rust-by-example/).*
