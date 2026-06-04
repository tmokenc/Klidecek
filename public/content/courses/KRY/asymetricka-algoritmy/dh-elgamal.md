---
title: Diffie-Hellman a ElGamal
---

# Diffie-Hellman a ElGamal

**Diffie-Hellman (DH)** je *první veřejnoklíčový* algoritmus — Whitfield Diffie a Martin Hellman publikovali "New Directions in Cryptography" v IEEE Trans. Inf. Theory roku 1976. Není to *šifrování*, ale **key agreement** (vyjednání sdíleného tajemství) přes nezabezpečený kanál. Bezpečnost stojí na obtížnosti [[problemy|diskrétního logaritmu]].

**ElGamal** (Taher ElGamal 1985) je DH adaptovaný na *šifrování* a *podpis*. Méně používaný než RSA / ECC, ale akademicky důležitý a stále standard pro některé starší PGP klíče.

## Diffie-Hellman key agreement

### Setup (veřejné parametry)

Strany se předem dohodnou na:

* **Velkém prvočísle** $p$ (typicky 2048+ bitů).
* **Generátoru** $g$ multiplikativní podgrupy $\mathbb{Z}_p^*$ s velkým prvočíselným řádem $q$.

Doporučená volba: **safe prime** $p = 2q + 1$, kde $q$ je také prvočíslo. Generátor $g$ má řád $q$, kvadratické zbytky tvoří bezpečnou podgrupu.

### Protokol

::: math
\begin{array}{rcl}
\text{Alice: } a \leftarrow \mathbb{Z}_q, & A = g^a \bmod p, & \xrightarrow{A} \\
\text{Bob: } b \leftarrow \mathbb{Z}_q, & B = g^b \bmod p, & \xleftarrow{B} \\
\text{Alice: } K = B^a \bmod p, & & \\
\text{Bob: } K = A^b \bmod p. & &
\end{array}
:::

Klíčové: $K = B^a = (g^b)^a = g^{ab} = (g^a)^b = A^b$. Obě strany dostanou *stejné* sdílené tajemství $K$.

::: svg "Diffie-Hellman key exchange"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aDH" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20"  y="20" width="200" height="160" rx="8"/>
    <rect x="320" y="20" width="200" height="160" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="120" y="40">Alice</text>
    <text x="420" y="40">Bob</text>
  </g>
  <g fill="var(--text-muted)" font-size="11" font-family="var(--font-mono)">
    <text x="30" y="62">a ← random Z_q</text>
    <text x="30" y="78">A = g^a mod p</text>
    <text x="30" y="120">K = B^a mod p</text>
    <text x="30" y="138">  = g^(ab) mod p</text>

    <text x="330" y="62">b ← random Z_q</text>
    <text x="330" y="78">B = g^b mod p</text>
    <text x="330" y="120">K = A^b mod p</text>
    <text x="330" y="138">  = g^(ab) mod p</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aDH)">
    <path d="M222,86  L318,86"/>
    <path d="M318,100 L222,100"/>
  </g>
  <g fill="var(--text-muted)" font-size="11" text-anchor="middle">
    <text x="270" y="80">A</text>
    <text x="270" y="113">B</text>
  </g>
</svg>
:::

### Bezpečnost

Útočník vidí veřejné parametry $(p, g)$ a přenesené $A, B$. Pro získání $K$ by potřeboval **CDH problém**: dáno $(g^a, g^b)$ spočítej $g^{ab}$.

* **CDH** je *věřeně* obtížné — žádný známý polynomiální algoritmus.
* **DDH** (rozlišit $g^{ab}$ od náhodného $g^z$) je v *celé* grupě $\mathbb{Z}_p^*$ snadný (Legendreův symbol odhalí paritu $a$, $b$, $ab$ → rozlišení $g^{ab}$ od náhodného). DDH se proto předpokládá obtížné jen v prvočíselné podgrupě řádu $q$ (kvadratické zbytky) — odtud nutnost safe prime a generátoru řádu $q$.

> CDH je *nanejvýš tak obtížné jako* DLP — pokud umíme DLP, umíme CDH (zjistíme $a$ z $A$ a spočítáme $B^a$). Opak neznáme, ale ve většině parametrů jsou stejně obtížné.

