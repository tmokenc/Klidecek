---
title: Genomové databáze a anotace
---

# Genomové databáze a anotace

**Genom** je veškerá genetická informace organismu uložená v DNA (u některých virů v RNA). **Sekvence genomu** je samotný „surový text" — pořadí nukleotidů (A, C, G, T) ve všech chromozomech. Sekvence sama o sobě ale nic neříká o tom, kde jsou geny a co dělají; ten význam dodává až **anotace**.

## Sekvence vs. anotace

Je klíčové oddělit dvě vrstvy: **sekvence** je řetězec písmen, **anotace** je vrstva metadat *navrstvená nad souřadnicemi* sekvence — popisuje, které úseky jsou geny, exony, promotory či vazebná místa a jakou mají funkci. Stejná sekvence může mít více konkurenčních anotací (různé databáze ji popisují odlišně) a anotace se v čase zpřesňuje, zatímco sekvence zůstává.

::: svg "Sekvence (řetězec nukleotidů) vs. anotace (vrstva metadat nad souřadnicemi). Vlevo dělení strukturní/funkční anotace, vpravo přehled hlavních databází."
<svg viewBox="0 0 540 230" style="width:100%;display:block">
  <rect width="540" height="230" fill="var(--bg-inset)"/>
  <!-- sekvence -->
  <text x="12" y="22" font-size="11" font-family="var(--font-mono)" fill="var(--text-muted)">sekvence (souřadnice 1..n):</text>
  <rect x="12" y="30" width="320" height="22" rx="3" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="20" y="45" font-size="11" font-family="var(--font-mono)" fill="var(--text)">A T G C C A A G T C ... G A C T A A</text>
  <!-- anotacni vrstva -->
  <text x="12" y="72" font-size="11" font-family="var(--font-mono)" fill="var(--text-muted)">anotace (vrstva nad sekvencí):</text>
  <rect x="40" y="80" width="60" height="16" rx="3" fill="color-mix(in oklch, var(--accent) 30%, var(--bg-card))" stroke="var(--accent)"/>
  <text x="70" y="92" text-anchor="middle" font-size="9.5" fill="var(--text)">exon</text>
  <rect x="120" y="80" width="40" height="16" rx="3" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="140" y="92" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">intron</text>
  <rect x="180" y="80" width="60" height="16" rx="3" fill="color-mix(in oklch, var(--accent) 30%, var(--bg-card))" stroke="var(--accent)"/>
  <text x="210" y="92" text-anchor="middle" font-size="9.5" fill="var(--text)">CDS</text>
  <rect x="260" y="80" width="60" height="16" rx="3" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="290" y="92" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">promotor</text>
  <!-- dva typy anotace -->
  <text x="12" y="124" font-size="11" font-family="var(--font-mono)" fill="var(--text-faint)">dva kroky anotace:</text>
  <rect x="12" y="132" width="155" height="44" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="20" y="148" font-size="10.5" fill="var(--text)" font-weight="600">strukturní</text>
  <text x="20" y="163" font-size="9" fill="var(--text-muted)">kde jsou geny, exony,</text>
  <text x="20" y="173" font-size="9" fill="var(--text-muted)">introny, ORF, CDS</text>
  <rect x="177" y="132" width="155" height="44" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="185" y="148" font-size="10.5" fill="var(--text)" font-weight="600">funkční</text>
  <text x="185" y="163" font-size="9" fill="var(--text-muted)">jakou má produkt funkci</text>
  <text x="185" y="173" font-size="9" fill="var(--text-muted)">(GO termíny, dráhy)</text>
  <!-- databaze -->
  <line x1="350" y1="30" x2="350" y2="200" stroke="var(--line)" stroke-width="0.75"/>
  <text x="364" y="22" font-size="11" font-family="var(--font-mono)" fill="var(--text-muted)">hlavní databáze:</text>
  <rect x="364" y="32" width="164" height="26" rx="4" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="372" y="49" font-size="10" fill="var(--text)">GenBank — nukleotidy (INSDC)</text>
  <rect x="364" y="64" width="164" height="26" rx="4" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="372" y="81" font-size="10" fill="var(--text)">Ensembl — anotace genomu</text>
  <rect x="364" y="96" width="164" height="26" rx="4" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="372" y="113" font-size="10" fill="var(--text)">UCSC — genome browser</text>
  <rect x="364" y="128" width="164" height="26" rx="4" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="372" y="145" font-size="10" fill="var(--text)">RefSeq — kurované reference</text>
  <rect x="364" y="160" width="164" height="26" rx="4" fill="color-mix(in oklch, var(--accent) 20%, var(--bg-card))" stroke="var(--accent)"/>
  <text x="372" y="177" font-size="10" fill="var(--text)">UniProt — proteinové sekvence</text>
  <text x="12" y="216" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">sekvence = písmena; anotace = význam navrstvený nad souřadnicemi</text>
