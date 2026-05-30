---
title: NetFlow a IPFIX — flow-based monitoring
---

# NetFlow a IPFIX — flow-based monitoring

Pakety jsou *mikroskopický* pohled — pro páteřní 100 Gbps linku desítky milionů paketů za sekundu nelze logovat. **Flow-based monitoring** agreguje pakety do *flow* záznamů — tisíce paketů kompromisně reprezentuje *jeden* záznam. Tato sekce probere **NetFlow** (Cisco) a **IPFIX** (IETF standard), jejich exportní mechanismy a typické analyzéry.

## Co je flow

> **Flow** = sekvence paketů s **stejným tuple** klíčových polí, prošlých *jedním pozorovacím bodem* během *omezené doby*.

Standardní **5-tuple** flow:

- `(src IP, dst IP, src port, dst port, IP protocol)`

Někdy 7-tuple: + `(ToS / DSCP, ingress interface)`.

Příklady flow:

- Stahování souboru z FTP — jediný flow, 4 MB v 500 paketech.
- HTTPS request stránky — jeden flow tam, jeden zpět (oddělené, různý source port).
- Ping `1.1.1.1` — všechny Echo Request → jeden flow; všechny Echo Reply → druhý flow.

## Flow record — co se eviduje

| Pole | Význam |
| :--- | :--- |
| **5-tuple** | identifikace flow |
| **Bytes** | celkový objem v flow |
| **Packets** | počet paketů |
| **Start time** | první paket flow |
| **End time** | poslední paket |
| **TCP flags** (OR-ed) | jaké flagy se za flow objevily |
| **ToS/DSCP** | QoS markování |
| **Input/Output interface** | kterými porty |
| **Next hop** | next-hop IP |
| **AS source/dest** | autonomní systém (s BGP) |

Rozšířené (Flexible NetFlow / IPFIX):

- TLS SNI / JA4 fingerprint.
- HTTP host, URL (pokud nešifrované).
- DNS query.
- VLAN tag.
- *Vlastní pole* — vendor extensions.

## NetFlow — historie a verze

Cisco vyvinul NetFlow v 1996 pro *interní use* (router rozhodnutí). V 2002 zveřejněn formát.

| Verze | Rok | Vlastnosti |
| :--- | :---: | :--- |
| v1 | 1996 | základní, fixní formát |
| v5 | 2002 | *standardní*, 5-tuple + BGP, 49 polí, *široce nasazený* |
| v7 | 1997 | Cat 5000 switche |
| v8 | 1998 | aggregation pre-router |
| v9 | 2003 | **template-based** — flexibilní, IPv6 support |
| **IPFIX** | 2008 | IETF standardizace v9 (RFC 5101) |

V současnosti:

- **NetFlow v5** — legacy, stále široce v ISP infrastructure.
- **NetFlow v9 / IPFIX** — moderní, template-based.
- **sFlow** — *sampled* alternative (InMon, 2001) — neagreguje, *vzorkuje* 1 z N paketů.

## NetFlow v5 architektura

