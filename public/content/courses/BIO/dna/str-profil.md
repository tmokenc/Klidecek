---
title: STR profil a CODIS
---

# STR profil a CODIS

**STR profil** je *standardní formát* lidské DNA pro forenzní identifikaci. **CODIS** (Combined DNA Index System) je specifikace FBI, která definuje *konkrétních 20 STR lokusů* používaných pro celonárodní DNA databázi. Pochopení STR profilu je nezbytné pro biometrii založenou na DNA (biometric DNA), forenzní vyšetřování (forensic investigations) a určování otcovství (paternity testing).

## STR — Short Tandem Repeats

STR (short tandem repeats, krátké tandemové repetice) jsou krátké sekvence DNA (2–6 párů bází, base pairs), které se *opakují tandemově* (tedy bezprostředně za sebou) v genomu.

### Příklad

* Sekvence: `...AATG-AATG-AATG-AATG-AATG-...`
* **Opakující se jednotka (repeat unit):** AATG (4 bp).
* **Počet opakování (repeat count):** 5.
* **Alela (allele):** 5 (pojmenovaná podle počtu opakování).

Lokus může mít u různých osob *různý* počet alel — typicky 5–30 opakování.

### Polymorfismus

* **Heterozygot (heterozygote):** osoba má na daném lokusu *dvě různé* alely (jednu od matky, jednu od otce). Např. (9, 13).
* **Homozygot (homozygote):** osoba má *stejnou* alelu na obou chromozomech. Např. (11, 11).
* **Frekvence alel (allele frequencies):** liší se podle populace (jiné jsou u Čechů, jiné u Japonců a jiné u Afričanů).

## CODIS lokusy

::: svg "CODIS: 20 STR lokusů rozmístěných napříč všemi 22 autozomy a chromozomy X/Y."
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

Rozšířené jádro CODIS (CODIS Expanded Core, od roku 2017) obsahuje **20 STR lokusů** (oproti původním 13). Tyto lokusy jsou:

* **Geograficky rozmístěné** — napříč více chromozomy (nejsou ve vazbě, no linkage).
* **Vysoce polymorfní** — 10–40 alel na lokus.
* **Standardizované** — stejné lokusy používá FBI, EU i Interpol.

### Marker pohlaví — AMEL

* **Amelogenin** (AMEL) — gen přítomný na chromozomu X i Y.
* Varianta na X je o 6 bp kratší než varianta na Y.
* Kapilární elektroforéza (CE) v laboratoři ukáže:
  * **Žena:** jediný pík (XX).
  * **Muž:** dvojitý pík (X + Y).

### Y-STR (STR na chromozomu Y)

* Specifické pro **muže** (pouze chromozom Y).
* Používají se při vyšetřování **sexuálních útoků** (oddělení mužské DNA ze smíšeného vzorku).
* Y-STR se *dědí* z otce na syna beze změny — umožňují *patrilineární* identifikaci (po otcovské linii).

### X-STR

* Méně časté.
* Používají se při určování otcovství, když není otec k dispozici.

## Pravděpodobnost shody (match probability)

Pro **20 lokusů CODIS** u pozorovaného STR profilu platí:

* **Pravděpodobnost náhodné shody (random match probability, RMP):** pravděpodobnost, že *nepříbuzná* osoba má stejný profil.
* Typická RMP: $10^{-20}$ až $10^{-30}$.

To znamená:

* Pravděpodobnost 1 ku $10^{20}$ — lidí je zhruba $10^{10}$, takže náhodná shoda je prakticky vyloučená.
* U soudu se to formuluje takto: „pravděpodobnost, že náhodná nepříbuzná osoba má tento profil, je přibližně 1 ku N“.

::: viz str-profile-match "Porovnání podezřelého s místem činu přes 13 lokusů CODIS (původní jádro CODIS); jediný nesoulad = vyloučení."
:::

## Specifické situace

### Jednovaječná dvojčata

* **Profily CODIS jsou prakticky identické.**
* Pomocí standardních STR je nelze rozlišit.
* **Jak to obejít:**
  * Specializované SNP panely.
  * Epigenetické markery (rozdíly v metylaci).
  * Mikrobiom (střevní bakterie se liší).

### Členové rodiny

* **Rodiče a děti:** sdílejí 50 % STR alel (na každém lokusu se dědí jedna alela).
* **Sourozenci:** sdílejí 25–75 % (podle náhodného dědění).
* **Genetická genealogie (genetic genealogy)** těchto vzorců dědičnosti využívá.

### Smíšené vzorky

* **Více přispěvatelů** — píky od více osob se překrývají.
* Software pro **pravděpodobnostní genotypizaci (probabilistic genotyping)** (STRmix, TrueAllele) počítá poměry věrohodnosti (likelihood ratios).
* Soudní spory — různý software někdy dává různé výsledky.

## Software pro analýzu STR

