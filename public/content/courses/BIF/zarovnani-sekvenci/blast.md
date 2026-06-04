---
title: BLAST a heuristické vyhledávání
---

# BLAST a heuristické vyhledávání

Dynamické programování (NW, SW) dává optimální zarovnání, ale běží v čase $\mathcal{O}(nm)$. Při dotazu proti databázi o miliardách znaků (např. GenBank) znamená přesné zarovnání **dotaz × každá sekvence** zcela neúnosný výpočet. Proto se v praxi používají **heuristiky**, které prohledají jen *slibné* části prostoru — obětují garanci optima za řádové zrychlení.

## BLAST — tři fáze

**BLAST** (*Basic Local Alignment Search Tool*, Altschul a kol., 1990) staví na myšlence, že dobré zarovnání skoro vždy obsahuje krátký **přesný (nebo téměř přesný) úsek**. Proto nejdřív najde tyto "semínka" a teprve je rozšiřuje:

1. **Osévání (seeding).** Dotaz se rozdělí na **slova délky $W$** (k-mery; pro proteiny typicky $W = 3$, pro DNA $\approx 11$). Pro každé slovo se vygenerují **sousední slova** se skóre podobnosti (dle BLOSUM-62) nad prahem $T$. Tato slova se rychle vyhledají v indexované databázi → **word hits**.
2. **Rozšiřování (extension).** Každý hit se rozšiřuje po diagonále na obě strany. Rozšiřování se zastaví, jakmile kumulativní skóre klesne o **drop-off práh $X$** pod dosavadní maximum. Výsledkem je **HSP** (*High-scoring Segment Pair*) — lokálně optimální úsek.
3. **Ohodnocení (evaluation).** HSP se ohodnotí statisticky; nevýznamné se zahodí, konzistentní úseky na téže diagonále se spojí.

::: svg "Proč je DP proti databázi pomalé a jak BLAST zkracuje práci: seed (k-mer) → word hit → rozšíření na HSP s drop-off prahem X."
<svg viewBox="0 0 540 250" font-family="ui-sans-serif, system-ui" font-size="11">
  <rect width="540" height="250" fill="var(--bg-inset)"/>

  <!-- left: full DP grid (slow) -->
  <text x="100" y="22" text-anchor="middle" fill="var(--text-muted)" font-size="11">DP přes celou databázi</text>
  <g stroke="var(--line)" stroke-width="0.6">
    <rect x="30" y="34" width="140" height="100" fill="var(--bg-card)"/>
    <line x1="30" y1="59"  x2="170" y2="59"/>
    <line x1="30" y1="84"  x2="170" y2="84"/>
    <line x1="30" y1="109" x2="170" y2="109"/>
    <line x1="65"  y1="34" x2="65"  y2="134"/>
    <line x1="100" y1="34" x2="100" y2="134"/>
    <line x1="135" y1="34" x2="135" y2="134"/>
  </g>
  <text x="100" y="152" text-anchor="middle" fill="var(--text-faint)" font-size="10">O(n·m) — vyplní VŠE</text>
  <text x="100" y="167" text-anchor="middle" fill="var(--text-faint)" font-size="10">× miliony sekvencí = pomalé</text>

  <!-- arrow -->
  <line x1="180" y1="84" x2="218" y2="84" stroke="var(--accent)" stroke-width="1.6" marker-end="url(#blArr)"/>
  <text x="199" y="78" text-anchor="middle" fill="var(--accent)" font-size="9">BLAST</text>

  <!-- right: seeded diagonal -->
  <text x="380" y="22" text-anchor="middle" fill="var(--text-muted)" font-size="11">BLAST: jen kolem seedů</text>
  <g stroke="var(--line)" stroke-width="0.6">
    <rect x="240" y="34" width="280" height="100" fill="var(--bg-card)"/>
  </g>
  <!-- diagonal of one HSP -->
  <line x1="270" y1="44" x2="500" y2="124" stroke="var(--line-strong)" stroke-width="0.8" stroke-dasharray="2 3"/>
  <!-- seed (exact word hit) -->
  <rect x="350" y="78" width="34" height="12" rx="2" fill="var(--accent)"/>
  <text x="367" y="102" text-anchor="middle" fill="var(--accent)" font-size="9">seed (k-mer, W)</text>
  <!-- extension both ways -->
  <rect x="318" y="68" width="32" height="12" rx="2" fill="color-mix(in oklch, var(--accent) 45%, var(--bg-card))"/>
  <rect x="384" y="89" width="32" height="12" rx="2" fill="color-mix(in oklch, var(--accent) 45%, var(--bg-card))"/>
  <text x="280" y="60" fill="var(--text-faint)" font-size="9">← rozšíření</text>
  <text x="430" y="116" fill="var(--text-faint)" font-size="9">rozšíření →</text>

  <!-- drop-off cue -->
  <text x="380" y="152" text-anchor="middle" fill="var(--text-faint)" font-size="10">stop, když skóre klesne o X pod max → HSP</text>

  <!-- sensitivity vs speed tradeoff bar -->
  <text x="270" y="194" text-anchor="middle" fill="var(--text-muted)" font-size="11">kompromis: parametry W a T</text>
  <line x1="60" y1="214" x2="480" y2="214" stroke="var(--line-strong)" stroke-width="1"/>
  <circle cx="120" cy="214" r="4" fill="var(--accent)"/>
  <text x="120" y="234" text-anchor="middle" fill="var(--text-faint)" font-size="9">malé W, nízké T</text>
  <text x="120" y="246" text-anchor="middle" fill="var(--text-faint)" font-size="9">citlivé, pomalé</text>
  <circle cx="420" cy="214" r="4" fill="var(--accent)"/>
  <text x="420" y="234" text-anchor="middle" fill="var(--text-faint)" font-size="9">velké W, vysoké T</text>
  <text x="420" y="246" text-anchor="middle" fill="var(--text-faint)" font-size="9">rychlé, méně citlivé</text>

  <defs>
    <marker id="blArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Statistická významnost: E-value

