---
title: Rozpoznávání podle chůze (gait)
---

# Rozpoznávání podle chůze (gait)

**Gait recognition** identifikuje *osobu* podle *způsobu chůze*. Patří k *behaviorálním* biometrikám s jedinečnou výhodou: lze ho použít *vzdáleně*, *bez vědomí subjektu*, a *bez fyzického kontaktu*. To dělá gait recognition zajímavým pro *surveillance* aplikace, ale také kontroverzním z hlediska privacy.

## Princip

Lidská chůze je *komplexní* pohyb — pozice nohou, paží, trupu se *koordinovaně* mění v čase. Každý člověk má *unikátní* gait pattern, který odpovídá jeho:

* **Anatomii** — výška, váha, délka končetin, postavení kloubů.
* **Svalové síle** — distribution of strength.
* **Neurologii** — motor control patterns.
* **Habits** — naučené walking style.

::: svg "Gait cycle: stance phase + swing phase, levá a pravá noha v anti-fázi."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <circle cx="80" cy="60" r="12"/>
    <line x1="80" y1="72" x2="80" y2="130"/>
    <line x1="80" y1="100" x2="70" y2="120"/>
    <line x1="80" y1="100" x2="90" y2="115"/>
    <line x1="80" y1="130" x2="65" y2="175"/>
    <line x1="80" y1="130" x2="95" y2="175"/>
  </g>
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <circle cx="180" cy="55" r="12"/>
    <line x1="180" y1="67" x2="180" y2="130"/>
    <line x1="180" y1="100" x2="195" y2="125"/>
    <line x1="180" y1="100" x2="165" y2="120"/>
    <line x1="180" y1="130" x2="170" y2="175"/>
    <line x1="180" y1="130" x2="200" y2="170"/>
  </g>
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <circle cx="280" cy="60" r="12"/>
    <line x1="280" y1="72" x2="280" y2="130"/>
    <line x1="280" y1="100" x2="295" y2="115"/>
    <line x1="280" y1="100" x2="270" y2="120"/>
    <line x1="280" y1="130" x2="265" y2="175"/>
    <line x1="280" y1="130" x2="295" y2="175"/>
  </g>
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <circle cx="380" cy="55" r="12"/>
    <line x1="380" y1="67" x2="380" y2="130"/>
    <line x1="380" y1="100" x2="365" y2="125"/>
    <line x1="380" y1="100" x2="395" y2="115"/>
    <line x1="380" y1="130" x2="395" y2="175"/>
    <line x1="380" y1="130" x2="370" y2="170"/>
  </g>
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <circle cx="480" cy="60" r="12"/>
    <line x1="480" y1="72" x2="480" y2="130"/>
    <line x1="480" y1="100" x2="465" y2="115"/>
    <line x1="480" y1="100" x2="495" y2="120"/>
    <line x1="480" y1="130" x2="495" y2="175"/>
    <line x1="480" y1="130" x2="465" y2="175"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="80" y="195">t=0</text>
    <text x="180" y="195">t=1</text>
    <text x="280" y="195">t=2</text>
    <text x="380" y="195">t=3</text>
    <text x="480" y="195">t=4</text>
  </g>
</svg>
:::

## Gait cycle

**Gait cycle** = jeden kompletní cyklus chůze (od heel strike jedné nohy zpět na heel strike téže nohy):

* **Stance phase** (~60 %) — noha v kontaktu s podlahou.
* **Swing phase** (~40 %) — noha ve vzduchu.
* **Double support** (~10 %) — obě nohy na zemi (přechody).

Phases:
1. **Heel strike** — pata dotkne podlahu.
2. **Mid-stance** — full weight bearing.
3. **Toe-off** — odraz palce.
4. **Mid-swing** — noha v polovině pohybu vzduchem.

::: viz gait-cycle-walker "Animovaná chůze: stance/swing fáze, GEI overlay a srovnání tří stylů (normal, fast, limp)."
:::

## Capture metody

### Video-based (vision)

* **Standard surveillance camera** (CCTV).
* **Distance:** 5–50 m.
* **Resolution:** 640 × 480 minimum.
* **Processing:** background subtraction, silhouette extraction, time-series analysis.

### Wearable sensors

* **Accelerometers** — phones, smart watches.
* **Gyroscopes**.
* **Pressure-sensitive insoles**.
* **Higher accuracy** than video, but requires user cooperation.

### Floor sensors

* **Pressure-sensitive floor** (vodítka, security checkpoint floors).
* High-throughput but requires fixed installation.
* MIT Media Lab demonstrations.

### Radar / LiDAR

* **mmWave radar** — through-wall gait sensing.
* **LiDAR** — point cloud sequences.
* Privacy-preserving (no visual identification).

## Features

### Silhouette-based

