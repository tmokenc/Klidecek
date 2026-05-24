---
title: Částečná pozorovatelnost a belief states
---

# Částečná pozorovatelnost a belief states

V *plně pozorovatelném* prostředí agent zná přesný stav (vidí celou šachovnici, ví, kde je). V **částečně pozorovatelném** prostředí má jen *omezenou informaci* — některé aspekty stavu zůstávají skryté.

## Belief state

**Belief state** (přesvědčení o stavu) = množina *všech možných stavů*, ve kterých se agent může nacházet vzhledem k *aktuální* informaci.

Pokud `S` = množina všech stavů a `B ⊆ S` je belief state, pak agent ví: *„jsem v nějakém stavu z B"*, ale neví v *kterém přesně*.

### Aktualizace belief state

Po provedení akce `a` a obdržení vjemu `o`:

1. **Predikce** — bez vjemu by belief state přešel na `predict(B, a) = {RESULT(s, a) : s ∈ B}`.
2. **Update** — vjem `o` *zúží* belief state na ty stavy, které jsou *kompatibilní* s `o`:

::: math
B_{\text{nový}} = \{ s' \in \text{predict}(B, a) : \text{percept}(s') = o \}
:::

(Pro stochastické prostředí je `B` distribuce, ne jen množina, a aktualizace probíhá pomocí **Bayesova pravidla**, viz [[pravdepodobnost-bayes]].)

::: svg "Aktualizace belief state: predikce po akci + filtrace podle vjemu."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="30" y="40" width="120" height="100" rx="8"/>
    <rect x="210" y="40" width="120" height="100" rx="8"/>
    <rect x="390" y="40" width="120" height="100" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="90" y="62" font-weight="600">B_t</text>
    <text x="90" y="84">{s₁, s₃, s₅}</text>
    <text x="90" y="105" fill="var(--text-muted)" font-size="9">3 možnosti</text>
    <text x="270" y="62" font-weight="600">predict(B_t, a)</text>
    <text x="270" y="84">{s₂, s₄, s₅, s₆}</text>
    <text x="270" y="105" fill="var(--text-muted)" font-size="9">po akci, bez vjemu</text>
    <text x="450" y="62" font-weight="600">B_{t+1}</text>
    <text x="450" y="84">{s₂, s₅}</text>
    <text x="450" y="105" fill="var(--text-muted)" font-size="9">po vjemu</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.6" fill="none">
    <path d="M 150 80 L 210 80" marker-end="url(#a1)"/>
    <path d="M 330 80 L 390 80" marker-end="url(#a2)"/>
  </g>
  <defs>
    <marker id="a1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
    <marker id="a2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="180" y="76">akce a</text>
    <text x="360" y="76">vjem o</text>
  </g>
</svg>
:::

::: viz belief-state-vacuum "4-cell vacuum world; aplikujte akce/vjemy → belief set se aktualizuje (predict + filter)."
:::

## Velikost belief state space

Klíčový problém: **kombinatorická exploze**.

Pro `N` možných stavů světa je *belief state* podmnožinou — máme `2^N` možných belief states. Pro `N = 10` to je `1024`; pro `N = 20` to je *milion*; pro `N = 50` *biliarda*.

V praxi je velká část belief stavů **nedosažitelná** — některá belief stavy nemohou vzniknout z reálné iniciální belief po žádné sekvenci akcí + vjemů. Dosažitelný belief space bývá *exponenciálně menší*.

### Reprezentace belief state

Pro malé prostory: **enumerace** stavů v `B`.

Pro velké prostory: 

* **Pravděpodobnostní distribuce** — místo množiny `B` máme `p(s) ∈ [0,1]` pro každý stav. Stav neviditelnosti = `p(s) = 0`.
* **Faktorizovaná** belief state — distribuce reprezentovaná jako součin (Bayesovská síť).
* **Particle filter** — vzorky ze skutečné distribuce, často používané v robotice (lokalizace).
* **Gaussovský belief** — distribuce aproximovaná Gaussem (např. Kalman filter pro pohyb).

## Senseless agent — bez senzorů

Extrémní případ: **žádné** senzory. Agent ví jen *prior* iniciální belief a *všechny své akce* dosud.

Příklady racionality bez senzorů:

* **Antibiotika širokospektrá** — bez krve testu pokrývají několik bakteriálních „pravděpodobných stavů" světa.
* **Krevní skupina 0 (rh-)** — *univerzální dárce*, lze podat *jakémukoli* pacientovi → racionalita pro neznámou krevní skupinu.

Plán pro senseless agenta = **lineární sekvence** akcí — nemůžeme se rozhodovat podle vjemů, protože žádné nemáme. Hledáme sekvenci, která dovede *všechny* iniciální stavy do *cílového stavu*.

### Incremental belief-state search

Místo expanze celého belief state hledáme řešení pro každý individuální stav, postupně přidáváme:

* Najdi plán pro `s₁`. Pak ověř, že funguje i pro `s₂`. Pokud ne, prodluž / modifikuj.
* Pokud žádný plán neexistuje, *zjistíme rychle* (na rozdíl od naivního prohledávání všech belief stavů).

## Lokální senzor — kompromis

**Lokální senzor** vidí jen *bezprostřední okolí*. Často reálná situace:

* Vysavač detekuje čistotu *jen aktuálního* políčka.
* Robot vidí překážky *jen v nejbližších* metrech.

Belief state po `Suck`:

