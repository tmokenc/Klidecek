---
title: MDP — definice a nedeterminismus
---

# MDP — definice a nedeterminismus

**Markovský rozhodovací proces** (MDP, *Markov Decision Process*) rozšiřuje DTMC o **nedeterministickou volbu**: v každém stavu agent vybere *akci*, která určuje pravděpodobnostní rozdělení nad následujícím stavem. MDP je centrální model pro plánování v nejistotě, řízení robotů, posilované učení (RL) a stochastický model checking — všude tam, kde se mísí *náhoda prostředí* a *rozhodování agenta*.

## Motivace — proč nedeterminismus

DTMC modeluje *pasivní* pravděpodobnostní vývoj. Spousta systémů ale obsahuje *aktivní* volbu, kterou nelze (nebo nechceme) modelovat pravděpodobnostně:

* **Konkurentní procesy** — plánovač operačního systému střídá vlákna; pořadí je *nedeterministické*, ne náhodné.
* **Neznámé parametry** — robot nezná přesný koeficient tření; prostředí nehází kostkou, jen nám parametr chybí.
* **Adverzářské prostředí** — bezpečnostní analýza předpokládá *nejhorší případ*, ne typický.
* **Řiditelné systémy** — design „chytrých" algoritmů: chceme zvolit akci, která maximalizuje úspěch.

Když oddělíme náhodu (prostředí) a volbu (agent), získáme expresivnější model — MDP.

## Formální definice

**MDP** je n-tice `M = (S, s₀, Act, P)`, kde:

* `S` je konečná množina stavů,
* `s₀ ∈ S` je počáteční stav,
* `Act` je konečná množina akcí; `Act(s) ⊆ Act` je množina akcí dostupných ve stavu `s` (předpokládáme `Act(s) ≠ ∅` — žádné deadlocky),
* `P : S × Act × S → [0, 1]` je pravděpodobnostní matice přechodu, pro každé `s ∈ S, α ∈ Act(s)` platí `Σ_{s' ∈ S} P(s, α, s') = 1`, a `P(s, α, ·) = 0` pro `α ∉ Act(s)`.

::: svg "MDP: v každém stavu si agent vybere akci; akce indukuje pravděpodobnostní rozdělení nad následujícími stavy."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <circle cx="80" cy="110" r="26" fill="var(--bg-inset)" stroke="var(--accent)" stroke-width="2"/>
    <text x="80" y="114" text-anchor="middle" fill="var(--text)">s</text>

    <circle cx="200" cy="60" r="8" fill="var(--accent-line)" stroke="var(--text)"/>
    <text x="200" y="42" text-anchor="middle" fill="var(--text-muted)" font-size="10">action α</text>
    <circle cx="200" cy="160" r="8" fill="var(--accent-line)" stroke="var(--text)"/>
    <text x="200" y="182" text-anchor="middle" fill="var(--text-muted)" font-size="10">action β</text>

    <path d="M 100 100 L 188 65" stroke="var(--line-strong)" fill="none"/>
    <path d="M 100 120 L 188 156" stroke="var(--line-strong)" fill="none"/>

    <path d="M 208 58 L 350 30" stroke="var(--text-muted)" fill="none" marker-end="url(#arrM)"/>
    <text x="270" y="35" text-anchor="middle" fill="var(--text-muted)">0.8</text>
    <path d="M 208 62 L 350 90" stroke="var(--text-muted)" fill="none" marker-end="url(#arrM)"/>
    <text x="280" y="83" text-anchor="middle" fill="var(--text-muted)">0.2</text>

    <path d="M 208 158 L 350 130" stroke="var(--text-muted)" fill="none" marker-end="url(#arrM)"/>
    <text x="280" y="138" text-anchor="middle" fill="var(--text-muted)">0.5</text>
    <path d="M 208 162 L 350 190" stroke="var(--text-muted)" fill="none" marker-end="url(#arrM)"/>
    <text x="270" y="183" text-anchor="middle" fill="var(--text-muted)">0.5</text>

    <circle cx="380" cy="30" r="22" fill="var(--bg-inset)" stroke="var(--text)"/>
    <text x="380" y="34" text-anchor="middle" fill="var(--text)">s₁</text>
    <circle cx="380" cy="95" r="22" fill="var(--bg-inset)" stroke="var(--text)"/>
    <text x="380" y="99" text-anchor="middle" fill="var(--text)">s₂</text>
    <circle cx="380" cy="135" r="22" fill="var(--bg-inset)" stroke="var(--text)"/>
    <text x="380" y="139" text-anchor="middle" fill="var(--text)">s₃</text>
    <circle cx="380" cy="195" r="22" fill="var(--bg-inset)" stroke="var(--text)"/>
    <text x="380" y="199" text-anchor="middle" fill="var(--text)">s₄</text>
  </g>
  <defs><marker id="arrM" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--text-muted)"/></marker></defs>
</svg>
:::

V každém stavu agent:

1. **Nedeterministicky** vybere akci `α ∈ Act(s)`.
2. **Pravděpodobnostně** přejde do `s'` podle rozdělení `P(s, α, ·)`.

## Cesty v MDP

**Konečná cesta** v MDP je posloupnost `π = s₀ α₀ s₁ α₁ s₂ … sₙ`, kde `αᵢ ∈ Act(sᵢ)` a `P(sᵢ, αᵢ, sᵢ₊₁) > 0`. Cesta tedy *vyřeší obě volby* — nedeterministickou (která akce) i pravděpodobnostní (do kterého stavu).

Označme `last(π) = sₙ` poslední stav cesty a `Paths_M` množinu všech konečných cest v `M`.

## Plánovač (scheduler / policy)

