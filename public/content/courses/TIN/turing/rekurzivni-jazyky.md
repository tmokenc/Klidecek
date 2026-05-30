---
title: Rekurzivní a rekurzivně vyčíslitelné jazyky
---

# Rekurzivní vs. rekurzivně vyčíslitelné jazyky

Turingův stroj může mít *tři typy chování* na vstupu $w$: (1) přijmout, (2) abnormálně zastavit (zamítnout), (3) cyklit donekonečna. Toto rozdělení rozkládá třídu jazyků přijímaných TS na **dvě jemnější třídy**, které jsou v centru teorie vyčíslitelnosti.

## Definice: rekurzivní a rekurzivně vyčíslitelné

**Definice.** Jazyk $L \subseteq \Sigma^*$ je **rekurzivně vyčíslitelný** (RE, *recursively enumerable*), pokud existuje TS $M$ takový, že $L(M) = L$.

Tj. *přijímá* každé $w \in L$, ale pro $w \notin L$ se může chovat libovolně (abnormálně zastavit *nebo* cyklit).

**Definice.** Jazyk $L \subseteq \Sigma^*$ je **rekurzivní** (R, *decidable, computable*), pokud existuje **totální** TS $M$ takový, že $L(M) = L$. *Totální* znamená, že $M$ pro *každý* vstup $w$ zastaví (buď v $q_F$ pro $w \in L$, nebo v abnormální konfiguraci pro $w \notin L$).

Ekvivalentně: existuje TS $M$, který pro každý vstup *dospěje k odpovědi v konečném čase* — buď "ano" (přijetí), nebo "ne" (zamítnutí), nikdy necyklí.

## Vztah obou tříd

::: math
\text{Rekurzivní} \;\subsetneq\; \text{Rekurzivně vyčíslitelné}.
:::

Rovnou *ostrá* inkluze — některé RE jazyky nejsou rekurzivní. Kanonický příklad: jazyk **problému zastavení** $L_\mathrm{HP}$, který je RE (lze ho přijmout), ale ne rekurzivní (nelze rozhodnout). Probereme v [[problem-zastaveni]].

::: svg "Hierarchie tříd jazyků centrované na rekurzivních"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="none" stroke-width="1.2">
    <rect x="20" y="20" width="500" height="180" rx="10" stroke="var(--text-faint)"/>
    <rect x="60" y="40" width="420" height="140" rx="10" stroke="var(--accent)"/>
    <rect x="120" y="65" width="320" height="90" rx="10" stroke="var(--accent)"/>
    <rect x="180" y="85" width="200" height="50" rx="10" stroke="var(--accent)"/>
  </g>
  <g fill="var(--accent)" font-size="11">
    <text x="30" y="36" font-size="10" fill="var(--text-muted)">všechny jazyky</text>
    <text x="65" y="55">L₀ = RE — rekurzivně vyčíslitelné</text>
    <text x="125" y="80">R — rekurzivní (rozhodnutelné)</text>
    <text x="185" y="100">L₁ — kontextové (LBA)</text>
    <text x="185" y="118">L₂ — bezkontextové (PDA)</text>
    <text x="195" y="130">L₃ — regulární (FA)</text>
  </g>
  <g fill="var(--text-muted)" font-size="10">
    <text x="30" y="200">L_HP ∈ RE \ R</text>
    <text x="180" y="200">L_TOT ∉ RE  (totalita TS)</text>
    <text x="420" y="200" text-anchor="end">co-HP ∉ RE</text>
  </g>
</svg>
:::

## Klíčový rozdíl: cyklení vs. zastavení

Pro **rekurzivně vyčíslitelný** jazyk máme TS, který *přijme* $w \in L$. Pro $w \notin L$ však *nemusíme* dostat odpověď v konečném čase — TS může cyklit. Tedy *neumíme rozhodnout* členství: po libovolně dlouhém čekání není jisté, zda TS *brzy přijme* nebo *cyklí navždy*.

Pro **rekurzivní** jazyk máme totální TS, který *vždy* dospěje k odpovědi. Otázka členství je **rozhodnutelná**.

## TS přijímající RE jazyky vs. TS rozhodující R jazyky

| Vlastnost | RE (přijímání) | R (rozhodování) |
| :--- | :--- | :--- |
| Pro $w \in L$ | TS přijme | TS přijme |
| Pro $w \notin L$ | TS abnormálně zastaví **nebo** cyklí | TS abnormálně zastaví |
| Garance ukončení | žádná | vždy v konečném čase |
| Klasické označení | $L \in \mathcal{L}_0$ (typ 0) | $L \in R$ (rekurzivní) |

