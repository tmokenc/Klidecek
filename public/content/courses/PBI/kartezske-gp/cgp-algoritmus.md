---
title: Prohledávací algoritmus a fitness
---

CGP nepoužívá klasický genetický algoritmus s populací a křížením, ale spoléhá na velmi úspornou **evoluční strategii `(1 + λ)`** — nejčastěji v konfiguraci `(1 + 4)`. Z jediného rodiče se mutací vytvoří `λ` potomků; z celé této `(1 + λ)`‑tice se vybere nejlepší jedinec, který se stane rodičem příští generace. Křížení se zpravidla nevyužívá, protože se ukázalo, že na grafové reprezentaci CGP většinou nepomáhá.

## Průběh algoritmu

1. **Inicializace** — náhodně se vygeneruje jeden jedinec (rodič) a ohodnotí se jeho fitness.
2. **Mutace** — vytvoří se `λ` kopií rodiče a každá se podrobí **bodové mutaci**: náhodně se změní zvolené procento genů genotypu, tedy buď propojovací gen (přepojení vstupu uzlu), nebo funkční gen (změna funkce uzlu). Měněné geny musí zůstat v platném rozsahu, aby fenotyp zůstal acyklický.
3. **Selekce a nahrazení** — ohodnotí se všichni potomci. Novým rodičem se stane **nejlepší potomek, pokud má fitness lepší nebo stejnou jako stávající rodič**; jinak rodič přežívá. Body 2–3 se opakují, dokud není dosaženo cíle nebo limitu generací.

::: svg "Evoluční strategie (1 + 4): rodič → 4 mutovaní potomci → selekce nejlepšího. Pravidlo „lepší nebo stejná fitness" dovoluje neutrální posun (tichá mutace v neaktivním uzlu)."
<svg viewBox="0 0 520 210" style="width:100%;display:block">
  <rect width="520" height="210" fill="var(--bg-inset)"/>
  <!-- parent -->
  <rect x="20" y="86" width="86" height="40" rx="6" fill="color-mix(in oklch, var(--accent) 25%, var(--bg-card))" stroke="var(--accent)" stroke-width="2"/>
  <text x="63" y="101" text-anchor="middle" font-size="12" font-family="var(--font-mono)" fill="var(--text)">rodič</text>
  <text x="63" y="116" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--accent)">f = 6</text>
  <!-- mutation arrows + offspring -->
  <g stroke="var(--line-strong)" stroke-width="1.2" fill="none" opacity="0.8">
    <line x1="106" y1="100" x2="250" y2="34"/>
    <line x1="106" y1="104" x2="250" y2="82"/>
    <line x1="106" y1="108" x2="250" y2="130"/>
    <line x1="106" y1="112" x2="250" y2="178"/>
  </g>
  <text x="150" y="56" font-size="10" font-family="var(--font-mono)" fill="var(--text-faint)">mutace</text>
  <!-- offspring boxes -->
  <g font-family="var(--font-mono)" font-size="11">
    <rect x="250" y="18" width="120" height="32" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="262" y="38" fill="var(--text-muted)">potomek 1 · f = 5</text>
    <rect x="250" y="66" width="120" height="32" rx="5" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="262" y="86" fill="var(--text)">potomek 2 · f = 7</text>
    <rect x="250" y="114" width="120" height="32" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="262" y="134" fill="var(--text-muted)">potomek 3 · f = 6</text>
    <rect x="250" y="162" width="120" height="32" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="262" y="182" fill="var(--text-muted)">potomek 4 · f = 3</text>
  </g>
  <!-- selection -->
  <line x1="370" y1="82" x2="430" y2="100" stroke="var(--accent)" stroke-width="1.8"/>
  <rect x="430" y="80" width="80" height="40" rx="6" fill="color-mix(in oklch, var(--accent) 22%, var(--bg-card))" stroke="var(--accent)" stroke-width="2"/>
  <text x="470" y="96" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">nový</text>
  <text x="470" y="110" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--accent)">rodič</text>
  <text x="380" y="78" font-size="10" font-family="var(--font-mono)" fill="var(--text-faint)">max f</text>
