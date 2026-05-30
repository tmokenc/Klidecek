---
title: CNN aplikace — detekce, segmentace, regrese
---

# CNN aplikace

CNN nejsou jen klasifikátory obrázků. *Stejnou* architekturu lze přizpůsobit pro **detekci objektů**, **segmentaci**, **pose estimation**, **regresi souřadnic** a další úlohy.

## Image klasifikace — baseline

* **Vstup**: obrázek `H × W × 3`.
* **Výstup**: pravděpodobnost přes `K` tříd.
* **Loss**: cross-entropy.
* **Architektury**: ResNet, EfficientNet, ViT.

Klasické úlohy: ImageNet (1000 tříd), CIFAR-10/100, MNIST.

## Facial alignment — regrese souřadnic

::: svg "Facial alignment: vstup je výřez tváře, výstup je 5-68 keypoint souřadnic (x, y)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <rect x="40" y="40" width="120" height="120" rx="8"/>
    <rect x="200" y="60" width="160" height="80" rx="4"/>
    <rect x="400" y="40" width="120" height="120" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="32" font-weight="600">Vstup</text>
    <text x="280" y="100" font-weight="600">CNN</text>
    <text x="460" y="32" font-weight="600">Výstup</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="100" y="180">tvář 96×96</text>
    <text x="460" y="180">keypoints (x, y)</text>
  </g>
  <g fill="var(--accent)">
    <circle cx="80" cy="80" r="2.5"/>
    <circle cx="115" cy="80" r="2.5"/>
    <circle cx="100" cy="120" r="2.5"/>
    <circle cx="85" cy="140" r="2.5"/>
    <circle cx="115" cy="140" r="2.5"/>
  </g>
  <g fill="var(--accent)">
    <circle cx="440" cy="80" r="2.5"/>
    <circle cx="475" cy="80" r="2.5"/>
    <circle cx="460" cy="120" r="2.5"/>
    <circle cx="445" cy="140" r="2.5"/>
    <circle cx="475" cy="140" r="2.5"/>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="160" y1="100" x2="200" y2="100" marker-end="url(#flowArr)"/>
    <line x1="360" y1="100" x2="400" y2="100" marker-end="url(#flowArr)"/>
  </g>
  <defs>
    <marker id="flowArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

* **Vstup**: tvář (např. `96 × 96`).
* **Výstup**: `2K` souřadnic pro `K` keypointů (`x₁, y₁, ..., x_K, y_K`).
* **Loss**: MSE.
* **Architektura**: CNN + FC na konci místo klasifikační softmax.

Použití: face recognition (alignment), animace, AR filtry. Datasety: 300-W, AFLW.

## Object detection

**Úkol**: najdi *všechny* objekty v obrázku, klasifikuj je a urči *bounding box*.

### Two-stage detektory

#### R-CNN (Girshick et al., 2014)

* **Region proposals** — selektivní search najde ~2000 kandidátních boxů.
* Pro každý box: CNN extrahuje features → SVM klasifikátor + regrese bbox.
* **Pomalý** — CNN forward pass pro každý z 2000 regionů (=> velmi pomalé, ~2000 forward passů na obrázek).

#### Fast R-CNN (Girshick, 2015)

* Vstupní obrázek → **jeden** forward pass CNN → feature map.
* **RoI pooling** — pro každou region proposal vyřízne odpovídající oblast z feature map a převede ji na fixní velikost.
* Multi-task loss (classification + bbox regression).

#### Faster R-CNN (Ren et al., 2015)

* Region proposals **také naučené** — *Region Proposal Network* (RPN).
* End-to-end trénovatelné.

Two-stage: *pomalejší*, ale **vysoká přesnost**.

### One-stage detektory

#### YOLO — You Only Look Once (Redmon et al., 2016)

* Rozdělí obrázek na grid `S × S`.
* Každá buňka predikuje `B` bounding boxů + confidence + class probabilities.
* **Jediný** forward pass, *real-time* (45-150 FPS).

