---
title: MAC a HMAC
---

# MAC a HMAC

[[hash-funkce|Hashovací funkce]] sama o sobě nezajišťuje **autenticitu**. Pokud zveřejníme $H(M)$ vedle $M$, útočník nemůže ani modifikovat $M$ (změnil by se hash) — ale může nahradit *oba* novou dvojicí $(M', H(M'))$. **Message Authentication Code (MAC)** přidává *sdílený klíč* — útočník bez znalosti klíče nedokáže vytvořit platný tag.

## Definice MAC

MAC je trojice algoritmů:

* $\mathrm{KeyGen}(\lambda) \to K$ — generování klíče.
* $\mathrm{MAC}(K, M) \to T$ — vytvoření tagu.
* $\mathrm{Verify}(K, M, T) \to \{0, 1\}$ — ověření.

Bezpečnostní cíl: **EUF-CMA** (Existential UnForgeability under Chosen-Message Attack). Útočník dostane $\mathrm{MAC}(K, \cdot)$ oracle pro libovolné zprávy a má vytvořit dvojici $(M^*, T^*)$ s $M^*$ *jiným* než dotázanými a $\mathrm{Verify}(K, M^*, T^*) = 1$. Pokud útočník nemůže, MAC je EUF-CMA-bezpečný.

## Naivní MAC z hashe — proč to nefunguje

První pokus:

::: math
\mathrm{MAC}_K(M) = H(K \| M).
:::

**Slabost: length-extension** ([[hash-utoky]]). Útočník zná $T = H(K \| M)$ a $|M|$. Aplikuje SHA Merkle-Damgård iteraci na nový blok $M'$ → získá $T' = H(K \| M \| \mathrm{pad} \| M')$ → server přijme $(M \| \mathrm{pad} \| M', T')$ jako platné.

Druhý pokus:

::: math
\mathrm{MAC}_K(M) = H(M \| K).
:::

**Slabost:** pokud najdeme kolizi $H(M_1) = H(M_2)$, pak $H(M_1 \| K) = H(M_2 \| K)$. Útok přes birthday: $2^{n/2}$ pokusů pro $n$-bit hash. Pro SHA-1 (n=160) to je $2^{80}$ — nedostupné, ale ne dost rezerv.

## HMAC — standardní řešení

Bellare, Canetti, Krawczyk (1996), standardizováno RFC 2104, FIPS 198-1.

::: math
\mathrm{HMAC}_K(M) = H((K' \oplus \mathrm{opad}) \| H((K' \oplus \mathrm{ipad}) \| M)),
:::

kde:

* $K'$ je *paddované* $K$ na velikost bloku hashe (např. 64 bajtů pro SHA-256). Pokud $|K| > $ blok, $K' = H(K)$; jinak $K$ doplněno nulami.
* $\mathrm{ipad} = 0x36$ opakované přes blok.
* $\mathrm{opad} = 0x5C$ opakované přes blok.

### Struktura

::: viz hmac-structure "Krok 1: padding klíče → K' ⊕ ipad a K' ⊕ opad. Krok 2: vnitřní hash H(K'⊕ipad ∥ M). Krok 3: vnější hash H(K'⊕opad ∥ vnitřní). Vnořením je zablokován length-extension."
:::

### Bezpečnost

* **NIE** zranitelný length-extension — vnější hash s opad-maskovaným klíčem ho blokuje.
* **Bezpečný** pod *o něco silnějším* předpokladem než kolizní odolnost — *pseudonáhodnost kompresní funkce*. SHA-256, SHA-3 ho splňují.
* **HMAC-SHA-1** je překvapivě stále bezpečný — kolize SHA-1 *nepoškozují* HMAC-SHA-1 (jiný předpoklad bezpečnosti). RFC 6151 ho ale doporučuje vyřadit.

### Výstupy v praxi

