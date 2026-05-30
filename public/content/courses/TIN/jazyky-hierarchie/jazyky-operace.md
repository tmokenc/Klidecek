---
title: Abeceda, slova, jazyky a operace nad nimi
---

# Formální jazyky — základní pojmy

Teoretická informatika začíná u nejabstraktnějšího pohledu na výpočet: každý výpočetní problém lze přeformulovat jako otázku, **zda zadané slovo patří do jistého jazyka**. Tato sekce zavádí slovník a operátory, kterými budeme s jazyky pracovat ve všech následujících kapitolách — od konečných automatů přes Turingovy stroje až po Gödelovo číslování formulí.

## Abeceda, řetězec, jazyk

**Abeceda** $\Sigma$ je libovolná *neprázdná konečná* množina symbolů. Řetězec (slovo) nad $\Sigma$ je konečná posloupnost

$$
w = a_1 a_2 \dots a_n, \quad a_i \in \Sigma.
$$

**Délku** $|w| = n$ definujeme jako počet symbolů. Speciálním řetězcem je **prázdný řetězec** $\varepsilon$ s $|\varepsilon| = 0$. Množina $\Sigma^*$ obsahuje *všechny konečné řetězce* nad $\Sigma$ včetně $\varepsilon$; množina $\Sigma^+ = \Sigma^* \setminus \{\varepsilon\}$ obsahuje *všechny neprázdné řetězce*.

**Formální jazyk** nad abecedou $\Sigma$ je libovolná podmnožina $L \subseteq \Sigma^*$. Jazyk může být konečný ($L_1 = \{01, 0011\}$), nekonečný s pravidelnou strukturou ($L_2 = \{0^n 1^n \mid n \geq 0\}$) i nekonečný s netriviální strukturou ($L_3 = \{ww^R \mid w \in \{0,1\}^+\}$ — všechny palindromy sudé délky).

::: svg "Hierarchie pojmů: symbol → řetězec → jazyk"
<svg viewBox="0 0 540 170" font-family="ui-sans-serif, system-ui" font-size="12">
  <g stroke="var(--line)" stroke-width="1" fill="none">
    <rect x="20" y="60" width="80" height="50" rx="6"/>
    <rect x="140" y="40" width="120" height="90" rx="6"/>
    <rect x="300" y="20" width="220" height="130" rx="6"/>
  </g>
  <g fill="var(--text)" font-size="12" text-anchor="middle">
    <text x="60" y="92">a, b, c</text>
    <text x="60" y="50" fill="var(--text-muted)" font-size="11">symbol</text>
    <text x="200" y="80">abba</text>
    <text x="200" y="100">ε</text>
    <text x="200" y="30" fill="var(--text-muted)" font-size="11">řetězec w ∈ Σ*</text>
    <text x="410" y="65">{ε, a, ab, aab, ...}</text>
    <text x="410" y="90">{aⁿbⁿ | n ≥ 0}</text>
    <text x="410" y="115">{ww^R | w ∈ Σ⁺}</text>
    <text x="410" y="14" fill="var(--text-muted)" font-size="11">jazyk L ⊆ Σ*</text>
  </g>
  <g stroke="var(--accent-line)" stroke-width="1.2" fill="none" marker-end="url(#aH1)">
    <line x1="100" y1="85" x2="138" y2="85"/>
    <line x1="260" y1="85" x2="298" y2="85"/>
  </g>
  <defs>
    <marker id="aH1" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

Notační konvence (které budeme používat napříč celým kurzem):

* malými latinskými písmeny $a, b, c, \ldots$ označujeme **symboly**,
* malými písmeny z konce abecedy $u, v, w, x, y, z$ označujeme **řetězce**,
* velkými písmeny $L, M, N$ označujeme **jazyky**.

## Operace nad řetězci

**Konkatenace** (zřetězení) je nejdůležitější operace nad slovy. Pro $w = a_1 \dots a_n$ a $w' = b_1 \dots b_m$ klademe

