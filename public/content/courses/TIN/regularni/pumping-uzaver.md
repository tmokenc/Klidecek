---
title: Pumping lemma, uzávěrové a rozhodnutelné vlastnosti
---

# Vlastnosti regulárních jazyků

Předchozí kapitoly daly *nástroje* pro práci s regulárními jazyky: automaty ([[konecne-automaty]]), determinizaci ([[determinizace]]), regulární výrazy ([[regularni-vyrazy]]) a minimalizaci ([[minimalizace]]). Tato kapitola popisuje **strukturální vlastnosti** třídy regulárních jazyků — *pumping lemma* (jak vypadá libovolné dostatečně dlouhé slovo v regulárním jazyce), *uzávěrové vlastnosti* (na jaké operace jsou regulární jazyky uzavřeny) a *rozhodnutelné problémy* (které úlohy umíme algoritmicky řešit).

## Pumping lemma — věta a intuice

**Věta.** Pro každý regulární jazyk $L$ existuje konstanta $p > 0$ (zvaná *pumping konstanta*) taková, že pro každé $w \in L$ s $|w| \geq p$ existuje rozklad $w = xyz$ splňující:

::: math
\text{(i)}\ y \neq \varepsilon, \quad \text{(ii)}\ |xy| \leq p, \quad \text{(iii)}\ \forall i \geq 0: x y^i z \in L.
:::

**Intuice.** V *libovolné* dostatečně dlouhé větě každého regulárního jazyka lze *poblíž začátku* najít *krátkou* sekvenci $y$, kterou lze libovolně mnohokrát opakovat (i smazat) a *zůstaneme* v jazyce.

::: svg "Pumping lemma: rozklad w = xyz s pumpovatelným y, |xy| ≤ p"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="12">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="40" y="50" width="100" height="40"/>
    <rect x="140" y="50" width="80" height="40" fill="color-mix(in oklch, var(--accent) 25%, var(--bg-card))"/>
    <rect x="220" y="50" width="280" height="40"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="90" y="74">x</text>
    <text x="180" y="74">y</text>
    <text x="360" y="74">z</text>
  </g>
  <line x1="40" y1="105" x2="220" y2="105" stroke="var(--accent)" strokeWidth="1.4"/>
  <text x="130" y="120" text-anchor="middle" fill="var(--accent)" font-size="11">|xy| ≤ p</text>
  <g fill="var(--text-muted)" font-size="11">
    <text x="270" y="40" text-anchor="middle">w = xyz, |w| ≥ p, y ≠ ε</text>
    <text x="270" y="150" text-anchor="middle">∀i ≥ 0: xyⁱz ∈ L</text>
    <text x="270" y="168" text-anchor="middle">(y lze libovolně opakovat nebo vypustit)</text>
  </g>
</svg>
:::

## Důkaz pumping lemmatu

**Konstrukce.** $L = L(M)$ pro nějaký DKA $M$ s $|Q| = n$ stavů. Zvolme $p = n$.

Vezměme libovolné $w \in L$, $|w| \geq n$. Při zpracování $w$ projde stroj **alespoň $n+1$** konfiguracemi (počáteční + 1 po každém přečtení symbolu). Protože stavů je jen $n$, podle **principu holubníku** musí alespoň dva projít stejným stavem $r$. Tedy:

$$
(q_0, w) = (q_0, xyz) \vdash^* (r, yz) \vdash^k (r, z) \vdash^* (q_F, \varepsilon),
$$

kde $0 < k \leq n$ a $r$ je opakovaný stav. Navíc opakování nastane *nejpozději* po prvních $n$ symbolech, takže $|xy| \leq p$.

Pak ale můžeme cyklus mezi $(r, yz)$ a $(r, z)$ *přeskočit* nebo *opakovat libovolněkrát*:

::: math
\forall i \geq 0:\quad (q_0, xy^iz) \vdash^* (r, y^iz) \vdash^* (r, y^{i-1}z) \vdash^* \cdots \vdash^* (r, z) \vdash^* (q_F, \varepsilon).
:::

Tedy $xy^i z \in L$ pro libovolné $i \geq 0$, včetně $i = 0$ (vypuštění cyklu). ∎

