---
title: Firewall — filtrování paketů a stavová inspekce
---

# Firewall — filtrování paketů a stavová inspekce

**Firewall** filtruje síťový provoz podle pravidel — provoz buď povolí (*allow*), nebo zamítne (*deny*). Je to klíčový prvek ochrany perimetru (perimeter control), tedy hranice mezi vnitřní sítí a okolním světem. Firewally se vyvinuly od jednoduchých paketových filtrů (90. léta) až po firewally nové generace (next-generation firewalls, NGFW), které rozumějí i obsahu aplikací.

## Typy firewallů

### Paketový filtr (stateless)

Zkoumá *každý paket samostatně* (nezávisle na ostatních). Rozhoduje se podle:

- Zdrojové / cílové IP adresy.
- Zdrojového / cílového portu.
- Protokolu (TCP, UDP, ICMP).
- Směru (příchozí / odchozí).

```
# Allow HTTP from any to webserver
allow tcp from any to 192.168.1.10 port 80

# Deny all other inbound
deny in tcp from any to any
```

Výhody: je rychlý a jednoduchý.

Nevýhody:

- **Nezná souvislosti spojení** — nepozná, zda je příchozí provoz odpovědí na náš legitimní odchozí požadavek (request).
- **Špatně zvládá dynamické protokoly** — například FTP používá náhodně zvolený datový port.
- **Snadno se obejde** — útočník (attacker) může IP pakety fragmentovat a tím filtr zmást.

### Stavový firewall (stateful)

Udržuje si **tabulku stavů spojení** (connection state table). Ví, která spojení jsou „navázaná" (established).

```
# Allow outbound new + established
allow out tcp from internal to any
allow in tcp from any to internal state established

# Deny inbound new connections (except specific)
deny in tcp from any to internal state new
```

Sledování stavů (stateful tracking):

- TCP — stavy SYN, ACK, ESTABLISHED, FIN.
- UDP — pseudostavy odvozené z prvního paketu (UDP je totiž bezstavový, nespojový protokol).
- ICMP — párování dotazu (request) a odpovědi (response).

Stavové kontroly:

- Příchozí pakety *odpovídají* nějakému odchozímu spojení.
- Sekvenční čísla TCP jsou v platném rozsahu.
- Detekce anomálií TCP (záplava SYN paketů, skenování).

V Linuxu se o to stará **netfilter** (`iptables`, v moderní podobě `nftables`).

```bash
# Allow incoming SSH
iptables -A INPUT -p tcp --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT
# Allow outbound, accept return traffic
iptables -A OUTPUT -p tcp -m state --state ESTABLISHED -j ACCEPT
```

### Firewall na aplikační vrstvě (proxy)

Pracuje na *aplikační vrstvě* (application layer). Rozumí konkrétním protokolům:

- **HTTP/HTTPS proxy** — squid, ZAP.
- **SMTP relay** — blokování podle obsahu zprávy.
- **DNS proxy**.

Proxy spojení *ukončí* na obou stranách (vystupuje jako prostředník). Vidí proto celý obsah (u HTTPS to může znamenat útok typu man-in-the-middle pomocí interní certifikační autority).

Výhody: hloubková inspekce a znalost aplikační logiky.

Nevýhody: zpoždění, snížení propustnosti a celková složitost.

### Firewall nové generace (Next-Generation Firewall, NGFW)

Moderní firewall pro podnikové prostředí. Kombinuje:

- Stavovou inspekci.
- Identifikaci aplikací (na základě signatur, na 7. vrstvě).
- Integraci s IDS / IPS.
- Inspekci TLS (s interní certifikační autoritou nainstalovanou na klientech).
- Identitu uživatele (integrace s LDAP).
- Zdroje informací o hrozbách (threat intelligence feeds).

Výrobci: Palo Alto, Fortinet, Check Point, Cisco, Sophos.

## Linux iptables / nftables

`iptables` (starší) a `nftables` (moderní, od Linuxu 3.13+).

### Tabulky a řetězce

`iptables` má 5 tabulek:

- **filter** — výchozí, zahazuje (drop) / přijímá (accept) pakety.
- **nat** — překlad síťových adres (network address translation).
- **mangle** — úprava paketů.
- **raw** — obejití sledování spojení (connection tracking).
- **security** — integrace se SELinuxem.

Každá tabulka má řetězce (chains): INPUT, OUTPUT, FORWARD (tabulka filter).

### Příklad sady pravidel

```bash
# Flush existing
iptables -F

# Default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Loopback
iptables -A INPUT -i lo -j ACCEPT

# Established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# SSH from specific IP
iptables -A INPUT -p tcp -s 203.0.113.0/24 --dport 22 -j ACCEPT

# HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Log + drop rest
iptables -A INPUT -j LOG --log-prefix "DROPPED: "
iptables -A INPUT -j DROP
```

### nftables

```nft
table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;
        ct state established,related accept
        iifname lo accept
        tcp dport ssh ip saddr 203.0.113.0/24 accept
        tcp dport { 80, 443 } accept
        log prefix "DROPPED: " drop
    }
}
```

Je výraznější (lze stručněji vyjádřit pravidla) a umožňuje atomické aktualizace celé sady pravidel naráz.

## Cisco ACL

```
access-list 100 permit tcp 10.0.0.0 0.0.0.255 host 192.168.1.10 eq 80
access-list 100 permit tcp 10.0.0.0 0.0.0.255 host 192.168.1.10 eq 443
access-list 100 deny ip any any
```

Používají se zástupné masky (wildcard masks, inverzní k masce podsítě). ACL mohou být číslované, nebo pojmenované.

## Topologie firewallů

### Dvoudomá brána (dual-homed gateway)

