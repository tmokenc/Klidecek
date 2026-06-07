---
title: Bezpečnost biometrického pasu
---

# Bezpečnost biometrického pasu

Bezpečnostní architektura biometrického pasu je *vícevrstvá*. ICAO 9303 specifikuje protokoly **PA, BAC, AA a EAC**, které dohromady zajišťují autenticitu, integritu, ochranu proti tajnému odečtení (anti-skimming), ochranu proti klonování (anti-cloning) a řízení přístupu (access control). Pochopení této architektury je nezbytné pro práci s eMRTD (elektronický strojově čitelný cestovní doklad).

## Architektura bezpečnosti

::: svg "Vrstvy bezpečnosti: PA (integrity), BAC/PACE (access), AA (anti-cloning), EAC (biometric protection)."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="60" y="40" width="420" height="30" rx="4"/>
    <rect x="60" y="80" width="420" height="30" rx="4"/>
    <rect x="60" y="120" width="420" height="30" rx="4"/>
    <rect x="60" y="160" width="420" height="30" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="60" font-size="12">PA — Passive Authentication (data integrity)</text>
    <text x="270" y="100" font-size="12">BAC / PACE — Access Control (prevent skimming)</text>
    <text x="270" y="140" font-size="12">AA — Active Authentication (anti-cloning)</text>
    <text x="270" y="180" font-size="12">EAC — Extended Access Control (biometric protection)</text>
  </g>
</svg>
:::

## PA — pasivní autentizace (Passive Authentication)

**Cíl:** ověřit, že data v pasu jsou *autentická* a *nezměněná*.

### Princip

* **Hierarchie PKI (PKI hierarchy):**
  * **CSCA** (Country Signing Certificate Authority) — kořenová (*root*) autorita každé země.
  * **DSC** (Document Signing Certificate) — *krátkodobý* certifikát (3–6 měsíců).
* CSCA podepisuje DSC.
* DSC podepisuje **EF.SOD** (seznam hashů všech datových skupin DG).

### Verifikace

1. **Čtečka přečte** EF.SOD.
2. Ověří podpis DSC pomocí veřejného klíče DSC.
3. Ověří certifikát DSC vůči kořenu CSCA (ten musí být v PKD).
4. Spočítá hash každé datové skupiny (DG) a porovná jej s hodnotou v EF.SOD.

### ICAO PKD (Public Key Directory)

* Centrální úložiště certifikátů CSCA.
* Členské země do něj nahrávají své certifikáty CSCA.
* Terminály na hraniční kontrole je pravidelně stahují.
* **CRL** (Certificate Revocation List, seznam odvolaných certifikátů) — aktualizován denně.

### Limity

* **PA nedokáže detekovat klonování** — útočník (attacker) může zkopírovat všechna data (DG + SOD) do *jiného* čipu a PA stejně projde.
* **Ochrana proti klonování (anti-cloning)** vyžaduje *AA*.

## BAC — základní řízení přístupu (Basic Access Control)

**Cíl:** zabránit *naivnímu* tajnému odečtení dat (skimming).

### Princip

* Čtečka musí prokázat, že **vidí MRZ** (strojově čitelnou zónu, která je *fyzicky* vytištěna na pasu).
* Z hashe MRZ se odvodí dva 3DES klíče: $K_{ENC}$ a $K_{MAC}$.
* Probíhá třícestná vzájemná autentizace (mutual authentication) pomocí 3DES.
* Dohodnou se relační (session) klíče.
* Veškerá komunikace s čipem je následně šifrovaná a opatřená MAC (zabezpečené zasílání zpráv, Secure Messaging).

### Slabost

* **Entropie MRZ:** teoreticky ~56 bitů (číslo pasu, datum narození, datum platnosti, kontrolní číslice).
* **Praktická entropie:** *mnohem nižší* (čísla pasů bývají sekvenční, datum narození i platnosti lze odhadnout z věku).
* **Offline útok hrubou silou:** pokud útočník zachytí (odposlechne) zašifrovaný provoz, může MRZ prolomit hrubou silou.
* **V nejhorším případě 30–40 bitů** — řádově hodiny na GPU.

### Obrana

* **BAC je zastaralý (legacy)** — v moderních e-pasech jej nahrazuje PACE.
* Stále je ale **vyžadován** kvůli zpětné kompatibilitě (starší čtečky).

## PACE — Password Authenticated Connection Establishment

**Cíl:** modernější náhrada BAC.

### Princip