$$
w \cdot w' = a_1 a_2 \dots a_n\, b_1 b_2 \dots b_m.
$$

Tečku obvykle vynecháváme a píšeme prostě $w w'$. Vlastnosti, které budeme používat automaticky:

| Vlastnost | Zápis |
| :--- | :--- |
| Délka součinu | $\lvert w w' \rvert = \lvert w \rvert + \lvert w' \rvert$ |
| Asociativita | $w(w'w'') = (ww')w''$ |
| Jednotka | $w \varepsilon = \varepsilon w = w$ |

Z toho plyne, že $\langle \Sigma^*, \cdot, \varepsilon \rangle$ je **monoid** — algebraická struktura s asociativní binární operací a neutrálním prvkem.

Další pojmy nad řetězci, které se objeví dál:

* **Prefix** (předpona): $u$ je prefix $w$, pokud existuje $v$ tak, že $w = uv$.
* **Sufix** (přípona): $v$ je sufix $w$, pokud existuje $u$ tak, že $w = uv$.
* **Podřetězec**: $x$ je podřetězec $w$, pokud $w = uxv$ pro nějaké $u, v$.
* **Mocnina symbolu**: $a^k = \underbrace{a a \dots a}_{k\text{-krát}}$; speciálně $a^0 = \varepsilon$.
* **Reverz**: $w^R$ je řetězec přečtený od konce: $(a_1 a_2 \dots a_n)^R = a_n \dots a_2 a_1$.
* **Počet výskytů**: $\#_a(w)$ je počet výskytů symbolu $a$ v řetězci $w$.

## Operace nad jazyky

Jazyk je *množina* — proto nad jazyky platí všechny obvyklé množinové operace **sjednocení**, **průnik**, **rozdíl** a **doplněk**:

$$
L_1 \cup L_2, \quad L_1 \cap L_2, \quad L_1 \setminus L_2, \quad \overline{L} = \Sigma^* \setminus L.
$$

Doplněk se v literatuře značí také $\mathrm{co}\text{-}L$ a explicitně závisí na zvolené abecedě — jiná abeceda znamená jiný doplněk.

Specificky pro jazyky (kvůli přítomnosti řetězců) přidáváme **konkatenaci** a **iteraci**.

**Konkatenace jazyků** $L_1, L_2$ je definována přirozeným rozšířením konkatenace řetězců:

$$
L_1 \cdot L_2 = \{xy \mid x \in L_1 \land y \in L_2\}.
$$

**$n$-tá mocnina jazyka**: $L^0 = \{\varepsilon\}$ a $L^n = L \cdot L^{n-1}$ pro $n \geq 1$.

**Kleeneho iterace** (Kleene star) a **pozitivní iterace**:

$$
L^* = \bigcup_{n \geq 0} L^n, \qquad L^+ = \bigcup_{n \geq 1} L^n.
$$

Mezi iteracemi platí $L^* = L^+ \cup \{\varepsilon\}$ a $L^+ = L \cdot L^* = L^* \cdot L$. Kleeneho hvězda je centrální — definuje "libovolný počet opakování (včetně nuly)" a vyskytuje se ve všech formalizacích jazyků: v regulárních výrazech, v gramatikách typu Backus–Naur i v *iterativním* tvaru důkazů.

::: svg "Iterace jazyka L = {ab, c} po jednotlivých mocninách"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="12">
  <g fill="var(--text-muted)" font-size="11">
    <text x="20" y="35">L⁰</text>
    <text x="20" y="65">L¹</text>
    <text x="20" y="95">L²</text>
    <text x="20" y="125">L³</text>
    <text x="20" y="160">L*</text>
  </g>
  <g fill="var(--text)" font-family="ui-monospace, monospace" font-size="11.5">
    <text x="60" y="35">{ε}</text>
    <text x="60" y="65">{ab, c}</text>
    <text x="60" y="95">{abab, abc, cab, cc}</text>
    <text x="60" y="125">{ababab, ababc, abcab, abcc, cabab, cabc, ccab, ccc}</text>
    <text x="60" y="160">{ε, ab, c, abab, abc, cab, cc, ababab, ...} = L⁰ ∪ L¹ ∪ L² ∪ ...</text>
  </g>
  <line x1="50" y1="140" x2="510" y2="140" stroke="var(--line-strong)" stroke-dasharray="3 3"/>
