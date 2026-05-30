---
title: Kerckhoffův princip a Security through obscurity
---

# Kerckhoffův princip a Security through obscurity

V roce 1883 publikoval nizozemský lingvista Auguste Kerckhoffs šest zásad pro vojenské šifry. Druhá zásada — *"systém nesmí vyžadovat utajení a nesmí trpět, dostane-li se do rukou protivníka"* — je dnes známá jako **Kerckhoffův princip** a stojí v jádru moderní kryptografie. Shannonova ekvivalentní formulace zní: *"the enemy knows the system"* (nepřítel zná systém).

## Zásada

Bezpečnost systému musí záviset *pouze* na utajení **klíčů a hesel**, **nikoliv** na utajení algoritmu. Konkrétně:

* Systém musí být bezpečný i v případě, že útočník zná **všechny detaily** o použitých algoritmech, schématech a protokolech.
* Jediné, co se před útočníkem skrývá, jsou krátké tajné parametry — klíče, hesla, soukromé exponenty.

Tato zásada se může na první pohled zdát kontroverzní: *"proč bychom dali nepříteli zdroják, když ho můžeme tajit?"* Odpověď je čistě praktická — historie ukazuje, že **tajné algoritmy vždy uniknou** (zaměstnanec, reverz, leak, soudní příkaz), zatímco **dobré klíče lze tajit donekonečna** (jsou krátké, nelze je odvodit ze znalosti zařízení).

## Security through Obscurity (STO)

**STO** je opačná filozofie — víra, že systém je bezpečný, *pokud nikdo mimo jeho tvůrce nemá přístup k jeho vnitřnostem*.

Charakteristické rysy:

* Algoritmus se utajuje. NDA, zámky, separace zaměstnanců.
* Specifikace nejde získat, kód se nepublikuje, formát zpráv se nedokumentuje.
* Při průniku se mění *všechno* — algoritmus, formát zpráv, klíče.

STO **nezajišťuje bezpečnost**, ale "pseudobezpečnost":

1. **Jediné prozrazení = konec systému.** Při STO nejde rozdělit znalost o algoritmu od znalosti o klíčích. Když uniká algoritmus, uniká vše. (U Kerckhoffova systému stačí *rotovat klíče*.)
2. **Insider threat je nemitigovatelný.** Stačí jeden nespokojený nebo zkorumpovaný zaměstnanec a celý systém je hotov. Bezpečnost vlastních lidí je obtížně ověřitelná.
3. **Není možnost peer review.** Bez veřejné analýzy zůstávají skryté chyby. Otevřené algoritmy (AES, RSA, SHA) prošly *roky* analýzy stovkami kryptografů; uzavřený algoritmus nemá kým být analyzován jinak než útočníky, kteří ho prolomili.
4. **Reverz je v praxi vždy možný.** *"There is no such thing as tamper-resistant software on a general purpose computer."* — Bruce Schneier. Pokud zařízení obsahuje algoritmus, je jen otázkou času, kdy ho někdo extrahuje (viz [[ri-uvod-motivace]]).

> *"Správná snaha je vytvořit systém algoritmicky bezpečný, nikoli filozoficky bezpečný."*

### Slavné případy selhání STO

Historie poskytuje hojné příklady, kdy obscurity selhala:

* **Mifare Classic Crypto-1** — proprietární proudová šifra od NXP, držena v tajnosti. V r. 2008 zreverzována (Nohl, Plötz) extrakcí gates z čipu, a téhož roku prolomena. Klíče lze rekonstruovat za sekundy ([[mifare-crypto1]]).
* **A5/1 a A5/2 v GSM** — utajené proudové šifry pro mobilní hovory. Po desetiletích konečně odtajněny v 90. letech a okamžitě prolomeny (Briceno, Goldberg, Wagner 1999, Biham et al. 2003) — viz [[a51-gsm]].
* **CSS — Content Scramble System pro DVD** — v r. 1999 zreverzován studentem (DeCSS) za pár dnů.
* **KeeLoq** — rolling-code algoritmus pro autoklíče, utajen u Microchipu. Po úniku specifikace prolomen útokem s 65 536 zachycenými pakety ([[keeloq]]).
* **GSM A5/3 / Kasumi** — i to "zveřejněný, ale nikdo by neměl analyzovat" verze padla útokem (Dunkelman, Keller, Shamir 2010).

