---
title: DNA — struktura a princip
---

# DNA — struktura a princip

**DNA** (deoxyribonukleová kyselina) je *gold standard* biometrické identifikace. Žádná jiná modalita nedosahuje její *jedinečnosti* (s výjimkou identických dvojčat) a *stability* (nemění se s časem). Cena: *pomalá* (hodiny-dny analýza, ne real-time), *invazivní* (vyžaduje fyzický vzorek), *etické* a *právní* problémy.

## Chemická struktura

::: svg "DNA struktura: dvojitá šroubovice; cukr-fosfátové páteře, base pairs (A=T, G≡C) uvnitř."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="rgb(80,80,200)" stroke-width="2" fill="none">
    <path d="M150,40 C200,70 200,100 150,130 C100,160 100,190 150,220"/>
  </g>
  <g stroke="rgb(200,80,80)" stroke-width="2" fill="none">
    <path d="M250,40 C200,70 200,100 250,130 C300,160 300,190 250,220"/>
  </g>
  <g stroke="var(--text)" stroke-width="0.8" fill="none">
    <line x1="155" y1="60" x2="245" y2="60"/>
    <line x1="180" y1="80" x2="220" y2="80"/>
    <line x1="200" y1="100" x2="200" y2="100"/>
    <line x1="180" y1="120" x2="220" y2="120"/>
    <line x1="155" y1="140" x2="245" y2="140"/>
    <line x1="180" y1="160" x2="220" y2="160"/>
    <line x1="155" y1="180" x2="245" y2="180"/>
    <line x1="180" y1="200" x2="220" y2="200"/>
  </g>
  <g fill="var(--accent)" font-size="11" text-anchor="middle">
    <text x="200" y="65">A=T</text>
    <text x="200" y="85">G≡C</text>
    <text x="200" y="125">T=A</text>
    <text x="200" y="145">C≡G</text>
    <text x="200" y="165">A=T</text>
    <text x="200" y="185">G≡C</text>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10.5">
    <text x="330" y="80">Báze (nucleobases):</text>
    <text x="340" y="100">A — Adenin</text>
    <text x="340" y="115">T — Thymin</text>
    <text x="340" y="130">G — Guanin</text>
    <text x="340" y="145">C — Cytosin</text>
    <text x="330" y="180">A pairs with T (2H)</text>
    <text x="330" y="195">G pairs with C (3H)</text>
  </g>
</svg>
:::

* **Dvojitá šroubovice** (double helix) — objev Watson + Crick 1953 (Nobel Prize 1962).
* **Cukr-fosfátová páteř** (sugar-phosphate backbone) — *deoxyribose* sugar + phosphate groups.
* **Báze (nucleobases):**
  * **A (Adenin)** pairs with **T (Thymin)** — 2 vodíkové vazby.
  * **G (Guanin)** pairs with **C (Cytosin)** — 3 vodíkové vazby.
* **Komplementarita** — A=T, G=C. Each strand defines the other.

## Lidský genom

* **3.2 miliardy** base pairs.
* **~20 000 genes** (kódujících proteiny).
* **23 párů chromosomů** (22 *autosomes* + 1 sex chromosome pair, XX nebo XY).
* **~99.9 % shoda** mezi všemi lidmi.
* **~0.1 % variability** — odpovídá ~3 milionům bází.

Pro biometriku stačí *velmi malá* část tohoto genomu — *highly polymorphic regions* (oblasti, kde se lidé výrazně liší).

## DNA polymorphisms

### SNPs (Single Nucleotide Polymorphisms)

* **Jednotlivé báze** se liší mezi osobami.
* **~10 milionů** SNPs v lidské populaci.
* Některé jsou **velmi vzácné**, jiné běžné.
* Použití: ancestry, genome-wide association studies (GWAS), some forensic.

### STRs (Short Tandem Repeats)

* **Krátké sekvence (2–6 bp)**, které se *opakují* po sobě.
* Příklad: `CATG-CATG-CATG-CATG` (4× opakování CATG).
* **Počet opakování** se *liší* mezi osobami (1–50 typically).
* **STR loci** (specific positions in genome) jsou *highly polymorphic*.

### CODIS — Combined DNA Index System

FBI standard:

* **20 STR loci** (rozšířeno z 13 v 2017).
* Pro identifikaci osoby v *forenzním* kontextu.
* **Match probability:** ~$10^{-20}$ for unrelated persons.
* Used in **NDIS** (National DNA Index System) — 14M+ profiles.

### European Standard Set (ESS)

* **12 STR loci** for EU forensic database integration.
* **Eurodac**, **Prüm Treaty** — automated EU DNA database exchange.

## Klíčové vlastnosti DNA

### Unikátnost

* **Žádné dva** non-identical-twin osoby nemají *stejný* CODIS profile.
* Match probability for unrelated: ~$10^{-20}$ — far better than fingerprint or iris.

### Stálost

* **Stejná** v každé buňce těla.
* **Nemění se** s věkem.
* **Stejná** během celého života.
* **Stejná** po smrti — *post-mortem* identification.

### Identická dvojčata

* **Sdílí ~99.99 % DNA** (some random mutations during development).
* CODIS profil je *prakticky identical* pro identical twins.
* **Speciální markers** (epigenetic, specific SNPs) can sometimes distinguish.

## Sběr DNA vzorků

### Buccal swab (ústní stěr)

* **Cotton swab** vyromodý po stěru vnitřní strany tváře.
* **Quick, non-invasive.**
* **Painless.**
* Standard pro voluntary enrollment.

### Krev

* **Venepuncture** — venous blood draw.
* **Higher DNA yield**.
* Více invasivní.

