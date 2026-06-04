---
title: Simulace, bisimulace a kongruence procesů
---

# Simulace, bisimulace, kongruence

Předchozí kapitoly ([[csp-occam]], [[pi-calculus]]) představily *jazyky* pro popis distribuovaných systémů. Klíčová otázka *teorie procesů*: kdy lze dva procesy považovat za **ekvivalentní**? Různé syntaktické podoby mohou popisovat stejné chování. Tato kapitola probírá *standardní* nástroje pro porovnávání procesů: **silnou** a **slabou simulaci**, **bisimulaci**, **barbed bisimulaci**, a **kongruence**.

## Motivace — kdy jsou procesy „stejné"?

Uvažujme dva procesy:

- $P_1 = a.b.\mathbf{0}$ — provede akci $a$, pak $b$, pak skončí.
- $P_2 = a.(b.\mathbf{0} + b.\mathbf{0})$ — provede $a$, pak (nedeterministicky) jednu z dvou kopií $b.\mathbf{0}$.

Pozorovatel zvenčí (= jiný proces komunikující s nimi) vidí *stejnou sekvenci* akcí $a, b$. Jsou ale *strukturálně* různé.

**Otázka**: jsou ekvivalentní? Existuje *univerzální* odpověď? Ne — záleží na *kritériu ekvivalence*.

V praxi nás zajímají různá kritéria:

- **Trace equivalence**: jsou produkce stejných stop akcí možné?
- **Failure equivalence**: jsou možné stejné odmítnutí akcí?
- **Bisimulation**: lze každý krok jednoho procesu *zrcadlit* druhým?

## Silná simulace

**Silná simulace** $S$ je *relace* mezi procesy, taková že:

::: math
\text{Pokud } P \mathrel{S} Q \text{ a } P \xrightarrow{a} P', \text{ pak existuje } Q' \text{ takové, že } Q \xrightarrow{a} Q' \text{ a } P' \mathrel{S} Q'.
:::

Slovy: kdykoli $P$ udělá akci $a$ do $P'$, $Q$ *musí umět* udělat tu *samou* akci do nějakého $Q'$, a *následné* procesy jsou stále v relaci.

**Význam**: $Q$ „simuluje" $P$ — co umí $P$, umí i $Q$.

::: svg "Silná simulace — Q zrcadlí každý krok P"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="120" cy="50" r="14"/>
    <circle cx="120" cy="140" r="14"/>
    <circle cx="320" cy="50" r="14"/>
    <circle cx="320" cy="140" r="14"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="120" y="54">P</text>
    <text x="120" y="144">P'</text>
    <text x="320" y="54">Q</text>
    <text x="320" y="144">Q'</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" marker-end="url(#sarr)">
    <line x1="120" y1="65" x2="120" y2="125"/>
    <line x1="320" y1="65" x2="320" y2="125"/>
  </g>
  <defs>
    <marker id="sarr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="135" y="100" fill="var(--accent)" font-size="11">a</text>
  <text x="335" y="100" fill="var(--accent)" font-size="11">a</text>
  <g stroke="var(--text-faint)" stroke-width="1" stroke-dasharray="3 3">
    <line x1="135" y1="50" x2="305" y2="50"/>
    <line x1="135" y1="140" x2="305" y2="140"/>
  </g>
  <text x="220" y="44" fill="var(--text-muted)" text-anchor="middle" font-size="10">S (simulace)</text>
  <text x="220" y="155" fill="var(--text-muted)" text-anchor="middle" font-size="10">S (zachovává se)</text>
</svg>
:::

## Slabá simulace

V mnoha kontextech *tiché* akce ($\tau$) nás nezajímají — jsou *vnitřní*. **Slabá simulace** je relaxovaná verze silné simulace, která *ignoruje* tiché akce:

::: math
\begin{aligned}
&\text{Pokud } P \mathrel{S} Q \text{ a } P \xrightarrow{\tau} P', \text{ pak existuje } Q' \text{ takové, že } Q \xrightarrow{\tau^*} Q' \text{ a } P' \mathrel{S} Q'. \\
&\text{Pokud } P \mathrel{S} Q \text{ a } P \xrightarrow{a} P' \text{ (s } a \neq \tau\text{), pak existuje } Q' \text{ takové, že } Q \xrightarrow{\tau^* a \tau^*} Q' \text{ a } P' \mathrel{S} Q'.
\end{aligned}
:::

