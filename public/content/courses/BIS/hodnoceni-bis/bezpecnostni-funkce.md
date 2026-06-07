---
title: Bezpečnostní funkce — taxonomie
---

# Bezpečnostní funkce — taxonomie

Bezpečnostní funkce (security functions) jsou *mechanismy*, které informační systém implementuje, aby splnil bezpečnostní cíle. Normy ITSEC, a později Common Criteria, je rozdělily do 8 hlavních kategorií. Tato sekce je vyjmenovává a vysvětluje, *co každá z nich zahrnuje*.

## 1. Identifikace a autentizace (FIA)

*Kdo* přistupuje?

### Identifikace

Subjekt *tvrdí* svou identitu (uživatelské jméno, e-mail, ID).

### Autentizace

Subjekt svou identitu *prokazuje*. Rozlišujeme 5 faktorů:

1. **Něco, co znáš** (something you know) — heslo, PIN.
2. **Něco, co máš** (something you have) — token, čipová karta.
3. **Něco, čím jsi** (something you are) — biometrika (předmět BIO).
4. **Někde, kde jsi** (somewhere you are) — geolokace.
5. **Něco, co děláš** (something you do) — dynamika psaní na klávesnici (keystroke dynamics).

**Vícefaktorová autentizace** (MFA, Multi-Factor Authentication) = kombinace 2 a více faktorů z různých kategorií. Typicky heslo + token / SMS / TOTP.

### Mechanismy

- **Hesla** (password-based) — nejrozšířenější, ale slabé.
- **Tokeny** (token-based) — RSA SecurID, YubiKey, čipová karta.
- **Certifikáty** (certificate-based) — X.509 ([[x509]]).
- **Biometrika** (biometric) — otisk prstu, obličej, oční duhovka.
- **Federovaná autentizace** (federated) — SAML, OAuth, OpenID Connect.

## 2. Řízení přístupu (FDP)

Po autentizaci řešíme: *co* může subjekt dělat?

Modely řízení přístupu (podrobně viz [[dac-mac]] a [[rbac-abac]]):

- **DAC** (Discretionary, volitelné řízení) — o přístupu rozhoduje vlastník objektu ([[dac-mac]]).
- **MAC** (Mandatory, povinné řízení) — přístup vynucuje systém na základě bezpečnostních značek.
- **RBAC** (Role-Based, řízení podle rolí) — oprávnění určuje role uživatele ([[rbac-abac]]).
- **ABAC** (Attribute-Based, řízení podle atributů) — rozhoduje se podle atributů subjektu, objektu i prostředí.

### Bezpečnostní modely

- **Bell-LaPadula** — model důvěrnosti, pravidlo *nečti nahoru, nezapisuj dolů* (no read up, no write down) ([[bell-lapadula]]).
- **Biba** — model integrity, pravidlo *nečti dolů, nezapisuj nahoru* (no read down, no write up) ([[biba-clark-wilson]]).
- **Clark-Wilson** — komerční model integrity založený na dobře definovaných transakcích.

## 3. Účtovatelnost (FAU)

*Co se stalo?* Auditní záznamy (audit logs) zaznamenávají provedené akce.

### Co zaznamenávat

- **Úspěšné i neúspěšné autentizace** — umožní odhalit útok hrubou silou (brute force).
- **Privilegované operace** — sudo, akce administrátora.
- **Přístup k datům** — čtení a úprava citlivých dat.
- **Změny konfigurace** — systémová i bezpečnostní nastavení.
- **Síťová spojení** — záznamy o datových tocích.
- **Vytvoření procesů** — co se na systému spouští.

### Vlastnosti záznamů

- **Integrita** — záznamy *nesmějí* být dodatečně změnitelné (princip append-only, tedy pouze přidávání na konec).
- **Časová razítka** (timestamping) — pomocí synchronizovaného času (NTP).
- **Doba uchování** (retention) — záznamy je třeba uchovat dostatečně dlouho pro forenzní analýzu i pro soulad s předpisy (GDPR 6 měsíců, SOX 7 let).
- **Soukromí** — pokud je to možné, anonymizovat osobní údaje (PII).

### Nástroje

- **syslog** / journald — záznamy v systému Linux.
- **Windows Event Log** — záznamy ve Windows.
- **SIEM** ([[siem-monitoring]]) — centrální sběr a korelace záznamů.

## 4. Audit

Periodická *kontrola* (review):

- **Bezpečnostní opatření** — jsou implementována tak, jak byla navržena?
- **Soulad s předpisy** (compliance) — splňujeme regulatorní požadavky?
- **Záznamy** — anomálie a porušení.

Audit je *manažerský* proces — patří sem interní audit, externí auditoři i audity dodavatelů.

Samotný proces auditu standardizuje norma ISO 19011.

## 5. Opakované užití objektů (Object Reuse)

Pokud je objekt (oblast paměti, blok na disku, registr) *uvolněn* (deallocated) a znovu přidělen *jinému* subjektu, *nesmí* obsahovat zbytky předchozího obsahu.

### Mechanismy

