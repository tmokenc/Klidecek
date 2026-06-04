---
title: Beta redukce a Y kombinátor
---

# Beta redukce a Y kombinátor

**Beta redukce** ($\beta$-redukce) je *hlavní* výpočetní pravidlo lambda kalkulu — *aplikuje* funkci na argument substitucí. **Y kombinátor** umožňuje *rekurzi* bez explicitního pojmenování — je *fixed-point combinator*. Spolu tvoří jádro výpočetní moci λ-kalkulu.

## Beta redukce

Klíčové výpočetní pravidlo:

::: math
(\lambda x.\ E)\ E' \to_\beta E[x \to E']
:::

Aplikace abstrakce $\lambda x.\ E$ na argument $E'$ se *redukuje* na *tělo* $E$ s nahrazením všech volných výskytů $x$ za $E'$.

### Příklady

* $(\lambda x.\ x)\ y \to_\beta y$.
* $(\lambda x y.\ x)\ a\ b \to_\beta (\lambda y.\ a)\ b \to_\beta a$ — to je $K$ kombinátor.
* $(\lambda f.\ f\ f)\ (\lambda x.\ x) \to_\beta (\lambda x.\ x)\ (\lambda x.\ x) \to_\beta \lambda x.\ x$.

### Redex

**Redex** (reducible expression) = výraz formy $(\lambda x.\ E)\ E'$ — *kandidát* na β-redukci.

Výraz může mít **více** redexů; **strategie evaluace** určuje, který se redukuje první:

* **Normal order** (leftmost-outermost) — redukuj *nejvíc vnější* redex.
* **Applicative order** (leftmost-innermost) — redukuj *nejvíc vnitřní*.
* **Lazy** (call-by-need) — leftmost-outermost + sdílení (memoization).
* **Eager / strict** (call-by-value) — applicative order.

## Eta konverze

::: math
\lambda x.\ E\ x \equiv_\eta E \quad \text{kde } x \notin FV(E)
:::

Funkce, která jen aplikuje $E$ na svůj argument, *je* funkce $E$.

Praktický význam: **point-free style** — eliminace zbytečných argumentů. V Haskellu: `g x = f x` (kde `x` se na pravé straně už jinak nevyskytuje) lze zapsat bez argumentu jako `g = f` — to je právě $\lambda x.\ f\ x \equiv_\eta f$.

## Normální forma

**Normální forma** (NF) je výraz *bez* redexů — *nelze* dál redukovat.

* $\lambda x.\ x$ je NF.
* $\lambda x y.\ x$ je NF.
* $(\lambda x.\ x)\ y$ **není** NF — redukuje se na $y$.

### Church-Rosser theorem

> Pokud výraz má normální formu, je *jednoznačně určena* (nezávisle na strategii redukce). Pokud má více cest k NF, *konvergují* k téže NF.

Důsledek: výpočetní výsledek nezávisí na strategii.

::: viz church-rosser-converge "Stejný výraz redukovaný v normal vs applicative — konvergence k NF (nebo divergence u Ω)."
:::

### Termination

* Některé výrazy *nemají* NF — *non-terminating*.
* Příklad: $\Omega = (\lambda x.\ x\ x)\ (\lambda x.\ x\ x) \to_\beta (\lambda x.\ x\ x)\ (\lambda x.\ x\ x) \to_\beta \ldots$ — infinite loop.
* Toto je analogie *nekonečné* smyčky v jazycích.

## Y kombinátor

**Problém:** λ-výraz *sám sobě* jméno *nemá*. Jak udělat *rekurzi*?

**Řešení:** Y kombinátor — *fixed-point* combinator.

::: math
Y = \lambda f.\ (\lambda x.\ f\ (x\ x))\ (\lambda x.\ f\ (x\ x))
:::

### Vlastnost

::: math
Y\ f = f\ (Y\ f)
:::

Důkaz:

::: math
\begin{aligned}
Y\ f &= (\lambda f.\ (\lambda x.\ f\ (x\ x))\ (\lambda x.\ f\ (x\ x)))\ f \\
&= (\lambda x.\ f\ (x\ x))\ (\lambda x.\ f\ (x\ x)) \\
&= f\ ((\lambda x.\ f\ (x\ x))\ (\lambda x.\ f\ (x\ x))) \\
&= f\ (Y\ f)
\end{aligned}
:::

