---
title: Geometrie ruky
---

# Geometrie ruky

**Hand geometry** je biometrika založená na *fyzických rozměrech* ruky — délka prstů, šířka, tloušťka, obvody. Patří k *nejstarším* praktickým biometrikám (od 70. let 20. století); přestože *není* mezi nejpřesnějšími, má specifické výhody: *non-invasive*, *user-friendly*, *robust* vůči mírnému zranění.

## Princip

Měření *makrofyzické* anatomie ruky:

::: svg "Hand geometry — měřené dimenze: length fingers (5), palm width (3 levels), palm thickness (2 places), finger thickness (5)."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="rgba(255,220,180,0.6)" stroke="var(--accent)" stroke-width="1.5">
    <path d="M180,200 L180,140 L195,90 L210,60 L225,55 L240,65 L245,100 L260,80 L275,55 L290,60 L295,100 L310,80 L325,75 L335,90 L340,140 L320,160 L320,200 Z"/>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="1" fill="none" stroke-dasharray="2 2">
    <line x1="225" y1="55" x2="225" y2="140"/>
    <line x1="282" y1="55" x2="282" y2="140"/>
    <line x1="320" y1="75" x2="320" y2="140"/>
    <line x1="180" y1="170" x2="340" y2="170"/>
    <line x1="180" y1="120" x2="340" y2="120"/>
  </g>
  <g fill="var(--accent)" font-size="10">
    <text x="218" y="50">L1</text>
    <text x="275" y="50">L2</text>
    <text x="315" y="70">L3</text>
    <text x="350" y="170">W1</text>
    <text x="350" y="120">W2</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="start" font-size="10">
    <text x="20" y="220">L = délka prstu</text>
    <text x="200" y="220">W = šířka dlaně</text>
    <text x="400" y="220">+ thickness (z boku)</text>
  </g>
</svg>
:::

Typická feature vektor:

* **5× délka prstů** (palec, ukazovák, prostředníček, prsteník, malíček).
* **2–3× šířka dlaně** (na různých výškách).
* **5× šířka prstů** (na proximální falanze).
* **2× tloušťka ruky** (z boku, palec down).
* **Obvodu** (perimeter) ruky.

Total: ~14–30 rozměrů — *kompaktní* feature vector.

## Snímání

### Tradiční hardware

* **Komerční:** specializovaný snímač s *pegs* (kolíky) pro position guides.
* **Camera + light:** RGB camera nad rukou; markers na ruce naznačují keypoints.
* **Side mirror** — capture *thickness* (depth perpendicular to camera).

Klasický systém **Recognition Systems ID3D** (1990s+) — first commercial hand geometry, deploying tisíce devices.

### Moderní

* **Smartphone-based** — RGB camera + ML for hand detection + measurement.
* **3D depth sensing** — Kinect, RealSense, ToF.
* **Touchless** — preferred post-COVID.

## Snímací protokol

1. Subject places hand on **flat surface** with pegs / markers.
2. Camera captures **top view** + optional **side view**.
3. Image processing:
   * **Background subtraction** — segment hand.
   * **Keypoint detection** — finger tips, valley points.
   * **Measurement extraction** — distances.
4. **Feature vector** stored as template (~30 floats).

## Matching

* **Euclidean distance** between feature vectors.
* **Threshold** decides match / no-match.
* **Simple, fast** — O(D) for D-dim vector.

## Vlastnosti

### Pro

* **Non-invasive** — comfortable, no contact with sensitive zones (eyes, mouth).
* **Quick** — capture < 1 sec.
* **Robust to dirt** — light scratches, small cuts neovlivní matching.
* **Easy enrollment** — single capture or few.
* **Low computational cost** — embedded systems feasible.
* **Cultural acceptability** — many regions where face / iris scanning is taboo.
* **Affordable** — sensor $200, system $1000.

### Proti

* **Lower accuracy** než fingerprint, iris, face DL.
  * Typical EER: 1–5 % (vs. iris < 0.001 %).
* **Stable but not unique** — feature space is *limited*.
  * Some studies suggest geometry alone *cannot* uniquely identify in databases > 10 000.
* **Aging** — children grow, adults change moderately.
* **Vulnerable to spoofing** — wax casts, fake hands.
* **Pose sensitive** — small rotation = large measurement error.

## Praktická nasazení {tier=practice}

### Workforce attendance

* **Time & attendance systems** — workplace clock-in/out.
* **ID3D** (Recognition Systems) — deployed in 1000s of companies, prisons, schools.

### Border control

* **INSPASS** (US 1993–2002) — Immigration and Naturalization Service Passenger Accelerated Service System. Replaced by 2D barcode + face.

### School lunch programs

* **US K-12 schools** — hand geometry for cafeteria payment. Controversial (privacy, children).

### Construction sites

* Workers check in/out, *rugged* environments.
* Tolerable to dirt, gloves removed.

### Prisons

* **California Department of Corrections** — inmate identification via hand geometry.
* Robust v context, where fingerprint sensors may fail.

## Klasifikace dle rozsahu

### Single peg-based scanner

* User pre-positioned by pegs.
* High precision.
* Used in workforce applications.

### Peg-less (free-form)

* No physical guides.
* Image processing aligns hand.
* More user-friendly.

### Touchless

* Camera-based, no contact.
* COVID-driven adoption.
* Lower accuracy than peg-based.

## Standardy

* **ANSI INCITS 396-2005** — Hand Geometry Interchange Format.
* **ISO/IEC 19794-10:2007** — Hand geometry silhouette data.

## Performance benchmarks

* **FAR @ 0.01 %**: FRR ~ 5 % (typical).
* **EER**: 1–3 % (best systems).
* **Throughput**: 100+ identifications/sec.

Méně přesné než iris ($10^{-12}$ FAR) nebo modern DL face ($10^{-6}$ FAR), ale *adequate* pro low-to-medium security applications.

## Hand geometry vs. palmprint

Pozor:

* **Hand geometry** — *macro* features (dimensions).
* **Palmprint** — *micro* features (lines, ridges on palm) → analogous to fingerprint but on palm. *Much higher* uniqueness.

Both can be combined in **palm biometrics**:

* Palm vein + palm geometry + palmprint.
* Used by some banks (Fujitsu PalmSecure — vein-based).

## Trends

* **Decline** in pure hand geometry.
* **Replaced by** fingerprint (smartphone) or face (kiosks).
* **Survives** in *specialized* environments (construction, prisons).
* **Hybrid** with palmprint, palm vein — better accuracy.

---

*Zdroj: BIO přednášky 2025/26, BIO — Identifikátory ruky (Rydlo). Externí reference: Zunkel, R. L.: *Hand Geometry Based Verification* (chapter in *Biometrics: Personal Identification in Networked Society*, Springer 1999); Sanchez-Reillo, R., Sanchez-Avila, C., Gonzalez-Marcos, A.: *Biometric Identification through Hand Geometry Measurements* (IEEE PAMI 2000); Recognition Systems ID3D historical documentation.*
