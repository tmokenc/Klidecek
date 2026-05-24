---
title: Biometrický systém
---

# Biometrický systém

**Biometrický systém** je *celý technický stack* — od senzoru, který naměří fyzikální veličinu, přes algoritmy extrahující rysy, až po porovnávací engine, který rozhodne *match / no-match*. Tento stack má **specifické komponenty**, **typické útočné body** a **dva základní operační režimy** (verifikace + identifikace).

## Architektura

::: svg "Biometrický systém: snímání → preprocessing → feature extraction → matching → decision. Enrollment (zapsání) vs. recognition (rozpoznání)."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aBS1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="60" width="90" height="40" rx="4"/>
    <rect x="120" y="60" width="90" height="40" rx="4"/>
    <rect x="220" y="60" width="90" height="40" rx="4"/>
    <rect x="320" y="60" width="90" height="40" rx="4"/>
    <rect x="420" y="60" width="100" height="40" rx="4"/>
    <rect x="220" y="160" width="90" height="40" rx="4"/>
    <rect x="320" y="160" width="100" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="65" y="85" font-size="11">Snímač</text>
    <text x="165" y="85" font-size="11">Preprocessing</text>
    <text x="265" y="85" font-size="11">Feature ext.</text>
    <text x="365" y="85" font-size="11">Matching</text>
    <text x="470" y="85" font-size="11">Decision</text>
    <text x="265" y="185" font-size="11">DB šablon</text>
    <text x="370" y="185" font-size="10">enrollment</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aBS1)">
    <path d="M110,80 L118,80"/>
    <path d="M210,80 L218,80"/>
    <path d="M310,80 L318,80"/>
    <path d="M410,80 L418,80"/>
    <path d="M265,158 L265,102"/>
    <path d="M310,180 L320,150 L370,102"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="65" y="115">obraz, audio</text>
    <text x="165" y="115">noise filter</text>
    <text x="265" y="115">128-dim vector</text>
    <text x="365" y="115">distance/score</text>
    <text x="470" y="115">match / no-match</text>
  </g>
</svg>
:::

## Komponenty

### 1. Snímač (sensor)

* **Otisky prstů:** capacitive (smartphone), optical (police), ultrasonic (under-display), thermal.
* **Obličej:** kamera RGB, IR (Face ID), depth (TrueDepth, ToF), 3D scanner.
* **Duhovka:** NIR kamera (700–900 nm), specifická pro pigment iridocyklický.
* **Hlas:** mikrofon (vyšší kvalita = lepší výsledky).
* **Podpis:** digitizer tablet (Wacom, capacitive screens).
* **DNA:** chemická analýza ([[dna-struktura]]).

Kvalita senzoru určuje **horní mez** přesnosti celého systému — neopravitelná pomocí algoritmu.

### 2. Preprocessing

Příprava raw data pro feature extraction:

* **Noise filtering** — gaussian blur, median filter, denoising.
* **Normalization** — jas, kontrast, scale, rotation.
* **Segmentation** — oddělení biometrického objektu od pozadí (např. obličej v scéně).
* **Quality assessment** — *je* obrázek dostatečně dobrý? (NFIQ pro fingerprints, Sharpness/Pose pro face).

Pokud kvalita nedostatečná → odmítnutí enrollment / recognition s žádostí o opakování.

### 3. Feature extraction

Z naměřených dat se vypočte **kompaktní reprezentace** (vektor rysů):

* **Otisky prstů:** seznam markantů (souřadnice + orientace + typ), ~30–100 markantů.
* **Duhovka:** Daugman iris code, 2048 bitů ([[daugman]]).
* **Obličej:** embedding vector 128–512 dim (FaceNet, ArcFace).
* **Hlas:** MFCC features + i-vectors / x-vectors.

Vektor rysů je *podstatně menší* než raw data (kompaktní storage, fast matching).

### 4. Matching / Comparison

