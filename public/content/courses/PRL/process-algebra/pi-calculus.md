---
title: π-kalkul — mobilní procesy a předávání jmen
---

# π-kalkul — formální nástroj pro mobilní procesy

Předchozí kapitola ([[csp-occam]]) představila CSP a OCCAM — algebry s *pevnými* propojeními. **π-kalkul** (Milner, Parrow, Walker 1992) je generalizace, která dovoluje *předávat* **jména komunikačních kanálů** jako data. To umožňuje modelovat *dynamická* systémová prostředí: mobilní procesy, dynamicky vznikající kanály, *scope extrusion* (rozšíření soukromého kanálu). π-kalkul je *kanonický* model pro distribuované systémy 21. století — cloud computing, microservices, mobile agents.

## Motivace — proč nestačí CSP

V CSP jsou *propojení* mezi procesy *pevná* — síť kanálů se nastaví na začátku a zůstává konstantní. V mnoha reálných systémech je propojení *dynamické*:

- **Microservices**: služba A pošle službě B *URL* nového endpointu C, který B začne používat.
- **Mobile agents**: agent dorazí na nový stroj, dostane *kanál* na lokální databázi.
- **Object capabilities**: program předá *referenci* na objekt jako argument volání.

**π-kalkul** modeluje toto přenášení *jmen kanálů* (capabilities) jako *first-class* data.

## Syntax π-kalkulu

**Procesy** jsou definovány grammatikou:

::: math
\begin{aligned}
P &::= M \mid P \mid P' \mid (\nu z) P \mid {!} P \\
M &::= \mathbf{0} \mid \pi.P \mid M + M'
\end{aligned}
:::

**Předpony** (akce):

::: math
\pi ::= \bar{x}y \mid x(z) \mid \tau \mid [x = y]
:::

### Vysvětlení primitiv

| Konstrukt | Význam |
| :--- | :--- |
| $\mathbf{0}$ | *prázdný* (ukončený) proces |
| $\bar{x}y. P$ | *odeslání*: pošli jméno $y$ po kanále $x$, pak pokračuj jako $P$ |
| $x(z). P$ | *příjem*: přijmi jméno po kanále $x$ jako $z$, pak pokračuj jako $P$ |
| $\tau. P$ | *tichá* (neviditelná) akce, pak $P$ |
| $[x = y] P$ | *test*: pokud $x = y$, pak proveď $P$, jinak nic |
| $P \mid P'$ | *paralelní* kompozice |
| $P + P'$ | *nedeterministický výběr* |
| $(\nu z) P$ | *omezení jména*: $z$ je *nový soukromý* kanál v $P$ |
| ${!} P$ | *replikace* — nekonečně mnoho kopií $P$ |

### Příklad — synchronní komunikace

```
x⟨y⟩.P | x(a).Q  →  P | Q[y/a]
```

Levý proces *odešle* $y$ po kanále $x$; pravý proces *přijme* a *substituuje* $y$ za $a$ v $Q$.

## Strukturální kongruence

**Strukturální kongruence** ($\equiv$) říká, které procesy jsou *„stejné"*, jen zapsané jinak. Nejmenší kongruence splňující axiomy:

| Axiom | |
| :--- | :--- |
| $M + \mathbf{0} \equiv M$ | identita pro výběr |
| $M_1 + M_2 \equiv M_2 + M_1$ | komutativita výběru |
| $M_1 + (M_2 + M_3) \equiv (M_1 + M_2) + M_3$ | asociativita |
| $P \mid \mathbf{0} \equiv P$ | identita pro paralelní |
| $P_1 \mid P_2 \equiv P_2 \mid P_1$ | komutativita |
| $(P_1 \mid P_2) \mid P_3 \equiv P_1 \mid (P_2 \mid P_3)$ | asociativita |
| ${!} P \equiv P \mid {!} P$ | replikace odbalí jednu kopii |
| $(\nu a) \mathbf{0} \equiv \mathbf{0}$ | nepotřebné omezení |
| $(\nu a)(\nu b) P \equiv (\nu b)(\nu a) P$ | komutativita omezení |
| $[x = x] \pi. P \equiv \pi. P$ | triviální test |
| $P_1 \mid (\nu a) P_2 \equiv (\nu a)(P_1 \mid P_2)$ pokud $a \notin \text{fn}(P_1)$ | rozsah |

