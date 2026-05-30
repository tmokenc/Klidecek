---
title: Modely útoků a cíle útočníka
---

# Modely útoků a cíle útočníka

Kryptografie se nehodnotí v abstraktu, ale **vůči konkrétnímu modelu útočníka**. Tvrzení "AES je bezpečný" nedává smysl bez upřesnění, *co útočník vidí*, *co může poslat* a *co chce zjistit*. Bez modelu útoku není vůbec jasné, *co* má šifra zajistit.

## Co útočník vidí — modely podle informačního přístupu

Útoky tříděné podle toho, kolik vstupů má útočník k dispozici (od *nejslabšího* po *nejsilnější*):

1. **Ciphertext-Only Attack (COA)** — útočník zná pouze šifrovaný text. Pokud šifra padne i v tomto modelu, je vážně rozbitá. Klasická frekvenční analýza monoalfabetické substituce ([[mono-substituce]]) je COA.

2. **Known-Plaintext Attack (KPA)** — útočník zná dvojice $(M_i, C_i)$, ale neměl možnost si je zvolit. Reálný scénář: stejné hlavičky e-mailů, standardní úvody dokumentů, předvídatelné protokolové zprávy. Lineární kryptoanalýza DESu ([[utoky-blokove]]) potřebuje řád $2^{43}$ známých dvojic.

3. **Chosen-Plaintext Attack (CPA)** — útočník si zvolí $M_i$ a získá $C_i = E_K(M_i)$. Modeluje situaci, kdy útočník může donutit oběť šifrovat libovolný vstup (např. injekcí do logu, který se šifruje). Diferenciální kryptoanalýza je CPA.

4. **Chosen-Ciphertext Attack (CCA)** — útočník si zvolí $C_i$ a získá $M_i = D_K(C_i)$. Modeluje *padding oracle*, *timing oracle* nebo SSL/TLS chybu, kdy server vrací informaci o správnosti dešifrování. Útok Bleichenbacher (1998) proti RSA-PKCS#1v1.5 je CCA — kritický pro reálné systémy.

5. **Adaptive CCA (CCA2)** — útočník volí $C_i$ *adaptivně* podle předchozích výsledků. Standardní bezpečnostní cíl moderních asymetrických schémat ([[rsa-utoky|RSA-OAEP, KEM]]).

::: svg "Hierarchie modelů útoku — síla útočníka roste směrem dolů"
<svg viewBox="0 0 520 220" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aKRY2" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="50"  y="20"  width="420" height="28" rx="6"/>
    <rect x="50"  y="60"  width="420" height="28" rx="6"/>
    <rect x="50"  y="100" width="420" height="28" rx="6"/>
    <rect x="50"  y="140" width="420" height="28" rx="6"/>
    <rect x="50"  y="180" width="420" height="28" rx="6"/>
  </g>
  <g fill="var(--text)" font-size="12">
    <text x="260" y="38" text-anchor="middle">COA — útočník vidí pouze C</text>
    <text x="260" y="78" text-anchor="middle">KPA — útočník zná (M_i, C_i) pro daná i</text>
    <text x="260" y="118" text-anchor="middle">CPA — útočník vybere M_i a získá C_i</text>
    <text x="260" y="158" text-anchor="middle">CCA — útočník vybere C_i a získá M_i</text>
    <text x="260" y="198" text-anchor="middle">CCA2 — adaptivní volba C_i podle předchozích výstupů</text>
  </g>
  <g stroke="var(--text-muted)" stroke-width="1" fill="none" marker-end="url(#aKRY2)">
    <path d="M488,30 L488,200"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="508" y="114" text-anchor="middle" transform="rotate(90 508 114)">síla útočníka</text>
  </g>
</svg>
:::

> Bezpečnost vůči silnějšímu modelu *implikuje* bezpečnost vůči slabšímu (CCA-bezpečné schéma je i KPA-bezpečné), nikoli naopak. Praktický cíl pro moderní šifry je **IND-CCA2** (indistinguishability under adaptive chosen-ciphertext attack).

## Co útočník chce — cíle útoku

Druhá osa klasifikace: *čeho* chce útočník dosáhnout. Cíle uvádím od nejcennějšího (úplné prolomení) po nejslabší (rozlišení).

