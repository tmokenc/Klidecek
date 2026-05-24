---
title: Snímací systémy — komerční iris/retina scannery
---

# Snímací systémy — komerční iris/retina scannery

Praktické nasazení iris a retina biometriky vyžaduje *specifické* zařízení. Zde přehled hlavních komerčních systémů a vývojových projektů, včetně multimodálního zařízení **Eyrina**.

## Iris scannery

### IriShield (IriTech)

* **Compact** USB iris scanner.
* Sample 640 × 480 NIR image.
* Distance 8–25 cm.
* Cena: $300–$1000.
* Použití: enrollment stations, mobile ID.

### CMITech BMT-20 (Aware)

* High-throughput iris reader.
* Captures 1 m vzdálenost — *no contact*.
* Use case: airport eGates.

### Princeton Identity ID-200 / ID-300

* Acquired Princeton Identity (Samsung subsidiary).
* High-end iris recognition for enterprise.
* Used by U.S. military, intelligence.

### IRIS ID iCAM 7000 series

* Standard iris scanner v Indian Aadhaar.
* 1.3 billion enrollments.

### Mobile iris

* **Samsung Galaxy S8/S9/Note 8** (2017–2018) — first mass-market mobile iris scanner. *Discontinued* in S10+ (replaced by ultrasonic fingerprint).
* **iPhone X+** — *not* iris, ale Face ID (different biometric).

### Worldcoin Orb

* 2022 controversial project.
* Mass-iris-scanning for global UBI / ID infrastructure.
* Custom hardware ($100K+ per unit).
* Privacy concerns + EU regulation reactions.

## Retina scannery

### EyeDentify EyeScan

* První commercial retinal scanner (1985).
* Specialized chair + headrest.
* $10K+ per unit.
* Used by NSA, CIA, FBI, nuclear plants.
* Discontinued ~2000s.

### Topcon retinal cameras

* Medical-grade fundus cameras (TRC-50DX series).
* Primary use: diagnostics.
* Biometric mode possible but rarely used.

### Optos California / Daytona

* Wide-field retinal imaging.
* Single-image capture without dilatation.
* Medical primary, biometric secondary.

### Smartphone-attached

* **Welch Allyn iExaminer** — iPhone case + ophthalmoscope.
* **Aurora Smart Retinal Camera** — handheld.
* **D-EYE** — Italian startup, mobile ophthalmoscope.

## Eyrina — multimodální iris+retina zařízení

Akademický projekt zaměřený na *kombinované snímání* iris a retina jedním zařízením.

### Cíl projektu

Vyvinutí zařízení, které *téměř v jednom okamžiku* pořídí *oba snímky* (iris + retina).

### Architektura

* **Iris snímání** — NIR camera, similar to commercial iris scanners.
* **Retina snímání** — fundus camera optical path.
* **Sdílená optická cesta** — same eye, both sensors.
* **Precision alignment** — automated subject positioning.

### Využití

* **Biometrické** — hybrid biometric s vyšší přesností než jen iris nebo jen retina.
* **Biomedicínské** — *jednorázová* diagnostická akce; detekce diabetes, glaucoma, hypertenze.

## Společné prvky komerčních scannerů

### Hardware

* **NIR LED illumination** — neviditelné, neruší user experience.
* **CCD/CMOS sensor** — high resolution, low noise.
* **Optical system** — narrow depth of field, focus on iris/retina.
* **Anti-reflective coatings** — minimize specular reflections from cornea.

### Capture protocol

1. **Subject positioning** — chin rest / head positioning aid.
2. **Auto-focus** — detect eye, adjust focus.
3. **Quality assessment** — check sharpness, brightness, iris area.
4. **Capture** — single snap or multi-frame averaging.
5. **Post-processing** — image enhancement.

### Quality metrics

* **Sharpness** — high-frequency content present.
* **Brightness** — uniform illumination.
* **Iris area** — sufficient (>200 pixels diameter for iris).
* **Eyelid occlusion** — minimal.
* **Pupil-iris ratio** — within acceptable range (0.1–0.7).

## Standardy snímání

* **ISO/IEC 19794-6:2011** — Iris image format.
* **ISO/IEC 29794-6:2015** — Iris image quality.
* **NIST SP 800-76-2** — Biometric data for PIV cards (includes iris).
* **ANSI/NIST-ITL 1-2011 Type 17** — Iris image record.

## Mobile vs. desktop

| | **Mobile** | **Desktop / enterprise** |
| :--- | :---: | :---: |
| Velikost | <50 g | >1 kg |
| Cena | $10–$100 add-on | $500–$5000 |
| Resolution | adequate | high |
| Distance | <30 cm | 0.5–1 m |
| Use case | personal auth | enrollment, identification |

## Trends 2025

* **Touchless iris** — Apple/Google research; integrate iris into front camera.
* **Standoff iris** (multi-meter) — surveillance use, controversial.
* **3D iris reconstruction** — depth + texture, more spoof-resistant.
* **Iris + retina fusion** — kombinovaná zařízení (Eyrina-like) směřují ke komerčnímu nasazení.
* **Privacy-preserving iris** — encrypted templates, cancelable iris codes.

## Anti-spoofing pro iris/retina

### Iris

* **Photo attack** — high-resolution photo of iris. Defenze: depth analysis, pupil dynamics.
* **Patterned contact lens** — printed iris pattern. Defenze: spectral analysis (lens has different spectrum than natural iris).
* **Real iris from corpse / surgery** — extreme case. Defenze: pupil dynamics (live pupil reacts to light).

### Retina

* **Extremely difficult** to spoof — retina is *inside* eye.
* **3D-printed eye model** + retinal pattern → possible but very expensive.
* No documented real-world spoofs.

## Limity nasazení

### Iris

* Mass deployment feasible but **slowed** by user acceptance.
* "Eye scanning" creates *unease* among public.
* Religious / cultural concerns in some regions.

### Retina

* **Highly inconvenient** — close contact, bright light.
* **Cooperative subject** required.
* **Not suitable** for surveillance / mass deployment.

---

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání podle duhovky a sítnice (Drahanský, Semerád). Externí reference: STRaDe @ FIT VUT — [strade.fit.vutbr.cz](https://strade.fit.vutbr.cz/); ISO/IEC 19794-6:2011 *Biometric data interchange formats — Part 6: Iris image data*; Bowyer, K. W., Hollingsworth, K., Flynn, P. J.: *Image Understanding for Iris Biometrics: A Survey* (CVIU 2008); Worldcoin project documentation (controversial, 2022+).*
