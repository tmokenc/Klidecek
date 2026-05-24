---
title: Sítnice a cévní řečiště
---

# Sítnice a cévní řečiště

**Sítnice** (retina) je *vnitřní* světločitlivá vrstva oka. Pro biometriku je relevantní její *cévní vzor* (vascular pattern) — *unique per person* a *extrémně stabilní* během života. Retina-based biometric je technicky nejtěžší ze všech, ale poskytuje nejvyšší přesnost — proto se používá jen v *vysoce zabezpečených* aplikacích.

## Cévní struktura sítnice

::: svg "Fundus oculi — pohled na sítnici: optical disk (vstup cév), macula, centrální arterie a venule s větveními."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="rgba(180,140,100,0.5)" stroke="var(--accent)" stroke-width="1.5">
    <circle cx="270" cy="120" r="100"/>
  </g>
  <g fill="rgba(255,240,200,0.6)" stroke="var(--accent)" stroke-width="1.2">
    <circle cx="220" cy="120" r="15"/>
  </g>
  <g fill="rgba(150,80,80,0.3)" stroke="rgb(150,30,30)" stroke-width="0.8">
    <circle cx="290" cy="130" r="3"/>
  </g>
  <g stroke="rgb(180,40,40)" stroke-width="2" fill="none">
    <path d="M220,120 C260,100 280,80 290,70 C295,60 300,55 305,52"/>
    <path d="M220,120 C260,140 280,160 290,170 C295,180 300,185 305,188"/>
    <path d="M280,90 C290,85 300,80 310,80"/>
    <path d="M280,150 C290,155 300,160 310,160"/>
    <path d="M255,105 C245,95 240,85 235,80"/>
    <path d="M255,135 C245,145 240,155 235,160"/>
  </g>
  <g stroke="rgb(80,100,180)" stroke-width="1.5" fill="none">
    <path d="M220,120 C260,108 280,85 285,72"/>
    <path d="M220,120 C260,132 280,155 285,168"/>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10.5">
    <text x="100" y="115">optical disk</text>
    <text x="100" y="130" font-size="9" fill="var(--text-muted)">slepá skvrna</text>
    <text x="320" y="135">macula</text>
    <text x="320" y="148" font-size="9" fill="var(--text-muted)">central vision</text>
    <text x="330" y="55" font-size="9.5" fill="rgb(180,40,40)">arteries</text>
    <text x="330" y="190" font-size="9.5" fill="rgb(80,100,180)">veins</text>
  </g>
  <g stroke="var(--text-muted)" stroke-width="0.7" fill="none">
    <path d="M170,118 L205,118"/>
    <path d="M316,132 L292,132"/>
  </g>
</svg>
:::

* **Optical disk** (papilla optici, slepá skvrna) — místo, kde optical nerve a *central retinal artery* + *vena* vstupují/vystupují. ~1.5 mm v průměru.
* **Macula lutea** — žlutá skvrna s nejvyšší hustotou čípků; central vision. ~5 mm v průměru, *fovea* uprostřed.
* **Central retinal artery (CRA)** — vstupuje s optical nerve, větvení do *superior/inferior* arcs a dále.
* **Central retinal vein (CRV)** — analogicky, drenáž.

### Vzor cév

Vzor se vytvoří *během fetal development* (~16 týden) a *zůstává stabilní* po celý život.

* **Genetics** určuje *globální layout* (lokace optical disku, typical branching).
* **Epigenetic factors** ovlivňují *přesné branching pattern* — odlišné u *identických dvojčat*.
* **Vlastnosti:**
  * **Unique** — *žádné dva* obrazy retiny nejsou totožné.
  * **Stálý** — od cca 1. roku života do smrti.
  * **Nelze externě modifikovat** — chráněn anatomickou polohou.

### Změny vlivem nemocí

* **Diabetes** — *diabetic retinopathy*: mikroaneurysma, neovaskularizace, exudates.
* **Hypertenze** — *hypertenzní retinopatie*: arteriolar narrowing, A/V crossings.
* **Glaukom** — *cup-to-disc ratio* changes.
* **Macular degeneration** (AMD) — central vision loss.

Z perspektivy *biometriky* tyto změny mohou degradovat matching — vyžadují adaptive enrollment.

Z perspektivy *medicíny* — fundus imaging je primary diagnostický nástroj.

## Snímání sítnice

### Fundus camera

Specializované zařízení:

* **Light source** (visible / NIR) — flash illumination.
* **Optical system** — slit lamp + condensing lens.
* **Sensor** — high-resolution CCD/CMOS.
* **Distance** — ~5 cm od oka.

### Process

