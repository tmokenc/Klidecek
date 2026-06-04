---
title: Stavební bloky a využití
---

# Stavební bloky GNN a jejich využití

GNN se skládá z opakovaných **message-passing vrstev** (viz [[message-passing]]), případně doplněných o další bloky. Konkrétní vrstvy se liší hlavně tím, **jak agregují** sousedy:

- **GCN** — symetricky normalizovaná suma sousedů (váží podle stupňů uzlů).
- **GraphSAGE** — *sample & aggregate*: pro škálovatelnost vybere jen podmnožinu sousedů a agreguje ji (mean / max / LSTM). Umožňuje **induktivní** učení (i pro uzly, které model neviděl při tréninku).
- **GAT** — **attention**: místo prostého průměru se model naučí, *kteří* sousedé jsou důležitější, a váží je koeficienty *α*.

::: math
x_i' = W_1 x_i + \sum_{j \in \mathcal{N}(i)} \alpha_{i,j}\, W_2 x_j
:::

kde *α_ij* je naučená attention váha důležitosti souseda *j* pro uzel *i*. To dává flexibilnější message passing než pevné průměrování (myšlenka převzatá z transformerů → **graph transformers**).

## Graph pooling

Stejně jako CNN používají pooling nad pixely, GNN používají **graph pooling**: spojuje uzly, zmenšuje graf a vytváří **hierarchickou** reprezentaci. To umožňuje efektivnější výpočty na velkých grafech a hlavně **klasifikaci celého grafu** — z embeddingů jednotlivých uzlů se permutačně invariantní agregací (suma/průměr/max) získá jediný **graf-level** vektor. Tomuto závěrečnému kroku se v rámci MPNN říká **readout**.

## Tři úrovně úloh

Predikce v GNN se dělí podle toho, **co** klasifikujeme:

::: svg "Tři úrovně úloh GNN: vrchol / hrana / celý graf, s typickými aplikacemi"
<svg viewBox="0 0 540 230" font-family="ui-sans-serif, system-ui" font-size="11">
  <rect width="540" height="230" fill="var(--bg-inset)"/>

  <!-- three panels -->
  <g stroke="var(--line-strong)" stroke-width="1" fill="none">
    <rect x="14" y="40" width="160" height="150" rx="8"/>
    <rect x="190" y="40" width="160" height="150" rx="8"/>
    <rect x="366" y="40" width="160" height="150" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600" font-size="12">
    <text x="94" y="28">Vrchol (node)</text>
    <text x="270" y="28">Hrana (edge)</text>
    <text x="446" y="28">Celý graf</text>
  </g>

  <!-- PANEL 1: node classification -->
  <g stroke="var(--line-strong)" stroke-width="1">
    <line x1="55" y1="90" x2="100" y2="75"/>
    <line x1="55" y1="90" x2="70" y2="140"/>
    <line x1="100" y1="75" x2="135" y2="120"/>
    <line x1="70" y1="140" x2="135" y2="120"/>
  </g>
  <g stroke="var(--line-strong)" stroke-width="1">
    <circle cx="55" cy="90" r="11" fill="var(--accent)"/>
    <circle cx="100" cy="75" r="11" fill="var(--bg-card)"/>
    <circle cx="70" cy="140" r="11" fill="var(--accent)"/>
    <circle cx="135" cy="120" r="11" fill="var(--bg-card)"/>
  </g>
  <text x="94" y="178" text-anchor="middle" fill="var(--text-muted)" font-size="10">predikuj štítek uzlu</text>

  <!-- PANEL 2: edge / link prediction -->
  <g stroke="var(--line-strong)" stroke-width="1">
    <line x1="230" y1="90" x2="275" y2="75"/>
    <line x1="230" y1="90" x2="245" y2="140"/>
    <line x1="275" y1="75" x2="310" y2="120"/>
  </g>
  <line x1="245" y1="140" x2="310" y2="120" stroke="var(--accent)" stroke-width="2" stroke-dasharray="4 3"/>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="230" cy="90" r="11"/>
    <circle cx="275" cy="75" r="11"/>
    <circle cx="245" cy="140" r="11"/>
    <circle cx="310" cy="120" r="11"/>
  </g>
  <text x="270" y="178" text-anchor="middle" fill="var(--text-muted)" font-size="10">predikuj hranu / vztah</text>

  <!-- PANEL 3: whole-graph (pool into one node) -->
  <g stroke="var(--line-strong)" stroke-width="1">
    <line x1="406" y1="90" x2="451" y2="75"/>
    <line x1="406" y1="90" x2="421" y2="140"/>
    <line x1="451" y1="75" x2="486" y2="120"/>
    <line x1="421" y1="140" x2="486" y2="120"/>
  </g>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="406" cy="90" r="9"/>
    <circle cx="451" cy="75" r="9"/>
    <circle cx="421" cy="140" r="9"/>
    <circle cx="486" cy="120" r="9"/>
  </g>
  <g stroke="var(--accent)" stroke-width="1" fill="none" opacity="0.7">
    <line x1="406" y1="90" x2="446" y2="108"/>
    <line x1="451" y1="75" x2="446" y2="108"/>
    <line x1="421" y1="140" x2="446" y2="108"/>
    <line x1="486" y1="120" x2="446" y2="108"/>
  </g>
  <circle cx="446" cy="108" r="13" fill="var(--accent)" stroke="var(--line-strong)"/>
  <text x="446" y="112" text-anchor="middle" fill="var(--bg-inset)" font-size="10" font-weight="600">Σ</text>
  <text x="446" y="178" text-anchor="middle" fill="var(--text-muted)" font-size="10">pool → 1 vektor → štítek</text>

  <!-- bottom: applications -->
  <text x="14" y="216" fill="var(--text-faint)" font-size="10">aplikace: sociální sítě · doporučování · molekuly &amp; proteiny · znalostní grafy · obraz</text>
