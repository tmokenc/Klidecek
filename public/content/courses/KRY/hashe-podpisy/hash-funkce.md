---
title: Hashovací funkce
---

# Hashovací funkce

**Kryptografická hashovací funkce** je deterministický algoritmus, který bere vstup *libovolné* délky a produkuje výstup *pevné* délky. Není to šifra — *nelze* ji invertovat. Slouží jako fundamentální stavební blok pro:

* [[el-podpis|elektronický podpis]] (hash zprávy se podepisuje, ne celá zpráva)
* [[mac-hmac|MAC / HMAC]]
* [[kdf|odvozování klíčů z hesel]]
* identifikace souborů (Git, IPFS, Bitcoin)
* commitment schémata, důkazy znalosti

## Definice

Hashovací funkce $H: \{0,1\}^* \to \{0,1\}^n$ má kanonické vlastnosti:

1. **Deterministická** — stejný vstup vždy dává stejný výstup.
2. **Rychlá** — výpočet $H(x)$ je $O(|x|)$.
3. **Pevná délka výstupu** — typicky 128, 160, 224, 256, 384, 512 bitů.

## Tři pilíře bezpečnosti

Pro *kryptografickou* hashovací funkci požadujeme tři vlastnosti:

### 1. Pre-image resistance (jednosměrnost)

Pro dané $y$ je výpočetně obtížné najít $x$ s $H(x) = y$.

Útok hrubou silou: $O(2^n)$ pokusů. Pro $n = 256$: $2^{256}$ nedostupné.

### 2. Second pre-image resistance

Pro dané $x$ je obtížné najít *jiné* $x' \neq x$ s $H(x) = H(x')$.

Brute force: $O(2^n)$. Stejné jako pre-image.

### 3. Collision resistance

Je obtížné najít *jakoukoli* dvojici $x \neq x'$ s $H(x) = H(x')$.

Brute force: **paradox narozenin** — $O(2^{n/2})$ pokusů (kvůli randomization, viz dále).

> Důsledek: 128-bit hash má pouze **64-bit kolizní bezpečnost**. Pro skutečnou 128-bit bezpečnost vůči kolizím potřebujeme 256-bit hash. Proto SHA-256, ne SHA-128.

## Paradox narozenin

Pokud máme $r$ náhodných lidí, pravděpodobnost shody narozenin překročí 1/2 už při $r \approx 23$, ne při 183 (= 365/2). Důvod: srovnáváme $\binom{r}{2}$ párů, ne $r$ vs. fixní cíl.

Stejně pro hash: vygenerujeme $r$ vstupů, pravděpodobnost kolize:

::: math
\Pr[\text{kolize}] \approx 1 - e^{-r^2 / (2 \cdot 2^n)}.
:::

Pro $r = 2^{n/2}$ je pravděpodobnost $\approx 0{,}39$. Při $r = 2 \cdot 2^{n/2}$ se zvýší na ~86%. **Birthday attack** najde kolizi v $O(2^{n/2})$ čase a paměti.

::: viz birthday-paradox "Slider pro velikost hashe (počet bitů). Tlačítko „Empirický pokus" generuje náhodné hashe dokud nenajde kolizi — počet zachycený před kolizí je řádově √N."
:::

### Důsledky pro velikost hashe

| Hash | $n$ | Brute force pre-image | Birthday kolize |
| :--- | :-: | :-: | :-: |
| MD5 | 128 b | $2^{128}$ | $2^{64}$ |
| SHA-1 | 160 b | $2^{160}$ | $2^{80}$ |
| SHA-256 | 256 b | $2^{256}$ | $2^{128}$ |
| SHA-512 | 512 b | $2^{512}$ | $2^{256}$ |
| SHA3-256 | 256 b | $2^{256}$ | $2^{128}$ |

## Merkle-Damgård konstrukce

Standardní konstrukce hashovací funkce z **kompresní funkce** $f: \{0,1\}^{n+b} \to \{0,1\}^n$ (Merkle 1979, Damgård 1989).

::: svg "Merkle-Damgård konstrukce — zpráva rozdělena na bloky, IV + iterace kompresí"
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aMD" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="80"  y="40" width="60" height="40" rx="4"/>
    <rect x="180" y="40" width="60" height="40" rx="4"/>
    <rect x="280" y="40" width="60" height="40" rx="4"/>
    <rect x="380" y="40" width="60" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="12">
    <text x="110" y="64">f</text>
    <text x="210" y="64">f</text>
    <text x="310" y="64">f</text>
    <text x="410" y="64">f</text>
  </g>
  <g stroke="var(--accent)" fill="none" marker-end="url(#aMD)">
    <path d="M40,60  L78,60"/>
    <path d="M140,60 L178,60"/>
    <path d="M240,60 L278,60"/>
    <path d="M340,60 L378,60"/>
    <path d="M440,60 L495,60"/>
  </g>
  <g stroke="var(--accent)" fill="none" marker-end="url(#aMD)">
    <path d="M110,20 L110,38"/>
    <path d="M210,20 L210,38"/>
    <path d="M310,20 L310,38"/>
    <path d="M410,20 L410,38"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5" text-anchor="middle">
    <text x="110" y="16">M_1</text>
    <text x="210" y="16">M_2</text>
    <text x="310" y="16">M_3</text>
    <text x="410" y="16">M_4 ‖ len</text>
    <text x="20"  y="56" text-anchor="start">IV</text>
    <text x="500" y="56" text-anchor="start">H(M)</text>
  </g>
