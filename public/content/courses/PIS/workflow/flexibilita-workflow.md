# Pravidla přechodů a flexibilita workflow

Workflow patterns ([[workflow-patterns]]) popisují *strukturu* toku, ale neříkají nic o tom, *kdy* mohou aktivity začít, *jak dlouho mohou trvat* a *co se stane, když se proces musí změnit za běhu*. Tato sekce řeší dva navazující problémy: **pravidla přechodu mezi činnostmi** a **flexibilitu** — schopnost workflow systému přizpůsobit se měnícím se podmínkám organizace.

## Pravidla pro přechod mezi činnostmi

Každá aktivita ve workflow má sadu pravidel, která určují *kdy a jak* se vykonává:

- **Lhůta (deadline)** — *časový limit* pro provedení. Po překročení se obvykle spouští eskalace (boundary timer event v BPMN).
- **Vstupní podmínka (pre-condition)** — musí být splněna pro *spuštění* činnosti. Vyhodnocuje ji WF systém.
- **Výstupní podmínka (post-condition)** — musí být splněna pro *ukončení* činnosti. Do té doby se činnost *opakuje* (typicky lidský úkol, kde uživatel potvrzuje dokončení).
- **Přechodová podmínka** — umožňuje určit *pořadí zpracování* (priority), například pro mimořádné situace.

Tato čtyři pravidla pokrývají *většinu* situací: čas, vstupní data, kvalita výstupu, priorita. V BPMN se vstupní a výstupní podmínky modelují jako *strážní podmínky* (guards) na sekvenčních tocích nebo bránách; lhůty jako *timer boundary events*.

## Flexibilita workflow — motivace

**Podmínky pro chod organizace se mění:**

- Změna legislativy (GDPR, AI Act, nové daňové předpisy).
- Restrukturalizace organizace (sloučení oddělení, nové role).
- Zavedení nové technologie nebo služby.
- Reakce na problémy odhalené při monitorování.

Workflow systém musí umět tyto změny *promítnout do běžícího prostředí*. Existují dva základní přístupy:

- **Dopředné** zajištění flexibility — *uvažujeme všechny možné situace předem* a modelujeme je do procesu (větvení, alternativní cesty, výjimky). Příklad: BPMN model s `Inclusive Decision Gate` pro všechny zákonem předvídatelné scénáře.
- **Zpětné** zajištění flexibility — **změna workflow za běhu** (*dynamická evoluce*). Nový BPMN diagram nahrazuje starý, ale otázka je, *co se stane s běžícími instancemi*.

## Dynamická změna workflow — evolution patterns

Pro dynamické změny existují **evolution patterns** — kanonické typy úprav workflow modelu:

- Vždy je definováno, *zda lze* změnu provést a *jak*.

**Tři strategie převodu existujících instancí:**

1. **Concurrent to completion** — stávající instance doběhnou *původním způsobem*.
2. **Migrace na finální schéma** — jen za určitých podmínek (kompatibilita).
3. **Migrace na ad-hoc schéma** — dočasné přechodové schéma.

**Verifikace výsledku** — *bude WF stále dělat to, co má?* Analýza cest, dosažitelnost stavů, **Petriho sítě**.

### Strategie 1: Concurrent to completion

- Existující instance pokračují podle **původního schématu** až do svého přirozeného konce.
- Nové instance se spouštějí podle **nového schématu**.
- **Nejjednodušší a nejbezpečnější** přístup — žádná migrace.
- *Nevýhoda:* po dobu přechodu existují v systému instance **různých verzí**, což komplikuje monitorování a reporting.

Toto je výchozí strategie v Camunda 7 — každá deploy verze BPMN diagramu dostane nové ID, staré instance dobíhají na staré verzi.

### Strategie 2: Migrace na finální schéma

- Existující instance jsou **převedeny přímo na nové schéma**.
- **Podmínky proveditelnosti** migrace:
  - Instance musí být v **kompatibilním stavu** — nesmí být uprostřed aktivity, která zanikla nebo se zásadně změnila.
  - Stav instance musí být **jednoznačně namapovatelný** na stav v novém schématu.
- **Zachovává konzistenci** — všechny instance běží podle jedné verze schématu.

Pokud aktivita, ve které se instance nachází, v novém schématu *neexistuje*, migrace na finální schéma *nelze* — musí se použít ad-hoc schéma.

### Strategie 3: Migrace na ad-hoc schéma

- Existující instance jsou převedeny na **dočasné přechodové schéma** — „most" mezi starým a novým.
- *Použití:* přímá migrace na finální schéma není možná (nekompatibilní stavy).
- Ad-hoc schéma definuje, jak instance „uprostřed" starého procesu *dojde do stavu kompatibilního* s novým schématem.
- **Nejflexibilnější**, ale nejsložitější na *implementaci a verifikaci*.

Tento přístup se používá v *kritických* migracích, kde nelze čekat na dokončení starých instancí — typicky při vynucených legislativních změnách s deadlinem.

## Verifikace dynamických změn

Po každé změně schématu nebo migraci je nutná **verifikace**:

- **Analýza cest** — existuje cesta od *každého stavu* k *nějakému ukončenému stavu*? Pokud ne, vznikl by *deadlock*.
- **Dosažitelnost stavů** — jsou všechny aktivity z nového schématu *dosažitelné* (nebo je nějaká *dead code*)?
- **Petriho sítě** — formální nástroj pro tyto otázky. BPMN model se převede na Petriho síť a aplikují se standardní algoritmy (reachability graph, soundness checks).

Disciplína *workflow verification* (Wil van der Aalst, 1997+) dala vzniknout konceptu **„soundness"** — workflow je *sound*, pokud:

1. Z každého stavu existuje cesta ke koncovému stavu.
2. Konečný stav je dosažitelný a jednoznačný.
3. Žádná aktivita není „mrtvá" (nedosažitelná).

Moderní BPMN enginy (Camunda, Flowable) nabízejí *soundness checking* jako součást validace před deploymentem.

Workflow je tedy nejen statický popis, ale **dynamicky se vyvíjející artefakt** s vlastní migrační strategií a verifikační teorií. V další sekci se podíváme na **konkrétní technologie** — BPMN 2.0 enginy a moderní alternativy (viz [[bpmn-enginy]]).

---

*Zdroj: PIS přednáška 7, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: van der Aalst, W.M.P., ter Hofstede, A.: „Workflow Patterns" (Distributed and Parallel Databases, 2003); Reichert, M., Weber, B.: *Enabling Flexibility in Process-Aware Information Systems* (Springer 2012).*