## Rovnost $\mathcal{L}_0 = $ RE

**Věta.** Třída jazyků přijímaných TS je shodná s třídou jazyků generovaných gramatikami typu 0 (= jazyky $\mathcal{L}_0$ Chomského hierarchie z [[chomsky-hierarchie]]).

**Důkaz** (skica obou směrů):

**(⊇) Typ 0 → RE.** Nedeterministický 2-páskový TS:
* Páska 1: vstup $w$ (read-only).
* Páska 2: pracovní páska, na ní stroj *simuluje derivaci* gramatiky. Začíná s $S$, postupně aplikuje pravidla $\alpha \to \beta$ z $P$ — nedeterministicky vybírá pravidlo a pozici aplikace.
* Stroj přijme, pokud se obsah pásky 2 *shoduje* s páskou 1 (větná forma se stala větou rovnou vstupu).

Pokud $w \in L(G)$, existuje derivace $S \stackrel{*}{\Rightarrow} w$ — stroj ji uhádne a přijme. Pokud $w \notin L(G)$, NTS nikdy nepřijme — buď neskončí, nebo abnormálně zastaví. Tedy $L(M) = L(G)$.

**(⊆) RE → Typ 0.** Pro TS $M$ sestrojíme typovou-0 gramatiku $G$, která simuluje *reverzní* posloupnost konfigurací $M$. Začneme s $S$ a vygenerujeme [konfigurace přijetí], pak postupně přepisujeme zpět ke konfiguraci $[\Delta w \Delta\dots]$, kterou ve finálním kroku přepíšeme na $w$.

Pravidla gramatiky:

* $S \to [q_F \Delta Y \Delta]$
* Pro každý přechod $\delta(p, x) = (q, y)$: pravidlo $qy \to px$.
* Pro každý $\delta(p, x) = (q, R)$: $xq \to px$.
* Pro každý $\delta(p, x) = (q, L)$: $qyx \to ypx$ (pro každé $y \in \Gamma$).
* Závěrečná pravidla "vyholí" obal $[\dots]$ a oddělovače $\Delta$.

Pak $S \stackrel{*}{\Rightarrow_G} w$ právě když $M$ přijímá $w$.

> **Klíčové pozorování.** Typ 0 gramatiky a TS jsou *navzájem převoditelné*. Tedy *Chomského hierarchie* a *Turingova-stroje pyramida* se setkávají na úrovni $\mathcal{L}_0 = \text{RE}$.

## Uzávěrové vlastnosti

| Operace | RE | R |
| :--- | :-: | :-: |
| Sjednocení $L_1 \cup L_2$ | ✓ | ✓ |
| Průnik $L_1 \cap L_2$ | ✓ | ✓ |
| Konkatenace $L_1 \cdot L_2$ | ✓ | ✓ |
| Kleeneho iterace $L^*$ | ✓ | ✓ |
| Reverz $L^R$ | ✓ | ✓ |
| Homomorfismus $h(L)$ | ✓ | NE |
| **Doplněk** $\overline{L}$ | **NE** | ✓ |
| **Rozdíl** $L_1 \setminus L_2$ | NE (obecně) | ✓ |

### Důkaz uzávěru na sjednocení (RE)

Pro $L_1, L_2 \in \text{RE}$ pomocí TS $M_1, M_2$. Sestrojíme NTS $M_\cup$:
* Nedeterministicky vybere, zda *simulovat $M_1$ nebo $M_2$*.
* Přijme, pokud zvolený stroj přijme.

Pak $w \in L_1 \cup L_2 \iff M_1$ přijme $w$ **nebo** $M_2$ přijme $w \iff M_\cup$ přijme $w$. ✓

### Důkaz uzávěru na průnik (R)

Pro $L_1, L_2 \in \text{R}$ s totálními TS $M_1, M_2$. Sestrojíme 3-páskový TS $M_\cap$:
* Páska 1: vstup.
* Páska 2: zkopíruje vstup, simuluje $M_1$. Pokud $M_1$ zamítne, $M_\cap$ zamítne.
* Páska 3: zkopíruje vstup, simuluje $M_2$. Pokud $M_2$ přijme, $M_\cap$ přijme.

Protože oba $M_i$ vždy zastaví, $M_\cap$ je totální. ✓

### Doplněk v RE — proč ne?

