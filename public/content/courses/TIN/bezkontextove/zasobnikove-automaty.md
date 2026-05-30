---
title: Zásobníkové automaty (PDA)
---

# Zásobníkové automaty

Konečný automat ([[konecne-automaty]]) si pamatuje pouze *konečné* množství informace — proto neumí přijmout $\{a^n b^n\}$, který vyžaduje "spočítat dvojí $n$". **Zásobníkový automat** (push-down automaton, PDA) přidá k řízení *zásobník* (LIFO úložiště symbolů), do něhož může libovolně ukládat a z něhož libovolně odebírat. PDA jsou *akceptační dvojníci* bezkontextových gramatik ([[cfg-derivace]]) — přijímají právě bezkontextové jazyky ($\mathcal{L}_2$).

## Architektura

::: svg "Zásobníkový automat — vstupní páska, stavové řízení, zásobník"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aZA" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="180" y="20" text-anchor="middle" fill="var(--text-muted)">vstupní páska (read-only)</text>
  <g fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1">
    <rect x="40" y="30" width="280" height="30"/>
    <line x1="80" y1="30" x2="80" y2="60"/>
    <line x1="120" y1="30" x2="120" y2="60"/>
    <line x1="160" y1="30" x2="160" y2="60"/>
    <line x1="200" y1="30" x2="200" y2="60"/>
    <line x1="240" y1="30" x2="240" y2="60"/>
    <line x1="280" y1="30" x2="280" y2="60"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="60" y="50">a</text>
    <text x="100" y="50">a</text>
    <text x="140" y="50">b</text>
    <text x="180" y="50">b</text>
    <text x="220" y="50">…</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="var(--bg-card)">
    <rect x="120" y="100" width="120" height="60" rx="8"/>
  </g>
  <text x="180" y="125" text-anchor="middle" fill="var(--accent)">stavové řízení</text>
  <text x="180" y="143" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">δ(q, a, Z)</text>
  <g stroke="var(--accent-line)" stroke-width="1.2" fill="none">
    <line x1="80" y1="60" x2="120" y2="100" marker-end="url(#aZA)"/>
  </g>
  <text x="280" y="80" fill="var(--text-muted)" font-size="10">↑ čte vstup</text>
  <g fill="var(--bg-card)" stroke="var(--line)" stroke-width="0.9">
    <rect x="380" y="80" width="60" height="30"/>
    <rect x="380" y="110" width="60" height="30"/>
    <rect x="380" y="140" width="60" height="30"/>
    <rect x="380" y="170" width="60" height="30"/>
  </g>
  <g fill="var(--text)" font-size="11" text-anchor="middle">
    <text x="410" y="100">Z_k</text>
    <text x="410" y="130">Z_(k-1)</text>
    <text x="410" y="160">⋮</text>
    <text x="410" y="190">Z_0</text>
  </g>
  <text x="410" y="65" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">vrchol zásobníku ↓</text>
  <text x="410" y="215" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">dno zásobníku</text>
  <g stroke="var(--accent-line)" stroke-width="1.2" fill="none">
    <line x1="240" y1="130" x2="378" y2="100" marker-end="url(#aZA)"/>
    <line x1="378" y1="105" x2="240" y2="135" marker-end="url(#aZA)"/>
  </g>
  <text x="310" y="105" fill="var(--text-muted)" font-size="10">číst vrchol</text>
  <text x="310" y="135" fill="var(--text-muted)" font-size="10">přepsat vrchol</text>
</svg>
:::

PDA má:

* **Vstupní pásku** (read-only) se zpracovávaným slovem $w$,
* **Konečné stavové řízení** (množina stavů $Q$, $q_0$, $F$),
* **Zásobník** $\Gamma^*$ — LIFO úložiště symbolů s neomezenou kapacitou.

## Definice

**Definice.** *Zásobníkový automat* je sedmice

$$
P = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F),
$$

kde:

1. $Q$ je konečná **množina stavů**,
2. $\Sigma$ je konečná **vstupní abeceda**,
3. $\Gamma$ je konečná **zásobníková abeceda**,
4. $\delta : Q \times (\Sigma \cup \{\varepsilon\}) \times \Gamma \to \mathcal{P}_\text{fin}(Q \times \Gamma^*)$ je **přechodová funkce** — pro daný *stav*, *vstupní symbol* (nebo $\varepsilon$) a *vrcholový symbol* zásobníku vrací konečnou množinu dvojic *(nový stav, nový vrcholový řetězec)*,
5. $q_0 \in Q$ je **počáteční stav**,
6. $Z_0 \in \Gamma$ je **počáteční symbol zásobníku**,
7. $F \subseteq Q$ je **množina koncových stavů**.

