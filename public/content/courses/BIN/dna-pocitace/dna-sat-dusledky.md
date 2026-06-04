---
title: DNA a SAT, důsledky
---

Po Adlemanově úspěchu se ukázalo, že stejný přístup je obecnější. Roku 1995 R. Lipton popsal, jak DNA řešit **SAT** — vzorový NP-úplný problém splnitelnosti booleovské formule v CNF. Schéma je analogické HPP, jen DNA tentokrát nereprezentuje cesty v grafu, ale **pravdivostní ohodnocení proměnných**.

## SAT pomocí DNA

Každé proměnné `xᵢ` přiřadíme **dvě** krátké sekvence — jednu pro `TRUE`, druhou pro `FALSE`. Smícháním a ligací vznikne v jedné zkumavce **knihovna všech `2ⁿ` ohodnocení** najednou (každá molekula = jedno přiřazení hodnot všem proměnným). Pak se postupuje **klauzuli po klauzuli**: pro každou klauzuli se afinitní separací **odstraní** všechny molekuly, které ji nesplňují. Po zpracování všech klauzulí:

- zůstane-li **aspoň jedna** molekula ⟹ formule je **splnitelná** (a molekula kóduje svědka),
- nezůstane-li **žádná** ⟹ formule je **nesplnitelná**.

::: math
\Phi = (x_1 \lor \lnot x_2) \land (x_2 \lor x_3)
\quad\xrightarrow{\;2^n\text{ ohodnocení}\;}\quad
\text{filtr klauzulí} \Rightarrow \text{přežijí jen splňující}
:::

Tím se NP-úplný problém převede z **exponenciálního času** (klasické sekvenční hledání) na **konstantní/lineární počet laboratorních kroků** — za cenu exponenciálního počtu molekul, které musí existovat současně. To je jádro důsledku pro informatiku i jeho meze.

## Masivní paralelismus vs. exponenciální objem

Síla je v hustotě a paralelismu: v jednom mililitru roztoku se vejdou řádově **10¹⁸ molekul** DNA, takže prostor kandidátů „vznikne" prakticky zdarma a všechny větve výpočtu běží naráz. Háček je, že **prostor řešení NP-úplných úloh roste exponenciálně** (`2ⁿ`), a tudíž exponenciálně roste i **množství potřebné DNA**.

::: svg "Pevný paralelismus zkumavky (~10¹⁸ molekul / ml) naráží na exponenciální růst počtu kandidátů 2ⁿ; nad ~60 proměnnými hmotnost potřebné DNA přesáhne praktické meze."
<svg viewBox="0 0 540 200" style="width:100%;display:block">
  <rect width="540" height="200" fill="var(--bg-inset)"/>
  <text x="12" y="18" font-size="11" font-family="var(--font-mono)" fill="var(--text-faint)">počet kandidátů a hmotnost DNA roste jako 2ⁿ (log osa)</text>

  <!-- axes -->
  <line x1="44" y1="30" x2="44" y2="160" stroke="var(--line-strong)" stroke-width="0.75"/>
  <line x1="44" y1="160" x2="510" y2="160" stroke="var(--line-strong)" stroke-width="0.75"/>
  <text x="500" y="176" text-anchor="end" font-size="10" font-family="var(--font-mono)" fill="var(--text-faint)">proměnné n →</text>

  <!-- capacity ceiling: ~10^18 molecules per ml -->
  <line x1="44" y1="70" x2="510" y2="70" stroke="var(--accent-line)" stroke-width="1" stroke-dasharray="4 3"/>
  <text x="50" y="65" font-size="9.5" font-family="var(--font-mono)" fill="var(--accent-line)">strop 1 zkumavky ≈ 10¹⁸ molekul / ml</text>

  <!-- exponential curve 2^n -->
  <path d="M44,158 L110,150 L176,134 L242,110 L308,78 L374,46 L440,22 L500,14"
        fill="none" stroke="var(--accent)" stroke-width="2"/>
  <!-- crossing marker: 2^n meets the ~10^18/ml ceiling at n = log2(10^18) ≈ 60 → x = 44 + 4.95·60 ≈ 341 -->
  <circle cx="341" cy="70" r="4" fill="var(--accent)"/>
  <text x="349" y="62" font-size="9.5" font-family="var(--font-mono)" fill="var(--accent)">n≈60: 1 ml už nestačí</text>

  <!-- n labels -->
  <text x="44" y="174" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">0</text>
  <text x="242" y="174" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">40</text>
  <text x="440" y="174" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">80</text>

  <!-- right annotation -->
  <text x="460" y="40" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-muted)">2ⁿ</text>
  <text x="12" y="100" font-size="10" font-family="var(--font-mono)" fill="var(--text-faint)">molekul</text>
