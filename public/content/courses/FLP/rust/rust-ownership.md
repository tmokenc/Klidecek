---
title: Rust — vlastnictví a vypůjčování
---

# Rust — vlastnictví a vypůjčování

**Rust** je *moderní systémový jazyk* (Mozilla 2010+, Rust Foundation 2021+) s *unikátním* modelem správy paměti — **vlastnictvím (ownership)** a **vypůjčováním (borrowing)**. Nemá garbage collector ani manuální správu paměti, a přesto je **bezpečnost paměti (memory safety)** zaručena už při překladu (compile-time). Od akademického roku **2026/27** je zařazen do osnovy jako moderní alternativa k *čistě* funkcionálnímu Haskellu.

## Proč Rust ve výuce funkcionálního programování

Aktuální osnova (2026/27) představuje *více paradigmat*:

* **Lambda kalkul** — teoretický základ.
* **Haskell** — čisté funkcionální programování (pure functional programming).
* **Rust** — *systémový jazyk s funkcionálními rysy*. Jeho vlastnictví je inspirováno lineárními typy, dále nabízí iterátory, uzávěry (closures), porovnávání vzorů (pattern matching), algebraické datové typy ADT (enum) a traity (trait), které fungují podobně jako typové třídy (type classes).

Rust *spojuje* funkcionální koncepty s *imperativním* a *systémovým* programováním. Studenti se na něm učí, že principy funkcionálního programování *nejsou* omezeny jen na čistě funkcionální jazyky.

## Vlastnictví (ownership)

**Klíčový princip:** každá hodnota má *právě jednoho* vlastníka. Když vlastník opustí svůj rozsah platnosti (scope), je hodnota *automaticky* uvolněna.

### Příklady

```rust
fn main() {
    let s = String::from("hello");  // s owns "hello"
    // s je platná do konce scope
} // s opustí scope, "hello" je dropped (uvolněno)
```

### Sémantika přesunu (move)

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1;  // s1 MOVED to s2
    
    // println!("{}", s1);  // ERROR: s1 was moved
    println!("{}", s2);   // OK
}
```

Po `let s2 = s1` přestává být `s1` platné — hodnota se přesune (move) do `s2`. To je *zásadní rozdíl* oproti C++ (kde se hodnota implicitně kopíruje) nebo Javě či Pythonu (kde se pracuje s referenční sémantikou).

### Typy s implicitní kopií (Copy)

Pro malé typy (Int, Bool, Char) probíhá *implicitní kopie*:

```rust
fn main() {
    let x = 5;
    let y = x;  // COPY (Int implements Copy)
    
    println!("x = {}, y = {}", x, y);  // both OK
}
```

Typy s traitem `Copy`: `i32`, `f64`, `bool`, `char`, n-tice (tuples) složené z Copy typů a pole pevné velikosti.

Typy *bez* `Copy`: `String`, `Vec<T>`, `Box<T>`, `Rc<T>` a uživatelské typy (pokud pro ně `Copy` výslovně neodvodíme).

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

## Vypůjčování (borrowing)

**Problém:** vlastnictví má jednu nevýhodu — předáním hodnoty do funkce o ni *přijdeme*. **Řešení:** *vypůjčování (borrowing)* — místo vlastnictví předáme *referenci*.

### Neměnné reference (&T)

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

### Měnitelné reference (&mut T)

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

### Pravidla vypůjčování

**Klíčová pravidla** (vynucená při překladu):

1. **Buď** *jedna* měnitelná reference, **nebo** *libovolný počet* neměnných referencí — ale **nikdy obojí zároveň**.
2. Reference musí být **vždy platná** (žádné visící ukazatele, dangling pointers).

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

### Doba života (lifetime) — náhled

Vypůjčky mají svou *dobu života (lifetime)* — interval, po který musí být reference platná:

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

Podrobněji v [[rust-lifetimes]].

## String vs. &str

Existují dva základní řetězcové typy:

```rust
// String — owned, heap-allocated
let s: String = String::from("hello");
let s: String = "hello".to_string();

// &str — borrowed, slice
let s: &str = "hello";  // string literal, static
let s: &str = &String::from("hello");  // borrow of String
```

* `String` je *vlastněný (owned)* — má dobu života a lze ho měnit.
* `&str` je *vypůjčený (borrowed)* — je pouze pro čtení a jeho doba života musí být platná.

Pravidlo: **funkce přijímají parametr typu `&str`**, pokud nepotřebují vlastnictví:

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

## Řezy (slices)

Reference na *část* hodnoty:

```rust
let s = String::from("hello world");
let hello = &s[0..5];   // "hello"
let world = &s[6..11];  // "world"

let nums = vec![1, 2, 3, 4, 5];
let first_two: &[i32] = &nums[0..2];  // [1, 2]
```

Řezy jsou *tlusté ukazatele (fat pointers)* — obsahují ukazatel (pointer) i délku.

## Uvolňování zdrojů (cleanup)

### Trait Drop

Když vlastnictví opouští rozsah platnosti, automaticky se volá metoda `drop`:

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

**Resource Acquisition Is Initialization** (získání zdroje je inicializace) — Rust tento princip vynucuje:

* Souborové popisovače (file handles), síťová spojení i zámky mutexu — *vše* využívá RAII.
* Žádné `try-finally`, žádné explicitní `close()`.
* Zdroj je *zaručeně* uvolněn, a to i při panice (panic).

## Chytré ukazatele (smart pointers)

### Box<T>

Alokace na haldě (heap):

```rust
let b = Box::new(42);  // i32 on heap
println!("{}", *b);  // dereference: 42
```

### Rc<T> — počítání referencí (reference counting)

```rust
use std::rc::Rc;

