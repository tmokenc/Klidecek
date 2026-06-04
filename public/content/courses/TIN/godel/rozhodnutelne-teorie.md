---
title: Rozhodnutelné teorie a eliminace kvantifikátorů
---

# Rozhodnutelné prvořádové teorie

Gödelovy věty ([[godel-neuplnost]]) ukázaly, že *Peanova aritmetika* je *neúplná* a *nerozhodnutelná*. Tato kapitola představuje *opačnou stranu* — **prvořádové teorie, které jsou rozhodnutelné**. Klasické příklady: **Presburgerova aritmetika**, **teorie racionálních čísel**, **teorie reálných čísel**. Klíčová technika: **eliminace kvantifikátorů**.

## Co dělá teorii rozhodnutelnou

Pro prvořádovou teorii $T$:

* **Rozhodnutelnost**: $\{\varphi \mid T \vdash \varphi\}$ je rozhodnutelný jazyk.
* Z věty o úplnosti PL ([[vlastnosti-pl]]): $T \vdash \varphi \iff T \models \varphi$, takže rozhodnutelnost dokazatelnosti = rozhodnutelnost platnosti v modelech $T$.

**Pro bezespornou, efektivní, syntakticky úplnou teorii** platí, že $T$ je rozhodnutelná — *generátorový algoritmus*:

```
generuj všechny řetězce v lexikografickém pořadí
   pokud najdeš důkaz φ → vrať TRUE
   pokud najdeš důkaz ¬φ → vrať FALSE
```

Z úplnosti teorie *jedna z variant* musí v konečném čase vyrobit důkaz. Tj. **bezesporná + efektivní + úplná ⇒ rozhodnutelná**.

> **Klíčové pozorování**: Gödelova věta říká, že PA *není* úplná. Nemůžeme tento triviální algoritmus použít. Otázka: *jiná* (slabší) teorie nad $\mathbb{N}$ úplná být *může*?

## Presburgerova aritmetika

**Definice.** *Presburgerova aritmetika* (PrA) je prvořádová teorie přirozených čísel (nebo celých čísel) se **sčítáním**, **rovností** a **uspořádáním**, ale **bez násobení**:

* Signatura: $\langle 0, S, +, =, < \rangle$.
* Axiomy: Peanovy axiomy *bez* násobení.

**Věta (Presburger, 1929).** Presburgerova aritmetika je **úplná** a **rozhodnutelná**.

**Důkaz** přes *eliminaci kvantifikátorů* (viz dále).

> Klíčový rozdíl od PA: *bez násobení* nemůžeme aritmetizovat dokazatelnost. Gödelovo G3 (vyjádřitelnost množiny dokázaných čísel) selhává — proto sebereferenční argument nefunguje.

**Složitost.** Rozhodovací algoritmus pro Presburgera má časovou složitost **2-EXPTIME** (dvojitě exponenciální). Není to triviální polynomiální, ale je *konečná*.

## Teorie hustého uspořádání

**Teorie hustého neomezeného lineárního uspořádání** ($\mathrm{DLO}$) má axiomy:

* Reflexivita $\forall x\, x \leq x$, antisymetrie, tranzitivita.
* Linearita: $\forall x \forall y\, (x \leq y \lor y \leq x)$.
* Hustota: $\forall x \forall y\, (x < y \to \exists z\, (x < z \land z < y))$.
* Neomezenost: $\forall x \exists y\, (x < y)$ a $\forall x \exists y\, (y < x)$.

**Věta (Cantor).** Každé dva *spočetné* modely DLO jsou izomorfní (DLO je $\aleph_0$-kategorická, důkaz metodou *back-and-forth*). Pro nespočetné mohutnosti to neplatí. Konkrétně $(\mathbb{Q}, <)$ je *kanonický spočetný model*.

**Důsledek.** DLO je **úplná** a **rozhodnutelná**.

## Teorie racionálních čísel se sčítáním

Rozšíření DLO o sčítání:

* Signatura: $\langle 0, 1, +, =, \leq\rangle$ (možná i násobení skalárem).
* Axiomy: DLO axiomy plus axiomy abelovské grupy se sčítáním, monotonie sčítání, divisible-torsion-free axiomy.

**Věta.** Teorie racionálních čísel se sčítáním je **rozhodnutelná**.

Důkaz: **Fourier-Motzkinova eliminace** (viz dále).

## Teorie reálných čísel

**Tarski (1948).** Teorie reálných čísel s $\langle 0, 1, +, \cdot, =, \leq\rangle$ — *včetně násobení* — je **rozhodnutelná**.

> Pozor — *reálná čísla s násobením* jsou rozhodnutelná! Klíčový rozdíl od PA: *kvantifikujeme přes reálná čísla*, ne přes přirozená. Reálná čísla jsou "měkčí" — můžeme dělit, brát odmocniny, atd.

