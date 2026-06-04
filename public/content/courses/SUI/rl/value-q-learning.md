---
title: Value-based RL — Q-learning a DQN
---

# Value-based RL — Q-learning a DQN

**Value-based** přístup učí *value function* nebo *Q-function* — měřítko hodnoty stavů a akcí. Policy je *implicitní*: „vybírej akci s maximální Q-hodnotou".

## Value function

**State-value function** `V^π(s)` — očekávaná kumulativní odměna z `s` při následování policy `π`:

::: math
V^\pi(s) = \mathbb{E}_\pi\!\left[\sum_{t=0}^{\infty} \gamma^t r_{t+1} \,\Big|\, s_0 = s\right]
:::

**Action-value function (Q-function)** `Q^π(s, a)` — očekávaná kumulativní odměna po akci `a` z `s` a dále následování `π`:

::: math
Q^\pi(s, a) = \mathbb{E}_\pi\!\left[\sum_{t=0}^{\infty} \gamma^t r_{t+1} \,\Big|\, s_0 = s,\, a_0 = a\right]
:::

Vztah: `V^π(s) = Σ_a π(a | s) Q^π(s, a)`.

## Bellmanova rovnice

Klíčový rekurentní vztah:

::: math
Q^\pi(s, a) = \mathbb{E}_{s'}\!\left[ r(s, a, s') + \gamma \sum_{a'} \pi(a' \mid s') Q^\pi(s', a') \right]
:::

Slovně: „Q-hodnota stavu-akce = okamžitá odměna + diskontovaná Q-hodnota *následujícího* stavu-akce".

### Optimální Q-function

Pro **optimální** policy `π*`:

::: math
Q^*(s, a) = \mathbb{E}_{s'}\!\left[ r(s, a, s') + \gamma \max_{a'} Q^*(s', a') \right]
:::

Pokud známe `Q*`, optimální policy je *deterministická*:

::: math
\pi^*(s) = \arg\max_a Q^*(s, a)
:::

## Tabular Q-learning (Watkins, 1989)

Pro **malé, diskrétní** stavové a akční prostory uchováváme `Q(s, a)` v tabulce.

```
inicializuj Q(s, a) náhodně
repeat (pro každou episodu):
    s ← počáteční stav
    while s není terminální:
        a ← vyber akci podle ε-greedy(Q, s)
        proveď a, pozoruj r a s'
        Q(s, a) ← Q(s, a) + α [r + γ max_a' Q(s', a') − Q(s, a)]
        s ← s'
```

### Update rule

::: math
Q(s, a) \leftarrow Q(s, a) + \alpha\bigl[r + \gamma \max_{a'} Q(s', a') - Q(s, a)\bigr]
:::

* `α` — learning rate (typicky `0.1`).
* `γ` — discount factor (typicky `0.99`).
* **TD error** = `r + γ max_a' Q(s', a') − Q(s, a)` — *„target − current"*.

### Vlastnosti

* **Off-policy** — učí se z *jakékoli* policy (i z náhodných tahů).
* **Konvergence** — garantovaná k `Q*` při dostatečné exploraci a klesajícím `α`.
* **Tabular** — funguje jen pro *konečné* stavové prostory. Pro `|S| = 10⁶+` nepoužitelné.

::: viz q-learning-gridworld "5×5 gridworld; ε-greedy, α/γ slidery; Q-table per cell + policy arrows; return curve napravo."
:::

## Deep Q-Network (DQN)

**Mnih et al. (2013, 2015)** — průlomová publikace v *deep RL*. Naučí *Atari hry z pixelů*.

::: svg "DQN architektura: vstup = 4 frames, CNN extrahuje features, FC vrstva → Q hodnoty pro každou akci."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="30" y="50" width="80" height="100" rx="4"/>
    <rect x="140" y="60" width="80" height="80" rx="4"/>
    <rect x="250" y="70" width="80" height="60" rx="4"/>
    <rect x="360" y="60" width="60" height="80" rx="4"/>
    <rect x="450" y="40" width="60" height="20" rx="3"/>
    <rect x="450" y="70" width="60" height="20" rx="3"/>
    <rect x="450" y="100" width="60" height="20" rx="3"/>
    <rect x="450" y="130" width="60" height="20" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="70" y="105">4 frames</text>
    <text x="180" y="105">Conv1</text>
    <text x="290" y="105">Conv2</text>
    <text x="390" y="105">FC</text>
    <text x="480" y="55">Q(s, ←)</text>
    <text x="480" y="85">Q(s, →)</text>
    <text x="480" y="115">Q(s, ↑)</text>
    <text x="480" y="145">Q(s, ↓)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="110" y1="100" x2="140" y2="100" marker-end="url(#dqnArr)"/>
    <line x1="220" y1="100" x2="250" y2="100" marker-end="url(#dqnArr)"/>
    <line x1="330" y1="100" x2="360" y2="100" marker-end="url(#dqnArr)"/>
    <line x1="420" y1="100" x2="450" y2="100" marker-end="url(#dqnArr)"/>
  </g>
  <defs>
    <marker id="dqnArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

* **Neuronka** aproximuje `Q(s, a; θ)` místo tabulky.
* **Vstup**: 4 po sobě jdoucí frames (84×84 grayscale).
* **Výstup**: vektor Q-hodnot pro každou akci (joystick + tlačítko).

### Loss

::: math
L(\theta) = \mathbb{E}_{(s, a, r, s') \sim \mathcal{D}}\!\left[(r + \gamma \max_{a'} Q(s', a'; \theta^-) - Q(s, a; \theta))^2\right]
:::

* `θ` — aktuální parametry sítě.
* `θ⁻` — *target network* (zafrozená kopie, viz dále).
* `D` — *replay buffer* (viz dále).

### Klíčové triky

#### 1. Replay buffer

* Ukládáme **transitions** `(s, a, r, s')` do *bufferu* (typicky `10⁶` posledních).
* Trénink: vzorkujeme **náhodné mini-batche** z bufferu.
* Důvody:
  - **Decorrelace** vzorků — po sobě jdoucí vzorky jsou *vysoce korelované* → unestabilní gradient.
  - **Sample re-use** — každý vzorek se použije *vícekrát*.

#### 2. Target network

* Cíl `r + γ max_a' Q(s', a'; θ⁻)` se počítá s *zafrozenou* kopií parametrů.
* Aktualizujeme `θ⁻ ← θ` jen *jednou za čas* (např. každých 10 000 updates).
* Bez target network: cíl se *posune* s každým updatem → unestabilní (*target chases the prediction*).

#### 3. ε-greedy exploration

* S pravděpodobností `ε` — random action.
* S pravděpodobností `1 − ε` — `argmax_a Q(s, a)`.
* `ε` se *snižuje* od `1.0` k `0.1` v průběhu tréninku.

### Algoritmus DQN

```
inicializuj Q-network θ, target Q-network θ⁻
inicializuj replay buffer D
for epizoda = 1..M:
    s ← počáteční stav
    while s není terminální:
        a ← ε-greedy(Q(s, ·; θ))
        proveď a, pozoruj r a s'
        D.append((s, a, r, s'))
        
        # Trénink
        batch = D.sample(B)
        targets = r + γ max_a' Q(s', a'; θ⁻)
        loss = MSE(Q(s, a; θ), targets)
        update θ by gradient descent
        
        every K steps: θ⁻ ← θ
        s ← s'
```

### Výsledky

DQN na Atari 2013/2015 dosáhla *lidský level* nebo *nadlidský* na *většině* her — *jediná* architektura naučená od pixelů. Klíčový moment pro **deep RL** revoluci.

## Varianty DQN

### Double DQN (van Hasselt et al., 2016)

Problém: `max` v cíli způsobuje **overestimation bias** — Q-hodnoty rostou nad pravdivé.

Řešení: použít *aktuální* `θ` pro výběr akce, *target* `θ⁻` pro evaluaci:

::: math
\text{target} = r + \gamma Q\!\left(s', \arg\max_{a'} Q(s', a'; \theta);\, \theta^-\right)
:::

### Dueling DQN (Wang et al., 2016)

Dekompozice: `Q(s, a) = V(s) + A(s, a)` (advantage). Síť produkuje *odděleně* `V` a `A`, kombinuje:

::: math
Q(s, a) = V(s) + \left(A(s, a) - \frac{1}{|A|}\sum_{a'} A(s, a')\right)
:::

Lepší pro stavy, kde *všechny* akce mají podobnou hodnotu.

### Prioritized Experience Replay (Schaul et al., 2016)

Místo *uniformního* sampling z bufferu vzorkujeme s pravděpodobností úměrnou *TD error* — *„důležité" vzorky častěji*.

### Rainbow DQN (Hessel et al., 2018)

Kombinace 6 vylepšení (Double + Dueling + Prioritized + Multi-step + Distributional + Noisy Nets). State-of-the-art na Atari.

### Distributional RL (C51, Bellemare et al., 2017)

Místo skalární `Q(s, a)` modelujeme *distribuci* návrhů `Z(s, a)`. Bohatší informace, lepší výkon.

## SARSA — On-policy varianta

**SARSA** (State-Action-Reward-State-Action) — on-policy alternativa k Q-learning. Místo `max_a' Q(s', a')` (off-policy) bere `Q(s', a')` pro *skutečně provedenou* akci `a'`:

::: math
Q(s, a) \leftarrow Q(s, a) + \alpha[r + \gamma Q(s', a') - Q(s, a)]
:::

* **On-policy** — učí se hodnotu *aktuální* policy (s exploration).
* **Konzervativnější** — Q-learning ignoruje exploration penalty.

V praxi méně používaná než Q-learning.

## Continuous actions

DQN funguje *jen* pro **diskrétní** akce — počítáme `max_a Q(s, a)` přes všechny akce.

Pro **spojité** akce (např. úhly motorů robota) potřebujeme:

* **DDPG** (Lillicrap et al., 2015) — Deep Deterministic Policy Gradient. Actor-critic.
* **TD3** (Fujimoto et al., 2018) — vylepšení DDPG.
* **SAC** (Haarnoja et al., 2018) — Soft Actor-Critic. Maximum entropy framework.

Detail v [[policy-gradient]] (next section).

## Sparse rewards problem

Pokud odměna *přichází jen* na konci epizody (vyhrál/prohrál), je *vzácná*. Agent dlouho neví, co je dobré. Řešení:

* **Reward shaping** — přidat *intermediate* odměny (nebezpečné — může změnit optimální policy).
* **Hindsight Experience Replay** (HER, Andrychowicz et al., 2017) — *přepiš* cíl epizody na *to, co se opravdu stalo*.
* **Curiosity-driven exploration** — bonus za novost stavu.
* **Imitation learning** — start z lidských demonstrací.

## Praktické tipy {tier=practice}

* **Reward normalization** — odměny v rozumném rozsahu (`[−1, 1]` nebo `[0, 1]`).
* **State normalization** — features (pixely → `/255`).
* **Frame stacking** pro markovskost (Atari standard: 4 framy).
* **Skip frames** — agent dělá rozhodnutí každých `k` framů (Atari: `k = 4`).
* **Huber loss** místo MSE — robustnější k outliers TD errors.

## Praktická knihovna — Stable Baselines3 {tier=practice}

```python
from stable_baselines3 import DQN
import gymnasium as gym

env = gym.make("CartPole-v1")
model = DQN("MlpPolicy", env, learning_rate=1e-3, buffer_size=10000, verbose=1)
model.learn(total_timesteps=100_000)

# Evaluace
obs, _ = env.reset()
for _ in range(1000):
    action, _ = model.predict(obs, deterministic=True)
    obs, reward, done, _, _ = env.step(action)
    if done: obs, _ = env.reset()
```

::: link "Mnih et al.: Human-level control through deep reinforcement learning (Nature, 2015)" "https://www.nature.com/articles/nature14236"
:::

::: link "Sutton, Barto: Reinforcement Learning Book, kap. 6 (TD learning), kap. 11 (off-policy)" "http://incompleteideas.net/book/the-book-2nd.html"
:::

::: link "PyTorch — Reinforcement Q-Learning tutorial" "https://pytorch.org/tutorials/intermediate/reinforcement_q_learning.html"
:::

::: link "Stable Baselines3 — produkční RL knihovna" "https://stable-baselines3.readthedocs.io/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Reinforcement learning — Q-learning* (Hradiš). Externí reference: Watkins, C., Dayan, P.: *Q-learning* (Machine Learning 8, 1992); Mnih, V. et al.: *Playing Atari with Deep Reinforcement Learning* (NeurIPS Workshop 2013) a *Human-level control through Deep RL* (Nature 518, 2015); Sutton, R. S., Barto, A. G.: *Reinforcement Learning* (MIT Press, 2nd ed. 2018), kap. 6 + 11; Hessel, M. et al.: *Rainbow* (AAAI 2018).*
