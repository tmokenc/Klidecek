---
title: Typy útoků na biometrické systémy
---

# Typy útoků na biometrické systémy

Biometrické systémy jsou *složité řetězce* (complex stacks) — od senzorů přes databáze až po rozhodovací algoritmy (decision algorithms). Každá vrstva (layer) má vlastní útočnou plochu (attack surface), tedy místo, kudy se dá zaútočit. Ratha, Connell a Bolle v roce 2001 definovali kanonickou taxonomii — 7 typů útoků (attack), které pokrývají *všechny* hlavní vektory útoku.

## 7 typů útoků (Ratha-Connell-Bolle 2001)

::: viz attack-points-7 "Klikněte na bod 1–7 v diagramu; uvidíte konkrétní příklady útoků a vrstvenou obranu."
:::

::: svg "Útočné body biometrického systému: 1 sensor, 2 channel reader→processor, 3 feature extractor, 4 channel extractor→matcher, 5 stored templates, 6 matcher, 7 decision output."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aTA1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--danger, #d33)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="10" y="80" width="80" height="40" rx="4"/>
    <rect x="120" y="80" width="100" height="40" rx="4"/>
    <rect x="250" y="80" width="80" height="40" rx="4"/>
    <rect x="360" y="80" width="80" height="40" rx="4"/>
    <rect x="470" y="80" width="60" height="40" rx="4"/>
    <rect x="240" y="170" width="100" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="50" y="104">Sensor</text>
    <text x="170" y="104">Feat. extractor</text>
    <text x="290" y="104">Matcher</text>
    <text x="400" y="104">Decision</text>
    <text x="500" y="104">Output</text>
    <text x="290" y="195">Template DB</text>
  </g>
  <g fill="var(--danger, #d33)" font-weight="bold" font-size="11">
    <text x="50" y="65" text-anchor="middle">1</text>
    <text x="105" y="65" text-anchor="middle">2</text>
    <text x="170" y="65" text-anchor="middle">3</text>
    <text x="235" y="65" text-anchor="middle">4</text>
    <text x="290" y="65" text-anchor="middle">6</text>
    <text x="400" y="65" text-anchor="middle">7</text>
    <text x="350" y="165" text-anchor="middle">5</text>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="1.2" fill="none" marker-end="url(#aTA1)" stroke-dasharray="2 2">
    <path d="M50,72 L50,78"/>
    <path d="M105,72 L105,80"/>
    <path d="M170,72 L170,78"/>
    <path d="M235,72 L235,80"/>
    <path d="M290,72 L290,78"/>
    <path d="M400,72 L400,78"/>
    <path d="M350,170 L340,170"/>
  </g>
  <g stroke="var(--accent)" stroke-width="0.8" fill="none" stroke-dasharray="3 2">
    <line x1="290" y1="120" x2="290" y2="170"/>
  </g>
</svg>
:::

### 1. Podvržení senzoru (sensor spoofing, presentation attack)

Útočník (attacker) prezentuje senzoru *podvržený* biometrický rys (biometric trait).

* **Falešný otisk prstu (fake fingerprint)** — silikon, želatina, papír (Matsumotův útok s gumovým medvídkem, 2002).
* **Fotografie / video obličeje** — vytištěná fotka, přehrání ze záznamu (screen replay).
* **3D maska** — silikonová rekonstrukce obličeje (Bkav proti Face ID, 2017).
* **Kontaktní čočka s duhovkou** — se vzorem duhovky.
* **Nahrávka hlasu** — předem pořízený zvukový záznam.
* **Syntetický hlas** — vygenerovaný umělou inteligencí.
* **Deepfake video** — výměna obličeje v reálném čase.

Obrana: **detekce živosti (liveness detection)** ([[liveness]]), **multimodální biometrie**, **výzva–odpověď (challenge-response)**.

### 2. Útok přehráním (replay attack, kanál 1)

Útočník **odposlechne** komunikaci mezi senzorem a extraktorem příznaků (feature extractor) a zachycená data *přehraje*.

* **Drátový kanál** — odposlech USB kabelu.
* **Bezdrátový kanál** — zachycení rádiového signálu (NFC, WiFi).
* **Síťový kanál** — mezi klientem a serverem.

Obrana:
* **Šifrování (encryption)** kanálu mezi senzorem a procesorem.
* **Vzájemná autentizace (mutual authentication)** (TLS, zabezpečené zasílání zpráv).
* Ochrana proti přehrání **založená na nonce** (jednorázové náhodné hodnotě).

