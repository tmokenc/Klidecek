---
title: PUF — Physical Unclonable Functions
---

# PUF — Physical Unclonable Functions

**Physical Unclonable Function** je zařízení, které z fyzikálních vlastností konkrétního exempláře čipu generuje *unikátní* odpověď. PUF nepotřebuje uloženou tajnou hodnotu — *je sám* tou hodnotou. To řeší klasický problém: jak v zařízení mít tajemství, které *nikdo* (ani výrobce) předem nezná, a které *nelze* extrahovat ani fyzicky.

## Princip — využití procesní variace

::: svg "PUF princip: stejný layout, ale různé exempláře — kvůli procesní variaci mají různé delay/cell value characteristiky."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40" y="50" width="100" height="100" rx="6"/>
    <rect x="180" y="50" width="100" height="100" rx="6"/>
    <rect x="320" y="50" width="100" height="100" rx="6"/>
    <rect x="460" y="50" width="60" height="100" rx="6" fill="var(--bg-inset)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="90"  y="42" font-size="11">čip A</text>
    <text x="230" y="42" font-size="11">čip B</text>
    <text x="370" y="42" font-size="11">čip C</text>
    <text x="490" y="42" font-size="11">…</text>
    <text x="90"  y="170" font-size="10" fill="var(--accent)">PUF: 0xA51E</text>
    <text x="230" y="170" font-size="10" fill="var(--accent)">PUF: 0x73CB</text>
    <text x="370" y="170" font-size="10" fill="var(--accent)">PUF: 0xF209</text>
    <text x="490" y="170" font-size="10" fill="var(--text-muted)">unikátní</text>
  </g>
  <g fill="var(--text-muted)" font-size="10" text-anchor="middle">
    <text x="90"  y="103">stejný layout</text>
    <text x="230" y="103">stejný layout</text>
    <text x="370" y="103">stejný layout</text>
    <text x="90"  y="125">∆delay 1,3 ps</text>
    <text x="230" y="125">∆delay 0,8 ps</text>
    <text x="370" y="125">∆delay 2,1 ps</text>
  </g>
</svg>
:::

Při výrobě IC dochází k *procesní variaci* — i když layout je identický a wafer pochází ze stejné šarže, jednotlivé tranzistory mají mírně odlišné fyzikální parametry:

* **Délka kanálu** (channel length) — ovlivňuje threshold voltage $V_t$.
* **Tloušťka oxidu** — ovlivňuje gate capacitance.
* **Dopantní koncentrace** — ovlivňuje vodivost.
* **Drsnost rozhraní** — ovlivňuje mobility nositelů náboje.

Důsledkem je, že dvě identické cesty na čipu mají nepatrně odlišnou *propagation delay* (rozdíly v jednotkách až desítkách ps). Tato variace je:

* **Náhodná** — vyplývá z atomární úrovně výroby; ani výrobce ji předem nezná.
* **Stabilní** — pro daný čip se s časem mění pomalu (stárnutí, ne instantánně).
* **Neklonovatelná** — duplikát čipu se stejným layout (i z téhož waferu!) bude mít *jiné* hodnoty.

PUF je obvod, který tyto variace **mapuje na bity**.

## Arbiter PUF — klasický návrh

Nejznámější design (Lim, Devadas, MIT 2004):

