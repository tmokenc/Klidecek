---
title: Agent, prostředí a PEAS
---

# Agent, prostředí a PEAS

**Agent** je entita, která *vnímá* prostředí senzory a *jedná* na něj aktuátory. Toto je centrální abstrakce *agentního pojetí* umělé inteligence (Russell & Norvig, *AIMA*).

## Definice komponent

::: svg "Agent v interakci s prostředím: vjemy přicházejí senzory, akce odcházejí aktuátory."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <rect x="60" y="40" width="180" height="120" rx="10"/>
    <rect x="300" y="40" width="180" height="120" rx="10"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="13" font-weight="600">
    <text x="150" y="68">Agent</text>
    <text x="390" y="68">Prostředí</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="150" y="88">funkce: vjemy → akce</text>
    <text x="150" y="108">stav, paměť</text>
    <text x="150" y="128">program</text>
    <text x="390" y="88">stavy</text>
    <text x="390" y="108">přechody</text>
    <text x="390" y="128">dynamika</text>
  </g>
  <g stroke="var(--accent)" stroke-width="2" fill="none">
    <path d="M 300 100 L 240 100" marker-end="url(#arr1)"/>
    <path d="M 240 130 L 300 130" marker-end="url(#arr2)"/>
  </g>
  <defs>
    <marker id="arr1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
    <marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--text)" font-size="10">
    <text x="270" y="92" text-anchor="middle">vjem (percept)</text>
    <text x="270" y="148" text-anchor="middle">akce (action)</text>
    <text x="150" y="178" text-anchor="middle" fill="var(--text-muted)">senzory ←→ aktuátory</text>
  </g>
</svg>
:::

* **Vjem** (*percept*) — vstup od senzoru v okamžiku. Sekvence všech vjemů je *percept sequence*.
* **Akce** (*action*) — výstup, který agent provede aktuátorem.
* **Agentní funkce** — *teoretická* mapování `percept sequence → action`. Plný popis chování. Tabulka může být *nekonečně dlouhá*.
* **Agentní program** — *konkrétní implementace* agentní funkce (kód, neuronka, pravidla).
* **Realizace agenta** = agentní program + *architektura* (fyzický stroj).

Příklad: vysavač Roomba.

* Vjemy: senzory dotyku, optické, kamera, IR (4 typy).
* Akce: pohyb dopředu, otočení, vysávání, doplnění (kolem 3-4 akcí).
* Agentní program: software, který určuje, co dělat, podle vstupu.

### Velikost prostoru agentních funkcí

I pro jednoduchého agenta je počet **různých** agentních funkcí astronomický.

* Vysavač má 4 typy vjemů (`[A/B, Clean/Dirty]`) a 3 akce (`Right, Left, Suck`).
* Po 1 vjemu existuje `3⁴ = 81` funkcí (3 možné akce pro každý ze 4 vjemů).
* Po `k` vjemech existuje `3^(4^k)` funkcí.

Naším úkolem v AI je v tomto obrovském prostoru najít *racionální* (= dobrou) funkci.

## Racionální agent

**Racionální** agent jedná tak, aby maximalizoval **performance measure (PM)** — objektivní funkci ovlivňující kýžené chování.

Racionalita závisí na:

* **Performance measure PM** — co měříme jako *úspěch*. Klíčový design choice — viz [paperclip maximizer](https://en.wikipedia.org/wiki/Instrumental_convergence#Paperclip_maximizer).
* **Prior knowledge** — co agent ví předem o světě.
* **Dostupných akcích** — jaká je akční abeceda.
* **Sekvenci vjemů** — co dosud agent pozoroval.

> **Racionalita ≠ dokonalost.** Agent nemůže být zodpovědný za to, co *nemohl* pozorovat (los na silnici, vítr na střelnici). Racionalita = nejlepší rozhodnutí *při dostupné informaci*.

Racionální agent musí umět:

* **Sbírat informace** (exploration) — někdy se vyplatí prozkoumávat místo využívat.
* **Učit se** — adaptovat program podle zkušenosti.
* **Mít reflexy** (prior knowledge) — okamžité reakce na známé podněty.

## PEAS specifikace

**PEAS** = Performance, Environment, Actuators, Sensors. Standardní recept na specifikaci úlohy:

| Akronym | Co popisuje |
| :--: | :--- |
| **P**erformance | Co měříme jako úspěch. Konkrétní skalární metrika. |
| **E**nvironment | V jakém světě agent operuje. |
| **A**ctuators | Čím agent jedná. |
| **S**ensors | Čím agent vnímá. |

### Příklad: agent skládající zkoušku

* **P** — počet získaných bodů.
* **E** — učebna, otázky v testu.
* **A** — ruka držící propisku (zaškrtnutí A/B/C/D).
* **S** — oči pro přečtení otázky a možností.

### Příklad: autonomní auto (Russell & Norvig)

* **P** — bezpečnost, dodržení pravidel silničního provozu, komfort cestujících, rychlost cesty.
* **E** — silnice, ostatní auta, chodci, počasí.
* **A** — volant, plyn, brzda, ukazatele.
* **S** — kamery, lidar, GPS, akcelerometry, mikrofon.

## Vlastnosti prostředí

::: svg "Sedm dimenzí vlastností prostředí podle Russell & Norvig."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--text)" font-size="11">
    <text x="20" y="34" font-weight="600">Pozorovatelnost</text>
    <text x="200" y="34">plně</text>
    <text x="280" y="34" fill="var(--text-muted)">|</text>
    <text x="300" y="34">částečně pozorovatelné</text>
    <text x="20" y="62" font-weight="600">Determinismus</text>
    <text x="200" y="62">deterministické</text>
    <text x="320" y="62" fill="var(--text-muted)">|</text>
    <text x="340" y="62">stochastické</text>
    <text x="20" y="90" font-weight="600">Počet agentů</text>
    <text x="200" y="90">jeden agent</text>
    <text x="290" y="90" fill="var(--text-muted)">|</text>
    <text x="310" y="90">multiagentní (kooperace/soutěž)</text>
    <text x="20" y="118" font-weight="600">Epizodičnost</text>
    <text x="200" y="118">epizodické</text>
    <text x="290" y="118" fill="var(--text-muted)">|</text>
    <text x="310" y="118">sekvenční</text>
    <text x="20" y="146" font-weight="600">Dynamika</text>
    <text x="200" y="146">statické</text>
    <text x="280" y="146" fill="var(--text-muted)">|</text>
    <text x="300" y="146">semidynamické</text>
    <text x="400" y="146" fill="var(--text-muted)">|</text>
    <text x="420" y="146">dynamické</text>
    <text x="20" y="174" font-weight="600">Diskrétnost</text>
    <text x="200" y="174">diskrétní</text>
    <text x="280" y="174" fill="var(--text-muted)">|</text>
    <text x="300" y="174">spojité</text>
    <text x="20" y="202" font-weight="600">Znalost</text>
    <text x="200" y="202">známé</text>
    <text x="280" y="202" fill="var(--text-muted)">|</text>
    <text x="300" y="202">neznámé (modelu prostředí)</text>
  </g>
