---
title: Nerozhodnutelnost aritmetiky a souvislost s problémem zastavení
---

# Nerozhodnutelnost Peanovy aritmetiky

Gödelova 1. věta ([[godel-neuplnost]]) říká, že PA *není úplná*. Tato kapitola uzavírá topic — formálně dokazuje, že **PA je nerozhodnutelná**, a ukazuje *strukturální paralelu* s problémem zastavení ([[problem-zastaveni]]). Oba výsledky jsou *projevy téhož mechanismu* — sebereference přes kódování.

## Nerozhodnutelnost PA jako důsledek Gödela

**Věta (Church 1936, Turing 1936).** Problém *"je formule $\varphi$ dokazatelná v PA"* je **nerozhodnutelný**.

Toto je *přímý důsledek* Gödelových vět:

* PA je *efektivní*, *bezesporná* (předpokládáme), *zahrnuje aritmetiku* — splňuje předpoklady Gödela.
* Z 1. Gödela: PA *není* úplná. Existuje věta $G$, kterou PA nedokáže ani nevyvrátí.
* Pokud by existoval algoritmus rozhodující dokazatelnost v PA, vyřešil by zejména $G$ — odpověděl by "ano" nebo "ne".
* "Ne" by znamenalo $T \vdash \neg G$, což je rovněž nedokazatelné. Spor.

Tedy *žádný takový algoritmus neexistuje*. ∎

> Tento argument ukazuje, že **úplnost a rozhodnutelnost spolu úzce souvisí**: pro efektivní bezespornou teorii platí *rozhodnutelná ⇔ úplná* (důkaz v [[rozhodnutelne-teorie]]).

## Souvislost s problémem zastavení

[[problem-zastaveni]] dokázal nerozhodnutelnost HP *diagonalizací*. Gödelova věta dokazuje neúplnost PA *(strukturálně identickou) diagonalizací*. Oba výsledky jsou **dva pohledy na týž jev** — paradox sebereference.

### Strukturální paralela

| Aspekt | HP (Turing 1936) | Gödel (1931) |
| :--- | :--- | :--- |
| Doména | Turingovy stroje | Formule PA |
| Kódování | $\langle M\rangle$ — řetězec | $G(\varphi)$ — číslo |
| Univerzální stroj | $U$ simuluje libovolný TS | PA "rozumí" libovolnému dokazování (G3) |
| Sebereferenční konstrukce | TS $N$: $N(x) \uparrow \iff M_x(x) \downarrow$ | formule $G$: $G \iff \neg \mathrm{Prov}(G)$ |
| Paradox | $N$ na $\langle N\rangle$ vede ke sporu | $G$ vede ke sporu nebo nedokazatelnosti |
| Konkrétní výsledek | HP nerozhodnutelný | PA neúplná, nerozhodnutelná |

### Sjednocená redukce: HP ≤ Validity v PA

**Věta (Church, Turing).** Existuje *polynomiální redukce* $\mathrm{HP} \leq^m_P \{\varphi \mid \mathbb{N} \models \varphi\}$.

**Konstrukce.** Pro daný TS $M$ a vstup $w$ sestrojíme aritmetickou formuli $\varphi_{M, w}$ takovou, že:

$$
\mathbb{N} \models \varphi_{M, w} \iff M \text{ zastaví na } w.
$$

**Formule $\varphi_{M, w}$.** Vyjadřuje **existenci konečného výpočtu**:

::: math
\varphi_{M, w} \equiv \varphi_\text{init} \land \varphi_\Delta \land \varphi_\text{stop},
:::

kde:

* $\varphi_\text{init}$ — počáteční konfigurace na pásce.
* $\varphi_\Delta$ — konzistence přechodů (každý další krok je *legitimní* aplikací $\delta$).
* $\varphi_\text{stop}$ — existuje krok $k$, ve kterém je stroj v $q_F$.

### Konstrukce φ_init

Stav v kroku $k$ je $S(k)$, pozice hlavy $H(k)$, obsah pásky na pozici $p$ v kroku $k$ je $Z(k, p)$.

Počáteční stav, počáteční pozice hlavy, počáteční obsah pásky:

::: math
\varphi_\text{init} \equiv S(0) = q_0 \land H(0) = 1 \land Z(0, 1) = \Delta \land \Big(\bigwedge_{p=2}^{n+1} Z(0, p) = a_{p-1}\Big) \land (\forall p > n+1\, Z(0, p) = \Delta).
:::

### Konstrukce φ_stop

Stroj zastaví, když se někdy dostane do $q_F$:

::: math
\varphi_\text{stop} \equiv \exists k\, S(k) = q_F.
:::

### Konstrukce φ_Δ — konzistence kroku

