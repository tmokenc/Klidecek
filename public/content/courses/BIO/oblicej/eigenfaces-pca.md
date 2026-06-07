---
title: Eigenfaces a PCA pro rozpoznávání obličeje
---

# Eigenfaces a PCA pro rozpoznávání obličeje

**Eigenfaces** (Turk a Pentland, MIT 1991) byl *první* automatizovaný systém pro rozpoznávání obličeje s prakticky využitelnou přesností. Pro redukci dimenzionality obličejových obrazů použil **analýzu hlavních komponent (Principal Component Analysis, PCA)**. Ačkoliv ho dnes překonalo hluboké učení (deep learning), princip je *zásadní* a stále se vyučuje jako *klasická* metoda.

## Princip

Klasická úloha: máme obrázek obličeje $\mathbf{x}$ (např. $100 \times 100 = 10\,000$ pixelů, tedy vektor v $\mathbb{R}^{10000}$). Chceme:

1. Najít **kompaktní reprezentaci** (např. 100 dimenzí).
2. Tuto reprezentaci použít k *porovnávání* obličejů.

### Klíčový poznatek

Většina obrázků v $\mathbb{R}^{10000}$ *nepředstavuje obličej* — pixely jsou *vysoce korelované* (sousední pixely jsou obvykle podobné, oči bývají pod čelem atd.). Skutečná *varieta* (manifold) obličejů má *mnohem nižší* dimenzionalitu.

PCA najde *směry maximální variance* (rozptylu) v datasetu obličejů → tyto směry jsou *eigenfaces* (vlastní obličeje).

## Algoritmus

### Trénink

1. **Sběr trénovací množiny (training set)** $\{\mathbf{x}_1, ..., \mathbf{x}_N\}$ — N obličejů, každý jako vektor $\mathbf{x}_i \in \mathbb{R}^d$ (d = počet pixelů).
2. **Spočti průměrný obličej:**

::: math
\bar{\mathbf{x}} = \frac{1}{N} \sum_{i=1}^N \mathbf{x}_i
:::

3. **Spočti centrované obrazy** (od každého obličeje se odečte průměr):

::: math
\mathbf{a}_i = \mathbf{x}_i - \bar{\mathbf{x}}
:::

4. **Spočti kovarianční matici (covariance matrix):**

::: math
C = \frac{1}{N} \sum_{i=1}^N \mathbf{a}_i \mathbf{a}_i^T = \frac{1}{N} A A^T
:::

kde $A = [\mathbf{a}_1, ..., \mathbf{a}_N]$ je matice $d \times N$.

5. **Spektrální rozklad (eigendecomposition)** matice $C$:

::: math
C \mathbf{u}_k = \lambda_k \mathbf{u}_k
:::

* **Vlastní vektory (eigenvectors)** $\mathbf{u}_k$ jsou právě *eigenfaces*.
* **Vlastní čísla (eigenvalues)** $\lambda_k$ udávají, kolik variance je ve směru $\mathbf{u}_k$.

6. **Vyber prvních K eigenfaces** s největšími vlastními čísly. Typicky K = 50–200.

### Výpočetní trik

Matice $C$ je $d \times d$ (např. $10\,000 \times 10\,000$) — její spektrální rozklad je *velmi* drahý.

Trik: pokud $N \ll d$, máme jen $N$ nenulových vlastních čísel. Místo $C = AA^T$ (rozměru d × d) proto spočti $L = A^T A$ (rozměru N × N):

* Spektrální rozklad matice $L$ je rychlý.
* Vlastní vektory matice $L$ *souvisejí* s vlastními vektory matice $C$ vztahem:

::: math
\mathbf{u}_k = A \mathbf{v}_k / \sqrt{\lambda_k}
:::

Pro $N = 100$ a $d = 10\,000$: redukce z $10^8$ na $10^4$ operací.

### Projekce do prostoru příznaků (feature space)

Pro libovolný obličej $\mathbf{x}$:

::: math
\mathbf{w}_k = \mathbf{u}_k^T (\mathbf{x} - \bar{\mathbf{x}}), \quad k = 1, \ldots, K
:::

* $\mathbf{w} = (w_1, ..., w_K)$ je *vektor příznaků* (feature vector, embedding) daného obrázku.
* **Rekonstrukce:** $\mathbf{x} \approx \bar{\mathbf{x}} + \sum_k w_k \mathbf{u}_k$.

### Rozpoznávání

* Pro testovaný obrázek $\mathbf{x}$ spočti jeho vektor příznaků $\mathbf{w}_x$.
* Porovnej ho s vektory příznaků *zaregistrovaných (enrolled)* obličejů $\{\mathbf{w}_1, ..., \mathbf{w}_M\}$.
* **Nejbližší soused (nearest neighbor)** podle eukleidovské vzdálenosti:

::: math
\text{match} = \arg\min_i \|\mathbf{w}_x - \mathbf{w}_i\|
:::

* Pokud je minimální vzdálenost menší než práh (threshold) → identifikace proběhla úspěšně.

