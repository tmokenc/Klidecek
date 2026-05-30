---
title: Matematické základy
---

# Matematické základy asymetrické kryptografie

Asymetrická kryptografie stojí na nástrojích **teorie čísel** a **algebraických struktur**. Tahle stránka shrnuje minimum, které je třeba pro porozumění [[rsa|RSA]], [[dh-elgamal|DH/ElGamal]] a [[elipticke|ECC]]. Důkazy hlavních vět zde uvádím náčrtem; podrobnější výklad je v jakékoli učebnici teorie čísel.

## Modulární aritmetika

V $\mathbb{Z}_n = \{0, 1, \dots, n-1\}$ pracujeme s operacemi modulo $n$. Sčítání, odčítání, násobení:

::: math
(a + b) \bmod n, \quad (a - b) \bmod n, \quad (a \cdot b) \bmod n.
:::

**Kongruence** $a \equiv b \pmod n$ znamená $n \mid (a - b)$, tj. $a$ a $b$ dávají stejný zbytek po dělení $n$.

Pravidla manipulace s kongruencemi:

* $a \equiv a' \pmod n, b \equiv b' \pmod n \Rightarrow a + b \equiv a' + b' \pmod n$.
* $a \equiv b \pmod n \Rightarrow a^k \equiv b^k \pmod n$ pro každé $k \in \mathbb{N}$.
* **Dělení** v $\mathbb{Z}_n$ je *podmíněné* — vyžaduje inverzi.

## Největší společný dělitel a Eukleidův algoritmus

$\gcd(a, b)$ je největší $d$, které dělí oba $a$ i $b$. Eukleidův algoritmus:

```
gcd(a, b):
  while b ≠ 0:
    (a, b) = (b, a mod b)
  return a
```

Časová složitost $O(\log \min(a, b))$. Pro 2048-bit čísla ~64 iterací.

### Rozšířený Eukleidův algoritmus

Najde $u, v$ taková, že $a u + b v = \gcd(a, b)$. Pro $\gcd(a, n) = 1$ dostáváme **multiplikativní inverzi modulo n**:

::: math
a \cdot u + n \cdot v = 1 \implies a \cdot u \equiv 1 \pmod n \implies a^{-1} \equiv u \pmod n.
:::

Příklad: $\gcd(7, 26)$. Eukleides: $26 = 3 \cdot 7 + 5$; $7 = 1 \cdot 5 + 2$; $5 = 2 \cdot 2 + 1$; $2 = 2 \cdot 1 + 0$. Inverze: $1 = 5 - 2 \cdot 2 = 5 - 2(7 - 5) = 3 \cdot 5 - 2 \cdot 7 = 3(26 - 3 \cdot 7) - 2 \cdot 7 = 3 \cdot 26 - 11 \cdot 7$. Tedy $7^{-1} \equiv -11 \equiv 15 \pmod{26}$.

## Prvočísla a Eulerova funkce

**Prvočíslo** $p$: dělitelné jen 1 a $p$. Klíčový pro RSA, DH.

**Eulerova totient funkce** $\varphi(n)$: počet celých čísel z $\{1, 2, \dots, n\}$, která jsou *nesoudělná* s $n$, tj. $\gcd(k, n) = 1$.

* $\varphi(p) = p - 1$ pro prvočíslo $p$.
* $\varphi(p^k) = p^k - p^{k-1} = p^{k-1}(p - 1)$.
* **Multiplikativita:** $\varphi(ab) = \varphi(a) \varphi(b)$, pokud $\gcd(a, b) = 1$.
* $\varphi(n) = n \prod_{p \mid n} (1 - 1/p)$ pro $n$ s prvočíselným rozkladem.

**Příklad:** $\varphi(15) = \varphi(3) \cdot \varphi(5) = 2 \cdot 4 = 8$. Čísla nesoudělná s 15 jsou $\{1, 2, 4, 7, 8, 11, 13, 14\}$ — opravdu 8.

## Eulerova věta a Fermatova malá věta

### Eulerova věta

Pro $\gcd(a, n) = 1$ platí

::: math
a^{\varphi(n)} \equiv 1 \pmod n.
:::

### Fermatova malá věta (speciální případ)

