---
title: Klíč relace a hierarchie klíčů
---

# Klíč relace a hierarchie klíčů

Hlavní praktický problém symetrické kryptografie je *distribuce klíčů* — jak se dvě strany dohodnou na sdíleném tajemství. Pro $n$ uživatelů $\binom{n}{2}$ klíčů = $O(n^2)$ neuškálovatelné.

Standardní praxe rozlišuje **dlouhodobé klíče** (Key Encrypting Key, KEK — pro šifrování *jiných* klíčů) a **klíče relace** (session key — pro šifrování *dat*). Hierarchie klíčů řeší distribuci a omezuje dopad kompromitace; *forward secrecy* ovšem hierarchie sama o sobě nezajišťuje — tu poskytuje až efemérní Diffie-Hellman výměna (ne statický KEK).

## Proč klíč relace?

Pokud byste šifrovali *všechny* zprávy stejným klíčem $K$ navždy:

* **Hromadění ciphertextů** — útočník nasbírá enormní množství dat pro analýzu.
* **Kompromitace klíče** = dešifrování *všech* historických zpráv.
* **Žádný způsob, jak rotovat** bez fyzické distribuce nového klíče.

**Klíč relace** $K_{\mathrm{session}}$ řeší:

* **Krátkodobý** — používá se po jednu session (TLS spojení, hovor, e-mail). Pak je zlikvidován.
* **Generován ad-hoc** — buď [[kdc-needham|KDC]] vydá, nebo se odvodí přes [[dh-elgamal|Diffie-Hellman]].
* **Omezený objem dat** — nikdy ne víc než ~$2^{32}$ bloků (paradox narozenin).

