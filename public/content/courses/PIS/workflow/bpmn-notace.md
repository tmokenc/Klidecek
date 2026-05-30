# BPMN 2.0 — modelování business procesů

WfMC referenční model ([[wfmc-architektura]]) zavádí abstraktní komponenty workflow systému. **BPMN 2.0** (Business Process Model and Notation) je dnes *primární standard* pro konkrétní modelování procesů. Spravuje ho OMG (Object Management Group) a definuje **grafickou notaci**, **XML serializaci** a **spustitelnou sémantiku**. Z toho plyne, že BPMN 2.0 model lze nejen *nakreslit pro byznysové diskuze*, ale rovnou *nasadit do enginu a spustit* — viz [[bpmn-enginy]].

## Cíle BPM a standardy

**BPM (Business Process Management)** má tři praktické cíle:

- **Formální popis** procesů probíhajících v organizaci.
- **Řízení** popsaného procesu pomocí **WFM (Workflow Management) systému**.
- **Analýza a verifikace** procesů — zvýšení efektivity.

Pro popis se v praxi používají:

- **BPMN 2.0** — aktuální *primární standard*. Grafická notace + nativní XML serializace (BPMN XML). Přímo spustitelné enginy (Camunda, Flowable, Kogito).
- **XPDL** *(legacy)* — původní deskriptivní formát WfMC; nahrazen BPMN XML.
- **BPEL / WS-BPEL** *(legacy)* — procedurální jazyk orientovaný na webové služby; v praxi nahrazen BPMN 2.0 enginy.

## Vrstvy modelování procesů

BPMN 2.0 model existuje ve třech vrstvách:

:::svg
<svg viewBox="0 0 540 240" xmlns="http://www.w3.org/2000/svg" style="max-width: 580px;">
  <rect x="0" y="0" width="540" height="240" fill="#f8fafc" rx="8"/>
  <defs>
    <marker id="arrH" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
  <rect x="120" y="10" width="300" height="50" rx="8" fill="#bfdbfe" stroke="#2563eb"/>
  <text x="270" y="32" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="bold" fill="#1f2937">Vrstva 1 — BPMN notace</text>
  <text x="270" y="48" text-anchor="middle" font-family="ui-sans-serif" font-size="10" fill="#374151">grafické modelování (Camunda Modeler, draw.io)</text>
  <line x1="270" y1="60" x2="270" y2="95" stroke="var(--text-muted)" marker-end="url(#arrH)"/>
  <text x="280" y="80" font-family="ui-sans-serif" font-size="10" fill="var(--text-muted)">BPMN 2.0 XML serializace</text>
  <rect x="120" y="100" width="300" height="50" rx="8" fill="#bbf7d0" stroke="#16a34a"/>
  <text x="270" y="122" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="bold" fill="#1f2937">Vrstva 2 — BPMN 2.0 XML</text>
  <text x="270" y="138" text-anchor="middle" font-family="ui-sans-serif" font-size="10" fill="#374151">přenositelná strojová reprezentace</text>
  <line x1="270" y1="150" x2="270" y2="185" stroke="var(--text-muted)" marker-end="url(#arrH)"/>
  <text x="290" y="170" font-family="ui-sans-serif" font-size="10" fill="var(--text-muted)">deploy / nasazení</text>
  <rect x="120" y="190" width="300" height="50" rx="8" fill="#fef3c7" stroke="#ca8a04"/>
  <text x="270" y="212" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="bold" fill="#1f2937">Vrstva 3 — BPMN engine</text>
  <text x="270" y="228" text-anchor="middle" font-family="ui-sans-serif" font-size="10" fill="#374151">Camunda 7/8, Flowable, Kogito</text>
</svg>
:::

Tatáž definice procesu prochází *třemi formami*: kresba pro člověka → XML pro strojový přenos → instance v enginu pro vykonávání. Důležité je, že *BPMN XML je definovaný standardem*, takže model lze přenášet mezi nástroji a enginy bez ztráty informace.

## Elementy BPMN

BPMN 2.0 má **čtyři kategorie** elementů:

### Objekty toku (Flow Objects)

Tři základní typy ovlivňující tok procesu:

