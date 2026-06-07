---
title: Rust — doby života (lifetimes)
---

# Rust — doby života (lifetimes)

**Doby života (lifetimes)** jsou klíčovou součástí Rustovského *borrow checkeru* (kontrolora vypůjčení) — *staticky* zajišťují, že žádná reference (reference) nikdy nepřežije data, na která odkazuje. Zapisují se jako `'a`, `'b`, `'static`. Kombinace vlastnictví ([[rust-ownership]]) a dob života je jedinečnou vlastností Rustu, která eliminuje neplatné ukazatele (dangling pointers) už při překladu (compile-time).

## Problém — neplatné reference (dangling references)

V jazycích C/C++:

```c
int* dangling_ref() {
    int x = 10;
    return &x;  // returns address of local var — UB!
}
```

V Rustu:

```rust
fn dangling_ref() -> &i32 {
    let x = 10;
    &x  // ERROR: missing lifetime, x doesn't live long enough
}
```

Borrow checker takový kód odmítne přeložit.

## Zápis dob života

```rust
&'a i32   // reference s lifetime 'a
&'a mut i32  // mutable reference s lifetime 'a
```

Typické doby života:
* `'a`, `'b` — generické (obecné) doby života.
* `'static` — trvá po celou dobu běhu programu.

## Doby života ve funkcích

Když funkce vrací referenci, *překladač (compiler) musí vědět*, ke *které* vstupní referenci je vázána:

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

* `<'a>` — deklaruje parametr doby života.
* `x: &'a str` — `x` má dobu života `'a`.
* `y: &'a str` — `y` má rovněž dobu života `'a`.
* Návratová hodnota `&'a str` — výstup žije alespoň po dobu `'a`.

::: viz lifetime-visualizer "Časová osa vazeb dob života; pohyb vypůjčení napříč rozsahy; viditelné konflikty měnitelných a neměnitelných referencí."
:::

### Vlastnost

Doba života výstupu = *kratší* ze vstupních dob života:

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

## Vynechávání dob života (lifetime elision)

U běžných případů *není* třeba dobu života psát explicitně — *překladač* ji odvodí sám:

### Pravidla vynechávání

1. *Každá vstupní* reference dostane *vlastní* parametr doby života.
2. Je-li *právě jedna* vstupní doba života, použije se jako doba života *výstupu*.
3. Je-li vstupů více, ale jeden z nich je `&self` nebo `&mut self`, použije se jako doba života výstupu doba života *self*.

### Příklad

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

Pokud vynechávání dobu života odvodit nedokáže, musíte ji uvést explicitně.

## Statická doba života (static lifetime)

`'static` znamená *celý život programu*:

```rust
let s: &'static str = "hello";  // string literal je 'static

// Lze deklarovat
const PI: f64 = 3.14159;  // 'static implicitly
static MAX: i32 = 1000;
```

## Doby života ve strukturách

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

## Omezení dob života (lifetime constraints)

### Více dob života (multiple lifetimes)

```rust
fn longest<'a, 'b>(x: &'a str, y: &'b str) -> &'a str {
    x  // returns x, so output is bound to 'a
}
```

### Meze dob života (lifetime bounds)

```rust
fn print<'a>(x: &'a str) where 'a: 'static {
    // x must live for 'static
}
```

### Podtypování (subtyping)

`'static : 'a` — `'static` je podtypem libovolné doby života.

```rust
fn takes_static<'a>(x: &'a str) {
    let static_str: &'static str = "I'm static";
    let _y: &'a str = static_str;  // 'static -> 'a OK
}
```

## Časté vzory (common patterns)

### Funkce vracející lokální hodnotu

Z funkce **nelze** vracet referenci na lokální proměnnou — viz „Časté chyby a jejich opravy" níže (`cannot return reference to local variable`); řešením je vrátit *vlastněný* (owned) typ.

### Struktura s referencí

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

### Generika s dobou života

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

## Trait bounds vyššího řádu (Higher-Ranked Trait Bounds, HRTB)

Pro uzávěry (closures) pracující s obecnými dobami života:

