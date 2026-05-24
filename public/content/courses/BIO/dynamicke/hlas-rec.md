---
title: Rozpoznávání hlasu (speaker recognition)
---

# Rozpoznávání hlasu (speaker recognition)

**Speaker recognition** identifikuje *osobu* podle jejího hlasu. Liší se od **speech recognition** (rozpoznávání *obsahu* řeči) — speaker recognition cílí na *kdo* mluví, ne *co* říká. Hlas je *behaviorální* biometrika kombinující anatomické (velikost vokálních ústrojí) a behaviorální (intonace, rytmus) komponenty.

## Anatomie hlasového aparátu

::: svg "Hlasový aparát: pleura → trachea → larynx (hlasivky) → pharynx → ústní/nosní dutina (resonant cavities) → výstup."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="rgba(200,180,150,0.5)" stroke="var(--accent)" stroke-width="1.5">
    <path d="M180,180 L180,150 L200,140 L240,90 L290,70 L320,75 L340,90 L355,130 L340,170 L290,200 Z"/>
  </g>
  <g fill="rgba(220,150,100,0.5)" stroke="var(--accent)" stroke-width="1">
    <ellipse cx="240" cy="120" rx="15" ry="20"/>
    <ellipse cx="200" cy="160" rx="12" ry="15"/>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10.5">
    <text x="370" y="80">resonance cavities</text>
    <text x="370" y="95" font-size="9.5" fill="var(--text-muted)">ústní, nosní</text>
    <text x="370" y="120">larynx (hlasivky)</text>
    <text x="370" y="135" font-size="9.5" fill="var(--text-muted)">vocal cords</text>
    <text x="370" y="160">pharynx (hltan)</text>
    <text x="370" y="185">trachea</text>
  </g>
  <g stroke="var(--text-muted)" stroke-width="0.7" fill="none">
    <path d="M325,80 L365,80"/>
    <path d="M255,120 L365,120"/>
    <path d="M215,160 L365,160"/>
  </g>
</svg>
:::

* **Larynx (hrtan)** s **vocal cords** (hlasivky) — primary source pitch.
* **Pharynx, oral cavity, nasal cavity** — *resonance chambers* shaping spectrum.
* **Tongue, lips** — articulators.
* **Velum** — soft palate.

Individuality:
* **Anatomical:** size of cavities, vocal cord length/mass.
* **Behavioral:** speaking style, accent, rhythm, intonation.

## Modes of speaker recognition

### Text-dependent

* User says *specific* phrase (e.g., "My voice is my password").
* Higher accuracy.
* Used in *voice biometric phone banking*.

### Text-independent

* User speaks *arbitrary* content.
* Lower accuracy, more flexibility.
* Used in *forensic*, *surveillance*.

### Text-prompted

* System prompts random phrase, user repeats.
* Anti-spoofing (against pre-recorded audio).

## Speaker recognition pipeline

::: svg "Pipeline: audio capture → preprocessing → feature extraction → model (GMM, i-vector, x-vector) → matching."
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aSR" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="20" y="60" width="80" height="40" rx="4"/>
    <rect x="110" y="60" width="80" height="40" rx="4"/>
    <rect x="200" y="60" width="100" height="40" rx="4"/>
    <rect x="310" y="60" width="100" height="40" rx="4"/>
    <rect x="420" y="60" width="100" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="60" y="84">audio</text>
    <text x="60" y="96" font-size="9" fill="var(--text-muted)">.wav</text>
    <text x="150" y="84">preproc.</text>
    <text x="150" y="96" font-size="9" fill="var(--text-muted)">VAD, filter</text>
    <text x="250" y="84">MFCC</text>
    <text x="250" y="96" font-size="9" fill="var(--text-muted)">features</text>
    <text x="360" y="84">embedding</text>
    <text x="360" y="96" font-size="9" fill="var(--text-muted)">x-vector</text>
    <text x="470" y="84">match</text>
    <text x="470" y="96" font-size="9" fill="var(--text-muted)">cosine</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aSR)">
    <path d="M100,80 L108,80"/>
    <path d="M190,80 L198,80"/>
    <path d="M300,80 L308,80"/>
    <path d="M410,80 L418,80"/>
  </g>
</svg>
:::

### 1. Audio capture

* **Sample rate:** 8 kHz (telephone) – 48 kHz (high-quality).
* **Bit depth:** 16-bit signed.
* **Mono.**

### 2. Preprocessing

* **Voice Activity Detection (VAD)** — remove silence.
* **Noise reduction** — spectral subtraction.
* **Pre-emphasis filter** — boost high frequencies.

### 3. Feature extraction

#### MFCC (Mel-Frequency Cepstral Coefficients)

Standard speech features:

1. Window audio (25 ms frames, 10 ms hop).
2. **FFT** — spectrum.
3. **Mel filterbank** — 26 filters spaced on perceptual mel scale.
4. **Log** — power → loudness.
5. **DCT** — decorrelate → 12–13 coefficients per frame.

Output: time series of MFCC vectors.

