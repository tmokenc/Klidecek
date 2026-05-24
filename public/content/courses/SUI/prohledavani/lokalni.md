---
title: Lokální prohledávání a optimalizace
---

# Lokální prohledávání a optimalizace

**Lokální** prohledávání je radikálně jiný přístup než systematické metody ([[neinformovane]], [[informovane]]). Místo udržování *cesty* z `s₀` operuje na *aktuálním stavu* a modifikuje ho hledáním lepších *sousedů*.

## Kdy použít

* **Velký** nebo **spojitý** stavový prostor — systematické prohledávání je neaplikovatelné.
* Cílem je **optimalizace** — najít stav s *nejlepší hodnotou* nějaké metriky, ne sekvenci akcí.
* **Cesta k řešení nás nezajímá**, jen samo řešení.
* Často nemáme dolní mez na cenu řešení, prostě hledáme „co nejlepší".

Příklady:

* **8 dam** s milionem dam — systematické prohledávání neproveditelné, lokální dokáže.
* **Vehicle routing** (TSP, milkrun) — nalezení dobré, ne nutně optimální cesty.
* **Layout** integrovaných obvodů, plánování rozvrhů.
* **Trénování neuronek** — *gradient descent* je lokální prohledávání ve spojitém prostoru.

::: svg "Stavový prostor s lokálními a globálním extrémem, plateau a ridge."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6" fill="none">
    <line x1="20" y1="195" x2="520" y2="195"/>
  </g>
  <path d="M 30 175 C 90 150 110 80 150 100 C 190 120 210 30 280 50 C 350 70 360 150 400 130 C 440 110 460 180 510 160" 
        stroke="var(--accent)" stroke-width="2" fill="none"/>
  <g fill="var(--text)" font-size="10">
    <circle cx="150" cy="100" r="3.5" fill="#7fbf6c"/>
    <text x="150" y="92" text-anchor="middle">lokální max</text>
    <circle cx="280" cy="50" r="3.5" fill="#e08a3a"/>
    <text x="280" y="40" text-anchor="middle">globální max</text>
    <circle cx="400" cy="130" r="3.5" fill="#7fbf6c"/>
    <text x="400" y="122" text-anchor="middle">lokální max</text>
    <text x="220" y="190" text-anchor="middle" fill="var(--text-muted)">plateau</text>
    <text x="50" y="190" text-anchor="middle" fill="var(--text-muted)">x</text>
  </g>
</svg>
:::

## Hill climbing

**„Lez do kopce"** — greedy local search.

```
n = generate_initial_state()
loop:
    soused = nejlepší(neighbors(n))
    if value(soused) ≤ value(n): return n
    n = soused
```

* Velmi *rychlý* a *minimální paměť*.
* **Problémy:**
  - **Lokální maximum** — zaseknuti na vrcholku, kolem hlubší údolí, ale algoritmus skončí.
  - **Plateau** — všichni sousedé mají stejnou hodnotu; jak zvolit směr?
  - **Hřeben (ridge)** — řada lokálních max., každý krok vede dolů (uvázli na hřebenu).

### Varianty hill climbing

* **Stochastic hill climbing** — zvolíme *náhodného* lepšího souseda, ne *nejlepšího*. Pomalejší konvergence, lepší explorace.
* **First-choice hill climbing** — bereme *prvního* lepšího souseda. Užitečné při *obrovském* počtu sousedů.
* **Random-restart hill climbing** — opakujeme s *náhodnou inicializací*. Pravděpodobnost nalezení globálního maxima konverguje k 1 s počtem restartů. Často overhead nestoji za to. *Triviálně paralelizovatelný*.

## Simulované žíhání

**Simulated annealing** (Kirkpatrick et al., 1983) — inspirace metalurgií.

```
n = generate_initial_state()
T = T_start (vysoká teplota)
loop:
    soused = random(neighbors(n))
    ΔE = value(soused) − value(n)
    if ΔE > 0:
        n = soused
    else:
        n = soused with probability exp(ΔE / T)
    T = schedule(T)  # postupné chladnutí
    if T ≈ 0: return n
```

* **Při vysoké T** akceptujeme i horší kroky → *explorace*.
* **Při nízké T** se chováme jako hill climbing → *exploitace*.
* **Chladící schéma** rozhoduje. *Geometrické* `T ← α · T` (`α ≈ 0.95`) je pragmatické. *Logaritmické* `T ∝ 1/log(t)` má teoretickou garanci konvergence k globálnímu optimu (ale prakticky příliš pomalé).

Boltzmannova distribuce `exp(ΔE/T)` se *přejala z fyziky* — popisuje pravděpodobnost stavu o energii ΔE nad základním stavem při teplotě T.

::: viz hill-climbing-sa "1D multi-modální krajina; hill climb se zasekne, SA s T₀ slider akceptuje horší kroky."
:::

## Local beam search

**Hold `k` stavů současně.**

```
n_1, …, n_k = generate_random_states(k)
loop:
    all_neighbors = ∪ᵢ neighbors(n_i)
    n_1, …, n_k = best_k(all_neighbors)
    if některý je cílem: return ho
```

* Sdílí informace mezi paralelními kandidáty — když některý uvázne, ostatní pomohou.
* **Diverzita** se rychle ztrácí — všichni konvergují do jednoho údolí.
* **Stochastic beam search** — sousedy vybíráme s *pravděpodobností* úměrnou hodnotě, ne deterministicky → zachová diverzitu.

