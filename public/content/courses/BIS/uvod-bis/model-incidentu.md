---
title: Model bezpečnostního incidentu
---

# Model bezpečnostního incidentu a kill chain

Bezpečnostní incident *nevzniká* okamžitě — typicky probíhá jako *řetězec* jednotlivých kroků útoku. Pochopení jeho *fází* nám dovolí útok zachytit už v některé z nich a *zastavit* ho, místo abychom čekali až na konečný dopad.

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

Incident vznikne, jen když jsou splněny všechny tyto podmínky najednou:

1. **Útočník** (vnější svět) má motivaci a zároveň příležitost.
2. **Zranitelnost (vulnerability)** existuje a je pro útočníka dostupná.
3. **Aktivum** ukryté za zranitelností má pro něj nějakou hodnotu.
4. **Opatření (controls)** nefungují — buď vůbec neexistují, nebo selhala.

⇒ Stačí odstranit kteroukoli z těchto čtyř podmínek a incident *neproběhne*.

## Lockheed Martin Cyber Kill Chain (2011)

Model popisuje 7 fází útoku typu APT (tedy cíleného, dlouhodobého a pokročilého):

1. **Reconnaissance (průzkum)** — sběr informací o cíli (Google dorks, LinkedIn, Shodan, skenování portů).
2. **Weaponization (příprava zbraně)** — sestavení zneužití (exploit) a škodlivé části (payload), například malware na míru nebo PDF nakažené škodlivým kódem.
3. **Delivery (doručení)** — doručení útoku k oběti (phishing e-mailem, watering hole, USB klíč).
4. **Exploitation (zneužití)** — spuštění zneužití (exploit) na cílovém systému (typicky vzdálené spuštění kódu, RCE).
5. **Installation (instalace)** — zajištění trvalé přítomnosti (persistence) pomocí rootkitu, naplánované úlohy nebo zápisu do registru.
6. **Command & Control (C2)** — útočník (attacker) získá vzdálené řízení napadeného systému.
7. **Actions on Objectives (splnění cíle)** — dosažení vlastního záměru: odcizení dat (data exfil), vydírání (ransom) nebo sabotáž.

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

Klíčové poučení zní: **vyhrává ten, kdo útok odhalí brzy**. Zastavit útok ve fázi 1 (průzkum) je *triviální*. Zastavit ho až ve fázi 7, kdy už únik dat probíhá, je *katastrofa*.

::: viz kill-chain-defender "Zapni defenders v jednotlivých fázích; survival probability útoku napříč 7-stupňovým řetězcem. Defense in depth = násobení P(survive)."
:::

## Rozšíření MITRE ATT&CK

ATT&CK celý Kill Chain rozpracovává mnohem podrobněji. Definuje 14 *taktik* (tedy dílčích cílů útočníka):

1. **Reconnaissance** (průzkum)
2. **Resource Development** (příprava zdrojů)
3. **Initial Access** (první přístup)
4. **Execution** (spuštění kódu)
5. **Persistence** (trvalá přítomnost)
6. **Privilege Escalation** (zvýšení oprávnění)
7. **Defense Evasion** (obejití obrany)
8. **Credential Access** (získání přihlašovacích údajů)
9. **Discovery** (mapování prostředí)
10. **Lateral Movement** (pohyb po síti)
11. **Collection** (sběr dat)
12. **Command and Control** (řízení)
13. **Exfiltration** (odsávání dat)
14. **Impact** (dopad)

Pod každou taktikou je řazeno přibližně 10 až 30 konkrétních *technik* (například T1566 Phishing nebo T1190 Exploit Public-Facing Application).

Obránci (defenders) přiřazují svá opatření (controls) k jednotlivým technikám ATT&CK. Toto mapování umějí automatizovat nástroje jako Mandiant nebo SOC Prime.

## Diamond Model (2013)

Jde o alternativní pohled: každý incident je *zachycen* čtyřmi vrcholy diamantu:

- **Adversary (protivník)** — kdo útočí.
- **Capability (schopnost)** — čím útočí (malware, exploit, technika).
- **Infrastructure (infrastruktura)** — jeho IP adresy, domény a řídicí servery (command-control).
- **Victim (oběť)** — koho útok míří, tedy cíl.

