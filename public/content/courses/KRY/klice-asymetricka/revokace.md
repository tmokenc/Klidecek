---
title: Revokace certifikátů (CRL, OCSP)
---

# Revokace certifikátů

[[x509|X.509 certifikát]] platí do `notAfter` — typicky měsíce až roky. Co se stane, když:

* Soukromý klíč unikne (Heartbleed, fyzická krádež HSM).
* Admin domény ztratí přístup.
* CA omylem vydala certifikát, neměla vydat.
* Identita majitele se změnila (změna vlastnictví domény).

**Revokace** je mechanismus, jak *zneplatnit* certifikát *před* jeho `notAfter`. Dva základní přístupy: **CRL** (Certificate Revocation Lists) a **OCSP** (Online Certificate Status Protocol). Oba mají problémy; aktuální praxe se posouvá k **krátkodobým certifikátům** + **CRLite**.

## CRL (Certificate Revocation List)

Klasický přístup (RFC 5280). CA pravidelně publikuje **podepsaný seznam revokovaných certifikátů**:

```
CRL:
  version: v2
  signatureAlgorithm: sha256WithRSAEncryption
  issuer: CN=Example CA
  thisUpdate: 2024-05-22 00:00:00 UTC
  nextUpdate: 2024-05-29 00:00:00 UTC
  revokedCertificates:
    - serialNumber: 0xDEADBEEF, revocationDate: 2024-05-15, reason: keyCompromise
    - serialNumber: 0xCAFEBABE, revocationDate: 2024-05-20, reason: superseded
  ...
  signatureValue: ...
```

Klient stáhne CRL z URL z `CRLDP` extension certifikátu (např. `http://crl.example-ca.com/intermediate.crl`).

### Problémy CRL

* **Velikost.** Veřejná CA má miliony certifikátů; CRL je MB až GB. Stahování pro každé spojení nepraktické.
* **Časová prodleva.** `nextUpdate` typicky 7 dní → revokovaný certifikát zůstává platný až 7 dní (po revokačním rozhodnutí ale před jeho propagací do CRL).
* **Soft-fail.** Pokud klient nemá CRL (offline, CRL server down), *přijme* certifikát bez ověření revokace. Bezpečnostně nevhodné.
* **Caching.** Klienti CRL agresivně cachují, aby nemuseli stahovat při každém spojení.

CRL je dnes *legacy* mechanismus; používá se jako záložní.

## OCSP (Online Certificate Status Protocol)

RFC 6960. Online dotaz na CA: "je tento konkrétní certifikát (sériové číslo X) platný?"

::: svg "OCSP dotaz: klient se ptá OCSP responderu na status konkrétního certifikátu"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aOCSP" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40"  y="60" width="120" height="60" rx="8"/>
    <rect x="380" y="60" width="120" height="60" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="95">Client</text>
    <text x="440" y="95">OCSP Responder</text>
  </g>
  <g stroke="var(--accent)" fill="none" marker-end="url(#aOCSP)">
    <path d="M160,80 L380,80"/>
    <path d="M380,100 L160,100"/>
  </g>
  <g fill="var(--text-muted)" font-size="10" text-anchor="middle">
    <text x="270" y="74">OCSP req: status certifikátu (serial X)?</text>
    <text x="270" y="115">OCSP resp: good / revoked / unknown (podepsáno)</text>
  </g>
</svg>
:::

### Standardní OCSP flow

1. Klient pošle OCSP request OCSP responderu (URL z `AIA.OCSP`): "status certifikátu se sériovým číslem X?"
2. Responder odpoví: `good`, `revoked` (s `revocationTime` a `revocationReason`), nebo `unknown`.
3. Odpověď je *podepsaná* OCSP responderem (často přímo CA).

### Problémy OCSP

* **Privacy leak.** OCSP responder vidí, *které certifikáty* klient ověřuje — efektivně sleduje *které* webové stránky uživatel navštěvuje. Nebezpečné v autoritářských režimech.
* **Latence (latency).** Extra round-trip ke OCSP serveru zpomalí TLS handshake o ~100 ms.
* **Soft-fail.** Stejně jako CRL — pokud OCSP nedostupný, prohlížeč *přijme* certifikát.
* **OCSP responder downtime** — výpadek znamená, že buď klienti odmítnou všechno (hard-fail), nebo přijmou všechno (soft-fail). Realita: většinou soft-fail.

> Mozilla CA Communications říká: "OCSP soft-fail je *bezpečnostně nedostatečné*, ale hard-fail by způsoboval výpadky." Bug 1366645.

## OCSP Stapling

RFC 6066 a RFC 6961. Řeší privacy a latence problémy.

**Princip:** *Server* sám pravidelně získává OCSP response od respondera a *přiloží* ji k TLS handshake. Klient nemusí kontaktovat responder — vidí OCSP odpověď přímo od serveru.

```
TLS handshake:
  ServerCertificate
  CertificateStatus    ← obsahuje stapled OCSP response
  ServerKeyExchange
  ...
```

Výhody:

* **Bez privacy leak** — klient nekomunikuje s OCSP responderem.
* **Bez latence** — OCSP response je součástí handshake.
* **Server cachuje** — OCSP responder dostane *zlomek* požadavků (pouze servery, ne klienty).

Nevýhoda: starší servery a CDN ne všechny podporují.

## Must-Staple

Extension v certifikátu, která říká *prohlížeči* "tento certifikát MUSÍ být prezentován s OCSP stapled response. Pokud ne, odmítni."

```
TLS Feature: status_request
```

Standard RFC 7633. Pokud server *nepřiloží* OCSP response a Must-Staple je nastaveno, prohlížeč připojení odmítne — **hard-fail revocation check**.

