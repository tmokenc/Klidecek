---
title: DRNG vs. TRNG — typy generátorů náhodných čísel
---

# DRNG vs. TRNG — typy generátorů náhodných čísel

Náhodná čísla v kryptografii nejsou luxus — jsou *kritický* materiál. Klíče, IV, nonce, podpisové soli, blinding factors, padding, ECDSA $k$ — všechno tohle musí být nepredikovatelné. Pokud útočník dokáže reprodukovat výstup generátoru, padají na něm postavené ciphertexty, podpisy, nonces. *"Anyone who considers arithmetical methods of producing random digits is, of course, in a state of sin."* — John von Neumann.

## Klasifikace zdrojů

Standard [ISO/IEC 18031] a německý BSI [AIS-31] rozlišují tři základní třídy:

::: svg "Klasifikace RNG: DRNG (deterministický), PTRNG (fyzikální), NPTRNG (nefyzikální TRNG), Hybrid DRNG (kombinace)."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="30" width="240" height="90" rx="8"/>
    <rect x="20" y="135" width="240" height="90" rx="8"/>
    <rect x="280" y="30" width="240" height="90" rx="8"/>
    <rect x="280" y="135" width="240" height="90" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="140" y="50" font-size="12.5">DRNG (deterministic)</text>
    <text x="140" y="70" font-size="10.5" fill="var(--text-muted)">seed → AES-CTR, HMAC-DRBG…</text>
    <text x="140" y="88" font-size="10" fill="var(--text-muted)">stejný seed → stejný výstup</text>
    <text x="140" y="106" font-size="10" fill="var(--accent)">SP 800-90A, ISO 18031</text>
    <text x="400" y="50" font-size="12.5">PTRNG (physical TRNG)</text>
    <text x="400" y="70" font-size="10.5" fill="var(--text-muted)">šumové diody, ring osc., kvant.</text>
    <text x="400" y="88" font-size="10" fill="var(--text-muted)">entropie z fyz. procesu</text>
    <text x="400" y="106" font-size="10" fill="var(--accent)">AIS-31 PTG.1–PTG.3</text>
    <text x="140" y="155" font-size="12.5">NPTRNG (non-physical TRNG)</text>
    <text x="140" y="175" font-size="10.5" fill="var(--text-muted)">HID události, disk IRQ…</text>
    <text x="140" y="193" font-size="10" fill="var(--text-muted)">/dev/urandom v Linuxu</text>
    <text x="140" y="211" font-size="10" fill="var(--accent)">AIS-31 NTG.1</text>
    <text x="400" y="155" font-size="12.5">Hybrid DRNG</text>
    <text x="400" y="175" font-size="10.5" fill="var(--text-muted)">DRNG + průběžné reseedování</text>
    <text x="400" y="193" font-size="10" fill="var(--text-muted)">z PTRNG/NPTRNG</text>
    <text x="400" y="211" font-size="10" fill="var(--accent)">AIS-31 DRG.4</text>
  </g>
</svg>
:::

### DRNG — Deterministic RNG (PRNG, CSPRNG)

* **Princip:** zpracovává krátký *seed* deterministickou funkcí a generuje libovolně dlouhou pseudonáhodnou sekvenci.
* **Příklady:**
  * **AES-CTR DRBG** (NIST SP 800-90A) — vstupní AES klíč slouží jako stav, čítač generuje výstup; reseed přidáním entropie.
  * **HMAC-DRBG** — pomocí HMAC-SHA-256; používá se v BoringSSL, libsodium.
  * **Hash DRBG** — řetězené hashování (SHA-256 nebo SHA-512).
  * **ANSI X9.17** — historicky důležitý DRNG založený na 3DES s časovou složkou. Dnes nahrazený.
  * **ChaCha20-DRBG** — Linux od 5.18 používá ChaCha20 jako jádro DRNG ([[linux-rng]]).
