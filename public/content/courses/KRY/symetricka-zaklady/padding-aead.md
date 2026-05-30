---
title: Padding, MAC a AEAD
---

# Padding, MAC a AEAD

Symetrické šifrování samo o sobě **nezaručuje integritu** — útočník, který nezná klíč, sice nepřečte plaintext, ale může *manipulovat* s ciphertextem a tím změnit plaintext po dešifrování. V CTR režimu ([[rezimy]]) navíc bit-flipping mění *přesně odpovídající bit* plaintextu. Klíčové komponenty pro řešení: *padding* (vyplnění do bloku), *MAC* (autentizační kód), a *AEAD* (autenticky šifrované s asociovanými daty).

## Padding — vyplnění do bloku

Bloková šifra vyžaduje plaintext, jehož délka je *násobek* velikosti bloku $n$ (typicky 16 bajtů). Padding je algoritmus, který doplní zprávu na násobek $n$ a *jednoznačně* vyjmutelný po dešifrování.

### PKCS#7 padding (nejpoužívanější)

Pokud zpráva má $m$ bajtů a velikost bloku je $n$, pak doplníme $p = n - (m \bmod n)$ bajtů, *každý s hodnotou $p$*:

```
M = "HELLO" (5 bajtů), n = 8

Padding: 8 - 5 = 3
M' = "HELLO\x03\x03\x03"
```

Pokud $m$ už je násobek $n$, přidáme **plný blok paddingu** (8× hodnota 8). Bez tohoto pravidla by nešlo rozlišit zprávu s/bez paddingu.

### Dešifrování + odstranění paddingu

Po dešifrování poslední blok obsahuje padding. Stačí přečíst poslední bajt — jeho hodnota $p$ říká, kolik bajtů odstranit. Pokud poslední bajt je $p$, předposlední by měl být také $p$, atd. po $p$ bajtech zpět.

### Padding oracle útok (Vaudenay 2002)

Slabost: pokud server *odlišně* reaguje na "padding ok" vs. "padding chybný" (např. HTTP 200 vs. HTTP 500, nebo dvě různé chybové hlášky, nebo *měřitelný* rozdíl v latenci), útočník dokáže dešifrovat zprávu.

**Principle:** útočník modifikuje předposlední blok $C_{i-1}$, dokud po dešifrování poslední blok $M_i = D_K(C_i) \oplus C_{i-1}$ nemá platný padding. Z $C_{i-1}$ pak vyčte $D_K(C_i)$.

**Náklady:** $128 \cdot |M|$ dotazů (jeden byte poznáváme za 128 pokusů, opakuji pro každý byte zprávy).

::: viz padding-oracle "Klikněte \"Najdi další byte\" — útočník iterativně odhaluje D_K(C₂) pomocí padding oracle. Bez znalosti klíče za ~1024 dotazů rekonstruuje plaintext bloku."
:::

> POODLE (Bodo Möller, Google 2014) — využil padding oracle v *SSLv3 fallback* TLS. Odpověď: úplné stažení SSLv3 z internetu během měsíců. Lucky 13 (AlFardan-Paterson 2013) — timing variant proti TLS-CBC.

**Obrana:**

1. **MAC-then-decrypt → Encrypt-then-MAC.** Nejdříve ověř MAC, pak teprve dešifruj. Pokud MAC neplatí, *vůbec nedešifruj*.
2. **AEAD režimy** (GCM, ChaCha20-Poly1305) — nemají zvláštní padding, ověřují integritu *před* dešifrováním.

## MAC — autentizační kód zprávy

**Message Authentication Code** je krátký značkovací kód (tag), který závisí na zprávě i na sdíleném klíči. Dvě strany sdílející klíč $K$ ho ověří jako důkaz autenticity a integrity:

::: math
T = \mathrm{MAC}_K(M), \qquad \text{ověření: spočítej } T' = \mathrm{MAC}_K(M') \text{ a porovnej } T' \stackrel{?}{=} T.
:::

### Vlastnosti MAC

* **Unforgeability** — útočník bez znalosti $K$ nedokáže vytvořit $(M^*, T^*)$ dvojici tak, aby $T^* = \mathrm{MAC}_K(M^*)$, ani když mu povolíme libovolný počet dotazů na $\mathrm{MAC}_K(\cdot)$ pro zprávy *jiné* než $M^*$.
* **Stejný klíč pro obě strany.** Není to elektronický podpis — obě strany mohou vytvořit MAC, žádná nepopiratelnost.

### HMAC

Standardní MAC postavený na hashe funkci ([[mac-hmac]]):

::: math
\mathrm{HMAC}_K(M) = H((K \oplus \mathrm{opad}) \| H((K \oplus \mathrm{ipad}) \| M)),
:::

kde $\mathrm{ipad} = 0x36$, $\mathrm{opad} = 0x5C$ opakované, $H$ je třeba SHA-256. Pro HMAC-SHA-256 je výstup 256 bitů (lze zkrátit). Bezpečnost dokázána za předpokladu, že $H$ je *pseudonáhodná funkce*.

### Encrypt-then-MAC (EtM) vs. MAC-then-Encrypt (MtE)

Kombinace šifrování + MAC pro důvěrnost + integritu má tři varianty:

* **Encrypt-then-MAC** — $C = E_{K_e}(M)$, $T = \mathrm{MAC}_{K_m}(C)$, posíláme $(C, T)$. **Doporučené.** MAC chrání ciphertext, takže útočník nezvládne dotaz na dešifrování bez platného MAC. *Bezpečné u všech rozumných šifrovacích a MAC kombinací.*
* **MAC-then-Encrypt** — $T = \mathrm{MAC}_{K_m}(M)$, $C = E_{K_e}(M \| T)$, posíláme $C$. Dešifrujeme a *pak* ověříme MAC — to *vystavuje* padding oracle, *pokud* šifra má padding (CBC).
* **Encrypt-and-MAC** — $C = E_{K_e}(M)$, $T = \mathrm{MAC}_{K_m}(M)$, posíláme $(C, T)$. *Není doporučeno* — MAC unikne plaintext deterministicky.