Adoption byla pomalá; v 2020+ stoupá. Let's Encrypt podporuje Must-Staple jako volitelný flag.

## CRLite

Mozilla 2017+: hybridní přístup řešící problémy CRL i OCSP.

**Princip:**

1. CA publikuje aktuální stav revokací.
2. Mozilla agreguje CRL ze všech CA a vytvoří **Bloom filter** (komprese pomocí pravděpodobnostního testování).
3. Filtr (~1 MB) je *push-distributed* do prohlížečů Firefox aktualizací.
4. Klient ověří revokaci *lokálně* — žádný online dotaz.

Bloom filter má *false positives* (cert může vypadat revoked, i když není). Pro false positive klient ověří přes OCSP. *False negatives nemůže — revokovaný certifikát je vždy detekován*.

> CRLite v Chrome se nazývá **CRLSets**. Apple má vlastní **valid.apple.com** mechanism. Všichni stahují denně, používají offline.

## Reason codes

Standardní důvody revokace (RFC 5280):

| Code | Význam |
| :-: | :--- |
| 0 | unspecified |
| 1 | keyCompromise (soukromý klíč unikl) |
| 2 | cACompromise (CA klíč unikl) |
| 3 | affiliationChanged (změna identity) |
| 4 | superseded (nový certifikát vydán) |
| 5 | cessationOfOperation (služba ukončena) |
| 6 | certificateHold (dočasná suspenze — *deprecated*) |
| 8 | removeFromCRL |
| 9 | privilegeWithdrawn |
| 10 | aACompromise (Attribute Authority compromise) |

`keyCompromise` je *nejvážnější* — útočník má soukromý klíč.

## Krátká platnost — alternativa k revokaci

**Let's Encrypt** vydává certifikáty s 90-denní platností (renew automaticky po 60 dnech). Důsledek:

* Revokovaný certifikát je *neplatný* nejvýše 90 dní (před expirací) — i bez aktivní revokace.
* Krátká platnost = malé okno útoku.
* Méně práce s revokační infrastrukturou.

Apple od září 2020 omezila platnost veřejných TLS certifikátů na **maximum 398 dní** (po 1.9.2020). Brzy se očekává další zkrácení (90 dní jako standard).

## TLS klient validation flow

Při TLS connect:

1. Server pošle cert chain + (volitelně) stapled OCSP.
2. Klient:
   a. Validuje chain (podpisy, validity, key usage, hostname).
   b. **Revocation check:**
      * Stapled OCSP → použij (rychlé).
      * Jinak: CRL/OCSP cache → použij.
      * Jinak: stáhni OCSP online → použij.
      * Pokud Must-Staple a stapled chybí → REJECT.
      * Pokud OCSP unreachable → soft-fail (přijmi).
   c. Pokud cert je v CRLite/CRLSet → REJECT.

## Útoky na revokaci

### Stripping OCSP

Mallory (MITM) odstraní stapled OCSP z handshake. Pokud certifikát *není* Must-Staple, klient spadne do online OCSP. Mallory blokuje i ten — soft-fail → klient přijme i revokovaný cert.

**Obrana:** Must-Staple + hard-fail policy v prohlížeči.

### Replay OCSP odpovědi

Stapled OCSP odpověď má omezenou platnost (`thisUpdate`, `nextUpdate`, typicky 1–7 dní). Mallory s starou OCSP odpovědí (good) může před revokací přehrát.

**Obrana:** krátká OCSP platnost (~24 hod). Klient ověří `nextUpdate`.

### Compromised OCSP responder

Pokud OCSP responder podepíše falešnou *good* odpověď pro revokovaný cert, klient ji přijme.

**Obrana:** OCSP responder má vlastní certifikát od CA s `id-pkix-ocsp-nocheck` extension — tj. OCSP responder samotný NESMÍ být revokován. Pak OCSP responder klíč může být uchován v HSM s extra ochranou.

## Praxe — co dělat (2024)

Pro **server adminy:**

1. **Use Let's Encrypt** (90-denní cert, auto-renew).
2. **OCSP Stapling** povolit v webserveru (nginx, Apache).
3. **Must-Staple** zvážit (přidává robustnost, ale snižuje fault tolerance).
4. **CAA záznam** pro doménu.
5. **Plán revokace** — pokud klíč unikne, vědět *koho kontaktovat* a *jak rychle revokovat*.

Pro **klient apps:**

1. **Stapled OCSP** preferovat.
2. **CRLite/CRLSets** spoléhat (browser default).
3. **Hard-fail** pro vysoce citlivé aplikace (banking, e-government).

Pro **CAs:**

1. **OCSP responder** s vysokou dostupností.
2. **CT logging** všech vydaných certifikátů.
3. **Krátká OCSP platnost** (≤ 7 dní).
4. **Revokační SLAs** definované.

## Trend — zánik OCSP

Apple **vypnula OCSP for Safari** od 2022 (oznámeno). Google Chrome už dlouho preferuje CRLSets nad OCSP. Firefox čeká.

Budoucnost: **krátkodobé certifikáty** + **klient-side reputation data** (CRLite) > online revocation queries. OCSP odejde jako historický experiment.

---

*Zdroj: KRY přednášky 2025/26, KRY 5 — Asymetrická správa klíčů. Externí reference: RFC 5280: Internet X.509 PKI Certificate and CRL Profile (2008); RFC 6960: X.509 OCSP (2013); RFC 7633: X.509v3 TLS Feature Extension (2015); Larisch, J. a kol.: "CRLite: A Scalable System for Pushing All TLS Revocations to All Browsers", IEEE S&P 2017; Apple WWDC 2020: TLS for App Developers.*
