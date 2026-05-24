---
title: Liveness detection
---

# Liveness detection

**Liveness detection** (detekce *živosti*) ověřuje, zda je před senzorem *živý člověk*, ne *podvrh* (photo, mask, recording, prosthetic). Je *kritickou* komponentou bezpečných biometric systémů — bez liveness check je *většina* biometrik *trivially* spoofable.

## Princip

Liveness detection se snaží detekovat *signs of life*:

* **Physiological** — heartbeat, blood flow, pupillary reflexes, skin temperature.
* **Behavioral** — micro-expressions, blinking, head movements, voice naturalness.
* **Anatomical** — 3D structure, internal anatomy (subdermal).
* **Behavioral response** — reacts to stimuli (light, sound, instructions).

## Pasivní vs. aktivní liveness

### Pasivní liveness

* **Detection happens automatically** — no user action needed.
* **Smooth UX** — user doesn't know about liveness check.
* **Algorithm analyzes** captured sample for liveness clues.

Examples:
* Texture analysis of fingerprint (smooth gummy bear vs. natural skin).
* 3D depth analysis of face.
* Spectral analysis for voice (recording vs. live).

### Aktivní liveness (challenge-response)

* **User performs action** triggered by system.
* **Random challenges** prevent pre-recording.
* **Slightly worse UX** but stronger security.

Examples:
* **Face:** "blink twice", "turn head left", "smile".
* **Voice:** "read this random phrase".
* **Fingerprint:** "press lightly, then firmly".

## Liveness pro fingerprint

### Anti-spoofing techniques

* **Skin elasticity** — gummy bear is more rigid than skin.
* **Sweat pores** — natural skin has pores, fakes often don't.
* **Pulse oximetry** — blood oxygenation in capillaries (Apple Touch ID, in some variants).
* **Sub-dermal patterns** — ultrasonic sensors detect deeper layers.
* **Temperature** — natural skin ~33°C.
* **Conductivity** — galvanic skin response.

### Modern implementations

* **Apple Touch ID** — capacitive + sub-dermal pattern detection.
* **Samsung Ultrasonic** — 3D ridge structure.
* **HID Lumidigm** — multispectral imaging.

### Effective spoofing materials

* **Old:** gelatin, gummy bear, latex.
* **Modern:** silicone with conductive coating.
* Detection rate ~95–99 % for modern sensors against common spoofs.

## Liveness pro obličej

### Pasivní

* **Texture analysis** — printed photos have *different* texture from skin.
* **Moire patterns** — visible when screen replayed.
* **Color analysis** — printer color gamut limited.
* **Sharpness analysis** — photos lack micro-detail of skin.
* **3D depth** — flat photos vs. 3D face.
* **IR sensing** — skin reflects/absorbs IR specifically.
* **Pulse extraction** — remote photoplethysmography (rPPG) detects heartbeat from face video.

### Aktivní

* **Blink challenge** — "blink twice".
* **Head movement** — "turn left, then right".
* **Smile challenge** — "smile then return to neutral".
* **Read random text** — speech + face sync.
* **Random color flash** — face illuminates differently for screen vs. real skin.
* **Eye gaze tracking** — "look at the dot".

### Multi-modal liveness

* **3D depth (structured light)** + **IR** + **Visible** + **Eye gaze**.
* Used by **Apple Face ID**.

### Deep learning liveness

* CNN trained on spoof + real face datasets.
* **Datasets:** OULU-NPU, ROSE-Youtu, CASIA-MFSD.
* **Challenge:** cross-dataset generalization.

## Liveness pro iris

### Pasivní

* **Pupillary reflex** — pupil dynamics over time (natural movement).
* **Spectral analysis** — natural iris has different spectrum than printed/contact lens.
* **3D shape** — concave iris vs. flat photo.

### Aktivní

* **Light response** — flash light, observe pupil constriction.
* **Random gaze direction** — "look up, then down".

### Specific issues

* **Patterned contact lenses** — designed to look like iris.
* **Spectral imaging** can distinguish.

## Liveness pro voice

### Pasivní