### Sliny

* **Saliva sample** — collected in tube.
* DNA z bukálních cells in saliva.

### Tkáňové vzorky

* **Body tissue** — z autopsy, biopsy.
* **Hair root** (with follicle) — has DNA; cut hair shaft does NOT have nuclear DNA (only mitochondrial).

### Touch DNA

* **Skin cells** left on touched objects.
* **Very small amount** (~1 cell may have ~6 pg DNA).
* Requires *low copy number* (LCN) analysis.
* Used in forensic.

### Forenzní stopy

* **Krevní stopy.**
* **Sperma** — male DNA, used in sexual assault investigations.
* **Slina** — z cigarettes, glasses, envelopes.
* **Vlasové cibule** (hair follicles).
* **Tkáň pod nehty** — defensive scratching.
* **Ostatní biologické stopy.**

## DNA analýza — pipeline

::: svg "DNA analýza pipeline: extrakce → kvantifikace → PCR amplifikace → CE elektroforéza → STR profil."
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aDNA1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="10" y="60" width="80" height="40" rx="4"/>
    <rect x="100" y="60" width="80" height="40" rx="4"/>
    <rect x="190" y="60" width="100" height="40" rx="4"/>
    <rect x="300" y="60" width="100" height="40" rx="4"/>
    <rect x="410" y="60" width="110" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="50" y="84">extrakce</text>
    <text x="50" y="96" font-size="9" fill="var(--text-muted)">DNA isol.</text>
    <text x="140" y="84">kvant.</text>
    <text x="140" y="96" font-size="9" fill="var(--text-muted)">qPCR</text>
    <text x="240" y="84">PCR amplif.</text>
    <text x="240" y="96" font-size="9" fill="var(--text-muted)">STR primers</text>
    <text x="350" y="84">CE elektrof.</text>
    <text x="350" y="96" font-size="9" fill="var(--text-muted)">size separ.</text>
    <text x="465" y="84">STR profil</text>
    <text x="465" y="96" font-size="9" fill="var(--text-muted)">database query</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aDNA1)">
    <path d="M90,80 L98,80"/>
    <path d="M180,80 L188,80"/>
    <path d="M290,80 L298,80"/>
    <path d="M400,80 L408,80"/>
  </g>
</svg>
:::

### 1. Extrakce DNA

* **Cell lysis** — break cells.
* **Protein digestion** — proteinase K.
* **Phenol-chloroform** or **silica column** purification.
* Output: clean DNA in solution.

### 2. Kvantifikace

* **qPCR** (quantitative PCR) — measures DNA concentration.
* Required because PCR works best with known input quantity.

### 3. PCR amplifikace

* **Polymerase Chain Reaction** — amplify specific STR regions.
* **Primers** flanking each STR locus.
* **20-30 cycles** — exponential amplification.
* Output: millions of copies of STR regions.

### 4. CE (Capillary Electrophoresis)

* PCR products *separated by size* in capillary tube.
* **Detection** via fluorescence (PCR primers are fluorescently labeled).
* Each STR locus contributes peak(s) at specific size.

::: viz dna-electropherogram "Elektroferogram s peaks na lokálních fluorescenčních kanálech; přepněte single vs směs vs LCN."
:::

### 5. STR profile

* Analysis software (GeneMapper, OSIRIS) — calls *alleles* (specific repeat counts).
* Profile = vector of (locus, allele1, allele2) pro 20+ loci.
* Compare with database / suspect profile.

## Cena a čas

* **Cena:** $50–$500 per analysis.
* **Čas:** *standardně* 6–72 hodin lab work.
* **Rapid DNA:** 90 minut, automated systems (deployed in some PD/border control).

## DNA databases

| Database | Region | Velikost |
| :--- | :--- | :---: |
| **FBI NDIS / CODIS** | USA | 14M+ profiles |
| **UK National DNA Database** | UK | 5.6M |
| **GEDmatch / FTDNA** | civilní genealogy | 1M+ each |
| **MyHeritage / 23andMe** | konsumer | 12M+ each |
| **Czech DNA databáze** | ČR | ~70 000 (policie) |

Civilní databáze (genealogy) byly použity ve forenzních *investigative* contextech (Golden State Killer 2018) — controversial use.

## Limity DNA biometrics

### Identical twins

* **Cannot distinguish** with standard CODIS.
* Need *specialized* SNPs or epigenetic analysis.

### Mixed samples

* **Multiple contributors** (crime scene).
* **Probabilistic Genotyping** software (STRmix, TrueAllele) — likelihood ratios.
* Court controversies — software validation.

### Contamination

* DNA contamination from lab personnel, environment.
* Strict protocols, negative controls.

### Degradation

* Old / damaged samples — partial profiles.
* Touch DNA — low copy number issues.

### Mitochondrial DNA (mtDNA)

* From maternal lineage only.
* Less unique than nuclear DNA.
* Used when nuclear DNA unavailable (ancient remains, hair shaft).

---

*Zdroj: BIO přednášky 2025/26, BIO 7 — DNA a její využití v biometrii (Drahanský, Doležel, Sakin). Externí reference: Butler, J. M.: *Fundamentals of Forensic DNA Typing* (Academic Press 2010); Watson, J. D., Crick, F. H. C.: *Molecular Structure of Nucleic Acids* (Nature 1953); FBI CODIS — [fbi.gov/services/laboratory/biometric-analysis/codis](https://www.fbi.gov/services/laboratory/biometric-analysis/codis); European Network of Forensic Science Institutes (ENFSI) — [enfsi.eu](https://enfsi.eu/).*
