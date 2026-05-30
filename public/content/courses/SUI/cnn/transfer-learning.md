---
title: Transfer learning, pre-training a augmentace
---

# Transfer learning a pre-training

Trénink CNN *od nuly* vyžaduje *miliony* labelovaných obrázků (ImageNet) a *dny GPU času*. **Transfer learning** umožňuje *recyklovat* naučenou znalost a dosáhnout dobrých výsledků s *malým* datasetem.

## Princip transfer learningu

::: svg "Transfer learning: pre-training na velkém datasetu → fine-tuning na specifické úloze s malými daty."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="30" y="30" width="220" height="60" rx="6"/>
    <rect x="30" y="120" width="220" height="60" rx="6"/>
    <rect x="280" y="30" width="220" height="60" rx="6"/>
    <rect x="280" y="120" width="220" height="60" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="140" y="52" font-weight="600">1. Pre-training</text>
    <text x="140" y="72" font-size="10" fill="var(--text-muted)">ImageNet (1M+ obr.)</text>
    <text x="390" y="52" font-weight="600">2. Fine-tuning</text>
    <text x="390" y="72" font-size="10" fill="var(--text-muted)">vlastní úloha (1k obr.)</text>
    <text x="140" y="142" font-weight="600">Naučí: edges, textures, parts</text>
    <text x="140" y="162" font-size="10" fill="var(--text-muted)">univerzální vizuální features</text>
    <text x="390" y="142" font-weight="600">Specifické rozhodování</text>
    <text x="390" y="162" font-size="10" fill="var(--text-muted)">jen pár vrstev (nebo všechny)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <line x1="250" y1="60" x2="280" y2="60" marker-end="url(#tlArr)"/>
  </g>
  <defs>
    <marker id="tlArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="265" y="55" fill="var(--text-muted)" font-size="9">váhy</text>
</svg>
:::

Pre-trained model (např. ResNet-50 na ImageNet) má naučené **univerzální vizuální features**:

* **Nízké vrstvy** — hrany, gradienty, textury. *Univerzální* pro libovolnou vizuální úlohu.
* **Střední vrstvy** — části objektů, motivy.
* **Vysoké vrstvy** — celé objekty. *Specifické* pro ImageNet (1000 tříd).

