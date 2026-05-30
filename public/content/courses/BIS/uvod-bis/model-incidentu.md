---
title: Model bezpečnostního incidentu
---

# Model bezpečnostního incidentu a kill chain

Bezpečnostní incident *nevzniká* okamžitě — typicky probíhá *řetězec* kroků útoku. Pochopení *fází* útoku umožňuje detekovat ho v některé fázi a *zastavit*, ne čekat na finální dopad.

## Model incidentu

::: svg "Model bezpečnostního incidentu — řetězec"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="40" width="100" height="50" rx="4"/>
    <rect x="140" y="40" width="100" height="50" rx="4"/>
    <rect x="260" y="40" width="100" height="50" rx="4"/>
    <rect x="380" y="40" width="140" height="50" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="70" y="62">Vnější svět</text>
    <text x="190" y="62">Zranitelná místa</text>
    <text x="310" y="62">Aktivum</text>
    <text x="450" y="62">Bezp. incident</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="70" y="78">útočník + hrozba</text>
    <text x="190" y="78">systém slabin</text>
    <text x="310" y="78">cíl útoku</text>
    <text x="450" y="78">narušení CIA</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <line x1="120" y1="65" x2="140" y2="65" marker-end="url(#inc-ar)"/>
    <line x1="240" y1="65" x2="260" y2="65" marker-end="url(#inc-ar)"/>
    <line x1="360" y1="65" x2="380" y2="65" marker-end="url(#inc-ar)"/>
  </g>
  <text x="270" y="130" text-anchor="middle" fill="var(--text-muted)" font-size="10">Opatření (controls) snižují pravděpodobnost a dopad v každé fázi.</text>
  <g fill="var(--accent)" opacity="0.2" stroke="var(--accent)">
    <rect x="20" y="140" width="500" height="40" rx="3"/>
  </g>
  <text x="270" y="165" text-anchor="middle" fill="var(--text)" font-weight="600">Defense in depth — vrstvy controls v každé fázi řetězce</text>
  <defs>
    <marker id="inc-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

Incident vzniká, když:

1. **Útočník** (vnější svět) má motivaci + příležitost.
2. **Zranitelnost** existuje a je dostupná.
3. **Aktivum** za zranitelností má hodnotu.
4. **Controls** nefungují (neexistují nebo selhaly).

⇒ Eliminate any one of the 4 = incident *neproběhne*.

## Lockheed Martin Cyber Kill Chain (2011)

Model 7 fází APT-style útoku:

1. **Reconnaissance** — sběr informací o cíli (Google dorks, LinkedIn, Shodan, port scan).
2. **Weaponization** — příprava exploit + payload (custom malware, weaponized PDF).
3. **Delivery** — doručení (email phishing, watering hole, USB).
4. **Exploitation** — spuštění exploit na cílovém systému (RCE).
5. **Installation** — persistence (rootkit, scheduled task, registry).
6. **Command & Control (C2)** — útočník získá vzdálenou kontrolu.
7. **Actions on Objectives** — splnění cíle (data exfil, ransom, sabotage).

::: svg "Cyber Kill Chain — 7 fází APT útoku"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="9">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="40" width="70" height="50" rx="3"/>
    <rect x="92" y="40" width="70" height="50" rx="3"/>
    <rect x="164" y="40" width="70" height="50" rx="3"/>
    <rect x="236" y="40" width="70" height="50" rx="3"/>
    <rect x="308" y="40" width="70" height="50" rx="3"/>
    <rect x="380" y="40" width="70" height="50" rx="3"/>
    <rect x="452" y="40" width="70" height="50" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="55" y="58">Recon</text>
    <text x="127" y="58">Weaponize</text>
    <text x="199" y="58">Deliver</text>
    <text x="271" y="58">Exploit</text>
    <text x="343" y="58">Install</text>
    <text x="415" y="58">C2</text>
    <text x="487" y="58">Actions</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="8">
    <text x="55" y="72">scan, OSINT</text>
    <text x="127" y="72">malware</text>
    <text x="199" y="72">email, USB</text>
    <text x="271" y="72">RCE</text>
    <text x="343" y="72">persistence</text>
    <text x="415" y="72">remote ctrl</text>
    <text x="487" y="72">exfil, ransom</text>
  </g>
  <text x="55" y="105" text-anchor="middle" fill="var(--accent)" font-size="8">IDS, OSINT mon</text>
  <text x="127" y="105" text-anchor="middle" fill="var(--accent)" font-size="8">honeypot</text>
  <text x="199" y="105" text-anchor="middle" fill="var(--accent)" font-size="8">email filter</text>
  <text x="271" y="105" text-anchor="middle" fill="var(--accent)" font-size="8">EDR, patch</text>
  <text x="343" y="105" text-anchor="middle" fill="var(--accent)" font-size="8">FIM, AV</text>
  <text x="415" y="105" text-anchor="middle" fill="var(--accent)" font-size="8">DNS sinkhole</text>
  <text x="487" y="105" text-anchor="middle" fill="var(--accent)" font-size="8">DLP</text>
  <text x="270" y="135" text-anchor="middle" fill="var(--text-muted)" font-size="10" font-weight="600">defender controls v každé fázi</text>
  <text x="270" y="160" text-anchor="middle" fill="var(--text-faint)" font-size="9">Cíl: zastavit útok co nejdříve v řetězci.</text>
