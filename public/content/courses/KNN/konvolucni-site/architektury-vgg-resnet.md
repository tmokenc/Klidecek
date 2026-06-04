---
title: "Architektury: VGG a ResNet"
---

# Architektury: VGG a ResNet

Dvě architektury dobře ukazují, jak se konvoluční sítě prohlubovaly. **VGG** ukázalo sílu **stohu malých 3×3 konvolucí**; **ResNet** vyřešilo, proč sítě *nešlo* libovolně prohlubovat — zavedlo **reziduální blok se skip connection**, který umožnil trénovat sítě o stovkách vrstev.

## VGG — stoh malých 3×3 konvolucí

VGG (konfigurace **VGG-16** a **VGG-19** podle počtu vrstev s vahami) staví na jednoduchém receptu: výhradně **3×3 konvoluce** (stride 1, padding 1) skládané do bloků, mezi bloky **2×2 max-pooling** (stride 2). Počet kanálů se po každém poolingu zhruba zdvojnásobuje, prostorová velikost se půlí.

Klíčová myšlenka je, že **dvě 3×3 konvoluce za sebou mají stejné receptivní pole jako jedna 5×5** (tři za sebou jako 7×7), ale s **méně parametry** a **více nelinearitami** (mezi nimi je ReLU). To dělá síť vyjadřovější a levnější než jedna velká konvoluce.

Slabina VGG: obří plně propojené vrstvy na konci dělají z VGG-16 model s přibližně **138 miliony parametrů** — drtivá většina vah sídlí právě tam.

## ResNet — reziduální blok a skip connection

S rostoucí hloubkou se objevil **degradační problém**: hlubší síť měla *vyšší* trénovací chybu než mělčí — ne kvůli přeučení, ale protože ji bylo těžké optimalizovat. ResNet to obrátil: blok se neučí přímo cílové zobrazení `H(x)`, ale jen **reziduum** `F(x) = H(x) − x`. Vstup `x` se k výstupu bloku **přičte** přes **skip (identity) connection**:

::: math
y = F(x, \{W_i\}) + x
:::

Identitní zkratka **nepřidává žádné parametry** ani výpočet (jen sčítání). Pokud je optimální vrstvu „přeskočit", stačí, aby se `F(x)` naučilo nulu — což je mnohem snazší než naučit identitu skrz stoh nelineárních vrstev.

::: svg "VGG (stoh 3×3 konvolucí) vs. reziduální blok ResNet se skip connection y = F(x) + x"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <text x="14" y="18" fill="var(--text-muted)" font-size="12">VGG: stoh 3×3 konv.</text>
  <text x="320" y="18" fill="var(--text-muted)" font-size="12">ResNet: reziduální blok</text>

  <!-- VGG stack -->
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="30" y="36" width="130" height="26" rx="3"/>
    <rect x="30" y="78" width="130" height="26" rx="3"/>
    <rect x="30" y="120" width="130" height="26" rx="3"/>
    <rect x="30" y="172" width="130" height="26" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="95" y="53">conv 3×3 + ReLU</text>
    <text x="95" y="95">conv 3×3 + ReLU</text>
    <text x="95" y="137">conv 3×3 + ReLU</text>
    <text x="95" y="189">max-pool 2×2</text>
  </g>
  <g stroke="var(--text-faint)" stroke-width="1">
    <line x1="95" y1="62" x2="95" y2="78"/>
    <line x1="95" y1="104" x2="95" y2="120"/>
    <line x1="95" y1="146" x2="95" y2="172"/>
  </g>
  <text x="95" y="222" fill="var(--text-muted)" text-anchor="middle" font-size="10">2× 3×3 ≈ pole 5×5, méně vah</text>

  <!-- ResNet residual block -->
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="350" y="40" width="120" height="24" rx="3"/>
    <rect x="350" y="92" width="120" height="24" rx="3"/>
    <circle cx="410" cy="150" r="13" fill="var(--bg-inset)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="410" y="56">conv 3×3 + ReLU</text>
    <text x="410" y="108">conv 3×3</text>
    <text x="410" y="155" font-size="14">+</text>
  </g>
  <!-- main path -->
  <g stroke="var(--text-faint)" stroke-width="1">
    <line x1="410" y1="26" x2="410" y2="40"/>
    <line x1="410" y1="64" x2="410" y2="92"/>
    <line x1="410" y1="116" x2="410" y2="137"/>
    <line x1="410" y1="163" x2="410" y2="190"/>
  </g>
  <text x="410" y="22" fill="var(--text-muted)" text-anchor="middle" font-size="10">x</text>
  <text x="410" y="205" fill="var(--text-muted)" text-anchor="middle" font-size="10">y = F(x) + x</text>
  <!-- skip connection -->
  <path d="M 410 30 H 505 V 150 H 423" fill="none" stroke="var(--accent)" stroke-width="2"/>
  <text x="512" y="92" fill="var(--accent)" font-size="10" text-anchor="middle" transform="rotate(90 512 92)">skip (identita) x</text>
  <text x="350" y="84" fill="var(--text-muted)" font-size="10">F(x)</text>
</svg>
:::

## Proč skip řeší mizející gradient

Při zpětném šíření se gradient násobí přes vrstvy; ve velmi hluboké síti se proto může exponenciálně **zmenšit** (mizející gradient) a dolní vrstvy se přestanou učit. Skip connection vytvoří **přímou cestu** pro gradient: protože `y = F(x) + x`, je derivace `∂y/∂x = ∂F/∂x + 1`. Ona **jednička** zajistí, že se gradient může šířit k dřívějším vrstvám i tehdy, když je příspěvek `∂F/∂x` malý. Síť tak jde prohloubit až na desítky a stovky vrstev (ResNet-18/34/50/101/152) bez degradace.

::: quiz "Proč reziduální blok pomáhá trénovat velmi hluboké sítě?"
- [ ] Protože skip connection přidává parametry, které zvyšují kapacitu.
  > Ne — identitní skip connection nepřidává žádné parametry. Přínos je v toku gradientu a snadnější optimalizaci, ne v kapacitě.
- [x] Skip connection dává gradientu přímou cestu (`∂y/∂x = ∂F/∂x + 1`) a usnadňuje naučit identitu.
  > Správně. Aditivní zkratka brání mizení gradientu a blok stačí naučit reziduum (klidně nulu), což je snazší než identita přes stoh nelineárních vrstev.
- [ ] Nahrazuje pooling, takže se neztrácí prostorová informace.
  > Ne — skip connection s poolingem nesouvisí; řeší optimalizaci hloubky, ne podvzorkování.
:::

::: link "He et al.: Deep Residual Learning (ResNet, arXiv 1512.03385)" "https://arxiv.org/abs/1512.03385"
:::

::: link "Simonyan & Zisserman: Very Deep ConvNets (VGG, arXiv 1409.1556)" "https://arxiv.org/abs/1409.1556"
:::

---

*Zdroj: KNN státnicové okruhy NBIO, VUT FIT. Externí reference: Simonyan, K., Zisserman, A.: „Very Deep Convolutional Networks for Large-Scale Image Recognition" (VGG, arXiv:1409.1556, ICLR 2015); He, K. et al.: „Deep Residual Learning for Image Recognition" (ResNet, arXiv:1512.03385, CVPR 2016).*
