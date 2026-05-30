---
title: Vyhodnocení výrazu pomocí SHUNT operace
---

# Paralelní vyhodnocení aritmetického výrazu

Předchozí kapitola ([[kontrakce-uvod]]) zavedla *tree contraction* — opakované **Rake + Compress** pro redukci stromu na jeden uzel v $O(\log n)$. Tato kapitola aplikuje techniku na **vyhodnocení aritmetického výrazu** uloženého v binárním stromě. Klíčová operace je **SHUNT** — modifikovaná RAKE, která *kombinuje* odstranění listu *s* propagací *funkce* podstromu. Po $O(\log n)$ SHUNT iterací je výraz vyhodnocen v kořeni.

## Úloha — vyhodnocení výrazu

**Vstup**: binární strom $T$, kde:

- *Listy* obsahují **operandy** (čísla).
- *Vnitřní* uzly obsahují **operátory** ($+$, $-$, $\times$, $/$).

**Cíl**: spočítat hodnotu výrazu v *kořeni*.

**Sekvenčně** (post-order traversal): $O(n)$.

**Paralelně**: chceme $O(\log n)$ — ale prostý paralelní procházení nestačí (hodnoty *závisí* na potomcích).

### Příklad

```
        +
       / \
      *   /
     / \ / \
    2  3 12 4
```

Vyhodnocení sekvenčně:

1. $2 \cdot 3 = 6$
2. $12 / 4 = 3$
3. $6 + 3 = 9$

Tři sekvenční kroky pro 3 vnitřní uzly.

## SHUNT operace

**SHUNT** je operace pro listový uzel $u$ (kde $p(u) \neq r$, tj. rodič není kořen):

1. **Odstraň** $u$ a $p(u)$ ze stromu.
2. **Připoj** podstrom *sourozence* $\text{sib}(u)$ k *prarodiči* $p(p(u))$.

