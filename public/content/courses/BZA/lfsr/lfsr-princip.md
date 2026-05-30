---
title: LFSR — princip a vlastnosti
---

# LFSR — princip a vlastnosti

**Linear Feedback Shift Register** (LFSR) je hardwarově extrémně levný generátor pseudonáhodných bitů. Tvoří základ mnoha historických i současných proudových šifer ([[a51-gsm|A5/1]], [[mifare-crypto1|Crypto-1]], [[keeloq|KeeLoq]]), CRC počítačů, BIST generátorů a sériových čísel. Pro pochopení útoků na proudové šifry je LFSR nutnou pomůckou.

## Konstrukce

LFSR je posuvný registr s $n$ klopnými obvody $r_n, r_{n-1}, \ldots, r_1$. K nim přísluší **tap sequence** (vektor zpětných vazeb) $T = (t_n, t_{n-1}, \ldots, t_1)$, kde $t_i \in \{0, 1\}$.

V každém tikání:

1. **Výstup** je $r_1$ (bit, který "vypadne" napravo).
2. Všechny bity se *posunou* o jednu pozici doprava: nový $r_{i-1}$ je starý $r_i$.
3. Nový **MSB** $r_n$ se spočítá jako lineární kombinace (přes GF(2)) označených bitů:

::: math
r_n^{new} = \bigoplus_{i=1}^{n} t_i \cdot r_i = t_1 r_1 \oplus t_2 r_2 \oplus \cdots \oplus t_n r_n
:::

::: svg "Schéma LFSR délky 4 s tapy na pozicích 4 a 1 (charakteristický polynom x⁴+x+1). Šipky ukazují posuv doprava, dolní cesta zpětnou vazbu přes XOR."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aLFSR" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="80" y="60" width="80" height="50" rx="4"/>
    <rect x="180" y="60" width="80" height="50" rx="4"/>
    <rect x="280" y="60" width="80" height="50" rx="4"/>
    <rect x="380" y="60" width="80" height="50" rx="4"/>
    <circle cx="40" cy="155" r="14" fill="var(--bg-card)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="120" y="92" font-size="14">r₄</text>
    <text x="220" y="92" font-size="14">r₃</text>
    <text x="320" y="92" font-size="14">r₂</text>
    <text x="420" y="92" font-size="14">r₁</text>
    <text x="40"  y="160" font-size="14">⊕</text>
    <text x="120" y="42" font-size="10" fill="var(--text-muted)">tap t₄=1</text>
    <text x="220" y="42" font-size="10" fill="var(--text-muted)">tap t₃=0</text>
    <text x="320" y="42" font-size="10" fill="var(--text-muted)">tap t₂=0</text>
    <text x="420" y="42" font-size="10" fill="var(--text-muted)">tap t₁=1</text>
    <text x="510" y="92" font-size="11" fill="var(--accent)">→ output</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aLFSR)">
    <path d="M160,85 L180,85"/>
    <path d="M260,85 L280,85"/>
    <path d="M360,85 L380,85"/>
    <path d="M460,85 L500,85"/>
  </g>
  <g stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="3 3" fill="none">
    <path d="M120,110 L120,155 L54,155"/>
    <path d="M420,110 L420,155 L54,155"/>
    <path d="M40,141 L40,90 L80,85" marker-end="url(#aLFSR)"/>
  </g>
</svg>
:::

LFSR je *deterministický* — z počátečního stavu (seed) generuje pevnou sekvenci. Po nejvýše $2^n - 1$ tikání se musí stav zopakovat (stavový prostor je $2^n - 1$, protože nulový stav je *absorbující* — generuje pouze nuly).

::: viz lfsr-explorer "Interaktivní LFSR — měň délku $n$, vyber primitivní vs. neprimitivní polynom, nastav seed a krokuj. Sleduj detekci periody — primitivní polynom dává $2^n-1$ (m-sequence), neprimitivní podstatně méně."
:::

## Charakteristický polynom

Tap sequence se zapisuje jako **charakteristický polynom** nad GF(2):

::: math
p(x) = x^n \oplus t_n x^{n-1} \oplus t_{n-1} x^{n-2} \oplus \cdots \oplus t_1
:::

(některé textové tradice používají reciprocal polynomial; oba popisují totéž).

Stav LFSR se chová jako *prvek* okruhu $\text{GF}(2)[x]/p(x)$ — každé tikání je násobení $x$. Z toho plyne klíčové tvrzení:

> **Věta.** LFSR generuje sekvenci s maximální periodou $2^n - 1$ právě tehdy, když je $p(x)$ **primitivní polynom** stupně $n$ nad GF(2).

Takové LFSR generuje *m-sequence* (maximum-length sequence). M-sequences mají *výborné* statistické vlastnosti — frekvence jedniček/nul, autokorelace, distribuce vzorů — vše blízké náhodné sekvenci.

### Příklady primitivních polynomů

| $n$ | $p(x)$ | Tap pozice |
| :-: | :--- | :--- |
| 4 | $x^4 + x + 1$ | 4, 1 |
| 8 | $x^8 + x^4 + x^3 + x^2 + 1$ | 8, 4, 3, 2 |
| 16 | $x^{16} + x^5 + x^3 + x^2 + 1$ | 16, 5, 3, 2 |
| 32 | $x^{32} + x^{22} + x^2 + x + 1$ | 32, 22, 2, 1 |
| 64 | $x^{64} + x^4 + x^3 + x + 1$ | 64, 4, 3, 1 |

