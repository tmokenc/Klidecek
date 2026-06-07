---
title: Sociální inženýrství a uživatelské chyby
---

# Sociální inženýrství — útoky na uživatele

Sebelepší technické zabezpečení je k ničemu, pokud uživatel (user) sám předá útočníkovi (attacker) své přihlašovací údaje (credentials). **Sociální inženýrství (social engineering)** je *manipulace* lidí s cílem přimět je vyzradit informace nebo provést nějakou akci. Stále jde o útočný vektor číslo jedna (#1 attack vector) ve skutečných bezpečnostních incidentech.

## Princip

Útočník (attacker) využívá *psychologické sklony* (psychological tendencies) oběti:

- **Autorita (authority)** — vydává se za IT administrátora, manažera nebo policii.
- **Naléhavost (urgency)** — „váš účet bude do hodiny smazán".
- **Strach (fear)** — „váš počítač je infikován; zaplaťte za opravu".
- **Chamtivost (greed)** — „vyhráli jste cenu" / „investiční příležitost".
- **Zvědavost (curiosity)** — „podívejte se na svou trapnou fotku".
- **Důvěra (trust)** — „jsem kolega, můžeš mi pomoct".
- **Reciprocita (reciprocity)** — „já jsem pomohl tobě, teď pomoz ty mně".

Tyto útoky nevyžadují žádné technické zneužití (technical exploit) — zranitelností (vulnerability) je samotný *člověk*.

## Phishing

**Phishing** je hromadný e-mail, který se vydává za legitimního odesílatele a žádá o přihlašovací údaje nebo o kliknutí na škodlivý odkaz.

### E-mailový phishing

```
From: support@paypal.com  (spoofed)
Subject: Account Suspended

Dear customer,

Your PayPal account has been suspended due to suspicious activity. 
Please verify your identity within 24 hours:

[Verify Account] (link to attacker's site)

Thank you,
PayPal Security Team
```

Uživatel klikne → falešná přihlašovací stránka PayPalu → zadá své údaje → útočník je má.

### Cílený phishing (spear phishing)

*Cílený* phishing. Útočník si oběť nejprve nastuduje a zprávu jí přizpůsobí na míru.

Příklad: útočník se vydává za ředitele (CEO), který píše finanční ředitelce (CFO):

```
From: ceo@company.com  (spoofed or compromised)
Subject: Urgent Wire Transfer

Hi Sarah,

I need you to process a wire transfer for $50k to vendor XYZ. 
Details attached. Please rush, I'm in a meeting.

Thanks,
Mike
```

Finanční ředitelka vyhoví → 50 000 dolarů je pryč. Tomuto typu se říká **kompromitace firemního e-mailu (Business Email Compromise, BEC)** — celosvětově nahlášené ztráty činily 43 miliard dolarů v letech 2016–2021 (FBI IC3).

### Lov na velryby (whaling)

Cílený phishing zaměřený na *vrcholové vedení* (executives).

### Vishing — phishing po telefonu

Telefonát. Útočník se vydává za:

- IT podporu: „váš počítač je infikován, dejte mi vzdálený přístup".
- banku: „ověřte svůj účet, sdělte mi svůj PIN".
- finanční úřad: „dlužíte na daních, zaplaťte ihned".

### Smishing — phishing přes SMS

```
"Your package can't be delivered. Pay $1.99 customs at example.com/pay"
```

Odkaz vede na stránku sbírající přihlašovací údaje nebo na malware.

### Vymyšlená záminka (pretexting)

Útočník si vymyslí *příběh* (záminku, pretext), aby z oběti vylákal informace.

Příklad: vydává se za pracovníka HR, který provádí bezpečnostní audit, a žádá o heslo.

Slavný případ: Kevin Mitnick (90. léta) — „uřečnil" si cestu do mnoha firem.

## Phishingové sady (phishing kits)

Hotová phishingová infrastruktura na klíč:

- **Evilginx** — TLS proxy, která dokáže obejít vícefaktorové ověření (MFA).
- **GoPhish** — open-source phishingový framework (legitimně pro red team).
- **Modlishka** — nástroj pro zachytávání přihlašovacích údajů.

Cena moderní sady: zhruba 100 dolarů. Nízká vstupní bariéra → bujení kriminality.

## Obrana

### Autentizace e-mailu (email authentication)

- **SPF** (Sender Policy Framework) — DNS záznam vyjmenovávající povolené odesílatele.
- **DKIM** (DomainKeys Identified Mail) — kryptografický podpis odchozího e-mailu.
- **DMARC** — kombinuje SPF + DKIM a definuje politiku pro případ selhání kontroly.

Při správné konfiguraci se na e-mailové bráně zachytí zhruba 95 % phishingu.

### E-mailová brána (email gateway)

Microsoft Defender for Office 365, Proofpoint, Mimecast — kontrolují přílohy, URL adresy a reputaci odesílatele.

### Kontrola URL adres (URL inspection)

Přepis URL v okamžiku kliknutí (click-time URL rewriting) — brána přepíše odkazy v e-mailech tak, aby vedly skrz ni. V okamžiku kliknutí pak odkaz prověří vůči aktuálním informacím o hrozbách (threat intel).

### Vícefaktorové ověření (MFA)

I když útočník heslo vyphishuje, nepřihlásí se bez druhého faktoru MFA (TOTP, hardwarový token).

**MFA odolné vůči phishingu**: hardwarové tokeny s WebAuthn (FIDO2). Jsou odolné proto, že jsou kryptograficky vázané na legitimní doménu.

MFA založené na SMS *není* odolné vůči phishingu (útočník dokáže přes Evilginx vyphishovat i jednorázový kód OTP).

### Varování prohlížeče

Chrome i Firefox varují před známými phishingovými stránkami (seznam Google Safe Browsing).

### Školení uživatelů

- **Školení bezpečnostního povědomí (security awareness training)** — pravidelně každý rok, zaměřené na konkrétní témata.
- **Phishingová simulace** — simulované phishingové e-maily, sleduje se míra prokliků.

KnowBe4, Proofpoint Security Awareness, SANS — hlavní dodavatelé.

Účinnost je různá. *Snižuje* míru prokliků, ale neeliminuje ji úplně.

## Záminky a vydávání se za někoho jiného (pretexting + impersonation)

### Proklouznutí za zády (tailgating)

Útočník fyzicky projde za oprávněnou osobou hlídanými dveřmi. „Zapomněl jsem si kartu, pustíš mě dovnitř?"

Obrana: bezpečnostní propusti (mantraps), bezpečnostní povědomí, důsledné vyžadování přístupových karet.

### Prohrabávání odpadků (dumpster diving)

Probírání firemního odpadu kvůli citlivým informacím — vytištěné reporty, jména zaměstnanců, síťová schémata.

Obrana: skartovačka na citlivé dokumenty, zabezpečené skartovací nádoby.

### Pohled přes rameno (shoulder surfing)

Útočník sleduje zezadu, jak uživatel píše heslo.

Obrana: filtr soukromí (privacy screen) na monitor, opatrnost na veřejných místech.

## Útok na navštěvovaný web (watering hole)

Útočník kompromituje *legitimní* web, který oběť navštěvuje. Návštěvníci si tak při pouhém prohlížení stáhnou malware (drive-by malware).

Příklad: útok z roku 2013 na web amerického ministerstva práce, kam byl vložen exploit → infikovali se zaměstnanci ministerstva energetiky (DoE), kteří stránku navštívili.

Obrana: webové filtrování, EDR, izolace prohlížeče v sandboxu (Chromium site isolation).

## Podstrčená USB (USB drops)

Útočník nechá na parkovišti USB disk s nápisem „Salary 2024.xlsx" nebo „Confidential".

Zvědavý zaměstnanec ho zapojí do pracovního počítače → spustí se malware přes automatické přehrání (autorun).

Stuxnet (2010) — do íránského jaderného zařízení se rozšířil právě přes USB.

Obrana: zakázat autorun, uzamknout porty (zakázat USB na produkčních strojích), školení.

## Vnitřní hrozby (insider threats)

*Interní* útočníci — nespokojení zaměstnanci, dodavatelé, nasazení agenti.

- **Edward Snowden (2013)** — vynesl dokumenty NSA.
- **Chelsea Manning (2010)** — vynesla diplomatické depeše.
- **Různí bankovní zaměstnanci** — zpronevěra díky vnitřnímu přístupu.

### Obrana

- **Prověrky (background checks)** — při náboru.
- **Princip nejmenších oprávnění (least privilege)** — minimální nutný přístup.
- **Oddělení povinností (separation of duties)** — žádný jednotlivec nedokáže způsobit velkou škodu sám.
- **Rotace pracovních rolí (job rotation)** — pravidelné střídání rolí.
- **Povinná dovolená (mandatory vacation)** — odhalí podvod, který vyžaduje neustálou přítomnost pachatele.
- **Analýza chování (behavior analytics, UEBA)** — detekce anomálií.
- **Prevence úniku dat (Data Loss Prevention, DLP)** — blokování přenosu citlivých dat.

## OSINT — zpravodajství z otevřených zdrojů (Open Source Intelligence)

Útočníci si před útokem shromáždí *veřejně dostupné* informace:

- **LinkedIn** — zaměstnanci, role, používané technologie.
- **GitHub** — zdrojový kód, někdy i přihlašovací údaje.
- **Firemní web** — organizační struktura, kontakty.
- **Sociální sítě** — osobní informace pro cílený phishing.
- **Shodan** — vystavené (dostupné) služby.
- **WHOIS, DNS** — infrastruktura.

Obrana: omezit množství veřejných informací, školit zaměstnance o soukromí na sociálních sítích, sledovat úniky dat.

## Psychologické principy

Cialdiniho 6 principů ovlivňování (1984):

1. **Reciprocita (reciprocity)** — oplácíme laskavosti.
2. **Závazek a důslednost (commitment + consistency)** — když se veřejně zavážeme, držíme se toho.
3. **Sociální důkaz (social proof)** — když to dělají ostatní, musí to být v pořádku.
4. **Autorita (authority)** — posloucháme vnímanou autoritu.
5. **Sympatie (liking)** — souhlasíme s lidmi, které máme rádi.
6. **Vzácnost (scarcity)** — omezený čas = jednej hned.

Všechny se v sociálním inženýrství využívají. Pomáhá, když je člověk vyškolen je *rozpoznat* a odolat jim.

::: viz phishing-indicators "Klikni na podezřelé části emailu — odhalí se red flag a vysvětlení. Spoofed domain, urgency, generic greeting, lookalike URL — klasický phishing recipe."
:::

## Slavné incidenty {tier=example}

- **Únik z RSA (2011)** — phishingové e-maily zaměstnancům vedly ke kompromitaci seedů pro RSA SecurID.
- **Sony Pictures (2014)** — severokorejští aktéři získali počáteční přístup pomocí phishingu.
- **Equifax (2017)** — zneužití nezáplatovaného Apache Struts, ale také špatná reakce na incident (selhání organizace).
- **Twitter (2020)** — vishing zaměstnanců → přístup k administrátorským nástrojům → slavné převzetí kont.
- **Uber (2022)** — únava z MFA (MFA fatigue) plus zahlcení push notifikacemi (push-bombing).

## Únava z MFA (MFA fatigue)

Útočník má heslo. *Opakovaně* spouští push notifikace MFA. Uživatel klikne na „Schválit" z otrávenosti nebo v domnění, že je to legitimní.

Obrana:

- **Shoda čísel (number matching)** — push notifikace zobrazí náhodné číslo, které uživatel opíše do autentizační aplikace.
- **Hardwarové tokeny** — vyžadují fyzické stisknutí tlačítka.

## Vrstvená obrana (defense framework)

```
Layer 1: Email gateway      (block 95 % of phishing)
Layer 2: Browser warnings   (block known sites)
Layer 3: User training      (recognize remaining)
Layer 4: MFA                (limit damage of successful phish)
Layer 5: Behavior detection (detect compromised account)
Layer 6: Incident response  (contain quickly)
```

Obrana do hloubky (defense in depth) — *žádná samostatná vrstva* nestačí.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Mitnick, K.D., Simon, W.L.: „The Art of Deception" (Wiley 2002); Hadnagy, C.: „Social Engineering: The Science of Human Hacking" (2nd ed., Wiley 2018); Cialdini, R.B.: „Influence: The Psychology of Persuasion" (Harper Business 2006); FBI IC3 — Internet Crime Report ([www.ic3.gov](https://www.ic3.gov/Media/PDF/AnnualReport/2022_IC3Report.pdf)); [Verizon DBIR](https://www.verizon.com/business/resources/reports/dbir/).*
