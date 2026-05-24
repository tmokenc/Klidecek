---
title: Rust — Lifetimes
---

# Rust — Lifetimes

**Lifetimes** jsou klíčová součást Rust *borrow checkeru* — *staticky* zajišťují, že reference nikdy nepřežijí svůj data. Pojmenovány jako lifetimes `'a`, `'b`, `'static`. Kombinace ownership ([[rust-ownership]]) + lifetimes je *unique* Rust feature, která eliminuje dangling pointers *compile-time*.

## Problém — dangling references

V C/C++:

```c
int* dangling_ref() {
    int x = 10;
    return &x;  // returns address of local var — UB!
}
```

V Rust:

```rust
fn dangling_ref() -> &i32 {
    let x = 10;
    &x  // ERROR: missing lifetime, x doesn't live long enough
}
```

Borrow checker odmítne kompilaci.

## Lifetime syntax

```rust
&'a i32   // reference s lifetime 'a
&'a mut i32  // mutable reference s lifetime 'a
```

Typical lifetimes:
* `'a`, `'b` — generic lifetimes.
* `'static` — lives for entire program.

## Lifetime v funkcích

Když funkce vrací referenci, *kompiler musí vědět*, k *které* vstupní referenci je vázána:

```rust
// ERROR — kompiler neví, jestli vrátí &x nebo &y
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() { x } else { y }
}

// OK s explicit lifetime
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

* `<'a>` — declares lifetime parameter.
* `x: &'a str` — x has lifetime 'a.
* `y: &'a str` — y also has lifetime 'a.
* Return `&'a str` — output lives at least 'a.

::: viz lifetime-visualizer "Časová osa lifetime bindingů; pohyb borrowů přes scope; mut/imm konflikty viditelné."
:::

### Vlastnost

Output lifetime = *kratší* z input lifetimes:

```rust
fn main() {
    let s1 = String::from("long string");
    let result;
    {
        let s2 = String::from("short");
        result = longest(s1.as_str(), s2.as_str());
        // result has lifetime of shorter (s2)
        println!("{}", result);  // OK, s2 still alive
    }
    // println!("{}", result);  // ERROR: s2 was dropped
}
```

## Lifetime elision

Pro běžné případy *není* třeba explicitně psát lifetime — *kompiler* je odvodí:

### Pravidla elision

1. *Each input* reference gets *own* lifetime parameter.
2. If *exactly one* input lifetime, it is *output* lifetime.
3. If multiple inputs, but `&self` or `&mut self`, lifetime of *self* is output.

### Example

```rust
// Original
fn first_word(s: &str) -> &str {
    ...
}

// Compiler infers
fn first_word<'a>(s: &'a str) -> &'a str {
    ...
}
```

```rust
impl Foo {
    fn method(&self, other: &str) -> &str {
        // self's lifetime used for output (rule 3)
    }
}
```

Pokud elision nemůže odvodit, musíte uvést explicitně.

## Static lifetime

`'static` znamená *celý život programu*:

```rust
let s: &'static str = "hello";  // string literal je 'static

// Lze deklarovat
const PI: f64 = 3.14159;  // 'static implicitly
static MAX: i32 = 1000;
```

## Lifetimes ve strukturách

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

impl<'a> ImportantExcerpt<'a> {
    fn level(&self) -> i32 {
        3
    }
    
    fn announce_and_return_part(&self, announcement: &str) -> &str {
        println!("Attention: {}", announcement);
        self.part  // returns reference with self's lifetime
    }
}

fn main() {
    let novel = String::from("Call me Ishmael...");
    let first_sentence = novel.split('.').next().unwrap();
    let i = ImportantExcerpt { part: first_sentence };
    
    println!("{}", i.announce_and_return_part("important!"));
}
```

Struktura `ImportantExcerpt<'a>` *nemůže přežít* hodnoty, na které `part` ukazuje.

## Lifetime constraints

### Multiple lifetimes

```rust
fn longest<'a, 'b>(x: &'a str, y: &'b str) -> &'a str {
    x  // returns x, so output is bound to 'a
}
```

### Lifetime bounds

```rust
fn print<'a>(x: &'a str) where 'a: 'static {
    // x must live for 'static
}
```

### Subtyping

`'static : 'a` — `'static` is subtype of any lifetime.

```rust
fn takes_static<'a>(x: &'a str) {
    let static_str: &'static str = "I'm static";
    let _y: &'a str = static_str;  // 'static -> 'a OK
}
```

## Common patterns

### Function returning local

**Cannot** return reference to local:

```rust
fn create_string() -> &str {  // ERROR
    let s = String::from("hello");
    &s
}
```

Solution: return *owned* type:

```rust
fn create_string() -> String {  // OK
    String::from("hello")
}
```

### Struct with reference

