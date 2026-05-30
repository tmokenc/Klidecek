# Síťová zařízení — modem, hub, switch, router

Vrstvený model ([[vrstvene-modely]]) říká *kdo dělá co*. Tato sekce mapuje vrstvy na **konkrétní fyzická zařízení** v síti — od kabelu po směrovač — a zavádí dva klíčové pojmy: **kolizní doména** a **broadcast doména**, které jsou nutné pro pochopení switchingu (Lec 4, [[prepinac-uvod]]) a směrování (Lec 3, [[smerovani-uvod]]).

## Mapování zařízení na vrstvy

| L | Zařízení | Funkce |
| :---: | :--- | :--- |
| 1 | **Kabel, optické vlákno** | fyzické médium |
| 1 | **Hub, repeater** | regenerace signálu, multiport repeater |
| 1.5 | **Modem** | převod mezi technologiemi (Ethernet ↔ DSL/CATV) |
| 2 | **Switch, bridge** | přepínání rámců podle MAC |
| 2.5 | **MPLS LSR** | label switching |
| 3 | **Router** | směrování paketů podle IP |
| 4–7 | **Firewall, IDS, proxy, load balancer** | aplikační logika |

V dalších přednáškách PDS prozkoumáme **vnitřnosti směrovačů** ([[router-funkce]]), **architekturu switchů** ([[prepinac-uvod]]) a **klasifikaci paketů** ([[klasifikace-uvod]]).

## Modem (L1.5)

**Modem** (modulator–demodulator) překládá data mezi **dvěma různými L2 technologiemi** — typicky Ethernet ↔ něco jiného (DSL, kabelová televize, telefonní linka).

- Stojí mezi *poskytovatelem internetu* a *lokální sítí*.
- Není L1 (pracuje s rámci), ani L2 (jen tlumočí mezi formáty). Někdy se mu říká **L1.5**.

V Cisco terminologii je modem často součást *CPE* (Customer Premise Equipment).

## Hub a Repeater (L1)

**Hub** je *multiport repeater*. Regeneruje elektromagnetický signál:

- Rozšiřuje *dosah* sdíleného média.
- Rozšiřuje **kolizní doménu** (signál se šíří dál).
- Pracuje *pouze v half-duplex* (jeden vysílač najednou).
- Všechny porty musí mít *stejnou rychlost*.

Hub je *legacy* zařízení — v moderních sítích vidíme jen switche. Pro pochopení toho, proč switche existují, je ale hub důležitým výchozím bodem.

## Switch a Bridge (L2)

**Switch** je *multiport bridge* — L2 zařízení, které rozhoduje *na základě MAC adresy*.

Klíčový datový struktura: **CAM tabulka** (*Content-Addressable Memory*) — asociace mezi *portem* a *MAC adresou*.

Pravidla switche:

1. Při příjmu rámce: *přečti source MAC*, zapiš jej spolu s portem do CAM tabulky (*learning*).
2. *Najdi destination MAC* v CAM:
   - Pokud **existuje** → pošli rámec *jen na daný port* (*forwarding*).
   - Pokud **neexistuje** → *flooduj* na všechny porty kromě vstupního.
3. Při překročení TTL záznamu (default ~5 min) → záznam zmizí, znovu flooding.

Praktický důsledek: switch *postupně se naučí* mapování. První rámce po startu jsou flood, pak komunikace přechází na targeted forwarding.

:::svg
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg" style="max-width:580px;width:100%;height:auto;font-family:system-ui,sans-serif;">
  <defs>
    <style>
      .sw{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5;rx:6}
      .pc{fill:var(--bg-inset);stroke:var(--line-strong);stroke-width:1;rx:3}
      .ln{stroke:var(--line-strong);stroke-width:1;fill:none}
      .ttl{font-size:11px;font-weight:600;text-anchor:middle;fill:var(--text)}
      .cell{font-size:10px;text-anchor:middle;fill:var(--text);font-family:monospace}
      .hdr{font-size:10px;font-weight:600;text-anchor:middle;fill:var(--text-muted);font-family:monospace}
    </style>
  </defs>
  <!-- switch -->
  <rect class="sw" x="240" y="80" width="60" height="40"/>
  <text class="ttl" x="270" y="102">switch</text>
  <!-- PC-A -->
  <rect class="pc" x="60" y="80" width="60" height="40"/>
  <text class="cell" x="90" y="96">PC-A</text>
  <text class="cell" x="90" y="110">AA:..:AA</text>
  <line class="ln" x1="120" y1="100" x2="240" y2="100"/>
  <text class="hdr" x="180" y="93">port 1</text>
  <!-- PC-C -->
  <rect class="pc" x="420" y="80" width="60" height="40"/>
  <text class="cell" x="450" y="96">PC-C</text>
  <text class="cell" x="450" y="110">CC:..:CC</text>
  <line class="ln" x1="300" y1="100" x2="420" y2="100"/>
  <text class="hdr" x="360" y="93">port 3</text>
  <!-- CAM table -->
  <rect class="pc" x="190" y="150" width="160" height="40"/>
  <text class="hdr" x="270" y="165">CAM Table</text>
  <text class="cell" x="230" y="180">AA:..:AA → 1</text>
  <text class="cell" x="310" y="180">CC:..:CC → 3</text>
