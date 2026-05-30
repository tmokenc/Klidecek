---
title: Mifare Classic a Crypto-1
---

# Mifare Classic a Crypto-1

**Mifare Classic** (NXP, dříve Philips) je nejrozšířenější bezkontaktní RFID karta v Evropě — používá se pro **MHD jízdenky** (londýnská Oyster, holandská OV-chipkaart, pražská Lítačka, brněnská šalinkarta), **přístupové systémy** v budovách, hotely, sportoviště, *přes 2 miliardy karet* prodaných. Šifra **Crypto-1** v ní byla utajena od 1995 a v r. 2008 byla zreverzována — od té doby je **prolomena** za sekundy běžným notebookem.

## Hardware Mifare Classic

* **Frekvence:** 13,56 MHz (HF RFID, ISO 14443-A typ A).
* **Paměť:** Mifare Classic 1K (1 024 bajtů, 16 sektorů po 64 bajtech) nebo 4K (4 096 bajtů, 40 sektorů). Každý sektor obsahuje 3 datové bloky + 1 *sector trailer* s 2 klíči (Key A, Key B) a access conditions.
* **UID:** 4-bajtové sériové číslo (později 7-bajtové pro nové NUID karty).
* **Šifra:** Crypto-1 (48-bit stavový LFSR + nelineární filter function).
* **Autentizace:** challenge-response protokol mezi kartou a čtečkou před přístupem do sektoru.

## Crypto-1 — struktura

::: svg "Crypto-1: 48-bit LFSR s tapy, filter function f bere 20 bitů (5×4 výběry), vystupuje 1 bit keystreamu/tikání."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aC1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="500" height="40" rx="4"/>
    <rect x="80" y="130" width="380" height="40" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="64" font-size="13">48-bit LFSR — stav</text>
    <text x="270" y="155" font-size="12">filter function f (5 NAND-of-OR vrstev)</text>
  </g>
  <g fill="var(--text-muted)" font-size="9.5" text-anchor="middle">
    <text x="56"  y="100">9</text>
    <text x="118" y="100">11</text>
    <text x="180" y="100">13</text>
    <text x="242" y="100">15</text>
    <text x="304" y="100">17</text>
    <text x="366" y="100">19</text>
    <text x="428" y="100">21</text>
    <text x="490" y="100">23</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1" fill="none" stroke-dasharray="2 2">
    <path d="M56,80 L56,128"/>
    <path d="M118,80 L118,128"/>
    <path d="M180,80 L180,128"/>
    <path d="M242,80 L242,128"/>
    <path d="M304,80 L304,128"/>
    <path d="M366,80 L366,128"/>
    <path d="M428,80 L428,128"/>
    <path d="M490,80 L490,128"/>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aC1)">
    <path d="M270,170 L270,200"/>
  </g>
  <text x="270" y="210" font-size="11" text-anchor="middle" fill="var(--accent)">→ keystream bit</text>
</svg>
:::

* **Stav:** 48-bit LFSR.
* **Feedback polynomial:** $x^{48} + x^{43} + x^{39} + x^{38} + x^{36} + x^{34} + x^{33} + x^{31} + x^{29} + x^{24} + x^{23} + x^{21} + x^{19} + x^{13} + x^9 + x^7 + x^6 + x^5$.
* **Filter function $f$:** bere 20 bitů ze 48 (pozice 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47) — *jen liché pozice* od 9 výše. Těchto 20 bitů se rozdělí do pěti 4-bitových bloků; každý blok projde 4-vstupní funkcí první vrstvy (střídavě $f_a$ a $f_b$). Pět výsledných bitů poté vstupuje do jediné 5-vstupní finální funkce $f_c$, jejíž výstup je keystream bit (tj. pět 4-vstupních funkcí → jedna 5-vstupní funkce).
* **Klíč:** 48 bitů (přímo počáteční stav LFSR).

## Autentizační protokol

Trojfázový challenge-response (před přístupem do každého sektoru):

1. **Card:** vyšle UID a *card nonce* $n_T$ (32-bit nonce).
2. **Reader:** inicializuje Crypto-1 ze stavu $K \oplus \text{UID}$ (klíč daný od UID + master key + sector číslo) a nakrmí jej $n_T$. Zvolí reader nonce $n_R$ a generuje po sobě jdoucí segmenty keystreamu $ks_1$, $ks_2$, $ks_3$. Vyšle $\{n_R\} = n_R \oplus ks_1$ a $a_R = \mathrm{suc}^2(n_T) \oplus ks_2$, kde $\mathrm{suc}()$ je nástupnická funkce Crypto-1.
3. **Card:** ověří, že $a_R$ odpovídá očekávanému $\mathrm{suc}^2(n_T)$. Pokud ano, odpoví $a_T = \mathrm{suc}^3(n_T) \oplus ks_3$.

Po autentizaci karta i čtečka mají *stejný* keystream a šifrují/dešifrují všechny příkazy a data.

## Útoky

### Útok č. 1 — Crypto-1 reverz (Nohl, Plötz 2007)

