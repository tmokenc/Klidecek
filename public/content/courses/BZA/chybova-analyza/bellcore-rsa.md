---
title: Bellcore útok na RSA-CRT
---

# Bellcore útok na RSA-CRT

Klasický příklad **diferenciální chybové analýzy (DFA)** ([[dfa-princip]]) — útok na implementace RSA s optimalizací pomocí čínské věty o zbytcích (CRT). Objevili ho **Boneh, DeMillo a Lipton v roce 1996** a *byl pojmenován po laboratoři Bellcore* (Bell Communications Research), kde výzkum probíhal. Díky své jednoduchosti a eleganci se stal **kanonickým** příkladem toho, jak důležité jsou implementace odolné vůči chybám (fault-resistant).

## RSA-CRT — proč se používá

Standardní podpis nebo dešifrování RSA vypadá takto:

::: math
S = m^d \bmod n
:::

kde $n = pq$ je modulus a $d$ je soukromý exponent. Pro 2048bitový RSA klíč platí $|d| \approx 2048$ bitů. Tato operace je *pomalá* — jde o modulární umocňování (modular exponentiation) s 2048bitovými operandy.

**Optimalizace pomocí čínské věty o zbytcích (Chinese Remainder Theorem, CRT)** výpočet rozkládá takto:

::: math
\begin{aligned}
S_p &= m^{d_p} \bmod p, \quad &d_p = d \bmod (p-1) \\
S_q &= m^{d_q} \bmod q, \quad &d_q = d \bmod (q-1)
\end{aligned}
:::

a poté výsledek slepí zpět dohromady pomocí CRT (Gaussovým nebo Garnerovým algoritmem):

::: math
S = \text{CRT}(S_p, S_q) = S_q + q \cdot (q^{-1} \bmod p) \cdot (S_p - S_q) \bmod n
:::

Výhoda:

* $|p| = |q| = 1024$ bitů.
* Modulární umocňování s 1024bitovými operandy je **~4× rychlejší** než s 2048bitovými (násobení má kubickou složitost).
* **Celkové zrychlení: ~3–4×** (paměť a slepování přes CRT přidávají jen asi 5 % režie).

Je to standardní postup v OpenSSL, mbedTLS, Java JCE, na čipových kartách i v hardwarových bezpečnostních modulech (HSM). CRT používají **téměř** všechny moderní implementace RSA.

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
3. Během výpočtu CRT vyvolá chybu (glitch, laser, EM-FI) — *konkrétně* při výpočtu $S_p$ (nikoli $S_q$). Tím získá **chybný** podpis $S'$.
4. Podpis $S'$ má tuto vlastnost:
   * $S' \equiv S_p' \pmod{p}$, kde $S_p'$ je chybná hodnota.
   * $S' \equiv S_q \pmod{q}$, kde $S_q$ je *správné* (chyba ho nezasáhla).
5. Protože $S$ je *správné* modulo obě prvočísla:
   * $S - S' \equiv 0 \pmod{q}$ — oba dávají $S_q$.
   * $S - S' \not\equiv 0 \pmod{p}$ — liší se v $S_p$.
6. Spočítej **největší společný dělitel (GCD)**:

