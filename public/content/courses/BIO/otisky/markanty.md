---
title: Markanty (minutiae) — detailní porovnání
---

# Markanty (minutiae) — detailní porovnání

**Markant** (minutia) je *lokální* singulární bod papilárních linií — místo, kde ridge nestandardně končí, dělí se, propojuje. Markanty jsou *primary feature* pro detailní porovnávání otisků prstů. Jediný otisk obsahuje 30–100 markantů; jejich *pozice* + *orientace* + *typ* dají *unique fingerprint signature*.

## Typy markantů

::: svg "Typy markantů: ridge ending, bifurcation, dot, island, lake, spur, crossover, bridge."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1">
    <rect x="20" y="30" width="120" height="90" rx="4"/>
    <rect x="150" y="30" width="120" height="90" rx="4"/>
    <rect x="280" y="30" width="120" height="90" rx="4"/>
    <rect x="410" y="30" width="120" height="90" rx="4"/>
    <rect x="20" y="130" width="120" height="90" rx="4"/>
    <rect x="150" y="130" width="120" height="90" rx="4"/>
    <rect x="280" y="130" width="120" height="90" rx="4"/>
    <rect x="410" y="130" width="120" height="90" rx="4"/>
  </g>
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <path d="M30,75 L70,75"/>
    <path d="M30,90 L70,90"/>
    <path d="M30,60 L70,60"/>
    <path d="M160,75 L195,75 L220,65"/>
    <path d="M160,90 L195,90 L220,100"/>
    <path d="M290,75 L370,75"/>
    <path d="M290,90 L370,90"/>
    <path d="M420,75 L500,75"/>
    <path d="M420,90 L460,90 M470,90 L500,90"/>
    <path d="M30,175 L130,175"/>
    <path d="M30,195 L130,195"/>
    <path d="M160,175 L260,175"/>
    <path d="M160,195 L195,195 C200,205 215,205 220,195 L260,195"/>
    <path d="M290,175 L325,175 L335,165 M345,165 L370,175"/>
    <path d="M290,190 L325,190 L335,200 M345,200 L370,190"/>
    <path d="M420,175 L500,175"/>
    <path d="M420,190 L460,190 L470,180 L500,190"/>
  </g>
  <g fill="var(--accent)" stroke="var(--accent)">
    <circle cx="78" cy="75" r="3" fill="var(--accent)"/>
    <circle cx="220" cy="65" r="3" fill="var(--accent)"/>
    <circle cx="335" cy="80" r="3" fill="var(--accent)"/>
    <circle cx="465" cy="90" r="3" fill="var(--accent)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="80" y="22">Ridge ending</text>
    <text x="210" y="22">Bifurcation</text>
    <text x="340" y="22">Continuous</text>
    <text x="470" y="22">Dot / island</text>
    <text x="80" y="125">Lake (enclosure)</text>
    <text x="210" y="125">Lake closed</text>
    <text x="340" y="125">Spur (hook)</text>
    <text x="470" y="125">Crossover (bridge)</text>
  </g>
</svg>
:::

### Klíčové markanty

* **Ridge ending** (zakončení) — místo, kde *ridge končí*. Nejběžnější typ.
* **Bifurcation** (rozdvojení) — ridge se *rozděluje na dvě*. Druhý nejčastější.
* **Dot / Island** (ostrov) — *velmi krátký* ridge (1–3 dots) izolovaný.
* **Lake / Enclosure** — ridge se *rozdělí a zase spojí*, vytvoří uzavřenou oblast.
* **Spur (hook)** — krátký ridge *přidaný* k delším.
* **Crossover (bridge)** — *propojení* dvou rovnoběžných ridges krátkou linkou.
* **Compound minutia** — kombinace, např. *trifurcation* (rozdělení na tři).

### Forenzní vs. automatické

V **automatizovaných** systémech (AFIS) se obvykle používají jen dva typy:

* **Ridge ending** (jednoduché zakončení).
* **Bifurcation** (rozdvojení).

Důvod: ostatní markanty jsou *vzácnější* a často *nejednoznačné* po image processing.

V **forenzním** kontextu (manual examination) examinator rozpoznává *všechny* typy + pravidla.

## Reprezentace markantu

Standard ISO/IEC 19794-2 ukládá markant jako *tuple*:

::: math
m = (x, y, \theta, t, q)
:::

* $x, y$ — souřadnice v obrazu.
* $\theta$ — orientace (úhel směru ridge, 0–360°).
* $t$ — typ (ridge ending = 0, bifurcation = 1).
* $q$ — quality / confidence (0–100).

Typický otisk: **30–100 markantů**. ISO format ukládá ~$100 \times 6 \text{ B} = 600 \text{ B}$ per template.

## Orientace markantů

Důležité pro alignment:

* **Ridge ending:** směr *ridge* na koncovém bodě (úhel tečny).
* **Bifurcation:** směr *centrálního ridge* (středního ze tří).

Standardní zavedení: orientace **v stupních od 0 do 360**, kde 0 = horizontální vpravo, rostoucí counter-clockwise.

