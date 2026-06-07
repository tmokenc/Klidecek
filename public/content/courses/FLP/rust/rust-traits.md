---
title: Rust — Traity a generika
---

# Rust — Traity a generika

**Traity** jsou v Rustu obdobou typových tříd (type classes) z Haskellu ([[type-classes]]) — definují rozhraní (interface), které typy mohou implementovat. Rozhraní je tu míněno jako soupis metod, jež daný typ musí poskytnout. Spolu s **generikou** umožňují parametrický i ad-hoc polymorfismus (polymorphism) už při překladu (compile-time), a to jako abstrakci s nulovou cenou (zero-cost abstrakce) — tedy bez jakékoli režie navíc za běhu.

## Definice traitu

```rust
trait Greet {
    fn say_hello(&self);  // method signature
    
    // Default implementation
    fn say_goodbye(&self) {
        println!("Goodbye!");
    }
}
```

## Implementace

```rust
struct Person {
    name: String,
}

impl Greet for Person {
    fn say_hello(&self) {
        println!("Hello, I'm {}!", self.name);
    }
    // say_goodbye uses default
}

fn main() {
    let alice = Person { name: String::from("Alice") };
    alice.say_hello();   // "Hello, I'm Alice!"
    alice.say_goodbye(); // "Goodbye!"
}
```

## Standardní traity

### Display, Debug

```rust
use std::fmt;

struct Point {
    x: f64,
    y: f64,
}

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

impl fmt::Debug for Point {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Point {{ x: {}, y: {} }}", self.x, self.y)
    }
}

let p = Point { x: 1.0, y: 2.0 };
println!("{}", p);   // (1, 2)
println!("{:?}", p); // Point { x: 1, y: 2 }
```

### Clone, Copy

```rust
#[derive(Clone)]
struct ExpensiveData {
    bytes: Vec<u8>,
}

// Clone — explicit duplicate
let a = ExpensiveData { bytes: vec![1, 2, 3] };
let b = a.clone();

// Copy — implicit on assignment (for simple types)
#[derive(Copy, Clone)]
struct Point { x: i32, y: i32 }

let p1 = Point { x: 1, y: 2 };
let p2 = p1;  // automatic copy
println!("{} {}", p1.x, p2.x);  // both valid
```

### PartialEq, Eq

```rust
#[derive(PartialEq, Eq)]
struct Tag(String);

let a = Tag(String::from("hello"));
let b = Tag(String::from("hello"));
assert!(a == b);
```

### PartialOrd, Ord

```rust
#[derive(PartialEq, Eq, PartialOrd, Ord)]
struct Priority(u32);

let p1 = Priority(5);
let p2 = Priority(10);
assert!(p1 < p2);
```

### Default

```rust
#[derive(Default)]
struct Config {
    port: u16,
    host: String,
}

let cfg = Config::default();  // Config { port: 0, host: "" }
```

### Iterator

```rust
struct Fibonacci {
    a: u64,
    b: u64,
}

impl Iterator for Fibonacci {
    type Item = u64;
    
    fn next(&mut self) -> Option<u64> {
        let result = self.a;
        let next = self.a + self.b;
        self.a = self.b;
        self.b = next;
        Some(result)
    }
}

fn main() {
    let fib = Fibonacci { a: 0, b: 1 };
    let first10: Vec<u64> = fib.take(10).collect();
    println!("{:?}", first10);  // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
}
```

## Generika

### Generické funkce

```rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

fn main() {
    let numbers = vec![10, 25, 5, 100, 50];
    println!("Largest: {}", largest(&numbers));  // 100
    
    let chars = vec!['a', 'z', 'm', 'b'];
    println!("Largest: {}", largest(&chars));  // 'z'
}
```

### Generické struktury

```rust
struct Pair<T, U> {
    first: T,
    second: U,
}

impl<T: std::fmt::Display, U: std::fmt::Display> Pair<T, U> {
    fn print(&self) {
        println!("({}, {})", self.first, self.second);
    }
}

fn main() {
    let p = Pair { first: 1, second: "hello" };
    p.print();
}
```

### Generické výčtové typy

