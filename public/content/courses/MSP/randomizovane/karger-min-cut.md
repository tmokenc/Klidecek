---
title: Karger Min-Cut
---

# Karger Min-Cut

**Kargerův algoritmus** je elegantní randomizovaný Monte Carlo algoritmus pro nalezení **minimálního řezu** (min-cut) grafu. Je překvapivě jednoduchý — opakovaně kontrahuje náhodnou hranu — a pravděpodobnost úspěchu je `≥ 2/(n(n−1))`. Amplifikací (opakováním) získáme MC algoritmus s libovolně malou pravděpodobností chyby. Kromě své pedagogické hodnoty (skvělý příklad analýzy přes pravděpodobnost přežití správného řezu) je Karger základ rychlejších verzí (Karger-Stein `O(n² log³ n)`).

## Min-Cut problem

**Min-Cut**: pro neorientovaný multigraf `G = (V, E)` najdi rozdělení `V = A ⊎ B` (`A, B ≠ ∅`) minimalizující počet hran mezi `A` a `B`.

* **Globální** min-cut (jako tady) — žádné `s, t` zafixované.
* **`s-t` min-cut** — `s ∈ A, t ∈ B` (řeší max-flow / Ford-Fulkerson, `O(V·E²)` nebo lépe).

Pro neorientovaný globální min-cut: deterministické algoritmy existují (Stoer-Wagner, `O(V·E + V² log V)`), ale Karger je *jednodušší* na zápis i analýzu.

## Kontrakce hrany

**Kontrakce** hrany `(u, v)`:
1. „Slep" vrcholy `u` a `v` do nového superuzlu `uv`.
2. Všechny hrany mezi `u` a `v` zmiznou.
3. Hrany do/z `u` nebo `v` jdou nyní z `uv` (vznikají *multihrany*).

Po `n − 2` kontrakcích zbývají *2 superuzly*; všechny *neodstraněné* hrany tvoří *řez* mezi nimi.

::: svg "Kontrakce hrany (u, v): u a v se slijí do uv, sebenásloupy se odstraní, hrany se přepojí na uv."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <text x="120" y="20" text-anchor="middle" fill="var(--text-muted)">před kontrakcí</text>
    <circle cx="60" cy="80" r="16" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="60" y="84" text-anchor="middle">u</text>
    <circle cx="180" cy="80" r="16" fill="var(--bg-inset)" stroke="var(--accent)"/>
    <text x="180" y="84" text-anchor="middle">v</text>
    <line x1="76" y1="80" x2="164" y2="80" stroke="var(--line-strong)" stroke-width="2"/>
    <text x="120" y="68" text-anchor="middle" fill="var(--text-muted)">(u,v)</text>

    <circle cx="40" cy="140" r="14" fill="var(--bg-inset)" stroke="var(--text-muted)"/>
    <text x="40" y="144" text-anchor="middle" font-size="10">x</text>
    <circle cx="200" cy="140" r="14" fill="var(--bg-inset)" stroke="var(--text-muted)"/>
    <text x="200" y="144" text-anchor="middle" font-size="10">y</text>
    <line x1="50" y1="130" x2="50" y2="92" stroke="var(--line-strong)"/>
    <line x1="190" y1="130" x2="190" y2="92" stroke="var(--line-strong)"/>
    <line x1="50" y1="135" x2="170" y2="80" stroke="var(--line-strong)"/>

    <path d="M 260 110 L 300 110" stroke="var(--text-muted)" fill="none" marker-end="url(#arrK)"/>
    <text x="280" y="100" text-anchor="middle" fill="var(--text-muted)" font-size="10">contract</text>

    <text x="430" y="20" text-anchor="middle" fill="var(--text-muted)">po kontrakci</text>
    <ellipse cx="430" cy="80" rx="34" ry="20" fill="var(--bg-inset)" stroke="var(--accent-line)" stroke-width="2"/>
    <text x="430" y="84" text-anchor="middle">uv</text>
    <circle cx="350" cy="140" r="14" fill="var(--bg-inset)" stroke="var(--text-muted)"/>
    <text x="350" y="144" text-anchor="middle" font-size="10">x</text>
    <circle cx="510" cy="140" r="14" fill="var(--bg-inset)" stroke="var(--text-muted)"/>
    <text x="510" y="144" text-anchor="middle" font-size="10">y</text>
    <path d="M 360 130 Q 380 105 405 90" stroke="var(--line-strong)" fill="none"/>
    <path d="M 360 138 Q 390 110 405 95" stroke="var(--line-strong)" fill="none"/>
    <line x1="500" y1="130" x2="450" y2="95" stroke="var(--line-strong)"/>
  </g>
  <defs><marker id="arrK" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--text-muted)"/></marker></defs>
</svg>
:::

## Algoritmus

```
KARGER(G = (V, E)):
    dokud |V| > 2:
        zvol uniformně náhodně hranu e ∈ E
        kontrahuj e  (slij koncové vrcholy)
    vrať počet zbývajících hran
```

Implementace: union-find struktura, `O(m)` na výběr a kontrakci. Celkem `O(m · n) = O(n³)` worst-case (graf s `m = O(n²)`).

## Analýza pravděpodobnosti úspěchu

Buď `C` libovolný (zafixovaný) **minimální řez** s `k` hranami. Karger ho najde právě tehdy, když *žádná* z těchto `k` hran není kontrahována. Spočítejme pravděpodobnost.

