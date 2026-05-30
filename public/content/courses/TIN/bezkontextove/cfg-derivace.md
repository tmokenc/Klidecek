---
title: Bezkontextové gramatiky a derivační stromy
---

# Bezkontextové gramatiky (typ 2)

Regulární jazyky ([[konecne-automaty]], [[regularni-vyrazy]]) jsou *příliš slabé* pro popis vyvážených struktur — pumping lemma ([[pumping-uzaver]]) ukázalo, že $\{a^n b^n \mid n \geq 1\}$ není regulární. **Bezkontextové gramatiky** (typ 2 Chomského hierarchie z [[chomsky-hierarchie]]) jsou *druhým schodem*: dovolují pravidla typu $A \to \alpha$, kde levá strana je *jeden neterminál* a pravá je *libovolný řetězec* nad $N \cup \Sigma$. Tato třída pokrývá syntaxi všech praktických programovacích jazyků.

## Definice

**Definice.** Gramatika $G = (N, \Sigma, P, S)$ je **bezkontextová**, pokud všechna pravidla z $P$ mají tvar

$$
A \to \alpha, \quad A \in N,\ \alpha \in (N \cup \Sigma)^*.
$$

Tj. levá strana je *právě jeden* neterminál, pravá je *libovolný* řetězec (i prázdný). Název "bezkontextová" zdůrazňuje, že přepis neterminálu $A$ *nezávisí* na okolí — $A$ může být kdekoli ve větné formě, vždy se přepisuje stejně.

**Lemma.** Každý regulární jazyk je bezkontextový.

*Důkaz.* Regulární gramatika (typ 3) má pravidla $A \to xB$ nebo $A \to x$, což je speciální případ pravidel typu 2 ($\alpha = xB$ nebo $\alpha = x$). ∎

## Proč bezkontextové gramatiky "počítají"

Klíčový mechanismus: **sebevkládání** přes pravidla typu $A \to \alpha A \beta$. Toto umožňuje generovat *vyvážené* struktury.

**Příklad 1.** $L = \{a^n b^n \mid n \geq 0\}$:

$$
S \to aSb \mid \varepsilon.
$$

Každá aplikace prvního pravidla přidá jeden $a$ na levou a *symetricky* jeden $b$ na pravou stranu — počty zůstávají vyvážené.

**Příklad 2.** $L = \{a^{3n} b^{2n} \mid n \geq 0\}$:

$$
S \to aaaSbb \mid \varepsilon.
$$

Aplikace přidává *trojice* $a$ a *dvojice* $b$.

