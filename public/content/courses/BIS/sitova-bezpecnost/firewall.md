---
title: Firewall — packet filtering a stateful inspection
---

# Firewall — packet filtering a stateful inspection

**Firewall** filtruje síťový provoz podle pravidel — *allow* nebo *deny*. Klíčový perimeter control. Evolved from simple packet filters (1990s) to next-generation firewalls (NGFW) with application awareness.

## Typy firewallů

### Packet filter (stateless)

Inspect *each packet independently*. Based on:

- Source / destination IP.
- Source / destination port.
- Protocol (TCP, UDP, ICMP).
- Direction (in / out).

```
# Allow HTTP from any to webserver
allow tcp from any to 192.168.1.10 port 80

# Deny all other inbound
deny in tcp from any to any
```

Pros: fast, simple.

Cons:

- **No connection awareness** — can't tell if return traffic is for legit outbound.
- **Hard to handle dynamic protocols** — FTP uses random data port.
- **Easy to bypass** — fragment IP packets to confuse.

### Stateful firewall

Maintains **connection state table**. Knows which connections are "established".

```
# Allow outbound new + established
allow out tcp from internal to any
allow in tcp from any to internal state established

# Deny inbound new connections (except specific)
deny in tcp from any to internal state new
```

Stateful tracking:

- TCP — SYN, ACK, ESTABLISHED, FIN states.
- UDP — pseudo-states based on first packet (since UDP is connectionless).
- ICMP — request/reply pairing.

Stateful checks:

- Return packets *match* outbound connection.
- TCP sequence numbers in valid range.
- Detect TCP anomalies (SYN flood, scan).

Linux: **netfilter** (`iptables`, modern `nftables`).

```bash
# Allow incoming SSH
iptables -A INPUT -p tcp --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT
# Allow outbound, accept return traffic
iptables -A OUTPUT -p tcp -m state --state ESTABLISHED -j ACCEPT
```

### Application-layer firewall (proxy)

Operates at *application layer*. Understands protocols:

- **HTTP/HTTPS proxy** — squid, ZAP.
- **SMTP relay** — block based on content.
- **DNS proxy**.

Proxy *terminates* connection on both sides. Sees full content (HTTPS may MITM with internal CA).

Pros: deep inspection, application logic.

Cons: latency, throughput overhead, complex.

### Next-Generation Firewall (NGFW)

Modern enterprise FW. Combines:

- Stateful inspection.
- Application identification (signature-based, layer 7).
- IDS / IPS integration.
- TLS inspection (with internal CA installed on clients).
- User identity (LDAP integration).
- Threat intelligence feeds.

Vendors: Palo Alto, Fortinet, Check Point, Cisco, Sophos.

## Linux iptables / nftables

`iptables` (older) and `nftables` (modern Linux 3.13+).

### Tables and chains

`iptables` has 5 tables:

- **filter** — default, drop / accept.
- **nat** — network address translation.
- **mangle** — packet modification.
- **raw** — connection tracking bypass.
- **security** — SELinux integration.

Each table has chains: INPUT, OUTPUT, FORWARD (filter table).

### Example ruleset

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

More expressive, atomic ruleset updates.

## Cisco ACL

```
access-list 100 permit tcp 10.0.0.0 0.0.0.255 host 192.168.1.10 eq 80
access-list 100 permit tcp 10.0.0.0 0.0.0.255 host 192.168.1.10 eq 443
access-list 100 deny ip any any
```

Wildcard masks (inverse of subnet mask). Numbered or named ACLs.

## Firewall topologies

### Dual-homed gateway

Single firewall with 2 interfaces (external, internal).

```
Internet --- [FW] --- Internal Network
```

Single point. All traffic crosses.

### Screened subnet / DMZ

3-interface FW. Separate zones for internet, DMZ, internal.

```
Internet --- [FW] --- Internal
              |
              DMZ (web, mail servers)
```

DMZ servers reachable from internet but isolated from internal. Internal accesses DMZ; not vice versa.

### Two-tier

Two firewalls in series:

```
Internet --- [FW1] --- DMZ --- [FW2] --- Internal
```

Different vendor firewalls — defense in depth. Bypass requires defeating both.

## Stateful inspection details

Per connection: tuple `(src_ip, src_port, dst_ip, dst_port, protocol)`.

State machine for TCP:

```
SYN_SENT → SYN_RECV → ESTABLISHED → FIN_WAIT → TIME_WAIT → CLOSED
```

Firewall transitions states on observed packets. Aged out after timeout.

State table size matters — large environments: millions of connections.

::: viz firewall-stateful-trace "Pusť paket-by-paket scénář (DNS dotaz + attacker probe). Vidíš souběžně stateless verdict (per-packet rule) a stateful (kontrola state table); attacker pakety bez stavu → DENY."
:::

## Modern challenges

### TLS encryption

Most traffic now HTTPS. Firewall can't inspect content without:

- **TLS inspection** — internal CA, decrypt + re-encrypt. Privacy + perf concerns.
- **JA3 fingerprinting** — match TLS client hello pattern.
- **SNI** — Server Name Indication (cleartext) reveals destination.

Modern protocols (ECH — Encrypted Client Hello, TLS 1.3) hide SNI. Reducing visibility.

### Encapsulation / Tunneling

Attackers can tunnel:

- HTTPS — covers most.
- DNS-over-HTTPS — DNS exfil.
- ICMP / IPv6 — covert channels.

Application-aware FW + threat intel feeds help.

### Cloud / Containerization

Traditional perimeter FW less relevant. Cloud:

- **Security Groups** (AWS) — instance-level firewall.
- **NSGs** (Azure) — network security groups.
- **Cloud Armor** (GCP).
- **Network policies** (Kubernetes).

Microservice mesh: **service mesh** (Istio, Linkerd) provides identity-aware mTLS + policy.

### Zero Trust

"Never trust, always verify." No perimeter. Every connection authenticated + authorized.

- **BeyondCorp** (Google) — open-source / commercial implementations.
- **Identity-Aware Proxy** (Cloudflare Access, AWS IAP).

NIST SP 800-207 standardizuje.

## Firewall best practices

1. **Default deny** — explicit allow rules; deny rest.
2. **Least privilege** — only required ports/protocols.
3. **Document** — every rule has reason.
4. **Review** — quarterly cleanup of stale rules.
5. **Logging** — log denied + sample of allowed.
6. **Backup** — rule sets versioned, recoverable.
7. **Monitor** — connection tables, rule hits.
8. **Test** — penetration testing, verify rules.

## Firewall ne-řeší

- **Insider threats** — once inside, firewall irrelevant.
- **Application vulnerabilities** — XSS, SQLi pass through firewall.
- **Encrypted attacks** — if encryption bypasses inspection.
- **Lateral movement** — east-west traffic typically not filtered (without microsegmentation).
- **DDoS** — typically requires upstream provider.

⇒ Firewall is *one layer* of defense in depth, not silver bullet.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Cheswick, W.R., Bellovin, S.M., Rubin, A.D.: „Firewalls and Internet Security" (2nd ed., Addison-Wesley 2003); NIST SP 800-41 — Guidelines on Firewalls and Firewall Policy; [Linux netfilter](https://netfilter.org/); [nftables Wiki](https://wiki.nftables.org/); Zwicky, E., Cooper, S., Chapman, D.B.: „Building Internet Firewalls" (2nd ed., O'Reilly 2000).*
