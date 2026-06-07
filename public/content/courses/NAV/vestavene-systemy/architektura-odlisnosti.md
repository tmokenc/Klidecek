---
title: Klíčové odlišnosti
---

Univerzální i vestavěný systém stojí na stejné výpočetní architektuře, ale jsou *jinak naladěné*. GPCS je optimalizovaný na všestrannost a propustnost; vestavěný systém na **spolehlivost, efektivitu a předvídatelnou odezvu** za přísných omezení zdrojů. Tento rozdíl v cíli prosakuje do každé vrstvy návrhu — od pouzdra procesoru přes architekturu paměti a periferie až po operační systém, vývojový proces a požadavky na životnost.

## Procesor — MPU vs. MCU / SoC

GPCS staví na **mikroprocesoru (MPU)**: vysoce výkonné jádro, které samo o sobě nestačí — ke své funkci potřebuje řadu *externích* obvodů na základní desce (řadič paměti, čipovou sadu, grafiku, komunikační čipy). To dává volnost (paměť, GPU i periferie lze libovolně skládat a rozšiřovat), ale za cenu prostoru, spotřeby a ceny.

Vestavěný systém naopak žene **míru integrace** do podoby *systému na čipu* — **MCU (mikrokontrolér)**, resp. **SoC (System on a Chip)**. Jediné pouzdro integruje procesorové jádro, paměti (Flash + RAM) i specifické periferie přímo na čipu:

* A/D a D/A převodníky pro analogové vstupy/výstupy,
* časovače/čítače (timery), generátory PWM,
* komunikační rozhraní (SPI, I²C, UART, …),
* řadiče přerušení a DMA.

Výsledkem je jediná, levná a úsporná součástka, kterou stačí osadit minimem dalších prvků — ideální pro malé, levné a bateriově napájené zařízení.

## Von Neumann vs. Harvard — determinismus přístupu k paměti

GPCS typicky vychází z **Von Neumannovy architektury**: instrukce i data sdílejí *jednu* adresní paměť a *jednu* sběrnici. To usnadňuje flexibilní alokaci paměti (kód i data čerpají ze stejného prostoru), ale vytváří **Von Neumannovo úzké hrdlo** — protože přes jedinou sběrnici nelze současně natáhnout instrukci *a* přistoupit k datům, oba přístupy se serializují a propustnost je omezena šířkou pásma jediné cesty.

Mnoho mikrokontrolérů proto sahá po **Harvardově architektuře**: *oddělené* paměti a *oddělené* sběrnice pro instrukce a pro data. Procesor pak může v jednom cyklu **číst instrukci a zároveň přistoupit k datům** — což zvyšuje rychlost a, pro vestavěné systémy ještě důležitější, **determinismus** doby provedení (časování přístupů je předvídatelné, nezávisí na soupeření o jednu sběrnici).

::: viz nav-vonneumann-harvard "Krokuj fetch instrukce a přístup k datům. Vlevo Von Neumann serializuje obojí přes jednu sběrnici (úzké hrdlo), vpravo Harvard zvládne I i D v jednom cyklu."
:::

Pozn.: hranice nejsou ostré — reálné výkonné jádra používají *modifikovanou Harvardovu architekturu* (oddělené L1 cache pro instrukce a data nad společnou hlavní pamětí), takže navenek vypadají jako Von Neumann, ale uvnitř těží z paralelního přístupu.

## Rozhraní — GUI vs. senzory a aktuátory

GPCS orientuje vstupy a výstupy **na člověka**: grafické uživatelské rozhraní (GUI), monitor, klávesnice, myš, dotyk. Vestavěný systém naopak komunikuje s **fyzickým světem** — čte *senzory* a ovládá *aktuátory* (motory, relé, ventily, displeje). K jejich připojení slouží nízkoúrovňová hardwarová rozhraní; tři nejběžnější sériové sběrnice:

| Sběrnice | Vodiče | Typ | Topologie | Typické použití |
|---|---|---|---|---|
| **UART** | 2 (TX, RX) | asynchronní | point-to-point | GPS, Bluetooth/GSM moduly, ladicí konzole |
| **I²C** | 2 (SDA, SCL) | synchronní, half-duplex | sběrnice s adresami | teploměry, RTC, malé periferie |
| **SPI** | 4 (MOSI, MISO, SCK, CS) | synchronní, full-duplex | master/slave, nejrychlejší | SD karty, displeje, rychlé senzory, Flash |

