---
title: Terminologie a CIA triáda
---

# Terminologie bezpečnosti IS a CIA triáda

Bezpečnost informačních systémů (IS) je *ochrana* tří klíčových *vlastností* — důvěrnosti, integrity, dostupnosti. Tato sekce zavádí terminologii, kterou bude celý kurz používat.

## Co je počítačová bezpečnost

Definice (Palmer 1990):

> Ochrana počítačových prostředků proti náhodnému nebo úmyslnému prozrazení důvěrných dat, neoprávněné modifikaci dat nebo programů, zničení dat, software nebo hardware, a neoprávněnému zabránění v použití počítačových prostředků. Také ochrana proti jiným počítačově provedeným kriminálním aktivitám, jako je počítačem spáchaný podvod nebo vydírání.

Tři klíčové pojmy se v této definici opakují: *prozrazení*, *modifikace*, *zničení/odepření*. Z toho vzniká **CIA triáda**.

## CIA triáda

Tři základní cíle bezpečnosti IS:

::: svg "CIA triáda — Confidentiality, Integrity, Availability"
<svg viewBox="0 0 540 206" font-family="ui-sans-serif, system-ui" font-size="11">
  <polygon points="270,30 80,170 460,170" fill="none" stroke="var(--accent)" stroke-width="2"/>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="270" y="22">CIA</text>
    <text x="270" y="50">Confidentiality</text>
    <text x="80" y="190">Availability</text>
    <text x="460" y="190">Integrity</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="270" y="62">důvěrnost</text>
    <text x="80" y="200">dostupnost</text>
    <text x="460" y="200">integrita</text>
  </g>
  <g fill="var(--text)" font-size="10">
    <text x="200" y="100">šifrování</text>
    <text x="200" y="115">přístupová práva</text>
    <text x="320" y="100">hash, MAC</text>
    <text x="320" y="115">digital signatures</text>
    <text x="150" y="150">redundance</text>
    <text x="150" y="162">DoS ochrana</text>
  </g>
</svg>
:::

### Confidentiality — důvěrnost

Ochrana proti *neoprávněnému prozrazení* informace. Tato vlastnost říká, že informaci mohou *číst* jen ti, kdo k tomu mají oprávnění.

Techniky:

- **Šifrování (encryption)** ([[blok-vs-proud]], [[rezimy]]) — data jsou bez klíče (key) nečitelná.
- **Přístupová práva (access control)** — na úrovni operačního systému, databáze i jednotlivých souborů.
- **Fyzická bezpečnost** — uzamčené místnosti, uzamykatelné skříňky.

### Integrity — integrita

Ochrana proti *neoprávněné modifikaci*. Říká, že data jsou *přesně* taková, jaká byla zapsána (žádné nepovolené změny, žádné poškození).

Techniky:

- **Hash funkce (hash function)** ([[hash-funkce]]) — slouží jako „otisk prstu" dat pro detekci změny.
- **MAC/HMAC** ([[mac-hmac]]) — hash s klíčem (keyed hash) pro autentizovanou integritu, tedy ověření, že data nikdo cizí nezměnil.
- **Digitální podpisy (digital signatures)** ([[el-podpis]]) — zajišťují nepopiratelnost (non-repudiation) a integritu.
- **Kontrolní součty a samoopravné kódy (checksum, ECC)** v úložišti — detekují postupné poškození dat (bit-rot).

### Availability — dostupnost

Ochrana proti *neoprávněnému odepření přístupu* k datům nebo službám. Říká, že legitimní uživatelé *mohou* systém používat, kdykoli ho potřebují.

Techniky:

- **Redundance** — RAID, clustering, rozkládání zátěže (load balancing).
- **Zmírnění útoků DoS (DoS mitigation)** — omezování četnosti požadavků (rate limiting), anycast DNS, CDN.
- **Zálohování a obnova po havárii (backup + disaster recovery)**.
- **Plánování kapacit (capacity planning)**.

## Rozšířená triáda

Některé modely rozšiřují CIA o další vlastnosti:

- **Autentizace (authentication)** — ověření identity (kdo přistupuje?).
- **Autorizace (authorization)** — co smí daný subjekt dělat?
- **Zodpovědnost (accountability, neboli auditability)** — kdo udělal co? Zajišťují ji auditní záznamy (audit logs). V AAA tomu odpovídá **Accounting** (zaznamenávání akcí a využití prostředků), které zodpovědnost zajišťuje.
- **Nepopiratelnost (non-repudiation)** — subjekt nemůže popřít, že akci provedl. Dosahuje se jí digitálním podpisem.
- **Soukromí (privacy)** — kontrola nad osobními údaji (GDPR).

Tomu se říká **AAA (Authentication, Authorization, Accounting)** + soukromí (privacy) + nepopiratelnost (non-repudiation).

