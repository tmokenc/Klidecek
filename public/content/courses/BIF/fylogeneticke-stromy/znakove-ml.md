---
title: Znakové metody a maximum likelihood
---

Distanční metody redukují data na matici a ztrácejí informaci o konkrétních pozicích. **Znakové metody** (character-based) pracují **přímo s vícenásobným zarovnáním** — každý sloupec zarovnání je jeden znak, a strom hodnotí podle toho, jak dobře vysvětluje pozorované znaky na listech.

## Maximální parsimonie

**Princip maximální parsimonie (úspornosti):** hledáme strom a ohodnocení vnitřních uzlů tak, aby **celkový počet změn znaků** (parsimony skóre) napříč stromem byl **minimální**. Úloha se dělí na dvě části:

- **Malý parsimony problém** — topologie stromu je **daná**, hledá se jen ohodnocení vnitřních uzlů. Řeší se polynomiálně. **Fitchův algoritmus** projde strom od listů ke kořeni: v každém uzlu vezme **průnik** množin stavů potomků; je-li prázdný, použije **sjednocení** a započítá **jednu změnu**. Vážená varianta se řeší **Sankoffovým algoritmem** dynamickým programováním v čase *O(kn)*.
- **Velký parsimony problém** — hledá se i samotná **topologie** z obrovského prostoru stromů. Je **NP-těžký**, proto se nasazují heuristiky prohledávající okolí stromu: **NNI** (záměna nejbližších sousedů), **SPR** a **TBR** (přestřižení a přepojení větve).

Slabinou parsimonie je, že **nezohledňuje délky větví** ani pravděpodobnostní evoluční model — pro daný sloupec jen počítá minimální počet záměn.

## Maximum likelihood

**Maximum likelihood (ML)** je statistický přístup: hledá takové **parametry modelu** (topologii, délky větví, parametry substitučního modelu), které **s nejvyšší věrohodností vysvětlují pozorovaná data** — tedy maximalizují *P(data | model)*.

::: math
L = \prod_{i=1}^{m} P\big(\text{sloupec}_i \mid \text{strom},\, \text{model}\big)
:::

Věrohodnost se počítá **sloupec po sloupci**; pro daný strom a délky větví ji efektivně spočítá **Felsensteinův (pruning) algoritmus** dynamickým programováním **od listů ke kořeni**. Model substitucí (JC69, K80, GTR…) udává pravděpodobnosti záměn za danou délku větve, takže ML přirozeně připouští **různé rychlosti evoluce** mezi větvemi i pozicemi. Hledání optimální topologie je opět NP-těžké; ML je považována za nejpřesnější metodu za cenu vysoké výpočetní náročnosti.