* **GeneMapper ID-X** (Thermo Fisher) — průmyslový standard pro určování alel (allele calling).
* **OSIRIS** (NIST) — zdarma, open-source.
* **GeneScan** — starší.

Výstupem je tabulka STR profilu:

| Lokus | Alela 1 | Alela 2 |
| :--- | :---: | :---: |
| D3S1358 | 14 | 17 |
| vWA | 16 | 17 |
| FGA | 21 | 24 |
| D8S1179 | 13 | 15 |
| ... | ... | ... |

## Databáze STR profilů

### CODIS (FBI)

* **National DNA Index System (NDIS)** — přes 14 milionů profilů.
* Kategorie:
  * **Odsouzení pachatelé.**
  * **Zadržení** (liší se podle státu).
  * **Neznámé profily z míst činu.**
* Porovnání: forenzní vzorky → databáze pachatelů.

### European Standard Set (ESS)

* **12 jádrových lokusů** společných s CODIS.
* Používá se při výměně dat v rámci Eurodacu a Prümské smlouvy.
* Všechny národní databáze EU jsou vzájemně kompatibilní.

### Česká databáze

* **Policejní DNA databáze** — spravuje ji Policie ČR.
* Přibližně 70 000 profilů (data k roku 2023).
* Napojená na systém Prüm v EU.

### Spotřebitelská genetika (DTC, direct-to-consumer)

* **23andMe, AncestryDNA, MyHeritage** — *založené na SNP*, nikoli na STR.
* Mají odlišnou datovou strukturu, ale *lze je křížově porovnat* s forenzními daty.
* Využívají se v *investigativní genetické genealogii* (případ Golden State Killer, 2018).

## Praktická aplikace {tier=practice}

### Forenzní identifikace

* Vzorek z **místa činu** → vyhledání v CODIS.
* Shoda → podezřelý.
* Žádná shoda → nevyřešený případ (cold case).

### Určování otcovství

* Porovná se STR profil dítěte s profilem domnělého otce.
* Pokud dítě na některém lokusu *nemá žádnou* alelu od otce → vyloučení.
* Pokud dítě alely sdílí → vypočítá se **index otcovství (paternity index)**.

### Identifikace obětí katastrof (disaster victim identification, DVI)

* Spárování obětí s rodinnými příslušníky (DNA z hlášení o pohřešovaných osobách).
* 11. září, tsunami 2004, letecké havárie Boeingů.
* Protokoly **Interpol DVI**.

### Pohřešované osoby

* DNA databáze neznámých ostatků.
* DNA od rodinných příslušníků.
* Shoda → identifikace.

### Imigrace / sloučení rodiny

* Ověření rodinných vztahů pomocí DNA.
* USA, EU i Velká Británie někdy vyžadují při imigraci DNA.

## Limity

### Čas

* **Standardní analýza STR:** 6–72 hodin.
* **Rapid DNA:** 90 minut (specializované přístroje — FBI je nasazuje od roku 2017).

### Cena

* **Na jeden vzorek:** 50–500 USD.
* **Vysokokapacitní laboratoře** ji dokážou snížit.

### Uchovávání

* DNA vzorky se v mnoha jurisdikcích uchovávají *desítky let*.
* Vznikají obavy o soukromí kvůli dlouhodobému uchovávání.

### Kvalita

* **Touch DNA (DNA z dotyku) a smíšené vzorky** — neúplné profily.
* **Degradované vzorky** — vypadávají dílčí lokusy.

## Právní rámce (legal frameworks)

* **USA:** sběr a uchovávání upravují státní i federální zákony.
* **EU:** GDPR + článek 9 (zvláštní kategorie údajů — biometrické).
* **Česká republika:** sběr DNA reguluje zákon o policii (273/2008 Sb.).

Omezení:
* Podezřelí s obviněním → určité uchovávání.
* Zproštění obvinění → většinou *povinné smazání*.
* Odsouzení → dlouhodobé uchovávání.

## Trendy

* **Rapid DNA** — analýza přímo na místě (point-of-care) na policejních stanicích a na hranicích.
* **NGS (Next-Generation Sequencing, sekvenování nové generace)** — čtení více lokusů, včetně SNP.
* **Investigativní genetická genealogie** — využití spotřebitelských databází pro nevyřešené případy.
* **DNA fenotypizace (DNA phenotyping)** — předpovídání vzhledu (barva očí, vlasů, původ) z DNA. Kontroverzní.

---

*Zdroj: BIO přednášky 2025/26, BIO 7 — DNA a její využití v biometrii (Drahanský, Doležel, Sakin). Externí reference: Butler, J. M.: *Forensic DNA Typing: Biology, Technology, and Genetics of STR Markers* (2nd ed., Elsevier 2005); FBI CODIS Expanded Core Loci (2017); European Network of Forensic Science Institutes — DNA Working Group; Prüm Treaty (2005) and EU Decision 2008/615/JHA.*
