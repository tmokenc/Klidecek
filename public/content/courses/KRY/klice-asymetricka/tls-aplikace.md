---
title: TLS jako aplikace PKI
---

# TLS jako aplikace PKI

**TLS (Transport Layer Security)** je *de facto* protokol pro šifrování spojení na Internetu. Nasazený nad TCP (TLS) nebo UDP (DTLS), zajišťuje:

* **Důvěrnost** — žádný odposlech.
* **Integritu** — žádná modifikace.
* **Autenticitu serveru** (a volitelně klienta) přes [[pki-uvod|PKI]].
* **Forward secrecy** — kompromitace dlouhodobých klíčů neohrožuje minulé sessions.

Historie: **SSL 1.0** (Netscape 1994, nikdy nepublikován), **SSL 2.0** (1995, rychle prolomen), **SSL 3.0** (1996), **TLS 1.0** (1999, RFC 2246), **TLS 1.1** (2006), **TLS 1.2** (2008, RFC 5246), **TLS 1.3** (2018, RFC 8446). Starší verze SSL 3.0, TLS 1.0, TLS 1.1 jsou vyřazené (RFC 8996, 2021).

## TLS 1.3 handshake

::: svg "TLS 1.3 handshake — 1-RTT"
<svg viewBox="0 0 540 280" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aTLS" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="20"  y="20" width="100" height="240" rx="6"/>
    <rect x="420" y="20" width="100" height="240" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70"  y="40">Client</text>
    <text x="470" y="40">Server</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1" fill="none" marker-end="url(#aTLS)">
    <path d="M120,70 L420,70"/>
    <path d="M420,130 L120,130"/>
    <path d="M120,230 L420,230"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5" text-anchor="middle">
    <text x="270" y="60">ClientHello</text>
    <text x="270" y="78">  + key_share (X25519 pk_C)</text>
    <text x="270" y="93">  + cipher_suites, signatures</text>

    <text x="270" y="120">ServerHello</text>
    <text x="270" y="138">  + key_share (X25519 pk_S)</text>
    <text x="270" y="155">  + EncryptedExtensions</text>
    <text x="270" y="172">  + Certificate, CertificateVerify</text>
    <text x="270" y="189">  + Finished</text>

    <text x="270" y="220">Finished + Application data</text>
    <text x="270" y="248">↓ Forward: AEAD encrypted</text>
  </g>
</svg>
:::

### Kroky

1. **ClientHello** — klient posílá:
   * `version: TLS 1.3` (legacy je 1.2 pro middlebox kompatibilitu).
   * `random` (32 B nonce).
   * `cipher_suites` — podporované AEAD šifry (AES-128-GCM, ChaCha20-Poly1305, AES-256-GCM).
   * `key_share` — efemérní ECDH veřejný klíč klienta (typicky X25519).
   * `supported_versions` — TLS 1.3 explicitně.
   * `signature_algorithms` — RSA-PSS, ECDSA, EdDSA.
   * **SNI (Server Name Indication)** — hostname, ke kterému se klient připojuje (umožní serveru vybrat správný cert).
2. **ServerHello** — server odpoví:
   * Vybraný `cipher_suite`.
   * `key_share` — efemérní ECDH veřejný klíč serveru.
   * **Po tomto kroku jsou všechny další zprávy šifrovány** session klíčem odvozeným z $\mathrm{ECDH}(pk_C, sk_S) = \mathrm{ECDH}(sk_C, pk_S)$.
3. **EncryptedExtensions** — další parametry (např. ALPN).
4. **Certificate** — server posílá X.509 certifikát + chain.
5. **CertificateVerify** — server podepíše transcript pomocí $SK_S$ (z certifikátu). Klient ověří podpis pomocí $VK_S$ z certifikátu → ověří, že server *opravdu* zná $SK_S$.
6. **Finished** — MAC nad celým handshake transcript pro integritu.
7. **Klient odpoví Finished** + může začít posílat application data ve stejné zprávě (1-RTT).

::: viz tls13-handshake "Sedm kroků handshake. Klikněte „▶" — sledujte, kdy server pošle certifikát, kdy se podepíše transcript (CertificateVerify), a od kterého kroku jsou všechny zprávy šifrované."
:::

### Forward secrecy

ECDH efemérní klíče $sk_C, sk_S$ se *nikdy neukládají* — po session se zničí. Pokud útočník později získá $SK_S$ (z certifikátu), nemůže rozšifrovat zaznamenané minulé sessions, protože $sk_C, sk_S$ nezná.

> TLS 1.2 *povoloval* RSA key transport (bez forward secrecy). TLS 1.3 ho **zakazuje** — vždy ECDH.

## 0-RTT (Zero Round-Trip Time)

Pokud klient *dříve* komunikoval se serverem, server poslal **session ticket** (zašifrovaný state). Při dalším připojení klient pošle ticket + **early data** v *prvním* ClientHello → server data dešifruje a *zpracuje* ihned, bez čekání na další round-trip.

Slabost: **replay attacks**. Útočník zachytí 0-RTT data a přehraje. Server nemůže rozlišit, zda jde o legitimní opakování (uživatel klikl 2×) nebo útok.

**Použití:** GET requesty (idempotentní). NIKDY pro *side-effect* operace (platby, login).

## TLS šifrové sady (cipher suites)

TLS 1.3 *významně zkrátil* seznam povolených cipher suites:

* `TLS_AES_128_GCM_SHA256`
* `TLS_AES_256_GCM_SHA384`
* `TLS_CHACHA20_POLY1305_SHA256`
* `TLS_AES_128_CCM_SHA256`
* `TLS_AES_128_CCM_8_SHA256`

Všechny AEAD, všechny moderní. **Žádné CBC, žádné RC4, žádný statický RSA key transport**. Výměna klíčů je vždy efemérní — ECDHE (typicky) nebo FFDHE (RFC 7919 ffdhe\* skupiny), což zajišťuje forward secrecy.

TLS 1.2 měl ~37 cipher suites — historický balast. TLS 1.3 vyhodil staré.

## Klientská autentizace

TLS standardně autentizuje **server**. *Klient* je obvykle anonymní (nebo autentizuje aplikační vrstvou — heslo, OAuth).

**Mutual TLS (mTLS):** server vyžaduje *klientský certifikát*. Klient pošle své X.509 + CertificateVerify (podpis $SK_C$). Server ověří proti vlastnímu trust store.

Použití:

* **Service-to-service** v microservices (Istio, Linkerd).
* **VPN** (OpenVPN s certifikáty).
* **Enterprise SSO** s smart cards.
* **API přístup** vysoké bezpečnosti.

## ALPN (Application-Layer Protocol Negotiation)

RFC 7301. Klient nabídne seznam podporovaných L7 protokolů (`h2`, `http/1.1`, `quic`), server vybere. Umožní HTTP/2 vyjednat bez extra RTT.

```
ALPN client: ["h2", "http/1.1"]
ALPN server: "h2"
```

Pro **HTTP/3 (QUIC)** je ALPN povinný — vyjednat protokol verze nad TLS 1.3.

## TLS aplikace mimo HTTPS

* **SMTP** — STARTTLS pro mail server-to-server.
* **IMAP, POP3** — STARTTLS, nebo "implicit TLS" (IMAPS, POP3S).
* **DNS-over-TLS (DoT)** — RFC 7858, port 853.
* **DNS-over-HTTPS (DoH)** — RFC 8484.
* **LDAP, FTP** — STARTTLS varianta.
* **MQTT, AMQP** — IoT message brokers.
* **PostgreSQL, MySQL** — `ssl=require` mode.

## TLS útoky

### Heartbleed (CVE-2014-0160)

OpenSSL bug: nedostatečná kontrola délky v heartbeat extension. Útočník mohl číst **64 KB serverové paměti** — včetně privátních klíčů, session keys, hesel. Postiženo cca 17% HTTPS serverů světa.

> *Nebyl* kryptografický útok — buffer over-read. Lekce: implementační bugy v TLS knihovně mají *enormní* dopad. Audit OpenSSL po Heartbleed → vznikla LibreSSL a BoringSSL forky.

### POODLE (CVE-2014-3566)

Padding oracle proti SSL 3.0 CBC. *Důsledek:* všichni dodavatelé prohlížečů vypnuli SSL 3.0 během dnů.

### BEAST (2011)

Padding oracle proti TLS 1.0 CBC s predikovatelným IV. Vyřešeno v TLS 1.1 (explicit IV per record).

### CRIME, BREACH (2012, 2013)

Útoky využívající *kompresi* — kompresní poměr uniká plaintext. Vyřešeno: vypnout kompresi v TLS (TLS 1.3 zakazuje).

### Lucky 13 (2013)

Časovací (timing) padding-oracle útok na MAC-then-encrypt v CBC režimu TLS. Vyřešeno: konstantní-čas MAC ověření, nebo přechod na AEAD.

### Logjam (2015), FREAK (2015)

Downgrade na 512-bit DH nebo RSA. Vyřešeno: minimum 2048-bit DH (RFC 7919), žádné export ciphers.

### SLOTH (2016)

Útok na MD5 (a SHA-1) hash v TLS 1.2 handshake. Vyřešeno: vyřazení slabých hashe; TLS 1.3 používá SHA-256.

### ROBOT (2017)

Bleichenbacher proti RSA-PKCS#1 v1.5 v TLS implementacích (F5, Citrix, Cisco). Vyřešeno: vypnutí RSA key transport; TLS 1.3 nepovoluje.

### Raccoon (2020)

Side-channel proti DH-static handshake. TLS 1.3 ho nemá.

### HEIST (2016), BREACH variants

Comeback komprese útoků. Vyřešeno: striktní zakázat HTTP kompresi tajných dat (CSRF tokeny).

## Praktická konfigurace serveru (2024)

### Nginx

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_session_tickets off;     # forward secrecy stronger without tickets

# OCSP stapling
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /path/to/intermediate.pem;
resolver 1.1.1.1 1.0.0.1 valid=300s;

# HSTS
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
```

### Apache 2.4

```apache
SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:...
SSLHonorCipherOrder off
SSLSessionTickets off
SSLUseStapling on
SSLStaplingCache "shmcb:logs/ssl_stapling(32768)"

Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains"
```

### Testování

* **SSL Labs:** https://www.ssllabs.com/ssltest/ — komplexní audit.
* **testssl.sh** — open-source CLI nástroj.
* **Mozilla Observatory:** https://observatory.mozilla.org/

## Trendy a budoucnost

### Encrypted Client Hello (ECH)

RFC draft (2024). Zašifruje **SNI** (Server Name Indication) — útočník nepozná, *které* webové stránky uživatel navštěvuje. Cloudflare, Mozilla, Apple postupně nasazují.

### TLS 1.3 jako norma

TLS 1.2 zůstává pro kompatibilitu, ale TLS 1.3 je *povinný* pro moderní servery (PCI DSS 4.0 vyžaduje od 2024). TLS 1.0/1.1 *zakázány* RFC 8996 (2021).

### Post-quantum hybrid

Cloudflare, Google již nasazují **X25519 + Kyber-768 hybrid** v TLS handshake. Kyber-768 dodává ~2 KB k handshake, jinak transparentní. NIST FIPS 203 (ML-KEM) standardizován 2024 — viz [[postkvantova]].

### HTTPS Everywhere

V 2024 je 95+% webového provozu HTTPS (Google Transparency Report). Chrome zobrazuje *Not Secure* pro HTTP. Let's Encrypt + Cloudflare snížily bariéru na nulu. *Nešifrovaný HTTP je* anomálie, ne norma.

---

*Zdroj: KRY přednášky 2025/26, KRY 5 — Asymetrická správa klíčů. Externí reference: RFC 8446: TLS 1.3 (2018); RFC 8996: Deprecating TLSv1.0 and TLSv1.1 (2021); Bhargavan, K. a kol.: "A Messy State of the Union: Taming the Composite State Machines of TLS", IEEE S&P 2015; Aviram, N. a kol.: "DROWN: Breaking TLS Using SSLv2", USENIX Security 2016; Cloudflare: "TLS 1.3 and the Future of Encrypted Communications" (2018).*
