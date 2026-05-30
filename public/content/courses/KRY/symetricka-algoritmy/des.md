---
title: DES — Data Encryption Standard
---

# DES — Data Encryption Standard

DES (1977, NBS / NIST publikace FIPS PUB 46) je *první otevřený moderní šifrovací standard* a dlouhých 25 let dominantní symetrická šifra. IBM ho vyvinul z předchozí šifry **Lucifer** (Horst Feistel, 1971); NSA upravila S-boxy a zkrátila klíč ze 128 na 56 bitů. Definuje:

* Blok: 64 bitů.
* Klíč: 56 bitů (uloženo jako 64 bitů s 8 paritními bity).
* 16 kol [[feistel-spn|Feistelovy sítě]].

DES je dnes **zastaralý** (56bitový klíč je prolomitelný za hodiny — viz [[delka-klice]]), ale jeho studium je zásadní: ilustruje *kanonickou* Feistelovu konstrukci a jeho útoky odhalily *lineární a diferenciální kryptoanalýzu*, které pak ovlivnily celý návrh AES.

## Struktura — celkový pohled

::: svg "DES — celková struktura: IP, 16 kol Feistela, FP"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="120" y="15"  width="300" height="22" rx="4"/>
    <rect x="120" y="55"  width="300" height="22" rx="4"/>
    <rect x="120" y="95"  width="300" height="22" rx="4"/>
    <rect x="120" y="135" width="300" height="22" rx="4"/>
    <rect x="120" y="175" width="300" height="22" rx="4"/>
    <rect x="120" y="210" width="300" height="22" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11.5">
    <text x="270" y="30">64 b plaintext</text>
    <text x="270" y="70">Initial Permutation (IP)</text>
    <text x="270" y="110">16 × Feistel kolo (F, S-box, K_i)</text>
    <text x="270" y="150">32-bit swap (L_16 ↔ R_16)</text>
    <text x="270" y="190">Final Permutation (FP = IP⁻¹)</text>
    <text x="270" y="225">64 b ciphertext</text>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="40"  y="115" text-anchor="end">Feistel</text>
    <text x="535" y="115" text-anchor="end">subkey K_i</text>
  </g>
</svg>
:::

### Initial Permutation (IP) a Final Permutation (FP)

IP je *pevná* permutace 64 bitů — bit 58 plaintextu jde na pozici 1 ciphertextu, bit 50 na 2, atd. FP je její inverze. **Nepřináší žádnou bezpečnost** — je triviální obrátit a navíc nezáleží na klíči. Důvod existence: usnadnění implementace na byte-orientovaný hardware 70. let.

V moderních implementacích lze IP/FP *odstranit* bez ztráty bezpečnosti, ale specifikace je zachovává pro shodu s normou.

## Kolová funkce F

Srdce DES. Vstup: 32 bitů $R_i$, výstup: 32 bitů $F(R_i, K_i)$. Kroky:

1. **Expanze** (E-box): 32 → 48 bitů. Někteří bity jsou duplikovány, takže výstup je "rozplácnutý" vstup.
2. **XOR s 48-b subkey** $K_i$.
3. **Substituce** (8 S-boxů): 48 → 32 bitů. Každý S-box má 6 vstupních a 4 výstupní bity.
4. **Permutace** (P-box): 32 → 32 bitů. Permutuje výstup S-boxů pro difúzi.

::: svg "DES F-funkce — Expanze, XOR, 8 S-boxů, P-permutace"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40"  y="40" width="100" height="22" rx="4"/>
    <rect x="160" y="40" width="120" height="22" rx="4"/>
    <rect x="300" y="40" width="100" height="22" rx="4"/>
    <rect x="40"  y="80" width="360" height="40" rx="4"/>
    <rect x="40"  y="140" width="360" height="22" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11.5">
    <text x="90"  y="55">R_i (32 b)</text>
    <text x="220" y="55">Expanze E: 32 → 48 b</text>
    <text x="350" y="55">⊕ K_i (48 b)</text>
    <text x="220" y="100">8 S-boxů: 48 → 32 b</text>
    <text x="220" y="155">P-permutace</text>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="220" y="190" text-anchor="middle">F(R_i, K_i) — 32 b výstup</text>
  </g>
</svg>
:::

### S-boxy — klíčová nelinearita

8 S-boxů, každý je tabulka 4 × 16 (vstup: 6 bitů → 4 bity). Vstup interpretován: krajní bity (1, 6) určují *řádek* (0–3), prostřední 4 bity (2–5) určují *sloupec* (0–15).

S-box $S_1$ (zkráceno):

```
        col:  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15
row 0:       14  4 13  1  2 15 11  8  3 10  6 12  5  9  0  7
row 1:        0 15  7  4 14  2 13  1 10  6 12 11  9  5  3  8
row 2:        4  1 14  8 13  6  2 11 15 12  9  7  3 10  5  0
row 3:       15 12  8  2  4  9  1  7  5 11  3 14 10  0  6 13
```

S-boxy jsou *nelineární* — žádný nelze efektivně lineárně aproximovat. Návrh S-boxů byl po desetiletí *podezřelý* — kritici se domnívali, že NSA tam ukryla "backdoor". Po prozrazení **diferenciální kryptoanalýzy** (Biham, Shamir 1991) se ukázalo, že S-boxy byly specificky navrženy *proti diferenciální analýze* — IBM o ní věděla už 1974 a NSA požádala o utajení. Žádný backdoor nebyl objeven.

