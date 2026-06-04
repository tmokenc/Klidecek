---
title: Metagenomika
---

**Metagenomika** studuje genetický materiál získaný **přímo ze vzorku prostředí** — z půdy, vody, střevního obsahu apod. — bez nutnosti jednotlivé mikroorganismy kultivovat. To je klíčové, protože drtivou většinu mikrobů v přírodě **neumíme vypěstovat** v laboratoři. Místo jednoho genomu zde sekvenujeme směs DNA celého **mikrobiálního společenstva** (mikrobiomu) a ptáme se: *kdo tam je* (taxonomie) a *co tam umí* (funkce).

::: svg "Dvě cesty metagenomiky ze stejného vzorku: cílená amplikonová (16S rRNA) vs. shotgun sekvenace celé DNA; výstup OTU/ASV a taxonomický/funkční profil."
<svg viewBox="0 0 540 220" style="width:100%;display:block" font-family="var(--font-mono)">
  <rect width="540" height="220" fill="var(--bg-inset)"/>

  <!-- sample -->
  <rect x="14" y="86" width="92" height="46" rx="6" fill="var(--accent)" stroke="var(--accent)"/>
  <text x="60" y="105" text-anchor="middle" font-size="11" fill="var(--bg-inset)">vzorek</text>
  <text x="60" y="119" text-anchor="middle" font-size="11" fill="var(--bg-inset)">prostředí</text>

  <!-- split arrows -->
  <g stroke="var(--line-strong)" stroke-width="1.5" fill="none">
    <path d="M106 100 C 130 100, 130 56, 154 56"/>
    <path d="M106 118 C 130 118, 130 162, 154 162"/>
  </g>

  <!-- amplicon path -->
  <text x="158" y="40" font-size="10" fill="var(--accent)">Amplikon — 16S rRNA</text>
  <rect x="158" y="46" width="110" height="34" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="213" y="60" text-anchor="middle" font-size="9" fill="var(--text)">PCR amplifikace</text>
  <text x="213" y="72" text-anchor="middle" font-size="9" fill="var(--text)">16S rRNA genu</text>
  <line x1="268" y1="63" x2="282" y2="63" stroke="var(--line-strong)" stroke-width="1.5"/>
  <rect x="282" y="46" width="110" height="34" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="337" y="60" text-anchor="middle" font-size="9" fill="var(--text)">klastrování</text>
  <text x="337" y="72" text-anchor="middle" font-size="9" fill="var(--text)">OTU / ASV</text>
  <line x1="392" y1="63" x2="406" y2="63" stroke="var(--line-strong)" stroke-width="1.5"/>
  <rect x="406" y="46" width="120" height="34" rx="5" fill="var(--bg-card)" stroke="var(--accent-line)"/>
  <text x="466" y="60" text-anchor="middle" font-size="9" fill="var(--text-muted)">taxonomie (~rod)</text>
  <text x="466" y="72" text-anchor="middle" font-size="9" fill="var(--text-muted)">funkce: predikce</text>

  <!-- shotgun path -->
  <text x="158" y="150" font-size="10" fill="var(--accent)">Shotgun metagenomika</text>
  <rect x="158" y="156" width="110" height="34" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="213" y="170" text-anchor="middle" font-size="9" fill="var(--text)">sekvenace veškeré</text>
  <text x="213" y="182" text-anchor="middle" font-size="9" fill="var(--text)">DNA (bez cílení)</text>
  <line x1="268" y1="173" x2="282" y2="173" stroke="var(--line-strong)" stroke-width="1.5"/>
  <rect x="282" y="156" width="110" height="34" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="337" y="170" text-anchor="middle" font-size="9" fill="var(--text)">sestavení / reads</text>
  <text x="337" y="182" text-anchor="middle" font-size="9" fill="var(--text)">→ MAGs</text>
  <line x1="392" y1="173" x2="406" y2="173" stroke="var(--line-strong)" stroke-width="1.5"/>
  <rect x="406" y="156" width="120" height="34" rx="5" fill="var(--bg-card)" stroke="var(--accent-line)"/>
  <text x="466" y="170" text-anchor="middle" font-size="9" fill="var(--text-muted)">taxonomie (až druh)</text>
  <text x="466" y="182" text-anchor="middle" font-size="9" fill="var(--text-muted)">funkční profil</text>
</svg>
:::

## Amplikonová sekvenace (16S rRNA)

