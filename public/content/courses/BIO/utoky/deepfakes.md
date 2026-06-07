---
title: Deepfakes a biometrické systémy
---

# Deepfakes a biometrické systémy

**Deepfakes** jsou synteticky vytvořená média generovaná umělou inteligencí (AI) — *falešná videa*, *falešné hlasy* a *falešné obrázky* lidí. Označení vzniklo podle uživatele Redditu „deepfakes" (2017). Kvalita moderních deepfakes (od roku 2024) je *mimořádně* dobrá — v některých situacích je *prakticky nerozeznatelná* od reality. Pro biometrické systémy proto představují *zásadní výzvu*.

## Co jsou deepfakes

* **Výměna obličeje (face swap)** — nahrazení obličeje ve videu jiným, cílovým obličejem.
* **Přehrání mimiky (face reenactment)** — ovládání výrazů obličeje cílové osoby.
* **Klonování hlasu (voice cloning)** — syntéza řeči hlasem cílové osoby.
* **Celé tělo (full body)** — syntéza celé osoby provádějící určité akce.
* **Text na video (text-to-video)** — generování videa z textového popisu (Sora, Veo).

## Technologie

::: svg "Pipeline tvorby deepfake: zdrojové video + cílová identita → AI model (GAN, diffusion) → syntetický výstup."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aDF" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="20" y="40" width="100" height="40" rx="4"/>
    <rect x="20" y="100" width="100" height="40" rx="4"/>
    <rect x="200" y="70" width="140" height="40" rx="4"/>
    <rect x="380" y="70" width="140" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70" y="64" font-size="11">Source video</text>
    <text x="70" y="76" font-size="9" fill="var(--text-muted)">person A</text>
    <text x="70" y="124" font-size="11">Target identity</text>
    <text x="70" y="136" font-size="9" fill="var(--text-muted)">person B</text>
    <text x="270" y="92" font-size="11">AI model</text>
    <text x="270" y="106" font-size="9" fill="var(--text-muted)">GAN, diffusion, autoencoder</text>
    <text x="450" y="92" font-size="11">Deepfake</text>
    <text x="450" y="106" font-size="9" fill="var(--text-muted)">person B saying/doing A</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aDF)">
    <path d="M120,60 L198,84"/>
    <path d="M120,120 L198,96"/>
    <path d="M340,90 L378,90"/>
  </g>
</svg>
:::

### Založené na GAN

* Dvojice sítí: **generátor (generator)** + **diskriminátor (discriminator)**.
* Generátor se snaží oklamat diskriminátor.
* Opakované trénování vede k vysoce kvalitním výstupům.
* **StyleGAN** (NVIDIA 2018, vylepšeno na StyleGAN3 v roce 2021) — *de facto* standard pro generování obličejů.

### Difuzní modely (diffusion models)

* **DDPM** (Denoising Diffusion Probabilistic Models).
* Stable Diffusion, Midjourney, DALL-E 3, Sora.
* Generují obraz z šumu postupným odstraňováním šumu (denoising).
* V řadě úloh dosahují **vyšší kvality** než GAN.

### Založené na autoenkodéru (autoencoder)

* **Enkodér (encoder)** mapuje obličej do latentního prostoru.
* **Dekodér (decoder)** z latentní reprezentace obličej zpětně generuje.
* Při výměně obličeje se enkodéry a dekodéry navzájem prohodí.
* Tento přístup používá DeepFaceLab (oblíbený open-source nástroj).

### Syntéza hlasu

* **WaveNet, Tacotron** — raná syntéza řeči (text-to-speech, TTS).
* **VALL-E, ElevenLabs** — klonování hlasu z několika sekund nahrávky.
* **Konverze v reálném čase** — změna hlasu naživo.

## Nástroje

* **DeepFaceLab** — open-source, oblíbený pro výměnu obličejů.
* **FaceSwap** — open-source.
* **Reface** — mobilní aplikace pro nezávazné deepfakes.
* **D-ID** — komerční služba pro AI avatary.
* **ElevenLabs** — klonování hlasu.
* **Synthesia** — firemní AI moderátoři.
* **HeyGen** — generování videa pomocí AI.
* **Stable Diffusion** — generování obrázků (s rozšířeními pro obličeje).

## Útoky na biometrické systémy

### Obejití rozpoznávání obličeje (face recognition bypass)

* **Vytištěná fotografie** — z doby před deepfakes.
* **Deepfake video** — přehrané ze záznamu nebo v reálném čase.
* **3D maska** vytvořená z deepfake obrázků.

