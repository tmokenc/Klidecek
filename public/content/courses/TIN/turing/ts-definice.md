---
title: Turingův stroj — definice a výpočet
---

# Turingův stroj

Turingův stroj (TS) je nejjednodušší výpočetní model, který *má sílu obecného počítače*. Zavedl ho Alan Turing v roce 1936 jako matematický model "stroje, který může cokoli, co umí lidský počtář". Podle **Church-Turingovy teze** ([[univerzalni-ts]]) je TS *kanonickou definicí* pojmu "algoritmicky vyčíslitelný". Proto je TS středem teorie *vyčíslitelnosti* a *složitosti*.

## Architektura

::: svg "Schéma Turingova stroje — neomezená páska, čtecí/zápisová hlava, stavové řízení"
<svg viewBox="0 0 540 230" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aTS1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="180" y="20" text-anchor="middle" fill="var(--text-muted)">neomezená páska (jednostranně nekonečná)</text>
  <g fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1">
    <rect x="20" y="35" width="380" height="34"/>
    <line x1="60" y1="35" x2="60" y2="69"/>
    <line x1="100" y1="35" x2="100" y2="69"/>
    <line x1="140" y1="35" x2="140" y2="69"/>
    <line x1="180" y1="35" x2="180" y2="69"/>
    <line x1="220" y1="35" x2="220" y2="69"/>
    <line x1="260" y1="35" x2="260" y2="69"/>
    <line x1="300" y1="35" x2="300" y2="69"/>
    <line x1="340" y1="35" x2="340" y2="69"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="40" y="57">∆</text>
    <text x="80" y="57">x</text>
    <text x="120" y="57">y</text>
    <text x="160" y="57">a</text>
    <text x="200" y="57">b</text>
    <text x="240" y="57">∆</text>
    <text x="280" y="57">∆</text>
    <text x="320" y="57">∆</text>
    <text x="370" y="57">…</text>
  </g>
  <polygon points="155,80 175,80 165,95" fill="var(--accent)"/>
  <text x="165" y="110" text-anchor="middle" fill="var(--accent)" font-size="10">hlava</text>
  <g stroke="var(--accent)" stroke-width="1.4" fill="var(--bg-card)">
    <rect x="180" y="140" width="180" height="60" rx="8"/>
  </g>
  <text x="270" y="165" text-anchor="middle" fill="var(--accent)">stavové řízení</text>
  <text x="270" y="183" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">q ∈ Q,  δ(q, a) = (q', y/L/R)</text>
  <g stroke="var(--accent-line)" stroke-width="1.2" fill="none" marker-end="url(#aTS1)">
    <line x1="165" y1="95" x2="200" y2="140"/>
    <line x1="240" y1="140" x2="220" y2="95"/>
  </g>
  <text x="180" y="120" fill="var(--text-muted)" font-size="9.5">čte symbol</text>
  <text x="250" y="120" fill="var(--text-muted)" font-size="9.5">píše / posune</text>
</svg>
:::

## Formální definice

**Definice.** *Turingův stroj* je šestice

$$
M = (Q, \Sigma, \Gamma, \delta, q_0, q_F),
$$

kde:

1. $Q$ je konečná **množina vnitřních (řídicích) stavů**,
2. $\Sigma$ je konečná **vstupní abeceda**, $\Delta \notin \Sigma$,
3. $\Gamma$ je konečná **pásková abeceda**, $\Sigma \subset \Gamma$, $\Delta \in \Gamma$,
4. $\delta : (Q \setminus \{q_F\}) \times \Gamma \to Q \times (\Gamma \cup \{L, R\})$ je *parciální* **přechodová funkce**, kde $L, R \notin \Gamma$,
5. $q_0 \in Q$ je **počáteční stav**,
6. $q_F \in Q$ je **koncový (přijímající) stav**.

**Speciální symbol $\Delta$** ("blank") označuje *prázdné* políčko pásky. Páska je *teoreticky neomezená* — všechny "nevyplněné" buňky obsahují $\Delta$. V praxi pracujeme s konečným prefixem (užitečnou částí pásky).

> **Pozn.** Existují různé varianty: páska *jednostranně* nekonečná vs. *oboustranně* nekonečná, *množina* koncových stavů místo jednoho, *dvojice* $q_\text{accept}, q_\text{reject}$ pro explicitní akceptaci/zamítnutí, fixní *symbol konce pásky* zabraňující posunu doleva, sjednocení zápisu a posuvu do jediné operace. Všechny tyto varianty jsou navzájem *převoditelné* a generují stejnou třídu jazyků.

