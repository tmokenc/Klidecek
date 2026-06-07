---
title: Rozpoznávání hlasu (speaker recognition)
---

# Rozpoznávání hlasu (speaker recognition)

**Rozpoznávání mluvčího (speaker recognition)** identifikuje *osobu* podle jejího hlasu. Liší se od **rozpoznávání řeči (speech recognition)**, které rozpoznává *obsah* řeči — rozpoznávání mluvčího cílí na to, *kdo* mluví, nikoli na to, *co* říká. Hlas je *behaviorální* biometrika, jež kombinuje anatomické složky (velikost hlasového ústrojí) a behaviorální složky (intonace, rytmus).

## Anatomie hlasového aparátu

::: svg "Hlasový aparát: pleura → trachea → larynx (hlasivky) → pharynx → ústní/nosní dutina (resonant cavities) → výstup."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="rgba(200,180,150,0.5)" stroke="var(--accent)" stroke-width="1.5">
    <path d="M180,180 L180,150 L200,140 L240,90 L290,70 L320,75 L340,90 L355,130 L340,170 L290,200 Z"/>
  </g>
  <g fill="rgba(220,150,100,0.5)" stroke="var(--accent)" stroke-width="1">
    <ellipse cx="240" cy="120" rx="15" ry="20"/>
    <ellipse cx="200" cy="160" rx="12" ry="15"/>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10.5">
    <text x="370" y="80">resonance cavities</text>
    <text x="370" y="95" font-size="9.5" fill="var(--text-muted)">ústní, nosní</text>
    <text x="370" y="120">larynx (hlasivky)</text>
    <text x="370" y="135" font-size="9.5" fill="var(--text-muted)">vocal cords</text>
    <text x="370" y="160">pharynx (hltan)</text>
    <text x="370" y="185">trachea</text>
  </g>
  <g stroke="var(--text-muted)" stroke-width="0.7" fill="none">
    <path d="M325,80 L365,80"/>
    <path d="M255,120 L365,120"/>
    <path d="M215,160 L365,160"/>
  </g>
</svg>
:::

* **Hrtan (larynx)** s **hlasivkami (vocal cords)** — primární zdroj výšky tónu (pitch).
* **Hltan (pharynx), ústní dutina (oral cavity), nosní dutina (nasal cavity)** — *rezonanční dutiny*, které utvářejí tvar spektra.
* **Jazyk (tongue), rty (lips)** — artikulátory.
* **Měkké patro (velum)**.

Co určuje individualitu hlasu:
* **Anatomické rysy:** velikost dutin, délka a hmotnost hlasivek.
* **Behaviorální rysy:** styl řeči, přízvuk, rytmus, intonace.

## Režimy rozpoznávání mluvčího

### Text-dependent (závislé na textu)

* Uživatel vysloví *konkrétní* frázi (např. „My voice is my password").
* Vyšší přesnost.
* Používá se v *hlasové biometrii pro telefonní bankovnictví*.

### Text-independent (nezávislé na textu)

* Uživatel mluví o *libovolném* obsahu.
* Nižší přesnost, ale větší flexibilita.
* Používá se ve *forenzní* praxi a při *sledování*.

### Text-prompted (s vyžádaným textem)

* Systém vyzve uživatele k vyslovení náhodné fráze, kterou uživatel zopakuje.
* Slouží jako ochrana proti podvržení (anti-spoofing) — brání použití předem nahraného zvuku.

## Zpracovatelský řetězec rozpoznávání mluvčího

::: svg "Pipeline: audio capture → preprocessing → feature extraction → model (GMM, i-vector, x-vector) → matching."
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aSR" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="20" y="60" width="80" height="40" rx="4"/>
    <rect x="110" y="60" width="80" height="40" rx="4"/>
    <rect x="200" y="60" width="100" height="40" rx="4"/>
    <rect x="310" y="60" width="100" height="40" rx="4"/>
    <rect x="420" y="60" width="100" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="60" y="84">audio</text>
    <text x="60" y="96" font-size="9" fill="var(--text-muted)">.wav</text>
    <text x="150" y="84">preproc.</text>
    <text x="150" y="96" font-size="9" fill="var(--text-muted)">VAD, filter</text>
    <text x="250" y="84">MFCC</text>
    <text x="250" y="96" font-size="9" fill="var(--text-muted)">features</text>
    <text x="360" y="84">embedding</text>
    <text x="360" y="96" font-size="9" fill="var(--text-muted)">x-vector</text>
    <text x="470" y="84">match</text>
    <text x="470" y="96" font-size="9" fill="var(--text-muted)">cosine</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aSR)">
    <path d="M100,80 L108,80"/>
    <path d="M190,80 L198,80"/>
    <path d="M300,80 L308,80"/>
    <path d="M410,80 L418,80"/>
  </g>