1. Subject sits with **chin rest** + **forehead band** for stability.
2. **Pupil dilatation** (mydriasis) — eye drops to widen pupil. *Limits real-world use*.
3. **Alignment** — examiner positions camera precisely.
4. **Snapshot** — single image.
5. **Image quality assessment** — possibly repeat.

### Difficulties

* **Eye movement** — natural saccades během snímání.
* **Cornea + lens** — light must pass through these (any opacity = poor image).
* **Pupil constriction** — natural reflex to bright light.
* **Subject cooperation** required — *not* suitable for surveillance.

### Mobile retinal imaging

* **Welch Allyn iExaminer** — smartphone-attached ophthalmoscope.
* **Aurora Smart Retinal Camera** — handheld for primary care.
* Lower quality than full fundus cameras, but more accessible.

## Algoritmy

### Vessel extraction

1. **Image preprocessing** — green channel (best contrast for vessels).
2. **Vessel segmentation:**
   * **Classical:** matched filters (Frangi filter, vessel-enhancing convolution).
   * **DL-based:** U-Net semantic segmentation.
3. **Skeleton extraction** — thinning.
4. **Bifurcation points** — *vascular crossings* + *branch points*.

### Feature extraction

* **Branch points** — souřadnice + úhly.
* **Vessel lengths** — distances between bifurcations.
* **Vessel widths**.
* **Optical disc center** — reference point pro alignment.

### Matching

Similar to fingerprint minutiae matching ([[markanty]]):

* Align via optical disc center + 2 nearest bifurcations.
* Count matching feature points.
* Score normalize.

### Hill / Frome algorithm

Klasický algoritmus pro retina matching (1978, EyeDentify Inc.):

* 320 reference *coronal* features.
* Matching → similarity score.
* Used by EyeDentify EyeScan (1985+).

## Praktická nasazení

### EyeDentify / EyeScan (1985+)

* První commercial retinal scanner.
* High-security facilities: NSA, CIA, FBI, nuclear plants.
* FAR < $10^{-6}$.
* Cena ~$10 000 per unit.
* Discontinued ~2000s (iris recognition replaced it).

### IriTech IrisShield retina mode

* Modern device kombinující iris + retina.
* Hybrid biometric.
* High-security access control.

### Medical-biometric overlap

* Smartphone-based diabetic retinopathy screening + biometric identification.
* AI detection of pathology + identity verification.
* Aravind Eye Care (India) — large-scale rural deployment.

## Limity retinal biometrics

### User experience

* **Invasive feeling** — bright light into eye, close proximity.
* **Pupil dilatation** required — temporary blurred vision.
* **Cooperative subject** mandatory — žádné covert recognition.
* **Multiple captures** often needed.

### Cost

* Specialized hardware ($1000+ per device).
* Trained operator preferred.

### Health concerns

* **Bright flash** — *hyperbolic concerns* but generally safe.
* **Frequent imaging** — no long-term studies on biometric-frequency use.

## Eyrina — kombinované snímání

Akademický projekt zaměřený na *téměř současné* snímání iris + retina:

* Jedním přístrojem pořídí iris i retinal image v rychlé sekvenci.
* Hybridní biometrika s vyšší přesností než samostatná modalita.
* Detailně [[snimaci-systemy]].

## Retina vs. iris

| | **Retina** | **Iris** |
| :--- | :---: | :---: |
| Snímání | invasive (close, bright light) | non-invasive |
| User cooperation | high | low |
| Accuracy | very high | very high |
| Spoofing | extremely difficult | difficult (with anti-spoof) |
| Cost | high | medium |
| Mass deployment | difficult | feasible |
| Medical value | high (pathology detection) | partial |

Konsensus: **iris** pro mass deployment; **retina** pro very high-security or medical-biometric hybrid.

## Trends 2025

* **AI-based retinal disease detection** + identity verification combined.
* **OCT** (Optical Coherence Tomography) — *3D* retinal imaging, *deeper* than fundus photo.
* **Smartphone-based** retinal imaging (still moderate quality).
* **Federated learning** — collaborative training without sharing patient images.

---

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání podle duhovky a sítnice (Drahanský, Semerád). Externí reference: Williams, T. D.: *Biometric Identification — A Comparative Study of Retinal and Iris Recognition* (IEEE Trans. on Information Forensics 2002); Mariño, C. et al.: *Personal Authentication Using Digital Retinal Images* (Pattern Analysis 2006); Frangi, A. F. et al.: *Multiscale Vessel Enhancement Filtering* (MICCAI 1998); STRaDe @ FIT VUT — [strade.fit.vutbr.cz](https://strade.fit.vutbr.cz/).*
