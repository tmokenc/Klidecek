---
title: Webový informační systém — server-side rendering vs. API
---

Webové prostředí dnes tvoří *de facto* standard pro klientskou stranu informačních systémů. Aplikace běží v prohlížeči (tenký klient) a se serverem komunikuje pomocí **HTTP**. Architektura takového systému má dvě hlavní podoby, které se liší v tom, **kde žije prezentační logika**.

## Server-side rendering (klasický „webový IS")

V tradičním pojetí prohlížeč funguje jako (téměř) tenký klient — pouze zobrazuje stránky vygenerované serverem.

::: svg "Klasický webový IS: server generuje HTML, klient ho zobrazuje"
<svg viewBox="0 0 540 230" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="180" height="190" rx="8" fill="oklch(0.65 0.18 65 / 0.10)" stroke="oklch(0.65 0.18 65)" stroke-width="1"/>
  <text x="110" y="42" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Klientská část (frontend)</text>
  <rect x="50" y="100" width="120" height="40" rx="6" fill="oklch(0.65 0.18 65 / 0.25)" stroke="oklch(0.65 0.18 65)"/>
  <text x="110" y="123" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Webový prohlížeč</text>
  <text x="110" y="170" text-anchor="middle" font-size="9.5" fill="var(--text-muted)" font-family="var(--font-mono)">jen renderuje HTML</text>
  <line x1="200" y1="120" x2="340" y2="120" stroke="var(--text-muted)" stroke-width="1.2" marker-end="url(#wa)"/>
  <line x1="340" y1="135" x2="200" y2="135" stroke="var(--text-muted)" stroke-width="1.2" marker-end="url(#wa)"/>
  <text x="270" y="103" text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)">HTTP</text>
  <text x="270" y="155" text-anchor="middle" font-size="9.5" fill="var(--text-muted)" font-family="var(--font-mono)">HTML, formuláře</text>
  <rect x="340" y="20" width="180" height="190" rx="8" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.62 0.14 264)" stroke-width="1"/>
  <text x="430" y="42" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Serverová část (backend)</text>
  <rect x="355" y="55" width="150" height="22" rx="3" fill="oklch(0.40 0.14 264)" stroke="none"/>
  <text x="430" y="70" text-anchor="middle" font-size="10" fill="white" font-weight="600">HTTP server</text>
  <rect x="355" y="82" width="150" height="28" rx="3" fill="oklch(0.65 0.16 220 / 0.40)"/>
  <text x="430" y="100" text-anchor="middle" font-size="10" fill="var(--text)" font-weight="600">Prezentační logika</text>
  <rect x="355" y="115" width="150" height="28" rx="3" fill="oklch(0.62 0.14 22 / 0.50)"/>
  <text x="430" y="133" text-anchor="middle" font-size="10" fill="var(--text)" font-weight="600">Aplikační (business) logika</text>
  <rect x="355" y="148" width="150" height="28" rx="3" fill="oklch(0.62 0.14 142 / 0.50)"/>
  <text x="430" y="166" text-anchor="middle" font-size="10" fill="var(--text)" font-weight="600">Datová vrstva</text>
  <defs>
    <marker id="wa" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

* Klient odešle požadavek (klikne na odkaz, odešle formulář).
* Server zpracuje vstup → zavolá business logiku → načte data z DB → vygeneruje **HTML** odpověď.
* Prohlížeč novou stránku vyrenderuje, uživatel ji vidí.

Veškerá prezentační logika (generování stránek, ovládání toku, validace na serverové straně) je **na serveru**. Klient je jednoduchý a stačí mu prohlížeč.

V Jakarta EE k tomuto stylu patří **JSF (Jakarta Server Faces)** a **Servlet/JSP** — viz subtopic [[jakarta-ee-platforma]].

## API + tlustší klient (SPA, mobilní aplikace)

Modernější varianta posunula prezentační logiku **na klienta**. Server místo HTML vrací **serializovaná data** (typicky JSON, méně často XML); klient (Angular, React, Vue.js, nativní mobilní app) si z nich UI sestaví sám.

