---
title: Predikce terciární struktury
---

Predikce **terciární struktury** znamená určit celkový **3D tvar (fold)** řetězce ze sekvence. Klasické přístupy se dělí podle toho, **zda a jak využívají už vyřešené struktury** v databázi (např. PDB). Obecně platí: čím podobnější známou strukturu k cílové sekvenci najdeme, tím přesnější (a snazší) predikce.

::: svg "Tři klasické přístupy podle dostupnosti šablony — od nejjednoduššího (homologie) po nejnáročnější (ab initio) — a zlom přinesený hlubokým učením (AlphaFold)."
<svg viewBox="0 0 540 200" style="width:100%;max-width:540px;display:block" font-family="var(--font-mono)">
  <rect width="540" height="200" fill="var(--bg-inset)"/>

  <!-- homology -->
  <rect x="14" y="16" width="158" height="100" rx="6" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="93" y="34" text-anchor="middle" font-size="11" fill="var(--text)">homologní modelování</text>
  <text x="93" y="50" text-anchor="middle" font-size="9" fill="var(--text-muted)">známý templát příbuzné</text>
  <text x="93" y="62" text-anchor="middle" font-size="9" fill="var(--text-muted)">struktury (identita ≳ 30 %)</text>
  <text x="93" y="80" text-anchor="middle" font-size="9" fill="var(--text-faint)">zarovnej → převezmi fold</text>
  <text x="93" y="96" text-anchor="middle" font-size="9" fill="var(--accent)">nejpřesnější, je-li templát</text>

  <!-- threading -->
  <rect x="190" y="16" width="158" height="100" rx="6" fill="var(--bg-card)" stroke="var(--accent-line)" stroke-width="1.5"/>
  <text x="269" y="34" text-anchor="middle" font-size="11" fill="var(--text)">threading</text>
  <text x="269" y="50" text-anchor="middle" font-size="9" fill="var(--text-muted)">žádná zjevná homologie,</text>
  <text x="269" y="62" text-anchor="middle" font-size="9" fill="var(--text-muted)">jen sdílený fold</text>
  <text x="269" y="80" text-anchor="middle" font-size="9" fill="var(--text-faint)">namapuj sekvenci na</text>
  <text x="269" y="92" text-anchor="middle" font-size="9" fill="var(--text-faint)">knihovnu topologií</text>
  <text x="269" y="108" text-anchor="middle" font-size="9" fill="var(--text-muted)">energetická skórovací f.</text>

  <!-- ab initio -->
  <rect x="366" y="16" width="160" height="100" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1.5"/>
  <text x="446" y="34" text-anchor="middle" font-size="11" fill="var(--text)">ab initio</text>
  <text x="446" y="50" text-anchor="middle" font-size="9" fill="var(--text-muted)">žádná šablona</text>
  <text x="446" y="66" text-anchor="middle" font-size="9" fill="var(--text-faint)">jen fyzikálně-chemické</text>
  <text x="446" y="78" text-anchor="middle" font-size="9" fill="var(--text-faint)">zákony, min. volné energie</text>
  <text x="446" y="96" text-anchor="middle" font-size="9" fill="var(--text-muted)">výpočetně nejnáročnější</text>

  <!-- difficulty axis -->
  <path d="M14 130 H520 l-6 -4 m6 4 l-6 4" fill="none" stroke="var(--text-faint)" stroke-width="1"/>
  <text x="14" y="146" font-size="9" fill="var(--text-faint)">stoupá obtížnost a klesá spolehlivost (méně informace ze známých struktur) →</text>

  <!-- AlphaFold breakthrough -->
  <rect x="14" y="158" width="512" height="34" rx="6" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
  <text x="270" y="174" text-anchor="middle" font-size="11" fill="var(--accent)">zlom: AlphaFold (hluboké učení, CASP14, 2020)</text>
  <text x="270" y="187" text-anchor="middle" font-size="9" fill="var(--text-muted)">profil z mnohonásobného zarovnání + neuronová síť → přesnost na úrovni experimentu</text>
</svg>
:::