**Příklad 3.** $L = \{w \in \{a, b\}^* \mid \#_a(w) = \#_b(w)\}$ — slova s vyrovnaným počtem $a$ a $b$ v *libovolném* pořadí:

$$
S \to aSb \mid bSa \mid SS \mid \varepsilon.
$$

Pravidlo $S \to SS$ dovoluje *vkládat* podslova vedle sebe, takže se počty *kumulují přes celé slovo*, ne jen v hnízděné struktuře.

## Společný kanonický příklad

Pro demonstrace dalších pojmů budeme používat:

$$
G = (\{S, A, B\}, \{a, b, c\}, P, S),\quad P:\ S \to AB,\ A \to aAb \mid ab,\ B \to bBc \mid bc.
$$

Tato gramatika generuje $L(G) = \{a^m b^{m+n} c^n \mid m, n \geq 1\}$ — slova *kombinující* dva nezávislé počty.

## Derivační (syntaktický) strom

**Derivace** ($\Rightarrow$, $\stackrel{*}{\Rightarrow}$) jsou *posloupnosti* přímých přepisů. Pro bezkontextovou gramatiku má každá derivace přehlednou **stromovou** strukturu — protože pravidla $A \to \alpha_1 \alpha_2 \dots \alpha_n$ "rozkládají" jeden neterminál na uspořádanou n-tici symbolů.

**Definice.** Derivační strom příslušející derivaci $S = v_0 \Rightarrow v_1 \Rightarrow \dots \Rightarrow v_k = \delta$ je vrcholově ohodnocený strom:

1. Vrcholy jsou ohodnoceny symboly z $N \cup \Sigma \cup \{\varepsilon\}$; kořen je $S$.
2. Pro každou přímou derivaci $\mu A \lambda \Rightarrow \mu \alpha \lambda$ s pravidlem $A \to X_1 X_2 \dots X_n$ má vrchol s ohodnocením $A$ právě $n$ uspořádaných potomků $X_1, X_2, \dots, X_n$.
3. Posloupnost ohodnocení listů zleva doprava (čteno *in-order*) tvoří *větnou formu* (resp. *větu*).

::: svg "Derivační strom pro slovo aabbbbcc v gramatice G"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g stroke="var(--line)" stroke-width="1" fill="none">
    <line x1="270" y1="38" x2="180" y2="80"/>
    <line x1="270" y1="38" x2="360" y2="80"/>
    <line x1="180" y1="80" x2="120" y2="125"/>
    <line x1="180" y1="80" x2="180" y2="125"/>
    <line x1="180" y1="80" x2="240" y2="125"/>
    <line x1="180" y1="125" x2="180" y2="170"/>
    <line x1="360" y1="80" x2="300" y2="125"/>
    <line x1="360" y1="80" x2="360" y2="125"/>
    <line x1="360" y1="80" x2="420" y2="125"/>
    <line x1="360" y1="125" x2="320" y2="170"/>
    <line x1="360" y1="125" x2="360" y2="170"/>
    <line x1="360" y1="125" x2="400" y2="170"/>
    <line x1="180" y1="170" x2="160" y2="210"/>
    <line x1="180" y1="170" x2="200" y2="210"/>
  </g>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <circle cx="270" cy="30" r="13"/>
    <circle cx="180" cy="80" r="13"/>
    <circle cx="180" cy="170" r="13"/>
    <circle cx="360" cy="80" r="13"/>
    <circle cx="360" cy="125" r="13"/>
  </g>
  <g fill="var(--accent)" font-size="12" text-anchor="middle">
    <text x="270" y="34">S</text>
    <text x="180" y="84">A</text>
    <text x="180" y="174">A</text>
    <text x="360" y="84">B</text>
    <text x="360" y="129">B</text>
  </g>
  <g fill="var(--text)" font-size="11.5" text-anchor="middle">
    <text x="120" y="130">a</text>
    <text x="240" y="130">b</text>
    <text x="160" y="216">a</text>
    <text x="200" y="216">b</text>
    <text x="300" y="130">b</text>
    <text x="420" y="130">c</text>
    <text x="320" y="174">b</text>
    <text x="400" y="174">c</text>
  </g>
  <text x="270" y="20" text-anchor="middle" font-size="11" fill="var(--text-muted)">S → AB → aAbB → aAbbBc → aAbbbcc → aabbbbcc</text>
</svg>
:::

Čtení listů zleva doprava dává *generované slovo*: $a a b b b b c c$. Strom *je* derivace, jen reprezentovaná graficky — explicitně ukazuje hierarchii podtahování.

::: viz cfg-derivation "Vyber gramatiku a aplikuj pravidlo na zvýrazněný neterminál (levý/pravý). Pro víceznačnou gramatiku výrazů zkus i + i * i — různé volby vedou k různým stromům."
:::

## Levá a pravá derivace

Při derivaci máme *volbu*: pokud věta forma obsahuje *více neterminálů*, kterým z nich přepisovat? Dvě kanonická pořadí:

**Levá derivace.** V každém kroku přepisujeme *nejlevější* neterminál:

$$
S \Rightarrow_L AB \Rightarrow_L aAbB \Rightarrow_L aabbB \Rightarrow_L aabbbBc \Rightarrow_L aabbbbcc.
$$

**Pravá derivace.** V každém kroku přepisujeme *nejpravější* neterminál:

$$
S \Rightarrow_R AB \Rightarrow_R AbBc \Rightarrow_R Abbcc \Rightarrow_R aAbbbcc \Rightarrow_R aabbbbcc.
$$

> Obě dávají stejné slovo a *stejný derivační strom* — liší se jen *pořadím*, ve kterém jsme strom *prokresleli*. Pro syntaktickou analýzu (parsing) je rozdíl podstatný: LL parsery konstruují levou derivaci shora dolů, LR parsery pravou zdola nahoru.

**Lemma.** V *levé* derivaci má každá mezikrokní větná forma $\alpha_i$ tvar $\alpha_i = x_i A_i \beta_i$, kde $x_i \in \Sigma^*$ je *terminální prefix*. V *pravé* derivaci má tvar $\gamma_i B_i y_i$ s *terminálním sufixem*.

## Víceznačnost gramatik

Pokud jedno slovo má **více různých derivačních stromů**, gramatika je **víceznačná**.

**Definice.** Věta $w \in L(G)$ je *víceznačná*, pokud existují alespoň dva *různé* derivační stromy s listy tvořícími $w$ (čteno zleva doprava). Gramatika $G$ je *víceznačná*, pokud generuje alespoň jednu víceznačnou větu.

**Příklad — aritmetické výrazy.** Gramatika

$$
E \to E + E \mid E - E \mid E * E \mid E / E \mid (E) \mid i
$$

generuje aritmetické výrazy s binárními operacemi, ale je *víceznačná*. Slovo $i + i * i$ má dva různé derivační stromy:

::: svg "Dva derivační stromy pro i + i * i — vlevo násobení vázáno silněji, vpravo sčítání"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="1" fill="none">
    <line x1="100" y1="40" x2="60" y2="80"/>
    <line x1="100" y1="40" x2="100" y2="80"/>
    <line x1="100" y1="40" x2="140" y2="80"/>
    <line x1="140" y1="80" x2="100" y2="120"/>
    <line x1="140" y1="80" x2="140" y2="120"/>
    <line x1="140" y1="80" x2="180" y2="120"/>
    <line x1="100" y1="120" x2="100" y2="160"/>
    <line x1="180" y1="120" x2="180" y2="160"/>
    <line x1="60" y1="80" x2="60" y2="120"/>
    <line x1="400" y1="40" x2="360" y2="80"/>
    <line x1="400" y1="40" x2="400" y2="80"/>
    <line x1="400" y1="40" x2="440" y2="80"/>
    <line x1="360" y1="80" x2="320" y2="120"/>
    <line x1="360" y1="80" x2="360" y2="120"/>
    <line x1="360" y1="80" x2="400" y2="120"/>
    <line x1="320" y1="120" x2="320" y2="160"/>
    <line x1="400" y1="120" x2="400" y2="160"/>
    <line x1="440" y1="80" x2="440" y2="120"/>
  </g>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="100" cy="34" r="11"/>
    <circle cx="60" cy="80" r="11"/>
    <circle cx="140" cy="80" r="11"/>
    <circle cx="100" cy="120" r="11"/>
    <circle cx="180" cy="120" r="11"/>
    <circle cx="400" cy="34" r="11"/>
    <circle cx="360" cy="80" r="11"/>
    <circle cx="440" cy="80" r="11"/>
    <circle cx="320" cy="120" r="11"/>
    <circle cx="400" cy="120" r="11"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle">
    <text x="100" y="38">E</text>
    <text x="60" y="84">E</text>
    <text x="140" y="84">E</text>
    <text x="100" y="124">E</text>
    <text x="180" y="124">E</text>
    <text x="400" y="38">E</text>
    <text x="360" y="84">E</text>
    <text x="440" y="84">E</text>
    <text x="320" y="124">E</text>
    <text x="400" y="124">E</text>
  </g>
  <g fill="var(--text)" font-size="11" text-anchor="middle">
    <text x="100" y="60">+</text>
    <text x="140" y="100">*</text>
    <text x="60" y="135">i</text>
    <text x="100" y="175">i</text>
    <text x="180" y="175">i</text>
    <text x="400" y="60">*</text>
    <text x="360" y="100">+</text>
    <text x="320" y="175">i</text>
    <text x="400" y="175">i</text>
    <text x="440" y="135">i</text>
  </g>
  <text x="100" y="200" text-anchor="middle" fill="var(--text-muted)" font-size="11">(i) + (i * i)</text>
  <text x="400" y="200" text-anchor="middle" fill="var(--text-muted)" font-size="11">(i + i) * i</text>
</svg>
:::

> Problém víceznačnosti gramatik je **nerozhodnutelný** — neexistuje obecný algoritmus, který by v konečném čase rozhodl, zda daná gramatika je či není víceznačná. Toto je důsledek [[pcp-jazyky]].

## Jednoznačná gramatika pro tentýž jazyk

Stejný jazyk *lze* generovat *jednoznačnou* gramatikou — zavedením úrovní priority pro operátory:

$$
\begin{aligned}
E &\to T \mid E + T \mid E - T, \\
T &\to F \mid T * F \mid T / F, \\
F &\to (E) \mid i.
\end{aligned}
$$

Zde:

* $E$ generuje výrazy se sčítáním a odečítáním (nejnižší priorita),
* $T$ generuje *termy* — výrazy s násobením a dělením (vyšší priorita),
* $F$ generuje *faktory* — proměnnou nebo závorkovaný výraz.

Tato struktura ("expression → term → factor") je *standardní* a používá se ve většině programovacích jazyků pro definici výrazů. Levostranná rekurze v pravidlech ($E \to E + T$) zajišťuje *levou asociativitu* sčítání.

## Inherentní víceznačnost

**Definice.** Jazyk $L$ má **inherentní víceznačnost**, pokud *každá* bezkontextová gramatika generující $L$ je víceznačná.

Existují *konkrétní* takové jazyky! Klasický příklad:

$$
L = \{a^n b^n c^m d^m \mid n, m \geq 1\} \cup \{a^n b^m c^m d^n \mid n, m \geq 1\}.
$$

Slova tvaru $a^n b^n c^n d^n$ jsou v *obou* podjazycích a vyžadují dva různé "počítače" (jeden pro $n$ s $b$, druhý s $d$). Žádná bezkontextová gramatika tuto dvojakost nedokáže odstranit.

> *Inherentní víceznačnost* je jevem na úrovni *jazyka*, ne gramatiky — některé jazyky strukturálně neumožňují jednoznačnou bezkontextovou reprezentaci.

[[normalni-formy]] dále zavádí *kanonické tvary* bezkontextových gramatik (Chomského a Greibachova normální forma), které jsou nutné pro klasické algoritmy parsování ([[cyk-parsing]]) a pro důkaz pumping lemmatu pro CFG ([[vlastnosti-bkj]]).

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Chomsky, N.: *On Certain Formal Properties of Grammars* (Inf. and Control, 1959); Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), §5.1–5.2; Aho, Sethi, Ullman: *Compilers — Principles, Techniques and Tools (Dragon book)* (Addison-Wesley 2006), kap. 4.*