* **Total break** — útočník zjistí klíč $K$. Pak může šifrovat i dešifrovat libovolné zprávy.
* **Global deduction** — útočník najde *ekvivalentní* algoritmus (jiný $E'$, který bez znalosti $K$ dává stejné výstupy). Funkčně stejně silný útok.
* **Instance / local deduction** — útočník dešifruje jednu konkrétní zprávu, ale klíč nezjistí.
* **Information deduction** — útočník získá *nějakou částečnou* informaci o $M$ (např. první bit, paritu, statistický odhad).
* **Distinguishing attack** — útočník dokáže šifrovaný výstup rozlišit od náhodného řetězce. Pro moderní šifry je *toto* minimální bezpečnostní laťka — pokud lze rozlišit, šifra "uniká" strukturu.

> Pro klasickou šifru je obvyklý cíl *total break*. Pro moderní AEAD ([[padding-aead]]) je laťka *indistinguishability* — útočník by neměl být schopen ani odhadnout, který ze dvou vybraných plaintextů byl zašifrován.

## Útok hrubou silou — referenční měřítko

Brute-force útok prochází všechny klíče $K \in \mathcal{K}$ a zkouší dešifrovat. Pro každý kandidát musí umět rozhodnout, zda je výsledek "smysluplný" (např. validní ASCII, ZIP hlavička, …).

::: math
T_{\text{brute}} = \frac{|\mathcal{K}|}{2 \cdot v},
:::

kde $v$ je rychlost útočníka v testech za sekundu. Průměr je $|\mathcal{K}|/2$, protože *očekávaný* čas najít správný klíč je polovina prohledávání.

| Délka klíče | $\|\mathcal{K}\|$ | Brute @ 1 G op/s | Brute @ 1 P op/s |
| :-: | :-: | :-: | :-: |
| 40 b | $1{,}1 \cdot 10^{12}$ | 9,5 minut | 0,55 ms |
| 56 b (DES) | $7{,}2 \cdot 10^{16}$ | 416 dní | 36 s |
| 80 b | $1{,}2 \cdot 10^{24}$ | $1{,}9 \cdot 10^{7}$ let | 19 let |
| 112 b (3DES) | $5{,}2 \cdot 10^{33}$ | $8{,}2 \cdot 10^{16}$ let | $8{,}2 \cdot 10^{10}$ let |
| 128 b (AES-128) | $3{,}4 \cdot 10^{38}$ | $5{,}4 \cdot 10^{21}$ let | $5{,}4 \cdot 10^{15}$ let |
| 256 b (AES-256) | $1{,}2 \cdot 10^{77}$ | $1{,}8 \cdot 10^{60}$ let | $1{,}8 \cdot 10^{54}$ let |

Brute force tedy definuje *spodní hranici* obtížnosti — žádný útok proti symetrické šifře nemůže být lehčí. **Užitečná šifra** se chová tak, jako by *jen* brute force fungoval (žádný strukturální útok není znám).

## Postranní kanály (side channels)

Útočné modely výše berou jako vstup jen *kryptografická data*. V praxi unikají informace i jinými kanály:

* **Časování** (timing) — doba dešifrování závisí na klíči nebo na obsahu plaintextu. Bleichenbacher, Lucky 13.
* **Spotřeba** (power analysis) — SPA/DPA na čipové karty.
* **Elektromagnetické vyzařování** — TEMPEST.
* **Akustické** — útoky odposlechem zvuku CPU/diody.
* **Cache** — Flush+Reload, Prime+Probe; AES s tabulkovou implementací uniká přes cache.
* **Speculative execution** — Spectre, Meltdown (2018).

Defenzivní praxe: **constant-time** implementace (žádné větvení podle tajné hodnoty), **masking** (sdílení tajné hodnoty mezi nezávislé komponenty), **blinding** (přidání náhodného maskování před operací). Constant-time AES bez tabulek je dnes standard (AES-NI, bitslicing).

## Útok versus implementační chyba

Většinu "kryptografických" průlomů v praxi *netvoří* matematicky novou kryptoanalýzu, ale chybu na rozhraní algoritmus / protokol / programátor:

* **Nesprávné IV** — opakování v CBC, totéž v GCM (porušení autenticity).
* **Padding oracle** — Vaudenay 2002 proti CBC-PKCS#7.
* **Špatný RNG** — Debian OpenSSL 2006-2008, RNG s entropií 2$^{15}$.
* **Downgrade** — FREAK, POODLE, Logjam u TLS.
* **Heartbleed** — buffer over-read v OpenSSL, ne kryptografická chyba per se.
* **Length-extension** — naivní použití SHA-1/SHA-256 jako MAC; viz [[hash-utoky]].

Z hlediska studia kryptografie je *třeba* znát jak kryptoanalýzu (matematickou stranu), tak typické implementační vzory ([[padding-aead|AEAD]], constant-time, KDF, [[kerckhoff|Kerckhoffův princip]]).

---

*Zdroj: KRY přednášky 2025/26, KRY 1 — Klasická kryptografie, KRY 3 — Symetrické algoritmy. Externí reference: Katz, J., Lindell, Y.: *Introduction to Modern Cryptography* (3rd ed., CRC Press 2020), kap. 3; Boneh, D., Shoup, V.: *A Graduate Course in Applied Cryptography* (v0.6, 2023), kap. 2; Bleichenbacher, D.: "Chosen Ciphertext Attacks Against Protocols Based on the RSA Encryption Standard PKCS #1", CRYPTO 1998.*
