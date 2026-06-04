---
title: Problém škálovatelnosti
---

# Problém škálovatelnosti

S rostoucí velikostí obvodu narůstá obtížnost evolučního návrhu **dvěma nezávislými směry najednou** — proto je škálovatelnost považována za nejvážnější překážku v evolučním návrhu obvodů. Rozlišujeme dva druhy:

- **Škálovatelnost reprezentace** — složitý obvod vyžaduje *dlouhý chromozom*, čímž roste prohledávací prostor kandidátních řešení. Velký a členitý prostor činí EA neefektivním.
- **Škálovatelnost vyhodnocení** — doba ohodnocení jednoho kandidáta roste **exponenciálně** s počtem vstupů. Pro $K$ vstupů má pravdivostní tabulka $2^K$ řádků; při 20 vstupech je nutné vyhodnotit přes milion kombinací *na jednoho jedince*. U analogových obvodů navíc jediná SPICE simulace trvá sekundy až minuty.

::: math
T_{\text{generace}} \;=\; \underbrace{|\text{populace}|}_{\text{jedinci}} \;\times\; \underbrace{2^{K}}_{\text{řádků tabulky}} \;\times\; \underbrace{t_{\text{sim}}}_{\text{čas/řádek}}
:::

::: svg "Dvojí růst obtížnosti (chromozom + pravdivostní tabulka) a tři skupiny řešení"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <rect width="540" height="240" fill="var(--bg-inset)"/>

  <text x="14" y="22" fill="var(--text)" font-size="12" font-weight="600">Problém: roste obojí</text>

  <!-- chromozom: krátký vs dlouhý -->
  <text x="14" y="42" fill="var(--text-muted)" font-size="10">chromozom (reprezentace)</text>
  <g>
    <rect x="14" y="48" width="14" height="14" fill="var(--accent-soft)" stroke="var(--line-strong)"/>
    <rect x="30" y="48" width="14" height="14" fill="var(--accent-soft)" stroke="var(--line-strong)"/>
    <rect x="46" y="48" width="14" height="14" fill="var(--accent-soft)" stroke="var(--line-strong)"/>
    <text x="66" y="59" fill="var(--text-faint)" font-size="10">malý obvod</text>
  </g>
  <g>
    <rect x="14" y="70" width="14" height="14" fill="var(--accent-soft)" stroke="var(--line-strong)"/>
    <rect x="30" y="70" width="14" height="14" fill="var(--accent-soft)" stroke="var(--line-strong)"/>
    <rect x="46" y="70" width="14" height="14" fill="var(--accent-soft)" stroke="var(--line-strong)"/>
    <rect x="62" y="70" width="14" height="14" fill="var(--accent-soft)" stroke="var(--line-strong)"/>
    <rect x="78" y="70" width="14" height="14" fill="var(--accent-soft)" stroke="var(--line-strong)"/>
    <rect x="94" y="70" width="14" height="14" fill="var(--accent-soft)" stroke="var(--line-strong)"/>
    <rect x="110" y="70" width="14" height="14" fill="var(--accent-soft)" stroke="var(--line-strong)"/>
    <text x="130" y="81" fill="var(--text-faint)" font-size="10">velký obvod</text>
  </g>

  <!-- exponenciální křivka 2^K -->
  <text x="240" y="42" fill="var(--text-muted)" font-size="10">vyhodnocení ~ 2^K řádků</text>
  <line x1="248" y1="118" x2="248" y2="50" stroke="var(--line-strong)" stroke-width="1"/>
  <line x1="248" y1="118" x2="370" y2="118" stroke="var(--line-strong)" stroke-width="1"/>
  <path d="M 248,116 Q 330,116 350,58 Q 356,52 366,50" fill="none" stroke="var(--accent)" stroke-width="1.6"/>
  <text x="252" y="62" fill="var(--accent)" font-size="9">2^K</text>
  <text x="300" y="130" fill="var(--text-faint)" font-size="9">počet vstupů K →</text>

  <!-- oddělovač -->
  <line x1="14" y1="146" x2="526" y2="146" stroke="var(--line)" stroke-width="1"/>
  <text x="14" y="164" fill="var(--text)" font-size="12" font-weight="600">Řešení</text>

  <!-- tři boxy řešení -->
  <g>
    <rect x="14" y="172" width="156" height="56" rx="6" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2"/>
    <text x="22" y="188" fill="var(--accent)" font-size="11" font-weight="600">Funkční úroveň</text>
    <text x="22" y="203" fill="var(--text-muted)" font-size="9">stavebními bloky místo hradel;</text>
    <text x="22" y="216" fill="var(--text-muted)" font-size="9">kratší chromozom</text>
  </g>
  <g>
    <rect x="186" y="172" width="160" height="56" rx="6" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2"/>
    <text x="194" y="188" fill="var(--accent)" font-size="11" font-weight="600">Dekompozice</text>
    <text x="194" y="203" fill="var(--text-muted)" font-size="9">rozděl na sub-obvody,</text>
    <text x="194" y="216" fill="var(--text-muted)" font-size="9">inkrementální evoluce</text>
  </g>
  <g>
    <rect x="362" y="172" width="164" height="56" rx="6" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2"/>
    <text x="370" y="188" fill="var(--accent)" font-size="11" font-weight="600">Vývin + aproximace</text>
    <text x="370" y="203" fill="var(--text-muted)" font-size="9">předpis pro stavbu (development),</text>
    <text x="370" y="216" fill="var(--text-muted)" font-size="9">trénovací množina, SAT/BDD</text>
  </g>