### P-permutace

Pevná permutace 32 bitů, navržená pro maximální difúzi. Bit z výstupu jednoho S-boxu se v dalším kole stane vstupem několika různých S-boxů.

## Klíčový rozvrh — generování 16 subkey

Z 56bitového klíče se odvodí 16 *kolových klíčů* po 48 bitech.

1. **PC-1 (Permuted Choice 1):** výběr 56 bitů ze 64 (paritní bity 8, 16, ..., 64 se zahodí). Rozděleno na dvě 28-bit poloviny $C_0, D_0$.
2. **Pro každé kolo $i$:**
   * $C_i = \mathrm{LS}_i(C_{i-1})$, $D_i = \mathrm{LS}_i(D_{i-1})$ — *cyklický left shift* o 1 nebo 2 (záleží na čísle kola).
   * $K_i = \mathrm{PC{-}2}(C_i \| D_i)$ — výběr 48 ze 56 bitů.

Pro **dešifrování** se klíče použijí v *opačném pořadí* ($K_{16}, K_{15}, \dots, K_1$).

### Slabé klíče

DES má **4 slabé klíče** (kde všechny subkey jsou stejné) a **12 semi-slabých klíčů** (kde se 16 subkey redukuje na 2 různých):

```
Slabé klíče (před aplikací PC-1):
  0x0101010101010101
  0xFEFEFEFEFEFEFEFE
  0x1F1F1F1F0E0E0E0E
  0xE0E0E0E0F1F1F1F1
```

Slabé klíče způsobí, že DES je *involutivní* — $E_K(E_K(M)) = M$ (tj. $E_K = D_K$). Tato vlastnost je nežádoucí a útočník by ji mohl zneužít. V praxi má pravděpodobnost $\approx 2^{-54}$ — zanedbatelná, ale generátor klíčů by je měl filtrovat.

## Útoky na DES

### Brute force

Definováno klíčový prostor $2^{56}$. Detaily v [[delka-klice]] — EFF DES Cracker 1998 prolomil za 56 hodin.

### Diferenciální kryptoanalýza

Biham-Shamir (1991): **rozdíl** mezi dvěma plaintextovými páry vyústí v *předvídatelný* rozdíl v ciphertextech s nezanedbatelnou pravděpodobností. Útok vyžaduje $2^{47}$ vybraných plaintextů ([[utoky-blokove|CPA]]). Méně než $2^{56}$ brute force, ale stále neproveditelný pro 1991.

Pro DES s méně koly: 8 kol padne za sekundu, 12 kol za minuty. Plný 16-kolový DES je *navržený proti* diferenciální analýze — S-boxy splňují kritérium *vyrovnaných diferenčních distribučních tabulek*.

### Lineární kryptoanalýza

Matsui (1993): aproximace S-boxů lineárními kombinacemi bitů, které jsou s vychýlenou pravděpodobností pravdivé. Útok vyžaduje $2^{43}$ známých plaintextů ([[utoky-blokove|KPA]]). První praktická demonstrace: Matsui 1994, prolomil DES za 50 dní s 12 pracovními stanicemi.

### Davies-Murphy útok, MITM

Další útoky existují, ale brute force je pořád *nejjednodušší* — proto DES padl primárně kvůli krátkému klíči, ne kvůli strukturálním slabinám.

## DES — historický status

* **1977** — NBS publikace, FIPS PUB 46.
* **1986** — komerční varianty (DES-X, různé tweaks).
* **1998** — EFF DES Cracker prokázal nepraktičnost 56b klíče.
* **1999** — NIST zachoval DES, ale doporučil 3DES; vyhlášena soutěž AES.
* **2001** — AES jako FIPS 197.
* **2005** — NIST oficiálně vyřadil DES z FIPS PUB 46-3.
* **2017** — NIST SP 800-67 Rev. 2 stanovil odchod 3DES do 2023.

## Dědictví

DES je dnes *zakázaný* pro nové aplikace, ale jeho stopa zůstává:

* **3DES** ([[3des-aes]]) — kompozice 3 DES s 2 nebo 3 klíči. Pomalý, ale interoperabilní s DES hardwarem. Vytlačen AES od 2005.
* **Skipjack** (NSA, 1993, deklasifikováno 1998) — bloková šifra Clipper čipu, 80b klíč. Dnes zastaralá.
* **Akademicky:** DES je *kanonický učební* příklad Feistelovy struktury. Jeho diferenciální analýza je standardní postup v každém kursu kryptografie.

> **Lekce z DES:** veřejná akademická analýza po desetiletí *prokázala* sílu šifry (žádný strukturální průlom za 30+ let). Naopak proprietární šifry, které se utajením vyhnuly takovéto analýze (CSS, A5/2), padly téměř ihned po reverse-engineerování. Kerckhoffův princip ([[kerckhoff]]) v akci.

---

*Zdroj: KRY přednášky 2025/26, KRY 3 — Symetrické algoritmy. Externí reference: FIPS PUB 46-3: Data Encryption Standard (NIST, 1999); Biham, E., Shamir, A.: *Differential Cryptanalysis of the Data Encryption Standard* (Springer 1993); Matsui, M.: "Linear Cryptanalysis Method for DES Cipher", EUROCRYPT 1993; Coppersmith, D.: "The Data Encryption Standard (DES) and its strength against attacks", IBM J. Res. Develop. 38(3), 1994.*
