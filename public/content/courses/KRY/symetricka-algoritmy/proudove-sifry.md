---
title: Proudové šifry (RC4, ChaCha20)
---

# Proudové šifry

[[blok-vs-proud|Proudová šifra]] generuje pseudonáhodný **klíčový proud** $z = z_1 z_2 \dots$, který se XORuje s plaintextem. Konstrukce se historicky soustředila na *lineární zpětnovazebné registry* (LFSR), ale moderní praxe používá *ARX* konstrukce (Add-Rotate-XOR) typu ChaCha20.

## LFSR — lineární zpětnovazebný registr

LFSR (Linear-Feedback Shift Register) je nejjednodušší zdroj pseudonáhodných bitů. Stav: $n$-bitový registr. V každém kroku:

1. Spočítá se zpětnovazební bit jako *XOR* vybraných pozic registru (*tap positions*).
2. Registr se posune o 1 bit; zpětnovazební bit se vsune na uvolněné místo.

::: math
s_{n+i} = c_{n-1} s_{n+i-1} \oplus c_{n-2} s_{n+i-2} \oplus \dots \oplus c_0 s_i,
:::

kde $c_j$ jsou koeficienty z $\{0, 1\}$ (tap mask). Pokud je polynom $p(x) = x^n + c_{n-1} x^{n-1} + \dots + c_0$ *primitivní* (ireducibilní s maximální periodou), LFSR má **maximální periodu** $2^n - 1$ a všechny non-zero stavy navštíví.

### Slabost LFSR — Berlekamp-Massey

LFSR je *lineární* — jeho výstup řeší soustavu lineárních rovnic. **Berlekamp-Massey algoritmus** najde LFSR generující jakoukoli posloupnost délky $L$ za čas $O(L^2)$ a paměť $O(L)$. Útočník po získání $2n$ bitů keystreamu kompletně určí LFSR — *bez šance*.

Důsledek: LFSR samotný **není použitelný** jako proudová šifra. Praktické varianty kombinují LFSR nelineárním způsobem:

* **Filtrovací funkce** — nelineární kombinace vybraných bitů registru jako výstup.
* **Kombinační generátor** — XOR výstupů několika LFSR různých period.
* **Hodinová kontrola** — jeden LFSR řídí, kdy se posune druhý (A5/1, ZUC).

## A5/1 — GSM šifra

A5/1 (1989) šifruje hlasovou komunikaci v GSM. Tři LFSR délky 19, 22, 23. **Majority-clocking:**

* V každém kroku každý registr "uvádí svůj bit" pro hlasování.
* Pokud bit registru odpovídá většině, registr se posune; jinak ne.

Výstup: XOR posledních bitů všech tří registrů.

A5/1 byla **utajená do 1999**, kdy byla reverse-engineered Marcem Briceno. Útoky proti ní existovaly už při zveřejnění — Rainbow Tables (Karsten Nohl 2009) prolomí A5/1 za **sekundy** s 2 TB tabulkou.

> **A5/2** — záměrně oslabená export-varianta pro neevropské země. Padá za milisekundy. Vyřazena 3GPP 2007.

## ZUC

Standard 3GPP (LTE/5G) jako alternativa k AES-CTR. Také LFSR-based s nelineární kombinací. **F-funkce** s S-boxy z AES. Klíč: 128 bitů.

ZUC je samostatný algoritmus, **odlišný od Snow 3G** (oba 3GPP): ZUC stojí za 128-EEA3/128-EIA3, zatímco Snow 3G za 128-EEA1/128-EIA1.

Stále se používá v mobilních sítích jako *konfidencializační* algoritmus EEA3 a *autentizační* EIA3.

## RC4

RC4 (Ron Rivest, RSA Security, 1987) — *trade secret* do 1994, kdy ho někdo anonymně zveřejnil. Triviálně jednoduchá konstrukce:

```
// Setup: KSA (Key-Scheduling Algorithm)
for i = 0..255:
  S[i] = i
j = 0
for i = 0..255:
  j = (j + S[i] + K[i mod len(K)]) mod 256
  swap S[i], S[j]

// Generation: PRGA (Pseudo-Random Generation Algorithm)
i = j = 0
loop:
  i = (i + 1) mod 256
  j = (j + S[i]) mod 256
  swap S[i], S[j]
  output S[(S[i] + S[j]) mod 256]
```

Stav: 256-bajtová permutace $S$ a dva čítače $i, j$. Klíčový proud jeden byte na iteraci.

### Aplikace RC4 {tier=practice}

* **WEP** (1997) — Wi-Fi šifrování. Padlo přes Fluhrer-Mantin-Shamir 2001 — útok získá WEP klíč za 1 minutu odposlechu.
* **WPA-TKIP** — varianta s lepší inicializací, ale stále RC4. Vyřazeno WPA2 (AES-CCM) a WPA3 (AES-GCM).
* **TLS/SSL** — RC4 v TLS až do 2015, kdy bylo zakázáno RFC 7465 po útoku AlFardan-Bernstein-Paterson 2013.
* **MS Office** šifrování souborů — některé verze používaly RC4.

### Slabiny RC4

* **První bity keystreamu jsou biased.** Některé bajty mají $\Pr[z_i = 0] = 2/256$ místo $1/256$. AlFardan et al. (2013) prolomili HTTPS session cookies přes ~$2^{30}$ TLS spojení.
* **FMS útok** na WEP — počáteční bajty RC4 keystreamu uniknou klíč.
* **Slabé klíče** — některé klíče vedou k velmi biased stavu.

