---
title: Strojové učení nad sekvencemi
---

Klasické algoritmy strojového učení (SVM, náhodné lesy, logistická regrese) potřebují **vektor příznaků pevné délky**, ale sekvence mají různou délku a jsou tvořené symboly. Klíčový krok je proto **reprezentace sekvence číselně**. Existují tři základní přístupy s rostoucí mírou naučenosti.

**k-mer složení** rozseká sekvenci na všechna překrývající se podslova délky `k` a spočítá jejich frekvence — vznikne vektor délky `4^k` (resp. `20^k` pro proteiny), nezávislý na délce sekvence. Je to jednoduchý, úplný a obecný popis, ale s rostoucím `k` trpí **prokletím dimenzionality** (řídké, vysokorozměrné vektory).

**One-hot kódování** zakóduje každou pozici jako vektor délky 4 s jedničkou u příslušného nukleotidu — vhodné jako vstup pro konvoluční či rekurentní sítě, které si příznaky naučí samy. Je ale řídké a všechny symboly jsou stejně „vzdálené".

**Embeddingy** (např. `dna2vec`, naučené vrstvy) mapují k-mery do hustého nízkorozměrného prostoru, kde si podobné kontexty leží blízko — překonávají řídkost one-hot kódování.

::: svg "Od sekvence k příznakům: k-mer složení, one-hot a husté embeddingy jako vstup do klasifikátoru."
<svg viewBox="0 0 540 250" style="width:100%;max-width:540px;display:block" xmlns="http://www.w3.org/2000/svg">
  <rect width="540" height="250" fill="var(--bg-inset)"/>
  <!-- sekvence -->
  <text x="16" y="22" font-size="11" font-family="var(--font-mono)" fill="var(--text-muted)">sekvence</text>
  <g font-size="14" font-family="var(--font-mono)" font-weight="700">
    <text x="18" y="46" fill="oklch(0.62 0.16 145)">A</text>
    <text x="34" y="46" fill="oklch(0.62 0.16 250)">C</text>
    <text x="50" y="46" fill="oklch(0.72 0.15 80)">G</text>
    <text x="66" y="46" fill="oklch(0.72 0.15 80)">G</text>
    <text x="82" y="46" fill="oklch(0.6 0.18 22)">T</text>
    <text x="98" y="46" fill="oklch(0.62 0.16 145)">A</text>
  </g>

  <!-- tři větve -->
  <!-- 1) k-mer -->
  <rect x="14" y="66" width="160" height="76" rx="6" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="24" y="84" font-size="11" font-family="var(--font-mono)" fill="var(--accent)">k-mer složení (k=2)</text>
  <text x="24" y="102" font-size="10" font-family="var(--font-mono)" fill="var(--text)">AC:1 CG:1 GG:1</text>
  <text x="24" y="116" font-size="10" font-family="var(--font-mono)" fill="var(--text)">GT:1 TA:1 …</text>
  <text x="24" y="133" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-faint)">vektor délky 4^k</text>

  <!-- 2) one-hot -->
  <rect x="190" y="66" width="160" height="76" rx="6" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="200" y="84" font-size="11" font-family="var(--font-mono)" fill="var(--accent)">one-hot</text>
  <g font-size="9" font-family="var(--font-mono)" fill="var(--text)">
    <text x="200" y="100">A 1 0 0 0 0 1</text>
    <text x="200" y="112">C 0 1 0 0 0 0</text>
    <text x="200" y="124">G 0 0 1 1 0 0</text>
    <text x="200" y="136">T 0 0 0 0 1 0</text>
  </g>

  <!-- 3) embedding -->
  <rect x="366" y="66" width="160" height="76" rx="6" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="376" y="84" font-size="11" font-family="var(--font-mono)" fill="var(--accent)">embedding (husté)</text>
  <text x="376" y="102" font-size="10" font-family="var(--font-mono)" fill="var(--text)">k-mer → [0.3, −0.7,</text>
  <text x="376" y="116" font-size="10" font-family="var(--font-mono)" fill="var(--text)">0.1, 0.9, …]</text>
  <text x="376" y="133" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-faint)">naučený nízkorozměr.</text>

  <!-- šipky do klasifikátoru -->
  <defs>
    <marker id="arr2" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)"/>
    </marker>
  </defs>
  <line x1="94" y1="142" x2="240" y2="180" stroke="var(--accent)" stroke-width="1.2" marker-end="url(#arr2)" opacity="0.8"/>
  <line x1="270" y1="142" x2="270" y2="178" stroke="var(--accent)" stroke-width="1.2" marker-end="url(#arr2)" opacity="0.8"/>
  <line x1="446" y1="142" x2="300" y2="180" stroke="var(--accent)" stroke-width="1.2" marker-end="url(#arr2)" opacity="0.8"/>

  <!-- klasifikátor -->
  <rect x="190" y="184" width="160" height="34" rx="6" fill="color-mix(in oklch, var(--accent) 18%, var(--bg-card))" stroke="var(--accent)"/>
  <text x="270" y="205" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">klasifikátor (SVM / NN)</text>
  <text x="270" y="238" text-anchor="middle" font-size="10.5" font-family="var(--font-mono)" fill="var(--text-muted)">→ promotor / ne-promotor, rodina, lokalizace …</text>
</svg>
:::

**Moderní sekvenční modely.** Konvoluční sítě nad one-hot vstupem se naučí detekovat motivy jako lokální filtry; rekurentní sítě (LSTM) zachytí závislosti v sekvenci. Dnes dominují **genomové jazykové modely** typu transformer — `DNABERT` tokenizuje DNA na k-mery (typicky `k=6`, slovník `4^6 = 4096` tokenů) a předtrénuje se maskovaným jazykovým modelováním na referenčním genomu; navazují `DNABERT-2` (tokenizace BPE) a `Nucleotide Transformer`. Předtrénované embeddingy se pak dolaďují (fine-tuning) na konkrétní úlohy, kde často překonávají one-hot i `dna2vec`.

::: quiz "Proč k-mer složení nepotřebuje, aby vstupní sekvence měly stejnou délku?"
- [x] Výsledný vektor má vždy rozměr 4^k (resp. 20^k), nezávisle na délce sekvence
- [ ] Protože sekvence se nejdřív zarovnají na stejnou délku
- [ ] Protože se počítá jen první k-mer
- [ ] Protože k se volí rovno délce sekvence
> Spočítáme frekvence všech možných k-merů — jejich počet `4^k` je dán jen volbou `k` a abecedou, ne délkou vstupu. Proto je k-mer složení vektor pevné délky pro libovolně dlouhou sekvenci.
:::

::: link "DNABERT — předtrénovaný BERT pro DNA (bioRxiv preprint)" "https://www.biorxiv.org/content/10.1101/2020.09.17.301879.full.pdf"
:::

::: link "Přehled embeddingů k-merů a tokenizace nukleotidů (Bioinformatics / PMC)" "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10612406/"
:::

*Zdroj: PBI státnicové okruhy NBIO, VUT FIT. Externí reference: Ji et al. — DNABERT (bioRxiv 2020); studie k-mer embeddingů a tokenizace nukleotidů (Bioinformatics, 2023); dna2vec (Ng, 2017).*
