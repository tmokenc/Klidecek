---
title: Architektury CNN — LeNet, VGG, ResNet, Inception
---

# Architektury CNN

Vývoj architektur konvolučních neuronových sítí (CNN) od jednoduchého LeNetu (1998) až po moderní transformery sleduje *exponenciální růst* hloubky, kapacity a propracovanosti.

## LeNet-5 (1998)

**Yann LeCun a kol.**, *Gradient-Based Learning Applied to Document Recognition*. Síť určená pro klasifikaci ručně psaných číslic (datová sada MNIST).

Architektura:
* `Input 32×32` → `Conv 5×5, 6 filters` → `AvgPool 2×2` → `Conv 5×5, 16 filters` → `AvgPool 2×2` → `FC 120` → `FC 84` → `FC 10 (softmax)`.

* `~60k` parametrů.
* Aktivační funkce tanh.
* Nezávislé na datové sadě ImageNet — po mnoho let šlo o *jedinou* praktickou aplikaci CNN.

## AlexNet (2012) — průlom

**Krizhevsky, Sutskever, Hinton**, *ImageNet Classification with Deep CNNs*. Vyhrála soutěž **ImageNet ILSVRC 2012** s chybou top-5 **15,3 %** (předchozí nejlepší výsledek byl 26 %).

Klíčové novinky:

* **ReLU** místo tanh / sigmoid → rychlejší trénink.
* **Dropout** v plně propojených (FC) vrstvách → regularizace.
* **Rozšiřování dat (data augmentation)** — rotace, překlopení, ořez.
* **Trénink na GPU** — *dvě* grafické karty GTX 580, 5–6 dní.
* **Local Response Normalization** (dnes nahrazená normalizací BatchNorm).
* **8 vrstev** — 5 konvolučních + 3 plně propojené, *miliony parametrů*.

To byl obrovský úspěch — odstartovala *revoluce hlubokého učení (deep learning)*. CNN se *přes noc* staly nejlepší dostupnou technikou v počítačovém vidění (computer vision).

## VGG (2014)

**Simonyan & Zisserman** (Oxford), *Very Deep Convolutional Networks*. Cílem byla maximální *jednoduchost*:

* **Pouze konvoluce 3×3** + **max pooling 2×2**.
* Hloubka **16–19 vrstev**.

::: svg "VGG-16 architektura: bloky 3×3 konv → pool, postupně se kanály zvětšují, rozlišení snižuje."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="20" y="60" width="60" height="60" rx="3"/>
    <rect x="90" y="65" width="50" height="50" rx="3"/>
    <rect x="150" y="70" width="40" height="40" rx="3"/>
    <rect x="200" y="74" width="32" height="32" rx="3"/>
    <rect x="242" y="78" width="24" height="24" rx="3"/>
    <rect x="276" y="82" width="20" height="20" rx="3"/>
    <rect x="306" y="84" width="16" height="16" rx="3"/>
    <rect x="332" y="86" width="12" height="12" rx="3"/>
    <rect x="356" y="40" width="40" height="100" rx="3"/>
    <rect x="406" y="40" width="40" height="100" rx="3"/>
    <rect x="456" y="74" width="40" height="32" rx="3"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="50" y="140">3×3×64</text>
    <text x="115" y="140">3×3×128</text>
    <text x="170" y="140">3×3×256</text>
    <text x="216" y="140">3×3×512</text>
    <text x="254" y="140">3×3×512</text>
    <text x="376" y="160">FC 4096</text>
    <text x="426" y="160">FC 4096</text>
    <text x="476" y="160">FC 1000</text>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11" font-weight="600">
    <text x="200" y="30">VGG-16 — 16 weighted layers</text>
  </g>
</svg>
:::

* **Klíčový postřeh**: dvě vrstvy `3×3` mají stejné receptivní pole (receptive field) jako jedna `5×5`, ale s *méně* parametry a *více* nelinearity.
* **Chyba top-5 7,3 %** na ImageNet 2014.
* **138 M parametrů** — *obrovský* model. Pomalý a paměťově náročný.

## GoogLeNet / Inception (2014)

**Szegedy a kol.** (Google), *Going Deeper with Convolutions*. Vyhrál ILSVRC 2014.

Klíčová myšlenka: **Inception modul** — paralelní kombinace konvolučních jader (kernel) různých velikostí.