#### SSD — Single Shot Detector (Liu et al., 2016)

* Predikce v *více* hloubkových úrovních (multi-scale).
* **Anchor boxes** — předefinované velikosti pro každou pozici.

::: svg "Convolutional object detection: per-pixel + per-anchor predikce."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="30" y="30" width="180" height="160" rx="6"/>
    <rect x="270" y="30" width="120" height="50" rx="4"/>
    <rect x="410" y="30" width="120" height="50" rx="4"/>
    <rect x="270" y="100" width="120" height="50" rx="4"/>
    <rect x="410" y="100" width="120" height="50" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="120" y="50">Vstupní obrázek</text>
  </g>
  <g fill="var(--accent)" opacity="0.4">
    <rect x="40" y="60" width="160" height="120"/>
  </g>
  <g stroke="var(--accent)" stroke-width="1" fill="none" opacity="0.6">
    <line x1="80" y1="60" x2="80" y2="180"/>
    <line x1="120" y1="60" x2="120" y2="180"/>
    <line x1="160" y1="60" x2="160" y2="180"/>
    <line x1="40" y1="90" x2="200" y2="90"/>
    <line x1="40" y1="120" x2="200" y2="120"/>
    <line x1="40" y1="150" x2="200" y2="150"/>
  </g>
  <rect x="60" y="80" width="70" height="80" stroke="#e08a3a" stroke-width="2" fill="none"/>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="330" y="50">Class softmax</text>
    <text x="330" y="68" fill="var(--text-muted)" font-size="9">{cat, dog, ...}</text>
    <text x="470" y="50">Bbox regression</text>
    <text x="470" y="68" fill="var(--text-muted)" font-size="9">(x, y, w, h)</text>
    <text x="330" y="120">Confidence</text>
    <text x="330" y="138" fill="var(--text-muted)" font-size="9">p(object)</text>
    <text x="470" y="120">Anchor box</text>
    <text x="470" y="138" fill="var(--text-muted)" font-size="9">předefinovaný</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="210" y1="60" x2="270" y2="55"/>
    <line x1="210" y1="90" x2="270" y2="125"/>
    <line x1="210" y1="60" x2="410" y2="55"/>
    <line x1="210" y1="90" x2="410" y2="125"/>
  </g>
  <text x="270" y="210" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">Pro každou (buňka, anchor) → predikce.</text>
</svg>
:::

### Moderní detektory

* **EfficientDet** (2020) — efficient compound scaling.
* **DETR** (Carion et al., 2020) — *DEtection TRansformer*. Bez NMS, bez anchorů. End-to-end set prediction přes Hungarian matching.
* **YOLOv5/v8** — produkční optimalizace.

### Metriky pro detekci

* **IoU** (Intersection over Union) — překryv predikce a ground truth.
* **mAP** (mean Average Precision) — průměrná přesnost přes IoU prahy a třídy. Klasická metrika na COCO datasetu.

## Sémantická segmentace

**Úkol**: každému *pixelu* přiřaď třídu.

### Fully Convolutional Networks (FCN, 2015)

**Long et al.** Nahradí FC vrstvy konvolučními, abychom dostali *output map* místo skalárního výstupu.

* **Encoder** — postupně snižuje rozlišení, zvyšuje hloubku.
* **Decoder** — upsampluje zpět na *vstupní* rozlišení.
* **Skip connections** — propojuje stejné rozlišení encoder/decoder.

### U-Net (2015)

**Ronneberger et al.** Pro medicínské obrázky. *U-shape*:

* Encoder downsampling + decoder upsampling.
* Konkatenace skip connections (full feature maps).
* Velmi efektivní pro malé datasety.

### Moderní

* **DeepLab** — atrous convolution, ASPP.
* **Mask R-CNN** — instance segmentace (každý objekt zvlášť, nejen třída).
* **Segment Anything Model (SAM)** — Meta, 2023. Promptable segmentation.

## Pose estimation

