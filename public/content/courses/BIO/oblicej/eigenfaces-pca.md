---
title: Eigenfaces a PCA pro rozpoznávání obličeje
---

# Eigenfaces a PCA pro rozpoznávání obličeje

**Eigenfaces** (Turk & Pentland, MIT 1991) byl *první* automatizovaný systém pro rozpoznávání obličeje s prakticky využitelnou přesností. Použil **Principal Component Analysis (PCA)** pro redukci dimenzionality obličejových obrazů. Ačkoliv dnes překonán deep learningem, princip je *fundamentální* a stále se vyučuje jako *klasická* metoda.

## Princip

Klasická úloha: máme obrázek obličeje $\mathbf{x}$ (např. $100 \times 100 = 10\,000$ pixels, vektor v $\mathbb{R}^{10000}$). Chceme:

1. Najít **kompaktní reprezentaci** (např. 100 dimensions).
2. Použít reprezentaci pro *porovnávání* obličejů.

### Klíčový poznatek

Většina obrázků v $\mathbb{R}^{10000}$ *nepředstavuje obličej* — pixels jsou *vysoce korelované* (sousední pixely jsou obvykle podobné, oči jsou pod čelem, atd.). Skutečný *manifold* obličejů má *mnohem nižší* dimenzionalitu.

PCA najde *směry maximální variance* v datasetu obličejů → tyto směry jsou *eigenfaces* (vlastní obličeje).

## Algoritmus

### Trénink

1. **Sběr training set** $\{\mathbf{x}_1, ..., \mathbf{x}_N\}$ — N obličejů, každý jako vektor $\mathbf{x}_i \in \mathbb{R}^d$ (d = number of pixels).
2. **Spočti průměrný obličej:**

::: math
\bar{\mathbf{x}} = \frac{1}{N} \sum_{i=1}^N \mathbf{x}_i
:::

3. **Spočti centrované obrazy:**

::: math
\mathbf{a}_i = \mathbf{x}_i - \bar{\mathbf{x}}
:::

4. **Spočti covariance matrix:**

::: math
C = \frac{1}{N} \sum_{i=1}^N \mathbf{a}_i \mathbf{a}_i^T = \frac{1}{N} A A^T
:::

kde $A = [\mathbf{a}_1, ..., \mathbf{a}_N]$ je matice $d \times N$.

5. **Eigendecomposition** matice $C$:

::: math
C \mathbf{u}_k = \lambda_k \mathbf{u}_k
:::

* **Eigenvectors** $\mathbf{u}_k$ jsou *eigenfaces*.
* **Eigenvalues** $\lambda_k$ udávají, kolik variance je ve směru $\mathbf{u}_k$.

6. **Vyber top K eigenfaces** s největšími eigenvalues. Typicky K = 50–200.

### Computational trick

Matice $C$ je $d \times d$ (např. $10\,000 \times 10\,000$) — *velmi* drahá eigendecomposition.

Trik: pokud $N \ll d$, máme jen $N$ nenulových eigenvalues. Místo $C = AA^T$ (d × d) spočti $L = A^T A$ (N × N):

* Eigendecomposition $L$ je rychlá.
* Eigenvectors $L$ jsou *related* k eigenvectors $C$:

::: math
\mathbf{u}_k = A \mathbf{v}_k / \sqrt{\lambda_k}
:::

Pro $N = 100$ a $d = 10\,000$: redukce z $10^8$ na $10^4$ ops.

### Projekce do feature space

Pro libovolný obličej $\mathbf{x}$:

::: math
\mathbf{w}_k = \mathbf{u}_k^T (\mathbf{x} - \bar{\mathbf{x}}), \quad k = 1, \ldots, K
:::

* $\mathbf{w} = (w_1, ..., w_K)$ je *feature vector* (embedding) obrázku.
* **Rekonstrukce:** $\mathbf{x} \approx \bar{\mathbf{x}} + \sum_k w_k \mathbf{u}_k$.

### Rozpoznávání

* Pro test image $\mathbf{x}$: spočti $\mathbf{w}_x$.
* Porovnej s feature vectors *enrolled* obličejů $\{\mathbf{w}_1, ..., \mathbf{w}_M\}$.
* **Nearest neighbor** podle Euclidean distance:

::: math
\text{match} = \arg\min_i \|\mathbf{w}_x - \mathbf{w}_i\|
:::

* Pokud minimum distance < threshold → identification successful.

## Vizualizace eigenfaces

