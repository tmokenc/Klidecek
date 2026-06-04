---
title: Útoky na hashovací funkce
---

# Útoky na hashovací funkce

Kromě "klasických" útoků na *kolize* a *pre-image* ([[hash-funkce]]) existují útoky využívající *strukturu* konstrukce (Merkle-Damgård) nebo *konkrétní* slabiny algoritmu (MD5, SHA-1 byly prolomeny strukturální analýzou).

## Birthday attack — generování kolize

Standardní útok, viz [[hash-funkce|paradox narozenin]]. Pro $n$-bit hash: $O(2^{n/2})$ čas a paměť.

### Implementace (zjednodušeno)

```python
def birthday_attack(H, target_bits):
    seen = {}
    while True:
        x = random_bytes()
        h = H(x)[:target_bits // 8]
        if h in seen:
            return seen[h], x  # collision
        seen[h] = x
```

Pro 128-bit hash: $2^{64}$ pokusů, $2^{64}$ paměť → nedostupné.
Pro 64-bit hash: $2^{32}$ pokusů → trivial na běžném HW (~min).

### Pollardův $\rho$ pro kolize

**Bez paměti.** Iteruj $x_{i+1} = H(x_i)$. Použij Floydovu detekci cyklu: po $O(2^{n/2})$ krocích najdeš dvojici $x_i, x_j$ s $H(x_i) = H(x_j)$.

Paměťová složitost $O(1)$ vs. naivní $O(2^{n/2})$. *Time-memory* tradeoff.

::: viz pollard-rho "Floydův algoritmus tortoise-and-hare najde cyklus iterace x_{i+1} = h(x_i) v O(√N) čase a O(1) paměti. Tvar trajektorie připomíná řecké ρ — proto název."
:::

## Length-extension attack

