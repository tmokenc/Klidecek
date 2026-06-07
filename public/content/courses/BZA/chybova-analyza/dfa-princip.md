---
title: Diferenciální chybová analýza (DFA) — princip
---

# Diferenciální chybová analýza (DFA) — princip

**Differential Fault Analysis** (DFA) je třída útoků, kde útočník **indukuje chybu** ([[glitch-utoky]], [[environmentalni]]) během kryptografického výpočtu a porovnává *správný* a *chybný* výstup. Z rozdílu extrahuje informaci o klíči. Útok formulovali **DeMillo, Boneh, Lipton v r. 1996** pro asymetrickou kryptografii, **Biham a Shamir v r. 1997** rozšířili na DES a symetrické šifry obecně.

> **Historické poučení:** Chyby (byť i dočasné) v hardware mohou narušit bezpečnost systému. Útočník, který *neumí* algoritmus prolomit black-box, ho prolomí pomocí *dvou* spuštění — jednoho korektního, jednoho chybného.

## Základní princip

::: svg "DFA princip: stejný plaintext zpracován dvakrát — jednou bez chyby (C), jednou s indukovanou chybou (C'). Rozdíl C ⊕ C' nese informaci o klíči."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aDFA1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="20" width="100" height="40" rx="6"/>
    <rect x="180" y="20" width="180" height="40" rx="6"/>
    <rect x="420" y="20" width="100" height="40" rx="6"/>
    <rect x="180" y="100" width="180" height="40" rx="6"/>
    <rect x="420" y="100" width="100" height="40" rx="6"/>
    <rect x="200" y="170" width="180" height="40" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70" y="44" font-size="11">P</text>
    <text x="270" y="44" font-size="11">E_K (bez chyby)</text>
    <text x="470" y="44" font-size="11">C</text>
    <text x="270" y="124" font-size="11">E_K (s chybou)</text>
    <text x="470" y="124" font-size="11">C'</text>
    <text x="290" y="194" font-size="11" fill="var(--accent)">C ⊕ C' → klíč</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aDFA1)">
    <path d="M120,40 L178,40"/>
    <path d="M360,40 L418,40"/>
    <path d="M120,40 L180,120"/>
    <path d="M360,120 L418,120"/>
    <path d="M470,60 L470,90 L380,170"/>
    <path d="M470,140 L380,180"/>
  </g>
</svg>
:::

Útočník:

1. Zašifruje plaintext $P$ a získá **korektní** šifrový text $C = E_K(P)$.
2. Zopakuje stejnou operaci, ale během běhu *indukuje* chybu (glitch, laser, EM puls).
3. Získá **chybný** šifrový text $C'$.
4. Spočítá $\Delta = C \oplus C'$. Tento *diferenciál* nese informaci o klíčových bitech, na kterých chyba zasáhla.
5. Z mnoha párů $(C, C')$ statisticky rekonstruuje klíč.

## Útok na asymetrickou kryptografii — Boneh-DeMillo-Lipton 1996

[*On the Importance of Checking Cryptographic Protocols for Faults*](https://crypto.stanford.edu/~dabo/papers/faultattack-paper.pdf):

* **Cíl:** RSA implementace s **CRT** (Chinese Remainder Theorem) optimalizací.
* CRT rozkládá $S = m^d \bmod n$ kde $n = pq$ na dvě menší operace:
  * $S_p = m^{d_p} \bmod p$
  * $S_q = m^{d_q} \bmod q$
  * Combine: $S = \text{CRT}(S_p, S_q)$
* **Útok**: indukuje chybu pouze v $S_p$ (jeden z dvou výpočtů). Výsledek $S' = \text{CRT}(S_p', S_q)$.
* Útočník zná veřejný klíč $(n, e)$, takže umí ověřit $S'^e \stackrel{?}{=} m$.
* **Klíčové pozorování:**

::: math
\gcd(S - S', n) = q
:::

protože $S - S'$ je dělitelné $q$ (oba mají $S_q$ shodný) ale ne $p$ (liší se v $S_p$). GCD odhalí faktorizaci $n$ → soukromý klíč.

* **Účinnost:** *jediný* chybný RSA podpis → kompletní rozklad RSA-2048 v $\mu$sekundách (GCD + EEA).

Detailně viz [[bellcore-rsa]].

## Útok na symetrickou kryptografii — Biham-Shamir 1997

[*Differential Fault Analysis of Secret Key Cryptosystems*](https://link.springer.com/chapter/10.1007/BFb0052259):

* **Cíl:** DES (později rozšíření na AES, Triple-DES, IDEA, atd.).
* Útok cílí na *poslední rundy* algoritmu — fault zasáhne hodnotu intermediate state v penultimate round.
* Korektní výstup $C$ vs. chybný $C'$ se *liší* v některých výstupních bitech.
* Z *struktury rozdílu* odvodit, *kterým* S-boxem chyba prošla a *jaká* je hodnota klíče na vstupu posledního round.

::: viz dfa-aes-round "Klikni byte ve stavu AES kola 9, sleduj propagaci pres SubBytes/ShiftRows/MixColumns/round 10. Z 1 bytu se stane 4 byty rozprostrenne pres 4 sloupce ciphertextu."
:::

### Konkrétně pro AES

* **Single-byte fault model** — fault flipne *jeden* byte v state na začátku 9. roundu (před poslední MixColumns).
* Po MixColumns se chyba *šíří* na 4 byty (jeden sloupec).
* Po SubBytes 10. roundu (poslední) se chyba šíří na 4 byty výstupu.
* Po AddRoundKey 10. roundu se zachovává.
* **Útočník:** pro každou hypotézu o 4 bytech round-key $k_{10}$ spočítá *před-faktem* hodnotu před AddRoundKey; pak rekonstruuje 9. round-state, *před-chybou* i *po-chybě*; ověří, zda chyba je *single-byte* (pouze pro správnou hypotézu).
* **Vyžaduje:** 2 fault pairs → odhalí celý $k_{10}$ → klíč AES.

[Piret-Quisquater 2003](https://link.springer.com/chapter/10.1007/978-3-540-45238-6_7) zpřesnili: *single fault* injection na 8. roundu stačí pro recovery celého AES klíče.

## Útok na DSA / ECDSA

Pro DSA / ECDSA signature:

::: math
s = k^{-1}(h(m) + r \cdot d) \bmod n
:::

kde $k$ je *nonce*, $r = g^k$, $d$ je soukromý klíč.

* **Útok na nonce $k$**: pokud útočník indukuje fault v generování $k$, výsledný $k$ může mít *bias* (např. menší než $n/2$).
* Z více podpisů s biased nonces *lattice attack* recovery $d$.
* Klasický Sony PS3 incident (2010, fail0verflow na 27C3) — opakovaně použitý *konstantní* nonce $k$ ve všech podpisech → ze dvou podpisů triviálně dopočítán $k$ a soukromý klíč $d$.

## Útok na MAC / digitální podpis

* **Bellcore-style** na ECDSA s deterministic nonce (RFC 6979) — fault v deterministic derivation způsobí, že *stejná* zpráva dá dvě různé podpisy se stejným $k$ → recovery klíče.
* **Hash-based signatures** (XMSS, SPHINCS+) — fault v Merkle tree path computation. Mitigace: redundant computation + comparison.

## Klasifikace fault models

* **Stuck-at fault** — bit v paměti/registru zaseknutý na 0 nebo 1.
* **Bit flip** — bit změněn z 0 na 1 nebo opačně.
* **Multi-bit flip** — víc bitů změněno současně.
* **Skipped instruction** — celá instrukce vynechaná.
* **Repeated instruction** — instrukce vykonaná dvakrát.
* **Random fault** — neznámá modifikace, ale lokalizovaná v čase/místě.

Specifická útok obvykle vyžaduje *konkrétní* fault model. Reálná zařízení mají kombinaci.

## Obrany proti DFA

### Detekce — redundancy

* **Spatial redundancy** — dvě nezávislé instance HW (např. dva AES engines) → porovnání výstupů. Pokud se liší → fault detected, no output.
* **Temporal redundancy** — *dvojí* výpočet sekvenčně. Více času, ale jen 1 HW. Standardní pro RSA / ECDSA podpisy v smart cards.
* **Information redundancy** — vsunutí *parity* nebo *MAC* na intermediate state. Při fault MAC failuje.

### Verifikace — sanity check

* **Pre/post checks** — před vrácením $S$ ověř, zda $S^e \bmod n \stackrel{?}{=} h(m)$. To je *signature verification* — pomalé, ale 100 % záruka.
* **AES inverse** — po šifrování *dešifrovat* a porovnat s plaintext. Zdvojnásobí cost, ale eliminuje DFA.

### Infective countermeasures

* **Random masking** — při faultu se chyba *promíchá* s random maskou → neelze rozpoznat single-byte fault.
* **Order randomization** — randomizovat pořadí operací (např. random permutace S-box order) → fault zasáhne *neznámou* operaci, DFA selže.

### Hardware-level

* **Multiple sensors** — teplota + napětí + frekvence + světlo. Při alarmu zeroization.
* **Tamper mesh** — fyzická síť okolo cílových obvodů.
* **Frequency multipliers** — interní PLL, externí útočník nezná internalní frekvenci.

## Praktické limity

* **Kvalita fault injection** — moderní DPA-resistant smart cards mají sensors *aktivní* a *citlivé*. Útočník musí *vyladit* parametry tak, aby nezpustil alarm. Často trvá *desítky hodin* preparation.
* **Synchronizace** — útok musí trefit *konkrétní* okamžik (např. začátek 9. roundu AES). Random clock jitter ztěžuje.
* **Reliability of fault** — single-byte fault model je idealizace; reálné EM/laser faults často flipnou *víc* bitů → DFA složitější.
* **Cost** — laser/EM-FI vybavení $5 000 – $200 000.

V praxi: DFA je *primárně laboratory útok*. Pro běžné aplikace (PC, server) není relevantní; pro hardware tokens, smart cards, IoT je *hlavní hrozba* — proto certifikace EAL5+ ji explicitně testuje.

---

*Zdroj: BZA přednášky 2025/26, BZA 06 — Chybová analýza. Externí reference: Boneh, D., DeMillo, R. A., Lipton, R. J.: *On the Importance of Checking Cryptographic Protocols for Faults* (EUROCRYPT 1997) — [PDF](https://crypto.stanford.edu/~dabo/papers/faultattack-paper.pdf); Biham, E., Shamir, A.: *Differential Fault Analysis of Secret Key Cryptosystems* (CRYPTO 1997); Joye, M., Tunstall, M. (eds.): *Fault Analysis in Cryptography* (Springer 2012), free for VUT students; Piret, G., Quisquater, J.-J.: *A Differential Fault Attack Technique against SPN Structures, with Application to the AES and Khazad* (CHES 2003) — [PDF](https://link.springer.com/chapter/10.1007/978-3-540-45238-6_7).*