::: svg "SHUNT operace — odstranění listu u a rodiče, přesun sourozence"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="100" cy="30" r="13"/>
    <circle cx="100" cy="80" r="13"/>
    <circle cx="60" cy="130" r="11"/>
    <circle cx="140" cy="130" r="11"/>
    <circle cx="60" cy="170" r="10"/>
    <circle cx="80" cy="170" r="10"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="34">g</text>
    <text x="100" y="84">p</text>
    <text x="60" y="134">u</text>
    <text x="140" y="134">sib</text>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.6">
    <line x1="100" y1="42" x2="100" y2="68"/>
    <line x1="93" y1="91" x2="65" y2="120"/>
    <line x1="107" y1="91" x2="135" y2="120"/>
    <line x1="60" y1="141" x2="60" y2="160"/>
    <line x1="60" y1="141" x2="80" y2="160"/>
  </g>
  <text x="100" y="195" fill="var(--text-muted)" text-anchor="middle" font-size="10">Před SHUNT: list u, rodič p, prarodič g</text>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" marker-end="url(#shuntarr)">
    <line x1="200" y1="100" x2="260" y2="100"/>
  </g>
  <defs>
    <marker id="shuntarr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="230" y="95" fill="var(--accent)" text-anchor="middle" font-size="10">SHUNT</text>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="380" cy="30" r="13"/>
    <circle cx="380" cy="80" r="11"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="380" y="34">g</text>
    <text x="380" y="84">sib</text>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.6">
    <line x1="380" y1="42" x2="380" y2="68"/>
  </g>
  <text x="380" y="195" fill="var(--text-muted)" text-anchor="middle" font-size="10">Po SHUNT: g má sib jako přímého syna</text>
</svg>
:::

## SHUNT pro výrazové stromy

Naivní SHUNT odstraní operátor — ale ten *něco* dělá! Musíme jeho operaci „uložit" tak, aby se *později* aplikovala.

**Trik**: na *hrany* uložíme *funkce* tvaru $f(X) = aX + b$, kde $X$ je hodnota podstromu pod hranou. Inicializačně všechny hrany mají identitu $f(X) = 1 \cdot X + 0$.

Po SHUNT operaci se funkce *skládají* — aktualizovaná funkce na nové hraně reprezentuje *kombinaci* odstraněných operátorů a hodnot listu.

### Příklad — SHUNT s operátorem $+$

Mějme uzel $p$ s operátorem $\odot$, levým synem (list) $u = 5$ a pravým synem (podstrom) se symbolickou hodnotou $X$. Hrana mezi $p$ a $u$ má funkci $f_L(X) = 1 \cdot X + 0$. Hrana mezi $p$ a $X$ má $f_R(X) = 1 \cdot X + 0$. Hrana z $p$ k *prarodiči* $g$ má $f(Z) = 1 \cdot Z + 0$.

Po SHUNT:

- $f_R(u) = a \cdot 5 + b$ (konkrétní hodnota, $a = 1$, $b = 0$ na začátku = 5).
- Nová funkce na hraně $g \to X$: $f'(X) = f(f_L(X) \odot f_R(5))$.

Pro $\odot = +$: $f'(X) = 1 \cdot ((1 \cdot X + 0) + (1 \cdot 5 + 0)) + 0 = X + 5$.

Pro $\odot = \times$: $f'(X) = 1 \cdot ((1 \cdot X + 0) \cdot (1 \cdot 5 + 0)) + 0 = 5X + 0$.

V obou případech je výsledek opět tvaru $aX + b$ — *afinní* funkce. Klíčové: **afinní funkce jsou uzavřené na skládání**, takže opakovaný SHUNT zachovává tvar.

::: math
\begin{aligned}
\text{SHUNT s } + : & \quad f'(X) = a\bigl((a_L X + b_L) + (a_R c + b_R)\bigr) + b = (a\,a_L)X + a(b_L + a_R c + b_R) + b \\
\text{SHUNT s } \times : & \quad f'(X) = a\bigl((a_L X + b_L)\cdot(a_R c + b_R)\bigr) + b = a\,a_L(a_R c + b_R)\,X + \bigl(a\,b_L(a_R c + b_R) + b\bigr)
\end{aligned}
:::

(Přesné koeficienty závisí na pořadí synů a operátoru.)

## Paralelní algoritmus

Naivně lze SHUNT aplikovat na *všechny* listy paralelně — ale ne tak, aby jejich rodiče byli *sousedi* (jinak by SHUNT mohl mít konflikty).

**Trik** (číslování po listech):

1. Uložíme všech $n$ listů do pole $A[1..n]$.
2. $A_\text{odd}$ = listy s lichými indexy, $A_\text{even}$ = listy se sudými indexy.
3. V každé iteraci aplikujeme SHUNT *jen* na $A_\text{odd}$ — což zaručuje, že rodiče SHUNT-ovaných listů nejsou sousedi.

```
procedure TREE_CONTRACTION_EVAL(T)
  A ← all leaves of T, indexed 1..n
  for i = 1 to log(n + 1) do
    (1) Apply SHUNT in parallel to all elements of A_odd that are LEFT children
    (2) Apply SHUNT in parallel to the rest of elements in A_odd (right children)
    (3) A ← A_even   // half-size for next iteration
```

Po každé iteraci se pole $A$ *zpoloví*. Po $\log n$ iterací zbude *jediný* uzel = vyhodnocený kořen.

::: svg "Tree contraction expression eval — listy v poli A, opakované SHUNT"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="270" cy="30" r="13"/>
    <circle cx="210" cy="80" r="11"/>
    <circle cx="330" cy="80" r="11"/>
    <circle cx="170" cy="130" r="10"/>
    <circle cx="250" cy="130" r="10"/>
    <circle cx="290" cy="130" r="10"/>
    <circle cx="370" cy="130" r="10"/>
    <circle cx="155" cy="175" r="9"/>
    <circle cx="180" cy="175" r="9"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="270" y="34">+</text>
    <text x="210" y="84">*</text>
    <text x="330" y="84">/</text>
    <text x="170" y="134">+</text>
    <text x="250" y="134">3</text>
    <text x="290" y="134">12</text>
    <text x="370" y="134">4</text>
    <text x="155" y="179">2</text>
    <text x="180" y="179">5</text>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.6">
    <line x1="262" y1="42" x2="216" y2="68"/>
    <line x1="278" y1="42" x2="324" y2="68"/>
    <line x1="204" y1="91" x2="176" y2="120"/>
    <line x1="216" y1="91" x2="244" y2="120"/>
    <line x1="324" y1="91" x2="296" y2="120"/>
    <line x1="336" y1="91" x2="364" y2="120"/>
    <line x1="165" y1="140" x2="156" y2="166"/>
    <line x1="175" y1="140" x2="180" y2="166"/>
  </g>
  <text x="270" y="210" fill="var(--text-muted)" text-anchor="middle" font-size="10">Listy: 2, 5, 3, 12, 4 → pole A indexované 1..5</text>
  <text x="270" y="225" fill="var(--accent)" text-anchor="middle" font-size="10">log(5+1) = 3 iterace SHUNT</text>
</svg>
:::

## Iterace pro náš příklad

Pro ilustraci SHUNT iterací použijeme o něco větší výraz než v úvodu — strom $(2 + 5) \times 3 + 12 / 4$ s pěti listy (2, 5, 3, 12, 4) uložený v binárním stromě (viz SVG výše).

**Iter 1 — SHUNT na liché listy:**
- Listy $A_\text{odd}$ = {2, 3, 4} (indexy 1, 3, 5).
- SHUNT na list 2: odstraní 2 i jeho rodiče $+$, propaguje funkci $X + 5$ vzhůru.
- SHUNT na list 3: odstraní 3 i jeho rodiče $\times$, propaguje funkci $3 \cdot X$.
- SHUNT na list 4: odstraní 4 i jeho rodiče $/$, propaguje funkci $X / 4$.

Po iteraci: strom má 4 uzly (kořen $+$, levý syn $X + 5$, jednotka $\times 3$, atd. — strukturálně jednodušší).

**Iter 2, 3**: další SHUNTy, až zbude kořen s plně vyhodnocenou funkcí.

**Výsledek**: $(2 + 5) \cdot 3 + 12 / 4 = 21 + 3 = 24$.

## Analýza

| Krok | Čas |
| :--- | :---: |
| Indexování listů (Euler tour) | $O(\log n)$ |
| Jedna iterace SHUNT | $O(1)$ paralelně |
| Počet iterací | $O(\log n)$ |
| **Celkem** | $O(\log n)$ |

- $p(n) = O(n)$
- $c(n) = O(n \log n)$ — *není cost-optimal* (sekv. $O(n)$).

Pro cost-optimal varianty viz Reif & Tate 1989.

## Generalita

Tree contraction algoritmus funguje pro *libovolné* asociativní operátory + projekce, ne jen aritmetické výrazy:

- **Boolean expressions** (AND, OR, NOT).
- **Matrix expressions** ($A \cdot B$, kde uzly jsou matice).
- **Regular expressions** (concatenation, alternation).
- **String evaluation**.

Klíčový požadavek: typ uložený na hranách musí být **uzavřený na skládání** (operace * z operátoru $\odot$).

## Aplikace v praxi

- **Compiler optimization**: paralelní *constant folding* a *strength reduction* v abstraktních syntaktických stromech.
- **Symbolic computation**: Mathematica, Maple, SymPy — paralelní eval výrazů.
- **Dynamic programming on trees**: DP, kde stav každého uzlu závisí na potomcích, lze paralelizovat tree contractionem.
- **PRAM verifikace**: tree contraction je *standardní cvičení* v paralelní algoritmice — ukazuje, že *zdánlivě sekvenční* úlohy se paralelizují.

## Co dál

Topic 6 (Kontrakce stromu) je teď kompletní. Topic 7 (Distribuované systémy — process algebra) přejde od *PRAM*/shared-memory algoritmů k *distribuovanému* světu: **procesy komunikující zprávami**, **synchronní vs asynchronní** komunikace, **π-calculus** a *process algebra* (CSP, CCS).

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Miller, G.L., Reif, J.H.: „Parallel tree contraction and its application" (FOCS 1985); JáJá, J.: *An Introduction to Parallel Algorithms* (Addison-Wesley 1992), kap. 3.8.3 (Expression evaluation); Reif, J. (ed.): *Synthesis of Parallel Algorithms* (Morgan Kaufmann 1993), kap. 9; Cook, S.A.: „A taxonomy of problems with fast parallel algorithms" (Inform. Control 64(1–3), 1985, [DOI 10.1016/S0019-9958(85)80041-3](https://doi.org/10.1016/S0019-9958(85)80041-3)) — Cook's class NC; Brent, R.P.: „The parallel evaluation of general arithmetic expressions" (J. ACM 21(2), 1974, [DOI 10.1145/321812.321815](https://doi.org/10.1145/321812.321815)) — klasický předchůdce tree contraction.*