::: svg "Parsimonie (Fitch: minimum změn znaků) vs. maximum likelihood (substituční model, věrohodnost dat); kořenový vs. nekořenový strom"
<svg viewBox="0 0 540 230" style="width:100%;max-width:540px;display:block" xmlns="http://www.w3.org/2000/svg">
  <rect width="540" height="230" fill="var(--bg-inset)"/>
  <line x1="270" y1="14" x2="270" y2="216" stroke="var(--line)" stroke-width="0.7" stroke-dasharray="3 4"/>

  <text x="14" y="24" font-size="12" font-family="var(--font-mono)" fill="var(--text)">Maximalni parsimonie (Fitch)</text>
  <text x="14" y="40" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-faint)">jeden sloupec zarovnani: A A C C</text>

  <line x1="60"  y1="86" x2="92"  y2="120" stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="124" y1="86" x2="92"  y2="120" stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="170" y1="86" x2="202" y2="120" stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="234" y1="86" x2="202" y2="120" stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="92"  y1="120" x2="147" y2="160" stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="202" y1="120" x2="147" y2="160" stroke="var(--accent-line)" stroke-width="1.6"/>

  <circle cx="60"  cy="80" r="11" fill="var(--bg-card)" stroke="var(--line-strong)"/><text x="60"  y="84" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">A</text>
  <circle cx="124" cy="80" r="11" fill="var(--bg-card)" stroke="var(--line-strong)"/><text x="124" y="84" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">A</text>
  <circle cx="170" cy="80" r="11" fill="var(--bg-card)" stroke="var(--line-strong)"/><text x="170" y="84" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">C</text>
  <circle cx="234" cy="80" r="11" fill="var(--bg-card)" stroke="var(--line-strong)"/><text x="234" y="84" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">C</text>

  <circle cx="92"  cy="120" r="11" fill="var(--bg-card)" stroke="var(--accent)"/><text x="92"  y="124" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--text)">A</text>
  <circle cx="202" cy="120" r="11" fill="var(--bg-card)" stroke="var(--accent)"/><text x="202" y="124" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--text)">C</text>
  <circle cx="147" cy="160" r="11" fill="var(--accent)" stroke="var(--accent)"/><text x="147" y="164" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="white">A/C</text>
  <text x="147" y="190" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--text-muted)">prunik prazdny -&gt; 1 zmena</text>
  <text x="147" y="206" text-anchor="middle" font-size="10.5" font-family="var(--font-mono)" fill="var(--accent)">skore = 1 (min. zmen)</text>

  <text x="286" y="24" font-size="12" font-family="var(--font-mono)" fill="var(--text)">Maximum likelihood</text>
  <text x="286" y="40" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-faint)">delky vetvi t + subst. model</text>

  <line x1="330" y1="86" x2="362" y2="120" stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="394" y1="86" x2="362" y2="120" stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="440" y1="86" x2="472" y2="120" stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="504" y1="86" x2="472" y2="120" stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="362" y1="120" x2="417" y2="160" stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="472" y1="120" x2="417" y2="160" stroke="var(--accent-line)" stroke-width="1.6"/>

  <text x="338" y="104" font-size="8.5" font-family="var(--font-mono)" fill="var(--text-faint)">t1</text>
  <text x="408" y="104" font-size="8.5" font-family="var(--font-mono)" fill="var(--text-faint)">t2</text>

  <circle cx="330" cy="80" r="11" fill="var(--bg-card)" stroke="var(--line-strong)"/><text x="330" y="84" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">A</text>
  <circle cx="394" cy="80" r="11" fill="var(--bg-card)" stroke="var(--line-strong)"/><text x="394" y="84" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">A</text>
  <circle cx="440" cy="80" r="11" fill="var(--bg-card)" stroke="var(--line-strong)"/><text x="440" y="84" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">C</text>
  <circle cx="504" cy="80" r="11" fill="var(--bg-card)" stroke="var(--line-strong)"/><text x="504" y="84" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">C</text>

  <circle cx="362" cy="120" r="8" fill="var(--bg-card)" stroke="var(--accent)"/>
  <circle cx="472" cy="120" r="8" fill="var(--bg-card)" stroke="var(--accent)"/>
  <circle cx="417" cy="160" r="8" fill="var(--accent)" stroke="var(--accent)"/>
  <text x="417" y="190" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--text-muted)">Felsenstein: list -&gt; koren</text>
  <text x="417" y="206" text-anchor="middle" font-size="10.5" font-family="var(--font-mono)" fill="var(--accent)">max P(data | strom, model)</text>
</svg>
:::

## Kořenové vs. nekořenové stromy

NJ, parsimonie i ML obvykle produkují **nekořenové** stromy (znají jen topologii a délky hran, ne směr času). **Kořen** určuje evoluční směr a nejstaršího společného předka. Nejčastěji se zavádí pomocí **outgroup** — vědomě přidané vzdálenější, ale příbuzné linie (např. ryba do stromu savců); kořen leží na větvi k outgroup. Alternativou je **midpoint** zakořenění do poloviny nejdelší cesty.

