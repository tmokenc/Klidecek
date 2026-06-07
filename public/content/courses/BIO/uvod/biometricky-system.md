---
title: Biometrický systém
---

# Biometrický systém

**Biometrický systém** je *celý technický řetězec (stack)* — od senzoru, který naměří fyzikální veličinu, přes algoritmy extrahující rysy, až po porovnávací engine, který rozhodne o shodě (*match / no-match*). Tento řetězec má **specifické komponenty**, **typické útočné body** a **dva základní operační režimy** (verifikaci a identifikaci).

## Architektura

::: svg "Biometrický systém: snímání → předzpracování (preprocessing) → extrakce rysů (feature extraction) → porovnávání (matching) → rozhodnutí (decision). Zapsání (enrollment) vs. rozpoznání (recognition)."
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
    <text x="282" y="138" font-size="9.5" text-anchor="start">enrollment</text>
    <text x="370" y="185" font-size="10">recognition</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aBS1)">
    <path d="M110,80 L118,80"/>
    <path d="M210,80 L218,80"/>
    <path d="M310,80 L318,80"/>
    <path d="M410,80 L418,80"/>
    <path d="M265,102 L265,158"/>
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

* **Otisky prstů:** kapacitní (smartphone), optický (policie), ultrazvukový (pod displejem) a termální.
* **Obličej:** RGB kamera, infračervená (IR) kamera (Face ID), hloubková kamera (TrueDepth, ToF) a 3D skener.
* **Duhovka:** kamera v blízkém infračerveném pásmu (NIR, 700–900 nm), kde je melanin duhovky téměř průhledný, takže vzor je čitelný i u tmavých očí.
* **Hlas:** mikrofon (čím vyšší kvalita, tím lepší výsledky).
* **Podpis:** digitizační tablet (Wacom, kapacitní obrazovky).
* **DNA:** chemická analýza ([[dna-struktura]]).

Kvalita senzoru určuje **horní mez** přesnosti celého systému — tu už žádný algoritmus dodatečně neopraví.

### 2. Předzpracování (preprocessing)

Příprava surových dat (raw data) pro extrakci rysů:

* **Filtrování šumu (noise filtering)** — gaussovské rozostření (gaussian blur), mediánový filtr, odšumování (denoising).
* **Normalizace** — jasu, kontrastu, měřítka i natočení.
* **Segmentace** — oddělení biometrického objektu od pozadí (např. obličeje ve scéně).
* **Posouzení kvality (quality assessment)** — *je* obrázek dostatečně dobrý? (NFIQ pro otisky prstů, ostrost a natočení pro obličej).

Pokud je kvalita nedostatečná, systém zapsání nebo rozpoznání odmítne a požádá o opakování.

### 3. Extrakce rysů (feature extraction)

Z naměřených dat se vypočte **kompaktní reprezentace** (vektor rysů):

* **Otisky prstů:** seznam markantů (souřadnice + orientace + typ), přibližně 30–100 markantů.
* **Duhovka:** Daugmanův iris code, 2048 bitů ([[daugman]]).
* **Obličej:** vektor příznaků (embedding) o 128–512 dimenzích (FaceNet, ArcFace).
* **Hlas:** příznaky MFCC + i-vektory / x-vektory.

Vektor rysů je *podstatně menší* než surová data, takže umožňuje kompaktní uložení a rychlé porovnávání.

### 4. Porovnávání (matching / comparison)

Porovnání aktuálního vzorku s *šablonou*:

* **Na základě vzdálenosti (distance-based):** euklidovská, Hammingova nebo kosinová vzdálenost mezi vektory.
* **Geometrické:** zarovnání (alignment) markantů a bodové ohodnocení (otisky prstů).
* **Skóre (score):** čím vyšší, tím lepší shoda.

### 5. Rozhodnutí (decision)

Porovnání skóre s **prahem** (threshold) $\tau$:

* Skóre > $\tau$ → **shoda (match)**.
* Skóre < $\tau$ → **bez shody (no match)**.

Práh určuje **kompromis (trade-off)** mezi mírou chybného přijetí (false accept rate, FAR) a mírou chybného odmítnutí (false reject rate, FRR) — viz [[far-frr]].

## Dva režimy systému

### Verifikační režim (1:1)

::: svg "Verifikační režim: deklarovaná identita (claimed identity) → načtení šablony → porovnání se vzorkem → shoda / bez shody (match / no-match)."
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
    <path d="M65,50 L65,10 L240,30"/>
    <path d="M220,70 L238,100"/>
    <path d="M330,40 L348,70"/>
    <path d="M330,100 L348,70"/>
    <path d="M440,70 L448,70"/>
  </g>
</svg>
:::

* Uživatel **deklaruje** svou identitu (PIN, login, karta).
* Systém *načte* uloženou šablonu pro tuto identitu.
* *Porovná* aktuální naměřený vzorek s *jednou* šablonou.
* Výpočetní složitost: jedno porovnání, tedy $O(1)$.

### Identifikační režim (1:N)

* Uživatel *neuvádí* identitu.
* Systém *porovná* aktuální vzorek se **všemi** šablonami v databázi.
* Najde *nejbližší* šablonu (nebo žádnou shodu, *no match*).
* Výpočetní složitost: $N$ porovnání, tedy $O(N)$.
* Pro velké databáze vyžaduje *indexování* (např. K-D strom, locality-sensitive hashing).

## Životní cyklus uživatele

### Zapsání (enrollment)

Inicializace uživatele v systému:

1. **Snímání** kvalitního biometrického vzorku (typicky více vzorků pro zprůměrování).
2. **Kontrola kvality (quality check)** — pokud je nedostatečná, vyžádá si opakování.
3. **Extrakce rysů** a **vygenerování šablony (template generation)**.
4. **Uložení (storage)** šablony v databázi (v zašifrované podobě, tedy jako cipher-text, případně na zařízení uživatele, on-device storage).
5. *Přiřazení* k identitě (uživatelské ID, deklarovaná identita).

### Rozpoznání (recognition)

Standardní operace:

1. **Snímání** aktuálního vzorku.
2. **Extrakce rysů (feature extraction)**.
3. **Porovnání (matching)** se šablonou (či šablonami).
4. **Rozhodnutí (decision)**.

### Aktualizace (update)

* Šablony se mohou v čase zhoršovat (stárnutí, životní změny).
* **Adaptivní zapsání (adaptive enrollment)** — periodická aktualizace šablony.
* **Opětovné zapsání (re-enrollment)** — explicitní obnovení (např. po operaci ruky).

## Možnosti útoků na biometrický systém

::: svg "Útočné body (Ratha 2001): 1 senzor (podvržení, spoof), 2 kanál senzor→extraktor (přehrání, replay), 3 extrakce rysů (záměna, substitute), 4 kanál extraktor→matcher (přehrání, replay), 5 databáze šablon (krádež, steal), 6 matcher (přepsání, override), 7 rozhodnutí (úprava, modify); 8 blokování kanálu (zahlcení, jam, DoS) navíc mimo taxonomii."
<svg viewBox="0 0 540 228" font-family="ui-sans-serif, system-ui" font-size="11">
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
    <text x="310" y="42">4 replay</text>
    <text x="250" y="220">5 steal DB</text>
    <text x="360" y="42">6 override</text>
    <text x="470" y="42">7 modify</text>
    <text x="160" y="125">8 jam (DoS)</text>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="1.2" fill="none" marker-end="url(#aBSA)" stroke-dasharray="3 3">
    <path d="M60,50 L60,58"/>
    <path d="M115,50 L115,58"/>
    <path d="M260,50 L260,58"/>
    <path d="M310,50 L310,58"/>
    <path d="M360,50 L360,58"/>
    <path d="M470,50 L470,58"/>
    <path d="M160,118 L160,102"/>
    <path d="M250,210 L250,202"/>
  </g>
</svg>
:::

Sedm typických útoků (Ratha-Connell-Bolle 2001) a navíc útok na dostupnost (DoS):

1. **Podvržení senzoru (sensor spoofing)** — falešný prst, maska, kontaktní čočka, deepfake video.
2. **Přehrání, kanál senzor→extraktor (replay)** — záznam legitimní transakce a její opakované přehrání.
3. **Přepsání extraktoru rysů (override feature extractor)** — útočník (attacker) nahradí extrahované rysy svými.
4. **Přehrání, kanál extraktor→matcher (replay)** — odposlech a přehrání komunikace mezi extraktorem a matcherem.
5. **Krádež databáze šablon (steal template database)** — zkopírování šablon a hromadné vydávání se za jiné osoby (mass impersonation).
6. **Přepsání matcheru (override matcher)** — útočník přiměje matcher, aby vždy vrátil „shodu" (match).
7. **Úprava rozhodnutí (modify decision)** — poslední fáze; převrácení jednoho bitu výsledku (bit flip).
8. **Blokování kanálu (channel blocking)** — útok typu DoS zahlcením (jamming) komunikačního kanálu (útok na dostupnost, availability, mimo Rathovu taxonomii).

Podrobně v [[typy-utoku]].

## Specifické problémy

### Mezitřídní a vnitrotřídní variabilita

* **Mezitřídní variabilita (inter-class)** — *jak rozdílní* jsou různí lidé. Vysoká je žádoucí.
* **Vnitrotřídní variabilita (intra-class)** — *jak rozdílná* jsou různá měření *téhož* člověka. Nízká je žádoucí.

Podrobně [[variabilita]].

### Stárnutí (aging)

* Biometrické rysy se *mění s časem*:
  * Obličej: vrásky, hubnutí, vousy.
  * Hlas: hloubka, prozodie (puberta, věk).
  * Otisky prstů: relativně stabilní, ale podléhají opotřebení (lidé pracující rukama, stárnutí).
  * Duhovka: relativně velmi stabilní (vůbec nejstabilnější).
* Vyžaduje **opětovné zapsání (re-enrollment)** každých N let nebo *adaptivní* algoritmy.

### Dvojčata

* **Jednovaječná dvojčata** mají *velmi* podobnou DNA — sdílejí 99,99 % DNA.
* Otisky prstů jsou **odlišné** (vznikají *epigeneticky* během vývoje plodu).
* Duhovka je **odlišná**.
* Obličej a hlas jsou velmi podobné; biometrické systémy proto u dvojčat často chybují.

### Děti

* Biometrické rysy se v dětství *mění rychle* (obličej, výška, váha).
* Otisky prstů jsou *velmi malé* — snímání u dětí je obtížné.
* US-VISIT vyžaduje snímání otisků prstů (fingerprint enrollment) **od 14 let**.
* Děti vyžadují periodické opětovné zapsání (re-enrollment).

---

*Zdroj: BIO přednášky 2025/26, BIO 1 — Úvod do biometrických systémů. Externí reference: Jain, A. K., Ross, A., Nandakumar, K.: *Introduction to Biometrics* (Springer 2011), kap. 1; Ratha, N., Connell, J. H., Bolle, R. M.: *An Analysis of Minutiae Matching Strength* (AVBPA 2001); ISO/IEC 19794 *Biometric data interchange formats*.*