::: svg "Inception module: 1×1, 3×3, 5×5 conv + pooling paralelně, výstupy se zřetězí v channel dimension."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="230" y="20" width="80" height="30" rx="4"/>
    <rect x="50" y="80" width="80" height="30" rx="4"/>
    <rect x="180" y="80" width="80" height="30" rx="4"/>
    <rect x="280" y="80" width="80" height="30" rx="4"/>
    <rect x="410" y="80" width="80" height="30" rx="4"/>
    <rect x="180" y="130" width="80" height="30" rx="4"/>
    <rect x="280" y="130" width="80" height="30" rx="4"/>
    <rect x="410" y="130" width="80" height="30" rx="4"/>
    <rect x="180" y="180" width="180" height="30" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="270" y="40">Input</text>
    <text x="90" y="100">1×1 conv</text>
    <text x="220" y="100">1×1 (red)</text>
    <text x="320" y="100">1×1 (red)</text>
    <text x="450" y="100">3×3 pool</text>
    <text x="220" y="150">3×3 conv</text>
    <text x="320" y="150">5×5 conv</text>
    <text x="450" y="150">1×1 conv</text>
    <text x="270" y="200" font-weight="600">Concat (channel)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <path d="M 270 50 L 90 80"/>
    <path d="M 270 50 L 220 80"/>
    <path d="M 270 50 L 320 80"/>
    <path d="M 270 50 L 450 80"/>
    <path d="M 220 110 L 220 130"/>
    <path d="M 320 110 L 320 130"/>
    <path d="M 450 110 L 450 130"/>
    <path d="M 90 110 L 200 180"/>
    <path d="M 220 160 L 230 180"/>
    <path d="M 320 160 L 310 180"/>
    <path d="M 450 160 L 350 180"/>
  </g>
</svg>
:::

* **Konvoluce 1×1** — *redukce dimenze* (snížení počtu kanálů) + nelinearita. Snížením počtu kanálů před drahou konvolucí 3×3/5×5 výrazně zlevní výpočet (tzv. bottleneck, zúžení). (Lin, Chen & Yan, *Network in Network*, 2013.)
* **Příznaky napříč měřítky (multi-scale features)** — vstup vidíme různými „brýlemi".
* **22 vrstev**, ale **jen 7 M parametrů** (oproti 138 M u VGG).
* **Pomocné klasifikátory (auxiliary classifiers)** — meziklasifikátory v hloubce sítě, které pomáhají gradientu.

Verze Inception v2, v3 a v4 přidaly *faktorizované* konvoluce a další optimalizace.

## ResNet (2015)

**He a kol.** (Microsoft Research), *Deep Residual Learning for Image Recognition*. Vyhrál ImageNet 2015 s **chybou top-5 3,6 %** — *překonal* tak lidský výkon (~5 %).

Klíčová myšlenka: **reziduální / přeskakovací spoj (residual / skip connection)**:

::: math
y = F(x; W) + x
:::

::: svg "Residual block: vstup x se 'zkratuje' přes blok, výstup je F(x) + x."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="100" y="40" width="80" height="30" rx="4"/>
    <rect x="220" y="40" width="80" height="30" rx="4"/>
    <circle cx="380" cy="55" r="14"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="40" y="59" font-weight="600">x</text>
    <text x="140" y="60">Conv + ReLU</text>
    <text x="260" y="60">Conv</text>
    <text x="380" y="60" font-weight="600">+</text>
    <text x="450" y="59" font-weight="600">y = F(x)+x</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <line x1="60" y1="55" x2="100" y2="55" marker-end="url(#resArr)"/>
    <line x1="180" y1="55" x2="220" y2="55" marker-end="url(#resArr)"/>
    <line x1="300" y1="55" x2="366" y2="55" marker-end="url(#resArr)"/>
    <line x1="394" y1="55" x2="430" y2="55" marker-end="url(#resArr)"/>
  </g>
  <g stroke="#e08a3a" stroke-width="1.7" fill="none">
    <path d="M 60 55 Q 60 130 380 130 L 380 70" stroke-dasharray="4 3"/>
  </g>
  <defs>
    <marker id="resArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="270" y="155" fill="#e08a3a" text-anchor="middle" font-size="10" font-weight="600">skip connection (identity)</text>
</svg>
:::

* **Pokud F = 0** (váhy → 0), blok se chová jako *identita* — síť se *vůbec nezhorší*.
* **Tok gradientu (gradient flow)** — zpětné šíření chyby (backpropagation) má *přímou cestu* gradientem (`∂L/∂x = ∂L/∂y · (1 + ∂F/∂x)`). Tím se vyhne mizejícímu gradientu (vanishing gradient).
* **Hloubka 152 vrstev** (ResNet-152), v některých variantách *přes 1000*.
* **Identitní bloky (identity blocks)** + **bloky se zúžením (bottleneck blocks)** (1×1 → 3×3 → 1×1).

Po ResNetu se „skip connection" stala *standardním* prvkem hlubokého učení (Transformer, U-Net, DenseNet, …).

