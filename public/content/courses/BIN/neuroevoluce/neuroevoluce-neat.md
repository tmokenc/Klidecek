---
title: Zakódování a NEAT
---

# Zakódování a NEAT

**Neuroevoluce** je rodina technik, které **evolučním algoritmem** optimalizují *neuronovou síť* — její **váhy**, **topologii** nebo obojí. Místo gradientu se síť hledá *populačně*: jedinec (chromozom) kóduje síť, ta se ohodnotí *fitness* v cílovém prostředí a operátory **selekce, křížení a mutace** posouvají populaci k lepším řešením. Klíčové je, jak síť *zakódujeme* do chromozomu — to určuje škálovatelnost i to, jaké struktury vůbec dokáže evoluce objevit.

## Přímé vs. nepřímé kódování

* **Přímé kódování** — chromozom obsahuje *kompletní explicitní popis* sítě: pro každý uzel a každé spojení jeden záznam (gen). Je *jednoduché na implementaci* a *přesné*, ale **neškáluje** — u velkých sítí roste genom lineárně s počtem vah, takže prohledávaný prostor exploduje. NEAT je zástupcem této třídy.
* **Nepřímé kódování** — chromozom je *předpis (program), jak síť vytvořit*, ne síť sama. Krátký genotyp tak rozvine velký fenotyp.
  * **Celulární kódování** — start s primitivní sítí a stromem instrukcí (`přidej uzel`, `rozděl spoj`, `přidej propojení`), který ji *dostaví*.
  * **CPPN / HyperNEAT** — váhy cílové sítě (fenotyp) generuje pomocná síť **CPPN** (Compositional Pattern-Producing Network). CPPN dostane *geometrické souřadnice* dvou uzlů, např. `(x1, y1)` a `(x2, y2)`, a vrátí **váhu spojení** mezi nimi. Díky tomu lze pomocí malého genotypu popsat síť s *miliony* vah a využít prostorové **symetrie a opakování**.

::: math
\text{nepřímé: } |\text{genotyp}| \ll |\text{fenotyp}|, \qquad w_{ij} = \mathrm{CPPN}(x_i, y_i, x_j, y_j)
:::

## NEAT — evoluce topologií i vah

**NEAT** (*NeuroEvolution of Augmenting Topologies*) je *typický* neuroevoluční algoritmus s **přímým kódováním**, který evolvuje **zároveň strukturu i váhy**.

* **Genotyp** — lineární seznam *node genů* (vstup / skrytý / výstup) a *connection genů*. Každý connection gen nese: **od → do**, **váhu**, **příznak aktivní/zakázaný** a **inovační číslo**.
* **Fenotyp** — orientovaný graf funkční sítě sestavený z genotypu.
* **Fitness** — fenotyp se otestuje v úloze (často v simulátoru) a fitness udává, jak dobře úlohu vyřešil.

::: viz bin-neat "Minimální síť, kterou postupně rozšiřují mutace add-connection a add-node; dole je seznam connection genů (přímé kódování) s inovačními čísly."
:::

### Tři pilíře NEAT

1. **Počáteční minimalismus** — evoluce začíná *nejjednodušší* sítí (jen přímé propojení vstupů na výstupy). Skryté uzly a spoje přidávají **mutace** (`add-node`, `add-connection`) jen tehdy, když přinesou výhodu. Tím zůstává prohledávaný prostor co nejmenší.
2. **Křížení přes inovační čísla (historické značky)** — každá topologická mutace dostane *unikátní inovační číslo*. Při křížení se geny obou rodičů **seřadí podle těchto čísel**, takže algoritmus pozná, které geny si *odpovídají* a které jsou *přebytečné/disjunktní*. To řeší problém **competing conventions** (různé genomy kódující stejnou síť) a umožní bezpečně zkombinovat dvě odlišné topologie.
3. **Ochrana inovací speciací** — populace se dělí na **druhy** podle strukturální podobnosti. Nová topologie má zpočátku *nevyladěné váhy* a nízkou fitness; soutěží proto **jen ve svém druhu** (*fitness sharing*) a globální selekce ji hned nevyhladí — dostane čas se „vyladit".

::: quiz "K čemu slouží v NEAT inovační (historická) čísla?"
- [ ] Určují pořadí, ve kterém se uzly aktivují při dopředném průchodu sítí.
> Ne. Inovační čísla nemají vztah k aktivačnímu pořadí; ta plynou z topologie grafu.
- [x] Identifikují historický původ genu, takže lze správně zarovnat a křížit odlišné topologie.
> Ano. Stejné inovační číslo = gen téhož původu; podle nich se geny rodičů zarovnají a poznají se matching/disjoint/excess geny.
- [ ] Kódují přímo váhu spojení mezi dvěma uzly.
> Ne. Váha je samostatná položka connection genu; inovační číslo je jen identifikátor pro křížení.
:::

NEAT je proto vhodný tam, kde *neznáme dobrou architekturu předem* — typicky řízení agentů a *control tasks* (např. balancování dvojitého kyvadla, hry). Myšlenka „malého genotypu, který rozvine velký fenotyp" se v nepřímém kódování (CPPN/HyperNEAT) přenesla i do **evoluce architektur hlubokých sítí** (NAS).

::: link "Stanley, Miikkulainen: Evolving Neural Networks through Augmenting Topologies (Evolutionary Computation 10(2), 2002)" "https://nn.cs.utexas.edu/downloads/papers/stanley.ec02.pdf"
:::

::: link "Neuroevolution of augmenting topologies — Wikipedia (přehled NEAT, inovační čísla, speciace)" "https://en.wikipedia.org/wiki/Neuroevolution_of_augmenting_topologies"
:::

::: link "Stanley: Compositional Pattern Producing Networks — A Novel Abstraction of Development (nepřímé kódování, HyperNEAT)" "https://link.springer.com/article/10.1007/s10710-007-9028-8"
:::

---

*Zdroj: BIN státnicové okruhy NBIO, VUT FIT. Externí reference: Stanley, K. O., Miikkulainen, R.: Evolving Neural Networks through Augmenting Topologies (Evolutionary Computation 10(2), 2002); Stanley, K. O.: Compositional Pattern Producing Networks (Genetic Programming and Evolvable Machines, 2007); Wikipedia — Neuroevolution of augmenting topologies.*
