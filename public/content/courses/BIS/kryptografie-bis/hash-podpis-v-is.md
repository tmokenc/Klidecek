---
title: Hash, MAC a podpis v IS
---

# Hash, MAC a digitální podpis v IS — přehled

Hash funkce, MAC (Message Authentication Code) a digitální podpis zajišťují integritu (integrity), autentizaci (authentication) a nepopiratelnost (non-repudiation). Tato sekce shrnuje jejich použití v informačních systémech (IS). Pro algoritmické detaily viz KRY.

## Hash funkce — viz KRY

Detail: [[hash-funkce]] (SHA-2/3), [[hash-utoky]] (kolize, length-extension, narozeninový útok).

Stručně: `h = H(M)` — výstup je deterministický (deterministic), funkce je jednosměrná (one-way), má pevnou délku výstupu (fixed-length output) a je odolná vůči kolizím (collision-resistant). Jednosměrnost znamená, že ze samotného hashe nelze zpětně zjistit vstup.

### Moderní hash funkce

| Funkce | Výstup | Stav |
| :--- | :---: | :--- |
| MD5 | 128 bitů | **prolomená** (kolize 2004) |
| SHA-1 | 160 bitů | **prolomená** (kolize 2017) |
| SHA-256 | 256 bitů | bezpečná, běžně používaná |
| SHA-384, SHA-512 | 384/512 bitů | bezpečné |
| SHA-3 (Keccak) | 224–512 bitů | bezpečná, alternativa |
| BLAKE2, BLAKE3 | proměnný | rychlé, bezpečné |

Používejte SHA-256 nebo lepší. Vyhněte se MD5 a SHA-1, s výjimkou kompatibility se staršími systémy (legacy).

## Použití hashe v IS {tier=practice}

### Ukládání hesel

Hesla **nikdy** neukládejte v otevřené podobě. Vždy je nejprve zahashujte, přidejte sůl (salt) a použijte pomalou odvozovací funkci (slow KDF).

```
stored = bcrypt(password, salt, work_factor=12)
```

KDF (Key Derivation Functions — funkce pro odvození klíče, [[kdf]]):

- **PBKDF2** — iterovaná SHA-256 (starší přístup, postačující).
- **bcrypt** — záměrně pomalá, z roku 1999.
- **scrypt** — náročná na paměť (memory-hard).
- **Argon2** — současné nejlepší řešení, vítěz soutěže Password Hashing Competition 2015.

Pro nové aplikace volte ve výchozím nastavení Argon2id.

### Integrita dat

- **Stahování softwaru** — autor zveřejní hash SHA-256, uživatel si jej ověří.
- **Git** — používá pro commity SHA-1 (přestože v nepřátelském prostředí kolize existují, v praxi je vyvolat kolizi v gitu obtížné).
- **Ověřování záloh** — soubory se zahashují a porovnají před změnou a po ní.
- **Hashovací řetězce (hash chains)** — blockchain, integrita logu, do kterého se jen přidává (append-only).

### Deduplikace

Cloudová úložiště (Dropbox, OneDrive) hashují soubory. Pokud se hash shoduje s již existujícím, soubor se uloží jen **jednou** a zbytek se na něj odkáže.

Riziko pro soukromí: pokud útočník (attacker) zná hash veřejně dostupného souboru, dokáže prokázat, zda jej uživatel nahrál.

### Bloom filtry

Pravděpodobnostní datová struktura pro test příslušnosti k množině. Hash funkce mapují prvky na pozice bitů.

Používá se v: detekci malwaru, DNS, databázích antivirů.

## MAC — Message Authentication Code

Hash doplněný o tajný klíč (secret key). Zajišťuje integritu (integrity) a autentizaci (authentication) — tedy že odesílatel měl klíč.

Detail [[mac-hmac]].

```
mac = MAC_K(M) = HMAC-SHA256(K, M)
```

Příjemce má klíč K → znovu spočítá MAC → porovná. Pokud se shodují: integrita je v pořádku a odesílatel znal klíč K.

### Algoritmy

| MAC | Princip | Použití |
| :--- | :--- | :--- |
| HMAC | hash s klíčem (RFC 2104) | TLS, IPsec, JWT |
| Poly1305 | založeno na polynomech | ChaCha20-Poly1305 |
| CMAC | MAC nad blokovou šifrou | NIST SP 800-38B |
| GMAC | GHASH z režimu GCM | sítě |

HMAC-SHA256 je standardní MAC. Podpora v knihovnách je univerzální.

### Použití

- **Autentizace API** — HMAC z požadavku (request) a sdíleného tajemství → podpis API (AWS SigV4, GitHub webhooky).
- **Integrita JWT** — JWS používá HMAC pro tokeny podepsané tajným klíčem.
- **Podepisování cookies** — Django a Rails podepisují data v cookies.
- **IPsec, TLS** — autentizace paketů a záznamů.

