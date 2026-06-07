---
title: Deep learning pro rozpoznávání obličeje
---

# Deep learning pro rozpoznávání obličeje

Deep learning přinesl v rozpoznávání obličeje (face recognition) zásadní zlom. Mezi roky 2014 (DeepFace od Facebooku) a 2020 vzrostla přesnost z přibližně 95 % na 99,9 %. Klíčem byly *velké datasety* (milióny obličejů), *konvoluční neuronové sítě* (CNN) a *speciální ztrátové funkce* (loss functions) jako triplet loss a ArcFace, které vytvářejí diskriminační vektory příznaků (embeddings) — tedy číselné reprezentace obličeje, v nichž jsou různé osoby od sebe dobře oddělené.

## Princip

::: svg "Deep learning face recognition: image → CNN backbone → embedding vector → cosine distance comparison."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aDLF" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="60" width="80" height="50" rx="4"/>
    <rect x="120" y="60" width="120" height="50" rx="4"/>
    <rect x="260" y="60" width="100" height="50" rx="4"/>
    <rect x="380" y="60" width="140" height="50" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="60" y="80" font-size="11">obraz</text>
    <text x="60" y="98" font-size="9" fill="var(--text-muted)">112×112 RGB</text>
    <text x="180" y="80" font-size="11">CNN backbone</text>
    <text x="180" y="98" font-size="9" fill="var(--text-muted)">ResNet, MobileFaceNet</text>
    <text x="310" y="80" font-size="11">embedding</text>
    <text x="310" y="98" font-size="9" fill="var(--text-muted)">128–512 dim</text>
    <text x="450" y="80" font-size="11">cosine distance</text>
    <text x="450" y="98" font-size="9" fill="var(--text-muted)">→ match score</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aDLF)">
    <path d="M100,85 L118,85"/>
    <path d="M240,85 L258,85"/>
    <path d="M360,85 L378,85"/>
  </g>
</svg>
:::

Obecný pracovní postup (workflow):

1. **Vstupní obraz** — RGB výřez obličeje (typicky 112 × 112).
2. **CNN backbone** (páteřní síť) — například ResNet50, ResNet100, MobileFaceNet nebo EfficientNet.
3. **Výstupní embedding** — vektor o 128–512 dimenzích, normalizovaný pomocí L2.
4. **Porovnání** — kosinová podobnost (cosine similarity) dvou embeddingů.

## Klíčové architektury

### DeepFace (Facebook, 2014)