[Karsten Nohl a Henryk Plötz](https://events.ccc.de/congress/2007/Fahrplan/events/2378.en.html) na 24C3 (Chaos Communication Congress):

* Decap Mifare čipu (Philips MF1ICS50).
* Optický mikroskop + ruční trasování gates.
* Identifikace struktury LFSR + filter function.

Specifikace odhalena — během několika měsíců následovaly útoky.

### Útok č. 2 — Garcia et al. 2008

[*Wirelessly Pickpocketing a Mifare Classic Card*](https://www.cs.ru.nl/~flaviog/publications/Pickpocketing.Mifare.pdf) (Garcia, de Koning Gans, Muijrers, van Rossum, Verdult, Wichers Schreur, Jacobs):

* **Korelační útok** na keystream — Crypto-1 má statisticky nelineární filter function, ale po dostatečném počtu bitů (~50) lze statisticky odvodit klíč.
* **Online attack:** ~40 ms na běžném notebooku, vyžaduje ~50 challenges od kary.
* **Offline attack** (s rainbow tables): ~12 sekund, vyžaduje ~150 GB precomputed.

### Útok č. 3 — Nested attack (Garcia 2009)

Při znalosti *jednoho* klíče (např. továrního default klíče $K_A = 0xFFFFFFFFFFFF$, který mnoho zařízení nikdy nezmění) lze rozšířit na další sektory:

* Authentizace sektoru $i$ s klíčem $K_i$ probíhá *po* autentizaci sektoru $j$ — *aniž by se LFSR resetoval*. To znamená, že keystream pokračuje *predikovatelně*.
* Z útoku na první klíč (slabý filter) odvodí stav LFSR, pak postupně po sektorech získá další klíče.

Praktický nástroj **`mfoc` (Mifare Offline Cracker)** spustí útok automaticky během 1–3 minut na běžné kartě.

### Útok č. 4 — Hardnested + Darkside (2010, 2017)

* **Hardnested** — varianta pro karty, kde výrobce některé sektory zakázal (žádný známý klíč). Útočí přímo na *nonce structure*; vyžaduje ~5–30 minut.
* **Darkside** — pro karty *bez jediného známého klíče*. Využívá *parity bug* v Mifare Classic (kontrolní parita v autentizaci leaks 1 bit informace).

V r. 2026 jsou všechny tyto nástroje veřejné, free, běží na běžných USB readerech (Proxmark3, ACR122U, Chameleon Mini, **iPhone s NFC** s aplikacemi typu *NFC Tools*) a *prakticky každá* Mifare Classic karta je dnes klonovatelná.

## Reálné dopady

* **OV-chipkaart** (Nizozemsko) — útok demonstrován studenty Radboud University 2008. Karta umožnila "jízdu zdarma" do té doby, než ji NS nahradil systémem s server-side verification.
* **London Oyster** — útok demonstrován [Plötz, Nohl 2008](https://www.youtube.com/watch?v=BMs_4mwgmlA). TfL přešel na ITSO-based karty.
* **Pražská Lítačka** — kombinace Mifare DESFire (bezpečnější) pro nové karty + server-side log. Klonování *staré* Lítačky bylo prakticky možné.
* **Brněnská šalinkarta** (DPMB) — historicky Mifare Classic; v r. 2014 přechod na DESFire.
* **Hotelové zámky** — mnohé používaly Mifare Classic ([Onity case, 2012](https://www.cnet.com/tech/services-and-software/researcher-hacks-hotel-locks-with-arduino/)) — útoky veřejně demonstrované.

## Náhrada — Mifare DESFire, Mifare Plus

**Mifare DESFire EV1/EV2/EV3** — používá **3DES** nebo **AES** místo Crypto-1; uses *random nonces from CSPRNG*; mutual authentication s MAC. *Není* zranitelná uvedeným způsobem (k roku 2025 nejsou veřejné útoky proti DESFire EV2/EV3 s AES).

**Mifare Plus** — přechodový krok; podporuje *jak* Crypto-1, *tak* AES módy (pro postupný roll-out).

**Mifare Ultralight** — nejlevnější karta, bez šifry; používá se pro *single-trip* tickets, kde se autentizace dělá na *server-side* (database lookup, ne na kartě).

> Pravidlo: pro nové návrhy *nikdy* nepoužívej Mifare Classic. Použij DESFire (s AES), nebo lépe Smart MX (smart card s OS).

## Lekce

1. **Closed cipher → vlna útoků po reverze.** Mifare Classic přežil 12 let v utajení; pak padl za 6 měsíců po decap. STO je jen *odložení útoku*, ne ochrana.
2. **Krátký stav je smrt.** 48-bit LFSR nikdy nemůže být bezpečný — Hellmanův time-memory tradeoff ho rozbije.
3. **Filtr function bias je fatální.** I "nelineární" funkce s malou statistickou výchylkou (např. Pr[output = LSB] = 0.5 + ε) padne korelačním útokem.
4. **Default klíče v produkci jsou katastrofa.** Mnoho přístupových systémů nikdy nepřepsalo `0xFFFFFFFFFFFF` — Nested attack na ně padá triviálně.
5. **API design matters.** *Nested* útok funguje, protože LFSR se mezi autentizacemi *neresetuje* — to je API rozhodnutí, ne slabost šifry. Současný DESFire neporušuje toto pravidlo.

---

*Zdroj: BZA přednášky 2025/26, BZA 03 — LFSR. Externí reference: Garcia, F. D. et al.: *Wirelessly Pickpocketing a Mifare Classic Card* (IEEE S&P 2009) — [PDF](https://www.cs.ru.nl/~flaviog/publications/Pickpocketing.Mifare.pdf); Nohl, K., Evans, D., Starbug, Plötz, H.: *Reverse-Engineering a Cryptographic RFID Tag* (USENIX Security 2008) — [PDF](https://www.usenix.org/legacy/event/sec08/tech/full_papers/nohl/nohl.pdf); Almeida, M.: *Hacking Mifare Classic Cards* (Black Hat São Paulo 2014) — [slides](https://www.blackhat.com/docs/sp-14/materials/arsenal/sp-14-Almeida-Hacking-MIFARE-Classic-Cards-Slides.pdf); Verdult, R., Garcia, F. D.: *Cryptanalysis of the Mifare Classic Variant* (CARDIS 2009).*
