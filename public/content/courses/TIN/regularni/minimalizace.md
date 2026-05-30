---
title: Minimalizace DKA — odstranění nedostupných a slučování nerozlišitelných stavů
---

# Minimalizace deterministického konečného automatu

[[determinizace]] vyrobí z NKA DKA, často *zbytečně velký*. Minimalizační algoritmus z libovolného DKA sestrojí *ekvivalentní* DKA s **nejmenším možným počtem stavů**. Klíčový výsledek: minimální DKA je pro každý regulární jazyk *jednoznačný* (až na pojmenování stavů) — tzv. **kanonický tvar** regulárního jazyka.

## Dva typy nadbytečných stavů

Existují přesně dva důvody, proč DKA $M$ není minimální:

1. **Nedostupné stavy** — z $q_0$ se k nim *nelze dostat* žádným vstupem.
2. **Nerozlišitelné stavy** — dvojice stavů, které "z venku" vidíme jako stejné: pro každý zbytek vstupu obě cesty buď přijmou, nebo obě zamítnou.

Minimalizace probíhá ve dvou fázích — nejdříve odstranění nedostupných, pak slučování nerozlišitelných.

## Fáze 1: Eliminace nedostupných stavů

**Definice.** Stav $q \in Q$ je *dostupný*, pokud existuje $w \in \Sigma^*$ takové, že $(q_0, w) \vdash^*_M (q, \varepsilon)$. Jinak je *nedostupný*.

**Algoritmus** (BFS od $q_0$ po hranách $\delta$):

```
S0 := {q0}; i := 0
repeat
   S(i+1) := Si ∪ { q | ∃ p ∈ Si, ∃ a ∈ Σ : δ(p, a) = q }
   i := i + 1
until Si = S(i-1)
M' := (Si, Σ, δ|Si, q0, F ∩ Si)
```

Algoritmus je $O(|Q| \cdot |\Sigma|)$ — projde každou hranu jednou.

## Fáze 2: Slučování nerozlišitelných stavů

**Definice (rozlišování stavů).** Řetězec $w \in \Sigma^*$ **rozlišuje** dvojici stavů $q_1, q_2 \in Q$, pokud po jeho zpracování *právě jeden* ze stavů $q_3, q_4$, do kterých dorazíme, leží v $F$:

::: math
(q_1, w) \vdash^* (q_3, \varepsilon),\ (q_2, w) \vdash^* (q_4, \varepsilon), \quad |\{q_3, q_4\} \cap F| = 1.
:::

**$k$-nerozlišitelnost.** Stavy $q_1, q_2$ jsou *$k$-nerozlišitelné*, $q_1 \stackrel{k}{\equiv} q_2$, pokud je *nerozlišuje žádný* řetězec délky $\leq k$.

**Nerozlišitelnost.** $q_1 \equiv q_2$ právě když $q_1 \stackrel{k}{\equiv} q_2$ pro každé $k \geq 0$.

> $\equiv$ je relace ekvivalence (reflexivní, symetrická, tranzitivní) na $Q$.

**Definice (redukovaný DKA).** Úplně definovaný DKA je *redukovaný*, pokud žádné dva jeho stavy nejsou nerozlišitelné a žádný není nedostupný.

## Iterativní výpočet $\equiv$

Klíčový pozorování: relaci $\equiv$ vypočítáme jako *limitu* postupně zjemňovaných ekvivalencí $\stackrel{0}{\equiv}, \stackrel{1}{\equiv}, \stackrel{2}{\equiv}, \dots$

**Báze.** $q_1 \stackrel{0}{\equiv} q_2 \iff (q_1 \in F \iff q_2 \in F)$.

Tj. na začátku rozdělíme stavy na *dvě třídy*: koncové ($F$) a nekoncové ($Q \setminus F$).

**Indukční krok.** $q_1 \stackrel{k+1}{\equiv} q_2 \iff q_1 \stackrel{k}{\equiv} q_2 \land \forall a \in \Sigma: \delta(q_1, a) \stackrel{k}{\equiv} \delta(q_2, a)$.

Tj. v iteraci $k+1$ slučujeme jen ty stavy, které byly slučované v iteraci $k$ **a** jejich přechody po stejných symbolech vedou do téže třídy.

**Stop kritérium.** Jakmile $\stackrel{k+1}{\equiv}\ =\ \stackrel{k}{\equiv}$, dosáhli jsme limity. Pak $\equiv\ =\ \stackrel{k}{\equiv}$.

**Věta.** Pro DKA s $|Q| = n$ stavů platí $\equiv\ =\ \stackrel{n-2}{\equiv}$ (stačí $n-2$ iterací).

