---
title: Typy útoků na biometrické systémy
---

# Typy útoků na biometrické systémy

Biometric systémy jsou *complex stacks* od senzorů přes databáze po decision algorithms. Každá vrstva má vlastní attack surface. Ratha-Connell-Bolle 2001 definovali kanonickou taxonomii — 7 typů útoků, které pokrývají *všechny* hlavní vektory.

## 7 typů útoků (Ratha-Connell-Bolle 2001)

::: viz attack-points-7 "Klikněte na bod 1–7 v diagramu; vidíte konkrétní příklady útoků a vrstvenou obranu."
:::

::: svg "Útočné body biometrického systému: 1 sensor, 2 channel reader→processor, 3 feature extractor, 4 channel extractor→matcher, 5 stored templates, 6 matcher, 7 decision output."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aTA1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--danger, #d33)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="10" y="80" width="80" height="40" rx="4"/>
    <rect x="120" y="80" width="100" height="40" rx="4"/>
    <rect x="250" y="80" width="80" height="40" rx="4"/>
    <rect x="360" y="80" width="80" height="40" rx="4"/>
    <rect x="470" y="80" width="60" height="40" rx="4"/>
    <rect x="240" y="170" width="100" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="50" y="104">Sensor</text>
    <text x="170" y="104">Feat. extractor</text>
    <text x="290" y="104">Matcher</text>
    <text x="400" y="104">Decision</text>
    <text x="500" y="104">Output</text>
    <text x="290" y="195">Template DB</text>
  </g>
  <g fill="var(--danger, #d33)" font-weight="bold" font-size="11">
    <text x="50" y="65" text-anchor="middle">1</text>
    <text x="105" y="65" text-anchor="middle">2</text>
    <text x="170" y="65" text-anchor="middle">3</text>
    <text x="235" y="65" text-anchor="middle">4</text>
    <text x="290" y="65" text-anchor="middle">6</text>
    <text x="400" y="65" text-anchor="middle">7</text>
    <text x="350" y="165" text-anchor="middle">5</text>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="1.2" fill="none" marker-end="url(#aTA1)" stroke-dasharray="2 2">
    <path d="M50,72 L50,78"/>
    <path d="M105,72 L105,80"/>
    <path d="M170,72 L170,78"/>
    <path d="M235,72 L235,80"/>
    <path d="M290,72 L290,78"/>
    <path d="M400,72 L400,78"/>
    <path d="M350,170 L340,170"/>
  </g>
  <g stroke="var(--accent)" stroke-width="0.8" fill="none" stroke-dasharray="3 2">
    <line x1="290" y1="120" x2="290" y2="170"/>
  </g>
</svg>
:::

### 1. Sensor spoofing (presentation attack)

Útočník prezentuje *podvržený* biometric trait sensoru.

* **Fake fingerprint** — silicone, gelatin, paper (Matsumoto gummy bear attack 2002).
* **Face photo / video** — printed photo, screen replay.
* **3D mask** — silicone reconstruction (Bkav vs. Face ID 2017).
* **Iris contact lens** — patterned.
* **Voice recording** — pre-recorded audio.
* **Synthetic voice** — AI-generated.
* **Deepfake video** — real-time face swap.

Defenze: **Liveness detection** ([[liveness]]), **multimodal**, **challenge-response**.

### 2. Replay attack (channel 1)

Útočník **odposlechne** komunikaci mezi sensor a feature extractor a *přehraje* zachycená data.

* **Wired channel** — intercept USB cable.
* **Wireless channel** — sniff RF (NFC, WiFi).
* **Network channel** — between client and server.

Defenze:
* **Encryption** of sensor-to-processor channel.
* **Mutual authentication** (TLS, secure messaging).
* **Nonce-based** anti-replay.

### 3. Feature extractor compromise

Útočník **nahradí** feature extractor module (e.g., installs malware).

* Output: *whatever features* attacker chooses.
* Bypass biometric check entirely.

Defenze:
* **Code signing** of biometric modules.
* **Secure Boot** + Trusted Execution Environment (TEE).
* **Application allowlisting**.

### 4. Replay attack (channel 4)

Mezi feature extractor a matcher — analogous to 2.

Defenze: similar (encryption, nonces).

### 5. Template database attack

Útok na *uložené* biometric templates.

#### Steal templates

* Dump from compromised database.
* **Use for cross-matching** — link people across systems.
* **Identity theft** — generate fake biometrics from templates (rare but possible).

#### Modify templates

* Replace legitimate user template with attacker's.
* **Bypass authentication** — attacker's biometric matches.

#### Hashed/encrypted templates

* Even if encrypted, *similarity-preserving* (templates can match each other when encrypted).
* **Cancelable biometrics** — transformed templates that *can be revoked*.

Defenze:
* **Strong access control.**
* **Encryption at rest.**
* **Cancelable biometrics.**
* **Homomorphic encryption** (research).

### 6. Matcher override

Útočník modifikuje matcher to always return "match" or "no match".

Defenze:
* Code signing.
* Tamper-resistant hardware (HSM, smart card).