(Tabulky primitivních polynomů jsou v [Golomb 1982](https://www.amazon.com/Shift-Register-Sequences-Solomon-Golomb/dp/0894120484), [Wikipedia LFSR](https://en.wikipedia.org/wiki/Linear-feedback_shift_register#Some_polynomials_for_maximal_LFSRs).)

## Příklad — LFSR n=4, $p(x) = x^4 + x + 1$, seed 0001

| Tik | Stav $r_4 r_3 r_2 r_1$ | Výstup |
| :-: | :--- | :--- |
| 0 | 0001 | — |
| 1 | 1000 | 1 |
| 2 | 1100 | 0 |
| 3 | 1110 | 0 |
| 4 | 1111 | 0 |
| 5 | 0111 | 1 |
| 6 | 1011 | 1 |
| 7 | 0101 | 1 |
| 8 | 1010 | 1 |
| 9 | 1101 | 0 |
| 10 | 0110 | 1 |
| 11 | 0011 | 0 |
| 12 | 1001 | 1 |
| 13 | 0100 | 1 |
| 14 | 0010 | 0 |
| 15 | 0001 | 0 |
| 16 (= 1) | 1000 | 1 |

Perioda je $2^4 - 1 = 15$; po 15 tikání se stav vrací do 0001. Output sekvence: `100011110101100` (m-sequence délky 15).

## Slabost — lineární predikovatelnost

LFSR samotný **není** kryptograficky bezpečný. Problém je *lineární* zpětná vazba:

* Pokud útočník zná **2n** po sobě jdoucích výstupních bitů, dokáže rekonstruovat **celý stav** LFSR a předpovědět všechny budoucí bity.
* Algoritmus: **Berlekamp-Massey** (1968) — z výstupní sekvence délky $2n$ najde minimální LFSR (jak velikost $n$, tak tap polynomial) v čase $O(n^2)$.

> **Pravidlo:** *čistý LFSR jako proudová šifra je triviálně rozbitný.* Pro kryptografické použití je nezbytné zavést **nelinearitu** (kombinace více LFSRs s nelineární funkcí, irregular clocking, atd.) — viz dále.

## Z LFSR na proudovou šifru

Pro skutečné proudové šifry se používají kombinace více LFSRs s nelineární výstupní funkcí:

### Geffe generator (1973)

3 LFSRs s nesoudělnými polynomy. Výstup:

::: math
z = (x_1 \wedge x_2) \oplus (\neg x_1 \wedge x_3)
:::

Slabý: korelace $\Pr[z = x_2] = 0{,}75$ — útok korelační analýzou rekonstruuje LFSR 2 ve čase $O(L_2 \cdot 2^{L_2})$.

### Geffe se zlepšuje:

* **Stop-and-go generators** — jeden LFSR řídí, kdy druhý posouvá. Eliminuje lineární vztah, ale stále má slabosti.
* **Alternating step generator** — modifikace stop-and-go.
* **Shrinking generator** (Coppersmith 1993) — LFSR A produkuje data, LFSR B rozhoduje, který bit se zachová. Statisticky lepší.

### Reálné nasazení v BH

* **A5/1** (GSM) — 3 LFSRs s *irregular clocking* (majority function). 64-bit klíč, ale efektivní bezpečnost ~24 bitů kvůli útokům ([[a51-gsm]]).
* **E0** (Bluetooth) — 4 LFSRs s nelineární výstupní funkcí. Slabosti známy (Lu et al. 2005, online attack $O(2^{38})$ data).
* **Crypto-1** (Mifare Classic) — 48-bit LFSR s nelineární filter function. Prolomeno během několika sekund útoky korelační analýzou ([[mifare-crypto1]]).
* **KeeLoq** — *není* LFSR, ale podobně strukturovaná 64-bit NLFSR (nonlinear FSR). Také prolomeno ([[keeloq]]).

## LFSR v praktických aplikacích — *non-crypto*

Mimo kryptografii je LFSR velmi užitečný:

* **CRC checksums** — CRC-32, CRC-16; polynomial division v GF(2), implementuje se přesně LFSR-like obvodem.
* **BIST** (Built-In Self-Test) — generování test patternů pro IC testing.
* **PN sequences** v komunikacích — CDMA spreading, GPS C/A code, radar pulse compression.
* **Scrambling** v Ethernet, USB, PCIe — bity se XORují s LFSR výstupem pro snížení DC bias a EM emisí.
* **Sériová čísla** — pseudo-randomized numbering (Microsoft Windows ProductID).

V těchto aplikacích *nevadí* lineárnost; rychlost a jednoduchost jsou výhody.

---

*Zdroj: BZA přednášky 2025/26, BZA 03 — LFSR. Externí reference: Golomb, S. W.: *Shift Register Sequences* (Aegean Park Press, 1982); Menezes, A., van Oorschot, P., Vanstone, S.: *Handbook of Applied Cryptography* (CRC Press 1996), kap. 6 — [PDF](http://cacr.uwaterloo.ca/hac/); Schneier, B.: *Applied Cryptography* (Wiley 1996), kap. 16.*