</svg>
:::

### 1. Snímání zvuku

* **Vzorkovací frekvence (sample rate):** 8 kHz (telefon) až 48 kHz (vysoká kvalita).
* **Bitová hloubka (bit depth):** 16bitová se znaménkem.
* **Mono** (jeden kanál).

### 2. Předzpracování

* **Detekce řečové aktivity (Voice Activity Detection, VAD)** — odstraní úseky ticha.
* **Potlačení šumu (noise reduction)** — spektrální odečítání.
* **Preemfázní filtr (pre-emphasis filter)** — zvýrazní vysoké frekvence.

### 3. Extrakce příznaků

#### MFCC (Mel-Frequency Cepstral Coefficients)

Standardní řečové příznaky:

1. Rozdělení zvuku do oken (rámce po 25 ms, posun po 10 ms).
2. **FFT** — výpočet spektra.
3. **Mel banka filtrů (mel filterbank)** — 26 filtrů rozmístěných podle percepční mel stupnice.
4. **Logaritmus** — převod výkonu na vnímanou hlasitost.
5. **DCT** — dekorelace, výsledkem je 12–13 koeficientů na rámec.

Výstupem je časová řada vektorů MFCC.

::: viz voice-mfcc "Pipeline FFT → mel filterbank → log → DCT → MFCC; heatmapa MFCC pro dva mluvčí + cosine similarity."
:::

#### Další příznaky

* **LPC** (Linear Predictive Coding, lineární prediktivní kódování).
* **PLP** (Perceptual Linear Prediction, percepční lineární predikce).
* **Delta + delta-delta** — časové derivace příznaků.

### 4. Modelování mluvčího

#### GMM (Gaussian Mixture Models, gaussovské směsové modely)

Klasický přístup:

* Každý mluvčí je modelován směsí gaussovských rozdělení v prostoru příznaků.
* Univerzální základní model (Universal Background Model, UBM) je natrénován na všech mluvčích; model konkrétního mluvčího z něj vznikne přizpůsobením (adaptací).

#### i-vector (2010)

* **Identitní vektor (identity vector)** — reprezentace promluvy proměnné délky převedená na vektor pevné délky.
* Vychází z faktorové analýzy GMM supervektorů.
* Dominoval v letech 2010–2017.

#### x-vector (2018+)

* **Embedding založený na hlubokém učení (DL)** — neuronová síť s časovým zpožděním (Time Delay Neural Network, TDNN) zpracuje MFCC a vrátí embedding pevné délky.
* Nahradil i-vektory jako špičkové řešení (state-of-the-art).
* Používají jej přední systémy v evaluaci NIST SRE.

#### ECAPA-TDNN (2020+)

* Vylepšený x-vector s mechanismem pozornosti (**attention**).
* Současné špičkové řešení (state-of-the-art) pro řadu testovacích sad.

### 5. Porovnávání

* **Kosinová podobnost (cosine similarity)** mezi embeddingy.
* Skórování pomocí **PLDA** (Probabilistic Linear Discriminant Analysis) — odděluje variabilitu uvnitř třídy od variability mezi třídami.

## Výkon

NIST **SRE** (Speaker Recognition Evaluation), probíhá od roku 1996:

* **SRE 2020:** nejlepší EER zhruba 1 % u krátkých promluv (10–60 s).
* **Telefonní zvuk:** EER 3–5 %.
* **Mezi jazyky (cross-language):** obtížnější, EER 5–10 %.

Moderní *spotřebitelské* nasazení (Apple Siri Voice ID, Google Voice Match):

* FAR: 1 ku 10 000 (deklarováno výrobcem).
* FRR: 1–5 %.

## Aplikace {tier=practice}

### Telefonní bankovnictví

* **Hlasová biometrická autentizace (authentication)** namísto hesla.
* HSBC Voice ID (2016+), Citi VoicePass.
* **Fráze:** „My voice is my password."

### Forenzní využití