Toto je překvapivý výsledek: zatímco $(\mathbb{N}, +, \cdot)$ je nerozhodnutelná, $(\mathbb{R}, +, \cdot)$ je rozhodnutelná. Důvod: v teorii reálně uzavřených těles nelze definovat podmnožinu $\mathbb{N}$ (celá čísla nejsou definovatelná), takže nelze aritmetizovat výpočty TS / dokazatelnost; v $(\mathbb{N}, +, \cdot)$ to lze, a právě to dává Gödelovu konstrukci.

## Eliminace kvantifikátorů (QE)

**Klíčová technika**: **eliminace kvantifikátorů** transformuje formuli $\exists x\, \varphi$ na *$T$-ekvivalentní* formuli $\psi$ *bez* volného $x$. Tj. pokud $\varphi$ má volné proměnné $V$, výsledek má $V \setminus \{x\}$.

::: math
T \models \exists x\, \varphi(x, y_1, \dots, y_n) \leftrightarrow \psi(y_1, \dots, y_n).
:::

**Algoritmus pro rozhodování platnosti uzavřené formule $\varphi$:**

```
procedure elim(φ):
    if φ nemá kvantifikátory: return φ
    if φ = ∃x ψ where ψ je bez kvantifikátorů:
        return QE(φ)  // eliminace kvantifikátoru x
    if φ = ∃x ψ:
        return elim(∃x (elim(ψ)))  // rekurze do ψ
    if φ = ∀x ψ:
        return elim(¬∃x ¬ψ)
    if φ = ¬ψ:
        return ¬(elim(ψ))
    if φ = ψ ∨ ψ':
        return elim(ψ) ∨ elim(ψ')
```

Po průchodu touto procedurou je formule **bez proměnných**. Pak rozhodneme její platnost přes *konkrétní výpočet* v daném modelu.

**Teorie musí připouštět QE**: pro každou $\exists x\, \varphi$ musí *existovat* ekvivalentní bezkvantifikátorová formule.

## Fourier-Motzkinova eliminace

**Konkrétní QE algoritmus** pro teorii $\mathbb{Q}$ se sčítáním. Pro formuli $\exists x\, \varphi$:

### Příprava

1. **Převeď $\varphi$ do DNF**: $\varphi = D_1 \lor D_2 \lor \dots$, kde $D_i$ jsou konjunkty atomických formulí.
2. **Přesuň $\exists$ do disjunktů**: $\exists x\, (P \lor Q) \Leftrightarrow (\exists x\, P) \lor (\exists x\, Q)$.
3. **Odstraň disjunkty bez $x$**: $\exists x\, (P \land Q) \Leftrightarrow (\exists x\, P) \land Q$, pokud $x$ není volné v $Q$.

### Hlavní krok: Fourier-Motzkinův teorém

Pro každý zbývající disjunkt $D = \bigwedge_i (c_i \leq a_i x) \land \bigwedge_j (b_j x \leq d_j)$ (kde první konjunkce jsou *dolní omezení*, druhá *horní*):

::: math
\exists x\, \Big[\bigwedge_{i=1}^m c_i \leq a_i x \;\land\; \bigwedge_{j=1}^k b_j x \leq d_j\Big] \iff \bigwedge_{i=1}^m \bigwedge_{j=1}^k b_j c_i \leq a_i d_j.
:::

> **Intuice**: $x$ je "uvnitř intervalu", jen pokud *jeho dolní mez* $\leq$ *horní mez*. Vynechání $x$ převede tuto podmínku do *kombinace* všech párů (dolní, horní).

Pokud má $\varphi$ *pouze horní* nebo *pouze dolní* omezení, eliminace vrátí `1` — $x$ může vždy existovat.

### Příklad

Formule: $\exists y \forall x\, (x \neq 5 \lor y \neq 3x)$.

Převod:
$$
\exists y \neg\exists x\, (x = 5 \land y = 3x) \iff \exists y\, \neg(y = 15) \iff \top.
$$

(Z $x = 5$ a $y = 3x$ plyne $y = 15$; existuje $y \neq 15$ — např. $y = 0$.)

Výsledek: formule je *pravdivá* (platná v $\mathbb{Q}$).

## Příklad 2 — Fourier-Motzkin

Formule: $\exists x\, (3 < x \land x + 2y \leq 6 \land y < 0) \lor \exists x\, (3x \leq 2y)$.

* 1. disjunkt: $3 < x$ je dolní omezení, $x \leq 6 - 2y$ je horní. Podmínka existence: $3 < 6 - 2y$, tj. $y < 1.5$. Plus $y < 0$. Celkem $y < 0 \land y < 1.5 \iff y < 0$.
* 2. disjunkt: $3x \leq 2y$ má jen horní omezení na $x$ → vždy existuje (např. $x$ velmi záporné).

