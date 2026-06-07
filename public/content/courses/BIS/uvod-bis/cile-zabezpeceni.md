---
title: Cíle bezpečnosti — CIA + AAA + nepopiratelnost
---

# Cíle bezpečnosti — rozšíření CIA o AAA + soukromí

CIA triáda ([[terminologie-cia]]) je *základ*, ale bezpečnost moderních informačních systémů cílí na *více* vlastností: **AAA** (authentication, authorization, accounting), **nepopiratelnost** (non-repudiation) a **soukromí** (privacy). Tato sekce shrnuje *celý* katalog cílů, o jejichž dosažení BIS usiluje.

## CIA — připomenutí

- **Confidentiality** — důvěrnost, šifrování (encryption) a řízení přístupu (access control).
- **Integrity** — integrita, hash a digitální podpis (signature).
- **Availability** — dostupnost, redundance a ochrana proti DDoS útokům.

## AAA — Authentication, Authorization, Accounting

V síťovém světě (RADIUS, TACACS+, Kerberos) označuje AAA tři po sobě jdoucí kroky při přístupu.

### Authentication (autentizace)

*Kdo jsi?* Subjekt prokáže svou identitu.

Faktory:

- **Něco, co znáš** (something you know) — heslo, PIN, tajná odpověď.
- **Něco, co máš** (something you have) — čipová karta, hardwarový token, mobil.
- **Něco, čím jsi** (something you are) — biometrie (otisk prstu, obličej, duhovka).
- **Někde, kde jsi** (somewhere you are) — geografická poloha, rozsah IP adres.
- **Něco, co děláš** (something you do) — dynamika psaní na klávesnici, způsob chůze.

**Vícefaktorová autentizace (multi-factor authentication, MFA)** kombinuje dva a více faktorů z různých kategorií. Typicky jde o heslo plus SMS, TOTP nebo U2F.

### Authorization (autorizace)

*Co můžeš dělat?* Po autentizaci systém rozhodne, *jaké* operace má subjekt povoleny.

Modely:

- **DAC** (Discretionary Access Control) — práva nastavuje vlastník objektu.
- **MAC** (Mandatory Access Control) — systém vynucuje bezpečnostní značky (labels).
- **RBAC** (Role-Based Access Control) — práva se přidělují přes role.
- **ABAC** (Attribute-Based Access Control) — práva se přidělují přes atributy.

Podrobnosti najdeš v [[dac-mac]] a [[rbac-abac]].

### Accounting (auditování)

*Co jsi udělal?* Systém *zaznamenává* akce uživatelů — do log souborů a auditních záznamů (audit trail).

Použití:

- **Forenzní analýza** (forensics) — vyšetřování incidentu.
- **Soulad s předpisy** (compliance) — regulatorní požadavky.
- **Účtování** (billing) — služby placené podle využití.
- **Detekce anomálií** (anomaly detection) — neobvyklé chování může signalizovat potenciální incident.

GDPR vyžaduje auditování přístupů k osobním údajům.

## Nepopiratelnost (non-repudiation)

Subjekt *nemůže popřít*, že provedl danou akci.

Klasickým příkladem je digitální podpis ([[el-podpis]]). Pokud Alice podepsala dokument svým soukromým klíčem (private key), *nemůže tvrdit*, že to nebyla ona — soukromý klíč zná jen ona.

Bez nepopiratelnosti by mohlo dojít k těmto situacím:

- Bob: „Já jsem ten převod nedělal!" → banka nemůže prokázat opak.
- Alice: „Já jsem tu smlouvu nepodepsala!" → soud nemůže potvrdit, že ano.

Nepopiratelnost je *právním* požadavkem na elektronické dokumenty (nařízení eIDAS v EU).

Mechanismy:

- **Digitální podpis** (digital signature) — RSA, ECDSA, EdDSA.
- **Důvěryhodné časové razítko** (trusted timestamp) — důkaz, *kdy* podpis vznikl.
- **Notarizovaný záznam** (notarized log) — akci zaznamená třetí strana.

## Soukromí (privacy)

Kontrola jednotlivce nad jeho vlastními osobními údaji.

Důvěrnost (confidentiality) není totéž co soukromí (privacy). Důvěrnost znamená, že data nečte nikdo neoprávněný. Soukromí jde *dál* — je to kontrola nad tím, *kdo*, *kdy* a *za jakým účelem* data zpracovává.

Principy soukromí (Privacy by Design, Ann Cavoukian 2009):

1. **Proaktivně, ne reaktivně** (proactive not reactive) — soukromí od začátku, ne jako dodatečná vrstva.
2. **Soukromí jako výchozí nastavení** (privacy as default).
3. **Soukromí zabudované do návrhu** (privacy embedded into design).
4. **Plná funkčnost** (full functionality) — soukromí *i* využitelnost, nejde o hru s nulovým součtem.
5. **Zabezpečení po celou dobu životního cyklu** (end-to-end security).
6. **Viditelnost a transparentnost** (visibility and transparency).
7. **Respekt k soukromí uživatele** (respect for user privacy).