* **Speech naturalness** — pre-recorded audio has artifacts (compression, room reverb).
* **Codec analysis** — recorded → encoded → played has different spectrum.
* **Microphone characteristics** — playback through speaker vs. direct speech.

### Aktivní

* **Random phrase** — "say 'green elephant 47'".
* **Conversation** — natural Q&A.
* **Whisper challenge** — natural variation harder to fake.

### ASVspoof

[ASVspoof Challenge](https://www.asvspoof.org/) biennial:

* **Logical access (LA)** — synthesized speech detection.
* **Physical access (PA)** — replay detection.
* **Datasets, baselines, leaderboards.**

## Liveness pro vein biometrics

* **Pulsatile blood flow** — natural variation in vein contrast.
* **Body temperature** — IR sensing.
* **NIR response** — fake hands lack hemoglobin absorption.

## Standardy

### ISO/IEC 30107

* **Part 1** — framework + terminology.
* **Part 2** — data formats.
* **Part 3** — testing methodology.

::: viz liveness-pad-tradeoff "Threshold a attack mix mění APCER vs BPCER; iBeta Level 2 vyžaduje APCER&lt;1%, BPCER&lt;5%."
:::

### Metriky

* **APCER** (Attack Presentation Classification Error Rate) — % spoofs accepted.
* **BPCER** (Bona Fide Presentation Classification Error Rate) — % real users rejected.

Goal:
* **APCER < 1 %** (Level 2 iBeta).
* **BPCER < 5 %** (acceptable UX).

### Levels (iBeta)

* **Level 1** — basic attacks (photo, video).
* **Level 2** — sophisticated (3D mask, silicone).
* **Level 3+** — state-level.

## Spoofing competitions

### LivDet

* **Fingerprint Liveness Detection Competition** since 2009.
* Different materials, sensors.
* Best detectors: ~95 % accuracy.

### Face liveness challenges

* OULU-NPU dataset.
* CASIA-SURF.
* CelebA-Spoof.

### ASVspoof

* Voice anti-spoofing.
* Best systems: ~99 % accuracy on seen attacks.
* **Cross-dataset:** much harder.

## Limity liveness detection

### Generalization

* Detectors trained on *known* spoofs fail on *novel* attacks.
* **Adversarial training** helps but not solve.

### Arms race

* Spoofing improves → detection improves → spoofing improves.
* Continuous research investment needed.

### False positives

* Real users with **unusual conditions** (heavy makeup, after surgery) may be flagged as spoofs.
* **BPCER** must be kept low.

### Computational cost

* Liveness analysis adds latency.
* On mobile devices, efficient algorithms needed.

## Praktická doporučení

### Pro deployment

1. **Multi-modal liveness** — combine techniques.
2. **Active + passive** — both layers.
3. **Continuous learning** — update against new attack types.
4. **Certified solutions** (iBeta Level 2+).
5. **Multi-factor authentication** — biometric + PIN.
6. **Risk-based** — extra checks for high-value transactions.

### Pro developers

* Use **trusted libraries** — don't roll your own.
* **Test against known attacks**.
* **Monitor** for anomalies in production.
* **Update** regularly.

## Future trends

### AI-powered detection

* **Foundation models** for biometric liveness.
* **Adversarial robustness** as default.
* **Federated learning** for distributed training.

### Hardware advances

* **Better sensors** — multispectral, sub-dermal.
* **Specialized chips** — neural processing units for liveness.

### Continuous authentication

* **Beyond initial unlock** — ongoing liveness monitoring during session.
* **Behavioral biometrics** as continuous liveness signal.

---

*Zdroj: BIO přednášky 2025/26, BIO 13 — Biometrické systémy v praxi. Externí reference: ISO/IEC 30107-3:2023 *Information technology — Biometric presentation attack detection — Part 3: Testing and reporting*; Yu, Z. et al.: *Deep Learning for Face Anti-Spoofing: A Survey* (IEEE PAMI 2022); Marcel, S., Nixon, M. S., Fierrez, J., Evans, N. (eds.): *Handbook of Biometric Anti-Spoofing* (2nd ed., Springer 2019); LivDet Liveness Detection — [livdet.org](http://livdet.org/); ASVspoof Challenge — [asvspoof.org](https://www.asvspoof.org/).*
