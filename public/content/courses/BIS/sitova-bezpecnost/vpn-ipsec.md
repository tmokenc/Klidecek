---
title: VPN, IPsec, WireGuard a TLS tunnely
---

# VPN — IPsec, OpenVPN, WireGuard a TLS tunneling

**VPN** (Virtual Private Network) vytváří *encrypted tunnel* mezi sítěmi nebo hosty. Použití: remote work, site-to-site connectivity, privacy. Tato sekce porovnává hlavní VPN technologie.

## IPsec — IP Security

IETF standard pro layer 3 encryption. Komplexní — multiple protocols, modes.

### Komponenty

- **AH** (Authentication Header) — integrity + authentication. *Žádná* confidentiality.
- **ESP** (Encapsulating Security Payload) — confidentiality + integrity.
- **IKE** (Internet Key Exchange) — negotiation of keys + parameters.
- **IKEv2** (RFC 7296) — current standard.

### Módy

- **Transport mode** — encrypts payload. Header + IP header visible.
- **Tunnel mode** — encrypts *entire* IP packet, wraps in new IP header. Standard for VPN.

```
Original:    [IP header][TCP][data]
Transport:   [IP header][ESP header][TCP][data + ESP trailer]
Tunnel:      [new IP header][ESP][orig IP header][TCP][data + ESP trailer]
```

### IKE handshake

IKEv2 uses named *exchanges* (not phases like IKEv1):

**IKE_SA_INIT**: negotiate IKE parameters, establish IKE SA.

**IKE_AUTH**: authenticate, establish the first Child SA for ESP.

**CREATE_CHILD_SA**: separate exchange for additional / rekeyed Child SAs.

Authentication options:

- **PSK** (Pre-Shared Key).
- **Certificate** ([[x509]]) — RSA / ECDSA.
- **EAP** — extensible auth, for users.

### Algorithm suites

IKEv2 + ESP combinations:

- **AES-256-GCM** + ECDH P-384 — modern.
- **AES-256-CBC** + HMAC-SHA256 + DH 2048 — legacy.
- **ChaCha20-Poly1305** + Curve25519 — high-perf software.

### IPsec setup

```bash
# strongSwan, /etc/ipsec.conf
conn corporate-vpn
    left=%defaultroute
    leftauth=psk
    leftid=client@corp.com
    right=vpn.corp.com
    rightid=@vpn.corp.com
    rightsubnet=10.0.0.0/8
    ike=aes256-sha256-modp2048!
    esp=aes256-sha256!
    keyexchange=ikev2
    auto=start
```

Complex to configure. Common issue: mismatched parameters between peers.

### Pros

- Standard, broad support.
- Network-layer (transparent to apps).
- Strong crypto.

### Cons

- Complex configuration.
- NAT issues (especially older IKEv1).
- Performance overhead (encryption + tunnel headers).

### Real-world IPsec

- **Site-to-site** — connect branch offices to HQ.
- **Remote access** — windows native, Cisco AnyConnect, Fortinet, Pulse Secure.
- **Cloud connectivity** — AWS VPN, Azure VPN Gateway, Google Cloud VPN.

## OpenVPN

Open-source TLS-based VPN. Less complex than IPsec.

```
# /etc/openvpn/client.conf
client
remote vpn.example.com 1194
dev tun
proto udp
ca ca.crt
cert client.crt
key client.key
tls-auth ta.key 1
cipher AES-256-GCM
auth SHA256
```

### Pros

- Simple to configure.
- Cross-platform (Windows, Linux, macOS, mobile).
- NAT-friendly (UDP or TCP).
- Strong defaults.

### Cons

- Higher overhead vs IPsec/WireGuard.
- Userspace process (less perf than kernel-level).

Used by many commercial VPN providers (NordVPN, ExpressVPN).

## WireGuard

Modern VPN. Designed by Jason Donenfeld (2017). Linux kernel default since 5.6.

### Design philosophy

- **Minimal** — ~4000 lines kernel code (vs 100k+ for OpenVPN/IPsec).
- **Modern crypto only** — Curve25519, ChaCha20, Poly1305, BLAKE2s, SipHash.
- **No agility** — single ciphersuite, *if* broken, upgrade everything.
- **Fast** — kernel implementation, simple state machine.
- **Stateless server** — no per-connection state until packet arrives.

### Configuration