* **Analýza hlasu** pro kriminalistické vyšetřování.
* Porovnání zvukového záznamu podezřelého se známými nahrávkami.
* V mnoha jurisdikcích přípustná u soudu spolu se znaleckým posudkem.

### Chytré reproduktory

* **Apple Siri** Voice ID (rozlišení jednotlivých uživatelů).
* **Google Voice Match** — rozlišuje členy domácnosti.
* **Amazon Echo** Voice Profiles.

### Call centra

* **Identifikace volajícího** bez výslovného ověření.
* **Detekce podvodů (fraud detection)** — hlasový biometrický blacklist.

### Sledování

* Sledování osob napříč více nahrávkami.
* Hlas v mobilní komunikaci.

## Útoky a anti-spoofing

### Útok přehráním (replay attack)

* Předem nahraný zvuk legitimního uživatele.
* **Obrana:** ověření živosti (liveness) — vyžádání náhodných frází, analýza kanálu (artefakty vzniklé při nahrávání).

### Klonování / syntéza hlasu

* Moderní nástroje s umělou inteligencí (ElevenLabs, Resemble AI) — vysoce kvalitní klonování hlasu z několika sekund záznamu.
* **Hrozba (threat):** umožňují podvrhnout (spoof) hlasovou biometriku syntetickým zvukem.
* **Obrana:** klasifikátory proti podvržení (anti-spoofing), viz soutěže ASVspoof.

### Napodobení (impersonation)

* Lidští imitátoři.
* Napodobení obvykle není dokonalé a dobré systémy je dokážou odhalit.

### Úprava hlasu

* Syntetizátory řeči, měniče hlasu (voice changers).
* Odhalitelné pomocí spektrální analýzy.

## ASVspoof

[ASVspoof Challenge](https://www.asvspoof.org/) — soutěž v ochraně proti podvržení (anti-spoofing) konaná každé dva roky:

* **Logical access (LA)** — detekce syntetizované řeči.
* **Physical access (PA)** — detekce útoku přehráním.
* Poskytuje datové sady, referenční řešení (baselines) a žebříčky.

Špičkové detektory využívají:
* **Akustické příznaky založené na CNN.**
* **Constant-Q transformaci.**
* **Reprezentace Wave2Vec.**

## Standardy

* **ISO/IEC 19794-13:2018** — hlasová data.
* **NIST SRE** — průběžně probíhající evaluace.

## Limity

### Vnitrotřídní variabilita

* **Stejná osoba** říká stejnou větu *pokaždé jinak* podle:
  * Emoce (klid vs. hněv).
  * Nachlazení či nemoci.
  * Únavy.
  * Rozdílů mezi mikrofony.

### Mezitřídní variabilita

* **Jednovaječná dvojčata a členové rodiny** mají *velmi podobné* hlasy.
* Stejné pohlaví, stejný věk i stejné nářečí — hůře se rozlišují.

### Stárnutí

* Hlas se v čase *výrazně* mění.
* Posuny od dětského hlasu přes dospívání až k dospělému hlasu.
* U starších lidí — třes hlasu, jeho zeslabení.

## Trendy

* **Syntéza hlasu řízená AI** ↔ **detekce řízená AI** — vzájemné závody ve zbrojení.
* **Vícemikrofonní (multi-microphone)** snímání (chytré reproduktory) — kromě hlasové biometriky určuje i směr příchodu zvuku.
* **Federované učení (federated learning)** — trénování zachovávající soukromí.
* **Multimodální spojení hlasu a obličeje** (voice + face).
* **Průběžná autentizace (continuous authentication)** — pasivní rozpoznávání hlasu během hovoru.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=mJx30g3bzQo" "Sound Recognition - Computerphile" "Computerphile"
:::

*Zdroj: BIO přednášky 2025/26, BIO 12 — Dynamické biometrické vlastnosti. Externí reference: Reynolds, D. A.: *An overview of automatic speaker recognition technology* (ICASSP 2002); Snyder, D. et al.: *X-vectors: Robust DNN Embeddings for Speaker Recognition* (ICASSP 2018); ASVspoof Challenge — [asvspoof.org](https://www.asvspoof.org/); NIST SRE — [nist.gov/itl/iad/mig/speaker-recognition-evaluation-2020](https://www.nist.gov/itl/iad/mig/speaker-recognition-evaluation-2020).*
