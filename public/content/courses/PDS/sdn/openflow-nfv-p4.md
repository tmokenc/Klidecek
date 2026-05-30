# OpenFlow, NFV, P4 — tři pilíře programovatelné sítě

SDN ([[sdn-uvod]]) je *koncept*. **Konkrétní technologie** ho realizují třemi cestami:

1. **OpenFlow** — protokol mezi *SDN controllerem* a *switchem*.
2. **NFV** (Network Function Virtualization) — *L4–L7 funkce v softwaru*.
3. **P4** — *programování data plane* jazykem.

Tato sekce probere všechny tři a uzavře přednášku o SDN.

## OpenFlow

**OpenFlow** byl navržen v kanonickém článku:

> N. McKeown, T. Anderson, H. Balakrishnan, G. Parulkar, L. Peterson, J. Rexford, S. Shenker, J. Turner: *OpenFlow: Enabling Innovation in Campus Networks*. Computer Communication Review, SIGCOMM 2008.

Binary protocol, několik verzí 1.0 – 1.5.

### Model OpenFlow switche

OpenFlow switch obsahuje **flow table** se třemi sloupci:

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│   Rule   │  │  Action  │  │Statistics│
└─────┬────┘  └─────┬────┘  └─────┬────┘
      ↓             ↓             ↓
                                  
Switch  MAC  MAC  Eth  VLAN  IP  IP  IP   IP    IP        Packet+
Port    src  dst  Type ID    Src Dst Prot Sport Dport     byte counters
                                                    
                  - Forward packets to ports
                  - Encapsulate and forward to controller
                  - Drop the packet
                  - Send to normal processing pipeline
```

**Rule** (match): kombinace polí z L1–L4 hlaviček (port, MAC, EtherType, VLAN, IP, port).
**Action**: forward to port(s), encapsulate to controller, drop, send to normal pipeline.
**Statistics**: per-rule counter (packet count, byte count).

### Příklady OpenFlow flow entries

**Switching (přepínání podle MAC):**

```
Switch Port: *
MAC src:     *
MAC dst:     00:1f:...
…             *
Action:      port 6
```

(Všechny pakety s daným destination MAC → port 6.)

**Firewall (drop TCP/22 — SSH):**

```
…
TCP dport:   22
Action:      drop
```

**Microflow routing (5-tuple):**

```
Switch Port: port 3
MAC src:     00:20:..
MAC dst:     00:1f:..
EtherType:   0x0800 (IPv4)
VLAN:        vlan1
IP Src:      1.2.3.4
IP Dst:      5.6.7.8
IP Prot:     6 (= TCP)
TCP sport:   17264
TCP dport:   80
Action:      port 6
```

(Velmi specifické pravidlo pro jeden konkrétní flow.)

### Reactive vs Proactive

**Reactive:**

- *První paket flow* se *posílá kontroleru* (encapsulate-to-controller action).
- Controller *vytvoří pravidlo* a *nainstaluje* do switche.
- *Latency a overhead* switch ↔ controller komunikace.
- **Microflow switching** — jedno pravidlo per *konkrétní flow*.

**Proactive:**

- Pravidla *předinstalována* ve switchi (před prvním paketem).
- Controller *musí předem znát toky*.
- *Aggregate switching* — jedno pravidlo pro *celou třídu* flowů.

V praxi: *hybrid* — *proactive* pro známé toky (HTTP, DNS), *reactive* pro neznámé (custom apps).

### OpenFlow summary

- *Umožňuje oddělit control a data planes.*
- *Protokol neřeší žádný problém* → je to *nástroj* pro *možnou inovaci*.
- *Podpora na hardware varies*, *implementace často nepřipravena* na production.

OpenFlow má dnes *omezené* nasazení (datacenterové overlay sítě, výzkum). V production je často nahrazen vendor-specific protokoly (Cisco OpFlex, VMware NSX).

## NFV — Network Function Virtualization

**NFV** je *druhý pilíř*. Idea: *přesun L4–L7 funkcí* z dedikovaného HW *do softwaru* na x86 CPU.

### Motivace

- Většina **L4–L7 zařízení** (firewall, load balancer, proxy, NAT) běží *na x86 CPU* uvnitř.
- *Proč by měli běžet na vendor-supplied HW?* Stejnou funkci lze dělat *na third-party commodity HW*.

### Domnělé nevýhody (které se ukázaly jako nepodstatné)

- ~~CPU-based packet processing je drahý.~~ Moderní CPU s DPDK zvládají *miliony pps*.
- ~~Vysoká hypervisor overhead při I/O intensive workload.~~ SR-IOV, DPDK, eBPF řeší.

### Příklady NFV produktů

| Funkce | Produkty |
| :--- | :--- |
| Routery | Brocade Vyatta, Cisco CSR, Juniper vMX |
| Firewall | pfSense, Palo Alto, Fortinet, Juniper Firefly (SRX), Vyatta, vShield Edge (VMware), NSX Edge Services Router (VMware), vASA (Cisco) |
| Load balancer | BIG-IP VTM (F5), A10, vShield Edge (VMware), Embrane, LineRate Systems (F5), Citrix NetScaler |

### NFV koncepty

```
Traditional Network Approach            NFV Approach
                                                
