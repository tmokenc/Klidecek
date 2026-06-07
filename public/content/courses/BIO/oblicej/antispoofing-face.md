---
title: Anti-spoofing pro obličej
---

# Anti-spoofing pro obličej

Systémy pro rozpoznávání obličeje (face recognition) musí *rozpoznat*, zda je před senzorem *živý člověk*, nebo *podvrh* — fotografie, video, maska či deepfake. Tento problém je známý jako **face anti-spoofing** neboli **detekce živosti (liveness detection)**. S rostoucí kvalitou útoků (silikonové masky, deepfaky) se anti-spoofing stává kritickou součástí bezpečných systémů.

## Typy útoků na rozpoznávání obličeje

::: svg "Útoky na face systémy: photo, video replay, 3D mask (paper, silicone), deepfake video, makeup/disguise."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="30" width="100" height="150" rx="6"/>
    <rect x="130" y="30" width="100" height="150" rx="6"/>
    <rect x="240" y="30" width="100" height="150" rx="6"/>
    <rect x="350" y="30" width="100" height="150" rx="6"/>
    <rect x="460" y="30" width="70" height="150" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="70" y="52">Photo</text>
    <text x="180" y="52">Video replay</text>
    <text x="290" y="52">Paper mask</text>
    <text x="400" y="52">3D silicone</text>
    <text x="495" y="52">Deepfake</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="70" y="76">printed</text>
    <text x="70" y="88">obličej</text>
    <text x="180" y="76">tablet/phone</text>
    <text x="180" y="88">replay video</text>
    <text x="290" y="76">cutout face</text>
    <text x="290" y="88">on stick</text>
    <text x="400" y="76">silicone mask</text>
    <text x="400" y="88">3D printed</text>
    <text x="495" y="76">AI synthese</text>
    <text x="495" y="88">video</text>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="70" y="112">cena: $0.50</text>
    <text x="70" y="128">obtížnost: low</text>
    <text x="70" y="144">defenze: easy</text>
    <text x="180" y="112">cena: $200</text>
    <text x="180" y="128">obtížnost: low</text>
    <text x="180" y="144">defenze: medium</text>
    <text x="290" y="112">cena: $1</text>
    <text x="290" y="128">obtížnost: low</text>
    <text x="290" y="144">defenze: easy</text>
    <text x="400" y="112">cena: $1000+</text>
    <text x="400" y="128">obtížnost: high</text>
    <text x="400" y="144">defenze: hard</text>
    <text x="495" y="112">cena: $0</text>
    <text x="495" y="128">obtížnost: medium</text>
    <text x="495" y="144">defenze: very hard</text>
  </g>
</svg>
:::

### 1. Útok fotografií (photo attack)

* Nejjednodušší způsob — útočník použije vytištěnou fotografii oběti.
* **Cena:** 0,50 $ (vytištěná fotografie).
* **Zranitelné systémy:** *všechny* čistě 2D systémy pro rozpoznávání obličeje.
* **Obrana:** snímání hloubky (depth sensing), infračervené (IR) snímání, detekce pohybu.

### 2. Přehrání videa (video replay)

* Tablet nebo telefon přehrávající *video* oběti.
* **Cena:** 200 $ (telefon) plus získání videa.
* **Zranitelné systémy:** 2D systémy doplněné o detekci pohybu (video totiž pohyb obsahuje).
* **Obrana:** detekce odlesků obrazovky, snímání hloubky.

### 3. Papírová maska s výřezem (paper mask, cutout)

* Vyříznutá fotografie obličeje nasazená na hůlce.
* **Cena:** 1 $.
* **Cíl:** napodobit pohyb (když útočník maskou pohybuje v ruce).
* **Obrana:** snímání hloubky.

### 4. Silikonová 3D maska (3D silicone mask)