## Konfigurace TS

**Konfigurace** TS je trojice

$$
C = (q, \gamma, n) \in Q \times \Gamma^\omega \times \mathbb{N},
$$

kde:

* $q$ je *aktuální stav řízení*,
* $\gamma \in \Gamma^\omega$ je *obsah pásky* (nekonečná posloupnost, prakticky konečně nenulový prefix se zbytkem $\Delta$),
* $n$ je *pozice hlavy* (číslováno od 0 zleva).

V notaci se obsah pásky obvykle zapisuje konečným prefixem (např. $\Delta xyz\Delta\Delta\dots$ nebo prostě $\Delta xyz$), s *podtržením* nebo *speciálním označením* symbolu pod hlavou.

## Krok výpočtu

Označme $\gamma_n$ symbol na pozici $n$ a $s^b_n(\gamma)$ řetězec vzniklý záměnou $\gamma_n$ za $b$. Pak **krok výpočtu** $(q_1, \gamma, n) \vdash_M (q_2, \gamma', n')$ je definován pro $\delta(q_1, \gamma_n) = (q_2, X)$:

* $X = R$ (posun doprava): $\gamma' = \gamma$, $n' = n + 1$.
* $X = L$ (posun doleva): $\gamma' = \gamma$, $n' = n - 1$, podmínkou $n > 0$.
* $X = b \in \Gamma$ (zápis): $\gamma' = s^b_n(\gamma)$, $n' = n$.

Jediný krok TS tedy *buď* pohne hlavou *nebo* zapíše symbol — ne obojí v jednom kroku. (Některé varianty obojí dovolují; síla je stejná.)

## Výpočet

**Výpočet** TS $M$ začínající z konfigurace $K_0$ je posloupnost konfigurací $K_0, K_1, K_2, \dots$ taková, že $K_i \vdash_M K_{i+1}$. Posloupnost je buď:

* **nekonečná**, nebo
* **konečná** s koncovou konfigurací $(q, \gamma, n)$, kde:

  | Typ zastavení | Podmínka |
  | :--- | :--- |
  | **Normální** | $q = q_F$ — TS přejde do koncového stavu |
  | **Abnormální (a)** | $q \neq q_F$ a $\delta(q, \gamma_n)$ není definována |
  | **Abnormální (b)** | $n = 0$ a $\delta(q, \gamma_n) = (q', L)$ — pokus o posun doleva přes okraj pásky |

> Normální zastavení odpovídá *přijetí* vstupu; abnormální *zamítnutí*.

## Grafická reprezentace

Stejně jako u KA a PDA lze přechodovou funkci kreslit *přechodovým diagramem*. Hrany jsou ohodnoceny `x/op`, kde `x` je čtený symbol a `op` je operace (zápis nového symbolu, $L$, nebo $R$).

::: svg "TS, který posouvá hlavu doprava na první ∆"
<svg viewBox="0 0 540 130" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aTS2" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="180" cy="70" r="22"/>
    <circle cx="380" cy="70" r="22"/>
    <circle cx="380" cy="70" r="17" fill="none"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle">
    <text x="180" y="74">p</text>
    <text x="380" y="74">q_F</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aTS2)">
    <path d="M202,70 L356,70"/>
    <path d="M165,50 Q140,30 180,30 Q205,30 195,50"/>
    <path d="M195,50 Q220,30 180,30 Q150,30 180,52"/>
    <path d="M105,70 L158,70"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="280" y="63" text-anchor="middle">∆ / ∆</text>
    <text x="180" y="20" text-anchor="middle">a/R</text>
    <text x="180" y="40" text-anchor="middle">b/R</text>
    <text x="100" y="73">start</text>
  </g>
</svg>
:::

Diagram čteme jako: v stavu $p$ při čtení $a$ posuneme hlavu doprava a zůstaneme v $p$; při čtení $b$ taky; při čtení $\Delta$ přejdeme do $q_F$ (a *opětovně zapíšeme* $\Delta$ — neměnný symbol).

::: viz tm-simulator "Krokuj přes tři přednastavené TS: binární inkrement, akceptor a^n b^n a akceptor a^n b^n c^n. Vidíš pásku, hlavu, aktuální stav a které pravidlo δ se právě aplikuje."
:::

