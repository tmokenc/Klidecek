---
title: Policy gradient a actor-critic
---

# Policy gradient a actor-critic

**Policy gradient** je alternativní přístup k [[value-q-learning]] — místo učení hodnotové funkce *přímo optimalizujeme* policy `π_θ(a | s)` parametrickou metodou gradient descent.

## Motivace

Value-based RL (Q-learning, DQN) má omezení:

* **Diskrétní akce** — `max_a Q(s, a)` je *neefektivní* (nebo nemožné) pro spojité akce.
* **Deterministická policy** — `π* = argmax Q*`. Pro hry s blafováním je *stochastická* policy lepší.
* **Citlivá na hodnocení** — malá změna v Q může drasticky změnit policy.

**Policy gradient** řeší — *přímo* optimalizuje stochastickou policy `π_θ(a | s)`.

## Cíl — očekávaná odměna

::: math
J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\!\left[\sum_{t=0}^{T} \gamma^t r_t\right] = \mathbb{E}_{\tau \sim \pi_\theta}[R(\tau)]
:::

`τ` = trajectory = `(s_0, a_0, r_1, s_1, ..., s_T)`. `R(τ)` = kumulativní odměna.

Cíl: maximalizovat `J(θ)` přes parametry `θ`.

## Policy gradient theorem

Klíčový výsledek **(Sutton et al., 2000)**:

::: math
\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\!\left[\sum_{t=0}^{T} \nabla_\theta \log \pi_\theta(a_t \mid s_t) \cdot R(\tau)\right]
:::

Slovně:

> *„Gradient očekávané odměny = očekávané `gradient log-pravděpodobnosti akce × odměna trajektorie"`*

Toto je **REINFORCE** algoritmus (Williams, 1992).

### Interpretace

* Pokud `R(τ) > 0` (dobrá trajektorie), gradient *zvýší* pravděpodobnost akcí v této trajektorii.
* Pokud `R(τ) < 0` (špatná), gradient *sníží* pravděpodobnost.

Algoritmus:

```
inicializuj θ náhodně
repeat:
    sbírej trajektorie τ_1, ..., τ_K se policy π_θ
    spočti R(τ_i) pro každou
    update: θ ← θ + α · (1/K) Σ_i Σ_t ∇log π_θ(a_t | s_t) · R(τ_i)
```

### Limity

* **Vysoká variance gradientu** — odměna `R(τ)` se může lišit *řádově* mezi trajektoriemi.
* **Sample-inefficient** — potřebuje *spousta* trajektorií.
* **On-policy** — *nemůže* znovu použít staré trajektorie.

## Variance reduction

### Baseline

Odečteme **baseline** `b(s)` od `R(τ)` — *neměni* gradient (matematicky), ale *sníží* varianci:

::: math
\nabla_\theta J(\theta) = \mathbb{E}\!\left[\sum_t \nabla_\theta \log \pi_\theta(a_t \mid s_t) (R(\tau) - b(s_t))\right]
:::

Důkaz, že nezmění:

::: math
\mathbb{E}\!\left[\nabla \log \pi_\theta(a \mid s) \cdot b(s)\right] = b(s) \sum_a \pi_\theta(a \mid s) \nabla \log \pi_\theta(a \mid s) = b(s) \nabla\sum_a \pi_\theta = 0
:::

Typická volba: `b(s) = V^π(s)` — *hodnota stavu*.

### Reward-to-go

Místo *celkové* odměny `R(τ)` použijeme jen *budoucí* odměnu pro akci `a_t`:

::: math
G_t = \sum_{k=t}^{T} \gamma^{k-t} r_k
:::

::: math
\nabla J = \mathbb{E}\!\left[\sum_t \nabla \log \pi_\theta(a_t \mid s_t) \cdot G_t\right]
:::

* **Causality** — akce `a_t` neovlivňuje minulé odměny `r_{t' < t}`. Včlenění minulých je *šum*.
* Snižuje varianci.

::: viz policy-gradient-cartpole "Zjednodušený cartpole; trajektorie + akce přes čas; return curve přes epizody; scrubujte tréninkem."
:::

## Actor-Critic

Kombinace:

* **Actor** — policy `π_θ(a | s)`.
* **Critic** — value function `V_φ(s)` nebo `Q_φ(s, a)`.

