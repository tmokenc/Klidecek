---
title: Signatury, Snort/Suricata, fingerprinting
---

# Signatury, DPI a fingerprinting

Identifikace podle hlaviček ([[port-header-identifikace]]) selhává proti šifrování a tunelování. **Signatury** = hluboký pohled do paketu, *match* proti databázi vzorů. Tato sekce probere klasický **Snort/Suricata** workflow, kanonické **DPI** mechanismy a moderní **fingerprinting** technique (JA3, JA4) — vše to, čemu se říká *deep packet inspection*.

## Co je signatura

> **Signatura** = vzorec (sekvence znaků nebo regex), který identifikuje typ provozu / protokol / útok.

Příklady:

- *HTTP request* — řetězec `GET / HTTP/1.1\r\nHost:` na začátku payloadu.
- *DNS query* — bit vzor v UDP/53 payload (transaction ID + flags + queries).
- *BitTorrent* — řetězec `\x13BitTorrent protocol` v handshaku.
- *Conficker malware* — specifická sekvence v C&C komunikaci.
- *Heartbleed exploit* — TLS heartbeat request, kde deklarovaná payload_length (až 65535 B) je výrazně větší než skutečně poslaná data → buffer over-read serverové paměti.

Workflow:

1. **Expert** analyzuje protokol/útok, identifikuje *typický vzorec*.
2. Vzorec se zakóduje jako *pravidlo*.
3. IDS sonda *vyhledává* pravidla v každém průchozím paketu.
4. Match → log / alert / drop.

## Snort — kanonický open-source IDS