### Obejití hlasové biometrie

* **Předem nahraný klon hlasu** — útok přehráním záznamu (replay attack).
* **Klon hlasu v reálném čase** — obejití konverzačních systémů.
* **Útoky na telefonní bankovnictví** zdokumentované od roku 2023.

### Podvody s doklady

* **Fotografie falešného dokladu** — generovaná fotografie vložená do šablony skutečného dokladu.
* **AI generovaná selfie** pro ověření klienta (KYC, Know Your Customer).

## Reálné případy

### Podvod s identitou ředitele (2019)

* **Britská energetická firma** přišla o 220 000 €.
* **Klon hlasu** ředitele nařídil bankovní převod.
* Patří mezi první zaznamenané případy podvodu pomocí AI generovaného hlasu.

### Firma v Hongkongu (2024)

* **Videohovor s více účastníky**, kde všichni kromě oběti byli *deepfake*.
* Oběť převedla 25 milionů dolarů.
* Sofistikovaný a dobře připravený útok.

### Politická dezinformace

* **Deepfake Zelenského** (březen 2022) — falešné video vyzývající ke kapitulaci.
* **Deepfake Putina** (březen 2023) — falešné vyhlášení stanného práva.
* **Americké volby 2024** — kolovalo více deepfakes.

### Pornografie (deepfake porno)

* **~96 % deepfakes** tvoří nekonsenzuální pornografie (nejčastěji s oběťmi ženami).
* **Případ Taylor Swift** (2024) — virálně se šířil na X/Twitteru.
* **Řada zemí** to kriminalizuje.

## Detekce — závody ve zbrojení

### Vizuální artefakty

* **Nekonzistentní osvětlení** mezi obličejem a pozadím.
* **Neobvyklé mrkání** (rané deepfakes mrkaly jen zřídka).
* **Artefakty na hranici obličeje** — rozmazané okraje v místě, kde obličej navazuje na hlavu.
* **Chyby v synchronizaci rtů (lip-sync)** — zvuk neodpovídá pohybu úst.
* **Nesrovnalosti v pozadí**.

### Moderní detekce

* **Detektory založené na CNN**, trénované na datových sadách skutečného i falešného obsahu.
* **Analýza ve frekvenční oblasti** (FFT odhaluje odlišné vzory).
* **Biologické signály** — rPPG (remote photoplethysmography) zjišťuje tepovou frekvenci z videa obličeje; deepfakes ji neumí napodobit.
* **Pohyby očí** — přirozené sakády se obtížně replikují.
* **Vodoznačení (watermarking)** — navrhuje se vkládat *neviditelné* vodoznaky do skutečného obsahu.

::: viz deepfake-detection "Spolehlivost pro jednotlivé snímky napříč signálovými kanály (mrkání, lip-sync, rPPG, frekvence); demonstruje propad přesnosti (generalization gap) při útoku z jiné domény."
:::

### Přesnost detekce

* **V rámci domény (in-domain):** >95 % (u deepfakes podobných trénovacím datům).
* **Napříč doménami (cross-domain):** klesá na 60–80 % (u nových typů útoků).
* **Adversariální deepfakes** — vytvořené přímo s cílem uniknout detekci.

## Techniky proti deepfakes

### C2PA (Coalition for Content Provenance and Authenticity)

* **Průmyslový standard** pro ověřování pravosti obsahu.
* **Kryptografické podpisy** ve skutečném obsahu (fotoaparáty, editory).
* **Metadata o původu (provenance)** putují společně s obsahem.
* Podporují jej: Microsoft, Adobe, Sony, Canon, BBC, NYTimes.
* **Cíl:** ověřit *skutečný* obsah, nikoli detekovat *falešný*.

### Vodoznačení (watermarking)

* **Nepostřehnutelné signály** ve skutečném obsahu.
* Ověřuje pravost už při *vytvoření*.
* Omezení: tvorba deepfake vodoznaky odstraní.

### Detekce živosti (liveness) s ohledem na deepfakes

* **Výzva v reálném čase** (pohyb hlavy, mrknutí).
* Pro současné deepfakes je obtížné ji *přirozeně* splnit pod časovým tlakem.
* S tím, jak se deepfakes zlepšují, bude tato ochrana méně účinná.

### Vícekanálová biometrie

* **Obličej + hlas + chování** — podvrhnout všechny tyto kanály je těžší než jen jeden.
* **Ochrana proti podvržení (anti-spoofing) pro každou modalitu.**

