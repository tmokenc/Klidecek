---
title: Bioinformatické postupy v genomice
---

**Genomika** zkoumá celý **genom** organismu — veškerou genetickou informaci uloženou v DNA (u některých virů v RNA). Genom jednoho druhu je mezi jednotlivci z drtivé většiny shodný; bioinformatika se zaměřuje právě na ty rozdíly a na to, kde leží geny a další funkční oblasti. Praktická analýza má podobu **pipeline** — řetězce kroků, kde každý krok produkuje data v ustáleném formátu, který je vstupem dalšího.

::: svg "Genomická pipeline a formáty dat: ze sekvenátoru tečou čtení ve FASTQ, mapování/sestavení dává BAM/FASTA, anotace GFF a hledání variant VCF."
<svg viewBox="0 0 540 196" style="width:100%;display:block" font-family="var(--font-mono)">
  <rect width="540" height="196" fill="var(--bg-inset)"/>
  <text x="14" y="22" font-size="12" fill="var(--text-muted)">vzorek DNA → … → varianty (každý krok má svůj formát dat)</text>

  <!-- stages -->
  <g>
    <rect x="14"  y="40" width="92" height="46" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="60"  y="60" text-anchor="middle" font-size="11" fill="var(--text)">Sekvenace</text>
    <text x="60"  y="74" text-anchor="middle" font-size="9"  fill="var(--text-muted)">NGS / dlouhá čtení</text>

    <rect x="120" y="40" width="92" height="46" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="166" y="58" text-anchor="middle" font-size="11" fill="var(--text)">Kontrola</text>
    <text x="166" y="70" text-anchor="middle" font-size="11" fill="var(--text)">kvality (QC)</text>

    <rect x="226" y="40" width="92" height="46" rx="6" fill="var(--accent)" stroke="var(--accent)"/>
    <text x="272" y="58" text-anchor="middle" font-size="11" fill="var(--bg-inset)">Sestavení /</text>
    <text x="272" y="71" text-anchor="middle" font-size="11" fill="var(--bg-inset)">mapování</text>

    <rect x="332" y="40" width="92" height="46" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="378" y="66" text-anchor="middle" font-size="11" fill="var(--text)">Anotace</text>

    <rect x="438" y="40" width="92" height="46" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="484" y="58" text-anchor="middle" font-size="11" fill="var(--text)">Hledání</text>
    <text x="484" y="71" text-anchor="middle" font-size="11" fill="var(--text)">variant</text>
  </g>

  <!-- arrows + formats -->
  <g stroke="var(--line-strong)" stroke-width="1.5">
    <line x1="106" y1="63" x2="116" y2="63"/>
    <line x1="212" y1="63" x2="222" y2="63"/>
    <line x1="318" y1="63" x2="328" y2="63"/>
    <line x1="424" y1="63" x2="434" y2="63"/>
  </g>
  <g font-size="9" fill="var(--text-faint)" text-anchor="middle">
    <text x="111" y="57">FASTQ</text>
    <text x="217" y="57">FASTQ</text>
    <text x="323" y="57">FASTA/BAM</text>
    <text x="429" y="57">BAM</text>
  </g>

  <!-- data formats legend -->
  <rect x="14" y="104" width="516" height="78" rx="6" fill="var(--bg-card)" stroke="var(--accent-line)"/>
  <text x="24" y="122" font-size="10" fill="var(--accent)">typy dat:</text>
  <text x="24" y="138" font-size="10" fill="var(--text)">FASTQ — čtení (read) + kvalita báze (Phred Q)</text>
  <text x="24" y="153" font-size="10" fill="var(--text)">FASTA — holé sekvence (reference, contigy)</text>
  <text x="24" y="168" font-size="10" fill="var(--text)">SAM/BAM — zarovnání čtení na referenci</text>
  <text x="300" y="138" font-size="10" fill="var(--text)">GFF/GTF — souřadnice anotací (geny, exony)</text>
  <text x="300" y="153" font-size="10" fill="var(--text)">VCF — varianty (SNP, indely) vůči referenci</text>
  <text x="300" y="168" font-size="10" fill="var(--text-muted)">BED — obecné intervaly v genomu</text>
</svg>
:::

## Sekvenace a formát FASTQ

Sekvenátor (krátká čtení **Illumina** nebo dlouhá čtení **Oxford Nanopore** / **PacBio**) rozloží DNA na velké množství **čtení (reads)**. Surovým výstupem je **FASTQ** — textový formát, kde každé čtení zabírá čtyři řádky: identifikátor (`@…`), samotná sekvence bází, oddělovač (`+`) a řetězec **kvalit** zakódovaný v ASCII. Kvalita každé báze se udává jako **Phred skóre Q**, které vyjadřuje pravděpodobnost *P*, že je báze určena chybně:

::: math
Q = -10 \cdot \log_{10} P
:::

Q = 30 tedy znamená pravděpodobnost chyby 1:1000 (99,9 % správně). Phred skóre je základem **kontroly kvality (QC)** — nástroje jako **FastQC** vykreslí rozložení kvalit a **Trimmomatic** / **fastp** ořežou nekvalitní konce čtení a zbytky adaptérů, aby do dalších kroků nešel šum.

## Sestavení vs. mapování

Mám-li **referenční genom** druhu, čtení **mapuji** (zarovnávám) na referenci — nástroje **BWA**, **Bowtie2**, **minimap2**. Výsledkem je formát **SAM** (textový) / **BAM** (binární, komprimovaný), kde u každého čtení stojí, kam a jak přesně sedlo. Nemám-li referenci (nový druh, metagenom), provádím **sestavení *de novo***. Dvě hlavní třídy algoritmů:

- **Overlap-Layout-Consensus (OLC)** — najde překryvy mezi čteními (overlap graf, uzly = čtení), uspořádá je do layoutu a z překryvů odvodí konsenzuální sekvenci. Vhodné pro delší čtení.
- **de Bruijnův graf (DBG)** — rozseká čtení na **k-mery** (podřetězce délky *k*), uzly grafu jsou *k*-mery a cesta grafem dává sestavu. Dominuje u velkého množství krátkých čtení (např. **SPAdes**, **Velvet**).

Výstupem jsou **contigy** (souvislé úseky), které se pomocí informace o párových čteních spojí do **scaffoldů** (pořadí a orientace contigů s odhadem velikosti mezer). Kvalitu sestavy shrnuje metrika **N50** — délka contigu taková, že contigy aspoň této délky pokrývají polovinu celkové délky sestavy (čím větší N50, tím méně rozkouskovaná sestava).

## Anotace a hledání variant

**Anotace** přiřazuje sekvenci význam — hledá geny, exony, regulační oblasti a další funkční prvky. **Ab initio** přístup predikuje geny jen z obsahu sekvence (statistické **HMM** modely typické struktury genu), zatímco přístup **podle homologie** přenáší anotaci ze známých příbuzných sekvencí (např. zarovnáním **BLAST**em). Nástroje: **AUGUSTUS**, **Prokka** (bakterie), **MAKER**. Výsledek se ukládá jako **GFF/GTF** — tabulka souřadnic prvků v genomu.

**Hledání variant (variant calling)** porovnává namapovaná čtení (BAM) s referencí a hlásí odlišnosti — **SNP** (jednonukleotidové záměny) a **indely** (vložení/delece). Standardem jsou **GATK** (best-practices: značení duplikátů, rekalibrace kvality bází, `HaplotypeCaller`), **bcftools**, **FreeBayes**. Výstupem je **VCF** (Variant Call Format) — řádek na každou variantu s pozicí, alelami, kvalitou a genotypem.

::: quiz "Co znamená Phred skóre kvality Q = 20 u báze ve FASTQ?"
- [ ] Báze byla přečtena dvacetkrát (pokrytí 20×)
> Pokrytí je nezávislý pojem; Phred skóre se týká pravděpodobnosti chyby jedné báze, ne počtu čtení.
- [x] Pravděpodobnost chybného určení báze je 1:100, tedy 99 % správně
> Q = −10·log₁₀ P, takže Q = 20 ⇒ P = 0,01.
- [ ] Báze leží 20 nukleotidů od začátku čtení
> Skóre nekóduje pozici, nýbrž důvěryhodnost určení dané báze.
- [ ] Jde o variantu s 20% frekvencí v populaci
> Frekvence alely je údaj z VCF, ne kvalita báze z FASTQ.
:::

::: link "EMBL-EBI Training — What is genome sequencing & analysis (workflow)" "https://www.ebi.ac.uk/training/online/courses/sequencing-genomics/"
:::

::: link "GATK Best Practices — FASTQ → high-confidence variant calls" "https://gatk.broadinstitute.org/hc/en-us/articles/360035894711-About-the-GATK-Best-Practices"
:::

::: link "Wikipedia — FASTQ format & Phred quality score" "https://en.wikipedia.org/wiki/FASTQ_format"
:::

::: viz pbi-genomika-pipeline "Interaktivní genomická pipeline — klikni na krok a uvidíš jeho vstupní/výstupní formát a typické nástroje"
:::

*Zdroj: PBI státnicové okruhy NBIO, VUT FIT. Externí reference: EMBL-EBI Training (Sequencing & genomics), GATK Best Practices (Broad Institute), Wikipedia (FASTQ format, Phred quality score, De novo sequence assemblers / N50), Sboner et al. assembly review (PMC).*