```rust
enum Option<T> {
    Some(T),
    None,
}

enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

## Omezení traitem (trait bounds)

Omezení traitem říká, že generický typ musí implementovat určitý trait — díky tomu uvnitř funkce smíme používat jeho metody.

### Jediné omezení

```rust
fn print_all<T: std::fmt::Display>(items: &[T]) {
    for item in items {
        println!("{}", item);
    }
}
```

### Více omezení

```rust
fn process<T: Clone + std::fmt::Debug>(x: T) -> T {
    println!("{:?}", x);
    x.clone()
}
```

### Klauzule `where` (přehlednější u složitějších případů)

```rust
fn process<T, U>(x: T, y: U) -> String
where
    T: std::fmt::Display + Clone,
    U: std::fmt::Debug + Default,
{
    format!("{} {:?}", x, y)
}
```

### `impl Trait` (návratový typ)

```rust
fn make_adder(n: i32) -> impl Fn(i32) -> i32 {
    move |x| x + n
}

let add5 = make_adder(5);
println!("{}", add5(3));  // 8
```

## Trait objekty (dynamický dispatch)

### dyn Trait

```rust
trait Animal {
    fn sound(&self);
}

struct Dog;
struct Cat;

impl Animal for Dog {
    fn sound(&self) { println!("Woof!"); }
}

impl Animal for Cat {
    fn sound(&self) { println!("Meow!"); }
}

fn main() {
    let animals: Vec<Box<dyn Animal>> = vec![
        Box::new(Dog),
        Box::new(Cat),
    ];
    
    for a in &animals {
        a.sound();  // dynamic dispatch
    }
}
```

* `Box<dyn Animal>` — ukazatel (pointer) plus tabulka virtuálních metod (vtable).
* Výběr volané metody probíhá až za běhu (runtime), což je pomalejší než u generik.
* **Smazaný typ** (erased type) — konkrétní typ se ztrácí, což se hodí pro heterogenní kolekce (kolekce míchající různé typy).

### Generika vs. dyn

```rust
// Generic — monomorphization (compile-time dispatch)
fn process<T: Animal>(a: &T) {
    a.sound();
}

// Trait object — dynamic dispatch
fn process(a: &dyn Animal) {
    a.sound();
}
```

* **Generika:** nulová režie, ale větší výsledný binární soubor (vznikne jedna kopie funkce pro každý typ).
* **dyn:** režie za běhu, zato menší binární soubor.

::: viz trait-monomorphization "Generic monomorfizace vs dyn vtable; vizualizace, kolik kopií funkce, kde je dispatch."
:::

## Asociované typy (associated types)

```rust
trait Iterator {
    type Item;  // associated type
    fn next(&mut self) -> Option<Self::Item>;
}

impl Iterator for Counter {
    type Item = u32;  // specify
    fn next(&mut self) -> Option<u32> {
        // ...
    }
}
```

Jsou alternativou ke generickému parametru — na jednu implementaci připadá právě jeden asociovaný typ.

## Omezení traitem vyššího řádu (HRTB)

```rust
fn apply<F: for<'a> Fn(&'a i32) -> i32>(f: F, x: i32) -> i32 {
    f(&x)
}
```

Zápis `for<'a>` znamená „pro libovolnou dobu života (lifetime) 'a".

## Přetěžování operátorů

Operátory jsou traity:

```rust
use std::ops::Add;

#[derive(Clone, Copy)]
struct Point { x: f64, y: f64 }

impl Add for Point {
    type Output = Point;
    fn add(self, other: Point) -> Point {
        Point { x: self.x + other.x, y: self.y + other.y }
    }
}

let p1 = Point { x: 1.0, y: 2.0 };
let p2 = Point { x: 3.0, y: 4.0 };
let p3 = p1 + p2;  // Point { x: 4.0, y: 6.0 }
```

Další operátory: `Sub`, `Mul`, `Div`, `Index`, `IndexMut`, `Deref` a podobně.

## Vzor iterátoru

Mocný styl v duchu funkcí vyššího řádu (higher-order function):

```rust
let v = vec![1, 2, 3, 4, 5];

let sum: i32 = v.iter().sum();        // 15
let doubled: Vec<i32> = v.iter().map(|x| x * 2).collect();  // [2, 4, 6, 8, 10]
let evens: Vec<&i32> = v.iter().filter(|&&x| x % 2 == 0).collect();  // [&2, &4]

let result: Vec<i32> = v.iter()
    .filter(|&&x| x > 2)
    .map(|x| x * x)
    .take(3)
    .collect();
// [9, 16, 25]
```

