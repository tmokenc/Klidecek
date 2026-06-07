---
title: Reverzní inženýrství — úvod a motivace
---

# Reverzní inženýrství — úvod a motivace

**Reverzní inženýrství** (reverse engineering, RE) je proces získávání znalostí nebo informací o návrhu z něčeho, co už bylo vyrobeno — a to za účelem následného reprodukování, úpravy nebo analýzy. V kontextu bezpečného hardwaru se zaměřujeme na **softwarové reverzní inženýrství**, tedy na získávání logiky, algoritmů, klíčů a struktury z přeloženého binárního kódu.

> *"There is no such thing as tamper-resistant software on a general purpose computer. If your computer can see the instructions, then you can see them, too."* — **Bruce Schneier**

## Dopředné vs. reverzní inženýrství

::: svg "Dopředné inženýrství: požadavky → návrh → kód → chování. Reverzní inženýrství: z běžícího systému zpětně rekonstruovat strukturu, návrh, požadavky."
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
    <path d="M420,50 L120,50"/>
  </g>
</svg>
:::

* **Dopředné inženýrství** (forward engineering) — klasický vývoj softwaru:
  * Požadavky → návrh → zdrojový kód → chování (za běhu).
* **Reverzní inženýrství** (reverse engineering) — opačný směr:
  * Binární kód → zdrojový kód (dekompilace, decompilation) → návrh (algoritmus, datové struktury) → požadavky / specifikace.

Klíčovým pojmem je **úroveň abstrakce** (abstraction level). Reverzní inženýrství obvykle postupuje od *nejnižší* úrovně abstrakce (strojový kód, hexadecimální bajty) k vyšší (logika, business pravidla). Jinými slovy: začínáme u toho, co počítač skutečně vykonává, a postupně se propracováváme k tomu, co měl program dělat a proč.

### Úrovně abstrakce

* **Aplikační vrstva** — koncepty, politiky, business pravidla.
* **Funkční** — logické a funkční specifikace, nefunkční požadavky.
* **Strukturální** — grafy závislostí, architektura, tok dat.
* **Implementační** — zdrojové soubory, tabulka symbolů (symbol table).

V kybernetické bezpečnosti často nezáleží na *kompletním* rozboru — stačí získat *konkrétní* informaci (například kryptografické klíče, autentizační logiku nebo zranitelnou funkci).

## Motivace — pozitivní

* **Vylepšení starého SW** — modernizace starších (legacy) systémů, u nichž zdrojový kód neexistuje (firma jej převzala, ztratil se, nebo je chráněn autorským právem).
* **Získání know-how** — porozumění algoritmům konkurence, akademický výzkum.
* **Migrace HW/SW** — přenos aplikace do nového prostředí, které výrobce nepodporuje.
* **Znovupoužitelnost** — vytažení znovupoužitelných komponent.
* **Bezpečnost:**
  * **Oprava chyb** — záplatování (patching) nalezených zranitelností (vulnerabilities), zejména u zařízení, která výrobce sám neaktualizuje.
  * **Vylepšení obrany proti RE** — autor musí znát útok (attack), aby proti němu dokázal napsat obranu.
  * **Detekce škodlivého SW** — antivirové programy, EDR a týmy zabývající se threat intelligence reverzně analyzují malware.
  * **Ověřování SW** — ověření funkčnosti, bezpečnosti a neexistence zadních vrátek (backdoorů).
* **Kompatibilita / interoperabilita** — open-source ekvivalenty (Wine, OpenJDK, ReactOS).

## Motivace — negativní (útočná)

* **Cracking** — obcházení DRM, softwarového licencování a ochrany proti kopírování.
* **Softwarové pirátství** — vytváření nelegálních kopií a generátorů klíčů (keygenů).
* **Získání citlivých dat** — přihlašovací údaje (credentials), klíče, business algoritmy.
* **Hledání zranitelností** — za účelem jejich zneužití (exploit), ať už při penetračním testování, nebo se zlými úmysly.
* **Modifikace SW** — přidání vlastní funkčnosti, podvádění (cheaty) ve hrách.
* **Kopírování produktu** — padělání (counterfeiting), například padělané čipy nebo napodobeniny hardwaru.

## Motivace — zdroje

* **Finanční** — ušetření nákladů na vývoj, prodej cracknuté verze, ransomware.
* **Lidské zdroje** — obejití netriviálního vývoje, který by jinak bylo nutné odvést.
* **Čas** — rychlá reverzní analýza oproti plnému vývoji od začátku.

## Aplikace v kyberbezpečnosti {tier=practice}

### Obranné (defensive)

