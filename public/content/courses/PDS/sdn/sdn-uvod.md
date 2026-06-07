# Softwarově definované sítě — koncept a controller

Po seznámení s rovinami routeru ([[roviny-routera]]) a topologiemi datacentrových sítí ([[dcn-topologie]]) přichází **SDN** (Software-Defined Networking) — *koncept*, který má řešit tři problémy: oddělit řídicí rovinu (control plane) od datové roviny (data plane), používat běžný komoditní hardware (commodity hardware) a programově řídit síť. Tato sekce vysvětluje, *co SDN je* (a *co není*), jakou roli hraje **SDN controller** a co jsou *northbound* a *southbound* API.

## Co je SDN (nebo není…)

**SDN má tři klíčové vlastnosti:**

1. **Oddělení rovin (decoupling of forwarding plane and control plane)** — fyzicky oddělíme přeposílací a řídicí rovinu.
2. **Sítě postavené na „white-boxech" / generickém hardwaru** — místo proprietárních ASIC se používá komoditní hardware (commodity hardware).
3. **Podpora programovatelnosti přímo na síťových zařízeních (programmability)** — schopnost *programovat síť* z úrovně aplikace.

**Co SDN není:**

- *Není to jedno konkrétní řešení, technologie ani produkt.* Je to spíš *celý rozsah pokroků* v oblasti sítí.
- Je to také **módní slovo (buzzword)**, které se používá k *marketingovým účelům* a k prezentaci nových produktů.
- Přesto se v něm objevují *zajímavé koncepty*, které stojí za pozornost.

Výrobci (Cisco *ACI*, VMware *NSX*, Juniper *Contrail*) sice všichni mluví o SDN, ale každý jím myslí *něco jiného*. Pro studenty PDS je proto důležité **abstraktní pochopení** — co SDN slibuje a *proč* je to relevantní.

## Co SDN slibuje

> Cílem SDN je:
>
> - Proměnit odvětví sítí a zpochybnit dnešní způsob, jakým sítě stavíme a spravujeme.
> - Umožnit administrátorům snadno řídit síť — stejně, jako řídí aplikace a operační systémy.
> - Vnést do sítí větší flexibilitu, aby bylo možné ovlivňovat jejich návrh a provoz z externích aplikací.
> - Poskytnout nové způsoby interakce se síťovými zařízeními.

Klíčové slovo je **flexibilita (flexibility)**. Klasická síť je *rigidní* — konfigurace VLAN nebo BGP se mění pomalu. SDN slibuje **API**, přes které aplikace *řídí* síť stejně snadno, jako řídí úložiště (storage) či výpočetní výkon (compute).

## Omezení současné technologie

- Síťová zařízení používají *protokoly a algoritmy* (BGP, OSPF, MPLS), které **zbytek IT personálu nezná**.
- Interakce se sítí vyžaduje *jazyk*, kterému *v organizaci rozumí jen málokdo* — typicky CLI specifické pro daného výrobce (vendor-specific CLI).
- Existují *scénáře použití (use cases)*, které je *těžké ručně přeložit do síťové konfigurace*.

V éře *DevOps*, kdy se *aplikace* nasadí (deploy) přes Kubernetes během minut, nemůže *síť* zaostávat o celé týdny.

## Jak SDN řeší tyto potřeby

- **Centralizovaná konfigurace, správa, řízení a monitoring** síťových zařízení (fyzických i virtuálních).
- *Schopnost přepsat tradiční přeposílací (forwarding) algoritmy* podle specifických obchodních či technických potřeb.
- *Umožnit externím aplikacím* nebo systémům **ovlivňovat poskytování (provisioning) a provoz** sítě.
- **Rychlé a škálovatelné nasazení (rapid and scalable deployment)** síťových služeb včetně správy jejich životního cyklu (lifecycle management).

## Koncepty SDN

### Co bychom rádi měli

- *Automatické a konzistentní nasazení síťových služeb.*
- *Konzistentní pravidla (policies).*
- *Viditelnost přes celou cestu (end-to-end visibility).*
- *Rozhodnutí přijatá na základě centralizovaného pohledu na celou cestu (end-to-end).*
- *Automatické programování nebo konfiguraci síťových zařízení.*

### Obvyklé námitky

- *Jak se to liší od přístupu „jedno společné okno" (Single-Pane-of-Glass)?* (Nástroje pro správu od výrobců už existují — Cisco DNAC, HPE IMC.)
- *Co se stane při rozpadu sítě na části (network partition)?* (Centralizovaný controller je jediný bod selhání — SPOF.)
- *Proč by to mělo fungovat zrovna teď?* (Centralizace se už zkoušela — signalizace v ATM, *softswitche* v telekomunikacích — a selhala.)

## Co lze a nelze udělat se stávajícími protokoly

**Snadné:**

- *Programová konfigurace zařízení* (interakce s rovinou správy přes NETCONF/RESTCONF).
- *Úpravy IP přeposílacích tabulek* (BGP, BGP Flowspec).
- *Jednoduché vynucení pravidel na okraji sítě* (ACL pro jednotlivé uživatele).
- *Zjišťování a extrakce topologie* (LLDP).

