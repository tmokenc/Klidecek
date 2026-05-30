# BPMN 2.0 enginy a moderní alternativy

S BPMN notací ([[bpmn-notace]]) a workflow patterns ([[workflow-patterns]]) máme *jazyk*. Tato sekce probere **konkrétní enginy** — software, který BPMN modely interpretuje a vykonává. Začneme klasickými BPMN 2.0 enginy (Camunda, Flowable, Kogito), pak srovnáme **orchestraci vs. choreografii** v mikroservisové architektuře, a uzavřeme moderními alternativami jako Temporal a cloudové workflow služby.

## BPMN 2.0 — strojová reprezentace

Než se dostaneme k enginům, je užitečné vidět, jak vypadá BPMN model *na strojové úrovni*. BPMN 2.0 XML pro „Hello World" proces vypadá takto:

```xml
<process processType="Private" isExecutable="true"
         id="com.sample.HelloWorld" name="Hello World">

    <!-- nodes -->
    <startEvent id="_1" name="StartProcess"/>
    <scriptTask id="_2" name="Hello">
      <script>System.out.println("Hello World");</script>
    </scriptTask>
    <endEvent id="_3" name="EndProcess">
      <terminateEventDefinition/>
    </endEvent>
    <!-- … sequenceFlow zde … -->
</process>
```

Engine načte tento XML, postaví interní reprezentaci (stavový stroj) a *spouští instance* podle definice. Stejný XML lze nasadit do *libovolného* BPMN 2.0 enginu (s drobnými rozdíly v rozšířeních) — to je hlavní *value proposition* standardu.

## Moderní BPMN enginy

| Engine | Typ | Poznámka |
| :--- | :--- | :--- |
| **Camunda 7** | open-source, Java | *Nejrozšířenější* BPMN engine; REST API, embedded i standalone. |
| **Camunda 8 / Zeebe** | cloud-native | Distribuovaný engine; SaaS i self-hosted; škálovatelný horizontálně. |
| **Flowable** | open-source, Java | Odvozen z Activiti; lehčí, dobrá Spring Boot integrace. |
| **Activiti** | open-source, Java | Základ celého ekosystému; spravován Alfresco. |
| **Kogito** (Red Hat) | cloud-native | Nástupce jBPM; Quarkus/Kubernetes; BPMN + DMN. |
| **Bonitasoft** | open-source low-code | Grafické studio, *citizen developer* přístup. |

Doporučení podle scénáře:

- **Klasický Jakarta EE / Spring Boot monolit:** Camunda 7 nebo Flowable.
- **Cloud-native mikroslužby (Kubernetes):** Camunda 8/Zeebe nebo Kogito.
- **Low-code (business analyst staví procesy sám):** Bonitasoft.

## Orchestrace vs. choreografie

Otázka *„kdo řídí proces?"* má v mikroservisové architektuře dvě fundamentálně odlišné odpovědi.

### Orchestrace — centrální BPMN engine

Centrální koordinátor (BPMN engine) **volá** jednotlivé mikroslužby a sleduje jejich výsledky.

- **Plusy:** centrální viditelnost stavu, snadné ladění a monitoring, přímá implementace BPMN modelu.
- **Minusy:** engine je **single point of failure** a možný **bottleneck** při škálování.

### Choreografie — event-driven, bez centrálního koordinátora

Každá mikroslužba **naslouchá událostem** na message broker (Kafka, RabbitMQ) a samostatně rozhoduje, jak reagovat.

- **Plusy:** přirozeně škálovatelná, *žádný single point of failure*, volné vazby mezi službami.
- **Minusy:** distribuovaný stav, *složitější ladění a testování* — nikdo „nevidí celý proces".

### Srovnání

| Aspekt | Orchestrace | Choreografie |
| :--- | :--- | :--- |
| Koordinátor | Centrální BPMN engine | Žádný; každá služba reaguje na události |
| Viditelnost procesu | Engine zná celý stav | Distribuovaný stav, těžší sledování |
| Implementace SAGA | Engine orchestruje $T_1 \ldots T_n$ a kompenzace | Každá služba naslouchá a vydává události |
| Škálovatelnost | Engine = možný bottleneck | Přirozeně škálovatelná |
| Ladění | Snadné (centrální log) | Složitější (distribuované sledování) |
| Příklad | Camunda + REST volání | Apache Kafka + event-driven služby |

Tato dichotomie přímo odpovídá **dvěma variantám SAGA patternu** z předchozí přednášky ([[distribuovane-transakce]]) — orchestrátor vs. choreografie.

## Moderní distribuované workflow

Vedle klasických BPMN enginů vznikla *druhá generace* nástrojů, která rezignuje na BPMN notaci a workflow popisuje **přímo kódem**:

### Temporal (temporal.io)

- **Workflow jako kód** v Javě, Pythonu, Go nebo TypeScriptu.
- **Centrální engine** napsaný v Go.
- Proces popsaný *programovacím jazykem* — větvení, smyčky, výjimky jsou *jazykové* konstrukce.
- **Automatický retry, timeouty, zotavení bez ztráty stavu** — Temporal trvanlivě ukládá kompletní *event history* každého kroku workflow a po havárii deterministicky přehraje (replay) tuto historii, čímž obnoví přesný stav běhu — proto pokračuje přesně tam, kde skončil.
- **Vhodné pro:** orchestraci mikroslužeb, dlouhotrvající procesy (dny–týdny), procesy s mnoha vnějšími voláními.

Tento přístup je oblíbený mezi vývojáři, kteří nemají rádi grafické modelování — *„kód je dokumentace"*.

### Cloudové managed služby

Tři velké cloudy nabízejí managed workflow:

- **AWS Step Functions** — vizuální stavový stroj, serverless, integrace s Lambda/SQS.
- **Azure Logic Apps** — low-code přístup, rozsáhlý konektorový ekosystém (Salesforce, SAP, Office 365, …).
- **Google Cloud Workflows** — YAML/JSON definice, integrace s GCP službami.

Společné rysy:

- **Serverless model** — žádné servery, platba za přechody / volání.
- **Vendor lock-in** — definice procesu je specifická pro daný cloud.

Pro projekt v Jakarta EE s vlastní infrastrukturou: zůstaňte u Camundy/Flowable. Pro green-field cloud-native projekt v AWS: Step Functions může být nejjednodušší volba.

## Které zvolit?

Rozhodovací matice:

| Situace | Doporučení |
| :--- | :--- |
| Klasický Jakarta EE, „typical" BPM proces | **Camunda 7** + BPMN |
| Mikroslužby, vysoká škálovatelnost, BPM v ústředí | **Camunda 8** (Zeebe) |
| Workflow orchestrující REST volání mikroslužeb | **Temporal** |
| Mikroslužby s preferovaným event-driven přístupem | **Choreografie přes Kafku**, žádný explicitní engine |
| Plné využití AWS, žádný BPMN požadavek | **AWS Step Functions** |
| Business analyst má modelovat procesy sám | **Bonitasoft** nebo Camunda Modeler + low-code rozšíření |

V poslední sekci se podíváme na *zpětný směr* — **process mining**, který *objevuje* skryté procesy z dat (viz [[process-mining]]).

---

*Zdroj: PIS přednáška 7, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: [docs.camunda.org](https://docs.camunda.org); [docs.temporal.io](https://docs.temporal.io); [AWS Step Functions docs](https://docs.aws.amazon.com/step-functions/); Richardson, C.: *Microservices Patterns* (Manning 2018), kap. 4.*