## Právní rámce

### Akt EU o umělé inteligenci (EU AI Act, 2024)

* **Deepfakes musí být označeny**, pokud neslouží legitimnímu účelu.
* Sankce za nedodržení.

### USA — roztříštěná úprava

* **Federální úroveň:** žádný komplexní zákon.
* **Zákony jednotlivých států:** Kalifornie (deepfake porno), Texas (volební deepfakes) atd.
* **NO-FAKES Act** (navržen v roce 2024) — federální ochrana.

### Čína (2023)

* **Deep Synthesis Provisions** — komplexní regulace deepfakes.
* Vyžadováno označování, trestní postihy.

### Česko / EU

* **GDPR** — uplatňuje se ochrana biometrických a osobních údajů.
* **Akt EU o umělé inteligenci** — platí i v ČR.
* **Specifické zákony o deepfakes** se teprve vyvíjejí.

## Reakce biometrických systémů

### Hloubková obrana (defense in depth)

1. **Detekce živosti (liveness)** ([[liveness]]) s ohledem na deepfakes.
2. **Vícemodální** biometrie (je těžší podvrhnout všechny modality).
3. **Vícefaktorová** autentizace.
4. **Behaviorální biometrie** — průběžná a obtížně napodobitelná deepfakes.
5. **Přístup podle míry rizika** — dodatečné kontroly u citlivých transakcí.

### Konkrétní doporučení

* **U transakcí s vysokou hodnotou nespoléhejte jen na obličej či hlas.**
* **Ověření jiným kanálem (out-of-band)** u neobvyklých požadavků.
* **AI jako pomoc pro lidské kontrolory** — ale s člověkem v rozhodovací smyčce (human-in-the-loop).
* **Auditní logování** — pro odhalení anomálií.

## Reakce odvětví

### Technologické firmy

* **Microsoft Video Authenticator** — skóre spolehlivosti pro každé video.
* **Adobe Content Authenticity** — nástroj pro doložení původu.
* **Meta** investuje do detekce a vodoznačení.

### Banky

* Dodavatelé řešení **Liveness 2.0** (Onfido, Jumio, iProov, Veriff) je aktualizují proti deepfakes.
* **Behaviorální biometrie** přidaná jako další vrstva.
* **Ověření jiným kanálem (out-of-band)** u nových účtů.

### Hraniční kontrola

* **Elektronické brány (eGates)** s detekcí živosti a vícemodální biometrií.
* **Fyzická kontrola** je pro ověření stále nutná.

## Trendy od roku 2025

* **Deepfakes v reálném čase** jsou široce dostupné (spotřebitelské aplikace).
* **Generování videa typu Sora** se demokratizuje.
* **Klonování hlasu** z několika sekund nahrávky.
* **Detekce se zlepšuje**, ale nikdy trvale nezvítězí.
* **Přístupy založené na původu** (C2PA) získávají na významu.
* **Regulace** dohání vývoj.

## Klíčové ponaučení

> Biometrické systémy se *musí* aktivně bránit deepfakes. Autentizace pouze pomocí jedné modality (*single-modal*), ať už obličejem nebo hlasem, je *zranitelná* a u vysokohodnotných aplikací by měla být *doplněna* dalšími faktory.

Praktický postup:

1. **U aplikací s nízkou hodnotou** (odemčení smartphonu) — biometrie + detekce živosti stačí.
2. **U aplikací se střední hodnotou** (přihlášení do banky) — biometrie + PIN + behaviorální biometrie.
3. **U aplikací s vysokou hodnotou** (velké transakce) — potvrzení jiným kanálem (out-of-band) + biometrie.
4. **U kritických aplikací** (státní tajemství) — fyzická přítomnost + vícefaktorové ověření.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=RoGHVI-w9bE" "Detektory deepfake na bázi AI jsou taky dobré!" "Two Minute Papers"
:::

*Zdroj: BIO přednášky 2025/26, BIO 13 — Biometrické systémy v praxi. Externí reference: Mirsky, Y., Lee, W.: *The Creation and Detection of Deepfakes: A Survey* (ACM Computing Surveys 2021); C2PA — [c2pa.org](https://c2pa.org/); Verdoliva, L.: *Media Forensics and DeepFakes: an overview* (IEEE J-STSP 2020); EU AI Act — Regulation 2024/1689; DeepFaceLab — [github.com/iperov/DeepFaceLab](https://github.com/iperov/DeepFaceLab).*