</svg>
:::

## Algebra jazyků jako polookruh

Struktura $\langle 2^{\Sigma^*}, \cup, \cdot, \emptyset, \{\varepsilon\} \rangle$ tvoří **polookruh** (semiring):

1. $\langle 2^{\Sigma^*}, \cup, \emptyset \rangle$ je komutativní monoid (sjednocení je komutativní a asociativní, $\emptyset$ je neutrální).
2. $\langle 2^{\Sigma^*}, \cdot, \{\varepsilon\} \rangle$ je monoid (konkatenace je asociativní, $\{\varepsilon\}$ je neutrální).
3. Distributivita: $L_1 \cdot (L_2 \cup L_3) = L_1 L_2 \cup L_1 L_3$ a $(L_1 \cup L_2) \cdot L_3 = L_1 L_3 \cup L_2 L_3$.

Polookruhová struktura je důležitá: znamená, že manipulace s jazyky se chová "skoro" jako manipulace s polynomy, jen *nelze odečítat* (sjednocení nemá inverz). V kapitole [[regularni-vyrazy]] na ní postavíme **Kleeneho algebru**, díky které budeme řešit *soustavy rovnic nad jazyky*.

::: math
\Big\langle 2^{\Sigma^*},\; \cup,\; \cdot,\; \emptyset,\; \{\varepsilon\} \Big\rangle \quad \text{je polookruh.}
:::

## Drobnost: identity nemusí platit

Začínajícího studenta čekává jedna typická past — *intuitivní rozšiřování* identit z čísel na jazyky často selže. Ilustrativní příklad:

> *Platí $L_1^* \cup L_2^* = (L_1 \cup L_2)^*$ pro libovolná $L_1, L_2 \subseteq \Sigma^*$?*

**Ne.** Vezměme $L_1 = \{a\}$ a $L_2 = \{b\}$. Pak $L_1^* \cup L_2^* = \{a\}^* \cup \{b\}^* = \{a^n \mid n \geq 0\} \cup \{b^n \mid n \geq 0\}$, ale $(L_1 \cup L_2)^* = \{a, b\}^*$ obsahuje i smíšené řetězce jako $ab$, $ba$, $abba$, ... Identita tedy obecně neplatí.

Stejně jako u jakékoli algebraické struktury — než identitu použijeme, musíme ji nejdřív dokázat. Tuto zásadu si nese kurz až do logiky ([[vyrokova-logika]]) a důkazových systémů ([[dukazove-systemy]]).

## Závěrečná poznámka: jazyk reprezentuje problém

Tato abstrakce není samoúčelná — *každý rozhodovací problém* lze přepsat jako otázku členství v jazyce. Příklad: problém *"Je dané přirozené číslo prvočíslo?"* je týž jako rozhodnutí $w \in L_{\mathrm{prime}}$, kde $L_{\mathrm{prime}} = \{w \in \{0,1\}^* \mid w \text{ je binární zápis prvočísla}\}$.

Tato dualita *problém ↔ jazyk* je centrální motiv celého kurzu — třídy problémů (rozhodnutelné, NP, PSPACE, …) jsou definovány jako třídy jazyků, mocnost výpočetních modelů (FA, PDA, TS) se měří třídou jazyků, které dokáží přijmout. [[gramatiky]] zavádějí *druhý způsob* popisu jazyka — generativní místo akceptačního.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně (s návazností na materiály prof. Češky st. a prof. Vojnara). Externí reference: Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001); Kozen, D.C.: *Automata and Computability* (Springer 1997); [Stanford CS154 — Languages and operations](https://web.stanford.edu/class/archive/cs/cs154/cs154.1206/).*