[Taigman et al.](https://www.cs.toronto.edu/~ranzato/publications/taigman_cvpr14.pdf):

* Předzpracování pomocí **3D zarovnání obličeje** (3D face alignment).
* **Devítivrstvá CNN** zakončená **plně propojenou** (fully connected) vrstvou.
* Natrénováno na **4 miliónech** obrázků z Facebooku.
* **97,35 %** přesnosti na datasetu LFW — téměř na úrovni člověka (přibližně 97,5 %).

### Série DeepID (CUHK, 2014–2015)

[Sun, Wang, Tang](https://link.springer.com/chapter/10.1007/978-3-319-10599-4_50):

* Postupný vývoj DeepID1 → DeepID2 → DeepID3.
* Více CNN sítí, z nichž každá je trénována na *jiné* oblasti obličeje.
* Příznaky z jednotlivých sítí se spojují (zřetězují) dohromady.

### FaceNet (Google, 2015)

[Schroff, Kalenichenko, Philbin](https://arxiv.org/abs/1503.03832):

* CNN postavená na architektuře **Inception**.
* **Triplet loss** — explicitní učení metriky (metric learning), tedy učení samotných vzdáleností mezi obličeji.
* **128rozměrný** embedding normalizovaný pomocí L2.
* Natrénováno na přibližně **100–200 miliónech** obrázků a zhruba **8 miliónech** identit.
* **99,63 %** přesnosti na datasetu LFW.

#### Triplet loss

Klíčovou novinkou byla ztrátová funkce triplet loss:

::: math
\mathcal{L} = \sum_i \left[\|f(x_i^a) - f(x_i^p)\|_2^2 - \|f(x_i^a) - f(x_i^n)\|_2^2 + \alpha\right]_+
:::

* $x^a$ — *kotva* (anchor), referenční obrázek.
* $x^p$ — *pozitivní* vzorek (positive), stejná osoba jako kotva.
* $x^n$ — *negativní* vzorek (negative), jiná osoba.
* $\alpha$ — *odstup* (margin), typicky 0,2.

Ztrátová funkce tlačí kotvu blíže k pozitivnímu vzorku než k negativnímu, a to alespoň o hodnotu odstupu $\alpha$. Jde tedy o přímou optimalizaci *vzdáleností mezi embeddingy*.

### SphereFace, CosFace, ArcFace (2017–2018)

Rodina ztrátových funkcí založených na *úhlovém odstupu* (angular margin). Představují nejlepší současný přístup k rozpoznávání obličeje.

#### ArcFace (Deng et al. 2018)

[ArcFace](https://arxiv.org/abs/1801.07698) — dnešní standard:

::: math
\mathcal{L} = -\log \frac{e^{s \cdot \cos(\theta_{y_i} + m)}}{e^{s \cdot \cos(\theta_{y_i} + m)} + \sum_{j \neq y_i} e^{s \cdot \cos\theta_j}}
:::

* $\theta_{y_i}$ — úhel mezi embeddingem a středem třídy (class center).
* $m$ — *úhlový odstup* (angular margin), typicky 0,5 rad.
* $s$ — *měřítko* (scale), typicky 64.

ArcFace explicitně vynucuje *úhlové oddělení* jednotlivých tříd a má čistou geometrickou interpretaci. Dosahuje **99,83 %** na datasetu LFW.

::: viz arcface-margin "2D angular embedding: šedé čáry jsou pevné hranice mezi centry tříd; posuňte margin m (ArcFace) a sledujte barevný čárkovaný margin oblouk a logity v tabulce."
:::

## Standardní benchmarky

### LFW (Labeled Faces in the Wild)

* 13 233 obrázků, 5 749 osob, snímky v *nekontrolovaných* (reálných) podmínkách.
* Testování: 6 000 dvojic.
* **Přesnost člověka:** 97,5 %.
* **Moderní deep learning:** 99,85 % (saturováno, dataset už není výzvou).

### MegaFace

* 4,7 miliónu obrázků, 670 tisíc celebrit.
* Test: identifikovat *hledanou* osobu (probe) mezi miliónem rušivých identit (distractors).
* Realističtější úloha; moderní deep learning zde dosahuje stále přibližně 95 % rank-1.

### IJB-A, IJB-B, IJB-C

* Série benchmarků IARPA Janus Benchmark.
* Reálné podmínky bez omezení, snímky z více kamer.
* V současnosti aktivně používaný výzkumný benchmark.

### NIST FRVT

* Průběžně probíhající testování, *průmyslový standard* pro hodnocení dodavatelů.
* Vykazuje: verifikaci 1:1, identifikaci 1:N a demografické vlivy.

## Tréninkové datasety

* **CASIA-WebFace** — 500 tisíc obrázků, 10 tisíc identit (veřejný).
* **MS-Celeb-1M** — 10 miliónů obrázků (*stažen* kvůli problémům se soukromím).
* **VGGFace2** — 3,3 miliónu obrázků, 9 tisíc identit.
* **Glint360K** — 17 miliónů obrázků, 360 tisíc identit.
* **WebFace260M** — 260 miliónů obrázků, 4 milióny identit (největší veřejný dataset).

> **Otázka soukromí:** Mnoho datasetů je *staženo* z webu bez souhlasu dotčených osob. Evropský GDPR a kalifornský CCPA si vynucují přehodnocení této praxe. Řada akademických datasetů byla po roce 2018 stažena.

## Výpočetní nároky

| Model | Velikost | Inference (CPU) | Dimenze embeddingu |
| :--- | :---: | :---: | :---: |
| MobileFaceNet | 1 MB | 10 ms | 128 |
| ResNet50 ArcFace | 100 MB | 100 ms | 512 |
| ResNet100 ArcFace | 250 MB | 200 ms | 512 |

Pro **koncová zařízení** (edge devices, tedy mobily a IoT) se upřednostňuje MobileFaceNet. Pro **běh na serveru** se pro maximální přesnost volí ResNet100 a větší.

## Reálná nasazení

### Apple Face ID

* Snímání pomocí **TrueDepth** ([[snimani-oblicej]]).
* Zpracování probíhá **přímo na zařízení** v zabezpečeném koprocesoru Secure Enclave.
* Vlastní *hluboká neuronová síť* (proprietární).
* FAR (míra chybného přijetí): 1 ku 1 miliónu; FRR (míra chybného odmítnutí): 1 ku 1000 (dle výrobce).

### Google FaceUnlock

* **Pixel 4** (2019) — kombinace IR, RGB a ToF.
* Porovnávání probíhá na zařízení, šablony se ukládají v prostředí Trusty TEE.
* FAR: 1 ku 50 000 (méně přísné než u Applu).

### Microsoft Windows Hello

* Vyžaduje **NIR (blízce infračervené) kamery** (fotografie tak nelze podvrhnout).
* Backend založený na deep learningu.
* Šablony se ukládají v čipu TPM.

### Dohled — Clearview AI

* **Staženo přes 3 miliardy** obrázků ze sociálních sítí (podle GDPR pravděpodobně nelegálně).
* Porovnávání založené na deep learningu.
* Prodáváno bezpečnostním složkám.
* V EU **zakázáno**, žalováno, v USA částečně omezeno.

### Aadhaar (Indie)

* 1,3 miliardy registrovaných osob.
* Rozpoznávání obličeje deep learningem v kombinaci s duhovkou a otiskem prstu.
* Identifikační systém v masovém měřítku.

## Demografické vlivy (zaujatost)

[NIST FRVT Part 3 (2019)](https://pages.nist.gov/frvt/reports/demographics/annexes/annex_16.pdf):

* Míry chybného přijetí (false positive) jsou *vyšší* u obličejů s tmavší pletí.
* Ženské obličeje mají vyšší FRR než mužské.
* Děti (do 18 let) mají *výrazně* vyšší chybovost než dospělí.
* Mezi dodavateli existují rozdíly — nejlepší algoritmy mají menší disparity.

**Příčina:** nevyváženost tréninkových dat (silně vychýlená směrem k bílým dospělým mužům).

**Zmírnění:** vyvážené datasety, trénink zohledňující férovnost (fairness-aware training) a prahové hodnoty specifické pro jednotlivé demografické skupiny.

## Limity rozpoznávání obličeje deep learningem

* **Adversariální příklady** (adversarial examples) — drobné úpravy obrazu mohou způsobit chybnou klasifikaci ([[antispoofing-face]]).
* **Deepfakes** — synteticky vytvořené obličeje ([[deepfakes]]).
* **Stárnutí** — embeddingy se v průběhu pěti a více let posouvají.
* **Zaujatost (bias)** — demografické rozdíly.
* **Soukromí** — embeddingy jsou *kvaziidentifikátory* (umožňují osobu znovu identifikovat pomocí zpětného vyhledávání).
* **Černá skříňka** — nízká interpretovatelnost; je obtížné zjistit, *proč* síť rozhodla o shodě.

## Trendy 2025

* **Multimodální fúze** — kombinace obličeje, duhovky a hlasu pro vyšší přesnost.
* **Odolnost vůči adversariálním útokům** — obrana proti útokům.
* **Federované učení** (federated learning) — trénink přímo na zařízeních uživatelů bez sdílení surových dat.
* **Syntetická tréninková data** — chrání soukromí (obličeje generované sítí StyleGAN).
* **Sebeřízené předtrénování** (self-supervised pretraining) — menší závislost na ručně označených datech.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=BCBZPtZCI7w" "Geometric Face Recognition - Computerphile" "Computerphile"
:::

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání obličeje. Externí reference: Taigman, Y. et al.: *DeepFace: Closing the Gap to Human-Level Performance in Face Verification* (CVPR 2014) — [PDF](https://www.cs.toronto.edu/~ranzato/publications/taigman_cvpr14.pdf); Schroff, F., Kalenichenko, D., Philbin, J.: *FaceNet: A Unified Embedding for Face Recognition and Clustering* (CVPR 2015) — [arXiv](https://arxiv.org/abs/1503.03832); Deng, J. et al.: *ArcFace: Additive Angular Margin Loss for Deep Face Recognition* (CVPR 2019) — [arXiv](https://arxiv.org/abs/1801.07698); NIST FRVT Ongoing — [pages.nist.gov/frvt](https://pages.nist.gov/frvt/).*
