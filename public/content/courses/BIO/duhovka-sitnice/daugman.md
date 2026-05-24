---
title: Daugman algoritmus pro iris
---

# Daugman algoritmus pro iris

**John Daugman** (Cambridge University, 1993) navrhl algoritmus pro **encoding duhovky** do *2048-bit iris code*. Tento algoritmus je dodnes *zlatým standardem* — používá ho většina komerčních iris recognition systémů (Iridian Technologies, IriTech, Aware, Tascent). Daugmanův algoritmus dovoluje *extrémně přesnou* identifikaci s jakkoli velkou databází.

## Pipeline algoritmu

::: svg "Daugman pipeline: capture → lokalizace iris (integro-differenční operátor) → normalization (rubber sheet) → Gabor demodulace → iris code (2048 bit) → Hamming distance."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <defs>
    <marker id="aDG" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="10" y="60" width="70" height="40" rx="4"/>
    <rect x="90" y="60" width="90" height="40" rx="4"/>
    <rect x="190" y="60" width="90" height="40" rx="4"/>
    <rect x="290" y="60" width="100" height="40" rx="4"/>
    <rect x="400" y="60" width="80" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="45" y="78">capture</text>
    <text x="45" y="92" font-size="9" fill="var(--text-muted)">NIR image</text>
    <text x="135" y="78">lokalizace</text>
    <text x="135" y="92" font-size="9" fill="var(--text-muted)">int.-dif. op.</text>
    <text x="235" y="78">normalizace</text>
    <text x="235" y="92" font-size="9" fill="var(--text-muted)">rubber sheet</text>
    <text x="340" y="78">Gabor demod.</text>
    <text x="340" y="92" font-size="9" fill="var(--text-muted)">2048 bit code</text>
    <text x="440" y="78">match</text>
    <text x="440" y="92" font-size="9" fill="var(--text-muted)">Hamming dist.</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aDG)">
    <path d="M80,80 L88,80"/>
    <path d="M180,80 L188,80"/>
    <path d="M280,80 L288,80"/>
    <path d="M390,80 L398,80"/>
  </g>
</svg>
:::

## 1. Capture

* **NIR camera** (700–900 nm) — neviditelné, but reveals iris pattern even in *dark* irises.
* **Resolution:** minimum 200 pixels across iris (640 × 480 image typically).
* **Distance:** 10–60 cm (klassicky), nově až 5 m (extended-range).

## 2. Lokalizace duhovky

Cíl: najít *vnitřní* (pupila) a *vnější* (sclera) hranici iris.

### Integro-differential operator

Daugman key contribution. Hledá *kruhovou* hranici, kde je *radial gradient* maximální:

::: math
\max_{(r, x_0, y_0)} \left| G_\sigma(r) * \frac{\partial}{\partial r} \oint_{r, x_0, y_0} \frac{I(x, y)}{2\pi r} ds \right|
:::

* $I(x, y)$ — image intensity.
* Kontur integral $\oint$ je *kruhový* contour s centrem $(x_0, y_0)$ a radiem $r$.
* Operator hledá *contour*, kde se průměr image rapidly changes s $r$.
* $G_\sigma$ je Gaussian smoothing kernel.

Dvě aplikace:

1. **Pupilární hranice** — *malý* radius, *high contrast*.
2. **Sclerální hranice** — *velký* radius, *low contrast*.

### Detekce víček

Také hledá *eyelids* (parabolic contours) → mask v okraji iris area.

## 3. Normalizace — rubber-sheet model