::: svg "Arbiter PUF: c-bit challenge řídí switches, dvě cesty soutěží, arbiter dá bit podle toho, která dorazí dřív."
<svg viewBox="0 0 560 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aPUF1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="50" y="60" width="60" height="100" rx="4"/>
    <rect x="160" y="60" width="60" height="100" rx="4"/>
    <rect x="270" y="60" width="60" height="100" rx="4"/>
    <rect x="380" y="60" width="60" height="100" rx="4"/>
    <rect x="470" y="80" width="60" height="60" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="80" y="50" font-size="10">c=1</text>
    <text x="190" y="50" font-size="10">c=0</text>
    <text x="300" y="50" font-size="10">c=1</text>
    <text x="410" y="50" font-size="10">c=0</text>
    <text x="80" y="100" font-size="10" fill="var(--text-muted)">switch</text>
    <text x="80" y="115" font-size="10" fill="var(--text-muted)">∆₁</text>
    <text x="190" y="100" font-size="10" fill="var(--text-muted)">switch</text>
    <text x="190" y="115" font-size="10" fill="var(--text-muted)">∆₂</text>
    <text x="300" y="100" font-size="10" fill="var(--text-muted)">switch</text>
    <text x="300" y="115" font-size="10" fill="var(--text-muted)">∆₃</text>
    <text x="410" y="100" font-size="10" fill="var(--text-muted)">switch</text>
    <text x="410" y="115" font-size="10" fill="var(--text-muted)">∆₄</text>
    <text x="500" y="105" font-size="11">D Q</text>
    <text x="500" y="120" font-size="9" fill="var(--text-muted)">arbiter</text>
    <text x="40" y="84" font-size="10" fill="var(--accent)">edge ↑</text>
    <text x="40" y="146" font-size="10" fill="var(--accent)">edge ↑</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.1" fill="none">
    <path d="M20,80 L50,80"/>
    <path d="M20,140 L50,140"/>
    <path d="M110,80 L160,80"/><path d="M110,140 L160,80" stroke-dasharray="2 2"/>
    <path d="M110,140 L160,140"/><path d="M110,80 L160,140" stroke-dasharray="2 2"/>
    <path d="M220,80 L270,80"/><path d="M220,140 L270,140"/>
    <path d="M330,80 L380,80"/><path d="M330,140 L380,80" stroke-dasharray="2 2"/>
    <path d="M330,140 L380,140"/><path d="M330,80 L380,140" stroke-dasharray="2 2"/>
    <path d="M440,80 L470,95" marker-end="url(#aPUF1)"/>
    <path d="M440,140 L470,125" marker-end="url(#aPUF1)"/>
    <path d="M530,110 L560,110" marker-end="url(#aPUF1)"/>
  </g>
  <text x="555" y="115" font-size="11" text-anchor="end" fill="var(--text)">→ r</text>
</svg>
:::

* Vstupní **c-bit challenge** řídí $c$ switchů — každý switch buď *přímo* (paralelní cesty), nebo *křížem* (cesty se prohodí).
* Na vstup se přivede *rising edge*. Edge se šíří *oběma* cestami paralelně.
* Po průchodu všemi switches dorazí edge na **D-flip-flop arbiter**: pokud horní cesta byla rychlejší, D=1 (latch nahoře), jinak D=0.
* **Output** je 1 bit. Pro $c$-bit challenge dostáváme 1-bit response — pro získání $n$-bit klíče potřebujeme $n$ challenges.

Variace $\Delta_1, \Delta_2, \Delta_3, \Delta_4$ jsou pikosekundové rozdíly; výsledný total delay je *kumulativní součet* — pro každou kombinaci switchů jiný. Pro $c$-bit challenge máme $2^c$ kombinací; pokud útočník měří CRPs (Challenge-Response Pairs), může se pokusit fitovat lineární model.

::: viz arbiter-puf "Klikni na challenge biti, sleduj jak edge prochazi switchi a kdo dorazi drive. Pak posun N CRPs slider — linearni model utoku dosahne 95+% presnosti pro stovky CRPs."
:::

### Slabost: lineární model

Arbiter PUF má **slabost — celkový delay je lineární funkcí challenges** (kromě signu — arbiter aplikuje sign function). Útočník s ~10 000 CRPs umí přes **support vector machine** nebo **logistic regression** rekonstruovat model s 95+% přesností (Rührmair et al. 2010). Proto vznikly nelineární varianty.

## XOR PUF a Feed-Forward PUF

* **XOR Arbiter PUF** — $k$ paralelních Arbiter PUFs, jejich výstupy se XORují. Model útok exponenciálně těžší ($k$=4 stačí pro odolnost vůči SVM s 10⁶ CRPs).
* **Feed-Forward PUF** — výstupy mezistupňů se používají jako další "challenge" bits pro pozdější stages. Nelineární kombinace; obtížnější model.
* **Lightweight Secure PUF** — XOR kombinace s permutací; navržen pro RFID.

## SRAM PUF

Druhá hlavní rodina — **SRAM PUF** (Holcomb 2007, Intrinsic ID):