## Extrakce markantů — algoritmus

Klasický pipeline (Maltoni-Maio 1997):

1. **Image acquisition** — raw grayscale image.
2. **Image enhancement** — Gabor filter banks, FFT-based enhancement.
3. **Binarization** — black ridges, white valleys.
4. **Thinning** — *skeletonization* ridges to 1-pixel width lines.
5. **Minutiae detection** — for each pixel:
   * Compute *crossing number* (Q. Liu 1996) — počet 0→1 přechodů v 3×3 okolí.
   * CN = 1 → *ridge ending*.
   * CN = 3 → *bifurcation*.
   * CN = 2 → *continuous ridge* (no minutia).
6. **Post-processing** — filter false minutiae:
   * Minutiae *too close together* (< 10 pixels) → spurious from noise.
   * Minutiae *near image border* → unreliable.
   * Minutiae *near edge of ridge mask* → image processing artifact.
7. **Quality assessment** — *quality score* per minutia.

## Daktyloskopické porovnání (matching)

### Princip

Mějme dvě sady markantů $T = \{t_1, ..., t_n\}$ (template) a $I = \{i_1, ..., i_m\}$ (input). Cíl: najít *maximum počet matchů*.

::: math
\text{match}(t, i) = 1 \iff \begin{cases}
|t.x - i.x| \le \tau_x \\
|t.y - i.y| \le \tau_y \\
|t.\theta - i.\theta| \le \tau_\theta
\end{cases}
:::

Pro daný *alignment* (translation $T_x, T_y$ + rotation $R$):

::: math
N_{\text{matches}} = \sum_{t \in T} \mathbb{1}\left[\exists i \in I : \text{match}(R \cdot t + T, i)\right]
:::

### Algoritmus

1. **Alignment** — najdi *optimum* translation + rotation, který maximalizuje matches.
   * Standardní: **RANSAC** pro robust estimation.
   * Alternativně: Hough transform, ICP (Iterative Closest Point).
2. **Match score** — *normalizovaná* hodnota:

::: math
S = \frac{N_{\text{matches}}^2}{|T| \cdot |I|}
:::

3. **Decision** — $S > \tau$ → match (typically $\tau \in [0.3, 0.5]$).

### Computational complexity

* **Naive:** $O(n \cdot m)$ per alignment hypothesis.
* **Pro $k$ alignment hypotheses:** $O(k \cdot n \cdot m)$.
* **Optimization:** index-based search, k-D trees, locality-sensitive hashing.

Modern AFIS dělá **~1 000 000** comparisons / sekundu na single CPU core.

::: viz minutiae-matching "Posuňte translation/rotation, sledujte počet sparovaných minutií a score N²/(|T|·|I|)."
:::

## "12 markantů" pravidlo

V mnoha jurisdikcích (US, UK, Germany) je **minimum 12 matching minutiae** required pro *positive identification* v soudním řízení (rule of *12 ridge characteristics*).

* Toto je *konvence*, ne *empirický fakt*. Galton 1892 odhadoval, že 12 minutiae dává FAR ~$10^{-13}$.
* **Modern AFIS** používá *statistical scoring*, ne fixed threshold.

## Likelihood ratio

V *forenzní statistice* se používá *likelihood ratio* (LR):

::: math
LR = \frac{P(\text{evidence} | H_p)}{P(\text{evidence} | H_d)}
:::

* $H_p$ — *prosecution hypothesis* (suspect zanechal otisk).
* $H_d$ — *defense hypothesis* (random osoba zanechala otisk).
* **LR > 10⁶** = silný důkaz pro $H_p$.

Modern forensic reporting: *"The probability of observing this fingerprint match if the suspect did not leave the print is approximately 1 in N"*.

## Limity markantů

* **Poor quality images** — málo extrahovaných minutiae → nízká přesnost.
* **Latent prints** — *partial* otisk; jen ~30 % markantů available.
* **Distortion** — non-rigid skin deformation způsobí *false negatives*.
* **Spoofing** — fake fingers s replikováním markantů.

## ANSI/NIST-ITL standard

* **ANSI/NIST-ITL 1-2011** — standardizovaný format pro fingerprint data exchange.
* *Record Type 9* obsahuje minutiae data.
* Format: konkrétní layout binary + ASCII fields.
* Použití: FBI NGI, INTERPOL AFIS, Eurodac.

---

*Zdroj: BIO přednášky 2025/26, BIO 5 — Rozpoznávání podle otisků prstů (Drahanský). Externí reference: Maltoni, D., Maio, D., Jain, A. K., Prabhakar, S.: *Handbook of Fingerprint Recognition* (2nd ed., Springer 2009), kap. 3–4; ISO/IEC 19794-2:2011 *Biometric data interchange formats — Finger minutiae data*; ANSI/NIST-ITL 1-2011 *Data Format for Fingerprint Information Transfer*; Champod, C. et al.: *Fingerprints and Other Ridge Skin Impressions* (2nd ed., CRC Press 2016) — forenzní pohled.*
