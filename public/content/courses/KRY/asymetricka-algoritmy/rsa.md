---
title: RSA
---

# RSA

RSA (Rivest-Shamir-Adleman, MIT 1977, publikováno 1978) je první prakticky implementovaný **veřejnoklíčový algoritmus**. Stále dominuje v digitálních podpisech (X.509 certifikáty, JWT, software signing) a v starších šifrovacích systémech. Bezpečnost stojí na [[problemy|obtížnosti faktorizace]] velkých složených čísel $n = pq$.

> James H. Ellis, Clifford Cocks a Malcolm Williamson z britského GCHQ objevili podobné schéma v letech 1970–1973, ale jejich práce byla utajena až do 1997. Veřejně tedy RSA spojujeme s MIT.

## Klíčová generace (KeyGen)

1. **Vyber dvě velká prvočísla** $p, q$ podobné velikosti. Pro RSA-2048: $p, q$ kolem 1024 bitů.
2. **Spočti modulus** $n = pq$. Pro RSA-2048 má $n$ 2048 bitů.
3. **Spočti Eulerovu funkci** $\varphi(n) = (p-1)(q-1)$ ([[matematika]]).
4. **Vyber veřejný exponent** $e$, obvykle $e = 65537 = 2^{16} + 1$. Podmínka: $\gcd(e, \varphi(n)) = 1$.
5. **Spočti soukromý exponent** $d \equiv e^{-1} \pmod{\varphi(n)}$ pomocí rozšířeného Eukleidova algoritmu.

**Výsledek:**

* Veřejný klíč: $VK = (n, e)$.
* Soukromý klíč: $SK = (n, d)$ (nebo $(p, q, d)$ pro CRT optimalizaci).

> Prvočísla $p$ a $q$ je třeba *zapomenout* (nebo zachovat pro CRT optimalizaci); jejich znalost je ekvivalentní znalosti $d$.

## Šifrování a dešifrování

::: math
C = M^e \bmod n, \qquad M = C^d \bmod n.
:::

* Plaintext $M$ je celé číslo $0 \leq M < n$.
* Šifrování umocňuje veřejným exponentem.
* Dešifrování umocňuje soukromým exponentem.

### Důkaz korektnosti

Z $e \cdot d \equiv 1 \pmod{\varphi(n)}$ máme $e \cdot d = 1 + k \varphi(n)$ pro nějaké $k$. Pak

::: math
C^d = (M^e)^d = M^{ed} = M^{1 + k \varphi(n)} = M \cdot (M^{\varphi(n)})^k.
:::

Pro $\gcd(M, n) = 1$ Eulerova věta dává $M^{\varphi(n)} \equiv 1 \pmod n$, tedy $C^d \equiv M \pmod n$.

(Pro $\gcd(M, n) > 1$, tj. $M$ je dělitelné $p$ nebo $q$, korektnost se dokazuje zvlášť přes CRT — výsledek je stejný. V praxi je $\gcd(M, n) > 1$ nepravděpodobné s pravděpodobností $\approx 1/p + 1/q$, prakticky nula.)

## Podpis a ověření

RSA může také *podpisovat*. Obrácená role klíčů:

::: math
\sigma = M^d \bmod n \quad (\text{podpis}), \qquad M' = \sigma^e \bmod n \quad (\text{ověření}).
:::

Pokud $M' = M$ (nebo přesněji, $\sigma^e \equiv h(M) \pmod n$ pro hashovanou zprávu), podpis je platný. Detaily v [[el-podpis]].

> Symetrie šifrování/podpisu (oba jsou umocnění modulo $n$) je *specifická* pro RSA. DH/ECDH umí jen *key agreement*, ECDSA jen *podpis*.

## Příklad — malé prvočíslo {tier=example}

Volíme $p = 11, q = 13$:

* $n = pq = 143$.
* $\varphi(n) = 10 \cdot 12 = 120$.
* Zvolme $e = 7$. $\gcd(7, 120) = 1$, OK.
* $d = 7^{-1} \bmod 120 = 103$ (ověř: $7 \cdot 103 = 721 = 6 \cdot 120 + 1$).
* Veřejný klíč: $(143, 7)$, soukromý: $(143, 103)$.

Šifrujme $M = 9$:

* $C = 9^7 \bmod 143 = 4\,782\,969 \bmod 143 = 48$.

Dešifrujme:

* $M = 48^{103} \bmod 143$ — square-and-multiply dává $M = 9$. ✓

::: viz rsa-toy "Vyberte malá prvočísla p, q a exponent e. Spočítá se n, φ(n), d, pak šifrování M^e a dešifrování. Zapněte CRT pro 4× rychlejší dešifrování přes čínskou větu o zbytcích."
:::

## CRT optimalizace

Dešifrování $C^d \bmod n$ je drahé pro $d \sim n \sim 2^{2048}$. Pomocí [[matematika|CRT]]:

* $d_p = d \bmod (p-1)$, $d_q = d \bmod (q-1)$.
* $m_p = C^{d_p} \bmod p$, $m_q = C^{d_q} \bmod q$.
* $m = \mathrm{CRT}(m_p, m_q)$ — sloučení do $m \bmod n$.

Výsledek: 4× rychlejší dešifrování. **Standardní implementace** v OpenSSL, BoringSSL.

> CRT implementace zranitelná **Bellcoreho útokem** (1997, viz [[matematika]]) — pokud hardware vrátí chybu v $m_p$ nebo $m_q$, útočník získá faktor $n$. Obrana: ověřit výsledek (`m^e ≡ C`).

## RSA-OAEP — bezpečné šifrování