**Cílený (amplikonový)** přístup nesekvenuje vše, ale jen jeden **markerový gen**, který je univerzální a zároveň druhově variabilní. U bakterií a archeí je to gen pro **16S rRNA** (u hub a eukaryot bývá **ITS** nebo 18S). Konzervované úseky genu slouží jako kotvy pro **PCR primery**, variabilní úseky mezi nimi pak rozlišují taxony. Tím, že amplifikujeme jen marker, je metoda **levná** a stačí relativně málo čtení na vzorek.

Z čtení se tvoří jednotky:

- **OTU** (*Operational Taxonomic Unit*) — shluk sekvencí, které se liší méně než o danou hranici (klasicky **97 % podobnost**). Pohlcuje sekvenační chyby, ale rozlišuje hrubě.
- **ASV** (*Amplicon Sequence Variant*) — přesná, na chyby opravená sekvence rozlišená na úrovni jednotlivého nukleotidu (nástroj **DADA2**, **Deblur**). Moderní, jemnější náhrada OTU.

Přiřazením OTU/ASV k referenční databázi (**SILVA**, **Greengenes**) vznikne **taxonomický profil** — typicky spolehlivý do úrovně **rodu**, do druhu jen omezeně. Funkce se z 16S **přímo neměří**, lze ji jen **predikovat** (nástroj **PICRUSt**).

## Shotgun metagenomika

**Shotgun** přístup sekvenuje **veškerou DNA** ve vzorku bez cílení na jeden gen. Je **dražší** a výpočetně náročnější, ale poskytuje mnohem víc:

- **Taxonomické profilování** s vyšším rozlišením (až **druh/kmen**) — nástroje **Kraken2** (k-merová klasifikace proti databázi), **MetaPhlAn** (klade-specifické markerové geny).
- **Funkční profilování** — protože čteme celé geny, lze přímo zjistit, jaké **metabolické dráhy a funkce** společenstvo má (nástroj **HUMAnN**, mapování na **KEGG**/Gene Ontology).
- **Binning** namapovaných/sestavených čtení do **MAGs** (*Metagenome-Assembled Genomes*) — rekonstrukce (téměř) celých genomů jednotlivých druhů, včetně **dosud nepopsaných**.

::: viz pbi-metagenomika "Přepínač amplikonová (16S) vs. shotgun metagenomika — stejný vzorek, dva postupy a jejich výstupy"
:::

## Amplikon vs. shotgun — shrnutí volby

Volba metody je kompromis cena vs. rozlišení a typ otázky. Amplikon odpoví *kdo přibližně tam je* lacino a robustně i pro velké množství vzorků; shotgun odpoví *kdo přesně tam je a co umí*, ale za vyšší cenu a s nárokem na bioinformatickou expertízu a databáze.

::: math
\text{16S}:\ \text{1 marker} \Rightarrow \text{taxonomie (rod), levné} \quad|\quad \text{shotgun}:\ \text{vše} \Rightarrow \text{taxonomie + funkce, drahé}
:::

::: quiz "Čím se ASV liší od OTU v amplikonové analýze 16S rRNA?"
- [ ] ASV se používá u shotgun metagenomiky, OTU jen u 16S
> Oba pojmy patří amplikonové analýze; rozdíl je v rozlišení, ne v typu sekvenace.
- [x] ASV je přesná, na chyby opravená sekvence rozlišená na úroveň jednotlivého nukleotidu, kdežto OTU je shluk sekvencí v rámci hranice podobnosti (typicky 97 %)
> ASV (DADA2/Deblur) modeluje chyby a nevyžaduje arbitrární práh podobnosti.
- [ ] OTU má vždy vyšší taxonomické rozlišení než ASV
> Je tomu naopak — ASV rozlišuje jemněji, na úroveň jediné báze.
- [ ] ASV obsahuje funkční anotaci, OTU jen taxonomickou
> Funkci z 16S nelze přímo měřit; ani ASV ji neobsahuje, jen ji lze predikovat (PICRUSt).
:::

::: link "Nature Sci. Reports — 16S rRNA vs shotgun pro taxonomickou charakterizaci" "https://www.nature.com/articles/s41598-021-82726-y"
:::

::: link "Wikipedia — Metagenomics (amplikon vs shotgun, OTU/ASV, funkční analýza)" "https://en.wikipedia.org/wiki/Metagenomics"
:::

*Zdroj: PBI státnicové okruhy NBIO, VUT FIT. Externí reference: Nature Scientific Reports 2021 (16S vs shotgun, s41598-021-82726-y), Wikipedia (Metagenomics, 16S ribosomal RNA, OTU), QIIME 2 / DADA2 dokumentace, HUMAnN & MetaPhlAn dokumentace.*
