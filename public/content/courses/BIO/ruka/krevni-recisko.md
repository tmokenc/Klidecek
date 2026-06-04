---
title: Krevní řečiště — vein biometrics
---

# Krevní řečiště — vein biometrics

**Vein biometrics** (Žilní biometrika) využívá *vnitřní vzor cév* pod kůží — nejčastěji na **dlani**, **prstu**, nebo *hřbetu ruky*. Žíly jsou **invisible externally** (under skin), takže nelze je *fotograficky* spoofovat — to dělá vein biometrics *velmi resistant* vůči většině spoofing útoků. Komerčně nejúspěšnější systém: **Fujitsu PalmSecure**.

## Princip

Žíly obsahují **deoxygenovaný hemoglobin** (deoxyhemoglobin, deoxy-Hb). Tato složka *absorbuje* near-infrared (NIR) světlo (peak absorption ~760 nm).

::: svg "Princip finger-vein transillumination: NIR LED osvětluje ruku, deoxy-Hb v žilách absorbuje světlo (tmavé linky), kosti + okolní tkáň propouštějí světlo (světlé), kamera na protilehlé straně zachytí kontrastní obraz vein pattern."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40" y="40" width="160" height="120" rx="60"/>
  </g>
  <g stroke="rgb(50,50,150)" stroke-width="2.5" fill="none" stroke-opacity="0.7">
    <path d="M65,80 C95,100 130,85 175,105"/>
    <path d="M75,120 C100,110 140,130 180,115"/>
    <path d="M60,140 C95,135 125,115 175,140"/>
  </g>
  <g fill="rgba(255,150,0,0.4)" stroke="rgb(255,120,0)" stroke-width="2">
    <circle cx="120" cy="20" r="10"/>
  </g>
  <g fill="rgba(100,100,255,0.4)" stroke="rgb(100,100,255)" stroke-width="1.2">
    <rect x="100" y="170" width="60" height="20" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="120" y="24" font-size="9">NIR LED</text>
    <text x="130" y="183" font-size="9">NIR camera</text>
  </g>
  <g fill="var(--accent)" text-anchor="start" font-size="10">
    <text x="240" y="80">deoxy-Hb absorb. NIR (760 nm)</text>
    <text x="240" y="100">→ veins appear DARK</text>
    <text x="240" y="120">muscle + bones transmit NIR</text>
    <text x="240" y="140">→ background appears LIGHT</text>
  </g>
  <g stroke="rgb(255,200,0)" stroke-width="1" stroke-dasharray="2 2" fill="none">
    <path d="M120,30 L115,45"/>
    <path d="M125,30 L130,45"/>
  </g>
</svg>
:::

::: viz vein-nir-spectrum "Posuňte vlnovou délku — vidíte absorpční křivky deoxy-Hb, vody, melaninu a živý kontrast žil."
:::

### NIR window

* **Wavelength** ~760 nm — *maximální* absorption deoxy-Hb.
* **Kost, sval, voda** — *minimal* absorption at 760 nm.
* **Voda** absorbuje hlavně > 1000 nm.
* Output: **high-contrast** image where veins are *darker* than surrounding tissue.

## Modality

### 1. Palm vein (dlaňové žíly)

* **Fujitsu PalmSecure** (2002+) — leader.
* Touchless: dlaň ~5–10 cm nad senzorem.
* High-resolution capture (~500 × 500 pixels).
* Used by Japanese banks (Sumitomo Mitsui, Mizuho) for ATM access.

### 2. Finger vein (prstové žíly)

* **Hitachi finger vein** (2005+).
* Finger pushed into chamber.
* Camera below or above finger.
* Used by Bank of Tokyo-Mitsubishi, European card readers.

### 3. Dorsal hand vein (hřbet ruky)

* Veins on *back of hand*.
* Less popular but research interest.

### 4. Wrist vein

* Smartwatch-integrated.
* Apple Watch heart rhythm monitoring uses similar principle (but for medical, not biometric).

## Snímací hardware

* **NIR LED** array — 760 nm wavelength.
* **NIR camera** — silicon CMOS without IR filter.
* **Beam splitter** — to prevent direct LED-to-camera reflection.
* **Touchless** preferred — hygienic, comfortable.

## Algoritmus

### Image processing

1. **Capture NIR image** — veins dark, background light.
2. **Preprocessing:**
   * **ROI extraction** — palm/finger boundary.
   * **Normalization** — illumination, scale.
3. **Vein segmentation:**
   * **Matched filters** — convolution with vessel-like kernels.
   * **Hessian-based** (Frangi filter) — detect tubular structures.
   * **DL-based** — U-Net segmentation.
