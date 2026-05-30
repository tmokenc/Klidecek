---
title: Regulární výrazy a Kleeneho algebra
---

# Regulární výrazy

Konečné automaty z [[konecne-automaty]] popisují regulární jazyky **akceptačně** — udávají *stroj*, který testuje příslušnost. **Regulární výrazy** popisují tytéž jazyky **konstrukčně** — udávají *výraz*, podle něhož se jazyk skládá. Ekvivalence obou popisů (Kleeneho věta) je *jeden z nejvýznamnějších výsledků* teorie regulárních jazyků a praktický základ pro implementaci `grep`, `flex`, regulárních výrazů v programovacích jazycích, …

## Regulární množiny

**Definice** (rekurzivně). Třída **regulárních množin** nad abecedou $\Sigma$ je nejmenší třída taková, že:

1. $\emptyset$ je regulární množina,
2. $\{\varepsilon\}$ je regulární množina,
3. $\{a\}$ je regulární množina pro každé $a \in \Sigma$,
4. jsou-li $P, Q$ regulární množiny, pak jsou jimi i $P \cup Q$, $P \cdot Q$ a $P^*$,
5. žádné jiné množiny regulárními nejsou.

Tj. regulární množiny jsou *uzavřeny* na sjednocení, konkatenaci a Kleeneho iteraci, počínaje "atomy" $\emptyset$, $\{\varepsilon\}$ a singletony.

## Regulární výrazy

**Regulární výraz** je *syntaktický zápis* pro regulární množinu:

| Výraz | Označuje |
| :-: | :--- |
| $\emptyset$ | $\emptyset$ |
| $\varepsilon$ | $\{\varepsilon\}$ |
| $a$ pro $a \in \Sigma$ | $\{a\}$ |
| $p + q$ | $P \cup Q$ |
| $pq$ | $P \cdot Q$ |
| $p^*$ | $P^*$ |

Konvence pro úsporu závorek (priority): $^*$ (a $^+$) > $\cdot$ > $+$.

* $p^+ \equiv pp^*$ — zkratka pro pozitivní iteraci.
* Symbol konkatenace $\cdot$ se obvykle vynechává: $pq$ místo $p \cdot q$.

## Příklady

| Výraz | Jazyk |
| :--- | :--- |
| $01$ | $\{01\}$ |
| $0^*$ | $\{\varepsilon, 0, 00, 000, \ldots\}$ |
| $(0 + 1)^*$ | $\{0, 1\}^*$ — všechny binární řetězce |
| $(0 + 1)^* 011$ | binární řetězce končící $011$ |
| $a(a+b)^* + b$ | slova nad $\{a,b\}$ začínající $a$, nebo prostě $b$ |
| $(a + b)^* aa (a + b)^*$ | slova obsahující $aa$ jako podslovo |

Regulární výraz je *čitelná konstrukční specifikace* — vyjadřuje "co jazyk je" stručněji než stavový diagram, ale méně efektivně co se týče algoritmické práce.

## Kleeneho algebra

Struktura $\langle 2^{\Sigma^*}, \cup, \cdot, ^*, \emptyset, \{\varepsilon\} \rangle$ tvoří tzv. **Kleeneho algebru** — abstraktní algebraickou strukturu s následujícími axiomy:

::: math
\begin{array}{ll}
a + (b + c) = (a + b) + c & \text{(asociativita +)} \\
a + b = b + a & \text{(komutativita +)} \\
a + a = a & \text{(idempotence +)} \\
a + 0 = a & \text{(0 neutrál +)} \\
a(bc) = (ab)c & \text{(asociativita } \cdot\text{)} \\
a \cdot 1 = 1 \cdot a = a & \text{(1 neutrál } \cdot\text{)} \\
a \cdot 0 = 0 \cdot a = 0 & \text{(0 anihilátor)} \\
a(b + c) = ab + ac & \text{(distributivita zleva)} \\
(a + b)c = ac + bc & \text{(distributivita zprava)} \\
1 + a a^* = a^* & \text{(rozvinutí *)} \\
1 + a^* a = a^* & \text{(rozvinutí *)} \\
b + ac \leq c \;\Rightarrow\; a^* b \leq c & \text{(induktivní axiom)} \\
b + ca \leq c \;\Rightarrow\; b a^* \leq c & \text{(induktivní axiom)} \\
\end{array}
:::

kde $0 = \emptyset$, $1 = \varepsilon$ a uspořádání je $a \leq b \stackrel{\text{def.}}{\iff} a + b = b$.

**Příklady Kleeneho algeber**:

* $\langle 2^{\Sigma^*}, \cup, \cdot, ^*, \emptyset, \{\varepsilon\}\rangle$ — všechny jazyky.
* Regulární jazyky nad $\Sigma$ tvoří podalgebru.
* Binární relace nad množinou $X$ se sjednocením, kompozicí a reflexivním tranzitivním uzávěrem.
* Matice nad Kleeneho algebrami.

Význam: identity Kleeneho algebry umožňují *zjednodušování regulárních výrazů*. Příklad: $a^* a^* = a^*$, $(a + b)^* = (a^* b^*)^*$, $a + aa^* = a^*$.

## Rovnice nad regulárními výrazy

Z výpočtu hodnoty regulárních výrazů přejdeme k **rovnicím** s neznámými.

**Příklad.** Rovnice $X = aX + b$ nad $\{a, b\}$.

Řešení: $X = a^* b$.

Ověření: $a(a^* b) + b = (a a^*) b + b = (a a^* + \varepsilon) b = a^* b$. ✓

> **Pozor:** Rovnice nad regulárními výrazy *nemusí mít jednoznačné řešení.* Např. $X = aX$ má řešení $X = \emptyset$, $X = a^*$, …, a obecně libovolné $a^* \cdot Y$ pro libovolnou $Y$. Vybíráme *nejmenší* řešení (vzhledem k inkluzi).

**Věta (Ardenovo lemma).** Rovnice $X = pX + q$ má nejmenší pevný bod (nejmenší řešení) $X = p^* q$ **vždy**. Je-li navíc $\varepsilon \notin L(p)$, je toto řešení jediné.

*Bez podmínky $\varepsilon \notin L(p)$* existují další řešení, ale $p^* q$ je *nejmenší*.

## Soustavy rovnic — algoritmus

Pro převod KA na regulární výraz použijeme **soustavu rovnic ve standardním tvaru**:

::: math
\forall i \in \{1, \dots, n\}: \quad X_i = \alpha_{i0} + \sum_{j=1}^n \alpha_{ij} X_j,
:::

kde $\alpha_{ij}$ jsou regulární výrazy nad $\Sigma$ (žádné neznámé). Algoritmus řešení (Gaussova eliminace pro Kleeneho algebry):

1. Pro proměnnou $X_n$ aplikuj Ardenovo lemma a vyjádři $X_n$ pomocí $X_1, \dots, X_{n-1}$.
2. Substituuj $X_n$ do ostatních rovnic.
3. Opakuj pro $X_{n-1}, X_{n-2}, \dots, X_1$.

**Příklad.** Soustava:

$$
\begin{aligned}
(1) \quad X_1 &= (01^* + 1) X_1 + X_2, \\
(2) \quad X_2 &= 11 + 1 X_1 + 00 X_3, \\
(3) \quad X_3 &= \varepsilon + X_1 + X_2.
\end{aligned}
$$

Dosadíme (3) do (2):

$$
X_2 = 11 + 1 X_1 + 00(\varepsilon + X_1 + X_2) = 00 + 11 + (1 + 00) X_1 + 00 X_2.
$$

Ardenovo lemma na (1) → $X_1 = (01^* + 1)^* X_2 = (0 + 1)^* X_2$ (po zjednodušení).

Substituce do (2) a další aplikace Ardenova lemmatu → $X_2 = ((1 + 00)(0+1)^*)^*(00 + 11)$.

Zpětnou substitucí dostaneme po zjednodušení $X_1 = (0+1)^*(00 + 11)$.

## Aplikace: jazyk konečného automatu jako regulární výraz

Z DKA $M = (Q, \Sigma, \delta, q_0, F)$ sestrojíme soustavu rovnic:

* Pro každý stav $q_i \in Q$ máme neznámou $X_i$ reprezentující *jazyk přijatý z $q_i$* (= slova, která stroj z $q_i$ přivedou do koncového stavu).
* Rovnice $X_i = \sum_{a \in \Sigma} a \cdot X_{\delta(q_i, a)}$, kde *navíc* pokud $q_i \in F$, přidáváme $\varepsilon$.

Vyřešením soustavy získáme $X_0$ — *regulární výraz pro jazyk celého automatu*.