* **Vlastnosti** (požadavky AIS-31):
  * **R1** — výstupy mají dobré statistické vlastnosti (uniform distribution).
  * **R2** — znalost podsekvence nedovolí spočítat sousední čísla s nenulovou výhodou (forward/backward sequence unpredictability).
  * **R3 (backward secrecy)** — znalost vnitřního stavu *nedovolí* spočítat *minulé* výstupy.
  * **R4 (forward secrecy)** — znalost vnitřního stavu *nedovolí* spočítat *budoucí* výstupy.
* **Pro:** rychlý (Gb/s), reprodukovatelný (užitečné pro testy), nepotřebuje fyzický zdroj.
* **Proti:** *bez seedu nezačne* — pokud seed unikne, je všechno odhalitelné. **Dual EC DRBG** (NIST SP 800-90A revize 2007) byl právě toho příkladem — backdoor vložil možnost rekonstruovat stav z malého počtu výstupů, odhalen 2007 (Shumow-Ferguson), stažen 2014.

### PTRNG — Physical True RNG

* **Princip:** generuje bity z **fyzikálního procesu** s vnitřní nepredikovatelností (kvantové nebo termodynamické).
* **Příklady fyzikálních zdrojů:**
  * **Šumové diody** (Zener noise, lavinový průraz) — zesílený elektrický šum.
  * **Ring oscillator jitter** — rozdíl fáze dvou volně běžících oscilátorů; nejlevnější varianta v ASIC/FPGA.
  * **Radioaktivní rozpad** — historický (Geigerova trubice, lampová klika); kvantově nepredikovatelný.
  * **Kvantové RNG** — single-photon polarization (ID Quantique), beam splitter, vacuum quantum fluctuations.
  * **Termálni šum SRAM cells** při startu (PUF — viz [[puf]]).
* **Vlastnosti** (AIS-31 PTG.1–PTG.3):
  * **PTG.1** — vnitřní testy detekují totální selhání zdroje entropie a netolerovatelné statistické vady.
  * **PTG.2** — navíc *stochastický model* zdroje entropie a statistické testy *raw* dat.
  * **PTG.3** — PTG.2 + kryptografické post-processing (hybrid PTRNG); de facto požadavek pro vyšší certifikace.
* **Pro:** *opravdu* náhodné v informačně-teoretickém smyslu; nezávisí na neznámém faktu kryptoanalýzy.
* **Proti:** pomalé (Mb/s nebo méně), citlivé na teplotu, stárnutí, atak (heat, RF interference). Vyžadují průběžnou kalibraci a online testy.

### NPTRNG — Non-Physical True RNG

