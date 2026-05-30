---
title: Eliptické křivky (ECC)
---

# Eliptické křivky (ECC)

Eliptická křivka je algebraická křivka definovaná Weierstrassovou rovnicí

::: math
y^2 = x^3 + a x + b
:::

nad konečným tělesem $\mathbb{F}_q$ (typicky $q = p$ velké prvočíslo, nebo $q = 2^m$). Body křivky tvoří **abelovskou grupu** s definovanou operací sčítání bodů; v této grupě je [[problemy|diskrétní logaritmus]] *exponenciálně* obtížnější než v multiplikativní grupě $\mathbb{Z}_p^*$. Důsledek: kratší klíče pro stejnou bezpečnost.

Koblitz (1985) a Miller (1985) nezávisle navrhli ECC jako náhradu DH/RSA. Praktické přijetí trvalo do ~2010, kdy Bitcoin, Signal, TLS 1.3 přechodem na ECC udělaly ECC dominantní.

## Eliptická křivka — geometricky

Nad reálnými čísly: $y^2 = x^3 + ax + b$ je hladká křivka (pokud $4a^3 + 27b^2 \neq 0$).

::: svg "Eliptická křivka y² = x³ − x + 1 nad reálnými čísly"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.5" fill="none">
    <line x1="40"  y1="110" x2="500" y2="110"/>
    <line x1="270" y1="20"  x2="270" y2="200"/>
  </g>
  <g fill="var(--text-muted)" font-size="10">
    <text x="500" y="125">x</text>
    <text x="280" y="20">y</text>
  </g>
  <path d="M 75 110 Q 100 70 150 60 Q 200 50 250 90 Q 270 100 270 110 Q 270 120 250 130 Q 200 170 150 160 Q 100 150 75 110 Z" 
        fill="none" stroke="var(--accent)" stroke-width="1.5"/>
  <path d="M 290 110 Q 330 80 380 60 Q 430 45 470 35" 
        fill="none" stroke="var(--accent)" stroke-width="1.5"/>
  <path d="M 290 110 Q 330 140 380 160 Q 430 175 470 185" 
        fill="none" stroke="var(--accent)" stroke-width="1.5"/>
  <g fill="var(--text-muted)" font-size="11">
    <text x="80"  y="200">uzavřená komponenta</text>
    <text x="350" y="200">otevřená větev</text>
  </g>
</svg>
:::

Nad konečným tělesem $\mathbb{F}_p$ má křivka **konečně mnoho bodů** $|E(\mathbb{F}_p)|$, Hasseova věta odhaduje:

::: math
|E(\mathbb{F}_p)| = p + 1 - t, \quad |t| \leq 2\sqrt{p}.
:::

## Sčítání bodů

Pro dva body $P = (x_1, y_1)$, $Q = (x_2, y_2)$ definujeme $P + Q = R = (x_3, y_3)$:

* **Případ $P \neq Q$:** $\lambda = (y_2 - y_1)/(x_2 - x_1)$, $x_3 = \lambda^2 - x_1 - x_2$, $y_3 = \lambda(x_1 - x_3) - y_1$.
* **Případ $P = Q$ (zdvojnásobení):** $\lambda = (3 x_1^2 + a)/(2 y_1)$, $x_3, y_3$ stejnými vzorci.
* **Případ $P + (-P) = \mathcal{O}$** kde $-P = (x_1, -y_1)$.
* **$\mathcal{O}$** je *bod v nekonečnu*, neutrální prvek grupy.

Operace je geometricky **"protáhni přímku skrz $P, Q$, zrcadli třetí průsečík přes osu $x$"**.

::: svg "Sčítání bodů na eliptické křivce — geometrický pohled"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.5" fill="none">
    <line x1="30"  y1="120" x2="510" y2="120"/>
    <line x1="270" y1="20"  x2="270" y2="220"/>
  </g>
  <path d="M 80 120 Q 130 60 220 80 Q 320 90 270 120 Q 220 150 270 120 Q 350 100 460 50" 
        fill="none" stroke="var(--accent)" stroke-width="1.4"/>
  <path d="M 270 120 Q 220 150 270 120 Q 350 140 460 190" 
        fill="none" stroke="var(--accent)" stroke-width="1.4"/>
  <line x1="150" y1="68" x2="430" y2="200" stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="350" y1="100" x2="350" y2="140" stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="2 2"/>
  <g fill="var(--accent)">
    <circle cx="150" cy="68"  r="3.5"/>
    <circle cx="220" cy="80"  r="3.5"/>
    <circle cx="350" cy="140" r="3.5"/>
    <circle cx="350" cy="100" r="3.5"/>
  </g>
  <g fill="var(--text)" font-size="11.5">
    <text x="135" y="60">P</text>
    <text x="205" y="74">Q</text>
    <text x="361" y="145">−R</text>
    <text x="361" y="96">R = P + Q</text>
  </g>