::: math
\gcd(S - S', n) = q
:::

7. **Faktorizace:** $p = n / q$. Z dvojice $(p, q)$ se odvodí $\varphi(n) = (p-1)(q-1)$ a $d = e^{-1} \bmod \varphi(n)$ (rozšířeným Eukleidovým algoritmem).

### Složitost

* Stačí **jediná** dvojice $(S, S')$ s chybou.
* GCD: $O(|n|^2) = O(2048^2)$ bitových operací — *milisekundy* na běžném PC.
* Rozšířený Eukleidův algoritmus pro $d$: dalších $O(|n|^2)$.
* **Obnova RSA-2048 klíče za < 1 sekundu** od získání chybného podpisu.

## Varianty útoku

### Lenstra 1996

[*Memo on RSA signature generation in the presence of faults*](https://link.springer.com/chapter/10.1007/3-540-49649-1_18) — útočník nemá *korektní* $S$, jen $S'$ a hash zprávy $h(m)$:

* Útočník ověří, zda $(S')^e \stackrel{?}{=} h(m) \pmod{n}$ — pokud nastala chyba, rovnost neplatí.
* Spočítá $X = (S')^e - h(m) \bmod n$.
* $\gcd(X, n) = q$ — protože $X$ je dělitelné $q$ (platí $(S')^e \equiv h(m) \pmod q$, ale ne modulo $p$).

**Důsledek:** útočník nepotřebuje znát korektní $S$. Stačí mu znát hash zprávy a chybný podpis.

### Model náhodné chyby

* Útočník neumí zacílit přesně na $S_p$ oproti $S_q$. Vyvolá *náhodnou* chybu.
* S pravděpodobností ~50 % zasáhne $S_p$ (přesně případ Boneh-DeMillo-Lipton).
* S pravděpodobností ~50 % zasáhne $S_q$ — analogicky pak $\gcd(S - S', n) = p$.
* S malou pravděpodobností zasáhne slepování přes CRT — útok je i tak možný (Joye-Yen 1999).

### Model jednobytové chyby

Realistický pro EM-FI a laser: chyba převrátí *jeden byte* (8 bitů) v $S_p$. Útok stále funguje, jen je obtížnější zjistit, o kterou *konkrétní* chybu šlo.

## Obrany

### Standardní — ověření před výstupem

Po výpočtu $S$ ověř:

```c
if (S^e mod n != m) {
    abort();  // fault detected
}
return S;
```

* **Cena:** jedno modulární umocňování navíc, a to s veřejným exponentem $e$. Protože $e$ bývá malé (3, 65537), je *rychlé*.
* **Účinnost:** 100 % proti DFA na RSA-CRT.
* **OpenSSL** tuto kontrolu implementuje od r. 2002 (poté, co byl útok publikován v praktickém scénáři).

### Shamirův trik (1999)

[Shamir](http://www.wisdom.weizmann.ac.il/~naor/PUZZLES/eli/safeRSA.html) navrhl jinou strategii — místo ověření spočítej *podpis dvakrát*:

* První výpočet: $S \bmod p \cdot t$ pro náhodné $t$ a $S \bmod q \cdot t$.
* Druhý výpočet: $(S \bmod p \cdot t) \bmod t$ a $(S \bmod q \cdot t) \bmod t$.
* Pokud oba dávají stejný výsledek modulo $t$, žádná chyba se neodhalila. Pokud se liší, byla chyba detekována.

Cena: ~10 % režie. Dnes je tato metoda méně oblíbená než prosté ověření.

### Aumüller-Bier-Fischer-Hofreiter-Seifert 2002

[*Fault Attacks on RSA with CRT*](https://link.springer.com/chapter/10.1007/3-540-36400-5_20) — robustnější varianta Shamirova triku. Detekuje *náhodné* chyby s vysokou pravděpodobností.

### Infekční protiopatření (infective countermeasures)

Místo *abort* po chybě se výstup *zamoří* (infect) náhodnými daty:

```c
if (S^e mod n != m) {
    S = S XOR random();  // make output unusable
}
return S;
```

* **Výhoda:** mezi korektním a chybovým případem není žádný časový (timing) rozdíl. Útočník nezíská informaci o tom, *zda* byla chyba detekována.
* **Nevýhoda:** je-li implementace chybná, samotné zamoření může informaci prozradit.

### Hardwarová úroveň

* **Dvojkolejná logika (dual rail logic)** ([[obrana-pk]]) — symetrické signály, chyba by musela zasáhnout *oba* zároveň (s laserem málo pravděpodobné).
* **Senzory** (světla, napětí, glitche) — detekce zařízení pro vstřikování chyb (fault injection).
* **Tamper-detect síť (mesh)** — pokud útočník provádí dekapsulaci čipu kvůli laseru, přerušení sítě vede k vynulování (zeroization) klíče.

## Reálné případy {tier=example}

* **Aktivně využíván** v 90. letech proti *placené TV* a *satelitním kartám* — útočníci získali korektní podpis kreditních příkazů, poté vyvolali chybu pomocí EM-FI a faktorizovali tak klíč poskytovatele.
* **Demonstrace v r. 2010** na akademických kartách bez kontroly — *jediná* chyba stačila k obnově klíče u certifikátu certifikační autority (CA) v hodnotě 1 M USD.
* **Čipové karty EAL4** byly v r. 2002 zranitelné; po publikaci útoku Bellcore certifikace EAL5+ výslovně testuje odolnost vůči němu.
* **Java Card 3.0.5** od r. 2017 obsahuje *povinné* ověření (verify check) pro `RSA.signWithCRT()`.
* **OpenSSL** implementuje ověření od r. 2002 (verze 0.9.7).

## Klíčová ponaučení

1. **Optimalizace ≠ bezpečnost.** CRT je *4× rychlejší*, ale otevírá útok, který u RSA bez CRT *neexistuje*. Návrhář si musí být tohoto kompromisu (trade-off) vědom.
2. **Stačí jediná chyba.** Na rozdíl od většiny útoků DPA/TA, kde je potřeba mnoho měření, je DFA na RSA-CRT *jednorázový* útok. Žádné průměrování, žádná statistika.
3. **Ověření po výpočtu (verify after compute)** je univerzální protiopatření. Stejný princip se uplatňuje u AES (znovu zašifrovat a porovnat), u ECDSA (ověřit) atd.
4. **Boneh-DeMillo-Lipton je klasická práce.** Teoretická elegance v kombinaci s praktickým dopadem — referenční čtení pro literaturu o chybových útocích (fault attacks).

---

*Zdroj: BZA přednášky 2025/26, BZA 06 — Chybová analýza. Externí reference: Boneh, D., DeMillo, R. A., Lipton, R. J.: *On the Importance of Checking Cryptographic Protocols for Faults* (EUROCRYPT 1997, journal version J. Cryptol. 2001) — [PDF](https://crypto.stanford.edu/~dabo/papers/faultattack-paper.pdf); Lenstra, A. K.: *Memo on RSA signature generation in the presence of faults*, 1996 — [PDF](https://infoscience.epfl.ch/record/164524); Aumüller, C., Bier, P., Fischer, W., Hofreiter, P., Seifert, J.-P.: *Fault Attacks on RSA with CRT: Concrete Results and Practical Countermeasures* (CHES 2002) — [PDF](https://link.springer.com/chapter/10.1007/3-540-36400-5_20); Joye, M., Yen, S.-M.: *Hardware Fault Attack on RSA with CRT Revisited* (ICISC 2002).*
