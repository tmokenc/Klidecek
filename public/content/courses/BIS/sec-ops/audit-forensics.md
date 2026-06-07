---
title: Audit a digitální forenzní analýza
---

# Audit a digitální forenzní analýza

**Audit** je systematická kontrola (systematic review) toho, jak jsou zavedeny bezpečnostní opatření (security controls). **Digitální forenzní analýza (digital forensics)** je vyšetřování incidentu poté, co nastal — jejím cílem je obnovit důkazy, identifikovat útočníka (attacker) a podpořit případné soudní řízení.

Obě činnosti odpovídají na otázku „*co se stalo?*" — audit *plánovaně*, forenzní analýza *reaktivně* (tedy až jako reakce na již proběhlý incident).

## Bezpečnostní audit

### Typy auditu

#### Interní audit

Provádějí ho vlastní zaměstnanci (tým interního auditu, Internal Audit team). Jeho smyslem je průběžné zlepšování.

#### Externí audit

Provádí ho certifikovaná třetí strana. Vyžadují ho:

- certifikace **ISO 27001** ([[iso-27000]]);
- zpráva **SOC 2**;
- **PCI DSS** pro zpracování plateb;
- **SOX** pro veřejně obchodované americké společnosti.

#### Posouzení zranitelností (vulnerability assessment)

Hledá slabá místa. Nástroje: Nessus, Qualys, OpenVAS.

#### Penetrační test

*Aktivní* simulace útoku (attack). Testeři se aktivně pokoušejí o průnik do systému.

#### Red Team / Purple Team

Jdou nad rámec běžného penetračního testu:

- **Red Team** — simulovaný protivník, nasazení trvající i několik týdnů;
- **Blue Team** — obránci;
- **Purple Team** — spolupráce obou stran, kdy obránci sledují techniky Red Teamu a učí se z nich.

### Průběh auditu

1. **Vymezení rozsahu (scoping)** — co všechno do auditu spadá.
2. **Plánování** — harmonogram a zdroje.
3. **Terénní práce (fieldwork)** — rozhovory, kontrola dokumentace, technické testování.
4. **Reportování** — zjištění a doporučení.
5. **Následná kontrola (follow-up)** — ověření, že byla náprava skutečně provedena.

### Standardy pro audit

- **ISO 19011** — pokyny pro provádění auditů;
- **AICPA Trust Services Criteria** — pro SOC 2;
- opatření **NIST 800-53** — federální (USA);
- **ISO 27001 Annex A** — mezinárodní.

### Častá zjištění

Auditoři opakovaně nacházejí:

- **Zastaralé účty (stale accounts)** — propuštění uživatelé, jejichž účty jsou stále aktivní.
- **Nadměrná oprávnění (excessive privileges)** — uživatelé s administrátorskými právy, která nepotřebují.
- **Chybějící záplaty (missing patches)** — známé zranitelnosti (CVE).
- **Žádná obměna hesel** — staré sdílené účty.
- **Chybějící MFA** (vícefaktorová autentizace) — u privilegovaného přístupu.
- **Nečtené logy** — logy se sice sbírají, ale nikdo je neanalyzuje.
- **Chybějící plán reakce na incident (IR plan)**, případně plán, který nikdy nebyl vyzkoušen.
- **Neověřené zálohy (backups)** — zálohy existují, ale nikdy se z nich neobnovovalo.

Náprava se sleduje v systému **CAPA** (Corrective Action / Preventive Action — nápravná a preventivní opatření).

## Digitální forenzní analýza

Vyšetřování po incidentu. Cílem je obnovit důkazy, identifikovat útočníka a podpořit případné soudní řízení.

### Fáze

#### 1. Identifikace

Co je třeba vyšetřit? Vymezení rozsahu:

- kompromitované počítače (hosts);
- zasažené účty;
- časové rozmezí;
- data, která mohla být odhalena.

#### 2. Zajištění (preservation)

Klíčové je zajistit důkazy *bez jakékoli změny*. Sem patří **řetězec zacházení s důkazy (chain of custody)** — průkazná evidence o tom, kdo s důkazem kdy nakládal.

