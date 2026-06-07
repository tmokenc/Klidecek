---
title: SOC a reakce na incidenty
---

# SOC a reakce na incidenty

**SOC** (Security Operations Center) je *organizační* i *technická* jednotka, která 24/7 monitoruje bezpečnostní stav. **Reakce na incidenty (incident response, IR)** je *proces* reagování na incidenty od jejich detekce až po obnovu provozu.

## SOC — Security Operations Center

### Funkce

- **Monitoring** — analýza výstrah (alerts) v reálném čase ([[siem-monitoring]], [[ids-ips]]).
- **Triáž (triage)** — zařazení incidentů do kategorií.
- **Reakce (response)** — eskalace a zmírnění dopadů.
- **Lov hrozeb (threat hunting)** — aktivní vyhledávání kompromitací.
- **Forenzní analýza (forensics)** — rozbor po incidentu.
- **Reporting** — metriky a brífinky pro vedení.

### Úrovně analytiků

**Tier 1 — triáž**: filtruje výstrahy a eskaluje podezřelé případy.

- Dovednosti: analýza logů, správa tiketů.
- Plat: 40–70 tis. USD (USA).

**Tier 2 — vyšetřování**: hlubší analýza, analýza škodlivého kódu (malware), korelace událostí.

- Dovednosti: lov hrozeb, skriptování, postupy reakce na incidenty.
- Plat: 70–120 tis. USD.

**Tier 3 — lov hrozeb a reakce**: vede složitá vyšetřování a pracuje se zpravodajstvím o hrozbách (threat intel).

- Dovednosti: zpětné inženýrství (reverse engineering), pokročilá forenzní analýza.
- Plat: 120–200 tis. USD a více.

**SOC manažer**: stará se o procesy, metriky a koordinaci s ostatními týmy.

### Nástroje

- **SIEM** ([[siem-monitoring]]) — Splunk, QRadar, Sentinel, Elastic.
- **SOAR** — Security Orchestration, Automation, Response. Automatizace pomocí playbooků (předem připravených postupů).
- **EDR/XDR** — CrowdStrike, SentinelOne, Microsoft Defender.
- **Platformy pro zpravodajství o hrozbách (threat intel platforms)** — MISP, ThreatConnect.
- **Síťový monitoring (network monitoring)** — Zeek, Suricata.

### Modely

- **Vlastní SOC (in-house)** — plně obsazený a provozovaný interně.
- **MSSP** (Managed Security Service Provider) — provoz zajišťuje externí dodavatel.
- **Hybridní** — interní tým doplněný službou MSSP pro mimopracovní dobu.
- **MDR** (Managed Detection and Response) — dodavatel sleduje vaše nástroje za vás.

Volba modelu závisí na velikosti organizace, regulatorních požadavcích a rozpočtu.

## Rámec reakce na incidenty

NIST SP 800-61 — nejčastěji citovaný rámec (framework).

### Fáze reakce na incidenty

::: svg "NIST IR — 4 phases"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5">
    <circle cx="90" cy="90" r="60"/>
    <circle cx="230" cy="90" r="60"/>
    <circle cx="370" cy="90" r="60"/>
    <circle cx="490" cy="90" r="40"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="90" y="85">Prepare</text>
    <text x="230" y="78">Detect &</text>
    <text x="230" y="92">Analyze</text>
    <text x="370" y="78">Contain,</text>
    <text x="370" y="92">Eradicate,</text>
    <text x="370" y="106">Recover</text>
    <text x="490" y="85">Post-</text>
    <text x="490" y="99">incident</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="90" y="115">plan, train</text>
    <text x="230" y="120">SOC monitor</text>
    <text x="490" y="115">lessons</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1" fill="none">
    <path d="M150,90 L170,90" marker-end="url(#ir-ar)"/>
    <path d="M290,90 L310,90" marker-end="url(#ir-ar)"/>
    <path d="M430,90 L450,90" marker-end="url(#ir-ar)"/>
  </g>
  <text x="270" y="165" text-anchor="middle" fill="var(--text-faint)" font-size="9">Loop: lessons → improve preparation</text>
  <defs>
    <marker id="ir-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

#### 1. Příprava (preparation)

Ještě před incidentem:

- **Plán reakce na incidenty (IR plan)** — zdokumentované postupy.
- **IR tým** — definované role a kontaktní údaje.
- **Komunikační plány** — interní i externí.
- **Připravené nástroje** — forenzní pracovní stanice, zálohy, zachytávání síťového provozu.
- **Trénink** — stolní cvičení (tabletop exercises) a simulace.
- **Zpravodajství o hrozbách (threat intelligence)** — relevantní zdroje (feeds).

Toto je nejdůležitější fáze. Nepřipravená organizace upadne ve chvíli incidentu do chaosu.

#### 2. Detekce a analýza

- Výstraha ze SIEM, IDS, hlášení od uživatele nebo ze zpravodajství o hrozbách.
- **Triáž** — jde skutečně o incident?
- **Stanovení rozsahu (scoping)** — co všechno je zasaženo?
- **Klasifikace** — závažnost (nízká/střední/vysoká/kritická).
- **Dokumentace** — založení incidentního tiketu.

#### 3. Zadržení, eradikace a obnova

**Zadržení (containment)**:

- **Krátkodobé** — izolace nakažených hostů, segmentace sítě, zablokování účtů.
- **Dlouhodobé** — záplatování zranitelných systémů, zatímco vyšetřování pokračuje.

**Eradikace (eradication)**:

- Odstranění škodlivého kódu (malware).
- Zablokování či změna kompromitovaných účtů.
- Znovuvybudování kompromitovaných systémů (nespoléhejte na pouhé vyčištění — systém přeinstalujte).
- Odstranění prvotní příčiny.

**Obnova (recovery)**:

- Obnovení systémů z čisté zálohy.
- Ověření integrity.
- Sledování případné opětovné nákazy.
- Obnovení běžného provozu.

#### 4. Po incidentu (post-incident)

- Schůzka **získaných ponaučení (lessons learned)**.
- **Aktualizace** plánu reakce na incidenty, playbooků a opatření.
- **Reporting** vedení a regulátorům.
- **Sdílení zpravodajství o hrozbách** (ISAC, MISP).

## IR tým — typické role

- **Velitel incidentu (IR Commander)** — celková odpovědnost.
- **Vedoucí vyšetřovatel (Lead Investigator)** — technické vedení.
- **Forenzní analytici** — práce s důkazy.
- **Analytici škodlivého kódu (malware)** — zpětné inženýrství.
- **Komunikace** — vztahy s veřejností (PR) a komunikace se zákazníky.
- **Právní oddělení** — regulace a orgány činné v trestním řízení.
- **HR** — pro případy vnitřních hrozeb (insider threats).
- **IT provoz** — obnova systémů.

## Playbooky

Předem definované postupy pro *běžné* typy incidentů:

- Playbook pro **nákazu škodlivým kódem (malware infection)**.
- Playbook pro **phishing**.
- Playbook pro **únik dat (data breach)**.
- Playbook pro **DDoS**.
- Playbook pro **kompromitaci účtu (account compromise)**.

Každý z nich obsahuje: spouštěcí podmínky, kroky a kritéria pro eskalaci.

Moderní SOC playbooky automatizují pomocí platforem **SOAR** (Phantom, Demisto, Tines, Swimlane).

## Úrovně závažnosti

Typická taxonomie:

| Úroveň | Popis | Reakce |
| :--- | :--- | :--- |
| **Kritická** | Aktivní průnik s rozsáhlým dopadem | Okamžité nasazení všech, brífink pro vedení |
| **Vysoká** | Podezření na průnik se středním dopadem | Aktivace IR týmu, řádově hodiny |
| **Střední** | Podezřelá aktivita | Prošetřit do jednoho dne |
| **Nízká** | Drobná anomálie | Prošetřit do jednoho týdne |

Únik zákaznických dat se obvykle klasifikuje jako **kritický**.

## Komunikace

### Interní

- Aktualizace stavu každých X hodin.
- Konferenční hovor (bridge call) pro aktivní incidenty.
- Aktualizace pro vedení.

### Externí

- **Regulátoři** — oznámení do 72 h podle GDPR, americké zákony o ohlašování úniků dat.
- **Zákazníci** — pokud je oznámení vyžadováno.
- **Orgány činné v trestním řízení** — FBI, místní policie.
- **Tisk** — výhradně prostřednictvím pověřeného mluvčího.

### Co NEDĚLAT

- Nekomunikovat přes kompromitované kanály (předpokládejte, že útočník (attacker) sleduje firemní e-mail).
- Veřejně nespekulovat, dokud nejsou známa fakta.
- Neslibovat konkrétní výsledky před dokončením vyšetřování.