::: svg "Postupné zjemňování ekvivalence: každá iterace může rozdělit existující třídu na podtřídy"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--text-muted)" font-size="11">
    <text x="20" y="35">≡⁰</text>
    <text x="20" y="80">≡¹</text>
    <text x="20" y="125">≡²</text>
    <text x="20" y="170">≡ⁿ⁻² (= ≡)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="var(--bg-card)">
    <rect x="80" y="20" width="160" height="30" rx="6"/>
    <rect x="250" y="20" width="200" height="30" rx="6"/>
    <rect x="80" y="65" width="100" height="30" rx="6"/>
    <rect x="185" y="65" width="55" height="30" rx="6"/>
    <rect x="250" y="65" width="100" height="30" rx="6"/>
    <rect x="355" y="65" width="95" height="30" rx="6"/>
    <rect x="80" y="110" width="55" height="30" rx="6"/>
    <rect x="140" y="110" width="40" height="30" rx="6"/>
    <rect x="185" y="110" width="55" height="30" rx="6"/>
    <rect x="250" y="110" width="100" height="30" rx="6"/>
    <rect x="355" y="110" width="95" height="30" rx="6"/>
    <rect x="80" y="155" width="55" height="30" rx="6"/>
    <rect x="140" y="155" width="40" height="30" rx="6"/>
    <rect x="185" y="155" width="55" height="30" rx="6"/>
    <rect x="250" y="155" width="100" height="30" rx="6"/>
    <rect x="355" y="155" width="95" height="30" rx="6"/>
  </g>
  <g fill="var(--text)" font-family="ui-monospace, monospace" font-size="11" text-anchor="middle">
    <text x="160" y="40">F</text>
    <text x="350" y="40">Q \ F</text>
    <text x="130" y="85">{A,F}</text>
    <text x="212" y="85">∅</text>
    <text x="300" y="85">{B,C,D,E}</text>
    <text x="402" y="85">∅</text>
    <text x="107" y="130">{A,F}</text>
    <text x="160" y="130">∅</text>
    <text x="212" y="130">∅</text>
    <text x="300" y="130">{B,E}</text>
    <text x="402" y="130">{C,D}</text>
    <text x="107" y="175">{A,F}</text>
    <text x="160" y="175">∅</text>
    <text x="212" y="175">∅</text>
    <text x="300" y="175">{B,E}</text>
    <text x="402" y="175">{C,D}</text>
  </g>
  <text x="270" y="195" text-anchor="middle" fill="var(--text-muted)" font-size="10">stabilita: ≡² = ≡¹, takže ≡ = ≡²</text>
</svg>
:::

::: viz dfa-minimization "Postupně zjemňuj rozklad stavů. Barva = třída. Každá iterace rozdělí třídu, pokud přechody jejích stavů vedou do *různých* tříd. Stabilita ⇒ hotovo."
:::

## Příklad: minimalizace pomocí tabulky

DKA $M$ se stavy $\{A, B, C, D, E, F\}$, abeceda $\{a, b\}$, koncové stavy $\{A, F\}$:

| $\delta$ | $a$ | $b$ |
| :-: | :-: | :-: |
| $A$ | $F$ | $B$ |
| $B$ | $E$ | $D$ |
| $C$ | $C$ | $F$ |
| $D$ | $D$ | $A$ |
| $E$ | $B$ | $C$ |
| $F$ | $A$ | $E$ |

**Iterace 0.** Rozdělení podle $F$ vs $Q \setminus F$:

$$
\stackrel{0}{\equiv}: \{A, F\}, \{B, C, D, E\}.
$$

**Iterace 1.** Stavy $\{B, C, D, E\}$ projdeme a porovnáme jejich přechody:

| Stav | $\delta(\cdot, a)$ ve třídě | $\delta(\cdot, b)$ ve třídě |
| :-: | :-: | :-: |
| $B$ | $E \in \mathrm{II}$ | $D \in \mathrm{II}$ |
| $C$ | $C \in \mathrm{II}$ | $F \in \mathrm{I}$ |
| $D$ | $D \in \mathrm{II}$ | $A \in \mathrm{I}$ |
| $E$ | $B \in \mathrm{II}$ | $C \in \mathrm{II}$ |

$B$ a $E$ mají *obojí* přechody do třídy $\mathrm{II}$. $C$ a $D$ mají *obojí* přechody $(II, I)$. Z toho:

$$
\stackrel{1}{\equiv}: \{A, F\}, \{B, E\}, \{C, D\}.
$$

**Iterace 2.** Ověříme, že $B \stackrel{2}{\equiv} E$ a $C \stackrel{2}{\equiv} D$:

* $B$: $\delta(B, a) = E \in \{B, E\}$, $\delta(B, b) = D \in \{C, D\}$.
* $E$: $\delta(E, a) = B \in \{B, E\}$, $\delta(E, b) = C \in \{C, D\}$. ✓
* $C$: $\delta(C, a) = C \in \{C, D\}$, $\delta(C, b) = F \in \{A, F\}$.
* $D$: $\delta(D, a) = D \in \{C, D\}$, $\delta(D, b) = A \in \{A, F\}$. ✓

$\stackrel{2}{\equiv}\ = \stackrel{1}{\equiv}$ — stabilita. Tedy $\equiv = \{\{A, F\}, \{B, E\}, \{C, D\}\}$.

