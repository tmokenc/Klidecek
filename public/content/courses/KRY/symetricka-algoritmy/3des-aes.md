---
title: 3DES a AES
---

# 3DES a AES

Po prolomitelnosti 56bitového klíče [[des|DESu]] hledala kryptokomunita náhradu. Krátkodobé řešení byl **3DES** (1998 standardizovaný NIST) — kompozice tří DES běhů s vícenásobným klíčem. Trvalé řešení byla soutěž **AES** (1997–2000) zakončená výběrem belgického algoritmu **Rijndael**, který od 2001 dominuje.

## 3DES — interim řešení

Pro 56b klíč DES nestačí. Jednoduchý nápad: aplikuj DES *vícekrát*. **Dvojitý DES** ($E_{K_2}(E_{K_1}(M))$) ovšem padá kvůli [[delka-klice|meet-in-the-middle útoku]] — efektivně dává jen ~57 bitů, ne 112.

**Trojitý DES (3DES, TDEA)** s 3 klíči:

::: math
C = E_{K_3}(D_{K_2}(E_{K_1}(M))), \qquad M = D_{K_1}(E_{K_2}(D_{K_3}(C))).
:::

Prostřední operace je *dešifrování* (Encrypt-Decrypt-Encrypt) — důvod *zpětné kompatibility*: pokud $K_1 = K_2 = K_3$, pak 3DES funguje jako jednoduchý DES.

### Varianty 3DES

| Verze | Klíče | Bezpečnost | Použití |
| :--- | :--- | :-: | :--- |
| **3-key 3DES** | $K_1, K_2, K_3$ nezávislé | 112 b (MITM) | Banky, chip cards |
| **2-key 3DES** | $K_1 = K_3 \neq K_2$ | 80 b | Legacy systémy |
| **1-key 3DES** | $K_1 = K_2 = K_3$ | 56 b | = DES, *neuvádí se jako 3DES* |

Pozor: ačkoli má 3-key 3DES *teoreticky* 168 bitů klíče, **efektivní bezpečnost je 112 bitů** kvůli MITM. NIST proto označuje 3DES jako *112-bit bezpečnostní úroveň*.

### Nevýhody 3DES

* **Pomalé.** 3× pomalejší než DES; v ~100× pomalejší než AES s AES-NI.
* **Malý blok (64 bitů).** Pro objemy nad 32 GB se začínají objevovat kolize bloků (paradox narozenin). *Sweet32* útok (Bhargavan, Leurent 2016) — exploituje to v HTTPS s 3DES nebo Blowfish.
* **Trojitý běh** zvyšuje útok times-memory tradeoff.

NIST SP 800-67 Rev. 2 (2017) stanovil termín *deprecation* 3DES na **2023**. Dnes je pouze v legacy systémech (banky s mainframy, EMV chip cards starší generace).

## Soutěž AES

NIST v lednu 1997 vyhlásil otevřenou *soutěž o náhradu DES*. Kritéria:

1. **Bezpečnost.** Bezpečnostní úroveň 128 / 192 / 256 bitů.
2. **Výpočetní efektivita.** Software i hardware, různé platformy.
3. **Veřejnost.** Algoritmus *veřejný*, *žádný patent*, posuzovaný akademickou komunitou.

### Kola soutěže

* **1998:** 15 podaných kandidátů (Rijndael, Twofish, Serpent, MARS, RC6, …).
* **1999:** 5 finalistů (Rijndael, Twofish, Serpent, MARS, RC6).
* **2000:** **Rijndael** vybrán (Joan Daemen, Vincent Rijmen, Katholieke Universiteit Leuven, Belgie).
* **2001:** FIPS PUB 197 — AES standard.

Rijndael zvítězil pro nejlepší kompromis rychlosti, bezpečnosti a implementační čistoty. Serpent byl *bezpečnostně robustnější* (32 kol versus 10), Twofish a MARS *flexibilnější*, ale Rijndael nejlépe splňoval celkovou rovnováhu.

## AES — struktura

AES (Advanced Encryption Standard, FIPS 197) je [[feistel-spn|substituční-permutační síť]]:

* **Blok:** 128 bitů (16 bajtů).
* **Klíč:** 128 / 192 / 256 bitů.
* **Počet kol:** 10 / 12 / 14 (podle velikosti klíče).
* **Stav:** matice 4 × 4 bajty (Nb = 4, Nk = 4/6/8).