## Redukční pravidla

Hlavní pravidlo — **komunikace (COMM)**:

::: math
\bar{x}z.P \mid x(y).Q \to P \mid Q[z/y]
:::

Odeslání $z$ po $x$ a přijetí jako $y$ → substituce $y \to z$ v $Q$.

Další pravidla pro kontextovou aplikaci:

| Pravidlo | Tvar |
| :--- | :--- |
| **R-PAR** | $\dfrac{P \to Q}{P \mid R \to Q \mid R}$ |
| **R-RES** | $\dfrac{P \to Q}{(\nu x) P \to (\nu x) Q}$ |
| **R-STRUCT** | $\dfrac{P \equiv P' \to Q' \equiv Q}{P \to Q}$ |
| **MATCH** | $\dfrac{P \to Q}{[x = x] P \to Q}$ |
| **R-TAU** | $\tau.P + M \to P$ |

## Scope extrusion — klíčový rys π-kalkulu

**Scope extrusion** = rozšíření *soukromého* kanálu *vně* svého původního scope. To je *unikátní* vlastnost π-kalkulu (CSP to neumí).

### Příklad

::: math
(\nu a)(\bar{b}a.S \mid R) \mid b(c).\bar{c}d.P \to (\nu a)(S \mid R \mid \bar{a}d.P)
:::

Vlevo: pod-proces $\bar{b}a.S$ pošle *soukromé* jméno $a$ po kanále $b$. Příjemce dostane $a$ jako $c$, pak používá $\bar{c}d.P$ = $\bar{a}d.P$.

**Pozorování**: scope $(\nu a)$ se *rozšíří*, aby obsahoval i třetí proces $P$. Po rozšíření má $P$ přístup k soukromému $a$.

::: svg "Scope extrusion — soukromý kanál se rozšíří díky předání jména"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" stroke-dasharray="4 3">
    <rect x="30" y="30" width="220" height="120" rx="3"/>
  </g>
  <text x="140" y="50" fill="var(--accent)" text-anchor="middle" font-size="10">(νa) scope před</text>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="70" cy="80" r="14"/>
    <circle cx="170" cy="80" r="14"/>
    <circle cx="400" cy="80" r="14"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70" y="84">S</text>
    <text x="170" y="84">R</text>
    <text x="400" y="84">P</text>
  </g>
  <text x="120" y="115" fill="var(--text-muted)" text-anchor="middle" font-size="10">a (soukromé)</text>
  <g stroke="var(--accent)" stroke-width="0.9" fill="none" marker-end="url(#scopearr)">
    <line x1="184" y1="80" x2="385" y2="80"/>
  </g>
  <defs>
    <marker id="scopearr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="290" y="73" fill="var(--accent)" text-anchor="middle" font-size="10">pošle a po b</text>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" stroke-dasharray="4 3">
    <rect x="30" y="160" width="490" height="30" rx="3"/>
  </g>
  <text x="275" y="180" fill="var(--accent)" text-anchor="middle" font-size="10">(νa) scope po — rozšířený, zahrnuje i P</text>
</svg>
:::

### Kdy je scope extrusion zajímavá

- **Sandboxing**: rodičovský proces vytvoří kanál pro syna, *předá* mu ho. Kanál je soukromý mezi rodičem a synem.
- **Capability passing**: objekt předá *referenci* na svůj interní stav jiné instanci.
- **Mobile code**: kód migruje na vzdálený server, dostane *kanál* na lokální zdroj.