Porovnání aktuálního vzorku se *šablonou*:

* **Distance-based:** Euclidean, Hamming, cosine distance mezi vektory.
* **Geometric:** alignment markantů + scoring (fingerprints).
* **Score:** vyšší = lepší shoda.

### 5. Decision

Porovnání score s **prahem** (threshold) $\tau$:

* Score > $\tau$ → **match**.
* Score < $\tau$ → **no match**.

Threshold určuje **trade-off** mezi false accept rate (FAR) a false reject rate (FRR) — viz [[far-frr]].

## Dva režimy systému

### Verifikační režim (1:1)

::: svg "Verifikační režim: claimed identity → fetch template → compare with sample → match / no-match."
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aBSV" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="50" width="90" height="40" rx="4"/>
    <rect x="130" y="50" width="90" height="40" rx="4"/>
    <rect x="240" y="20" width="90" height="40" rx="4"/>
    <rect x="240" y="80" width="90" height="40" rx="4"/>
    <rect x="350" y="50" width="90" height="40" rx="4"/>
    <rect x="450" y="50" width="80" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="65" y="75" font-size="11">claim ID</text>
    <text x="175" y="75" font-size="11">capture</text>
    <text x="285" y="44" font-size="11">DB lookup</text>
    <text x="285" y="104" font-size="11">extract</text>
    <text x="395" y="75" font-size="11">compare</text>
    <text x="490" y="75" font-size="11">decision</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aBSV)">
    <path d="M110,70 L128,70"/>
    <path d="M220,70 L238,40"/>
    <path d="M220,70 L238,100"/>
    <path d="M330,40 L348,70"/>
    <path d="M330,100 L348,70"/>
    <path d="M440,70 L448,70"/>
  </g>
</svg>
:::

* Uživatel **deklaruje** svou identitu (PIN, login, karta).
* Systém *načte* uloženou šablonu pro tuto identitu.
* *Porovná* aktuální naměřený vzorek se *jednou* šablonou.
* Computational complexity: $O(1)$ comparison.

### Identifikační režim (1:N)

* Uživatel *neuvádí* identitu.
* Systém *porovná* aktuální vzorek se **všemi** šablonami v databázi.
* Najde *nejbližší* šablonu (nebo *no match*).
* Computational complexity: $O(N)$ comparisons.
* Vyžaduje *indexing* pro velké databáze (např. K-D tree, locality-sensitive hashing).

## Životní cyklus uživatele

### Enrollment (zapsání)

Inicializace uživatele v systému:

1. **Snímání** kvalitního biometrického vzorku (typicky více vzorků pro průměr).
2. **Quality check** — pokud nedostatečné, požaduje opakování.
3. **Feature extraction** + **template generation**.
4. **Storage** šablony v DB (cipher-text, on-device storage).
5. *Associace* s identitou (user ID, claim).

### Recognition (rozpoznání)

Standardní operace:

1. **Snímání** aktuálního vzorku.
2. **Feature extraction**.
3. **Matching** s šablonou(ami).
4. **Decision**.

### Update

* Šablony se mohou s časem zhoršovat (aging, životní změny).
* **Adaptive enrollment** — periodická aktualizace šablony.
* **Re-enrollment** — explicit obnovení (např. po operaci ruky).

## Možnosti útoků na biometrický systém