::: viz pumping-lemma "Vyber neregulární jazyk a pumpující konstantu p. Nastav rozklad w = xyz; pro i = 0,1,2,3 uvidíš, které pumpování vyrazí slovo z jazyka. Mód lze přepnout i na CFG variantu (uvwxy)."
:::

## Použití: důkazy neregularity

Pumping lemma se v praxi *nepoužívá* k tomu, abychom dokázali, že jazyk je regulární — tam je *snazší* sestrojit KA. Používá se k **opačnému** směru: dokázat, že daný jazyk *není* regulární.

**Schéma důkazu (obměnou implikace).** Tvrzení $L \in \mathcal{L}_3 \Rightarrow A$ je ekvivalentní s $\neg A \Rightarrow L \notin \mathcal{L}_3$. Tj. ukážeme, že *žádné* $p$ s vlastností pumping lemmatu nestačí. Formálně:

::: math
\neg A \equiv \forall p > 0\,\exists w \in L \cap \Sigma^{\geq p}\,\forall (x, y, z): w = xyz \land y \neq \varepsilon \land |xy| \leq p \Rightarrow \exists i \geq 0: xy^iz \notin L.
:::

### Příklad 1: $L = \{0^n 1^n \mid n \geq 1\}$ není regulární

Pro libovolné $p > 0$ zvolme $w = 0^p 1^p$ (jistě $w \in L$, $|w| = 2p \geq p$).

Uvažme libovolný rozklad $w = xyz$ s $y \neq \varepsilon$ a $|xy| \leq p$. Protože prvních $p$ symbolů $w$ jsou samé $0$, *celé* $y$ leží v levé části nul: $y \in \{0\}^+$, tedy $y = 0^k$ pro nějaké $1 \leq k \leq p$.

$$
\underbrace{0 \cdots 0}_{x}\underbrace{0 \cdots 0}_{y}\underbrace{0 \cdots 0\,1 \cdots 1}_{z}
$$

Pak ale $xy^2z = 0^{p+k} 1^p \notin L$ — počty $0$ a $1$ nesouhlasí. Pumping lemma selhalo pro každé $p$, tedy $L \notin \mathcal{L}_3$. ∎

### Příklad 2: $L = \{a^q \mid q \text{ je prvočíslo}\}$ není regulární

Pro libovolné $p > 0$ zvolme $w = a^r$, kde $r$ je *prvočíslo* větší než $p$.

Libovolný rozklad $w = xyz$ s $y \neq \varepsilon$ a $|xy| \leq p$ má tvar $y = a^k$ pro $0 < k \leq p$.

Zvolme $i = r + 1$. Pak:

$$
|xy^{r+1}z| = |xyz| + |y^r| = r + r \cdot k = r(k + 1).
$$

Protože $r > 1$ a $k + 1 > 1$, je $r(k+1)$ *složené číslo*. Tedy $xy^{r+1}z = a^{r(k+1)} \notin L$. ∎

> Pumping lemma je *postačující* nástroj pro důkaz neregularity, ne *nutný* — existují *neregulární* jazyky, které pumping lemmatu vyhovují (kontrapříklad pro obrácenou implikaci). Pro takové jazyky používáme Myhill–Nerodovu větu (viz [[minimalizace]]).

## Myhill–Nerodova věta — silnější kritérium

**Věta** (Myhill–Nerode). Pro libovolný jazyk $L \subseteq \Sigma^*$ jsou tato tvrzení ekvivalentní:

1. $L$ je regulární.
2. $L$ je sjednocením některých tříd rozkladu $\Sigma^*$ určeného *pravou kongruencí* $\sim$ s **konečným** indexem.
3. Relace $\sim_L$ definovaná $u \sim_L v \iff \forall z \in \Sigma^*: (uz \in L \iff vz \in L)$ má konečný index.

**Pravá kongruence** $\sim$ je ekvivalence, která navíc *respektuje konkatenaci zprava*: $u \sim v \Rightarrow \forall a \in \Sigma: ua \sim va$.

**Index** ekvivalence = počet ekvivalenčních tříd. Konečný index znamená *konečně mnoho* tříd.

### Důkaz $L = \{a^n b^n\}$ neregulární přes M-N větu

Pro $i \neq j$ je $a^i \not\sim_L a^j$ — rozlišuje je řetězec $b^i$: $a^i b^i \in L$, ale $a^j b^i \notin L$.