> **Praktické pravidlo:** vždy *Encrypt-then-MAC*, s *odlišnými klíči* $K_e \neq K_m$ (odvozené z hlavního klíče přes [[kdf|KDF]]). Nebo lepší: použij AEAD a problém je vyřešen.

## AEAD — Authenticated Encryption with Associated Data

AEAD spojuje šifrování a MAC v *jedno volání*. API:

```c
aead_encrypt(K, nonce, AD, M) → (C, tag)
aead_decrypt(K, nonce, AD, C, tag) → M or ⊥ (FAIL)
```

* **K** — klíč.
* **nonce** — jednorázová hodnota (unikátní pro každou zprávu).
* **AD** — additional data: data, která nejsou šifrována, ale jsou autentizována (např. hlavička paketu, ID protokolu, IP adresy).
* **M** — plaintext, který je *šifrován i autentizován*.
* **tag** — autentizační tag, zaslán s ciphertextem.

### Klíčový princip — *binární* odpověď

`aead_decrypt` vrací buď platný plaintext, nebo *speciální symbol* $\bot$ (FAIL). **Žádná částečná informace** o důvodu selhání (špatný padding? špatný tag? nesouhlasící AD?) se nepředává — útočník dostane jediný bit "platná" / "neplatná". Tím se *uzavírá* padding oracle a podobné side channels.

### Standardní AEAD šifry

| Šifra | Velikost klíče | Velikost nonce | Velikost tagu | Výkon |
| :--- | :-: | :-: | :-: | :-: |
| **AES-128-GCM** | 128 b | 96 b (typicky) | 128 b | 5–10 GB/s s AES-NI |
| **AES-256-GCM** | 256 b | 96 b | 128 b | 4–8 GB/s s AES-NI |
| **ChaCha20-Poly1305** | 256 b | 96 b | 128 b | 2–3 GB/s bez HW, 1.5–4 GB/s se SIMD |
| **AES-CCM** | 128/256 b | 56–104 b | 32–128 b | menší než GCM (sériový) |
| **AES-OCB3** | 128/256 b | 96 b | 64–128 b | rychlejší než GCM, ale patenty (do 2021) |
| **AES-GCM-SIV** | 128/256 b | 96 b | 128 b | nonce-misuse resistant |

### Nonce management

Nonce *nesmí opakovat* se stejným klíčem. Tři přístupy:

1. **Čítač** — bezpečný, ale vyžaduje stav (např. v souboru). Vhodný pro single-process aplikace.
2. **Náhodný 96-b nonce** — bezpečný do $\approx 2^{32}$ zpráv na klíč (paradox narozenin).
3. **Náhodný 192-b extended nonce** (XChaCha20-Poly1305) — bezpečný do $\approx 2^{80}$ zpráv. Default v *libsodium*.

> Pokud potřebujete šifrovat víc než $2^{32}$ zpráv jedním klíčem, použijte XChaCha20 nebo AES-GCM-SIV. Pokud nevíte, použijte ChaCha20-Poly1305 z `libsodium` nebo systémové TLS knihovny.

## Praktický přehled — kdy co

| Scénář | Doporučení |
| :--- | :--- |
| TLS 1.3, HTTPS | AES-128-GCM nebo ChaCha20-Poly1305 |
| Disk encryption | AES-256-XTS (specifický režim, ne AEAD) |
| Šifrování souborů | `libsodium` crypto_secretstream (XChaCha20-Poly1305) |
| Bluetooth LE | AES-128-CCM |
| Šifrování konfigurace v aplikaci | AES-256-GCM s náhodným nonce v každém záznamu |
| Zpráva s dlouhou životností | AES-256-GCM-SIV nebo XChaCha20-Poly1305 |
| Veřejně přístupný embed | NaCl secretbox = XSalsa20-Poly1305 |

## Antipatterny v praxi

1. **"Just AES"** — implementace AES-CBC bez MAC. Klasická chyba; doporučte AEAD.
2. **Stejný klíč pro $E$ i $\mathrm{MAC}$** — funguje (HMAC je doménově oddělené hashováním), ale doporučení je *odlišné klíče přes KDF*. AEAD řeší interně.
3. **Konstantní nonce / IV** — totální průlom proudových šifer a GCM.
4. **Neověřit tag** — `aead_decrypt` vrátí ⊥, ale aplikace návratovou hodnotu ignoruje a dál pracuje s odmítnutým plaintextem. Klasický zdroj forgery / decryption-oracle chyb.
5. **Padding oracle** — vlastní implementace CBC, která uniká chybové stavy. Použijte hotovou AEAD knihovnu.

---

*Zdroj: KRY přednášky 2025/26, KRY 3 — Symetrické algoritmy. Externí reference: NIST SP 800-38D: Recommendation for GCM (2007); RFC 7539: ChaCha20 and Poly1305 (2015); RFC 5116: Authenticated Encryption interface (2008); Vaudenay, S.: "Security Flaws Induced by CBC Padding", EUROCRYPT 2002; Bellare, M., Namprempre, C.: "Authenticated Encryption: Relations among Notions", ASIACRYPT 2000; Gueron, S., Lindell, Y.: "GCM-SIV: Full Nonce Misuse-Resistant Authenticated Encryption", CCS 2015.*
