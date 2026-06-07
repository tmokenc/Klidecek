---
title: SW vs. HW implementace — dopady
---

Když [[partitioning]] přiřadí konkrétní funkci na softwarovou nebo hardwarovou stranu, zdědí tím i celý balík vlastností, které z této volby plynou. Rozdíl není kosmetický — týž algoritmus má v SW a v HW jinou latenci, jinou spotřebu energie, jinou míru determinismu a jiné náklady na změnu. Tato sekce rozebírá, *jak přesně* se volba realizace propisuje do vlastností systému, na dvou kanonických příkladech (FFT a AES) a na efektu zvaném race-to-sleep.

## Jak se zpracovává úloha — sekvenčně vs. prostorově

Procesor zpracovává program **sekvenčně**: každá instrukce projde cyklem **fetch–decode–execute** (načtení, dekódování, vykonání). Datová cesta CPU je obecná, takže ji lze přeprogramovat na cokoli — ale za cenu, že každá operace platí režii načtení a dekódování instrukce a přesunů mezi registry a pamětí.

Dedikovaný hardware naopak rozprostře výpočet **v prostoru**: pro každou operaci existuje vlastní obvod a mnoho operací běží **současně v jednom hodinovém cyklu** (prostorový paralelismus, pipelining). Odpadá dekódování instrukcí — spínají se jen tranzistory potřebné pro danou funkci.

::: svg "SW provádí operace jednu po druhé na sdílené ALU; HW je rozprostře do paralelní zřetězené struktury"
<svg viewBox="0 0 540 180" xmlns="http://www.w3.org/2000/svg">
  <text x="135" y="18" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--text)">SW — sekvenčně na jedné ALU</text>
  <text x="405" y="18" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--text)">HW — prostorově paralelně</text>
  <line x1="270" y1="30" x2="270" y2="165" stroke="var(--line)" stroke-width="1"/>
  <!-- SW timeline -->
  <text x="20" y="48" font-size="9" fill="var(--text-faint)" font-family="var(--font-mono)">čas →</text>
  <rect x="20" y="55" width="40" height="22" rx="3" fill="oklch(0.62 0.14 264 / 0.20)" stroke="oklch(0.62 0.14 264)"/>
  <text x="40" y="70" text-anchor="middle" font-size="10" fill="var(--text)">op1</text>
  <rect x="65" y="55" width="40" height="22" rx="3" fill="oklch(0.62 0.14 264 / 0.20)" stroke="oklch(0.62 0.14 264)"/>
  <text x="85" y="70" text-anchor="middle" font-size="10" fill="var(--text)">op2</text>
  <rect x="110" y="55" width="40" height="22" rx="3" fill="oklch(0.62 0.14 264 / 0.20)" stroke="oklch(0.62 0.14 264)"/>
  <text x="130" y="70" text-anchor="middle" font-size="10" fill="var(--text)">op3</text>
  <rect x="155" y="55" width="40" height="22" rx="3" fill="oklch(0.62 0.14 264 / 0.20)" stroke="oklch(0.62 0.14 264)"/>
  <text x="175" y="70" text-anchor="middle" font-size="10" fill="var(--text)">op4</text>
  <text x="135" y="105" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">každá op = fetch–decode–execute</text>
  <text x="135" y="120" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">latence ∝ počet operací</text>
  <!-- HW spatial -->
  <rect x="300" y="50" width="46" height="22" rx="3" fill="oklch(0.62 0.14 142 / 0.20)" stroke="oklch(0.62 0.14 142)"/>
  <text x="323" y="65" text-anchor="middle" font-size="10" fill="var(--text)">op1</text>
  <rect x="300" y="80" width="46" height="22" rx="3" fill="oklch(0.62 0.14 142 / 0.20)" stroke="oklch(0.62 0.14 142)"/>
  <text x="323" y="95" text-anchor="middle" font-size="10" fill="var(--text)">op2</text>
  <rect x="356" y="50" width="46" height="22" rx="3" fill="oklch(0.62 0.14 142 / 0.20)" stroke="oklch(0.62 0.14 142)"/>
  <text x="379" y="65" text-anchor="middle" font-size="10" fill="var(--text)">op3</text>
  <rect x="356" y="80" width="46" height="22" rx="3" fill="oklch(0.62 0.14 142 / 0.20)" stroke="oklch(0.62 0.14 142)"/>
  <text x="379" y="95" text-anchor="middle" font-size="10" fill="var(--text)">op4</text>
  <line x1="346" y1="61" x2="356" y2="61" stroke="var(--line-strong)" stroke-width="1.2"/>
  <line x1="346" y1="91" x2="356" y2="91" stroke="var(--line-strong)" stroke-width="1.2"/>
  <text x="405" y="125" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">vše v jednom (zřetězeném) cyklu</text>
  <text x="405" y="140" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">latence ∝ hloubka, ne počet</text>
</svg>
:::

## Kompromis (trade-off) vlastností

| Vlastnost | Softwarová implementace | Hardwarová implementace |
| :--- | :--- | :--- |
| Výkon / propustnost | limitován taktem a IPC procesoru | prostorový paralelismus → vysoká propustnost |
| Determinismus | jitter z plánování OS, přerušení, cache | cyklově přesný, garantovaná odezva |
| Energie na operaci | vyšší (režie instrukcí, paměti) | nižší (jen nezbytná logika) |
| Flexibilita | snadná oprava a OTA aktualizace | rigidní, oprava ASIC = nová maska |
| Náklady na vývoj | nízké pro standardní MCU | vysoké NRE (ASIC), drahý čip (FPGA) |
| Rentabilita | malé série, prototypy | masová produkce (ASIC) |

