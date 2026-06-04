---
title: Pooling a batch normalizace
---

# Pooling a batch normalizace

Konvoluční vrstva produkuje velké mapy příznaků a aktivace mohou mezi vrstvami nepříjemně „ujíždět". Dvě vrstvy to řeší: **pooling** prostorově **podvzorkuje** (zmenšuje rozlišení a dává robustnost vůči drobnému posunu) a **batch normalizace** stabilizuje a urychluje trénování tím, že normalizuje aktivace.

## Pooling (podvzorkovací vrstva)

**Pooling** agreguje hodnoty z malého lokálního okna do jediné hodnoty. Nejčastější je okno **2×2 se stride 2**, které každou prostorovou dimenzi zmenší na polovinu (zahodí 75 % aktivací). Pooling **nemá žádné učitelné parametry** — počítá pevnou funkci.

- **Max-pooling** — vybere maximum z okna. Zachovává nejsilnější odezvu (nejvýraznější příznak) a v praxi dominuje.
- **Average-pooling** — počítá průměr okna. Vyhlazuje; používá se např. jako *global average pooling* na konci sítě.

::: viz knn-pooling "Přepínej max-pooling / average-pooling a posouvej okno 2×2 (stride 2) tlačítky ◀ ▶. Vidíš, jak se vstup 4×4 zmenší na výstup 2×2; u max-poolingu je vybraná maximální buňka zvýrazněna. Pooling nemá žádné parametry."
:::

Výstupní velikost se počítá stejně jako u konvoluce, jen bez paddingu a s hloubkou beze změny (`D` zůstává):

::: math
W_{out} = \left\lfloor \frac{W_{in} - F}{S} \right\rfloor + 1, \qquad H_{out} = \left\lfloor \frac{H_{in} - F}{S} \right\rfloor + 1, \qquad D_{out} = D_{in}
:::

Hlavní přínosy: **snížení výpočetní náročnosti** (méně aktivací v dalších vrstvách), **invariance vůči malému posunu** a **zvětšení efektivního receptivního pole** hlubších vrstev.

## Batch normalizace

**Batch normalizace** (BatchNorm) normalizuje aktivace v rámci **mini-dávky** tak, aby měly nulový průměr a jednotkový rozptyl, a poté je škáluje a posouvá dvěma **učitelnými parametry** `γ` (scale) a `β` (shift). To brání tomu, aby se distribuce vstupů jednotlivých vrstev během trénování měnila (autoři tento jev nazvali *internal covariate shift*).

Pro mini-dávku `B = {x_1, …, x_m}` se spočítá průměr a rozptyl dávky, aktivace se normalizuje a nakonec afinně transformuje:

::: math
\mu_B = \frac{1}{m}\sum_{i=1}^{m} x_i, \quad \sigma_B^2 = \frac{1}{m}\sum_{i=1}^{m} (x_i - \mu_B)^2, \quad \hat{x}_i = \frac{x_i - \mu_B}{\sqrt{\sigma_B^2 + \varepsilon}}, \quad y_i = \gamma\,\hat{x}_i + \beta
:::

Malá konstanta `ε` zajišťuje numerickou stabilitu. Vrstva se obvykle vkládá **mezi lineární vrstvu (konvoluční/plně propojenou) a nelinearitu**.

Klíčové vlastnosti:

- Umožňuje **vyšší learning rate** a síť je **méně citlivá na inicializaci vah**.
- Působí jako mírná **regularizace** (šum z dávkových statistik), takže někdy nahradí dropout.
- Při **inferenci** se nepoužívají statistiky aktuální dávky, ale **populační statistiky** (běžící průměr a rozptyl nasbírané během trénování) — výstup je tak deterministický.

::: quiz "Co konkrétně se v batch normalizaci učí gradientem?"
- [ ] Průměr a rozptyl dávky `μ_B`, `σ_B²`.
  > Ne — ty se *počítají* z aktuální dávky, nejsou to učitelné parametry.
- [x] Parametry škálování `γ` a posunu `β`.
  > Správně. `γ` a `β` jsou jediné učitelné parametry vrstvy; umožní síti normalizaci v případě potřeby i částečně „vrátit".
- [ ] Velikost mini-dávky `m`.
  > Ne — `m` je hyperparametr trénování, nikoli učitelný parametr vrstvy.
:::

::: link "Ioffe & Szegedy: Batch Normalization (arXiv 1502.03167)" "https://arxiv.org/abs/1502.03167"
:::

---

*Zdroj: KNN státnicové okruhy NBIO, VUT FIT. Externí reference: Ioffe, S., Szegedy, C.: „Batch Normalization" (arXiv:1502.03167, ICML 2015); Stanford CS231n — Convolutional Neural Networks (pooling layers).*
