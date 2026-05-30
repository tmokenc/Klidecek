---
title: Náhodné veličiny — CDF, PMF, PDF
---

# Náhodné veličiny — CDF, PMF, PDF

Často není zajímavý vlastní výsledek experimentu, ale *číselná hodnota* z něj odvozená — teplota, počet úspěchů, doba odezvy. **Náhodná veličina** formalizuje tuto myšlenku: je to funkce, která každému výsledku experimentu přiřazuje reálné číslo. Kompletně ji popisuje *distribuční funkce*.

## Definice

Buď `(Ω, A, P)` pravděpodobnostní prostor. **Náhodná veličina** (zkr. NV) je funkce `X : Ω → R` taková, že pro každé `x ∈ R` platí `{ω ∈ Ω | X(ω) ≤ x} ∈ A` (tj. *měřitelná* vůči `A`).

Zápis: `P(X = x) := P({ω | X(ω) = x})`, podobně `P(X ≤ x)`, `P(a < X ≤ b)` atp.

**Nosič** (support) NV `X` je množina `{x ∈ R | P(X = x) > 0}` u diskrétní NV; u spojité je to množina, kde je hustota nenulová.

### Příklad — dva hody mincí

`X` = počet líců ve dvou hodech férovou mincí. Nosič: `{0, 1, 2}`,

::: math
P(X = 0) = \tfrac{1}{4},\quad P(X = 1) = \tfrac{1}{2},\quad P(X = 2) = \tfrac{1}{4}.
:::

## Distribuční funkce (CDF)

Distribuční funkce (*cumulative distribution function*) NV `X` je `F : R → [0, 1]`:

::: math
F(x) = P(X \le x).
:::

CDF *jednoznačně* určuje rozdělení NV. Vlastnosti:

* **neklesající** a **zprava spojitá**,
* `lim_{x→-∞} F(x) = 0`, `lim_{x→+∞} F(x) = 1`,
* `P(X = x) = F(x) − lim_{t↑x} F(t)` (skoková výška),
* `P(a < X ≤ b) = F(b) − F(a)`.

::: svg "CDF diskrétní (vlevo, schodová) vs. spojité NV (vpravo, hladká neklesající funkce)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g transform="translate(30,20)">
    <text x="110" y="-2" text-anchor="middle" fill="var(--text-muted)">diskrétní NV</text>
    <line x1="0" y1="160" x2="220" y2="160" stroke="var(--line-strong)"/>
    <line x1="0" y1="20" x2="0" y2="160" stroke="var(--line-strong)"/>
    <text x="-6" y="160" text-anchor="end" fill="var(--text-muted)">0</text>
    <text x="-6" y="25" text-anchor="end" fill="var(--text-muted)">1</text>
    <text x="40" y="172" text-anchor="middle" fill="var(--text-muted)">0</text>
    <text x="100" y="172" text-anchor="middle" fill="var(--text-muted)">1</text>
    <text x="160" y="172" text-anchor="middle" fill="var(--text-muted)">2</text>
    <line x1="0" y1="160" x2="40" y2="160" stroke="var(--accent)" stroke-width="2"/>
    <line x1="40" y1="125" x2="100" y2="125" stroke="var(--accent)" stroke-width="2"/>
    <line x1="100" y1="55" x2="160" y2="55" stroke="var(--accent)" stroke-width="2"/>
    <line x1="160" y1="20" x2="220" y2="20" stroke="var(--accent)" stroke-width="2"/>
    <circle cx="40" cy="125" r="3" fill="var(--accent)"/>
    <circle cx="100" cy="55" r="3" fill="var(--accent)"/>
    <circle cx="160" cy="20" r="3" fill="var(--accent)"/>
    <circle cx="40" cy="160" r="3" fill="var(--bg)" stroke="var(--accent)"/>
    <circle cx="100" cy="125" r="3" fill="var(--bg)" stroke="var(--accent)"/>
    <circle cx="160" cy="55" r="3" fill="var(--bg)" stroke="var(--accent)"/>
  </g>
  <g transform="translate(300,20)">
    <text x="110" y="-2" text-anchor="middle" fill="var(--text-muted)">spojitá NV</text>
    <line x1="0" y1="160" x2="220" y2="160" stroke="var(--line-strong)"/>
    <line x1="0" y1="20" x2="0" y2="160" stroke="var(--line-strong)"/>
    <text x="-6" y="160" text-anchor="end" fill="var(--text-muted)">0</text>
    <text x="-6" y="25" text-anchor="end" fill="var(--text-muted)">1</text>
    <path d="M 0 160 Q 60 158 100 90 Q 140 22 220 20" stroke="var(--accent-line)" stroke-width="2" fill="none"/>
  </g>