let a = Rc::new(String::from("shared"));
let b = Rc::clone(&a);
let c = Rc::clone(&a);
// reference count = 3
// String dropped when last Rc dropped
```

Používá se pro *sdílené vlastnictví* v jednovláknovém prostředí.

### Arc<T> — atomické počítání referencí

```rust
use std::sync::Arc;

let a = Arc::new(String::from("shared"));
// Like Rc but thread-safe (atomic ops)
```

Funguje stejně jako `Rc`, ale je bezpečný pro práci ve více vláknech (thread), protože používá atomické operace.

### RefCell<T> — vnitřní měnitelnost (interior mutability)

```rust
use std::cell::RefCell;

let data = RefCell::new(5);
*data.borrow_mut() += 10;  // mutate through &
println!("{}", *data.borrow());  // 15
```

Umožňuje měnit hodnotu skrze referenci `&`. Kontrola pravidel zde probíhá *za běhu (runtime)*, nikoli při překladu.

::: viz smart-pointer-graph "Box / Rc / Arc / RefCell + Rc<RefCell<T>> jako grafy s refcounty; vyberte typ scénáře."
:::

## Přesouvací uzávěry (move closures)

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

Klíčové slovo `move` *vynutí* zachycení proměnné přesunem (move).

## Běžné návrhové vzory (common patterns)

### Vzor builder

```rust
let config = ConfigBuilder::new()
    .port(8080)
    .host("localhost".to_string())
    .build();
```

### Obal newtype

```rust
struct UserId(u64);

let id = UserId(42);
let n = id.0;  // access inner
```

### Typový alias

```rust
type Name = String;
type Result<T> = std::result::Result<T, MyError>;
```

## Bezpečnost paměti (memory safety)

Rust *eliminuje* většinu chyb práce s pamětí už *při překladu*:

* **Použití po uvolnění (use after free)** — nemožné (kontrola doby života).
* **Dvojí uvolnění (double free)** — nemožné (právě jeden vlastník).
* **Visící ukazatel (dangling pointer)** — nemožné (kontrola doby života).
* **Invalidace iterátoru (iterator invalidation)** — nemožné (pravidla vypůjčování).
* **Souběh dat (data race)** — nemožné (traity Send/Sync).

A to vše bez dopadu na výkon (performance) — všechny kontroly probíhají *při překladu*.

## Klady a zápory (trade-offs)

### Klady

* **Bezpečná práce s pamětí** bez garbage collectoru.
* **Rychlost** (žádná režie za běhu).
* **Souběžnost** (prevence souběhů dat už při překladu).
* **Moderní vlastnosti** — porovnávání vzorů, algebraické datové typy, traity.
* **Rostoucí ekosystém** — cargo, crates.io.

### Zápory

* **Strmá křivka učení** — vlastnictví a doby života.
* **Doba překladu** — pomalejší než u C nebo Go.
* **Upovídanost** v některých situacích.
* **Žádný „jednoduchý" režim** — vlastnictví je nutné pochopit.

## Srovnání s Haskellem

| Hledisko | Haskell | Rust |
| :--- | :--- | :--- |
| Paradigma | čisté FP | více paradigmat |
| Paměť | garbage collector | vlastnictví |
| Typy | statické, odvozované | statické, odvozované |
| Efekty | monády | přímo (s patřičnou disciplínou) |
| Výkon | dobrý | vynikající (~C) |
| Křivka učení | strmá (lenost, monády) | strmá (vlastnictví) |
| Typické nasazení | výzkum, finance, překladače | systémy, výkon, infrastruktura |

Oba jazyky používají *typový systém* jako svůj *hlavní* nástroj, ale s *odlišnými* prioritami.

## Příklad — kompletní program {tier=example}

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

## Trendy 2025+

* **Vydání edice Rust 2024.**
* **Linuxové jádro** přijímá moduly v Rustu (od roku 2022).
* **Windows a Android** integrují Rust.
* **WebAssembly** jako hlavní cílová platforma.
* **Vestavěné systémy (embedded)** — rostoucí oblast (RISC-V, ARM).
* **Async/await** pro souběžnost.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=5C_HPTJg5ek" "Rust in 100 Seconds" "Fireship"
:::

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Klabnik, S., Nichols, C.: *The Rust Programming Language* (2nd ed., No Starch Press 2023) — [doc.rust-lang.org/book/](https://doc.rust-lang.org/book/); Blandy, J., Orendorff, J., Tindall, L. F. S.: *Programming Rust* (2nd ed., O'Reilly 2021); Rust reference — [doc.rust-lang.org/reference/](https://doc.rust-lang.org/reference/); Rust by example — [doc.rust-lang.org/rust-by-example/](https://doc.rust-lang.org/rust-by-example/).*
