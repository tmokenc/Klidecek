---
title: Hybridní kryptografie
---

# Hybridní kryptografie

Asymetrické šifrování je **řádově pomalejší** než symetrické (viz [[principy]]) a má další omezení (RSA-OAEP může šifrovat zprávu *jen do velikosti klíče minus padding*, tj. ~190 bajtů pro RSA-2048). Pro reálná data v *gigabajtech* je proto výhradně asymetrická kryptografie nepoužitelná.

**Hybridní kryptografie** kombinuje obojí: použít asymetrickou kryptografii *pro výměnu klíče*, symetrickou *pro datový tok*. Jediný *kanonický postup* pro praktické šifrování dlouhých zpráv.

## Schéma

::: svg "Hybridní kryptografie: asymetrický key encapsulation + symetrický payload"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aHyb" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20"  y="20" width="240" height="160" rx="8"/>
    <rect x="290" y="20" width="240" height="160" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="140" y="40">Odesílatel (Alice)</text>
    <text x="410" y="40">Příjemce (Bob)</text>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="40" y="64">1) Vygeneruj K_session = random(256 b)</text>
    <text x="40" y="80">2) C_key = E_VK_B(K_session)  ← asymetricky</text>
    <text x="40" y="96">3) C_data = AEAD_K_session(M)  ← symetricky</text>
    <text x="40" y="112">4) Odešli (C_key, C_data)</text>
    <text x="40" y="160">Asymetrika: 1× volání</text>
    <text x="40" y="176">Symetrika: zpracuje GB/s</text>

    <text x="310" y="64">1) Příjem (C_key, C_data)</text>
    <text x="310" y="80">2) K_session = D_SK_B(C_key)</text>
    <text x="310" y="96">3) M = AEAD_K_session⁻¹(C_data)</text>
    <text x="310" y="112">4) Pokud ověření AEAD selže → ⊥</text>
    <text x="310" y="160">Asymetrika: 1× drahá op.</text>
    <text x="310" y="176">Symetrika: GB/s</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aHyb)">
    <path d="M260,80 L290,80"/>
    <path d="M260,100 L290,100"/>
  </g>
</svg>
:::

### Detailní kroky

1. **Vygeneruj náhodný symetrický klíč** $K_{\mathrm{session}}$ délky bezpečnostní úrovně (typicky 256 b pro AES-256).
2. **Zašifruj $K_{\mathrm{session}}$ pomocí veřejného klíče příjemce:** $C_{\mathrm{key}} = E_{VK_B}(K_{\mathrm{session}})$.
3. **Zašifruj data symetricky AEAD šifrou:** $C_{\mathrm{data}} = \mathrm{AEAD}_{K_{\mathrm{session}}, \mathrm{nonce}}(M)$.
4. **Odešli** $(C_{\mathrm{key}}, \mathrm{nonce}, C_{\mathrm{data}}, \mathrm{tag})$ Bobovi.

Bob:

1. **Rozšifruj** $K_{\mathrm{session}} = D_{SK_B}(C_{\mathrm{key}})$.
2. **Ověř a rozšifruj** $M = \mathrm{AEAD}^{-1}_{K_{\mathrm{session}}, \mathrm{nonce}}(C_{\mathrm{data}}, \mathrm{tag})$.

## KEM/DEM paradigma

Moderní formulace hybridní kryptografie (Cramer, Shoup 2003) rozdělí konstrukci na dvě komponenty:

* **KEM (Key Encapsulation Mechanism):** *Encapsulate*$(VK)$ vygeneruje *náhodný klíč* $K$ a *encapsulation* $c$, takže příjemce s $SK$ může $K$ získat z $c$. Cíl: bezpečně předat *nově vygenerovaný* sdílený klíč.
* **DEM (Data Encapsulation Mechanism):** *Encrypt*$(K, M)$ → $\mathrm{AEAD}_K(M)$. Symetrický kontejner.

> KEM se *neoptimalizuje* pro šifrování konkrétní zprávy — generuje *náhodný* klíč. Je proto **flexibilnější** než přímé asymetrické šifrování. PQC (Kyber) je *KEM only* — nemá přímé asymetrické šifrování ve smyslu RSA-OAEP.

### Příklady KEM

* **RSA-OAEP** může fungovat jako KEM: vygeneruj náhodný $K$, vyšli $C = \mathrm{OAEP}(K, VK)$.
* **RSA-KEM** (přímější verze): vygeneruj náhodné $r$, $C = r^e \bmod n$, klíč $K = \mathrm{KDF}(r)$.
* **ECDH-KEM:** Alice vygeneruje efemérní pár $(sk_A, pk_A)$, posílá $pk_A$, klíč $K = \mathrm{KDF}(\mathrm{ECDH}(sk_A, VK_B))$.
* **Kyber-KEM (PQC):** specializovaný KEM, mřížková konstrukce.

### Bezpečnostní výhody KEM/DEM

* **Modulární bezpečnost:** pokud KEM je IND-CCA bezpečný a DEM je IND-CCA bezpečný, pak hybrid je IND-CCA bezpečný. Dovoluje *odděleně* analyzovat obě komponenty.
* **Forward secrecy:** pokud KEM používá efemérní klíče (DH ephemeral), kompromitace dlouhodobých klíčů NE poskytne přístup k *minulým* sessionům. ECDH-KEM s efemérními klíči je *de facto* standard v TLS 1.3.

