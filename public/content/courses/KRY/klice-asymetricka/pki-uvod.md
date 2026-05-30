---
title: PKI a důvěra ve veřejné klíče
---

# PKI a důvěra ve veřejné klíče

[[principy|Asymetrická kryptografie]] elegantně řeší distribuci klíčů — veřejný klíč $VK$ lze publikovat, kdokoli ho může použít k šifrování pro majitele soukromého klíče. Otázka *kdo* vlastní *který* veřejný klíč však zůstává otevřená.

**Pokud útočník podvrhne fakulní $VK_B'$ jako Bobův klíč**, Alice zašifruje zprávu pro něho, útočník ji čte, znovu zašifruje skutečným $VK_B$ a předá Bobovi. **Man-in-the-Middle** útok bez asymetrické kryptografie.

**Public Key Infrastructure (PKI)** je rámec, který *autentizuje veřejné klíče* pomocí podpisů důvěryhodných třetích stran. Standard je **X.509** (ITU-T 1988, IETF RFC 5280).

## Problém autenticity veřejných klíčů

Bob může veřejně publikovat $VK_B$. Útočník může také *vystupovat jako Bob* a publikovat *vlastní* $VK_M$ s označením "Bob".

Alice před prvním kontaktem s Bobem nemá důvod *věřit* zveřejněnému klíči. Tři přístupy řešení:

### 1. Manuální výměna (out-of-band)

Bob předá Alici svůj $VK_B$ *fyzicky* (papír, USB, ústně přečtený fingerprint). Po prvním kontaktu je důvěra navázána.

* **PGP "key fingerprints"** — uživatelé ústně porovnávají 40 hex znaků hash veřejného klíče.
* **SSH "host key verification"** — při prvním připojení uživatel ověří fingerprint hosta.

**Výhoda:** žádná třetí strana. **Nevýhoda:** *neuškálovatelné* pro veřejné služby (HTTPS pro miliony domén).

### 2. Web of Trust (PGP/GPG)

Decentralizovaný: každý uživatel podepíše veřejné klíče lidí, kterým osobně věří. Pokud Alice věří Davidovi a David podepsal Bobův klíč, Alice může (s mírnou opatrností) věřit Bobovu klíči.

* **Klíčové podpisové strany** (Key Signing Parties) — fyzické srazy uživatelů PGP.
* **Klíčové servery** — distribuce klíčů + podpisů (sks-keyservers.net, MIT keyserver).

**Výhoda:** žádný centrální autoritní bod. **Nevýhoda:** *pomalé budování důvěry*, nesnadné pro nové uživatele.

### 3. Hierarchická PKI s Certifikační Autoritou (CA)

Důvěryhodná třetí strana ("Certificate Authority") podepíše veřejný klíč spolu s identitou. Výsledný objekt — **certifikát** — lze ověřit kdokoli pomocí CA veřejného klíče.

**Výhoda:** *uškálovatelné* — jeden CA může podepsat miliony certifikátů. **Nevýhoda:** *centralizace důvěry* — CA je single point of trust.

Internetový HTTPS je postaven na hierarchické PKI.

## Architektura PKI

