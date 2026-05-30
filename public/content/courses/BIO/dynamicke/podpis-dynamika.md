---
title: Podpis — dynamika a statika
---

# Podpis — dynamika a statika

**Podpis** je nejstarší formou autentizace v právním kontextu — dokumenty, smlouvy, šeky. V biometrii rozlišujeme **statický** (off-line) a **dynamický** (on-line) podpis. Dynamický podpis je mnohem přesnější díky *behaviorálním* informacím o procesu psaní.

## Statický vs. dynamický

::: svg "Static signature: scan or photo of finished signature. Dynamic signature: capture process during writing — pressure, speed, pen angle over time."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="220" height="140" rx="8"/>
    <rect x="280" y="40" width="240" height="140" rx="8"/>
  </g>
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <path d="M60,120 C80,80 100,140 130,90 C160,140 180,100 200,120"/>
  </g>
  <g stroke="var(--accent)" stroke-width="2" fill="none">
    <path d="M320,120 C340,80 360,140 390,90 C420,140 440,100 460,120"/>
  </g>
  <g stroke="var(--accent)" stroke-width="0.6" fill="none" stroke-dasharray="2 2">
    <line x1="320" y1="60" x2="320" y2="160"/>
    <line x1="340" y1="60" x2="340" y2="160"/>
    <line x1="360" y1="60" x2="360" y2="160"/>
    <line x1="380" y1="60" x2="380" y2="160"/>
    <line x1="400" y1="60" x2="400" y2="160"/>
    <line x1="420" y1="60" x2="420" y2="160"/>
    <line x1="440" y1="60" x2="440" y2="160"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="130" y="62" font-size="12">Statický (off-line)</text>
    <text x="130" y="78" font-size="10" fill="var(--text-muted)">jen obraz</text>
    <text x="400" y="62" font-size="12">Dynamický (on-line)</text>
    <text x="400" y="78" font-size="10" fill="var(--text-muted)">obraz + čas + tlak</text>
    <text x="130" y="190" font-size="10" fill="var(--text-muted)">scan, photo</text>
    <text x="400" y="190" font-size="10" fill="var(--text-muted)">digitizer tablet, stylus</text>
  </g>
</svg>
:::

### Statický (off-line, image-based)

* **Capture:** *hotový* podpis na papíru, scanned/photographed.
* **Information:** jen *shape* / *image*.
* **Difficulty:** *velmi* obtížné — skilled forger lze obtížně odlišit.
* **Performance:** EER 5–15 %.
* **Použití:** *forenzní* analýza (handwriting expert).

### Dynamický (on-line, process-based)

* **Capture:** během psaní; digitizer tablet (Wacom), styly na touchscreen.
* **Information:**
  * **(x, y)** pozice over time.
  * **pressure** (z) — tlak na stylus.
  * **pen angles** (azimuth, altitude).
  * **velocity, acceleration** — derived.
  * **pen-up moves** (in-air movements).
* **Difficulty:** *much harder* to forge — even seeing the signature doesn't reveal *how* it was written.
* **Performance:** EER 2–5 %.
* **Použití:** banking, document signing.

::: viz signature-dynamic "Playback (x,y,p,t); skilled forgery napodobí tvar, ale pressure a velocity profily prozradí podvrh."
:::

## Dynamic signature features

Z time-series dat extrahujeme:

* **Global features:**
  * Total duration.
  * Total path length.
  * Average velocity.
  * Max pressure.
  * Number of pen lifts.
* **Local features:**
  * Velocity profile.
  * Pressure profile.
  * Trajectory shape.
* **Stroke segmentation:**
  * Identify *strokes* (continuous pen-down moves).
  * Per-stroke features.

## Snímání

### Digitizer tablet (Wacom, Topaz)

* **Pen tablet** s active stylus.
* **Sampling rate:** 100–200 Hz typical.
* **Pressure:** 256–2048 levels.
* **Pen angles** measured by some models.
* **High accuracy.**

### Touchscreen + stylus

* **iPad + Apple Pencil**, Galaxy Note s S Pen.
* **Sampling:** ~60–120 Hz.
* **Pressure:** Apple Pencil 4096 levels.
* **Mass-market** availability.

### Finger on touchscreen

* No stylus, just finger.
* No pressure, no angles.
* **Limited information** → lower accuracy.