Pro prvočíslo $p$ a $\gcd(a, p) = 1$ (tj. $a \not\equiv 0 \pmod p$):

::: math
a^{p-1} \equiv 1 \pmod p.
:::

Důsledek: $a^p \equiv a \pmod p$ pro libovolné $a$ (i nesoudělné).

Fermatova věta je **základ Fermatova primality testu**: pokud $a^{n-1} \not\equiv 1 \pmod n$ pro nějaké $a$ s $\gcd(a, n) = 1$, pak $n$ *není* prvočíslo. Bohužel existují *Carmichaelova čísla* (například 561, 1105, 1729, …), která splňují Fermatovu rovnici pro *všechna* $a$ nesoudělná s $n$, ale nejsou prvočísla — tudíž potřebujeme silnější test (Miller-Rabin, viz níže).

## Multiplikativní grupa $\mathbb{Z}_n^*$

$\mathbb{Z}_n^* = \{a \in \mathbb{Z}_n : \gcd(a, n) = 1\}$ — prvky, které mají inverzi. Velikost $|\mathbb{Z}_n^*| = \varphi(n)$. Operace: násobení modulo $n$.

* $\mathbb{Z}_n^*$ je *abelovská grupa* — uzavřená, asociativní, identický prvek 1, inverze, komutativní.
* **Generátor (primitivní kořen):** $g \in \mathbb{Z}_n^*$ takový, že $\{g^0, g^1, \dots, g^{\varphi(n)-1}\} = \mathbb{Z}_n^*$. Cyklicky generuje celou grupu. *Existuje* pouze pro $n \in \{1, 2, 4, p^k, 2p^k\}$ ($p$ liché prvočíslo).
* Pro prvočíslo $p$ je $\mathbb{Z}_p^*$ cyklická grupa řádu $p-1$.

Příklad: $\mathbb{Z}_7^*$ je cyklická řádu 6. Prvek $g = 3$ generuje: $3^0=1, 3^1=3, 3^2=2, 3^3=6, 3^4=4, 3^5=5$ (mod 7). Všech 6 prvků.

## Modulární umocnění

Klíčová operace asymetrické kryptografie. Naivní výpočet $a^x \bmod n$ pro $x = 10^{300}$ je nemožný. Trik: **square-and-multiply**:

```
modexp(a, x, n):
  result = 1
  while x > 0:
    if x is odd:
      result = (result * a) mod n
    a = (a * a) mod n
    x = x >> 1
  return result
```

Počet operací: $O(\log x)$ násobení. Pro 2048-bit $x$: ~3000 modulárních násobení.

::: viz square-and-multiply "Krok-po-kroku square-and-multiply. Sledujte bity exponentu (LSB první) a redukci počtu operací z O(x) na O(log x). Větvení „if bit=1" je side-channel pro tajný exponent."
:::

**Side-channel:** "if odd" větvení uniká bity $x$. Pro tajný exponent (RSA dešifrování) je *constant-time* implementace nutná. Knihovny OpenSSL, NaCl, libgcrypt to dělají; vlastní implementace často ne.

## Test primality — Miller-Rabin

Pro RSA generujeme náhodná 1024 nebo 1536-bit prvočísla. Faktorizace by trvala miliardy let, ale test primality je *snadný*.

**Miller-Rabin (probabilistic):**

```
miller_rabin(n, k):  # k = počet pokusů
  zapiš n - 1 = 2^r · d, kde d je liché
  for _ in 1..k:
    a = random(2, n - 2)
    x = a^d mod n
    if x == 1 or x == n - 1: continue
    for _ in 1..r-1:
      x = x^2 mod n
      if x == n - 1: break
    else: return "složené"
  return "pravděpodobně prvočíslo"
```

Pravděpodobnost chyby (označení složeného čísla za prvočíslo) je $\leq (1/4)^k$. Pro $k = 40$ je chyba $< 2^{-80}$ — *prakticky nulová*. NIST FIPS 186-5 standard doporučuje 40 iterací.

## Čínská věta o zbytcích (CRT)

Pro $n = pq$ (s $\gcd(p, q) = 1$) je $\mathbb{Z}_n \cong \mathbb{Z}_p \times \mathbb{Z}_q$. Tj. každé $x \in \mathbb{Z}_n$ je jednoznačně určeno dvojicí $(x \bmod p, x \bmod q)$.

