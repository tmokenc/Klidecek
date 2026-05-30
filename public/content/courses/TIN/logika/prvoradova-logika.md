---
title: Predikátová logika prvního řádu
---

# Predikátová logika prvního řádu (PL)

Výroková logika ([[vyrokova-logika]]) je *expresivně omezená* — neumí popsat *strukturu* objektů, *vztahy* mezi nimi, *kvantifikaci*. **Predikátová logika prvního řádu** přidává:

* **Predikátové symboly** ($p, q, R, \dots$) — relace mezi objekty.
* **Funkční symboly** ($f, g, +, \dots$) — operace nad objekty.
* **Kvantifikátory** ($\forall, \exists$) — "pro každé / existuje".

To umožňuje formalizovat *matematiku*, *programy*, *databáze* — jakoukoli oblast s objekty a vztahy.

## Syntaxe PL

**Signatura jazyka** PL je dvojice $\langle F, P\rangle$:
* $F$ = množina **funkčních symbolů**, každý s **aritou** $n \geq 0$. Píšeme $f/n \in F$.
* $P$ = množina **predikátových symbolů** s aritou. Píšeme $p/n \in P$.

> **Pozn.** Konstanty jsou *funkční symboly arity 0*. Predikáty arity 0 jsou *výrokové proměnné* VL.

Plus **množina proměnných** $\mathcal{X}$.

**Jazyk formulí PL** je dán dvojstupňovou gramatikou:

::: math
\begin{aligned}
\varphi &\to p(t, t, \dots, t) \mid \neg(\varphi) \mid (\varphi \land \varphi) \mid (\exists x\, \varphi) \quad \text{kde } p/n \in P \\
t &\to f(t, t, \dots, t) \mid x \quad \text{kde } x \in \mathcal{X},\ f/m \in F
\end{aligned}
:::

**Pojmy:**
* **Term** $t$ je *cokoli, co se vyhodnotí na objekt*: proměnné a aplikace funkcí.
* **Atomická formule** $p(t_1, \dots, t_n)$ — predikát aplikovaný na termy.
* **Spojky** $\lor, \to, \leftrightarrow$ + konstanty $0, 1$ jsou *syntaktický cukr* jako ve VL.
* **Univerzální kvantifikátor**: $(\forall x\, \varphi) \equiv \neg(\exists x\, \neg\varphi)$.

## Volné a vázané proměnné

V $(\exists x\, \varphi)$ je $x$ **vázaná** v $\varphi$. Pokud $x$ v podformuli není vázané a *vyskytuje* se v ní, je **volné**.

* **Věta** (uzavřená formule, *closed formula*, *sentence*) = formule bez volných proměnných.
* **Otevřená formule** má aspoň jednu volnou proměnnou.

> Volné proměnné se chovají jako *parametry* — pravdivost závisí na jejich přiřazení. Uzavřená formule má *absolutní pravdivostní hodnotu* (vůči interpretaci).

## Sémantika PL

**Interpretace** (model, realizace) jazyka se signaturou $\langle F, P\rangle$ a proměnnými $\mathcal{X}$ je pár $I = (D_I, \alpha_I)$:

* $D_I$ — **doména**, libovolná *neprázdná* množina (objekty, o kterých mluvíme).
* $\alpha_I$ — **přiřazení**:
  * $\alpha_I(x) \in D_I$ pro proměnnou $x$.
  * $\alpha_I(f) : D_I^m \to D_I$ pro $f/m \in F$.
  * $\alpha_I(p) \subseteq D_I^n$ pro $p/n \in P$.

> Tj. interpretace fixuje *univerzum*, *význam každé funkce a relace* a *hodnotu každé volné proměnné*.

### Vyhodnocení termů

Termy se vyhodnocují *induktivně*:

::: math
\alpha_I(f(t_1, \dots, t_n)) = \alpha_I(f)(\alpha_I(t_1), \dots, \alpha_I(t_n)).
:::

### Splnění formule

**Relace $I \models \varphi$:**

::: math
\begin{aligned}
I \models p(t_1, \dots, t_n) &\iff (\alpha_I(t_1), \dots, \alpha_I(t_n)) \in \alpha_I(p), \\
I \models \varphi_1 \land \varphi_2 &\iff I \models \varphi_1 \text{ a zároveň } I \models \varphi_2, \\
I \models \neg\varphi &\iff I \not\models \varphi, \\
I \models \exists x\, \varphi &\iff I[x/v] \models \varphi \text{ pro nějaké } v \in D_I.
\end{aligned}
:::