</svg>
:::

### Algoritmus

1. Padding: zprávu doplň o `1` bit, pak `0` bity, pak 64-bit délku zprávy (Merkle-Damgård strengthening). Délka po paddingu je násobek $b$.
2. Rozdělení na bloky $M_1, M_2, \dots, M_L$ velikosti $b$.
3. Inicializace: $h_0 = IV$ (pevná konstanta).
4. Iterace: $h_i = f(h_{i-1}, M_i)$.
5. Výstup: $H(M) = h_L$.

### Vlastnosti

* **Merkle-Damgård teorém:** pokud $f$ je kolizně odolná, pak $H$ je kolizně odolná.
* **Length-extension útok:** pokud útočník zná $H(M)$ a $|M|$ (nemusí znát $M$), může spočítat $H(M \| \mathrm{pad} \| M')$ pro libovolné $M'$. **Naivní `H(secret || message)` jako MAC je proto zranitelné** — viz [[hash-utoky]].

::: viz merkle-damgard "Krok 1 ukazuje normální MAC = hash(K∥M). Krok 2 je length-extension útok — útočník bez znalosti K pokračuje iterací od finálního hashe a vyrobí platný MAC pro M∥pad∥M_extension."
:::

## Hashovací funkce MD5, SHA-1, SHA-2

### MD5 (Ron Rivest 1992)

* 128-bit výstup, Merkle-Damgård, blok 512 bitů.
* **Prolomena:** Wang, Yin, Yu 2004 — praktické kolize. Stevens 2009 — chosen-prefix kolize. **Nepoužívat.**
* Stále se vyskytuje pro **non-security checksums** (např. verze souborů na FTP, integrity checks bez ochrany proti útoku).

### SHA-1 (NIST 1995)

* 160-bit výstup, Merkle-Damgård (rozšíření MD5).
* **Prolomena:** Stevens, Bursztein, Karpman 2017 — *SHAttered*, praktická kolize PDF dokumentů. 110 GPU-let.
* **Vyřazeno** z TLS, SSH, PGP. Stále v Git (legacy).

### SHA-2 (NIST 2001)

Rodina: SHA-224, SHA-256, SHA-384, SHA-512, SHA-512/224, SHA-512/256.

* Merkle-Damgård s 32-bit (SHA-256) nebo 64-bit (SHA-512) operacemi.
* 64 nebo 80 kol.
* **Bezpečná, žádný známý praktický útok.** Standard pro TLS, JWT, certifikáty, kryptoměny (Bitcoin používá SHA-256).
* **SHA-256** dominuje moderní praxi.

::: math
H : \{0,1\}^* \to \{0,1\}^{256}, \qquad |H(M)| = 256 \text{ bitů}.
:::

## SHA-3 (Keccak, NIST 2015)

Vítěz NIST SHA-3 soutěže (2007–2012). **Není** Merkle-Damgård — alternativní *sponge construction*.

### Sponge construction

::: svg "Sponge construction: absorbing + squeezing fázi"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="20"  y="40" width="80" height="50" rx="4"/>
    <rect x="120" y="40" width="80" height="50" rx="4"/>
    <rect x="220" y="40" width="80" height="50" rx="4"/>
    <rect x="320" y="40" width="80" height="50" rx="4"/>
    <rect x="420" y="40" width="80" height="50" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="60"  y="68">f</text>
    <text x="160" y="68">f</text>
    <text x="260" y="68">f</text>
    <text x="360" y="68">f</text>
    <text x="460" y="68">f</text>
  </g>
  <g stroke="var(--accent)" fill="none" stroke-width="1.2">
    <path d="M100,65 L120,65"/>
    <path d="M200,65 L220,65"/>
    <path d="M300,65 L320,65"/>
    <path d="M400,65 L420,65"/>
  </g>
  <g fill="var(--text-muted)" font-size="10" text-anchor="middle">
    <text x="60"  y="25">M_1 ⊕ r</text>
    <text x="160" y="25">M_2 ⊕ r</text>
    <text x="260" y="25">M_3 ⊕ r</text>
    <text x="360" y="110">→ H_1</text>
    <text x="460" y="110">→ H_2</text>
    <text x="220" y="120">absorbing</text>
    <text x="420" y="120">squeezing</text>
  </g>
</svg>
:::

* **Stav** je $1600$-bitový (Keccak-1600).
* **Absorbing phase:** XOR zprávových bloků do "rate" části stavu, aplikuj permutaci $f$.
* **Squeezing phase:** Extrahuj výstupní bity z rate části, aplikuj $f$ mezi extrakcemi.

::: viz sponge "Zadejte vstupní zprávu — sledujte fáze absorbing (vstup XORován do rate části, pak permutace) a squeezing (rate čtena jako výstup). Capacity část nikdy přímo neopouští stav — odtud žádný length-extension."
:::

### Vlastnosti SHA-3

* **Žádný length-extension útok** — sponge konstrukce ho přirozeně blokuje.
* **Variabilní výstup** — SHAKE128, SHAKE256 jsou XOFs (extendable-output functions), výstup libovolné délky.
* **Pomalejší v softwaru** než SHA-2 (kvůli 1600-bit operacím).
* **Standard:** FIPS 202.

## BLAKE2, BLAKE3

* **BLAKE2** (Aumasson, Neves, Wilcox-O'Hearn, Winnerlein 2012) — SHA-3 finalista, *rychlejší* než SHA-2 v SW. Použito v `argon2`, WireGuard.
* **BLAKE3** (Aumasson, O'Connor, Schneider 2020) — masivně paralelní (Merkle tree struktura), 8 GB/s na běžném CPU. Použito v IPFS, NEAR Protocol.

## Aplikace hashe {tier=practice}

### Hashe souborů — file integrity

```bash
$ sha256sum important_file.tar
a948904f2f0f479b8f8197694b30184b0d2ed1c1cd2a1ec0fb85d299a192a447  important_file.tar
```

Útočník, který modifikuje soubor, nezvládne najít kolizi (pre-image). Pro SHA-256 by potřeboval $2^{256}$ pokusů.

### Hashe v Git

Každý commit, blob, tree je identifikován SHA-1 hashem obsahu. SHA-1 *kolize* znamenají, že útočník dokáže vyrobit dva commity se stejným ID — to může způsobit zmatek, ale Git přidává meta-info, takže přímý útok je obtížnější. Git migruje na SHA-256 (od 2.29, 2020).

### Merkle stromy

Hashe organizované do binárního stromu. List = $H(\mathrm{block}_i)$. Vnitřní uzel = $H(H(\text{levý}) \| H(\text{pravý}))$. Kořen = jeden hash reprezentující *celý dataset*.

**Aplikace:** Bitcoin (Merkle root v block header), Certificate Transparency (audit logy CA), Git (tree objects), IPFS (content addressing).

### Hash chains / commitment

Pre-commit value: dokud někdo neukáže $x$, jenom $H(x)$ je publikováno. Po odhalení $x$ ověříme $H(x) = $ pre-committed value. Žádné padělání ($x' \neq x$ s $H(x') = H(x)$ je obtížné).

### Proof of Work

Bitcoin/Ethereum: najdi $n$ takové, že $H(\mathrm{block} \| n) < \mathrm{target}$. Cca $2^{n}$ pokusů, kde $n$ je obtížnost. SHA-256 brute force = mining.

## Doporučení

| Účel | Volba |
| :--- | :--- |
| Obecné integrity | SHA-256 |
| Vysoká bezpečnost | SHA-512 nebo SHA3-512 |
| Hash s odolností k length-extension | SHA-3, BLAKE2, BLAKE3 |
| Hashe hesel | Argon2 (NE SHA-256!), bcrypt, scrypt — viz [[kdf]] |
| MAC | HMAC-SHA-256, KMAC, Poly1305 — viz [[mac-hmac]] |
| Bitcoin / kryptoměny | SHA-256 (Bitcoin), Keccak-256 (Ethereum) |
| Git, software signing | SHA-256 (migrace ze SHA-1) |
| **NIKDY:** | MD5 (kryptograficky), SHA-1 (kryptograficky) |

---

### Videa

::: youtube "https://www.youtube.com/watch?v=b4b8ktEV4Bg" "Hashing Algorithms and Security - Computerphile" "Computerphile"
:::

*Zdroj: KRY přednášky 2025/26, KRY 4 — Asymetrické algoritmy. Externí reference: FIPS PUB 180-4: Secure Hash Standard SHS (NIST 2015); FIPS PUB 202: SHA-3 Standard — Keccak (NIST 2015); Stevens, M. a kol.: "The first collision for full SHA-1", CRYPTO 2017; Aumasson, J.-P., Neves, S., Wilcox-O'Hearn, Z., Winnerlein, C.: "BLAKE2: Simpler, Smaller, Fast as MD5", ACNS 2013; Bertoni, G., Daemen, J., Peeters, M., Van Assche, G.: "Keccak Specifications", NIST 2008.*