Pro novou úlohu (např. „kočka × pes × pták × ryba"):

1. **Načti** pre-trained model.
2. **Nahraď** poslední (klasifikační) vrstvu vlastní `FC` pro `K = 4` třídy.
3. **Trénuj** na vlastních datech.

## Tři varianty

### 1. Feature extraction

* **Zmrazit** všechny pre-trained vrstvy (`requires_grad = False`).
* Trénovat *jen* nově přidanou výstupní vrstvu.
* **Velmi rychlé** (jen poslední vrstva má gradienty).
* Funguje, pokud cílová úloha je *podobná* pre-trainingové.

```python
model = torchvision.models.resnet50(pretrained=True)
for param in model.parameters():
    param.requires_grad = False
model.fc = nn.Linear(2048, num_classes)   # nová klasifikační hlava

# Trénuj pouze fc
optimizer = torch.optim.SGD(model.fc.parameters(), lr=0.01)
```

### 2. Fine-tuning

* **Trénuj všechny** vrstvy, ale s **malým learning rate** (`1e-4` až `1e-5`).
* Pre-trained váhy se *jemně přizpůsobí* novým datům.
* Vyžaduje *víc* dat než feature extraction (jinak overfit).

```python
model = torchvision.models.resnet50(pretrained=True)
model.fc = nn.Linear(2048, num_classes)

# Trénuj všechno s malým lr
optimizer = torch.optim.SGD(model.parameters(), lr=1e-4, momentum=0.9)
```

### 3. Different learning rates

* **Late layers** mají vyšší lr (rychlejší přizpůsobení).
* **Early layers** mají *velmi* nízký lr (jen jemné doladění).

```python
optimizer = torch.optim.SGD([
    {"params": model.layer1.parameters(), "lr": 1e-6},
    {"params": model.layer2.parameters(), "lr": 1e-5},
    {"params": model.layer3.parameters(), "lr": 1e-4},
    {"params": model.layer4.parameters(), "lr": 1e-3},
    {"params": model.fc.parameters(),     "lr": 1e-2},
])
```

## Self-supervised pre-training

Pre-training nemusí být **supervised**. Self-supervised techniky využívají struktury *bez labelů*:

* **Predikce kontextu** — předpověz okolí pixelu.
* **Inpainting** — vyplň chybějící části obrázku.
* **Colorization** — z grayscale predikovat barvy.
* **Rotation prediction** — předpověz, o kolik je obrázek rotovaný.
* **Contrastive learning** — SimCLR, MoCo. „Pull together" augmentace téhož obrázku, „push apart" jiných obrázků.
* **Masked image modeling** — MAE (Masked Autoencoders, He et al. 2022). Náhodně zamaskuj 75 % patches, predikuj.

Self-supervised pre-training dokáže nasycovat z *gigabajtových* unlabeled datasetů, zatímco klasický ImageNet už je pro některé domény *malý*.

## Data augmentation

Synteticky **rozšíříme** trénovací sadu **label-preserving** transformacemi.

### Geometrické

* **Flip** — horizontální (téměř vždy) / vertikální (záleží na úloze, např. *ano* pro letecké snímky, *ne* pro tváře).
* **Rotation** — náhodný úhel `±15°` (často `±30°` pro robustnější model).
* **Crop & Resize** — náhodný crop, pak resize na fixní velikost.
* **Affine transformace** — translation, scaling, shear.

### Fotometrické

* **Color jitter** — náhodné posuny jasu, kontrastu, sytosti, hue.
* **Gaussian noise** — drobný šum na pixely.
* **Random erasing** — náhodně vymazat obdélníkový region (simulace překrytí).
* **Cutout** — vystřihnutí čtvercového bloku, vyplnění černou.

### Pokročilé

* **Mixup** (Zhang et al., 2017) — lineární kombinace dvou obrázků a jejich labelů.

::: math
\tilde{x} = \lambda x_1 + (1-\lambda) x_2, \quad \tilde{y} = \lambda y_1 + (1-\lambda) y_2
:::

* **CutMix** (Yun et al., 2019) — vyřízne patch z jednoho obrázku, vloží do druhého. Label proporcionální k ploše.
* **AutoAugment** (Cubuk et al., 2018) — *naučená* augmentace policy.
* **RandAugment** — zjednodušená AutoAugment, populární default.

### Implementace v PyTorch

```python
import torchvision.transforms as T

train_transform = T.Compose([
    T.RandomResizedCrop(224, scale=(0.6, 1.0)),
    T.RandomHorizontalFlip(),
    T.ColorJitter(brightness=0.4, contrast=0.4, saturation=0.4),
    T.RandomGrayscale(p=0.2),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),  # ImageNet stats
    T.RandomErasing(p=0.25),
])

val_transform = T.Compose([
    T.Resize(256),
    T.CenterCrop(224),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])
```

Validační transformace je *deterministická* (jen normalizace + resize). Augmentace pouze na trénink.

## Active learning

Když je labelování *drahé* (např. lékařské obrázky vyžadují *radiologa*), chceme labelovat *jen* nejvíce *užitečné* příklady.

::: svg "Active learning loop: model navrhne hard examples, expert je labeluje, model se znovu trénuje."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="30" y="30" width="100" height="50" rx="6"/>
    <rect x="200" y="30" width="140" height="50" rx="6"/>
    <rect x="410" y="30" width="100" height="50" rx="6"/>
    <rect x="200" y="130" width="140" height="50" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="80" y="60">Trénink</text>
    <text x="270" y="50">Predikce + uncertainty</text>
    <text x="270" y="68" font-size="9" fill="var(--text-muted)" font-weight="400">na unlabeled poolu</text>
    <text x="460" y="60">Vyber hard</text>
    <text x="270" y="150">Expert labeluje</text>
    <text x="270" y="168" font-size="9" fill="var(--text-muted)" font-weight="400">jen vybrané příklady</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="130" y1="55" x2="200" y2="55" marker-end="url(#aalArr)"/>
    <line x1="340" y1="55" x2="410" y2="55" marker-end="url(#aalArr)"/>
    <line x1="460" y1="80" x2="460" y2="155" stroke-dasharray="3 2"/>
    <line x1="460" y1="155" x2="340" y2="155" marker-end="url(#aalArr)"/>
    <line x1="200" y1="155" x2="80" y2="80" marker-end="url(#aalArr)"/>
  </g>
  <defs>
    <marker id="aalArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M 0 0 L 6 4 L 0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

Strategie:

* **Uncertainty sampling** — vyber obrázky, kde má model *nejistou* predikci (entropy, margin).
* **Query by committee** — *ensemble* modelů; vyber, kde se *neshodují*.
* **Diversity sampling** — vyber *různé* příklady, ne klastery podobných.

Reálné výsledky: *aktivní* selekce dokáže dosáhnout stejné performance s *10×* menším labelovaným datasetem.

## Domain adaptation

**Cílová doména** se liší od **zdrojové domény** (např. fotografie vs. obrazy generované syntetickým renderem).

* **Naive transfer** často selhává — features se *naučí* ImageNet-specifické vzory, které v jiné doméně chybí.
* **Adversarial domain adaptation** (Ganin & Lempitsky, 2015) — *discriminator* nedokáže rozlišit features ze zdrojové a cílové domény.
* **Style transfer-based** — transform target → source style.

## Knowledge distillation

Velký „učitel" model trénuje malého „studenta":

* Učitel produkuje *soft labels* — probability distribution přes třídy.
* Student se učí *napodobit* tyto soft labels.
* Soft labels obsahují *více informace* než hard labels (relations mezi třídami).

Použití: nasazení modelů na *mobile*, *edge* zařízeních.

## Federated learning

Distribuované učení na *privátních* datech.

* Lokální zařízení trénují na svých datech.
* Posílají *jen update vah* (nebo gradient) na server.
* Server *agreguje*.
* Data **neopouštějí** zařízení.

Použití: Gboard (Google klávesnice), prediktivní psaní v iOS (Apple QuickType).

## Co může selhat

* **Negative transfer** — pre-training data se *velmi liší* od target → model se zhorší.
* **Catastrophic forgetting** — fine-tuning *přepíše* užitečné předchozí features. Zachování přes EWC, replay buffer.
* **Over-augmentation** — pokud augmentace *mění* sémantiku (např. horizontální flip zničí informaci o stranách (levá/pravá)), label-noise → horší výsledek.

::: link "Goodfellow et al.: Deep Learning, kap. 15 — Representation Learning" "https://www.deeplearningbook.org/"
:::

::: link "Pan, S. J., Yang, Q.: A Survey on Transfer Learning (IEEE TKDE, 2010)" "https://ieeexplore.ieee.org/document/5288526"
:::

::: link "He et al.: Masked Autoencoders Are Scalable Vision Learners (CVPR, 2022)" "https://arxiv.org/abs/2111.06377"
:::

::: link "torchvision.models — pre-trained modely v PyTorch" "https://pytorch.org/vision/stable/models.html"
:::

---

*Zdroj: SUI přednášky 2025/26, *Neural networks — generalizace* (Hradiš). Externí reference: Pan, S. J. & Yang, Q.: *A Survey on Transfer Learning* (IEEE TKDE 22, 2010); Goodfellow, I. et al.: *Deep Learning*, kap. 15; He, K. et al.: *Masked Autoencoders* (CVPR 2022); Settles, B.: *Active Learning Literature Survey* (UW-Madison, 2009).*
