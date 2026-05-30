---
title: Konvoluce a pooling
---

# Konvoluce a pooling

**Konvoluční neuronové sítě** (CNN) jsou specializace pro vstupy s **prostorovou strukturou** — obrazy, audio, video. Místo fully-connected vrstev používají *konvoluci*, která využívá lokality a translační invariance.

## Proč ne fully-connected pro obrazy

Vstup `100 × 100 × 3` RGB obrázek = `30 000` čísel. Fully-connected vrstva s `1000` výstupy potřebuje `30M` parametrů — *jenom první vrstva*. Pro hluboké sítě by se počet parametrů vymkl.

Navíc fully-connected vrstva *ignoruje* prostorovou strukturu — perpixelové sousedství je zahozeno; pixely v levém horním rohu jsou *stejně blízko* k pixelům dole vpravo.

Naproti tomu:

* **Lokalita** — rys (hrana, textura) se *vyskytuje* v malém okolí pixelu.
* **Translační invariance** — stejný rys vypadá stejně, ať je *kde* na obrázku.
* **Hierarchie** — z hran skládáme tvary, z tvarů objekty.

CNN tyto vlastnosti **zabudovává**.

## Konvoluce — operace

Konvoluce pohybuje *malou maticí* (kernel, filter) přes vstup a v každé pozici počítá *dot product*:

::: math
y(i, j) = \sum_{a, b} x(i + a, j + b) \cdot k(a, b)
:::

Pro `K × K` kernel a `H × W` vstup je výstup `(H − K + 1) × (W − K + 1)` (bez paddingu).

::: svg "Konvoluce 3×3 kernelu přes 5×5 vstup. Pro každé okno počítáme weighted sum."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6" fill="none">
    <g transform="translate(40,40)">
      <rect width="100" height="100" stroke="var(--accent)"/>
      <line x1="0" y1="20" x2="100" y2="20"/>
      <line x1="0" y1="40" x2="100" y2="40"/>
      <line x1="0" y1="60" x2="100" y2="60"/>
      <line x1="0" y1="80" x2="100" y2="80"/>
      <line x1="20" y1="0" x2="20" y2="100"/>
      <line x1="40" y1="0" x2="40" y2="100"/>
      <line x1="60" y1="0" x2="60" y2="100"/>
      <line x1="80" y1="0" x2="80" y2="100"/>
      <rect x="0" y="0" width="60" height="60" stroke="#e08a3a" stroke-width="2"/>
    </g>
    <g transform="translate(200,60)">
      <rect width="60" height="60" stroke="var(--accent)"/>
      <line x1="0" y1="20" x2="60" y2="20"/>
      <line x1="0" y1="40" x2="60" y2="40"/>
      <line x1="20" y1="0" x2="20" y2="60"/>
      <line x1="40" y1="0" x2="40" y2="60"/>
    </g>
    <g transform="translate(320,60)">
      <rect width="80" height="80" stroke="var(--accent)"/>
      <line x1="0" y1="27" x2="80" y2="27"/>
      <line x1="0" y1="54" x2="80" y2="54"/>
      <line x1="27" y1="0" x2="27" y2="80"/>
      <line x1="54" y1="0" x2="54" y2="80"/>
      <rect x="0" y="0" width="27" height="27" fill="#e08a3a" opacity="0.5"/>
    </g>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11" font-weight="600">
    <text x="90" y="30">Vstup 5×5</text>
    <text x="230" y="50">Kernel 3×3</text>
    <text x="360" y="50">Output 3×3</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <path d="M 70 80 L 200 90 L 230 90"/>
    <path d="M 270 90 L 320 80"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="160" y="105">Σ × =</text>
    <text x="270" y="170">posune se okno → další buňka outputu</text>
  </g>
  <g font-size="9" fill="var(--text)">
    <text x="210" y="74">1</text>
    <text x="230" y="74">0</text>
    <text x="250" y="74">-1</text>
    <text x="210" y="94">2</text>
    <text x="230" y="94">0</text>
    <text x="250" y="94">-2</text>
    <text x="210" y="114">1</text>
    <text x="230" y="114">0</text>
    <text x="250" y="114">-1</text>
  </g>
</svg>
:::

### Interpretace

Konvoluční filter je **template** — výstup je vysoký tam, kde *vzor v okolí pixelu* odpovídá *vzoru v kernelu*. Klasické příklady:

* **Sobel filtr** — detekce horizontálních/vertikálních hran.
* **Laplacián** — detekce ostrých přechodů.
* **Gaussovský filtr** — rozmazání.

V CNN se kernely **učí** z dat — co je *užitečné* pro úlohu, není dané.