Zde $I[x/v]$ označuje interpretaci, kde *hodnota proměnné $x$* je přesměrována na $v$.

**Pokud $I \models \varphi$**, říkáme, že $I$ je **modelem** $\varphi$.

## Příklad: model pro $\forall x \exists y\, p(x, y)$

Vezměme signaturu $\{p/2\}$ a formuli $\varphi = \forall x \exists y\, p(x, y)$.

**Interpretace 1**: $D_1 = \mathbb{N}$, $p(x, y) \iff x < y$.

* Pro každé $x \in \mathbb{N}$ existuje $y = x + 1$ s $p(x, y)$. Tedy $I_1 \models \varphi$.

**Interpretace 2**: $D_2 = \{0, 1\}$, $p(x, y) \iff x < y$.

* Pro $x = 1$ neexistuje $y \in \{0, 1\}$ s $1 < y$. Tedy $I_2 \not\models \varphi$.

**Interpretace 3**: $D_3 = \mathbb{N}$, $p(x, y) \iff x = y \cdot 2$.

* Pro $x = 3$ neexistuje $y \in \mathbb{N}$ s $3 = 2y$. Tedy $I_3 \not\models \varphi$.

> *Tatáž* formule může mít *různé pravdivosti* v různých interpretacích — to je *fundamentální* rys PL, který VL neměla.

## Pojmy v PL

| Pojem | Definice |
| :--- | :--- |
| **Platná** (logically valid) | $\models \varphi$ ⟺ $I \models \varphi$ pro každou interpretaci $I$ |
| **Splnitelná** | Existuje $I$ s $I \models \varphi$ |
| **Nesplnitelná** | $I \not\models \varphi$ pro každé $I$ |
| **Ekvivalentní** | $\varphi \equiv \psi$ ⟺ $\forall I: I \models \varphi \iff I \models \psi$ |
| **Důsledek** $T \models \varphi$ | Každý model $T$ je modelem $\varphi$ |
| **Teorie** | Množina formulí (např. všechny axiomy aritmetiky) |

Pojem **modelu teorie** $T$ — interpretace, která splňuje *všechny* formule z $T$.

## Klasické příklady formulí

* **Reflexivita relace $p$**: $\forall x\, p(x, x)$.
* **Symetrie**: $\forall x \forall y\, (p(x, y) \to p(y, x))$.
* **Tranzitivita**: $\forall x \forall y \forall z\, (p(x, y) \land p(y, z) \to p(x, z))$.
* **Ekvivalence**: konjunkce výše tří.
* **Antisymetrie**: $\forall x \forall y\, (p(x, y) \land p(y, x) \to x = y)$.
* **Funkčnost relace**: $\forall x \forall y \forall y'\, (p(x, y) \land p(x, y') \to y = y')$.
* **Totalita**: $\forall x \exists y\, p(x, y)$.

Tyto schémata pokrývají *všechny vlastnosti relací* jako uspořádání, ekvivalence, funkce — a tvoří *základ formálního zápisu matematiky*.

## Příklady z aritmetiky

**Peano aritmetika** (PA) definuje přirozená čísla axiomy:

* Konstanta $0$, funkce *následník* $s/1$.
* $\forall x\, \neg(s(x) = 0)$ — 0 není následník.
* $\forall x \forall y\, (s(x) = s(y) \to x = y)$ — následník je injektivní.
* **Indukční schéma**: $(\varphi(0) \land \forall x\, (\varphi(x) \to \varphi(s(x)))) \to \forall x\, \varphi(x)$.

PA umožňuje formalizovat klasická tvrzení: *prvočíselnost, Fermatova věta, …*. Plus rekurzivně definovat sčítání, násobení, atd.

[[godel-neuplnost]] dokáže klíčový negativní výsledek: PA je *neúplná* — existují *pravdivá* tvrzení o $\mathbb{N}$, která PA *nedokáže*.

## Existenční důsledek a Skolemizace

**Existenční formule** $\exists x\, \varphi$ "tvrdí", že existuje vhodný objekt. V kompaktnější syntaxi lze tento objekt *pojmenovat* — **Skolemova funkce** $f$:

::: math
\exists x\, \varphi(x, y_1, \dots, y_n) \mapsto \varphi(f(y_1, \dots, y_n), y_1, \dots, y_n),
:::