Tedy $a^0, a^1, a^2, \dots$ jsou navzájem nerovnocenné — index $\sim_L$ je *nekonečný*. Z M-N: $L$ není regulární. ∎

M-N věta poskytuje *charakterizaci* regularity, nikoli jen postačující podmínku — je to *silnější* nástroj než pumping lemma.

## Uzávěrové vlastnosti

**Věta.** Třída regulárních jazyků je uzavřena vzhledem k:

| Operace | Konstrukce |
| :--- | :--- |
| Sjednocení $L_1 \cup L_2$ | NKA s novým $q_0$ a $\varepsilon$-přechody do obou strojů |
| Konkatenace $L_1 \cdot L_2$ | $\varepsilon$-přechody z $F_1$ do $q_{0,2}$ |
| Iterace $L^*$ | $\varepsilon$-zpětné hrany |
| Doplněk $\overline{L} = \Sigma^* \setminus L$ | $F' = Q \setminus F$ (vyžaduje úplně definovaný DKA) |
| Průnik $L_1 \cap L_2$ | De Morgan, nebo synchronizovaný součin dvou DKA |
| Reverz $L^R$ | Obraťme všechny šipky, prohoďme $q_0 \leftrightarrow F$ |
| Homomorfismus $h(L)$ | Aplikujeme $h$ na všechny štítky hran |
| Inverzní homomorfismus $h^{-1}(L)$ | Konstrukce přímo nad přechody |
| Rozdíl $L_1 \setminus L_2 = L_1 \cap \overline{L_2}$ | Z $\cap$ a $\overline{\cdot}$ |

::: svg "Konstrukce DKA pro průnik dvou jazyků: synchronizovaný součin stavových prostorů"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aUZ" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="75" y="20" text-anchor="middle" fill="var(--text-muted)" font-size="11">M₁ pro L₁</text>
  <g fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1">
    <circle cx="50" cy="60" r="14"/>
    <circle cx="110" cy="60" r="14"/>
  </g>
  <text x="50" y="64" text-anchor="middle" fill="var(--text)">p₀</text>
  <text x="110" y="64" text-anchor="middle" fill="var(--text)">p₁</text>
  <text x="75" y="20" text-anchor="middle" fill="var(--text-muted)" font-size="11">M₁ pro L₁</text>
  <text x="285" y="20" text-anchor="middle" fill="var(--text-muted)" font-size="11">M = M₁ × M₂ pro L₁ ∩ L₂</text>
  <text x="475" y="20" text-anchor="middle" fill="var(--text-muted)" font-size="11">M₂ pro L₂</text>
  <g fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1">
    <circle cx="450" cy="60" r="14"/>
    <circle cx="510" cy="60" r="14"/>
  </g>
  <text x="450" y="64" text-anchor="middle" fill="var(--text)">q₀</text>
  <text x="510" y="64" text-anchor="middle" fill="var(--text)">q₁</text>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <circle cx="220" cy="80" r="16"/>
    <circle cx="280" cy="60" r="16"/>
    <circle cx="280" cy="120" r="16"/>
    <circle cx="340" cy="80" r="16"/>
    <circle cx="340" cy="80" r="12" fill="none"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="10">
    <text x="220" y="83">(p₀,q₀)</text>
    <text x="280" y="63">(p₁,q₀)</text>
    <text x="280" y="123">(p₀,q₁)</text>
    <text x="340" y="83">(p₁,q₁)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aUZ)">
    <line x1="64" y1="60" x2="96" y2="60"/>
    <line x1="464" y1="60" x2="496" y2="60"/>
    <line x1="234" y1="76" x2="262" y2="64"/>
    <line x1="234" y1="84" x2="262" y2="118"/>
    <line x1="298" y1="64" x2="322" y2="76"/>
    <line x1="298" y1="118" x2="322" y2="86"/>
  </g>
  <text x="270" y="170" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">δ((p, q), a) = (δ₁(p, a), δ₂(q, a))</text>
  <text x="270" y="188" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">F = F₁ × F₂ — přijímáme jen ve dvojicích koncových stavů</text>
</svg>
:::

