---
title: A5/1 a šifrování GSM
---

# A5/1 a šifrování GSM

**A5/1** je proudová šifra navržená v roce 1987 pro šifrování hlasových a datových přenosů v GSM (Global System for Mobile Communications). Po desetiletí byla utajována (security through obscurity, [[kerckhoff-sto]]); v r. 1999 byla zreverzována z mobilního telefonu (Briceno, Goldberg, Wagner). Útoky následovaly okamžitě. Dnes je A5/1 *prolomeno* — útok v reálném čase, klíč za sekundy.

## Architektura

A5/1 používá **3 LFSRs** s irregulárním hodinováním (*majority clocking*):

::: svg "A5/1: tři LFSRs (R1=19b, R2=22b, R3=23b) s majority clocking. Synchronizovaná pozice je u každého registru znázorněna 'C' bitem; majority decide řídí, který registr posune."
<svg viewBox="0 0 560 260" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aA51" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="30" width="380" height="40" rx="4"/>
    <rect x="20" y="100" width="380" height="40" rx="4"/>
    <rect x="20" y="170" width="380" height="40" rx="4"/>
    <rect x="430" y="100" width="80" height="40" rx="6"/>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="190" y="34" width="14" height="32"/>
    <rect x="234" y="104" width="14" height="32"/>
    <rect x="246" y="174" width="14" height="32"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="60"  y="55" font-size="12">R1 (19 b)</text>
    <text x="60"  y="125" font-size="12">R2 (22 b)</text>
    <text x="60"  y="195" font-size="12">R3 (23 b)</text>
    <text x="197" y="80" font-size="10" fill="var(--accent)">C1 (bit 8)</text>
    <text x="241" y="150" font-size="10" fill="var(--accent)">C2 (bit 10)</text>
    <text x="253" y="220" font-size="10" fill="var(--accent)">C3 (bit 10)</text>
    <text x="470" y="115" font-size="12">majority</text>
    <text x="470" y="130" font-size="10" fill="var(--text-muted)">(C1,C2,C3)</text>
    <text x="350" y="22" font-size="10" fill="var(--text-muted)">tapy: 18,17,16,13</text>
    <text x="350" y="92" font-size="10" fill="var(--text-muted)">tapy: 21,20</text>
    <text x="350" y="162" font-size="10" fill="var(--text-muted)">tapy: 22,21,20,7</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aA51)">
    <path d="M400,50 L420,50 L420,110 L430,115"/>
    <path d="M400,120 L430,120"/>
    <path d="M400,190 L420,190 L420,125 L430,125"/>
    <path d="M510,120 L530,120"/>
  </g>
  <text x="510" y="245" font-size="11" text-anchor="middle" fill="var(--accent)">→ keystream bit</text>
  <path d="M515,140 L515,235" stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aA51)"/>
</svg>
:::

Komponenty:

* **R1**: 19 bitů, charakteristický polynom $x^{19} + x^{18} + x^{17} + x^{14} + 1$. Tapy: 18, 17, 16, 13. Clocking bit C1 = pozice 8.
* **R2**: 22 bitů, polynom $x^{22} + x^{21} + 1$. Tapy: 21, 20. Clocking bit C2 = pozice 10.
* **R3**: 23 bitů, polynom $x^{23} + x^{22} + x^{21} + x^{8} + 1$. Tapy: 22, 21, 20, 7. Clocking bit C3 = pozice 10.

### Algoritmus tikání (irregular clocking)

V každém kroku:

1. Spočítá se $m = \text{majority}(C_1, C_2, C_3)$ — bit, který je v *většině* z tří clocking bitů.
2. **Posune se ten registr, jehož $C_i$ rovná se $m$.** Tj. 2 nebo 3 ze 3 registrů se v každém kroku posunou; každý registr se posune *průměrně v 75 %* kroků.
3. **Výstupní bit** keystreamu = XOR posledních bitů (MSB) všech tří registrů.

::: viz a51-clocking "A5/1 majority clocking — krokuj a sleduj, ktery registr se v dane iteraci posune. Po N tikani by se kazdy registr mel posunout v ≈ 75 % kroku."
:::

### Inicializace

Klíčový materiál:

* **64-bit session key $K_c$** odvozený autentizačním protokolem (A3/A8 algoritmus + SIM).
* **22-bit frame number $f$** — public, mění se každých 4,615 ms.

Inicializace:

1. Všechny registry vynulovány.
2. Pro $i = 0, \ldots, 63$: registr R1, R2, R3 *všechny* tikají (regulární clocking) a do MSB XORuje se $K_c[i]$.
3. Pro $i = 0, \ldots, 21$: stejně s bity $f[i]$.
4. Pak 100 "warm-up" tikání s majority clocking — výstup se zahazuje.
5. Začne produkce keystreamu — 228 bitů (114 pro uplink, 114 pro downlink).

## Útok č. 1 — Biham-Dunkelman 2000

