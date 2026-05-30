---
title: Steganografie a vodoznaky
---

# Steganografie a vodoznaky

Steganografie (řecky *steganos* — skrytý, *graphē* — psaní) je technika **utajování existence** zprávy, nikoli jejího obsahu. Zatímco kryptografie předpokládá, že útočník ví o probíhající komunikaci a snaží se získat plaintext, steganografie se snaží, aby útočník vůbec nezpozoroval, že nějaká komunikace probíhá.

> Princip *security through obscurity* — viz [[kerckhoff|Kerckhoffův princip]]. Steganografie je tedy *bezpečností přes utajení postupu*. Jakmile útočník zjistí, *kam* a *jak* se ukrývá, je informace odhalena. V praxi se steganografie kombinuje s kryptografií: skrývá se *zašifrovaná* zpráva.

## Klasické techniky

* **Pasická tabulka** — *Histories* (Hérodotos): otrok s vytetovaným textem na vyholeném temeni; vlasy dorostou a posel přijde k cíli. *Nominálně neviditelná* zpráva, ale s extrémně vysokou cenou kanálu.
* **Neviditelný inkoust** — citrónová šťáva, mléko; při zahřátí karbonizuje a text vyvstane. Stále se prakticky používá pro nízkocennou komunikaci.
* **Akrostich** — první písmeno každého řádku/věty tvoří utajovanou zprávu (úloha z Hérodota i z renesanční korespondence).
* **Mikropoint** — fotografie zmenšená na velikost tečky a vlepená do běžné zprávy (špionáž 2. světové války).

## Digitální steganografie

Moderní steganografie využívá **redundanci nosných dat** — bitů, jejichž změna lidskému pozorovateli nepadne do oka ani sluchu.

### LSB (Least Significant Bit)

Nejjednodušší technika: do nejnižšího bitu každého pixelu RGB obrazu se vepíše jeden bit utajované zprávy. Obrázek o rozlišení $1920 \times 1080$ pixelů má $3 \cdot 1920 \cdot 1080 \approx 6{,}2$ M bitů kapacity — dost na cca 780 KB zprávy. Změna nejnižšího bitu způsobí změnu intenzity pixelu o $\pm 1$ z 256, což lidské oko nerozezná.

::: svg "LSB substituce: nejnižší bit RGB pixelu nese jeden bit zprávy"
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="20"  y="30" width="180" height="80" rx="6"/>
    <rect x="220" y="30" width="120" height="80" rx="6"/>
    <rect x="360" y="30" width="160" height="80" rx="6"/>
  </g>
  <g fill="var(--text)" font-size="11" font-family="var(--font-mono)" text-anchor="middle">
    <text x="110" y="50">Originál pixel</text>
    <text x="110" y="70" fill="var(--text-muted)">R: 1011001<tspan fill="var(--accent)">1</tspan></text>
    <text x="110" y="84" fill="var(--text-muted)">G: 0110110<tspan fill="var(--accent)">0</tspan></text>
    <text x="110" y="98" fill="var(--text-muted)">B: 1100101<tspan fill="var(--accent)">1</tspan></text>

    <text x="280" y="50">Bit zprávy</text>
    <text x="280" y="78" font-size="18" fill="var(--accent)">1 0 1</text>

    <text x="440" y="50">Modifikovaný pixel</text>
    <text x="440" y="70" fill="var(--text-muted)">R: 1011001<tspan fill="var(--accent)">1</tspan></text>
    <text x="440" y="84" fill="var(--text-muted)">G: 0110110<tspan fill="var(--accent)">0</tspan></text>
    <text x="440" y="98" fill="var(--text-muted)">B: 1100101<tspan fill="var(--accent)">1</tspan></text>
  </g>
  <g stroke="var(--text-muted)" fill="none">
    <path d="M200,70 L218,70" marker-end="url(#aSteg)"/>
    <path d="M340,70 L358,70" marker-end="url(#aSteg)"/>
  </g>
  <defs>
    <marker id="aSteg" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="270" y="138" text-anchor="middle">3 bity zprávy / pixel</text>
  </g>
</svg>
:::

