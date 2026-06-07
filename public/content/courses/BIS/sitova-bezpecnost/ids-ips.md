---
title: IDS, IPS — detekce a prevence
---

# IDS / IPS — systémy pro detekci a prevenci průniků

**IDS** (Intrusion Detection System, systém pro detekci průniků) *detekuje* podezřelou aktivitu a *upozorní* na ni. **IPS** (Intrusion Prevention System, systém pro prevenci průniků) jde o krok dál — podezřelý provoz rovnou *blokuje*. Oba doplňují firewall ([[firewall]]) — firewall provoz *filtruje*, zatímco IDS/IPS *analyzuje* jeho obsah.

## IDS vs. IPS

| | IDS | IPS |
| :--- | :--- | :--- |
| Pozice | pasivní (mimo přímou cestu provozu, span port) | v cestě provozu (provoz blokuje) |
| Akce | upozornění (alert) | zahození, reset spojení, úprava paketu |
| Chování při selhání | bezpečné (přestanou jen upozornění) | nebezpečné (síť je zablokovaná) |
| Latence (zpoždění) | žádná | přidává latenci |
| Cena falešného poplachu | malá | výpadek služby |

IPS = IDS + aktivní reakce. Stejné detekční jádro, jen jiná akce.

## Přístupy k detekci

### Detekce podle signatur (signature-based)

Provoz se porovnává s *vzory* (signaturami) známých útoků.

```
alert tcp any any -> $HOME_NET 80 (msg:"SQL Injection"; content:"' OR 1=1"; sid:1001)
```

Výhody: u známých hrozeb málo falešných poplachů.

Nevýhody:

- **Slepota vůči zero-day útokům** — pro neznámou hrozbu signatura neexistuje.
- **Obcházení (evasion)** — pomocí kódování, fragmentace nebo šifrování (encryption).

Většina komerčních IDS se opírá hlavně o signatury.

### Detekce podle anomálií (anomaly-based)

Vytvoří se *referenční profil (baseline)* normálního chování a systém pak upozorní na odchylky od něj.

Příklady:

- Náhlý nárůst objemu DNS dotazů → možná exfiltrace dat?
- Neobvyklý čas nebo místo přihlášení → kompromitované přihlašovací údaje?
- Mnoho SQL dotazů směřujících na jeden řádek → stahování dat (scraping)?

Výhody: dokáže odhalit i neznámé útoky.

Nevýhody:

- **Falešné poplachy** — i legitimní provoz může vypadat jako anomálie (nová funkce, marketingová kampaň).
- **Obtížné ladění**.
- **Náchylnost k cílenému obcházení** — útočník (attacker) se snaží napodobit normální chování.

Moderní IDS používají strojové učení (ML) a behaviorální analytiku.

### Stavová analýza protokolu (stateful protocol analysis)

Sleduje se stav protokolu a systém upozorní na jeho porušení:

- HTTP požadavek (request) bez správné hlavičky Host.
- TLS handshake s neobvyklými rozšířeními.
- DNS dotaz na zakázané domény nejvyššího řádu (TLD).

Tento přístup zachytí některé pokusy o obcházení.

## Architektura nasazení

### Síťové IDS (NIDS — Network IDS)

Monitoruje *síťový provoz* přes span port nebo odbočku (tap).

```
                       [Switch]
                       /  |  \
                  [server][server][NIDS - span port]
```

Nástroje: Snort, Suricata, Zeek (dříve Bro).

### Hostitelské IDS (HIDS — Host IDS)

Monitoruje *jednoho hostitele* — jeho logy, integritu souborů a chování procesů (process).

Nástroje: OSSEC, Wazuh, Tripwire (kontrola integrity souborů).

### Hybridní řešení

Kombinuje NIDS i HIDS. NIDS vidí dění na úrovni sítě, HIDS na úrovni koncového zařízení (endpoint).

### Distribuované IDS

Více senzorů → centrální analytika. Jde o architekturu moderních systémů SIEM ([[siem-monitoring]]).

## Snort — klasické síťové IDS

