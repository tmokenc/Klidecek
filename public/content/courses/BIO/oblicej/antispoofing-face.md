---
title: Anti-spoofing pro obličej
---

# Anti-spoofing pro obličej

Face recognition systémy musí *rozpoznat*, zda je před senzorem *živý člověk* nebo *podvrh* — fotografie, video, maska, deepfake. Tento problém je známý jako **face anti-spoofing** nebo **liveness detection**. S rostoucí kvalitou útoků (silikonové masky, deepfakes) je antispoofing kritickou komponentou bezpečných systémů.

## Typy útoků na face recognition

::: svg "Útoky na face systémy: photo, video replay, 3D mask (paper, silicone), deepfake video, makeup/disguise."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="30" width="100" height="150" rx="6"/>
    <rect x="130" y="30" width="100" height="150" rx="6"/>
    <rect x="240" y="30" width="100" height="150" rx="6"/>
    <rect x="350" y="30" width="100" height="150" rx="6"/>
    <rect x="460" y="30" width="70" height="150" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="70" y="52">Photo</text>
    <text x="180" y="52">Video replay</text>
    <text x="290" y="52">Paper mask</text>
    <text x="400" y="52">3D silicone</text>
    <text x="495" y="52">Deepfake</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="70" y="76">printed</text>
    <text x="70" y="88">obličej</text>
    <text x="180" y="76">tablet/phone</text>
    <text x="180" y="88">replay video</text>
    <text x="290" y="76">cutout face</text>
    <text x="290" y="88">on stick</text>
    <text x="400" y="76">silicone mask</text>
    <text x="400" y="88">3D printed</text>
    <text x="495" y="76">AI synthese</text>
    <text x="495" y="88">video</text>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="70" y="112">cena: $0.50</text>
    <text x="70" y="128">obtížnost: low</text>
    <text x="70" y="144">defenze: easy</text>
    <text x="180" y="112">cena: $200</text>
    <text x="180" y="128">obtížnost: low</text>
    <text x="180" y="144">defenze: medium</text>
    <text x="290" y="112">cena: $1</text>
    <text x="290" y="128">obtížnost: low</text>
    <text x="290" y="144">defenze: easy</text>
    <text x="400" y="112">cena: $1000+</text>
    <text x="400" y="128">obtížnost: high</text>
    <text x="400" y="144">defenze: hard</text>
    <text x="495" y="112">cena: $0</text>
    <text x="495" y="128">obtížnost: medium</text>
    <text x="495" y="144">defenze: very hard</text>
  </g>
</svg>
:::

### 1. Photo attack

* Nejjednodušší — printed fotografii oběti.
* **Cost:** $0.50 (printed photo).
* **Vulnerable systems:** *všechny* 2D-only face systems.
* **Defenze:** depth sensing, IR, motion detection.

### 2. Video replay

* Tablet/phone přehrávající *video* oběti.
* **Cost:** $200 (phone) + access to video.
* **Vulnerable systems:** 2D + motion detection (video has motion).
* **Defenze:** screen reflection detection, depth sensing.

### 3. Paper mask (cutout)

* Vyříznutá fotografie obličeje na hůlce.
* **Cost:** $1.
* **Cíl:** simulate motion (when held in hand).
* **Defenze:** depth sensing.

### 4. 3D silicone mask

