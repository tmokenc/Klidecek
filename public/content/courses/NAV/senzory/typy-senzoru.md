---
title: Typy senzorů
---

Senzor je první článek měřicího řetězce a rozhoduje o tom, *jak vůbec* se neelektrická veličina dostane do elektrické podoby. Základní dělení vychází z **energetické bilance** převodu: záleží na tom, zda senzor energii pro signál sám generuje, nebo zda jen moduluje energii dodanou zvnějšku. Z toho plyne dvojice pasivní/aktivní, kterou zkoušející rád ověřuje — a pozor, význam je v měřicí technice obrácený než v elektronice obvodů.

## Pasivní (parametrické) senzory

Pasivní senzor sám žádné napětí ani náboj negeneruje. Působením měřené veličiny mění některý ze svých **elektrických parametrů** — odpor *R*, kapacitu *C* nebo indukčnost *L*. Aby se tato změna projevila jako měřitelný signál (napětí, proud), je nutné **vnější napájení** — typicky budicí proud nebo napětí přivedené na senzor, často přes můstkové zapojení.

| Senzor | Měřená veličina | Měněný parametr |
|---|---|---|
| Tenzometr | síla, tlak, deformace | odpor *R* (drát se při protažení ztenčuje a prodlužuje) |
| Odporový teploměr Pt100 | teplota | odpor *R* (100 Ω při 0 °C, roste s teplotou) |
| Kapacitní snímač | přiblížení, vlhkost, hladina | kapacita *C* |
| Indukční snímač | poloha, přiblížení kovu | indukčnost *L* |

Označení *parametrický* je proto výstižnější než „pasivní": senzor je vlastně proměnný *parametr* (rezistor, kondenzátor) v obvodu. Příkladem je platinový teploměr Pt100, jehož odpor roste s teplotou podle dobře definované, téměř lineární charakteristiky.

## Aktivní (generátorické) senzory

Aktivní senzor je **přímý měnič** neelektrické energie na elektrickou — sám generuje náboj, proud nebo napětí a **nepotřebuje vnější napájení**. Měřená veličina dodává energii, kterou senzor přemění na elektrický signál.

| Senzor | Princip | Výstup |
|---|---|---|
| Termočlánek | Seebeckův (termoelektrický) jev | napětí úměrné rozdílu teplot spojů |
| Piezoelektrický snímač | piezoelektrický jev | náboj úměrný mechanickému napětí (tlak, zrychlení) |
| Fotovoltaický článek | fotoelektrický jev | napětí/proud úměrný osvětlení |
| Indukční (otáčkový) senzor | elektromagnetická indukce | napětí úměrné rychlosti změny pole |

Termočlánek dá napětí řádově desítky mikrovoltů na stupeň a jeho charakteristika je nelineární, takže za ním v řetězci vždy stojí citlivý zesilovač a softwarová linearizace.

::: svg "Energetická bilance převodu: pasivní senzor moduluje energii z vnějšího zdroje, aktivní ji čerpá přímo z měřené veličiny."
<svg viewBox="0 0 540 188" xmlns="http://www.w3.org/2000/svg">
  <text x="135" y="16" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--accent)">PASIVNÍ (parametrický)</text>
  <rect x="22" y="60" width="78" height="46" rx="6" fill="var(--bg-inset)" stroke="var(--text-muted)"/>
  <text x="61" y="80" text-anchor="middle" font-size="10" fill="var(--text)">napájení</text>
  <text x="61" y="94" text-anchor="middle" font-size="9" fill="var(--text-muted)">budicí zdroj</text>
  <rect x="150" y="60" width="92" height="46" rx="6" fill="oklch(0.62 0.14 264 / 0.12)" stroke="var(--accent)"/>
  <text x="196" y="78" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text)">senzor</text>
  <text x="196" y="92" text-anchor="middle" font-size="9" fill="var(--text-muted)">mění R / C / L</text>
  <line x1="100" y1="83" x2="148" y2="83" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#tsArr)"/>
  <line x1="196" y1="40" x2="196" y2="58" stroke="oklch(0.55 0.18 22)" stroke-width="1.4" marker-end="url(#tsArrR)"/>
  <text x="196" y="36" text-anchor="middle" font-size="9" fill="oklch(0.55 0.18 22)">měřená veličina</text>
  <line x1="242" y1="83" x2="262" y2="83" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#tsArr)"/>
  <text x="252" y="74" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">signál</text>
  <line x1="270" y1="24" x2="270" y2="160" stroke="var(--line-strong)" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="405" y="16" text-anchor="middle" font-size="11.5" font-weight="600" fill="oklch(0.55 0.16 142)">AKTIVNÍ (generátorický)</text>
  <rect x="356" y="60" width="98" height="46" rx="6" fill="oklch(0.62 0.14 142 / 0.12)" stroke="oklch(0.5 0.16 142)"/>
  <text x="405" y="78" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text)">senzor (měnič)</text>
  <text x="405" y="92" text-anchor="middle" font-size="9" fill="var(--text-muted)">generuje signál</text>
  <line x1="405" y1="40" x2="405" y2="58" stroke="oklch(0.55 0.18 22)" stroke-width="1.4" marker-end="url(#tsArrR)"/>
  <text x="405" y="36" text-anchor="middle" font-size="9" fill="oklch(0.55 0.18 22)">měřená veličina = zdroj energie</text>
  <line x1="454" y1="83" x2="476" y2="83" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#tsArr)"/>
  <text x="466" y="74" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">U, Q</text>
  <text x="135" y="138" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">tenzometr · Pt100 · kapacitní</text>
  <text x="405" y="138" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">termočlánek · piezo · fotovoltaický</text>
  <defs>
    <marker id="tsArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)"/>
    </marker>
    <marker id="tsArrR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.18 22)"/>
    </marker>
  </defs>