Open-source NIDS od firmy Cisco/Sourcefire.

```
# Detect SSH brute force
alert tcp any any -> $HOME_NET 22 (
    msg:"Possible SSH brute force";
    flow:to_server;
    detection_filter: track by_src, count 10, seconds 60;
    sid:1000001;
)

# Detect Metasploit shellcode
alert ip any any -> any any (
    msg:"Metasploit shellcode";
    content:"|fc e8 89 00 00 00 60|";
    sid:1000002;
)
```

Pravidla se skládají z hlavičky (akce, protokol, zdroj→cíl) a těla (volby).

Snort 3 (od roku 2020) — moderní detekce reagující na události.

## Suricata

Vícevláknové NIDS (Snort byl historicky jednovláknový — používal jen jedno vlákno, thread).

Rozšiřující vlastnosti (features):

- Extrakce TLS metadat (SNI, certifikát).
- Parsování HTTP.
- Extrakce souborů (stahované i nahrávané).
- Skriptování v jazyce Lua pro složitější logiku.

```
alert http any any -> $HOME_NET any (
    msg:"Possible RAT in HTTP";
    http.host; content:"malicious.com";
    sid:2000001;
)
```

Používá se v: OPNsense, pfSense a v bezpečnostních distribucích.

## Zeek (Bro)

Framework pro *analýzu sítě*. Nezaměřuje se primárně na signatury.

Generuje bohaté logy:

- `conn.log` — každé spojení (5-tice + počet bajtů + doba trvání).
- `dns.log` — každý DNS dotaz i odpověď (response).
- `http.log` — požadavek, odpověď, hlavičky.
- `ssl.log` — certifikát, SNI, verze.
- `files.log` — extrahované soubory.

Mocný nástroj pro forenzní analýzu i aktivní vyhledávání hrozeb (threat hunting).

```
event new_connection(c: connection) {
    if (c$id$resp_p == 23/tcp) {
        # Telnet connection in 2024 — suspicious
        print fmt("Telnet to %s:%s", c$id$resp_h, c$id$resp_p);
    }
}
```

Vlastní skriptovací jazyk umožňuje psát složité analýzy.

## EDR — detekce a reakce na koncových zařízeních (Endpoint Detection & Response)

Moderní vylepšení HIDS. Jde nad rámec prostého sledování logů:

- Sledování stromu procesů.
- Detekce podle chování (např. neobvyklý vztah rodičovského a potomního procesu).
- Inspekce paměti.
- Reakce v reálném čase (ukončit proces, izolovat hostitele).

Dodavatelé: CrowdStrike Falcon, Microsoft Defender ATP, SentinelOne, Carbon Black.

EDR se stalo *standardním* podnikovým bezpečnostním prvkem. Často nahrazuje klasický antivirus (AV).

### Provázání s MITRE ATT&CK

Moderní EDR mapuje detekce na techniky z frameworku MITRE ATT&CK. Obránci tak vidí, které techniky dokážou detekovat a kde mají mezery.

## XDR — rozšířená detekce a reakce (Extended Detection & Response)

EDR + NDR (síťová detekce) + cloud + identity. Jedna sjednocená platforma.

Trend směřuje ke konsolidaci: dodavatelem spravované XDR nahrazuje izolované, oddělené nástroje.

## NGFW + IPS

Moderní firewally už *obsahují* IPS jádro. Palo Alto, Fortinet i Check Point ho mají standardně součástí.

Daní za to je kompromis ve výkonu (performance): hloubková inspekce paketů snižuje propustnost. Některá pracoviště proto používají:

- **NGFW s IPS** pro provoz mezi sítí a okolím (north-south).
- **IDS v cestě provozu** pro provoz uvnitř sítě (east-west, pasivně).

## Techniky obcházení (evasion) {tier=practice}

Útočníci se snaží IDS obejít:

### Fragmentace

Útok rozdělí napříč více IP fragmentů. IDS je nemusí složit (reassembly) správně. Chování podle RFC se navíc může u různých systémů (např. Linux) lišit.