**Důkaz uzávěru na komplement.** Z úplně definovaného DKA $M$ pro $L$ vznikne DKA pro $\overline{L}$ záměnou $F$ za $Q \setminus F$. Zásadní je *úplnost* — neúplně definovaný DKA může "spadnout" na nedefinovaný přechod a *implicitně* zamítnout, a takové implicitní zamítnutí by se komplementací stalo nesprávnou akceptací.

**Důkaz uzávěru na průnik.** Z De Morganových zákonů:

$$
L_1 \cap L_2 = \overline{\overline{L_1} \cup \overline{L_2}}.
$$

Alternativní *přímá* konstrukce — *součin dvou DKA*: stavy jsou dvojice $(p, q) \in Q_1 \times Q_2$, přechod $\delta((p, q), a) = (\delta_1(p, a), \delta_2(q, a))$, koncové stavy $F = F_1 \times F_2$.

## Rozhodnutelné problémy v $\mathcal{L}_3$

**Věta.** Pro regulární jazyky jsou *rozhodnutelné* základní problémy:

| Problém | Formulace | Konstrukce |
| :--- | :--- | :--- |
| **Neprázdnost** | $L \neq \emptyset$ ? | BFS z $q_0$ — existuje dostupný koncový stav? |
| **Universalita** | $L = \Sigma^*$ ? | Každý dostupný stav je koncový? (po dokončení) |
| **Náležitost (členství)** | $w \in L$ ? | Simulace DKA na $w$ — $O(|w|)$ |
| **Ekvivalence** | $L(M_1) = L(M_2)$ ? | $\overline{L_1 \cap \overline{L_2}} \cap \overline{L_2 \cap \overline{L_1}} = \emptyset$ ? Nebo: výpočet $\equiv$ ve sjednoceném automatu (viz dále). |
| **Inkluze** | $L_1 \subseteq L_2$ ? | $L_1 \cap \overline{L_2} = \emptyset$ ? |
| **Konečnost** | $L$ je konečný? | Hledání cyklu v automatu po odstranění nedosažitelných a "neživých" stavů |

**Pro ekvivalenci.** Sjednotíme stavové prostory dvou DKA do jednoho automatu $M = (Q_1 \cup Q_2, \Sigma, \delta_1 \cup \delta_2, q_{0,1}, F_1 \cup F_2)$ a vypočteme relaci nerozlišitelnosti $\equiv$. Pak $L(M_1) = L(M_2) \iff q_{0,1} \equiv q_{0,2}$.

> **Pozor:** "Rozhodnutelnost" zde znamená, že existuje *algoritmus* dávající odpověď v *konečném čase*. Komplexita těchto algoritmů je *velmi nízká*: polynomiální v počtu stavů (typicky $O(|Q|^2)$ až $O(|Q|^3)$). Pro **kontextové** jazyky některé z těchto problémů zůstanou rozhodnutelné, ale jen *PSPACE-úplné* nebo *EXPTIME-úplné*. Pro **rekurzivně vyčíslitelné** jazyky se některé stanou *nerozhodnutelnými* ([[pcp-jazyky]]).

## Co znamená "regulárnost = jednoduchost"

Cesta od pumping lemmatu k rozhodnutelnosti ukazuje, **proč** se regulární jazyky chovají "krotce": jejich charakteristika konečným strojem dává *omezenou velikost paměti*, a tím i lineární testy členství, polynomiální testy ekvivalence, atd. Cena za jednoduchost: *žádný* matematicky netriviální jazyk (jako prvočísla, Collatzova posloupnost) není regulární.

V kapitole o bezkontextových jazycích ([[cfg-derivace]] a dále) uvidíme *druhou úroveň* hierarchie: pumping lemma pro CFG existuje, ale **slabší** — některé bezkontextové jazyky pumping lemmatu vyhovují *triviálně* a důkaz nepřispěchá. Rozhodnutelnost problému ekvivalence zde už *padá*: ekvivalence dvou bezkontextových gramatik je *nerozhodnutelná* ([[pcp-jazyky]]).

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Bar-Hillel, Y., Perles, M., Shamir, E.: *On Formal Properties of Simple Phrase Structure Grammars* (Z. Phonetik. Sprachwiss. Kommunikat., 1961); Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), §4.1–4.3; Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), §1.4.*