Výpočtová síla:

* **CRT-RSA dešifrování** je 4× rychlejší než přímé. Místo $c^d \bmod n$:
  * $m_p = c^{d_p} \bmod p$, kde $d_p = d \bmod (p-1)$
  * $m_q = c^{d_q} \bmod q$, kde $d_q = d \bmod (q-1)$
  * Spoj $m_p, m_q$ pomocí CRT do $m \bmod n$.

CRT-RSA má **side-channel zranitelnost** — *Bellcore útok* (Boneh-DeMillo-Lipton 1997): hardwarová chyba v jednom z výpočtů $m_p$ nebo $m_q$ způsobí, že $\gcd(m^e - c, n)$ vrátí faktor $n$. Obrana: zkontrolovat výsledek (recompute / sanity check).

## Diskrétní logaritmus

Pro cyklickou grupu $G$ s generátorem $g$ řádu $q$ je problém **diskrétního logaritmu**:

::: math
\text{Dáno } h = g^x, \text{ najdi } x \in \{0, 1, \dots, q-1\}.
:::

**Triviální algoritmy:**

* Naivní: zkoušej $x = 0, 1, 2, \dots$ — $O(q)$.
* **Baby-step Giant-step** (Shanks): $O(\sqrt{q})$ čas a paměť.
* **Pollardův rho** (1978): $O(\sqrt{q})$ čas, $O(1)$ paměť.

**Sub-exponenciální algoritmy** pro $\mathbb{Z}_p^*$:

* **Index calculus** (klasická varianta): $\exp(O(\sqrt{\log p \cdot \log\log p}))$, tj. složitost $L_p[1/2]$ — historicky horší než dnešní GNFS-DLP s $L_p[1/3]$ níže.
* **GNFS-DLP**: $\exp(O((\log p)^{1/3} (\log \log p)^{2/3}))$ — analogie GNFS.

Pro **eliptické křivky** (ECC, [[elipticke]]) **index calculus nefunguje** — neexistuje vhodná "factor base" pro EC body. Pouze generické $O(\sqrt{q})$ algoritmy → ECC potřebuje *kratší klíče* pro stejnou bezpečnost než DH-Z_p.

| Bezpečnostní úroveň | RSA / DH-$\mathbb{Z}_p^*$ | ECC ($\mathbb{Z}_q$) |
| :-: | :-: | :-: |
| 80 b | 1024 b | 160 b |
| 112 b | 2048 b | 224 b |
| 128 b | 3072 b | 256 b |
| 192 b | 7680 b | 384 b |
| 256 b | 15360 b | 512 b |

ECC dosahuje stejné bezpečnosti při $\approx 10\times$ kratším klíči.

## Algebraické struktury — shrnutí

* **Grupa** $(G, \cdot)$ — uzavřená, asociativní, jednotka, inverze.
* **Cyklická grupa** — generovaná jedním prvkem.
* **Komutativní (abelovská) grupa** — operace je komutativní.
* **Těleso** $\mathbb{F}$ — komutativní okruh, kde všechny non-zero prvky mají multiplikativní inverzi. Příklady: $\mathbb{Z}_p$ pro prvočíslo $p$; $\mathrm{GF}(2^n)$ — Galoisova tělesa charakteristiky 2.
* **Eliptická křivka** — body splňující $y^2 = x^3 + a x + b$ nad tělesem; tvoří abelovskou grupu vůči "skládání bodů". Viz [[elipticke]].

Pochopení těchto struktur je nezbytné pro studium konkrétních asymetrických algoritmů. Praktická matematická kostra je obvykle ukryta ve standardních knihovnách; aplikační programátor s ní přímo nepracuje.

---

*Zdroj: KRY přednášky 2025/26, KRY 4 — Asymetrické algoritmy. Externí reference: Stinson, D.: *Cryptography: Theory and Practice* (4th ed., CRC 2018), kap. 5; Menezes, A., van Oorschot, P., Vanstone, S.: *Handbook of Applied Cryptography* (CRC 1996), kap. 2–4; Hardy, G., Wright, E.: *An Introduction to the Theory of Numbers* (6th ed., Oxford UP 2008); NIST FIPS 186-5: Digital Signature Standard (2023).*