Společný motiv: jakmile algoritmus uniká (a *vždy* unikne), zranitelnosti se najdou rychle. Útočníci mají hodně času a motivace, designéři mají mnohem méně.

## Praktický důsledek pro bezpečný hardware

Bezpečné zařízení je *fyzická* implementace kryptografického algoritmu. Kerckhoffova zásada se proto aplikuje zde dvakrát:

::: svg "Kerckhoffova hierarchie: algoritmus je veřejný, schéma je veřejné, klíče jsou jediná tajná informace v zařízení."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40" y="30" width="460" height="150" rx="10"/>
    <rect x="60" y="50" width="420" height="110" rx="8" fill="var(--bg-inset)" stroke="var(--line)"/>
    <rect x="80" y="70" width="380" height="70" rx="6" fill="var(--bg-card)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="22" font-size="12">Bezpečné zařízení (vnější obal)</text>
    <text x="270" y="44" font-size="11" fill="var(--text-muted)">veřejně známé: tvar, čipset, ISO 7816 piny</text>
    <text x="270" y="64" font-size="11" fill="var(--text-muted)">algoritmus (AES, RSA, ECDSA…)</text>
    <text x="270" y="96" font-size="12">Klíče (K, d)</text>
    <text x="270" y="114" font-size="11" fill="var(--accent)">jediné tajemství</text>
    <text x="270" y="132" font-size="10.5" fill="var(--text-muted)">nikdy neopustí čip; při útoku se přepíše (zeroization)</text>
  </g>
</svg>
:::

* **Šifrovací algoritmus** — *není tajný, ale je neměnitelný*. To znamená: AES je veřejně specifikovaný (FIPS 197), ale v ROM HSM je zapečený natrvalo — útočník ho nemůže nahradit slabší variantou.
* **Šifrovací klíče** — *jsou tajné, nikdy je nevypustí ven*. Klíče se generují v zařízení, nebo se importují přes secure-wrapping, ale dál zůstávají v chráněné paměti. Veškeré operace s nimi (šifrování, dešifrování, podepisování) probíhají *uvnitř* zařízení; ven jdou jen výsledky.
* **Vždy ochotné poskytovat operaci** — bezpečné zařízení provede kryptografickou operaci pomocí svého klíče, ale klíč nevydá. Tomu se říká *cryptographic API* — pozor, *toto API* je častým útočným vektorem, protože i bez extrakce klíče může API dovolit využití (viz [[utoky-na-api]]).

## Co to znamená pro vývojáře

Pokud vyvíjíš bezpečný produkt:

* **Použij standardní, veřejně analyzované algoritmy** (AES, RSA, ECDSA, SHA-2/3). NIH ("not invented here") syndrom je v kryptografii zdrojem nejhorších děr.
* **Neutajuj formát zpráv ani protokol.** Spis ho dokumentuj a nech recenzovat. Útočník stejně získá specifikaci z prvního zařízení.
* **Tajemství drž v krátkých, vyměnitelných klíčích.** Hierarchická správa klíčů (KEK, master, session) umožňuje rotaci a izolaci kompromitací.
* **Buduj defense-in-depth.** Nespoléhej, že útočník *nezná* algoritmus — to selže. Spoléhej, že útočník *nezíská klíče* — to lze zajistit kombinací HW ochrany ([[realizace-bh]]), monitoringu (tamper detection) a zoufalých opatření (zeroization).

---

*Zdroj: BZA přednášky 2025/26, BZA 01 — Úvod a motivace. Externí reference: Kerckhoffs, A.: *La cryptographie militaire*, Journal des sciences militaires, 1883 — [historický překlad](https://www.petitcolas.net/kerckhoffs/); Schneier, B.: *Secrets and Lies* (Wiley 2000), kap. 7; NIST: *Guidelines on Hardware-Rooted Security in Mobile Devices* (SP 800-164, 2012).*