**Úkol**: predikuj polohu *kloubů* člověka v obrázku.

### DeepPose (2014)

**Toshev & Szegedy** (Google). Přímá regrese souřadnic kloubů přes CNN.

### OpenPose (2017)

**Cao et al.** *Bottom-up* — detekuje *všechny* klouby, pak je propojuje:

* **Part Confidence Maps** — heatmapa pravděpodobnosti pro každý kloub.
* **Part Affinity Fields** (PAF) — vektorová mapa „směr ke spojení" mezi klouby.

Použití: AR fitness apps, sledování sportovců, gesture recognition.

## Image-to-Image

Vstup *i* výstup jsou *obrázky*. Příklady:

* **Super-resolution** — `64 × 64` → `256 × 256`.
* **Style transfer** — Gatys et al. (2015). Aplikace stylu jednoho obrázku na obsah druhého.
* **Image-to-image translation** — pix2pix (Isola et al., 2017). Conditional GAN.
* **CycleGAN** (Zhu et al., 2017) — nepárová (unpaired) translation (foto → Monet).

## Generativní modely

CNN se používají i v **generativních** modelech:

* **GAN** (Goodfellow, 2014) — generator + discriminator hrají min-max hru.
* **VAE** (Kingma & Welling, 2013) — variational autoencoder.
* **Diffusion models** (Ho et al., 2020) — postupné denoising. Stable Diffusion, DALL-E 2, Midjourney.

Detail je *nad rámec* této kapitoly — viz CS236 (Stanford Deep Generative Models).

## OCR — rozpoznávání textu

Spojuje CNN (visual features) a sequence models (RNN/Transformer):

* CNN extrahuje features z obrázku.
* RNN/CTC dekoduje sekvenci znaků.

Příklady: Tesseract (klasické), modernější end-to-end deep learning OCR.

## Medicínské zobrazování

* **Klasifikace** — rakovina, COVID v RTG/CT.
* **Detekce** — léze, nádory, anatomické struktury.
* **Segmentace** — orgány, tumors pre-operative planning.

Specifika: *malé datasety*, *high stakes* (chyba = lidský život), *interpretabilita* je důležitější než přesnost.

## Real-world considerations

### Inference speed

* **Mobile / edge** — MobileNet, EfficientNet (compound scaling).
* **Quantization** — int8 místo fp32, 4× zrychlení.
* **Pruning** — odebrání nedůležitých vah.
* **Knowledge distillation** — menší model napodobí velký.

### Robustnost

* **Adversariální útoky** — drobná modifikace pixelů → klasifikace selže (Szegedy et al., 2013).
* **Distribuční shift** — síť trénovaná za dne nefunguje v noci.
* **Out-of-distribution** detection — zda input je „normální" nebo *anomálie*.

::: link "Goodfellow et al.: Deep Learning, kap. 9 + 12" "https://www.deeplearningbook.org/"
:::

::: link "Stanford CS231n: Detection + Segmentation" "https://cs231n.github.io/"
:::

::: link "Ronneberger et al.: U-Net (MICCAI, 2015)" "https://arxiv.org/abs/1505.04597"
:::

::: link "Carion et al.: End-to-End Object Detection with Transformers (DETR, ECCV 2020)" "https://arxiv.org/abs/2005.12872"
:::

::: link "Detectron2 — produkční detekce + segmentace framework" "https://github.com/facebookresearch/detectron2"
:::

---

*Zdroj: SUI přednášky 2025/26, *CNN applications* (Hradiš). Externí reference: Goodfellow, I., Bengio, Y., Courville, A.: *Deep Learning* (MIT 2016), kap. 9 + 12; Girshick, R. et al.: *Rich Feature Hierarchies* (R-CNN, CVPR 2014); Long, J. et al.: *Fully Convolutional Networks for Semantic Segmentation* (CVPR 2015); Ronneberger, O. et al.: *U-Net* (MICCAI 2015); Stanford CS231n.*
