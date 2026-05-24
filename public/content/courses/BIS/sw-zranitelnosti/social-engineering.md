---
title: Social engineering a uživatelské chyby
---

# Social engineering — útoky na uživatele

Best technical security useless pokud *user* poskytne attackerovi credentials. **Social engineering** je *manipulace* lidí to give up info or perform actions. Stále *#1 attack vector* in real-world breaches.

## Princip

Útočník využívá *psychological tendencies*:

- **Authority** — pretend to be IT admin, manager, police.
- **Urgency** — "your account will be deleted in 1 hour".
- **Fear** — "your computer is infected; pay to fix".
- **Greed** — "you won a prize" / "investment opportunity".
- **Curiosity** — "see embarrassing photo of you".
- **Trust** — "I'm a colleague, can you help".
- **Reciprocity** — "I helped you, now help me".

Útoky nevyžadují technical exploit — *člověk* je vulnerability.

## Phishing

**Phishing** = mass email impersonating legitimate sender, asking for credentials or to click malicious link.

### Email phishing

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

User clicks → fake PayPal login page → enters credentials → attacker has them.

### Spear phishing

*Targeted* phishing. Attacker researches victim → personalized.

Example: pretend to be CEO emailing CFO:

```
From: ceo@company.com  (spoofed or compromised)
Subject: Urgent Wire Transfer

Hi Sarah,

I need you to process a wire transfer for $50k to vendor XYZ. 
Details attached. Please rush, I'm in a meeting.

Thanks,
Mike
```

CFO complies → $50k gone. **Business Email Compromise (BEC)** — $43B reported losses 2016-2021 globally (FBI IC3).

### Whaling

Spear phishing targeting *executives*.

### Vishing — voice phishing

Phone call. Attacker pretends to be:

- IT support: "your computer is infected, give me remote access".
- Bank: "verify your account, give me your PIN".
- Tax authority: "you owe taxes, pay immediately".

### Smishing — SMS phishing

```
"Your package can't be delivered. Pay $1.99 customs at example.com/pay"
```

Link to credential-harvesting site or malware.

### Pretexting

Attacker invents *story* (pretext) to extract info.

Example: pretend to be HR doing security audit, ask for password.

Famous: Kevin Mitnick (1990s) — talked his way into many companies.

## Phishing kits

Off-the-shelf phishing infrastructure:

- **Evilginx** — TLS proxy to defeat MFA.
- **GoPhish** — open-source phishing framework (red team, legitimately).
- **Modlishka** — credential interception.

Modern kit cost: ~$100. Low barrier to entry → criminal proliferation.

## Defense

### Email authentication

- **SPF** (Sender Policy Framework) — DNS record listing allowed senders.
- **DKIM** (DomainKeys Identified Mail) — cryptographic signature on outgoing email.
- **DMARC** — combines SPF + DKIM, defines policy for failures.

Properly configured → ~95% of phishing blocked at email gateway.

### Email gateway

Microsoft Defender for Office 365, Proofpoint, Mimecast — scan attachments, URLs, sender reputation.

### URL inspection

Click-time URL rewriting — gateway rewrites URLs in emails to go through gateway. Time-of-click check vs real-time threat intel.

### MFA

Even if password phished, attacker can't login without MFA second factor (TOTP, hardware token).

**Phishing-resistant MFA**: hardware tokens with WebAuthn (FIDO2). Phishing-resistant because cryptographically bound to legitimate domain.

SMS-based MFA *not* phishing-resistant (attacker can phish OTP too via Evilginx).

### Browser warnings

Chrome, Firefox warn on known phishing sites (Google Safe Browsing list).

### User training

- **Security awareness training** — annual, topic-specific.
- **Phishing simulation** — simulated phishing emails, track click rate.

KnowBe4, Proofpoint Security Awareness, SANS — major vendors.

Effectiveness mixed. *Reduces* click rate but doesn't eliminate.

## Pretexting + impersonation

### Tailgating

Attacker physically follows authorized person through controlled door. "I forgot my badge, can you let me in?"

Defense: mantraps, security awareness, badge enforcement.

### Dumpster diving