kde $f$ je *nový* funkční symbol arity $n$ ($n$ = počet ohraničujících univerzálních kvantifikátorů).

**Příklad**: $\forall x \exists y\, p(x, y) \mapsto \forall x\, p(x, f(x))$ — funkce $f$ vrací "svědka" $y$ pro každé $x$.

> **Důsledek**: každá PL formule se převede na **prenexovou normální formu** (PNF) — všechny kvantifikátory dopředu, pak formule bez kvantifikátorů. Pak skolemizací odstraníme existenční kvantifikátory. Výsledná formule (bez existenčních kvantifikátorů) je *ekvi-splnitelná* s původní.

## Prenexová normální forma

**Definice.** Formule je v **prenexové normální formě** (PNF), pokud má tvar

::: math
Q_1 x_1 Q_2 x_2 \dots Q_n x_n\, \psi,
:::

kde $Q_i \in \{\forall, \exists\}$ a $\psi$ je *otevřená* formule (bez kvantifikátorů).

**Převod do PNF** přes přepisovací pravidla:
* $\neg \forall x\, \varphi \equiv \exists x\, \neg\varphi$,
* $\neg \exists x\, \varphi \equiv \forall x\, \neg\varphi$,
* $(\forall x\, \varphi) \land \psi \equiv \forall x\, (\varphi \land \psi)$ (pokud $x$ není volné v $\psi$),
* analogicky pro $\lor, \to$.

**Příklad**: $\forall x \exists y\, p(x, y) \to \exists z\, q(z)$ převedeme na

::: math
\exists x \forall y\, (p(x, y) \to \exists z\, q(z)) \;\;\rightsquigarrow\;\; \exists x \forall y \exists z\, (\neg p(x, y) \lor q(z)).
:::

## Decidabilita PL

**Věta (Church, Turing 1936).** Problém **platnosti** formule PL je **nerozhodnutelný**.

*Tj. neexistuje algoritmus, který by pro libovolnou PL formuli $\varphi$ rozhodl, zda $\models \varphi$.*

**Důkaz**: redukce z [[problem-zastaveni]]. Pro daný TS $M$ a vstup $w$ sestrojíme formuli $\varphi_{M, w}$, která je platná ⟺ $M$ zastaví na $w$. Detaily v [[pa-nerozhodnutelnost]].

> **Důsledek**: i když PL je *efektivní* dokazovací systém (algoritmicky ověříme správnost důkazu), *hledání* důkazů obecně *nelze* algoritmizovat — můžeme jen *systematicky generovat* všechny důkazy (Henkin completeness) a *čekat*, zda nějaký uspěje.

## Rozhodnutelné podsystémy PL

Některé *podtřídy* PL jsou rozhodnutelné:

* **Pouze unární predikáty** (Behmann 1922) — rozhodnutelná v PSPACE.
* **Bez funkčních symbolů, bez rovnosti** (Ackermann 1928, Bernays-Schönfinkel) — *Bernays-Schönfinkelova třída*.
* **Bez existenčních kvantifikátorů (univerzální PL)** — *kvazi-rozhodnutelná*.
* **Pouze 2 proměnné** — $\mathrm{FO}^2$, NEXPTIME.
* **Monadická logika druhého řádu** nad slovy (MSO) — rozhodnutelná (Büchi 1960).
* **Presburgerova aritmetika** (přirozená čísla s + bez × ) — rozhodnutelná (Presburger 1929), ale 2-EXPTIME.

> Hranice rozhodnutelnosti běží *uvnitř* PL — i drobné rozšíření (přidání $\cdot$ k Presburgeru → Peano) tlačí složitost přes hranici rozhodnutelnosti.

[[vlastnosti-pl]] zformalizuje **věty o úplnosti a kompaktnosti** — že dokazatelnost a platnost se v PL shodují (na rozdíl od silnějších logik).

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Frege, G.: *Begriffsschrift* (1879) — historický počátek PL; Mendelson, E.: *Introduction to Mathematical Logic* (6th ed., CRC 2015), kap. 2; Enderton, H.B.: *A Mathematical Introduction to Logic* (2nd ed., Academic Press 2001); Skolem, T.: *Logisch-kombinatorische Untersuchungen über die Erfüllbarkeit oder Beweisbarkeit mathematischer Sätze* (1920) — Skolemizace.*
