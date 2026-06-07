---
title: Mezitřídní a vnitrotřídní variabilita
---

# Mezitřídní a vnitrotřídní variabilita

Klíčový statistický problém biometrického rozpoznávání: **stejná osoba** dává *různá měření* a **různé osoby** mohou dávat *podobná měření*. To, jak je tato variabilita významná, určuje *dosažitelnou přesnost* biometrického systému.

## Definice

* **Vnitrotřídní variabilita** (intra-class variability, *within-class*) — *jak rozdílná* jsou různá měření *stejné* osoby v různých časech či za různých podmínek.
* **Mezitřídní variabilita** (inter-class variability, *between-class*) — *jak rozdílní* jsou různí lidé od sebe navzájem.

Ideální biometrický systém:

* **Nízká vnitrotřídní** — různá měření stejné osoby dávají *podobné* rysy.
* **Vysoká mezitřídní** — různí lidé dávají *odlišné* rysy.

::: svg "Distribuce skóre podobnosti: skóre pravých uživatelů (genuine, zelená) pro stejnou osobu, skóre podvodníků (impostor, červená) pro různé osoby. Překryv = chybové míry. Práh τ rozhoduje."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--accent)" stroke-width="2" fill="rgba(64, 192, 87, 0.3)">
    <path d="M50,180 C90,180 110,80 150,80 C190,80 210,180 250,180 Z"/>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="2" fill="rgba(220, 50, 50, 0.3)">
    <path d="M180,180 C220,180 240,100 280,100 C320,100 340,180 380,180 Z"/>
  </g>
  <g stroke="var(--text)" stroke-width="1" fill="none">
    <path d="M30,180 L500,180"/>
    <path d="M30,180 L30,30"/>
  </g>
  <g stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="3 3" fill="none">
    <path d="M215,30 L215,180"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="150" y="65" font-size="11" fill="rgb(64,192,87)">Genuine</text>
    <text x="150" y="80" font-size="10" fill="var(--text-muted)">stejná osoba</text>
    <text x="280" y="85" font-size="11" fill="rgb(220,50,50)">Impostor</text>
    <text x="280" y="100" font-size="10" fill="var(--text-muted)">různí lidé</text>
    <text x="215" y="22" font-size="11">threshold τ</text>
    <text x="265" y="200" font-size="10" fill="var(--text-muted)">distance/score</text>
    <text x="450" y="200" font-size="10" fill="var(--text-muted)">→</text>
    <text x="195" y="200" font-size="10" fill="var(--danger, #d33)">FAR oblast</text>
    <text x="235" y="200" font-size="10" fill="rgb(64,192,87)">FRR oblast</text>
  </g>
</svg>
:::

Pokud se distribuce *překrývají*, vznikají chybové míry:

* **FAR** ([[far-frr]]) — míra falešného přijetí (false accept rate), podvodník (impostor) je přijat.
* **FRR** ([[far-frr]]) — míra falešného odmítnutí (false reject rate), pravý uživatel (genuine) je odmítnut.

Práh $\tau$ určuje *rovnováhu* mezi nimi.

## Příklady variability — různé biometriky {tier=example}

### Otisky prstů

* **Vnitrotřídní variabilita:**
  * Suchá nebo vlhká pokožka — odlišný kontrast.
  * Drobná poranění, zjizvení.
  * Tlak na senzor (silný vs. lehký).
  * Rotace, posun (translation).
* **Mezitřídní variabilita:**
  * Různé vzory papilárních linií ([[klasifikace-otisku]]).
  * **Vysoká** — papilární linie jsou *prokazatelně unikátní* (Galton, 1892).

### Rozpoznávání obličeje

* **Vnitrotřídní variabilita:**
  * Natočení hlavy (pose: zepředu vs. z profilu).
  * Osvětlení (denní světlo, zářivka, infračervené IR).
  * Výraz (neutrální, úsměv, hněv).
  * Vousy, brýle, líčení.
  * Stárnutí (aging) — postupné změny.
* **Mezitřídní variabilita:**
  * *Identická dvojčata* — velmi nízká (snadné záměny).
  * Různé etnické skupiny — různé distribuce rysů.
  * **Střední až vysoká** — dostatečná pro praktické systémy s hlubokým učením (deep learning).

### Rozpoznávání hlasu

* **Vnitrotřídní variabilita:**
  * Změny hlasu při nachlazení, únavě, emocích.
  * Šepot vs. křik.
  * Tempo, intonace.
  * Mikrofon (různé spektrální charakteristiky).