* **Dohoda klíčů metodou Diffie-Hellman** s *heslem* odvozeným z MRZ nebo CAN.
* **CAN** (Card Access Number) — šestimístné číslo vytištěné na pasu.
* **Brainpool křivky** (např. brainpoolP256r1) — preferované.
* **AES-128 + AES-CMAC** pro zabezpečené zasílání zpráv (Secure Messaging).

### Vlastnosti

* **Dopředné utajení (forward secrecy)** — i kdyby MRZ uniklo, dřívější relace zůstanou v bezpečí.
* **Silná dohoda klíčů** — DH klíče se vytvářejí pro každou relaci zvlášť.
* **Silnější než BAC** i při hesle s nízkou entropií.

### Rozšíření

* **Německo 2009** — první občanské průkazy (eID) s PACE.
* **Nařízení EU 2014** — všechny nové e-pasy podporují PACE.
* **Zpětná kompatibilita** — podporují zároveň i BAC.

## AA — aktivní autentizace (Active Authentication)

**Cíl:** zabránit *klonování* pasu.

### Princip

* V pasu je uložen **soukromý klíč** v čipu odolném proti neoprávněné manipulaci (nikdy se neexportuje ven).
* V DG15 je uložen **odpovídající veřejný klíč**, podepsaný DSC.
* **Výzva–odpověď (challenge-response):**
  * Čtečka vygeneruje náhodný nonce $r_R$.
  * Pas podepíše $h(r_R \mathbin\Vert r_P)$ soukromým klíčem, kde $r_P$ je náhodný nonce pasu.
  * Čtečka ověří podpis pomocí veřejného klíče z DG15.

### Vlastnost

* Klon, který má jen *kopii dat*, **podpis nevytvoří** — *nemá totiž soukromý klíč*.
* Klonování by vyžadovalo fyzické vytažení klíče z čipu (což je velmi obtížné).

### Rozšíření

* **V EU povinná** od roku 2009 (druhá generace schengenských pasů).
* **USA AA NEvyžaduje** — spoléhají na PA, vizuální kontrolu a imigrační databázi.
* **Česká republika:** povinná od roku 2009.

### Slabost

* **Útok přeposláním (relay attack)** — útočník přeposílá komunikaci mezi vzdáleným pasem a vzdálenou čtečkou.
* **Zmírnění:** PACE + zabezpečené zasílání zpráv (SM) s časovými omezeními.

## EAC — rozšířené řízení přístupu (Extended Access Control)

**Cíl:** chránit *citlivá* biometrická data (DG3 otisky prstů, DG4 duhovka).

### Komponenty

#### Autentizace terminálu (Terminal Authentication, TA)

* Terminál musí prokázat *oprávnění* ke čtení biometrik.
* Terminál má *certifikát* podepsaný **ověřovatelem dokladu (Document Verifier, DV)**.
* DV je podepsán autoritou *Country Verifying CA (CVCA)*.
* Pas ověří celý řetězec certifikátů.

#### Autentizace čipu (Chip Authentication, CA)

* Silnější verze AA spojená s výměnou klíčů.
* Pas a čtečka ustanoví *nové* relační klíče (oddělené od PACE).
* Pro data DG3 a DG4 pak probíhá šifrovaná komunikace.

### Rozšíření

* **V EU povinná** pro biometrická data (DG3, DG4).
* **Standard:** BSI TR-03110.
* **Česká republika:** pro otisky prstů implementuje CA + TA.

### Model autorizace

* **Každý terminál** má konkrétní *oprávnění* (číst pouze DG3, číst vše atd.).
* **Certifikáty** specifikují přístupová práva.
* **Časově omezené** — certifikáty terminálů typicky platí 1 týden.

::: viz epassport-handshake "Krok po kroku přes BAC/PACE → PA → AA → EAC; vidíte, kterou DG která vrstva zpřístupní."
:::

::: viz bac-pace-keys "Entropie MRZ a brute-force time pro BAC vs PACE; přepínáte, co útočník zná."
:::

## Útoky na biometrické pasy

### Prolomení BAC hrubou silou (Laurie 2006)