### Použití pro rekurzi

Chceme definovat factorial:

```
fact n = if n == 0 then 1 else n * fact (n-1)
```

V λ-kalkulu nemůžeme přímo — `fact` by se odkazoval sám na sebe. Místo toho:

```
fact_template = λ f n. if n == 0 then 1 else n * f (n-1)
fact = Y fact_template
```

`Y fact_template` = `fact_template (Y fact_template)` = `fact_template fact`.

Když aplikujeme `fact n`:
* If `n == 0`: returns 1.
* Else: returns `n * f (n-1)` = `n * fact (n-1)`.

Rekurze funguje!

::: viz y-combinator "Derivace Y g = g (Y g) krok po kroku + factorial via Y se stop na max depth."
:::

## Y kombinátor v typovaném světě

* **STLC** (Simply Typed λ-Calculus) **nemá** Y kombinátor — typový systém ho zakazuje (selfaplikace $x\ x$ není typovatelná).
* **Therefore** STLC je *strongly normalizing* (terminates always).
* **System F** ani System Fω také ne.
* **Pro rekurzi** v typovaných jazycích je třeba *přidat* explicitní fix-point operator (Haskell: `fix`).

## Fix kombinátor v Haskellu

```haskell
fix :: (a -> a) -> a
fix f = f (fix f)

factorial :: Int -> Int
factorial = fix (\f n -> if n == 0 then 1 else n * f (n-1))
```

## Other fixed-point combinators

Y není jediný:

* **Turing's Θ:** $\Theta = (\lambda x f.\ f\ (x\ x\ f))\ (\lambda x f.\ f\ (x\ x\ f))$.
* **Klop's $\Theta'$**.
* **Curry's Y** je nejznámější.

## Příklady redukce {tier=example}

### Booleans (Church encoding)

```
TRUE  = λ x y. x
FALSE = λ x y. y
IF    = λ c t e. c t e
```

Redukce:
* `IF TRUE a b` = `(λ c t e. c t e) TRUE a b` = `TRUE a b` = `(λ x y. x) a b` = `a`.

### Numerals (Church encoding)

Čísla jako $n \equiv \lambda f\ x.\ f^n(x)$ a successor `SUCC = λ n f x. f (n f x)` (vč. derivace `SUCC TWO = THREE`) viz [[church-enc]].

## Computational power

Lambda kalkul je **Turing-úplný**:

* Lze simulovat libovolný Turingův stroj.
* Lze počítat *libovolnou* computable funkci.
* Equivalent v silnosti s μ-recursive functions, register machines, Turingovými stroji.

**Church-Turing thesis:** všechny tyto modely výpočtu jsou *ekvivalentní*; co je computable v jednom, je v druhém.

## Praktická implementace

Modern functional language compilers:

1. **Parse** zdrojový kód → AST.
2. **Desugar** → core λ-kalkul (Haskell Core, ML CoreML).
3. **Type check** + inference.
4. **Optimize** (deforestation, fusion, strictness analysis).
5. **Compile** to bytecode / native code.

GHC's Core jazyk je **rozšířený typovaný λ-kalkul** s ADTs, case expressions, type lambdas.

## Performance

* **Naive** λ interpreter is slow.
* **Graph reduction** with sharing — exponential speedup.
* **STG machine** (Spineless Tagless G-machine) — modern Haskell evaluator.
* **Real-world Haskell:** competitive with C++ for many tasks.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=8Z_sosW2dgU" "SZZ : Lambda kalkul - úvod" "Tomáš Kocourek"
:::

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Barendregt, H. P.: *The Lambda Calculus* (Elsevier 1984); Hindley, J. R., Seldin, J. P.: *Lambda-Calculus and Combinators: An Introduction* (Cambridge 2008); Pierce, B. C.: *Types and Programming Languages* (MIT Press 2002), kap. 5; Church, A.: *An unsolvable problem of elementary number theory* (1936).*