::: svg "Webový IS s aplikačním rozhraním (API): server vrací data, klient renderuje"
<svg viewBox="0 0 540 230" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="180" height="190" rx="8" fill="oklch(0.65 0.18 65 / 0.10)" stroke="oklch(0.65 0.18 65)" stroke-width="1"/>
  <text x="110" y="42" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Klientská část (frontend)</text>
  <rect x="50" y="65" width="120" height="120" rx="6" fill="oklch(0.65 0.18 65 / 0.25)" stroke="oklch(0.65 0.18 65)"/>
  <rect x="58" y="73" width="104" height="32" rx="3" fill="oklch(0.65 0.16 220 / 0.55)"/>
  <text x="110" y="93" text-anchor="middle" font-size="10" fill="var(--text)" font-weight="600">Prezentační logika</text>
  <text x="110" y="135" text-anchor="middle" font-size="10" fill="var(--text)">Webový prohlížeč</text>
  <text x="110" y="155" text-anchor="middle" font-size="9.5" fill="var(--text-muted)" font-family="var(--font-mono)">Angular / React / Vue</text>
  <line x1="200" y1="120" x2="340" y2="120" stroke="var(--text-muted)" stroke-width="1.2" marker-end="url(#wb)"/>
  <line x1="340" y1="135" x2="200" y2="135" stroke="var(--text-muted)" stroke-width="1.2" marker-end="url(#wb)"/>
  <text x="270" y="103" text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)">HTTP</text>
  <text x="270" y="155" text-anchor="middle" font-size="9.5" fill="var(--text-muted)" font-family="var(--font-mono)">JSON / XML</text>
  <rect x="340" y="20" width="180" height="190" rx="8" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.62 0.14 264)" stroke-width="1"/>
  <text x="430" y="42" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Serverová část (backend)</text>
  <rect x="355" y="55" width="150" height="22" rx="3" fill="oklch(0.40 0.14 264)" stroke="none"/>
  <text x="430" y="70" text-anchor="middle" font-size="10" fill="white" font-weight="600">HTTP server</text>
  <rect x="355" y="82" width="150" height="24" rx="3" fill="oklch(0.62 0.14 340 / 0.45)"/>
  <text x="430" y="98" text-anchor="middle" font-size="10" fill="var(--text)" font-weight="600">Aplikační rozhraní (API)</text>
  <rect x="355" y="110" width="150" height="28" rx="3" fill="oklch(0.62 0.14 22 / 0.50)"/>
  <text x="430" y="128" text-anchor="middle" font-size="10" fill="var(--text)" font-weight="600">Aplikační (business) logika</text>
  <rect x="355" y="142" width="150" height="28" rx="3" fill="oklch(0.62 0.14 142 / 0.50)"/>
  <text x="430" y="160" text-anchor="middle" font-size="10" fill="var(--text)" font-weight="600">Datová vrstva</text>
  <defs>
    <marker id="wb" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

* Server poskytuje **API** — typicky REST (HTTP + JSON), méně často SOAP nebo GraphQL.
* Klient drží lokální stav, sestavuje UI a volá API.
* Server zůstává **bezstavový** (případně se ukládá pouze autentizační token).

Tento přístup je dnes výchozí volbou pro **single-page applications (SPA)** a pro **mobilní klienty** sdílející tytéž business operace přes API. V Jakarta EE se k jeho realizaci používá **JAX-RS (Jakarta RESTful Web Services)** — viz subtopic [[servlet-jax-rs]].

## Praktické důsledky volby

| Aspekt | Server-side (JSF) | API + klient (REST + SPA) |
|---|---|---|
| Prezentační logika | Server | Klient |
| Náročnost klienta | Tenký (jen HTML/CSS) | Tlustý (JS framework) |
| První načtení stránky | Rychlejší | Pomalejší (musí stáhnout JS bundle) |
| Interakce po načtení | Plný roundtrip | Lokální + cílené volání API |
| Sdílení backendu | Pouze web | Web + mobil + 3rd-party |
| SEO | Snadné | Vyžaduje SSR/SSG |
| Stav klienta | V session na serveru | V klientovi (Redux apod.) |

Volba není binární — moderní rámce kombinují obě varianty (SSR/SSG s následnou hydrací).

::: link "RFC 9110 — HTTP Semantics" "https://www.rfc-editor.org/rfc/rfc9110.html"
:::

::: link "Roy Fielding — Architectural Styles and the Design of Network-based Software Architectures (REST disertace)" "https://ics.uci.edu/~fielding/pubs/dissertation/top.htm"
:::

::: link "MDN — Server-side rendering vs CSR" "https://developer.mozilla.org/en-US/docs/Glossary/SSR"
:::

::: quiz "Kterou výhodu poskytuje API + SPA architektura oproti čistě server-side rendering?"
- [x] Tentýž backend obsluhuje web, mobilní aplikaci i další třetí strany.
  > Ano. API jako jediný styčný bod znamená, že business logika je sdílená napříč klienty.
- [ ] První načtení stránky je vždy rychlejší.
  > Naopak — SPA musí stáhnout JS bundle před prvním renderem. Server-side rendering doručí HTML hotové.
- [ ] Server musí udržovat stav klienta.
  > Naopak — REST API jsou typicky bezstavová a stav drží klient.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, VUT FIT, část „Webový IS" v přednášce „Backend a platforma Jakarta EE".*
