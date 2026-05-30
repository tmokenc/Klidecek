---
title: Pumping lemma a uzávěrové vlastnosti bezkontextových jazyků
---

# Vlastnosti bezkontextových jazyků

Stejně jako u regulárních jazyků ([[pumping-uzaver]]) existuje pro bezkontextové jazyky **pumping lemma** — strukturální vlastnost, která umožňuje *dokazovat neexistenci* bezkontextové gramatiky. Třída $\mathcal{L}_2$ je navíc *uzavřená* na některé operace, ale ne všechny — toto rozhraní určuje, kde končí *strukturální robustnost* bezkontextovosti.

## Pumping lemma pro CFG

**Věta.** Pro každý bezkontextový jazyk $L$ existuje konstanta $k > 0$ taková, že pro každé $z \in L$ s $|z| \geq k$ existuje rozklad

$$
z = uvwxy
$$

splňující:

::: math
\text{(i)}\ vx \neq \varepsilon, \quad \text{(ii)}\ |vwx| \leq k, \quad \text{(iii)}\ \forall i \geq 0: u v^i w x^i y \in L.
:::

**Intuice.** V *libovolné* dostatečně dlouhé větě bezkontextového jazyka lze najít *dva* segmenty $v, x$ a *jediný* mezi-segment $w$ — tak, že $v$ a $x$ se *společně* pumpují stejným exponentem. Pumpují se *symetricky* — protože odpovídají *opakovanému neterminálu* v derivačním stromu.

::: svg "Pumping lemma pro CFG: rozklad z = uvwxy s pumpovatelnými v, x"
<svg viewBox="0 0 540 245" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g stroke="var(--line)" stroke-width="1" fill="none">
    <line x1="270" y1="20" x2="180" y2="55"/>
    <line x1="270" y1="20" x2="360" y2="55"/>
    <line x1="180" y1="55" x2="90" y2="100"/>
    <line x1="180" y1="55" x2="180" y2="100"/>
    <line x1="180" y1="55" x2="270" y2="100"/>
    <line x1="270" y1="100" x2="180" y2="150"/>
    <line x1="270" y1="100" x2="270" y2="150"/>
    <line x1="270" y1="100" x2="360" y2="150"/>
  </g>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <circle cx="270" cy="15" r="13"/>
    <circle cx="180" cy="55" r="13"/>
    <circle cx="270" cy="100" r="13"/>
  </g>
  <g fill="var(--accent)" font-size="12" text-anchor="middle">
    <text x="270" y="19">S</text>
    <text x="180" y="59">A</text>
    <text x="270" y="104">A</text>
  </g>
  <g fill="var(--text-muted)" font-size="11" text-anchor="middle">
    <text x="90" y="115">u</text>
    <text x="180" y="115">v</text>
    <text x="270" y="170">w</text>
    <text x="360" y="170">x</text>
    <text x="360" y="70">y</text>
  </g>
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="60" y="195" width="60" height="22"/>
    <rect x="120" y="195" width="60" height="22" fill="color-mix(in oklch, var(--accent) 25%, var(--bg-card))"/>
    <rect x="180" y="195" width="80" height="22"/>
    <rect x="260" y="195" width="60" height="22" fill="color-mix(in oklch, var(--accent) 25%, var(--bg-card))"/>
    <rect x="320" y="195" width="100" height="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="90" y="211">u</text>
    <text x="150" y="211">v</text>
    <text x="220" y="211">w</text>
    <text x="290" y="211">x</text>
    <text x="370" y="211">y</text>
  </g>
  <text x="270" y="190" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">|vwx| ≤ k, vx ≠ ε</text>
  <text x="270" y="235" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">∀i ≥ 0: u vⁱ w xⁱ y ∈ L</text>
</svg>
:::

## Důkaz pumping lemmatu (přes CNF)

Vezmeme gramatiku $G$ v Chomského normální formě ([[normalni-formy]]). V CNF má *derivační strom* pro slovo délky $n$ vždy *binární* strukturu — vrcholy s pravidly $A \to BC$ mají dvě potomky, vrcholy s pravidly $A \to a$ jednu.

