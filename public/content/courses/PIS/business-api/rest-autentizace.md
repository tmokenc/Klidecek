---
title: Autentizace v REST — HTTP Basic, JWT, MicroProfile JWT
---

REST protokol je definován jako **bezstavový** (*stateless*) — každý požadavek musí obsahovat *vše* potřebné, žádné ukládání stavu na serveru. To má praktický dopad na autentizaci: **tradiční HTTP session nelze bezpečně použít**.

* **Technicky** sessions fungují (cookie nese session ID, server drží mapu session → uživatel),
* **Architektonicky** to porušuje REST a problematicky se škáluje (sticky session, sdílení mezi instancemi),
* **Pro mobilní klienty** je to zvlášť nepraktické (nestandardní handling cookies).

Existují tedy *jiné* mechanismy autentizace pro REST:

1. **HTTP Basic** — pouze přes HTTPS, pro interní/malé API,
2. **Token validovatelný na serveru** — typicky **JWT** (*JSON Web Token*),
3. **Složitější mechanismus** jako [[identita-oauth2|OAuth 2.0]] nebo [[oidc-saml|OpenID Connect]] — pro veřejná API a federated identitu.

## HTTP Basic — standardní HTTP mechanismus

Standardní HTTP autentizace pomocí speciálních hlaviček. Princip:

* Klient pošle v každém požadavku hlavičku **`Authorization`**:

  ```
  Authorization: Basic dXNlcjpwYXNzd29yZA==
  ```

  Obsah je `base64(username:password)` — **pouze kódované, ne šifrované**. Proto **HTTPS je nezbytné** — bez HTTPS by se heslo posílalo prakticky otevřeně.

* Pokud autentizace chybí nebo je špatná, server vrátí **`401 Unauthorized`** a v hlavičce **`WWW-Authenticate`** identifikaci oblasti přihlášení (realm). Klient pak zjistí, že je nutná autentizace pro tuto oblast.

* Klient typicky uloží credentials a posílá je s každým requestem.

**Použití**: vhodné pro interní API mezi server-server komunikací, malé prototypy, monitoring. Pro veřejné API se obvykle preferuje token-based mechanismus.

## JSON Web Token (JWT)

**JWT** ([RFC 7519](https://www.rfc-editor.org/rfc/rfc7519)) je dnešní standard pro reprezentaci autentizačních tokenů. Token je *řetězec ze tří částí* oddělených tečkami:

```
xxxxx.yyyyy.zzzzz
```

::: svg "Struktura JWT — 3 base64-kódované části spojené tečkami"
<svg viewBox="0 0 540 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="40" width="160" height="80" rx="6" fill="oklch(0.62 0.14 22 / 0.18)" stroke="oklch(0.62 0.14 22)"/>
  <text x="90" y="62" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.42 0.14 22)">Header</text>
  <text x="90" y="82" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">JSON</text>
  <text x="90" y="100" text-anchor="middle" font-size="11" fill="var(--text-muted)">algoritmus, typ</text>
  <text x="90" y="135" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.42 0.14 22)" font-family="var(--font-mono)">xxxxx</text>
  <rect x="190" y="40" width="160" height="80" rx="6" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
  <text x="270" y="62" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.14 264)">Payload</text>
  <text x="270" y="82" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">JSON</text>
  <text x="270" y="100" text-anchor="middle" font-size="11" fill="var(--text-muted)">claims (id, role, exp)</text>
  <text x="270" y="135" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.40 0.14 264)" font-family="var(--font-mono)">yyyyy</text>
  <rect x="370" y="40" width="160" height="80" rx="6" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
  <text x="450" y="62" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.14 142)">Signature</text>
  <text x="450" y="82" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">bytes</text>
  <text x="450" y="100" text-anchor="middle" font-size="11" fill="var(--text-muted)">HMAC nebo RSA</text>
  <text x="450" y="135" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.40 0.14 142)" font-family="var(--font-mono)">zzzzz</text>
  <text x="270" y="170" text-anchor="middle" font-size="11" fill="var(--text-faint)" font-style="italic">Vše base64-encoded, spojeno tečkami. Signature ověřuje, že nikdo s tokenem nemanipuloval.</text>
</svg>
:::

### Tři části JWT

1. **Header (hlavička)** — JSON s metadaty: použitý algoritmus podpisu (např. `RS256`, `HS256`), typ tokenu (`JWT`).
2. **Payload (obsah)** — JSON s **claims** (tvrzení): id uživatele, jeho práva, expirace, vydavatel. Standardní claims:
   * `iss` (*issuer*) — vydavatel,
   * `sub` (*subject*) — identita uživatele,
   * `aud` (*audience*) — komu je token určen,
   * `exp` (*expiration*) — čas expirace (Unix timestamp),
   * `iat` (*issued at*) — čas vydání.