## TS jako akceptor jazyka

**Definice.** TS *přijímá* řetězec $w \in \Sigma^*$, pokud z počáteční konfigurace $(q_0, \Delta w \Delta^\omega, 0)$ dospěje *přechodem* do koncového stavu $q_F$:

::: math
(q_0, \Delta w \Delta^\omega, 0) \vdash^*_M (q_F, \gamma, n) \quad \text{pro nějaké } \gamma, n.
:::

**Jazyk přijímaný TS**:

::: math
L(M) = \{w \in \Sigma^* \mid M \text{ přijímá } w\}.
:::

> **Pozn.** Trvalé chování TS na řetězci $w$ je trojí: (1) přijme, (2) abnormálně zastaví bez přijetí, nebo (3) cyklí donekonečna. Žádný "Halt-with-No" stav nemá. To má fundamentální důsledky pro [[problem-zastaveni]].

## Příklad: TS pro $L = \{a^n b^n c^n \mid n \geq 1\}$

Tento jazyk **není bezkontextový** ([[vlastnosti-bkj]]), takže ho nedokáže přijmout žádný PDA. Pro TS je to ale snadné:

**Idea.** Stroj iterativně:
1. Najde nejlevější $a$, *přepíše* ho na $X$ (značku "zpracováno").
2. Posune se doprava na nejlevější $b$, přepíše na $Y$.
3. Posune se doprava na nejlevější $c$, přepíše na $Z$.
4. Vrátí se zleva a opakuje.
5. Když nezbývá žádné $a$ ani $b$ ani $c$ (jen $X$, $Y$, $Z$ a $\Delta$), přijme.

Po $n$ iteracích je páska $\Delta X^n Y^n Z^n \Delta\dots$. Pokud počty nesouhlasí (např. víc $b$ než $a$), TS abnormálně zastaví.

Tato úloha je *typickým testem*, kterým se TS odlišují od zásobníkových automatů — dokázání tří souběžných počtů přirozeně vyžaduje opakovaný průchod páskou.

## TS jako "počítač funkce"

TS lze taky chápat jako *stroj počítající funkci* $f : \Sigma^*_m \to \Sigma^*_n$ (z $m$-tic vstupů na $n$-tice výstupů):

* Počáteční konfigurace: $\Delta w_1 \Delta w_2 \Delta \dots \Delta w_m \Delta^\omega$.
* TS zastaví v $q_F$ s páskou $\Delta v_1 \Delta v_2 \Delta \dots \Delta v_n \Delta\Delta\Delta$.
* Tehdy říkáme, že $f(w_1, \dots, w_m) = (v_1, \dots, v_n)$.

Pokud $f$ není definovaná pro daný vstup, TS buď cyklí, nebo abnormálně zastaví. **Turingovsky vyčíslitelné funkce** jsou *přesně* funkce, které tímto způsobem nějaký TS realizuje.

**Spojitost** s rozhodováním: rozhodovací problém je speciální případ s $n = 1$ a $f$ s oborem hodnot $\{\text{true}, \text{false}\}$ (např. zakódováno jako $\{Y, N\}$ nebo $\{1, 0\}$ na pásce).

## Specializované konstrukce

Pro pohodlí (a často pro lepší časovou složitost) se používají *modifikace* základního TS:

* **Více pásek** ($k$-páskový TS) — $k$ nezávislých pásek s vlastními hlavami. Síla *stejná*, ale složitost se může lišit (kvadraticky horší pro 1-páskovou simulaci, viz [[ts-modifikace]]).
* **Nedeterministický TS** (NTS) — funkce $\delta$ vrací *množinu* možných pokračování. Síla *stejná*, ale exponenciální časový rozdíl.
* **Vícestopý TS** — pásek "vrstvíme" — každá buňka pásky je $k$-tice symbolů. Triviálně ekvivalentní (rozšířená pásková abeceda).
* **Univerzální TS** — TS, který *simuluje* libovolný jiný TS popsaný na vstupu ([[univerzalni-ts]]).

Všechny tyto modifikace probereme v [[ts-modifikace]] a důkazy jejich ekvivalence v [[rekurzivni-jazyky]].

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Turing, A.M.: *On Computable Numbers, With an Application to the Entscheidungsproblem* (Proc. London Math. Soc., 1936); Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), §8.1–8.2; Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), §3.1.*
