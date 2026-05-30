---
title: Principy asymetrické kryptografie
---

# Principy asymetrické kryptografie

V symetrické kryptografii ([[blok-vs-proud]]) sdílí dvě strany *jeden tajný klíč*. To je rychlé a matematicky robustní, ale řeší se otázka: **jak se na klíči dohodnou bez bezpečného kanálu**? Pro $n$ uživatelů potřebujeme $\binom{n}{2} = O(n^2)$ klíčů, a jejich fyzická distribuce není škálovatelná.

**Asymetrická kryptografie** (1976, Diffie-Hellman a nezávisle Merkle) zavádí *dvojici klíčů* — *veřejný klíč* ($VK$) lze zveřejnit komukoli, *soukromý klíč* ($SK$) zůstává tajný u majitele. Operace se klíči navzájem odpovídají, ale **z $VK$ nelze efektivně vypočítat $SK$**.

## Hlavní myšlenka

::: math
(VK, SK) \leftarrow \mathrm{KeyGen}(\lambda), \quad C = E_{VK}(M), \quad M = D_{SK}(C).
:::

`KeyGen` je algoritmus, který generuje dvojici klíčů na základě bezpečnostního parametru $\lambda$. Klíče jsou *spárované* — co je zašifrováno $VK$, lze rozšifrovat pouze odpovídajícím $SK$ (a *naopak* — pro [[el-podpis|elektronický podpis]]).

::: svg "Asymetrický model — Alice posílá Bob důvěrně bez sdíleného tajného klíče"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aAsym" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20"  y="50" width="120" height="80" rx="8"/>
    <rect x="400" y="50" width="120" height="80" rx="8"/>
    <rect x="200" y="60" width="140" height="22" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="12">
    <text x="80"  y="78">Alice</text>
    <text x="460" y="78">Bob</text>
    <text x="80"  y="106" fill="var(--text-muted)" font-size="10.5">získá VK_B</text>
    <text x="460" y="98" fill="var(--text-muted)" font-size="10.5">drží (VK_B, SK_B)</text>
    <text x="460" y="116" fill="var(--text-muted)" font-size="10.5">VK_B publikován</text>
    <text x="270" y="75">C = E_{VK_B}(M)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aAsym)">
    <path d="M140,90 L196,71"/>
    <path d="M344,71 L396,90"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="160" y="158">• Žádné sdílené tajemství dopředu</text>
    <text x="160" y="174">• Distribuce jen veřejných klíčů (autentizace přes [[pki-uvod|PKI]])</text>
    <text x="160" y="190">• Bob dešifruje: M = D_{SK_B}(C)</text>
  </g>
</svg>
:::

### Dvě role klíčů

* **Šifrování:** Alice použije *veřejný klíč příjemce* ($VK_B$) k zašifrování. Pouze Bob s odpovídajícím $SK_B$ rozšifruje. Cíl: **důvěrnost**.
* **Podpis:** Alice použije *vlastní soukromý klíč* ($SK_A$) k podpisu. Kdokoli s veřejným klíčem Alice ($VK_A$) ověří. Cíl: **autenticita** + **nepopiratelnost**.

Tato symetrie není u všech algoritmů totožná. [[rsa|RSA]] umí obojí (šifrování i podpis). [[dh-elgamal|Diffie-Hellman]] a ECDH umí pouze *key agreement* (vyjednání sdíleného tajemství) — žádné šifrování ani podpis. [[elipticke|ECDSA]] umí *jen podpis*.

## Asymetrie obtížnosti

Konstrukčním principem je **jednosměrná funkce s pastí (one-way function with trapdoor)**:

* Snadné: $\mathrm{KeyGen}$, $E_{VK}$.
* Snadné s pastí ($SK$): $D_{SK}$.
* Obtížné bez pasti: inverze $E$, ekvivalentně $D$ bez znalosti $SK$.

::: math
\mathrm{KeyGen}, E : \text{polynomiální čas}, \qquad D \text{ bez } SK : \text{podstatně vyšší složitost}.
:::

Klíčové slovo *podstatně vyšší* — žádný kryptografický důkaz neříká, že úloha *nelze* řešit; je založeno na předpokladu, že *zatím* neexistuje efektivní algoritmus. Pro RSA je tento předpoklad **faktorizace celých čísel** ([[problemy]]); pro DH/ECC **diskrétní logaritmus** ([[problemy]]); pro hashe **nalezení preimage**.

## Vlastnosti

| Vlastnost | Symetrická | Asymetrická |
| :--- | :--- | :--- |
| Klíče na komunikační pár | 1 sdílený | 2 (každá strana má vlastní) |
| Klíčů pro $n$ uživatelů | $O(n^2)$ | $O(n)$ |
| Rychlost (relativně) | $\sim$ Gb/s s HW | $\sim$ kb/s — Mb/s |
| Bezpečnostní úroveň na bit klíče | dobrá (1 bit = 1 bit) | špatná (RSA: 3072 bit ≈ 128 b symetrické) |
| Distribuce klíčů | obtížná, sdílené tajemství | snadná (jen autentičnost VK) |
| Nepopiratelnost | ✗ | ✓ |
| Použití primární | šifrování objemů dat | dohoda klíčů, podpis |

