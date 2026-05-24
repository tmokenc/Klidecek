---
title: Dynamika stisku kláves (keystroke dynamics)
---

# Dynamika stisku kláves (keystroke dynamics)

**Keystroke dynamics** identifikuje *osobu* podle *způsobu*, jakým píše na klávesnici — rytmus stisku kláves, timing, sequence of pauses. Patří k *passive* behaviorálním biometrikám — funguje *průběžně* během běžného typing, *bez additional* user effort. Vhodný pro **continuous authentication**.

## Princip

Lidský typing je *behavioral motor pattern*. Při psaní *stejné* věty se *stejné* osoby projevuje:

* **Dwell time** — jak dlouho je klávesa stisknuta (key press → key release).
* **Flight time** — interval mezi *release* jedné klávesy a *press* další.
* **Bigram intervals** — timing pro common letter pairs ("th", "he", "in").
* **Pressure** (na fancier keyboards) — force on each keystroke.
* **N-graph timing** — sequences of 2, 3, 4 keystrokes.

::: svg "Timing keystroke: key press → key release sekvence. Dwell = stisk, flight = mezi klávesami."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--accent)" stroke-width="2" fill="none">
    <path d="M40,130 L40,100 L80,100 L80,130 L120,130 L120,100 L160,100 L160,130 L200,130 L200,100 L260,100 L260,130 L300,130 L300,100 L340,100 L340,130 L380,130 L380,100 L460,100 L460,130 L500,130"/>
  </g>
  <g fill="rgb(64,192,87)" font-size="10" text-anchor="middle">
    <text x="60" y="92">d₁</text>
    <text x="140" y="92">d₂</text>
    <text x="230" y="92">d₃</text>
    <text x="320" y="92">d₄</text>
    <text x="420" y="92">d₅</text>
  </g>
  <g fill="var(--danger, #d33)" font-size="10" text-anchor="middle">
    <text x="100" y="148">f₁</text>
    <text x="180" y="148">f₂</text>
    <text x="280" y="148">f₃</text>
    <text x="360" y="148">f₄</text>
  </g>
  <g fill="var(--text)" font-size="10" text-anchor="middle">
    <text x="60" y="170">'H'</text>
    <text x="140" y="170">'e'</text>
    <text x="230" y="170">'l'</text>
    <text x="320" y="170">'l'</text>
    <text x="420" y="170">'o'</text>
  </g>
  <g fill="var(--text-muted)" font-size="9.5" text-anchor="start">
    <text x="40" y="50">d = dwell time (key down)</text>
    <text x="280" y="50">f = flight time (between)</text>
  </g>
</svg>
:::

## Snímání

### Software keylogger

* Captures key press + release events with high-precision timestamps.
* OS hooks (Windows: SetWindowsHookEx; Linux: evdev; macOS: NSEvent).
* **Sampling:** ms-level precision standard.
* **Browser-based:** JavaScript keydown/keyup events.

### Hardware keyboard

* Standard keyboards work fine.
* **Mechanical keyboards** with N-key rollover provide better events.
* **Force-sensing keyboards** (rare) capture key pressure.

### Touchscreen

* **Phone soft keyboards** — touch dynamics.
* **Tablet keyboards** — combined dwell time + touch pressure (force touch).
* **Different model** than physical keyboard.

## Features

### Per-keystroke

* **Dwell time** $d_i$ — duration of i-th key press.
* **Flight time** $f_{i,j}$ — interval between key i release and key j press.

### N-graph features

* **Digraph** (2-keystroke) — common letter pairs (th, he, in, an).
* **Trigraph** (3-keystroke) — three letters.
* **N-graph** — generalization.

### Per-user

* **Mean & variance** of dwell times across all keys.
* **Mean flight times** for specific bigrams.
* **Typing speed** (WPM).
* **Error rate** (backspaces).
* **Pattern of hand alternation**.

## Algoritmy

### Statistical

* **Mean + standard deviation** of dwell/flight times.
* **Mahalanobis distance** — accounts for feature correlation.

### Machine learning

* **k-NN classifier** — simple, effective.
* **SVM** with RBF kernel.
* **Random Forest** — handles non-linear patterns.

### Deep learning

* **RNN / LSTM** — temporal sequence model.
* **Transformer** — attention over keystroke sequences.