::: viz voice-mfcc "Pipeline FFT → mel filterbank → log → DCT → MFCC; heatmapa MFCC pro dva mluvčí + cosine similarity."
:::

#### Other features

* **LPC** (Linear Predictive Coding).
* **PLP** (Perceptual Linear Prediction).
* **Delta + delta-delta** — temporal derivatives.

### 4. Speaker modeling

#### GMM (Gaussian Mixture Models)

Classical:

* Each speaker modeled by mixture of Gaussians in feature space.
* Universal Background Model (UBM) trained on all speakers; speaker-specific model adapted.

#### i-vector (2010)

* **Identity vector** — fixed-length representation of variable-length utterance.
* Based on factor analysis of GMM supervectors.
* Dominant 2010–2017.

#### x-vector (2018+)

* **DL-based embedding** — Time Delay Neural Network (TDNN) processes MFCC + outputs fixed embedding.
* Replaced i-vectors as state-of-the-art.
* Used by NIST SRE leading systems.

#### ECAPA-TDNN (2020+)

* Improved x-vector with **attention** mechanism.
* Current state-of-the-art for many benchmarks.

### 5. Matching

* **Cosine similarity** between embeddings.
* **PLDA** (Probabilistic Linear Discriminant Analysis) scoring — handles within-class vs between-class variability.

## Performance

NIST **SRE** (Speaker Recognition Evaluation), ongoing since 1996:

* **2020 SRE:** best EER ~1 % for short utterances (10–60 sec).
* **Telephone audio:** EER 3–5 %.
* **Cross-language:** harder, EER 5–10 %.

Modern *consumer* deployment (Apple Siri Voice ID, Google Voice Match):

* FAR: 1 in 10 000 (claimed).
* FRR: 1–5 %.

## Aplikace

### Phone banking

* **Voice biometric authentication** instead of password.
* HSBC Voice ID (2016+), Citi VoicePass.
* **Phrase:** "My voice is my password."

### Forensic

* **Voice analysis** for criminal investigations.
* Compare suspect audio to known recordings.
* Court-admissible in many jurisdictions with expert testimony.

### Smart speakers

* **Apple Siri** Voice ID (per-user).
* **Google Voice Match** — distinguishes household members.
* **Amazon Echo** Voice Profiles.

### Call centers

* **Caller identification** without explicit verification.
* **Fraud detection** — voice biometric blacklist.

### Surveillance

* Tracking individuals across multiple recordings.
* Voice in mobile communications.

## Útoky a anti-spoofing

### Replay attack

* Pre-recorded audio of legitimate user.
* **Defenze:** liveness — random phrase prompts, channel analysis (recording artifacts).

### Voice cloning / synthesis

* Modern AI tools (ElevenLabs, Resemble AI) — high-quality voice cloning from seconds of audio.
* **Threat:** can spoof voice biometric with synthetic audio.
* **Defenze:** anti-spoofing classifiers (ASVspoof challenges).

### Impersonation

* Human impressionists.
* Generally not perfect, detectable by good systems.

### Voice modification

* Speech synthesizers, voice changers.
* Detectable via spectrum analysis.

## ASVspoof

[ASVspoof Challenge](https://www.asvspoof.org/) — biennial competition for anti-spoofing:

* **Logical access** (LA) — synthesized speech detection.
* **Physical access** (PA) — replay attack detection.
* Datasets, baselines, leaderboards.

State-of-the-art detectors use:
* **CNN-based** acoustic features.
* **Constant-Q transform**.
* **Wave2Vec** representations.

## Standardy

* **ISO/IEC 19794-13:2018** — Voice data.
* **NIST SRE** — ongoing evaluation.

## Limity

### Vnitrotřídní variabilita

* **Stejná osoba** říká stejnou větu *jinak* podle:
  * Emotion (calm vs. angry).
  * Cold / illness.
  * Tiredness.
  * Microphone differences.

### Mezitřídní variabilita

* **Identical twins, family members** mají *very similar* voices.
* Same-gender, same-age, same-dialect — harder to distinguish.

### Aging

* Voice changes *significantly* over time.
* Children → adolescent → adult voice shifts.
* Older adults — voice tremor, weakening.

## Trends

* **AI-driven voice synthesis** ↔ **AI-driven detection** — arms race.
* **Multi-microphone** capture (smart speakers) — direction + voice biometric.
* **Federated learning** — privacy-preserving training.
* **Voice + face** multimodal.
* **Continuous authentication** — passive voice recognition during call.

---

*Zdroj: BIO přednášky 2025/26, BIO 12 — Dynamické biometrické vlastnosti. Externí reference: Reynolds, D. A.: *An overview of automatic speaker recognition technology* (ICASSP 2002); Snyder, D. et al.: *X-vectors: Robust DNN Embeddings for Speaker Recognition* (ICASSP 2018); ASVspoof Challenge — [asvspoof.org](https://www.asvspoof.org/); NIST SRE — [nist.gov/itl/iad/mig/speaker-recognition-evaluation-2020](https://www.nist.gov/itl/iad/mig/speaker-recognition-evaluation-2020).*
