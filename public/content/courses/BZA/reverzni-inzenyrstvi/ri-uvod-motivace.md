---
title: Reverzní inženýrství — úvod a motivace
---

# Reverzní inženýrství — úvod a motivace

**Reverzní inženýrství** (reverse engineering, RE) je proces získávání znalostí nebo informací o návrhu z něčeho, co bylo vyrobeno — pro následné reprodukování, modifikaci nebo analýzu. V kontextu bezpečného hardware se zaměřujeme na **SW reverzní inženýrství** — extrakci logiky, algoritmů, klíčů a struktury z kompilovaného binárního kódu.

> *"There is no such thing as tamper-resistant software on a general purpose computer. If your computer can see the instructions, then you can see them, too."* — **Bruce Schneier**

## Forward vs. Reverse engineering

::: svg "Forward engineering: požadavky → návrh → kód → chování. Reverse engineering: ze běžícího systému zpětně rekonstruovat strukturu, návrh, požadavky."
<svg viewBox="0 0 540 232" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aRE1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="30" width="100" height="40" rx="6"/>
    <rect x="20" y="80" width="100" height="40" rx="6"/>
    <rect x="20" y="130" width="100" height="40" rx="6"/>
    <rect x="20" y="180" width="100" height="30" rx="6"/>
    <rect x="420" y="30" width="100" height="40" rx="6"/>
    <rect x="420" y="80" width="100" height="40" rx="6"/>
    <rect x="420" y="130" width="100" height="40" rx="6"/>
    <rect x="420" y="180" width="100" height="30" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70" y="52" font-size="11">Požadavky</text>
    <text x="70" y="102" font-size="11">Návrh</text>
    <text x="70" y="152" font-size="11">Zdrojový kód</text>
    <text x="70" y="200" font-size="10" fill="var(--text-muted)">Chování</text>
    <text x="470" y="52" font-size="11">Požadavky</text>
    <text x="470" y="102" font-size="11">Návrh</text>
    <text x="470" y="152" font-size="11">Zdrojový kód</text>
    <text x="470" y="200" font-size="10" fill="var(--text-muted)">Binární kód</text>
    <text x="270" y="22" font-size="12" fill="var(--accent)">Forward eng.</text>
    <text x="270" y="222" font-size="12" fill="var(--accent)">Reverse eng.</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aRE1)">
    <path d="M70,70 L70,76"/>
    <path d="M70,120 L70,126"/>
    <path d="M70,170 L70,176"/>
    <path d="M470,176 L470,170"/>
    <path d="M470,126 L470,120"/>
    <path d="M470,76 L470,70"/>
    <path d="M120,200 L420,200"/>
    <path d="M120,50 L420,50"/>
  </g>
</svg>
:::

* **Forward engineering** — klasický software development:
  * Požadavky → Návrh → Zdrojový kód → Chování (běhové).
* **Reverse engineering** — inverzní:
  * Binární kód → Zdrojový kód (decompilation) → Návrh (algoritmus, datastruktury) → Požadavky / specifikace.

Klíčový pojem: **abstraction level**. RE typicky postupuje od *nejnižší* abstrakce (machine code, hex bytes) k vyšší (logic, business rules).

### Úrovně abstrakce

* **Aplikační vrstva** — koncepty, politiky, business pravidla.
* **Funkční** — logické a funkční specifikace, ne-funkční požadavky.
* **Strukturální** — závislostní grafy, architektura, tok dat.
* **Implementační** — zdrojové soubory, symbol table.

V kybernetické bezpečnosti často nezáleží na *kompletní* dekompozici — stačí extrakce *specifické* informace (např. crypto klíče, autentizační logika, vulnerable funkce).

## Motivace — pozitivní

* **Vylepšení starého SW** — modernizace legacy systémů, kde zdrojový kód neexistuje (převzaté firmou, ztracený, copyrighted).
* **Získání "know how"** — porozumění algoritmů konkurence, akademický výzkum.
* **Migrace HW/SW** — port aplikace na nové prostředí, kde výrobce nepodporuje.
* **Znovupoužitelnost** — extraction reusable komponent.
* **Bezpečnost:**
  * **Oprava chyb** — patch zjištěné vulnerabilities (zejména u zařízení, která vendor nepatchuje).
  * **Vylepšení obranných technik proti RE** — autor musí znát útok, aby napsal obranu.
  * **Detekce škodlivého SW** — antivirus / EDR / threat intelligence týmy reverz analyzují malware.
  * **Ověřování SW** — ověření funkcionality, bezpečnosti, neexistence backdoorů.
* **Compatibility / interoperability** — open-source ekvivalenty (Wine, OpenJDK, ReactOS).

## Motivace — negativní (útočné)

* **Cracking** — obcházení DRM, software licensing, copy protection.
* **Software piracy** — vytváření illegal copies / keygens.
* **Získání citlivých dat** — credentials, klíče, business algoritmů.
* **Vyhledání vulnerabilities** — pro exploitaci (penetration testing nebo malicious).
* **Modifikace SW** — vlastní funkcionality, cheats v hrách.
* **Kopírování produktu** — counterfeiting (např. counterfeit chips, knock-off hardware).

## Motivace — zdroje

* **Finanční** — ušetření nákladů na vývoj, prodej cracked verze, ransomware.
* **Lidské zdroje** — netriviální development obejít.
* **Čas** — quick reverse vs. full re-development.

## Aplikace v kyberbezpečnosti

