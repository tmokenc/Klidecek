---
title: Mezitřídní a vnitrotřídní variabilita
---

# Mezitřídní a vnitrotřídní variabilita

Klíčový statistický problém biometrického rozpoznávání: **stejná osoba** dává *různá měření* a **různé osoby** mohou dávat *podobná měření*. Jak moc je tato variabilita významná, určuje *dosažitelnou přesnost* biometrického systému.

## Definice

* **Vnitrotřídní variabilita** (intra-class variability, *within-class*) — *jak rozdílná* jsou různá měření *stejné* osoby v různých časech / podmínkách.
* **Mezitřídní variabilita** (inter-class variability, *between-class*) — *jak rozdílní* jsou různí lidé od sebe navzájem.

Ideální biometrický systém:

* **Nízká vnitrotřídní** — různá měření stejné osoby dávají *podobné* rysy.
* **Vysoká mezitřídní** — různí lidé dávají *odlišné* rysy.

::: svg "Distribuce skóre podobnosti: genuine scores (zelená) pro stejnou osobu, impostor scores (červená) pro různé osoby. Překryv = chybové míry. Threshold τ rozhoduje."
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

Pokud distribuce *překrývá*, vznikají chybové míry:

* **FAR** ([[far-frr]]) — false accept rate, impostor přijat.
* **FRR** ([[far-frr]]) — false reject rate, genuine odmítnut.

Práh $\tau$ určuje *rovnováhu* mezi nimi.

## Příklady variability — různé biometriky {tier=example}

### Otisky prstů

* **Vnitrotřídní variabilita:**
  * Suchá nebo vlhká pokožka — odlišný kontrast.
  * Drobná poranění, žárlení.
  * Tlak na senzor (silný vs. lehký).
  * Rotace, translation.
* **Mezitřídní variabilita:**
  * Různé vzory papilárních linií ([[klasifikace-otisku]]).
  * **Vysoká** — papilární linie jsou *prokazatelně unikátní* (Galton, 1892).

### Rozpoznávání obličeje

* **Vnitrotřídní variabilita:**
  * Pose (frontal vs. profile).
  * Osvětlení (denní, fluorescent, IR).
  * Výraz (neutral, úsměv, hněv).
  * Vousy, brýle, makeup.
  * Aging — postupné změny.
* **Mezitřídní variabilita:**
  * *Identická dvojčata* — velmi nízká (snadné záměny).
  * Různé etnické skupiny — různé distribuce rysů.
  * **Střední až vysoká** — dostatečná pro praktické systémy s deep learning.

### Rozpoznávání hlasu

* **Vnitrotřídní variabilita:**
  * Změny hlasu při nachlazení, únavě, emocích.
  * Šepot vs. křik.
  * Tempo, intonace.
  * Mikrofon (různé spektrální charakteristiky).
* **Mezitřídní variabilita:**
  * Podobné hlasové charakteristiky u různých osob (zejména stejného pohlaví + věku + dialektu).
  * **Nízká až střední** — proto voice biometry má vyšší FAR než iris.

### Iris (duhovka)

* **Vnitrotřídní variabilita:**
  * Velmi nízká — iris se prakticky nemění (po 1 roce věku).
  * Drobné variace velikosti pupily (osvětlení).
* **Mezitřídní variabilita:**
  * **Extrémně vysoká** — duhovka je *nejvíce variabilní* mezi osobami.
  * U identických dvojčat *odlišná* (epigeneticky tvořená v útrobních fázích).

## Klíčový důsledek pro design biometrického systému

* **Iris ↑ inter-class, ↓ intra-class** → vysoká přesnost.
* **Voice ↓ inter-class, ↑ intra-class** → nižší přesnost.

To vysvětluje, proč:

* **Iris recognition** je *gold standard* pro high-security identifikaci.
* **Voice biometry** se používá pro *user convenience* (call center), ne kritickou bezpečnost.
* **Multimodální systémy** kombinují biometriky s *komplementárními* vlastnostmi.

## Stochastický model

Biometrický rys $\mathbf{x}$ je realizací náhodné proměnné s rozdělením $P(\mathbf{x} | \text{osoba } i)$.

* Pro **stejnou osobu**: vzorky $\mathbf{x}_1, \mathbf{x}_2$ z $P(\mathbf{x} | i)$. Score distribuce *genuine* $G(\text{score})$.
* Pro **různé osoby**: vzorky z $P(\mathbf{x} | i)$ a $P(\mathbf{x} | j)$, $i \neq j$. Score distribuce *impostor* $I(\text{score})$.

Kvalita biometriky se měří **odlišností** těchto distribucí:

::: math
d' = \frac{|\mu_G - \mu_I|}{\sqrt{(\sigma_G^2 + \sigma_I^2)/2}}
:::

**d'** (d-prime) — normalizovaná vzdálenost (*sensitivity index*) mezi středy distribucí genuine a impostor skóre, $\ge 5$ = výborné, $\ge 3$ = dobré, $\le 1$ = špatné.

## Faktory variability

* **Osoba sama** — denní změna (únava, nemoc, emoce).
* **Aging** — dlouhodobé změny.
* **Environment** — osvětlení, vlhkost, teplota.
* **Senzor** — kvalita, fluktuace.
* **User behavior** — pose, distance, presentation.
* **Capture protocol** — kvalita instrukcí, time per capture.

## Mitigace vnitrotřídní variability

* **Quality control** během enrollment — pouze high-quality šablony.
* **Multiple samples** — průměrování pro stabilnější šablony.
* **Adaptive enrollment** — periodická aktualizace šablon.
* **Normalization** — alignment, scale, illumination correction.
* **Robust features** — features invariantní vůči některým variabilitám (např. *log-polar* features pro rotation invariance).

## Mitigace mezitřídní variability (zlepšení rozlišování)

* **Discriminative features** — vybrat takové rysy, které *odlišují* osoby. Linear Discriminant Analysis (LDA), deep metric learning.
* **Larger feature vectors** — víc dimenzí = víc rozlišovacích schopností (až do diminishing returns).
* **Multimodální fusion** — kombinace více biometrik.

---

*Zdroj: BIO přednášky 2025/26, BIO 2 — Hodnocení spolehlivosti a kvality. Externí reference: Bolle, R. M., Connell, J. H., Pankanti, S., Ratha, N. K., Senior, A. W.: *Guide to Biometrics* (Springer 2004); Daugman, J.: *How iris recognition works* (IEEE T-CSVT 2004) — [PDF](https://www.cl.cam.ac.uk/~jgd1000/csvt.pdf); NIST SP 800-76-2 *Biometric Specifications for Personal Identity Verification* (2013).*