Moderní IDS provádějí úplné složení fragmentů, ale je to pomalé.

### Kódování

URL kódování, normalizace Unicode, MIME kódování, dvojité kódování. Stejný škodlivý obsah (payload) lze vyjádřit mnoha různými způsoby.

```
%27 = '   →   ' OR 1=1
```

IDS proto musí obsah před porovnáním se signaturou *normalizovat*.

### Šifrování

TLS skryje obsah. IDS pak vidí jen metadata (SNI, certifikát, otisk JA3).

Obrana: rozšifrování TLS na cestě (TLS interception, ale s dopady na soukromí) a behaviorální detekce z metadat.

### Časování

Útoky typu Slowloris posílají data tak pomalu, že spojení vyprší dřív, než je vidět celá signatura.

### Polymorfismus (polymorphism)

Každá instance útoku vypadá jinak. Stejná logika, ale jiné bajty. Signatury proto selhávají.

Detekce založená na strojovém učení je vůči tomu odolnější.

## Kompromis mezi falešnými poplachy a propuštěnými útoky

```
                   Reality
                +---------+---------+
                | Attack  | Normal  |
       +--------+---------+---------+
       | Alert  | True+   | False+  |
IDS    +--------+---------+---------+
       | Silent | False-  | True-   |
       +--------+---------+---------+
```

- **Falešně pozitivní (False positive, FP)** — poplach na normálním provozu. Plýtvá časem analytika.
- **Falešně negativní (False negative, FN)** — přehlédnutý skutečný útok. To je z hlediska bezpečnosti horší.

ROC křivka vyjadřuje tento kompromis. Výchozí volba: optimalizovat na nízký počet FP (jinak by byli analytici zahlceni), a to za cenu několika FN.

::: viz ids-roc-tuner "Posouvej threshold — sleduj, jak se mění TP/FP/FN/TN, bod na ROC křivce a počet alertů za den. Nízký threshold → zahlcení poplachy (alert fatigue); vysoký → propuštěné útoky."
:::

Ladění:

- **Přidání výjimek do pravidel** — povolit legitimní vzory (whitelist).
- **Zpřísnění pravidel** — omezit příliš široké shody.
- **Využití threat intelligence** — upozornit jen na shodu se známým indikátorem kompromitace (IoC).
- **Prioritizace podle rizika** — provoz k cenným aktivům dostane víc pravidel.

## Zahlcení poplachy (alert fatigue)

Příliš mnoho poplachů → analytici je začnou ignorovat. Skutečné incidenty pak uniknou.

Obrana:

- **Vyladit** pravidla — méně falešných poplachů.
- **Agregovat** — seskupit související poplachy.
- **Prioritizovat** — bodovat podle hodnoty aktiva a závažnosti techniky.
- **Playbooky** — standardizovaný postup reakce snižuje zátěž z rozhodování.
- **SOAR** (Security Orchestration, Automation, Response) — orchestrace, automatizace a reakce v bezpečnosti. Automaticky zpracuje běžné poplachy.

## Honeypoty (honeypots)

Návnadové systémy, které předstírají, že jsou cenné. Jakýkoli přístup k nim = škodlivá aktivita.

- **Honeypot** — jediná návnada.
- **Honeynet** — celá síť návnad.
- **Canary tokeny** — falešné přihlašovací údaje nebo soubory. Upozorní, jakmile je někdo použije.

Nástroje: Cowrie, Honeyd, Canary od firmy Thinkst.

Jde o čistou detekci — falešný poplach prakticky nehrozí (k honeypotu by se *nikdo* legitimní neměl dostat).

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Northcutt, S., Novak, J.: „Network Intrusion Detection" (3rd ed., New Riders 2002); NIST SP 800-94 — Guide to Intrusion Detection and Prevention; [Snort Documentation](https://www.snort.org/documents); [Suricata Docs](https://docs.suricata.io/); [Zeek Documentation](https://docs.zeek.org/); [MITRE ATT&CK](https://attack.mitre.org/); Sanders, C., Smith, J.: „Applied Network Security Monitoring" (Syngress 2014).*