Aby MDP definoval pravděpodobnostní chování, musíme nějak *vyřešit nedeterminismus* — toho dělá **plánovač** (synonyma: *scheduler, policy, strategy, controller, adversary*).

**Plánovač** `σ : Paths_M → Distr(Act)` přiřazuje každé konečné cestě `π` pravděpodobnostní rozdělení nad akcemi, `supp(σ(π)) ⊆ Act(last(π))`.

Typy plánovačů (od obecnějšího ke specifičtějšímu):

* **Náhodný (randomised)** — `σ(π) ∈ Distr(Act)`, libovolné rozdělení.
* **Deterministický** — `σ : Paths_M → Act`, jediná akce, ne distribuce.
* **Bezpaměťový (memoryless / Markovský)** — `σ : S → Distr(Act)` (resp. `σ : S → Act`). Závisí jen na *aktuálním* stavu, ne na historii.
* **S konečnou pamětí** — `σ` lze realizovat konečným automatem na cestách.

::: svg "Hierarchie plánovačů — bezpaměťový deterministický je nejjednodušší, randomizovaný s pamětí nejobecnější."
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="10.5">
  <g>
    <rect x="20" y="20" width="500" height="120" rx="6" fill="none" stroke="var(--line)"/>
    <text x="270" y="14" text-anchor="middle" fill="var(--text-muted)">randomized + history-dependent</text>
    <rect x="50" y="40" width="440" height="90" rx="6" fill="none" stroke="var(--line)"/>
    <text x="270" y="55" text-anchor="middle" fill="var(--text-muted)">deterministic + history-dependent</text>
    <rect x="80" y="65" width="380" height="55" rx="6" fill="none" stroke="var(--accent-line)"/>
    <text x="270" y="80" text-anchor="middle" fill="var(--accent-line)">randomized + memoryless</text>
    <rect x="110" y="88" width="320" height="25" rx="6" fill="var(--bg-inset)" stroke="var(--accent)" stroke-width="2"/>
    <text x="270" y="105" text-anchor="middle" fill="var(--accent)">deterministic + memoryless</text>
  </g>
</svg>
:::

## Indukovaný DTMC

Fix plánovač `σ`. Pak MDP `M` spolu s `σ` indukuje **DTMC** `M^σ` — nedeterminismus zmizel, zůstala čistá pravděpodobnost. Stavový prostor `M^σ` je obecně `Paths_M` (pro history-dependent plánovač) nebo `S` (pro bezpaměťový).

> **Klíčová věta:** Pro *bezpaměťový* plánovač `σ` má indukovaný řetězec `M^σ` stavový prostor `|S|` a chová se jako standardní DTMC.

To umožňuje aplikovat všechny techniky z [[dtmc-definice]] — tranzientní, reachability, steady-state — *na indukovaný DTMC*.

## Optimální plánovač

V analýze MDP nás obvykle nezajímá *jeden konkrétní* plánovač, ale **optimální** plánovač pro nějaké kritérium:

* **Reachability** — max/min `P^σ(s → T)` přes všechny plánovače `σ`.
* **Očekávaná odměna** — max `E^σ[Σ γᵗ r(sₜ, aₜ)]` pro daný diskontní faktor `γ ∈ [0, 1)` a funkci odměn `r`.
* **Bezpečnost vs. adversary** — `min_σ_adv max_σ_player` (game-theoretic).

Pro reachability platí: optimum existuje *uvnitř* deterministických bezpaměťových plánovačů — tedy stačí prohledávat `|Act|^|S|` možností. Toto je základ [[value-iteration|value iteration]] a *policy iteration*.

## MDP vs. DTMC vs. CTMDP

| Model | Čas | Volba |
| :--- | :--- | :--- |
| DTMC | diskrétní | pouze pravděpodobnost |
| MDP | diskrétní | nedeterminismus + pravděpodobnost |
| CTMC | spojitý | pouze pravděpodobnost (exponenciální rates) |
| CTMDP | spojitý | nedeterminismus + pravděpodobnost |
| POMDP | diskrétní | + částečná observovatelnost |

## Aplikace

* **Robotika a plánování trajektorie** — Grid world, autonomní vozidla. Akce „jdi vlevo" má 80 % pravděpodobnost úspěchu, 20 % uklouznutí.
* **Bezpečnostní protokoly** — adversary je modelován nedeterminismem; chceme `min_σ_adv P(security_broken)`.
* **Reinforcement learning** — agent učící se *optimální* plánovač z interakce s prostředím (Q-learning, SARSA, PPO — viz [[../SUI/rl/rl-framework]]).
* **Operační výzkum** — rozhodování v nejistotě (inventory management, optimal stopping).
* **Verifikace** — PRISM, Storm — model checking pravděpodobnostních protokolů ([[prism-model-checking]]).

::: viz mdp-gridworld-policy "Gridworld s cílem (+1) a pitem (−1); spusťte VI a sledujte živý update V(s) a optimální politiku (šipky)."
:::

::: link "Puterman, M. L.: Markov Decision Processes (Wiley 1994/2014)" "https://onlinelibrary.wiley.com/doi/book/10.1002/9780470316887"
:::

::: link "Sutton, R. S., Barto, A. G.: Reinforcement Learning: An Introduction (2nd ed., MIT Press 2018)" "http://incompleteideas.net/book/the-book-2nd.html"
:::

---

*Zdroj: MSP přednášky 2025/26, *Lecture 2: Markov Decision Processes* (Češka). Externí reference: Baier, C., Katoen, J.-P.: *Principles of Model Checking* (MIT Press 2008), kap. 10.6; Puterman, M. L.: *Markov Decision Processes* (Wiley 1994), kap. 1–4; Sutton, R., Barto, A.: *Reinforcement Learning* (MIT Press 2018), kap. 3.*