::: svg "Eigenfaces vizualizace: každý eigenface je 'ghost-like' tvář reprezentující směr maximální variance v datasetu."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="rgba(150, 150, 200, 0.5)" stroke="var(--accent)" stroke-width="1">
    <ellipse cx="80" cy="100" rx="40" ry="55"/>
    <ellipse cx="80" cy="80" rx="6" ry="3" fill="var(--accent)"/>
    <ellipse cx="80" cy="80" rx="6" ry="3" fill="var(--accent)" transform="translate(15 0)"/>
  </g>
  <text x="80" y="180" text-anchor="middle" fill="var(--text)">průměrný obličej</text>
  <g fill="rgba(100, 100, 200, 0.5)" stroke="var(--accent)" stroke-width="1">
    <ellipse cx="200" cy="100" rx="40" ry="55"/>
    <path d="M180,80 L195,90 L180,100 Z" fill="var(--accent)"/>
    <path d="M220,80 L205,90 L220,100 Z" fill="var(--accent)"/>
  </g>
  <text x="200" y="180" text-anchor="middle" fill="var(--text)">eigenface 1</text>
  <text x="200" y="195" text-anchor="middle" font-size="9" fill="var(--text-muted)">jas/kontrast</text>
  <g fill="rgba(200, 100, 100, 0.5)" stroke="var(--accent)" stroke-width="1">
    <ellipse cx="320" cy="100" rx="45" ry="50"/>
  </g>
  <text x="320" y="180" text-anchor="middle" fill="var(--text)">eigenface 2</text>
  <text x="320" y="195" text-anchor="middle" font-size="9" fill="var(--text-muted)">tvar tváře</text>
  <g fill="rgba(100, 200, 100, 0.5)" stroke="var(--accent)" stroke-width="1">
    <ellipse cx="440" cy="100" rx="40" ry="60"/>
  </g>
  <text x="440" y="180" text-anchor="middle" fill="var(--text)">eigenface 3</text>
  <text x="440" y="195" text-anchor="middle" font-size="9" fill="var(--text-muted)">pose</text>
</svg>
:::

* **Eigenface 1** typicky zachycuje *globální illumination* (lighting direction).
* **Eigenface 2** zachycuje *facial shape* variation.
* **Eigenface 3+** zachycují *pose, expression, identity-specific* details.

První 50–100 eigenfaces zachycují ~95 % variance datasetu.

::: viz eigenfaces-recon "Rekonstrukce obličeje z μ + Σ wₖ·uₖ; posuňte K a váhy nebo nechte spočítat projekci."
:::

## Limity Eigenfaces

### 1. Illumination sensitivity

PCA zachytí *every* variance — včetně *illumination*. Změna osvětlení mezi enrollment a recognition způsobí *katastrofální* failure.

Mitigace: **Fisherfaces** (Linear Discriminant Analysis, LDA) — místo *maximizing total variance* maximize *between-class* variance / minimize *within-class*. Better discrimination.

### 2. Linearita

PCA je *linear* metoda. Manifold obličejů je *non-linear* (rotace, expression, atd.).

Mitigace: **Kernel PCA** — kernel trick pro non-linear PCA. Komplikovanější, ale lepší.

### 3. Sensitivity to alignment

Eigenfaces předpokládá, že obličeje jsou *přesně* zarovnané (eyes at fixed positions). Misalignment = wrong projection.

### 4. Holistic, not local

PCA je *global* metoda — žádné *local* features (eyes, nose, mouth) explicitly extracted.

Alternativy: **Local Binary Patterns (LBP)**, **HOG features**, **SIFT/SURF**.

## Historický kontext

* **1987:** Sirovich & Kirby — first PCA on faces (face *compression*, not recognition).
* **1991:** **Turk & Pentland — Eigenfaces** — first practical face recognition using PCA.
* **1997:** **Belhumeur, Hespanha, Kriegman** — Fisherfaces.
* **2002:** Local Binary Patterns (Ahonen, Hadid, Pietikäinen).
* **2014:** **DeepFace** (Facebook) — deep learning era starts.
* **2015:** **FaceNet** (Google) — modern benchmark.

## Použití dnes

Eigenfaces / PCA *není* používán v komerčních systémech. Ale:

* **Educational tool** — fundamental ML concept.
* **Quick prototypes** — when DL is overkill.
* **Privacy-preserving applications** — PCA features may be *less identifying* than DL embeddings.
* **Compression** — store template as 100-dim vector instead of full image.

## Mathematical foundation

PCA je matematicky equivalentní **Karhunen-Loève transform** (KLT) — optimal linear transform for energy compaction. Klíčová věta:

> Z všech ortogonálních lineárních transformací maximalizuje PCA explained variance v *first K* components.

To je důvod, proč PCA *funguje* — pokud variance koreluje s diskriminační informací.

---

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání obličeje (Drahanský). Externí reference: Turk, M., Pentland, A.: *Eigenfaces for Recognition* (Journal of Cognitive Neuroscience 1991) — [PDF](https://www.face-rec.org/algorithms/PCA/jcn.pdf); Belhumeur, P. N., Hespanha, J. P., Kriegman, D. J.: *Eigenfaces vs. Fisherfaces: Recognition Using Class Specific Linear Projection* (IEEE PAMI 1997); Li, S. Z., Jain, A. K.: *Handbook of Face Recognition* (2nd ed., Springer 2011), kap. 3.*
