---
title: Beta redukce a Y kombinátor
---

# Beta redukce a Y kombinátor

**Beta redukce** ($\beta$-redukce) je *hlavní* výpočetní pravidlo lambda kalkulu — *aplikuje* funkci na argument pomocí substituce. **Y kombinátor** umožňuje *rekurzi (recursion)* bez explicitního pojmenování funkce — jde o tzv. kombinátor pevného bodu (fixed-point combinator). Společně tvoří jádro výpočetní moci λ-kalkulu.

## Beta redukce

Klíčové výpočetní pravidlo:

::: math
(\lambda x.\ E)\ E' \to_\beta E[x \to E']
:::

Aplikace abstrakce $\lambda x.\ E$ na argument $E'$ se *redukuje* na *tělo* $E$, v němž jsou všechny volné výskyty $x$ nahrazeny výrazem $E'$.

### Příklady

* $(\lambda x.\ x)\ y \to_\beta y$.
* $(\lambda x y.\ x)\ a\ b \to_\beta (\lambda y.\ a)\ b \to_\beta a$ — to je $K$ kombinátor.
* $(\lambda f.\ f\ f)\ (\lambda x.\ x) \to_\beta (\lambda x.\ x)\ (\lambda x.\ x) \to_\beta \lambda x.\ x$.

### Redex

**Redex** (reducible expression, tj. redukovatelný výraz) je výraz tvaru $(\lambda x.\ E)\ E'$ — *kandidát* na β-redukci.

Výraz může mít **více** redexů; o tom, který se redukuje první, rozhoduje **strategie vyhodnocování (evaluation strategy)**:

* **Normální pořadí** (normal order, leftmost-outermost) — redukuj *nejvíce vnější* redex.
* **Aplikační pořadí** (applicative order, leftmost-innermost) — redukuj *nejvíce vnitřní* redex.
* **Líné vyhodnocování (lazy evaluation, call-by-need)** — leftmost-outermost se sdílením výsledků (memoizace).
* **Striktní vyhodnocování (eager / strict, call-by-value)** — aplikační pořadí.

## Eta konverze

::: math
\lambda x.\ E\ x \equiv_\eta E \quad \text{kde } x \notin FV(E)
:::

Funkce, která jen aplikuje $E$ na svůj argument, *je* totéž co funkce $E$.

Praktický význam: **bezbodový styl (point-free style)** — odstranění zbytečných argumentů. V Haskellu: zápis `g x = f x` (kde `x` se na pravé straně už jinak nevyskytuje) lze přepsat bez argumentu jako `g = f` — to je právě $\lambda x.\ f\ x \equiv_\eta f$.

## Normální forma

**Normální forma** (NF) je výraz *bez* redexů — *nelze* jej už dál redukovat.

* $\lambda x.\ x$ je NF.
* $\lambda x y.\ x$ je NF.
* $(\lambda x.\ x)\ y$ **není** NF — redukuje se na $y$.

### Church-Rosserova věta

> Pokud výraz má normální formu, je *jednoznačně určena* (nezávisle na strategii redukce). Pokud k normální formě vede více cest, všechny *konvergují* k téže NF.

Důsledek: výsledek výpočtu nezávisí na strategii.

::: viz church-rosser-converge "Stejný výraz redukovaný v normal vs applicative — konvergence k NF (nebo divergence u Ω)."
:::

### Ukončení výpočtu (termination)

* Některé výrazy *nemají* NF — výpočet se *nikdy neukončí* (non-terminating).
* Příklad: $\Omega = (\lambda x.\ x\ x)\ (\lambda x.\ x\ x) \to_\beta (\lambda x.\ x\ x)\ (\lambda x.\ x\ x) \to_\beta \ldots$ — nekonečná smyčka.
* Jde o analogii *nekonečné* smyčky v běžných programovacích jazycích.

## Y kombinátor

**Problém:** λ-výraz *sám sobě* žádné jméno *nedává*. Jak tedy zapsat *rekurzi*?

**Řešení:** Y kombinátor — kombinátor pevného bodu (fixed-point combinator).

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

Chceme definovat faktoriál:

```
fact n = if n == 0 then 1 else n * fact (n-1)
```

V λ-kalkulu to nejde přímo — `fact` by se odkazoval sám na sebe. Místo toho použijeme:

```
fact_template = λ f n. if n == 0 then 1 else n * f (n-1)
fact = Y fact_template
```

Platí `Y fact_template` = `fact_template (Y fact_template)` = `fact_template fact`.

Když aplikujeme `fact n`:
* Pokud `n == 0`: vrátí 1.
* Jinak: vrátí `n * f (n-1)` = `n * fact (n-1)`.

Rekurze tak funguje!

::: viz y-combinator "Derivace Y g = g (Y g) krok po kroku + factorial via Y se stop na max depth."
:::

## Y kombinátor v typovaném světě

* **STLC** (Simply Typed λ-Calculus, jednoduše typovaný λ-kalkul) Y kombinátor **nemá** — typový systém ho zakazuje (sebeaplikace $x\ x$ není typovatelná).
* **Proto** je STLC silně normalizující (strongly normalizing) — výpočet vždy skončí.
* **System F** ani System Fω Y kombinátor také nemají.
* **Pro rekurzi** je v typovaných jazycích třeba *přidat* explicitní operátor pevného bodu (v Haskellu `fix`).

## Fix kombinátor v Haskellu

```haskell
fix :: (a -> a) -> a
fix f = f (fix f)

factorial :: Int -> Int
factorial = fix (\f n -> if n == 0 then 1 else n * f (n-1))
```

## Další kombinátory pevného bodu

Y není jediný:

* **Turingův Θ:** $\Theta = (\lambda x f.\ f\ (x\ x\ f))\ (\lambda x f.\ f\ (x\ x\ f))$.
* **Klopův $\Theta'$**.
* **Curryho Y** je nejznámější.

## Příklady redukce {tier=example}

### Booleovské hodnoty (Church encoding)

```
TRUE  = λ x y. x
FALSE = λ x y. y
IF    = λ c t e. c t e
```

Redukce:
* `IF TRUE a b` = `(λ c t e. c t e) TRUE a b` = `TRUE a b` = `(λ x y. x) a b` = `a`.

### Číselné hodnoty (Church encoding)

Čísla zapsaná jako $n \equiv \lambda f\ x.\ f^n(x)$ a funkci následníka `SUCC = λ n f x. f (n f x)` (včetně derivace `SUCC TWO = THREE`) viz [[church-enc]].

## Výpočetní síla

Lambda kalkul je **Turingovsky úplný**:

* Lze jím simulovat libovolný Turingův stroj.
* Lze jím spočítat *libovolnou* vyčíslitelnou (computable) funkci.
* Je svou silou ekvivalentní μ-rekurzivním funkcím, registrovým strojům i Turingovým strojům.

**Churchova-Turingova teze:** všechny tyto modely výpočtu jsou *ekvivalentní*; co je vyčíslitelné v jednom, je vyčíslitelné i v ostatních.

## Praktická implementace

Překladače (compiler) moderních funkcionálních jazyků postupují takto:

1. **Parsování** — zdrojový kód → AST (abstraktní syntaktický strom).
2. **Desugaring** — překlad na jádro λ-kalkulu (Haskell Core, ML CoreML).
3. **Typová kontrola** + inference (odvozování typů).
4. **Optimalizace** (deforestace, fúze, analýza striktnosti).
5. **Kompilace** do bytekódu / nativního kódu.

Jazyk GHC Core je **rozšířený typovaný λ-kalkul** s algebraickými datovými typy (ADT), výrazy case a typovými lambdami.

## Výkon (performance)

* **Naivní** interpret λ-kalkulu je pomalý.
* **Grafová redukce** se sdílením — exponenciální zrychlení.
* **STG machine** (Spineless Tagless G-machine) — moderní vyhodnocovač Haskellu.
* **Haskell v praxi:** v mnoha úlohách konkurenceschopný s C++.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=8Z_sosW2dgU" "SZZ : Lambda kalkul - úvod" "Tomáš Kocourek"
:::

*Zdroj: FLP přednášky 2025/26 (Kolář). Externí reference: Barendregt, H. P.: *The Lambda Calculus* (Elsevier 1984); Hindley, J. R., Seldin, J. P.: *Lambda-Calculus and Combinators: An Introduction* (Cambridge 2008); Pierce, B. C.: *Types and Programming Languages* (MIT Press 2002), kap. 5; Church, A.: *An unsolvable problem of elementary number theory* (1936).*