Výsledek: $(y < 0) \lor \top = \top$. Formule je *pravdivá* pro libovolné $y$.

## Rozhodnutelné teorie a Tarskiho-Seidenbergův teorém

**Věta (Tarski-Seidenberg).** Teorie reálných uzavřených těles (= $\mathbb{R}$ s $+, \cdot, <$) je rozhodnutelná, a sice přes *cylindrickou algebraickou dekompozici* (CAD).

Klíčový krok: **eliminace existenčního kvantifikátoru** $\exists x\, \varphi(x, y_1, \dots)$ pro polynomiální nerovnosti — najít *podmínky na $y_i$*, za nichž $x$ s vlastností $\varphi$ existuje.

> Tato eliminace je **podstatně složitější** než Fourier-Motzkin — vyžaduje *algebraickou geometrii* (Gröbnerovy báze, Sturmovy posloupnosti). Praktická implementace: *Mathematica* `Reduce`, *Maple* `solve`.

## Hierarchie rozhodnutelných aritmetik

| Teorie | Síla | Rozhodnutelnost |
| :--- | :--- | :-- |
| $(\mathbb{N}, =)$ | jen identita | ✓ |
| $(\mathbb{N}, S)$ | s následníkem | ✓ |
| $(\mathbb{Q}, +, \leq)$ | sčítání racionálních | ✓ (Fourier-Motzkin) |
| $(\mathbb{Z}, +, \leq)$ | celá čísla + sčítání | ✓ (Presburger) |
| $(\mathbb{R}, +, \cdot)$ | reálná čísla + obě operace | ✓ (Tarski) |
| $(\mathbb{C}, +, \cdot)$ | komplexní + obě operace | ✓ |
| $(\mathbb{N}, +, \cdot)$ | přirozená čísla + obě operace | **✗ (Gödel)** |

> Tato tabulka shrnuje *přesnou hranici rozhodnutelnosti*. Přidání násobení do $\mathbb{R}$ je *v pořádku*, ale do $\mathbb{N}$ je *katastrofa* — Gödelova konstrukce funguje *právě* kvůli této kombinaci.

## Úplnost ≠ "přesnost definice"

* **PA je neúplná** — má více modelů (standardní $\mathbb{N}$ + nestandardní z [[vlastnosti-pl]]).
* **Presburger je úplná** — má více modelů, ale *rozdíl mezi nimi se v ní nedá vyjádřit*.

> **Klíčové**: úplnost neznamená "jediný model". Úplnost = "každá věta je *buď dokazatelná, nebo její negace*". To je *slabší* podmínka než kategorické popisování modelu.

## Praktická hodnota rozhodnutelných teorií {tier=practice}

* **SMT solvery** (Z3, CVC4, Yices) implementují QE pro Presburgera, kombinace s teorií polí, pole, bit-vectorů, atd.
* **Symbolický integrátor** ve Wolfram Mathematica používá rozhodnutelné teorie reálných čísel.
* **Verifikace hardware** (např. Intel) — formální dokazování ekvivalence obvodů přes Boolean satisfiability + aritmetika.
* **Optimalizace překladu** (LLVM): využití SMT pro důkaz, že kompilátorová transformace je sémanticky platná.

## Co rozhodnutelnost neznamená

* Rozhodnutelná ne ⇒ *efektivní*. Presburger je rozhodnutelný, ale 2-EXPTIME.
* Rozhodnutelná teorie ⇏ *úplná* (rozhodnutelná teorie nemusí být úplná). Platí jen opačně: *bezesporná + efektivní + úplná ⇒ rozhodnutelná*.
* *Většina zajímavé matematiky* je *nerozhodnutelná* (PA, ZFC, teorie algebraických struktur s parametrem).

## Žádná teorie zahrnující PA není rozhodnutelná

**Důsledek (Church)**: žádná bezesporná teorie, která zahrnuje Peanovu aritmetiku, *nemůže být rozhodnutelná* — PA je *esenciálně nerozhodnutelná* (nerozhodnutelná je každé její bezesporné rozšíření).

Tedy: *jakmile se v teorii dá vyjádřit dostatečně silná aritmetika*, ztrácíme rozhodnutelnost.

[[pa-nerozhodnutelnost]] uzavře topic — *Peanova aritmetika je nerozhodnutelná* — což je konkrétní syntéza Gödelových vět s teorií vyčíslitelnosti.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Presburger, M.: *Über die Vollständigkeit eines gewissen Systems der Arithmetik ganzer Zahlen* (Sprawozdanie z I Kongresu Mat. Krajów Słow., 1929); Tarski, A.: *A Decision Method for Elementary Algebra and Geometry* (RAND, 1948); Cooper, D.C.: *Theorem Proving in Arithmetic Without Multiplication* (Mach. Intell., 1972); Bradley, A.R., Manna, Z.: *The Calculus of Computation* (Springer 2007).*
