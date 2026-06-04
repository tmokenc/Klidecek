---
title: Útoky na RSA
---

# Útoky na RSA

RSA primitivum samo o sobě (modulární umocnění) **není bezpečné** — bezpečnost vyžaduje pečlivé schéma okolo (OAEP, PSS), správnou volbu parametrů (velikost $n$, exponent $e$), kvalitní implementaci a respektování bezpečnostních omezení. Tahle kapitola shrnuje hlavní *kategorie* útoků.

## Faktorizační útoky

Pokud útočník zfaktorizuje $n = pq$, dopočítá $\varphi(n)$ a $d$ — totální průlom. Faktorizační algoritmy ([[problemy]]):

* **Trial division** — $O(\sqrt{n})$. Pro 2048-bit $n$: $2^{1024}$. Nedostupné.
* **Pollardův $\rho$** — $O(n^{1/4}) = 2^{512}$ pro RSA-2048. Nedostupné.
* **Pollardův $p-1$** — funguje, pokud $p-1$ je $B$-smooth (skládá se z malých faktorů). Obrana: *safe primes* $p = 2q+1$.
* **ECM (Lenstra)** — efektivní pro **menší faktory**. Útok proti $n$ s nevyváženými $p \ll q$.
* **Quadratic Sieve (QS)** — sub-exponenciální. Vhodný pro $n$ do ~110 desítkových cifer.
* **General Number Field Sieve (GNFS)** — nejlepší pro velké $n$. Sub-exponenciální $L_n[1/3, 1.923]$.

### Praktické úspěchy

| Rok | RSA prolomené | Počet bitů | Týmové úsilí |
| :-: | :--- | :-: | :--- |
| 1999 | RSA-512 (155 cifer) | 512 b | 8000 CPU-let |
| 2009 | RSA-768 (232 cifer) | 768 b | $\sim$2000 CPU-let |
| 2010 | RSA-768 | 768 b | $\sim$2000 CPU-let (potvrzení) |
| 2020 | RSA-829 (250 cifer) | 829 b | ~2700 CPU-let |

**RSA-1024 stále neprolomena**, ale je na hraně — odhad <$10^5$ CPU-let. NSA jí pravděpodobně umí; akademická komunita ne. **Doporučení:** RSA-2048 minimum, RSA-3072+ pro dlouhodobou bezpečnost.

## Common modulus attack

**Scénář:** Alice a Bob používají *stejné* $n$ ale různé exponenty $(e_1, d_1)$ a $(e_2, d_2)$.

Pokud $\gcd(e_1, e_2) = 1$, lze najít $a, b$ s $a e_1 + b e_2 = 1$. Pak

::: math
C_1^a \cdot C_2^b = M^{e_1 a} \cdot M^{e_2 b} = M^{a e_1 + b e_2} = M.
:::

Útočník (kdokoli s znalostí oboustranně zašifrované zprávy) ji rozšifruje **bez znalosti $d_1, d_2$**.

> Důsledek: **každý uživatel musí mít vlastní $n$**. Sdílení modulu mezi uživateli je závažná chyba.

## Common factor attack — Heninger 2012

**Scénář:** mnoho uživatelů (typicky embedded zařízení, routery) generuje RSA klíče se slabým RNG. Některé klíče sdílí stejný prvočíselný faktor $p$.

Útočník stáhne všechny veřejné klíče (např. ze SSL skenu internetu), spočítá $\gcd(n_i, n_j)$ pro každou dvojici. Pokud $\gcd \neq 1$, oba klíče jsou prolomené.

**Heninger, Durumeric, Wustrow, Halderman (USENIX Security 2012):** sken 5,8 mil. TLS certifikátů, 6,2 mil. SSH klíčů. Faktorizovali ~64 000 SSL klíčů, ~108 000 SSH klíčů. **Příčina:** routery a embedded zařízení generovaly klíče *při bootu*, kdy entropie systému byla minimální.

> Obrana: kvalitní RNG při generování. Hardware RNG, nebo /dev/urandom *po* dostatečném warm-up.

## Low public exponent attacks

Pro výkonové důvody se používá malý $e$ (3, 17, 65537). Slabosti:

### Low exponent + krátká zpráva