**Pozor**: nedeterminismus je v PDA *intrinsický* — funkce $\delta$ vrací *množinu* možných pokračování. **Deterministický PDA** ([[ekvivalence-pda-cfg]]) je *přísné omezení* — ne každý bezkontextový jazyk lze přijmout deterministickým PDA.

## Konfigurace a krok výpočtu

**Konfigurace** PDA je trojice

$$
(q, w, \alpha) \in Q \times \Sigma^* \times \Gamma^*,
$$

kde $q$ je aktuální stav, $w$ je dosud nezpracovaná část vstupu a $\alpha$ je obsah zásobníku (vlevo vrchol, vpravo dno).

**Krok výpočtu**: $(q, w, \beta) \vdash_P (q', w', \beta')$ právě když existuje $a \in \Sigma \cup \{\varepsilon\}$, $Z \in \Gamma$, $\gamma \in \Gamma^*$, $\alpha \in \Gamma^*$ takové, že:

$$
w = aw',\quad \beta = Z\alpha,\quad \beta' = \gamma\alpha,\quad (q', \gamma) \in \delta(q, a, Z).
$$

Tj. čteme buď vstupní symbol $a$ (nebo $\varepsilon$ — bez čtení), čteme vrcholový symbol zásobníku $Z$, a *nahrazujeme* ho řetězcem $\gamma$ (který může být i prázdný — pak je $Z$ z vrcholu *odebrán*).

## Dva způsoby přijetí

PDA má **dva způsoby**, jak přijmout vstup:

1. **Přijetí koncovým stavem** ($L(P)$):
   $$L(P) = \{w \in \Sigma^* \mid (q_0, w, Z_0) \vdash^*_P (q, \varepsilon, \gamma),\ q \in F\}.$$
   Stroj dosáhne libovolného koncového stavu po zpracování celého vstupu; obsah zásobníku není podstatný.

2. **Přijetí prázdným zásobníkem** ($N(P)$):
   $$N(P) = \{w \in \Sigma^* \mid (q_0, w, Z_0) \vdash^*_P (q, \varepsilon, \varepsilon)\}.$$
   Stroj zpracuje celý vstup a *vyprázdní zásobník*; stav $q$ není podstatný (množina $F$ obvykle prázdná).

**Věta.** Obě varianty jsou *ekvivalentní co do síly* — $\mathcal{L}(\text{PDA}_F) = \mathcal{L}(\text{PDA}_\emptyset) = \mathcal{L}_2$.

Konstrukce převodu:
* **$L(P) \to N(P')$**: $P'$ má dno-detekční symbol $Z_0'$, který zůstane v $P'$ po veškerém běhu; v koncových stavech $P'$ má $\varepsilon$-přechod "vyhazující" celý zásobník (`pop` až po $Z_0'$).
* **$N(P) \to L(P')$**: $P'$ má speciální nový dno-symbol $X_0$ pod $Z_0$ a koncový stav $q_F$. Když $P'$ "detekuje" symbol $X_0$ jako vrcholový, znamená to, že $P$ právě vyprázdnil zásobník — $P'$ přejde do $q_F$.

## Příklad: PDA pro $\{0^n 1^n \mid n \geq 0\}$

Použijeme přijetí *koncovým stavem*. $P = (\{q_0, q_1, q_2\}, \{0, 1\}, \{Z, 0\}, \delta, q_0, Z, \{q_0\})$:

$$
\begin{aligned}
\delta(q_0, 0, Z) &= \{(q_1, 0Z)\}, &\quad \delta(q_1, 0, 0) &= \{(q_1, 00)\}, \\
\delta(q_1, 1, 0) &= \{(q_2, \varepsilon)\}, &\quad \delta(q_2, 1, 0) &= \{(q_2, \varepsilon)\}, \\
\delta(q_2, \varepsilon, Z) &= \{(q_0, \varepsilon)\}. & &
\end{aligned}
$$

**Idea.** V $q_0/q_1$ stroj přijímá $0$ a *pushuje* je na zásobník. Když přijde $1$, přejde do $q_2$ a *popuje* každou $1$ proti vrcholovému $0$. Pokud po vyprázdnění "$0$" stroj vidí $Z$ pod hlavou a vstup je hotov, přejde zpět do $q_0$ (koncový).

**Příklad zpracování slova $0011$**:

$$
\begin{aligned}
(q_0, 0011, Z) &\vdash (q_1, 011, 0Z) \\
&\vdash (q_1, 11, 00Z) \\
&\vdash (q_2, 1, 0Z) \\
&\vdash (q_2, \varepsilon, Z) \\
&\vdash (q_0, \varepsilon, \varepsilon).
\end{aligned}
$$

Slovo je přijato — končíme v $q_0 \in F$ se zpracovaným vstupem.

## Přechodový diagram PDA

PDA lze také popsat *přechodovým diagramem* (analogicky jako KA), kde hrana je ohodnocena tripletem `a, Z/γ` — *čtený symbol* | *vrcholový symbol* | *nahrazení vrcholu*.

::: svg "Přechodový diagram PDA pro {0ⁿ1ⁿ}"
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aPDA1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="100" cy="80" r="22"/>
    <circle cx="270" cy="80" r="22"/>
    <circle cx="440" cy="80" r="22"/>
    <circle cx="100" cy="80" r="17" fill="none"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle">
    <text x="100" y="84">q₀</text>
    <text x="270" y="84">q₁</text>
    <text x="440" y="84">q₂</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aPDA1)">
    <path d="M122,80 L248,80"/>
    <path d="M292,80 L418,80"/>
    <path d="M256,58 Q240,38 270,38 Q294,38 282,58"/>
    <path d="M420,103 Q400,125 440,125 Q470,125 442,103"/>
    <path d="M425,68 Q330,30 122,68" marker-end="url(#aPDA1)"/>
    <path d="M30,80 L78,80"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="185" y="73" text-anchor="middle">0, Z / 0Z</text>
    <text x="355" y="73" text-anchor="middle">1, 0 / ε</text>
    <text x="270" y="30" text-anchor="middle">0, 0 / 00</text>
    <text x="440" y="135" text-anchor="middle">1, 0 / ε</text>
    <text x="270" y="48" text-anchor="middle">ε, Z / ε</text>
    <text x="25" y="83">start</text>
  </g>
</svg>
:::

::: viz pda-stack "Krokuj PDA pro {0^n 1^n} a palindromy. Pro nedeterministický stroj (palindromy) sám voli ε-přechod — hádej střed slova."
:::

## Rozšířený PDA

**Definice.** *Rozšířený zásobníkový automat* (RZA) je sedmice se stejnou strukturou jako PDA, ale přechodová funkce má rozšířený definiční obor:

$$
\delta : Q \times (\Sigma \cup \{\varepsilon\}) \times \Gamma^* \to \mathcal{P}_\text{fin}(Q \times \Gamma^*).
$$

Tedy můžeme se rozhodovat podle **celého vrcholového řetězce** (libovolné délky), ne jen podle jednoho symbolu.

**Věta (ekvivalence).** RZA a PDA přijímají *stejnou* třídu jazyků. Klíčová konstrukce: RZA dokáže "číst" $m$ vrcholových symbolů; ekvivalentní PDA si tyto symboly drží ve *stavu* (vyrovnávací paměť o velikosti $m$). Konečnost $m$ je zaručena tím, že RZA má jen *konečně mnoho* různých vrcholových řetězců na levé straně přechodů.

Síla RZA nad PDA je čistě *kvalitou zápisu* — místo posloupnosti $\varepsilon$-přechodů, které postupně "kontrolují" vrcholové symboly, můžeme zaktualizovat několik najednou. RZA tedy zjednodušuje *konstrukci*, ne *třídu*.

## Tabulkový a diagramový zápis

Pro malé PDA si vystačíme s **diagramem**. Pro větší se používá *tabulka přechodů*, např.:

| $\delta$ | $0$ | $1$ | $\varepsilon$ |
| :-: | :--- | :--- | :--- |
| $q_0/Z$ | $\{(q_1, 0Z)\}$ | — | — |
| $q_1/0$ | $\{(q_1, 00)\}$ | $\{(q_2, \varepsilon)\}$ | — |
| $q_2/0$ | — | $\{(q_2, \varepsilon)\}$ | — |
| $q_2/Z$ | — | — | $\{(q_0, \varepsilon)\}$ |

Stavový + vrcholový symbol tvoří *řádek* tabulky; vstupní symbol *sloupec*.

[[ekvivalence-pda-cfg]] zformalizuje souvislost PDA ↔ bezkontextová gramatika a ukáže oba směry konstrukce — z gramatiky postavíme PDA pro nedeterministickou syntaktickou analýzu shora dolů, a z PDA postavíme gramatiku pomocí trojic stavů.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Chomsky, N.: *Context-Free Grammars and Pushdown Storage* (Quart. Prog. Rep. 65, MIT, 1962); Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), §6.1–6.2; Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), §2.2.*