**Krok 1.** Pro derivační strom s nejdelší cestou $m$ vrcholů máme: $|w| \leq 2^{m-2}$. (Plný binární strom s větvemi délky $m-1$ má $2^{m-2}$ listů, a délka slova je *počet listů*.)

**Krok 2.** Položme $k = 2^{|N|}$. Pro $|z| \geq k$ máme $2^{|N|} \leq 2^{m-2}$, tedy $m \geq |N| + 2$. To znamená, že *nejdelší cesta v derivačním stromu* má alespoň $|N| + 2$ vrcholů (jeden je list = terminál, $|N| + 1$ jsou neterminály).

**Krok 3.** Podle *principu holubníku*: mezi $|N| + 1$ neterminály na nejdelší cestě musí *alespoň dva* nést stejné jméno — řekněme $A$.

::: math
S \stackrel{*}{\Rightarrow} u A y \stackrel{+}{\Rightarrow} u v A x y \stackrel{+}{\Rightarrow} u v w x y = z.
:::

Jelikož aplikujeme pravidla typu $A \to BC$, *řetězce* $v$ a $x$ obklopující vnitřní výskyt $A$ nemohou být *oba* prázdné — pravá strana má 2 symboly. Tedy $vx \neq \varepsilon$.

**Krok 4 (pumpování).** Substruktura $A \stackrel{+}{\Rightarrow} vAx$ se opakuje libovolněkrát:

::: math
\forall i \geq 0:\quad S \stackrel{*}{\Rightarrow} uAy \stackrel{+}{\Rightarrow} u v A x y \stackrel{+}{\Rightarrow} u v^2 A x^2 y \stackrel{+}{\Rightarrow} \dots \stackrel{+}{\Rightarrow} u v^i w x^i y.
:::

Pro $i = 0$ použijeme přímou derivaci $A \stackrel{+}{\Rightarrow} w$ z vnitřního $A$.

Velikost $|vwx| \leq k$ plyne z faktu, že podsegment $vwx$ vznikne z *podstromu* s vrcholem v *vnitřním* $A$ — délka cesty z něj k listům je $\leq |N| + 1$, tedy listů $\leq 2^{|N|} = k$.

## Použití: důkazy nebezkontextovosti

Stejně jako pumping lemma pro regulární jazyky se používá k *důkazům neexistence*:

::: math
L \in \mathcal{L}_2 \Rightarrow A \quad\Leftrightarrow\quad \neg A \Rightarrow L \notin \mathcal{L}_2.
:::

### Příklad 1: $L = \{ww \mid w \in \{a, b, c\}^*\}$ není CFL

Pro libovolné $k > 0$ zvolme $z = a^k b^k a^k b^k$ (kanonicky $w = a^k b^k$, $z = ww$, $|z| = 4k \geq k$).

Uvažme libovolný rozklad $z = uvwxy$ s $vx \neq \varepsilon$ a $|vwx| \leq k$. Protože $|vwx| \leq k$, segment $vwx$ leží *uvnitř* jediného bloku ze čtyř: $a^k$, $b^k$ (1. polovina), $a^k$ (2. polovina), $b^k$ (2. polovina). Procházíme případy podle pozice $vwx$:

* $vwx \subseteq a^k$ (1. blok): pumpování změní jen počet $a$ v 1. polovině — porušíme rovnost $w = w'$ obou polovin.
* $vwx \subseteq b^k$ (2. blok), nebo $a^k$ (3.) nebo $b^k$ (4.) — analogicky.
* $vwx$ překlene rozhraní $a/b$ uvnitř *jedné* poloviny: pumpováním porušíme strukturu této poloviny.
* $vwx$ překlene rozhraní mezi *polovinami* (mezi $b^k$ a $a^k$): pumpováním porušíme buď celkovou strukturu, nebo počty.