Kde $\xrightarrow{\tau^*}$ = nula nebo víc $\tau$ kroků. A $\xrightarrow{\tau^* a \tau^*}$ = nula nebo víc $\tau$, pak $a$, pak nula nebo víc $\tau$.

**Význam**: $Q$ může mezi viditelnými akcemi udělat libovolný počet tichých akcí (interní práce).

## Bisimulace

**Bisimulace** = relace simulace, která funguje *oběma směry*. Tj. $P$ simuluje $Q$ *a* $Q$ simuluje $P$.

**Definice**: $S$ je *bisimulace*, pokud $S$ je simulace *a* $S^{-1}$ (obrácená relace) je *taky* simulace.

**Bisimilarita** $\sim$ = *sjednocení všech bisimulací* (= největší bisimulace). Procesy jsou *bisimilární*, pokud existuje *aspoň jedna* bisimulace, která je obsahuje.

### Příklad — bisimulace dvou LTS

Mějme dva LTS:

```
LTS 1:           LTS 2:
   1               A
   |a              |a
   2               B
   |b              |b
   3   /   \       C
   |a    a
   4     5
   |b     b
```

Postupné vytváření bisimulace:

```
S1 = {(1,A), (2,B), (3,C), (4,B), (5,C), (A,1), (B,2), (C,3), (B,4), (C,5)}
```

Procesy $1$ a $A$ jsou bisimilární — $A$ může simulovat každý krok 1 a naopak.

### Charakterizace pomocí Hennessy-Milnerovy logiky

**Hennessy-Milner logika** je modální logika s formulemi:

- $\top$, $\bot$ — pravda, nepravda.
- $\phi \land \psi$, $\phi \lor \psi$ — logické spojky.
- $\langle a \rangle \phi$ — *existuje* $a$-přechod do stavu, kde platí $\phi$.
- $[a] \phi$ — *každý* $a$-přechod vede do stavu, kde platí $\phi$.

**Věta (Hennessy-Milner 1985)**: dva procesy *bisimilární* $\iff$ *splňují stejné* HM formule.

Tj. bisimilarita = ekvivalence z pohledu *pozorovatele*, který umí formulovat HM tvrzení.

## Barbed simulace a bisimulace

Pro **π-kalkul** se používá **barbed** varianta — *zaměřená* na *pozorovatelné* kanály.

**Pozorování** $P \downarrow x$ = proces $P$ může *přijmout* nebo *vyslat* po kanále $x$ (kanál není soukromý — *externalý*).

**Silná barbed bisimulace** $\sim$: relace $S$ taková, že pro každé $(P, Q) \in S$:

- $P \downarrow x \implies Q \downarrow x$.
- $P \xrightarrow{\tau} P' \implies \exists Q': Q \xrightarrow{\tau} Q'$ a $(P', Q') \in S$.
- Obráceně: $Q \downarrow x \implies P \downarrow x$.
- $Q \xrightarrow{\tau} Q' \implies \exists P': P \xrightarrow{\tau} P'$ a $(P', Q') \in S$.

**Slabá barbed bisimulace**: stejné, ale s $\xrightarrow{\tau^*}$ místo $\xrightarrow{\tau}$.

**Význam**: dva procesy se *„chovají stejně"* z pohledu vnějšího pozorovatele, který vidí jen externí kanály.

## Kongruence

**Kongruence** = ekvivalence, která se *zachová* při *libovolném kontextu*. Tj. pokud $P \equiv Q$, pak $C[P] \equiv C[Q]$ pro libovolný kontext $C$.

### Kontext

**Kontext** $C[\cdot]$ je proces s *dírou* $[\cdot]$ — místem, kam lze *zasunout* podproces.

Příklady:

::: math
\begin{aligned}
C_0 &= (\nu z)({!}\,z(w).\overline{w}a.\mathbf{0}) \mid [\cdot] \\
C_1 &= x(z).{!}\,(\nu w)\bigl(z(w).[\cdot] + y(v).\mathbf{0}\bigr)
\end{aligned}
:::

### Příklad — bisimulace ≠ kongruence

Procesy:

::: math
P_1 = \tau.A.\mathbf{0}, \quad P_2 = A.\mathbf{0}
:::