[Adam Laurie](https://www.dailytech.com/Cracking+the+BAC+Algorithm+Used+to+Secure+ePassports/article14127.htm):

* Předvedl tajné odečtení (skim) a prolomení MRZ hrubou silou na pasech USA.
* Sekvenční číslování → ~30 bitů entropie.
* **Řádově hodiny na běžném hardwaru.**

Zmírnění: čísla pasů by měla být náhodná; PACE nahrazuje BAC.

### Klonování (Halderman a kol. 2008)

* Předvedli naklonování pasu USA bez AA.
* Stačí zkopírovat všechny datové skupiny (DG) a SOD do nového čipu.
* PA projde.
* **Žádné AA = žádná ochrana proti klonování.**

Zmírnění: implementace AA (v EU od roku 2009).

### Útok přeposláním (relay attack)

* Útok typu man-in-the-middle (MITM), který přeposílá komunikaci mezi pasem a čtečkou.
* Poráží AA (pas podepíše jakoukoli výzvu, která mu je přeposlána).

Zmírnění:
* **Omezování vzdálenosti (distance bounding)** (předmět výzkumu).
* **Časová omezení** v PACE.

### Útoky postranními kanály (side-channel attacks)

* **DPA** (diferenciální výkonová analýza) na čip během AA (operace podepisování).
* Předvedeno na některých starších generacích čipů.

Zmírnění: kryptografie odolná vůči DPA (moderní čipové karty).

### Faradayova klec / RF stínění

* Blokuje čtení na dálku.
* **Pouzdra blokující RFID** pro paranoidní cestovatele.
* **Doporučováno** některými zastánci ochrany soukromí.

## Šifrovací algoritmy v pasu

### Asymetrické

* **RSA-2048** nebo **RSA-3072** — běžné.
* **ECDSA P-256, P-384** — stále častější.
* **Brainpool křivky** — preference EU (P256r1, P384r1).

### Symetrické

* **3DES** (zastaralý, BAC).
* **AES-128, AES-256** (PACE, EAC).

### Hash

* **SHA-1** (zastaralý).
* **SHA-256** (současný standard).
* **SHA-384** (některá EAC).

### Postkvantová kryptografie?

* V současnosti v pasech *žádná* postkvantová (PQ) kryptografie není.
* Budoucí migrace se plánuje (diskuze v ICAO od roku 2024).

## Průchod elektronickou bránou (eGate)

```
1. Cestující vloží pas.
2. Scanner OCR → MRZ.
3. PACE: derive password z MRZ, DH exchange, session keys.
4. PA: read SOD, verify signature chain, verify DG hashes.
5. AA (if supported): challenge-response, verify chip signature.
6. EAC TA/CA: if reading DG3, authenticate terminal + chip.
7. Read DG1, DG2 (basic biometric data).
8. Capture live face image.
9. Face match: stored DG2 ↔ live capture.
10. Decision: open gate or referee.
```

## Praktická bezpečnost

### Pro cestovatele

* **Použijte pouzdro blokující RFID**, pokud se obáváte odečtení na dálku.
* **Neukazujte MRZ** veřejně (např. zveřejněním fotografie pasu online s viditelnou MRZ).
* **Nahlaste kompromitovaný pas** orgánu, který jej vydal.

### Pro vydávající země

* **Silné zabezpečení CSCA** — offline kořenová CA, řízení principem M z N.
* **Pravidelné aktualizace CRL.**
* **PACE + AA + EAC** pro nové pasy.
* **Moderní algoritmy** (AES, ECDSA, SHA-256).
* **Plánování postkvantové migrace.**

### Pro výrobce čteček

* **Synchronizace PKD** — denně.
* **Kontrola CRL.**
* **Podpora PACE + AA + EAC.**
* **Hardwarový bezpečnostní modul (Hardware Security Module)** pro certifikáty terminálu.

## Limity bezpečnosti

* **Důvěra v CSCA** — zkorumpovaná vydávající země = kompromitované pasy.
* **Distribuce PKD** — ne všechny země se účastní v plné míře.
* **Fyzický pas** je stále primární — čip je *doplněk*, ne *náhrada*.
* **Lidská kontrola** je na hranici stále zásadní (vizuální ověření totožnosti).

## Trendy 2025

* **Mobilní cestovní doklady** — pas v chytrém telefonu.
* **EU EUDI Wallet** — digitální identita s biometrií.
* **Kvantově odolné** podpisy v budoucnu.
* **Přeshraniční výměna biometrik** — rozšíření Prüm, EES.

---

*Zdroj: BIO přednášky 2025/26, BIO 11 — Biometrické pasy (Goldmann). Externí reference: ICAO Doc 9303 — *Machine Readable Travel Documents*, Part 11 (Security mechanisms); BSI TR-03110 *Advanced Security Mechanisms for Machine Readable Travel Documents*; Laurie, A.: *RFIDIOt — RFID Hacker's Toolkit*; Halderman, J. A. et al.: *Counterfeiting Vulnerabilities in the Machine-Readable Travel Document (MRTD)*.*
