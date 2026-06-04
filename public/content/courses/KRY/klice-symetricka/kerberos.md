---
title: Kerberos
---

# Kerberos

**Kerberos** je distribuovaný autentizační protokol postavený na symetrické kryptografii s důvěryhodným [[kdc-needham|KDC]]. Vyvinut na MIT (projekt Athena, 1983–1988), pojmenovaný po tříhlavém psovi z řecké mytologie. Verze 5 (RFC 4120, 2005) je *de facto* standardem v Active Directory (Windows), univerzitních systémech, OpenBSD/Linux.

## Architektura

Tři hlavní komponenty (proto "Kerberos" — tři hlavy):

::: svg "Kerberos architektura: Client, KDC (AS+TGS), Application Server"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aKrb" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20"  y="100" width="120" height="60" rx="8"/>
    <rect x="200" y="20"  width="140" height="60" rx="8"/>
    <rect x="200" y="180" width="140" height="60" rx="8"/>
    <rect x="400" y="100" width="120" height="60" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="80"  y="135">Client (C)</text>
    <text x="270" y="50">Auth. Service (AS)</text>
    <text x="270" y="210">Ticket-Granting</text>
    <text x="270" y="226">Service (TGS)</text>
    <text x="460" y="135">App Server (V)</text>
  </g>
  <g fill="var(--text-muted)" font-size="10.5" text-anchor="middle">
    <text x="270" y="68">vydává TGT</text>
    <text x="270" y="76">(once per login)</text>
    <text x="270" y="195">vydává service ticket</text>
    <text x="270" y="234">(per service)</text>
    <text x="80"  y="170">login keytab</text>
    <text x="460" y="170">app keytab</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.1" fill="none" marker-end="url(#aKrb)">
    <path d="M140,110 L200,60"/>
    <path d="M210,80 L150,108"/>
    <path d="M140,150 L200,200"/>
    <path d="M210,220 L150,160"/>
    <path d="M140,135 L400,135"/>
  </g>
  <g fill="var(--text-muted)" font-size="10" text-anchor="middle">
    <text x="165" y="80">AS-REQ</text>
    <text x="180" y="105">AS-REP+TGT</text>
    <text x="165" y="195">TGS-REQ</text>
    <text x="180" y="215">TGS-REP</text>
    <text x="270" y="145">AP-REQ + ticket</text>
  </g>
</svg>
:::

* **Client (C)** — uživatel/aplikace, která se chce autentizovat.
* **Authentication Service (AS)** — část KDC, která vydává *Ticket-Granting Tickets (TGT)*.
* **Ticket-Granting Service (TGS)** — část KDC, která vydává *service tickets*.
* **Application Server (V)** — služba, kterou klient chce použít.

Klient se *jednou* (při loginu) autentizuje vůči AS — získá TGT platný typicky 8–10 hodin. Pak může opakovaně volat TGS s TGT a získávat *service tickety* pro konkrétní služby. Tento dvoustupňový design omezuje, jak často je klient nucený zadávat heslo.

## Protokol Kerberos v5

### Fáze 1: AS-REQ / AS-REP (autentizace)

```
1. C → AS: C, TGS, lifetime, N_1
2. AS → C: E_{K_C}(K_{C,TGS}, TGS, lifetime, N_1, TGT)
   kde TGT = E_{K_TGS}(K_{C,TGS}, C, addr, lifetime, timestamp)
```

* **$K_C$** je klíč odvozený z hesla klienta (typicky pomocí PBKDF2-like funkce).
* **$K_{TGS}$** je sdílený klíč mezi AS a TGS.
* **$N_1$** je nonce.
* **TGT** je *šifrovaný TGS klíčem* — klient ho nedokáže rozšifrovat, ale ví, že obsahuje $K_{C,TGS}$ a jeho identitu.

Klient zadá heslo, odvodí $K_C$, rozšifruje odpověď, získá session klíč $K_{C,TGS}$ a TGT.

> Heslo se nikdy nepřenáší. Klient odvodí klíč lokálně, KDC odvodí stejný klíč ze své databáze. Pokud odpovídají, dešifrování proběhne.

### Fáze 2: TGS-REQ / TGS-REP (vydání service ticketu)

```
3. C → TGS: V, lifetime, N_2, TGT, Auth_C
   kde Auth_C = E_{K_{C,TGS}}(C, addr, timestamp)
4. TGS → C: E_{K_{C,TGS}}(K_{C,V}, V, lifetime, N_2, Ticket)
   kde Ticket = E_{K_V}(K_{C,V}, C, addr, lifetime, timestamp)
```

* Klient pošle TGT spolu s **autentikátorem** $\mathrm{Auth}_C$ — čerstvý, šifrovaný session klíčem.
* TGS rozšifruje TGT (svým klíčem $K_{TGS}$), získá $K_{C,TGS}$.
* Použije $K_{C,TGS}$ k rozšifrování autentikátoru, ověří identitu a freshness (timestamp v toleranci ~5 min).
* Vygeneruje session klíč $K_{C,V}$ pro klient–server, posílá ho oběma (klient přes encrypted reply, server jako Ticket).

### Fáze 3: AP-REQ / AP-REP (autentizace u serveru)

```
5. C → V: Ticket, Auth_C
6. V → C: E_{K_{C,V}}(timestamp + 1)        [optional, mutual auth]
```

* Klient pošle service ticket a autentikátor.
* Server rozšifruje ticket svým klíčem $K_V$, získá $K_{C,V}$.
* Ověří autentikátor: $E^{-1}_{K_{C,V}}(\mathrm{Auth}_C)$ — pokud timestamp je čerstvý a identita souhlasí, autentizace OK.
* Pro mutual auth: server odpoví zašifrovaným timestampem.

::: viz kerberos "Šest kroků: AS-REQ/REP (login), TGS-REQ/REP (service ticket), AP-REQ/REP (autentizace u serveru). Klikněte „▶" pro postup; vidíte obsah ticketu a session klíče."
:::

## Klíčové prvky designu

### Autentikátor proti replay

Pouze TGT/ticket by stačil pro autentizaci, ale stará zachycená dvojice by mohla být přehrána. **Autentikátor** je *čerstvá* zpráva šifrovaná session klíčem — útočník bez znalosti $K_{C,TGS}$ nedokáže vyrobit nový autentikátor.

Server udržuje replay cache (~5 minut) — pokud stejný autentikátor (timestamp) přijde dvakrát, druhý je odmítnut.

### Single Sign-On (SSO)

Klient zadá heslo *jednou* (AS-REQ) a získá TGT. Po dobu TGT lifetime (typicky 8–10 hodin) se může autentizovat *jakékoli* službě **bez zadání hesla** — TGS automaticky vystaví service tickety. To je *kanonický single sign-on*.

### Time synchronization

Klíčové: hodiny KDC, klienta a serveru musí být synchronizované do ~5 minut (toleranční okno). Bez NTP / synchronizace Kerberos selhává.

### Realms

**Realm** je administrativní doména s vlastním KDC. Typicky odpovídá organizaci. Cross-realm autentizace přes *inter-realm shared keys* mezi KDC dvou realmů.

## Šifrování v Kerberos

Kerberos podporuje různé enctypes (encryption types). Historicky DES, dnes:

* **AES128-CTS-HMAC-SHA1-96** — výchozí (RFC 3962).
* **AES256-CTS-HMAC-SHA1-96** — silnější.
* **AES128-CTS-HMAC-SHA256-128**, **AES256-CTS-HMAC-SHA384-192** (RFC 8009, 2016) — moderní.
* **RC4-HMAC** — *legacy*, **zranitelný** (Kerberoasting útok).

> **Kerberoasting** (Tim Medin 2014): útočník s libovolným domain účtem požádá TGS o service ticket pro účet s SPN (Service Principal Name). Ticket je šifrován $K_V$ — *klíč odvozený z hesla service účtu*. RC4-HMAC ticket je *offline brute-forceable* — útočník zkouší hesla, dokud ticket nedeskryptuje. Slabá service account hesla padají za hodiny.

> Obrana: dlouhá komplexní hesla service účtů (32+ znaků), použití AES enctypes, monitoring SPN dotazů.

## Slabosti a útoky

### 1. KDC kompromitace

KDC zná **všechny klíče** všech uživatelů. Pokud útočník získá KDC databázi (Active Directory `ntds.dit`), může:

* Padělat **Golden Ticket** — TGT pro libovolný účet, *neomezeně*.
* Padělat **Silver Ticket** — service ticket pro libovolnou službu, *bez kontroly KDC*.

Mimikatz a podobné nástroje toto umí. Obrana: HSM pro KDC klíče, segmentace, monitoring.

### 2. Slabá hesla (pre-authentication)

V Kerberos 5 je `PA-ENC-TIMESTAMP` pre-auth: klient *před* AS-REQ pošle časové razítko šifrované $K_C$. Pokud nemá pre-auth (`DOES_NOT_REQUIRE_PREAUTH`), útočník dotazem AS získá zašifrovaný TGT, který může **offline brute force** dešifrovat (**AS-REP roasting**).

Obrana: vždy `pre-auth required`.

### 3. Time skew

5-minutové okno toleruje desync hodin, ale *aktivní* útočník s manipulací NTP může:

* Posunout hodiny klienta zpět → ukrást starý ticket a "obnovit" platnost.
* Posunout hodiny serveru → ticket vyprší příliš pozdě.

Obrana: autentizovaný NTP (zatím ne standardní), monitoring desync.

### 4. Pass-the-hash, Pass-the-ticket

Mimikatz extrahuje:

* **Pass-the-hash** — NTLM hash z LSA paměti. Pak útočník přihlásí jako uživatel *bez znalosti hesla*.
* **Pass-the-ticket** — celý TGT z paměti. Útočník použije TGT z jiného stroje, vystupuje jako oběť.

Obrany: LSA Protected Process Light (Windows), Credential Guard, smart cards (Kerberos s PKINIT).

## PKINIT — Kerberos s asymetrickou autentizací

RFC 4556 (2006): rozšíření Kerberos, kde AS-REQ obsahuje X.509 certifikát klienta + podpis. KDC ověří certifikát a vydá TGT *bez nutnosti hesla*. Použití: smart cards, hardware tokeny (YubiKey).

Hybridní bezpečnost: asymetrická pre-auth, symetrické session klíče — pomalý handshake, rychlý zbytek.

## Praktický stack {tier=practice}

* **MIT Kerberos** — open-source referenční implementace.
* **Heimdal** — BSD-licenced alternativa.
* **Active Directory** — Microsoft implementace s rozšířeními (PAC, krbtgt).
* **FreeIPA** — Linux řešení pro identitu, kombinuje Kerberos + LDAP + DNS + CA.

### Konfigurace v Linuxu

```
$ kinit user@EXAMPLE.COM    # AS-REQ, zadání hesla, získá TGT
$ klist                      # zobrazí TGT a všechny service tickety
$ kdestroy                   # vymaže cache, end of session
```

`/etc/krb5.conf` definuje realmy, KDC servery, default enctypes.

## Kerberos v praxi v 2024 {tier=practice}

* **Windows Active Directory** — dominuje firemní prostředí. Miliardy uživatelů.
* **University Athena-likes** — MIT, Stanford, akademické intranety.
* **Hadoop clusters** — Kerberos pro HDFS, YARN, Hive.
* **NFSv4** s `RPCSEC_GSS_KRB5`.
* **PostgreSQL, MySQL** — Kerberos auth jako jedna z metod.

> **Kerberos vs. OAuth2:** Kerberos je *podnikový* on-premises protokol; OAuth2 / OIDC je *internetový* protokol pro federovanou identitu. Tam, kde Kerberos žije (AD enterprise), tam OAuth2 *nehrozí*. Tam, kde OAuth2 vládne (web apps, SaaS, mobile), tam Kerberos *není*. Vzájemně se doplňují, nikoli soutěží.

---

*Zdroj: KRY přednášky 2025/26, KRY 6 — Symetrická správa klíčů. Externí reference: Steiner, J., Neuman, B., Schiller, J.: "Kerberos: An Authentication Service for Open Network Systems", USENIX Winter 1988; RFC 4120: The Kerberos Network Authentication Service (V5) (2005); RFC 4556: PKINIT — Public Key Cryptography for Initial Authentication in Kerberos (2006); Medin, T.: "Attacking Kerberos: Kicking the Guard Dog of Hades", DerbyCon 2014.*