| HMAC varianta | Výstup | Použití |
| :--- | :-: | :--- |
| HMAC-SHA-256 | 256 b | TLS, JWT (HS256), AWS API signing |
| HMAC-SHA-512 | 512 b | high-assurance |
| HMAC-SHA-384 | 384 b | TLS strict |
| HMAC-SHA-1 | 160 b | legacy (vyřazováno) |
| HMAC-MD5 | 128 b | **NIKDY**, jen historicky |

## Constant-time comparison

Naive `if (computed_tag == provided_tag) accept;` v C/C++/Python má *timing leak* — porovnávání se zastaví na první rozdílu. Útočník měřením doby zjistí, kolik *prvních bajtů* je správně, a postupně tag uhodne.

**Správně:**

```c
int constant_time_compare(uint8_t *a, uint8_t *b, size_t len) {
    uint8_t diff = 0;
    for (size_t i = 0; i < len; i++)
        diff |= a[i] ^ b[i];
    return (diff == 0);  // always touches all bytes
}
```

Doba je *nezávislá* na pozici prvního rozdílu. Standardní v krypto knihovnách (`crypto_verify`, `hmac.compare_digest` v Pythonu, `subtle.ConstantTimeCompare` v Go).

## Poly1305 — univerzální hash MAC

Bernstein (2005). MAC postavený na **univerzálním hashe** v $\mathrm{GF}(2^{130} - 5)$, ne na obyčejné hashovací funkci.

### Konstrukce

* Klíč: 32 bajtů. Rozděleno na $r$ (16 B, *clamped*) a $s$ (16 B).
* Zpráva $M$ rozdělena do 16-bajtových bloků $M_1, \dots, M_q$.
* Spočti $T = ((((M_1 \cdot r) + M_2) \cdot r) + \dots) \cdot r \bmod (2^{130} - 5)$.
* MAC = $T + s \bmod 2^{128}$.

### Vlastnosti

* **Informačně-teoreticky bezpečný** za předpokladu, že $r$ a $s$ jsou pravdivě náhodné a *nikdy se neopakují*.
* Pro stejný klíč $(r, s)$ může útočník po jednom zachyceném tagu zfalzifikovat. **Klíč jednorázový.**
* V praxi: $r, s$ se generují z stream cipheru (ChaCha20) — viz ChaCha20-Poly1305 v [[padding-aead|AEAD]].

### ChaCha20-Poly1305 AEAD

```
chacha20_poly1305_encrypt(K, nonce, AD, M):
  // Vygeneruj Poly1305 klíč
  (r, s) = chacha20_keystream(K, nonce)[0..32]
  
  // Šifruj zprávu (counter začíná na 1)
  C = chacha20_keystream(K, nonce)[32..] ⊕ M
  
  // Autentizace
  T = Poly1305(r, s, AD || pad16(AD) || C || pad16(C) || len(AD) || len(C))
  
  return (C, T)
```

Pro každou zprávu *čerstvý nonce* → čerstvé $(r, s)$. *Poly1305 jednorázové použití*.

## KMAC — SHA-3 based MAC

NIST SP 800-185 (2016): MAC postavený na **Keccak/SHA-3** sponge konstrukci.

::: math
\mathrm{KMAC}_K(M) = \mathrm{Keccak}(\mathrm{encode}(K) \| M \| \mathrm{outputLen}).
:::

Bezpečnost stojí na pseudonáhodnosti Keccak permutace. *Žádný length-extension problém* (sponge construction).

KMAC se v praxi používá méně než HMAC kvůli zpětné kompatibilitě, ale je vhodný pro SHA-3-only ekosystém (např. Ethereum hashe).

## CMAC — bloková šifra based MAC

NIST SP 800-38B. MAC postavený na **blokové šifře** (typicky AES). Použito v AES-CCM AEAD, IEEE 802.15.4 (ZigBee), Bluetooth.

### Konstrukce CMAC