## TLS 1.3 — kanonický příklad

TLS 1.3 (RFC 8446, 2018) je *čistý hybridní protokol* postavený na KEM/DEM:

1. **Handshake:**
   * Client posílá podporované cipher suites, ECDH efemérní pk_C.
   * Server odpovídá vybraným cipher suite, ECDH efemérní pk_S, **podepsaný certifikát** ($\mathrm{Sig}_{SK_S}(\mathrm{transcript})$).
   * Sdílené tajemství: $\mathrm{ECDH}(sk_C, pk_S) = \mathrm{ECDH}(sk_S, pk_C)$.
   * KDF (HKDF-SHA-256) odvodí session keys.

2. **Record layer:**
   * Veškerý další provoz: AEAD (AES-128-GCM, AES-256-GCM, nebo ChaCha20-Poly1305).
   * Symetrické klíče jsou *odvozeny z ECDH sharing*, ne přímo přenášeny.

TLS 1.3 *zakazuje* RSA key transport (TLS 1.2 ho akceptoval). Vyžaduje *forward secrecy* — vždy efemérní DH.

## PGP / GnuPG / OpenPGP

Hybridní pro e-mail (RFC 4880):

1. Vygeneruj session key $K$ (typicky AES-128 nebo AES-256).
2. Pro každého příjemce zašifruj $K$ jejich veřejným klíčem (RSA nebo ECDH).
3. Šifruj zprávu CFB nebo OCB s $K$.

> Důsledek: e-mail šifrovaný pro 5 příjemců obsahuje 5 RSA-šifrovaných $K$. Každý dešifruje *jen svůj* a získá totéž $K$.

PGP nemá *forward secrecy* (klíče jsou dlouhodobé), což je pro asynchronní e-mailovou komunikaci nepříjemný kompromis. Signal protokol naopak používá *double ratchet* — sdílené klíče se *automaticky obnovují* po každé zprávě.

## Signal protocol — pokročilé KEM

Signal (od 2013) má elaborovanou KEM strukturu:

1. **X3DH** (Extended Triple Diffie-Hellman) — počáteční handshake mezi Alice a Bob s *identitními, dlouhodobými prepublished, jednorázovými* klíči (každý ECDH na X25519).
2. **Double Ratchet** — po každé zprávě obě strany aktualizují stav:
   * **Diffie-Hellman ratchet** — nová DH výměna v každém směru.
   * **Symmetric ratchet** — HKDF posun klíčů pro každou zprávu.

Důsledky:

* **Forward secrecy** — minulé klíče se *nikdy* nepoužijí znovu.
* **Future secrecy / post-compromise security** — pokud útočník získá současný stav, *budoucí* zprávy zůstanou bezpečné po jedné DH výměně.

Signal je dnes pod kapotou WhatsAppu, Facebook Messengera, Skypeu.

## Praktické knihovny {tier=practice}

| Knihovna | API | Algoritmy |
| :--- | :--- | :--- |
| **libsodium** | `crypto_box`, `crypto_secretbox` | X25519 + XSalsa20-Poly1305 |
| **NaCl** | `crypto_box` | totéž, předchůdce libsodium |
| **Tink (Google)** | `HybridEncrypt`, `HybridDecrypt` | ECIES s P-256 nebo X25519 |
| **BoringSSL / OpenSSL** | `EVP_PKEY_encrypt` | RSA-OAEP, ECIES |
| **age (filippo.io)** | `age` CLI tool | X25519 + ChaCha20-Poly1305 |

**Doporučení pro nové aplikace:** `libsodium` `crypto_box` (X25519 + XSalsa20-Poly1305), nebo `age` pro file encryption. Vyhněte se vlastní implementaci RSA-OAEP nebo ECIES — chyby v paddingu, kdfs a nonce reuse jsou časté.

## Anti-patterny {tier=practice}

1. **Pouze asymetrika pro objem dat** — pokus o šifrování gigabajtů RSAOAEPem je *nepraktický* a *nebezpečný* (textbook RSA u dlouhých zpráv je deterministický → unikne strukturu).
2. **Sdílený symetrický klíč mezi více session** — porušuje forward secrecy. Vždy generovat *čerstvý* $K_{\mathrm{session}}$ na každou session.
3. **Předání bez ověření** — *integrity* musí být zajištěná. AEAD na datech řeší. Pro $C_{\mathrm{key}}$ KEM musí být *CCA-bezpečné* (OAEP, ECDH-KEM, Kyber).
4. **Slabý KDF** — odvozování session key z ECDH sharing bez KDF je *nesprávné*. Použít HKDF-SHA-256.
5. **Reuse session key přes víc zpráv** — porušuje IND-CPA pokud se nepostará o *nonce* správně. AEAD vyžaduje *unikátní nonce per message* — ne unikátní klíč.

---

*Zdroj: KRY přednášky 2025/26, KRY 4 — Asymetrické algoritmy. Externí reference: Cramer, R., Shoup, V.: "Design and Analysis of Practical Public-Key Encryption Schemes Secure against Adaptive Chosen Ciphertext Attack", SIAM J. Comput. 33(1), 2003; RFC 8446: TLS 1.3 (2018); Signal Protocol Documentation, https://signal.org/docs/; Marlinspike, M., Perrin, T.: "The Double Ratchet Algorithm", Open Whisper Systems 2016; RFC 4880: OpenPGP Message Format (2007).*
