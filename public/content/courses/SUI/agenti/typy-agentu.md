---
title: Typy agentů podle struktury programu
---

# Typy agentů podle struktury programu

Agenti se rozdělují podle toho, *jak* agentní program rozhoduje o akcích. Russell & Norvig (AIMA, kap. 2) definují **čtyři základní typy** se vzrůstající sofistikovaností, plus *učící se* agent jako kolmou kategorii.

## 1. Reaktivní agent (simple reflex)

::: svg "Reaktivní agent: vjem → pravidlo → akce. Žádná paměť."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="30" y="40" width="80" height="60" rx="6"/>
    <rect x="170" y="40" width="120" height="60" rx="6"/>
    <rect x="350" y="40" width="80" height="60" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="70" y="68">vjem</text>
    <text x="70" y="84" fill="var(--text-muted)" font-size="9">senzor</text>
    <text x="230" y="64">Match condition</text>
    <text x="230" y="80" fill="var(--text-muted)" font-size="9">if X then Y</text>
    <text x="230" y="94" fill="var(--text-muted)" font-size="9">rules</text>
    <text x="390" y="68">akce</text>
    <text x="390" y="84" fill="var(--text-muted)" font-size="9">aktuátor</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.8" fill="none">
    <path d="M 110 70 L 165 70"/>
    <path d="M 290 70 L 345 70"/>
  </g>
  <text x="270" y="140" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">Bez paměti vjemů — rozhoduje podle aktuálního vjemu.</text>
</svg>
:::

* **Nemá historii** vjemů — rozhoduje jen podle *aktuálního* vjemu.
* Implementace: tabulka `if vjem then akce`. *Condition-action rules*.
* **Selhává** v částečně pozorovatelných prostředích — nedokáže rozlišit stavy, které vypadají stejně, ale vyžadují různé akce.

### Příklad

Vysavač, který vidí jen *aktuální* políčko:
```
if Dirty then Suck
else if AtA then Right
else Left
```

Funguje v *jednoduchém* prostředí — ale když má jen dvě políčka a oboje jsou čisté, vysavač *navždy* pendluje vlevo-vpravo bez ukončení (nemá si jak zapamatovat, že úkol je hotový).

## 2. Reaktivní agent s modelem (model-based reflex)

* Udržuje si **vnitřní stav** (paměť) o tom, *co se stalo*.
* Má **model světa**: jak akce mění stav (přechodový model) a jak vjemy souvisí se stavem.
* Stav se aktualizuje: `new_state = update(old_state, action, percept)`.

### Příklad

Vysavač si pamatuje, *která* políčka už vysál → ví, kdy skončit.

> Pro plnou pozorovatelnost ⇒ stačí *aktuální vjem* (stav světa je vidět). Pro částečnou pozorovatelnost potřebujeme *paměť* a *model* k udržování *belief state*. Viz [[castecna-pozorovatelnost]].

## 3. Agent řízený cílem (goal-based)

* Kromě modelu světa ví, *jaký cíl* se snaží dosáhnout.
* Rozhoduje pomocí **prohledávání** ([[neinformovane]], [[informovane]]) nebo **plánování** — co se *stane*, když provedu akci, a vede mě to k cíli?
* Flexibilnější než reaktivní — když se cíl změní, jen *nahradíme cíl* (např. „Jeď do Brna" → „Jeď do Prahy"); akce se odvodí samy.

### Příklad

* Vysavač s cílem *„všechna políčka čistá"* — sám si naplánuje cestu napříč místností.
* Navigace v autě s cílem *„dojet do cíle"* — algoritmus prohledávání najde cestu.

Tato kategorie zahrnuje většinu klasické *symbolické AI* — STRIPS planování, hierarchical task networks atd.

## 4. Agent řízený užitkem (utility-based)

* **Cíl** je *binární* (dosaženo / nedosaženo). **Užitek** je *spojitý* — některá řešení jsou *lepší* než jiná.
* Definuje **utility function** `U(s)` na stavech.
* Cíl: *maximalizovat očekávaný užitek* (expected utility).

### Proč užitek a ne jen cíl?

* **Kompromisy mezi cíli** — rychlejší cesta vs. bezpečnější; chutnější jídlo vs. zdravější.
* **Nejistota** — při náhodě v prostředí se počítá *očekávaný* užitek `E[U] = Σ p(s) U(s)`.
* **Kontinuální vylepšování** — i když jsme cíle dosáhli, lepší řešení existuje.

### Vztah PM ↔ utility