::: svg "Kořenový strom má orientaci času od kořene k listům; nekořenový jen topologii a délky hran"
<svg viewBox="0 0 460 170" style="width:100%;max-width:460px;display:block" xmlns="http://www.w3.org/2000/svg">
  <rect width="460" height="170" fill="var(--bg-inset)"/>
  <text x="14" y="22" font-size="11.5" font-family="var(--font-mono)" fill="var(--text)">Korenovy</text>

  <circle cx="70" cy="40" r="6" fill="var(--accent)" stroke="var(--accent)"/>
  <text x="70" y="34" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="var(--text-muted)">koren</text>
  <line x1="70" y1="46" x2="40"  y2="86" stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="70" y1="46" x2="120" y2="86" stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="120" y1="86" x2="92"  y2="128" stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="120" y1="86" x2="150" y2="128" stroke="var(--accent-line)" stroke-width="1.6"/>
  <circle cx="120" cy="86" r="5" fill="var(--bg-card)" stroke="var(--accent)"/>
  <circle cx="40"  cy="86" r="9" fill="var(--bg-card)" stroke="var(--line-strong)"/><text x="40"  y="89" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--text)">A</text>
  <circle cx="92"  cy="128" r="9" fill="var(--bg-card)" stroke="var(--line-strong)"/><text x="92"  y="131" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--text)">B</text>
  <circle cx="150" cy="128" r="9" fill="var(--bg-card)" stroke="var(--line-strong)"/><text x="150" y="131" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--text)">C</text>
  <text x="14" y="152" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">cas: koren -&gt; listy</text>

  <line x1="232" y1="20" x2="232" y2="150" stroke="var(--line)" stroke-width="0.7" stroke-dasharray="3 4"/>
  <text x="252" y="22" font-size="11.5" font-family="var(--font-mono)" fill="var(--text)">Nekorenovy</text>

  <line x1="322" y1="85" x2="290" y2="50"  stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="322" y1="85" x2="290" y2="120" stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="378" y1="85" x2="412" y2="60"  stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="378" y1="85" x2="412" y2="118" stroke="var(--accent-line)" stroke-width="1.6"/>
  <line x1="322" y1="85" x2="378" y2="85"  stroke="var(--accent-line)" stroke-width="1.6"/>
  <circle cx="322" cy="85" r="5" fill="var(--bg-card)" stroke="var(--accent)"/>
  <circle cx="378" cy="85" r="5" fill="var(--bg-card)" stroke="var(--accent)"/>
  <circle cx="290" cy="50"  r="9" fill="var(--bg-card)" stroke="var(--line-strong)"/><text x="290" y="53"  text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--text)">A</text>
  <circle cx="290" cy="120" r="9" fill="var(--bg-card)" stroke="var(--line-strong)"/><text x="290" y="123" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--text)">B</text>
  <circle cx="412" cy="60"  r="9" fill="var(--bg-card)" stroke="var(--line-strong)"/><text x="412" y="63"  text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--text)">C</text>
  <circle cx="412" cy="118" r="9" fill="var(--bg-card)" stroke="var(--line-strong)"/><text x="412" y="121" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--text)">D</text>
  <text x="252" y="152" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">jen topologie + delky, bez smeru</text>
</svg>
:::

Spolehlivost větví se ověřuje **bootstrappingem**: sloupce zarovnání se náhodně losují s opakováním do stovek pseudosad, pro každou se sestaví strom a hodnota u uzlu udává, v kolika procentech replikací se daná větev objevila.

::: link "Wikipedia — Maximum parsimony (Fitch, malý vs. velký problém, NNI/SPR/TBR)" "https://en.wikipedia.org/wiki/Maximum_parsimony_(phylogenetics)"
:::

::: link "Wikipedia — Computational phylogenetics (maximum likelihood, Felsenstein pruning, bootstrap, outgroup)" "https://en.wikipedia.org/wiki/Computational_phylogenetics"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: Wikipedia (Maximum parsimony, Computational phylogenetics, Models of DNA evolution).*
