---
title: Elektronické pasy a eID
---

# Elektronické pasy a eID

Od r. 2004 vydává Mezinárodní organizace civilního letectví (ICAO) standard pro **elektronické pasy** (e-passports, **eMRTD** — Machine Readable Travel Documents). Od r. 2006 jsou tyto pasy povinné pro vstup do zemí pod *Visa Waiver Program* USA. Dnes (2026) je e-pas téměř univerzální — obsahuje bezkontaktní čipovou kartu s biometrií, asymetrickou kryptografií, PKI.

## Standard ICAO 9303

[ICAO Doc 9303](https://www.icao.int/publications/pages/publication.aspx?docnum=9303) (Machine Readable Travel Documents) definuje:

* **Fyzika** — pas má bezkontaktní čip dle ISO 14443 (Type A nebo Type B; v praxi většina pasů používá Type A), antén v jedné stránce nebo obálce.
* **Logical Data Structure (LDS)** — strukturovaný file system s `DG1`–`DG16` datovými soubory:
  * **DG1** — MRZ data (jméno, datum narození, číslo pasu, expiry, …).
  * **DG2** — fotografie (JPEG 2000).
  * **DG3** — fingerprints (volitelné).
  * **DG4** — iris (volitelné).
  * **DG5–DG16** — další (signature image, custody info, optional details).
  * **EF.COM** — hash list všech DG.
  * **EF.SOD** — Security Object — podepsaný hash list, podpis CSCA.
* **Protokoly bezpečnosti:**
  * **PA** — Passive Authentication.
  * **BAC** — Basic Access Control.
  * **AA** — Active Authentication.
  * **EAC** — Extended Access Control (PACE + Terminal Auth + Chip Auth).

## PA — Passive Authentication

**Cíl:** ověřit, že data v pasu jsou *autentická* (vydaná legitimní autoritou) a *neměněná*.

::: svg "PA PKI hierarchie: CSCA (Country Signing CA) podepisuje DSC (Document Signing Certificate), DSC podepisuje data v pasu (SOD)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aPA1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="200" y="20" width="140" height="40" rx="6"/>
    <rect x="200" y="90" width="140" height="40" rx="6"/>
    <rect x="200" y="160" width="140" height="30" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="42" font-size="12.5">CSCA</text>
    <text x="270" y="56" font-size="10" fill="var(--text-muted)">Country Signing CA</text>
    <text x="270" y="112" font-size="12.5">DSC</text>
    <text x="270" y="126" font-size="10" fill="var(--text-muted)">Document Signer</text>
    <text x="270" y="180" font-size="11">EF.SOD (data v pasu)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aPA1)">
    <path d="M270,60 L270,86"/>
    <path d="M270,130 L270,158"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="380" y="76">podepíše DSC</text>
    <text x="380" y="148">podepíše SOD hash</text>
  </g>
</svg>
:::

* Každý stát má svou **CSCA** (Country Signing Certificate Authority) — důvěryhodný kořen.
* CSCA podepisuje **DSC** (Document Signing Certificate), kterým se podepisují konkrétní pasy. DSC se k podpisu nových pasů používá jen krátce (ICAO doporučuje *private-key usage period* ~3 měsíce), ale jeho *platnost* (validity) musí pokrývat celou životnost podepsaných pasů (až ~10 let).
* DSC se uloží *v pasu* (jako součást SOD).
* **SOD** (Security Object Document) obsahuje hash *všech* DG souborů, podepsaný DSC.

Verifikace na hranici:

1. Čtečka přečte SOD a verifikuje podpis DSC veřejným klíčem DSC.
2. Verifikuje DSC podpisem CSCA (CSCA cert musí být *předem* uložen v terminálu — distribution přes ICAO PKD, **Public Key Directory**).
3. Spočítá hash každého DG, porovná s hashem ve SOD.

**Vlastnost PA:** prokazuje *integritu* dat, ale **NEZABRÁNÍ KLONOVÁNÍ** — kdokoli může číst DG soubory a hash list a vložit je do *jiného čipu*. Pro anti-cloning je třeba AA.

## BAC — Basic Access Control

**Cíl:** zabránit nahodilému/skimming čtení pasu bez fyzické inspekce.

* Před čtením DG musí čtečka prokázat, že **vidí MRZ** (Machine Readable Zone — fyzicky tištěné na pasu).
* Hash MRZ se použije jako *seed* pro odvození dvou 3DES klíčů ($K_{ENC}, K_{MAC}$).
* Authentication: 3-pass challenge-response (random nonces + 3DES).
* Pak začne *secure messaging* (3DES encrypted + MAC).

Slabiny:

* **Entropie MRZ** je nízká: typicky **~56 bitů** (kombinace 9-char passport number, datum narození, datum expiry). Pro některé národní systémy *ještě nižší* — některé pasy mají číslo jako sekvenci `12345xxxx` → cca 30–40 bitů.
* **Offline brute force** — útočník skimne traffic (modulating pole + odposlech) a *brute force-uje* MRZ klíče. 30 bitů je rozluštitelných za hodiny na GPU.

**Lekce:** BAC chrání jen proti *naivnímu* skimming, ne proti *aktivnímu útoku*. Stále povinné pro všechny e-pasy (legacy compatibility).

::: viz bac-entropy "Vyber schema (USA sekvencni / EU random / slaby system) a sleduj efektivni entropii MRZ + ocekavany brute-force cas na ruzne mnozství GPU. Sekvencni pasporty padaji za hodiny."
:::

## AA — Active Authentication

**Cíl:** dokázat, že pas je *originál*, nikoli klon.