Samotná interakce s periferiemi probíhá na nízké úrovni: **přímým čtením/zápisem registrů**, obsluhou **přerušení** (interrupt — periferie sama upozorní procesor na událost) nebo **přímým přístupem do paměti (DMA)**, který přenáší data mezi periferií a pamětí bez zatížení procesoru.

::: svg "Vestavěný systém připojuje senzory a aktuátory přes nízkoúrovňové sběrnice"
<svg viewBox="0 0 520 176" xmlns="http://www.w3.org/2000/svg">
  <!-- MCU center -->
  <rect x="200" y="58" width="120" height="60" rx="8" fill="oklch(0.62 0.14 264 / 0.14)" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="260" y="84" text-anchor="middle" font-size="13" font-weight="700" fill="var(--accent)">MCU</text>
  <text x="260" y="100" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-family="var(--font-mono)">jádro + periferie</text>
  <!-- sensors (inputs, left) -->
  <rect x="20" y="22" width="118" height="30" rx="5" fill="var(--bg-card)" stroke="oklch(0.55 0.14 142)"/>
  <text x="79" y="41" text-anchor="middle" font-size="10" fill="oklch(0.50 0.14 142)">teploměr (I²C)</text>
  <rect x="20" y="62" width="118" height="30" rx="5" fill="var(--bg-card)" stroke="oklch(0.55 0.14 142)"/>
  <text x="79" y="81" text-anchor="middle" font-size="10" fill="oklch(0.50 0.14 142)">akcelerometr (SPI)</text>
  <rect x="20" y="102" width="118" height="30" rx="5" fill="var(--bg-card)" stroke="oklch(0.55 0.14 142)"/>
  <text x="79" y="121" text-anchor="middle" font-size="10" fill="oklch(0.50 0.14 142)">GPS modul (UART)</text>
  <line x1="138" y1="37" x2="200" y2="74" stroke="oklch(0.55 0.14 142)" stroke-width="1.4" marker-end="url(#nav-arr)"/>
  <line x1="138" y1="77" x2="200" y2="84" stroke="oklch(0.55 0.14 142)" stroke-width="1.4" marker-end="url(#nav-arr)"/>
  <line x1="138" y1="117" x2="200" y2="100" stroke="oklch(0.55 0.14 142)" stroke-width="1.4" marker-end="url(#nav-arr)"/>
  <text x="79" y="150" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">senzory (vstupy)</text>
  <!-- actuators (outputs, right) -->
  <rect x="382" y="42" width="118" height="30" rx="5" fill="var(--bg-card)" stroke="oklch(0.58 0.18 22)"/>
  <text x="441" y="61" text-anchor="middle" font-size="10" fill="oklch(0.50 0.18 22)">motor (PWM)</text>
  <rect x="382" y="82" width="118" height="30" rx="5" fill="var(--bg-card)" stroke="oklch(0.58 0.18 22)"/>
  <text x="441" y="101" text-anchor="middle" font-size="10" fill="oklch(0.50 0.18 22)">displej (SPI)</text>
  <line x1="320" y1="78" x2="382" y2="57" stroke="oklch(0.58 0.18 22)" stroke-width="1.4" marker-end="url(#nav-arr)"/>
  <line x1="320" y1="92" x2="382" y2="97" stroke="oklch(0.58 0.18 22)" stroke-width="1.4" marker-end="url(#nav-arr)"/>
  <text x="441" y="150" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">aktuátory (výstupy)</text>
  <defs>
    <marker id="nav-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="currentColor"/>
    </marker>
  </defs>
</svg>
:::

## Operační systém — GPOS vs. RTOS

GPCS běží na **GPOS** (*General-Purpose OS* — Windows, Linux). Jeho cílem je **maximalizovat celkovou propustnost** a *spravedlivě* (fair-share) sdílet čas procesoru mezi stovky vláken. Důsledkem je, že dispatch latence je *neomezená* — čím více úloh, tím delší a méně předvídatelná zpoždění. Pro PC je to v pořádku: nevadí, když systém na chvíli „zamrzne", protože indexuje soubory.

Vestavěné systémy s časově kritickými úlohami (ABS brzdy, kardiostimulátor, řízení motoru) běží buď zcela **bez OS (bare-metal)**, nebo na **RTOS** (*Real-Time OS*). Tady není nejdůležitější celkový výkon, ale **determinismus** — *garance* splnění kritického časového limitu (**deadlinu**). RTOS proto používá **striktní prioritně-preemptivní plánování**: nejvýznamnější připravená úloha vždy *okamžitě* získá procesor a vyvlastní (preempuje) tu méně důležitou. Latence jsou *ohraničené* (bounded) a předvídatelné.

