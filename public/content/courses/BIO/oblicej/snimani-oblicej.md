---
title: Snímání obličeje — 2D, 3D, IR
---

# Snímání obličeje — 2D, 3D, IR

**Face recognition** se v posledních 10 letech stala dominantní biometrikou pro mass-market applikace — Apple Face ID, Windows Hello, Android Face Unlock, surveillance systems, payment authorization. Klíčem k dramatickému zlepšení byly dva faktory: *3D depth* senzory + *deep learning* feature extractors.

## Modality snímání

### 2D — klasické fotografie

* **Camera + visible light** — standard RGB image.
* **Resolution:** 100 × 100 pixels minimum, ideally 200+ pixels (face area).
* **Pose:** frontal, ±30° head rotation tolerable.
* **Illumination:** controlled (indoor) or normalized.

**Pro:**
* *Free* (every device has camera).
* *Non-contact*, *hygienic*.
* Acceptable user experience.

**Proti:**
* *Spoofable* — photo printout, video replay, deepfakes ([[deepfakes]]).
* Sensitive to *illumination changes*, *pose*, *expression*.
* Aging effects (5+ year templates degrade).

### 3D — depth sensing

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

#### Structured light

* **IR projector** vyzařuje *vzor* (typicky ~30 000 teček) na obličej.
* **IR camera** captures *deformaci* vzoru.
* Computer recovers *3D depth map* z deformace.
* **Apple Face ID** (TrueDepth, 2017+) — gold standard.

#### Stereo vision

* **Dvě kamery** s known baseline.
* **Disparity** mezi obrazy → depth (princip jako lidské oči).
* Passive (no projector); funguje *anytime*.
* Less precise than structured light, but cheaper.

#### Time-of-Flight (ToF)

* IR laser *pulses*.
* Sensor measures *phase delay* (continuous wave) or *direct time* (pulsed).
* **Direct depth** measurement (no triangulation).
* Used in: iPhone (LiDAR), iPad Pro, Android (Samsung S20+).

### IR (Infrared) cameras

* **Near-IR** (NIR, 700–900 nm) — invisible to human eye, but reflected by skin.
* Funguje *v tmě* (no visible light needed).
* Less susceptible to spoofing (photo doesn't emit/reflect IR same as skin).
* **Windows Hello** používá NIR camera.

### Thermal cameras

* **Far-IR** (8–14 μm) — *body heat* emission.
* Captures *thermal signature* (blood vessels under skin).
* Anti-spoofing — fake mask nemá živé teploty.
* Použití: special access control, military.

## Komponenty face recognition pipeline

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

### 1. Face Detection

* **Find face** v general image.
* Klasický: **Viola-Jones** (2001) — Haar features + cascade classifier.
* Modern: **MTCNN** (Multi-task Cascaded CNN), **RetinaFace**, **YOLO-face**.
* Output: *bounding box(es)* + landmarks (5 nebo 68 keypoints).

::: viz viola-jones-cascade "Posuňte okno přes obraz, sledujte kaskádové odmítnutí; full-scan ukáže úsporu výpočtu."
:::

### 2. Face Alignment

* **Normalize** pose, scale, rotation.
* Use 5 keypoints (eyes, nose, mouth corners) for affine transformation.
* Output: *standard* face image (typically 112 × 112 nebo 224 × 224 pixels).

### 3. Feature Extraction

Klasický: [[eigenfaces-pca|Eigenfaces (PCA)]], Fisherfaces (LDA), Local Binary Patterns (LBP).

Moderní: [[deep-learning-face|Deep learning]] — FaceNet, ArcFace, CosFace.

Output: **embedding vector** (typically 128–512 dim).

### 4. Matching

* **Cosine distance** mezi embeddings:

::: math
\text{similarity}(\mathbf{a}, \mathbf{b}) = \frac{\mathbf{a} \cdot \mathbf{b}}{\|\mathbf{a}\| \cdot \|\mathbf{b}\|}
:::

* Range: $[-1, 1]$. Higher = more similar.

### 5. Decision

* Similarity > threshold $\tau$ → match.
* Typically $\tau \in [0.4, 0.7]$ depending on systému.

## Challenges

### Pose variation

* **Frontal:** ideal, best accuracy.
* **Profile (90°):** *velmi* obtížné; classical methods fail.
* **Modern DL:** robust až do ~60°.

### Illumination

* **Indoor:** controlled, good.
* **Outdoor sunlight:** strong shadows.
* **Low light:** noise, low contrast.

Mitigace: *illumination-invariant* features (LBP, deep learning), IR sensing.

### Expression

* **Neutral:** baseline.
* **Smile, anger, surprise:** facial muscle deformation.
* DL handles well; FACS (Facial Action Coding System) explicit modeling possible.

### Occlusion

* **Glasses** (especially sunglasses).
* **Masks** (post-COVID standard).
* **Facial hair** (beard growth).

DL methods *partially* robust; *full mask* causes significant degradation (~10% FRR increase).

### Aging

* **Faces change** dramatically over 10+ years.
* **Children:** rapid change (recommended re-enrollment every 1–2 years).
* **Adults:** ~5+ year re-enrollment.
* DL embeddings *partially* invariant; aging-aware training (joint loss with age) helps.

## Spoofing / Anti-spoofing

Detailně [[antispoofing-face]]. Stručně:

* **Photo spoof:** 2D systems vulnerable; 3D + IR robust.
* **Video replay:** detection via texture analysis, eye blinking.
* **3D masks:** silicone facial reconstructions — very dangerous.
* **Deepfakes:** AI-generated synthetic videos.

## Praktická nasazení

### Apple Face ID (2017+)

* **TrueDepth camera system:**
  * IR dot projector (30 000+ teček).
  * IR camera.
  * Visible RGB camera.
  * Flood illuminator (for dark conditions).
* **3D depth map** + **2D RGB** + **attention detection** (gaze).
* **Secure Enclave** stores embedding template.
* FAR: 1 in 1 000 000.

### Windows Hello

* **NIR camera** + visible RGB.
* Active face liveness detection.
* TPM-based template storage.

### Surveillance systems

* **Camera networks** (CCTV) + deep learning recognition.
* **NTECH Lab FindFace** (Russia) — controversially deployed.
* **Clearview AI** (USA) — scraped social media for training.
* Privacy concerns ([[etika-gdpr]]).

## Dataset standardy

Benchmarks (LFW, MegaFace, IJB, NIST **FRVT**) a tréninkové datasety (CASIA-WebFace, MS-Celeb-1M, WebFace260M) jsou detailně popsány v [[deep-learning-face]].

---

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání obličeje (Drahanský). Externí reference: Li, S. Z., Jain, A. K.: *Handbook of Face Recognition* (2nd ed., Springer 2011); Apple: *Face ID Security Guide* (2017+); Microsoft: *Windows Hello Biometric Requirements*; NIST FRVT — [pages.nist.gov/frvt](https://pages.nist.gov/frvt/).*