</svg>
:::

Protože molární množství škáluje s `2ⁿ`, narazí přístup brzy na fyzikální zeď: rozšíření Adlemanova schématu na řád stovek vrcholů (či desítek až nízkých stovek proměnných) by vyžadovalo **hmotnost DNA srovnatelnou s hmotností Země**. J. Hartmanis tuto úvahu shrnul v eseji *On the weight of a computation* (1995): DNA computing **nepřekonává** NP-úplnost — jen přesouvá exponenciální nárok z **času** na **prostor/hmotu**.

## Důsledky pro informatiku

- **Nový model výpočtu.** Bylo ukázáno, že nad DNA lze realizovat **univerzální výpočet** (logické obvody, sticker/contact modely), nejen jednu úlohu.
- **Masivní paralelismus a hustota dat.** ~10¹⁸ paralelních „procesorů" v mililitru a extrémní informační hustota dělají z DNA atraktivní médium pro **archivaci dat** a nanozařízení (molekulární motory, „chytrá" léčiva).
- **Proč nenahradí klasické počítače.** Operace jsou **pomalé** (hodiny až dny), **chybové** (nedokonalé párování, ztráty molekul) a **neškálovatelné** kvůli exponenciálnímu objemu. Pro praktické instance SAT jsou dnešní elektronické SAT-solvery o mnoho řádů rychlejší, levnější a spolehlivější. DNA computing tak zůstává cenný hlavně jako **inspirace** na rozhraní informatiky, biologie a nanotechnologií, a pro **ukládání dat**.

Souvislost s Adlemanovým experimentem: tam DNA kódovala cesty v grafu, zde pravdivostní hodnoty — princip „vygeneruj vše paralelně, pak odfiltruj neplatné" je ale stejný.

::: quiz "Proč DNA computing nepřekonává NP-úplnost, i když počítá masivně paralelně?"
- [x] Exponenciální nárok se přesune z času na množství (hmotnost/objem) DNA
> Prostor kandidátů roste jako 2ⁿ; aby existovaly všechny naráz, roste i potřebná hmota DNA exponenciálně — Hartmanisova „váha výpočtu".
- [ ] Protože DNA neumí reprezentovat logické hodnoty
> Umí — každé proměnné se přiřadí dvě sekvence (TRUE/FALSE); to není ten problém.
- [ ] Protože laboratorní kroky jsou rychlejší než procesor
> Naopak jsou výrazně pomalejší; rychlost ani není podstatou tohoto omezení.
- [ ] Protože SAT není NP-úplný
> SAT je kanonický NP-úplný problém (Cookova–Levinova věta).
:::

::: link "Lipton (1995): DNA solution of hard computational problems (Science, PubMed)" "https://pubmed.ncbi.nlm.nih.gov/7725098/"
:::

*Zdroj: BIN státnicové okruhy NBIO, VUT FIT. Externí reference: R. Lipton, „DNA solution of hard computational problems", Science 268 (1995); J. Hartmanis, „On the weight of a computation", Bull. EATCS (1995); přehled škálovatelnosti DNA computingu (New J. Phys. 2021, doi:10.1088/1367-2630/ac3883).*