4. **Skeletonization** — extract 1-pixel-wide vessel centerlines.
5. **Feature extraction:**
   * **Bifurcation points** (analogous to fingerprint minutiae).
   * **End points**.
   * **Vessel orientation, width**.

### Matching

* **Bifurcation matching** — geometric alignment + counting matches.
* **Template matching** — direct image comparison after alignment.
* **DL embeddings** — increasingly common.

### Distance metric

* **Hamming distance** for binary vein code.
* **Cross-correlation** for image-based matching.

## Vlastnosti

### Pro

* **Anti-spoofing:** veins are *inside* skin; cannot be photographed externally.
* **No latent prints:** žádná zanechávaná stopa.
* **Stable:** vein pattern *very stable* throughout life.
* **High accuracy:**
  * Fujitsu PalmSecure FAR: $10^{-8}$.
  * Hitachi finger vein FAR: $10^{-6}$.
* **Touchless** options — hygienic, COVID-friendly.
* **Universal:** prakticky každý má detekovatelné žíly.

### Proti

* **NIR sensor** required — not in standard cameras.
* **Slightly slower** capture than fingerprint.
* **Sensitive to:**
  * Skin temperature (cold = constricted veins).
  * Pressure (squeezing finger).
  * Skin pigmentation (very dark = lower contrast).
* **Cost** — sensor $200–$500, expensive vs. fingerprint.

## Praktická nasazení {tier=practice}

### Banking

* **Japan:** ~80 % ATMs equipped with palm/finger vein since 2007. ~50M users.
* **Mizuho, Sumitomo Mitsui, Bank of Tokyo-Mitsubishi.**
* **Brazil:** Bradesco bank deployed finger vein.

### Workplace access

* Toyota factories — palm vein worker ID.
* High-security data centers.

### Healthcare

* Hospital patient identification.
* Brazilian hospitals use palm vein for ER admittance.

### Government

* Some pilots in Europe (UK, Spain).
* Limited mass deployment.

### Notebook integration

* **Fujitsu LifeBook** notebooks (2010+) — palm vein login.

## Vein vs. fingerprint comparison

| | **Vein** | **Fingerprint** |
| :--- | :---: | :---: |
| **Spoofing** | very hard | medium |
| **Latent traces** | none | left on surfaces |
| **Stability** | very high | high |
| **Cost** | $200–500 sensor | $5–50 sensor |
| **Public acceptance** | medium (less familiar) | high |
| **Throughput** | medium (3–5 sec) | fast (<1 sec) |
| **Privacy** | high (internal feature) | medium |

Vein biometrics má *bezpečnostní výhody* over fingerprint, ale cost a familiarity preferují fingerprint v consumer applications.

## Standardy

* **ISO/IEC 19794-9:2007** — Vascular image data.
* **ISO/IEC 19092:2008** — Banking biometrics security.
* **JIS X 5093:2008** — Japanese national standard for vein biometrics.

## Anti-spoofing

* **NIR-only response** — fake hand/finger nemá hemoglobin absorption pattern.
* **Multispectral imaging** — different wavelengths reveal different anatomy.
* **Liveness:**
  * Pulse oximetry (blood oxygenation).
  * Skin temperature.
  * Pulsatile flow detection.

Some advanced systems combine vein + fingerprint + palmprint.

## Trends 2025

* **Mass smartphone adoption** uncertain — NIR sensors not standard in phones.
* **Apple Watch** uses red+infrared light for blood-oxygen (SpO2) measurement (heart rate itself uses green-LED PPG, not NIR) but not for biometric ID yet.
* **Multimodal palm biometrics** — vein + palmprint + geometry.
* **DL-based** algorithms improving accuracy.
* **EU healthcare** showing increased interest post-COVID.

## Lokální nasazení

* Limited deployment v ČR.
* Historicky některé Sberbank-related projekty využívaly žilní biometriku.
* Akademický výzkumný zájem (palm/finger vein algoritmy, anti-spoofing).

---

*Zdroj: BIO přednášky 2025/26, BIO — Identifikátory ruky (Rydlo). Externí reference: Fujitsu PalmSecure documentation — [fujitsu.com](https://www.fujitsu.com/global/products/computing/peripheral/sensors/biometrics/palm-vein/); Hashimoto, J.: *Finger Vein Authentication Technology and Its Future* (Hitachi 2006); Kumar, A., Prathyusha, K. V.: *Personal Authentication Using Hand Vein Triangulation and Knuckle Shape* (IEEE TIP 2009); ISO/IEC 19794-9:2007 *Biometric data interchange formats — Part 9: Vascular image data*.*