::: svg "NetFlow architecture — router/exporter, collector, analyzer"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="20" y="40" width="100" height="60"/>
    <rect x="220" y="40" width="100" height="60"/>
    <rect x="420" y="40" width="100" height="60"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70" y="65" font-weight="600">Router</text>
    <text x="70" y="83" font-size="10">/exporter</text>
    <text x="270" y="65" font-weight="600">Collector</text>
    <text x="270" y="83" font-size="10">nfcapd, ipfixcol</text>
    <text x="470" y="65" font-weight="600">Analyzer</text>
    <text x="470" y="83" font-size="10">nfsen, Kibana</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none" marker-end="url(#arr3)">
    <line x1="125" y1="70" x2="215" y2="70"/>
    <line x1="325" y1="70" x2="415" y2="70"/>
  </g>
  <defs>
    <marker id="arr3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--text-muted)" font-size="10" text-anchor="middle">
    <text x="170" y="60">UDP/2055</text>
    <text x="370" y="60">storage,</text>
    <text x="370" y="73">SQL, ES</text>
  </g>
  <text x="270" y="140" fill="var(--text-muted)" text-anchor="middle" font-size="10">Provoz jde routerem; ten zaznamenává flow tabulku;</text>
  <text x="270" y="155" fill="var(--text-muted)" text-anchor="middle" font-size="10">po expirovaném flow / timeoutu posílá UDP exportní pakety</text>
</svg>
:::

### Exporter — router/switch

- Sleduje *všechny* pakety (anebo *sample*) na monitorovaných rozhraních.
- Pro každý paket najde / vytvoří *flow entry* v paměti.
- Po **active timeout** (typicky 60 s) nebo **inactive timeout** (typicky 15 s) flow expíruje.
- Expírovaný flow se exportuje UDP paketem na collector.

### Collector

- Software: **nfcapd** (NfSen), **fprobe**, **softflowd**, **ipfixcol** (CESNET).
- Přijímá UDP exportní pakety, ukládá do *flat soubor* (binární RWA / CSV / Avro) nebo databáze.

### Analyzer

- **NfSen** — web UI nad nfdump.
- **Kibana / Grafana** — moderní dashboards.
- **Stenographer** — full packet capture s flow indexem.

## IPFIX — IETF standard

[RFC 7011](https://www.rfc-editor.org/rfc/rfc7011) (2013). Vychází z NetFlow v9, ale:

- **Vendor-neutral** — žádný Cisco-specific.
- **SCTP transport** ([[sctp]]) doporučen pro spolehlivost (UDP zde stále možný).
- **Variable-length** fields (IPv6 prefix, hostname).
- **Bidirectional** flows ([RFC 5103](https://www.rfc-editor.org/rfc/rfc5103)) — *jeden* záznam pro obě polovičky komunikace.
- **Custom fields** od PEN (Private Enterprise Numbers).

IPFIX exportér posílá **Templates** (popisy struktury záznamu) + **Data Records** podle template. Collector si template uloží a podle něj parsuje další records.

Příklad template:

```
Template ID 256:
  IPv4 src address (4 B)
  IPv4 dst address (4 B)
  src port (2 B)
  dst port (2 B)
  IP protocol (1 B)
  bytes (8 B)
  packets (8 B)
```

Pak data records:

```
Template 256:
  192.168.1.10, 8.8.8.8, 54200, 443, 6, 12340, 21
  10.0.5.42, 1.1.1.1, 51000, 53, 17, 80, 1
```

Tisíce data records komprimovaných do jednoho exportního paketu.

## Sampling

Při 100 Gbps a milionech flows nelze sledovat *všechny pakety* — výpočetně nemožné.

**Sampled NetFlow**: zpracovat *1 z N* paketů. N obvykle 1000 nebo 4096. Statisticky reprezentativní pro objem traffic; přesnost na úrovni jednotlivých flows však klesá.

**sFlow** — *vždy* sample-based, designed pro high-speed switches. Vendor hardware podpora široká.

## Application Visibility — Flexible NetFlow

Cisco's modern NetFlow může extrahovat *application-layer* metadata:

- **NBAR2** (Network-Based Application Recognition) — Cisco aplikační detekce.
- DNS hostnames z DNS query.
- HTTP host header z HTTP/1.1 (HTTPS jen SNI).
- TLS JA3/JA4.

To dělá flow monitoring víc *informativní* — flow record nese nejen 5-tuple, ale *kontext* "to byla komunikace s `google.com` přes HTTPS, klient JA3 = `e7d705a3..`".

## Použití flow dat

### 1. Capacity planning

Top destinace, top zdroje, top porty → ví, *kde* síť hoří. Kde přidat bandwidth.

### 2. Security

- **DDoS detekce** — náhle 10× nárůst flows do jedné destinace = útok.
- **C&C detection** — beacon traffic (perioidcké flows na stejný external host).
- **Data exfiltrace** — abnormálně velký *upload* k externí IP.

### 3. Forensics

Po incidentu — *retrospektivní* dotaz: "kdo komunikoval s `evil-c2.com` v posledních 30 dnech?" Flow data odpoví během sekund (oproti full packet capture, kde dotaz trvá hodiny).

### 4. Billing / accounting

ISP účtuje zákazníkům podle objemu — z flow dat lze přesně vyextrahovat.

### 5. Compliance

NIS2, GDPR audits vyžadují *záznam* o tom, kdo s kým komunikoval (ne nutně *o čem*). Flow data ideální — chrání privacy uživatele (ne payload), zaznamenává metadata.

## Ekosystém

V 2026 typický deployment:

- **Exporters**: Cisco ASR/IOS-XE/Nexus, Juniper MX/QFX, Mikrotik, FRR (Linux open-source).
- **Collectors**: ipfixcol2 (CESNET, open-source), Flowmon (CZ vendor), Cisco Stealthwatch.
- **Analytics**: Splunk, ELK stack, Plixer Scrutinizer, ntopng.

Česká firma **Flowmon** (akvírovaná Kemp v 2020) je *globální leader* v IPFIX-based NDR (Network Detection & Response).

## Co dál

Flow monitoring je *makro* pohled. Pro detekci *netypických* vzorů, které signatura ani 5-tuple nezachytí, potřebujeme statistický model — **detekce anomálií** ([[detekce-anomalii]]).

---

*Zdroj: PDS přednáška 8 (IDS), doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: [RFC 7011 — IPFIX Protocol Specification](https://www.rfc-editor.org/rfc/rfc7011); [RFC 7012 — IPFIX Information Model](https://www.rfc-editor.org/rfc/rfc7012); [RFC 3954 — Cisco NetFlow v9](https://www.rfc-editor.org/rfc/rfc3954); [Cisco NetFlow Configuration Guide](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/fnetflow/configuration/15-mt/fnf-15-mt-book.html); [CESNET ipfixcol2 project](https://github.com/CESNET/ipfixcol2); Patel, B., Plonka, D.: „Detecting Web Hosting Anomalies with Cisco NetFlow" (NETMON 2007).*
