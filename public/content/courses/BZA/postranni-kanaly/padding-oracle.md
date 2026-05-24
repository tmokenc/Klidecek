---
title: Padding Oracle útok
---

# Padding Oracle útok

**Padding oracle attack** je side-channel útok přes *chybové zprávy* implementace. Útočník modifikuje šifrový text a podle reakce systému (akceptováno / odmítnuto kvůli padding / odmítnuto kvůli MAC) postupně rekonstruuje plaintext **bez znalosti klíče**. Útok formalizoval **Serge Vaudenay v r. 2002** ([*Security Flaws Induced by CBC Padding*](https://www.iacr.org/cryptodb/data/paper.php?pubkey=1064)).

## Princip

CBC mode šifruje plaintext blok po bloku:

::: math
C_i = E_K(P_i \oplus C_{i-1}), \quad P_i = D_K(C_i) \oplus C_{i-1}
:::

Před šifrováním je plaintext **paddingován** do násobku block size:

* **PKCS#7** (a RFC2040 ekvivalent) — pokud chybí $n$ bajtů do násobku, doplní se $n$ bajty hodnoty $n$.
  * `[A B C D E F G]` (7B) + padding `01` → `[A B C D E F G 01]`.
  * `[A B C D E F]` (6B) + padding `02 02` → `[A B C D E F 02 02]`.
  * Plný blok dat + plný padding blok `08 08 08 08 08 08 08 08`.

Při dešifrování:

1. Dešifrovat všechny bloky.
2. **Zkontrolovat padding** — poslední bajt $n$, pak $n$-tý od konce, $(n-1)$-tý, … všechny musí mít hodnotu $n$.
3. **Zkontrolovat MAC** — ověřit integritu zprávy.

Pokud kontrola padding selže, vrátí se **specifická error** (např. `BAD_PADDING_ERROR`). Pokud padding OK, ale MAC fail, vrátí se *jiná* error. Útočník měří, kterou error dostal — to je **1 bit informace** o správnosti padding.

## Útok — recovery posledního bajtu

::: svg "Padding oracle útok: útočník nahradí předchozí blok náhodnými daty r, modifikuje poslední byte. Pokud server hlásí 'padding OK', útočník odvodil dekrypci posledního bytu."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aPO1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40" y="40" width="160" height="40" rx="4"/>
    <rect x="220" y="40" width="160" height="40" rx="4"/>
    <rect x="40" y="120" width="160" height="40" rx="4"/>
    <rect x="220" y="120" width="160" height="40" rx="4"/>
    <rect x="420" y="80" width="100" height="40" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="120" y="65" font-size="11.5">C_{i-1} (původní)</text>
    <text x="300" y="65" font-size="11.5">C_i (cílový blok)</text>
    <text x="120" y="145" font-size="11.5">r (útočník volí)</text>
    <text x="300" y="145" font-size="11.5">C_i</text>
    <text x="470" y="95" font-size="11">D_K(C_i) ⊕ r</text>
    <text x="470" y="111" font-size="10" fill="var(--text-muted)">= padding?</text>
    <text x="270" y="22" font-size="10" fill="var(--text-muted)">legitimní šifrový text</text>
    <text x="270" y="184" font-size="10" fill="var(--text-muted)">padělaný — útočník zkouší r</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aPO1)">
    <path d="M380,140 L420,110"/>
  </g>
</svg>
:::

Útočník chce dešifrovat blok $C_i$. Strategie:

* Zvolí **náhodný blok** $r = r_1 \ldots r_b$ (kde $b$ = block size, 16 pro AES, 8 pro 3DES).
* Pošle dvojici $(r, C_i)$ jako "šifrový text" k dešifrování. Server spočte:

::: math
P' = D_K(C_i) \oplus r
:::

* Server zkontroluje, zda $P'$ má **validní padding**.

::: viz padding-oracle "Padding oracle byte-by-byte recovery. Sleduj, jak postupne ladis posledni bajt, pak predposledni, atd. — 256 dotazu na byte, plnou zpravu za sekundy."
:::

### Recovery posledního bajtu

Útočník postupně mění **poslední bajt** $r_b$ z `0x00` do `0xFF` a posílá $b \cdot y$ kde $b$ = $b-1$ random bajtů + $r_b$. Pro daný $r_b$:

::: math
P'[b] = D_K(C_i)[b] \oplus r_b
:::

Padding je validní, pokud $P'[b] = 0x01$ (nejkratší padding). To znamená:

::: math
r_b = D_K(C_i)[b] \oplus 0x01
:::

Útočník tedy:

1. Pro $r_b = 0, 1, \ldots, 0xFF$ pošle padělaný šifrový text a sleduje reakci.
2. Pro většinu $r_b$ je padding *invalid* → server vrátí `BAD_PADDING`.
3. Pro **jednu hodnotu** $r_b^*$ je padding validní → `OK` (nebo *jiná* error, např. `BAD_MAC`).
4. Útočník odvodí: $D_K(C_i)[b] = r_b^* \oplus 0x01$.

**Pozor:** může být *dvakrát* validní padding — `0x01` na konci, nebo `0x02 0x02` na posledních dvou pozicích. Útočník zopakuje pro odlišení — modifikací předposledního bajtu vyloučí $0x02 0x02$ scénář.

### Recovery dalších bajtů

Z $D_K(C_i)[b]$ a původního $C_{i-1}[b]$ útočník zná $P_i[b]$:

::: math
P_i[b] = D_K(C_i)[b] \oplus C_{i-1}[b]
:::

Pro recovery $P_i[b-1]$:

* Volí $r_j = D_K(C_i)[b] \oplus 0x02$ pro pozici $b$ (tj. $P'[b] = 0x02$).
* Pro pozici $b-1$ postupně zkouší $r_{b-1} = 0, \ldots, 0xFF$.
* Když padding $0x02 0x02$ projde → $D_K(C_i)[b-1] = r_{b-1} \oplus 0x02$.

A tak dále, $b-2, b-3, \ldots, 1$. Pro plný blok útočník provede $b \times 256 = 4096$ dotazů (worst case).

## Celková komplexita

Pro zprávu $N$ bloků po $b$ slovech, $W$ možných slov:

::: math
O(N \cdot b \cdot W)
:::

* AES 16-byte block, 8kB zpráva = 512 bloků. Útok: $512 \times 16 \times 256 = 2^{21} \approx 2$ miliony dotazů.
* Při ~1 ms RTT to je **~30 minut** pro server.
* Pro HSM s rychlejší API (~100 μs): **3 minuty**.

## Praktické nasazení

### SSL/TLS — Vaudenay 2002

Klasický útok cílí na CBC-MAC schémata v TLS 1.0/1.1:

* TLS používá **MAC-then-encrypt** — nejdřív MAC, pak šifrování CBC.
* Po dešifrování server:
  1. Zkontroluje padding.
  2. Zkontroluje MAC.
* Pokud padding fail, server vrátí specifickou error. Pokud MAC fail, *jinou*. (TLS 1.0 původně rozlišovalo *jasně*.)
* Útok: extrahuj cookie, session token z TLS spojení.

Mitigace: TLS 1.0+ patch — *konstantní čas* mezi padding a MAC error (TLS 1.0 SP3 "encrypt-then-MAC"). TLS 1.3 *odstranil* CBC mode úplně — povolen jen AEAD (AES-GCM, ChaCha20-Poly1305).

### IPsec — Canvel 2003

[*Password Interception in a SSL/TLS Channel*](https://www.iacr.org/cryptodb/data/paper.php?pubkey=170): IPsec ESP s CBC byl zranitelný stejným způsobem; útok získal IMAP heslo.

### ASP.NET — Rizzo-Duong 2010

[BEAST attack](https://blog.qualys.com/qsc/2010/09/15/aspnet-padding-oracle-vulnerability) — Rizzo a Duong demonstrovali padding oracle na ASP.NET ViewState:

* ASP.NET používal 3DES CBC pro ViewState (skryté pole na HTML stránce).
* Web framework vracel HTTP **500** pro bad padding, **HTTP 200** pro bad ViewState.
* Útok získal **machine key** za 30 sekund web requests.

Microsoft vydal MS10-070 patch.

### POODLE — Möller 2014

[*Padding Oracle On Downgraded Legacy Encryption*](https://www.openssl.org/~bodo/ssl-poodle.pdf) (Möller, Duong, Kotowicz):

* SSL 3.0 padding nebyl deterministický — pro $n$-byte padding *jen poslední byte* je $n$, ostatní libovolné.
* Útok přes downgrade: aktivní útočník vynucuje fallback z TLS 1.0 na SSL 3.0.
* Padding oracle přes JavaScript ve victim browser.
* Recovery cookies za **~256 requests/byte** (vs. naive **256 bytes/byte**).

Důsledek: SSL 3.0 vypnut na *všech* serverech do měsíce. POODLE-bis zahrnoval některé TLS 1.0 stacks s nepodáním constant-time padding check.

### Bleichenbacher (1998) a ROBOT (2017)

[*Chosen ciphertext attacks against protocols based on the RSA encryption standard PKCS #1*](https://www.iacr.org/conferences/crypto98/papers/1462/bleichenbacher.pdf) — **Bleichenbacher 1998** — analog padding oracle, ale pro **RSA-PKCS#1 v1.5**:

* RSA dešifrování v TLS — server zkontroluje, zda dešifrovaný plaintext začíná `00 02 ...` (PKCS#1 padding).
* Pokud ne, vrátí error. Pokud ano, pokračuje.
* Útočník modifikuje šifrový text a sleduje odpověď — pomocí 1-bit oracle rekonstruuje plaintext.
* **Million Message Attack** — typicky 1M dotazů, ale s optimalizacemi (Klima 2003) 50–100k.

**ROBOT 2017** ([Böck-Somorovsky-Young](https://robotattack.org/)) — Bleichenbacher *stále funguje* na desítkách miliard webových serverů včetně Facebook, F5 BIG-IP, Cisco. Mitigace v TLS: TLS 1.3 zakazuje RSA encryption *úplně*; používá se ECDHE_RSA jen pro autentizaci, ne pro klíčovou výměnu.

## Útok č. 6 — HSM padding oracle (Bardou et al. 2012)

[*Efficient Padding Oracle Attacks on Cryptographic Hardware*](https://hal.inria.fr/hal-00691958v2):

* PKCS#11 HSM s `C_UnwrapKey()` operací — dešifruje encrypted klíč a importuje.
* HSM vrací různé errors pro padding fail vs. nesprávný formát klíče.
* Útok recovery wrapped klíče **za 30 minut** na HSM.
* Důkaz, že padding oracle není jen "TLS issue" — postihuje *všechny* CBC + error code implementations.

Mitigace v HSM (PKCS#11 v2.40+): standardní *uniformly* error code pro všechny failure módy.

## Obrany

### Eliminace problému

* **Encrypt-then-MAC** — nejdřív šifrovat, pak MAC nad šifrovým textem. Při dešifrování *nejdřív* ověřit MAC; pokud fail, *neeven dešifruj*. Klíčové řešení.
* **AEAD modes** — AES-GCM, ChaCha20-Poly1305, OCB. Integrita je *integrální* součást — žádný oddělený MAC, žádný padding (CTR mode + Poly1305 / GHASH).

### Pokud nelze změnit schéma

* **Constant-time padding check** — kontrola padding *nikdy* nesmí měřit selhání rychleji než úspěch. *Vždy* dokončí celé porovnání.
* **Uniformní chybové zprávy** — `BAD_PADDING` a `BAD_MAC` vrátit *stejný* error code, *stejnou* dobu.
* **Mute oracle** — pokud opakovaně dostává bad padding, server přestane vracet error a *uzavře* spojení.

### Verifikace

* **Test vectors** s validním i nevalidním padding/MAC — měření času musí být *stejné*.
* **Static analysis** — formální verifikace constant-time properties.

## Lekce

1. **Krátká chybová zpráva = velký leak.** I 1 bit (OK/FAIL) stačí pro extrakci klíče.
2. **AEAD místo CBC+MAC.** TLS 1.3 to udělalo — zakázal CBC. Pro nové aplikace **vždy** použij AES-GCM nebo ChaCha20-Poly1305.
3. **Mac then encrypt vs. encrypt then mac.** Toto je klasický problém složený protokolu — *order matters*.
4. **HW útoky a SW útoky se nepříliš liší.** HSM s neopatrnou implementací padá stejně jako Apache.

---

*Zdroj: BZA přednášky 2025/26, BZA 05 — Postranní kanály (Malinka). Externí reference: Vaudenay, S.: *Security Flaws Induced by CBC Padding — Applications to SSL, IPSEC, WTLS...* (EUROCRYPT 2002) — [PDF](https://www.iacr.org/archive/eurocrypt2002/23320530/cbc02_e02d.pdf); Bardou, R., Focardi, R., Kawamoto, Y., Simionato, L., Steel, G., Tsay, J.-K.: *Efficient Padding Oracle Attacks on Cryptographic Hardware* (CRYPTO 2012) — [PDF](https://hal.inria.fr/hal-00691958v2/document); Möller, B., Duong, T., Kotowicz, K.: *This POODLE Bites: Exploiting The SSL 3.0 Fallback* (2014) — [PDF](https://www.openssl.org/~bodo/ssl-poodle.pdf); Böck, H., Somorovsky, J., Young, C.: *Return Of Bleichenbacher's Oracle Threat (ROBOT)* (USENIX Security 2018) — [project page](https://robotattack.org/).*