::: svg "Hierarchie klíčů: dlouhodobý master key → session key → data"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aKH" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="180" y="20"  width="180" height="40" rx="6"/>
    <rect x="100" y="100" width="120" height="30" rx="6"/>
    <rect x="240" y="100" width="120" height="30" rx="6"/>
    <rect x="380" y="100" width="120" height="30" rx="6"/>
    <rect x="40"  y="170" width="120" height="30" rx="6"/>
    <rect x="180" y="170" width="180" height="30" rx="6"/>
    <rect x="380" y="170" width="120" height="30" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="45">Master key (KEK)</text>
    <text x="160" y="120">Session key 1</text>
    <text x="300" y="120">Session key 2</text>
    <text x="440" y="120">Session key 3</text>
    <text x="100" y="190">Data 1.1</text>
    <text x="270" y="190">Data 2.1, 2.2, ...</text>
    <text x="440" y="190">Data 3.1</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1" fill="none" marker-end="url(#aKH)">
    <path d="M250,62 L165,98"/>
    <path d="M270,62 L300,98"/>
    <path d="M290,62 L435,98"/>
    <path d="M160,132 L100,168"/>
    <path d="M160,132 L270,168"/>
    <path d="M300,132 L290,168"/>
    <path d="M440,132 L440,168"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="20" y="125">↓ KDF</text>
    <text x="20" y="185">↓ AEAD</text>
  </g>
</svg>
:::

## Vlastnosti klíče relace

* **Dočasné tajemství** — vygenerováno na začátku komunikace, zničeno na konci.
* **Vznik** — buď KDC ho přidělí (Kerberos), nebo Alice + Bob ho vyjednají ([[dh-elgamal|DH]]).
* **Použití** — symetrické šifrování (AES-GCM, ChaCha20-Poly1305) datového toku.
* **Bezpečnost** — útočník bez znalosti $K_{\mathrm{session}}$ a bez možnosti aktivně zasahovat nemůže získat plaintext.

> **Forward secrecy:** pokud i master key (KEK) je later compromised, *minulé* session keys zůstanou bezpečné. Pouze pokud byly vyjednány DH s efemérními klíči, *které byly zničeny po sessionu*.

## Distribuční přístupy

### 1. Pre-shared keys (PSK)

Strany dopředu sdílí $K_{\mathrm{master}}$ (např. fyzicky, na USB). Pro každou session:

* Vybere se *čerstvý* $K_{\mathrm{session}}$.
* Šifruje se $E_{K_{\mathrm{master}}}(K_{\mathrm{session}})$ a posílá druhé straně.

**Použití:** WPA-PSK (Wi-Fi), VPN s sdíleným heslem, IoT pairing.

**Limit:** *neškáluje* — $O(n^2)$ dvojic, fyzická distribuce.

### 2. KDC (Key Distribution Center)

Třetí strana, kterou všichni uživatelé sdílejí. Každý uživatel $U$ má sdílený klíč $K_U$ s KDC. Když Alice chce mluvit s Bobem:

* Alice → KDC: "Chci klíč pro komunikaci s Bobem".
* KDC vygeneruje $K_{AB}$.
* KDC pošle Alici: $E_{K_A}(K_{AB})$ + Bobovi: $E_{K_B}(K_{AB})$.
* Alice a Bob nyní sdílí $K_{AB}$.

**Výhody:** $O(n)$ klíčů (každý sdílí jen s KDC). **Nevýhody:** KDC je *single point of trust and failure*. Detaily viz [[kdc-needham|Needham-Schroeder]] a [[kerberos|Kerberos]].

### 3. Public-key (asymetricky)

Alice a Bob mají asymetrické páry. **Key transport**: Alice vygeneruje $K_{\mathrm{session}}$ a pošle Bobovi $E_{VK_B}(K_{\mathrm{session}})$. **Key agreement**: Diffie-Hellman, výsledek je sdílený $K_{\mathrm{session}}$.

DH s efemérními klíči má *forward secrecy* — výhoda nad RSA key transport. TLS 1.3 vyžaduje DH.

## Co je *čerstvý* (fresh) klíč?

Pojem v kryptografických protokolech:

* **Vygenerovaný nedávno** — odolnost vůči replay útokům s historickými klíči.
* **Náhodný** — útočník nemůže prediktivně vytvořit kolizi.
* **Použitý jen v této session** — žádné křížové znečištění.

### Zajištění čerstvosti

* **Nonce** — náhodné číslo unikátní pro session. Zahrnuje se do klíčové derivace.
* **Časové razítko** — explicitně označuje, kdy byl klíč generován. KDC odmítá staré.
* **Sekvenční čísla** — KDC dělá záznam, který klíč byl které session přidělen.

## Lifetime klíčů — kdy rotovat

Praktické cíkly:

| Klíč | Typická doba života |
| :-: | :-: |
| TLS session key | jednotky minut, max po 24h |
| TLS server private key | 1–2 roky |
| TLS root CA | 10–20 let |
| OpenSSH user klíč | bez timeoutu, prakticky desítky let |
| OpenSSH host klíč | desítky let |
| AWS API session token | 1 hodina |
| AWS IAM long-term | žádný timeout, doporučení rotovat ročně |
| EMV chip card key | 5–10 let |

> **Crypto agility:** Lepší než pevný timeout je *protokol*, který umožňuje *snadnou rotaci*. Pokud klíč unikne, mám-li infrastrukturu rychlé výměny, není katastrofa.

## Útoky na hierarchii klíčů

### KEK kompromitace = všechny session keys minulé i budoucí

Naivní hierarchie *bez* forward secrecy: pokud útočník získá master KEK, dešifruje *všechny* zaznamenané session keys → všechny zaznamenané sessions.

> Obrana: efemérní DH key agreement → session key není nikdy zašifrován KEKem. KEK se používá *jen* k autentizaci, ne k šifrování klíčů.

### Replay útoky

Útočník zachytí $E_{K_A}(K_{AB})$ z minulé session a později ho přehraje jako "nová žádost o klíč". KDC by mohlo *omylem* odeslat ten samý klíč, čímž útočník dešifruje *tu* session.

Obrana: nonce, časová razítka, sekvenční čísla.

### Plnit-překlič (key plombiering)

Útočník přesvědčí KDC, aby vydal stejný $K_{AB}$ pro dvě různé dvojice $(A, B)$ a $(A, B')$. Pokud Bob' je útočník, dešifruje komunikaci s Bobem.

Obrana: KDC musí *spojit* klíč s identitami obou stran v každém kroku.

## Klíčová hygiena v aplikacích

* **Master key v HSM** — Hardware Security Module. Klíč nikdy neopustí hardware; aplikace volá API "podepiš/dešifruj toto", neviděje klíč.
* **Klíče v paměti** — `mlock` proti swappingu, `memset_s` (C11) nebo `sodium_memzero` po použití. Pro stěžejní data po dešifrování.
* **Žádné klíče v sourcu/Gitu** — `git-secret`, HashiCorp Vault, AWS Secrets Manager.
* **Žádné klíče v logu** — striktní filtrace.
* **Žádné klíče v error messages** — útočník vyvolá chybu, dostane stack trace, vidí klíč v paměti.

## Praktický příklad: TLS 1.3 hierarchie

TLS 1.3 (RFC 8446) má elaborátní hierarchii:

```
PSK or 0 (early secret)
       ↓ HKDF-Extract
   Early Secret
       ↓ HKDF-Expand
   c e traffic, s e traffic, derived
       ↓ HKDF-Extract (ECDHE)
   Handshake Secret
       ↓ HKDF-Expand
   c hs traffic, s hs traffic, derived
       ↓ HKDF-Extract (0)
   Master Secret
       ↓ HKDF-Expand
   c ap traffic, s ap traffic, exporter master, resumption master
```

Každá úroveň odvozuje *nezávislé* klíče pro různé účely (handshake encryption, application data encryption, session resumption, exporter). Forward secrecy zajištěna ECDH efemérními klíči — pokud server long-term key padne, *minulé* TLS sessions zůstanou bezpečné.

---

*Zdroj: KRY přednášky 2025/26, KRY 6 — Symetrická správa klíčů. Externí reference: Menezes, A., van Oorschot, P., Vanstone, S.: *Handbook of Applied Cryptography* (CRC Press 1996), kap. 12; NIST SP 800-57 Part 1 Rev. 5: Recommendation for Key Management — Part 1: General (2020); RFC 8446: TLS 1.3 (2018); NIST SP 800-152: A Profile for U.S. Federal Cryptographic Key Management Systems (CKMS) (2015).*
