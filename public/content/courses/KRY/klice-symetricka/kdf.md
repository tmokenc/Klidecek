---
title: KDF — odvozování klíčů
---

# KDF — odvozování klíčů (Key Derivation Functions)

**Key Derivation Function** je funkce, která transformuje *zdroj entropie* (heslo, sdílené tajemství z DH, master key) na *jeden nebo více* kryptografických klíčů. Slouží dvěma účelům:

1. **Roztažení délky / key stretching** — výstup se "expanduje" na požadovanou délku a (u heslových KDF) se zvyšuje cena útoku na jeden pokus. Výstupní entropie je ale shora omezená entropií vstupu — KDF ji nikdy nezvýší.
2. **Doménové oddělení** — z jednoho hlavního klíče odvodit *více* kontextově oddělených klíčů (např. encryption key + MAC key).

Typy KDF:

* **Password-based KDF** — z lidského hesla. Záměrně pomalé.
* **Extract-then-expand KDF** — z náhodného zdroje (DH output, master key). Rychlé.
* **Specialized** — *crypt(3)*, hashing pro hesla v souborech.

## Password-based KDF

Lidská hesla mají *nízkou entropii* — 30–50 bitů typicky. AES-256 vyžaduje 256 bitů. PBKDF má dva cíle:

1. **Roztáhnout heslo na klíč.**
2. **Být *pomalá* —** brute force se zpomalí na lidsky únosnou rychlost.

> *Pomalost je vlastnost*, ne chyba. Pokud hash hesla trvá 100 ms, útočník zkouší $10$ hesel/s na jádro. Pro slovník 10M hesel: 10 let. Pro `sha256(password)`: stejný slovník za 0.01 sekundy.

### PBKDF2 (Password-Based Key Derivation Function 2)

RFC 2898 (2000). Standardní, ale **dnes zastaralý**.

::: math
\mathrm{PBKDF2}(P, S, c, \mathrm{dkLen}) = T_1 \| T_2 \| \dots \| T_l,
:::

kde:

* $P$ = password.
* $S$ = salt (typicky 16–32 B random).
* $c$ = iteration count (typicky $10^5$–$10^6$).
* $\mathrm{dkLen}$ = výstupní délka v bajtech.

Každý blok $T_i = F(P, S, c, i)$, kde $F$ je $c$ iterací HMAC:

::: math
F(P, S, c, i) = U_1 \oplus U_2 \oplus \dots \oplus U_c,
:::

* $U_1 = \mathrm{HMAC}(P, S \| i)$, $U_j = \mathrm{HMAC}(P, U_{j-1})$.

### Slabosti PBKDF2

* **Není memory-hard.** Útočník na GPU počítá HMAC-SHA-256 velmi rychle. Pro `c = 100 000`: ~10 M hashes/s/GPU. Pro slovník 10M hesel: 1 sekunda na účet.
* **Žádná ochrana proti ASIC.** Bitcoin mining demonstruje, že SHA-256 lze provádět $10^{14}$/s na ASIC. Pro PBKDF2-SHA-256: úměrně rychle.

### bcrypt

Provos, Mazières (1999) na základě Blowfish. **Adaptivní / CPU-cost-hard (není memory-hard):**

* Konstantní paměť 4 KB na hash výpočet — malá fixní pracovní sada dává jen omezenou odolnost proti GPU, mnohem slabší než memory-hard scrypt/Argon2. Právě proto vznikly scrypt a Argon2.
* `cost` parameter = $2^\mathrm{cost}$ iterací (typicky 10–12 pro běžné weby, 14 pro vysokou bezpečnost).
* Implicitní salt 128 b.

```
$ python -c "import bcrypt; print(bcrypt.hashpw(b'password', bcrypt.gensalt(rounds=12)))"
$2b$12$VXl.b/yyqi8aMq.rO5XvFOKQpKv0V8gZJlj/nDr0Re/wG8u6mQbV2
```

Útočník na GPU má **mnohem méně paměti** — ~10 M hashes/s/GPU pro PBKDF2-SHA-256 (`c = 100 000`) vs ~10 K/s/GPU pro bcrypt-12. Faktor 1000× zlepšení.

### scrypt

