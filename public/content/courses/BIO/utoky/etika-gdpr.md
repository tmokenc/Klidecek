---
title: Etika a GDPR pro biometriku
---

# Etika a GDPR pro biometriku

Biometrické údaje *nejsou* běžná data. Jsou *neměnné* (immutable), *trvalé* a *vysoce identifikující*. Tyto vlastnosti znamenají, že biometrické systémy *vyžadují* zvláštní právní a etický rámec. Evropské nařízení GDPR výslovně klasifikuje biometriku jako zvláštní kategorii osobních údajů (special category data) s nejvyšší úrovní ochrany. Pochopení této ochrany je *povinné* pro každé nasazení (deployment) takového systému.

## Klíčové etické otázky

### 1. Neměnnost

* Heslo lze *změnit*.
* Biometrický rys **změnit nelze**:
  * Obličej: chirurgická úprava je možná, ale drahá a viditelná.
  * Otisky prstů: trvalé a neměnné.
  * DNA: nemožné změnit.
  * Duhovka (iris): nemožné změnit.

**Důsledek:** kompromitované biometrické údaje jsou kompromitované *trvale*. Útočník (attacker), který získá biometrické šablony (templates), je má *navždy*.

### 2. Bohatství informací

DNA, duhovka i obličej obsahují *víc* než jen identifikační informace:

* **Zdravotní stav** (DNA, snímky sítnice, chůze).
* **Pohlaví, věk, etnicita** (obličej).
* **Emoce, stres, duševní stav** (obličej, hlas).
* **Reprodukční stav** (hlas — například těhotenství).

Hromadné biometrické sledování (mass biometric surveillance) tak znamená *hromadné* dolování osobních informací.

### 3. Sledování a souhlas

* **Rozpoznávání obličejů z kamer (CCTV)** ve veřejném prostoru.
* **Hlasová biometrie** v call centrech (často bez výslovného souhlasu).
* **Rozpoznávání podle chůze (gait recognition)** pro účely sledování.
* **Sledování napříč kamerami** umožňující opětovnou identifikaci osob.

Problém: ve veřejném prostoru je prakticky nemožné získat *souhlas* (consent), který by byl skutečně smysluplný.

### 4. Diskriminace

* **Algoritmické zkreslení (algorithmic bias)** — rozpoznávání obličejů soustavně funguje hůře u tmavší pleti a u žen (Buolamwini–Gebru 2018).
* **Falešné shody (false positives)** dopadají nepřiměřeně na marginalizované komunity.
* **Medializovaná neoprávněná zatčení** na základě rozpoznávání obličeje (Robert Williams, 2020, Detroit).

### 5. Plíživé rozšiřování účelu (function creep)

* Údaje byly původně shromážděny pro *jeden účel* (cestovní pas).
* Později se použijí pro *jiný* (vyšetřování trestné činnosti, vymáhání imigračních pravidel, sledování).
* **Schengenský informační systém** — původně určen pro hranice, postupně rozšířil svůj rozsah.
* **Aadhaar** — původně sociální dávky, dnes v Indii všudypřítomný.

## GDPR (nařízení EU 2016/679)

### Klíčový rámec

* **Účinnost:** od 25. května 2018.
* **Působnost:** všichni obyvatelé EU a všechny firmy, které zpracovávají údaje obyvatel EU.
* **Sankce:** až **20 mil. €** nebo **4 % celosvětového obratu** (podle toho, co je vyšší).

### Článek 4 — Definice

**Biometrické údaje** (čl. 4 odst. 14):
> „Osobní údaje vyplývající z konkrétního technického zpracování týkajícího se fyzických či fyziologických znaků nebo znaků chování fyzické osoby, které umožňují nebo potvrzují jedinečnou identifikaci této fyzické osoby, jako jsou zobrazení obličeje nebo daktyloskopické údaje."

### Článek 9 — Zvláštní kategorie údajů

Biometrické údaje patří do **zvláštní kategorie** (společně s údaji o zdravotním stavu, rasovém původu, náboženském vyznání atd.).

**Zpracování je zakázáno**, pokud neplatí jeden z těchto právních důvodů:

* **(a)** Výslovný souhlas.
* **(b)** Povinnosti v oblasti zaměstnání a sociálního zabezpečení.
* **(c)** Ochrana životně důležitých zájmů.
* **(d)** Oprávněná činnost neziskové organizace.
* **(e)** Údaje, které subjekt sám zveřejnil.
* **(f)** Uplatnění právních nároků.
* **(g)** Významný veřejný zájem, přiměřeně.
* **(h)** Zdravotní péče.
* **(i)** Veřejné zdraví.
* **(j)** Archivace, výzkum, statistika (se zárukami).

### Konkrétní požadavky

#### Souhlas