### Konvoluce ≠ matematická konvoluce

V signal processing je *konvoluce* `(f * g)(t) = ∫ f(τ)g(t−τ)dτ` — *flipnutý* kernel. V neuronkách (i v knihovnách CNN) se obvykle používá **cross-correlation** bez flipnutí — ale terminologie se *zachovala*. Z praktického hlediska je to jedno: parametry kernelu se *naučí*, takže symetrie/asymetrie je *naučitelná*.

## Více kanálů

Reálné obrázky jsou *3D* — `(H, W, 3)` pro RGB. Kernel pak má rozměr `(K, K, 3)`, sumace přes všechny kanály:

::: math
y(i, j) = \sum_{c=1}^{C_{in}} \sum_{a, b} x(i + a, j + b, c) \cdot k(a, b, c)
:::

A jedna vrstva produkuje **mnoho výstupních kanálů** (každý se svým kernelem):

::: math
y(i, j, c_{out}) = b(c_{out}) + \sum_{c=1}^{C_{in}} \sum_{a, b} x(i + a, j + b, c) \cdot k(a, b, c, c_{out})
:::

Konvoluční vrstva `(C_in = 64, C_out = 128, K = 3)` má `64 · 128 · 3 · 3 + 128 = 73 856` parametrů — *řádově* méně než ekvivalentní fully-connected.

## Padding a stride

### Padding

Bez paddingu se výstup *zmenšuje* — `5 × 5` vstup → `3 × 3` výstup s kernel `3 × 3`. Po několika vrstvách už nezbude nic.

* **Valid padding** — žádný. Výstup je `(H − K + 1)`.
* **Same padding** — přidáme nuly na okraj tak, aby výstup byl `H × W` (stejný jako vstup).
* **Causal padding** — jen *vlevo* (pro 1D sekvence, využívá se v WaveNet).

### Stride

**Stride `s`** = jak daleko posunout okno mezi výpočty. Výchozí `s = 1`.

Pro `s > 1` se výstup *zmenšuje*:

::: math
H_{out} = \lfloor (H_{in} + 2 P - K) / s \rfloor + 1
:::

`s = 2` redukuje rozlišení 2× — alternativa k poolingu (viz dále).

::: viz convolution-interactive "Editovatelný kernel + presety (Sobel/blur/sharpen), stride/padding sliders; klik na výstupní pixel → highlight receptive field na vstupu."
:::

## Pooling — redukce rozlišení

::: svg "Max pooling 2×2: vezme nejvyšší hodnotu v 2×2 okně."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.6" fill="none">
    <g transform="translate(40,30)">
      <rect width="160" height="160" stroke="var(--accent)"/>
      <line x1="0" y1="40" x2="160" y2="40"/>
      <line x1="0" y1="80" x2="160" y2="80"/>
      <line x1="0" y1="120" x2="160" y2="120"/>
      <line x1="40" y1="0" x2="40" y2="160"/>
      <line x1="80" y1="0" x2="80" y2="160"/>
      <line x1="120" y1="0" x2="120" y2="160"/>
      <rect x="0" y="0" width="80" height="80" stroke="#e08a3a" stroke-width="2"/>
    </g>
    <g transform="translate(300,60)">
      <rect width="80" height="80" stroke="var(--accent)"/>
      <line x1="0" y1="40" x2="80" y2="40"/>
      <line x1="40" y1="0" x2="40" y2="80"/>
    </g>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11" font-weight="600">
    <text x="120" y="22">Vstup 4×4</text>
    <text x="340" y="50">Max-pool → 2×2</text>
  </g>
  <g font-size="11" fill="var(--text)" text-anchor="middle">
    <text x="60" y="56">3</text>
    <text x="100" y="56">7</text>
    <text x="140" y="56">2</text>
    <text x="180" y="56">1</text>
    <text x="60" y="96">5</text>
    <text x="100" y="96">8</text>
    <text x="140" y="96">4</text>
    <text x="180" y="96">3</text>
    <text x="60" y="136">1</text>
    <text x="100" y="136">2</text>
    <text x="140" y="136">9</text>
    <text x="180" y="136">6</text>
    <text x="60" y="176">3</text>
    <text x="100" y="176">4</text>
    <text x="140" y="176">5</text>
    <text x="180" y="176">2</text>
  </g>
  <g font-size="12" fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="320" y="84">8</text>
    <text x="360" y="84">4</text>
    <text x="320" y="124">4</text>
    <text x="360" y="124">9</text>
  </g>
</svg>
:::

**Max pooling** vezme *maximum* z okna `K × K`:

::: math
y(i, j) = \max_{a, b \in [0, K)} x(i \cdot s + a, j \cdot s + b)
:::