Percival (2009). **Sekvential-memory-hard:**

* Paměť $N$ bloků, každý $r \cdot 128$ bytů.
* CPU: $O(N \cdot r)$.
* Paměť: $O(N \cdot r)$.
* Time-memory tradeoff: snížení paměti znamená *exponenciální* zvýšení času.

Parametry typicky $N = 2^{15}$, $r = 8, p = 1$ → 16 MB paměti, ~100 ms na CPU. ASIC útok je *nákladný* — paměť je drahá v ASIC.

### Argon2 — vítěz PHC (Password Hashing Competition 2015)

Biryukov, Dinu, Khovratovich. Tři varianty:

* **Argon2d** — data-dependent, *odolný GPU/ASIC*, ale zranitelný side-channels (data-dependent access). Vhodný *bez* side-channel hrozby.
* **Argon2i** — data-independent, *odolný side-channels*, ale méně proti GPU.
* **Argon2id** — *hybrid*, doporučená volba. Combinations of d and i.

Parametry:

* `time_cost` (iterations) — typicky 1–3.
* `memory_cost` — typicky 64 MB nebo více.
* `parallelism` — typicky 4.

> **OWASP doporučení (2023):** Argon2id s `memory_cost=19456` (19 MiB), `time_cost=2`, `parallelism=1` pro interactive use. Pro vyšší zabezpečení: 64 MiB+, time=3.

### Crypt-formát

Unix tradice — heslo + salt + algorithm v jednom řetězci:

```
$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>
$2y$10$<salt><hash>                              ← bcrypt
$6$<salt>$<sha512crypt hash>                      ← SHA-512 crypt (Linux /etc/shadow)
```

Format umožňuje *evoluci* — při změně doporučení lze rotovat algoritmy *bez* migrace databáze. Server vidí, který algoritmus a parametry použít.

## Random-source KDF — HKDF

**HKDF** (HMAC-based Extract-and-Expand KDF, RFC 5869, 2010). Pro vstupy z DH output, master key, ne hesla.

### Schéma

Dva kroky:

1. **Extract:** $\mathrm{PRK} = \mathrm{HMAC}(\mathrm{salt}, \mathrm{IKM})$, kde IKM = Initial Keying Material.
2. **Expand:** $T_i = \mathrm{HMAC}(\mathrm{PRK}, T_{i-1} \| \mathrm{info} \| i)$ pro $i = 1, 2, \dots$. Výstup je $T_1 \| T_2 \| \dots$ obkrojen na požadovanou délku.

```python
import hashlib, hmac

def hkdf_extract(salt, ikm):
    return hmac.new(salt or b'\x00' * 32, ikm, hashlib.sha256).digest()

def hkdf_expand(prk, info, length):
    output = b''
    t = b''
    counter = 1
    while len(output) < length:
        t = hmac.new(prk, t + info + bytes([counter]), hashlib.sha256).digest()
        output += t
        counter += 1
    return output[:length]
```

### Vlastnosti

* **Bezpečnostní důkaz** za předpokladu pseudonáhodnosti HMAC.
* **Žádný memory-hard** — pro lidská hesla *nepoužívat*.
* **Důležitý `info` parameter** — kontextová informace (např. `"TLS 1.3 traffic"`, `"encryption key"`). Doménové oddělení.

### TLS 1.3 příklad

```
master_secret = HKDF-Extract(handshake_secret, 0)
client_traffic_key = HKDF-Expand-Label(master_secret, "c ap traffic", transcript_hash, 32)
server_traffic_key = HKDF-Expand-Label(master_secret, "s ap traffic", transcript_hash, 32)
```

Z jednoho `master_secret` se odvozují *všechny* session klíče s odlišnými labels — žádný náhodný kolizí mezi klíči.

## NIST KDF — Single-Step (SP 800-56C)

NIST standard pro KDF z DH/ECDH output. Jednodušší než HKDF:

::: math
\mathrm{key} = \mathrm{Hash}(\mathrm{counter} \| Z \| \mathrm{FixedInfo}),
:::

kde $Z$ je DH shared secret, FixedInfo je kontext (algorithm ID, party IDs). Counter inkrementuje pro delší output.