První praktický útok ([Biham & Dunkelman 2000](https://link.springer.com/chapter/10.1007/3-540-44706-7_1)):

* **Known-keystream attack** — útočník zná ~2 sekundy keystream-výstup. (V GSM lze toto získat, protože hlavičky paketů jsou plaintext.)
* **Time-memory tradeoff** podle [Hellman 1980](https://www.computer.org/csdl/journal/tc/1980/07/01675578/13rRUxNmPLn). Předpočítaná tabulka relací stav → keystream, online prohledávání.
* **Komplexita:** $O(2^{40})$ kroků online, $2^{38}$ paměti — *nedosažitelné* v r. 2000, ale prakticky odhalovalo princip.

## Útok č. 2 — Barkan-Biham-Keller 2003

[*Instant Ciphertext-Only Cryptanalysis of GSM Encrypted Communication*](https://www.iacr.org/cryptodb/data/paper.php?pubkey=180):

* **Ciphertext-only** — útočník nezná plaintext.
* Využívá *struktury GSM error-correcting codes* (1/2-rate convolutional kód s puncturing) — výstup šifry obsahuje *redundanci*.
* Po `~1` sekundě hlasového hovoru (≈ 200 ramců) získá keystream a klíč.
* Při dostupné výpočetní síle 2003 byl útok realisticky proveditelný za hodiny.

## Útok č. 3 — Kraken + Rainbow tables (2009)

[Karsten Nohl](https://opensource.srlabs.de/projects/a51-decrypt) a Sascha Krißler veřejně demonstrovali plně automatický útok:

* **Předpočítané rainbow tables** — 40 tabulek, celkem 2 TB. Generování trvalo 1 měsíc na 4 GPU; spotřebovalo 850 kWh.
* **Algoritmus Kraken** v C++ s GPU akcelerací.
* **Vstup**: 2 známé otevřené zprávy (např. *Cipher mode complete* a *System Information message*, oba mají známé struktury).
* **Výstup**: 64-bit klíč $K_c$ s pravděpodobností ~90 % za **5 sekund** na 2 GPU.
* **Vyžadováno**: ~100 000 přístupů do tabulek, rychlý SSD.

To je *praktický* útok — útočník s běžným notebookem a GSM scanner (~$500) může pasivně dešifrovat GSM hovory v reálném čase.

## Útok č. 4 — COPACOBANA 2007

[*Cost-Optimized PArallel COde Breaker*](https://www.copacobana.org/) — specializovaný FPGA cluster s 120 Xilinx Spartan-3 FPGAs (~$10 000):

* **Brute force** A5/1 v ~6 hodinách na 64-bit klíč.
* Důkaz, že specializovaný HW útok je dostupný i pro amatérské skupiny.

## A5/3 (Kasumi) — náhrada

Po průlomech v A5/1 zavedla 3GPP **A5/3** založenou na *block-cipher* Kasumi (zjednodušená varianta MISTY1).

Útoky:

* **Kasumi sandwich attack** ([Dunkelman, Keller, Shamir 2010](https://eprint.iacr.org/2010/013.pdf)) — *related-key* útok s $2^{32}$ pamětí, $2^{26}$ známých plaintextů, $2^{32}$ encryptions. Existující 64-bit klíč Kasumi recovered.
* **Downgrading attack** ([Meyer-Wetzel 2004](https://eprint.iacr.org/2004/198.pdf)) — A5/1 i A5/3 používají *stejný* klíč $K_c$. Aktivní útočník (rogue BTS) může vynutit přepnutí mobilu zpět na A5/1, klíč zlomit přes A5/1 a *použít stejný klíč* k dešifrování A5/3 komunikace.

## 4G/5G AES

LTE a 5G přešly na **AES-CTR** a **SNOW 3G** (proudová šifra postavená na nelineárním feedback shift registru s S-boxy). Tyto jsou *dosud* (2026) bezpečné. Klíčové generace přes [AKA protokol](https://en.wikipedia.org/wiki/Authentication_and_Key_Agreement) s 128-bit klíči (5G přidává 256-bit AES variantu).

Pozn.: některé operátory v r. 2025 stále mají *fallback* na 2G/GSM pro krizové situace; pokud telefon nemá vypnutý "2G only" toggle (Android 14+ ho poskytuje), je *náchylný* k aktivnímu downgrade útoku.

## Lekce

A5/1 je *učebnicový* příklad:

1. **Security through obscurity selhává** — utajení specifikace prodloužilo iluzi bezpečnosti o 10 let, pak padlo okamžitě. Veřejně analyzované AES je po 25 letech *stále* bezpečné.
2. **Krátké klíče padají** — 64-bit klíč je dnes lámatelný *amatérsky*. Minimum pro nové systémy: 128 bitů.
3. **Korelační útoky na LFSR-based proudové šifry** — viz [[lfsr-princip]]. Jakákoliv nelinearita v výstupní funkci, která má statistický bias, je útokový vektor.
4. **Time-memory-data tradeoff** — Hellmanův útok je generický a aplikuje se na *jakoukoli* šifru se stavem $\le 80$ bitů. Proto AES-128 má 128-bit klíč, ale stav AES je 128-bit *neexpandovatelný* — útok nelze provést.
5. **Downgrading** — pokud systém podporuje slabší variantu, *vždy* na ni padne. Mitigace: vypnout legacy módy, "encrypt-or-die" politika.

---

*Zdroj: BZA přednášky 2025/26, BZA 03 — LFSR. Externí reference: Biham, E., Dunkelman, O.: *Cryptanalysis of the A5/1 GSM Stream Cipher* (Indocrypt 2000); Barkan, E., Biham, E., Keller, N.: *Instant Ciphertext-Only Cryptanalysis of GSM Encrypted Communication* (CRYPTO 2003) — [paper](https://link.springer.com/chapter/10.1007/978-3-540-45146-4_35); Nohl, K., Paget, C.: *GSM: SRSLY?* (Black Hat 2009); Dunkelman, O., Keller, N., Shamir, A.: *A Practical-Time Related-Key Attack on the KASUMI Cryptosystem* (CRYPTO 2010) — [PDF](https://eprint.iacr.org/2010/013.pdf).*
