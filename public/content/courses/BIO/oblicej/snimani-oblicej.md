---
title: Snímání obličeje — 2D, 3D, IR
---

# Snímání obličeje — 2D, 3D, IR

Rozpoznávání obličeje (face recognition) se v posledních deseti letech stalo dominantní biometrikou pro masově rozšířené aplikace — Apple Face ID, Windows Hello, Android Face Unlock, dohledové systémy (surveillance systems) a autorizaci plateb. Klíčem k dramatickému zlepšení byly dva faktory: senzory hloubky (3D depth) a extraktory příznaků (feature extractors) založené na hlubokém učení (deep learning).

## Modality snímání

### 2D — klasické fotografie

* **Kamera a viditelné světlo** — standardní RGB snímek.
* **Rozlišení:** minimálně 100 × 100 pixelů, ideálně 200+ pixelů (oblast obličeje).
* **Pozice (pose):** čelní, tolerovatelné je natočení hlavy ±30°.
* **Osvětlení:** řízené (vnitřní prostředí), nebo normalizované.

**Pro:**
* *Zdarma* (každé zařízení má kameru).
* *Bezkontaktní*, *hygienické*.
* Přijatelný uživatelský komfort.

**Proti:**
* *Snadno podvržitelné (spoofable)* — vytištěná fotografie, přehrání videa, deepfakes ([[deepfakes]]).
* Citlivé na *změny osvětlení*, *pozici* a *výraz*.
* Vliv stárnutí (šablony starší než 5 let degradují).

### 3D — snímání hloubky

Tři hlavní technologie:

::: svg "3D face sensing: structured light (Face ID), stereo cameras, Time-of-Flight (ToF)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="160" height="140" rx="8"/>
    <rect x="190" y="40" width="160" height="140" rx="8"/>
    <rect x="360" y="40" width="160" height="140" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="62" font-size="12.5">Structured light</text>
    <text x="270" y="62" font-size="12.5">Stereo</text>
    <text x="440" y="62" font-size="12.5">Time-of-Flight</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="100" y="84">IR projektor + IR kamera</text>
    <text x="100" y="100">30 000+ teček vzor</text>
    <text x="100" y="120">deformace = hloubka</text>
    <text x="100" y="146" fill="var(--accent)">Apple Face ID</text>
    <text x="270" y="84">2 kamery + parallax</text>
    <text x="270" y="100">depth z disparity</text>
    <text x="270" y="120">passive sensing</text>
    <text x="270" y="146" fill="var(--accent)">automotive driver mon.</text>
    <text x="440" y="84">IR laser + sensor</text>
    <text x="440" y="100">phase shift / time-of-flight</text>
    <text x="440" y="120">direct depth measurement</text>
    <text x="440" y="146" fill="var(--accent)">iPad Pro LiDAR, Android</text>
  </g>
</svg>
:::

#### Structured light (strukturované světlo)

* **IR projektor** vyzařuje na obličej *vzor* (typicky asi 30 000 teček).
* **IR kamera** snímá *deformaci* tohoto vzoru.
* Počítač z deformace dopočítá *3D mapu hloubky (depth map)*.
* **Apple Face ID** (TrueDepth, 2017 a novější) — zlatý standard.

#### Stereo vision (stereoskopické vidění)

* **Dvě kamery** se známou vzdáleností (baseline).
* *Disparita* (rozdíl polohy) mezi obrazy → hloubka (princip stejný jako u lidských očí).
* Pasivní (bez projektoru); funguje *kdykoli*.
* Méně přesné než strukturované světlo, ale levnější.

#### Time-of-Flight (ToF)

* IR laser vysílá *pulzy*.
* Senzor měří *fázové zpoždění* (spojitá vlna), nebo *přímý čas letu* (pulzní režim).
* *Přímé měření hloubky* (bez triangulace).
* Použití: iPhone (LiDAR), iPad Pro, Android (Samsung S20+).

### IR (infračervené) kamery

* **Blízké IR (NIR, 700–900 nm)** — pro lidské oko neviditelné, ale pokožka jej odráží.
* Funguje *ve tmě* (není potřeba viditelné světlo).
* Hůře se podvrhuje — fotografie nevyzařuje ani neodráží IR stejně jako pokožka.
* **Windows Hello** používá NIR kameru.

### Termální kamery

* **Vzdálené IR (8–14 μm)** — vyzařování *tělesného tepla*.
* Snímá *tepelný podpis* (cévy pod kůží).
* Ochrana proti podvržení (anti-spoofing) — falešná maska nemá teploty živé tkáně.
* Použití: speciální řízení přístupu (access control), armáda.

## Komponenty pipeline rozpoznávání obličeje

::: svg "Pipeline: capture → detection → alignment → feature extraction → matching → decision."
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aFR1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="10" y="50" width="75" height="40" rx="4"/>
    <rect x="95" y="50" width="75" height="40" rx="4"/>
    <rect x="180" y="50" width="75" height="40" rx="4"/>
    <rect x="265" y="50" width="100" height="40" rx="4"/>
    <rect x="375" y="50" width="75" height="40" rx="4"/>
    <rect x="460" y="50" width="70" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="48" y="74">capture</text>
    <text x="133" y="74">detect</text>
    <text x="218" y="74">align</text>
    <text x="315" y="74">extract feat.</text>
    <text x="413" y="74">match</text>
    <text x="495" y="74">decide</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aFR1)">
    <path d="M85,70 L93,70"/>
    <path d="M170,70 L178,70"/>
    <path d="M255,70 L263,70"/>
    <path d="M365,70 L373,70"/>
    <path d="M450,70 L458,70"/>
  </g>
</svg>
:::

### 1. Detekce obličeje (face detection)