Volby "$vwx = a^k b^k a^o$" jsou *vyloučeny* podmínkou $|vwx| \leq k$ — délka byla by $2k + o > k$.

V *žádném* případě nelze najít vhodné $v, x$. Tedy $L \notin \mathcal{L}_2$. ∎

### Příklad 2: $L = \{a^n b^n c^n \mid n \geq 1\}$ není CFL

Pro libovolné $k > 0$ zvolme $z = a^k b^k c^k$.

Pro $vwx$ s $|vwx| \leq k$: nemůže obsahovat *všechny tři* symboly $a, b, c$, protože by mělo délku $\geq k + 1$. Tedy $vwx$ obsahuje nejvýše *dva* různé symboly. Pumpováním (resp. odebráním) změníme jen *dvě* ze tří kvantit, čímž porušíme rovnost. ∎

## Uzávěrové vlastnosti

**Věta.** Třída $\mathcal{L}_2$ je *uzavřena* na následující operace:

| Operace | Konstrukce |
| :--- | :--- |
| Sjednocení $L_1 \cup L_2$ | $S \to S_1 \mid S_2$ |
| Konkatenace $L_1 \cdot L_2$ | $S \to S_1 S_2$ |
| Iterace $L^*$ | $S \to S' S \mid \varepsilon$ |
| Pozitivní iterace $L^+$ | $S \to S' S \mid S'$ |
| Reverz $L^R$ | obrátíme pravé strany všech pravidel |
| Substituce | viz dále |
| Homomorfismus $h(L)$ | aplikujeme $h$ na všechna terminální písmena pravidel |
| **Průnik s regulárním jazykem** $L \cap R$ | součin PDA × DKA |

**Třída $\mathcal{L}_2$ NENÍ uzavřena na:**

* **Průnik** $L_1 \cap L_2$ — protipříklad: $\{a^n b^n c^m\} \cap \{a^m b^n c^n\} = \{a^n b^n c^n\}$, což není CFL (viz výše).
* **Doplněk** $\overline{L}$ — kdyby bylo uzavřené na doplněk, plus uzavření na sjednocení dává uzavření na průnik (De Morgan). Spor.
* **Rozdíl** $L_1 \setminus L_2$ — důsledek (kdyby ano, $\overline{L} = \Sigma^* \setminus L$ by bylo CFL).

> **Klíčové pozorování:** absence uzávěru na průnik a doplněk je jediné, co zásadně odlišuje $\mathcal{L}_2$ od $\mathcal{L}_3$ a podstatně komplikuje algoritmický nástroj. Pro CFG např. nelze přímo *konstruktivně* určit jazyk dvou současně přijímaných slov.

## Důkaz uzávěru na sjednocení/konkatenaci/iteraci

**Substituce.** *Substitucí* jazyků $L_a$ pro $a \in \Sigma$ do jazyka $L \subseteq \Sigma^*$ rozumíme:

::: math
\sigma_{L_{a_1}, \dots, L_{a_n}}(L) = \{x_1 x_2 \dots x_m \mid b_1 b_2 \dots b_m \in L \land \forall i: x_i \in L_{b_i}\}.
:::

Tj. každé písmeno v $L$ "rozšíříme" na slovo z příslušného jazyka $L_a$.

**Věta.** $\mathcal{L}_2$ je uzavřena na substituci. (Důkaz: spojíme gramatiky $G_a$ pro jednotlivé $L_a$ s gramatikou $G$ pro $L$ tak, že terminál $a$ v pravých stranách $G$ nahradíme za startovní symbol $S_a$.)

Uzávěr na sjednocení, konkatenaci a Kleene-iteraci pak plyne *přímo z uzávěru na substituci*:

* $L_1 \cup L_2 = \sigma_{L_1, L_2}(\{a, b\})$ — substituce do regulárního jazyka.
* $L_1 \cdot L_2 = \sigma_{L_1, L_2}(\{ab\})$ — substituce do jednoslovného jazyka.
* $L^* = \sigma_L(\{a\}^*)$.
* $L^+ = \sigma_L(\{a\}^+)$.