Jak poznáme, že je HSP **biologicky významný**, a ne náhodná shoda? Slouží k tomu **E-value** — *očekávaný počet* zarovnání se skóre $\ge S$, která bychom v databázi dané velikosti našli **čistě náhodou**. Podle **Karlin-Altschulovy rovnice**:

::: math
E = K \, m \, n \, e^{-\lambda S}
:::

kde $m$ je délka dotazu, $n$ velikost databáze a $K, \lambda$ jsou parametry odvozené ze skórovacího systému a složení sekvencí. **Nízká E-value (např. $< 10^{-5}$) = významný nález**; výchozí práh BLAST je $E = 10$. E-value roste s velikostí databáze — tentýž zásah je v menší databázi významnější.

## FASTA a kompromis citlivost vs. rychlost

Starší **FASTA** (Lipman & Pearson, 1985) je rovněž heuristika: hledá souvislé přesné k-tice (*k-tuples*), spojuje je do diagonál a nejlepší úseky dorovnává omezeným DP. Oproti FASTA bývá BLAST rychlejší díky sousedním slovům a brzkému přerušení.

Klíčový je **kompromis citlivost vs. rychlost** řízený parametry $W$ a $T$: **malé $W$ / nízké $T$** najde víc semínek → **citlivější**, ale **pomalejší**; **velké $W$ / vysoké $T$** je **rychlejší**, ale přehlédne slabší homology. Heuristika tak nemá garanci optima jako SW, zato běží řádově rychleji.

::: quiz "Co znamená E-value 1e-40 u zásahu v BLAST?"
- [x] Takový (nebo lepší) zásah bychom v databázi té velikosti čekali náhodou jen ~10⁻⁴⁰krát → silně významný
  > E-value = očekávaný počet náhodných zarovnání se skóre ≥ S; čím nižší, tím nepravděpodobnější je náhoda.
- [ ] Pravděpodobnost, že je zarovnání správně, je 1e-40
  > E-value není pravděpodobnost správnosti, ale očekávaný počet náhodných shod; nízká hodnota svědčí o významnosti.
- [ ] Zásah je nevýznamný, protože hodnota je velmi malá
  > Naopak — malá E-value znamená velmi významný nález.
:::

::: link "Altschul et al. (1990), J. Mol. Biol. — Basic Local Alignment Search Tool" "https://doi.org/10.1016/S0022-2836(05)80360-2"
:::

::: link "NCBI BLAST Glossary (E-value, HSP, neighborhood threshold)" "https://www.ncbi.nlm.nih.gov/books/NBK62051/"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: Altschul et al. (1990) J. Mol. Biol. 215:403; NCBI BLAST Glossary (NBK62051); Lipman & Pearson (1985) Science 227:1435 (FASTA); Karlin & Altschul (1990) PNAS.*