## Homologní modelování

**Modelování na základě homologie** převezme strukturu od **příbuzného proteinu (templátu)**, jehož struktura je už známá. Funguje, je-li **sekvenční identita** k templátu dostatečná (zhruba **nad 30 %**) — pak je to nejspolehlivější přístup. Postup: (1) **vyhledání templátu** v databázi, (2) **zarovnání** cílové sekvence s templátem, (3) **sestavení modelu** podle zarovnání, (4) **evaluace** modelu. Konzervované **jádro** (helixy, listy) se přebírá přímo; variabilní **smyčky** v místech mezer v zarovnání se dostavují zvlášť.

## Threading (rozpoznávání foldu)

**Threading** se použije, když k cílové sekvenci **není zjevný homolog**, ale může sdílet **fold** s nějakou už známou strukturou. Cílovou sekvenci „provléká" knihovnou známých **topologií** a hledá uložení, které **maximalizuje výhodnost interakcí** mezi aminokyselinami. Potřebuje tři věci: **knihovnu topologií (strukturních šablon)**, **skórovací funkci** hodnotící uložení a **algoritmus** pro mapování sekvence na danou topologii. Zachytí i **vzdálenou** podobnost, kterou prosté sekvenční zarovnání nenajde.

## Ab initio

**Ab initio** (de novo) modelování nestaví na žádné šabloně — strukturu konstruuje **jen z fyzikálně-chemických principů**. Hledá konformaci s **nejmenší volnou energií** při respektování stereochemických omezení (reálné torzní úhly). Je **výpočetně nejnáročnější** a tradičně nejméně přesné, ale jako jediné dokáže najít zcela **nové foldy**. Příbuzný kompromis je **skládání ze sekvenčně-strukturních fragmentů**, kde se struktura sestaví z menších known fragmentů (méně náročné než čisté ab initio).

## Zlom: AlphaFold a hluboké učení

Soutěž **CASP** (Critical Assessment of Structure Prediction) slepě měří přesnost metrikou **GDT-TS**. V **CASP14 (2020)** dosáhl **AlphaFold** (DeepMind) přesnosti na úrovni experimentálních metod — medián GDT-TS přes **90**, RMSD páteře řádově **~1 Å**. Klíčem byla **end-to-end neuronová síť**, jejímž vstupem je **mnohonásobné zarovnání (MSA)** příbuzných sekvencí: koevoluce reziduí prozrazuje, které pozice jsou v prostoru blízko (kontakty). Tím se predikce 3D tvaru z jediného řetězce považuje za **prakticky vyřešenou**.

::: math
\text{GDT-TS} = \tfrac{1}{4}\big(P_{1} + P_{2} + P_{4} + P_{8}\big)
:::

kde *P_d* je podíl reziduí do vzdálenosti *d* Å od experimentální struktury po superpozici — vyšší je lepší (100 = dokonalá shoda).

::: quiz "Který přístup zvolíš, když k cílové sekvenci NEexistuje žádný zjevný homolog se známou strukturou, ale podezříváš sdílený fold?"
- [ ] Homologní modelování
  > To vyžaduje templát s dostatečnou sekvenční identitou (zhruba > 30 %).
- [x] Threading (rozpoznávání foldu)
  > Threading hledá uložení sekvence do knihovny známých topologií i bez zjevné sekvenční podobnosti.
- [ ] Pouze sekvenční zarovnání
  > Prosté zarovnání vzdálenou strukturní podobnost (sdílený fold) bez zjevné identity nezachytí.
:::

::: link "Jumper et al. (2021), Nature — Highly accurate protein structure prediction with AlphaFold" "https://www.nature.com/articles/s41586-021-03819-2"
:::

::: link "Threading (protein sequence) — Wikipedia (fold recognition, knihovna topologií)" "https://en.wikipedia.org/wiki/Threading_(protein_sequence)"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: Jumper et al. (2021) Nature 596:583 — AlphaFold/CASP14; Wikipedia (Protein threading, Homology modeling); Stanford biochem218 — Overview of Protein Structure Prediction.*