**Těžší:**

- *Nestandardní přeposílací modely* (např. směrování IP podle zdroje).
- *Řešení napříč více výrobci* (málo standardních modelů YANG, atributy RADIUS specifické pro výrobce).
- *Transakční konzistence a viditelnost přes celou cestu (end-to-end).*

**Nemožné se stávajícími protokoly:**

- *Nové protokoly řídicí roviny (control-plane).*
- *Změna chování stávajících protokolů řídicí roviny.*

A právě tady přichází na řadu **OpenFlow** ([[openflow-nfv-p4]]) — *nahrazuje* stávající řídicí rovinu *programovatelným controllerem*.

## Sada nástrojů SDN — stávající protokoly

Před příchodem OpenFlow se SDN dělalo *pomocí stávajících protokolů*:

| Rovina | Protokoly |
| :--- | :--- |
| Správa | **NETCONF**, **SNMP**, RESTCONF |
| Řízení | **BGP** (FlowSpec, vkládání tras), PCEP |
| Data | **ForCES**, BGP Flowspec, MPLS-TP |

To je takzvané *„soft SDN"* — používá *stávající* protokoly k *centralizovanému* řízení. Každé zařízení přitom stále má *vlastní řídicí rovinu*; SDN controller do něj jen *vkládá* pravidla (policies).

## Sada nástrojů SDN — nově vznikající protokoly

S OpenFlow přišly **nově vznikající (emerging)** protokoly:

| Rovina | Protokoly |
| :--- | :--- |
| Správa | **OF-Config**, **XMPP**, **OVSDB**, Puppet/Chef |
| Řízení | **I2RS** (Interface to Routing System), **OVSDB** |
| Data | **OpenFlow** |
| Proprietární | Cisco OnePK |

To je takzvané *„hard SDN"* — *úplné rozbití* tradičních rovin a *přesun řídicí roviny* do controlleru.

## SDN controller

```
                Northbound API
                     ↑
                ┌────┴────┐
                │  REST   │
                │  Plug-in│
                │ Proprietary│
                └────┬────┘
                     ↑
                ╔════╧════╗
                ║   SDN   ║
                ║Controller║
                ╚════╤════╝
                     ↓
                ┌────┴────┐
                │ OpenFlow│
                │ OnePK   │
                │ CLI/SNMP│
                └────┬────┘
                     ↓
                Southbound API
```

**SDN controller** = *centralizovaný proces*, který:

- **Směrem nahoru (northbound)** — k *aplikacím*: nabízí *REST API*, plug-iny a proprietární SDK.
- **Směrem dolů (southbound)** — k *přepínačům (switchům)*: používá **OpenFlow**, OnePK a *CLI/SNMP* pro zařízení od konkrétních výrobců.

### Funkce controlleru

- **Oddělení řídicí a datové roviny (control/data plane separation)** — typicky přes *OpenFlow*.
- **Interakce s řídicí rovinou nebo rovinou správy:**
  - *Stávající i nové protokoly řídicí roviny* (BGP, BGP FlowSpec, I2RS).
  - *Stávající i nové protokoly roviny správy* (NETCONF, XMPP, OpFlex).
- **Oddělení a abstrakce:**
  - *Překryvné virtuální sítě (overlay virtual networks)* (VMware NSX).
  - *Bezdrátové controllery* (Cisco DNA).
  - *Řešení VPN.*
- **Proprietární API výrobců:** Juniper SDK, Cisco OnePK, Arista eAPI, F5 iControl.

Známé SDN controllery: **OpenDaylight** (Linux Foundation), **ONOS** (open-source), **Ryu** (Python), **Floodlight**, **NOX**/**POX**.

Reálné nasazení: *většina podniků* nemá *čisté* SDN. Mají *hybrid* — některé části (překryv VXLAN, datacentrum) jsou řízené přes SDN, jiné (kampusová síť, WAN) zůstávají tradiční.

## Kontrola reality

V letech **2015–2018** byl SDN *velkým hypem*. Dnes se na něj díváme *pragmatičtěji* — prosadil se hlavně:

- *V datacentrech* (Google B4 WAN, Microsoft SWAN, Facebook Express Backbone).
- *V SD-WAN* (Cisco Viptela, Versa Networks).
- *Pro cloudové překryvy (overlay)* (VMware NSX, Cisco ACI).

Klasické **kampusové a podnikové (enterprise)** sítě zůstávají *převážně tradiční*. Kontrola reality: SDN je *uskutečnitelný*, ale *není* univerzálním řešením.

## Co dále

S abstrakcí SDN v ruce probereme **konkrétní technologie** — **OpenFlow**, **NFV** a **P4** ([[openflow-nfv-p4]]) — *tři pilíře* moderní programovatelné sítě.

---

*Zdroj: PDS přednáška 10, Ing. Matěj Grégr, Ph.D., FIT VUT v Brně. Externí reference: Pepelnjak, I.: „What Is SDN?" ([ipSpace.net](https://blog.ipspace.net/2014/03/what-is-sdn.html)); [ONF SDN Architecture](https://opennetworking.org/sdn-definition/); [OpenDaylight project](https://www.opendaylight.org/).*
