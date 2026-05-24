---
title: Bellcore útok na RSA-CRT
---

# Bellcore útok na RSA-CRT

Klasický příklad **DFA** ([[dfa-princip]]) — útok na RSA implementace s CRT optimalizací. **Boneh, DeMillo, Lipton 1996** ho objevili, *byl pojmenován po laboratoři Bellcore* (Bell Communications Research), kde výzkum probíhal. Jednoduchost a elegance útoku ho udělaly **kanonickým** příkladem důležitosti fault-resistant implementací.

## RSA-CRT — proč se používá

Standard RSA podpis nebo dešifrování:

::: math
S = m^d \bmod n
:::

kde $n = pq$ je modulus, $d$ je soukromý exponent. Pro 2048-bit RSA klíč: $|d| \approx 2048$ bitů. Operace je *pomalá* — modular exponentiation s 2048-bit operandy.

**Chinese Remainder Theorem (CRT) optimalizace** rozkládá:

::: math
\begin{aligned}
S_p &= m^{d_p} \bmod p, \quad &d_p = d \bmod (p-1) \\
S_q &= m^{d_q} \bmod q, \quad &d_q = d \bmod (q-1)
\end{aligned}
:::

a slepuje výsledek pomocí CRT (Gauss algorithm nebo Garner):

::: math
S = \text{CRT}(S_p, S_q) = S_q + q \cdot (q^{-1} \bmod p) \cdot (S_p - S_q) \bmod n
:::

Výhoda:

* $|p| = |q| = 1024$ bitů.
* Modular exponentiation s 1024-bit operandy je **~4× rychlejší** než s 2048-bit (kubická komplexita pro multiplication).
* **Celkový speedup: ~3–4×** (memory + CRT slepování má cca 5 % overhead).

Standardní v OpenSSL, mbedTLS, Java JCE, smart cards, HSMs. **Téměř** všechny moderní RSA implementace používají CRT.

## Útok