* **Mezitřídní variabilita:**
  * Podobné hlasové charakteristiky u různých osob (zejména u stejného pohlaví, věku a dialektu).
  * **Nízká až střední** — proto má hlasová biometrie (voice biometry) vyšší FAR než duhovka (iris).

### Duhovka (iris)

* **Vnitrotřídní variabilita:**
  * Velmi nízká — duhovka se prakticky nemění (po prvním roce věku).
  * Drobné variace velikosti zornice (vlivem osvětlení).
* **Mezitřídní variabilita:**
  * **Extrémně vysoká** — duhovka je *nejvíce variabilní* znak mezi osobami.
  * U identických dvojčat *odlišná* (epigeneticky se utváří v nitroděložních fázích).

## Klíčový důsledek pro návrh biometrického systému

* **Duhovka (iris): ↑ mezitřídní, ↓ vnitrotřídní** → vysoká přesnost.
* **Hlas (voice): ↓ mezitřídní, ↑ vnitrotřídní** → nižší přesnost.

To vysvětluje, proč:

* **Rozpoznávání duhovky** je *zlatým standardem* pro identifikaci s vysokými nároky na bezpečnost.
* **Hlasová biometrie** se používá kvůli *pohodlí uživatele* (call centrum), nikoli pro kritickou bezpečnost.
* **Multimodální systémy** kombinují biometriky se *vzájemně se doplňujícími (komplementárními)* vlastnostmi.

## Stochastický model

Biometrický rys $\mathbf{x}$ je realizací náhodné proměnné s rozdělením $P(\mathbf{x} | \text{osoba } i)$.

* Pro **stejnou osobu**: vzorky $\mathbf{x}_1, \mathbf{x}_2$ z $P(\mathbf{x} | i)$. Distribuce skóre pravých uživatelů *genuine* $G(\text{score})$.
* Pro **různé osoby**: vzorky z $P(\mathbf{x} | i)$ a $P(\mathbf{x} | j)$, $i \neq j$. Distribuce skóre podvodníků *impostor* $I(\text{score})$.

Kvalita biometriky se měří **odlišností** těchto distribucí:

::: math
d' = \frac{|\mu_G - \mu_I|}{\sqrt{(\sigma_G^2 + \sigma_I^2)/2}}
:::

**d'** (d-prime) — normalizovaná vzdálenost (*sensitivity index*, index citlivosti) mezi středy distribucí skóre genuine a impostor; $\ge 5$ = výborné, $\ge 3$ = dobré, $\le 1$ = špatné.

## Faktory variability

* **Osoba sama** — denní změna (únava, nemoc, emoce).
* **Stárnutí (aging)** — dlouhodobé změny.
* **Prostředí (environment)** — osvětlení, vlhkost, teplota.
* **Senzor** — kvalita, kolísání (fluktuace).
* **Chování uživatele (user behavior)** — natočení (pose), vzdálenost, způsob předložení biometrie.
* **Protokol snímání (capture protocol)** — kvalita instrukcí, čas na jedno snímání.

## Zmírnění vnitrotřídní variability

* **Řízení kvality (quality control)** během registrace (enrollment) — ukládají se pouze kvalitní šablony.
* **Více vzorků (multiple samples)** — průměrování pro stabilnější šablony.
* **Adaptivní registrace (adaptive enrollment)** — periodická aktualizace šablon.
* **Normalizace (normalization)** — zarovnání (alignment), škálování, korekce osvětlení.
* **Robustní rysy (robust features)** — rysy invariantní vůči některým variabilitám (např. *log-polární* rysy zajišťující invarianci vůči rotaci).

## Zmírnění mezitřídní variability (zlepšení rozlišování)

* **Diskriminativní rysy (discriminative features)** — vybrat takové rysy, které osoby *odlišují*. Lineární diskriminační analýza (Linear Discriminant Analysis, LDA), metrické hluboké učení (deep metric learning).
* **Větší vektory rysů (larger feature vectors)** — víc dimenzí znamená větší rozlišovací schopnost (až do bodu klesajícího přínosu, diminishing returns).
* **Multimodální fúze (multimodal fusion)** — kombinace více biometrik.

---

*Zdroj: BIO přednášky 2025/26, BIO 2 — Hodnocení spolehlivosti a kvality. Externí reference: Bolle, R. M., Connell, J. H., Pankanti, S., Ratha, N. K., Senior, A. W.: *Guide to Biometrics* (Springer 2004); Daugman, J.: *How iris recognition works* (IEEE T-CSVT 2004) — [PDF](https://www.cl.cam.ac.uk/~jgd1000/csvt.pdf); NIST SP 800-76-2 *Biometric Specifications for Personal Identity Verification* (2013).*