1. Generuj dva sub-klíče $K_1, K_2$ z $K$ pomocí AES a XORů.
2. Rozděl $M$ na bloky $M_1, \dots, M_n$. Pro poslední neúplný blok přidej padding `0x80 0x00 ...`.
3. Spočti $X = \mathrm{AES}_K(0)$, pak iteruj $X = \mathrm{AES}_K(X \oplus M_i)$ pro $i = 1, \dots, n-1$.
4. Poslední krok: $X = \mathrm{AES}_K(X \oplus M_n \oplus K_1)$ nebo $K_2$ (záleží, zda je $M_n$ úplný blok).
5. Tag = $X$ (typicky truncated na 64 nebo 96 bitů).

CMAC je *deterministický*, *nevyžaduje* další primitive vedle AES (vhodné pro embedded HW).

## SipHash — krátké zprávy, hash tables

Aumasson, Bernstein 2012. **MAC navržený pro krátké zprávy** (do ~100 bajtů). Cíl: ochrana proti **hash flooding** útokům na hash tables (CVE-2011-4815 a další).

* **Klíč:** 128 bitů.
* **Output:** 64 bitů (default), volitelně 128 bitů. Varianty SipHash-2-4 (default) a SipHash-4-8 (konzervativní) se liší počtem rund (komprese-finalizace), ne délkou výstupu.
* **Rychlost:** ~5× rychlejší než HMAC-SHA-256 pro krátké zprávy.

**Použití:** Rust, Python, Perl, Ruby — standardní hashování v interních hash tables (klíč je vygenerován při startu programu). Útočník nemůže prediktivně vytvořit kolize.

## GMAC — autentizační varianta GCM

GCM bez šifrování (M je prázdné, autentizují se jen AD). Standardní *autentizace s AES*. Použito v IEEE MACsec.

::: math
\mathrm{GMAC}(K, \mathrm{IV}, A) = \mathrm{AES\_GCM}(K, \mathrm{IV}, \text{empty}, A).\text{tag}.
:::

Slabost: **nonce reuse je katastrofa** (jako u GCM). Pro každou autentizaci nový IV.

## Praktická doporučení {tier=practice}

| Účel | Doporučení |
| :--- | :--- |
| Obecná autentizace zpráv | **HMAC-SHA-256** |
| AEAD (šifrování + autentizace) | AES-GCM nebo ChaCha20-Poly1305 ([[padding-aead]]) |
| Embedded / IoT | AES-CMAC nebo HMAC-SHA-256 (záleží na HW) |
| Hash tables ochrana | SipHash |
| AWS API, JWT | HMAC-SHA-256 |
| TLS 1.3 record layer | součást AEAD (GCM nebo Poly1305) |
| **NIKDY:** | `H(K\|M)` jako MAC, MD5 v MAC, SHA-1 v novém kódu |

## Common pitfalls

1. **`hashlib.sha256(K + M).digest()` jako MAC** — length-extension. Použij `hmac.new(K, M, sha256).digest()`.
2. **Stejný klíč pro šifrování i MAC** — formálně OK pro HMAC s odlišným kontextem, ale doporučení je odvodit dva klíče z hlavního přes [[kdf|KDF]].
3. **Comparing tags with `==`** — timing leak. Použij `hmac.compare_digest` / `crypto_verify_*`.
4. **Truncated tag příliš krátký** — < 80 bitů: brute force forgery proveditelný. Doporučení: minimum 96 bitů, ideálně 128.
5. **Server returns MAC verification timing differences** — netriviální obrana, raději použij AEAD.

---

*Zdroj: KRY přednášky 2025/26, KRY 4 — Asymetrické algoritmy. Externí reference: Bellare, M., Canetti, R., Krawczyk, H.: "Keying Hash Functions for Message Authentication", CRYPTO 1996; RFC 2104: HMAC: Keyed-Hashing for Message Authentication (1997); FIPS 198-1: The Keyed-Hash Message Authentication Code (HMAC) (NIST 2008); Bernstein, D. J.: "The Poly1305-AES Message-Authentication Code", FSE 2005; Aumasson, J.-P., Bernstein, D. J.: "SipHash: a fast short-input PRF", INDOCRYPT 2012.*