::: viz lsb-steganografie "Zadejte skrývanou zprávu a počet využitých LSB. Zapnutím \"zvýraznit změněné pixely\" se 8× amplifikuje rozdíl — pro 1 LSB téměř neviditelný, pro 4 LSB výrazný. Chi-kvadrát test odhaluje statistickou stopu."
:::

### Steganalýza

Útoky na LSB využívají statistických **nerovnoměrností**:

* **Chi-kvadrát test** (Westfeld, Pfitzmann 1999) — porovnává očekávané a pozorované rozložení dvojic LSB. Zprávy zapsané LSB-substitucí mají posunutou distribuci.
* **RS analysis** (Fridrich 2001) — vyhodnocuje "regularnost" sousedních pixelů; modifikované pixely tvoří odlišný statistický vzor.
* **Hloubková analýza obrazu** — porovnání podezřelého obrazu s originálem pomocí ELA (Error Level Analysis), DCT histogramů u JPEG, apod.

Obrana: **adaptivní steganografie** (HUGO, WOW, S-UNIWARD) — vepisuje bity do míst s vysokou texturou (kde se těžko statisticky detekují) místo do plochých regionů.

## Vodoznaky (watermarking)

Vodoznak je *vědomá* steganografie, kde **odesílatel nechce skrýt existenci**, ale chce *prokázat původ nebo vlastnictví* digitálního obsahu. Cíle se liší:

| Vlastnost | Steganografie | Vodoznak |
| :--- | :--- | :--- |
| Cíl | utajit existenci zprávy | prokázat původ / detekovat manipulaci |
| Viditelnost | nulová | viditelná i neviditelná varianta |
| Odolnost | vůči detekci | vůči odstranění (cropping, kompresi, transformacím) |
| Kapacita | bity zprávy | obvykle malá (logo, sériové číslo) |
| Příklady | LSB v obraze | DCI v kinech, Digimarc v PDF, Adobe Content Credentials ve fotkách |

Robustní vodoznaky pracují obvykle v transformační doméně (DCT, DWT) — vepisují do nízkofrekvenčních koeficientů, které přežijí kompresi a běžné zpracování. Útoky: cropping, rotace, šum, recompression, *collusion attack* (porovnání více kopií se stejným obsahem ale různými vodoznaky).

## Steganografie v současné kybernetice

* **Síťová steganografie** — skrývání bitů do nepoužitých polí TCP/IP hlavičky (TCP ISN, IP TTL), do *timing* mezi pakety, do délky paketů.
* **DNS tunneling** — exfiltrace dat přes pole TXT v DNS dotazech. Mnoho APT skupin (např. APT34, FrameworkPOS) ho dlouhodobě používá.
* **DGA** (Domain Generation Algorithm) — botnety generují tisíce náhodně vypadajících doménových jmen, ze kterých C2 server zaregistruje pár — kombinace steganografie a klíčové dohody.
* **Schovávání do AI modelů** — nedávný výzkum ukázal, že lze ukrýt megabajty dat do vah neuronových sítí, aniž by se citelně zhoršila přesnost klasifikace.

## Steganografie vs. kryptografie — synergie

Nejedná se o konkurenční disciplíny. **Bezpečné řešení používá obě:**

1. Plaintext $M$ se nejprve **zašifruje** klíčem (důvěrnost, integrita).
2. Šifrovaný $C$ se **steganograficky vloží** do nevinné nosné (utajení existence).

Útočník nyní musí *nejprve* zpozorovat steganografický kanál (čímž steganografie získává čas), a *poté* prolomit šifru (čímž kryptografie ochrání obsah). Vrstvená obrana = defense in depth.

---

*Zdroj: KRY přednášky 2025/26, KRY 1 — Klasická kryptografie. Externí reference: Fridrich, J.: *Steganography in Digital Media* (Cambridge UP 2009); Cox, I., Miller, M., Bloom, J. a kol.: *Digital Watermarking and Steganography* (2nd ed., Morgan Kaufmann 2008); Westfeld, A., Pfitzmann, A.: "Attacks on Steganographic Systems", Information Hiding 1999.*