</svg>
:::

V $\mathbb{F}_p$ není "geometrie" — operace je *čistě algebraická*, ale geometrický intuice zůstává.

::: viz ec-point-add "Posouvejte x-souřadnice bodů P a Q a sledujte geometrickou konstrukci: přímka skrz P, Q → třetí průsečík → zrcadlit přes osu x → R. Zapněte „zdvojnásobit" pro tečnu (R = 2P)."
:::

## Skalární násobení

Pro body $P$ a celé číslo $k$ definujeme $kP = P + P + \dots + P$ ($k$-krát). Algoritmus square-and-multiply:

```
scalar_mult(k, P):
  R = O (point at infinity)
  while k > 0:
    if k is odd:
      R = R + P
    P = P + P
    k = k >> 1
  return R
```

**Klíčová úloha ECDLP:** dáno $P$ a $Q = kP$, najdi $k$. Bezpečnost ECC stojí na obtížnosti ECDLP.

> **Side-channel:** "if k is odd" větvení uniká bity $k$ (Kocher 1996). *Constant-time* implementace používá **Montgomery ladder** — vždy provádí stejný počet operací bez ohledu na bity $k$. Standardní v moderních implementacích.

## Standardní křivky

### NIST křivky (1999, FIPS 186-2)

* **P-192, P-224, P-256, P-384, P-521** — definované nad prvočíselnými tělesy.
* Konstanty $a, b$ vybrané podle "verifiable random" procesu — ale konstanty jsou *NSA-influenced*. Curve P-256 (secp256r1) zůstává standard.

### Curve25519 (Daniel J. Bernstein, 2006)

* **Montgomery křivka:** $y^2 = x^3 + 486662 x^2 + x$ nad $\mathbb{F}_p$ s $p = 2^{255} - 19$.
* Navržená pro:
  * **Constant-time** Montgomery ladder bez podmínek.
  * **Žádné slabé inputs** — všechny vstupy bezpečné.
  * **Žádné NSA-influenced konstanty** — Montgomeryho koeficient $A = 486662$ pochází z explicitní matematické úvahy.
* **X25519** je ECDH na Curve25519. Standard v Signal, TLS 1.3, OpenSSH, WireGuard, age.

### Ed25519 (Bernstein, Lange a kol. 2011)

* **Edwards křivka:** $-x^2 + y^2 = 1 + d x^2 y^2$, ekvivalentní s Curve25519.
* **EdDSA** — deterministická signature scheme. Žádný náhodný nonce → není zranitelný nonce reuse (na rozdíl od ECDSA).
* Rychlejší podpis i ověření než ECDSA.

### secp256k1 (SEC 2000)

* Křivka pro Bitcoin a Ethereum. $y^2 = x^3 + 7$ nad $\mathbb{F}_p$ s $p = 2^{256} - 2^{32} - 977$.
* Efektivní struktura (žádné $a$ koeficient, "Koblitzova křivka").
* Není používaná v TLS / vládních aplikacích, ale **dominuje v kryptoměnách**.

## ECDH — Diffie-Hellman na EC

Setup: standardní křivka $E$ s generátorem $G$ řádu $n$.

::: math
\begin{array}{rcl}
\text{Alice: } a \leftarrow \mathbb{Z}_n, & A = aG, & \xrightarrow{A} \\
\text{Bob: } b \leftarrow \mathbb{Z}_n, & B = bG, & \xleftarrow{B} \\
\text{Alice: } K = aB = a(bG) = abG, & & \\
\text{Bob: } K = bA = b(aG) = abG. & &
\end{array}
:::

Stejná struktura jako [[dh-elgamal|DH-Z_p*]], jen $g^a$ nahrazeno $aG$. Sdílené tajemství je *bod na křivce*; obvykle se vezme jen $x$-souřadnice a aplikuje [[kdf|KDF]] pro odvození symetrického klíče.

**X25519** je specifická forma ECDH na Curve25519:

```c
uint8_t shared_secret[32];
uint8_t private_key[32];
uint8_t public_key[32];

X25519(shared_secret, private_key, public_key);
```

Vstupy a výstupy jsou 32-bajtové řetězce. Implementace ~30 řádek C, jednoduše auditovatelná.