Jitter je pro **tvrdý reálný čas** zásadní: SW odezva kolísá kvůli plánovači, obsluze přerušení a hierarchii cache, zatímco HW dává tutéž odezvu každý cyklus. Proto se v bezpečnostně kritických doménách (automotive, letectví) časově kritické smyčky realizují v HW. Naopak rigidita HW znamená, že chyba v návrhu ASIC se opravuje extrémně draze a pomalu — kdežto SW se přepíše a nahraje.

## Příklad 1 — FFT (datový tok, propustnost) {tier=example}

Rychlá Fourierova transformace je sledem motýlkových (butterfly) operací. V SW běží sekvenčně: i s DSP instrukcemi brzdí procesor nutnost přesouvat data mezi registry a pamětí. Řádově je 1024-bodová FFT na malém Cortex-M procesoru otázkou stovek mikrosekund.

V HW (FPGA/ASIC) se použije **paralelně zřetězená** struktura, kde adresování, výpočet koeficientů a motýlky běží souběžně. Tatáž transformace pak trvá řádově **tisíce hodinových cyklů** a spotřebuje **zlomek mikrojoulu** na operaci. Výsledkem je řádové zkrácení času i výrazná úspora energie — FFT je proto typický kandidát na přesun do HW akcelerátoru.

## Příklad 2 — AES (bezpečnost, energie) a race-to-sleep

Šifrování AES v SW (čistě v C) musí mít v paměti S-boxy a provádí operace na procesoru — jeden blok zabere řádově **deset tisíc cyklů**. Dedikovaný AES modul zašifruje blok řádově za **tisíc cyklů**, tedy přibližně desetkrát rychleji.

Klíčový a často matoucí bod je energie. HW modul může mít *vyšší okamžitý příkon* než CPU (širší aktivní logika), přesto spotřebuje **méně celkové energie**. Energie je totiž *integrál výkonu v čase*:

::: math
E = ∫ P(t) dt ≈ P_avg · t
:::

Akcelerátor sice odebírá víc proudu, ale práci dokončí mnohonásobně rychleji a systém pak přejde do úsporného režimu. Tomuto principu se říká **race-to-sleep** (závod ke spánku): rychleji hotovo → dřív do sleep → menší plocha pod křivkou výkonu → nižší celková spotřeba. Pro bateriově napájené IoT je to rozhodující.

::: viz nav-race-to-sleep "Posuvníkem měň, jak rychle a s jakým příkonem dokončí úlohu HW akcelerátor vs. CPU. Plocha pod křivkou = spotřebovaná energie — vyšší špička HW je často víc než vykoupena kratším časem."
:::

## Past režie komunikace

Přesun funkce do HW není vždy výhra. Pokud akcelerátor zpracovává **malé porce dat**, čas a energie strávené nastavováním přenosu (konfigurace DMA, přesun přes sběrnici) mohou **úplně smazat** zisk z rychlejšího výpočtu. Pro malé objemy tak může být paradoxně levnější ponechat funkci v SW. Toto je tatáž cena řezu, kterou [[partitioning]] započítává do účelové funkce — a důvod, proč se akcelerace vyplatí hlavně tam, kde poměr „výpočet na bajt" je vysoký.

Typické vyvážené rozdělení v průmyslovém řízení (např. na heterogenní platformě s ARM jádrem i FPGA logikou): časově kritické a determinismus vyžadující výpočty — filtrace, generování PWM, souřadnicové transformace — jdou do FPGA, zatímco vysokoúrovňová regulační logika (např. regulátor otáček) běží v SW na procesoru. Tak systém splní tvrdý reálný čas při minimální ploše čipu.

::: quiz "HW AES modul má vyšší okamžitý odběr proudu než CPU. Jak může spotřebovat méně energie?"
- [x] Energie je integrál výkonu v čase; modul dokončí práci mnohonásobně rychleji, takže plocha pod křivkou výkonu (a tím i čas v aktivním režimu) je menší — race-to-sleep.
  > Správně. Vyšší špičkový příkon je vykoupen výrazně kratší dobou běhu a rychlým přechodem do sleep.
- [ ] Vyšší proud vždy znamená vyšší energii, takže CPU je energeticky úspornější.
  > To zaměňuje výkon (W) za energii (J). Rozhodující je integrál výkonu v čase, ne okamžitá špička.
- [ ] HW modul běží na nižším napětí, proto má při stejném čase nižší energii.
  > Úspora plyne především z kratšího času běhu (race-to-sleep), ne z napětí; navíc okamžitý příkon HW je zde naopak vyšší.
:::

::: link "Boost MCU security AND performance with hardware-accelerated crypto (Embedded.com)" "https://www.embedded.com/boost-mcu-security-and-performance-with-hardware-accelerated-crypto/"
:::

::: link "Interfacing a high-speed crypto accelerator to an embedded CPU — komunikační režie smaže zisk" "https://www.researchgate.net/publication/4128833_Interfacing_a_high_speed_crypto_accelerator_to_an_embedded_CPU"
:::

---

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: Embedded.com — hardware-accelerated crypto on MCUs; Hodjat & Verbauwhede: „Interfacing a high speed crypto accelerator to an embedded CPU" (komunikační režie koprocesoru); STM32 / ESP32 měření SW vs. HW AES (energie a propustnost); Hennessy & Patterson: „Computer Architecture: A Quantitative Approach" — energie jako integrál výkonu, race-to-idle.*