</svg>
:::

Klíčový insight: **early detection wins**. Zastavit útok ve fázi 1 (recon) je *triviální*. Zastavit ve fázi 7 (data exfil already happening) je *katastrofa*.

::: viz kill-chain-defender "Zapni defenders v jednotlivých fázích; survival probability útoku napříč 7-stupňovým řetězcem. Defense in depth = násobení P(survive)."
:::

## MITRE ATT&CK rozšíření

ATT&CK rozšiřuje Kill Chain o detail. 14 *taktik* (cílů):

1. **Reconnaissance**
2. **Resource Development**
3. **Initial Access**
4. **Execution**
5. **Persistence**
6. **Privilege Escalation**
7. **Defense Evasion**
8. **Credential Access**
9. **Discovery**
10. **Lateral Movement**
11. **Collection**
12. **Command and Control**
13. **Exfiltration**
14. **Impact**

Pod každou taktikou ~10-30 konkrétních *technik* (např. T1566 Phishing, T1190 Exploit Public-Facing Application).

Defenders mapují své controls k ATT&CK techniques. Tools (Mandiant, SOC Prime) automatizují.

## Diamond Model (2013)

Alternativa: každý incident *zachycený* 4 vrcholy diamantu:

- **Adversary** — kdo útočí.
- **Capability** — jaká schopnost (malware, exploit, technique).
- **Infrastructure** — IP, domains, command-control.
- **Victim** — cíl.

Pivoting: znajíc 1 vrchol, hledat *spojení* na ostatní. Threat intelligence platform pivotuje napříč incidenty.

## Attack Tree

Hierarchický graf *způsobů*, jak útočník může dosáhnout cíle.

```
Goal: Compromise webserver
├── AND: SQL injection
│   ├── Find SQLi endpoint (port scan)
│   └── Craft SQL payload
├── OR: Buffer overflow exploit
│   ├── Find vulnerable service version
│   └── Use existing exploit (CVE-XXXX-NNNN)
└── OR: Social engineering admin
    ├── Phishing
    └── Pretexting
```

AND = všechny musí být splněny. OR = stačí jeden.

Use case: *threat modeling* (najít všechny cesty útoku) + *security architecture* (které controls eliminují více cest najednou).

::: viz attack-tree-traversal "Klikni na leaf box pro toggle (útočník schopnost ano/ne); AND/OR propagují k root. Najdi minimální cut k zavření všech cest."
:::

## Indicators of Compromise (IoC)

Po detekci incidentu defenders *zaznamenají* IoC — markers, podle kterých identifikovat *jiné* podobné incidenty:

- **Network IoC**: malicious IP, domain, URL.
- **Host IoC**: hash souboru (MD5/SHA-1/SHA-256), filename, registry key.
- **Behavior IoC**: unusual process tree, abnormal command line.

IoC se sdílí v komunitě (MISP, STIX/TAXII format). Sharing → defenders ze stejné komunity rychle detekují stejný malware.

## Příklad: Ransomware attack chain

1. **Recon**: scan internet for exposed RDP (3389/tcp).
2. **Initial Access**: brute force RDP login or exploit BlueKeep CVE-2019-0708.
3. **Execution**: drop ransomware (e.g. Conti).
4. **Persistence**: scheduled task + registry run key.
5. **Privilege Escalation**: exploit kernel CVE or stolen admin creds.
6. **Lateral Movement**: pass-the-hash, WMI to other hosts.
7. **Defense Evasion**: disable Windows Defender, delete shadow copies.
8. **Impact**: encrypt files, demand ransom in cryptocurrency.

Defenders watch každý krok. *Detection in step 4 (persistence)* may prevent *step 8 (encryption)*.

## SLA — Service Level Agreement

Incident má dopad na *availability*. SLA definuje akceptovatelné metriky:

- **MTBF** (Mean Time Between Failures) — průměrný čas mezi failures.
- **MTTR** (Mean Time To Repair / Recover) — průměrný čas obnovy.
- **RPO** (Recovery Point Objective) — kolik dat můžeme ztratit (last backup).
- **RTO** (Recovery Time Objective) — za kolik musí být služba zpět.

Příklad: webová služba s 99.9 % uptime SLA = 8.76 h downtime/rok. Přísnější SLA 99.99 % = jen ~52 min downtime/rok.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Hutchins, E.M., Cloppert, M.J., Amin, R.M.: „Intelligence-Driven Computer Network Defense" (Lockheed Martin 2011, [PDF](https://www.lockheedmartin.com/content/dam/lockheed-martin/rms/documents/cyber/LM-White-Paper-Intel-Driven-Defense.pdf)); [MITRE ATT&CK Framework](https://attack.mitre.org/); Caltagirone, S., Pendergast, A., Betz, C.: „The Diamond Model of Intrusion Analysis" (CTSA 2013, [PDF](https://apps.dtic.mil/sti/pdfs/ADA586960.pdf)); Schneier, B.: „Attack Trees" (Dr. Dobb's Journal 1999).*