Tyto procesy jsou *bisimilární* (vykonají stejnou akci $A$ navenek; $\tau$ není pozorovatelná).

Ale v kontextu $C = [\cdot] + P_3$ (kde $P_3$ je nějaký jiný proces):

- $C[P_1] = \tau.A.\mathbf{0} + P_3$
- $C[P_2] = A.\mathbf{0} + P_3$

První umí $\tau$-krok do $A.\mathbf{0}$ (a tím *vyřadit* $P_3$ z volby). Druhý umí *přímo* $A$ — i tady má $P_3$ pořád volbu.

Tj. $C[P_1] \not\sim C[P_2]$ — bisimulace *není* kongruence!

**Řešení**: definovat *kongruenční ekvivalenci* (např. *observational congruence*) — silnější než bisimulace, je *uzavřená* na kontexty.

## Strong vs Weak Congruence

**Silná kongruence** ($\sim$) — vyžaduje *přesnou* shodu kroků včetně $\tau$.

**Slabá kongruence** ($\approx$) — vyžaduje shodu *jen* pozorovatelných akcí, $\tau$ se *ignoruje*.

V praxi *slabá* kongruence je obvyklejší — implementace má jiný počet tichých kroků než specifikace, ale stejné navenek viditelné chování.

## Aplikace teorie ekvivalence {tier=practice}

### Formální verifikace

Jak ověřit, že implementace odpovídá specifikaci?

1. Napsat *specifikaci* jako proces v CSP nebo π-kalkulu.
2. Napsat *implementaci* (typicky více explicitní, s vnitřními kroky).
3. Dokázat *bisimulaci* mezi specifikací a implementací.

Nástroje:

- **FDR** (Failures-Divergences Refinement) — pro CSP. Používá *refinement* místo bisimulace.
- **mCRL2** — pro µCRL (Process Algebra Calculus). Bisimilarity check.
- **CADP** (Construction and Analysis of Distributed Processes) — pro LOTOS, různé sémantiky.

### Reduktivní techniky

Pokud máme model státu (např. miliony stavů), často chceme **redukovat** ho na *bisimilární* menší model. Algoritmy:

- **Paige-Tarjan**: $O(m \log n)$ (m = počet přechodů/hran, n = počet stavů) pro výpočet partition refinement = bisimulace.
- **Hopcroft**: $O(n \log n)$ pro DFA minimalizaci (speciální případ bisimulace).

### Security

V applied π-calculus se *bisimulace* používá pro:

- **Anonymity**: nemůže útočník rozlišit dvě konkrétní volby?
- **Secrecy**: zůstávají soukromé klíče soukromé?
- **Equivalence-based property**: protokol je *bezpečný* $\iff$ jeho implementace je *bisimilární* s ideálním protokolem.

**ProVerif** používá *labeled bisimilarity* pro automatickou analýzu cryptografických protokolů.

## Co dál

Topic 7 (Distribuované systémy — process algebra) je kompletní. Topic 8 (Synchronizace) přejde od *modelování* komunikace k *praktickým* algoritmům: **NTP** (Network Time Protocol), **Berkleyho algoritmus**, **Lamportovy logické hodiny**, **vektorové hodiny**. Tyto algoritmy řeší *fundamentální* otázku: jak v distribuovaném systému *uspořádat* události *v čase*?

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Milner, R.: *Communication and Concurrency* (Prentice Hall 1989) — kanonický text pro CCS a bisimulaci; Milner, R.: *Communicating and Mobile Systems: The π-Calculus* (Cambridge UP 1999), kap. 2 a 5; Sangiorgi, D., Walker, D.: *The π-calculus* (Cambridge UP 2001), kap. 2; Hennessy, M., Milner, R.: „Algebraic laws for nondeterminism and concurrency" (J. ACM 32(1), 1985, [DOI 10.1145/2455.2460](https://doi.org/10.1145/2455.2460)); Park, D.: „Concurrency and automata on infinite sequences" (LNCS 104, 1981, [DOI 10.1007/BFb0017309](https://doi.org/10.1007/BFb0017309)) — původní definice bisimulace; Paige, R., Tarjan, R.E.: „Three partition refinement algorithms" (SIAM J. Comput. 16(6), 1987, [DOI 10.1137/0216062](https://doi.org/10.1137/0216062)).*
