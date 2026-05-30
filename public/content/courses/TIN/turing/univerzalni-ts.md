---
title: Univerzální TS a Church-Turingova teze
---

# Univerzální Turingův stroj

Klíčový moment teorie vyčíslitelnosti: lze sestrojit *jeden* TS, který *simuluje libovolný* TS popsaný jako řetězec na vstupu. Tento **univerzální Turingův stroj** $U$ uvedl Alan Turing ve své práci z roku 1936 a je *přímou matematickou předlohou* moderního programovatelného počítače.

## Kódování TS jako řetězec

Aby $U$ mohl libovolný TS *simulovat*, musí ho dostat *zapsaný* jako řetězec. Pro pevně zvolenou kódovací konvenci $\langle M\rangle$ (encoding) přiřadíme každému TS $M$ jednoznačný řetězec nad nějakou abecedou (typicky binární $\{0, 1\}^*$).

**Kódovací schéma** (jedna z mnoha možností):

* Stavy $q_0, q_1, \dots, q_{|Q|-1}$ jsou kódovány unárně: $q_i \mapsto 0^{i+1}$.
* Symboly pásky $X_1 = \Delta, X_2, \dots, X_{|\Gamma|}$: $X_i \mapsto 0^i$.
* Operace $L, R$: $0^{|\Gamma|+1}, 0^{|\Gamma|+2}$.
* Přechod $\delta(q_i, X_j) = (q_k, X_l)$ se zapíše jako blok $0^{i+1}\,1\,0^j\,1\,0^{k+1}\,1\,0^l$.
* Bloky jsou odděleny `11`. Konec kódu je `111`.

Konkrétní volba schématu není podstatná — důležité je, že **každý** TS má jednoznačné kódování a každý "rozumný" řetězec popisuje *nějaký* TS (případně chybový případ).

**Důsledek.** Množina kódů všech TS je *spočetná* a algoritmicky uchopitelná. Tedy můžeme TS *vyjmenovat* $M_1, M_2, M_3, \dots$

## Univerzální TS $U$

**Definice.** *Univerzální Turingův stroj* je TS $U$, který přijímá jako vstup dvojici $\langle M, w\rangle$ — kód libovolného TS $M$ a vstupní řetězec $w$ — a *chová se přesně jako $M$ na vstupu $w$*:

* Pokud $M$ přijímá $w$, $U$ přijme $\langle M, w\rangle$.
* Pokud $M$ zamítá $w$ abnormálním zastavením, $U$ také zamítne (abnormálně zastaví).
* Pokud $M$ cyklí na $w$, $U$ cyklí.

Formálně:

::: math
L(U) = \{\langle M, w\rangle \mid w \in L(M)\}.
:::

## Konstrukce $U$

Univerzální TS lze realizovat jako 3-páskový TS:

* **Páska 1 (vstup)**: zakódovaný TS $M$ a vstup $w$, oddělené značkou.
* **Páska 2 (simulovaná páska)**: aktuální obsah pásky $M$. Na začátku obsahuje $w$.
* **Páska 3 (stav)**: aktuální stav řízení $M$ (jako kód $0^{i+1}$).

**Jeden krok simulace** kroku $M$:
1. Přečte symbol z pásky 2 v aktuální pozici hlavy.
2. Přečte aktuální stav z pásky 3.
3. Prohledá kód $M$ na pásce 1, najde *odpovídající přechod* $\delta(q, x)$.
4. Aplikuje přechod: zapíše nový stav na pásku 3, modifikuje pásku 2.

Tato simulace prodlužuje běh konstantním faktorem ($O(|M| \cdot |\text{krok}|)$ za jeden krok původního $M$). Tj. pro pevně daný $M$ je zpomalení konstantním faktorem (závislým na $|M|$); běh univerzálního TS je *lineární* vzhledem k počtu kroků simulovaného stroje.

> **Důsledek**: jediná abstraktní mašinerie $U$ stačí na *přehrání* libovolného algoritmu. Toto je *teoretická základna programovatelného počítače* — moderní CPU s instrukční sadou je v podstatě konkrétní implementace univerzálního stroje, kde "kód $M$" je program v paměti.

## Church-Turingova teze

**Teze (Church–Turing).** *Turingovy stroje* (a jim ekvivalentní výpočetní modely) definují svou výpočetní silou přesně to, co intuitivně považujeme za **efektivně vyčíslitelné**.

> **Pozn.** Není to teorém — nedá se formálně dokazovat, protože "efektivně vyčíslitelné" je *intuitivní pojem*, ne matematická definice.

### Argumenty pro tezi

1. **Robustnost TS.** Různé varianty TS (multi-tape, multi-track, nedeterministické, vícepáskové, …) mají *stejnou* sílu ([[ts-modifikace]]).
2. **Ekvivalence s nezávislými modely.** Dokázáno, že TS jsou silově ekvivalentní s:
   * **λ-kalkul** (Church, 1936),
   * **Parciálně rekurzivní funkce** (Gödel, Kleene, 1936),
   * **Postovy stroje** (Post, 1936),
   * **Minského stroje** (counter machines),
   * **Markovovy normální algoritmy**,
   * **Náhodný přístupový stroj** (RAM) — abstraktní model klasického počítače,
   * **Branching programs**, **Tag systems**, **Cyclic tag systems**, ...