Princip se nazývá pivoting: pokud znáte jeden vrchol, hledáte *spojení* na ostatní. Platformy pro threat intelligence díky tomu propojují související incidenty napříč daty.

## Strom útoku (attack tree)

Hierarchický graf zachycující všechny *způsoby*, jakými může útočník dosáhnout svého cíle.

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

Uzel AND znamená, že musí být splněny všechny jeho větve. Uzel OR znamená, že stačí splnit jedinou z nich.

Využití je dvojí: při *modelování hrozeb (threat modeling)* slouží k nalezení všech cest útoku a při návrhu *bezpečnostní architektury* pomáhá zjistit, která opatření (controls) uzavřou hned několik cest najednou.

::: viz attack-tree-traversal "Klikni na leaf box pro toggle (útočník schopnost ano/ne); AND/OR propagují k root. Najdi minimální cut k zavření všech cest."
:::

## Indikátory kompromitace (Indicators of Compromise, IoC)

Po odhalení incidentu si obránci (defenders) *zaznamenají* indikátory kompromitace (IoC) — stopy, podle nichž lze rozpoznat *další* podobné incidenty:

- **Síťové IoC**: škodlivá IP adresa, doména nebo URL.
- **Hostitelské IoC**: hash souboru (MD5/SHA-1/SHA-256), název souboru, klíč registru.
- **Behaviorální IoC**: neobvyklý strom procesů, podezřelý příkazový řádek.

Indikátory se sdílejí v komunitě (formáty MISP, STIX/TAXII). Díky tomuto sdílení dokážou obránci ze stejné komunity stejný malware rychle odhalit.

## Příklad: řetězec ransomwarového útoku {tier=example}

1. **Recon (průzkum)**: prohledání internetu po vystavených portech RDP (3389/tcp).
2. **Initial Access (první přístup)**: prolomení přihlášení k RDP hrubou silou nebo zneužití zranitelnosti BlueKeep CVE-2019-0708.
3. **Execution (spuštění)**: nasazení ransomwaru (například Conti).
4. **Persistence (trvalá přítomnost)**: naplánovaná úloha a spouštěcí klíč v registru.
5. **Privilege Escalation (zvýšení oprávnění)**: zneužití zranitelnosti jádra nebo odcizených údajů správce.
6. **Lateral Movement (pohyb po síti)**: pass-the-hash a WMI k šíření na další stroje.
7. **Defense Evasion (obejití obrany)**: vypnutí Windows Defenderu a smazání stínových kopií.
8. **Impact (dopad)**: zašifrování souborů a požadavek výkupného v kryptoměně.

Obránci sledují každý jednotlivý krok. Už *odhalení ve čtvrtém kroku (trvalá přítomnost)* může zabránit *kroku osmému (zašifrování)*.

## SLA — Service Level Agreement (dohoda o úrovni služby)

Incident má dopad na dostupnost (availability). SLA proto stanovuje přijatelné hodnoty těchto metrik:

- **MTBF** (Mean Time Between Failures) — průměrná doba mezi výpadky.
- **MTTR** (Mean Time To Repair / Recover) — průměrná doba obnovy.
- **RPO** (Recovery Point Objective) — kolik dat si můžeme dovolit ztratit (tedy stáří poslední zálohy).
- **RTO** (Recovery Time Objective) — do jaké doby musí být služba opět v provozu.

Příklad: webová služba se SLA na dostupnost 99,9 % smí být nedostupná 8,76 hodiny za rok. Přísnější SLA 99,99 % povoluje výpadek pouhých zhruba 52 minut za rok.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Hutchins, E.M., Cloppert, M.J., Amin, R.M.: „Intelligence-Driven Computer Network Defense" (Lockheed Martin 2011, [PDF](https://www.lockheedmartin.com/content/dam/lockheed-martin/rms/documents/cyber/LM-White-Paper-Intel-Driven-Defense.pdf)); [MITRE ATT&CK Framework](https://attack.mitre.org/); Caltagirone, S., Pendergast, A., Betz, C.: „The Diamond Model of Intrusion Analysis" (CTSA 2013, [PDF](https://apps.dtic.mil/sti/pdfs/ADA586960.pdf)); Schneier, B.: „Attack Trees" (Dr. Dobb's Journal 1999).*
