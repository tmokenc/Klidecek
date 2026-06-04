---
title: Kosti ruky a hluboké biometriky
---

# Kosti ruky a hluboké biometriky

Vedle povrchových (otisky, [[geometrie-ruky|geometrie]]) a vnitřních ([[krevni-recisko|žíly]]) biometrik existuje *deeper* anatomical layer — **kostní struktura ruky**. Tato modalita je *experimentální*, vyžaduje **X-ray** nebo **MRI** snímání — ale poskytuje extrémně stabilní a unikátní biometrické rysy.

## Anatomie ruky — kosti

::: svg "Kostra ruky: phalanges (3 v každém prstu, 2 v palci), metacarpals (5 kostí dlaně), carpals (8 kostí zápěstí)."
<svg viewBox="0 0 540 270" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="rgba(255,255,220,0.7)" stroke="var(--accent)" stroke-width="1.3">
    <ellipse cx="180" cy="40" rx="8" ry="20"/>
    <ellipse cx="220" cy="30" rx="8" ry="22"/>
    <ellipse cx="260" cy="40" rx="8" ry="22"/>
    <ellipse cx="295" cy="50" rx="8" ry="20"/>
    <ellipse cx="160" cy="80" rx="9" ry="18"/>
    <ellipse cx="180" cy="90" rx="9" ry="22"/>
    <ellipse cx="220" cy="80" rx="9" ry="22"/>
    <ellipse cx="260" cy="90" rx="9" ry="22"/>
    <ellipse cx="295" cy="100" rx="9" ry="18"/>
    <ellipse cx="180" cy="155" rx="9" ry="30"/>
    <ellipse cx="220" cy="145" rx="9" ry="35"/>
    <ellipse cx="260" cy="155" rx="9" ry="35"/>
    <ellipse cx="295" cy="160" rx="9" ry="30"/>
    <ellipse cx="160" cy="125" rx="10" ry="25"/>
    <!-- metacarpals (5) -->
    <ellipse cx="160" cy="205" rx="7" ry="20"/>
    <ellipse cx="180" cy="208" rx="7" ry="22"/>
    <ellipse cx="220" cy="205" rx="7" ry="24"/>
    <ellipse cx="260" cy="208" rx="7" ry="22"/>
    <ellipse cx="295" cy="210" rx="7" ry="20"/>
    <!-- carpals (8) -->
    <ellipse cx="195" cy="245" rx="6" ry="6"/>
    <ellipse cx="212" cy="243" rx="6" ry="6"/>
    <ellipse cx="229" cy="245" rx="6" ry="6"/>
    <ellipse cx="246" cy="243" rx="6" ry="6"/>
    <ellipse cx="200" cy="257" rx="6" ry="6"/>
    <ellipse cx="217" cy="258" rx="6" ry="6"/>
    <ellipse cx="234" cy="258" rx="6" ry="6"/>
    <ellipse cx="251" cy="256" rx="6" ry="6"/>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10">
    <text x="350" y="40">distal phalanx</text>
    <text x="350" y="90">middle phalanx</text>
    <text x="350" y="160">proximal phalanx</text>
    <text x="350" y="210">metacarpals</text>
    <text x="350" y="250">carpals (zápěstí)</text>
  </g>
  <g stroke="var(--text-muted)" stroke-width="0.7" fill="none">
    <path d="M310,40 L345,40"/>
    <path d="M310,95 L345,90"/>
    <path d="M310,155 L345,155"/>
    <path d="M305,205 L345,210"/>
    <path d="M260,250 L345,250"/>
  </g>
</svg>
:::

* **27 kostí ruky** rozdělených do 3 skupin:
  * **Phalanges (14)** — kosti prstů. 3 v každém prstu (distal, middle, proximal) + 2 v palci (no middle phalanx).
  * **Metacarpals (5)** — kosti dlaně.
  * **Carpals (8)** — kosti zápěstí.
* **Klouby:** distal interphalangeal (DIP), proximal interphalangeal (PIP), metacarpophalangeal (MCP), wrist.

## Biometrické rysy