* **Gait Energy Image (GEI)** — average silhouette over one gait cycle.
* **Active Energy Image (AEI)** — variance.
* **Period-based** statistics.

### Model-based

* **Skeleton extraction** — joint positions (OpenPose, AlphaPose).
* **Joint angles over time** — hip, knee, ankle.
* **Stride length, frequency**.

### Deep learning

* **3D CNN** — spatiotemporal features from silhouette sequences.
* **GaitSet, GaitGL** — current SOTA architectures.

## Pipeline

::: svg "Gait pipeline: video → silhouette segmentation → gait cycle detection → feature extraction → matching."
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aGT" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="10" y="60" width="70" height="40" rx="4"/>
    <rect x="90" y="60" width="90" height="40" rx="4"/>
    <rect x="190" y="60" width="100" height="40" rx="4"/>
    <rect x="300" y="60" width="100" height="40" rx="4"/>
    <rect x="410" y="60" width="90" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="45" y="84">video</text>
    <text x="135" y="84">silhouette</text>
    <text x="135" y="96" font-size="9" fill="var(--text-muted)">extraction</text>
    <text x="240" y="84">cycle detect</text>
    <text x="240" y="96" font-size="9" fill="var(--text-muted)">period</text>
    <text x="350" y="84">features</text>
    <text x="350" y="96" font-size="9" fill="var(--text-muted)">GEI, DL</text>
    <text x="455" y="84">match</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aGT)">
    <path d="M80,80 L88,80"/>
    <path d="M180,80 L188,80"/>
    <path d="M290,80 L298,80"/>
    <path d="M400,80 L408,80"/>
  </g>
</svg>
:::

## Vlastnosti

### Pro

* **Distance:** identifies up to 50+ m.
* **Non-contact:** no user cooperation needed.
* **Low-resolution OK:** doesn't require HD face.
* **Hard to disguise:** unconscious motor pattern, hard to fake consciously.
* **Surveillance-friendly:** integrates with existing CCTV.

### Proti

* **Variabilita:** clothing, footwear (heels vs. sneakers), surface, mood, injury, fatigue.
* **Accuracy:** 5–10 % EER for video-based; better for wearable.
* **Privacy concerns:** can identify in public spaces without consent.
* **Camera angle dependent:** works best with side-view.
* **Lighting:** outdoor better than indoor (consistent natural light).

## Performance

* **CASIA-B dataset** (largest gait dataset) — *cross-view* (different camera angles) is hard.
* **Best DL systems** (GaitGL, 2021): ~95 % rank-1 accuracy on CASIA-B.
* **Wearable sensors:** EER ~2–5 %.

## Aplikace

### Surveillance

* **Airport security** — UK Heathrow.
* **City CCTV networks** — Chinese cities (controversial).
* **Crime scene gait analysis** — UK courts admit gait evidence.

### Forensic

* **Crime scene video** + suspect gait comparison.
* Court testimony by gait analysts.
* Controversial — limited scientific basis.

### Medical

* **Parkinsonism detection** — gait characteristics.
* **Diabetic neuropathy assessment**.
* **Fall prediction** for elderly.
* Combined biometric + medical.

### Continuous authentication

* **Smartphone** with accelerometers — passive gait check.
* Detects if device is being used by *unauthorized* person.

### Smart home

* **Floor pressure sensors** — identify household member.
* **Privacy-friendly** alternative to cameras.

## Spoofing & evasion

### Evasion

* **Backpacks, carrying objects** — changes gait.
* **Different shoes** — significant impact.
* **Walking unnaturally** — surprisingly hard to fool good systems consistently.
* **Disguise** — limited effectiveness against DL systems.

### Spoofing

* **Mimicking someone else's gait** — *very difficult*.
* **AI-generated walking videos** — possible but obvious to detect.

## Privacy a etika

* **Surveillance bez vědomí** — *velký* privacy issue.
* **Cross-camera tracking** — building person re-identification.
* **EU AI Act** — restrictions on biometric surveillance in public spaces.

## Trends

* **3D gait** — depth sensor based.
* **Multi-modal** — gait + face + clothing.
* **Federated learning** — privacy-preserving gait training.
* **Adversarial robustness** — defense against intentional evasion.

---

*Zdroj: BIO přednášky 2025/26, BIO 12 — Dynamické biometrické vlastnosti. Externí reference: Wang, L. et al.: *Silhouette Analysis-Based Gait Recognition for Human Identification* (IEEE PAMI 2003); Sarkar, S. et al.: *The HumanID Gait Challenge Problem: Data Sets, Performance, and Analysis* (IEEE PAMI 2005); Chao, H. et al.: *GaitSet: Regarding Gait as a Set for Cross-View Gait Recognition* (AAAI 2019); CASIA Gait Database — [biometrics.idealtest.org](http://biometrics.idealtest.org/).*