::: viz keystroke-rhythm "Napište přesně frázi nebo nechte simulovat — vidíte dwell/flight profil a Mahalanobis vzdálenost vůči enrolled profilu."
:::

## Use cases

### Text-dependent (challenge)

* **Same phrase** typed each time (e.g., login password).
* Higher accuracy (controlled input).
* **EER:** 5–15 % (typical).

### Text-independent (free typing)

* User types *arbitrary* content (e.g., during normal work).
* Lower accuracy (less consistent).
* **EER:** 10–25 %.

### Continuous authentication

* **Monitor typing** during entire session.
* **Detect "user change"** — if typing pattern shifts, demand re-authentication.
* **Use case:** banking application running in background.

## Praktická nasazení

### Banking

* **CoronetSecure** (Israeli company) — keystroke biometrics for online banking.
* **BehavioSec** — behavioral biometric platform.
* **TypingDNA** — typing-based authentication API.

### Workplace

* **Continuous monitoring** of remote workers.
* Anti-cheating in online exams.
* **TypingDNA Verify** — passwordless 2FA via typing.

### Online exams

* **Coursera, edX** — keystroke verification during proctored exams.
* **Detect identity switch** mid-exam.

### Insider threat detection

* Behavioral baseline of each user.
* Alert if typing pattern *suddenly changes* (compromised account).

## Vlastnosti

### Pro

* **Passive:** no extra hardware, no extra user action.
* **Continuous:** works throughout session.
* **Low cost:** standard keyboard.
* **Privacy-friendly:** doesn't capture biometric *content*, just *timing*.

### Proti

* **Lower accuracy** než face, fingerprint, iris.
* **High variability:**
  * Tiredness.
  * Mood.
  * Different keyboards.
  * Multitasking (interruptions during typing).
* **Aging:** typing patterns evolve over time.
* **Not for one-shot authentication** — accuracy too low.

## Anti-spoofing

### Replay attack

* Pre-recorded keystroke timing replayed via software.
* **Defenze:** challenge-response (different phrase each time).

### Mimicry

* Human attempting to type like another person.
* *Difficult to fool* good systems consistently.

### Automated typing

* Bots typing at superhuman speeds or with too-consistent timing.
* **Easy to detect** — non-human patterns.

## Standardy

* **NIST keystroke recommendations** — ad-hoc, no formal standard.
* **EN ISO/IEC 19794** doesn't formally cover keystroke (other behavioral biometrics).

## Limity

### Stabilita

* **Není absolutní** — silná únava, zdravotní stav, změna klávesnice (notebook → external) může výrazně změnit pattern.
* Periodic re-enrollment necessary.

### Demographic effects

* **Age:** younger users vs older — different patterns.
* **Native language:** typing in foreign language differs from native.
* **Disability:** motor disorders, RSI.

## Mouse dynamics — analogy

Similar to keystroke, but for *mouse movements*:

* **Click timing.**
* **Movement velocity, acceleration.**
* **Drag patterns.**
* **Scroll behavior.**

Often combined with keystroke for richer behavioral biometric.

## Trends

* **Continuous Authentication frameworks** — combine keystroke + mouse + touch + gait.
* **Federated learning** — train on user devices, no centralized typing data.
* **DL-based** — Transformer architectures dominating.
* **Mobile-specific** — touchscreen typing as primary modality.

## Vztah k jiným biometrikám

| | **Keystroke** | **Mouse** | **Voice** |
| :--- | :---: | :---: | :---: |
| Passive | yes | yes | partial |
| Continuous | yes | yes | partial |
| Accuracy | low | low | medium |
| Effort | none | none | some |
| Hardware | std keyboard | std mouse | mic |

Keystroke is *part of* behavioral biometric portfolio — typically used in *fusion* rather than standalone.

---

*Zdroj: BIO přednášky 2025/26, BIO 12 — Dynamické biometrické vlastnosti. Externí reference: Monrose, F., Rubin, A. D.: *Keystroke dynamics as a biometric for authentication* (Future Generation Computer Systems 2000); Killourhy, K. S., Maxion, R. A.: *Comparing Anomaly-Detection Algorithms for Keystroke Dynamics* (DSN 2009); Banerjee, S. P., Woodard, D. L.: *Biometric Authentication and Identification Using Keystroke Dynamics: A Survey* (Journal of Pattern Recognition Research 2012); TypingDNA — [typingdna.com](https://www.typingdna.com/).*
