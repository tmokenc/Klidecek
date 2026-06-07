---
title: Postkvantová kryptografie (PQC)
---

# Postkvantová kryptografie (PQC)

**Shorův algoritmus** (Peter Shor 1994) řeší faktorizaci celých čísel a diskrétní logaritmus *polynomiálně* na kvantovém počítači. Když takový stroj dorazí, **prakticky veškerá současná asymetrická kryptografie padne** — RSA, DH, ECC, ECDSA.

**Symetrickou kryptografii** Shor *neohrožuje*. Groverův algoritmus ji urychlí *kvadraticky* — AES-128 padne v $2^{64}$ kvantových operacích. Obrana: zdvojit délku klíče (AES-256 dává 128-bit kvantovou bezpečnost).

Postkvantová kryptografie (PQC) je výzkum a standardizace asymetrických algoritmů odolných Shorovi i Groverovi.

## Kvantový timeline

Současný stav kvantové výpočetní techniky:

| Rok | Mezník |
| :-: | :--- |
| 1994 | Shorův algoritmus — *teoretický* průlom |
| 2001 | IBM faktorizuje 15 = 3 × 5 na 7-qubit kvantovém stroji |
| 2012 | D-Wave 512-qubit (annealing, ne Shor-capable) |
| 2019 | Google Sycamore — "quantum supremacy" (53 qubits, ne Shor) |
| 2022 | IBM Osprey — 433 qubits |
| 2023 | IBM Condor — 1121 qubits |
| 2029+ | IBM Goldeneye — 100 000+ qubits (plán) |
| 2030–2040+ | Reálný odhad pro Shor-capable kvantový počítač |

Pro RSA-2048 by bylo třeba ~5000 *logických* qubits (s kvantovou error correction). Současné stroje mají ~$1000$ fyzických qubits → ~10 logických. Faktor 500× růst v dekádě.

> **"Harvest now, decrypt later":** státní aktéři (NSA, Čína) **už dnes** sbírají TLS/IPsec provoz pro budoucí dešifrování. Pro citlivá dlouhodobá data (zdravotní záznamy, státní dokumenty, R&D) je třeba *nasadit PQC nyní*, ne čekat na kvantový stroj.

## NIST PQC standardizace

NIST vyhlásil veřejnou soutěž v 2016. **Tři kola**:

* **Round 1 (2017):** 69 kandidátů.
* **Round 2 (2019):** 26 finalistů.
* **Round 3 (2020):** 7 finalistů + 8 alternates.
* **Round 4 (2022):** vítězové oznámeni.
* **Final standards (2024):** FIPS 203, 204, 205 publikované.

### Vybrané standardy

| Standard | Identita | Účel | Bezpečnost | Velikost |
| :--- | :--- | :--- | :-: | :-: |
| **FIPS 203 (ML-KEM)** | Kyber | KEM | mřížky | PK 1184 B, CT 1088 B (ML-KEM-768) |
| **FIPS 204 (ML-DSA)** | Dilithium | Podpis | mřížky | PK 1.3 kB, sig 2.4 kB |
| **FIPS 205 (SLH-DSA)** | SPHINCS+ | Podpis (hash-based) | hashe | sig 7–50 kB |
| Future | Falcon | Podpis | mřížky (NTRU) | sig 700 B |
| Future | HQC, BIKE | KEM | code-based | velký |

## Mřížková kryptografie — základ

**Mřížka** $\Lambda \subset \mathbb{R}^n$ je množina celočíselných lineárních kombinací $b_1, \dots, b_n$ — *bázi* mřížky. **Problém krátkého vektoru (SVP)**: najít nejkratší nenulový vektor v $\Lambda$. **Closest Vector Problem (CVP)**: dáno bod $t \in \mathbb{R}^n$, najít nejbližší bod $\Lambda$ k $t$.

V dimenzi $\sim 700$+ jsou SVP, CVP **NP-těžké** a *věřeně* odolné i kvantově. Nejlepší známé algoritmy (BKZ, sieving) mají sub-exponenciální složitost.

