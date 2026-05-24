---
title: Identita, identifikace, verifikace, autentizace
---

# Identita, identifikace, verifikace, autentizace

Pro správnou orientaci v biometrii je třeba striktně rozlišovat **identitu**, **identifikaci**, **verifikaci**, **autentizaci** a **autorizaci**. Tyto pojmy nejsou synonyma — každý označuje jiný proces s jinou výpočetní složitostí a jinými scénáři využití.

## Identita

Slovo *identita* pochází z latinského **idem** (totéž). Identita je *uniqueness* osoby — to, co ji odlišuje od ostatních.

### Tři druhy faktorů ověření identity

Klasický rámec (taxonomy):

::: svg "Tři faktory ověření identity: něco víme (heslo, PIN), něco máme (token, karta), něco jsme (biometrika). Multi-factor authentication kombinuje 2+."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="30" y="40" width="150" height="130" rx="8"/>
    <rect x="195" y="40" width="150" height="130" rx="8"/>
    <rect x="360" y="40" width="150" height="130" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="105" y="62" font-size="12.5">Něco VÍME</text>
    <text x="105" y="78" font-size="10.5" fill="var(--text-muted)">we know</text>
    <text x="270" y="62" font-size="12.5">Něco MÁME</text>
    <text x="270" y="78" font-size="10.5" fill="var(--text-muted)">we have</text>
    <text x="435" y="62" font-size="12.5">Něco JSME</text>
    <text x="435" y="78" font-size="10.5" fill="var(--text-muted)">we are</text>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10.5">
    <text x="105" y="106">heslo</text>
    <text x="105" y="122">PIN</text>
    <text x="105" y="138">tajné slovo</text>
    <text x="105" y="154">předepsaný postup</text>
    <text x="270" y="106">smart card</text>
    <text x="270" y="122">USB token</text>
    <text x="270" y="138">mobil (TOTP)</text>
    <text x="270" y="154">fyzický klíč</text>
    <text x="435" y="106">otisk prstu</text>
    <text x="435" y="122">obličej</text>
    <text x="435" y="138">duhovka</text>
    <text x="435" y="154">hlas, chůze</text>
  </g>
</svg>
:::

* **Něco víme** (knowledge factor) — tajná informace.
  * Heslo, PIN, tajné tlačítko, předepsaný postup.
  * **Idea:** náhodná a lehce zapamatovatelná informace.
  * **Nebezpečí:** získání nepovolanou osobou (phishing, brute force, shoulder surfing).
* **Něco máme** (possession factor) — fyzický předmět.
  * Klíč, ID karta, smart card (viz kurz BZA), USB token, mobil s TOTP/Push.
  * **Idea:** předmět, který osoba nese.
  * **Nebezpečí:** krádež, ztráta, replikace.
* **Něco jsme** (inherence factor) — biometrický rys.
  * Otisky prstů, obličej, duhovka, hlas, chůze, DNA.
  * **Idea:** *unique* osoba samotná.
  * **Nebezpečí:** spoofing ([[liveness]]), permanent leak (nelze rotovat).

### Multi-factor authentication (MFA)

Kombinace 2+ faktorů z různých kategorií:

* **2FA** = heslo + SMS code = něco víme + něco máme (mobil).
* **Biometric MFA** = otisk prstu + PIN = něco jsme + něco víme.
* **Strong authentication** (eIDAS, PSD2) — minimálně 2 faktory z odlišných kategorií.

Multi-factor *dramaticky* sníží riziko — útočník musí získat **oba** faktory současně.

## Identifikace

**Identifikace** — *"Kdo jsi?"*

* **Porovnání 1:N** — porovnání zjištěného biometric vzorku se **všemi** šablonami v databázi.
* Výstup: identita osoby (nebo *"unknown"*).
* **Praktický příklad:** rozpoznání obličeje v letištních bezpečnostních systémech — obličej cestujícího je porovnán s **databází** podezřelých.

### Komplexnost

* **Computational cost:** $O(N)$ comparisons (pro $N$ osob v databázi).
* **Časová náročnost:** pro $N = 10^6$ a $1\,\text{ms}$ per comparison → $10^3$ sec = 17 min. Vyžaduje *paralelizaci* nebo *indexing*.
* **Chybové míry kombinují FAR a FRR** — pravděpodobnost false match exponenciálně roste s velikostí databáze.

### Aplikace

* **Forenzní** — match latentního otisku z místa činu s databází (AFIS).
* **Hraniční kontrola** — passenger vs. watchlist.
* **Aadhaar (Indie)** — identifikace občanů pro government services.
* **FBI NGI** — federal database.

## Verifikace

**Verifikace** — *"Jsi to ty?"*

* **Porovnání 1:1** — biometrický vzorek je porovnán s **jednou** specifickou šablonou (claimed identity).
* Výstup: *yes* / *no*.
* **Praktický příklad:** odemčení mobilu otiskem prstu — porovnání s uloženým otiskem majitele.