Pokud `U(s) = PM(s)` pro každý stav, je agent **plně racionální** (jeho cíle souhlasí s objektivem prostředí). V praxi se může lišit:

* **Mis-aligned utility** — chtěli jsme „auto co nezraní lidi", agent se naučil „auto co stojí" (technický splnění, prakticky nic). Toto je *AI alignment problem*.

## 5. Učící se agent

Není to typ chování *kolmý k* předchozím — *jakýkoli* z agentů 1–4 může být *navíc* učící se.

::: svg "Učící se agent: kromě performance elementu má kritika a učící prvek."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="30" y="30" width="180" height="60" rx="8"/>
    <rect x="240" y="30" width="180" height="60" rx="8"/>
    <rect x="30" y="120" width="180" height="60" rx="8"/>
    <rect x="240" y="120" width="180" height="60" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="120" y="56" font-size="12" font-weight="600">Performance element</text>
    <text x="120" y="74" font-size="10" fill="var(--text-muted)">výběr akce (původní program)</text>
    <text x="330" y="56" font-size="12" font-weight="600">Critic</text>
    <text x="330" y="74" font-size="10" fill="var(--text-muted)">odměna / hodnocení</text>
    <text x="120" y="146" font-size="12" font-weight="600">Learning element</text>
    <text x="120" y="164" font-size="10" fill="var(--text-muted)">navrhuje úpravy</text>
    <text x="330" y="146" font-size="12" font-weight="600">Problem generator</text>
    <text x="330" y="164" font-size="10" fill="var(--text-muted)">explorace, návrh úloh</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <path d="M 210 60 L 240 60"/>
    <path d="M 330 90 L 330 120"/>
    <path d="M 210 150 L 120 150 L 120 90" stroke-dasharray="3 3"/>
    <path d="M 330 180 L 330 200 L 120 200 L 120 90" stroke-dasharray="3 3"/>
  </g>
  <text x="225" y="220" text-anchor="middle" font-size="10" fill="var(--text-muted)">Učí se = experimentování (PG) → akce → výsledek (critic) → úprava (LE).</text>
</svg>
:::

* **Performance element** — *aktuální* agentní program (typ 1-4).
* **Critic** — hodnotí, jak daleko jsme od *fixního* standardu výkonu (bolest, hlad, odměna z RL).
* **Learning element** — navrhuje *změny v agentním programu* na základě hodnocení.
* **Problem generator** — vymýšlí *experimenty* (explorační akce, které by jinak nevypadaly výhodně, ale dají poznatky). Bez nich agent uvázne v lokálním optimu.

Toto je vlastně architektura **reinforcement learningu** ([[rl-framework]]) — critic = reward signál, learning element = update policy/Q-funkce.

::: viz agent-decision-flow "Vyberte typ agenta (reflex / model / goal / utility / learning) a stav vacuum world; vidíte percept → vnitřní komponenty → akci."
:::

## Srovnání

| Typ | Paměť | Model | Cíl | Užitek | Učení |
| :-- | :--: | :--: | :--: | :--: | :--: |
| Reflexní | ✗ | ✗ | ✗ | ✗ | ✗ |
| S modelem | ✓ | ✓ | ✗ | ✗ | ✗ |
| Cílový | ✓ | ✓ | ✓ | ✗ | ✗ |
| Užitkový | ✓ | ✓ | ✓ | ✓ | ✗ |
| Učící se | ✓ | ✓ | ± | ± | ✓ |

S každou úrovní *roste flexibilita* — ale i *složitost* implementace.

## Moderní agenti — LLM-based

Aktuální *LLM agenti* (Auto-GPT, Devin, ChatGPT s tools) jsou hybridem: 

* **Performance element** = jazykový model + tool-use (web search, kód, kalkulačka).
* **Critic** = self-reflection, RLHF feedback.
* **Cíl** je definován v *prompt* (instruction).
* **Učení** může probíhat *online* (in-context learning) nebo *offline* (fine-tuning).

Detail v [[llm]] a [[rl-llm-rlhf]].

::: link "AIMA — Russell & Norvig, kap. 2.4: Structure of Agents" "http://aima.cs.berkeley.edu/"
:::

::: link "Lilian Weng: LLM Powered Autonomous Agents (2023)" "https://lilianweng.github.io/posts/2023-06-23-agent/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Agentní pojetí* (Beneš). Externí reference: Russell, S. & Norvig, P.: *AIMA* (4. vyd., 2020), kap. 2.4; Wooldridge, M.: *An Introduction to MultiAgent Systems* (Wiley 2009); Lilian Weng: *LLM Powered Autonomous Agents* (2023).*
