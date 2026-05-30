---
title: Elektronický podpis
---

# Elektronický podpis

**Elektronický (digitální) podpis** je asymetrický kryptografický prostředek, který poskytuje *kombinaci*:

* **Autenticita** — důkaz, že zprávu poslala konkrétní strana.
* **Integrita** — důkaz, že zpráva nebyla modifikována.
* **Nepopiratelnost** (non-repudiation) — odesílatel nemůže později popřít autorství.

Symetrický [[mac-hmac|MAC]] zajišťuje první dvě, ne třetí — obě strany sdílí klíč, každá z nich mohla zprávu autentizovat. **Pouze asymetrický podpis** může zajistit *nepopiratelnost*, protože soukromý klíč zná jen odesílatel.

## Schéma

Trojice algoritmů:

* $\mathrm{KeyGen}(\lambda) \to (VK, SK)$ — generování páru klíčů.
* $\mathrm{Sign}(SK, M) \to \sigma$ — vytvoření podpisu.
* $\mathrm{Verify}(VK, M, \sigma) \to \{0, 1\}$ — ověření.

::: svg "Elektronický podpis: Alice podepisuje svým soukromým klíčem; Bob ověřuje veřejným"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aSig" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20"  y="20" width="200" height="160" rx="8"/>
    <rect x="320" y="20" width="200" height="160" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="120" y="40">Alice (signer)</text>
    <text x="420" y="40">Bob (verifier)</text>
  </g>
  <g fill="var(--text-muted)" font-size="11" font-family="var(--font-mono)">
    <text x="30" y="62">SK_A: drží tajně</text>
    <text x="30" y="78">VK_A: zveřejněno</text>
    <text x="30" y="100">h = H(M)</text>
    <text x="30" y="116">σ = Sign(SK_A, h)</text>
    <text x="30" y="138">Odeslat (M, σ)</text>

    <text x="330" y="62">Má VK_A</text>
    <text x="330" y="78">(z certifikátu nebo</text>
    <text x="330" y="94"> identity z předchozí důvěry)</text>
    <text x="330" y="116">h = H(M)</text>
    <text x="330" y="132">Verify(VK_A, h, σ)</text>
    <text x="330" y="148">→ 0 nebo 1</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aSig)">
    <path d="M222,124 L318,124"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5" text-anchor="middle">
    <text x="270" y="118">(M, σ)</text>
  </g>
</svg>
:::

### Sign a Verify role klíčů

V [[principy|asymetrické kryptografii]]:

* **Šifrování:** sender → public, receiver → private.
* **Podpis:** signer → **private**, verifier → **public**.

Soukromý klíč podepisuje, veřejný klíč ověřuje. Pouze majitel $SK_A$ může vytvořit platný podpis pod $VK_A$ — to je důvod, proč podpis prokazuje identitu.

## Hash-then-sign paradigma

Podpis přímo dlouhé zprávy je problematický: RSA má omezenou velikost (~190 bajtů pro 2048-bit), ECDSA pracuje s celočíselnými hodnotami modulo $n$. Standardně:

1. Spočti $h = H(M)$ — krátký hash zprávy.
2. Podepiš $h$, ne $M$ přímo: $\sigma = \mathrm{Sign}(SK, h)$.
3. Ověření: $\mathrm{Verify}(VK, H(M), \sigma)$.

**Podmínky bezpečnosti:**

* $H$ musí být **collision-resistant** ([[hash-funkce]]). Pokud útočník najde $M_1 \neq M_2$ s $H(M_1) = H(M_2)$, pak $\sigma$ pro $M_1$ je *platný* podpis i pro $M_2$. **Birthday attack** na 128-bit hash dává $2^{64}$ pokusů.
* Proto SHA-256 (kolize $2^{128}$) je standard.

> Existují *podpisové schémata bez hashe* (Lamport, Merkle), ale jsou *velmi* drahá v reálné praxi.

## RSA-PSS

[[rsa|RSA-PSS]] (Probabilistic Signature Scheme, RFC 8017):

```
PSS_sign(M, SK):
  mHash = H(M)
  salt = random(saltLen)        // typicky 32 B
  M' = 0x0000000000000000 || mHash || salt
  H_val = H(M')
  PS = pad of 0x00, ending in 0x01
  DB = PS || salt
  dbMask = MGF1(H_val, emLen - hashLen - 1)
  maskedDB = DB ⊕ dbMask
  EM = maskedDB || H_val || 0xbc
  return σ = EM^d mod n
```

* **Probabilistický** — náhodný salt v každém podpisu. Stejná zpráva → různý $\sigma$.
* **Důkazatelně bezpečný** v random oracle modelu.
* **Použití:** TLS, S/MIME, OpenSSL standard. JWT používá staršího PKCS#1 v1.5 (`RS256`).