### 3. Kompromitace extraktoru příznaků

Útočník **nahradí** modul extraktoru příznaků (feature extractor), například instalací škodlivého kódu (malware).

* Výstup: *libovolné příznaky*, které si útočník zvolí.
* Úplné obejití biometrické kontroly.

Obrana:
* **Podepisování kódu (code signing)** biometrických modulů.
* **Bezpečné spouštění (Secure Boot)** + důvěryhodné prostředí pro běh (Trusted Execution Environment, TEE).
* **Povolování aplikací (application allowlisting)** — spustit lze jen výslovně schválené programy.

### 4. Útok přehráním (replay attack, kanál 4)

Probíhá mezi extraktorem příznaků a porovnávačem (matcher) — obdobně jako u bodu 2.

Obrana: podobná (šifrování, hodnoty nonce).

### 5. Útok na databázi šablon

Útok na *uložené* biometrické šablony (templates).

#### Krádež šablon

* Stažení z kompromitované databáze.
* **Využití k vzájemnému párování (cross-matching)** — propojení téže osoby napříč různými systémy.
* **Krádež identity** — vygenerování falešných biometrických dat ze šablon (vzácné, ale možné).

#### Úprava šablon

* Nahrazení šablony oprávněného uživatele šablonou útočníka.
* **Obejití autentizace (authentication)** — útočníkova biometrie pak projde jako shoda.

#### Hashované / šifrované šablony

* I když jsou šablony šifrované, mohou *zachovávat podobnost* (similarity-preserving) — dvě šifrované šablony se tak mohou navzájem shodovat.
* **Zrušitelná biometrie (cancelable biometrics)** — transformované šablony, které *lze odvolat* (revokovat) a nahradit novými.

Obrana:
* **Silné řízení přístupu (access control).**
* **Šifrování dat v klidu (encryption at rest).**
* **Zrušitelná biometrie (cancelable biometrics).**
* **Homomorfní šifrování (homomorphic encryption)** (oblast výzkumu).

### 6. Převzetí porovnávače (matcher override)

Útočník upraví porovnávač (matcher) tak, aby vždy vracel „shoda“ nebo „neshoda“.

Obrana:
* Podepisování kódu.
* Hardware odolný proti manipulaci (HSM, čipová karta).

### 7. Úprava rozhodnutí

Útočník překlopí výsledný rozhodovací bit (přijmout/odmítnout).

Obrana:
* Zabezpečený přenos rozhodnutí.
* Ověřovací kód zprávy (MAC) nad rozhodovací zprávou.
* Vícestupňová autentizace (jeden bit nestačí k obejití).

## Dvě hlavní kategorie útoků

### Prezentační útoky (presentation attacks, PA — také „spoofing“)

* **Na senzoru** — falešná biometrie předložená fyzicky.
* Standardizováno: **ISO/IEC 30107** — detekce prezentačních útoků (Presentation Attack Detection, PAD).

### Nepřímé útoky

* **Za senzorem** — kanály, moduly, databáze.
* Předmět běžné IT bezpečnosti (šifrování, řízení přístupu, bezpečný kód).

## Typy prezentačních útoků (PAI)

### Založené na artefaktu

* Vytvořené z *materiálů* — papírová fotka, silikonová maska, gumový prst.
* **Cena:** 0–1000 USD podle kvality.

### Založené na biometrické šabloně

* Matematická rekonstrukce z ukradené šablony.
* Příklad: **obraz obličeje** vygenerovaný z uniklého vektoru obličejových příznaků (face embedding).
* Obtížné, ale možné (s pomocí generativních sítí GAN).

### Syntetické / generované

* **Deepfaky** pro obličej.
* **Syntéza hlasu** pro hlasovou biometrii.
* **Generativní umělá inteligence** vytvářející falešná biometrická data.

### Pravá biometrie předložená v útoku

* **Nátlak (coercion)** — oprávněný uživatel je donucen se ověřit.
* **Mrtvé tělo** — krajní případ (otisky prstů mrtvoly).
* **Spící uživatel** — odemknutí telefonu spící oběti.

### Jiná část těla oprávněného uživatele

* **Jiný prst**, než který byl zaregistrován.
* **Snímek vlastního obličeje** v režimu selfie.

## Specifické útoky pro různé modality

### Otisk prstu

* **Sejmutí latentního otisku (latent print lifting)** — získání otisku ze skla, klik u dveří apod.
* **3D tištěný** falešný prst.
* Podvržení **gumovým medvídkem**.
* Snímání **lepicí páskou**.