### LWE — Learning With Errors

Regev (2005). Vstup: matice $A \in \mathbb{Z}_q^{m \times n}$ a vektor $b \in \mathbb{Z}_q^m$ s

::: math
b = A s + e \pmod q,
:::

kde $s \in \mathbb{Z}_q^n$ je *tajný* a $e$ je *malá* chybová pertubace (Gaussovsky rozdělená). Úloha: najít $s$ ze $(A, b)$.

LWE je *redukovatelná* na SVP v mřížce — proto je obtížná. **Module-LWE / Ring-LWE** jsou efektivnější varianty s mřížkou v polynomiálním okruhu $\mathbb{Z}_q[x]/(x^n + 1)$.

### Kyber (ML-KEM, FIPS 203)

Kyber je KEM postavený na Module-LWE:

* **KeyGen:** vygeneruj $(A, s, e)$, $b = As + e$. Veřejný klíč $(A, b)$, soukromý $s$.
* **Encapsulate:** vygeneruj $r, e_1, e_2$, spočti $u = A^T r + e_1$, $v = b^T r + e_2 + \mathrm{Encode}(m)$. Šifrované $(u, v)$, shared secret $m$.
* **Decapsulate:** $m = \mathrm{Decode}(v - s^T u)$. Použij KDF na $m$ pro klíč relace.

Parametry **Kyber-768** (NIST level 3, ekvivalent AES-192):

* $n = 256$, $q = 3329$, modul $k = 3$, dimenze 768.
* Public key 1184 B, ciphertext 1088 B, shared secret 32 B.
* Encapsulation ~70 μs, decapsulation ~75 μs (Intel x86, optimized).

Kyber je **podstatně rychlejší** než RSA-2048: KeyGen v desítkách mikrosekund vs. desetiny sekund pro RSA.

### Dilithium (ML-DSA, FIPS 204)

Dilithium je podpisové schéma postavené na Module-LWE + Module-SIS:

* **KeyGen:** $(A, s_1, s_2)$, $t = A s_1 + s_2$. Veřejný klíč $(A, t)$.
* **Sign(M):** Vygeneruj $y$, spočti $w = A y$. $c = H(M \| w)$. $z = y + c s_1$. Pokud $z$ "malé", výstup $(z, c)$; jinak opakuj (rejection sampling).
* **Verify:** $w' = A z - c t$. Ověř $c = H(M \| w')$.

Parametry **Dilithium-3** (NIST level 3):

* Public key 1952 B, signature 3293 B.
* Sign ~250 μs, verify ~80 μs.

Dilithium je *deterministické* (jako Ed25519); žádný `nonce reuse` problém.

### Falcon (alternative, NTRU-based)

Falcon používá NTRU mřížky a *Gaussovo sampling*. Nevýhoda: *floating-point* aritmetika → nutná opatrnost proti side-channels.

* Public key 897 B, signature 666 B (kompaktnější než Dilithium).
* Pomalejší podpis (~5 ms) kvůli Gaussian sampling.

## Hash-based signatures — SPHINCS+

SLH-DSA / SPHINCS+ (FIPS 205) je *jediný* postkvantový podpis, který *není* postavený na mřížkách. Bezpečnost stojí *pouze* na **kolizní odolnosti hashovací funkce** ([[hash-funkce|SHA-256, SHA-3]]). Velmi konservativní volba.

* **Stateless** Merkle signature scheme — strom hashe s WOTS+ (Winternitz One-Time Signature) v listech.
* **Vlastnosti:** kvantově bezpečný za předpokladu kolizní odolnosti hashe (jen Grover snižuje na $2^{n/2}$).
* **Nevýhoda:** *velký* podpis (7–50 kB v závislosti na parametrech).
* **Použití:** dlouhodobé software / firmware podpisy, kde podpis se generuje řídce a velikost neručí.

## Code-based — McEliece

**Classic McEliece** (Robert McEliece 1978) je *nejstarší* PQC schéma. Bezpečnost stojí na obtížnosti **dekódování náhodných lineárních kódů**.