</svg>
:::

### Pozorovatelnost

* **Plně pozorovatelné** — agent vidí *všechny relevantní* aspekty stavu (šachy).
* **Částečně pozorovatelné** — agent ví jen, co prošlo senzory (poker, lokalizace robota). Agent si musí udržovat *belief state* — domněnku o aktuálním stavu. Viz [[castecna-pozorovatelnost]].

### Determinismus

* **Deterministické** — `stav + akce → jediný nový stav` (sudoku).
* **Stochastické** — výsledek akce je *náhodný* (kostky, vítr na zahradě). 
* **Jisté** = plně pozorovatelné + deterministické. Vše ostatní = **nejisté**.

### Počet agentů

* **Jeden agent** — řešíme jen vlastní cíl.
* **Multiagentní** — jen pokud PM jednoho agenta *závisí* na jiných. Pak buď **soutěž** (zero-sum hry) nebo **kooperace** (společný cíl). Detail v [[adversarial]].

### Epizodičnost

* **Epizodické** — akce ve dvou různých epizodách jsou *nezávislé* (klasifikace jednotlivých obrazů).
* **Sekvenční** — aktuální rozhodnutí ovlivňuje budoucnost (šachy, řízení auta).

### Dynamika

* **Statické** — prostředí se nemění, dokud agent přemýšlí.
* **Semidynamické** — prostředí se nemění, ale PM se *zhoršuje s časem* (šachy s hodinami).
* **Dynamické** — prostředí se *aktivně mění* (auto v provozu).

### Diskrétnost

* **Diskrétní** — konečný počet stavů/akcí/času (šachy).
* **Spojité** — `R^D` stavy nebo čas (robotika).

### Známost

* **Známé** — agent zná model přechodů. Pozor: *neznámé* ≠ *nepozorovatelné* — můžeme znát fyziku, ale nevidět všechno. A naopak — můžeme vidět vše, ale nevědět dynamiku.

## Příklad — klasifikace prostředí

| Úloha | Pozorov. | Determ. | Agenti | Epizod. | Dynam. | Diskrét. |
| :-- | :--: | :--: | :--: | :--: | :--: | :--: |
| Šachy | Plně | Det. | 2, soutěž | Sekv. | Semi | Diskr. |
| Poker | Část. | Stoch. | n, soutěž | Sekv. | Statické | Diskr. |
| Auto-řízení | Část. | Stoch. | n, mix | Sekv. | Dynam. | Spoj. |
| OCR (jednotlivý znak) | Plně | Det. | 1 | Epizod. | Statické | Spoj.→Diskr. |
| Robotická paže (montáž) | Část. | Stoch. | 1 | Sekv. | Dynam. | Spoj. |

Čím *více znaků doprava*, tím **těžší** úloha.

::: link "Russell & Norvig: AIMA — 4. vyd., kap. 2: Intelligent Agents" "http://aima.cs.berkeley.edu/"
:::

::: link "Stanford CS221 — Foundations: Modeling, Inference, Learning" "https://stanford-cs221.github.io/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Agentní pojetí* (Beneš). Externí reference: Russell, S. & Norvig, P.: *Artificial Intelligence — A Modern Approach* (4. vyd., Pearson 2020), kap. 2; Wooldridge, M.: *An Introduction to MultiAgent Systems* (Wiley 2009).*
