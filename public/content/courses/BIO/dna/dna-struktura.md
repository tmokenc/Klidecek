---
title: DNA — struktura a princip
---

# DNA — struktura a princip

**DNA** (deoxyribonukleová kyselina) je *zlatý standard* biometrické identifikace. Žádná jiná modalita nedosahuje její *jedinečnosti* (s výjimkou identických dvojčat) ani *stability* (v čase se nemění). Daní za to je, že je *pomalá* (analýza trvá hodiny až dny, nikoli v reálném čase), *invazivní* (vyžaduje fyzický vzorek) a přináší *etické* a *právní* problémy.

## Chemická struktura

::: svg "DNA struktura: dvojitá šroubovice; cukr-fosfátové páteře, párování bází (A=T, G≡C) uvnitř."
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
    <line x1="180" y1="120" x2="220" y2="120"/>
    <line x1="155" y1="140" x2="245" y2="140"/>
    <line x1="180" y1="160" x2="220" y2="160"/>
    <line x1="155" y1="180" x2="245" y2="180"/>
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

* **Dvojitá šroubovice** (double helix) — objevili ji Watson a Crick v roce 1953 (Nobelova cena 1962).
* **Cukr-fosfátová páteř** (sugar-phosphate backbone) — tvoří ji cukr deoxyribóza a fosfátové skupiny.
* **Báze (nucleobases):**
  * **A (Adenin)** se páruje s **T (Thymin)** — dvěma vodíkovými vazbami.
  * **G (Guanin)** se páruje s **C (Cytosin)** — třemi vodíkovými vazbami.
* **Komplementarita** — A=T, G=C. Každé vlákno tak jednoznačně určuje to druhé.

## Lidský genom

* **3,2 miliardy** párů bází.
* **~20 000 genů** (kódujících proteiny).
* **23 párů chromozomů** (22 *autozomů* a 1 pár pohlavních chromozomů, XX nebo XY).
* **~99,9 % shoda** mezi všemi lidmi.
* **~0,1 % variability** — což odpovídá přibližně 3 milionům bází.

Pro biometriku stačí *velmi malá* část tohoto genomu — *vysoce polymorfní oblasti* (highly polymorphic regions), tedy místa, ve kterých se lidé výrazně liší.

## Polymorfismy DNA

### SNP (Single Nucleotide Polymorphisms)

* **Jednotlivé báze** se mezi osobami liší.
* V lidské populaci je jich **~10 milionů**.
* Některé jsou **velmi vzácné**, jiné běžné.
* Využití: zjišťování původu (ancestry), celogenomové asociační studie (GWAS, genome-wide association studies) a částečně i forenzní praxe.

### STR (Short Tandem Repeats)

* **Krátké sekvence (2–6 bp)**, které se *opakují* za sebou.
* Příklad: `CATG-CATG-CATG-CATG` (4× opakování CATG).
* **Počet opakování** se mezi osobami *liší* (typicky 1–50).
* **Lokusy STR** (konkrétní pozice v genomu) jsou *vysoce polymorfní*.

### CODIS — Combined DNA Index System

Standard FBI:

* **20 lokusů STR** (v roce 2017 rozšířeno z původních 13).
* Slouží k identifikaci osoby ve *forenzním* kontextu.
* **Pravděpodobnost shody (match probability):** ~$10^{-20}$ u nepříbuzných osob.
* Používá se v systému **NDIS** (National DNA Index System) — více než 14 milionů profilů.

### European Standard Set (ESS)

* **12 lokusů STR** pro propojení forenzních databází v rámci EU.
* **Eurodac**, **Prümská smlouva (Prüm Treaty)** — automatizovaná výměna údajů mezi DNA databázemi EU.

## Klíčové vlastnosti DNA

### Unikátnost

* **Žádné dvě** osoby, které nejsou identická dvojčata, nemají *stejný* profil CODIS.
* Pravděpodobnost shody u nepříbuzných osob: ~$10^{-20}$ — výrazně lepší než u otisku prstu nebo duhovky.

### Stálost

* **Stejná** v každé buňce těla.
* **Nemění se** s věkem.
* **Stejná** po celý život.
* **Stejná** i po smrti — umožňuje *posmrtnou (post-mortem)* identifikaci.

### Identická dvojčata

* **Sdílejí ~99,99 % DNA** (s několika náhodnými mutacemi vzniklými během vývoje).
* Profil CODIS je u identických dvojčat *prakticky totožný*.
* **Speciální markery** (epigenetické, konkrétní SNP) je někdy dokážou rozlišit.

## Sběr vzorků DNA

### Bukální stěr (ústní stěr)

* **Bavlněný tampon** (cotton swab), kterým se setře vnitřní strana tváře.
* **Rychlý a neinvazivní.**
* **Bezbolestný.**
* Standard pro dobrovolnou registraci (voluntary enrollment).

### Krev

* **Venepunkce (venepuncture)** — odběr žilní krve.
* **Vyšší výtěžek DNA.**
* Více invazivní.

### Sliny

* **Vzorek slin** — odebírá se do zkumavky.
* DNA pochází z bukálních buněk obsažených ve slinách.

### Tkáňové vzorky

