---
title: Deep learning pro rozpoznávání obličeje
---

# Deep learning pro rozpoznávání obličeje

Deep learning *revolucionizoval* face recognition. Mezi 2014 (DeepFace, Facebook) a 2020 přesnost vzrostla z ~95 % na 99.9 %. Klíčem byly *velké datasety* (milióny obličejů), *konvoluční neuronové sítě* (CNN), a *speciální loss functions* (triplet loss, ArcFace), které vytváří diskriminační *embeddings*.

## Princip

::: svg "Deep learning face recognition: image → CNN backbone → embedding vector → cosine distance comparison."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aDLF" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="60" width="80" height="50" rx="4"/>
    <rect x="120" y="60" width="120" height="50" rx="4"/>
    <rect x="260" y="60" width="100" height="50" rx="4"/>
    <rect x="380" y="60" width="140" height="50" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="60" y="80" font-size="11">obraz</text>
    <text x="60" y="98" font-size="9" fill="var(--text-muted)">112×112 RGB</text>
    <text x="180" y="80" font-size="11">CNN backbone</text>
    <text x="180" y="98" font-size="9" fill="var(--text-muted)">ResNet, MobileFaceNet</text>
    <text x="310" y="80" font-size="11">embedding</text>
    <text x="310" y="98" font-size="9" fill="var(--text-muted)">128–512 dim</text>
    <text x="450" y="80" font-size="11">cosine distance</text>
    <text x="450" y="98" font-size="9" fill="var(--text-muted)">→ match score</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aDLF)">
    <path d="M100,85 L118,85"/>
    <path d="M240,85 L258,85"/>
    <path d="M360,85 L378,85"/>
  </g>
</svg>
:::

Obecný workflow:

1. **Input image** — RGB obličej (typicky 112 × 112).
2. **CNN backbone** — ResNet50, ResNet100, MobileFaceNet, EfficientNet.
3. **Output embedding** — vektor 128–512 dim, L2-normalized.
4. **Comparison:** cosine similarity dvou embeddings.

## Klíčové architektury

### DeepFace (Facebook, 2014)