### Obličej

* **Vytištěná fotografie.**
* **Přehrání videa** na displeji.
* **3D maska.**
* **Líčení, brýle, paruky** (snaha o zmatení rozpoznávání).
* **Adversariální nálepky (adversarial patches)** — vytištěné brýle, které obelstí hlubokou neuronovou síť (DL).
* **Deepfake video.**

### Duhovka

* **Vytištěná duhovka na kontaktní čočce.**
* **Fotografie duhovky ve vysokém rozlišení** (předložená kameře).
* **Skutečná duhovka jiné osoby** (krajní případ).

### Hlas

* **Předem pořízená nahrávka.**
* **Syntéza hlasu (TTS, převod textu na řeč).**
* **Konverze hlasu (voice conversion)** — klonování hlasu v reálném čase.

### DNA

* **Kontaminace vzorku** na místě činu.
* **Podstrčení důkazu DNA.**
* **Problémy s interpretací smíšeného vzorku.**

## Měření robustnosti

### Metriky ISO/IEC 30107

* **APCER** (Attack Presentation Classification Error Rate) — % podvrhů přijatých jako pravé.
* **BPCER** (Bona Fide Presentation Classification Error Rate) — % skutečných uživatelů odmítnutých jako podvrh.

Cíle (pro Level 2):
* APCER < 1 %.
* BPCER < 5 %.

### Testování iBeta

* Nezávislé laboratorní testování.
* **Level 1:** základní podvrhy (fotka, video).
* **Level 2:** 3D masky, silikon.

Certifikace iBeta PAD má pouze Level 1 a Level 2 (žádný oficiální „Level 3“). Sofistikovanější útočníci na úrovni státu jsou mimo rámec úrovní iBeta.

Apple Face ID a Windows Hello jsou certifikovány na Level 2.

## Praktické útoky 2010-2025

| Rok | Útok | Modalita | Cíl |
| :--- | :--- | :--- | :--- |
| 2002 | Gumový medvídek (Matsumoto) | otisk prstu | kapacitní senzory |
| 2013 | CCC (Chaos Computer Club) | iPhone 5s Touch ID | obejito během několika dní |
| 2017 | Bkav 3D maska | iPhone X Face ID | obejito silikonovou maskou |
| 2019 | Samsung S10 ultrazvuk | otisk prstu | obejito gumou z tužky |
| 2020 | Různé útoky přeposláním přes BLE | chytré zámky | Tesla, Ford, BMW |
| 2022 | NCC útok přeposláním přes Tesla | BLE PaaK | Model 3 odemčen z 25 m |
| 2023 | Varianty TPM-Fail | TPM 2.0 | získání klíče ECDSA |
| 2024 | Deepfake v bankovnictví | biometrie obličeje | obejití mobilního bankovnictví |

## Obrana do hloubky (defense in depth)

> Žádná *jediná* obrana nestačí. Je třeba kombinovat:

1. **Detekce živosti (liveness detection)** ([[liveness]]).
2. **Multimodální biometrie**.
3. **Výzva–odpověď (challenge-response)** (aktivní detekce živosti).
4. **Průběžná autentizace (continuous authentication)** (ne jen na začátku).
5. **Vícefaktorové ověření (multi-factor)** (biometrie + PIN + token).
6. **Autentizace podle míry rizika (risk-based authentication)** — u cennějších operací proběhnou kontroly navíc.
7. **Detekce anomálií** — neobvyklé vzorce přístupu.
8. **Auditní záznamy (audit logging).**

## Doporučená četba

* **NIST IR 8472** — aktualizace standardů pro podvrhy biometrie a PAD.
* **ISO/IEC 30107-3** — testování PAD.
* **ASVspoof Challenge** — obrana proti podvrhům hlasu.
* **Soutěže v detekci živosti (Liveness Detection Competitions)** — otisk prstu, obličej.

---

*Zdroj: BIO přednášky 2025/26, BIO 13 — Biometrické systémy v praxi. Externí reference: Ratha, N. K., Connell, J. H., Bolle, R. M.: *Enhancing security and privacy in biometrics-based authentication systems* (IBM Systems Journal 2001) — [PDF](https://www.research.ibm.com/people/n/njratha/IBMSJ40-3.pdf); ISO/IEC 30107-3:2023 *Information technology — Biometric presentation attack detection — Part 3: Testing and reporting*; Matsumoto, T. et al.: *Impact of Artificial "Gummy" Fingers on Fingerprint Systems* (SPIE 2002).*
