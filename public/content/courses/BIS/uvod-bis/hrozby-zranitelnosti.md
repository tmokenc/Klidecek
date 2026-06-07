---
title: Hrozby, zranitelnosti a aktiva
---

# Hrozby, zranitelnosti a aktiva — komponenty rizika

Riziko v IS *vzniká* z kombinace tří entit: **zranitelnosti** (kde lze udeřit), **hrozby** (kdo nebo co udeří) a **aktiva** (na čem nám záleží). Tato sekce uvedené entity klasifikuje a ukazuje, jak je *systematicky* identifikovat.

## Hrozba (threat)

Hrozba (threat) je *okolnost* nebo *agent*, který má potenciál způsobit nežádoucí událost.

### Klasifikace podle původu

| Typ | Příklad |
| :--- | :--- |
| Přírodní | povodeň, požár, zemětřesení, výpadek el. proudu |
| Neúmyslné lidské | chyba operátora, omylem smazaný soubor |
| Úmyslné lidské | hacker, útok zevnitř (insider attack), sabotáž |
| Technické | selhání hardwaru, softwarová chyba (bug) |
| Externí | malware, DDoS, phishing |
| Interní | nespokojený zaměstnanec, sociální inženýrství |

### Útočníci (threat actors)

Identifikace toho, *kdo* potenciálně útočí:

- **Script kiddies** — amatéři s hotovými zneužitími (exploit). Cíl: prestiž.
- **Hacktivisté (hacktivists)** — politicky motivovaní (Anonymous). Cíl: vyjádření postoje.
- **Kyberzločinci (cyber criminals)** — organizovaný zločin. Cíl: peníze (ransomware, krádež dat).
- **Státem podporovaní útočníci (nation-state actors, APT)** — vládní či vojenské skupiny (China APT1, Russia Fancy Bear). Cíl: špionáž, sabotáž.
- **Vnitřní útočníci (insiders)** — zaměstnanci či dodavatelé s legitimním přístupem. Cíl: pomsta, peníze.
- **Konkurenti (competitors)** — průmyslová špionáž.

Vyspělost (sophistication) i dostupné zdroje rostou ve výše uvedeném pořadí. APT (Advanced Persistent Threat) je *vrcholová* hrozba — měsíce nepozorovaného sondování a šitý malware na míru (custom malware).

### Framework MITRE ATT&CK