Actor *jedná*, critic *hodnotí*. Gradient používá hodnocení critic-a jako *baseline*.

::: svg "Actor-Critic: actor produkuje akce, critic je hodnotí a poskytuje signál pro update aktora."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40" y="60" width="140" height="40" rx="6"/>
    <rect x="40" y="120" width="140" height="40" rx="6"/>
    <rect x="280" y="80" width="160" height="60" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="110" y="84" font-weight="600">Actor π_θ</text>
    <text x="110" y="100" font-size="9" fill="var(--text-muted)">policy</text>
    <text x="110" y="144" font-weight="600">Critic V_φ</text>
    <text x="110" y="160" font-size="9" fill="var(--text-muted)">value</text>
    <text x="360" y="106" font-weight="600">Prostředí</text>
    <text x="360" y="124" font-size="9" fill="var(--text-muted)">stavy, odměny</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="180" y1="80" x2="280" y2="100" marker-end="url(#acArr)"/>
    <line x1="280" y1="120" x2="180" y2="140" marker-end="url(#acArr)"/>
    <line x1="180" y1="100" x2="180" y2="120" stroke-dasharray="2 2"/>
  </g>
  <defs>
    <marker id="acArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--text)" font-size="10" text-anchor="middle">
    <text x="230" y="78">akce</text>
    <text x="230" y="138">stav, odměna</text>
    <text x="195" y="113">value</text>
  </g>
</svg>
:::

### Advantage

**Advantage function** `A(s, a)` = relativní hodnota akce `a` ve stavu `s`:

::: math
A^\pi(s, a) = Q^\pi(s, a) - V^\pi(s)
:::

Aproximace: `A(s, a) ≈ r + γ V_φ(s') − V_φ(s)` (TD error).

Gradient:

::: math
\nabla J = \mathbb{E}\!\left[\sum_t \nabla \log \pi_\theta(a_t \mid s_t) \cdot A(s_t, a_t)\right]
:::

### A2C — Advantage Actor-Critic

* Synchronní actor-critic, jedna paralelní instance.
* Stabilní baseline, simple to implement.

### A3C — Asynchronous Advantage Actor-Critic (Mnih et al., 2016)

* *Asynchronní* — *více* paralelních workerů, každý hraje svou episodu.
* Update globálních parametrů *asynchronně*.
* Drasticky lepší sample efficiency.

## PPO — Proximal Policy Optimization (Schulman et al., 2017)

**Standard de-facto** v moderním RL. Řeší problém *velkých* policy updates, které ničí učení.

### Surrogate loss

::: math
L^{PPO}(\theta) = \mathbb{E}\!\left[\min(r_t(\theta) A_t,\, \text{clip}(r_t(\theta), 1 - \epsilon, 1 + \epsilon) A_t)\right]
:::

kde:

::: math
r_t(\theta) = \frac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{\text{old}}}(a_t \mid s_t)}
:::

* `r_t` — *poměr* aktuální vs. staré policy.
* `ε ≈ 0.2` — *clip* range.

**Intuice**: limituje, jak moc se policy *posune* v jednom updatu. Stabilní, robustní, široce použitelné.

* **Sample efficient** — re-použije batch dat pro multiple gradient steps.
* **Snadná implementace**.
* Použito v *RLHF* pro LLM ([[rl-llm-rlhf]]).

## TRPO — Trust Region Policy Optimization (Schulman et al., 2015)

Předchůdce PPO. Limit policy update *trust regionem*:

::: math
\max_\theta L(\theta) \quad \text{s.t.} \quad D_{KL}(\pi_{\theta_{\text{old}}} \| \pi_\theta) \le \delta
:::

Theoreticky elegantní, *prakticky složitější* (vyžaduje conjugate gradient + line search). PPO ho v praxi nahradil.

## DDPG — Deep Deterministic Policy Gradient (Lillicrap et al., 2016)

Pro **spojité** akce. Hybrid actor-critic + Q-learning ideje:

* **Deterministická policy** `μ_θ(s) → a` (continuous).
* **Q-critic** `Q_φ(s, a)`.
* **Target networks** + **replay buffer** (jako DQN).

### Update

::: math
\theta \leftarrow \theta + \alpha \nabla_a Q_\phi(s, a)\big|_{a=\mu_\theta(s)} \cdot \nabla_\theta \mu_\theta(s)
:::