::: viz cnn-architectures-stack "Stack vrstev pro LeNet/AlexNet/VGG/ResNet; rozměry feature map + počet parametrů na vrstvu (log barů)."
:::

## DenseNet (2017)

**Huang a kol.**, *Densely Connected Convolutional Networks*. Místo *jediného* přeskakovacího spoje bere jako vstup **všechny** předchozí vrstvy.

::: math
x_l = H_l([x_0, x_1, \dots, x_{l-1}])
:::

Velmi úsporná z hlediska parametrů — v hloubce nevznikají *žádné* redundantní reprezentace.

## EfficientNet (2019)

**Tan & Le** (Google), *Rethinking Model Scaling for CNNs*. Místo nahodilého škálování hloubky/šířky/rozlišení používá **složené škálování (compound scaling)**:

::: math
\text{depth} = \alpha^\phi, \quad \text{width} = \beta^\phi, \quad \text{resolution} = \gamma^\phi
:::

Jde o optimalizovaný kompromis mezi kapacitou a výpočetní náročností.

## Vision Transformer (ViT, 2020)

**Dosovitskiy a kol.**, *An Image is Worth 16x16 Words*. Aplikace architektury *Transformer* ([[transformer-bert]]) na obrázky:

* Rozdělit obrázek na **dlaždice (patches)** `16 × 16`.
* Každou dlaždici převést na embedding (vektorovou reprezentaci).
* Sekvenci dlaždic poslat do enkodéru Transformeru.
* Třídicí token (class token) → klasifikace.

Pro velké datové sady (*JFT-300M*, *LAION-5B*) **překonává** CNN. Pro malé datové sady zůstává CNN *lepší* — má *induktivní předpoklad (induktivní bias)* lokality, tedy přirozeně počítá s tím, že blízké body v obrázku spolu souvisí.

## Srovnání architektur

| Architektura | Rok | Vrstev | Parametry | ImageNet chyba top-5 |
| :-- | :--: | :--: | :--: | :--: |
| LeNet-5 | 1998 | 7 | 60k | (MNIST) |
| AlexNet | 2012 | 8 | 60M | 15,3 % |
| VGG-16 | 2014 | 16 | 138M | 7,3 % |
| GoogLeNet | 2014 | 22 | 7M | 6,7 % |
| ResNet-152 | 2015 | 152 | 60M | 3,6 % |
| DenseNet-201 | 2017 | 201 | 20M | 6,3 % |
| EfficientNet-B7 | 2019 | 813 | 66M | 2,9 % |
| ViT-L/16 | 2020 | 24 | 304M | 1,9 % (předtrénink na JFT) |

## Trénovací pipeline pro CNN

```python
import torch
import torchvision.transforms as T
from torchvision.models import resnet50

# Data augmentation
train_transform = T.Compose([
    T.RandomResizedCrop(224),
    T.RandomHorizontalFlip(),
    T.ColorJitter(brightness=0.4, contrast=0.4),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Model
model = resnet50(pretrained=True)
model.fc = nn.Linear(2048, num_classes)   # nahradit poslední vrstvu

# Optimizer + loss
optimizer = torch.optim.SGD(model.parameters(), lr=0.001, momentum=0.9)
criterion = nn.CrossEntropyLoss()

# Trénink
for epoch in range(epochs):
    for x, y in train_loader:
        x = train_transform(x)
        optimizer.zero_grad()
        loss = criterion(model(x), y)
        loss.backward()
        optimizer.step()
```

Podrobnosti v [[transfer-learning]].

::: link "He et al.: Deep Residual Learning for Image Recognition (CVPR, 2016)" "https://arxiv.org/abs/1512.03385"
:::

::: link "Krizhevsky et al.: ImageNet Classification with Deep CNNs (NeurIPS, 2012)" "https://papers.nips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html"
:::

::: link "Stanford CS231n — CNN Architectures (přehled)" "https://cs231n.github.io/convolutional-networks/#case"
:::

::: link "Dosovitskiy et al.: An Image is Worth 16x16 Words (ICLR, 2021)" "https://arxiv.org/abs/2010.11929"
:::

---

*Zdroj: SUI přednášky 2025/26, *Neural networks for images* (Hradiš). Externí reference: LeCun, Y. et al.: *Gradient-Based Learning Applied to Document Recognition* (Proc. IEEE 86, 1998); Krizhevsky, A. et al.: *ImageNet Classification with Deep CNNs* (NeurIPS 2012); He, K. et al.: *Deep Residual Learning for Image Recognition* (CVPR 2016); Szegedy, C. et al.: *Going Deeper with Convolutions* (CVPR 2015); Goodfellow et al.: *Deep Learning*, kap. 9.*