* Bez čistého-senzoru: `{(A, čisté, B čisté), (A, čisté, B špinavé)}` — 2 možnosti.
* Po vjemu *„A je čisté, B nevím"*: dvě možnosti zůstávají.
* Po akci `Right`: belief se posune (predikce + filtrace nového vjemu na B).

Plán s lokálním senzorem využívá *if-then-else* podle aktuálního vjemu.

## Lokalizace robota

Klasická úloha *robotické lokalizace*: robot zná **mapu** prostředí, ale neví, *kde* na ní je. Senzory: vidí překážky v 4 (resp. 8) směrech, naměří `True/False`.

::: svg "Robotická lokalizace: po několika krocích belief state postupně konverguje k jedinému stavu."
<svg viewBox="0 0 540 230" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--text)" text-anchor="middle" font-size="11.5" font-weight="600">
    <text x="100" y="22">t = 0 (bez vjemu)</text>
    <text x="270" y="22">t = 1 (NWS)</text>
    <text x="440" y="22">t = 2 (po posunu vpravo)</text>
  </g>
  <g fill="var(--bg-card)" stroke="var(--line)" stroke-width="0.6">
    <g transform="translate(40,40)">
      <rect width="120" height="120" fill="none" stroke="var(--accent)"/>
      <rect x="0" y="0" width="30" height="30" fill="var(--accent)" opacity="0.35"/>
      <rect x="60" y="0" width="30" height="30" fill="var(--accent)" opacity="0.35"/>
      <rect x="0" y="60" width="30" height="30" fill="var(--accent)" opacity="0.35"/>
      <rect x="30" y="30" width="30" height="30" fill="var(--accent)" opacity="0.35"/>
      <rect x="60" y="60" width="30" height="30" fill="var(--accent)" opacity="0.35"/>
      <rect x="90" y="60" width="30" height="30" fill="var(--accent)" opacity="0.35"/>
      <rect x="0" y="90" width="30" height="30" fill="var(--accent)" opacity="0.35"/>
      <rect x="60" y="90" width="30" height="30" fill="var(--accent)" opacity="0.35"/>
    </g>
    <g transform="translate(210,40)">
      <rect width="120" height="120" fill="none" stroke="var(--accent)"/>
      <rect x="0" y="60" width="30" height="30" fill="var(--accent)" opacity="0.6"/>
      <rect x="0" y="0" width="30" height="30" fill="var(--accent)" opacity="0.6"/>
    </g>
    <g transform="translate(380,40)">
      <rect width="120" height="120" fill="none" stroke="var(--accent)"/>
      <rect x="30" y="0" width="30" height="30" fill="var(--accent)" opacity="0.85"/>
    </g>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="100" y="180">každé „svobodné" pole možné</text>
    <text x="270" y="180">2 pole splňují NWS vjem</text>
    <text x="440" y="180">jediná konzistentní pozice</text>
    <text x="270" y="220">Akcionalita: NWS = překážka N, W, S, ale ne E.</text>
  </g>
</svg>
:::

Belief state se *postupně* zužuje s každým vjemem a akcí. Pro „dobře navrženou" mapu konverguje k jedinému stavu (lokalizace úspěšná).

V *robotice* používáme **Monte Carlo localization** (particle filter) nebo **AMCL** (Adaptive MCL) — odhad belief state pomocí vzorků.

## POMDP — formální rámec

**Partially Observable Markov Decision Process** je standardní formalismus:

* Stavy `S`, akce `A`, přechody `P(s' | s, a)` (stochastické).
* **Pozorování** `O`, model `P(o | s)`.
* Odměna `R(s, a)`.

Belief state je distribuce `b ∈ ∆(S)` (simplex pravděpodobností nad `S`). Policy je `π: ∆(S) → A`.

Řešení POMDP je obecně *PSPACE-hard*. V praxi:

* **Point-based value iteration (PBVI)** — aproximace.
* **POMCP** (Partially Observable Monte Carlo Planning) — MCTS nad POMDP.
* **Deep RL pro POMDP** — RNN jako paměť, viz [[rl-framework]].

## Klíčový dopad pro AI

* **Inteligentní agent v reálném světě** *musí* udržovat nějakou formu belief state — žádná čidla nevidí svět *plně*.
* **Plánování s nejistotou** je *exponenciálně dražší* než s jistotou.
* **Senzorické fúze** — kombinace více vjemů zužuje belief efektivněji.
* **Aktivní vnímání** — agent může *záměrně* hledat informaci (rozhlížet se, ptát se), aby zúžil belief.

::: link "AIMA, kap. 4.4: Search in Partially Observable Environments" "http://aima.cs.berkeley.edu/"
:::

::: link "Thrun, Burgard, Fox: Probabilistic Robotics (MIT Press, 2005) — bible robotické lokalizace" "https://mitpress.mit.edu/9780262201629/probabilistic-robotics/"
:::

::: link "Kaelbling, Littman, Cassandra: Planning and Acting in Partially Observable Stochastic Domains (AI Journal, 1998)" "https://www.cs.cmu.edu/~mmv/planning/readings/POMDPs.pdf"
:::

---

*Zdroj: SUI přednášky 2025/26, *Prohledávání v nejistých prostředích* (Šůstek). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 4.4 + 14 (POMDP); Thrun, S., Burgard, W., Fox, D.: *Probabilistic Robotics* (MIT 2005); Kaelbling, L., Littman, M., Cassandra, A.: *Planning and Acting in Partially Observable Stochastic Domains* (AI Journal 101, 1998).*