</svg>
:::

## Neutralita a tiché mutace

Pravidlo „**lepší nebo stejná** fitness" není kosmetické — je jádrem účinnosti CGP. Protože velká část uzlů je neaktivní, mnoho bodových mutací zasáhne pouze **neaktivní uzel** a fenotyp ani fitness se vůbec nezmění. Takovým mutacím se říká **neutrální (tiché) mutace** a procesu jejich hromadění **neutrální posun (neutral drift)**.

Když má nejlepší potomek stejnou fitness jako rodič, nahradí ho — genotyp se tedy mění, i když fenotyp zůstává totožný. Tím se prohledávání volně pohybuje po **plošinách (neutrálních sítích)** fitness krajiny a hromadí nekódující varianty, které mohou být pozdější mutací aktivovány. To je hlavní mechanismus, jak CGP **uniká z lokálních extrémů**. Experimentálně se ukázalo, že s neutrálním prohledáváním jsou účinné poměrně vysoké míry mutace (v Millerově práci kolem 14 %).

## Fitness funkce

Fitness kvantifikuje, jak dobře jedinec řeší zadaný problém; konkrétní podoba je vždy doménově závislá. Dvě typické aplikace:

**Logická syntéza kombinačních obvodů.** Porovnává se pravdivostní tabulka evolvovaného obvodu se specifikací; fitness je počet správných výstupních bitů přes všechny vstupní vektory (maximum = úplná shoda):

::: math
\text{Fitness} = \sum_{v \in V} \sum_{i=1}^{n_o} \overline{y_i(v) \oplus d_i(v)}
:::

kde `V` je množina testovacích vstupních vektorů, `n_o` počet primárních výstupů, `y_i(v)` skutečný a `d_i(v)` požadovaný výstup. Pro obvod s `K` vstupy je `|V| = 2^K`, takže nad cca 16 vstupů je úplné ověření tabulky exponenciálně neúnosné a používá se SAT řešení nebo aproximace na podmnožině vektorů.

**Symbolická regrese.** Hledá se výraz aproximující data; fitness je minimalizační, typicky střední kvadratická chyba (MSE) vůči trénovací množině `T`:

::: math
\text{Fitness} = \frac{1}{|T|} \sum_{j \in T} \left(y_j - d_j\right)^2
:::

kde `y_j` je hodnota vypočtená jedincem a `d_j` očekávaná hodnota `j`‑tého bodu. Cílem je stlačit chybu k nule.

::: quiz "Proč pravidlo „potomek nahradí rodiče i při stejné fitness" zásadně pomáhá CGP?"
- [ ] Zrychluje výpočet fitness, protože se přeskakuje ohodnocení rodiče.
  > Ne. Fitness rodiče i potomků se ohodnocuje stejně; pravidlo se týká výběru, ne rychlosti.
- [x] Umožňuje neutrální posun: genotyp se mění (přeskupení neaktivních uzlů) beze změny fenotypu, což pomáhá uniknout z lokálních extrémů.
  > Ano. Hromadění tichých mutací po neutrálních sítích je hlavní mechanismus diverzity a úniku z lokálních minim.
- [ ] Vynucuje křížení mezi rodičem a potomkem.
  > Ne. Standardní CGP křížení nepoužívá; pracuje pouze s mutací.
:::

::: link "Cartesian genetic programming: its status and future (Springer)" "https://link.springer.com/article/10.1007/s10710-019-09360-6"
:::

::: link "J. F. Miller, P. Thomson: Cartesian Genetic Programming (původní práce, PDF)" "https://neuro.bstu.by/ai/Data-mining/Fitness-landscape/miller00cartesian.pdf"
:::

*Zdroj: PBI státnicové okruhy NBIO, VUT FIT. Externí reference: J. F. Miller & P. Thomson – Cartesian Genetic Programming (EuroGP 2000); J. F. Miller – Cartesian genetic programming: its status and future (Genetic Programming and Evolvable Machines, 2020).*