### Jedno kolo AES (kromě posledního, kde chybí MixColumns)

1. **SubBytes** — každý bajt stavu prochází *S-boxem*. Nelineární.
2. **ShiftRows** — řádky stavu se cyklicky posunou (0., 1., 2., 3. řádek o 0, 1, 2, 3 pozic vlevo).
3. **MixColumns** — každý sloupec stavu projde *maticovým násobením* v $\mathrm{GF}(2^8)$. Difúze.
4. **AddRoundKey** — XOR s kolovým klíčem.

::: svg "AES — struktura jednoho kola"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40"  y="20" width="100" height="32" rx="6"/>
    <rect x="180" y="20" width="100" height="32" rx="6"/>
    <rect x="320" y="20" width="100" height="32" rx="6"/>
    <rect x="40"  y="120" width="100" height="32" rx="6"/>
    <rect x="180" y="120" width="100" height="32" rx="6"/>
    <rect x="320" y="120" width="100" height="32" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="90"  y="40">Vstup</text>
    <text x="230" y="40">SubBytes</text>
    <text x="370" y="40">ShiftRows</text>
    <text x="90"  y="140">MixColumns</text>
    <text x="230" y="140">AddRoundKey</text>
    <text x="370" y="140">Výstup</text>
  </g>
  <g stroke="var(--accent)" fill="none">
    <path d="M140,36 L180,36" marker-end="url(#aAES)"/>
    <path d="M280,36 L320,36" marker-end="url(#aAES)"/>
    <path d="M370,52 L370,80 L90,80 L90,120" marker-end="url(#aAES)"/>
    <path d="M140,136 L180,136" marker-end="url(#aAES)"/>
    <path d="M280,136 L320,136" marker-end="url(#aAES)"/>
  </g>
  <defs>
    <marker id="aAES" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="50" y="180">SubBytes: 16 paralelních 8b → 8b nelineárních substitucí (S-box = inverze v GF(2⁸) + afinní mapa).</text>
    <text x="50" y="195">ShiftRows: cyklický posun řádků o 0, 1, 2, 3 pozic — lineární difúze přes sloupce.</text>
    <text x="50" y="210">MixColumns: maticové násobení sloupce v GF(2⁸) — silná difúze. AddRoundKey: XOR s K_i.</text>
  </g>
</svg>
:::

::: viz aes-round "Stav AES jako 4×4 matice; klikněte na krok kola (SubBytes → ShiftRows → MixColumns → AddRoundKey). Zapnutím \"flip 1 bit\" sledujte lavinový efekt — odchylka se rozšiřuje exponenciálně."
:::

### S-box AES

Nelinearita s důkazatelnou diferenční a lineární uniformitou. Konstrukce:

::: math
\mathrm{S}(x) = A \cdot (x^{-1}) + b \quad \text{v } \mathrm{GF}(2^8),
:::

kde $x^{-1}$ je multiplikativní inverze (s $0^{-1} = 0$ konvencí), $A$ je afinní 8 × 8 matice nad $\mathrm{GF}(2)$, $b$ je konstanta. Tabulkovaný S-box má 256 vstupů a 256 výstupů (tabulka 256 bajtů). Inverzní operace pro dešifrování má vlastní inverzní tabulku.

### MixColumns

Každý sloupec stavu $(s_0, s_1, s_2, s_3)^T$ se násobí pevnou maticí v $\mathrm{GF}(2^8)$ (definice ireducibilní polynom $x^8 + x^4 + x^3 + x + 1$):

::: math
\begin{pmatrix} s'_0 \\ s'_1 \\ s'_2 \\ s'_3 \end{pmatrix} = \begin{pmatrix} 2 & 3 & 1 & 1 \\ 1 & 2 & 3 & 1 \\ 1 & 1 & 2 & 3 \\ 3 & 1 & 1 & 2 \end{pmatrix} \cdot \begin{pmatrix} s_0 \\ s_1 \\ s_2 \\ s_3 \end{pmatrix}.
:::

Tato matice je MDS (maximum distance separable) — *jedna* změněná bytě vstupu způsobí *4* změněné výstupní byty.

### Klíčový rozvrh AES

Z $\mathrm{Nk}$ slov hlavního klíče se generuje $\mathrm{Nb} \cdot (\mathrm{Nr}+1)$ kolových slov:

* Pro každé $i$, $W[i] = W[i - \mathrm{Nk}] \oplus f(W[i-1])$, kde $f$ je buď $\mathrm{RotWord} \circ \mathrm{SubWord} \oplus \mathrm{Rcon}$ (každých $\mathrm{Nk}$ slov) nebo prostá identita (jinak).

Pro AES-128: $4 \cdot 11 = 44$ slov (kolové klíče po 4 slovech).

## AES — vlastnosti

* **Bezpečnostní úroveň:** AES-128 nejlepší známý útok je biclique $\approx 2^{126.1}$ (prakticky bez relevance); AES-256 nejlepší známý útok je biclique $2^{254.4}$ (Bogdanov-Khovratovich-Rechberger 2011, jediný klíč), related-key Biryukov-Khovratovich 2009 dává $2^{99}$ (neprakticky).
* **Velmi rychlé v hardwaru:** Intel AES-NI od 2010, AMD AES od 2011 — typicky 5–10 GB/s/jádro. ARMv8 ma AES instrukce od 2011.
* **Software bez AES-NI:** Bitsliced AES (Käsper, Schwabe 2009) dosahuje ~1–2 GB/s; lookup-table AES je rychlejší (~500 MB/s), ale **trpí cache timing útoky** — useri AES bez AES-NI by měli použít bitsliced nebo ChaCha20-Poly1305.

### AES bezpečnost — útoky

* **Brute force:** $2^{128}$ / $2^{192}$ / $2^{256}$. Nedostupné.
* **Biclique attack** (Bogdanov-Khovratovich-Rechberger 2011): AES-128 v $2^{126.1}$, AES-192 v $2^{189.7}$, AES-256 v $2^{254.4}$. Akademický úspěch, prakticky bez relevance.
* **Related-key on AES-256:** $2^{99}$ (Biryukov-Khovratovich 2009). Problém je v *klíčovém rozvrhu*. V praxi *nelze* dosáhnout related-key v rozumném protokolu — vyžaduje, aby útočník mohl ovlivnit klíč.
* **Side-channel:** AES s lookup tabulkami uniká cache timing. Constant-time bitslicing nebo AES-NI eliminují.

> AES je *de facto* standard. Pro nové aplikace: AES-GCM (TLS, IPsec) nebo ChaCha20-Poly1305 (pokud HW akcelerace nedostupná).

## Související šifry

| Šifra | Autor / Rok | Blok | Klíč | Status |
| :--- | :--- | :-: | :-: | :--- |
| **Camellia** | NTT, Mitsubishi 2000 | 128 b | 128/192/256 b | RFC 3713; používaná v EMV |
| **Serpent** | Anderson, Biham, Knudsen 1998 | 128 b | 128/192/256 b | AES finalist; konservativní |
| **Twofish** | Schneier 1998 | 128 b | 128/192/256 b | AES finalist; PGP, TrueCrypt |
| **GOST 28147-89** | SSSR 1989 | 64 b | 256 b | Ruský standard; Feistel |
| **SM4** | Čínský standard 2012 | 128 b | 128 b | China commercial |
| **ARIA** | korejský standard | 128 b | 128/192/256 b | KS X 1213 |

## Doporučení (2024–2025)

* **Nové projekty:** AES-128-GCM nebo ChaCha20-Poly1305.
* **Vysoká hodnota / dlouhodobý archiv:** AES-256-GCM-SIV nebo XChaCha20-Poly1305.
* **3DES:** *neuvádět*, *migrovat* pryč. Sweet32 útok (2016) je praktický pro dlouhodobé spojení.
* **DES:** úplně zakázaný kromě interoperability s legacy.

---

*Zdroj: KRY přednášky 2025/26, KRY 3 — Symetrické algoritmy. Externí reference: FIPS PUB 197: Advanced Encryption Standard (NIST 2001); Daemen, J., Rijmen, V.: *The Design of Rijndael* (Springer 2002); NIST SP 800-67 Rev. 2: Recommendation for the Triple Data Encryption Algorithm (2017); Bhargavan, K., Leurent, G.: "On the Practical (In-)Security of 64-bit Block Ciphers — Collision Attacks on HTTP over TLS and OpenVPN", CCS 2016; Bogdanov, A., Khovratovich, D., Rechberger, C.: "Biclique Cryptanalysis of the Full AES", ASIACRYPT 2011.*