</svg>
:::

- **Node-level** — klasifikace jednotlivých uzlů (uživatelé sociální sítě, typ atomu v molekule, objekty v obraze).
- **Edge-level** — predikce vztahu mezi uzly (**link prediction**, typ vztahu); přímý základ **doporučovacích systémů**.
- **Graph-level** — klasifikace celého grafu po poolingu/readoutu (klasifikace molekul, vlastnosti chemických sloučenin, klasifikace scén).

## Permutační invariance — proč to celé funguje

Klíčová vlastnost GNN: výstup nezávisí na **pořadí**, ve kterém uzly očíslujeme. Přejmenujeme-li uzly (permutace), node-level výstupy se jen přerovnají stejnou permutací (**ekvivariance**), zatímco graf-level výstup zůstane **identický** (**invariance**). Tuto vlastnost zajišťuje právě to, že každá agregace (zpráv i závěrečný readout) je permutačně invariantní operace nad neuspořádanou množinou — proto graf nemusíme nijak „srovnávat do mřížky".

## Kde se GNN reálně používají

- **Doporučování** — produkty/přátelé jako link prediction nad bipartitním grafem uživatel–položka.
- **Molekulární biologie a chemie** — predikce vlastností molekul a interakcí proteinů (molekula = graf atomů a vazeb); GNN takto pomohly mj. při hledání nových antibiotik.
- **Sociální sítě** — klasifikace uživatelů, detekce komunit a šíření vlivu.
- **Znalostní grafy** — doplňování chybějících faktů (link prediction nad entitami a relacemi).
- **Doprava a obraz** — odhady dojezdových časů v mapách, scénové porozumění (objekty jako uzly, vztahy jako hrany).

::: quiz "Která vlastnost zaručuje, že GNN dá pro celý graf stejný výstup bez ohledu na očíslování uzlů?"
- [ ] Receptive field rostoucí s počtem vrstev
- [ ] Použití attention místo průměru
- [x] Permutační invariance agregace (a graf-level readoutu)
  > Suma/průměr/max nad neuspořádanou množinou sousedů i závěrečný readout jsou invariantní vůči permutaci → graf-level predikce se nezmění, node-level se jen přerovná (ekvivariance).
- [ ] Symetrická normalizace stupňů v GCN
:::

::: link "Sanchez-Lengeling et al.: A Gentle Introduction to Graph Neural Networks (Distill 2021)" "https://distill.pub/2021/gnn-intro/"
:::

::: link "Veličković et al.: Graph Attention Networks (GAT, ICLR 2018)" "https://arxiv.org/abs/1710.10903"
:::

---

*Zdroj: KNN státnicové okruhy NBIO, VUT FIT. Externí reference: Sanchez-Lengeling, B. et al.: „A Gentle Introduction to Graph Neural Networks" ([Distill 2021](https://distill.pub/2021/gnn-intro/)); Hamilton, W., Ying, R., Leskovec, J.: „Inductive Representation Learning on Large Graphs" (GraphSAGE, NeurIPS 2017, [arXiv:1706.02216](https://arxiv.org/abs/1706.02216)); Veličković, P. et al.: „Graph Attention Networks" (ICLR 2018, [arXiv:1710.10903](https://arxiv.org/abs/1710.10903)); Gilmer, J. et al.: „Neural Message Passing for Quantum Chemistry" (ICML 2017, [arXiv:1704.01212](https://arxiv.org/abs/1704.01212)).*