## Hybridní kryptografie — proč ji *vždy* používáme

Asymetrická kryptografie je *řádově pomalejší* než symetrická:

* AES-128 s AES-NI: 5–10 GB/s.
* RSA-2048: ~1 MB/s šifrování/ověření (malý exponent $e$), ~10 kB/s dešifrování/podpis (velký exponent $d$) — privátní operace je řádově *náročnější*.
* X25519 (ECDH): ~10 000 operací/s = ~3 MB/s ekvivalent.

Asymetrická kryptografie se proto **nepoužívá pro šifrování objemných dat**. Praxe: [[hybridni|hybridní schéma]] — asymetricky se *zabalí* náhodný symetrický klíč relace $K_{\mathrm{session}}$ (jedno ~konstantní volání), data pak tečou symetricky rychle. Detailní postup odesílatele i příjemce, konkrétní čísla a protokoly (TLS, SSH, S/MIME, PGP, Signal) viz [[hybridni]].

## Generování klíčů — bezpečnostně kritické

KeyGen vyžaduje **kvalitní zdroj náhody** (CSPRNG). Slabý RNG → predikovatelné klíče → totální průlom:

* **Debian OpenSSL 2006–2008** — patch omylem zúžil entropii PRG na 15 bitů → všechny generované SSL klíče za 2 roky byly *brute-forceable*.
* **Embedded keys 2012** — Heninger et al. naskenovali internet, našli mnoho RSA klíčů sdílejících **jeden faktor** (špatný RNG při bootu) → faktorizace přes GCD.
* **Dual_EC_DRBG 2007** — NIST standard PRG s backdoorem NSA. Konstanty $P, Q$ byly NSA podstrčené.

Praktická obrana: použít systémové RNG (`/dev/urandom`, `getentropy()`, `getrandom(flags=0)`). Pro embedded zařízení: hardware random number generator (HRNG) na čipu.

## Předpoklady bezpečnosti

Asymetrická kryptografie *není* bezpodmínečně bezpečná (na rozdíl od [[one-time-pad|OTP]]). Stojí na **výpočetních předpokladech** ([[problemy]]):

* **Factoring problem (FP):** Faktorizovat $n = p q$ kde $p, q$ jsou velká prvočísla. Pro RSA-2048: GNFS (General Number Field Sieve) má sub-exponenciální složitost, neexistuje polynomiální algoritmus.
* **Discrete Logarithm Problem (DLP):** Najít $x$ takové, že $g^x = h$ v cyklické grupě (např. $\mathbb{Z}_p^*$). Pro Diffie-Hellman, ElGamal, DSA.
* **Elliptic Curve DLP (ECDLP):** DLP na grupě bodů eliptické křivky. Pro ECDSA, ECDH.

Tyto úlohy jsou *široce předpokládané* za obtížné, ale **nejsou dokázané** za obtížné. Pokud někdo objeví polynomiální algoritmus, **veškerá současná asymetrická kryptografie padne**.

> **Kvantová hrozba.** Shorův algoritmus (1994) řeší FP, DLP i ECDLP *polynomiálně* na kvantovém počítači. Dostatečně velké kvantové počítače *zatím* neexistují (současné mají ~1000 fyzických qubits; pro RSA-2048 by bylo třeba ~10–20 milionů). NIST přesto vyhlásil **soutěž PQC** (Post-Quantum Cryptography, 2016–2024) na asymetrické algoritmy odolné Shorovi. Vítězové: ML-KEM (Kyber, key encapsulation), ML-DSA (Dilithium, signatures), SLH-DSA (SPHINCS+, signatures). Detaily viz [[postkvantova]].

## Schémata vs. primitiva

Asymetrické primitivum (RSA umocnění) **není** samo o sobě bezpečné schéma. Musí být obaleno standardem:

* **RSA-OAEP** (Optimal Asymmetric Encryption Padding, RFC 8017) — bezpečné šifrování klíče.
* **RSA-PSS** (Probabilistic Signature Scheme) — bezpečný podpis.
* **ECIES** (Elliptic Curve Integrated Encryption Scheme) — kombinuje ECDH a AEAD.
* **EdDSA** (Edwards-curve Digital Signature Algorithm) — bezpečný podpis na Ed25519.

Naivní použití RSA (textbook RSA = jen umocnění) je *zranitelné* — viz [[rsa-utoky]]. Vždy používejte standardní schéma z auditované knihovny.

---

*Zdroj: KRY přednášky 2025/26, KRY 4 — Asymetrické algoritmy. Externí reference: Diffie, W., Hellman, M.: "New Directions in Cryptography", IEEE Trans. Inf. Theory IT-22(6), 1976; Stallings, W.: *Cryptography and Network Security* (8th ed., Pearson 2022), kap. 9; Boneh, D., Shoup, V.: *A Graduate Course in Applied Cryptography* (v0.6, 2023), kap. 10; Heninger, N. a kol.: "Mining Your Ps and Qs: Detection of Widespread Weak Keys in Network Devices", USENIX Security 2012.*
