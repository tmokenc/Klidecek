---
title: Deepfakes a biometric systems
---

# Deepfakes a biometric systems

**Deepfakes** jsou AI-generated synthetic media — *fake videos*, *fake voices*, *fake images* lidí. Pojmenováno po Reddit user "deepfakes" (2017). Modern deepfake quality (2024+) je *extremely* dobrá — *prakticky nerozeznatelná* od reality v některých scénářích. Pro biometric systems představují *fundamental challenge*.

## Co jsou deepfakes

* **Face swap** — replace face in video with target face.
* **Face reenactment** — control facial expressions of target.
* **Voice cloning** — synthesize speech in target voice.
* **Full body** — synthesize full person performing actions.
* **Text-to-video** — generate video from text description (Sora, Veo).

## Technologie

::: svg "Deepfake creation pipeline: source video + target identity → AI model (GAN, diffusion) → synthetic output."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aDF" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="20" y="40" width="100" height="40" rx="4"/>
    <rect x="20" y="100" width="100" height="40" rx="4"/>
    <rect x="200" y="70" width="140" height="40" rx="4"/>
    <rect x="380" y="70" width="140" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70" y="64" font-size="11">Source video</text>
    <text x="70" y="76" font-size="9" fill="var(--text-muted)">person A</text>
    <text x="70" y="124" font-size="11">Target identity</text>
    <text x="70" y="136" font-size="9" fill="var(--text-muted)">person B</text>
    <text x="270" y="92" font-size="11">AI model</text>
    <text x="270" y="106" font-size="9" fill="var(--text-muted)">GAN, diffusion, autoencoder</text>
    <text x="450" y="92" font-size="11">Deepfake</text>
    <text x="450" y="106" font-size="9" fill="var(--text-muted)">person B saying/doing A</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aDF)">
    <path d="M120,60 L198,84"/>
    <path d="M120,120 L198,96"/>
    <path d="M340,90 L378,90"/>
  </g>
</svg>
:::

### GAN-based

* **Generator** + **Discriminator** networks.
* Generator tries to fool Discriminator.
* Iterative training → high-quality outputs.
* **StyleGAN** (NVIDIA 2018, refined to StyleGAN3 2021) — *de facto* standard for face generation.

### Diffusion models

* **DDPM** (Denoising Diffusion Probabilistic Models).
* Stable Diffusion, Midjourney, DALL-E 3, Sora.
* Generate from noise via gradual denoising.
* **Higher quality** než GANs in many tasks.

### Autoencoder-based

* **Encoder** maps face to latent space.
* **Decoder** generates face from latent.
* Swap encoders/decoders for face swap.
* Used in DeepFaceLab (popular open-source tool).

### Voice synthesis

* **WaveNet, Tacotron** — early TTS.
* **VALL-E, ElevenLabs** — voice cloning from seconds of audio.
* **Real-time conversion** — change voice live.

## Tools

* **DeepFaceLab** — open-source, popular for face swaps.
* **FaceSwap** — open-source.
* **Reface** — mobile app, casual deepfakes.
* **D-ID** — commercial AI avatar service.
* **ElevenLabs** — voice cloning.
* **Synthesia** — corporate AI presenters.
* **HeyGen** — AI video generation.
* **Stable Diffusion** — image generation (with face plugins).

## Útoky na biometric systems

### Face recognition bypass

* **Photo printout** — pre-deepfake era.
* **Deepfake video** — replay or live.
* **3D mask** generated from deepfake images.

### Voice biometrics bypass

* **Pre-recorded voice clone** — replay attack.
* **Real-time voice clone** — bypass conversational systems.
* **Phone banking attacks** documented in 2023+.

### Documents fraud

* **Photo of fake ID** — generated photo on real ID template.
* **AI-generated selfies** for KYC (Know Your Customer) verification.

## Reálné případy

### CEO fraud (2019)

* **UK energy firm** lost €220 000.
* **Voice clone** of CEO instructed wire transfer.
* Among first reported cases of AI voice fraud.

### Hong Kong company (2024)

* **Multi-person video call** all *deepfake* except victim.
* Victim transferred $25M.
* Sophisticated, well-prepared attack.

### Political disinformation

* **Zelenskyy deepfake** (March 2022) — fake video calling for surrender.
* **Putin deepfake** (March 2023) — fake martial law announcement.
* **2024 US elections** — multiple deepfakes circulating.

### Pornography (deepfake porn)

* **~96% of deepfakes** are non-consensual pornography (most affecting women).
* **Taylor Swift case** (2024) — viral on X/Twitter.
* **Multiple countries** criminalizing.

## Detection — arms race

### Visual artifacts

* **Inconsistent lighting** between face and background.
* **Unusual eye blinking** (early deepfakes blinked rarely).
* **Face boundary artifacts** — fuzzy edges where face meets head.
* **Lip-sync errors** — audio doesn't match mouth shape.
* **Background inconsistencies**.

