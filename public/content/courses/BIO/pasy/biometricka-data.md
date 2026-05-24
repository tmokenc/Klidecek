---
title: Biometrická data v pasu
---

# Biometrická data v pasu

Klíčový rozdíl mezi *klasickým* a *biometric* pasem je *digitální obraz* osoby uložený na chipu. ICAO 9303 specifikuje **face image** jako *povinný* a **fingerprints** / **iris** jako *volitelné* (s EU mandatem pro fingerprints). Pochopení formátů + kvality + použitelnosti je nezbytné pro práci s eMRTD.

## DG2 — Face image

::: svg "DG2 obsah: header + face image data block (JPEG 2000) + ICAO-compliant metadata."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="500" height="140" rx="6"/>
  </g>
  <g fill="rgba(150,200,230,0.4)" stroke="var(--accent)" stroke-width="1">
    <rect x="40" y="60" width="120" height="100" rx="3"/>
    <rect x="180" y="60" width="60" height="100" rx="3"/>
    <rect x="260" y="60" width="240" height="100" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="100" y="115">DG2 header</text>
    <text x="100" y="130" font-size="9" fill="var(--text-muted)">ASN.1 BER</text>
    <text x="210" y="115">FAC header</text>
    <text x="210" y="130" font-size="9" fill="var(--text-muted)">ISO 19794-5</text>
    <text x="380" y="115">JPEG 2000 data</text>
    <text x="380" y="130" font-size="9" fill="var(--text-muted)">~15 KB</text>
  </g>
</svg>
:::

### Format

* **DG2 file** uses ASN.1 BER-TLV encoding.
* Contains **FAC** (Face Image Block) per ISO/IEC 19794-5.
* **Inside FAC:** JPEG 2000 compressed image.

### Image requirements (ICAO 9303 Part 9)

* **Format:** JPEG 2000 (J2K).
* **Resolution:** ≥ 300 dpi.
* **Color:** 24-bit RGB.
* **Size:** typically 15–25 KB.
* **Aspect ratio:** 3:4 (portrait).
* **Width × Height:** typically 480 × 640 pixels.

### Photo requirements

ICAO 9303 has *strict* photo guidelines:

* **Pose:** *frontal*, eyes looking at camera.
* **Expression:** *neutral*, mouth closed.
* **Glasses:** OK if no reflection; sunglasses NOT.
* **Headwear:** OK only for religious reasons; face fully visible.
* **Background:** uniform, light (preferably white/cream).
* **Lighting:** even, no shadows.
* **Quality:** sharp, no pixelation.
* **Recent:** ≤ 6 months old (recommended).

Many countries have *photo booth standards* and check tools.

### Czech requirement

* **Photograph at registration** by photographer or police photo booth.
* **Live capture** at registration office increasingly common.
* Standards align with ICAO; Czech Ministry of Interior issues guidelines.

## DG3 — Fingerprints

::: svg "DG3 obsah: 1 nebo 2 fingerprint images (typicky indexes), WSQ compressed."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="500" height="140" rx="6"/>
  </g>
  <g fill="rgba(255,200,150,0.4)" stroke="var(--accent)" stroke-width="1">
    <rect x="40" y="60" width="100" height="100" rx="3"/>
    <rect x="160" y="60" width="100" height="100" rx="3"/>
    <rect x="280" y="60" width="100" height="100" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="90" y="115">left index</text>
    <text x="90" y="130" font-size="9" fill="var(--text-muted)">WSQ, 500 dpi</text>
    <text x="210" y="115">right index</text>
    <text x="210" y="130" font-size="9" fill="var(--text-muted)">WSQ, 500 dpi</text>
    <text x="330" y="115">EAC-protected</text>
    <text x="330" y="130" font-size="9" fill="var(--text-muted)">10–20 KB each</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="455" y="115">Required EU</text>
    <text x="455" y="130">since 2009</text>
  </g>
</svg>
:::

### Format

* **DG3 file** contains **FIR** (Finger Image Record) per ISO/IEC 19794-4.
* **Inside FIR:** **WSQ** (Wavelet Scalar Quantization) compressed image.
* WSQ is FBI standard for fingerprint compression.

### Image requirements

* **Resolution:** 500 dpi minimum.
* **Color:** 8-bit grayscale.
* **Capture:** *píchaný* (live) print from sensor.
* **Quality:** NFIQ score acceptable (>= 3 typically).
* **Multiple fingers:** typically 2 (left + right index).

### Czech and EU requirement

* **EU regulation 2252/2004** (and 444/2009) — fingerprints mandatory in EU pasy since 2009 (Schengen 2nd gen).
* **Children under 12:** exempt (small + changing fingers).