## Man-in-the-Middle útok

DH samotné **nezajišťuje autentizaci**. Mallory uprostřed:

1. Mallory zachytí $A$ od Alice. Pošle Bobovi $A' = g^{a'}$ (Malloryho vlastní).
2. Mallory zachytí $B$ od Boba. Pošle Alici $B' = g^{b'}$.
3. Alice spočítá $K_{\mathrm{AM}} = (B')^a = g^{a b'}$, věří, že komunikuje s Bobem.
4. Bob spočítá $K_{\mathrm{MB}} = (A')^b = g^{a' b}$, věří, že komunikuje s Alicí.

Mallory zná oba klíče (vlastní $a', b'$). Může relayovat a *číst* všechen provoz.

::: viz dh-mitm "Zvolte tajné exponenty a, b — uvidíte sdílený klíč g^(ab) mod p. Zapněte MITM: Mallory vloží své a', b' a vznikne dvojice klíčů K_AM, K_MB, mezi nimiž jen on tlumočí."
:::

### Obrany proti MITM

1. **Autentizovaný DH** — strany se identifikují *podpisem* svého $g^a$. Schémata:
   * **Station-to-Station (STS)** — Alice posílá $A = g^a$, později $\mathrm{Sig}_{SK_A}(g^a \| g^b)$. Bob ověří.
   * **Signal X3DH** — kombinace identity, dlouhodobých, jednorázových klíčů.
   * **TLS 1.3** — server podepisuje *transcript* handshake.
2. **PSK (pre-shared key)** — sdílený symetrický klíč authentikuje.
3. **PKI** — strany ověřují své identity přes [[pki-uvod|X.509 certifikáty]].

## Logjam (2015)

Heninger, Adrian, Durumeric a kol.: praktický útok proti DH v TLS.

**Princip:** **mnoho serverů sdílí *stejné* prvočíslo $p$.** Pro útok stačí pre-compute index calculus *jednou* pro toto $p$, pak online dešifrovat všechny budoucí DH výměny pomocí stejného $p$. Pro 512-bit $p$: ~$10^6$ CPU-hodin předzpracování, ~minuta online útoku. Pro 1024-bit $p$: $\sim 100\$ \mathrm{M}$ HW + roky předzpracování — odhad, že státní aktér to *má*.

**Obrana:**

* **Server používá *vlastní* $p$**, nesdílené.
* **$p \geq 2048$ bitů.**
* **Migrace na ECDH** s curve25519 — kratší klíče, žádný index calculus.

> TLS 1.3 (2018) **zakázal** static DH bez forward secrecy a vyžaduje ECDH nebo FFDHE skupiny ze známé sady (RFC 7919) s $p \geq 2048$.

## ElGamal — šifrování

ElGamal rozšiřuje DH na *šifrování* libovolné zprávy.

### Klíčová generace

* Stejné setup jako DH: $(p, g)$ veřejné.
* Soukromý klíč: $x \leftarrow \mathbb{Z}_q$.
* Veřejný klíč: $y = g^x \bmod p$.

### Šifrování zprávy $M \in \mathbb{Z}_p^*$

1. Alice vybere náhodné $k \leftarrow \mathbb{Z}_q$.
2. Spočítá $c_1 = g^k \bmod p$, $c_2 = M \cdot y^k \bmod p$.
3. Odešle Bobovi $(c_1, c_2)$.

### Dešifrování

Bob spočítá $M = c_2 \cdot c_1^{-x} \bmod p$.

Důkaz: $c_2 \cdot c_1^{-x} = M y^k \cdot (g^k)^{-x} = M (g^x)^k (g^k)^{-x} = M$. ✓

### Vlastnosti

