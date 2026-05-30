---
title: Útoky na blokové šifry
---

# Útoky na blokové šifry

Kromě [[delka-klice|brute force]] existuje řada *strukturálních* útoků, které zkoušejí najít slabinu v interní konstrukci šifry. Tyto útoky obvykle ne vedou k *prolomení* moderních šifer (AES, dnes Camellia), ale tvoří *bezpečnostní rámec* — návrhář musí prokázat, že šifra je vůči nim odolná, jinak nepřejde standardizační proces.

## Diferenciální kryptoanalýza

Biham, Shamir (1991) — formálně publikováno, ale IBM (Coppersmith) a NSA o ní věděly už 1974 (NSA požádala IBM o utajení; proto S-boxy DES *vypadají záhadně*, ale jsou *speciálně navrženy proti diferenciální analýze*).

### Princip

Útok zkoumá **rozdíl** mezi dvojicí plaintextů a *odpovídající* rozdíl mezi ciphertexty. Pokud má daná šifra *diferenční charakteristiku* — vzorec, kde určitý plaintext diff $\Delta_M$ vede k určitému ciphertext diff $\Delta_C$ s vyšší než průměrnou pravděpodobností $p$ — útočník nasbírá $\approx 1/p$ párů (CPA, vybraný plaintext) a najde klíč.

### Diferenční distribuční tabulka (DDT)

Pro každou nelineární komponentu šifry (S-box) sestavíme tabulku:

$$
\mathrm{DDT}[\alpha, \beta] = \#\{x : S(x) \oplus S(x \oplus \alpha) = \beta\}.
$$

Tabulka udává, *kolik vstupů $x$* dává vstupní diff $\alpha$ → výstupní diff $\beta$. Ideální S-box má rovnoměrnou DDT (každý záznam $\approx |\mathcal{X}| / |\mathcal{Y}|$). DES S-boxy splňují, že *žádný non-zero záznam* nemá hodnotu vyšší než 16 (z 64 vstupů) — to byl konkrétní designový cíl.

### Diferenciální útok na 16-kolový DES

Biham-Shamir 1991: charakteristika přes 13 kol s $p = 2^{-47}$. Útok vyžaduje $2^{47}$ vybraných plaintextů a má časovou složitost $2^{47}$. Pro 1991 nedostupné.

> Po prozrazení této techniky se objevila *řada* variant: **truncated differentials**, **higher-order differentials**, **impossible differentials**. Pro AES nejsilnější je impossible differential: $2^{99}$ pro AES-128 v 6 kolech (z 10).

## Lineární kryptoanalýza

Matsui (1993). Princip: nelineární S-box lze *lineárně aproximovat* — najít kombinaci vstupních a výstupních bitů, která je *vychýleně pravdivá* (pravděpodobnost $1/2 + \varepsilon$, kde $\varepsilon$ je *bias*).

::: math
\Pr[a \cdot x \oplus b \cdot S(x) = 0] = \frac{1}{2} + \varepsilon,
:::

kde $a, b$ jsou bitové masky a $\cdot$ je bitový dot product (XOR-suma vybraných bitů).

### Lineární aproximační tabulka (LAT)

$\mathrm{LAT}[a, b] = (\text{počet } x \text{ splňujících rovnici}) - |\mathcal{X}|/2$. Hodnota měří bias. Útočník hledá $a, b$ s největším bias a šíří aproximaci přes všechna kola šifry.

### Útok na DES

Matsui (1994): aproximace s bias $\approx 2^{-22}$, vyžaduje $2^{43}$ známých plaintextů (KPA, ne CPA — *jednodušší* model útočníka než diferenciální). Praktická demonstrace: 50 dní s 12 stanicemi.

### Lineární útok na AES

Pro AES je nejlepší známá lineární aproximace přes 4 kola; pro plných 10 kol je bias < $2^{-128}$ — neprolomitelné.

## Meet-in-the-Middle (MITM)

Útok proti kompozici dvou šifrování. Jeden ze základních důvodů, proč *2DES* nepřináší pozorovatelnou bezpečnost přes 1DES — a proč existuje *trojitý* DES.

### Princip MITM

Šifrujeme $C = E_{K_2}(E_{K_1}(M))$. Útočník zná dvojici $(M, C)$. Hledá $(K_1, K_2)$:

1. Pro každý $K_1$: spočti $X = E_{K_1}(M)$. Uložit $(X, K_1)$ do hash mapy. Čas $2^{56}$, paměť $2^{56}$.
2. Pro každý $K_2$: spočti $Y = D_{K_2}(C)$. Vyhledat $Y$ v mapě. Pokud najdeme $X = Y$, máme kandidát $(K_1, K_2)$.
3. **Filtrace:** kandidátů je $\approx 2^{56 + 56} / 2^{64} = 2^{48}$ falešných pozitivů. Druhý pár $(M', C')$ je vyfiltruje.