Slabost Merkle-Damgård konstrukce. Pokud útočník zná $H(M)$ a $|M|$ (nemusí znát $M$), může spočítat $H(M \| \mathrm{pad} \| M')$ pro libovolné $M'$.

### Princip

Hash $H(M) = h_L$ je *finální stav* Merkle-Damgård iterace. Stačí *pokračovat v iteraci* dalšími bloky $M'$:

::: math
H(M \| \mathrm{pad}(M) \| M') = f(f(\dots f(H(M), M'_1), M'_2), \dots).
:::

Útočník inicializuje stav $h_0 = H(M)$ a iteruje na $M'$. Padding $M$ se musí přesně rekonstruovat (potřeba $|M|$).

### Útok proti naivnímu MAC

Naivní MAC: $\mathrm{MAC}_K(M) = H(K \| M)$. Útočník zná dvojici $(M, \mathrm{MAC}_K(M))$:

1. Zná $H(K \| M)$ a délku $|K| + |M|$.
2. Spočítá $H(K \| M \| \mathrm{pad} \| M') = \mathrm{MAC}_K(M \| \mathrm{pad} \| M')$ — *bez znalosti $K$*.
3. Pošle $(M \| \mathrm{pad} \| M', \mathrm{MAC}^*)$ — server akceptuje jako platné!

Toto **prolomilo Amazon S3 signing** v 2009 (CloudFront), Flickr API a další.

### Obrana

* **HMAC** ([[mac-hmac]]) — zdvojený hash s odlišnými klíči maskuje length-extension.
* **SHA-3** — sponge konstrukce přirozeně blokuje. Žádná "finalita" stavu.
* **HKDF, KMAC** — také nezranitelné.

## Chosen-prefix collision

Silnější útok než generická kolize. Útočník si vybere *dva prefixy* $P_1 \neq P_2$ a najde *suffixy* $S_1, S_2$ takové, že $H(P_1 \| S_1) = H(P_2 \| S_2)$.

### Praktické důsledky

* **Flame malware (2012):** Microsoft Windows Update certifikát byl falešný — útočníci našli MD5 chosen-prefix kolizi s legitimním certifikátem Microsoft Terminal Services Licensing. **Stuxnet-class malware** podepsaný platným MS certifikátem.
* **SHAttered (2017):** dva PDF dokumenty se stejným SHA-1 hashem, vizuálně odlišný obsah. Stevens, Bursztein, Karpman; 110 GPU-let / ~6500 CPU-let.
* **SHA-1 chosen-prefix (2020):** Leurent, Peyrin — útok za $2^{63.4}$, ~10 GPU-let. Praktické proti PGP signatures (které stále SHA-1 podporovaly).

### Stavová útok proti SHA-1

SHA-1 chosen-prefix attack využívá:

1. **Birthday / near-collision fáze** — najdi *pár* zpráv, jejichž stavový rozdíl spadá do úzké množiny, z níž lze pokračovat near-collision bloky.
2. **Differential characteristic** — projít rozdíly přes všech 80 kol s vysokou pravděpodobností.
3. **Boomerang refinement** — kombinovat několik charakteristik.

Útok vyžaduje hluboké specifické znalosti SHA-1; není transferovatelný na SHA-256.

## Rainbow tables (pre-image attack)

Pro slabé hashe hesel (MD5, SHA-1 bez salt) lze předpočítat tabulku páru (heslo, hash) a online vyhledávat. **Rainbow tables** (Oechslin 2003) optimalizují paměť pomocí "redukčních funkcí" a řetězců.

### Příklad {tier=example}

Naivní tabulka 1 mld. nejčastějších hesel s MD5: 1 GB. Online lookup: O(1) po načtení tabulky.

Rainbow tables: stejné pokrytí v 100 MB, online lookup $O(\sqrt{N})$ kde $N$ je velikost pokrytého prostoru.

### Obrana — salt

```
H(salt || password)
```

* **Salt** je *unikátní* na uživatele (typicky 16+ bajtů náhodných).
* Útočník musí *pro každý salt* spočítat vlastní tabulku.
* Pre-počítané tabulky useless.

### Memory-hard funkce

Argon2, bcrypt, scrypt jsou KDF navržené tak, aby útok rainbow tables byl *prakticky nemožný*. Vyžadují *megabajty paměti per hash výpočet*. Viz [[kdf]].

## Multi-collision attack — Joux

Joux (2004): pokud najdeme $k$ kolizí v Merkle-Damgård, můžeme z nich postavit $2^k$ vstupů se stejným hashem.

### Princip

Najdi $k$ "diamantových" struktur — dvojice bloků $(M_i, M_i')$ s $f(h_{i-1}, M_i) = f(h_{i-1}, M_i')$. Pak pro každou kombinaci voleb $M_i$ vs. $M_i'$ dostaneme vstup se stejným finálním $h$. Celkem $2^k$ vstupů.

Cena: $k \cdot 2^{n/2}$ generických birthday útoků (lineárně, ne exponenciálně!). Vůči naivní očekávání $2^{kn/2}$ pro $2^k$ kolizí to je *enormní zlevnění*.

### Důsledek

**Combiner $H_1(M) \| H_2(M)$** (kombinace dvou hashovacích funkcí) nepřináší $2n$-bit kolizní bezpečnost. Joux útok dává *jen* zhruba $n$-bit kolizní bezpečnost (tj. kolizi v řádu $k \cdot 2^{n/2}$ práce), místo očekávaných $2n$ bitů. Proto se kombinéry hashe v praxi *nepoužívají*.

## Side-channel útoky na hash

* **Timing:** některé implementace hashe (zejména MD5) měly *neuniform* časování — uniklo strukturu vstupu.
* **Cache timing:** SHA-2 tabulkové implementace v některých prostředích byly napadnutelné cache timing útoky.
* **Power analysis:** smartcard implementace SHA pad přes DPA.

Moderní *constant-time* implementace v knihovnách (OpenSSL, BoringSSL) toto eliminují.

## Bezpečnost vůči kvantovému počítači

Kvantové útoky na hashe:

* **Groverův algoritmus:** pre-image v $O(2^{n/2})$ kvantových operacích. Pro SHA-256 to je $2^{128}$ — *teoreticky proveditelné*, prakticky vyžaduje miliony stabilních qubits + dekády hardwarového pokroku.
* **BHT algoritmus** (Brassard-Høyer-Tapp 1998): kolize v $O(2^{n/3})$. Pro SHA-256: $2^{85}$ kvantových operací.

### Důsledek pro velikosti

Pro post-kvantovou bezpečnost na úrovni $\geq 128$ bitů:

* **Pre-image / second pre-image:** SHA-256 stačí (Grover dává $2^{128}$).
* **Kolize:** SHA-256 dává jen $2^{85}$ kvantově. **Doporučení: SHA-384 nebo SHA-512** pro kolizní odolnost.

NIST PQC standardy ([[postkvantova]]) používají *primárně* SHA3-256, SHAKE128/256 a SHA-512.

## Praktická doporučení {tier=practice}

| Útok | Obrana |
| :--- | :--- |
| Birthday | Použij $\geq$ 256-bit hash |
| Length-extension | SHA-3, BLAKE3, HMAC, HKDF (NE naive `H(K\|M)`) |
| Rainbow tables | Salt + memory-hard KDF (Argon2) |
| Chosen-prefix kolize | Vyhněte se MD5, SHA-1 |
| Multi-collision | Žádný "hash combiner"; jeden dobrý hash > spojení dvou slabých |
| Side-channel | Constant-time implementace (knihovny) |
| Kvantový | SHA-384+ nebo SHA-3-512 pro dlouhodobou bezpečnost |

### Co určitě nedělat

* **Neaplikovat MD5 nebo SHA-1** pro nic kryptograficky důležitého.
* **Nepoužívat `H(K || M)` jako MAC** — použij HMAC nebo KMAC.
* **Nehashovat hesla bez salt + KDF** — `sha256(password)` je naivní; použij `argon2id`.
* **Nevěřit `secure_compare(H(input), expected)`** s naive `==` — *timing leak*. Použij `constant_time_compare`.

---

*Zdroj: KRY přednášky 2025/26, KRY 4 — Asymetrické algoritmy. Externí reference: Joux, A.: "Multicollisions in Iterated Hash Functions", CRYPTO 2004; Stevens, M., Bursztein, E., Karpman, P. a kol.: "The first collision for full SHA-1", CRYPTO 2017; Leurent, G., Peyrin, T.: "From Collisions to Chosen-Prefix Collisions — Application to Full SHA-1", EUROCRYPT 2019; Oechslin, P.: "Making a Faster Cryptanalytic Time-Memory Trade-Off", CRYPTO 2003; Brassard, G., Høyer, P., Tapp, A.: "Quantum cryptanalysis of hash and claw-free functions", LATIN 1998.*