### MAC vs. podpis

| | MAC | Digitální podpis |
| :--- | :--- | :--- |
| Klíče | symetrické | asymetrické (pár klíčů) |
| Ověření | stejným klíčem | veřejným klíčem |
| Nepopiratelnost | NE | ANO |
| Rychlost | rychlý | pomalý |
| Použití | uvnitř důvěryhodné domény | mezi doménami |

Pokud Alice a Bob sdílejí tajemství → stačí MAC. Pokud chcete důkaz pro třetí stranu → použijte podpis.

## Digitální podpis {tier=practice}

Asymetrický — Alice podepisuje soukromým klíčem, Bob ověřuje veřejným klíčem. Detail [[el-podpis]].

```
signature = Sign_SK_Alice(H(M))
verify    = Verify_PK_Alice(M, signature)
```

Zprávu M před podpisem zahashujeme — podepisuje se tak malý otisk (fingerprint) místo celého dokumentu.

### Algoritmy

| Algoritmus | Klíč | Rychlost | Použití |
| :--- | :--- | :---: | :--- |
| RSA-PSS | RSA-2048+ | pomalý | TLS, podepisování kódu |
| ECDSA | ECC P-256+ | střední | TLS, Bitcoin |
| EdDSA | Ed25519 | rychlý | SSH, WireGuard |
| Dilithium | mřížky (lattice) | střední | budoucnost PQC |

EdDSA (Ed25519) je v současnosti nejlepší volbou pro nové aplikace — je rychlý, nemá problém s opakovaným použitím nonce a je deterministický.

### Použití

- **Podepisování kódu (code signing)** — notarizace u Apple, Microsoft Authenticode, podpisy balíčků RPM/DEB v Linuxu.
- **Podepisování dokumentů** — podpisy v PDF, kvalifikované podpisy podle eIDAS.
- **Autentizace serveru v TLS** — server podepisuje handshake.
- **Aktualizace softwaru** — Windows Update i linuxové distribuce podepisují balíčky.
- **Kryptoměny** — transakce v Bitcoinu a Ethereu.
- **Hierarchie certifikátů** — kořenová CA podepisuje mezilehlé certifikáty atd.

### Nepopiratelnost

Klíčová vlastnost: Alice nemůže popřít, že podepsala. Pokud je podpis platný a soukromý klíč byl její, prokazatelně podepsala.

Výhrada: pokud soukromý klíč unikl (krádež, malware), Alice popřít může. Obrana: hardwarové tokeny, HSM, zabezpečené enklávy (secure enclaves).

## Vlastnosti MAC a podpisu

Oba poskytují integritu a autentizaci. Volte podle situace:

| Situace | Volba |
| :--- | :--- |
| Dvě strany sdílejí tajemství (TLS, relace VPN) | MAC |
| Mnoho čtenářů, jeden zapisovatel | podpis |
| Je potřeba nepopiratelnost | podpis |
| Kritický výkon, nízká latence | MAC |
| Veřejně dostupné, nedůvěryhodné prostředí | podpis |

V praxi je kombinujeme: TLS handshake používá podpis (certifikát serveru), data relace zabezpečuje MAC.

## Útoky na hash, MAC a podpis

| Útok | Cíl | Obrana |
| :--- | :--- | :--- |
| Kolize (collision) | hash | použít SHA-256+ |
| Předobraz (pre-image) | hash | použít SHA-256+ |
| Narozeninový (birthday) | hash | náročnost 2^(n/2) — zvolit n = 256 |
| Length-extension | Merkle-Damgård (SHA-256) | použít HMAC, ne syrové H(K \|\| M) |
| Opakované použití nonce | DSA / ECDSA | použít deterministické ECDSA (RFC 6979) nebo EdDSA |
| Bleichenbacher | RSA PKCS#1 v1.5 | použít RSA-OAEP / RSA-PSS |

Detaily [[hash-utoky]], [[el-podpis]].

---

### Videa

::: youtube "https://www.youtube.com/watch?v=b4b8ktEV4Bg" "Hashing Algorithms and Security - Computerphile" "Computerphile"
:::

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: NIST FIPS 180-4 — Secure Hash Standard ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf)); NIST FIPS 202 — SHA-3 Standard; RFC 2104 — HMAC; RFC 6979 — Deterministic ECDSA; RFC 8032 — EdDSA; Bernstein, D.J. et al.: „High-speed high-security signatures" (CHES 2011, [DOI 10.1007/978-3-642-23951-9_9](https://doi.org/10.1007/978-3-642-23951-9_9)).*
