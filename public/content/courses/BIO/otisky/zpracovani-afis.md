---
title: Zpracování otisku a AFIS
---

# Zpracování otisku a AFIS

Plně automatizovaný workflow rozpoznání otisku — od *raw* image ze senzoru až po *match decision* v databázi miliónů otisků. **AFIS** (Automated Fingerprint Identification System) je *kompletní systém* zahrnující senzory, image processing, matching engine, databáze a workflow management.

## Pipeline zpracování

::: svg "Pipeline: snímek → enhancement → binarization → thinning → minutiae detection → matching → result."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aAFIS" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="10" y="60" width="70" height="40" rx="4"/>
    <rect x="90" y="60" width="70" height="40" rx="4"/>
    <rect x="170" y="60" width="70" height="40" rx="4"/>
    <rect x="250" y="60" width="70" height="40" rx="4"/>
    <rect x="330" y="60" width="80" height="40" rx="4"/>
    <rect x="420" y="60" width="60" height="40" rx="4"/>
    <rect x="170" y="150" width="160" height="40" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="45" y="85">snímek</text>
    <text x="125" y="85">enhance</text>
    <text x="205" y="85">binarize</text>
    <text x="285" y="85">thinning</text>
    <text x="370" y="85">minutiae</text>
    <text x="450" y="85">match</text>
    <text x="250" y="175">DB šablon</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aAFIS)">
    <path d="M80,80 L88,80"/>
    <path d="M160,80 L168,80"/>
    <path d="M240,80 L248,80"/>
    <path d="M320,80 L328,80"/>
    <path d="M410,80 L418,80"/>
    <path d="M250,150 L420,102"/>
  </g>
</svg>
:::

## 1. Image enhancement

Raw image ze senzoru je *nekvalitní*: low contrast, noise, gaps in ridges.

### Gabor filter

Standard pro fingerprint enhancement. **Gabor filter** je směrový bandpass filter:

::: math
G(x, y; \theta, f) = \exp\left(-\frac{x'^2 + y'^2}{2\sigma^2}\right) \cdot \cos(2\pi f x')
:::

* $\theta$ — orientace filtru (matches local ridge orientation).
* $f$ — frekvence (matches local ridge density).
* $\sigma$ — sigma Gaussian envelope.

Aplikace:

1. **Compute orientation field** — pro každý pixel odhadni *local ridge orientation* (gradient analysis).
2. **Compute frequency field** — local ridge frequency (typically 7–15 pixels per ridge).
3. **Apply Gabor filter** — *direction-specific*; filtr přizpůsoben *local* parameters.

Výsledek: dramatic improvement of ridge clarity, gap filling.

::: viz gabor-ridge-enhance "Nastavte orientaci a frekvenci Gabor filtru a sledujte, jak zostří ridge image."
:::

### FFT-based enhancement

Alternativně: *frequency domain* enhancement.

* FFT image → high-pass filter → inverse FFT.
* Less direction-aware than Gabor, but faster.

## 2. Segmentation

Identifikace *fingerprint region* (foreground) vs. *background* (skin off-finger, noise).

* **Variance-based** — high variance = foreground (ridges); low variance = background (smooth).
* **Coherence-based** — well-defined orientation = foreground.

Output: *binary mask* ridges-only.

## 3. Binarization

Převod grayscale → binary (black ridges, white valleys).

* **Adaptive thresholding** — Otsu's method per local block.
* **Mean filter + threshold** — simple but works.

## 4. Thinning (skeletonization)

Redukce *every ridge* na *1-pixel-wide* line (skeleton).

* **Algoritmus:** iterative deletion of boundary pixels (Zhang-Suen 1984).
* Standard preprocessing for minutiae extraction.

## 5. Minutiae extraction

Viz [[markanty]]. Stručně:

* Pro každý pixel na skeletonu spočti **crossing number (CN)**.
* CN = 1 → ridge ending. CN = 3 → bifurcation.
* Post-process: filter false minutiae (border effects, noise artifacts).

## 6. Matching

Viz [[markanty]]. Algoritmus alignment + minutiae correspondence.

## 7. Decision

Score > threshold → match.

## AFIS — large-scale architecture

**Automated Fingerprint Identification System** je systémová implementace pro *large-scale* deployment.

### Komponenty

* **Enrollment workstation** — captures 10-fingers + photo, links to identity.
* **Database** — centralized storage of templates.
* **Matcher engine** — high-throughput matching (1000+ comparisons/sec).
* **Examiner workstation** — for *human review* of AFIS candidates.
* **Latent fingerprint workstation** — for forensic latent search.

### Operational modes

* **Tenprint search** — full 10-finger enrollment against database. Used for *background checks*, criminal records.
* **Latent search** — *partial single* finger from crime scene against database. Used in forensic investigations.
* **Verification** — 1:1 fingerprint check (e.g., border control entry).
* **Identification** — 1:N (e.g., suspect identification).

### Major AFIS deployments

| Systém | Region | Velikost |
| :--- | :--- | :---: |
| **FBI NGI** | USA | 150+ million |
| **Aadhaar UIDAI** | Indie | 1.3 mld (s iris + face) |
| **EU Eurodac** | EU | ~6 million (asylum applicants) |
| **INTERPOL AFIS** | Mezinárodní | 200 000+ |
| **UK IDENT1** | UK | 8 million |
| **DPMB** (police CZ) | ČR | ~1 million |

## Latent fingerprint processing

Forenzní use case — *partial, low-quality* otisk z crime scene.

### Workflow

1. **Crime scene capture** — police technicians develop latent print (powder, chemical).
2. **Digital scan** — 1000 dpi, high-resolution camera.
3. **Manual quality assessment** — examiner posoudí, zda použitelné.
4. **Feature extraction** (often manual) — examiner *označí* minutiae.
5. **Search AFIS** — automated candidate list (top 20).
6. **Manual comparison** — examiner *side-by-side* compare s každým kandidátem.
7. **Decision** — *identification* / *exclusion* / *inconclusive*.

### Limity

* **Partial coverage** — typicky < 50 % full finger.
* **Distortion** — pressure, surface curvature.
* **Background patterns** — substrate (wood grain, fabric) interferes.
* **Subjective bias** — examiner's *expectation* může ovlivnit decision (NAS 2009 report).

## NGI — Next Generation Identification

FBI's modernized AFIS (2011+):

* **IAFIS** (1999) replaced with **NGI** (2011).
* Adds:
  * **Face recognition** (FRVT-tested algorithms).
  * **Iris recognition** (limited).
  * **Palmprints** — increased recognition capability.
* **Repository of Individuals of Special Concern** (RISC) — fast lookup against known terrorists.

## Standards

* **ANSI/NIST-ITL 1-2011** — data exchange format.
* **ISO/IEC 19794-2:2011** — minutiae interchange.
* **EBTS** (FBI Electronic Biometric Transmission Specification) — protocol for FBI-state-county communication.
* **ENFSI** (European Network of Forensic Science Institutes) — guidelines.

## Performance metrics

NIST FpVTE 2023 benchmark:

* **Vendor leader:** ~0.05 % FNMR @ FMR = 0.01 % for *tenprint search* against 100M database.
* **Latent matching:** ~50–70 % rank-1 hit rate (depends heavily on print quality).

## Trends 2025

* **Deep learning** features replacing minutiae-based matching for some applications.
* **Touchless capture** for higher-quality, hygienic enrollment.
* **Mobile AFIS** — handheld devices for field operations.
* **Privacy-preserving AFIS** — cancelable biometrics, fully homomorphic encryption.

---

*Zdroj: BIO přednášky 2025/26, BIO 5 — Rozpoznávání podle otisků prstů (Drahanský). Externí reference: Maltoni, D., Maio, D., Jain, A. K., Prabhakar, S.: *Handbook of Fingerprint Recognition* (2nd ed., Springer 2009); FBI: *Integrated Automated Fingerprint Identification System (IAFIS)* — [fbi.gov](https://www.fbi.gov/services/cjis/fingerprints-and-other-biometrics); NIST FpVTE — [nist.gov/programs-projects/fingerprint-vendor-technology-evaluation-fpvte](https://www.nist.gov/programs-projects/fingerprint-vendor-technology-evaluation-fpvte); National Research Council: *Strengthening Forensic Science in the United States: A Path Forward* (NAS 2009).*