* Musí být **výslovný** (čl. 9), nestačí pouhé přihlášení (opt-in).
* **Svobodný, konkrétní, informovaný a jednoznačný.**
* **Snadno odvolatelný.**
* **Doložený.**

#### Minimalizace údajů

* Shromažďujte jen *nezbytné* biometrické údaje.
* Žádné zdůvodňování ve smyslu „mohlo by se to později hodit".

#### Omezení doby uložení

* Údaje uchovávejte jen *po nezbytně nutnou dobu*.
* Stanovte dobu uchování.
* Zajistěte automatické mazání.

#### Zabezpečení

* **Vhodná technická a organizační opatření** (čl. 32):
  * Šifrování (encryption).
  * Pseudonymizace.
  * Důvěrnost, integrita, dostupnost a odolnost.
  * Schopnost obnovy po incidentu.
  * Pravidelné testování.

#### Práva subjektu údajů

* **Právo na přístup** (čl. 15) — jaké údaje jsou uchovávány a proč.
* **Právo na opravu** (čl. 16) — oprava nepřesností.
* **Právo na výmaz** (čl. 17) — „právo být zapomenut".
* **Právo na omezení zpracování** (čl. 18) — omezit zpracování.
* **Právo na přenositelnost údajů** (čl. 20) — export údajů.
* **Právo vznést námitku** (čl. 21) — proti určitým druhům zpracování.

#### Automatizované rozhodování (čl. 22)

* Omezení *plně automatizovaných* rozhodnutí s významným dopadem.
* **Právo na lidský přezkum.**

#### DPIA — posouzení vlivu na ochranu osobních údajů

Vyžaduje se (čl. 35) pro:
* Systematické a rozsáhlé vyhodnocování.
* **Rozsáhlé zpracování zvláštní kategorie údajů** (zahrnuje biometriku).
* Systematické monitorování veřejného prostoru.

Většina biometrických systémů posouzení DPIA vyžaduje.

### Sankce

* **Stupeň 1:** až 10 mil. € nebo 2 % obratu (méně závažná porušení).
* **Stupeň 2:** až 20 mil. € nebo 4 % obratu (porušení čl. 9).

#### Významné pokuty

* **Clearview AI:** po 20 mil. € od Francie (CNIL), Itálie (Garante) a Řecka (HDPA); 7,5 mil. £ od britského ICO.
* **Facebook (Meta):** 1,2 mld. € za transatlantické předávání údajů.
* **Několik dodavatelů** systémů pro rozpoznávání obličeje dostalo pokuty.

## Akt EU o umělé inteligenci (nařízení 2024/1689)

**Účinnost:** od srpna 2024 (postupně).

### Ustanovení k biometrice

* **Biometrická identifikace na dálku v reálném čase** ve veřejném prostoru — **ZAKÁZÁNA** s úzce vymezenými výjimkami (terorismus, závažná trestná činnost, pohřešované děti) a po schválení.
* **Následná biometrická identifikace na dálku** — vysoce riziková, regulovaná.
* **Rozpoznávání emocí** na pracovišti a ve školství — **ZAKÁZÁNO**.
* **Biometrická kategorizace** (rasa, politické názory, sexuální orientace) — **ZAKÁZÁNA**.
* **Hromadné stahování snímků obličejů** pro databáze obličejů — **ZAKÁZÁNO**.

### Vysoce rizikové biometrické systémy

* Biometrie pro ochranu hranic.
* Biometrie pro orgány činné v trestním řízení.
* Biometrie v zaměstnání.

Vyžadují:
* **Systém řízení rizik.**
* **Správu dat (data governance).**
* **Technickou dokumentaci.**
* **Záznamy (logging).**
* **Transparentnost.**
* **Lidský dohled.**
* **Přesnost a robustnost.**
* **Kybernetickou bezpečnost.**

### Sankce

* **Stupeň 1:** 35 mil. € nebo 7 % obratu (zakázané praktiky).
* **Stupeň 2:** 15 mil. € nebo 3 % obratu.

## Specifika v České republice

### Zákon o ochraně osobních údajů (110/2019 Sb.)

* Provádí GDPR v ČR.
* **ÚOOÚ** (Úřad pro ochranu osobních údajů) — dozorový orgán.

### Zákon o policii (273/2008 Sb.)

* Upravuje sběr biometrických údajů policií (DNA, otisky prstů).
* Stanovuje **doby uchování**.
* Stanovuje **postupy mazání** po zproštění obvinění.

### Konkrétní doporučení

* **ÚOOÚ** vydal několik metodik ke zpracování biometrických údajů.
* **Školy** zpravidla nemohou používat biometrické systémy docházky (jde o děti).
* **Pracoviště** — přísný souhlas a přiměřenost.

## Globální pohledy

### USA — roztříštěná úprava