* Profesionální silikonová maska s realistickými texture, color, hair.
* **Cost:** $500–$5000.
* **Cíl:** simulate 3D structure of real face.
* **Vulnerable systems:** *většina* 3D depth systems including Apple Face ID (demo by [Bkav 2017](https://www.bkav.com/about-us/bkav-news/-/journal_content/56/22600/face-id-on-iphone-x-fooled-by-bkavs-mask?ref=https://www.bkav.com/about-us/bkav-news)).
* **Defenze:** *liveness* via blood flow, micro-expressions.

### 5. Deepfake video

* AI-generated synthetic video oběti.
* **Cost:** $0 (open-source tools).
* **Cíl:** real-time face swap.
* **Defenze:** specialized deepfake detectors ([[deepfakes]]).

### 6. Makeup / disguise

* Heavy makeup, prosthetics, glasses, beard.
* **Cost:** variable.
* **Cíl:** *evasion* (avoid recognition), ne impersonation.
* **Defenze:** robust embeddings, periodic re-enrollment.

## Anti-spoofing techniques

### Liveness detection — passive

Detection bez user interaction:

* **Texture analysis** — printed photos have *different* texture (LBP, moiré patterns).
* **Color analysis** — printer color gamut differs from real skin.
* **Motion analysis** — natural micro-movements (breathing, blink).
* **Reflection patterns** — skin reflects differently than paper/screen.
* **Depth sensing** — 2D vs. 3D structure.
* **IR sensing** — skin reflects IR; photo doesn't.

### Liveness detection — challenge-response

Active prompting user:

* **Blink detection** — "blink twice".
* **Head turn** — "turn left, then right".
* **Smile** — "please smile".
* **Read random text** — speech + face sync.
* **Random color flash** — user's face illuminates with random colors; check natural response.

### Multimodal sensing

Kombinace:

* **Depth** (3D structure) + **IR** (skin reflection) + **Visible** (color/texture).
* **Apple Face ID** používá *all three*.
* Difficult to spoof *všechny* modality simultaneously.

### Deep learning-based detection

* CNN trained on *real* vs. *spoofed* face images.
* **Architecture:** ResNet, EfficientNet, or specialized like *Patchnet*.
* **Datasets:** OULU-NPU, ROSE-Youtu, Replay-Attack.
* **Cross-dataset generalization** je *velký problém* — model trained on one dataset failuje on novel attacks.

## Standardy

### ISO/IEC 30107 — Presentation Attack Detection (PAD)

* **Part 1:** framework + terminology.
* **Part 2:** data formats.
* **Part 3:** testing methodology.

**Klíčové metriky:**

* **APCER** (Attack Presentation Classification Error Rate) — % spoofs accepted as real.
* **BPCER** (Bona Fide Presentation Classification Error Rate) — % real users rejected as spoof.

Cíl: minimize obě (typically APCER < 1 %, BPCER < 5 %).

### iBeta testing

[iBeta Quality Assurance](https://www.ibeta.com/) — accredited lab testing for face liveness:

* **Level 1** — basic photo/video attacks.
* **Level 2** — 3D masks, silicone, makeup.
* **Level 3+** — advanced (state-actor level).

Apple Face ID certified iBeta Level 2.

## Konkrétní implementace

### Apple Face ID (2017+)

* **TrueDepth camera** captures 30 000+ IR dots.
* **Attention detection** — vyžaduje *user looking at camera*.
* **Eye tracking** — detection.
* **Neural network** trained on >1B images of *real* a *fake* faces.
* **iBeta Level 2** certified.

Notable bypass: Bkav (2017) silikonová maska prošla; Apple opravil firmware update.

### Windows Hello

* **NIR camera** + IR illumination.
* **Liveness** via 3D depth + eye blink.
* Microsoft requires *Hello Enhanced Anti-Spoofing* compliance for "Windows Hello Plus" certification.

### Bank of America (mobile)

* Face liveness for transaction authorization.
* Active challenge (head movement).
* Backend ML-based detection.

### Smile to Pay (Alibaba)

* China — payment via face scan.
* Liveness check (smile, blink).
* Backed by Alibaba massive deep learning models.

## Slavné spoofing případy

### iPhone X bypass (2017)

[Bkav](https://www.youtube.com/watch?v=i4YQRLQVixM) demonstroval, že *handmade* silikonová maska s 2D printed eyes obejde Face ID.

* **Cost:** $150.
* **Effort:** 9 hodin.
* Apple opraveno firmware update (improved liveness checking).

### Galaxy S10 bypass (2019)

* Ultrasonic fingerprint sensor.
* **Pencil rubber + silicone** spoof — demonstrated by Imgur user *darkshark9*.
* Samsung firmware update.

### Wells Fargo eyeprint (2017)

* Wells Fargo banking app used iris-like eye scan.
* **Photo of eyes** + close-up macro lens → bypass.
* Removed from production.

## Best practices pro nasazení

1. **Multimodal sensing** — *vždy* víc než jen visible camera.
2. **Active liveness** — challenge-response.
3. **Server-side validation** — never trust client-only liveness.
4. **Periodic certification** (iBeta Level 2+).
5. **Adversarial training** — train detector na *novel* spoofing techniques.
6. **Continuous updates** — new spoofing methods emerge regularly.
7. **Multi-factor** — combine biometrics with PIN/password.
8. **Risk-based authentication** — extra verification for high-value transactions.

## Otevřené problémy

* **Cross-dataset generalization** — detectors trained on one attack type fail on others.
* **Real-time efficiency** — DL detectors are computationally heavy.
* **Adversarial robustness** — sophisticated adversarial examples bypass detection.
* **Deepfake detection** — arms race, deepfakes improving faster than detectors.
* **User experience** — too many challenges frustrate users.

---

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání obličeje. Externí reference: ISO/IEC 30107-3:2023 *Information technology — Biometric presentation attack detection — Part 3: Testing and reporting*; Liu, Y., Jourabloo, A., Liu, X.: *Learning Deep Models for Face Anti-Spoofing: Binary or Auxiliary Supervision* (CVPR 2018); Yu, Z. et al.: *Deep Learning for Face Anti-Spoofing: A Survey* (IEEE PAMI 2022); iBeta PAD testing — [ibeta.com](https://www.ibeta.com/).*