* **Bone lengths** — délka jednotlivých phalanges, metacarpals.
* **Bone widths** — diameter at specific positions.
* **Joint shapes** — bone end morphology.
* **Bone density patterns** — internal structure (Wolff's law — bone adapts to mechanical stress).
* **Calcium content variations**.

### Stálost

* **Adult bones:** *velmi* stabilní — žádná growth, minimal remodeling.
* **Bone length:** *fixed* after growth plates close (~18–25 let).
* **Bone density:** *gradual* decrease s věkem (osteoporóza), ale celkový pattern unique.
* **Fractures:** trvalé změny v geometrii, ale rozpoznatelné jako *unique*.

### Unikátnost

* **Genetic + epigenetic** factors:
  * Genetics — basic skeletal proportions.
  * Mechanical loading (work, sport, dominant hand) — bone remodeling.
* **Identical twins** mají *similar but distinct* bone patterns.
* Forensic anthropology relies on bone uniqueness for identification.

## Snímání

### X-ray

* **Standard radiography** — 2D projection.
* Resolution: ~100 μm.
* Cena: $50 per scan.
* Dávka radiace: ~0.005 mSv (very low).
* **Použití:** medical (fractures), forensic, hand age estimation.

### Computed Tomography (CT)

* **3D imaging** — full bone volume.
* Resolution: ~500 μm.
* Cena: $500+.
* Dávka radiace: 1–10 mSv (significant).
* **Použití:** medical surgery planning, forensic, biometric research.

### Magnetic Resonance Imaging (MRI)

* **3D imaging** — soft tissue + bone.
* No ionizing radiation.
* Cena: $1000+.
* Dávka radiace: 0.
* **Použití:** medical, research; *not practical* for biometric due to cost.

### Bone Densitometry (DEXA)

* **Dual-energy X-ray Absorptiometry**.
* Measures bone density.
* Used in osteoporosis screening.
* Side product: unique density patterns.

## Algoritmy

### Bone segmentation

1. **Thresholding** — bones are brighter (X-ray) than soft tissue.
2. **Region growing** — connected components.
3. **DL-based segmentation** — U-Net trained on radiographs.

### Feature extraction

* **Geometric:**
  * Bone lengths (multiple per finger).
  * Joint angles.
  * Bone proportions.
* **Morphometric:**
  * Bone shape descriptors (Fourier descriptors, shape contexts).
  * Joint surface morphology.
* **Density:**
  * Cortical bone thickness.
  * Trabecular patterns.
* **Modern DL:** CNN-based embeddings from radiographs.

### Matching

* **Feature vector comparison** — Euclidean distance.
* **Image registration** — direct image alignment + correlation.
* **Hybrid** approaches.

## Aplikace {tier=practice}

### Medical-biometric hybrid

* **Bone age assessment** — Greulich-Pyle standard, automated by AI.
* Forensic: estimation of age from hand X-ray.
* Combined: bone age + biometric identity.

### Forensic identification

* **Disaster victim identification** — match radiographic records from medical history.
* **Cold case investigations** — bone analysis from skeletal remains.
* Not real-time biometric, but used in forensics.

### Implants identification

* **Surgical screws, plates** — implanted hardware unique per patient.
* **Bone implants** with serial markings.
* Used for *post-mortem* identification.

### Research applications

* **Bone-only biometric** for high-security:
  * Custom X-ray scanner.
  * Daily exposure to user — *not* recommended due to radiation.
* **Hospital-based** identification.

## Limity

### Practical adoption

* **Radiation exposure** — non-zero dose for X-ray; cumulative concern.
* **Cost** — specialized equipment, trained operator.
* **Speed** — minutes per scan, not seconds.
* **Patient acceptance** — radiation, claustrophobia (MRI).
* **Not real-time** — unsuitable for access control.

### Better alternatives

* For *real-time* biometric: fingerprint, face, iris.
* For *forensic identification*: dental records, fingerprints, DNA.
* For *medical-biometric hybrid*: combined diagnostic + ID.

## Specifické případy

### Pediatric biometrics

* **Children's hand X-rays** — used for *bone age* estimation (Tanner-Whitehouse, Greulich-Pyle methods).
* Tracking pediatric growth.
* AI-based automated bone age (BoneXpert).

### Hand prosthetics design

* **CT-based** custom prosthetic design.
* Patient-specific.

### Skeletal disease tracking

* **Rheumatoid arthritis** — bone erosion patterns.
* **Osteoporosis** — bone density loss.
* **Fractures** — healing tracking.

## Trends

* **Mobile X-ray** — handheld devices for emergency situations.
* **Low-dose CT** — reduced radiation, more practical.
* **AI-driven bone analysis** — automated pathology detection + biometric.
* **Federated learning** — privacy-preserving bone analysis.

## Vztah k jiným biometrikám

| | **Bone** | **Vein** | **Fingerprint** |
| :--- | :---: | :---: | :---: |
| Layer | deepest | sub-skin | surface |
| Stability | very high | very high | high |
| Spoofing | extremely hard | very hard | medium |
| Adoption | rare | medium | mass |
| Cost | high | medium | low |
| Real-time | no | yes | yes |

Bone biometrics zatím *není* practical for everyday authentication, ale dobrý *complement* pro forensic + medical scenarios.

---

*Zdroj: BIO přednášky 2025/26, BIO — Identifikátory ruky (Rydlo). Externí reference: Cuendet, M. A.: *Use of X-ray Hand Images for Biometric Identification* (research papers); Greulich, W. W., Pyle, S. I.: *Radiographic Atlas of Skeletal Development of the Hand and Wrist* (Stanford University Press 1959); BoneXpert AI bone age estimation — [bonexpert.com](https://www.bonexpert.com/); STRaDe @ FIT VUT — [strade.fit.vutbr.cz](https://strade.fit.vutbr.cz/).*