(Pozor: *beam search* jako *dekódovací* algoritmus v neuronkách ([[transformer-bert]]) je stejný princip aplikovaný na sekvenční generování. Tam ale není „local search", protože generuje *sekvenci od začátku*.)

## Genetický algoritmus

**John Holland (1975)** — inspirace evolucí.

Místo *jednoho* stavu nebo *populace bez křížení* (beam search) máme *populaci jedinců*, kteří se mohou *křížit*.

```
population = init_random(N jedinců)
loop:
    fitness = evaluate(population)
    parents = select(population, fitness)  # roulette / tournament
    offspring = crossover(parents)         # mix dvou rodičů
    offspring = mutate(offspring)          # náhodná změna
    population = best_N(population ∪ offspring)
```

### Klíčové komponenty

* **Reprezentace jedince** — typicky *string* (chromosome) z konečné abecedy.
* **Fitness function** — vyhodnocení kvality.
* **Selekce** — koho použít jako rodiče. *Roulette wheel*, *tournament selection*.
* **Crossover** — kombinace dvou rodičů. *Single-point*, *two-point*, *uniform crossover*.
* **Mutace** — náhodná změna v potomkovi (malý šum).

### Příklad — 8 dam

Reprezentace: *8-tice* sloupců dam (jedna dáma na řádek). Fitness = počet *neohrožujících* párů (cíl 28). Crossover: zaměníme suffix dvou rodičů. Mutace: změníme pozici náhodné dámy.

Genetické algoritmy obvykle pracují *lépe*, když rodiče jsou velmi *odlišní* (vysoká genetická diverzita) — proto je důležitá *selekční teplota* (silnější selekce → rychlá konvergence, ale risk lokální optimum).

::: viz n-queens-min-conflicts "8-queens via min-conflicts; konflikty per sloupec, vidíte přesun dámy do řádku s minimem konfliktů."
:::

## Spojitý prostor — gradient descent

Když je stavový prostor `R^D` *a* máme *diferencovatelnou* objektivní funkci `f`, dostaneme se k **gradient descent**:

::: math
\mathbf{x}_{t+1} = \mathbf{x}_t - \alpha \,\nabla f(\mathbf{x}_t)
:::

* `α` (learning rate) — velikost kroku.
* `∇f` — vektor parciálních derivací. Ukazuje směr *největšího nárůstu*; mínus = sestup.
* **Konverguje** k lokálnímu *minimu* (pro konvexní `f` ke globálnímu).

Toto je *technicky* lokální prohledávání ve spojitém prostoru. Detail v [[gradient-descent]] (pro neuronové sítě).

Pro nelineární problémy bez gradientu existují:

* **Particle swarm optimization (PSO)** — populace „částic" v prostoru, každá si pamatuje svoje nejlepší + globální nejlepší.
* **Differential evolution** — genetika ve spojitém prostoru.
* **Bayesian optimization** — efektivní pro drahá vyhodnocení (např. ladění hyperparametrů ML modelů).

## Constrained optimization

Reálné úlohy mají *omezení*: „Letiště ne v jezeře", „Plánovač zachovává min. odpočinek 11 h". Možnosti:

* **Lineární omezení + lineární cíl** → *Linear Programming* (simplexová metoda).
* **Lineární omezení + kvadratický cíl** → *Quadratic Programming*.
* **Nelineární** — penalizace v ciljové funkci, Lagrangeovy multiplikátory, interior-point methods.

## Srovnání

| Metoda | Diverzita | Globální optimum | Náročnost | Vhodné pro |
| :-- | :--: | :--: | :--: | :--: |
| Hill climbing | Žádná | Ne | Velmi nízká | Malé prostory, pre-eval |
| Random restart | Multi-startem | S pravd. 1 v limitu | Nízká | Triviálně paralelizovatelné |
| Simulated annealing | Časem klesá | Asymptoticky ano | Střední | Dobře laděné, široké pole |
| Beam search | `k`-koordinovaná | Lepší než hill | Střední | Sekvenční generování |
| Genetický alg. | Vysoká (populace) | Ne, ale dobré | Vysoká | Kombinatorické, různé domény |
| Gradient descent | Žádná | Lokální (konvex → globální) | Nízká | Spojité, diferencovatelné |

::: link "AIMA, kap. 4: Search in Complex Environments" "http://aima.cs.berkeley.edu/"
:::

::: link "Kirkpatrick, S., Gelatt, C. D., Vecchi, M. P.: Optimization by Simulated Annealing (Science, 1983)" "https://www.science.org/doi/10.1126/science.220.4598.671"
:::

::: link "Holland, J. H.: Adaptation in Natural and Artificial Systems (MIT Press, 1975)" "https://mitpress.mit.edu/9780262581110/adaptation-in-natural-and-artificial-systems/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Lokální prohledávání* (Šůstek). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 4.1–4.2; Kirkpatrick, S., Gelatt, C. D., Vecchi, M. P.: *Optimization by Simulated Annealing* (Science 220, 1983); Holland, J. H.: *Adaptation in Natural and Artificial Systems* (MIT Press 1975); Boyd, S., Vandenberghe, L.: *Convex Optimization* (Cambridge UP 2004) — [free PDF](https://web.stanford.edu/~boyd/cvxbook/).*