Chain rule: aktualizujeme actor *směrem, který zvyšuje Q*.

### TD3 (Fujimoto et al., 2018)

DDPG má instability problémy. **TD3** přidá:

* **Twin Q-networks** (Double DQN trick).
* **Delayed policy update** — actor se aktualizuje *méně často* než critic.
* **Target noise smoothing** — random šum k cílové akci.

## SAC — Soft Actor-Critic (Haarnoja et al., 2018)

Aktuálně populární — *off-policy*, *stable*, *good sample efficiency*. **Maximum entropy** framework:

::: math
J(\theta) = \mathbb{E}\!\left[\sum_t r_t + \alpha \mathcal{H}(\pi_\theta(\cdot \mid s_t))\right]
:::

`H` = Shannonova entropie policy. Bonus za *náhodnou* policy → větší explorace.

* Spojité akce.
* Robustní k hyperparameter volbě.
* State-of-the-art na MuJoCo benchmarks.

## Exploration v policy gradient

Stochastická policy *přirozeně* exploruje díky randomness. Strategie:

* **Gaussian noise** — pro spojité akce přidat `N(0, σ)`.
* **Softmax with temperature** — pro diskrétní akce.
* **Entropy bonus** — `J + β · H(π)`. Penalizuje deterministic policy.
* **Parameter noise** — náhodné perturbace parametrů aktora.

## On-policy vs. off-policy

| | On-policy | Off-policy |
| :-- | :--: | :--: |
| Příklady | REINFORCE, A2C, PPO | DQN, DDPG, SAC |
| Re-use dat | Ne (jen aktuální policy) | Ano (replay buffer) |
| Stability | Vyšší | Nižší |
| Sample efficiency | Nižší | Vyšší |
| Implementace | Jednodušší | Složitější |

## Praktické pipeline

```python
from stable_baselines3 import PPO
import gymnasium as gym

env = gym.make("CartPole-v1")
model = PPO("MlpPolicy", env, 
            learning_rate=3e-4, 
            n_steps=2048, 
            batch_size=64,
            n_epochs=10,
            gamma=0.99,
            verbose=1)
model.learn(total_timesteps=200_000)
```

Pro spojité akce:

```python
from stable_baselines3 import SAC

env = gym.make("HalfCheetah-v4")
model = SAC("MlpPolicy", env, learning_rate=3e-4, buffer_size=1_000_000)
model.learn(total_timesteps=500_000)
```

## Aplikace

* **Robotika** — manipulace, lokomoce, navigace. SAC, PPO.
* **Hry** — AlphaStar (StarCraft II), OpenAI Five (Dota 2).
* **NLP** — RLHF pro alignment LLM. PPO. Detail v [[rl-llm-rlhf]].
* **Finance** — trading strategies.
* **Datacenter** — optimalizace chlazení (DeepMind & Google).

## Otevřené problémy

* **Sample efficiency** — pořád milionové škály.
* **Hyperparameter sensitivity** — PPO, SAC vyžadují ladění.
* **Reproducibility** — RL výsledky často těžko *reprodukovatelné*.
* **Generalization** — síť naučená v jednom prostředí selhává v drobně odlišném.

::: link "Sutton & Barto: RL Book, kap. 13 — Policy Gradient Methods" "http://incompleteideas.net/book/the-book-2nd.html"
:::

::: link "Schulman et al.: Proximal Policy Optimization Algorithms (2017)" "https://arxiv.org/abs/1707.06347"
:::

::: link "Lilian Weng: Policy Gradient Algorithms (blog)" "https://lilianweng.github.io/posts/2018-04-08-policy-gradient/"
:::

::: link "OpenAI Spinning Up — Algorithms" "https://spinningup.openai.com/en/latest/algorithms/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Policy gradient methods* (Hradiš). Externí reference: Williams, R.: *REINFORCE* (Machine Learning 8, 1992); Sutton, R. S. et al.: *Policy Gradient Methods for RL* (NeurIPS 1999); Schulman, J. et al.: *TRPO* (ICML 2015) a *PPO* (2017); Lillicrap, T. et al.: *Continuous Control with Deep RL* (DDPG, ICLR 2016); Haarnoja, T. et al.: *Soft Actor-Critic* (ICML 2018).*
