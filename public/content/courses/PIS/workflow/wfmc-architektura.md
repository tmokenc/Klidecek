# Standardy a architektura workflow — WfMC

Velké množství SW nástrojů pro workflow vedlo k potřebě **integrace**. Tu řeší **Workflow Management Coalition (WfMC)** — nevýdělečná mezinárodní organizace založená 1993, která vytvořila *terminologii*, *referenční model* a *formáty výměny definic procesů*. WfMC referenční model dodnes slouží jako *konceptuální mapa* pro chápání workflow systémů — i moderní enginy (Camunda, Temporal) v ní lze rozpoznat.

## Oblasti standardizace WfMC

WfMC se zaměřuje na tři okruhy:

- **Terminologie a referenční model** — společný jazyk a komponentová architektura (rozebíráme dále).
- **Spolupráce a propojení WF systémů** — jak vyměňovat data mezi dvěma různými workflow enginy.
- **Formáty výměny definic procesů** — historicky **XPDL** (XML Process Definition Language), dnes nahrazen **BPMN 2.0 XML** (viz [[bpmn-notace]]).

## Referenční model WfMC

Referenční model definuje **5 rozhraní** mezi centrálním enginem (Workflow Enactment Service, WES) a okolím:

:::svg
<svg viewBox="0 0 540 320" xmlns="http://www.w3.org/2000/svg" style="max-width: 580px;">
  <rect x="0" y="0" width="540" height="320" fill="#f8fafc" rx="8"/>
  <defs>
    <marker id="arrG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
  <rect x="200" y="10" width="140" height="40" rx="6" fill="#e9d5ff" stroke="#9333ea"/>
  <text x="270" y="28" text-anchor="middle" font-family="ui-sans-serif" font-size="11" font-weight="bold" fill="#1f2937">Nástroje pro</text>
  <text x="270" y="42" text-anchor="middle" font-family="ui-sans-serif" font-size="11" fill="#1f2937">definici procesů</text>
  <line x1="270" y1="50" x2="270" y2="115" stroke="var(--text-muted)" marker-end="url(#arrG)"/>
  <text x="280" y="85" font-family="ui-sans-serif" font-size="10" fill="var(--text-muted)">Rozhraní 1</text>
  <rect x="120" y="120" width="300" height="100" rx="10" fill="#bfdbfe" stroke="#2563eb" stroke-width="2"/>
  <text x="270" y="142" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="bold" fill="#1e40af">WES</text>
  <text x="270" y="156" text-anchor="middle" font-family="ui-sans-serif" font-size="10" fill="#1e3a8a">(Workflow Enactment Service)</text>
  <rect x="200" y="172" width="140" height="36" rx="6" fill="#dbeafe" stroke="#3b82f6"/>
  <text x="270" y="194" text-anchor="middle" font-family="ui-sans-serif" font-size="12" font-weight="bold" fill="#1f2937">Workflow engine</text>
  <rect x="10"  y="135" width="100" height="60" rx="6" fill="#bbf7d0" stroke="#16a34a"/>
  <text x="60" y="158" text-anchor="middle" font-family="ui-sans-serif" font-size="10" font-weight="bold" fill="#1f2937">Administrativní</text>
  <text x="60" y="172" text-anchor="middle" font-family="ui-sans-serif" font-size="10" fill="#1f2937">a monitorovací</text>
  <text x="60" y="186" text-anchor="middle" font-family="ui-sans-serif" font-size="10" fill="#1f2937">nástroje</text>
  <line x1="110" y1="170" x2="118" y2="170" stroke="var(--text-muted)" marker-end="url(#arrG)"/>
  <text x="6"   y="210" font-family="ui-sans-serif" font-size="10" fill="var(--text-muted)">Rozhraní 5</text>
  <rect x="430" y="135" width="100" height="60" rx="6" fill="#fef3c7" stroke="#ca8a04"/>
  <text x="480" y="170" text-anchor="middle" font-family="ui-sans-serif" font-size="11" font-weight="bold" fill="#1f2937">Další WES</text>
  <line x1="420" y1="170" x2="428" y2="170" stroke="var(--text-muted)" marker-end="url(#arrG)"/>
  <text x="450" y="210" font-family="ui-sans-serif" font-size="10" fill="var(--text-muted)">Rozhraní 4</text>
  <rect x="80"  y="240" width="140" height="50" rx="6" fill="#fecaca" stroke="#dc2626"/>
  <text x="150" y="262" text-anchor="middle" font-family="ui-sans-serif" font-size="11" font-weight="bold" fill="#1f2937">Klientská aplikace</text>
  <text x="150" y="278" text-anchor="middle" font-family="ui-sans-serif" font-size="10" fill="#1f2937">workflow</text>
  <line x1="150" y1="240" x2="200" y2="222" stroke="var(--text-muted)" marker-end="url(#arrG)"/>
  <text x="100" y="232" font-family="ui-sans-serif" font-size="10" fill="var(--text-muted)">Rozhraní 2</text>
  <rect x="320" y="240" width="140" height="50" rx="6" fill="#fbcfe8" stroke="#be185d"/>
  <text x="390" y="262" text-anchor="middle" font-family="ui-sans-serif" font-size="11" font-weight="bold" fill="#1f2937">Vyvolaná</text>
  <text x="390" y="278" text-anchor="middle" font-family="ui-sans-serif" font-size="10" fill="#1f2937">aplikace</text>
  <line x1="390" y1="240" x2="340" y2="222" stroke="var(--text-muted)" marker-end="url(#arrG)"/>
  <text x="395" y="232" font-family="ui-sans-serif" font-size="10" fill="var(--text-muted)">Rozhraní 3</text>