Pokud $M^e < n$ (tj. $M < n^{1/e}$), pak $C = M^e$ je *bez* redukce modulo $n$. Útočník spočítá $M = \sqrt[e]{C}$ přes klasickou celočíselnou odmocninu.

**Příklad:** $e = 3$, $n = 2048$ b. Pokud $M < n^{1/3} \approx 683$ b, pak útočník bere kubickou odmocninu z $C$.

**Obrana:** padding (PKCS#1 v1.5, OAEP) přidá náhodný padding na *plnou velikost $n$*. Pak $M$ jako celé číslo má bity ~$n$ a útok nefunguje.

### Håstad's broadcast attack

**Scénář:** Alice posílá *stejnou* zprávu $M$ třem příjemcům s *e=3* a moduly $n_1, n_2, n_3$. Útočník zachytí $C_i = M^3 \bmod n_i$.

Pomocí CRT spočítá $M^3 \bmod n_1 n_2 n_3$. Protože $M^3 < n_1 n_2 n_3$, je to *celočíselná* hodnota $M^3$. Útočník vezme kubickou odmocninu.

**Obrana:** *Stejnou* zprávu k více příjemcům posílat *s různým paddingem* pro každého. OAEP s náhodným seedem to zajišťuje.

### Coppersmith — útoky pro malé exponenty

Coppersmith (1996): pokud $e = 3$ a polynom $f(x) = (M + x)^e - C$ má kořen modulo $n$ s $|x| < n^{1/e}$, lze ho najít v polynomiálním čase (lattice reduction, LLL).

**Důsledek:** pokud útočník zná *většinu* bitů $M$ a chybí jen málo, najde zbytek. Reálný útok proti **partially known plaintext** šifrovaných hesel ap.

**Coppersmith faktorizace:** pokud útočník zná $\geq n^{1/4}$ horních bitů $p$, dokáže $p$ najít.

## Bleichenbacher útok (1998) — PKCS#1 v1.5

Bleichenbacher 1998 (CRYPTO): chosen-ciphertext útok proti **RSA-PKCS#1 v1.5 encryption padding**.

PKCS#1 v1.5 padding pro šifrování:

```
EM = 0x00 || 0x02 || PS || 0x00 || M
```

kde `PS` je nenulový padding, alespoň 8 bajtů. Pokud po dešifrování padding *neodpovídá* tomuto formátu (chybí `0x00 0x02` na začátku), implementace vrátila chybu.

**Útok:** útočník modifikuje ciphertext $C$ na $C' = C \cdot s^e \bmod n$ pro vybrané $s$. Po dešifrování plaintext je $s \cdot M \bmod n$. Pokud výsledek splňuje PKCS#1 v1.5 padding, server přijme — útočník dostal informaci, že $s M \bmod n$ začíná `0x00 0x02`. Postupně útočník zužuje interval pro $M$.

**Náklady:** $\sim 2^{20}$ dotazů na server. Praktické proti SSL/TLS, IBM Lotus.

**Varianty:**

* **ROBOT** (Böck, Somorovsky, Young 2017) — Bleichenbacher proti moderním TLS implementacím (F5, Citrix, Cisco ACE). 27 z velkých 100 sites prolomitelné.
* **CAT (Cache Attack on TLS)** — variant využívající cache timing místo přímé padding chyby.

**Obrana:** *RSA-OAEP* (nebo přechod na ECDH). Pokud PKCS#1 v1.5 musí zůstat, implementace **MUSÍ** vrátit *stejnou chybu / čas* pro správný i špatný padding.

## Pa­dding oracle proti podpisu — Bleichenbacher 2006

Variant proti RSA-PKCS#1 v1.5 *signature* s $e = 3$. Slabost: některé implementace ověřily podpis nestrictně — *povolily zbytkové bajty* za platným paddingem.

Útočník dokáže vyrobit *falešný* podpis $\sigma$ s nesprávným paddingem, ale stejným hashováním. Praktické proti starým OpenSSL, GnuPG, Mozilla NSS.

**Obrana:** strict padding validation. RSA-PSS od základu probabilistic; tento útok proti PSS *není* aplikovatelný.

## Side-channel — timing, power, cache

Kocher (1996): **timing útok proti RSA**. Pokud square-and-multiply implementace větví podle bitu klíče, doba šifrování unikne tajný $d$. Statisticky analyzovat měření $\Rightarrow$ klíč.

**Power analysis** (Kocher, Jaffe, Jun 1999): spotřeba čipové karty během RSA umocnění je *přímo závislá* na hammingově váze stavu. SPA: jeden run uvidí bity $d$. DPA: tisíce runů + statistika.

**Bellcore útok / Fault injection** (Boneh, DeMillo, Lipton 1997): vyvolat hardwarovou chybu (laser, podpětí) během CRT dešifrování. $\gcd(c^e - C, n)$ vrátí $p$ nebo $q$.

**Obrana:**

* **Constant-time umocnění** — Montgomery ladder bez větvení.
* **Blinding:** $M_b = M \cdot r^e \bmod n$ pro náhodné $r$. Útok získá $M_b^d = r M^d$, ale nezná $r$.
* **Sanity check** po CRT: ověřit $(m^e \bmod n) = C$.

## Slabé klíče

* **$p \approx q$** — Fermatova faktorizace najde $p, q$ v $O(\sqrt{|p - q|})$. Doporučení: $|p - q| > n^{1/4}$.
* **$p - 1$ smooth** — Pollardův $p-1$. Doporučení: safe primes.
* **$d$ malé** (Wienerův útok 1990) — pokud $d < n^{1/4}/3$, lze $d$ najít z rozšířených zlomkových rozvojů $e/n$. **Obrana:** používat $e$ malé (65537), $d$ velké.
* **Boneh-Durfee 1999:** rozšíření Wienera — $d < n^{0.292}$ je zranitelné.

## RSA-2048 v r. 2025 — je bezpečné?

Krátká odpověď: **ano, ale dlouhodobě ne.**

* Klasické: GNFS pro RSA-2048 vyžaduje ~$2^{112}$ operací — nedostupné konvenčním HW.
* Kvantové: Shorův algoritmus prolomí RSA-2048 *polynomiálně*. Kdy bude dostupný kvantový stroj odhaduje:
  * IBM 2023 roadmap: 100 000 fyzických qubits 2033.
  * Pro RSA-2048: ~10 milionů fyzických qubits (s ~5000 logickými).
  * Reálný timeline: 2035–2045 podle většiny odhadů.
* "Harvest now, decrypt later": NSA, Čína sbírají zašifrovaný provoz dnes pro budoucí dešifrování. Pro vysoce citlivá data: *již dnes* hybrid RSA+Kyber, nebo pure Kyber ([[postkvantova]]).

## Praktické doporučení (2024–2025) {tier=practice}

| Účel | Doporučení |
| :--- | :--- |
| Šifrování (KEM) | RSA-OAEP-SHA-256 → migrate na X25519 / Kyber |
| Podpis | RSA-PSS-SHA-256 → migrate na Ed25519 / Dilithium |
| Krátkodobá ochrana (<5 let) | RSA-2048 OK |
| Dlouhodobá (>10 let) | RSA-3072 nebo větší, plánovat PQC migration |
| Embedded / IoT | ECC (X25519, Ed25519); RSA žije svým HW omezením |
| Software signing | RSA-2048 / RSA-4096 (kvůli dlouhému timeline trust chains) |

**Nikdy nedělejte:**

* Vlastní RSA implementaci (matematické chyby, side-channels).
* Textbook RSA pro produkční použití.
* RSA s $e = 3$ bez OAEP.
* PKCS#1 v1.5 šifrování (přejít na OAEP).
* RSA bez constant-time implementace.

---

*Zdroj: KRY přednášky 2025/26, KRY 4 — Asymetrické algoritmy. Externí reference: Bleichenbacher, D.: "Chosen Ciphertext Attacks Against Protocols Based on the RSA Encryption Standard PKCS #1", CRYPTO 1998; Boneh, D., DeMillo, R., Lipton, R.: "On the Importance of Checking Cryptographic Protocols for Faults", EUROCRYPT 1997; Heninger, N. a kol.: "Mining Your Ps and Qs", USENIX Security 2012; Boneh, D.: "Twenty Years of Attacks on the RSA Cryptosystem", Notices AMS 46(2), 1999; Boneh, D., Durfee, G.: "Cryptanalysis of RSA with Private Key d Less than N^0.292", IEEE Trans. Inf. Theory 46(4), 2000.*