### RSA-PSS vs. PKCS#1 v1.5

* **PSS** je modernější, *probabilistický*, *důkazatelně bezpečný*.
* **PKCS#1 v1.5** je *deterministický*, *starší*, *vyžaduje opatrnou implementaci* (jinak útoky typu Bleichenbacher).

Pro nové aplikace: **PSS**. Legacy (JWT): PKCS#1 v1.5.

## DSA, ECDSA

### DSA (1991, FIPS 186, vyřazeno 2023)

Variant ElGamal podpisu nad cyklickou podgrupou $\mathbb{Z}_p^*$ řádu $q$. Klíč: $(p, q, g, y = g^x \bmod p)$.

**Sign(M):**

1. Vybere $k \leftarrow \mathbb{Z}_q^*$.
2. $r = (g^k \bmod p) \bmod q$.
3. $s = k^{-1}(H(M) + xr) \bmod q$.
4. $\sigma = (r, s)$.

**Verify:**

1. $w = s^{-1} \bmod q$.
2. $u_1 = H(M) w \bmod q$, $u_2 = r w \bmod q$.
3. $v = (g^{u_1} y^{u_2} \bmod p) \bmod q$.
4. Pokud $v = r$, OK.

### ECDSA

[[elipticke|ECDSA]] je DSA přenesené na eliptickou křivku. Standard FIPS 186-4 / 186-5.

**Klíč:** $(E, G, n, Q = dG)$, kde $d$ je soukromý skalár.

**Sign(M):**

1. Vybere $k \leftarrow \mathbb{Z}_n^*$.
2. $R = kG$, $r = R_x \bmod n$.
3. $s = k^{-1}(H(M) + r d) \bmod n$.
4. $\sigma = (r, s)$.

**Verify:**

1. $u_1 = H(M) s^{-1} \bmod n$, $u_2 = r s^{-1} \bmod n$.
2. $R' = u_1 G + u_2 Q$.
3. Pokud $R'_x \equiv r \pmod n$, OK.

### Nonce reuse — kritická slabost

Pokud útočník získá dva podpisy stejnou stranou se stejným $k$:

* $s_1 = k^{-1}(h_1 + r d), s_2 = k^{-1}(h_2 + r d)$.
* $s_1 - s_2 = k^{-1}(h_1 - h_2) \Rightarrow k = (h_1 - h_2)/(s_1 - s_2) \bmod n$.
* $d = (s_1 k - h_1) / r \bmod n$.

**Sony PS3 (2010)** byla prolomena přesně tímto — fixní $k$ v firmware.

::: viz ecdsa-nonce-reuse "Krok-po-kroku: dva podpisy s identickým k umožní útočníkovi v 4 algebraických krocích zjistit nejprve k, pak soukromý klíč d. Sony PS3 (2010) padla přesně takto."
:::

### Deterministické ECDSA (RFC 6979)

Eliminuje slabost generování nonce. $k$ se odvozuje *deterministicky* z $M$ a $d$ pomocí HMAC:

::: math
k = \mathrm{HMAC}_{\mathrm{drbg}}(d, H(M)).
:::

Stejná zpráva → stejný $k$, ale různé zprávy → různé $k$. Žádný RNG → žádné rušení od slabého RNG.

> Modernější knihovny (BoringSSL, libsodium) implementují deterministické ECDSA standardně.

## Ed25519 / EdDSA

Bernstein, Lange a kol. (2011). Podpis na *Edwards-curve* (matematicky ekvivalentní [[elipticke|Curve25519]]).

**Klíčové vlastnosti:**

* **Deterministické** přirozeně — $k$ se odvozuje z $H(\mathrm{secret} \| M)$.
* **Constant-time** implementace bez podmínek (jednoduché v softwaru).
* **Rychlé:** ~50k podpisů/s, ~20k ověření/s na CPU (batch verifikace výrazně rychlejší).
* **Kompaktní:** veřejný klíč 32 B, podpis 64 B.

### Sign(M):

1. Hash $H(\mathrm{secret}_\mathrm{key}) = (h_0, \dots, h_{511})$. $a = $ klíčový skalár (z $h_0..h_{255}$).
2. $r = H(h_{256..511} \| M)$. $R = rG$.
3. $k = H(R \| A \| M)$, kde $A = aG$ je veřejný klíč.
4. $s = r + k a \bmod \ell$, kde $\ell$ je řád grupy.
5. $\sigma = (R, s)$.

### Verify:

1. $k = H(R \| A \| M)$.
2. Ověř $sG = R + kA$.