**Textbook RSA** ($C = M^e \bmod n$) je *nebezpečné*:

* **Deterministické** — stejné $M$ dává stejný $C$. Útočník může zkoušet kandidátní plaintexty.
* **Malé exponenty útoky** — pokud $M^e < n$, útočník spočítá $M = \sqrt[e]{C}$.
* **Chosen-ciphertext útoky** — Bleichenbacher 1998.

**RSA-OAEP** (Optimal Asymmetric Encryption Padding, Bellare-Rogaway 1994; standardizováno RFC 8017):

```
OAEP_encode(M, label):
  pad zprávu na k-2hashLen-2 bajtů
  seed = random(hashLen)
  dbMask = MGF1(seed, k - hashLen - 1)
  maskedDB = (Hash(label) || PS || 0x01 || M) ⊕ dbMask
  seedMask = MGF1(maskedDB, hashLen)
  maskedSeed = seed ⊕ seedMask
  return 0x00 || maskedSeed || maskedDB

C = OAEP_encode(M, label)^e mod n
```

OAEP zaručuje **IND-CCA2** bezpečnost (za standardních předpokladů a v *random oracle model*). Klíčové vlastnosti:

* **Probabilistické** — náhodný seed v každém šifrování. Stejné $M$ dává různé $C$.
* **Authenticated decoding** — invalid padding → odmítnuto. Žádné částečné informace.

> OAEP s SHA-256 (oblíbená volba) lze šifrovat zprávy do velikosti $k - 2 \cdot 32 - 2 = 190$ bytů pro RSA-2048. Pro delší zprávy [[hybridni|hybridní KEM]].

## RSA-PSS — bezpečný podpis

**RSA-PSS** (Probabilistic Signature Scheme, Bellare-Rogaway 1996, RFC 8017):

```
PSS_sign(M):
  mHash = Hash(M)
  salt = random(saltLen)
  M' = 0x00 00 00 00 00 00 00 00 || mHash || salt
  H = Hash(M')
  PS = 0x00 ... 0x01
  DB = PS || salt
  dbMask = MGF1(H, emLen - hashLen - 1)
  maskedDB = DB ⊕ dbMask
  EM = maskedDB || H || 0xbc

σ = EM^d mod n
```

PSS přidává *náhodnou salt* do hash — i pro identickou zprávu je každý podpis jiný (probabilistický). Bezpečnost důkazatelná v random oracle model.

**Alternativa:** RSASSA-PKCS1-v1.5 (starší, deterministický). Stále široce používaný (TLS certifikáty, JWT s `RS256`), bezpečný *pro podpis* (nikoli pro šifrování — viz [[rsa-utoky|Bleichenbacher útok]]).

## RSA — výkonové parametry

| Operace | RSA-2048 (e=65537) | RSA-4096 (e=65537) |
| :--- | :-: | :-: |
| Šifrování (veřejný klíč, $e$ malý) | ~0.1 ms | ~0.4 ms |
| Dešifrování (CRT, $d$ velký) | ~3 ms | ~22 ms |
| Podpis | ~3 ms | ~22 ms |
| Ověření | ~0.1 ms | ~0.4 ms |

Asymetrie: ověření a šifrování jsou rychlé (malý exponent), podpis a dešifrování pomalé. Pro veřejně dostupné služby (web, SSH server) to znamená, že **server platí cenu** za dešifrování / podpis, klient platí jen za ověření.

## Velikosti klíčů a deprecation

NIST SP 800-57:

| Bezpečnost | Velikost RSA | Status |
| :-: | :-: | :--- |
| 80 b | 1024 b | **Vyřazeno** od 2014 |
| 112 b | 2048 b | OK do 2030 |
| 128 b | 3072 b | OK dlouhodobě |
| 192 b | 7680 b | high-assurance |
| 256 b | 15360 b | top-secret |

V praxi se moderní aplikace přesouvají na *ECC* (256-bit klíče s ekvivalentní bezpečností). RSA se drží v legacy / certifikátech, protože hardware (TPM, HSM) je *masově* podporuje.

## Kvantová hrozba

Shorův algoritmus (1994) faktorizuje $n$ v *polynomiálním* čase na kvantovém počítači. Pro RSA-2048 by stačil kvantový počítač s ~5000 logickými qubits (~10 milionů fyzických). Žádný takový stroj zatím neexistuje (současně 1000–1300 fyzických qubits u IBM, Google). NIST PQC standardy (Kyber, Dilithium) jsou připravované pro [[postkvantova|post-kvantový přechod]].

> Aplikace s *dlouhodobým* tajemstvím (např. zdravotní data, státní dokumenty) by *už dnes* měly použít hybridní RSA+Kyber nebo postupně přejít na čistě Kyber. Pro 10-letá tajemství: RSA-3072 stále akceptabilní (data dnes nelze rozšifrovat dříve než kvantový počítač dorazí).

---

### Videa

::: youtube "https://www.youtube.com/watch?v=-ShwJqAalOk" "Breaking RSA - Computerphile" "Computerphile"
:::

*Zdroj: KRY přednášky 2025/26, KRY 4 — Asymetrické algoritmy. Externí reference: Rivest, R. L., Shamir, A., Adleman, L.: "A Method for Obtaining Digital Signatures and Public-Key Cryptosystems", Communications of the ACM 21(2), 1978; RFC 8017: PKCS #1 v2.2 — RSA Cryptography Specifications (2016); Bellare, M., Rogaway, P.: "Optimal Asymmetric Encryption", EUROCRYPT 1994; Boneh, D., Shoup, V.: *A Graduate Course in Applied Cryptography*, kap. 13.*