* **Princip:** entropie se sbírá z **nedeterministických událostí v systému** — uživatelské vstupy (klávesnice, myš), přerušení od disků, síťové timing.
* **Příklad:** Linux `/dev/random`, `/dev/urandom` — viz [[linux-rng]].
* **Pro:** žádný dedikovaný HW — k dispozici na libovolném počítači.
* **Proti:** *malá* entropie krátce po startu (boot time entropy starvation), zejména u headless serverů a virtualizovaných VM. Po dlouhých letech debate se Linux přepnul na *blocking until seeded* a [getrandom(2)](https://man7.org/linux/man-pages/man2/getrandom.2.html).

### Hybrid DRNG

* **Princip:** *deterministický* DRBG s průběžným *přiseedováním* z PTRNG nebo NPTRNG.
* **Cíl:** spojit rychlost DRNG s "nekonečnou" entropií fyzikálního zdroje — kompenzuje pomalost TRNG a zároveň získává *enhanced forward secrecy* (kompromitace stavu se po nějaké době "zahojí").
* **Příklady:** AIS-31 DRG.4, NIST SP 800-90C, Intel RDRAND/RDSEED, Linux ChaCha20 + entropy pool.

## Útok č. 1 — slabý seed: Kerberos v4

Kerberos verze 4 (DEC, MIT) používal pro generování klíčů svou vlastní variantu DRNG seedovanou z:

* Času (kolik sekund od epochy, ~32 bitů, ale prakticky ~24 bitů známých na minutu).
* PID procesu (~16 bitů).
* Hostname (deterministicky, 0 bitů entropie).

Reálná entropie: ~20 bitů. Útok hrubou silou v r. 1996 ([Bryn Dole, Steve Lodin, Eugene Spafford](https://www.cs.purdue.edu/homes/spaf/tech-reps/9659.pdf)): klíče Kerberosu zjištěny v *milisekundách*. Lesson learned: každý "self-rolled" RNG hraje vábničku.

## Útok č. 2 — slabý seed: PHP rand()

Klasický `rand()` v PHP byl po dlouhá léta jen `glibc rand()` (LCG, lineární kongruenční generátor):

::: math
X_{n+1} = (1\,103\,515\,245 \cdot X_n + 12\,345) \bmod 2^{31}
:::

LCG je *triviálně* predikovatelný — ze 2 výstupů jde rekonstruovat stav a generovat *všechny* další. Použití pro session ID, password reset tokens, captcha — všechno tohle padlo na to. Dnes PHP používá Mersenne Twister, který je o něco lepší ze statistického hlediska, ale **stále není CSPRNG** — ze ~624 výstupů jde také rekonstruovat. Bezpečnostně se má používat `random_bytes()`/`random_int()`, které sahají do OS CSPRNG.

> **Pravidlo:** v kryptografii **nikdy** nepoužívej `rand()`, `srand()`, `Math.random()`, `java.util.Random` — všechny jsou statistické generátory, ne kryptografické. Použij `getrandom()`, `arc4random()`, `/dev/urandom`, `crypto.randomBytes()`, `SecureRandom`.

## Útok č. 3 — opakovaný IV: WEP

WEP RC4 ([[a51-gsm|proudová šifra]]) používá 24-bit IV, generovaný jen prefixovaným čítačem. Po $2^{24}$ paketech (zlomek hodiny na rychlém Wi-Fi) se IV opakuje — keystream XOR keystream poskytne `plain XOR plain`, z čehož se se známým otevřeným textem nebo známou hlavičkou WEP rekonstruuje klíč (FMS útok, KoreK útok, PTW útok).

Lekce: i správný DRNG s krátkým výstupem (24 bitů) selže narozeninovou pravděpodobností — pro IV bývá třeba alespoň 96 bitů (AES-GCM) nebo 192 bitů (XChaCha20).

## Co je v praxi *správně*

* **OS CSPRNG**: `getrandom(2)` na Linuxu, `BCryptGenRandom` na Windows, `SecRandomCopyBytes` na macOS/iOS, `arc4random()` na BSD. Tyto rozhraní jsou udržované odborníky a opírají se o jaderný entropy pool.
* **Knihovny:** libsodium `randombytes_buf()`, OpenSSL `RAND_bytes()`, BoringSSL `RAND_bytes()`. Tyto knihovny mají vlastní DRBG, ale reseedují z OS.
* **HW RNG instrukce:** Intel `RDRAND`/`RDSEED`, ARM `RNDR`/`RNDRRS` — dnes součást běžných CPU. Linux je míchá do entropy pool.
* **Certifikované moduly:** smartkarty (AIS-31 PTG.3), HSM (FIPS 140-3 Level 4) — tyto jsou nezbytné pro vysokou jistotu (CA klíče, vládní certifikace).

---

*Zdroj: BZA přednášky 2025/26, BZA 02 — Generátory náhodných čísel. Externí reference: NIST SP 800-90A Rev. 1 — *Recommendation for Random Number Generation Using Deterministic Random Bit Generators* (2015) — [PDF](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-90Ar1.pdf); Koc, Ç. K.: *Cryptographic Engineering* (Springer 2008), kap. 2; Killmann, W., Schindler, W.: *A Proposal for Functionality Classes for Random Number Generators*, BSI AIS-31 (2011) — [PDF](https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Zertifizierung/Interpretationen/AIS_31_Functionality_classes_for_random_number_generators_e.pdf).*