Rozlišujeme **tvrdý reálný čas** (*hard real-time*) — zmeškání deadlinu je selhání systému (airbag, ABS) — a **měkký reálný čas** (*soft real-time*), kde občasné zpoždění jen zhorší kvalitu (přehrávání videa). Tvrdý reálný čas vyžaduje analýzu *nejhoršího případu* doby provedení (WCET).

::: viz nav-gpos-rtos-scheduling "Stejný scénář, dvě plánovací politiky. Přepni mezi GPOS (fair-share) a RTOS (prioritní preempce) a sleduj, zda kritická úloha stihne deadline."
:::

::: quiz "Proč se v ABS brzdách použije RTOS, a ne výkonný GPOS jako Linux?"
- [ ] Protože RTOS dosahuje vyšší celkové propustnosti než GPOS.
  > Naopak — RTOS obvykle obětuje propustnost. Cílem není kolik práce zvládne, ale jak předvídatelně reaguje.
- [x] Protože RTOS prioritně-preemptivním plánováním garantuje deterministické splnění deadlinu kritické úlohy.
  > Přesně. U bezpečnostně kritické funkce je rozhodující ohraničená, předvídatelná latence (hard real-time), ne maximální výkon.
- [ ] Protože GPOS nepodporuje přerušení od senzorů.
  > GPOS přerušení podporuje. Problém je v plánování: fair-share dává neomezenou dispatch latenci, takže kritická úloha nemá garantovanou odezvu.
:::

## Omezení zdrojů a spolehlivost

Vestavěné systémy podléhají přísným hardwarovým limitům na **fyzické rozměry, cenu výroby a spotřebu energie**. Často běží na baterie, takže vyžadují extrémně efektivní kód, minimalizaci spotřeby (režimy spánku, *sleep modes*) a běh bez aktivního chlazení.

Liší se i nasazení a požadovaná spolehlivost:

| Hledisko | GPCS | Vestavěný systém |
|---|---|---|
| **Prostředí** | čistá kancelář / serverovna | průmysl, automobil, venkov (vibrace, prach) |
| **Teplotní rozsah** | ~0 až 40 °C | průmyslový −40 až +85 °C (automotive až +125 °C) |
| **Životnost** | 3–5 let | 10–20 let |
| **Důsledek pádu** | frustrace, ztráta dat | ohrožení kritické infrastruktury |
| **Fyzický přístup** | běžný (servis) | často žádný (zazděné, v poli) |

Protože vestavěné systémy mohou řídit kritickou infrastrukturu a často k nim *není fyzický přístup*, musí být extrémně spolehlivé. Typickým prvkem je **watchdog timer** — nezávislý hardwarový časovač, který musí software periodicky *„nakrmit"* (resetovat). Pokud software zamrzne a krmení vynechá, watchdog po vypršení automaticky **restartuje systém** a obnoví jeho funkci bez zásahu člověka.

## Vývoj softwaru — křížový vývoj, C/C++/ASM

Zatímco u GPCS dnes převažují vysokoúrovňové jazyky s automatickou správou paměti (Java, C#), vestavěný software se tvoří **křížovým vývojem** (*cross-development*). Program se píše a *překládá na běžném PC* (hostiteli), ale výsledný kód je přeložen pro **zcela jinou cílovou architekturu** (např. ARM) — výkonný host produkuje binárku pro slabý cíl, na nějž se pak nahraje a ladí (typicky přes JTAG/SWD).

Kvůli omezeným zdrojům a potřebě plné kontroly nad pamětí a hardwarovými registry se v drtivé většině používají **C/C++** nebo **jazyk symbolických adres (assembler)**. Tyto jazyky nemají běhovou režii garbage collectoru, dovolují přímý přístup k registrům periferií a dávají deterministické časování — vše, co vestavěný a real-time systém potřebuje.

::: link "ScienceDirect — Harvard Architecture (oddělené sběrnice, paralelní fetch)" "https://www.sciencedirect.com/topics/engineering/harvard-architecture"
:::

::: link "Wikipedia — Real-time operating system (preemptivní plánování, hard/soft)" "https://en.wikipedia.org/wiki/Real-time_operating_system"
:::

::: link "Total Phase — I²C vs. SPI vs. UART (srovnání sériových sběrnic)" "https://www.totalphase.com/blog/2021/12/i2c-vs-spi-vs-uart-introduction-and-comparison-similarities-differences/"
:::

---

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: Wikipedia (Real-time operating system, Harvard architecture), ScienceDirect (Harvard/Von Neumann Architecture), Total Phase (I2C/SPI/UART comparison), NASA RTOS 101.*