## Získaná ponaučení

Do 1–2 týdnů po incidentu:

1. **Časová osa** událostí.
2. **Analýza prvotní příčiny (root cause analysis)** (metoda 5 proč).
3. **Účinnost detekce** — kdy jsme problém odhalili?
4. **Účinnost reakce** — dodrželi jsme postupy?
5. **Zlepšení** — opatření, trénink, nástroje.

Výstupem jsou konkrétní úkoly s přiřazenými vlastníky a termíny. Sledujte je až do uzavření.

## Metriky

Metriky pro SOC a reakci na incidenty:

- **Střední doba do detekce (Mean Time to Detect, MTTD)** — od výstrahy po vyhlášení incidentu.
- **Střední doba do reakce (Mean Time to Respond, MTTR)** — od vyhlášení incidentu po jeho zadržení.
- **Střední doba do obnovy (Mean Time to Recovery)** — od zadržení incidentu po návrat k normálnímu provozu.
- **Míra falešně pozitivních výstrah (false positive rate)** — výstrahy, které nebyly incidenty.
- **Poměr detekce SOC vs. externě** — kolik incidentů odhalí SOC oproti tomu, kolik nahlásí někdo zvenčí.
- **Incidenty podle kategorie a závažnosti**.

Moderní cíl: MTTD < 1 hodina, MTTR < 24 hodin. Mnoho organizací jej nesplňuje.

::: viz ir-timeline-metrics "Slidery posouvají timing fází (detection, contain, eradicate, recover). MTTD / MTTR / damage se přepočítají. Preset 'slow' = no IR; 'fast' = mature SOC."
:::

## Lov hrozeb

Aktivní vyhledávání kompromitací, které *nebyly* spuštěny žádnou výstrahou.

### Řízený hypotézou

„Útočníci pro únik před detekcí používají techniky Living-off-the-Land (PowerShell, certutil). Hledejme neobvyklé vzorce PowerShellu spojené se síťovými spojeními."

### Založený na IoC

Zpravodajství o hrozbách zveřejní indikátory kompromitace (IoC) → v prostředí pak hledáme jejich výskyt.

### TTP

Vyhledávání podle techniky z MITRE ATT&CK. „Jak bychom detekovali T1003 (Credential Dumping, vykrádání přihlašovacích údajů)?"

Nástroje: pravidla Sigma (dotazy nezávislé na konkrétním SIEM), Atomic Red Team (simulace útoků).

## Stolní cvičení (tabletop exercises)

Simulované incidenty — pouze diskuse, žádné zásahy do reálných systémů. Ověřují:

- Úplnost plánu reakce na incidenty.
- Koordinaci týmu.
- Rozhodování pod tlakem.
- Komunikační řetězce.

Příklady:

- Scénář **ransomwaru**.
- **Krádež dat zevnitř organizace**.
- **DDoS na primární službu**.
- **Podvržení (spoofing) e-mailu generálního ředitele**.

Pro IR týmy se spouští čtvrtletně. Cílem je odhalit slabá místa.

## Příklady velkých incidentů {tier=example}

- **Target 2013** — malware na pokladních terminálech (POS) přes dodavatele klimatizací (HVAC). Odcizeno 40 milionů platebních karet.
- **Sony Pictures 2014** — útok přisuzovaný Severní Koreji, trapný únik interní e-mailové komunikace.
- **Equifax 2017** — zranitelnost (vulnerability) v Apache Struts, 147 milionů záznamů o spotřebitelích.
- **NotPetya 2017** — zdevastoval firmy Maersk a Mondelez. Celosvětové škody přes 10 miliard USD.
- **SolarWinds 2020** — útok na dodavatelský řetězec (supply chain attack), zasaženo 18 000 organizací.
- **Colonial Pipeline 2021** — ransomware, nedostatek paliva na východním pobřeží USA.
- **Uber 2022** — sociální inženýrství metodou „MFA fatigue", útočník získal úplný interní přístup.

U každého případu šlo o obrovský dopad a důležitá ponaučení.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: NIST SP 800-61 Rev 2 — Computer Security Incident Handling Guide ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf)); SANS Incident Handler's Handbook; Bejtlich, R.: „The Practice of Network Security Monitoring" (No Starch 2013); [SANS Reading Room — IR](https://www.sans.org/white-papers/category/incident-response/); Verizon Data Breach Investigations Report (annual).*
