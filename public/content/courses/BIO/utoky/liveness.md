---
title: Detekce živosti
---

# Detekce živosti

**Detekce živosti (liveness detection)** ověřuje, zda je před senzorem *živý člověk*, a nikoli *podvrh* (fotografie, maska, nahrávka, protéza). Je *kritickou* součástí bezpečných biometrických systémů — bez kontroly živosti je *většina* biometrik *triviálně* podvrhnutelná (spoofable).

## Princip

Detekce živosti se snaží rozpoznat *projevy života*:

* **Fyziologické** — tep, krevní oběh, pupilární reflexy (reakce zornice), teplota kůže.
* **Behaviorální** — mikrovýrazy obličeje, mrkání, pohyby hlavy, přirozenost hlasu.
* **Anatomické** — 3D struktura, vnitřní anatomie (pod kůží, subdermální).
* **Behaviorální odezva** — reakce na podněty (světlo, zvuk, pokyny).

## Pasivní vs. aktivní liveness

### Pasivní liveness

* **Detekce probíhá automaticky** — uživatel nemusí nic dělat.
* **Plynulý uživatelský zážitek (UX)** — uživatel o kontrole živosti ani neví.
* **Algoritmus analyzuje** zachycený vzorek a hledá v něm známky živosti.

Příklady:
* Analýza textury otisku prstu (hladký „gumový medvídek" vs. přirozená kůže).
* Analýza hloubky obličeje (3D).
* Spektrální analýza hlasu (nahrávka vs. živá řeč).

### Aktivní liveness (výzva–odpověď, challenge-response)

* **Uživatel provede akci** vyvolanou systémem.
* **Náhodné výzvy** zabraňují předem připravené nahrávce.
* **Mírně horší UX**, ale silnější bezpečnost.

Příklady:
* **Obličej:** „dvakrát mrkni", „otoč hlavu doleva", „usměj se".
* **Hlas:** „přečti tuto náhodnou frázi".
* **Otisk prstu:** „přitlač zlehka, pak silněji".

## Liveness pro otisk prstu

### Techniky proti podvrhům (anti-spoofing)

* **Pružnost kůže** — gumový medvídek je tužší než kůže.
* **Potní póry** — přirozená kůže má póry, falzifikáty často nikoli.
* **Pulzní oxymetrie** — okysličení krve v kapilárách (některé specializované optické čtečky otisků).
* **Subdermální (podkožní) vzory** — ultrazvukové senzory detekují hlubší vrstvy.
* **Teplota** — přirozená kůže má kolem 33 °C.
* **Vodivost** — galvanická kožní odezva.

### Moderní implementace

* **Apple Touch ID** — kapacitní snímání + detekce podkožního vzoru.
* **Samsung Ultrasonic** — 3D struktura papilárních linií.
* **HID Lumidigm** — multispektrální zobrazování.

### Účinné materiály pro podvrhy

* **Starší:** želatina, gumový medvídek, latex.
* **Moderní:** silikon s vodivou vrstvou.
* Úspěšnost detekce je u moderních senzorů zhruba 95–99 % proti běžným podvrhům.

## Liveness pro obličej

### Pasivní

* **Analýza textury** — tištěné fotografie mají *jinou* texturu než kůže.
* **Moaré vzory** — viditelné při přehrávání z displeje.
* **Analýza barev** — tiskárna má omezený barevný rozsah (gamut).
* **Analýza ostrosti** — fotografiím chybí mikrodetaily kůže.
* **3D hloubka** — plochá fotografie vs. prostorový obličej.
* **Snímání v IR** — kůže odráží/pohlcuje infračervené světlo charakteristickým způsobem.
* **Detekce tepu** — vzdálená fotopletysmografie (rPPG) detekuje tep ze záznamu obličeje.

### Aktivní

* **Výzva mrknutím** — „dvakrát mrkni".
* **Pohyb hlavy** — „otoč se doleva, pak doprava".
* **Výzva úsměvem** — „usměj se a vrať do neutrálního výrazu".
* **Přečtení náhodného textu** — synchronizace řeči a pohybu obličeje.
* **Náhodný záblesk barvy** — obličej se nasvítí jinak u displeje než u skutečné kůže.
* **Sledování pohledu** — „dívej se na tečku".

### Vícemodální (multi-modal) liveness

* **3D hloubka (strukturované světlo)** + **IR** + **viditelné světlo** + **sledování pohledu**.
* Používá například **Apple Face ID**.

### Liveness s hlubokým učením (deep learning)

* Konvoluční síť (CNN) natrénovaná na datech podvrhů i skutečných obličejů.
* **Datové sady:** OULU-NPU, ROSE-Youtu, CASIA-MFSD.
* **Výzva:** zobecnění napříč datovými sadami (cross-dataset generalization).

## Liveness pro duhovku (iris)

### Pasivní

* **Pupilární reflex** — dynamika zornice v čase (přirozený pohyb).
* **Spektrální analýza** — přirozená duhovka má jiné spektrum než tisk či kontaktní čočka.
* **3D tvar** — konkávní duhovka vs. plochá fotografie.

### Aktivní

* **Reakce na světlo** — záblesk světla a pozorování zúžení zornice.
* **Náhodný směr pohledu** — „dívej se nahoru, pak dolů".

### Specifické problémy

* **Vzorované kontaktní čočky** — navržené tak, aby vypadaly jako duhovka.
* **Spektrální zobrazování** je dokáže rozlišit.

## Liveness pro hlas (voice)

### Pasivní

* **Přirozenost řeči** — předem nahrané audio nese artefakty (komprese, dozvuk místnosti).
* **Analýza kodeku** — řetězec nahrání → zakódování → přehrání má jiné spektrum.
* **Charakteristiky mikrofonu** — přehrávání z reproduktoru vs. přímá řeč.

### Aktivní

* **Náhodná fráze** — „řekni ‚zelený slon 47'".
* **Konverzace** — přirozené otázky a odpovědi.
* **Výzva šeptem** — přirozenou variabilitu je obtížnější zfalšovat.

### ASVspoof

[Výzva ASVspoof](https://www.asvspoof.org/) probíhá jednou za dva roky:

* **Logický přístup (logical access, LA)** — detekce syntetizované řeči.
* **Fyzický přístup (physical access, PA)** — detekce přehrávané nahrávky.
* **Datové sady, referenční řešení (baselines) a žebříčky (leaderboards).**

## Liveness pro žilní biometriky (vein biometrics)

* **Pulzující krevní tok** — přirozená proměnlivost kontrastu žil.
* **Tělesná teplota** — snímání v IR.
* **Odezva v blízkém infračerveném pásmu (NIR)** — falešným rukám chybí pohlcování světla hemoglobinem.

## Standardy

### ISO/IEC 30107

* **Část 1** — rámec (framework) a terminologie.
* **Část 2** — datové formáty.
* **Část 3** — metodika testování.

::: viz liveness-pad-tradeoff "Práh a mix útoků mění APCER vs. BPCER; iBeta úroveň 2 vyžaduje APCER&lt;1 %, BPCER&lt;5 %."
:::

### Metriky

* **APCER** (Attack Presentation Classification Error Rate) — podíl přijatých podvrhů.
* **BPCER** (Bona Fide Presentation Classification Error Rate) — podíl odmítnutých skutečných uživatelů.

Cíl:
* **APCER < 1 %** (úroveň 2 dle iBeta).
* **BPCER < 5 %** (přijatelné UX).

### Úrovně (iBeta)

* **Úroveň 1** — základní útoky (fotografie, video).
* **Úroveň 2** — propracované útoky (3D maska, silikon).
* **Úroveň 3+** — útoky na úrovni státních aktérů.

## Soutěže v podvrzích (spoofing)

### LivDet

* **Soutěž v detekci živosti otisku prstu (Fingerprint Liveness Detection Competition)** od roku 2009.
* Různé materiály a senzory.
* Nejlepší detektory dosahují přesnosti kolem 95 %.

### Soutěže v liveness obličeje

* Datová sada OULU-NPU.
* CASIA-SURF.
* CelebA-Spoof.

### ASVspoof

* Detekce podvrhů hlasu (anti-spoofing).
* Nejlepší systémy dosahují přesnosti kolem 99 % na známých útocích.
* **Napříč datovými sadami (cross-dataset):** podstatně obtížnější.

## Limity detekce živosti

### Zobecnění (generalization)

* Detektory natrénované na *známých* podvrzích selhávají na *nových* útocích.
* **Adversariální trénink (adversarial training)** pomáhá, ale problém neřeší úplně.

### Závody ve zbrojení

* Podvrhy se zlepšují → detekce se zlepšuje → podvrhy se zlepšují.
* Je potřeba neustále investovat do výzkumu.

### Falešně pozitivní výsledky

* Skuteční uživatelé s **neobvyklými podmínkami** (výrazné líčení, stav po operaci) mohou být označeni za podvrh.
* **BPCER** je nutné udržet nízké.

### Výpočetní náročnost

* Analýza živosti přidává latenci (zpoždění).
* Na mobilních zařízeních jsou potřeba efektivní algoritmy.

## Praktická doporučení

### Pro nasazení (deployment)

1. **Vícemodální liveness** — kombinuj techniky.
2. **Aktivní + pasivní** — obě vrstvy.
3. **Průběžné učení** — aktualizuj systém proti novým typům útoků.
4. **Certifikovaná řešení** (iBeta úroveň 2+).
5. **Vícefaktorová autentizace (authentication)** — biometrika + PIN.
6. **Přístup podle míry rizika** — další kontroly u transakcí s vysokou hodnotou.

### Pro vývojáře

* Používej **ověřené knihovny** — nepiš si vlastní řešení od nuly.
* **Testuj proti známým útokům.**
* **Sleduj** anomálie v provozu (produkci).
* **Aktualizuj** pravidelně.

## Budoucí trendy

### Detekce poháněná umělou inteligencí (AI)

* **Základové modely (foundation models)** pro biometrickou živost.
* **Adversariální odolnost (adversarial robustness)** jako výchozí stav.
* **Federované učení (federated learning)** pro distribuovaný trénink.

### Pokroky v hardwaru

* **Lepší senzory** — multispektrální, podkožní.
* **Specializované čipy** — neuronové procesorové jednotky (NPU) pro liveness.

### Průběžná autentizace

* **Mimo prvotní odemknutí** — průběžné sledování živosti během relace.
* **Behaviorální biometriky** jako spojitý signál živosti.

---

*Zdroj: BIO přednášky 2025/26, BIO 13 — Biometrické systémy v praxi. Externí reference: ISO/IEC 30107-3:2023 *Information technology — Biometric presentation attack detection — Part 3: Testing and reporting*; Yu, Z. et al.: *Deep Learning for Face Anti-Spoofing: A Survey* (IEEE PAMI 2022); Marcel, S., Nixon, M. S., Fierrez, J., Evans, N. (eds.): *Handbook of Biometric Anti-Spoofing* (2nd ed., Springer 2019); LivDet Liveness Detection — [livdet.org](http://livdet.org/); ASVspoof Challenge — [asvspoof.org](https://www.asvspoof.org/).*