> Ed25519 je *bezpečnější* než ECDSA proti nonce reuse, side-channels a malformed inputs. **Doporučená volba** pro nové aplikace, pokud nemáte kompatibilní omezení.

## Slepé podpisy (blind signatures)

Chaum 1982: podpis bez znalosti obsahu zprávy. Použití: elektronické peníze, anonymní hlasování.

**Postup pro RSA-blind:**

1. Alice (signer): má $(N, e, d)$.
2. Bob (requester): chce podpis zprávy $M$. Vygeneruje *slepící faktor* $r$, spočítá $M' = M \cdot r^e \bmod N$.
3. Bob pošle $M'$ Alici.
4. Alice podepíše: $\sigma' = (M')^d = M^d r \bmod N$.
5. Bob "odslepí": $\sigma = \sigma' / r = M^d \bmod N$.

Alice nezná $M$, ale validní podpis vytvořila. Použití: digitální hotovost (ecash), anonymní autentizace.

## Group signatures, ring signatures

* **Group signatures** (Chaum, van Heyst 1991): podpis platný, ale identifikuje *jen* členství v určité skupině. Pouze *group manager* může identifikovat konkrétního podepisujícího.
* **Ring signatures** (Rivest, Shamir, Tauman 2001): podpis platný, ukazuje, že podepisující je *jeden* z předem definované sady $\{VK_1, \dots, VK_n\}$. Žádný "manager" — perfektní anonymita.

Použití: anonymní whistleblowing, kryptoměny (Monero používá ring signatures).

## EUF-CMA bezpečnost

Standardní bezpečnostní cíl pro podpis:

> Útočník dostane $VK$ a oracle $\mathrm{Sign}(SK, \cdot)$. Pro libovolný počet *vybraných* zpráv $M_1, M_2, \dots$ obdrží podpisy $\sigma_1, \sigma_2, \dots$. Útočník vyhrává, pokud vytvoří dvojici $(M^*, \sigma^*)$ s $M^* \neq M_i$ pro všechna $i$ a $\mathrm{Verify}(VK, M^*, \sigma^*) = 1$.

Pokud útočník nedokáže s ne-zanedbatelnou pravděpodobností, schéma je EUF-CMA-bezpečné.

Moderní schémata (RSA-PSS, EdDSA, ECDSA s deterministickým nonce) splňují EUF-CMA pod standardními předpoklady.

## Praktické volby (2024–2025)

| Účel | Doporučení |
| :--- | :--- |
| TLS server certifikát | ECDSA P-256 nebo P-384 |
| X.509 root CA | RSA-2048 (legacy) nebo ECDSA P-384 |
| SSH klíče | Ed25519 |
| OpenPGP | Ed25519 (nový), RSA-4096 (legacy) |
| Software signing (firmware) | RSA-2048+ nebo Ed25519 |
| JWT (web tokens) | ES256 (ECDSA P-256) nebo EdDSA |
| Krypto měny | ECDSA secp256k1 (Bitcoin) nebo EdDSA (Solana) |
| Long-term archive | RSA-3072 nebo SLH-DSA (PQC) |
| Post-kvantový | ML-DSA (Dilithium), SLH-DSA (SPHINCS+) — viz [[postkvantova]] |
| **Vyhněte se:** | DSA (vyřazen), RSA-1024 (slabý), ECDSA bez determ. nonce |

## Antipatterny

1. **Sign bez hash** — pomalé, omezené velikostí klíče.
2. **Stejný klíč pro šifrování i podpis** — možné (s opatrností), ale doporučení: *odlišné páry* pro odlišné účely.
3. **Slabý RNG pro nonce** — Sony PS3 jako kanonický příklad. Použijte deterministické ECDSA / EdDSA.
4. **Nadměrná délka podpisu** — pokud máte omezenou bandwidth, EdDSA (64 B) > ECDSA (~70 B) > RSA-2048 (256 B).
5. **Vlastní implementace** — RSA-PSS, ECDSA, EdDSA jsou *jemné*. Použijte BoringSSL, libsodium, NaCl.

---

*Zdroj: KRY přednášky 2025/26, KRY 4 — Asymetrické algoritmy. Externí reference: Diffie, W., Hellman, M.: "New Directions in Cryptography", IEEE Trans. Inf. Theory IT-22(6), 1976; FIPS 186-5: Digital Signature Standard (DSS) (NIST 2023); Bernstein, D. J. a kol.: "High-speed high-security signatures", CHES 2011; RFC 8032: EdDSA Signature Algorithm (2017); RFC 6979: Deterministic ECDSA (2013); Rivest, R., Shamir, A., Tauman, Y.: "How to Leak a Secret", ASIACRYPT 2001.*