[Snort](https://www.snort.org/) (Martin Roesch, 1998) — *de facto* první široce nasazený síťový IDS. V 2009 Cisco koupilo Sourcefire (komerční firmu kolem Snortu); dnes je Snort 3 stále open source, *VRT pravidla* (Vulnerability Research Team) jsou *paid subscription*.

Pravidlo Snort syntax:

```
alert tcp $HOME_NET any -> $EXTERNAL_NET 80
       (msg:"WEB-CLIENT possible iframe exploit";
        content:"<iframe"; nocase;
        content:".com"; distance:0; within:50;
        classtype:web-application-attack;
        sid:1234567; rev:2;)
```

Pole:

- **action** — `alert`, `log`, `pass`, `drop`, `reject`.
- **protocol** — `tcp`, `udp`, `icmp`, `ip`.
- **src / dst** — IP rozsah a port.
- **direction** — `->`, `<>` (bidir).
- **content** — řetězec k vyhledání. `nocase` = case-insensitive. `distance:N within:M` = N–M B od předchozího match.
- **pcre** — Perl-compatible regex (drahý).
- **flowbits**, **threshold**, **detection_filter** — kontext-aware logika.
- **sid** — Snort ID (unikátní).
- **msg** — alert text.

V 2026 má veřejná Snort sada cca *50 000 pravidel*; komerční Talos sada *100 000+*.

## Suricata — moderní alternative

[Suricata](https://suricata.io/) (OISF, 2010). Cíle:

- *Multi-threaded* (Snort byl single-threaded do verze 3).
- Native **HTTP/TLS/SSL parsing** — extract metadata, ne jen regex match.
- **EVE JSON** output — strukturovaný log pro ELK/Splunk.
- **NSM** (Network Security Monitoring) — full packet capture, flow extraction.
- *Snort-rule kompatibilita* — Suricata umí číst Snort pravidla (s minor extensions).

Suricata je dnes preferovaný DPI engine v většině moderních deploymentů (Security Onion, Stamus Networks, Open Information Security Foundation).

## Omezení signatur

### 1. Konečná množina

Signatury kryjí *jen* známé hrozby. Nový malware (zero-day) — bez signatury, *nedetekuje*. Stejné u antivirů — vendoři vydávají *daily updates*.

### 2. Vyhledávací složitost

Pro každý paket *zkus všech N signatur*. Pro N=10 000 pravidel × 100 Gbps line rate = *biliony match operací za sekundu*. Hardware (Aho-Corasick automata v FPGA/ASIC) to umí, software ne.

Důsledek: na páteřních 100 Gbps+ linkách *neuvidíte* full Snort/Suricata. Tam jen *flow monitoring* ([[netflow-ipfix]]) + sondování *vzorků* (Cisco "sampled NetFlow", every 1000th paket).

### 3. Multi-paket signatury

Některé signatury jsou *delší* než jeden paket — exploit přes víc TCP segmentů. IDS musí *reassemblovat* TCP stream, *uložit do bufferu*, hledat *přes pakety*. Paměťově náročné.

Aktuální Snort/Suricata umí *flow tracking* — pamatuje si TCP state per-connection. Pamět 1–10 KB per flow × miliony aktivních flows = GB RAM.

### 4. Šifrování

TLS/QUIC payload je *šifrovaný*. Signature `<iframe` nelze najít v šifrovaném HTTPS. *Bez TLS interception* (firewall jako "MITM" — viz dále) DPI nad HTTPS *nefunguje*.

### 5. Polymorphic / metamorphic malware

Útočníci *záměrně* obfuscují binárky, aby unikly signaturám. Variabilní encoding, runtime decryption, packed PE → každá kopie *jinak* vypadá, ale dělá totéž.

Obrana: *behavioral signatures* (sandbox, dynamická analýza) nebo *anomaly detection* ([[detekce-anomalii]]).

## TLS interception

Korporátní firewally často **rozšifrují TLS** pro DPI:

1. Firma instaluje vlastní **root CA** do všech endpoint trust stores.
2. Firewall je transparentní *MITM* — vidí ClientHello, *generuje vlastní cert* podepsaný firmí CA, *šifruje* k klientovi vlastním klíčem.
3. K server straně se chová jako *klient* — vidí plaintext.

Výsledek: firewall vidí *plaintext* obsah → může aplikovat DPI signatury.

Etické a právní problémy:

- *Privacy* — zaměstnanci ztrácí TLS důvěrnost.
- **Certificate pinning** — některé aplikace (banking apps) odmítnou pinned cert; nebudou pracovat.
- **GDPR** — v EU vyžaduje *informovaný souhlas* + omezení na legitimate purposes.

Mnoho moderních organizací TLS interception *omezuje* na "ne-personal" trafik (přihlášené uživatele firemních zařízení v pracovní hodiny).

## Fingerprinting — když je všechno šifrované

Když payload číst nelze, *jak* jinak identifikovat aplikaci?

**Fingerprinting** = vytěžit *metadata* TLS handshake, *struktury* paketů, *timing*. Nejsou to ani porty, ani payload — *sekundární* příznaky.

### JA3 a JA3S

[Salesforce JA3](https://github.com/salesforce/ja3) (2017). Hashuje **ClientHello** fields:

- TLS version.
- Cipher suites (v pořadí).
- Extensions.
- Elliptic curves.
- EC point formats.

```
TLS_version,cipher1-cipher2-...,ext1-ext2-...,curves,formats
```

MD5 hash této stringy = **JA3 fingerprint**. 32-char hex.

Klíčové: *každá implementace TLS klienta* má jiný JA3.

- Chrome 110 → jeden JA3.
- Firefox 109 → jiný.
- Python `requests` → třetí.
- Mirai botnet C&C klient → čtvrtý.

Z JA3 nelze poznat *obsah*, ale můžete poznat *kdo komunikuje*. Threat intelligence databáze obsahují *seznamy zlomyslných JA3 hashes*.

**JA3S** = totéž pro **ServerHello** odpověď. Společně identifikují *konkrétní pár* klient–server.

### JA4 — moderní successor

[JA4 (FoxIO)](https://github.com/FoxIO-LLC/ja4) (2023). Vylepšení nad JA3:

- *Seřazené* cipher suites a extensions — odolnost proti GREASE (Google's anti-fingerprinting mechanism, který *zámerně* přidává náhodné hodnoty).
- *Strukturovaný* format místo MD5: `t13d1516h2_8daaf6152771_b186095e22b6`.
  - `t13` — TLS 1.3.
  - `d` — přítomna SNI extension (cíl je doména); alternativa `i` = cíl je IP adresa.
  - `1516` — počet cipher suites a extensions.
  - `h2` — ALPN (HTTP/2).
  - Druhý segment — SHA256 hash cipher suites *seřazených* v hex pořadí (12 znaků).
  - Třetí — SHA256 hash *seřazených* extensions. (Nesetříděná varianta je samostatný raw formát JA4_r.)
- **JA4S** (server-side), **JA4X** (X.509 certifikát), **JA4T** (TCP fingerprint), **JA4H** (HTTP fingerprint), **JA4L** (latency).

Adopce: integrace do Wireshark, Suricata, Zeek, NDR vendor produktů. V 2026 *de facto* standard pro encrypted-traffic fingerprinting.

### SSH fingerprint, OS fingerprint

Podobné techniky pro:

- **HASSH** (Salesforce) — SSH handshake fingerprint.
- **p0f** — TCP/IP fingerprint (OS identification z TTL, window size, MSS, options order).
- **Nmap OS detection** — aktivní OS fingerprint pomocí specifických probes.

## Behavioral signatures

Detekuje *vzory chování* nikoli obsah. Příklady:

- *Beacon traffic* — periodické krátké connection k stejné IP každých N sekund = typický C&C.
- *Slow data exfiltration* — kontinuální *upload* trickle out (víc bajtů odchází než vchází) přes dlouhý čas.
- *Domain Generation Algorithm (DGA)* — malware ngenerujue *tisíce* DNS query za sekundu k pseudo-random doménám.

Tyto vzory *nevadí šifrování* — vidíme **kdy, kolik, kam**, i bez obsahu. Tomu se říká *encrypted traffic analysis*.

## Co dál

Pro velký objem dat (10G+ páteře, datacenter east-west) nelze full DPI — používá se **flow-based monitoring** ([[netflow-ipfix]]) — *agregát* statistik místo per-paket inspekce.

---

*Zdroj: PDS přednáška 8 (IDS), doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: [Snort 3 Documentation](https://docs.snort.org/); [Suricata User Guide](https://docs.suricata.io/); Roesch, M.: „Snort — Lightweight Intrusion Detection for Networks" (USENIX LISA '99); [Salesforce JA3 GitHub](https://github.com/salesforce/ja3); [FoxIO JA4 Specification](https://github.com/FoxIO-LLC/ja4); Karim, A. et al.: „Botnet Detection Techniques: Review, Future Trends, and Issues" (J. of Zhejiang Univ. SCIENCE C, 2014).*