```rust
struct Parser<'input> {
    text: &'input str,
    position: usize,
}

impl<'input> Parser<'input> {
    fn new(text: &'input str) -> Self {
        Parser { text, position: 0 }
    }
}

fn main() {
    let input = String::from("hello world");
    let parser = Parser::new(&input);
    // parser cannot outlive input
}
```

### Generic with lifetime

```rust
fn longest_with_announcement<'a, T>(
    x: &'a str,
    y: &'a str,
    ann: T,
) -> &'a str
where
    T: std::fmt::Display,
{
    println!("Announcement: {}", ann);
    if x.len() > y.len() { x } else { y }
}
```

## Higher-Ranked Trait Bounds (HRTB)

For closures over generic lifetimes:

```rust
fn call_with_one<F>(f: F) -> i32
where
    F: for<'a> Fn(&'a i32) -> i32,
{
    f(&1)
}
```

`for<'a>` = "for any lifetime 'a".

## Common errors a fixes

### "cannot return reference to local variable"

```rust
// BAD
fn foo() -> &str {
    let s = String::from("hello");
    &s
}

// GOOD: return owned
fn foo() -> String {
    String::from("hello")
}
```

### "borrowed value does not live long enough"

```rust
// BAD
let r;
{
    let x = 5;
    r = &x;  // x dropped at end of block
}
println!("{}", r);  // ERROR

// GOOD: lifetime correct
let x = 5;
let r = &x;
println!("{}", r);
```

### "cannot borrow as mutable"

```rust
// BAD
let s = String::from("hello");
let r1 = &s;
let r2 = &mut s;  // ERROR: cannot have mut when imm exists
println!("{} {}", r1, r2);

// GOOD: separate scopes
let mut s = String::from("hello");
let r1 = &s;
println!("{}", r1);
// r1 ends here (NLL — non-lexical lifetimes)
let r2 = &mut s;
println!("{}", r2);
```

## Non-Lexical Lifetimes (NLL)

Modern Rust (2018+) has **NLL** — borrow checker je *smarter*:

```rust
let mut s = String::from("hello");
let r1 = &s;
println!("{}", r1);  // r1 ends here (last use)
let r2 = &mut s;  // OK now
println!("{}", r2);
```

Před NLL musely borrows žít *do konce* scope; nyní jen *do posledního* použití.

::: viz nll-borrow "Same code, before/after NLL — vidíte, kdy borrow končí a kdy je mut borrow OK."
:::

## Reborrowing

```rust
fn modify(x: &mut i32) {
    let y = &mut *x;  // reborrow: y is new mutable reference to *x
    *y += 1;
    // y ends here
    *x += 1;  // can use x again
}
```

## Lifetimes vs. ownership

| | Ownership | Lifetimes |
| :--- | :--- | :--- |
| Who tracks | runtime (in single-threaded model) | compile-time |
| Concept | who owns value | how long ref lives |
| Mistake → | move-after-use error | dangling reference error |

Both are *enforced statically* by Rust compiler.

## Lifetime + Generics + Traits

Most general signatures:

```rust
fn parse<'input, T>(text: &'input str) -> Result<T, ParseError>
where
    T: std::str::FromStr,
    T::Err: Into<ParseError>,
{
    ...
}
```

## Lifetime quirks

### 'static doesn't mean infinite

```rust
let s: &'static str = "hello";  // string literal
// s lives forever (in static memory)
```

### Implicit 'static

```rust
const PI: f64 = 3.14;  // 'static implicit
static MUTEX: Mutex<i32> = Mutex::new(0);  // 'static implicit
```

### Trait object lifetime

```rust
trait Draw {
    fn draw(&self);
}

fn draw_all(shapes: &[Box<dyn Draw + 'static>]) {
    // ...
}

// Or with 'a
fn draw_all<'a>(shapes: &[Box<dyn Draw + 'a>]) {
    // ...
}
```

## Praktický význam

Lifetimes umožňují *bezpečné* sdílení dat *bez GC*:

* **Iterators** — efficient lazy traversal.
* **Slices** — zero-cost view into data.
* **Async/await** — borrows across `.await` points.
* **Database connections, file handles** — RAII with shared access.

> "Lifetime annotations don't change how long any of the references live. Rather, they describe the relationships of the lifetimes of multiple references." — The Rust Book.

## Best practices

1. **Let compiler infer** when possible (elision rules).
2. **Use 'a, 'b** for short, **'input** or descriptive names for clarity.
3. **Avoid 'static** for non-literals; prefer specific lifetimes.
4. **Use owned types** when complex lifetimes get tangled.
5. **Test in debug mode** — borrow checker catches most issues.

---

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Klabnik, S., Nichols, C.: *The Rust Programming Language* (2nd ed., No Starch Press 2023), kap. 10 — [doc.rust-lang.org/book/ch10-03-lifetime-syntax.html](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html); Rust reference — lifetime annotations; Rustonomicon — *advanced* lifetimes — [doc.rust-lang.org/nomicon/](https://doc.rust-lang.org/nomicon/).*