* **Analýza malwaru** — co dělá ransomware? Jaké jsou indikátory kompromitace (IoC)? Jak se šíří? Příklad: [objevení kill switche WannaCry](https://blog.malwarebytes.com/threat-analysis/2017/05/the-worm-that-spreads-wanacrypt0r/) (Marcus Hutchins, 2017) — při reverzní analýze binárky WannaCry zjistil, že malware ověřuje doménu `www.iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com`; registrace této domény ho celosvětově deaktivovala.
* **Výzkum zranitelností** — Project Zero (Google), TrendMicro Zero Day Initiative, Pwn2Own.
* **Threat intelligence** — atribuce APT skupin (podobné vzory v kódu, použité knihovny).
* **Detekce anti-debug / anti-VM technik** — porozumění technikám, kterými se malware brání analýze.

### Útočné (offensive)

* **Vývoj exploitů** — pro penetrační testování, nebo pro škodlivé aktéry.
* **Bug bounty** — hledání chyb v populárním softwaru.
* **Patch diffing** — porovnání záplatované a nezáplatované binárky, díky němuž lze zjistit, *která chyba* byla opravena, a následně vytvořit *N-day* exploit.

### Forenzní (forensic)

* **Reakce na incidenty (incident response)** — co útočník provedl v kompromitovaném systému?
* **Analýza digitálních důkazů** — obnova dat ze zašifrovaného nebo poškozeného úložiště.

## WannaCry (2017) — případová studie {tier=example}

[WannaCry](https://en.wikipedia.org/wiki/WannaCry_ransomware_attack) dobře ukazuje význam reverzního inženýrství v kybernetické bezpečnosti:

* **Květen 2017** — celosvětový ransomware. Během několika dní bylo nakaženo **více než 200 000 zařízení ve více než 150 zemích**.
* **Britská NHS** — postiženy desítky nemocnic, nefunkční IT, pacienti byli přesměrováváni jinam.
* **Šíření** probíhalo přes exploit EternalBlue (CVE-2017-0144) — šlo o exploit NSA, který ukradla skupina *The Shadow Brokers*.

**Reverzní analýza:**

Marcus Hutchins ("MalwareTech") analyzoval binárku WannaCry pomocí nástroje IDA Pro v kombinaci s dynamickou analýzou:

* Identifikoval funkci `WinMain`, která se *nejprve* pokouší připojit k doméně `iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com`.
* Pokud se připojení *podaří*, binárka se *ukončí* (žádné šifrování neproběhne).
* Interpretace: jedná se o **kill switch** nebo o *anti-sandbox techniku* (analytická prostředí typu sandbox totiž často překládají neznámé domény na lokální server, takže úspěšné připojení ⇒ jde nejspíš o sandbox).
* Hutchins doménu *zaregistroval* za 11 dolarů. Tím během několika hodin **celosvětově zastavil šíření** WannaCry.

Pokud by kvůli WannaCry zemřel pacient NHS, byl by to *přímý důsledek nedostatečného záplatování* (aktualizace MS17-010 byla k dispozici už 2 měsíce předtím). Reverzní analýza odhalila mechanismus malwaru a umožnila jeho rychlé zneškodnění.

## Etika {tier=extra}

Reverzní inženýrství s sebou nese **morální i právní** dilemata:

* **Pozitivní RE** je obvykle legální:
  * Interoperabilita (americký zákon DMCA § 1201, evropská směrnice 91/250/EHS).
  * Bezpečnostní výzkum (s výjimkou podle DMCA, práva vyplývající z FOIA / GDPR).
  * Akademický výzkum.
* **Negativní RE** je často nelegální:
  * Cracking DRM (DMCA, CRA, EUCD).
  * Padělání (ochranné známky, patentové právo).
  * Reverzní analýza spojená s další distribucí (autorské právo).

V ČR a EU:

* **Směrnice 2009/24/ES** — povoluje *omezené* reverzní inženýrství za účelem interoperability.
* **GDPR čl. 22** — transparentnost automatizovaného rozhodování zakládá *určité* právo porozumět použitým algoritmům.
* **Směrnice NIS-2** (2024) — bezpečnostní výzkum je vyňat z obecného zákazu.

## Použití pro bezpečný HW

Klíčové oblasti použití:

* **Reverzní analýza firmwaru čipových karet** ([[fyzicke-utoky]] + RE) — viz Hitachi H8/3101, PIC 16C84.
* **Reverzní analýza firmwaru HSM** — získání logiky vlastního firmwaru, identifikace útoků přes API.
* **Reverzní analýza kryptografických algoritmů** v zařízeních IoT — viz [[mifare-crypto1|Crypto-1]], [[keeloq|KeeLoq]].
* **Reverzní analýza vestavěného (embedded) firmwaru** — získání přihlašovacích údajů, hledání ladicích (debug) rozhraní.
* **Techniky proti reverznímu inženýrství** v bezpečném hardwaru — jak RE ztížit, viz [[anti-ri-techniky]].

## Nástroje

Nejpoužívanější nástroje pro reverzní inženýrství (2026):

* **IDA Pro** (Hex-Rays) — zlatý standard, 500–10 000 dolarů. Disassembler i dekompilátor (Hex-Rays decompiler). Funguje napříč platformami.
* **Ghidra** (NSA, uvolněno jako open source v roce 2019) — *zdarma*, plnohodnotná alternativa k IDA. Postaveno na Javě, skriptovatelné v Pythonu (Jython) i v Javě.
* **Radare2 / Cutter** — zdarma, open source. K dispozici v příkazové řádce (CLI) i s grafickým rozhraním (Cutter).
* **Binary Ninja** — moderní nástroj, od 300 dolarů. Výkonné API.
* **x64dbg** — debugger pouze pro Windows.
* **GDB** — debugger pro Linux.
* **Frida** — dynamická instrumentace, skriptování v JavaScriptu.
* **Wireshark** — reverzní analýza síťových protokolů.

Podrobnosti najdete v [[staticka-analyza]] a [[dynamicka-analyza]].

---

### Videa

::: youtube "https://www.youtube.com/watch?v=gPsYkV7-yJk" "Self-Learning Reverse Engineering in 2022" "LiveOverflow"
:::

*Zdroj: BZA přednášky 2025/26, BZA 11 — Reverzní inženýrství (Mazura). Externí reference: Eilam, E.: *Reversing: Secrets of Reverse Engineering* (Wiley 2005) — kanonická reference; Sikorski, M., Honig, A.: *Practical Malware Analysis* (No Starch Press 2012); Schneier, B.: *Secrets and Lies* (Wiley 2000); Hutchins, M.: *How to Accidentally Stop a Global Cyber Attacks* (MalwareTech blog 2017) — [archive](https://malwaretech.com/blog/2017/05/how-to-accidentally-stop-a-global-cyber-attacks).*