</svg>
:::

## Pozor na záměnu pojmů

V *obvodové* elektronice „aktivní prvek" znamená prvek, který do obvodu dodává energii (zdroj, tranzistor), a „pasivní" je rezistor či kondenzátor. V *senzorice* je dělení postavené na témže principu, ale výsledek působí opačně: pasivní senzor *je* proměnný odpor/kondenzátor a potřebuje napájení, kdežto aktivní senzor energii sám dává. Je tedy nutné vždy vědět, zda mluvíme o senzorech, nebo o obvodových prvcích — to je častá past u zkoušky.

## Inteligentní (smart) senzory {tier=extra}

Moderní trend integruje na jeden čip nejen samotné čidlo, ale i celý začátek měřicího řetězce: zesilovač, **A/D převodník** a **mikroprocesor**. Smart senzor pak komunikuje s nadřazeným MCU rovnou v **digitální** podobě, přes sběrnici jako I2C, SPI nebo 1-Wire.

Tím získává řadu předností:

* **Autokalibrace a teplotní kompenzace** přímo v senzoru — výrobce uloží kalibrační koeficienty do paměti čipu, senzor sám koriguje chybu.
* **Odolnost proti rušení** — digitální signál na krátké sběrnici je mnohem méně citlivý na šum než slabý analogový signál vedený k externímu ADC.
* **Hotová data v jednotkách** — nadřazené MCU nemusí řešit AFE ani přepočet, dostane rovnou např. teplotu ve °C.

Typickým příkladem je teploměr DS18B20 (1-Wire) nebo barometrické a inerciální senzory na I2C/SPI v mobilních zařízeních.

::: svg "Smart senzor přesouvá AFE, ADC i přepočet na samotný čip — ven jde rovnou digitální hodnota."
<svg viewBox="0 0 460 132" xmlns="http://www.w3.org/2000/svg">
  <rect x="14" y="24" width="300" height="84" rx="8" fill="var(--bg-inset)" stroke="var(--accent)" stroke-dasharray="5 4"/>
  <text x="164" y="42" text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)">jeden čip — smart senzor</text>
  <rect x="28" y="56" width="58" height="38" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="57" y="79" text-anchor="middle" font-size="9.5" fill="var(--text)">čidlo</text>
  <rect x="98" y="56" width="58" height="38" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="127" y="79" text-anchor="middle" font-size="9.5" fill="var(--text)">AFE</text>
  <rect x="168" y="56" width="58" height="38" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="197" y="79" text-anchor="middle" font-size="9.5" fill="var(--text)">ADC</text>
  <rect x="238" y="56" width="62" height="38" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="269" y="76" text-anchor="middle" font-size="9.5" fill="var(--text)">µP</text>
  <text x="269" y="88" text-anchor="middle" font-size="8" fill="var(--text-muted)">kalibrace</text>
  <line x1="314" y1="66" x2="356" y2="66" stroke="oklch(0.5 0.16 142)" stroke-width="1.6" marker-end="url(#ssArr)"/>
  <text x="335" y="60" text-anchor="middle" font-size="8.5" fill="oklch(0.5 0.16 142)">I2C/SPI</text>
  <rect x="358" y="48" width="92" height="40" rx="6" fill="oklch(0.62 0.14 264 / 0.12)" stroke="var(--accent)"/>
  <text x="404" y="66" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text)">MCU</text>
  <text x="404" y="79" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">data v °C</text>
  <defs>
    <marker id="ssArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.5 0.16 142)"/>
    </marker>
  </defs>
</svg>
:::

::: quiz "Termočlánek a tenzometr — který z nich potřebuje pro svou funkci vnější napájecí zdroj?"
- [x] Tenzometr — je pasivní (parametrický), mění jen odpor a bez budicího proudu nedá žádný signál.
  > Správně. Tenzometr je proměnný rezistor; změna odporu se projeví jako napětí jen tehdy, protéká-li jím budicí proud (typicky ve Wheatstoneově můstku).
- [ ] Termočlánek — protože generuje jen velmi malé napětí.
  > Termočlánek je aktivní (generátorický) senzor — napětí generuje sám díky Seebeckovu jevu, žádné napájení nepotřebuje. Malé napětí se řeší zesílením, ne napájením.
- [ ] Oba — každý senzor potřebuje napájení.
  > Ne. Aktivní senzory (termočlánek, piezo) energii pro signál čerpají přímo z měřené veličiny.
- [ ] Žádný — oba generují signál samy.
  > Tenzometr sám nic negeneruje, je to pasivní parametrický senzor.
:::

::: link "Texas Instruments — Sensor types and signal conditioning (overview)" "https://www.ti.com/sensing-products/overview.html"
:::

::: link "Analog Devices — Practical Temperature Measurements (thermocouples, RTDs)" "https://www.analog.com/en/resources/technical-articles/practical-temperature-measurements.html"
:::

---

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: Texas Instruments sensor overview, Analog Devices temperature measurement.*