**Tvrzení.** Pokud $L$ a $\overline{L}$ jsou *oba* RE, pak $L$ je rekurzivní.

*Důkaz.* Spustíme TS $M$ pro $L$ a TS $M'$ pro $\overline{L}$ *paralelně* (jako dvě vlákna). Jeden z nich nakonec přijme. Pokud $M$ přijme → $w \in L$. Pokud $M'$ přijme → $w \notin L$. Tedy máme rozhodovací algoritmus.

**Důsledek.** Pokud existuje RE jazyk $L$, který *není* rekurzivní (a takový je $L_\mathrm{HP}$), pak $\overline{L}$ *není* RE — jinak bychom dostali $L \in \text{R}$.

Symbolicky:

::: math
\exists L \in \text{RE} \setminus \text{R} \implies \overline{L} \notin \text{RE}.
:::

To znamená: třída RE *není uzavřená* na doplněk.

## Hierarchie tříd jazyků

Souhrnný pohled:

::: math
\mathcal{L}_3 \subsetneq \mathcal{L}_2 \subsetneq \mathcal{L}_1 \subsetneq \mathrm{R} \subsetneq \mathrm{RE} = \mathcal{L}_0 \subsetneq \text{všechny jazyky}.
:::

Striktnost každé inkluze je dokazována *separačními jazyky*:

| Inkluze | Separační jazyk | Důkaz |
| :--- | :--- | :--- |
| $\mathcal{L}_3 \subsetneq \mathcal{L}_2$ | $\{a^n b^n\}$ | pumping pro RV |
| $\mathcal{L}_2 \subsetneq \mathcal{L}_1$ | $\{a^n b^n c^n\}$ | pumping pro CFG |
| $\mathcal{L}_1 \subsetneq \mathrm{R}$ | $L_\mathrm{diag} = \{\langle M_i\rangle : M_i$ je LBA $\wedge \langle M_i\rangle \notin L(M_i)\}$ | diagonalizace nad LBA |
| $\mathrm{R} \subsetneq \mathrm{RE}$ | $L_\mathrm{HP}$ | [[problem-zastaveni]] |
| $\mathrm{RE} \subsetneq \text{všechny}$ | $\overline{L_\mathrm{HP}}$ | doplněk RE jazyka, který není R |

## Mocnost = "počet jazyků"

**Lemma.** Pro neprázdnou konečnou abecedu $\Sigma$ je množina všech jazyků $2^{\Sigma^*}$ **nespočetná**.

*Důkaz* (Cantorovou diagonalizací). Spočetnost znamená bijekci $f : \mathbb{N} \to 2^{\Sigma^*}$. Definujme jazyk $D = \{w_i \in \Sigma^* \mid w_i \notin f(i)\}$ (využíváme spočetnost $\Sigma^*$). Pak $D$ se liší od *každého* $f(i)$ alespoň v jednom prvku ($w_i$) — spor.

**Důsledek.** Existuje jazyk, který *není* RE (= jazyk typu 0). Důvod: RE jazyků je *spočetně* mnoho (každý RE jazyk je popsán nějakým TS, a TS je řetězec konečné délky → spočetně mnoho TS). Všech jazyků je nespočetně mnoho, takže "většina" jazyků je *mimo RE*.

## Praktická interpretace

* **Rekurzivní jazyk** = problém, který *algoritmus vyřeší v konečném čase*. Příklady: "$n$ je prvočíslo", "graf je souvislý", "regulární výraz odpovídá řetězci".
* **RE jazyk, ne R** = problém, který *poznáme, když ano, ale nepoznáme, když ne*. Příklady: "TS $M$ zastaví na vstupu $w$" ([[problem-zastaveni]]), "věta $\varphi$ je dokazatelná v PA" ([[godel-neuplnost]]).
* **Ne-RE jazyk** = problém, který *nemůžeme ani parciálně rozpoznat*. Příklady: "TS $M$ *nezastaví*" (doplněk HP), "L(M) = Σ\*".

[[univerzalni-ts]] formalizuje univerzální TS — *jeden* stroj simulující všechny ostatní — a vyhlásí *Church-Turingovu tezi*.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Turing, A.M.: *On Computable Numbers* (Proc. London Math. Soc., 1936); Post, E.: *Recursive Unsolvability of a Problem of Thue* (J. Symbolic Logic, 1947); Kozen, D.C.: *Automata and Computability* (Springer 1997), kap. 24–26; Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), §3.3, §4.1.*