### Capture process

* At registration office:
  * **Live fingerprint sensor** (optical or capacitive).
  * **Multiple samples** for quality.
  * **Best sample selected** for chip storage.
* User keeps fingers on sensor 5–10 seconds per finger.

## DG4 — Iris

* **Optional**.
* Few countries adopt (United Arab Emirates, India for Aadhaar, etc.).
* **Standard:** ISO/IEC 19794-6.
* **Format:** JPEG 2000 or PNG.
* **Resolution:** ~640 × 480 pixels.
* **NIR illumination.**

## Encoded biometric features (DG7-10)

In addition to images, ICAO allows storing *templates*:

* **DG8** — encoded face features (template, e.g., 128-dim embedding).
* **DG9** — encoded fingerprint features (minutiae).
* **DG10** — encoded iris features (Daugman code).

**Rare in practice** — most countries store images, not templates.

## Quality assurance

### NFIQ (NIST Fingerprint Image Quality)

* Score 1 (best) to 5 (worst).
* Used during enrollment to assess fingerprint quality.
* **NFIQ 2.0** — modern version, score 0–100.

### Face quality

* ISO/IEC 29794-5 — face image quality.
* Sharpness, pose, illumination, expression.
* Automated tools to check at capture time.

### Iris quality

* ISO/IEC 29794-6.
* Iris area, sharpness, occlusion (eyelids, reflections).

## Biometric performance — pasy

### Face

* **Modern DL face recognition** on 300 dpi photos:
  * EER < 0.5 % for cooperative subjects.
  * Higher in real eGate conditions (illumination, pose).

### Fingerprints

* **AFIS-based** verification on 500 dpi pasy fingerprints:
  * EER < 1 % typically.
  * Higher false reject for *small* fingers (children, women).

### Iris

* **Daugman algorithm** on iris from biometric pasy:
  * EER ~$10^{-5}$ — excellent.

## Použití biometrických dat

### Border control

* **Compare captured biometric** (camera at eGate) with **stored** DG2/DG3.
* Cross-validation: chip data + visible photo + person.

### Visa applications

* **VIS** (Visa Information System) — EU centralized database with biometrics from visa applications.
* **Schengen visa** = fingerprints + photo collected at consulate.

### Background checks

* International cooperation via Interpol, Europol.
* DNA *not* in pasy (separate forensic databases).

### National databases

* **France TES** (Titres Électroniques Sécurisés) — centralized biometric DB.
* **UK NIDB** (National Identity Database — discontinued 2010).
* **Czech:** police DNA + fingerprint databases (separate from passport).

## Privacy considerations

### What's on chip vs. central DB

* **Chip:** image + signature only.
* **Central DB:** image + signature + *more* (history, status).
* Different policies per country.

### Function creep

* Originally for cross-border ID.
* Used for: criminal investigation, surveillance, anti-terrorism.
* Privacy advocates concerned.

### Right to opt out

* **Typically no** for passport biometrics.
* Some countries allow fingerprint refusal (with explanation).

### Data minimization (GDPR)

* Chip should contain *minimum necessary* data.
* National DBs subject to GDPR Article 9 (special category).

## Spoofing concerns

### Face

* **Photo printed on paper** — visible to border officer.
* **Mask** — covered by anti-spoofing camera systems.
* **Deepfake projected** — eGates check against camera, not pre-recorded.

### Fingerprints

* **Latex casts** — possible with effort.
* **Gummy bear spoofs** — defended by modern sensors.
* **Live finger detection** improving.

### Iris

* **Patterned contact lenses** — partial defense.
* **High-resolution iris photos** — possible spoofing.
* **3D liveness** in newer iris cameras.

## Trends

* **Face image quality** improving — higher resolution, 3D capture in some pilots.
* **Touchless fingerprint** for hygiene + accessibility.
* **Iris adoption** growing slowly.
* **mDL (mobile drivers license)** — pushing biometric portability.
* **EU Digital Identity Wallet** — biometric ID on smartphones.

---

*Zdroj: BIO přednášky 2025/26, BIO 11 — Biometrické pasy (Goldmann). Externí reference: ICAO Doc 9303 Part 9 — *Deployment of Biometric Identification and Electronic Storage of Data in eMRTDs*; ISO/IEC 19794-5 (face), 19794-4 (fingerprint), 19794-6 (iris) — biometric data interchange formats; ISO/IEC 29794 — biometric quality; NIST: *NFIQ 2.0 Fingerprint Image Quality* — [github.com/usnistgov/NFIQ2](https://github.com/usnistgov/NFIQ2).*