- **Událost (Event)** — ovlivňuje tok procesu. *Začátek* / *konec* procesu, *zpráva*, *časovač*, *chyba*, …
- **Aktivita (Activity)** — práce, která se má vykonat. *Atomická úloha* (Task) nebo *podproces* (Sub-process).
- **Brána (Gateway)** — řídí *větvení* a *slučování* toku: **XOR** (výlučně), **AND** (paralelně), **OR** (inkluzivně), nebo *event-based*.

### Spojovací objekty

- **Sekvenční tok** — pořadí navazujících aktivit (plná šipka).
- **Tok zpráv** — zpráva mezi dvěma účastníky procesu (přerušovaná šipka s kroužkem).
- **Asociace** — propojuje objekt s dodatečnou informací (poznámka, datový objekt).

### Plavecké dráhy (Swimlanes)

- **Pool** — reprezentuje *účastníka* v procesu (organizaci, systém). Mezi pooly se komunikuje *tokem zpráv*.
- **Swimlane** — kategorizuje aktivity v rámci poolu — obvykle odpovídá *roli* nebo *oddělení*.

### Artefakty

- **Datový objekt** — vstup nebo výstup aktivity.
- **Skupina** — vizuální seskupení bez sémantické váhy.
- **Poznámka** — komentář.

## Typy událostí v BPMN 2.0

Události se v notaci rozlišují **silou okraje** kruhu:

| Typ | Symbol | Podtypy |
| :--- | :--- | :--- |
| **Start** | tenký okraj | None, Timer, Message, Signal |
| **Intermediate** | dvojitý okraj | Timer, Message, Error, Escalation |
| **End** | silný okraj | None, Message, Error, Terminate |
| **Boundary** | připnutá k aktivitě | Timer, Error, Message *(přerušující / nepřerušující)* |

**Boundary event** je výjimečný — *přilepený k hranici aktivity nebo podprocesu*. Dvě varianty:

- **Přerušující (interrupting)** — boundary event *zastaví* aktivitu a tok pokračuje do obslužné větve. Plná čára kruhu.
- **Nepřerušující (non-interrupting)** — aktivita pokračuje, ale *spustí se paralelní tok*. Přerušovaná čára kruhu.

Boundary events jsou jeden z hlavních způsobů, jak BPMN řeší *exception handling* — místo try/catch v kódu nakreslíte k aktivitě boundary error event a obslužnou větev.

## Kompenzace v BPMN

BPMN 2.0 má **vestavěnou podporu pro kompenzaci** — přímý protějšek *kompenzujících transakcí* z teorie ([[zretezene-transakce]]) a SAGA patternu ([[distribuovane-transakce]]).

- **Kompenzační úloha** — aktivita, která *logicky vrátí* efekt jiné aktivity.
- **Compensation event** — spouští kompenzační tok při chybě nebo explicitním požadavku.

Typický scénář:

> Objednávka byla **zaplacena** → odeslání selhalo → engine spustí **compensation event** → vykoná se **kompenzační úloha** *„vrátit platbu"*.

Tato vestavěná podpora znamená, že SAGA pattern lze v BPMN modelovat *graficky* bez ručního programování kompenzace.

## Příklad: pool s dvěma swimlanes

Klasický BPMN příklad z OMG specifikace — *pacient a lékař*:

- **Pool „Patient"**: *Send Doctor Request → Receive Appt. → Send Symptoms → Receive Prescription → Send Medicine Request → Receive Medicine.*
- **Pool „Doctor's Office"**: *Receive Doctor Request → Send Appt. → Receive Symptoms → Send Prescription → Receive Medicine Request → Send Medicine.*
- Mezi pooly **toky zpráv** *(I want to see doctor, Go see doctor, …)*.

Tento příklad ilustruje, že **každý pool je samostatný proces** s vlastním začátkem a koncem, a **mezi pooly se komunikuje výhradně zprávami** — což odpovídá realitě, že pacient a lékař jsou nezávislé entity bez sdíleného stavu.

V další sekci probereme **workflow patterns** — kanonické vzory řízení toku v BPMN ([[workflow-patterns]]).

---

*Zdroj: PIS přednáška 7, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: [OMG BPMN 2.0.2 specifikace](https://www.omg.org/spec/BPMN/2.0.2/), [Camunda BPMN Reference](https://camunda.com/bpmn/reference/).*