* SRAM buňka je dvojice cross-coupled inverterů. Při startu (před zápisem) se buňka *náhodně* nastaví do 0 nebo 1 — ale *deterministicky pro daný čip*.
* Procesní variace tranzistorů určí, který inverter je silnější → preferovaná hodnota.
* Při čtení nezapsané SRAM po startu dostáváme **fingerprint čipu**.
* Klíč je řádově $n$ bitů pro $n$ SRAM cell — typicky 256 buněk pro 256-bit klíč (po error correction).

Výhoda: SRAM je standardní, levný; PUF nemá žádný dodatečný HW.
Nevýhoda: *bit error rate* ~5–10 % (kvůli šumu, teplotě, stárnutí) → vyžaduje **fuzzy extractor** (BCH/Reed-Muller kód + universal hash).

### Komerční nasazení

* **NXP eIDAS chips** — SRAM PUF jako zdroj root key pro PKI operace.
* **Microsemi (Microchip) SmartFusion FPGA** — proprietary PUF jako device unique key.
* **Xilinx UltraScale+** — eFUSE + PUF kombinace.
* **Cisco** — anti-counterfeit (PUF jako device authenticator).

## Aplikace PUF

PUF lze využít pro:

1. **Anti-counterfeiting / device identification** — výrobce v *enrollment* fázi změří CRP database a uloží do cloudu. Při ověření zařízení posílá $n$ challenges; pokud výstupy souhlasí s referencí, je *autentické*. Důležité u zdravotních pomůcek, autodílů, military hardware.
2. **Key generation** — z PUF response se odvodí kryptografický klíč. Klíč se *nikdy nestoreuje* — generuje se on-demand. Při restartu zařízení se klíč obnoví ze stejné PUF.
3. **Tamper detection** — invazivní útok mění PUF response (mikrojehly, decap, FIB modify); klíč se po útoku přestane generovat → zařízení nelze obnovit do funkčního stavu.
4. **TRNG seed** — SRAM PUF jako entropy source pro startup-time seedu DRBG.

## Útoky na PUF

* **Modeling attacks** — útočník nasbírá tisíce CRPs (legitimním rozhraním nebo measurement) a trénuje ML model. Při $10^6$ CRPs lze rekonstruovat Arbiter PUF s ~99 % přesností.
* **Photonic emission analysis (PEA)** — měření fotonové emise z CMOS gate během switch. Skorobogatov 2010 ukázal, že PEA může extrahovat PUF response semi-invazivně.
* **Side-channel attacks** ([[em-kanal]], [[spa-dpa]]) — DPA na PUF s krypto post-processing.
* **Reliability attacks** — manipulace s teplotou nebo napětím způsobí, že PUF dává jiné výstupy, což odhalí informaci o stavu.

## Limity

* **Bit error rate** je nezbytný; PUF *nelze* použít přímo jako klíč bez error correction. Helper data k error correction se *publikuje* (helper data nesmí samo o sobě prozradit klíč → universal hash extractor podle [Dodis et al. 2008](https://www.cs.bu.edu/~reyzin/papers/fuzzy.pdf)).
* **Stárnutí** — po letech provozu PUF response drifuje (NBTI degradace tranzistorů). Vyžaduje periodickou rekalibraci helper data.
* **Teplotní rozsah** — extrémní teploty (mimo $-40\ldots+85$ °C) způsobí, že PUF přestane být funkční. Pro automotive aplikace je třeba *temperature-aware* enrollment.
* **Standardizace** — neexistuje jediný akceptovaný standard, jako pro DRBG. NIST [SP 800-193](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-193.pdf) (*Platform Firmware Resiliency*) zmiňuje PUF jen okrajově.

---

*Zdroj: BZA přednášky 2025/26, BZA 02 — Generátory náhodných čísel. Externí reference: Lim, D. et al.: *Extracting Secret Keys from Integrated Circuits* (IEEE T-VLSI 2005); Suh, G. E., Devadas, S.: *Physical Unclonable Functions for Device Authentication and Secret Key Generation* (DAC 2007); Rührmair, U. et al.: *Modeling Attacks on Physical Unclonable Functions* (CCS 2010) — [PDF](https://eprint.iacr.org/2010/251.pdf); Maes, R.: *Physically Unclonable Functions: Constructions, Properties and Applications* (Springer 2013).*