</svg>
:::

## Řešení škálovatelnosti reprezentace

Cílem je **zkrátit chromozom** a vložit do metody znalost o problému:

- **Evoluce na funkční úrovni** — stavebními kameny nejsou jednotlivá hradla, ale větší **funkční bloky** (sčítačky, multiplexory, komparátory). Kratší chromozom popisuje obvod ze složitějších primitiv.
- **Nepřímé (vývojové) kódování a vývin (development)** — evoluce hledá *pravidla* tvorby obvodu (L-systémy, celulární automaty). Rozsáhlé, **modulární a opakující se** struktury (matice filtrů, kaskády zesilovačů) lze popsat velmi krátkým chromozomem.
- **Dekompozice problému (divide & conquer)** — složitý systém se rozdělí na menší podobvody, ty se evolvují samostatně a poté složí. *Funkcionální dekompozice* dělí podle logických podsystémů (8bitová sčítačka z evolvovaných 1bitových plných sčítaček), *strukturální dekompozice* dělí na úrovni hardwarové mřížky.
- **Inkrementální evoluce** — řešení se buduje postupně, dílčí výsledky se znovu používají.

## Řešení škálovatelnosti vyhodnocení

Cílem je **zlevnit ohodnocení** jednoho kandidáta, místo úplného otestování všech $2^K$ kombinací:

- **Vhodná trénovací množina** — fitness se počítá jen nad reprezentativní podmnožinou testovacích vektorů (trénovací data); finální řešení se ověří na testovací množině. Množina se může dynamicky měnit (**koevoluce testovacích vektorů**).
- **Odhad (aproximace) fitness** — zrychlené modely hodnocení místo přesné simulace každé generace.
- **Formální verifikace** — pokud existuje plně funkční referenční řešení, lze místo simulace tabulky použít **SAT/SMT solvery** nebo **binární rozhodovací diagramy (BDD)** k formálnímu důkazu ekvivalence.

> EA negarantuje nalezení řešení s požadovanými vlastnostmi — tyto techniky pravděpodobnost úspěchu zvyšují, ale neručí za ni.

## Adaptace a kalibrace na reálném HW {tier=extra}

Speciální případ je využití inherentních vlastností hardwaru bez přesného matematického modelu. **Evoluční kalibrace** analogového frekvenčního filtru na reálném čipu: výrobní tolerance posouvají charakteristiku, a tak algoritmus hledá optimální konfiguraci digitálního kalibračního registru *přímo na čipu* a evolučně doladí filtr do specifikace pro každý konkrétní kus křemíku — bez nutnosti simulovat parazitní kapacity.

::: link "Sekanina, L.: Evolvable Components (Springer, 2004) / scalable EHW overview" "https://link.springer.com/article/10.1007/s00500-015-1636-2"
:::

::: link "Evolvable hardware — scalability (Wikipedia)" "https://en.wikipedia.org/wiki/Evolvable_hardware"
:::

---

*Zdroj: BIN státnicové okruhy NBIO, VUT FIT. Externí reference: A projection-based decomposition for the scalability of evolvable hardware (Soft Computing, 2015); Evolvable hardware (Wikipedia); Miller, J.F.: Cartesian Genetic Programming (Springer, 2011).*