```
Disk image (forensic copy) before any analysis.
Memory dump for volatile data.
Network capture preserved.
Log files copied (read-only).
Timestamps documented.
```

Nástroje: dd, FTK Imager, EnCase, X-Ways. Spočítá se hash (hash) originálu i kopie → tím se prokáže neporušenost dat.

#### 3. Sběr (collection)

Posbírá se:

- **Nejdříve volatilní data (volatile data)** — obsah paměti RAM, síťová spojení (po vypnutí počítače zaniknou).
- **Systémové artefakty** — registry, záznamy událostí (event logs), historie prohlížeče.
- **Obraz disku (disk image)** — úplná bit po bitu pořízená kopie.
- **Síťové logy** — zachycené pakety (packet captures), NetFlow.
- **Cloudové logy** — CloudTrail a podobné.

#### 4. Analýza

- **Rekonstrukce časové osy (timeline reconstruction)** — co se kdy stalo.
- **Analýza malwaru** — zpětné inženýrství (reverse engineering).
- **Síťová analýza** — Wireshark, Zeek.
- **Souborový systém (filesystem)** — obnova smazaných souborů, časy MAC.
- **Analýza paměti** — framework Volatility.

#### 5. Reportování

Zdokumentují se zjištění. Zpráva obsahuje:

- metodiku;
- zdroje důkazů;
- časovou osu;
- závěry;
- doporučení.

V případě potřeby musí být použitelná u soudu.

### Řetězec zacházení s důkazy (chain of custody)

U každého důkazu se eviduje:

- **kdo** ho sebral;
- **kdy** (časové razítko);
- **kde** (místo);
- **jak** (metoda, nástroj);
- **hash** před předáním a po něm.

Přerušení řetězce → důkaz může být u soudu nepřípustný.

### Nástroje

#### Pořizování obrazu disku

- **dd** (Linux) — `dd if=/dev/sda of=image.dd bs=1M`. Pomalé, ale standardní.
- **dcfldd** — vylepšení od ministerstva obrany USA (DoD). Počítá hash průběžně.
- **FTK Imager** — Windows, ve forenzní praxi běžný.
- **EnCase** — komerční.

#### Analýza souborů

- **The Sleuth Kit + Autopsy** — open-source forenzní platforma.
- **EnCase**.
- **X-Ways Forensics**.

#### Analýza paměti

- **Volatility** (Python) — z výpisu paměti (memory dump) získá běžící procesy, síťová spojení atd.
- **Rekall** — odnož (fork) nástroje Volatility.

#### Síťová forenzní analýza

- **Wireshark** — analýza zachycených paketů.
- **NetworkMiner** — extrakce souborů z pcap.
- **Zeek** — generuje logy určené k pozdější analýze.

#### Analýza malwaru

- **IDA Pro** / **Ghidra** — disassemblery.
- **Radare2** — open-source.
- **x64dbg** — debugger (ladicí nástroj).
- **Cuckoo Sandbox** — automatizovaná analýza.

### Antiforenzní techniky (anti-forensics)

Útočníci se snaží forenzní analýzu *ztížit*:

- **Timestomp** — falšování časových razítek souborů.
- **Mazání nebo úprava logů**.
- **Šifrování (encryption)** — disku, paměti.
- **Nástroje pro mazání (wipe tools)** — přepisují smazaná data, aby je nešlo obnovit.
- **Steganografie** — skrývání dat do obrázků.
- **Útoky běžící jen v paměti** — spuštěné z paměti, disku se vůbec nedotknou.

Moderní forenzní analýza se těmto technikám přizpůsobuje.

### Cloudová forenzní analýza

Výzvy:

- **Sdílení prostředků více nájemci (multi-tenancy)** — k datům sousedních zákazníků není přístup.
- **Pomíjivost (volatile)** — virtuální stroje (VMs) zaniknou a s nimi i důkazy.
- **Přesah jurisdikcí (cross-jurisdiction)** — datová centra v mnoha zemích.
- **Omezený přístup** — poskytovatel nemusí pořízení obrazu disku vůbec umožnit.