Použito v některých standardech (NIST P-curves ECDH). HKDF je flexibilnější.

## Common KDF antipatterns

### 1. Naive `sha256(password)`

```python
key = hashlib.sha256(password.encode()).digest()    # ❌
```

* Žádný salt → rainbow tables.
* Žádné stretching → 10⁹ pokusů/s/GPU.
* Žádné memory-hard → GPU útok.

**Správně:** `argon2id` nebo `bcrypt`.

### 2. Same key for encryption and MAC

```python
key = derive_key(password)
ciphertext = aes_encrypt(key, plaintext)
mac = hmac_sha256(key, ciphertext)                  # ❌ stejný klíč pro 2 účely
```

Formálně OK pro HMAC (díky doménovému oddělení), ale lepší:

```python
master = derive_key(password)
enc_key = hkdf_expand(master, "encryption")
mac_key = hkdf_expand(master, "mac")                # ✓ doménově oddělené
```

Nebo lépe: **použij AEAD** ([[padding-aead|AES-GCM]]) místo skládat E+MAC.

### 3. Constant or low salt

```python
key = pbkdf2(password, salt=b"foo", iterations=1000)  # ❌
```

* Salt by měl být *unikátní per password* — typicky 16+ B z `os.urandom`.
* Iterations: minimum $10^5$ pro PBKDF2 (NIST 2017), $10^6$ doporučeno pro 2024+.

### 4. Storing password instead of hash

Záznam plaintextového hesla v databázi je *vždy* chyba. Použijte `argon2id` hash. Pokud útočník získá databázi, hesla jsou *prakticky* nedostupná (předpokládá silná hesla).

## Doporučení (2024)

| Účel | Algoritmus | Parametry |
| :--- | :--- | :--- |
| Password hash | **Argon2id** | m=19MiB, t=2, p=1 (OWASP minimum); m=64MiB, t=3 (recommended) |
| Password hash (legacy/embedded) | **bcrypt** | cost=12 (default), 14 high |
| Password hash (FIPS-required) | **PBKDF2-SHA-256** | iterations $\geq 600\,000$ (NIST 2023) |
| Key derivation z DH/master | **HKDF-SHA-256** | with explicit `info` per derived key |
| Disk encryption KDF | **scrypt** nebo **Argon2id** | high memory/time |
| Soubor/file encryption | `age` (X25519 + ChaCha20-Poly1305) | hotová knihovna |

## Stretching pro různé úrovně bezpečnosti

| Bezpečnostní úroveň | Min memory | Min time | Hash použít |
| :-: | :-: | :-: | :-: |
| Web (low) | 19 MiB | 50 ms | Argon2id |
| Web (high) | 64 MiB | 100 ms | Argon2id |
| Disk full disk encryption | 256 MiB | 500 ms | Argon2id / scrypt |
| KeePass database | 64 MiB | 1000 ms | Argon2id (default in KeePass 2.35+) |
| Bitcoin wallet | scrypt (bip-38) nebo PBKDF2 | high | scrypt / PBKDF2 |

## Klíčová poučení

* **Pomalu* = vlastnost, ne chyba.* Pro hesla, KDF musí být *pomalá* — to je obrana.
* **Memory-hard funkce** (Argon2, scrypt) jsou zásadní proti GPU/ASIC útokům; bcrypt je adaptivní/CPU-cost-hard, nikoli memory-hard.
* **Salt vždy unikátní per password.**
* **Doménové oddělení** — z master key odvodit více klíčů s odlišnými labels.
* **HKDF** pro random-source, **Argon2id** pro hesla.

---

*Zdroj: KRY přednášky 2025/26, KRY 6 — Symetrická správa klíčů. Externí reference: RFC 5869: HKDF — HMAC-based Extract-and-Expand Key Derivation Function (2010); RFC 2898: PKCS #5 PBKDF2 (2000); Biryukov, A., Dinu, D., Khovratovich, D.: "Argon2: New Generation of Memory-Hard Functions for Password Hashing and Other Applications", EuroS&P 2016; Provos, N., Mazières, D.: "A Future-Adaptable Password Scheme", USENIX 1999; OWASP Password Storage Cheat Sheet (2023).*