### Modern detection

* **CNN-based detectors** trained on real + fake datasets.
* **Frequency domain** analysis (FFT shows different patterns).
* **Biological signals** — rPPG (remote photoplethysmography) detects heart rate from face video; deepfakes can't fake.
* **Eye movements** — natural saccades hard to replicate.
* **Watermarking** — proposed: embed *invisible* watermarks in real content.

::: viz deepfake-detection "Per-frame confidence napříč signálovými kanály (blink, lip-sync, rPPG, freq); cross-domain útok generalization gap demonstruje."
:::

### Detection accuracy

* **In-domain:** >95 % (on training-similar deepfakes).
* **Cross-domain:** drops to 60–80 % (novel attacks).
* **Adversarial deepfakes** — generated specifically to evade detection.

## Anti-deepfake techniques

### C2PA (Coalition for Content Provenance and Authenticity)

* **Industry standard** for content authentication.
* **Cryptographic signatures** on real content (cameras, editors).
* **Provenance metadata** travels with content.
* Supported by: Microsoft, Adobe, Sony, Canon, BBC, NYTimes.
* **Goal:** authenticate *real* content, not detect *fake*.

### Watermarking

* **Imperceptible signals** in real content.
* Verifies authenticity at *creation*.
* Limits: deepfake creation strips watermarks.

### Liveness with deepfake awareness

* **Real-time challenge** (head movement, blinking).
* Hard for current deepfakes to do *naturally* under time pressure.
* Will improve as deepfakes get better.

### Multi-channel biometrics

* **Face + voice + behavior** — deepfake one harder than all.
* **Anti-spoofing for each modality.**

## Legal frameworks

### EU AI Act (2024)

* **Deepfakes must be labeled** when not for legitimate purpose.
* Penalties for non-compliance.

### US — patchwork

* **Federal:** no comprehensive law.
* **State laws:** California (deepfake porn), Texas (election deepfakes), etc.
* **NO-FAKES Act** (proposed 2024) — federal protection.

### China (2023)

* **Deep Synthesis Provisions** — comprehensive deepfake regulation.
* Labels required, criminal penalties.

### Czech / EU

* **GDPR** — biometric/personal data protections apply.
* **EU AI Act** — applies in CZ.
* **Specific deepfake laws** evolving.

## Biometric system response

### Defense in depth

1. **Liveness detection** ([[liveness]]) with deepfake awareness.
2. **Multi-modal** biometrics (harder to fake all).
3. **Multi-factor** authentication.
4. **Behavioral biometrics** — continuous, hard to deepfake.
5. **Risk-based** — extra checks for sensitive transactions.

### Specific recommendations

* **Don't rely on face/voice alone** for high-value transactions.
* **Out-of-band verification** for unusual requests.
* **AI assist for human reviewers** — but human-in-the-loop.
* **Audit logging** — detect anomalies.

## Industry response

### Tech companies

* **Microsoft Video Authenticator** — confidence score per video.
* **Adobe Content Authenticity** — provenance tool.
* **Meta** investing in detection + watermarking.

### Banks

* **Liveness 2.0** vendors (Onfido, Jumio, iProov, Veriff) updating against deepfakes.
* **Behavioral biometrics** layered.
* **Out-of-band** verification for new accounts.

### Border control

* **eGates** with liveness + multi-modal.
* **Physical inspection** still required for verification.

## Trends 2025+

* **Real-time deepfakes** widely available (consumer apps).
* **Sora-like video generation** democratizing.
* **Voice cloning** with seconds of audio.
* **Detection getting better** but never wins permanently.
* **Provenance-based** approaches (C2PA) gaining traction.
* **Regulation** catching up.

## Klíčové ponaučení

> Biometrické systémy *musí* aktivně bránit proti deepfakes. *Single-modal* face nebo voice authentication je *zranitelná* a měla by být *doplněna* dalšími faktory pro vysokohodnotné aplikace.

Praktický postup:

1. **Pro low-value applications** (smartphone unlock) — biometric + liveness OK.
2. **Pro medium-value** (bank login) — biometric + PIN + behavioral.
3. **Pro high-value** (large transactions) — out-of-band confirmation + biometric.
4. **Pro critical** (state secrets) — physical presence + multi-factor.

---

*Zdroj: BIO přednášky 2025/26, BIO 13 — Biometrické systémy v praxi. Externí reference: Mirsky, Y., Lee, W.: *The Creation and Detection of Deepfakes: A Survey* (ACM Computing Surveys 2021); C2PA — [c2pa.org](https://c2pa.org/); Verdoliva, L.: *Media Forensics and DeepFakes: an overview* (IEEE J-STSP 2020); EU AI Act — Regulation 2024/1689; DeepFaceLab — [github.com/iperov/DeepFaceLab](https://github.com/iperov/DeepFaceLab).*
