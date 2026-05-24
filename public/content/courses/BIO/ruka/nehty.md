---
title: Nehty jako biometrika
---

# Nehty jako biometrika

**Nail biometrics** je novější a zatím *experimentální* modalita — *unikátní vzory na ploše nehtu*. Studie ([Garg et al. 2017, *Nail-Plate Biometrics*](https://link.springer.com/article/10.1007/s12517-017-3151-5)) ukazují, že nehty mají *individuální* texturní vzor analogický (i když méně bohatý) k otisku prstu. Praktické nasazení omezené, ale rostoucí research interest.

## Anatomie nehtu

::: svg "Anatomie nehtu: nail plate (vyleštěná tvrdá vrstva), nail bed (růžové podloží), lunula (bílý půlměsíc), cuticle (kůžička)."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="rgba(220,180,160,0.6)" stroke="var(--accent)" stroke-width="1.5">
    <path d="M180,60 Q190,40 270,40 Q350,40 360,60 L360,180 Q350,200 270,200 Q190,200 180,180 Z"/>
  </g>
  <g fill="rgba(255,240,230,0.8)" stroke="var(--accent)" stroke-width="1.2">
    <path d="M200,80 Q210,60 270,60 Q330,60 340,80 L340,170 Q330,185 270,185 Q210,185 200,170 Z"/>
  </g>
  <g fill="rgba(255,255,255,0.7)" stroke="var(--accent)" stroke-width="0.8">
    <ellipse cx="270" cy="80" rx="40" ry="8"/>
  </g>
  <g fill="rgba(180,120,100,0.4)" stroke="var(--accent)" stroke-width="0.8">
    <path d="M180,60 Q190,40 270,40 Q350,40 360,60 L355,70 L185,70 Z"/>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10.5">
    <text x="380" y="60">cuticle (kůžička)</text>
    <text x="380" y="90">lunula (půlměsíc)</text>
    <text x="380" y="130">nail plate</text>
    <text x="380" y="155">nail bed (pod)</text>
  </g>
  <g stroke="var(--text-muted)" stroke-width="0.7" fill="none">
    <path d="M375,60 L350,52"/>
    <path d="M375,85 L290,82"/>
    <path d="M375,128 L290,120"/>
    <path d="M375,155 L290,158"/>
  </g>
</svg>
:::

* **Nail plate** — tvrdá vrstva keratinu, viditelná část.
* **Nail bed** — měkká *růžová* tkáň pod nail plate.
* **Lunula** — bílý *půlměsíc* u kořene nehtu (nejmladší keratin).
* **Cuticle / eponychium** — kůžička překrývající kořen.
* **Free edge** — volný okraj nehtu (přesahuje prst).

## Biometrické rysy

### Surface patterns

Nail plate má *jemné textury*:

* **Longitudinal ridges** — paralelní *jemné rýhy* od kořene k volnému okraji.
* **Transverse striations** (Beau's lines) — *horizontální* rýhy po nemoci nebo stresu.
* **White spots** (leukonychia) — bílé skvrny od trauma.
* **Pigmented streaks** — tmavé pruhy (melanonychia).

### Color a translucency

* Underlying nail bed je *růžová* (krev v capillaries).
* Lunula je *bílá* (immature keratin).
* Distal edge je *bílá* (žádné připojení k nail bed).

### Shape

* **Length / width ratio**.
* **Curvature** (transverse, longitudinal).
* Genetic + age + occupation-related variations.

### Composition (skinning)

* **Keratin** je primary component.
* **Sulfur** (cysteine) — disulfide bonds.
* **Trace minerals** — Zn, Ca, Fe.

## Snímání

### Optical photography

* RGB camera + uniform illumination.
* Macro mode for high detail.
* Resolution: 1000+ dpi for surface patterns.

### Microscopic imaging

* Microscope-based capture.
* Higher detail, but slow.

### Hyperspectral

* Capture *multiple wavelengths*.
* Visible + NIR.
* Reveals subsurface details (nail bed structure).

### 3D scanning

* Capture *curvature* + texture.
* More information than 2D.

## Algoritmy

### Texture-based

* Extract *texture features*:
  * **Local Binary Patterns (LBP)** — texture descriptor.
  * **Gabor filter responses** — directional texture.
  * **GLCM** (Gray-Level Co-occurrence Matrix).
* Feature vector → SVM / k-NN classifier.

### Deep learning

* CNN trained on nail images.
* Embedding-based matching.
* Limited datasets, experimental.

### Multimodal fusion

* **Nail + fingerprint** — both from same finger.
* **Nail + hand geometry** — complementary.

## Vlastnosti

### Stálost

* Surface patterns *change* with growth (full nail replacement ~6 měsíců).
* Underlying *texture characteristics* relatively stable.
* Trauma → temporary changes (Beau's lines, leukonychia).

### Unikátnost

* Studies suggest *moderate* uniqueness.
* Identical twins have *correlated* nail patterns (similar genetics + diet).
* *Not* as unique as fingerprint or iris.

### Snímání issue

* **Polish** (nail polish) — zakryje surface patterns.
* **Artificial nails** — překryjí natural patterns.
* **Damage** (broken nails) — temporary failure.

## Praktické nasazení

### Současný stav

* **Experimentální** — žádné mass-market produkty.
* **Research interest** — alternative biometric pro context, kde fingerprint není available.

### Medical applications

* **Onychomycosis** (fungal infection) detection.
* **Anemia, liver disease, kidney disease** — nail color/shape changes.
* AI-based diagnosis from nail images.

### Forensic value

* **DNA from nails** — keratin contains DNA (touch DNA from cells).
* **Trace evidence** — nail clippings v criminal investigations.
* *Distinct* from biometric nail recognition.

## Trends

* **Smartphone-based** nail capture for research datasets.
* **DL-based** more sophisticated features.
* **Multimodal** with fingerprint, palmprint.
* **Health monitoring** combined (e.g., anemia detection from smartphone nail photos).

## Limity

* **Low industry adoption** — fingerprint better-established.
* **Lower accuracy** než fingerprint.
* **Hygiene concerns** — touching senzor (alternative: touchless).
* **Cultural** — některé regions consider nails private / not for biometric capture.

## Standardy

* **Žádné** ISO/IEC standards pro nail biometrics (k roku 2025).
* Research-level only.

## Vztah k jiným biometrikám

| | **Nail** | **Fingerprint** | **Palm geometry** |
| :--- | :---: | :---: | :---: |
| Unique | medium | high | low |
| Stable | medium | high | medium |
| User-friendly | high | medium | high |
| Cost | low | low-medium | medium |
| Adoption | rare | universal | niche |
| Spoofing risk | medium | medium | low |

Nail biometrics zatím **nejsou primary modality**, ale mají roli ve **multimodal fusion** + medical-biometric hybrids.

---

*Zdroj: BIO přednášky 2025/26, BIO — Identifikátory ruky (Rydlo). Externí reference: Garg, R. K. et al.: *Nail-plate biometrics: A new approach* (Arabian Journal of Geosciences 2017); Bagchi, S. et al.: *Personal Identification using Nailbed Patterns* (Conference papers); Wikipedia: *Nail (anatomy)* — [link](https://en.wikipedia.org/wiki/Nail_(anatomy)).*