* **Tělní tkáň** — z pitvy nebo biopsie.
* **Vlasový kořínek** (i s folikulem) — obsahuje DNA; ustřižený stvol vlasu jadernou DNA NEobsahuje (pouze mitochondriální).

### Touch DNA

* **Kožní buňky** zanechané na dotčených předmětech.
* **Velmi malé množství** (jediná buňka obsahuje ~6 pg DNA).
* Vyžaduje analýzu *nízkého počtu kopií* (LCN, low copy number).
* Využívá se ve forenzní praxi.

### Forenzní stopy

* **Krevní stopy.**
* **Sperma** — mužská DNA, využívá se při vyšetřování sexuálního napadení.
* **Slina** — z cigaret, sklenic, obálek.
* **Vlasové cibulky** (hair follicles).
* **Tkáň pod nehty** — z obranného poškrábání.
* **Ostatní biologické stopy.**

## Analýza DNA — pipeline

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

* **Rozrušení buněk (cell lysis)** — porušení buněčných stěn a membrán.
* **Štěpení proteinů (protein digestion)** — pomocí proteinázy K.
* Čištění metodou **fenol-chloroform** nebo přes **silikagelovou kolonu (silica column)**.
* Výstup: čistá DNA v roztoku.

### 2. Kvantifikace

* **qPCR** (kvantitativní PCR) — změří koncentraci DNA.
* Je nutná proto, že PCR pracuje nejlépe se známým množstvím vstupní DNA.

### 3. PCR amplifikace

* **Polymerázová řetězová reakce (Polymerase Chain Reaction)** — namnoží konkrétní oblasti STR.
* **Primery** lemující každý lokus STR.
* **20–30 cyklů** — exponenciální namnožení.
* Výstup: miliony kopií oblastí STR.

### 4. CE (kapilární elektroforéza, Capillary Electrophoresis)

* Produkty PCR se v kapiláře *rozdělí podle velikosti*.
* **Detekce** probíhá pomocí fluorescence (primery PCR jsou fluorescenčně značené).
* Každý lokus STR přispívá jedním nebo více vrcholy (peaks) na příslušné velikosti.

::: viz dna-electropherogram "Elektroferogram s vrcholy na jednotlivých fluorescenčních kanálech; přepněte mezi jedním vzorkem, směsí a LCN."
:::

### 5. STR profil

* Analytický software (GeneMapper, OSIRIS) — určuje *alely* (konkrétní počty opakování).
* Profil = vektor trojic (lokus, alela 1, alela 2) pro více než 20 lokusů.
* Porovná se s databází nebo s profilem podezřelého.

## Cena a čas

* **Cena:** 50–500 USD za analýzu.
* **Čas:** *standardně* 6–72 hodin laboratorní práce.
* **Rapid DNA:** 90 minut, automatizované systémy (nasazené na některých policejních odděleních a hraničních přechodech).

## Databáze DNA

| Databáze | Region | Velikost |
| :--- | :--- | :---: |
| **FBI NDIS / CODIS** | USA | 14M+ profilů |
| **UK National DNA Database** | Velká Británie | 5,6M |
| **GEDmatch / FTDNA** | civilní genealogie | po 1M+ |
| **MyHeritage / 23andMe** | spotřebitelské | po 12M+ |
| **Czech DNA databáze** | ČR | ~70 000 (policie) |

Civilní (genealogické) databáze už byly použity ve forenzním *vyšetřovacím* kontextu (případ Golden State Killer 2018) — jde o kontroverzní využití.

## Limity DNA biometrie

### Identická dvojčata

* **Nelze je rozlišit** standardním systémem CODIS.
* Je potřeba *specializovaná* analýza SNP nebo epigenetická analýza.

### Smíšené vzorky

* **Více přispěvatelů** (např. na místě činu).
* Software pro **pravděpodobnostní genotypizaci (probabilistic genotyping)** (STRmix, TrueAllele) — počítá poměry věrohodnosti (likelihood ratios).
* U soudů vyvolává spory — kvůli validaci softwaru.

### Kontaminace

* Kontaminace DNA od laboratorního personálu nebo z prostředí.
* Řeší se přísnými protokoly a negativními kontrolami.

### Degradace

* Staré nebo poškozené vzorky — neúplné profily.
* Touch DNA — problémy s nízkým počtem kopií.

### Mitochondriální DNA (mtDNA)

* Dědí se pouze po mateřské linii.
* Je méně jedinečná než jaderná DNA.
* Používá se tam, kde jaderná DNA není k dispozici (prastaré ostatky, stvol vlasu).

---

*Zdroj: BIO přednášky 2025/26, BIO 7 — DNA a její využití v biometrii (Drahanský, Doležel, Sakin). Externí reference: Butler, J. M.: *Fundamentals of Forensic DNA Typing* (Academic Press 2010); Watson, J. D., Crick, F. H. C.: *Molecular Structure of Nucleic Acids* (Nature 1953); FBI CODIS — [fbi.gov/services/laboratory/biometric-analysis/codis](https://www.fbi.gov/services/laboratory/biometric-analysis/codis); European Network of Forensic Science Institutes (ENFSI) — [enfsi.eu](https://enfsi.eu/).*