</svg>
:::

## Strukturní vs. funkční anotace

Anotace se dělí na dva navazující kroky:

- **Strukturní anotace** určuje **polohu a strukturu prvků** v genomu — otevřené čtecí rámce (ORF), kódující sekvence (CDS), exony, introny, promotory, počáteční a stop kodony. Odpovídá: *kde jsou geny a jaká je jejich exon-intronová stavba?*
- **Funkční anotace** přiřazuje nalezeným produktům **biologickou roli** — genové symboly, **GO termíny**, zařazení do drah. Typicky se hledá podobnost se známými proteiny (např. `BLAST`) a funkce se přenese z homologu (předpoklad: podobná sekvence → podobná funkce).

Metody strukturní predikce genů jsou buď **ab initio** (hledají v sekvenci obsahové signály — *content/signal sensors*, často **HMM**), nebo založené na **homologii** s již anotovanými sekvencemi; v praxi se kombinují pro vyšší přesnost.

## Hlavní databáze

- **GenBank** (NCBI) — primární archiv **nukleotidových sekvencí**. Je součástí **INSDC** (*International Nucleotide Sequence Database Collaboration*) spolu s **ENA** (EMBL-EBI) a **DDBJ** (Japonsko); všechny tři si data **denně synchronizují** a sdílejí společný formát *feature table*. GenBank přijímá záznamy od autorů a často je dál nereviduje.
- **RefSeq** (NCBI) — **kurovaná**, nepřebytečná sada referenčních záznamů (chromozom, transkript, protein) propojených s anotací; pravidelně se přeanotovává.
- **Ensembl** (EMBL-EBI) — genomy obratlovců s **automaticky budovanou anotací** (pro člověka/myš doplněnou ruční kurací GENCODE/HAVANA); rozhraní pro prohlížení i programový přístup.
- **UCSC Genome Browser** — vizualizační prohlížeč, který nad referenční sekvencí zobrazuje vrstvy (*tracks*) anotací z mnoha zdrojů; *Known Genes* staví na UniProt + GenBank mRNA.
- **UniProt** — referenční databáze **proteinových sekvencí a jejich funkce**; ručně kurovaný **Swiss-Prot** vs. automaticky doplňovaný **TrEMBL**.

::: quiz "Jaký je rozdíl mezi strukturní a funkční anotací genomu?"
- [x] Strukturní určuje polohu prvků (geny, exony, CDS), funkční přiřazuje produktům roli (GO, dráhy)
  > Nejdřív se zjistí *kde* prvky leží, poté se odvodí *co dělají*.
- [ ] Strukturní popisuje 3D strukturu proteinu, funkční jeho enzymovou aktivitu
  > Strukturní anotace genomu se týká polohy prvků v sekvenci, ne prostorové struktury proteinu.
- [ ] Jsou to synonyma — jen různé názvy pro tutéž úlohu
  > Jde o dva oddělené, navazující kroky anotačního procesu.
:::

::: link "INSDC — International Nucleotide Sequence Database Collaboration (GenBank/ENA/DDBJ)" "https://www.insdc.org/"
:::

::: link "EMBL-EBI / Ensembl — co je genomová anotace a jak vzniká" "https://www.ebi.ac.uk/training/online/courses/ensembl-browsing-genomes/"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: INSDC / NCBI GenBank Collaboration; EMBL-EBI Ensembl & ENA training; UCSC Genome Browser FAQ; UniProt (Swiss-Prot/TrEMBL); ScienceDirect — Genome Annotation overview.*
