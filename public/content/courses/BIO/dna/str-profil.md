---
title: STR profil a CODIS
---

# STR profil a CODIS

**STR profil** je *standardní formát* lidské DNA pro forenzní identifikaci. **CODIS** (Combined DNA Index System) je FBI specifikace, která definuje *konkrétních 20 STR loci* používaných pro celonárodní DNA database. Pochopení STR profile je nezbytné pro biometric DNA, forensic investigations, a paternity testing.

## STR — Short Tandem Repeats

STR jsou krátké sekvence DNA (2–6 base pairs), které se *opakují tandemově* (sousedně) v genomu.

### Příklad

* Sekvence: `...AATG-AATG-AATG-AATG-AATG-...`
* **Repeat unit:** AATG (4 bp).
* **Repeat count:** 5.
* **Allele:** 5 (pojmenováno podle počtu opakování).

Locus může mít *různé* allele counts u různých osob — typically 5–30 repeats.

### Polymorphismus

* **Heterozygote:** osoba má *dva různé* alleles na locusu (jeden od matky, jeden od otce). Např. (9, 13).
* **Homozygote:** osoba má *stejnou* allele na obou chromosomes. Např. (11, 11).
* **Allele frequencies:** vary by population (different in Czech vs. Japanese vs. African).

## CODIS loci

::: svg "CODIS 20 STR loci: distributed across all 22 autosomes + X/Y chromosomes."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="9">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="0.8">
    <rect x="20" y="40" width="500" height="170" rx="6"/>
  </g>
  <g fill="var(--accent)" font-size="10">
    <text x="40" y="60">Chromosome 1: D1S1656</text>
    <text x="40" y="74">Chromosome 2: TPOX, D2S1338, D2S441</text>
    <text x="40" y="88">Chromosome 3: D3S1358</text>
    <text x="40" y="102">Chromosome 4: FGA</text>
    <text x="40" y="116">Chromosome 5: D5S818, CSF1PO</text>
    <text x="40" y="130">Chromosome 7: D7S820</text>
    <text x="40" y="144">Chromosome 8: D8S1179</text>
    <text x="40" y="158">Chromosome 10: D10S1248</text>
    <text x="280" y="60">Chromosome 11: TH01</text>
    <text x="280" y="74">Chromosome 12: vWA, D12S391</text>
    <text x="280" y="88">Chromosome 13: D13S317</text>
    <text x="280" y="102">Chromosome 16: D16S539</text>
    <text x="280" y="116">Chromosome 18: D18S51</text>
    <text x="280" y="130">Chromosome 19: D19S433</text>
    <text x="280" y="144">Chromosome 21: D21S11</text>
    <text x="280" y="158">Chromosome 22: D22S1045</text>
    <text x="280" y="172">Y chromosome: DYS391</text>
    <text x="280" y="186">Sex marker: AMEL (XX or XY)</text>
  </g>
</svg>
:::

CODIS Expanded Core (od 2017) má **20 STR loci** (z původních 13). Tyto loci:

* **Geographically distributed** — across multiple chromosomes (no linkage).
* **Highly polymorphic** — 10–40 alleles per locus.
* **Standardized** — same loci used by FBI, EU, Interpol.

### Sex marker — AMEL

* **Amelogenin** (AMEL) — gene na X i Y chromosomes.
* X version: 6 bp shorter than Y version.
* Lab CE shows:
  * **Female:** single peak (XX).
  * **Male:** double peak (X + Y).

### Y-STR (Y chromosome STRs)

* Specifické pro **muže** (Y chromosome only).
* Used in **sexual assault** investigations (separate male DNA from mixed sample).
* Y-STRs *passed* from father to son unchanged — *patrilineal* identification.

### X-STR

* Less common.
* Used in paternity testing when father unavailable.

## Match probability

Pro **20 CODIS loci** s observed STR profile:

* **Random match probability (RMP):** probability that an *unrelated* person has the same profile.
* Typical RMP: $10^{-20}$ to $10^{-30}$.

To znamená:

* Probability 1 in $10^{20}$ — there are ~$10^{10}$ humans, so virtually no chance of accidental match.
* In court: "probability that random unrelated person has this profile is approximately 1 in N".

::: viz str-profile-match "Porovnání suspect vs crime scene přes 20 CODIS lokusů; jeden nesoulad = vyloučení."
:::

## Specifické situace

### Identical twins