Pro každou dvojici $(q, a) \in Q \times \Gamma$ a každou alternativu $\delta(q, a) = (q', X)$:

* $X = R$: $\varphi_{(q,a)} \equiv (S(k) = q \land Z(k, H(k)) = a) \to (S(k+1) = q' \land H(k+1) = H(k) + 1 \land \dots)$.
* $X = L$: analogicky.
* $X = b \in \Gamma$: $\dots \land Z(k+1, H(k)) = b \land \dots$.

A pro všechny pozice mimo hlavu *zachováme obsah*:

::: math
\forall k \forall p\, (p \neq H(k) \to Z(k+1, p) = Z(k, p)).
:::

### Korektnost

* Pokud $M$ *zastaví* na $w$, existuje konečná posloupnost konfigurací, která splňuje $\varphi_{M, w}$. Tedy $\mathbb{N} \models \varphi_{M, w}$.
* Pokud $M$ *nezastaví*, žádná konečná posloupnost nesplní $\varphi_\text{stop}$. Tedy $\mathbb{N} \not\models \varphi_{M, w}$.

Tedy: rozhodnutí "$\mathbb{N} \models \varphi_{M, w}$" je *ekvivalentní* rozhodnutí HP.

**Důsledek**: kdyby existoval algoritmus rozhodující validitu formulí v PA, řešil by HP. Tedy validita v PA je nerozhodnutelná.

## Co rozhodnutí v PA znamená pro programátora

* **Nemožnost obecných verifikátorů**: nelze obecně rozhodnout, zda program splňuje *aritmetickou specifikaci*. (Pro speciální třídy programů — třeba lineární aritmetika — je rozhodnutelné.)
* **Nedosažitelnost kompletního static analyzeru**: každý SMT solver bude *neúplný* pro program zahrnující obecnou aritmetiku.
* **Existence pravdivých-nedokazatelných tvrzení**: některá tvrzení o programech jsou *pravdivá*, ale *nedokazatelná v dané teorii*. Příklad: termination libovolného TM.

## Praktické konkrétní příklady {tier=practice}

**Goldbachova hypotéza**: každé sudé číslo > 2 je součtem dvou prvočísel. Pravdivost dosud neověřena. Není známo, zda lze dokázat v PA.

**Riemannova hypotéza**: všechny netriviální nuly zeta-funkce leží na přímce $\Re(s) = 1/2$. Bylo by možno formálně vyjádřit v PA.

**Diofantické rovnice** (Hilbertův 10. problém): "má polynomiální rovnice s celočíselnými koeficienty celočíselné řešení?" — Matyjašěvič 1970 dokázal, že je *nerozhodnutelná* (redukce z HP).

> **Matyjaševičova věta** je klasickým výsledkem v matematickém logickém kanónu — *konkrétní matematický problém* (řešení polynomu) je *prokazatelně* algoritmicky neřešitelný.

## Vlastnosti PA — souhrn

| Vlastnost | PA |
| :--- | :-: |
| **Korektní** | ano (předpoklad) |
| **Bezesporná** | ano (předpoklad, nelze dokázat *uvnitř* PA — Gödel 2.) |
| **Efektivní** | ano (axiomy jsou rozhodnutelné) |
| **Úplná** | **NE** (Gödel 1.) |
| **Rozhodnutelná** | **NE** |
| **Část. rozhodnutelná** | ano (= rekurzivně vyčíslitelná) |
| **Kategorická** | NE (má nestandardní modely) |

> **Hilbertův program** (rigorózní finitistická matematika) padl s Gödelovou větou. Ale **systematické dokazování v rámci konkrétní teorie** je *stále možné* a vede k tezi *automated theorem provers* (Coq, Isabelle, Lean) — *interaktivní* dokazování, kde člověk řídí strategii a stroj ověřuje korektnost.

## Vazba na zbytek kurzu

Topic Gödelových vět a Topic Rozhodnutelnost ([[problem-zastaveni]] – [[pcp-jazyky]]) jsou *dva přístupy k týmž zákonitostem*:

* **Rozhodnutelnost** se ptá: *co lze algoritmicky řešit?*
* **Úplnost teorií** se ptá: *co lze formálně dokázat?*

Oba aspekty jsou *propojené* — pro silné teorie platí *rozhodnutelnost ⇔ úplnost*. Nedosažitelnost obojího je důsledek **sebereference** — schopnost objektu *popisovat* sebe sama skrz kódování.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Church, A.: *A Note on the Entscheidungsproblem* (J. Symbolic Logic, 1936); Turing, A.M.: *On Computable Numbers* (Proc. London Math. Soc., 1936); Matyjašěvič, J.: *Enumerable Sets are Diophantine* (Sov. Math. Dokl., 1970); Davis, M., Matyjasevich, Y., Robinson, J.: *Hilbert's Tenth Problem* (Proc. Symp. Pure Math., 1976); Smullyan, R.: *Gödel's Incompleteness Theorems* (Oxford, 1991).*