**Funkcionální styl** je v Rustu vlastní jádru jazyka.

::: viz rust-iterator-chain "Krok-po-kroku pull jednoho prvku přes filter/map/take; vidíte, že žádný mezikrok nealokuje."
:::

## Uzávěry (closures)

```rust
let add = |a: i32, b: i32| a + b;
println!("{}", add(2, 3));  // 5

// Type inference
let multiplier = |x| x * 2;
println!("{}", multiplier(5));  // 10

// Capture environment
let n = 10;
let add_n = |x| x + n;
println!("{}", add_n(5));  // 15
```

Traity uzávěrů:
* **Fn** — neměnné vypůjčení (borrowing) okolního prostředí.
* **FnMut** — měnitelné vypůjčení.
* **FnOnce** — přebírá vlastnictví (ownership).

::: viz closure-capture-modes "Vyberte Fn / FnMut / FnOnce; vidíte, co se captures a kolikrát lze volat."
:::

## Dědičnost traitů

```rust
trait Greet {
    fn say_hello(&self);
}

trait FormalGreet: Greet {  // requires Greet
    fn formal_greeting(&self) {
        self.say_hello();
        println!("It is a pleasure to meet you.");
    }
}
```

## Plošné implementace (blanket implementations)

Umožňují implementovat trait pro mnoho typů najednou:

```rust
impl<T: Display> ToString for T {
    fn to_string(&self) -> String {
        format!("{}", self)
    }
}
```

Standardní knihovna tento postup hojně využívá.

## Značkovací traity (marker traits)

* **Copy** — automatické kopírování (sémantika kopie).
* **Sized** — velikost typu je známá už při překladu (compile-time).
* **Send** — typ je bezpečné přenést mezi vlákny (thread).
* **Sync** — typ je bezpečné sdílet mezi vlákny.

```rust
fn process<T: Send + Sync>(t: T) { ... }  // thread-safe types
```

## Příklad — řazení {tier=example}

```rust
use std::cmp::Ordering;

struct Person {
    name: String,
    age: u32,
}

impl Person {
    fn cmp_by_age(&self, other: &Person) -> Ordering {
        self.age.cmp(&other.age)
    }
}

fn main() {
    let mut people = vec![
        Person { name: "Alice".to_string(), age: 30 },
        Person { name: "Bob".to_string(), age: 25 },
        Person { name: "Charlie".to_string(), age: 35 },
    ];
    
    people.sort_by(|a, b| a.cmp_by_age(b));
    
    for p in &people {
        println!("{}: {}", p.name, p.age);
    }
}
```

## Klíčové rozdíly oproti Haskellu

| Hledisko | Haskell | Rust |
| :--- | :--- | :--- |
| Typová třída | Eq, Ord, Show | trait |
| Generika | parametrický polymorfismus | generika + omezení traitem |
| Dispatch | předávání slovníku | monomorfizace NEBO dyn |
| Vyšší kindy | ano | ne (existují náhradní řešení) |
| Koherence | globální | pravidla pro cizí implementace (orphan rules) |

Rust některé vlastnosti **omezuje** (žádné typy vyššího kindu, HKT) výměnou za předvídatelný překlad a správu paměti.

::: viz rust-vs-haskell "Side-by-side quicksort / fib / map v Haskellu vs Rustu; klíčové rozdíly anotovány."
:::

## Trendy

* **GATs** (generické asociované typy) — stabilizováno v roce 2022.
* **Asynchronní traity** — stabilizováno v roce 2023.
* **Specializace** — ve vývoji.
* **`impl Trait` v návratové pozici** — vylepšeno v roce 2024.

---

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Klabnik, S., Nichols, C.: *The Rust Programming Language* (2nd ed., No Starch Press 2023), kap. 10, 17 — [doc.rust-lang.org/book/](https://doc.rust-lang.org/book/); Rust API guidelines — [rust-lang.github.io/api-guidelines/](https://rust-lang.github.io/api-guidelines/); Rust by example — [doc.rust-lang.org/rust-by-example/](https://doc.rust-lang.org/rust-by-example/).*