3. **Signature (podpis)** — pro ověření integrity. Podpis se počítá jako `algoritmus(base64(header) + "." + base64(payload), klíč)`. Pokud někdo změní obsah, podpis nesouhlasí.

Všechny tři části se kódují **base64** a spojí tečkami. Není to *šifrování* — kdokoliv může obsah JWT *dekódovat* a přečíst. Bezpečnost dává jen *podpis* — záruka, že token nebyl podvržen.

### Životní cyklus tokenu

```
1. Klient kontaktuje autentizační server, dodá údaje (login + heslo nebo OAuth).
2. Auth server vygeneruje podepsaný JWT a vrátí klientovi.
3. Klient při každém volání API přidá hlavičku:

   Authorization: Bearer xxxxx.yyyyy.zzzzz

4. API ověří podpis tokenu, přečte claims (role uživatele) a rozhodne o autorizaci.
```

Důležité: **role uživatele mohou být přímo v JWT** (v claim `groups` nebo `roles`). API tak nemusí dotazovat DB nebo auth server — autorizace je *self-contained*.

### Podpis tokenu — asymetricky nebo symetricky

Pro podpis JWT existují dva přístupy:

* **Asymetrická kryptografie** (RSA, ECDSA) — *privátním* klíčem se podepisuje (jen auth server ho má), *veřejným* se ověřuje (může mít kdokoliv). Vhodné pro distribuované systémy, kde různé služby ověřují tokeny vydané společným auth serverem.
* **Symetrická kryptografie** (HMAC, např. `HS256`) — *tentýž sdílený klíč* slouží k podpisu i ověření. Jednodušší konfigurace, ale klíč musí být u všech, kdo tokeny ověřují. Vhodné pro monolit/malé systémy.

V Java světě běžně **RS256** — RSA-SHA256 podpis.

## JWT v Javě — MicroProfile JWT

Specifikace **MicroProfile JWT** standardizuje ověření JWT v Jakarta EE / MicroProfile aplikacích.

* Není přímo součástí Jakarta EE specifikace,
* Ale je dostupné na běžných serverech (**Payara**, **Open Liberty**, WildFly),
* Lze snadno spojit s JAX-RS — jedna anotace na endpoint stačí.

### Konfigurace — povolení JWT autentizace

Na úrovni aplikace v třídě `Application`:

```java
@ApplicationPath("resources")
@LoginConfig(authMethod = "MP-JWT")              // používáme MicroProfile JWT
@DeclareRoles({ "admin", "staff", "customer" })  // existující role
public class JAXRSConfiguration extends Application {
}
```

Na úrovni endpointu autorizace přes role:

```java
@GET
@Path("/protected")
@RolesAllowed("admin")                           // jen role "admin"
public String getProtected() {
    return "ok";
}
```

### Konfigurace ověření — `microprofile-config.properties`

Soubor v `META-INF/microprofile-config.properties` (uvnitř WAR):

```properties
mp.jwt.verify.publickey.location=/publicKey.pem
mp.jwt.verify.issuer=fitdemo
```

* `publickey.location` — kde najít veřejný klíč pro ověření podpisu (např. cesta v classpath nebo URL).
* `issuer` — očekávaná hodnota `iss` claim.

Při validaci tokenu MicroProfile JWT automaticky:

1. **Ověří podpis** přes veřejný klíč.
2. **Ověří vydavatele** (`iss` v tokenu musí souhlasit s konfigurací).
3. **Ověří expiraci** (`exp` v budoucnosti).
4. **Extrahuje claims** — uživatelské jméno z `upn`, role z `groups`.
5. **Nastaví security context** — `@RolesAllowed` pak funguje automaticky.

Pokud cokoliv selže, server vrátí `401 Unauthorized` (resp. `403 Forbidden` pro chybějící roli).

### Generování tokenu

Generování JWT se obvykle děje *na auth serveru* (autentizační endpoint), který:

* Ověří přihlašovací údaje proti DB,
* Sestaví claims:
  * `iss` — kdo token vydal,
  * `upn` (*user principal name*) — identita uživatele,
  * `groups` — role/oprávnění,
* Podepíše token privátním klíčem,
* Vrátí klientovi.

Klient si token uloží (např. v `HttpOnly` cookie nebo v paměti) a posílá s každým API požadavkem v `Authorization: Bearer` hlavičce.

