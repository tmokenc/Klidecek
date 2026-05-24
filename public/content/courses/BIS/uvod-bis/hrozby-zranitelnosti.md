---
title: Hrozby, zranitelnosti a aktiva
---

# Hrozby, zranitelnosti a aktiva — komponenty rizika

Riziko v IS *vzniká* z kombinace tří entit: **zranitelnosti** (kde lze udeřit), **hrozby** (kdo nebo co udeří) a **aktiva** (na čem nám záleží). Tato sekce klasifikuje tyto entity a ukazuje, jak je *systematicky* identifikovat.

## Hrozba (threat)

Hrozba = *okolnost* nebo *agent*, který má potenciál způsobit nežádoucí událost.

### Klasifikace podle původu

| Typ | Příklad |
| :--- | :--- |
| Přírodní | povodeň, požár, zemětřesení, výpadek el. proudu |
| Neúmyslné lidské | chyba operátora, omylem smazaný soubor |
| Úmyslné lidské | hacker, insider attack, sabotage |
| Technické | hardware failure, software bug |
| Externí | malware, DDoS, phishing |
| Interní | nespokojený zaměstnanec, sociální inženýrství |

### Threat actors (útočníci)

Identifikace *kdo* potenciálně útočí:

- **Script kiddies** — amateurs s hotovými exploity. Cíl: prestige.
- **Hacktivists** — politicky motivovaní (Anonymous). Cíl: vyjádření.
- **Cyber criminals** — organizovaný zločin. Cíl: peníze (ransomware, krádež dat).
- **Nation-state actors (APT)** — vládní/vojenské skupiny (China APT1, Russia Fancy Bear). Cíl: špionáž, sabotáž.
- **Insiders** — zaměstnanci/dodavatelé s legitimním přístupem. Cíl: pomsta, peníze.
- **Competitors** — průmyslová špionáž.

Sophistikace + zdroje rostou ve výše uvedeném pořadí. APT (Advanced Persistent Threat) je *vrcholová* hrozba — měsíce nepozorované sondování + custom malware.

### MITRE ATT&CK framework

[MITRE ATT&CK](https://attack.mitre.org/) — taxonomie *taktik* a *technik* útočníků. 14 taktik (Initial Access, Execution, Persistence, ..., Exfiltration), pod každou 10-20 technik.

Použití: defenders mapují své controls k ATT&CK techniques → vědí, *které* techniques umí detekovat / blokovat → zjistí mezery.

## Zranitelnost (vulnerability)

Vulnerability = *slabina* v IS, která může být zneužita hrozbou.

### Klasifikace podle umístění

| Umístění | Příklad |
| :--- | :--- |
| Hardware | unpatched firmware, side channel, fault injection |
| Software | buffer overflow ([[buffer-overflow]]), SQL injection ([[injekce-utoky]]) |
| Configuration | default passwords, open ports, weak crypto |
| Procedural | žádná policy, slabé školení |
| Human | phishing susceptibility ([[social-engineering]]) |

### CVE — Common Vulnerabilities and Exposures

Veřejná databáze známých vulnerability. Formát: `CVE-YYYY-NNNN`.

Příklady:

- CVE-2014-0160 Heartbleed (OpenSSL).
- CVE-2017-0144 EternalBlue (Windows SMB).
- CVE-2021-44228 Log4Shell (Apache Log4j).

Každé CVE má **CVSS score** (Common Vulnerability Scoring System) 0-10:

- 0.0-3.9 Low.
- 4.0-6.9 Medium.
- 7.0-8.9 High.
- 9.0-10.0 Critical.

CVSS computed from base metrics (exploitability, impact, scope) + temporal (exploit availability) + environmental (asset value).

### CWE — Common Weakness Enumeration

Taxonomie *typů* vulnerability (vs. konkrétní instances v CVE). Příklady:

- CWE-119 Buffer overflow.
- CWE-89 SQL injection.
- CWE-352 CSRF.
- CWE-79 XSS.

CWE Top 25 je *žebříček* nejčastějších weakness typů. Aktualizován ročně.

## Aktivum (asset)

Aktivum = *cokoli, co má hodnotu* pro organizaci.

### Klasifikace

| Typ | Příklad | Hodnota |
| :--- | :--- | :--- |
| Data | zákaznická databáze | $$$$$ |
| Software | proprietary application | $$ |
| Hardware | server, network equipment | $$$ |
| Reputation | brand, customer trust | $$$$$ |
| People | klíčoví zaměstnanci, know-how | $$$$ |
| Continuity | uptime, service availability | $$$$ |

Pro každé aktivum: *jakou škodu* by způsobila kompromitace?

### Information classification

Standardní klasifikace dat (vojenská inspiruje civilní):

| Úroveň | Příklad |
| :--- | :--- |
| Public | marketing materials, web FAQ |
| Internal | zaměstnanecké adresáře |
| Confidential | finanční reporty, payroll |
| Secret | trade secrets, R&D |
| Top secret | strategic plans, national security |

Každá úroveň má *odpovídající* controls — encryption strength, access control, handling procedures.

## Riziko

Riziko = kombinace tří výše:

$$
\text{Risk} = \text{Likelihood} \times \text{Impact}
$$

### Likelihood

Pravděpodobnost, že hrozba zneužije vulnerability:

- High — zranitelnost veřejně známá + exploit existuje + threat actor motivovaný.
- Medium — zranitelnost známá, exploit obtížný, motivace nejasná.
- Low — zranitelnost teoretická, žádný známý exploit.

### Impact

Kolik škody udělá, pokud incident nastane:

- High — kompromitace celé organizace, ztráta business.
- Medium — kompromitace části systému, financial loss.
- Low — minor inconvenience, rychle opravitelné.

### Risk matrix

| | Impact: Low | Impact: Medium | Impact: High |
| :--- | :---: | :---: | :---: |
| Likelihood: High | Medium | High | **Critical** |
| Likelihood: Medium | Low | Medium | High |
| Likelihood: Low | Trivial | Low | Medium |

Risk management ([[risk-analyza]]) prioritizuje *high* a *critical* rizika.

## Risk treatment

Pro každé identifikované riziko 4 možnosti:

1. **Mitigate (snížit)** — implement controls, reduce likelihood or impact.
2. **Transfer (přenést)** — insurance, outsource.
3. **Accept (akceptovat)** — riziko příliš nízké nebo cost too high.
4. **Avoid (vyhnout se)** — discontinue activity.

Důležité: *vždy zbyde* residual risk. Cíl není 0 % riziko (nemožné), ale *akceptovatelná* úroveň.

## Threat modeling

Systematický přístup k identifikaci hrozeb pro konkrétní systém. Populární frameworks:

- **STRIDE** (Microsoft) — Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege.
- **PASTA** (Process for Attack Simulation and Threat Analysis).
- **OCTAVE** (Operationally Critical Threat, Asset, and Vulnerability Evaluation).

Process:

1. Decompose system — DFD diagram, trust boundaries.
2. Identify threats — for each component apply STRIDE.
3. Rate threats — DREAD scoring (Damage, Reproducibility, Exploitability, Affected users, Discoverability).
4. Mitigate — design controls.

Threat modeling se *má* dělat v *design phase*, ne po deployment.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: NIST SP 800-30 — Guide for Conducting Risk Assessments ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-30r1.pdf)); ISO/IEC 27005:2022 — Information Security Risk Management; [MITRE ATT&CK Framework](https://attack.mitre.org/); [CVE Database](https://cve.mitre.org/); [CWE Top 25](https://cwe.mitre.org/top25/); Shostack, A.: „Threat Modeling: Designing for Security" (Wiley 2014).*