## Semantika s labeled transitions

Místo redukce ($\to$) lze definovat *labeled transition system* (LTS):

::: math
P \xrightarrow{\alpha} P'
:::

kde $\alpha$ je *akce*:

- $xy$ — *vstup* (přijetí jména $y$ po $x$).
- $\bar{x}y$ — *otevřený výstup* (odeslání $y$ po $x$).
- $\bar{x}(z)$ — *výstup s omezeným jménem* $z$ (předání soukromého kanálu).
- $\tau$ — *tichá* akce.

LTS umožňuje *kompozicionální* analýzu: chování složeného procesu lze odvodit z LTS jeho podproc.

## Příklad — výpočet faktoriálu v π-kalkulu

Synchronní rekurze přes replikaci:

::: math
\text{FAC} \equiv {!} f(n, r). \bigl( [n = 0] \bar{r}1 + (\nu r')(\bar{f}(n-1, r') \mid r'(v). \bar{r}(n \cdot v)) \bigr)
:::

Definuje rekurzivní službu: přijímá *argument* $n$ a *kanál pro odpověď* $r$. Pokud $n = 0$, vrátí 1 po $r$; jinak rekurzivně volá s $n - 1$ a *novým* kanálem $r'$, pak vynásobí výsledek a vrátí po $r$.

Klient: $\bar{f}(5, \text{result}).\text{result}(v). \dots$ — pošle 5 + kanál pro odpověď, čeká na výsledek.

## π-kalkul vs CSP

| Aspekt | CSP | π-kalkul |
| :--- | :--- | :--- |
| Pevnost propojení | pevná | dynamická |
| Předávání jmen | ne | ano |
| Scope extrusion | ne | ano |
| Replikace | ne (typicky) | ano (${!}P$) |
| Sémantika | trace, failures, divergence | LTS, bisimulace |
| Použití | hardware design, formal verification | mobilní systémy, security, cloud |

## Reálné aplikace π-kalkulu

- **Spi-calculus** (Abadi, Gordon 1997) — extension pro kryptografické protokoly. Modeluje symbolické šifrování, nonces, atd.
- **Applied π-calculus** — pro protokoly typu TLS, Signal, Kerberos.
- **ProVerif** — verifikátor pro applied π-calculus, používaný pro analýzu autentizace, secrecy, replay attacks.
- **JoCaml** — implementace π-kalkulu jako rozšíření OCaml.
- **Pict** — programovací jazyk přímo postavený na π-kalkulu.

## Co dál

[[simulace-bisimulace]] probere *teorii ekvivalence procesů* — kdy lze dva procesy považovat za „stejné" navzdory různé syntaxi. Klíčové pojmy: **silná simulace**, **slabá simulace**, **bisimulace**, **barbed bisimulace**, **kongruence**. Tyto pojmy jsou *základ formální verifikace* — dokazování, že implementace odpovídá specifikaci.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Milner, R., Parrow, J., Walker, D.: „A calculus of mobile processes" (Inf. Comput. 100(1), 1992, [DOI 10.1016/0890-5401(92)90008-4](https://doi.org/10.1016/0890-5401(92)90008-4) — Part I, [Part II](https://doi.org/10.1016/0890-5401(92)90009-5)); Milner, R.: *Communicating and Mobile Systems: The π-Calculus* (Cambridge UP 1999) — kanonický text; Sangiorgi, D., Walker, D.: *The π-calculus: A Theory of Mobile Processes* (Cambridge UP 2001); Abadi, M., Gordon, A.D.: „A calculus for cryptographic protocols: the spi calculus" (CCS 1997, [DOI 10.1145/266420.266432](https://doi.org/10.1145/266420.266432)); Pierce, B.C., Turner, D.N.: „Pict: A programming language based on the pi-calculus" (Proof, Language, and Interaction 2000) — Pict implementace.*