> RC4 je dnes *zakázán* pro nové aplikace. Smluvně se používá pouze v legacy systémech (Kerberos s `rc4-hmac` typ, MS Outlook starší verze).

## ChaCha20

Daniel J. Bernstein 2008 — varianta jeho **Salsa20** (2005). Standard RFC 8439 (2018) pro TLS 1.3 a další moderní protokoly. **Žádné LFSR**, **žádné lookup tabulky** — pouze tři operace: **A** (Addition mod $2^{32}$), **R** (Rotation), **X** (XOR). Odtud *ARX*.

### Stav ChaCha20

Stav je matice 4 × 4 s 32-bit slovy:

```
const0  const1  const2  const3
key0    key1    key2    key3
key4    key5    key6    key7
counter nonce0  nonce1  nonce2
```

* **Konstanty** `0x61707865 0x3320646E 0x79622D32 0x6B206574` — *"expand 32-byte k"*.
* **Klíč:** 256 bitů (8 slov).
* **Counter:** 32 bitů, inkrementuje se mezi 64-bajtovými bloky keystreamu.
* **Nonce:** 96 bitů (3 slova). RFC 8439 verze.

### ChaCha20 round function

20 kol = 10 *double rounds*; každý double round je 8 **quarter rounds**:

```
QR(a, b, c, d):
  a += b; d ^= a; d <<<= 16
  c += d; b ^= c; b <<<= 12
  a += b; d ^= a; d <<<= 8
  c += d; b ^= c; b <<<= 7
```

Každý double round provede 4 QR po sloupcích a 4 QR po diagonálách:

```
column rounds:    QR(0,4,8,12)   QR(1,5,9,13)   QR(2,6,10,14)   QR(3,7,11,15)
diagonal rounds:  QR(0,5,10,15)  QR(1,6,11,12)  QR(2,7,8,13)    QR(3,4,9,14)
```

Po 20 kolech: výstupní stav = vstupní stav XOR rotovaný stav. Tento blok 64 bytů je *blok keystreamu*.

### Vlastnosti ChaCha20

* **Constant-time** přirozeně — žádné lookups, větvení podle klíče.
* **Rychlé bez HW akcelerace.** SIMD (SSE2, AVX2, NEON) implementace ~2 GB/s/jádro. Bez SIMD ~0.5 GB/s — *rychlejší než AES bez AES-NI*.
* **Žádný známý praktický útok.** Best known: 7 z 20 kol (Aumasson 2008). 20 kol je extrémně bezpečnostní rezerva.
* **XChaCha20** — varianta s **192-bit nonce** — vhodná pro náhodný nonce bez management.

### ChaCha20-Poly1305 AEAD

V RFC 8439 je definováno schéma:

```c
chacha20_poly1305_encrypt(K, nonce, AD, M) → (C, tag):
  // 1. Odvodit MAC klíč
  mac_key = chacha20(K, nonce, counter=0)[0:32]
  
  // 2. Šifrovat zprávu (counter začíná na 1)
  C = chacha20(K, nonce, counter=1) ⊕ M
  
  // 3. Autentizace
  tag = poly1305(mac_key, AD || pad16(AD) || C || pad16(C) || len(AD) || len(C))
```

Poly1305 je univerzální hash v $\mathrm{GF}(2^{130} - 5)$, *informačně-teoreticky* bezpečný s náhodným klíčem. Spojení s ChaCha20 dává **AEAD** s bezpečnostními důkazy.

### Použití {tier=practice}

* **TLS 1.3** — `chacha20_poly1305_sha256` jako jedna ze tří standardních cipher suites.
* **WireGuard VPN** — výchozí (a *jediné*) AEAD.
* **OpenSSH 6.5+** — `chacha20-poly1305@openssh.com`.
* **Signal protocol** — výchozí.
* **iOS, Android, Chrome, Firefox** — implicitní podpora pro připojení bez AES-NI.

## Snow 3G a 5G

* **Snow 3G** (3GPP, 2006) — proudová šifra pro UMTS/LTE. 128-bit klíč. Kombinace LFSR + FSM s S-boxy z AES.
* **Snow-V** (Ekdahl, Maximov 2018) — nová varianta pro 5G. 256-bit klíč; používá AES-encryption-like FSM.
* **Mickey-128, Grain-128, Trivium** — lehké šifry pro IoT, RFID. Současně část eSTREAM portfolia (2008).

## Lehké proudové šifry pro IoT

* **Trivium** (De Cannière, Preneel 2005) — 3 nelineární zpětnovazebné registry. 80-bit klíč, hardware-efektivní.
* **Grain-128a** — pro RFID. 128-bit klíč.
* **Mickey-128** — také hardware-efektivní.

Tyto šifry mají *kompaktní implementaci* (< 3000 hradel) pro extrémně omezené hardware. Pro běžné aplikace ChaCha20 zůstává *de facto* standard.

---

*Zdroj: KRY přednášky 2025/26, KRY 3 — Symetrické algoritmy. Externí reference: RFC 8439: ChaCha20 and Poly1305 for IETF Protocols (2018); Bernstein, D. J.: "ChaCha, a variant of Salsa20", SASC 2008; AlFardan, N. a kol.: "On the Security of RC4 in TLS", USENIX Security 2013; Fluhrer, S., Mantin, I., Shamir, A.: "Weaknesses in the Key Scheduling Algorithm of RC4", SAC 2001; ETSI TS 135 222: Specification of the 3GPP Confidentiality and Integrity Algorithms 128-EEA3 & 128-EIA3 (ZUC).*