* **Žádný federální zákon o biometrice.**
* **Illinois BIPA (2008)** — silný zákon, 1000–5000 $ za jedno porušení.
* **Texas, Washington, Kalifornie** — podobné zákony.
* **Několik hromadných žalob** proti technologickým firmám.

### Asie

* **Čína** — zákony se zaměřují na vládní sledování, menší ochrana před firmami.
* **Indie** — sledování přes Aadhaar a zákon DPDP Act (2023).
* **Japonsko** — APPI (zákon o ochraně osobních údajů).

### Rusko

* Přísné zákony, ale proměnlivé vymáhání.
* Hromadné sledování je doloženo.

## Etická pravidla pro návrháře

### Navrhujte se soukromím na prvním místě

* **Soukromí už v návrhu (privacy by design)** — ochranná opatření zabudujte od začátku.
* **Soukromí ve výchozím nastavení (privacy by default)** — nejpřísnější nastavení jako výchozí.
* **Minimalizace údajů** — shromažďujte jen to, co je nezbytné.
* **Lokální zpracování** — biometriku pokud možno ponechte v zařízení.
* **Zrušitelná biometrika (cancelable biometrics)** — transformované šablony, které lze obměňovat.

### Navrhujte férově

* **Rozmanitá trénovací data.**
* **Testování demografické vyváženosti.**
* **Algoritmy pro zmírnění zkreslení.**
* **Transparentní vykazování výkonu** napříč demografickými skupinami.

### Navrhujte s ohledem na odpovědnost

* **Auditní záznamy.**
* **Vysvětlitelnost** — proč bylo rozhodnutí učiněno.
* **Lidský přezkum** u důležitých rozhodnutí.
* **Snadná náprava** pro dotčené osoby.

### Navrhujte bezpečně

* **Šifrování všude.**
* **Silná správa klíčů (key management).**
* **Pravidelné bezpečnostní testování.**
* **Plány reakce na incidenty.**

## Chybná biometrická rozhodnutí

### Robert Williams (Detroit, 2020)

* **První veřejně známé** neoprávněné zatčení kvůli rozpoznávání obličeje.
* Policie v Detroitu zatkla Williamse (černocha).
* Rozpoznávání obličeje ho ztotožnilo s podezřelým z krádeže v obchodě.
* Šlo o chybnou shodu — Williams měl alibi.
* **Soudní spor byl urovnán** za 300 000 $.

### Další případy

* Po celém světě je doloženo více neoprávněných zatčení.
* **Nepřiměřeně dopadají** na osoby tmavé pleti.
* Problém s transparentností: mnoho jurisdikcí nezveřejňuje, že rozpoznávání obličeje vůbec používá.

## Trendy

### Technologie posilující soukromí

* **Homomorfní šifrování (homomorphic encryption)** pro porovnávání biometrie bez odhalení samotných údajů.
* **Federované učení (federated learning)** — trénování modelů bez centralizace dat.
* **Bezpečný vícestranný výpočet (secure multi-party computation).**
* **Diferenciální soukromí (differential privacy)** pro souhrnné analýzy.

### Rozšiřování regulace

* **Zákony na úrovni jednotlivých států** se množí (USA).
* **Regulace zaměřená přímo na AI** nad rámec GDPR (Akt EU o AI).
* **Mezinárodní spolupráce** na standardech.

### Povědomí spotřebitelů

* Roste znepokojení veřejnosti z rozpoznávání obličeje.
* Některá města **zakazují** vládní rozpoznávání obličeje (San Francisco, Boston).
* Firmy **ustupují** od problematických způsobů použití (IBM rozpoznávání obličeje opustilo v roce 2020).

## Doporučení pro projekty

1. **Zpracujte DPIA včas** — vyhodnoťte rizika pro soukromí ještě před nasazením.
2. **Získejte souhlas správně** — výslovný a doložený.
3. **Minimalizujte** — jen to, co je potřeba.
4. **Zpracovávejte lokálně** — biometriku ponechte v zařízení.
5. **Auditujte přístup** — zaznamenávejte vše.
6. **Testujte férovost** — napříč demografickými skupinami.
7. **Počítejte s únikem dat** — mějte plán reakce na incidenty.
8. **Pravidelně revidujte** — zákony se mění.

---

*Zdroj: BIO přednášky 2025/26, BIO 13 — Biometrické systémy v praxi. Externí reference: Regulation (EU) 2016/679 (GDPR); Regulation (EU) 2024/1689 (AI Act); Buolamwini, J., Gebru, T.: *Gender Shades: Intersectional Accuracy Disparities in Commercial Gender Classification* (FAccT 2018); Illinois Biometric Information Privacy Act (740 ILCS 14); ÚOOÚ guidance — [uoou.cz](https://uoou.gov.cz/).*