[MITRE ATT&CK](https://attack.mitre.org/) je taxonomie *taktik* a *technik* útočníků. Obsahuje 14 taktik (Initial Access, Execution, Persistence, …, Exfiltration) a pod každou z nich 10–20 technik.

Použití: obránci (defenders) mapují svá protiopatření (controls) na techniky ATT&CK, takže vědí, *které* techniky umějí detekovat či blokovat, a tím odhalí slabá místa.

## Zranitelnost (vulnerability)

Zranitelnost (vulnerability) je *slabina* v IS, kterou může hrozba zneužít.

### Klasifikace podle umístění

| Umístění | Příklad |
| :--- | :--- |
| Hardware | nezáplatovaný firmware, postranní kanál (side channel), vstřikování chyb (fault injection) |
| Software | přetečení bufferu (buffer overflow) ([[buffer-overflow]]), SQL injection ([[injekce-utoky]]) |
| Konfigurace | výchozí hesla, otevřené porty, slabá kryptografie |
| Procedurální | žádná bezpečnostní politika (policy), slabé školení |
| Lidská | náchylnost k phishingu ([[social-engineering]]) |

### CVE — Common Vulnerabilities and Exposures

Veřejná databáze známých zranitelností. Formát: `CVE-RRRR-NNNN…` (rok + pořadové číslo o min. 4 číslicích, od r. 2014 i delší — viz CVE-2021-44228).

Příklady:

- CVE-2014-0160 Heartbleed (OpenSSL).
- CVE-2017-0144 EternalBlue (Windows SMB).
- CVE-2021-44228 Log4Shell (Apache Log4j).

Každé CVE má **CVSS skóre** (Common Vulnerability Scoring System) v rozsahu 0–10:

- 0.0–3.9 nízké (Low).
- 4.0–6.9 střední (Medium).
- 7.0–8.9 vysoké (High).
- 9.0–10.0 kritické (Critical).

CVSS se počítá ze základních metrik (zneužitelnost, dopad, rozsah) plus temporálních (dostupnost zneužití) a environmentálních (hodnota aktiva).

### CWE — Common Weakness Enumeration

Taxonomie *typů* zranitelností (oproti konkrétním instancím v CVE). Příklady:

- CWE-119 přetečení bufferu (buffer overflow).
- CWE-89 SQL injection.
- CWE-352 CSRF.
- CWE-79 XSS.

CWE Top 25 je *žebříček* nejčastějších typů slabin (weakness). Aktualizuje se ročně.

## Aktivum (asset)

Aktivum (asset) je *cokoli, co má pro organizaci hodnotu*.

### Klasifikace

| Typ | Příklad | Hodnota |
| :--- | :--- | :--- |
| Data | zákaznická databáze | $$$$$ |
| Software | proprietární aplikace | $$ |
| Hardware | server, síťové prvky | $$$ |
| Reputace | značka, důvěra zákazníků | $$$$$ |
| Lidé | klíčoví zaměstnanci, know-how | $$$$ |
| Kontinuita | provozuschopnost (uptime), dostupnost služby | $$$$ |

Pro každé aktivum si položíme otázku: *jakou škodu* by způsobila jeho kompromitace?

### Klasifikace informací (information classification)

Standardní klasifikace dat (vojenská inspiruje civilní):

| Úroveň | Příklad |
| :--- | :--- |
| Veřejné (Public) | marketingové materiály, web FAQ |
| Interní (Internal) | zaměstnanecké adresáře |
| Důvěrné (Confidential) | finanční zprávy, mzdová agenda |
| Tajné (Secret) | obchodní tajemství, výzkum a vývoj |
| Přísně tajné (Top secret) | strategické plány, národní bezpečnost |

Každá úroveň má *odpovídající* protiopatření — sílu šifrování (encryption), řízení přístupu (access control) a postupy pro nakládání s daty.

## Riziko

Riziko je kombinací tří výše uvedených entit:

$$
\text{Risk} = \text{Likelihood} \times \text{Impact}
$$

### Pravděpodobnost (likelihood)

Pravděpodobnost, že hrozba zneužije zranitelnost:

- Vysoká — zranitelnost je veřejně známá, existuje k ní zneužití (exploit) a útočník je motivovaný.
- Střední — zranitelnost je známá, zneužití je obtížné, motivace je nejasná.
- Nízká — zranitelnost je teoretická, žádné známé zneužití neexistuje.

### Dopad (impact)

Kolik škody incident napáchá, pokud nastane:

- Vysoký — kompromitace celé organizace, ztráta byznysu.
- Střední — kompromitace části systému, finanční ztráta.
- Nízký — drobná nepříjemnost, rychle opravitelná.

### Matice rizik (risk matrix)

| | Dopad: nízký | Dopad: střední | Dopad: vysoký |
| :--- | :---: | :---: | :---: |
| Pravděpodobnost: vysoká | Střední | Vysoké | **Kritické** |
| Pravděpodobnost: střední | Nízké | Střední | Vysoké |
| Pravděpodobnost: nízká | Triviální | Nízké | Střední |

Řízení rizik (risk management) ([[risk-analyza]]) prioritizuje *vysoká* a *kritická* rizika.

## Ošetření rizika (risk treatment)

Pro každé identifikované riziko máme 4 možnosti:

1. **Snížit (mitigate)** — zavést protiopatření, snížit pravděpodobnost nebo dopad.
2. **Přenést (transfer)** — pojištění, outsourcing.
3. **Akceptovat (accept)** — riziko je příliš nízké, nebo by jeho ošetření bylo příliš nákladné.
4. **Vyhnout se (avoid)** — ukončit danou činnost.

Důležité: *vždy zbyde* zbytkové riziko (residual risk). Cílem není nulové riziko (to je nemožné), ale *akceptovatelná* úroveň.

## Modelování hrozeb (threat modeling)

Systematický přístup k identifikaci hrozeb pro konkrétní systém. Populární frameworky:

- **STRIDE** (Microsoft) — Spoofing (podvržení), Tampering (manipulace), Repudiation (popírání), Information disclosure (únik informací), Denial of service (odepření služby), Elevation of privilege (eskalace oprávnění).
- **PASTA** (Process for Attack Simulation and Threat Analysis).
- **OCTAVE** (Operationally Critical Threat, Asset, and Vulnerability Evaluation).

Postup:

1. Dekompozice systému — DFD diagram, hranice důvěry (trust boundaries).
2. Identifikace hrozeb — na každou komponentu aplikuj STRIDE.
3. Ohodnocení hrozeb — skórování DREAD (Damage, Reproducibility, Exploitability, Affected users, Discoverability).
4. Zmírnění — navrhni protiopatření.

Modelování hrozeb se *má* dělat ve *fázi návrhu*, ne až po nasazení (deployment).

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: NIST SP 800-30 — Guide for Conducting Risk Assessments ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-30r1.pdf)); ISO/IEC 27005:2022 — Information Security Risk Management; [MITRE ATT&CK Framework](https://attack.mitre.org/); [CVE Database](https://cve.mitre.org/); [CWE Top 25](https://cwe.mitre.org/top25/); Shostack, A.: „Threat Modeling: Designing for Security" (Wiley 2014).*