</svg>
:::

| Rozhraní | Druhý konec | Účel |
| :--- | :--- | :--- |
| **1** | Nástroje pro definici procesů | Import BPMN/XPDL definic do enginu (deploy). |
| **2** | Klientská aplikace workflow | Worklist (seznam úkolů), claim, complete úkolu. |
| **3** | Vyvolaná aplikace | Engine spouští externí aplikaci nebo službu (REST, SOAP, …). |
| **4** | Další WES | Spolupráce dvou enginů, mezisystémové procesy. |
| **5** | Administrativní a monitorovací nástroje | Audit, výkonnostní metriky, správa instancí. |

V moderních architekturách (Camunda 7/8, Temporal, AWS Step Functions) je *referenční model stále viditelný*: BPMN modeler = Rozhraní 1, REST API pro úkoly = Rozhraní 2, service tasks volající mikroslužby = Rozhraní 3, atd.

## WES a Workflow engine

Co dělá **WES (Workflow Enactment Service)**:

- Zajišťuje vykonání **správné činnosti pomocí správného prostředku ve správný čas**.
- Skládá se z jednoho nebo více **workflow engines** (pro škálování, redundanci).

Co dělá **Workflow engine** uvnitř WES:

- **Interpretace definice procesu** (BPMN 2.0 XML).
- **Vytváří instance** procesů a řídí jejich vykonávání.
- **Zajišťuje přechody** mezi aktivitami a *vytváří pracovní položky* (work items).
- **Administrace a dohled** nad běžícími instancemi.

## Prvky workflow systému

Plnohodnotný workflow systém má pět skupin komponent:

- **Klientské aplikace workflow** — UI pro lidské účastníky, kde provádějí úkoly a interagují s procesem.
- **Vyvolané aplikace** — spouštěné automaticky při zahájení úlohy (například SOAP/REST služby).
- **Nástroje pro definici procesů** — grafické editory (typicky BPMN). Prvky modelu: zprávy, události, rozhodnutí.
- **Nástroje pro analýzu a verifikaci:**
  - **Simulace** — „co se stane, když…?” — ověření modelu a predikce.
  - **Verifikace** — *„bude každá objednávka vyřízena?"* — matematické metody, typicky **Petriho sítě**.
- **Administrace a monitorování** — sledování stavu instancí, SLA, výkonnostní metriky.

## 3D pohled na workflow (van der Aalst)

Akademický pohled na workflow definuje *tři dimenze*:

- **Případ (case)** — *konkrétní řešený problém* (jedna žádost o půjčku, jedna objednávka). Obvykle generuje *externí zákazník*. Zpracovává se prováděním úloh v určitém pořadí.
- **Úloha (task)** — *krok provádění procesu*. Charakterizována vstupní (*precondition*) a výstupní (*postcondition*) podmínkou.
- **Zdroj (resource)** — *zařízení nebo osoba*. Dvě klasifikace:
  - **Role** — třída zdrojů dle *schopností* (např. programátoři).
  - **Organizační jednotka** — třída dle *struktury* (např. reklamační oddělení).

V průniku těchto dimenzí jsou další dvě veličiny:

- **Pracovní položka (work item)** = úkol pro konkrétní případ — *task × case*.
- **Činnost (activity)** = úkol + konkrétní zdroj → jde do *fronty* (worklist) — *task × case × resource*.

Tento konceptuální model je užitečný proto, že přesně odpovídá implementačním objektům v BPMN enginech (Camunda: ProcessInstance ↔ case; UserTask ↔ work item; assignee ↔ resource).

## Životní cyklus workflow

Workflow nestojí na jednom místě — má 5fázový životní cyklus:

1. **Definice procesu** — modelování v grafickém editoru (typicky BPMN).
2. **Nasazení** — deployment definice do WF enginu.
3. **Spuštění instancí** — vytváření a řízení běžících případů.
4. **Monitorování** — sledování stavu, SLA, využití zdrojů.
5. **Analýza a optimalizace** — identifikace úzkých míst, úprava modelu → návrat do bodu 1.

Tato smyčka odráží *Plan–Do–Check–Act* z managementové teorie a tvoří základ disciplíny **BPM (Business Process Management)**.

## Data ve workflow

Workflow systém pracuje se třemi typy dat:

| Typ dat | Popis |
| :--- | :--- |
| **Řídicí data** | Interní data WF systému, *nedostupná externě* (např. stav instance, ID běžící úlohy). |
| **Věcná data** | Používaná pro rozhodování; *dostupná i aplikacím*. |
| **Aplikační data** | Specifická pro aplikace; *nepřístupná WF systému*. |

Dále workflow drží:

- **Model organizační struktury** — role, vztahy nadřízený–podřízený.
- **Definice procesu** — činnosti, přidělení rolím, rozhodovací pravidla.
- **Seznam úkolů (worklist)** — aktuální úkoly pro konkrétní uživatele.
  - *Skrytý* (postupné přidělování — systém posílá další úkol, až je předchozí hotový) nebo *přístupný* (uživatel si volí pořadí).

V další sekci se podíváme na **BPMN 2.0** — konkrétní notaci pro modelování procesů (viz [[bpmn-notace]]).

---

*Zdroj: PIS přednáška 7, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: [WfMC The Workflow Reference Model (TC00-1003)](https://www.wfmc.org/standards/reference-model); van der Aalst, W.M.P.: *Workflow Management* (MIT Press 2004).*
