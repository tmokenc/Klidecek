---
title: Časová analýza (Timing Attack)
---

# Časová analýza (Timing Attack)

**Timing attack** (TA, časová analýza) je nejstarší a nejintuitivnější side-channel útok. Pokud doba zpracování závisí na tajném klíči nebo PIN, útočník měřením času extrahuje informaci. Útok formalizoval [Paul Kocher 1996](https://www.paulkocher.com/doc/TimingAttacks.pdf), praktikovala se však dávno před tím (např. útoky na UNIX `crypt()` v 80. letech).

## Princip

Operace v procesoru trvá různou dobu podle:

* **Vykonávané instrukce** — násobení trvá déle než XOR, dělení déle než násobení.
* **Větvení programu** — `if (a==b) goto X` skoče různě podle hodnoty.
* **Cache hits / misses** — přístup do paměti je 1 cyklus z L1 cache, 100+ cyklů z RAM.
* **Pipeline stalls** — branches, dependent operations.

Pokud doba **závisí na tajemství**, útočník měří dobu a *zpětně* odhaduje tajemství.

## Útok č. 1 — Verifikace hesla (string comparison)

### Naivní implementace

```c
bool verify_password(char *entered, char *correct, int len) {
    for (int i = 0; i < len; i++) {
        if (entered[i] != correct[i]) return false;
    }
    return true;
}
```

* Při *prvním* nesouladu funkce **okamžitě** vrátí `false`.
* Doba zpracování ≈ *pozice prvního nesouladu*:

| Vstup `entered` | Doba (cykly) | Význam |
| :--- | :--: | :--- |
| `xxxxxxxx` (1. char wrong) | $t_1$ | nesouhlas hned |
| `Cxxxxxxx` (1. char right, 2. wrong) | $t_2 > t_1$ | první char correct |
| `Coxxxxxx` (2 chars right) | $t_3 > t_2$ | první 2 correct |
| `Correct1` (vše correct) | $t_8$ | password match |

### Útok

Pro 8-znakové heslo z ASCII (128 možností):

1. Pro každý znak `c ∈ {0..127}` zkusíme heslo `c,0,0,0,0,0,0,0` a změříme dobu.
2. Hodnota `c` s **nejdelším** časem je první znak.
3. Opakujeme pro 2., 3., ... 8. znak.

Celkem **8 × 128 = 1024** pokusů místo $128^8 = 2^{56}$. Čas-akcelerace: $10^{14}$×.

> **Klíčové:** algoritmus *není* matematicky chybný — vrací správné true/false. Selhává jen ve své *fyzické realizaci*.

::: viz timing-password "Naivni vs. constant-time porovnani. Klikni 'zjisti znak N' a sleduj, jak utocnik za N×|charset| dotazu obnovi heslo (linearne ve velikosti hesla, ne exponencialne)."
:::

### Obrany

* **Naivní:** přidat random delay. Útočník random delay **překoná průměrováním** ($N$ měření na pokus) → potřebuje $N$× tolik měření, ale složitost zůstává lineární. Náhodné zpoždění nepomáhá u dostatečně trpělivého útočníka.
* **Správně:** **constant-time comparison**:

```c
bool ct_eq(const uint8_t *a, const uint8_t *b, int len) {
    uint8_t diff = 0;
    for (int i = 0; i < len; i++) diff |= a[i] ^ b[i];
    return diff == 0;
}
```

Smyčka *vždy* projde celé pole, výsledek se akumuluje XORem. Žádný *early exit*, *žádné větvení* na základě dat. Doba je konstantní pro daný `len`.

V praxi: **memcmp** v C *není* constant-time; použij `CRYPTO_memcmp` (OpenSSL), `sodium_memcmp` (libsodium), `consttime.memcmp` (Linux kernel).

## Útok č. 2 — RSA Square-and-Multiply

[[lfsr-princip|RSA podpis]] je modulární umocnění:

::: math
S = h(m)^d \bmod n
:::

Klasický algoritmus **square-and-multiply**:

```
res = 1; tmp = h
for i = k-1 downto 0 do
    tmp = tmp^2 mod n
    if d[i] == 1 then res = res * tmp mod n
return res
```

* Pro každý bit klíče $d[i]$ se vykoná *square*.
* Pro každý **1**-bit *navíc* multiply.
* Doba operace ≈ $k + w$, kde $k$ je délka klíče a $w$ je Hammingova váha (počet jedniček).

### SPA viz [[spa-dpa]]

Pokud útočník vidí *power trace* operace, *přímo z grafu* odečte sekvenci `square` vs. `square+multiply` a tedy bity klíče. Stovky bitů z jediného traces.

### Časový útok — Kocher 1996

Pokud útočník nemá power, ale jen čas, lze stále uspět:

* **Iterativní útok:** útočník již zná prvních $n$ bitů $d$, chce zjistit bit $d[k-n]$.
* Tipuje $d[k-n] = 1$.
* Zvolí $t$ náhodných zpráv $m_1, \ldots, m_t$ a rozdělí je do dvou skupin:
  * A: zprávy, pro které **Montgomery multiplikace** v dané iteraci povede k *odečtu modulu* (specifická vlastnost MM).
  * B: zprávy, kde nepovede.
* Toto rozdělení útočník **umí spočítat dopředu**, protože zná předchozí bity a Montgomery state.
* Necháme každou zprávu podepsat, změříme čas.
* Pokud průměry A a B se *liší* o dobu trvání odečtu modulu, tip byl správný (1).
* Pokud se *neliší*, multiplikace neproběhla → bit je 0.

**Efektivnost** (Kocher 1996):
* Pro 128-bit RSA klíč: ~2 bity/sekundu, $L = 10\,000$ zpráv.
* Pro 512-bit RSA klíč: ~1 bit/sekundu, $L = 100\,000$ zpráv.

## Útok č. 3 — Brumley-Boneh 2003 — RSA over Internet

[*Remote Timing Attacks Are Practical*](https://crypto.stanford.edu/~dabo/papers/ssl-timing.pdf) — Boneh a Brumley demonstrovali TA proti **vzdálenému Apache + mod_ssl** serveru:

* Server používal OpenSSL s nepatchovaným RSA-CRT (Chinese Remainder Theorem) optimalization.
* **CRT** rozkládá $S = m^d \bmod n$ na dvě menší $S_p = m^{d_p} \bmod p$ a $S_q = m^{d_q} \bmod q$ (s pomocí CRT slepuje), čímž je 4× rychlejší. Ale **doba je závislá** na hodnotě $p$ resp. $q$.
* Útočník v LAN poslal 350 tisíc TLS handshake žádostí, měřil RTT.
* Statisticky odhalil **klíč serveru** během **2 hodin**.

Mitigace: **blinding** — místo $S = m^d \bmod n$ se počítá $S = (rm)^d r^{-1} \bmod n$, kde $r$ je náhodný. Doba pak nezávisí na $m$. OpenSSL přidal blinding od 0.9.7b.

## Útok č. 4 — Lucky Thirteen (2013) — TLS-CBC

[*Lucky Thirteen: Breaking the TLS and DTLS Record Protocols*](https://www.isg.rhul.ac.uk/tls/Lucky13.html) (AlFardan, Paterson):

* TLS používá MAC-then-encrypt s CBC mode.
* Po dešifrování server ověří padding, pak ověří MAC.
* **Doba ověření MAC** závisí na *valid padding length* — kvůli HMAC implementaci (počet hashovacích bloků).
* Útočník modifikuje šifrový text, měří dobu odpovědi → z časového rozdílu **odhadne padding length** → padding oracle.

Mitigace v TLS 1.2+: *constant-time MAC* (přidat dummy bloky), nebo přechod na *AEAD* (AES-GCM, ChaCha20-Poly1305).

## Útok č. 5 — Lucky Microseconds (2016) — Amazon s2n

* Amazon TLS implementace s2n (open source) měla *nesprávnou* mitigaci Lucky 13 — vstupní kontrola měla *měřitelnou* časovou variabilitu.
* Albrecht, Paterson 2016 ukázali, že útok je *praktický* i na s2n.
* Důkaz: ani po 3 letech od původního útoku není mitigace triviální.

## Útok č. 6 — CacheBleed (2016) — OpenSSL AES

* OpenSSL AES implementace používala lookup tables — přístupy do paměti závisí na klíčových bitech.
* **Cache-timing** přes shared L1 cache: útočník na stejném CPU měří cache misses a odvodí, které cache lines AES přístupy nabíjí.
* Extrahuje AES klíč přes ~10⁵ encryption operations.

Mitigace: **bitsliced AES** nebo **AES-NI hardware instructions** — neprochází přes data-dependent tables.

## Útok č. 7 — Minerva (2019), TPM-Fail (2019)

[Minerva](https://minerva.crocs.fi.muni.cz/) (Brno CRoCS — Petr Švenda, Jan Jančár et al.):

* ECDSA implementace v některých smartkartách (NXP, Athena IDProtect, ID Quantique) měla *bias v generování nonces $k$*.
* Konkrétně: čas generování nonces nepatrně závisel na *Hamming weight* $k$.
* Útok kombinuje *timing leak* s *lattice attack* — z ~100 000 podpisů recover ECDSA klíč.

Demonstrované na *certifikovaných* zařízeních (CC EAL5+, FIPS 140-2 Level 3). Karty byly staženy z trhu po publikaci.

**TPM-Fail** ([Moghimi 2019](https://tpm.fail/)) — analogický útok na Intel firmware TPM a STMicro TPM. Klíče atestace TPM recover přes 4–20 minut měření.

## Útok č. 8 — Spectre / Meltdown family (2018+)

Speciální třída — *speculative execution* + *cache timing*:

* Procesor spekulativně vykoná instrukce za branch, pak je *vrátí*, pokud byl branch špatně predikován.
* Ale **cache state** zůstává změněn.
* Útočník měří přístup do paměti, určí, *které cache lines* byly nabity → odvodí *spekulované hodnoty*.

Spectre v1 (bounds check bypass), v2 (branch target injection), Meltdown (kernel memory disclosure), Foreshadow (Intel SGX), MDS (Microarchitectural Data Sampling), LVI (Load Value Injection), …

Tyto útoky jsou *systémově* mitigovány (microcode updates, OS patches, compiler flags), ale teoreticky byly otřesem celé branche bezpečnosti CPUs.

## Obrana proti TA

* **Constant-time code** — žádné `if`, `switch`, smyčky závislé na tajných hodnotách. Žádné `memcmp` na tajemstvích.
* **Constant-time bignum / EC** — knihovny libsodium, BoringSSL, fiat-crypto poskytují const-time implementace.
* **Blinding** pro asymetrickou kryptografii — randomized inputs neutralizují timing leak.
* **AES-NI / Crypto Extensions** — HW akcelerované AES nemá data-dependent timing.
* **Compiler hardening** — `-fstack-protector`, `-fcf-protection` (Intel CET), constant-time intrinsics.
* **Audit** — formální verification (např. [hacspec](https://github.com/hacspec/hacspec) pro hlavičky), testy s [ctgrind](https://github.com/agl/ctgrind) (valgrind extension pro detekci data-dependent timing).

> Pravidlo: ani v 21. století není rozumné věřit, že compiler optimalizace *zachovají* constant-time properties zdrojového kódu. Vždy je třeba *audit* na finálním binarní úrovni.

---

*Zdroj: BZA přednášky 2025/26, BZA 05 — Postranní kanály (Malinka). Externí reference: Kocher, P.: *Timing Attacks on Implementations of Diffie-Hellman, RSA, DSS, and Other Systems* (CRYPTO 1996) — [PDF](https://www.paulkocher.com/doc/TimingAttacks.pdf); Brumley, D., Boneh, D.: *Remote Timing Attacks Are Practical* (USENIX Security 2003) — [PDF](https://crypto.stanford.edu/~dabo/papers/ssl-timing.pdf); AlFardan, N., Paterson, K. G.: *Lucky Thirteen: Breaking the TLS and DTLS Record Protocols* (IEEE S&P 2013) — [project page](https://www.isg.rhul.ac.uk/tls/Lucky13.html); Jančár, J. et al.: *Minerva: Cryptographic key recovery from ECDSA implementations* (Brno CRoCS) — [project page](https://minerva.crocs.fi.muni.cz/).*