### Komplexnost

* **Computational cost:** $O(1)$ comparison.
* **Časová náročnost:** milisekundy.
* **Chybové míry jsou nezávislé** — FAR / FRR určují *kvalitu* matchingu, nikoli velikost databáze.

### Aplikace

* **Unlock telefonu** — Touch ID, Face ID, Windows Hello.
* **Logon na PC** — fingerprint sensor v notebooku.
* **Bankovní autorizace plateb** — Face ID pro Apple Pay.
* **Voice banking** — voice phone banking.

## Autentizace vs. autorizace

Pojmy *autentizace* a *autorizace* jsou často zaměňované, ale označují *různé* procesy.

### Autentizace

**Potvrzení identity** — proces ověření, *kdo jsi*. Biometrická autentizace = potvrzení identity na základě biologických charakteristik.

* Vstup: nárok identity + důkaz (heslo / biometrický vzorek).
* Výstup: *authenticated* (yes) / *not authenticated* (no).
* Příklad: otisk prstu odpovídá → systém ví, že to je *Petr Novák*.

### Autorizace

**Oprávnění k akci** — proces *po* autentizaci. Určuje, *co* může osoba dělat.

* Vstup: identita + požadovaná akce.
* Výstup: *allowed* / *denied*.
* Příklad: *Petr Novák* (already authenticated) má **roli "admin"**, takže může editovat databázi; ale **nemůže** spustit destruktivní operaci, kterou vyžaduje *role "superadmin"*.

### Příklad — bankovní transakce

1. **Autentizace:** uživatel zadá kartu + PIN. Banka ověří identitu.
2. **Autorizace:** banka zkontroluje, zda *autentizovaná* osoba má *dostatečné* funkcionality (zda má platnou kartu, dostatečný kredit, neporušuje denní limit).
3. **Transakce:** pokud obě OK, transakce proběhne.

**Klíčové:** autentizace bez autorizace nestačí; autorizace bez autentizace je nesmysl.

## Problematika identity v digitálním světě

* **Fyzická identita** — fyzická charakteristika člověka. Tělo, otisky, obličej.
* **Elektronická identita** (eID, digital identity) — *digitální reprezentace* osoby.
  * Účet v IT systému (e-mail, social media, bankovnictví).
  * Veřejný klíč v PKI ([[icao-9303|biometrický pas]], eOP).
  * Decentralized identity (Self-Sovereign Identity, blockchain-based).

### Příklad — útok na elektronickou identitu

* Útočník získá login + heslo k bankovní aplikaci → vystupuje jako majitel účtu.
* Pokud aplikace má 2FA s biometrikou (Face ID), útok je *podstatně obtížnější*.
* Pokud aplikace má jen heslo, útok *triviální* po phishing.

### Příklad — útok na fyzickou identitu

* Útočník udělá *fake fingerprint* z gummy bear (Matsumoto 2002) → odemkne biometrický zámek.
* Fyzická identita stále stejná (osoba je stejná osoba); útok cílí na *biometrický systém*.

### Bezpečnost identity

Útok na identitu má víc *aspektů*:

* **Vzhled** — obličejové rysy, barva očí, struktura pokožky. *Spoofable* deepfake, makeup.
* **Pohyby** — chůze, gestikulace, dynamika pohybů. *Spoofable* AI motion synthesis.
* **Projevy** — emoce, výrazy tváře, rozhodování ve stresových podmínkách. Hardware-detected (FACS, micro-expressions).
* **Behavior** — keystroke, mouse, time-of-day patterns. Continuous authentication.

Žádný *single* aspekt není neporušitelný — proto multimodální systémy.

## Biometrické aplikace identifikace vs. verifikace

| Aplikace | Identifikace? | Verifikace? |
| :--- | :---: | :---: |
| Odemčení telefonu (Touch ID) | — | ✓ |
| Letiště eGate (Schengen) | ✓ | ✓ (1:1 s pasem) |
| Forenzní (latent fingerprint) | ✓ | — |
| Aadhaar enrollment | ✓ | — |
| Aadhaar verification (Sahayata) | — | ✓ |
| FBI watchlist screening | ✓ | — |
| Voice banking | — | ✓ |
| Surveillance (CCTV) | ✓ | — |

Identifikace je *podstatně* obtížnější a chybovější než verifikace; vyžaduje *vyšší* kvalitu biometriky a *robustní* algoritmy.

---

*Zdroj: BIO přednášky 2025/26, BIO 1 — Úvod do biometrických systémů. Externí reference: Jain, A. K., Ross, A., Nandakumar, K.: *Introduction to Biometrics* (Springer 2011), kap. 1; ISO/IEC 24745:2022 *Information security — Biometric information protection*; NIST SP 800-63B *Digital Identity Guidelines: Authentication and Lifecycle Management* (2017) — [PDF](https://pages.nist.gov/800-63-3/sp800-63b.html); eIDAS Regulation (EU) No 910/2014.*