</svg>
:::

## Diskrétní vs. spojitá náhodná veličina

* **Diskrétní NV** — nosič je konečná nebo spočetná množina. Popisuje se *pravděpodobnostní funkcí* (PMF).
* **Spojitá NV** — nosič je nespočetný (interval), CDF je *absolutně spojitá*. Popisuje se *hustotou pravděpodobnosti* (PDF).

### Pravděpodobnostní funkce (PMF)

Pro diskrétní NV `X`:

::: math
p(x) = P(X = x), \quad \sum_x p(x) = 1, \quad F(x) = \sum_{t \le x} p(t).
:::

### Hustota pravděpodobnosti (PDF)

Pro spojitou NV `X` existuje nezáporná `f : R → R` (hustota) taková, že:

::: math
P(a < X \le b) = \int_a^b f(x)\, dx, \quad F(x) = \int_{-\infty}^{x} f(t)\, dt, \quad \int_{-\infty}^{+\infty} f(x)\, dx = 1.
:::

Pozor: u spojité NV `P(X = x) = 0` pro každé konkrétní `x` — pravděpodobnost je „rozprostřená" do intervalů.

::: math
f(x) = \frac{dF(x)}{dx} \text{ tam, kde } F \text{ je diferencovatelná.}
:::

## Více náhodných veličin — sdružené rozdělení

Pro vektor NV `(X, Y)` definujeme **sdruženou** PMF/PDF a *marginální* (součtem/integrací přes druhou veličinu):

::: math
p_X(x) = \sum_y p_{X,Y}(x, y), \qquad f_X(x) = \int f_{X,Y}(x, y)\, dy.
:::

**Nezávislost** NV: `X ⊥ Y` ⇔ `p_{X,Y}(x, y) = p_X(x) · p_Y(y)` (resp. hustoty u spojitých). Slabší podmínka — *nekorelovanost* — vyžaduje jen `cov(X, Y) = 0` a u nenormálních veličin nezávislost *neimplikuje*.

### Podmíněné rozdělení

::: math
p_{X \mid Y}(x \mid y) = \frac{p_{X,Y}(x, y)}{p_Y(y)} \quad (p_Y(y) > 0).
:::

Bayesova věta pro NV: `p(y | x) = p(x | y) p(y) / p(x)`.

## Transformace náhodných veličin

Pokud `Y = g(X)` a `g` je dostatečně hladká *bijekce*, pak pro spojité NV platí *Jakobiánův* vzorec:

::: math
f_Y(y) = f_X(g^{-1}(y)) \left| \frac{d}{dy} g^{-1}(y) \right|.
:::

Pro lineární transformaci `Y = aX + b` (`a ≠ 0`): `f_Y(y) = f_X((y−b)/a) / |a|`.

## i.i.d. — základ statistické inference

Klíčový předpoklad celé statistické části: *vzorek* `X₁, …, Xₙ` je posloupností **i.i.d.** (independent and identically distributed) NV — tedy navzájem nezávislých, všechny se stejným rozdělením `f(x; θ)`. Pak je sdružená hustota *součinem* okrajových:

::: math
f(x_1, \dots, x_n; \theta) = \prod_{i=1}^{n} f(x_i; \theta).
:::

Tento součin je *likelihood* — viz [[mle]].

::: viz pdf-cdf-link "Přetáhněte x; sledujte, jak P(X≤x) z PDF/PMF přechází do hodnoty CDF F(x). Spojité vs. diskrétní NV."
:::

::: link "Wasserman, L.: All of Statistics — kap. 2 (Random Variables)" "https://www.stat.cmu.edu/~larry/all-of-statistics/"
:::

::: link "Khan Academy — Random variables (probability theory)" "https://www.khanacademy.org/math/statistics-probability/random-variables-stats-library"
:::

---

*Zdroj: MSP přednášky 2025/26, *Probability in Computer Science* (Češka). Externí reference: Ross, S.: *A First Course in Probability* (Pearson 2019), kap. 4–5; Wasserman, L.: *All of Statistics* (Springer 2004), kap. 2; Grinstead, C., Snell, L.: *Introduction to Probability* (AMS 1997), kap. 4–5 — [free PDF](https://math.dartmouth.edu/~prob/prob/prob.pdf).*
