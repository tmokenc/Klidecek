---
title: Testování hypotéz — princip
---

# Testování hypotéz — princip

**Testování hypotéz** je rozhodovací procedura: na základě pozorovaných dat se rozhodujeme mezi dvěma konkurenčními tvrzeními o parametru `θ`. Centrální koncepty jsou *hypotézy* (H₀, H₁), *chyby I. a II. druhu*, *hladina významnosti*, *p-hodnota* a *síla testu*. Tato kapitola pokrývá jednotnou „gramatiku" testů, kterou pak konkretizujeme pro `t`-test, F-test, χ²-test atd.

## Nulová a alternativní hypotéza

**Nulová hypotéza** `H₀: θ ∈ Θ₀` — výchozí tvrzení, které chceme vyvrátit (např. „lék nemá efekt", „dvě skupiny jsou stejné", „mince je fér").

**Alternativní hypotéza** `H₁: θ ∈ Θ₁ = Θ ∖ Θ₀` — alternativa, kterou věříme po vyvrácení `H₀`.

Asymetrie: máme *přednost* `H₀`. Zamítneme ji pouze pokud máme *silné důkazy proti*. To je *opatrnost* — chybný závěr „efekt existuje" je horší než chybný závěr „efekt neexistuje" (klasický medical/regulatory přístup).

### Typy hypotéz

* **Jednoduchá vs. složená**: `H: θ = θ₀` (jednoduchá) vs. `H: θ > θ₀` (složená).
* **Jednostranná vs. oboustranná alternativa**:
  * Oboustranná: `H₁: θ ≠ θ₀`.
  * Jednostranná: `H₁: θ > θ₀` nebo `H₁: θ < θ₀`.

## Chyby I. a II. druhu

Test může selhat dvojím způsobem:

| | Skutečnost: `H₀` | Skutečnost: `H₁` |
| :--- | :---: | :---: |
| **Rozhodnutí: zamítnout `H₀`** | chyba I. druhu (α) | správně (síla) |
| **Rozhodnutí: nezamítnout `H₀`** | správně | chyba II. druhu (β) |

* **Chyba I. druhu** (false positive): zamítneme `H₀`, ačkoli platí. Pravděpodobnost: `α = P(zamítnout H₀ | H₀)`.
* **Chyba II. druhu** (false negative): nezamítneme `H₀`, ačkoli neplatí. Pravděpodobnost: `β = P(nezamítnout H₀ | H₁)`.
* **Síla testu** (power): `1 − β = P(zamítnout H₀ | H₁)`. „Pravděpodobnost detekce skutečného efektu."

### Hladina významnosti α

`α` se volí *předem* (typicky 0,05 nebo 0,01) — *maximální* přípustná chyba I. druhu. Test je *na hladině `α`*, pokud `P(zamítnout H₀ | θ ∈ Θ₀) ≤ α` pro každé `θ ∈ Θ₀`.

::: svg "Distribuce testové statistiky pod H₀ (modrá) a H₁ (oranžová). α je plocha vpravo od kritické hodnoty pod H₀, β je plocha vlevo pod H₁."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <line x1="40" y1="160" x2="500" y2="160" stroke="var(--line-strong)"/>
    <path d="M 40 160 Q 110 158 170 140 Q 200 35 230 140 Q 290 158 360 160" stroke="var(--accent)" stroke-width="2" fill="none"/>
    <path d="M 200 35 Q 230 140 290 158 Q 320 160 360 160 L 360 160 L 290 160 L 200 160 Z" fill="var(--accent)" fill-opacity="0.15"/>
    <text x="200" y="25" text-anchor="middle" fill="var(--accent)">f(T | H₀)</text>

    <path d="M 200 160 Q 270 158 320 130 Q 360 30 400 130 Q 450 158 500 160" stroke="var(--accent-line)" stroke-width="2" fill="none"/>
    <path d="M 200 160 L 290 160 L 290 130 Q 250 145 200 160 Z" fill="var(--accent-line)" fill-opacity="0.15"/>
    <text x="370" y="20" text-anchor="middle" fill="var(--accent-line)">f(T | H₁)</text>

    <line x1="290" y1="20" x2="290" y2="170" stroke="var(--text)" stroke-dasharray="3 3"/>
    <text x="290" y="190" text-anchor="middle" fill="var(--text)">kritická hodnota c</text>

    <text x="320" y="155" fill="var(--accent)" font-size="10">α</text>
    <text x="248" y="155" fill="var(--accent-line)" font-size="10">β</text>
  </g>
</svg>
:::

### Trade-off α vs. β

Snížit `α` (přísnější test) typicky *zvyšuje* `β` (víc false negatives). Jediný způsob, jak snížit *obě* chyby současně, je *větší vzorek `n`* — distribuce se zúží, oba ocasy budou menší.

## Testová statistika a rozhodovací pravidlo

**Test** = funkce dat `δ(X) ∈ {0, 1}` (zamítnout/nezamítnout). Obvykle:

1. Spočítej *testovou statistiku* `T(X)`.
2. Zvol *kritickou oblast* `C` (rejection region).
3. Rozhodni: zamítnout `H₀` ⇔ `T(X) ∈ C`.

Kritická oblast je volena tak, aby `P_{θ ∈ Θ₀}(T ∈ C) ≤ α`. Pro jednostranný test obvykle `C = [c, ∞)`, kde `c = q_{1−α}` je `(1 − α)`-kvantil rozdělení `T` pod `H₀`.

### Příklad — `t`-test

Pro `H₀: μ = μ₀` proti `H₁: μ ≠ μ₀` (oboustranný):

* Statistika: `T = (X̄ − μ₀)/(S/√n)`.
* Distribuce pod `H₀`: `T ∼ t(n − 1)`.
* Kritická oblast: `|T| > t_{α/2, n−1}`.

## p-hodnota

**p-hodnota** = pravděpodobnost pozorovat *stejně extrémní nebo extrémnější* hodnotu testové statistiky než `T_obs`, *za platnosti `H₀`*:

::: math
p = P(T \ge T_{\text{obs}} \mid H_0) \quad \text{(jednostranný)},
:::

::: math
p = P(|T| \ge |T_{\text{obs}}|) \quad \text{(oboustranný)}.
:::

### Rozhodnutí přes p-hodnotu

* `p ≤ α` ⇔ zamítnout `H₀`.
* `p > α` ⇔ nezamítnout `H₀`.

Výhody p-hodnoty:

* Kvantitativní (pozdě „těsně zamítnuto" vs. „výrazně zamítnuto").
* Lze sdílet bez fixace `α` (čtenář zvolí svou hladinu).

### Časté nedorozumění

`p` *není* pravděpodobnost, že `H₀` platí (to by byla bayesovská otázka). `p` je *frekventistická* pravděpodobnost dat (extrémnějších než pozorovaná) za platnosti `H₀`.

**Špatná interpretace**: „p = 0,03 znamená, že je 3% šance, že H₀ platí." Špatně. Správná: „kdyby H₀ platila, pozorovali bychom takhle extrémní nebo extrémnější data jen ve 3 % případů."

## Síla testu a velikost vzorku

**Síla** `π(θ) = P(zamítnout H₀ | θ)` jako funkce *skutečného* `θ`. Pro `θ ∈ Θ₀`: `π(θ) ≤ α`. Pro `θ ∈ Θ₁`: `π(θ) = 1 − β(θ)`.

### Výpočet pro známý alternativní efekt

Pro `t`-test, `H₀: μ = μ₀`, `H₁: μ = μ₁ ≠ μ₀`, známé `σ`:

::: math
\pi = P\!\left( \frac{\bar{X} - \mu_0}{\sigma/\sqrt{n}} > z_\alpha \,\Big|\, \mu = \mu_1 \right) = 1 - \Phi\!\left( z_\alpha - \frac{\mu_1 - \mu_0}{\sigma/\sqrt{n}} \right).
:::

Zde `(μ₁ − μ₀)/(σ/√n)` je **efektová velikost normalizovaná k SE**.

### Plánování — kolik vzorků?

Pro požadovanou sílu `1 − β`, hladinu `α` a efektovou velikost `δ = (μ₁ − μ₀)/σ`:

::: math
n \ge \left( \frac{z_\alpha + z_\beta}{\delta} \right)^2.
:::

Pro `α = 0,05` (jednostranný), `1 − β = 0,80`, `δ = 0,5`: `n ≥ (1,645 + 0,84)²/0,25 ≈ 25`.

**Cohenovy efektové velikosti**: small `δ = 0,2`, medium `0,5`, large `0,8`. Power analysis (G*Power, `pwr` v R) je standardní krok plánování experimentu.

## Multiplicita testů

Pokud provedeme `m` nezávislých testů na hladině `α`, pravděpodobnost *aspoň jednoho* false positive (familywise error rate, FWER):

::: math
P[\ge 1 \text{ false positive}] = 1 - (1 - \alpha)^m \approx m\alpha \text{ pro malé } \alpha.
:::

Pro `m = 20`, `α = 0,05`: `FWER ≈ 64 %`. To je vysoká pravděpodobnost nesmyslného „objevu".

### Korekce na multiplicitu

* **Bonferroni**: každý test na `α/m`. Konzervativní (zejména při kladně korelovaných testech; sjednocovací mez je volná). FWER ≤ `α`.
* **Holm-Bonferroni**: sekvenční verze Bonferroniho, méně konzervativní.
* **FDR (Benjamini-Hochberg)**: kontroluje *expected proportion of false discoveries* místo FWER. Vhodné pro `m` velké (genomika, neuroimaging).

## Duální vztah CI ↔ test

Hypotéza `H₀: θ = θ₀` se zamítne na hladině `α` ⇔ `θ₀ ∉ CI_{1−α}`. Tedy:

* CI = množina hodnot `θ₀`, které by *nezamítly*.
* Test = je `θ₀` v CI nebo ne.

Tento *duální vztah* (Cox-Hinkley) je hlubokou symetrií: jakmile máme jeden, dovedeme zkonstruovat druhý.

## Kritika a moderní pohled

Klasické NHST (Null Hypothesis Significance Testing) je v posledních letech kritizováno:

* **p-hacking** — opakované testování až do `p < 0,05`.
* **Replication crisis** — mnoho „statisticky významných" výsledků se nereplikuje.
* **Misinterpretation** — p-hodnota není pravděpodobnost hypotézy.

Doporučení (ASA Statement 2016): hlásit *effect sizes a CI* spolu s p-hodnotami, pre-registrace, Bayesovské alternativy.

::: viz hypothesis-test-tradeoff "Posunujte μ₁, σ, n, α; sledujte trade-off mezi chybou I (α) a II (β) a sílu testu (1−β)."
:::

::: link "ASA Statement on Statistical Significance and P-Values (2016)" "https://www.amstat.org/asa/files/pdfs/p-valuestatement.pdf"
:::

::: link "DeGroot, M., Schervish, M.: Probability and Statistics, kap. 9" "https://www.pearson.com/en-us/subject-catalog/p/probability-and-statistics/P200000006228"
:::

::: link "Wasserman, L.: All of Statistics, kap. 10" "https://www.stat.cmu.edu/~larry/all-of-statistics/"
:::

---

*Zdroj: MSP přednášky 2025/26, *Hypothesis Testing — Principles* (Hrabec). Externí reference: DeGroot, M., Schervish, M.: *Probability and Statistics* (Pearson 2012), kap. 9; Lehmann, E. L., Romano, J. P.: *Testing Statistical Hypotheses* (Springer 2005); Wasserman, L.: *All of Statistics* (Springer 2004), kap. 10.*