* **Nalezení obličeje** v obecném snímku.
* Klasický přístup: **Viola-Jones** (2001) — Haarovy příznaky a kaskádový klasifikátor (cascade classifier).
* Moderní přístupy: **MTCNN** (Multi-task Cascaded CNN), **RetinaFace**, **YOLO-face**.
* Výstup: *ohraničující obdélníky (bounding boxes)* a význačné body (landmarks; 5 nebo 68 klíčových bodů).

::: viz viola-jones-cascade "Posuňte okno přes obraz, sledujte kaskádové odmítnutí; full-scan ukáže úsporu výpočtu."
:::

### 2. Zarovnání obličeje (face alignment)

* **Normalizace** pozice, měřítka a rotace.
* Použije se 5 klíčových bodů (oči, nos, koutky úst) pro afinní transformaci.
* Výstup: *standardizovaný* obraz obličeje (typicky 112 × 112 nebo 224 × 224 pixelů).

### 3. Extrakce příznaků (feature extraction)

Klasický přístup: [[eigenfaces-pca|Eigenfaces (PCA)]], Fisherfaces (LDA), Local Binary Patterns (LBP).

Moderní přístup: [[deep-learning-face|Hluboké učení (deep learning)]] — FaceNet, ArcFace, CosFace.

Výstup: **vektor vnoření (embedding vector)** (typicky 128–512 dimenzí).

### 4. Porovnávání (matching)

* **Kosinová vzdálenost (cosine distance)** mezi vnořeními (embeddings):

::: math
\text{similarity}(\mathbf{a}, \mathbf{b}) = \frac{\mathbf{a} \cdot \mathbf{b}}{\|\mathbf{a}\| \cdot \|\mathbf{b}\|}
:::

* Rozsah: $[-1, 1]$. Vyšší hodnota = větší podobnost.

### 5. Rozhodnutí

* Podobnost > práh $\tau$ → shoda.
* Typicky $\tau \in [0.4, 0.7]$ podle systému.

## Výzvy

### Variabilita pozice (pose variation)

* **Čelní pohled:** ideální, nejvyšší přesnost.
* **Profil (90°):** *velmi* obtížný; klasické metody selhávají.
* **Moderní hluboké učení:** robustní až do zhruba 60°.

### Osvětlení

* **Vnitřní prostředí:** řízené, dobré.
* **Venkovní sluneční světlo:** výrazné stíny.
* **Slabé světlo:** šum, nízký kontrast.

Zmírnění: příznaky *nezávislé na osvětlení* (LBP, hluboké učení), snímání v IR.

### Výraz

* **Neutrální:** výchozí stav.
* **Úsměv, hněv, překvapení:** deformace obličejových svalů.
* Hluboké učení si s tím poradí dobře; možné je i explicitní modelování pomocí FACS (Facial Action Coding System).

### Zakrytí (occlusion)

* **Brýle** (zvláště sluneční).
* **Roušky** (po pandemii COVID běžné).
* **Vousy** (růst plnovousu).

Metody hlubokého učení jsou *částečně* robustní; *úplné zakrytí maskou* způsobuje výrazné zhoršení (nárůst FRR přibližně o 10 %).

### Stárnutí

* **Obličeje** se během 10 a více let dramaticky mění.
* **Děti:** rychlá změna (doporučená opětovná registrace každé 1–2 roky).
* **Dospělí:** opětovná registrace přibližně po 5 a více letech.
* Vnoření z hlubokého učení jsou *částečně* invariantní; pomáhá trénink zohledňující stárnutí (sdružená ztrátová funkce zahrnující věk).

## Podvržení a ochrana proti podvržení (spoofing / anti-spoofing)

Podrobně viz [[antispoofing-face]]. Stručně:

* **Podvržení fotografií:** 2D systémy jsou zranitelné; 3D a IR jsou robustní.
* **Přehrání videa:** detekce pomocí analýzy textury a mrkání očí.
* **3D masky:** silikonové rekonstrukce obličeje — velmi nebezpečné.
* **Deepfakes:** uměle vygenerovaná syntetická videa.

## Praktická nasazení {tier=practice}

### Apple Face ID (2017 a novější)

* **Kamerový systém TrueDepth:**
  * IR bodový projektor (30 000+ teček).
  * IR kamera.
  * Viditelná RGB kamera.
  * Přisvětlovací IR zdroj (flood illuminator) pro tmavé podmínky.
* **3D mapa hloubky** + **2D RGB** + **detekce pozornosti** (směr pohledu).
* **Secure Enclave** uchovává šablonu vnoření.
* FAR: 1 ku 1 000 000.

### Windows Hello

* **NIR kamera** + viditelné RGB.
* Aktivní detekce živosti obličeje (liveness detection).
* Uložení šablony založené na TPM.

### Dohledové systémy (surveillance systems)

* **Kamerové sítě** (CCTV) + rozpoznávání pomocí hlubokého učení.
* **NTECH Lab FindFace** (Rusko) — kontroverzně nasazený.
* **Clearview AI** (USA) — pro trénink stahoval data ze sociálních sítí.
* Obavy o soukromí ([[etika-gdpr]]).

## Standardy datových sad

Srovnávací testy (LFW, MegaFace, IJB, NIST **FRVT**) a tréninkové datové sady (CASIA-WebFace, MS-Celeb-1M, WebFace260M) jsou podrobně popsány v [[deep-learning-face]].

---

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání obličeje (Drahanský). Externí reference: Li, S. Z., Jain, A. K.: *Handbook of Face Recognition* (2nd ed., Springer 2011); Apple: *Face ID Security Guide* (2017+); Microsoft: *Windows Hello Biometric Requirements*; NIST FRVT — [pages.nist.gov/frvt](https://pages.nist.gov/frvt/).*