**Konstrukce výsledného automatu.** $Q' = \{[A], [B], [C]\}$, kde $[A] = \{A, F\}$, $[B] = \{B, E\}$, $[C] = \{C, D\}$.

::: svg "Minimální DKA: tři stavy"
<svg viewBox="0 0 540 136" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aMin" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="120" cy="70" r="22"/>
    <circle cx="270" cy="70" r="22"/>
    <circle cx="420" cy="70" r="22"/>
    <circle cx="120" cy="70" r="18" fill="none"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle">
    <text x="120" y="73">[A]</text>
    <text x="270" y="73">[B]</text>
    <text x="420" y="73">[C]</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aMin)">
    <path d="M142,65 L248,65"/>
    <path d="M248,75 L142,75"/>
    <path d="M292,65 L398,65"/>
    <path d="M398,75 L292,75"/>
    <path d="M55,70 L98,70"/>
    <path d="M420,93 Q400,118 420,118 Q442,118 422,93"/>
  </g>
  <g fill="var(--text-muted)">
    <text x="195" y="58" text-anchor="middle">a</text>
    <text x="195" y="88" text-anchor="middle">b</text>
    <text x="345" y="58" text-anchor="middle">a</text>
    <text x="345" y="88" text-anchor="middle">b</text>
    <text x="420" y="128" text-anchor="middle">a, b</text>
    <text x="25" y="73">start</text>
  </g>
</svg>
:::

## Souhrnný algoritmus

```
1. Eliminuj nedostupné stavy (BFS z q₀).
2. ≡⁰ := { (p, q) | p ∈ F ⇔ q ∈ F }
3. repeat
4.    ≡^(i+1) := { (p, q) | p ≡ⁱ q ∧ ∀a ∈ Σ: δ(p,a) ≡ⁱ δ(q,a) }
5.    i := i + 1
6. until ≡ⁱ = ≡^(i-1)
7. Q' := Q / ≡ⁱ
8. δ'([p], a) := [δ(p, a)]
9. q'₀ := [q₀]
10. F' := { [q] | q ∈ F }
```

Časová složitost naivní implementace: $O(|Q|^2 \cdot |\Sigma|)$. Existují rychlejší algoritmy:

* **Hopcroftův algoritmus** — $O(|Q| \cdot |\Sigma| \cdot \log |Q|)$ — nejlepší známý.
* **Brzozowského algoritmus** — obrať automat, determinizuj, znovu obrať, znovu determinizuj. Elegantní a *vždy vrací minimální* DKA. Worst-case exponenciální v počtu stavů; v praxi často rychlý.

## Jednoznačnost minimálního DKA

**Věta (Myhill–Nerode).** Pro každý regulární jazyk $L \subseteq \Sigma^*$ existuje *právě jeden* minimální úplně definovaný DKA (až na pojmenování stavů). Jeho stavy odpovídají *třídám ekvivalence* relace $\sim_L$ na $\Sigma^*$:

::: math
x \sim_L y \quad \stackrel{\mathrm{def.}}{\iff}\quad \forall z \in \Sigma^*: (xz \in L \iff yz \in L).
:::

Tj. dva prefixy $x, y$ jsou *ekvivalentní vůči $L$*, pokud *žádné* prodloužení $z$ je nerozlišuje (oba vede do $L$, nebo oba ne). Počet stavů minimálního DKA = počet tříd $\sim_L$.

**Důsledek (Myhill–Nerode kritérium).** Jazyk $L$ je regulární *právě tehdy*, když $\sim_L$ má **konečný** počet ekvivalenčních tříd.

Tento výsledek slouží:

* **Jako horní mez velikosti DKA** — kanonický tvar je nejmenší.
* **Jako důkazový nástroj** — pokud ukážeme, že $\sim_L$ má *nekonečně mnoho* tříd, jazyk *není* regulární. Použití v [[pumping-uzaver]].

## Praktický význam minimalizace

Minimalizace je dnes standardní krok v:

* **Lexerech** (`flex`) — výsledný DFA se *před vygenerováním tabulky* minimalizuje, ušetří paměť.
* **Verifikaci protokolů** — porovnání dvou protokolových automatů na sémantickou ekvivalenci.
* **DNS rozhodování** — některé DNS rezolvery generují minimální DFA z RV.
* **Generování regulárních výrazů z příkladů** (learning) — výsledek je *kanonický*, tj. nezávislý na pořadí vstupu.

[[pumping-uzaver]] zužitkuje minimalizaci jiným způsobem: pumping lemma vychází z faktu, že DKA má jen *konečně mnoho* stavů, takže dostatečně dlouhý vstup *musí* projít stejným stavem dvakrát.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Myhill, J.: *Finite Automata and the Representation of Events* (WADC TR-57-624, 1957); Nerode, A.: *Linear Automaton Transformations* (Proc. AMS, 1958); Hopcroft, J.E.: *An n log n Algorithm for Minimizing States in a Finite Automaton* (Stanford, 1971); Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), §4.4.*