Postup:

- **Logy z API** — CloudTrail a podobné.
- **Snímek (snapshot)** — zajistit ho dřív, než dojde k jeho smazání.
- **Spolupráce s poskytovatelem cloudu** — formální žádost.

### Forenzní analýza mobilních zařízení

Specializované nástroje:

- **Cellebrite UFED** — používají ho orgány činné v trestním řízení, komerční.
- **MOBILedit** — alternativa.
- **Magnet AXIOM**.

Co lze získat:

- výpisy hovorů, SMS, kontakty;
- data aplikací — WhatsApp, Signal (pokud jsou přístupná);
- údaje o poloze;
- fotografie, videa;
- historii prohlížeče.

Pokud jsou telefony šifrované → může být nutná spolupráce s výrobcem (nebo zneužití nějaké zranitelnosti, exploit).

### Právní aspekty

#### Prohlídka a zajištění (search + seizure)

V USA: 4. dodatek Ústavy vyžaduje pro většinu prohlídek soudní příkaz. Na pracovišti může být dán *souhlas* prostřednictvím zaměstnaneckého řádu.

EU: GDPR a národní právní úprava.

ČR: Trestní řád § 158 (povinnost součinnosti).

#### Přípustnost (admissibility)

Forenzní důkaz musí být:

- **Pravý (authentic)** — prokazatelně z místa, kde se tvrdí.
- **Spolehlivý (reliable)** — postup musí být opakovatelný.
- **Úplný (complete)** — nesmí být zatajeny žádné důkazy svědčící ve prospěch obviněného.
- **Důvěryhodný (believable)** — analytik musí být věrohodný.

Zásadní je dokumentace.

#### Soukromí

I během vyšetřování platí ohledy na soukromí zaměstnanců. Právní důvod pro přístup k datům je třeba zdokumentovat.

### Známé forenzní případy {tier=example}

- **BTK Killer (2005)** — identifikován díky metadatům na disketě.
- **Sony Pictures (2014)** — IP adresy vystopovány do Severní Koreje.
- **Equifax (2017)** — po úniku následovala rozsáhlá forenzní analýza.
- **SolarWinds (2020)** — samotné vymezení rozsahu forenzní analýzy trvalo měsíce.

### Forenzní připravenost (forensic readiness)

Plánujte *ještě před* incidentem:

- **Logy v dostatečné podrobnosti** — tak, aby z nich šlo rekonstruovat průběh.
- **Doba uchování (retention)** — dostatečně dlouhá.
- **Řízení přístupu (access control)** — auditoři dokážou data sebrat bez zásahu IT oddělení.
- **Dostupné nástroje** — pracovní stanice, software, proškolení.
- **Smlouvy s dodavateli** — předplacená pohotovost (IR retainer) s forenzní firmou.

Bez přípravy: forenzní analýza trvá *mnohem* déle a může jí část důkazů uniknout.

## Příklad auditu shody: GDPR

Audit shody s GDPR ([[gdpr-nukib]]) zkoumá:

- právní základ pro zpracování;
- mechanismy uplatnění práv subjektů údajů (přístup, výmaz);
- správu souhlasů;
- postupy pro ohlášení porušení zabezpečení;
- jmenování pověřence pro ochranu osobních údajů (DPO, Data Protection Officer);
- záznamy o činnostech zpracování;
- posouzení vlivu na ochranu osobních údajů (DPIA) u rizikového zpracování.

Zjištění → zlepšení.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Casey, E.: „Digital Evidence and Computer Crime" (3rd ed., Academic Press 2011); NIST SP 800-86 — Guide to Integrating Forensic Techniques into Incident Response; SANS Forensics Reading Room ([sans.org/white-papers/category/computer-forensics-incident-response/](https://www.sans.org/white-papers/category/computer-forensics-incident-response/)); ACPO Good Practice Guide for Digital Evidence; Volatility Foundation ([volatilityfoundation.org](https://www.volatilityfoundation.org/)).*