</svg>
:::

Po jednom oboustranném páru rámců A↔C má switch v CAM tabulce oba zápisy a další komunikace už neflooduje.

**Klíčová vlastnost switche pro kolizní/broadcast doménu:**

- *Omezuje* kolizní doménu — ideálně každý port je samostatná full-duplex point-to-point doména. Mezi switchovanými hosty *kolize nenastávají*.
- *Rozšiřuje* broadcast doménu — broadcast (FF:FF:FF:FF:FF:FF) se pořád *šíří přes všechny porty switche*. Pro rozdělení broadcast domény je potřeba **VLAN** (Lec 4, [[prepinac-uvod]]) nebo **router**.

## Router (L3)

**Router** rozhoduje *na základě IP adresy*:

- Udržuje **routing table** (tabulka cest), v níž má pro každou *cílovou síť* příští skok (next-hop).
- Pro každý příchozí paket vybere cestu pomocí **longest-prefix match** (nejdelší shoda prefixu) — viz Lec 3 ([[smerovaci-tabulky]]) a Lec 6 ([[klasifikace-uvod]]).
- *Limituje* broadcast doménu — paket s broadcast IP (255.255.255.255) router *nepřeposílá*.

Praktická role: **router odděluje LAN segmenty**. Bez routeru by všechny počítače v podniku byly v jedné velké broadcast doméně, což by zaplavovalo síť. S routerem se každá LAN stává svou broadcast doménou.

## Collision domain a broadcast domain

Dva pojmy jsou kritické pro pochopení sítě:

- **Kolizní doména** — segment sítě, kde *mohou nastat kolize* (současné vysílání více uzlů na sdíleném médiu). Rozšiřuje ji hub a kabel. *Limituje* ji switch.
- **Broadcast doména** — segment sítě, *kam se dostane broadcast* (FF:FF:FF... nebo 255.255.255.255). Rozšiřuje ji switch a hub. *Limituje* ji router (a VLAN).

V moderní síti s plně switchovaným Ethernetem je *kolizní doména každý jednotlivý kabel mezi PC a switchovým portem*. Kolize prakticky vymizely.

Broadcast domény zůstávají větší — typicky celá VLAN nebo subnet. Návrh sítě se podstatně točí kolem **toho, jak velké mají být broadcast domény** — moc malé = příliš mnoho routerů a IP plánovaní; moc velké = ARP storm, broadcast traffic, bezpečnostní rizika.

## L2 vs L3 responsibilities

| Aspekt | L2 (Data Link) | L3 (Network) |
| :--- | :--- | :--- |
| Adresa | MAC (EUI-48) | IP (IPv4/IPv6) |
| Rozsah | *Hop-by-hop*, lokální | *End-to-end*, global |
| Hlavička | Přepisuje se na každém uzlu | Beze změny (kromě TTL/HopLimit) |
| Hlavní funkce | MAC, LLC, framing | Routing, packet forwarding, fragmentace |
| Standardy | IEEE 802.* (802.3 Ethernet, 802.11 WiFi, 802.15.1 BT) | IETF RFC (IPv4, IPv6, ICMP) |

## MTU a fragmentace

**MTU** (*Maximum Transmission Unit*) = největší L2 PDU, kterou daná technologie umí přenést.

Typické hodnoty:

| Technologie | MTU (B) |
| :--- | :---: |
| Ethernet v2 | 1500 |
| Ethernet (Jumbo Frames) | 1501–9198 |
| PPPoE | 1492 |
| WLAN 802.11 | 7981 |
| FDDI | 4352 |
| Path MTU minimum (IPv4) | 68 |
| Path MTU minimum (IPv6) | 1280 |

Pokud má L3 paket *větší* velikost než MTU následující linky, jsou dvě možnosti:

- **IPv4 fragmentace** — router rozdělí paket na fragmenty (`MF` flag, `Fragment Offset`). Reassembly dělá *destination*. Cena: zvýšená režie, riziko ztráty fragmentu znamená *ztrátu celého původního paketu*.
- **IPv6 — bez fragmentace na routeru** — jen *odesílatel* může fragmentovat (RFC 8200). Vyžaduje se **Path MTU Discovery** (PMTUD, RFC 1981).

V moderním IPv6 přístupu je fragmentace *nežádoucí* — IPv6 routery ji nedělají, odesílatel musí buď použít PMTUD nebo posílat pakety ≤ 1280 B.

## Co dále

S přehledem zařízení a domén v hlavě se podíváme na **adresování** — nejprve L2 (MAC, Ethernet, [[adresovani-l2]]), pak L3 (IPv4 a IPv6, [[adresovani-l3]]).

---

*Zdroj: PDS přednáška 1 (Networker's Handbook, part 1), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: Cisco Networking Academy — [Switching and Routing Concepts](https://www.netacad.com); [RFC 1191 — Path MTU Discovery (IPv4)](https://www.rfc-editor.org/rfc/rfc1191); [RFC 8201 — Path MTU Discovery (IPv6)](https://www.rfc-editor.org/rfc/rfc8201).*
