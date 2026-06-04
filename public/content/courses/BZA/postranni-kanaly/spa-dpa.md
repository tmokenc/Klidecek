---
title: SPA a DPA — výkonová analýza
---

# SPA a DPA — výkonová analýza

**Power analysis** (výkonová analýza) je rodina side-channel útoků, kde útočník měří **okamžitou spotřebu energie** zařízení během kryptografické operace a z naměřené stopy rekonstruuje klíč. Útok formálně zavedli **Paul Kocher, Joshua Jaffe a Benjamin Jun v r. 1999** ([*Differential Power Analysis*](https://www.paulkocher.com/doc/DifferentialPowerAnalysis.pdf)) a otevřeli novou éru — najednou útok na smart card bez fyzické invazivity, *bez* znalosti algoritmu, *bez* drahého vybavení.

## Princip — model úniku

Spotřeba CMOS obvodu závisí na **přepínání tranzistorů**. Klidový stav má malou spotřebu; každý switch (CMOS gate flips 0→1 nebo 1→0) zvýší okamžitou spotřebu.

::: svg "Model úniku: spotřeba zařízení v daný okamžik závisí na Hammingově váze (počet '1' bitů v registru) nebo Hammingově vzdálenosti (počet 'flipped' bitů mezi předchozím a současným stavem)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="30" width="240" height="150" rx="8"/>
    <rect x="280" y="30" width="240" height="150" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="140" y="52" font-size="12">Hammingova váha (HW)</text>
    <text x="140" y="68" font-size="10.5" fill="var(--text-muted)">data v registru</text>
    <text x="400" y="52" font-size="12">Hammingova vzdálenost (HD)</text>
    <text x="400" y="68" font-size="10.5" fill="var(--text-muted)">přechod state₁ → state₂</text>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10.5">
    <text x="140" y="100">HW(0x00) = 0</text>
    <text x="140" y="116">HW(0x01) = 1</text>
    <text x="140" y="132">HW(0x0F) = 4</text>
    <text x="140" y="148">HW(0xFF) = 8</text>
    <text x="140" y="170" fill="var(--accent)">spotřeba ∝ HW</text>
    <text x="400" y="100">HD(0x00, 0x01) = 1</text>
    <text x="400" y="116">HD(0x0F, 0xF0) = 8</text>
    <text x="400" y="132">HD(0xAA, 0x55) = 8</text>
    <text x="400" y="148">HD(0xFF, 0xFF) = 0</text>
    <text x="400" y="170" fill="var(--accent)">spotřeba ∝ HD</text>
  </g>
</svg>
:::

* **Hammingova váha** (HW) — počet `1` bitů v hodnotě. Použitelný model pro *načtení* dat do registru (vždy z 0).
* **Hammingova vzdálenost** (HD) — počet bitů, které se *liší* mezi předchozí a současnou hodnotou. Použitelný model pro *přepis* registru nebo přechod mezi stavy. Prakticky lepší aproximace u většiny zařízení.

::: math
\text{spotřeba}(t) \approx \alpha \cdot \text{HD}(\text{state}_{t-1}, \text{state}_t) + \text{šum} + \text{konstantní spotřeba}
:::

## Měření

* **Resistor v zemi** (~10 Ω) v sérii s GND linkou napájení smart card.
* **Osciloskop** s vysokou vzorkovací frekvencí (např. 500 MS/s pro 5 MHz hodiny zařízení).
* **Trigger** — synchronizace s operací (např. začátek AES round, viz dále).

Cena: $500 (USB osciloskop PicoScope) – $50 000 (LeCroy WaveRunner). Pro low-end smart cards stačí entry-level vybavení.

## SPA — Simple Power Analysis

* **Útočník extrahuje klíč přímo** z jedné nebo několika power traces.
* Vyžaduje, aby závislost spotřeby na klíčových bitech byla *přímá* a *silná*.
* Klasický cíl: **RSA square-and-multiply**.

### SPA na RSA

```
res = 1; tmp = h
for i = k-1 downto 0 do
    tmp = tmp^2 mod n         // square
    if d[i] == 1 then
        res = res * tmp mod n // multiply (only if d[i]=1)
```

Power trace operace ukazuje *střídání* square a multiply operations:

::: svg "Power trace RSA square-and-multiply. Krátké peaks = square only (bit 0), dlouhé peaks = square + multiply (bit 1). Sekvence odhalí klíč."
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="none" stroke="var(--accent)" stroke-width="1.5">
    <path d="M20,120 L40,120 L40,80 L60,80 L60,120 L90,120 L90,80 L110,80 L110,60 L130,60 L130,120 L160,120 L160,80 L180,80 L180,120 L210,120 L210,80 L230,80 L230,60 L250,60 L250,120 L280,120 L280,80 L300,80 L300,60 L320,60 L320,120 L350,120 L350,80 L370,80 L370,120 L400,120 L400,80 L420,80 L420,60 L440,60 L440,120 L470,120 L470,80 L490,80 L490,120 L520,120"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10.5">
    <text x="50"  y="146">S</text>
    <text x="100" y="146">SM</text>
    <text x="170" y="146">S</text>
    <text x="220" y="146">SM</text>
    <text x="290" y="146">SM</text>
    <text x="360" y="146">S</text>
    <text x="410" y="146">SM</text>
    <text x="480" y="146">S</text>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11.5">
    <text x="270" y="22" fill="var(--accent)">d = 0 1 0 1 1 0 1 0</text>
  </g>
</svg>
:::

* **Krátký peak** (jen square) → bit `0`.
* **Dlouhý peak** (square + multiply) → bit `1`.
* Z **jednoho** traces extrahujte celý 1024-bit klíč.

::: viz rsa-spa-trace "Precti bity klice ze square-and-multiply power trace. Kratky peak = jen square (bit 0); dlouhy = square+multiply (bit 1)."
:::

### Obrana

* **Square-and-multiply-always** — vždy provést multiply, jen ignorovat výsledek pro bit 0. *Eliminuje* timing rozdíl, ale stále zranitelné DPA.
* **Montgomery ladder** — kompletně symetrické operace, *konstantní* sekvence square + multiply nezávislá na bitech.
* **Sliding window / Window NAF** — sníží počet operací, ale data-dependent.
* **Exponent blinding** — místo $d$ použít $d' = d + r \cdot \varphi(n)$ pro náhodné $r$; výsledek stejný, sekvence operací jiná.
* **Base blinding** — místo $m^d$ počítat $(m \cdot R)^d \cdot R^{-d}$.

## DPA — Differential Power Analysis

Když je signál v jednotlivém traces příliš slabý (kvůli *šumu* — paralelní operace, environmental noise), **DPA** pracuje **statisticky nad tisíci traces**.

### Algoritmus

1. **Vyber intermediate value** $v$, který závisí na *malé* části klíče. Klasické: výstup S-boxu AES první roundy závisí na 1 byte plaintextu + 1 byte klíče.

::: math
v = S(\text{plaintext}[i] \oplus k[i])
:::

2. Pro **každý možný klíč** $k_g \in [0, 255]$ a každý známý plaintext $p_j$:
   * Spočítej *předpokládaný* $v_{g,j} = S(p_j \oplus k_g)$.
   * Spočítej *model spotřeby* $L_{g,j} = \text{HW}(v_{g,j})$ (nebo HD pro lepší model).

3. **Nahraj $N$ traces** (typicky $N = 10\,000$) — pro každý $j$ máš měřenou stopu $T_j[t]$ kde $t$ je čas (sample index).

4. Pro každý čas $t$ spočti **korelaci** mezi $L_{g,\cdot}$ a $T_{\cdot}[t]$:

::: math
\rho(k_g, t) = \frac{\sum_j (L_{g,j} - \bar{L}_g)(T_j[t] - \bar{T}[t])}{\sqrt{\sum_j (L_{g,j} - \bar{L}_g)^2 \cdot \sum_j (T_j[t] - \bar{T}[t])^2}}
:::

5. Pro **správný klíč** $k_g = k_{\text{real}}$ existuje čas $t^*$, kde $\rho(k_g, t^*)$ je **maximální** (typicky |ρ| > 0.1 pro N=10000). Pro **nesprávné** klíče zůstávají korelace blízko 0.

6. Pro každý byte klíče zvlášť — celý 16-byte AES klíč v 16 × 256 = **4096** hypotézách, ne $2^{128}$.

::: viz dpa-aes-sbox "DPA na prvni S-box AES. Posun N traces — pro spravny k* vzroste |rho| nad sum. Sleduj, jak se zvyseni sumu zhorsi detekce a zvysuje pozadovany N."
:::

### Vlastnosti DPA

* **Bezpečně-šumem-imunní** — DPA *automaticky* odstraňuje šum průměrováním. Čím víc traces, tím nižší práh signálu odlišný od noise.
* **Útočník nemusí přesně znát implementaci** — stačí model úniku (HW/HD) a znalost algoritmu (S-box AES).
* **Útočník nemusí vědět, kde** v traces je cílová operace — DPA *prohledá všechny časy* a najde maximum.

### Pokročilé varianty

* **CPA — Correlation Power Analysis** ([Brier-Clavier-Olivier 2004](https://link.springer.com/chapter/10.1007/978-3-540-28632-5_2)) — používá Pearson correlation místo původní difference-of-means. Standardní dnes.
* **MIA — Mutual Information Analysis** ([Gierlichs et al. 2008](https://link.springer.com/chapter/10.1007/978-3-540-85053-3_27)) — nelineární modely; lépe na nelineární zařízení.
* **Template attack** ([Chari et al. 2002](https://link.springer.com/chapter/10.1007/3-540-36400-5_3)) — *learning-based* DPA. Profilovací fáze: útočník má identické zařízení, naučí modely pro každou hodnotu klíče. Útoková fáze: porovnává naměřené traces s modely. Nejvyšší úspěšnost, nejnižší počet traces.
* **Machine learning DPA** — neural networks (CNN, LSTM) místo statistik (Maghrebi-Portigliatti-Prouff 2016).

## DPA na Trezor One (2019) {tier=example}

[Ledger Donjon](https://blog.ledger.com/Tu-Sais-Pas-Mon-Numero-Si-Tu-Ne-Sais-Pas-Mon-PIN/): praktický útok na Trezor One hardware wallet:

* Profilovací zařízení: modifikovaný firmware Trezor (přidává možnost více pokusů PIN).
* 200 000 traces pro každý PIN digit.
* **Recover PIN** za hodiny z odcizeného zařízení.
* **Bonus:** EC scalar v Curve25519 multiplication leak → recovery soukromého klíče.

Trezor opravil firmware (constant-time PIN check), ale incident ukázal, že i moderní hardware wallets bez DPA-resistant HW nejsou bezpečné proti laboratornímu útoku.

## Identifikace instrukcí

DPA umí *víc* než jen recover klíč. Útočník může:

1. Pro 256 hodnot vstupu (`0x00` až `0xFF`) změřit power traces.
2. Najít *trace signature* — místo v čase, kde se traces nejvíc liší.
3. Pro každou hodnotu $i$ vykresli `(x, spotřeba(x))` — má specifický tvar pro každou operaci.
4. Porovnej s `(x, HW(i XOR x))` pro každou hypotézu o operaci.

Výstup: identifikace **kterou instrukci** zařízení provádí (XOR, AND, OR, ADD, …) a **na kterých datech**. Klasická *side-channel reverse engineering*.

## Klíčové komerční implikace

* **Smartcards EAL5+ a vyšší** ([[fips-cc]]) **musí** projít AVA_VAN.4 (Penetration testing — high) — což explicitně testuje resistenci proti DPA.
* **EMV chip-and-PIN** karty od ~2010 mají DPA-resistant AES.
* **HSM FIPS 140-2 Level 4** vyžaduje resistenci proti DPA.
* **TPM 2.0** a **eSE** v moderních telefonech jsou DPA-resistant (Common Criteria EAL5+).
* **IoT zařízení** *většinou nejsou* — proto jsou cílem útoků v r. 2025.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=vXe8pe18MNk" "Power LED Attack - Computerphile" "Computerphile"
:::

*Zdroj: BZA přednášky 2025/26, BZA 05 — Postranní kanály (Malinka). Externí reference: Kocher, P., Jaffe, J., Jun, B.: *Differential Power Analysis* (CRYPTO 1999) — [PDF](https://www.paulkocher.com/doc/DifferentialPowerAnalysis.pdf); Brier, E., Clavier, C., Olivier, F.: *Correlation Power Analysis with a Leakage Model* (CHES 2004); Mangard, S., Oswald, E., Popp, T.: *Power Analysis Attacks: Revealing the Secrets of Smart Cards* (Springer 2007); Ledger Donjon: *Side-channel attacks on Trezor One* (2019) — [blog](https://blog.ledger.com/Tu-Sais-Pas-Mon-Numero-Si-Tu-Ne-Sais-Pas-Mon-PIN/).*
