# Od front k workflow — nárůst expresivity

Když máme intuici, co je business proces a workflow ([[business-procesy]]), můžeme upřesnit, **proč workflow systémy potřebujeme** *navíc* k zotavitelným frontám z předchozí přednášky ([[zotavitelne-fronty]]). Krátká odpověď: fronty zaručují trvanlivost a oddělení v čase, ale **neumějí popsat *co* se má v procesu dít**.

## Co fronty řeší — a co ne

V předchozí přednášce jsme zavedli **zotavitelné fronty** jako základ pro **sekvencování a paralelismus transakcí**. Fronta poskytuje jednu základní záruku:

> *„Po dokončení akce A se někdy provede akce B.”*

To stačí pro mnoho situací (objednávka → expedice → fakturace). Nestačí to ovšem na úplný *byznysový proces*, který má:

- *Podmíněné větvení* — „pokud částka > 100 000 Kč, schvaluje manažer”.
- *Paralelní větve* s následným *spojením* — „expedice a fakturace souběžně, ale obě musí být dokončené před uzavřením”.
- *Role a swimlanes* — „tuto úlohu provede *účetní*, tu *vedoucí oddělení*”.
- *Časové podmínky* — „lhůta 7 dní, jinak eskalace”.
- *Monitorování a analýzu* — „kolik objednávek je teď v expedici, kolik trvá průměrně každý krok?”.

Fronta nic z toho neřeší — to je práce **workflow systému**.

## Co workflow přidává nad zotavitelné fronty

| Vlastnost | Zotavitelná fronta | Workflow systém |
| :--- | :--- | :--- |
| Trvanlivost akcí | ✅ | ✅ (postavené nad frontami) |
| Sekvence a paralelismus | ✅ | ✅ |
| **Formální jazyk pro popis procesů** | ❌ | ✅ (BPMN 2.0) |
| **Role a swimlanes** | ❌ | ✅ |
| **Podmíněné větvení (XOR/AND/OR brány)** | ❌ (ručně v kódu) | ✅ (deklarativně) |
| **Monitorování a analýza** | omezeně | ✅ (centrální stav) |
| **Změna definice za běhu** | ❌ | ✅ (s migracemi) |

Workflow tedy přidává *čtyři klíčové komponenty*:

1. **Jazyk pro popis procesů** — formální definice aktivit, podmínek, větvení. Dnes standard **BPMN 2.0** (viz [[bpmn-notace]]).
2. **Role a swimlanes** — přiřazení aktivit konkrétním účastníkům (lidem nebo systémům).
3. **Směrování** — **XOR / AND / OR brány** *místo* ručně programované logiky.
4. **Monitorování a analýza** — sledování stavu instancí, výkonnostní metriky, alerty na SLA porušení.

## Princip oddělení definice od implementace

Pravděpodobně nejdůležitější rys workflow systémů je toto:

> **Popis procesu je oddělen od implementace IS.**

V tradiční aplikaci byste workflow zakódovali v Javě (nebo SQL procedurách, či shellech). Změna procesu by znamenala přeprogramování, redeploy, testování — týdny práce. Workflow systém umožňuje **business analytikovi** (ne programátorovi) změnit BPMN diagram, nasadit nový diagram do enginu a změna je *okamžitě v provozu*. To není akademický detail — pro velké organizace s desítkami změn měsíčně je to *celá hodnota* workflow přístupu.

Z toho také plyne, že workflow systém je *aplikační vrstva nad* zotavitelnými frontami, ne *náhrada* za ně. Většina BPMN enginů uvnitř skutečně používá zotavitelné fronty (nebo message broker) pro trvanlivé čekání mezi úlohami a pro asynchronní aktivity — viz [[bpmn-enginy]].

---

*Zdroj: PIS přednáška 7, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: WfMC Reference Model Specification, [van der Aalst — workflowpatterns.com](http://workflowpatterns.com).*