GDPR (EU 2018) reguluje soukromí v EU. Klíčové požadavky:

- Zákonný základ zpracování (souhlas, smlouva, právní povinnost, ...).
- Minimalizace dat (data minimization).
- Právo na přístup, opravu a výmaz (right to be forgotten).
- Posouzení vlivu na ochranu osobních údajů (Data Protection Impact Assessment).
- Povinné hlášení narušení bezpečnosti dat (breach notification) do 72 hodin.

Podrobnosti najdeš v [[gdpr-nukib]].

## Auditability (kontrolovatelnost)

Schopnost rekonstruovat, *co se stalo*. Souvisí s odpovědností (accountability), ale je širší — týká se i auditu *bezpečnostních opatření* (controls), tedy zda jsou skutečně implementována.

Auditní zdroje:

- **Systémové logy** (system logs) — události jádra (kernel events).
- **Aplikační logy** (application logs) — akce uživatelů.
- **Síťové logy** (network logs) — záznamy o tocích dat.
- **Databázové logy** (database logs) — operace DML/DDL.

Systém SIEM (Security Information and Event Management, [[siem-monitoring]]) auditní data konsoliduje a koreluje.

## Důvěra (trust)

Velmi rozšířený, ale obtížně definovatelný pojem. Zhruba jde o *vědomé spoléhání* na nějakou entitu.

Architektura nulové důvěry (Zero Trust architecture, NIST SP 800-207, 2020) stojí na zásadě „nikdy nedůvěřuj, vždy ověřuj" (never trust, always verify). Odmítá tradiční ochranu perimetru (perimeter security), podle níž je vše uvnitř důvěryhodné — ověřuje se *každý* požadavek (request) bez ohledu na jeho původ.

## Odolnost (resilience)

Schopnost systému *odolat* útokům a *rychle se z nich zotavit*.

Liší se od důvěrnosti, integrity i dostupnosti — řeší, *jak rychle* se systém *vrátí* do normálního stavu po incidentu.

Souvisí s obnovou po havárii (disaster recovery) a plánováním kontinuity podnikání (business continuity planning).

## Cíle vs. realita — praktické kompromisy

V praxi spolu tyto cíle *soupeří*:

- **Bezpečnost vs. použitelnost** (security vs. usability) — silnější bezpečnost znamená horší uživatelský zážitek. MFA situaci zlepšuje, ale uživatele obtěžuje.
- **Soukromí vs. kontrolovatelnost** (privacy vs. auditability) — máme logy anonymizovat? Forenzní analýza ale potřebuje detail.
- **Dostupnost vs. důvěrnost** (availability vs. confidentiality) — failover replikuje data na jiné servery, čímž rozšiřuje útočnou plochu.
- **Náklady vs. riziko** (cost vs. risk) — dokonalá bezpečnost je drahá. Je třeba akceptovat určité zbytkové riziko (residual risk).

Je to manažerské rozhodnutí: kde leží *přiměřená* úroveň. Nikdy nedosáhneme 100 %.

## ITIL a bezpečnost

ITIL (IT Infrastructure Library) — soubor osvědčených postupů pro řízení IT služeb (IT service management). Bezpečnost je jen jedním z mnoha procesů.

ISO/IEC 27001 ([[iso-27000]]) — *standard* pro řízení bezpečnosti. Cílí na *systematický* a *měřitelný* přístup.

NIST CSF ([[nist-csf]]) — určený pro státní správu USA i pro soukromý sektor. Má 5 funkcí: Identify (identifikace), Protect (ochrana), Detect (detekce), Respond (reakce) a Recover (obnova).

## Systematický přístup k bezpečnosti IS

Klíčové činnosti:

- Identifikovat hrozby (threats), zranitelnosti (vulnerabilities) a aktiva.
- Implementovat opatření (controls) — administrativní, technická a fyzická.
- Sestavit bezpečnostní politiku (security policy).
- Detekovat incidenty a reagovat na ně.
- Provádět audit a zajišťovat soulad s předpisy.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., Ing. Kamil Malinka, Ph.D., FIT VUT v Brně. Externí reference: Stallings, W.: „Computer Security: Principles and Practice" (4th ed., Pearson 2018), §1; Anderson, R.: „Security Engineering" (3rd ed., Wiley 2020), §1; NIST SP 800-207 — Zero Trust Architecture; Cavoukian, A.: „Privacy by Design — The 7 Foundational Principles" (2009, [PDF](https://iapp.org/media/pdf/resource_center/pbd_implement_7found_principles.pdf)); [GDPR Official Text](https://gdpr-info.eu/).*
