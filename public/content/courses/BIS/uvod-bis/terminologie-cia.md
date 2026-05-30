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
    <text x="200" y="160">redundance</text>
    <text x="320" y="160">DoS ochrana</text>
  </g>
</svg>
:::

### Confidentiality — důvěrnost

Ochrana proti *neoprávněnému prozrazení* informace. Tato vlastnost říká, že informaci mohou *číst* jen ti, kdo k tomu mají oprávnění.

Techniky:

- **Šifrování** ([[blok-vs-proud]], [[rezimy]]) — data nečitelná bez klíče.
- **Přístupová práva** — OS, databáze, soubory.
- **Fyzická bezpečnost** — uzamčené místnosti, lockery.

### Integrity — integrita

Ochrana proti *neoprávněné modifikaci*. Říká, že data jsou *přesně* taková, jaká byla zapsána (žádné nepovolené změny, žádné poškození).

Techniky:

- **Hash funkce** ([[hash-funkce]]) — fingerprint pro detekci změny.
- **MAC/HMAC** ([[mac-hmac]]) — keyed hash pro autentizovanou integritu.
- **Digital signatures** ([[el-podpis]]) — non-repudiation + integrity.
- **Checksum, ECC** v storage — detect bit-rot.

### Availability — dostupnost

Ochrana proti *neoprávněnému odepření přístupu* k datům nebo službám. Říká, že legitimní uživatelé *mohou* používat systém, kdy potřebují.

Techniky:

- **Redundance** — RAID, clustering, load balancing.
- **DoS mitigation** — rate limiting, anycast DNS, CDN.
- **Backup + disaster recovery**.
- **Capacity planning**.

## Rozšířená triáda

Některé modely rozšiřují CIA o další vlastnosti:

- **Authentication** — ověření identity (kdo přistupuje?).
- **Authorization** — co může daný subjekt dělat?
- **Accountability** (auditability) — kdo udělal co? — audit logs. V AAA tomu odpovídá **Accounting** (zaznamenávání akcí/využití prostředků), které accountability zajišťuje.
- **Non-repudiation** — subjekt nemůže popřít, že provedl akci. Pomocí digital signature.
- **Privacy** — kontrola nad osobními údaji (GDPR).

Tomu se říká **AAA (Authentication, Authorization, Accounting)** + privacy + non-repudiation.

V praktických standardech (NIST 800-53, ISO 27001) najdete *kombinaci* CIA + AAA.

## Informační systém

Klasická definice IS — 5 komponent:

1. **Hardware** — servery, klienti, sítě.
2. **Software** — OS, aplikace, databáze.
3. **Data** — vlastní informace.
4. **Lidé** — uživatelé, administrátoři, vývojáři.
5. **Procedury** — pravidla, procesy, dokumentace.

Bezpečnost musí pokrývat **všech 5** komponent. Stačí jedna *slabá* (vulnerable software, nezaškolený uživatel, špatná dokumentace) a celý systém ohrožen.

## Pojmy ve světě bezpečnosti

| Pojem | Anglicky | Co znamená |
| :--- | :--- | :--- |
| Zranitelné místo | Vulnerability | slabina v IS, kterou lze zneužít |
| Hrozba | Threat | okolnost s potenciálem způsobit incident |
| Aktivum | Asset | součást IS s hodnotou (data, hw, sw) |
| Opatření | Control / Measure | redukuje pravděpodobnost incidentu |
| Riziko | Risk | vulnerability + threat → likelihood of incident |
| Incident | Incident | skutečně vzniklá bezpečnostní událost |
| Útok | Attack | aktivní pokus o zneužití vulnerability |
| Útočník | Attacker | osoba/entita za útokem |

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

- **Asset**: webová aplikace, databáze zákazníků, business uptime.
- **Vulnerability**: buffer overflow bug v handleru ([[buffer-overflow]]).
- **Threat**: útočník s exploitem.
- **Risk**: Vulnerability × Threat × Impact = webserver compromise, data theft.
- **Control**: WAF (web application firewall), regular patching, code review.
- **Residual risk**: Risk - effectivness(Control). Vždy zbude *nějaké* riziko.

## Tři druhy controls (opatření)

| Druh | Anglicky | Příklad |
| :--- | :--- | :--- |
| Administrative | „soft controls" | security policy, training, screening |
| Technical | „logical controls" | firewall, IDS, encryption, authentication |
| Physical | physical | locks, fences, security guards |

Detaily v [[controls]].

## Funkcionality controls

Každé opatření má jednu z funkcí:

- **Preventive** — předchází (lock, firewall).
- **Detective** — detekuje (audit log, IDS).
- **Corrective** — opravuje (server backup, IR procedure).
- **Deterrent** — odrazuje (fence, warning signs).
- **Recovery** — obnovuje (data backup, redundance).
- **Compensating** — náhrada za nemožné preventive (proxy místo firewallu).

Vyvážená bezpečnost má **všechny typy** — defense in depth.

## Defense in depth

Princip: *více vrstev* ochrany. Útočník musí překonat *všechny* vrstvy.

- **Perimeter** — firewall, IDS, DDoS protection.
- **Network** — segmentace, VLAN, internal firewalls.
- **Endpoint** — antivirus, EDR, OS hardening.
- **Application** — secure coding, WAF, input validation.
- **Data** — encryption at rest, encryption in transit, DLP.
- **Identity** — MFA, RBAC, least privilege.

Žádná jediná technologie nestačí. Bezpečnost = *systém vrstev*.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., Ing. Kamil Malinka, Ph.D., FIT VUT v Brně. Externí reference: Stallings, W.: „Computer Security: Principles and Practice" (4th ed., Pearson 2018), §1; ISO/IEC 27000:2018 — Information Security Management Systems Overview; [NIST SP 800-12](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-12r1.pdf) — Introduction to Information Security; Bishop, M.: „Computer Security: Art and Science" (2nd ed., Addison-Wesley 2018), §1.*