## Algoritmy

### DTW (Dynamic Time Warping)

Standardní pro time-series matching:

::: math
DTW(s_1, s_2) = \min \sum_{i, j} d(s_1[i], s_2[j])
:::

* Aligns sequences of different lengths.
* Robust to *speed variations*.

### Hidden Markov Models (HMM)

* Each user has HMM trained on their signature.
* Test signature scored by HMM likelihood.

### Deep learning

* LSTM, Transformer architectures.
* Recent benchmarks dominated by DL.

### Feature-based + classifier

* Extract global + local features.
* SVM, Random Forest, k-NN.
* Faster than DTW for large databases.

## Anti-spoofing

### Forgery types

* **Random forgery** — attacker doesn't know target signature; uses *own* signature.
* **Skilled forgery (simple)** — attacker has *seen* target signature once.
* **Skilled forgery (practiced)** — attacker had *time to practice*.

### Detection

* **Pressure patterns** — hard to mimic exactly.
* **Velocity profiles** — harder than spatial shape.
* **Temporal consistency** — multiple signatures from same person are consistent.

### Limits

* Practiced forgers can fool *static* systems easily.
* **Dynamic** much harder — even skilled forgers struggle with timing.

## Standardy

* **ISO/IEC 19794-7:2014** — Signature/sign time series data.
* **ISO/IEC 19794-11:2013** — Signature/sign processed dynamic data.

## Aplikace

### Banking

* **In-branch signature pads** — Wacom STU series.
* **Mobile signing** — DocuSign, Adobe Sign with biometric capture.
* **Check authorization** — declining, but still used.

### Document signing

* **PDF signing** with biometric data embedded.
* **Legal frameworks:**
  * **eIDAS** (EU) — Qualified Electronic Signatures.
  * **ESIGN Act** (US) — electronic signatures legally binding.

### Tablet checkout

* Retail POS — credit card with signature on tablet.
* Increasingly replaced by PIN or contactless.

## Limity

### Variabilita

* **Intra-class:** *velká* — even same person signs differently each time.
* **Mood, emotion, position** affect signature.
* **Aging:** signatures evolve over years.

### Forgeability

* **Skilled forgers** can fool static systems.
* **Forensic experts** have higher accuracy than algorithms.

### Cross-device

* Signature on Wacom tablet ≠ same person's signature on iPad.
* **Device-dependent enrollment** required.

## Performance

**SVC2004** (First International Signature Verification Competition, organizovaná HKUST, ICBA 2004):

* **Best systems:** EER ~3 % for skilled forgery.
* **Random forgery:** EER < 0.5 %.

## Forensic handwriting analysis

Vedle biometriky:

* **Forensic Document Examiners (FDE)** — experts in handwriting comparison.
* **Court testimony** in fraud, will disputes.
* Method: ACE-V (Analysis, Comparison, Evaluation, Verification).
* Controversies: subjective, no statistical basis (similar concerns as latent fingerprint analysis post-NAS 2009).

## Vztah k jiným biometrikám

| | **Signature (dynamic)** | **Voice** | **Keystroke** |
| :--- | :---: | :---: | :---: |
| Effort | active | passive | passive |
| Privacy | high | medium | high |
| Accuracy | medium | medium | low |
| Liveness | implicit (active gesture) | requires checks | implicit |
| Mass adoption | declining | growing | growing |

## Trends

* **eIDAS Qualified Electronic Signatures** — dynamic signature with PKI integration.
* **Mobile-first** — Apple Pencil, S Pen for high-quality dynamic capture.
* **DL-based** matching replacing traditional DTW.
* **Cross-domain** — handwriting recognition + biometric ID.

---

*Zdroj: BIO přednášky 2025/26, BIO 12 — Dynamické biometrické vlastnosti. Externí reference: Plamondon, R., Lorette, G.: *Automatic Signature Verification and Writer Identification — The State of the Art* (Pattern Recognition 1989); Fairhurst, M. C., Kaplani, E.: *Perceptual analysis of handwritten signatures for biometric authentication* (IEE Vision 2003); ISO/IEC 19794-7:2014; SVC2004 benchmark — [conference details](https://link.springer.com/chapter/10.1007/978-3-540-25976-3_2).*
