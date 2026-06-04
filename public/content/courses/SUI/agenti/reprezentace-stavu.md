---
title: Reprezentace stavu
---

# Reprezentace stavu

*Stav* je popis světa v daném okamžiku z pohledu agenta. *Jak* stav reprezentujeme, určuje sílu metod, které můžeme použít, i nutnou výpočetní cenu. AIMA rozlišuje tři úrovně:

## 1. Atomická reprezentace

Stav je **nedělitelný celek** — *jeden symbol* bez vnitřní struktury. Pracujeme s ním jako s *labelem*.

::: svg "Atomická reprezentace: stavy jsou prosté uzly v grafu."
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <circle cx="80" cy="80" r="22"/>
    <circle cx="180" cy="40" r="22"/>
    <circle cx="180" cy="120" r="22"/>
    <circle cx="290" cy="80" r="22"/>
    <circle cx="400" cy="80" r="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="80" y="84" font-weight="600">A</text>
    <text x="180" y="44" font-weight="600">B</text>
    <text x="180" y="124" font-weight="600">C</text>
    <text x="290" y="84" font-weight="600">D</text>
    <text x="400" y="84" font-weight="600">E</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <line x1="100" y1="72" x2="160" y2="48"/>
    <line x1="100" y1="88" x2="160" y2="112"/>
    <line x1="200" y1="48" x2="270" y2="72"/>
    <line x1="200" y1="112" x2="270" y2="88"/>
    <line x1="312" y1="80" x2="378" y2="80"/>
  </g>
</svg>
:::

### Vlastnosti

* Stav = *opaque atom*. Pracujeme s ním jen porovnáváním rovnosti, sledováním přechodů.
* Algoritmy: **prohledávání stavového prostoru** (BFS, DFS, A*, viz [[neinformovane]], [[informovane]]).
* Pro velký počet stavů — `N` měst → `N!` permutací cest — *kombinatorická exploze*.

### Příklad: cestování po městech

* Stavy: `Brno, Praha, Olomouc, ...`
* Přechod: existuje silnice mezi městy.
* Žádná vnitřní struktura — Brno je prostě „Brno", ne kombinace souřadnic, populace atd.

### Příklad: stav v hře šachy *jako atom*

* Stav = celá pozice na šachovnici jako jeden symbol.
* Tabulka přechodů by měla `~10⁴⁵` řádků. Nepoužitelné — proto šachy modelujeme *faktorizovaně*.

## 2. Faktorizovaná reprezentace

Stav = **vektor proměnných** (features, atributy) s hodnotami.

::: svg "Faktorizovaný stav: pole hodnot pro několik atributů."
<svg viewBox="0 0 540 140" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="40" y="40" width="100" height="60" rx="4"/>
    <rect x="160" y="40" width="100" height="60" rx="4"/>
    <rect x="280" y="40" width="100" height="60" rx="4"/>
    <rect x="400" y="40" width="100" height="60" rx="4"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="90" y="34">pozice</text>
    <text x="210" y="34">stav A</text>
    <text x="330" y="34">stav B</text>
    <text x="450" y="34">baterie</text>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="13" font-weight="600">
    <text x="90" y="76">[5,3]</text>
    <text x="210" y="76">Dirty</text>
    <text x="330" y="76">Clean</text>
    <text x="450" y="76">73%</text>
  </g>
</svg>
:::

### Vlastnosti

* Stav je *strukturovaný* — můžeme se ptát na *konkrétní atribut*.
* Algoritmy: **CSP** ([[csp-definice]]), **Bayesovské sítě**, **MDP s feature representation**.
* Sdílení informace mezi *podobnými* stavy — když změním jeden atribut, ostatní zůstanou.

### Příklad: CSP (barvení mapy)

* Proměnné: `WA, NT, Q, SA, NSW, V, T` (státy Austrálie).
* Domény: `{red, green, blue}` pro každý stát.
* Omezení: sousední státy *různě barevné*.
* Stav = aktuální (parciální) přiřazení.

### Příklad: pozice ve hře jako vektor