### Defensive

* **Malware analysis** — co dělá ransomware? Jaké jsou indikátory kompromitace (IoCs)? Jak se šíří? Příklad: [WannaCry kill switch discovery](https://blog.malwarebytes.com/threat-analysis/2017/05/the-worm-that-spreads-wanacrypt0r/) (Marcus Hutchins, 2017) — během RE binárky WannaCry objevil, že malware ověřuje doménu `www.iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com`; registrace domény ho deaktivovala globálně.
* **Vulnerability research** — Project Zero (Google), TrendMicro Zero Day Initiative, Pwn2Own.
* **Threat intelligence** — atribuce APT groups (similar code patterns, libraries).
* **Anti-debug / anti-VM detection** — porozumění technikám.

### Offensive

* **Exploit development** — pro pen-test nebo malicious actors.
* **Bug bounty** — finding bugs in popular software.
* **Patch diffing** — comparison patched vs. unpatched binary k zjištění *které bug* byl opraven, pak vytvořit *N-day* exploit.

### Forensic

* **Incident response** — co útočník udělal v kompromitovaném systému?
* **Digital evidence analysis** — recovery dat z encrypted nebo damaged storage.

## WannaCry (2017) — Case study

[WannaCry](https://en.wikipedia.org/wiki/WannaCry_ransomware_attack) ukazuje význam reverzního inženýrství v cyberbezpečnosti:

* **Květen 2017** — globální ransomware. Infikováno **200 000+ zařízení v 150+ zemích** během několika dní.
* **Britská NHS** — desítky nemocnic, ne-funkční IT, pacienti redirekci.
* **Šíření** přes EternalBlue exploit (CVE-2017-0144) — NSA exploit, který ukradla *The Shadow Brokers*.

**Reverzní analýza:**

Marcus Hutchins ("MalwareTech") analyzoval binárku WannaCry pomocí IDA Pro + dynamic analysis:

* Identifikoval `WinMain` funkci, která se *nejprve* pokouší connect na doménu `iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com`.
* Pokud connect je *successful*, binárka *exits* (žádný encryption).
* Interpretace: **kill switch** nebo *anti-sandbox technika* (sandbox environments often resolve unknown domains to local server, takže successful connect ⇒ sandbox).
* Hutchins *registroval* doménu za $11. Globálně **zastavil šíření** WannaCry během několika hodin.

Kdyby NHS pacient zemřel kvůli WannaCry, byl by to *přímý důsledek nedostatečného patchování* (MS17-010 byl k dispozici 2 měsíce před). RE odhalil mechanismus a umožnil quick mitigation.

## Etika

RE má **morální i právní** dilemata:

* **Pozitivní RE** je obvykle legální:
  * Interoperability (US DMCA § 1201, EU directive 91/250/EEC).
  * Security research (s exemption pod DMCA, FOIA / GDPR articulated rights).
  * Academic research.
* **Negativní RE** často nelegální:
  * Cracking DRM (DMCA, CRA, EUCD).
  * Counterfeiting (trademark, patent law).
  * Reverse + redistribute (copyright).

V ČR / EU:

* **Směrnice 2009/24/ES** — povoluje *limited* reverse engineering pro interoperability.
* **GDPR Art. 22** — automated decision-making transparency = *some* right to understand algorithms.
* **NIS-2 Directive** (2024) — security research exempt z general prohibition.

## Použití pro bezpečný HW

Klíčové aplikace:

* **Reverz smart card firmware** ([[fyzicke-utoky]] + RE) — viz Hitachi H8/3101, PIC 16C84.
* **Reverz HSM firmware** — extrakce custom firmware logiky, identifikace API útoků.
* **Reverz crypto algorithms** v IoT zařízení — viz [[mifare-crypto1|Crypto-1]], [[keeloq|KeeLoq]].
* **Reverz embedded firmware** — extrakce credentials, debug interfaces.
* **Anti-reverse techniky** v BH — jak ztížit RE, viz [[anti-ri-techniky]].

## Tools

Nejpoužívanější RE nástroje (2026):

* **IDA Pro** (Hex-Rays) — gold standard, $500–10 000. Disassembly + decompilation (Hex-Rays decompiler). Cross-platform.
* **Ghidra** (NSA, 2019 open-sourced) — *free*, plnohodnotná alternativa IDA. Java-based, scriptable v Python (Jython) + Java.
* **Radare2 / Cutter** — free, open source. CLI a GUI (Cutter).
* **Binary Ninja** — modern, $300+. Powerful API.
* **x64dbg** — Windows-only debugger.
* **GDB** — Linux debugger.
* **Frida** — dynamic instrumentation, JavaScript scripting.
* **Wireshark** — network protocol RE.

Detaily v [[staticka-analyza]] a [[dynamicka-analyza]].

---

*Zdroj: BZA přednášky 2025/26, BZA 11 — Reverzní inženýrství (Mazura). Externí reference: Eilam, E.: *Reversing: Secrets of Reverse Engineering* (Wiley 2005) — kanonická reference; Sikorski, M., Honig, A.: *Practical Malware Analysis* (No Starch Press 2012); Schneier, B.: *Secrets and Lies* (Wiley 2000); Hutchins, M.: *How to Accidentally Stop a Global Cyber Attacks* (MalwareTech blog 2017) — [archive](https://malwaretech.com/blog/2017/05/how-to-accidentally-stop-a-global-cyber-attacks).*