::: svg "Jednoduchý DKA pro L = slova obsahující 'ab'"
<svg viewBox="0 0 540 140" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aRV1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="100" cy="70" r="22"/>
    <circle cx="270" cy="70" r="22"/>
    <circle cx="440" cy="70" r="22"/>
    <circle cx="440" cy="70" r="17" fill="none"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle">
    <text x="100" y="74">q₀</text>
    <text x="270" y="74">q₁</text>
    <text x="440" y="74">q₂</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aRV1)">
    <path d="M122,70 L248,70"/>
    <path d="M292,70 L418,70"/>
    <path d="M88,52 Q72,30 100,30 Q120,30 110,52"/>
    <path d="M256,52 Q240,32 270,32 Q290,32 282,50"/>
    <path d="M440,93 Q420,118 440,118 Q462,118 442,93"/>
    <path d="M50,70 L78,70"/>
  </g>
  <g fill="var(--text-muted)">
    <text x="185" y="63" text-anchor="middle">a</text>
    <text x="355" y="63" text-anchor="middle">b</text>
    <text x="100" y="20" text-anchor="middle">b</text>
    <text x="270" y="20" text-anchor="middle">a</text>
    <text x="440" y="130" text-anchor="middle">a,b</text>
    <text x="20" y="73">start</text>
  </g>
</svg>
:::

Soustava:

$$
\begin{aligned}
X_0 &= a X_1 + b X_0, \\
X_1 &= b X_2 + a X_1, \\
X_2 &= \varepsilon + a X_2 + b X_2 = \varepsilon + (a + b) X_2.
\end{aligned}
$$

Z rovnice pro $X_2$ Ardenovým lemmatem: $X_2 = (a + b)^* \cdot \varepsilon = (a + b)^*$.

Dosadíme: $X_1 = b(a + b)^* + a X_1$, opět Ardenovo lemma → $X_1 = a^* b (a + b)^*$.

A nakonec: $X_0 = a \cdot a^* b (a + b)^* + b X_0$, čili $X_0 = b^* a a^* b (a + b)^* = b^* a^+ b (a + b)^*$.

Jazyk: slova nad $\{a, b\}$ obsahující podslovo $ab$. ✓

## Kleeneho věta

::: math
\text{Pro každý jazyk } L \subseteq \Sigma^* \text{ platí: } L \text{ je regulární} \iff L = L(R) \text{ pro nějaký regulární výraz } R.
:::

Důkaz se rozpadá na dvě části, obě konstruktivní:

* **(⇐)** Z regulárního výrazu *sestrojíme NKA* induktivně: pro každý "atom" RV malý automat, pro $+$ spojíme dva automaty paralelně, pro konkatenaci sériově, pro $^*$ přidáme zpětnou hranu (**Thompsonova konstrukce**, lineární počet stavů).
* **(⇒)** Z DKA *sestrojíme RV* algoritmem rovnic výše, případně tzv. **stavovou eliminační konstrukcí** (postupně odstraňujeme stavy a *přepisujeme* hrany regulárními výrazy).

> Velikost RV ve směru "DKA → RV" může být *exponenciální* v počtu stavů DKA, byť ne ostře — existují DKA, jejichž ekvivalentní RV má délku $\Omega(2^n)$.

## Rozšíření v praktických regex enginech

Praktické "regulární výrazy" v Perl, Python, JavaScript, PCRE jdou *daleko za* matematickou definici:

* Třídy znaků: `[abc]`, `[^a-z]`, `\d`, `\w`, `.`
* Kvantifikátory: `?`, `+`, `{n,m}` (formálně shrnutí Kleene-iterace)
* **Zpětné reference**: `(.)\1` — slova s opakovaným znakem. *Toto je rozšíření za třídu regulárních jazyků* — zpětnými referencemi lze popsat i některé nebezkontextové jazyky (např. $\{ww\}$), tedy striktní podtřídu kontextových jazyků.
* Anchors: `^`, `$`, `\b` — modifikují *kontext* hledání.

Vzhledem k tomu, že zpětné reference rozšiřují sílu výrazů mimo třídu regulárních jazyků, mají *podstatně horší* časovou složitost (problém příslušnosti je NP-úplný; Aho 1990). Klasické `grep -E` s POSIX RV se omezuje na čistě regulární prvky a běží v $O(n)$ délky vstupu.

[[minimalizace]] následuje přirozeně: máme-li libovolný DKA pro daný regulární jazyk, lze jej *minimalizovat* na unikátní (až na pojmenování) DKA s nejmenším možným počtem stavů.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Kleene, S.C.: *Representation of Events in Nerve Nets and Finite Automata* (RAND, 1951) — originální Kleeneho věta; Thompson, K.: *Regular expression search algorithm* (CACM, 1968); Cox, R.: [*Regular Expression Matching Can Be Simple And Fast*](https://swtch.com/~rsc/regexp/regexp1.html); Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), §3.1–3.2.*