Celkem: $O(2^{56})$ čas, $O(2^{56})$ paměť — místo naivních $2^{112}$.

### Důsledky

* **2DES:** efektivně $\approx 2^{57}$ bezpečnosti, **stejně jako 1DES**. Nemá smysl ho používat.
* **3DES:** 3-key dává $\approx 2^{112}$ (MITM s tabulkou $2^{112}$ paměti).
* **Obecná lekce:** zdvojení šifry nezvýší bezpečnost lineárně. Konstrukce kompozic je *jemná*.

## Boomerang útok

Wagner (1999). Kombinuje diferenciální charakteristiky přes *čtyři* místa zprávy (rozdíly do "rohů obdélníku"). Často umožňuje útok přes víc kol než klasická diferenciální.

Pro AES: boomerang nejlepší pro 6–7 kol z 10. Plný 10-kolový AES je odolný.

## Algebraické útoky (XSL)

Courtois-Pieprzyk (2002): šifru lze vyjádřit jako *systém polynomiálních rovnic* nad $\mathrm{GF}(2)$. Pro AES je řešení (extrémně velkého) systému polynomiálních rovnic alternativní cesta k klíči.

XSL útok byl pro AES tvrzen jako $2^{100}$, ale kryptokomunita argumentuje, že odhad je *optimistický* — reálná složitost je nejspíš > $2^{200}$. AES *zatím* algebraické útoky nepoškodily, ale je to *otevřená oblast*.

## Útoky postranními kanály — side-channel

Útoky, které využívají *implementační* informaci, ne matematickou strukturu šifry.

### Timing útoky

Doba šifrování závisí na klíči (např. AES s tabulkami → cache hits/misses → měřitelný timing). **Cache timing útok** (Bernstein 2005, Osvik-Shamir-Tromer 2006) — vzdálený útočník dokáže získat klíč z aplikace, která šifruje data, prostě měřením doby odpovědí.

Obrana: **constant-time** implementace. AES-NI je inherentně constant-time (hardwarová instrukce bez tabulek). Software AES → bitslicing nebo nepoužívat lookup.

### Power analysis (SPA, DPA)

Kocher-Jaffe-Jun (1999) zavedli *Differential Power Analysis* — měření spotřeby čipové karty během šifrování odhalí klíč. Funguje proti AES, DES, RSA bez ochrany.

Obrana: **masking** (sdílení tajné hodnoty mezi nezávislé pozorovatelné stavy), randomized clock, dummy operations. Standardní v certifikovaných smartcard implementacích (Common Criteria EAL5+).

### Electromagnetic emanations

TEMPEST — měření EM záření čipu odhalí stav klíčových registrů. Vyžaduje fyzickou blízkost.

### Acoustic / Optical / Thermal

* Genkin-Shamir-Tromer (2014): získání RSA klíče z **zvuku procesoru**.
* Genkin-Pipman-Tromer (2015): get RSA key from **chassis ground potential**.
* Hutter-Schmidt (2014): získání AES klíče z **přehřátí čipu**.

## Útoky na nesprávně použitý kryptosystém

Většina reálných průlomů v 21. století *není* matematická slabina šifry, ale:

* **Padding oracle** (Vaudenay 2002, POODLE 2014) — viz [[padding-aead]].
* **Nonce reuse** (RFC 5116 GCM, Joux 2006) — opakovaný nonce v GCM → forgery.
* **Špatný RNG** (Debian OpenSSL 2008, RNG s entropií $2^{15}$) — predikovatelné klíče.
* **Downgrade** (FREAK 2015, Logjam 2015) — server akceptuje slabší starou variantu.
* **Implementační chyba** (Heartbleed 2014, GHOST glibc) — krádež klíče skrz buffer over-read.

> **Lekce pro praxi:** mathematicalně dobře navržená šifra (AES) může být v praxi zranitelná kvůli chybě v *protokolu*, *režimu*, *implementaci* nebo *generování klíčů*. Volit *vysokou úroveň* — používat AEAD knihovny ([[padding-aead|libsodium, Tink, BoringSSL]]) místo skládat primitiva vlastními silami.

---

*Zdroj: KRY přednášky 2025/26, KRY 3 — Symetrické algoritmy. Externí reference: Biham, E., Shamir, A.: *Differential Cryptanalysis of the Data Encryption Standard* (Springer 1993); Matsui, M.: "Linear Cryptanalysis Method for DES Cipher", EUROCRYPT 1993; Wagner, D.: "The Boomerang Attack", FSE 1999; Bernstein, D. J.: "Cache-timing attacks on AES" (2005); Kocher, P., Jaffe, J., Jun, B.: "Differential Power Analysis", CRYPTO 1999.*