* **Probabilistické** — kvůli náhodnému $k$. Stejná zpráva dává různé ciphertexty.
* **Expanze 2:1** — zpráva $|M|$ bitů → ciphertext $2|p|$ bitů (dva prvky).
* **Bezpečnost:** IND-CPA pod DDH předpokladem. *Není* IND-CCA bez dodatečné konstrukce.
* **Nonce reuse:** pokud Alice použije stejné $k$ dvakrát ($c_1 = g^k, c_2 = M y^k$ a $c_1' = g^k, c_2' = M' y^k$), pak $c_2/c_2' = M/M'$ → částečné odhalení.

## ElGamal podpis

ElGamal podpis (1985) je předchůdce DSA. Pro zprávu $M$:

1. Alice vybere náhodné $k \leftarrow \mathbb{Z}_{p-1}^*$.
2. Spočítá $r = g^k \bmod p$.
3. Spočítá $s = k^{-1} (h(M) - x r) \bmod (p-1)$, kde $h$ je hashovací funkce.
4. Podpis: $\sigma = (r, s)$.

**Ověření:** $g^{h(M)} \stackrel{?}{=} y^r r^s \bmod p$.

> ElGamal podpis je *probabilistický* — různý $k$ → různý $r, s$. Tato vlastnost zůstává v DSA / ECDSA.

### Slabosti

* **Reuse nonce $k$** — okamžitý průlom (známý jako *Sony PS3 hack*, který padl ECDSA, ale princip je shodný).

   Pokud dva podpisy $(r, s_1)$ a $(r, s_2)$ stejného $k$:
   * $s_1 = k^{-1}(h_1 - xr), s_2 = k^{-1}(h_2 - xr)$.
   * $s_1 - s_2 = k^{-1}(h_1 - h_2) \Rightarrow k = (h_1 - h_2)/(s_1 - s_2) \bmod (p-1)$.
   * Pak $x = (k s_1 - h_1)/r$.
* **Existenciální padělání** bez hashe $h$ — kdokoli dokáže vytvořit *náhodné* $(r, s, M)$ trojice s validním ověřením. **Vždy hashovat zprávu před podpisem.**

## DSA (Digital Signature Algorithm)

NIST standard 1991 (FIPS 186), refinement ElGamala. Pro NIST P-curve verzi → ECDSA. Hlavní rozdíly oproti ElGamalu:

* Pracuje v *prvočíselné podgrupě* řádu $q$ (160–256 bitů), místo plné $\mathbb{Z}_p^*$ (1024–3072 bitů).
* Kratší podpis: $|r| = |s| = |q|$, ne $|p|$.
* Standardizovaná hashovací funkce (SHA-1, SHA-256).

DSA s 2048-bit $p$ a 256-bit $q$ má bezpečnost 112–128 bitů a podpis ~512 bitů (vs. ElGamal 4096 bitů).

## Praktické použití DH a ElGamal v 2024 {tier=practice}

* **DH (FFDHE):** RFC 7919 definuje 5 standardních prvočísel (2048, 3072, 4096, 6144, 8192 bitů). TLS 1.3 podporuje, ale primárně se používá **ECDH** s X25519 nebo P-256.
* **ElGamal šifrování:** *žádné* moderní použití. PGP do 2007 ho nabízelo; nahrazeno hybridem RSA + AEAD nebo ECIES.
* **DSA:** *vyřazen* z FIPS 186-5 (2023). Nahrazen ECDSA a EdDSA.

> **Doporučení:** Pro nové aplikace **X25519 (ECDH)** + **Ed25519 (podpis)** + **ChaCha20-Poly1305 (AEAD)**. Klasický DH/ElGamal pouze pro legacy interoperabilitu.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=NmM9HA2MQGI" "Secret Key Exchange (Diffie-Hellman) - Computerphile" "Computerphile"
:::

*Zdroj: KRY přednášky 2025/26, KRY 4 — Asymetrické algoritmy. Externí reference: Diffie, W., Hellman, M.: "New Directions in Cryptography", IEEE Trans. Inf. Theory IT-22(6), 1976; ElGamal, T.: "A Public-Key Cryptosystem and a Signature Scheme Based on Discrete Logarithms", IEEE Trans. Inf. Theory 31(4), 1985; Adrian, D. a kol.: "Imperfect Forward Secrecy: How Diffie-Hellman Fails in Practice" (Logjam), CCS 2015; RFC 7919: Negotiated Finite Field Diffie-Hellman Ephemeral Parameters for TLS (2016).*