## Vizualizace eigenfaces

::: svg "Eigenfaces vizualizace: každý eigenface je „přízračná" tvář reprezentující směr maximální variance v datasetu."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="rgba(150, 150, 200, 0.5)" stroke="var(--accent)" stroke-width="1">
    <ellipse cx="80" cy="100" rx="40" ry="55"/>
    <ellipse cx="72" cy="80" rx="6" ry="3" fill="var(--accent)"/>
    <ellipse cx="72" cy="80" rx="6" ry="3" fill="var(--accent)" transform="translate(16 0)"/>
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

* **Eigenface 1** typicky zachycuje *globální osvětlení* (illumination) — tedy směr, odkud na obličej dopadá světlo.
* **Eigenface 2** zachycuje variabilitu *tvaru obličeje* (facial shape).
* **Eigenface 3 a další** zachycují detaily jako *natočení hlavy (pose), výraz (expression) a rysy specifické pro danou identitu*.

Prvních 50–100 eigenfaces zachycuje zhruba 95 % variance datasetu.

::: viz eigenfaces-recon "Rekonstrukce obličeje z μ + Σ wₖ·uₖ; posuňte K a váhy nebo nechte spočítat projekci."
:::

## Limity Eigenfaces

### 1. Citlivost na osvětlení

PCA zachytí *veškerou* varianci — tedy i variabilitu danou *osvětlením (illumination)*. Změna osvětlení mezi registrací (enrollment) a rozpoznáváním pak způsobí *katastrofální* selhání.

Zmírnění: **Fisherfaces** (lineární diskriminační analýza, Linear Discriminant Analysis, LDA) — místo *maximalizace celkové variance* maximalizuje varianci *mezi třídami (between-class)* a zároveň minimalizuje varianci *uvnitř třídy (within-class)*. Tím dosahuje lepšího rozlišení jednotlivých identit.

### 2. Linearita

PCA je *lineární* metoda. Varieta obličejů je ovšem *nelineární* (kvůli rotacím, výrazům apod.).

Zmírnění: **Kernel PCA** — využívá tzv. kernel trick pro nelineární PCA. Je komplikovanější, ale lepší.

### 3. Citlivost na zarovnání

Eigenfaces předpokládá, že jsou obličeje *přesně* zarovnané (oči na pevných pozicích). Nezarovnání (misalignment) vede ke špatné projekci.

### 4. Holistická, nikoli lokální metoda

PCA je *globální* metoda — žádné *lokální* rysy (oči, nos, ústa) se z obrazu explicitně neextrahují.

Alternativy: **lokální binární vzory (Local Binary Patterns, LBP)**, **příznaky HOG (HOG features)**, **SIFT/SURF**.

## Historický kontext {tier=extra}

* **1987:** Sirovich a Kirby — první aplikace PCA na obličeje (zaměřená na *kompresi* obličejů, nikoli rozpoznávání).
* **1991:** **Turk a Pentland — Eigenfaces** — první prakticky použitelné rozpoznávání obličeje pomocí PCA.
* **1997:** **Belhumeur, Hespanha, Kriegman** — Fisherfaces.
* **2002:** Lokální binární vzory (Ahonen, Hadid, Pietikäinen).
* **2014:** **DeepFace** (Facebook) — začíná éra hlubokého učení.
* **2015:** **FaceNet** (Google) — moderní referenční systém (benchmark).

## Použití dnes

Eigenfaces / PCA se *nepoužívá* v komerčních systémech. Přesto má své místo:

* **Výukový nástroj** — názorně ukazuje základní koncept strojového učení.
* **Rychlé prototypy** — když by bylo hluboké učení zbytečně těžkotonážní řešení.
* **Aplikace chránící soukromí** — příznaky z PCA mohou být *méně identifikující* než embeddingy z hlubokého učení.
* **Komprese** — šablonu (template) lze uložit jako 100rozměrný vektor namísto celého obrázku.

## Matematický základ

PCA je matematicky ekvivalentní **Karhunenově-Loèveově transformaci (Karhunen-Loève transform, KLT)** — optimální lineární transformaci pro koncentraci energie. Klíčová věta:

> Ze všech ortogonálních lineárních transformací maximalizuje PCA vysvětlenou varianci v *prvních K* komponentách.

Právě proto PCA *funguje* — za předpokladu, že variance koreluje s diskriminační informací.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=BCBZPtZCI7w" "Geometric Face Recognition - Computerphile" "Computerphile"
:::

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání obličeje (Drahanský). Externí reference: Turk, M., Pentland, A.: *Eigenfaces for Recognition* (Journal of Cognitive Neuroscience 1991) — [PDF](https://www.face-rec.org/algorithms/PCA/jcn.pdf); Belhumeur, P. N., Hespanha, J. P., Kriegman, D. J.: *Eigenfaces vs. Fisherfaces: Recognition Using Class Specific Linear Projection* (IEEE PAMI 1997); Li, S. Z., Jain, A. K.: *Handbook of Face Recognition* (2nd ed., Springer 2011), kap. 3.*