::: svg "Útočné body: 1 senzor (spoof), 2 přenos (replay), 3 feature extraction (substitute), 4 template DB (steal), 5 matcher (override), 6 decision (modify), 7 channel blocking (jam)."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aBSA" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--danger, #d33)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="60" width="80" height="40" rx="4"/>
    <rect x="120" y="60" width="80" height="40" rx="4"/>
    <rect x="220" y="60" width="80" height="40" rx="4"/>
    <rect x="320" y="60" width="80" height="40" rx="4"/>
    <rect x="420" y="60" width="100" height="40" rx="4"/>
    <rect x="200" y="160" width="100" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="60"  y="84" font-size="10.5">sensor</text>
    <text x="160" y="84" font-size="10.5">prep.</text>
    <text x="260" y="84" font-size="10.5">extract</text>
    <text x="360" y="84" font-size="10.5">match</text>
    <text x="470" y="84" font-size="10.5">decide</text>
    <text x="250" y="186" font-size="10.5">DB šablon</text>
  </g>
  <g fill="var(--danger, #d33)" text-anchor="middle" font-size="10" font-weight="bold">
    <text x="60"  y="42">1 spoof</text>
    <text x="110" y="42">2 replay</text>
    <text x="260" y="42">3 substitute</text>
    <text x="250" y="220">4 steal DB</text>
    <text x="360" y="42">5 override</text>
    <text x="470" y="42">6 modify</text>
    <text x="160" y="125">7 jam channel</text>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="1.2" fill="none" marker-end="url(#aBSA)" stroke-dasharray="3 3">
    <path d="M60,50 L60,58"/>
    <path d="M115,50 L115,58"/>
    <path d="M260,50 L260,58"/>
    <path d="M360,50 L360,58"/>
    <path d="M470,50 L470,58"/>
    <path d="M160,118 L160,102"/>
    <path d="M250,210 L250,202"/>
  </g>
</svg>
:::

Sedm typických útoků (Ratha-Connell-Bolle 2001):

1. **Sensor spoofing** — fake finger, mask, contact lens, deepfake video.
2. **Replay** — záznam legitimní transakce + opakování.
3. **Override feature extractor** — útočník nahradí extracted features.
4. **Steal template database** — copy šablon, mass impersonation.
5. **Override matcher** — útočník přiměje matcher vždy vrátit "match".
6. **Modify decision** — final stage; bit flip.
7. **Channel blocking** — DoS by jamming komunikační kanál.

Detailně v [[typy-utoku]].

## Specifické problémy

### Mezitřídní a vnitrotřídní variabilita

* **Mezitřídní variabilita** (inter-class) — *jak rozdílní* jsou různí lidé. Vysoká = dobré.
* **Vnitrotřídní variabilita** (intra-class) — *jak rozdílná* jsou různá měření *téhož* člověka. Nízká = dobré.

Detailně [[variabilita]].

### Stárnutí (aging)

* Biometrické rysy se *mění s časem*:
  * Obličej: vrásky, hubnutí, vousy.
  * Hlas: hloubka, prosodie (puberta, věk).
  * Otisky prstů: relativně stabilní, ale opotřebení (pracovníci s rukama, stárnutí).
  * Duhovka: relativně velmi stabilní (nejstabilnější).
* Vyžaduje **re-enrollment** každých N let nebo *adaptive* algoritmy.

### Dvojčata

* **Identická dvojčata** mají *velmi* podobnou DNA — sdílení 99.99 % DNA.
* Otisky prstů jsou **odlišné** (vznikají *epigeneticky* během vývoje fetuse).
* Iris **odlišné**.
* Obličej, hlas — velmi podobné; biometric systems často chybují u dvojčat.

### Děti

* Biometrika se v dětství *mění rychle* (obličej, výška, váha).
* Otisky prstů jsou *velmi malé* — obtížné snímání u dětí.
* US-VISIT vyžaduje fingerprint enrollment **od 14 let**.
* Děti vyžadují periodický re-enrollment.

---

*Zdroj: BIO přednášky 2025/26, BIO 1 — Úvod do biometrických systémů. Externí reference: Jain, A. K., Ross, A., Nandakumar, K.: *Introduction to Biometrics* (Springer 2011), kap. 1; Ratha, N., Connell, J. H., Bolle, R. M.: *An Analysis of Minutiae Matching Strength* (AVBPA 2001); ISO/IEC 19794 *Biometric data interchange formats*.*