* V pasu je uložen **soukromý klíč** RSA (1024–2048 b) nebo ECC (P-256), který *nikdy* neopustí čip.
* **Veřejný klíč** je v `DG15`, podepsaný DSC (součást PA).
* Challenge-response: čtečka pošle 8-bajtový nonce + 8-bajtový čtečkin nonce; pas podepíše hash obou.
* Verifikace podpisem veřejným klíčem.

**Vlastnost AA:** klon, který má jen kopii dat, *neudělá podpis* — nemá soukromý klíč. Klonování vyžaduje fyzickou extrakci klíče (drahé, viditelné).

* **AA je v ČR povinná** od r. 2009.
* V některých zemích (USA) AA *není* implementována — passová verifikace pouze přes PA + fyzickou kontrolu MRZ.
* **Relay útok** je možný (viz [[bezkontaktni-nfc]]) — pas v ČR může být *autentizován* z 1000 km daleko, pokud útočník propaguje signál.

## PACE — Password Authenticated Connection Establishment

**PACE** (BSI TR-03110) je modernější náhrada BAC s vyšší bezpečností:

* Místo MRZ se může použít **CAN** (Card Access Number — 6 cifer na pasu) nebo **PIN** (pro německý eID).
* Používá **Diffie-Hellman key agreement** (klasické DH nebo ECDH s Brainpool křivkou).
* Po PACE je SM kanál s **AES-128 + AES-CMAC**, ne 3DES.
* Klíče mají *forward secrecy* — odhalení PACE password nedovolí dešifrovat předchozí session.

PACE od 2009 (německé eID), od 2014 v EU e-pasech jako nahrazení BAC.

## EAC — Extended Access Control

Pro citlivé biometrické data (fingerprints v `DG3`, iris v `DG4`) je třeba *vyšší* úroveň.

EAC (BSI TR-03110) zavádí:

* **Terminal Authentication** — terminál se autentizuje **pasu** veřejným klíčem, jehož certifikát byl podepsán *Document Verifier* (DV), který má mandát od státu vydání pasu.
* **Chip Authentication** — pas dokáže, že je originál (silnější verze AA, integrovaná s PACE), ale klíč se *měněn* v sekci.

EAC je *povinné* pro EU pasy s biometrií (od r. 2009 — Schengen 2nd generation passports).

## Konkrétně — český eOP (občanský průkaz)

Od 1. 7. 2018 jsou v ČR vydávány nové občanské průkazy s **jedním kontaktním čipem** (bezkontaktní rozhraní není z bezpečnostních důvodů použito):

* **Kontaktní čip** — pro PKI/eID (autentizace, podpis, BankID, datové schránky).
* **Žádné bezkontaktní rozhraní** a **žádná biometrika** na čipu eOP — biometrické a ICAO 9303 funkce (pro EU/cesty) implementuje český **cestovní pas**, ne občanský průkaz.
* Aplikace **eDokladovka** poskytuje rozhraní pro autorizovaná čtení.

Bezpečnostní mechanismy:

* **PIN/PUK** pro kontaktní operace.
* Klíče generovány na čipu, soukromý *nikdy* neopustí.

(PACE / EAC / AA + CA + TA jsou mechanismy *bezkontaktního* cestovního pasu, viz výše — nikoli eOP.)

## Útoky na e-pasy

* **Skim přes BAC s nízkou entropií** — historicky 2006 demonstrováno [Adam Laurie](https://www.dailytech.com/Cracking+the+BAC+Algorithm+Used+to+Secure+ePassports/article14127.htm). Pro pasy se striktně inkrementovaným číslem (USA pasy ~2007) entropie 50 bitů → ~hodina brute force.
* **Relay útok na AA** — demonstrováno akademicky; mitigace přes PACE+SM s timing constraints.
* **Fingerprint extraction přes DPA** ([[spa-dpa]]) — některé generace karet vyřazeny po zranitelnostech.
* **Side-channel na AES SM kanál** — pro karty bez DPA-resistant AES.
* **Cloning UID** — UID bezkontaktního čipu lze klonovat (magic karta), ale bez AA klíče nedokáže projít challenge.

## Vztah k bezpečnostnímu rámci BH

Elektronický pas je *referenční implementace* moderního BH:

* **Single-chip module** ([[realizace-bh]]) — všechny krypto operace uvnitř.
* **PTG.3 RNG** ([[ais31-tridy]]) — pro nonces v PACE, AA challenge.
* **Common Criteria EAL5+** ([[fips-cc]]) — certifikace typická pro pas chip (NXP P5xx, Infineon SLE 78, ST33).
* **PKI hierarchy** — CSCA → DSC → SOD pro PA (viz též [[fips-cc|PKI a hierarchie certifikátů]]).
* **PACE** je *PAKE protokol* — neunikne nízká entropie heslem do offline útoku.
* **Diff. fault analysis ochrana** ([[dfa-princip]]) — proti fault útokům na podpisové operace.

---

*Zdroj: BZA přednášky 2025/26, BZA 04 — Čipové karty. Externí reference: ICAO Doc 9303 — *Machine Readable Travel Documents*, 8th ed. (2021) — [icao.int](https://www.icao.int/publications/pages/publication.aspx?docnum=9303); BSI TR-03110 *Advanced Security Mechanisms for Machine Readable Travel Documents* (v2.21, 2023) — [PDF](https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/Publications/TechGuidelines/TR03110/BSI_TR-03110_Part-1.pdf); BSI TR-03111 *Elliptic Curve Cryptography*; eIDAS Regulation (EU) No 910/2014.*