::: svg "RSA-CRT s chybou v S_p: výsledný S' obsahuje chybu, ale S_q je správný. gcd(S - S', n) = q, čímž faktorizujeme n."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aBE1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40" y="40" width="120" height="40" rx="6"/>
    <rect x="220" y="20" width="140" height="40" rx="6"/>
    <rect x="220" y="80" width="140" height="40" rx="6"/>
    <rect x="400" y="40" width="120" height="40" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="64" font-size="11">plaintext m</text>
    <text x="290" y="42" font-size="11">S_p = m^d_p mod p</text>
    <text x="290" y="56" font-size="9" fill="var(--danger, #d33)">← FAULT</text>
    <text x="290" y="102" font-size="11">S_q = m^d_q mod q</text>
    <text x="460" y="56" font-size="11">CRT slepení</text>
    <text x="460" y="72" font-size="10" fill="var(--text-muted)">S' (chybný)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aBE1)">
    <path d="M160,60 L218,40"/>
    <path d="M160,60 L218,100"/>
    <path d="M360,40 L398,52"/>
    <path d="M360,100 L398,68"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="160" font-size="11.5">útočník zná m a má korektní S (z předchozího spuštění bez chyby)</text>
    <text x="270" y="180" font-size="12" fill="var(--accent)">gcd(S − S', n) = q</text>
    <text x="270" y="200" font-size="10" fill="var(--text-muted)">protože S a S' jsou shodné mod q, ale různé mod p</text>
    <text x="270" y="222" font-size="11" fill="var(--accent)">→ p = n/q → soukromý klíč d odvodit</text>
  </g>
</svg>
:::

::: viz bellcore-rsa-crt "Vyber maly preset (p=251, q=257) a sleduj, jak chybny S_p vede pres gcd(S − S', n) = q k plne faktorizaci n a obnove d. Jediny chybny podpis."
:::

### Detailní postup

1. Útočník má veřejný klíč $(n, e)$.
2. Získá **korektní** podpis $S$ pro známý plaintext $m$: $S \equiv m^d \pmod{n}$.
3. Indukuje chybu (glitch, laser, EM-FI) během CRT výpočtu — *konkrétně* během výpočtu $S_p$ (ne $S_q$). Získá **chybný** podpis $S'$.
4. $S'$ má vlastnost:
   * $S' \equiv S_p' \pmod{p}$, kde $S_p'$ je chybná hodnota.
   * $S' \equiv S_q \pmod{q}$, kde $S_q$ je *správné* (chyba ho nezasáhla).
5. Protože $S$ je *správné* mod obou prvočísel:
   * $S - S' \equiv 0 \pmod{q}$ — oba dávají $S_q$.
   * $S - S' \not\equiv 0 \pmod{p}$ — liší se v $S_p$.
6. Spočti **GCD**:

::: math
\gcd(S - S', n) = q
:::

7. **Faktorizace:** $p = n / q$. Z $(p, q)$ se odvodí $\varphi(n) = (p-1)(q-1)$ a $d = e^{-1} \bmod \varphi(n)$ (extended Euclidean algorithm).

### Komplexita

* **Jeden** fault pair $(S, S')$ stačí.
* GCD: $O(|n|^2) = O(2048^2)$ bitových operací — *milisekundy* na běžném PC.
* EEA pro $d$: dalších $O(|n|^2)$.
* **Recovery RSA-2048 klíče za < 1 sekundu** od získání chybného podpisu.

## Varianty útoku

### Lenstra 1996

[*Memo on RSA signature generation in the presence of faults*](https://link.springer.com/chapter/10.1007/3-540-49649-1_18) — útočník nemá *korektní* $S$, jen $S'$ a hash zprávy $h(m)$:

* Útočník ověří, zda $(S')^e \stackrel{?}{=} h(m) \pmod{n}$ — pokud fault, ne.
* Spočítá $X = (S')^e - h(m) \bmod n$.
* $\gcd(X, n) = q$ — protože $X$ je dělitelné $q$ ($(S')^e \equiv h(m) \pmod q$, ale ne mod $p$).

**Důsledek:** útočník nepotřebuje znát korektní $S$. Stačí znát hash zprávy a chybný podpis.

### Random fault model

* Útočník neumí cílit přesně na $S_p$ vs $S_q$. Indukuje *random* fault.
* S pravděpodobností ~50 % zasáhne $S_p$ (přesně Boneh-DeMillo-Lipton).
* S pravděpodobností ~50 % zasáhne $S_q$ — analogicky $\gcd(S - S', n) = p$.
* S malou pravděpodobností zasáhne CRT slepování — útok stále možný (Joye-Yen 1999).

### Single-byte fault model

Realistický pro EM-FI / laser: chyba flipne *jeden byte* (8 bitů) v $S_p$. Útok stále funguje, ale obtížnější identifikovat, kterou *konkrétní* fault model.

## Obrany

### Standardní — verify before output

Po výpočtu $S$ ověř:

```c
if (S^e mod n != m) {
    abort();  // fault detected
}
return S;
```

* **Cost:** jedna další modular exponentiation s veřejným exponentem $e$. Protože $e$ je typicky malé (3, 65537), je *rychlé*.
* **Účinnost:** 100 % proti DFA na RSA-CRT.
* **OpenSSL** od r. 2002 (po publikaci útoku v praktickém scenáři) implementuje tuto kontrolu.

### Shamir's trick (1999)

[Shamir](http://www.wisdom.weizmann.ac.il/~naor/PUZZLES/eli/safeRSA.html) navrhl jinou strategii — místo verify spočítej *podpis dvakrát*:

* První výpočet: $S \bmod p \cdot t$ pro náhodné $t$ a $S \bmod q \cdot t$.
* Druhý výpočet: $(S \bmod p \cdot t) \bmod t$ a $(S \bmod q \cdot t) \bmod t$.
* Pokud oba dávají stejný výsledek mod $t$, fault detected = false. Pokud ne, fault detected.

Cost: ~10 % overhead. Dnes méně populární než plain verify.

### Aumüller-Bier-Fischer-Hofreiter-Seifert 2002

[*Fault Attacks on RSA with CRT*](https://link.springer.com/chapter/10.1007/3-540-36400-5_20) — robustnější varianta Shamir's trick. Detekce *random* faults s vysokou pravděpodobností.

### Infective countermeasures

Místo *abort* po fault, *infect* output s random data:

```c
if (S^e mod n != m) {
    S = S XOR random();  // make output unusable
}
return S;
```

* **Výhoda:** žádný timing rozdíl mezi correct a fault case. Útočník nedostane informaci o tom, *zda* fault detected.
* **Nevýhoda:** pokud implementace špatně, infection sama o sobě může leak informaci.

### Hardware-level

* **Dual rail logic** ([[obrana-pk]]) — symetrické signály, fault by musel zasáhnout *oba* (málo pravděpodobné s laser).
* **Sensors** (light, voltage, glitch) — detekce fault injection apparat.
* **Mesh tamper-detect** — pokud útočník dělá decap pro laser, mesh přerušení → zeroization.

## Reálné případy

* **Aktivně využíván** v 90. letech proti *placené TV* a *satelitním kartám* — útočníci dostali korektní podpis kreditních příkazů, pak EM-FI indukovali fault → faktorizace klíče provider.
* **Demonstrace v r. 2010** na akademických kartách bez kontroly — *jediný* fault stačil pro recovery klíče za $1M USD CA cert.
* **Smart cards EAL4** v r. 2002 zranitelné; po Bellcore publikaci certifikace EAL5+ explicitně testuje resistance.
* **Java Card 3.0.5** od r. 2017 obsahuje *povinný* verify check pro `RSA.signWithCRT()`.
* **OpenSSL** od r. 1999 (verze 0.9.7) implementuje verify check.

## Klíčová ponaučení

1. **Optimalizace ≠ bezpečnost.** CRT je *4× rychlejší*, ale otevírá útok, který *neexistuje* pro non-CRT RSA. Designér musí *uvědomovat trade-off*.
2. **Jeden fault stačí.** Na rozdíl od většiny DPA/TA, kde je potřeba mnoho měření, DFA na RSA-CRT je *singleton* útok. Žádné průměrování, žádná statistika.
3. **Verify after compute** je univerzální patika. Stejný princip se aplikuje na AES (re-encrypt and compare), ECDSA (verify), atd.
4. **Boneh-DeMillo-Lipton je klasický paper.** Teoretická elegance v kombinaci s praktickým dopadem — referenční čtení pro fault-attack literaturu.

---

*Zdroj: BZA přednášky 2025/26, BZA 06 — Chybová analýza. Externí reference: Boneh, D., DeMillo, R. A., Lipton, R. J.: *On the Importance of Checking Cryptographic Protocols for Faults* (EUROCRYPT 1997, journal version J. Cryptol. 2001) — [PDF](https://crypto.stanford.edu/~dabo/papers/faultattack-paper.pdf); Lenstra, A. K.: *Memo on RSA signature generation in the presence of faults*, 1996 — [PDF](https://infoscience.epfl.ch/record/164524); Aumüller, C., Bier, P., Fischer, W., Hofreiter, P., Seifert, J.-P.: *Fault Attacks on RSA with CRT: Concrete Results and Practical Countermeasures* (CHES 2002) — [PDF](https://link.springer.com/chapter/10.1007/3-540-36400-5_20); Joye, M., Yen, S.-M.: *Hardware Fault Attack on RSA with CRT Revisited* (ICISC 2002).*