Jeden firewall se dvěma rozhraními (vnější a vnitřní).

```
Internet --- [FW] --- Internal Network
```

Jediný bod, kterým prochází veškerý provoz.

### Oddělená podsíť / DMZ (screened subnet / DMZ)

Firewall se třemi rozhraními. Odděluje zóny pro internet, DMZ a vnitřní síť.

```
Internet --- [FW] --- Internal
              |
              DMZ (web, mail servers)
```

Servery v DMZ jsou dosažitelné z internetu, ale izolované od vnitřní sítě. Vnitřní síť do DMZ přistupovat může, opačně ne.

### Dvouúrovňová topologie (two-tier)

Dva firewally zapojené za sebou:

```
Internet --- [FW1] --- DMZ --- [FW2] --- Internal
```

Firewally od různých výrobců zajišťují obranu do hloubky (defense in depth). K obejití je nutné prolomit oba.

## Podrobnosti stavové inspekce

Pro každé spojení se ukládá pětice `(src_ip, src_port, dst_ip, dst_port, protocol)`.

Stavový automat pro TCP:

```
SYN_SENT → SYN_RECV → ESTABLISHED → FIN_WAIT → TIME_WAIT → CLOSED
```

Firewall přechází mezi stavy podle pozorovaných paketů. Po vypršení časového limitu se záznam ze stavu odstraní (aged out).

Záleží na velikosti tabulky stavů — ve velkých prostředích jde o miliony spojení.

::: viz firewall-stateful-trace "Spusť scénář paket po paketu (DNS dotaz + sonda útočníka). Vidíš souběžně verdikt bezstavového filtru (stateless, pravidlo na každý paket zvlášť) i stavového filtru (stateful, kontrola proti tabulce stavů); pakety útočníka bez navázaného stavu → DENY."
:::

## Moderní výzvy

### Šifrování TLS

Většina provozu dnes běží přes HTTPS. Firewall nemůže zkoumat obsah bez:

- **Inspekce TLS** — s interní certifikační autoritou se provoz dešifruje a znovu zašifruje. Vznikají obavy o soukromí a výkon (performance).
- **Otisků JA3 (JA3 fingerprinting)** — porovnání vzoru zprávy „client hello" v rámci TLS.
- **SNI** — Server Name Indication (přenášené v otevřené podobě) prozrazuje cíl spojení.

Moderní protokoly (ECH — Encrypted Client Hello, TLS 1.3) SNI skrývají, čímž viditelnost provozu snižují.

### Zapouzdření / tunelování (encapsulation / tunneling)

Útočníci mohou data tunelovat:

- HTTPS — pokryje většinu případů.
- DNS-over-HTTPS — odčerpávání dat (exfil) skrze DNS.
- ICMP / IPv6 — skryté kanály.

Pomáhají firewally rozumějící aplikacím a zdroje informací o hrozbách (threat intel feeds).

### Cloud / kontejnerizace

Tradiční firewall na perimetru ztrácí význam. V cloudu se používá:

- **Security Groups** (AWS) — firewall na úrovni instance.
- **NSGs** (Azure) — bezpečnostní skupiny sítě (network security groups).
- **Cloud Armor** (GCP).
- **Network policies** (Kubernetes).

Síť mikroslužeb: **service mesh** (Istio, Linkerd) poskytuje vzájemné TLS (mTLS) s ověřením identity a politiky řízení přístupu.

### Zero Trust

„Nikdy nedůvěřuj, vždy ověřuj." Žádný perimeter neexistuje. Každé spojení se autentizuje (authentication) a autorizuje (authorization).

- **BeyondCorp** (Google) — open-source i komerční implementace.
- **Identity-Aware Proxy** (Cloudflare Access, AWS IAP).

Standardizuje to NIST SP 800-207.

## Osvědčené postupy pro firewally

1. **Výchozí zákaz (default deny)** — explicitní pravidla povolení, zbytek zakaž.
2. **Princip nejnižších oprávnění (least privilege)** — jen nezbytné porty a protokoly.
3. **Dokumentuj** — každé pravidlo má svůj důvod.
4. **Revize** — čtvrtletní úklid zastaralých pravidel.
5. **Logování** — zaznamenávej zamítnutý provoz a vzorek povoleného.
6. **Zálohuj** — sady pravidel verzuj a měj je obnovitelné.
7. **Monitoruj** — tabulky spojení a počty zásahů jednotlivých pravidel.
8. **Testuj** — penetrační testování, ověření funkčnosti pravidel.

## Co firewall neřeší

- **Vnitřní hrozby (insider threats)** — jakmile je útočník uvnitř, firewall je mu lhostejný.
- **Zranitelnosti aplikací (application vulnerabilities)** — útoky jako XSS či SQLi firewallem volně projdou.
- **Šifrované útoky** — pokud šifrování obejde inspekci.
- **Boční pohyb (lateral movement)** — provoz mezi servery (východ-západ) se obvykle nefiltruje (pokud není zavedena mikrosegmentace).
- **DDoS** — typicky vyžaduje zásah nadřazeného poskytovatele.

⇒ Firewall je *jen jednou vrstvou* obrany do hloubky, nikoli zázračné řešení všeho.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=kDEX1HXybrU" "What is a Firewall?" "PowerCert Animated Videos"
:::

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Cheswick, W.R., Bellovin, S.M., Rubin, A.D.: „Firewalls and Internet Security" (2nd ed., Addison-Wesley 2003); NIST SP 800-41 — Guidelines on Firewalls and Firewall Policy; [Linux netfilter](https://netfilter.org/); [nftables Wiki](https://wiki.nftables.org/); Zwicky, E., Cooper, S., Chapman, D.B.: „Building Internet Firewalls" (2nd ed., O'Reilly 2000).*
