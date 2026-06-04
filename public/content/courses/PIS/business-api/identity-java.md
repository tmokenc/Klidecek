---
title: OAuth2/OIDC v Javě — implementace, Refresh Tokeny, best practices
---

Jakarta EE a MicroProfile poskytují několik komplementárních standardů pro implementaci identity managementu v Javě. Tento subtopic shrnuje **co kdy použít** a uvádí konfigurace pro Open Liberty.

## Tři kategorie nástrojů

| Standard | Účel | Použití |
|---|---|---|
| **MicroProfile JWT** | Ověření JWT access tokenů na Resource Serveru | API endpointy chráněné JWT |
| **Jakarta Security 3.0** | Plný OAuth 2.0 / OIDC Code Flow | Webové aplikace s přihlášením |
| **Open Liberty features** | Specifické feature sady | Aktivace v `server.xml` |

## MicroProfile JWT — ověření JWT na Resource Serveru

[[rest-autentizace|Detailně rozebrané]] v subtopicu o REST autentizaci. Klíčové aspekty pro identity:

* **Ověření JWT access tokenů** na straně Resource Serveru.
* **Neřeší samotný tok OAuth2** (přihlášení, výměna tokenů) — to je v doméně OIDC klienta nebo Auth Serveru.
* Konfigurace ověření v `microprofile-config.properties`:

```properties
mp.jwt.verify.publickey.location=http://keycloak:8080/realms/myrealm/protocol/openid-connect/certs
mp.jwt.verify.issuer=http://keycloak:8080/realms/myrealm
mp.jwt.verify.audiences=my-client-id
```

* Role z JWT claim `groups` nebo `realm_access.roles` (záleží na mapování). Keycloak vydává role v různých claim podle nastavení.

## Jakarta Security 3.0 — plný OIDC tok

Jakarta EE 10 přidal anotaci **`@OpenIdAuthenticationMechanismDefinition`** pro konfiguraci OIDC klienta:

```java
@OpenIdAuthenticationMechanismDefinition(
    providerURI  = "http://keycloak:8080/realms/myrealm",
    clientId     = "my-app",
    clientSecret = "${oidcConfig.clientSecret}",
    redirectURI  = "${baseURL}/callback",
    jwksConnectTimeout = 5000
)
@ApplicationScoped
public class AppConfig { }
```

Co to dělá:

* **Zvládá celý Authorization Code Flow automaticky** — přesměruje uživatele na Keycloak, zpracuje callback, vymění kód za tokeny, ověří podpis.
* **Vystaví token jako security context** — můžete použít `@RolesAllowed`, `SecurityContext.getCallerPrincipal()`, atd.
* **Dostupné na Payara 6+, WildFly 27+, Open Liberty 22+**.

### Přístup k identitě v Javě

S Jakarta Security 3.0 můžete v endpoint kódu číst identitu uživatele:

```java
@Inject
private OpenIdContext openIdContext;

@GET
@Path("/profile")
@RolesAllowed("user")
public String getProfile() {
    String subject = openIdContext.getSubject();
    Optional<String> email = openIdContext.getClaims()
                                          .getStringClaim("email");
    return "Přihlášen: " + email.orElse(subject);
}
```

`OpenIdContext` poskytuje přístup ke všem claims z ID Tokenu.

## Open Liberty — features pro správu identit

Open Liberty podporuje všechny hlavní standardy přes konfigurovatelné **features** v `server.xml`:

| Feature | Účel |
|---|---|
| `openidConnectClient-1.0` | OIDC klient (Relying Party) |
| `openidConnectServer-1.0` | OIDC provider (IdP) |
| `socialLogin-1.0` | OAuth2/OIDC sociální přihlášení |
| `samlWeb-2.0` | SAML 2.0 Web SSO |
| `mpJwt-2.1` | MicroProfile JWT (ověření tokenů) |
| `appSecurity-5.0` | Jakarta Security 3.0 (OIDC anotace) |

