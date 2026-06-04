---
title: Úrovně struktury proteinů
---

Protein je lineární polymer aminokyselin (AK) spojených peptidovou vazbou. Jeho biologická funkce je dána **prostorovým tvarem (foldem)**, do kterého se řetězec sbalí. Aby se dala funkce předpovědět ze sekvence, popisuje se struktura ve **čtyřech hierarchických úrovních** — od pořadí aminokyselin až po sestavu více řetězců.

::: svg "Čtyři úrovně struktury proteinu: primární sekvence se sbaluje do sekundárních motivů (helix, list), ty se prostorově uspořádají do terciárního foldu a více řetězců tvoří kvartérní celek."
<svg viewBox="0 0 540 180" style="width:100%;max-width:540px;display:block" font-family="var(--font-mono)">
  <rect width="540" height="180" fill="var(--bg-inset)"/>

  <!-- 1: primary -->
  <text x="65" y="18" text-anchor="middle" font-size="11" fill="var(--text)">1° primární</text>
  <g>
    <rect x="20" y="32" width="20" height="20" rx="3" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="30" y="46" text-anchor="middle" font-size="10" fill="var(--text-muted)">M</text>
    <rect x="42" y="32" width="20" height="20" rx="3" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="52" y="46" text-anchor="middle" font-size="10" fill="var(--text-muted)">A</text>
    <rect x="64" y="32" width="20" height="20" rx="3" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="74" y="46" text-anchor="middle" font-size="10" fill="var(--text-muted)">K</text>
    <rect x="86" y="32" width="20" height="20" rx="3" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="96" y="46" text-anchor="middle" font-size="10" fill="var(--text-muted)">G</text>
  </g>
  <text x="65" y="74" text-anchor="middle" font-size="9" fill="var(--text-faint)">sekvence AK</text>

  <!-- 2: secondary -->
  <text x="205" y="18" text-anchor="middle" font-size="11" fill="var(--text)">2° sekundární</text>
  <!-- helix coil -->
  <path d="M150 36 q10 -8 18 0 q10 8 18 0 q10 -8 18 0 q10 8 18 0"
        fill="none" stroke="var(--accent)" stroke-width="2.5"/>
  <text x="186" y="30" text-anchor="middle" font-size="9" fill="var(--text-muted)">α-helix</text>
  <!-- beta sheet arrows -->
  <path d="M150 58 h44 l-6 -4 m6 4 l-6 4" fill="none" stroke="var(--line-strong)" stroke-width="2"/>
  <path d="M150 70 h44 l-6 -4 m6 4 l-6 4" fill="none" stroke="var(--line-strong)" stroke-width="2"/>
  <text x="172" y="84" text-anchor="middle" font-size="9" fill="var(--text-muted)">β-list</text>

  <!-- 3: tertiary -->
  <text x="350" y="18" text-anchor="middle" font-size="11" fill="var(--text)">3° terciární</text>
  <path d="M310 40 q20 -6 30 8 q-14 12 4 22 q22 6 12 24 q-18 8 -32 -2 q14 -16 -6 -22 q-20 -10 -8 -30 z"
        fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
  <path d="M322 50 q8 -4 16 4 q6 8 -2 14" fill="none" stroke="var(--accent)" stroke-width="2"/>
  <path d="M318 78 h24" stroke="var(--line-strong)" stroke-width="2"/>
  <text x="350" y="76" text-anchor="middle" font-size="9" fill="var(--text-faint)">3D fold</text>

  <!-- 4: quaternary -->
  <text x="478" y="18" text-anchor="middle" font-size="11" fill="var(--text)">4° kvartérní</text>
  <circle cx="460" cy="48" r="17" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
  <circle cx="496" cy="48" r="17" fill="var(--bg-card)" stroke="var(--accent-line)" stroke-width="1.5"/>
  <circle cx="460" cy="80" r="17" fill="var(--bg-card)" stroke="var(--accent-line)" stroke-width="1.5"/>
  <circle cx="496" cy="80" r="17" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="478" y="112" text-anchor="middle" font-size="9" fill="var(--text-faint)">podjednotky</text>

  <!-- arrows between levels -->
  <path d="M118 44 h22 l-6 -4 m6 4 l-6 4" fill="none" stroke="var(--text-faint)" stroke-width="1"/>
  <path d="M256 50 h36 l-6 -4 m6 4 l-6 4" fill="none" stroke="var(--text-faint)" stroke-width="1"/>
  <path d="M392 62 h28 l-6 -4 m6 4 l-6 4" fill="none" stroke="var(--text-faint)" stroke-width="1"/>

  <text x="270" y="150" text-anchor="middle" font-size="10" fill="var(--text-muted)">sbalování (folding): sekvence určuje fold</text>
  <text x="270" y="166" text-anchor="middle" font-size="9" fill="var(--text-faint)">funkce vyplývá z 3D tvaru</text>