Load Balancer    Router                  ┌───── Cloud ─────┐
[Hardware]     [Hardware]               │ vRouter  vSwitch │
                                        │ vFirewall  vDNS  │
Switch        Firewall                  └────────────┬─────┘
[Hardware]    [Hardware]                             │
                                         Virtualization Layer
DNS Server   VPN Gateway                             │
[Hardware]   [Hardware]                  ────────────┴─────
                                         Switches  Storage  Servers
```

### Výhody

- **Better hardware utilization** — sdílení x86 CPU pool napříč funkcemi.
- **Increased flexibility** — *deploy any service* na generic pool of compute resources.
- **Reduced time-to-deployment** — žádné HW provisioning. Nová VM = nová síťová funkce.

### Nevýhody

- *Nová technologie* (krátká historie, méně dokumentace).
- *Increased complexity* — virtualizační vrstva přidává *abstraction layer*.

NFV je dnes **standardní** v telco světě — ETSI MANO (Management and Orchestration) framework, vEPC (virtual Evolved Packet Core), 5G core. Operátoři jako Deutsche Telekom, Vodafone, AT&T běžně používají NFV namísto fyzických zařízení.

## P4 — Programming Protocol-independent Packet Processors

**P4** je *třetí pilíř* — *programovatelný data plane*. OpenFlow říká „match these fields, do these actions"; P4 jde dál — *jak parsovat hlavičky, jak je matchovat, jaké akce jsou možné* — vše definuje programátor.

### P4 koncepty

- *Programmable data plane*.
- *Can theoretically run on every platform* — CPU, GPU, FPGA, ASIC.
- *More general than OpenFlow* — uživatel může definovat *přesně, jak forwarding plane processes packets*.
- *OpenFlow lze vyjádřit v P4 jazyce*.

### Příklad P4 kódu

Definice Ethernet hlavičky:

```p4
header_type ethernet_t {
    fields {
        dstAddr : 48;
        srcAddr : 48;
        etherType : 16;
    }
}
```

Definice parser:

```p4
header ethernet eth;
parser ethernet {
    extract(eth);
    switch(eth.etherType) {
        case 0x8100: vlan;
        case 0x9100: vlan;
        case 0x800: ipv4;
        case 0x86dd: ipv6;
    }
}
```

P4 program *definuje* — `extract` říká *kde leží* hlavička v paketu; `switch` říká *jak se rozhodovat* podle EtherType. *Žádný hard-coded* protokol — vše je v P4 kódu.

### P4 v reálném světě

- *Není snadné používat v reálném světě* — *lack of supported devices*.
- **Barefoot Networks** — *acquired by Intel* (2019).
  - *Tofino* chips, ~6,5 Tbit/s.
- *P4 je obecnější než OpenFlow*, dovoluje uživatelům definovat **přesně**, jak forwarding plane procesy pakety.
- *OpenFlow lze vyjádřit v P4 jazyce* — *P4 je tedy nadmnožinou*.

P4 dnes používají hlavně:

- *Hyperscalers* (Google, Facebook, Microsoft) pro custom switchi.
- *Telekom operátoři* (5G core funkce).
- *Bezpečnostní výzkumníci* (custom DDoS protection, network monitoring).

Pro enterprise je P4 *zatím* příliš odlišný od mainstreamu — *nevýznamný* adoption v běžných firmách.

---

*Zdroj: PDS přednáška 10, Ing. Matěj Grégr, Ph.D., FIT VUT v Brně. Externí reference: McKeown, N. et al.: „OpenFlow: Enabling Innovation in Campus Networks" (SIGCOMM CCR, 2008, [DOI 10.1145/1355734.1355746](https://doi.org/10.1145/1355734.1355746)); Bosshart, P. et al.: „P4: Programming Protocol-Independent Packet Processors" (SIGCOMM CCR, 2014, [DOI 10.1145/2656877.2656890](https://doi.org/10.1145/2656877.2656890)); [P4.org](https://p4.org/); [ETSI NFV ISG](https://www.etsi.org/technologies/nfv).*