3. **Empirická neporazitelnost.** Není znám *žádný* fyzikálně realizovaný výpočetní proces, který by řešil úlohu *mimo* sílu TS. Kvantové počítače mají silově *tutéž* třídu (BQP ⊆ PSPACE, ale stále podtřída TS).

### Co Church-Turingova teze neříká

* **Není** o efektivitě výpočtu — pouze o *vyčíslitelnosti*. Polynomiální vs. exponenciální čas teze nerozlišuje (to je rolí [[tridy-p-np]]).
* **Není** o realističnosti modelu — TS je idealizovaný (neomezená páska, perfektní instrukce). Konkrétní implementace mají vždy fyzická omezení (paměť, čas, energie).

## Existence neRE jazyků

Spočetnost TS má **přímý důsledek**: existují jazyky, které *žádný* TS nepřijímá.

**Věta.** Pro každou neprázdnou konečnou abecedu $\Sigma$ existuje jazyk $L \subseteq \Sigma^*$, který **není** typu 0 (= není RE).

**Důkaz** (Cantorova diagonalizace).

* Množina všech TS s abecedou $\Gamma = \Sigma \cup \{\Delta\}$ je **spočetná** — vyplývá z konečnosti kódování. Tedy *všechny RE jazyky nad $\Sigma$ jsou spočetné*.
* Avšak $\Sigma^*$ má spočetně mnoho prvků, takže $2^{\Sigma^*}$ je **nespočetná** (Cantorova věta).
* Rozdíl: existují jazyky, které nejsou v žádném TS. ∎

**Konkrétní příklad** — diagonální jazyk:

::: math
L_D = \{w_i \in \Sigma^* \mid w_i \notin L(M_i)\},
:::

kde $w_1, w_2, \dots$ a $M_1, M_2, \dots$ jsou *spočetné* uspořádání řetězců a TS. $L_D$ se *liší* od *každého* $L(M_i)$ alespoň v elementu $w_i$. Tedy $L_D$ není přijímán *žádným* TS.

> Toto je jeden ze základních důkazů "nemožnosti" v teorii vyčíslitelnosti. Konkrétnější diagonalizace dají [[problem-zastaveni]] (neexistence rozhodovacího algoritmu pro HP) a [[godel-neuplnost]] (neexistence úplného formálního systému pro aritmetiku).

## Důsledek pro praxi

* **Žádný univerzální debugger.** Neexistuje TS, který by pro libovolný program *a* libovolný vstup řekl "tento program zastaví" — je to nerozhodnutelný problém ([[problem-zastaveni]]). To znamená, že debuggovací nástroje jsou *vždy* nutně neúplné.
* **Existují "nemožné" otázky.** I když máme nejlepší programátory, *některé* otázky o programech nelze algoritmicky zodpovědět. Rice ([[riceova-veta]]) tuto třídu charakterizuje.
* **Programovatelnost.** TS jako *programovatelný stroj* je *teoretický základ* všech moderních počítačů. Architektura "code is data" (von Neumann 1945) je přímou inspirací univerzálním strojem.

## Lineárně omezený automat (LBA)

V Chomského hierarchii leží *třída kontextových jazyků* $\mathcal{L}_1$ mezi $\mathcal{L}_2$ a $\mathcal{L}_0$. Jejich akceptační model je **lineárně omezený automat** — nedeterministický TS, *který nikdy neopustí část pásky, na níž je zapsán vstup*.

**Definice.** LBA má speciální symbol konce pásky, který *nelze přepsat* ani *přes něj posunout doprava*. Vstupní pásku tedy nelze rozšířit — k dispozici je $|w|$ buněk pro vstup $w$.

**Věta.** Třída jazyků přijímaných LBA = $\mathcal{L}_1$ (kontextové jazyky).

**Věta.** Každý kontextový jazyk je rekurzivní.

*Důkaz* (idea). LBA má jen *konečně mnoho různých konfigurací* na pásce délky $|w|$ — zhruba $c^{|w|}$ pro nějaké $c$ (konstantní symboly × stavy × pozice). Protože konfigurací je jen konečně mnoho ($\approx c^{|w|}$), počítáme kroky; pokud jejich počet překročí $c^{|w|}$, musí se nějaká konfigurace zopakovat — stroj tedy cyklí donekonečna a vstup zamítneme. Jinak se zastaví do $c^{|w|}$ kroků. Membership je proto rozhodnutelné.

**Otevřený problém** (cca 60 let): je deterministický LBA stejně silný jako nedeterministický? Stále *otevřená otázka* — *LBA-problem*.

Třída $\mathcal{L}_1$ je tedy *přísně mezi* $\mathcal{L}_2$ a $\text{R}$ — žádná z inkluzí $\mathcal{L}_2 \subsetneq \mathcal{L}_1 \subsetneq \text{R}$ není rovností.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Turing, A.M.: *On Computable Numbers* (Proc. London Math. Soc., 1936); Church, A.: *An Unsolvable Problem of Elementary Number Theory* (Amer. J. Math., 1936); Kuroda, S.-Y.: *Classes of Languages and Linear-Bounded Automata* (Inf. and Control, 1964); Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), §8.3, §9.3.*