## Důkaz $L \cap R$ je CFL

**Konstrukce.** Nechť $P = (Q_P, \Sigma, \Gamma, \delta_P, q_{0,P}, Z_0, F_P)$ je PDA pro $L$ a $M = (Q_M, \Sigma, \delta_M, q_{0,M}, F_M)$ je DKA pro $R$. Sestrojíme PDA $P'$ pro $L \cap R$:

* Stavy: $Q_{P'} = Q_P \times Q_M$ — *synchronizovaný součin*.
* Zásobník: identický s $P$.
* Přechod $(p', m') \in \delta_{P'}((p, m), a, Z)$ ⟺ existuje přechod $\delta_P(p, a, Z) \ni (p', \gamma)$ *a současně* $\delta_M(m, a) = m'$. (Pro $a = \varepsilon$ stav DKA zůstane — $\varepsilon$ DKA neposouvá.)
* Koncové stavy: $F_{P'} = F_P \times F_M$.

PDA $P'$ tedy *paralelně* simuluje $P$ na vstupu a zároveň $M$ — přijímá tehdy a jen tehdy, když oba akceptují. Protože $M$ je deterministický, počet stavů $P'$ je $|Q_P| \cdot |Q_M|$.

## Důkaz $\overline{L} \notin \mathcal{L}_2$ (kontrapříklad)

$L = \{a^i b^j c^k \mid i = j \lor j = k\}$ je CFL — můžeme nedeterministicky vybrat, kterou rovnost ověřovat. Doplněk $\overline{L} = \{a^i b^j c^k \mid i \neq j \land j \neq k\} \cup \text{(nekanonické řetězce)}$, který obsahuje $a^n b^n c^n$ pro žádné $n$ — což po průniku s $a^* b^* c^*$ dává $\{a^i b^j c^k \mid i \neq j \land j \neq k\}$, a to už CFL není (řeší se podobně jako $\{a^n b^n c^n\}$).

## Rozhodnutelné a nerozhodnutelné problémy v $\mathcal{L}_2$

| Problém | Stav | Algoritmus / důvod |
| :--- | :-: | :--- |
| Neprázdnost $L(G) \neq \emptyset$ | rozhodnutelné | fixpoint výpočet generujících neterminálů |
| Náležitost $w \in L(G)$ | rozhodnutelné | CYK algoritmus $O(\|w\|^3)$ ([[cyk-parsing]]) |
| Konečnost $L(G)$ je konečný | rozhodnutelné | hledání cyklu v rekurzivních pravidlech (po úklidu) |
| **Ekvivalence** $L(G_1) = L(G_2)$ | **nerozhodnutelné** | redukce z PCP ([[pcp-jazyky]]) |
| **Inkluze** $L(G_1) \subseteq L(G_2)$ | **nerozhodnutelné** | důsledek (kdyby ano, ekvivalence by byla snadná) |
| **Universalita** $L(G) = \Sigma^*$ | **nerozhodnutelné** | speciální případ inkluze |
| **Prázdnost průniku** $L(G_1) \cap L(G_2) = \emptyset$ | **nerozhodnutelné** | redukce z PCP |
| **Víceznačnost gramatiky** | **nerozhodnutelné** | redukce z PCP |

Ostrý kontrast s regulárními jazyky, kde *všechny* tyto problémy byly rozhodnutelné. Bezkontextovost přidává *expresivitu* na úkor *algoritmicky uchopitelnosti*.

[[cyk-parsing]] ukáže polynomiální algoritmus pro problém členství — CYK metodou dynamického programování.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Bar-Hillel, Y., Perles, M., Shamir, E.: *On Formal Properties of Simple Phrase Structure Grammars* (Z. Phon. Sprachwiss., 1961) — pumping lemma; Ginsburg, S., Rose, G.F.: *Operations Which Preserve Definability* (J. ACM, 1963); Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), §7.2–7.4.*
