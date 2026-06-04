---
title: Náhradní (surrogate) modely
---

# Náhradní (surrogate) modely

Hlavní brzdou neuroevoluce je **cena vyhodnocení fitness**. Ohodnotit jednoho jedince často znamená *spustit drahou simulaci* nebo (v neuroevoluci architektur, NAS) **natrénovat síť od nuly** — stovky epoch na GPU. Při populaci stovek jedinců a desítkách generací roste počet evaluací do tisíců, a tím i spotřeba **GPU-hodin**. **Náhradní (surrogate) model** je *levný regresní model*, který se naučí **aproximovat fitness** a většinu vyhodnocení tak nahradí odhadem.

## Princip

Surrogate model `ŝ(x)` je naučen na *dvojicích* (chromozom `x`, přesná fitness `f(x)`) a predikuje fitness *bez* drahé simulace. Typické modely: **polynomiální regrese**, **radiální bázové funkce (RBF)**, **Kriging / Gaussovské procesy** (dávají i nejistotu odhadu) nebo **neuronová síť**. Místo přesné hodnoty stačí někdy i *klasifikace* (dobrý/špatný) nebo *ranking* (relativní pořadí jedinců).

::: math
\hat{s}(x) \approx f(x), \qquad \text{čas: } t_{\hat{s}} \ll t_{f}
:::

## Smyčka s řízením modelu (model management)

Surrogate **nesmí** nahradit přesnou fitness úplně — jinak se evoluce začne hnát za *chybou aproximace* a sbíhá k falešným optimům. Proto se kombinují obě úrovně: **většinu jedinců odhadne surrogate**, ale *občas* (např. nejlepší kandidáty nebo náhodný vzorek každé generace) se vyhodnotí **přesně** a těmito novými body se surrogate **přetrénuje**. Tomu se říká *evolution control* / *model management*.

::: svg "Smyčka s náhradním modelem: většina jedinců přes levný surrogate, vybraní přes drahou přesnou fitness; přesné body model přetrénují."
<svg viewBox="0 0 540 210" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="surrA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>

  <!-- population -->
  <rect x="14" y="80" width="92" height="46" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1.2"/>
  <text x="60" y="100" text-anchor="middle" fill="var(--text)">populace</text>
  <text x="60" y="115" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">kandidátní sítě</text>

  <!-- split: cheap surrogate (top) vs exact (bottom) -->
  <rect x="190" y="20" width="150" height="54" rx="6" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4"/>
  <text x="265" y="40" text-anchor="middle" fill="var(--accent)">levný surrogate</text>
  <text x="265" y="55" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">regresor: odhad fitness</text>
  <text x="265" y="68" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">většina jedinců · rychle</text>

  <rect x="190" y="130" width="150" height="56" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1.4"/>
  <text x="265" y="150" text-anchor="middle" fill="var(--text)">drahá přesná fitness</text>
  <text x="265" y="165" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">simulace / trénink</text>
  <text x="265" y="178" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">jen vybraní · občas</text>

  <!-- selection / next gen -->
  <rect x="424" y="80" width="100" height="46" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1.2"/>
  <text x="474" y="100" text-anchor="middle" fill="var(--text)">selekce</text>
  <text x="474" y="115" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">další generace</text>

  <!-- arrows population -> two evaluators -->
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" marker-end="url(#surrA)">
    <path d="M106,96 C140,96 150,47 188,47"/>
    <path d="M106,110 C140,110 150,158 188,158"/>
    <!-- evaluators -> selection -->
    <path d="M340,47 C384,47 392,96 422,96"/>
    <path d="M340,158 C384,158 392,110 422,110"/>
    <!-- selection -> population (next gen) -->
    <path d="M474,126 C474,196 60,196 60,128"/>
    <!-- exact points retrain surrogate -->
    <path d="M265,130 L265,76" stroke-dasharray="4 3"/>
  </g>
  <text x="282" y="106" font-size="9.5" fill="var(--text-faint)">přetrénuj model</text>
  <text x="200" y="206" font-size="9.5" fill="var(--text-faint)" text-anchor="start">smyčka generací → úspora drahých evaluací</text>
</svg>
:::

* **Úspora času** — drahá fitness `f` se zavolá jen pro *zlomek* populace; zbytek řeší `ŝ`. Při poměru např. 1 přesné na 10 odhadnutých klesne cena evaluací řádově.
* **Riziko** — *false optima*: model může nadhodnotit špatného jedince. Brání se tomu pravidelným *re-evaluováním* nejlepších kandidátů a *přetrénováním* surrogate na nových přesných bodech (aktivní učení).
* **V NAS** — kromě regresního surrogate se používají i *low-fidelity* odhady: trénink jen pár epoch, na podmnožině dat, nebo **sdílení vah** jedné velké „super-sítě", ze které se kandidáti jen *vyřezávají* a nemusí se trénovat každý zvlášť.

::: quiz "Proč se v surrogate-asistované evoluci nevyhodnocuje vše jen náhradním modelem?"
- [x] Chyba aproximace by zavedla evoluci k falešným optimům; periodické přesné evaluace model kalibrují.
> Ano. Bez přísunu pravdivých bodů evoluce „obelstí" nepřesný model a sbíhá k řešením, která model přeceňuje.
- [ ] Náhradní model nelze přetrénovat během běhu evoluce.
> Ne. Naopak — průběžné přetrénování novými přesnými body je jádrem model managementu.
- [ ] Přesná fitness je vždy rychlejší než dotaz na surrogate.
> Ne. Smysl surrogate je právě v tom, že dotaz na něj je o řády levnější než přesná evaluace.
:::

::: link "Jin, Y.: Surrogate-assisted evolutionary computation — Recent advances and future challenges (Swarm and Evolutionary Computation, 2011)" "https://www.sciencedirect.com/science/article/abs/pii/S2210650211000198"
:::

::: link "Jin, Olhofer, Sendhoff: A Framework for Evolutionary Optimization with Approximate Fitness Functions (IEEE Trans. Evol. Comput., 2002)" "https://ieeexplore.ieee.org/document/1027725"
:::

::: link "Elsken, Metzen, Hutter: Neural Architecture Search — A Survey (JMLR, 2019; zrychlení evaluace v NAS)" "https://jmlr.org/papers/v20/18-598.html"
:::

---

*Zdroj: BIN státnicové okruhy NBIO, VUT FIT. Externí reference: Jin, Y.: Surrogate-assisted evolutionary computation (Swarm and Evolutionary Computation, 2011); Jin, Olhofer, Sendhoff: A Framework for Evolutionary Optimization with Approximate Fitness Functions (IEEE TEC, 2002); Elsken, Metzen, Hutter: Neural Architecture Search — A Survey (JMLR, 2019).*