</svg>
:::

## Primární struktura

**Primární strukturou** je samotná **sekvence aminokyselin** zapsaná od N-konce ke C-konci řetězce. Je dána geneticky (pořadí kodonů). Podle **Anfinsenova dogmatu** v sobě sekvence nese veškerou informaci potřebnou ke sbalení do nativního tvaru — primární struktura tedy jednoznačně určuje fyzikálně-chemické vlastnosti, prostorové uspořádání i výslednou funkci. Právě proto má smysl predikovat strukturu *ze sekvence*.

## Sekundární struktura

**Sekundární struktura** popisuje lokální, **opakující se vzory** sbalení páteře řetězce, stabilizované **vodíkovými můstky** mezi atomy hlavního řetězce (C=O ··· H–N). Dva hlavní motivy:

- **α-helix (α-šroubovice)** — pravotočivá šroubovice; vodíkové můstky vedou téměř rovnoběžně s osou (mezi reziduem *i* a *i+4*), postranní řetězce směřují ven.
- **β-skládaný list (β-sheet)** — dvě či více natažených **β-vláken** propojených vodíkovými můstky napříč; vlákna mohou být **paralelní** nebo **antiparalelní**.

Zbylé úseky tvoří **smyčky a otáčky (loops, turns)**, které propojují elementy a bývají variabilní.

## Terciární a kvartérní struktura

**Terciární struktura** je úplné **3D uspořádání jednoho řetězce** — sekundární elementy se sbalí do kompaktního globulárního tvaru. Drží ji **nekovalentní interakce** (hydrofobní jádro, vodíkové můstky, van der Waalsovy a iontové síly) a kovalentní **disulfidické můstky** mezi cysteiny. Hydrofobní rezidua se typicky schovají do jádra, hydrofilní zůstávají na povrchu.

**Kvartérní struktura** vzniká jen u proteinů z **více polypeptidových řetězců (podjednotek)** — popisuje jejich vzájemné prostorové uspořádání a interakce mezi nimi (např. hemoglobin se čtyřmi podjednotkami).

::: quiz "Která úroveň struktury je stabilizována vodíkovými můstky mezi atomy hlavního řetězce a tvoří motivy α-helix a β-list?"
- [ ] Primární
  > Primární struktura je pouhá sekvence aminokyselin, žádné prostorové motivy.
- [x] Sekundární
  > α-helix i β-list jsou lokální vzory páteře držené vodíkovými můstky hlavního řetězce.
- [ ] Terciární
  > Terciární struktura je celkový 3D fold řetězce, drží ji hlavně interakce postranních řetězců a disulfidické můstky.
- [ ] Kvartérní
  > Kvartérní struktura popisuje uspořádání více podjednotek, ne lokální motivy.
:::

::: link "EMBL-EBI Training — Protein classification: structural levels" "https://www.ebi.ac.uk/training/online/courses/protein-classification-intro-ebi-resources/what-are-protein-domains/"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: EMBL-EBI Training (protein structure); Anfinsen (1973), Science 181:223 — princip „sekvence určuje strukturu".*
