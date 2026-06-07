---
title: VPN, IPsec, WireGuard a TLS tunely
---

# VPN — IPsec, OpenVPN, WireGuard a TLS tunely

**VPN** (Virtual Private Network) vytváří šifrovaný tunel (encrypted tunnel) mezi sítěmi nebo mezi jednotlivými hosty. Používá se pro práci na dálku (remote work), propojení poboček (site-to-site) a soukromí (privacy). Tato sekce porovnává hlavní VPN technologie.

## IPsec — IP Security

Jde o standard organizace IETF pro šifrování (encryption) na síťové vrstvě (layer 3). Je poměrně komplexní — zahrnuje více protokolů a více provozních režimů.

### Komponenty

- **AH** (Authentication Header) — zajišťuje integritu a autentizaci (authentication). *Nezajišťuje* důvěrnost (confidentiality).
- **ESP** (Encapsulating Security Payload) — zajišťuje důvěrnost (confidentiality) i integritu.
- **IKE** (Internet Key Exchange) — domlouvá klíče (keys) a parametry spojení.
- **IKEv2** (RFC 7296) — aktuální standard.

### Módy

- **Transport mode** (transportní režim) — šifruje pouze obsah (payload). Hlavička i IP hlavička zůstávají viditelné.
- **Tunnel mode** (tunelovací režim) — šifruje *celý* IP paket a zabalí jej do nové IP hlavičky. Toto je standard pro VPN.

```
Original:    [IP header][TCP][data]
Transport:   [IP header][ESP header][TCP][data + ESP trailer]
Tunnel:      [new IP header][ESP][orig IP header][TCP][data + ESP trailer]
```

### IKE handshake

IKEv2 používá pojmenované *výměny* (exchanges), nikoli fáze jako IKEv1:

**IKE_SA_INIT**: domluví parametry IKE a ustaví IKE SA.

**IKE_AUTH**: provede autentizaci a ustaví první Child SA pro ESP.

**CREATE_CHILD_SA**: samostatná výměna pro další nebo obnovené (rekeyed) Child SA.

Možnosti autentizace:

- **PSK** (Pre-Shared Key) — předsdílený klíč.
- **Certificate** ([[x509]]) — certifikát, RSA / ECDSA.
- **EAP** — rozšiřitelná autentizace, vhodná pro uživatele.

### Sady algoritmů

Kombinace IKEv2 + ESP:

- **AES-256-GCM** + ECDH P-384 — moderní volba.
- **AES-256-CBC** + HMAC-SHA256 + DH 2048 — zastaralá (legacy) volba.
- **ChaCha20-Poly1305** + Curve25519 — vysoký výkon (performance) v softwarové implementaci.

### Nastavení IPsec

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

Konfigurace je složitá. Častý problém: nesouhlasící parametry mezi protějšky (peers).

### Výhody

- Standard se širokou podporou.
- Pracuje na síťové vrstvě (je transparentní vůči aplikacím).
- Silná kryptografie.

### Nevýhody

- Složitá konfigurace.
- Problémy s NAT (zejména u staršího IKEv1).
- Výkonová zátěž (šifrování plus tunelovací hlavičky).

### IPsec v praxi

- **Site-to-site** — propojení poboček s centrálou.
- **Remote access** (vzdálený přístup) — nativní podpora ve Windows, Cisco AnyConnect, Fortinet, Pulse Secure.
- **Připojení do cloudu** — AWS VPN, Azure VPN Gateway, Google Cloud VPN.

## OpenVPN

Open-source VPN postavená na TLS. Je méně složitá než IPsec.

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

### Výhody

- Jednoduchá konfigurace.
- Multiplatformní (Windows, Linux, macOS, mobilní zařízení).
- Přátelská k NAT (běží přes UDP nebo TCP).
- Bezpečné výchozí nastavení.

### Nevýhody

- Vyšší zátěž oproti IPsec/WireGuard.
- Běží v uživatelském prostoru (userspace), tedy s menším výkonem než řešení na úrovni jádra.

Používá ji řada komerčních poskytovatelů VPN (NordVPN, ExpressVPN).

## WireGuard

Moderní VPN. Navrhl ji Jason Donenfeld (2017). V linuxovém jádře je standardně od verze 5.6.

### Filozofie návrhu

- **Minimalismus** — přibližně 4000 řádků kódu v jádře (oproti 100 tisícům a více u OpenVPN/IPsec).
- **Pouze moderní kryptografie** — Curve25519, ChaCha20, Poly1305, BLAKE2s, SipHash.
- **Žádná volitelnost algoritmů** — jediná sada šifer; *kdyby* byla prolomena, aktualizuje se vše naráz.
- **Rychlost** — implementace v jádře a jednoduchý stavový automat.
- **Bezstavový server** — neudržuje žádný stav pro spojení, dokud nedorazí paket.

### Konfigurace

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

Mimořádně jednoduché. Statické a deklarativní.

### Roaming

WireGuard zvládá přesouvající se klienty bez problémů. Pokud se klientovi změní IP adresa (například mobil přejde z WiFi na mobilní data), server uvidí novou IP a pakety stále úspěšně dešifruje pomocí veřejného klíče.

### Výhody