* **CODIS profile prakticky identical.**
* Cannot distinguish with standard STRs.
* **Mitigation:**
  * Specialized SNP panels.
  * Epigenetic markers (methylation differences).
  * Microbiome (gut bacteria differ).

### Family members

* **Parents-children:** share 50 % of STR alleles (one allele per locus inherited).
* **Siblings:** share 25–75 % (random inheritance).
* **Genetic genealogy** uses these inheritance patterns.

### Mixed samples

* **Multiple contributors** — peaks from multiple people overlap.
* **Probabilistic genotyping** software (STRmix, TrueAllele) calculates likelihood ratios.
* Court controversies — different software give different results sometimes.

## STR analysis software

* **GeneMapper ID-X** (Thermo Fisher) — industry standard for allele calling.
* **OSIRIS** (NIST) — free, open-source.
* **GeneScan** — older.

Output: STR profile table:

| Locus | Allele 1 | Allele 2 |
| :--- | :---: | :---: |
| D3S1358 | 14 | 17 |
| vWA | 16 | 17 |
| FGA | 21 | 24 |
| D8S1179 | 13 | 15 |
| ... | ... | ... |

## Databáze STR profilů

### CODIS (FBI)

* **National DNA Index System (NDIS)** — 14M+ profiles.
* Categories:
  * **Convicted offenders.**
  * **Arrestees** (varies by state).
  * **Unknown crime scene profiles.**
* Comparison: forensic samples → offender database.

### European Standard Set (ESS)

* **12 core loci** common with CODIS.
* Used in Eurodac, Prüm Treaty data exchange.
* All EU national databases compatible.

### Czech databáze

* **Policejní DNA databáze** — administered by Policie ČR.
* ~70 000 profiles (~2023 data).
* Connected to EU Prüm system.

### Consumer genetics (DTC)

* **23andMe, AncestryDNA, MyHeritage** — *SNP-based*, not STR.
* Different data structure, but *can be cross-referenced* with forensic.
* Used in *investigative genetic genealogy* (Golden State Killer 2018).

## Praktická aplikace

### Forensic identification

* **Crime scene** sample → CODIS search.
* Match → suspect.
* No match → cold case.

### Paternity testing

* Compare child's STR profile with alleged father's.
* If child has *no* allele from father at any locus → exclusion.
* If child shares alleles → calculate **paternity index**.

### Disaster victim identification (DVI)

* Match victims to family members (DNA from missing persons reports).
* 9/11, tsunami 2004, Boeing crashes.
* **Interpol DVI** protocols.

### Missing persons

* DNA database of unknown remains.
* DNA from family members.
* Match → identification.

### Immigration / family reunification

* Verify family relationships via DNA.
* US, EU, UK immigration sometimes requires DNA.

## Limity

### Time

* **Standard STR analysis:** 6–72 hodin.
* **Rapid DNA:** 90 minut (specialized instruments — FBI deployments in 2017+).

### Cost

* **Per-sample:** $50–$500.
* **High-throughput labs** can reduce.

### Storage

* DNA samples stored for *decades* in many jurisdictions.
* Privacy concerns about long-term retention.

### Quality

* **Touch DNA, mixed samples** — incomplete profiles.
* **Degraded samples** — partial loci dropped.

## Legal frameworks

* **US:** State + federal laws govern collection, retention.
* **EU:** GDPR + Article 9 (special category data — biometric).
* **Czech Republic:** Zákon o policii (273/2008 Sb.) reguluje DNA collection.

Restrictions:
* Suspects with charges → some retention.
* Acquitted → mostly *required deletion*.
* Convicted → long-term retention.

## Trends

* **Rapid DNA** — point-of-care analysis at police stations, border.
* **NGS (Next-Generation Sequencing)** — read more loci, including SNPs.
* **Investigative genetic genealogy** — using consumer databases for cold cases.
* **DNA phenotyping** — predicting appearance (eye, hair color, ancestry) from DNA. Controversial.

---

*Zdroj: BIO přednášky 2025/26, BIO 7 — DNA a její využití v biometrii (Drahanský, Doležel, Sakin). Externí reference: Butler, J. M.: *Forensic DNA Typing: Biology, Technology, and Genetics of STR Markers* (2nd ed., Elsevier 2005); FBI CODIS Expanded Core Loci (2017); European Network of Forensic Science Institutes — DNA Working Group; Prüm Treaty (2005) and EU Decision 2008/615/JHA.*
