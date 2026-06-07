---
title: Symetrická kryptografie v IS
---

# Symetrická kryptografie v IS — přehled

Symetrická kryptografie (jeden sdílený klíč) je tažný kůň pro hromadné šifrování (bulk encryption) velkých objemů dat. Standardní volbou je AES. Tato sekce shrnuje, *jak* informační systémy (IS) symetrickou kryptografii používají. Algoritmické detaily najdete v KRY.

## Princip — viz KRY

Podrobnosti: [[blok-vs-proud]] (blokové vs. proudové šifry), [[feistel-spn]] (struktury), [[delka-klice]] (délka klíče, key length), [[rezimy]] (CBC/CTR/GCM), [[padding-aead]] (AEAD).

Stručně: Alice a Bob sdílí klíč `K`. Šifrování (encryption): `C = E_K(M)`. Dešifrování: `M = D_K(C)`.

## Použití v IS {tier=practice}

### Šifrování úložiště

Šifruje data uložená na disku.

| Případ použití | Algoritmus | Režim |
| :--- | :--- | :--- |
| Celý disk (BitLocker, LUKS) | AES-128/256 | XTS |
| Na úrovni souborů | AES-256 | GCM |
| Pole v databázi | AES-256 | GCM, deterministický |
| Cloudové úložiště | AES-256 | GCM-SIV |

**XTS** (XEX-based Tweaked codebook with ciphertext Stealing) je specifický pro diskové sektory — je deterministický, nemá inicializační vektor (IV) pro každý blok, ale tzv. *tweak* odvozuje z čísla sektoru.

**Správa klíčů** — klíč není uložen v samotném cloudovém úložišti, ale v HSM/TPM/Secure Enclave.

### Šifrování přenosu

TLS, SSH, IPsec — šifrují hromadná data poté, co proběhne ustanovení spojení (handshake). Podrobnosti v [[tls-aplikace]], [[vpn-ipsec]].

Relační klíče (session keys) se odvozují z výměny Diffie-Hellman → pro samotná data se pak používá AES-GCM nebo ChaCha20-Poly1305.

| Protokol | Šifra pro hromadná data (moderní) |
| :--- | :--- |
| TLS 1.3 | AES-128-GCM, AES-256-GCM, ChaCha20-Poly1305 |
| SSH | AES-256-GCM, ChaCha20-Poly1305 |
| IPsec | AES-256-GCM (RFC 4106) |
| WireGuard | ChaCha20-Poly1305 |

### Autentizační tokeny

JWT (JSON Web Tokens) často používá symetrický HMAC pro zajištění integrity. Pro scénáře s více stranami je nicméně vhodnější asymetrický přístup ([[el-podpis]]).

Pokud je token sdílen mezi servery ve stejné doméně důvěry (trust domain), použije se symetrický HMAC-SHA256. Pokud jde napříč doménami, použije se JWS (asymetrický podpis).

### Šifrování databází

- **Na úrovni aplikace** — citlivá pole (osobní údaje, čísla platebních karet) se šifrují ještě před uložením.
- **Transparentní šifrování dat (Transparent Data Encryption, TDE)** — databáze šifruje a dešifruje sama; pro aplikaci je to transparentní.
- **Šifrování zachovávající formát (Format-Preserving Encryption, FPE)** — zašifrovaný výstup má *stejný formát* jako vstup (z čísla karty se stane opět 16 číslic). Hodí se pro starší databázová schémata. Standardem je AES-FF1.

### Šifrování záloh

Šifrované zálohovací pásky a disky. Po odpojení od sítě je riziko fyzické krádeže omezeno.

### Tokenizace

Nahrazuje citlivou hodnotu (např. číslo karty) náhradním *tokenem*. Mapování mezi tokenem a původní hodnotou je uloženo v zabezpečené databázi. Token může, ale nemusí být šifrovaný — chrání jej právě zabezpečená databáze.

Kvůli souladu s PCI DSS se tokenizace často používá k tomu, aby se skutečná čísla karet vůbec nemusela ukládat.

## Algoritmy v IS dnes

### Doporučené

- **AES** ([[3des-aes]]) — univerzální, hardwarově akcelerovaný (AES-NI, ARM Crypto Extensions).
- **ChaCha20** ([[proudove-sifry]]) — vhodný pro softwarovou implementaci, nepotřebuje AES-NI. Používá ho WireGuard a mobilní zařízení.
- **AES-GCM, ChaCha20-Poly1305** — AEAD (autentizované šifrování, authenticated encryption).