```rust
fn call_with_one<F>(f: F) -> i32
where
    F: for<'a> Fn(&'a i32) -> i32,
{
    f(&1)
}
```

`for<'a>` znamená „pro libovolnou dobu života `'a`".

## Časté chyby a jejich opravy

### „cannot return reference to local variable"

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

### „borrowed value does not live long enough"

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

### „cannot borrow as mutable"

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

## Nelexikální doby života (Non-Lexical Lifetimes, NLL)

Moderní Rust (verze 2018 a novější) má **NLL** — borrow checker je *chytřejší*:

```rust
let mut s = String::from("hello");
let r1 = &s;
println!("{}", r1);  // r1 ends here (last use)
let r2 = &mut s;  // OK now
println!("{}", r2);
```

Před zavedením NLL musela vypůjčení (borrows) žít *do konce* svého rozsahu (scope); nyní žijí jen *do posledního* použití.

::: viz nll-borrow "Tentýž kód před zavedením NLL a po něm — vidíte, kdy vypůjčení končí a kdy je měnitelné vypůjčení v pořádku."
:::

## Opětovné vypůjčení (reborrowing)

```rust
fn modify(x: &mut i32) {
    let y = &mut *x;  // reborrow: y is new mutable reference to *x
    *y += 1;
    // y ends here
    *x += 1;  // can use x again
}
```

## Doby života vs. vlastnictví

| | Vlastnictví (ownership) | Doby života (lifetimes) |
| :--- | :--- | :--- |
| Co sleduje | při překladu (compile-time) | při překladu (compile-time) |
| Princip | kdo hodnotu vlastní | jak dlouho reference žije |
| Chyba → | chyba při použití po přesunu (move-after-use) | chyba neplatné reference (dangling reference) |

Obojí Rustovský překladač *vynucuje staticky*.

## Doby života + generika + traity

Nejobecnější signatury:

```rust
fn parse<'input, T>(text: &'input str) -> Result<T, ParseError>
where
    T: std::str::FromStr,
    T::Err: Into<ParseError>,
{
    ...
}
```

## Zvláštnosti dob života

### `'static` neznamená nekonečno

```rust
let s: &'static str = "hello";  // string literal
// s lives forever (in static memory)
```

### Implicitní `'static`

```rust
const PI: f64 = 3.14;  // 'static implicit
static MUTEX: Mutex<i32> = Mutex::new(0);  // 'static implicit
```

### Doba života trait objektu

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

Doby života umožňují *bezpečné* sdílení dat *bez garbage collectoru (GC)*:

* **Iterátory (iterators)** — efektivní líné procházení (lazy traversal).
* **Řezy (slices)** — pohled do dat s nulovou režií (zero-cost view).
* **Async/await** — vypůjčení napříč body `.await`.
* **Databázová spojení, popisovače souborů (file handles)** — RAII se sdíleným přístupem.

> „Anotace dob života nemění, jak dlouho která z referencí žije. Spíše popisují vztahy mezi dobami života několika referencí." — The Rust Book.

## Osvědčené postupy

1. **Nechte překladač odvozovat**, kdykoli to jde (pravidla vynechávání).
2. **Používejte `'a`, `'b`** pro krátké zápisy, **`'input`** nebo popisné názvy pro lepší srozumitelnost.
3. **Vyhněte se `'static`** u hodnot, které nejsou literály; dejte přednost konkrétním dobám života.
4. **Použijte vlastněné (owned) typy**, když se složité doby života příliš zamotají.
5. **Spolehněte se na překladač** — borrow checker hlásí chyby dob života i vypůjčení už *při překladu (compile-time)* (nezávisle na režimu debug/release); nechte se vést nástrojem `cargo check`.

---

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Klabnik, S., Nichols, C.: *The Rust Programming Language* (2nd ed., No Starch Press 2023), kap. 10 — [doc.rust-lang.org/book/ch10-03-lifetime-syntax.html](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html); Rust reference — lifetime annotations; Rustonomicon — *advanced* lifetimes — [doc.rust-lang.org/nomicon/](https://doc.rust-lang.org/nomicon/).*