**Klíčové lemma:** Pokud má min-cut `k` hran, pak každý vrchol má alespoň `k` sousedů (stupeň ≥ `k`). Důvod: pokud má vrchol `v` stupeň `< k`, pak řez `{v} vs. V∖{v}` má `< k` hran, *menší* než předpokládaný min-cut — spor.

Důsledek: graf s `n` vrcholy má `≥ n · k / 2` hran.

### Pravděpodobnost přežití řezu v jednom kroku

V `i`-té iteraci máme `n − i + 1` vrcholů (graf po `i − 1` kontrakcích). Z min-cut `C` (`k` hran) je pravděpodobnost, že kontrahujeme hranu *z `C`*, nejvýše:

::: math
P_i \le \frac{k}{\text{počet hran}} \le \frac{k}{(n - i + 1) \cdot k / 2} = \frac{2}{n - i + 1}.
:::

Pravděpodobnost, že žádnou z `n − 2` iterací nekontrahujeme hranu z `C`:

::: math
P[C \text{ přežije}] \ge \prod_{i=1}^{n-2} \left(1 - \frac{2}{n - i + 1}\right) = \prod_{j=3}^{n} \frac{j - 2}{j} = \frac{2 \cdot 1}{n \cdot (n-1)} = \frac{2}{n(n-1)}.
:::

(Teleskopický součin — většina členů se zkrátí.)

### Závěr

::: math
P[\text{Karger najde min-cut}] \ge \frac{2}{n(n-1)} = \Omega(1/n^2).
:::

To je *velmi malé* (řádově `n²`), ale stačí to k amplifikaci.

## Amplifikace

Spusť Karger `T` krát, vrať *minimum* nalezených řezů. Pravděpodobnost, že *všech* `T` pokusů selže:

::: math
P[\text{všechny selžou}] \le \left(1 - \frac{2}{n(n-1)}\right)^T \le e^{-2T / (n(n-1))}.
:::

Pro `T = c · n²/2 · ln n` (kde `c > 1`):

::: math
P[\text{selhání}] \le e^{-c \ln n} = \frac{1}{n^c}.
:::

* `c = 1`: `P[selhání] ≤ 1/n` — chyba mizí s `n → ∞`.
* `c = 2`: `P[selhání] ≤ 1/n²` — *high probability* (whp).

Celkový čas: `T · O(n²) = O(n⁴ log n)`. To je pomalejší než deterministický Stoer-Wagner `O(n³)`, ale jednodušší a paralelizovatelný.

## Karger-Stein — rychlejší varianta

Karger a Stein (1996) zlepšili to na `O(n² log³ n)`:

```
KARGER-STEIN(G):
    pokud |V| ≤ konstanta: vrať deterministicky
    n = |V|
    t = ⌈1 + n / √2⌉
    H₁ = kontrahuj G na t vrcholů
    H₂ = kontrahuj G na t vrcholů  (nezávisle)
    vrať min(KARGER-STEIN(H₁), KARGER-STEIN(H₂))
```

Idea: kontrakce na `n/√2` vrcholů zachovává min-cut s pravděpodobností `≈ 1/2`. Místo amplifikace `O(n²)` opakováním celého algoritmu, *rekurzivní* zachycení.

## Aplikace

* **Image segmentation** — graf-based segmentace (Felzenszwalb, Huttenlocher 2004).
* **Network reliability** — pravděpodobnost spolehlivosti sítě je úzce vázána na min-cut.
* **Clustering** — spectral clustering, related to min-cut.
* **Robust connectivity** — k-edge connectivity rozhodování.
* **DFA minimization** — vztah s ekvivalencí stavů (méně přímý).

## Las Vegas verze

Karger je *Monte Carlo* (vrátí *nějaký* řez, ne nutně minimální). Můžeme z něj udělat Las Vegas:

```
opakuj:
    cut = KARGER(G)
    pokud |cut| = ground-truth min-cut: return cut
```

Háček: *neznáme* ground-truth min-cut! Můžeme ale spočítat menší řez deterministicky (Stoer-Wagner) — pak by se algoritmus stal hybridem. V praxi: Karger je *naivně* Monte Carlo; Las Vegas variantu používáme jen v teoretických analýzách.

::: viz karger-contraction-anim "Kontrakce náhodných hran krok-za-krokem; po 200 pokusech sledujte empirickou úspěšnost vs. teoretickou 2/(n(n-1))."
:::

::: link "Karger, D.: Minimum Cuts in Near-Linear Time, JACM 47(1), 2000" "https://dl.acm.org/doi/10.1145/331605.331608"
:::

::: link "Stanford CS261 — Algoritmus a analýza Karger Min-Cut" "https://web.stanford.edu/class/cs261/"
:::

---

*Zdroj: MSP přednášky 2025/26, *Randomized Algorithms — Karger Min-Cut* (Češka). Externí reference: Karger, D.: *Global Min-cuts in RNC, and Other Ramifications of a Simple Min-Cut Algorithm*, SODA 1993; Mitzenmacher, M., Upfal, E.: *Probability and Computing* (Cambridge 2017), kap. 1.5; Motwani, R., Raghavan, P.: *Randomized Algorithms* (Cambridge 1995), kap. 1.1.*