### Zastaralé (nepoužívat)

- **DES** — 56bitový klíč prolomen v 90. letech. [[des]].
- **3DES** — nominálně 168 bitů, ale ve skutečnosti jen ~112bitová bezpečnost; podle NIST je od roku 2023 na konci životnosti.
- **RC4** — výstup s odchylkami od náhodnosti ([[proudove-sifry]]), v TLS 1.3 zakázán.
- **AES-CBC + HMAC** — není AEAD, hrozí útoky typu padding oracle. Místo toho použijte AES-GCM.
- **AES-ECB** ([[rezimy]]) — prozrazuje vzory v datech. Klasickou ukázkou je dosud rozeznatelný obrázek tučňáka Tuxe.

## Správa symetrických klíčů

Symetrické šifrování má *zásadní problém*: obě strany *musí* mít *stejný* klíč. Jak ho ale bezpečně distribuovat?

- **Předsdílené klíče (Pre-shared keys, PSK)** — nastavují se mimo komunikační kanál (out-of-band), ručně. Používá se ve WPA2-Personal nebo u VPN s PSK.
- **Odvození klíče (key derivation)** — z hesla ([[kdf]]) pomocí Argon2, PBKDF2 nebo scrypt.
- **Distribuční centrum klíčů (Key Distribution Center)** ([[kdc-needham]]) — relační klíče generuje třetí strana (KDC).
- **Kerberos** ([[kerberos]]) — distribuovaná autentizace založená na KDC. Používá se v Microsoft AD.
- **Hybridní přístup** — asymetrickou výměnou (DH/RSA) se domluví *symetrický* klíč → ten se pak použije pro hromadné symetrické šifrování.

Hybridní přístup je *standardem* (TLS, SSH, IPsec). Podrobnosti v [[hybridni]].

## Délka klíče — postačující

Pro současné hrozby (threat) platí:

- **AES-128** — minimum pro nová nasazení. $2^{128}$ klíčů → útok hrubou silou je výpočetně neproveditelný ($>10^{13}$ let, i kdyby se na lámání vrhly všechny počítače světa).
- **AES-192** — větší rezerva.
- **AES-256** — pro kryptografickou pružnost (crypto-agility) — odolnost vůči kvantovým počítačům i čistá opatrnost. NIST SP 800-131 doporučuje přejít na 256 bitů do roku 2030.

Před nástupem kvantových počítačů je AES-128 bezpečný. Po jejich nástupu Groverův algoritmus efektivní bezpečnost půlí → z AES-128 zbude ~64 bitů (prolomeno), z AES-256 zbude 128 bitů (stále bezpečné).

⇒ Pro dlouhodobou důvěrnost přejděte na **AES-256**.

Podrobnosti v [[delka-klice]], [[postkvantova]].

## Režimy — vyberte ten správný

| Režim | Použití | Poznámky |
| :--- | :--- | :--- |
| ECB | NIKDY (jen jako učebnicový příklad) | prozrazuje vzory |
| CBC | starší systémy, v kombinaci s HMAC | není AEAD, opatrně s paddingem |
| CTR | streamování | vyžaduje jedinečný IV |
| GCM | **moderní výchozí volba** | autentizované šifrování |
| GCM-SIV | odolný vůči chybnému opakování nonce | RFC 8452, používá POLYVAL (ne GHASH); AES je stále akcelerován přes AES-NI, MAC přes PCLMULQDQ |
| XTS | šifrování disku | tweak z čísla sektoru |

Výchozí volba: **AES-256-GCM** pro většinu případů použití. **ChaCha20-Poly1305** pro softwarová a mobilní řešení.

Podrobnosti [[rezimy]], [[padding-aead]].

---

### Videa

::: youtube "https://www.youtube.com/watch?v=O4xNJsjtN6E" "AES Explained (Advanced Encryption Standard) - Computerphile" "Computerphile"
:::

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: NIST FIPS 197 — AES Standard ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf)); NIST SP 800-38D — Recommendation for GCM; RFC 8439 — ChaCha20 and Poly1305; Schneier, B.: „Applied Cryptography" (2nd ed., Wiley 1996), §12.*