Dokumentace: [openliberty.io/docs/latest/single-sign-on.html](https://openliberty.io/docs/latest/single-sign-on.html).

### Open Liberty — OIDC klient

Feature `openidConnectClient-1.0` udělá z Liberty OIDC Relying Party. Konfigurace v `server.xml`:

```xml
<featureManager>
    <feature>openidConnectClient-1.0</feature>
</featureManager>

<openidConnectClient
    id="myOIDC"
    clientId="my-app"
    clientSecret="secret"
    discoveryEndpointUrl=
        "http://keycloak:8080/realms/myrealm/.well-known/openid-configuration"
    redirectToRPHostAndPort="https://my-app.example.com"
    scope="openid profile email"
    userNameAttribute="preferred_username"
    groupIdentifier="groups" />
```

Liberty si stáhne discovery dokument, sám zvládne celý Authorization Code Flow, mapuje claims na security principal.

### Open Liberty — SAML

Feature `samlWeb-2.0` udělá z Liberty SAML Service Provider:

```xml
<featureManager>
    <feature>samlWeb-2.0</feature>
</featureManager>

<samlWebSso20 id="defaultSP"
    signatureMethodAlgorithm="SHA256"
    allowCustomCacheKey="false">
    <pkixTrustEngine trustAnchor="samlTrustStore" />
</samlWebSso20>

<keyStore id="samlTrustStore"
          location="saml-truststore.jks"
          type="JKS"
          password="changeit" />
```

Metadata SP dostupná na `/ibm/saml20/{id}/samlmetadata` — pošlete je IdP pro založení federace.

### Open Liberty — Social Login

Feature `socialLogin-1.0` umožňuje přihlášení přes externí OAuth2/OIDC providery:

```xml
<featureManager>
    <feature>socialLogin-1.0</feature>
</featureManager>

<oidcLogin id="keycloak"
    clientId="my-app"
    clientSecret="secret"
    discoveryEndpoint=
        "http://keycloak:8080/realms/myrealm/.well-known/openid-configuration"
    userNameAttribute="preferred_username" />

<!-- nebo pro čistý OAuth2: -->
<oauth2Login id="myProvider"
    clientId="..." clientSecret="..." />
```

Vestavěná podpora: GitHub, Google, Facebook, LinkedIn, Twitter. Vlastní OAuth2/OIDC provider přes konfiguraci.

### Open Liberty — Jakarta Security 3.0

Feature `appSecurity-5.0` umožňuje použití anotací Jakarta Security:

```xml
<featureManager>
    <feature>appSecurity-5.0</feature>
</featureManager>
```

Konfigurace pak je *výhradně anotacemi v kódu* (`@OpenIdAuthenticationMechanismDefinition`) — **bez změn v `server.xml`**. Praktický průvodce: [openliberty.io/blog — Keycloak with Open Liberty](https://openliberty.io/blog/2024/07/31/keycloak-with-openliberty.html).

### Open Liberty — MicroProfile JWT

Feature `mpJwt-2.1`:

```xml
<feature>mpJwt-2.1</feature>
```

Konfigurace v `server.xml` *nebo* v `microprofile-config.properties`. Přístup k tokenu v kódu:

```java
@Inject
JsonWebToken jwt;

String user = jwt.getSubject();
Set<String> roles = jwt.getGroups();
```

Guide: [openliberty.io/guides/microprofile-jwt.html](https://openliberty.io/guides/microprofile-jwt.html).

## Refresh Token — princip

**Refresh Token** je *dlouhodobý token*, který umožňuje získat nový Access Token *bez opětovného přihlášení uživatele*.

* **Access Token** je *záměrně krátkodobý* (minuty) — omezuje škody při úniku. Pokud útočník token zachytí, má jen pár minut na zneužití.
* **Refresh Token** je *dlouhodobý* (hodiny–dny–týdny) a slouží k *obnovení* Access Tokenu. **Klient ho uchovává bezpečně**, **nikdy se neposílá na Resource Server**.

### Refresh Token Flow

```
Klient                Auth Server          Resource Server
  |                       |                       |
  |-- access_token ---------------- -- ---- ---- ->|
  |<-- 401 Unauthorized -------------------- - -- |  (token expiroval)
  |                       |                       |
  |-- refresh_token ----->|                       |
  |<-- nový access_token + (nový refresh_token)   |
  |                       |                       |
  |-- nový access_token -------------------- ----->|
  |<-- data ------------------------ ------ ----- |
```

1. Klient zjistí, že Access Token expiroval (`401 Unauthorized`).
2. Pošle Refresh Token na Auth Server.
3. Dostane nový Access Token (a obvykle nový Refresh Token — *Refresh Token Rotation*).
4. Pokračuje s novým Access Tokenem.

### Bezpečnost Refresh Tokenu

* **Refresh Token Rotation** — každým použitím se refresh token *vymění za nový*. Starý je okamžitě invalidován.
  * **Reuse detection**: pokud někdo použije *starý* refresh token (např. útočník, který ho zachytil), celá *rodina tokenů* se revokuje. To je hlavní obrana proti úniku — i kdyby útočník token získal, jakmile ho legitimní klient použije, útočníkův token přestane fungovat (a naopak).
* **Revokace** — refresh token lze explicitně zneplatnit ([RFC 7009](https://www.rfc-editor.org/rfc/rfc7009) — Token Revocation Endpoint). Použití: odhlášení, změna hesla.
* **Refresh Token neobsahuje data uživatele** — je to *neprůhledný (opaque)* identifikátor nebo JWT s minimálními claims. Cílem je, aby útočník z něj nic nezískal, pokud ho zachytí.

## Best practices — souhrn

Konsolidované doporučení pro identity v praxi:

* **Nikdy neukládejte tokeny do `localStorage`** v prohlížeči (XSS-zranitelné). Použijte **HttpOnly cookies** nebo server-side session.
* **Vždy ověřujte podpis tokenu** a claims `iss`, `aud`, `exp` — knihovny to dělají, ale ověřte konfiguraci.
* **Krátká expirace Access Tokenu** (minuty), delší Refresh Token (hodiny/dny).
* **PKCE pro všechny veřejné klienty** (mobile, SPA) — dnes doporučováno i pro confidential klienty (OAuth 2.1 to vyžaduje).
* **Minimalizujte scopes** — princip nejmenšího oprávnění. Žádejte jen nezbytné.
* **Rotujte Refresh Tokeny** (*refresh token rotation*) — i v paranoidních scénářích zachycení tokenu funguje detection.
* **HTTPS všude** — tokeny jsou citlivé přihlašovací údaje. Bez HTTPS jsou veřejné.
* **Verify discovery konfigurace** pomocí `well-known` endpointu — eliminujte hard-coded URL.

## Demo + průvodce {tier=extra}

* [openliberty.io/blog — Keycloak with Open Liberty](https://openliberty.io/blog/2024/07/31/keycloak-with-openliberty.html) — kompletní příklad OIDC s Jakarta Security 3.0.
* [openliberty.io/guides/microprofile-jwt.html](https://openliberty.io/guides/microprofile-jwt.html) — MicroProfile JWT s ověřením tokenů.
* [DIFS-Teaching/rest-auth](https://github.com/DIFS-Teaching/rest-auth) — demo aplikace s MP JWT.

::: link "Jakarta Security 3.0 — specifikace" "https://jakarta.ee/specifications/security/"
:::

::: link "MicroProfile JWT — specifikace" "https://microprofile.io/specifications/microprofile-jwt-auth/"
:::

::: link "Open Liberty — Single Sign-on documentation" "https://openliberty.io/docs/latest/single-sign-on.html"
:::

::: link "OWASP — JWT Cheat Sheet" "https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html"
:::

::: link "RFC 7009 — OAuth 2.0 Token Revocation" "https://www.rfc-editor.org/rfc/rfc7009"
:::

::: link "OAuth 2.1 — návrh konsolidovaného OAuth standardu" "https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/"
:::

::: quiz "Aplikace dostane od Auth Serveru Access Token (10 minut platnost) a Refresh Token (7 dní). Jak má klient hospodařit s tokeny?"
- [x] Access Token používat pro každé API volání. Refresh Token uložit bezpečně (HttpOnly cookie, secure storage) a poslat jen Auth Serveru, když Access Token expiruje.
  > Ano. Access Token žije v paměti / krátkodobě, Refresh Token *nikdy* nesmí jít na Resource Server. To je celá pointa oddělení.
- [ ] Oba tokeny posílat s každým API voláním pro jistotu.
  > Refresh Token na Resource Serveru nemá co dělat. Pokud ho posíláte zbytečně, zvyšujete riziko, že ho někdo zachytí.
- [ ] Refresh Token rozšifrovat na klientovi a používat jeho obsah.
  > Refresh Token je *opaque* identifikátor — typicky náhodný řetězec. Není určen ke čtení klientem.
:::

::: quiz "V Open Liberty chcete novou Java REST aplikaci přihlásit přes Keycloak. Co vyberete?"
- [x] Feature `appSecurity-5.0` + anotaci `@OpenIdAuthenticationMechanismDefinition` na konfigurační třídě. Konfigurace je *jen v Javě*, žádné změny `server.xml`.
  > Ano. Jakarta Security 3.0 je *moderní* a nejjednodušší volba pro novou aplikaci.
- [ ] Feature `openidConnectClient-1.0` s konfigurací v `server.xml`.
  > Funguje, ale je to *předchozí generace*. Pro novou aplikaci preferujte Jakarta Security 3.0 (anotace v kódu).
- [ ] Feature `mpJwt-2.1` — sám zvládne celý Authorization Code Flow.
  > Ne. `mpJwt-2.1` jen *ověřuje* JWT tokeny na Resource Serveru. Pro celý flow (přihlášení, výměna kódu, výměna tokenů) potřebujete buď `openidConnectClient` nebo `appSecurity` + Jakarta Security.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, VUT FIT, část „OAuth2/OIDC v Javě, Refresh Token, doporučené postupy" v přednášce „Business vrstva a API" (slidy 61–73).*