* **Bez parametrů** — jen agregace.
* **Translační invariance** — malý posun vstupu nezmění výstup max-pool.
* Typicky `K = 2, s = 2` — sníží rozlišení na polovinu (zhruba 2×).

### Varianty

* **Average pooling** — průměr místo maxima.
* **Global pooling** — celý feature map → 1 hodnota (před FC vrstvou).
* **Adaptive pooling** — výstup vždy fixní velikosti, ať vstup jakkoli velký.

V moderních CNN se pooling někdy nahrazuje **konvolucí se stride 2** — naučitelná downsampling operace.

## Receptive field

**Receptive field** neuronu = oblast vstupu, která může ovlivnit jeho aktivaci.

* První konvoluční vrstva (`K = 3`): receptive field `3 × 3`.
* Druhá vrstva s `K = 3` nad první: receptive field `5 × 5`.
* Třetí vrstva: `7 × 7`.

Hlubší vrstvy „vidí" *větší* oblasti vstupu. Po několika vrstvách + poolingu *jeden* neuron vidí celý obrázek.

### Strukturální výhody

* **Lokalita** je *vestavěná*.
* **Sdílení vah** přes prostor = *translačně invariantní*.
* **Hierarchie** — kompozice malých filtrů detekuje složitější vzory.

## Hierarchie feature

CNN se *automaticky* učí hierarchii reprezentací:

* **Nízké vrstvy** — hrany, gradient, textury.
* **Střední vrstvy** — kombinace hran → motivy, části objektů.
* **Vysoké vrstvy** — celé objekty, sémantické koncepty.

Analogie s biologickým **visual cortex** (V1, V2, V4, IT) — i tam je hierarchie *jednoduché → komplexní*.

Vizualizace naučených filtrů (např. Zeiler & Fergus 2014) ukazuje, že:

* První konv. vrstva: edge detectors, color blobs.
* Pozdější: oči, kola, obličejové části.

## Konvoluce v různých dimenzích

* **1D conv** — sekvence (audio, text). Popsáno v [[rnn-lstm]].
* **2D conv** — obrázky.
* **3D conv** — video (čas + 2D), volumetrická data (MRI).
* **Graph conv** — Graph Neural Networks na grafech.

## Implementace — efektivita

Konvoluce *vypadá* jako vnořené smyčky, ale to by bylo *pomalé*. V praxi se implementuje jako *maticové násobení* přes **im2col**:

1. Rozbalíme každé okno vstupu do řádku matice `X' ∈ R^{(H'W') × (K²C_in)}`.
2. Rozbalíme kernely do matice `K' ∈ R^{(K²C_in) × C_out}`.
3. Výstup `Y = X' · K' ∈ R^{(H'W') × C_out}`.

Pak je konvoluce *jedno* matmult — využije *optimalizované* GEMM (cuBLAS, MKL).

Modernější knihovny (cuDNN, MIOpen) používají *Winograd algorithm* nebo *FFT-based convolution* pro ještě rychlejší výpočet pro běžné velikosti kernelu.

## PyTorch příklad

```python
import torch.nn as nn

conv = nn.Conv2d(in_channels=3, out_channels=64, kernel_size=3, stride=1, padding=1)
pool = nn.MaxPool2d(kernel_size=2, stride=2)

# Forward
x = torch.randn(32, 3, 224, 224)   # batch=32 of RGB 224x224
h = conv(x)                          # h: [32, 64, 224, 224]  (same padding)
h = pool(h)                          # h: [32, 64, 112, 112]
```

::: link "Stanford CS231n: Convolutional Networks" "https://cs231n.github.io/convolutional-networks/"
:::

::: link "Goodfellow et al.: Deep Learning, kap. 9 — Convolutional Networks" "https://www.deeplearningbook.org/contents/convnets.html"
:::

::: link "LeCun et al.: Gradient-Based Learning Applied to Document Recognition (Proc. IEEE, 1998)" "http://yann.lecun.com/exdb/publis/pdf/lecun-98.pdf"
:::

::: link "Distill — Feature Visualization (Olah et al.)" "https://distill.pub/2017/feature-visualization/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Neural networks for structured data* (Hradiš). Externí reference: Goodfellow, I., Bengio, Y., Courville, A.: *Deep Learning* (MIT 2016), kap. 9; LeCun, Y. et al.: *Gradient-Based Learning Applied to Document Recognition* (Proc. IEEE 86, 1998); Krizhevsky, A., Sutskever, I., Hinton, G.: *ImageNet Classification with Deep CNNs* (NeurIPS 2012); Stanford CS231n.*