::: svg "Hierarchická PKI: root CA → intermediate CA → end-entity certificate"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aPKI" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="200" y="20"  width="140" height="40" rx="6"/>
    <rect x="80"  y="100" width="120" height="40" rx="6"/>
    <rect x="340" y="100" width="120" height="40" rx="6"/>
    <rect x="20"  y="180" width="100" height="30" rx="6"/>
    <rect x="140" y="180" width="100" height="30" rx="6"/>
    <rect x="290" y="180" width="100" height="30" rx="6"/>
    <rect x="410" y="180" width="100" height="30" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="45">Root CA</text>
    <text x="140" y="125">Intermediate CA 1</text>
    <text x="400" y="125">Intermediate CA 2</text>
    <text x="70"  y="200">example.com</text>
    <text x="190" y="200">acme.com</text>
    <text x="340" y="200">bank.com</text>
    <text x="460" y="200">app.io</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.1" fill="none" marker-end="url(#aPKI)">
    <path d="M250,60 L160,98"/>
    <path d="M290,60 L380,98"/>
    <path d="M120,140 L70,178"/>
    <path d="M160,140 L190,178"/>
    <path d="M380,140 L340,178"/>
    <path d="M420,140 L460,178"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="20" y="50">trust anchor</text>
    <text x="20" y="65">(v OS/browseru)</text>
  </g>
</svg>
:::

### Hierarchie

* **Root CA** — kořenová autorita. Veřejný klíč zabudován v operačním systému / prohlížeči (Mozilla NSS, Microsoft Trust Store, Apple Keychain).
* **Intermediate CA** — autorita podpepsaná root CA (nebo jinou intermediate). Podepisuje koncové certifikáty.
* **End-entity certifikát** — certifikát pro konkrétní doménu, server, uživatele.

Root CA zůstává **offline** (v sejfu, HSM). Intermediate CAs jsou *online* a podpisují denní provoz.

### Důvod hierarchie

* **Bezpečnost root klíče** — pokud unikne root key, nesmazatelná katastrofa (musíme distribuovat nový trust store každému zařízení). Intermediate může být *revoknout*.
* **Operační oddělení** — různé intermediate pro různé účely (EV, OV, DV, code signing).
* **Cross-signing** — nový CA podepsán *více* root CAs pro postupný přechod.

### Trust Store

Operační systémy a prohlížeče mají *předinstalovanou* sadu trusted root CAs:

* **Mozilla CA Certificate Program** — používaný Firefox, Linux, mnohé OS.
* **Microsoft Windows Trust Store** — Windows, IE/Edge.
* **Apple Trust Store** — macOS, iOS.
* **Google Chrome Root Program** — od 2023 Chrome má vlastní (vs. spoléhal na OS).

Cca **150 root CA** v každém prohlížeči (CA/Browser Forum členové). **CA / Browser Forum** koordinuje "Baseline Requirements" — minimální standardy pro vydávání certifikátů.

## Workflow vydání certifikátu

1. **Generování páru klíčů** — admin domény *sami* vygeneruje $(VK, SK)$. SK zůstává *na serveru*.
2. **CSR (Certificate Signing Request)** — admin pošle CA žádost obsahující $VK$, identitu (doména, organizace), a *podpis* sám sebou jako důkaz držení $SK$.
3. **Validace identity:**
   * **Domain Validation (DV):** CA ověří jen *vlastnictví domény* (např. DNS TXT záznam, e-mail na admin@domain, HTTP soubor).
   * **Organization Validation (OV):** CA navíc ověří *legální existenci organizace* (obchodní rejstřík).
   * **Extended Validation (EV):** CA navíc *fyzicky* ověřuje organizaci (telefonáty, fyzická adresa). Méně používaný, browser indikátory EV od ~2018 zrušeny.
4. **Vydání certifikátu** — CA podepíše $\mathrm{Cert} = (VK, \mathrm{identity}, \mathrm{validity}, \mathrm{Sig}_{SK_\mathrm{CA}}(\dots))$.
5. **Instalace** — admin nainstaluje certifikát na server. Pro TLS: PEM file s `BEGIN CERTIFICATE`.

## Validace v praxi (klient)

Když Alice připojí k `https://example.com`:

1. Server pošle **chain** — svůj certifikát + intermediate(s).
2. Klient:
   a. Začíná u serverového certifikátu, ověří podpis pomocí intermediate $VK$.
   b. Ověří intermediate podepsaný root $VK$ (root je v trust store).
   c. Ověří, že hostname v certifikátu odpovídá `example.com`.
   d. Ověří, že validity period zahrnuje aktuální čas.
   e. Ověří, že certifikát *nebyl revokován* (CRL / OCSP, [[revokace]]).
3. Pokud OK, použije $VK$ z certifikátu k ověření autenticity serveru v TLS handshake — v TLS 1.3 klient ověří podpis serveru (CertificateVerify) nad transcriptem, čímž je svázán efemérní ECDH klíč s důvěryhodným certifikátem.

## Bezpečnostní vlastnosti PKI

### Trust chain

Důvěra v `example.com` cert *vyžaduje* důvěru v:

* Intermediate CA, který ho podepsal.
* Root CA, který intermediate podepsal.
* OS/browser, který root CA zařadil do trust store.

**Pokud kterýkoli článek je kompromitován**, celá kotva může selhat.

### Konkrétní incidenty

* **DigiNotar 2011** — nizozemská CA prolomena, vydala falešný certifikát pro `*.google.com`. Použito proti íránským dissidentům. **CA byla bankrotována** a vyřazena z trust stores.
* **Symantec 2017** — Symantec/Thawte vydávaly *testovací* certifikáty pro reálné domény (např. `google.com`) ne-autorizovaným způsobem. **Google distrustovala** Symantec → Symantec prodala CA business.
* **TURKTRUST 2013** — turecká CA omylem vydala intermediate CA certifikát mladému uživateli, ne CA. Použito pro **falešný `*.google.com`**.

> Lekce: CA jsou jeden bodů zranitelnosti. **Certificate Transparency** (RFC 6962, 2013) přidává *veřejně auditovatelné* logy všech vydaných certifikátů — *anyone* může detekovat podvodný certifikát.

## Certificate Transparency (CT)

Každý vydaný certifikát musí být *zapsán* do CT logu (Merkle stromu, podepsaný log serverem). Klienti odmítnou certifikáty *bez SCT* (Signed Certificate Timestamp).

* **Public CT logs** — Google, Cloudflare, Let's Encrypt, atd.
* **Monitorování:** majitel domény může *sledovat* CT logy a detekovat podvodné certifikáty pro svou doménu.
* **Crt.sh** (Comodo/Sectigo) — vyhledávač CT logů.

Browser policy (Chrome od 2018) vyžaduje CT pro všechny nové certifikáty.

## Let's Encrypt — automatizace DV

Let's Encrypt (ISRG, 2015) zaviedl **bezplatné DV certifikáty** + automatizovaný **ACME protokol**. Změnilo internet: 90+% HTTPS na webu v 2024.

### ACME workflow

1. Klient generuje pair $(VK, SK)$.
2. Klient registruje účet u Let's Encrypt (ACME endpoint).
3. Klient zažádá o certifikát pro `example.com`.
4. ACME server vystaví **challenge:**
   * HTTP-01: umisti specifický soubor na `http://example.com/.well-known/acme-challenge/...`
   * DNS-01: umisti TXT záznam `_acme-challenge.example.com`
   * TLS-ALPN-01: respondovat na TLS spojení s specifickým certifikátem
5. Klient splní challenge.
6. ACME server ověří a vydá certifikát (90 dní platnost).
7. Klient automaticky obnovuje (typicky 30 dní před vypršením).

> 90-denní validity je *záměrná* — krátké platnosti znamenají *rychlou rotaci*, *malé okno pro útok* s kompromitovaným klíčem.

## CAA (Certification Authority Authorization)

DNS záznam, který říká *které CA* smí vydávat certifikáty pro doménu. Příklad:

```
example.com. CAA 0 issue "letsencrypt.org"
example.com. CAA 0 iodef "mailto:security@example.com"
```

CA *musí* zkontrolovat CAA před vydáním (RFC 8659). Pokud `letsencrypt.org` není v CAA, Let's Encrypt vydání odmítne. Druhý záznam (`iodef`) říká, kam reportovat porušení.

CAA výrazně omezí "rogue CA" útok — útočník nedokáže přesvědčit *jinou* CA, aby vydala certifikát, pokud doména má CAA bez té CA.

## HSTS, HPKP (deprecated), Expect-CT

* **HSTS (HTTP Strict Transport Security)** — server řekne browseru "vždy mě požaduj přes HTTPS po dalších *N* sekund". Brání SSL stripping útokům.
* **HPKP (Public Key Pinning)** — server řekne browseru "očekávej můj certifikát s tímto pinem". *Deprecated* (Chrome 2017) kvůli riskim sebepoškození.
* **Expect-CT** — server vyžaduje Certificate Transparency. Také deprecated, nyní implicitní.

## Praktický stack (2024)

* **TLS 1.3** + **ECDSA P-256** certifikáty.
* **Let's Encrypt** s **ACME-DNS** nebo **certbot** auto-renewal.
* **CAA** záznamy pro DNS.
* **CT monitoring** přes crt.sh, Cert Spotter nebo cron job.
* **HSTS** povinný pro production weby.

Detailněji o struktuře certifikátu viz [[x509]], o revokaci viz [[revokace]], o protokolech TLS viz [[tls-aplikace]].

---

*Zdroj: KRY přednášky 2025/26, KRY 5 — Asymetrická správa klíčů. Externí reference: RFC 5280: Internet X.509 Public Key Infrastructure Certificate and CRL Profile (2008); CA/Browser Forum Baseline Requirements; RFC 6962: Certificate Transparency (2013); RFC 8555: Automatic Certificate Management Environment ACME (2019); RFC 8659: DNS Certification Authority Authorization CAA (2019).*