* Profesionální silikonová maska s realistickou texturou, barvou a vlasy.
* **Cena:** 500–5000 $.
* **Cíl:** napodobit prostorovou (3D) strukturu skutečného obličeje.
* **Zranitelné systémy:** *většina* hloubkových 3D systémů včetně Apple Face ID (předvedeno firmou [Bkav 2017](https://www.bkav.com/about-us/bkav-news/-/journal_content/56/22600/face-id-on-iphone-x-fooled-by-bkavs-mask?ref=https://www.bkav.com/about-us/bkav-news)).
* **Obrana:** detekce *živosti* podle průtoku krve a mikrovýrazů.

### 5. Deepfake video

* Synteticky vytvořené video oběti generované umělou inteligencí.
* **Cena:** 0 $ (nástroje s otevřeným zdrojovým kódem).
* **Cíl:** výměna obličeje (face swap) v reálném čase.
* **Obrana:** specializované detektory deepfaků ([[deepfakes]]).

### 6. Líčení a převlek (makeup / disguise)

* Výrazné líčení, protetika, brýle, vousy.
* **Cena:** proměnlivá.
* **Cíl:** *vyhnutí se* rozpoznání (evasion), nikoli vydávání se za jinou osobu.
* **Obrana:** robustní vektorové reprezentace obličeje (embeddings), pravidelná opětovná registrace.

## Techniky anti-spoofingu

### Detekce živosti — pasivní (passive)

Detekce bez nutnosti součinnosti uživatele:

* **Analýza textury** — vytištěné fotografie mají *odlišnou* texturu (LBP, moaré vzory).
* **Analýza barev** — barevný gamut tiskárny se liší od skutečné kůže.
* **Analýza pohybu** — přirozené mikropohyby (dýchání, mrkání).
* **Vzory odlesků** — kůže odráží světlo jinak než papír nebo obrazovka.
* **Snímání hloubky** — rozlišení 2D a 3D struktury.
* **Infračervené snímání (IR)** — kůže odráží infračervené světlo, fotografie nikoli.

### Detekce živosti — výzva a odpověď (challenge-response)

Aktivní vyzývání uživatele:

* **Detekce mrknutí** — „dvakrát mrkněte“.
* **Otočení hlavy** — „otočte hlavu doleva a pak doprava“.
* **Úsměv** — „prosím usmějte se“.
* **Přečtení náhodného textu** — synchronizace řeči a pohybu obličeje.
* **Záblesk náhodné barvy** — obličej uživatele je osvícen náhodnými barvami a kontroluje se přirozená reakce.

### Multimodální snímání (multimodal sensing)

Kombinace více zdrojů:

* **Hloubka** (3D struktura) + **infračervené (IR)** snímání (odrazivost kůže) + **viditelné světlo** (barva a textura).
* **Apple Face ID** používá *všechny tři* zmíněné modality.
* Je obtížné podvrhnout *všechny* modality současně.

### Detekce založená na hlubokém učení (deep learning)

* Konvoluční neuronová síť (CNN) natrénovaná na *skutečných* versus *podvržených* snímcích obličejů.
* **Architektura:** ResNet, EfficientNet nebo specializované sítě jako *Patchnet*.
* **Datové sady:** OULU-NPU, ROSE-Youtu, Replay-Attack.
* **Zobecnění napříč datovými sadami (cross-dataset generalization)** je *velký problém* — model natrénovaný na jedné datové sadě selhává na nových, dosud neviděných útocích.

## Standardy

### ISO/IEC 30107 — detekce prezentačních útoků (Presentation Attack Detection, PAD)

* **Část 1:** rámec (framework) a terminologie.
* **Část 2:** datové formáty.
* **Část 3:** metodika testování.

**Klíčové metriky:**

* **APCER** (Attack Presentation Classification Error Rate) — procento podvrhů přijatých jako pravé.
* **BPCER** (Bona Fide Presentation Classification Error Rate) — procento skutečných uživatelů odmítnutých jako podvrh.

Cílem je minimalizovat obě hodnoty (typicky APCER < 1 %, BPCER < 5 %).

### Testování iBeta

[iBeta Quality Assurance](https://www.ibeta.com/) — akreditovaná laboratoř pro testování detekce živosti obličeje:

* **Úroveň 1** — základní útoky fotografií a videem.
* **Úroveň 2** — 3D masky, silikon, líčení.
* **Úroveň 3 a vyšší** — pokročilé útoky (na úrovni státních aktérů).

Apple Face ID je certifikován na úrovni iBeta Level 2.

## Konkrétní implementace

### Apple Face ID (od roku 2017)

* **Kamera TrueDepth** zachytí přes 30 000 infračervených bodů.
* **Detekce pozornosti** — vyžaduje, aby se *uživatel díval do kamery*.
* **Sledování očí (eye tracking)** — detekce pohledu.
* **Neuronová síť** natrénovaná na více než miliardě snímků *skutečných* i *falešných* obličejů.
* Certifikace **iBeta Level 2**.

Známé prolomení: silikonová maska firmy Bkav (2017) systém oklamala; Apple to opravil aktualizací firmwaru.

### Windows Hello

* **Kamera NIR** (blízké infračervené světlo) plus IR osvětlení.
* **Živost** ověřena pomocí 3D hloubky a mrkání očí.
* Microsoft vyžaduje shodu s normou *Hello Enhanced Anti-Spoofing* pro certifikaci „Windows Hello Plus“.

### Bank of America (mobilní aplikace)

* Ověření živosti obličeje pro autorizaci transakce.
* Aktivní výzva (pohyb hlavou).
* Detekce na straně serveru založená na strojovém učení (ML).

### Smile to Pay (Alibaba)

* Čína — platba pomocí naskenování obličeje.
* Kontrola živosti (úsměv, mrknutí).
* Postaveno na rozsáhlých modelech hlubokého učení firmy Alibaba.

## Slavné případy spoofingu {tier=extra}

### Prolomení iPhonu X (2017)

[Bkav](https://www.youtube.com/watch?v=i4YQRLQVixM) předvedl, že *ručně vyrobená* silikonová maska s 2D vytištěnými očima obejde Face ID.

* **Cena:** 150 $.
* **Námaha:** 9 hodin.
* Apple problém opravil aktualizací firmwaru (vylepšená kontrola živosti).

### Prolomení Galaxy S10 (2019)

* Ultrazvukový senzor otisku prstu.
* Podvrh pomocí **gumy z tužky a silikonu** — předvedl uživatel Imguru *darkshark9*.
* Samsung vydal aktualizaci firmwaru.

### Wells Fargo eyeprint (2017)

* Bankovní aplikace Wells Fargo používala sken očí podobný snímání duhovky.
* **Fotografie očí** plus makroobjektiv pro detailní záběr → prolomení.
* Funkce byla z produkce odebrána.

## Osvědčené postupy pro nasazení

1. **Multimodální snímání** — *vždy* používejte více než jen kameru ve viditelném světle.
2. **Aktivní detekce živosti** — výzva a odpověď (challenge-response).
3. **Ověření na straně serveru** — nikdy nedůvěřujte živosti vyhodnocené pouze na straně klienta.
4. **Pravidelná certifikace** (iBeta Level 2 a vyšší).
5. **Trénink na protivnících (adversarial training)** — detektor trénujte na *nových* technikách spoofingu.
6. **Průběžné aktualizace** — nové metody spoofingu se objevují pravidelně.
7. **Vícefaktorové ověření (multi-factor)** — kombinujte biometriku s PINem nebo heslem.
8. **Autentizace podle míry rizika (risk-based authentication)** — vyžadujte další ověření u transakcí s vysokou hodnotou.

## Otevřené problémy

* **Zobecnění napříč datovými sadami** — detektory natrénované na jednom typu útoku selhávají na jiných.
* **Efektivita v reálném čase** — detektory založené na hlubokém učení jsou výpočetně náročné.
* **Odolnost vůči protivníkům (adversarial robustness)** — sofistikované adversariální vstupy obcházejí detekci.
* **Detekce deepfaků** — závody ve zbrojení, deepfaky se zlepšují rychleji než detektory.
* **Uživatelská zkušenost** — příliš mnoho výzev uživatele frustruje.

---

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání obličeje. Externí reference: ISO/IEC 30107-3:2023 *Information technology — Biometric presentation attack detection — Part 3: Testing and reporting*; Liu, Y., Jourabloo, A., Liu, X.: *Learning Deep Models for Face Anti-Spoofing: Binary or Auxiliary Supervision* (CVPR 2018); Yu, Z. et al.: *Deep Learning for Face Anti-Spoofing: A Survey* (IEEE PAMI 2022); iBeta PAD testing — [ibeta.com](https://www.ibeta.com/).*