V praktických standardech (NIST 800-53, ISO 27001) najdete *kombinaci* CIA + AAA.

## Informační systém

Klasická definice IS — 5 komponent:

1. **Hardware** — servery, klienti, sítě.
2. **Software** — operační systémy, aplikace, databáze.
3. **Data** — vlastní informace.
4. **Lidé** — uživatelé, administrátoři, vývojáři.
5. **Procedury** — pravidla, procesy, dokumentace.

Bezpečnost musí pokrývat **všech 5** komponent. Stačí jediná *slabá* (zranitelný software, nezaškolený uživatel, špatná dokumentace) a celý systém je ohrožen.

## Pojmy ve světě bezpečnosti

| Pojem | Anglicky | Co znamená |
| :--- | :--- | :--- |
| Zranitelné místo | Vulnerability | slabina v IS, kterou lze zneužít |
| Hrozba | Threat | okolnost s potenciálem způsobit incident |
| Aktivum | Asset | součást IS s hodnotou (data, hardware, software) |
| Opatření | Control / Measure | snižuje pravděpodobnost incidentu |
| Riziko | Risk | zranitelnost + hrozba → pravděpodobnost incidentu |
| Incident | Incident | skutečně vzniklá bezpečnostní událost |
| Útok | Attack | aktivní pokus o zneužití zranitelnosti |
| Útočník | Attacker | osoba či entita stojící za útokem |

Vztah:

$$
\text{Risk} = f(\text{Vulnerability}, \text{Threat}, \text{Asset value}, \text{Impact})
$$

Konkrétněji ([[risk-analyza]] detaily):

$$
\text{Risk} = \text{Likelihood} \times \text{Impact}
$$

Detaily v [[hrozby-zranitelnosti]].

## Příklad: webserver

- **Aktivum (asset)**: webová aplikace, databáze zákazníků, dostupnost provozu (business uptime).
- **Zranitelnost (vulnerability)**: chyba typu přetečení bufferu (buffer overflow) v obsluze požadavku (handleru) ([[buffer-overflow]]).
- **Hrozba (threat)**: útočník vlastnící zneužití (exploit).
- **Riziko (risk)**: zranitelnost × hrozba × dopad = kompromitace webserveru a krádež dat.
- **Opatření (control)**: WAF (web application firewall), pravidelné záplatování (patching), revize kódu (code review).
- **Zbytkové riziko (residual risk)**: riziko − účinnost opatření. Vždy zbude *nějaké* riziko.

## Tři druhy opatření (controls)

| Druh | Anglicky | Příklad |
| :--- | :--- | :--- |
| Administrativní | „soft controls" | bezpečnostní politika, školení, prověřování osob |
| Technická | „logical controls" | firewall, IDS, šifrování, autentizace |
| Fyzická | physical | zámky, ploty, ostraha |

Detaily v [[controls]].

## Funkce opatření (controls)

Každé opatření plní jednu z těchto funkcí:

- **Preventivní (preventive)** — předchází (zámek, firewall).
- **Detekční (detective)** — odhaluje (auditní záznam, IDS).
- **Nápravná (corrective)** — opravuje (obnova serveru, procedura reakce na incident).
- **Odrazující (deterrent)** — odrazuje (plot, výstražné cedule).
- **Obnovovací (recovery)** — obnovuje (záloha dat, redundance).
- **Kompenzační (compensating)** — náhrada za nemožné preventivní opatření (proxy místo firewallu).

Vyvážená bezpečnost má **všechny typy** — hloubková obrana (defense in depth).

## Defense in depth

Princip: *více vrstev (layers)* ochrany. Útočník musí překonat *všechny* vrstvy.

- **Perimetr (perimeter)** — firewall, IDS, ochrana proti DDoS.
- **Síť (network)** — segmentace, VLAN, interní firewally.
- **Koncový bod (endpoint)** — antivirus, EDR, zpevnění operačního systému (OS hardening).
- **Aplikace (application)** — bezpečné programování (secure coding), WAF, validace vstupů.
- **Data** — šifrování dat v klidu (at rest), šifrování dat při přenosu (in transit), DLP.
- **Identita (identity)** — MFA, RBAC, princip nejmenších oprávnění (least privilege).

Žádná jediná technologie nestačí. Bezpečnost = *systém vrstev*.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=kPPFNrlN3zo" "What is the CIA Triad" "IBM Technology"
:::

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., Ing. Kamil Malinka, Ph.D., FIT VUT v Brně. Externí reference: Stallings, W.: „Computer Security: Principles and Practice" (4th ed., Pearson 2018), §1; ISO/IEC 27000:2018 — Information Security Management Systems Overview; [NIST SP 800-12](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-12r1.pdf) — Introduction to Information Security; Bishop, M.: „Computer Security: Art and Science" (2nd ed., Addison-Wesley 2018), §1.*