```java
// Příklad generování JWT (pseudokód s knihovnou jose4j)
JsonWebSignature jws = new JsonWebSignature();
jws.setPayload(new JwtClaims() {{
    setIssuer("fitdemo");
    setSubject("user123");
    setStringClaim("upn", "alice@example.com");
    setStringListClaim("groups", List.of("admin", "user"));
    setExpirationTimeMinutesInTheFuture(60);  // expirace za hodinu
}}.toJson());
jws.setKey(privateKey);
jws.setAlgorithmHeaderValue("RS256");
String token = jws.getCompactSerialization();
```

V praxi to ovšem děláte přes knihovny jako [Nimbus JOSE](https://connect2id.com/products/nimbus-jose-jwt), [jose4j](https://bitbucket.org/b_c/jose4j) nebo [auth0/java-jwt](https://github.com/auth0/java-jwt) — sami JWT *neimplementujete*.

## Bezpečnost JWT — best practices

* **Krátká expirace access tokenů** (minuty, max hodiny) — minimalizace dopadu úniku.
* **Pro dlouhou session** používejte **Refresh Token** ([[identity-java|detaily]]).
* **HTTPS všude** — JWT je „bearer token", kdokoliv ho získá, může se vydávat za uživatele.
* **Nikdy neukládejte JWT do `localStorage`** v prohlížeči (XSS-zranitelné). Místo toho **HttpOnly cookies** nebo paměťové úložiště s krátkým životem.
* **Vždy ověřujte podpis a claims** `iss`, `aud`, `exp` — knihovny to dělají automaticky, ale specifické business validace si musíte napsat sami.
* Nedávejte do JWT **citlivá data** — payload není šifrovaný. Pouze identita + role.

## Demo — MicroProfile JWT {tier=extra}

V přednášce odkazované demo: [DIFS-Teaching/rest-auth](https://github.com/DIFS-Teaching/rest-auth) — kompletní příklad MicroProfile JWT s generátorem klíčů a Payara/Liberty konfigurací.

::: link "RFC 7519 — JSON Web Token (JWT)" "https://www.rfc-editor.org/rfc/rfc7519"
:::

::: link "MicroProfile JWT — specifikace" "https://microprofile.io/specifications/microprofile-jwt-auth/"
:::

::: link "jwt.io — interaktivní debugger JWT tokenů" "https://jwt.io/"
:::

::: link "OWASP — JSON Web Token Cheat Sheet" "https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html"
:::

::: quiz "JWT token obsahuje claim `\"groups\": [\"admin\", \"user\"]` a v aplikaci máte `@RolesAllowed(\"admin\")` nad endpointem. Co se stane při volání?"
- [x] MicroProfile JWT ověří podpis, prečte `groups`, mapuje je na role v security contextu, kontejner povolí volání (uživatel má roli `admin`).
  > Ano. Mapování claim `groups` → security role je *standardní chování* MicroProfile JWT.
- [ ] Volání selže — `@RolesAllowed` čte role z databáze, ne z tokenu.
  > Ne. Při použití `@LoginConfig(authMethod="MP-JWT")` role pocházejí z tokenu.
- [ ] Volání projde, ale jen pokud aplikace má extra `@RolesFromJWT` anotaci.
  > Žádná taková anotace neexistuje. Stačí `@LoginConfig(authMethod="MP-JWT")` na aplikační úrovni.
:::

::: quiz "Proč je nutné u HTTP Basic používat HTTPS?"
- [x] Hlavička `Authorization: Basic dXNlcjpwYXNz` je pouze **base64-encoded** — kdokoliv ji odposlechne, jednoduše ji dekóduje a získá heslo v plain textu.
  > Přesně. Base64 není šifrování, je to jen způsob *kódování* binárních dat do ASCII. Bez HTTPS je to ekvivalentní posílání hesla otevřeně.
- [ ] HTTP Basic vyžaduje HTTPS jako podmínku protokolu.
  > Není to vynuceno protokolem (RFC 7617 to ovšem doporučuje); je to praktická nutnost kvůli bezpečnosti.
- [ ] Některé prohlížeče bez HTTPS HTTP Basic vůbec neumožní.
  > Není pravda — funguje i přes HTTP, ale je to *naprosto nebezpečné*. Otázka praktiky, ne technické možnosti.
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=T0k-3Ze4NLo" "JWT - JSON Web Token Crash Course (NodeJS & Postgres)" "Hussein Nasser"
:::

*Zdroj: přednášky PIS — doc. R. Burget, VUT FIT, část „Autentizace v REST, JWT" v přednášce „Business vrstva a API" (slidy 24–32). Doplněno o OWASP doporučení a praktiky bezpečnosti.*