::: svg "Rubber sheet: 2D iris area (Cartesian, x-y) → 1D radial profil (polar, r-θ), normalizovaný na fixed size."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="rgba(150,200,230,0.3)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="100" cy="100" r="60"/>
  </g>
  <g fill="rgba(80,80,80,0.7)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="100" cy="100" r="22"/>
  </g>
  <g fill="rgba(150,200,230,0.3)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="240" y="60" width="220" height="80" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="100" y="180">Cartesian (x, y)</text>
    <text x="100" y="195" font-size="9" fill="var(--text-muted)">iris area</text>
    <text x="350" y="180">Polar (r, θ)</text>
    <text x="350" y="195" font-size="9" fill="var(--text-muted)">unrolled, 64 × 512</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none" marker-end="url(#aDG)">
    <path d="M170,100 L235,100"/>
  </g>
</svg>
:::

Iris se *unrolled* z 2D circular area do **1D polar coordinates**:

::: math
I(x, y) \to I(r, \theta)
:::

kde:

* $r \in [0, 1]$ je normalizovaný radius (0 = pupila, 1 = sclera).
* $\theta \in [0, 2\pi)$ je úhel.

Klíčová vlastnost **rubber sheet**:

* **Pupil dilation** mění poměr $r_{\text{iris}} / r_{\text{pupil}}$ — ale **normalized polar** zůstává *stejné*.
* To kompenzuje **pupillary deformation** automaticky.

Output: **64 × 512 polar image** of iris.

## 4. Gabor demodulation

Daugmanovo nejdůležitější contribution. Aplikuje **2D Gabor wavelets**:

::: math
G(r, \theta) = \exp\left(-\frac{(r - r_0)^2}{\alpha^2}\right) \exp\left(-\frac{(\theta - \theta_0)^2}{\beta^2}\right) \exp(-i\omega(\theta - \theta_0))
:::

* Real part: $\cos(\omega \theta)$ — *even* component.
* Imag part: $-\sin(\omega \theta)$ — *odd* component.

Konvoluce s každým Gabor kernel → complex response $h$. **Quantize** podle phase:

::: math
\text{bit}_{Re} = \begin{cases} 1 & \text{if } \text{Re}(h) > 0 \\ 0 & \text{else} \end{cases}, \quad \text{bit}_{Im} = \begin{cases} 1 & \text{if } \text{Im}(h) > 0 \\ 0 & \text{else} \end{cases}
:::

Po 1024 Gabor kernels (různé pozice, frekvence) → **2048 bit iris code**.

Each bit je *robust*: small image variations nezmění *sign of phase* (only magnitude). To je důvod, proč Daugman code je *velmi* stabilní napříč různým snímáním.

## 5. Matching — Hamming distance

Pro porovnání dvou iris codes $a, b$:

::: math
HD = \frac{1}{N} \sum_{i=1}^N (a_i \oplus b_i) \cdot m_i
:::

* $\oplus$ — XOR.
* $m_i$ — *mask bit* (1 if both codes have valid data at this position; 0 if masked due to eyelid, reflection, noise).
* $N$ — number of valid bits.

**Hamming distance** = % bits that differ:

* HD = 0 → identical (impossible in practice, even for same eye different captures).
* HD = 0.5 → random (independent).
* HD < 0.32 → *match* (standard threshold).

### Genuine vs. impostor distribution

* **Genuine (same eye, different captures):** HD ~ 0.10 (mean), σ ~ 0.05.
* **Impostor (different eyes):** HD ~ 0.50 (mean), σ ~ 0.015.

**Extreme separation** — distribuce se prakticky *nepřekrývají*. Daugman ([*Probing the Uniqueness and Randomness of IrisCodes* 2006](https://www.cl.cam.ac.uk/~jgd1000/proceedings.pdf)) odhadl FAR < $10^{-12}$ pro HD < 0.30.

::: viz daugman-iris-code "Pět fází Daugman pipeline a Hamming distance pro genuine vs impostor."
:::

## Rotation handling

Iris code se *vypočítává v polar coordinates*. Eye *rotation* (head tilt) = *circular shift* iris code.

* Při matching se *opakovaně* zkouší shifts: $-8, -7, ..., +7, +8$ pixel shifts.
* Min HD across all shifts → final score.

## Iris Code Standard

* **Daugman code** je *de facto* standard, ale ne ISO standard.
* **ISO/IEC 19794-6:2011** — *Biometric data interchange formats — Part 6: Iris image data*. Standardizuje *image format*, ne iris code.
* **Iridian / IriTech / Tascent** používají proprietary code formats; *interoperability* je omezená.

## Iris recognition systems

### CASIA Iris Database

* Chinese Academy of Sciences.
* Multiple datasets (CASIA-Iris v1/v2/v3/v4/Thousand) — celkem desítky tisíc images.
* *Standard* academic benchmark.

### IrisCode in real systems

* **UAE iris border control** (deployed 2002+) — 1 in 23M FAR.
* **Indian Aadhaar** — uses iris pro mass enrollment.
* **Bank of America ATM** — pilot 2019.
* **Worldcoin** — 2022 controversial mass iris scanning.

## Performance benchmarks

NIST **IREX** (Iris Exchange):

* **Best algorithms:** FRR < 0.1 % @ FAR = $10^{-5}$.
* **Demographic effects:** minimal (no significant gender/race bias for iris, unlike face).
* **Aging:** very stable.

## Limity Daugman algoritmu

* **Image quality** — out-of-focus, motion blur degrade code.
* **Iris area** — small for some individuals; less bits → less accuracy.
* **Pupil constriction** — extreme dilation/constriction may stretch rubber sheet outside model assumptions.
* **Contact lenses** — patterned cosmetic lenses can completely block iris.
* **Pathology** — diabetic retinopathy, glaucoma affect iris too.

## Alternative iris algorithms

* **Wildes 1997** — Hough transform for localization, multi-scale matching.
* **Boles-Boashash 1998** — zero-crossings of wavelet representations.
* **Ma et al. 2004** — texture-based local binary patterns.
* **Modern DL** — CNN-based iris embeddings (used in some commercial systems but Daugman still dominant).

## Co dělá Daugman tak dobrý

* **Mathematical rigor** — clean formulation, statistical analysis backed by empirical evidence.
* **Robustness** — phase-based encoding insensitive to noise.
* **Speed** — single template comparison v *mikrosekundách*.
* **Scalability** — billions of comparisons feasible.
* **Decades of validation** — extensive deployment without false matches.

---

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání podle duhovky a sítnice (Drahanský, Semerád). Externí reference: Daugman, J.: *High Confidence Visual Recognition of Persons by a Test of Statistical Independence* (IEEE PAMI 1993); Daugman, J.: *How Iris Recognition Works* (IEEE T-CSVT 2004) — [PDF](https://www.cl.cam.ac.uk/~jgd1000/csvt.pdf); Daugman, J.: *Probing the Uniqueness and Randomness of IrisCodes* (Proc. IEEE 2006); CASIA iris database — [biometrics.idealtest.org](http://biometrics.idealtest.org/); NIST IREX — [nist.gov/programs-projects/iris-exchange-irex-overview](https://www.nist.gov/programs-projects/iris-exchange-irex-overview).*