### 7. Decision modification

Útočník flips the final decision bit (accept/reject).

Defenze:
* Secure communication of decision.
* MAC over decision message.
* Multi-stage authentication (one bit cannot bypass).

## Dvě hlavní kategorie útoků

### Presentation attacks (PA, also called "spoofing")

* **At the sensor** — fake biometric presented physically.
* Standardized: **ISO/IEC 30107** — Presentation Attack Detection (PAD).

### Indirect attacks

* **Behind the sensor** — channels, modules, databases.
* Subject of standard IT security (encryption, access control, secure code).

## Typy presentation attacks (PAIs)

### Artifact-based

* Created from *materials* — paper photo, silicone mask, gummy finger.
* **Cost:** $0–$1000 depending on quality.

### Biometric template-based

* Mathematical reconstruction from stolen template.
* Example: **face image** generated from leaked face embedding.
* Difficult but possible (GAN-based).

### Synthetic / generated

* **Deepfakes** for face.
* **Voice synthesis** for voice biometric.
* **Generative AI** producing fake biometric data.

### Live but presented

* **Coercion** — legitimate user forced to authenticate.
* **Dead body** — extreme case (corpse fingerprints).
* **Sleeping user** — phone unlock from sleeping victim.

### Other body part of legitimate user

* **Different finger** than enrolled.
* **Picture of own face** in selfie mode.

## Specifické útoky pro různé modality

### Fingerprint

* **Latent print lifting** — recover from glasses, doorknobs.
* **3D printed** false finger.
* **Gummy bear** spoof.
* **Adhesive tape** lifting.

### Face

* **Photo printout.**
* **Video replay** on screen.
* **3D mask.**
* **Makeup, glasses, wigs** (evasion).
* **Adversarial patches** (printed glasses that fool DL).
* **Deepfake video.**

### Iris

* **Printed iris on contact lens.**
* **High-resolution iris photo** (presented to camera).
* **Real iris from another person** (extreme).

### Voice

* **Pre-recorded audio.**
* **Voice synthesis (TTS).**
* **Voice conversion** (real-time clone).

### DNA

* **Sample contamination** at crime scene.
* **Plant DNA evidence.**
* **Mixed sample interpretation issues.**

## Měření robustnosti

### ISO/IEC 30107 metriky

* **APCER** (Attack Presentation Classification Error Rate) — % spoofs accepted as real.
* **BPCER** (Bona Fide Presentation Classification Error Rate) — % real users rejected as spoofs.

Cíle (pro Level 2):
* APCER < 1 %.
* BPCER < 5 %.

### iBeta testing

* Independent lab testing.
* **Level 1:** basic spoofs (photo, video).
* **Level 2:** 3D masks, silicone.
* **Level 3+:** state-level adversary.

Apple Face ID, Windows Hello certify Level 2.

## Praktické útoky 2010-2025

| Year | Útok | Modality | Cíl |
| :--- | :--- | :--- | :--- |
| 2002 | Gummy bear (Matsumoto) | fingerprint | Capacitive sensors |
| 2013 | CCC chaos club | iPhone 5s Touch ID | bypassed in days |
| 2017 | Bkav 3D mask | iPhone X Face ID | bypassed by silicone mask |
| 2019 | Samsung S10 ultrasonic | fingerprint | bypassed by pencil rubber |
| 2020 | Various BLE relay | smart locks | Tesla, Ford, BMW |
| 2022 | NCC Tesla relay | BLE PaaK | Model 3 unlocked from 25m |
| 2023 | TPM-Fail variants | TPM 2.0 | ECDSA key recovery |
| 2024 | Deepfake banking | Face biometric | mobile banking bypass |

## Defense in depth

> Žádná *jedna* defenze není dostatečná. Kombinace:

1. **Liveness detection** ([[liveness]]).
2. **Multimodal biometrics**.
3. **Challenge-response** (active liveness).
4. **Continuous authentication** (not just at start).
5. **Multi-factor** (biometric + PIN + token).
6. **Risk-based authentication** — extra checks for high-value.
7. **Anomaly detection** — unusual access patterns.
8. **Audit logging.**

## Recommended reading

* **NIST IR 8472** — Biometric Spoofing/PAD Standards Update.
* **ISO/IEC 30107-3** — PAD Testing.
* **ASVspoof Challenge** — voice anti-spoofing.
* **Liveness Detection Competitions** — fingerprint, face.

---

*Zdroj: BIO přednášky 2025/26, BIO 13 — Biometrické systémy v praxi. Externí reference: Ratha, N. K., Connell, J. H., Bolle, R. M.: *Enhancing security and privacy in biometrics-based authentication systems* (IBM Systems Journal 2001) — [PDF](https://www.research.ibm.com/people/n/njratha/IBMSJ40-3.pdf); ISO/IEC 30107-3:2023 *Information technology — Biometric presentation attack detection — Part 3: Testing and reporting*; Matsumoto, T. et al.: *Impact of Artificial "Gummy" Fingers on Fingerprint Systems* (SPIE 2002).*
