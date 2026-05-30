---
title: Posilované učení — rámec a MDP
---

# Posilované učení — rámec

**Reinforcement Learning (RL)** je formálním rámcem pro **rozhodování v sekvenčním prostředí s odměnou**. Agent jedná, prostředí mu vrací nové stavy a *skalární odměnu*. Cíl: maximalizovat *kumulativní* odměnu v čase.

## Agent — prostředí

::: svg "RL loop: agent vykoná akci, prostředí vrátí pozorování a odměnu."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <rect x="40" y="50" width="180" height="100" rx="10"/>
    <rect x="320" y="50" width="180" height="100" rx="10"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="13" font-weight="600">
    <text x="130" y="84">Agent</text>
    <text x="410" y="84">Prostředí</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="130" y="104">policy π(a | s)</text>
    <text x="130" y="124">value V(s) / Q(s,a)</text>
    <text x="410" y="104">stavy S</text>
    <text x="410" y="124">přechody P(s'|s,a)</text>
    <text x="410" y="144">reward R(s,a,s')</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.6" fill="none">
    <path d="M 220 80 L 320 80" marker-end="url(#rlArr1)"/>
    <path d="M 320 120 L 220 120" marker-end="url(#rlArr1)"/>
  </g>
  <defs>
    <marker id="rlArr1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="270" y="74">akce a_t</text>
    <text x="270" y="134">s_{t+1}, r_{t+1}</text>
  </g>
</svg>
:::

V každém čase `t`:

1. Agent pozoruje stav `s_t`.
2. Agent vybere akci `a_t` podle své **policy** `π(a | s)`.
3. Prostředí *přejde* do nového stavu `s_{t+1}` a vydá odměnu `r_{t+1}`.
4. Agent aktualizuje policy (případně modely).

## Klíčové komponenty

### Agent

* **Policy** `π: S → A` — pravidlo jak vybrat akci. Může být:
  - **Deterministická** — `a = π(s)`.
  - **Stochastická** — `π(a | s)` = distribuce nad akcemi.
* **Value function** `V(s)` — *očekávaná* kumulativní odměna ze stavu `s`.
* **Q-function** `Q(s, a)` — *očekávaná* kumulativní odměna po akci `a` ze stavu `s`.

### Prostředí

* **Stavový prostor** `S`.
* **Akční prostor** `A`.
* **Přechodový model** `P(s' | s, a)` — pravděpodobnost přechodu.
* **Reward function** `R(s, a, s')` — odměna za přechod.

## Cíl RL

Agent chce maximalizovat **kumulativní odměnu**:

::: math
G_t = r_{t+1} + \gamma r_{t+2} + \gamma^2 r_{t+3} + \dots = \sum_{k=0}^{\infty} \gamma^k r_{t+k+1}
:::

* `γ ∈ [0, 1)` — **diskontní faktor**. Hodnoty *blíže k 0* preferují *bezprostřední* odměny; *blíže k 1* preferují *dlouhodobé*.
* Diskontování garantuje konečnost součtu i pro nekonečné horizont.

### Co je „cíl" RL

* **Najít optimální policy** `π*` maximalizující očekávané `G_0`.
* **Najít optimální `V(s)` nebo `Q(s, a)`** — pak `π* = argmax_a Q*(s, a)`.

## Markov Decision Process (MDP)

Standardní *matematický rámec* pro RL:

* Stavy `S`, akce `A`, přechody `P(s' | s, a)`, odměny `R(s, a, s')`.
* **Markovova vlastnost**: `P(s_{t+1} | s_t, a_t)` *nezávisí* na minulosti — *stačí* aktuální stav.

::: math
P(s_{t+1} \mid s_t, a_t, s_{t-1}, a_{t-1}, \dots) = P(s_{t+1} \mid s_t, a_t)
:::

Toto je klíčový předpoklad — drasticky zjednodušuje rozhodování. Pokud platí, agent *nepotřebuje pamět* — stačí *aktuální* stav.

### Důsledky pro design state

Pokud reálné prostředí *není* markovské, musíme to *zkompenzovat* designem stavu:

* **Šachy** — markovský stav = pozice figur na šachovnici + kdo je na tahu + práva na rošádu + možnost braní mimochodem (en passant) + počítadlo tahů (pravidlo 50 tahů / opakování pozice).
* **Atari** — *jeden* frame *není* markovský (rychlost objektů nezjistím). 4 po sobě jdoucí frames *jsou* markovské.

## Partial observability (POMDP)

Reálné prostředí často není plně pozorovatelné — agent vidí jen *pozorování* `o_t`, ne plný stav `s_t`. Vzniká **POMDP** (Partially Observable MDP).

* Pozorovací model `P(o | s)`.
* Agent musí udržovat *belief state* `b_t = P(s | history)`. Viz [[castecna-pozorovatelnost]].

Řešení:

* **Memory v agentovi** — RNN/LSTM/Transformer jako policy. Implicitně udržuje historii.
* **Frame stacking** — pro Atari spojíme 4 framy → markovský state.

## Trajectory

**Trajectory** (rollout) = sekvence `s_0, a_0, r_1, s_1, a_1, r_2, ...` z reálné nebo simulované interakce.

* **Episodický** — trajektorie končí v *terminálním* stavu (hra skončí, robot spadne).
* **Kontinuální** — bez konce.

## Typy RL algoritmů

::: svg "Tři rodiny RL algoritmů: hodnotí value/Q, optimalizují policy, nebo modelují prostředí."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="160" height="120" rx="8"/>
    <rect x="190" y="40" width="160" height="120" rx="8"/>
    <rect x="360" y="40" width="160" height="120" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="100" y="60">Value-based</text>
    <text x="270" y="60">Policy gradient</text>
    <text x="440" y="60">Actor-Critic</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="100" y="82">odhad Q(s,a)</text>
    <text x="100" y="100">π = argmax Q</text>
    <text x="100" y="120">Q-learning, DQN</text>
    <text x="100" y="140">SARSA</text>
    <text x="270" y="82">optimalizuj π</text>
    <text x="270" y="100">přímý gradient</text>
    <text x="270" y="120">REINFORCE</text>
    <text x="270" y="140">PPO, TRPO</text>
    <text x="440" y="82">kombinace</text>
    <text x="440" y="100">policy + value</text>
    <text x="440" y="120">A3C, A2C</text>
    <text x="440" y="140">SAC, DDPG</text>
  </g>
</svg>
:::

### Value-based

* Učí se `Q(s, a)` nebo `V(s)`.
* Policy implicitní: `π(s) = argmax_a Q(s, a)`.
* Vhodné pro **diskrétní** akce.
* Detail v [[value-q-learning]].

### Policy-based / Policy gradient

* Učí se *přímo* policy `π_θ(a | s)`.
* Optimalizuje *očekávanou kumulativní odměnu* pomocí gradientu.
* Vhodné pro **kontinuální** akce.
* Detail v [[policy-gradient]].

### Actor-Critic

* Kombinace: *actor* (policy) + *critic* (value function).
* Critic *hodnotí* actorovy akce a stabilizuje učení.

### Model-based RL

* Učí se *model prostředí* `P̂(s' | s, a)` a `R̂(s, a)`.
* Plánuje v naučeném modelu (Monte Carlo, dynamické programování).
* **Sample-efficient** — méně reálných interakcí.
* Příklady: World Models, MuZero, Dreamer.

## Sample efficiency

::: svg "Trade-off sample efficiency: tabulkové metody nejlepší, model-based RL středně, deep RL nejhůř."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6" fill="none">
    <line x1="40" y1="140" x2="510" y2="140"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="end" font-size="10">
    <text x="36" y="44">vysoká</text>
    <text x="36" y="144">nízká</text>
  </g>
  <text x="20" y="80" font-size="10" fill="var(--text-muted)" transform="rotate(-90 20 80)">sample efficiency</text>
  <g fill="var(--accent)">
    <circle cx="80" cy="50" r="5"/>
    <circle cx="200" cy="70" r="5"/>
    <circle cx="320" cy="100" r="5"/>
    <circle cx="440" cy="130" r="5"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="80" y="40">Tabular Q</text>
    <text x="200" y="60">Model-based</text>
    <text x="320" y="90">Off-policy DQN</text>
    <text x="440" y="120">On-policy PG</text>
  </g>
</svg>
:::

**Sample efficiency** = kolik interakcí s prostředím model potřebuje k naučení.

* **Tabular methods** (Q-learning bez NN) — *nejlepší* pro malé stavové prostory.
* **Model-based** — naučený model *re-používá* zkušenost. Vysoká sample efficiency.
* **Off-policy** (Q-learning, DQN) — re-použije zkušenost z *replay bufferu*. Středně.
* **On-policy** (REINFORCE, PPO) — používá *jen aktuální* policy data. Nejhorší sample efficiency.

V reálném světě (drahé interakce, např. robotika, ekonomika) sample efficiency *kritická*. Pro hry / simulace lze trénovat *miliony* interakcí.

## Exploration vs. exploitation

Klíčový dilema:

* **Exploitation** — zvol akci, o které *víme*, že má vysokou hodnotu.
* **Exploration** — zkus *novou* akci, abychom *objevili*, jestli není lepší.

Strategie:

* **ε-greedy** — `1 − ε` exploitation, `ε` random action. `ε` se obvykle *snižuje s časem*.
* **Boltzmann/softmax** exploration — `π(a | s) ∝ exp(Q(s, a) / T)`. Akce s vyšší Q jsou pravděpodobnější; `T` reguluje randomness.
* **Curiosity-driven** — bonusová odměna za navštívení *novinkových* stavů (Pathak et al., 2017).
* **Thompson sampling** — sampling z *posterior* nad Q hodnotami.

## Příklady aplikací

* **Atari hry** (Mnih et al., 2013) — DQN naučí desítky her z pixelů.
* **AlphaGo** (Silver et al., 2016) — MCTS + RL self-play, porazil Lee Sedola.
* **AlphaStar** (Vinyals et al., 2019) — StarCraft II GrandMaster level.
* **Robotika** — manipulace, lokomoce.
* **Doporučovací systémy** — A/B testing, bandits.
* **Operations research** — řízení datacenter (Google), trading.
* **Autonomous driving** — Tesla, Waymo (částečně).
* **RLHF pro LLM** — alignment ChatGPT, Claude. Detail v [[rl-llm-rlhf]].

## Otevřené problémy

* **Sample efficiency** — moderní deep RL potřebuje *miliony* interakcí. Pro reálný svět neudržitelné.
* **Generalizace** — agent naučený v jednom prostředí *selhává* v lehce odlišném.
* **Reward hacking** — agent najde *způsob* odměny, který *obejde* zamýšlený cíl. Klasický příklad: robot, který „spal" před simulačním koncem.
* **Bezpečnost a alignment** — co když je reward function *špatně specifikovaná*?
* **Multi-agent** — koordinace, soutěž, emergent strategie.

## Vztah k jiným paradigmatům

* **Supervised learning** — labels jsou *dány*; v RL se *získávají* interakcí.
* **Unsupervised learning** — žádné labely; RL má *reward signal* (rozdílné od labelů).
* **Self-supervised** — automatically generated labels; RL má auto-generated reward.

> *„All supervised problems can be expressed as RL."*  
> Stačí dát odměnu za správnou predikci. *Není* to obvykle dobrý nápad — supervised learning je *efektivnější*.

> *„All RL problems can be solved with genetic programming."*  
> Vtipný nadsazený výrok, ale v principu pravdivý — GA fungují kde RL funguje. Nejsou *efektivní*.

::: link "Sutton, R. S., Barto, A. G.: Reinforcement Learning — An Introduction (MIT Press, 2nd ed. 2018)" "http://incompleteideas.net/book/the-book-2nd.html"
:::

::: link "DeepMind: RL Lecture Series 2021 (David Silver et al.)" "https://www.deepmind.com/learning-resources/introduction-to-reinforcement-learning-with-david-silver"
:::

::: link "OpenAI: Spinning Up in Deep RL" "https://spinningup.openai.com/"
:::

::: link "Stanford CS234: Reinforcement Learning (Emma Brunskill)" "https://web.stanford.edu/class/cs234/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Reinforcement learning* (Hradiš). Externí reference: Sutton, R. S., Barto, A. G.: *Reinforcement Learning — An Introduction* (MIT Press, 2nd ed. 2018) — [free PDF](http://incompleteideas.net/book/the-book-2nd.html); Russell & Norvig: *AIMA* (4. vyd., 2020), kap. 22-23; OpenAI: *Spinning Up in Deep RL* — [docs](https://spinningup.openai.com/).*