- **Mazání paměti** (memory clearing) — vynulování stránek paměti před opětovným přidělením.
- **Bezpečné mazání disku** (disk wipe) — bezpečné smazání (vícenásobné přepsání, ATA Secure Erase).
- **Mazání registrů** (register clearing) — vynulování registrů při přepnutí kontextu (context switch).

### Co hrozí bez opakovaného užití

Útoky: cold boot attack (data zůstávají v RAM i po vypnutí), obnova dat z disku (disk recovery, smazané soubory), výpis paměti (memory dump).

Tato funkce patří mezi MAC požadavky úrovně B podle TCSEC.

## 6. Přesnost (Accuracy)

Data jsou *přesná* — nedochází k neúmyslným úpravám ani k poškození (corruption).

### Mechanismy

- **Kontrolní součty** (checksum) — CRC, parita.
- **Samoopravné kódy** (error correction codes) — ECC paměť, RAID.
- **Databázová omezení** (constraints) — referenční integrita, kontroly typů.
- **Validace na úrovni aplikace** — ošetření vstupů (input sanitization).

Integrita ≠ přesnost: integrita se týká *neoprávněné modifikace*, kdežto přesnost se týká *neúmyslné modifikace*. V praxi se však tyto pojmy překrývají.

## 7. Spolehlivost a dostupnost služeb

*Dostupnost* (availability) a *spolehlivost* (reliability) — služba *funguje* tehdy, *kdy* ji uživatelé potřebují.

### Mechanismy

- **Redundance** — RAID, clustering, hot standby (záložní systém v pohotovosti).
- **Vyvažování zátěže** (load balancing) — rozložení zátěže mezi více uzlů.
- **Zálohování a obnova po havárii** (backup + DR) — plány obnovy po havárii (disaster recovery).
- **Plánování kapacity** (capacity planning) — předvídat zátěž a podle ní škálovat.
- **Ochrana proti DDoS** — omezování rychlosti (rate limiting), anycast, CDN.

### Metriky

- **Procento dostupnosti** (uptime %) — 99 / 99,9 / 99,99 / … tzv. „devítky" (nines).
- **MTBF, MTTR** — střední doba mezi poruchami a střední doba opravy.
- **RPO, RTO** — cíl bodu obnovy a cíl doby obnovy.

## 8. Výměna dat (Data Exchange)

Bezpečná *komunikace* mezi systémy.

### Mechanismy

- **Důvěrnost při přenosu** (confidentiality in transit) — TLS ([[tls-aplikace]]), VPN ([[vpn-ipsec]]).
- **Integrita při přenosu** (integrity in transit) — MAC, podpis ([[mac-hmac]]).
- **Autentizace** — vzájemné (mutual) TLS, IPsec, Kerberos ([[kerberos]]).
- **Ochrana proti opakování** (replay protection) — pořadová čísla, časová razítka, jednorázová čísla (nonce).

### Standardy

- **TLS 1.3** — web, aplikace.
- **IPsec** — VPN, síťová vrstva.
- **SSH** — vzdálený shell.
- **S/MIME, PGP** — e-mail.
- **DNSSEC** — integrita DNS.

## Mapování na Common Criteria SFR

Mapování na funkční třídy Common Criteria ([[common-criteria]]):

| Funkce v BIS | Třída CC |
| :--- | :--- |
| Identifikace, autentizace | **FIA** — Identification and Authentication |
| Řízení přístupu | **FDP** — User Data Protection |
| Účtovatelnost | **FAU** — Security Audit |
| Audit | **FAU** + třída záruk **AMA** |
| Opakované užití | **FDP_RIP** — Residual Information Protection |
| Přesnost | **FDP_IFC, FDP_DAU** — Data Authentication |
| Spolehlivost, dostupnost | **FRU** — Resource Utilization, **FPT** — Protection of TSF |
| Výměna dat | **FTP** — Trusted Path/Channels, **FCO** — Communication |

Navíc třída **FCS** (Cryptographic Support, kryptografická podpora) prochází napříč všemi ostatními — veškerá komunikace, ukládání i autentizace používá kryptografii.

## Závislosti mezi funkcemi

Bezpečnostní funkce *nestojí samostatně* — vzájemně na sobě závisí:

```
Audit needs:
   Timestamp (NTP synchronized)
   Integrity (logs cannot be tampered)
   Reliability (logs always recorded)
Authentication needs:
   Cryptography (password hash, certificate signing)
   Integrity (credentials cannot be tampered)
Access control needs:
   Authentication (must know who)
   Audit (record what was accessed)
```

Bezpečnost je *systém* funkcí. Pokud jedna z nich chybí, ostatní mají snížený účinek.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně, a Hanáček & Staudek: „Bezpečnost IS — Metodická příručka" (ÚSIS 2000), §2.1.2 + §2.3.3. Externí reference: ISO/IEC 15408-2:2008 — Functional Security Requirements; ISO/IEC 27001:2022 — ISMS Requirements; NIST SP 800-53 Rev 5 — Security Controls; Stallings, W., Brown, L.: „Computer Security: Principles and Practice" (4th ed., Pearson 2018), §2.*