- Jednoduchý, rychlý, moderní.
- Implementace v jádře (Linux).
- Multiplatformní.

### Nevýhody

- Žádná dynamická konfigurace protějšků (každý peer musí být předkonfigurován).
- Žádná autentizace pomocí certifikátů (pouze veřejné klíče).
- Novější řešení s menším rozšířením v podnikovém prostředí.

Používají ji: Mullvad, ProtonVPN, Tailscale (postavený na WireGuard).

## Tailscale + zero-trust mesh

**Tailscale** — komerční mesh VPN postavená na WireGuard.

- Automatická konfigurace přes poskytovatele identity (Google, Microsoft, Okta).
- Průchod přes NAT (NAT traversal) pomocí DERP relé.
- Spojení peer-to-peer (přímo mezi uzly).
- ACL pravidla podle uživatele či role.

Trend: pro cloudově orientované organizace mesh nahrazuje topologii hub-spoke (hvězda).

Alternativy: **Headscale** (open-source pro vlastní provoz), **Netbird**, **Nebula** (Slack).

## VPN založené na TLS

### SSTP

Microsoft, využívá HTTPS port 443, takže snadno prochází firewally.

### TLS tunel

OpenVPN přes TCP port 443 vypadá jako běžné HTTPS. Tento režim utajení (stealth) obchází cenzuru.

### Obfuskace WireGuardu

Nástroje `udp2raw` a `wstunnel` zabalí WireGuard do TCP/HTTP/WebSocket, čímž obejdou firewally blokující UDP.

## SSH tunelování

```bash
# Local port forward — local 8080 → remote 80
ssh -L 8080:internal.host:80 user@gateway

# Remote port forward — remote 8080 → local 80
ssh -R 8080:localhost:80 user@gateway

# SOCKS proxy
ssh -D 1080 user@gateway
```

Odlehčené tunelování pro jednorázové potřeby. Přenosová vrstva SSH je zabezpečená (šifruje handshake i data).

## TLS pro aplikace

Není to v pravém slova smyslu VPN, ale TLS poskytuje podobné možnosti:

- **HTTPS** — šifrování webového provozu.
- **mTLS** — vzájemné (mutual) TLS, kdy se autentizují oba koncové body.

Podrobnosti viz [[tls-aplikace]].

## Srovnání výkonu

Pro hrubou propustnost na moderním hardwaru:

| Řešení | Rychlost | Vytížení CPU |
| :--- | :---: | :---: |
| WireGuard | ~1,5–3 Gbps | nízké |
| IPsec (v jádře) | ~1–2 Gbps | střední |
| OpenVPN | ~300–800 Mbps | vysoké |
| TLS aplikace | proměnlivá | střední |

WireGuard bývá při stejné úrovni zabezpečení 2–3× rychlejší než OpenVPN.

## Útoky na VPN {tier=practice}

### Záměna split tunelu

Pokud má uživatel současně VPN i přímé připojení k internetu, může únik DNS nebo IP adresy prozradit jeho skutečnou polohu.

Obrana: **kill switch** (pojistka) — při výpadku VPN zablokuje veškerý provoz mimo VPN.

### Kompromitace VPN brány

Pulse Connect Secure CVE-2019-11510, Fortinet CVE-2018-13379 — vzdálené spuštění kódu (RCE) na VPN bráně. Závažný problém.

Obrana: aktualizujte brány, používejte vícefaktorovou autentizaci (MFA) pro přihlášení do VPN a logujte všechna VPN spojení.

### Únik DNS

Prohlížeč překládá DNS přes lokální resolver, čímž obchází DNS server VPN.

Obrana: vynuťte překlad DNS přes VPN (DNS-over-HTTPS na DNS server řízený VPN).

### Únik přes WebRTC

WebRTC v prohlížeči prozradí skutečnou IP adresu (protokolem STUN).

Obrana: vypněte WebRTC, použijte rozšíření prohlížeče, které jej blokuje.

## Zero Trust Network Access (ZTNA)

Alternativa k VPN. Přístup se uděluje per aplikace a na základě identity.

- Neexistuje koncept „uvnitř sítě".
- Každá aplikace je publikována přes reverzní proxy.
- Autentizace probíhá v prohlížeči (SAML, OIDC).
- Politiky typu ABAC ([[rbac-abac]]).

Nástroje: Cloudflare Access, Zscaler Private Access, Google IAP.

Výhody oproti VPN:

- Jemně odstupňovaný přístup per aplikace.
- Není potřeba instalovat klienta.
- Menší vystavení sítě útokům.

ZTNA se v podnicích rychle rozšiřuje.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=R-JUOpCgTZc" "VPN (Virtual Private Network) Explained" "PowerCert Animated Videos"
:::

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: RFC 4301 — Security Architecture for IP; RFC 7296 — IKEv2; Donenfeld, J.A.: „WireGuard: Next Generation Kernel Network Tunnel" (NDSS 2017, [PDF](https://www.wireguard.com/papers/wireguard.pdf)); [WireGuard official site](https://www.wireguard.com/); NIST SP 800-77 Rev 1 — Guide to IPsec VPNs; [Tailscale docs](https://tailscale.com/kb/); NIST SP 800-207 — Zero Trust Architecture.*