Sift through company trash for sensitive info — printed reports, employee names, network diagrams.

Defense: shredder for sensitive docs, secure shred bins.

### Shoulder surfing

Watch user type password from behind.

Defense: privacy screen, awareness in public spaces.

## Watering hole

Attacker compromises *legitimate* website that target visits. Visitors get drive-by malware.

Example: 2013 attack on US Department of Labor website injected exploit → infected DoE employees visiting.

Defense: web filtering, EDR, sandboxing browser (Chromium site isolation).

## USB drops

Leave USB drive in parking lot with "Salary 2024.xlsx" or "Confidential".

Curious employee plugs into work computer → runs autorun malware.

Stuxnet (2010) — propagated to Iran nuclear via USB.

Defense: disable autorun, port lock-down (deny USB on prod machines), training.

## Insider threats

*Internal* attackers — disgruntled employees, contractors, moles.

- **Edward Snowden (2013)** — leaked NSA documents.
- **Chelsea Manning (2010)** — leaked diplomatic cables.
- **Various banking insiders** — embezzle via insider access.

### Defense

- **Background checks** — at hire.
- **Least privilege** — minimum access.
- **Separation of duties** — no single person can cause major damage.
- **Job rotation** — change roles periodically.
- **Mandatory vacation** — detect fraud requiring continuous presence.
- **Behavior analytics (UEBA)** — anomaly detection.
- **DLP** (Data Loss Prevention) — block sensitive data transfers.

## OSINT — Open Source Intelligence

Attackers gather *public* info before attack:

- **LinkedIn** — employees, roles, tech stack.
- **GitHub** — code, sometimes credentials.
- **Company website** — org structure, contact info.
- **Social media** — personal info for spear phishing.
- **Shodan** — exposed services.
- **WHOIS, DNS** — infrastructure.

Defense: minimize public info, train employees on social media privacy, monitor data leaks.

## Psychological principles

Cialdini's 6 principles of influence (1984):

1. **Reciprocity** — return favors.
2. **Commitment + Consistency** — commit publicly → consistent.
3. **Social Proof** — others do it, must be OK.
4. **Authority** — obey perceived authority.
5. **Liking** — agree with people we like.
6. **Scarcity** — limited time = act now.

All used in social engineering. Training to *recognize* helps resist.

::: viz phishing-indicators "Klikni na podezřelé části emailu — odhalí se red flag a vysvětlení. Spoofed domain, urgency, generic greeting, lookalike URL — klasický phishing recipe."
:::

## Famous incidents

- **2011 RSA breach** — phishing emails to employees, leading to compromise of RSA SecurID seeds.
- **2014 Sony Pictures** — North Korean actors used phishing to gain initial access.
- **2017 Equifax** — exploited unpatched Apache Struts, but also poor incident response (org failure).
- **2020 Twitter** — vishing employees → access to admin tools → famous account takeover.
- **2022 Uber** — MFA fatigue + push-bombing.

## MFA fatigue

Attacker has password. Triggers MFA push *repeatedly*. User clicks "Approve" out of annoyance or thinks it's legitimate.

Defense:

- **Number matching** — push prompt shows random number, user types into auth app.
- **Hardware tokens** — physical button press required.

## Defense framework

```
Layer 1: Email gateway      (block 95 % of phishing)
Layer 2: Browser warnings   (block known sites)
Layer 3: User training      (recognize remaining)
Layer 4: MFA                (limit damage of successful phish)
Layer 5: Behavior detection (detect compromised account)
Layer 6: Incident response  (contain quickly)
```

Defense in depth — *no single layer* sufficient.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Mitnick, K.D., Simon, W.L.: „The Art of Deception" (Wiley 2002); Hadnagy, C.: „Social Engineering: The Science of Human Hacking" (2nd ed., Wiley 2018); Cialdini, R.B.: „Influence: The Psychology of Persuasion" (Harper Business 2006); FBI IC3 — Internet Crime Report ([www.ic3.gov](https://www.ic3.gov/Media/PDF/AnnualReport/2022_IC3Report.pdf)); [Verizon DBIR](https://www.verizon.com/business/resources/reports/dbir/).*