```ini
[Interface]
PrivateKey = <client private key>
Address = 10.0.0.2/24
DNS = 10.0.0.1

[Peer]
PublicKey = <server public key>
Endpoint = vpn.example.com:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
```

Extremely simple. Static, declarative.

### Roaming

WireGuard handles roaming clients seamlessly. Client IP changes (mobile move WiFi → cellular) — server sees new IP, packets still decrypted with public key.

### Pros

- Simple, fast, modern.
- Kernel implementation (Linux).
- Cross-platform.

### Cons

- No dynamic peer config (each peer pre-configured).
- No certificate authentication (only public keys).
- Newer, less enterprise adoption.

Used by: Mullvad, ProtonVPN, Tailscale (built on WireGuard).

## Tailscale + zero-trust mesh

**Tailscale** — commercial mesh VPN on WireGuard.

- Auto-configuration via identity provider (Google, Microsoft, Okta).
- NAT traversal (DERP relays).
- Peer-to-peer connections.
- ACLs per user/role.

Trend: mesh replaces hub-spoke for cloud-native orgs.

Alternative: **Headscale** (open-source self-host), **Netbird**, **Nebula** (Slack).

## TLS-based VPN

### SSTP

Microsoft, uses HTTPS port 443 → passes through firewalls easily.

### TLS tunnel

OpenVPN over TCP 443 looks like HTTPS. Stealth mode bypasses censorship.

### WireGuard obfuscation

`udp2raw`, `wstunnel` wrap WireGuard in TCP/HTTP/WebSocket — bypass UDP-blocking firewalls.

## SSH tunneling

```bash
# Local port forward — local 8080 → remote 80
ssh -L 8080:internal.host:80 user@gateway

# Remote port forward — remote 8080 → local 80
ssh -R 8080:localhost:80 user@gateway

# SOCKS proxy
ssh -D 1080 user@gateway
```

Lightweight ad-hoc tunneling. SSH transport secured (encrypts handshake + data).

## TLS for application

Not strictly VPN, but TLS provides similar:

- **HTTPS** — web encryption.
- **mTLS** — mutual TLS, both endpoints authenticate.

Detail [[tls-aplikace]].

## Performance srovnání

For raw throughput on modern HW:

| Solution | Speed | CPU usage |
| :--- | :---: | :---: |
| WireGuard | ~1.5-3 Gbps | low |
| IPsec (kernel) | ~1-2 Gbps | medium |
| OpenVPN | ~300-800 Mbps | high |
| TLS application | varies | medium |

WireGuard often 2-3× faster than OpenVPN for same security.

## VPN attacks {tier=practice}

### Tunnel split confusion

If user has VPN + direct internet, DNS or IP leak can expose true location.

Defense: **kill switch** — block all non-VPN traffic when VPN drops.

### VPN gateway compromise

Pulse Connect Secure CVE-2019-11510, Fortinet CVE-2018-13379 — RCE on VPN gateway. Bad.

Defense: patch gateways, MFA for VPN auth, log all VPN connections.

### DNS leak

Browser resolves DNS via local resolver, bypassing VPN's DNS.

Defense: force DNS via VPN (DNS-over-HTTPS to VPN-controlled DNS).

### WebRTC leak

Browser WebRTC reveals real IP (STUN protocol).

Defense: disable WebRTC, browser extensions to block.

## Zero Trust Network Access (ZTNA)

Alternative to VPN. Per-application access, identity-based.

- No "inside the network" concept.
- Each app published via reverse proxy.
- Browser-based auth (SAML, OIDC).
- ABAC policies ([[rbac-abac]]).

Tools: Cloudflare Access, Zscaler Private Access, Google IAP.

Advantages over VPN:

- Granular per-app.
- No client install.
- Less network exposure.

ZTNA growing rapidly in enterprises.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=R-JUOpCgTZc" "VPN (Virtual Private Network) Explained" "PowerCert Animated Videos"
:::

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: RFC 4301 — Security Architecture for IP; RFC 7296 — IKEv2; Donenfeld, J.A.: „WireGuard: Next Generation Kernel Network Tunnel" (NDSS 2017, [PDF](https://www.wireguard.com/papers/wireguard.pdf)); [WireGuard official site](https://www.wireguard.com/); NIST SP 800-77 Rev 1 — Guide to IPsec VPNs; [Tailscale docs](https://tailscale.com/kb/); NIST SP 800-207 — Zero Trust Architecture.*