## ECDSA — podpis

Setup: stejný jako ECDH; navíc *zpráva* $M$ a hashovací funkce $H$.

**Podpis:**

1. Alice spočítá $e = H(M)$.
2. Vybere náhodné $k \leftarrow \mathbb{Z}_n^*$.
3. Spočítá $R = kG$, $r = R_x \bmod n$ (x-souřadnice). Pokud $r = 0$, opakuj.
4. Spočítá $s = k^{-1}(e + r \cdot d_A) \bmod n$, kde $d_A$ je Aliciin soukromý klíč. Pokud $s = 0$, opakuj.
5. Podpis: $(r, s)$.

**Ověření:**

1. Bob spočítá $e = H(M)$, $w = s^{-1} \bmod n$.
2. $u_1 = e w \bmod n$, $u_2 = r w \bmod n$.
3. $R' = u_1 G + u_2 Q_A$ (kde $Q_A = d_A G$ je veřejný klíč Alice).
4. Pokud $R'_x \equiv r \pmod n$, podpis platí.

### Sony PS3 — slavný útok přes nonce reuse

Sony v PS3 firmware používala **stejný $k$** pro každý podpis (špatná implementace generátoru náhody). Jak ukazuje analýza:

* Dva podpisy $(r, s_1)$ a $(r, s_2)$ stejné Sony klíče se stejným $k$:
* $s_1 = k^{-1}(e_1 + r d_A), s_2 = k^{-1}(e_2 + r d_A)$.
* $s_1 - s_2 = k^{-1}(e_1 - e_2) \Rightarrow k = (e_1 - e_2)/(s_1 - s_2) \bmod n$.
* Pak $d_A = (s_1 k - e_1)/r$.

Hacking group fail0verflow (2010) extrahovala Sony privátní klíč → jailbreak PS3.

> Obrana: **deterministické ECDSA** (RFC 6979) — $k$ se odvozuje *deterministicky* z $M$ a $d_A$ pomocí HMAC. Žádná randomness, žádný reuse.

> Lepší obrana: **EdDSA / Ed25519** — *inherentně* deterministické, žádné `nonce reuse` riziko.

## ECC vs RSA — výhody

| Vlastnost | RSA-2048 | ECC P-256 / X25519 | Poznámka |
| :--- | :-: | :-: | :--- |
| Velikost veřejného klíče | 256 B | 32–64 B | ECC 4–8× kratší |
| Velikost podpisu | 256 B | 64 B | ECC 4× kratší |
| KeyGen rychlost | ~50 ms | ~50 μs | ECC 1000× rychlejší |
| Šifrování / ověření | rychlé | rychlé | komparable |
| Dešifrování / podpis | pomalé | rychlé | ECC 5–10× rychlejší |
| HW podpora | široká (HSM, TPM) | rostoucí | RSA legacy |
| Bezpečnost vůči kvantu | padá Shorem | padá Shorem | obě potřebují PQC migraci |

## Bezpečnostní úskalí ECC

1. **Invalid curve attacks** — útočník podstrčí bod *neexistující na deklarované křivce* (např. na *isogenii*). Pokud implementace neověří, $kP$ proběhne v slabší grupě → odhalí $k \bmod $ malý faktor.
2. **Twist attacks** — pokud implementace neověří, že vstupní bod je *na hlavní křivce* a ne na její kvadratické twist.
3. **Side-channel** — non-constant-time skalární násobení uniká $k$. Montgomery ladder řeší.
4. **Špatný RNG pro $k$** — Sony PS3 jako kanonický příklad.
5. **Slabé křivky** — vyhnout se anomálním (Smart attack), supersingulárním (MOV attack), embedded-degree-low.

> **Best practice:** Použít *standardní knihovnu* (`libsodium` X25519/Ed25519, BoringSSL P-256). Vyhněte se vlastní ECC implementaci.

---

*Zdroj: KRY přednášky 2025/26, KRY 4 — Asymetrické algoritmy. Externí reference: Koblitz, N.: "Elliptic curve cryptosystems", Mathematics of Computation 48(177), 1987; Miller, V. S.: "Use of elliptic curves in cryptography", CRYPTO 1985; Bernstein, D. J.: "Curve25519: new Diffie-Hellman speed records", PKC 2006; Bernstein, D. J., Duif, N., Lange, T. a kol.: "High-speed high-security signatures", CHES 2011; RFC 7748: Elliptic Curves for Security (2016); RFC 8032: EdDSA Signature Algorithm (2017); SafeCurves: https://safecurves.cr.yp.to/.*