[Taigman et al.](https://www.cs.toronto.edu/~ranzato/publications/taigman_cvpr14.pdf):

* **3D face alignment** preprocessing.
* **9-layer CNN** + **fully connected** layer.
* Trained on **4 million** Facebook images.
* **97.35 %** accuracy on LFW — closing the gap to human-level (~97.5 %).

### DeepID series (CUHK, 2014–2015)

[Sun, Wang, Tang](https://link.springer.com/chapter/10.1007/978-3-319-10599-4_50):

* DeepID1 → DeepID2 → DeepID3.
* Multiple CNNs trained on *different* face regions.
* Concatenated features.

### FaceNet (Google, 2015)

[Schroff, Kalenichenko, Philbin](https://arxiv.org/abs/1503.03832):

* **Inception-based CNN**.
* **Triplet loss** — explicit metric learning.
* **128-dimensional** L2-normalized embedding.
* Trained on **~100–200M** images, **~8M** identities.
* **99.63 %** accuracy on LFW.

#### Triplet loss

Klíčový novel ingredient:

::: math
\mathcal{L} = \sum_i \left[\|f(x_i^a) - f(x_i^p)\|_2^2 - \|f(x_i^a) - f(x_i^n)\|_2^2 + \alpha\right]_+
:::

* $x^a$ — *anchor* (reference image).
* $x^p$ — *positive* (same person as anchor).
* $x^n$ — *negative* (different person).
* $\alpha$ — *margin* (typically 0.2).

Loss pushes anchor closer to positive than to negative by margin $\alpha$. Direct optimization of *embedding distances*.

### SphereFace, CosFace, ArcFace (2017–2018)

Family of *angular margin* losses. Best modern face recognition.

#### ArcFace (Deng et al. 2018)

[ArcFace](https://arxiv.org/abs/1801.07698) — current standard:

::: math
\mathcal{L} = -\log \frac{e^{s \cdot \cos(\theta_{y_i} + m)}}{e^{s \cdot \cos(\theta_{y_i} + m)} + \sum_{j \neq y_i} e^{s \cdot \cos\theta_j}}
:::

* $\theta_{y_i}$ — úhel mezi embedding a class center.
* $m$ — *angular margin* (typically 0.5 rad).
* $s$ — *scale* (typically 64).

ArcFace explicitly enforces *angular separation* between classes — clean geometric interpretation. **99.83 %** on LFW.

::: viz arcface-margin "2D angular embedding s class centers; posuňte margin m a scale s, sledujte rozhodovací hranice."
:::

## Standardní benchmarks

### LFW (Labeled Faces in the Wild)

* 13 233 images, 5 749 people, *wild* (uncontrolled) conditions.
* Test: 6 000 pairs.
* **Human accuracy:** 97.5 %.
* **Modern DL:** 99.85 % (saturated, no longer challenging).

### MegaFace

* 4.7M images, 670K celebrities.
* Test: identify *probe* person among 1 million distractors.
* More realistic; modern DL still ~95 % rank-1.

### IJB-A, IJB-B, IJB-C

* IARPA Janus Benchmark series.
* Real-world unconstrained conditions, multiple cameras.
* Currently active research benchmark.

### NIST FRVT

* Ongoing, *industry standard* for vendor evaluation.
* Reports: 1:1 verification, 1:N identification, demographic effects.

## Tréninkové datasety

* **CASIA-WebFace** — 500K images, 10K identities (public).
* **MS-Celeb-1M** — 10M images (*withdrawn* due to privacy issues).
* **VGGFace2** — 3.3M images, 9K identities.
* **Glint360K** — 17M images, 360K identities.
* **WebFace260M** — 260M images, 4M identities (largest public).

> **Privacy concern:** Many datasets are *scraped* from web without consent. EU GDPR + CCPA force re-evaluation. Many academic datasets withdrawn after 2018.

## Computational requirements

| Model | Size | Inference (CPU) | Embedding dim |
| :--- | :---: | :---: | :---: |
| MobileFaceNet | 1 MB | 10 ms | 128 |
| ResNet50 ArcFace | 100 MB | 100 ms | 512 |
| ResNet100 ArcFace | 250 MB | 200 ms | 512 |

For **edge devices** (mobile, IoT): MobileFaceNet preferred. For **server-side**: ResNet100+ for max accuracy.

## Real-world deployments

### Apple Face ID

* **TrueDepth** capture ([[snimani-oblicej]]).
* **On-device** processing — Secure Enclave.
* Custom *deep neural network* (proprietary).
* FAR: 1 in 1M; FRR: 1 in 1000 (claimed).

### Google FaceUnlock

* **Pixel 4** (2019) — IR + RGB + ToF.
* On-device matching, Trusty TEE storage.
* FAR: 1 in 50K (less strict than Apple).

### Microsoft Windows Hello

* **NIR cameras** required (no spoofing photos).
* DL backend.
* Templates stored in TPM.

### Surveillance — Clearview AI

* **Scraped 3+ billion** images from social media (~ illegal under GDPR).
* DL-based matching.
* Sold to law enforcement.
* **Banned** in EU, sued, partial restrictions in US.

### Aadhaar (India)

* 1.3 billion enrolled.
* DL face recognition + iris + fingerprint.
* Mass-scale identification system.

## Demographic effects (bias)

[NIST FRVT Part 3 (2019)](https://pages.nist.gov/frvt/reports/demographics/annexes/annex_16.pdf):

* False positive rates *higher* for darker-skinned faces.
* Female faces have higher FRR than male.
* Children (< 18) have *much* higher error rates than adults.
* Variations across vendors — best algorithms have smaller disparities.

**Cause:** training data imbalance (heavily skewed toward white, male, adult).

**Mitigation:** balanced datasets, fairness-aware training, demographic-specific thresholds.

## Limity DL face recognition

* **Adversarial examples** — small image perturbations cause misclassification ([[antispoofing-face]]).
* **Deepfakes** — synthetic faces ([[deepfakes]]).
* **Aging** — embeddings drift over 5+ years.
* **Bias** — demographic disparities.
* **Privacy** — embeddings are *quasi-identifiers* (can re-identify via reverse search).
* **Black box** — interpretability low; *why* did network decide match?

## Trends 2025

* **Multimodal fusion** — face + iris + voice for higher accuracy.
* **Adversarial robustness** — defenses against attacks.
* **Federated learning** — train on user devices without sharing raw data.
* **Synthetic training data** — privacy-preserving (StyleGAN-generated faces).
* **Self-supervised pretraining** — less reliance on labeled data.

---

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání obličeje. Externí reference: Taigman, Y. et al.: *DeepFace: Closing the Gap to Human-Level Performance in Face Verification* (CVPR 2014) — [PDF](https://www.cs.toronto.edu/~ranzato/publications/taigman_cvpr14.pdf); Schroff, F., Kalenichenko, D., Philbin, J.: *FaceNet: A Unified Embedding for Face Recognition and Clustering* (CVPR 2015) — [arXiv](https://arxiv.org/abs/1503.03832); Deng, J. et al.: *ArcFace: Additive Angular Margin Loss for Deep Face Recognition* (CVPR 2019) — [arXiv](https://arxiv.org/abs/1801.07698); NIST FRVT Ongoing — [pages.nist.gov/frvt](https://pages.nist.gov/frvt/).*