* **Veřejný klíč:** generující matice "skryté" Goppa kódu, ~1 MB pro 256-bit bezpečnost.
* **Šifrování:** xor zprávy s code + náhodné chyby.
* **Dešifrování:** dekódování přes tajnou Goppa strukturu.

NIST vybral McEliece jako *alternate finalist*; není zatím v hlavním standardu, ale je *považován za nejbezpečnější* (45 let bez praktického útoku).

**Nevýhoda:** *extrémně velký klíč* (256 kB – 1 MB). Pro nízkou bandwidth aplikace nepoužitelný.

## Hybridní PQC + klasika

V přechodném období se používá *kombinace*:

* **TLS hybrid handshake** — ECDH (X25519) **a** Kyber-768 v paralelu. Shared secret = $\mathrm{KDF}(\mathrm{ECDH} \| \mathrm{Kyber})$. Bezpečné, dokud *aspoň jedno* nepadne.
* Chrome od 2023 nasazuje **X25519Kyber768** hybrid v TLS. Firefox od 2024.
* Cloudflare, Google, Microsoft mají *production deployment* hybrid PQC.

> Hybridní přístup je *konservativní* — žádné riziko v případě, že PQC algoritmus bude prolomen (Crystals-Kyber zatím nepadl, ale je relativně mladý standard).

## Bezpečnostní pokrok PQC

* **2022:** SIKE (Supersingular Isogeny Key Encapsulation), Round 4 finalist, **prolomen za hodinu** na laptopu (Castryck, Decru 2022). Skvělý příklad, proč standardizace vyžaduje dlouhodobou analýzu.
* **2023:** Falcon implementace s problémem v floating-point — side-channels.
* **Kyber** zatím robustní; bezpečnostní marže ~150% klasické úrovně NIST.
* **Dilithium** podobně robustní.

## Migration timeline pro praxi

| Časový horizont | Akce |
| :--- | :--- |
| 2024–2025 | Inventarizace kryptografických závislostí ("crypto agility audit") |
| 2025–2028 | Hybridní deployment v citlivých systémech |
| 2028–2032 | Plný PQC v nových protokolech (TLS 2.0 / TLS 1.4?) |
| 2030–2035 | Phase-out klasické asymetriky pro veřejné PKI |
| 2035+ | Pouze PQC v nových systémech |

> NSA's Commercial National Security Algorithm Suite 2.0 (CNSA 2.0, 2022) stanoví, že **do 2033** musí národní bezpečnostní systémy USA používat **pouze PQC**.

## Praktické dnešní volby (2024) {tier=practice}

* **Pro nový projekt s dlouhodobým horizontem:** hybrid X25519 + Kyber-768 (KEM), Ed25519 + Dilithium-3 (podpis). Knihovny: liboqs, BoringSSL trial branches.
* **Pro běžný projekt:** X25519 + Ed25519. Připravit *crypto agility* — abstrakce algoritmu na úrovni protokolu.
* **Pro dlouhodobé podpisy** (firmware, software): SLH-DSA / SPHINCS+ pro maximální robustnost.

PQC je relativně mladá oblast — sledujte NIST, IETF (CFRG), akademickou literaturu.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=_MoRcYLN-7U" "Post Quantum Cryptography - Computerphile" "Computerphile"
:::

*Zdroj: KRY přednášky 2025/26, KRY 4 — Asymetrické algoritmy. Externí reference: Shor, P.: "Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms on a Quantum Computer", SIAM J. Comput. 26(5), 1997; NIST FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism Standard (2024); NIST FIPS 204: Module-Lattice-Based Digital Signature Standard (2024); NIST FIPS 205: Stateless Hash-Based Digital Signature Standard (2024); Regev, O.: "On lattices, learning with errors, random linear codes, and cryptography", STOC 2005; Castryck, W., Decru, T.: "An Efficient Key Recovery Attack on SIDH", EUROCRYPT 2023.*