* Vektor: pozice každé figurky, čí je tah, kdo má povolené rošády, en-passant cíl, ...
* Tato reprezentace umožňuje *evaluation function* (count materiálu, struktura pěšců...).

### Faktorizace pro pravděpodobnostní modely

V *Bayesovských sítích* využíváme faktorizaci k *kompaktnímu* popisu spojeného rozdělení:

::: math
P(X_1, \dots, X_n) = \prod_{i=1}^{n} P(X_i \mid \text{parents}(X_i))
:::

Místo `O(2^n)` pravděpodobností pro `n` binárních proměnných stačí `O(n · 2^k)` (kde `k` je max. počet rodičů). Toto je klíčové ke škálování pravděpodobnostních modelů.

## 3. Strukturovaná reprezentace

Stav = **objekty** a **vztahy** mezi nimi. Síla *predikátové logiky 1. řádu*.

### Vlastnosti

* Stav popisován symbolickými fakty: `Na(stůl, kniha)`, `Větší(slon, myš)`.
* Algoritmy: **plánování v PDDL**, **inferenční mechanismy**, **knowledge graphs**.
* Lze vyjadřovat **kvantifikátory** (`∀ x: P(x)`, `∃ x: Q(x)`) — *všeobecné* zákonitosti.

### Příklad: Robot v kuchyni {tier=example}

Atomická reprezentace selhává — počet stavů kombinatoricky vybuchne. Faktorizovaná dokáže říct, *kde* je hrnec, ale ne *na čem*. Strukturovaná:

```
Holding(robot, hrnec)
On(hrnec, sporák)
On(sporák, podlaha)
Boiling(voda, hrnec)
```

Pravidla typu:
```
∀ obj1, obj2: On(obj1, obj2) ∧ Move(robot, obj1, dest)
            → On(obj1, dest) ∧ ¬On(obj1, obj2)
```

### Příklad: Knowledge graph (Google)

Wikipedia + Freebase / Wikidata jako *strukturované* znalosti pro vyhledávač.
`(Praha, isCapitalOf, Czech_Republic)`, `(Albert_Einstein, hasOccupation, Physicist)`.

## Srovnání

| | Atomická | Faktorizovaná | Strukturovaná |
| :-- | :--: | :--: | :--: |
| Stav | Symbol | Vektor (X₁..X_n) | Objekty + vztahy |
| Algoritmy | Search, MDP | CSP, BN, MDP-faktor. | Plánování, FOL |
| Sdílení mezi stavy | ✗ | Částečné | Vysoké |
| Kvantifikátory | ✗ | ✗ | ✓ |
| Expresivita | Nízká | Střední | Vysoká |
| Cena inference | Nízká (per state) | Střední | Vysoká |

## Reprezentační volba určuje metody

Jeden problém lze často reprezentovat *na všech třech úrovních* — ale s různou cenou:

* **8-puzzle (Loydova osmička)** — 9! / 2 = 181 440 stavů. Reprezentace jako *vektor pozic 8 čísel* je faktorizovaná. Atomická (`s₀, s₁, ..., s_{181439}`) by fungovala, ale zbytečně velká tabulka přechodů.
* **Plánování dovolené** — města jako atomy fungují pro short trip. Pro *„zařídit si vízum, pak ubytování, pak letenku"* potřebujeme strukturované plánování s precondicemi.

V *moderní AI* hraje stále důležitější roli **distribuovaná reprezentace** — vektor embeddingů v `R^D`, kde dimenze nejsou *interpretovatelné* feature ([[embeddings]]). Toto je technicky faktorizovaná reprezentace, ale s implicitní/naučenou strukturou.

::: link "AIMA, kap. 2.4.7: Representations" "http://aima.cs.berkeley.edu/"
:::

::: link "AIMA, kap. 7-9: Logical reasoning a knowledge representation" "http://aima.cs.berkeley.edu/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Agentní pojetí* (Beneš). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 2.4.7 + 7-12 (logika a reprezentace); Brachman, R. & Levesque, H.: *Knowledge Representation and Reasoning* (Morgan Kaufmann, 2004).*
